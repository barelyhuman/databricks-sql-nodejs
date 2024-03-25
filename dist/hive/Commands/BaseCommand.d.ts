import TCLIService from '../../../thrift/TCLIService';
import IClientContext from '../../contracts/IClientContext';
export default abstract class BaseCommand {
    protected client: TCLIService.Client;
    protected context: IClientContext;
    constructor(client: TCLIService.Client, context: IClientContext);
    protected executeCommand<Response>(request: object, command: Function | void): Promise<Response>;
    private invokeCommand;
}
