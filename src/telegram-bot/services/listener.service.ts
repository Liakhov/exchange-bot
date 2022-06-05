import * as TelegramBot from 'node-telegram-bot-api';
import { Injectable } from '@nestjs/common';

import { environment } from '../../../environments/environment';
import { KEYBOARD } from '../constants';
import { CryptoExchangeService } from '../../crypto-exchange/services';
import { CurrencyParserService } from '../../currency-parser/services';

@Injectable()
export class TelegramBotListenerService {
    private readonly botInstance: TelegramBot;

    constructor(
        private cryptoExchangeService: CryptoExchangeService,
        private currencyParserService: CurrencyParserService
    ) {
        this.botInstance = new TelegramBot(environment.telegramKey, { polling: true });
        this.initUserMessageObserver();
    }

    private initUserMessageObserver(): void {
        this.botInstance.onText(/\/start/, (msg) => {
            this.sendStartMessage(msg);
        });

        this.botInstance.onText(/\/crypto_exchange_rates/, (msg) => {
            this.sendExchangeRatesMessage(msg);
        });

        this.botInstance.onText(/\/exchange_rates/, (msg) => {
            this.sendUsdExchangeRatesMessage(msg);
        });

        this.botInstance.on('message', (msg) => {
            if (~msg.text.indexOf('Курс криптовалют')) {
                this.sendExchangeRatesMessage(msg);
            }

            if (~msg.text.indexOf('Курс долара')) {
                this.sendUsdExchangeRatesMessage(msg);
            }
        });
    }

    private sendStartMessage(msg: TelegramBot.Message): void {
        const text = `Вітаю ${msg.from.first_name}, основні команти які виконує бот:
        \n /start - початок роботи
        \n /exchange_rates - курс валют
        \n /crypto_exchange_rates - курс криптовалют`
        this.botInstance.sendMessage(msg.from.id, text, KEYBOARD);
    }

    private async sendExchangeRatesMessage(msg: TelegramBot.Message): Promise<void> {
        try {
            const { rates, asset_id_base } = await this.cryptoExchangeService.getExchangeRate().toPromise();
            const text = this.cryptoExchangeService.getExchanges(rates, asset_id_base);
            this.botInstance.sendMessage(msg.from.id, text);
        } catch (e) {
            this.botInstance.sendMessage(msg.from.id, `Сталася помилка, просимо здійснити запит пізніше.`);
        }
    }

    private async sendUsdExchangeRatesMessage(msg: TelegramBot.Message): Promise<void> {
        try {
            const currency = await this.currencyParserService.getCurrency();

            const text = currency.reduce((exchange, item: any) => {
                exchange += `<b>${item.city}</b> \n Середня купівля: <b>${item.buy}</b> \n Середній продаж: <b>${item.sell}</b>\n`;
                return exchange;
            }, '');

            this.botInstance.sendMessage(msg.from.id, text, { parse_mode: "HTML" });
        } catch (e) {
            this.botInstance.sendMessage(msg.from.id, `Сталася помилка, просимо здійснити запит пізніше.`);
        }
    }
}