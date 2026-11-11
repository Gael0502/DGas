import { demandTrend, regions } from "./data.js";

export const factoryHorizons = [
  { label: "Next 7 days", days: 7 },
  { label: "Next 30 days", days: 30 },
  { label: "Next 90 days", days: 90 }
];

export const weeklyDemand = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  confirmed: [290, 340, 315, 390, 410, 355, 280],
  predicted: [320, 365, 345, 420, 445, 390, 305]
};

export const monthlyDemand = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  confirmed: [1100, 1260, 1180, 1450, 1390, 1610, 1540, 1720, 1680, 1810, 1740, 1900],
  predicted: [1200, 1300, 1270, 1490, 1510, 1700, 1650, 1790, 1800, 1910, 1930, 2040]
};

const availableSupplyByRegion = {
  Gasabo: 1976,
  Nyarugenge: 1300,
  Kicukiro: 1144,
  "Other Kigali": 780
};

const committedSupplyByRegion = {
  Gasabo: 380,
  Nyarugenge: 250,
  Kicukiro: 220,
  "Other Kigali": 150
};

export function getHorizonDays(label) {
  return factoryHorizons.find(item => item.label === label)?.days || 30;
}

export function getRegionalDemand(state, days = 30) {
  const totalConfirmed = regions.reduce((sum, region) => sum + (state.regions[region] || 0), 0);
  const forecastTotal = Math.round(state.forecastKg * days / 30);
  const allocations = regions.map((region, index) => {
    const confirmed = state.regions[region] || 0;
    const share = totalConfirmed > 0 ? confirmed / totalConfirmed : 1 / regions.length;
    const rawForecast = forecastTotal * share;
    return { region, index, confirmed, share, predicted: Math.floor(rawForecast), remainder: rawForecast - Math.floor(rawForecast) };
  });
  let unallocated = forecastTotal - allocations.reduce((sum, item) => sum + item.predicted, 0);
  allocations.slice().sort((left, right) => right.remainder - left.remainder)
    .slice(0, unallocated)
    .forEach(item => { allocations[item.index].predicted += 1; });
  return allocations.map(item => ({
    name: item.region,
    confirmed: item.confirmed,
    predicted: item.predicted,
    available: availableSupplyByRegion[item.region],
    committed: committedSupplyByRegion[item.region]
  }));
}

export function getSupplyTotals() {
  return {
    available: Object.values(availableSupplyByRegion).reduce((sum, value) => sum + value, 0),
    committed: Object.values(committedSupplyByRegion).reduce((sum, value) => sum + value, 0)
  };
}

export function getDemandTrend(state, region = "All regions", days = 30) {
  const regional = getRegionalDemand(state, days);
  const selected = region === "All regions" || region === "Kigali"
    ? regional
    : regional.filter(item => item.name === region);
  const confirmedTotal = selected.reduce((sum, item) => sum + item.confirmed, 0);
  const predictedTotal = selected.reduce((sum, item) => sum + item.predicted, 0);
  const trendConfirmedTotal = demandTrend.confirmed.reduce((sum, value) => sum + value, 0);
  const trendPredictedTotal = demandTrend.predicted.reduce((sum, value) => sum + value, 0);
  return {
    confirmed: demandTrend.confirmed.map(value => Math.round(value * confirmedTotal / Math.max(1, trendConfirmedTotal))),
    predicted: demandTrend.predicted.map(value => Math.round(value * predictedTotal / Math.max(1, trendPredictedTotal)))
  };
}

export function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
