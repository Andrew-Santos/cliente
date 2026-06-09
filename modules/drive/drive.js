/* ══════════════════════════════════════
   drive.js  —  Orquestrador
   Carrega mídias do cliente logado
   da tabela drive_files, 50 por página,
   ordenadas por data_de_captura desc.
══════════════════════════════════════ */

window._drivePosts   = [];
let _driveArquivos   = [];
let _driveElRaiz     = null;
let _drivePagina     = 1;
let _driveTotalItens = 0;
const _DRIVE_POR_PAGINA = 50;

async function renderDrive(el, conta) {
    _driveElRaiz   = el;
    _driveArquivos = [];
    _drivePagina   = 1;

    if (!conta?.id) {
        el.innerHTML = _driveHtmlErro('Sessão inválida. Faça login novamente.');
        return;
    }

    el.innerHTML = _driveHtmlShell();
    _driveSetState('loading');

    await _driveCarregarPagina(conta, 1);
}

async function _driveCarregarPagina(conta, pagina) {
    const supabaseDb = typeof db !== 'undefined' ? db : window.db;

    if (!supabaseDb) {
        _driveSetState('erro');
        console.error('[drive] db não encontrado');
        return;
    }

    const from = (pagina - 1) * _DRIVE_POR_PAGINA;
    const to   = from + _DRIVE_POR_PAGINA - 1;

    try {
        const { data, error, count } = await supabaseDb
            .from('drive_files')
            .select('*', { count: 'exact' })
            .eq('id_client', conta.id)
            .order('data_de_captura', { ascending: false, nullsFirst: false })
            .range(from, to);

        if (error) throw error;

        console.log('[drive] arquivos carregados:', data?.length, 'total:', count);

        _driveArquivos   = data || [];
        _driveTotalItens = count || 0;
        _drivePagina     = pagina;
        window._drivePosts = _driveArquivos;

        if (_driveArquivos.length === 0 && pagina === 1) {
            _driveSetState('vazio');
            return;
        }

        _driveSetState(null);
        driveRenderGrid(_driveElRaiz, _driveArquivos, _driveTotalItens, pagina, conta);

    } catch (e) {
        console.error('[drive] erro na query:', e);
        _driveSetState('erro');
    }
}

function _driveSetState(state) {
    const el = _driveElRaiz;
    el.querySelector('#drive-state')?.remove();
    el.querySelector('#drive-grid-section')?.remove();
    el.querySelector('#drive-pagination')?.remove();

    if (!state) return;

    const msgs = {
        loading: `<i class="ph ph-circle-notch ct-spin" style="font-size:28px;color:var(--text-3);"></i>
                  <span>Carregando arquivos…</span>`,
        vazio:   `<div class="ct-empty-icon"><i class="ph ph-folder-open"></i></div>
                  <span>Nenhum arquivo encontrado.</span>`,
        erro:    `<div class="ct-empty-icon" style="color:var(--danger);">
                      <i class="ph ph-warning"></i>
                  </div>
                  <span style="color:var(--danger);">Erro ao carregar. Tente recarregar a página.</span>`,
    };

    const cls  = state === 'loading' ? 'ct-loading' : 'ct-empty';
    const wrap = el.querySelector('#drive-wrap');
    if (wrap && msgs[state]) {
        wrap.insertAdjacentHTML('beforeend',
            `<div id="drive-state" class="${cls}">${msgs[state]}</div>`);
    }
}

function _driveHtmlShell() {
    return `<div id="drive-wrap"></div>`;
}

function _driveHtmlErro(msg) {
    return `<div class="ct-empty" style="min-height:60vh;">
                <div class="ct-empty-icon" style="color:var(--danger);">
                    <i class="ph ph-warning"></i>
                </div>
                <span style="color:var(--danger);">${msg}</span>
            </div>`;
}