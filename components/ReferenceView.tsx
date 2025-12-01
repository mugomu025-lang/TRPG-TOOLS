import React, { useState } from 'react';
import { ReferenceEntry } from '../types';
import { Globe, Plus, Trash2, Search, ExternalLink, Bookmark, Image as ImageIcon } from 'lucide-react';

interface ReferenceViewProps {
  references: ReferenceEntry[];
  onChange: (refs: ReferenceEntry[]) => void;
}

interface WikiResult {
    title: string;
    extract: string;
    thumbnail?: string;
    pageid: number;
}

const ReferenceView: React.FC<ReferenceViewProps> = ({ references, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<WikiResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const addReference = () => {
      const newRef: ReferenceEntry = {
          id: Date.now().toString(),
          title: "新参考资料",
          url: "https://",
          note: ""
      };
      onChange([...references, newRef]);
  };

  const updateReference = (id: string, updates: Partial<ReferenceEntry>) => {
      onChange(references.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReference = (id: string) => {
      onChange(references.filter(r => r.id !== id));
  };

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      setSearchResult(null);

      try {
          // Use Wikipedia API with CORS origin
          const url = `https://zh.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=400&exintro=1&explaintext=1&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&origin=*`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.query && data.query.pages) {
              const pageId = Object.keys(data.query.pages)[0];
              const page = data.query.pages[pageId];
              
              setSearchResult({
                  title: page.title,
                  extract: page.extract,
                  thumbnail: page.thumbnail?.source,
                  pageid: page.pageid
              });
          } else {
              alert("未找到相关条目 (No results found).");
          }
      } catch (err) {
          console.error(err);
          alert("搜索失败，请检查网络连接 (Failed to fetch).");
      } finally {
          setIsSearching(false);
      }
  };

  const openWikiPage = () => {
      if (searchResult) {
          window.open(`https://zh.wikipedia.org/?curid=${searchResult.pageid}`, '_blank');
      }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32 min-h-full">
        <div className="border-b-2 border-ink pb-4 mb-8 flex justify-between items-end">
            <div>
                <h2 className="font-display text-4xl text-ink uppercase tracking-widest">资料参考 (Library Reference)</h2>
                <p className="font-mono text-sm text-gray-500 mt-1">外部文献、维基百科与灵感来源</p>
            </div>
            <button onClick={addReference} className="flex items-center gap-2 bg-ink text-gold px-3 py-2 font-mono text-sm uppercase hover:bg-blood transition-colors shadow-md">
                <Plus className="w-4 h-4" /> 新建词条
            </button>
        </div>

        {/* Wikipedia Search Bar & Preview */}
        <div className="bg-white border-2 border-charcoal p-6 mb-8 shadow-lg flex flex-col gap-4">
             <div className="flex items-center gap-2 text-ink font-display uppercase tracking-widest font-bold border-b border-gray-200 pb-2">
                 <Globe className="w-6 h-6" /> Miskatonic Library Search
             </div>
             
             <form onSubmit={handleSearch} className="flex gap-2">
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="在维基百科中搜索神秘知识..."
                    className="flex-1 bg-paper border border-gray-300 p-3 font-serif text-ink focus:border-gold outline-none"
                 />
                 <button type="submit" disabled={isSearching} className="bg-charcoal text-white px-6 py-3 font-bold uppercase hover:bg-gold hover:text-ink transition-colors disabled:opacity-50">
                     {isSearching ? 'Searching...' : <><Search className="w-4 h-4 inline mr-2" /> Search</>}
                 </button>
             </form>

             {/* Search Result Preview */}
             {searchResult && (
                 <div 
                    className="mt-4 border border-gray-300 bg-paper p-0 flex flex-col md:flex-row cursor-pointer hover:shadow-xl transition-shadow group overflow-hidden"
                    onClick={openWikiPage}
                 >
                     {searchResult.thumbnail ? (
                         <div className="w-full md:w-48 h-48 shrink-0 bg-gray-200">
                             <img src={searchResult.thumbnail} alt={searchResult.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                         </div>
                     ) : (
                         <div className="w-full md:w-48 h-48 shrink-0 bg-charcoal/10 flex items-center justify-center text-gray-400">
                             <ImageIcon className="w-12 h-12" />
                         </div>
                     )}
                     
                     <div className="p-6 flex-1">
                         <h3 className="font-display text-2xl text-ink mb-2 group-hover:text-blood transition-colors flex items-center gap-2">
                             {searchResult.title}
                             <ExternalLink className="w-4 h-4 opacity-50" />
                         </h3>
                         <p className="font-serif text-sm text-gray-700 leading-relaxed line-clamp-4">
                             {searchResult.extract}
                         </p>
                         <p className="mt-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                             Click to read full entry at Wikipedia
                         </p>
                     </div>
                 </div>
             )}
        </div>

        {/* References Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {references.map(ref => (
                <div key={ref.id} className="bg-paper border border-gray-300 p-6 relative group hover:shadow-xl transition-all border-l-4 border-l-gold">
                    <button 
                        onClick={() => deleteReference(ref.id)} 
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-4">
                        <input 
                            value={ref.title}
                            onChange={(e) => updateReference(ref.id, { title: e.target.value })}
                            className="font-display text-xl text-ink bg-transparent border-b border-transparent hover:border-gray-300 focus:border-ink outline-none w-full"
                            placeholder="资料标题"
                        />
                        
                        <div className="flex gap-2 items-center">
                            <input 
                                value={ref.url}
                                onChange={(e) => updateReference(ref.id, { url: e.target.value })}
                                className="flex-1 font-mono text-xs text-blue-600 bg-transparent border-b border-transparent hover:border-blue-200 focus:border-blue-500 outline-none truncate"
                                placeholder="https://..."
                            />
                            {ref.url && ref.url !== 'https://' && (
                                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-ink">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        <div className="relative">
                            <Bookmark className="absolute top-2 left-2 w-4 h-4 text-gray-300" />
                            <textarea 
                                value={ref.note}
                                onChange={(e) => updateReference(ref.id, { note: e.target.value })}
                                className="w-full h-24 bg-white/50 border border-gray-200 p-2 pl-8 font-serif text-sm text-ink resize-none focus:bg-white focus:border-gold outline-none"
                                placeholder="备注与摘要..."
                            />
                        </div>
                    </div>
                </div>
            ))}
            {references.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-300">
                    暂无参考资料。请使用上方搜索或新建词条。
                </div>
            )}
        </div>
    </div>
  );
};

export default ReferenceView;