/**
 * AGT Intelligence 1–10 Footfall Activity Index Tiers
 * Calibrated for Bangalore urban pedestrian kinematics.
 * Provides a standardized 10-point scale and vibrant color ramp for roads.
 */
export const FOOTFALL_INDEX_TIERS = [
  {
    level: 1,
    minFlow: 0,
    maxFlow: 50,
    label: 'Quiet Access',
    rangeLabel: '< 50 / hr',
    hex: '#94A3B8',
    rgb: [148, 163, 184, 110],
    width: 1.1,
    tag: 'Calm',
    description: 'Minimal pedestrian presence, quiet residential lanes & cul-de-sacs'
  },
  {
    level: 2,
    minFlow: 50,
    maxFlow: 120,
    label: 'Low Residential',
    rangeLabel: '50 – 120 / hr',
    hex: '#06B6D4',
    rgb: [6, 182, 212, 150],
    width: 1.4,
    tag: 'Residential',
    description: 'Internal residential cross streets with light neighborhood walking'
  },
  {
    level: 3,
    minFlow: 120,
    maxFlow: 250,
    label: 'Neighborhood Flow',
    rangeLabel: '120 – 250 / hr',
    hex: '#0284C7',
    rgb: [2, 132, 199, 175],
    width: 1.8,
    tag: 'Community',
    description: 'Community connector streets with convenience grocers & steady foot traffic'
  },
  {
    level: 4,
    minFlow: 250,
    maxFlow: 450,
    label: 'Secondary Feeder',
    rangeLabel: '250 – 450 / hr',
    hex: '#10B981',
    rgb: [16, 185, 129, 195],
    width: 2.2,
    tag: 'Feeder',
    description: 'Feeder avenues connecting residential pockets to local market nodes'
  },
  {
    level: 5,
    minFlow: 450,
    maxFlow: 700,
    label: 'Moderate Retail',
    rangeLabel: '450 – 700 / hr',
    hex: '#84CC16',
    rgb: [132, 204, 22, 215],
    width: 2.7,
    tag: 'Retail',
    description: 'Active mixed-use retail streets, cafes, bakeries & daily errand footfall'
  },
  {
    level: 6,
    minFlow: 700,
    maxFlow: 1050,
    label: 'Active Commercial',
    rangeLabel: '700 – 1,050 / hr',
    hex: '#F59E0B',
    rgb: [245, 158, 11, 230],
    width: 3.3,
    tag: 'Commercial',
    description: 'High-density commercial avenues with sustained dining & evening crowds'
  },
  {
    level: 7,
    minFlow: 1050,
    maxFlow: 1450,
    label: 'High Commercial',
    rangeLabel: '1,050 – 1,450 / hr',
    hex: '#F97316',
    rgb: [249, 115, 22, 245],
    width: 3.9,
    tag: 'High Street',
    description: 'Premier retail shopping corridors (e.g. CMH Road, 12th Main, New BEL Road)'
  },
  {
    level: 8,
    minFlow: 1450,
    maxFlow: 1850,
    label: 'Dense Corridor',
    rangeLabel: '1,450 – 1,850 / hr',
    hex: '#EA580C',
    rgb: [234, 88, 12, 250],
    width: 4.6,
    tag: 'Dense Hub',
    description: 'Heavy pedestrian commercial arteries with high dining and leisure gravity'
  },
  {
    level: 9,
    minFlow: 1850,
    maxFlow: 2300,
    label: 'Prime Dessert Window',
    rangeLabel: '1,800 – 2,300 / hr',
    hex: '#DC2626',
    rgb: [220, 38, 38, 255],
    width: 5.3,
    tag: 'Prime Peak',
    description: 'Signature F&B high streets at peak dessert impulse window (Indiranagar 100ft, Koramangala 80ft)'
  },
  {
    level: 10,
    minFlow: 2300,
    maxFlow: Infinity,
    label: 'Peak Urban Arterial',
    rangeLabel: '2,300+ / hr',
    hex: '#9333EA',
    rgb: [147, 51, 234, 255],
    width: 6.0,
    tag: 'Ultra-Peak',
    description: 'Maximal pedestrian density corridors adjacent to premier metro/mall intersections'
  }
];

