/* ══════════════════════════════════════
   conteudo-modal.js  v4
   Layout desktop: mídia (esq) + painel (dir)
   Layout mobile: empilhado (coluna única)
   Depende de: conteudo-carousel.js,
               conteudo-aprovar.js,
               conteudo-acoes-extras.js
══════════════════════════════════════ */

const TYPE_ICON = {
    FEED:     'ph-image-square',
    REELS:    'ph-play',
    STORIES:  'ph-squares-four',
    CAROUSEL: 'ph ph-fill ph-stack',
};
const TYPE_LABEL = {
    FEED: 'Feed', REELS: 'Reels', STORIES: 'Stories', CAROUSEL: 'Carrossel',
};

const STATUS_MODAL = {
    EM_PLANEJAMENTO:       { label: 'Planejamento',           cls: 'planej'    },
    EM_DESENVOLVIMENTO:    { label: 'Em Desenvolvimento',     cls: 'planej'    },
    EM_ANALISE_DO_ADM:     { label: 'Em Análise',             cls: 'analise'   },
    EM_ANALISE_DO_CLIENTE: { label: 'Aguarda sua Aprovação',  cls: 'analise'   },
    APROVADO:              { label: 'Aprovado',               cls: 'aprovado'  },
    REPROVADO:             { label: 'Reprovado',              cls: 'reprovado' },
    AGENDADO:              { label: 'Agendado',               cls: 'agendado'  },
    PUBLICADO:             { label: 'Publicado',              cls: 'publicado' },
    FALHOU:                { label: 'Falhou',                 cls: 'reprovado' },
    ARQUIVADO:             { label: 'Arquivado',              cls: 'default'   },
    PROCESSANDO:           { label: 'Processando',            cls: 'analise'   },
};

