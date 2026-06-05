import React, { useState } from 'react';
import { ShoppingCart, Heart, Search, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { PaintProduct } from '../types';

interface PaintCatalogProps {
  catalog: PaintProduct[];
  selectedWallColor: PaintProduct;
  selectedAccentColor: PaintProduct;
  onSetWallColor: (paint: PaintProduct) => void;
  onSetAccentColor: (paint: PaintProduct) => void;
  onAddToCart: (item: any) => void;
}

export default function PaintCatalog({
  catalog,
  selectedWallColor,
  selectedAccentColor,
  onSetWallColor,
  onSetAccentColor,
  onAddToCart
}: PaintCatalogProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cartCount, setCartCount] = useState<{ [id: string]: number }>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filter Catalog
  const filteredCatalog = catalog.filter(paint => 
    paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paint.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paint.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleAddToCartClick = (paint: PaintProduct) => {
    // Add to local state tracker count
    setCartCount(prev => ({
      ...prev,
      [paint.id]: (prev[paint.id] || 0) + 1
    }));

    // Trigger parent state update
    onAddToCart({
      productName: paint.name,
      productCode: paint.code,
      colorHex: paint.id === 'obsidian' ? '#27272a' : (paint.id === 'gold_metallic' ? '#d4af37' : '#faf9f5'),
      quantity: 1,
      price: paint.price
    });
  };

  return (
    <div className="flex flex-col gap-6" id="paint-catalog-module">
      
      {/* Search and Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase">THE BOUTIQUE COLLECTIONS</span>
          <h4 className="text-sm font-semibold text-white">Garg Paint Laboratory</h4>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            id="catalog-search"
            type="text"
            placeholder="Search paint collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 focus:border-[#d4af37] outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCatalog.map((paint) => {
          let labelHex = '#E5E5E5';
          if (paint.id === 'obsidian') labelHex = '#1e1e24';
          else if (paint.id === 'cashmere') labelHex = '#e1d7c6';
          else if (paint.id === 'marrakesh') labelHex = '#c48b6c';
          else if (paint.id === 'emerald') labelHex = '#105642';
          else if (paint.id === 'pearl') labelHex = '#faf9f5';
          else if (paint.id === 'gold_metallic') labelHex = '#cea135';
          else if (paint.id === 'calm_teal') labelHex = '#2c5e60';
          else if (paint.id === 'nordic_mist') labelHex = '#cfd3d4';

          const isWallSelected = selectedWallColor.id === paint.id;
          const isAccentSelected = selectedAccentColor.id === paint.id;
          const countInCart = cartCount[paint.id] || 0;
          const isFav = favorites.includes(paint.id);

          return (
            <div 
              key={paint.id} 
              id={`catalog-card-${paint.id}`}
              className="bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all group flex flex-col justify-between"
            >
              <div className="p-5 flex flex-col gap-4">
                {/* Paint color preview bubble */}
                <div className="relative aspect-video rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 w-full h-full filter blur-sm opacity-25" style={{ backgroundColor: labelHex }} />
                  <div 
                    className="w-16 h-16 rounded-full border border-white/20 shadow-2xl transition-transform group-hover:scale-110 duration-500 relative flex items-center justify-center"
                    style={{ backgroundColor: labelHex }}
                  >
                    {/* Metallic glow accents */}
                    {paint.id === 'gold_metallic' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-pulse" />
                    )}
                  </div>

                  {/* Top corner fav togglers */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button 
                      id={`fav-btn-${paint.id}`}
                      onClick={() => toggleFavorite(paint.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${isFav ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'}`}
                    >
                      <Heart className="w-3.5 h-3.5" fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#d4af37] tracking-widest uppercase">{paint.code}</span>
                    <span className="text-xs font-mono text-zinc-400">{paint.price}</span>
                  </div>
                  <h5 className="text-sm font-bold text-white tracking-tight leading-snug">{paint.name}</h5>
                  <span className="text-[10px] text-zinc-500 leading-normal line-clamp-2">{paint.tone}</span>
                </div>
              </div>

              {/* Action Buttons panel */}
              <div className="p-4 bg-zinc-900/30 border-t border-white/5 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <button
                    id={`set-wall-${paint.id}`}
                    onClick={() => onSetWallColor(paint)}
                    className={`px-2 py-1.5 rounded-lg border transition-all ${isWallSelected ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/5 text-zinc-400 hover:text-white bg-black/20'}`}
                  >
                    {isWallSelected ? "✓ Walls Active" : "Apply to Walls"}
                  </button>
                  <button
                    id={`set-accent-${paint.id}`}
                    onClick={() => onSetAccentColor(paint)}
                    className={`px-2 py-1.5 rounded-lg border transition-all ${isAccentSelected ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/5 text-zinc-400 hover:text-white bg-black/20'}`}
                  >
                    {isAccentSelected ? "✓ Accent Active" : "Apply Accent"}
                  </button>
                </div>

                <button
                  id={`add-cart-catalog-${paint.id}`}
                  onClick={() => handleAddToCartClick(paint)}
                  className="w-full bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-black border border-[#d4af37]/20 hover:border-[#d4af37] text-[11px] font-mono font-semibold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {countInCart > 0 ? `In Cart (${countInCart})` : "Add to Shopping Shelf"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
