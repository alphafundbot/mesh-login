import { StrategistEmotion, Node, NodeVisual, MarketEmotion, EntityEmotion, TradingEntity } from './types'; // Assuming types are in a types file

/**
 * Maps a StrategistEmotion to visual properties for a Node.
 * @param emotion The StrategistEmotion of the strategist interacting with the node.
 * @param node The Node object.
 * @returns A NodeVisual object.
 */
export function mapEmotionToNode(emotion: StrategistEmotion, node: Node): NodeVisual {
  let color: string;
  let pulseRate: number;

  switch (emotion) {
    case 'excited':
      color = 'gold';
      pulseRate = 2.0;
      break;
    case 'anxious':
        color = 'orange';
        pulseRate = 1.5;
        break;
    case 'focused':
      color = 'blue';
      pulseRate = 1.0;
      break;
    case 'excited':
      color = 'gold';
      pulseRate = 2.0;
      break; // Duplicate case removed
    default:
      color = 'gray';
      pulseRate = 1.0;
      break;
  }

  // Note: Additional NodeVisual properties that are not emotion-dependent would be handled here
  return {
    color,
    pulseRate,
    // Add other NodeVisual properties here if they exist and are not handled by emotion
  };
}

/**
 * Maps a MarketEmotion to a visual representation (e.g., color, intensity).
 * This is a new function to support the TradingSuite visualization.
 * @param emotion The MarketEmotion of the trading environment.
 * @returns An object representing the visual resonance of the market.
 */
export function mapMarketEmotionToVisual(emotion: MarketEmotion): { resonanceColor: string, intensity: number } {
    switch (emotion) {
        case 'volatile':
            return { resonanceColor: 'red', intensity: 2.0 };
        case 'stable':
            return { resonanceColor: 'green', intensity: 0.5 };
        case 'euphoric':
            return { resonanceColor: 'purple', intensity: 2.5 };
        case 'panicked':
            return { resonanceColor: 'darkred', intensity: 3.0 };
        default:
            return { resonanceColor: 'gray', intensity: 1.0 };
    }
}

/**
 * Maps an EntityEmotion to a visual indicator for a TradingEntity.
 * @param emotion The EntityEmotion of a trading participant.
 * @returns An object representing the visual indicator for the entity.
 */
export function mapEntityEmotionToVisual(emotion: EntityEmotion): { indicatorColor: string } {
    switch (emotion) {
        case 'confident': return { indicatorColor: 'cyan' };
        case 'hesitant': return { indicatorColor: 'yellow' };
        default: return { indicatorColor: 'white' };
    }
}