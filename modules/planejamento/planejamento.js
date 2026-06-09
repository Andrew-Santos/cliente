
let _plPosts  = [];
let _plElRaiz = null;

async function renderPlanejamento(el, conta) {
    _plElRaiz = el;
    _plPosts  = [];

    if (!conta?.id) {
        el.innerHTML = _plHtmlErro('Sessão inválida. Faça login novamente.');
        return;
    }

    el.innerHTML = _plHtmlShell();
    _plSetState('loading');

    const supabaseDb = typeof db !== 'undefined' ? db : window.db;
    if (!supabaseDb) {
        _plSetState('erro');
        console.error('[planejamento] db não encontrado');
        return;
    }

    try {
        const { data, error } = await supabaseDb
            .from('postagens')
            .select(`
                id, id_cliente, id_colaborador, status, type, title,
                roteiro, captions, criado_em, logs,
                colaboradores ( nome )
            `)
            .eq('id_cliente', conta.id)
            .eq('status', 'EM_PLANEJAMENTO')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        console.log('[planejamento] posts carregados:', data?.length, data);
        _plPosts = data || [];
        _plRenderConteudo(el, _plPosts);

    } catch (e) {
        console.error('[planejamento] erro na query:', e);
        _plSetState('erro');
    }
}

// ── Renderiza tabela (desktop) + cards (mobile) ───────────────
function _plRenderConteudo(el, posts) {
    el.querySelector('#pl-state')?.remove();
    const wrap = el.querySelector('#pl-wrap');
    if (!wrap) return;

    // Cabeçalho
    const header = document.createElement('div');
    header.className = 'pl-header';
    header.innerHTML = `
        <span class="pl-header-title">Planejamento</span>
        <span class="pl-header-count">${posts.length} ${posts.length === 1 ? 'item' : 'itens'}</span>`;
    wrap.appendChild(header);

    if (posts.length === 0) {
        wrap.insertAdjacentHTML('beforeend', `
            <div id="pl-state" class="ct-empty" style="min-height:calc(100vh - var(--h-header) - 120px);">
                <div class="ct-empty-icon"><i class="ph ph-kanban"></i></div>
                <span>Nenhum item em planejamento.</span>
            </div>`);
        return;
    }

    // ── DESKTOP: tabela ────────────────────────────────────────
    const tableWrap = document.createElement('div');
    tableWrap.className = 'pl-table-wrap';

    const table = document.createElement('table');
    table.className = 'pl-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th class="pl-col-id">#</th>
                <th class="pl-col-title">Título</th>
                <th class="pl-col-type">Tipo</th>
                <th class="pl-col-caption">Legenda</th>
                <th class="pl-col-date">Criado em</th>
                <th class="pl-col-action"></th>
            </tr>
        </thead>
        <tbody id="pl-tbody"></tbody>`;

    const tbody = table.querySelector('#pl-tbody');
    posts.forEach(post => {
        const tr = _plBuildRow(post);
        tbody.appendChild(tr);
    });

    tableWrap.appendChild(table);
    wrap.appendChild(tableWrap);

    // ── MOBILE: cards ──────────────────────────────────────────
    const cardsList = document.createElement('div');
    cardsList.className = 'pl-cards-list';
    cardsList.id = 'pl-cards-list';

    posts.forEach(post => {
        const card = _plBuildCard(post);
        cardsList.appendChild(card);
    });

    wrap.appendChild(cardsList);
}

// ── Linha da tabela (desktop) ─────────────────────────────────
function _plBuildRow(post) {
    const tr = document.createElement('tr');

    const captionText = post.captions
        ? post.captions.substring(0, 70) + (post.captions.length > 70 ? '…' : '')
        : 'Sem legenda';
    const captionCls = post.captions ? 'pl-caption-preview has-caption' : 'pl-caption-preview';

    const dataFormatada = post.criado_em
        ? new Date(post.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

    tr.innerHTML = `
        <td class="pl-col-id">#${post.id}</td>
        <td class="pl-col-title">
            <div class="pl-col-title-inner">${_plEsc(post.title || 'Sem título')}</div>
        </td>
        <td class="pl-col-type">${_plTypeBadgeHTML(post.type)}</td>
        <td class="pl-col-caption">
            <span class="${captionCls}">${_plEsc(captionText)}</span>
        </td>
        <td class="pl-col-date">
            <span class="pl-date-cell">${dataFormatada}</span>
        </td>
        <td class="pl-col-action">
            <i class="ph ph-caret-right pl-row-arrow"></i>
        </td>`;

    tr.addEventListener('click', () => {
        plAbrirModal(post, (postAtualizado) => {
            _plAtualizarLinha(tr, postAtualizado);
            // Atualiza card mobile correspondente
            const card = document.querySelector(`[data-pl-id="${post.id}"]`);
            if (card) _plAtualizarCard(card, postAtualizado);
        });
    });

    return tr;
}

// ── Card mobile ───────────────────────────────────────────────
function _plBuildCard(post) {
    const card = document.createElement('div');
    card.className = 'pl-card';
    card.dataset.plId = post.id;

    const captionText = post.captions
        ? post.captions.substring(0, 50) + (post.captions.length > 50 ? '…' : '')
        : 'Sem legenda';
    const captionCls = post.captions ? 'pl-card-caption has-caption' : 'pl-card-caption';

    const dataFormatada = post.criado_em
        ? new Date(post.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

    card.innerHTML = `
        <div class="pl-card-body">
            <div class="pl-card-top">
                <span class="pl-card-id">#${post.id}</span>
                <span class="pl-card-title">${_plEsc(post.title || 'Sem título')}</span>
                ${_plTypeBadgeHTML(post.type)}
            </div>
            <div class="pl-card-bottom">
                <span class="${captionCls}">${_plEsc(captionText)}</span>
                <span class="pl-card-date">${dataFormatada}</span>
            </div>
        </div>
        <i class="ph ph-caret-right pl-card-arrow"></i>`;

    card.addEventListener('click', () => {
        plAbrirModal(post, (postAtualizado) => {
            _plAtualizarCard(card, postAtualizado);
            // Atualiza linha desktop correspondente
            const tbody = document.querySelector('#pl-tbody');
            if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(tr => {
                    if (tr.querySelector('.pl-col-id')?.textContent === `#${post.id}`) {
                        _plAtualizarLinha(tr, postAtualizado);
                    }
                });
            }
        });
    });

    return card;
}

