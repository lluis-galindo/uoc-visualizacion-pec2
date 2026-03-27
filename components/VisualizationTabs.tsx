"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import GaugeChart from "@/components/GaugeChart";
import Infographic from "@/components/Infographic";
import SpiralPlot from "@/components/SpiralPlot";

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

type VisualizationTabsProps = {
  wasteData: WasteDatum[];
  reservoirData: ReservoirDatum;
  temperatureData: TemperatureDatum[];
};

type TabKey = "infographic" | "gauge" | "spiral";

const TAB_ITEMS: Array<{ key: TabKey; label: string }> = [
  { key: "infographic", label: "Infografia" },
  { key: "gauge", label: "Gauge" },
  { key: "spiral", label: "Spiral" },
];

function isTabKey(value: string | null): value is TabKey {
  return value === "infographic" || value === "gauge" || value === "spiral";
}

export default function VisualizationTabs({
  wasteData,
  reservoirData,
  temperatureData,
}: VisualizationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = isTabKey(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabKey)
    : "infographic";

  const setTabInUrl = (tab: TabKey) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", tab);
    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const activeVisualization = useMemo(() => {
    if (activeTab === "infographic") {
      return <Infographic data={wasteData} />;
    }

    if (activeTab === "gauge") {
      return <GaugeChart data={reservoirData} />;
    }

    return <SpiralPlot data={temperatureData} />;
  }, [activeTab, reservoirData, temperatureData, wasteData]);

  return (
    <section>
      <div
        role="tablist"
        aria-label="Selector de visualizacion"
        className="mb-6 inline-flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm"
      >
        {TAB_ITEMS.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.key}`}
              id={`tab-${item.key}`}
              onClick={() => setTabInUrl(item.key)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="animate-[card-rise_0.35s_ease-out]"
      >
        {activeVisualization}
      </div>
    </section>
  );
}
