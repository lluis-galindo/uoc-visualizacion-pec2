"use client";

type ReservoirDatum = {
  current_level: number;
  max_level: number;
};

type GaugeChartProps = {
  data: ReservoirDatum;
};

function pointOnGaugeArc(
  centerX: number,
  centerY: number,
  radius: number,
  percentage: number,
) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const t = clamped / 100;
  const angleRad = Math.PI - t * Math.PI;

  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY - radius * Math.sin(angleRad),
  };
}

function buildArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startPercentage: number,
  endPercentage: number,
  segments = 48,
) {
  const start = Math.max(0, Math.min(100, startPercentage));
  const end = Math.max(0, Math.min(100, endPercentage));
  const stepCount = Math.max(2, segments);
  const stepSize = (end - start) / stepCount;

  let path = "";
  for (let i = 0; i <= stepCount; i += 1) {
    const percentage = start + stepSize * i;
    const point = pointOnGaugeArc(centerX, centerY, radius, percentage);
    path += `${i === 0 ? "M" : "L"} ${point.x} ${point.y} `;
  }

  return path.trim();
}

function getGaugeColor(value: number): string {
  if (value < 30) {
    return "#dc2626";
  }

  if (value <= 60) {
    return "#f59e0b";
  }

  return "#16a34a";
}

function getGaugeLabel(value: number): string {
  if (value < 30) {
    return "Bajo";
  }

  if (value <= 60) {
    return "Medio";
  }

  return "Alto";
}

export default function GaugeChart({ data }: GaugeChartProps) {
  const rawPercentage = (data.current_level / data.max_level) * 100;
  const percentage = Math.round(rawPercentage);
  const gaugeColor = getGaugeColor(percentage);
  const status = getGaugeLabel(percentage);
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const width = 340;
  const height = 230;
  const centerX = width / 2;
  const centerY = 186;
  const radius = 122;

  const needleTip = pointOnGaugeArc(centerX, centerY, radius - 18, clampedPercentage);
  const basePoint = pointOnGaugeArc(centerX, centerY, 14, clampedPercentage + 50);
  const sideLeft = pointOnGaugeArc(centerX, centerY, 10, clampedPercentage - 5);
  const sideRight = pointOnGaugeArc(centerX, centerY, 10, clampedPercentage + 5);

  const fullArc = buildArcPath(centerX, centerY, radius, 0, 100);
  const redArc = buildArcPath(centerX, centerY, radius, 0, 30);
  const yellowArc = buildArcPath(centerX, centerY, radius, 30, 60);
  const greenArc = buildArcPath(centerX, centerY, radius, 60, 100);

  return (
    <section className="dashboard-card card-enter card-enter-delay-1">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Nivel de embalses en España
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Relacion actual entre agua embalsada y capacidad maxima.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Gauge Diagram
        </span>
      </header>

      <div className="mx-auto w-full max-w-[380px] transition-transform duration-300 hover:scale-[1.01]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[230px] w-full"
          role="img"
          aria-label={`Gauge de embalses: ${clampedPercentage}%`}
        >
          <path
            d={fullArc}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={18}
            strokeLinecap="round"
          />

          <path d={redArc} fill="none" stroke="#dc2626" strokeWidth={18} strokeLinecap="round" />
          <path
            d={yellowArc}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={18}
            strokeLinecap="round"
          />
          <path d={greenArc} fill="none" stroke="#16a34a" strokeWidth={18} strokeLinecap="round" />

          <line
            x1={centerX}
            y1={centerY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={gaugeColor}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <polygon
            points={`${basePoint.x},${basePoint.y} ${sideLeft.x},${sideLeft.y} ${needleTip.x},${needleTip.y} ${sideRight.x},${sideRight.y}`}
            fill={gaugeColor}
            opacity={0.85}
          />
          <circle cx={centerX} cy={centerY} r={8} fill="#0f172a" />

          <text x={18} y={176} fontSize="12" fill="#475569" textAnchor="middle">
            0%
          </text>
          <text x={centerX} y={44} fontSize="12" fill="#475569" textAnchor="middle">
            50%
          </text>
          <text x={327} y={176} fontSize="12" fill="#475569" textAnchor="middle">
            100%
          </text>

          <text x={centerX} y={146} fontSize="34" fontWeight="700" fill="#0f172a" textAnchor="middle">
            {clampedPercentage}%
          </text>
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <span>
          Estado: <strong style={{ color: gaugeColor }}>{status}</strong>
        </span>
        <span>Capacidad: 100%</span>
      </div>
    </section>
  );
}
