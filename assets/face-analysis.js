/**
 * Morphindex — Analyse faciale MediaPipe (navigateur)
 * Landmarks → ratios → scores PSL
 */

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const LM = {
  forehead: 10,
  chin: 152,
  noseTip: 1,
  noseBridge: 168,
  leftCheek: 234,
  rightCheek: 454,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftMouth: 61,
  rightMouth: 291,
  upperLip: 13,
  leftJaw: 172,
  rightJaw: 397,
  leftBrow: 107,
  rightBrow: 336
};

let landmarker = null;
let landmarkerPromise = null;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

const { round1 } = window.MorphUtils;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleDeg(ax, ay, bx, by) {
  return (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
}

function scoreFromIdeal(value, ideal, spread, maxScore = 9.5) {
  const diff = Math.abs(value - ideal);
  return round1(clamp(maxScore - (diff / spread) * 4.5, 4.5, maxScore));
}

function scoreHigherBetter(value, good, spread) {
  return round1(clamp(5 + ((value - good) / spread) * 3, 4.5, 9.2));
}

function scoreLowerBetter(value, good, spread) {
  return round1(clamp(9 - ((value - good) / spread) * 3, 4.5, 9.2));
}

async function loadVisionModule() {
  if (window.FaceLandmarker && window.FilesetResolver) {
    return { FaceLandmarker: window.FaceLandmarker, FilesetResolver: window.FilesetResolver };
  }
  await Promise.race([
    new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        try {
          const { FaceLandmarker, FilesetResolver } = await import("${WASM_URL.replace('/wasm', '')}/vision_bundle.mjs");
          window.FaceLandmarker = FaceLandmarker;
          window.FilesetResolver = FilesetResolver;
          window.dispatchEvent(new Event('mp-vision-ready'));
        } catch (err) {
          window.dispatchEvent(new CustomEvent('mp-vision-error', { detail: err }));
        }
      `;
      s.onerror = () => reject(new Error('MODEL_LOAD_FAILED'));
      window.addEventListener('mp-vision-ready', resolve, { once: true });
      window.addEventListener('mp-vision-error', () => reject(new Error('MODEL_LOAD_FAILED')), { once: true });
      document.head.appendChild(s);
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('MODEL_LOAD_TIMEOUT')), 30000))
  ]);
  return { FaceLandmarker: window.FaceLandmarker, FilesetResolver: window.FilesetResolver };
}

export async function initFaceLandmarker() {
  if (landmarker) return landmarker;
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const { FaceLandmarker, FilesetResolver } = await loadVisionModule();
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    try {
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });
    } catch {
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });
    }
    return landmarker;
  })();

  return landmarkerPromise;
}

export async function detectFaceLandmarks(img) {
  const detector = await initFaceLandmarker();
  const result = detector.detect(img);
  if (!result.faceLandmarks?.length) {
    throw new Error('NO_FACE');
  }
  return result.faceLandmarks[0];
}

function computeSymmetryScore(lm) {
  const axis = lm[LM.noseTip].x;
  const pairs = [
    [LM.leftEyeOuter, LM.rightEyeOuter],
    [LM.leftEyeInner, LM.rightEyeInner],
    [LM.leftMouth, LM.rightMouth],
    [LM.leftCheek, LM.rightCheek],
    [LM.leftBrow, LM.rightBrow]
  ];
  let total = 0;
  pairs.forEach(([l, r]) => {
    const dl = Math.abs(lm[l].x - axis);
    const dr = Math.abs(lm[r].x - axis);
    const ratio = Math.min(dl, dr) / Math.max(dl, dr, 0.001);
    total += ratio;
  });
  return round1(clamp(4.5 + (total / pairs.length) * 5, 4.5, 9.5));
}

function computeCanthalTilt(lm) {
  const left = angleDeg(lm[LM.leftEyeInner].x, lm[LM.leftEyeInner].y, lm[LM.leftEyeOuter].x, lm[LM.leftEyeOuter].y);
  const right = angleDeg(lm[LM.rightEyeInner].x, lm[LM.rightEyeInner].y, lm[LM.rightEyeOuter].x, lm[LM.rightEyeOuter].y);
  const avg = (left + (-right)) / 2;
  return { degrees: round1(avg), score: scoreHigherBetter(avg, 4, 8) };
}

function computeRatios(lm) {
  const faceWidth = dist(lm[LM.leftCheek], lm[LM.rightCheek]);
  const faceHeight = dist(lm[LM.forehead], lm[LM.chin]);
  const midfaceHeight = dist(lm[LM.noseBridge], lm[LM.upperLip]);
  const jawWidth = dist(lm[LM.leftJaw], lm[LM.rightJaw]);
  const ipd = dist(lm[LM.leftEyeInner], lm[LM.rightEyeInner]);

  const fwhr = faceWidth / Math.max(midfaceHeight, 0.001);
  const jawRatio = jawWidth / Math.max(faceWidth, 0.001);
  const lowerThird = dist(lm[LM.noseTip], lm[LM.chin]) / Math.max(faceHeight, 0.001);
  const canthal = computeCanthalTilt(lm);
  const symmetry = computeSymmetryScore(lm);

  return {
    fwhr: round1(fwhr),
    jawRatio: round1(jawRatio),
    lowerThird: round1(lowerThird),
    canthalTilt: canthal.degrees,
    ipd: round1(ipd * 1000),
    symmetry,
    canthalScore: canthal.score
  };
}

function analyzeSkinFromImage(img, lm) {
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  function sampleRegion(indices, size = 12) {
    let sum = 0;
    let sumSq = 0;
    let n = 0;
    indices.forEach((idx) => {
      const p = lm[idx];
      const cx = Math.round(p.x * w);
      const cy = Math.round(p.y * h);
      for (let dy = -size; dy <= size; dy += 4) {
        for (let dx = -size; dx <= size; dx += 4) {
          const x = clamp(cx + dx, 0, w - 1);
          const y = clamp(cy + dy, 0, h - 1);
          const d = ctx.getImageData(x, y, 1, 1).data;
          const lum = 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2];
          sum += lum;
          sumSq += lum * lum;
          n++;
        }
      }
    });
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    return { mean, variance: Math.max(0, variance) };
  }

  const leftCheek = sampleRegion([LM.leftCheek, 205, 187]);
  const rightCheek = sampleRegion([LM.rightCheek, 425, 411]);
  const underEye = sampleRegion([LM.leftEyeInner, LM.rightEyeInner, 145, 374], 8);

  const avgVariance = (leftCheek.variance + rightCheek.variance) / 2;
  const evenness = scoreLowerBetter(avgVariance, 180, 120);
  const cheekLum = (leftCheek.mean + rightCheek.mean) / 2;
  const darkCircleDelta = cheekLum - underEye.mean;
  const underEyeScore = scoreHigherBetter(darkCircleDelta, 8, 25);
  const overall = round1(evenness * 0.55 + underEyeScore * 0.45);

  return { evenness, underEyeScore, overall };
}

export function metricsToPillars(ratios, skinDetail) {
  const skinScore = skinDetail.overall;
  const harmonie = round1(
    ratios.symmetry * 0.35 +
    scoreFromIdeal(ratios.fwhr, 1.95, 0.22) * 0.35 +
    scoreFromIdeal(ratios.lowerThird, 0.33, 0.06) * 0.3
  );

  const angularite = round1(
    scoreFromIdeal(ratios.jawRatio, 0.82, 0.08) * 0.4 +
    scoreFromIdeal(ratios.fwhr, 1.98, 0.25) * 0.35 +
    ratios.canthalScore * 0.25
  );

  const dimorphisme = round1(
    scoreFromIdeal(ratios.jawRatio, 0.85, 0.07) * 0.35 +
    scoreFromIdeal(ratios.lowerThird, 0.34, 0.05) * 0.35 +
    scoreFromIdeal(ratios.fwhr, 2.0, 0.2) * 0.3
  );

  const peau = skinScore;

  return { harmonie, angularite, dimorphisme, peau };
}

export async function analyzeFaceImage(img) {
  const landmarks = await detectFaceLandmarks(img);
  const ratios = computeRatios(landmarks);
  const skinDetail = analyzeSkinFromImage(img, landmarks);
  const pillars = metricsToPillars(ratios, skinDetail);

  const score = round1(
    pillars.harmonie * 0.3 +
    pillars.angularite * 0.28 +
    pillars.dimorphisme * 0.22 +
    pillars.peau * 0.2
  );

  const weakPillar = Object.entries(pillars).sort((a, b) => a[1] - b[1])[0][0];
  const boost = round1(0.35 + (10 - score) * 0.06);
  const potential = round1(Math.min(10, score + boost));

  return {
    score,
    potential,
    pillars,
    ratios,
    skinDetail,
    weakPillar,
    landmarksDetected: landmarks.length,
    analysisType: 'mediapipe'
  };
}

export function deriveSubmetrics(ratios, skinDetail, pillars) {
  const jawScore = scoreFromIdeal(ratios.jawRatio, 0.82, 0.08);
  const jawDimorph = scoreFromIdeal(ratios.jawRatio, 0.85, 0.07);
  const fwhrHarmonie = scoreFromIdeal(ratios.fwhr, 1.95, 0.22);
  const proportions = scoreFromIdeal(ratios.lowerThird, 0.33, 0.06);

  return {
    harmonie: {
      symetrie: ratios.symmetry,
      proportions,
      fwhr: fwhrHarmonie,
      yeux: ratios.canthalScore
    },
    angularite: {
      mandibule: jawScore,
      pommettes: scoreFromIdeal(ratios.fwhr, 1.98, 0.25),
      bf: scoreLowerBetter(ratios.jawRatio, 0.78, 0.12),
      mewing: round1(clamp(5.8 + (jawScore - 6.5) * 0.15, 5.5, 7.2))
    },
    dimorphisme: {
      machoire: jawDimorph,
      brow: round1(ratios.symmetry * 0.55 + fwhrHarmonie * 0.45),
      testo: round1(jawDimorph * 0.5 + scoreFromIdeal(ratios.fwhr, 2.0, 0.2) * 0.5),
      presence: round1(clamp(6.4 + (pillars.angularite - 6.5) * 0.2, 6.0, 7.8))
    },
    peau: {
      texture: skinDetail.evenness,
      acne: round1(clamp(skinDetail.evenness - 0.3, 4.5, 9)),
      teint: skinDetail.underEyeScore,
      hydratation: round1(skinDetail.evenness * 0.55 + skinDetail.underEyeScore * 0.45)
    }
  };
}

export function getAnalysisSteps() {
  return window.MorphUtils.ANALYSIS_STEPS;
}
