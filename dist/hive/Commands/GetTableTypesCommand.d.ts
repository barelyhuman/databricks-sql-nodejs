import BaseCommand from './BaseCommand';
import { TGetTableTypesReq, TGetTableTypesResp } from '../../../thrift/TCLIService_types';
export default class GetTableTypesCommand extends BaseCommand {
    execute(data: TGetTableTypesReq): Promise<TGetTableTypesResp>;
}
