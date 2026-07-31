import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';

interface SplashWelcomeScreenProps {
  onEnter: () => void;
}

export const SplashWelcomeScreen: React.FC<SplashWelcomeScreenProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white overflow-y-auto p-3 sm:p-6 md:p-8 selection:bg-red-900 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/50 via-black to-black pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 bg-red-900/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-rose-950/35 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Main Content Card - Max-height with scroll safety for small mobile screens */}
      <div className="relative z-10 my-auto max-w-xl sm:max-w-2xl w-full p-5 sm:p-8 md:p-10 bg-neutral-950/90 border border-red-950/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-950/70 backdrop-blur-2xl flex flex-col items-center text-center animate-fadeIn">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-red-950/90 border border-red-800/80 text-rose-300 text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-4 sm:mb-6 shadow-md shadow-red-950/50">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
          <span>KandaFV Official Platform</span>
        </div>

        {/* Premium Horizontal Logo Display Box */}
        <div className="w-full max-w-xs sm:max-w-md my-1 sm:my-3 p-3 sm:p-4 rounded-2xl bg-black/60 border border-neutral-900/90 shadow-inner flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-rose-900/10 to-red-950/20 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <img
            src="/logo-horizontal-putih.svg"
            alt="KandaFV Horizontal Logo"
            className="w-full h-auto max-h-14 sm:max-h-20 object-contain drop-shadow-[0_0_20px_rgba(225,29,72,0.45)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Founder Statement & Quote Box */}
        <div className="my-4 sm:my-6 p-4 sm:p-6 bg-black/80 border border-neutral-800/80 rounded-2xl relative text-left w-full shadow-lg">
          <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-red-800/40 absolute -top-3 -left-2 fill-red-950/50 pointer-events-none" />
          
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic relative z-10 pl-3.5 border-l-2 border-red-600">
            "Setiap karya visual bukan sekadar kumpulan gambar, melainkan dedikasi, emosi, dan nilai estetika tinggi yang dirancang untuk melampaui waktu. Selamat datang di portal seleksi foto eksklusif KandaFV."
          </p>

          <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <p className="font-extrabold text-white tracking-wide text-xs sm:text-sm truncate">
                Kanda Althof Azzuhdy, S.T.
              </p>
              <p className="text-[11px] sm:text-xs text-rose-400 font-semibold mt-0.5">
                Founder & CEO KandaFV
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-neutral-400 bg-neutral-900/90 px-2.5 py-1 rounded-lg border border-neutral-800 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Verified Executive</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Interactive CTA Button */}
        <div className="w-full mt-1 sm:mt-2 space-y-3 sm:space-y-4">
          
          {/* Progress Bar Container */}
          <div className="space-y-1.5">
            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div
                className="bg-gradient-to-r from-red-800 via-rose-600 to-red-500 h-full rounded-full transition-all duration-150 shadow-sm shadow-red-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400 font-mono px-0.5">
              <span className="flex items-center gap-1.5">
                {isReady ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Siap Digunakan
                  </span>
                ) : (
                  <span>Menyiapkan Galeri...</span>
                )}
              </span>
              <span className="text-rose-400 font-bold">{progress}%</span>
            </div>
          </div>

          {/* Enter Platform Button */}
          <button
            type="button"
            onClick={onEnter}
            className={`w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-xl min-h-[48px] ${
              isReady
                ? 'bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white shadow-red-950/80 border border-red-700/90 hover:scale-[1.01] active:scale-95 ring-2 ring-red-600/30'
                : 'bg-gradient-to-r from-red-950/80 to-neutral-900 hover:from-red-900 hover:to-neutral-800 text-white border border-red-900/60'
            }`}
          >
            <span>MASUK KE PLATFORM SELEKSI FOTO</span>
            <ArrowRight className="w-4 h-4 text-rose-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
};
