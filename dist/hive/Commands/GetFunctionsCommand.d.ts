import BaseCommand from './BaseCommand';
import { TGetFunctionsReq, TGetFunctionsResp } from '../../../thrift/TCLIService_types';
export default class GetFunctionsCommand extends BaseCommand {
    execute(data: TGetFunctionsReq): Promise<TGetFunctionsResp>;
}
