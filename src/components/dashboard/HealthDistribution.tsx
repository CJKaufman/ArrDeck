import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface HealthDistributionProps {
  data: any[];
}

export function HealthDistribution({ data }: HealthDistributionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0C0E]/90 backdrop-blur-sm border border-white/5 p-3 rounded-xl shadow-2xl text-[10px] uppercase font-bold tracking-widest gap-2 flex flex-col">
          <p className="text-white/60 italic">{payload[0].name}</p>
          <p className="text-white font-black">{payload[0].value} Entities</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0B0C0E]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0 min-w-0">
        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 italic truncate">Global Health</h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-white/20 truncate">· Fleet Integrity</span>
      </div>

      <div className="flex-grow min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="55%"
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={2000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[9px] font-black uppercase tracking-widest opacity-60 mt-2 flex-shrink-0 pt-3 border-t border-white/5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-white/40 italic truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
