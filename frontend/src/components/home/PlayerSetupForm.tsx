import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/Input";

const PACMAN_COLORS = [
    {
        value: "from-blue-500 to-blue-600",
        hex: "#3b82f6",
        label: "Blue",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    {
        value: "from-purple-500 to-purple-600",
        hex: "#a855f7",
        label: "Purple",
        gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
    },
    {
        value: "from-pink-500 to-pink-600",
        hex: "#ec4899",
        label: "Pink",
        gradient: "linear-gradient(135deg, #ec4899, #db2777)",
    },
    {
        value: "from-yellow-500 to-yellow-600",
        hex: "#eab308",
        label: "Yellow",
        gradient: "linear-gradient(135deg, #eab308, #ca8a04)",
    },
    {
        value: "from-emerald-500 to-emerald-600",
        hex: "#10b981",
        label: "Emerald",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
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

interface PlayerSetupFormProps {
    nameRef: React.RefObject<HTMLInputElement | null>;
    colorRef: React.RefObject<string>;
    disabled?: boolean;
}

export function PlayerSetupForm({ nameRef, colorRef, disabled = false }: PlayerSetupFormProps) {
    const [selectedColor, setSelectedColor] = useState(PACMAN_COLORS[0]);

    const handleColorChange = (color: typeof PACMAN_COLORS[number]) => {
        if (disabled) return;
        setSelectedColor(color);
        colorRef.current = color.hex;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <label htmlFor="playerName" className="text-sm font-medium text-white/90">
                        Player Name
                    </label>
                </div>
                <Input
                    id="playerName"
                    ref={nameRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    autoComplete="off"
                    placeholder="Enter your Pacman name"
                    maxLength={20}
                    autoFocus
                    disabled={disabled}
                />
            </div>


            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">Choose Pacman Color</span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedColor.hex }}
                        />
                        <span className="text-xs text-white/70">{selectedColor.label}</span>
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-5 gap-3"
                >
                    {PACMAN_COLORS.map((color) => (
                        <motion.button
                            key={color.hex}
                            variants={itemVariants}
                            onClick={() => handleColorChange(color)}
                            disabled={disabled}
                            className={cn(
                                "relative group h-14 rounded-xl overflow-hidden transition-all duration-300",
                                !disabled && "hover:scale-105",
                                selectedColor.hex === color.hex
                                    ? "ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/25"
                                    : "ring-1 ring-white/20",
                                !disabled && "hover:ring-white/40",
                                "bg-black/20 backdrop-blur-sm shadow-lg",
                                !disabled && "hover:shadow-xl",
                                disabled && "opacity-60 cursor-not-allowed"
                            )}
                        >
                            <div className={cn(
                                "absolute -inset-0.5 rounded-xl transition-all duration-300 blur-sm",
                                selectedColor.hex === color.hex
                                    ? "opacity-60 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20"
                                    : !disabled && "opacity-0 group-hover:opacity-30 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10"
                            )} />

                            <div
                                className={cn(
                                    "absolute inset-0 transition-opacity",
                                    disabled ? "opacity-75" : "opacity-90 group-hover:opacity-100"
                                )}
                                style={{ background: color.gradient }}
                            />

                            {!disabled && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

                            {selectedColor.hex === color.hex && (
                                <div className="absolute inset-0 grid place-items-center">
                                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                            )}

                            {selectedColor.hex === color.hex && (
                                <>
                                    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-xl" />
                                    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-xl" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-xl" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-400/60 rounded-br-xl" />
                                </>
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
