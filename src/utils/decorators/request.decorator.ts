import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common'

import { AzureTokenUserDto } from '../../auth/dtos/azure.dto'

// eslint-disable-next-line import/prefer-default-export
export const User = createParamDecorator(
  (data: AzureTokenUserDto, ctx: ExecutionContext): AzureTokenUserDto => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest()
    if (!('user' in request)) {
      throw new HttpException({ statusCode: 401, message: 'Unauthorized' }, 401)
    }
    const { user } = request as { user: AzureTokenUserDto }
    return user
  },
)
