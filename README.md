# FormBoard (Vue 3 UI prototype)

UI-only prototype with dummy data. No Firebase or Google API calls yet.

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
