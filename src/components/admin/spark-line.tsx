export function SparkLine({ points, height = 140 }: { points: { label: string; revenue: number }[]; height?: number }) {
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const width = 560;
  const step = width / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => [i * step, height - 12 - (p.revenue / max) * (height - 28)] as const);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Revenue over last 14 days">
      <path d={`${path} L${width},${height} L0,${height} Z`} fill="#2563eb" opacity="0.08" />
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#2563eb">
          <title>{points[i].label}: ₹{points[i].revenue.toLocaleString("en-IN")}</title>
        </circle>
      ))}
    </svg>
  );
}
