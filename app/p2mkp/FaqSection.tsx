"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { FAQ_TABS, FaqAnswer as FaqAnswerData, faqAnswerText } from "./data";
import { SectionTitle } from "./shared";

const numberBadge =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-600/20 text-[10px] font-bold text-blue-300 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white";
const pad = (i: number) => String(i + 1).padStart(2, "0");

/* ------------------------------------------------------------------ */
/*  Answer renderer — one place for every answer layout                 */
/* ------------------------------------------------------------------ */
function FaqAnswer({ answer }: { answer: FaqAnswerData }) {
  switch (answer.kind) {
    case "text":
      return <p>{answer.text}</p>;

    case "list":
      return (
        <ol className={cn("grid gap-3", answer.columns === 2 && "md:grid-cols-2")}>
          {answer.items.map((item, i) => (
            <li key={item} className="group flex items-center gap-3">
              <span className={numberBadge}>{pad(i)}</span>
              <span className="text-gray-400 transition-colors group-hover:text-white">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "steps":
      return (
        <ol className="space-y-4">
          {answer.items.map((step, i) => (
            <li key={step.title} className="group flex gap-4">
              <span
                className={cn(
                  numberBadge,
                  answer.solid && "border-transparent bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110"
                )}
              >
                {pad(i)}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white transition-colors group-hover:text-blue-300">{step.title}</p>
                <p className="leading-relaxed text-gray-400">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case "checks":
      return (
        <ul className="space-y-3">
          {answer.items.map((item) => (
            <li key={item} className="group flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
                <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
              </span>
              <span className="leading-relaxed text-gray-400 transition-colors group-hover:text-white">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "levels":
      return (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{answer.intro}</p>
          {answer.items.map((level) => (
            <div
              key={level.title}
              className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <div className="flex shrink-0 flex-col items-center gap-1">
                <span className="text-2xl" aria-hidden="true">{level.badge}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Lv.{level.rank}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-wider text-white transition-colors group-hover:text-blue-300">
                  {level.title}
                </p>
                <p className="text-xs leading-relaxed text-gray-400">{level.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case "durations":
      return (
        <div className="space-y-5">
          <p>{answer.intro}</p>
          <div className="space-y-3">
            {answer.items.map((item) => (
              <div key={item.level} className={cn("flex items-center gap-4 rounded-2xl border p-3.5", item.accent)}>
                <span className="shrink-0 text-xl" aria-hidden="true">{item.badge}</span>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm font-black uppercase tracking-wider text-white">{item.level}</span>
                  <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                    {item.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">⚠ {answer.note.title}</p>
            <p className="text-xs leading-relaxed text-gray-400">{answer.note.text}</p>
          </div>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Accordion item                                                      */
/* ------------------------------------------------------------------ */
function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
  tabLabel,
}: {
  id: string;
  question: string;
  answer: FaqAnswerData;
  open: boolean;
  onToggle: () => void;
  tabLabel?: string;
}) {
  return (
    <motion.div
      layout="position"
      className={cn(
        "overflow-hidden rounded-3xl border transition-colors duration-500",
        open ? "border-blue-500/30 bg-white/10 shadow-2xl shadow-blue-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
      )}
    >
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 md:px-8 md:py-6"
        >
          <span className="space-y-1">
            {tabLabel && (
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">{tabLabel}</span>
            )}
            <span className={cn("block text-sm font-bold transition-colors md:text-base", open ? "text-blue-300" : "text-gray-200")}>
              {question}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 rounded-xl p-2 transition-all duration-500",
              open ? "rotate-180 bg-blue-600 text-white" : "bg-white/5 text-gray-500 group-hover:text-white"
            )}
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="border-t border-white/5 px-5 pb-6 pt-4 text-xs leading-relaxed text-gray-400 md:px-8 md:pb-8 md:text-sm">
              <FaqAnswer answer={answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */
export default function FaqSection() {
  const [activeTab, setActiveTab] = React.useState(FAQ_TABS[0].id);
  const [query, setQuery] = React.useState("");
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const searching = q.length > 1;

  /** While searching, look through every tab; otherwise show the active tab. */
  const items = React.useMemo(() => {
    const tabs = searching ? FAQ_TABS : FAQ_TABS.filter((t) => t.id === activeTab);
    return tabs.flatMap((tab) =>
      tab.items
        .map((item, i) => ({ ...item, id: `faq-${tab.id}-${i}`, tabLabel: tab.label }))
        .filter((item) => !searching || `${item.question} ${faqAnswerText(item.answer)}`.toLowerCase().includes(q))
    );
  }, [activeTab, q, searching]);

  const allOpen = items.length > 0 && items.every((i) => openIds.has(i.id));
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setOpenIds(allOpen ? new Set() : new Set(items.map((i) => i.id)));

  return (
    <section id="faq" className="relative scroll-mt-32 overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute right-[-10%] top-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionTitle
          eyebrow="Pertanyaan Umum"
          title="Frequently Asked Questions"
          description="Segala hal yang perlu Anda ketahui mengenai P2MKP, proses penetapan, dan klasifikasi."
        />

        {/* Search */}
        <label className="mx-auto mb-5 flex max-w-xl items-center rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur-xl transition focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="sr-only">Cari pertanyaan</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pertanyaan, mis. “dokumen”, “klasifikasi”…"
            className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {/* Tabs (hidden while searching across all tabs) */}
        {!searching && (
          <div role="tablist" aria-label="Kategori FAQ" className="flex flex-col gap-2 rounded-[2rem] border border-white/10 bg-white/5 p-2 backdrop-blur-xl sm:flex-row">
            {FAQ_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2.5 rounded-[1.5rem] px-5 py-3.5 text-xs font-black uppercase tracking-widest transition-colors duration-300",
                    active ? "text-white" : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="faq-tab-pill"
                      className="absolute inset-0 -z-10 rounded-[1.5rem] bg-blue-600 shadow-xl shadow-blue-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="text-base" aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", active ? "bg-white/20" : "bg-white/5 text-gray-600")}>
                    {tab.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 mt-6 flex items-center justify-between gap-3 px-1 text-xs text-gray-500" aria-live="polite">
          <span>
            {searching ? (
              <>
                <span className="font-semibold text-white">{items.length}</span> hasil untuk “{query.trim()}”
              </>
            ) : (
              `${items.length} pertanyaan`
            )}
          </span>
          {items.length > 0 && (
            <button type="button" onClick={toggleAll} className="font-semibold text-blue-300 underline-offset-4 hover:underline">
              {allOpen ? "Tutup semua" : "Buka semua"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <FaqItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              open={openIds.has(item.id)}
              onToggle={() => toggle(item.id)}
              tabLabel={searching ? item.tabLabel : undefined}
            />
          ))}
          {items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center text-sm text-gray-400">
              Tidak ada pertanyaan yang cocok.{" "}
              <button type="button" onClick={() => setQuery("")} className="font-semibold text-blue-300 hover:underline">
                Lihat semua
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
