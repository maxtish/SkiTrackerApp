import { Buffer } from 'buffer';
import { SkiTelemetry } from '../types/ski';

export function parseTelemetryPacket(base64Value: string): SkiTelemetry | null {
    const buf = Buffer.from(base64Value, 'base64');
    if (buf.length < 16) return null;

    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return {
        timestampMs: view.getUint32(0, true),
        angleX: view.getFloat32(4, true),
        angleY: view.getFloat32(8, true),
        angleZ: view.getFloat32(12, true),
    };
}

export function encodeCommand(cmd: number): string {
    return Buffer.from([cmd]).toString('base64');
}