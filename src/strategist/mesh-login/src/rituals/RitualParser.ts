type RitualAction = 'invoke' | 'rewrite' | 'visualize';

interface RitualCommand {
  action: RitualAction;
  target: string;
  parameters: { [key: string]: string | number | boolean };
}

export function parseRitualCommand(command: string): RitualCommand | null {
  const parts = command.split(' ');
  if (parts.length < 2) {
    return null; // Not a valid command format
  }

  const action = parts[0].toLowerCase() as RitualAction;
  if (!['invoke', 'rewrite', 'visualize'].includes(action)) {
    return null; // Unrecognized action
  }

  const target = parts[1];
  const parameters: { [key: string]: string | number | boolean } = {};

  for (let i = 2; i < parts.length; i++) {
    const paramParts = parts[i].split('=');
    if (paramParts.length === 2) {
      const key = paramParts[0];
      const value = paramParts[1];
      // Attempt to parse value as number or boolean
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        parameters[key] = numValue;
      } else if (value.toLowerCase() === 'true') {
        parameters[key] = true;
      } else if (value.toLowerCase() === 'false') {
        parameters[key] = false;
      } else {
        parameters[key] = value;
      }
    } else if (key === 'traits' && value.includes(',')) {
        // Handle comma-separated traits as an array
        parameters[key] = value.split(',');
    } else if (paramParts.length === 1) {
        // Handle parameters without explicit values as boolean flags
        parameters[paramParts[0]] = true;
    }
  }

  // Specific parsing for known commands with structured parameters
  if (action === 'visualize' && target === 'ritualArena') {
      if (typeof parameters['zone'] === 'string') {
          parameters['zoneName'] = parameters['zone'];
          delete parameters['zone']; // Clean up the original parameter
      }
  } else if (action === 'invoke' && target === 'signalComposer') {
      // traits is already parsed as an array if it was comma-separated
      // modulation is already parsed as a string
  }
  // No specific parameter restructuring needed for 'invoke achievementTracker' or 'rewrite strategistModel' currently

  return {
    action,
    target,
    parameters,
  };
}