/* =============================================================================
   js/global.js | Núcleo de Estado, Navegação e UI Global
   ============================================================================= */
'use strict';

// Estado Global da Aplicação
window.isLoggedIn = false;
window.usuarioAtivo = null;
window.BANCO_DE_HARDWARE = {}; // Populado pela API — sempre um OBJETO indexado por id
window.carrinho = [];

/* -----------------------------------------------------------------------------
   CARREGAMENTO DO CATÁLOGO
   Dispara IMEDIATAMENTE (não espera o DOMContentLoaded) e expõe uma Promise.
   As páginas dão `await window.forgeCatalogoPronto` em vez de chutar um
   setTimeout. Isso elimina a corrida que deixava o catálogo vazio.
   -------------------------------------------------------------------------- */
window.forgeCatalogoPronto = carregarCatalogoGlobal();

async function carregarCatalogoGlobal() {
  if (typeof window.apiGetCatalogo !== 'function') {
    console.error('[FORGE] api.js não foi carregado antes do global.js. Confira a ordem dos <script>.');
    return window.BANCO_DE_HARDWARE;
  }

  const lista = await window.apiGetCatalogo();

  // apiGetCatalogo devolve null em caso de falha real, ou um Array de builds.
  if (lista === null) {
    console.error('[FORGE] Catálogo indisponível: a API falhou. Veja o erro acima.');
    return window.BANCO_DE_HARDWARE;
  }

  if (!Array.isArray(lista)) {
    console.error('[FORGE] A API devolveu um formato inesperado em "builds":', lista);
    return window.BANCO_DE_HARDWARE;
  }

  if (lista.length === 0) {
    console.warn('[FORGE] A API respondeu OK, mas a tabela maquinas_catalogo está vazia.');
    return window.BANCO_DE_HARDWARE;
  }

  // Converte o Array em objeto indexado pelo id REAL da build.
  // Antes: BANCO_DE_HARDWARE = lista  ->  Object.keys() devolvia "0","1","2"
  // e o id verdadeiro do banco se perdia.
  const banco = {};
  lista.forEach((linha, i) => {
    const build = normalizarBuild(linha);
    const chave = build.id ?? `build-${i}`;
    banco[chave] = build;
  });

  window.BANCO_DE_HARDWARE = banco;
  console.log(`[FORGE] Catálogo carregado: ${Object.keys(banco).length} build(s).`);

  // Avisa quem quiser ouvir (útil para componentes que carregam depois)
  document.dispatchEvent(new CustomEvent('forge:catalogo-pronto', { detail: banco }));

  return banco;
}

/* -----------------------------------------------------------------------------
   NORMALIZAÇÃO
   Converte a linha do MySQL para o MESMO formato que o script.js original
   usava. Isso não é coincidência: a tabela maquinas_catalogo foi modelada a
   partir daquele objeto, então manter o formato faz todo o código legado
   (cards, quiz, benchmark, detalhes) continuar valendo.

   Coluna MySQL      ->  propriedade JS
     id              ->  id            "business-pro"
     nome            ->  name
     preco           ->  price         "R$ 3.500"  (string, como antes)
     badge           ->  badge         "OFFICE"
     render_class    ->  renderClass   "black" / "white"
     img             ->  img
     tagline         ->  tagline
     specs   (json)  ->  specs         { cpu, gpu, ram, psu, ... }
     benchmarks(json)->  benchmarks    { fps, temp, timespy, cinebench }
     estoque (int)   ->  estoque
   -------------------------------------------------------------------------- */

function normalizarBuild(linha) {
  return {
    id:          linha.id,
    name:        linha.nome  || 'Sem nome',
    price:       linha.preco || 'Sob consulta',
    badge:       linha.badge || '',
    renderClass: linha.render_class || 'black',
    img:         linha.img || '/img/logo.png',
    tagline:     linha.tagline || '',
    specs:       comoObjeto(linha.specs),
    benchmarks:  comoObjeto(linha.benchmarks),
    estoque:     Number(linha.estoque) || 0,
  };
}

function comoObjeto(valor) {
  if (!valor) return {};
  if (typeof valor === 'object') return valor;       // mysql2 já parseia colunas JSON
  try { return JSON.parse(valor) || {}; } catch { return {}; }
}

