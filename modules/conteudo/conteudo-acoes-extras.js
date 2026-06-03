/* ══════════════════════════════════════
   conteudo-acoes-extras.js
   Ações: editar legenda + download de mídias
══════════════════════════════════════ */

// ── AÇÃO: Editar legenda ──────────────────────────────────────
/**
 * Transforma a seção de legenda do modal num inline editor.
 * @param {Object} postagem
 * @param {HTMLElement} modalEl — referência ao #ct-modal
 */
function acaoEditarLegenda(postagem, modalEl) {
    // Evita abrir duas vezes
    if (modalEl.querySelector('.ct-caption-editor')) return;

    const secao = modalEl.querySelector('.ct-caption-section');
    if (!secao) return;

    const captionEl = secao.querySelector('.ct-modal-caption, .ct-modal-caption-empty');
    if (captionEl) captionEl.style.display = 'none';

    const textoAtual = postagem.captions || '';

    const editorHTML = `
        <div class="ct-caption-editor">
            <textarea class="ct-caption-textarea" rows="6" maxlength="2200"
                      placeholder="Escreva a legenda…">${_escapeHTMLAttr(textoAtual)}</textarea>
            <div class="ct-caption-editor-footer">
                <span class="ct-caption-counter">
                    <span id="ct-caption-len">${textoAtual.length}</span> / 2200
                </span>
                <div class="ct-caption-editor-btns">
                    <button class="ct-caption-btn ct-caption-btn--cancel">Cancelar</button>
                    <button class="ct-caption-btn ct-caption-btn--save">
                        <i class="ph ph-floppy-disk"></i> Salvar
                    </button>
                </div>
            </div>
        </div>`;

    secao.insertAdjacentHTML('beforeend', editorHTML);

    const editor   = secao.querySelector('.ct-caption-editor');
    const textarea = editor.querySelector('.ct-caption-textarea');
    const lenEl    = editor.querySelector('#ct-caption-len');

    // Auto-foco no fim do texto
    textarea.focus();
    textarea.setSelectionRange(textoAtual.length, textoAtual.length);

    // Contador de caracteres
    textarea.addEventListener('input', () => {
        lenEl.textContent = textarea.value.length;
    });

    // ── Cancelar ─────────────────────────────────────────────
    editor.querySelector('.ct-caption-btn--cancel').addEventListener('click', () => {
        editor.remove();
        if (captionEl) captionEl.style.display = '';
    });

    // ── Salvar ────────────────────────────────────────────────
    editor.querySelector('.ct-caption-btn--save').addEventListener('click', async () => {
        const novaLegenda = textarea.value.trim();
        const btnSalvar   = editor.querySelector('.ct-caption-btn--save');

        btnSalvar.disabled    = true;
        btnSalvar.textContent = 'Salvando…';

        try {
            // 1. Busca logs atuais
            const { logs: logsAtuais } = await _buscarLogs(postagem.id);

            const agora = new Date().toISOString();
            const quem  = _getNomeUsuario().toUpperCase();

            // 2. Monta entrada de log no padrão {antigo} | {novo}
            const legendaAntiga = postagem.captions
                ? postagem.captions.substring(0, 80) + (postagem.captions.length > 80 ? '…' : '')
                : '(sem legenda)';
            const legendaNova = novaLegenda
                ? novaLegenda.substring(0, 80) + (novaLegenda.length > 80 ? '…' : '')
                : '(sem legenda)';

            const novoLog = {
                EM:        agora,
                ACAO:      'PORTAL - LEGENDA EDITADA',
                ITEM:      'LEGENDA',
                QUEM:      quem,
                ALTERACAO: `${legendaAntiga} | ${legendaNova}`,
            };

            const logsAtualizados = [...logsAtuais, novoLog];

            // 3. Salva no banco (legenda + log)
            const { error } = await _db()
                .from('postagens')
                .update({ captions: novaLegenda, logs: logsAtualizados })
                .eq('id', postagem.id);

            if (error) throw error;

            // 4. Atualiza objeto local
            postagem.captions = novaLegenda;
            postagem.logs     = logsAtualizados;

            // 5. Atualiza exibição
            if (captionEl) {
                if (novaLegenda) {
                    captionEl.className   = 'ct-modal-caption';
                    captionEl.textContent = novaLegenda;
                } else {
                    captionEl.className   = 'ct-modal-caption-empty';
                    captionEl.textContent = 'Sem legenda cadastrada.';
                }
                captionEl.style.display = '';
            }

            editor.remove();
            _toast('Legenda salva com sucesso!', 'sucesso');

        } catch (e) {
            console.error('[acoes] erro ao salvar legenda:', e);
            btnSalvar.disabled  = false;
            btnSalvar.innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar';
            _toast('Erro ao salvar. Tente novamente.', 'erro');
        }
    });
}

