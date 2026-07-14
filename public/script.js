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
    showToast('Crie uma conta ou faça login para adicionar projetos ao carrinho.', 'error');
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
    const resposta = await fetch('https://forge-production-bb99.up.railway.app/api/auth/login', {
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
    const resposta = await fetch('https://forge-production-bb99.up.railway.app/api/auth/login', {
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
    const res  = await fetch('https://forge-production-bb99.up.railway.app/api/auth/login', {
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
      carregarDashboardDoCliente(data.usuario);
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
    const res  = await fetch('https://forge-production-bb99.up.railway.app/api/auth/register', {
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

      carregarDashboardDoCliente(data.usuario);
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

// =============================================================================
// EXPORTAÇÕES GLOBAIS (Garante funcionamento dos cliques no HTML)
// =============================================================================
window.authGuard                  = authGuard;
window.closeAuthGuardModal        = closeAuthGuardModal;
window.agSwitchTab                = agSwitchTab;
window.agDoLogin                  = agDoLogin;
window.agDoRegister               = agDoRegister;
window.solicitarVendaComGuard     = solicitarVendaComGuard;
window.labAnalisarSetup           = labAnalisarSetup;
window.labAbrirNovoChamado        = labAbrirNovoChamado;
window.labRemoverDaWishlist       = labRemoverDaWishlist;
window.labSalvarNaWishlist        = labSalvarNaWishlist;
window.labLogout                  = labLogout;

// Exportações das funções de Login/Logout
window.doLogin                    = doLogin;
window.doRegister                 = doRegister;
window.doLogout                   = doLogout;
window.trocarAbaLab               = trocarAbaLab;

// Exportações essenciais para o funcionamento do Checkout Profissional
window.abrirCheckoutFicticio      = abrirCheckoutFicticio;
window.fecharCheckout             = fecharCheckout;
window.selecionarMetodoPagamento  = selecionarMetodoPagamento;
window.processarPagamentoFicticio = processarPagamentoFicticio;
window.irParaPagamento            = irParaPagamento;
window.voltarParaEndereco         = voltarParaEndereco;

// =============================================================================
// LABORATÓRIO VIP - DASHBOARD COMPLETO E BLINDADO
// =============================================================================

// =============================================================================
// LABORATÓRIO VIP - DASHBOARD COMPLETO E BLINDADO
// =============================================================================

window.carregarDashboardDoCliente = async function() {
  console.log('[FORGE Lab] Iniciando carregamento do dashboard...');
  const container = document.getElementById('cliente');
  
  if (container) {
    container.innerHTML = `
      <div style="padding: 100px 20px; text-align: center; color: var(--color-blue); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 2px;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(42,132,208,0.2); border-top: 3px solid var(--color-blue); border-radius: 50%; margin: 0 auto 20px; animation: spin 1s infinite linear;"></div>
        Descriptografando Laboratório VIP...
      </div>`;
  }

  const token = localStorage.getItem('forge_token');
  if (!token) {
    console.warn('[FORGE Lab] Sem token de autenticação ativo.');
    return;
  }

  let usuarioAtivo = { nome: 'Cliente VIP', perfil_uso: 'Entusiasta', id: 'FRG-2026' };

  try {
    const usuarioSalvo = localStorage.getItem('forge_user');
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      if (parsed && parsed.nome) usuarioAtivo = parsed;
    }
  } catch (e) {
    console.warn('[FORGE Lab] Cache de usuário vazio.');
  }

  try {
    const resposta = await fetch('https://forge-production-bb99.up.railway.app/api/catalogo', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if (resposta.ok) {
      const dados = await resposta.json();
      if (dados && dados.cliente) usuarioAtivo = dados.cliente;
    }
  } catch (error) {
    console.error('[FORGE Lab] Instabilidade na rede. Usando dados do cache local.', error);
  }
  
  setTimeout(() => {
    try {
      renderDashboardVIP(usuarioAtivo);
    } catch(err) {
      console.error("[FORGE Lab] Erro Crítico ao renderizar Dashboard: ", err);
      if (container) {
         container.innerHTML = `<div style="color: #ff4d4d; text-align: center; padding: 50px; font-family: var(--font-mono);">[ERRO CRÍTICO] Falha ao injetar módulos do laboratório. Atualize a página e tente novamente.</div>`;
      }
    }
  }, 500); 
};

function renderDashboardVIP(usuario) {
  const container = document.getElementById('cliente');
  if (!container) return;
 
  const nome         = usuario.nome || 'Usuário';
  const primeiroNome = nome.split(' ')[0];
  const initials     = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const perfil       = usuario.perfil_uso || usuario.perfilUso || 'Entusiasta';
  const idCliente    = usuario.id || 'FRG-2026';
 
  container.innerHTML = `
    <div class="lab" style="animation: fadeIn 0.4s ease-out;">
      <header class="lab__header">
        <div class="lab__header-left">
          <div class="lab__avatar" aria-hidden="true">${initials}</div>
          <div class="lab__header-info">
            <p class="lab__eyebrow">Meu Laboratório VIP</p>
            <h1 class="lab__title">Bem-vindo, <span class="lab__title-accent">${primeiroNome}</span></h1>
            <div class="lab__meta-row">
              <span class="lab__badge lab__badge--profile">${perfil}</span>
              <span class="lab__badge lab__badge--id">ID: ${idCliente}</span>
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
        
        <div id="aba-visao-geral" class="lab-tab-pane active" style="display: block;">
          <div class="lab__grid">
            <div class="lab__col-main">
              ${_htmlModuloSetup()}
            </div>
            <aside class="lab__col-sidebar">
              ${_htmlModuloNavRapida()}
            </aside>
          </div>
        </div>

        <div id="aba-meus-pedidos" class="lab-tab-pane" style="display: none;">
          <div class="lab-panel-blank" style="padding: 60px 20px; background: var(--color-iron); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h3 style="font-family: var(--font-display); font-size: 24px; color: var(--color-ash); margin-bottom: 10px; text-transform: uppercase;">Meus Pedidos</h3>
              <p style="color: var(--color-gray); font-size: 15px;">Acompanhe o status de montagem e envio das suas máquinas em tempo real.</p>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 30px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <div>
                  <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-blue); text-transform: uppercase; letter-spacing: 1px;">Pedido #FRG-9024</span>
                  <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--color-ash); margin-top: 5px;">Workstation High-End</h4>
                </div>
                <span style="background: rgba(0, 166, 80, 0.15); color: #00a650; font-family: var(--font-mono); font-size: 11px; font-weight: bold; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; border: 1px solid rgba(0, 166, 80, 0.3);">Montagem Iniciada</span>
              </div>
              
              <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 30px;">
                <div style="position: absolute; top: 7px; left: 10%; right: 10%; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
                <div style="position: absolute; top: 7px; left: 10%; width: 25%; height: 2px; background: var(--color-blue); z-index: 2;"></div>
                
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
                  <div style="width: 14px; height: 14px; border-radius: 50%; background: var(--color-blue); box-shadow: 0 0 10px var(--color-blue);"></div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-ash); text-transform: uppercase;">Aprovado</span>
                </div>
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
                  <div style="width: 14px; height: 14px; border-radius: 50%; background: #ffbd2e; box-shadow: 0 0 10px #ffbd2e;"></div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: #ffbd2e; font-weight: bold; text-transform: uppercase;">Montagem</span>
                </div>
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
                  <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08);"></div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase;">Testes</span>
                </div>
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 7px; z-index: 3;">
                  <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,0.08);"></div>
                  <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase;">Enviado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
 
  if (!document.getElementById('forge-spin-style')) {
    const s = document.createElement('style');
    s.id = 'forge-spin-style';
    s.innerHTML = "@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }";
    document.head.appendChild(s);
  }

  iniciarCarrosselMini();
  if (typeof _initLabListeners === 'function') _initLabListeners();
}

window.trocarAbaLab = function(idAba, botaoClicado) {
  document.querySelectorAll('.lab-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.lab-tab-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });

  botaoClicado.classList.add('active');
  const painel = document.getElementById('aba-' + idAba);
  if (painel) {
    painel.classList.add('active');
    painel.style.display = 'block';
    painel.style.animation = 'fadeIn 0.3s ease-out forwards';
  }
};

function _htmlModuloSetup() {
  const pedidos = typeof LAB_MOCK_PEDIDOS !== 'undefined' ? LAB_MOCK_PEDIDOS : [];
  const totalMaquinas = pedidos.length || 1; 

  const eliteTiersHTML = `
    <div class="lab-marketing-card" style="background: var(--color-iron); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 25px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -30px; right: 10%; width: 150px; height: 150px; background: var(--color-blue); filter: blur(80px); opacity: 0.1; pointer-events: none;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px; position: relative; z-index: 2;">
        <div>
          <div style="font-family: var(--font-mono); color: var(--color-gray); font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">Patente de Hardware</div>
          <h3 style="font-family: var(--font-display); font-size: 24px; color: var(--color-ash); margin-top: 5px;">Membro <span style="color: var(--color-blue); text-shadow: 0 0 12px rgba(42, 132, 208, 0.4); text-transform: uppercase;">SILVER</span></h3>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-display); color: var(--color-ash); font-size: 22px; font-weight: bold; letter-spacing: 1px;">${totalMaquinas}</div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Máquina Adquirida</div>
        </div>
      </div>
      <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden; position: relative; z-index: 2; border: 1px solid rgba(255,255,255,0.02);">
        <div style="width: 20%; height: 100%; background: linear-gradient(90deg, #0d1b2a, var(--color-blue)); box-shadow: 0 0 10px rgba(42, 132, 208, 0.8); border-radius: 3px;"></div>
      </div>
    </div>
  `;

  const chamadosLista = window.LAB_MOCK_CHAMADOS || [];
  let chamadosContentHTML = '';

  if (chamadosLista.length === 0) {
    chamadosContentHTML = `
      <div style="text-align: center; padding: 25px 20px; background: rgba(0,0,0,0.15); border: 1px dashed rgba(42, 132, 208, 0.15); border-radius: 6px;">
        <p style="color: var(--color-gray); font-size: 13px; margin-bottom: 12px; line-height: 1.5;">Você não possui nenhuma ordem técnica ou chamado em andamento.</p>
        <button class="btn-ghost" style="font-size: 11px; padding: 8px 18px; border-color: var(--color-blue); color: var(--color-blue); font-weight: bold;" onclick="showSection('consultoria')">
          ABRIR CHAMADO TÉCNICO
        </button>
      </div>
    `;
  } else {
    chamadosLista.slice(0, 2).forEach(ch => {
      const passos = ["Triagem", "Análise", "Bancada", "Pronto"];
      let passosHTML = '';
      passos.forEach((nomePasso, index) => {
        const numPasso = index + 1;
        const isActive = numPasso <= ch.passoAtual;
        const isCurrent = numPasso === ch.passoAtual;
        let bolaCor = "rgba(255,255,255,0.1)";
        let textoCor = "var(--color-gray)";
        let glow = "";
        if (isActive) { bolaCor = "var(--color-blue)"; textoCor = "var(--color-ash)"; }
        if (isCurrent) { bolaCor = "#ffbd2e"; glow = "box-shadow: 0 0 10px #ffbd2e;"; }
        passosHTML += `
          <div style="flex: 1; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${bolaCor}; ${glow} z-index: 3;"></div>
            <span style="font-family: var(--font-mono); font-size: 9px; color: ${textoCor}; margin-top: 6px; text-transform: uppercase;">${nomePasso}</span>
          </div>
        `;
      });
      chamadosContentHTML += `
        <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue);">ID: ${ch.id} • ${ch.data}</span>
              <h4 style="font-family: var(--font-display); font-size: 16px; color: var(--color-ash); margin: 4px 0 0; text-transform: uppercase;">${ch.assunto}</h4>
            </div>
          </div>
          <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 20px;">
            <div style="position: absolute; top: 5px; left: 35px; right: 35px; height: 2px; background: rgba(255,255,255,0.05); z-index: 1;"></div>
            <div style="position: absolute; top: 5px; left: 35px; width: ${((ch.passoAtual - 1) / 3) * 85}%; height: 2px; background: var(--color-blue); z-index: 2;"></div>
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

  const bannerConfiguradorHTML = `
    <div class="lab-marketing-card" style="background: linear-gradient(135deg, var(--color-iron) 0%, #0a1118 100%); border: 1px solid rgba(42, 132, 208, 0.2); border-radius: 8px; padding: 35px 30px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="position: relative; z-index: 2;">
        <div style="font-family: var(--font-mono); color: var(--color-blue); font-size: 11px; letter-spacing: 2px; margin-bottom: 10px;">FORJE SEU SETUP</div>
        <h3 style="font-family: var(--font-display); font-size: 28px; color: var(--color-ash); text-transform: uppercase; margin-bottom: 12px; line-height: 1.1;">Configurador FORGE</h3>
        <p style="color: var(--color-gray); font-size: 14px; margin-bottom: 24px; line-height: 1.6; max-width: 780px;">Monte a sua próxima Workstation com a FORGE. Use nosso configurador para garantir a compatibilidade de componentes automatizada.</p>
        <button class="btn-ghost" style="border-color: var(--color-blue); color: var(--color-blue); padding: 10px 22px; font-size: 12px;" onclick="showSection('configurador')">
          INICIAR NOVO PROJETO
        </button>
      </div>
    </div>
  `;

  const bannerCoreHTML = `
    <div class="lab-marketing-card" style="background: linear-gradient(135deg, var(--color-iron) 0%, #0d1b2a 100%); border: 1px solid var(--color-blue-dim); border-radius: 8px; padding: 30px; margin-bottom: 25px; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; flex-wrap: wrap; gap: 20px;">
        <div style="max-width: 60%; min-width: 280px;">
          <div style="font-family: var(--font-mono); color: var(--color-blue); font-size: 11px; letter-spacing: 2px; margin-bottom: 10px;">SOFTWARE EXCLUSIVO</div>
          <h3 style="font-family: var(--font-display); font-size: 28px; color: var(--color-ash); text-transform: uppercase; margin-bottom: 10px; line-height: 1.1;">FORGE Core</h3>
          <p style="color: var(--color-gray); font-size: 14px; margin-bottom: 20px; line-height: 1.5;">Monitore sua máquina com a FORGE. Telemetria em tempo real, overclock seguro e controle térmico.</p>
          <button class="btn-ghost" style="border-color: var(--color-blue); color: var(--color-blue); padding: 10px 20px; font-size: 12px;" onclick="showSection('software')">
            CONHEÇA O SOFTWARE
          </button>
        </div>
      </div>
    </div>
  `;

  return eliteTiersHTML + bannerChamadosHTML + bannerConfiguradorHTML + bannerCoreHTML;
}

function _htmlModuloNavRapida() {
  return `
    <div style="background: var(--color-void); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; display: flex; flex-direction: column; min-height: 260px;">
      <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2);">
        <span style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gray); text-transform: uppercase;">Vitrine FORGE</span>
        <span style="display: flex; gap: 5px;" id="mini-carousel-dots"></span>
      </div>
      <div id="mini-carousel-content" style="flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.4s ease-in-out;">
      </div>
    </div>
  `;
}

let carrosselInterval = null;

function iniciarCarrosselMini() {
  const container = document.getElementById('mini-carousel-content');
  const dotsContainer = document.getElementById('mini-carousel-dots');
  if (!container) return;

  const idsBanco = typeof BANCO_DE_HARDWARE !== 'undefined' ? Object.keys(BANCO_DE_HARDWARE) : [];
  if (idsBanco.length === 0) {
    container.innerHTML = '<p style="color:var(--color-gray); font-size:12px;">Carregando vitrine...</p>';
    return;
  }

  const destaques = idsBanco.slice(0, 3);
  let indexAtual = 0;

  function renderizarSlide() {
    const pc = BANCO_DE_HARDWARE[destaques[indexAtual]];
    if (!pc) return;

    container.style.opacity = 0;
    setTimeout(() => {
      container.innerHTML = `
        <div style="width: 100%; height: 120px; display: flex; justify-content: center; margin-bottom: 15px; position: relative;">
          <img src="${pc.img}" style="max-height: 100%; object-fit: contain; position: relative; z-index: 2;">
        </div>
        <div style="font-family: var(--font-display); font-size: 18px; color: var(--color-ash); text-transform: uppercase; text-align: center;">${pc.name}</div>
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); margin-top: 6px;">${pc.badge}</div>
        <div style="font-size: 14px; font-weight: bold; color: #00a650; margin-top: 12px;">${pc.price}</div>
      `;
      if (dotsContainer) {
        dotsContainer.innerHTML = destaques.map((_, i) => `
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${i === indexAtual ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)'}; transition: background 0.3s ease;"></div>
        `).join('');
      }
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

// =============================================================================
// CONTROLE DO CHECKOUT PROFISSIONAL EM ETAPAS (SIMULAÇÃO)
// =============================================================================

function dispararNotificacaoForge(mensagem, titulo = "SISTEMA FORGE") {
  const container = document.getElementById('forge-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #0B0907; border-left: 4px solid #2a84d0;
    border: 1px solid rgba(42,132,208,0.2); padding: 15px 20px;
    border-radius: 0 4px 4px 0; color: #fff; min-width: 300px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.6), 0 0 10px rgba(42,132,208,0.2);
    transform: translateX(120%); transition: transform 0.4s;
  `;
  toast.innerHTML = `<strong style="display:block; font-size:11px; color:#2a84d0;">${titulo}</strong>
                     <span style="font-size:13px; color:var(--color-ash);">${mensagem}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => { toast.remove(); }, 400);
  }, 5000);
}

function abrirCheckoutFicticio() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.style.display = 'flex';
    voltarParaEndereco(); // Sempre abre na etapa 1 (Endereço)
  }
}

function fecharCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.style.display = 'none';
}

// Lógica de navegação do Stepper
function irParaPagamento() {
  document.getElementById('checkout-step-1').style.display = 'none';
  document.getElementById('checkout-step-2').style.display = 'block';
  
  document.getElementById('step-1-tab').style.color = 'var(--color-gray)';
  document.getElementById('step-1-tab').style.borderColor = 'transparent';
  
  document.getElementById('step-2-tab').style.color = 'var(--color-blue)';
  document.getElementById('step-2-tab').style.borderColor = 'var(--color-blue)';
  
  // Inicia sempre na aba de cartão de crédito quando avança
  selecionarMetodoPagamento('cartao');
}

function voltarParaEndereco() {
  document.getElementById('checkout-step-2').style.display = 'none';
  document.getElementById('checkout-step-1').style.display = 'block';
  
  document.getElementById('step-2-tab').style.color = 'var(--color-gray)';
  document.getElementById('step-2-tab').style.borderColor = 'transparent';
  
  document.getElementById('step-1-tab').style.color = 'var(--color-blue)';
  document.getElementById('step-1-tab').style.borderColor = 'var(--color-blue)';
}

// Injeção de HTML para Cartão ou PIX de forma realista
function selecionarMetodoPagamento(metodo) {
  const container = document.getElementById('checkout-conteudo-pagamento');
  const btnCartao = document.getElementById('tab-cartao');
  const btnPix = document.getElementById('tab-pix');
  const btnConfirmar = document.getElementById('btn-confirmar-pagamento');
  
  if (!container || !btnCartao || !btnPix) return;

  const activeStyle = "flex: 1; background: rgba(42, 132, 208, 0.15); border: 1px solid var(--color-blue); color: #fff; padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";
  const inactiveStyle = "flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--color-gray); padding: 12px; font-family: var(--font-mono); font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;";

  if (metodo === 'cartao') {
    btnCartao.style.cssText = activeStyle;
    btnPix.style.cssText = inactiveStyle;
    btnConfirmar.innerText = "CONFIRMAR PAGAMENTO (CARTÃO)";
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; animation: fadeIn 0.3s;">
        <div style="grid-column: span 2;">
          <label style="color: var(--color-ash); font-size: 11px; margin-bottom: 4px; display: block;">Número do Cartão</label>
          <input type="text" placeholder="0000 0000 0000 0000" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 4px; outline: none; font-family: var(--font-mono);">
        </div>
        <div style="grid-column: span 2;">
          <label style="color: var(--color-ash); font-size: 11px; margin-bottom: 4px; display: block;">Nome Impresso no Cartão</label>
          <input type="text" placeholder="NOME DO TITULAR" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 4px; outline: none; text-transform: uppercase;">
        </div>
        <div>
          <label style="color: var(--color-ash); font-size: 11px; margin-bottom: 4px; display: block;">Validade (MM/AA)</label>
          <input type="text" placeholder="12/30" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 4px; outline: none; font-family: var(--font-mono);">
        </div>
        <div>
          <label style="color: var(--color-ash); font-size: 11px; margin-bottom: 4px; display: block;">CVV</label>
          <input type="text" placeholder="123" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 4px; outline: none; font-family: var(--font-mono);">
        </div>
        <div style="grid-column: span 2; margin-top: 5px;">
          <select style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 4px; outline: none;">
            <option>À vista sem juros</option>
            <option>2x sem juros</option>
            <option>10x com juros</option>
            <option>12x com juros</option>
          </select>
        </div>
      </div>
    `;
  } else {
    btnPix.style.cssText = activeStyle;
    btnCartao.style.cssText = inactiveStyle;
    btnConfirmar.innerText = "GERAR CÓDIGO PIX";
    
    container.innerHTML = `
      <div style="text-align: center; animation: fadeIn 0.3s; padding: 15px 0;">
        <div style="width: 120px; height: 120px; background: #fff; padding: 10px; border-radius: 8px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01"/></svg>
        </div>
        <p style="color: var(--color-gray); font-size: 12px; margin-bottom: 10px;">Escaneie o QR Code ou utilize a chave Copia e Cola:</p>
        <div style="background: rgba(0,0,0,0.5); border: 1px dashed rgba(42,132,208,0.5); padding: 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--color-blue); word-break: break-all;">
          00020101021226810014br.gov.bcb.pix2559pix.forge.com.br/token/abcd-1234
        </div>
      </div>
    `;
  }
}

function processarPagamentoFicticio() {
  const btn = document.getElementById('btn-confirmar-pagamento');
  const conteudo = document.getElementById('checkout-conteudo-pagamento');
  if (!btn || !conteudo) return;
  
  btn.disabled = true;
  btn.style.opacity = "0.5";
  btn.innerText = "PROCESSANDO...";
  
  conteudo.innerHTML = `
    <div style="padding: 40px 0; text-align: center;">
      <div style="width: 40px; height: 40px; border: 3px solid rgba(0,166,80,0.2); border-top: 3px solid #00a650; border-radius: 50%; margin: 0 auto 15px; animation: forgeSpin 0.8s infinite linear;"></div>
      <p style="color: #fff; font-size: 13px; font-family: var(--font-mono);">Estabelecendo conexão segura...</p>
    </div>
  `;

  setTimeout(() => {
    fecharCheckout();
    btn.disabled = false;
    btn.style.opacity = "1";

    dispararNotificacaoForge("Transação aprovada com sucesso! O seu pedido já entrou na nossa esteira de montagem.", "COMPRA CONFIRMADA");

    if (typeof showSection === 'function') {
      showSection('cliente');
      // Envia o usuário direto para a aba de rastreio de pedidos
      trocarAbaLab('meus-pedidos', document.querySelectorAll('.lab-tab-btn')[1]);
    }
  }, 2000);
}

// =============================================================================
// RESTAURAÇÃO: CATÁLOGO, EFEITOS GLOBAIS E COMPARADOR
// =============================================================================

async function carregarCatalogoDoBanco() {
  try {
    const resposta = await fetch('https://forge-production-bb99.up.railway.app/api/catalogo');
    const dados = await resposta.json();

    if (resposta.ok && dados.builds) {
      BANCO_DE_HARDWARE = {}; 

      dados.builds.forEach(row => {
        const specsObj = typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs;
        const benchmarksObj = typeof row.benchmarks === 'string' ? JSON.parse(row.benchmarks) : row.benchmarks;

        BANCO_DE_HARDWARE[row.id] = {
          name: row.nome,
          price: row.preco,
          badge: row.badge,
          renderClass: row.render_class,
          img: row.img,
          tagline: row.tagline,
          specs: specsObj,
          benchmarks: benchmarksObj,
          estoque: row.estoque !== undefined ? row.estoque : 15 
        };
      });
      console.log("[FORGE] Catálogo sincronizado com o MySQL.");
      
      // Força a renderização imediata das builds e do comparador após o carregamento
      carregarCards();
      montarSeletoresComparador();
    }
  } catch (erro) {
    console.error("[FORGE] Erro ao sincronizar catálogo:", erro);
  }
}

function inicializarRastroMouse() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

function inicializarScrollReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); 
      }
    });
  }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

  const seletoresParaAnimar = ['.sec-header', '.build-card', '.consul-card', '.client-card', '.compare-metric-card', '.telemetria-card', '.auth-wrap', '.schedule-form', '.bench-table'];
  
  const elementos = document.querySelectorAll(seletoresParaAnimar.join(', '));
  elementos.forEach((el, index) => {
    el.classList.add('reveal-element');
    el.style.animationDelay = `${(index % 4) * 0.1}s`; 
    observer.observe(el);
  });
}

function montarSeletoresComparador() {
  const selectA = document.getElementById('compare-pc-a');
  const selectB = document.getElementById('compare-pc-b');
  if (!selectA || !selectB) return;

  selectA.innerHTML = ''; selectB.innerHTML = '';

  Object.keys(BANCO_DE_HARDWARE).forEach((key, index) => {
    const optA = document.createElement('option');
    optA.value = key; optA.textContent = BANCO_DE_HARDWARE[key].name;
    if(index === 0) optA.selected = true; 
    selectA.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = key; optB.textContent = BANCO_DE_HARDWARE[key].name;
    if(index === Object.keys(BANCO_DE_HARDWARE).length - 1) optB.selected = true;
    selectB.appendChild(optB);
  });

  executarComparacao();
}

function executarComparacao() {
  const idA = document.getElementById('compare-pc-a')?.value;
  const idB = document.getElementById('compare-pc-b')?.value;
  const pcA = BANCO_DE_HARDWARE[idA];
  const pcB = BANCO_DE_HARDWARE[idB];
  
  if (!pcA || !pcB) return;

  document.getElementById('bar-name-a-cine').textContent = pcA.name;
  document.getElementById('bar-name-b-cine').textContent = pcB.name;
  
  const numA_cine = parseInt(pcA.benchmarks.cinebench.replace(/\\D/g, '')) || 0;
  const numB_cine = parseInt(pcB.benchmarks.cinebench.replace(/\\D/g, '')) || 0;
  const maxCine = Math.max(numA_cine, numB_cine, 1);

  document.getElementById('bar-fill-a-cine').style.width = ((numA_cine / maxCine) * 100) + '%';
  document.getElementById('bar-fill-b-cine').style.width = ((numB_cine / maxCine) * 100) + '%';
  document.getElementById('bar-val-a-cine').textContent = pcA.benchmarks.cinebench;
  document.getElementById('bar-val-b-cine').textContent = pcB.benchmarks.cinebench;
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