'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  tokenName?: string;
}

type QRSize = 'small' | 'medium' | 'large';

const sizeConfig: Record<QRSize, { qrSize: number; label: string; description: string }> = {
  small: {
    qrSize: 150,
    label: 'Small (Table/Reception)',
    description: 'Perfect for table tents and small desk displays',
  },
  medium: {
    qrSize: 250,
    label: 'Medium (Reception Desk)',
    description: 'Ideal for reception counters and standard displays',
  },
  large: {
    qrSize: 400,
    label: 'Large (Window/Door)',
    description: 'Great for window displays and door signage',
  },
};

export function QRCodeDialog({ open, onOpenChange, url, tokenName }: QRCodeDialogProps) {
  const [size, setSize] = useState<QRSize>('medium');
  const [printMode, setPrintMode] = useState(false);

  const config = sizeConfig[size];

  const handlePrint = () => {
    setPrintMode(true);
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        // Reset after print dialog closes
        setTimeout(() => {
          setPrintMode(false);
        }, 500);
      }, 100);
    });
  };

  const handleDownload = async () => {
    try {
      // Get the SVG element
      const svgElement = document.getElementById('qr-code-svg');
      if (!svgElement) return;

      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image from the SVG
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const padding = 40;
        canvas.width = config.qrSize + padding * 2;
        canvas.height = config.qrSize + padding * 2;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw QR code
          ctx.drawImage(img, padding, padding, config.qrSize, config.qrSize);

          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = `qr-code-${size}-${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
            }
          }, 'image/png');
        }

        URL.revokeObjectURL(svgUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        console.error('Failed to load SVG for download');
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to join. Choose a size and print or download.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Print Size</Label>
              <Select value={size} onValueChange={(value) => setSize(value as QRSize)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sizeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border-2 border-dashed">
              <div id="qr-code-container" className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={url}
                  size={config.qrSize}
                  level="M"
                  includeMargin={false}
                />
              </div>
              {tokenName && (
                <p className="mt-4 text-sm font-medium text-center">{tokenName}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs break-all">
                {url}
              </p>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Size: {config.label}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1" variant="default">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleDownload} className="flex-1" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-optimized view */}
      {printMode && (
        <div id="qr-print-view" className="qr-print-only fixed inset-0 bg-white p-8" style={{ display: 'none' }}>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                value={url}
                size={config.qrSize}
                level="M"
                includeMargin={false}
              />
            </div>
            {tokenName && (
              <h2 className="mt-6 text-2xl font-bold text-center">{tokenName}</h2>
            )}
            <p className="mt-4 text-sm text-center text-gray-600 max-w-md break-all">
              {url}
            </p>
            <p className="mt-8 text-xs text-center text-gray-500">
              Scan to join • {config.label}
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-print-view,
          #qr-print-view * {
            visibility: visible !important;
            display: block !important;
          }
          #qr-print-view {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 9999 !important;
            background: white !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </>
  );
}

