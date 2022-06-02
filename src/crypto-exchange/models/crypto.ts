export class CryptoExchange {
    asset_id_base: string;
    rates: Rate[];
}

export class Rate {
    time: string;
    asset_id_quote: string;
    rate: number;
}