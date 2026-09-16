import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { SystemConfig } from '../types';

import { INITIAL_SYSTEM_CONFIG } from '../services/mockData';

interface SystemContextType {
  config: SystemConfig;
  apiStatus: 'ONLINE' | 'OFFLINE_MOCK';
  isCheckingStatus: boolean;
  toggleMaintenanceMode: () => Promise<void>;
  updateMaintenanceMessage: (msg: string) => Promise<void>;
  checkApiHealth: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [apiStatus, setApiStatus] = useState<'ONLINE' | 'OFFLINE_MOCK'>('ONLINE');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  const checkApiHealth = async () => {
    setIsCheckingStatus(true);
    try {
      // Mengirim HEAD request ke root API atau endpoint publik agar tidak memicu 401 Unauthorized
      await apiClient.get('/events', { timeout: 2500 });
      setApiStatus('ONLINE');
    } catch (err: any) {
      // Jika status 401/403/404, server Go tetap online
      if (err.response) {
        setApiStatus('ONLINE');
      } else {
        setApiStatus('OFFLINE_MOCK');
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const toggleMaintenanceMode = async () => {
    setConfig((prev) => ({ ...prev, maintenance_mode: !prev.maintenance_mode }));
  };

  const updateMaintenanceMessage = async (msg: string) => {
    setConfig((prev) => ({ ...prev, maintenance_message: msg }));
  };

  return (
    <SystemContext.Provider
      value={{
        config,
        apiStatus,
        isCheckingStatus,
        toggleMaintenanceMode,
        updateMaintenanceMessage,
        checkApiHealth
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};