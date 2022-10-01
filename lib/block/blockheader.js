/*

Copyright (c) 2022 The Radiant Blockchain Developers

Previous versions are based off bsv.js and contain the copyrights:

This software contains patches as part of https://github.com/sCrypt-Inc/scryptlib/tree/master/patches
The changes are copyright Copyright (c) 2020-2022 sCrypt and licensed under MIT License

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

var _ = require('../util/_')
var BN = require('../crypto/bn')
var BufferReader = require('../encoding/bufferreader')
var BufferWriter = require('../encoding/bufferwriter')
var Hash = require('../crypto/hash')
var $ = require('../util/preconditions')
var GENESIS_BITS = 0x1d00ffff

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
var BlockHeader = function BlockHeader (arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg)
  }
  var info = BlockHeader._from(arg)
  this.version = info.version
  this.prevHash = info.prevHash
  this.merkleRoot = info.merkleRoot
  this.time = info.time
  this.timestamp = info.time
  this.bits = info.bits
  this.nonce = info.nonce

  if (info.hash) {
    $.checkState(
      this.hash === info.hash,
      'Argument object hash property does not match block hash.'
    )
  }

  return this
}

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block header data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
BlockHeader._from = function _from (arg) {
  var info = {}
  if (Buffer.isBuffer(arg)) {
    info = BlockHeader._fromBufferReader(BufferReader(arg))
  } else if (_.isObject(arg)) {
    info = BlockHeader._fromObject(arg)
  } else {
    throw new TypeError('Unrecognized argument for BlockHeader')
  }
  return info
}

/**
 * @param {Object} - A JSON string
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromObject = function _fromObject (data) {
  $.checkArgument(data, 'data is required')
  var prevHash = data.prevHash
  var merkleRoot = data.merkleRoot
  if (_.isString(data.prevHash)) {
    prevHash = Buffer.from(data.prevHash, 'hex').reverse()
  }
  if (_.isString(data.merkleRoot)) {
    merkleRoot = Buffer.from(data.merkleRoot, 'hex').reverse()
  }
  var info = {
    hash: data.hash,
    version: data.version,
    prevHash: prevHash,
    merkleRoot: merkleRoot,
    time: data.time,
    timestamp: data.time,
    bits: data.bits,
    nonce: data.nonce
  }
  return info
}

/**
 * @param {Object} - A plain JavaScript object
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromObject = function fromObject (obj) {
  var info = BlockHeader._fromObject(obj)
  return new BlockHeader(info)
}

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromRawBlock = function fromRawBlock (data) {
  if (!Buffer.isBuffer(data)) {
    data = Buffer.from(data, 'binary')
  }
  var br = BufferReader(data)
  br.pos = BlockHeader.Constants.START_OF_HEADER
  var info = BlockHeader._fromBufferReader(br)
  return new BlockHeader(info)
}

/**
 * @param {Buffer} - A buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBuffer = function fromBuffer (buf) {
  var info = BlockHeader._fromBufferReader(BufferReader(buf))
  return new BlockHeader(info)
}

/**
 * @param {string} - A hex encoded buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromString = function fromString (str) {
  var buf = Buffer.from(str, 'hex')
  return BlockHeader.fromBuffer(buf)
}

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader (br) {
  var info = {}
  info.version = br.readInt32LE()
  info.prevHash = br.read(32)
  info.merkleRoot = br.read(32)
  info.time = br.readUInt32LE()
  info.bits = br.readUInt32LE()
  info.nonce = br.readUInt32LE()
  return info
}

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBufferReader = function fromBufferReader (br) {
  var info = BlockHeader._fromBufferReader(br)
  return new BlockHeader(info)
}

/**
 * @returns {Object} - A plain object of the BlockHeader
 */
BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON = function toObject () {
  return {
    hash: this.hash,
    version: this.version,
    prevHash: Buffer.from(this.prevHash).reverse().toString('hex'),
    merkleRoot: Buffer.from(this.merkleRoot).reverse().toString('hex'),
    time: this.time,
    bits: this.bits,
    nonce: this.nonce
  }
}

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer () {
  return this.toBufferWriter().concat()
}

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString () {
  return this.toBuffer().toString('hex')
}

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.toBufferWriter = function toBufferWriter (bw) {
  if (!bw) {
    bw = new BufferWriter()
  }
  bw.writeInt32LE(this.version)
  bw.write(this.prevHash)
  bw.write(this.merkleRoot)
  bw.writeUInt32LE(this.time)
  bw.writeUInt32LE(this.bits)
  bw.writeUInt32LE(this.nonce)
  return bw
}

/**
 * Returns the target difficulty for this block
 * @param {Number} bits
 * @returns {BN} An instance of BN with the decoded difficulty bits
 */
BlockHeader.prototype.getTargetDifficulty = function getTargetDifficulty (bits) {
  bits = bits || this.bits

  var target = new BN(bits & 0xffffff)
  var mov = 8 * ((bits >>> 24) - 3)
  while (mov-- > 0) {
    target = target.mul(new BN(2))
  }
  return target
}

/**
 * @link https://en.bitcoin.it/wiki/Difficulty
 * @return {Number}
 */
BlockHeader.prototype.getDifficulty = function getDifficulty () {
  var difficulty1TargetBN = this.getTargetDifficulty(GENESIS_BITS).mul(new BN(Math.pow(10, 8)))
  var currentTargetBN = this.getTargetDifficulty()

  var difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10)
  var decimalPos = difficultyString.length - 8
  difficultyString = difficultyString.slice(0, decimalPos) + '.' + difficultyString.slice(decimalPos)

  return parseFloat(difficultyString)
}

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
BlockHeader.prototype._getHash = function hash () {
  var buf = this.toBuffer()
  return Hash.sha512_256sha512_256(buf)
}

var idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get: function () {
    if (!this._id) {
      this._id = BufferReader(this._getHash()).readReverse().toString('hex')
    }
    return this._id
  },
  set: _.noop
}
Object.defineProperty(BlockHeader.prototype, 'id', idProperty)
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty)

/**
 * @returns {Boolean} - If timestamp is not too far in the future
 */
BlockHeader.prototype.validTimestamp = function validTimestamp () {
  var currentTime = Math.round(new Date().getTime() / 1000)
  if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
    return false
  }
  return true
}

/**
 * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
 */
BlockHeader.prototype.validProofOfWork = function validProofOfWork () {
  var pow = new BN(this.id, 'hex')
  var target = this.getTargetDifficulty()
  if (pow.cmp(target) > 0) {
    return false
  }
  return true
}

/**
 * @returns {string} - A string formatted for the console
 */
BlockHeader.prototype.inspect = function inspect () {
  return '<BlockHeader ' + this.id + '>'
}

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex')
}

module.exports = BlockHeader
