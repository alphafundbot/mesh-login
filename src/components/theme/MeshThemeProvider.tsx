import React, { createContext, useContext, useState } from 'react';
import { designTokens } from '../../design/DesignTokenReceiver';

const MeshThemeContext = createContext({ mode: 'light', toggle: () => {} });

export const useMeshTheme = () => useContext(MeshThemeContext);

const MeshThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggle = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const themeStyles = {
    backgroundColor: mode === 'light' ? designTokens.colors.background : '#1e1e1e',
    color: mode === 'light' ? designTokens.colors.text : '#ffffff',
    minHeight: '100vh',
  };

  return (
    <MeshThemeContext.Provider value={{ mode, toggle }}>
      <div style={themeStyles}>
        {children}
      </div>
    </MeshThemeContext.Provider>
  );
};

export default MeshThemeProvider;