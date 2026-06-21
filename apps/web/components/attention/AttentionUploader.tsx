"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAttentionScan } from "@/lib/api/attention-scan";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_MB = 20;

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttentionUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const validate = (f: File): string => {
    if (!ACCEPTED.includes(f.type)) return "Only PNG, JPG, and WEBP files are supported.";
    if (f.size > MAX_MB * 1024 * 1024) return `File exceeds ${MAX_MB} MB limit.`;
    return "";
  };

  const accept = useCallback((f: File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.kind === "file" && i.type.startsWith("image/"),
      );
      if (!item) return;
      const f = item.getAsFile();
      if (!f) return;
      const named = new File([f], "pasted-screenshot.png", { type: f.type || "image/png" });
      accept(named);
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [accept]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) accept(dropped);
  }, [accept]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) accept(picked);
  };

  const clear = () => {
    setFile(null); setPreview(null); setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { scanId } = await uploadAttentionScan(file);
      router.push(`/attention/${scanId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {!file ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragOver
              ? "border-[#EE661D] bg-[#FFF7E3]"
              : "border-gray-200 bg-white hover:border-[#EE661D]/50 hover:bg-[#FFF7E3]/40"
          }`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={onInputChange} />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EE661D]/10">
              <Upload className="h-6 w-6 text-[#EE661D]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#333333]">Drop your screenshot here</p>
              <p className="mt-1 text-sm text-gray-400">or click to browse · or paste (⌘V)</p>
            </div>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP · Max {MAX_MB} MB</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {preview && <img src={preview} alt="preview" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#333333] truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
                </div>
                <button onClick={clear} className="shrink-0 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-[#EE661D]" />
                <span className="text-xs text-gray-500">Ready to analyse</span>
              </div>
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={uploading}
            className="mt-4 w-full rounded-xl bg-[#EE661D] hover:bg-[#d55518] text-white h-11 text-sm font-semibold disabled:opacity-50"
          >
            {uploading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading…</>
              : "Analyse Attention"}
          </Button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
