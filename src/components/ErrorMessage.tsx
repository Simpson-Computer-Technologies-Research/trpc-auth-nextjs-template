import { cn } from "@/lib/utils/cn";
import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode } from "react";

type HTMLParaProps = DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>;

/**
 * Error message component
 *
 * @returns JSX.Element
 */
const ErrorMessage: FC<HTMLParaProps> = (props): JSX.Element => {
  return (
    <p
      {...props}
      className={cn("text-center text-sm text-red-600", props.className)}
    >
      {props.children}
    </p>
  );
};

/**
 * Export the component
 */
export default ErrorMessage;
