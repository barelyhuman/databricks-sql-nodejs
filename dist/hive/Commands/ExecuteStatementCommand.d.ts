import BaseCommand from './BaseCommand';
import { TExecuteStatementReq, TExecuteStatementResp } from '../../../thrift/TCLIService_types';
export default class ExecuteStatementCommand extends BaseCommand {
    execute(executeStatementRequest: TExecuteStatementReq): Promise<TExecuteStatementResp>;
}
