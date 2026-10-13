"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not sign in");

      router.replace(returnTo);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-950"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-950"
        />
      </label>
      {error ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-md bg-neutral-950 px-4 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in as admin"}
      </button>
    </form>
  );
}
