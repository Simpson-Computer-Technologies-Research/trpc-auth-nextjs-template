import { cn } from "@/lib/utils/cn";
import { AnchorHTMLAttributes, DetailedHTMLProps, FC, JSX } from "react";

type HTMLLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

/**
 * Link Button Component
 *
 * @param props Button props
 * @returns JSX.Element
 */
const LinkButton: FC<HTMLLinkProps> = (props): JSX.Element => {
  return (
    <a
      {...props}
      className={cn(
        "flex flex-row items-center justify-center gap-2 rounded-md bg-blue-600 px-10 py-3 text-left text-sm text-white duration-100 ease-in-out hover:bg-blue-700 disabled:opacity-50",
        props.className,
      )}
    >
      {props.children}
    </a>
  );
};

/**
 * Export the component
 */
export default LinkButton;
