const _RECUSAR_WORKER = 'https://upload-audio-dn01.andrewmssantos.workers.dev';
const _RECUSAR_STYLE_ID = 'ct-recusar-style';

// ── CSS da janela de recusa ───────────────────────────────────────────────────
function _recusarInjetarCSS() {
    if (document.getElementById(_RECUSAR_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = _RECUSAR_STYLE_ID;
    s.textContent = `
/* ── Backdrop ── */
.ct-recusar-backdrop {
    position: fixed; inset: 0;
    background: rgba(10,9,8,.60);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1100;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: ct-fade-in .16s ease both;
}

/* ── Janela ── */
.ct-recusar-win {
    background: var(--surface);
    border: 1px solid var(--border-mid);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0,0,0,.28);
    width: 100%; max-width: 420px;
    max-height: calc(100dvh - 48px);
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: ct-modal-in .22s cubic-bezier(.22,1,.36,1) both;
}

/* ── Header ── */
.ct-recusar-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}
.ct-recusar-header-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--danger-bg); border: 1px solid var(--danger-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--danger); font-size: 14px; flex-shrink: 0;
}
.ct-recusar-header-info { flex: 1; min-width: 0; }
.ct-recusar-titulo {
    font-size: 13px; font-weight: 700; color: var(--text-1);
    letter-spacing: -0.01em;
}
.ct-recusar-sub {
    font-size: 11px; color: var(--text-3); margin-top: 1px;
}
.ct-recusar-close {
    width: 28px; height: 28px; border-radius: var(--radius); flex-shrink: 0;
    border: 1px solid var(--border); background: var(--surface-3);
    color: var(--text-2); cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--t);
}
.ct-recusar-close:hover { background: var(--surface-2); color: var(--text-1); }

/* ── Lista de mensagens ── */
.ct-recusar-lista {
    flex: 1; overflow-y: auto; padding: 12px 14px;
    display: flex; flex-direction: column; gap: 6px;
    scroll-behavior: smooth; min-height: 120px; max-height: 280px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.ct-recusar-empty {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 24px 12px; color: var(--text-4); font-size: 12px;
    font-style: italic; text-align: center;
}
.ct-recusar-empty i { font-size: 24px; opacity: .35; }

/* ── Balões ── */
.ct-rec-msg-row { display: flex; }
.ct-rec-msg-row--me    { justify-content: flex-end; }
.ct-rec-msg-row--other { justify-content: flex-start; }

.ct-rec-msg-bubble {
    max-width: 85%; padding: 7px 11px 6px;
    font-size: 12.5px; line-height: 1.55;
    display: flex; flex-direction: column; gap: 3px;
    word-break: break-word;
}
.ct-rec-msg-bubble--me {
    border-radius: 14px 14px 4px 14px;
    background: var(--text-1); color: #fff;
}
.ct-rec-msg-bubble--other {
    border-radius: 14px 14px 14px 4px;
    background: var(--surface-3);
    border: 1px solid var(--border);
    color: var(--text-1);
}
.ct-rec-msg-time {
    font-size: 9px;
    align-self: flex-end; white-space: nowrap;
}
.ct-rec-msg-bubble--me .ct-rec-msg-time    { color: rgba(255,255,255,.45); }
.ct-rec-msg-bubble--other .ct-rec-msg-time { color: var(--text-4); }

/* ── Nome do remetente ── */
.ct-rec-msg-user {
    font-size: 9.5px; font-weight: 700;
    letter-spacing: .03em; margin-bottom: 1px;
}
.ct-rec-msg-bubble--me .ct-rec-msg-user    { color: rgba(255,255,255,.60); }
.ct-rec-msg-bubble--other .ct-rec-msg-user { color: var(--text-3); }

/* Player de áudio no balão */
.ct-rec-ap {
    display: flex; align-items: center; gap: 8px; min-width: 180px;
}
.ct-rec-ap-play {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: rgba(255,255,255,.2); border: none; cursor: pointer;
    font-size: 12px; color: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: opacity .13s;
}
.ct-rec-ap-play:hover { opacity: .75; }
.ct-rec-ap-wave {
    flex: 1; height: 28px; display: flex; align-items: center;
    gap: 2px; cursor: pointer; overflow: hidden;
}
.ct-rec-ap-bar {
    flex: 1; max-width: 4px; border-radius: 2px;
    background: rgba(255,255,255,.30); min-height: 3px;
}
.ct-rec-ap-bar.active { background: rgba(255,255,255,.90); }
.ct-rec-ap-time {
    font-size: 10px; color: rgba(255,255,255,.50);
    flex-shrink: 0; min-width: 28px;
    font-variant-numeric: tabular-nums;
}

/* Player de áudio — variante para balões claros (remetentes que não são o cliente) */
.ct-rec-ap--other .ct-rec-ap-play {
    background: var(--surface-2);
    border: 1px solid var(--border-mid);
    color: var(--text-1);
}
.ct-rec-ap--other .ct-rec-ap-bar { background: var(--border-mid); }
.ct-rec-ap--other .ct-rec-ap-bar.active { background: var(--accent); }
.ct-rec-ap--other .ct-rec-ap-time { color: var(--text-3); }

/* ── Área de composição ── */
.ct-recusar-compose {
    border-top: 1px solid var(--border);
    padding: 10px 12px;
    background: var(--surface-2);
    display: flex; flex-direction: column; gap: 7px;
    flex-shrink: 0;
}
.ct-recusar-compose-row {
    display: flex; align-items: flex-end; gap: 6px;
}
.ct-recusar-textarea {
    flex: 1; min-height: 36px; max-height: 100px;
    padding: 8px 12px; font-family: var(--font, inherit);
    font-size: 12.5px; line-height: 1.5; color: var(--text-1);
    background: var(--surface); border: 1px solid var(--border-mid);
    border-radius: 18px; outline: none; resize: none; overflow-y: auto;
    box-sizing: border-box; transition: border-color var(--t), box-shadow var(--t);
}
.ct-recusar-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent);
}
.ct-recusar-textarea::placeholder { color: var(--text-4); }
.ct-rec-btn-mic {
    width: 36px; height: 36px; flex-shrink: 0;
    background: transparent; color: var(--text-2);
    border: 1px solid var(--border); border-radius: 50%;
    cursor: pointer; font-size: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    transition: background var(--t), color var(--t);
}
.ct-rec-btn-mic:hover { background: var(--surface); color: var(--text-1); }
.ct-rec-btn-mic.recording {
    background: var(--text-1); color: #fff; border-color: var(--text-1);
    animation: ct-rec-pulse 1.2s ease-in-out infinite;
}
.ct-rec-btn-mic.recording.paused {
    background: var(--accent); color: #fff; border-color: var(--accent);
    animation: none;
}
.ct-rec-btn-send {
    width: 36px; height: 36px; flex-shrink: 0;
    background: var(--text-1); color: #fff;
    border: none; border-radius: 50%;
    cursor: pointer; font-size: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    transition: opacity var(--t);
}
.ct-rec-btn-send:hover { opacity: .80; }
.ct-rec-btn-send:disabled { opacity: .35; cursor: not-allowed; }

/* ── Gravação ── */
.ct-rec-rec-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 5px 10px 5px 8px; min-height: 36px;
}
.ct-rec-rec-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    background: var(--danger); animation: ct-rec-pulse .9s ease-in-out infinite;
}
.ct-rec-rec-dot.pausado {
    background: var(--text-4); animation: none; opacity: .6;
}
.ct-rec-rec-wave {
    flex: 1; height: 26px; display: flex; align-items: center;
    gap: 2px; overflow: hidden;
}
.ct-rec-rec-wbar {
    flex: 1; max-width: 4px; border-radius: 2px;
    background: var(--danger); opacity: .55;
    height: 20%; min-height: 3px; transition: height .05s ease;
}
.ct-rec-rec-timer {
    font-size: 11px; font-variant-numeric: tabular-nums;
    color: var(--text-1); font-weight: 700; flex-shrink: 0;
}
.ct-rec-rec-label {
    font-size: 10px; font-weight: 700; letter-spacing: .04em;
    color: var(--text-3); white-space: nowrap; flex-shrink: 0;
    text-transform: uppercase;
}
.ct-rec-audio-cancel {
    width: 22px; height: 22px; border-radius: 50%;
    background: none; border: 1px solid var(--border);
    color: var(--text-3); cursor: pointer; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
    transition: color var(--t), background var(--t); flex-shrink: 0;
}
.ct-rec-audio-cancel:hover { color: var(--text-1); background: var(--surface-2); }
.ct-rec-audio-preview {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 4px 10px 4px 8px;
}
.ct-rec-audio-preview audio { flex: 1; height: 28px; }

@keyframes ct-rec-pulse {
    0%, 100% { opacity: 1; } 50% { opacity: .45; }
}

/* ── Rodapé com botão confirmar ── */
.ct-recusar-footer {
    padding: 12px 14px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; flex-shrink: 0;
}
.ct-recusar-footer-hint {
    font-size: 11px; color: var(--text-4); line-height: 1.4; flex: 1;
}
.ct-recusar-footer-hint strong { color: var(--text-3); }
.ct-recusar-btn-confirmar {
    height: 36px; padding: 0 18px; flex-shrink: 0;
    background: var(--danger-bg); border: 1px solid var(--danger-border);
    color: var(--danger); border-radius: var(--radius-md);
    font-family: var(--font, inherit); font-size: 12.5px; font-weight: 700;
    cursor: pointer; transition: all var(--t);
    display: flex; align-items: center; gap: 6px;
}
.ct-recusar-btn-confirmar:hover { background: #FAE2E0; border-color: #D8978F; }
.ct-recusar-btn-confirmar:disabled { opacity: .45; cursor: not-allowed; }

/* ══════════════════════════════════════
   MOBILE — tela cheia, centralizado
══════════════════════════════════════ */
@media (max-width: 480px) {
    /* Backdrop: centralizado e com padding zero */
    .ct-recusar-backdrop {
        padding: 0;
        align-items: center;
        justify-content: center;
    }

    /* Janela ocupa tela cheia */
    .ct-recusar-win {
        width: 100%;
        max-width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        border-radius: 0;
    }

    /* Lista cresce para preencher o espaço disponível */
    .ct-recusar-lista {
        max-height: none;
        flex: 1;
    }
}
    `;
    document.head.appendChild(s);
}

// ── Conversão de áudio para MP3 ────────────────────────────────────────────────
// MediaRecorder não grava em mp3 nativamente (o navegador só oferece webm/ogg),
// então gravamos normalmente e, ao parar, decodificamos o áudio e o
// reencodamos em mp3 com lamejs antes de enviar.
let _lameJsPromise = null;
function _recCarregarLameJs() {
    if (window.lamejs) return Promise.resolve();
    if (_lameJsPromise) return _lameJsPromise;
    _lameJsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js';
        script.onload  = () => resolve();
        script.onerror = () => reject(new Error('Falha ao carregar lamejs'));
        document.head.appendChild(script);
    });
    return _lameJsPromise;
}