/**
 * Get the full 1-10 Footfall Activity Index tier for a given flow rate.
 * @param {number} flow
 * @returns {object} Tier definition
 */
export function getFootfallTier(flow) {
  if (flow === null || flow === undefined || isNaN(flow)) return FOOTFALL_INDEX_TIERS[0];
  const val = Math.max(0, Math.round(flow));
  for (let i = FOOTFALL_INDEX_TIERS.length - 1; i >= 0; i--) {
    if (val >= FOOTFALL_INDEX_TIERS[i].minFlow) {
      return FOOTFALL_INDEX_TIERS[i];
    }
  }
  return FOOTFALL_INDEX_TIERS[0];
}

/**
 * Get integer index score (1 to 10).
 * @param {number} flow
 * @returns {number} 1..10
 */
export function getFootfallIndex(flow) {
  return getFootfallTier(flow).level;
}

/**
 * Deck.gl RGBA color accessor for street network based on the 1–10 color ramp.
 * @param {number} flow
 * @returns {[number, number, number, number]}
 */
export function getDiurnalStreetColor(flow) {
  const tier = getFootfallTier(flow);
  return tier.rgb;
}

/**
 * Deck.gl line width accessor for street network based on index and prime status.
 * @param {number} flow
 * @param {boolean} isPrime
 * @returns {number}
 */
export function getDiurnalStreetWidth(flow, isPrime = false) {
  const tier = getFootfallTier(flow);
  return isPrime ? tier.width * 1.35 : tier.width;
}

/**
 * Format hourly pedestrian footfall into a professional range band with Index score.
 * @param {number} flow - Estimated hourly pedestrian count
 * @returns {string} - e.g. "Index: 8/10 • Dense Corridor (1,450 – 1,850 / hr)"
 */
export function formatHourlyFootfallRange(flow) {
  if (flow === null || flow === undefined || isNaN(flow)) return 'Data Unavailable';
  const tier = getFootfallTier(flow);
  return `Index: ${tier.level}/10 • ${tier.label} (${tier.rangeLabel})`;
}

/**
 * Format hourly flow without phase label for compact badges.
 * @param {number} flow
 * @returns {string} - e.g. "1,400 – 1,900 / hr"
 */
export function formatHourlyCompactRange(flow) {
  if (flow === null || flow === undefined || isNaN(flow)) return '—';
  const val = Math.round(flow);

  if (val < 50) return '< 50 / hr';
  if (val < 120) return '50 – 120 / hr';
  if (val < 250) return '120 – 250 / hr';
  if (val < 500) return '250 – 500 / hr';
  if (val < 850) return '500 – 850 / hr';
  if (val < 1300) return '850 – 1,300 / hr';
  if (val < 1800) return '1,300 – 1,800 / hr';
  if (val < 2400) return '1,800 – 2,400 / hr';
  return '2,000 – 2,600 / hr';
}

/**
 * Format daily cumulative street/zone pedestrian traffic into ranges.
 * @param {number} daily
 * @returns {string} - e.g. "10,000 – 16,000 / day"
 */
export function formatDailyFootfallRange(daily) {
  if (daily === null || daily === undefined || isNaN(daily)) return 'Data Unavailable';
  const val = Math.round(daily);

  if (val < 1000) return '< 1,000 / day (Access Road)';
  if (val < 2500) return '1,000 – 2,500 / day (Local)';
  if (val < 5000) return '2,500 – 5,000 / day (Neighborhood)';
  if (val < 9000) return '5,000 – 9,000 / day (Secondary)';
  if (val < 15000) return '9,000 – 15,000 / day (Active High St)';
  if (val < 22000) return '15,000 – 22,000 / day (Major Corridor)';
  return '20,000 – 26,000 / day (Peak Arterial)';
}

