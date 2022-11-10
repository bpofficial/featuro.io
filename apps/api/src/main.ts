import logger from 'loglevel'
import { startServer } from './app/server'

logger.setLevel('info')

startServer()
