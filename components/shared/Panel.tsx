import { cn } from "@/lib/utils";

export function Panel({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-line bg-panel p-5 shadow-[0_0_24px_rgba(2,255,64,0.04)]", className)}>
      {children}
    </section>
  );
}
