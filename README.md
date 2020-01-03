# @kikobeats/cold-start

![Last version](https://img.shields.io/github/tag/kikobeats/@kikobeats/cold-start.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/com/kikobeats/@kikobeats/cold-start/master.svg?style=flat-square)](https://travis-ci.com/kikobeats/@kikobeats/cold-start)
[![Coverage Status](https://img.shields.io/coveralls/kikobeats/@kikobeats/cold-start.svg?style=flat-square)](https://coveralls.io/github/kikobeats/@kikobeats/cold-start)
[![Dependency status](https://img.shields.io/david/kikobeats/@kikobeats/cold-start.svg?style=flat-square)](https://david-dm.org/kikobeats/@kikobeats/cold-start)
[![Dev Dependencies Status](https://img.shields.io/david/dev/kikobeats/@kikobeats/cold-start.svg?style=flat-square)](https://david-dm.org/kikobeats/@kikobeats/cold-start#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/@kikobeats/cold-start.svg?style=flat-square)](https://www.npmjs.org/package/@kikobeats/cold-start)

> Create lazy singleton functions with cold-start capabilities.

## Why

A **cold start** is the first time your code has been executed in a while (5–25minutes).

This concept has been using for some infrastructure providers, such as:

- [AWS Lambda](https://mikhail.io/serverless/coldstarts/aws) shutting down λ functions after an inactivity time.
- [Heroku Dynos](https://devcenter.heroku.com/articles/free-dyno-hours#dyno-sleeping) go sleep after 30 minutes no web traffic period.

This library brings you this concept to be applied to any piece of software, like:

- Keep up a pool of servers where actually just a few of them are actively used.
- Keep expensive process running that most of the time it isn't being used.
- Wrap some sensible pieces of code that need to be restarted after a while.

The mission of the library is to keep on sync machine resources with real usage.

It's specially useful when you want to shutdown a long-time process that actually is not being used, cutting down infrastructure costs.

## Install

```bash
$ npm install @kikobeats/cold-start --save
```

## Usage

```js
const coldStart = require('@kikobeats/cold-start')()
const createBrowserless = require('browserless')
const ms = require('ms')

const getBrowserless = coldStart({
  // every cold start function need to have an unique name
  name: 'browserless',
  // setup lazy intialization, it should be return something to be use into succesive calls
  start: createBrowserless,
  // setup teardown, if it's necessary
  stop: browserless => browserless.destroy(),
  // how much idle time to consider the function can be stopped.
  duration: ms('5m')
})

;(async () => {
  // first call will initialize the cold start function
  await getBrowserless()

  // succesive calls will reuse the instance
  await getBrowserless()

  // If the cold start function is not being called in a time window of 5m,
  // the cold start function will be destroyed.
  // The first call after that will allocate it again
  await getBrowserless()
})()
```

## API

### createColdStart([options])

It creates a new cold start storage, returning a function to be used for registering any cold start over the storage.

#### options

##### store

Type: `object`<br>
Default: `{}`

It sets the storage to be used for keeping cold start functions running on background.

After initialization, store can be accessed by `.store` instance method.

##### shutdown

Type: `boolean`<br>
Default: `false`

It sets the logic to run for shutting down all the cold start functions running.

After initialization, shutdown method can by `.shutdown` instance method.

### coldStart([options])

It register a new cold start function into the associated storage

#### options

##### name

*Required*<br>
Type: `string`

An unique name for identifying the cold start function.

##### start

*Required*<br>
Type: `function`

The function to be executed in order of getting the value to be retrieved into the successive function calls.

##### stop

*Required*<br>
Type: `function`

A teardown function to be executed before shutdown the cold start function.

##### duration

*Required*<br>
Type: `number`

How much idle time can be considered a cold start function is inactive and should be shutting down.

## License

**@kikobeats/cold-start** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/kikobeats/cold-start/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/kikobeats/cold-start/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/kikobeats) · Twitter [@kikobeats](https://twitter.com/kikobeats)
