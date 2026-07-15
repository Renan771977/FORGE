/* =============================================================================
   js/pages/cadastro.js | Lógica de Formulários de Auth e Google SSO
   ============================================================================= */
'use strict';

window.switchTab = function(tabName) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

  if (tabName === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('form-login').classList.add('active');
  } else {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('form-register').classList.add('active');
  }
};

window.doLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (!email || !pass) return window.showToast('Preencha os dados de acesso.', 'error');

  const btn = document.querySelector('#form-login .auth-submit');
  btn.textContent = 'AUTENTICANDO...'; btn.disabled = true;

  const resposta = await window.apiLogin(email, pass);

  if (resposta.ok) {
    localStorage.setItem('forge_token', resposta.data.token || 'mock-token');
    localStorage.setItem('forge_user', JSON.stringify(resposta.data.usuario));
    window.location.href = '/cliente'; // Redirecionamento canónico para o Dashboard
  } else {
    window.showToast(resposta.data.message || 'Credenciais inválidas.', 'error');
    btn.textContent = 'ENTRAR NA MINHA CONTA'; btn.disabled = false;
  }
};

window.doRegister = async function() {
  const nome = document.getElementById('reg-nome').value.trim();
  const sobrenome = document.getElementById('reg-sobrenome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const tel = document.getElementById('reg-tel').value.trim();
  const perfil = document.getElementById('reg-perfil').value;
  const senha = document.getElementById('reg-senha').value.trim();

  if (!nome || !email || !senha) return window.showToast('Preencha os campos obrigatórios.', 'error');

  const btn = document.querySelector('#form-register .auth-submit');
  btn.textContent = 'CRIANDO CONTA...'; btn.disabled = true;

  const payload = { nome, sobrenome, email, whatsapp: tel, perfil_uso: perfil, senha };
  const resposta = await window.apiRegister(payload);

  if (resposta.ok) {
    localStorage.setItem('forge_token', resposta.data.token || 'mock-token');
    localStorage.setItem('forge_user', JSON.stringify(resposta.data.usuario));
    window.location.href = '/cliente';
  } else {
    window.showToast(resposta.data.message || 'Erro ao criar conta.', 'error');
    btn.textContent = 'CRIAR MINHA CONTA FORGE'; btn.disabled = false;
  }
};