/* ══════════════════════════════════════
   drive-modal.js
   Modal de visualização de mídia do Drive.
   Sem botões de aprovar/recusar.
   Exibe metadados: nome, tipo, tamanho,
   data de captura e ações de download.
   Depende de: conteudo-aprovar.js
               conteudo-acoes-extras.js
               conteudo-carousel.js
══════════════════════════════════════ */

// ── Abre o modal ──────────────────────────────────────────────
function driveAbrirModal(arq) {
    driveFecharModal();

    const isVideo = arq.file_type === 'video' || (arq.mime_type || '').startsWith('video/');

    // ── Bloco de mídia ────────────────────────────────────────
    let mediaInner = '';

    if (!arq.url_media && !arq.url_thumbnail) {
        mediaInner = `
            <div style="position:absolute;inset:0;display:flex;align-items:center;
                        justify-content:center;flex-direction:column;gap:8px;
                        color:rgba(255,255,255,.25);">
                <i class="ph ph-file" style="font-size:36px;"></i>
                <span style="font-size:11px;letter-spacing:.04em;">Sem prévia</span>
            </div>`;
    } else if (isVideo) {
        const poster = arq.url_thumbnail ? `poster="${_driveEscModal(arq.url_thumbnail)}"` : '';
        mediaInner = `
            <video src="${_driveEscModal(arq.url_media)}"
                controls playsinline autoplay muted loop ${poster}
                style="position:absolute;inset:0;width:100%;height:100%;
                       object-fit:cover;display:block;"></video>`;
    } else {
        mediaInner = `
            <img src="${_driveEscModal(arq.url_media || arq.url_thumbnail)}"
                alt="${_driveEscModal(arq.name || '')}"
                style="position:absolute;inset:0;width:100%;height:100%;
                       object-fit:cover;display:block;"
                loading="eager">`;
    }

    // ── Metadados ─────────────────────────────────────────────
    const dataCaptura  = _driveFormatarDataModal(arq.data_de_captura);
    const tamanhoLabel = arq.file_size ? _driveFormatarTamanho(arq.file_size) : '—';
    const tipoLabel    = _driveTipoLabel(arq.file_type, arq.mime_type);
    const nomeArq      = arq.name || `Arquivo #${arq.id}`;

    // ── Montar backdrop ───────────────────────────────────────
    const backdrop = document.createElement('div');
    backdrop.className = 'ct-modal-backdrop';
    backdrop.id        = 'drive-modal-backdrop';

    backdrop.innerHTML = `
        <div class="ct-modal" id="drive-modal" role="dialog" aria-modal="true"
             aria-label="${_driveEscModal(nomeArq)}">

            <!-- ── COLUNA MÍDIA ── -->
            <div class="ct-modal-media-wrap">
                ${mediaInner}
                <button class="ct-modal-close-float" id="drive-modal-close-float" aria-label="Fechar">
                    <i class="ph ph-x"></i>
                </button>
            </div>

            <!-- ── COLUNA PAINEL ── -->
            <div class="ct-modal-panel">

                <div class="ct-modal-panel-header">
                    <p class="ct-modal-panel-title" title="${_driveEscModal(nomeArq)}">
                        ${_driveEscapeHTML(nomeArq)}
                    </p>
                    <button class="ct-modal-close" id="drive-modal-close" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>

                <div class="ct-modal-scroll">
                    <div class="ct-modal-body">

                        <!-- Informações -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Informações</p>

                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Tipo</span>
                                <span class="ct-modal-info-val">
                                    <i class="ph ${isVideo ? 'ph-video' : 'ph-image'}"></i>${tipoLabel}
                                </span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Data de captura</span>
                                <span class="ct-modal-info-val">
                                    <i class="ph ph-calendar-blank" style="color:var(--text-3);font-size:13px;"></i>
                                    ${dataCaptura}
                                </span>
                            </div>
                            ${arq.file_size ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Tamanho</span>
                                <span class="ct-modal-info-val">${tamanhoLabel}</span>
                            </div>` : ''}
                            ${arq.width && arq.height ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Dimensões</span>
                                <span class="ct-modal-info-val">${arq.width} × ${arq.height}</span>
                            </div>` : ''}
                            ${arq.duration ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Duração</span>
                                <span class="ct-modal-info-val">${_driveFormatarDuracao(arq.duration)}</span>
                            </div>` : ''}
                        </div>

                        <!-- Ações -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Ações</p>
                            <div class="ct-modal-actions">
                                <button class="ct-action-btn ct-action-btn--download drive-btn-download">
                                    <i class="ph ph-download-simple"></i> Download
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    // ── Download ──────────────────────────────────────────────
    backdrop.querySelector('.drive-btn-download').addEventListener('click', e => {
        e.stopPropagation();
        _driveDownload(arq);
    });

    // ── Fechar ────────────────────────────────────────────────
    backdrop.querySelector('#drive-modal-close').addEventListener('click', driveFecharModal);
    const floatClose = backdrop.querySelector('#drive-modal-close-float');
    if (floatClose) floatClose.addEventListener('click', driveFecharModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) driveFecharModal(); });

    _driveEscListener = e => { if (e.key === 'Escape') driveFecharModal(); };
    document.addEventListener('keydown', _driveEscListener);
}

