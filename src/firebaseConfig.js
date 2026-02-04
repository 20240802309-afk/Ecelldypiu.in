import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, CustomProvider, getToken } from "firebase/app-check";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// Custom App Check Provider for Visual ReCAPTCHA
let appCheck;
let globalCaptchaToken = null;

export const setCaptchaTokenForAppCheck = (token) => {
    globalCaptchaToken = token;
};

if (typeof window !== "undefined") {
    const customProvider = new CustomProvider({
        getToken: () => {
            if (globalCaptchaToken) {
                return Promise.resolve({
                    token: globalCaptchaToken,
                    expireTimeMillis: Date.now() + 60 * 60 * 1000, // 1 hour
                });
            } else {
                // If no token yet, return a dummy promise or fail gracefully
                // This prevents the initial page load error
                return Promise.resolve({
                    token: 'dummy-token-wait-for-user',
                    expireTimeMillis: Date.now() + 1000
                });
            }
        }
    });

    appCheck = initializeAppCheck(app, {
        provider: customProvider,
        isTokenAutoRefreshEnabled: false
    });
}

export { appCheck };
export const db = getFirestore(app);
