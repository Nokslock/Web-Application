"use client";

type TimelinePoint = { date: string; count: number };

export default function SignupChart({
  timeline,
}: {
  timeline: TimelinePoint[];
}) {
  const maxCount = Math.max(...timeline.map((d) => d.count), 1);
  const totalSignups = timeline.reduce((sum, d) => sum + d.count, 0);

  // Generate SVG path for smooth area chart
  const width = 600;
  const height = 160;
  const padding = { top: 10, right: 10, bottom: 30, left: 5 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = timeline.map((d, i) => ({
    x: padding.left + (i / (timeline.length - 1)) * chartW,
    y: padding.top + chartH - (d.count / maxCount) * chartH,
    ...d,
  }));

  // Build smooth line path
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Build area path (line + close to bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // X-axis labels (show every 7th day)
  const xLabels = points.filter(
    (_, i) => i % 7 === 0 || i === points.length - 1,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            User Signups
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last 30 days
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {totalSignups}
          </p>
          <p className="text-[10px] text-gray-400 font-medium uppercase">
            Total signups
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            y1={padding.top + chartH * (1 - frac)}
            x2={width - padding.right}
            y2={padding.top + chartH * (1 - frac)}
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-700"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data dots */}
        {points.map((p, i) =>
          p.count > 0 ? (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="1.5"
              className="dark:stroke-gray-800"
            />
          ) : null,
        )}

        {/* X-axis labels */}
        {xLabels.map((p, i) => {
          const d = new Date(p.date);
          const label = `${d.getDate()}/${d.getMonth() + 1}`;
          return (
            <text
              key={i}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500"
              fontSize="10"
              fontWeight="500"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
