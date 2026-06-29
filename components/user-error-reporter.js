"use client";

import { useEffect } from "react";

function sendErrorReport(payload) {
  const body = JSON.stringify({
    type: payload.type || "client",
    page:
      payload.page ||
      (typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : ""),
    message: payload.message || "Unbekannter Fehler",
    source: payload.source || "",
    stack: payload.stack || "",
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/user-errors", blob);
    return;
  }

  fetch("/api/user-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export default function UserErrorReporter() {
  useEffect(() => {
    const handleError = (event) => {
      sendErrorReport({
        type: "browser-error",
        message: event.message,
        source: event.filename,
        stack: event.error?.stack,
      });
    };

    const handleRejection = (event) => {
      const reason = event.reason;
      sendErrorReport({
        type: "unhandled-promise",
        message: reason?.message || String(reason || "Promise Fehler"),
        stack: reason?.stack,
      });
    };

    const handleUserError = (event) => {
      sendErrorReport({
        type: "user-message",
        ...(event.detail || {}),
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("feliix:user-error", handleUserError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("feliix:user-error", handleUserError);
    };
  }, []);

  return null;
}
