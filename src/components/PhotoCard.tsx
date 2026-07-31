import React, { useState } from 'react';
import { Check, Maximize2, ExternalLink, Image as ImageIcon, Copy, CheckCircle2 } from 'lucide-react';
import { DriveFile } from '../types';

interface PhotoCardProps {
  file: DriveFile;
  isSelected: boolean;
  onToggleSelect: (id: string, e?: React.MouseEvent) => void;
  onOpenLightbox: (file: DriveFile) => void;
  viewMode: 'compact' | 'standard' | 'large' | 'list';
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  file,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  viewMode,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);

  const handleCopySingleName = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.name);
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 2000);
  };

  // Render for List View mode
  if (viewMode === 'list') {
    return (
      <div
        onClick={(e) => onToggleSelect(file.id, e)}
        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-red-950/60 border-red-600/90 shadow-lg shadow-red-950/40 ring-1 ring-red-700'
            : 'bg-neutral-950/80 border-neutral-800 hover:border-red-900/80 hover:bg-neutral-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Checkbox */}
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
              isSelected
                ? 'bg-red-700 border-red-500 text-white shadow-md shadow-red-900/50'
                : 'border-neutral-700 bg-black group-hover:border-red-500'
            }`}
          >
            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
          </div>

          {/* Mini Thumbnail */}
          <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-neutral-800 shrink-0 relative">
            {!imageError ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black text-neutral-600">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-rose-200' : 'text-neutral-200'}`}>
              {file.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
              <span>{file.size || 'Google Drive Photo'}</span>
              {file.dimensions && <span>• {file.dimensions}</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopySingleName}
            className="p-2 text-neutral-400 hover:text-rose-300 hover:bg-red-950/60 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Salin Nama File Ini"
          >
            {copiedSingle ? <CheckCircle2 className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onOpenLightbox(file)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-red-950/60 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Zoom Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <a
            href={file.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-400 hover:text-white hover:bg-red-950/60 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Buka di Google Drive"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Render for Grid Modes (compact or standard)
  const isCompact = viewMode === 'compact';

  return (
    <div
      onClick={(e) => onToggleSelect(file.id, e)}
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${
        isSelected
          ? 'bg-neutral-950 border-red-600 shadow-2xl shadow-red-950/60 ring-2 ring-red-700/80'
          : 'bg-neutral-950/90 border-neutral-900 hover:border-red-900/80 hover:shadow-xl hover:shadow-red-950/30'
      }`}
    >
      {/* Thumbnail Aspect Box */}
      <div className={`relative w-full overflow-hidden bg-black ${isCompact ? 'aspect-square' : 'aspect-[4/3]'}`}>
        
        {!imageError ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black text-neutral-600 gap-1.5 p-2">
            <ImageIcon className="w-7 h-7 stroke-1" />
            <span className="text-[10px] text-center text-neutral-500">Preview Google Drive</span>
          </div>
        )}

        {/* Loading Spinner Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-black animate-pulse flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-neutral-800" />
          </div>
        )}

        {/* Top Checkbox Badge */}
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shadow-md ${
              isSelected
                ? 'bg-red-700 border-red-500 text-white scale-110 shadow-red-900/60'
                : 'bg-black/80 backdrop-blur border-neutral-700 text-neutral-400 group-hover:border-red-500 group-hover:bg-black'
            }`}
          >
            {isSelected ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-neutral-600 group-hover:bg-rose-500" />
            )}
          </div>
        </div>

        {/* Action Overlay Buttons (Hover or touch) */}
        <div 
          className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onOpenLightbox(file)}
            className="p-1.5 bg-black/90 backdrop-blur text-neutral-200 hover:text-white hover:bg-red-950 border border-neutral-800 rounded-lg shadow-md transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Lihat Foto Besar"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <a
            href={file.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-black/90 backdrop-blur text-neutral-200 hover:text-white hover:bg-red-950 border border-neutral-800 rounded-lg shadow-md transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Buka File di Drive"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Footer Title & Copy Quick Button */}
      <div className="p-2.5 sm:p-3 bg-black border-t border-neutral-900 flex items-center justify-between gap-2 mt-auto">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-bold truncate transition-colors ${
              isSelected ? 'text-rose-300' : 'text-neutral-200 group-hover:text-white'
            }`}
            title={file.name}
          >
            {file.name}
          </p>
          {!isCompact && (
            <span className="text-[10px] text-neutral-500 block mt-0.5 truncate font-mono">
              {file.size || 'Drive Photo'}
            </span>
          )}
        </div>

        <button
          onClick={handleCopySingleName}
          className={`p-1.5 rounded-lg border text-xs transition-all shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center ${
            copiedSingle
              ? 'bg-red-950 text-rose-300 border-red-800/80 shadow-sm'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-red-950/60'
          }`}
          title="Salin Nama File Ini"
        >
          {copiedSingle ? <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
