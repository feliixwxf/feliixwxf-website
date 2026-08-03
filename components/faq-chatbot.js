"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, MessageCircleQuestion, Send, X } from "lucide-react";
import { useState } from "react";

const panelTransition = {
  type: "spring",
  stiffness: 360,
  damping: 34,
  mass: 0.8,
};

const contentTransition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

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
            layout
            initial={{ opacity: 0, y: 22, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96, filter: "blur(4px)" }}
            transition={panelTransition}
            role="dialog"
            aria-label="Häufige Fragen zum Shooting"
            className={`absolute bottom-16 right-0 flex max-h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[380px] origin-bottom-right transform-gpu flex-col overflow-hidden rounded-[1.7rem] border shadow-2xl will-change-transform sm:bottom-20 ${
              dark
                ? "border-white/15 bg-neutral-950 text-white"
                : "border-black/10 bg-white text-neutral-950"
            }`}
          >
            <div
              className={`flex shrink-0 items-center gap-3 border-b px-4 py-4 ${
                dark
                  ? "border-white/10 bg-white/[0.06]"
                  : "border-black/10 bg-neutral-50"
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {selectedQuestion ? (
                  <motion.button
                    key="back"
                    type="button"
                    initial={{ opacity: 0, scale: 0.86, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.86, rotate: 8 }}
                    transition={contentTransition}
                    onClick={() => setSelectedQuestion(null)}
                    aria-label="Zurück zu den Fragen"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                      dark ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.span
                    key="camera"
                    initial={{ opacity: 0, scale: 0.86, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.86, rotate: 8 }}
                    transition={contentTransition}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black"
                  >
                    <Camera className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>

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

            <motion.div layout className="min-h-0 overflow-y-auto overscroll-contain p-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {selectedQuestion ? (
                  <motion.div
                    key="answer"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={contentTransition}
                  >
                    <motion.div
                      layout
                      className={`ml-auto max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 text-sm font-semibold ${
                        dark ? "bg-white text-black" : "bg-neutral-950 text-white"
                      }`}
                    >
                      {selectedQuestion.question}
                    </motion.div>
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...contentTransition, delay: 0.05 }}
                      className={`mt-3 max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-6 ${
                        dark ? "bg-white/10 text-neutral-200" : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {selectedQuestion.answer}
                    </motion.div>

                    <motion.button
                      layout
                      type="button"
                      onClick={scrollToContactForm}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                    >
                      Shooting anfragen
                      <Send className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      layout
                      type="button"
                      onClick={() => setSelectedQuestion(null)}
                      whileTap={{ scale: 0.98 }}
                      className={`mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        dark ? "hover:bg-white/10" : "hover:bg-black/5"
                      }`}
                    >
                      Andere Frage auswählen
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="questions"
                    layout
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: 8 }}
                    transition={contentTransition}
                    className="space-y-2"
                  >
                    <motion.p
                      variants={itemVariants}
                      className={`mb-3 text-sm leading-6 ${dark ? "text-neutral-300" : "text-neutral-600"}`}
                    >
                      Hi! Wobei kann ich dir helfen?
                    </motion.p>
                    {FAQ_ITEMS.map((item) => (
                      <motion.button
                        key={item.question}
                        variants={itemVariants}
                        type="button"
                        onClick={() => setSelectedQuestion(item)}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          dark
                            ? "border-white/10 bg-white/[0.06] hover:bg-white/10"
                            : "border-black/10 bg-neutral-50 hover:bg-neutral-100"
                        }`}
                      >
                        {item.question}
                      </motion.button>
                    ))}
                    <motion.button
                      variants={itemVariants}
                      type="button"
                      onClick={scrollToContactForm}
                      whileTap={{ scale: 0.985 }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
                    >
                      Direkt anfragen
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "FAQ schließen" : "Fragen zum Shooting öffnen"}
        aria-expanded={open}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={contentTransition}
        className="ml-auto flex h-14 transform-gpu items-center gap-2 rounded-full bg-yellow-400 px-4 font-black text-black shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition-colors hover:bg-yellow-300 sm:h-16 sm:px-5"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircleQuestion className="h-6 w-6" />}
        <span className="hidden text-sm sm:inline">Fragen?</span>
      </motion.button>
    </div>
  );
}
