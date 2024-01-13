import { signIn } from "next-auth/react";
import Button from "./Button";
import GoogleSvg from "./svgs/GoogleSvg";
import { cn } from "@/lib/utils/cn";

export default function SignInWithGoogleButton(props: {
  className?: string;
}): JSX.Element {
  return (
    <Button
      type="button"
      className={cn(
        "border bg-white text-black hover:bg-slate-50 hover:text-black",
        props.className,
      )}
      onClick={() =>
        signIn("google", {
          redirect: true,
          callbackUrl: "/",
        })
      }
    >
      <GoogleSvg /> Login with Google
    </Button>
  );
}