// ── Atualiza linha após edição ────────────────────────────────
function _plAtualizarLinha(tr, post) {
    const captionText = post.captions
        ? post.captions.substring(0, 70) + (post.captions.length > 70 ? '…' : '')
        : 'Sem legenda';
    const captionCls = post.captions ? 'pl-caption-preview has-caption' : 'pl-caption-preview';

    tr.querySelector('.pl-col-title-inner').textContent = post.title || 'Sem título';
    tr.querySelector('.pl-col-type').innerHTML = _plTypeBadgeHTML(post.type);
    tr.querySelector('.pl-col-caption span').className = captionCls;
    tr.querySelector('.pl-col-caption span').textContent = captionText;
}

// ── Atualiza card após edição ─────────────────────────────────
function _plAtualizarCard(card, post) {
    const captionText = post.captions
        ? post.captions.substring(0, 50) + (post.captions.length > 50 ? '…' : '')
        : 'Sem legenda';
    const captionCls = post.captions ? 'pl-card-caption has-caption' : 'pl-card-caption';

    card.querySelector('.pl-card-title').textContent = post.title || 'Sem título';
    const badgeEl = card.querySelector('.pl-type-badge');
    if (badgeEl) badgeEl.outerHTML = _plTypeBadgeHTML(post.type);
    card.querySelector('[class^="pl-card-caption"]').className = captionCls;
    card.querySelector('[class^="pl-card-caption"]').textContent = captionText;
}

// ── Estado loading/erro ───────────────────────────────────────
function _plSetState(state) {
    const el = _plElRaiz;
    el.querySelector('#pl-state')?.remove();

    const msgs = {
        loading: `<i class="ph ph-circle-notch ct-spin" style="font-size:28px;color:var(--text-3);"></i>
                  <span>Carregando planejamento…</span>`,
        erro:    `<div class="ct-empty-icon" style="color:var(--danger);">
                      <i class="ph ph-warning"></i>
                  </div>
                  <span style="color:var(--danger);">Erro ao carregar. Tente recarregar a página.</span>`,
    };

    const cls  = state === 'loading' ? 'ct-loading' : 'ct-empty';
    const wrap = el.querySelector('#pl-wrap');
    if (wrap && msgs[state]) {
        wrap.insertAdjacentHTML('beforeend',
            `<div id="pl-state" class="${cls}" style="min-height:calc(100vh - var(--h-header) - 80px);">${msgs[state]}</div>`);
    }
}

function _plHtmlShell() { return `<div id="pl-wrap"></div>`; }

function _plHtmlErro(msg) {
    return `<div class="ct-empty" style="min-height:60vh;">
                <div class="ct-empty-icon" style="color:var(--danger);">
                    <i class="ph ph-warning"></i>
                </div>
                <span style="color:var(--danger);">${msg}</span>
            </div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function _plEsc(str) {
    return String(str || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _plTypeBadgeHTML(type) {
    const labels = { FEED: 'Feed', REELS: 'Reels', STORIES: 'Stories', CAROUSEL: 'Carrossel' };
    const icons  = { FEED: 'ph-image-square', REELS: 'ph-play', STORIES: 'ph-squares-four', CAROUSEL: 'ph-fill ph-stack' };
    const label  = labels[type] || '—';
    const cls    = type ? `pl-type-badge--${type.toLowerCase()}` : 'pl-type-badge--null';
    const icon   = icons[type];
    return `<span class="pl-type-badge ${cls}">
        ${icon ? `<i class="ph ${icon}" style="font-size:11px;"></i>` : ''}
        ${_plEsc(label)}
    </span>`;
}