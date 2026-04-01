// Configurações Globais
const BASE_URL = "https://teste-ujlk.onrender.com";

// Credenciais de acesso (Basic Auth)
const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:admin123'),
    'Content-Type': 'application/json'
};

/**
 * Busca os alarmes do servidor e renderiza na tela
 */
async function carregarDoses() {
    const container = document.getElementById('lista-alarmes');
    console.log("Atualizando lista de doses...");

    try {
        const res = await fetch(`${BASE_URL}/api/tratamento/alarme`, {
            headers: AUTH_HEADER
        });
        
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

        const grupos = await res.json();
        
        // Se não houver dados, limpa o container e avisa
        if (!grupos || grupos.length === 0) {
            container.innerHTML = "<div class='card-dose'><h2>Nenhum alarme pendente</h2></div>";
            return;
        }

        container.innerHTML = ""; 

        grupos.forEach(grupo => {
            grupo.alarmes.forEach(dose => {
                const divCard = document.createElement('div');
                divCard.className = 'card-dose';
                
                // Lógica visual: Se já foi tomado, mostra um check, senão mostra o botão
                const controlesHtml = dose.tomado 
                    ? `<span style="color: #2ecc71; font-weight: bold; font-size: 1.1rem;">
                        <i class="fa-solid fa-circle-check"></i> CONCLUÍDO
                       </span>`
                    : `<button class="btn confirmar" onclick="registrarDose(${dose.alarmeId})">
                            <i class="fa-solid fa-check"></i> TOMAR
                       </button>
                       <button class="btn cancelar">
                            <i class="fa-solid fa-xmark"></i> PULAR
                       </button>`;

                divCard.innerHTML = `
                    <div class="info-remedio">
                        <h2>${grupo.nomeTratamento}</h2>
                        <span>Status: <b style="color: ${dose.tomado ? '#2ecc71' : '#e67e22'}">
                            ${dose.tomado ? "Concluído" : "Pendente"}</b>
                        </span>
                        <p style="font-size: 0.7rem; color: #95a5a6; margin-top: 5px;">ID Alarme: ${dose.alarmeId}</p>
                    </div>

                    <div class="controles">
                        ${controlesHtml}
                    </div>
                `;
                container.appendChild(divCard);
            });
        });

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        container.innerHTML = `
            <div class='card-dose' style='border: 2px solid #e74c3c;'>
                <h2 style="color: #e74c3c;">Erro de Conexão</h2>
                <p>O servidor na Render pode estar acordando. Tente atualizar a página em instantes.</p>
            </div>`;
    }
}

/**
 * Registra que a dose foi tomada (Escopo Global para funcionar com onclick do HTML)
 */
window.registrarDose = async function(id) {
    console.log("Enviando confirmação para Alarme ID:", id);
    
    try {
        const res = await fetch(`${BASE_URL}/api/tratamento/alarme/${id}/confirmar`, {
            method: 'PATCH',
            headers: AUTH_HEADER
        });

        if (res.ok) {
            console.log(`Dose ${id} confirmada com sucesso!`);
            // Pequeno delay para garantir que o banco na Render persistiu antes do refresh
            setTimeout(() => {
                carregarDoses(); 
            }, 300);
        } else {
            const erroMsg = await res.text();
            console.error("Servidor recusou a operação:", res.status, erroMsg);
            alert("Não foi possível confirmar a dose. Verifique se o remédio ainda tem estoque.");
        }
    } catch (error) {
        console.error("Erro na comunicação com a API:", error);
        alert("Erro de rede ao tentar confirmar. Verifique o console (F12).");
    }
};

// Inicia o carregamento quando a página abre
window.onload = carregarDoses;