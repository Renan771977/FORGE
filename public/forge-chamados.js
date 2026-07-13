/* =============================================================================
   FORGE Performance Computing
   forge-chamados.js  |  Simulador 100% Local e Canônico de Chamados (Apresentação)
   ============================================================================= */

'use strict';

// Inicializa o banco local TOTALMENTE VAZIO para respeitar o fluxo canônico
window.LAB_MOCK_CHAMADOS = [];

// Mantém a barra lateral livre do bloco antigo para evitar conflitos
function _htmlModuloChamados() {
  return "";
}

// Injeta o novo chamado criado pelo usuário na memória local
window.forgeCriarChamadoPeloForm = function(assuntoTexto) {
  const novoId = "FRG-CH-" + Math.floor(1000 + Math.random() * 9000);
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  const novoChamado = {
    id: novoId,
    assunto: assuntoTexto || "Consultoria Técnica Avançada",
    data: dataAtual,
    passoAtual: 1 // Inicia na fase 1: Triagem
  };

  window.LAB_MOCK_CHAMADOS.unshift(novoChamado);
  return novoId;
};