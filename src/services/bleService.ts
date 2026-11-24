import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { BLE_CONFIG } from '../constants/ble';
import { ConnectionStatus, SkiSide, SkiTelemetry } from '../types/ski';
import { encodeCommand, parseTelemetryPacket } from '../utils/packetParser';

type TelemetryCallback = (side: SkiSide, data: SkiTelemetry) => void;
type StatusCallback = (side: SkiSide, status: ConnectionStatus) => void;

class SkiBleService {
    private manager = new BleManager();
    private devices: Record<SkiSide, Device | null> = { L: null, R: null };
    private connecting: Record<SkiSide, boolean> = { L: false, R: false };
    private subscriptions: Record<SkiSide, Subscription | null> = { L: null, R: null };

    private onTelemetry?: TelemetryCallback;
    private onStatus?: StatusCallback;

    public setCallbacks(onTelemetry: TelemetryCallback, onStatus: StatusCallback) {
        this.onTelemetry = onTelemetry;
        this.onStatus = onStatus;
    }

    public async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') return true;

        if (Platform.Version >= 31) {
            const res = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
            return (
                res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
                res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
            );
        } else {
            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            return res === PermissionsAndroid.RESULTS.GRANTED;
        }
    }

    public async startScanAndConnect(): Promise<void> {
        const granted = await this.requestPermissions();
        if (!granted) {
            throw new Error('Нет разрешений на Bluetooth');
        }

        if (!this.devices.L) this.onStatus?.('L', 'scanning');
        if (!this.devices.R) this.onStatus?.('R', 'scanning');

        this.manager.startDeviceScan(
            [BLE_CONFIG.SERVICE_UUID],
            { allowDuplicates: false },
            (error, device) => {
                if (error || !device) return;

                const name = device.name || device.localName;
                if (name === BLE_CONFIG.DEVICE_LEFT && !this.devices.L && !this.connecting.L) {
                    this.connectSide('L', device);
                } else if (name === BLE_CONFIG.DEVICE_RIGHT && !this.devices.R && !this.connecting.R) {
                    this.connectSide('R', device);
                }
            },
        );
    }

    public stopScan() {
        this.manager.stopDeviceScan();
    }

    private async connectSide(side: SkiSide, device: Device) {
        this.connecting[side] = true;
        this.onStatus?.(side, 'connecting');

        try {
            const connected = await device.connect({ autoConnect: false });
            await connected.discoverAllServicesAndCharacteristics();

            this.devices[side] = connected;
            this.connecting[side] = false;
            this.onStatus?.(side, 'connected');

            // Если обе лыжи подключены — останавливаем сканирование для экономии батареи
            if (this.devices.L && this.devices.R) {
                this.stopScan();
            }

            connected.onDisconnected(() => {
                this.subscriptions[side]?.remove();
                this.subscriptions[side] = null;
                this.devices[side] = null;
                this.connecting[side] = false;
                this.onStatus?.(side, 'disconnected');
            });

            this.subscriptions[side] = connected.monitorCharacteristicForService(
                BLE_CONFIG.SERVICE_UUID,
                BLE_CONFIG.CHAR_TELEMETRY_UUID,
                (err, char) => {
                    if (err || !char?.value) return;
                    const parsed = parseTelemetryPacket(char.value);
                    if (parsed) {
                        this.onTelemetry?.(side, parsed);
                    }
                },
            );
        } catch {
            this.connecting[side] = false;
            this.devices[side] = null;
            this.onStatus?.(side, 'disconnected');
        }
    }

    public async sendCommandToAll(cmd: number): Promise<void> {
        const payload = encodeCommand(cmd);
        const sides: SkiSide[] = ['L', 'R'];

        await Promise.all(
            sides.map(async side => {
                const dev = this.devices[side];
                if (!dev) return;
                try {
                    await dev.writeCharacteristicWithoutResponseForService(
                        BLE_CONFIG.SERVICE_UUID,
                        BLE_CONFIG.CHAR_COMMAND_UUID,
                        payload,
                    );
                } catch {
                    // Игнорируем, если устройство отключилось в момент отправки
                }
            }),
        );
    }

    public async disconnectAll(): Promise<void> {
        this.stopScan();
        const sides: SkiSide[] = ['L', 'R'];

        await Promise.all(
            sides.map(async side => {
                this.subscriptions[side]?.remove();
                this.subscriptions[side] = null;
                if (this.devices[side]) {
                    try {
                        await this.devices[side]?.cancelConnection();
                    } catch { }
                    this.devices[side] = null;
                }
                this.connecting[side] = false;
                this.onStatus?.(side, 'disconnected');
            }),
        );
    }
}

export const bleService = new SkiBleService();