import { createClient } from 'redis'
import { logger, logError } from './logger.js'

let redisClient = null

export const initializeRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_HOST
    const redisPassword = process.env.REDIS_ACCESS_KEY

    if (!redisUrl || !redisPassword) {
      logger.warn('initializeRedis: Redis credentials not configured. Caching disabled.')
      return null
    }

    logger.info({ host: redisUrl }, 'initializeRedis: Attempting to connect to Redis')

    redisClient = createClient({
      socket: {
            host: redisUrl,
            port: 10000,
            tls: true
        },
        username: "default",
        password: redisPassword
    })

    redisClient.on('error', (err) => {
      logError(err, { context: 'redis-client-error' })
    })

    redisClient.on('connect', () => {
      logger.info('initializeRedis: Redis connected successfully')
    })

    await redisClient.connect()
    logger.info('initializeRedis: Redis client connected')
    return redisClient
  } catch (error) {
    logError(error, { context: 'initializeRedis' })
    return null
  }
}

export const getRedisClient = () => {
  return redisClient
}

// Cache key builder
export const buildCacheKey = (prefix, ...args) => {
  return `${prefix}:${args.join(':')}`
}

// Get from cache
export const getFromCache = async (key) => {
  if (!redisClient) return null

  try {
    const cached = await redisClient.get(key)
    if (cached) {
      logger.debug({ key }, 'getFromCache: Cache hit')
      return JSON.parse(cached)
    }
    logger.debug({ key }, 'getFromCache: Cache miss')
    return null
  } catch (error) {
    logError(error, { context: 'getFromCache', key })
    return null
  }
}

// Set cache with TTL
export const setCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return false

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data))
    logger.debug({ key, ttl }, 'setCache: Data cached successfully')
    return true
  } catch (error) {
    logError(error, { context: 'setCache', key, ttl })
    return false
  }
}

// Delete from cache
export const deleteFromCache = async (key) => {
  if (!redisClient) return false

  try {
    await redisClient.del(key)
    logger.debug({ key }, 'deleteFromCache: Cache key deleted')
    return true
  } catch (error) {
    logError(error, { context: 'deleteFromCache', key })
    return false
  }
}

// Delete multiple keys by pattern
export const deleteByPattern = async (pattern) => {
  if (!redisClient) return false

  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(keys)
      logger.debug({ pattern, count: keys.length }, 'deleteByPattern: Cache keys deleted')
    }
    return true
  } catch (error) {
    logError(error, { context: 'deleteByPattern', pattern })
    return false
  }
}

// Cache notification keys
export const notificationCacheKeys = {
  byUserId: (userId) => buildCacheKey('notifications:user', userId),
  byEmail: (email) => buildCacheKey('notifications:email', email),
  userPattern: (userId) => `notifications:user:${userId}*`,
  emailPattern: (email) => `notifications:email:${email}*`,
}

export default {
  initializeRedis,
  getRedisClient,
  buildCacheKey,
  getFromCache,
  setCache,
  deleteFromCache,
  deleteByPattern,
  notificationCacheKeys,
}
