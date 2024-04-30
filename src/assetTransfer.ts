/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset} from './asset';
import { getPriority } from 'os';

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                Case_ID: 'case1',
                Evidence_ID: 'evidence1',
                State_ID: "Initiated",
                Removal_Owner: 'None',
                Removal_reason: 'None',
                Timestamp: Date.now(),
            },
            {
                Case_ID: 'case2',
                Evidence_ID: 'evidence2',
                State_ID: "Initiated",
                Removal_Owner: 'None',
                Removal_reason: 'None',
                Timestamp: Date.now(),
            },
            {
                Case_ID: 'case3',
                Evidence_ID: 'evidence3',
                State_ID: "Initiated",
                Removal_Owner: 'None',
                Removal_reason: 'None',
                Timestamp: Date.now(),
            },

        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.Case_ID, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.Case_ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, Case_ID: string, Evidence_ID: string, State_ID: string, Removal_Owner: string, Removal_reason: string): Promise<void> {
        const exists = await this.AssetExists(ctx, Case_ID);
        if (exists) {
            throw new Error(`The asset ${Case_ID} already exists`);
        }

        const asset = {
            Case_ID: Case_ID,
            Evidence_ID: Evidence_ID,
            State_ID: State_ID,
            Removal_Owner: Removal_Owner,
            Removal_reason: Removal_reason,
            Timestamp: Date.now(),
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(Case_ID, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, Case_ID: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(Case_ID); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${Case_ID} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, Case_ID: string, Evidence_ID: string, State_ID: string, Removal_Owner: string, Removal_reason: string): Promise<void> {
        const exists = await this.AssetExists(ctx, Case_ID);
        if (!exists) {
            throw new Error(`The asset ${Case_ID} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            Case_ID: Case_ID,
            Evidence_ID: Evidence_ID,
            State_ID: State_ID,
            Removal_Owner: Removal_Owner,
            Removal_reason: Removal_reason,
            Timestamp: Date.now(),
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(Case_ID, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, Case_ID: string, State_ID: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, Case_ID);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.State_ID;
        asset.State_ID = State_ID;
        asset.Timestamp = Date.now();
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(Case_ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    /*@Transaction()
    public async RemoveAsset(ctx: Context, Case_ID: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, Case_ID);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.State_ID;
        asset.State_ID = 'Removed';
        asset.Removal_reason = 'Disposed';
        asset.Timestamp = Date.now();
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(Case_ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }*/

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}

