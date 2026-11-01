import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export const WeightLineChart = ({ data = [], target = 68, height = 280 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
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
            formatter={(val) => [`${val} kg`, 'Weight']}
          />
          {target && (
            <ReferenceLine
              y={target}
              stroke="#a855f7"
              strokeDasharray="4 4"
              label={{ value: `Goal: ${target}kg`, position: 'top', fill: '#a855f7', fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

