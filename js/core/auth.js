const AppAuth = {
  isSignUp: false,

  async init() {
    if (!supabaseClient) {
      document.getElementById('login-error').textContent = 'Supabase não configurado. Verifique supabase-config.js.';
      this.showLogin();
      return;
    }

    this.bindEvents();

    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        this.showNewPasswordForm();
      } else if (event === 'SIGNED_IN' && session) {
        this.onAuth(session);
      }
    });

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      const query = new URLSearchParams(window.location.hash.replace('#', '?'));
      if (query.get('type') === 'recovery') {
        this.showNewPasswordForm();
        return;
      }
      this.onAuth(session);
      return;
    }

    this.showLogin();
  },

  bindEvents() {
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    document.getElementById('login-toggle-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMode();
    });

    document.getElementById('login-forgot-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.showResetPassword();
    });

    document.getElementById('reset-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendResetEmail();
    });

    document.getElementById('reset-back-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.backToLogin();
    });

    document.getElementById('new-password-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updatePassword();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });
  },

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    const btn = document.getElementById('login-submit');
    const link = document.getElementById('login-toggle-link');
    document.getElementById('login-error').textContent = '';

    if (this.isSignUp) {
      btn.textContent = 'Criar conta';
      link.textContent = 'Já tenho uma conta, quero entrar';
    } else {
      btn.textContent = 'Entrar';
      link.textContent = 'Criar uma nova conta';
    }
  },

  async handleSubmit() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-submit');

    if (!email || !password) {
      errorEl.textContent = 'Preencha todos os campos.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Aguarde…';
    errorEl.textContent = '';

    try {
      if (this.isSignUp) {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user?.identities?.length === 0) {
          errorEl.textContent = 'Este email já está cadastrado.';
        } else {
          errorEl.textContent = 'Conta criada! Verifique seu email para confirmar.';
          this.isSignUp = false;
          document.getElementById('login-submit').textContent = 'Entrar';
          document.getElementById('login-toggle-link').textContent = 'Criar uma nova conta';
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        errorEl.textContent = 'Email ou senha incorretos.';
      } else if (msg.includes('Email not confirmed')) {
        errorEl.textContent = 'Email não confirmado. Verifique sua caixa de entrada.';
      } else if (msg.toLowerCase().includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
        errorEl.textContent = 'Limite de tentativas excedido. Aguarde alguns minutos.';
      } else {
        errorEl.textContent = msg;
      }
    } finally {
      btn.disabled = false;
      btn.textContent = this.isSignUp ? 'Criar conta' : 'Entrar';
    }
  },

  showResetPassword() {
    document.getElementById('login-screen').classList.remove('visible');
    document.getElementById('reset-screen').classList.add('visible');
    document.getElementById('reset-step-email').style.display = '';
    document.getElementById('reset-step-password').style.display = 'none';
    document.getElementById('reset-email').value = '';
    document.getElementById('reset-error').textContent = '';
    document.getElementById('reset-error').style.display = 'none';
    document.getElementById('reset-success').style.display = 'none';
    document.getElementById('reset-subtitle').textContent = 'Digite seu email para receber o link de redefinição';
  },

  backToLogin() {
    document.getElementById('reset-screen').classList.remove('visible');
    this.showLogin();
  },

  async sendResetEmail() {
    const email = document.getElementById('reset-email').value.trim();
    const errorEl = document.getElementById('reset-error');
    const successEl = document.getElementById('reset-success');
    const btn = document.getElementById('reset-submit');

    if (!email) {
      errorEl.textContent = 'Digite seu email.';
      errorEl.style.display = '';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando…';
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    successEl.style.display = 'none';

    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;

      document.getElementById('reset-subtitle').textContent = 'Email enviado!';
      document.getElementById('reset-step-email').style.display = 'none';
      successEl.textContent = 'Verifique sua caixa de entrada. O link expira em 1 hora.';
      successEl.style.display = '';
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
        errorEl.textContent = 'Limite de tentativas excedido. Aguarde alguns minutos.';
      } else {
        errorEl.textContent = msg;
      }
      errorEl.style.display = '';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar link';
    }
  },

  showNewPasswordForm() {
    document.getElementById('login-screen').classList.remove('visible');
    document.getElementById('reset-screen').classList.add('visible');
    document.getElementById('reset-step-email').style.display = 'none';
    document.getElementById('reset-step-password').style.display = '';
    document.getElementById('new-password-error').textContent = '';
    document.getElementById('reset-subtitle').textContent = 'Defina sua nova senha';
  },

  async updatePassword() {
    const password = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('new-password-error');
    const btn = document.getElementById('new-password-submit');

    if (!password || password.length < 6) {
      errorEl.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (password !== confirm) {
      errorEl.textContent = 'As senhas não conferem.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Redefinindo…';
    errorEl.textContent = '';

    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;

      document.getElementById('reset-screen').classList.remove('visible');
      document.getElementById('reset-subtitle').textContent = 'Digite seu email para receber o link de redefinição';
      document.getElementById('reset-step-email').style.display = '';
      document.getElementById('reset-step-password').style.display = 'none';
    } catch (err) {
      errorEl.textContent = err.message || 'Erro ao redefinir senha.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Redefinir senha';
    }
  },

  onAuth(session) {
    document.getElementById('login-screen').classList.remove('visible');
    document.getElementById('reset-screen').classList.remove('visible');
    document.getElementById('user-email').textContent = session.user.email;
    document.getElementById('logout-btn').style.display = '';
    AppStorage.currentUserId = session.user.id;
    initApp();
  },

  showLogin() {
    document.getElementById('login-screen').classList.add('visible');
    document.getElementById('reset-screen').classList.remove('visible');
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('user-email').textContent = '';

    AppStorage.clientes = [];
    AppStorage.sessoes = [];
    AppStorage.pagamentos = [];
    AppStorage.salvarDadosLocal();
  },

  async logout() {
    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
    } catch (e) {
      // ignora
    } finally {
      AppStorage.currentUserId = null;
      AppStorage.clientes = [];
      AppStorage.sessoes = [];
      AppStorage.pagamentos = [];
      AppStorage.salvarDadosLocal();
      this.showLogin();
    }
  }
};