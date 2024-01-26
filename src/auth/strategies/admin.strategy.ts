// TODO - repair this eslint errors
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'

@Injectable()
export default class AdminStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'admin-strategy',
) {
  constructor() {
    super(
      { header: 'X-Api-Key', prefix: '' },
      false,
      (apiKey: string, done: any) => {
        if (apiKey === process.env.ADMIN_APP_SECRET) {
          return done(null, true)
        }
        return done(false)
      },
    )
  }
}
