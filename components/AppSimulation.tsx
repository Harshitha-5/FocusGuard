import React, { useEffect, useState, useRef } from 'react';
import { BlockedApp } from '../types';
import { Play, Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';

interface AppSimulationProps {
  app: BlockedApp;
  onExit: () => void;
  remainingTime: number;
}

const AppSimulation: React.FC<AppSimulationProps> = ({ app, onExit, remainingTime }) => {
  const [posts, setPosts] = useState<number[]>(Array.from({ length: 15 }, (_, i) => i + 1));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingTime < 30;

  // Simulate Doom Scrolling
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5; // Slow automated scroll
    let animationFrameId: number;

    const autoScroll = () => {
        if (scrollContainer) {
            scrollAmount += scrollSpeed;
            scrollContainer.scrollTop = scrollAmount;
            
            // Loop scroll for infinite feel
            if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 50) {
                 // Add more posts to bottom to make it infinite
                 setPosts(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => prev.length + i + 1)]);
            }
        }
        animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Delay start to feel natural
    const startTimeout = setTimeout(() => {
        animationFrameId = requestAnimationFrame(autoScroll);
    }, 1500);

    return () => {
        cancelAnimationFrame(animationFrameId);
        clearTimeout(startTimeout);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-white text-black overflow-hidden flex flex-col">
      {/* Simulation Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b border-gray-200 ${app.color === 'bg-red-500' ? 'bg-red-600 text-white' : 'bg-white'} z-20 shadow-sm`}>
        <button onClick={onExit} className="p-1 rounded hover:bg-black/10 transition-colors">
          <ArrowLeft size={24} className={app.color === 'bg-red-500' ? 'text-white' : 'text-black'} />
        </button>
        <h1 className={`font-bold text-lg ${app.color === 'bg-red-500' ? 'text-white' : 'text-black'}`}>{app.name}</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Floating Timer Pill */}
      <div className={`absolute top-16 right-4 z-50 px-3 py-1.5 rounded-full font-mono font-bold shadow-lg transition-colors duration-300 backdrop-blur-sm border border-white/20 ${
        isLowTime ? 'bg-red-500 text-white animate-pulse' : 'bg-black/80 text-white'
      }`}>
        {formatTime(remainingTime)}
      </div>

      {/* Mock Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-20 no-scrollbar relative">
        {app.type === 'video' ? (
           <div className="space-y-1 bg-black">
             {posts.map((i) => (
               <div key={i} className="relative w-full aspect-[9/16] bg-gray-900 border-b border-gray-800 flex items-center justify-center group overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${i + app.name}video/600/1000`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                    
                    <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center text-white">
                        <div className="bg-gray-800/50 p-3 rounded-full"><Heart size={28} /></div>
                        <div className="bg-gray-800/50 p-3 rounded-full"><MessageCircle size={28} /></div>
                        <div className="bg-gray-800/50 p-3 rounded-full"><Share2 size={28} /></div>
                    </div>

                    <div className="absolute left-4 bottom-8 text-white max-w-[70%]">
                        <div className="font-bold mb-2">@creator_{i}</div>
                        <div className="text-sm opacity-90">Watch this amazing video about productivity! #focus #viral</div>
                    </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="space-y-2 bg-gray-50">
            {posts.map((i) => (
              <div key={i} className="bg-white mb-2 pb-4 shadow-sm">
                <div className="flex items-center px-3 py-3 gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                       <div className="w-full h-full bg-white rounded-full p-[2px]">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="rounded-full" />
                       </div>
                   </div>
                   <span className="font-semibold text-sm">user_name_{i}</span>
                </div>
                <div className="w-full aspect-square bg-gray-100">
                    <img
                      src={`https://picsum.photos/seed/${i * 99}/800/800`}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-3 py-3 flex gap-4 text-black">
                    <Heart className="hover:text-red-500 cursor-pointer transition-colors" />
                    <MessageCircle className="hover:text-blue-500 cursor-pointer transition-colors" />
                    <Share2 />
                </div>
                <div className="px-3">
                   <p className="text-sm"><span className="font-bold">user_name_{i}</span> Just another day scrolling through the feed. Where did the time go? 🕰️ #life #random</p>
                   <p className="text-xs text-gray-400 mt-2 uppercase">2 HOURS AGO</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSimulation;