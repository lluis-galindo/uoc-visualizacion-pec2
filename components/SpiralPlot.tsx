"use client";

import { extent, max, min, range } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { curveCardinal, radialLine } from "d3-shape";
import { timeFormat } from "d3-time-format";
import { useEffect, useMemo, useRef } from "react";

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
      .text((d) => `${tooltipDateFormatter.format(d.date)}: ${d.value.toFixed(1)} C`);

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
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Temperatura media en Barcelona
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Estilo timeline en espiral con barras orientadas sobre la curva.
          </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
          Spiral Plot
        </span>
      </header>

      <div className="w-full overflow-x-auto">
        <div ref={chartRef} className="mx-auto w-full min-w-[320px] max-w-[560px]" />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <p className="mb-2 font-medium text-slate-800">Leyenda</p>
        <div className="mb-2 h-3 w-full rounded-full bg-gradient-to-r from-blue-400 to-red-600" />
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{minTemp.toFixed(1)} C (más frío)</span>
          <span>{maxTemp.toFixed(1)} C (más cálido)</span>
        </div>
      </div>
    </section>
  );
}
