/* =============================================================================
   js/pages/cliente.js | Renderização Protegida do Laboratório VIP
   ============================================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  // Guarda de Rota: Se não estiver logado, atira para o Login
  if (!localStorage.getItem('forge_token')) {
    window.location.href = '/cadastro';
    return;
  }
  
  await carregarDashboardDoCliente();
});

async function carregarDashboardDoCliente() {
  const container = document.getElementById('cliente');
  let usuarioAtivo = window.usuarioAtivo || JSON.parse(localStorage.getItem('forge_user')) || { nome: 'Cliente VIP' };

  // Aqui você pode adicionar um Fetch para buscar os dados frescos do utilizador usando o Token,
  // mas usaremos os dados cacheados por enquanto para a renderização instantânea.

  try {
    renderDashboardVIP(usuarioAtivo);
    _injetarModulosVisaoGeral(); // Traz os módulos extras do antigo forge-visao-geral.js
  } catch (err) {
    console.error("[FORGE Lab] Erro Crítico de DOM: ", err);
    if (container) container.innerHTML = `<div style="color: #ff4d4d; text-align: center; padding: 50px;">Erro ao carregar laboratório.</div>`;
  }
}

function renderDashboardVIP(usuario) {
  const container = document.getElementById('cliente');
  if (!container) return;

  const nome = usuario.nome || 'Cliente';
  const idCliente = usuario.id || `FRG-${Math.floor(Math.random() * 9000) + 1000}`;

  container.innerHTML = `
    <header class="sec-header" style="text-align: left; padding-top: 40px;">
      <p class="sec-header__eyebrow">Laboratório de Testes</p>
      <h2 class="sec-header__title">Bem-vindo(a), <span style="color:var(--color-blue)">${nome}</span>.</h2>
      <p class="sec-header__sub">ID de Cliente: ${idCliente}</p>
    </header>

    <div class="lab-tabs-nav">
      <button class="lab-tab-btn active" onclick="trocarAbaLab('visao-geral', this)">Visão Geral</button>
      <button class="lab-tab-btn" onclick="trocarAbaLab('pedidos', this)">Meus Projetos</button>
      <button class="lab-tab-btn" onclick="trocarAbaLab('telemetria', this)">Telemetria</button>
    </div>

    <div id="aba-visao-geral" class="lab-tab-content active">
      <div class="lab__grid-main">
        <div class="lab__col-main" style="display: flex; flex-direction: column; gap: 30px;">
          </div>
        <div class="lab__col-sidebar" style="display: flex; flex-direction: column; gap: 30px;">
          </div>
      </div>
    </div>
  `;
}

// O resto do código que vocês tinham no forge-visao-geral.js vem para cá!
function _injetarModulosVisaoGeral() {
  const abaVG = document.getElementById('aba-visao-geral');
  if (!abaVG) return;

  const colMain    = abaVG.querySelector('.lab__col-main');
  const colSidebar = abaVG.querySelector('.lab__col-sidebar');

  if (!document.getElementById('modulo-perks') && colMain) {
    const wrapPerks = document.createElement('div');
    wrapPerks.id = 'modulo-perks';
    wrapPerks.innerHTML = _htmlModuloPerks();
    colMain.appendChild(wrapPerks);
  }

  if (!document.getElementById('modulo-terminal') && colSidebar) {
    const wrapTerm = document.createElement('div');
    wrapTerm.id = 'modulo-terminal';
    wrapTerm.innerHTML = _htmlModuloTerminal();
    colSidebar.appendChild(wrapTerm);
  }
}

function _htmlModuloPerks() {
  return `<div class="client-card">
            <h3 class="client-card-title">Hardware Homologado</h3>
            <p style="color: var(--color-gray); font-size: 14px;">Parceiras oficiais FORGE.</p>
          </div>`;
}

function _htmlModuloTerminal() {
  return `<div class="client-card" style="background: var(--color-iron);">
            <h3 class="client-card-title" style="color: #00ff66; font-family: var(--font-mono);">>_ TERMINAL</h3>
            <p style="color: var(--color-gray); font-size: 12px; font-family: var(--font-mono);">Acesso concedido.</p>
          </div>`;
}

window.trocarAbaLab = function(idAba, btnElement) {
  document.querySelectorAll('.lab-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.lab-tab-content').forEach(aba => aba.classList.remove('active'));
  
  btnElement.classList.add('active');
  const abaAtiva = document.getElementById(`aba-${idAba}`);
  if (abaAtiva) abaAtiva.classList.add('active');
};