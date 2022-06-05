import { Injectable } from '@nestjs/common';
const { curly } = require('node-libcurl');
const jsdom = require('jsdom');

import { City, CityTranslation } from '../models';

@Injectable()
export class CurrencyParserService {

    public async getCurrency(): Promise<any> {
        const htmlKiev = await this.getHtmlByCity(City.KIEV);
        const kiev = this.getCurrencyFromHtml(City.KIEV, htmlKiev);

        const htmlKharkov = await this.getHtmlByCity(City.KHARKOV);
        const kharkov = this.getCurrencyFromHtml(City.KHARKOV, htmlKharkov);

        return [
            kiev,
            kharkov
        ];
    }

    private async getHtmlByCity(city: City): Promise<string> {
        try {
            const { data } = await curly.get(`https://minfin.com.ua/ua/currency/auction/usd/buy/${city}/`);
            return data;
        } catch (e) {
            return e;
        }
    }

    private getCurrencyFromHtml(city: City, html: string): any {
        const dom = new jsdom.JSDOM(html);
        const buy = dom.window.document
            .querySelector('.average .buy .Typography.cardHeadlineL.align')
            .textContent
            .substring(0, 5);

        const sell = dom.window.document
            .querySelector('.average .sale .Typography.cardHeadlineL.align')
            .textContent
            .substring(0, 5);

        return {
            city: CityTranslation[city],
            buy,
            sell
        }
    }
}