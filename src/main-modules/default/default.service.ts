import { Injectable } from '@nestjs/common'

import DefaultResponseHealthcheck from './dtos/default.response.dto'

@Injectable()
export default class DefaultService {
  healthcheck(): DefaultResponseHealthcheck {
    return {
      appRunning: true,
    }
  }
}
