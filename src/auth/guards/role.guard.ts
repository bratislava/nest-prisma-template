// TODO -repair this eslint errors
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '../decorators/role.decorator'
import { AzureTokenUserRolesEnum } from '../dtos/azure.dto'

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      AzureTokenUserRolesEnum[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
