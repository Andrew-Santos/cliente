/* ══════════════════════════════════════
   agendamento-modal.js
   Modal de agendamentos:
   - Sem botões Aprovar / Recusar
   - Exibe data_agendamento em Informações
   - Mantém Editar legenda + Download
   Depende de: conteudo-carousel.js,
               conteudo-aprovar.js (logVisualizacao, _db, _buscarLogs),
               conteudo-acoes-extras.js (acaoEditarLegenda, acaoDownload)
══════════════════════════════════════ */

const AG_TYPE_ICON = {
    FEED:     'ph-image-square',
    REELS:    'ph-play',
    STORIES:  'ph-squares-four',
    CAROUSEL: 'ph ph-fill ph-stack',
};
const AG_TYPE_LABEL = {
    FEED: 'Feed', REELS: 'Reels', STORIES: 'Stories', CAROUSEL: 'Carrossel',
};

const AG_STATUS_MODAL = {
    APROVADO:    { label: 'Aprovado',    cls: 'aprovado'  },
    AGENDADO:    { label: 'Agendado',    cls: 'agendado'  },
    FALHOU:      { label: 'Falhou',      cls: 'reprovado' },
    PROCESSANDO: { label: 'Processando', cls: 'analise'   },
};

// ── Formatação de data ────────────────────────────────────────
function _agFormatarData(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day:    '2-digit',
            month:  '2-digit',
            year:   'numeric',
            hour:   '2-digit',
            minute: '2-digit',
        });
    } catch { return '—'; }
}

function _agTempoRelativo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    const p = (n, s) => {
        if (s === 'mês') return `há ${n} ${n !== 1 ? 'meses' : 'mês'}`;
        return `há ${n} ${s}${n !== 1 ? 's' : ''}`;
    };
    if (diff < 60)       return p(diff,                       'segundo');
    if (diff < 3600)     return p(Math.floor(diff / 60),      'minuto');
    if (diff < 86400)    return p(Math.floor(diff / 3600),    'hora');
    if (diff < 2592000)  return p(Math.floor(diff / 86400),   'dia');
    if (diff < 31536000) return p(Math.floor(diff / 2592000), 'mês');
    return                      p(Math.floor(diff / 31536000),'ano');
}