/**
 * Converte um Blob de áudio (webm/ogg gravado pelo MediaRecorder) em Blob mp3.
 * Em caso de falha (lib não carrega, navegador não decodifica, etc.),
 * lança erro — quem chamar deve ter um fallback para o blob original.
 * @param {Blob} blob
 * @returns {Promise<Blob>} blob no formato audio/mp3
 */
async function _recConverterParaMp3(blob) {
    await _recCarregarLameJs();

    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtx     = window.AudioContext || window.webkitAudioContext;
    const audioCtx     = new AudioCtx();
    let audioBuffer;
    try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } finally {
        audioCtx.close().catch(() => {});
    }

    // Mono é suficiente para voz e mantém o arquivo leve
    const samples    = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Converte Float32 [-1, 1] → Int16 (formato que o encoder espera)
    const amostrasInt16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        amostrasInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const encoder   = new window.lamejs.Mp3Encoder(1, sampleRate, 96); // mono, 96kbps
    const blockSize = 1152;
    const partes    = [];

    for (let i = 0; i < amostrasInt16.length; i += blockSize) {
        const chunk  = amostrasInt16.subarray(i, i + blockSize);
        const mp3Buf = encoder.encodeBuffer(chunk);
        if (mp3Buf.length > 0) partes.push(mp3Buf);
    }
    const restante = encoder.flush();
    if (restante.length > 0) partes.push(restante);

    const mp3Blob = new Blob(partes, { type: 'audio/mpeg' });

    // Confirma que o mp3 gerado é realmente decodificável antes de usá-lo.
    // Se o encoder produziu algo corrompido, é melhor cair no áudio original
    // (webm) do que subir um arquivo que não toca em lugar nenhum.
    await _recValidarAudioDecodavel(mp3Blob);

    return mp3Blob;
}

