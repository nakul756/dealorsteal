export function TrendChart({ data, height = 220 }: { data: { month: string; value: number }[]; height?: number }) {
  const w = 720;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) * 0.98;
  const max = Math.max(...vals) * 1.02;
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (height - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${height - pad.b} L${x(0)},${height - pad.b} Z`;
  const ticks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-auto" role="img" aria-label="Price per square foot trend">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c9a35c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a35c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(120,92,52,0.15)" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#75685a">
            {Math.round(t).toLocaleString()}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#g)" />
      <path d={line} fill="none" stroke="#b08a43" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.month}>
          <circle cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 4 : 2.5} fill="#b08a43">
            <title>{`${d.month}: AED ${d.value.toLocaleString()} / sq ft`}</title>
          </circle>
          <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#75685a">
            {d.month}
          </text>
        </g>
      ))}
    </svg>
  );
}
