import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

const COLOR = { positive: "#2ED47A", negative: "#F5556C", neutral: "#F5B84D" };

export function Sparkline({ values = [], sentiment = "neutral" }) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={COLOR[sentiment] || COLOR.neutral} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
