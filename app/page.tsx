import { csvParse } from "d3";
import { promises as fs } from "node:fs";
import path from "node:path";

import VisualizationTabs from "@/components/VisualizationTabs";

type WasteDatum = {
  type: "recycling" | "landfill" | "incineration";
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
        <header className="mb-8 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur md:p-8">
          <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">
            Visualizacion de Datos Ambientales
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
            Panel unico con tres tecnicas de visualizacion: infografia de
            residuos, gauge de embalses y spiral plot de temperatura media en
            Barcelona.
          </p>
        </header>

        <VisualizationTabs
          wasteData={wasteData}
          reservoirData={reservoirData}
          temperatureData={temperatureData}
        />
      </section>
    </main>
  );
}
