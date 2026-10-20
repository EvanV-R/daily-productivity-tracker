# Product Requirements Document

## Purpose
A browser-only daily productivity tracker for students. A user records habits and sees a calculated score and weekly progress.

## User data
One entry per date, containing date, study hours, sleep hours, exercise minutes, recreational screen hours, and calculated score. Stored in a JavaScript array and persisted in browser localStorage. A new submission for an existing date replaces it.

## Actions
- Save form: validate, calculate score, replace/add entry, persist and redraw.
- Sort dropdown: reorder history by newest, oldest, or highest score.
- Delete: remove one entry and redraw totals.
- Reset all: confirm, clear saved entries, redraw without reloading.

## Formula
Study up to 40 points at 4 hours; sleep up to 25 points, best at 8 hours; exercise up to 25 at 30 minutes; recreational screen time up to 10 points at 2 hours or less. Round total to nearest integer. Motivational, not scientifically validated.

## Page states
- Empty: summary dashes, blank chart, prompt to add a day.
- Invalid: inline error text; no entry saved.
- In use: summary, 7-day chart, and sortable entries.
- Reset: returns to empty state.

## Constraints
Semantic HTML, responsive CSS, vanilla JavaScript, no frameworks/CDNs/APIs/server. Data persists on the same browser only.
