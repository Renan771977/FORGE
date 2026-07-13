/* =============================================================================
   FORGE Performance Computing | forge-chamados-api.js (Versão Corrigida)
   ============================================================================= */

'use strict';

const FORGE_API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://forge-suporte-api.up.railway.app'; // Troque pela URL real do seu backend no Railway se necessário

// Busca chamados reais do Back-end
async function buscarChamadosDoCliente() {
  const token = localStorage.getItem('forge_token');
  if (!token) return [];

  try {
    const resposta = await fetch(`${FORGE_API_BASE}/api/cliente/chamados`, {
      method:  'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (resposta.status === 401 || resposta.status === 403) {
      localStorage.removeItem('forge_token');
      return [];
    }

    if (!resposta.ok) return [];

    const dados = await resposta.json();
    return Array.isArray(dados.chamados) ? dados.chamados : [];
  } catch (err) {
    console.error('[FORGE] Falha ao buscar chamados:', err.message);
    return [];
  }
}

// Renderiza o Stepper Visual baseado nos dados do Banco
function renderizarChamadosNoStepper(chamados) {
  if (!chamados || chamados.length === 0) {
    return `
      <div style="text-align: center; padding: 25px 20px; background: rgba(0,0,0,0.15); border: 1px dashed rgba(42,132,208,0.15); border-radius: 6px;">
        <p style="color: var(--color-gray); font-size: 14px; margin-bottom: 14px; line-height: 1.6;">Você não possui nenhum chamado ou ordem técnica em andamento no momento.</p>
        <button class="btn-ghost" style="font-size: 12px; padding: 9px 20px; border-color: var(--color-blue); color: var(--color-blue); font-weight: 700;" onclick="showSection('consultoria')">
          ABRIR CHAMADO TÉCNICO
        </button>
      </div>
    `;
  }

  const PASSOS = ['Triagem', 'Análise', 'Bancada', 'Pronto'];

  return chamados.map(ch => {
    const passoAtual = Math.min(Math.max(parseInt(ch.passoAtual) || 1, 1), 4);
    const dataFormatada = ch.data_criacao ? new Date(ch.data_criacao).toLocaleDateString('pt-BR') : '—';
    const larguraLinha = `${((passoAtual - 1) / 3) * 100}%`;

    const passosHTML = PASSOS.map((nomePasso, index) => {
      const numPasso   = index + 1;
      const concluido  = numPasso < passoAtual;
      const atual      = numPasso === passoAtual;

      let bolaCor  = 'rgba(255,255,255,0.08)';
      let textoCor = 'var(--color-gray)';
      let glowCSS  = '';
      let pulsarCSS = '';

      if (concluido) {
        bolaCor  = 'var(--color-blue)';
        textoCor = 'var(--color-ash)';
      }
      if (atual) {
        bolaCor   = '#ffbd2e';
        textoCor  = '#ffbd2e';
        glowCSS   = 'box-shadow: 0 0 0 3px rgba(255,189,46,0.25), 0 0 12px rgba(255,189,46,0.5);';
        pulsarCSS = 'animation: forgeStepPulse 2s ease-in-out infinite;';
      }

      return `
        <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background: ${bolaCor}; ${glowCSS} ${pulsarCSS} z-index: 3; position: relative; flex-shrink: 0;"></div>
          <span style="font-family: var(--font-mono); font-size: 10px; color: ${textoCor}; text-transform: uppercase; letter-spacing: 0.8px; line-height: 1.2;">${nomePasso}</span>
        </div>
      `;
    }).join('');

    return `
      <div style="background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 20px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; gap: 10px; flex-wrap: wrap;">
          <div>
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); letter-spacing: 1.5px; display: block; margin-bottom: 4px;">${ch.ticket_id} · ${dataFormatada}</span>
            <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--color-ash); text-transform: uppercase; margin: 0;">${ch.assunto}</h4>
          </div>
          <span style="font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 2px; ${_estilosBadge(ch.status)}">${_labelStatus(ch.status)}</span>
        </div>
        <div style="position: relative; display: flex; justify-content: space-between; align-items: flex-start; width: 100%; padding: 0 7px;">
          <div style="position: absolute; top: 7px; left: 28px; right: 28px; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
          <div style="position: absolute; top: 7px; left: 28px; width: calc(${larguraLinha} * (100% - 56px) / 100%); height: 2px; background: var(--color-blue); z-index: 2; transition: width 0.6s ease;"></div>
          ${passosHTML}
        </div>
      </div>
    `;
  }).join('');
}

/// Injeta os dados na tela interceptando o contêiner pelo ID
async function carregarEInjetarChamados() {
  const containerAlvo = document.getElementById('box-chamados');
  
  if (!containerAlvo) return; // Se não achar a div, não faz nada (previne erros na Home)

  // Exibe animação de carregamento (Skeleton) enquanto busca no banco
  containerAlvo.innerHTML = `
    <h3 class="client-card-title">Suporte técnico</h3>
    <div style="height: 40px; background: rgba(255,255,255,0.03); border-radius: 4px; animation: forgePulse 1.5s infinite;"></div>
  `;

  // Coleta dados reais do banco
  const chamadosREAIS = await buscarChamadosDoCliente();
  
  // Renderiza e substitui o HTML interno do bloco
  containerAlvo.innerHTML = `
    <h3 class="client-card-title">Suporte técnico</h3>
    ${renderizarChamadosNoStepper(chamadosREAIS)}
  `;
}
// Executa a busca automática de tempos em tempos ou quando a página atualiza
setInterval(carregarEInjetarChamados, 3000);

function _labelStatus(status) {
  return status === 'EM_ATENDIMENTO' ? 'Em Análise' : status === 'RESOLVIDO' ? 'Resolvido' : 'Aberto';
}

function _estilosBadge(status) {
  if (status === 'EM_ATENDIMENTO') return 'background: rgba(255,189,46,0.12); color: #ffbd2e; border: 0.5px solid rgba(255,189,46,0.3);';
  if (status === 'RESOLVIDO') return 'background: rgba(0,166,80,0.1); color: #00a650; border: 0.5px solid rgba(0,166,80,0.3);';
  return 'background: rgba(42,132,208,0.12); color: #4D9FE8; border: 0.5px solid rgba(42,132,208,0.3);';
}