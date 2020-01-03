'use strict'

const debug = require('debug')('cold-start')

const throwError = message => {
  throw new TypeError(message)
}

module.exports = ({
  store = {},
  shutdown = store => {
    Promise.all(
      Object.keys(store).map(async key => {
        const fn = store[key]
        clearTimeout(fn.timer)
        debug(`shutdown:${key}`)
        await fn.stop()
        delete store[key]
      })
    )
  }
} = {}) => {
  const coldStart = ({
    start = throwError('Need to define `start` method.'),
    stop = throwError('Need to define `stop` method.'),
    name = throwError('Need to define a `name`.'),
    duration = throwError('Need to define a `duration`.')
  } = {}) => {
    store[name] !== undefined && throwError(`name \`${name}\` already used.`)

    return async opts => {
      let fn = store[name]

      if (fn) {
        debug(`refresh:${name}`)
        fn.timer.refresh()
      } else {
        debug(`start:${name}`)
        store[name] = fn = await start(opts)
        fn.stop = stop.bind(null, fn)
        fn.timer = setTimeout(async () => {
          debug(`stop:${name}`)
          await stop(fn)
          delete store[name]
        }, duration)
      }

      return fn
    }
  }

  coldStart.shutdown = shutdown.bind(null, store)
  coldStart.store = store

  return coldStart
}
