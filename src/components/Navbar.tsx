import React from 'react';
import { Image, FolderSymlink, Sparkles, Bookmark, RotateCcw } from 'lucide-react';

interface NavbarProps {
  totalFiles: number;
  selectedCount: number;
  onOpenPresets: () => void;
  onReset: () => void;
  onOpenWelcome?: () => void;
  activeCollectionTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalFiles,
  selectedCount,
  onOpenPresets,
  onReset,
  onOpenWelcome,
  activeCollectionTitle
}) => {
  const [isLogoToggled, setIsLogoToggled] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-red-950/90 text-white transition-all shadow-lg shadow-black/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div 
            onClick={() => setIsLogoToggled(!isLogoToggled)}
            className="w-10 h-10 rounded-xl bg-black border border-neutral-800 hover:border-red-800/80 flex items-center justify-center shadow-lg shadow-red-950/50 shrink-0 overflow-hidden relative group cursor-pointer transition-all duration-300"
            title="Klik atau hover untuk ganti logo KandaFV / Drive Photo Selector"
          >
            {/* KandaFV Logo Image */}
            <img 
              src="/logo-kandafv-ig-hitam.svg" 
              alt="KandaFV" 
              className={`w-full h-full object-cover transition-all duration-500 hover:animate-pulseRed group-hover:animate-pulseRed absolute inset-0 ${
                isLogoToggled ? 'opacity-0 scale-75 rotate-6' : 'opacity-100 scale-100'
              } group-hover:opacity-0 group-hover:scale-75 group-hover:rotate-6`}
            />
            
            {/* Drive Photo Selector Icon (Previous Logo) */}
            <div 
              className={`w-full h-full bg-gradient-to-tr from-red-950 via-rose-900 to-red-800 flex items-center justify-center transition-all duration-500 absolute inset-0 ${
                isLogoToggled ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              } group-hover:opacity-100 group-hover:scale-100`}
            >
              <FolderSymlink className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wide truncate">
                Drive Photo Selector
              </h1>
              <button
                type="button"
                onClick={onOpenWelcome}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/80 hover:border-rose-600 rounded-lg shadow-inner transition-all cursor-pointer group"
                title="Lihat Pesan Sambutan Founder Kanda Althof Azzuhdy, S.T."
              >
                <img 
                  src="/logo-horizontal-putih.svg" 
                  alt="KandaFV Logo" 
                  className="h-3.5 sm:h-4 w-auto object-contain group-hover:scale-105 transition-transform" 
                />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 truncate hidden xs:block">
              {activeCollectionTitle ? `Koleksi: ${activeCollectionTitle}` : 'Preview Foto Google Drive & Salin Nama File'}
            </p>
          </div>
        </div>

        {/* Stats & Touch Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {totalFiles > 0 && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-neutral-950 border border-red-950/80 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Image className="w-3.5 h-3.5 text-neutral-500" />
                <span>Total: <strong className="text-white font-bold">{totalFiles}</strong></span>
              </div>
              <span className="w-px h-3 bg-red-950" />
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulseRed" />
                <span>Terpilih: <strong className="text-white">{selectedCount}</strong></span>
              </div>
            </div>
          )}

          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-red-950/60 active:bg-red-900 text-white border border-red-950 hover:border-red-800 rounded-xl transition-all shadow-sm"
            title="Pilih Koleksi Sample"
          >
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span className="hidden xs:inline">Sample Album</span>
          </button>

          {totalFiles > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 min-h-[38px] px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-xl transition-colors"
              title="Reset Galeri"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

