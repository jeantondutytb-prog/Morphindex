/**
 * Morphindex auth — Supabase Auth (phase 2).
 *
 * Client Supabase : chargé en ESM depuis esm.sh (@supabase/supabase-js@2).
 * Pas de bundler : ce fichier est un module ES (`type="module"`) qui expose
 * `window.MorphAuth` pour compatibilité avec app.js / onboarding.js (IIFE).
 * esm.sh est préféré à UMD car createClient est tree-shakeable et la version
 * est épinglée (@2) sans script global supplémentaire.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AUTH_PERSIST_KEY = 'morphindex-auth-persist';

const strings = {
  theme: { toLight: 'Activer le mode clair', toDark: 'Activer le mode sombre' },
  nav: { back: 'Accueil', login: 'Se connecter', register: 'Créer un compte' },
  loading: 'Chargement…',
  login: {
    metaTitle: 'Connexion — Morphindex',
    metaDescription: 'Connectez-vous à votre compte Morphindex.',
    title: 'Bon retour',
    subtitle: 'Connectez-vous pour accéder à vos analyses PSL.',
    migrationNotice:
      'Les comptes créés avant mars 2026 utilisaient un ancien système local. ' +
      'Tu dois recréer un compte avec la même adresse e-mail pour continuer.',
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
    errorUnverified: 'Confirme ton adresse e-mail avant de te connecter.',
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
    errorGeneric: 'Une erreur est survenue. Réessayez.',
    verifyTitle: 'Vérifie ta boîte mail',
    verifySubtitle: 'Un lien de confirmation a été envoyé à',
    verifyHint: 'Clique sur le lien dans l\'e-mail pour activer ton compte, puis connecte-toi.',
    verifyBack: 'Retour à la connexion'
  },
  forgot: {
    metaTitle: 'Mot de passe oublié — Morphindex',
    metaDescription: 'Réinitialisez votre mot de passe Morphindex.',
    title: 'Mot de passe oublié',
    subtitle: 'Entre ton adresse e-mail — nous t\'enverrons un lien pour choisir un nouveau mot de passe.',
    email: 'Adresse e-mail',
    emailPlaceholder: 'vous@exemple.com',
    submit: 'Envoyer le lien',
    back: 'Retour à la connexion',
    successTitle: 'E-mail envoyé',
    successSubtitle: 'Si un compte existe pour cette adresse, tu recevras un lien de réinitialisation.',
    errorEmail: 'Adresse e-mail invalide.',
    errorGeneric: 'Une erreur est survenue. Réessayez.'
  },
  reset: {
    metaTitle: 'Nouveau mot de passe — Morphindex',
    metaDescription: 'Définissez un nouveau mot de passe Morphindex.',
    title: 'Nouveau mot de passe',
    subtitle: 'Choisis un mot de passe d\'au moins 8 caractères.',
    password: 'Nouveau mot de passe',
    passwordPlaceholder: '8 caractères minimum',
    confirm: 'Confirmer le mot de passe',
    confirmPlaceholder: 'Retape ton mot de passe',
    submit: 'Enregistrer',
    errorPassword: '8 caractères minimum.',
    errorMismatch: 'Les mots de passe ne correspondent pas.',
    errorSession: 'Lien expiré ou invalide. Demande un nouveau lien.',
    errorGeneric: 'Une erreur est survenue. Réessayez.',
    success: 'Mot de passe mis à jour. Redirection…'
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
let supabase = null;
let cachedSession = null;
let initPromise = null;
let authStateSubscription = null;

function isProtectedPath() {
  const path = window.location.pathname;
  return path.startsWith('/app') || path.startsWith('/onboarding');
}

function t(key) {
  const value = key.split('.').reduce((obj, part) => obj && obj[part], strings);
  return value || key;
}

function waitForConfig() {
  if (window.APP_CONFIG) return Promise.resolve(window.APP_CONFIG);
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      if (window.APP_CONFIG) {
        resolve(window.APP_CONFIG);
        return;
      }
      attempts += 1;
      if (attempts > 200) {
        reject(new Error('APP_CONFIG unavailable'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function authRedirectOrigin() {
  const cfg = window.APP_CONFIG;
  if (cfg?.redirectAfterLogin) {
    try {
      return new URL(cfg.redirectAfterLogin).origin;
    } catch {
      /* fall through */
    }
  }
  return window.location.origin;
}

function createAuthStorage(persist) {
  const store = persist ? localStorage : sessionStorage;
  return {
    getItem: (key) => store.getItem(key),
    setItem: (key, value) => store.setItem(key, value),
    removeItem: (key) => store.removeItem(key)
  };
}

