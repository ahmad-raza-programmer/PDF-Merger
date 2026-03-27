import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RotateCcw, RotateCw, Trash2, Undo2, FileText, GripVertical } from 'lucide-react';
import { useMergeStore, PDFPage } from '@/src/store/useMergeStore';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SortablePageProps {
  page: PDFPage;
  index: number;
}

function SortablePage({ page, index }: SortablePageProps) {
  const { rotatePage, toggleDeletePage } = useMergeStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-white border border-slate-200 rounded-2xl p-3 shadow-sm transition-all duration-300",
        isDragging && "shadow-2xl scale-105 ring-2 ring-primary/20 bg-slate-50",
        page.isDeleted && "opacity-40 grayscale"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing relative group/preview"
      >
        {page.thumbnail ? (
          <img 
            src={page.thumbnail} 
            alt={`Page ${index + 1}`} 
            className="h-full w-full object-contain transition-transform duration-300"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50">
            <FileText className="h-10 w-10 text-slate-300" />
          </div>
        )}
        
        {/* Drag handle indicator */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover/preview:bg-slate-900/5 transition-colors flex items-center justify-center">
          <GripVertical className="h-6 w-6 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity" />
        </div>
        
        {page.isDeleted && (
          <div className="absolute inset-0 bg-danger/20 backdrop-blur-[1px] flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-danger text-white p-2 rounded-full shadow-lg"
            >
              <Trash2 className="h-5 w-5" />
            </motion.div>
          </div>
        )}
        
        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-lg font-bold tracking-wider shadow-sm">
          {index + 1}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
        <div className="flex space-x-1">
          <button 
            onClick={() => rotatePage(page.id, 'left')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-all"
            title="Rotate Left"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => rotatePage(page.id, 'right')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-all"
            title="Rotate Right"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <button 
          onClick={() => toggleDeletePage(page.id)}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            page.isDeleted 
              ? "text-primary bg-primary/10 hover:bg-primary hover:text-white" 
              : "text-slate-400 hover:text-danger hover:bg-danger/10"
          )}
          title={page.isDeleted ? "Restore Page" : "Delete Page"}
        >
          {page.isDeleted ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PageOrganizer() {
  const { pages, updatePageOrder } = useMergeStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      updatePageOrder(arrayMove(pages, oldIndex, newIndex));
    }
  };

  if (pages.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Organize Pages</h3>
          <p className="text-sm text-slate-500">
            Drag to reorder. Use controls to rotate or remove pages.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <FileText className="h-4 w-4" />
          {pages.filter(p => !p.isDeleted).length} / {pages.length} Pages
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <AnimatePresence mode="popLayout">
              {pages.map((page, index) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* @ts-ignore */}
                  <SortablePage page={page} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
