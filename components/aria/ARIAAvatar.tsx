"use client";
import { motion, AnimatePresence } from "framer-motion";

type ARIAState = "idle" | "speaking" | "listening" | "thinking";

interface ARIAAvatarProps {
  state?: ARIAState;
  size?: number;
}

const NUM_BARS = 5;
const BAR_HEIGHTS = [0.35, 0.65, 1, 0.65, 0.35];

export function ARIAAvatar({ state = "idle", size = 120 }: ARIAAvatarProps) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Outer glow ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Thinking orbit */}
        {isThinking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-teal-400/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Pulse ring — idle & listening */}
        {(state === "idle" || isListening) && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: isListening
                  ? "radial-gradient(circle, rgba(45,128,128,0.2) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(77,184,184,0.12) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-teal-400/30"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </>
        )}

        {/* Speaking ripples */}
        {isSpeaking && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-teal-400/40"
                animate={{ scale: [1, 1.5 + i * 0.2], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.35,
                }}
              />
            ))}
          </>
        )}

        {/* Main circle */}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #4DB8B8, #1A6B6B 60%, #0f3d3d)",
            boxShadow:
              isSpeaking
                ? "0 0 30px rgba(77,184,184,0.6), 0 0 60px rgba(77,184,184,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                : isListening
                ? "0 0 20px rgba(77,184,184,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 0 15px rgba(77,184,184,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          animate={isSpeaking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={isSpeaking ? { duration: 0.6, repeat: Infinity } : {}}
        >
          {/* Inner highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 60%)",
            }}
          />

          {/* Sound wave bars — speaking */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {BAR_HEIGHTS.map((h, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full bg-white/80"
                    style={{ width: 3, height: size * 0.28 * h }}
                    animate={{
                      scaleY: [1, 1 + (1 - h) * 1.8, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 0.5 + i * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mic icon — listening */}
          <AnimatePresence>
            {isListening && (
              <motion.svg
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                width={size * 0.32}
                height={size * 0.32}
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0014 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="9" y1="22" x2="15" y2="22" />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Thinking dots */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                className="flex gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/80"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle ARIA icon */}
          <AnimatePresence>
            {state === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <svg
                  width={size * 0.38}
                  height={size * 0.38}
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  {/* Stylized A for ARIA */}
                  <circle cx="24" cy="18" r="9" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" />
                  <circle cx="24" cy="18" r="3" fill="rgba(255,255,255,0.9)" />
                  <path
                    d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div
          className="font-bold tracking-widest text-transparent bg-clip-text"
          style={{
            background: "linear-gradient(135deg, #4DB8B8, #2D8080)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: size * 0.15,
          }}
        >
          ARIA
        </div>
        <div className="text-white/40 tracking-widest uppercase" style={{ fontSize: size * 0.09 }}>
          AVORA AI
        </div>
      </div>
    </div>
  );
}
