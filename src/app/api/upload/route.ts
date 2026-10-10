import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createUploadSession, ownsUpload, UPLOAD_COOKIE } from "@/lib/upload-session";
import { MAX_VIDEO_BYTES, supportedVideoTypes } from "@/lib/validation";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ enabled: false, hosted: !!process.env.VERCEL }, { headers: { "Cache-Control": "no-store" } });
  const session = createUploadSession();
  return Response.json({ enabled: true, prefix: `videos/${session.id}` }, { headers: {
    "Cache-Control": "no-store",
    "Set-Cookie": `${UPLOAD_COOKIE}=${session.cookie}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=1800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  } });
}
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "Video uploads require a connected private Vercel Blob store." }, { status: 503 });
  try {
    const body = await request.json() as HandleUploadBody;
    const response = await handleUpload({ request, body,
      onBeforeGenerateToken: async (pathname) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) throw new Error("Invalid upload origin.");
        if (!ownsUpload(request, pathname)) throw new Error("Upload session expired. Please retry.");
        return { allowedContentTypes: [...supportedVideoTypes], maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 10 * 60 * 1000 };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(response);
  } catch {
    return Response.json({ error: "Could not authorize upload. Refresh the page and retry." }, { status: 400 });
  }
}
