import BaseCommand from './BaseCommand';
import { TGetTypeInfoReq, TGetTypeInfoResp } from '../../../thrift/TCLIService_types';
export default class GetTypeInfoCommand extends BaseCommand {
    execute(data: TGetTypeInfoReq): Promise<TGetTypeInfoResp>;
}