async function _recValidarAudioDecodavel(blob) {
    const buf = await blob.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    try {
        const decodado = await ctx.decodeAudioData(buf);
        if (!decodado || !(decodado.duration > 0)) {
            throw new Error('mp3 gerado não tem duração válida');
        }
    } finally {
        ctx.close().catch(() => {});
    }
}

// ── Estado de áudio ───────────────────────────────────────────────────────────
function _recAudioInit() {
    return {
        recorder: null, stream: null, chunks: [], blob: null,
        timerInt: null, segundos: 0, gravando: false, pausado: false, temPreview: false,
        _waveAnim: null, _analyser: null, _audioCtx: null,
    };
}

function _recFmtSeg(s) {
    const m = Math.floor(s / 60), r = s % 60;
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}
function _recFmtT(s) {
    if (!s || !isFinite(s) || isNaN(s) || s <= 0) return '–:––';
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2,'0')}`;
}

function _recBarrasHTML(n) {
    return Array.from({ length: n }, () => {
        const h = 15 + Math.floor(Math.random() * 70);
        return `<div class="ct-rec-ap-bar" style="height:${h}%"></div>`;
    }).join('');
}

// ── Atualiza apenas o ícone do botão de mic conforme o estado ─────────────────
function _recAtualizarIconeMic(st, micBtn) {
    micBtn.classList.remove('recording', 'paused');
    if (st.gravando) {
        micBtn.classList.add('recording');
        if (st.pausado) {
            micBtn.classList.add('paused');
            micBtn.innerHTML = '<i class="ph ph-play"></i>';
            micBtn.title = 'Retomar gravação';
        } else {
            micBtn.innerHTML = '<i class="ph ph-pause"></i>';
            micBtn.title = 'Pausar gravação';
        }
    } else {
        micBtn.innerHTML = '<i class="ph ph-microphone"></i>';
        micBtn.title = 'Gravar áudio';
    }
}

// ── Renderiza área de gravação/preview ────────────────────────────────────────
// IMPORTANTE: só reconstrói o HTML da barra de gravação quando a gravação
// COMEÇA. Pausar/retomar usa _recTogglePausa (abaixo), que só atualiza classes
// e ícones no lugar — assim o visualizador de onda não é recriado a cada clique.
function _recRenderAudioArea(st, areaEl, micBtn) {
    if (st._waveAnim && !st.gravando) {
        cancelAnimationFrame(st._waveAnim); st._waveAnim = null;
    }
    if (!st.gravando && st._audioCtx) {
        st._audioCtx.close().catch(() => {});
        st._audioCtx = null;
    }

    if (!st.gravando && !st.temPreview) {
        areaEl.innerHTML = '';
        _recAtualizarIconeMic(st, micBtn);

    } else if (st.gravando) {
        areaEl.innerHTML = `
            <div class="ct-rec-rec-bar" id="ct-rec-bar">
                <button class="ct-rec-audio-cancel" id="ct-rec-cancel" title="Descartar gravação">
                    <i class="ph ph-trash"></i>
                </button>
                <div class="ct-rec-rec-dot" id="ct-rec-dot"></div>
                <div class="ct-rec-rec-wave" id="ct-rec-wave">
                    ${Array.from({ length: 28 }, (_, i) =>
                        `<div class="ct-rec-rec-wbar" id="ct-rec-wb-${i}"></div>`).join('')}
                </div>
                <span class="ct-rec-rec-timer" id="ct-rec-timer">${_recFmtSeg(st.segundos)}</span>
                <span class="ct-rec-rec-label" id="ct-rec-label" style="display:none;">Pausado</span>
            </div>`;
        _recAtualizarIconeMic(st, micBtn);

        document.getElementById('ct-rec-cancel')
            ?.addEventListener('click', () => _recCancelarAudio(st, areaEl, micBtn));

        // Visualizador de onda — criado uma única vez por gravação
        if (st.stream) {
            try {
                const ctx      = new AudioContext();
                const source   = ctx.createMediaStreamSource(st.stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 64;
                source.connect(analyser);
                st._analyser = analyser;
                st._audioCtx = ctx;
                const bufLen = analyser.frequencyBinCount;
                const data   = new Uint8Array(bufLen);
                const barEls = document.querySelectorAll('[id^="ct-rec-wb-"]');
                const n      = barEls.length;
                const animate = () => {
                    if (!st.gravando) return;
                    if (!st.pausado) {
                        analyser.getByteFrequencyData(data);
                        for (let i = 0; i < n; i++) {
                            const val = data[Math.floor(i * bufLen / n)] / 255;
                            barEls[i].style.height = Math.max(15, Math.round(val * 100)) + '%';
                        }
                    }
                    st._waveAnim = requestAnimationFrame(animate);
                };
                animate();
            } catch {
                const barEls = document.querySelectorAll('[id^="ct-rec-wb-"]');
                const fallback = () => {
                    if (!st.gravando) return;
                    if (!st.pausado) {
                        barEls.forEach(b => { b.style.height = (15 + Math.random() * 85) + '%'; });
                    }
                    st._waveAnim = requestAnimationFrame(fallback);
                };
                fallback();
            }
        }

    } else if (st.temPreview && st.blob) {
        const objURL = URL.createObjectURL(st.blob);
        areaEl.innerHTML = `
            <div class="ct-rec-audio-preview">
                <i class="ph ph-microphone" style="flex-shrink:0;color:var(--text-3);font-size:13px;"></i>
                <audio controls src="${objURL}" style="flex:1;height:28px;"></audio>
                <button class="ct-rec-audio-cancel" id="ct-rec-preview-cancel">
                    <i class="ph ph-trash"></i>
                </button>
            </div>`;
        _recAtualizarIconeMic(st, micBtn);

        document.getElementById('ct-rec-preview-cancel')
            ?.addEventListener('click', () => _recCancelarAudio(st, areaEl, micBtn));
    }
}

// ── Pausa ou retoma a gravação em andamento (não envia, não descarta) ─────────
function _recTogglePausa(st, areaEl, micBtn) {
    if (!st.gravando || !st.recorder) return;

    if (st.pausado) {
        if (st.recorder.state === 'paused') st.recorder.resume();
        st.pausado = false;
    } else {
        if (st.recorder.state === 'recording') st.recorder.pause();
        st.pausado = true;
    }

    const dot   = document.getElementById('ct-rec-dot');
    const label = document.getElementById('ct-rec-label');
    dot?.classList.toggle('pausado', st.pausado);
    if (label) label.style.display = st.pausado ? '' : 'none';

    _recAtualizarIconeMic(st, micBtn);
}

// ── Finaliza a gravação: converte para mp3 (com fallback para webm) ───────────
async function _recFinalizarGravacao(st, areaEl, micBtn) {
    st.stream?.getTracks().forEach(t => t.stop());
    clearInterval(st.timerInt);
    Object.assign(st, { stream: null, gravando: false, pausado: false });

    const blobOriginal = new Blob(st.chunks, { type: 'audio/webm' });

    // Feedback visual enquanto converte
    areaEl.innerHTML = `
        <div class="ct-rec-audio-preview">
            <i class="ph ph-circle-notch ct-spin" style="flex-shrink:0;color:var(--text-3);"></i>
            <span style="font-size:12px;color:var(--text-3);">Convertendo áudio…</span>
        </div>`;

    try {
        st.blob = await _recConverterParaMp3(blobOriginal);
    } catch (e) {
        console.warn('[recusar] falha ao converter para mp3, usando áudio original:', e);
        st.blob = blobOriginal;
    }

    st.temPreview = true;
    _recRenderAudioArea(st, areaEl, micBtn);
}

function _recCancelarAudio(st, areaEl, micBtn) {
    if (st._waveAnim) { cancelAnimationFrame(st._waveAnim); st._waveAnim = null; }
    if (st._analyser) { try { st._analyser.disconnect(); } catch {} st._analyser = null; }
    if (st._audioCtx) { st._audioCtx.close().catch(() => {}); st._audioCtx = null; }
    if (st.gravando) {
        if (st.recorder) st.recorder.onstop = null; // evita finalizar/enviar ao cancelar
        if (st.recorder && st.recorder.state === 'paused') st.recorder.resume();
        st.recorder?.stop();
        clearInterval(st.timerInt);
    }
    st.stream?.getTracks().forEach(t => t.stop());
    Object.assign(st, {
        chunks: [], blob: null, gravando: false, pausado: false,
        temPreview: false, segundos: 0, stream: null,
    });
    _recRenderAudioArea(st, areaEl, micBtn);
}

async function _recIniciarGravacao(st, areaEl, micBtn) {
    if (st.gravando) return;
    try {
        st.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
        _toast('Permissão de microfone negada.', 'erro');
        return;
    }
    Object.assign(st, { chunks:[], blob:null, segundos:0, gravando:true, pausado:false, temPreview:false });
    st.recorder = new MediaRecorder(st.stream);
    st.recorder.ondataavailable = e => { if (e.data.size > 0) st.chunks.push(e.data); };
    st.recorder.onstop = () => { _recFinalizarGravacao(st, areaEl, micBtn); };
    st.recorder.start(200);
    st.timerInt = setInterval(() => {
        if (st.pausado) return; // não avança o cronômetro enquanto pausado
        st.segundos++;
        const el = document.getElementById('ct-rec-timer');
        if (el) el.textContent = _recFmtSeg(st.segundos);
        if (st.segundos >= 180) st.recorder?.stop();
    }, 1000);
    _recRenderAudioArea(st, areaEl, micBtn);
}

async function _recUploadAudio(blob) {
    const formData = new FormData();
    const ext = /mp3|mpeg/i.test(blob.type) ? 'mp3' : 'webm';
    formData.append('file', blob, `audio_recusa_${Date.now()}.${ext}`);
    formData.append('folder', 'portal/recusas/audio');
    const res = await fetch(`${_RECUSAR_WORKER}/upload-audio`, { method: 'POST', body: formData });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Erro no upload de áudio: ${res.status} ${txt}`);
    }
    return (await res.json()).url;
}

