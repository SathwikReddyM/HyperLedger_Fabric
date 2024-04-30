import { Context, Contract } from 'fabric-contract-api';
export declare class AssetTransferContract extends Contract {
    InitLedger(ctx: Context): Promise<void>;
    CreateAsset(ctx: Context, Case_ID: string, Evidence_ID: string, State_ID: string, Removal_Owner: string, Removal_reason: string, Timestamp: number): Promise<void>;
    ReadAsset(ctx: Context, Case_ID: string): Promise<string>;
    UpdateAsset(ctx: Context, Case_ID: string, Evidence_ID: string, State_ID: string, Removal_Owner: string, Removal_reason: string, Timestamp: number): Promise<void>;
    DeleteAsset(ctx: Context, Case_ID: string): Promise<void>;
    AssetExists(ctx: Context, Case_ID: string): Promise<boolean>;
    TransferAsset(ctx: Context, Case_ID: string, State_ID: string): Promise<string>;
    GetAllAssets(ctx: Context): Promise<string>;
}
