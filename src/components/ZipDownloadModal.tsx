import React, { useState } from 'react';
import { 
  X, 
  Archive, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileCheck, 
  Sparkles,
  FolderArchive
} from 'lucide-react';
import JSZip from 'jszip';
import { DriveFile } from '../types';

interface ZipDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DriveFile[];
  selectedFiles: DriveFile[];
  collectionTitle?: string;
  onShowToast: (msg: string) => void;
}

export const ZipDownloadModal: React.FC<ZipDownloadModalProps> = ({
  isOpen,
  onClose,
  files,
  selectedFiles,
  collectionTitle,
  onShowToast
}) => {
  const [downloadScope, setDownloadScope] = useState<'selected' | 'all'>(
    selectedFiles.length > 0 ? 'selected' : 'all'
  );

  const defaultZipName = (collectionTitle || 'KandaFV_Koleksi_Foto')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .concat('.zip');

  const [zipFileName, setZipFileName] = useState<string>(defaultZipName);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStatusText, setCurrentStatusText] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalTargetCount, setTotalTargetCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const targetFiles = downloadScope === 'selected' ? selectedFiles : files;

  const handleStartZipDownload = async () => {
    if (targetFiles.length === 0) {
      onShowToast('Tidak ada foto yang tersedia untuk diunduh.');
      return;
    }

    setIsDownloading(true);
    setIsCompleted(false);
    setProgressPercent(0);
    setProcessedCount(0);
    setErrorCount(0);
    setTotalTargetCount(targetFiles.length);
    setCurrentStatusText('Mempersiapkan pengunduhan foto...');

    const zip = new JSZip();
    let downloadedFilesCount = 0;
    let failedFilesCount = 0;

    const folderNameInZip = (collectionTitle || 'KandaFV_Photos').replace(/[^a-zA-Z0-9_-]/g, '_');
    const zipFolder = zip.folder(folderNameInZip) || zip;

    for (let i = 0; i < targetFiles.length; i++) {
      const file = targetFiles[i];
      const filename = file.name || `photo_${i + 1}.jpg`;
      setCurrentStatusText(`Unduh [${i + 1}/${targetFiles.length}]: ${filename}`);

      try {
        // Try proxy or direct thumbnail URL
        const fetchUrl = file.id 
          ? `/api/proxy-image?id=${file.id}` 
          : file.thumbnailUrl || file.directUrl;

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        zipFolder.file(filename, blob);
        downloadedFilesCount++;
      } catch (err) {
        console.warn(`Gagal mengunduh foto ${filename}:`, err);
        failedFilesCount++;
      }

      setProcessedCount(i + 1);
      setErrorCount(failedFilesCount);
      const currentProgress = Math.round(((i + 1) / targetFiles.length) * 85); // 85% for downloading
      setProgressPercent(currentProgress);
    }

    if (downloadedFilesCount === 0) {
      setIsDownloading(false);
      onShowToast('Gagal mengunduh file foto. Periksa koneksi internet Anda.');
      return;
    }

    // Generate ZIP file
    setCurrentStatusText('Mengompresi semua foto menjadi file ZIP...');
    setProgressPercent(90);

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        const zipCompressPercent = 85 + Math.round((metadata.percent / 100) * 15);
        setProgressPercent(zipCompressPercent);
      });

      // Trigger browser download
      const safeName = zipFileName.endsWith('.zip') ? zipFileName : `${zipFileName}.zip`;
      const downloadUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = safeName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      setProgressPercent(100);
      setIsDownloading(false);
      setIsCompleted(true);
      setCurrentStatusText('Selesai! File ZIP berhasil diunduh.');
      onShowToast(`File ${safeName} berhasil diunduh!`);
    } catch (err) {
      console.error('Gagal membuat ZIP archive:', err);
      setIsDownloading(false);
      onShowToast('Gagal memproses arsip ZIP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-lg w-full bg-neutral-950 border border-red-950/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-red-950/80 text-white space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-rose-400 shrink-0">
              <Archive className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Unduh Foto Paket ZIP
              </h3>
              <p className="text-[11px] text-neutral-400">
                Gabungkan dan unduh beberapa foto sekaligus
              </p>
            </div>
          </div>

          {!isDownloading && (
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Option Selectors */}
        {!isDownloading && !isCompleted && (
          <div className="space-y-4">
            
            {/* Scope Selection */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-2 block">
                Pilih Cakupan Foto Yang Diunduh:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDownloadScope('selected')}
                  disabled={selectedFiles.length === 0}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    downloadScope === 'selected'
                      ? 'bg-red-950/80 border-rose-600 text-white ring-1 ring-rose-500'
                      : selectedFiles.length === 0
                      ? 'bg-neutral-900/50 border-neutral-800/50 text-neutral-600 cursor-not-allowed'
                      : 'bg-black border-neutral-800 text-neutral-300 hover:border-red-900'
                  }`}
                >
                  <span className="text-xs font-bold block">Foto Terpilih</span>
                  <span className="text-[11px] text-rose-300 font-mono mt-1">
                    {selectedFiles.length} Foto
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadScope('all')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    downloadScope === 'all'
                      ? 'bg-red-950/80 border-rose-600 text-white ring-1 ring-rose-500'
                      : 'bg-black border-neutral-800 text-neutral-300 hover:border-red-900'
                  }`}
                >
                  <span className="text-xs font-bold block">Semua Foto</span>
                  <span className="text-[11px] text-rose-300 font-mono mt-1">
                    {files.length} Foto
                  </span>
                </button>
              </div>
            </div>

            {/* Filename Input */}
            <div>
              <label className="text-xs font-bold text-neutral-300 mb-1.5 block">
                Nama File ZIP:
              </label>
              <div className="relative">
                <FolderArchive className="w-4 h-4 text-rose-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={zipFileName}
                  onChange={(e) => setZipFileName(e.target.value)}
                  placeholder="KandaFV_Photos.zip"
                  className="w-full pl-9 pr-3 py-2.5 bg-black border border-neutral-800 focus:border-red-600 rounded-xl text-xs text-white placeholder-neutral-600 outline-none"
                />
              </div>
            </div>

            {/* Summary Notice */}
            <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Sistem akan mengunduh <strong>{targetFiles.length} foto</strong> melalui proxy berkecepatan tinggi dan dikompresi dalam satu arsip ZIP resmi KandaFV.
              </span>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartZipDownload}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-red-700 shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-rose-300" />
              <span>Mulai Unduh File ZIP ({targetFiles.length} Foto)</span>
            </button>
          </div>
        )}

        {/* Downloading Progress Screen */}
        {isDownloading && (
          <div className="py-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-700 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-red-950/80 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Proses Mengunduh & Kompresi ZIP</h4>
              <p className="text-xs text-neutral-400 mt-1 truncate px-4 font-mono">
                {currentStatusText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 px-2">
              <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-red-800 via-rose-600 to-red-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>{processedCount} dari {totalTargetCount} foto</span>
                <span className="text-rose-400 font-bold">{progressPercent}%</span>
              </div>
            </div>

            {errorCount > 0 && (
              <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                Peringatan: {errorCount} foto lewati karena tidak merespons.
              </p>
            )}
          </div>
        )}

        {/* Completion Screen */}
        {isCompleted && (
          <div className="py-4 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">Unduhan Selesai!</h4>
              <p className="text-xs text-neutral-300 mt-1">
                File <strong>{zipFileName}</strong> telah otomatis diunduh ke perangkat Anda.
              </p>
            </div>

            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs text-neutral-400 font-mono">
              Total Foto Dalam ZIP: <strong className="text-emerald-400">{processedCount - errorCount}</strong> / {totalTargetCount}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all cursor-pointer"
            >
              Tutup Jendela
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
