import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import AdminStrategy from './strategies/admin.strategy'
import AzureADStrategy from './strategies/azure.strategy'

@Module({
  imports: [PassportModule],
  providers: [AzureADStrategy, AdminStrategy],
  exports: [],
  controllers: [],
})
export default class AuthModule {}
