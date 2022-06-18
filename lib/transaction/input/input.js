/*

Copyright (c) 2022 The Radiant Blockchain Developers

This file contains patches as part of https://github.com/sCrypt-Inc/scryptlib/tree/master/patches
The changes are copyright Copyright (c) 2020-2022 sCrypt and licensed underMIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Previous versions are based off bsv.js and contain the copyrights:

Copyright (c) 2018-2019 Yours Inc.

Copyright (c) 2013-2017 BitPay, Inc.

Parts of this software are based on Bitcoin Core
Copyright (c) 2009-2015 The Bitcoin Core developers

Parts of this software are based on fullnode
Copyright (c) 2014 Ryan X. Charles
Copyright (c) 2014 reddit, Inc.

Parts of this software are based on BitcoinJS
Copyright (c) 2011 Stefan Thomas <justmoon@members.fsf.org>

Parts of this software are based on BitcoinJ
Copyright (c) 2011 Google Inc.

Copyright (c) 2009 Satoshi Nakamoto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
'use strict'

var _ = require('../../util/_')
var $ = require('../../util/preconditions')
var errors = require('../../errors')
var BufferWriter = require('../../encoding/bufferwriter')
var buffer = require('buffer')
var JSUtil = require('../../util/js')
var Script = require('../../script')
var Sighash = require('../sighash')
var Output = require('../output')

var MAXINT = 0xffffffff // Math.pow(2, 32) - 1;
var DEFAULT_RBF_SEQNUMBER = MAXINT - 2
var DEFAULT_SEQNUMBER = MAXINT
var DEFAULT_LOCKTIME_SEQNUMBER = MAXINT - 1

function Input(params) {
  if (!(this instanceof Input)) {
    return new Input(params)
  }
  if (params) {
    return this._fromObject(params)
  }
}

Input.MAXINT = MAXINT
Input.DEFAULT_SEQNUMBER = DEFAULT_SEQNUMBER
Input.DEFAULT_LOCKTIME_SEQNUMBER = DEFAULT_LOCKTIME_SEQNUMBER
Input.DEFAULT_RBF_SEQNUMBER = DEFAULT_RBF_SEQNUMBER
// txid + output index + sequence number
Input.BASE_SIZE = 32 + 4 + 4

Object.defineProperty(Input.prototype, 'script', {
  configurable: false,
  enumerable: true,
  get: function () {
    if (this.isNull()) {
      return null
    }
    if (!this._script) {
      this._script = new Script(this._scriptBuffer)
      this._script._isInput = true
    }
    return this._script
  }
})

Input.fromObject = function (obj) {
  $.checkArgument(_.isObject(obj))
  var input = new Input()
  return input._fromObject(obj)
}

Input.prototype._fromObject = function (params) {
  var prevTxId
  if (_.isString(params.prevTxId) && JSUtil.isHexa(params.prevTxId)) {
    prevTxId = buffer.Buffer.from(params.prevTxId, 'hex')
  } else {
    prevTxId = params.prevTxId
  }
  this.output = params.output
    ? (params.output instanceof Output ? params.output : new Output(params.output)) : undefined
  this.prevTxId = prevTxId || params.txidbuf
  this.outputIndex = _.isUndefined(params.outputIndex) ? params.txoutnum : params.outputIndex
  this.sequenceNumber = _.isUndefined(params.sequenceNumber)
    ? (_.isUndefined(params.seqnum) ? DEFAULT_SEQNUMBER : params.seqnum) : params.sequenceNumber
  if (_.isUndefined(params.script) && _.isUndefined(params.scriptBuffer)) {
    throw new errors.Transaction.Input.MissingScript()
  }
  this.setScript(params.scriptBuffer || params.script)
  return this
}

Input.prototype.toObject = Input.prototype.toJSON = function toObject() {
  var obj = {
    prevTxId: this.prevTxId.toString('hex'),
    outputIndex: this.outputIndex,
    sequenceNumber: this.sequenceNumber,
    script: this._scriptBuffer.toString('hex')
  }
  // add human readable form if input contains valid script
  if (this.script) {
    obj.scriptString = this.script.toString()
  }
  if (this.output) {
    obj.output = this.output.toObject()
  }
  return obj
}

Input.fromBufferReader = function (br) {
  var input = new Input()
  input.prevTxId = br.readReverse(32)
  input.outputIndex = br.readUInt32LE()
  input._scriptBuffer = br.readVarLengthBuffer()
  input.sequenceNumber = br.readUInt32LE()
  // TODO: return different classes according to which input it is
  // e.g: CoinbaseInput, PublicKeyHashInput, MultiSigScriptHashInput, etc.
  return input
}

Input.prototype.toBufferWriter = function (writer) {
  if (!writer) {
    writer = new BufferWriter()
  }
  writer.writeReverse(this.prevTxId)
  writer.writeUInt32LE(this.outputIndex)
  var script = this._scriptBuffer
  writer.writeVarintNum(script.length)
  writer.write(script)
  writer.writeUInt32LE(this.sequenceNumber)
  return writer
}

Input.prototype.setScript = function (script) {
  this._script = null
  if (script instanceof Script) {
    this._script = script
    this._script._isInput = true
    this._scriptBuffer = script.toBuffer()
  } else if (script === null) {
    this._script = Script.empty()
    this._script._isInput = true
    this._scriptBuffer = this._script.toBuffer()
  } else if (JSUtil.isHexa(script)) {
    // hex string script
    this._scriptBuffer = buffer.Buffer.from(script, 'hex')
  } else if (_.isString(script)) {
    // human readable string script
    this._script = new Script(script)
    this._script._isInput = true
    this._scriptBuffer = this._script.toBuffer()
  } else if (Buffer.isBuffer(script)) {
    // buffer script
    this._scriptBuffer = buffer.Buffer.from(script)
  } else {
    throw new TypeError('Invalid argument type: script')
  }
  return this
}

/**
 * Retrieve signatures for the provided PrivateKey.
 *
 * @param {Transaction} transaction - the transaction to be signed
 * @param {PrivateKey} privateKey - the private key to use when signing
 * @param {number} inputIndex - the index of this input in the provided transaction
 * @param {number} sigType - defaults to Signature.SIGHASH_ALL
 * @param {Buffer} addressHash - if provided, don't calculate the hash of the
 *     public key associated with the private key provided
 * @abstract
 */
