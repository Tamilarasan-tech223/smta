import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function EngagementLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#1D2440" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={{ stroke: "#232A42" }} tickLine={false} />
        <YAxis tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#E7E9F5" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8B92B0" }} />
        <Line type="monotone" dataKey="likes" name="Likes" stroke="#6C6CF5" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="comments" name="Comments" stroke="#33D6E8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="shares" name="Shares" stroke="#F5B84D" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
