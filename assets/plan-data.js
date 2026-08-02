/**
 * Morphindex — Base de données des plans (mock MVP)
 *
 * COMMENT ENRICHIR :
 * - pillars.<pilier>.submetrics → sous-scores affichés (label + description)
 * - pillars.<pilier>.actions → actions du plan (tu peux en ajouter autant que tu veux)
 *
 * Champs d'une action :
 * - id          : identifiant unique
 * - title       : titre court
 * - impact      : 'élevé' | 'moyen' | 'faible'
 * - targets     : ids des submetrics concernés (priorise si score bas)
 * - why         : pourquoi ({{score}}, {{potential}}, {{submetrics.texture}}, etc.)
 * - duration    : délai pour voir des résultats
 * - frequency   : rythme d'application
 * - gain        : gain PSL estimé
 * - steps       : étapes concrètes (strings)
 * - products    : (optionnel) exemples produits
 * - avoid       : (optionnel) ce qu'il faut éviter
 * - maxing      : 'soft' | 'hard' | 'both' — filtre selon le style choisi
 */
window.MorphPlanDB = {
  version: 2,
  maxingLabels: {
    soft: 'Softmaxing',
    hard: 'Hardmaxing'
  },
  pillars: {
    peau: {
      submetrics: [
        { id: 'texture', label: 'Texture & pores', desc: 'Uniformité et grain de peau' },
        { id: 'acne', label: 'Acné & imperfections', desc: 'Boutons, points noirs, rougeurs' },
        { id: 'teint', label: 'Teint & hyperpigmentation', desc: 'Cernes, taches, dullness' },
        { id: 'hydratation', label: 'Hydratation', desc: 'Barrière cutanée et souplesse' }
      ],
      actions: [
        {
          id: 'routine-base',
          title: 'Routine skincare AM/PM structurée',
          impact: 'élevé',
          targets: ['texture', 'hydratation', 'teint'],
          why: 'Ton score Peau ({{score.peau}}) est tiré vers le bas par la texture ({{submetrics.texture}}) et l\'hydratation ({{submetrics.hydratation}}). Une routine stable est le levier #1.',
          duration: '6–10 semaines',
          frequency: 'Matin + soir, quotidien',
          gain: '+0.4 à +0.7 PSL',
          steps: [
            'AM : nettoyant doux → sérum vitamine C 10–15% → hydratant léger → SPF 50',
            'PM : double nettoyage (huile + gel) → niacinamide 10% → crème barrière',
            '2×/sem : AHA 5–8% le soir (pas le même soir que rétinol)',
            'Tracker photos hebdo même lumière pour mesurer la progression'
          ],
          products: ['CeraVe Hydrating Cleanser', 'La Roche-Posay Anthelios SPF', 'The Ordinary Niacinamide 10%'],
          avoid: ['Sur-nettoyage', 'Changer de produits chaque semaine', 'SPF oublié'],
          maxing: 'both'
        },
        {
          id: 'actifs-cibles',
          title: 'Actifs ciblés selon ton profil',
          impact: 'élevé',
          targets: ['acne', 'texture'],
          maxing: 'hard',
          why: 'Imperfections actives détectées (score acné {{submetrics.acne}}). Cibler inflammation + renouvellement cellulaire.',
          duration: '8–12 semaines',
          frequency: '3–5 soirs / semaine',
          gain: '+0.3 à +0.5 PSL',
          steps: [
            'Introduire rétinol 0.2–0.3% → monter progressivement sur 6 semaines',
            'Spot treatment salicylique 2% sur zones actives uniquement',
            'Pas de gommage physique agressif — chimique uniquement',
            'Si irritation : pause 3 jours, reprendre à dose plus basse'
          ],
          products: ['Adapalène 0.1% (si acné modérée)', 'Paula\'s Choice 2% BHA'],
          avoid: ['Mélanger rétinol + AHA même soir au début', 'Extraire les boutons']
        },
        {
          id: 'lifestyle-peau',
          title: 'Optimisation lifestyle peau',
          impact: 'moyen',
          targets: ['teint', 'hydratation'],
          why: 'Teint ({{submetrics.teint}}) et cernes impactent la perception globale même avec une bonne structure osseuse.',
          duration: '3–4 semaines',
          frequency: 'Quotidien',
          gain: '+0.2 à +0.3 PSL',
          steps: [
            'Sommeil 7h30 minimum — régularité des horaires',
            '2L eau / jour + limiter alcool (déshydratation + flush)',
            'Oreiller satin + changer ta taie 2×/sem (bactéries)',
            '10 min de marche post-repas (glycémie → inflammation cutanée)'
          ],
          maxing: 'soft'
        },
        {
          id: 'professionnel-peau',
          title: 'Option pro : peeling / laser léger',
          impact: 'moyen',
          targets: ['texture', 'teint'],
          maxing: 'hard',
          why: 'Si scores texture/teint < 6.5 après 3 mois de routine, un pro peut accélérer.',
          duration: '1–3 séances',
          frequency: 'Trimestriel',
          gain: '+0.2 à +0.4 PSL',
          steps: [
            'Consultation dermato esthétique avec photos avant/après',
            'Peeling superficiel ou microneedling selon profil',
            'Arrêt actifs irritants 5 jours post-traitement'
          ]
        },
        {
          id: 'soins-doux-peau',
          title: 'Routine douce & barrière cutanée',
          impact: 'élevé',
          targets: ['texture', 'hydratation', 'acne'],
          maxing: 'soft',
          why: 'Approche softmax : stabiliser la peau (texture {{submetrics.texture}}) sans actifs agressifs.',
          duration: '6–8 semaines',
          frequency: 'Matin + soir',
          gain: '+0.3 à +0.5 PSL',
          steps: [
            'Nettoyant non moussant + hydratant ceramides uniquement',
            'Pas de rétinol/AHA tant que la barrière est irritée',
            'SPF 50 quotidien — protection anti-inflammation',
            'Introduire 1 seul actif à la fois après 4 semaines stables'
          ],
          products: ['CeraVe PM', 'La Roche-Posay Toleriane', 'Avène Cicalfate']
        }
      ]
    },
    angularite: {
      submetrics: [
        { id: 'mandibule', label: 'Définition mâchoire', desc: 'Angle gonial et ligne mandibulaire' },
        { id: 'pommettes', label: 'Pommettes & midface', desc: 'Projection et ombres' },
        { id: 'bf', label: 'Masse grasse faciale', desc: 'Buccal fat et rétention d\'eau' },
        { id: 'mewing', label: 'Posture mandibulaire', desc: 'Position langue et posture' }
      ],
      actions: [
        {
          id: 'cut-bf',
          title: 'Descendre à 12–14% de body fat',
          impact: 'élevé',
          targets: ['bf', 'mandibule', 'pommettes'],
          why: 'Masse grasse faciale élevée (score {{submetrics.bf}}) — c\'est souvent le levier #1 pour l\'angularité. Ton score Angularité : {{score.angularite}}.',
          duration: '12–20 semaines',
          frequency: 'Daily deficit + training',
          gain: '+0.5 à +1.0 PSL',
          steps: [
            'Déficit calorique modéré −300 à −500 kcal (pas crash diet)',
            'Protéines 1.8–2g/kg pour préserver la masse musculaire',
            'Training force 3–4×/sem + NEAT élevé (marche 8–10k pas)',
            'Limiter sodium les 48h avant un scan de comparaison (rétention eau)',
            'Photo mensuelle même angle/lumière pour valider'
          ],
          avoid: ['Cut trop agressif (<8% body fat long terme)', 'Ignorer le sommeil'],
          maxing: 'hard'
        },
        {
          id: 'jaw-work',
          title: 'Protocole mâchoire & posture',
          impact: 'moyen',
          targets: ['mewing', 'mandibule'],
          maxing: 'soft',
          why: 'Définition mandibulaire ({{submetrics.mandibule}}) améliorable par posture + hypertrophie masseter modérée.',
          duration: '8–16 semaines',
          frequency: 'Quotidien',
          gain: '+0.2 à +0.4 PSL',
          steps: [
            'Mewing : langue palate entier, lèvres sealed, dents légèrement contact',
            'Chewing gum sans sucre 15–20 min/jour (pas plus — masseter excessif)',
            'Exercices neck curl 3×/sem pour profil cou/mâchoire',
            'Éviter mouth breathing — consult ORL si besoin'
          ]
        },
        {
          id: 'contouring',
          title: 'Coiffure & grooming angularité',
          impact: 'moyen',
          targets: ['pommettes', 'mandibule'],
          maxing: 'soft',
          why: 'Le framing visuel peut ajouter 0.2–0.3 point perçu en angularité sans chirurgie.',
          duration: 'Immédiat',
          frequency: 'Permanent',
          gain: '+0.1 à +0.3 PSL',
          steps: [
            'Coupe avec fade serré côtés + volume contrôlé dessus',
            'Barbe : dégradé court sur mâchoire si patchy → sinon clean shave',
            'Contour léger sous pommettes en lumière naturelle (optionnel)'
          ]
        },
        {
          id: 'chirurgie-angularite',
          title: 'Consultation options chirurgicales',
          impact: 'élevé',
          targets: ['bf', 'mandibule', 'pommettes'],
          maxing: 'hard',
          why: 'Approche hardmax : structure osseuse/grasse (BF {{submetrics.bf}}, mâchoire {{submetrics.mandibule}}) — options invasives si objectif max.',
          duration: 'Variable',
          frequency: 'Consultation initiale',
          gain: '+0.5 à +1.5 PSL',
          steps: [
            'Consult maxillo-facial : évaluer buccal fat removal / implants mâchoire',
            'Photos standards PSL + scan 3D si disponible',
            'Comparer risques/bénéfices vs cut BF seul',
            'Ne jamais décider sans 2 avis médicaux'
          ],
          avoid: ['Chirurgie esthétique impulsive', 'Ignorer la rééducation post-op']
        }
      ]
    },
    harmonie: {
      submetrics: [
        { id: 'symetrie', label: 'Symétrie faciale', desc: 'Équilibre gauche/droite' },
        { id: 'proportions', label: 'Proportions thirds', desc: 'Règle des thirds et fifths' },
        { id: 'fwhr', label: 'Facial width-to-height', desc: 'Ratio largeur/hauteur du visage' },
        { id: 'yeux', label: 'Spacing & canthal tilt', desc: 'Espacement et inclinaison oculaire' }
      ],
      actions: [
        {
          id: 'coiffure-harmonie',
          title: 'Coiffure corrective proportions',
          impact: 'élevé',
          targets: ['proportions', 'fwhr'],
          maxing: 'soft',
          why: 'Proportions ({{submetrics.proportions}}) et fWHR ({{submetrics.fwhr}}) — la coiffure compense le haut/bas du visage.',
          duration: 'Immédiat',
          frequency: 'Permanent',
          gain: '+0.2 à +0.5 PSL',
          steps: [
            'Front large → frange texturée ou volume latéral (pas slick back)',
            'Visage long → volume sur les côtés, pas de hauteur excessive',
            'Demander un barber qui connaît les face shapes',
            'Photo profil + face avant chaque coupe'
          ]
        },
        {
          id: 'sourcils',
          title: 'Restructuration sourcils',
          impact: 'moyen',
          targets: ['symetrie', 'yeux'],
          maxing: 'both',
          why: 'Symétrie ({{submetrics.symetrie}}) — sourcils asymétriques = perception d\'harmonie réduite.',
          duration: '2–4 semaines',
          frequency: 'Hebdo',
          gain: '+0.1 à +0.3 PSL',
          steps: [
            'Mapper le point de départ, arch peak et tail au crayon',
            'Épiler uniquement sous l\'arc naturel — pas de sur-épilation',
            'Brow gel pour uniformiser direction',
            'Comparer gauche/droite en photo miroir'
          ]
        },
        {
          id: 'mewing-harmonie',
          title: 'Mewing & correction posture crânio',
          impact: 'moyen',
          targets: ['symetrie', 'proportions'],
          maxing: 'soft',
          why: 'Asymétries légères parfois liées à posture — amélioration progressive possible.',
          duration: '6–12 mois',
          frequency: 'Quotidien',
          gain: '+0.1 à +0.2 PSL',
          steps: [
            'Posture langue + posture cervicale (chin tucks 2×10/jour)',
            'Dormir dos quand possible — éviter face plant oreiller',
            'Photo mensuelle même angle pour tracker'
          ]
        },
        {
          id: 'fillers-harmonie',
          title: 'Fillers / harmonisation médicale',
          impact: 'moyen',
          targets: ['proportions', 'fwhr', 'symetrie'],
          maxing: 'hard',
          why: 'Hardmax : corriger proportions ({{submetrics.proportions}}) et fWHR ({{submetrics.fwhr}}) par voie médicale.',
          duration: '1–2 séances',
          frequency: 'Annuel (entretien)',
          gain: '+0.3 à +0.8 PSL',
          steps: [
            'Consult medecin esthétique spécialisé visage masculin',
            'Commencer conservateur : menton ou jawline, pas sur-correction',
            'Photos avant/après à J+14 et J+90',
            'Éviter sur-fill lèvres / pommettes « femme »'
          ],
          avoid: ['Med spa non qualifié', 'Sur-correction en une séance']
        }
      ]
    },
    dimorphisme: {
      submetrics: [
        { id: 'machoire', label: 'Mâchoire & menton', desc: 'Largeur et projection masculine' },
        { id: 'brow', label: 'Brow ridge & sourcils', desc: 'Arcade sourcilière' },
        { id: 'testo', label: 'Traits testo perçus', desc: 'Peau, pilosité, structure' },
        { id: 'presence', label: 'Présence & stature', desc: 'Posture et épaules' }
      ],
      actions: [
        {
          id: 'testo-lifestyle',
          title: 'Optimisation testostérone naturelle',
          impact: 'élevé',
          targets: ['testo', 'machoire'],
          maxing: 'hard',
          why: 'Score dimorphisme ({{score.dimorphisme}}) — traits testo perçus à {{submetrics.testo}}. Sommeil + training + nutrition = base.',
          duration: '8–12 semaines',
          frequency: 'Quotidien',
          gain: '+0.3 à +0.6 PSL',
          steps: [
            'Sommeil 7–9h, coucher avant minuit régulier',
            'Zinc 15–25mg + vitamine D si carence (bilan sanguin)',
            'Compound lifts 3×/sem : squat, deadlift, overhead press',
            'Limiter alcool (↓ testo) et plastiques chauffés (BPAs)',
            'Gérer stress chronique (cortisol antagoniste)'
          ]
        },
        {
          id: 'barbe-dimorphisme',
          title: 'Barbe structurée ou clean shave',
          impact: 'moyen',
          targets: ['machoire', 'testo'],
          maxing: 'soft',
          why: 'Mâchoire ({{submetrics.machoire}}) — barbe bien structurée renforce le dimorphisme perçu.',
          duration: '2–4 semaines',
          frequency: 'Quotidien',
          gain: '+0.2 à +0.4 PSL',
          steps: [
            'Si densité correcte : barbe courte 3–5mm, ligne joues/nette',
            'Si patchy : clean shave + focus peau nette',
            'Minoxidil barbe seulement si 22+ et informé des effets',
            'Huile barbe légère pour texture — pas de brillance excessive'
          ]
        },
        {
          id: 'posture-presence',
          title: 'Posture & présence physique',
          impact: 'moyen',
          targets: ['presence', 'machoire'],
          maxing: 'both',
          why: 'Présence ({{submetrics.presence}}) — épaules et cou impactent fortement le dimorphisme perçu.',
          duration: '4–8 semaines',
          frequency: 'Quotidien',
          gain: '+0.1 à +0.3 PSL',
          steps: [
            'Épaules en arrière et bas — pas shrugging',
            'Cou visible (cols V) — éviter cols montants massifs',
            'Marche déterminée, regard horizontal (pas sol)',
            'Dead hangs 3×30s/jour pour posture épaules'
          ]
        }
      ]
    }
  }
};
