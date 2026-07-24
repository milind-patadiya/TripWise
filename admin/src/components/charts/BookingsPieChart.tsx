import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BookingsPieChartProps {
  data: { _id: string; count: number }[];
}

const COLORS: Record<string, string> = {
  Confirmed: '#10b981', // emerald-500
  Completed: '#2563eb', // brand-600
  Cancelled: '#ef4444', // red-500
  Pending: '#f59e0b',   // amber-500
};

export default function BookingsPieChart({ data }: BookingsPieChartProps) {
  const chartData = data.map((d) => ({
    name: d._id || 'Unknown',
    value: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#0f172a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px 12px'
          }}
          itemStyle={{ fontWeight: 500 }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={6}
          formatter={(value) => <span style={{ color: '#475569', fontSize: '12px', fontWeight: 500, marginLeft: '4px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
