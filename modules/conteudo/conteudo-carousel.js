/* ══════════════════════════════════════
   conteudo-carousel.js  v2
   Carrossel estilo Instagram:
   - Sem bug no último slide
   - Vídeos cobrem 100% do container (object-fit: cover)
   - Swipe touch + drag mouse + setas + dots
══════════════════════════════════════ */

/**
 * Constrói o HTML completo do carrossel.
 * @param {Array} midias — array de { type, url_media, sequencia }
 * @returns {string} HTML
 */
function buildCarouselHTML(midias) {
    const slides = midias.map((m, i) => {
        if (m.type === 'video') {
            const poster = m.url_thumbnail ? `poster="${m.url_thumbnail}"` : '';
            return `
                <div class="ct-carousel-slide" data-index="${i}">
                    <video src="${m.url_media}"
                        playsinline muted loop preload="metadata" ${poster}
                        style="width:100%;height:100%;object-fit:cover;display:block;"></video>
                </div>`;
        }
        return `
            <div class="ct-carousel-slide" data-index="${i}">
                <img src="${m.url_media}"
                    alt="Slide ${m.sequencia}"
                    loading="lazy"
                    draggable="false"
                    style="width:100%;height:100%;object-fit:cover;display:block;">
            </div>`;
    }).join('');

    const dotsHTML = midias.length > 1
        ? `<div class="ct-carousel-dots">
               ${midias.map((_, i) =>
                   `<span class="ct-carousel-dot${i === 0 ? ' active' : ''}" data-dot="${i}"></span>`
               ).join('')}
           </div>`
        : '';

    const arrowsHTML = midias.length > 1 ? `
        <button class="ct-carousel-arrow ct-carousel-arrow--prev" aria-label="Anterior" disabled>
            <i class="ph ph-caret-left"></i>
        </button>
        <button class="ct-carousel-arrow ct-carousel-arrow--next" aria-label="Próximo">
            <i class="ph ph-caret-right"></i>
        </button>` : '';

    const counterHTML = midias.length > 1
        ? `<div class="ct-carousel-counter">1 / ${midias.length}</div>`
        : '';

    return `
        <div class="ct-carousel">
            <div class="ct-carousel-track">${slides}</div>
            ${arrowsHTML}
            ${counterHTML}
            ${dotsHTML}
        </div>`;
}

/**
 * Inicializa o carrossel num container já no DOM.
 * @param {HTMLElement} carouselEl — elemento .ct-carousel
 * @param {Array} midias
 */
function initCarousel(carouselEl, midias) {
    const total  = midias.length;
    if (total === 0) return;

    let current   = 0;
    let dragging  = false;
    let startX    = 0;
    let currentTX = 0; // translate atual em px

    const track = carouselEl.querySelector('.ct-carousel-track');
    const prev  = carouselEl.querySelector('.ct-carousel-arrow--prev');
    const next  = carouselEl.querySelector('.ct-carousel-arrow--next');
    const dots  = carouselEl.querySelectorAll('.ct-carousel-dot');

    // ── Largura de um slide ───────────────────────────────────
    function slideW() { return carouselEl.offsetWidth; }

    // ── Ir para índice ────────────────────────────────────────
    function goTo(idx, animate = true) {
        if (idx < 0 || idx >= total) return;
        current   = idx;
        currentTX = -idx * slideW();

        track.style.transition = animate
            ? 'transform .32s cubic-bezier(.4,0,.2,1)'
            : 'none';
        track.style.transform = `translateX(${currentTX}px)`;

        // Dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        // Contador
        const counter = carouselEl.querySelector('.ct-carousel-counter');
        if (counter) counter.textContent = `${current + 1} / ${total}`;

        // Setas
        if (prev) prev.disabled = current === 0;
        if (next) next.disabled = current === total - 1;

        // Vídeos: pause todos, play no atual
        carouselEl.querySelectorAll('.ct-carousel-slide video').forEach((v, i) => {
            if (i === current) { v.play().catch(() => {}); }
            else               { v.pause(); }
        });
    }

    // ── Setas ─────────────────────────────────────────────────
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });

    // ── Dots ──────────────────────────────────────────────────
    dots.forEach(d => d.addEventListener('click', e => {
        e.stopPropagation();
        goTo(parseInt(d.dataset.dot, 10));
    }));

    // ── Helpers drag ──────────────────────────────────────────
    function onDragStart(x) {
        dragging = true;
        startX   = x;
        track.style.transition = 'none';
    }

    function onDragMove(x) {
        if (!dragging) return;
        const dx     = x - startX;
        const newTX  = currentTX + dx;
        // Resistência nas bordas
        const minTX  = -(total - 1) * slideW();
        const clamped = Math.max(minTX - 40, Math.min(40, newTX));
        track.style.transform = `translateX(${clamped}px)`;
    }

    function onDragEnd(x) {
        if (!dragging) return;
        dragging = false;
        const dx        = x - startX;
        const threshold = slideW() * 0.20;
        if (dx < -threshold)      goTo(current + 1);
        else if (dx > threshold)  goTo(current - 1);
        else                       goTo(current);      // snap de volta
    }

    // ── Touch ─────────────────────────────────────────────────
    let touchStartY = 0;
    let touchLocked = false; // true = scroll vertical

    carouselEl.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
        touchLocked = false;
        onDragStart(e.touches[0].clientX);
    }, { passive: true });

    carouselEl.addEventListener('touchmove', e => {
        if (touchLocked) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - touchStartY;

        if (Math.abs(dy) > Math.abs(dx) && !dragging) {
            // Scroll vertical — desativa drag horizontal
            touchLocked = true;
            dragging    = false;
            goTo(current); // restaura posição
            return;
        }
        if (Math.abs(dx) > 5) e.preventDefault(); // bloqueia scroll
        onDragMove(e.touches[0].clientX);
    }, { passive: false });

    carouselEl.addEventListener('touchend',   e => onDragEnd(e.changedTouches[0].clientX));
    carouselEl.addEventListener('touchcancel',e => onDragEnd(e.changedTouches[0].clientX));

    // ── Mouse ─────────────────────────────────────────────────
    carouselEl.addEventListener('mousedown', e => {
        e.preventDefault();
        onDragStart(e.clientX);
    });
    window.addEventListener('mousemove', e => { if (dragging) onDragMove(e.clientX); });
    window.addEventListener('mouseup',   e => { if (dragging) onDragEnd(e.clientX); });

    // ── Reajuste ao redimensionar ─────────────────────────────
    const ro = new ResizeObserver(() => goTo(current, false));
    ro.observe(carouselEl);

    // ── Estado inicial ────────────────────────────────────────
    goTo(0, false);
}