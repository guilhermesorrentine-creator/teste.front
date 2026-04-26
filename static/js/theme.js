/**
 * DeltaSaúde - Theme Manager
 * Gerenciamento de Dark/Light Mode
 */

const ThemeManager = (function() {
    const THEME_KEY = 'delta_theme';
    const DARK_CLASS = 'dark';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Obtém o tema salvo no localStorage ou detecta preferência do sistema
     */
    function getSavedTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === DARK_THEME || saved === LIGHT_THEME) {
            return saved;
        }
        // Detecta preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }
        return LIGHT_THEME;
    }

    /**
     * Aplica o tema ao documento
     */
    function applyTheme(theme) {
        if (theme === DARK_THEME) {
            document.documentElement.setAttribute('data-theme', DARK_THEME);
            document.documentElement.classList.add(DARK_CLASS);
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.documentElement.classList.remove(DARK_CLASS);
        }
        localStorage.setItem(THEME_KEY, theme);
        updateToggleIcon(theme);
    }

    /**
     * Atualiza o ícone do botão de toggle
     */
    function updateToggleIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                if (theme === DARK_THEME) {
                    icon.className = 'fas fa-sun';
                    toggleBtn.setAttribute('aria-label', 'Ativar modo claro');
                    toggleBtn.setAttribute('title', 'Ativar modo claro');
                } else {
                    icon.className = 'fas fa-moon';
                    toggleBtn.setAttribute('aria-label', 'Ativar modo escuro');
                    toggleBtn.setAttribute('title', 'Ativar modo escuro');
                }
            }
        }
    }

    /**
     * Alterna entre os temas
     */
    function toggle() {
        const current = getSavedTheme();
        const newTheme = current === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
    }

    /**
     * Inicializa o tema (deve ser chamado o mais cedo possível)
     */
    function init() {
        const theme = getSavedTheme();
        applyTheme(theme);

        // Observa mudanças de preferência do sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
                }
            });
        }

        // Configura botão de toggle
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggle);
        }
    }

    /**
     * Retorna o tema atual
     */
    function getCurrentTheme() {
        return getSavedTheme();
    }

    /**
     * Verifica se está em modo escuro
     */
    function isDark() {
        return getSavedTheme() === DARK_THEME;
    }

    // API pública
    return {
        init: init,
        toggle: toggle,
        getCurrentTheme: getCurrentTheme,
        isDark: isDark,
        LIGHT: LIGHT_THEME,
        DARK: DARK_THEME
    };
})();

// Auto-inicialização imediata (antes do DOM) para evitar flash
(function() {
    const savedTheme = localStorage.getItem('delta_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
    } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
    }
})();

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});