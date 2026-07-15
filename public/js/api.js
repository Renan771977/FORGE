/* =============================================================================
   js/api.js | Módulo de Comunicação REST com o Back-end FORGE
   ============================================================================= */
'use strict';

const API_BASE_URL = '/api';

window.apiLogin = async function (email, senha) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    return { ok: res.ok, data: await res.json() };
  } catch (error) {
    console.error('[FORGE API] Erro no login:', error);
    return { ok: false, data: { message: 'Falha de conexão. Tente novamente.' } };
  }
};

window.apiRegister = async function (payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ok: res.ok, data: await res.json() };
  } catch (error) {
    console.error('[FORGE API] Erro no registo:', error);
    return { ok: false, data: { message: 'Falha de conexão com o servidor.' } };
  }
};

/* -----------------------------------------------------------------------------
   CATÁLOGO
   Antes: qualquer erro virava `return null` silencioso e o catálogo aparecia
   vazio sem explicação. Agora cada falha diz exatamente o que aconteceu.
   Contrato: devolve um Array de builds, ou null se a comunicação falhou.
   -------------------------------------------------------------------------- */
window.apiGetCatalogo = async function () {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/catalogo`, { method: 'GET' });
  } catch (error) {
    console.error('[FORGE API] Não foi possível alcançar o servidor em ' +
                  `${API_BASE_URL}/catalogo. O Express está rodando?`, error);
    return null;
  }

  if (!res.ok) {
    let detalhe = '';
    try { detalhe = JSON.stringify(await res.json()); } catch { detalhe = '(corpo ilegível)'; }
    console.error(`[FORGE API] O servidor respondeu ${res.status} em /catalogo. ` +
                  `Isso costuma ser erro de banco. Resposta: ${detalhe}`);
    return null;
  }

  let dados;
  try {
    dados = await res.json();
  } catch (error) {
    console.error('[FORGE API] /catalogo respondeu 200 mas o corpo não é JSON válido.', error);
    return null;
  }

  if (!Array.isArray(dados.builds)) {
    console.error('[FORGE API] A resposta não tem a array "builds". Recebido:', dados);
    return null;
  }

  return dados.builds;
};

// Helper para rotas protegidas (usa o token salvo no localStorage)
window.apiAuthFetch = async function (endpoint, options = {}) {
  const token = localStorage.getItem('forge_token');
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    return { ok: res.ok, data: await res.json() };
  } catch (error) {
    console.error('[FORGE API] Erro na requisição autenticada:', error);
    return { ok: false, data: { message: 'Falha de conexão com o servidor.' } };
  }
};