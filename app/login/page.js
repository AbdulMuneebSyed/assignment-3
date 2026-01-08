"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      toast.success(`Welcome, ${data.user.name}`);
      router.push("/");
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4 justify-between">
        <div className="flex items-center gap-3">
          <span className="neo-badge" style={{ background: "var(--accent-2)" }}>
            Auth
          </span>
          <h1 className="text-3xl font-black text-ink">Login</h1>
        </div>
        <span className="neo-badge" style={{ background: "var(--accent)" }}>
          Demo
        </span>
      </div>
      <form
        className="neo-card neo-shadow space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <label className="font-semibold">Email</label>
          <input
            className="neo-input mt-1"
            type="email"
            placeholder="user1@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="font-semibold">Password</label>
          <input
            className="neo-input mt-1"
            type="password"
            placeholder="demo1234"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="neo-btn neo-btn--primary w-full"
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm text-ink/70">
          Demo accounts: user1@example.com ... user30@example.com, password:
          demo1234
        </p>
      </form>
    </div>
  );
}
