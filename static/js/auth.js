/**
 * DeltaSaúde - Auth Manager
 * Gerenciamento de autenticação JWT e proteção de rotas
 */

const AuthManager = (function() {
    const TOKEN_KEY = 'delta_token';
    const USER_KEY = 'delta_user';

    /**
     * Salva o token JWT no localStorage
     */
    function saveToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    /**
     * Obtém o token JWT do localStorage
     */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Remove o token e dados do usuário
     */
    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = 'index.html';
    }

    /**
     * Verifica se o usuário está logado e o token é válido
     */
    function isLoggedIn() {
        const token = getToken();
        if (!token) {
            return false;
        }
        try {
            const payload = decodeToken(token);
            if (!payload || !payload.exp) {
                return false;
            }
            // Verifica se o token não expirou
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }

    /**
     * Decodifica o payload do JWT sem bibliotecas externas
     */
    function decodeToken(token) {
        if (!token) {
            return null;
        }
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            const payload = parts[1];
            // Decodifica base64url para base64 padrão
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            // Decodifica para string JSON
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    /**
     * Obtém os dados do usuário logado a partir do token
     */
    function getLoggedUser() {
        const token = getToken();
        if (!token) {
            return null;
        }
        const payload = decodeToken(token);
        if (!payload) {
            return null;
        }
        return {
            id: payload.userId,
            email: payload.sub,
            role: payload.role
        };
    }

    /**
     * Salva dados adicionais do usuário
     */
    function saveUserData(userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    /**
     * Obtém dados do usuário salvos
     */
    function getUserData() {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Obtém o ID do usuário logado
     */
    function getUserId() {
        const user = getLoggedUser();
        return user ? user.id : null;
    }

    /**
     * Verifica se o usuário tem determinada role
     */
    function hasRole(role) {
        const user = getLoggedUser();
        return user && user.role === role;
    }

    /**
     * Protege uma página - redireciona para login se não autenticado
     */
    function protectPage() {
        if (!isLoggedIn()) {
            logout();
            return false;
        }
        return true;
    }

    /**
     * Redireciona para dashboard se já logado
     */
    function redirectIfLoggedIn() {
        if (isLoggedIn()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    }

    /**
     * Obtém o header de autorização para requisições
     */
    function getAuthHeader() {
        const token = getToken();
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    /**
     * Verifica resposta e faz logout se 401
     */
    function handleResponse(response) {
        if (response.status === 401) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        return response;
    }

    // API pública
    return {
        saveToken: saveToken,
        getToken: getToken,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getLoggedUser: getLoggedUser,
        saveUserData: saveUserData,
        getUserData: getUserData,
        getUserId: getUserId,
        hasRole: hasRole,
        protectPage: protectPage,
        redirectIfLoggedIn: redirectIfLoggedIn,
        getAuthHeader: getAuthHeader,
        handleResponse: handleResponse,
        decodeToken: decodeToken
    };
})();