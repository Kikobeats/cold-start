'use strict'

const test = require('ava')
const delay = require('delay')

const createColdStart = require('../')

const DURATION = 50

test('required arguments', async t => {
  t.is(
    t.throws(() => {
      createColdStart()()
    }, Error).message,
    'Need to define `start` method.'
  )

  t.is(
    t.throws(() => {
      createColdStart()({
        start: 'foo'
      })
    }, Error).message,
    'Need to define `stop` method.'
  )

  t.is(
    t.throws(() => {
      createColdStart()({
        start: function () {},
        stop: function () {}
      })
    }, Error).message,
    'Need to define a `name`.'
  )

  t.is(
    t.throws(() => {
      createColdStart()({
        name: 'mock',
        start: function () {},
        stop: function () {}
      })
    }, Error).message,
    'Need to define a `duration`.'
  )

  t.true(
    !!createColdStart()({
      name: 'mock',
      start: function () {},
      stop: function () {},
      duration: DURATION
    })
  )
})

test('name should be unique', async t => {
  const args = {
    name: 'mock',
    start: function () {
      return () => {}
    },
    stop: function () {},
    duration: DURATION
  }

  const coldStart = createColdStart()

  const fn = coldStart(args)
  await fn()

  t.is(
    t.throws(() => coldStart(args), Error).message,
    'name `mock` already used.'
  )
})

test('lazy initialization', async t => {
  let startCalls = 0

  const stop = () => {}

  const start = async () => {
    ++startCalls
    await delay(DURATION)
    return async function () {}
  }

  const coldStart = createColdStart()

  const fn = coldStart({
    name: 'myfn',
    stop,
    start,
    duration: 120000
  })

  t.true(startCalls === 0)
  await fn()
  t.true(startCalls === 1)
  await fn()
  t.true(startCalls === 1)
})

test('pass arguments', async t => {
  let props

  const stop = () => {}

  const start = async opts => {
    props = opts
    await delay(DURATION)
    return async function () {}
  }

  const coldStart = createColdStart()

  const fn = coldStart({
    name: 'myfn',
    stop,
    start,
    duration: 120000
  })

  await fn({ foo: 'bar' })
  t.deepEqual(props, { foo: 'bar' })
})

test('stop after a while', async t => {
  let isDestroyed = false

  const stop = () => {
    isDestroyed = true
  }

  const start = () => {
    return function () {}
  }

  const coldStart = createColdStart()

  const fn = coldStart({
    name: 'myfn',
    stop,
    start,
    duration: DURATION
  })

  await fn()
  await delay(DURATION)
  t.true(isDestroyed)
  t.true(Object.keys(coldStart.store).length === 0)
})

test('shutdown gracefully', async t => {
  let isDestroyed = false

  const stop = () => {
    isDestroyed = true
  }

  const start = () => {
    return function () {}
  }

  const coldStart = createColdStart()

  const fn = coldStart({
    name: 'myfn',
    stop,
    start,
    duration: 120000
  })

  await fn()
  await coldStart.shutdown()
  t.true(isDestroyed)
  t.true(Object.keys(coldStart.store).length === 0)
})
