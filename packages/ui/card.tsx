import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {

        const variants = {
            default: "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm",
            glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
        };

        return (
            <div
                ref={ref}
                className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";
