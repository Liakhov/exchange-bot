import * as TelegramBot from 'node-telegram-bot-api';
import { Injectable } from '@nestjs/common';

import { environment } from '../../../environments/environment';
import { KEYBOARD } from '../constants';
import { CryptoExchangeService } from '../../crypto-exchange/services';

@Injectable()
export class TelegramBotListenerService {
    private readonly botInstance: TelegramBot;

    constructor(private cryptoExchangeService: CryptoExchangeService) {
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

        this.botInstance.on('message', (msg) => {
            if (~msg.text.indexOf('Crypto exchange rates')) {
                this.sendExchangeRatesMessage(msg);
            }
        });
    }

    private sendStartMessage(msg: TelegramBot.Message): void {
        const text = `Вітаю ${msg.from.first_name}, основні команти які виконую бот:
        \n /start - початок роботи \n /crypto_exchange_rates - отримати курс валют на данний момент часу`
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
}