// ── Inicializa players de áudio nos balões ────────────────────────────────────
function _recInitPlayers(container) {
    container.querySelectorAll('.ct-rec-ap:not([data-init])').forEach(player => {
        player.dataset.init = '1';
        const src     = player.dataset.src;
        const playBtn = player.querySelector('.ct-rec-ap-play');
        const timeEl  = player.querySelector('.ct-rec-ap-time');
        const waveEl  = player.querySelector('.ct-rec-ap-wave');
        if (!playBtn || !waveEl) return;

        const audio = new Audio();
        const bars  = waveEl.querySelectorAll('.ct-rec-ap-bar');
        const total = bars.length;

        audio.addEventListener('loadedmetadata', () => {
            if (isFinite(audio.duration) && audio.duration > 0)
                timeEl.textContent = _recFmtT(audio.duration);
        });
        audio.addEventListener('timeupdate', () => {
            const dur = audio.duration;
            if (!isFinite(dur) || dur <= 0) return;
            const ativo = Math.floor((audio.currentTime / dur) * total);
            bars.forEach((b, i) => b.classList.toggle('active', i < ativo));
            timeEl.textContent = _recFmtT(audio.currentTime);
        });
        audio.addEventListener('ended', () => {
            playBtn.innerHTML = '<i class="ph ph-play"></i>';
            bars.forEach(b => b.classList.remove('active'));
            if (isFinite(audio.duration)) timeEl.textContent = _recFmtT(audio.duration);
        });
        audio.addEventListener('error', () => {
            const codigo = audio.error?.code;
            console.error('[recusar] falha ao carregar áudio:', src, 'código:', codigo);
            playBtn.disabled  = true;
            playBtn.innerHTML = '<i class="ph ph-warning"></i>';
            timeEl.textContent = 'erro';
            timeEl.title = 'Não foi possível carregar este áudio. Verifique se o link ainda está acessível.';
        });
        waveEl.addEventListener('click', e => {
            if (!audio.duration || !isFinite(audio.duration)) return;
            const rect = waveEl.getBoundingClientRect();
            const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = pct * audio.duration;
        });
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().then(() => {
                    playBtn.innerHTML = '<i class="ph ph-pause"></i>';
                }).catch(e => {
                    console.error('[recusar] falha ao tocar áudio:', src, e);
                    playBtn.innerHTML = '<i class="ph ph-play"></i>';
                    _toast('Não foi possível tocar este áudio.', 'erro');
                });
            } else {
                audio.pause();
                playBtn.innerHTML = '<i class="ph ph-play"></i>';
            }
        });
        audio.preload = 'metadata';
        audio.src     = src;
        player._audioEl = audio;
    });
}

