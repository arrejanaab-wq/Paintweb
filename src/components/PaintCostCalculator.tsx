import React, { useState, useEffect } from 'react';
import { Calculator, Paintbrush, DollarSign, Plus, ArrowRight, ShieldCheck, ListPlus, Trash2 } from 'lucide-react';
import { PaintProduct } from '../types';

interface PaintCostCalculatorProps {
  catalog: PaintProduct[];
  selectedPaint: PaintProduct;
  onSetSelectedPaintByCode: (code: string) => void;
  onAddEstimateToCart: (summary: {
    name: string;
    code: string;
    gallonsNeeded: number;
    totalCost: string;
    details: string;
  }) => void;
}

export default function PaintCostCalculator({
  catalog,
  selectedPaint,
  onSetSelectedPaintByCode,
  onAddEstimateToCart
}: PaintCostCalculatorProps) {
  // Input dimensions
  const [width, setWidth] = useState<number>(20);
  const [height, setHeight] = useState<number>(10);
  const [doors, setDoors] = useState<number>(1);
  const [windows, setWindows] = useState<number>(2);
  const [coats, setCoats] = useState<number>(2);

  // Auxiliary modifiers
  const [includePrimer, setIncludePrimer] = useState<boolean>(true);
  const [includeLabor, setIncludeLabor] = useState<boolean>(true);
  const [laborTier, setLaborTier] = useState<string>("certified"); // "certified" (gold standard) or "artisan" (platinum finish)

  // Calibrated results state
  const [estimates, setEstimates] = useState({
    grossArea: 0,
    netArea: 0,
    gallonsNeeded: 0,
    paintCost: 0,
    primerCost: 0,
    laborCost: 0,
    totalCost: 0
  });

  // Calculate pricing whenever input boundaries change
  useEffect(() => {
    // 1. Compute surface area (standard room = length * height, gross)
    const wallGrossArea = Math.max(0, width * height);
    
    // 2. Subtract doors (21 sqft each) and windows (15 sqft each)
    const doorAreaPct = doors * 21;
    const windowAreaPct = windows * 15;
    const wallNetArea = Math.max(30, wallGrossArea - (doorAreaPct + windowAreaPct));

    // 3. Gallon cover rate: Premium Garg Paint averages ~350-400 sq.ft coverage per gallon per coat.
    // Let's assume 380 sq.ft per gallon.
    const coveragePerGallon = 380;
    const totalSqFtToPaint = wallNetArea * coats;
    const precisionUnitsNeeded = totalSqFtToPaint / coveragePerGallon;
    // Round to nearest integer paint liters/buckets needed (Garg Hardware offers premium 1-Litre handles)
    const litersNeeded = Math.ceil(precisionUnitsNeeded * 3.785); // 1 gallon is ~3.78L, let's calculate exact Litres needed!

    // Extract unit cost per liter from catalog item
    const priceNumberPattern = Number(selectedPaint.price.replace(/[^0-9]/g, '')) || 650;
    const calculatedPaintCost = litersNeeded * priceNumberPattern;

    // Primer cost logic: 1 Litre of undercoat primer covers ~120 sq.ft (single layer is adequate)
    const primerLitersNeeded = includePrimer ? Math.ceil(wallNetArea / 120) : 0;
    const calculatedPrimerCost = primerLitersNeeded * 280; // Garg primer is ₹280/L

    // Certified Labor pricing based on net wall area
    const laborMultiplier = laborTier === "certified" ? 45 : 85; // ₹45 vs ₹85 per sq ft
    const calculatedLaborCost = includeLabor ? Math.round(wallNetArea * laborMultiplier) : 0;

    const grandTotalPrice = calculatedPaintCost + calculatedPrimerCost + calculatedLaborCost;

    setEstimates({
      grossArea: wallGrossArea,
      netArea: wallNetArea,
      gallonsNeeded: litersNeeded,
      paintCost: calculatedPaintCost,
      primerCost: calculatedPrimerCost,
      laborCost: calculatedLaborCost,
      totalCost: grandTotalPrice
    });

  }, [width, height, doors, windows, coats, selectedPaint, includePrimer, includeLabor, laborTier]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="cost-calculator-widget">
      
      {/* Parameter Adjustment board (Left Column) */}
      <div className="lg:col-span-6 bg-gradient-to-tr from-zinc-950 to-zinc-900/60 p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div>
            <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">QUANTITY SPECIFICATIONS</span>
            <h4 className="text-sm font-semibold text-white">Dimension Parameters</h4>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-width">Wall Total Length (ft)</label>
            <input 
              id="calc-width"
              type="number"
              min="5"
              max="500"
              value={width}
              onChange={(e) => setWidth(Math.max(5, Number(e.target.value)))}
              className="bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#d4af37] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-height">Average Wall Height (ft)</label>
            <input 
              id="calc-height"
              type="number"
              min="5"
              max="50"
              value={height}
              onChange={(e) => setHeight(Math.max(4, Number(e.target.value)))}
              className="bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#d4af37] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-doors">Doors Count</label>
            <input 
              id="calc-doors"
              type="number"
              min="0"
              max="20"
              value={doors}
              onChange={(e) => setDoors(Math.max(0, Number(e.target.value)))}
              className="bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#d4af37] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-windows">Windows Count</label>
            <input 
              id="calc-windows"
              type="number"
              min="0"
              max="40"
              value={windows}
              onChange={(e) => setWindows(Math.max(0, Number(e.target.value)))}
              className="bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#d4af37] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-coats">Coat Layers</label>
            <select
              id="calc-coats"
              value={coats}
              onChange={(e) => setCoats(Number(e.target.value))}
              className="bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:border-[#d4af37] outline-none"
            >
              <option value="1">1 Layer (Faded Touchup)</option>
              <option value="2">2 Layers (Standard Deep)</option>
              <option value="3">3 Layers (Bespoke Vivid)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs text-zinc-400 font-mono" htmlFor="calc-paint-selection">Target Paint Finish Grade</label>
          <select
            id="calc-paint-selection"
            value={selectedPaint.code}
            onChange={(e) => onSetSelectedPaintByCode(e.target.value)}
            className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-zinc-200 font-mono focus:border-[#d4af37] outline-none"
          >
            {catalog.map(paint => (
              <option key={paint.id} value={paint.code}>
                {paint.name} ({paint.price} / L, Code: {paint.code})
              </option>
            ))}
          </select>
        </div>

        {/* Sliders and Toggles */}
        <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between bg-black/45 p-3 rounded-xl border border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-zinc-200 font-mono">Undercoat Primer Binder</span>
              <span className="text-[10px] text-zinc-500">Add acrylic primer to enhance adhesion.</span>
            </div>
            <input 
              id="calc-primer-toggle"
              type="checkbox" 
              checked={includePrimer}
              onChange={(e) => setIncludePrimer(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 accent-[#d4af37] cursor-pointer"
            />
          </div>

          <div className="flex flex-col bg-black/45 p-3 rounded-xl border border-[#d4af37]/10 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-zinc-200 font-mono">Certified Painter Labor</span>
                <span className="text-[10px] text-zinc-400">Include Garg Hardware Store certified decorators.</span>
              </div>
              <input 
                id="calc-labor-toggle"
                type="checkbox" 
                checked={includeLabor}
                onChange={(e) => setIncludeLabor(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 accent-[#d4af37] cursor-pointer"
              />
            </div>

            {includeLabor && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="labor-tier-certified"
                  onClick={() => setLaborTier("certified")}
                  className={`p-2 rounded-lg text-xs font-mono border transition-all ${laborTier === "certified" ? 'border-[#d4af37] bg-[#d4af37]/5 text-[#d4af37]' : 'border-white/5 text-zinc-500 hover:text-zinc-300 bg-black/40'}`}
                >
                  Garg Certified (₹45/sqft)
                </button>
                <button
                  id="labor-tier-artisan"
                  onClick={() => setLaborTier("artisan")}
                  className={`p-2 rounded-lg text-xs font-mono border transition-all ${laborTier === "artisan" ? 'border-[#d4af37] bg-[#d4af37]/5 text-[#d4af37]' : 'border-white/5 text-zinc-500 hover:text-zinc-300 bg-black/40'}`}
                >
                  Artisan Premium (₹85/sqft)
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quote Evaluation & Breakdown widget (Right Column) */}
      <div className="lg:col-span-6 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">VALUATION SLATE</span>
              <h4 className="text-sm font-semibold text-white">Project Cost Quotation</h4>
            </div>
            <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              100% Guaranteed Price
            </div>
          </div>

          {/* Area statistics */}
          <div className="grid grid-cols-3 gap-3 bg-black/50 p-3 rounded-xl border border-white/5 text-center font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500">GROSS AREA</span>
              <span className="text-xs font-semibold text-zinc-200">{estimates.grossArea} sq.ft</span>
            </div>
            <div className="flex flex-col gap-0.5 border-x border-white/5">
              <span className="text-[10px] text-zinc-500">NET AREA (-D/W)</span>
              <span className="text-xs font-semibold text-zinc-100">{estimates.netArea} sq.ft</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#d4af37]">PAINT LTR</span>
              <span className="text-xs font-semibold text-[#d4af37]">{estimates.gallonsNeeded} L needed</span>
            </div>
          </div>

          {/* Detailed itemized breakdown list */}
          <div className="flex flex-col gap-3 font-mono text-xs pt-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-zinc-500" />
                Paint Bucket ({selectedPaint.name}) x {estimates.gallonsNeeded}L
              </span>
              <span className="text-zinc-200">₹{estimates.paintCost.toLocaleString()}</span>
            </div>

            {includePrimer && (
              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  Garg Base Primer Coat x {Math.ceil(estimates.netArea / 120)}L
                </span>
                <span className="text-zinc-200">₹{estimates.primerCost.toLocaleString()}</span>
              </div>
            )}

            {includeLabor && (
              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  Professional Workmanship ({laborTier === 'certified' ? 'Standard Cert.' : 'Artisan Elite'})
                </span>
                <span className="text-zinc-200">₹{estimates.laborCost.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-zinc-400 border-t border-white/5 pt-3 mt-1">
              <span>Standard Logistics / Materials Handling</span>
              <span className="text-emerald-400 font-semibold">FREE (Boutique Special)</span>
            </div>
          </div>
        </div>

        {/* Global summary and call to action block */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-zinc-400">Grand Estimated Quote</span>
            <span className="text-2xl font-bold font-mono text-[#d4af37]">₹{estimates.totalCost.toLocaleString()}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              id="calc-add-cart-btn"
              onClick={() => {
                onAddEstimateToCart({
                  name: `Paint Estimate for ${width}x${height} Room`,
                  code: selectedPaint.code,
                  gallonsNeeded: estimates.gallonsNeeded,
                  totalCost: `₹${estimates.totalCost.toLocaleString()}`,
                  details: `Dimensions: ${width}x${height}ft (${estimates.netArea} sq.ft), ${coats} coats of ${selectedPaint.name}. Primer: ${includePrimer ? 'Yes' : 'No'}, Labor: ${includeLabor ? (laborTier === 'certified' ? 'Certified' : 'Artisan') : 'No'}.`
                });
                alert("✓ Estimate added successfully to your checkout shelf. Click checkout/order drawer to complete your project setup.");
              }}
              className="w-full bg-[#d4af37] text-zinc-950 hover:bg-amber-400 border border-[#d4af37] font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Add Project to Orders Shelf
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 font-mono leading-normal text-center">
            * These estimates are accurate approximations. A digital site evaluation is recommended before final compound blends.
          </p>
        </div>

      </div>

    </div>
  );
}
