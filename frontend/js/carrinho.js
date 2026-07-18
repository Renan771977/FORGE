/* =============================================================================
   js/pages/carrinho.js | Página do Carrinho
   -----------------------------------------------------------------------------
   O estado do carrinho vive no global.js (adicionarAoCarrinho, getCarrinho...).
   Esta página só desenha. Assim o badge da nav funciona em todo o site sem
   precisar carregar este arquivo.
   ============================================================================= */
'use strict';

const DESCONTO_PIX = 0.10;
const MAX_PARCELAS = 10;

const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

document.addEventListener('DOMContentLoaded', async () => {
  const alvo = document.getElementById('cart-conteudo');
  if (!alvo) return;

  // O carrinho exige conta — mesma regra do script.js original.
  if (!localStorage.getItem('forge_token')) {
    sessionStorage.setItem('forge_aviso', 'Faça login para acessar seu carrinho.');
    window.location.href = '/cadastro';
    return;
  }

  await window.forgeCatalogoPronto;   // precisa do BANCO_DE_HARDWARE p/ nome, preço, imagem
  render();
});

// Redesenha sozinho quando o carrinho muda (inclusive vindo de outra aba)
document.addEventListener('forge:carrinho-mudou', render);

function render() {
  const alvo = document.getElementById('cart-conteudo');
  if (!alvo) return;

  const itens = window.getCarrinhoAgrupado();

  if (itens.length === 0) return alvo.innerHTML = htmlVazio();

  // Uma build no carrinho que sumiu do catálogo (foi despublicada) não pode
  // travar a página nem entrar no total.
  const validos = [];
  itens.forEach(({ id, qtd }) => {
    const pc = window.BANCO_DE_HARDWARE[id];
    if (pc) validos.push({ id, qtd, pc });
    else {
      console.warn(`[FORGE] "${id}" não existe mais no catálogo. Removido do carrinho.`);
      window.removerLinhaDoCarrinho(id);
    }
  });

  if (validos.length === 0) return alvo.innerHTML = htmlVazio();

  const subtotal = validos.reduce((s, { pc, qtd }) => s + window.forgePrecoParaNumero(pc.price) * qtd, 0);
  const unidades = validos.reduce((s, { qtd }) => s + qtd, 0);

  alvo.innerHTML = `
    <div class="cart-layout-grid">
      <div class="cart-lista">
        ${validos.map(htmlItem).join('')}
      </div>
      ${htmlResumo(subtotal, unidades)}
    </div>`;

  ligarEventos();
}

function htmlItem({ id, qtd, pc }) {
  const unitario = window.forgePrecoParaNumero(pc.price);
  const specs = [pc.specs.cpu, pc.specs.gpu, pc.specs.ram].filter(Boolean).join(' · ');
  const noLimite = qtd >= pc.estoque;

  return `
    <article class="cart-item" data-id="${id}">
      <div class="cart-item__img">
        <img src="${pc.img}" alt="${pc.name}" loading="lazy">
      </div>

      <div class="cart-item__info">
        <p class="cart-item__badge">${pc.badge}</p>
        <h3 class="cart-item__nome">${pc.name}</h3>
        <p class="cart-item__specs" title="${specs}">${specs}</p>
      </div>

      <div class="cart-item__direita">
        <p class="cart-item__preco">${brl(unitario * qtd)}</p>
        ${qtd > 1 ? `<p class="cart-item__unit">${qtd} × ${brl(unitario)}</p>` : ''}

        <div class="cart-qtd">
          <button class="cart-qtd__btn" data-acao="menos" data-id="${id}" aria-label="Remover uma unidade">−</button>
          <span class="cart-qtd__valor">${qtd}</span>
          <button class="cart-qtd__btn" data-acao="mais" data-id="${id}" aria-label="Adicionar uma unidade"
                  ${noLimite ? 'disabled title="Limite do estoque"' : ''}>+</button>
        </div>

        <button class="cart-item__remover" data-acao="remover" data-id="${id}">Remover</button>
      </div>
    </article>`;
}

function htmlResumo(subtotal, unidades) {
  const noPix   = subtotal * (1 - DESCONTO_PIX);
  const parcela = subtotal / MAX_PARCELAS;

  return `
    <aside class="cart-resumo">
      <p class="cart-resumo__titulo">Resumo do Pedido</p>

      <div class="cart-resumo__linha">
        <span>${unidades} ${unidades === 1 ? 'máquina' : 'máquinas'}</span>
        <strong>${brl(subtotal)}</strong>
      </div>
      <div class="cart-resumo__linha">
        <span>Frete</span>
        <strong style="color:#00a650">Grátis</strong>
      </div>
      <div class="cart-resumo__linha cart-resumo__linha--pix">
        <span>No PIX (−10%)</span>
        <strong>${brl(noPix)}</strong>
      </div>

      <div class="cart-resumo__divisor"></div>

      <div class="cart-resumo__total">
        <span class="cart-resumo__total-lbl">Total</span>
        <span class="cart-resumo__total-val">${brl(subtotal)}</span>
      </div>
      <p class="cart-resumo__parcela">ou até <strong>${MAX_PARCELAS}× de ${brl(parcela)}</strong> sem juros</p>

      <button class="btn-primary cart-resumo__cta" id="btn-checkout">Finalizar Pedido</button>
      <button class="btn-ghost cart-resumo__cta" onclick="window.location.href='/vendas'">Continuar Comprando</button>

      <p class="cart-resumo__nota">
        Transporte blindado com seguro total · 3 anos de garantia FORGE
      </p>
    </aside>`;
}

function htmlVazio() {
  return `
    <div class="cart-vazio">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <h3 class="cart-vazio__titulo">Seu carrinho está vazio</h3>
      <p class="cart-vazio__sub">Nenhum projeto guardado ainda. Que tal começar pelo catálogo?</p>
      <a class="btn-primary" href="/vendas">Ver builds prontos</a>
    </div>`;
}

function ligarEventos() {
  document.querySelectorAll('[data-acao]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { acao, id } = btn.dataset;
      if (acao === 'mais')    window.adicionarAoCarrinho(id);
      if (acao === 'menos')   window.removerDoCarrinho(id);
      if (acao === 'remover') window.removerLinhaDoCarrinho(id);
      // o evento forge:carrinho-mudou dispara o render()
    });
  });

  document.getElementById('btn-checkout')?.addEventListener('click', () => {
    window.location.href = '/checkout';
  });
}