/* =============================================================================
   js/pages/configurador.js | Quiz de Recomendação
   -----------------------------------------------------------------------------
   NOTA IMPORTANTE: a lógica de recomendação abaixo é CÓDIGO NOVO.
   Ela não foi portada de lugar nenhum — no site antigo o quiz chamava
   selectOption/nextStep/prevStep/finalizarQuizComModelos, mas nenhuma dessas
   funções chegou a ser escrita (0 ocorrências no script.js). O quiz antigo
   nunca funcionou.

   Os pesos em pontuarBuild() são uma DECISÃO DE NEGÓCIO. Revise-os.
   ============================================================================= */
'use strict';

window.respostasQuiz = [];

const TOTAL_PASSOS = 4;

/* -----------------------------------------------------------------------------
   NAVEGAÇÃO DO QUIZ
   -------------------------------------------------------------------------- */
window.selectOption = function (stepIndex, optionIndex, valor) {
  const stepEl = document.getElementById(`qstep${stepIndex}`);
  if (!stepEl) return;

  const options = stepEl.querySelectorAll('.quiz-option');
  if (!options[optionIndex]) return;

  options.forEach(opt => {
    opt.classList.remove('selected');
    opt.setAttribute('aria-pressed', 'false');
  });
  options[optionIndex].classList.add('selected');
  options[optionIndex].setAttribute('aria-pressed', 'true');

  window.respostasQuiz[stepIndex] = valor;

  // Libera o "Próximo" (o último passo usa outro id)
  const nextBtn = document.getElementById(`qnext${stepIndex}`) ||
                  document.getElementById('btn-solicitar-quiz');
  if (nextBtn) {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
  }
};

window.nextStep = function (nextIndex) {
  if (nextIndex >= TOTAL_PASSOS) return gerarRecomendacao();
  irParaPasso(nextIndex);
  for (let i = 0; i <= nextIndex; i++) {
    document.getElementById(`qd${i}`)?.classList.add('done');
  }
};

// prevStep NUNCA existiu no projeto antigo, apesar de o HTML chamá-la.
window.prevStep = function (prevIndex) {
  irParaPasso(prevIndex);
  for (let i = prevIndex + 1; i < TOTAL_PASSOS; i++) {
    document.getElementById(`qd${i}`)?.classList.remove('done');
  }
};

function irParaPasso(indice) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`qstep${indice}`)?.classList.add('active');

  const barra = document.querySelector('.quiz-progress');
  if (barra) barra.setAttribute('aria-valuenow', indice + 1);

  document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* -----------------------------------------------------------------------------
   PONTUAÇÃO  —  respostas: [uso, orcamento, prioridade, prazo]
     uso        : ia | 3d | dev | game
     orcamento  : low(<=8k) | mid(8-15k) | high(15-25k) | ultra(>25k)
     prioridade : gpu | cpu | balanced | ram
     prazo      : urgent | normal | flex | consult
   -------------------------------------------------------------------------- */
const FAIXAS_ORCAMENTO = {
  low:   [0,     8000],
  mid:   [8000,  15000],
  high:  [15000, 25000],
  ultra: [25000, Infinity],
};

const USO_PARA_PERFIL = { ia: 'workstation', '3d': 'workstation', dev: 'office', game: 'gaming' };

function ramEmGB(texto) {
  const m = String(texto || '').match(/(\d+)\s*GB/i);   // "16GB DDR5 5600MHz" -> 16
  return m ? Number(m[1]) : 0;
}

function scoreCinebench(pc) {
  return parseInt(String(pc.benchmarks?.cinebench || '').replace(/\D/g, ''), 10) || 0;
}

function temGpuDedicada(pc) {
  const gpu = String(pc.specs?.gpu || '').toLowerCase();
  return gpu !== '' && !gpu.includes('integrad');
}

