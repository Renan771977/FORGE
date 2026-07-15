/* =============================================================================
   js/pages/produto.js | Página de Detalhes da Build
   -----------------------------------------------------------------------------
   Porte fiel do abrirDetalhesProduto() do script.js original.
   Diferenças em relação ao original (que era single-page):
     - a build vem da query string: /produto?id=business-pro
     - showSection('vendas')            -> navega para /vendas
     - showSection('produto-detalhes')  -> desnecessário, a página já É essa
   Todo o markup abaixo é o mesmo, porque o vendas.css já o estiliza.
   ============================================================================= */
'use strict';

// >>> TROQUE PELO WHATSAPP REAL DA FORGE. O número abaixo é o placeholder
//     que já estava no script.js original (5531900000000 não existe).
const FORGE_WHATSAPP = '5531900000000';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('produto-container');
  if (!container) return;

  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    return mostrarErro(container, 'Nenhuma build informada.',
      'O endereço precisa do parâmetro <code>?id=</code>. Ex.: /produto?id=business-pro');
  }

  await window.forgeCatalogoPronto;

  const pc = window.BANCO_DE_HARDWARE[id];
  if (!pc) {
    return mostrarErro(container, 'Build não encontrada.',
      `Nenhuma build com o id "${id}" existe no catálogo.`);
  }

  renderizarProduto(container, id, pc);
});

function mostrarErro(container, titulo, detalhe) {
  container.innerHTML = `
    <div style="padding:120px 20px;text-align:center">
      <p style="font-family:var(--font-mono);color:#ff4d4d;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">${titulo}</p>
      <p style="color:var(--color-gray);margin-bottom:28px">${detalhe}</p>
      <button class="btn-primary" onclick="window.location.href='/vendas'">Voltar ao Catálogo</button>
    </div>`;
}

