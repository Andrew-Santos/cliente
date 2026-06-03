/* ══════════════════════════════════════
   conteudo-acoes.js
   Ações do modal: aprovar + log de visualização
══════════════════════════════════════ */

// ── Quem está logado ──────────────────────────────────────────
function _getNomeUsuario() {
    return window.conta?.nome
        || window.sessao?.nome
        || 'Cliente';
}

// ── Instância do Supabase ─────────────────────────────────────
function _db() {
    const supabaseDb = typeof db !== 'undefined' ? db : window.db;
    if (!supabaseDb) throw new Error('Supabase não encontrado.');
    return supabaseDb;
}

// ── Busca logs atuais do banco ────────────────────────────────
async function _buscarLogs(postagemId) {
    const { data, error } = await _db()
        .from('postagens')
        .select('logs, status')
        .eq('id', postagemId)
        .single();

    if (error) throw error;

    return {
        logs:   Array.isArray(data.logs) ? data.logs : [],
        status: data.status,
    };
}

// ── LOG: Visualização ─────────────────────────────────────────
async function logVisualizacao(postagem) {
    try {
        const { logs: logsAtuais } = await _buscarLogs(postagem.id);

        const novaEntrada = {
            EM:        new Date().toISOString(),
            ACAO:      'PORTAL - VISUALIZADO',
            ITEM:      'VISUALIZAÇÃO',
            QUEM:      _getNomeUsuario().toUpperCase(),
        };

        const logsAtualizados = [...logsAtuais, novaEntrada];

        const { error } = await _db()
            .from('postagens')
            .update({ logs: logsAtualizados })
            .eq('id', postagem.id);

        if (error) throw error;

        // Atualiza objeto local
        postagem.logs = logsAtualizados;

        console.log(`[acoes] log de visualização criado — #${postagem.id}`);

    } catch (e) {
        console.warn('[acoes] erro ao salvar log de visualização:', e);
    }
}

// ── AÇÃO: Aprovar ─────────────────────────────────────────────
async function acaoAprovar(postagem, onSucesso) {
    const confirmou = await _confirmar({
        titulo: 'Aprovar postagem?',
        texto:  `Você está aprovando o post <strong>${ '#' + postagem.id}</strong> <span style="color:var(--text-3);font-size:11px;"></span>. Essa ação ficará registrada.`,
        btnOk:  'Aprovar',
        corBtn: 'var(--success)',
    });

    if (!confirmou) return;

    try {
        const agora = new Date().toISOString();
        const quem  = _getNomeUsuario().toUpperCase();

        // 1. Busca logs e status atuais direto do banco
        const { logs: logsAtuais, status: statusAtual } = await _buscarLogs(postagem.id);

        // 2. Monta nova entrada de log
        const novoLog = {
            EM:        agora,
            ACAO:      'PORTAL - APROVADO',
            ITEM:      'STATUS',
            QUEM:      quem,
            ALTERACAO: `${STATUS_MODAL[statusAtual]?.label || statusAtual} | Aprovado`,
        };

        const logsAtualizados = [...logsAtuais, novoLog];

        // 3. Salva no banco
        const { error } = await _db()
            .from('postagens')
            .update({
                status:              'APROVADO',
                aprovado_cliente_em: agora,
                logs:                logsAtualizados,
            })
            .eq('id', postagem.id);

        if (error) throw error;

        // 4. Atualiza objeto local
        postagem.status              = 'APROVADO';
        postagem.aprovado_cliente_em = agora;
        postagem.logs                = logsAtualizados;

        _toast('Postagem aprovada com sucesso!', 'sucesso');

        if (typeof onSucesso === 'function') onSucesso(postagem);

    } catch (e) {
        console.error('[acoes] erro ao aprovar:', e);
        _toast('Erro ao aprovar. Tente novamente.', 'erro');
    }
}

// ── Dialog de confirmação ─────────────────────────────────────
function _confirmar({ titulo, texto, btnOk, corBtn }) {
    return new Promise(resolve => {
        document.getElementById('ct-confirm-dialog')?.remove();

        const dialog = document.createElement('div');
        dialog.id = 'ct-confirm-dialog';
        dialog.innerHTML = `
            <div class="ct-confirm-backdrop">
                <div class="ct-confirm-box" role="dialog" aria-modal="true">
                    <p class="ct-confirm-titulo">${titulo}</p>
                    <p class="ct-confirm-texto">${texto}</p>
                    <div class="ct-confirm-btns">
                        <button class="ct-confirm-btn ct-confirm-cancelar">Cancelar</button>
                        <button class="ct-confirm-btn ct-confirm-ok"
                                style="background:${corBtn};border-color:${corBtn};">
                            ${btnOk}
                        </button>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(dialog);

        const fechar = (resultado) => {
            dialog.remove();
            resolve(resultado);
        };

        dialog.querySelector('.ct-confirm-ok')
            .addEventListener('click', () => fechar(true));

        dialog.querySelector('.ct-confirm-cancelar')
            .addEventListener('click', () => fechar(false));

        dialog.querySelector('.ct-confirm-backdrop')
            .addEventListener('click', e => {
                if (e.target === e.currentTarget) fechar(false);
            });
    });
}

// ── Toast de feedback ─────────────────────────────────────────
function _toast(msg, tipo = 'sucesso') {
    document.getElementById('ct-toast')?.remove();

    const t = document.createElement('div');
    t.id = 'ct-toast';
    t.className = `ct-toast ct-toast--${tipo}`;
    t.textContent = msg;
    document.body.appendChild(t);

    // Força reflow para animação funcionar
    t.getBoundingClientRect();
    t.classList.add('ct-toast--show');

    setTimeout(() => {
        t.classList.remove('ct-toast--show');
        setTimeout(() => t.remove(), 300);
    }, 3000);
}