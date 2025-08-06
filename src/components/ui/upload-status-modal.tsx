import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "uploading" | "success" | "error";
  fileName: string;
  errorMessage?: string;
}

export function UploadStatusModal({
  isOpen,
  onClose,
  status,
  fileName,
  errorMessage = "Não foi possível enviar o documento"
}: UploadStatusModalProps) {
  // Auto-close on success after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "success" && isOpen) {
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1c1d20] border-[#f5f5f7]/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#f5f5f7] text-sm">Status do Upload</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {status === "uploading" && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#f5f5f7]/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-[#f5f5f7] animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f5f5f7]">Enviando documento</p>
                <p className="text-xs text-[#f5f5f7]/70 mt-1 max-w-[250px] truncate">{fileName}</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f5f5f7]">Upload concluído</p>
                <p className="text-xs text-[#f5f5f7]/70 mt-1 max-w-[250px] truncate">{fileName}</p>
                <p className="text-xs text-[#f5f5f7]/50 mt-2">Fechando automaticamente...</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#f5f5f7]">Erro no upload</p>
                <p className="text-xs text-red-400/90 mt-1">{errorMessage}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
