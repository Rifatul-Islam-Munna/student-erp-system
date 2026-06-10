import { cn } from "@/lib/utils";

export default function Logo({ classNameFull, classNameMobile }: { classNameFull?: string; classNameMobile?: string }) {
  return (
    <>
      <div className={cn("items-center gap-3 text-text-primary", classNameFull ?? "flex")}>
        <img src="/brand/logo-web-it.png" alt="Nexus Solution" className="h-10 w-auto object-contain" />
        <span className="text-lg font-semibold tracking-tight">Nexus Solution</span>
      </div>

      <div className={cn("items-center", classNameMobile ?? "flex")}>
        <img src="/brand/logo-web-it.png" alt="Nexus Solution" className="h-10 w-auto object-contain" />
      </div>
    </>
  );
}
