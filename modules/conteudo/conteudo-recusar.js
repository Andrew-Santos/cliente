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
.ct-rec-msg-row { display: flex; justify-content: flex-end; }
.ct-rec-msg-bubble {
    max-width: 85%; padding: 7px 11px 6px;
    border-radius: 14px 14px 4px 14px;
    background: var(--text-1); color: #fff;
    font-size: 12.5px; line-height: 1.55;
    display: flex; flex-direction: column; gap: 3px;
    word-break: break-word;
}
.ct-rec-msg-time {
    font-size: 9px; color: rgba(255,255,255,.45);
    align-self: flex-end; white-space: nowrap;
}

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

@media (max-width: 480px) {
    .ct-recusar-backdrop { padding: 0; align-items: flex-end; }
    .ct-recusar-win { max-width: 100%; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
}
    `;
    document.head.appendChild(s);
}

// ── Estado de áudio ───────────────────────────────────────────────────────────
function _recAudioInit() {
    return {
        recorder: null, stream: null, chunks: [], blob: null,
        timerInt: null, segundos: 0, gravando: false, temPreview: false,
        _waveAnim: null, _analyser: null,
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

// ── Renderiza área de gravação/preview ────────────────────────────────────────
function _recRenderAudioArea(st, areaEl, micBtn) {
    if (st._waveAnim && !st.gravando) {
        cancelAnimationFrame(st._waveAnim); st._waveAnim = null;
    }

    if (!st.gravando && !st.temPreview) {
        areaEl.innerHTML = '';
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '<i class="ph ph-microphone"></i>';

    } else if (st.gravando) {
        areaEl.innerHTML = `
            <div class="ct-rec-rec-bar" id="ct-rec-bar">
                <div class="ct-rec-rec-dot"></div>
                <div class="ct-rec-rec-wave" id="ct-rec-wave">
                    ${Array.from({ length: 28 }, (_, i) =>
                        `<div class="ct-rec-rec-wbar" id="ct-rec-wb-${i}"></div>`).join('')}
                </div>
                <span class="ct-rec-rec-timer" id="ct-rec-timer">${_recFmtSeg(st.segundos)}</span>
                <button class="ct-rec-audio-cancel" id="ct-rec-cancel">
                    <i class="ph ph-x"></i>
                </button>
            </div>`;
        micBtn.classList.add('recording');
        micBtn.innerHTML = '<i class="ph ph-stop"></i>';

        document.getElementById('ct-rec-cancel')
            ?.addEventListener('click', () => _recCancelarAudio(st, areaEl, micBtn));

        // Visualizador de onda
        if (st.stream) {
            try {
                const ctx      = new AudioContext();
                const source   = ctx.createMediaStreamSource(st.stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 64;
                source.connect(analyser);
                st._analyser = analyser;
                const bufLen = analyser.frequencyBinCount;
                const data   = new Uint8Array(bufLen);
                const barEls = document.querySelectorAll('[id^="ct-rec-wb-"]');
                const n      = barEls.length;
                const animate = () => {
                    if (!st.gravando) return;
                    analyser.getByteFrequencyData(data);
                    for (let i = 0; i < n; i++) {
                        const val = data[Math.floor(i * bufLen / n)] / 255;
                        barEls[i].style.height = Math.max(15, Math.round(val * 100)) + '%';
                    }
                    st._waveAnim = requestAnimationFrame(animate);
                };
                animate();
            } catch {
                const barEls = document.querySelectorAll('[id^="ct-rec-wb-"]');
                const fallback = () => {
                    if (!st.gravando) return;
                    barEls.forEach(b => { b.style.height = (15 + Math.random() * 85) + '%'; });
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
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '<i class="ph ph-microphone"></i>';

        document.getElementById('ct-rec-preview-cancel')
            ?.addEventListener('click', () => _recCancelarAudio(st, areaEl, micBtn));
    }
}

function _recCancelarAudio(st, areaEl, micBtn) {
    if (st._waveAnim)  { cancelAnimationFrame(st._waveAnim); st._waveAnim = null; }
    if (st._analyser)  { try { st._analyser.disconnect(); } catch {} st._analyser = null; }
    if (st.gravando)   { st.recorder?.stop(); clearInterval(st.timerInt); }
    st.stream?.getTracks().forEach(t => t.stop());
    Object.assign(st, { chunks:[], blob:null, gravando:false, temPreview:false, segundos:0, stream:null });
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
    Object.assign(st, { chunks:[], blob:null, segundos:0, gravando:true, temPreview:false });
    st.recorder = new MediaRecorder(st.stream);
    st.recorder.ondataavailable = e => { if (e.data.size > 0) st.chunks.push(e.data); };
    st.recorder.onstop = () => {
        st.blob = new Blob(st.chunks, { type: 'audio/webm' });
        st.stream?.getTracks().forEach(t => t.stop());
        Object.assign(st, { stream:null, gravando:false, temPreview:true });
        clearInterval(st.timerInt);
        _recRenderAudioArea(st, areaEl, micBtn);
    };
    st.recorder.start(200);
    st.timerInt = setInterval(() => {
        st.segundos++;
        const el = document.getElementById('ct-rec-timer');
        if (el) el.textContent = _recFmtSeg(st.segundos);
        if (st.segundos >= 180) st.recorder?.stop();
    }, 1000);
    _recRenderAudioArea(st, areaEl, micBtn);
}

async function _recUploadAudio(blob) {
    const formData = new FormData();
    formData.append('file', blob, `audio_recusa_${Date.now()}.webm`);
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
                }).catch(() => { playBtn.innerHTML = '<i class="ph ph-play"></i>'; });
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
        const hora = new Date(m.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        if (m.tipo === 'audio') {
            return `
                <div class="ct-rec-msg-row">
                    <div class="ct-rec-msg-bubble">
                        <div class="ct-rec-ap" data-src="${m.url}" data-init="">
                            <button class="ct-rec-ap-play"><i class="ph ph-play"></i></button>
                            <div class="ct-rec-ap-wave">${_recBarrasHTML(28)}</div>
                            <span class="ct-rec-ap-time">–:––</span>
                        </div>
                        <span class="ct-rec-msg-time">${hora}</span>
                    </div>
                </div>`;
        }

        return `
            <div class="ct-rec-msg-row">
                <div class="ct-rec-msg-bubble">
                    <div>${_recEsc(m.texto).replace(/\n/g, '<br>')}</div>
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
async function acaoRecusar(postagem, onSucesso) {
    _recusarInjetarCSS();

    // Mensagens coletadas nesta sessão de recusa (ainda não salvas no banco)
    const mensagensLocais = [];
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
            <div class="ct-recusar-lista" id="ct-recusar-lista">
                <div class="ct-recusar-empty">
                    <i class="ph ph-chat-dots"></i>
                    <span>Adicione um motivo antes de confirmar.</span>
                </div>
            </div>

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
                    Envie as mensagens de feedback e depois<br>
                    <strong>confirme a recusa</strong> para alterar o status.
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

    // ── Auto-resize textarea ──────────────────────────────────────────────────
    txtEl.addEventListener('input', () => {
        txtEl.style.height = 'auto';
        txtEl.style.height = Math.min(txtEl.scrollHeight, 100) + 'px';
    });

    // ── Fechar ────────────────────────────────────────────────────────────────
    const fechar = () => {
        _recCancelarAudio(st, areaEl, micBtn);
        backdrop.remove();
    };
    document.getElementById('ct-recusar-close').addEventListener('click', fechar);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) fechar(); });

    // ── Enviar mensagem de texto ──────────────────────────────────────────────
    const enviarTexto = () => {
        const texto = txtEl.value.trim();
        if (!texto) return;
        mensagensLocais.push({ tipo: 'texto', texto, em: new Date().toISOString() });
        txtEl.value = '';
        txtEl.style.height = 'auto';
        _recRenderLista(mensagensLocais, listaEl);
    };

    // ── Enviar áudio ──────────────────────────────────────────────────────────
    const enviarAudio = async () => {
        if (!st.blob) return;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="ph ph-circle-notch ct-spin"></i>';
        try {
            const url = await _recUploadAudio(st.blob);
            mensagensLocais.push({ tipo: 'audio', url, em: new Date().toISOString() });
            _recCancelarAudio(st, areaEl, micBtn);
            _recRenderLista(mensagensLocais, listaEl);
        } catch (e) {
            console.error('[recusar] erro upload áudio:', e);
            _toast('Erro ao enviar áudio. Tente novamente.', 'erro');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i>';
        }
    };

    sendBtn.addEventListener('click', () => {
        if (st.temPreview && st.blob) enviarAudio();
        else enviarTexto();
    });

    txtEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarTexto(); }
    });

    // ── Microfone ─────────────────────────────────────────────────────────────
    micBtn.addEventListener('click', () => {
        if (st.gravando) {
            // Para e envia automaticamente
            st.recorder.onstop = () => {
                st.blob = new Blob(st.chunks, { type: 'audio/webm' });
                st.stream?.getTracks().forEach(t => t.stop());
                Object.assign(st, { stream:null, gravando:false, temPreview:true });
                clearInterval(st.timerInt);
                _recRenderAudioArea(st, areaEl, micBtn);
                enviarAudio();
            };
            st.recorder.stop();
        } else if (st.temPreview) {
            _recCancelarAudio(st, areaEl, micBtn);
        } else {
            _recIniciarGravacao(st, areaEl, micBtn);
        }
    });

    // ── Confirmar recusa ──────────────────────────────────────────────────────
    confBtn.addEventListener('click', async () => {
        confBtn.disabled = true;
        confBtn.innerHTML = '<i class="ph ph-circle-notch ct-spin"></i> Salvando…';

        try {
            const agora = new Date().toISOString();
            const quem  = _getNomeUsuario().toUpperCase();

            const { logs: logsAtuais, status: statusAtual } = await _buscarLogs(postagem.id);

            // ── Monta log de recusa ───────────────────────────────────────────
            const novoLog = {
                EM:        agora,
                ACAO:      'PORTAL - RECUSADO',
                ITEM:      'STATUS',
                QUEM:      quem,
                ALTERACAO: `${STATUS_MODAL[statusAtual]?.label || statusAtual} | Reprovado`,
            };

            const logsAtualizados = [...logsAtuais, novoLog];

            // ── Busca mensagens existentes no banco e mescla ──────────────────
            const { data: dadosAtuais } = await _db()
                .from('postagens')
                .select('mensagens')
                .eq('id', postagem.id)
                .single();

            const mensagensExistentes = Array.isArray(dadosAtuais?.mensagens)
                ? dadosAtuais.mensagens
                : [];

            // Formata mensagens locais no padrão do banco
            const novasMensagens = mensagensLocais.map(m => ({
                user_name:  quem,
                created_at: m.em,
                type:       m.tipo === 'audio' ? 'audio' : 'txt',
                ...(m.tipo === 'audio' ? { url: m.url } : { message: m.texto }),
            }));

            const mensagensAtualizadas = [...mensagensExistentes, ...novasMensagens];

            // ── Salva tudo de uma vez ─────────────────────────────────────────
            const { error } = await _db()
                .from('postagens')
                .update({
                    status:     'REPROVADO',
                    logs:       logsAtualizados,
                    mensagens:  mensagensAtualizadas,
                })
                .eq('id', postagem.id);

            if (error) throw error;

            // ── Atualiza objeto local ─────────────────────────────────────────
            postagem.status    = 'REPROVADO';
            postagem.logs      = logsAtualizados;
            postagem.mensagens = mensagensAtualizadas;

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