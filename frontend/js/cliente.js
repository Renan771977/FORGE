/* =============================================================================
   js/pages/cliente.js | Laboratório VIP — Dashboard do Cliente
   -----------------------------------------------------------------------------
   AUTENTICAÇÃO REAL. A versão anterior só checava se existia uma string no
   localStorage e renderizava a partir do cache do próprio navegador — qualquer
   um entrava digitando localStorage.setItem('forge_token','x') no DevTools.

   Agora: chama GET /api/cliente/dashboard com o token. Quem decide se a sessão
   vale é o servidor (middleware/auth.js). 401 = sem token, 403 = token inválido
   ou expirado. Em qualquer um dos dois: limpa a sessão e manda pro /cadastro.

   Os dados exibidos são os que o SERVIDOR devolveu, não os do localStorage.

   Markup escrito contra o CSS recuperado (cliente.css, seções 1-13). Aquelas
   classes (.lab__card, .lab-ticket, .lab-nav__btn, .lab-status--*) existiam no
   style.css mas nunca tinham sido usadas por JS nenhum.
   ============================================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', iniciarLaboratorio);

async function iniciarLaboratorio() {
  const container = document.getElementById('cliente');
  if (!container) return;

  if (typeof window.apiAuthFetch !== 'function') {
    console.error('[FORGE Lab] api.js não carregou antes do cliente.js. Confira a ordem dos <script>.');
    return mostrarFalha(container, 'Erro de carregamento da página.');
  }

  const token = localStorage.getItem('forge_token');
  if (!token) return expulsar('Faça login para acessar o Laboratório.');

  // A sessão é validada pelo SERVIDOR, não pelo navegador.
  const { ok, data, status } = await buscarDashboard();

  if (status === 401 || status === 403) {
    return expulsar(data?.message || 'Sessão expirada. Faça login novamente.');
  }
  if (!ok) {
    return mostrarFalha(container, data?.message);
  }

  const cliente = data.cliente;

  // Sincroniza o cache com a verdade do servidor (o nome na nav vem daqui)
  window.usuarioAtivo = cliente;
  window.isLoggedIn = true;
  localStorage.setItem('forge_user', JSON.stringify(cliente));
  if (typeof window.updateNav === 'function') window.updateNav();

  await window.forgeCatalogoPronto;   // a vitrine lê o BANCO_DE_HARDWARE
  renderDashboard(container, cliente);
}

/* Passa pelo apiAuthFetch (api.js), que resolve o API_BASE_URL.
   Antes eu usava fetch('/api/cliente/dashboard') — caminho relativo. Isso
   funcionava quando o Express servia telas E dados na mesma origem. Com o
   front desacoplado, o relativo bate no servidor de telas e devolve 404. */
async function buscarDashboard() {
  return window.apiAuthFetch('/cliente/dashboard');
}

function expulsar(mensagem) {
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  sessionStorage.setItem('forge_aviso', mensagem);
  window.location.href = '/cadastro';
}

function mostrarFalha(container, mensagem) {
  container.innerHTML = `
    <div style="padding:120px 20px;text-align:center">
      <p style="font-family:var(--font-mono);color:#ff4d4d;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Laboratório indisponível</p>
      <p style="color:var(--color-gray);margin-bottom:28px">${mensagem || 'Erro ao carregar seus dados.'}</p>
      <button class="btn-primary" onclick="window.location.reload()">Tentar novamente</button>
    </div>`;
}

/* -----------------------------------------------------------------------------
   RENDER
   -------------------------------------------------------------------------- */
