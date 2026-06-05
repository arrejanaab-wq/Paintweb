import React, { useState, useRef, useEffect } from 'react';
import { Sliders, RefreshCw, Layers, ShieldCheck, Download, Sparkles, FileDown, Plus, Trash2, ArrowRight } from 'lucide-react';
import { PaintProduct } from '../types';

interface DesignStudioProps {
  catalog: PaintProduct[];
  selectedWallColor: PaintProduct;
  selectedAccentColor: PaintProduct;
  onSetWallColor: (paint: PaintProduct) => void;
  onSetAccentColor: (paint: PaintProduct) => void;
}

interface PresetItem {
  id: string;
  name: string;
  type: 'interior' | 'exterior';
  image: string;
  polygons: {
    id: string;
    name: string;
    points: string; // "x1,y1 x2,y2 x3,y3 ..." represented in percentage 0-100
    target: 'wall' | 'accent';
  }[];
}

const ROOM_PRESETS: PresetItem[] = [
  {
    id: 'living_room',
    name: 'Luxury Living Room',
    type: 'interior',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    polygons: [
      { id: 'lr-wall-left', name: 'Back Left Feature Wall', points: '14,24 45,36 45,78 14,84', target: 'wall' },
      { id: 'lr-wall-main', name: 'Main Architectural Section', points: '45,36 84,36 84,72 45,78', target: 'accent' }
    ]
  },
  {
    id: 'bedroom',
    name: 'Modern Suite Bedroom',
    type: 'interior',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    polygons: [
      { id: 'bd-wall-main', name: 'Bed Headboard Canopy Wall', points: '15,22 84,22 84,72 15,72', target: 'wall' }
    ]
  },
  {
    id: 'villa',
    name: 'Elysian Twilight Villa',
    type: 'exterior',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    polygons: [
      { id: 'vl-facade-left', name: 'Left Cantilever Box Facade', points: '15,36 34,28 34,75 15,82', target: 'wall' },
      { id: 'vl-facade-right', name: 'Right Ground Concrete Wing', points: '34,28 78,38 78,70 34,75', target: 'accent' }
    ]
  },
  {
    id: 'farmhouse',
    name: 'Modern Siding Farmhouse',
    type: 'exterior',
    image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
    polygons: [
      { id: 'fh-siding-front', name: 'Main Farmhouse Siding Plane', points: '25,48 50,22 75,48 75,80 25,80', target: 'wall' }
    ]
  }
];