// ── Renderiza lista de mensagens da recusa ────────────────────────────────────
// Aceita tanto mensagens históricas (banco) quanto locais (sessão atual)
function _recRenderLista(mensagens, listaEl) {
    if (!mensagens.length) {
        listaEl.innerHTML = `
            <div class="ct-recusar-empty">
                <i class="ph ph-chat-dots"></i>
                <span>Adicione um motivo antes de confirmar.</span>
            </div>`;
        return;
    }

    listaEl.innerHTML = mensagens.map(m => {
        // Suporta tanto created_at (banco) quanto em (local)
        const ts   = m.created_at || m.em || null;
        const hora = ts
            ? new Date(ts).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })
            : '';

        // Nome do remetente (banco usa user_name, local não tem)
        const nomeRem = m.user_name || '';

        // ── Detecta se a mensagem é do cliente ──────────────────────────
        // Mensagens enviadas pelo próprio portal do cliente sempre gravam o
        // nome em CAIXA ALTA (ver _getNomeUsuario().toUpperCase()); nomes
        // vindos do painel da equipe (ex.: "Ester Braz") vêm em caixa normal.
        // Mensagens locais (ainda sem user_name, compostas na hora) também
        // são sempre do cliente.
        const ehCliente = !nomeRem || nomeRem === nomeRem.toUpperCase();
        const ladoClasse  = ehCliente ? 'ct-rec-msg-row--me'    : 'ct-rec-msg-row--other';
        const bolhaClasse = ehCliente ? 'ct-rec-msg-bubble--me' : 'ct-rec-msg-bubble--other';
        const apClasse    = ehCliente ? '' : ' ct-rec-ap--other';

        const nomeHTML = nomeRem
            ? `<span class="ct-rec-msg-user">${_recEsc(nomeRem)}</span>`
            : '';

        if (m.type === 'audio' || m.tipo === 'audio') {
            // url vem de m.url (banco) ou m.url (local após upload)
            const audioUrl = m.url || '';
            return `
                <div class="ct-rec-msg-row ${ladoClasse}">
                    <div class="ct-rec-msg-bubble ${bolhaClasse}">
                        ${nomeHTML}
                        <div class="ct-rec-ap${apClasse}" data-src="${_recEsc(audioUrl)}">
                            <button class="ct-rec-ap-play"><i class="ph ph-play"></i></button>
                            <div class="ct-rec-ap-wave">${_recBarrasHTML(28)}</div>
                            <span class="ct-rec-ap-time">–:––</span>
                        </div>
                        <span class="ct-rec-msg-time">${hora}</span>
                    </div>
                </div>`;
        }

        // Texto: banco usa message, local usa texto
        const texto = m.message || m.texto || '';
        return `
            <div class="ct-rec-msg-row ${ladoClasse}">
                <div class="ct-rec-msg-bubble ${bolhaClasse}">
                    ${nomeHTML}
                    <div>${_recEsc(texto).replace(/\n/g, '<br>')}</div>
                    <span class="ct-rec-msg-time">${hora}</span>
                </div>
            </div>`;
    }).join('');

    _recInitPlayers(listaEl);
    listaEl.scrollTop = listaEl.scrollHeight;
}

