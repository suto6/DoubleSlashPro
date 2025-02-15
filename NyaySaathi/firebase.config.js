// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbvaHTxO-jV3sC4FUPh5ibQ-QL18g-cXM",
    authDomain: "nyaysaathi-5b2cc.firebaseapp.com",
    projectId: "nyaysaathi-5b2cc",
    storageBucket: "nyaysaathi-5b2cc.firebasestorage.app",
    messagingSenderId: "410359455651",
    appId: "1:410359455651:web:1c2a48cbed9c54bc80c416"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);