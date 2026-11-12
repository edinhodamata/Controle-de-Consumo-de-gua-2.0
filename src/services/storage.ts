import { WaterReading, DataSourceMode, ConsumptionAlertSettings } from '../types/water';
import { DEMO_READINGS } from '../data/demoData';

const STORAGE_KEYS = {
  MODE: 'aguacontrol_source_mode',
  LOCAL_READINGS: 'aguacontrol_user_readings',
  DEMO_READINGS: 'aguacontrol_demo_customized',
  ALERT_SETTINGS: 'aguacontrol_alert_settings',
  THEME: 'aguacontrol_theme',
  LAST_UPDATE: 'aguacontrol_last_update',
};

/**
 * Retrieves the current data source mode ('demo' | 'local').
 * Defaults to 'demo' on first run.
 */
export function getStoredMode(): DataSourceMode {
  try {
    const mode = localStorage.getItem(STORAGE_KEYS.MODE);
    if (mode === 'local' || mode === 'demo') {
      return mode;
    }
  } catch (e) {
    console.warn('LocalStorage unavailable', e);
  }
  return 'demo';
}

/**
 * Saves the selected data source mode.
 */
export function setStoredMode(mode: DataSourceMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to save mode in LocalStorage', e);
  }
}

/**
 * Loads readings according to the current data source mode.
 */
export function loadReadings(mode: DataSourceMode): WaterReading[] {
  try {
    if (mode === 'demo') {
      const customizedDemo = localStorage.getItem(STORAGE_KEYS.DEMO_READINGS);
      if (customizedDemo) {
        return JSON.parse(customizedDemo);
      }
      return [...DEMO_READINGS];
    } else {
      const userReadings = localStorage.getItem(STORAGE_KEYS.LOCAL_READINGS);
      if (userReadings) {
        return JSON.parse(userReadings);
      }
      // If user switches to local for the first time without saving yet, return empty array
      return [];
    }
  } catch (e) {
    console.warn('Failed to parse readings from LocalStorage', e);
    return mode === 'demo' ? [...DEMO_READINGS] : [];
  }
}

/**
 * Persists readings to LocalStorage under the active mode.
 */
export function persistReadings(readings: WaterReading[], mode: DataSourceMode): void {
  try {
    const json = JSON.stringify(readings);
    if (mode === 'demo') {
      localStorage.setItem(STORAGE_KEYS.DEMO_READINGS, json);
    } else {
      localStorage.setItem(STORAGE_KEYS.LOCAL_READINGS, json);
    }
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to persist readings', e);
  }
}

/**
 * Restores the demo dataset completely to original state.
 */
export function resetToDemo(): WaterReading[] {
  try {
    localStorage.removeItem(STORAGE_KEYS.DEMO_READINGS);
    localStorage.setItem(STORAGE_KEYS.MODE, 'demo');
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to reset demo', e);
  }
  return [...DEMO_READINGS];
}

/**
 * Clears local user readings.
 */
export function clearLocalReadings(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOCAL_READINGS);
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to clear local readings', e);
  }
}

/**
 * Gets approximate storage stats for configuration overview.
 */
export function getStorageStats(): {
  totalItems: number;
  estimatedBytes: number;
  lastUpdated: string | null;
} {
  try {
    const demoStr = localStorage.getItem(STORAGE_KEYS.DEMO_READINGS) || '';
    const localStr = localStorage.getItem(STORAGE_KEYS.LOCAL_READINGS) || '';
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const estimatedBytes = (demoStr.length + localStr.length) * 2; // rough UTF-16 bytes
    return {
      totalItems: (demoStr ? JSON.parse(demoStr).length : 0) + (localStr ? JSON.parse(localStr).length : 0),
      estimatedBytes,
      lastUpdated,
    };
  } catch {
    return { totalItems: 0, estimatedBytes: 0, lastUpdated: null };
  }
}

/**
 * Exports data as a downloadable JSON file.
 */
export function exportDataAsJSON(readings: WaterReading[], mode: DataSourceMode): void {
  const payload = {
    app: 'Água Control',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mode,
    readingsCount: readings.length,
    readings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aguacontrol_backup_${mode}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const DEFAULT_ALERT_SETTINGS: ConsumptionAlertSettings = {
  enabled: true,
  limitM3: 10,
  warningThresholdPercent: 80,
};

export function getStoredAlertSettings(): ConsumptionAlertSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERT_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.limitM3 === 'number' && parsed.limitM3 > 0) {
        return {
          enabled: Boolean(parsed.enabled),
          limitM3: parsed.limitM3,
          warningThresholdPercent: parsed.warningThresholdPercent || 80,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load alert settings from LocalStorage', e);
  }
  return DEFAULT_ALERT_SETTINGS;
}

export function setStoredAlertSettings(settings: ConsumptionAlertSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERT_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to persist alert settings to LocalStorage', e);
  }
}

export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'dark' || stored === 'light') return stored;
    // Check system preference if not set
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.warn('Failed to load theme preference', e);
  }
  return 'light';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('Failed to persist theme preference', e);
  }
}