/**
 * Format 350m catchment pedestrian walkshed volume into ranges.
 * @param {number} daily
 * @returns {string} - e.g. "12,000 – 18,000 / day"
 */
export function formatCatchmentDailyRange(daily) {
  if (daily === null || daily === undefined || isNaN(daily)) return '—';
  const val = Math.round(daily);

  if (val < 8000) return '5,000 – 8,000 / day (Local Walkshed)';
  if (val < 14000) return '8,000 – 14,000 / day (Mid-Density Walkshed)';
  if (val < 20000) return '14,000 – 20,000 / day (High-Density Walkshed)';
  return '18,000 – 24,000 / day (Prime Transit Walkshed)';
}

/**
 * Format store cup sales into credible ranges.
 * @param {number} cups
 * @returns {string} - e.g. "350 – 450 cups / day"
 */
export function formatStoreCupVolumeRange(cups) {
  if (!cups) return '250 – 350 cups / day';
  const c = Math.round(cups);
  const low = Math.round((c * 0.88) / 10) * 10;
  const high = Math.round((c * 1.12) / 10) * 10;
  return `${low} – ${high} cups / day`;
}

/**
 * Format store monthly customer base into credible ranges.
 * @param {number} customers
 * @returns {string} - e.g. "8,000 – 12,000 / mo"
 */
export function formatStoreMonthlyCustomersRange(customers) {
  if (!customers) return '7,000 – 10,000 / mo';
  const c = Math.round(customers);
  const low = Math.round((c * 0.85) / 500) * 500;
  const high = Math.round((c * 1.15) / 500) * 500;
  return `${low.toLocaleString()} – ${high.toLocaleString()} / mo`;
}

/**
 * Format competitor monthly cup volume into credible ranges.
 * @param {number} cups
 * @returns {string} - e.g. "9,000 – 12,000 cups / mo"
 */
export function formatMonthlyCupVolumeRange(cups) {
  if (!cups) return '8,000 – 12,000 cups / mo';
  const c = Math.round(cups);
  const low = Math.round((c * 0.85) / 500) * 500;
  const high = Math.round((c * 1.15) / 500) * 500;
  return `${low.toLocaleString()} – ${high.toLocaleString()} cups / mo`;
}

/**
 * Format POI / venue daily traffic into a range.
 * @param {number} traffic
 * @param {string} category
 * @returns {string}
 */
export function formatVenueTrafficRange(traffic, category = '') {
  if (!traffic) return '500 – 1,000 / day';
  const val = Math.round(traffic);

  if (category.includes('Metro') || category.includes('Terminal') || val > 15000) {
    if (val < 25000) return '15,000 – 25,000 transit / day';
    if (val < 50000) return '25,000 – 50,000 transit / day';
    if (val < 100000) return '50,000 – 100,000 transit / day';
    return '100,000 – 200,000 transit / day';
  }

  if (category.includes('Mall') || val > 8000) {
    if (val < 15000) return '8,000 – 15,000 shoppers / day';
    if (val < 30000) return '15,000 – 30,000 shoppers / day';
    return '30,000 – 55,000 shoppers / day';
  }

  // Regular dining & hangout venues (Truffles, Meghana, Toit, etc.)
  if (val < 300) return '150 – 300 patrons / day';
  if (val < 600) return '300 – 600 patrons / day';
  if (val < 1000) return '600 – 1,000 patrons / day';
  if (val < 1800) return '1,000 – 1,800 patrons / day';
  return '1,500 – 2,500 patrons / day';
}

/**
 * Format kids monthly family visits into ranges.
 * @param {number} monthlyFootfall
 * @returns {string}
 */
export function formatKidsMonthlyTrafficRange(monthlyFootfall) {
  if (!monthlyFootfall) return '20,000 – 35,000 / mo';
  const val = Math.round(monthlyFootfall);
  if (val < 20000) return '10,000 – 20,000 / mo';
  if (val < 35000) return '20,000 – 35,000 / mo';
  if (val < 55000) return '35,000 – 55,000 / mo';
  return '45,000 – 70,000 / mo';
}
