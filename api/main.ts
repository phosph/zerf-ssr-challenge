import Fastify from 'fastify'
import appModule from './src/app.module.ts'

const fastify = Fastify({
  logger: true
})

await fastify.register(appModule)

// Run the server!
fastify.listen({ port: fastify.config.PORT }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})