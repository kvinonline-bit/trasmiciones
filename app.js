const canvasPreview = document.getElementById('canvasPreview');
const canvasLive = document.getElementById('canvasLive');
const ctxPreview = canvasPreview.getContext('2d');
const ctxLive = canvasLive.getContext('2d');

// Elementos de Video Ocultos para el Hardware
const videoOculto = document.getElementById('videoOculto'); // Cámara celular
const videoUSB = document.createElement('video');           // Cámara USB / Capturadora
videoUSB.autoplay = true; videoUSB.playsInline = true; videoUSB.muted = true;

// Diccionario dinámico para almacenar flujos remotos de VDO.ninja por Escena
let videosNinjaPorEscena = {};

// Estado de la Consola
let escenaPreview = 'camara_limpia';
let escenaLive = 'camara_limpia';
let transmitiendo = false;

// --- ESTRUCTURA DE CONFIGURACIÓN POR ESCENA ---
// Cada escena arranca por defecto con la cámara local y sin banner
let configuracionEscenas = {
    'camara_limpia': { tipoVideo: 'local', idNinja: '', banner: null },
    'escena_2':      { tipoVideo: 'local', idNinja: '', banner: null },
    'escena_3':      { tipoVideo: 'local', idNinja: '', banner: null },
    'escena_4':      { tipoVideo: 'local', idNinja: '', banner: null },
    'escena_5':      { tipoVideo: 'local', idNinja: '', banner: null }
};

// Inicializar Hardware del Celular (Cámara Interna y USB si existe)
async function iniciarCamara() {
    try {
        const streamLocal = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
        });
        videoOculto.srcObject = streamLocal;

        // Detectar si hay cámara USB conectada por OTG
        const dispositivos = await navigator.mediaDevices.enumerateDevices();
        const camarasVideo = dispositivos.filter(d => d.kind === 'videoinput');
        if (camarasVideo.length > 1) {
            const streamUSB = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: camarasVideo[1].deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            videoUSB.srcObject = streamUSB;
            console.log("Hardware USB listo.");
        }

        videoOculto.onloadedmetadata = () => { procesarMaster(); };
    } catch (error) {
        console.error("Error de inicialización de hardware:", error);
    }
}

// 1. CUANDO CAMBIAS DE ESCENA: Sincroniza los controles de arriba con la memoria de la escena
function cambiarPreview(nuevaEscena) {
    escenaPreview = nuevaEscena;
    
    // Resaltar botón seleccionado abajo en la botonera
    Object.keys(configuracionEscenas).forEach(key => {
        const btn = document.getElementById(`btn-${key}`);
        if (btn) btn.style.borderLeft = (key === nuevaEscena) ? "3px solid #28a745" : "none";
    });

    const config = configuracionEscenas[escenaPreview];
    
    // Actualizar los selectores visuales con lo que esta escena tiene guardado
    document.getElementById('selectCamara').value = config.tipoVideo;
    document.getElementById('inputNinjaID').value = config.idNinja;
    document.getElementById('uploadBanner').value = ""; // Limpia el visor del archivo
}

// 2. ASIGNAR BANNER A LA ESCENA ACTUAL
function asignarBanner(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            configuracionEscenas[escenaPreview].banner = img;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 3. ASIGNAR HARDWARE (Celular o USB) A LA ESCENA ACTUAL
function asignarCamaraHardware(tipo) {
    configuracionEscenas[escenaPreview].tipoVideo = tipo;
}

// 4. ASIGNAR ENLACE DE VDO.NINJA A LA ESCENA ACTUAL
function asignarVdoNinja() {
    const idNinja = document.getElementById('inputNinjaID').value.trim();
    if (idNinja === "") {
        alert("Introduce un ID válido de VDO.ninja");
        return;
    }

    // Guardar el ID en la configuración de la escena activa
    configuracionEscenas[escenaPreview].tipoVideo = 'ninja';
    configuracionEscenas[escenaPreview].idNinja = idNinja;

    // Si no hemos creado el elemento de video para este ID de escena, lo creamos en caliente
    if (!videosNinjaPorEscena[escenaPreview]) {
        const vid = document.createElement('video');
        vid.autoplay = true; vid.playsInline = true; vid.muted = true;
        videosNinjaPorEscena[escenaPreview] = vid;
    }

    // Vincular flujo WebRTC de baja latencia usando la API de VDO.ninja
    videosNinjaPorEscena[escenaPreview].src = `https://vdo.ninja/?view=${idNinja}&autoplay&muted`;
    console.log(`Escena ${escenaPreview} emparejada con VDO.ninja ID: ${idNinja}`);
}

function pasarAEnVivo() {
    escenaLive = escenaPreview;
}

function conmutarTransmision() {
    transmitiendo = !transmitiendo;
    const btn = document.getElementById('btnIniciarStream');
    if (transmitiendo) {
        btn.classList.add('transmitiendo-animacion');
        document.getElementById('textoStream').innerText = "DETENER TRANSMISIÓN";
    } else {
        btn.classList.remove('transmitiendo-animacion');
        document.getElementById('textoStream').innerText = "INICIAR EN VIVO";
    }
}

// --- MOTOR DE PROCESAMIENTO MÁSTER ---
function obtenerVideoDeEscena(nombreEscena) {
    const config = configuracionEscenas[nombreEscena];
    if (!config) return null;

    if (config.tipoVideo === 'local') return videoOculto;
    if (config.tipoVideo === 'usb') return videoUSB;
    if (config.tipoVideo === 'ninja') return videosNinjaPorEscena[nombreEscena] || null;
    return null;
}

function procesarMaster() {
    // ---- RENDER PREVIEW ----
    const videoP = obtenerVideoDeEscena(escenaPreview);
    const configP = configuracionEscenas[escenaPreview];
    
    if (videoP && videoP.readyState >= 2) {
        ctxPreview.drawImage(videoP, 0, 0, canvasPreview.width, canvasPreview.height);
    } else {
        ctxPreview.fillStyle = "#000000";
        ctxPreview.fillRect(0, 0, canvasPreview.width, canvasPreview.height);
    }
    if (configP && configP.banner) {
        ctxPreview.drawImage(configP.banner, 0, 0, canvasPreview.width, canvasPreview.height);
    }

    // ---- RENDER PROGRAM (LIVE) ----
    const videoL = obtenerVideoDeEscena(escenaLive);
    const configL = configuracionEscenas[escenaLive];
    
    if (videoL && videoL.readyState >= 2) {
        ctxLive.drawImage(videoL, 0, 0, canvasLive.width, canvasLive.height);
    } else {
        ctxLive.fillStyle = "#000000";
        ctxLive.fillRect(0, 0, canvasLive.width, canvasLive.height);
    }
    if (configL && configL.banner) {
        ctxLive.drawImage(configL.banner, 0, 0, canvasLive.width, canvasLive.height);
    }

    requestAnimationFrame(procesarMaster);
}

window.onload = iniciarCamara;