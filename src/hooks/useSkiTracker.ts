import { useEffect, useState } from 'react';
import { BLE_COMMANDS } from '../constants/ble';
import { bleService } from '../services/bleService';
import { AxisKey, SkiState, SkiTelemetry } from '../types/ski';
import { SkiSettings } from './useSettings';

const EMPTY_DATA: SkiTelemetry = { timestampMs: 0, angleX: 0, angleY: 0, angleZ: 0 };

function getAxisValue(data: SkiTelemetry, axis: AxisKey): number {
    if (axis === 'X') return data.angleX;
    if (axis === 'Y') return data.angleY;
    return data.angleZ;
}

export function useSkiTracker(settings: SkiSettings) {
    const [left, setLeft] = useState<SkiState>({ status: 'disconnected', data: EMPTY_DATA });
    const [right, setRight] = useState<SkiState>({ status: 'disconnected', data: EMPTY_DATA });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        bleService.setCallbacks(
            (side, data) => {
                if (side === 'L') setLeft(prev => ({ ...prev, data }));
                else setRight(prev => ({ ...prev, data }));
            },
            (side, status) => {
                if (side === 'L') setLeft(prev => ({ ...prev, status }));
                else setRight(prev => ({ ...prev, status }));
            },
        );
        return () => { bleService.disconnectAll(); };
    }, []);

    const connect = async () => {
        setError(null);
        try {
            await bleService.startScanAndConnect();
        } catch (e: any) {
            setError(e?.message ?? 'Ошибка Bluetooth');
        }
    };

    const disconnect = () => bleService.disconnectAll();
    const resetZero = () => bleService.sendCommandToAll(BLE_COMMANDS.RESET_ZERO);
    const recalibrate = () => bleService.sendCommandToAll(BLE_COMMANDS.RECALIBRATE);

    const rollL = getAxisValue(left.data, settings.rollAxisL) * settings.sensitivity * (settings.invertRollL ? -1 : 1);
    const rollR = getAxisValue(right.data, settings.rollAxisR) * settings.sensitivity * (settings.invertRollR ? -1 : 1);
    const yawL = getAxisValue(left.data, settings.yawAxisL) * settings.sensitivity;
    const yawR = getAxisValue(right.data, settings.yawAxisR) * settings.sensitivity;

    const diffRoll = Math.abs(rollL - rollR);
    const diffYaw = Math.abs(yawL - yawR);

    return {
        leftStatus: left.status,
        rightStatus: right.status,
        rawLeft: left.data,
        rawRight: right.data,
        rollL,
        rollR,
        yawL,
        yawR,
        diffRoll,
        diffYaw,
        isRollError: diffRoll > settings.rollLimit,
        isYawError: diffYaw > settings.yawLimit,
        error,
        connect,
        disconnect,
        resetZero,
        recalibrate,
    };
}