import { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata = { title: "Create account — Deal or Steal" };

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <AuthPage mode="sign-up" />
    </Suspense>
  );
}
