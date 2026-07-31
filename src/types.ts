export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string;
  directUrl: string;
  driveUrl: string;
  size?: string;
  selected: boolean;
  category?: string;
  dimensions?: string;
}

export interface ParseResult {
  success: boolean;
  folderId?: string;
  folderName?: string;
  files: DriveFile[];
  totalParsed: number;
  error?: string;
}

export type ExportFormat = 'plain' | 'bullet' | 'comma' | 'numbered' | 'json' | 'csv' | 'clean';

export interface PresetCollection {
  id: string;
  title: string;
  description: string;
  folderUrl: string;
  files: DriveFile[];
  category: string;
}

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}
