(function () {
  const ANALYSES_KEY = 'morphindex-analyses';
  const FREE_ANALYSIS_LIMIT = 1;
  const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
  const MIN_IMAGE_PX = 200;

  function pillarLabel(key) {
    return window.MorphFaceIQ?.PILLAR_LABELS?.[key] || key;
  }

  let faceAnalysisModule = null;

  let session = null;
  let currentView = 'dashboard';
  let flowState = null;
  let pendingPhoto = null;
  let pendingMaxingStyle = 'soft';
  let resultTab = 'apercu';
  let resultPillar = 'harmonie';
  let faceView = 'devant';
  let drawerOpen = false;
  let drawerFocusReturn = null;

  const DRAWER_FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const MAXING_LABELS = {
    soft: 'Softmaxing',
    hard: 'Hardmaxing'
  };

  function getProKey() {
    return `morphindex-pro-${session.email}`;
  }

  function isPro() {
    return MorphAuth.Auth.isAdmin(session) || localStorage.getItem(getProKey()) === '1';
  }

  function accountTierLabel() {
    if (MorphAuth.Auth.isAdmin(session)) return 'Admin';
    return isPro() ? 'Pro' : 'Gratuit';
  }

  function analysesRemainingLabel() {
    if (MorphAuth.Auth.isAdmin(session)) return 'Illimitées (Admin)';
    if (isPro()) return 'Illimitées (Pro)';
    const left = Math.max(0, FREE_ANALYSIS_LIMIT - getAnalyses().length);
    return left === 1 ? '1 analyse gratuite restante' : '0 analyse gratuite — Passe Pro';
  }

  function canAnalyze() {
    return isPro() || getAnalyses().length < FREE_ANALYSIS_LIMIT;
  }

  function getLatestAnalysis() {
    const list = getAnalyses().sort((a, b) => b.createdAt - a.createdAt);
    return list[0] || null;
  }

  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fiq-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function getStorageKey() {
    return `${ANALYSES_KEY}-${session.email}`;
  }

  function getAnalyses() {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
    } catch {
      return [];
    }
  }

  function saveAnalyses(list) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(list));
      return true;
    } catch (err) {
      showToast('Stockage plein — supprime d\'anciennes analyses dans les Paramètres.');
      return false;
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function formatShortDate(ts) {
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function initials(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  function getDrawerFocusables() {
    const drawer = document.getElementById('fiq-drawer');
    if (!drawer) return [];
    return Array.from(drawer.querySelectorAll(DRAWER_FOCUSABLE))
      .filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
  }

  function activateDrawerFocusTrap() {
    drawerFocusReturn = document.activeElement;
    const focusables = getDrawerFocusables();
    (focusables[0] || document.getElementById('fiq-drawer'))?.focus?.();
  }

  function deactivateDrawerFocusTrap() {
    if (drawerFocusReturn && typeof drawerFocusReturn.focus === 'function') {
      drawerFocusReturn.focus();
    }
    drawerFocusReturn = null;
  }

  function handleDrawerKeydown(e) {
    if (!drawerOpen) return;
    if (e.key === 'Escape') {
      drawerOpen = false;
      render();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getDrawerFocusables();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function getFaceAnalysisModule() {
    if (!faceAnalysisModule) {
      faceAnalysisModule = await import('/assets/face-analysis.js?v=1');
    }
    return faceAnalysisModule;
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('IMAGE_LOAD'));
      img.src = dataUrl;
    });
  }

  function interpolate(text, ctx) {
    return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const parts = key.trim().split('.');
      let val = ctx;
      for (const p of parts) val = val?.[p];
      return val != null ? String(val) : '—';
    });
  }

  function buildAnalysisRecord(photoDataUrl, mp, faceModule, maxingStyle = 'soft') {
    const submetrics = faceModule.deriveSubmetrics(mp.ratios, mp.skinDetail, mp.pillars);
    const weakSub = Object.entries(submetrics[mp.weakPillar]).sort((a, b) => a[1] - b[1])[0];
    const plan = buildPlanFromDB(mp.weakPillar, mp.pillars, submetrics, mp.score, mp.potential, maxingStyle);

    return {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      photo: photoDataUrl,
      score: mp.score,
      potential: mp.potential,
      pillars: mp.pillars,
      submetrics,
      weakPillar: mp.weakPillar,
      weakSubmetric: weakSub ? { id: weakSub[0], score: weakSub[1] } : null,
      plan,
      maxingStyle,
      ratios: mp.ratios,
      skinDetail: mp.skinDetail,
      landmarksDetected: mp.landmarksDetected,
      analysisType: mp.analysisType
    };
  }

  function actionMatchesMaxing(action, maxingStyle) {
    const mode = action.maxing || 'both';
    return mode === 'both' || mode === maxingStyle;
  }

  function buildPlanFromDB(weakPillar, pillars, submetrics, score, potential, maxingStyle = 'soft') {
    const db = window.MorphPlanDB?.pillars?.[weakPillar];
    if (!db) return [];

    const stylePool = db.actions.filter((action) => actionMatchesMaxing(action, maxingStyle));
    const actionsPool = stylePool.length >= 3
      ? stylePool
      : db.actions.filter((action) => actionMatchesMaxing(action, maxingStyle) || (action.maxing || 'both') === 'both');

    const ctx = {
      score: pillars,
      submetrics: submetrics[weakPillar] || {},
      potential
    };

    const pillarSubs = submetrics[weakPillar] || {};
    const weakestSub = Object.entries(pillarSubs).sort((a, b) => a[1] - b[1])[0]?.[0];

    const scored = actionsPool.map((action) => {
      let relevance = 0;
      if (actionMatchesMaxing(action, maxingStyle)) relevance += 1;
      if (action.maxing === maxingStyle) relevance += 2;
      if (action.targets?.includes(weakestSub)) relevance += 3;
      action.targets?.forEach((t) => {
        const v = pillarSubs[t];
        if (v != null && v < 6.8) relevance += 2;
        else if (v != null && v < 7.4) relevance += 1;
      });
      if (action.impact === 'élevé') relevance += 1;
      return { action, relevance };
    });

    scored.sort((a, b) => b.relevance - a.relevance);

    return scored.slice(0, 3).map(({ action }, i) => ({
      id: action.id,
      title: action.title,
      impact: `Impact ${action.impact} · ${pillarLabel(weakPillar)}`,
      impactLevel: action.impact,
      why: interpolate(action.why, ctx),
      duration: action.duration,
      frequency: action.frequency,
      gain: action.gain,
      steps: action.steps || [],
      products: action.products || [],
      avoid: action.avoid || [],
      priority: i + 1,
      maxing: action.maxing || 'both'
    }));
  }

  function updateAnalysisMaxingStyle(analysisId, maxingStyle) {
    const list = getAnalyses();
    const analysis = list.find((a) => a.id === analysisId);
    if (!analysis) return;
    const prevStyle = analysis.maxingStyle;
    const prevPlan = analysis.plan;
    analysis.maxingStyle = maxingStyle;
    analysis.plan = buildPlanFromDB(
      analysis.weakPillar,
      analysis.pillars,
      analysis.submetrics,
      analysis.score,
      analysis.potential,
      maxingStyle
    );
    if (!saveAnalyses(list)) {
      analysis.maxingStyle = prevStyle;
      analysis.plan = prevPlan;
      return;
    }
    showToast(`Plan mis à jour · ${MAXING_LABELS[maxingStyle]}`);
  }

  async function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('resize failed'));
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  }


  function closeSidebar() {
    drawerOpen = false;
  }

  function getActiveAnalysis() {
    if (flowState === 'result' && window.__resultId) {
      return getAnalyses().find((a) => a.id === window.__resultId) || getLatestAnalysis();
    }
    return getLatestAnalysis();
  }

  function getFaceIQState() {
    return {
      tab: resultTab,
      view: currentView,
      flow: flowState,
      drawerOpen
    };
  }

  function getFaceIQCtx() {
    const analyses = getAnalyses().sort((a, b) => b.createdAt - a.createdAt);
    return {
      session,
      analysis: getActiveAnalysis(),
      analyses,
      pendingPhoto,
      isPro,
      isPillarUnlocked,
      getSubmetricLabel,
      getStrengthsWeaknesses,
      canAnalyze,
      accountTierLabel,
      analysesRemainingLabel,
      formatDate,
      formatShortDate,
      initials,
      resultPillar,
      faceView
    };
  }

  function renderFaceIQ() {
    if (!window.MorphFaceIQ?.renderApp) return '<div class="fiq-empty"><h2>Chargement…</h2></div>';
    return MorphFaceIQ.renderApp(getFaceIQState(), getFaceIQCtx());
  }

  let suppressHashSync = false;

  function getPageTitle() {
    if (flowState === 'upload') return 'Upload photo';
    if (flowState === 'analyzing') return 'Analyse en cours';
    if (flowState === 'paywall') return 'Liste d\'attente Pro';
    if (flowState === 'result') {
      const tabTitles = { apercu: 'Aperçu', analyse: 'Analyse', plan: 'Plan', simuler: 'Simuler', gpt: 'Morph GPT' };
      return tabTitles[resultTab] || 'Résultat';
    }
    const viewTitles = {
      dashboard: 'Aperçu',
      analyses: 'Mes scans',
      progression: 'Progression',
      plan: 'Mon plan',
      settings: 'Paramètres'
    };
    return viewTitles[currentView] || 'Morphindex';
  }

  function buildHash() {
    if (flowState === 'upload') return '#/upload';
    if (flowState === 'analyzing') return '#/analyse';
    if (flowState === 'paywall') return '#/paywall';
    if (flowState === 'result') {
      const id = window.__resultId || getLatestAnalysis()?.id || '';
      return `#/result/${id}/${resultTab}`;
    }
    return `#/${currentView}`;
  }

  function syncRoute(replace = false) {
    const hash = buildHash();
    if (location.hash === hash) return;
    suppressHashSync = true;
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
    suppressHashSync = false;
  }

  function applyRouteFromHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const seg = parts[0] || 'dashboard';

    drawerOpen = false;

    if (seg === 'upload') {
      navigate('analyses', { flow: 'upload', skipRoute: true });
      return;
    }
    if (seg === 'analyse') {
      navigate('analyses', { flow: 'analyzing', skipRoute: true });
      return;
    }
    if (seg === 'paywall') {
      navigate('analyses', { flow: 'paywall', skipRoute: true });
      return;
    }
    if (seg === 'result') {
      if (parts[1]) window.__resultId = parts[1];
      resultTab = parts[2] || 'apercu';
      navigate('analyses', { flow: 'result', skipRoute: true });
      return;
    }

    const validViews = ['dashboard', 'analyses', 'progression', 'plan', 'settings'];
    navigate(validViews.includes(seg) ? seg : 'dashboard', { skipRoute: true });
  }

  function navigate(view, options = {}) {
    currentView = view;
    flowState = options.flow ?? null;
    closeSidebar();

    if (options.flow === 'result') resultTab = resultTab || 'apercu';
    if (view === 'plan' && !flowState) resultTab = 'plan';

    document.title = `${getPageTitle()} — Morphindex`;
    if (!options.skipRoute) syncRoute(options.replaceRoute);
    render();
  }

  function getSubmetricLabel(pillar, id) {
    const sm = window.MorphPlanDB?.pillars?.[pillar]?.submetrics?.find((s) => s.id === id);
    return sm ? sm.label : id;
  }

  function isPillarUnlocked(pillarKey) {
    if (isPro()) return true;
    return pillarKey === 'harmonie';
  }

  function getStrengthsWeaknesses(analysis) {
    const items = [];
    Object.entries(analysis.submetrics || {}).forEach(([pillar, subs]) => {
      Object.entries(subs).forEach(([id, val]) => {
        items.push({
          pillar,
          id,
          label: getSubmetricLabel(pillar, id),
          val
        });
      });
    });
    items.sort((a, b) => b.val - a.val);
    return {
      strengths: items.filter((i) => i.val >= 7).slice(0, 4),
      weaknesses: items.filter((i) => i.val < 7).sort((a, b) => a.val - b.val).slice(0, 4)
    };
  }

  function render() {
    const root = document.getElementById('app-content');
    root.innerHTML = renderFaceIQ();
    bindContentEvents();
    if (drawerOpen) {
      requestAnimationFrame(() => activateDrawerFocusTrap());
    } else if (drawerFocusReturn) {
      deactivateDrawerFocusTrap();
    }
    if (flowState === 'upload') {
      bindUploadEvents();
      if (pendingPhoto?.dataUrl) {
        requestAnimationFrame(() => {
          const zone = document.getElementById('upload-drop');
          const preview = document.getElementById('upload-preview');
          const img = document.getElementById('preview-img');
          const cta = document.getElementById('upload-cta');
          const changeBtn = document.getElementById('upload-change');
          if (zone && preview && img) {
            img.src = pendingPhoto.dataUrl;
            zone.style.display = 'none';
            preview.classList.add('is-visible');
            if (cta) {
              cta.textContent = 'Obtenir mon score →';
              cta.dataset.action = 'start-analysis';
            }
            if (changeBtn) changeBtn.hidden = false;
          }
        });
      }
    }
  }

  function bindContentEvents() {
    const root = document.getElementById('app-content');
    if (!root) return;
    root.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => handleAction(el.dataset.action, el));
    });
  }

  function goToUploadOrPaywall() {
    pendingPhoto = null;
    if (canAnalyze()) {
      navigate('analyses', { flow: 'upload' });
    } else {
      navigate('analyses', { flow: 'paywall' });
    }
  }

  async function shareAnalysis(id) {
    const analysis = getAnalyses().find((a) => a.id === id);
    if (!analysis) return;
    const text = `Mon score PSL Morphindex : ${analysis.score}/10 — Potentiel ${analysis.potential}/10. Pilier à travailler : ${pillarLabel(analysis.weakPillar)}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Morphindex — Mon score PSL', text, url: 'https://morphindex.com' });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Score copié dans le presse-papier');
      }
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Impossible de partager');
    }
  }

  function handleAction(action, el) {
    switch (action) {
      case 'new-analysis':
        goToUploadOrPaywall();
        break;
      case 'upgrade-pro':
        window.location.href = "mailto:contact@morphindex.com?subject=Liste%20d'attente%20Pro";
        break;
      case 'view-plan': {
        const latest = getLatestAnalysis();
        if (latest) {
          window.__resultId = latest.id;
          resultTab = 'plan';
          navigate('analyses', { flow: 'result' });
        } else {
          flowState = null;
          navigate('plan');
        }
        break;
      }
      case 'share-result':
        shareAnalysis(el?.dataset?.id || window.__resultId);
        break;
      case 'view-analyses':
        flowState = null;
        navigate('analyses');
        break;
      case 'change-photo':
        pendingPhoto = null;
        render();
        break;
      case 'pick-photo': {
        const input = document.getElementById('photo-input');
        if (input) input.click();
        break;
      }
      case 'start-analysis':
        if (pendingPhoto && pendingPhoto.file) startAnalysis(pendingPhoto);
        break;
      case 'set-maxing':
        pendingMaxingStyle = el.dataset.style;
        if (el.dataset.analysisId) {
          updateAnalysisMaxingStyle(el.dataset.analysisId, el.dataset.style);
        }
        render();
        break;
      case 'result-tab':
        resultTab = el.dataset.tab;
        if (currentView === 'plan' && resultTab !== 'plan') {
          const latest = getLatestAnalysis();
          if (latest) {
            window.__resultId = latest.id;
            navigate('analyses', { flow: 'result' });
          }
        } else {
          render();
        }
        break;
      case 'overview-pillar':
        resultPillar = el.dataset.pillar;
        render();
        break;
      case 'fiq-soon':
        showToast('Bientôt disponible');
        break;
      case 'pillar-analyse':
        if (!isPillarUnlocked(el.dataset.pillar)) {
          showToast('Passe Pro pour débloquer ce pilier');
          navigate('analyses', { flow: 'paywall' });
          break;
        }
        resultPillar = el.dataset.pillar;
        resultTab = 'analyse';
        render();
        break;
      case 'view-result':
        window.__resultId = el.dataset.id;
        resultTab = 'apercu';
        navigate('analyses', { flow: 'result' });
        break;
      case 'fiq-nav':
        drawerOpen = false;
        flowState = null;
        resultTab = el.dataset.view === 'plan' ? 'plan' : 'apercu';
        navigate(el.dataset.view);
        break;
      case 'fiq-home':
        drawerOpen = false;
        flowState = null;
        resultTab = 'apercu';
        navigate('dashboard');
        break;
      case 'fiq-menu':
        drawerOpen = true;
        render();
        break;
      case 'fiq-drawer-close':
        drawerOpen = false;
        render();
        break;
      case 'fiq-cancel-flow':
        pendingPhoto = null;
        flowState = null;
        navigate('dashboard');
        break;
      case 'fiq-back':
        drawerOpen = false;
        flowState = null;
        navigate('analyses');
        break;
      case 'face-view':
        faceView = el.dataset.view;
        render();
        break;
      case 'gpt-suggest':
      case 'gpt-send':
        showToast('FaceGPT bientôt disponible');
        break;
      case 'sim-preset':
      case 'sim-scratch':
        if (!isPro() && el.dataset.preset !== 'canthoplasty') {
          showToast('Passe au Pro pour cette simulation');
          navigate('analyses', { flow: 'paywall' });
        } else {
        showToast('Simulateur bientôt disponible');
        }
        break;
      case 'clear-analyses':
        if (confirm('Supprimer toutes tes analyses ?')) {
          saveAnalyses([]);
          navigate('dashboard');
        }
        break;
      case 'export-analyses': {
        const data = JSON.stringify(getAnalyses(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'morphindex-analyses.json';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Export téléchargé');
        break;
      }
      case 'logout':
        MorphAuth.Auth.logout();
        window.location.href = '/login/';
        break;
    }
  }

  function bindUploadEvents() {
    const zone = document.getElementById('upload-drop');
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('upload-preview');
    const errorEl = document.getElementById('upload-error');
    const cta = document.getElementById('upload-cta');
    const changeBtn = document.getElementById('upload-change');
    if (!zone || !input) return;

    function showUploadError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }

    function setUploadReady(hasPhoto) {
      if (!cta) return;
      if (hasPhoto) {
        cta.textContent = 'Obtenir mon score →';
        cta.dataset.action = 'start-analysis';
        if (changeBtn) changeBtn.hidden = false;
      } else {
        cta.textContent = 'Choisir une photo';
        cta.dataset.action = 'pick-photo';
        if (changeBtn) changeBtn.hidden = true;
      }
    }

    function validateImageDimensions(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          if (img.width < MIN_IMAGE_PX || img.height < MIN_IMAGE_PX) {
            reject(new Error(`Image trop petite (min ${MIN_IMAGE_PX}×${MIN_IMAGE_PX}px).`));
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Impossible de lire cette image.'));
        };
        img.src = url;
      });
    }

    async function handleFile(file) {
      showUploadError('');
      if (!file) return;

      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        showUploadError('Format non supporté. Utilise JPG, PNG ou WebP.');
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        showUploadError('Fichier trop lourd. Taille maximum : 10 Mo.');
        return;
      }

      try {
        await validateImageDimensions(file);
        const dataUrl = await resizeImage(file);
        pendingPhoto = { dataUrl, file };
        document.getElementById('preview-img').src = dataUrl;
        zone.style.display = 'none';
        preview.classList.add('is-visible');
        setUploadReady(true);
      } catch (err) {
        showUploadError(err.message || 'Impossible de lire cette image.');
        pendingPhoto = null;
        preview.classList.remove('is-visible');
        zone.style.display = '';
        setUploadReady(false);
      }
    }

    if (pendingPhoto?.dataUrl) {
      document.getElementById('preview-img').src = pendingPhoto.dataUrl;
      zone.style.display = 'none';
      preview.classList.add('is-visible');
      setUploadReady(true);
    } else {
      setUploadReady(false);
    }

    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0]);
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  let analysisRunToken = 0;

  async function startAnalysis(photo) {
    if (!canAnalyze()) {
      navigate('analyses', { flow: 'paywall' });
      return;
    }

    const runToken = ++analysisRunToken;
    navigate('analyses', { flow: 'analyzing' });
    await new Promise((r) => requestAnimationFrame(r));

    const faceModule = await getFaceAnalysisModule();
    const steps = faceModule.getAnalysisSteps();
    const minDuration = 4500;
    const start = Date.now();

    let mpResult = null;
    let analysisError = null;

    const analysisWork = (async () => {
      try {
        const img = await loadImageFromDataUrl(photo.dataUrl);
        mpResult = await faceModule.analyzeFaceImage(img);
      } catch (err) {
        analysisError = err;
      }
    })();

    const fill = () => document.getElementById('progress-fill');
    const pct = () => document.getElementById('progress-pct');
    const stepEl = () => document.getElementById('analysis-step');

    await Promise.all([
      analysisWork,
      new Promise((resolve) => {
        const tick = () => {
          if (runToken !== analysisRunToken) return resolve();

          const elapsed = Date.now() - start;
          const analysisDone = mpResult !== null || analysisError !== null;
          const progress = analysisDone && elapsed >= minDuration
            ? 100
            : Math.min(95, (elapsed / minDuration) * 95);
          const stepIdx = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

          const f = fill();
          const p = pct();
          const s = stepEl();
          if (f) f.style.width = `${progress}%`;
          if (p) p.textContent = `${Math.round(progress)}%`;
          if (s) s.textContent = steps[stepIdx];

          if (analysisDone && elapsed >= minDuration) {
            if (f) f.style.width = '100%';
            if (p) p.textContent = '100%';
            if (s) s.textContent = steps[steps.length - 1];
            return resolve();
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      })
    ]);

    if (runToken !== analysisRunToken) return;

    if (analysisError) {
      pendingPhoto = photo;
      navigate('analyses', { flow: 'upload' });
      requestAnimationFrame(() => {
        const errorEl = document.getElementById('upload-error');
        if (!errorEl) return;
        if (analysisError.message === 'NO_FACE') {
          errorEl.textContent = 'Aucun visage détecté. Utilise une photo frontale, bien éclairée, visage centré.';
        } else if (analysisError.message === 'MODEL_LOAD_TIMEOUT' || analysisError.message === 'MODEL_LOAD_FAILED') {
          errorEl.textContent = 'Le modèle d\'analyse n\'a pas pu être chargé. Vérifie ta connexion et réessaie.';
        } else {
          errorEl.textContent = 'Analyse impossible. Réessaie avec une autre photo.';
        }
        errorEl.hidden = false;
      });
      return;
    }

    const result = buildAnalysisRecord(photo.dataUrl, mpResult, faceModule, pendingMaxingStyle);
    const list = getAnalyses();
    list.push(result);
    if (!saveAnalyses(list)) {
      list.pop();
      pendingPhoto = photo;
      navigate('analyses', { flow: 'upload' });
      return;
    }
    pendingPhoto = null;
    window.__resultId = result.id;
    resultTab = 'apercu';
    navigate('analyses', { flow: 'result' });
  }

  function init() {
    session = MorphAuth.Auth.requireAuth();
    if (!session) return;

    if (!MorphAuth.Auth.isOnboardingComplete(session.email)) {
      window.location.href = '/onboarding/';
      return;
    }

    const prefs = MorphAuth.getUserPrefs?.(session.email);
    if (prefs?.maxingStyle) pendingMaxingStyle = prefs.maxingStyle;

    window.addEventListener('hashchange', () => {
      if (suppressHashSync) return;
      applyRouteFromHash();
    });
    window.addEventListener('popstate', () => {
      if (suppressHashSync) return;
      applyRouteFromHash();
    });
    document.addEventListener('keydown', handleDrawerKeydown);

    if (sessionStorage.getItem('morphindex-start-upload') === '1') {
      sessionStorage.removeItem('morphindex-start-upload');
      goToUploadOrPaywall();
      return;
    }

    if (location.hash) applyRouteFromHash();
    else navigate('dashboard', { replaceRoute: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
