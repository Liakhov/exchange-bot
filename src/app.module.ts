import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { TelegramBotListenerService } from './telegram-bot/services';
import { CryptoExchangeService } from './crypto-exchange/services';
import { CurrencyParserService } from './currency-parser/services';

@Module({
    imports: [
        HttpModule,
        ScheduleModule.forRoot()
    ],
    controllers: [AppController],
    providers: [
        TelegramBotListenerService,
        CryptoExchangeService,
        CurrencyParserService
    ]
})
export class AppModule {
}
