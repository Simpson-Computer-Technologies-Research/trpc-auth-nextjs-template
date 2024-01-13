import { cn } from "@/lib/utils/cn";
import { PropsWithChildren } from "react";

interface ButtonProps {
  className?: string;
  dark?: boolean;
  disabled?: boolean;
  href?: string;
  target?: "_blank";
  type?: "button" | "submit" | "reset";
  onClick?: (event: any) => void;
}
export default function Button(
  props: PropsWithChildren<ButtonProps>,
): JSX.Element {
  return (
    <button
      type={props.type}
      disabled={props.disabled}
      onClick={(e) => {
        props.onClick && props.onClick(e);

        if (props.href) {
          props.target === "_blank"
            ? window.open(props.href, "_blank")
            : (window.location.href = props.href);
        }
      }}
      className={cn(
        "flex flex-row items-center justify-center gap-2 rounded-md bg-blue-600 px-10 py-3 text-left text-sm text-white duration-100 ease-in-out hover:bg-blue-700 disabled:opacity-50",
        props.disabled ? "" : "",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
