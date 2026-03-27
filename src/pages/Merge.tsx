import React from 'react';
import { DropZone } from '@/src/components/pdf/DropZone';
import { PageOrganizer } from '@/src/components/pdf/PageOrganizer';
import { MergeSettings } from '@/src/components/pdf/MergeSettings';
import { useMergeStore } from '@/src/store/useMergeStore';
import { motion } from 'motion/react';
import { Files } from 'lucide-react';

export function Merge() {
  const { files } = useMergeStore();

  return (
    <div className="responsive-container py-16 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <Files className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Merge PDF Files</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Upload your PDFs, organize pages, and download your merged file in seconds.
          Fast, secure, and completely free.
        </p>
      </motion.div>

      <section className="space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <DropZone />
        </motion.div>
        
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#F8FAFC] px-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Organize Pages</span>
              </div>
            </div>
            
            <PageOrganizer />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#F8FAFC] px-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Final Settings</span>
              </div>
            </div>
            
            <MergeSettings />
          </motion.div>
        )}
      </section>
    </div>
  );
}
