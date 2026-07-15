/* =============================================================================
   js/pages/checkout.js | Checkout em 3 etapas
   -----------------------------------------------------------------------------
   Entrega → Pagamento → Revisão, no padrão de varejo.
   O modelo de pedido e os status vivem no global.js (criarPedido, STATUS_PEDIDO).

   O checkout antigo era um modal de 2 etapas cujo HTML se perdeu junto com o
   index.html monolítico. Isto é reconstrução, não porte.
   ============================================================================= */
'use strict';

const DESCONTO_PIX = 0.10;
const MAX_PARCELAS = 10;
const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const estado = {
  etapa: 1,                 // 1 entrega | 2 pagamento | 3 revisão
  entrega: {},
  pagamento: { metodo: 'pix', parcelas: 1 },
  itens: [],
  subtotal: 0,
};

document.addEventListener('DOMContentLoaded', async () => {
  const alvo = document.getElementById('ck-conteudo');
  if (!alvo) return;

  if (!localStorage.getItem('forge_token')) {
    sessionStorage.setItem('forge_aviso', 'Faça login para finalizar seu pedido.');
    window.location.href = '/cadastro';
    return;
  }

  await window.forgeCatalogoPronto;

  // Monta o snapshot do carrinho. Deste ponto em diante o checkout trabalha
  // com esta cópia — se o catálogo mudar no meio, o preço mostrado não dança.
  estado.itens = window.getCarrinhoAgrupado()
    .map(({ id, qtd }) => {
      const pc = window.BANCO_DE_HARDWARE[id];
      if (!pc) return null;
      return { id, nome: pc.name, qtd, unitario: window.forgePrecoParaNumero(pc.price), img: pc.img };
    })
    .filter(Boolean);

  if (estado.itens.length === 0) {
    window.location.href = '/carrinho';
    return;
  }

  estado.subtotal = estado.itens.reduce((s, i) => s + i.unitario * i.qtd, 0);

  // Pré-preenche com o que já sabemos do cliente
  const u = window.usuarioAtivo || {};
  estado.entrega.nome = u.nome || '';
  estado.entrega.telefone = u.whatsapp || '';

  render();
});

