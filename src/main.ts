import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

// eslint-disable-next-line import/no-extraneous-dependencies
import AppModule from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap(): Promise<void> {
  const port = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule)
  const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  }
  app.enableCors(corsOptions)
  app.useGlobalPipes(new ValidationPipe())
  const config = new DocumentBuilder()
    .setTitle('Nest prisma template')
    .setDescription('Template app for nest with prisma')
    .setVersion('1.0')
    .setContact(
      'Bratislava Inovations',
      'https://inovacie.bratislava.sk',
      'inovacie@bratislava.sk',
    )
    .addServer(`http://localhost:${port}/`)
    .addServer('https://nest-prisma-template.dev.bratislava.sk/')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app.getHttpAdapter().get('/spec-json', (req, res) => res.json(document))

  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`Nest is running on port: ${port}`)
}

bootstrap()
