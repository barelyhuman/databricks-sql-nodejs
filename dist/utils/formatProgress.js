"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressUpdateTransformer = void 0;
class ProgressUpdateTransformer {
    constructor(progressUpdate) {
        this.rowWidth = 10;
        this.progressUpdate = progressUpdate;
    }
    formatRow(row) {
        return row.map((cell) => cell.padEnd(this.rowWidth, ' ')).join('|');
    }
    toString() {
        const header = this.formatRow(this.progressUpdate.headerNames);
        const footer = this.progressUpdate.footerSummary;
        const rows = this.progressUpdate.rows.map((row) => this.formatRow(row));
        return [header, ...rows, footer].join('\n');
    }
}
exports.ProgressUpdateTransformer = ProgressUpdateTransformer;
function formatProgress(progressUpdate) {
    return String(new ProgressUpdateTransformer(progressUpdate));
}
exports.default = formatProgress;
//# sourceMappingURL=formatProgress.js.map