/* -------------------------------------------------------------------------- */
function render() {
  const alvo = document.getElementById('ck-conteudo');
  alvo.innerHTML = `
    ${htmlStepper()}
    <div class="ck-grid">
      <div>${[htmlEntrega, htmlPagamento, htmlRevisao][estado.etapa - 1]()}</div>
      ${htmlResumo()}
    </div>`;
  ligarEventos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function htmlStepper() {
  const passos = ['Entrega', 'Pagamento', 'Revisão'];
  return `
    <div class="ck-stepper" role="list">
      ${passos.map((nome, i) => {
        const n = i + 1;
        const cls = n < estado.etapa ? 'ck-step--done' : n === estado.etapa ? 'ck-step--atual' : '';
        return `
          <div class="ck-step ${cls}" role="listitem" ${n === estado.etapa ? 'aria-current="step"' : ''}>
            <span class="ck-step__dot">${n < estado.etapa ? '✓' : n}</span>
            <span class="ck-step__label">${nome}</span>
          </div>`;
      }).join('')}
    </div>`;
}

/* ---------- ETAPA 1: ENTREGA ---------- */
function htmlEntrega() {
  const e = estado.entrega;
  const campo = (id, rotulo, valor = '', extra = '') => `
    <div class="ck-campo">
      <label for="ck-${id}">${rotulo}</label>
      <input id="ck-${id}" value="${valor || ''}" ${extra}>
      <span class="ck-campo__erro" id="erro-${id}"></span>
    </div>`;

  return `
    <div class="ck-painel">
      <h3 class="ck-painel__titulo">Endereço de Entrega</h3>
      <p class="ck-painel__sub">Sua máquina viaja em transporte blindado com seguro total. Frete grátis para todo o Brasil.</p>

      <div class="ck-form-row ck-form-row--2">
        ${campo('nome', 'Nome completo', e.nome, 'autocomplete="name"')}
        ${campo('telefone', 'Telefone / WhatsApp', e.telefone, 'inputmode="tel" placeholder="(31) 9 9999-9999"')}
      </div>

      <div class="ck-form-row ck-form-row--cep">
        ${campo('cep', 'CEP', e.cep, 'inputmode="numeric" maxlength="9" placeholder="00000-000"')}
        <p class="ck-cep-status" id="ck-cep-status">Digite o CEP para preencher o endereço.</p>
      </div>

      <div class="ck-form-row ck-form-row--2" style="grid-template-columns:1fr 140px">
        ${campo('logradouro', 'Endereço', e.logradouro, 'autocomplete="street-address"')}
        ${campo('numero', 'Número', e.numero, 'inputmode="numeric"')}
      </div>

      <div class="ck-form-row ck-form-row--2">
        ${campo('complemento', 'Complemento (opcional)', e.complemento, 'placeholder="Apto, bloco..."')}
        ${campo('bairro', 'Bairro', e.bairro)}
      </div>

      <div class="ck-form-row ck-form-row--2" style="grid-template-columns:1fr 90px">
        ${campo('cidade', 'Cidade', e.cidade)}
        ${campo('uf', 'UF', e.uf, 'maxlength="2" style="text-transform:uppercase"')}
      </div>

      <div class="ck-nav">
        <button class="ck-nav__voltar" data-acao="ir-carrinho">← Voltar ao carrinho</button>
        <button class="btn-primary" data-acao="ir-pagamento">Continuar para Pagamento</button>
      </div>
    </div>`;
}

/* ---------- ETAPA 2: PAGAMENTO ---------- */
function htmlPagamento() {
  const m = estado.pagamento.metodo;
  const noPix = estado.subtotal * (1 - DESCONTO_PIX);

  const parcelas = Array.from({ length: MAX_PARCELAS }, (_, i) => {
    const n = i + 1;
    const v = estado.subtotal / n;
    return `<option value="${n}" ${estado.pagamento.parcelas === n ? 'selected' : ''}>${n}× de ${brl(v)} sem juros</option>`;
  }).join('');

  return `
    <div class="ck-painel">
      <h3 class="ck-painel__titulo">Forma de Pagamento</h3>
      <p class="ck-painel__sub">Escolha como prefere pagar. O pedido só entra em triagem após a confirmação.</p>

      <div class="ck-metodos">
        <div class="ck-metodo ${m === 'pix' ? 'ck-metodo--ativo' : ''}" data-metodo="pix" role="button" tabindex="0">
          <span class="ck-metodo__radio"></span>
          <span class="ck-metodo__info">
            <span class="ck-metodo__nome">PIX</span>
            <span class="ck-metodo__desc">Aprovação em minutos · ${brl(noPix)}</span>
          </span>
          <span class="ck-metodo__tag">10% OFF</span>
        </div>
        <div class="ck-metodo__form ${m === 'pix' ? 'show' : ''}">
          <div class="ck-aviso ck-aviso--pix">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a650" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>O código PIX será gerado na confirmação. Você tem <strong>30 minutos</strong> para pagar antes do pedido expirar.</span>
          </div>
        </div>

        <div class="ck-metodo ${m === 'cartao' ? 'ck-metodo--ativo' : ''}" data-metodo="cartao" role="button" tabindex="0">
          <span class="ck-metodo__radio"></span>
          <span class="ck-metodo__info">
            <span class="ck-metodo__nome">Cartão de Crédito</span>
            <span class="ck-metodo__desc">Em até ${MAX_PARCELAS}× sem juros · aprovação imediata</span>
          </span>
        </div>
        <div class="ck-metodo__form ${m === 'cartao' ? 'show' : ''}">
          <div class="ck-form-row">
            <div class="ck-campo">
              <label for="ck-cartao-num">Número do cartão</label>
              <input id="ck-cartao-num" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" autocomplete="cc-number">
              <span class="ck-campo__erro" id="erro-cartao-num"></span>
            </div>
          </div>
          <div class="ck-form-row ck-form-row--3">
            <div class="ck-campo">
              <label for="ck-cartao-val">Validade</label>
              <input id="ck-cartao-val" maxlength="5" placeholder="MM/AA" autocomplete="cc-exp">
              <span class="ck-campo__erro" id="erro-cartao-val"></span>
            </div>
            <div class="ck-campo">
              <label for="ck-cartao-cvv">CVV</label>
              <input id="ck-cartao-cvv" inputmode="numeric" maxlength="4" placeholder="123" autocomplete="cc-csc">
              <span class="ck-campo__erro" id="erro-cartao-cvv"></span>
            </div>
            <div class="ck-campo">
              <label for="ck-parcelas">Parcelas</label>
              <select id="ck-parcelas">${parcelas}</select>
            </div>
          </div>
          <div class="ck-form-row">
            <div class="ck-campo">
              <label for="ck-cartao-nome">Nome impresso no cartão</label>
              <input id="ck-cartao-nome" placeholder="Como está no cartão" autocomplete="cc-name">
              <span class="ck-campo__erro" id="erro-cartao-nome"></span>
            </div>
          </div>
        </div>

        <div class="ck-metodo ${m === 'boleto' ? 'ck-metodo--ativo' : ''}" data-metodo="boleto" role="button" tabindex="0">
          <span class="ck-metodo__radio"></span>
          <span class="ck-metodo__info">
            <span class="ck-metodo__nome">Boleto Bancário</span>
            <span class="ck-metodo__desc">Compensa em até 3 dias úteis</span>
          </span>
        </div>
        <div class="ck-metodo__form ${m === 'boleto' ? 'show' : ''}">
          <div class="ck-aviso ck-aviso--boleto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffbd2e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>
            </svg>
            <span>O pedido só entra na fila de montagem após a compensação. Se a build esgotar nesse período, devolvemos o valor integral.</span>
          </div>
        </div>
      </div>

      <div class="ck-nav">
        <button class="ck-nav__voltar" data-acao="voltar-entrega">← Voltar</button>
        <button class="btn-primary" data-acao="ir-revisao">Revisar Pedido</button>
      </div>
    </div>`;
}

/* ---------- ETAPA 3: REVISÃO ---------- */
function htmlRevisao() {
  const e = estado.entrega;
  const p = estado.pagamento;

  const rotuloPgto = {
    pix:    `PIX — ${brl(estado.subtotal * (1 - DESCONTO_PIX))} (10% de desconto)`,
    cartao: `Cartão de crédito •••• ${p.final || '____'} — ${p.parcelas}× de ${brl(estado.subtotal / p.parcelas)}`,
    boleto: `Boleto bancário — ${brl(estado.subtotal)}`,
  }[p.metodo];

  return `
    <div class="ck-painel">
      <h3 class="ck-painel__titulo">Revise seu Pedido</h3>
      <p class="ck-painel__sub">Confira tudo antes de confirmar. Depois disso, sua máquina entra na nossa fila.</p>

      <div class="ck-revisao-bloco">
        <div class="ck-revisao-bloco__topo">
          <span class="ck-revisao-bloco__lbl">Entrega</span>
          <button class="ck-revisao-bloco__editar" data-acao="voltar-entrega">Editar</button>
        </div>
        <p>
          <strong>${e.nome}</strong> · ${e.telefone}<br>
          ${e.logradouro}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ''}<br>
          ${e.bairro} · ${e.cidade}/${e.uf} · CEP ${e.cep}
        </p>
      </div>

      <div class="ck-revisao-bloco">
        <div class="ck-revisao-bloco__topo">
          <span class="ck-revisao-bloco__lbl">Pagamento</span>
          <button class="ck-revisao-bloco__editar" data-acao="voltar-pagamento">Editar</button>
        </div>
        <p>${rotuloPgto}</p>
      </div>

      <div class="ck-revisao-bloco">
        <div class="ck-revisao-bloco__topo">
          <span class="ck-revisao-bloco__lbl">${estado.itens.length} ${estado.itens.length === 1 ? 'máquina' : 'máquinas'}</span>
          <button class="ck-revisao-bloco__editar" data-acao="ir-carrinho">Editar</button>
        </div>
        <div class="ck-revisao-itens">
          ${estado.itens.map(i => `
            <div class="ck-revisao-item">
              <span class="ck-revisao-item__img"><img src="${i.img}" alt="${i.nome}"></span>
              <span>
                <span class="ck-revisao-item__nome">${i.nome}</span><br>
                <span class="ck-revisao-item__qtd">Qtd: ${i.qtd}</span>
              </span>
              <span class="ck-revisao-item__preco">${brl(i.unitario * i.qtd)}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="ck-nav">
        <button class="ck-nav__voltar" data-acao="voltar-pagamento">← Voltar</button>
        <button class="btn-primary" data-acao="confirmar" id="btn-confirmar">Confirmar Pedido</button>
      </div>
    </div>`;
}

/* ---------- Resumo lateral ---------- */
function htmlResumo() {
  const total = estado.pagamento.metodo === 'pix'
    ? estado.subtotal * (1 - DESCONTO_PIX)
    : estado.subtotal;

  return `
    <aside class="cart-resumo">
      <p class="cart-resumo__titulo">Resumo</p>
      ${estado.itens.map(i => `
        <div class="cart-resumo__linha">
          <span>${i.qtd}× ${i.nome}</span>
          <strong>${brl(i.unitario * i.qtd)}</strong>
        </div>`).join('')}
      <div class="cart-resumo__linha"><span>Frete</span><strong style="color:#00a650">Grátis</strong></div>
      ${estado.pagamento.metodo === 'pix'
        ? `<div class="cart-resumo__linha cart-resumo__linha--pix"><span>Desconto PIX</span><strong>−${brl(estado.subtotal * DESCONTO_PIX)}</strong></div>`
        : ''}
      <div class="cart-resumo__divisor"></div>
      <div class="cart-resumo__total">
        <span class="cart-resumo__total-lbl">Total</span>
        <span class="cart-resumo__total-val">${brl(total)}</span>
      </div>
      <p class="cart-resumo__nota">Transporte blindado · Garantia FORGE de 3 anos</p>
    </aside>`;
}

/* -------------------------------------------------------------------------- */
function ligarEventos() {
  document.querySelectorAll('[data-acao]').forEach(el => {
    el.addEventListener('click', () => {
      const a = el.dataset.acao;
      if (a === 'ir-carrinho')     window.location.href = '/carrinho';
      if (a === 'ir-pagamento')    { if (validarEntrega()) { estado.etapa = 2; render(); } }
      if (a === 'voltar-entrega')  { estado.etapa = 1; render(); }
      if (a === 'ir-revisao')      { if (validarPagamento()) { estado.etapa = 3; render(); } }
      if (a === 'voltar-pagamento'){ estado.etapa = 2; render(); }
      if (a === 'confirmar')       confirmarPedido();
    });
  });

  document.querySelectorAll('[data-metodo]').forEach(el => {
    el.addEventListener('click', () => {
      estado.pagamento.metodo = el.dataset.metodo;
      guardarEntradaPagamento();
      render();
    });
  });

  ligarMascaras();

  const cep = document.getElementById('ck-cep');
  if (cep) cep.addEventListener('blur', buscarCep);
}

/* ---------- Máscaras ---------- */
function ligarMascaras() {
  const mascara = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { el.value = fn(el.value); });
  };

  mascara('ck-cep', v => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2'));
  mascara('ck-telefone', v => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/[-\s()]*$/, '');
    return d.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4').replace(/[-\s()]*$/, '');
  });
  mascara('ck-cartao-num', v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
  mascara('ck-cartao-val', v => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2'));
  mascara('ck-cartao-cvv', v => v.replace(/\D/g, '').slice(0, 4));
  mascara('ck-uf', v => v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase());
}

/* ---------- CEP via ViaCEP ---------- */
async function buscarCep() {
  const campo = document.getElementById('ck-cep');
  const status = document.getElementById('ck-cep-status');
  if (!campo || !status) return;

  const cep = campo.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  status.className = 'ck-cep-status';
  status.textContent = 'Buscando endereço...';

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await res.json();

    if (d.erro) {
      status.className = 'ck-cep-status ck-cep-status--erro';
      status.textContent = 'CEP não encontrado. Preencha manualmente.';
      return;
    }

    // Preenche sem apagar o que o cliente já tinha digitado
    const setar = (id, valor) => {
      const el = document.getElementById(id);
      if (el && valor) el.value = valor;
    };
    setar('ck-logradouro', d.logradouro);
    setar('ck-bairro', d.bairro);
    setar('ck-cidade', d.localidade);
    setar('ck-uf', d.uf);

    status.className = 'ck-cep-status ck-cep-status--ok';
    status.textContent = `${d.localidade}/${d.uf} · frete grátis`;
    document.getElementById('ck-numero')?.focus();
  } catch {
    // ViaCEP fora do ar não pode travar a venda
    status.className = 'ck-cep-status ck-cep-status--erro';
    status.textContent = 'Não foi possível buscar o CEP. Preencha manualmente.';
  }
}

/* ---------- Validação ---------- */
function erro(id, msg) {
  const campo = document.getElementById(`ck-${id}`);
  const alvo  = document.getElementById(`erro-${id}`);
  if (campo) campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (alvo)  { alvo.textContent = msg || ''; alvo.classList.toggle('show', !!msg); }
  return !msg;
}

function validarEntrega() {
  const v = (id) => (document.getElementById(`ck-${id}`)?.value || '').trim();
  let ok = true;

  ok = erro('nome', v('nome').length < 3 ? 'Informe o nome completo.' : '') && ok;
  ok = erro('telefone', v('telefone').replace(/\D/g, '').length < 10 ? 'Telefone incompleto.' : '') && ok;
  ok = erro('cep', v('cep').replace(/\D/g, '').length !== 8 ? 'CEP inválido.' : '') && ok;
  ok = erro('logradouro', !v('logradouro') ? 'Informe o endereço.' : '') && ok;
  ok = erro('numero', !v('numero') ? 'Informe o número.' : '') && ok;
  ok = erro('bairro', !v('bairro') ? 'Informe o bairro.' : '') && ok;
  ok = erro('cidade', !v('cidade') ? 'Informe a cidade.' : '') && ok;
  ok = erro('uf', v('uf').length !== 2 ? 'UF inválida.' : '') && ok;

  if (ok) {
    estado.entrega = {
      nome: v('nome'), telefone: v('telefone'), cep: v('cep'),
      logradouro: v('logradouro'), numero: v('numero'), complemento: v('complemento'),
      bairro: v('bairro'), cidade: v('cidade'), uf: v('uf'),
    };
  } else {
    window.showToast('Confira os campos destacados.', 'error');
  }
  return ok;
}

function guardarEntradaPagamento() {
  const p = document.getElementById('ck-parcelas');
  if (p) estado.pagamento.parcelas = Number(p.value) || 1;
}

function validarPagamento() {
  guardarEntradaPagamento();

  if (estado.pagamento.metodo !== 'cartao') {
    estado.pagamento.parcelas = 1;
    return true;
  }

  const v = (id) => (document.getElementById(`ck-${id}`)?.value || '').trim();
  const num = v('cartao-num').replace(/\s/g, '');
  let ok = true;

  ok = erro('cartao-num', num.length !== 16 ? 'Número do cartão incompleto.' : '') && ok;
  ok = erro('cartao-val', !validadeOk(v('cartao-val')) ? 'Validade inválida ou vencida.' : '') && ok;
  ok = erro('cartao-cvv', v('cartao-cvv').length < 3 ? 'CVV incompleto.' : '') && ok;
  ok = erro('cartao-nome', v('cartao-nome').length < 3 ? 'Informe o nome do cartão.' : '') && ok;

  if (ok) {
    // Guardamos APENAS os 4 últimos dígitos. Número completo e CVV nunca são
    // persistidos — nem no localStorage, nem em lugar nenhum.
    estado.pagamento.final = num.slice(-4);
  } else {
    window.showToast('Confira os dados do cartão.', 'error');
  }
  return ok;
}

function validadeOk(texto) {
  const m = texto.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  return fim >= new Date();
}

/* ---------- Confirmação ---------- */
function confirmarPedido() {
  const btn = document.getElementById('btn-confirmar');
  if (btn) { btn.disabled = true; btn.textContent = 'PROCESSANDO...'; }

  const total = estado.pagamento.metodo === 'pix'
    ? estado.subtotal * (1 - DESCONTO_PIX)
    : estado.subtotal;

  const pedido = window.criarPedido({
    itens: estado.itens,
    entrega: estado.entrega,
    pagamento: estado.pagamento,
    subtotal: estado.subtotal,
    total,
  });

  window.limparCarrinho();

  const st = window.STATUS_PEDIDO[pedido.status];
  document.getElementById('ck-conteudo').innerHTML = `
    <div class="ck-sucesso">
      <div class="ck-sucesso__icone">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00a650" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <h3 class="ck-sucesso__titulo">Pedido Confirmado</h3>
      <p class="ck-sucesso__sub">${st.nota}</p>
      <div class="ck-sucesso__id">${pedido.id}</div>
      <p class="ck-sucesso__sub" style="margin-bottom:26px">
        Acompanhe cada etapa — da triagem ao benchmark — na aba <strong>Meus Pedidos</strong> do seu Laboratório.
      </p>
      <div class="ck-sucesso__acoes">
        <a class="btn-primary" href="/cliente">Ver meus pedidos</a>
        <a class="btn-ghost" href="/vendas">Continuar comprando</a>
      </div>
    </div>`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}