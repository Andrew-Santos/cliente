/* ══════════════════════════════════════
   agendamento.js  —  Orquestrador
   Carrega posts com status:
   APROVADO, AGENDADO, FALHOU, PROCESSANDO
══════════════════════════════════════ */

window._agendamentoPosts = [];
let _agPosts  = [];
let _agElRaiz = null;

async function renderAgendamento(el, conta) {
    _agElRaiz = el;
    _agPosts  = [];

    if (!conta?.id) {
        el.innerHTML = _agHtmlErro('Sessão inválida. Faça login novamente.');
        return;
    }

    el.innerHTML = _agHtmlShell();
    _agSetGridState('loading');

    const supabaseDb = typeof db !== 'undefined' ? db : window.db;

    if (!supabaseDb) {
        _agSetGridState('erro');
        console.error('[agendamento] db não encontrado');
        return;
    }

    try {
        const { data, error } = await supabaseDb
            .from('postagens')
            .select(`
                id, id_cliente, id_colaborador, status, type, title,
                media, captions, data_agendamento, aprovado_adm_em,
                aprovado_cliente_em,
                colaboradores ( nome )
            `)
            .eq('id_cliente', conta.id)
            .in('status', ['APROVADO', 'AGENDADO', 'FALHOU', 'PROCESSANDO'])
            .neq('type', 'STORIES')
            .order('data_agendamento', { ascending: true, nullsFirst: false });

        if (error) throw error;

        console.log('[agendamento] posts carregados:', data?.length, data);

        _agPosts = data || [];
        window._agendamentoPosts = _agPosts;

        if (_agPosts.length === 0) {
            _agSetGridState('vazio');
            return;
        }

        const grid = el.querySelector('#ag-grid');
        el.querySelector('#ag-state')?.remove();
        grid.style.display = 'grid';
        agRenderGrid(grid, _agPosts);

    } catch (e) {
        console.error('[agendamento] erro na query:', e);
        _agSetGridState('erro');
    }
}

function _agSetGridState(state) {
    const el   = _agElRaiz;
    const grid = el.querySelector('#ag-grid');
    el.querySelector('#ag-state')?.remove();
    if (grid) grid.style.display = 'none';

    const msgs = {
        loading: `<i class="ph ph-circle-notch ct-spin" style="font-size:28px;color:var(--text-3);"></i>
                  <span>Carregando agendamentos…</span>`,
        vazio:   `<div class="ct-empty-icon"><i class="ph ph-calendar-check"></i></div>
                  <span>Nenhum agendamento encontrado.</span>`,
        erro:    `<div class="ct-empty-icon" style="color:var(--danger);">
                      <i class="ph ph-warning"></i>
                  </div>
                  <span style="color:var(--danger);">Erro ao carregar. Tente recarregar a página.</span>`,
    };

    const cls  = state === 'loading' ? 'ct-loading' : 'ct-empty';
    const wrap = el.querySelector('#ag-grid-wrap');
    if (wrap && msgs[state]) {
        wrap.insertAdjacentHTML('beforeend',
            `<div id="ag-state" class="${cls}">${msgs[state]}</div>`);
    }
}

function _agHtmlShell() {
    return `
        <div id="ag-grid-wrap">
            <div class="ct-grid" id="ag-grid" style="display:none;"></div>
        </div>`;
}

function _agHtmlErro(msg) {
    return `<div class="ct-empty" style="min-height:60vh;">
                <div class="ct-empty-icon" style="color:var(--danger);">
                    <i class="ph ph-warning"></i>
                </div>
                <span style="color:var(--danger);">${msg}</span>
            </div>`;
}