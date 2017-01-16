'use strict'

const vorpal = require('vorpal')()
const vorpalLog = require('vorpal-log')
const _ = require('lodash')
const AWS = require('aws-sdk')
const fs = require('fs')


vorpal
  .use(vorpalLog)
  .delimiter('aws-es$')
  .show()


const logger = vorpal.logger

let client = null
vorpal
  .command('connect [uri...]')
  .option('-r, --region <region>')
  .option('-k, --aws_access_key_id <key_id>')
  .option('-s, --aws_secret_access_key <secret>')
  .action(function(args, cb) {
    let that = this
    let uri = args.uri
    // TODO verify if string is valid url
    const esConfig = {
      region: args.options.region || 'us-east-1'
    }
    if (args.options.aws_access_key_id && args.options.aws_secret_access_key) {
      _.extend(esConfig, {
        accessKey: args.options.aws_access_key_id,
        secretKey: args.options.aws_secret_access_key
      })
    } else {
      let myCredentials = new AWS.EnvironmentCredentials('AWS')
      _.extend(esConfig, {
        credentials: myCredentials
      })
    }
    client = require('elasticsearch').Client({
      hosts: uri,
      connectionClass: require('http-aws-es'),
      amazonES: esConfig
    })
    client.ping({ requestTimeout: 1000 },
      (err) => {
        if (err) {
          logger.error('Connection failed:', err)
        } else {
          logger.info('Connection established')
        }
        cb()
      }
    )
  })

vorpal
  .command('exec [fn] [params]')
  .option('-f --file <param_file>', 'pass params from file')
  .action(function(args, cb) {
    if (!client) {
      logger.error('Please establish a connection a first')
      return cb()
    }
    // check if params should be read from file
    let params = null
    if (args.options.file) {
      const content = fs.readFileSync(args.options.file)
      params = JSON.parse(content)
    } else {
      params = JSON.parse(args.params)
    }

    client[args.fn](params)
      .then(resp => logger.info(JSON.stringify(resp, null, 2)))
      .catch(err => logger.error(err))
      .then(() => cb())
  })


vorpal
  .command('disconnect')
  .action(function(args, cb) {
    client = null
    logger.info('Connection closed')
    cb()
  })
