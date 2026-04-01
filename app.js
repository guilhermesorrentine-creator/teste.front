// A sua URL da Render (sem a barra no final)
const BASE_URL = "https://teste-ujlk.onrender.com";

// Se o seu Spring Security estiver ativo, usaremos isso:
const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:admin123'),
    'Content-Type': 'application/json'
};

async function carregarDoses() {
    const container = document.getElementById('lista-alarmes');

    try {
        // Trocado localhost pela BASE_URL da Render
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
                
                divCard.innerHTML = `
                    <div class="info-remedio">
                        <h2>${grupo.nomeTratamento}</h2>
                        <span>Status: <b>${dose.tomado ? "Concluído" : "Pendente"}</b></span>
                        <p style="font-size: 0.8rem; color: #95a5a6; margin-top: 5px;">ID: ${dose.alarmeId}</p>
                    </div>

                    <div class="controles">
                        <button class="btn confirmar" onclick="registrarDose(${dose.alarmeId})">
                            <i class="fa-solid fa-check"></i>
                            TOMAR
                        </button>
                        <button class="btn cancelar">
                            <i class="fa-solid fa-xmark"></i>
                            PULAR
                        </button>
                    </div>
                `;
                container.appendChild(divCard);
            });
        });

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        container.innerHTML = `<div class='card-dose' style='border: 2px solid red;'>
            <h2>Erro de Conexão</h2>
            <p>Não foi possível conectar ao servidor na Render.</p>
        </div>`;
    }
}

async function registrarDose(id) {
    try {
        // Trocado localhost pela BASE_URL da Render
        const res = await fetch(`${BASE_URL}/api/tratamento/alarme/${id}/confirmar`, {
            method: 'PATCH',
            headers: AUTH_HEADER
        });

        if (res.ok) {
            console.log(`Dose ${id} confirmada com sucesso!`);
            carregarDoses(); 
        } else {
            alert("Erro ao confirmar dose no servidor.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

window.onload = carregarDoses;