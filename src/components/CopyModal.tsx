import React, { useState, useMemo } from 'react';
import { Copy, Check, X, Download, FileText, CheckCircle2, Sliders, Layers } from 'lucide-react';
import { DriveFile, ExportFormat } from '../types';

interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: DriveFile[];
  onShowToast: (message: string) => void;
}

export const CopyModal: React.FC<CopyModalProps> = ({
  isOpen,
  onClose,
  selectedFiles,
  onShowToast,
}) => {
  const [format, setFormat] = useState<ExportFormat>('plain');
  const [stripExtension, setStripExtension] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('');
  const [customSuffix, setCustomSuffix] = useState('');
  const [includeDriveUrl, setIncludeDriveUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate formatted text output based on chosen options
  const formattedText = useMemo(() => {
    if (selectedFiles.length === 0) return '';

    const processedNames = selectedFiles.map((file) => {
      let name = file.name;

      if (stripExtension) {
        name = name.replace(/\.[^/.]+$/, '');
      }

      if (customPrefix) {
        name = `${customPrefix}${name}`;
      }

      if (customSuffix) {
        name = `${name}${customSuffix}`;
      }

      if (includeDriveUrl) {
        return `${name} - ${file.driveUrl}`;
      }

      return name;
    });

    switch (format) {
      case 'bullet':
        return processedNames.map((n) => `• ${n}`).join('\n');
      case 'comma':
        return processedNames.join(', ');
      case 'numbered':
        return processedNames.map((n, i) => `${i + 1}. ${n}`).join('\n');
      case 'clean':
        return selectedFiles.map((f) => f.name.replace(/\.[^/.]+$/, '')).join('\n');
      case 'json':
        return JSON.stringify(processedNames, null, 2);
      case 'csv':
        return `No,Nama File,Link Google Drive\n` + selectedFiles.map((f, i) => `${i + 1},"${f.name}","${f.driveUrl}"`).join('\n');
      case 'plain':
      default:
        return processedNames.join('\n');
    }
  }, [selectedFiles, format, stripExtension, customPrefix, customSuffix, includeDriveUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    onShowToast(`Berhasil menyalin ${selectedFiles.length} nama file!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Drive_Selected_Photos_${selectedFiles.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('File TXT berhasil diunduh!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border border-red-950/90 rounded-3xl w-full max-w-2xl shadow-2xl shadow-red-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-red-950/80 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-rose-300 border border-red-800/80 flex items-center justify-center shrink-0 shadow-md">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Salin List Nama File
              </h3>
              <p className="text-xs text-neutral-400">
                {selectedFiles.length} foto terpilih siap disalin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Format Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Format Teks Hasil Salinan:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormat('plain')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'plain'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                1 Baris 1 File
              </button>
              <button
                type="button"
                onClick={() => setFormat('bullet')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'bullet'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                • Poin (Bullet)
              </button>
              <button
                type="button"
                onClick={() => setFormat('numbered')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'numbered'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                1. Nomor Urut
              </button>
              <button
                type="button"
                onClick={() => setFormat('comma')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'comma'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                Pisah Koma (,)
              </button>
              <button
                type="button"
                onClick={() => setFormat('clean')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'clean'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                Tanpa (.jpg / .png)
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'csv'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                Tabel CSV (Excel)
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all min-h-[40px] ${
                  format === 'json'
                    ? 'bg-red-950 border-red-700 text-rose-200 font-bold shadow-md shadow-red-950/50'
                    : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                JSON Array
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-black border border-neutral-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={stripExtension}
                  onChange={(e) => setStripExtension(e.target.checked)}
                  className="rounded border-neutral-700 text-red-600 focus:ring-red-500 bg-neutral-900 w-4 h-4"
                />
                <span>Hapus Ekstensi File (.jpg / .png)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={includeDriveUrl}
                  onChange={(e) => setIncludeDriveUrl(e.target.checked)}
                  className="rounded border-neutral-700 text-red-600 focus:ring-red-500 bg-neutral-900 w-4 h-4"
                />
                <span>Sertakan Link Google Drive</span>
              </label>
            </div>
          </div>

          {/* Textarea Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-200">
                Pratinjau Hasil:
              </label>
              <span className="text-[11px] text-rose-400 font-mono">
                {formattedText.split('\n').length} Baris
              </span>
            </div>
            <textarea
              readOnly
              rows={7}
              value={formattedText}
              className="w-full p-3.5 bg-black border border-neutral-800 rounded-2xl text-xs font-mono text-rose-300 focus:outline-none leading-relaxed"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-red-950/80 bg-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-xl transition-all min-h-[44px]"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Unduh .TXT</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-neutral-400 hover:text-white text-xs font-medium rounded-xl transition-colors min-h-[44px]"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xl min-h-[44px] cursor-pointer ${
                copied
                  ? 'bg-red-800 text-white shadow-red-950/60'
                  : 'bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white shadow-red-950/60 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-200" />
                  <span>Salin ke Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

