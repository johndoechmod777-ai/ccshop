// Sistema de autenticación y saldo integrado
class SaldoManager {
    constructor() {
        this.saldoActual = 0;
        this.userId = null;
        this.usuario = null;
        this.inicializar();
    }

    async inicializar() {
        // Verificar autenticación
        await this.verificarAutenticacion();
        
        // Si hay usuario, cargar saldo
        if (this.userId) {
            await this.cargarSaldoEnTiempoReal();
            this.mostrarInfoUsuario();
        }
    }

    async verificarAutenticacion() {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.usuario = user;
                    this.userId = user.uid;
                    console.log('✅ Usuario autenticado:', user.email);
                    resolve(true);
                } else {
                    // Si no hay usuario, revisar localStorage (modo admin)
                    const storedUid = localStorage.getItem('uid');
                    if (storedUid === 'admin') {
                        this.userId = 'admin';
                        this.saldoActual = 999999;
                        this.mostrarInfoUsuario();
                        resolve(true);
                    } else {
                        console.log('❌ No hay usuario autenticado');
                        this.redirigirLogin();
                        resolve(false);
                    }
                }
            });
        });
    }

    async cargarSaldoEnTiempoReal() {
        if (this.userId === 'admin') {
            this.saldoActual = 999999;
            this.actualizarDisplaySaldo();
            return;
        }

        try {
            const saldoRef = firebase.database().ref('users/' + this.userId + '/saldo');
            
            // Escuchar cambios en tiempo real
            saldoRef.on('value', (snapshot) => {
                const saldo = snapshot.val();
                
                if (saldo !== null && saldo !== undefined) {
                    this.saldoActual = parseFloat(saldo);
                    console.log('💰 Saldo cargado:', this.saldoActual);
                } else {
                    // Si no existe saldo, crear uno inicial
                    this.crearSaldoInicial();
                    this.saldoActual = 50.00;
                }
                
                this.actualizarDisplaySaldo();
            }, (error) => {
                console.error('❌ Error cargando saldo:', error);
                this.saldoActual = 0;
                this.actualizarDisplaySaldo();
            });

        } catch (error) {
            console.error('❌ Error en cargarSaldoEnTiempoReal:', error);
            this.saldoActual = 0;
            this.actualizarDisplaySaldo();
        }
    }

    async crearSaldoInicial() {
        if (this.userId === 'admin') return;
        
        try {
            await firebase.database().ref('users/' + this.userId).update({
                saldo: 50.00,
                email: this.usuario?.email || 'N/A',
                nombre: this.usuario?.displayName || 'Usuario',
                fechaRegistro: Date.now()
            });
            console.log('✅ Saldo inicial creado: $50.00');
        } catch (error) {
            console.error('❌ Error creando saldo inicial:', error);
        }
    }

    actualizarDisplaySaldo() {
        // Actualizar todos los elementos de saldo en la página
        const elementosSaldo = document.querySelectorAll('#saldo, .saldo-display, #userSaldo');
        
        elementosSaldo.forEach(elemento => {
            if (elemento) {
                if (elemento.id === 'userSaldo') {
                    elemento.textContent = `💰 Saldo: $${this.saldoActual.toFixed(2)}`;
                } else {
                    elemento.textContent = this.saldoActual.toFixed(2);
                }
            }
        });

        // Actualizar localStorage
        localStorage.setItem('userSaldo', this.saldoActual);
        
        console.log('🔄 Display actualizado:', this.saldoActual);
    }

    mostrarInfoUsuario() {
        const userDisplay = document.querySelector('.user-display');
        const userName = document.getElementById('userName');
        
        if (this.userId === 'admin') {
            if (userDisplay) userDisplay.textContent = '👑 Administrador';
            if (userName) userName.textContent = '👑 Modo ADMIN';
            return;
        }

        const nombreMostrar = this.usuario?.displayName || this.usuario?.email || 'Usuario';
        
        if (userDisplay) {
            userDisplay.textContent = `👤 ${nombreMostrar}`;
        }
        if (userName) {
            userName.textContent = `👤 ${nombreMostrar}`;
        }
    }

    async descontarSaldo(cantidad) {
        if (this.userId === 'admin') {
            console.log('🔄 Modo admin - saldo ilimitado');
            return true;
        }

        try {
            cantidad = parseFloat(cantidad);
            
            if (this.saldoActual < cantidad) {
                throw new Error('Saldo insuficiente');
            }

            const nuevoSaldo = this.saldoActual - cantidad;
            
            await firebase.database().ref('users/' + this.userId + '/saldo').set(nuevoSaldo);
            
            console.log(`✅ Saldo descontado: $${cantidad}. Nuevo saldo: $${nuevoSaldo}`);
            return true;

        } catch (error) {
            console.error('❌ Error descontando saldo:', error);
            throw error;
        }
    }

    async agregarSaldo(cantidad) {
        if (this.userId === 'admin') {
            console.log('🔄 Modo admin - no necesita agregar saldo');
            return true;
        }

        try {
            cantidad = parseFloat(cantidad);
            const nuevoSaldo = this.saldoActual + cantidad;
            
            await firebase.database().ref('users/' + this.userId + '/saldo').set(nuevoSaldo);
            
            console.log(`✅ Saldo agregado: $${cantidad}. Nuevo saldo: $${nuevoSaldo}`);
            return true;

        } catch (error) {
            console.error('❌ Error agregando saldo:', error);
            throw error;
        }
    }

    async cerrarSesion() {
        try {
            await firebase.auth().signOut();
            localStorage.clear();
            this.redirigirLogin();
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
        }
    }

    redirigirLogin() {
        if (!window.location.pathname.includes('index.html') && 
            window.location.pathname !== '/' && 
            window.location.pathname !== '') {
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    }
}

// Inicializar el sistema globalmente
window.saldoManager = new SaldoManager();

// Función helper para mostrar saldo en botones
function mostrarSaldo() {
    if (window.saldoManager) {
        alert(`💰 Tu saldo actual es: $${window.saldoManager.saldoActual.toFixed(2)} USDT`);
    }
}

console.log('🚀 Sistema de saldo inicializado');
