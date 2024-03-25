import BaseCommand from './BaseCommand';
import { TCloseOperationReq, TCloseOperationResp } from '../../../thrift/TCLIService_types';
export default class CloseOperationCommand extends BaseCommand {
    execute(data: TCloseOperationReq): Promise<TCloseOperationResp>;
}