function _recEsc(v) {
    return String(v || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Função principal ──────────────────────────────────────────────────────────
// ── Busca mensagens atuais direto do banco ────────────────────────────────────
async function _recBuscarMensagens(postagemId) {
    const { data, error } = await _db()
        .from('postagens')
        .select('mensagens')
        .eq('id', postagemId)
        .single();
    if (error) throw error;
    return Array.isArray(data.mensagens) ? data.mensagens : [];
}

async function acaoRecusar(postagem, onSucesso) {
    _recusarInjetarCSS();

    // Mensagens já persistidas no banco (histórico). Esse array é atualizado
    // conforme o cliente vai enviando novas mensagens — cada uma é salva no
    // banco IMEDIATAMENTE, para não se perder caso a janela seja fechada
    // antes de "Confirmar recusa" (o cliente pode ir pontuando aos poucos).
    let mensagensAtuais = Array.isArray(postagem.mensagens) ? postagem.mensagens.slice() : [];

    const st = _recAudioInit();

    const backdrop = document.createElement('div');
    backdrop.className = 'ct-recusar-backdrop';
    backdrop.id        = 'ct-recusar-backdrop';

    backdrop.innerHTML = `
        <div class="ct-recusar-win" id="ct-recusar-win">

            <!-- Header -->
            <div class="ct-recusar-header">
                <div class="ct-recusar-header-icon">
                    <i class="ph ph-x-circle"></i>
                </div>
                <div class="ct-recusar-header-info">
                    <div class="ct-recusar-titulo">Recusar postagem</div>
                    <div class="ct-recusar-sub">#${postagem.id} · ${_recEsc(postagem.title || '')}</div>
                </div>
                <button class="ct-recusar-close" id="ct-recusar-close">
                    <i class="ph ph-x"></i>
                </button>
            </div>

            <!-- Lista de mensagens -->
            <div class="ct-recusar-lista" id="ct-recusar-lista"></div>

            <!-- Compose -->
            <div class="ct-recusar-compose">
                <div id="ct-rec-audio-area"></div>
                <div class="ct-recusar-compose-row">
                    <textarea class="ct-recusar-textarea" id="ct-rec-txt"
                        placeholder="Explique o motivo da recusa…" rows="1"></textarea>
                    <button class="ct-rec-btn-mic" id="ct-rec-mic" title="Gravar áudio">
                        <i class="ph ph-microphone"></i>
                    </button>
                    <button class="ct-rec-btn-send" id="ct-rec-send" title="Enviar mensagem">
                        <i class="ph ph-paper-plane-tilt"></i>
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="ct-recusar-footer">
                <span class="ct-recusar-footer-hint">
                    As mensagens já ficam salvas assim que você envia.<br>
                    Quando terminar, <strong>confirme a recusa</strong> para alterar o status.
                </span>
                <button class="ct-recusar-btn-confirmar" id="ct-recusar-confirmar">
                    <i class="ph ph-x-circle"></i> Confirmar recusa
                </button>
            </div>

        </div>`;

    document.body.appendChild(backdrop);

    const listaEl  = document.getElementById('ct-recusar-lista');
    const txtEl    = document.getElementById('ct-rec-txt');
    const micBtn   = document.getElementById('ct-rec-mic');
    const sendBtn  = document.getElementById('ct-rec-send');
    const areaEl   = document.getElementById('ct-rec-audio-area');
    const confBtn  = document.getElementById('ct-recusar-confirmar');

    // ── Renderiza histórico imediatamente ─────────────────────────────────────
    _recRenderLista(mensagensAtuais, listaEl);

    // ── Auto-resize textarea ──────────────────────────────────────────────────
    txtEl.addEventListener('input', () => {
        txtEl.style.height = 'auto';
        txtEl.style.height = Math.min(txtEl.scrollHeight, 100) + 'px';
    });

    // ── Fechar ────────────────────────────────────────────────────────────────
    // Não apaga nada: as mensagens já enviadas já estão salvas no banco.
    const fechar = () => {
        _recCancelarAudio(st, areaEl, micBtn);
        backdrop.remove();
    };
    document.getElementById('ct-recusar-close').addEventListener('click', fechar);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) fechar(); });

    // ── Enviar mensagem de texto (salva no banco na hora) ─────────────────────
    const enviarTexto = async () => {
        const texto = txtEl.value.trim();
        if (!texto) return;

        txtEl.value = '';
        txtEl.style.height = 'auto';

        const novaMsg = {
            user_name:  _getNomeUsuario().toUpperCase(),
            created_at: new Date().toISOString(),
            type:       'txt',
            message:    texto,
        };

        // Mostra na hora (otimista) enquanto salva
        mensagensAtuais = [...mensagensAtuais, novaMsg];
        _recRenderLista(mensagensAtuais, listaEl);

        try {
            const mensagensBanco  = await _recBuscarMensagens(postagem.id);
            const mensagensSalvas = [...mensagensBanco, novaMsg];

            const { error } = await _db()
                .from('postagens')
                .update({ mensagens: mensagensSalvas })
                .eq('id', postagem.id);
            if (error) throw error;

            mensagensAtuais    = mensagensSalvas;
            postagem.mensagens = mensagensSalvas;

        } catch (e) {
            console.error('[recusar] erro ao salvar mensagem de texto:', e);
            _toast('Erro ao salvar mensagem. Tente novamente.', 'erro');
            // Reverte a mensagem otimista, já que não foi salva
            mensagensAtuais = mensagensAtuais.filter(m => m !== novaMsg);
            _recRenderLista(mensagensAtuais, listaEl);
        }
    };

    // ── Enviar áudio (salva no banco assim que o upload termina) ──────────────
    const enviarAudio = async () => {
        if (!st.blob) return;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="ph ph-circle-notch ct-spin"></i>';
        try {
            const url = await _recUploadAudio(st.blob);

            const novaMsg = {
                user_name:  _getNomeUsuario().toUpperCase(),
                created_at: new Date().toISOString(),
                type:       'audio',
                url,
            };

            const mensagensBanco  = await _recBuscarMensagens(postagem.id);
            const mensagensSalvas = [...mensagensBanco, novaMsg];

            const { error } = await _db()
                .from('postagens')
                .update({ mensagens: mensagensSalvas })
                .eq('id', postagem.id);
            if (error) throw error;

            mensagensAtuais    = mensagensSalvas;
            postagem.mensagens = mensagensSalvas;

            _recCancelarAudio(st, areaEl, micBtn);
            _recRenderLista(mensagensAtuais, listaEl);
        } catch (e) {
            console.error('[recusar] erro upload/salvar áudio:', e);
            _toast('Erro ao enviar áudio. Tente novamente.', 'erro');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i>';
        }
    };

    sendBtn.addEventListener('click', () => {
        if (st.gravando) {
            // Envia direto o que já foi gravado até agora (WhatsApp-like)
            if (st.recorder && st.recorder.state === 'paused') st.recorder.resume();
            st.recorder.onstop = async () => {
                await _recFinalizarGravacao(st, areaEl, micBtn);
                enviarAudio();
            };
            st.recorder.stop();
        } else if (st.temPreview && st.blob) {
            enviarAudio();
        } else {
            enviarTexto();
        }
    });

    txtEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarTexto(); }
    });

    // ── Microfone: inicia gravação, ou pausa/retoma se já estiver gravando ─────
    micBtn.addEventListener('click', () => {
        if (st.gravando) {
            _recTogglePausa(st, areaEl, micBtn);
        } else if (st.temPreview) {
            _recCancelarAudio(st, areaEl, micBtn);
        } else {
            _recIniciarGravacao(st, areaEl, micBtn);
        }
    });

    // ── Confirmar recusa ──────────────────────────────────────────────────────
    // As mensagens já foram salvas em tempo real durante a conversa — aqui só
    // muda o status e registra o log de recusa.
    confBtn.addEventListener('click', async () => {
        confBtn.disabled = true;
        confBtn.innerHTML = '<i class="ph ph-circle-notch ct-spin"></i> Salvando…';

        try {
            const agora = new Date().toISOString();
            const quem  = _getNomeUsuario().toUpperCase();

            const { logs: logsAtuais, status: statusAtual } = await _buscarLogs(postagem.id);

            const novoLog = {
                EM:        agora,
                ACAO:      'PORTAL - RECUSADO',
                ITEM:      'STATUS',
                QUEM:      quem,
                ALTERACAO: `${STATUS_MODAL[statusAtual]?.label || statusAtual} | Reprovado`,
            };

            const logsAtualizados = [...logsAtuais, novoLog];

            const { error } = await _db()
                .from('postagens')
                .update({
                    status: 'REPROVADO',
                    logs:   logsAtualizados,
                })
                .eq('id', postagem.id);

            if (error) throw error;

            // ── Atualiza objeto local ─────────────────────────────────────────
            postagem.status = 'REPROVADO';
            postagem.logs   = logsAtualizados;

            fechar();
            _toast('Postagem recusada com sucesso!', 'sucesso');

            if (typeof onSucesso === 'function') onSucesso(postagem);

        } catch (e) {
            console.error('[recusar] erro ao confirmar:', e);
            confBtn.disabled = false;
            confBtn.innerHTML = '<i class="ph ph-x-circle"></i> Confirmar recusa';
            _toast('Erro ao recusar. Tente novamente.', 'erro');
        }
    });
}