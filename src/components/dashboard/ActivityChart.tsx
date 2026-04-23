import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ActivityChartProps {
  data: any[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-foreground/5 animate-pulse rounded-xl" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorSonarr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRadarr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#ffffff05"
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "hsl(var(--muted-foreground))",
            fontWeight: 700,
          }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "hsl(var(--muted-foreground))",
            fontWeight: 700,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            backdropFilter: "blur(8px)",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            fontSize: "10px",
            textTransform: "uppercase",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
          itemStyle={{ fontSize: "10px" }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={30}
          iconType="circle"
          wrapperStyle={{
            fontSize: "9px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            opacity: 0.6,
          }}
        />
        <Area
          type="monotone"
          dataKey="sonarr"
          stroke="#00b4d8"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorSonarr)"
          name="Sonarr"
          animationDuration={2000}
        />
        <Area
          type="monotone"
          dataKey="radarr"
          stroke="#f59e0b"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRadarr)"
          name="Radarr"
          animationDuration={2000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
