import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FB_READY = !!(config.apiKey && config.databaseURL);

let db = null;

if (FB_READY) {
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  db = getDatabase(app);
}

export { db, ref, onValue, set, get };
