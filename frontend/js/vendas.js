/* =============================================================================
   js/pages/vendas.js | Motor do Catálogo de Builds
   -----------------------------------------------------------------------------
   Gera o MESMO markup do script.js original, porque é esse markup que o
   vendas.css estiliza (.build-card-img, .build-badge, .pc-photo, .ecom-body,
   .build-meta-specs, .build-name, .ecom-price-block, .build-cta ...).

   A versão anterior inventava classes (.build-card-title, .build-card-content,
   .build-card-footer) que não existiam em CSS nenhum — por isso os cards
   apareciam como texto solto e desalinhado.
   ============================================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  await window.forgeCatalogoPronto;   // sem setTimeout: espera o catálogo de fato
  carregarCards();
});

window.carregarCards = function () {
  const container = document.getElementById('builds-container');
  if (!container) return;

  container.setAttribute('aria-busy', 'false');

  const ids = Object.keys(window.BANCO_DE_HARDWARE || {});

  if (ids.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--color-gray)">
        <p style="font-family:var(--font-mono);color:var(--color-blue);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Catálogo indisponível</p>
        <p>Nenhum sistema disponível no momento. Verifique o console.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  for (const id of ids) {
    const pc = window.BANCO_DE_HARDWARE[id];

    const uso    = window.forgeUsoDaBuild(pc);
    const faixa  = window.forgeFaixaDePreco(pc);
    const cor    = window.forgeCorDaBuild(pc);
    const valor  = window.forgePrecoParaNumero(pc.price);

    // Abrevia as specs, igual ao original
    const shortGpu = String(pc.specs.gpu || '')
      .split(' ').slice(0, 3).join(' ')
      .replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
    const shortCpu = String(pc.specs.cpu || '')
      .split(' ').slice(0, 3).join(' ')
      .replace('Intel Core ', '');

    const parcela = (valor / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const card = document.createElement('div');
    card.className = 'build-card';
    // Os filtros leem data-*, não classes. Era assim que o CSS/JS original funcionava.
    card.setAttribute('data-usage', uso);
    card.setAttribute('data-color', cor);
    card.setAttribute('data-price', faixa);
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <div class="build-card-img ${cor === 'white' ? 'white-pc' : 'black-pc'}">
        <span class="build-badge">${pc.badge}</span>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}" loading="lazy">
      </div>
      <div class="build-card-body ecom-body">
        <div class="ecom-top">
          <div class="build-meta-specs">${shortGpu} &bull; ${shortCpu}</div>
          <div class="build-name">${pc.name}</div>
          <div class="ecom-stars" style="color:#FFA41C;font-family:var(--font-mono);font-size:11px;letter-spacing:1px;margin-top:5px">
            SÉRIE LIMITADA <span class="ecom-reviews" style="color:var(--color-gray);font-size:11px;margin-left:5px">(+50 unidades)</span>
          </div>
        </div>
        <div class="ecom-bottom">
          <div class="ecom-price-block">
            <div class="build-price">${pc.price}</div>
            <div class="ecom-installments">em até <strong>10x de ${parcela}</strong> sem juros</div>
            <div class="ecom-shipping" style="color:#00a650;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;font-weight:700;margin-top:8px;letter-spacing:.5px">
              Frete grátis para Belo Horizonte e região
            </div>
          </div>
          <button class="build-cta ecom-btn">COMPRAR AGORA</button>
        </div>
      </div>
    `;

    // Card inteiro abre os detalhes...
    card.addEventListener('click', () => window.abrirDetalhesProduto(id));
    // ...mas o botão de compra não deve disparar isso junto.
    card.querySelector('.build-cta').addEventListener('click', (e) => {
      e.stopPropagation();
      window.solicitarVenda(id);
    });

    container.appendChild(card);
  }

  console.log(`[FORGE] ${ids.length} card(s) renderizado(s).`);
};

/* -----------------------------------------------------------------------------
   FILTROS — mecanismo original: compara atributos data-*, e usa
   removeProperty('display') para devolver o controle ao CSS (em vez de
   cravar display:flex e brigar com a folha de estilo).
   -------------------------------------------------------------------------- */
window.filtrarBuilds = function () {
  const uso   = document.getElementById('filter-usage').value;
  const cor   = document.getElementById('filter-color').value;
  const preco = document.getElementById('filter-price').value;

  document.querySelectorAll('.build-card').forEach(card => {
    const okUso   = (uso   === 'all' || card.getAttribute('data-usage') === uso);
    const okCor   = (cor   === 'all' || card.getAttribute('data-color') === cor);
    const okPreco = (preco === 'all' || card.getAttribute('data-price') === preco);

    if (okUso && okCor && okPreco) {
      card.style.removeProperty('display');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });
};

/* -----------------------------------------------------------------------------
   DETALHES — provisório.
   No site antigo isso abria a section #produto-detalhes (single-page).
   Nesta arquitetura ela ainda não tem página própria, então usamos o modal.
   -------------------------------------------------------------------------- */
window.abrirDetalhesProduto = function (id) {
  const pc = window.BANCO_DE_HARDWARE[id];
  const modal = document.getElementById('build-modal');
  if (!pc || !modal) return;

  document.getElementById('modal-build-name').textContent  = pc.name;
  document.getElementById('modal-build-specs').textContent =
    [pc.specs.cpu, pc.specs.gpu, pc.specs.ram].filter(Boolean).join(' · ');
  document.getElementById('modal-build-price').textContent = pc.price;

  modal.classList.add('show');
};

window.closeModal = function () {
  const modal = document.getElementById('build-modal');
  if (modal) modal.classList.remove('show');
};

window.solicitarVenda = function (id) {
  const pc = window.BANCO_DE_HARDWARE[id];
  if (!pc) return;
  window.showToast(`${pc.name} reservado! Um engenheiro FORGE entrará em contato.`, 'success');
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeModal();
});

