import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export const HydrationLineChart = ({ data = [], target = 4000, height = 280 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hydrationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #1e293b',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val) => [`${val.toLocaleString()} ml`, 'Hydration']}
          />
          <ReferenceLine
            y={target}
            stroke="#38bdf8"
            strokeDasharray="4 4"
            label={{ value: `Goal: ${target}ml`, position: 'top', fill: '#38bdf8', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="waterMl"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#hydrationFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
