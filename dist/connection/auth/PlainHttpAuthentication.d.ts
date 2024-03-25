import { HeadersInit } from 'node-fetch';
import IAuthentication from '../contracts/IAuthentication';
import IClientContext from '../../contracts/IClientContext';
interface PlainHttpAuthenticationOptions {
    username?: string;
    password?: string;
    headers?: HeadersInit;
    context: IClientContext;
}
export default class PlainHttpAuthentication implements IAuthentication {
    private readonly context;
    private readonly username;
    private readonly password;
    private readonly headers;
    constructor(options: PlainHttpAuthenticationOptions);
    authenticate(): Promise<HeadersInit>;
}
export {};
