"use client";

import { useState } from "react";

export function CalendarExport({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4 mt-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Export Calendrier (iCal)
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Synchronisez automatiquement vos missions Form-Act avec votre agenda
          personnel (Google Calendar, Outlook, Apple Calendar).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors min-w-[100px]"
        >
          {copied ? (
            <span className="text-green-600 font-bold">Copié !</span>
          ) : (
            <span>Copier</span>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Instructions : Copiez ce lien et utilisez la fonction
        &quot;S&apos;abonner à un calendrier via URL&quot; de votre agenda.
      </p>
    </div>
  );
}
