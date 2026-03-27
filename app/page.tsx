import { csvParse } from "d3";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Suspense } from "react";

import VisualizationTabs from "@/components/VisualizationTabs";

type WasteDatum = {
  type: "recycling" | "landfill" | "landfill_operations" | "incineration";
  value: number;
};

type ReservoirDatum = {
  current_level: number;
  max_level: number;
};

type TemperatureDatum = {
  date: string;
  temperature: number;
};

async function getWasteData(): Promise<WasteDatum[]> {
  const filePath = path.join(process.cwd(), "data", "waste.csv");
  const rawCsv = await fs.readFile(filePath, "utf8");
  const parsed = csvParse(rawCsv);

  return parsed.map((row) => ({
    type: row.type as WasteDatum["type"],
    value: Number(row.value),
  }));
}

async function getReservoirData(): Promise<ReservoirDatum> {
  const filePath = path.join(process.cwd(), "data", "reservoirs.csv");
  const rawCsv = await fs.readFile(filePath, "utf8");
  const parsed = csvParse(rawCsv);
  const row = parsed[0];

  return {
    current_level: Number(row.current_level),
    max_level: Number(row.max_level),
  };
}

async function getTemperatureData(): Promise<TemperatureDatum[]> {
  const filePath = path.join(process.cwd(), "data", "temperature.csv");
  const rawCsv = await fs.readFile(filePath, "utf8");
  const parsed = csvParse(rawCsv);

  const monthColumns = [
    "Temp_Mitjana_Gener",
    "Temp_Mitjana_Febrer",
    "Temp_Mitjana_Marc",
    "Temp_Mitjana_Abril",
    "Temp_Mitjana_Maig",
    "Temp_Mitjana_Juny",
    "Temp_Mitjana_Juliol",
    "Temp_Mitjana_Agost",
    "Temp_Mitjana_Setembre",
    "Temp_Mitjana_Octubre",
    "Temp_Mitjana_Novembre",
    "Temp_Mitjana_Desembre",
  ] as const;

  return parsed.flatMap((row) => {
    // Compatibilidad con formato largo: date,temperature
    if (row.date && row.temperature) {
      return [
        {
          date: String(row.date),
          temperature: Number(row.temperature),
        },
      ];
    }

    // Formato ancho actual: Any + 12 columnas mensuales.
    const year = Number(row.Any);
    if (!Number.isFinite(year)) {
      return [];
    }

    return monthColumns
      .map((column, monthIndex) => {
        const rawValue = row[column];
        const value = Number(rawValue);

        if (!Number.isFinite(value)) {
          return null;
        }

        const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
        return { date, temperature: value };
      })
      .filter((item): item is TemperatureDatum => item !== null);
  });
}

export default async function Home() {
  const [wasteData, reservoirData, temperatureData] = await Promise.all([
    getWasteData(),
    getReservoirData(),
    getTemperatureData(),
  ]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl">
        <header className="dashboard-card mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                UOC · Visualización de Datos
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                PEC2 - Técnicas de Visualización
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Trabajo práctico de la asignatura de Visualización de Datos de la UOC.
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Lluís Mendoza Vandrell
            </div>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="dashboard-card text-sm text-slate-600">
              Cargando visualización...
            </div>
          }
        >
          <VisualizationTabs
            wasteData={wasteData}
            reservoirData={reservoirData}
            temperatureData={temperatureData}
          />
        </Suspense>
      </section>
    </main>
  );
}
