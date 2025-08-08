
import telecomSignalHistory from './telecom-signal-history-2025-08-08.json';

export interface Snapshot {
    slug: string;
    label: string;
    description: string;
    data: {
        logs: string;
    }
}

export const snapshotRegistry: Snapshot[] = [
    {
        slug: 'telecom-anomaly',
        label: 'Telecom Anomaly 2025-08-08',
        description: 'Snapshot of the signal history surrounding the Lidar Feed latency anomaly and its resolution.',
        data: {
            logs: telecomSignalHistory.logs
        }
    }
];

export const getSnapshotBySlug = (slug: string): Snapshot | undefined => {
    return snapshotRegistry.find(s => s.slug === slug);
}
