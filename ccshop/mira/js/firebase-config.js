// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD2tvQjJzh7ukTSyxzIQSo7GSpz7L8z11I",
    authDomain: "ccshop-realtime.firebaseapp.com",
    databaseURL: "https://ccshop-realtime-default-rtdb.firebaseio.com",
    projectId: "ccshop-realtime",
    storageBucket: "ccshop-realtime.firebasestorage.app",
    messagingSenderId: "795626673305",
    appId: "1:795626673305:web:094dc265de1d4d1bc7d408"
};

// Inicializar Firebase si no está inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Referencias globales
window.db = firebase.firestore(); // Para las tarjetas
window.rtdb = firebase.database(); // Para el saldo
window.auth = firebase.auth();

console.log('🔥 Firebase configurado correctamente');
