import BaseCommand from './BaseCommand';
import { TGetDelegationTokenReq, TGetDelegationTokenResp } from '../../../thrift/TCLIService_types';
export default class GetDelegationTokenCommand extends BaseCommand {
    execute(data: TGetDelegationTokenReq): Promise<TGetDelegationTokenResp>;
}