// ── Abre o modal ──────────────────────────────────────────────
function agAbrirModal(postagem) {
    agFecharModal();

    const midias     = _agParseMidias2(postagem.media);
    const isCarousel = postagem.type === 'CAROUSEL' || midias.length > 1;
    const typeIcon   = AG_TYPE_ICON[postagem.type]  || 'ph-image';
    const typeLabel  = AG_TYPE_LABEL[postagem.type] || postagem.type || '—';

    const statusCfg  = AG_STATUS_MODAL[postagem.status]
        || { label: postagem.status || '—', cls: 'default' };

    // ── Bloco de mídia ────────────────────────────────────────
    let mediaInner = '';

    if (midias.length === 0) {
        mediaInner = `
            <div style="position:absolute;inset:0;display:flex;align-items:center;
                        justify-content:center;flex-direction:column;gap:8px;
                        color:rgba(255,255,255,.25);">
                <i class="ph ph-image" style="font-size:36px;"></i>
                <span style="font-size:11px;letter-spacing:.04em;">Sem mídia</span>
            </div>`;
    } else if (isCarousel) {
        mediaInner = buildCarouselHTML(midias);
    } else {
        const m = midias[0];
        if (m.type === 'video') {
            const poster = m.url_thumbnail ? `poster="${m.url_thumbnail}"` : '';
            mediaInner = `
                <video src="${m.url_media}"
                    controls playsinline autoplay muted loop ${poster}
                    style="position:absolute;inset:0;width:100%;height:100%;
                           object-fit:cover;display:block;"></video>`;
        } else {
            mediaInner = `
                <img src="${m.url_media}"
                    alt="${_agEsc2(postagem.title || '')}"
                    style="position:absolute;inset:0;width:100%;height:100%;
                           object-fit:cover;display:block;"
                    loading="eager">`;
        }
    }

    // ── Legenda ───────────────────────────────────────────────
    const captionHTML = postagem.captions
        ? `<p class="ct-modal-caption">${_agEscapeHTML(postagem.captions)}</p>`
        : `<p class="ct-modal-caption-empty">Sem legenda cadastrada.</p>`;

    // ── Datas ─────────────────────────────────────────────────
    const dataProducao     = _agTempoRelativo(postagem.aprovado_adm_em);
    const dataAgendamento  = _agFormatarData(postagem.data_agendamento);
    const colaboradorNome  = postagem.colaboradores?.nome || '—';

    // ── Backdrop ──────────────────────────────────────────────
    const backdrop = document.createElement('div');
    backdrop.className = 'ct-modal-backdrop';
    backdrop.id        = 'ag-modal-backdrop';

    backdrop.innerHTML = `
        <div class="ct-modal" id="ag-modal" role="dialog" aria-modal="true"
             aria-label="${_agEsc2(postagem.title || 'Postagem #' + postagem.id)}">

            <!-- ── COLUNA MÍDIA ── -->
            <div class="ct-modal-media-wrap">
                ${mediaInner}
                <button class="ct-modal-close-float" id="ag-modal-close-float" aria-label="Fechar">
                    <i class="ph ph-x"></i>
                </button>
            </div>

            <!-- ── COLUNA PAINEL ── -->
            <div class="ct-modal-panel">

                <div class="ct-modal-panel-header">
                    <p class="ct-modal-panel-title">
                        ${_agEscapeHTML(postagem.title || 'Postagem #' + postagem.id)}
                        <span>#${postagem.id}</span>
                    </p>
                    <button class="ct-modal-close" id="ag-modal-close" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>

                <div class="ct-modal-scroll">
                    <div class="ct-modal-body">

                        <!-- Status -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Status</p>
                            <span class="ct-modal-status ${statusCfg.cls}">
                                ${statusCfg.label}
                            </span>
                        </div>

                        <!-- Legenda -->
                        <div class="ct-modal-section ct-caption-section">
                            <p class="ct-modal-section-label">Legenda</p>
                            ${captionHTML}
                        </div>

                        <!-- Informações -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Informações</p>

                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Tipo</span>
                                <span class="ct-modal-info-val">
                                    <i class="ph ${typeIcon}"></i>${typeLabel}
                                </span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Agendado para</span>
                                <span class="ct-modal-info-val ag-data-agendamento">
                                    ${postagem.data_agendamento
                                        ? `<i class="ph ph-calendar-check"></i>${dataAgendamento}`
                                        : '<span style="color:var(--text-4);font-style:italic;">Não definido</span>'}
                                </span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Produzido em</span>
                                <span class="ct-modal-info-val">${dataProducao}</span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Responsável</span>
                                <span class="ct-modal-info-val">${_agEscapeHTML(colaboradorNome)}</span>
                            </div>
                            ${isCarousel ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Mídias</span>
                                <span class="ct-modal-info-val">${midias.length} itens</span>
                            </div>` : ''}
                        </div>

                        <!-- Ações: apenas Editar e Download -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Ações</p>
                            <div class="ct-modal-actions">
                                <button class="ct-action-btn ct-action-btn--editar" data-acao="editar">
                                    <i class="ph ph-pencil-simple"></i> Editar legenda
                                </button>
                                <button class="ct-action-btn ct-action-btn--download" data-acao="download">
                                    <i class="ph ph-download-simple"></i> Download
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(backdrop);

    // ── Log de visualização ───────────────────────────────────
    logVisualizacao(postagem);

    // ── Listeners dos botões de ação ──────────────────────────
    backdrop.querySelectorAll('.ct-action-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const acao    = btn.dataset.acao;
            const modalEl = document.getElementById('ag-modal');

            if (acao === 'editar') {
                acaoEditarLegenda(postagem, modalEl);
            } else if (acao === 'download') {
                acaoDownload(postagem);
            }
        });
    });

    document.body.style.overflow = 'hidden';

    // ── Inicializa carrossel ──────────────────────────────────
    if (isCarousel && midias.length > 0) {
        const carouselEl = backdrop.querySelector('.ct-carousel');
        if (carouselEl) {
            requestAnimationFrame(() => initCarousel(carouselEl, midias));
        }
    }

    // ── Fechar ────────────────────────────────────────────────
    backdrop.querySelector('#ag-modal-close').addEventListener('click', agFecharModal);
    const floatClose = backdrop.querySelector('#ag-modal-close-float');
    if (floatClose) floatClose.addEventListener('click', agFecharModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) agFecharModal(); });

    _agEscListener = e => { if (e.key === 'Escape') agFecharModal(); };
    document.addEventListener('keydown', _agEscListener);
}

let _agEscListener = null;

function agFecharModal() {
    const backdrop = document.getElementById('ag-modal-backdrop');
    if (!backdrop) return;
    backdrop.querySelectorAll('video').forEach(v => v.pause());
    backdrop.remove();
    document.body.style.overflow = '';
    if (_agEscListener) {
        document.removeEventListener('keydown', _agEscListener);
        _agEscListener = null;
    }
}

// ── Helpers locais ────────────────────────────────────────────
function _agParseMidias2(media) {
    try {
        const arr = typeof media === 'string' ? JSON.parse(media) : (media || []);
        return arr.slice().sort((a, b) =>
            parseInt(a.sequencia || '0', 10) - parseInt(b.sequencia || '0', 10)
        );
    } catch { return []; }
}

function _agEscapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _agEsc2(str) { return _agEscapeHTML(str); }