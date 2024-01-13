import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

export default function MainWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "flex min-h-screen w-screen flex-col items-center justify-center p-24",
        className,
      )}
    >
      {children}
    </main>
  );
}
