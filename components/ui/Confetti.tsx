"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  targetX: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  shape: "rect" | "circle";
}

const COLORS = ["#1E6663", "#FF6B63", "#FFD700", "#4ECDC4", "#45B7D1", "#f97316", "#a855f7"];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    targetX: (Math.random() - 0.5) * 30,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 5,
    delay: Math.random() * 0.6,
    duration: Math.random() * 1.2 + 1.4,
    rotate: (Math.random() - 0.5) * 720,
    shape: Math.random() > 0.4 ? "rect" : "circle",
  }));
}

export function Confetti({ onDone }: { onDone?: () => void }) {
  const [particles] = useState(() => generateParticles(90));

  useEffect(() => {
    const maxDuration = Math.max(...particles.map((p) => p.delay + p.duration)) * 1000 + 200;
    const t = setTimeout(() => onDone?.(), maxDuration);
    return () => clearTimeout(t);
  }, [particles, onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: -12,
            width: p.shape === "circle" ? p.size : p.size,
            height: p.shape === "circle" ? p.size : p.size * 0.55,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            background: p.color,
          }}
          animate={{
            y: ["0vh", "105vh"],
            x: [`0px`, `${p.targetX}vw`],
            rotate: [0, p.rotate],
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
