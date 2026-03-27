"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  Flame,
  Trash2,
  HardHat,
} from "lucide-react";

type WasteDatum = {
  type: "recycling" | "landfill" | "landfill_operations" | "incineration";
  value: number;
};

type InfographicProps = {
  data: WasteDatum[];
};

const COLORS: Record<WasteDatum["type"], string> = {
  recycling: "#10b981",
  landfill: "#f59e0b",
  landfill_operations: "#fb923c",
  incineration: "#ef4444",
};

const LABELS: Record<WasteDatum["type"], string> = {
  recycling: "Reciclado",
  landfill: "Vertido",
  landfill_operations: "Operaciones de relleno",
  incineration: "Incineración",
};

const ICONS: Record<WasteDatum["type"], typeof Recycle> = {
  recycling: Recycle,
  landfill: Trash2,
  landfill_operations: HardHat,
  incineration: Flame,
};

const DECIMAL_FORMATTER = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function Infographic({ data }: InfographicProps) {
  const recycling = data.find((entry) => entry.type === "recycling")?.value ?? 0;
  const landfill = data.find((entry) => entry.type === "landfill")?.value ?? 0;
  const alternativeTreatments = data
    .filter(
      (entry) =>
        entry.type === "landfill_operations" || entry.type === "incineration"
    )
    .reduce((acc, entry) => acc + entry.value, 0);

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <section className="dashboard-card card-enter overflow-hidden">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Infografía de gestion ambiental
            </p>
            <h2 className="text-2xl font-bold leading-tight md:text-3xl">
              Que hace España con sus residuos municipales?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              El reciclado lidera en 2023, pero casi 1 de cada 3 toneladas aun
              termina en vertederos.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            España 2023
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Reciclado
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {DECIMAL_FORMATTER.format(recycling)}%
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Vertido
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {DECIMAL_FORMATTER.format(landfill)}%
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Tratamientos alternativos
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {DECIMAL_FORMATTER.format(alternativeTreatments)}%
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h3 className="text-base font-bold text-slate-900 md:text-lg">
            Reparto por metodo de tratamiento
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            El anillo interior resume la proporcion y las barras comparan el
            peso relativo de cada destino.
          </p>

          <div className="mt-4 h-72 w-full rounded-xl bg-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={2}
                  label={({ name, value }) => {
                    const key = String(name) as WasteDatum["type"];
                    const label = LABELS[key] ?? String(name);
                    const numericValue =
                      typeof value === "number" ? value : Number(value);
                    return `${label}: ${DECIMAL_FORMATTER.format(numericValue)}%`;
                  }}
                  labelLine={false}
                >
                  {data.map((entry) => (
                    <Cell key={entry.type} fill={COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const numericValue =
                      typeof value === "number" ? value : Number(value);
                    const key = String(name) as WasteDatum["type"];
                    return [
                      `${DECIMAL_FORMATTER.format(numericValue)}%`,
                      LABELS[key],
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 space-y-3">
            {sortedData.map((entry) => {
              const Icon = ICONS[entry.type];

              return (
                <div key={entry.type} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${COLORS[entry.type]}20` }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: COLORS[entry.type] }}
                        />
                      </span>
                      {LABELS[entry.type]}
                    </p>
                    <span className="text-sm font-bold text-slate-900">
                      {DECIMAL_FORMATTER.format(entry.value)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${entry.value}%`,
                        backgroundColor: COLORS[entry.type],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="h-5 w-5" />
              Senal positiva
            </p>
            <p className="text-sm leading-relaxed text-emerald-900">
              El reciclado supera por si solo la suma de vertido, operaciones de
              relleno e incineracion. La base de economia circular ya es la
              opcion dominante.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Punto critico
            </p>
            <p className="text-sm leading-relaxed text-amber-900">
              Aun asi, {DECIMAL_FORMATTER.format(landfill)}% termina en
              vertederos. Reducir esta via es la palanca mas directa para bajar
              emisiones y perdida de materiales.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lectura rapida
            </h4>

            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                1. Mas de la mitad de residuos ya se recicla.
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                2. El vertido sigue siendo la segunda salida principal.
              </p>
              <p className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                3. El 17,0% restante se divide entre relleno e incineracion.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Fuente de datos
            </p>
            <p className="text-sm text-slate-700">
              Instituto Nacional de Estadistica (INE) -{" "}
              <a
                href="https://www.ine.es/dyngs/Prensa/CR2023.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 hover:underline"
              >
                Prensa INE 2023
              </a>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Porcentajes de tratamiento final de residuos municipales en Espana
              (2023).
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}