import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({className,...p},ref)=><input ref={ref} className={cn("flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",className)} {...p} />);
Input.displayName="Input";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({className,...p},ref)=><textarea ref={ref} className={cn("flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm",className)} {...p} />);
Textarea.displayName="Textarea";
export const Label = ({className,...p}:React.LabelHTMLAttributes<HTMLLabelElement>)=><label className={cn("text-sm font-medium",className)} {...p} />;
