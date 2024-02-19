import { cn } from "@/lib/utils/cn";
import { FC, SVGProps, JSX } from "react";

/**
 * Loading Spinner Center Component
 *
 * @returns JSX.Element
 */
export const LoadingSpinnerCenter: FC = (): JSX.Element => {
  return (
    <section className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
      <LoadingSpinner />
    </section>
  );
};

/**
 * Loading Spinner Component
 *
 * @param props The component props
 * @returns JSX.Element
 */
export const LoadingSpinner: FC<SVGProps<SVGSVGElement>> = (
  props,
): JSX.Element => {
  return (
    <svg
      {...props}
      className={cn("h-20 w-20 animate-spin text-white", props.className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0
            12h4zm2 5.291A7.962 7.962 0 014 12H0c0
            3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};