function wantsPersistentSession() {
  return localStorage.getItem(AUTH_PERSIST_KEY) !== '0';
}

function mapSupabaseSession(sbSession) {
  if (!sbSession?.user) return null;
  const meta = sbSession.user.user_metadata || {};
  const name =
    meta.name ||
    meta.full_name ||
    sbSession.user.email?.split('@')[0] ||
    '';
  return {
    id: sbSession.user.id,
    name,
    email: sbSession.user.email || '',
    at: Date.now()
  };
}

function mapAuthError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'invalid';
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'exists';
  }
  if (msg.includes('email not confirmed')) {
    return 'unverified';
  }
  return 'generic';
}

async function buildSupabaseClient(persist = wantsPersistentSession()) {
  const config = await waitForConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Supabase config missing');
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: createAuthStorage(persist)
    }
  });
}

async function reinitSupabase(persist) {
  if (authStateSubscription) {
    authStateSubscription.unsubscribe();
    authStateSubscription = null;
  }
  supabase = await buildSupabaseClient(persist);
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sbSession) => {
    cachedSession = mapSupabaseSession(sbSession);
    if (event === 'SIGNED_OUT') {
      cachedSession = null;
      if (isProtectedPath()) {
        window.location.href = '/login/';
      }
    }
    if (event === 'TOKEN_REFRESHED' && sbSession) {
      cachedSession = mapSupabaseSession(sbSession);
    }
  });
  authStateSubscription = subscription;
  const { data: { session } } = await supabase.auth.getSession();
  cachedSession = mapSupabaseSession(session);
}

async function initSupabase() {
  await reinitSupabase(wantsPersistentSession());
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
  async ensureReady() {
    if (!initPromise) initPromise = initSupabase();
    await initPromise;
  },

  async register({ name, email, password }) {
    await this.ensureReady();
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${authRedirectOrigin()}/auth/callback/`
      }
    });
    if (error) throw new Error(mapAuthError(error));
    if (data.session) {
      cachedSession = mapSupabaseSession(data.session);
      return { needsVerification: false };
    }
    return { needsVerification: true, email: normalizedEmail };
  },

  async login({ email, password, remember = true }) {
    const persist = Boolean(remember);
    const prevPersist = wantsPersistentSession();
    localStorage.setItem(AUTH_PERSIST_KEY, persist ? '1' : '0');
    if (persist !== prevPersist) {
      await reinitSupabase(persist);
    } else {
      await this.ensureReady();
    }
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) throw new Error(mapAuthError(error));
    cachedSession = mapSupabaseSession(data.session);
  },

  async logout() {
    await this.ensureReady();
    await supabase.auth.signOut();
    cachedSession = null;
  },

  getSession() {
    return cachedSession;
  },

  async requireAuth() {
    await this.ensureReady();
    if (!cachedSession) {
      window.location.href = '/login/';
      return null;
    }
    return cachedSession;
  },

  isAdmin(user = cachedSession) {
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

  async redirectIfAuthed() {
    await this.ensureReady();
    if (this.getSession()) {
      this.redirectAfterAuth();
      return true;
    }
    return false;
  },

  async requestPasswordReset(email) {
    await this.ensureReady();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${authRedirectOrigin()}/nouveau-mot-de-passe/`
    });
    if (error) throw new Error(mapAuthError(error));
  },

  async updatePassword(password) {
    await this.ensureReady();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(mapAuthError(error));
  },

  async handleAuthCallback() {
    await this.ensureReady();
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const type = params.get('type') || hashParams.get('type');
    const tokenHash = params.get('token_hash');

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type
      });
      if (error) {
        window.location.href = '/login/?error=callback';
        return;
      }
    }

    if (type === 'recovery') {
      window.location.href = '/nouveau-mot-de-passe/';
      return;
    }

    if (this.getSession()) {
      this.redirectAfterAuth();
    } else {
      window.location.href = '/login/';
    }
  }
};

const ready = Auth.ensureReady();

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

