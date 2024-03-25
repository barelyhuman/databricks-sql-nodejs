import BaseCommand from './BaseCommand';
import { TGetResultSetMetadataReq, TGetResultSetMetadataResp } from '../../../thrift/TCLIService_types';
export default class GetResultSetMetadataCommand extends BaseCommand {
    execute(getResultSetMetadataRequest: TGetResultSetMetadataReq): Promise<TGetResultSetMetadataResp>;
}
