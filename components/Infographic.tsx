"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";

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



export default function Infographic({ data }: InfographicProps) {
  return (
    <section className="dashboard-card card-enter">
      {/* Header Profesional */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Tratamiento final de residuos
              </h2>
              <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                2023
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Distribución porcentual según el Instituto Nacional de Estadística
            </p>
          </div>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
            Infografía
          </span>
        </div>
      </header>

      {/* Main Chart */}
      <div className="mb-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={2}
              label={({ name, value }) => {
                const key = String(name) as WasteDatum["type"];
                const label = LABELS[key] ?? String(name);
                return `${label}: ${value}%`;
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
                return [`${numericValue}%`, LABELS[key]];
              }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="mb-6 space-y-3">
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Economía Circular:</p>
          <p>
            España ha tratado más de la mitad de sus residuos (
            <strong>53,9%</strong>) mediante reciclado, avanzando hacia una
            gestión más sostenible.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Destino Actual:</p>
          <p>
            El <strong>29,1%</strong> va a vertido, mientras que los tratamientos
            alternativos (relleno e incineración) representan el <strong>17%</strong> restante.
          </p>
        </div>
      </div>

      {/* Professional Attribution */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-600">
          Fuente de Datos
        </p>
        <p className="text-sm text-slate-700">
          Instituto Nacional de Estadística (INE) -{" "}
          <a
            href="https://www.ine.es/dyngs/Prensa/CR2023.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            Prensa INE 2023
          </a>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Nota: Datos de tratamiento final de residuos en España para el año
          2023. Los porcentajes representan la distribución de métodos de
          gestión implementados.
        </p>
      </div>
    </section>
  );
}
