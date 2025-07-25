
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Euro, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartData {
  month: string;
  revenue: number;
  users: number;
  invoices: number;
}

interface LiveStatsChartProps {
  className?: string;
  showTitle?: boolean;
}

export function LiveStatsChart({ className = '', showTitle = true }: LiveStatsChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currentStats, setCurrentStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalInvoices: 0,
    growth: 0
  });

  useEffect(() => {
    // Generate realistic chart data
    const generateChartData = () => {
      const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      const now = new Date();
      const currentMonth = now.getMonth();
      
      const data: ChartData[] = [];
      
      for (let i = Math.max(0, currentMonth - 11); i <= currentMonth; i++) {
        const monthIndex = i < 0 ? 12 + i : i;
        const baseRevenue = 50000;
        const growth = Math.pow(1.15, i - Math.max(0, currentMonth - 11)); // 15% monthly growth
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        
        data.push({
          month: months[monthIndex],
          revenue: Math.floor(baseRevenue * growth * randomVariation),
          users: Math.floor(800 + (i * 180) + Math.random() * 100),
          invoices: Math.floor(2500 + (i * 450) + Math.random() * 200)
        });
      }
      
      setChartData(data);
      
      // Calculate current totals
      const latestData = data[data.length - 1];
      const previousData = data[data.length - 2];
      const growthRate = previousData ? 
        ((latestData.revenue - previousData.revenue) / previousData.revenue) * 100 : 0;
      
      setCurrentStats({
        totalRevenue: latestData?.revenue || 0,
        totalUsers: latestData?.users || 0,
        totalInvoices: latestData?.invoices || 0,
        growth: growthRate
      });
    };

    generateChartData();
    
    // Update every 30 seconds to simulate live data
    const interval = setInterval(generateChartData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => `€${(value / 1000).toFixed(0)}K`;
  const formatNumber = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Live Statistieken</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-6">
          {/* Current Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Euro className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentStats.totalRevenue)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Maandelijkse omzet</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(currentStats.totalUsers)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Actieve gebruikers</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(currentStats.totalInvoices)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Facturen deze maand</p>
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                +{currentStats.growth.toFixed(1)}% groei deze maand
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Omzet']}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
