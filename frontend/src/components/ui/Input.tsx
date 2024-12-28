import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    function inputForewarding({ label, type, className, ...props }, ref) {
        return (
            <div>
                <label className="block text-sm font-medium text-indigo-300/80 mb-2">
                    {label}
                </label>

                <input
                    name='input'
                    type={type}
                    className={className}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    },
);