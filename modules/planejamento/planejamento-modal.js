/* ══════════════════════════════════════
   planejamento-modal.js
   Modal de detalhes do planejamento.
   Edição inline: title, type, captions,
   roteiro — com LOG padrão PL01.
   Depende de: conteudo-aprovar.js
               (_db, _buscarLogs, _toast,
                _getNomeUsuario)
══════════════════════════════════════ */

const PL_TYPE_LABEL = {
    FEED:     'Feed',
    REELS:    'Reels',
    STORIES:  'Stories',
    CAROUSEL: 'Carrossel',
};

const PL_TYPE_ICON = {
    FEED:     'ph-image-square',
    REELS:    'ph-play',
    STORIES:  'ph-squares-four',
    CAROUSEL: 'ph-fill ph-stack',
};

// ── Formata data relativa ──────────────────────────────────────
function _plTempoRelativo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    const p = (n, s) => {
        if (s === 'mês') return `há ${n} ${n !== 1 ? 'meses' : 'mês'}`;
        return `há ${n} ${s}${n !== 1 ? 's' : ''}`;
    };
    if (diff < 60)       return p(diff,                       'segundo');
    if (diff < 3600)     return p(Math.floor(diff / 60),      'minuto');
    if (diff < 86400)    return p(Math.floor(diff / 3600),    'hora');
    if (diff < 2592000)  return p(Math.floor(diff / 86400),   'dia');
    if (diff < 31536000) return p(Math.floor(diff / 2592000), 'mês');
    return                      p(Math.floor(diff / 31536000),'ano');
}

function _plFormatarData(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    } catch { return '—'; }
}

function _plEsc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Salva campo com log ────────────────────────────────────────
async function _plSalvarCampo(postagem, campo, novoValor, labelItem, onAtualizar) {
    const valorAntigo = postagem[campo] || '';

    // Sem mudança — cancela silenciosamente
    if (novoValor === valorAntigo) return true;

    const agora = new Date().toISOString();
    const quem  = _getNomeUsuario().toUpperCase();

    const antigoResumido = valorAntigo
        ? valorAntigo.substring(0, 80) + (valorAntigo.length > 80 ? '…' : '')
        : '(vazio)';
    const novoResumido = novoValor
        ? novoValor.substring(0, 80) + (novoValor.length > 80 ? '…' : '')
        : '(vazio)';

    try {
        const { logs: logsAtuais } = await _buscarLogs(postagem.id);

        const novoLog = {
            EM:        agora,
            ACAO:      'PL01 - ITEM EDITADO',
            ITEM:      labelItem,
            QUEM:      quem,
            ALTERACAO: `${antigoResumido.toUpperCase()} | ${novoResumido.toUpperCase()}`,
        };

        const logsAtualizados = [...logsAtuais, novoLog];

        const update = { logs: logsAtualizados };
        update[campo] = novoValor;

        const { error } = await _db()
            .from('postagens')
            .update(update)
            .eq('id', postagem.id);

        if (error) throw error;

        postagem[campo] = novoValor;
        postagem.logs   = logsAtualizados;

        if (typeof onAtualizar === 'function') onAtualizar(postagem);

        return true;
    } catch (e) {
        console.error('[planejamento] erro ao salvar campo:', e);
        return false;
    }
}

