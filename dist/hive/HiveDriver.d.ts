import { TOpenSessionReq, TCloseSessionReq, TExecuteStatementReq, TGetResultSetMetadataReq, TFetchResultsReq, TGetInfoReq, TGetTypeInfoReq, TGetCatalogsReq, TGetSchemasReq, TGetTablesReq, TGetTableTypesReq, TGetColumnsReq, TGetFunctionsReq, TGetPrimaryKeysReq, TGetCrossReferenceReq, TGetOperationStatusReq, TCancelOperationReq, TCloseOperationReq, TGetDelegationTokenReq, TCancelDelegationTokenReq, TRenewDelegationTokenReq } from '../../thrift/TCLIService_types';
import IDriver from '../contracts/IDriver';
import IClientContext from '../contracts/IClientContext';
export interface HiveDriverOptions {
    context: IClientContext;
}
export default class HiveDriver implements IDriver {
    private readonly context;
    constructor(options: HiveDriverOptions);
    openSession(request: TOpenSessionReq): Promise<import("../../thrift/TCLIService_types").TOpenSessionResp>;
    closeSession(request: TCloseSessionReq): Promise<import("../../thrift/TCLIService_types").TCloseSessionResp>;
    executeStatement(request: TExecuteStatementReq): Promise<import("../../thrift/TCLIService_types").TExecuteStatementResp>;
    getResultSetMetadata(request: TGetResultSetMetadataReq): Promise<import("../../thrift/TCLIService_types").TGetResultSetMetadataResp>;
    fetchResults(request: TFetchResultsReq): Promise<import("../../thrift/TCLIService_types").TFetchResultsResp>;
    getInfo(request: TGetInfoReq): Promise<import("../../thrift/TCLIService_types").TGetInfoResp>;
    getTypeInfo(request: TGetTypeInfoReq): Promise<import("../../thrift/TCLIService_types").TGetTypeInfoResp>;
    getCatalogs(request: TGetCatalogsReq): Promise<import("../../thrift/TCLIService_types").TGetCatalogsResp>;
    getSchemas(request: TGetSchemasReq): Promise<import("../../thrift/TCLIService_types").TGetSchemasResp>;
    getTables(request: TGetTablesReq): Promise<import("../../thrift/TCLIService_types").TGetTablesResp>;
    getTableTypes(request: TGetTableTypesReq): Promise<import("../../thrift/TCLIService_types").TGetTableTypesResp>;
    getColumns(request: TGetColumnsReq): Promise<import("../../thrift/TCLIService_types").TGetColumnsResp>;
    getFunctions(request: TGetFunctionsReq): Promise<import("../../thrift/TCLIService_types").TGetFunctionsResp>;
    getPrimaryKeys(request: TGetPrimaryKeysReq): Promise<import("../../thrift/TCLIService_types").TGetPrimaryKeysResp>;
    getCrossReference(request: TGetCrossReferenceReq): Promise<import("../../thrift/TCLIService_types").TGetCrossReferenceResp>;
    getOperationStatus(request: TGetOperationStatusReq): Promise<import("../../thrift/TCLIService_types").TGetOperationStatusResp>;
    cancelOperation(request: TCancelOperationReq): Promise<import("../../thrift/TCLIService_types").TCancelOperationResp>;
    closeOperation(request: TCloseOperationReq): Promise<import("../../thrift/TCLIService_types").TCloseOperationResp>;
    getDelegationToken(request: TGetDelegationTokenReq): Promise<import("../../thrift/TCLIService_types").TGetDelegationTokenResp>;
    cancelDelegationToken(request: TCancelDelegationTokenReq): Promise<import("../../thrift/TCLIService_types").TCancelDelegationTokenResp>;
    renewDelegationToken(request: TRenewDelegationTokenReq): Promise<import("../../thrift/TCLIService_types").TRenewDelegationTokenResp>;
}
