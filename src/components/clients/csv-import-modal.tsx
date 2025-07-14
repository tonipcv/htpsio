'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import clients');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Successfully imported ${data.imported} clients`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error importing clients:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import clients",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1d20] border-[#f5f5f7]/10">
        <DialogHeader>
          <DialogTitle className="text-[#f5f5f7] text-sm">Import Clients</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="text-xs text-[#f5f5f7]/70">
            <p>Upload a CSV file with the following columns:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>name (required)</li>
              <li>email (required)</li>
            </ul>
          </div>
          <div className="border-2 border-dashed border-[#f5f5f7]/10 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <ArrowUpTrayIcon className="h-8 w-8 text-[#f5f5f7]/30" />
              <label 
                htmlFor="csv-upload" 
                className="cursor-pointer text-xs text-[#f5f5f7]/70 hover:text-[#f5f5f7]"
              >
                Click to upload CSV
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
          {isUploading && (
            <div className="flex justify-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border border-[#f5f5f7] border-t-transparent"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 