// ── Abre o modal ───────────────────────────────────────────────
function plAbrirModal(postagem, onAtualizar) {
    plFecharModal();

    const typeLabel = PL_TYPE_LABEL[postagem.type] || postagem.type || '—';
    const typeIcon  = PL_TYPE_ICON[postagem.type]  || 'ph-image';
    const dataCriacao = _plTempoRelativo(postagem.criado_em);

    const backdrop = document.createElement('div');
    backdrop.className = 'ct-modal-backdrop pl-modal';
    backdrop.id        = 'pl-modal-backdrop';

    backdrop.innerHTML = `
        <div class="ct-modal" id="pl-modal" role="dialog" aria-modal="true"
             aria-label="${_plEsc(postagem.title || 'Postagem #' + postagem.id)}"
             style="max-width:580px;flex-direction:column;max-height:calc(100dvh - 48px);">

            <!-- Painel único (sem coluna de mídia) -->
            <div class="ct-modal-panel" style="border-left:none;flex:1;overflow:hidden;display:flex;flex-direction:column;">

                <div class="ct-modal-panel-header">
                    <p class="ct-modal-panel-title">
                        ${_plEsc(postagem.title || 'Postagem #' + postagem.id)}
                        <span>#${postagem.id}</span>
                    </p>
                    <button class="ct-modal-close" id="pl-modal-close" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>

                <div class="ct-modal-scroll">
                    <div class="ct-modal-body">

                        <!-- ── Título ── -->
                        <div class="ct-modal-section" id="pl-sec-title">
                            <div class="pl-section-label-row">
                                <p class="ct-modal-section-label">Título</p>
                                <button class="pl-edit-inline-btn" id="pl-btn-edit-title">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                            </div>
                            <p class="pl-title-display">${_plEsc(postagem.title || '')
                                || '<span style="color:var(--text-4);font-style:italic;">Sem título</span>'}</p>
                        </div>

                        <!-- ── Tipo ── -->
                        <div class="ct-modal-section" id="pl-sec-type">
                            <div class="pl-section-label-row">
                                <p class="ct-modal-section-label">Tipo</p>
                                <button class="pl-edit-inline-btn" id="pl-btn-edit-type">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                            </div>
                            <div id="pl-type-display">
                                ${_plTypeBadgeHTML(postagem.type)}
                            </div>
                        </div>

                        <!-- ── Legenda ── -->
                        <div class="ct-modal-section ct-caption-section" id="pl-sec-caption">
                            <div class="pl-section-label-row">
                                <p class="ct-modal-section-label">Legenda</p>
                                <button class="pl-edit-inline-btn" id="pl-btn-edit-caption">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                            </div>
                            <p class="ct-modal-caption${postagem.captions ? '' : '-empty'}" id="pl-caption-display">
                                ${postagem.captions
                                    ? _plEsc(postagem.captions)
                                    : 'Sem legenda cadastrada.'}
                            </p>
                        </div>

                        <!-- ── Roteiro ── -->
                        <div class="ct-modal-section" id="pl-sec-roteiro">
                            <div class="pl-section-label-row">
                                <p class="ct-modal-section-label">Roteiro</p>
                                <button class="pl-edit-inline-btn" id="pl-btn-edit-roteiro">
                                    <i class="ph ph-pencil-simple"></i> Editar
                                </button>
                            </div>
                            <p class="${postagem.roteiro ? 'pl-roteiro-text' : 'pl-roteiro-empty'}" id="pl-roteiro-display">
                                ${postagem.roteiro
                                    ? _plEsc(postagem.roteiro)
                                    : 'Sem roteiro cadastrado.'}
                            </p>
                        </div>

                        <!-- ── Informações ── -->
                        <div class="ct-modal-section">
                            <p class="ct-modal-section-label">Informações</p>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Status</span>
                                <span class="ct-modal-info-val">
                                    <span class="ct-modal-status planej">Em Planejamento</span>
                                </span>
                            </div>
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Criado em</span>
                                <span class="ct-modal-info-val">${dataCriacao}</span>
                            </div>
                            ${postagem.colaboradores?.nome ? `
                            <div class="ct-modal-info-row">
                                <span class="ct-modal-info-key">Responsável</span>
                                <span class="ct-modal-info-val">${_plEsc(postagem.colaboradores.nome)}</span>
                            </div>` : ''}
                        </div>

                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    // ── Fechar ─────────────────────────────────────────────────
    backdrop.querySelector('#pl-modal-close').addEventListener('click', plFecharModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) plFecharModal(); });
    _plEscListener = e => { if (e.key === 'Escape') plFecharModal(); };
    document.addEventListener('keydown', _plEscListener);

    // ── Editar Título ──────────────────────────────────────────
    backdrop.querySelector('#pl-btn-edit-title').addEventListener('click', () => {
        const sec     = backdrop.querySelector('#pl-sec-title');
        if (sec.querySelector('.pl-title-editor')) return;

        const display = sec.querySelector('.pl-title-display');
        display.style.display = 'none';

        const editor = document.createElement('div');
        editor.className = 'pl-title-editor';
        editor.innerHTML = `
            <input class="pl-title-input" type="text"
                   maxlength="200"
                   placeholder="Título da postagem…"
                   value="${_plEsc(postagem.title || '')}">
            <div class="pl-title-editor-footer">
                <div class="ct-caption-editor-btns">
                    <button class="ct-caption-btn ct-caption-btn--cancel">Cancelar</button>
                    <button class="ct-caption-btn ct-caption-btn--save">
                        <i class="ph ph-floppy-disk"></i> Salvar
                    </button>
                </div>
            </div>`;

        sec.appendChild(editor);
        const input = editor.querySelector('.pl-title-input');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        editor.querySelector('.ct-caption-btn--cancel').addEventListener('click', () => {
            editor.remove();
            display.style.display = '';
        });

        editor.querySelector('.ct-caption-btn--save').addEventListener('click', async () => {
            const btn      = editor.querySelector('.ct-caption-btn--save');
            const novoVal  = input.value.trim();
            btn.disabled   = true;
            btn.textContent = 'Salvando…';

            const ok = await _plSalvarCampo(postagem, 'title', novoVal, 'TÍTULO', onAtualizar);
            if (ok) {
                display.innerHTML = novoVal
                    ? _plEsc(novoVal)
                    : '<span style="color:var(--text-4);font-style:italic;">Sem título</span>';
                display.style.display = '';

                // Atualiza o header do modal
                const headerTitle = backdrop.querySelector('.ct-modal-panel-title');
                if (headerTitle) {
                    headerTitle.innerHTML = `${_plEsc(novoVal || 'Postagem #' + postagem.id)}<span>#${postagem.id}</span>`;
                }
                editor.remove();
                _toast('Título salvo!', 'sucesso');
            } else {
                btn.disabled    = false;
                btn.innerHTML   = '<i class="ph ph-floppy-disk"></i> Salvar';
                _toast('Erro ao salvar. Tente novamente.', 'erro');
            }
        });
    });

    // ── Editar Tipo ────────────────────────────────────────────
    backdrop.querySelector('#pl-btn-edit-type').addEventListener('click', () => {
        const sec     = backdrop.querySelector('#pl-sec-type');
        if (sec.querySelector('.pl-type-editor')) return;

        const display = sec.querySelector('#pl-type-display');
        display.style.display = 'none';

        const editor = document.createElement('div');
        editor.className = 'pl-type-editor';
        editor.innerHTML = `
            <select class="pl-type-select">
                <option value="">— Selecione —</option>
                <option value="FEED"     ${postagem.type === 'FEED'     ? 'selected' : ''}>Feed</option>
                <option value="REELS"    ${postagem.type === 'REELS'    ? 'selected' : ''}>Reels</option>
                <option value="STORIES"  ${postagem.type === 'STORIES'  ? 'selected' : ''}>Stories</option>
                <option value="CAROUSEL" ${postagem.type === 'CAROUSEL' ? 'selected' : ''}>Carrossel</option>
            </select>
            <div class="pl-type-editor-footer">
                <div class="ct-caption-editor-btns">
                    <button class="ct-caption-btn ct-caption-btn--cancel">Cancelar</button>
                    <button class="ct-caption-btn ct-caption-btn--save">
                        <i class="ph ph-floppy-disk"></i> Salvar
                    </button>
                </div>
            </div>`;

        sec.appendChild(editor);
        editor.querySelector('.pl-type-select').focus();

        editor.querySelector('.ct-caption-btn--cancel').addEventListener('click', () => {
            editor.remove();
            display.style.display = '';
        });

        editor.querySelector('.ct-caption-btn--save').addEventListener('click', async () => {
            const btn     = editor.querySelector('.ct-caption-btn--save');
            const novoVal = editor.querySelector('.pl-type-select').value;
            if (!novoVal) { _toast('Selecione um tipo.', 'erro'); return; }

            btn.disabled    = true;
            btn.textContent = 'Salvando…';

            const labelAntigo = PL_TYPE_LABEL[postagem.type] || postagem.type || '(vazio)';
            const labelNovo   = PL_TYPE_LABEL[novoVal]       || novoVal;

            // Log manual com labels legíveis
            const agora = new Date().toISOString();
            const quem  = _getNomeUsuario().toUpperCase();
            try {
                const { logs: logsAtuais } = await _buscarLogs(postagem.id);
                const novoLog = {
                    EM:        agora,
                    ACAO:      'PL01 - ITEM EDITADO',
                    ITEM:      'TIPO',
                    QUEM:      quem,
                    ALTERACAO: `${labelAntigo.toUpperCase()} | ${labelNovo.toUpperCase()}`,
                };
                const logsAtualizados = [...logsAtuais, novoLog];
                const { error } = await _db()
                    .from('postagens')
                    .update({ type: novoVal, logs: logsAtualizados })
                    .eq('id', postagem.id);
                if (error) throw error;

                postagem.type = novoVal;
                postagem.logs = logsAtualizados;

                display.innerHTML = _plTypeBadgeHTML(novoVal);
                display.style.display = '';
                editor.remove();
                if (typeof onAtualizar === 'function') onAtualizar(postagem);
                _toast('Tipo salvo!', 'sucesso');
            } catch (e) {
                console.error('[planejamento] erro ao salvar tipo:', e);
                btn.disabled    = false;
                btn.innerHTML   = '<i class="ph ph-floppy-disk"></i> Salvar';
                _toast('Erro ao salvar. Tente novamente.', 'erro');
            }
        });
    });

    // ── Editar Legenda ─────────────────────────────────────────
    backdrop.querySelector('#pl-btn-edit-caption').addEventListener('click', () => {
        const sec     = backdrop.querySelector('#pl-sec-caption');
        if (sec.querySelector('.ct-caption-editor')) return;

        const display = sec.querySelector('#pl-caption-display');
        display.style.display = 'none';

        const textoAtual = postagem.captions || '';
        const editor = document.createElement('div');
        editor.className = 'ct-caption-editor';
        editor.innerHTML = `
            <textarea class="ct-caption-textarea" rows="6" maxlength="2200"
                      placeholder="Escreva a legenda…">${_plEscAttr(textoAtual)}</textarea>
            <div class="ct-caption-editor-footer">
                <span class="ct-caption-counter">
                    <span id="pl-cap-len">${textoAtual.length}</span> / 2200
                </span>
                <div class="ct-caption-editor-btns">
                    <button class="ct-caption-btn ct-caption-btn--cancel">Cancelar</button>
                    <button class="ct-caption-btn ct-caption-btn--save">
                        <i class="ph ph-floppy-disk"></i> Salvar
                    </button>
                </div>
            </div>`;

        sec.appendChild(editor);
        const ta = editor.querySelector('.ct-caption-textarea');
        ta.focus();
        ta.setSelectionRange(textoAtual.length, textoAtual.length);

        ta.addEventListener('input', () => {
            editor.querySelector('#pl-cap-len').textContent = ta.value.length;
        });

        editor.querySelector('.ct-caption-btn--cancel').addEventListener('click', () => {
            editor.remove();
            display.style.display = '';
        });

        editor.querySelector('.ct-caption-btn--save').addEventListener('click', async () => {
            const btn     = editor.querySelector('.ct-caption-btn--save');
            const novoVal = ta.value.trim();
            btn.disabled    = true;
            btn.textContent = 'Salvando…';

            const ok = await _plSalvarCampo(postagem, 'captions', novoVal, 'LEGENDA', onAtualizar);
            if (ok) {
                if (novoVal) {
                    display.className   = 'ct-modal-caption';
                    display.textContent = novoVal;
                } else {
                    display.className   = 'ct-modal-caption-empty';
                    display.textContent = 'Sem legenda cadastrada.';
                }
                display.style.display = '';
                editor.remove();
                _toast('Legenda salva!', 'sucesso');
            } else {
                btn.disabled    = false;
                btn.innerHTML   = '<i class="ph ph-floppy-disk"></i> Salvar';
                _toast('Erro ao salvar. Tente novamente.', 'erro');
            }
        });
    });

    // ── Editar Roteiro ─────────────────────────────────────────
    backdrop.querySelector('#pl-btn-edit-roteiro').addEventListener('click', () => {
        const sec     = backdrop.querySelector('#pl-sec-roteiro');
        if (sec.querySelector('.pl-roteiro-editor')) return;

        const display = sec.querySelector('#pl-roteiro-display');
        display.style.display = 'none';

        const textoAtual = postagem.roteiro || '';
        const editor = document.createElement('div');
        editor.className = 'pl-roteiro-editor';
        editor.innerHTML = `
            <textarea class="pl-roteiro-textarea" rows="7"
                      placeholder="Descreva o roteiro da postagem…">${_plEscAttr(textoAtual)}</textarea>
            <div class="pl-roteiro-editor-footer">
                <span class="ct-caption-counter">
                    <span id="pl-rot-len">${textoAtual.length}</span> caracteres
                </span>
                <div class="ct-caption-editor-btns">
                    <button class="ct-caption-btn ct-caption-btn--cancel">Cancelar</button>
                    <button class="ct-caption-btn ct-caption-btn--save">
                        <i class="ph ph-floppy-disk"></i> Salvar
                    </button>
                </div>
            </div>`;

        sec.appendChild(editor);
        const ta = editor.querySelector('.pl-roteiro-textarea');
        ta.focus();
        ta.setSelectionRange(textoAtual.length, textoAtual.length);

        ta.addEventListener('input', () => {
            editor.querySelector('#pl-rot-len').textContent = ta.value.length;
        });

        editor.querySelector('.ct-caption-btn--cancel').addEventListener('click', () => {
            editor.remove();
            display.style.display = '';
        });

        editor.querySelector('.ct-caption-btn--save').addEventListener('click', async () => {
            const btn     = editor.querySelector('.ct-caption-btn--save');
            const novoVal = ta.value.trim();
            btn.disabled    = true;
            btn.textContent = 'Salvando…';

            const ok = await _plSalvarCampo(postagem, 'roteiro', novoVal, 'ROTEIRO', onAtualizar);
            if (ok) {
                if (novoVal) {
                    display.className   = 'pl-roteiro-text';
                    display.textContent = novoVal;
                } else {
                    display.className   = 'pl-roteiro-empty';
                    display.textContent = 'Sem roteiro cadastrado.';
                }
                display.style.display = '';
                editor.remove();
                _toast('Roteiro salvo!', 'sucesso');
            } else {
                btn.disabled    = false;
                btn.innerHTML   = '<i class="ph ph-floppy-disk"></i> Salvar';
                _toast('Erro ao salvar. Tente novamente.', 'erro');
            }
        });
    });
}

let _plEscListener = null;

function plFecharModal() {
    const backdrop = document.getElementById('pl-modal-backdrop');
    if (!backdrop) return;
    backdrop.remove();
    document.body.style.overflow = '';
    if (_plEscListener) {
        document.removeEventListener('keydown', _plEscListener);
        _plEscListener = null;
    }
}

// ── Helper: HTML do badge de tipo ─────────────────────────────
function _plTypeBadgeHTML(type) {
    const label = PL_TYPE_LABEL[type] || type || '—';
    const cls   = type ? `pl-type-badge--${type.toLowerCase()}` : 'pl-type-badge--null';
    const icon  = PL_TYPE_ICON[type];
    const iconHTML = icon ? `<i class="ph ${icon}" style="font-size:12px;"></i> ` : '';
    return `<span class="pl-type-badge ${cls}">${iconHTML}${_plEsc(label)}</span>`;
}

function _plEscAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}