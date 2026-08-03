'use client';

import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReceiptDocument from './ReceiptDocument';
import InvoiceDocument from './InvoiceDocument';
import type { PrintData } from './print-data';

const PAPER_WIDTH_PX = { receipt: 219, invoice: 794 } as const;

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'receipt' | 'invoice';
  data: PrintData | null;
  documentTitle: string;
}

export default function PrintPreviewDialog({
  open,
  onOpenChange,
  documentType,
  data,
  documentTitle,
}: PrintPreviewDialogProps) {
  const { toast } = useToast();
  const paperWidth = PAPER_WIDTH_PX[documentType];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / paperWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paperWidth]);

  useLayoutEffect(() => {
    if (!data) return;
    const el = contentRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, documentType]);

  const onAfterPrint = useCallback(() => onOpenChange(false), [onOpenChange]);
  const onPrintError = useCallback(
    (_loc: string, err: Error) => {
      toast({ title: 'Print failed', description: String(err), variant: 'destructive' });
    },
    [toast]
  );
  const documentTitleFn = useCallback(() => documentTitle, [documentTitle]);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: documentTitleFn,
    onAfterPrint,
    onPrintError,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentType === 'receipt' ? 'Receipt Preview' : 'Invoice Preview'}</DialogTitle>
          <DialogDescription>
            Review the {documentType} before printing.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-auto rounded-lg bg-muted/40 p-6"
        >
          {data ? (
            <div
              className="mx-auto"
              style={{ width: paperWidth * scale, height: Math.max(contentHeight * scale, 1) }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <div ref={contentRef} className="shadow-md" style={{ width: paperWidth }}>
                  {documentType === 'receipt' ? (
                    <ReceiptDocument data={data} />
                  ) : (
                    <InvoiceDocument data={data} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Loading document...
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handlePrint()} disabled={!data}>
            Print {documentType === 'receipt' ? 'Receipt' : 'Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
