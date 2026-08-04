import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `trailingSlash: true` a été retiré volontairement.
  //
  // Il venait de l'ancien site statique, où /conditions/ était un dossier.
  // Sur l'app Next, il faisait rediriger toute route /api/x vers /api/x/ en
  // 308 — or Stripe ne suit pas les redirections : le webhook déclaré sur
  // https://www.morphindex.com/api/stripe/webhook n'aurait jamais été livré,
  // et aucun paiement n'aurait débloqué de rapport, sans erreur visible.
  //
  // Le sitemap émettait déjà des URL sans slash final, ce que la config
  // contredisait.
};

export default nextConfig;
