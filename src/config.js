import Firebase from 'firebase';
let config = {
    apiKey: "AIzaSyCnm0b7fA5hwNQ4RhBi-EcEVUBiQHwXgRg",
    authDomain: "stevekings-7dee6.firebaseapp.com",
    databaseURL: "https://stevekings-7dee6.firebaseio.com",
    projectId: "stevekings-7dee6",
    storageBucket: "stevekings-7dee6.appspot.com",
    messagingSenderId: "455751793944"
};
let app = Firebase.initializeApp(config);
export const db = app.database();
export const auth = app.auth();
export const serverTime = Firebase.database.ServerValue.TIMESTAMP;