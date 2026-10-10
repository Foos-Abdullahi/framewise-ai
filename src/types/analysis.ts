export type TimelineEvent = {
  timestamp: string;
  title: string;
  description: string;
};

export type VideoAnalysis = {
  id: string;
  title: string;
  summary: string;
  timeline: TimelineEvent[];
  entities: string[];
  insights: string[];
  searchResult: {
    answer: string;
    matches: { timestamp: string; seconds: number; description: string }[];
  } | null;
};

