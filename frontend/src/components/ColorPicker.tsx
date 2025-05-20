import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = [
  {
    value: "from-blue-500 to-blue-600",
    hex: "#3b82f6",
    label: "Blue",
    gradient: "var(--gradient-1)",
  },
  {
    value: "from-purple-500 to-purple-600",
    hex: "#a855f7",
    label: "Purple",
    gradient: "var(--gradient-2)",
  },
  {
    value: "from-pink-500 to-pink-600",
    hex: "#ec4899",
    label: "Pink",
    gradient: "var(--gradient-3)",
  },
  {
    value: "from-yellow-500 to-yellow-600",
    hex: "#eab308",
    label: "Yellow",
    gradient: "var(--gradient-4)",
  },
  {
    value: "from-emerald-500 to-emerald-600",
    hex: "#10b981",
    label: "Emerald",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

export function ColorPicker({ onChange }: { onChange: (color: string) => void }) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onChange(color);
  };

  return (
    <div className="space-y-3">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-5 gap-3"
      >
        {COLORS.map((color) => (
          <motion.button
            key={color.hex}
            variants={item}
            onClick={() => handleColorChange(color.hex)}
            className={cn(
              "relative group h-14 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105",
              selectedColor === color.hex && "ring-2 ring-white/50 scale-[1.02] z-10"
            )}
          >
            <div
              className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
              style={{ background: color.gradient }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] group-hover:translate-x-[100%] transition-transform duration-500" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
