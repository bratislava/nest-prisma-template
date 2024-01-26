import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { BearerStrategy } from 'passport-azure-ad'

import { AzureTokenUserDto } from '../dtos/azure.dto'

@Injectable()
export default class AzureADStrategy extends PassportStrategy(
  BearerStrategy,
  'azure-ad-strategy',
) {
  constructor() {
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID,
    })
  }

  validate(data: AzureTokenUserDto): AzureTokenUserDto {
    return data
  }
}
