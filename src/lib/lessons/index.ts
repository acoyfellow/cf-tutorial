import { helloWorld } from "./workers-101/hello-world";
import { requestBasics } from "./workers-101/request-basics";
import { routing } from "./workers-101/routing";
import { jsonApi } from "./workers-101/json-api";
import { queryParams } from "./workers-101/query-params";
import { fetchApi } from "./workers-101/fetch-api";
import { errorHandling } from "./workers-101/error-handling";
import type { Lesson } from "./types";

const lessons: Record<string, Lesson> = {
  "workers-101/hello-world": helloWorld,
  "workers-101/request-basics": requestBasics,
  "workers-101/routing": routing,
  "workers-101/json-api": jsonApi,
  "workers-101/query-params": queryParams,
  "workers-101/fetch-api": fetchApi,
  "workers-101/error-handling": errorHandling,
};

export function getLesson(course: string, lesson: string): Lesson | null {
  const key = `${course}/${lesson}`;
  return lessons[key] || null;
}

export function getAllLessons(): Lesson[] {
  return Object.values(lessons);
}

export function getLessonsByCourse(course: string): Lesson[] {
  return getAllLessons()
    .filter((l) => l.course === course)
    .sort((a, b) => a.order - b.order);
}

export function getNextLesson(
  course: string,
  currentOrder: number
): Lesson | null {
  const courseLessons = getLessonsByCourse(course);
  return courseLessons.find((l) => l.order > currentOrder) || null;
}

export function getPreviousLesson(
  course: string,
  currentOrder: number
): Lesson | null {
  const courseLessons = getLessonsByCourse(course);
  const previousLessons = courseLessons.filter((l) => l.order < currentOrder);
  return previousLessons.length > 0
    ? previousLessons[previousLessons.length - 1]
    : null;
}
