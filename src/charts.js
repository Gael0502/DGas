import { formatNumber } from "./ui.js";

export function lineChart({ confirmed, predicted, labels, compact = false, id = "chart" }) {
  const width = compact ? 410 : 650;
  const height = 205;
  const left = 43;
  const right = 12;
  const top = 13;
  const bottom = 27;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(1, ...confirmed, ...predicted) * 1.17;
  const x = index => left + index * plotWidth / Math.max(1, confirmed.length - 1);
  const y = value => top + plotHeight - value / maxValue * plotHeight;
  const path = values => values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: 4 }, (_, index) => {
    const lineY = top + index * plotHeight / 3;
    return `<line class="chart-gridline" x1="${left}" y1="${lineY}" x2="${width - right}" y2="${lineY}"/><text class="chart-label" x="0" y="${lineY + 3}">${formatNumber(maxValue * (1 - index / 3))}</text>`;
  }).join("");
  const area = `${path(confirmed)} L${x(confirmed.length - 1)},${top + plotHeight} L${x(0)},${top + plotHeight} Z`;
  const tickLabels = labels.map((label, index) => {
    const point = Math.round(index * (confirmed.length - 1) / Math.max(1, labels.length - 1));
    return `<text class="chart-label" text-anchor="middle" x="${x(point)}" y="${height - 5}">${label}</text>`;
  }).join("");
  const latest = `<circle cx="${x(confirmed.length - 1)}" cy="${y(confirmed[confirmed.length - 1])}" r="4" fill="#16876a" stroke="white" stroke-width="2"/>`;
  return `<svg id="${id}" class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Confirmed and predicted demand chart"><defs><linearGradient id="${id}-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#238e70" stop-opacity=".16"/><stop offset="100%" stop-color="#238e70" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${id}-fill)"/><path class="demand-line" d="${path(confirmed)}"/><path class="forecast-line" d="${path(predicted)}"/>${latest}${tickLabels}</svg>`;
}
