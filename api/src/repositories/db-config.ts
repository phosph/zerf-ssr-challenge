import fp from 'fastify-plugin'
import pgFastify from '@fastify/postgres'

export default fp(function dbCOnfigPlugin(appInstance) {
    appInstance.register(pgFastify, {
        connectionString: appInstance.config.DATABASE_URL,
    })
})