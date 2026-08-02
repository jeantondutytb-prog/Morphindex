(function () {
  let session = null;

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function finishAndGoToUpload() {
    MorphAuth.Auth.completeOnboarding(session.email, {
      primaryGoal: 'global',
      maxingStyle: 'soft'
    });
    sessionStorage.setItem('morphindex-start-upload', '1');
    window.location.href = '/app/';
  }

  function render() {
    const root = document.getElementById('onboarding-root');
    if (!root) return;

    root.innerHTML = `
      <div class="onboarding-shell">
        <div class="onboarding-scroll">
          <div class="onboarding-card">
            <div class="onboarding-score-teaser" aria-hidden="true">
              <div class="onboarding-score-teaser-val">?<span>/10</span></div>
              <div class="onboarding-score-teaser-label">Ton score PSL</div>
            </div>
            <h1>Salut ${esc(session.name)}, obtenons ta note</h1>
            <p class="onboarding-subtitle">Envoie une selfie frontale — analyse IA en ~30 secondes. C'est tout ce qu'il faut pour commencer.</p>
            <ul class="onboarding-tips-inline">
              <li>Visage de face</li>
              <li>Bonne lumière</li>
              <li>Sans filtre</li>
            </ul>
          </div>
        </div>
        <div class="onboarding-footer">
          <button type="button" class="btn btn-primary btn-block" data-action="finish">Choisir ma photo →</button>
          <p class="onboarding-footer-note">1 analyse gratuite incluse · Plan détaillé après ton score</p>
        </div>
      </div>`;

    root.querySelector('[data-action="finish"]').addEventListener('click', finishAndGoToUpload);
  }

  function init() {
    session = MorphAuth.Auth.requireAuth();
    if (!session) return;

    if (MorphAuth.Auth.isOnboardingComplete(session.email)) {
      window.location.href = '/app/';
      return;
    }

    document.documentElement.setAttribute('data-theme', 'dark');
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
