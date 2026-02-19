"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { API_URL } from "@/lib/config";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ label, value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/configurations/upload`, {
        method: "POST",
        body: formData,
        credentials: "include", // Important for auth
      });

      if (!res.ok) {
        console.error("Upload failed");
        alert("Upload failed");
        return;
      }

      const data = await res.json();
      // data.url returns e.g. /files/public/filename.ext
      // We prepend API_URL if it's relative, but for images src, relative to domain might be fine if proxying?
      // Wait, API serves images at API_URL/files/public/...
      // If web is localhost:3000 and api is localhost:3001, we need full URL.
      // Or we store full URL?
      // The backend returns `/files/public/filename`.
      // The frontend should construct the full URL for display: `API_URL + data.url`.
      // But for storage in config, we should probably store the relative path or full path?
      // Storing relative path `/files/public/...` is better for portability.
      // But when rendering on frontend, we need to know to prepend API_URL.
      // Let's store the relative path returned by API.
      onChange(data.url);
    } catch (error) {
      console.error("Upload error", error);
      alert("Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  // Helper to display image
  const displayUrl = value?.startsWith("http") ? value : `${API_URL}${value}`;

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-col gap-4">
        {value ? (
          <div className="relative w-40 h-40 border rounded-lg overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`file-${label}`)?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Select Image
                </>
              )}
            </Button>
            <input
              id={`file-${label}`}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