/* -----------------------------------------------------------------------------
   HELPERS DE CATÁLOGO (regras vindas do script.js original)
   -------------------------------------------------------------------------- */

// "R$ 3.500" -> 3500 | "R$ 12.999,90" -> 12999.9
window.forgePrecoParaNumero = function (texto) {
  if (typeof texto === 'number') return texto;
  if (!texto) return 0;
  const limpo = String(texto)
    .replace(/[^\d.,]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  return parseFloat(limpo) || 0;
};

// Regra ORIGINAL: não existe coluna de uso — ele é derivado do badge.
window.forgeUsoDaBuild = function (pc) {
  const badge = String(pc.badge || '').toLowerCase();
  if (badge.includes('office') || badge.includes('dev')) return 'office';
  if (badge.includes('workstation') || badge.includes('titan') || badge.includes('ia')) return 'workstation';
  return 'gaming';
};

// Regra ORIGINAL: o filtro compara FAIXA ('low'/'mid'/'high'), não número.
window.forgeFaixaDePreco = function (pc) {
  const valor = window.forgePrecoParaNumero(pc.price);
  if (valor <= 5000) return 'low';
  if (valor > 12000) return 'high';
  return 'mid';
};

window.forgeCorDaBuild = function (pc) {
  return String(pc.renderClass || '').includes('white') ? 'white' : 'black';
};

/* -----------------------------------------------------------------------------
   SESSÃO E NAVEGAÇÃO
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  verificarSessaoExistente();
});

function verificarSessaoExistente() {
  const token = localStorage.getItem('forge_token');
  const user  = localStorage.getItem('forge_user');

  if (token && user) {
    try {
      window.usuarioAtivo = JSON.parse(user);
      window.isLoggedIn = true;
    } catch (e) {
      console.error('[FORGE] Cache de usuário corrompido. Limpando sessão.');
      localStorage.removeItem('forge_token');
      localStorage.removeItem('forge_user');
    }
  }
  updateNav();
}

window.updateNav = function () {
  const btnCta        = document.getElementById('nav-cta-btn');
  const userArea      = document.getElementById('nav-user-area');
  const linkCliente   = document.getElementById('nav-link-cliente');
  const nomeDisplay   = document.getElementById('client-name-display');
  const avatarInitials = document.getElementById('nav-avatar-initials');

  if (window.isLoggedIn && window.usuarioAtivo) {
    if (btnCta) btnCta.style.display = 'none';
    if (userArea) userArea.style.display = 'flex';
    if (linkCliente) linkCliente.style.display = 'flex';
    if (nomeDisplay) nomeDisplay.textContent = window.usuarioAtivo.nome || 'Cliente';
    if (avatarInitials) avatarInitials.textContent = (window.usuarioAtivo.nome || 'C').charAt(0).toUpperCase();
  } else {
    if (btnCta) btnCta.style.display = 'block';
    if (userArea) userArea.style.display = 'none';
    if (linkCliente) linkCliente.style.display = 'none';
  }
};

window.toggleMenuUsuario = function (event) {
  event.stopPropagation();
  const dropdown = document.getElementById('avatar-dropdown-menu');
  if (dropdown) {
    const aberto = dropdown.style.display === 'block';
    dropdown.style.display = aberto ? 'none' : 'block';
  }
};

window.doLogout = function () {
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  window.isLoggedIn = false;
  window.usuarioAtivo = null;
  window.location.href = '/'; // URL limpa
};

window.addEventListener('click', () => {
  const dropdown = document.getElementById('avatar-dropdown-menu');
  if (dropdown) dropdown.style.display = 'none';
});

/* -----------------------------------------------------------------------------
   TOASTS
   -------------------------------------------------------------------------- */
window.showToast = function (mensagem, tipo = 'error') {
  let toastBox = document.getElementById('forge-toast-box');
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.id = 'forge-toast-box';
    document.body.appendChild(toastBox);
  }

  const toast = document.createElement('div');
  toast.className = `forge-toast ${tipo}`;

  const svgSuccess = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a650" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  const svgError   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${tipo === 'success' ? svgSuccess : svgError}<span></span>`;
  toast.querySelector('span').textContent = mensagem; // textContent evita injeção de HTML
  toastBox.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};