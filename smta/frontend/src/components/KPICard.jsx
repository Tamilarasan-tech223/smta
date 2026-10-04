import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function useAnimatedNumber(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function formatValue(value, unit) {
  if (unit === "pct") return `${value.toFixed(1)}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString();
}

export function KPICard({ label, value, unit = "", changePct, icon: Icon, accent = "indigo", index = 0 }) {
  const animated = useAnimatedNumber(value);
  const positive = changePct >= 0;

  const accentMap = {
    indigo: "text-accent-indigo bg-accent-indigo/10",
    cyan: "text-accent-cyan bg-accent-cyan/10",
    positive: "text-positive bg-positive/10",
    negative: "text-negative bg-negative/10",
    neutral: "text-neutral bg-neutral/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="card p-5 hover:border-surface-border/80 hover:shadow-glow transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-ink-muted text-xs font-medium">{label}</span>
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-display font-semibold tabular text-ink">
          {formatValue(animated, unit)}
        </span>
        {typeof changePct === "number" && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-positive" : "text-negative"
            }`}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
