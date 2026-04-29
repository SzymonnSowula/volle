export * from './receipts';
export * from './payments';

export const BLOCKCHAIN_NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
export const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
