import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { _id: string; revenue: number; count: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    month: d._id,
    revenue: d.revenue,
    bookings: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
          tickMargin={12} 
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#0f172a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '12px 16px'
          }}
          formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
          labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '6px' }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#revenueFill)"
          activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
