"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, MessageCircleQuestion, Send, X } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Was kostet ein Shooting?",
    answer:
      "Der Preis hängt von der Shooting-Art, der Dauer und dem gewünschten Umfang ab. Schick mir kurz deine Idee – danach erhältst du ein passendes, unverbindliches Angebot.",
  },
  {
    question: "Wie lange dauert ein Shooting?",
    answer:
      "Die meisten Shootings dauern etwa 60 bis 90 Minuten. Bei Events, Hochzeiten oder umfangreicheren Fahrzeug-Shootings planen wir die Dauer individuell.",
  },
  {
    question: "Wann erhalte ich meine Bilder?",
    answer:
      "Du erhältst deine fertig bearbeiteten Bilder nach der Auswahl in einer privaten Online-Galerie. Den genauen Lieferzeitraum stimmen wir vor dem Shooting gemeinsam ab.",
  },
  {
    question: "Was passiert bei schlechtem Wetter?",
    answer:
      "Bei einem Outdoor-Shooting beobachten wir das Wetter und entscheiden gemeinsam. Wenn es nicht passt, finden wir unkompliziert einen neuen Termin oder eine geeignete Alternative.",
  },
  {
    question: "Wo findet das Shooting statt?",
    answer:
      "Ich fotografiere vor allem in Eisfeld, Hildburghausen und Umgebung. Die genaue Location wählen wir passend zu deinem gewünschten Look aus.",
  },
  {
    question: "Wie kann ich einen Termin anfragen?",
    answer:
      "Nutze einfach das Kontaktformular und beschreibe kurz, was du dir vorstellst. Ein Wunschdatum und der gewünschte Ort helfen bei der Planung.",
  },
];

export default function FaqChatbot({ dark }) {
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const closeChat = () => {
    setOpen(false);
    setSelectedQuestion(null);
  };

  const scrollToContactForm = () => {
    closeChat();

    window.history.replaceState(null, "", "/#kontaktformular");

    requestAnimationFrame(() => {
      document
        .getElementById("kontaktformular")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[650] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Häufige Fragen zum Shooting"
            className={`absolute bottom-16 right-0 flex max-h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-[1.7rem] border shadow-2xl sm:bottom-20 ${
              dark
                ? "border-white/15 bg-neutral-950 text-white"
                : "border-black/10 bg-white text-neutral-950"
            }`}
          >
            <div
              className={`flex items-center gap-3 border-b px-4 py-4 ${
                dark
                  ? "border-white/10 bg-white/[0.06]"
                  : "border-black/10 bg-neutral-50"
              }`}
            >
              {selectedQuestion ? (
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  aria-label="Zurück zu den Fragen"
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    dark ? "hover:bg-white/10" : "hover:bg-black/5"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-black">
                  <Camera className="h-5 w-5" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-black">Fragen zum Shooting?</p>
                <p className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Wähle eine häufige Frage aus
                </p>
              </div>

              <button
                type="button"
                onClick={closeChat}
                aria-label="FAQ schließen"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  dark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {selectedQuestion ? (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <div
                      className={`ml-auto max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 text-sm font-semibold ${
                        dark ? "bg-white text-black" : "bg-neutral-950 text-white"
                      }`}
                    >
                      {selectedQuestion.question}
                    </div>
                    <div
                      className={`mt-3 max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-6 ${
                        dark ? "bg-white/10 text-neutral-200" : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {selectedQuestion.answer}
                    </div>

                    <button
                      type="button"
                      onClick={scrollToContactForm}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                    >
                      Shooting anfragen
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQuestion(null)}
                      className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        dark ? "hover:bg-white/10" : "hover:bg-black/5"
                      }`}
                    >
                      Andere Frage auswählen
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="space-y-2"
                  >
                    <p className={`mb-3 text-sm leading-6 ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
                      Hi! Wobei kann ich dir helfen?
                    </p>
                    {FAQ_ITEMS.map((item) => (
                      <button
                        key={item.question}
                        type="button"
                        onClick={() => setSelectedQuestion(item)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          dark
                            ? "border-white/10 bg-white/[0.06] hover:bg-white/10"
                            : "border-black/10 bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        {item.question}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={scrollToContactForm}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                    >
                      Direkt anfragen
                      <Send className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "FAQ schließen" : "Fragen zum Shooting öffnen"}
        aria-expanded={open}
        className="ml-auto flex h-14 items-center gap-2 rounded-full bg-yellow-400 px-4 font-black text-black shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-yellow-300 sm:h-16 sm:px-5"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleQuestion className="h-6 w-6" />}
        <span className="hidden text-sm sm:inline">Fragen?</span>
      </button>
    </div>
  );
}
