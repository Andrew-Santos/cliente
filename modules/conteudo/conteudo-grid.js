/* ══════════════════════════════════════
   conteudo-grid.js  v2
   Grid de capas estilo Instagram (3×4).
   Reels: usa url_thumbnail como capa;
   fallback para vídeo se não houver.
   Depende de: conteudo-modal.js
══════════════════════════════════════ */

const TYPE_BADGE_ICON = {
    CAROUSEL: 'ph-fill ph-stack',
    REELS:    'ph-fill ph-play',
    STORIES:  'ph-fill ph-squares-four',
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

    const midias   = _parseMidias(post.media);
    const primeira = midias[0] || null;

    // ── Thumbnail ────────────────────────────────────────────
    let thumbHTML = '';

    if (!primeira) {
        thumbHTML = `<div class="ct-card-no-media"><i class="ph ph-image"></i></div>`;

    } else if (primeira.type === 'video') {
        // Prefere url_thumbnail (capa); fallback para frame do vídeo
        if (primeira.url_thumbnail) {
            thumbHTML = `
                <img class="ct-card-thumb"
                     src="${primeira.url_thumbnail}"
                     alt="${_esc(post.title || '')}"
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
                 alt="${_esc(post.title || '')}"
                 loading="lazy" draggable="false">`;
    }

    // ── Overlay hover ────────────────────────────────────────
    const overlayIcon = (post.type === 'REELS' || primeira?.type === 'video')
        ? 'ph-fill ph-play-circle'
        : 'ph-fill ph-magnifying-glass-plus';

    const overlayHTML = `<div class="ct-card-overlay"><i class="ph ${overlayIcon}"></i></div>`;

    // ── Badge de tipo (canto sup. direito) ───────────────────
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
        return arr.slice().sort((a, b) =>
            parseInt(a.sequencia || '0', 10) - parseInt(b.sequencia || '0', 10)
        );
    } catch { return []; }
}

function _esc(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}