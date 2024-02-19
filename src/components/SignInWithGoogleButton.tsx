import { signIn } from "next-auth/react";
import Button, { HTMLButtonProps } from "./buttons/Button";
import GoogleIcon from "./icons/GoogleIcon";
import { cn } from "@/lib/utils/cn";
import { FC, JSX } from "react";

/**
 * Sign in with Google button component
 *
 * @param props The button props
 * @returns JSX.Element
 */
const SignInWithGoogleButton: FC<HTMLButtonProps> = (props): JSX.Element => (
  <Button
    {...props}
    className={cn(
      "border bg-white text-black hover:bg-slate-50 hover:text-black",
      props.className,
    )}
    onClick={(e) => {
      props.onClick?.(e);

      signIn("google", {
        redirect: true,
        callbackUrl: "/",
      });
    }}
  >
    <GoogleIcon /> Login with Google
  </Button>
);

/**
 * Export the component
 */
export default SignInWithGoogleButton;
