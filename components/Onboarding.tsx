import React, { useState } from 'react';
import { BlockedApp } from '../types';
import { Shield, Check, Smartphone, Layers, Clock, ArrowRight, Power, Plus, X } from 'lucide-react';

interface OnboardingProps {
  initialApps: BlockedApp[];
  onComplete: (configuredApps: BlockedApp[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ initialApps, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [permissions, setPermissions] = useState({ usage: false, overlay: false });
  const [apps, setApps] = useState<BlockedApp[]>(initialApps.map(app => ({ ...app, isEnabled: true })));
  const [newAppName, setNewAppName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleTogglePermission = (key: 'usage' | 'overlay') => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleApp = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, isEnabled: !app.isEnabled } : app
    ));
  };

  const handleTimeChange = (id: string, minutes: number) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, dailyLimitSeconds: minutes * 60 } : app
    ));
  };

  const handleAddCustomApp = () => {
    if (!newAppName.trim()) return;
    
    const colors = ['bg-pink-500', 'bg-purple-600', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newApp: BlockedApp = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      icon: newAppName.trim().charAt(0).toUpperCase(),
      color: randomColor,
      dailyLimitSeconds: 60,
      usedSeconds: 0,
      type: 'social', // Default to social for simulation
      isEnabled: true
    };

    setApps(prev => [newApp, ...prev]);
    setNewAppName('');
    setIsAdding(false);
  };

  const renderStep1 = () => (
    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-500/10">
        <Shield className="text-blue-400 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">Welcome to FocusGuard</h1>
      <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
        Stop the doom-scrolling. Reclaim your attention with mindful barriers.
      </p>
      <button 
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
      >
        Get Started <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-bold text-white mb-2">Required Permissions</h2>
      <p className="text-slate-400 text-sm mb-8">FocusGuard needs access to monitor usage and block apps.</p>

      <div className="space-y-4 mb-auto">
        {/* Usage Access */}
        <div 
          onClick={() => handleTogglePermission('usage')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${permissions.usage ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.usage ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {permissions.usage ? <Check size={20} /> : <Smartphone size={20} />}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">Usage Access</h3>
            <p className="text-xs text-slate-400">To track app time limits</p>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${permissions.usage ? 'bg-blue-500' : 'bg-slate-700'}`}>
             <div className={`w-4 h-4 rounded-full bg-white transition-transform ${permissions.usage ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Overlay Permission */}
        <div 
          onClick={() => handleTogglePermission('overlay')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${permissions.overlay ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}
        >
           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${permissions.overlay ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {permissions.overlay ? <Check size={20} /> : <Layers size={20} />}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">Display Over Apps</h3>
            <p className="text-xs text-slate-400">To show lock screen</p>
          </div>
           <div className={`w-12 h-6 rounded-full p-1 transition-colors ${permissions.overlay ? 'bg-blue-500' : 'bg-slate-700'}`}>
             <div className={`w-4 h-4 rounded-full bg-white transition-transform ${permissions.overlay ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>

      <button 
        onClick={() => setStep(3)}
        disabled={!permissions.usage || !permissions.overlay}
        className={`w-full py-4 rounded-xl font-semibold transition-all mt-6 flex items-center justify-center gap-2
          ${permissions.usage && permissions.overlay 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        Continue
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300">
      <h2 className="text-2xl font-bold text-white mb-2">Set Limits</h2>
      <p className="text-slate-400 text-sm mb-6">Choose apps to block and their daily allowances.</p>

      {/* Add Custom App Section */}
      <div className="mb-4">
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border border-dashed border-slate-600 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Custom App
          </button>
        ) : (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <input 
              type="text" 
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="App Name (e.g. Genshin)"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 text-white placeholder-slate-500 text-sm focus:border-blue-500 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomApp()}
            />
            <button 
              onClick={handleAddCustomApp}
              disabled={!newAppName.trim()}
              className="bg-blue-600 text-white px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button 
              onClick={() => { setIsAdding(false); setNewAppName(''); }}
              className="bg-slate-800 text-slate-400 px-3 rounded-xl hover:text-white border border-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 no-scrollbar">
        {apps.map(app => (
          <div key={app.id} className={`p-3 rounded-xl border transition-all ${app.isEnabled ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/50 border-transparent opacity-60'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${app.color}`}>
                   {app.icon}
                </div>
                <div>
                   <h3 className="text-white text-sm font-medium">{app.name}</h3>
                   <span className="text-xs text-slate-400 capitalize">{app.type}</span>
                </div>
              </div>
              <button 
                onClick={() => handleToggleApp(app.id)}
                className={`p-2 rounded-lg transition-colors ${app.isEnabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
              >
                <Power size={18} />
              </button>
            </div>
            
            {app.isEnabled && (
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg">
                <Clock size={16} className="text-slate-400" />
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  value={app.dailyLimitSeconds / 60} 
                  onChange={(e) => handleTimeChange(app.id, parseInt(e.target.value))}
                  className="flex-1 accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono text-white w-12 text-right">
                   {app.dailyLimitSeconds / 60}m
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => onComplete(apps)}
        className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-green-900/20 mt-6"
      >
        Finish Setup
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col">
       {step === 1 && renderStep1()}
       {step === 2 && renderStep2()}
       {step === 3 && renderStep3()}
    </div>
  );
};

export default Onboarding;