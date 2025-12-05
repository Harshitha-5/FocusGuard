import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BlockedApp, UsageLog } from '../types';
import { ArrowLeft } from 'lucide-react';

interface AnalyticsProps {
  onBack: () => void;
  apps: BlockedApp[];
  logs: UsageLog[];
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack, apps }) => {
  // Transform app data for chart
  const data = apps.map(app => ({
    name: app.name,
    used: Math.floor(app.usedSeconds / 60), // minutes
    limit: Math.floor(app.dailyLimitSeconds / 60), // minutes
    color: app.color.includes('red') ? '#ef4444' : app.color.includes('pink') ? '#ec4899' : '#3b82f6'
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Your Focus Report</h1>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg mb-6">
        <h3 className="text-slate-400 text-sm font-medium mb-6">Usage Today (Minutes)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="used" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h4 className="text-slate-400 text-xs mb-1">Most Used</h4>
            <p className="text-lg font-bold text-white">
               {apps.sort((a,b) => b.usedSeconds - a.usedSeconds)[0]?.name || 'None'}
            </p>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h4 className="text-slate-400 text-xs mb-1">Focus Score</h4>
            <p className="text-lg font-bold text-green-400">85</p>
         </div>
      </div>

      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>Keep your usage under the limit to improve your focus score.</p>
      </div>
    </div>
  );
};

export default Analytics;
