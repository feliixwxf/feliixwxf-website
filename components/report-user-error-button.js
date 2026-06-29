"use client";

import { useState } from "react";

export default function ReportUserErrorButton({ message, page, source }) {
  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");

  const reportError = async () => {
    if (!message || status === "sending") return;

    setStatus("sending");
    setErrorText("");

    const response = await fetch("/api/user-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reported-by-user",
        page,
        source,
        message,
      }),
    }).catch(() => null);

    if (response?.ok) {
      setStatus("sent");
      return;
    }

    const data = await response?.json().catch(() => ({}));
    setErrorText(
      data?.error ||
        "Fehler konnte nicht gemeldet werden. Bitte später erneut versuchen."
    );
    setStatus("failed");
  };

  return (
    <span className="mt-3 inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={reportError}
        disabled={status === "sending" || status === "sent"}
        className="inline-flex w-fit items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/15 disabled:cursor-default disabled:opacity-70"
      >
        {status === "sending"
          ? "Wird gemeldet..."
          : status === "sent"
            ? "Fehler wurde gemeldet"
            : status === "failed"
              ? "Nochmal melden"
              : "Fehler melden"}
      </button>

      {status === "failed" && errorText && (
        <span className="max-w-sm text-xs leading-5 text-red-200">
          {errorText}
        </span>
      )}
    </span>
  );
}
