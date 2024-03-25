/// <reference types="node" />
import { TTableSchema, TColumnDesc, TPrimitiveTypeEntry } from '../../thrift/TCLIService_types';
export interface ArrowBatch {
    batches: Array<Buffer>;
    rowCount: number;
}
export declare function getSchemaColumns(schema?: TTableSchema): Array<TColumnDesc>;
export declare function convertThriftValue(typeDescriptor: TPrimitiveTypeEntry | undefined, value: any): any;
export declare function hiveSchemaToArrowSchema(schema?: TTableSchema): Buffer | undefined;
