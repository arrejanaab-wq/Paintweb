import React, { useState } from 'react';
import { Calendar, Phone, Mail, User, ShieldCheck, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { ConsultationBooking } from '../types';

interface AppointmentBookingProps {
  onAddBookingToDashboard: (booking: ConsultationBooking) => void;
}

export default function AppointmentBooking({ onAddBookingToDashboard }: AppointmentBookingProps) {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [category, setCategory] = useState<string>("Interior Color Consulting");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ticket, setTicket] = useState<ConsultationBooking | null>(null);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !scheduledDate) {
      alert("Please specify all required consultations boundaries.");
      return;
    }

    setIsSubmitting(true);
    setTicket(null);

    try {
      const response = await fetch('/api/book-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          scheduledDate,
          preferredCategory: category,
          notes
        })
      });
      const data = await response.json();
      if (data.success && data.booking) {
        setTicket(data.booking);
        onAddBookingToDashboard(data.booking);

        // Clear local input fields on success
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setScheduledDate("");
        setNotes("");
      } else {
        alert(data.error || "System encountered a problem booking consultation.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Remote server error setting up consultation booking slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="appointment-booking-module">
      
      {/* Detailed pitch (Left Column) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-gradient-to-tr from-zinc-950 to-zinc-950/60 p-6 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[9px] tracking-widest text-[#d4af37] uppercase">VIRTUAL & ON-SITE SURVEILLANCE</span>
          <h4 className="text-xl font-bold text-white tracking-tight leading-tight">Book an Elite Garg Color Architect</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Unsure which finish pairs best with your natural lighting layout? Reserve a personalized consultation session. An elite Garg Hardware designer will visit your space or set up a secure digital stream to map the perfect layout.
          </p>

          <ul className="flex flex-col gap-2.5 text-xs text-zinc-300 font-mono mt-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              Physical site color depth assessment (India or digital)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              Garg exclusive premium catalog samples box
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              Accurate square footage area surveys
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              Bespoke color mapping reports & estimates
            </li>
          </ul>
        </div>

        <div className="border-t border-white/5 pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-zinc-400 block uppercase">SECURE EXPERTISE CORES</span>
            <span className="text-xs font-semibold text-zinc-200">100% Risk Free Site Inspections</span>
          </div>
        </div>
      </div>

      {/* Inputs Form (Right Column) */}
      <div className="lg:col-span-7 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-6">
        
        {ticket ? (
          <div className="bg-gradient-to-tr from-[#020617] to-zinc-900 border border-[#d4af37]/30 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-4 py-8 relative">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 mb-1">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-[#d4af37] tracking-widest uppercase">CONSULTATION TICKET SECURED</span>
              <h5 className="text-base font-bold text-white tracking-tight">Your Slot has been Confirmed</h5>
            </div>

            <div className="bg-black/80 px-4 py-3 rounded-xl border border-white/10 font-mono text-center flex flex-col gap-1 w-full max-w-sm mt-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">TICKET REFS REFERENCE</span>
              <span className="text-lg font-bold text-emerald-400 tracking-wider font-mono">{ticket.token}</span>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed max-w-md">
              A Garg Hardware supervisor will contact you at <span className="text-zinc-200 font-semibold">{ticket.phoneNumber}</span> within 24 business hours to finalize transit instructions for <span className="text-zinc-200 font-semibold">{ticket.scheduledDate}</span>.
            </div>

            <button
              id="book-new-consultation"
              onClick={() => setTicket(null)}
              className="mt-3 px-4 py-2 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-colors bg-white/5"
            >
              Book New Session
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
            <h5 className="text-xs font-semibold font-mono text-[#d4af37] uppercase tracking-wider">Appointment Form</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs text-zinc-400 font-mono flex items-center gap-1" htmlFor="booking-name">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  placeholder="e.g. Vishal Garg"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono flex items-center gap-1" htmlFor="booking-email">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  id="booking-email"
                  type="email"
                  required
                  placeholder="e.g. gargvishal@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono flex items-center gap-1" htmlFor="booking-phone">
                  <Phone className="w-3 h-3" /> Alternate Phone (WhatsApp)
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono flex items-center gap-1" htmlFor="booking-date">
                  <Calendar className="w-3 h-3" /> Preferred Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl px-3 py-2 text-sm text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono" htmlFor="booking-category">Consultation Category Scope</label>
                <select
                  id="booking-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl px-3 py-2 text-sm text-zinc-200 font-mono"
                >
                  <option value="Interior Color Consulting">Interior Premium Layout Mapping</option>
                  <option value="Exterior Texture Mapping">Exterior Modern Villa Facades</option>
                  <option value="Paint Quantity Assessment">Paint Cost & Areas Surveys</option>
                  <option value="Digital Holographic Walkthrough">Digital Holographic Walkthrough</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono" htmlFor="booking-notes">Bespoke Design Requests / Notes</label>
                <textarea
                  id="booking-notes"
                  placeholder="Tell us about special color matching requirements or structure specifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 bg-black/60 border border-white/5 focus:border-[#d4af37] outline-none rounded-xl p-3 text-xs text-zinc-100 font-mono"
                />
              </div>
            </div>

            <button
              id="confirm-booking-btn"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-[#d4af37] text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg border border-[#d4af37]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Securing Schedule Slot...
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Confirm Elite Consultation Reservation
                </>
              )}
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
