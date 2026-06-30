// =============================================================================
//  FORGE API | routes/catalogo.js
//  Rota do catálogo de builds disponíveis
//  TODO: substituir MOCK_BUILDS por query ao banco de dados (PostgreSQL/Supabase)
// =============================================================================

'use strict';

const express = require('express');
const router  = express.Router();

// =============================================================================
//  DADOS MOCKADOS — 3 builds representativos da estrutura completa
//  O array completo das 31 máquinas deve ser carregado do banco.
//  Cada objeto segue o mesmo schema para facilitar a migração.
// =============================================================================

const MOCK_BUILDS = [
  {
    id:       'build-001',
    slug:     'frost-g1',
    nome:     'FORGE G-1: Frost',
    badge:    'Gaming',
    tagline:  'Setup All-White para alta taxa de quadros e streaming estável.',
    uso:      ['gaming'],
    cor:      'white',
    faixaPreco: 'mid',
    preco:    8900,
    precoFormatado: 'R$ 8.900',
    destaque: false,
    specs: {
      cpu:    'Intel Core i5-14600KF',
      gpu:    'NVIDIA RTX 4070 12GB',
      ram:    '32GB DDR5 6000MHz',
      armazenamento: '1TB NVMe Gen4',
      resfriamento:  'AIO 240mm',
      fonte:  '750W 80+ Gold',
    },
    benchmark: {
      cinebenchR23: 21800,
      tmeSpy:       14200,
      blenderBmw:   '58s',
      tempMaxCpu:   '65°C',
      forgeScore:   8.4,
    },
  },
  {
    id:       'build-002',
    slug:     'business-pro',
    nome:     'FORGE Business Pro',
    badge:    'Office',
    tagline:  'Silencioso, compacto e extremamente ágil para multitarefas pesadas.',
    uso:      ['office'],
    cor:      'black',
    faixaPreco: 'low',
    preco:    3500,
    precoFormatado: 'R$ 3.500',
    destaque: false,
    specs: {
      cpu:    'AMD Ryzen 5 8600G (iGPU)',
      gpu:    'Integrada Radeon 760M',
      ram:    '16GB DDR5 5600MHz',
      armazenamento: '512GB NVMe Gen4',
      resfriamento:  'Cooler Low Profile',
      fonte:  '650W 80+ Bronze',
    },
    benchmark: {
      cinebenchR23: 14600,
      tmeSpy:       null,         // GPU integrada: sem score TimeSpy
      blenderBmw:   '210s',
      tempMaxCpu:   '71°C',
      forgeScore:   7.8,
    },
  },
  {
    id:       'build-003',
    slug:     'titan-ia',
    nome:     'FORGE Titan: IA',
    badge:    'High-End',
    tagline:  'Poder bruto sem compromisso para Deep Learning, 3D e renderização local.',
    uso:      ['workstation'],
    cor:      'black',
    faixaPreco: 'high',
    preco:    25000,
    precoFormatado: 'R$ 25.000',
    destaque: true,
    specs: {
      cpu:    'AMD Ryzen 9 7950X3D',
      gpu:    'NVIDIA RTX 4090 24GB',
      ram:    '128GB DDR5 6400MHz (ECC)',
      armazenamento: '4TB NVMe Gen4 (RAID 0)',
      resfriamento:  'Custom Loop 360mm',
      fonte:  '1200W 80+ Platinum',
    },
    benchmark: {
      cinebenchR23: 24850,
      tmeSpy:       23100,
      blenderBmw:   '28s',
      tempMaxCpu:   '68°C',
      forgeScore:   9.8,
    },
  },
  // TODO: adicionar as demais 28 builds aqui, ou carregar do banco.
  // Schema de cada build está documentado acima para guiar a criação da tabela.
];

// =============================================================================
//  GET /api/catalogo
//  Query params opcionais:
//    ?uso=gaming|office|workstation
//    ?cor=black|white
//    ?preco=low|mid|high
//  Retorna o array filtrado de builds.
// =============================================================================

router.get('/', (req, res) => {
  const { uso, cor, preco } = req.query;

  // TODO: em produção, os filtros devem virar cláusulas WHERE na query SQL.
  // Por ora, filtramos o array mockado em memória.
  let resultado = [...MOCK_BUILDS];

  if (uso && uso !== 'all') {
    resultado = resultado.filter(b => b.uso.includes(uso));
  }

  if (cor && cor !== 'all') {
    resultado = resultado.filter(b => b.cor === cor);
  }

  if (preco && preco !== 'all') {
    resultado = resultado.filter(b => b.faixaPreco === preco);
  }

  return res.status(200).json({
    total:  resultado.length,
    builds: resultado,
  });
});

// =============================================================================
//  GET /api/catalogo/:slug
//  Retorna detalhes completos de uma build pelo seu slug.
//  Usado pela página de detalhe de produto.
// =============================================================================

router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  // TODO: SELECT * FROM builds WHERE slug = $1
  const build = MOCK_BUILDS.find(b => b.slug === slug);

  if (!build) {
    return res.status(404).json({
      error:   true,
      message: `Build "${slug}" não encontrada no catálogo.`,
    });
  }

  return res.status(200).json({ build });
});

module.exports = router;