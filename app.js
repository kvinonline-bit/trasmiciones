const canvasPreview = document.getElementById('canvasPreview');
const ctxPreview = canvasPreview.getContext('2d');

const canvasLive = document.getElementById('canvasLive');
const ctxLive = canvasLive.getContext('2d');

const videoOculto = document.getElementById('videoOculto');

// Estados independientes de escena
let escenaPreview = 'camara_limpia';
let escenaLive = 'camara_limpia';

// Variables para guardar las imágenes que el usuario "suba" desde el dispositivo
let banner1 = null;
let banner2 = null;

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

// ESTA FUNCIÓN LEE EL ARCHIVO DEL CELULAR O PC (Como OBS)
function cargarBanner(event, numeroBanner) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    
    // Cuando el dispositivo termine de leer el archivo...
    reader.onload = function(e) {
        const nuevaImagen = new Image();
        nuevaImagen.src = e.target.result; // Convierte el archivo en una ruta temporal (Base64)
        
        nuevaImagen.onload = function() {
            if (numeroBanner === 1) {
                banner1 = nuevaImagen;
            } else if (numeroBanner === 2) {
                banner2 = nuevaImagen;
            }
            alert(`Banner ${numeroBanner} cargado con éxito en memoria`);
        };
    };
    
    reader.readAsDataURL(archivo);
}

function cambiarPreview(nuevaEscena) {
    escenaPreview = nuevaEscena;
}

function pasarAEnVivo() {
    escenaLive = escenaPreview;
}

function renderizarLoop() {
    // ---- 1. MONITOR PREVIEW ----
    ctxPreview.drawImage(videoOculto, 0, 0, canvasPreview.width, canvasPreview.height);
    if (escenaPreview === 'camara_banner_1' && banner1) {
        dibujarBannerAdaptado(ctxPreview, canvasPreview, banner1);
    } else if (escenaPreview === 'camara_banner_2' && banner2) {
        dibujarBannerAdaptado(ctxPreview, canvasPreview, banner2);
    }

    // ---- 2. MONITOR LIVE ----
    ctxLive.drawImage(videoOculto, 0, 0, canvasLive.width, canvasLive.height);
    if (escenaLive === 'camara_banner_1' && banner1) {
        dibujarBannerAdaptado(ctxLive, canvasLive, banner1);
    } else if (escenaLive === 'camara_banner_2' && banner2) {
        dibujarBannerAdaptado(ctxLive, canvasLive, banner2);
    }

    requestAnimationFrame(renderizarLoop);
}

// NUEVA FUNCIÓN MAESTRA: Saca el cálculo de escala para que no se deforme
function dibujarBannerAdaptado(contexto, canvasActual, imagenBanner) {
    // 1. Queremos que el banner ocupe exactamente todo el ancho del lienzo (1280 px)
    const anchoDeseado = canvasActual.width;
    
    // 2. Calculamos la altura proporcional (Regla de 3 basada en la imagen original)
    const escala = anchoDeseado / imagenBanner.width;
    const alturaProporcional = imagenBanner.height * escala;
    
    // 3. Lo posicionamos al ras de la parte inferior (Y = Altura total - Altura del banner)
    const x = 0;
    const y = canvasActual.height - alturaProporcional;
    
    // 4. Pintamos la imagen perfecta
    contexto.drawImage(imagenBanner, x, y, anchoDeseado, alturaProporcional);
}

window.onload = iniciarCamara;