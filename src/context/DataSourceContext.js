import React, { createContext, useEffect, useMemo, useState } from 'react';

export const DataSourceContext = createContext({ useMockData: false, setUseMockData: () => {} });

export const DataSourceProvider = ({ children }) => {
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem('useMockData') : null;
  const defaultMock = saved !== null ? saved === 'true' : typeof window !== 'undefined' ? !window.electronAPI : true;
  const [useMockData, setUseMockData] = useState(defaultMock);

  useEffect(() => {
    try {
      window.localStorage.setItem('useMockData', String(useMockData));
    } catch (e) {
      // ignore storage errors
    }
  }, [useMockData]);

  const value = useMemo(() => ({ useMockData, setUseMockData }), [useMockData]);

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