function renderizarProduto(container, idMaquina, pc) {
  document.title = `FORGE — ${pc.name}`;

  const valorNum     = window.forgePrecoParaNumero(pc.price);
  const valorPix     = (valorNum * 0.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valorParcela = (valorNum / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const mensagemWhatsapp = `Olá, gostaria de tirar dúvidas sobre a build *${pc.name}* (${pc.badge}) no valor de ${pc.price}.`;
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=${FORGE_WHATSAPP}&text=${encodeURIComponent(mensagemWhatsapp)}`;

  // Estoque vem da coluna `estoque` (int) da tabela maquinas_catalogo
  const estoque = pc.estoque;
  let urgencyHTML, btnComprarHTML;

  if (estoque <= 10 && estoque > 0) {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color:#ff5f57;background:rgba(255,95,87,.05);border:1px solid rgba(255,95,87,.2);font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:1px">ALTA DEMANDA: RESTAM APENAS ${estoque} UNIDADES DISPONÍVEIS</div>`;
    btnComprarHTML = `<button class="btn-buy-now" data-acao="comprar">COMPRAR AGORA</button>`;
  } else if (estoque <= 0) {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color:#ffbd2e;background:rgba(255,189,46,.05);border:1px solid rgba(255,189,46,.2);font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:1px">PRODUTO INDISPONÍVEL TEMPORARIAMENTE</div>`;
    btnComprarHTML = `<button class="btn-buy-now" style="background:var(--color-iron);color:var(--color-gray);cursor:not-allowed;border:1px solid rgba(255,255,255,.05)" disabled>FORA DE ESTOQUE</button>`;
  } else {
    urgencyHTML = `<div class="ecom-buy-urgency" style="color:#00a650;background:rgba(0,166,80,.05);border:1px solid rgba(0,166,80,.2);font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:1px">PRODUTO EM ESTOQUE: ${estoque} UNIDADES À PRONTA ENTREGA</div>`;
    btnComprarHTML = `<button class="btn-buy-now" data-acao="comprar">COMPRAR AGORA</button>`;
  }

  const spec = (k) => pc.specs[k] || '—';

  container.innerHTML = `
    <button class="btn-voltar" onclick="window.location.href='/vendas'" style="margin-bottom:25px">&larr; Voltar ao Catálogo</button>

    <header style="margin-bottom:35px;margin-top:5px">
      <h2 class="machine-title" id="produto-heading" style="font-size:42px;margin-bottom:6px">${pc.name}</h2>
      <p class="machine-tagline" style="font-size:16px;color:var(--color-gray);font-family:var(--font-body)">${pc.tagline}</p>
    </header>

    <div class="product-grid" style="align-items:flex-start;margin-top:0;padding-top:0">

      <div class="blueprint-panel" style="margin-top:0;padding-top:0">
        <div class="ambient-glow"></div>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}">
        <div class="machine-badge">${pc.badge}</div>
      </div>

      <div class="specs-panel" style="margin-top:0;padding-top:0">

        <div class="ecom-buy-panel" style="margin-top:0;margin-bottom:40px">
          ${urgencyHTML}

          <div class="ecom-prices">
            <div class="ecom-price-pix">
              ${valorPix} <span class="pix-badge" style="font-family:var(--font-mono);font-size:10px;background:#00a650;letter-spacing:.5px;font-weight:700;padding:4px 8px">10% OFF NO PIX</span>
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

            <button class="btn-add-cart" data-acao="add-carrinho">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              ADICIONAR AO CARRINHO
            </button>

            <a href="${linkWhatsApp}" target="_blank" rel="noopener" class="btn-whatsapp-assist">
              SOLICITAR CONSULTORIA VIA WHATSAPP
            </a>
          </div>

          <div class="ecom-trust-badges" style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.5px;opacity:.8">
            <div>&bull; 3 Anos de Garantia de Hardware FORGE</div>
            <div>&bull; Transporte Blindado com Seguro Total Incluso</div>
          </div>
        </div>

        <div style="margin-bottom:40px">
          <div class="section-subtitle">Especificações de Hardware</div>
          <div class="hardware-list">
            <div class="hardware-item" style="animation-delay:.1s"><div class="hardware-label">PROCESSADOR</div><div class="hardware-value">${spec('cpu')}</div></div>
            <div class="hardware-item" style="animation-delay:.2s"><div class="hardware-label">PLACA DE VÍDEO</div><div class="hardware-value">${spec('gpu')}</div></div>
            <div class="hardware-item" style="animation-delay:.3s"><div class="hardware-label">PLACA MÃE</div><div class="hardware-value">${spec('motherboard')}</div></div>
            <div class="hardware-item" style="animation-delay:.4s"><div class="hardware-label">MEMÓRIA RAM</div><div class="hardware-value">${spec('ram')}</div></div>
            <div class="hardware-item" style="animation-delay:.5s"><div class="hardware-label">ARMAZENAMENTO</div><div class="hardware-value">${spec('storage')}</div></div>
            <div class="hardware-item" style="animation-delay:.6s"><div class="hardware-label">REFRIGERAÇÃO</div><div class="hardware-value">${spec('cooler')}</div></div>
            <div class="hardware-item" style="animation-delay:.7s"><div class="hardware-label">FONTE</div><div class="hardware-value">${spec('psu')}</div></div>
            <div class="hardware-item" style="animation-delay:.8s"><div class="hardware-label">GABINETE</div><div class="hardware-value">${spec('cabinet')}</div></div>
          </div>
        </div>

        <div>
          <div class="section-subtitle">Telemetria de Benchmarks</div>
          <div class="telemetria-container">
            <div class="telemetria-card"><span class="telemetria-label">CINEBENCH R23</span><div class="telemetria-value">${pc.benchmarks.cinebench || '—'}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">3DMARK SPY</span><div class="telemetria-value">${pc.benchmarks.timespy || '—'}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">CS2 / GAME FPS</span><div class="telemetria-value">${pc.benchmarks.fps || '—'}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">ESTABILIDADE</span><div class="telemetria-value">${pc.benchmarks.temp || '—'}</div></div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Listeners em vez de onclick inline: o id vem do banco e pode ter caracteres
  // que quebrariam a string do atributo.
  container.querySelectorAll('[data-acao="comprar"]').forEach(b =>
    b.addEventListener('click', () => { window.adicionarAoCarrinho(idMaquina); window.abrirCarrinho(); }));
  container.querySelectorAll('[data-acao="add-carrinho"]').forEach(b =>
    b.addEventListener('click', () => window.adicionarAoCarrinho(idMaquina)));
}

/* -----------------------------------------------------------------------------
   CARRINHO — ainda não migrado (é a próxima etapa grande).
   Stubs para os botões não estourarem TypeError enquanto isso.
   -------------------------------------------------------------------------- */
if (typeof window.adicionarAoCarrinho !== 'function') {
  window.adicionarAoCarrinho = function (id) {
    const pc = window.BANCO_DE_HARDWARE[id];
    window.showToast(`${pc ? pc.name : 'Build'} adicionada ao carrinho.`, 'success');
    console.warn('[FORGE] Carrinho ainda não migrado do script.js antigo.');
  };
}
if (typeof window.abrirCarrinho !== 'function') {
  window.abrirCarrinho = function () {
    window.showToast('O carrinho ainda não foi migrado.', 'error');
  };
}