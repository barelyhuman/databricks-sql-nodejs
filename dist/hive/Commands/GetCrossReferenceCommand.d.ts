import BaseCommand from './BaseCommand';
import { TGetCrossReferenceReq, TGetCrossReferenceResp } from '../../../thrift/TCLIService_types';
export default class GetCrossReferenceCommand extends BaseCommand {
    execute(data: TGetCrossReferenceReq): Promise<TGetCrossReferenceResp>;
}
