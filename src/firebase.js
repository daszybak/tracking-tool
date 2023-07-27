import { initializeApp, getApps, getApp, FirebaseError } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSENGER_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

let app;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  try {
    app = getApp();
  } catch (err) {
    if (err instanceof FirebaseError && err.code === "app/no-app") {
      app = initializeApp(firebaseConfig); 
    }
  }
}

export default app;
