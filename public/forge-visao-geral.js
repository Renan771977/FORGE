/* =============================================================================
   FORGE Performance Computing
   forge-visao-geral.js  |  Módulos de Marketing e Inovação — Dashboard VIP
   ============================================================================= */

'use strict';

const _originalInitLabListeners = window._initLabListeners;

window._initLabListeners = function () {
  if (typeof _originalInitLabListeners === 'function') _originalInitLabListeners();
  _injetarModulosVisaoGeral();
};

function _injetarModulosVisaoGeral() {
  const abaVG = document.getElementById('aba-visao-geral');
  if (!abaVG) return;

  const colMain    = abaVG.querySelector('.lab__col-main');
  const colSidebar = abaVG.querySelector('.lab__col-sidebar');

  if (!colMain || !colSidebar) return;

  // -- Coluna Principal: Parcerias Estratégicas --
  if (!document.getElementById('modulo-perks')) {
    const wrapPerks = document.createElement('div');
    wrapPerks.id        = 'modulo-perks';
    wrapPerks.innerHTML = _htmlModuloPerks();
    colMain.appendChild(wrapPerks);
  }

  // -- Coluna Lateral: Terminal Volta a Ser Fixo e Permanente --
  if (!document.getElementById('modulo-terminal')) {
    const wrapTerm = document.createElement('div');
    wrapTerm.id        = 'modulo-terminal';
    wrapTerm.innerHTML = _htmlModuloTerminal();
    colSidebar.appendChild(wrapTerm);
    _iniciarTerminal();
  }
}


// =============================================================================
// MÓDULO 1 — TERMINAL DE RECOMENDAÇÕES (CADÊNCIA DE 1 MINUTO)
// =============================================================================

const _TERM_POOL = [
  { text: '[DICA] Limpe a poeira do gabinete a cada 6 meses para manter as peças frias e silenciosas.', cls: 'ft-sys' },
  { text: '[CUIDADO] Evite deixar o computador encostado na parede para não bloquear as saídas de ar.', cls: 'ft-warn' },
  { text: '[OTIMIZAÇÃO] Reinicie o PC pelo menos uma vez por semana para limpar a memória e evitar travamentos.', cls: 'ft-info' },
  { text: '[SEGURANÇA] Mantenha o Windows sempre atualizado para garantir a proteção dos seus arquivos.', cls: 'ft-sys' },
  { text: '[ENERGIA] Use um filtro de linha de qualidade para proteger sua máquina contra quedas de luz.', cls: 'ft-warn' },
  { text: '[INICIALIZAÇÃO] Evite deixar muitos programas abrindo junto com o Windows para o PC ligar mais rápido.', cls: 'ft-info' },
  { text: '[ESPAÇO] Deixe sempre um pouco de espaço livre no seu disco principal para o sistema não perder velocidade.', cls: 'ft-sys' },
  { text: '[PREVENÇÃO] Evite colocar o gabinete diretamente no chão ou sobre tapetes, pois isso acumula mais poeira.', cls: 'ft-warn' },
  { text: '[CUIDADO] Nunca desligue o computador direto no botão da tomada para não corromper o sistema.', cls: 'ft-warn' }
];

function _htmlModuloTerminal() {
  return `
    <style>
      @keyframes forgeLogSlideIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ft-line {
        font-family: var(--font-mono), monospace;
        font-size: 11px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
        animation: forgeLogSlideIn 0.25s ease both;
        margin-bottom: 8px;
      }
      .ft-sys   { color: #4af2a1; }
      .ft-warn  { color: #ffbd2e; }
      .ft-info  { color: #00bfff; }
      .ft-cmd   { color: rgba(74,242,161,0.4); }
    </style>

    <div style="background: #000; border: 1px solid rgba(74,242,161,0.15); border-radius: 6px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(74,242,161,0.08);">
        <span style="width:9px;height:9px;border-radius:50%;background:#ff5f57;"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#ffbd2e;"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#28c840;"></span>
        <span style="font-family: var(--font-mono); font-size: 10px; color: rgba(74,242,161,0.4); letter-spacing: 1px; margin-left: 6px; text-transform: uppercase;">DICAS_DO_DIA</span>
      </div>

      <div id="forge-term-logs" style="padding: 14px 14px 8px; min-height: 240px; max-height: 240px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;"></div>

      <div style="padding: 0 14px 14px; display: flex; align-items: center; gap: 6px;">
        <span class="ft-line ft-cmd" style="margin:0;">root@forge:~$</span>
        <span style="width:7px; height:12px; background:#4af2a1; display:inline-block; animation: forgeCursorBlink 1s step-end infinite;"></span>
      </div>
    </div>
  `;
}

function _iniciarTerminal() {
  const logsEl = document.getElementById('forge-term-logs');
  if (!logsEl) return;

  let pool = [..._TERM_POOL].sort(() => Math.random() - 0.5);
  let idx = 0;
  const MAX_LINES = 7;

  function _addNextTip() {
    const entry = pool[idx % pool.length];
    idx++;

    const line = document.createElement('div');
    line.className = `ft-line ${entry.cls}`;
    line.textContent = entry.text;
    logsEl.appendChild(line);

    while (logsEl.children.length > MAX_LINES) {
      logsEl.removeChild(logsEl.firstChild);
    }
  }

  for (let i = 0; i < 4; i++) {
    _addNextTip();
  }

  if (window._termLogTimerId) clearInterval(window._termLogTimerId);
  window._termLogTimerId = setInterval(_addNextTip, 60000);
}