/* =============================================================================
   js/pages/vendas.js | Motor do Catálogo de Builds
   -----------------------------------------------------------------------------
   Gera o MESMO markup do script.js original, porque é esse markup que o
   vendas.css estiliza (.build-card-img, .build-badge, .pc-photo, .ecom-body,
   .build-meta-specs, .build-name, .ecom-price-block, .build-cta ...).

   A versão anterior inventava classes (.build-card-title, .build-card-content,
   .build-card-footer) que não existiam em CSS nenhum — por isso os cards
   apareciam como texto solto e desalinhado.
   ============================================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  await window.forgeCatalogoPronto;   // sem setTimeout: espera o catálogo de fato
  carregarCards();
});

window.carregarCards = function () {
  const container = document.getElementById('builds-container');
  if (!container) return;

  container.setAttribute('aria-busy', 'false');

  const ids = Object.keys(window.BANCO_DE_HARDWARE || {});

  if (ids.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--color-gray)">
        <p style="font-family:var(--font-mono);color:var(--color-blue);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Catálogo indisponível</p>
        <p>Nenhum sistema disponível no momento. Verifique o console.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  for (const id of ids) {
    const pc = window.BANCO_DE_HARDWARE[id];

    const uso    = window.forgeUsoDaBuild(pc);
    const faixa  = window.forgeFaixaDePreco(pc);
    const cor    = window.forgeCorDaBuild(pc);
    const valor  = window.forgePrecoParaNumero(pc.price);

    // Abrevia as specs, igual ao original
    const shortGpu = String(pc.specs.gpu || '')
      .split(' ').slice(0, 3).join(' ')
      .replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
    const shortCpu = String(pc.specs.cpu || '')
      .split(' ').slice(0, 3).join(' ')
      .replace('Intel Core ', '');

    const parcela = (valor / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const card = document.createElement('div');
    card.className = 'build-card';
    // Os filtros leem data-*, não classes. Era assim que o CSS/JS original funcionava.
    card.setAttribute('data-usage', uso);
    card.setAttribute('data-color', cor);
    card.setAttribute('data-price', faixa);
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <div class="build-card-img ${cor === 'white' ? 'white-pc' : 'black-pc'}">
        <span class="build-badge">${pc.badge}</span>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}" loading="lazy">
      </div>
      <div class="build-card-body ecom-body">
        <div class="ecom-top">
          <div class="build-meta-specs">${shortGpu} &bull; ${shortCpu}</div>
          <div class="build-name">${pc.name}</div>
          <div class="ecom-stars" style="color:#FFA41C;font-family:var(--font-mono);font-size:11px;letter-spacing:1px;margin-top:5px">
            SÉRIE LIMITADA <span class="ecom-reviews" style="color:var(--color-gray);font-size:11px;margin-left:5px">(+50 unidades)</span>
          </div>
        </div>
        <div class="ecom-bottom">
          <div class="ecom-price-block">
            <div class="build-price">${pc.price}</div>
            <div class="ecom-installments">em até <strong>10x de ${parcela}</strong> sem juros</div>
            <div class="ecom-shipping" style="color:#00a650;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;font-weight:700;margin-top:8px;letter-spacing:.5px">
              Frete grátis para Belo Horizonte e região
            </div>
          </div>
          <button class="build-cta ecom-btn">COMPRAR AGORA</button>
        </div>
      </div>
    `;

    // Card inteiro abre os detalhes...
    card.addEventListener('click', () => window.abrirDetalhesProduto(id));
    // ...mas o botão de compra não deve disparar isso junto.
    card.querySelector('.build-cta').addEventListener('click', (e) => {
      e.stopPropagation();
      window.solicitarVenda(id);
    });

    container.appendChild(card);
  }

  console.log(`[FORGE] ${ids.length} card(s) renderizado(s).`);
};

/* -----------------------------------------------------------------------------
   FILTROS — mecanismo original: compara atributos data-*, e usa
   removeProperty('display') para devolver o controle ao CSS (em vez de
   cravar display:flex e brigar com a folha de estilo).
   -------------------------------------------------------------------------- */
window.filtrarBuilds = function () {
  const uso   = document.getElementById('filter-usage').value;
  const cor   = document.getElementById('filter-color').value;
  const preco = document.getElementById('filter-price').value;

  document.querySelectorAll('.build-card').forEach(card => {
    const okUso   = (uso   === 'all' || card.getAttribute('data-usage') === uso);
    const okCor   = (cor   === 'all' || card.getAttribute('data-color') === cor);
    const okPreco = (preco === 'all' || card.getAttribute('data-price') === preco);

    if (okUso && okCor && okPreco) {
      card.style.removeProperty('display');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });
};

/* -----------------------------------------------------------------------------
   DETALHES — agora navega para a página dedicada /produto?id=<build>
   -------------------------------------------------------------------------- */
window.abrirDetalhesProduto = function (id) {
  window.location.href = `/produto?id=${encodeURIComponent(id)}`;
};

window.solicitarVenda = function (id) {
  // "COMPRAR AGORA" no card leva direto para a página do produto
  window.abrirDetalhesProduto(id);
};