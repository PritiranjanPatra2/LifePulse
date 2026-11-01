import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const StackedMealBarChart = ({ data = [], height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            formatter={(val, name) => [`${val} kcal`, name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          <Bar dataKey="Breakfast" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Morning Snacks" stackId="a" fill="#10b981" />
          <Bar dataKey="Lunch" stackId="a" fill="#3b82f6" />
          <Bar dataKey="Evening Snacks" stackId="a" fill="#f97316" />
          <Bar dataKey="Dinner" stackId="a" fill="#6366f1" />
          <Bar dataKey="Other" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

