import React, { useState, useEffect, useRef } from 'react';
import { generateMathChallenge, generateMotivation } from '../services/geminiService';
import { MathQuestion, BlockedApp, AppSettings } from '../types';
import { Lock, Loader2, Trophy, Eye, Wind, X } from 'lucide-react';

interface LockScreenProps {
  app: BlockedApp;
  settings: AppSettings;
  onUnlock: (earnedSeconds: number) => void;
  onExit: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ app, settings, onUnlock, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  // Math State
  const [mathChallenge, setMathChallenge] = useState<MathQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);

  // Memory State
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState<'memorize' | 'recall'>('memorize');
  const [timeLeftToMemorize, setTimeLeftToMemorize] = useState(0);

  // Breathing State
  const [breathsTaken, setBreathsTaken] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [breathMessage, setBreathMessage] = useState("Get Ready");

  useEffect(() => {
    loadChallenge();
    loadMotivation();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    }
  }, [cooldown]);

  // Memory Countdown Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (settings.challengeType === 'memory' && memoryPhase === 'memorize' && timeLeftToMemorize > 0) {
      timer = setInterval(() => {
        setTimeLeftToMemorize((prev) => {
          if (prev <= 1) {
             setMemoryPhase('recall');
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); }
  }, [settings.challengeType, memoryPhase, timeLeftToMemorize]);

  // Breathing Effect
  useEffect(() => {
      if (settings.challengeType !== 'breathing' || success) return;
      if (breathPhase === 'ready') return;

      let timeout: ReturnType<typeof setTimeout>;

      // Breathing Cycle: Inhale 4s, Hold 2s, Exhale 4s
      const runCycle = async () => {
          if (breathsTaken >= (settings.difficulty === 'easy' ? 3 : settings.difficulty === 'medium' ? 5 : 7)) {
              handleSuccess();
              return;
          }

          if (breathPhase === 'inhale') {
              setBreathMessage("Inhale...");
              timeout = setTimeout(() => setBreathPhase('hold'), 4000);
          } else if (breathPhase === 'hold') {
              setBreathMessage("Hold...");
              timeout = setTimeout(() => setBreathPhase('exhale'), 2000);
          } else if (breathPhase === 'exhale') {
              setBreathMessage("Exhale...");
              timeout = setTimeout(() => {
                  setBreathsTaken(prev => prev + 1);
                  setBreathPhase('inhale');
              }, 4000);
          }
      };

      runCycle();
      return () => clearTimeout(timeout);
  }, [breathPhase, breathsTaken, settings.challengeType, success]);


  const loadChallenge = async () => {
    setLoading(true);
    setSuccess(false);
    setMathChallenge(null);
    setSelectedOption(null);
    setIsWrong(false);
    setUserInput([]);
    setMemorySequence([]);
    setBreathsTaken(0);
    setBreathPhase('ready');
    
    if (settings.challengeType === 'math') {
        const q = await generateMathChallenge(settings.difficulty);
        setMathChallenge(q);
        setLoading(false);
    } else if (settings.challengeType === 'memory') {
        // Generate Memory Sequence
        const length = settings.difficulty === 'easy' ? 4 : settings.difficulty === 'medium' ? 6 : 8;
        const sequence = Array.from({ length }, () => Math.floor(Math.random() * 10)); // 0-9
        const memTime = settings.difficulty === 'easy' ? 3 : settings.difficulty === 'medium' ? 4 : 5;
        
        setMemorySequence(sequence);
        setMemoryPhase('memorize');
        setTimeLeftToMemorize(memTime);
        setLoading(false);
    } else {
        // Breathing
        setLoading(false);
        // User starts manually
    }
  };

  const loadMotivation = async () => {
      const msg = await generateMotivation();
      setMotivation(msg);
  }

  // --- MATH HANDLER ---
  const handleMathOptionClick = (option: number) => {
    if (cooldown > 0 || success) return;
    setSelectedOption(option);

    if (mathChallenge && option === mathChallenge.answer) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  // --- MEMORY HANDLER ---
  const handleMemoryInput = (digit: number) => {
    if (cooldown > 0 || success || memoryPhase === 'memorize') return;
    
    const newInput = [...userInput, digit];
    setUserInput(newInput);

    if (newInput.length === memorySequence.length) {
      // Check result
      const isCorrect = newInput.every((val, index) => val === memorySequence[index]);
      if (isCorrect) {
        handleSuccess();
      } else {
        handleFailure();
        setTimeout(() => {
             if (cooldown === 0) {
                 setUserInput([]);
             }
        }, 1000);
      }
    }
  };

  const handleBackspace = () => {
    if (userInput.length > 0) {
      setUserInput(userInput.slice(0, -1));
    }
  };

  const startBreathing = () => {
      setBreathPhase('inhale');
  };

  // --- COMMON LOGIC ---
  const handleSuccess = () => {
      setSuccess(true);
      setTimeout(() => {
        onUnlock(settings.bonusTimeSeconds);
      }, 800);
  };

  const handleFailure = () => {
      setIsWrong(true);
      setCooldown(settings.penaltySeconds);
      setTimeout(() => {
         setIsWrong(false);
         if (settings.challengeType === 'math') setSelectedOption(null);
         else setUserInput([]);
      }, 1000);
      
      if (settings.challengeType === 'memory') {
          setTimeout(() => {
             setMemoryPhase('memorize');
             setTimeLeftToMemorize(3); 
          }, settings.penaltySeconds * 1000);
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-300">
      
      <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center shadow-inner">
             {loading ? <Loader2 className="animate-spin text-blue-400" size={32} /> : 
              success ? <Trophy className="text-yellow-400 animate-bounce" size={32} /> :
              settings.challengeType === 'breathing' ? <Wind className="text-teal-400" size={32} /> :
              <Lock className="text-red-400" size={32} />}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">
            {success ? "Unlocked!" : settings.challengeType === 'breathing' ? "Pause & Breathe" : "Time's Up!"}
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
           {settings.challengeType === 'math' && "Solve this equation to unlock."}
           {settings.challengeType === 'memory' && "Memorize the pattern to unlock."}
           {settings.challengeType === 'breathing' && "Center yourself to continue."}
        </p>

        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center space-y-3">
             <span className="text-sm text-slate-500 animate-pulse">Preparing Challenge...</span>
          </div>
        ) : (
          <div className="animate-in zoom-in duration-300 min-h-[250px] flex flex-col justify-center">
             
             {/* MATH UI */}
             {settings.challengeType === 'math' && mathChallenge && (
                <>
                    <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <span className="text-3xl font-mono tracking-widest font-bold">{mathChallenge.question} = ?</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {mathChallenge.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleMathOptionClick(opt)}
                            disabled={cooldown > 0 || success}
                            className={`
                            py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95
                            ${selectedOption === opt
                                ? opt === mathChallenge.answer
                                ? 'bg-green-500 text-white shadow-green-500/50 shadow-lg'
                                : 'bg-red-500 text-white shake'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
                            ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {opt}
                        </button>
                        ))}
                    </div>
                </>
             )}

             {/* MEMORY UI */}
             {settings.challengeType === 'memory' && (
                 <div className="mb-4">
                     {memoryPhase === 'memorize' ? (
                         <div className="flex flex-col items-center">
                             <div className="flex gap-2 mb-4">
                                {memorySequence.map((num, i) => (
                                    <div key={i} className="w-12 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-white border border-slate-600 shadow-lg">
                                        {num}
                                    </div>
                                ))}
                             </div>
                             <div className="flex items-center gap-2 text-blue-400 text-sm font-medium animate-pulse">
                                <Eye size={16} /> Memorize in {timeLeftToMemorize}s
                             </div>
                             <div className="w-full h-1 bg-slate-700 mt-4 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${(timeLeftToMemorize / (settings.difficulty === 'easy' ? 3 : settings.difficulty === 'medium' ? 4 : 5)) * 100}%` }}
                                ></div>
                             </div>
                         </div>
                     ) : (
                         <div className="flex flex-col items-center">
                             <div className="flex gap-2 mb-6 h-16">
                                {Array.from({ length: memorySequence.length }).map((_, i) => (
                                    <div key={i} className={`w-12 h-16 rounded-lg flex items-center justify-center text-3xl font-bold border shadow-lg transition-colors
                                        ${userInput[i] !== undefined 
                                            ? success ? 'bg-green-500 border-green-400 text-white' : 'bg-slate-600 border-slate-500 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-600'}
                                    `}>
                                        {userInput[i] !== undefined ? userInput[i] : '•'}
                                    </div>
                                ))}
                             </div>
                             
                             <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleMemoryInput(num)}
                                        disabled={cooldown > 0 || success}
                                        className="h-14 bg-slate-700 rounded-lg text-xl font-bold hover:bg-slate-600 active:scale-95 transition-all text-white disabled:opacity-50"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <div className="h-14"></div>
                                <button
                                    onClick={() => handleMemoryInput(0)}
                                    disabled={cooldown > 0 || success}
                                    className="h-14 bg-slate-700 rounded-lg text-xl font-bold hover:bg-slate-600 active:scale-95 transition-all text-white disabled:opacity-50"
                                >
                                    0
                                </button>
                                <button
                                    onClick={handleBackspace}
                                    disabled={cooldown > 0 || success}
                                    className="h-14 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 active:scale-95 transition-all"
                                >
                                    <X size={20} />
                                </button>
                             </div>
                         </div>
                     )}
                 </div>
             )}

             {/* BREATHING UI */}
             {settings.challengeType === 'breathing' && (
                 <div className="flex flex-col items-center py-6">
                    {breathPhase === 'ready' ? (
                        <button 
                            onClick={startBreathing}
                            className="w-32 h-32 rounded-full bg-teal-500/20 border-2 border-teal-500 text-teal-400 font-bold flex flex-col items-center justify-center gap-2 hover:bg-teal-500/30 transition-all active:scale-95 animate-pulse"
                        >
                            <Wind size={24} />
                            Start
                        </button>
                    ) : (
                        <div className="relative flex items-center justify-center w-40 h-40">
                             {/* Breathing Circle Animation */}
                             <div 
                                className={`absolute inset-0 bg-teal-500/30 rounded-full transition-all ease-in-out
                                ${breathPhase === 'inhale' ? 'duration-[4000ms] scale-150 opacity-100' : ''}
                                ${breathPhase === 'hold' ? 'duration-500 scale-150 opacity-80' : ''}
                                ${breathPhase === 'exhale' ? 'duration-[4000ms] scale-75 opacity-40' : ''}
                                `}
                             ></div>
                             <div className="relative z-10 text-center">
                                 <h3 className="text-2xl font-bold text-white mb-1">{breathMessage}</h3>
                                 <p className="text-xs text-teal-200 uppercase tracking-widest font-bold">
                                    {breathsTaken} / {settings.difficulty === 'easy' ? 3 : settings.difficulty === 'medium' ? 5 : 7}
                                 </p>
                             </div>
                        </div>
                    )}
                    <p className="mt-8 text-xs text-slate-500 text-center max-w-[200px]">
                        Sync your breathing with the circle to lower dopamine levels.
                    </p>
                 </div>
             )}

          </div>
        )}

        {isWrong && (
            <div className="text-red-400 font-medium mb-4 animate-bounce bg-red-500/10 py-2 rounded-lg mt-2">
               Incorrect! Locked for {cooldown}s.
            </div>
        )}
        
        {success && (
             <div className="text-green-400 font-medium mb-4 flex items-center justify-center gap-2 mt-4 animate-in slide-in-from-bottom-2">
               <Trophy size={18} /> Focus Unlocked!
            </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-700">
           <p className="text-xs text-slate-500 italic mb-4">"{motivation}"</p>
           <button 
             onClick={onExit}
             className="text-slate-400 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
           >
             Close App
           </button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;