/// <reference types="node" />
/// <reference types="node-int64" />
import { TGetInfoValue } from '../../thrift/TCLIService_types';
import { Int64 } from '../hive/Types';
type InfoResultType = string | number | Buffer | Int64 | null;
export default class InfoValue {
    private value;
    constructor(value: TGetInfoValue);
    getValue(): InfoResultType;
}
export {};
