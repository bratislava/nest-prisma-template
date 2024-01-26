import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import DefaultService from './default.service'
import DefaultResponseHealthcheck from './dtos/default.response.dto'

@Controller()
@ApiTags('default')
export default class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  @ApiOperation({
    summary: 'Healthcheck',
    description: 'See if nest is working!',
  })
  @ApiResponse({
    status: 200,
    description: 'Everything is working',
    type: DefaultResponseHealthcheck,
  })
  @Get('healthcheck')
  healthcheck(): DefaultResponseHealthcheck {
    return this.defaultService.healthcheck()
  }
}
