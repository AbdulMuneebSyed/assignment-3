"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NavBar() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      qc.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    },
  });

  return (
    <header className="sticky top-0 z-50 bg-paper">
      <div
        className="border-b-3 neo-shadow"
        style={{ borderColor: "var(--border)", background: "var(--paper)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="MeraEvent"
              width={150}
              height={40}
              priority
            />
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="neo-btn" href="/events">
              Events
            </Link>
            {session?.user && (
              <Link className="neo-btn" href="/events/mine">
                My Events
              </Link>
            )}
            {session?.user && (
              <Link className="neo-btn" href="/events/new">
                Create Event
              </Link>
            )}
            {session?.user ? (
              <button
                className="neo-btn neo-btn--danger"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "..." : "Logout"}
              </button>
            ) : (
              <Link className="neo-btn neo-btn--primary" href="/login">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
