import React from 'react';
import { BlockedApp } from '../types';
import { ShieldCheck, BarChart2, Settings as SettingsIcon, Flame } from 'lucide-react';

interface DashboardProps {
  apps: BlockedApp[];
  onLaunchApp: (app: BlockedApp) => void;
  totalUsage: number;
  challengesSolved: number;
  streakDays: number;
  onViewAnalytics: () => void;
  onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apps, onLaunchApp, totalUsage, challengesSolved, streakDays, onViewAnalytics, onOpenSettings }) => {
  
  // Only show enabled apps
  const activeApps = apps.filter(a => a.isEnabled);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
             <ShieldCheck className="text-blue-400" size={20} />
           </div>
           <div>
             <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FocusGuard</h1>
             <p className="text-slate-400 text-xs">Mindful Controller</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                <Flame size={14} className="text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-400">{streakDays}</span>
            </div>
            <button 
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            >
            <SettingsIcon size={24} />
            </button>
        </div>
      </header>

      {/* Daily Summary Card */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-xl relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" onClick={onViewAnalytics}>
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8"></div>
         <div className="relative z-10 flex justify-between items-end">
            <div>
               <p className="text-slate-400 text-sm font-medium mb-1">Total Screen Time</p>
               <h3 className="text-3xl font-bold text-white">{Math.floor(totalUsage / 60)}<span className="text-lg text-slate-500 font-normal">m</span> {totalUsage % 60}<span className="text-lg text-slate-500 font-normal">s</span></h3>
            </div>
            <div className="text-right">
               <p className="text-slate-400 text-sm font-medium mb-1">Challenges</p>
               <h3 className="text-2xl font-bold text-green-400">{challengesSolved}</h3>
            </div>
         </div>
         <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-medium group-hover:underline">
            <BarChart2 size={14} /> View Analytics
         </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-slate-200">Restricted Apps</h2>
      
      {activeApps.length === 0 ? (
        <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-800 border-dashed text-slate-500 text-sm">
           No apps configured. <br/> Check settings to enable apps.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {activeApps.map(app => {
            const isBlocked = app.usedSeconds >= app.dailyLimitSeconds;
            const percent = Math.min(100, (app.usedSeconds / app.dailyLimitSeconds) * 100);
            
            return (
              <button
                key={app.id}
                onClick={() => onLaunchApp(app)}
                className={`
                  relative flex flex-col items-center p-5 rounded-xl border transition-all duration-200
                  ${isBlocked 
                    ? 'bg-slate-800/50 border-red-500/30 grayscale-[0.5]' 
                    : 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:bg-slate-700'}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-lg ${app.color}`}>
                  {app.icon}
                </div>
                <span className="font-medium text-sm text-slate-200">{app.name}</span>
                
                <div className="w-full mt-3 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isBlocked ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 mt-1.5">
                  {formatTime(app.usedSeconds)} / {formatTime(app.dailyLimitSeconds)}
                </span>

                {isBlocked && (
                  <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-4 items-start">
         <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
            <ShieldCheck size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-blue-300">How it works</h4>
            <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
               Select an app above to simulate using it. Once your time limit is reached, FocusGuard will intercept and require a {apps.some(a => a.id) ? 'challenge' : 'challenge'} to continue.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;