import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";

const COLOR = { positive: "#2ED47A", negative: "#F5556C", neutral: "#F5B84D" };

export function EngagementScatter({ points = [] }) {
  const groups = { positive: [], negative: [], neutral: [] };
  points.forEach((p) => {
    (groups[p.sentiment] || groups.neutral).push(p);
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 20, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#1D2440" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="likes"
          name="Likes"
          tick={{ fill: "#8B92B0", fontSize: 11 }}
          axisLine={{ stroke: "#232A42" }}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="comments"
          name="Comments"
          tick={{ fill: "#8B92B0", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis range={[40, 41]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }}
        />
        {Object.entries(groups).map(([sentiment, pts]) => (
          <Scatter key={sentiment} name={sentiment} data={pts} fill={COLOR[sentiment]} fillOpacity={0.7} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
