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
  props: PropsWithChildren<ButtonProps>
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
        "btn flex flex-row items-center justify-center gap-2 border border-black px-10 py-3 text-left text-sm duration-300 ease-in-out disabled:opacity-50",
        props.dark
          ? props.disabled
            ? "bg-black text-white"
            : "bg-black text-white hover:bg-white hover:text-black"
          : props.disabled
          ? "text-black"
          : "text-black hover:bg-black hover:text-white",
        props.className
      )}
    >
      {props.children}
    </button>
  );
}
