"use client";

import { extent, max, min, range } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { curveCardinal, radialLine } from "d3-shape";
import { timeFormat } from "d3-time-format";
import { useEffect, useMemo, useRef } from "react";
import { BarChart3 } from "lucide-react";

type TemperatureDatum = {
  date: string;
  temperature: number;
};

type SpiralPlotProps = {
  data: TemperatureDatum[];
};

type SpiralDatum = {
  date: Date;
  value: number;
  linePer: number;
  x: number;
  y: number;
  a: number;
};

export default function SpiralPlot({ data }: SpiralPlotProps) {
  const width = 500;
  const height = 500;
  const start = 0;
  const end = 2.25;
  const numSpirals = 4;
  const chartRef = useRef<HTMLDivElement | null>(null);

  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data],
  );

  const someData = useMemo<SpiralDatum[]>(() => {
    return sortedData.map((item) => ({
      date: new Date(item.date),
      value: item.temperature,
      linePer: 0,
      x: 0,
      y: 0,
      a: 0,
    }));
  }, [sortedData]);

  const temperatures = sortedData.map((d) => d.temperature);
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;

  // Calcular años
  const yearRange = useMemo(() => {
    if (sortedData.length === 0) return { start: "", end: "", count: 0 };
    const first = new Date(sortedData[0].date);
    const last = new Date(sortedData[sortedData.length - 1].date);
    return {
      start: first.getFullYear().toString(),
      end: last.getFullYear().toString(),
      count: last.getFullYear() - first.getFullYear() + 1
    };
  }, [sortedData]);

  useEffect(() => {
    if (!chartRef.current || someData.length === 0) {
      return;
    }

    const root = select(chartRef.current);
    root.selectAll("*").remove();

    const theta = (rValue: number) => numSpirals * Math.PI * rValue;
    const r = (min([width, height]) ?? width) / 2 - 40;

    const radius = scaleLinear().domain([start, end]).range([40, r]);

    const svg = root
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const points = range(start, end + 0.001, (end - start) / 1000);

    const spiral = radialLine<number>()
      .curve(curveCardinal)
      .angle(theta)
      .radius((d) => radius(d));

    const path = svg
      .append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    const pathNode = path.node();
    if (!pathNode) {
      return;
    }

    const spiralLength = pathNode.getTotalLength();
    const N = someData.length;
    const barWidth = Math.max(spiralLength / N - 1, 0.8);

    const timeDomain = extent(someData, (d) => d.date);
    if (!timeDomain[0] || !timeDomain[1]) {
      return;
    }

    const timeScale = scaleTime().domain([timeDomain[0], timeDomain[1]]).range([0, spiralLength]);

    const yScale = scaleLinear()
      .domain([0, max(someData, (d) => d.value) ?? 1])
      .range([0, (r / numSpirals) - 30]);

    const colorScale = scaleLinear<string>()
      .domain([minTemp, maxTemp])
      .range(["#60a5fa", "#dc2626"])
      .clamp(true);

    const getBarColor = (value: number) => {
      if (minTemp === maxTemp) {
        return "#60a5fa";
      }

      return colorScale(value);
    };

    const tooltipDateFormatter = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    });

    svg
      .selectAll("rect")
      .data(someData)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        const linePer = timeScale(d.date);
        const posOnLine = pathNode.getPointAtLength(linePer);
        const angleOnLine = pathNode.getPointAtLength(Math.max(linePer - barWidth, 0));

        d.linePer = linePer;
        d.x = posOnLine.x;
        d.y = posOnLine.y;
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;

        return d.x;
      })
      .attr("y", (d) => d.y)
      .attr("width", () => barWidth)
      .attr("height", (d) => yScale(d.value))
      .style("fill", (d) => getBarColor(d.value))
      .style("stroke", "none")
      .attr("transform", (d) => `rotate(${d.a}, ${d.x}, ${d.y})`)
      .append("title")
      .text((d) => `${tooltipDateFormatter.format(d.date)}: ${d.value.toFixed(1)} °C`);

    const tF = timeFormat("%Y");
    const firstInYear: Record<string, number> = {};

    svg
      .selectAll("text")
      .data(someData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      .filter((d) => {
        const sd = tF(d.date);
        if (!firstInYear[sd]) {
          firstInYear[sd] = 1;
          return true;
        }
        return false;
      })
      .text((d) => tF(d.date))
      .attr("href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", (d) => `${(d.linePer / spiralLength) * 100}%`);

    return () => {
      root.selectAll("*").remove();
    };
  }, [end, maxTemp, minTemp, numSpirals, someData, start]);

  return (
    <section className="dashboard-card card-enter card-enter-delay-2">
      {/* Header Profesional */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Ciclos de Temperatura en Barcelona
              </h2>
              <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {yearRange.start}-{yearRange.end}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Series temporales de {yearRange.count} años analizadas mediante patrón espiral
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
            Spiral Plot
          </span>
        </div>
      </header>

      {/* Main Chart */}
      <div className="mb-6 flex w-full justify-center">
        <div className="w-full overflow-x-auto">
          <div ref={chartRef} className="mx-auto w-full min-w-[320px] max-w-[560px]" />
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 rounded-lg bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Escala de Color</p>
        <div className="mb-3 h-3 w-full rounded-full bg-gradient-to-r from-blue-400 to-red-600" />
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
            {minTemp.toFixed(1)}°C (más frío)
          </span>
          <span className="flex items-center gap-1">
            {maxTemp.toFixed(1)}°C (más cálido)
            <span className="inline-block h-2 w-2 rounded-full bg-red-600"></span>
          </span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6 space-y-3">
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Análisis Temporal:</p>
          <p>
              La visualización despliega <strong>{yearRange.count} años</strong> de datos mensuales
              en una espiral, permitiendo identificar ciclos estacionales anuales
              y anomalías a largo plazo simultáneamente.
            </p>
        </div>
      </div>

      {/* Professional Attribution */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-600">
          Fuente de Datos
        </p>
        <p className="text-sm text-slate-700">
          Ajuntament de Barcelona - Opendata BCN -{" "}
          <a
            href="https://opendata-ajuntament.barcelona.cat/data/es/dataset/temperatures-hist-bcn/resource/0e3b6840-7dff-4731-a556-44fac28a7873"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:underline"
          >
            Temperatures Histórica Barcelona
          </a>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Nota: Datos de temperatura media mensual en Barcelona desde {yearRange.start} hasta {yearRange.end}.
          Los datos provienen del portal de datos abiertos del Ajuntament de Barcelona.
        </p>
      </div>
    </section>
  );
}