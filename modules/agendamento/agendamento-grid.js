/* ══════════════════════════════════════
   agendamento-grid.js
   Grid de capas — mesmo padrão do conteudo-grid.js
   Ao clicar abre agendamento-modal.js
══════════════════════════════════════ */

const AG_TYPE_BADGE_ICON = {
    CAROUSEL: 'ph-fill ph-stack',
    REELS:    'ph-fill ph-play',
    STORIES:  'ph-fill ph-squares-four',
};

function agRenderGrid(gridEl, posts) {
    gridEl.innerHTML = '';
    posts.forEach(post => {
        const card = _agBuildCard(post);
        card.addEventListener('click', () => agAbrirModal(post));
        gridEl.appendChild(card);
    });
}

function _agBuildCard(post) {
    const card = document.createElement('div');
    card.className = 'ct-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', post.title || `Postagem #${post.id}`);

    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });

    const midias   = _agParseMidias(post.media);
    const primeira = midias[0] || null;

    // ── Thumbnail ─────────────────────────────────────────────
    let thumbHTML = '';

    if (!primeira) {
        thumbHTML = `<div class="ct-card-no-media"><i class="ph ph-image"></i></div>`;

    } else if (primeira.type === 'video') {
        if (primeira.url_thumbnail) {
            thumbHTML = `
                <img class="ct-card-thumb"
                     src="${primeira.url_thumbnail}"
                     alt="${_agEsc(post.title || '')}"
                     loading="lazy" draggable="false">`;
        } else {
            thumbHTML = `
                <video class="ct-card-video-thumb"
                       src="${primeira.url_media}#t=0.5"
                       muted playsinline preload="metadata"></video>`;
        }
    } else {
        thumbHTML = `
            <img class="ct-card-thumb"
                 src="${primeira.url_media}"
                 alt="${_agEsc(post.title || '')}"
                 loading="lazy" draggable="false">`;
    }

    // ── Overlay hover ──────────────────────────────────────────
    const overlayIcon = (post.type === 'REELS' || primeira?.type === 'video')
        ? 'ph-fill ph-play-circle'
        : 'ph-fill ph-magnifying-glass-plus';

    const overlayHTML = `<div class="ct-card-overlay"><i class="ph ${overlayIcon}"></i></div>`;

    // ── Badge de tipo ──────────────────────────────────────────
    let typeBadgeHTML = '';
    const typeIcon = AG_TYPE_BADGE_ICON[post.type];
    if (typeIcon) {
        typeBadgeHTML = `<div class="ct-card-type"><i class="ph ${typeIcon}"></i></div>`;
    }

    // ── Badge de status no card ────────────────────────────────
    const statusCfg = AG_STATUS_CARD[post.status];
    const statusBadgeHTML = statusCfg
        ? `<div class="ag-card-status ag-card-status--${statusCfg.cls}">
               ${statusCfg.label}
           </div>`
        : '';

    card.innerHTML = thumbHTML + overlayHTML + typeBadgeHTML + statusBadgeHTML;
    return card;
}

// Status visíveis no card (badge na parte inferior)
const AG_STATUS_CARD = {
    APROVADO:    { label: 'Aprovado',    cls: 'aprovado'    },
    AGENDADO:    { label: 'Agendado',    cls: 'agendado'    },
    FALHOU:      { label: 'Falhou',      cls: 'falhou'      },
    PROCESSANDO: { label: 'Processando', cls: 'processando' },
};

function _agParseMidias(media) {
    try {
        const arr = typeof media === 'string' ? JSON.parse(media) : (media || []);
        return arr.slice().sort((a, b) =>
            parseInt(a.sequencia || '0', 10) - parseInt(b.sequencia || '0', 10)
        );
    } catch { return []; }
}

function _agEsc(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}