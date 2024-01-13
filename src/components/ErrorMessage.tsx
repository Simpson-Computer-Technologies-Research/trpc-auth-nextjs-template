import { ReactNode } from "react";

/**
 * Error message component
 * @returns JSX.Element
 */
export default function ErrorMessage({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <p className="text-center text-xs text-red-600 lg:text-base">{children}</p>
  );
}
