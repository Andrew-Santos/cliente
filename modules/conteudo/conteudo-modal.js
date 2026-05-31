/* ══════════════════════════════════════
   conteudo-modal.js
   Modal de visualização de postagem:
   mídia (simples ou carrossel) +
   legenda + 4 botões de ação.
   Depende de: conteudo-carousel.js
══════════════════════════════════════ */

// ── Mapa de labels e ícones de status ────────────────────────
const STATUS_MODAL = {
    EM_PLANEJAMENTO:       { label: 'Em Planejamento',       cls: 'planej'   },
    EM_DESENVOLVIMENTO:    { label: 'Em Desenvolvimento',    cls: 'planej'   },
    EM_ANALISE_DO_ADM:     { label: 'Em Análise (Adm)',      cls: 'analise'  },
    EM_ANALISE_DO_CLIENTE: { label: 'Aguardando sua Aprovação', cls: 'analise' },
    APROVADO:              { label: 'Aprovado',              cls: 'aprovado' },
    REPROVADO:             { label: 'Reprovado',             cls: 'reprovado'},
    AGENDADO:              { label: 'Agendado',              cls: 'agendado' },
    PUBLICADO:             { label: 'Publicado',             cls: 'publicado'},
    FALHOU:                { label: 'Falhou',                cls: 'reprovado'},
    ARQUIVADO:             { label: 'Arquivado',             cls: 'default'  },
    PROCESSANDO:           { label: 'Processando',           cls: 'analise'  },
};
/* ══════════════════════════════════════
   conteudo-modal.js
   Layout: coluna única, scroll livre.
   Mídia 3×4 fixa no topo, depois
   legenda, infos, botões empilhados.
══════════════════════════════════════ */

const TYPE_ICON = {
    FEED:     'ph-image-square',
    REELS:    'ph-film-strip',
    STORIES:  'ph-squares-four',
    CAROUSEL: 'ph-images',
};

const TYPE_LABEL = {
    FEED: 'Feed', REELS: 'Reels', STORIES: 'Stories', CAROUSEL: 'Carrossel',
};

function abrirModal(postagem) {
    fecharModal();

    const midias     = _parseMidias(postagem.media);
    const isCarousel = postagem.type === 'CAROUSEL' || midias.length > 1;
    const typeIcon   = TYPE_ICON[postagem.type]  || 'ph-image';
    const typeLabel  = TYPE_LABEL[postagem.type] || postagem.type || '—';

    // ── Bloco de mídia ───────────────────────────────────────
    let mediaInner;
    if (midias.length === 0) {
        mediaInner = `
            <div style="width:100%;height:100%;display:flex;align-items:center;
                        justify-content:center;flex-direction:column;gap:8px;
                        color:rgba(255,255,255,.3);">
                <i class="ph ph-image" style="font-size:40px;"></i>
                <span style="font-size:12px;">Sem mídia</span>
            </div>`;
    } else if (isCarousel) {
        mediaInner = buildCarouselHTML(midias);
    } else {
        const m = midias[0];
        if (m.type === 'video') {
            mediaInner = `<video src="${m.url_media}" controls playsinline autoplay muted
                                 style="width:100%;height:100%;object-fit:contain;display:block;"></video>`;
        } else {
            mediaInner = `<img src="${m.url_media}" alt="${_esc(postagem.title||'')}"
                               style="width:100%;height:100%;object-fit:contain;display:block;" loading="lazy">`;
        }
    }

    // ── Legenda ──────────────────────────────────────────────
    const captionHTML = postagem.captions
        ? `<p class="ct-modal-caption">${_escapeHTML(postagem.captions)}</p>`
        : `<p class="ct-modal-caption-empty">Sem legenda cadastrada.</p>`;

    // ── Data formatada ───────────────────────────────────────
    const dataFmt = postagem.criado_em
        ? new Date(postagem.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
        : '—';

    // ── Montar backdrop ──────────────────────────────────────
    const backdrop = document.createElement('div');
    backdrop.className = 'ct-modal-backdrop';
    backdrop.id = 'ct-modal-backdrop';

    backdrop.innerHTML = `
        <div class="ct-modal" id="ct-modal" role="dialog" aria-modal="true">

            <!-- Botão fechar flutuante -->
            <button class="ct-modal-close" id="ct-modal-close" aria-label="Fechar">
                <i class="ph ph-x"></i>
            </button>

            <!-- Scroll único -->
            <div class="ct-modal-scroll">

                <!-- 1. Mídia 3×4 -->
                <div class="ct-modal-media-wrap">
                    ${mediaInner}
                </div>

                <!-- 2. Corpo: legenda + infos + botões -->
                <div class="ct-modal-body">

                    <!-- Legenda -->
                    <div class="ct-modal-section">
                        <p class="ct-modal-section-label">Legenda</p>
                        ${captionHTML}
                    </div>

                    <!-- Informações -->
                    <div class="ct-modal-section">
                        <p class="ct-modal-section-label">Informações</p>
                        <div class="ct-modal-info-row">
                            <span class="ct-modal-info-key">ID</span>
                            <span class="ct-modal-info-val">#${postagem.id}</span>
                        </div>
                        <div class="ct-modal-info-row">
                            <span class="ct-modal-info-key">Tipo</span>
                            <span class="ct-modal-info-val">
                                <i class="ph ${typeIcon}" style="font-size:13px;margin-right:4px;"></i>${typeLabel}
                            </span>
                        </div>
                        <div class="ct-modal-info-row">
                            <span class="ct-modal-info-key">Criado em</span>
                            <span class="ct-modal-info-val">${dataFmt}</span>
                        </div>
                        ${postagem.title ? `
                        <div class="ct-modal-info-row">
                            <span class="ct-modal-info-key">Título</span>
                            <span class="ct-modal-info-val">${_escapeHTML(postagem.title)}</span>
                        </div>` : ''}
                    </div>

                    <!-- Botões -->
                    <div class="ct-modal-actions">
                        <button class="ct-action-btn ct-action-btn--aprovar"  data-acao="aprovar">
                            <i class="ph ph-check-circle"></i> Aprovar
                        </button>
                        <button class="ct-action-btn ct-action-btn--recusar"  data-acao="recusar">
                            <i class="ph ph-x-circle"></i> Recusar
                        </button>
                        <button class="ct-action-btn ct-action-btn--editar"   data-acao="editar">
                            <i class="ph ph-pencil-simple"></i> Editar
                        </button>
                        <button class="ct-action-btn ct-action-btn--download" data-acao="download">
                            <i class="ph ph-download-simple"></i> Download
                        </button>
                    </div>

                </div>
            </div>
        </div>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    if (isCarousel && midias.length > 0) {
        const carouselEl = backdrop.querySelector('.ct-carousel');
        if (carouselEl) initCarousel(carouselEl, midias);
    }

    backdrop.querySelector('#ct-modal-close').addEventListener('click', fecharModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) fecharModal(); });

    _escListener = e => { if (e.key === 'Escape') fecharModal(); };
    document.addEventListener('keydown', _escListener);

    backdrop.querySelectorAll('.ct-action-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            console.log(`[conteudo] ação "${btn.dataset.acao}" #${postagem.id}`);
            // TODO: implementar ações
        });
    });
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
        return arr.slice().sort((a, b) => parseInt(a.sequencia||'0',10) - parseInt(b.sequencia||'0',10));
    } catch { return []; }
}

function _escapeHTML(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _esc(str) { return _escapeHTML(str); }