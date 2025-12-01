import React, { useState } from 'react';
import { Item, ItemType } from '../types';
import { Trash2, Plus, Search, Sword, Scroll, Wrench, RefreshCw, Upload, Book, Box, X } from 'lucide-react';

interface ItemViewProps {
  items: Item[];
  onChange: (items: Item[]) => void;
  onAutoGenerate: () => void;
}

const ItemView: React.FC<ItemViewProps> = ({ items, onChange, onAutoGenerate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<ItemType | 'All'>('Clue');

  const handleUpdate = (id: string, updates: Partial<Item>) => {
    onChange(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(items.filter(i => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addNew = (type: ItemType = 'Clue') => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: "新物品",
      type: type,
      description: "",
      attributes: "",
      owner: "",
      foundLocation: ""
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        handleUpdate(id, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Removed parentheses text as requested
  const categories: { type: ItemType; label: string; icon: React.ReactNode; desc: string }[] = [
      { type: 'Clue', label: '垃圾', icon: <Trash2 className="w-5 h-5"/>, desc: '破碎的纸条、奇怪的残渣...' },
      { type: 'Weapon', label: '军火库', icon: <Sword className="w-5 h-5"/>, desc: '左轮手枪、仪仗刀...' },
      { type: 'Tool', label: '工具箱', icon: <Wrench className="w-5 h-5"/>, desc: '撬棍、手电筒、开锁器...' },
      { type: 'Artifact', label: '收藏品', icon: <Scroll className="w-5 h-5"/>, desc: '雕像、护身符、古老石碑...' },
      { type: 'Document', label: '书箱', icon: <Book className="w-5 h-5"/>, desc: '日记、神话典籍、信件...' },
  ];

  const activeItem = items.find(i => i.id === expandedId);

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32 min-h-full">
       <div className="border-b-2 border-ink pb-4 mb-8 flex justify-between items-end">
        <div>
            <h2 className="font-display text-4xl text-ink uppercase tracking-widest">物品收集 (Item Collection)</h2>
            <p className="font-mono text-sm text-gray-500 mt-1">证据、装备与神秘遗物</p>
        </div>
        <button onClick={onAutoGenerate} className="flex items-center gap-2 bg-ink text-gold px-3 py-1 font-mono text-sm uppercase hover:bg-blood transition-colors">
            <RefreshCw className="w-4 h-4" /> 自动生成道具
        </button>
      </div>

      <div className="space-y-6">
          {categories.map(cat => (
              <div key={cat.type} className="border border-gray-300 bg-white shadow-sm overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => setOpenCategory(openCategory === cat.type ? 'All' : cat.type)}
                  >
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${openCategory === cat.type ? 'bg-ink text-gold' : 'bg-gray-200 text-gray-500'}`}>
                              {cat.icon}
                          </div>
                          <div>
                              <h3 className="font-display text-lg uppercase font-bold text-ink">{cat.label}</h3>
                              <p className="font-mono text-[10px] text-gray-400">{cat.desc}</p>
                          </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addNew(cat.type); }}
                        className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-gold transition-colors"
                      >
                          + 添加
                      </button>
                  </div>
                  
                  {(openCategory === cat.type || openCategory === 'All') && (
                      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-[#fcfbf9]">
                          {items.filter(i => i.type === cat.type).map(item => (
                              <div 
                                key={item.id} 
                                onClick={() => setExpandedId(item.id)}
                                className="group relative aspect-square border-2 border-dashed border-gray-300 hover:border-ink cursor-pointer flex flex-col items-center justify-center p-2 bg-white transition-all hover:-translate-y-1 hover:shadow-md"
                              >
                                  {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.name} className="w-full h-2/3 object-contain mb-2 sepia" />
                                  ) : (
                                      <Box className="w-8 h-8 text-gray-200 mb-2 group-hover:text-ink transition-colors" />
                                  )}
                                  <span className="font-serif text-sm text-center font-bold text-ink truncate w-full px-2">{item.name}</span>
                                  
                                  <button 
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                          {items.filter(i => i.type === cat.type).length === 0 && (
                              <div className="col-span-full py-4 text-center text-xs text-gray-400 italic">
                                  此处空空如也...
                              </div>
                          )}
                      </div>
                  )}
              </div>
          ))}
      </div>

      {/* Detail Modal */}
      {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setExpandedId(null)}>
               <div 
                    className="bg-[#f4f1ea] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-double border-ink p-8 relative flex flex-col md:flex-row gap-8"
                    onClick={(e) => e.stopPropagation()}
               >
                    <button 
                        onClick={() => setExpandedId(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-ink"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-1/3 shrink-0">
                         <div className="aspect-square bg-charcoal/5 border border-gray-300 relative group overflow-hidden flex items-center justify-center">
                            {activeItem.imageUrl ? (
                                <img src={activeItem.imageUrl} alt={activeItem.name} className="w-full h-full object-contain p-4" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <span className="text-xs uppercase font-mono">上传物品照片</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => e.target.files && handleImageUpload(activeItem.id, e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                         </div>
                         <div className="mt-4 space-y-2">
                             <div>
                                 <label className="text-[10px] font-mono uppercase text-gray-500 block">Category</label>
                                 <select 
                                    value={activeItem.type}
                                    onChange={(e) => handleUpdate(activeItem.id, { type: e.target.value as ItemType })}
                                    className="w-full bg-white border border-gray-300 text-sm p-1 font-mono uppercase"
                                 >
                                     {categories.map(c => <option key={c.type} value={c.type}>{c.label}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-[10px] font-mono uppercase text-gray-500 block">Attributes / Stats</label>
                                 <input 
                                    value={activeItem.attributes || ''}
                                    onChange={(e) => handleUpdate(activeItem.id, { attributes: e.target.value })}
                                    placeholder="e.g. 1d6 dmg, Fragile..."
                                    className="w-full bg-white border border-gray-300 text-sm p-1 font-mono text-blood"
                                 />
                             </div>
                         </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-4">
                        <div className="border-b-2 border-ink pb-2">
                            <input 
                                value={activeItem.name}
                                onChange={(e) => handleUpdate(activeItem.id, { name: e.target.value })}
                                className="font-display text-3xl text-ink bg-transparent outline-none w-full placeholder-gray-300"
                                placeholder="物品名称"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase text-gray-500 block">Belongs To (Owner)</label>
                                <input 
                                    value={activeItem.owner || ''}
                                    onChange={(e) => handleUpdate(activeItem.id, { owner: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-300 text-sm font-serif italic text-ink"
                                    placeholder="归属..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase text-gray-500 block">Found Location</label>
                                <input 
                                    value={activeItem.foundLocation || ''}
                                    onChange={(e) => handleUpdate(activeItem.id, { foundLocation: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-300 text-sm font-serif italic text-ink"
                                    placeholder="被发现地..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-mono uppercase text-gray-500 block mb-2">Description & Notes</label>
                            <textarea 
                                value={activeItem.description}
                                onChange={(e) => handleUpdate(activeItem.id, { description: e.target.value })}
                                className="w-full h-64 bg-white border border-gray-200 p-4 font-serif text-base leading-relaxed text-ink resize-none shadow-inner outline-none focus:border-gold"
                                placeholder="详细描述..."
                            />
                        </div>
                    </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default ItemView;