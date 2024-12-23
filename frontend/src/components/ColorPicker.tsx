import { useState } from "react";

const COLORS: { value: string; hex: string; label: string }[] = [
  {
    value: "from-red-400 to-red-600 bg-red-500 hover:bg-red:600 shadow-red-900",
    hex: "#ef4444",
    label: "Red",
  },
  {
    value: "from-yellow-400 to-yellow-600 bg-yellow-500 hover:bg-yellow:600 shadow-yellow-900",
    hex: "#eab308",
    label: "Yellow",
  },
  {
    value: "from-green-400 to-green-600 bg-green-500 hover:bg-green:600 shadow-green-900",
    hex: "#22c55e",
    label: "Green",
  },
];

export function ColorPicker({ onChange }: { onChange: (color: string) => void; }) {
  const [value, setValue] = useState("");

  const handleColorChange = (color: string) => {
    setValue(color);
    onChange(color);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-indigo-300/80 mb-2">
        Choose Your Color
      </label>
      <div className="grid grid-cols-3 gap-2">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorChange(color.hex)}
            className={`w-full px-3 py-3 rounded text-white text-sm font-medium group relative overflow-hidden bg-green-500
          ${value === color.hex && "ring-2 ring-white/80 scale-[1.02]"} transition-all duration-100 shadow-lg hover:opacity-80 ${color.value}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-${color.value} to-${color.value} opacity-80 group-hover:opacity-100 transition-opacity`}
            />
            <div
              className={`absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] group-hover:translate-x-[100%] transition-transform duration-500`}
            />
            <span className="relative">{color.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
