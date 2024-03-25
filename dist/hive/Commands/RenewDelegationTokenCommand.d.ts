import BaseCommand from './BaseCommand';
import { TRenewDelegationTokenReq, TRenewDelegationTokenResp } from '../../../thrift/TCLIService_types';
export default class RenewDelegationTokenCommand extends BaseCommand {
    execute(data: TRenewDelegationTokenReq): Promise<TRenewDelegationTokenResp>;
}
