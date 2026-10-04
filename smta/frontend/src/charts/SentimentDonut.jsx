import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = { Positive: "#2ED47A", Negative: "#F5556C", Neutral: "#F5B84D" };

export function SentimentDonut({ breakdown }) {
  const data = [
    { name: "Positive", value: breakdown?.positive || 0 },
    { name: "Negative", value: breakdown?.negative || 0 },
    { name: "Neutral", value: breakdown?.neutral || 0 },
  ];
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8B92B0" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -20 }}>
        <span className="text-2xl font-display font-semibold text-ink">{total.toLocaleString()}</span>
        <span className="text-xs text-ink-muted">Analyzed Posts</span>
      </div>
    </div>
  );
}
