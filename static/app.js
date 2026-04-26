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
        
        if (!grupos || grupos.length === 0) {
            container.innerHTML = "<div class='card-dose'><h2>Nenhum alarme pendente</h2></div>";
            return;
        }

        container.innerHTML = ""; 

        grupos.forEach(grupo => {
            grupo.alarmes.forEach(dose => {
                const divCard = document.createElement('div');
                divCard.className = 'card-dose';
                
                // --- MELHORIA VISUAL: Borda lateral colorida ---
                if (dose.tomado) {
                    divCard.style.borderLeft = "6px solid #2ecc71"; // Verde para concluído
                    divCard.style.backgroundColor = "#f9fefb";
                } else {
                    divCard.style.borderLeft = "6px solid #e67e22"; // Laranja para pendente
                }

                // --- MELHORIA VISUAL: Lógica do botão vs selo de tomado ---
                const controlesHtml = dose.tomado 
                    ? `<div style="width: 100%; text-align: center; padding: 12px; background: #e8f8f0; border-radius: 10px; border: 1px solid #2ecc71;">
                        <span style="color: #2ecc71; font-weight: bold; font-size: 1.2rem;">
                            <i class="fa-solid fa-circle-check"></i> TOMADO
                        </span>
                       </div>`
                    : `<button class="btn confirmar" onclick="registrarDose(${dose.alarmeId})">
                            <i class="fa-solid fa-check"></i> TOMAR
                       </button>
                       <button class="btn cancelar" onclick="alert('Funcionalidade de pular em breve!')">
                            <i class="fa-solid fa-xmark"></i> PULAR
                       </button>`;

                divCard.innerHTML = `
                    <div class="info-remedio">
                        <h2 style="margin-bottom: 5px;">${grupo.nomeTratamento}</h2>
                        <span>Status: <b style="color: ${dose.tomado ? '#2ecc71' : '#e67e22'}">
                            ${dose.tomado ? "Concluído" : "Pendente"}</b>
                        </span>
                        <p style="font-size: 0.7rem; color: #95a5a6; margin-top: 8px;">Protocolo: #${dose.alarmeId}</p>
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
                <p>O servidor pode estar iniciando. Tente atualizar em 30 segundos.</p>
            </div>`;
    }
}

/**
 * Registra que a dose foi tomada (Global para o HTML)
 */
window.registrarDose = async function(id) {
    console.log("Enviando confirmação para Alarme ID:", id);
    
    try {
        const res = await fetch(`${BASE_URL}/api/tratamento/alarme/${id}/confirmar`, {
            method: 'PATCH',
            headers: AUTH_HEADER
        });

        if (res.ok) {
            console.log(`Dose ${id} confirmada!`);
            // Atualiza a tela imediatamente
            await carregarDoses(); 
        } else {
            const erroMsg = await res.text();
            console.error("Erro:", res.status, erroMsg);
            alert("Não foi possível confirmar. Verifique se há estoque do medicamento.");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
        alert("Falha ao conectar com o servidor.");
    }
};

// Carrega ao iniciar
window.onload = carregarDoses;