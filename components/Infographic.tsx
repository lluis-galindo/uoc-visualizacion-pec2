"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type WasteDatum = {
  type: "recycling" | "landfill" | "incineration";
  value: number;
};

type InfographicProps = {
  data: WasteDatum[];
};

const COLORS: Record<WasteDatum["type"], string> = {
  recycling: "#14b8a6",
  landfill: "#f97316",
  incineration: "#ef4444",
};

const LABELS: Record<WasteDatum["type"], string> = {
  recycling: "Reciclaje",
  landfill: "Vertedero",
  incineration: "Incineracion",
};

export default function Infographic({ data }: InfographicProps) {
  return (
    <section className="dashboard-card card-enter">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Destino global de residuos
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Distribucion porcentual del tratamiento de residuos a nivel global.
          </p>
        </div>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
          Infografia
        </span>
      </header>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={92}
              innerRadius={42}
              paddingAngle={3}
              label={({ value }) => `${value}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={COLORS[entry.type]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => {
                const key = name as WasteDatum["type"];
                return [`${value}%`, LABELS[key]];
              }}
            />
            <Legend
              verticalAlign="bottom"
              formatter={(value: string) => {
                const key = value as WasteDatum["type"];
                return LABELS[key];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        El vertedero sigue concentrando gran parte del destino final. Aumentar
        el reciclaje reduce la presion sobre suelos y recursos naturales.
      </p>
    </section>
  );
}
