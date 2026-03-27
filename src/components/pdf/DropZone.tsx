import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMergeStore } from '@/src/store/useMergeStore';
import { getPDFMetadata, generateThumbnail } from '@/src/lib/pdfUtils';
import { cn } from '@/src/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';

export function DropZone() {
  const { addFiles, files, removeFile } = useMergeStore();
  const [isUploading, setIsUploading] = React.useState(false);
  const [settings, setSettings] = React.useState({
    max_file_size_mb: 50,
    max_files_per_merge: 20,
  });

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'system_settings', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'system_settings/main');
      }
    );
    return () => unsubscribe();
  }, []);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (files.length + acceptedFiles.length > settings.max_files_per_merge) {
      toast.error(`Maximum ${settings.max_files_per_merge} files allowed.`);
      return;
    }
    
    setIsUploading(true);
    const loadingToast = toast.loading('Processing PDF files...');

    try {
      const newFiles = [];
      const newPages = [];

      for (const file of acceptedFiles) {
        if (file.size > settings.max_file_size_mb * 1024 * 1024) {
          toast.error(`${file.name} exceeds ${settings.max_file_size_mb}MB limit.`);
          continue;
        }

        const fileId = Math.random().toString(36).substring(7);
        const { pageCount, pdfDoc } = await getPDFMetadata(file);
        const thumbnail = await generateThumbnail(pdfDoc, 0);

        newFiles.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          thumbnail
        });

        for (let i = 0; i < pageCount; i++) {
          const pageThumbnail = await generateThumbnail(pdfDoc, i);
          newPages.push({
            id: `${fileId}-${i}`,
            fileId,
            pageIndex: i,
            rotation: 0,
            isDeleted: false,
            thumbnail: pageThumbnail
          });
        }
      }

      addFiles(newFiles, newPages);
      toast.success(`Added ${newFiles.length} files successfully.`, { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to process some PDF files.', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  }, [addFiles, files.length, settings]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: isUploading,
    multiple: true
  } as any);

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={cn(
          "relative group border-2 border-dashed rounded-3xl p-8 sm:p-16 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden",
          isDragActive 
            ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50/50",
          isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div 
          animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          className="relative z-10"
        >
          <div className={cn(
            "p-6 rounded-2xl mb-6 transition-colors duration-300",
            isDragActive ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
          )}>
            <Upload className="h-10 w-10" />
          </div>
        </motion.div>

        <div className="relative z-10 space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            {isDragActive ? "Drop your PDFs here" : "Drag & drop PDF files here"}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            or click to browse from your computer. We support multiple files at once.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            Max {settings.max_file_size_mb}MB per file
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Up to {settings.max_files_per_merge} files
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      </div>

      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {files.map((file, index) => (
              <motion.div 
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 flex items-center space-x-4 group relative overflow-hidden"
              >
                <div className="h-20 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-50">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {file.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; {file.pageCount} pages
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Progress bar simulation for added visual flair */}
                <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
