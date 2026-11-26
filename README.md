# FormBoard

**Turn Google Form responses into a task board.**

FormBoard is a web platform for teachers and form owners who collect quizzes, surveys, exams and other submissions through Google Forms. Google’s built-in response view is basic and treats every form the same. FormBoard signs in with Google, lists the owner’s forms, and shows each form’s responses in a task-management layout (cards, tables and charts) that the owner can customize per form.

## Objectives
- **Centralize forms:** after signing in, the owner sees all of their Google Forms in one dashboard, with no copying links or exporting files.
- **Make responses easy to work with:** display answers as a Kanban board, a sortable table, or an insights dashboard instead of a flat list.
- **Adapt to any form:** quizzes, surveys and exams have different questions, so owners choose the card title, visible fields and grouping, and the layout is saved for each form.
- **Support a review workflow:** move responses through stages such as *To review*, *Graded* and *Needs follow-up*, add scores and write feedback notes.
- **Protect respondent data:** answers stay in Google and are fetched live. Only the owner’s own layer (status, score, notes, layout) is stored in Firestore.
- **Stay low-cost:** built to run on Firebase’s free Spark plan.

## Features
- Google sign-in (Firebase Auth) with a “My forms” dashboard (search and filter by type)
- Board view with drag-and-drop status columns
- Table view and an Insights tab (response count, percent graded, average score, breakdown charts)
- Per-form customization panel (card title, fields shown, group by)
- Response detail panel with status, score and feedback notes
- Sync button to pull in new responses
- Light and dark mode

## Who it is for
Teachers, trainers, school administrators, and anyone who reviews or grades submissions collected through Google Forms.

## Tech stack
Vue 3 and Vite for the frontend, Firebase Authentication and Hosting, Cloud Firestore for the review data, and the Google Forms, Drive and Picker APIs for form data.

## Status
The UI runs on dummy data. The Firebase and Google API layer (`src/services/`) is included but not yet wired into the main screens.

## Run
    npm install
    npm run dev      # http://localhost:5173

## Structure
- `src/data.js`     dummy forms and responses (swap for Drive / Forms API results)
- `src/store.js`    shared reactive state and actions (swap for Pinia + Firestore if you like)
- `src/components/` Login, FormsList, FormView (Board / Table / Insights), CustomizePanel, DetailPanel

## Where Firebase plugs in later
- Login.vue: replace the button handler with `signInWithPopup` (Google provider + Forms/Drive scopes)
- FormsList.vue: load forms from the Drive API instead of `state.forms`
- store.js `moveResponse`, DetailPanel `save`, CustomizePanel layout: write status, notes, score and layout to Firestore

## Firebase setup (added)
1. Copy `.env.example` to `.env` and fill it in (Firebase web app config, Google API key, Google Cloud project number).
2. In Google Cloud, enable the Google Picker API, Google Forms API and Google Drive API.
3. Publish the rules: `firebase deploy --only firestore:rules` (or paste `firestore.rules` into Console > Firestore > Rules).
4. `npm run dev`. A "Firebase setup (dev)" panel appears bottom-left once `.env` exists:
   Sign in, Create collections (writes sample docs so `users`, `forms` and `forms/*/reviews` appear), Add form (Picker).
5. Delete `FirebaseSetup.vue` and the `sample-form` doc when you wire the real screens.
Firestore has no "create collection" call: a collection exists once its first document is written.