import { TProgressUpdateResp } from '../../thrift/TCLIService_types';
export declare class ProgressUpdateTransformer {
    private progressUpdate;
    private rowWidth;
    constructor(progressUpdate: TProgressUpdateResp);
    formatRow(row: Array<string>): string;
    toString(): string;
}
export default function formatProgress(progressUpdate: TProgressUpdateResp): string;
