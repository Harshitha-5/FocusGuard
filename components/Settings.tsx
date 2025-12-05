import React from 'react';
import { AppSettings } from '../types';
import { ArrowLeft, Brain, Timer, Zap, Gamepad2, Wind } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onBack }) => {
  
  const update = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Challenge Type */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
           <div className="flex items-center gap-3 mb-4 text-blue-400">
              <Gamepad2 size={20} />
              <h3 className="font-semibold text-white">Challenge Type</h3>
           </div>
           <div className="grid grid-cols-3 gap-2">
              <button
                  onClick={() => update('challengeType', 'math')}
                  className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1
                    ${settings.challengeType === 'math'
                       ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <span className="text-lg">🔢</span> Math
                </button>
                <button
                  onClick={() => update('challengeType', 'memory')}
                  className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1
                    ${settings.challengeType === 'memory'
                       ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/30' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <span className="text-lg">🧠</span> Memory
                </button>
                <button
                  onClick={() => update('challengeType', 'breathing')}
                  className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1
                    ${settings.challengeType === 'breathing'
                       ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/30' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <span className="text-lg">🌬️</span> Breath
                </button>
           </div>
           <p className="text-xs text-slate-500 mt-3">
             {settings.challengeType === 'math' && "Solve math problems to unlock your apps."}
             {settings.challengeType === 'memory' && "Memorize and recall number sequences."}
             {settings.challengeType === 'breathing' && "Complete a guided breathing exercise."}
           </p>
        </section>

        {/* Difficulty */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
           <div className="flex items-center gap-3 mb-4 text-purple-400">
              <Brain size={20} />
              <h3 className="font-semibold text-white">Difficulty</h3>
           </div>
           <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => update('difficulty', level)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all border
                    ${settings.difficulty === level 
                       ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-900/30' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  {level}
                </button>
              ))}
           </div>
           <p className="text-xs text-slate-500 mt-3">
             {settings.challengeType === 'math' && (
                <>
                  {settings.difficulty === 'easy' && "Simple addition (e.g., 12 + 7)."}
                  {settings.difficulty === 'medium' && "Multiplication (e.g., 8 × 6)."}
                  {settings.difficulty === 'hard' && "Complex math (e.g., 15 × 3 - 9)."}
                </>
             )}
             {settings.challengeType === 'memory' && (
                <>
                  {settings.difficulty === 'easy' && "Memorize 4 digits."}
                  {settings.difficulty === 'medium' && "Memorize 6 digits."}
                  {settings.difficulty === 'hard' && "Memorize 8 digits."}
                </>
             )}
             {settings.challengeType === 'breathing' && (
                <>
                  {settings.difficulty === 'easy' && "3 Breaths (~20s)."}
                  {settings.difficulty === 'medium' && "5 Breaths (~35s)."}
                  {settings.difficulty === 'hard' && "7 Breaths (~50s)."}
                </>
             )}
           </p>
        </section>

        {/* Bonus Time */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
           <div className="flex items-center gap-3 mb-4 text-green-400">
              <Timer size={20} />
              <h3 className="font-semibold text-white">Bonus Time Reward</h3>
           </div>
           <div className="flex items-center justify-between bg-slate-900 rounded-lg p-3 border border-slate-700">
              <span className="text-sm text-slate-300">Reward duration</span>
              <select 
                value={settings.bonusTimeSeconds}
                onChange={(e) => update('bonusTimeSeconds', parseInt(e.target.value))}
                className="bg-slate-800 text-white text-sm font-bold py-1 px-3 rounded border border-slate-600 outline-none focus:border-green-500"
              >
                <option value={60}>1 Minute</option>
                <option value={120}>2 Minutes</option>
                <option value={300}>5 Minutes</option>
                <option value={600}>10 Minutes</option>
              </select>
           </div>
        </section>

        {/* Strict Mode (Penalty) */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
           <div className="flex items-center gap-3 mb-4 text-red-400">
              <Zap size={20} />
              <h3 className="font-semibold text-white">Wrong Answer Penalty</h3>
           </div>
           <div className="grid grid-cols-3 gap-2">
              {[5, 15, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => update('penaltySeconds', sec)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border
                    ${settings.penaltySeconds === sec 
                       ? 'bg-red-500 border-red-500 text-white' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  {sec}s
                </button>
              ))}
           </div>
           <p className="text-xs text-slate-500 mt-3">
             Wait time forced after an incorrect answer.
           </p>
        </section>
      </div>
    </div>
  );
};

export default Settings;