function renderDashboard(container, cliente) {
  const nome    = cliente.nome || 'Cliente';
  const primeiro = nome.trim().split(/\s+/)[0];
  const iniciais = nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const perfil  = cliente.perfilUso || 'Entusiasta';

  document.title = `FORGE — Laboratório de ${primeiro}`;

  container.innerHTML = `
    <div class="lab">
      <header class="lab__header">
        <div class="lab__header-left">
          <div class="lab__avatar" aria-hidden="true">${iniciais}</div>
          <div class="lab__header-info">
            <p class="lab__eyebrow">Meu Laboratório VIP</p>
            <h1 class="lab__title">Bem-vindo, <span class="lab__title-accent">${primeiro}</span></h1>
            <div class="lab__meta-row">
              <span class="lab__badge lab__badge--profile">${perfil}</span>
              <!-- O ID interno do cliente foi removido da tela a pedido.
                   Ele continua disponível em window.usuarioAtivo.id para uso
                   interno (abrir chamado, fechar pedido), só não é exibido. -->
            </div>
          </div>
        </div>
        <div class="lab__header-nav">
          <button class="lab__quick-btn lab__quick-btn--logout" onclick="doLogout()">Sair da Conta</button>
        </div>
      </header>

      <nav class="lab-tabs-nav">
        <button class="lab-tab-btn active" onclick="trocarAbaLab('visao-geral', this)">VISÃO GERAL</button>
        <button class="lab-tab-btn" onclick="trocarAbaLab('meus-pedidos', this)">MEUS PEDIDOS</button>
      </nav>

      <div class="lab-content-area">
        <div id="aba-visao-geral" class="lab-tab-pane active">
          <div class="lab__grid">
            <div class="lab__col-main">
              ${cardParceiras()}
              ${cardVitrine()}
              ${cardDadosDaConta(cliente)}
            </div>
            <aside class="lab__col-sidebar">
              ${cardNavRapida()}
              ${cardTerminal()}
            </aside>
          </div>
        </div>

        <div id="aba-meus-pedidos" class="lab-tab-pane">
          ${abaPedidos()}
        </div>
      </div>
    </div>
  `;

  iniciarTerminal();
  ligarParceiras();
  iniciarVitrine();
}

/* -----------------------------------------------------------------------------
   PARCEIRAS DA FORGE — portado do forge-visao-geral.js
   O original era 100% inline-style. Aqui usa as classes do cliente.css
   (.lab__card, .lab__pill, .lab__btn-secondary), que já existiam.
   -------------------------------------------------------------------------- */
const PARCEIRAS = [
  {
    id: 'nvidia',
    nome: 'NVIDIA',
    tag: 'Gráficos Dedicados',
    cor: '#76B900',
    desc: 'Fornecimento direto de chips e engenharia para as linhas GeForce RTX e NVIDIA RTX, com drivers otimizados para IA e renderização 3D.',
    cta: 'Tecnologia RTX',
    icone: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M6 6h12v12H6z"/><path d="M9 9h6v6H9z"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>`,
  },
  {
    id: 'intel',
    nome: 'Intel',
    tag: 'Arquitetura Híbrida',
    cor: '#0071C5',
    desc: 'Suprimento homologado de processadores Intel Core i9 e linhas escaláveis Xeon, com estabilidade extrema em multi-threading.',
    cta: 'Tecnologia Intel',
    icone: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10v10H7z"/>
              <path d="M3 9h3M3 15h3M18 9h3M18 15h3M9 3v3M15 3v3M9 18v3M15 18v3"/>
            </svg>`,
  },
  {
    id: 'amd',
    nome: 'AMD',
    tag: 'Performance Extrema',
    cor: '#ED1C24',
    desc: 'Integração direta da linha Ryzen e do ecossistema Threadripper: alta contagem de núcleos e caches massivos.',
    cta: 'Tecnologia AMD',
    icone: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 17l5-5 5 5M7 12l5-5 5 5"/>
            </svg>`,
  },
];

function cardParceiras() {
  const cartoes = PARCEIRAS.map(p => `
    <div class="lab-wishlist__item" style="flex-direction:column;align-items:stretch;gap:12px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
        <span style="color:${p.cor};flex-shrink:0" aria-hidden="true">${p.icone}</span>
        <span class="lab__pill">${p.tag}</span>
      </div>
      <p class="lab-wishlist__nome" style="font-size:17px">${p.nome}</p>
      <p class="lab__card-desc" style="flex:1;margin:0">${p.desc}</p>
      <button class="lab__btn-secondary" data-parceiro="${p.id}">${p.cta}</button>
    </div>`).join('');

  return `
    <div class="lab__card">
      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--green" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-6.22-8.56"/>
          </svg>
        </div>
        <div>
          <h3 class="lab__card-title">Parceiras da FORGE</h3>
          <p class="lab__card-sub">Hardware homologado, direto das líderes de silício</p>
        </div>
        <span class="lab__pill lab__pill--beta" style="margin-left:auto">Verificado</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:18px">
        ${cartoes}
      </div>
    </div>`;
}

