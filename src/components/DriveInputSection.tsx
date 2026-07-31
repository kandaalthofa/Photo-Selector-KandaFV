import React, { useState } from 'react';
import { Link2, Sparkles, FileText, AlertCircle, Loader2, Bookmark, CheckCircle2 } from 'lucide-react';
import { DEMO_PRESETS } from '../data/presets';
import { DriveFile, PresetCollection } from '../types';

interface DriveInputSectionProps {
  onFilesLoaded: (files: DriveFile[], sourceTitle?: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const DriveInputSection: React.FC<DriveInputSectionProps> = ({
  onFilesLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'folder' | 'batch' | 'demo'>('folder');
  const [folderInput, setFolderInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle parse folder link submit
  const handleParseFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folderInput.trim()) {
      setErrorMessage('Silakan masukkan link folder Google Drive.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/parse-drive-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrId: folderInput.trim() }),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          !res.ok 
            ? `Server mengembalikan status ${res.status} (Halaman HTML/Teks). Pastikan server berjalan.` 
            : 'Format respons server tidak valid (bukan JSON).'
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengambil isi folder.');
      }

      if (!data.files || data.files.length === 0) {
        setErrorMessage('Folder ditemukan, namun tidak ada foto atau gambar publik di dalamnya. Pastikan folder berisi foto dan diset publik.');
        return;
      }

      onFilesLoaded(data.files, data.folderName || 'Folder Google Drive');
      setSuccessMessage(`Berhasil memuat ${data.files.length} foto dari folder Google Drive!`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch text / multiline links parse
  const handleParseBatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!batchInput.trim()) {
      setErrorMessage('Silakan tempel teks atau daftar link Google Drive.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/parse-drive-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batchInput.trim() }),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          !res.ok 
            ? `Server mengembalikan status ${res.status} (Halaman HTML/Teks). Pastikan server berjalan.` 
            : 'Format respons server tidak valid (bukan JSON).'
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengekstrak ID file Google Drive dari teks.');
      }

      onFilesLoaded(data.files, 'Daftar Link Pengguna');
      setSuccessMessage(`Berhasil mengekstrak ${data.files.length} foto dari teks!`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan saat memproses link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample preset
  const handleSelectPreset = (preset: PresetCollection) => {
    setErrorMessage(null);
    setSuccessMessage(`Memuat sampel album "${preset.title}" (${preset.files.length} foto)`);
    onFilesLoaded(preset.files, preset.title);
  };

  return (
    <div className="bg-neutral-950 border border-red-950/80 rounded-2xl shadow-2xl shadow-red-950/20 p-4 sm:p-6 mb-6 sm:mb-8 transition-all">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-red-950/80 pb-3.5 mb-4 sm:mb-5 flex-wrap gap-2.5">
        <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-neutral-900 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { setActiveTab('folder'); setErrorMessage(null); }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 flex-1 sm:flex-initial ${
              activeTab === 'folder'
                ? 'bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white shadow-md shadow-red-950/60 border border-red-700/80'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Link2 className="w-4 h-4 text-rose-400" />
            <span className="whitespace-nowrap">Link Folder Drive</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('batch'); setErrorMessage(null); }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 flex-1 sm:flex-initial ${
              activeTab === 'batch'
                ? 'bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white shadow-md shadow-red-950/60 border border-red-700/80'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span className="whitespace-nowrap">Multi Link / Teks</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMessage(null); }}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] shrink-0 flex-1 sm:flex-initial ${
              activeTab === 'demo'
                ? 'bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white shadow-md shadow-red-950/60 border border-red-700/80'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span className="whitespace-nowrap">Sample Album</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 hidden lg:flex">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Otomatis ekstrak foto & konversi ke galeri interaktif</span>
        </div>
      </div>

      {/* Tab 1: Folder Link Input */}
      {activeTab === 'folder' && (
        <form onSubmit={handleParseFolder} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-200 mb-1.5">
              Link Folder Google Drive (Akses Publik):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="url"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Contoh: https://drive.google.com/drive/folders/1A2b3C4d5E..."
                className="flex-1 px-4 py-3 bg-black border border-neutral-800 focus:border-red-700 focus:ring-1 focus:ring-red-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-600 transition-all outline-none min-h-[44px]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-3 bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50 min-h-[44px] shrink-0 active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Prosesing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-rose-300" />
                    <span>Buka Galeri Preview</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span>💡 Pengingat: Pastikan folder Google Drive disetel "Siapa saja yang memiliki link".</span>
            </p>
          </div>
        </form>
      )}

      {/* Tab 2: Batch Paste Text */}
      {activeTab === 'batch' && (
        <form onSubmit={handleParseBatch} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-200 mb-1.5">
              Tempelkan pesan WhatsApp, email, atau daftar link Google Drive:
            </label>
            <textarea
              rows={4}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Contoh:
Foto_001.jpg - https://drive.google.com/file/d/1A2b3C4d5E...
https://drive.google.com/open?id=1X2Y3Z...
Foto_wedding_02.png https://drive.google.com/file/d/1B2C3D..."
              className="w-full p-3.5 bg-black border border-neutral-800 focus:border-red-700 focus:ring-1 focus:ring-red-700 rounded-xl text-xs font-mono text-neutral-200 placeholder-neutral-600 transition-all outline-none leading-relaxed"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400">
              Sistem akan mengekstrak ID file foto dari pesan teks secara otomatis.
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50 min-h-[44px] active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Prosesing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  <span>Ekstrak Foto</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Sample Demo Presets */}
      {activeTab === 'demo' && (
        <div>
          <p className="text-xs text-neutral-300 mb-3 font-medium">
            Pilih sampel album untuk mencoba fitur pratinjau galeri & salin list nama foto:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="group text-left p-3.5 bg-black hover:bg-red-950/40 border border-neutral-800 hover:border-red-800/80 rounded-xl transition-all min-h-[44px]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                    {preset.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-red-950 text-rose-300 rounded-md font-mono border border-red-900/60">
                    {preset.files.length} Foto
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
