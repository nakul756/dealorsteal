import { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata = { title: "Sign in — Deal or Steal" };

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <AuthPage mode="sign-in" />
    </Suspense>
  );
}