Input.prototype.getSignatures = function () {
  // throw new errors.AbstractMethodInvoked(
  //   'Trying to sign unsupported output type (only P2PKH and P2SH multisig inputs are supported)' +
  //   ' for input: ' + JSON.stringify(this)
  // )
  return []
}

Input.prototype.isFullySigned = function () {
  throw new errors.AbstractMethodInvoked('Input#isFullySigned')
}

Input.prototype.isFinal = function () {
  return this.sequenceNumber === Input.MAXINT
}

Input.prototype.addSignature = function () {
  // throw new errors.AbstractMethodInvoked('Input#addSignature')
}

Input.prototype.clearSignatures = function () {
  // throw new errors.AbstractMethodInvoked('Input#clearSignatures')
}

Input.prototype.isValidSignature = function (transaction, signature) {
  console.log('isValidSignature', transaction, signature)
  // FIXME: Refactor signature so this is not necessary
  signature.signature.nhashtype = signature.sigtype
  return Sighash.verify(
    transaction,
    signature.signature,
    signature.publicKey,
    signature.inputIndex,
    this.output.script,
    this.output.satoshisBN
  )
}

/**
 * @returns true if this is a coinbase input (represents no input)
 */
Input.prototype.isNull = function () {
  return this.prevTxId.toString('hex') === '0000000000000000000000000000000000000000000000000000000000000000' &&
    this.outputIndex === 0xffffffff
}

Input.prototype._estimateSize = function () {
  return this.toBufferWriter().toBuffer().length
}

module.exports = Input
