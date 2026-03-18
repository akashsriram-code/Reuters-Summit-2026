# Reuters Summit 2026 Dashboard

A collaborative Reuters-styled planning dashboard built with Next.js, Tailwind CSS, and Firebase Firestore. The app uses Firestore `onSnapshot` listeners for live public viewing, while editing is protected behind a shared password gate.

## Features

- Single-page dashboard with `Calendar` and `Guests` tabs
- Summit-only scheduling window for May 18-23, 2026
- Real-time Firestore sync for live public viewing
- Shared-password unlock flow for add, edit, and delete actions
- Protected Vercel API routes for all guest mutations
- Search, filter, sort, and guest summary counts
- Responsive layout for desktop and tablet use
- Graceful loading states and user-facing error messages

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Firebase Admin SDK
- date-fns
- Lucide React
- Vercel deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example env file and fill in both the Firebase client values and the new server-only auth/admin values:

```bash
cp .env.local.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Password Gate

- The dashboard remains publicly viewable.
- Editing is locked by default.
- To edit, users click `Unlock Editing` and enter the shared password you distribute offline.
- Successful unlock creates an HTTP-only session cookie that lasts until the browser closes or the user clicks `Lock Editing`.

## Required Environment Variables

Client Firebase config:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server auth config:

- `EDITOR_SHARED_PASSWORD`
- `EDITOR_SESSION_SECRET`

Firebase Admin SDK config:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Firebase Setup

1. Create a Firebase project.
2. Enable Firestore Database.
3. Create a web app in Firebase and copy the client config into `.env.local`.
4. Create or reuse a Firebase service account and copy its credentials into the Admin SDK env vars.
5. Add a composite Firestore index if Firebase prompts for one on the first query:
   collection `guests`, fields `date ASC`, `time ASC`, `name ASC`.

## Firestore Rules

Use the rules in `firestore.rules` so reads stay public and direct client writes are blocked:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

With these rules in place, only the protected Vercel API routes can mutate Firestore through the Firebase Admin SDK.

## Vercel Deployment

1. Push this repo to a Git provider connected to Vercel.
2. Create a new Vercel project and import the repository.
3. Add all `NEXT_PUBLIC_FIREBASE_*`, `EDITOR_*`, and `FIREBASE_ADMIN_*` environment variables in the Vercel project settings.
4. Deploy the root project with the default Next.js preset.
5. Share the root URL for public viewing, and share the editing password offline with authorized editors.

## Project Structure

- `app/page.tsx` - main SPA dashboard shell, session state, and unlock flow
- `app/api/auth/*` - password unlock, session status, and logout routes
- `app/api/guests/*` - protected mutation routes for create, update, and delete
- `app/components/UnlockModal.tsx` - shared-password modal
- `lib/guestService.ts` - Firestore live reads plus protected mutation client calls
- `lib/firebaseAdmin.ts` - Firebase Admin SDK bootstrap
- `lib/serverAuth.ts` - session token and password verification helpers

## Notes

- Guest dates remain restricted to May 18-23, 2026.
- Timestamps are written with server timestamps via the Admin SDK.
- If Firebase client env vars are missing, the UI will show a configuration warning.
- If server auth/admin env vars are missing, edit unlock and mutation routes will fail until configured.
