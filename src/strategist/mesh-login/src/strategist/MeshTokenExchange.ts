import { Strategist } from './StrategistTypes'; // Assuming Strategist type is in StrategistTypes.ts
import { MeshToken } from './MeshTokenTypes'; // Assuming MeshToken type is in MeshTokenTypes.ts

// Define the TradeOffer type
interface TradeOffer {
  offerId: string;
  from: Strategist;
  to: Strategist;
  token: MeshToken;
  value: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

/**
 * Creates a new trade offer between two strategists.
 * @param from - The strategist making the offer.
 * @param to - The strategist receiving the offer.
 * @param token - The token being offered.
 * @param value - The value requested for the token (e.g., other tokens, or abstract value).
 * @returns A TradeOffer object.
 */
function createTradeOffer(from: Strategist, to: Strategist, token: MeshToken, value: number): TradeOffer {
  const offerId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Simple unique ID
  return {
    offerId,
    from,
    to,
    token,
    value,
    status: 'pending',
  };
}