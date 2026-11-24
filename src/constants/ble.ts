export const BLE_CONFIG = {
    DEVICE_LEFT: 'SkiTracker_L',
    DEVICE_RIGHT: 'SkiTracker_R',
    SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    CHAR_TELEMETRY_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    CHAR_COMMAND_UUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
} as const;

export const BLE_COMMANDS = {
    RESET_ZERO: 0x01,
    RECALIBRATE: 0x02,
} as const;

export const SKI_LIMITS = {
    ROLL_DIFF_MAX: 15.0, // Допуск разницы закантовки (градусы)
    YAW_DIFF_MAX: 5.0,   // Допуск параллельности (градусы)
} as const;