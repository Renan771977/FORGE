/* =============================================================================
   js/pages/benchmark.js | Comparador de Workstations
   -----------------------------------------------------------------------------
   Duas correções em relação ao original:

   1. ESTADO VAZIO. O script.js antigo pré-selecionava a primeira e a última
      máquina (index === 0 / length-1), contradizendo o próprio texto do
      veredito ("Selecione duas máquinas acima..."). Agora começa zerado.

   2. TRÊS MÉTRICAS. O HTML antigo tinha 3 cards (-cine, -3dm, -fps), mas o
      executarComparacao() só escrevia no -cine. Os outros dois ficavam
      travados em "0 pts" para sempre.

   E uma adição: a "Análise de Eficiência e Custo-Benefício" (#verdict-text-display)
   existia no HTML e no CSS, mas nenhuma linha de JS jamais escreveu nela.
   ============================================================================= */
'use strict';

const METRICAS = [
  { sufixo: 'cine', chave: 'cinebench', rotulo: 'render multicore' },
  { sufixo: '3dm',  chave: 'timespy',   rotulo: 'poder gráfico'    },
  { sufixo: 'fps',  chave: 'fps',       rotulo: 'taxa de quadros'  },
];

const TEXTO_INICIAL = 'Selecione duas máquinas acima para rodar a telemetria comparativa de workloads.';

document.addEventListener('DOMContentLoaded', async () => {
  await window.forgeCatalogoPronto;
  montarSeletoresComparador();
});

window.montarSeletoresComparador = function () {
  const selectA = document.getElementById('compare-pc-a');
  const selectB = document.getElementById('compare-pc-b');
  if (!selectA || !selectB) return;

  const ids = Object.keys(window.BANCO_DE_HARDWARE || {});

  const opcoes = ['<option value="">— Selecione uma máquina —</option>']
    .concat(ids.map(id => {
      const nome = window.BANCO_DE_HARDWARE[id].name;
      return `<option value="${id}">${nome}</option>`;
    }))
    .join('');

  selectA.innerHTML = opcoes;
  selectB.innerHTML = opcoes;

  // Nada pré-selecionado: value = '' nos dois.
  selectA.value = '';
  selectB.value = '';

  executarComparacao();
};

