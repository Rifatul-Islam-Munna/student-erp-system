import { cn } from "@/lib/utils";

export default function Logo({ classNameFull, classNameMobile }: { classNameFull?: string; classNameMobile?: string }) {
  const resolvedClassName = classNameFull ?? (classNameMobile === "hidden" ? undefined : classNameMobile);

  return (
    <div className={cn("flex items-center", resolvedClassName)}>
      <img
        src="/brand/logo-web-it.png"
        alt="Nexus Solution"
        className="h-9 max-w-[11rem] w-auto object-contain md:h-10 md:max-w-[12rem]"
      />
    </div>
  );
}
