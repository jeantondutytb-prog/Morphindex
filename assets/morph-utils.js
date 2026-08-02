/**
 * Morphindex — utilitaires partagés (classic script + face-analysis ES module)
 */
(function () {
  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  const ANALYSIS_STEPS = [
    'Chargement du modèle IA…',
    'Détection du visage…',
    'Calcul de 12+ ratios faciaux…',
    'Analyse des 4 piliers PSL…',
    'Génération du plan personnalisé…'
  ];

  window.MorphUtils = { round1, ANALYSIS_STEPS };
})();
