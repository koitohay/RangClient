import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAn0LlQHl-1GB2VzOTU-8MJgpgdlRA6A38",
    authDomain: "testproject-ac512.firebaseapp.com",
    databaseURL: "https://testproject-ac512-default-rtdb.europe-west1.firebasedatabase.app"
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();