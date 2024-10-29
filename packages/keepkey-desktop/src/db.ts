// db.ts
import path from 'path';
import os from 'os';
import fs from 'fs';
import DB from '@coinmasters/pioneer-db-sql';

interface Pubkey {
    networkId: string;
    pubkey: string;
    // Add any additional fields as needed
}

interface Balance {
    networkId: string;
    balance: number;
    // Add any additional fields as needed
}

interface GetPubkeysInput {
    networkIds: string[];
}

interface GetBalancesInput {
    networkIds: string[];
}

interface CreatePubkeyInput {
    networkId: string;
    pubkey: string;
}

interface CreateBalanceInput {
    networkId: string;
    balance: number;
}

export class PioneerDB {
    private db: DB;

    constructor(dbName?: string) {
        const homeDir = os.homedir();
        const dbDir = path.join(homeDir, '.keepkey');
        const dbPath = path.join(dbDir, dbName || 'pioneer.db');

        // Ensure directory exists
        fs.mkdirSync(dbDir, { recursive: true });

        // Initialize the database
        this.db = new DB({ dbName: dbPath });
        this.init();
    }

    private async init() {
        await this.db.init();
    }

    public async getPubkeys(input: GetPubkeysInput): Promise<Pubkey[]> {
        const { networkIds } = input;
        // Fetch pubkeys from the db based on networkIds
        const pubkeys = await this.db.find({
            type: 'pubkey',
            networkId: { $in: networkIds },
        });
        return pubkeys;
    }

    public async createPubkey(input: CreatePubkeyInput): Promise<void> {
        const { networkId, pubkey } = input;
        await this.db.insert({ type: 'pubkey', networkId, pubkey });
    }

    public async getBalances(input: GetBalancesInput): Promise<Balance[]> {
        const { networkIds } = input;
        // Fetch balances from the db based on networkIds
        const balances = await this.db.find({
            type: 'balance',
            networkId: { $in: networkIds },
        });
        return balances;
    }

    public async createBalance(input: CreateBalanceInput): Promise<void> {
        const { networkId, balance } = input;
        await this.db.insert({ type: 'balance', networkId, balance });
    }

    public async insertOne<T>(document: T): Promise<void> {
        await this.db.insert(document);
    }

    public async findOne<T>(query: any): Promise<T | null> {
        const results = await this.db.find(query);
        return results.length > 0 ? results[0] : null;
    }
}

export const storageDB = new PioneerDB();
