// =============================================================================
//  FORGE API | routes/cliente.js
//  Rotas da área do cliente autenticado
//  TODO: proteger com middleware de autenticação JWT antes do deploy final
//  TODO: substituir dados mockados por queries reais ao banco
// =============================================================================

'use strict';

const express = require('express');
const router  = express.Router();

// =============================================================================
//  MOCK — Base de clientes e seus dados de build/laudo
// =============================================================================

const MOCK_CLIENTES = {
  'usr-001': {
    id:       'usr-001',
    nome:     'Renan Alves',
    email:    'renan@forge.build',
    buildId:  'FRG-2025-0094',

    // Dados da build do cliente
    build: {
      id:         'FRG-2025-0094',
      nome:       'Workstation Pro 3D',
      dataEntrega: '2025-01-15',
      status:     'performance_garantida',      // enum: em_montagem | entregue | performance_garantida
      specs: {
        cpu:    'AMD Ryzen 9 7950X',
        gpu:    'NVIDIA RTX 4080 16GB',
        ram:    '64GB DDR5 6000MHz',
        armazenamento: '2TB NVMe Gen4',
        resfriamento:  'AIO 360mm',
        fonte:  '1000W 80+ Gold',
      },
    },

    // Resultados de benchmark da build específica deste cliente
    benchmark: {
      cinebenchR23: { score: 19200, percentual: 78 },
      tmeSpy:       { score: 18400, percentual: 80 },
      blenderBmw:   { score: '41s', percentual: 72 },
      tempMaxCpu:   { score: '72°C', percentual: 72 },
      tempMaxGpu:   { score: '68°C', percentual: 68 },
      forgeScore:   9.1,
      dataExecucao: '2025-01-14T18:30:00Z',
    },

    // Laudos disponíveis para download
    downloads: [
      {
        id:       'dl-001',
        nome:     'Laudo de Benchmark',
        tipo:     'PDF',
        tamanho:  '2.4MB',
        referencia: 'FRG-0094',
        url:      '/downloads/FRG-0094-laudo-benchmark.pdf',   // servido pela pasta /public/downloads
      },
      {
        id:       'dl-002',
        nome:     'Especificações completas',
        tipo:     'PDF',
        tamanho:  '840KB',
        referencia: 'FRG-0094',
        url:      '/downloads/FRG-0094-specs.pdf',
      },
      {
        id:       'dl-003',
        nome:     'Fotos do build',
        tipo:     'ZIP',
        tamanho:  '18MB',
        referencia: 'FRG-0094',
        url:      '/downloads/FRG-0094-fotos.zip',
      },
    ],

    // Tickets de suporte técnico
    tickets: [
      {
        id:        'TKT-0041',
        titulo:    'Dúvida sobre OC da RAM para 6400MHz',
        status:    'open',                                    // open | closed | pending
        dataAbertura: '2025-03-18T10:00:00Z',
        dataFechamento: null,
      },
      {
        id:        'TKT-0028',
        titulo:    'Atualização de driver RTX — procedimento',
        status:    'closed',
        dataAbertura:   '2025-01-28T14:20:00Z',
        dataFechamento: '2025-02-02T09:45:00Z',
      },
    ],
  },
};

// =============================================================================
//  TODO: MIDDLEWARE DE AUTENTICAÇÃO JWT
//  Descomente e implemente antes de ir para produção.
//  Este middleware deve validar o Bearer Token enviado no header Authorization.
// =============================================================================
/*
const autenticar = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: true, message: 'Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: true, message: 'Token inválido ou expirado.' });
    }
    req.usuarioId = payload.id;
    next();
  });
};
*/

// =============================================================================
//  GET /api/cliente/:id/dashboard
//  Retorna o painel completo do cliente:
//    - dados da build
//    - resultados de benchmark
//    - downloads disponíveis
//    - tickets de suporte
//
//  Parâmetro: :id = ID do usuário (ex: usr-001)
//  TODO: adicionar "autenticar" como middleware antes do handler:
//        router.get('/:id/dashboard', autenticar, (req, res) => { ... })
// =============================================================================

router.get('/:id/dashboard', (req, res) => {
  const { id } = req.params;

  // Segurança: garantir que o usuário autenticado só acessa seu próprio dashboard.
  // TODO: descomentar após implementar o middleware JWT acima.
  // if (req.usuarioId !== id) {
  //   return res.status(403).json({ error: true, message: 'Acesso negado.' });
  // }

  // TODO: SELECT builds, benchmark, downloads, tickets FROM clientes WHERE id = $1
  const cliente = MOCK_CLIENTES[id];

  if (!cliente) {
    return res.status(404).json({
      error:   true,
      message: `Cliente "${id}" não encontrado.`,
    });
  }

  // Retorna o payload completo do dashboard (sem expor senha/dados sensíveis)
  return res.status(200).json({
    cliente: {
      id:    cliente.id,
      nome:  cliente.nome,
      email: cliente.email,
    },
    build:      cliente.build,
    benchmark:  cliente.benchmark,
    downloads:  cliente.downloads,
    tickets:    cliente.tickets,
  });
});

// =============================================================================
//  GET /api/cliente/:id/downloads/:downloadId
//  Rota futura: proteger o acesso aos arquivos de laudo por autenticação.
//  Só retorna o arquivo se o download pertencer ao cliente autenticado.
// =============================================================================

router.get('/:id/downloads/:downloadId', (req, res) => {
  const { id, downloadId } = req.params;

  // TODO: verificar autenticação e propriedade do arquivo antes de servir.
  return res.status(200).json({
    message: `Rota de download funcionando. Cliente: ${id} | Arquivo: ${downloadId}`,
    // TODO: res.download(caminhoDoArquivo) quando o storage estiver configurado.
  });
});

module.exports = router;