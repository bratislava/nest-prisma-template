import { ApiProperty } from '@nestjs/swagger'

export default class DefaultResponseHealthcheck {
  @ApiProperty({
    description: 'is application it running?',
    example: true,
  })
  appRunning: boolean
}
