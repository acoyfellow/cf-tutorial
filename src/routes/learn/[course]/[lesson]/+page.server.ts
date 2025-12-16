import {
  getLesson,
  getNextLesson,
  getPreviousLesson,
} from "$lib/lessons";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const lesson = getLesson(params.course, params.lesson);

  if (!lesson) {
    throw error(404, "Lesson not found");
  }

  const nextLesson = getNextLesson(lesson.course, lesson.order);
  const previousLesson = getPreviousLesson(lesson.course, lesson.order);

  return {
    lesson,
    nextLesson,
    previousLesson,
  };
}
