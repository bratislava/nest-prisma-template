import { CustomDecorator, SetMetadata } from '@nestjs/common'

import { AzureTokenUserRolesEnum } from '../dtos/azure.dto'

export const ROLES_KEY = 'roles'
export const Roles = (
  ...roles: AzureTokenUserRolesEnum[]
): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles)
