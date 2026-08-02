/**
 * FaceIQ Labs — full app UI clone
 */
(function () {
  const PILLAR_ORDER = ['harmonie', 'angularite', 'dimorphisme', 'peau'];
  const PILLAR_LABELS = {
    harmonie: 'Harmonie',
    angularite: 'Angularité',
    dimorphisme: 'Dimorphisme',
    peau: 'Peau'
  };
  const PILLAR_ICONS = {
    harmonie: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    angularite: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>',
    dimorphisme: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    peau: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z"/></svg>'
  };

  const PILLAR_SHORT = { harmonie: 'H', angularite: 'A', dimorphisme: 'D', peau: 'P' };

  function relativeTime(ts) {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Aujourd\'hui';
    if (days < 7) return `${days} j`;
    if (days < 30) return `${Math.floor(days / 7)} sem`;
    return `${Math.floor(days / 30)} mois`;
  }

  function traitBadge(val, kind) {
    if (kind === 'strength') return { cls: 'fiq-badge--ideal', label: 'IDÉAL' };
    if (val < 6) return { cls: 'fiq-badge--extreme', label: 'EXTRÊME' };
    if (val < 6.8) return { cls: 'fiq-badge--severe', label: 'SÉVÈRE' };
    return { cls: 'fiq-badge--moderate', label: 'MODÉRÉ' };
  }
  const SIM_PRESETS = [
    { id: 'canthoplasty', name: 'Canthoplastie', desc: 'Élargir et incliner le cantus latéral', meta: '+0,3–0,8 Harmonie', free: true },
    { id: 'genioplasty', name: 'Génioplastie', desc: 'Avancer ou réduire le menton', meta: '+0,2–0,6 Angularité', free: false },
    { id: 'rhinoplasty', name: 'Rhinoplastie', desc: 'Affiner la projection et la largeur du nez', meta: '+0,3–0,7 Harmonie', free: false },
    { id: 'jaw-implants', name: 'Implants mâchoire', desc: 'Largeur et définition mandibulaire', meta: '+0,4–0,9 Angularité', free: false },
    { id: 'buccal-fat', name: 'Ablation graisse buccale', desc: 'Réduire le volume des joues pour plus d\'angularité', meta: '+0,2–0,5 Angularité', free: false },
    { id: 'brow-lift', name: 'Lifting des sourcils', desc: 'Position et arc des sourcils', meta: '+0,1–0,4 Harmonie', free: false }
  ];

  const GPT_SUGGESTIONS = [
    'Quel est mon ratio le plus faible ?',
    'Comment améliorer mon inclinaison canthal ?',
    'Softmax ou hardmax pour mon profil ?',
    'Explique mon score d\'harmonie'
  ];

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const { round1, ANALYSIS_STEPS } = window.MorphUtils;

  function ratioStatus(label, val) {
    const v = parseFloat(val);
    if (Number.isNaN(v)) return { cls: '', badge: '', badgeText: '' };
    if (label.includes('fWHR')) {
      if (v >= 1.88 && v <= 2.05) return { cls: 'fiq-ratio-val--good', badge: 'fiq-badge--ideal', badgeText: 'Idéal' };
      if (v < 1.75 || v > 2.15) return { cls: 'fiq-ratio-val--bad', badge: 'fiq-badge--extreme', badgeText: 'Extrême' };
      return { cls: '', badge: 'fiq-badge--grave', badgeText: 'Écart' };
    }
    if (label.includes('Jaw')) {
      if (v >= 0.8 && v <= 0.88) return { cls: 'fiq-ratio-val--good', badge: 'fiq-badge--ideal', badgeText: 'Idéal' };
      if (v < 0.72 || v > 0.95) return { cls: 'fiq-ratio-val--bad', badge: 'fiq-badge--extreme', badgeText: 'Extrême' };
      return { cls: '', badge: 'fiq-badge--grave', badgeText: 'Écart' };
    }
    if (label.includes('Symmetry')) {
      if (v >= 7.5) return { cls: 'fiq-ratio-val--good', badge: 'fiq-badge--ideal', badgeText: 'Idéal' };
      if (v < 6) return { cls: 'fiq-ratio-val--bad', badge: 'fiq-badge--extreme', badgeText: 'Bas' };
      return { cls: '', badge: 'fiq-badge--grave', badgeText: 'Moy.' };
    }
    if (label.includes('Canthal')) {
      if (v >= 3 && v <= 8) return { cls: 'fiq-ratio-val--good', badge: 'fiq-badge--ideal', badgeText: 'Idéal' };
      if (v < 0) return { cls: 'fiq-ratio-val--bad', badge: 'fiq-badge--extreme', badgeText: 'Négatif' };
      return { cls: '', badge: 'fiq-badge--grave', badgeText: 'Écart' };
    }
    return { cls: '', badge: '', badgeText: '' };
  }

  function renderPillarBars(activeIndex = 0) {
    const positions = [8, 21, 34, 47];
    const bars = positions.map((x, i) => {
      const on = i === activeIndex;
      const fill = on ? 'url(#fiqBarActive)' : 'url(#fiqBarInactive)';
      const o1 = on ? 1 : 0.4;
      const o2 = on ? 1 : 0.35;
      return `<g>
        <rect x="${x}" y="2" width="8" height="1.5" rx="0.5" fill="${fill}" opacity="${o1}"/>
        <rect x="${x + 1}" y="4" width="6" height="16" rx="0.5" fill="${fill}" opacity="${o2}"/>
        <rect x="${x}" y="20" width="8" height="1.5" rx="0.5" fill="${fill}" opacity="${o1}"/>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 63 24" class="fiq-pillar-bars" aria-hidden="true">${bars}
      <defs>
        <linearGradient id="fiqBarActive" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#5DAEFF"/><stop offset="100%" stop-color="#3D9EFF"/>
        </linearGradient>
        <linearGradient id="fiqBarInactive" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#444"/><stop offset="100%" stop-color="#333"/>
        </linearGradient>
      </defs>
    </svg>`;
  }

  function renderGlassBg(variant = 'default') {
    const imgClass = variant === 'density' ? 'fiq-glass-bg-img--density' : 'fiq-glass-bg-img--pillars';
    return `<div class="fiq-glass-bg" aria-hidden="true">
      <div class="fiq-glass-bg-img ${imgClass}"></div>
      <div class="fiq-glass-bg-blur"></div>
      <div class="fiq-glass-bg-shine"></div>
      <div class="fiq-glass-bg-gradient"></div>
    </div>`;
  }

  function renderLogo() {
    return `<a href="/app/" class="fiq-logo" data-action="fiq-home">
      <span class="fiq-logo-text">Morph<span class="fiq-logo-dim">index</span></span>
    </a>`;
  }

  function renderSidebar(state, ctx) {
    const analyses = ctx.analyses || [];
    const activeId = ctx.analysis?.id;
    const tier = ctx.isPro() ? 'PRO' : 'GRATUIT';

    const historyItems = analyses.slice(0, 8).map((a) => `
      <button type="button" class="fiq-history-item${a.id === activeId ? ' is-active' : ''}" data-action="view-result" data-id="${a.id}">
        <img src="${esc(a.photo)}" alt="">
        <div class="fiq-history-body">
          <span class="fiq-history-pillars">${PILLAR_ORDER.map((p) => PILLAR_SHORT[p]).join(' ')}</span>
          <span class="fiq-history-time">${relativeTime(a.createdAt)}</span>
        </div>
        <span class="fiq-history-chevron">›</span>
      </button>`).join('');

    return `
      <aside class="fiq-sidebar fiq-shell-rail" aria-label="Barre latérale">
        <div class="fiq-sidebar-inner">
          <div class="fiq-sidebar-brand-row">
            ${renderLogo()}
          </div>
          <div class="fiq-user-card">
            <div class="fiq-user-card-top">
              <div class="fiq-user-avatar">${esc(ctx.initials(ctx.session.name))}</div>
              <div class="fiq-user-card-meta">
                <strong>${esc(ctx.session.name)}</strong>
                <span class="fiq-tier-badge">${tier}</span>
              </div>
              <button type="button" class="fiq-icon-btn" data-action="fiq-nav" data-view="settings" aria-label="Paramètres">⋯</button>
            </div>
            ${!ctx.isPro() ? `
              <button type="button" class="fiq-upgrade-btn" data-action="upgrade-pro">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                Passer au Pro
              </button>` : ''}
          </div>
          <div class="fiq-sidebar-section">
            <div class="fiq-sidebar-section-head">
              <span class="fiq-sidebar-section-label">HISTORIQUE</span>
              <button type="button" class="fiq-sidebar-new" data-action="new-analysis">+ Nouveau</button>
            </div>
            <div class="fiq-history-list">${historyItems || '<p class="fiq-muted fiq-history-empty">Aucun scan pour l\'instant</p>'}</div>
          </div>
          <div class="fiq-sidebar-section fiq-sidebar-explore">
            <div class="fiq-sidebar-section-label">EXPLORER</div>
            <button type="button" class="fiq-explore-link" data-action="fiq-soon">Partenariats</button>
            <button type="button" class="fiq-explore-link" data-action="fiq-soon">Creator League</button>
            <button type="button" class="fiq-explore-link" data-action="fiq-soon">Recherche</button>
            <button type="button" class="fiq-explore-link" data-action="fiq-soon">Célébrités</button>
          </div>
        </div>
      </aside>`;
  }

  function renderWorkspaceNav(activeTab, ctx) {
    const tabs = [
      { id: 'apercu', label: 'Aperçu' },
      { id: 'analyse', label: 'Analyse' },
      { id: 'plan', label: 'Plan' },
      { id: 'simuler', label: 'Simuler' }
    ];
    return `
      <div class="fiq-workspace-nav">
        <nav class="fiq-nav" aria-label="Principal">
          ${tabs.map((t) => `
            <button type="button" class="fiq-nav-item${activeTab === t.id ? ' is-active' : ''}" data-action="result-tab" data-tab="${t.id}">${t.label}</button>
          `).join('')}
          <button type="button" class="fiq-nav-gpt${activeTab === 'gpt' ? ' is-active' : ''}" data-action="result-tab" data-tab="gpt">Face GPT</button>
        </nav>
        <div class="fiq-workspace-tools">
          <button type="button" class="fiq-icon-btn" data-action="share-result" data-id="${ctx.analysis?.id || ''}" aria-label="Partager">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          </button>
          <button type="button" class="fiq-icon-btn" data-action="fiq-nav" data-view="settings" aria-label="Paramètres">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
          </button>
          <button type="button" class="fiq-icon-btn" data-action="fiq-soon" aria-label="Aide">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          </button>
        </div>
      </div>`;
  }

  function renderFlowHeader(state) {
    return `
      <header class="fiq-flow-header">
        <button type="button" class="fiq-icon-btn" data-action="fiq-cancel-flow" aria-label="Retour">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        ${renderLogo()}
      </header>`;
  }

  function renderDrawer(state, ctx) {
    const open = state.drawerOpen ? ' is-open' : '';
    return `
      <button type="button" class="fiq-drawer-overlay${open}" data-action="fiq-drawer-close" aria-label="Fermer le menu"></button>
      <aside class="fiq-drawer${open}" id="fiq-drawer" role="dialog" aria-modal="true" aria-label="Menu de navigation" aria-hidden="${open ? 'false' : 'true'}">
        <div class="fiq-drawer-head">
          ${renderLogo()}
          <button type="button" class="fiq-icon-btn" data-action="fiq-drawer-close" aria-label="Fermer">✕</button>
        </div>
        <div class="fiq-drawer-user">
          <div class="fiq-drawer-avatar">${esc(ctx.initials(ctx.session.name))}</div>
          <div>
            <strong>${esc(ctx.session.name)}</strong>
            <span>${esc(ctx.session.email)}</span>
          </div>
        </div>
        <nav class="fiq-drawer-nav">
          <button type="button" class="fiq-drawer-link${state.view === 'dashboard' ? ' is-active' : ''}" data-action="fiq-nav" data-view="dashboard">Aperçu</button>
          <button type="button" class="fiq-drawer-link${state.view === 'analyses' ? ' is-active' : ''}" data-action="fiq-nav" data-view="analyses">Mes scans</button>
          <button type="button" class="fiq-drawer-link${state.view === 'progression' ? ' is-active' : ''}" data-action="fiq-nav" data-view="progression">Progression</button>
          <button type="button" class="fiq-drawer-link${state.view === 'plan' ? ' is-active' : ''}" data-action="fiq-nav" data-view="plan">Ton plan</button>
          <button type="button" class="fiq-drawer-link${state.view === 'settings' ? ' is-active' : ''}" data-action="fiq-nav" data-view="settings">Paramètres</button>
        </nav>
        <div class="fiq-drawer-foot">
          <span class="fiq-drawer-tier">${esc(ctx.accountTierLabel())}</span>
          ${!ctx.isPro() ? '<button type="button" class="fiq-btn-lock fiq-btn-lock--full" data-action="upgrade-pro"><span aria-hidden="true">🔒</span> Débloquer Pro</button>' : ''}
          <button type="button" class="fiq-drawer-logout" data-action="logout">Se déconnecter</button>
        </div>
      </aside>`;
  }

  function renderPillarTopCard(analysis, pillarKey, ctx, pillarIndex = 0) {
    const unlocked = ctx.isPillarUnlocked(pillarKey);
    const isHarmony = pillarKey === 'harmonie';

    const btn = unlocked && isHarmony
      ? `<button type="button" class="fiq-btn-teal" data-action="pillar-analyse" data-pillar="${pillarKey}">Voir les ratios d'harmonie</button>`
      : unlocked
        ? `<button type="button" class="fiq-btn-teal" data-action="pillar-analyse" data-pillar="${pillarKey}">Voir ${PILLAR_LABELS[pillarKey]} →</button>`
        : `<button type="button" class="fiq-btn-lock fiq-btn-lock--sm" data-action="upgrade-pro"><span aria-hidden="true">🔒</span> Débloquer ton score</button>`;

    return `
      <article class="fiq-pillar-top-card fiq-glass-card" data-story-id="${pillarKey}-score">
        ${renderGlassBg('pillars')}
        <div class="fiq-pillar-top-content">
          <div class="fiq-pillar-top-head">
            ${renderPillarBars(pillarIndex)}
            <span class="fiq-pillar-top-name">${PILLAR_LABELS[pillarKey]}</span>
            <span class="fiq-pillar-top-arrow">›</span>
          </div>
          <div class="fiq-pillar-top-visual" style="background-image:url('${esc(analysis.photo)}')">
            <div class="fiq-pillar-top-inner">${btn}</div>
          </div>
        </div>
      </article>`;
  }

  function renderFeatureRow(item, kind, locked) {
    const badge = traitBadge(item.val, kind);
    const scoreDisplay = kind === 'weak'
      ? (item.val < 7 ? round1(item.val - 7) : item.val)
      : item.val;

    return `
      <div class="fiq-feature-row">
        <span class="fiq-badge ${badge.cls}">${badge.label}</span>
        <span class="fiq-feature-label">${esc(item.label)}</span>
        <span class="fiq-feature-score">
          ${locked ? '<span class="fiq-mini-lock" aria-hidden="true">🔒</span>' : ''}
          <strong>${scoreDisplay}</strong>
        </span>
        <span class="fiq-feature-chevron">▾</span>
      </div>`;
  }

  function renderOverview(analysis, ctx) {
    const { strengths, weaknesses } = ctx.getStrengthsWeaknesses(analysis);
    const unlockedCount = PILLAR_ORDER.filter((p) => ctx.isPillarUnlocked(p)).length;
    const activePillar = ctx.resultPillar || 'harmonie';
    const traitsLocked = !ctx.isPro();
    const activeScore = analysis.pillars[activePillar];
    const strengthCount = strengths.length;
    const weaknessCount = weaknesses.length;

    const pillarGrid = PILLAR_ORDER.map((p, i) => renderPillarTopCard(analysis, p, ctx, i)).join('');
    const connectors = PILLAR_ORDER.map(() => '<span></span>').join('');
    const pillarTimeline = PILLAR_ORDER.map((p, i) => `
      <div class="fiq-timeline-item" data-story-id="${p}-score">
        <span class="fiq-timeline-dot" aria-hidden="true"></span>
        <span class="fiq-timeline-connector" aria-hidden="true"></span>
        ${renderPillarTopCard(analysis, p, ctx, i)}
      </div>`).join('');

    const pills = PILLAR_ORDER.map((p) => `
      <button type="button" class="fiq-pill${activePillar === p ? ' is-active' : ''}" data-action="overview-pillar" data-pillar="${p}">
        ${PILLAR_LABELS[p]}${ctx.isPillarUnlocked(p) ? '' : ''}
      </button>`).join('');

    const strengthRows = strengths.slice(0, 3).map((item) => renderFeatureRow(item, 'strength', traitsLocked)).join('');
    const weaknessRows = weaknesses.slice(0, 3).map((item) => renderFeatureRow(item, 'weak', traitsLocked)).join('');

    return `
      <div class="fiq-overview-page">
        <div class="fiq-pillar-stage fiq-pillar-stage--desktop">
          <div class="fiq-pillar-grid">${pillarGrid}</div>
          <div class="fiq-pillar-connectors">${connectors}</div>
        </div>
        <div class="fiq-pillar-timeline">${pillarTimeline}</div>

        <article class="fiq-overall-panel fiq-glass-card" data-story-id="overall-score">
          ${renderGlassBg('density')}
          <div class="fiq-glass-content">
          <div class="fiq-overall-head">
            <div class="fiq-overall-title">
              <span class="fiq-pillar-bars">${PILLAR_ICONS.harmonie}</span>
              Score global
            </div>
            <span class="fiq-overall-meta">${unlockedCount} sur 4 piliers</span>
          </div>
          <div class="fiq-overall-score${traitsLocked ? ' is-blurred' : ''}">${analysis.score}<span>/10</span></div>
          <div class="fiq-pills fiq-pills--panel">${pills}</div>
          <div class="fiq-harmony-strip">
            <span>${PILLAR_LABELS[activePillar].toUpperCase()}</span>
            <strong class="${activeScore < 6.5 ? 'is-low' : ''}">${ctx.isPillarUnlocked(activePillar) ? activeScore : '—'}<small>/10</small></strong>
          </div>
          <div class="fiq-photos-panel">
            <div class="fiq-photo-box">
              <img src="${esc(analysis.photo)}" alt="Face">
              <label>FACE</label>
              <span class="fiq-photo-score">${analysis.score}<small>/10</small></span>
            </div>
            <div class="fiq-photo-box is-locked">
              <img src="${esc(analysis.photo)}" alt="Profil">
              <label>PROFIL</label>
              <span class="fiq-photo-score fiq-photo-score--blur">—<small>/10</small></span>
            </div>
            ${traitsLocked ? `
              <button type="button" class="fiq-unlock-float" data-action="upgrade-pro">
                <span aria-hidden="true">🔒</span> Débloquer pour voir ton classement
              </button>` : ''}
          </div>
          </div>
        </article>

        <section class="fiq-panel-card fiq-glass-card">
          ${renderGlassBg()}
          <div class="fiq-glass-content">
          <div class="fiq-panel-head">
            <h2>Points forts</h2>
            <button type="button" class="fiq-btn-dark-pill" data-action="upgrade-pro">
              <span aria-hidden="true">🔒</span> Voir tes ${strengthCount || 'meilleurs'} meilleurs atouts
            </button>
          </div>
          <div class="fiq-pills fiq-pills--panel">${pills}</div>
          <div class="fiq-feature-list${traitsLocked ? ' is-locked' : ''}">
            ${strengthRows || '<div class="fiq-feature-row fiq-feature-row--empty"><span>Aucun point fort détecté pour l\'instant</span></div>'}
          </div>
          ${strengthCount > 3 ? `<button type="button" class="fiq-show-more" data-action="result-tab" data-tab="analyse">Afficher ${strengthCount - 3} de plus ▾</button>` : ''}
          </div>
        </section>

        <section class="fiq-panel-card fiq-glass-card">
          ${renderGlassBg()}
          <div class="fiq-glass-content">
          <div class="fiq-panel-head">
            <h2>Axes d'amélioration</h2>
            <button type="button" class="fiq-btn-dark-pill" data-action="upgrade-pro">
              <span aria-hidden="true">🔒</span> Voir ${weaknessCount || '11'} axes à améliorer
            </button>
          </div>
          <div class="fiq-pills fiq-pills--panel">${pills}</div>
          <div class="fiq-feature-list${traitsLocked ? ' is-locked' : ''}">
            ${weaknessRows || '<div class="fiq-feature-row fiq-feature-row--empty"><span>Rien signalé</span></div>'}
          </div>
          ${weaknessCount > 3 ? `<button type="button" class="fiq-show-more" data-action="result-tab" data-tab="analyse">Afficher ${weaknessCount - 3} de plus ▾</button>` : ''}
          </div>
        </section>

        <section class="fiq-panel-card fiq-glass-card fiq-score-card-section">
          ${renderGlassBg()}
          <div class="fiq-glass-content">
          <div class="fiq-panel-head">
            <h2><span class="fiq-score-card-icon">⬆</span> Carte de score</h2>
          </div>
          <div class="fiq-score-card-split">
            <div class="fiq-score-card-preview">
              <div class="fiq-score-card-preview-label">GLOBAL</div>
              <div class="fiq-score-card-preview-score${traitsLocked ? ' is-blurred' : ''}">${analysis.score}</div>
              <div class="fiq-score-card-preview-photos">
                <img src="${esc(analysis.photo)}" alt="">
                <img src="${esc(analysis.photo)}" alt="" class="is-blur">
              </div>
              <div class="fiq-score-card-brand">MORPHINDEX</div>
            </div>
            <div class="fiq-score-card-info">
              <span class="fiq-muted">TA CARTE</span>
              <h3>Enregistre-la. Partage-la.</h3>
              <p class="fiq-muted">Ta carte se débloque une fois l'analyse prête. Une image, prête à enregistrer ou partager.</p>
              <button type="button" class="fiq-btn-outline-lock" data-action="${traitsLocked ? 'upgrade-pro' : 'share-result'}">
                ${traitsLocked ? '<span aria-hidden="true">🔒</span> Verrouillé' : 'Partager la carte'}
              </button>
            </div>
          </div>
          </div>
        </section>
      </div>`;
  }

  function renderRatioList(analysis, ctx) {
    if (!analysis.ratios) return '<p class="fiq-muted">Ratios indisponibles pour ce scan.</p>';
    const r = analysis.ratios;
    const rows = [
      ['fWHR (largeur/hauteur faciale)', r.fwhr],
      ['Ratio mâchoire (Jaw)', r.jawRatio],
      ['Tiers inférieur', r.lowerThird],
      ['Inclinaison canthal (Canthal)', `${r.canthalTilt}°`],
      ['Symétrie (Symmetry)', `${r.symmetry}/10`]
    ];
    return rows.map(([label, val]) => {
      const st = ratioStatus(label, val);
      const locked = !ctx.isPro() && !label.includes('fWHR');
      return `
        <div class="fiq-ratio-row">
          <span class="fiq-ratio-lock">${locked ? '<span aria-hidden="true">🔒</span>' : ''}</span>
          <span>${esc(label)}</span>
          <span class="fiq-ratio-val ${st.cls}">${locked ? '—' : val}</span>
          <span>${st.badge ? `<span class="fiq-badge ${st.badge}">${st.badgeText}</span>` : ''}</span>
        </div>`;
    }).join('');
  }

  function renderAnalyseTab(analysis, ctx) {
    const pillar = ctx.resultPillar || 'harmonie';
    const unlocked = ctx.isPillarUnlocked(pillar);
    const faceView = ctx.faceView || 'devant';
    const score = unlocked ? analysis.pillars[pillar] : '—';

    const pillarPills = PILLAR_ORDER.map((p) => `
      <button type="button" class="fiq-pill${pillar === p ? ' is-active' : ''}" data-action="pillar-analyse" data-pillar="${p}">
        ${PILLAR_LABELS[p]}${ctx.isPillarUnlocked(p) ? ` · ${analysis.pillars[p]}` : ''}
      </button>`).join('');

    if (!unlocked) {
      return `
        <div class="fiq-pills fiq-pills--flush">${pillarPills}</div>
        <div class="fiq-card fiq-card--center">
          <p class="fiq-muted">Ce pilier est disponible avec Pro.</p>
          <button type="button" class="fiq-btn-lock" data-action="upgrade-pro"><span aria-hidden="true">🔒</span> Débloquer ${PILLAR_LABELS[pillar]}</button>
        </div>`;
    }

    const subs = analysis.submetrics?.[pillar] || {};
    const subRows = Object.entries(subs).sort((a, b) => a[1] - b[1]).map(([id, val]) => {
      const label = ctx.getSubmetricLabel(pillar, id);
      const st = val >= 7.5 ? 'fiq-ratio-val--good' : val < 6.5 ? 'fiq-ratio-val--bad' : '';
      return `
        <div class="fiq-ratio-row">
          <span></span><span>${esc(label)}</span>
          <span class="fiq-ratio-val ${st}">${val}</span><span></span>
        </div>`;
    }).join('');

    return `
      <div class="fiq-analyse-layout">
        <div class="fiq-analyse-visual-col">
          <div class="fiq-view-toggle">
            <button type="button" class="${faceView === 'devant' ? 'is-active' : ''}" data-action="face-view" data-view="devant">FACE</button>
            <button type="button" class="${faceView === 'cote' ? 'is-active' : ''}" data-action="face-view" data-view="cote">PROFIL</button>
          </div>
          <div class="fiq-hero-photo">
            <img src="${esc(analysis.photo)}" alt="${faceView}" style="${faceView === 'cote' ? 'filter:blur(8px)' : ''}">
            <div class="fiq-hero-label">
              <small>${faceView === 'devant' ? 'PROFIL DE FACE' : 'PROFIL DE CÔTÉ'}</small>
              <strong>${PILLAR_LABELS[pillar]}</strong>
            </div>
            ${faceView === 'cote' ? '<div class="fiq-photo-lock"><span aria-hidden="true">🔒</span> Profil de côté bientôt disponible</div>' : ''}
          </div>
          <div class="fiq-score-dark">
            <div class="fiq-score-dark-label">Score · ${PILLAR_LABELS[pillar]}</div>
            <div class="fiq-score-dark-val">${score}<small>/10</small></div>
          </div>
          <div class="fiq-action-row">
            <button type="button" class="fiq-action-outline" data-action="result-tab" data-tab="simuler">Simuler des changements</button>
            <button type="button" class="fiq-action-dark" data-action="result-tab" data-tab="plan">Voir le plan →</button>
          </div>
        </div>
        <div class="fiq-analyse-data-col">
          <div class="fiq-pills fiq-pills--flush">${pillarPills}</div>
          ${pillar === 'harmonie' || pillar === 'angularite' ? `
            <div class="fiq-section-title">Ratios faciaux</div>
            <div class="fiq-ratio-list">${renderRatioList(analysis, ctx)}</div>` : ''}
          ${subRows ? `
            <div class="fiq-section-title">Sous-scores</div>
            <div class="fiq-ratio-list">${subRows}</div>` : ''}
        </div>
      </div>`;
  }

  function renderMaxingPicker(selectedStyle, analysisId) {
    return `
      <div class="fiq-maxing-row">
        <button type="button" class="fiq-maxing-btn${selectedStyle === 'soft' ? ' is-active' : ''}" data-action="set-maxing" data-style="soft" data-analysis-id="${analysisId}">
          <strong>Softmaxing</strong><span>Soins, grooming, mewing</span>
        </button>
        <button type="button" class="fiq-maxing-btn${selectedStyle === 'hard' ? ' is-active' : ''}" data-action="set-maxing" data-style="hard" data-analysis-id="${analysisId}">
          <strong>Hardmaxing</strong><span>Chirurgie, leviers agressifs</span>
        </button>
      </div>`;
  }

  function planTag(item) {
    if (item.maxing === 'hard') return { cls: 'fiq-tag--surgical', label: 'CHIRURGICAL' };
    if (item.maxing === 'soft') return { cls: 'fiq-tag--foundational', label: 'FONDAMENTAL' };
    return { cls: 'fiq-tag--min', label: 'MIXTE' };
  }

  function renderPlanTab(analysis, ctx) {
    const maxingStyle = analysis.maxingStyle || 'soft';
    const planItems = analysis.plan || [];
    const timeline = planItems.map((item, i) => {
      const tag = planTag(item);
      if (!ctx.isPro() && i > 0) {
        return `
          <div class="fiq-timeline-item">
            <span class="fiq-timeline-num">${i + 1}</span>
            <div class="fiq-timeline-card is-locked">
              <button type="button" class="fiq-btn-lock" data-action="upgrade-pro"><span aria-hidden="true">🔒</span> Débloquer le plan Pro</button>
            </div>
          </div>`;
      }
      return `
        <div class="fiq-timeline-item">
          <span class="fiq-timeline-num">${i + 1}</span>
          <article class="fiq-timeline-card">
            <div class="fiq-timeline-card-head">
              <h3>${esc(item.title)}</h3>
              <span class="fiq-tag ${tag.cls}">${tag.label}</span>
            </div>
            ${item.gain ? `<div class="fiq-timeline-gain">${esc(item.gain)}</div>` : ''}
            ${item.why ? `<p class="fiq-timeline-desc">${esc(item.why)}</p>` : ''}
            <div class="fiq-timeline-foot">
              <span>${esc(item.duration || '')}</span>
              <span>${esc(item.frequency || '')}</span>
            </div>
          </article>
        </div>`;
    }).join('');

    return `
      <div class="fiq-plan-header">
        <h2>Ton plan</h2>
        <button type="button" class="fiq-icon-btn" data-action="share-result" data-id="${analysis.id}" aria-label="Partager">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
        </button>
      </div>
      <div class="fiq-plan-journey">
        <div class="fiq-plan-journey-item"><span>ACTUEL</span><strong>${analysis.score}</strong></div>
        <div class="fiq-plan-journey-arrow">→</div>
        <div class="fiq-plan-journey-item"><span>OBJECTIF</span><strong>${Math.min(10, round1(analysis.score + 0.8))}</strong></div>
        <div class="fiq-plan-journey-arrow">→</div>
        <div class="fiq-plan-journey-item"><span>POTENTIEL</span><strong>${analysis.potential}</strong></div>
      </div>
      ${renderMaxingPicker(maxingStyle, analysis.id)}
      <div class="fiq-plan-subtabs">
        <button type="button" class="fiq-plan-subtab is-active">Chronologie</button>
        <button type="button" class="fiq-plan-subtab" data-action="result-tab" data-tab="analyse">Ratios</button>
      </div>
      <div class="fiq-timeline">${timeline || '<p class="fiq-muted">Aucune action — lance un nouveau scan.</p>'}</div>`;
  }

  function renderSimulateTab(analysis, ctx) {
    return `
      <div class="fiq-sim-layout">
        <input type="search" class="fiq-sim-search" placeholder="Rechercher des procédures…" aria-label="Rechercher">
        <button type="button" class="fiq-sim-scratch" data-action="sim-scratch">
          <div class="fiq-preset-icon">+</div>
          <div><strong>Partir de zéro</strong><span>Construis ta simulation manuellement</span></div>
        </button>
        <div class="fiq-sim-free"><span aria-hidden="true">✦</span> Simulations gratuites</div>
        <div class="fiq-sim-grid">
          ${SIM_PRESETS.map((p) => `
            <button type="button" class="fiq-preset" data-action="sim-preset" data-preset="${p.id}">
              <div class="fiq-preset-icon"><span aria-hidden="true">✦</span></div>
              <div class="fiq-preset-body">
                <strong>${esc(p.name)}${p.free ? '<span class="fiq-preset-free">GRATUIT</span>' : ''}</strong>
                <p>${esc(p.desc)}</p>
                <div class="fiq-preset-meta">${esc(p.meta)}</div>
              </div>
            </button>`).join('')}
        </div>
      </div>`;
  }

  function renderGptTab() {
    return `
      <div class="fiq-gpt">
        <h1>FaceGPT</h1>
        <p class="fiq-muted fiq-gpt-sub">Pose toutes tes questions sur ton visage — réponses expertes propulsées par l'IA.</p>
        <div class="fiq-gpt-input">
          <input type="text" placeholder="Pose une question sur ton analyse…" aria-label="Question FaceGPT">
          <button type="button" class="fiq-icon-btn" data-action="gpt-send" aria-label="Envoyer">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
        ${GPT_SUGGESTIONS.map((s) => `
          <button type="button" class="fiq-gpt-suggest" data-action="gpt-suggest" data-prompt="${esc(s)}">${esc(s)}</button>
        `).join('')}
      </div>`;
  }

  function renderWelcome(ctx) {
    return `
      <div class="fiq-welcome">
        <h1>Ton visage. Mesuré.<br>Suivi. Amélioré.</h1>
        <p class="fiq-muted">Analyse ton visage sur 21 indicateurs faciaux mesurés. Obtiens un plan personnalisé. Suis ta progression dans le temps.</p>
        <div class="fiq-welcome-steps">
          <div><span>1</span> Prends une photo de face</div>
          <div><span>2</span> Obtiens un score sur 4 piliers</div>
          <div><span>3</span> Suis ton plan d'amélioration</div>
        </div>
        <button type="button" class="fiq-btn-green fiq-btn-green--lg" data-action="new-analysis">Commencer ton analyse →</button>
        <p class="fiq-welcome-note">${esc(ctx.analysesRemainingLabel())}</p>
      </div>`;
  }

  function renderUpload(ctx) {
    return `
      <div class="fiq-upload">
        <h1>Téléverse ta photo</h1>
        <p class="fiq-muted">Photo de face · analyse en ~30 sec · ${esc(ctx.analysesRemainingLabel())}</p>
        <div id="upload-drop" class="fiq-upload-zone">
          <input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp">
          <div class="fiq-upload-icon">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3>Ajouter une photo de face</h3>
          <p>Clique ou glisse · JPG, PNG, WebP</p>
        </div>
        <ul class="fiq-upload-tips">
          <li>Face vers l'avant</li><li>Lumière naturelle</li><li>Expression neutre</li>
        </ul>
        <div id="upload-error" class="fiq-upload-error" hidden role="alert"></div>
        <div id="upload-preview" class="fiq-upload-preview">
          <img id="preview-img" src="" alt="Aperçu">
        </div>
        <div class="fiq-upload-footer" id="upload-footer">
          <button type="button" class="fiq-btn-green fiq-btn-green--full" id="upload-cta" data-action="pick-photo">Choisir une photo</button>
          <button type="button" class="fiq-action-outline fiq-btn-green--full" id="upload-change" data-action="change-photo" hidden>Changer de photo</button>
        </div>
      </div>`;
  }

  function renderAnalyzing(ctx) {
    const photo = ctx.pendingPhoto?.dataUrl || '';
    return `
      <div class="fiq-analyzing">
        <img class="fiq-analyzing-photo" src="${esc(photo)}" alt="">
        <h2>Analyse de ton visage en cours…</h2>
        <p class="fiq-muted">Analyse faciale par IA en cours</p>
        <div class="fiq-analyzing-step" id="analysis-step">${esc(ANALYSIS_STEPS[0])}</div>
        <div class="fiq-progress-bar"><i id="progress-fill" style="width:0%"></i></div>
        <div class="fiq-analyzing-pct" id="progress-pct">0%</div>
      </div>`;
  }

  function renderPaywall(ctx) {
    return `
      <div class="fiq-paywall">
        <span class="fiq-badge fiq-badge--extreme">LIMITE ATTEINTE</span>
        <h1>Tu as utilisé ton scan gratuit</h1>
        <p class="fiq-muted">Passe au Pro pour des scans illimités, l'accès complet aux piliers et ton plan complet.</p>
        <ul class="fiq-paywall-list">
          <li>Scans illimités</li>
          <li>Les 4 piliers débloqués</li>
          <li>Plan d'amélioration complet</li>
        </ul>
        <a href="mailto:contact@morphindex.com?subject=Liste%20d'attente%20Pro" class="fiq-btn-green fiq-btn-green--full">Rejoindre la liste d'attente</a>
        <button type="button" class="fiq-action-outline fiq-btn-green--full" data-action="view-plan">Voir le plan actuel</button>
      </div>`;
  }

  function renderAnalysesList(ctx) {
    const list = ctx.analyses || [];
    if (!list.length) {
      return `
        <div class="fiq-empty">
          <h2>Aucun scan pour l'instant</h2>
          <p class="fiq-muted">Tes scans faciaux apparaîtront ici avec les scores et les dates.</p>
          <button type="button" class="fiq-btn-green" data-action="new-analysis">Nouveau scan</button>
        </div>`;
    }
    return `
      <div class="fiq-list-head">
        <h2>${list.length} scan${list.length > 1 ? 's' : ''}</h2>
        <button type="button" class="fiq-btn-green fiq-btn-green--sm" data-action="new-analysis">Nouveau scan</button>
      </div>
      <div class="fiq-scan-list">
        ${list.map((a) => `
          <button type="button" class="fiq-scan-row" data-action="view-result" data-id="${a.id}">
            <img src="${esc(a.photo)}" alt="">
            <div>
              <strong>${a.score}/10</strong>
              <span>${esc(ctx.formatDate(a.createdAt))}</span>
              <span class="fiq-muted">Faible : ${PILLAR_LABELS[a.weakPillar] || a.weakPillar}</span>
            </div>
            <span class="fiq-scan-arrow">›</span>
          </button>`).join('')}
      </div>`;
  }

  function renderProgression(ctx) {
    const list = ctx.analyses || [];
    if (!list.length) {
      return `
        <div class="fiq-empty">
          <h2>Aucune donnée de progression</h2>
          <p class="fiq-muted">Lance au moins un scan pour voir ta courbe de score.</p>
          <button type="button" class="fiq-btn-green" data-action="new-analysis">Lancer un scan</button>
        </div>`;
    }
    const w = 600; const h = 160; const pad = 24;
    const scores = list.map((a) => a.score);
    const min = Math.max(0, Math.min(...scores) - 0.5);
    const max = Math.min(10, Math.max(...scores) + 0.5);
    const range = max - min || 1;
    const points = list.map((a, i) => {
      const x = pad + (i / Math.max(list.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - ((a.score - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    }).join(' ');
    const delta = list.length > 1 ? round1(list[list.length - 1].score - list[0].score) : 0;
    return `
      <h2 class="fiq-page-title">Progression</h2>
      <div class="fiq-card fiq-chart-card">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <polyline points="${points}" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
          ${list.map((a, i) => {
            const x = pad + (i / Math.max(list.length - 1, 1)) * (w - pad * 2);
            const y = h - pad - ((a.score - min) / range) * (h - pad * 2);
            return `<circle cx="${x}" cy="${y}" r="5" fill="#111"/>`;
          }).join('')}
        </svg>
      </div>
      <div class="fiq-plan-stats">
        <div class="fiq-plan-stat"><span>Premier</span><strong>${list[0].score}</strong></div>
        <div class="fiq-plan-stat"><span>Dernier</span><strong>${list[list.length - 1].score}</strong></div>
        <div class="fiq-plan-stat"><span>Évolution</span><strong>${delta >= 0 ? '+' : ''}${delta}</strong></div>
      </div>`;
  }

  function renderSettings(ctx) {
    return `
      <h2 class="fiq-page-title">Paramètres</h2>
      <div class="fiq-card fiq-settings-card">
        <p class="fiq-mvp-notice">Version MVP — ton compte et tes analyses sont stockés dans ce navigateur uniquement. Ils seront perdus si tu vides tes données de navigation ou changes d'appareil.</p>
        <div class="fiq-settings-row"><span>Compte</span><strong>${esc(ctx.session.name)}</strong></div>
        <div class="fiq-settings-row"><span>E-mail</span><strong>${esc(ctx.session.email)}</strong></div>
        <div class="fiq-settings-row"><span>Offre</span><strong>${esc(ctx.accountTierLabel())}</strong></div>
        ${!ctx.isPro() ? '<button type="button" class="fiq-btn-lock fiq-btn-lock--full" data-action="upgrade-pro"><span aria-hidden="true">🔒</span> Passer au Pro</button>' : ''}
      </div>
      <div class="fiq-card fiq-settings-card">
        <button type="button" class="fiq-settings-export" data-action="export-analyses">Exporter mes analyses (JSON)</button>
        <button type="button" class="fiq-settings-danger" data-action="clear-analyses">Supprimer tous les scans</button>
        <button type="button" class="fiq-settings-danger" data-action="logout">Se déconnecter</button>
      </div>`;
  }

  function renderAnalysisBody(analysis, state, ctx) {
    switch (state.tab) {
      case 'analyse': return renderAnalyseTab(analysis, ctx);
      case 'plan': return renderPlanTab(analysis, ctx);
      case 'simuler': return renderSimulateTab(analysis, ctx);
      case 'gpt': return renderGptTab();
      default: return renderOverview(analysis, ctx);
    }
  }

  function renderApp(state, ctx) {
    let body = '';
    const showTabs = analysis => state.flow === 'result' || (state.view === 'dashboard' && analysis) || (state.view === 'plan' && analysis);

    if (state.flow === 'upload') body = renderUpload(ctx);
    else if (state.flow === 'analyzing') body = renderAnalyzing(ctx);
    else if (state.flow === 'paywall') body = renderPaywall(ctx);
    else if (state.flow === 'result') {
      const analysis = ctx.analysis;
      body = analysis
        ? renderAnalysisBody(analysis, state, ctx)
        : '<div class="fiq-empty"><h2>Scan introuvable</h2><button type="button" class="fiq-btn-green" data-action="fiq-nav" data-view="analyses">Retour aux scans</button></div>';
    } else if (state.view === 'analyses') body = renderAnalysesList(ctx);
    else if (state.view === 'progression') body = renderProgression(ctx);
    else if (state.view === 'settings') body = renderSettings(ctx);
    else if (state.view === 'plan') {
      body = ctx.analysis ? renderPlanTab(ctx.analysis, ctx) : renderWelcome(ctx);
    } else {
      body = ctx.analysis ? renderAnalysisBody(ctx.analysis, state, ctx) : renderWelcome(ctx);
    }

    const analysis = ctx.analysis;
    const tabsVisible = showTabs(analysis) && !state.flow;
    const showSidebar = tabsVisible || (state.view !== 'dashboard' && !state.flow);

    return `
      <div class="fiq-app${showSidebar ? ' has-sidebar' : ''}">
        ${showSidebar ? renderSidebar(state, ctx) : ''}
        <div class="fiq-main">
          ${state.flow && state.flow !== 'result' ? renderFlowHeader(state) : ''}
          ${!showSidebar && tabsVisible ? `<header class="fiq-mobile-bar"><button type="button" class="fiq-icon-btn fiq-menu-mobile" data-action="fiq-menu">☰</button>${renderLogo()}</header>` : ''}
          ${tabsVisible ? renderWorkspaceNav(state.tab, ctx) : ''}
          <div class="fiq-workspace">${body}</div>
        </div>
        ${renderDrawer(state, ctx)}
      </div>`;
  }

  window.MorphFaceIQ = {
    PILLAR_ORDER,
    PILLAR_LABELS,
    renderApp
  };
})();
