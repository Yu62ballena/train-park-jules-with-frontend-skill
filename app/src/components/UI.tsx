import { useStore } from '../store/useStore';
import type { GameMode } from '../store/useStore';
import { Train, Move, Camera, Settings2, Trash2 } from 'lucide-react';

export const UI = () => {
  const {
    mode, setMode,
    cameraMode, setCameraMode,
    selectedTool, setSelectedTool,
    selectedTrainType, setSelectedTrainType,
    clearAll
  } = useStore();

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6 z-10 font-sans">
      {/* Header Panel */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto bg-slate-900/90 text-slate-100 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/50 w-80">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
            <Train className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight">DigitRails</h1>
          </div>

          <div className="space-y-5">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Mode
              </h2>
              <div className="flex bg-slate-800/50 rounded-lg p-1 gap-1">
                {(['FREE', 'TEMPLATE', 'PRESET'] as GameMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${mode === m ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" /> Camera
              </h2>
              <div className="flex gap-2">
                 <button
                    onClick={() => setCameraMode('OVERVIEW')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${cameraMode === 'OVERVIEW' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setCameraMode('FIRST_PERSON')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${cameraMode === 'FIRST_PERSON' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}
                  >
                    1st Person
                  </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer / Tools Panel */}
      <div className="flex justify-center mb-4">
        {mode !== 'PRESET' && (
          <div className="pointer-events-auto bg-slate-900/90 p-3 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/50 flex gap-2">
             <ToolButton
                active={selectedTool === 'straight'}
                onClick={() => setSelectedTool('straight')}
                label="Straight"
                icon={<Move className="w-5 h-5" />}
             />
             <ToolButton
                active={selectedTool === 'curve'}
                onClick={() => setSelectedTool('curve')}
                label="Curve"
                icon={<Move className="w-5 h-5 rotate-45" />}
             />
             <div className="w-px bg-slate-700 mx-2 my-1" />
             <ToolButton
                active={selectedTool === null && selectedTrainType === 'shinkansen'}
                onClick={() => { setSelectedTool(null); setSelectedTrainType('shinkansen'); }}
                label="Shinkansen"
                icon={<Train className="w-5 h-5" />}
             />
             <ToolButton
                active={selectedTool === null && selectedTrainType === 'steam'}
                onClick={() => { setSelectedTool(null); setSelectedTrainType('steam'); }}
                label="Steam"
                icon={<Train className="w-5 h-5" />}
             />
             <div className="w-px bg-slate-700 mx-2 my-1" />
             <button
               onClick={clearAll}
               className="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all text-red-400 hover:bg-red-500/20 hover:text-red-300"
             >
               <Trash2 className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold tracking-wider">CLEAR</span>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
      active
        ? 'bg-amber-500 text-slate-900 shadow-lg scale-105'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] font-bold tracking-wider uppercase">{label}</span>
  </button>
);
