import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('CnrBFrZP2kwZWYbev3xzTJsDJGK6bTe1HBaNtQ55JSxx');

export function getServerConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
  return new Connection(rpcUrl, 'confirmed');
}

export function findTreasuryPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), owner.toBuffer()],
    PROGRAM_ID
  );
}

export async function getTreasuryBalanceServer(ownerAddress: string): Promise<number> {
  try {
    const connection = getServerConnection();
    const owner = new PublicKey(ownerAddress);
    const [treasuryPDA] = findTreasuryPDA(owner);
    const balanceLamports = await connection.getBalance(treasuryPDA);
    return balanceLamports / 1e9;
  } catch (err) {
    console.error('[Server Treasury] Failed to get balance:', err);
    return 0;
  }
}

export async function treasuryExists(ownerAddress: string): Promise<boolean> {
  try {
    const connection = getServerConnection();
    const owner = new PublicKey(ownerAddress);
    const [treasuryPDA] = findTreasuryPDA(owner);
    const account = await connection.getAccountInfo(treasuryPDA);
    return account !== null;
  } catch {
    return false;
  }
}
