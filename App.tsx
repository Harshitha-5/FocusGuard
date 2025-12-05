import React, { useState, useEffect, useRef } from 'react';
import { BlockedApp, AppState, AppSettings } from './types';
import Dashboard from './components/Dashboard';
import AppSimulation from './components/AppSimulation';
import LockScreen from './components/LockScreen';
import Analytics from './components/Analytics';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';

// Initial Mock Data ("Installed" apps on the phone)
const INITIAL_APPS: BlockedApp[] = [
  { id: '1', name: 'InstaScroll', icon: '📸', color: 'bg-pink-500', dailyLimitSeconds: 60, usedSeconds: 0, type: 'social', isEnabled: true },
  { id: '2', name: 'TubeWatch', icon: '▶️', color: 'bg-red-500', dailyLimitSeconds: 120, usedSeconds: 45, type: 'video', isEnabled: true },
  { id: '3', name: 'TweetStream', icon: '🐦', color: 'bg-blue-500', dailyLimitSeconds: 300, usedSeconds: 10, type: 'social', isEnabled: true },
  { id: '4', name: 'TokTik', icon: '🎵', color: 'bg-black', dailyLimitSeconds: 30, usedSeconds: 20, type: 'video', isEnabled: true },
  { id: '5', name: 'SnapChatter', icon: '👻', color: 'bg-yellow-400 text-black', dailyLimitSeconds: 60, usedSeconds: 0, type: 'social', isEnabled: false },
  { id: '6', name: 'FaceBook', icon: '📘', color: 'bg-blue-700', dailyLimitSeconds: 60, usedSeconds: 0, type: 'social', isEnabled: false },
];

function App() {
  const [apps, setApps] = useState<BlockedApp[]>(INITIAL_APPS);
  const [settings, setSettings] = useState<AppSettings>({
    difficulty: 'medium',
    bonusTimeSeconds: 120,
    penaltySeconds: 5,
    challengeType: 'math' // Default
  });
  
  // Start in ONBOARDING for the demo
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [challengesSolved, setChallengesSolved] = useState(0);
  const [streakDays, setStreakDays] = useState(3); // Mocked streak
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived state
  const activeApp = apps.find(a => a.id === currentAppId);
  const totalUsage = apps.reduce((acc, app) => acc + app.usedSeconds, 0);

  // Timer Effect
  useEffect(() => {
    if (appState === AppState.ACTIVE_APP && activeApp) {
      timerRef.current = setInterval(() => {
        setApps(prevApps => prevApps.map(app => {
          if (app.id === activeApp.id) {
             const newUsed = app.usedSeconds + 1;
             // Check if limit reached
             if (newUsed >= app.dailyLimitSeconds) {
                // Trigger Lock
                setAppState(AppState.LOCKED);
             }
             return { ...app, usedSeconds: newUsed };
          }
          return app;
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, activeApp]);

  const handleOnboardingComplete = (configuredApps: BlockedApp[]) => {
    setApps(configuredApps);
    setAppState(AppState.DASHBOARD);
  };

  const handleLaunchApp = (app: BlockedApp) => {
    setCurrentAppId(app.id);
    if (app.usedSeconds >= app.dailyLimitSeconds) {
       setAppState(AppState.LOCKED);
    } else {
       setAppState(AppState.ACTIVE_APP);
    }
  };

  const handleExitApp = () => {
    setCurrentAppId(null);
    setAppState(AppState.DASHBOARD);
  };

  const handleUnlock = (bonusSeconds: number) => {
    if (activeApp) {
      // Extend the limit
      setApps(prevApps => prevApps.map(app => 
        app.id === activeApp.id 
          ? { ...app, dailyLimitSeconds: app.dailyLimitSeconds + bonusSeconds }
          : app
      ));
      setChallengesSolved(p => p + 1);
      setAppState(AppState.ACTIVE_APP); // Resume
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.ONBOARDING:
        return (
          <Onboarding 
             initialApps={INITIAL_APPS}
             onComplete={handleOnboardingComplete}
          />
        );

      case AppState.DASHBOARD:
        return (
          <Dashboard 
            apps={apps} 
            onLaunchApp={handleLaunchApp} 
            totalUsage={totalUsage}
            challengesSolved={challengesSolved}
            streakDays={streakDays}
            onViewAnalytics={() => setAppState(AppState.ANALYTICS)}
            onOpenSettings={() => setAppState(AppState.SETTINGS)}
          />
        );
      
      case AppState.SETTINGS:
        return (
          <Settings 
            settings={settings}
            onUpdate={setSettings}
            onBack={() => setAppState(AppState.DASHBOARD)}
          />
        );

      case AppState.ACTIVE_APP:
        if (!activeApp) return null;
        return (
          <AppSimulation 
            app={activeApp} 
            onExit={handleExitApp} 
            remainingTime={activeApp.dailyLimitSeconds - activeApp.usedSeconds} 
          />
        );

      case AppState.LOCKED:
        if (!activeApp) return null;
        return (
          <>
             <div className="absolute inset-0 filter blur-sm">
                <AppSimulation 
                    app={activeApp} 
                    onExit={() => {}} 
                    remainingTime={0} 
                />
             </div>
             <LockScreen 
                app={activeApp} 
                settings={settings}
                onUnlock={handleUnlock} 
                onExit={handleExitApp} 
             />
          </>
        );
      
      case AppState.ANALYTICS:
        return (
           <Analytics 
             onBack={() => setAppState(AppState.DASHBOARD)}
             apps={apps.filter(a => a.isEnabled)}
             logs={[]} 
           />
        );

      default:
        return <div>Error State</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 shadow-2xl overflow-hidden relative border-x border-slate-800">
      {renderContent()}
    </div>
  );
}

export default App;