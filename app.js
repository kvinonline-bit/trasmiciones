// 1. Captura de elementos del HTML según la imagen
const canvasPreview = document.getElementById('canvasPreview');
const canvasLive = document.getElementById('canvasLive');
const ctxPreview = canvasPreview.getContext('2d');
const ctxLive = canvasLive.getContext('2d');
const videoOculto = document.getElementById('videoOculto');

// 2. Variables de estado del switcher
let escenaPreview = 'camara_limpia'; // Lo que se está preparando
let escenaLive = 'camara_limpia';    // Lo que está saliendo al aire

// Objetos para almacenar las imágenes de los banners cargados
let banner1 = null;
let banner2 = null;

// 3. Inicializar la cámara trasera del celular
async function iniciarCamara() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: "environment", 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        videoOculto.srcObject = stream;
        videoOculto.onloadedmetadata = () => {
            // Arranca el bucle de renderizado en paralelo para ambos monitores
            procesarMaster();
        };
    } catch (error) {
        console.error("Error al acceder a la cámara: ", error);
        alert("Camara no disponible o faltan permisos.");
    }
}

// 4. Función para cargar los banners dinámicamente desde los inputs de la imagen
function cargarBanner(event, numeroBanner) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            if (numeroBanner === 1) {
                banner1 = img;
            } else if (numeroBanner === 2) {
                banner2 = img;
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 5. Botones de escena (Cambian solo el PREVIEW verde)
function cambiarPreview(nuevaEscena) {
    escenaPreview = nuevaEscena;
}

// 6. Botón GIGANTE AMARILLO (El corte "LIVE" que pasa Preview a Program)
function pasarAEnVivo() {
    escenaLive = escenaPreview;
}

// 7. El motor gráfico de la aplicación (Dibuja en ambos canvas al mismo tiempo)
function procesarMaster() {
    // ---- MONITOR 1: PREVIEW (PREPARANDO) ----
    // Dibuja la cámara de fondo
    ctxPreview.drawImage(videoOculto, 0, 0, canvasPreview.width, canvasPreview.height);
    // Superpone el banner que estés preparando
    renderizarBannersEnCanvas(ctxPreview, canvasPreview, escenaPreview);

    // ---- MONITOR 2: PROGRAM (EN VIVO) ----
    // Dibuja la cámara de fondo
    ctxLive.drawImage(videoOculto, 0, 0, canvasLive.width, canvasLive.height);
    // Superpone el banner que ya esté al aire
    renderizarBannersEnCanvas(ctxLive, canvasLive, escenaLive);

    // Repetir el loop en el siguiente cuadro
    requestAnimationFrame(procesarMaster);
}

// 8. Pintor de capas (Dibuja los PNGs si existen en la escena correspondiente)
function renderizarBannersEnCanvas(contexto, canvasDestino, escena) {
    // Si la escena requiere el Banner 1 y ya se seleccionó un archivo
    if (escena === 'camara_banner_1' && banner1) {
        // Ajusta las coordenadas (X, Y, Ancho, Alto) según el diseño de tu banner
        contexto.drawImage(banner1, 0, 0, canvasDestino.width, canvasDestino.height);
    } 
    // Si la escena requiere el Banner 2 y ya se seleccionó un archivo
    else if (escena === 'camara_banner_2' && banner2) {
        contexto.drawImage(banner2, 0, 0, canvasDestino.width, canvasDestino.height);
    }
    // Puedes mapear aquí 'camara_banner_3' o 'camara_banner_4' para logos o textos flotantes
}

// Arrancar de inmediato al abrir la aplicación
window.onload = iniciarCamara;