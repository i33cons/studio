"use client";

import { useRef, type RefObject } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PageThumbnail as PageThumbnailType } from '@/types';

interface PageThumbnailProps {
  docId: string;
  page: PageThumbnailType;
  index: number;
  onRotate: () => void;
  onDelete: () => void;
  onReorder: (docId: string, dragIndex: number, hoverIndex: number) => void;
}

export function PageThumbnail({
  docId,
  page,
  index,
  onRotate,
  onDelete,
  onReorder,
}: PageThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ docId, index }));
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        if(ref.current) ref.current.classList.add('opacity-50');
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if(ref.current) ref.current.classList.remove('opacity-50', 'border-accent');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(ref.current) ref.current.classList.add('border-accent');
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if(ref.current) ref.current.classList.remove('border-accent');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(ref.current) ref.current.classList.remove('opacity-50', 'border-accent');
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.docId !== docId) return; // Can't drop between documents
    onReorder(docId, data.index, index);
  };

  return (
    <Card
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="aspect-[210/297] relative group overflow-hidden transition-all duration-200 border-2 border-transparent cursor-grab"
    >
      <img
        src={page.thumbnailUrl}
        alt={`Page ${page.pageIndex + 1}`}
        className="w-full h-full object-contain bg-white"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
        <Button size="icon" variant="secondary" onClick={onRotate} className="h-10 w-10">
          <RotateCw className="h-5 w-5" />
          <span className="sr-only">Rotate</span>
        </Button>
        <Button size="icon" variant="destructive" onClick={onDelete} className="h-10 w-10">
          <Trash2 className="h-5 w-5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      <div className="absolute bottom-1 right-2 bg-black/50 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
        {page.pageIndex + 1}
      </div>
    </Card>
  );
}
