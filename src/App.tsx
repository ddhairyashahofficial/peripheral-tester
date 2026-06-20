import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MousePointer2, Keyboard, Gamepad2, Hand, Activity, RotateCcw, Zap, PenTool, Smartphone, Vibrate } from 'lucide-react';

// --- Sub-components ---

// 1. LIVE INPUTS BANNER
const LiveInputsBanner = ({ activeKeys, pointerData, gamepad }) => {
  const inputs = [];
  
  // Pointer
  if (pointerData.buttons.left) inputs.push({ type: pointerData.type, label: 'Primary Click', color: 'bg-blue-600' });
  if (pointerData.buttons.middle) inputs.push({ type: pointerData.type, label: 'Middle Click', color: 'bg-blue-600' });
  if (pointerData.buttons.right) inputs.push({ type: pointerData.type, label: 'Secondary Click', color: 'bg-red-500' });

  // Keyboard
  Object.values(activeKeys).forEach((k: any) => {
      inputs.push({ type: 'Key', label: k.key === ' ' ? 'Space' : k.key, color: 'bg-purple-600' });
  });

  // Gamepad
  if (gamepad) {
      const buttonNames = ['A', 'B', 'X', 'Y', 'L1', 'R1', 'L2', 'R2', 'Select', 'Start', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'];
      gamepad.buttons.forEach((btn, idx) => {
          if (btn.pressed) {
              inputs.push({ type: 'Gamepad', label: buttonNames[idx] || `Btn ${idx}`, color: 'bg-pink-600' });
          }
      });
  }

  return (
    <div className="w-full bg-slate-900 text-white p-4 rounded-2xl flex gap-3 items-center min-h-[72px] overflow-x-auto shadow-xl shadow-slate-200/50 mb-6 border border-slate-800">
       <span className="text-slate-400 text-xs font-bold uppercase tracking-widest shrink-0 flex items-center gap-2">
          <Activity size={16} className="animate-pulse text-green-400" />
          Live Activity
       </span>
       <div className="w-px h-6 bg-slate-700 mx-2 shrink-0"></div>
       
       {inputs.length === 0 ? (
           <span className="text-slate-500 italic text-sm">Awaiting input from any peripheral...</span>
       ) : (
           <div className="flex gap-2 flex-nowrap">
             {inputs.map((inp, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex gap-2 items-center whitespace-nowrap animate-in zoom-in duration-75 shadow-sm ${inp.color}`}>
                   <span className="opacity-75 text-[10px] uppercase bg-black/20 px-1.5 py-0.5 rounded">{inp.type}</span>
                   {inp.label}
                </div>
             ))}
           </div>
       )}
    </div>
  );
};

// 2. POINTER & STYLUS VISUALIZER
const PointerVisualizer = ({ pointerData, scrollData, pollingRate }) => {
  const isPen = pointerData.type === 'pen';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col relative overflow-hidden">
      <div className="w-full flex justify-between items-center mb-6 relative z-10">
        <h2 className="font-bold flex items-center gap-2 text-slate-700">
          {isPen ? <PenTool size={20} className="text-blue-500" /> : <MousePointer2 size={20} className="text-blue-500" />} 
          {isPen ? 'Stylus / Pen' : 'Pointer / Mouse'}
        </h2>
        <div className="text-right">
            <div className="text-xs font-mono font-bold text-blue-600">{pollingRate} Hz</div>
            <div className="text-[9px] text-gray-400 uppercase">Polling Rate</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 z-10">
        {/* Left Col: Visuals */}
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-36 bg-slate-100 rounded-full border-4 border-slate-300 shadow-md flex flex-col overflow-hidden mb-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-0.5 bg-slate-200" />
                
                <div className="h-1/2 flex w-full">
                <div className={`w-1/2 h-full border-b border-r border-slate-300 transition-colors ${pointerData.buttons.left ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div className={`w-1/2 h-full border-b border-l border-slate-300 transition-colors ${pointerData.buttons.right ? 'bg-red-500' : 'bg-transparent'}`} />
                </div>
                
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center">
                    <div className={`w-2 h-4 rounded-full transition-colors ${pointerData.buttons.middle ? 'bg-blue-600' : 'bg-slate-400'} ${(scrollData.y !== 0) ? 'animate-pulse bg-blue-400' : ''}`}></div>
                </div>
            </div>
            <div className="text-xs font-mono text-slate-400">Type: <strong className="text-slate-700 uppercase">{pointerData.type}</strong></div>
        </div>

        {/* Right Col: Telemetry */}
        <div className="flex flex-col justify-center gap-3">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
               <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Coordinates</div>
               <div className="text-xs font-mono font-medium text-slate-700">X: {pointerData.x.toFixed(0)}</div>
               <div className="text-xs font-mono font-medium text-slate-700">Y: {pointerData.y.toFixed(0)}</div>
            </div>
            
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
               <div className="text-[9px] text-slate-400 uppercase font-bold mb-1 flex justify-between">
                   <span>Pressure</span>
                   <span className="text-green-600">{(pointerData.pressure * 100).toFixed(0)}%</span>
               </div>
               <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${pointerData.pressure * 100}%` }} />
               </div>
            </div>

            {isPen && (
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                   <div className="text-[9px] text-blue-400 uppercase font-bold mb-1">Stylus Tilt</div>
                   <div className="text-xs font-mono font-medium text-blue-700">X: {pointerData.tiltX}° | Y: {pointerData.tiltY}°</div>
                </div>
            )}

            {!isPen && (
               <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Scroll Delta</div>
                   <div className="text-xs font-mono font-medium text-slate-700">dY: {scrollData.y.toFixed(1)}</div>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

// 3. KEYBOARD VISUALIZER
const KeyboardVisualizer = ({ activeKeys, history, maxNkro }) => {
  const activeCount = Object.keys(activeKeys).length;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-bold flex items-center gap-2 text-slate-700"><Keyboard size={20} className="text-purple-500" /> Keyboard</h2>
        <div className="text-right flex items-center gap-4">
           <div className="text-right">
              <div className="text-xs font-mono font-bold text-purple-600">{maxNkro} Keys</div>
              <div className="text-[9px] text-gray-400 uppercase">Max NKRO</div>
           </div>
           <div className={`w-3 h-3 rounded-full ${activeCount ? 'bg-green-500 animate-pulse' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-wrap gap-2 content-start overflow-hidden relative">
          {activeCount === 0 && <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 italic">Press any keys...</span>}
          {Object.entries(activeKeys).map(([code, data]: [string, any]) => (
            <div key={code} className="px-3 py-1.5 bg-purple-100 border border-purple-200 rounded-lg text-purple-700 flex items-center gap-2 animate-in zoom-in duration-75 shadow-sm">
               <span className="font-bold text-sm">{data.key === ' ' ? 'Space' : data.key}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Duration History</div>
          {history.slice(0, 3).map((h) => (
             <div key={h.id} className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{h.key === ' ' ? 'Space' : h.key}</span>
                <div className="flex items-center gap-2 flex-1 mx-3">
                   <div className="h-1 bg-slate-100 w-full rounded-full overflow-hidden">
                      <div className={`h-full ${h.duration < 50 ? 'bg-red-400' : 'bg-purple-400'}`} style={{ width: `${Math.min((h.duration/500)*100, 100)}%` }} />
                   </div>
                </div>
                <span className="font-mono text-slate-500 w-12 text-right">{h.duration.toFixed(0)}ms</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. TOUCHPAD & DEVICE HAPTICS
const TouchVisualizer = ({ touches }) => {
  const canvasRef = useRef(null);

  const testMobileHaptics = () => {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    } else {
        alert("Haptics/Vibration API is not supported on this specific device/browser.");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (touches.length === 0) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Multitouch Trackpad", rect.width/2, rect.height/2);
    }

    touches.forEach(t => {
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        
        const gradient = ctx.createRadialGradient(x, y, 5, x, y, 40);
        gradient.addColorStop(0, "rgba(245, 158, 11, 0.5)");
        gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`ID:${t.identifier}`, x + 15, y - 10);
    });

  }, [touches]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64 flex flex-col relative overflow-hidden">
      <div className="absolute top-4 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
         <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <Hand size={20} className="text-amber-500" /> Touch & Haptics
         </h2>
         {touches.length > 0 && (
            <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
               {touches.length} Finger{touches.length > 1 ? 's' : ''}
            </div>
         )}
      </div>
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full touch-none cursor-crosshair bg-slate-50/50 rounded-2xl"
      />
      
      <div className="absolute bottom-4 left-0 w-full flex justify-center z-20">
         <button 
           onClick={testMobileHaptics}
           className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-700 flex items-center gap-2 transition-transform active:scale-95"
         >
            <Smartphone size={14} /> Test Device Vibrate
         </button>
      </div>
    </div>
  );
};

// 5. GAMEPAD VISUALIZER
const GamepadVisualizer = ({ gamepad, gamepadIndex }) => {
  const testRumble = () => {
    try {
        const gp = navigator.getGamepads()[gamepadIndex];
        if (gp && gp.vibrationActuator) {
            gp.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: 400,
                weakMagnitude: 1.0,
                strongMagnitude: 1.0
            });
        } else {
            alert("Rumble not supported by this browser/controller combo.");
        }
    } catch(e) {
        console.warn(e);
    }
  };

  const Button = ({ idx, label, className }) => {
     const pressed = gamepad?.buttons[idx]?.pressed;
     return (
        <div className={`
           flex items-center justify-center border font-bold transition-all duration-75
           ${pressed ? 'bg-pink-500 border-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] z-10 scale-110' : 'bg-slate-100 border-slate-300 text-slate-400'}
           ${className}
        `}>
           {label}
        </div>
     );
  };
  
  const Analog = ({ x = 0, y = 0 }) => (
     <div className="w-16 h-16 bg-slate-100 rounded-full relative border-2 border-slate-200 shadow-inner">
         <div 
           className="w-8 h-8 bg-slate-700 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md transition-transform duration-75"
           style={{ transform: `translate(calc(-50% + ${x * 20}px), calc(-50% + ${y * 20}px))` }}
         >
           {(Math.abs(x) > 0.1 || Math.abs(y) > 0.1) && <div className="absolute inset-0 bg-pink-500 rounded-full opacity-60 animate-ping"></div>}
         </div>
     </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64 flex flex-col relative">
       <div className="w-full flex justify-between items-center mb-4 z-10">
        <h2 className="font-bold flex items-center gap-2 text-slate-700"><Gamepad2 size={20} className="text-pink-500" /> Gamepad Controller</h2>
        <div className="flex items-center gap-2">
            {gamepad && (
                <button onClick={testRumble} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition-colors" title="Test Rumble">
                    <Vibrate size={14} />
                </button>
            )}
            <div className={`px-2 py-1 rounded text-[10px] font-bold ${gamepad ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                {gamepad ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
        </div>
      </div>

      {!gamepad ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3">
             <Gamepad2 size={48} strokeWidth={1} />
             <p className="text-sm font-medium">Press any button to connect</p>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 relative">
              <div className="absolute -top-3 text-[10px] text-slate-400 font-mono truncate w-full text-center px-4">{gamepad.id}</div>
              
              <div className="flex gap-8 items-center mt-4">
                 <div className="flex flex-col gap-2 items-center">
                    <div className="flex gap-1 mb-1">
                        <Button idx={4} label="LB" className="w-10 h-5 rounded-t-lg text-[9px]" />
                        <Button idx={6} label="LT" className="w-10 h-5 rounded-t-lg text-[9px]" />
                    </div>
                    <Analog x={gamepad.axes[0]} y={gamepad.axes[1]} />
                    <div className="grid grid-cols-3 gap-1 mt-2">
                       <div />
                       <Button idx={12} label="↑" className="w-6 h-6 rounded text-[10px]" />
                       <div />
                       <Button idx={14} label="←" className="w-6 h-6 rounded text-[10px]" />
                       <Button idx={13} label="↓" className="w-6 h-6 rounded text-[10px]" />
                       <Button idx={15} label="→" className="w-6 h-6 rounded text-[10px]" />
                    </div>
                 </div>

                 <div className="flex gap-3 self-start mt-4">
                    <Button idx={8} label="SEL" className="w-8 h-3 rounded-full text-[7px]" />
                    <Button idx={9} label="STA" className="w-8 h-3 rounded-full text-[7px]" />
                 </div>

                 <div className="flex flex-col gap-2 items-center">
                    <div className="flex gap-1 mb-1">
                        <Button idx={7} label="RT" className="w-10 h-5 rounded-t-lg text-[9px]" />
                        <Button idx={5} label="RB" className="w-10 h-5 rounded-t-lg text-[9px]" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 mb-2 relative h-16 w-16">
                       <Button idx={3} label="Y" className="w-6 h-6 rounded-full text-[10px] absolute top-0 left-1/2 -translate-x-1/2" />
                       <Button idx={2} label="X" className="w-6 h-6 rounded-full text-[10px] absolute top-1/2 left-0 -translate-y-1/2" />
                       <Button idx={1} label="B" className="w-6 h-6 rounded-full text-[10px] absolute top-1/2 right-0 -translate-y-1/2" />
                       <Button idx={0} label="A" className="w-6 h-6 rounded-full text-[10px] absolute bottom-0 left-1/2 -translate-x-1/2" />
                    </div>
                    <Analog x={gamepad.axes[2]} y={gamepad.axes[3]} />
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};


// MAIN APP ROOT
export default function App() {
  // Pointer State
  const [pointerData, setPointerData] = useState({
     type: 'mouse', x: 0, y: 0, pressure: 0, tiltX: 0, tiltY: 0,
     buttons: { left: false, right: false, middle: false }
  });
  const [scrollData, setScrollData] = useState({ x: 0, y: 0, z: 0 });
  const [pollingRate, setPollingRate] = useState(0);
  
  // Keyboard State
  const [activeKeys, setActiveKeys] = useState({});
  const [keyHistory, setKeyHistory] = useState([]);
  const [maxNkro, setMaxNkro] = useState(0);
  
  // Touch State
  const [touches, setTouches] = useState([]);
  
  // Gamepad State
  const [gamepad, setGamepad] = useState(null);
  const [gamepadIndex, setGamepadIndex] = useState(null);
  
  // Tracking Refs
  const mouseMoveCount = useRef(0);
  const gamepadReqRef = useRef(null);

  // --- Pointer Logic (Mouse, Stylus, Touch-click) ---
  const handlePointer = useCallback((e, isDown) => {
    if (e.type === 'pointermove' && e.pointerType === 'touch') return; // Handled by Touch API

    const map = { 0: 'left', 1: 'middle', 2: 'right', 5: 'pen_eraser' };
    
    setPointerData(prev => {
        const newButtons = { ...prev.buttons };
        if (e.type === 'pointerdown' || e.type === 'pointerup') {
            newButtons[map[e.button]] = isDown;
        }

        return {
            type: e.pointerType || 'mouse',
            x: e.clientX,
            y: e.clientY,
            pressure: e.buttons > 0 ? (e.pressure || 0.5) : 0,
            tiltX: e.tiltX || 0,
            tiltY: e.tiltY || 0,
            buttons: newButtons
        };
    });

    if (e.type === 'pointermove') mouseMoveCount.current += 1;
  }, []);

  const handlePointerDown = (e) => handlePointer(e, true);
  const handlePointerUp = (e) => handlePointer(e, false);
  const handlePointerMove = (e) => handlePointer(e, false);
  
  const scrollTimeout = useRef(null);
  const handleWheel = useCallback((e) => {
     setScrollData({ x: e.deltaX, y: e.deltaY, z: e.deltaZ });
     if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
     scrollTimeout.current = setTimeout(() => setScrollData({x:0, y:0, z:0}), 150);
  }, []);

  useEffect(() => {
     const interval = setInterval(() => {
        setPollingRate(mouseMoveCount.current);
        mouseMoveCount.current = 0;
     }, 1000);
     return () => clearInterval(interval);
  }, []);


  // --- Keyboard Logic ---
  const handleKeyDown = useCallback((e) => {
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    if(e.repeat) return; 
    
    setActiveKeys(p => {
       const next = { ...p, [e.code]: { key: e.key, start: performance.now() } };
       setMaxNkro(max => Math.max(max, Object.keys(next).length));
       return next;
    });
  }, []);

  const handleKeyUp = useCallback((e) => {
    setActiveKeys(p => {
       const item = p[e.code];
       if(item) {
          setKeyHistory(h => [{ key: item.key, code: e.code, duration: performance.now() - item.start, id: Date.now() }, ...h].slice(0, 6));
       }
       const n = {...p}; delete n[e.code]; return n;
    });
  }, []);


  // --- Touch Logic ---
  const handleTouch = useCallback((e) => {
    setTouches(Array.from(e.touches));
  }, []);
  

  // --- Gamepad Logic ---
  useEffect(() => {
    const scan = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const gpIndex = gps.findIndex(g => g !== null);
      const gp = gps[gpIndex];
      
      if (gp) {
        setGamepad({ axes: [...gp.axes], buttons: gp.buttons.map(b => ({ pressed: b.pressed, value: b.value })), id: gp.id });
        setGamepadIndex(gpIndex);
      } else {
        setGamepad(null);
        setGamepadIndex(null);
      }
      gamepadReqRef.current = requestAnimationFrame(scan);
    };

    window.addEventListener("gamepadconnected", scan);
    window.addEventListener("gamepaddisconnected", scan);
    gamepadReqRef.current = requestAnimationFrame(scan);

    return () => {
        window.removeEventListener("gamepadconnected", scan);
        window.removeEventListener("gamepaddisconnected", scan);
        cancelAnimationFrame(gamepadReqRef.current);
    }
  }, []);


  // --- Attach Window Listeners ---
  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const preventContext = (e) => e.preventDefault();
    window.addEventListener('contextmenu', preventContext);

    return () => {
       window.removeEventListener('pointerdown', handlePointerDown);
       window.removeEventListener('pointerup', handlePointerUp);
       window.removeEventListener('pointermove', handlePointerMove);
       window.removeEventListener('wheel', handleWheel);
       window.removeEventListener('keydown', handleKeyDown);
       window.removeEventListener('keyup', handleKeyUp);
       window.removeEventListener('contextmenu', preventContext);
    };
  }, [handlePointerDown, handlePointerUp, handlePointerMove, handleWheel, handleKeyDown, handleKeyUp]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8" 
         onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouch} onTouchCancel={handleTouch}>
      
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
         <div>
             <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-900/20">
                   <Zap size={24} /> 
                </div>
                Peripheral Tester
             </h1>
             <p className="text-slate-500 font-medium text-sm mt-1 ml-1">Test keyboards, mice, styluses, gamepads, touch, and haptics.</p>
         </div>
         <button 
           onClick={() => { setKeyHistory([]); setMaxNkro(0); }}
           className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow">
           <RotateCcw size={16} /> RESET DIAGNOSTICS
         </button>
      </header>

      <main className="max-w-5xl mx-auto">
        
        {/* Live Active Inputs Monitor */}
        <LiveInputsBanner activeKeys={activeKeys} pointerData={pointerData} gamepad={gamepad} />

        {/* Row 1: Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div className="h-80">
              <PointerVisualizer pointerData={pointerData} scrollData={scrollData} pollingRate={pollingRate} />
           </div>
           <div className="h-80">
              <KeyboardVisualizer activeKeys={activeKeys} history={keyHistory} maxNkro={maxNkro} />
           </div>
        </div>

        {/* Row 2: Touch & Gamepad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <TouchVisualizer touches={touches} />
           <GamepadVisualizer gamepad={gamepad} gamepadIndex={gamepadIndex} />
        </div>

      </main>

      <div className="max-w-5xl mx-auto mt-10 text-center text-xs font-medium text-slate-400 pb-10">
         Note: Haptic API support depends on browser permissions and device hardware. 
      </div>
    </div>
  );
}