import BaseCommand from './BaseCommand';
import { TCancelDelegationTokenReq, TCancelDelegationTokenResp } from '../../../thrift/TCLIService_types';
export default class CancelDelegationTokenCommand extends BaseCommand {
    execute(data: TCancelDelegationTokenReq): Promise<TCancelDelegationTokenResp>;
}
