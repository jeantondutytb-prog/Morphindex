(function () {
  const USERS_KEY = 'morphindex-users';
  const SESSION_KEY = 'morphindex-session';
  function isDevUnlimited() {
    return localStorage.getItem('morphindex-dev-unlimited') === '1';
  }

  function withRole(user) {
    return {
      ...user,
      role: isDevUnlimited() ? 'admin' : (user.role || 'user')
    };
  }

  const strings = {
    theme: { toLight: 'Activer le mode clair', toDark: 'Activer le mode sombre' },
    nav: { back: 'Accueil', login: 'Se connecter', register: 'Créer un compte' },
    login: {
      metaTitle: 'Connexion — Morphindex',
      metaDescription: 'Connectez-vous à votre compte Morphindex.',
      title: 'Bon retour',
      subtitle: 'Connectez-vous pour accéder à vos analyses PSL.',
      email: 'Adresse e-mail',
      emailPlaceholder: 'vous@exemple.com',
      password: 'Mot de passe',
      passwordPlaceholder: 'Votre mot de passe',
      remember: 'Se souvenir de moi',
      forgot: 'Mot de passe oublié ?',
      submit: 'Se connecter',
      noAccount: 'Pas encore de compte ?',
      createAccount: 'Créer un compte',
      errorEmail: 'Adresse e-mail invalide.',
      errorPassword: 'Mot de passe requis.',
      errorInvalid: 'E-mail ou mot de passe incorrect.',
      errorGeneric: 'Une erreur est survenue. Réessayez.'
    },
    register: {
      metaTitle: 'Inscription — Morphindex',
      metaDescription: 'Créez votre compte Morphindex gratuitement.',
      title: 'Créer un compte',
      subtitle: 'Commencez votre première analyse PSL en moins d\'une minute.',
      name: 'Prénom',
      namePlaceholder: 'Jean',
      email: 'Adresse e-mail',
      emailPlaceholder: 'vous@exemple.com',
      password: 'Mot de passe',
      passwordPlaceholder: '8 caractères minimum',
      terms: 'J\'accepte les',
      termsLink: 'conditions d\'utilisation',
      and: 'et la',
      privacyLink: 'politique de confidentialité',
      submit: 'Créer mon compte',
      hasAccount: 'Déjà un compte ?',
      signIn: 'Se connecter',
      errorName: 'Prénom requis.',
      errorEmail: 'Adresse e-mail invalide.',
      errorPassword: '8 caractères minimum.',
      errorTerms: 'Vous devez accepter les conditions.',
      errorExists: 'Un compte existe déjà avec cet e-mail.',
      errorGeneric: 'Une erreur est survenue. Réessayez.'
    },
    app: {
      metaTitle: 'Mon espace — Morphindex',
      welcome: 'Bienvenue',
      subtitle: 'Votre espace d\'analyse PSL est prêt.',
      cta: 'Lancer une analyse',
      logout: 'Se déconnecter'
    }
  };

  let pagePrefix = 'login';

  function t(key) {
    const value = key.split('.').reduce((obj, part) => obj && obj[part], strings);
    return value || key;
  }

  async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function onboardingStorageKey(email) {
    return `morphindex-onboarding-${String(email || '').trim().toLowerCase()}`;
  }

  function prefsStorageKey(email) {
    return `morphindex-prefs-${String(email || '').trim().toLowerCase()}`;
  }

  function analysesStorageKey(email) {
    return `morphindex-analyses-${String(email || '').trim().toLowerCase()}`;
  }

  function getOnboardingRecord(email) {
    try {
      return JSON.parse(localStorage.getItem(onboardingStorageKey(email)) || 'null');
    } catch {
      return null;
    }
  }

  function getUserPrefs(email) {
    try {
      return JSON.parse(localStorage.getItem(prefsStorageKey(email)) || 'null');
    } catch {
      return null;
    }
  }

  function saveUserPrefs(email, prefs) {
    localStorage.setItem(prefsStorageKey(email), JSON.stringify(prefs));
  }

  function hasExistingAnalyses(email) {
    try {
      const list = JSON.parse(localStorage.getItem(analysesStorageKey(email)) || '[]');
      return list.length > 0;
    } catch {
      return false;
    }
  }

  const Auth = {
    async register({ name, email, password }) {
      const normalizedEmail = email.trim().toLowerCase();
      const users = getUsers();
      if (users.some((u) => u.email === normalizedEmail)) {
        throw new Error('exists');
      }
      const passwordHash = await hashPassword(password);
      users.push(withRole({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        createdAt: Date.now()
      }));
      saveUsers(users);
      this.createSession({ name: name.trim(), email: normalizedEmail });
    },

    async login({ email, password, remember }) {
      const normalizedEmail = email.trim().toLowerCase();
      const user = getUsers().find((u) => u.email === normalizedEmail);
      if (!user) throw new Error('invalid');
      const passwordHash = await hashPassword(password);
      if (user.passwordHash !== passwordHash) throw new Error('invalid');
      this.createSession(withRole({ name: user.name, email: user.email }), remember);
    },

    createSession(user, remember = true) {
      const session = withRole({ ...user, at: Date.now() });
      if (remember) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    },

    getSession() {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    logout() {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    },

    requireAuth() {
      if (!this.getSession()) {
        window.location.href = '/login/';
        return null;
      }
      return withRole(this.getSession());
    },

    isAdmin(user = this.getSession()) {
      return user?.role === 'admin';
    },

    isOnboardingComplete(email) {
      const record = getOnboardingRecord(email);
      if (record?.completed) return true;
      if (hasExistingAnalyses(email)) {
        this.markOnboardingSkipped(email);
        return true;
      }
      return false;
    },

    markOnboardingSkipped(email) {
      localStorage.setItem(onboardingStorageKey(email), JSON.stringify({
        completed: true,
        skipped: true,
        completedAt: Date.now()
      }));
    },

    completeOnboarding(email, data) {
      const payload = {
        completed: true,
        completedAt: Date.now(),
        primaryGoal: data.primaryGoal || 'global',
        maxingStyle: data.maxingStyle || 'soft'
      };
      localStorage.setItem(onboardingStorageKey(email), JSON.stringify(payload));
      saveUserPrefs(email, {
        maxingStyle: payload.maxingStyle,
        primaryGoal: payload.primaryGoal
      });
      return payload;
    },

    getUserPrefs(email) {
      return getUserPrefs(email);
    },

    redirectAfterAuth() {
      const session = this.getSession();
      if (!session) return;
      if (this.isOnboardingComplete(session.email)) {
        window.location.href = '/app/';
      } else {
        window.location.href = '/onboarding/';
      }
    },

    redirectIfAuthed() {
      if (this.getSession()) {
        this.redirectAfterAuth();
        return true;
      }
      return false;
    }
  };

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function applyPageStrings() {
    document.documentElement.lang = 'fr';

    const metaTitle = document.getElementById('meta-title');
    const metaDesc = document.getElementById('meta-description');
    if (metaTitle) metaTitle.textContent = t(`${pagePrefix}.metaTitle`);
    if (metaDesc) metaDesc.setAttribute('content', t(`${pagePrefix}.metaDescription`));

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    updateThemeToggleLabel();
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function updateThemeToggleLabel() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const key = getTheme() === 'dark' ? 'theme.toLight' : 'theme.toDark';
    toggle.setAttribute('data-i18n-aria', key);
    toggle.setAttribute('aria-label', t(key));
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('morphindex-theme', theme);
    updateThemeToggleLabel();
  }

  function initTheme() {
    const saved = localStorage.getItem('morphindex-theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }


  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  function showAlert(message) {
    const alert = document.getElementById('auth-alert');
    if (!alert) return;
    alert.textContent = message;
    alert.classList.add('is-visible');
  }

  function hideAlert() {
    const alert = document.getElementById('auth-alert');
    if (alert) alert.classList.remove('is-visible');
  }

  function setFieldError(input, message) {
    const group = input.closest('.form-group');
    const errorEl = group && group.querySelector('.form-error');
    input.classList.toggle('is-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = form.email.value.trim();
      const password = form.password.value;
      const remember = form.remember.checked;
      let valid = true;

      if (!isValidEmail(email)) {
        setFieldError(form.email, t('login.errorEmail'));
        valid = false;
      } else {
        setFieldError(form.email, '');
      }

      if (!password) {
        setFieldError(form.password, t('login.errorPassword'));
        valid = false;
      } else {
        setFieldError(form.password, '');
      }

      if (!valid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;

      try {
        await Auth.login({ email, password, remember });
        Auth.redirectAfterAuth();
      } catch (err) {
        showAlert(err.message === 'invalid' ? t('login.errorInvalid') : t('login.errorGeneric'));
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const terms = form.terms.checked;
      let valid = true;

      if (!name) {
        setFieldError(form.name, t('register.errorName'));
        valid = false;
      } else if (name.length > 40 || /[<>]/.test(name)) {
        setFieldError(form.name, 'Prénom invalide (40 caractères max, sans < ou >).');
        valid = false;
      } else {
        setFieldError(form.name, '');
      }

      if (!isValidEmail(email)) {
        setFieldError(form.email, t('register.errorEmail'));
        valid = false;
      } else {
        setFieldError(form.email, '');
      }

      if (password.length < 8) {
        setFieldError(form.password, t('register.errorPassword'));
        valid = false;
      } else {
        setFieldError(form.password, '');
      }

      if (!terms) {
        showAlert(t('register.errorTerms'));
        valid = false;
      }

      if (!valid) return;

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;

      try {
        await Auth.register({ name, email, password });
        Auth.redirectAfterAuth();
      } catch (err) {
        showAlert(err.message === 'exists' ? t('register.errorExists') : t('register.errorGeneric'));
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function initAppPage() {
    const session = Auth.requireAuth();
    if (!session) return;

    pagePrefix = 'app';
    initThemeToggle();
    applyPageStrings();

    const welcome = document.getElementById('welcome-name');
    if (welcome) welcome.textContent = session.name;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        window.location.href = '/login/';
      });
    }
  }

  function initAuthPage(type) {
    pagePrefix = type;
    initTheme();
    initThemeToggle();
    applyPageStrings();

    if (Auth.redirectIfAuthed()) return;

    if (type === 'login') initLoginForm();
    if (type === 'register') initRegisterForm();
  }

  window.MorphAuth = {
    initAuthPage,
    initAppPage,
    Auth,
    initTheme,
    getUserPrefs,
    hasExistingAnalyses
  };
})();
