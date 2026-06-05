import React from 'react';
import { Layers, ShieldCheck, ShoppingBag, Clock, Heart, Trash2, PhoneCall, Sparkles, ExternalLink } from 'lucide-react';
import { ConsultationBooking, OrderRecord } from '../types';

interface DashboardProps {
  bookings: ConsultationBooking[];
  orders: OrderRecord[];
  estimates: {
    name: string;
    code: string;
    gallonsNeeded: number;
    totalCost: string;
    details: string;
  }[];
  onClearEstimate: (idx: number) => void;
  onClearBooking: (token: string) => void;
}

export default function Dashboard({
  bookings,
  orders,
  estimates,
  onClearEstimate,
  onClearBooking
}: DashboardProps) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="operations-dashboard-module">
      
      {/* Quick Status Stats Ribbon */}
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "SAVED SHADE SCHEMES", val: estimates.length + 3, desc: "Bespoke projects curated" },
          { label: "CONSULTATION SLOTS", val: bookings.length, desc: "Active designer mappings" },
          { label: "SUBMITTED PURCHASES", val: orders.length, desc: "Processing at stock depot" },
          { label: "DEPOSIT LOYALTY STATUS", val: "Platinum Gold", desc: "Premium privileged account" }
        ].map((st, i) => (
          <div key={i} className="p-4 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl flex flex-col gap-1 shadow-sm font-mono">
            <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">{st.label}</span>
            <div className="text-xl font-bold text-white tracking-tight">{st.val}</div>
            <span className="text-[10px] text-zinc-400">{st.desc}</span>
          </div>
        ))}
      </div>

      {/* Estimates & Saved customizer configurations Table (Left panel) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Saved Estimates card list */}
        <div className="p-6 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">QUANTITY PRESERVES</span>
              <h4 className="text-sm font-semibold text-white">Active Product Estimates</h4>
            </div>
            <span className="bg-white/5 text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded border border-white/10">{estimates.length} items</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
            {estimates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-600 select-none">
                <Layers className="w-8 h-8 mb-2 animate-pulse" />
                <span className="text-[11px] font-mono">Estimates Shelf is Empty</span>
                <span className="text-[10px] text-zinc-500 max-w-xs mt-1">Go to Paint Cost Calculator and tap &quot;Add Project to Orders Shelf&quot; to save quotations.</span>
              </div>
            ) : (
              estimates.map((est, index) => (
                <div key={index} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#d4af37] font-semibold uppercase">{est.code}</span>
                      <h5 className="text-sm font-bold text-white tracking-tight leading-snug mt-0.5">{est.name}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400">{est.totalCost}</span>
                      <button 
                        id={`clear-est-${index}`}
                        onClick={() => onClearEstimate(index)}
                        className="w-7 h-7 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all cursor-pointer"
                        title="Delete estimate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 leading-normal text-[11px] border-t border-white/5 pt-2 italic">
                    {est.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Consultation Bookings */}
        <div className="p-6 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] tracking-widest text-[#d4af37]">VISITS PROTOCOL</span>
              <h4 className="text-sm font-semibold text-white font-mono">My Consultations Agenda</h4>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-[11px] font-mono text-zinc-600">
                No active appointments slated under your profile.
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.token} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded font-semibold">{b.token}</span>
                      <span className="text-zinc-400 font-semibold">{b.preferredCategory}</span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">Contact person: {b.fullName} | Phone: {b.phoneNumber}</span>
                    {b.notes && <span className="text-zinc-600 block text-[11px] leading-snug">Note: &quot;{b.notes}&quot;</span>}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block">SCHEDULED FOR</span>
                      <span className="text-xs font-bold text-white uppercase">{b.scheduledDate}</span>
                    </div>
                    <button 
                      id={`clear-booking-${b.token}`}
                      onClick={() => b.token && onClearBooking(b.token)}
                      className="w-7 h-7 rounded bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Customer order histories and depot logistics tracking (Right Panel) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Active Order histories */}
        <div className="p-6 bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
            <span className="font-mono text-[9px] tracking-widest text-[#d4af37] uppercase">DEPOT RELEASES LOGISTICS</span>
            <h4 className="text-sm font-semibold text-white">Purchase Orders History</h4>
          </div>

          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-600 select-none">
                <ShoppingBag className="w-8 h-8 mb-2 animate-pulse" />
                <span className="text-[11px] font-mono">No Active Depot Shipments</span>
                <span className="text-[10px] text-zinc-500 max-w-xs mt-1">Submit orders in checkout panel to populate.</span>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.orderId} className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="font-bold text-[#d4af37] text-xs uppercase tracking-wider">{ord.orderId}</span>
                    </div>
                    <span className="text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded font-semibold">{ord.status}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <span className="text-zinc-500">Recipient: <span className="text-zinc-300 font-semibold">{ord.clientName}</span></span>
                    <span className="text-zinc-500">Logistics Dest: <span className="text-zinc-300 font-semibold">{ord.address}</span></span>
                    <span className="text-zinc-500">Dispatched: <span className="text-zinc-200 font-semibold">{ord.date}</span></span>
                  </div>

                  {/* Curated list of colors inside order */}
                  <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                    <span className="text-[10px] text-zinc-500">COMPOUND ITEMS LIST:</span>
                    {ord.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span>{it.productName} ({it.productCode}) x {it.quantity}L</span>
                        <span>{it.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-baseline border-t border-white/5 pt-2 text-xs font-bold leading-normal">
                    <span className="text-zinc-400">Logistical Bill Paid</span>
                    <span className="text-emerald-400">{ord.totalCost}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WhatsApp & Hotline help buttons widget */}
        <div className="p-6 bg-gradient-to-tr from-emerald-950/20 to-zinc-950 border border-[#22c55e]/15 rounded-2xl flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">LIVE DISPATCH HOTLINE</h5>
          </div>
          <p className="text-xs text-zinc-400 leading-normal leading-relaxed">
            Need urgent paint shade modifications or custom volume shipments? Send your dashboard estimates and codes directly to the Garg Hardware Paint Store desk on WhatsApp.
          </p>
          <div className="flex gap-2 text-xs font-mono">
            <a 
              id="whatsapp-integration-btn"
              href={`https://wa.me/919999999999?text=Hello%20Garg%20Hardware%2C%20I%20have%20customized%20a%20modern%20villa%20paint%20scheme%20on%20your%20design%20platform%20and%20need%20pricing%20consultation!`}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#128c7e] hover:bg-[#075e54] text-white py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-semibold"
            >
              WhatsApp Support
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
