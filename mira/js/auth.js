// Sistema de autenticación
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        // Verificar si ya está logueado
        auth.onAuthStateChanged((user) => {
            if (user) {
                window.location.href = 'tienda.html';
            }
        });

        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.mostrarNotificacion('✅ Login exitoso', 'success');
        } catch (error) {
            this.mostrarNotificacion('❌ ' + this.getErrorMessage(error.code), 'error');
        }
    }

    async register() {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regPasswordConfirm').value;

        if (password !== confirmPassword) {
            this.mostrarNotificacion('❌ Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 6) {
            this.mostrarNotificacion('❌ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Crear perfil con saldo inicial
            await db.ref('users/' + userCredential.user.uid).set({
                email: email,
                saldo: 50.00,
                fechaRegistro: Date.now()
            });

            this.mostrarNotificacion('✅ ¡Cuenta creada! $50 de regalo', 'success');
            cerrarRegistro();
        } catch (error) {
            this.mostrarNotificacion('❌ ' + this.getErrorMessage(error.code), 'error');
        }
    }

    getErrorMessage(errorCode) {
        const messages = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/weak-password': 'La contraseña es muy débil',
            'auth/invalid-email': 'Email inválido'
        };
        return messages[errorCode] || 'Error desconocido';
    }

    mostrarNotificacion(mensaje, tipo) {
        const notif = document.createElement('div');
        notif.className = `notificacion ${tipo}`;
        notif.textContent = mensaje;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

function mostrarRegistro() {
    document.getElementById('registerModal').style.display = 'block';
}

function cerrarRegistro() {
    document.getElementById('registerModal').style.display = 'none';
}

const authManager = new AuthManager();