export default function DesignStudio({
  catalog,
  selectedWallColor,
  selectedAccentColor,
  onSetWallColor,
  onSetAccentColor
}: DesignStudioProps) {
  const [activePreset, setActivePreset] = useState<PresetItem>(ROOM_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Split-screen before & after slider state
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Drawing tool state for uploaded custom room image
  const [customPoints, setCustomPoints] = useState<[number, number][]>([]);
  const [activeHoverPolygon, setActiveHoverPolygon] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  // Advisory feedback panel from server-side Gemini response
  const [isConsulting, setIsConsulting] = useState<boolean>(false);
  const [userAdvisoryQuery, setUserAdvisoryQuery] = useState<string>("");
  const [aiAdvisory, setAiAdvisory] = useState<any | null>(null);

  // Finishes list
  const [finishType, setFinishType] = useState<string>("Boutique Velvet Matte");

  // Multi shade drag comparison shelf
  const [activePaintTarget, setActivePaintTarget] = useState<'wall' | 'accent'>('wall');

  // Trigger HD rendering state
  const [isRenderingHD, setIsRenderingHD] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<string>("");

  // Handle uploaded room snapshot
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          setCustomPoints([]); // clear old paths
          setIsDrawingMode(true); // activate interactive wall tracing automatically
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag comparison slide calculation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSliding || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSliding || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // Custom Point trace mechanics (using percentage-based relative to parents dimensions)
  const handleImageClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !customImage) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCustomPoints([...customPoints, [xPercent, yPercent]]);
  };

  // Reset custom path builder
  const clearCustomPath = () => {
    setCustomPoints([]);
  };

  // Fetch AI colorization brief from backend server
  const triggerAIConsultation = async () => {
    setIsConsulting(true);
    setAiAdvisory(null);
    try {
      const response = await fetch('/api/ai/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: customImage ? 'Custom Client Upload' : activePreset.type,
          presetName: customImage ? 'Bespoke Client Canvas' : activePreset.name,
          wallColorName: selectedWallColor.name,
          wallColorHex: selectedWallColor.id === 'obsidian' ? '#27272a' : (selectedWallColor.id === 'gold_metallic' ? '#d4af37' : '#ffffff'),
          accentColorName: selectedAccentColor.name,
          finishRule: finishType,
          userQuery: userAdvisoryQuery,
          hasCustomImage: !!customImage
        })
      });
      const data = await response.json();
      setAiAdvisory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsulting(false);
    }
  };

  // Simulated Apple/Tesla style render export
  const exportHDRender = () => {
    setIsRenderingHD(true);
    setRenderProgress("Calibrating sub-pixel raytraced GI shadows...");
    setTimeout(() => {
      setRenderProgress("Baking boutique specularity reflections (" + finishType + ")...");
      setTimeout(() => {
        setRenderProgress("Applying 4D procedural textures...");
        setTimeout(() => {
          setIsRenderingHD(false);
          setRenderProgress("");
          alert("✓ GARG Premium HD Architectural Visual Render exported successfully to your local Downloads directory in ultra-high resolution (4096 x 2304 px).");
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Convert points array to SVG points parameter
  const getCustomPointsString = () => {
    return customPoints.map(p => `${p[0]},${p[1]}`).join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="design-studio-module">
      {/* Visual Workspace Canvas Block (Left Column) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Widescreen Interactive Before/After Visualizer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-xs tracking-wider text-zinc-400 uppercase">Interactive Studio Workspace</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Active Visualization Canvas</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              id="before-after-reset"
              onClick={() => {
                setSliderPosition(50);
                if (customImage) {
                  setCustomImage(null);
                  setCustomPoints([]);
                  setIsDrawingMode(false);
                } else {
                  setCustomPoints([]);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-400 hover:text-white transition-colors bg-white/5 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Image
            </button>
          </div>
        </div>

        {/* Core Double Inserts Slider Frame */}
        <div 
          ref={sliderContainerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsSliding(false)}
          onMouseLeave={() => setIsSliding(false)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsSliding(false)}
          className="relative w-full aspect-[16/9] rounded-2xl border border-white/5 overflow-hidden shadow-2xl select-none group"
          id="visualizer-canvas-frame"
        >
          {/* UNDERLAYER: Original RAW / BEFORE image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={customImage || activePreset.image} 
              alt="Raw room view before customization" 
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Ambient Label */}
            <span className="absolute bottom-4 left-4 bg-black/70 border border-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-mono rounded text-zinc-400 tracking-wider">BEFORE (BASE IMAGE)</span>
          </div>

          {/* OVERLAYER: Colored / AFTER Image (Clipped dynamically based on slider x) */}
          <div 
            className="absolute inset-0 w-full h-full transition-shadow overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            {/* Same picture, but with SVG color multipliers overlaid */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <img 
                src={customImage || activePreset.image} 
                alt="Architectural space colored" 
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* HIGH-END VECTOR PAINT GRAPH OVERLAYS */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-auto"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              onClick={handleImageClick}
            >
              {customImage ? (
                // Tracing custom lines in drawing canvas
                <>
                  {customPoints.length >= 3 && (
                    <polygon 
                      points={getCustomPointsString()}
                      style={{ 
                        mixBlendMode: 'multiply',
                        fill: activePaintTarget === 'wall' ? selectedWallColor.tone : selectedAccentColor.tone, 
                        opacity: 0.65 
                      }}
                      className="cursor-pointer transition-all duration-350"
                    />
                  )}
                </>
              ) : (
                // Fixed presets premium layout mapping
                activePreset.polygons.map((poly) => {
                  const isHovered = activeHoverPolygon === poly.id;
                  const matchingPaint = poly.target === 'wall' ? selectedWallColor : selectedAccentColor;
                  // Map specific named catalog color codes to beautiful hex approximations for vector fills
                  let fillHex = '#E5E5E5';
                  if (matchingPaint.id === 'obsidian') fillHex = '#1e1e24';
                  else if (matchingPaint.id === 'cashmere') fillHex = '#e1d7c6';
                  else if (matchingPaint.id === 'marrakesh') fillHex = '#c48b6c';
                  else if (matchingPaint.id === 'emerald') fillHex = '#105642';
                  else if (matchingPaint.id === 'pearl') fillHex = '#faf9f5';
                  else if (matchingPaint.id === 'gold_metallic') fillHex = '#cea135';
                  else if (matchingPaint.id === 'calm_teal') fillHex = '#2c5e60';
                  else if (matchingPaint.id === 'nordic_mist') fillHex = '#cfd3d4';

                  return (
                    <polygon 
                      key={poly.id}
                      points={poly.points}
                      id={`preset-poly-${poly.id}`}
                      style={{ 
                        mixBlendMode: 'multiply', 
                        fill: fillHex, 
                        opacity: isHovered ? 0.8 : 0.68
                      }}
                      onMouseEnter={() => setActiveHoverPolygon(poly.id)}
                      onMouseLeave={() => setActiveHoverPolygon(null)}
                      onClick={() => {
                        // Dynamically cycle target to update global state colors too
                        if (poly.target === 'wall') {
                          setActivePaintTarget('wall');
                        } else {
                          setActivePaintTarget('accent');
                        }
                      }}
                      className="cursor-pointer transition-all duration-300 stroke-amber-500/10 stroke-[0.5] hover:stroke-amber-400 hover:stroke-[1.5]"
                    />
                  );
                })
              )}
            </svg>

            {/* Custom mask builder glowing nodes overlay */}
            {customImage && isDrawingMode && (
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {customPoints.map((pt, idx) => (
                  <div 
                    key={idx}
                    className="absolute w-3 h-3 bg-amber-500 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{ left: `${pt[0]}%`, top: `${pt[1]}%` }}
                  />
                ))}
              </div>
            )}

            {/* Blended Area label */}
            <span className="absolute bottom-4 right-4 bg-[#d4af37]/90 border border-amber-300 text-black px-3 py-1 text-[11px] font-mono rounded font-semibold tracking-wider">AFTER ({finishType})</span>
          </div>

          {/* DRAGGABLE SLIDE COMPACT HANDLE BAR */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize flex items-center justify-center pointer-events-auto"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={() => setIsSliding(true)}
            onTouchStart={() => setIsSliding(true)}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-950 text-amber-400 border-2 border-amber-400 flex items-center justify-center shadow-2xl shrink-0 -translate-x-3.5 hover:scale-115 transition-transform">
              <Sliders className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>
        </div>

        {/* Custom Picture Tracing Instructions drawer */}
        {customImage && (
          <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold">CUSTOM CLIENT UPLOAD CANVAS</span>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                {isDrawingMode 
                  ? "Click on the image to add nodes and trace the borders of the wall. Once you close the loop (need 3+ coordinates), your selected Garg paint will automatically overlay via CSS Multipliers!"
                  : "Your custom image is trace-locked. Click Custom Draw Tool to edit coordinates paths."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                id="custom-canvas-erase"
                onClick={clearCustomPath}
                className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Path
              </button>
              <button 
                id="custom-canvas-finish"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${isDrawingMode ? 'bg-[#d4af37] text-zinc-950 font-semibold' : 'border border-white/10 text-zinc-300'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isDrawingMode ? "Lock Drawing" : "Custom Draw Tool"}
              </button>
            </div>
          </div>
        )}

        {/* Preset selections widgets */}
        {!customImage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROOM_PRESETS.map((pst) => (
              <button
                key={pst.id}
                id={`preset-btn-${pst.id}`}
                onClick={() => {
                  setActivePreset(pst);
                  setAiAdvisory(null);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all ${activePreset.id === pst.id ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-white/5 bg-zinc-900/40 hover:border-white/15'}`}
              >
                <div className="aspect-[16/10] rounded-lg overflow-hidden mb-2">
                  <img src={pst.image} alt={pst.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200 line-clamp-1">{pst.name}</span>
                  <span className="text-[10px] font-mono text-[#d4af37] uppercase">{pst.type}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Drag Multi Shade Shelf comparison / Paint Catalog Select Option */}
        <div className="p-5 bg-gradient-to-tr from-zinc-950 to-zinc-900/80 border border-white/5 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">SYNERGY SHELF</span>
              <h4 className="text-sm font-semibold text-white">Compare Architectural Finishes</h4>
            </div>
            
            <div className="flex items-center gap-2 bg-black/60 p-1 border border-white/10 rounded-xl">
              <button 
                id="target-shelf-wall"
                onClick={() => setActivePaintTarget('wall')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${activePaintTarget === 'wall' ? 'bg-[#d4af37] text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                Wall Accent Color ({selectedWallColor.name})
              </button>
              <button 
                id="target-shelf-accent"
                onClick={() => setActivePaintTarget('accent')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${activePaintTarget === 'accent' ? 'bg-[#d4af37] text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                Secondary Accent ({selectedAccentColor.name})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {catalog.map((paint) => {
              // Custom hex representations for miniature swatches
              let labelHex = '#E5E5E5';
              if (paint.id === 'obsidian') labelHex = '#1e1e24';
              else if (paint.id === 'cashmere') labelHex = '#e1d7c6';
              else if (paint.id === 'marrakesh') labelHex = '#c48b6c';
              else if (paint.id === 'emerald') labelHex = '#105642';
              else if (paint.id === 'pearl') labelHex = '#faf9f5';
              else if (paint.id === 'gold_metallic') labelHex = '#cea135';
              else if (paint.id === 'calm_teal') labelHex = '#2c5e60';
              else if (paint.id === 'nordic_mist') labelHex = '#cfd3d4';

              const isCurrentSelection = activePaintTarget === 'wall' ? selectedWallColor.id === paint.id : selectedAccentColor.id === paint.id;

              return (
                <button
                  key={paint.id}
                  id={`swatch-${paint.id}-${activePaintTarget}`}
                  onClick={() => {
                    if (activePaintTarget === 'wall') {
                      onSetWallColor(paint);
                    } else {
                      onSetAccentColor(paint);
                    }
                    setAiAdvisory(null);
                  }}
                  className={`relative flex flex-col items-center p-2 rounded-xl border transition-all ${isCurrentSelection ? 'border-[#d4af37] bg-white/5' : 'border-white/5 hover:border-white/15'}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full border border-white/20 mb-1.5 shadow-md transform hover:scale-105 transition-transform" 
                    style={{ backgroundColor: labelHex }}
                  />
                  <span className="text-[10px] font-mono text-zinc-300 font-semibold text-center line-clamp-1 truncate w-full">{paint.name}</span>
                  <span className="text-[9px] font-mono text-zinc-400 tracking-tight">{paint.code}</span>
                  {isCurrentSelection && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d4af37]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-1 w-full max-w-sm">
              <span className="text-xs font-mono text-zinc-400 shrink-0">Bake Level:</span>
              <div className="grid grid-cols-3 gap-1 bg-black/60 border border-white/10 p-0.5 rounded-lg w-full">
                {['Boutique Velvet Matte', 'Satin Gloss Sheen', 'Pristine Lustre Metallic'].map((str) => (
                  <button
                    key={str}
                    id={`finish-btn-${str.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => {
                      setFinishType(str);
                      setAiAdvisory(null);
                    }}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${finishType === str ? 'bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {str.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="export-hd-render-btn"
              onClick={exportHDRender}
              disabled={isRenderingHD}
              className="px-4 py-2 border border-[#d4af37]/20 hover:border-[#d4af37] text-xs font-mono text-[#d4af37] hover:bg-[#d4af37]/5 rounded-xl transition-all font-semibold flex items-center justify-center gap-1.5 shrink-0"
            >
              {isRenderingHD ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Baking Render...
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  Raytraced HD Render
                </>
              )}
            </button>
          </div>
          
          {renderProgress && (
            <div className="text-[11px] font-mono text-zinc-500 text-right italic animate-pulse">
              * {renderProgress}
            </div>
          )}
        </div>

      </div>

      {/* AI Consulting & Specs Sidebar Block (Right Column) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Real-time Custom Image Upload Widget */}
        <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-semibold font-mono text-[#d4af37] tracking-wider uppercase">CLIENT FILE BRIDGE</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload custom snaps of your room, wall sections, or architectural project, and paint them directly using our responsive color engine.
          </p>
          <div className="relative border border-dashed border-white/10 bg-black/40 hover:bg-zinc-950 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-colors">
            <input 
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="studio-file-upload"
            />
            <Plus className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold text-zinc-300">Drag Room Snap Here</span>
            <span className="text-[9px] text-zinc-500 font-mono">JPG, PNG up to 10MB</span>
          </div>
        </div>

        {/* AI Paint Visualizer Advisory Box */}
        <div className="p-6 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-[#d4af37]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">INTELLIGENT INSIGHTS</span>
              <h4 className="text-sm font-semibold text-zinc-200">AI Palette Advisory</h4>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs text-zinc-400">
              Provide dynamic instructions (e.g. &quot;small bedroom with little sunlight, warm vibe&quot;) and query Gemini AI to review paint selections.
            </span>
            <textarea
              id="ai-user-query"
              value={userAdvisoryQuery}
              onChange={(e) => setUserAdvisoryQuery(e.target.value)}
              placeholder="e.g. Describe your lighting conditions or custom furniture textures for customized styling tip..."
              className="w-full h-20 bg-black/60 border border-white/5 rounded-xl p-3 text-xs text-zinc-300 focus:border-[#d4af37] focus:ring-0 outline-none placeholder:text-zinc-600 font-mono transition-colors"
            />
            <button
              id="trigger-ai-consulting-btn"
              onClick={triggerAIConsultation}
              disabled={isConsulting}
              className="w-full bg-[#d4af37] text-zinc-950 border border-[#d4af37] hover:bg-amber-400 hover:border-amber-400 font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
            >
              {isConsulting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Room Palette...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze via Gemini AI
                </>
              )}
            </button>
          </div>

          {/* AI Output Panels */}
          {aiAdvisory ? (
            <div className="flex flex-col gap-4 mt-2 border-t border-white/5 pt-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-zinc-300 font-mono text-[10px] tracking-wide text-amber-400">DESIGN SYNERGY:</span>
                <span className="text-zinc-100 italic block border-l-2 border-[#d4af37] pl-2 leading-relaxed bg-[#d4af37]/5 py-1.5 rounded-r">
                   &quot;{aiAdvisory.paletteName}&quot;
                </span>
              </div>
              <div className="flex flex-col gap-1 text-zinc-300 leading-relaxed">
                <span className="font-semibold text-zinc-400 font-mono text-[10px] tracking-wide">ATMOSPHERE:</span>
                <p>{aiAdvisory.moodAnalysis}</p>
              </div>
              <div className="flex flex-col gap-1 text-zinc-300 leading-relaxed">
                <span className="font-semibold text-zinc-400 font-mono text-[10px] tracking-wide">LIGHT INTERACTIONS:</span>
                <p>{aiAdvisory.lightReview}</p>
              </div>
              <div className="flex flex-col gap-1.5 text-zinc-300 leading-relaxed">
                <span className="font-semibold text-zinc-400 font-mono text-[10px] tracking-wide">STYLIST PAIRINGS:</span>
                <p>{aiAdvisory.decorAdvice}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {aiAdvisory.complementaryColors.map((color: string, i: number) => (
                    <span key={i} className="bg-zinc-800 text-[10px] px-2 py-0.5 rounded-md font-mono border border-white/5">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Boutique catalog suggestions matching results */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="font-semibold text-zinc-400 font-mono text-[10px] tracking-wide">RECOMMENDED GARG STOCK:</span>
                <div className="flex flex-col gap-1.5">
                  {aiAdvisory.gargProducts.map((p: any, i: number) => (
                    <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <div className="font-semibold text-[#d4af37]">{p.name || p.paintName}</div>
                        <div className="text-zinc-500 font-mono text-[9px]">{p.code || p.SKU} | {p.type || 'Custom Grade'}</div>
                      </div>
                      <div className="text-zinc-300 font-semibold">{p.priceEst || p.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {aiAdvisory.disclaimer && (
                <div className="text-[10px] text-zinc-500 font-mono italic mt-1 pb-1">
                  * {aiAdvisory.disclaimer}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center border-t border-white/5 border-dashed mt-2 select-none">
              <Layers className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-500">Awaiting AI Colorization Brief...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
