import React, { useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Copy, 
  ExternalLink, 
  Download,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { DriveFile } from '../types';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile: DriveFile | null;
  filesList: DriveFile[];
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onShowToast: (msg: string) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  currentFile,
  filesList,
  isSelected,
  onToggleSelect,
  onNavigate,
  onShowToast
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate('next');
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === ' ') {
        e.preventDefault();
        if (currentFile) onToggleSelect(currentFile.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentFile, onClose, onNavigate, onToggleSelect]);

  if (!isOpen || !currentFile) return null;

  const currentIndex = filesList.findIndex(f => f.id === currentFile.id);

  const handleCopyName = () => {
    navigator.clipboard.writeText(currentFile.name);
    setCopied(true);
    onShowToast(`Nama file "${currentFile.name}" tersalin!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-2xl animate-fadeIn">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs font-mono text-rose-300 bg-red-950/80 px-3 py-1 rounded-full border border-red-900/80 shrink-0">
            {currentIndex + 1} / {filesList.length}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-md">
            {currentFile.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Select Button in Lightbox */}
          <button
            type="button"
            onClick={() => onToggleSelect(currentFile.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg min-h-[40px] ${
              isSelected
                ? 'bg-gradient-to-r from-red-800 to-rose-900 border-red-600 text-white shadow-red-950/60'
                : 'bg-black/80 border-neutral-700 text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-white border-white text-red-900' : 'border-neutral-500'}`}>
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span className="hidden xs:inline">{isSelected ? 'Foto Dipilih' : 'Pilih Foto Ini'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Large Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-12">
        <img
          src={currentFile.thumbnailUrl}
          alt={currentFile.name}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-red-950/60"
        />

        {/* Prev / Next Nav Buttons */}
        <button
          type="button"
          onClick={() => onNavigate('prev')}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-red-950 text-white border border-neutral-800 hover:border-red-800 rounded-2xl shadow-2xl transition-all hover:scale-105 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Foto Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('next')}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-red-950 text-white border border-neutral-800 hover:border-red-800 rounded-2xl shadow-2xl transition-all hover:scale-105 min-w-[48px] min-h-[48px] flex items-center justify-center"
          title="Foto Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="text-neutral-400 text-center sm:text-left text-[11px]">
          <span>Spasi (Spacebar) untuk pilih/batal foto • Panah Kiri/Kanan untuk ganti foto</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyName}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-red-950 text-rose-300 border border-red-900/60 rounded-xl transition-colors min-h-[38px]"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>Salin Nama</span>
          </button>

          <a
            href={currentFile.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl transition-colors min-h-[38px]"
          >
            <ExternalLink className="w-4 h-4 text-rose-400" />
            <span>Buka Google Drive</span>
          </a>
        </div>
      </div>

    </div>
  );
};
