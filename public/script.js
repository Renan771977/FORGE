let isLoggedIn = false;
let userName = 'Renan';


let BANCO_DE_HARDWARE = {}; 


window.addEventListener('DOMContentLoaded', async () => {
  showSection('hero');
  updateNav();
  
  await carregarCatalogoDoBanco();
  showSection('hero');
  updateNav();
  carregarCards();
  montarSeletoresComparador();
  inicializarRastroMouse();
  inicializarScrollReveal();
  verificarSessaoExistente();
});

// =========================================================
// SISTEMA PROFISSIONAL DE NOTIFICAÇÕES (TOAST) COM SVGs
// =========================================================
function showToast(mensagem, tipo = 'error') {
  let toastBox = document.getElementById('forge-toast-box');
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.id = 'forge-toast-box';
    document.body.appendChild(toastBox);
  }

  const toast = document.createElement('div');
  toast.className = `forge-toast ${tipo}`;
  
  // Ícones SVG minimalistas (Design Premium)
  const svgSuccess = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a650" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  const svgError = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5f57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  
  const icone = tipo === 'error' ? svgError : svgSuccess;
  
  toast.innerHTML = `<span class="toast-icon" style="display: flex; align-items: center;">${icone}</span> <div>${mensagem}</div>`;
  toastBox.appendChild(toast);

  // Animação de entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove automaticamente após 4 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function carregarCards() {
  const container = document.getElementById('builds-container');
  if (!container) return;
  container.innerHTML = ''; // Limpa antes de injetar

  for (const [id, pc] of Object.entries(BANCO_DE_HARDWARE)) {
    // Define a Categoria para os Filtros funcionarem
    let uso = 'gaming';
    const badge = pc.badge.toLowerCase();
    if (badge.includes('office') || badge.includes('dev')) uso = 'office';
    else if (badge.includes('workstation') || badge.includes('titan') || badge.includes('ia')) uso = 'workstation';

    // Define Faixa de Preço para o Filtro
    let faixaPreco = 'mid';
    const valor = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
    if (valor <= 5000) faixaPreco = 'low';
    else if (valor > 12000) faixaPreco = 'high';

    const cor = pc.renderClass.includes('white') ? 'white' : 'black';

    // Abrevia as especificações (ex: "Intel Core i5-14600KF" -> "i5-14600KF")
    const shortGpu = pc.specs.gpu.split(' ').slice(0, 3).join(' ').replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
    const shortCpu = pc.specs.cpu.split(' ').slice(0, 3).join(' ').replace('Intel Core ', '');

    // Cria o código HTML do Card e injeta
    const card = document.createElement('div');
    card.className = 'build-card';
    card.setAttribute('data-usage', uso);
    card.setAttribute('data-color', cor);
    card.setAttribute('data-price', faixaPreco);
    card.onclick = () =>  abrirDetalhesProduto(id); 

    // Calcula o valor da parcela em 10x sem juros automaticamente
    const valorDaParcela = (valor / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    card.innerHTML = `
      <div class="build-card-img ${cor === 'white' ? 'white-pc' : 'black-pc'}">
        <span class="build-badge">${pc.badge}</span>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}">
      </div>
      <div class="build-card-body ecom-body">
        
        <div class="ecom-top">
          <div class="build-meta-specs">${shortGpu} &bull; ${shortCpu}</div>
          <div class="build-name">${pc.name}</div>
          <div class="ecom-stars" style="color: #FFA41C; font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; margin-top: 5px;">
            SERIE LIMITADA <span class="ecom-reviews" style="color: var(--color-gray); font-size: 11px; margin-left: 5px;">(+50 unidades)</span>
          </div>
        </div>

        <div class="ecom-bottom">
          <div class="ecom-price-block">
            <div class="build-price">${pc.price}</div>
            <div class="ecom-installments">em até <strong>10x de ${valorDaParcela}</strong> sem juros</div>
            <div class="ecom-shipping" style="color: #00a650; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; font-weight: 700; margin-top: 8px; letter-spacing: 0.5px;">
              Frete gratis para Belo Horizonte e região
            </div>
          </div>
          <button class="build-cta ecom-btn" onclick="solicitarVenda('${id}', event)">COMPRAR AGORA</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  }
}


function abrirDetalhesProduto(idMaquina) {
  const pc = BANCO_DE_HARDWARE[idMaquina];
  if (!pc) return;

  const container = document.getElementById('produto-container');
  if(!container) return;

  const valorNum = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
  const valorPix = (valorNum * 0.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valorParcela = (valorNum / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const mensagemWhatsapp = `Olá, gostaria de tirar dúvidas sobre a build *${pc.name}* (${pc.badge}) no valor de ${pc.price}.`;
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=5531900000000&text=${encodeURIComponent(mensagemWhatsapp)}`;

  const estoque = pc.estoque; 
  let urgencyHTML = '';
  let btnComprarHTML = '';

  if (estoque <= 10 && estoque > 0) {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color: #ff5f57; background: rgba(255, 95, 87, 0.05); border: 1px solid rgba(255, 95, 87, 0.2); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">ALTA DEMANDA: RESTAM APENAS ${estoque} UNIDADES DISPONÍVEIS</div>`;
    btnComprarHTML = `<button class="btn-buy-now" onclick="adicionarAoCarrinho('${idMaquina}'); abrirCarrinho();">COMPRAR AGORA</button>`;
  } else if (estoque <= 0) {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color: #ffbd2e; background: rgba(255, 189, 46, 0.05); border: 1px solid rgba(255, 189, 46, 0.2); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">PRODUTO INDISPONÍVEL TEMPORARIAMENTE</div>`;
    btnComprarHTML = `<button class="btn-buy-now" style="background: var(--color-iron); color: var(--color-gray); cursor: not-allowed; border: 1px solid rgba(255,255,255,0.05);" disabled>FORA DE ESTOQUE</button>`;
  } else {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color: #00a650; background: rgba(0, 166, 80, 0.05); border: 1px solid rgba(0, 166, 80, 0.2); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">PRODUTO EM ESTOQUE: ${estoque} UNIDADES À PRONTA ENTREGA</div>`;
    btnComprarHTML = `<button class="btn-buy-now" onclick="adicionarAoCarrinho('${idMaquina}'); abrirCarrinho();">COMPRAR AGORA</button>`;
  }

  container.innerHTML = `
    <button class="btn-voltar" onclick="showSection('vendas')" style="margin-bottom: 25px;">&larr; Voltar ao Catálogo</button>
    
    <header style="margin-bottom: 35px; margin-top: 5px;">
      <h2 class="machine-title" style="font-size: 42px; margin-bottom: 6px;">${pc.name}</h2>
      <p class="machine-tagline" style="font-size: 16px; color: var(--color-gray); font-family: var(--font-body);">${pc.tagline}</p>
    </header>

    <div class="product-grid" style="align-items: flex-start; margin-top: 0; padding-top: 0;">
      
      <div class="blueprint-panel" style="margin-top: 0; padding-top: 0;">
        <div class="ambient-glow"></div> 
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}">
        <div class="machine-badge">${pc.badge}</div>
      </div>
      
      <div class="specs-panel" style="margin-top: 0; padding-top: 0;">
        
        <div class="ecom-buy-panel" style="margin-top: 0; margin-bottom: 40px;">
          ${urgencyHTML}

          <div class="ecom-prices">
            <div class="ecom-price-pix">
              ${valorPix} <span class="pix-badge" style="font-family: var(--font-mono); font-size: 10px; background: #00a650; letter-spacing: 0.5px; font-weight: 700; padding: 4px 8px;">10% OFF NO PIX</span>
            </div>
            <div class="ecom-price-installments">
              ou <strong>${pc.price}</strong> em até <strong>10x de ${valorParcela}</strong> sem juros
            </div>
          </div>

          <div class="ecom-payment-methods">
            <span>Cartões de Crédito (Até 10x)</span>
            <span>&bull;</span>
            <span>Boleto Bancário</span>
            <span>&bull;</span>
            <span>PIX Instantâneo</span>
          </div>

          <div class="ecom-buy-actions">
            ${btnComprarHTML}
            
            <button class="btn-add-cart" onclick="adicionarAoCarrinho('${idMaquina}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              ADICIONAR AO CARRINHO
            </button>

            <a href="${linkWhatsApp}" target="_blank" class="btn-whatsapp-assist">
              SOLICITAR CONSULTORIA VIA WHATSAPP
            </a>
          </div>

          <div class="ecom-trust-badges" style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">
            <div>&bull; 3 Anos de Garantia de Hardware FORGE</div>
            <div>&bull; Transporte Blindado com Seguro Total Incluso</div>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <div class="section-subtitle">Especificações de Hardware</div>
          <div class="hardware-list">
            <div class="hardware-item" style="animation-delay: 0.1s;"><div class="hardware-label">PROCESSADOR</div><div class="hardware-value">${pc.specs.cpu}</div></div>
            <div class="hardware-item" style="animation-delay: 0.2s;"><div class="hardware-label">PLACA DE VÍDEO</div><div class="hardware-value">${pc.specs.gpu}</div></div>
            <div class="hardware-item" style="animation-delay: 0.3s;"><div class="hardware-label">PLACA MÃE</div><div class="hardware-value">${pc.specs.motherboard}</div></div>
            <div class="hardware-item" style="animation-delay: 0.4s;"><div class="hardware-label">MEMÓRIA RAM</div><div class="hardware-value">${pc.specs.ram}</div></div>
            <div class="hardware-item" style="animation-delay: 0.5s;"><div class="hardware-label">ARMAZENAMENTO</div><div class="hardware-value">${pc.specs.storage}</div></div>
            <div class="hardware-item" style="animation-delay: 0.6s;"><div class="hardware-label">REFRIGERAÇÃO</div><div class="hardware-value">${pc.specs.cooler}</div></div>
            <div class="hardware-item" style="animation-delay: 0.7s;"><div class="hardware-label">FONTE</div><div class="hardware-value">${pc.specs.psu}</div></div>
            <div class="hardware-item" style="animation-delay: 0.8s;"><div class="hardware-label">GABINETE</div><div class="hardware-value">${pc.specs.cabinet}</div></div>
          </div>
        </div>
        
        <div>
          <div class="section-subtitle">Telemetria de Benchmarks</div>
          <div class="telemetria-container">
            <div class="telemetria-card"><span class="telemetria-label">CINEBENCH R23</span><div class="telemetria-value">${pc.benchmarks.cinebench}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">3DMARK SPY</span><div class="telemetria-value">${pc.benchmarks.timespy}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">CS2 / GAME FPS</span><div class="telemetria-value">${pc.benchmarks.fps}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">ESTABILIDADE</span><div class="telemetria-value">${pc.benchmarks.temp}</div></div>
          </div>
        </div>

      </div> 
    </div> 
  `;
  
  showSection('produto-detalhes');
}

function showSection(id) {
  if (id === 'cliente' && !isLoggedIn) {
    showToast('Acesse sua conta para visualizar o seu Dashboard.', 'error');
    showSection('cadastro'); 
    return;
  }

  document.querySelectorAll('section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); target.style.display = 'block'; window.scrollTo(0, 0); }
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navItem = document.getElementById('nav-' + id);
  if (navItem) navItem.classList.add('active');

  // Ajuste do Autofill seguro
  if (id === 'consultoria') {
    const sessionData = localStorage.getItem('forge_user');
    if (sessionData) {
      try {
        const usuario = JSON.parse(sessionData);
        const inputNome = document.getElementById('consultoria-nome');
        const inputEmail = document.getElementById('consultoria-email');
        
        if (inputNome && inputEmail) {
          inputNome.value = usuario.nome || '';
          inputEmail.value = usuario.email || '';
          inputNome.readOnly = true;
          inputEmail.readOnly = true;
          inputNome.style.opacity = '0.6';
          inputEmail.style.opacity = '0.6';
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

function filtrarBuilds() {
  const uso = document.getElementById('filter-usage').value;
  const cor = document.getElementById('filter-color').value;
  const preco = document.getElementById('filter-price').value;
  const cards = document.querySelectorAll('.build-card');

  cards.forEach(card => {
    const cardUso = card.getAttribute('data-usage');
    const cardCor = card.getAttribute('data-color');
    const cardPreco = card.getAttribute('data-price');

    const matchUso = (uso === 'all' || cardUso === uso);
    const matchCor = (cor === 'all' || cardCor === cor);
    const matchPreco = (preco === 'all' || cardPreco === preco);

    if (matchUso && matchCor && matchPreco) {
      card.style.removeProperty('display');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });
}

function solicitarVenda(nomePC, event) {
  if (event) event.stopPropagation();
  const pc = BANCO_DE_HARDWARE[nomePC];
  if (pc) openBuildModal(pc.name, pc.price);
  else openBuildModal(nomePC, 'Sob Consulta');
}

function openBuildModal(name, price) {
  const modalName = document.getElementById('modal-build-name');
  const modalPrice = document.getElementById('modal-build-price');
  if (modalName) modalName.textContent = name;
  if (modalPrice) modalPrice.textContent = price;
  document.getElementById('build-modal').classList.add('open');
}

function closeModal() { document.getElementById('build-modal').classList.remove('open'); }

function submitBuildRequest() {
  showToast('Solicitação recebida! Entraremos em contato via WhatsApp/E-mail nas próximas horas.');
  closeModal();
}

// =========================================================
// CONTROLE DE INTERFACE DE NAVEGAÇÃO E SESSÃO
// =========================================================
function updateNav() {
  const navUser = document.getElementById('nav-user-area');
  const navCta = document.getElementById('nav-cta-btn');
  const navLab = document.getElementById('nav-link-cliente');
  const navCart = document.getElementById('nav-cart-btn'); // O Carrinho
  
  if (!navUser || !navCta) return;

  if (isLoggedIn) {
    navCta.style.display = 'none'; 
    navUser.style.display = 'flex'; 
    if (navLab) navLab.style.display = ''; 
    if (navCart) navCart.style.display = 'flex'; // Exibe o carrinho!
    
    const usuarioSalvo = localStorage.getItem('forge_user');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      const displayNome = document.getElementById('client-name-display');
      if(displayNome) displayNome.textContent = usuario.nome.split(" ")[0];
      const iniciais = document.getElementById('nav-avatar-initials');
      if(iniciais) iniciais.textContent = usuario.nome.substring(0, 2).toUpperCase();
    }
    atualizarBadgeCarrinho();
  } else {
    navCta.style.display = 'block'; 
    navUser.style.display = 'none';  
    if (navLab) navLab.style.display = 'none'; 
    if (navCart) navCart.style.display = 'none'; // Esconde o carrinho
  }
}

// =========================================================
// LÓGICA DE COMPRA E CARRINHO
// =========================================================

function adicionarAoCarrinho(idMaquina) {
  // Rota de segurança: se não está logado, trava e manda cadastrar.
  if (!isLoggedIn) {
    showToast('Acesso restrito. Crie uma conta ou faça login para adicionar projetos ao carrinho.', 'error');
    showSection('cadastro'); 
    return;
  }
  
  const pc = BANCO_DE_HARDWARE[idMaquina];
  if (pc) {
    // Puxa o carrinho do banco local do cliente
    let carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
    carrinho.push(idMaquina);
    localStorage.setItem('forge_cart', JSON.stringify(carrinho));
    
    atualizarBadgeCarrinho();
    showToast(`O projeto ${pc.name} foi guardado no seu carrinho!`, 'success');
    
    // Rota direta: leva o cliente pra tela de checkout na hora
    abrirCarrinho(); 
  }
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  
  const carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  if (carrinho.length > 0) {
    badge.textContent = carrinho.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function abrirCarrinho() {
  if (!isLoggedIn) return;
  renderizarCarrinho();
  showSection('carrinho');
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  carrinho.splice(index, 1);
  localStorage.setItem('forge_cart', JSON.stringify(carrinho));
  
  atualizarBadgeCarrinho();
  renderizarCarrinho(); // Atualiza a tela
}

function renderizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const subtotalText = document.getElementById('carrinho-subtotal');
  const totalText = document.getElementById('carrinho-total');
  if (!lista) return;

  const carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  let html = '';
  let somaTotal = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <div style="background: var(--color-iron); padding: 40px; text-align: center; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
        <p style="color: var(--color-gray);">Seu carrinho está vazio.</p>
        <button class="btn-ghost" style="margin-top: 15px;" onclick="showSection('vendas')">Ir para o Catálogo</button>
      </div>`;
    subtotalText.textContent = 'R$ 0,00';
    totalText.textContent = 'R$ 0,00';
    return;
  }

  carrinho.forEach((id, index) => {
    const pc = BANCO_DE_HARDWARE[id];
    if (pc) {
      const precoNum = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
      somaTotal += precoNum;
      
      // Layout blindado: flex-shrink: 0 impede que os botões ou imagens amassem
      html += `
        <div style="display: flex; gap: 20px; background: var(--color-iron); padding: 20px; border-radius: 8px; border: 1px solid rgba(42,132,208,0.2); align-items: center; justify-content: space-between; flex-wrap: wrap;">
          
          <div style="width: 80px; height: 80px; background: var(--color-void); padding: 10px; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${pc.img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
          </div>
          
          <div style="flex: 1; min-width: 150px;">
            <div style="font-family: var(--font-display); font-size: 20px; color: var(--color-ash); text-transform: uppercase; line-height: 1.2;">${pc.name}</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--color-blue); margin-top: 4px;">${pc.price}</div>
          </div>
          
          <button class="btn-ghost" style="padding: 8px 12px; font-size: 10px; border-color: rgba(255,95,87,0.3); color: #ff5f57; flex-shrink: 0;" onclick="removerDoCarrinho(${index})">
            REMOVER
          </button>
          
        </div>
      `;
    }
  });

  lista.innerHTML = html;
  const formatoMoeda = somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  subtotalText.textContent = formatoMoeda;
  totalText.textContent = formatoMoeda;
}

// =========================================================
// 5. LOGIN E AUTENTICAÇÃO VIA API REST
// =========================================================
// =========================================================
// LOGIN PROFISSIONAL
// =========================================================
async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-pass").value.trim();
  
  if(!email || !senha) { 
    showToast("Preencha e-mail e senha para continuar.", "error"); 
    return; 
  }

  const btnSubmit = document.querySelector('#form-login .auth-submit');
  const textoOriginal = btnSubmit.textContent;
  btnSubmit.textContent = "AUTENTICANDO...";
  btnSubmit.style.opacity = "0.7";

  try {
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      isLoggedIn = true;
      localStorage.setItem('forge_token', dados.token);
      localStorage.setItem('forge_user', JSON.stringify(dados.usuario));
      
      updateNav();
      showToast("Autenticação realizada com sucesso!", "success");
      
      // Carrega o dashboard e redireciona
      carregarDashboardDoCliente();
      setTimeout(() => showSection("cliente"), 500);
    } else {
      showToast(dados.message || "Credenciais inválidas.", "error");
    }
  } catch (erro) {
    console.error("Erro API:", erro);
    showToast("Falha ao comunicar com os servidores da FORGE.", "error");
  } finally {
    btnSubmit.textContent = textoOriginal;
    btnSubmit.style.opacity = "1";
  }
}

// =========================================================
// INTEGRAÇÃO FRONT-END: LOGIN VIA GOOGLE
// =========================================================
window.handleGoogleLogin = async function(response) {
  // O Google devolveu a credencial! Vamos enviá-la para o nosso Back-end.
  try {
    const resposta = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      // Sincroniza o estado de login igual fazemos no login tradicional
      isLoggedIn = true;
      localStorage.setItem('forge_token', dados.token);
      localStorage.setItem('forge_user', JSON.stringify(dados.usuario));
      
      updateNav();
      showToast(dados.message || "Autenticação via Google realizada!", "success");
      
      // Carrega os dados reais do Dashboard VIP e redireciona
      carregarDashboardDoCliente();
      
      // Verifica se o usuário estava no meio de uma compra (Auth Guard)
      if (typeof _resumePendingAction === 'function' && window._pendingAction) {
        if (typeof closeAuthGuardModal === 'function') closeAuthGuardModal();
        _resumePendingAction();
      } else {
        setTimeout(() => showSection("cliente"), 500);
      }

    } else {
      showToast(dados.message || "Não foi possível vincular a conta do Google.", "error");
    }
  } catch (erro) {
    console.error("Erro API Google:", erro);
    showToast("Falha de comunicação com os servidores da FORGE.", "error");
  }
};

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO INTERNO DO MÓDULO
// ─────────────────────────────────────────────────────────────────────────────

/** Guarda a ação que disparou o auth guard para retomar após login */
let _pendingAction = null;

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULO 0 — AUTH GUARD
// Intercepta qualquer ação que exige sessão ativa.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * authGuard(callback)
 * Padrão "interceptor de intenção": verifica sessão antes de executar uma
 * ação de compra. Se não há sessão, abre o modal de auth e armazena o
 * callback para ser executado imediatamente após o login bem-sucedido.
 *
 * @param {Function} callback - A ação a executar quando autenticado
 * @param {string}   context  - Label descritivo para o toast (ex: nome do produto)
 */
function authGuard(callback, context = '') {
  if (isLoggedIn) {
    // Usuário logado → executa direto, sem interceptação
    callback();
    return;
  }

  // Armazena a intenção de compra para retomar após login
  _pendingAction = { fn: callback, context };

  // Abre o modal premium de login/cadastro
  _openAuthModal(context);
}

/**
 * _resumePendingAction()
 * Chamado pelo doLogin/doRegister após autenticação bem-sucedida.
 * Retoma a ação de compra que o usuário estava tentando fazer.
 */
function _resumePendingAction() {
  if (!_pendingAction) return;

  const { fn, context } = _pendingAction;
  _pendingAction = null;

  if (context) {
    showToast(`Continuando: ${context}`, 'success');
  }

  // Pequeno delay para o modal fechar visualmente antes de executar
  setTimeout(() => fn(), 350);
}

/**
 * _openAuthModal(context)
 * Cria e exibe o modal premium de auth guard (login/cadastro).
 * Remove qualquer modal anterior para evitar duplicatas.
 */
function _openAuthModal(context) {
  // Remove instâncias anteriores
  const existing = document.getElementById('forge-auth-guard-modal');
  if (existing) existing.remove();

  const contextLabel = context
    ? `<p class="ag-modal__context">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round">
           <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
           <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
         </svg>
         Adicionando ao carrinho: <strong>${context}</strong>
       </p>`
    : '';

  const modal = document.createElement('div');
  modal.id        = 'forge-auth-guard-modal';
  modal.className = 'ag-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'ag-modal-title');

  modal.innerHTML = `
    <div class="ag-modal" role="document">

      <!-- Cabeçalho do modal -->
      <div class="ag-modal__header">
        <div class="ag-modal__logo" aria-hidden="true">
          <svg width="28" height="32" viewBox="0 0 56 66" fill="none" focusable="false">
            <polygon points="28,3 51,16 51,50 28,63 5,50 5,16" fill="var(--color-blue)"/>
            <rect x="17" y="14" width="8"  height="31" fill="var(--color-void)"/>
            <rect x="25" y="14" width="14" height="9"  fill="var(--color-void)"/>
            <rect x="25" y="30" width="10" height="8"  fill="var(--color-void)"/>
          </svg>
          <span>FORGE</span>
        </div>
        <button class="ag-modal__close" onclick="closeAuthGuardModal()"
                aria-label="Fechar modal de login">✕</button>
      </div>

      <!-- Mensagem de contexto (produto) -->
      ${contextLabel}

      <h2 class="ag-modal__title" id="ag-modal-title">
        Acesso exclusivo<br>para clientes FORGE
      </h2>
      <p class="ag-modal__sub">
        Faça login ou crie sua conta para finalizar a compra.
        Todos os seus dados são protegidos.
      </p>

      <!-- Tabs: Entrar / Criar conta -->
      <div class="ag-tabs" role="tablist" aria-label="Opções de acesso">
        <button class="ag-tab ag-tab--active" role="tab"
                id="ag-tab-login"
                aria-selected="true"
                aria-controls="ag-panel-login"
                onclick="agSwitchTab('login')">
          Entrar
        </button>
        <button class="ag-tab" role="tab"
                id="ag-tab-register"
                aria-selected="false"
                aria-controls="ag-panel-register"
                onclick="agSwitchTab('register')">
          Criar conta
        </button>
      </div>

      <!-- Painel: Login -->
      <div class="ag-panel ag-panel--active"
           id="ag-panel-login"
           role="tabpanel"
           aria-labelledby="ag-tab-login">

        <div class="ag-field">
          <label for="ag-email">E-mail</label>
          <input type="email"    id="ag-email"
                 placeholder="seu@email.com"
                 autocomplete="email">
        </div>
        <div class="ag-field">
          <label for="ag-senha">Senha</label>
          <input type="password" id="ag-senha"
                 placeholder="••••••••"
                 autocomplete="current-password"
                 onkeydown="if(event.key==='Enter') agDoLogin()">
        </div>

        <button class="ag-btn-primary" id="ag-btn-login" onclick="agDoLogin()">
          Entrar e continuar comprando
        </button>

        <div class="ag-divider" aria-hidden="true">ou</div>

        <a href="https://api.whatsapp.com/send?phone=5531900000000&text=Olá! Gostaria de criar uma conta FORGE."
           target="_blank" rel="noopener" class="ag-btn-whatsapp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Entrar via WhatsApp
        </a>

      </div>

      <!-- Painel: Criar conta (rápido, conversão focada) -->
      <div class="ag-panel"
           id="ag-panel-register"
           role="tabpanel"
           aria-labelledby="ag-tab-register"
           hidden>

        <div class="ag-field-row">
          <div class="ag-field">
            <label for="ag-reg-nome">Nome</label>
            <input type="text" id="ag-reg-nome"
                   placeholder="Seu nome"
                   autocomplete="given-name">
          </div>
          <div class="ag-field">
            <label for="ag-reg-sobrenome">Sobrenome</label>
            <input type="text" id="ag-reg-sobrenome"
                   placeholder="Sobrenome"
                   autocomplete="family-name">
          </div>
        </div>
        <div class="ag-field">
          <label for="ag-reg-email">E-mail</label>
          <input type="email" id="ag-reg-email"
                 placeholder="seu@email.com"
                 autocomplete="email">
        </div>
        <div class="ag-field">
          <label for="ag-reg-tel">WhatsApp</label>
          <input type="tel" id="ag-reg-tel"
                 placeholder="(31) 9 9999-9999"
                 autocomplete="tel">
        </div>
        <div class="ag-field">
          <label for="ag-reg-senha">Senha</label>
          <input type="password" id="ag-reg-senha"
                 placeholder="Mínimo 8 caracteres"
                 autocomplete="new-password"
                 onkeydown="if(event.key==='Enter') agDoRegister()">
        </div>

        <button class="ag-btn-primary" id="ag-btn-register" onclick="agDoRegister()">
          Criar conta e continuar
        </button>

        <p class="ag-terms">
          Ao criar uma conta você concorda com os
          <a href="#" onclick="return false">Termos de Uso</a>
          e <a href="#" onclick="return false">Política de Privacidade</a>.
        </p>
      </div>

      <!-- Selos de confiança (Redução de fricção / prova social) -->
      <div class="ag-trust" aria-label="Selos de segurança">
        <span> SSL</span>
        <span>✓ 3 Anos de Garantia</span>
        <span>✓ Frete Grátis para Belo Horizonte</span>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  // Fecha ao clicar no overlay (fora do card)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAuthGuardModal();
  });

  // Foco acessível: move para o primeiro campo
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add('ag-overlay--visible');
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  });

  // Teclado: fecha com Escape
  document.addEventListener('keydown', _agEscapeHandler);
}

function _agEscapeHandler(e) {
  if (e.key === 'Escape') {
    closeAuthGuardModal();
    document.removeEventListener('keydown', _agEscapeHandler);
  }
}

/** Fecha e destrói o modal de auth guard */
function closeAuthGuardModal() {
  const modal = document.getElementById('forge-auth-guard-modal');
  if (!modal) return;

  modal.classList.remove('ag-overlay--visible');
  setTimeout(() => modal.remove(), 320);
  document.removeEventListener('keydown', _agEscapeHandler);
}

/** Alterna entre abas Entrar/Criar conta dentro do modal */
function agSwitchTab(tab) {
  const tabs   = document.querySelectorAll('#forge-auth-guard-modal .ag-tab');
  const panels = document.querySelectorAll('#forge-auth-guard-modal .ag-panel');

  tabs.forEach(t => {
    const isTarget = t.id === `ag-tab-${tab}`;
    t.classList.toggle('ag-tab--active', isTarget);
    t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  panels.forEach(p => {
    const isTarget = p.id === `ag-panel-${tab}`;
    p.classList.toggle('ag-panel--active', isTarget);
    p.hidden = !isTarget;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTENTICAÇÃO INTERNA DO AUTH GUARD
// Versões focadas em conversão que rodam dentro do modal premium.
// Após sucesso, chamam _resumePendingAction() para retomar a compra.
// ─────────────────────────────────────────────────────────────────────────────

async function agDoLogin() {
  const email = document.getElementById('ag-email')?.value.trim();
  const senha = document.getElementById('ag-senha')?.value.trim();

  if (!email || !senha) {
    showToast('Preencha e-mail e senha.', 'error');
    return;
  }

  const btn = document.getElementById('ag-btn-login');
  const original = btn.textContent;
  btn.textContent = 'AUTENTICANDO...';
  btn.disabled = true;

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, senha }),
    });
    const data = await res.json();

    if (res.ok) {
      // ── Sucesso: sincroniza estado global do script.js ──
      isLoggedIn = true;
      localStorage.setItem('forge_token', data.token);
      localStorage.setItem('forge_user',  JSON.stringify(data.usuario));

      updateNav();
      closeAuthGuardModal();
      showToast(`Bem-vindo de volta, ${data.usuario.nome.split(' ')[0]}!`, 'success');

      // Carrega o dashboard em background e retoma a compra
      renderDashboardVIP(data.usuario);
      _resumePendingAction();
    } else {
      showToast(data.message || 'Credenciais inválidas.', 'error');
      btn.textContent = original;
      btn.disabled    = false;
    }
  } catch {
    showToast('Falha de conexão. Tente novamente.', 'error');
    btn.textContent = original;
    btn.disabled    = false;
  }
}

async function agDoRegister() {
  const nome      = document.getElementById('ag-reg-nome')?.value.trim();
  const sobrenome = document.getElementById('ag-reg-sobrenome')?.value.trim();
  const email     = document.getElementById('ag-reg-email')?.value.trim();
  const tel       = document.getElementById('ag-reg-tel')?.value.trim();
  const senha     = document.getElementById('ag-reg-senha')?.value.trim();

  if (!nome || !email || !senha) {
    showToast('Preencha nome, e-mail e senha.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('E-mail inválido.', 'error');
    return;
  }

  if (senha.length < 8) {
    showToast('A senha deve ter no mínimo 8 caracteres.', 'error');
    return;
  }

  const btn = document.getElementById('ag-btn-register');
  const original = btn.textContent;
  btn.textContent = 'CRIANDO CONTA...';
  btn.disabled = true;

  try {
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome, sobrenome, email, telefone: tel, senha }),
    });
    const data = await res.json();

    if (res.ok) {
      isLoggedIn = true;
      localStorage.setItem('forge_token', data.token || 'mock-token');
      localStorage.setItem('forge_user',  JSON.stringify(data.usuario));

      updateNav();
      closeAuthGuardModal();
      showToast(`Conta criada! Bem-vindo(a), ${nome}!`, 'success');

      renderDashboardVIP(data.usuario);
      _resumePendingAction();
    } else {
      showToast(data.message || 'Erro ao criar conta.', 'error');
      btn.textContent = original;
      btn.disabled    = false;
    }
  } catch {
    showToast('Falha de conexão. Tente novamente.', 'error');
    btn.textContent = original;
    btn.disabled    = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULO PÚBLICO: solicitarVendaComGuard
// Substitui o onclick="solicitarVenda()" dos cards de produto.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * solicitarVendaComGuard(idProduto, event)
 * Chamado pelo botão "Comprar Agora" de cada card.
 * Intercepta a ação se o usuário não estiver logado.
 */
function solicitarVendaComGuard(idProduto, event) {
  if (event) event.stopPropagation();

  const pc = BANCO_DE_HARDWARE[idProduto];
  const nome = pc ? pc.name : idProduto;

  authGuard(() => {
    // Ação real de compra: abre o modal de orçamento padrão do script.js
    if (typeof openBuildModal === 'function') {
      openBuildModal(nome, pc ? pc.price : 'Sob Consulta');
    } else {
      showToast(`${nome} adicionado ao carrinho!`, 'success');
    }

    // Adiciona ao carrinho local (wishlist/carrinho)
    _adicionarAoCarrinho(idProduto);
  }, nome);
}

/** Persistência mínima de carrinho no localStorage */
function _adicionarAoCarrinho(idProduto) {
  const carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  if (!carrinho.includes(idProduto)) {
    carrinho.push(idProduto);
    localStorage.setItem('forge_cart', JSON.stringify(carrinho));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DADOS MOCK — substituir por chamadas à API REST quando backend estiver pronto
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TICKETS = [
  {
    id:        'TKT-1024',
    titulo:    'Dúvida sobre temperatura da CPU durante render',
    status:    'em_analise',
    dataAbertura: '2025-07-01',
    engenheiro:  'Carlos M.',
    resposta:  'Estamos analisando o laudo térmico enviado. Retorno em até 24h.',
  },
  {
    id:        'TKT-0998',
    titulo:    'Expansão de RAM — compatibilidade de kit',
    status:    'resolvido',
    dataAbertura: '2025-06-18',
    engenheiro:  'Ana P.',
    resposta:  'Kit DDR5 6000MHz CL30 compatível. Envie o modelo da placa-mãe para confirmação final.',
  },
];

const UPSELL_OFFERS = [
  {
    badge:  'GPU UPGRADE',
    titulo: 'RTX 4070 Ti SUPER 16GB',
    desc:   'Elimine o gargalo da sua GPU atual. +47% de performance em render 3D.',
    preco:  'R$ 3.800',
    cor:    'blue',
  },
  {
    badge:  'RAM UPGRADE',
    titulo: 'Kit DDR5 6000 32GB',
    desc:   'Dobrar a RAM elimina stuttering em VMs, edição 4K e multitarefa pesada.',
    preco:  'R$ 680',
    cor:    'green',
  },
  {
    badge:  'STORAGE UPGRADE',
    titulo: 'NVMe Gen5 2TB Kingston',
    desc:   'Carregamento 3× mais rápido. Ideal para projetos Unreal Engine e DAW.',
    preco:  'R$ 1.200',
    cor:    'amber',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULO PRINCIPAL — renderDashboardVIP(usuario)
// Renderiza o Dashboard "Meu Laboratório" dinamicamente no DOM.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * renderDashboardVIP(usuario)
 * @param {Object} usuario - Objeto do usuário { id, nome, email, perfil_uso, buildId }
 *
 * Cria do zero o HTML do painel VIP e o injeta na <section id="cliente">.
 * A seção só passa a "existir" visualmente quando o usuário está autenticado.
 */
function renderDashboardVIP(usuario) {
  const container = document.getElementById('cliente');
  if (!container) return;

  const primeiroNome = usuario.nome.split(' ')[0];
  const initiais     = usuario.nome.substring(0, 2).toUpperCase();
  const perfil       = usuario.perfil_uso || 'Explorador';

  // Wishlist persistida no localStorage
  const savedIds = JSON.parse(localStorage.getItem('forge_saved_builds') || '[]');

  // ── Constrói os módulos independentemente ──────────────────────────────────
  const modA = _buildModuloSetup();
  const modB = _buildModuloUpsell(savedIds);
  const modC = _buildModuloChamados();
  const modD = _buildModuloWishlist(savedIds);

  // ── Injeta o layout completo ───────────────────────────────────────────────
  container.innerHTML = `

    <!-- ──────────────────────────────────────────
         CABEÇALHO DO LABORATÓRIO
    ────────────────────────────────────────────── -->
    <header class="lab__header">

      <div class="lab__header-left">
        <div class="lab__avatar" aria-hidden="true">${initials(usuario.nome)}</div>
        <div>
          <p class="lab__eyebrow">Dashboard</p>
          <h1 class="lab__title">
            Bem-vindo, <span class="lab__title-name">${primeiroNome}</span>
          </h1>
          <p class="lab__meta">
            <span class="lab__badge lab__badge--profile">${perfil}</span>
            <span class="lab__badge lab__badge--id">ID: ${usuario.id || 'FRG-2025'}</span>
          </p>
        </div>
      </div>

      <div class="lab__header-actions">
        <button class="lab__btn-secondary"
                onclick="showSection('vendas')"
                aria-label="Ir para o catálogo">
          Ver Catálogo
        </button>
        <button class="lab__btn-logout"
                onclick="labLogout()"
                aria-label="Sair da conta">
          Sair
        </button>
      </div>

    </header>

    <!-- ──────────────────────────────────────────
         GRADE PRINCIPAL DO DASHBOARD (2 colunas)
         Coluna 1 (larga): Módulos A e B
         Coluna 2 (fixa): Módulos C e D
    ────────────────────────────────────────────── -->
    <div class="lab__grid">

      <!-- Coluna principal -->
      <div class="lab__col-main">
        ${modA}
        ${modB}
      </div>

      <!-- Coluna lateral -->
      <aside class="lab__col-sidebar" aria-label="Painel de suporte e projetos salvos">
        ${modC}
        ${modD}
      </aside>

    </div>

  `;

  // Ativa os listeners após renderização
  _initDashboardEvents();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE RENDERIZAÇÃO DOS 4 MÓDULOS
// ─────────────────────────────────────────────────────────────────────────────

/** Módulo A — Meu Setup Atual (Custom Build Analyzer) */
function _buildModuloSetup() {
  return `
    <section class="lab__card lab__card--setup" aria-labelledby="mod-setup-title">

      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--blue" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </div>
        <div>
          <h2 class="lab__card-title" id="mod-setup-title">Meu Setup Atual</h2>
          <p class="lab__card-sub">Analisador de gargalo de performance</p>
        </div>
        <span class="lab__pill lab__pill--beta">BETA IA</span>
      </div>

      <p class="lab__card-desc">
        Cadastre seu hardware. Nossa engine identificará o gargalo do sistema
        e sugerirá o upgrade com maior impacto no seu workload.
      </p>

      <div class="setup-form">
        <div class="setup-form__row">

          <div class="setup-field">
            <label for="setup-cpu-vip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="7" y="7" width="10" height="10" rx="1"/>
                <path d="M9 2v2M12 2v2M15 2v2M9 20v2M12 20v2M15 20v2
                         M2 9h2M2 12h2M2 15h2M20 9h2M20 12h2M20 15h2"/>
              </svg>
              Processador (CPU)
            </label>
            <input type="text" id="setup-cpu-vip"
                   placeholder="Ex: Intel Core i5-9400F"
                   autocomplete="off">
          </div>

          <div class="setup-field">
            <label for="setup-gpu-vip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="2" y="7" width="20" height="10" rx="2"/>
                <path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2"/>
              </svg>
              Placa de Vídeo (GPU)
            </label>
            <input type="text" id="setup-gpu-vip"
                   placeholder="Ex: NVIDIA GTX 1660"
                   autocomplete="off">
          </div>

        </div>

        <div class="setup-form__row setup-form__row--narrow">

          <div class="setup-field">
            <label for="setup-ram-vip">Memória RAM</label>
            <select id="setup-ram-vip">
              <option value="4">4 GB  (abaixo do mínimo)</option>
              <option value="8">8 GB  (entry level)</option>
              <option value="16" selected>16 GB (padrão)</option>
              <option value="32">32 GB (workstation)</option>
              <option value="64">64 GB (workstation pro)</option>
            </select>
          </div>

          <div class="setup-field">
            <label for="setup-uso-vip">Uso principal</label>
            <select id="setup-uso-vip">
              <option value="gaming">Gaming / Streaming</option>
              <option value="3d">Render 3D / Motion</option>
              <option value="dev">Desenvolvimento</option>
              <option value="ia">IA / Data Science</option>
              <option value="office">Office / Administrativo</option>
            </select>
          </div>

        </div>

        <button class="lab__btn-primary" id="btn-analisar-setup"
                onclick="labAnalisarSetup()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Analisar Gargalo de Performance
        </button>
      </div>

      <!-- Resultado da análise (oculto até rodar) -->
      <div id="setup-resultado" class="setup-result" hidden aria-live="polite">

        <div class="setup-result__header">
          <span class="setup-result__label">FORGE DIAGNOSTIC ENGINE v2.1</span>
          <span class="setup-result__status" id="setup-status-badge"></span>
        </div>

        <div class="setup-result__meter">
          <div class="setup-result__meter-header">
            <span class="setup-result__meter-label">Gargalo identificado</span>
            <span class="setup-result__meter-value" id="setup-pct-text"></span>
          </div>
          <div class="setup-result__bar-track" role="progressbar"
               aria-label="Nível de gargalo"
               aria-valuemin="0" aria-valuemax="100"
               id="setup-bar-aria">
            <div class="setup-result__bar-fill" id="setup-bar-fill"></div>
          </div>
        </div>

        <p class="setup-result__desc" id="setup-resultado-texto"></p>

        <button class="lab__btn-ghost" style="margin-top:16px"
                onclick="showSection('vendas')">
          Ver upgrades recomendados →
        </button>

      </div>

    </section>
  `;
}

/** Módulo B — Central de Ofertas Inteligentes (Upsell) */
function _buildModuloUpsell(savedIds) {
  const ofertasHTML = UPSELL_OFFERS.map(o => `
    <article class="upsell-card" aria-label="Oferta: ${o.titulo}">
      <span class="upsell-card__badge upsell-card__badge--${o.cor}">${o.badge}</span>
      <h3 class="upsell-card__title">${o.titulo}</h3>
      <p class="upsell-card__desc">${o.desc}</p>
      <div class="upsell-card__footer">
        <span class="upsell-card__price">${o.preco}</span>
        <button class="lab__btn-ghost upsell-card__cta"
                onclick="showToast('Solicitação de upgrade enviada!', 'success')">
          Solicitar
        </button>
      </div>
    </article>
  `).join('');

  // Builds salvas para contexto de upsell
  const savedNames = savedIds
    .slice(0, 2)
    .map(id => BANCO_DE_HARDWARE[id]?.name)
    .filter(Boolean);

  const contextNote = savedNames.length
    ? `<p class="upsell__context-note">
         <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-blue)" stroke-width="2" aria-hidden="true">
           <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
           <line x1="12" y1="16" x2="12.01" y2="16"/>
         </svg>
         Baseado nos seus projetos: <strong>${savedNames.join(', ')}</strong>
       </p>`
    : '<p class="upsell__context-note">Baseado no seu perfil de uso e análise de hardware.</p>';

  return `
    <section class="lab__card lab__card--upsell" aria-labelledby="mod-upsell-title">

      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--amber" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div>
          <h2 class="lab__card-title" id="mod-upsell-title">Ofertas Exclusivas para Você</h2>
          <p class="lab__card-sub">Upgrades selecionados pelo nosso sistema de recomendação</p>
        </div>
      </div>

      ${contextNote}

      <div class="upsell-grid">
        ${ofertasHTML}
      </div>

    </section>
  `;
}

/** Módulo C — Concierge Support (Tickets) */
function _buildModuloChamados() {
  const ticketStatusMap = {
    em_analise: { label: 'Em Análise',    cor: 'amber' },
    aberto:     { label: 'Aberto',        cor: 'blue'  },
    resolvido:  { label: 'Resolvido',     cor: 'green' },
    fechado:    { label: 'Fechado',       cor: 'gray'  },
  };

  const ticketsHTML = MOCK_TICKETS.map(t => {
    const st = ticketStatusMap[t.status] || ticketStatusMap.aberto;
    return `
      <article class="ticket" aria-label="Ticket ${t.id}: ${t.titulo}">
        <div class="ticket__header">
          <span class="ticket__id">${t.id}</span>
          <span class="ticket__status ticket__status--${st.cor}">${st.label}</span>
        </div>
        <p class="ticket__titulo">${t.titulo}</p>
        <p class="ticket__meta">
          Aberto em ${t.dataAbertura} · Engenheiro: ${t.engenheiro}
        </p>
        <p class="ticket__resposta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          ${t.resposta}
        </p>
      </article>
    `;
  }).join('');

  return `
    <section class="lab__card lab__card--support" aria-labelledby="mod-chamados-title">

      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--green" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div>
          <h2 class="lab__card-title" id="mod-chamados-title">Concierge Support</h2>
          <p class="lab__card-sub">Seus chamados de garantia e suporte técnico</p>
        </div>
      </div>

      <div class="ticket-list" role="list">
        ${ticketsHTML}
      </div>

      <button class="lab__btn-primary lab__btn-primary--full"
              style="margin-top:20px"
              onclick="labAbrirNovoChamado()"
              aria-label="Abrir novo chamado de suporte">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Abrir Novo Chamado
      </button>

    </section>
  `;
}

/** Módulo D — Projetos Salvos (Wishlist) */
function _buildModuloWishlist(savedIds) {
  let listaHTML;

  if (!savedIds.length) {
    listaHTML = `
      <div class="wishlist__empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="var(--color-gray)" stroke-width="1.5" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06
                   a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                   1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <p>Nenhum projeto salvo ainda.</p>
        <button class="lab__btn-ghost"
                onclick="showSection('vendas')"
                style="font-size:13px;padding:8px 16px;margin-top:12px">
          Explorar Catálogo
        </button>
      </div>
    `;
  } else {
    listaHTML = savedIds.map(id => {
      const pc = BANCO_DE_HARDWARE[id];
      if (!pc) return '';
      const shortCpu = pc.specs?.cpu?.replace('Intel Core ', '').replace('AMD ', '') || '—';
      const shortGpu = pc.specs?.gpu?.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '') || '—';
      return `
        <article class="wishlist-item" aria-label="Projeto salvo: ${pc.name}">
          <div class="wishlist-item__info">
            <p class="wishlist-item__name">${pc.name}</p>
            <p class="wishlist-item__specs">${shortCpu} · ${shortGpu}</p>
            <p class="wishlist-item__price">${pc.price}</p>
          </div>
          <div class="wishlist-item__actions">
            <button class="wishlist-item__btn wishlist-item__btn--view"
                    onclick="abrirDetalhesProduto('${id}')"
                    aria-label="Ver detalhes de ${pc.name}">
              Ver
            </button>
            <button class="wishlist-item__btn wishlist-item__btn--cart"
                    onclick="solicitarVendaComGuard('${id}', event)"
                    aria-label="Mover ${pc.name} para o carrinho">
              Comprar
            </button>
            <button class="wishlist-item__btn wishlist-item__btn--remove"
                    onclick="labRemoverDaWishlist('${id}', this)"
                    aria-label="Remover ${pc.name} dos projetos salvos">
              ✕
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  return `
    <section class="lab__card lab__card--wishlist" aria-labelledby="mod-wishlist-title">

      <div class="lab__card-header">
        <div class="lab__card-icon lab__card-icon--red" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06
                     a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                     1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        <div>
          <h2 class="lab__card-title" id="mod-wishlist-title">Projetos Salvos</h2>
          <p class="lab__card-sub">${savedIds.length} build${savedIds.length !== 1 ? 's' : ''} favoritada${savedIds.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div class="wishlist-list" role="list">
        ${listaHTML}
      </div>

    </section>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTOS E INTERAÇÕES DO DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

function _initDashboardEvents() {
  // Nada a registrar agora — todos os handlers estão nos atributos onclick
  // para manter compatibilidade com o script.js original.
}

/** Motor de análise de gargalo (Módulo A) */
function labAnalisarSetup() {
  const cpu = document.getElementById('setup-cpu-vip')?.value.trim();
  const gpu = document.getElementById('setup-gpu-vip')?.value.trim();
  const ram = document.getElementById('setup-ram-vip')?.value;
  const uso = document.getElementById('setup-uso-vip')?.value;

  if (!cpu || !gpu) {
    showToast('Preencha CPU e GPU para a análise.', 'error');
    return;
  }

  const btn = document.getElementById('btn-analisar-setup');
  btn.textContent = 'Analisando...';
  btn.disabled    = true;

  setTimeout(() => {
    const resultado = document.getElementById('setup-resultado');
    const barFill   = document.getElementById('setup-bar-fill');
    const pctText   = document.getElementById('setup-pct-text');
    const descText  = document.getElementById('setup-resultado-texto');
    const badge     = document.getElementById('setup-status-badge');
    const barAria   = document.getElementById('setup-bar-aria');

    if (!resultado) return;

    // Algoritmo de scoring simplificado (substitua por chamada à API)
    let gargalo = Math.floor(Math.random() * (50 - 20)) + 20;
    let cor, nivel, mensagem;

    if (gargalo > 40) {
      cor = '#ff5f57'; nivel = 'CRÍTICO';
      mensagem = `Sua <strong>${gpu}</strong> é o principal limitador do seu <strong>${cpu}</strong>.
                  Em workloads de ${_labelUso(uso)} você está perdendo até
                  <strong>${gargalo}% de performance</strong> por bottleneck de GPU.`;
    } else if (gargalo > 25) {
      cor = '#ffbd2e'; nivel = 'MODERADO';
      mensagem = `Setup desbalanceado. Um upgrade cirúrgico de GPU pode destravar o
                  potencial do seu <strong>${cpu}</strong> sem precisar trocar o PC inteiro.
                  Ganho estimado: <strong>${gargalo}% mais performance</strong> em ${_labelUso(uso)}.`;
    } else {
      cor = '#00a650'; nivel = 'BALANCEADO';
      gargalo = gargalo;
      mensagem = `Seu setup está bem equilibrado para ${_labelUso(uso)}.
                  O ganho marginal de um upgrade agora seria de apenas <strong>${gargalo}%</strong>.
                  Avalie aguardar a próxima geração para melhor custo-benefício.`;
    }

    // Reseta a barra antes de animar
    barFill.style.width   = '0%';
    barFill.style.background = cor;
    barFill.style.boxShadow  = `0 0 12px ${cor}66`;
    barAria.setAttribute('aria-valuenow', gargalo);

    resultado.hidden = false;
    pctText.textContent  = `${gargalo}%`;
    pctText.style.color  = cor;
    badge.textContent    = nivel;
    badge.className      = 'setup-result__status';
    badge.dataset.nivel  = nivel.toLowerCase();

    descText.innerHTML = mensagem;

    // Anima a barra com requestAnimationFrame para garantir transição
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barFill.style.width = `${gargalo}%`;
      });
    });

    showToast('Diagnóstico de telemetria concluído.', 'success');
    btn.textContent = 'Reanalisar';
    btn.disabled    = false;
  }, 1200);
}

function _labelUso(uso) {
  const map = { gaming: 'Gaming', '3d': 'Render 3D', dev: 'Desenvolvimento',
                ia: 'IA / Data Science', office: 'Office' };
  return map[uso] || 'uso geral';
}

/** Abre o formulário de novo chamado (integração futura com API) */
function labAbrirNovoChamado() {
  // Implementação futura: abre modal de chamado com campos de título,
  // categoria e descrição, envia POST /api/suporte/chamados
  showToast('Painel de chamados em breve!', 'success');
}

/** Remove um item da wishlist e re-renderiza o módulo D */
function labRemoverDaWishlist(id, btnEl) {
  let saved = JSON.parse(localStorage.getItem('forge_saved_builds') || '[]');
  saved = saved.filter(i => i !== id);
  localStorage.setItem('forge_saved_builds', JSON.stringify(saved));

  // Animação de saída e remoção do item
  const item = btnEl.closest('.wishlist-item');
  if (item) {
    item.style.transition = 'opacity .3s, transform .3s';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(20px)';
    setTimeout(() => {
      item.remove();
      // Atualiza a contagem no subtítulo
      const sub = document.querySelector('#mod-wishlist-title + p, .lab__card--wishlist .lab__card-sub');
      if (sub) {
        const total = saved.length;
        sub.textContent = `${total} build${total !== 1 ? 's' : ''} favoritada${total !== 1 ? 's' : ''}`;
      }
    }, 300);
  }

  showToast('Projeto removido dos favoritos.', 'success');
}

/** Salva um produto na wishlist (chamado a partir do catálogo) */
function labSalvarNaWishlist(id) {
  let saved = JSON.parse(localStorage.getItem('forge_saved_builds') || '[]');
  if (saved.includes(id)) {
    showToast('Já está nos seus projetos salvos.', 'error');
    return;
  }
  saved.push(id);
  localStorage.setItem('forge_saved_builds', JSON.stringify(saved));
  const pc = BANCO_DE_HARDWARE[id];
  showToast(`${pc ? pc.name : 'Build'} salva nos Projetos!`, 'success');
}

/** Logout a partir do dashboard */
function labLogout() {
  isLoggedIn = false;
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  updateNav();
  showToast('Sessão encerrada.', 'success');
  showSection('hero');
}

/** Helper: gera iniciais para o avatar */
function initials(nome) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// PONTO DE ENTRADA — Substituição do carregarDashboardDoCliente()
// ─────────────────────────────────────────────────────────────────────────────


// Expõe as funções públicas no escopo global (necessário para os onclicks inline)
window.authGuard               = authGuard;
window.closeAuthGuardModal     = closeAuthGuardModal;
window.agSwitchTab             = agSwitchTab;
window.agDoLogin               = agDoLogin;
window.agDoRegister            = agDoRegister;
window.solicitarVendaComGuard  = solicitarVendaComGuard;
window.renderDashboardVIP      = renderDashboardVIP;
window.labAnalisarSetup        = labAnalisarSetup;
window.labAbrirNovoChamado     = labAbrirNovoChamado;
window.labRemoverDaWishlist    = labRemoverDaWishlist;
window.labSalvarNaWishlist     = labSalvarNaWishlist;
window.labLogout               = labLogout;

// =========================================================
// LÓGICA DO ANALISADOR DE GARGALO (INOVAÇÃO PARA APRESENTAÇÃO)
// =========================================================
function analisarSetupAtual() {
  const cpu = document.getElementById('setup-cpu').value.trim();
  const gpu = document.getElementById('setup-gpu').value.trim();
  
  if(!cpu || !gpu) {
    showToast("Preencha a CPU e a GPU para nossa IA analisar.", "error");
    return;
  }

  const resultDiv = document.getElementById('resultado-analise');
  const barra = document.getElementById('gargalo-barra');
  const texto = document.getElementById('gargalo-texto');
  const percText = document.getElementById('gargalo-porcentagem');

  // Reseta para a animação rodar
  resultDiv.style.display = 'block';
  barra.style.width = '0%';
  texto.innerHTML = "Analisando telemetria...";

  // Simula um tempo de processamento de IA (1.5 segundos)
  setTimeout(() => {
    // Para a apresentação: gera um gargalo dinâmico aleatório entre 25% e 45% para dar realismo
    const gargaloNum = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
    
    percText.textContent = `${gargaloNum}%`;
    barra.style.width = `${gargaloNum}%`;
    
    // Altera a cor baseada na gravidade
    if(gargaloNum > 35) {
      barra.style.background = '#ff5f57'; // Vermelho
      percText.style.color = '#ff5f57';
      texto.innerHTML = `Sua <strong>${gpu}</strong> é muito fraca para acompanhar o processamento do seu <strong>${cpu}</strong>. Você está perdendo até ${gargaloNum}% de performance em jogos por gargalo de renderização (Bottleneck).`;
    } else {
      barra.style.background = '#ffbd2e'; // Amarelo
      percText.style.color = '#ffbd2e';
      texto.innerHTML = `Seu setup está desbalanceado. Um upgrade pontual na placa de vídeo pode destravar o potencial adormecido do seu sistema atual sem precisar trocar o PC inteiro.`;
    }

    showToast("Análise de telemetria concluída.", "success");
  }, 1000);
}

async function doRegister() {
  const container = document.getElementById('form-register');
  const inputs = container.querySelectorAll('input, select');
  
  const nome = inputs[0].value.trim();
  const sobrenome = inputs[1].value.trim();
  const email = inputs[2].value.trim();
  const whatsapp = inputs[3].value.trim();
  const perfil_uso = inputs[4].value;
  const senha = inputs[5].value.trim();

  // 1. Validação de Campos Vazios
  if (!nome || !sobrenome || !email || !whatsapp || !perfil_uso || !senha) { 
    showToast("Por favor, preencha todos os campos do formulário."); 
    return; 
  }

  // 2. Validação Rigorosa de E-mail (Regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("E-mail inválido. Digite um e-mail no formato correto (ex: seu@email.com).");
    return;
  }

  // 3. Validação Rigorosa de WhatsApp (Remove traços/espaços e exige 10 ou 11 dígitos com DDD)
  const numeroLimpo = whatsapp.replace(/\D/g, '');
  if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
    showToast("WhatsApp inválido. Digite o número com o DDD (ex: 31999999999).");
    return;
  }

  // 4. Validação de Senha Forte
  if (senha.length < 8) {
    showToast("A senha deve ter no mínimo 8 caracteres.");
    return;
  }

  const btnSubmit = container.querySelector('.auth-submit');
  const textoOriginal = btnSubmit.textContent;
  btnSubmit.textContent = "CRIANDO CONTA...";
  btnSubmit.style.opacity = "0.7";

  try {
    // 2. Envia os dados para a nossa rota real no Node.js
    const resposta = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, sobrenome, email, whatsapp, perfil_uso, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      // 3. Sucesso! Salva a sessão no navegador (igual ao Login)
      isLoggedIn = true;
      localStorage.setItem('forge_token', dados.token);
      localStorage.setItem('forge_user', JSON.stringify(dados.usuario));

      // Atualiza o nome na interface
      const display = document.getElementById("client-name-display");
      if (display) display.textContent = dados.usuario.nome;
      
      updateNav();
      showToast("Conta FORGE criada com sucesso!");
      
      // Redireciona o usuário para o catálogo ou área do cliente
      showSection("vendas"); 
    } else {
      showToast(dados.message || "Erro ao criar conta.");
    }
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    showToast("Falha ao comunicar com o servidor. Tente novamente.");
  } finally {
    btnSubmit.textContent = textoOriginal;
    btnSubmit.style.opacity = "1";
  }
}

// =========================================================
// SEGURANÇA E CARRINHO (AUTH GUARD & LOGOUT)
// =========================================================

function doLogout() {
  // 1. Destrói as credenciais locais completamente
  isLoggedIn = false;
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  
  // 2. Opcional: Aqui você pode disparar um fetch() para o backend caso tenha controle de sessão via DB
  
  // 3. Atualiza a interface e expulsa da área VIP
  updateNav();
  showSection('vendas'); // Redireciona para o catálogo público
  
  // 4. Feedback elegante
  showToast('Desconectado com sucesso.', 'success');
}

function abrirCarrinho() {
  if (!isLoggedIn) {
    showToast('Faça login para acessar o carrinho.', 'error');
    showSection('cadastro'); // Redireciona para a tela de login
    return;
  }
  
  // Simulação de Carrinho do Cliente Logado (Pode levar para o Laboratório)
  showToast('Sincronizando seu carrinho FORGE...', 'success');
  showSection('cliente');
}

function adicionarAoCarrinho(idMaquina) {
  if (!isLoggedIn) {
    showToast('Faça login para adicionar itens ao carrinho.', 'error');
    showSection('cadastro'); // Redireciona para login e impede a adição
    return;
  }
  
  const pc = BANCO_DE_HARDWARE[idMaquina];
  if (pc) {
    showToast(`O projeto ${pc.name} foi adicionado ao carrinho!`, 'success');
    // Futura integração com o banco de dados (tabela de pedidos_carrinho) entra aqui.
  }
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  if(tab === 'login') {
    document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
    document.getElementById('form-login').classList.add('active');
  } else {
    document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
    document.getElementById('form-register').classList.add('active');
  }
}

// =========================================================
// 6. FUNÇÕES DO CONFIGURADOR (QUIZ)
// =========================================================
let qSelections = [null, null, null, null];

function selectOption(step, idx, val) {
  qSelections[step] = val;
  const opts = document.querySelectorAll('#qstep' + step + ' .quiz-option');
  opts.forEach((o, i) => o.classList.toggle('selected', i === idx));
  const btn = document.getElementById('qnext' + step);
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}

function nextStep(to) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep' + to).classList.add('active');
  document.getElementById('qd' + to).classList.add('done');
}

function prevStep(to) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep' + to).classList.add('active');
}

// O BOTÃO DE REFAZER AGORA FUNCIONA 100%
function resetQuiz() {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep0').classList.add('active');
  document.querySelectorAll('.quiz-dot').forEach((dot, index) => {
    if(index === 0) dot.classList.add('done'); else dot.classList.remove('done');
  });
  document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('[id^="qnext"]').forEach(btn => { btn.style.opacity = '0.3'; btn.style.pointerEvents = 'none'; });
  qSelections = [null, null, null, null];
  document.getElementById('configurador').scrollIntoView({ behavior: 'smooth' });
}

// =========================================================
// O CÉREBRO DO CONFIGURADOR: ALGORITMO DE SCORING
// =========================================================
function finalizarQuizComModelos() {
  document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
  const qresult = document.getElementById('qresult');
  if (qresult) qresult.classList.add('active');

  const uso = qSelections[0] || 'game';
  const budget = qSelections[1] || 'mid';
  const priority = qSelections[2] || 'balanced';

  // 1. Definir Range de Orçamento (Teto e Piso) com margem para Upsell
  let minPrice = 0, maxPrice = 999999;
  if (budget === 'low') { maxPrice = 8500; }
  else if (budget === 'mid') { minPrice = 7000; maxPrice = 16000; }
  else if (budget === 'high') { minPrice = 14000; maxPrice = 28000; }
  else if (budget === 'ultra') { minPrice = 24000; }

  let recomendacoes = [];

  // 2. Avaliar cada máquina do Banco de Hardware
  for (const [id, pc] of Object.entries(BANCO_DE_HARDWARE)) {
    const precoNum = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
    
    // Se a máquina estiver completamente fora da faixa de orçamento do cliente, ignora.
    if (precoNum < minPrice || precoNum > maxPrice) continue; 

    let score = 0;
    const badge = pc.badge.toLowerCase();
    const cpu = pc.specs.cpu.toLowerCase();
    const gpu = pc.specs.gpu.toLowerCase();
    const ram = pc.specs.ram.toLowerCase();

    // A. Pontuação de USO PRINCIPAL (Peso 50)
    if (uso === 'game' && badge.includes('gaming')) score += 50;
    if (uso === 'ia' && (badge.includes('titan') || badge.includes('workstation'))) score += 50;
    if (uso === '3d' && (badge.includes('workstation') || badge.includes('high-end'))) score += 50;
    if (uso === 'dev' && (badge.includes('dev') || badge.includes('office') || badge.includes('workstation'))) score += 50;

    // B. Pontuação de PRIORIDADE DE HARDWARE (Peso 30)
    if (priority === 'gpu' && (gpu.includes('4070') || gpu.includes('4080') || gpu.includes('4090') || gpu.includes('7900') || gpu.includes('7800'))) score += 30;
    if (priority === 'cpu' && (cpu.includes('i9') || cpu.includes('i7') || cpu.includes('ryzen 9') || cpu.includes('7800x3d'))) score += 30;
    if (priority === 'ram' && (ram.includes('64gb') || ram.includes('128gb') || ram.includes('192gb') || ram.includes('96gb'))) score += 30;
    if (priority === 'balanced') score += 15; // Bônus genérico de equilíbrio

    // Se fez algum sentido para o cliente, entra na lista de recomendações
    if (score > 0) {
        recomendacoes.push({ id, pc, score, precoNum });
    }
  }

  // 3. Ordenar as máquinas: Maior Score primeiro. Se der empate, sugere a mais barata dentro da faixa.
  recomendacoes.sort((a, b) => b.score - a.score || a.precoNum - b.precoNum);

  const topRecomendacao = recomendacoes[0];

  // 4. Injetar resultados reais na Interface
  const resultName = document.getElementById('result-name');
  const resultSub = document.getElementById('result-sub');
  const resultSpecs = document.getElementById('result-specs');
  const resultScores = document.getElementById('result-scores');
  const container = document.getElementById('quiz-builds-container');
  container.innerHTML = '';

  if (topRecomendacao) {
      const mainPc = topRecomendacao.pc;
      
      // Atualiza o painel principal com os dados do Top 1
      resultName.textContent = mainPc.name;
      
      const prioridadeTexto = priority === 'gpu' ? 'Máxima Performance Gráfica' : priority === 'cpu' ? 'Alto Poder de Processamento' : priority === 'ram' ? 'Alta Capacidade de Memória' : 'Equilíbrio Total';
      resultSub.textContent = `A máquina perfeita para o seu orçamento, focada em ${prioridadeTexto}.`;

      // Encurta nomes de CPU e GPU para ficar elegante no design
      const shortCpu = mainPc.specs.cpu.split(' ').slice(0, 4).join(' ');
      const shortGpu = mainPc.specs.gpu.split(' ').slice(0, 4).join(' ');

      resultSpecs.innerHTML = `
        <div class="spec-list-item"><strong>Processador</strong> <span>${shortCpu}</span></div>
        <div class="spec-list-item"><strong>Vídeo (GPU)</strong> <span>${shortGpu}</span></div>
        <div class="spec-list-item"><strong>Memória RAM</strong> <span>${mainPc.specs.ram.split(' ')[0]} DDR4/DDR5</span></div>
      `;
      
      resultScores.innerHTML = `
        <div class="score-item"><span class="score-val">${mainPc.benchmarks.cinebench.split(' ')[0]}</span><span class="score-lbl">Cinebench</span></div>
        <div class="score-item"><span class="score-val">${mainPc.benchmarks.temp.split(' ')[0]}</span><span class="score-lbl">Temp. Máx</span></div>
      `;

      // Muda a ação do botão principal para abrir O DASHBOARD DA MÁQUINA VENCEDORA
      const btnPrimary = document.querySelector('.result-actions .btn-primary');
      btnPrimary.setAttribute('onclick', `abrirDetalhesProduto('${topRecomendacao.id}')`);
      btnPrimary.textContent = 'VER DETALHES DESTA BUILD →';

      // Mostra as top 3 máquinas no carrossel de "Modelos Prontos Correspondentes"
      const top3 = recomendacoes.slice(0, 3);
      top3.forEach(item => {
          const p = item.pc;
          const isWhite = p.renderClass.includes('white') ? 'white-pc' : 'black-pc';
          const sGpu = p.specs.gpu.split(' ').slice(0, 3).join(' ').replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
          const sCpu = p.specs.cpu.split(' ').slice(0, 3).join(' ').replace('Intel Core ', '');

          const cardHTML = `
            <div class="build-card reveal-element is-visible" onclick="abrirDetalhesProduto('${item.id}')" style="display:flex; flex-direction:column; height: 100%;">
              <div class="build-card-img ${isWhite}" style="height:250px;">
                <span class="build-badge">${p.badge}</span>
                <div class="blueprint-lines"></div>
                <img src="${p.img}" class="pc-photo" alt="${p.name}">
              </div>
              <div class="build-card-body" style="flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="build-meta-specs">${sGpu} • ${sCpu}</div>
                  <div class="build-name" style="font-size: 18px; margin: 4px 0;">${p.name}</div>
                </div>
                <div class="build-price-row" style="margin-top: 15px;">
                  <div class="build-price" style="font-size: 18px; color: var(--color-blue);">${p.price}</div>
                  <span style="font-size: 11px; font-family: var(--font-mono); color: var(--color-gray); text-transform:uppercase;">Ver Detalhes →</span>
                </div>
              </div>
            </div>
          `;
          container.innerHTML += cardHTML;
      });
  } else {
      // Se não encontrou nenhuma máquina que bata (cenário muito específico de orçamento vs exigência)
      resultName.textContent = "Projeto Sob Medida";
      resultSub.textContent = "Seu perfil de uso e investimento exigem a análise dedicada de um engenheiro Forge.";
      resultSpecs.innerHTML = `<p style="color:var(--color-gray);font-size:14px; margin-top: 10px;">Não localizamos um modelo de prateleira exato, mas nossa especialidade é montar soluções exclusivas para você.</p>`;
      resultScores.innerHTML = '';
      container.innerHTML = `<p style="color: var(--color-gray); font-size: 14px; grid-column: 1/-1;">Recomendamos utilizar o botão abaixo para falar com um especialista e desenhar seu projeto.</p>`;
      document.querySelector('.result-actions .btn-primary').setAttribute('onclick', `showSection('consultoria')`);
      document.querySelector('.result-actions .btn-primary').textContent = 'FALAR COM ESPECIALISTA';
  }
}
// =========================================================
// 7. CONTROLE DO COMPARADOR DE WORKSTATIONS (FORGE LAB)
// =========================================================
function montarSeletoresComparador() {
  const selectA = document.getElementById('compare-pc-a');
  const selectB = document.getElementById('compare-pc-b');
  if (!selectA || !selectB) return;

  selectA.innerHTML = '';
  selectB.innerHTML = '';

  // Cria a lista dinamicamente baseada em todas as máquinas cadastradas no Banco de Hardware
  Object.keys(BANCO_DE_HARDWARE).forEach((key, index) => {
    const optA = document.createElement('option');
    optA.value = key;
    optA.textContent = BANCO_DE_HARDWARE[key].name;
    // Pré-seleciona o primeiro item da lista na Caixa A
    if(index === 0) optA.selected = true; 
    selectA.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = key;
    optB.textContent = BANCO_DE_HARDWARE[key].name;
    // Pré-seleciona a última máquina (geralmente a mais parruda) na Caixa B para dar impacto visual inicial
    if(index === Object.keys(BANCO_DE_HARDWARE).length - 1) optB.selected = true;
    selectB.appendChild(optB);
  });

  executarComparacao();
}

function executarComparacao() {
  const idA = document.getElementById('compare-pc-a').value;
  const idB = document.getElementById('compare-pc-b').value;
  
  const pcA = BANCO_DE_HARDWARE[idA];
  const pcB = BANCO_DE_HARDWARE[idB];
  if (!pcA || !pcB) return;

  // Atualiza os nomes nos rótulos das barras de renderização
  document.getElementById('bar-name-a-cine').textContent = pcA.name;
  document.getElementById('bar-name-b-cine').textContent = pcB.name;
  document.getElementById('bar-name-a-3dm').textContent = pcA.name;
  document.getElementById('bar-name-b-3dm').textContent = pcB.name;
  document.getElementById('bar-name-a-fps').textContent = pcA.name;
  document.getElementById('bar-name-b-fps').textContent = pcB.name;

  // Extrai apenas os números das strings do banco de dados para calcular as proporções das barras
  // (Trata os cenários de 'N/A' transformando-os em zero para não quebrar o layout)
  const numA_cine = parseInt(pcA.benchmarks.cinebench.replace(/\D/g, '')) || 0;
  const numB_cine = parseInt(pcB.benchmarks.cinebench.replace(/\D/g, '')) || 0;
  const numA_3dm = parseInt(pcA.benchmarks.timespy.replace(/\D/g, '')) || 0;
  const numB_3dm = parseInt(pcB.benchmarks.timespy.replace(/\D/g, '')) || 0;
  const numA_fps = parseInt(pcA.benchmarks.fps.replace(/\D/g, '')) || 0;
  const numB_fps = parseInt(pcB.benchmarks.fps.replace(/\D/g, '')) || 0;

  // Exibe os valores textuais brutos nas pontas das barras
  document.getElementById('bar-val-a-cine').textContent = pcA.benchmarks.cinebench;
  document.getElementById('bar-val-b-cine').textContent = pcB.benchmarks.cinebench;
  document.getElementById('bar-val-a-3dm').textContent = pcA.benchmarks.timespy;
  document.getElementById('bar-val-b-3dm').textContent = pcB.benchmarks.timespy;
  document.getElementById('bar-val-a-fps').textContent = pcA.benchmarks.fps;
  document.getElementById('bar-val-b-fps').textContent = pcB.benchmarks.timespy === 'N/A' || pcB.benchmarks.fps === 'N/A' ? 'N/A' : pcB.benchmarks.fps;

  // Define a escala proporcional das larguras das barras baseando-se no maior valor do par selecionado
  const maxCine = Math.max(numA_cine, numB_cine, 1);
  const max3dm = Math.max(numA_3dm, numB_3dm, 1);
  const maxFps = Math.max(numA_fps, numB_fps, 1);

  document.getElementById('bar-fill-a-cine').style.width = ((numA_cine / maxCine) * 100) + '%';
  document.getElementById('bar-fill-b-cine').style.width = ((numB_cine / maxCine) * 100) + '%';
  document.getElementById('bar-fill-a-3dm').style.width = ((numA_3dm / max3dm) * 100) + '%';
  document.getElementById('bar-fill-b-3dm').style.width = ((numB_3dm / max3dm) * 100) + '%';
  
  document.getElementById('bar-fill-a-fps').style.width = numA_fps === 0 ? '0%' : ((numA_fps / maxFps) * 100) + '%';
  document.getElementById('bar-fill-b-fps').style.width = numB_fps === 0 ? '0%' : ((numB_fps / maxFps) * 100) + '%';

  // Lógica Inteligente do Veredito (Comunicação de Consultoria / Honestidade da marca)
  const txtVerdict = document.getElementById('verdict-text-display');
  if(idA === idB) {
    txtVerdict.innerHTML = `Você está comparando a mesma máquina. Escolha modelos diferentes para avaliar o ganho real de desempenho por workload técnico.`;
  } else {
    // Calcula qual máquina rende mais no teste multicore (Workstation / Render)
    const vencedorCine = numA_cine > numB_cine ? pcA : pcB;
    const perdedorCine = numA_cine > numB_cine ? pcB : pcA;
    const diferenca = Math.abs(numA_cine - numB_cine);
    const ganhoPercentual = Math.round((diferenca / (Math.min(numA_cine, numB_cine) || 1)) * 100);

    let vereditoHTML = `A configuração <strong>${vencedorCine.name}</strong> apresenta um rendimento bruto de processamento computacional superior à <strong>${perdedorCine.name}</strong>. `;
    
    if(ganhoPercentual > 0) {
      vereditoHTML += `Isso resulta em uma aceleração estimada de até <strong>${ganhoPercentual}% mais velocidade</strong> em tarefas pesadas de renderização multicore local (como Blender e Cinema 4D). `;
    }

    // Se uma delas for uma Workstation pesada (como as Titan) e a outra for de Office, dá um conselho honesto contra desperdício
    if(vencedorCine.badge.includes('TITAN') && perdedorCine.badge.includes('OFFICE')) {
      vereditoHTML += `<br><br>✦ <em>Nota Técnica Forge:</em> Lembre-se do nosso pilar de precisão. Se o seu fluxo de trabalho envolve apenas tarefas administrativas, planilhas pesadas ou desenvolvimento leve, o investimento na linha Titan é superdimensionado e desnecessário. A linha Office atenderá sua demanda perfeitamente, sem desperdício de capital técnico.`;
    } else {
      vereditoHTML += `<br><br>✦ Avalie qual dessas opções se adequa melhor ao teto de investimento do seu projeto ou empresa. Se precisar de uma simulação personalizada de ganho em softwares de engenharia (CAD/BIM) ou Data Science, agende um horário na aba Consultoria.`;
    }
    
    txtVerdict.innerHTML = vereditoHTML;
  }
}

// =========================================================
// 8. EFEITOS INTERATIVOS GLOBAIS (RASTRO DO MOUSE)
// =========================================================
function inicializarRastroMouse() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// =========================================================
// 9. EFEITO DE REVEAL NO SCROLL (INTERSECTION OBSERVER)
// =========================================================
function inicializarScrollReveal() {
  // Configura o "Olheiro" do navegador
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      // Se o elemento entrou na tela...
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // Para de observar para a animação rodar só 1 vez
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Dispara a animação um pouquinho antes de aparecer totalmente
    threshold: 0.1 
  });

  // Lista mágica: Seleciona todos os blocos importantes do site automaticamente
  const seletoresParaAnimar = [
    '.sec-header', 
    '.build-card', 
    '.consul-card', 
    '.client-card', 
    '.compare-metric-card', 
    '.telemetria-card', 
    '.auth-wrap', 
    '.schedule-form',
    '.bench-table'
  ];

  // Aplica a classe invisível e manda o Olheiro vigiar cada um deles
  const elementos = document.querySelectorAll(seletoresParaAnimar.join(', '));
  elementos.forEach((el, index) => {
    el.classList.add('reveal-element');
    
    // Cria um efeito "cascata" (delay) se houver vários elementos juntos (como na grade de PCs)
    // Isso faz eles subirem um após o outro, como uma onda!
    el.style.animationDelay = `${(index % 4) * 0.1}s`; 
    
    observer.observe(el);
  });
}

