"use client";

import { useState, useCallback } from "react";
import { getSupabase, SUPABASE_FUNCTIONS_URL } from "@/lib/supabase";
import type { ImageAnalysisResponse } from "@/types/analysis";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<{ url: string }> => {
    const supabase = getSupabase();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("analysis-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from("analysis-images")
      .getPublicUrl(path);

    return { url: urlData.publicUrl };
  }, []);

  const analyzeImage = useCallback(async (url: string): Promise<ImageAnalysisResponse> => {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/trend-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: url }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ detail: "Image analysis failed" }));
      throw new Error(errBody.detail || `Request failed (${res.status})`);
    }

    return res.json();
  }, []);

  const processImage = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);

      try {
        setUploading(true);
        const { url } = await uploadImage(file);
        setUploading(false);

        setAnalyzing(true);
        const analysis = await analyzeImage(url);
        setResult(analysis);
        setAnalyzing(false);
      } catch (err) {
        setUploading(false);
        setAnalyzing(false);
        const message = err instanceof Error ? err.message : "Image processing failed";
        setError(message);
      }
    },
    [uploadImage, analyzeImage]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setAnalyzing(false);
    setError(null);
    setResult(null);
  }, []);

  return { uploading, analyzing, error, result, processImage, reset };
}
