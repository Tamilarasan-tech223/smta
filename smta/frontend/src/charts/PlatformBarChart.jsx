import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const COLORS = ["#6C6CF5", "#33D6E8", "#F5B84D", "#F5556C"];

export function PlatformBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#1D2440" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="platform" tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }}
          cursor={{ fill: "rgba(108,108,245,0.06)" }}
        />
        <Bar dataKey="posts" name="Posts" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.platform} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
