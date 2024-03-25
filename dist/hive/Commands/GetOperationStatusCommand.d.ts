import BaseCommand from './BaseCommand';
import { TGetOperationStatusReq, TGetOperationStatusResp } from '../../../thrift/TCLIService_types';
export default class GetOperationStatusCommand extends BaseCommand {
    execute(data: TGetOperationStatusReq): Promise<TGetOperationStatusResp>;
}