let _driveEscListener = null;

function driveFecharModal() {
    const backdrop = document.getElementById('drive-modal-backdrop');
    if (!backdrop) return;
    backdrop.querySelectorAll('video').forEach(v => v.pause());
    backdrop.remove();
    document.body.style.overflow = '';
    if (_driveEscListener) {
        document.removeEventListener('keydown', _driveEscListener);
        _driveEscListener = null;
    }
}

// ── Download de arquivo do Drive ──────────────────────────────
async function _driveDownload(arq) {
    const url = arq.url_media;
    if (!url) {
        _toast('Arquivo não disponível para download.', 'erro');
        return;
    }

    const WORKER_URL  = 'https://dn02.andrewmssantos.workers.dev/download';
    const filename    = _driveNomeArquivo(arq);
    const downloadUrl = `${WORKER_URL}?url=${encodeURIComponent(url)}&nome=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href          = downloadUrl;
    a.download      = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    _toast('Download iniciado!', 'sucesso');

    // ── Log de download ───────────────────────────────────────
    try {
        const supabaseDb = typeof db !== 'undefined' ? db : window.db;
        if (!supabaseDb) return;

        const sessao = typeof getSessao === 'function' ? getSessao() : null;
        const quem   = sessao?.contaAtual?.usuario
            || sessao?.contaAtual?.responsavel
            || 'Cliente';

        await supabaseDb
            .from('drive_files')
            .update({ last_downloaded_at: new Date().toISOString() })
            .eq('id', arq.id);

        console.log(`[drive] download registrado — #${arq.id}`);
    } catch (e) {
        console.warn('[drive] erro ao registrar download:', e);
    }
}

// ── Helpers ───────────────────────────────────────────────────
function _driveFormatarDataModal(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day:     '2-digit',
            month:   'long',
            year:    'numeric',
        }).replace(/^\w/, c => c.toUpperCase());
    } catch { return '—'; }
}

function _driveFormatarTamanho(bytes) {
    if (!bytes || bytes === 0) return '—';
    const b = parseInt(bytes, 10);
    if (b < 1024)       return `${b} B`;
    if (b < 1024 ** 2)  return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 ** 3)  return `${(b / 1024 ** 2).toFixed(1)} MB`;
    return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function _driveFormatarDuracao(seg) {
    if (!seg) return '—';
    const s = Math.round(seg);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
}

function _driveTipoLabel(fileType, mimeType) {
    if (fileType === 'video' || (mimeType || '').startsWith('video/')) return 'Vídeo';
    if (fileType === 'image' || (mimeType || '').startsWith('image/')) return 'Imagem';
    if (mimeType) {
        const sub = mimeType.split('/')[1] || mimeType;
        return sub.toUpperCase();
    }
    return fileType ? fileType.charAt(0).toUpperCase() + fileType.slice(1) : '—';
}

function _driveNomeArquivo(arq) {
    if (arq.name) return arq.name;
    const isVideo = arq.file_type === 'video' || (arq.mime_type || '').startsWith('video/');
    const ext     = isVideo ? 'mp4' : 'jpg';
    return `arquivo-${arq.id}.${ext}`;
}

function _driveEscModal(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _driveEscapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}