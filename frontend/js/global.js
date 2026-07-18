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
   CARRINHO — núcleo de estado
   -----------------------------------------------------------------------------
   Persistência ISOLADA nas funções lerCarrinho/gravarCarrinho. Hoje é
   localStorage; para migrar depois para POST /api/cliente/pedidos, só essas
   duas mudam — o resto do site chama a API pública abaixo e não sabe de nada.

   ATENÇÃO: em localStorage o carrinho vive só NESTE navegador. Trocar de
   aparelho, limpar cache ou abrir anônimo = carrinho vazio. E a FORGE não
   enxerga nada disso.

   Formato: array de ids repetidos. ['g1-frost','g1-frost'] = 2 unidades.
   Era assim no script.js original; mantido por compatibilidade.
   -------------------------------------------------------------------------- */
const CHAVE_CARRINHO = 'forge_cart';

function lerCarrinho() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || '[]');
    return Array.isArray(bruto) ? bruto : [];
  } catch {
    console.warn('[FORGE] Carrinho corrompido no localStorage. Zerando.');
    localStorage.removeItem(CHAVE_CARRINHO);
    return [];
  }
}

function gravarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  window.carrinho = itens;
  window.atualizarBadgeCarrinho();
  document.dispatchEvent(new CustomEvent('forge:carrinho-mudou', { detail: itens }));
}

/* API pública */
window.getCarrinho = lerCarrinho;

window.getCarrinhoAgrupado = function () {
  const contagem = {};
  lerCarrinho().forEach(id => { contagem[id] = (contagem[id] || 0) + 1; });
  return Object.entries(contagem).map(([id, qtd]) => ({ id, qtd }));
};

window.getTotalCarrinho = function () {
  return lerCarrinho().reduce((soma, id) => {
    const pc = window.BANCO_DE_HARDWARE[id];
    return soma + (pc ? window.forgePrecoParaNumero(pc.price) : 0);
  }, 0);
};

window.adicionarAoCarrinho = function (id) {
  // Guard do original: carrinho exige conta. A checagem de verdade acontece
  // no fechamento do pedido, contra o servidor — isto aqui é só UX.
  if (!window.isLoggedIn) {
    window.showToast('Crie uma conta ou faça login para montar seu carrinho.', 'error');
    setTimeout(() => { window.location.href = '/cadastro'; }, 1200);
    return false;
  }

  const pc = window.BANCO_DE_HARDWARE[id];
  if (!pc) {
    console.error(`[FORGE] Build "${id}" não existe no catálogo.`);
    return false;
  }

  if (pc.estoque <= 0) {
    window.showToast(`${pc.name} está fora de estoque.`, 'error');
    return false;
  }

  const itens = lerCarrinho();
  const jaTem = itens.filter(x => x === id).length;
  if (jaTem >= pc.estoque) {
    window.showToast(`Só temos ${pc.estoque} unidade(s) de ${pc.name} em estoque.`, 'error');
    return false;
  }

  itens.push(id);
  gravarCarrinho(itens);
  window.showToast(`${pc.name} foi guardada no seu carrinho.`, 'success');
  return true;
};

/* Remove UMA unidade */
window.removerDoCarrinho = function (id) {
  const itens = lerCarrinho();
  const i = itens.indexOf(id);
  if (i === -1) return;
  itens.splice(i, 1);
  gravarCarrinho(itens);
};

/* Remove TODAS as unidades de uma build */
window.removerLinhaDoCarrinho = function (id) {
  gravarCarrinho(lerCarrinho().filter(x => x !== id));
};

window.limparCarrinho = function () {
  gravarCarrinho([]);
};

window.abrirCarrinho = function () {
  window.location.href = '/carrinho';
};

window.atualizarBadgeCarrinho = function () {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = lerCarrinho().length;
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-flex' : 'none';
};

// Carrinho aberto em duas abas: mantém as duas em sincronia
window.addEventListener('storage', (e) => {
  if (e.key === CHAVE_CARRINHO) {
    window.carrinho = lerCarrinho();
    window.atualizarBadgeCarrinho();
    document.dispatchEvent(new CustomEvent('forge:carrinho-mudou', { detail: window.carrinho }));
  }
});

