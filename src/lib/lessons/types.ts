export type Test = {
  name: string;
  request: { method?: string; path: string; body?: string };
  expect: { status?: number; bodyContains?: string; bodyEquals?: string };
};

export type LessonBlock =
  | { type: "text"; content: string }
  | {
    type: "code";
    id: string;
    label?: string;
    initial: string;
    solution: string;
    tests: Test[];
  }
  | { type: "checkpoint"; requires: string[] };

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  course: string;
  order: number;
  blocks: LessonBlock[];
};
