/* ══════════════════════════════════════
   drive-grid.js
   Grid de mídias do Drive.
   Separa por data de captura.
   Paginação de 50 em 50.
══════════════════════════════════════ */

// ── Formata cabeçalho de data ────────────────────────────────
// Ex: "Segunda-feira, 08 de junho de 2026"
function _driveFormatarCabecalhoData(dateStr) {
    if (!dateStr) return 'Sem data';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day:     '2-digit',
            month:   'long',
            year:    'numeric',
        }).replace(/^\w/, c => c.toUpperCase());
    } catch { return 'Sem data'; }
}

// ── Chave de agrupamento (YYYY-MM-DD) ────────────────────────
function _driveChaveData(dateStr) {
    if (!dateStr) return 'sem-data';
    try {
        return new Date(dateStr).toISOString().slice(0, 10);
    } catch { return 'sem-data'; }
}

// ── Agrupa arquivos por data de captura ──────────────────────
function _driveAgruparPorData(arquivos) {
    const grupos = new Map();
    arquivos.forEach(arq => {
        const chave = _driveChaveData(arq.data_de_captura);
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave).push(arq);
    });
    return grupos; // já ordenado pois os dados vêm desc do banco
}

// ── Renderiza o grid completo com grupos de data ─────────────
function driveRenderGrid(el, arquivos, total, pagina, conta) {
    // Remove seções anteriores
    el.querySelector('#drive-grid-section')?.remove();
    el.querySelector('#drive-pagination')?.remove();
    el.querySelector('#drive-state')?.remove();

    const wrap = el.querySelector('#drive-wrap');
    if (!wrap) return;

    const grupos   = _driveAgruparPorData(arquivos);
    const totalPag = Math.ceil(total / _DRIVE_POR_PAGINA);

    // ── Seção do grid ──────────────────────────────────────────
    const section = document.createElement('div');
    section.id = 'drive-grid-section';

    grupos.forEach((itens, chave) => {
        // Cabeçalho de data
        const header = document.createElement('div');
        header.className = 'drive-date-header';
        header.innerHTML = `
            <span class="drive-date-label">
                ${_driveFormatarCabecalhoData(itens[0].data_de_captura)}
            </span>
            <span class="drive-date-count">${itens.length} ${itens.length === 1 ? 'arquivo' : 'arquivos'}</span>`;
        section.appendChild(header);

        // Grid do grupo
        const grid = document.createElement('div');
        grid.className = 'drive-grid';
        itens.forEach(arq => {
            const card = _driveBuildCard(arq);
            grid.appendChild(card);
        });
        section.appendChild(grid);
    });

    wrap.appendChild(section);

    // ── Paginação ──────────────────────────────────────────────
    if (totalPag > 1) {
        const pag = _driveBuildPaginacao(pagina, totalPag, conta);
        wrap.appendChild(pag);
    }
}

// ── Card individual ──────────────────────────────────────────
function _driveBuildCard(arq) {
    const card = document.createElement('div');
    card.className = 'drive-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', arq.name || `Arquivo #${arq.id}`);

    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });

    const isVideo = arq.file_type === 'video' || (arq.mime_type || '').startsWith('video/');

    // ── Thumbnail ──────────────────────────────────────────────
    let thumbHTML = '';
    if (arq.url_thumbnail) {
        thumbHTML = `<img class="drive-card-thumb"
                          src="${_driveEsc(arq.url_thumbnail)}"
                          alt="${_driveEsc(arq.name || '')}"
                          loading="lazy" draggable="false">`;
    } else if (isVideo && arq.url_media) {
        thumbHTML = `<video class="drive-card-thumb"
                           src="${_driveEsc(arq.url_media)}#t=0.5"
                           muted playsinline preload="metadata"></video>`;
    } else if (arq.url_media) {
        thumbHTML = `<img class="drive-card-thumb"
                          src="${_driveEsc(arq.url_media)}"
                          alt="${_driveEsc(arq.name || '')}"
                          loading="lazy" draggable="false">`;
    } else {
        thumbHTML = `<div class="drive-card-no-media">
                         <i class="ph ph-file"></i>
                     </div>`;
    }

    // ── Overlay ────────────────────────────────────────────────
    const overlayIcon = isVideo ? 'ph-fill ph-play-circle' : 'ph-fill ph-magnifying-glass-plus';
    const overlayHTML = `<div class="ct-card-overlay"><i class="ph ${overlayIcon}"></i></div>`;

    // ── Badge de tipo ──────────────────────────────────────────
    const typeBadgeHTML = isVideo
        ? `<div class="ct-card-type"><i class="ph ph-fill ph-play"></i></div>`
        : '';

    card.innerHTML = thumbHTML + overlayHTML + typeBadgeHTML;

    card.addEventListener('click', () => driveAbrirModal(arq));
    return card;
}

// ── Paginação ─────────────────────────────────────────────────
function _driveBuildPaginacao(paginaAtual, totalPag, conta) {
    const wrap = document.createElement('div');
    wrap.id        = 'drive-pagination';
    wrap.className = 'drive-pagination';

    // Gera intervalo de páginas visíveis
    const paginas = _drivePaginasVisiveis(paginaAtual, totalPag);

    let html = `
        <button class="drive-pag-btn drive-pag-prev"
                ${paginaAtual === 1 ? 'disabled' : ''}
                aria-label="Página anterior">
            <i class="ph ph-caret-left"></i>
        </button>
        <div class="drive-pag-nums">`;

    paginas.forEach(p => {
        if (p === '…') {
            html += `<span class="drive-pag-ellipsis">…</span>`;
        } else {
            html += `<button class="drive-pag-num ${p === paginaAtual ? 'active' : ''}"
                             data-pag="${p}">${p}</button>`;
        }
    });

    html += `</div>
        <button class="drive-pag-btn drive-pag-next"
                ${paginaAtual === totalPag ? 'disabled' : ''}
                aria-label="Próxima página">
            <i class="ph ph-caret-right"></i>
        </button>`;

    wrap.innerHTML = html;

    // ── Eventos ────────────────────────────────────────────────
    const ir = p => {
        if (p < 1 || p > totalPag || p === paginaAtual) return;
        _driveSetState('loading');
        _driveElRaiz.querySelector('#drive-grid-section')?.remove();
        _driveElRaiz.querySelector('#drive-pagination')?.remove();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        _driveCarregarPagina(conta, p);
    };

    wrap.querySelector('.drive-pag-prev')
        .addEventListener('click', () => ir(paginaAtual - 1));
    wrap.querySelector('.drive-pag-next')
        .addEventListener('click', () => ir(paginaAtual + 1));
    wrap.querySelectorAll('.drive-pag-num').forEach(btn => {
        btn.addEventListener('click', () => ir(parseInt(btn.dataset.pag, 10)));
    });

    return wrap;
}

// Páginas visíveis com reticências
function _drivePaginasVisiveis(atual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const arr = [];
    const push = p => { if (!arr.includes(p)) arr.push(p); };

    push(1);
    if (atual > 3) arr.push('…');
    for (let i = Math.max(2, atual - 1); i <= Math.min(total - 1, atual + 1); i++) push(i);
    if (atual < total - 2) arr.push('…');
    push(total);

    return arr;
}

// ── Helper escape ─────────────────────────────────────────────
function _driveEsc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}