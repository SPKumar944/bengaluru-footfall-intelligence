/**
 * AGT Intelligence Footfall Range Formatting Utilities
 * Standardizes urban pedestrian kinematics into credible human-readable ranges.
 * Eliminates misleading pinpoint numbers (e.g. replaces ~11,948 or ~10,000 with realistic bands).
 */

/**
 * Format hourly pedestrian footfall into a professional range band.
 * @param {number} flow - Estimated hourly pedestrian count
 * @returns {string} - e.g. "1,200 – 1,800 / hr (High Commercial)"
 */
export function formatHourlyFootfallRange(flow) {
  if (flow === null || flow === undefined || isNaN(flow)) return 'Data Unavailable';
  const val = Math.round(flow);

  if (val < 50) {
    return '< 50 / hr (Calm / Residential)';
  } else if (val < 120) {
    return '50 – 120 / hr (Low Residential)';
  } else if (val < 250) {
    return '120 – 250 / hr (Neighborhood Flow)';
  } else if (val < 500) {
    return '250 – 500 / hr (Moderate Flow)';
  } else if (val < 850) {
    return '500 – 850 / hr (Active Commercial)';
  } else if (val < 1300) {
    return '850 – 1,300 / hr (Heavy Commercial)';
  } else if (val < 1800) {
    return '1,300 – 1,800 / hr (High Street Peak)';
  } else if (val < 2400) {
    return '1,800 – 2,400 / hr (Prime Dessert Window)';
  } else {
    return '2,000 – 2,600 / hr (Ultra-High Corridor)';
  }
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
