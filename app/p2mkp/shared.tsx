"use client";

import React from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Badge + title + description, revealed with a stagger when scrolled into view. */
export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="mb-10 space-y-3 px-4 text-center"
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
        {eyebrow}
      </motion.span>
      <motion.h2 variants={fadeUp} className="font-calsans text-2xl leading-tight text-white md:text-3xl lg:text-4xl">
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={fadeUp} className="mx-auto max-w-xl text-xs leading-relaxed text-gray-400 md:text-sm">
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Counts up from 0 the first time it scrolls into view. */
export function CountUp({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion]);

  return <span ref={ref}>{display.toLocaleString("id-ID")}</span>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  loading,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-1 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.08]",
        className
      )}
    >
      <Icon className="mb-1 h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110" aria-hidden="true" />
      <div className="font-calsans text-2xl text-white md:text-3xl">
        {loading ? (
          <span className="inline-block h-7 w-12 animate-pulse rounded-lg bg-white/10 align-middle" />
        ) : (
          <>
            <CountUp value={value} />
            {suffix}
          </>
        )}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
    </div>
  );
}

/** Lock page scroll and close on Escape while a modal is open. */
export function useModalBehaviour(onClose: () => void) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
}
