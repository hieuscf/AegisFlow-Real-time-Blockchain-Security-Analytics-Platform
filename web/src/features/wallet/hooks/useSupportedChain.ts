import { useAccount, useSwitchChain } from 'wagmi';

import {
  SIWE_CHAIN_ID,
  defaultChain,
  getChainName,
  isSupportedChain,
} from '@/config/chains';

export function useSupportedChain() {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const onSupportedChain = isSupportedChain(chainId);
  const onSiweChain = chainId === SIWE_CHAIN_ID;
  const chainName = getChainName(chainId);

  const switchToDefault = () => {
    switchChain({ chainId: defaultChain.id });
  };

  const switchToSiweChain = () => {
    switchChain({ chainId: SIWE_CHAIN_ID });
  };

  return {
    chainId,
    chainName,
    isConnected,
    onSupportedChain,
    onSiweChain,
    isSwitching,
    switchToDefault,
    switchToSiweChain,
    siweChainName: defaultChain.name,
  };
}
