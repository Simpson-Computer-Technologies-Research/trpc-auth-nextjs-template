import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, DetailedHTMLProps, FC, JSX } from "react";

export type HTMLButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

/**
 * Button Component
 *
 * @param props Button props
 * @returns JSX.Element
 */
const Button: FC<HTMLButtonProps> = (props): JSX.Element => {
  return (
    <button
      {...props}
      className={cn(
        "flex flex-row items-center justify-center gap-2 rounded-md bg-blue-600 px-10 py-3 text-left text-sm text-white duration-100 ease-in-out hover:bg-blue-700 disabled:opacity-50",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
};

/**
 * Export the component
 */
export default Button;
