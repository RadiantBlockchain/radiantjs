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

var _ = require('./util/_')
var $ = require('./util/preconditions')
var JSUtil = require('./util/js')

function Opcode (num) {
  if (!(this instanceof Opcode)) {
    return new Opcode(num)
  }

  var value

  if (_.isNumber(num)) {
    value = num
  } else if (_.isString(num)) {
    value = Opcode.map[num]
  } else {
    throw new TypeError('Unrecognized num type: "' + typeof (num) + '" for Opcode')
  }

  JSUtil.defineImmutable(this, {
    num: value
  })

  return this
}

Opcode.fromBuffer = function (buf) {
  $.checkArgument(Buffer.isBuffer(buf))
  return new Opcode(Number('0x' + buf.toString('hex')))
}

Opcode.fromNumber = function (num) {
  $.checkArgument(_.isNumber(num))
  return new Opcode(num)
}

Opcode.fromString = function (str) {
  $.checkArgument(_.isString(str))
  var value = Opcode.map[str]
  if (typeof value === 'undefined') {
    throw new TypeError('Invalid opcodestr')
  }
  return new Opcode(value)
}

Opcode.prototype.toHex = function () {
  return this.num.toString(16)
}

Opcode.prototype.toBuffer = function () {
  return Buffer.from(this.toHex(), 'hex')
}

Opcode.prototype.toNumber = function () {
  return this.num
}

Opcode.prototype.toString = function () {
  var str = Opcode.reverseMap[this.num]
  if (typeof str === 'undefined') {
    throw new Error('Opcode does not have a string representation')
  }
  return str
}

Opcode.smallInt = function (n) {
  $.checkArgument(_.isNumber(n), 'Invalid Argument: n should be number')
  $.checkArgument(n >= 0 && n <= 16, 'Invalid Argument: n must be between 0 and 16')
  if (n === 0) {
    return Opcode('OP_0')
  }
  return new Opcode(Opcode.map.OP_1 + n - 1)
}

Opcode.map = {
  // push value
  OP_FALSE: 0,
  OP_0: 0,
  OP_PUSHDATA1: 76,
  OP_PUSHDATA2: 77,
  OP_PUSHDATA4: 78,
  OP_1NEGATE: 79,
  OP_RESERVED: 80,
  OP_TRUE: 81,
  OP_1: 81,
  OP_2: 82,
  OP_3: 83,
  OP_4: 84,
  OP_5: 85,
  OP_6: 86,
  OP_7: 87,
  OP_8: 88,
  OP_9: 89,
  OP_10: 90,
  OP_11: 91,
  OP_12: 92,
  OP_13: 93,
  OP_14: 94,
  OP_15: 95,
  OP_16: 96,

  // control
  OP_NOP: 97,
  OP_VER: 98,
  OP_IF: 99,
  OP_NOTIF: 100,
  OP_VERIF: 101,
  OP_VERNOTIF: 102,
  OP_ELSE: 103,
  OP_ENDIF: 104,
  OP_VERIFY: 105,
  OP_RETURN: 106,

  // stack ops
  OP_TOALTSTACK: 107,
  OP_FROMALTSTACK: 108,
  OP_2DROP: 109,
  OP_2DUP: 110,
  OP_3DUP: 111,
  OP_2OVER: 112,
  OP_2ROT: 113,
  OP_2SWAP: 114,
  OP_IFDUP: 115,
  OP_DEPTH: 116,
  OP_DROP: 117,
  OP_DUP: 118,
  OP_NIP: 119,
  OP_OVER: 120,
  OP_PICK: 121,
  OP_ROLL: 122,
  OP_ROT: 123,
  OP_SWAP: 124,
  OP_TUCK: 125,

  // splice ops
  OP_CAT: 126,
  OP_SPLIT: 127,
  OP_NUM2BIN: 128,
  OP_BIN2NUM: 129,
  OP_SIZE: 130,

  // bit logic
  OP_INVERT: 131,
  OP_AND: 132,
  OP_OR: 133,
  OP_XOR: 134,
  OP_EQUAL: 135,
  OP_EQUALVERIFY: 136,
  OP_RESERVED1: 137,
  OP_RESERVED2: 138,

  // numeric
  OP_1ADD: 139,
  OP_1SUB: 140,
  OP_2MUL: 141,
  OP_2DIV: 142,
  OP_NEGATE: 143,
  OP_ABS: 144,
  OP_NOT: 145,
  OP_0NOTEQUAL: 146,

  OP_ADD: 147,
  OP_SUB: 148,
  OP_MUL: 149,
  OP_DIV: 150,
  OP_MOD: 151,
  OP_LSHIFT: 152,
  OP_RSHIFT: 153,

  OP_BOOLAND: 154,
  OP_BOOLOR: 155,
  OP_NUMEQUAL: 156,
  OP_NUMEQUALVERIFY: 157,
  OP_NUMNOTEQUAL: 158,
  OP_LESSTHAN: 159,
  OP_GREATERTHAN: 160,
  OP_LESSTHANOREQUAL: 161,
  OP_GREATERTHANOREQUAL: 162,
  OP_MIN: 163,
  OP_MAX: 164,

  OP_WITHIN: 165,

  // crypto
  OP_RIPEMD160: 166,
  OP_SHA1: 167,
  OP_SHA256: 168,
  OP_HASH160: 169,
  OP_HASH256: 170,
  OP_CODESEPARATOR: 171,
  OP_CHECKSIG: 172,
  OP_CHECKSIGVERIFY: 173,
  OP_CHECKMULTISIG: 174,
  OP_CHECKMULTISIGVERIFY: 175,

  OP_CHECKLOCKTIMEVERIFY: 177,
  OP_CHECKSEQUENCEVERIFY: 178,

  // expansion
  OP_NOP1: 176,
  OP_NOP2: 177,
  OP_NOP3: 178,
  OP_NOP4: 179,
  OP_NOP5: 180,
  OP_NOP6: 181,
  OP_NOP7: 182,
  OP_NOP8: 183,
  OP_NOP9: 184,
  OP_NOP10: 185,

  OP_SHA512_256: 206,
  OP_HASH512_256: 207,

  OP_PUSHINPUTREF: 208,
  OP_REQUIREINPUTREF: 209,
  OP_DISALLOWPUSHINPUTREF: 210,
  OP_DISALLOWPUSHINPUTREFSIBLING: 211,
  OP_UTXODATASUMMARY: 212,
  OP_UTXOREFVALUESUM: 213,
  OP_OUTPUTREFVALUESUM: 214,
  OP_PUSHINPUTREFSINGLETON: 215,

  // template matching params
  OP_PUBKEYHASH: 253,
  OP_PUBKEY: 254,
  OP_INVALIDOPCODE: 255
}

Opcode.reverseMap = []

for (var k in Opcode.map) {
  Opcode.reverseMap[Opcode.map[k]] = k
}

// Easier access to opcodes
_.extend(Opcode, Opcode.map)

/**
 * @returns true if opcode is one of OP_0, OP_1, ..., OP_16
 */
Opcode.isSmallIntOp = function (opcode) {
  if (opcode instanceof Opcode) {
    opcode = opcode.toNumber()
  }
  return ((opcode === Opcode.map.OP_0) ||
    ((opcode >= Opcode.map.OP_1) && (opcode <= Opcode.map.OP_16)))
}

/**
 * Will return a string formatted for the console
 *
 * @returns {string} Script opcode
 */
Opcode.prototype.inspect = function () {
  return '<Opcode: ' + this.toString() + ', hex: ' + this.toHex() + ', decimal: ' + this.num + '>'
}

module.exports = Opcode
