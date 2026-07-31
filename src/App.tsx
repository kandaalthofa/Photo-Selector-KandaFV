import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DriveInputSection } from './components/DriveInputSection';
import { GalleryHeader } from './components/GalleryHeader';
import { PhotoCard } from './components/PhotoCard';
import { CopyModal } from './components/CopyModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { ZipDownloadModal } from './components/ZipDownloadModal';
import { NotificationToast } from './components/NotificationToast';
import { SplashWelcomeScreen } from './components/SplashWelcomeScreen';
import { DEMO_PRESETS } from './data/presets';
import { DriveFile } from './types';
import { Image, FolderSymlink, Sparkles, AlertCircle, Copy, Bookmark, CheckSquare, Archive } from 'lucide-react';

export default function App() {
  // Splash & Welcome Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Main State
  const [files, setFiles] = useState<DriveFile[]>(DEMO_PRESETS[0].files);
  const [activeCollectionTitle, setActiveCollectionTitle] = useState<string>(DEMO_PRESETS[0].title);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['1A_wedding_01', '1A_wedding_03', '1A_wedding_05']));
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'unselected'>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'standard' | 'large' | 'list'>('standard');

  // Modals & UI State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [lightboxFile, setLightboxFile] = useState<DriveFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle files loaded from URL parser or presets
  const handleFilesLoaded = (newFiles: DriveFile[], title?: string) => {
    setFiles(newFiles);
    setActiveCollectionTitle(title || 'Daftar Foto Google Drive');
    // Default select all or empty
    setSelectedIds(new Set());
    setSearchQuery('');
    setFilterMode('all');
  };

  // Toggle selection for a single file ID
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all visible / total files
  const handleSelectAll = () => {
    const allIds = files.map((f) => f.id);
    setSelectedIds(new Set(allIds));
    showToast(`Memilih semua (${allIds.length}) foto.`);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Invert current selection
  const handleInvertSelection = () => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      files.forEach((f) => {
        if (!prev.has(f.id)) {
          next.add(f.id);
        }
      });
      return next;
    });
    showToast('Pilihan foto dibalikkan.');
  };

  // Filtered files list computation
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Search query check
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      // Filter mode check
      if (filterMode === 'selected') return selectedIds.has(file.id);
      if (filterMode === 'unselected') return !selectedIds.has(file.id);

      return true;
    });
  }, [files, searchQuery, filterMode, selectedIds]);

  // Selected files array
  const selectedFilesList = useMemo(() => {
    return files.filter((f) => selectedIds.has(f.id));
  }, [files, selectedIds]);

  // Lightbox navigation handlers
  const handleLightboxNavigate = (direction: 'next' | 'prev') => {
    if (!lightboxFile) return;
    const currentIndex = files.findIndex((f) => f.id === lightboxFile.id);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= files.length) targetIndex = 0;
    if (targetIndex < 0) targetIndex = files.length - 1;

    setLightboxFile(files[targetIndex]);
  };

  // Reset to empty state
  const handleReset = () => {
    setFiles([]);
    setSelectedIds(new Set());
    setActiveCollectionTitle('');
    setSearchQuery('');
  };

  // Grid columns styling depending on viewMode
  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'compact':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5';
      case 'large':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6';
      case 'list':
        return 'space-y-2';
      case 'standard':
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4';
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-900 selection:text-white">
      
      {/* Splash Welcome Screen Overlay */}
      {showSplash && (
        <SplashWelcomeScreen onEnter={() => setShowSplash(false)} />
      )}

      {/* Top Header Navbar */}
      <Navbar
        totalFiles={files.length}
        selectedCount={selectedIds.size}
        onOpenPresets={() => {
          handleFilesLoaded(DEMO_PRESETS[0].files, DEMO_PRESETS[0].title);
          showToast('Memuat album sampel demo.');
        }}
        onReset={handleReset}
        onOpenWelcome={() => setShowSplash(true)}
        activeCollectionTitle={activeCollectionTitle}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        
        {/* Drive URL / Batch Link Input Section */}
        <DriveInputSection
          onFilesLoaded={handleFilesLoaded}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Gallery Control Bar */}
        {files.length > 0 && (
          <GalleryHeader
            totalCount={files.length}
            selectedCount={selectedIds.size}
            filteredCount={filteredFiles.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onInvertSelection={handleInvertSelection}
            onCopySelected={() => setIsCopyModalOpen(true)}
            onOpenZipModal={() => setIsZipModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}

        {/* Photo Gallery Grid */}
        {files.length > 0 ? (
          filteredFiles.length > 0 ? (
            <div className={gridClasses}>
              {filteredFiles.map((file) => (
                <PhotoCard
                  key={file.id}
                  file={file}
                  isSelected={selectedIds.has(file.id)}
                  onToggleSelect={handleToggleSelect}
                  onOpenLightbox={(f) => setLightboxFile(f)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-neutral-950/80 border border-red-950/80 rounded-3xl p-8">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">
                Tidak ada foto yang sesuai dengan pencarian
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Coba sesuaikan kata kunci pencarian atau ubah filter status foto.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterMode('all'); }}
                className="mt-4 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white rounded-xl transition-colors border border-neutral-800"
              >
                Reset Filter
              </button>
            </div>
          )
        ) : (
          /* Empty State when no folder loaded */
          <div className="text-center py-16 sm:py-20 bg-neutral-950/80 border border-dashed border-red-950/90 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-950 text-rose-400 border border-red-800/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FolderSymlink className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Belum Ada Album Terbuka
            </h2>
            <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
              Masukkan link folder Google Drive publik atau tempelkan daftar link foto pada form di atas untuk menampilkan galeri foto.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleFilesLoaded(DEMO_PRESETS[0].files, DEMO_PRESETS[0].title)}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-950/60 min-h-[44px]"
              >
                Coba Album Pernikahan
              </button>
              <button
                type="button"
                onClick={() => handleFilesLoaded(DEMO_PRESETS[1].files, DEMO_PRESETS[1].title)}
                className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all border border-neutral-800 min-h-[44px]"
              >
                Coba Katalog Produk
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Action Bar for Phone & Tablet */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:hidden z-30 animate-slideUp">
          <div className="bg-neutral-950/95 border border-red-800/90 backdrop-blur-2xl p-3 rounded-2xl shadow-2xl shadow-red-950/90 flex items-center justify-between gap-2">
            <div className="pl-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {selectedIds.size} Foto Terpilih
              </p>
              <p className="text-[10px] text-rose-400 truncate">Siap diunduh / disalin</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsZipModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-rose-300 text-xs font-bold rounded-xl border border-red-900/80 min-h-[42px] cursor-pointer"
                title="Unduh Paket ZIP"
              >
                <Archive className="w-4 h-4 text-rose-400" />
                <span>ZIP</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/60 border border-red-700/80 min-h-[42px] cursor-pointer"
              >
                <Copy className="w-4 h-4 text-rose-200" />
                <span>Salin Nama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zip Download Modal */}
      <ZipDownloadModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        files={files}
        selectedFiles={selectedFilesList}
        collectionTitle={activeCollectionTitle}
        onShowToast={showToast}
      />

      {/* Copy Format Modal */}
      <CopyModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        selectedFiles={selectedFilesList}
        onShowToast={showToast}
      />

      {/* Lightbox Fullscreen Modal */}
      <PhotoLightboxModal
        isOpen={!!lightboxFile}
        onClose={() => setLightboxFile(null)}
        currentFile={lightboxFile}
        filesList={files}
        isSelected={lightboxFile ? selectedIds.has(lightboxFile.id) : false}
        onToggleSelect={handleToggleSelect}
        onNavigate={handleLightboxNavigate}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-red-950/60 py-6 text-center text-xs text-neutral-400 bg-black">
        <p>© Copyright KandaFV. All rights reserved.</p>
      </footer>

    </div>
  );
}

