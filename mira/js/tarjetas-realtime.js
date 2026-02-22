// Sistema de tarjetas en tiempo real
class TarjetasRealtime {
    constructor(pais) {
        this.pais = pais;
        this.contenedor = document.getElementById('tarjetas-container');
        this.init();
    }

    init() {
        this.escucharCambios();
    }

    escucharCambios() {
        const tarjetasRef = db.ref('tarjetas/' + this.pais);
        
        // Nueva tarjeta
        tarjetasRef.on('child_added', (snapshot) => {
            this.agregarTarjetaUI(snapshot.key, snapshot.val());
        });

        // Tarjeta actualizada
        tarjetasRef.on('child_changed', (snapshot) => {
            this.actualizarTarjetaUI(snapshot.key, snapshot.val());
        });

        // Tarjeta eliminada
        tarjetasRef.on('child_removed', (snapshot) => {
            this.eliminarTarjetaUI(snapshot.key);
        });
    }

    agregarTarjetaUI(id, data) {
        if (!this.contenedor) return;
        
        const div = document.createElement('div');
        div.innerHTML = this.crearTarjetaHTML(id, data);
        this.contenedor.appendChild(div.firstElementChild);
    }

    actualizarTarjetaUI(id, data) {
        const tarjeta = document.querySelector(`[data-id="${id}"]`);
        if (tarjeta) {
            const nuevaTarjeta = document.createElement('div');
            nuevaTarjeta.innerHTML = this.crearTarjetaHTML(id, data);
            tarjeta.replaceWith(nuevaTarjeta.firstElementChild);
        }
    }

    eliminarTarjetaUI(id) {
        const tarjeta = document.querySelector(`[data-id="${id}"]`);
        if (tarjeta) {
            tarjeta.remove();
        }
    }

    crearTarjetaHTML(id, data) {
        const vendida = data.estado === 'vendida';
        const tipo = data.tipo || 'visa';
        
        return `
            <div class="tarjeta ${vendida ? 'vendida' : ''}" data-id="${id}">
                <div class="tarjeta-header">
                    <img src="../mira/img/${tipo}.png" alt="${tipo}" class="logo-banco">
                    <span class="estado-badge ${data.estado}">
                        ${vendida ? '🔴 VENDIDA' : '🟢 DISPONIBLE'}
                    </span>
                </div>
                
                <div class="tarjeta-info">
                    <div class="numero-tarjeta">${data.numero}</div>
                    <div class="detalles">
                        <div class="detalle">
                            <span class="label">CVV</span>
                            <span class="valor">${vendida ? '•••' : data.cvv}</span>
                        </div>
                        <div class="detalle">
                            <span class="label">EXP</span>
                            <span class="valor">${data.exp}</span>
                        </div>
                    </div>
                </div>

                <div class="tarjeta-footer">
                    <div class="precio">$${data.precio.toFixed(2)}</div>
                    ${!vendida ? `
                        <button class="btn-comprar" onclick="comprarTarjeta('${id}', ${data.precio})">
                            💳 Comprar
                        </button>
                    ` : `
                        <div class="vendida-info">VENDIDA</div>
                    `}
                </div>
            </div>
        `;
    }
}

// Función para comprar tarjeta
async function comprarTarjeta(tarjetaId, precio) {
    try {
        if (saldoManager.saldoActual < precio) {
            mostrarNotificacion('❌ Saldo insuficiente', 'error');
            return;
        }

        const confirmar = confirm(`¿Comprar esta tarjeta por $${precio.toFixed(2)}?`);
        if (!confirmar) return;

        const pais = obtenerPaisActual();
        const tarjetaRef = db.ref('tarjetas/' + pais + '/' + tarjetaId);
        
        // Verificar disponibilidad
        const snapshot = await tarjetaRef.once('value');
        const tarjeta = snapshot.val();
        
        if (!tarjeta || tarjeta.estado === 'vendida') {
            mostrarNotificacion('❌ Esta tarjeta ya fue vendida', 'error');
            return;
        }

        // Marcar como vendida
        await tarjetaRef.update({
            estado: 'vendida',
            compradoPor: saldoManager.userId,
            fechaVenta: Date.now()
        });

        // Descontar saldo
        await saldoManager.descontarSaldo(precio);

        // Guardar compra
        await db.ref('users/' + saldoManager.userId + '/compras').push({
            tarjetaId: tarjetaId,
            pais: pais,
            numero: tarjeta.numero,
            cvv: tarjeta.cvv,
            exp: tarjeta.exp,
            precio: precio,
            fecha: Date.now()
        });

        mostrarNotificacion('✅ ¡Compra exitosa!', 'success');
        mostrarDetallesTarjeta(tarjeta);

    } catch (error) {
        mostrarNotificacion('❌ Error: ' + error.message, 'error');
    }
}

function obtenerPaisActual() {
    const path = window.location.pathname;
    const match = path.match(/países\/(.+)\.html/);
    return match ? match[1] : 'ecuador';
}

function mostrarNotificacion(mensaje, tipo) {
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

function mostrarDetallesTarjeta(tarjeta) {
    alert(`¡TARJETA COMPRADA!\n\nNúmero: ${tarjeta.numero}\nCVV: ${tarjeta.cvv}\nExp: ${tarjeta.exp}`);
}
