"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadSimple, Image, SpinnerGap, ArrowRight, Warning, X } from "@phosphor-icons/react";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { ImageAnalysisResponse } from "@/types/analysis";

interface ImageUploadDropzoneProps {
  onImageAnalyzed: (query: string) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUploadDropzone({ onImageAnalyzed, isLoading }: ImageUploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, analyzing, error, result, processImage, reset } = useImageUpload();

  const handleFile = useCallback(
    (file: File) => {
      setSizeError(false);
      if (file.size > MAX_FILE_SIZE) {
        setSizeError(true);
        return;
      }
      setPreview(URL.createObjectURL(file));
      processImage(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleReset = useCallback(() => {
    setPreview(null);
    setSizeError(false);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [reset]);

  const isBusy = uploading || analyzing || isLoading;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center w-full py-12 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-forest/40 bg-forest/[0.04]"
                : "border-charcoal/10 bg-charcoal/[0.02] hover:border-charcoal/20 hover:bg-charcoal/[0.04]"
            }`}
          >
            <UploadSimple weight="duotone" className="w-8 h-8 text-charcoal/25 mb-3" />
            <p className="font-sans text-sm text-charcoal/50 mb-1">
              Drop a fashion image here
            </p>
            <p className="font-sans text-xs text-charcoal/30">
              or click to browse (JPEG, PNG, WebP, max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleInputChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative w-full"
          >
            <div className="relative flex gap-4 p-4 bg-charcoal/[0.03] border border-charcoal/10 rounded-2xl">
              {/* Thumbnail */}
              <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-charcoal/[0.05]">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
              </div>

              {/* Status */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                {(uploading || analyzing) && (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <SpinnerGap weight="bold" className="w-4 h-4 text-forest" />
                    </motion.div>
                    <span className="font-sans text-sm text-charcoal/60">
                      {uploading ? "Uploading image..." : "Analyzing style..."}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2">
                    <Warning weight="fill" className="w-4 h-4 text-rust shrink-0" />
                    <span className="font-sans text-sm text-rust/80">{error}</span>
                  </div>
                )}

                {result && (
                  <div>
                    <p className="font-sans text-sm text-charcoal/70 mb-1 line-clamp-2">
                      {result.style_description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.keywords.slice(0, 4).map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-charcoal/[0.06] rounded-full font-sans text-[10px] text-charcoal/50"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => onImageAnalyzed(result.suggested_query)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-cream rounded-xl font-sans text-sm font-medium disabled:opacity-30 hover:bg-forest transition-colors"
                    >
                      Analyze &ldquo;{result.suggested_query}&rdquo;
                      <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={handleReset}
                disabled={isBusy}
                className="absolute top-2 right-2 p-1 rounded-full text-charcoal/30 hover:text-charcoal/60 hover:bg-charcoal/[0.06] transition-all disabled:opacity-30"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sizeError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-rust/8 border border-rust/15 rounded-xl"
        >
          <Warning weight="fill" className="w-4 h-4 text-rust shrink-0" />
          <span className="font-sans text-sm text-rust/90">File too large. Maximum size is 5MB.</span>
        </motion.div>
      )}
    </div>
  );
}
