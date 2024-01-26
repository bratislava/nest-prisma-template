import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { NextFunction, Request, Response } from 'express'

@Injectable()
// eslint-disable-next-line import/prefer-default-export
export class AppLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ip, method, originalUrl, body } = request
    const startAt = process.hrtime()
    const userAgent = request.get('user-agent') || ''

    const { send, statusMessage, statusCode } = response
    response.send = (exitData: Response) => {
      let responseData = {}
      const diff = process.hrtime(startAt)
      const responseTime = diff[0] * 1e3 + diff[1] * 1e-6
      if (
        response
          ?.getHeader('content-type')
          ?.toString()
          .includes('application/json')
      ) {
        responseData = JSON.stringify(exitData).slice(0, 1000)
      }
      const requestData = JSON.stringify(body).slice(0, 1000)
      const logger = new Logger(statusMessage)

      if (statusCode >= 500) {
        logger.error(
          `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${requestData}, response-data: ${JSON.stringify(
            responseData,
          ).replaceAll('\\"', '"')}`,
        )
      } else if (statusCode >= 400) {
        logger.warn(
          `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${requestData}, response-data: ${JSON.stringify(
            responseData,
          ).replaceAll('\\"', '"')}`,
        )
      } else {
        logger.log(
          `${method} ${originalUrl} Status-${statusCode} ${responseTime}ms - ${userAgent} ${ip}, request-body: ${requestData}, response-data: ${JSON.stringify(
            responseData,
          )}`,
        )
      }
      response.send = send
      return response.send(exitData)
    }

    next()
  }
}
