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
      if (event === 'SIGNED_IN' && session) {
        this.onAuth(session);
      } else if (event === 'SIGNED_OUT') {
        this.showLogin();
      }
    });

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      this.onAuth(session);
      return;
    }

    this.showLogin();
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    document.getElementById('login-toggle-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMode();
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
    btn.textContent = 'Aguarde...';
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

  onAuth(session) {
    document.getElementById('login-screen').classList.remove('visible');
    document.getElementById('user-email').textContent = session.user.email;
    document.getElementById('logout-btn').style.display = '';
    AppStorage.currentUserId = session.user.id;
    initApp();
  },

  showLogin() {
    document.getElementById('login-screen').classList.add('visible');
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('user-email').textContent = '';
  },

  async logout() {
    AppStorage.currentUserId = null;
    await supabaseClient.auth.signOut();
  }
};
