import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UserGrowthChartProps {
  data: { _id: string; count: number }[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = data.map((d) => ({
    month: d._id,
    users: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="#94a3b8" 
          fontSize={12} 
          fontWeight={500}
          tickLine={false} 
          axisLine={false} 
          tickMargin={12} 
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          fontWeight={500}
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false} 
          tickMargin={12} 
          width={40}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#0f172a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '12px 16px'
          }}
          labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '6px' }}
        />
        <Bar dataKey="users" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2563eb' : '#dbeafe'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
