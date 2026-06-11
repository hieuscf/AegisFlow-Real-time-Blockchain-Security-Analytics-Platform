import { AlertTriangle, Loader2 } from 'lucide-react';

import { useSupportedChain } from '@/features/wallet/hooks/useSupportedChain';
import { cn } from '@/lib/utils';

interface WrongNetworkBannerProps {
  /** When true, require Ethereum Mainnet (SIWE chain id 1). */
  requireSiweChain?: boolean;
  className?: string;
}

export function WrongNetworkBanner({
  requireSiweChain = false,
  className,
}: WrongNetworkBannerProps) {
  const {
    isConnected,
    onSupportedChain,
    onSiweChain,
    chainName,
    siweChainName,
    isSwitching,
    switchToDefault,
    switchToSiweChain,
  } = useSupportedChain();

  if (!isConnected) return null;

  const needsSwitch = requireSiweChain ? !onSiweChain : !onSupportedChain;
  if (!needsSwitch) return null;

  const targetLabel = requireSiweChain ? siweChainName : 'a supported network';
  const handleSwitch = requireSiweChain ? switchToSiweChain : switchToDefault;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aegis-warning/30 bg-aegis-warning/10 px-4 py-3',
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-2 text-xs text-aegis-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Wrong network</p>
          <p className="mt-0.5 text-aegis-warning/80">
            Connected to <strong>{chainName}</strong>. Switch to {targetLabel} to continue
            {requireSiweChain ? ' (required for Sign-In with Ethereum)' : ''}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSwitch}
        disabled={isSwitching}
        className="shrink-0 rounded-lg border border-aegis-warning/40 bg-aegis-warning/15 px-3 py-1.5 text-xs font-semibold text-aegis-warning transition-colors hover:bg-aegis-warning/25 disabled:opacity-60"
      >
        {isSwitching ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Switching…
          </span>
        ) : (
          `Switch to ${targetLabel}`
        )}
      </button>
    </div>
  );
}
