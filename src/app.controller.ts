import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Hello world!',
    description: 'See if nest is working!',
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