function ligarParceiras() {
  document.querySelectorAll('[data-parceiro]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PARCEIRAS.find(x => x.id === btn.dataset.parceiro);
      if (p && typeof window.showToast === 'function') {
        window.showToast(`Arquitetura ${p.nome} homologada no ecossistema FORGE.`, 'success');
      }
    });
  });
}

function cardDadosDaConta(c) {
  const linha = (rotulo, valor) => `
    <div class="lab-ticket" style="cursor:default">
      <div class="lab-ticket__header">
        <span class="lab-ticket__id">${rotulo}</span>
      </div>
      <p class="lab-ticket__titulo" style="text-transform:none">${valor || '—'}</p>
    </div>`;

  return `
    <div class="lab__card">
      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--blue" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h3 class="lab__card-title">Dados da Conta</h3>
          <p class="lab__card-sub">Sincronizado com o servidor</p>
        </div>
      </div>
      <div class="lab-tickets__lista" style="margin-top:18px">
        ${linha('NOME', c.nome)}
        ${linha('E-MAIL', c.email)}
        ${linha('WHATSAPP', c.whatsapp)}
        ${linha('PERFIL DE USO', c.perfilUso)}
      </div>
    </div>`;
}

/* -----------------------------------------------------------------------------
   VITRINE FORGE — carrossel de máquinas
   Porte do iniciarCarrosselMini() do script.js original (que morava, confusamente,
   dentro de uma função chamada _htmlModuloNavRapida).

   Mantido do original: cabeçalho "Vitrine FORGE", dots, fade de 400ms, troca a
   cada 5s e o clearInterval que evita vazamento de timer.
   Adicionado: dots clicáveis, pausa no hover, clique abre /produto?id= e
   limpeza do timer ao sair da página.
   -------------------------------------------------------------------------- */
function cardVitrine() {
  return `
    <div class="lab__card" style="padding:0;overflow:hidden">
      <div style="padding:15px 20px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.2)">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray);text-transform:uppercase;letter-spacing:2px">Vitrine FORGE</span>
        <span style="display:flex;gap:6px" id="mini-carousel-dots"></span>
      </div>
      <div id="mini-carousel-content"
           style="padding:28px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:280px;cursor:pointer;transition:opacity .4s ease-in-out">
      </div>
    </div>`;
}

function iniciarVitrine() {
  const palco = document.getElementById('mini-carousel-content');
  const dots  = document.getElementById('mini-carousel-dots');
  if (!palco) return;

  if (window.carrosselInterval) clearInterval(window.carrosselInterval);

  const ids = Object.keys(window.BANCO_DE_HARDWARE || {});
  if (ids.length === 0) {
    palco.innerHTML = '<p class="lab__card-desc">Vitrine indisponível no momento.</p>';
    return;
  }

  const destaques = ids.slice(0, 5);
  let atual = 0;
  let pausado = false;

  function render() {
    const id = destaques[atual];
    const pc = window.BANCO_DE_HARDWARE[id];
    if (!pc) return;

    palco.style.opacity = 0;
    setTimeout(() => {
      palco.innerHTML = `
        <div style="width:100%;height:150px;display:flex;justify-content:center;margin-bottom:16px">
          <img src="${pc.img}" alt="${pc.name}" style="max-height:100%;object-fit:contain">
        </div>
        <div style="font-family:var(--font-display);font-size:20px;color:var(--color-ash);text-transform:uppercase;text-align:center;letter-spacing:1px">${pc.name}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-blue);margin-top:6px;letter-spacing:1.5px">${pc.badge}</div>
        <div style="font-size:15px;font-weight:bold;color:#00a650;margin-top:12px">${pc.price}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray);margin-top:10px;letter-spacing:1px">VER DETALHES →</div>
      `;
      palco.onclick = () => { window.location.href = `/produto?id=${encodeURIComponent(id)}`; };

      if (dots) {
        dots.innerHTML = '';
        destaques.forEach((_, i) => {
          const d = document.createElement('button');
          d.setAttribute('aria-label', `Ir para o destaque ${i + 1}`);
          d.style.cssText = `width:6px;height:6px;padding:0;border:none;border-radius:50%;cursor:pointer;transition:background .3s ease;background:${i === atual ? 'var(--color-blue)' : 'rgba(255,255,255,.15)'}`;
          d.addEventListener('click', (e) => { e.stopPropagation(); atual = i; render(); });
          dots.appendChild(d);
        });
      }
      palco.style.opacity = 1;
    }, 400);
  }

  // Pausa a rotação enquanto o cliente estiver olhando o slide
  palco.addEventListener('mouseenter', () => { pausado = true; });
  palco.addEventListener('mouseleave', () => { pausado = false; });

  render();
  window.carrosselInterval = setInterval(() => {
    if (pausado) return;
    atual = (atual + 1) % destaques.length;
    render();
  }, 5000);
}

