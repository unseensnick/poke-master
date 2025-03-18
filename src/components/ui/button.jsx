import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-95 transition-transform",
                destructive:
                    "rounded-md bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:scale-95 transition-transform",
                outline:
                    "rounded-md border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform dark:bg-background/30 dark:border-input/60 dark:hover:bg-accent/20",
                secondary:
                    "rounded-md bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-95 transition-transform",
                ghost: "rounded-md hover:bg-accent/60 hover:text-accent-foreground dark:hover:bg-accent/20",
                link: "text-primary underline-offset-4 hover:underline",
                pokemon:
                    "rounded-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-95 transition-transform border-2 border-primary/30 overflow-hidden relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/10 after:to-transparent after:opacity-50 after:hover:opacity-70",
                pokemonOutline:
                    "rounded-full bg-background text-foreground shadow-xs hover:bg-accent/20 active:scale-95 transition-transform border-2 border-primary/30 overflow-hidden relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:to-transparent after:opacity-50 after:hover:opacity-70",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 px-3 has-[>svg]:px-2.5 text-xs gap-1.5",
                lg: "h-10 px-6 has-[>svg]:px-4",
                icon: "size-9 p-0 rounded-full hover:bg-accent/30",
                pill: "h-8 px-4 text-xs rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
