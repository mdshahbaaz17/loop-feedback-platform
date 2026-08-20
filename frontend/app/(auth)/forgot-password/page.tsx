"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  if (isSent) {
    return (
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">We have sent a password recovery link to your email.</p>
        <Link href="/login">
          <Button className="w-full" variant="outline">Return to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reset your password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
          <Input type="email" required placeholder="name@company.com" />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Sending link..." : "Send reset link"}
        </Button>
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
            Back to sign in
          </Link>
        </div>
      </form>
    </>
  );
}
