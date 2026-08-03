import { getAllContent } from "./source";

export function getAllTags() {
  return [...new Set(getAllContent().flatMap((entry) => entry.tags))].sort((a, b) => a.localeCompare(b));
}

export function getAllSeries() {
  return [...new Set(getAllContent().flatMap((entry) => entry.series ? [entry.series] : []))].sort((a, b) => a.localeCompare(b));
}

export function tagSlug(value: string) { return encodeURIComponent(value); }

export function contentYears() {
  return [...new Set(getAllContent().map((entry) => entry.date.getFullYear()))].sort((a, b) => b - a);
}
