interface Signal {
  base: string;
  traits: string[];
  modulation: string;
}

function composeSignal(config: { base: string; traits: string[]; modulation: string }): Signal {
  return {
    base: config.base,
    traits: config.traits,
    modulation: config.modulation,
  };
}

function activateSignal(signal: Signal): void {
  console.log(`Signal activated: Base: ${signal.base}, Traits: ${signal.traits.join(', ')}, Modulation: ${signal.modulation}`);
}
interface Signal {
  base: string;
  traits: string[];
  modulation: string;
}

function composeSignal(config: { base: string; traits: string[]; modulation: string }): Signal {
  return {
    base: config.base,
    traits: config.traits,
    modulation: config.modulation,
  };
}

function activateSignal(signal: Signal): void {
  console.log(`Signal activated: Base: ${signal.base}, Traits: ${signal.traits.join(', ')}, Modulation: ${signal.modulation}`);
}