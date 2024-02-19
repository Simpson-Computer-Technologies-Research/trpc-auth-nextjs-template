import { cn } from "@/lib/utils/cn";
import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode, JSX } from "react";

type HTMLElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

/**
 * Main Wrapper Component
 *
 * @param props Main Wrapper props
 * @returns JSX.Element
 */
const MainWrapper: FC<HTMLElementProps> = (props): JSX.Element => {
  return (
    <main
      {...props}
      className={cn(
        "flex min-h-screen w-screen flex-col items-center justify-center p-24",
        props.className,
      )}
    >
      {props.children}
    </main>
  );
};

/**
 * Export the component
 */
export default MainWrapper;
