import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

export const LifestyleRadarChart = ({ data = [], height = 300 }) => {
  const chartData = data.length > 0 ? data : [
    { metric: 'Nutrition', score: 85, fullMark: 100 },
    { metric: 'Hydration', score: 90, fullMark: 100 },
    { metric: 'Walking', score: 80, fullMark: 100 },
    { metric: 'Fitness', score: 75, fullMark: 100 },
    { metric: 'Sleep', score: 88, fullMark: 100 },
    { metric: 'Consistency', score: 92, fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#94a3b8" opacity={0.25} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#64748b' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #1e293b',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val) => [`${val}%`, 'Score']}
          />
          <Radar
            name="Lifestyle Score"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

