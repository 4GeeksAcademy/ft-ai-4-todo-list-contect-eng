# Architecture

## Table of Contents
1. Project overview
2. Frontend structure
3. Todo domain model
4. Data persistence
5. Interaction flow
6. Maintenance rules

## Project overview
This todo application is a lightweight task manager focused on reliability, clarity, and fast iteration. The initial version is intentionally simple so the project can be extended without introducing unnecessary complexity.

## Frontend structure
The app uses a small static frontend with a single HTML entry point, a stylesheet, and a JavaScript controller. The working implementation currently supports a task form, task list rendering, filtering, completion toggles, deletion, task editing, priority assignment, reminder scheduling, and browser persistence.

## Todo domain model
Each task contains an id, text, completion state, priority, reminder timestamp, and created timestamp. These fields make the app useful for everyday planning while remaining simple enough for a static front-end implementation.

## Data persistence
The application stores tasks in the browser using localStorage. This provides persistence across page refreshes without requiring a backend or external service.

## Interaction flow
User actions trigger updates in the in-browser task list, which are then saved to localStorage and re-rendered. The app also sorts task cards by priority and reminder urgency so higher-value work appears first.

## Supporting files
- [index.html](../index.html) — app shell and UI structure
- [styles.css](../styles.css) — core presentation and layout styling
- [app.js](../app.js) — task logic, rendering, filters, sorting, editing, priority, reminders, and persistence
- [memory-bank/progress.md](progress.md) — implementation and maintenance history

## Maintenance rules
When the implementation or app architecture changes, update this file with a brief explanation of the change and note where the supporting detail lives. This document serves as the index for the current system design.