// Evita timer órfão ao sair da página
window.addEventListener('beforeunload', () => {
  if (window.carrosselInterval) clearInterval(window.carrosselInterval);
  if (window._termLogTimerId) clearInterval(window._termLogTimerId);
});

function cardNavRapida() {
  const btn = (mod, href, rotulo, svg) => `
    <a class="lab-nav__btn lab-nav__btn--${mod}" href="${href}">
      <span class="lab-nav__btn-icon" aria-hidden="true">${svg}</span>
      <span class="lab-nav__btn-label">${rotulo}</span>
    </a>`;

  return `
    <div class="lab__card lab__card--nav">
      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--blue" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div><h3 class="lab__card-title">Navegação Rápida</h3></div>
      </div>
      <div class="lab-nav__grid" style="margin-top:18px">
        ${btn('catalogo', '/vendas', 'Catálogo',
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>')}
        ${btn('benchmark', '/benchmark', 'Benchmark',
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 20h18M7 20v-6M12 20V8M17 20v-9"/></svg>')}
        ${btn('carrinho', '/configurador', 'Configurador',
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>')}
      </div>
    </div>`;
}

/* -----------------------------------------------------------------------------
   ABA MEUS PEDIDOS
   Lê os pedidos do global.js (hoje localStorage). Usa a timeline .lab-pedido__*
   que já existia no cliente.css e nunca tinha sido usada por JS nenhum.
   -------------------------------------------------------------------------- */
const brlPedido = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function abaPedidos() {
  const pedidos = window.getPedidos();

  if (pedidos.length === 0) {
    return `
      <div class="lab-panel-blank">
        <div class="lab-wishlist__vazia" style="text-align:center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3 class="lab__card-title" style="margin-bottom:8px">Nenhum pedido ainda</h3>
          <p class="lab__card-desc" style="max-width:420px;margin:0 auto 24px">
            Quando você fechar sua primeira Forge, o acompanhamento — da triagem ao benchmark — aparece aqui.
          </p>
          <a class="btn-primary" href="/vendas">Ver catálogo de builds</a>
        </div>
      </div>`;
  }

  return `<div class="lab-pedidos__lista">${pedidos.map(htmlPedido).join('')}</div>`;
}

function htmlPedido(p) {
  const st = window.STATUS_PEDIDO[p.status] || window.STATUS_PEDIDO.em_triagem;
  const data = new Date(p.criado_em).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const nomes = p.itens.map(i => `${i.qtd > 1 ? i.qtd + '× ' : ''}${i.nome}`).join(' + ');

  // Pedido cancelado não mostra timeline — não há progresso a exibir.
  const timeline = p.status === 'cancelado' ? '' : `
    <div class="lab-pedido__timeline">
      ${window.ETAPAS_PEDIDO.map((etapa, i) => {
        const concluida = i < st.etapa;
        const atual     = i === st.etapa;
        return `
          <div class="lab-pedido__etapa ${concluida ? 'lab-pedido__etapa--done' : ''}"
               ${atual ? 'aria-current="step"' : ''}>
            <span class="lab-pedido__etapa-dot">${concluida ? '✓' : ''}</span>
            <span class="lab-pedido__etapa-label">${etapa}</span>
          </div>`;
      }).join('')}
    </div>`;

  return `
    <article class="lab-pedido">
      <div class="lab-pedido__header">
        <div>
          <span class="lab-pedido__id">${p.id}</span>
          <p class="lab-pedido__nome">${nomes}</p>
          <p class="lab-pedido__data">${data} · ${brlPedido(p.total)}</p>
        </div>
        <span class="lab-status ${st.badge}">${st.rotulo}</span>
      </div>
      ${timeline}
      <p class="lab__card-desc" style="margin-top:16px">${st.nota}</p>
    </article>`;
}

