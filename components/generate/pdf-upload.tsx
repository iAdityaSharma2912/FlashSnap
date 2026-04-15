"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, File, X, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfUploadProps {
  onFile: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
}

export function PdfUpload({ onFile, file, disabled }: PdfUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (f.type !== "application/pdf") return "Only PDF files are accepted.";
    if (f.size > 20 * 1024 * 1024) return "File size must be under 20MB.";
    return null;
  };

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      onFile(null);
      return;
    }
    setError(null);
    onFile(f);
  }, [onFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [disabled, handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
          dragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : file
            ? "border-accent/50 bg-accent/5"
            : "border-dark-border bg-dark-card hover:border-primary/50 hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500/50 bg-red-500/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onInputChange}
          disabled={disabled}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-100 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-muted text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                dragging ? "bg-primary/30" : "bg-dark-muted"
              )}
            >
              <Upload
                className={cn("w-6 h-6", dragging ? "text-primary" : "text-gray-500")}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">
                {dragging ? "Drop your PDF here" : "Upload a PDF"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop or click to browse — up to 20MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <File className="w-3.5 h-3.5" />
              PDF files only
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
