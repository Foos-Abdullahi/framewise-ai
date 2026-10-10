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
};
