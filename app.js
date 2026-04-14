const socket = io();

let currentChannel = 1;
let isTransmitting = false;
let localStream = null;
let audioReady = false;

const statusEl = document.getElementById("connection-status");
const channelName = document.getElementById("channel-name");
const userCountEl = document.getElementById("user-count");
const pttBtn = document.getElementById("ptt-btn");

// =====================
// STATUS
// =====================
socket.on("connect", () => {
    setStatus("Conectado", "connected");
    socket.emit("changeChannel", "CH1");
});

socket.on("disconnect", () => {
    setStatus("Desconectado", "disconnected");
});

socket.io.on("reconnect_attempt", () => {
    setStatus("Reconectando...", "reconnecting");
});

function setStatus(text, cls) {
    statusEl.innerText = text;
    statusEl.className = "status " + cls;
}

// =====================
// USUÁRIOS
// =====================
socket.on("userCount", (count) => {
    userCountEl.innerText = `• ${count} usuários`;
});

// =====================
// CANAIS (AGORA FUNCIONA)
// =====================
document.getElementById("btn-ch-up").onclick = () => changeChannel(currentChannel + 1);
document.getElementById("btn-ch-down").onclick = () => changeChannel(currentChannel - 1);

function changeChannel(ch) {
    if (ch < 1 || ch > 40) return;

    currentChannel = ch;

    channelName.innerText = "CH " + ch; // 👈 isso garante atualização visual

    socket.emit("changeChannel", "CH" + ch);

    console.log("Mudou canal para:", ch);
}

// =====================
// MICROFONE (CORRIGIDO DE VERDADE)
// =====================
async function initAudio() {
    if (audioReady) return;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        localStream.getTracks().forEach(track => track.enabled = false);

        audioReady = true;

        console.log("Microfone liberado");
    } catch (err) {
        alert("Permita o microfone!");
        console.error(err);
    }
}

// 👇 IMPORTANTE: ativa ao clicar em qualquer lugar
document.body.addEventListener("click", initAudio);

// =====================
// PTT (AGORA FUNCIONA)
// =====================
pttBtn.addEventListener("mousedown", startTX);
pttBtn.addEventListener("mouseup", stopTX);
pttBtn.addEventListener("touchstart", startTX);
pttBtn.addEventListener("touchend", stopTX);

function startTX() {
    if (!audioReady) {
        console.log("Microfone não pronto ainda");
        return;
    }

    if (isTransmitting) return;

    isTransmitting = true;

    pttBtn.classList.remove("idle");
    pttBtn.classList.add("tx");

    localStream.getTracks().forEach(track => track.enabled = true);

    console.log("TX ON");
}

function stopTX() {
    if (!localStream) return;

    isTransmitting = false;

    pttBtn.classList.remove("tx");
    pttBtn.classList.add("idle");

    localStream.getTracks().forEach(track => track.enabled = false);

    console.log("TX OFF");
}

// =====================
// TECLA F7 (CORRIGIDO)
// =====================
document.addEventListener("keydown", (e) => {
    if (e.repeat) return; // evita bug

    if (e.key === "F7") {
        e.preventDefault();
        startTX();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "F7") {
        e.preventDefault();
        stopTX();
    }
});