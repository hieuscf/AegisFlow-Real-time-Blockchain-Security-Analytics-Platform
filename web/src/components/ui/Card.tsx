import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-aegis-border bg-aegis-surface p-4 shadow-lg shadow-black/20 ${className}`}
      {...props}
    >
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2> : null}
      {children}
    </div>
  );
}
