import React from 'react';
import { FileDown, Loader2, Settings2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMergeStore } from '@/src/store/useMergeStore';
import { mergePDFs } from '@/src/lib/pdfUtils';
import { auth, db } from '@/src/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export function MergeSettings() {
  const { pages, files, outputFileName, setOutputFileName, isProcessing, setProcessing } = useMergeStore();
  
  const activePages = pages.filter(p => !p.isDeleted);
  const canMerge = activePages.length > 0 && !isProcessing;

  const handleMerge = async () => {
    if (!canMerge) return;
    
    setProcessing(true);
    const loadingToast = toast.loading('Merging your PDFs...');

    try {
      const mergedBytes = await mergePDFs(files, pages);
      
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (auth.currentUser) {
        const jobData = {
          user_id: auth.currentUser.uid,
          file_count: files.length,
          page_count: activePages.length,
          file_names: files.map(f => f.name),
          output_filename: outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`,
          total_size_bytes: files.reduce((acc, f) => acc + f.size, 0),
          status: 'completed',
          created_at: new Date().toISOString(),
          timestamp: serverTimestamp(),
        };

        const jobRef = await addDoc(collection(db, 'merge_jobs'), jobData).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, 'merge_jobs');
          return null;
        });

        await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
          total_merges: increment(1),
          last_merge_at: new Date().toISOString(),
          last_merge_job_id: jobRef?.id || null,
        }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `profiles/${auth.currentUser.uid}`);
        });
      }

      toast.success('PDF merged successfully!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to merge PDFs. Please try again.', { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 shadow-xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Settings2 className="h-24 w-24 text-primary" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Merge Configuration</h3>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="filename" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Output Filename
            </label>
            <div className="relative">
              <input
                id="filename"
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="merged.pdf"
                className="input-field pl-4 pr-12 py-3 text-lg font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                .pdf
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-px lg:h-24 bg-slate-200" />

        <div className="flex flex-col items-center lg:items-end space-y-4 min-w-[240px]">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {activePages.length} pages to merge
          </div>
          
          <button
            onClick={handleMerge}
            disabled={!canMerge}
            className={cn(
              "btn-primary w-full py-4 px-8 flex items-center justify-center gap-3 text-lg",
              !canMerge && "opacity-50 cursor-not-allowed grayscale"
            )}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileDown className="h-6 w-6" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Merge PDF Now'}</span>
          </button>
          
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center lg:text-right">
            Secure browser-side processing
          </p>
        </div>
      </div>
    </motion.div>
  );
}
