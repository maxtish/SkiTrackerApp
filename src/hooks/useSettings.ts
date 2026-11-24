import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AxisKey } from '../types/ski';

const STORAGE_KEY = '@ski_tracker_settings_v2';

export interface SkiSettings {
    rollLimit: number;
    yawLimit: number;
    sensitivity: number;
    invertRollL: boolean;
    invertRollR: boolean;
    rollAxisL: AxisKey;
    yawAxisL: AxisKey;
    rollAxisR: AxisKey;
    yawAxisR: AxisKey;
}

export const DEFAULT_SETTINGS: SkiSettings = {
    rollLimit: 15.0,
    yawLimit: 5.0,
    sensitivity: 1.0,
    invertRollL: false,
    invertRollR: false,
    rollAxisL: 'X',
    yawAxisL: 'Z',
    rollAxisR: 'X',
    yawAxisR: 'Z',
};

export function useSettings() {
    const [settings, setSettings] = useState<SkiSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then(raw => {
                if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
            })
            .catch(() => { });
    }, []);

    const updateSettings = (patch: Partial<SkiSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...patch };
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
            return next;
        });
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS)).catch(() => { });
    };

    return { settings, updateSettings, resetSettings };
}