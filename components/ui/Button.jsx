"use client";
import clsx from "clsx";

export default function Button({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const base = "neo-btn";
  const variantClass =
    variant === "primary"
      ? "neo-btn--primary"
      : variant === "danger"
      ? "neo-btn--danger"
      : "";
  return (
    <button className={clsx(base, variantClass, className)} {...props}>
      {children}
    </button>
  );
}
