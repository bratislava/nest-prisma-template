import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import DefaultModule from './main-modules/default/default.module'

@Module({
  imports: [DefaultModule],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule {}
