import React, { useState, useRef, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { ToothSelectionMap } from './components/ToothSelectionMap.tsx';
import { editDentalImage } from './services/geminiService.ts';
import { Product, CartItem, ViewState, GenerationState, ColorAdjustment, MaterialAdjustment } from './types.ts';
import { ShoppingCart, ArrowLeft, Download, Trash2, ZoomIn, ZoomOut, RotateCcw, Sparkles, Camera, Sliders, Layers, CheckCircle, Eye, EyeOff, Target, Key, AlertCircle, LayoutDashboard, Settings } from 'lucide-react';

const STORAGE_KEY = 'dental_health_beauty_session_v3';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    process: any;
  }
}

if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

const App: React.FC = () => {
  const loadSession = () => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to load session', error);
      return null;
    }
  };

  const savedSession = loadSession();

  const [view, setView] = useState<ViewState>(savedSession?.view || 'landing');
  const [cart, setCart] = useState<CartItem[]>(savedSession?.cart || []);
  const [showCart, setShowCart] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'visualize' | 'controls'>('visualize');
  
  const [genState, setGenState] = useState<GenerationState>(() => {
    if (savedSession?.genState) {
      return { ...savedSession.genState, isGenerating: false, error: null };
    }
    return { isGenerating: false, error: null, originalImage: null, generatedImage: null };
  });

  const [showOriginal, setShowOriginal] = useState(false);
  const [promptInput, setPromptInput] = useState(savedSession?.promptInput || "");
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>(savedSession?.selectedTeeth || []);
  const [colorAdjustment, setColorAdjustment] = useState<ColorAdjustment>(savedSession?.colorAdjustment || { hue: 0, saturation: 0 });
  const [materialAdjustment, setMaterialAdjustment] = useState<MaterialAdjustment>(savedSession?.materialAdjustment || { reflectivity: 0.6, texture: 'enamel with subtle perikymata' });
  const [transform, setTransform] = useState(savedSession?.transform || { x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectionFlash, setSelectionFlash] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const prevSelectedCount = useRef(selectedTeeth.length);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      } catch (e) {
        console.warn("AIStudio bridge not available.");
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (selectedTeeth.length !== prevSelectedCount.current) {
      setSelectionFlash(true);
      const timer = setTimeout(() => setSelectionFlash(false), 800);
      prevSelectedCount.current = selectedTeeth.length;
      return () => clearTimeout(timer);
    }
  }, [selectedTeeth]);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        const sessionData = { view, cart, genState, promptInput, transform, selectedTeeth, colorAdjustment, materialAdjustment };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.warn('Failed to save session:', e);
      }
    }, 500);
    return () => clearTimeout(saveTimeout);
  }, [view, cart, genState, promptInput, transform, selectedTeeth, colorAdjustment, materialAdjustment]);

  const handleOpenKeySelector = async () => {
    await window.aistudio.openSelectKey();
    setIsKeySelected(true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (view !== 'editor') return;
    e.stopPropagation(); 
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(1, transform.scale + scaleAmount), 4);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => setIsDragging(false);
  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.5, 4) }));
  const zoomOut = () => setTransform(prev => {
    const newScale = Math.max(1, prev.scale - 0.5);
    return { ...prev, scale: newScale, x: newScale === 1 ? 0 : prev.x, y: newScale === 1 ? 0 : prev.y };
  });
  const resetZoom = () => setTransform({ x: 0, y: 0, scale: 1 });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const handleCapture = (image: string) => {
    setGenState(prev => ({ ...prev, originalImage: image, generatedImage: null, error: null }));
    setShowOriginal(false);
    setTransform({ x: 0, y: 0, scale: 1 });
    setView('editor');
    setActiveTab('visualize');
  };

  const handleGenerate = async (promptOverride?: string) => {
    const promptToUse = promptOverride || promptInput;
    if (!promptToUse || !genState.originalImage) return;
    
    setGenState(prev => ({ ...prev, isGenerating: true, error: null }));
    try {
      const newImage = await editDentalImage(genState.originalImage, promptToUse, selectedTeeth, colorAdjustment, materialAdjustment);
      setGenState(prev => ({ ...prev, generatedImage: newImage, isGenerating: false }));
      setShowOriginal(false);
      setActiveTab('visualize');
    } catch (err: any) {
      if (err.message === "API_KEY_EXPIRED") {
        setIsKeySelected(false);
        setGenState(prev => ({ ...prev, isGenerating: false, error: "Clinical Key expired." }));
      } else {
        setGenState(prev => ({ ...prev, isGenerating: false, error: err.message || "Visualization failed." }));
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    setPromptInput(product.aiPrompt);
    if (product.materialProperties) {
        setMaterialAdjustment({ reflectivity: product.materialProperties.reflectivity, texture: product.materialProperties.texture });
    }
    handleGenerate(product.aiPrompt);
  };

  const handleToggleTooth = (id: number) => setSelectedTeeth(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const getToothCoords = (id: number) => {
    if (id <= 16) {
      const offset = id - 8.5; 
      return { x: offset * 8, y: -5 + (Math.abs(offset) * 1.5) };
    }
    const offset = (32 - id + 1) - 8.5;
    return { x: offset * 8, y: 15 - (Math.abs(offset) * 1.5) };
  };

  const KeySelectionView = () => (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-12 w-full h-full max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6 p-6 bg-slate-800 rounded-2xl shadow-xl">
        <Key className="w-10 h-10 text-amber-500" />
      </div>
      <h2 className="text-2xl md:text-5xl font-serif text-slate-900 mb-4 tracking-tight">Clinical Authentication</h2>
      <p className="text-slate-500 mb-6 text-sm font-light">Authorize a secure API key to proceed to the studio.</p>
      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl mb-8 text-left">
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Ensure billing is enabled in Google Cloud Console for high-fidelity generation. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold">Billing Documentation</a>.
        </p>
      </div>
      <button 
        onClick={handleOpenKeySelector}
        className="px-12 py-4 bg-slate-800 text-white text-[11px] font-bold tracking-widest uppercase hover:bg-slate-700 transition-all shadow-lg active:scale-95 rounded-lg"
      >
        Select API Key
      </button>
    </div>
  );

  const LandingView = () => (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4 py-8 w-full h-full max-w-4xl mx-auto overflow-y-auto">
      <div className="mb-10 p-8 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-pulse-slow">
        <Sparkles className="w-16 h-16 md:w-24 text-amber-500/80" strokeWidth={0.5} />
      </div>
      <h1 className="text-5xl md:text-9xl font-serif text-slate-900 mb-4 tracking-tighter leading-none">
        PRO <span className="italic font-light text-slate-400">DENTAL</span>
      </h1>
      <div className="w-12 h-0.5 bg-amber-500/30 mb-8 mx-auto"></div>
      <p className="text-lg md:text-2xl text-slate-400 mb-12 font-light italic tracking-tight">
        Precision treatment visualization for the modern practice.
      </p>
      <button 
        onClick={() => setView('camera')}
        className="w-full md:w-auto px-16 py-5 bg-slate-800 text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-slate-700 transition-all shadow-xl active:scale-95 rounded-full"
      >
        Begin Studio Session
      </button>
    </div>
  );

  const EditorView = () => {
    const currentImage = (showOriginal || !genState.generatedImage) ? genState.originalImage : genState.generatedImage;

    return (
      <div className="flex flex-col lg:flex-row h-full w-full max-w-[1700px] mx-auto overflow-hidden bg-slate-50/50 lg:p-6 lg:gap-6">
        <div className="lg:hidden flex bg-white border-b border-slate-100 shrink-0">
           <button 
             onClick={() => setActiveTab('visualize')}
             className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'visualize' ? 'border-amber-500 text-amber-700 bg-amber-50/20' : 'border-transparent text-slate-400'}`}
           >
             <LayoutDashboard className="w-4 h-4" /> Studio
           </button>
           <button 
             onClick={() => setActiveTab('controls')}
             className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'controls' ? 'border-amber-500 text-amber-700 bg-amber-50/20' : 'border-transparent text-slate-400'}`}
           >
             <Settings className="w-4 h-4" /> Parameters
           </button>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'visualize' ? 'flex' : 'hidden lg:flex'}`}>
          <div 
            className={`relative flex-1 bg-slate-100 overflow-hidden shadow-inner lg:shadow-xl border-x-0 lg:border-[1px] border-slate-200 select-none rounded-none lg:rounded-2xl min-h-[300px] w-full ${selectionFlash ? 'shimmer-effect' : ''}`}
            ref={imageContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {genState.isGenerating && (
              <div className="absolute inset-0 z-30 bg-slate-50/80 backdrop-blur-md flex flex-col items-center justify-center text-slate-800 p-6 text-center">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse font-serif text-lg text-slate-500 uppercase tracking-widest">Simulating Morphology...</p>
              </div>
            )}
            
            <div className="w-full h-full flex items-center justify-center transition-transform duration-75 origin-center" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, cursor: isDragging ? 'grabbing' : transform.scale > 1 ? 'grab' : 'default' }}>
              <img src={currentImage || ''} alt="Preview" className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl" />
              
              {!genState.isGenerating && selectedTeeth.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-10">
                   <div className="relative w-full h-full">
                     {selectedTeeth.map(id => {
                       const coords = getToothCoords(id);
                       return (
                         <div 
                           key={`pip-${id}`} 
                           className="absolute w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] opacity-80"
                           style={{ left: `calc(50% + ${coords.x}%)`, top: `calc(55% + ${coords.y}%)`, transform: 'translate(-50%, -50%)' }}
                         >
                            <div className="absolute inset-0 bg-amber-500 rounded-full selection-ping"></div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              )}
            </div>

            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-white/90 backdrop-blur-sm p-1.5 shadow-lg rounded-xl border border-slate-100">
               <button onClick={zoomIn} className="p-2.5 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg"><ZoomIn className="w-4 h-4" /></button>
               <button onClick={zoomOut} className="p-2.5 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg"><ZoomOut className="w-4 h-4" /></button>
               <button onClick={resetZoom} className="p-2.5 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg"><RotateCcw className="w-4 h-4" /></button>
            </div>
            
            {genState.generatedImage && (
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4">
                <button 
                  onClick={() => setShowOriginal(!showOriginal)} 
                  className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl rounded-full border border-slate-100 flex items-center gap-2 ${showOriginal ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 backdrop-blur-md'}`}
                >
                  {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showOriginal ? 'View Simulation' : 'Show Original'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 lg:p-8 border-t border-slate-100 lg:border-t-0 lg:mt-6 shadow-sm rounded-none lg:rounded-2xl shrink-0">
             <div className="flex flex-col sm:flex-row gap-4">
               <input 
                  type="text" 
                  value={promptInput} 
                  onChange={(e) => setPromptInput(e.target.value)} 
                  placeholder="Describe treatment (e.g. 'Add zirconia veneers')..." 
                  className="flex-1 px-4 py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500/20 outline-none text-lg font-serif text-slate-700 placeholder:text-slate-300 transition-all"
                />
               <button 
                  onClick={() => handleGenerate()} 
                  disabled={genState.isGenerating || !promptInput} 
                  className="px-10 py-4 bg-slate-800 text-white text-[11px] font-bold tracking-widest uppercase hover:bg-slate-700 transition-all disabled:opacity-20 shadow-lg rounded-xl"
                >
                  Apply Simulation
                </button>
             </div>
          </div>
        </div>

        <div className={`lg:w-[400px] shrink-0 flex flex-col bg-white border-l border-slate-100 shadow-sm overflow-hidden rounded-none lg:rounded-2xl ${activeTab === 'controls' ? 'flex flex-1' : 'hidden lg:flex'}`}>
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
             <div><h2 className="text-base font-serif text-slate-900">Clinical Map</h2><p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Patient Parameters</p></div>
             <button onClick={() => setView('camera')} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100 transition-colors">Retake Photo</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="p-6 space-y-6">
               <ToothSelectionMap selectedTeeth={selectedTeeth} onToggleTooth={handleToggleTooth} />
               
               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Chromatic Shading</h3>
                 <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[8px] uppercase font-black text-slate-400 mb-2"><span>Cool Value</span><span>Warm Value</span></div>
                      <input type="range" min="-50" max="50" value={colorAdjustment.hue} onChange={(e) => setColorAdjustment(prev => ({...prev, hue: parseInt(e.target.value)}))} className="w-full h-1.5 bg-slate-200 appearance-none rounded-full accent-slate-800" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] uppercase font-black text-slate-400 mb-2"><span>Translucent</span><span>Opaque</span></div>
                      <input type="range" min="-50" max="50" value={colorAdjustment.saturation} onChange={(e) => setColorAdjustment(prev => ({...prev, saturation: parseInt(e.target.value)}))} className="w-full h-1.5 bg-slate-200 appearance-none rounded-full accent-slate-800" />
                    </div>
                 </div>
               </div>

               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Surface Topology</h3>
                  <div className="space-y-6">
                     <select value={materialAdjustment.texture} onChange={(e) => setMaterialAdjustment(prev => ({...prev, texture: e.target.value}))} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[11px] uppercase font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all">
                        <option value="enamel with subtle perikymata">Micro-Textured Enamel</option>
                        <option value="porcelain">High-Luster Porcelain</option>
                        <option value="zirconia">Full-Contour Zirconia</option>
                        <option value="smooth ceramic">Pressed Ceramic</option>
                        <option value="fine brushed gold">Clinical Grade Gold</option>
                     </select>
                     <div>
                        <div className="flex justify-between text-[8px] uppercase font-black text-slate-400 mb-2"><span>Matte Finish</span><span>High Gloss</span></div>
                        <input type="range" min="0" max="1" step="0.1" value={materialAdjustment.reflectivity} onChange={(e) => setMaterialAdjustment(prev => ({...prev, reflectivity: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-200 appearance-none rounded-full accent-slate-800" />
                     </div>
                  </div>
               </div>
            </div>
            <ProductCatalog onSelect={handleProductSelect} onAddToCart={addToCart} />
          </div>
        </div>
      </div>
    );
  };

  const CartDrawer = () => (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 z-50 flex flex-col ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 flex items-center justify-center text-amber-500 rounded-2xl shadow-lg"><CheckCircle className="w-6 h-6" /></div>
          <div><h2 className="text-2xl font-serif text-slate-900">Treatment Plan</h2><p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-0.5">Clinical Proposal</p></div>
        </div>
        <button onClick={() => setShowCart(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><ArrowLeft className="w-8 h-8 rotate-180" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
        {cart.length === 0 ? (
          <div className="text-center text-slate-300 mt-20 flex flex-col items-center opacity-40">
            <ShoppingCart className="w-16 h-16 mb-6 stroke-1" />
            <p className="font-serif italic text-xl">No treatments added to proposal yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {cart.map(item => (
              <div key={item.id} className="flex gap-6 items-start border-b border-slate-50 pb-8 group">
                <div className="flex-1"><h3 className="font-serif text-xl text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">{item.name}</h3><p className="text-slate-400 text-xs mt-2 italic">{item.description}</p><p className="text-slate-800 font-bold mt-3 text-sm tracking-tight">${item.price.toLocaleString()}</p></div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-rose-400 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-8 md:p-12 bg-slate-800 text-white shrink-0">
        <div className="flex justify-between items-center mb-8"><span className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">Estimated Total</span><span className="text-4xl font-serif text-white">${total.toLocaleString()}</span></div>
        <button className="w-full py-6 bg-white text-slate-900 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-amber-500 hover:text-white transition-all shadow-2xl rounded-2xl active:scale-95">Finalize Consultation</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-luxury flex flex-col font-sans text-slate-700 overflow-hidden">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 shrink-0 h-20 sm:h-24 flex items-center">
        <div className="max-w-[1700px] mx-auto px-6 sm:px-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800 flex items-center justify-center shadow-lg rounded-2xl group-hover:scale-105 transition-transform"><span className="text-amber-500 font-serif text-2xl italic">P</span></div>
            <div className="flex flex-col">
              <span className="font-serif text-slate-900 text-lg sm:text-xl tracking-tight leading-none">PRO DENTAL</span>
              <span className="text-[9px] text-amber-600/70 tracking-[0.3em] uppercase font-bold mt-1">Clinical Visualization Suite</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={handleOpenKeySelector} className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
              <Key className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={() => setShowCart(true)} className="relative p-3 text-slate-900 hover:text-amber-600 transition-colors group">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 stroke-1" />
              {cart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white">{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden w-full h-full">
        {!isKeySelected ? (
          <KeySelectionView />
        ) : (
          <>
            {view === 'landing' && <LandingView />}
            {view === 'camera' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <button onClick={() => setView('landing')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] text-[10px] font-black z-30 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-sm transition-all"><ArrowLeft className="w-4 h-4" /> Exit Session</button>
                <CameraCapture onCapture={handleCapture} />
              </div>
            )}
            {view === 'editor' && <EditorView />}
          </>
        )}
      </main>
      {showCart && (<div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowCart(false)} />)}
      <CartDrawer />
    </div>
  );
};

export default App;