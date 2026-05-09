'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';
import { ClientOnly } from '../ClientOnly';

export function WalletConnectButton() {
  const { publicKey, connected } = useWallet();

  return (
    <ClientOnly fallback={
      <button className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200">
        Connect Wallet
      </button>
    }>
      <div className="flex items-center gap-3">
        {connected && publicKey && (
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-neutral-600" />
            <span className="text-xs font-medium text-neutral-700">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </span>
          </div>
        )}
        <WalletMultiButton 
          className="!bg-black !text-white !rounded-lg !px-4 !py-2 !text-sm !font-medium !border-0 hover:!bg-neutral-800 transition-colors !h-auto" 
        />
      </div>
    </ClientOnly>
  );
}
