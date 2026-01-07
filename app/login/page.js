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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      toast.success(`Welcome, ${data.user.name}`);
      router.push('/');
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-black mb-4">Login</h1>
      <form className="card space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="font-semibold">Email</label>
          <input className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" type="email" {...register('email')} />
          {errors.email && <p className="text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="font-semibold">Password</label>
          <input className="mt-1 w-full border-4 border-ink rounded-xl p-2 bg-white" type="password" {...register('password')} />
          {errors.password && <p className="text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn w-full" type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-sm text-ink/70">Demo accounts: user1@example.com ... user30@example.com, password: demo1234</p>
      </form>
    </div>
  );
}
