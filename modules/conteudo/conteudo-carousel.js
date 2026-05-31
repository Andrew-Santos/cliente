/* ══════════════════════════════════════
   conteudo-carousel.js
   Carrossel estilo Instagram:
   slides lado a lado, sem gap, com
   swipe touch + setas + dots.
══════════════════════════════════════ */

/**
 * Inicializa o carrossel num container já no DOM.
 * @param {HTMLElement} container — elemento .ct-carousel
 * @param {Array} midias — array de { type, url_media, sequencia }
 */
function initCarousel(container, midias) {
    let current = 0;
    const total  = midias.length;

    const track = container.querySelector('.ct-carousel-track');
    const dots  = container.querySelectorAll('.ct-carousel-dot');
    const prev  = container.querySelector('.ct-carousel-arrow--prev');
    const next  = container.querySelector('.ct-carousel-arrow--next');

    // ── Navegar para índice ──────────────────────────────────
    function goTo(idx) {
        if (idx < 0 || idx >= total) return;
        current = idx;

        track.style.transform = `translateX(-${current * 100}%)`;

        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        if (prev) prev.disabled = current === 0;
        if (next) next.disabled = current === total - 1;

        // Pausa vídeos que saem de cena; play no atual
        container.querySelectorAll('.ct-carousel-slide video').forEach((v, i) => {
            if (i === current) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    }

    // ── Setas ────────────────────────────────────────────────
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });

    // ── Dots ─────────────────────────────────────────────────
    dots.forEach((d, i) => d.addEventListener('click', e => { e.stopPropagation(); goTo(i); }));

    // ── Swipe touch ──────────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging  = false;

    container.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging  = false;
    }, { passive: true });

    container.addEventListener('touchmove', e => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;

        // Bloqueio: só captura se gesto for mais horizontal que vertical
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
            isDragging = true;
            // Arrastar em tempo real (feedback visual)
            const offset = (-current * 100) + (dx / container.offsetWidth * 100);
            track.style.transition = 'none';
            track.style.transform  = `translateX(${offset}%)`;
        }
    }, { passive: true });

    container.addEventListener('touchend', e => {
        track.style.transition = '';
        if (!isDragging) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const threshold = container.offsetWidth * 0.2;

        if (dx < -threshold) goTo(current + 1);
        else if (dx > threshold) goTo(current - 1);
        else goTo(current); // volta para posição atual
    });

    // ── Drag mouse (desktop) ─────────────────────────────────
    let mouseStartX  = 0;
    let mouseDragging = false;

    container.addEventListener('mousedown', e => {
        mouseStartX  = e.clientX;
        mouseDragging = true;
        track.style.transition = 'none';
    });

    container.addEventListener('mousemove', e => {
        if (!mouseDragging) return;
        const dx = e.clientX - mouseStartX;
        const offset = (-current * 100) + (dx / container.offsetWidth * 100);
        track.style.transform = `translateX(${offset}%)`;
    });

    container.addEventListener('mouseup', e => {
        if (!mouseDragging) return;
        track.style.transition = '';
        mouseDragging = false;
        const dx = e.clientX - mouseStartX;
        const threshold = container.offsetWidth * 0.2;

        if (dx < -threshold) goTo(current + 1);
        else if (dx > threshold) goTo(current - 1);
        else goTo(current);
    });

    container.addEventListener('mouseleave', e => {
        if (!mouseDragging) return;
        track.style.transition = '';
        mouseDragging = false;
        goTo(current);
    });

    // ── Estado inicial ───────────────────────────────────────
    goTo(0);
}

/**
 * Constrói o HTML completo do carrossel.
 * @param {Array} midias
 * @returns {string} HTML
 */
function buildCarouselHTML(midias) {
    const slides = midias.map(m => {
        if (m.type === 'video') {
            return `
                <div class="ct-carousel-slide">
                    <video src="${m.url_media}" playsinline muted loop preload="metadata"></video>
                    <i class="ph-fill ph-play-circle ct-carousel-play-icon"></i>
                </div>`;
        }
        return `
            <div class="ct-carousel-slide">
                <img src="${m.url_media}" alt="Slide ${m.sequencia}" loading="lazy" draggable="false">
            </div>`;
    }).join('');

    const dots = midias.map((_, i) =>
        `<span class="ct-carousel-dot${i === 0 ? ' active' : ''}"></span>`
    ).join('');

    const arrows = midias.length > 1 ? `
        <button class="ct-carousel-arrow ct-carousel-arrow--prev" aria-label="Anterior">
            <i class="ph ph-caret-left"></i>
        </button>
        <button class="ct-carousel-arrow ct-carousel-arrow--next" aria-label="Próximo">
            <i class="ph ph-caret-right"></i>
        </button>` : '';

    const dotsHTML = midias.length > 1
        ? `<div class="ct-carousel-dots">${dots}</div>`
        : '';

    return `
        <div class="ct-carousel">
            <div class="ct-carousel-track">${slides}</div>
            ${arrows}
            ${dotsHTML}
        </div>`;
}