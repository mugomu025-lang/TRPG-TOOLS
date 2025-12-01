
import React, { useState, useRef, useMemo } from 'react';
import { MapLocation, MapStyle } from '../types';
import { MapPin, X, User, Trash2, RefreshCw, Upload, Move, PlusCircle, ZoomIn, ZoomOut, Hand } from 'lucide-react';

interface MapViewProps {
  locations: MapLocation[];
  onChange: (locations: MapLocation[]) => void;
  onSelectLocation: (loc: MapLocation | null) => void;
  selectedLocationId: string | null;
  onAutoGenerate: () => void;
  mapSeed?: number;
  onUpdateSeed: (seed: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ locations, onChange, onSelectLocation, selectedLocationId, onAutoGenerate, mapSeed, onUpdateSeed }) => {
  const [mode, setMode] = useState<'add' | 'move' | 'pan'>('add');
  const [mapStyle, setMapStyle] = useState<MapStyle>(MapStyle.VINTAGE);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragItem, setDragItem] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const generatedTerrain = useMemo(() => {
    if (!mapSeed) return null;
    
    let seed = mapSeed;
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const elements = [];
    
    // Config based on style
    const blockColor = mapStyle === MapStyle.BLUEPRINT ? 'none' : '#dcd8cc';
    const strokeColor = mapStyle === MapStyle.BLUEPRINT ? 'rgba(255,255,255,0.4)' : '#b0aba0';
    const riverStroke = mapStyle === MapStyle.BLUEPRINT ? "rgba(255,255,255,0.2)" : "#a2c2cf";

    // 1. River - More organic path
    const riverPoints = [];
    let ry = random() * 100;
    for(let x=0; x<=100; x+=2) {
        ry += (random() - 0.5) * 5; 
        riverPoints.push(`${x},${Math.max(0, Math.min(100, ry))}`);
    }
    
    elements.push(
        <polyline 
            key="river" 
            points={riverPoints.join(' ')} 
            fill="none" 
            stroke={riverStroke} 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
    if (mapStyle !== MapStyle.BLUEPRINT) {
        elements.push(
            <polyline 
                key="river-bank" 
                points={riverPoints.join(' ')} 
                fill="none" 
                stroke="#8a9a9e" 
                strokeWidth="5" 
                strokeOpacity="0.3"
                strokeLinecap="round"
            />
        );
    }

    // 2. Roads (Irregular Grid)
    const numRoads = 10;
    for(let i=0; i<numRoads; i++) {
        const p = random() * 100;
        // Horizontal
        elements.push(
            <line key={`rh-${i}`} x1="0" y1={p} x2="100" y2={p + (random()-0.5)*10} stroke={strokeColor} strokeWidth={mapStyle === MapStyle.REALISTIC ? 0.8 : 0.5} opacity="0.6" />
        );
        // Vertical
        elements.push(
            <line key={`rv-${i}`} x1={p} y1="0" x2={p + (random()-0.5)*10} y2="100" stroke={strokeColor} strokeWidth={mapStyle === MapStyle.REALISTIC ? 0.8 : 0.5} opacity="0.6" />
        );
    }

    // 3. Buildings / Blocks
    const numBuildings = 30 + Math.floor(random() * 20);
    for(let i=0; i<numBuildings; i++) {
        const w = 2 + random() * 6;
        const h = 2 + random() * 6;
        const x = random() * (100 - w);
        const y = random() * (100 - h);
        const rotation = (random() - 0.5) * 20; // Slight rotation
        
        elements.push(
            <g key={`b-${i}`} transform={`rotate(${rotation} ${x+w/2} ${y+h/2})`}>
                <rect 
                    x={x} y={y} width={w} height={h} 
                    fill={blockColor}
                    stroke={strokeColor}
                    strokeWidth="0.2"
                />
                {mapStyle === MapStyle.REALISTIC && (
                    <path d={`M${x} ${y+h} L${x+w} ${y+h} L${x+w} ${y+h+0.5} L${x} ${y+h+0.5} Z`} fill="#a09b90" />
                )}
            </g>
        );
    }

    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
             <defs>
                <filter id="paper-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" />
                </filter>
            </defs>
            {elements}
            <rect width="100%" height="100%" filter="url(#paper-grain)" opacity="0.3" pointerEvents="none"/>
        </svg>
    );
  }, [mapSeed, mapStyle]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'pan') {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'pan' && isDragging) {
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
        return;
    }

    if (mode === 'move' && dragItem && mapRef.current) {
         const rect = mapRef.current.getBoundingClientRect();
         const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
         const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
         onChange(locations.map(l => l.id === dragItem ? { ...l, x, y } : l));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragItem(null);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) return;
      if (mode !== 'add') return;

      if (mapRef.current) {
          const rect = mapRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;

          const newLoc: MapLocation = {
              id: Date.now().toString(),
              x,
              y,
              name: '新地点',
              description: '',
              npcs: []
          };
          onChange([...locations, newLoc]);
          onSelectLocation(newLoc);
      }
  };

  const handlePinMouseDown = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onSelectLocation(locations.find(l => l.id === id) || null);
      if (mode === 'move') {
          setDragItem(id);
      }
  };

  const generateTerrainLayout = () => {
      onUpdateSeed(Math.floor(Math.random() * 10000));
  };

  const handleDelete = (id: string) => {
    onChange(locations.filter(l => l.id !== id));
    if (selectedLocationId === id) onSelectLocation(null);
  };

  const handleUpdate = (id: string, updates: Partial<MapLocation>) => {
    onChange(locations.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        handleUpdate(id, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const selectedLoc = locations.find(l => l.id === selectedLocationId);

  const getMapBackgroundColor = () => {
      switch(mapStyle) {
          case MapStyle.REALISTIC: return '#e3e6e3'; 
          case MapStyle.BLUEPRINT: return '#1e3a8a';
          case MapStyle.ISOMETRIC: return '#f0f0f0';
          case MapStyle.PIXEL: return '#7f8c8d';
          default: return '#f4f1ea';
      }
  };

  return (
    <div 
        className="flex h-full min-h-[600px] relative pb-32 overflow-hidden bg-charcoal/80" 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
    >
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
             <div className="flex bg-paper border border-ink p-1 shadow-lg pointer-events-auto rounded-sm">
                 <button onClick={() => setMode('add')} className={`p-2 transition-colors ${mode === 'add' ? 'bg-ink text-gold' : 'text-ink hover:bg-charcoal/10'}`} title="添加地点 (Add)"><PlusCircle className="w-5 h-5" /></button>
                 <div className="w-px bg-ink/20 mx-1"></div>
                 <button onClick={() => setMode('move')} className={`p-2 transition-colors ${mode === 'move' ? 'bg-ink text-gold' : 'text-ink hover:bg-charcoal/10'}`} title="移动地点 (Move Pin)"><Move className="w-5 h-5" /></button>
                 <div className="w-px bg-ink/20 mx-1"></div>
                 <button onClick={() => setMode('pan')} className={`p-2 transition-colors ${mode === 'pan' ? 'bg-ink text-gold' : 'text-ink hover:bg-charcoal/10'}`} title="拖拽地图 (Pan View)"><Hand className="w-5 h-5" /></button>
             </div>

             <div className="flex bg-paper border border-ink p-1 shadow-lg pointer-events-auto rounded-sm">
                 {Object.values(MapStyle).map(style => (
                     <button key={style} onClick={() => setMapStyle(style)} className={`px-3 py-2 text-[10px] uppercase font-mono font-bold transition-colors ${mapStyle === style ? 'bg-blood text-white' : 'text-ink hover:bg-charcoal/10'}`}>{style}</button>
                 ))}
             </div>

             <div className="flex bg-paper border border-ink p-1 shadow-lg pointer-events-auto rounded-sm">
                 <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 text-ink hover:bg-charcoal/10"><ZoomOut className="w-5 h-5" /></button>
                 <span className="px-2 flex items-center font-mono text-xs w-12 justify-center">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 text-ink hover:bg-charcoal/10"><ZoomIn className="w-5 h-5" /></button>
                 <div className="w-px bg-ink/20 mx-1"></div>
                 <button onClick={generateTerrainLayout} className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold text-ink hover:text-gold hover:bg-ink transition-colors"><RefreshCw className="w-3 h-3" /> 生成地形</button>
                 <button onClick={onAutoGenerate} className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-bold text-ink hover:text-gold hover:bg-ink transition-colors border-l border-ink/10"><RefreshCw className="w-3 h-3" /> 生成地点</button>
             </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex items-center justify-center cursor-default" onMouseDown={handleMouseDown}>
            <div 
                ref={mapRef}
                className={`relative shadow-2xl transition-transform duration-75 ease-linear`}
                style={{ 
                    width: '1000px', 
                    height: '800px', 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    cursor: mode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : (mode === 'add' ? 'crosshair' : 'default'),
                    backgroundColor: getMapBackgroundColor(),
                }}
                onClick={handleMapClick}
            >
                {generatedTerrain}
                
                {locations.map(loc => (
                    <div
                        key={loc.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 group z-10 ${selectedLocationId === loc.id ? 'z-20 scale-125' : 'hover:scale-110'}`}
                        style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                        onMouseDown={(e) => handlePinMouseDown(e, loc.id)}
                    >
                         {mapStyle === MapStyle.BLUEPRINT ? (
                            <div className={`w-4 h-4 border-2 border-white rounded-full ${selectedLocationId === loc.id ? 'bg-gold' : 'bg-transparent'}`}></div>
                         ) : mapStyle === MapStyle.PIXEL ? (
                            <div className="w-4 h-4 bg-red-500 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"></div>
                         ) : (
                            <>
                                <MapPin className={`w-8 h-8 drop-shadow-md ${selectedLocationId === loc.id ? 'text-blood fill-blood' : 'text-ink fill-ink/80'}`} />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-paper border border-ink px-2 py-0.5 text-[10px] font-mono whitespace-nowrap shadow-sm text-ink pointer-events-none">
                                    {loc.name}
                                </div>
                            </>
                         )}
                    </div>
                ))}
            </div>
        </div>

        {selectedLoc && (
            <div className="absolute right-4 top-20 bottom-36 w-80 bg-paper shadow-2xl border-l-4 border-gold p-6 overflow-y-auto flex flex-col z-40 animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-2">
                    <h3 className="font-display text-lg text-ink uppercase tracking-wider">地点详情</h3>
                    <button onClick={() => handleDelete(selectedLoc.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4 flex-1 text-ink">
                    <div className="w-full h-48 bg-charcoal/10 border border-dashed border-charcoal/30 flex items-center justify-center relative group overflow-hidden">
                        {selectedLoc.imageUrl ? (
                            <img src={selectedLoc.imageUrl} alt="Location" className="w-full h-full object-cover sepia-[.3]" />
                        ) : (
                            <div className="text-charcoal/40 text-xs text-center">
                                <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                上传地点概念图
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(selectedLoc.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                    </div>

                    <div>
                        <label className="text-xs font-mono text-gray-500 uppercase">地点名称</label>
                        <input value={selectedLoc.name} onChange={(e) => handleUpdate(selectedLoc.id, { name: e.target.value })} className="w-full font-serif text-xl border-b border-gray-300 focus:border-blood outline-none bg-transparent py-1 text-ink"/>
                    </div>
                    
                    <div>
                        <label className="text-xs font-mono text-gray-500 uppercase">描述与氛围</label>
                        <textarea value={selectedLoc.description} onChange={(e) => handleUpdate(selectedLoc.id, { description: e.target.value })} className="w-full h-40 font-serif text-sm border border-gray-200 focus:border-ink outline-none bg-charcoal/5 p-2 resize-none mt-1 text-ink" placeholder="环境描写、气味、光线..."/>
                    </div>

                    <div>
                        <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2"><User className="w-3 h-3" /> 相关 NPC</label>
                        <div className="mt-2 space-y-2">
                            {selectedLoc.npcs.map((npc, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input value={npc} onChange={(e) => { const newNpcs = [...selectedLoc.npcs]; newNpcs[idx] = e.target.value; handleUpdate(selectedLoc.id, { npcs: newNpcs }); }} className="flex-1 bg-paper border-b border-gray-300 text-sm p-1 font-mono text-ink"/>
                                    <button onClick={() => { const newNpcs = selectedLoc.npcs.filter((_, i) => i !== idx); handleUpdate(selectedLoc.id, { npcs: newNpcs }); }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button onClick={() => handleUpdate(selectedLoc.id, { npcs: [...selectedLoc.npcs, '神秘人'] })} className="text-xs text-gold hover:text-ink hover:underline font-mono">+ 添加 NPC</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MapView;
