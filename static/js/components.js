/**
 * DeltaSaúde - Components Manager
 * ATUALIZADO: navbar com novo design, modal ID corrigido
 */
const AcessibilidadeManager = (function() {
    const SUGESTAO_KEY = 'sugestaoAcessibilidadeRespondida';

    async function init() {
        const user = AuthManager.getLoggedUser();
        if (!user || user.role !== 'USER') return;

        try {
            const resp = await fetch(`${ApiClient.BASE_URL}/api/v1/acessibilidade`, {
                headers: AuthManager.getAuthHeader()
            });
            if (!resp.ok) return;
            const data = await resp.json();

            applyConfiguracoesVisuais(data.modo);

            if (data.sugerirModoIdoso && !localStorage.getItem(SUGESTAO_KEY)) {
                showSugestaoModal(data.mensagemSugestao, data.modo);
            }
        } catch (e) {
            // Silently fail
        }
    }

    async function applyConfiguracoesVisuais(modo) {
        try {
            const resp = await fetch(`${ApiClient.BASE_URL}/api/v1/acessibilidade/configuracoes-visuais`, {
                headers: AuthManager.getAuthHeader()
            });
            if (!resp.ok) return;
            const config = await resp.json();
            const root = document.documentElement;
            root.style.setProperty('--font-size-base', config.fonteSizeBase || '16px');
            root.style.setProperty('--font-size-title', config.fonteSizeTitulo || '22px');
            root.style.setProperty('--btn-height', config.alturaBotao || '44px');
            root.style.setProperty('--icon-size', config.iconeTamanho || '24px');
            root.style.setProperty('--spacing-pad', config.espacamentoPadding || '16px');
            if (config.altoContraste) {
                document.body.classList.add('alto-contraste');
            }
            if (config.linguagemSimplificada) {
                document.body.classList.add('modo-idoso');
            }
        } catch (e) {}
    }

    function showSugestaoModal(mensagem, modoAtual) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.setAttribute('role', 'dialog');
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Quer facilitar o uso?</h3>
                </div>
                <div class="modal-body">
                    <p style="font-size: var(--font-md); line-height: 1.6; color: var(--text-body);">${mensagem}</p>
                </div>
                <div class="modal-footer" style="display:flex; gap: var(--space-3);">
                    <button class="btn btn-secondary" style="flex:1;" id="recusar-sugestao">Não, obrigado</button>
                    <button class="btn btn-primary" style="flex:1;" id="aceitar-sugestao">Sim, ativar Modo Fácil</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        overlay.querySelector('#aceitar-sugestao').addEventListener('click', async () => {
            try {
                await fetch(`${ApiClient.BASE_URL}/api/v1/acessibilidade/modo`, {
                    method: 'PATCH',
                    headers: { ...AuthManager.getAuthHeader(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ modo: 'IDOSO' })
                });
                localStorage.setItem(SUGESTAO_KEY, 'true');
                location.reload();
            } catch (e) {
                ComponentsManager.error('Erro ao ativar modo fácil');
            }
            overlay.remove();
        });

        overlay.querySelector('#recusar-sugestao').addEventListener('click', async () => {
            try {
                await fetch(`${ApiClient.BASE_URL}/api/v1/acessibilidade/recusar-sugestao`, {
                    method: 'POST',
                    headers: AuthManager.getAuthHeader()
                });
                localStorage.setItem(SUGESTAO_KEY, 'true');
            } catch (e) {}
            overlay.remove();
        });
    }

    return { init, applyConfiguracoesVisuais };
})();