function showAlert(message, variant = 'error') {
  const alert = document.getElementById('auth-alert');
  if (!alert) return;
  alert.textContent = message;
  alert.classList.remove('auth-alert-success');
  if (variant === 'success') alert.classList.add('auth-alert-success');
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

function showAuthLoading(show) {
  document.documentElement.classList.toggle('auth-booting', show);
  const overlay = document.getElementById('auth-loading');
  if (overlay) overlay.hidden = !show;
}

function showVerifyEmailScreen(email) {
  const card = document.querySelector('.auth-card');
  const form = document.getElementById('register-form');
  if (!card || !form) return;
  form.hidden = true;
  const notice = document.querySelector('.auth-mvp-notice');
  if (notice) notice.hidden = true;
  document.querySelector('.auth-footer')?.setAttribute('hidden', '');

  let panel = document.getElementById('verify-email-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'verify-email-panel';
    panel.className = 'verify-email-panel';
    card.appendChild(panel);
  }
  panel.innerHTML = `
    <h1 data-i18n="register.verifyTitle">${t('register.verifyTitle')}</h1>
    <p class="auth-subtitle">${t('register.verifySubtitle')} <strong>${email}</strong>.</p>
    <p class="auth-subtitle verify-email-hint">${t('register.verifyHint')}</p>
    <a href="/login/" class="btn btn-secondary btn-block" style="margin-top:24px">${t('register.verifyBack')}</a>`;
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
      const code = err.message;
      if (code === 'invalid') showAlert(t('login.errorInvalid'));
      else if (code === 'unverified') showAlert(t('login.errorUnverified'));
      else showAlert(t('login.errorGeneric'));
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
      const result = await Auth.register({ name, email, password });
      if (result.needsVerification) {
        showVerifyEmailScreen(result.email);
      } else {
        Auth.redirectAfterAuth();
      }
    } catch (err) {
      showAlert(err.message === 'exists' ? t('register.errorExists') : t('register.errorGeneric'));
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function initForgotForm() {
  const form = document.getElementById('forgot-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = form.email.value.trim();
    if (!isValidEmail(email)) {
      setFieldError(form.email, t('forgot.errorEmail'));
      return;
    }
    setFieldError(form.email, '');

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      await Auth.requestPasswordReset(email);
      form.hidden = true;
      document.getElementById('forgot-success')?.removeAttribute('hidden');
    } catch {
      showAlert(t('forgot.errorGeneric'));
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function initResetForm() {
  const form = document.getElementById('reset-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const password = form.password.value;
    const confirm = form.confirm.value;
    let valid = true;

    if (password.length < 8) {
      setFieldError(form.password, t('reset.errorPassword'));
      valid = false;
    } else {
      setFieldError(form.password, '');
    }

    if (password !== confirm) {
      setFieldError(form.confirm, t('reset.errorMismatch'));
      valid = false;
    } else {
      setFieldError(form.confirm, '');
    }

    if (!valid) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      if (!Auth.getSession()) {
        showAlert(t('reset.errorSession'));
        return;
      }
      await Auth.updatePassword(password);
      showAlert(t('reset.success'), 'success');
      setTimeout(() => {
        window.location.href = '/login/';
      }, 1500);
    } catch {
      showAlert(t('reset.errorGeneric'));
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function initAppPage() {
  showAuthLoading(true);
  const session = await Auth.requireAuth();
  showAuthLoading(false);
  if (!session) return;

  pagePrefix = 'app';
  initThemeToggle();
  applyPageStrings();

  const welcome = document.getElementById('welcome-name');
  if (welcome) welcome.textContent = session.name;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await Auth.logout();
      window.location.href = '/login/';
    });
  }
}

async function initAuthPage(type) {
  showAuthLoading(true);
  pagePrefix = type;
  initTheme();

  try {
    await Auth.ensureReady();
  } catch {
    showAuthLoading(false);
    showAlert('Configuration indisponible. Réessaie dans un instant.');
    return;
  }

  initThemeToggle();
  applyPageStrings();

  if (type !== 'reset' && type !== 'forgot') {
    if (await Auth.redirectIfAuthed()) {
      showAuthLoading(false);
      return;
    }
  }

  showAuthLoading(false);

  if (type === 'login') initLoginForm();
  if (type === 'register') initRegisterForm();
  if (type === 'forgot') initForgotForm();
  if (type === 'reset') {
    if (!Auth.getSession()) {
      showAlert(t('reset.errorSession'));
      formDisabled(document.getElementById('reset-form'));
    }
    initResetForm();
  }
}

function formDisabled(form) {
  if (!form) return;
  form.querySelectorAll('input, button').forEach((el) => {
    el.disabled = true;
  });
}

async function initAuthCallback() {
  showAuthLoading(true);
  try {
    await Auth.handleAuthCallback();
  } catch {
    window.location.href = '/login/?error=callback';
  }
}

async function initProtectedShell() {
  showAuthLoading(true);
  await Auth.ensureReady();
  showAuthLoading(false);
}

window.MorphAuth = {
  initAuthPage,
  initAppPage,
  initAuthCallback,
  initProtectedShell,
  Auth,
  initTheme,
  getUserPrefs,
  hasExistingAnalyses,
  ready
};

export {
  Auth,
  initAuthPage,
  initAppPage,
  initAuthCallback,
  initProtectedShell,
  initTheme,
  getUserPrefs,
  hasExistingAnalyses,
  ready
};
