export function Input(props) {
  return <input {...props} className={`neo-input ${props.className || ""}`} />;
}

export function Textarea(props) {
  return (
    <textarea {...props} className={`neo-textarea ${props.className || ""}`} />
  );
}

export function Badge({ children, className = "" }) {
  return <span className={`neo-badge ${className}`}>{children}</span>;
}
