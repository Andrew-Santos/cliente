/* ══════════════════════════════════════
   conteudo-grid.js
   Renderiza o grid de capas estilo
   Instagram (proporção 3×4).
   Depende de: conteudo-modal.js
══════════════════════════════════════ */

// ── Mapa status → label + classe CSS ─────────────────────────
const STATUS_CONFIG = {
    EM_PLANEJAMENTO:       { label: 'Planejamento',      cls: 'planej'    },
    EM_DESENVOLVIMENTO:    { label: 'Desenvolvimento',   cls: 'planej'    },
    EM_ANALISE_DO_ADM:     { label: 'Em Análise',        cls: 'analise'   },
    EM_ANALISE_DO_CLIENTE: { label: 'Aguarda Aprovação', cls: 'analise'   },
    APROVADO:              { label: 'Aprovado',          cls: 'aprovado'  },
    REPROVADO:             { label: 'Reprovado',         cls: 'reprovado' },
    AGENDADO:              { label: 'Agendado',          cls: 'agendado'  },
    PUBLICADO:             { label: 'Publicado',         cls: 'publicado' },
    FALHOU:                { label: 'Falhou',            cls: 'reprovado' },
    ARQUIVADO:             { label: 'Arquivado',         cls: 'default'   },
    PROCESSANDO:           { label: 'Processando',       cls: 'analise'   },
};
/* ══════════════════════════════════════
   conteudo-grid.js
══════════════════════════════════════ */

const TYPE_BADGE_ICON = {
    CAROUSEL: 'ph-fill ph-stack',
    REELS:    'ph-fill ph-play',
};

function renderGrid(gridEl, posts) {
    gridEl.innerHTML = '';
    posts.forEach(post => {
        const card = _buildCard(post);
        card.addEventListener('click', () => abrirModal(post));
        gridEl.appendChild(card);
    });
}

function _buildCard(post) {
    const card = document.createElement('div');
    card.className = 'ct-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', post.title || `Postagem #${post.id}`);

    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });

    const midias  = _parseMidias(post.media);
    const primeira = midias[0] || null;

    // Thumbnail
    let thumbHTML = '';
    if (!primeira) {
        thumbHTML = `<div class="ct-card-no-media"><i class="ph ph-image"></i></div>`;
    } else if (primeira.type === 'video') {
        thumbHTML = `<video class="ct-card-video-thumb"
                        src="${primeira.url_media}#t=0.5"
                        muted playsinline preload="metadata"></video>`;
    } else {
        thumbHTML = `<img class="ct-card-thumb"
                        src="${primeira.url_media}"
                        alt="${_esc(post.title || '')}"
                        loading="lazy" draggable="false">`;
    }

    // Overlay hover
    const overlayIcon = post.type === 'REELS' || (primeira?.type === 'video')
        ? 'ph-fill ph-play-circle'
        : 'ph-fill ph-magnifying-glass-plus';

    const overlayHTML = `<div class="ct-card-overlay"><i class="ph ${overlayIcon}"></i></div>`;

    // Badge de tipo (canto sup. direito) — sem status
    let typeBadgeHTML = '';
    const typeIcon = TYPE_BADGE_ICON[post.type];
    if (typeIcon) {
        typeBadgeHTML = `<div class="ct-card-type"><i class="ph ${typeIcon}"></i></div>`;
    }

    card.innerHTML = thumbHTML + overlayHTML + typeBadgeHTML;
    return card;
}

function _parseMidias(media) {
    try {
        const arr = typeof media === 'string' ? JSON.parse(media) : (media || []);
        return arr.slice().sort((a, b) => parseInt(a.sequencia||'0') - parseInt(b.sequencia||'0'));
    } catch { return []; }
}

function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}