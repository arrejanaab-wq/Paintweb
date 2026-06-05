import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Sparkles, 
  Paintbrush, 
  Calculator, 
  Layers, 
  Calendar, 
  ShoppingBag, 
  Heart, 
  ChevronRight, 
  Menu, 
  X, 
  Eye, 
  ArrowRight, 
  Check, 
  Trash2,
  Lock,
  ExternalLink,
  MessageCircle,
  Clock,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import InteractiveHouse3D from './components/InteractiveHouse3D';
import DesignStudio from './components/DesignStudio';
import PaintCostCalculator from './components/PaintCostCalculator';
import PaintCatalog from './components/PaintCatalog';
import AppointmentBooking from './components/AppointmentBooking';
import Dashboard from './components/Dashboard';
import { PaintProduct, ConsultationBooking, OrderRecord } from './types';

const PAINT_CATALOG: PaintProduct[] = [
  { id: "obsidian", name: "Imperial Obsidian", code: "GARG-8090", type: "Ultra Matte / Architectural Dark", price: "₹880/L", tone: "deep dark charcoal grey with rich velvet undertones", finish: "luxury velvet matte" },
  { id: "cashmere", name: "Royal Cashmere", code: "GARG-1022", type: "Satin Elegance / Warm Neutral", price: "₹620/L", tone: "creamy ivory-beige with sub-warm golden sheen", finish: "smooth high-end satin" },
  { id: "marrakesh", name: "Marrakesh Dunes", code: "GARG-4085", type: "Textured Clay / Earth Tone", price: "₹590/L", tone: "burnt terracotta clay with modern rustic warmth", finish: "textured earthy premium" },
  { id: "emerald", name: "Emerald Palace", code: "GARG-5560", type: "Rich Gloss / Regal Accent", price: "₹740/L", tone: "deep organic forest emerald with sophisticated depth", finish: "high-gloss jewel reflections" },
  { id: "pearl", name: "Seashell Pearl", code: "GARG-1010", type: "Reflective Silk / Light Breezy", price: "₹520/L", tone: "pure luminous off-white with fine micro-crushed quartz dust", finish: "light reflecting smooth finish" },
  { id: "gold_metallic", name: "Brushed Gold Ore", code: "GARG-2077", type: "Liquid Metallic Accent", price: "₹1,250/L", tone: "genuine warm refined gold leaf pigment dispersion", finish: "luxurious metallic shimmer" },
  { id: "calm_teal", name: "Vedic Teal", code: "GARG-6034", type: "Satin Solace / Calm Wellness", price: "₹680/L", tone: "calming deep teal balanced with muted slate-blue hues", finish: "velvety rich lustre" },
  { id: "nordic_mist", name: "Nordic Mist", code: "GARG-7012", type: "Matte Cool / Modern Minimal", price: "₹560/L", tone: "airy light stone grey with crisp glacial undertones", finish: "clean flat matte" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'catalog' | 'calculator' | 'appointment' | 'dashboard'>('studio');
  
  // Custom Color Selection synced globally across 3D House, Studio Canvas, and Swatches
  const [selectedWallColor, setSelectedWallColor] = useState<PaintProduct>(PAINT_CATALOG[2]); // Marrakesh Dunes defaults
  const [selectedAccentColor, setSelectedAccentColor] = useState<PaintProduct>(PAINT_CATALOG[5]); // Gold Metallic defaults
  const [housePartSelected, setHousePartSelected] = useState<'wall' | 'accent' | 'roof' | 'door'>('wall');

  // Unified shopping cart/order states
  const [cartItems, setCartItems] = useState<{
    productName: string;
    productCode: string;
    colorHex: string;
    quantity: number;
    price: string;
    isEstimate?: boolean;
    details?: string;
  }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Address entries for secure dispatch setup
  const [checkoutName, setCheckoutName] = useState<string>("");
  const [checkoutAddress, setCheckoutAddress] = useState<string>("");
  const [checkoutContact, setCheckoutContact] = useState<string>("");
  
  // Transaction loading triggers
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [checkoutProgress, setCheckoutProgress] = useState<string>("");

  // Storage caches (localStorage backed synchronizers)
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [savedEstimates, setSavedEstimates] = useState<{
    name: string;
    code: string;
    gallonsNeeded: number;
    totalCost: string;
    details: string;
  }[]>([]);

  // Load localStorage variables on startup safely
  useEffect(() => {
    try {
      const cachedBookings = localStorage.getItem('garg_paint_bookings');
      if (cachedBookings) setBookings(JSON.parse(cachedBookings));

      const cachedOrders = localStorage.getItem('garg_paint_orders');
      if (cachedOrders) setOrders(JSON.parse(cachedOrders));

      const cachedEstimates = localStorage.getItem('garg_paint_estimates');
      if (cachedEstimates) setSavedEstimates(JSON.parse(cachedEstimates));
    } catch (e) {
      console.error("Failed loading local caches", e);
    }
  }, []);

  // Sync methods
  const persistBookings = (newBk: ConsultationBooking[]) => {
    setBookings(newBk);
    localStorage.setItem('garg_paint_bookings', JSON.stringify(newBk));
  };

  const persistOrders = (newOrd: OrderRecord[]) => {
    setOrders(newOrd);
    localStorage.setItem('garg_paint_orders', JSON.stringify(newOrd));
  };

  const persistEstimates = (newEst: any[]) => {
    setSavedEstimates(newEst);
    localStorage.setItem('garg_paint_estimates', JSON.stringify(newEst));
  };

  // State modifying helpers
  const handleAddNewBooking = (bk: ConsultationBooking) => {
    const list = [bk, ...bookings];
    persistBookings(list);
  };

  const handleAddNewEstimate = (est: any) => {
    const list = [est, ...savedEstimates];
    persistEstimates(list);
  };

  const handleAddToCart = (item: any) => {
    setCartItems([...cartItems, item]);
  };

  const handleRemoveCartItem = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleSetPaintByCode = (code: string) => {
    const found = PAINT_CATALOG.find(p => p.code === code);
    if (found) setSelectedWallColor(found);
  };

  const clearBookingItem = (tok: string) => {
    const list = bookings.filter(b => b.token !== tok);
    persistBookings(list);
  };

  const clearEstimateItem = (idx: number) => {
    const list = savedEstimates.filter((_, i) => i !== idx);
    persistEstimates(list);
  };

  // Checkout gateway transaction simulation
  const handleInitiatePaymentCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!checkoutName || !checkoutAddress || !checkoutContact) {
      alert("Please specify clear shipping and recipient boundaries.");
      return;
    }

    setIsPaying(true);
    setCheckoutProgress("Initializing secure bank sandbox API tokens...");
    
    setTimeout(() => {
      setCheckoutProgress("Conducting encrypted spatial authentication gateway...");
      
      setTimeout(() => {
         setCheckoutProgress("Approving compound credits settlement... (Garg-Pay Secure)");
         
         setTimeout(() => {
           // Sum calculations
           const totalStr = "₹" + cartItems.reduce((acc, item) => {
             const costNum = Number(item.price.replace(/[^0-9]/g, '')) || 650;
             return acc + (costNum * item.quantity);
           }, 0).toLocaleString();

           const orderId = `GARG-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
           const structuredItems = cartItems.map(it => ({
              productName: it.productName,
              productCode: it.productCode,
              colorHex: it.colorHex,
              quantity: it.quantity,
              price: it.price
           }));

           const newOrder: OrderRecord = {
             orderId,
             clientName: checkoutName,
             address: checkoutAddress,
             contact: checkoutContact,
             items: structuredItems,
             totalCost: totalStr,
             date: new Date().toLocaleDateString(),
             status: "Processing Release"
           };

           persistOrders([newOrder, ...orders]);
           setCartItems([]);
           setCheckoutName("");
           setCheckoutAddress("");
           setCheckoutContact("");
           setIsPaying(false);
           setCheckoutProgress("");
           setIsCartOpen(false);

           alert(`✓ PAYMENT AUTHORIZED! Order ${orderId} has been securely synchronized with the Garg Hardware central release warehouse. Tracks are live in your client dashboard logs.`);
           setActiveTab('dashboard');
         }, 1100);
      }, 1100);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans relative antialiased selection:bg-[#d4af37]/35 selection:text-white pb-16">
      
      {/* Absolute floating luxury ambient grid shapes elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[180px] right-[5%] w-72 h-72 rounded-full bg-[#d4af37]/3 blur-[120px] pointer-events-none" />

      {/* APPLE-LEVEL PREMIUM HEADER BLURS (Sticky) */}
      <header className="sticky top-0 z-40 bg-[#070709]/80 backdrop-blur-xl border-b border-white/5 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo element */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#d4af37] p-0.5 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070709] rounded-[10px] flex items-center justify-center">
                <Paintbrush className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.25em] text-[#d4af37] font-bold">GARG HARDWARE</span>
              <h1 className="text-base font-bold text-white tracking-tight leading-none uppercase">Paint Studio</h1>
            </div>
          </div>

          {/* Quick contact / Support indices */}
          <div className="hidden md:flex items-center gap-5 text-xs text-zinc-400 font-mono">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-zinc-500 font-bold tracking-wider">SECURE CUSTOMER CARE</span>
              <span className="text-zinc-200">+91 99999 99999</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button 
              id="header-booking-shortcut"
              onClick={() => setActiveTab('appointment')}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#d4af37] text-zinc-200 rounded-xl hover:text-white transition-all font-semibold"
            >
              Consult an Expert
            </button>
          </div>

          {/* Cart Icon Shelf */}
          <div className="flex items-center gap-3">
            <button
              id="shopping-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-white/5 hover:border-white/15 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-black text-[9px] font-bold font-mono w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 relative z-10 pt-10">

        {/* HERO SECTION / CINEMATIC ROTATING DEMO CONTAINER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="homepage-hero-section">
          
          {/* Taglines & Narrative pitch (Column Left) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative">
            <span className="self-start px-3 py-1 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full text-[10px] font-mono tracking-widest uppercase font-semibold">
              The Sovereign standard in paint analytics
            </span>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              See Your Dream Home <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#d1af37] to-zinc-200">
                Before You Paint It.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 font-mono leading-relaxed max-w-xl">
              Welcome to the digital atelier of Garg Hardware Store. Experience cinematic real-time 360-degree color compositions backed by deep diagnostic analysis. Drag swatches, upload snaps, and customize physical dimensions effortlessly.
            </p>

            <div className="flex flex-wrap gap-3.5 mt-2">
              <button 
                id="hero-cta-studio"
                onClick={() => {
                  setActiveTab('studio');
                  const element = document.getElementById('studio-canvas-anchor');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#d4af37] text-[#070709] border border-[#d4af37] hover:bg-amber-400 hover:border-amber-400 py-3 px-6 rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider"
              >
                Launch Studio Canvas
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                id="hero-cta-calculator"
                onClick={() => {
                  setActiveTab('calculator');
                  const element = document.getElementById('studio-canvas-anchor');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#d4af37] text-zinc-200 py-3 px-6 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                Cost Calculator
              </button>
            </div>

            {/* Micro client proof badges */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 max-w-lg mt-4 font-mono text-zinc-500">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-white font-bold">10,000+</span>
                <span className="text-[9px] uppercase tracking-wide">Paints matched</span>
              </div>
              <div className="flex flex-col gap-0.5 border-x border-white/5 px-4">
                <span className="text-xs text-white font-bold">₹0 Cost</span>
                <span className="text-[9px] uppercase tracking-wide">AI diagnostics</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-white font-bold">24 Hours</span>
                <span className="text-[9px] uppercase tracking-wide">Rapid dispatches</span>
              </div>
            </div>
          </div>

          {/* rotating 3D Luxury CAD villa presentation box (Column Right) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Embedded custom rotator widget */}
            <InteractiveHouse3D
              wallColor={selectedWallColor.id === 'obsidian' ? '#1e1e24' : (selectedWallColor.id === 'gold_metallic' ? '#d4af37' : (selectedWallColor.id === 'emerald' ? '#105642' : '#ffffff'))}
              accentColor={selectedAccentColor.id === 'obsidian' ? '#1e1e24' : (selectedAccentColor.id === 'gold_metallic' ? '#cca035' : (selectedAccentColor.id === 'emerald' ? '#105642' : '#e1d7c6'))}
              selectedPart={housePartSelected}
              onSelectPart={(part) => setHousePartSelected(part)}
            />

            {/* Interactive palette specs strip */}
            <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                  style={{ backgroundColor: selectedWallColor.id === 'obsidian' ? '#1e1e24' : (selectedWallColor.id === 'gold_metallic' ? '#d4af37' : '#faf9f5') }}
                />
                <div>
                  <span className="text-zinc-500 block text-[9px] font-bold">WALL TONE ACTIVE</span>
                  <span className="text-zinc-200 font-semibold uppercase">{selectedWallColor.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                  style={{ backgroundColor: selectedAccentColor.id === 'obsidian' ? '#1e1e24' : (selectedAccentColor.id === 'gold_metallic' ? '#cca035' : '#e1d7c6') }}
                />
                <div>
                  <span className="text-zinc-500 block text-[9px] font-bold">CANTILEVER METALLIC</span>
                  <span className="text-zinc-200 font-semibold uppercase">{selectedAccentColor.name}</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* WORKSPACE NAVIGATION DECK DECK (Sticky or Anchor positioned above workspace modules) */}
        <div className="scroll-mt-24 border-b border-white/5 mt-6" id="studio-canvas-anchor">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs font-mono pb-px">
            {[
              { id: 'studio', label: '1. AI PAINT VISUALIZER', icon: Eye },
              { id: 'catalog', label: '2. CATALOG EXCLUSIVE', icon: Paintbrush },
              { id: 'calculator', label: '3. COST CALCULATOR', icon: Calculator },
              { id: 'appointment', label: '4. APPOINTMENT DESK', icon: Calendar },
              { id: 'dashboard', label: '5. CLIENT OPERATIONS', icon: Layers }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all transition-colors font-semibold ${isActive ? 'border-[#d4af37] text-[#d4af37] bg-white/3' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC SCREEN CAROUSEL ELEMENT RENDER */}
        <section className="min-h-[480px] transition-all duration-300" id="workspace-viewport">
          {activeTab === 'studio' && (
            <DesignStudio 
              catalog={PAINT_CATALOG}
              selectedWallColor={selectedWallColor}
              selectedAccentColor={selectedAccentColor}
              onSetWallColor={(p) => setSelectedWallColor(p)}
              onSetAccentColor={(p) => setSelectedAccentColor(p)}
            />
          )}

          {activeTab === 'catalog' && (
            <PaintCatalog 
              catalog={PAINT_CATALOG}
              selectedWallColor={selectedWallColor}
              selectedAccentColor={selectedAccentColor}
              onSetWallColor={(p) => setSelectedWallColor(p)}
              onSetAccentColor={(p) => setSelectedAccentColor(p)}
              onAddToCart={handleAddToCart}
            />
          )}

          {activeTab === 'calculator' && (
            <PaintCostCalculator 
              catalog={PAINT_CATALOG}
              selectedPaint={selectedWallColor}
              onSetSelectedPaintByCode={handleSetPaintByCode}
              onAddEstimateToCart={handleAddNewEstimate}
            />
          )}

          {activeTab === 'appointment' && (
            <AppointmentBooking 
              onAddBookingToDashboard={handleAddNewBooking}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              bookings={bookings}
              orders={orders}
              estimates={savedEstimates}
              onClearEstimate={clearEstimateItem}
              onClearBooking={clearBookingItem}
            />
          )}
        </section>

      </main>

      {/* FOOTER COGNIZANCES */}
      <footer className="mt-24 border-t border-white/5 py-12 relative z-10 bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-650">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left text-zinc-500">
            <span className="font-bold text-[#d4af37] text-[10px] tracking-wider uppercase">GARG DESIGN SUITE (v2.5)</span>
            <span>© 2026 Garg Hardware Store. Elite home architectural coatings masteries. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => setActiveTab('studio')} className="hover:text-white transition-colors">Visualizer</button>
            <span className="text-zinc-700 font-bold">•</span>
            <button onClick={() => setActiveTab('calculator')} className="hover:text-white transition-colors">Pricing</button>
            <span className="text-zinc-700 font-bold">•</span>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">Operations Panel</button>
          </div>
        </div>
      </footer>

      {/* SLIDING ABSOLUTE GLASSMORPHIC SHOPPING DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="shopping-drawer-overlay">
          {/* Glass background overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto cursor-pointer"
            onClick={() => setIsCartOpen(false)}
            id="drawer-backdrop"
          />

          {/* Drawer container body */}
          <div className="relative w-full max-w-md h-full bg-[#070709] border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between pointer-events-auto z-10">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Boutique Ordering Shelf</h4>
              </div>
              <button
                id="drawer-close"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg border border-white/5 hover:border-white/15 bg-zinc-900/40 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List items scroll section */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 font-mono text-xs">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 gap-2 select-none">
                  <ShoppingBag className="w-10 h-10 mb-2 animate-pulse" />
                  <span className="text-[11px] font-mono leading-none">Your Buying Shelf is Clear</span>
                  <span className="text-[10px] text-zinc-500 max-w-[240px] leading-relaxed">Add paint lines from the catalog or estimations reports to initiate procurement operations.</span>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="p-3.5 bg-zinc-900/60 rounded-xl border border-white/5 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-[#d4af37] font-semibold uppercase">{item.productCode}</span>
                      <h5 className="text-xs font-bold text-white tracking-tight leading-none">{item.productName}</h5>
                      <span className="text-[10px] text-zinc-400">Qty: {item.quantity} Liters</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-300">{item.price}</span>
                      <button
                        id={`remove-cart-item-${index}`}
                        onClick={() => handleRemoveCartItem(index)}
                        className="w-6 h-6 rounded bg-red-400/10 hover:bg-red-400/15 text-red-400 border border-red-500/20 hover:border-red-500/30 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form inputs & Proceed buttons container (Sticky bottom) */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/5 pt-4 shrink-0 flex flex-col gap-4 bg-[#070709]">
                <div className="flex justify-between items-baseline font-mono text-sm leading-none border-b border-white/5 pb-3">
                  <span className="text-zinc-405 font-semibold">Consolidated Sum</span>
                  <span className="text-lg font-bold text-[#d4af37]">
                    ₹{cartItems.reduce((acc, item) => {
                      const costNum = Number(item.price.replace(/[^0-9]/g, '')) || 650;
                      return acc + (costNum * item.quantity);
                    }, 0).toLocaleString()}
                  </span>
                </div>

                {isPaying ? (
                  <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/35 rounded-xl text-center flex flex-col items-center justify-center gap-2 font-mono py-6">
                    <RefreshCw className="w-6 h-6 text-[#d4af37] animate-spin mb-1" />
                    <span className="text-[10px] text-[#d4af37] tracking-widest uppercase font-bold">SECURE CHANNEL ACTIVE</span>
                    <span className="text-xs text-zinc-300 italic">{checkoutProgress}</span>
                  </div>
                ) : (
                  <form onSubmit={handleInitiatePaymentCheckout} className="flex flex-col gap-3 font-mono text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold" htmlFor="checkout-name">Recipient Name</label>
                      <input 
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="Vishal Garg"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-lg p-2 text-zinc-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold" htmlFor="checkout-address">Shipping Depot Destination</label>
                      <input 
                        id="checkout-address"
                        type="text"
                        required
                        placeholder="e.g. Sector-15, Rohini, New Delhi"
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-lg p-2 text-zinc-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold" htmlFor="checkout-contact">Care Contact Number</label>
                      <input 
                        id="checkout-contact"
                        type="tel"
                        required
                        placeholder="e.g. +91 99999 99999"
                        value={checkoutContact}
                        onChange={(e) => setCheckoutContact(e.target.value)}
                        className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-lg p-2 text-zinc-200"
                      />
                    </div>

                    <button
                      id="checkout-procure"
                      type="submit"
                      className="w-full bg-[#d4af37] hover:bg-amber-400 text-[#070709] border border-[#d4af37] font-bold py-2.5 rounded-xl uppercase tracking-wider text-xs transition-transform hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Secure Dispatch Release & Checkout
                    </button>
                  </form>
                )}
                
                <span className="text-[9px] text-zinc-500 text-center uppercase tracking-wide">
                  Garg-Secure™ Payments SSL Layer Verified
                </span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
