import { AuthGuard } from '@nestjs/passport'

export default class AzureAdGuard extends AuthGuard('azure-ad-strategy') {}
