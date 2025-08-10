type SignalGlyph = '⟁' | '⧫' | '⟡' | '⨀';

interface SignalPhrase {
  glyphs: SignalGlyph[];
  meaning: string;
  ritualBinding: RitualCommand;
}