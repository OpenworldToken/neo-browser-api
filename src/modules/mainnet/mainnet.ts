/**
 * Filename: /Users/wei/Desktop/otcgo/neo_scrapy/src/modules/rpx/rpx.ts
 * Path: /Users/wei/Desktop/otcgo/neo_scrapy
 * Created Date: Thursday, November 16th 2017, 12:14:47 am
 * Author: wei
 *
 * Copyright (c) 2017 Your Company
 */

import * as log4js from 'log4js'
import * as config from 'config'
import { Router } from 'express'
import { NRequest } from '../../interface'
import * as graphqlHTTP from 'express-graphql'
import { Request as WebHandler } from '../../utils'
// import {  Asset } from '../../models'
import schema from '../../graphql'
import { api } from '@cityofzion/neon-js'
import { parallel } from '../../utils/index'
import { DBClient } from '../../lib'



const dbGlobalClient: any = new DBClient(config.get('dbGlobal'))

const logger = log4js.getLogger('mainnet')
const mainnet: Router = Router()

mainnet.use(`/public/graphql`, graphqlHTTP({
  schema,
  graphiql: true,
  pretty: true,
  extensions ({
    documet,
    variables,
    operationName,
    result
  }) {
    if (result.errors) {
      result.error_code = 500
      result.error_msg = result.errors[0].message
      delete result.errors
      result.status = 'Error'
    } else {
      result.code = 200
      result.status = 'OK'
      result.server_time = new Date()
    }
  }
}))


mainnet.get(`/address/balances/:address`,  async (req: NRequest, res: any)  => {
     try {
      const { address } = req.params
      logger.info('address', address)
      logger.info('rpc', config.get('rpc'))
      const dbGlobal = await dbGlobalClient.connection()
      const asset: any = await dbGlobal.asset.find({type: 'nep5'}).toArray()

      const arr = []
      asset.forEach(item => {
          arr.push(async () => {
            const balances = await api.nep5.getTokenBalance(config.get('rpc'), item.assetId.substring(2), address)
              return {
                _id: item._id,
                assetId: item.assetId,
                name: item.symbol,
                type: 'nep5',
                balances: balances || 0
              }
          })
      })
      const result = await parallel(arr, 10)
      return res.apiSuccess(result)

    } catch (error) {
      logger.error('mainnet', error)
      return res.apiError(error)
    }
  })

export { mainnet }