/* Extrai o número de "24000 pts" | "60 FPS" | "71°C" | "N/A" -> 0 */
function valorNumerico(texto) {
  const n = parseInt(String(texto ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

window.executarComparacao = function () {
  const idA = document.getElementById('compare-pc-a')?.value;
  const idB = document.getElementById('compare-pc-b')?.value;

  const pcA = idA ? window.BANCO_DE_HARDWARE[idA] : null;
  const pcB = idB ? window.BANCO_DE_HARDWARE[idB] : null;

  // Estado vazio / parcial: zera tudo e mantém o texto convite.
  if (!pcA || !pcB) {
    METRICAS.forEach(({ sufixo }) => {
      ['a', 'b'].forEach(lado => {
        const pc = lado === 'a' ? pcA : pcB;
        setTexto(`bar-name-${lado}-${sufixo}`, pc ? pc.name : `Máquina ${lado.toUpperCase()}`);
        setTexto(`bar-val-${lado}-${sufixo}`, '—');
        setLargura(`bar-fill-${lado}-${sufixo}`, 0);
      });
    });
    setTexto('verdict-text-display', TEXTO_INICIAL);
    return;
  }

  // Preenche as TRÊS métricas (o original só fazia a primeira)
  METRICAS.forEach(({ sufixo, chave }) => {
    const brutoA = pcA.benchmarks?.[chave];
    const brutoB = pcB.benchmarks?.[chave];
    const numA = valorNumerico(brutoA);
    const numB = valorNumerico(brutoB);
    const max  = Math.max(numA, numB, 1);

    setTexto(`bar-name-a-${sufixo}`, pcA.name);
    setTexto(`bar-name-b-${sufixo}`, pcB.name);
    setTexto(`bar-val-a-${sufixo}`, brutoA || 'não medido');
    setTexto(`bar-val-b-${sufixo}`, brutoB || 'não medido');
    setLargura(`bar-fill-a-${sufixo}`, (numA / max) * 100);
    setLargura(`bar-fill-b-${sufixo}`, (numB / max) * 100);
  });

  setTexto('verdict-text-display', gerarAnalise(pcA, pcB));
};

function setTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}
function setLargura(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${Math.max(0, Math.min(100, pct))}%`;
}

/* -----------------------------------------------------------------------------
   ANÁLISE DE EFICIÊNCIA E CUSTO-BENEFÍCIO
   Texto gerado a partir dos números reais do banco (não é uma chamada de LLM —
   é um motor de regras determinístico, então o mesmo par sempre dá o mesmo laudo).
   -------------------------------------------------------------------------- */
function gerarAnalise(pcA, pcB) {
  if (pcA === pcB) return 'As duas máquinas selecionadas são a mesma. Escolha modelos diferentes para comparar.';

  const precoA = window.forgePrecoParaNumero(pcA.price);
  const precoB = window.forgePrecoParaNumero(pcB.price);

  const partes = [];

  // 1. Quem ganha em quê
  const comparaveis = METRICAS
    .map(m => ({ ...m, a: valorNumerico(pcA.benchmarks?.[m.chave]), b: valorNumerico(pcB.benchmarks?.[m.chave]) }))
    .filter(m => m.a > 0 && m.b > 0);

  if (comparaveis.length === 0) {
    return `Não há telemetria comparável entre ${pcA.name} e ${pcB.name} — os benchmarks dessas máquinas ainda não foram medidos.`;
  }

  const vitA = comparaveis.filter(m => m.a > m.b);
  const vitB = comparaveis.filter(m => m.b > m.a);
  const lider = vitA.length >= vitB.length ? { pc: pcA, vits: vitA } : { pc: pcB, vits: vitB };

  if (lider.vits.length) {
    const maior = lider.vits.reduce((x, y) => {
      const dx = Math.abs(x.a - x.b) / Math.min(x.a, x.b);
      const dy = Math.abs(y.a - y.b) / Math.min(y.a, y.b);
      return dy > dx ? y : x;
    });
    const delta = Math.round((Math.max(maior.a, maior.b) / Math.min(maior.a, maior.b) - 1) * 100);
    partes.push(`A ${lider.pc.name} lidera em ${lider.vits.length} de ${comparaveis.length} workloads medidos, com destaque em ${maior.rotulo} (+${delta}%).`);
  } else {
    partes.push(`${pcA.name} e ${pcB.name} empatam nos workloads medidos.`);
  }

  // 2. Diferença de preço
  if (precoA > 0 && precoB > 0 && precoA !== precoB) {
    const cara = precoA > precoB ? pcA : pcB;
    const barata = precoA > precoB ? pcB : pcA;
    const dif = Math.abs(precoA - precoB);
    const pct = Math.round((Math.max(precoA, precoB) / Math.min(precoA, precoB) - 1) * 100);
    partes.push(`A ${cara.name} custa ${dif.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a mais (+${pct}%) que a ${barata.name}.`);
  }

  // 3. Eficiência: pontos de render por R$ 1.000
  const cine = comparaveis.find(m => m.chave === 'cinebench');
  if (cine && precoA > 0 && precoB > 0) {
    const efA = cine.a / (precoA / 1000);
    const efB = cine.b / (precoB / 1000);
    const maisEficiente = efA > efB ? pcA : pcB;
    const ganho = Math.round((Math.max(efA, efB) / Math.min(efA, efB) - 1) * 100);
    partes.push(`Em pontos de render por R$ 1.000 investidos, a ${maisEficiente.name} entrega ${Math.round(Math.max(efA, efB))} contra ${Math.round(Math.min(efA, efB))} — ${ganho}% mais eficiente por real.`);
  }

  // 4. Térmico, se houver
  const tA = valorNumerico(pcA.benchmarks?.temp);
  const tB = valorNumerico(pcB.benchmarks?.temp);
  if (tA > 0 && tB > 0 && tA !== tB) {
    const fria = tA < tB ? pcA : pcB;
    partes.push(`No teste térmico sob carga, a ${fria.name} se mantém ${Math.abs(tA - tB)}°C mais fria.`);
  }

  // 5. Recomendação
  const precoLider = window.forgePrecoParaNumero(lider.pc.price);
  const outra = lider.pc === pcA ? pcB : pcA;
  if (lider.vits.length === comparaveis.length && precoLider <= window.forgePrecoParaNumero(outra.price)) {
    partes.push(`Veredito: a ${lider.pc.name} vence em tudo e não custa mais — escolha direta.`);
  } else if (lider.vits.length) {
    partes.push(`Veredito: a ${lider.pc.name} se justifica se o seu workload for exigente; caso contrário, a ${outra.name} tem melhor custo-benefício.`);
  }

  return partes.join(' ');
}