import { useState, FormEvent } from 'react';
import confetti from 'canvas-confetti';

interface FinalCtaSectionProps {
  onSuccess?: (contact: string) => void;
}

export default function FinalCtaSection({ onSuccess }: FinalCtaSectionProps) {
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#ffcc00', '#ff5722', '#1a1c1c'],
    });
    onSuccess?.(contact);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl my-space-lg">
      <div className="w-full rounded-xl bg-surface-container-lowest/95 backdrop-blur-2xl p-space-xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center border border-surface-container-high/60">
        {/* Accent Neon Backlight Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-tertiary/20 rounded-full blur-3xl pointer-events-none"></div>

        <span className="relative z-10 px-space-md py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-black mb-space-sm shadow-sm">
          UNLEASH THE CYBER CITY
        </span>

        <h2 className="relative z-10 font-display-2xl text-display-2xl tracking-tighter text-on-surface font-black uppercase max-w-3xl leading-none">
          READY TO DIAL UP THE ENERGY?
        </h2>

        <p className="relative z-10 font-body-lg text-body-lg text-secondary max-w-xl mt-space-md mb-space-lg font-medium">
          Grab a seasonal membership token, access 24/7 docking terminals, and lead Kolkata's zero-emission street transformation.
        </p>

        {submitted ? (
          <div className="relative z-10 bg-primary-container/20 border border-primary-container p-space-md rounded-full px-space-xl flex items-center gap-space-sm text-on-surface font-headline-sm text-headline-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            <span>Rider Pass generated for {contact}! Check your messages to claim.</span>
          </div>
        ) : (
          /* Newsletter / Pass Input Formulation */
          <form
            className="relative z-10 w-full max-w-md flex flex-col sm:flex-row items-center gap-space-xs bg-surface-container-low p-1.5 rounded-full shadow-lg border border-surface-container-high"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center gap-space-xs px-space-md w-full">
              <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
              <input
                className="w-full bg-transparent border-none outline-none text-on-surface font-body-base text-body-base placeholder:text-secondary"
                placeholder="Enter your mobile or email"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <button
              className="w-full sm:w-auto flex-shrink-0 h-12 px-space-lg rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm shadow-[0_8px_20px_rgba(255,204,0,0.35)] hover:scale-105 active:scale-95 transition-all font-bold cursor-pointer"
              type="submit"
            >
              Get Rider Pass
            </button>
          </form>
        )}

        {/* Guarantee metadata points */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-space-lg mt-space-lg text-secondary font-body-sm text-body-sm font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span> Zero Security Deposit
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">health_and_safety</span> ₹2 Lakh Instant Accident Cover
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span> 24/7 Smart Dock Access
          </span>
        </div>
      </div>
    </section>
  );
}