async function carregarCatalogoDoBanco() {
  try {
    const resposta = await fetch('/api/catalogo');
    const dados = await resposta.json();

    if (resposta.ok && dados.builds) {
      BANCO_DE_HARDWARE = {}; // Reseta o objeto local

      dados.builds.forEach(row => {
        // Trata os campos de formato JSON caso o driver os entregue como string
        const specsObj = typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs;
        const benchmarksObj = typeof row.benchmarks === 'string' ? JSON.parse(row.benchmarks) : row.benchmarks;

        // Mapeia os dados do MySQL de volta para a estrutura camelCase original do front-end
        BANCO_DE_HARDWARE[row.id] = {
          name: row.nome,
          price: row.preco,
          badge: row.badge,
          renderClass: row.render_class,
          img: row.img,
          tagline: row.tagline,
          specs: specsObj,
          benchmarks: benchmarksObj,
          estoque: row.estoque !== undefined ? row.estoque : 15 // LÊ O ESTOQUE DO BANCO
        };
      });
      console.log("✅ Catálogo sincronizado com o MySQL com sucesso:", BANCO_DE_HARDWARE);
    }
  } catch (erro) {
    console.error("❌ Erro ao sincronizar catálogo do banco de dados:", erro);
  }
}

const originalUpdateNav = updateNav;
window.updateNav = function() {
  originalUpdateNav();
  const navCart = document.getElementById('nav-cart-btn');
  if (isLoggedIn) {
    if (navCart) navCart.style.display = 'flex';
    atualizarBadgeCarrinho();
  } else {
    if (navCart) navCart.style.display = 'none';
  }
};

