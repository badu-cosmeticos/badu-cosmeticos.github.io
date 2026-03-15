// 1. CONFIGURACIÓN (Asegúrate de que este sea tu link de 'Publicar en la Web' como CSV)
const URL_GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_YJnlFQGrzz6_KRKAFftnLNijHcfo7Mcx3ikecmBhUsikd1Brl_G2QUufkVAwx2YZUmlh7ONI1hS2/pub?output=csv';
const contenedor = document.getElementById('contenedor-productos');

// 2. LÓGICA MODO OSCURO
const btnModoOscuro = document.getElementById('toggle-btn');
const body = document.body;

btnModoOscuro.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('modo', body.classList.contains('dark-mode') ? 'oscuro' : 'claro');
});

if (localStorage.getItem('modo') === 'oscuro') {
    body.classList.add('dark-mode');
}

// 3. CARGAR PRODUCTOS DESDE EL EXCEL
async function cargarProductos() {
    try {
        if (!contenedor) return;
        contenedor.innerHTML = '<p style="text-align:center;">Actualizando catálogo...</p>';

        const respuesta = await fetch(URL_GOOGLE_SHEET);
        const datos = await respuesta.text();
        const filas = datos.split('\n').slice(1); // Saltamos la fila de títulos

        contenedor.innerHTML = ''; // Limpiamos el mensaje de carga

        filas.forEach(fila => {
            // Esta línea separa por comas pero respeta si hay comas dentro de comillas
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            // Verificamos que existan las 6 columnas (A hasta F)
            if (columnas.length >= 6) {
                const nombre = columnas[0].replace(/"/g, '').trim();
                const precio = columnas[1].trim();
                const descripcion = columnas[2].replace(/"/g, '').trim();
                const imagen = columnas[3].trim();
                const stock = parseInt(columnas[5]) || 0; // Columna F

                // Configuración dinámica por stock
                let textoBoton = "Comprar por WhatsApp";
                let claseBoton = "";
                let claseCard = "";
                let badgeStock = `<span class="stock-badge disponible">✔ ${stock} disponibles</span>`;

                if (stock <= 0) {
                    textoBoton = "Agotado";
                    claseBoton = "agotado";
                    claseCard = "sin-stock";
                    badgeStock = `<span class="stock-badge agotado-badge">✘ Agotado</span>`;
                }

                // Link de WhatsApp personalizado
                const mensajeWA = encodeURIComponent(`Hola Badu! Me interesa comprar: ${nombre}`);
                const linkWA = `https://api.whatsapp.com/send?phone=584125182262&text=${mensajeWA}`;

                // Inyectar la tarjeta en el HTML
                contenedor.innerHTML += `
                    <div class="producto-card ${claseCard}">
                        <div class="contenedor-img">
                            <img src="${imagen}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/150'">
                        </div>
                        <div class="producto-info">
                            ${badgeStock}
                            <h3>${nombre}</h3>
                            <p class="descripcion-corta">${descripcion}</p>
                            <p class="precio">$${precio}</p>
                            <a href="${stock > 0 ? linkWA : '#'}" 
                               target="${stock > 0 ? '_blank' : '_self'}" 
                               class="btn-comprar ${claseBoton}">
                                ${textoBoton}
                            </a>
                        </div>
                    </div>
                `;
            }
        });
    } catch (e) {
        console.error("Error en la carga:", e);
        contenedor.innerHTML = '<p>No se pudo conectar con el inventario.</p>';
    }
}

// Arrancar la función
cargarProductos();