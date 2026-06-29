export function checkBotSubmission(body, options = {}) {
  const honeypotValue = String(
    body?.website || body?.company || body?._gotcha || ""
  ).trim();
  const startedAt = Number(body?.startedAt || body?.formStartedAt || 0);
  const minimumSeconds = Number(options.minimumSeconds || 3);

  if (honeypotValue) {
    return {
      ok: false,
      reason: "honeypot",
      message:
        "Die Anfrage wurde als Spam erkannt. Bitte überprüfe das Formular und versuche es nochmal.",
    };
  }

  if (startedAt && Date.now() - startedAt < minimumSeconds * 1000) {
    return {
      ok: false,
      reason: "too_fast",
      message:
        "Das Formular wurde zu schnell gesendet. Bitte versuche es in ein paar Sekunden nochmal.",
    };
  }

  return { ok: true, reason: "" };
}
