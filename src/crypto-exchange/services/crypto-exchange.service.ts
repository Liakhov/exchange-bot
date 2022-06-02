import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CryptoExchange, Rate } from '../models';
import { CURRENCIES } from '../constants';

@Injectable()
export class CryptoExchangeService {

    constructor(private httpService: HttpService) {
    }

    public getExchangeRate(): Observable<CryptoExchange> {
        const headers = {
            'X-CoinAPI-Key': environment.coinKey
        }
        return this.httpService.get(`${environment.apiUrl}v1/exchangerate/USDT?invert=true`, { headers })
            .pipe(
                map(response => response.data),
            )
    }

    public getExchanges(rates: Rate[], asset_id_base: string): string {
        const result = CURRENCIES.reduce((acc: any, item: string) => {
            const { asset_id_quote, rate } = rates.find(r => r.asset_id_quote.toString() === item);
            acc.push({
                asset_id_quote,
                rate: (asset_id_quote === 'UAH') ? 1 / rate : rate
            })
            return acc;
        }, []);

        return result.reduce((acc: string, value) => {
            return acc += `${value.asset_id_quote}/${asset_id_base}: ${value.rate} \n`;
        }, 'Курс валют: \n');
    }
}