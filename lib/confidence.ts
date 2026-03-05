interface OnboardingData {
  step1?: Record<string, string>;
  step2?: Record<string, string>;
  step3?: Record<string, string>;
  step4?: Record<string, string>;
  step5?: Record<string, string>;
  step6?: Record<string, string>;
}

export function calculateIcpConfidence(data: OnboardingData): number {
  let score = 0;
  const weights = {
    offer: 15,
    problem: 15,
    pricingRange: 10,
    salesCycleRange: 10,
    geoTargets: 5,
    icpHypothesis: 10,
    bestCustomer1: 10,
    bestCustomer2: 5,
    lostDeal: 10,
    disqualifiers: 10,
  };

  const s1 = data.step1 || {};
  const s2 = data.step2 || {};
  const s4 = data.step4 || {};

  if (s1.offer && s1.offer.length > 30) score += weights.offer;
  else if (s1.offer && s1.offer.length > 10) score += weights.offer * 0.5;

  if (s1.problem && s1.problem.length > 30) score += weights.problem;
  else if (s1.problem && s1.problem.length > 10) score += weights.problem * 0.5;

  if (s1.pricingRange) score += weights.pricingRange;
  if (s1.salesCycleRange) score += weights.salesCycleRange;
  if (s1.geoTargets) score += weights.geoTargets;

  if (s1.icpHypothesis && s1.icpHypothesis.length > 20)
    score += weights.icpHypothesis;

  if (s2.bestCustomer1 && s2.bestCustomer1.length > 30)
    score += weights.bestCustomer1;
  if (s2.bestCustomer2 && s2.bestCustomer2.length > 20)
    score += weights.bestCustomer2;
  if (s2.lostDeal && s2.lostDeal.length > 20) score += weights.lostDeal;

  const disqualifiers = s4.disqualifiers || "";
  const disqCount = disqualifiers
    .split("\n")
    .filter((d: string) => d.trim().length > 5).length;
  if (disqCount >= 3) score += weights.disqualifiers;
  else if (disqCount >= 1) score += weights.disqualifiers * 0.4;

  return Math.min(Math.round(score), 100);
}

export function calculateDmuConfidence(data: OnboardingData): number {
  let score = 0;
  const s5 = data.step5 || {};

  const roles = [
    "economicBuyer",
    "champion",
    "technicalBuyer",
    "endUser",
    "influencer",
  ];
  const filledRoles = roles.filter(
    (r) => s5[r] && s5[r].length > 10
  ).length;

  score += (filledRoles / roles.length) * 60;

  if (s5.objections && s5.objections.length > 20) score += 20;
  if (s5.titles && s5.titles.length > 10) score += 20;

  return Math.min(Math.round(score), 100);
}

export function checkStrictGate(
  icpConfidence: number,
  dmuConfidence: number,
  data: OnboardingData
): { passed: boolean; missing: string[] } {
  const missing: string[] = [];
  const s1 = data.step1 || {};
  const s2 = data.step2 || {};
  const s4 = data.step4 || {};
  const s5 = data.step5 || {};

  if (!s1.offer || s1.offer.length < 30)
    missing.push("Clear offer description (min 30 chars)");
  if (!s1.problem || s1.problem.length < 30)
    missing.push("Problem statement (min 30 chars)");
  if (!s1.pricingRange) missing.push("Pricing range");
  if (!s1.salesCycleRange) missing.push("Sales cycle range");

  if (!s2.bestCustomer1 || s2.bestCustomer1.length < 30)
    missing.push("First best customer example (min 30 chars)");
  if (!s2.bestCustomer2 || s2.bestCustomer2.length < 20)
    missing.push("Second best customer example");
  if (!s2.lostDeal || s2.lostDeal.length < 20)
    missing.push("Lost deal + reason");

  const disqCount = (s4.disqualifiers || "")
    .split("\n")
    .filter((d: string) => d.trim().length > 5).length;
  if (disqCount < 3) missing.push(`At least 3 disqualifiers (have ${disqCount})`);

  const roles = [
    "economicBuyer",
    "champion",
    "technicalBuyer",
    "endUser",
    "influencer",
  ];
  const missingRoles = roles.filter((r) => !s5[r] || s5[r].length < 10);
  if (missingRoles.length > 0)
    missing.push(`DMU roles incomplete: ${missingRoles.join(", ")}`);

  if (icpConfidence < 90)
    missing.push(`ICP confidence must be ≥90% (currently ${icpConfidence}%)`);
  if (dmuConfidence < 90)
    missing.push(`DMU confidence must be ≥90% (currently ${dmuConfidence}%)`);

  return { passed: missing.length === 0, missing };
}