function abrirModal(postagem) {
    fecharModal();

    const midias     = _parseMidias(postagem.media);
    const isCarousel = postagem.type === 'CAROUSEL' || midias.length > 1;
    const typeIcon   = TYPE_ICON[postagem.type]  || 'ph-image';
    const typeLabel  = TYPE_LABEL[postagem.type] || postagem.type || '—';

    const statusCfg  = STATUS_MODAL[postagem.status] || { label: postagem.status || '—', cls: 'default' };

    // ── Bloco de mídia ───────────────────────────────────────
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
                    alt="${_esc(postagem.title || '')}"
                    style="position:absolute;inset:0;width:100%;height:100%;
                           object-fit:cover;display:block;"
                    loading="eager">`;
        }
    }

    // ── Legenda ──────────────────────────────────────────────
    const captionHTML = postagem.captions
        ? `<p class="ct-modal-caption">${_escapeHTML(postagem.captions)}</p>`
        : `<p class="ct-modal-caption-empty">Sem legenda cadastrada.</p>`;

    // ── Tempo relativo ───────────────────────────────────────
    function tempoRelativo(dateStr) {
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

    const dataFmt = tempoRelativo(postagem.aprovado_adm_em);

    // ── Colaborador ──────────────────────────────────────────
    const colaboradorNome = postagem.colaboradores?.nome || '—';

    // ── Montar backdrop ──────────────────────────────────────
    const backdrop = document.createElement('div');
    backdrop.className = 'ct-modal-backdrop';
    backdrop.id        = 'ct-modal-backdrop';

    backdrop.innerHTML = `
        <div class="ct-modal" id="ct-modal" role="dialog" aria-modal="true"
             aria-label="${_esc(postagem.title || 'Postagem #' + postagem.id)}">

            <!-- ── COLUNA MÍDIA ── -->
            <div class="ct-modal-media-wrap">
                ${mediaInner}
                <!-- Fechar flutuante: só aparece no mobile via CSS -->
                <button class="ct-modal-close-float" id="ct-modal-close-float" aria-label="Fechar">
                    <i class="ph ph-x"></i>
                </button>
            </div>

            <!-- ── COLUNA PAINEL ── -->
            <div class="ct-modal-panel">

                <!-- Cabeçalho do painel -->
                <div class="ct-modal-panel-header">
                    <p class="ct-modal-panel-title">
                        ${_escapeHTML(postagem.title || 'Postagem #' + postagem.id)}
                        <span>#${postagem.id}</span>
                    </p>
                    <button class="ct-modal-close" id="ct-modal-close" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>

                <!-- Scroll do painel -->
                <div class="ct-modal-scroll">
                    <div class="ct-modal-body">

                        <!-- Status -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Status</p>
                            <span class="ct-modal-status ${statusCfg.cls}">
                                ${statusCfg.label}
                            </span>
                        </div>

                        <!-- Legenda — classe ct-caption-section para o editor inline -->
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
                                <span class="ct-modal-info-key">Produzido em</span>
                                <span class="ct-modal-info-val">${dataFmt}</span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Responsável</span>
                                <span class="ct-modal-info-val">${_escapeHTML(colaboradorNome)}</span>
                            </div>
                            ${isCarousel ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Mídias</span>
                                <span class="ct-modal-info-val">${midias.length} itens</span>
                            </div>` : ''}
                        </div>

                        <!-- Ações -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Ações</p>
                            <div class="ct-modal-actions">
                                <button class="ct-action-btn ct-action-btn--aprovar" data-acao="aprovar">
                                    <i class="ph ph-check-circle"></i> Aprovar
                                </button>
                                <button class="ct-action-btn ct-action-btn--recusar" data-acao="recusar">
                                    <i class="ph ph-x-circle"></i> Recusar
                                </button>
                                <button class="ct-action-btn ct-action-btn--editar" data-acao="editar">
                                    <i class="ph ph-pencil-simple"></i> Editar
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

    // ── Log de visualização ──────────────────────────────────
    logVisualizacao(postagem);

    // ── Listeners dos botões de ação ─────────────────────────
    backdrop.querySelectorAll('.ct-action-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const acao    = btn.dataset.acao;
            const modalEl = document.getElementById('ct-modal');

            if (acao === 'aprovar') {
                acaoAprovar(postagem, (postagemAtualizada) => {
                    fecharModal();
                    window._posts = (window._posts || []).filter(p => p.id !== postagemAtualizada.id);
                    const grid = document.getElementById('ct-grid');
                    if (grid) {
                        if (window._posts.length === 0) {
                            _setGridState('vazio');
                        } else {
                            renderGrid(grid, window._posts);
                        }
                    }
                });

            } else if (acao === 'editar') {
                acaoEditarLegenda(postagem, modalEl);

            } else if (acao === 'download') {
                acaoDownload(postagem);

            } else {
                console.log(`[conteudo] ação "${acao}" #${postagem.id}`);
            }
        });
    });

    document.body.style.overflow = 'hidden';

    // ── Inicializa carrossel após estar no DOM ───────────────
    if (isCarousel && midias.length > 0) {
        const carouselEl = backdrop.querySelector('.ct-carousel');
        if (carouselEl) {
            requestAnimationFrame(() => initCarousel(carouselEl, midias));
        }
    }

    // ── Fechar ───────────────────────────────────────────────
    backdrop.querySelector('#ct-modal-close').addEventListener('click', fecharModal);
    const floatClose = backdrop.querySelector('#ct-modal-close-float');
    if (floatClose) floatClose.addEventListener('click', fecharModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) fecharModal(); });

    _escListener = e => { if (e.key === 'Escape') fecharModal(); };
    document.addEventListener('keydown', _escListener);
}

let _escListener = null;

function fecharModal() {
    const backdrop = document.getElementById('ct-modal-backdrop');
    if (!backdrop) return;
    backdrop.querySelectorAll('video').forEach(v => v.pause());
    backdrop.remove();
    document.body.style.overflow = '';
    if (_escListener) {
        document.removeEventListener('keydown', _escListener);
        _escListener = null;
    }
}

function _parseMidias(media) {
    try {
        const arr = typeof media === 'string' ? JSON.parse(media) : (media || []);
        return arr.slice().sort((a, b) =>
            parseInt(a.sequencia || '0', 10) - parseInt(b.sequencia || '0', 10)
        );
    } catch { return []; }
}

function _escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _esc(str) { return _escapeHTML(str); }