"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
          <Input type="email" required placeholder="name@company.com" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <Input type="password" required placeholder="••••••••" />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </>
  );
}
