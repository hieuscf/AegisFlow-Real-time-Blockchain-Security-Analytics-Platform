import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-aegis-mint-muted text-aegis-mint',
        secondary: 'border-aegis-border bg-aegis-elevated text-muted-foreground',
        outline: 'border-aegis-border text-muted-foreground',
        success: 'border-aegis-mint/30 bg-aegis-mint-muted text-aegis-mint',
        warning: 'border-aegis-warning/40 bg-aegis-warning/10 text-aegis-warning',
        critical:
          'border-aegis-negative/40 bg-aegis-negative/10 text-aegis-negative animate-pulse-critical',
        info: 'border-aegis-border bg-aegis-elevated text-aegis-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
