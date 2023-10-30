import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDxiCru6UTCbD3zu2btG1jPZPIM2ay_WgQ",
    authDomain: "whatsclone-b9e60.firebaseapp.com",
    projectId: "whatsclone-b9e60",
    storageBucket: "whatsclone-b9e60.appspot.com",
    messagingSenderId: "191828497112",
    appId: "1:191828497112:web:3d648abc6d3e2fe507bdad",
    measurementId: "G-3P00CJW22B"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);