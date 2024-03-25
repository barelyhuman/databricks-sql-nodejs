import BaseCommand from './BaseCommand';
import { TGetCatalogsReq, TGetCatalogsResp } from '../../../thrift/TCLIService_types';
export default class GetCatalogsCommand extends BaseCommand {
    execute(data: TGetCatalogsReq): Promise<TGetCatalogsResp>;
}
