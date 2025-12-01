import React, { useRef, useState, useEffect } from 'react';
import { ScenarioData, Character, Item, MapLocation, TimelineEvent } from '../types';
import { MapPin, User, FileText, Briefcase, HelpCircle, Move, Hand, Maximize, Minimize } from 'lucide-react';

interface ClueWallViewProps {
  scenario: ScenarioData;
  onChange: (updates: Partial<ScenarioData>) => void;
}

const ClueWallView: React.FC<ClueWallViewProps> = ({ scenario, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'move' | 'pan'>('move');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragItem, setDragItem] = useState<{ type: 'char' | 'loc' | 'item' | 'event', id: string } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Flatten all assets into a list of nodes for easier rendering
  const nodes = [
    ...scenario.characters.map(c => ({ type: 'char', id: c.id, x: c.boardX || 10, y: c.boardY || 10, label: c.name, img: c.imageUrl })),
    ...scenario.locations.map(l => ({ type: 'loc', id: l.id, x: l.x, y: l.y, label: l.name, img: l.imageUrl })),
    ...scenario.items.map(i => ({ type: 'item', id: i.id, x: i.boardX || 20, y: i.boardY || 20, label: i.name, img: i.imageUrl })),
    ...scenario.timeline.map(e => ({ type: 'event', id: e.id, x: e.boardX || 30, y: e.boardY || 30, label: e.title, img: e.imageUrl }))
  ];

  // Calculate links based on timeline event connections
  const links: { x1: number, y1: number, x2: number, y2: number }[] = [];
  
  scenario.timeline.forEach(event => {
      const eventNode = nodes.find(n => n.type === 'event' && n.id === event.id);
      if (!eventNode) return;

      if (event.linkedCharacterIds) {
          event.linkedCharacterIds.forEach(cid => {
              const charNode = nodes.find(n => n.type === 'char' && n.id === cid);
              if (charNode) links.push({ x1: eventNode.x, y1: eventNode.y, x2: charNode.x, y2: charNode.y });
          });
      }
      if (event.linkedLocationIds) {
          event.linkedLocationIds.forEach(lid => {
              const locNode = nodes.find(n => n.type === 'loc' && n.id === lid);
              if (locNode) links.push({ x1: eventNode.x, y1: eventNode.y, x2: locNode.x, y2: locNode.y });
          });
      }
      if (event.linkedItemIds) {
          event.linkedItemIds.forEach(iid => {
              const itemNode = nodes.find(n => n.type === 'item' && n.id === iid);
              if (itemNode) links.push({ x1: eventNode.x, y1: eventNode.y, x2: itemNode.x, y2: itemNode.y });
          });
      }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
      if (mode === 'pan') {
          setIsDragging(true);
          setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (mode === 'pan' && isDragging) {
          setPan({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y
          });
          return;
      }

      if (mode === 'move' && dragItem && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

          if (dragItem.type === 'char') {
              onChange({ characters: scenario.characters.map(c => c.id === dragItem.id ? { ...c, boardX: x, boardY: y } : c) });
          } else if (dragItem.type === 'item') {
              onChange({ items: scenario.items.map(i => i.id === dragItem.id ? { ...i, boardX: x, boardY: y } : i) });
          } else if (dragItem.type === 'event') {
              onChange({ timeline: scenario.timeline.map(e => e.id === dragItem.id ? { ...e, boardX: x, boardY: y } : e) });
          } else if (dragItem.type === 'loc') {
              // Sync with map view location
              onChange({ locations: scenario.locations.map(l => l.id === dragItem.id ? { ...l, x: x, y: y } : l) });
          }
      }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      setDragItem(null);
  };

  const getNodeIcon = (type: string) => {
      switch(type) {
          case 'char': return <User className="w-6 h-6" />;
          case 'loc': return <MapPin className="w-6 h-6" />;
          case 'item': return <Briefcase className="w-6 h-6" />;
          case 'event': return <FileText className="w-6 h-6" />;
          default: return <HelpCircle className="w-6 h-6" />;
      }
  };

  return (
    <div className={`h-full flex flex-col bg-[#1a1a1a] overflow-hidden relative ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        <div className="absolute top-4 right-4 z-50 flex gap-2">
             <div className="bg-paper p-1 border border-ink shadow-lg flex gap-1 rounded">
                 <button 
                    onClick={() => setMode('move')} 
                    className={`p-2 rounded ${mode === 'move' ? 'bg-ink text-gold' : 'text-ink hover:bg-gray-200'}`}
                    title="Move Items"
                 >
                     <Move className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setMode('pan')} 
                    className={`p-2 rounded ${mode === 'pan' ? 'bg-ink text-gold' : 'text-ink hover:bg-gray-200'}`}
                    title="Pan View"
                 >
                     <Hand className="w-4 h-4" />
                 </button>
             </div>

            <div className="bg-paper p-1 border border-ink shadow-lg flex gap-2 items-center px-2 rounded">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="px-2 font-bold hover:bg-gray-200">-</button>
                <span className="text-xs font-mono py-1 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="px-2 font-bold hover:bg-gray-200">+</button>
            </div>

            <button 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                className="bg-paper p-2 border border-ink shadow-lg rounded hover:bg-gold hover:text-ink text-ink transition-colors"
                title="Cinema Mode"
            >
                {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
        </div>

        <div 
            className="flex-1 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={handleMouseDown}
            style={{ cursor: mode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
            <div 
                ref={containerRef}
                className="absolute shadow-2xl origin-center"
                style={{ 
                    width: '1600px', 
                    height: '1200px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                    // Updated background to a city map plan style
                    backgroundColor: '#e3dac9',
                    backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
                        url("https://www.transparenttextures.com/patterns/cartographer.png")
                    `,
                    backgroundSize: '40px 40px, 40px 40px, auto'
                }}
            >
                {/* Decorative Map Elements (SVG Overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <line x1="0" y1="200" x2="1600" y2="250" stroke="#000" strokeWidth="2" />
                    <line x1="0" y1="600" x2="1600" y2="550" stroke="#000" strokeWidth="2" />
                    <line x1="400" y1="0" x2="450" y2="1200" stroke="#000" strokeWidth="2" />
                    <line x1="1200" y1="0" x2="1150" y2="1200" stroke="#000" strokeWidth="2" />
                    <circle cx="800" cy="600" r="100" stroke="#000" strokeWidth="2" fill="none" />
                </svg>

                {/* Connections (Red Strings) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {links.map((link, idx) => (
                        <line 
                            key={idx}
                            x1={`${link.x1}%`} y1={`${link.y1}%`}
                            x2={`${link.x2}%`} y2={`${link.y2}%`}
                            stroke="#d9534f"
                            strokeWidth="3"
                            opacity="0.8"
                            strokeLinecap="round"
                        />
                    ))}
                </svg>

                {/* Nodes */}
                {nodes.map((node, idx) => (
                    <div
                        key={`${node.type}-${node.id}`}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group ${mode === 'move' ? 'cursor-move' : ''}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onMouseDown={(e) => {
                            if (mode === 'move') {
                                e.stopPropagation(); // Prevent panning
                                setDragItem({ type: node.type as any, id: node.id });
                            }
                        }}
                    >
                        {/* Pin */}
                        <div className="w-4 h-4 rounded-full bg-red-700 border-2 border-black shadow-md absolute -top-2 left-1/2 transform -translate-x-1/2 z-30"></div>
                        
                        {/* Content Card - Cinematic Style */}
                        <div className={`
                            bg-white p-1 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 hover:z-40 hover:rotate-0
                            ${node.type === 'char' ? 'rotate-2' : 
                              node.type === 'event' ? '-rotate-1' : 
                              node.type === 'item' ? 'rotate-1' : '-rotate-2'}
                        `}>
                            <div className="w-28 h-28 overflow-hidden bg-gray-100 flex items-center justify-center relative border border-gray-300">
                                {node.img ? (
                                    <img src={node.img} className="w-full h-full object-cover grayscale contrast-125" alt="" />
                                ) : (
                                    <div className="opacity-20 text-black">{getNodeIcon(node.type)}</div>
                                )}
                            </div>
                            <div className="max-w-[7rem] text-center mt-1 bg-white">
                                <p className="font-mono text-[10px] uppercase font-bold leading-tight truncate px-1 py-1">{node.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ClueWallView;