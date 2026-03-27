"use client";

import { CheckCircle2, BarChart3 } from "lucide-react";

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

export default function GaugeChart({ data }: GaugeChartProps) {
  const percentage = parseFloat(data.current_level.toFixed(1));
  const gaugeColor = getGaugeColor(percentage);
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
      {/* Header Profesional */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Reserva Hídrica de España
              </h2>
              <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                25/03/2026
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Estado actual de los embalses españoles según el MITECO
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Gauge Diagram
          </span>
        </div>
      </header>

      {/* Gauge + Stats Grid */}
        <div className="mx-auto w-full max-w-[380px] transition-transform duration-300 hover:scale-[1.01]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[230px] w-full"
            role="img"
            aria-label={`Reserva hídrica: ${percentage}%`}
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
              {percentage}%
            </text>
          </svg>
        </div>

      {/* Key Insights */}
      <div className="mb-6 space-y-3">
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Situación Favorable:</p>
          <p>
            La reserva hídrica española se encuentra en una situación
            <strong> óptima al 83,3%</strong> de su capacidad total, favoreciendo
            la disponibilidad de agua para agricultura, industria y consumo humano.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Contexto Regional:</p>
          <p>
            La distribución varía significativamente por cuencas: desde Cuencas
            Internas del País Vasco al <strong>100%</strong> hasta Segura con
            <strong> 53,7%</strong>, reflejando la heterogeneidad climática española.
          </p>
        </div>
      </div>

      {/* Professional Attribution */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-600">
          Fuente de Datos
        </p>
        <p className="text-sm text-slate-700">
          Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO) -{" "}
          <a
            href="https://www.miteco.gob.es/es/prensa/ultimas-noticias/2026/marzo/la-reserva-hidrica-espanola-se-encuentra-al-83-3---de-su-capacid.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            Prensa MITECO 2026
          </a>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Nota: Datos actualizados a 25/03/2026. Los embalses almacenan 46.677
          hectómetros cúbicos de agua. Información disponible en la aplicación web del MITECO.
        </p>
      </div>
    </section>
  );
}
