import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WalletBadge() {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'hidden items-center gap-2 rounded-lg border border-aegis-border',
          'bg-aegis-elevated px-3 py-1.5 sm:flex',
        )}
      >
        <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <span className="font-mono text-xs text-muted-foreground">—</span>
        <span className="text-xs font-medium text-foreground">Not connected</span>
      </div>
      <Button size="sm" className="text-xs font-semibold">
        Connect Wallet
      </Button>
    </div>
  );
}
