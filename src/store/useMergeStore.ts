import { create } from 'zustand';

export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnail?: string;
}

export interface PDFPage {
  id: string; // unique id for dnd
  fileId: string;
  pageIndex: number;
  rotation: number;
  isDeleted: boolean;
  thumbnail?: string;
}

interface MergeState {
  files: PDFFile[];
  pages: PDFPage[];
  isProcessing: boolean;
  outputFileName: string;
  
  addFiles: (newFiles: PDFFile[], newPages: PDFPage[]) => void;
  removeFile: (fileId: string) => void;
  updatePageOrder: (newPages: PDFPage[]) => void;
  rotatePage: (pageId: string, direction: 'left' | 'right') => void;
  toggleDeletePage: (pageId: string) => void;
  setProcessing: (status: boolean) => void;
  setOutputFileName: (name: string) => void;
  reset: () => void;
}

export const useMergeStore = create<MergeState>((set) => ({
  files: [],
  pages: [],
  isProcessing: false,
  outputFileName: 'merged.pdf',

  addFiles: (newFiles, newPages) => set((state) => ({
    files: [...state.files, ...newFiles],
    pages: [...state.pages, ...newPages]
  })),

  removeFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId),
    pages: state.pages.filter(p => p.fileId !== fileId)
  })),

  updatePageOrder: (newPages) => set({ pages: newPages }),

  rotatePage: (pageId, direction) => set((state) => ({
    pages: state.pages.map(p => {
      if (p.id !== pageId) return p;
      const rotation = (p.rotation + (direction === 'right' ? 90 : -90) + 360) % 360;
      return { ...p, rotation };
    })
  })),

  toggleDeletePage: (pageId) => set((state) => ({
    pages: state.pages.map(p => p.id === pageId ? { ...p, isDeleted: !p.isDeleted } : p)
  })),

  setProcessing: (status) => set({ isProcessing: status }),
  
  setOutputFileName: (name) => set({ outputFileName: name }),

  reset: () => set({ files: [], pages: [], isProcessing: false, outputFileName: 'merged.pdf' })
}));
