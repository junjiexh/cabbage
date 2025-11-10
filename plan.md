# Cabbage

Cabbage is a web application, built with react. Golang for backend.

Gemini api or other api to provide ai power.

## user operation flow

### User Settings & Goals (The "Input")

Purpose: To give the AI context about you.

Features:

- Set typical wake-up and sleep times.
- Define work/school hours (e.g., 9:00 AM - 5:00 PM).
- List long-term goals or recurring habits (e.g., "Exercise 3x a week," "Read for 30 minutes daily").
- A simple text input for "Today's Main Focus" that the user can fill out each morning.

### TODO list

Purpose: A classic task manager. These are the "blocks" the AI will schedule.

Features:

- Add, edit, and delete tasks.
- Mark tasks as complete.
- Assign priority (low, medium, high) or a due date.
- Tasks are stored in the database and are not tied to a single day until the AI schedules them.

### AI Planner & Schedule (The "Brain")

Purpose: The core AI feature. This component generates the daily plan.

Features:

A "Plan My Day" button.

- When clicked, the app gathers all inputs:
    - User Settings (wake/sleep times, work hours).
    - Today's Focus.
    - All incomplete tasks from the To-Do List.
- It sends this data to the Gemini API with a specific prompt (see Section 3).
- It receives a structured schedule back (e.g., a JSON array).
- Displays this schedule in a clean, step-by-step "timeline" view (e.g., "8:00 AM - 8:30 AM: Morning Review & Coffee").


### Progress Tracker (The "Dashboard")

Purpose: To visualize progress and provide motivation.

Features:

- A simple dashboard view.
- Shows a progress bar: (Completed To-Do Items) / (Total To-Do Items).
- The generated schedule items can also be "checked off" as the day goes on.
- A "Daily Summary" that shows what was accomplished.

## Technology Stack

frontend: react + shadcn + theme like claude
backend: spring + mysql