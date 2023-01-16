import path from 'path'
import { Body, Middlewares, OperationId, Post, Response, Route, Security, Tags } from 'tsoa'

import { ApiController } from '../auth'
import { extra } from '../middlewares'
// import type * as types from '../types'
const Cryptr = require('cryptr')
const fs = require('fs-extra')
const homedir = require('os').homedir()
const mkdirp = require('mkdirp')

//Storage location
export const appDir = path.join(homedir, '.keepkey', 'pwm_data')

const onStart = async function () {
  try {
    let isCreated = await mkdirp(appDir)
    console.log('Created pw store: ', isCreated)
  } catch (e) {
    console.error('Failed to create pw store')
  }
}
onStart()

@Route('/pwm')
@Tags('PWM')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class pwmController extends ApiController {
  /**
   * @summary encrypt and store a payload
   */
  @Post('/encrypt')
  @OperationId('pwm_encrypt')
  public async encryptPayload(
    @Body()
    body: {
      payload: string
      password: string
      name: string
    },
  ): Promise<{
    success: boolean
    payload: string
  }> {
    console.log('body: ', body)
    const cryptr = new Cryptr(body.password)
    const encryptedString = cryptr.encrypt(body.payload)
    //store in db
    //TODO store remote?
    let success = fs.writeFileSync(appDir + '/' + body.name, encryptedString)
    console.log('success: ', success)

    return {
      success: true,
      payload: encryptedString,
    }
  }

  /**
   * @summary load and decrypt a password
   */
  @Post('/decrypt')
  @OperationId('pwm_decrypt')
  public async decryptPayload(
    @Body()
    body: {
      password: string
      name: string
    },
  ): Promise<{
    success: boolean
    payload: string
  }> {
    console.log('body: ', body)
    const cryptr = new Cryptr(body.password)
    //store in db
    //TODO store remote?
    let encryptedString = fs.readFile(appDir + '/' + body.name)
    console.log('encryptedString: ', encryptedString)
    const decryptedString = cryptr.decrypt(encryptedString)
    return {
      success: true,
      payload: decryptedString,
    }
  }
  //delete file
}
