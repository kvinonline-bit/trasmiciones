const canvasPreview = document.getElementById('canvasPreview');
const ctxPreview = canvasPreview.getContext('2d');

const canvasLive = document.getElementById('canvasLive');
const ctxLive = canvasLive.getContext('2d');

const videoOculto = document.getElementById('videoOculto');

// Estados independientes
let escenaPreview = 'camara_limpia';
let escenaLive = 'camara_limpia';

// Precargar los banners PNG
const banner1 = new Image();
banner1.src = 'banner1.png';

const banner2 = new Image();
banner2.src = 'banner2.png';

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
            renderizarLoop();
        };
    } catch (error) {
        console.error("Error en la cámara: ", error);
    }
}

// Cambia solo lo que estás preparando (Preview)
function cambiarPreview(nuevaEscena) {
    escenaPreview = nuevaEscena;
}

// Acción del botón Maestro: Pasa el Preview al Live
function pasarAEnVivo() {
    escenaLive = escenaPreview;
}

// Loop único que dibuja en ambas pantallas a la vez
function renderizarLoop() {
    // ---- 1. RENDERIZAR MONITOR PREVIEW ----
    ctxPreview.drawImage(videoOculto, 0, 0, canvasPreview.width, canvasPreview.height);
    if (escenaPreview === 'camara_banner_1') {
        ctxPreview.drawImage(banner1, 50, canvasPreview.height - 180, 1180, 130);
    } else if (escenaPreview === 'camara_banner_2') {
        ctxPreview.drawImage(banner2, 50, canvasPreview.height - 180, 1180, 130);
    }

    // ---- 2. RENDERIZAR MONITOR LIVE ----
    ctxLive.drawImage(videoOculto, 0, 0, canvasLive.width, canvasLive.height);
    if (escenaLive === 'camara_banner_1') {
        ctxLive.drawImage(banner1, 50, canvasLive.height - 180, 1180, 130);
    } else if (escenaLive === 'camara_banner_2') {
        ctxLive.drawImage(banner2, 50, canvasLive.height - 180, 1180, 130);
    }

    requestAnimationFrame(renderizarLoop);
}

window.onload = iniciarCamara;