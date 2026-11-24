export type SkiSide = 'L' | 'R';
export type AxisKey = 'X' | 'Y' | 'Z';

export interface SkiTelemetry {
    timestampMs: number;
    angleX: number;
    angleY: number;
    angleZ: number;
}

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected';

export interface SkiState {
    status: ConnectionStatus;
    data: SkiTelemetry;
}