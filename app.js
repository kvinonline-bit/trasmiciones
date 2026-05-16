const canvasPreview = document.getElementById('canvasPreview');
const canvasLive = document.getElementById('canvasLive');
const ctxPreview = canvasPreview.getContext('2d');
const ctxLive = canvasLive.getContext('2d');
const videoOculto = document.getElementById('videoOculto');

// Estado de las escenas
let escenaPreview = 'camara_limpia';
let escenaLive = 'camara_limpia';

// Almacenamiento Dinámico: Cada escena tiene su propia billetera multimedia vacía
let multimediaEscenas = {
    'camara_limpia': null,
    'escena_2': null,
    'escena_3': null,
    'escena_4': null,
    'escena_5': null
};

// Estado de la transmisión a Facebook
let transmitiendo = false;

async function iniciarCamara() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true // Activamos audio para cuando transmita a la iglesia
        });
        videoOculto.srcObject = stream;
        videoOculto.onloadedmetadata = () => { procesarMaster(); };
    } catch (error) {
        console.error("Error de cámara:", error);
    }
}

// Cambiar de escena en Preview
function cambiarPreview(nuevaEscena) {
    escenaPreview = nuevaEscena;
    
    // TRUCO DE USABILIDAD: Cuando cambias de escena, el input de archivos 
    // se limpia visualmente para que puedas subir uno nuevo si lo deseas.
    document.getElementById('uploadBanner').value = "";
}

// Cargar la imagen exclusivamente en la escena que tienes seleccionada en Preview
function cargarBannerEscena(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Guarda la imagen únicamente en la escena activa de Preview
            multimediaEscenas[escenaPreview] = img;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Pasar de Preview a Programa (Corte máster)
function pasarAEnVivo() {
    escenaLive = escenaPreview;
}

// Función del botón de Transmisión a Facebook
function conmutarTransmision() {
    const urlFacebook = document.getElementById('streamUrl').value.trim();
    const btn = document.getElementById('btnIniciarStream');
    const texto = document.getElementById('textoStream');
    const icono = document.getElementById('iconoStream');

    if (!transmitiendo) {
        if (urlFacebook === "") {
            alert("Por favor, pega la URL o Clave de transmisión de tu Facebook Live primero.");
            return;
        }
        
        // Cambiar estado visual a TRANSMITIENDO
        transmitiendo = true;
        btn.classList.add('transmitiendo-animacion');
        texto.innerText = "DETENER TRANSMISIÓN";
        icono.innerText = "🟩";
        console.log("Conectando flujo de video con el stream de Facebook...");
        
        // AQUÍ CONECTAREMOS EL FLUJO DE STREAMING REAL EN EL SIGUIENTE PASO
    } else {
        // Detener transmisión
        transmitiendo = false;
        btn.classList.remove('transmitiendo-animacion');
        texto.innerText = "INICIAR EN VIVO";
        icono.innerText = "🔴";
        console.log("Transmisión finalizada.");
    }
}

// Bucle de dibujo continuo
function procesarMaster() {
    // Render de Monitor PREVIEW
    ctxPreview.drawImage(videoOculto, 0, 0, canvasPreview.width, canvasPreview.height);
    if (multimediaEscenas[escenaPreview]) {
        ctxPreview.drawImage(multimediaEscenas[escenaPreview], 0, 0, canvasPreview.width, canvasPreview.height);
    }

    // Render de Monitor PROGRAM
    ctxLive.drawImage(videoOculto, 0, 0, canvasLive.width, canvasLive.height);
    if (multimediaEscenas[escenaLive]) {
        ctxLive.drawImage(multimediaEscenas[escenaLive], 0, 0, canvasLive.width, canvasLive.height);
    }

    requestAnimationFrame(procesarMaster);
}

window.onload = iniciarCamara;