function adicionarAoCarrinho(idMaquina) {
  if (!isLoggedIn) {
    showToast('Faça login ou crie sua conta para adicionar projetos ao carrinho.', 'error');
    showSection('cadastro');
    return;
  }
  
  const pc = BANCO_DE_HARDWARE[idMaquina];
  if (pc) {
    let carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
    carrinho.push(idMaquina);
    localStorage.setItem('forge_cart', JSON.stringify(carrinho));
    
    atualizarBadgeCarrinho();
    showToast(`${pc.name} foi adicionado ao seu carrinho!`, 'success');
  }
}

function abrirCarrinho() {
  if (!isLoggedIn) {
    showToast('Acesso restrito. Faça login.', 'error');
    return;
  }
  renderizarCarrinho();
  showSection('carrinho');
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  carrinho.splice(index, 1);
  localStorage.setItem('forge_cart', JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  if (carrinho.length > 0) {
    badge.textContent = carrinho.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const subtotalText = document.getElementById('carrinho-subtotal');
  const totalText = document.getElementById('carrinho-total');
  if (!lista) return;

  const carrinho = JSON.parse(localStorage.getItem('forge_cart') || '[]');
  let html = '';
  let somaTotal = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <div style="background: var(--color-iron); padding: 40px; text-align: center; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
        <p style="color: var(--color-gray);">Seu carrinho está vazio.</p>
        <button class="btn-ghost" style="margin-top: 15px;" onclick="showSection('vendas')">Ir para o Catálogo</button>
      </div>`;
    subtotalText.textContent = 'R$ 0,00';
    totalText.textContent = 'R$ 0,00';
    return;
  }

  carrinho.forEach((id, index) => {
    const pc = BANCO_DE_HARDWARE[id];
    if (pc) {
      const precoNum = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
      somaTotal += precoNum;
      html += `
        <div style="display: flex; gap: 20px; background: var(--color-iron); padding: 20px; border-radius: 8px; border: 1px solid rgba(42,132,208,0.2); align-items: center;">
          <div style="width: 80px; height: 80px; background: var(--color-void); padding: 10px; border-radius: 4px;">
            <img src="${pc.img}" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
          <div style="flex: 1;">
            <div style="font-family: var(--font-display); font-size: 20px; color: var(--color-ash); text-transform: uppercase;">${pc.name}</div>
            <div style="font-size: 18px; font-weight: bold; color: var(--color-blue);">${pc.price}</div>
          </div>
          <button class="btn-ghost" style="padding: 8px 12px; font-size: 10px; border-color: rgba(255,95,87,0.3); color: #ff5f57;" onclick="removerDoCarrinho(${index})">REMOVER</button>
        </div>
      `;
    }
  });

  lista.innerHTML = html;
  const formatoMoeda = somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  subtotalText.textContent = formatoMoeda;
  totalText.textContent = formatoMoeda;
}

const LAB_MOCK_PEDIDOS = [
  {
    id:       'PDV-2025-0094',
    maquina:  'FORGE W-2: Studio',
    badge:    'WORKSTATION',
    data:     '2025-06-28',
    status:   'montagem',   // montagem | enviado | entregue | cancelado
    etapas: [
      { label: 'Pedido confirmado',  done: true  },
      { label: 'Sourcing de peças', done: true  },
      { label: 'Em montagem',       done: true  },
      { label: 'Testes de estresse',done: false },
      { label: 'Enviado',           done: false },
    ],
  },
  {
    id:       'PDV-2025-0071',
    maquina:  'FORGE G-9: Aurora',
    badge:    'GAMING WHITE',
    data:     '2025-05-10',
    status:   'entregue',
    etapas: [
      { label: 'Pedido confirmado',  done: true },
      { label: 'Sourcing de peças', done: true },
      { label: 'Em montagem',       done: true },
      { label: 'Testes de estresse',done: true },
      { label: 'Enviado',           done: true },
    ],
  },
];
 
const LAB_MOCK_TICKETS = [
  {
    id:       'TKT-1024',
    titulo:   'Temperatura da CPU acima do esperado durante render',
    status:   'em_analise',
    data:     '2025-07-01',
    engenheiro: 'Carlos M.',
    msg:      'Laudo térmico em análise. Retorno em até 24h úteis.',
  },
  {
    id:       'TKT-0998',
    titulo:   'Expansão de RAM — compatibilidade de kit DDR5',
    status:   'resolvido',
    data:     '2025-06-18',
    engenheiro: 'Ana P.',
    msg:      'Kit DDR5-6000 CL30 confirmado compatível com sua placa-mãe.',
  },
];
 
const LAB_STATUS_MAP = {
  em_analise: { label: 'Em Análise',  cor: 'amber' },
  aberto:     { label: 'Aberto',      cor: 'blue'  },
  resolvido:  { label: 'Resolvido',   cor: 'green' },
  fechado:    { label: 'Fechado',     cor: 'dim'   },
  montagem:   { label: 'Em montagem', cor: 'blue'  },
  enviado:    { label: 'Enviado',     cor: 'amber' },
  entregue:   { label: 'Entregue',    cor: 'green' },
  cancelado:  { label: 'Cancelado',   cor: 'red'   },
};
 
// ─────────────────────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * renderDashboardVIP(usuario)
 * Injeta o HTML completo do dashboard na <section id="cliente">.
 * A seção já existe no HTML; aqui apenas populamos o conteúdo.
 *
 * @param {Object} usuario  { id, nome, email, perfil_uso }
 */
// =============================================================================
// RENDERIZAÇÃO DO DASHBOARD VIP (COM SISTEMA DE ABAS)
// =============================================================================

function renderDashboardVIP(usuario) {
  const container = document.getElementById('cliente');
  if (!container) return;
 
  const nome         = usuario.nome || 'Usuário';
  const primeiroNome = nome.split(' ')[0];
  const initials     = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const perfil       = usuario.perfil_uso || 'Entusiasta';
  const savedIds     = JSON.parse(localStorage.getItem('forge_saved_builds') || '[]');
  const carritoIds   = JSON.parse(localStorage.getItem('forge_cart') || '[]');
 
  container.innerHTML = `
    <div class="lab">
 
      <header class="lab__header">
        <div class="lab__header-left">
          <div class="lab__avatar" aria-hidden="true">${initials}</div>
          <div class="lab__header-info">
            <p class="lab__eyebrow">Dashboard</p>
            <h1 class="lab__title">Bem-vindo, <span class="lab__title-accent">${primeiroNome}</span></h1>
            <div class="lab__meta-row">
              <span class="lab__badge lab__badge--profile">${perfil}</span>
              </div>
          </div>
        </div>
 
      </header>

      <nav class="lab-tabs-nav">
        <button class="lab-tab-btn active" onclick="trocarAbaLab('visao-geral', this)">VISÃO GERAL</button>
        <button class="lab-tab-btn" onclick="trocarAbaLab('minhas-builds', this)">MINHAS BUILDS</button>
        <button class="lab-tab-btn" onclick="trocarAbaLab('meus-pedidos', this)">MEUS PEDIDOS</button>
      </nav>
 
      <div class="lab-content-area">

        <div id="aba-visao-geral" class="lab-tab-pane active">
          <div class="lab__grid">
            <div class="lab__col-main">
              ${typeof _htmlModuloSetup === 'function' ? _htmlModuloSetup() : ''}
              ${typeof _htmlModuloPedidos === 'function' ? _htmlModuloPedidos() : ''}
            </div>
            <aside class="lab__col-sidebar">
              ${typeof _htmlModuloChamados === 'function' ? _htmlModuloChamados() : ''}
              ${typeof _htmlModuloWishlist === 'function' ? _htmlModuloWishlist(savedIds) : ''}
              ${typeof _htmlModuloNavRapida === 'function' ? _htmlModuloNavRapida() : ''}
            </aside>
          </div>
        </div>

        <div id="aba-minhas-builds" class="lab-tab-pane" style="display: none;">
          <div class="lab-panel-blank" style="padding: 60px 20px; text-align: center; background: var(--color-iron); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">
            <h3 style="font-family: var(--font-display); font-size: 24px; color: var(--color-ash); margin-bottom: 10px; text-transform: uppercase;">Garagem FORGE</h3>
            <p style="color: var(--color-gray); font-size: 15px;">Aqui ficarão exibidas todas as Workstations que você adquiriu ou montou no configurador.</p>
          </div>
        </div>

      </div></div>`;
 
  if (typeof _initLabListeners === 'function') _initLabListeners();
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÃO PARA ALTERNAR AS ABAS DO LABORATÓRIO SEM RECARREGAR A PÁGINA
// ─────────────────────────────────────────────────────────────────────────────
window.trocarAbaLab = function(idAba, botaoClicado) {
  // 1. Remove a classe 'active' de todos os botões
  document.querySelectorAll('.lab-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // 2. Oculta todos os painéis de conteúdo
  document.querySelectorAll('.lab-tab-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });

  // 3. Ativa o botão que foi clicado
  botaoClicado.classList.add('active');
  
  // 4. Mostra o painel correspondente ao botão
  const painel = document.getElementById('aba-' + idAba);
  if (painel) {
    painel.classList.add('active');
    painel.style.display = 'block';
    
    // Pequena animação de fade-in para elegância
    painel.style.animation = 'fadeIn 0.3s ease-out forwards';
  }
};
 
// =============================================================================
// MÓDULOS DE MARKETING E VENDAS (VISÃO GERAL DO DASHBOARD)
// =============================================================================

function _htmlModuloSetup() {
  // 1. CÁLCULO DINÂMICO DE PATENTES (SILVER, GOLD, TITÃ)
  const pedidos = typeof LAB_MOCK_PEDIDOS !== 'undefined' ? LAB_MOCK_PEDIDOS : [];
  const totalMaquinas = pedidos.length;

  let patenteNome = "SILVER";
  let metaDoNivel = 5;
  let baseDoNivel = 0;

  if (totalMaquinas >= 10) {
    patenteNome = "TITÃ";
    metaDoNivel = totalMaquinas;
    baseDoNivel = 10;
  } else if (totalMaquinas >= 5) {
    patenteNome = "GOLD";
    metaDoNivel = 10;
    baseDoNivel = 5;
  }

  let pctBarrinha = 0;
  if (totalMaquinas >= 10) {
    pctBarrinha = 100;
  } else {
    pctBarrinha = ((totalMaquinas - baseDoNivel) / (metaDoNivel - baseDoNivel)) * 100;
  }

  const eliteTiersHTML = `
    <div class="lab-marketing-card" style="background: var(--color-iron); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 25px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -30px; right: 10%; width: 150px; height: 150px; background: var(--color-blue); filter: blur(80px); opacity: 0.1; pointer-events: none;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px; position: relative; z-index: 2;">
        <div>
          <div style="font-family: var(--font-mono); color: var(--color-gray); font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Patente de Hardware</div>
          <h3 style="font-family: var(--font-display); font-size: 24px; color: var(--color-ash); margin-top: 5px;">Membro <span style="color: var(--color-blue); text-shadow: 0 0 12px rgba(42, 132, 208, 0.4); text-transform: uppercase;">${patenteNome}</span></h3>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-display); color: var(--color-ash); font-size: 22px; font-weight: bold; letter-spacing: 1px;">${totalMaquinas}</div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">${totalMaquinas === 1 ? 'Máquina Adquirida' : 'Máquinas Adquiridas'}</div>
        </div>
      </div>
      <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden; position: relative; z-index: 2; border: 1px solid rgba(255,255,255,0.02);">
        <div style="width: ${pctBarrinha}%; height: 100%; background: linear-gradient(90deg, #0d1b2a, var(--color-blue)); box-shadow: 0 0 10px rgba(42, 132, 208, 0.8); border-radius: 3px; transition: width 0.5s ease-in-out;"></div>
      </div>
    </div>
  `;

  // 2. SEÇÃO VISUAL DE ACOMPANHAMENTO DE CHAMADOS (Apresentação interativa local)
  const chamadosLista = window.LAB_MOCK_CHAMADOS || [];
  let chamadosContentHTML = '';

  if (chamadosLista.length === 0) {
    chamadosContentHTML = `
      <div style="text-align: center; padding: 25px 20px; background: rgba(0,0,0,0.15); border: 1px dashed rgba(42, 132, 208, 0.15); border-radius: 6px;">
        <p style="color: var(--color-gray); font-size: 13px; margin-bottom: 12px; line-height: 1.5;">Você não possui nenhum chamado ou ordem técnica em andamento no momento.</p>
        <button class="btn-ghost" style="font-size: 11px; padding: 8px 18px; border-color: var(--color-blue); color: var(--color-blue); font-weight: bold;" onclick="showSection('consultoria')">
          ABRIR CHAMADO TÉCNICO
        </button>
      </div>
    `;
  } else {
    chamadosLista.forEach(ch => {
      const passos = ["Triagem", "Análise", "Bancada", "Pronto"];
      let passosHTML = '';

      passos.forEach((nomePasso, index) => {
        const numPasso = index + 1;
        const isActive = numPasso <= ch.passoAtual;
        const isCurrent = numPasso === ch.passoAtual;
        
        let bolaCor = "rgba(255,255,255,0.1)";
        let textoCor = "var(--color-gray)";
        let glow = "";

        if (isActive) {
          bolaCor = "var(--color-blue)";
          textoCor = "var(--color-ash)";
        }
        if (isCurrent) {
          bolaCor = "#ffbd2e"; // Amarelo indica a fase atual em tempo real
          glow = "box-shadow: 0 0 10px #ffbd2e;";
        }

        passosHTML += `
          <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${bolaCor}; ${glow} z-index: 3; transition: all 0.3s;"></div>
            <span style="font-family: var(--font-mono); font-size: 9px; color: ${textoCor}; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${nomePasso}</span>
          </div>
        `;
      });

      // Monta o card técnico removendo o nome do técnico do cabeçalho
      chamadosContentHTML += `
        <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 10px;">
            <div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); letter-spacing: 1px;">ID: ${ch.id} • REGISTRO: ${ch.data}</span>
              <h4 style="font-family: var(--font-display); font-size: 16px; color: var(--color-ash); margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.5px;">${ch.assunto}</h4>
            </div>
          </div>
          
          <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 20px;">
            <div style="position: absolute; top: 5px; left: 35px; right: 35px; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
            <div style="position: absolute; top: 5px; left: 35px; width: ${((ch.passoAtual - 1) / 3) * 85}%; height: 2px; background: var(--color-blue); z-index: 2; transition: width 0.5s;"></div>
            ${passosHTML}
          </div>
        </div>
      `;
    });
  }

  const bannerChamadosHTML = `
    <div class="lab-marketing-card" style="background: var(--color-iron); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 25px; margin-bottom: 25px;">
      <div style="font-family: var(--font-mono); color: var(--color-blue); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 15px;">Rastreamento de Ordem Técnica</div>
      ${chamadosContentHTML}
    </div>
  `;

  // 3. BANNER: CONFIGURADOR FORGE
  const bannerConfiguradorHTML = `
    <div class="lab-marketing-card" style="background: linear-gradient(135deg, var(--color-iron) 0%, #0a1118 100%); border: 1px solid rgba(42, 132, 208, 0.2); border-radius: 8px; padding: 35px 30px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: var(--color-blue); filter: blur(100px); opacity: 0.12; border-radius: 50%; pointer-events: none;"></div>
      <div style="position: relative; z-index: 2;">
        <div style="font-family: var(--font-mono); color: var(--color-blue); font-size: 11px; letter-spacing: 2px; margin-bottom: 10px;">FORJE SEU SETUP</div>
        <h3 style="font-family: var(--font-display); font-size: 28px; color: var(--color-ash); text-transform: uppercase; margin-bottom: 12px; line-height: 1.1;">Configurador FORGE</h3>
        <p style="color: var(--color-gray); font-size: 14px; margin-bottom: 24px; line-height: 1.6; max-width: 780px;">Monte a sua próxima Workstation com a FORGE. Use nosso configurador para garantir a compatibilidade de componentes automatizada, balanceamento de energia e arquitetura sob medida para o seu fluxo de trabalho.</p>
        <button class="btn-ghost" style="border-color: var(--color-blue); color: var(--color-blue); padding: 10px 22px; font-size: 12px;" onclick="showSection('configurador')">
          INICIAR NOVO PROJETO
        </button>
      </div>
    </div>
  `;

  // 4. BANNER: FORGE CORE SOFTWARE
  const bannerCoreHTML = `
    <div class="lab-marketing-card" style="background: linear-gradient(135deg, var(--color-iron) 0%, #0d1b2a 100%); border: 1px solid var(--color-blue-dim); border-radius: 8px; padding: 30px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: var(--color-blue); filter: blur(100px); opacity: 0.3; border-radius: 50%; pointer-events: none;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; flex-wrap: wrap; gap: 20px;">
        <div style="max-width: 60%; min-width: 280px;">
          <div style="font-family: var(--font-mono); color: var(--color-blue); font-size: 11px; letter-spacing: 2px; margin-bottom: 10px;">SOFTWARE EXCLUSIVO</div>
          <h3 style="font-family: var(--font-display); font-size: 28px; color: var(--color-ash); text-transform: uppercase; margin-bottom: 10px; line-height: 1.1;">FORGE Core</h3>
          <p style="color: var(--color-gray); font-size: 14px; margin-bottom: 20px; line-height: 1.5;">Monitore sua maquina com a FORGE. Experimente nosso novo sistema de telemetria em tempo real, overclock seguro e controle térmico inteligente em um único painel.</p>
          <button class="btn-ghost" style="border-color: var(--color-blue); color: var(--color-blue); padding: 10px 20px; font-size: 12px;" onclick="showSection('software')">
            CONHEÇA O SOFTWARE
          </button>
        </div>
        <div style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center;">
          <svg width="100" height="110" viewBox="0 0 56 66" fill="none" stroke="var(--color-blue)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 12px rgba(42, 132, 208, 0.8)); transform: scale(1.1);">
            <polygon points="28,3 51,16 51,50 28,63 5,50 5,16" />
            <path d="M17 14 H 39 V 23 H 25 V 30 H 35 V 38 H 25 V 45 H 17 Z" />
          </svg>
        </div>
      </div>
    </div>
  `;

  return eliteTiersHTML + bannerChamadosHTML + bannerConfiguradorHTML + bannerCoreHTML;
}

function _htmlModuloWishlist(savedIds) {
  // Ocultado na Visão Geral para focar em vendas (retorna vazio para limpar o erro no console)
  return ``;
}

function _htmlModuloNavRapida() {
  // Substituímos o selo estático por uma Vitrine Dinâmica de Impulso (Carrossel)
  return `
    <div style="background: var(--color-void); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; display: flex; flex-direction: column; min-height: 260px;">
      
      <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2);">
        <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase; letter-spacing: 1px;">Destaques da FORGE</span>
        <span style="display: flex; gap: 5px;" id="mini-carousel-dots"></span>
      </div>

      <div id="mini-carousel-content" style="flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.4s ease-in-out; position: relative;">
        </div>
      
    </div>
  `;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA DO ANALISADOR DE GARGALO
// ─────────────────────────────────────────────────────────────────────────────
 
function labAnalisarSetup() {
  const cpu = document.getElementById('lab-cpu')?.value.trim();
  const gpu = document.getElementById('lab-gpu')?.value.trim();
  const uso = document.getElementById('lab-uso')?.value || 'gaming';
 
  if (!cpu || !gpu) {
    showToast('Preencha CPU e GPU para a análise.', 'error');
    return;
  }
 
  const btn = document.getElementById('lab-btn-analisar');
  if (btn) { btn.textContent = 'Analisando...'; btn.disabled = true; }
 
  setTimeout(() => {
    const resultado = document.getElementById('lab-setup-resultado');
    const barFill   = document.getElementById('lab-bar-fill');
    const barAria   = document.getElementById('lab-bar-aria');
    const pctEl     = document.getElementById('lab-gargalo-pct');
    const descEl    = document.getElementById('lab-resultado-texto');
    const nivelEl   = document.getElementById('lab-nivel-badge');
 
    if (!resultado) return;
 
    const pct = Math.floor(Math.random() * 32) + 18; // 18–50%
    let cor, nivel, mensagem;
 
    const usoLabel = { gaming:'Gaming',  '3d':'Render 3D', dev:'Desenvolvimento',
                       ia:'IA / Data Science', office:'Office' }[uso] || uso;
 
    if (pct > 38) {
      cor = 'var(--lab-color-red, #ff5f57)'; nivel = 'CRÍTICO';
      mensagem = `Sua <strong>${gpu}</strong> é o limitador do sistema.
        Em workloads de ${usoLabel} você perde até <strong>${pct}% de performance</strong>
        por bottleneck de GPU. Upgrade recomendado imediatamente.`;
    } else if (pct > 24) {
      cor = 'var(--lab-color-amber, #ffbd2e)'; nivel = 'MODERADO';
      mensagem = `Setup desbalanceado. Um upgrade pontual na GPU pode destravar o
        potencial do <strong>${cpu}</strong> sem trocar a máquina inteira.
        Ganho estimado: <strong>${pct}% em ${usoLabel}</strong>.`;
    } else {
      cor = 'var(--lab-color-green, #00a650)'; nivel = 'BALANCEADO';
      mensagem = `Seu setup está equilibrado para ${usoLabel}.
        O ganho de um upgrade agora seria apenas <strong>${pct}%</strong>.
        Considere aguardar a próxima geração para melhor custo-benefício.`;
    }
 
    // Reset da barra antes de animar
    barFill.style.width      = '0%';
    barFill.style.background = cor;
    barFill.style.boxShadow  = `0 0 14px ${cor.includes('ff5f') ? 'rgba(255,95,87,.5)' : cor.includes('ffbd') ? 'rgba(255,189,46,.5)' : 'rgba(0,166,80,.5)'}`;
    if (barAria) barAria.setAttribute('aria-valuenow', pct);
 
    resultado.hidden  = false;
    pctEl.textContent = `${pct}%`;
    pctEl.style.color = cor;
    nivelEl.textContent  = nivel;
    nivelEl.dataset.nivel = nivel.toLowerCase();
    descEl.innerHTML  = mensagem;
 
    // Anima após 2 frames para garantir transição CSS
    requestAnimationFrame(() => requestAnimationFrame(() => {
      barFill.style.width = `${pct}%`;
    }));
 
    showToast('Diagnóstico concluído.', 'success');
    if (btn) { btn.textContent = 'Reanalisar'; btn.disabled = false; }
  }, 1100);
}
 
// ─────────────────────────────────────────────────────────────────────────────
// AÇÕES DE SUPORTE E WISHLIST
// ─────────────────────────────────────────────────────────────────────────────
 
function labAbrirNovoChamado() {
  showToast('Painel de novo chamado em breve!', 'success');
}
 
function labRemoverWishlist(id, btn) {
  let saved = JSON.parse(localStorage.getItem('forge_saved_builds') || '[]');
  saved = saved.filter(i => i !== id);
  localStorage.setItem('forge_saved_builds', JSON.stringify(saved));
 
  const item = btn?.closest('.lab-wishlist__item');
  if (item) {
    item.style.transition = 'opacity .3s, transform .3s';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(16px)';
    setTimeout(() => item.remove(), 320);
  }
  showToast('Projeto removido dos favoritos.', 'success');
}
 
function labLogout() {
  isLoggedIn = false;
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  if (typeof updateNav === 'function') updateNav();
  showToast('Sessão encerrada com segurança.', 'success');
  showSection('hero');
}
 
// ─────────────────────────────────────────────────────────────────────────────
// INIT LISTENERS
// ─────────────────────────────────────────────────────────────────────────────
 
function _initLabListeners() {
  // Enter nos campos do setup dispara análise
  ['lab-cpu', 'lab-gpu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') labAnalisarSetup(); });
  });

  iniciarCarrosselMini(); // Inicia o carrossel de vendas do dashboard
}
 
// ─────────────────────────────────────────────────────────────────────────────
// SOBRESCREVE carregarDashboardDoCliente() conectando ao Back-end Seguro
// ─────────────────────────────────────────────────────────────────────────────
window.carregarDashboardDoCliente = async function() {
  const token = localStorage.getItem('forge_token');
  
  if (!token) {
    console.warn('[FORGE Lab] Sem token. Abortando carregamento.');
    return;
  }

  try {
    // 1. Busca os dados do perfil do cliente
    const resposta = await fetch('/api/cliente/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      console.warn('[FORGE Lab] Token inválido ou expirado.');
      doLogout(); 
      return;
    }

    const dados = await resposta.json();
    
    // 2. INTEGRAÇÃO REAL: Busca os chamados deste cliente salvos no MySQL do Railway
    try {
      const resChamados = await fetch('/api/cliente/chamados', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (resChamados.ok) {
        const chamadosBanco = await resChamados.json();
        
        // Mapeia o status textual do banco para as etapas visuais da timeline
        window.LAB_MOCK_CHAMADOS = chamadosBanco.map(ch => {
          let passo = 1; // Padrão: 'ABERTO' -> Triagem (bolinha 1)
          if (ch.status === 'EM_ATENDIMENTO') passo = 2; // 'EM_ATENDIMENTO' -> Análise (bolinha 2)
          if (ch.status === 'RESOLVIDO' || ch.status === 'CONCLUIDO') passo = 4; // 'RESOLVIDO' -> Pronto (bolinha 4)
          
          return {
            id: ch.ticket_id || ('FRG-CH-' + ch.id),
            assunto: ch.assunto,
            data: ch.data_criacao ? new Date(ch.data_criacao).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
            passoAtual: passo
          };
        });
      }
    } catch (errChamados) {
      console.error("[FORGE Lab] Falha ao ler os chamados do MySQL:", errChamados);
    }
    
    // 3. Renderiza o Dashboard com a ordem clássica atualizada pelas informações reais
    if (typeof renderDashboardVIP === 'function') {
      renderDashboardVIP(dados.cliente);
    } else {
      console.error('[FORGE Lab] Função renderDashboardVIP ainda não foi criada.');
    }

  } catch (error) {
    console.error('[FORGE Lab] Erro ao comunicar com a API do cliente:', error);
  }
};

// =============================================================================
// MOTOR DO CARROSSEL DE VENDAS DO DASHBOARD (HIPER-PERSONALIZADO)
// =============================================================================
let carrosselInterval = null;

function iniciarCarrosselMini() {
  const container = document.getElementById('mini-carousel-content');
  const dotsContainer = document.getElementById('mini-carousel-dots');
  if (!container) return;

  const idsBanco = Object.keys(BANCO_DE_HARDWARE);
  if (idsBanco.length === 0) return;

  // 1. Descobre quem é o usuário e qual o perfil de uso dele
  let perfilUsuario = 'gaming'; // Padrão de segurança
  try {
    const usuarioVal = JSON.parse(localStorage.getItem('forge_user'));
    if (usuarioVal && (usuarioVal.perfil_uso || usuarioVal.perfilUso)) {
       perfilUsuario = (usuarioVal.perfil_uso || usuarioVal.perfilUso).toLowerCase();
    }
  } catch(e) {}

  // 2. Filtra o catálogo com base na profissão/uso do cliente
  let maquinasFiltradas = idsBanco.filter(id => {
    const badge = BANCO_DE_HARDWARE[id].badge.toLowerCase();
    const nome = BANCO_DE_HARDWARE[id].name.toLowerCase();
    
    if (perfilUsuario === 'gaming' || perfilUsuario === 'gamer') {
      return badge.includes('gaming') || badge.includes('gamer') || nome.includes('gaming');
    } else if (perfilUsuario === '3d' || perfilUsuario === 'ia') {
      return badge.includes('workstation') || badge.includes('titan') || badge.includes('pro');
    } else if (perfilUsuario === 'dev' || perfilUsuario === 'office') {
      return badge.includes('office') || badge.includes('dev') || badge.includes('workstation');
    }
    return true;
  });

  if (maquinasFiltradas.length < 3) {
    const outrasMaquinas = idsBanco.filter(id => !maquinasFiltradas.includes(id));
    maquinasFiltradas = [...maquinasFiltradas, ...outrasMaquinas];
  }

  // 3. Seleciona 3 máquinas aleatórias (agora priorizando o gosto do cliente)
  const misturados = [...maquinasFiltradas].sort(() => 0.5 - Math.random());
  const destaques = misturados.slice(0, 3);
  let indexAtual = 0;

  function renderizarSlide() {
    const pc = BANCO_DE_HARDWARE[destaques[indexAtual]];
    if (!pc) return;

    container.style.opacity = 0;

    setTimeout(() => {
      container.innerHTML = `
        <div style="width: 100%; height: 120px; display: flex; justify-content: center; margin-bottom: 15px; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: var(--color-blue); filter: blur(35px); opacity: 0.15; border-radius: 50%;"></div>
          <img src="${pc.img}" style="max-height: 100%; object-fit: contain; position: relative; z-index: 2; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6));">
        </div>
        <div style="font-family: var(--font-display); font-size: 18px; color: var(--color-ash); text-transform: uppercase; text-align: center; line-height: 1.1;">${pc.name}</div>
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); margin-top: 6px; letter-spacing: 1px;">${pc.badge}</div>
        <div style="font-size: 14px; font-weight: bold; color: var(--color-gray); margin-top: 12px;">${pc.price}</div>
      `;

      dotsContainer.innerHTML = destaques.map((_, i) => `
        <div style="width: 6px; height: 6px; border-radius: 50%; background: ${i === indexAtual ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)'}; transition: background 0.3s ease;"></div>
      `).join('');

      container.onclick = () => abrirDetalhesProduto(destaques[indexAtual]);
      container.style.opacity = 1;
    }, 400); 
  }

  renderizarSlide();

  clearInterval(carrosselInterval);
  carrosselInterval = setInterval(() => {
    indexAtual = (indexAtual + 1) % destaques.length;
    renderizarSlide();
  }, 5000);
}

// --- INTERCEPTOR DE SUBMIT: INTEGRAÇÃO REAL EM REDE COM O BANCO MYSQL ---
window.handleEnviarConsultoria = async function(event) {
  if (event) event.preventDefault();

  const btn = event.target;
  const textoOriginal = btn.textContent;

  const assuntoVal = document.getElementById('consultoria-assunto').value;
  const mensagemVal = document.getElementById('consultoria-mensagem').value;

  if (!mensagemVal.trim()) {
    showToast('Por favor, descreva detalhadamente a sua necessidade antes de enviar.', 'error');
    return;
  }

  btn.textContent = 'Transmitindo ao MySQL...';
  btn.disabled = true;
  btn.style.opacity = '0.7';
  btn.style.cursor = 'wait';

  try {
    const token = localStorage.getItem('forge_token');
    const usuarioSalvo = localStorage.getItem('forge_user');
    let nomeUser = "Cliente FORGE";
    let emailUser = "";

    if (usuarioSalvo) {
      const u = JSON.parse(usuarioSalvo);
      nomeUser = u.nome || nomeUser;
      emailUser = u.email || emailUser;
    }

    const payload = {
      cliente_nome: nomeUser,
      cliente_email: emailUser,
      assunto: assuntoVal,
      mensagem_texto: mensajeVal || mensagemVal
    };

    // Lê a URL base configurada globalmente no plugin do Claude ou usa rotas locais
    const apiBaseUrl = typeof window.FORGE_API_BASE !== 'undefined' ? window.FORGE_API_BASE : '';

    const resposta = await fetch(`${apiBaseUrl}/novo-chamado`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) throw new Error('Falha de resposta na API Gateway');
    
    showToast(`Chamado registrado com sucesso no banco de dados!`, 'success');
    document.getElementById('consultoria-mensagem').value = '';

    setTimeout(async () => {
      // Redireciona de volta para a Home do Dashboard
      showSection('cliente');
      
      // 🔥 GATILHO CRUCIAL: Força o arquivo do Claude a fazer o fetch imediato e re-pintar o Stepper
      if (typeof window.carregarEInjetarChamados === 'function') {
        await window.carregarEInjetarChamados();
      }

      btn.textContent = textoOriginal;
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }, 800);

  } catch (erro) {
    console.error("Erro ao enviar chamado para o servidor remoto:", erro);
    showToast('Instabilidade de rede. Não foi possível registrar no MySQL.', 'error');
    
    btn.textContent = textoOriginal;
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
};

// Função para disparar a criação do chamado quando o cliente agendar a Call
async function enviarAgendamentoConsultoria(assuntoSelecionado) {
  const token = localStorage.getItem('forge_token');
  
  if (!token) {
    alert("Você precisa estar logado para agendar uma consultoria!");
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/api/cliente/chamados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        assunto: assuntoSelecionado || "Nova Build — Dimensionamento de Setup"
      })
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert("Consultoria agendada com sucesso! Acompanhe o status no seu Dashboard.");
      if (typeof showSection === 'function') showSection('dashboard'); // Redireciona o cliente para a Home/Dashboard
    } else {
      alert("Erro ao agendar: " + resultado.message);
    }
  } catch (error) {
    console.error("Erro na requisição do chamado:", error);
  }
}

// FUNÇÃO PARA ABRIR E FECHAR O MENU DE LOGOUT
function toggleMenuUsuario(event) {
  // Impede que o clique feche o menu imediatamente se clicar no botão de sair
  if (event) event.stopPropagation();
  
  const menu = document.getElementById('avatar-dropdown-menu');
  if (menu) {
    if (menu.style.display === 'none' || menu.style.display === '') {
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  }
}

// Fecha o menu de logout se o usuário clicar em qualquer outro lugar da tela
document.addEventListener('click', function() {
  const menu = document.getElementById('avatar-dropdown-menu');
  if (menu) {
    menu.style.display = 'none';
  }
});

// =============================================================================
//  CONTROLE DO CHECKOUT E STATUS DE PEDIDO FICTÍCIO (PARA APRESENTAÇÃO)
// =============================================================================

function abrirCheckoutFicticio() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'flex';
}

function fecharCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'none';
}

// Altera o visual entre PIX e Cartão no modal
function selecionarMetodoPagamento(metodo) {
  const container = document.getElementById('checkout-conteudo-pagamento');
  if (!container) return;
  
  if (metodo === 'pix') {
    container.innerHTML = `
      <p style="color: var(--color-ash); font-family: var(--font-mono); font-size: 12px; margin-bottom: 12px; letter-spacing: 1px;">QR CODE DE TESTE GERADO</p>
      <div style="width: 140px; height: 140px; background: #fff; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: bold; font-size: 11px; border-radius: 4px;">[ QR CODE FORGE ]</div>
      <p style="color: var(--color-gray); font-size: 11px; line-height: 1.4;">Escaneamento simulado. Clique no botão abaixo para aprovar instantaneamente.</p>
    `;
  } else {
    container.innerHTML = `
      <p style="color: var(--color-ash); font-family: var(--font-mono); font-size: 12px; margin-bottom: 15px; letter-spacing: 1px;">CARTÃO DE CRÉDITO FICTÍCIO</p>
      <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 0 auto;">
        <input type="text" value="4444 •••• •••• 4444" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 13px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" value="12/29" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; flex: 1; text-align: center;">
          <input type="text" value="777" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; flex: 1; text-align: center;">
        </div>
      </div>
    `;
  }
}

// Simula o processamento do pagamento e desenha a situação na tela do cliente
function processarPagamentoFicticio() {
  const btn = document.getElementById('btn-confirmar-pagamento');
  const conteudo = document.getElementById('checkout-conteudo-pagamento');
  
  if (!btn || !conteudo) return;
  
  // Efeito visual de carregamento
  btn.disabled = true;
  btn.innerText = "PROCESSANDO TRANSACÃO...";
  conteudo.innerHTML = `
    <div style="padding: 30px 0;">
      <div style="width: 35px; height: 35px; border: 3px solid rgba(42,132,208,0.1); border-top: 3px solid #2a84d0; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear;"></div>
      <p style="color: var(--color-ash); font-size: 13px; font-family: var(--font-mono);">Conectando com o gateway de pagamento...</p>
    </div>
  `;
  
  // Adiciona a animação de girar dinamicamente caso o CSS não tenha
  if (!document.getElementById('forge-spin-style')) {
    const style = document.createElement('style');
    style.id = 'forge-spin-style';
    style.innerHTML = "@keyframes spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(style);
  }

  // Espera 2 segundos (tempo ideal para criar suspense na apresentação)
  setTimeout(() => {
    fecharCheckout();
    
    // Restaura o botão para o estado original caso usem de novo
    btn.disabled = false;
    btn.innerText = "CONFIRMAR PAGAMENTO";
    
    alert("💳 Sucesso! O pagamento simulado foi aprovado pela operadora. Seu pedido entrou na esteira de produção da Forge.");
    
    // Redireciona o cliente para o Dashboard principal
    if (typeof showSection === 'function') {
      showSection('cliente');
    }
    
    // Altera a caixinha de chamados para virar a Tela de Rastreio com a linha do tempo (Stepper)
    const boxChamados = document.getElementById('box-chamados');
    if (boxChamados) {
      boxChamados.innerHTML = `
        <h3 class="client-card-title">Situação do meu Pedido</h3>
        <div style="background: rgba(0,0,0,0.18); border: 1px solid rgba(42,132,208,0.25); border-radius: 8px; padding: 20px;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); letter-spacing: 1.5px; display: block; margin-bottom: 4px;">ORDEM #FRG-9842 · HOJE</span>
              <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--color-ash); text-transform: uppercase; margin: 0;">Workstation Customizada</h4>
            </div>
            <span style="font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 4px 10px; background: rgba(255,189,46,0.12); color: #ffbd2e; border: 0.5px solid rgba(255,189,46,0.3); border-radius: 2px;">EM MONTAGEM</span>
          </div>

          <div style="position: relative; display: flex; justify-content: space-between; align-items: flex-start; width: 100%; padding: 0 7px; margin-top: 10px;">
            <div style="position: absolute; top: 7px; left: 28px; right: 28px; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
            <div style="position: absolute; top: 7px; left: 28px; width: 33%; height: 2px; background: var(--color-blue); z-index: 2; transition: width 0.5s ease;"></div>
            
            <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: var(--color-blue); z-index: 3;"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-ash); text-transform: uppercase;">Pago</span>
            </div>
            
            <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #ffbd2e; box-shadow: 0 0 10px #ffbd2e; z-index: 3;"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: #ffbd2e; font-weight: bold; text-transform: uppercase;">Montagem</span>
            </div>
            
            <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08); z-index: 3;"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase;">Testes</span>
            </div>
            
            <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08); z-index: 3;"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase;">Envio</span>
            </div>
          </div>

        </div>
      `;
    }
  }, 2000);
}

// =============================================================================
// SISTEMA DE NOTIFICAÇÃO E CHECKOUT PERSONALIZADO FORGE (APRESENTAÇÃO)
// =============================================================================

// Função para disparar o Toast da Forge na Tela (Substitui o alert)
function dispararNotificacaoForge(mensagem, titulo = "SISTEMA FORGE") {
  const container = document.getElementById('forge-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #0B0907;
    border-left: 4px solid #2a84d0;
    border-top: 1px solid rgba(42,132,208,0.2);
    border-bottom: 1px solid rgba(42,132,208,0.2);
    border-right: 1px solid rgba(42,132,208,0.2);
    padding: 15px 20px;
    border-radius: 0 4px 4px 0;
    color: #fff;
    min-width: 300px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.6), 0 0 10px rgba(42,132,208,0.2);
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  toast.innerHTML = `
    <strong style="display:block; font-family:var(--font-mono); font-size:11px; color:#2a84d0; letter-spacing:1px; margin-bottom:4px;">${titulo}</strong>
    <span style="font-size:13px; color:var(--color-ash); line-height:1.4;">${mensagem}</span>
  `;

  container.appendChild(toast);

  // Animação de entrada
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);

  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => { toast.remove(); }, 400);
  }, 5000);
}

// Abre o modal de checkout e força o carregamento inicial do PIX
document.addEventListener('click', function(event) {
  if (event.target && event.target.innerText && event.target.innerText.includes('FINALIZAR COMPRA')) {
    event.preventDefault();
    event.stopPropagation();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.style.display = 'flex';
      selecionarMetodoPagamento('pix'); // Garante que abre mostrando o PIX ativo
    }
  }
});

// Controla a troca visual das Abas (PIX vs Cartão)
function selecionarMetodoPagamento(metodo) {
  const containerConteudo = document.getElementById('checkout-conteudo-pagamento');
  const btnPix = document.getElementById('tab-pix');
  const btnCartao = document.getElementById('tab-cartao');
  
  if (!containerConteudo || !btnPix || !btnCartao) return;

  if (metodo === 'pix') {
    // Atualiza botões
    btnPix.style.cssText = "flex: 1; background: rgba(42, 132, 208, 0.15); border: 1px solid #2a84d0; color: #fff; padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";
    btnCartao.style.cssText = "flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";
    
    // Injeta o QR Code
    containerConteudo.innerHTML = `
      <p style="color: #fff; font-family: var(--font-mono); font-size: 11px; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase;">❖ QR Code de Teste Operacional</p>
      <div style="width: 130px; height: 130px; background: #fff; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: bold; font-size: 11px; border: 4px solid #fff; border-radius: 4px;">[ QR CODE FORGE ]</div>
      <p style="color: #888; font-size: 11px; margin: 0; line-height: 1.4;">Simulador ativo. Clique no botão de confirmação abaixo para simular o recebimento do PIX.</p>
    `;
  } else {
    // Atualiza botões
    btnPix.style.cssText = "flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";
    btnCartao.style.cssText = "flex: 1; background: rgba(42, 132, 208, 0.15); border: 1px solid #2a84d0; color: #fff; padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";
    
    // Injeta o formulário do Cartão
    containerConteudo.innerHTML = `
      <p style="color: #fff; font-family: var(--font-mono); font-size: 11px; margin: 0 0 15px 0; letter-spacing: 1px; text-transform: uppercase;">💳 Dados do Cartão Simulado</p>
      <div style="text-align: left; display: flex; flex-direction: column; gap: 10px; max-width: 280px; margin: 0 auto; width: 100%;">
        <input type="text" value="4444 •••• •••• 1928" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; gap: 10px; width: 100%;">
          <input type="text" value="12/30" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; flex: 1; text-align: center;">
          <input type="text" value="482" disabled style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: #fff; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; flex: 1; text-align: center;">
        </div>
      </div>
    `;
  }
}

// Processa o pagamento fictício e reconstrói a área do cliente como "Meus Pedidos"
function processarPagamentoFicticio() {
  const btn = document.getElementById('btn-confirmar-pagamento');
  const conteudo = document.getElementById('checkout-conteudo-pagamento');
  
  if (!btn || !conteudo) return;
  
  btn.disabled = true;
  btn.style.opacity = "0.6";
  btn.innerText = "CONECTANDO GATEWAY...";
  
  conteudo.innerHTML = `
    <div style="padding: 20px 0;">
      <div style="width: 30px; height: 30px; border: 2px solid rgba(42,132,208,0.1); border-top: 2px solid #2a84d0; border-radius: 50%; margin: 0 auto 15px; animation: forgeSpin 0.8s infinite linear;"></div>
      <p style="color: #fff; font-size: 12px; font-family: var(--font-mono); letter-spacing: 0.5px;">Autenticando transação segura...</p>
    </div>
  `;

  if (!document.getElementById('forge-spin-animation')) {
    const s = document.createElement('style');
    s.id = 'forge-spin-animation';
    s.innerHTML = "@keyframes forgeSpin { to { transform: rotate(360deg); } }";
    document.head.appendChild(s);
  }

  setTimeout(() => {
    // Fecha o modal
    document.getElementById('checkout-modal').style.display = 'none';
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.innerText = "CONFIRMAR PAGAMENTO";

    // Dispara a Notificação customizada da Forge!
    dispararNotificacaoForge("Pagamento aprovado com sucesso! O seu pedido já entrou na esteira de produção da Forge.", "GATEWAY DE PAGAMENTO");

    // Redireciona para o Dashboard do Cliente
    if (typeof showSection === 'function') {
      showSection('cliente');
    }

    // Injeta a aba "Meus Pedidos" com o Stepper dinâmico
    const boxChamados = document.getElementById('box-chamados');
    if (boxChamados) {
      boxChamados.innerHTML = `
        <h3 class="client-card-title">Meus Pedidos</h3>
        <div style="background: rgba(0,0,0,0.18); border: 1px solid rgba(42,132,208,0.25); border-radius: 8px; padding: 20px;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
            <div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); letter-spacing: 1.5px; display: block; margin-bottom: 4px;">PEDIDO #FRG-9842 · HOJE</span>
              <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--color-ash); margin: 0; text-transform: uppercase;">Workstation Forge Custom</h4>
            </div>
            <span style="font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 4px 10px; background: rgba(255,189,46,0.12); color: #ffbd2e; border: 0.5px solid rgba(255,189,46,0.3); border-radius: 2px;">EM MONTAGEM</span>
          </div>

          <div style="position: relative; display: flex; justify-content: space-between; width: 100%; padding: 0 7px;">
            <div style="position: absolute; top: 7px; left: 28px; right: 28px; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
            <div style="position: absolute; top: 7px; left: 28px; width: 33%; height: 2px; background: var(--color-blue); z-index: 2;"></div>
            
            <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: var(--color-blue);"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-ash);">Aprovado</span>
            </div>
            <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #ffbd2e; box-shadow: 0 0 10px #ffbd2e;"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: #ffbd2e; font-weight: bold;">Montagem</span>
            </div>
            <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08);"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray);">Testes</span>
            </div>
            <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08);"></div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray);">Envio</span>
            </div>
          </div>

        </div>
      `;
    }
  }, 1800);
}