// =============================================================================
// MÓDULO 2 — PARCERIAS ESTRATÉGICAS (FORNECEDORES DE SILÍCIO)
// =============================================================================

function _htmlModuloPerks() {
  const PARCERIAS = [
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <rect x="2" y="2" width="20" height="20" rx="2"/>
               <path d="M6 6h12v12H6z"/>
               <path d="M9 9h6v6H9z"/>
               <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
             </svg>`,
      parceiro: 'NVIDIA',
      tag: 'Gráficos Dedicados',
      desc: 'Fornecimento direto de chips e engenharia para as linhas GeForce RTX e NVIDIA RTX (Quadro), com drivers otimizados para Inteligência Artificial e renderizações 3D complexas.',
      cor: '#76B900',
      cta: 'TECNOLOGIA RTX',
      id: 'nvidia-partner',
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <rect x="3" y="3" width="18" height="18" rx="2"/>
               <path d="M7 7h10v10H7z"/>
               <path d="M3 9h3M3 15h3M18 9h3M18 15h3M9 3v3M15 3v3M9 18v3M15 18v3"/>
             </svg>`,
      parceiro: 'Intel',
      tag: 'Arquitetura Híbrida',
      desc: 'Suprimento homologado de processadores de alto desempenho Intel Core i9 e linhas escaláveis Xeon, fornecendo estabilidade extrema para multi-threading em cálculos brutos.',
      cor: '#0071C5',
      cta: 'TECNOLOGIA INTEL',
      id: 'intel-partner',
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <rect x="2" y="2" width="20" height="20" rx="3"/>
               <path d="M7 17l5-5 5 5M7 12l5-5 5 5"/>
             </svg>`,
      parceiro: 'AMD',
      tag: 'Performance Extrema',
      desc: 'Integração direta da linha de processadores Ryzen e ecossistemas Threadripper, garantindo arquiteturas de silício eficientes, grande contagem de núcleos e caches massivos.',
      cor: '#ED1C24',
      cta: 'TECNOLOGIA AMD',
      id: 'amd-partner',
    },
  ];

  const cardsHTML = PARCERIAS.map(p => `
    <div style="background: var(--color-iron); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.25s ease, transform 0.25s ease; cursor: default;" onmouseenter="this.style.borderColor='rgba(42,132,208,0.35)';this.style.transform='translateY(-3px)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.06)';this.style.transform='translateY(0)'">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
        <div style="color: ${p.cor}; flex-shrink: 0;">${p.icon}</div>
        <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 8px; background: rgba(42,132,208,0.1); border: 0.5px solid rgba(42,132,208,0.3); border-radius: 2px; color: var(--color-blue); white-space: nowrap;">${p.tag}</span>
      </div>
      <div style="font-family: var(--font-display); font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-ash); line-height: 1.1;">${p.parceiro}</div>
      <p style="font-size: 13px; color: var(--color-gray); line-height: 1.55; flex-grow: 1; margin: 0;">${p.desc}</p>
      <button style="width: 100%; padding: 9px 12px; background: rgba(42,132,208,0.08); border: 0.5px solid rgba(42,132,208,0.3); border-radius: 3px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--color-blue); cursor: pointer; transition: background 0.2s ease;" onmouseenter="this.style.background='rgba(42,132,208,0.18)'" onmouseleave="this.style.background='rgba(42,132,208,0.08)'">${p.cta}</button>
    </div>
  `).join('');

  return `
    <div style="background: var(--color-iron); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 24px; margin-bottom: 24px;" role="region">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div>
          <div style="font-family: var(--font-mono); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--color-blue); opacity: 0.8; margin-bottom: 6px;">Hardware Homologado</div>
          <h3 style="font-family: var(--font-display); font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: var(--color-ash); margin: 0;">Parceiras da FORGE</h3>
          <p style="font-size: 14px; color: var(--color-gray); margin-top: 4px;">Componentes de engenharia fornecidos diretamente pelas líderes globais de silício.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(42,132,208,0.1); border: 0.5px solid rgba(42,132,208,0.3); border-radius: 3px;">
          <div style="width:7px;height:7px;border-radius:50%;background:var(--color-blue);"></div>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-blue);letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">Hardware de Qualidade</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
        ${cardsHTML}
      </div>
    </div>
  `;
}

window.forgeVerParceiro = function (id) {
  const labels = {
    'nvidia-partner': 'NVIDIA RTX',
    'intel-partner':  'Intel Core / Xeon',
    'amd-partner':    'AMD Ryzen / Threadripper',
  };
  const nome = labels[id] || 'Parceiro';
  if (typeof showToast === 'function') {
    showToast(`Tecnologia e arquitetura ${nome} homologada com sucesso no ecossistema FORGE.`, 'success');
  }
};