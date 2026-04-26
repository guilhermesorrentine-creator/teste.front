/**
 * DeltaSaúde - API Client
 */
const ApiClient = (function() {
    const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8080'
        : 'https://teste-ujlk.onrender.com';

    function getHeaders() {
        return { 'Content-Type': 'application/json', ...AuthManager.getAuthHeader() };
    }

    async function request(endpoint, options = {}) {
        ComponentsManager.showLoading();
        try {
            const response = await fetch(BASE_URL + endpoint, { headers: getHeaders(), ...options });
            AuthManager.handleResponse(response);
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.mensagem || err.erro || 'Erro ao processar sua solicitação.');
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            if (error.message.includes('Sessão expirada')) throw error;
            throw new Error(formatErrorMessage(error.message));
        } finally {
            ComponentsManager.hideLoading();
        }
    }

    function formatErrorMessage(message) {
        const map = {
            'failed to fetch': 'Não foi possível conectar ao servidor.',
            'networkerror': 'Erro de rede. Verifique sua conexão.',
            'unexpected token': 'Erro no servidor. Tente novamente mais tarde.'
        };
        for (const [k, v] of Object.entries(map)) {
            if (message.toLowerCase().includes(k)) return v;
        }
        return message || 'Ocorreu um erro inesperado. Tente novamente.';
    }

    async function login(email, senha) {
        const r = await request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
        AuthManager.saveToken(r.token);
        if (r.usuario) AuthManager.saveUserData(r.usuario);
        return r;
    }

    async function cadastrar(nome, email, senha) {
        return await request('/api/v1/auth/cadastro', { method: 'POST', body: JSON.stringify({ nome, email, senha }) });
    }

    async function listarMedicamentos()          { return await request('/api/v1/medicamentos'); }
    async function buscarMedicamento(id)          { return await request(`/api/v1/medicamentos/${id}`); }
    async function criarMedicamento(dados)        { return await request('/api/v1/medicamentos', { method: 'POST', body: JSON.stringify(dados) }); }
    async function atualizarMedicamento(id, dados){ return await request(`/api/v1/medicamentos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }); }
    async function deletarMedicamento(id)         { return await request(`/api/v1/medicamentos/${id}`, { method: 'DELETE' }); }

    async function listarTratamentos()   { return await request('/api/v1/tratamentos'); }
    async function buscarTratamento(id)  { return await request(`/api/v1/tratamentos/${id}`); }
    async function criarTratamento(d)    { return await request('/api/v1/tratamentos', { method: 'POST', body: JSON.stringify(d) }); }
    async function deletarTratamento(id) { return await request(`/api/v1/tratamentos/${id}`, { method: 'DELETE' }); }

    async function listarAlarmes()                    { return await request('/api/v1/alarmes'); }
    async function listarAlarmesPendentes()            { return await request('/api/v1/alarmes/pendentes'); }
    async function listarAlarmesPorTratamento(tid)     { return await request(`/api/v1/alarmes/tratamento/${tid}`); }
    async function confirmarAlarme(id)                 { return await request(`/api/v1/alarmes/${id}/confirmar`, { method: 'PATCH' }); }

    async function perguntarAssistente(pergunta) {
        return await request('/api/v1/assistente/perguntar', { method: 'POST', body: JSON.stringify({ pergunta }) });
    }

    // Médico endpoints
    async function medicoDashboard() { return await request('/api/v1/medico/dashboard'); }
    async function medicoListarPacientes() { return await request('/api/v1/medico/pacientes'); }
    async function medicoAdicionarPaciente(dados) { return await request('/api/v1/medico/pacientes', { method: 'POST', body: JSON.stringify(dados) }); }
    async function medicoRemoverPaciente(id) { return await request('/api/v1/medico/pacientes/' + id, { method: 'DELETE' }); }
    async function medicoDashboardPaciente(id) { return await request('/api/v1/medico/pacientes/' + id + '/dashboard'); }
    async function medicoRelatorioAdesao() { return await request('/api/v1/medico/relatorio/adesao'); }
    async function medicoCalendarioAdesao(pacienteId, meses) { return await request('/api/v1/medico/pacientes/' + pacienteId + '/adesao/calendario?meses=' + (meses || 3)); }
    async function medicoPlano() { return await request('/api/v1/medico/plano'); }

    // Acessibilidade
    async function getAcessibilidade() { return await request('/api/v1/acessibilidade'); }
    async function getConfiguracoesVisuais() { return await request('/api/v1/acessibilidade/configuracoes-visuais'); }
    async function atualizarModoAcessibilidade(modo) { return await request('/api/v1/acessibilidade/modo', { method: 'PATCH', body: JSON.stringify({ modo }) }); }
    async function recusarSugestaoAcessibilidade() { return await request('/api/v1/acessibilidade/recusar-sugestao', { method: 'POST' }); }

    // Adesão
    async function getCalendarioAdesao(meses) { return await request('/api/v1/adesao/calendario?meses=' + (meses || 3)); }
    async function getCalendarioAdesaoRange(inicio, fim) { return await request('/api/v1/adesao/calendario/range?inicio=' + inicio + '&fim=' + fim); }

    // Avatar
    async function getAvataresMedico() { return await request('/api/v1/avatares/medico'); }
    async function getAvataresPaciente() { return await request('/api/v1/avatares/paciente'); }
    async function getCores() { return await request('/api/v1/avatares/cores'); }
    async function atualizarMeuAvatar(dados) { return await request('/api/v1/avatares/paciente/meu-avatar', { method: 'PATCH', body: JSON.stringify(dados) }); }

    // Google Calendar
    async function googleAuthorize() { return await request('/api/v1/calendar/authorize'); }
    async function googleStatus() { return await request('/api/v1/calendar/status'); }
    async function googleCriarEvento(dados) { return await request('/api/v1/calendar/eventos', { method: 'POST', body: JSON.stringify(dados) }); }
    async function googleListarEventos(dataInicio, dataFim) { return await request('/api/v1/calendar/eventos?dataInicio=' + dataInicio + '&dataFim=' + dataFim); }
    async function googleDeletarEvento(id) { return await request('/api/v1/calendar/eventos/' + id, { method: 'DELETE' }); }

    return {
        login, cadastrar,
        listarMedicamentos, buscarMedicamento, criarMedicamento, atualizarMedicamento, deletarMedicamento,
        listarTratamentos, buscarTratamento, criarTratamento, deletarTratamento,
        listarAlarmes, listarAlarmesPendentes, listarAlarmesPorTratamento, confirmarAlarme,
        perguntarAssistente,
        medicoDashboard, medicoListarPacientes, medicoAdicionarPaciente, medicoRemoverPaciente,
        medicoDashboardPaciente, medicoRelatorioAdesao, medicoCalendarioAdesao, medicoPlano,
        getAcessibilidade, getConfiguracoesVisuais, atualizarModoAcessibilidade, recusarSugestaoAcessibilidade,
        getCalendarioAdesao, getCalendarioAdesaoRange,
        getAvataresMedico, getAvataresPaciente, getCores, atualizarMeuAvatar,
        googleAuthorize, googleStatus, googleCriarEvento, googleListarEventos, googleDeletarEvento,
        BASE_URL
    };
})();