window.pontuarBuild = function (pc, respostas) {
  const [uso, orcamento, prioridade, prazo] = respostas;
  let pontos = 0;
  const motivos = [];

  const valor = window.forgePrecoParaNumero(pc.price);

  // 1. ORÇAMENTO — peso maior, é o critério mais duro
  const [min, max] = FAIXAS_ORCAMENTO[orcamento] || [0, Infinity];
  if (valor >= min && valor <= max) {
    pontos += 50;
    motivos.push('dentro do seu orçamento');
  } else {
    const distancia = valor < min ? (min - valor) : (valor - max);
    pontos -= Math.min(45, distancia / 500);   // R$ 500 fora = -1 ponto
  }

  // 2. PERFIL DE USO
  if (window.forgeUsoDaBuild(pc) === USO_PARA_PERFIL[uso]) {
    pontos += 30;
    motivos.push('perfil de uso compatível');
  }

  // 3. PRIORIDADE DE PERFORMANCE
  const cine  = scoreCinebench(pc);
  const ramGB = ramEmGB(pc.specs?.ram);
  const gpuOk = temGpuDedicada(pc);

  if (prioridade === 'gpu' && gpuOk)          { pontos += 20; motivos.push('GPU dedicada'); }
  if (prioridade === 'cpu' && cine >= 20000)  { pontos += 20; motivos.push('CPU de alto multicore'); }
  if (prioridade === 'ram' && ramGB >= 32)    { pontos += 20; motivos.push(`${ramGB}GB de memória`); }
  if (prioridade === 'balanced' && gpuOk && cine >= 15000) {
    pontos += 15; motivos.push('conjunto equilibrado');
  }

  // 4. PRAZO
  if (prazo === 'urgent') {
    if (pc.estoque > 0) { pontos += 15; motivos.push('pronta entrega'); }
    else pontos -= 30;
  }

  return { pontos, motivos };
};

/* -----------------------------------------------------------------------------
   RESULTADO
   -------------------------------------------------------------------------- */
async function gerarRecomendacao() {
  await window.forgeCatalogoPronto;

  const secQuiz  = document.getElementById('configurador');
  const secRes   = document.getElementById('resultado-configurador');
  const container = document.getElementById('resultado-configurador-container');
  if (!secRes || !container) return;

  secQuiz.style.display = 'none';
  secRes.style.display  = 'block';
  container.innerHTML   = '';

  const ranking = Object.entries(window.BANCO_DE_HARDWARE)
    .map(([id, pc]) => ({ id, pc, ...window.pontuarBuild(pc, window.respostasQuiz) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 3);

  console.log('[FORGE] Respostas:', window.respostasQuiz);
  console.table(ranking.map(r => ({ id: r.id, pontos: Math.round(r.pontos), motivos: r.motivos.join(', ') })));

  if (ranking.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--color-gray);padding:40px">Catálogo indisponível.</p>`;
    return;
  }

  ranking.forEach(({ id, pc, motivos }, i) => {
    const cor    = window.forgeCorDaBuild(pc);
    const valor  = window.forgePrecoParaNumero(pc.price);
    const parcela = (valor / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const shortGpu = String(pc.specs.gpu || '').split(' ').slice(0, 3).join(' ')
      .replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
    const shortCpu = String(pc.specs.cpu || '').split(' ').slice(0, 3).join(' ')
      .replace('Intel Core ', '');

    // Mesmo markup do catálogo — é o que o vendas.css estiliza.
    const card = document.createElement('div');
    card.className = 'build-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="build-card-img ${cor === 'white' ? 'white-pc' : 'black-pc'}">
        <span class="build-badge">${i === 0 ? 'MELHOR MATCH' : pc.badge}</span>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}" loading="lazy">
      </div>
      <div class="build-card-body ecom-body">
        <div class="ecom-top">
          <div class="build-meta-specs">${shortGpu} &bull; ${shortCpu}</div>
          <div class="build-name">${pc.name}</div>
          <div class="ecom-stars" style="color:var(--color-blue);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;margin-top:5px">
            ${motivos.length ? '&#10003; ' + motivos.join(' &bull; ') : 'Opção alternativa'}
          </div>
        </div>
        <div class="ecom-bottom">
          <div class="ecom-price-block">
            <div class="build-price">${pc.price}</div>
            <div class="ecom-installments">em até <strong>10x de ${parcela}</strong> sem juros</div>
          </div>
          <button class="build-cta ecom-btn">VER DETALHES</button>
        </div>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `/produto?id=${encodeURIComponent(id)}`;
    });
    container.appendChild(card);
  });

  secRes.scrollIntoView({ behavior: 'smooth', block: 'start' });
}