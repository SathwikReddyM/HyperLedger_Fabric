/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public docType?: string;

    @Property()
    public Case_ID: string; //ID

    @Property()
    public Evidence_ID: string; // Color

    @Property()
    public State_ID: string; // Size

    @Property()
    public Removal_Owner: string; //Owner

    @Property()
    public Removal_reason: string; //AppraisedValue

    @Property()
    public Timestamp: number; //AppraisedValue
}