const NavigationCards = (function() {
    function renderMedico(container) {
        const cards = [
            { href: 'dashboard.html', icon: 'fa-house', label: 'Início', cor: 'var(--brand-500)' },
            { href: 'pacientes.html', icon: 'fa-users', label: 'Meus Pacientes', cor: 'var(--brand-500)' },
            { href: 'calendario.html', icon: 'fa-calendar', label: 'Calendário', cor: 'var(--green-500)' },
            { href: 'relatorios.html', icon: 'fa-chart-line', label: 'Relatórios', cor: 'var(--amber-500)' },
            { href: 'tratamentos.html', icon: 'fa-pills', label: 'Tratamentos', cor: 'var(--brand-600)' },
            { href: 'config.html', icon: 'fa-gear', label: 'Configurações', cor: 'var(--stone-400)' }
        ];
        renderCards(container, cards, 'grid-cols-3');
    }

    function renderPaciente(container, modoAcessibilidade) {
        if (modoAcessibilidade === 'IDOSO' || modoAcessibilidade === 'BAIXA_VISAO') {
            const cards = [
                { href: 'dashboard.html', icon: 'fa-house', label: 'Início', cor: 'var(--brand-500)' },
                { href: 'medicamentos.html', icon: 'fa-pills', label: 'Remédios', cor: 'var(--brand-500)' },
                { href: 'alarmes.html', icon: 'fa-bell', label: 'Lembretes', cor: 'var(--amber-500)' },
                { href: 'agenda.html', icon: 'fa-calendar', label: 'Agenda', cor: 'var(--green-500)' },
                { href: 'meu-medico.html', icon: 'fa-user-doctor', label: 'Meu Médico', cor: 'var(--brand-600)' },
                { href: 'config.html', icon: 'fa-gear', label: 'Ajustes', cor: 'var(--stone-400)' }
            ];
            renderCards(container, cards, 'grid-cols-2', true);
        } else {
            const cards = [
                { href: 'dashboard.html', icon: 'fa-house', label: 'Início', cor: 'var(--brand-500)' },
                { href: 'medicamentos.html', icon: 'fa-pills', label: 'Medicamentos', cor: 'var(--brand-500)' },
                { href: 'alarmes.html', icon: 'fa-bell', label: 'Alarmes', cor: 'var(--amber-500)' },
                { href: 'agenda.html', icon: 'fa-calendar', label: 'Agenda', cor: 'var(--green-500)' },
                { href: 'meu-medico.html', icon: 'fa-user-doctor', label: 'Meus Médicos', cor: 'var(--brand-600)' },
                { href: 'config.html', icon: 'fa-gear', label: 'Configurações', cor: 'var(--stone-400)' }
            ];
            renderCards(container, cards, 'grid-cols-3', false);
        }
    }

    function renderCards(container, cards, colsClass, modoIdoso = false) {
        container.innerHTML = cards.map(card => `
            <a href="${card.href}" class="nav-card" style="--card-color: ${card.cor};">
                <div class="nav-card-icon" style="background: ${card.cor}15; color: ${card.cor};">
                    <i class="fas ${card.icon}"></i>
                </div>
                <span class="nav-card-label">${card.label}</span>
            </a>`).join('');
    }

    return { renderMedico, renderPaciente };
})();

const AdesaoCalendar = (function() {
    function render(container, dados) {
        if (!dados || !dados.dias || dados.dias.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum dado de adesão disponível.</p>';
            return;
        }
        const weeks = groupByWeeks(dados.dias);
        let html = '<div class="calendario-container">';
        html += '<div class="calendario-header">';
        html += '<div class="calendario-meta"><strong>' + dados.pacienteNome + '</strong> — Média: ' + dados.mediaGeralPeriodo.toFixed(1) + '%</div>';
        html += '<div class="calendario-legenda">';
        html += '<span class="legenda-item otimo">Ótimo</span>';
        html += '<span class="legenda-item bom">Bom</span>';
        html += '<span class="legenda-item regular">Regular</span>';
        html += '<span class="legenda-item ruim">Ruim</span>';
        html += '<span class="legenda-item sem-dados">Sem dados</span>';
        html += '</div></div>';
        html += '<div class="calendario-grid">';
        for (const week of weeks) {
            html += '<div class="calendario-week">';
            for (const dia of week) {
                const nivel = dia.nivel || 'SEM_DADOS';
                const tooltip = dia.data + ' — ' + dia.totalAlarmes + ' lembretes (' + dia.percentualAdesao.toFixed(0) + '%)';
                html += '<div class="calendario-day ' + nivel.toLowerCase() + '" title="' + tooltip + '"></div>';
            }
            html += '</div>';
        }
        html += '</div></div>';
        container.innerHTML = html;
    }

    function groupByWeeks(dias) {
        const weeks = [];
        let currentWeek = [];
        for (const dia of dias) {
            if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
            currentWeek.push(dia);
        }
        if (currentWeek.length > 0) weeks.push(currentWeek);
        return weeks;
    }

    return { render };
})();