// ── AÇÃO: Download de mídias ──────────────────────────────────
/**
 * Dispara o download de cada mídia via Worker,
 * que injeta Content-Disposition e permite barra de progresso nativa.
 * @param {Object} postagem
 */
async function acaoDownload(postagem) {
    const midias = _parseMidiasDownload(postagem.media);

    if (midias.length === 0) {
        _toast('Nenhuma mídia disponível para download.', 'erro');
        return;
    }

    const plural = midias.length > 1 ? `${midias.length} arquivos` : '1 arquivo';

    const confirmou = await _confirmar({
        titulo: 'Baixar mídias?',
        texto:  `Você está prestes a baixar <strong>${plural}</strong> da postagem <strong>#${postagem.id}</strong>.`,
        btnOk:  'Baixar',
        corBtn: 'var(--accent)',
    });

    if (!confirmou) return;

    _toast(`Iniciando download de ${plural}…`, 'sucesso');

    let erros   = 0;
    const agora = new Date().toISOString();
    const quem  = _getNomeUsuario().toUpperCase();

    for (let i = 0; i < midias.length; i++) {
        const midia = midias[i];
        const url   = midia.url_media;
        if (!url) { erros++; continue; }

        try {
            _dispararDownload(url, _nomeArquivo(postagem, midia, i));
            // Delay entre arquivos para o navegador não sobrepor os downloads
            if (i < midias.length - 1) await _sleep(600);
        } catch (e) {
            console.warn('[download] falha ao disparar download:', url, e);
            erros++;
        }
    }

    // ── Registra log de download ──────────────────────────────
    try {
        const { logs: logsAtuais } = await _buscarLogs(postagem.id);

        const statusDownload = erros === 0
            ? `${midias.length} arquivo(s) enviado(s) para download`
            : `${midias.length - erros} arquivo(s) enviado(s), ${erros} com erro`;

        const novoLog = {
            EM:        agora,
            ACAO:      'PORTAL - DOWNLOAD',
            ITEM:      'MÍDIA',
            QUEM:      quem,
        };

        const logsAtualizados = [...logsAtuais, novoLog];

        const { error } = await _db()
            .from('postagens')
            .update({ logs: logsAtualizados })
            .eq('id', postagem.id);

        if (!error) {
            postagem.logs = logsAtualizados;
            console.log(`[download] log registrado — #${postagem.id}`);
        }
    } catch (logErr) {
        console.warn('[download] erro ao registrar log:', logErr);
    }

    // ── Feedback final ────────────────────────────────────────
    if (erros === 0) {
        _toast(
            midias.length > 1
                ? `${midias.length} downloads iniciados no navegador!`
                : 'Download iniciado no navegador!',
            'sucesso'
        );
    } else {
        _toast(`Download concluído com ${erros} erro(s).`, 'erro');
    }
}

// ── Dispara download via Worker (suporta cross-origin + barra de progresso) ───
function _dispararDownload(url, filename) {
    const WORKER_URL = 'https://dn02.andrewmssantos.workers.dev/download';

    const downloadUrl = `${WORKER_URL}?url=${encodeURIComponent(url)}&nome=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href          = downloadUrl;
    a.download      = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

// ── Gera nome de arquivo legível ──────────────────────────────
function _nomeArquivo(postagem, midia, index) {
    const base = (postagem.title || `postagem-${postagem.id}`)
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40);

    const ext = _extencaoDeURL(midia.url_media, midia.type);
    const seq  = midia.sequencia || (index + 1);

    return `${base}-${seq}.${ext}`;
}

function _extencaoDeURL(url, type) {
    try {
        const path = new URL(url).pathname;
        const ext  = path.split('.').pop().toLowerCase().split('?')[0];
        if (ext && ext.length <= 4) return ext;
    } catch (_) { /* ignora */ }
    return type === 'video' ? 'mp4' : 'jpg';
}

function _parseMidiasDownload(media) {
    try {
        const arr = typeof media === 'string' ? JSON.parse(media) : (media || []);
        return arr.slice().sort((a, b) =>
            parseInt(a.sequencia || '0', 10) - parseInt(b.sequencia || '0', 10)
        );
    } catch { return []; }
}

function _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// Escapa para uso dentro de atributos HTML (textarea value via innerHTML)
function _escapeHTMLAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}