/* -----------------------------------------------------------------------------
   PEDIDOS — modelo e persistência
   -----------------------------------------------------------------------------
   Mesma estratégia do carrinho: persistência isolada em lerPedidos/gravarPedidos.
   Hoje localStorage; para ligar na tabela `pedidos` (que já existe no MySQL:
   id, usuario_id, maquina_id, valor, status, criado_em), só essas duas mudam.

   LIMITAÇÃO REAL: em localStorage o pedido existe só neste navegador e a FORGE
   nunca fica sabendo da venda. Isso é uma demonstração de checkout, não uma loja.

   As ETAPAS refletem o processo real da FORGE — inclusive o Benchmark, que é o
   diferencial da marca e por isso aparece como etapa própria do pedido.
   -------------------------------------------------------------------------- */
const CHAVE_PEDIDOS = 'forge_pedidos';

window.ETAPAS_PEDIDO = ['Pagamento', 'Triagem', 'Montagem', 'Benchmark', 'Entrega'];

window.STATUS_PEDIDO = {
  aguardando_pagamento: { rotulo: 'Aguardando pagamento',  etapa: 0, badge: 'lab-status--amber',
                          nota: 'Assim que o pagamento cair, seu pedido entra na fila de triagem.' },
  em_triagem:           { rotulo: 'Em triagem',            etapa: 1, badge: 'lab-status--blue',
                          nota: 'Separando e conferindo cada componente do seu build.' },
  em_montagem:          { rotulo: 'Em montagem',           etapa: 2, badge: 'lab-status--blue',
                          nota: 'Sua máquina está na bancada, sendo montada por um engenheiro FORGE.' },
  em_benchmark:         { rotulo: 'Em testes de benchmark',etapa: 3, badge: 'lab-status--blue',
                          nota: 'Rodando Cinebench, TimeSpy e teste térmico sob carga sustentada.' },
  enviado:              { rotulo: 'Enviado',               etapa: 4, badge: 'lab-status--blue',
                          nota: 'A caminho, em transporte blindado com seguro total.' },
  entregue:             { rotulo: 'Entregue',              etapa: 5, badge: 'lab-status--green',
                          nota: 'Pedido concluído. Garantia FORGE de 3 anos ativa.' },
  cancelado:            { rotulo: 'Cancelado',             etapa: -1, badge: 'lab-status--red',
                          nota: 'Este pedido foi cancelado.' },
};

function lerPedidos() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]');
    return Array.isArray(bruto) ? bruto : [];
  } catch {
    console.warn('[FORGE] Pedidos corrompidos no localStorage. Zerando.');
    localStorage.removeItem(CHAVE_PEDIDOS);
    return [];
  }
}

function gravarPedidos(lista) {
  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(lista));
}

/* Mais recentes primeiro */
window.getPedidos = function () {
  return lerPedidos().sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
};

/* Cria o pedido a partir do carrinho + dados do checkout.
   Devolve o pedido criado. Quem chama é o checkout.js. */
window.criarPedido = function ({ itens, entrega, pagamento, subtotal, total }) {
  const lista = lerPedidos();

  // Cartão "aprova na hora"; PIX e boleto ficam aguardando compensação.
  const status = pagamento.metodo === 'cartao' ? 'em_triagem' : 'aguardando_pagamento';

  const pedido = {
    id:         gerarIdPedido(),
    usuario_id: window.usuarioAtivo?.id ?? null,
    criado_em:  new Date().toISOString(),
    status,
    itens,        // [{ id, nome, qtd, unitario, img }]
    entrega,      // { cep, logradouro, numero, complemento, bairro, cidade, uf }
    pagamento,    // { metodo, parcelas, bandeira, final }
    subtotal,
    total,
  };

  lista.push(pedido);
  gravarPedidos(lista);
  return pedido;
};

window.getPedido = function (id) {
  return lerPedidos().find(p => p.id === id) || null;
};

/* FRG-AB12CD — legível ao telefone, sem 0/O/1/I para não confundir */
function gerarIdPedido() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sufixo = '';
  for (let i = 0; i < 6; i++) sufixo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return `FRG-${sufixo}`;
}

/* -----------------------------------------------------------------------------
   SESSÃO E NAVEGAÇÃO
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  verificarSessaoExistente();
  window.carrinho = lerCarrinho();
  window.atualizarBadgeCarrinho();
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