/* -----------------------------------------------------------------------------
   TERMINAL DE DICAS — portado do forge-visao-geral.js
   -------------------------------------------------------------------------- */
const DICAS = [
  { texto: '[DICA] Limpe a poeira do gabinete a cada 6 meses para manter as peças frias e silenciosas.', cls: 'ft-sys' },
  { texto: '[CUIDADO] Evite deixar o computador encostado na parede para não bloquear as saídas de ar.', cls: 'ft-warn' },
  { texto: '[OTIMIZAÇÃO] Reinicie o PC pelo menos uma vez por semana para limpar a memória.', cls: 'ft-info' },
  { texto: '[SEGURANÇA] Mantenha o Windows sempre atualizado para proteger seus arquivos.', cls: 'ft-sys' },
  { texto: '[ENERGIA] Use um filtro de linha de qualidade para proteger a máquina contra quedas de luz.', cls: 'ft-warn' },
  { texto: '[INICIALIZAÇÃO] Evite muitos programas abrindo junto com o Windows.', cls: 'ft-info' },
  { texto: '[ESPAÇO] Deixe espaço livre no disco principal para o sistema não perder velocidade.', cls: 'ft-sys' },
  { texto: '[PREVENÇÃO] Não coloque o gabinete no chão ou sobre tapetes — acumula poeira.', cls: 'ft-warn' },
  { texto: '[CUIDADO] Nunca desligue o computador direto na tomada para não corromper o sistema.', cls: 'ft-warn' },
];

function cardTerminal() {
  return `
    <style>
      @keyframes forgeLogSlideIn { from { opacity:0; transform:translateY(4px);} to { opacity:1; transform:translateY(0);} }
      @keyframes forgeCursorBlink { 50% { opacity: 0; } }
      .ft-line { font-family: var(--font-mono), monospace; font-size: 11px; line-height: 1.6; white-space: pre-wrap;
                 animation: forgeLogSlideIn .25s ease both; margin-bottom: 8px; }
      .ft-sys { color:#4af2a1; } .ft-warn { color:#ffbd2e; } .ft-info { color:#00bfff; }
      .ft-cmd { color: rgba(74,242,161,.4); }
    </style>
    <div style="background:#000;border:1px solid rgba(74,242,161,.15);border-radius:6px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(74,242,161,.08)">
        <span style="width:9px;height:9px;border-radius:50%;background:#ff5f57"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#ffbd2e"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#28c840"></span>
        <span style="font-family:var(--font-mono);font-size:10px;color:rgba(74,242,161,.4);letter-spacing:1px;margin-left:6px;text-transform:uppercase">DICAS_DO_DIA</span>
      </div>
      <div id="forge-term-logs" style="padding:14px 14px 8px;min-height:240px;max-height:240px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end"></div>
      <div style="padding:0 14px 14px;display:flex;align-items:center;gap:6px">
        <span class="ft-line ft-cmd" style="margin:0">root@forge:~$</span>
        <span style="width:7px;height:12px;background:#4af2a1;display:inline-block;animation:forgeCursorBlink 1s step-end infinite"></span>
      </div>
    </div>`;
}

function iniciarTerminal() {
  const logs = document.getElementById('forge-term-logs');
  if (!logs) return;

  const fila = [...DICAS].sort(() => Math.random() - 0.5);
  let i = 0;
  const MAX = 7;

  function proxima() {
    const dica = fila[i % fila.length];
    i++;
    const linha = document.createElement('div');
    linha.className = `ft-line ${dica.cls}`;
    linha.textContent = dica.texto;
    logs.appendChild(linha);
    while (logs.children.length > MAX) logs.removeChild(logs.firstChild);
  }

  for (let k = 0; k < 4; k++) proxima();

  if (window._termLogTimerId) clearInterval(window._termLogTimerId);
  window._termLogTimerId = setInterval(proxima, 60000);
}

/* -------------------------------------------------------------------------- */
window.trocarAbaLab = function (idAba, botao) {
  document.querySelectorAll('.lab-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.lab-tab-pane').forEach(p => p.classList.remove('active'));
  botao.classList.add('active');
  document.getElementById(`aba-${idAba}`)?.classList.add('active');
};