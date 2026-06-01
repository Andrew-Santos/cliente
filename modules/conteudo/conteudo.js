/* ══════════════════════════════════════
   conteudo.js  v2  —  Orquestrador
   Carrega TODOS os posts do cliente
   (sem filtro de status).
══════════════════════════════════════ */

window._posts = [];
let _posts = window._posts;
let _elRaiz = null;

async function render(el, conta) {
    _elRaiz = el;
    _posts  = [];

    if (!conta?.id) {
        el.innerHTML = _htmlErro('Sessão inválida. Faça login novamente.');
        return;
    }

    el.innerHTML = _htmlShell(conta);
    _setGridState('loading');

    const supabaseDb = typeof db !== 'undefined' ? db : window.db;

    if (!supabaseDb) {
        _setGridState('erro');
        console.error('[conteudo] db não encontrado');
        return;
    }

    try {
        // ── Busca posts com join para nome do colaborador ──
        const { data, error } = await supabaseDb
            .from('postagens')
            .select(`
                id, id_cliente, id_colaborador, status, type, title,
                media, captions, data_agendamento, aprovado_adm_em,
                colaboradores ( nome )
            `)
            .eq('id_cliente', conta.id)
.eq('status', 'EM_ANALISE_DO_CLIENTE')
.neq('type', 'STORIES')
.order('aprovado_adm_em', { ascending: true });

        if (error) throw error;

        console.log('[conteudo] posts carregados:', data?.length, data);

        _posts = data || [];
window._posts = _posts;

        if (_posts.length === 0) {
            _setGridState('vazio');
            return;
        }

        const grid = el.querySelector('#ct-grid');
        el.querySelector('#ct-state')?.remove();
        grid.style.display = 'grid';
        renderGrid(grid, _posts);

    } catch (e) {
        console.error('[conteudo] erro na query:', e);
        _setGridState('erro');
    }
}

function _setGridState(state) {
    const el   = _elRaiz;
    const grid = el.querySelector('#ct-grid');
    el.querySelector('#ct-state')?.remove();
    if (grid) grid.style.display = 'none';

    const msgs = {
        loading: `<i class="ph ph-circle-notch ct-spin" style="font-size:28px;color:var(--text-3);"></i>
                  <span>Carregando conteúdos…</span>`,
        vazio:   `<div class="ct-empty-icon"><i class="ph ph-images"></i></div>
                  <span>Nenhum conteúdo encontrado.</span>`,
        erro:    `<div class="ct-empty-icon" style="color:var(--danger);">
                      <i class="ph ph-warning"></i>
                  </div>
                  <span style="color:var(--danger);">Erro ao carregar. Tente recarregar a página.</span>`,
    };

    const cls  = state === 'loading' ? 'ct-loading' : 'ct-empty';
    const wrap = el.querySelector('#ct-grid-wrap');
    if (wrap && msgs[state]) {
        wrap.insertAdjacentHTML('beforeend',
            `<div id="ct-state" class="${cls}">${msgs[state]}</div>`);
    }
}

function _htmlShell(conta) {
    return `
        <div id="ct-grid-wrap">
            <div class="ct-grid" id="ct-grid" style="display:none;"></div>
        </div>`;
}

function _htmlErro(msg) {
    return `<div class="ct-empty" style="min-height:60vh;">
                <div class="ct-empty-icon" style="color:var(--danger);">
                    <i class="ph ph-warning"></i>
                </div>
                <span style="color:var(--danger);">${msg}</span>
            </div>`;
}