function mintToken(action: StrategistAction): MeshToken {
  const tokenValue = action.type === 'axiomRewrite' ? 100 : 50;
  return {
    id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Adding random suffix for better uniqueness
    type: 'ritual',
    value: tokenValue,
    metadata: {
      strategist: action.strategist,
      ritual: action.type,
      timestamp: Date.now(),
    },
  };
}