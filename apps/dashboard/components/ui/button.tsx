import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "default"|"secondary"|"outline"|"ghost"|"destructive"; size?: "default"|"sm"|"lg"|"icon"; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant="default", size="default", ...props }, ref)=>{
  const base="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50";
  const variants={ default:"bg-primary text-primary-foreground hover:bg-primary/90", secondary:"bg-muted text-foreground hover:bg-muted/80", outline:"border bg-background hover:bg-muted", ghost:"hover:bg-muted", destructive:"bg-red-600 text-white hover:bg-red-700" } as const;
  const sizes={ default:"h-10 px-4 py-2", sm:"h-9 px-3", lg:"h-11 px-8", icon:"h-10 w-10"} as const;
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName="Button";