const AvatarPicker = (function() {
    function render(container, avatares, corAtual, onSelect) {
        container.innerHTML = `
            <div class="avatar-picker-grid">
                ${avatares.map(a => `
                    <div class="avatar-option" data-avatar="${a}" title="${a}">
                        <div class="avatar avatar-md" style="background: var(--brand-100); color: var(--brand-700);">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>`).join('')}
            </div>
            <div class="color-picker-grid mt-4">
                ${getCoresHex().map(c => `
                    <div class="color-option" data-cor="${c.nome}" title="${c.nome}" style="background: ${c.hex}; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                `).join('')}
            </div>`;

        container.querySelectorAll('.avatar-option').forEach(el => {
            el.addEventListener('click', () => {
                container.querySelectorAll('.avatar-option').forEach(o => o.style.border = '');
                el.style.border = '3px solid var(--brand-500)';
                const cor = container.querySelector('.color-option[style*="border-color: var(--brand-500)"]')?.dataset.cor || corAtual;
                onSelect(el.dataset.avatar, cor);
            });
        });
    }

    function getCoresHex() {
        return [
            { nome: 'AZUL', hex: '#06B6D4' },
            { nome: 'VERDE', hex: '#10B981' },
            { nome: 'AMARELO', hex: '#F59E0B' },
            { nome: 'VERMELHO', hex: '#EF4444' },
            { nome: 'ROXO', hex: '#8B5CF6' },
            { nome: 'LARANJA', hex: '#F97316' },
            { nome: 'ROSA', hex: '#EC4899' },
            { nome: 'CIANO', hex: '#22D3EE' },
            { nome: 'CINZA', hex: '#6B7280' }
        ];
    }

    return { render };
})();
    let toastContainer = null;
    let loadingOverlay = null;
    let confirmModalOverlay = null;
    let loadingCount = 0;

    function init() {
        createToastContainer();
        createLoadingOverlay();
        createConfirmModalOverlay();
    }

    /* ── TOAST ── */
    function createToastContainer() {
        if (document.getElementById('toast-container')) return;
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }

    function showToast(message, type = 'info', duration = 4000) {
        if (!toastContainer) createToastContainer();
        const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info' };
        const titles = { success: 'Feito!', error: 'Erro', warning: 'Atenção', info: 'Info' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar"><i class="fas fa-times"></i></button>
        `;
        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
        toastContainer.appendChild(toast);
        setTimeout(() => removeToast(toast), duration);
        return toast;
    }

    function removeToast(toast) {
        toast.classList.add('toast-exit');
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }

    function success(msg, dur) { return showToast(msg, 'success', dur); }
    function error(msg, dur)   { return showToast(msg, 'error', dur); }
    function warning(msg, dur) { return showToast(msg, 'warning', dur); }
    function info(msg, dur)    { return showToast(msg, 'info', dur); }

    /* ── LOADING ── */
    function createLoadingOverlay() {
        if (document.getElementById('loading-overlay')) return;
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay hidden';
        loadingOverlay.setAttribute('aria-hidden', 'true');
        loadingOverlay.innerHTML = `<div class="spinner" role="status"></div><span class="spinner-text">Carregando...</span>`;
        document.body.appendChild(loadingOverlay);
    }

    function showLoading(text = 'Carregando...') {
        loadingCount++;
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.setAttribute('aria-hidden', 'false');
            const t = loadingOverlay.querySelector('.spinner-text');
            if (t) t.textContent = text;
        }
    }

    function hideLoading() {
        loadingCount = Math.max(0, loadingCount - 1);
        if (loadingCount === 0 && loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.setAttribute('aria-hidden', 'true');
        }
    }

    function forceHideLoading() {
        loadingCount = 0;
        if (loadingOverlay) { loadingOverlay.classList.add('hidden'); loadingOverlay.setAttribute('aria-hidden', 'true'); }
    }

    /* ── MODAL DE CONFIRMAÇÃO (ID único para não conflitar) ── */
    function createConfirmModalOverlay() {
        if (document.getElementById('confirm-modal-overlay')) return;
        confirmModalOverlay = document.createElement('div');
        confirmModalOverlay.id = 'confirm-modal-overlay';
        confirmModalOverlay.className = 'modal-overlay';
        confirmModalOverlay.setAttribute('aria-hidden', 'true');
        confirmModalOverlay.setAttribute('role', 'dialog');
        confirmModalOverlay.setAttribute('aria-modal', 'true');
        document.body.appendChild(confirmModalOverlay);
    }

    function showConfirmModal(options = {}) {
        if (!confirmModalOverlay) createConfirmModalOverlay();
        const {
            title = 'Confirmar ação',
            message = 'Tem certeza que deseja continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        const icons = { danger: 'fa-trash', warning: 'fa-exclamation-triangle', info: 'fa-question-circle' };

        confirmModalOverlay.innerHTML = `
            <div class="modal">
                <div class="modal-body" style="padding: var(--space-8); text-align: center;">
                    <div class="modal-confirm-icon ${type === 'danger' ? 'danger' : ''}">
                        <i class="fas ${icons[type] || icons.warning}"></i>
                    </div>
                    <h3 class="modal-confirm-title">${title}</h3>
                    <p class="modal-confirm-message">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-cancel" style="flex:1;">${cancelText}</button>
                    <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} btn-confirm" style="flex:1;">${confirmText}</button>
                </div>
            </div>
        `;

        confirmModalOverlay.classList.add('active');
        confirmModalOverlay.setAttribute('aria-hidden', 'false');

        const close = () => { confirmModalOverlay.classList.remove('active'); confirmModalOverlay.setAttribute('aria-hidden', 'true'); };
        confirmModalOverlay.querySelector('.btn-confirm').addEventListener('click', () => { close(); onConfirm(); });
        const cancelBtn = confirmModalOverlay.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => { close(); onCancel(); });
        confirmModalOverlay.addEventListener('click', e => { if (e.target === confirmModalOverlay) { close(); onCancel(); } });
        cancelBtn.focus();
    }

    /* ── NAVBAR ── */
    function renderNavbar(container, options = {}) {
        const { showSidebar = true, currentPage = '' } = options;
        const user = AuthManager.getUserData() || AuthManager.getLoggedUser();
        const userName = user?.nome || 'Usuário';
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const navItems = [
            { href: 'dashboard.html',   icon: 'fa-house',         label: 'Início',       id: 'dashboard' },
            { href: 'medicamentos.html', icon: 'fa-pills',         label: 'Medicamentos', id: 'medicamentos' },
            { href: 'tratamentos.html',  icon: 'fa-clipboard-list',label: 'Tratamentos',  id: 'tratamentos' },
            { href: 'alarmes.html',      icon: 'fa-bell',          label: 'Alarmes',      id: 'alarmes' },
            { href: 'assistente.html',   icon: 'fa-robot',         label: 'Assistente IA',id: 'assistente' },
            { href: 'relatorio.html',    icon: 'fa-file-lines',    label: 'Relatório',    id: 'relatorio' },
            { href: 'perfil.html',       icon: 'fa-circle-user',   label: 'Meu Perfil',   id: 'perfil' }
        ];

        const brandHTML = `
            <a href="dashboard.html" class="navbar-brand">
                <div class="brand-icon"><i class="fas fa-heart-pulse"></i></div>
                <span>Delta<em>Saúde</em></span>
            </a>`;

        const sidebarHTML = '';

        container.innerHTML = `
            <main class="main-content full-width">
                <header class="navbar">
                    <div class="container navbar-container">
                        <div style="display:flex; align-items:center; gap: var(--space-3);">
                            ${brandHTML}
                        </div>
                        <div class="navbar-actions">
                            <button class="theme-toggle" id="theme-toggle" aria-label="Alternar tema" title="Alternar tema">
                                <i class="fas fa-moon"></i>
                            </button>
                            <div class="navbar-user">
                                <div class="navbar-user-avatar">${initials}</div>
                                <span class="navbar-user-name">${userName.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="container page-content"></div>
            </main>
            <nav class="bottom-nav" aria-label="Navegação">
                <a href="dashboard.html"   class="bottom-nav-item ${currentPage==='dashboard'    ?'active':''}"><i class="fas fa-house"></i><span>Início</span></a>
                <a href="medicamentos.html" class="bottom-nav-item ${currentPage==='medicamentos' ?'active':''}"><i class="fas fa-pills"></i><span>Remédios</span></a>
                <a href="alarmes.html"      class="bottom-nav-item ${currentPage==='alarmes'      ?'active':''}"><i class="fas fa-bell"></i><span>Alarmes</span></a>
                <a href="assistente.html"   class="bottom-nav-item ${currentPage==='assistente'   ?'active':''}"><i class="fas fa-robot"></i><span>IA</span></a>
                <a href="perfil.html"       class="bottom-nav-item ${currentPage==='perfil'       ?'active':''}"><i class="fas fa-circle-user"></i><span>Perfil</span></a>
            </nav>
        `;

        if (typeof ThemeManager !== 'undefined') ThemeManager.init();
        else document.addEventListener('DOMContentLoaded', () => { if (typeof ThemeManager !== 'undefined') ThemeManager.init(); });
    }

    /* ── UTILS ── */
    function formatDate(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    function formatDateTime(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    function formatTime(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    function isPast(d)         { if (!d) return false; return new Date(d) < new Date(); }
    function getInitials(name) { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }

    return {
        init,
        showToast, success, error, warning, info,
        showLoading, hideLoading, forceHideLoading,
        showConfirmModal,
        renderNavbar,
        formatDate, formatDateTime, formatTime, isPast, getInitials
    };
})();

document.addEventListener('DOMContentLoaded', () => ComponentsManager.init());

/* Acessibilidade Manager - modo idoso/baixa_visao */
const AcessibilidadeManager = (function() {
    const SUGESTAO_KEY = 'sugestaoAcessibilidadeRespondida';

    async function init() {
        const user = AuthManager.getLoggedUser();
        if (!user || user.role !== 'USER') return;
        try {
            const resp = await fetch(ApiClient.BASE_URL + '/api/v1/acessibilidade', {
                headers: AuthManager.getAuthHeader()
            });
            if (!resp.ok) return;
            const data = await resp.json();
            applyConfig(data);
            if (data.sugerirModoIdoso && !localStorage.getItem(SUGESTAO_KEY)) {
                showSugestaoModal(data.mensagemSugestao);
            }
        } catch (e) {}
    }

    async function applyConfig(data) {
        try {
            const resp = await fetch(ApiClient.BASE_URL + '/api/v1/acessibilidade/configuracoes-visuais', {
                headers: AuthManager.getAuthHeader()
            });
            if (!resp.ok) return;
            const cfg = await resp.json();
            const r = document.documentElement;
            r.style.setProperty('--fonte-base', cfg.fonteSizeBase || '16px');
            r.style.setProperty('--fonte-titulo', cfg.fonteSizeTitulo || '22px');
            if (cfg.altoContraste) document.body.classList.add('alto-contraste');
            if (cfg.linguagemSimplificada) document.body.classList.add('modo-idoso');
        } catch (e) {}
    }

    function showSugestaoModal(msg) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.setAttribute('role', 'dialog');
        overlay.innerHTML = '<div class="modal"><div class="modal-header"><h3 class="modal-title">Quer facilitar o uso?</h3></div><div class="modal-body"><p style="font-size:var(--font-md);line-height:1.6;">' + msg + '</p></div><div class="modal-footer" style="display:flex;gap:12px;"><button class="btn btn-secondary" id="recusar" style="flex:1;">Nao, obrigado</button><button class="btn btn-primary" id="aceitar" style="flex:1;">Sim, ativar Modo Facil</button></div></div>';
        document.body.appendChild(overlay);
        overlay.querySelector('#aceitar').addEventListener('click', async function() {
            try {
                await fetch(ApiClient.BASE_URL + '/api/v1/acessibilidade/modo', {
                    method: 'PATCH',
                    headers: {'Content-Type':'application/json', ...AuthManager.getAuthHeader()},
                    body: JSON.stringify({modo: 'IDOSO'})
                });
                localStorage.setItem(SUGESTAO_KEY, 'true');
                location.reload();
            } catch(e) { ComponentsManager.error('Erro ao ativar modo'); }
            overlay.remove();
        });
        overlay.querySelector('#recusar').addEventListener('click', async function() {
            try {
                await fetch(ApiClient.BASE_URL + '/api/v1/acessibilidade/recusar-sugestao', {
                    method: 'POST',
                    headers: AuthManager.getAuthHeader()
                });
                localStorage.setItem(SUGESTAO_KEY, 'true');
            } catch(e) {}
            overlay.remove();
        });
    }

    return { init, applyConfig };
})();

/* Navigation Cards */
const NavigationCards = (function() {
    function renderMedico(container) {
        var cards = [
            {href:'dashboard.html',icon:'fa-house',label:'Inicio',cor:'var(--brand-500)'},
            {href:'pacientes.html',icon:'fa-users',label:'Meus Pacientes',cor:'var(--brand-500)'},
            {href:'calendario.html',icon:'fa-calendar',label:'Calendario',cor:'var(--green-500)'},
            {href:'relatorios.html',icon:'fa-chart-line',label:'Relatorios',cor:'var(--amber-500)'},
            {href:'tratamentos.html',icon:'fa-pills',label:'Tratamentos',cor:'var(--brand-600)'},
            {href:'config.html',icon:'fa-gear',label:'Configuracoes',cor:'var(--stone-400)'}
        ];
        render(container, cards, 'grid-cols-3');
    }

    function renderPaciente(container, modo) {
        var isIdoso = modo === 'IDOSO' || modo === 'BAIXA_VISAO';
        var cols = isIdoso ? 'grid-cols-2' : 'grid-cols-3';
        var cardList = isIdoso ? [
            {href:'dashboard.html',icon:'fa-house',label:'Inicio',cor:'var(--brand-500)'},
            {href:'medicamentos.html',icon:'fa-pills',label:'Remedios',cor:'var(--brand-500)'},
            {href:'alarmes.html',icon:'fa-bell',label:'Lembretes',cor:'var(--amber-500)'},
            {href:'agenda.html',icon:'fa-calendar',label:'Agenda',cor:'var(--green-500)'},
            {href:'meu-medico.html',icon:'fa-user-doctor',label:'Meu Medico',cor:'var(--brand-600)'},
            {href:'perfil.html',icon:'fa-gear',label:'Ajustes',cor:'var(--stone-400)'}
        ] : [
            {href:'dashboard.html',icon:'fa-house',label:'Inicio',cor:'var(--brand-500)'},
            {href:'medicamentos.html',icon:'fa-pills',label:'Medicamentos',cor:'var(--brand-500)'},
            {href:'alarmes.html',icon:'fa-bell',label:'Alarmes',cor:'var(--amber-500)'},
            {href:'agenda.html',icon:'fa-calendar',label:'Agenda',cor:'var(--green-500)'},
            {href:'meu-medico.html',icon:'fa-user-doctor',label:'Meus Medicos',cor:'var(--brand-600)'},
            {href:'perfil.html',icon:'fa-gear',label:'Configuracoes',cor:'var(--stone-400)'}
        ];
        render(container, cardList, cols);
    }

    function render(container, cards, cols) {
        var html = '<div class="grid ' + cols + ' gap-4">';
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            html += '<a href="' + c.href + '" class="nav-card" style="--card-color:' + c.cor + ';">';
            html += '<div class="nav-card-icon" style="background:' + c.cor + '15;color:' + c.cor + ';"><i class="fas ' + c.icon + '"></i></div>';
            html += '<span class="nav-card-label">' + c.label + '</span></a>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    return { renderMedico: renderMedico, renderPaciente: renderPaciente };
})();

/* Adesao Calendar */
const AdesaoCalendar = (function() {
    function render(container, dados) {
        if (!dados || !dados.dias || dados.dias.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum dado de adesao.</p>';
            return;
        }
        var semanas = groupByWeeks(dados.dias);
        var html = '<div class="calendario-container">';
        html += '<div class="calendario-header">';
        html += '<div class="calendario-meta"><strong>' + (dados.pacienteNome || '') + '</strong> - Media: ' + (dados.mediaGeralPeriodo || 0).toFixed(1) + '% | ' + (dados.totalDiasRegistrados || 0) + ' dias</div>';
        html += '<div class="calendario-legenda">';
        html += '<span class="legenda-item otimo">Otimo</span><span class="legenda-item bom">Bom</span><span class="legenda-item regular">Regular</span><span class="legenda-item ruim">Ruim</span><span class="legenda-item sem-dados">Sem dados</span>';
        html += '</div></div><div class="calendario-grid">';
        for (var s = 0; s < semanas.length; s++) {
            html += '<div class="calendario-week">';
            for (var d = 0; d < 7; d++) {
                var dia = semanas[s] ? semanas[s][d] : null;
                if (dia) {
                    var nivel = (dia.nivel || 'SEM_DADOS').toLowerCase();
                    var tt = dia.data + ' - ' + dia.totalTomados + ' de ' + dia.totalAlarmes + ' (' + (dia.percentualAdesao || 0).toFixed(0) + '%)';
                    html += '<div class="calendario-day ' + nivel + '" title="' + tt + '"></div>';
                } else {
                    html += '<div class="calendario-day sem-dados"></div>';
                }
            }
            html += '</div>';
        }
        html += '</div></div>';
        container.innerHTML = html;
    }

    function groupByWeeks(dias) {
        var semanas = [], currentWeek = [];
        for (var i = 0; i < dias.length; i++) {
            if (currentWeek.length === 7) { semanas.push(currentWeek); currentWeek = []; }
            currentWeek.push(dias[i]);
        }
        if (currentWeek.length > 0) semanas.push(currentWeek);
        return semanas;
    }

    return { render: render };
})();

/* Avatar Picker */
const AvatarPicker = (function() {
    function getCores() {
        return [
            {nome:'AZUL',hex:'#06B6D4'},{nome:'VERDE',hex:'#10B981'},{nome:'AMARELO',hex:'#F59E0B'},
            {nome:'VERMELHO',hex:'#EF4444'},{nome:'ROXO',hex:'#8B5CF6'},{nome:'LARANJA',hex:'#F97316'},
            {nome:'ROSA',hex:'#EC4899'},{nome:'CIANO',hex:'#22D3EE'},{nome:'CINZA',hex:'#6B7280'}
        ];
    }
    function render(container, avatares, corAtual, onSelect) {
        var html = '<div style="margin-bottom:16px;"><div style="font-size:13px;font-weight:600;color:var(--text-strong);margin-bottom:8px;">Escolha um avatar</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:8px;">';
        for (var i = 0; i < avatares.length; i++) {
            html += '<div class="avatar-option" data-avatar="' + avatares[i] + '" style="cursor:pointer;padding:4px;border-radius:50%;border:2px solid transparent;width:48px;height:48px;display:flex;align-items:center;justify-content:center;"><div class="avatar avatar-md" style="background:var(--brand-100);color:var(--brand-700);width:40px;height:40px;font-size:16px;"><i class="fas fa-user"></i></div></div>';
        }
        html += '</div></div><div><div style="font-size:13px;font-weight:600;color:var(--text-strong);margin-bottom:8px;">Escolha uma cor</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
        var cores = getCores();
        for (var j = 0; j < cores.length; j++) {
            var c = cores[j];
            var sel = c.nome === corAtual ? 'border:3px solid white;outline:2px solid ' + c.hex + ';' : '';
            html += '<div class="color-option" data-cor="' + c.nome + '" style="background:' + c.hex + ';width:32px;height:32px;border-radius:50%;cursor:pointer;' + sel + '"></div>';
        }
        html += '</div></div>';
        container.innerHTML = html;
        container.querySelectorAll('.avatar-option').forEach(function(el) {
            el.addEventListener('click', function() {
                container.querySelectorAll('.avatar-option').forEach(function(o){o.style.border='2px solid transparent';});
                el.style.border='3px solid var(--brand-500)';
                onSelect(el.dataset.avatar, corAtual);
            });
        });
        container.querySelectorAll('.color-option').forEach(function(el) {
            el.addEventListener('click', function() {
                var corHex = el.style.background;
                container.querySelectorAll('.color-option').forEach(function(o){o.style.border='none';o.style.outline='';});
                el.style.border='3px solid white';
                el.style.outline='2px solid ' + corHex;
            });
        });
    }
    return { render: render };
})();
