import React from 'react';
import { 
  CheckSquare, 
  Square, 
  Copy, 
  Search, 
  Grid2X2, 
  Grid3X3, 
  List, 
  Filter, 
  RotateCcw,
  Sparkles,
  Download,
  Archive
} from 'lucide-react';

interface GalleryHeaderProps {
  totalCount: number;
  selectedCount: number;
  filteredCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onCopySelected: () => void;
  onOpenZipModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterMode: 'all' | 'selected' | 'unselected';
  setFilterMode: (mode: 'all' | 'selected' | 'unselected') => void;
  viewMode: 'compact' | 'standard' | 'large' | 'list';
  setViewMode: (mode: 'compact' | 'standard' | 'large' | 'list') => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  totalCount,
  selectedCount,
  filteredCount,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onCopySelected,
  onOpenZipModal,
  searchQuery,
  setSearchQuery,
  filterMode,
  setFilterMode,
  viewMode,
  setViewMode,
}) => {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="bg-black/95 backdrop-blur-xl border border-red-950/90 rounded-2xl p-3 sm:p-5 mb-5 space-y-3.5 shadow-2xl shadow-red-950/30 sticky top-16 z-20 transition-all">
      
      {/* Top Row: Quick Selection Controls & Primary Copy / Download Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Quick selection buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-red-950/60 active:bg-red-900 text-white border border-neutral-800 hover:border-red-900 rounded-xl text-xs font-semibold transition-all min-h-[40px]"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-rose-400" />
            ) : (
              <Square className="w-4 h-4 text-neutral-400" />
            )}
            <span>{isAllSelected ? 'Batal Semua' : 'Pilih Semua'}</span>
          </button>

          {selectedCount > 0 && (
            <button
              onClick={onDeselectAll}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 rounded-xl transition-colors min-h-[40px]"
              title="Hapus Pilihan"
            >
              <span>Hapus Pilihan</span>
            </button>
          )}

          <button
            onClick={onInvertSelection}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-medium transition-colors min-h-[40px]"
            title="Balikkan Pilihan Foto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xs:inline">Balikkan</span>
          </button>

          <div className="text-xs text-neutral-400 ml-1">
            Terpilih: <strong className="text-rose-400 font-bold">{selectedCount}</strong> / {totalCount}
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS: COPY NAMES & DOWNLOAD ZIP */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* DOWNLOAD ZIP BUTTON */}
          <button
            onClick={onOpenZipModal}
            disabled={totalCount === 0}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg min-h-[44px] cursor-pointer ${
              totalCount > 0
                ? 'bg-neutral-900 hover:bg-red-950/90 text-rose-300 hover:text-white border border-red-900/80 hover:border-red-600 active:scale-95'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
            title="Unduh Paket Foto Terpilih / Semua dalam File ZIP"
          >
            <Archive className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Unduh ZIP</span>
          </button>

          {/* PRIMARY COPY BUTTON */}
          <button
            onClick={onCopySelected}
            disabled={selectedCount === 0}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xl min-h-[44px] cursor-pointer ${
              selectedCount > 0
                ? 'bg-gradient-to-r from-red-800 via-rose-900 to-red-950 hover:from-red-700 hover:to-rose-800 text-white border border-red-700/80 shadow-red-950/60 active:scale-95'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Copy className="w-4 h-4 text-rose-300" />
            <span>Salin Nama ({selectedCount})</span>
          </button>
        </div>

      </div>

      {/* Bottom Row: Search, Filter Tabs, View Layout Toggles */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-3 border-t border-red-950/60">
        
        {/* Search input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama foto (misal: WEDDING_01)..."
            className="w-full pl-9 pr-3 py-2 bg-black border border-neutral-800 focus:border-red-700 focus:ring-1 focus:ring-red-700 rounded-xl text-xs text-white placeholder-neutral-600 outline-none min-h-[38px]"
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
          {/* Filter selector */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-neutral-900 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                filterMode === 'all'
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('selected')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                filterMode === 'selected'
                  ? 'bg-red-950 text-rose-300 font-bold border border-red-800/80 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dipilih ({selectedCount})
            </button>
            <button
              onClick={() => setFilterMode('unselected')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px] ${
                filterMode === 'unselected'
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Belum ({totalCount - selectedCount})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-neutral-900 text-xs">
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center ${viewMode === 'compact' ? 'bg-red-950 text-rose-300 border border-red-900/60' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Grid Ringkas (Banyak Foto)"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`p-2 rounded-lg transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center ${viewMode === 'standard' ? 'bg-red-950 text-rose-300 border border-red-900/60' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Grid Standar"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center ${viewMode === 'list' ? 'bg-red-950 text-rose-300 border border-red-900/60' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Mode List Detail"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

