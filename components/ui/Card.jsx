export function Card({ children, className = "" }) {
  return <div className={`neo-card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-xl font-black tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
