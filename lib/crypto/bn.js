/*
This license can be used by developers, projects or companies who wish to make their software or applications available for open (free) usage only on the Radiant Blockchains.
 
Copyright (c) 2022 The Radiant Blockchain Developers

Open Radiant Blockchain (RAD) License Version 1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
1 - The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

2 - The Software, and any software that is derived from the Software or parts thereof,
can only be used on the Radiant (RAD) blockchains. The Radiant (RAD) blockchains are defined,
for purposes of this license, as the Radiant (RAD) blockchains containing block height #10543
with the hash "0000000000389e57f64aeda459b441613dedb49b050ef0df1e25e4f325957dcf" and that 
contains the longest persistent chain of blocks accepted by this Software, as well as the test 
blockchains that contain the longest persistent chains of blocks accepted by this Software.

3 - The Software, and any software that is derived from the Software or parts thereof, can only
be used on Radiant (RAD) blockchain that maintains the original difficulty adjustment algorithm, 
maintains the block subsidy emission rate defined in the original version of this Software, and 
ensures all coins are spendable in the normal manner without either subverting, undermining, 
changing, diminishing, nullifying, hijacking, or altering the way existing coins can be spent. Any 
attempt or proposal by an entity to violate, change, or remove the logic for verifying 
digital chains of signatures for existing coins will be deemed a violation of this license 
and that entity must cease to use the Software immediately.

4 - Users and providers of the Software agree to insure themselves against any loss of any kind
if they wish to mitigate the effects of theft or error. The Users and providers agree
and understand that under no circumstances will there be recourse through Radiant (RAD) blockchain
providers via subverting, undermining, changing, diminishing, nullifying, hijacking, or altering 
the way existing coins can be spent and the proper functioning of the verification of chains of 
digital signatures.

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

var BN = require('bn.js')
var $ = require('../util/preconditions')
var _ = require('../util/_')

var reversebuf = function (buf) {
  var buf2 = Buffer.alloc(buf.length)
  for (var i = 0; i < buf.length; i++) {
    buf2[i] = buf[buf.length - 1 - i]
  }
  return buf2
}

BN.Zero = new BN(0)
BN.One = new BN(1)
BN.Minus1 = new BN(-1)

/**
 * Convert a number into a big number.
 *
 * @param {number} n Any positive or negative integer.
 */
BN.fromNumber = function (n) {
  $.checkArgument(_.isNumber(n))
  return new BN(n)
}

/**
 * Convert a string number into a big number.
 *
 * @param {string} str Any positive or negative integer formatted as a string.
 * @param {number} base The base of the number, defaults to 10.
 */
BN.fromString = function (str, base) {
  $.checkArgument(_.isString(str))
  return new BN(str, base)
}

/**
 * Convert a buffer (such as a 256 bit binary private key) into a big number.
 * Sometimes these numbers can be formatted either as 'big endian' or 'little
 * endian', and so there is an opts parameter that lets you specify which
 * endianness is specified.
 *
 * @param {Buffer} buf A buffer number, such as a 256 bit hash or key.
 * @param {Object} opts With a property 'endian' that can be either 'big' or 'little'. Defaults big endian (most significant digit first).
 */
BN.fromBuffer = function (buf, opts) {
  if (typeof opts !== 'undefined' && opts.endian === 'little') {
    buf = reversebuf(buf)
  }
  var hex = buf.toString('hex')
  var bn = new BN(hex, 16)
  return bn
}

/**
 * Instantiate a BigNumber from a "signed magnitude buffer". (a buffer where the
 * most significant bit represents the sign (0 = positive, 1 = negative)
 *
 * @param {Buffer} buf A buffer number, such as a 256 bit hash or key.
 * @param {Object} opts With a property 'endian' that can be either 'big' or 'little'. Defaults big endian (most significant digit first).
 */
BN.fromSM = function (buf, opts) {
  var ret
  if (buf.length === 0) {
    return BN.fromBuffer(Buffer.from([0]))
  }

  var endian = 'big'
  if (opts) {
    endian = opts.endian
  }
  if (endian === 'little') {
    buf = reversebuf(buf)
  }

  if (buf[0] & 0x80) {
    buf[0] = buf[0] & 0x7f
    ret = BN.fromBuffer(buf)
    ret.neg().copy(ret)
  } else {
    ret = BN.fromBuffer(buf)
  }
  return ret
}

/**
 * Convert a big number into a number.
 */
BN.prototype.toNumber = function () {
  return parseInt(this.toString(10), 10)
}

/**
 * Convert a big number into a buffer. This is somewhat ambiguous, so there is
 * an opts parameter that let's you specify the endianness or the size.
 * opts.endian can be either 'big' or 'little' and opts.size can be any
 * sufficiently large number of bytes. If you always want to create a 32 byte
 * big endian number, then specify opts = { endian: 'big', size: 32 }
 *
 * @param {Object} opts Defaults to { endian: 'big', size: 32 }
 */
BN.prototype.toBuffer = function (opts) {
  var buf, hex
  if (opts && opts.size) {
    hex = this.toString(16, 2)
    var natlen = hex.length / 2
    buf = Buffer.from(hex, 'hex')

    if (natlen === opts.size) {
      // buf = buf
    } else if (natlen > opts.size) {
      buf = BN.trim(buf, natlen)
    } else if (natlen < opts.size) {
      buf = BN.pad(buf, natlen, opts.size)
    }
  } else {
    hex = this.toString(16, 2)
    buf = Buffer.from(hex, 'hex')
  }

  if (typeof opts !== 'undefined' && opts.endian === 'little') {
    buf = reversebuf(buf)
  }

  return buf
}

/**
 * For big numbers that are either positive or negative, you can convert to
 * "sign magnitude" format whereby the first bit specifies whether the number is
 * positive or negative.
 */
BN.prototype.toSMBigEndian = function () {
  var buf
  if (this.cmp(BN.Zero) === -1) {
    buf = this.neg().toBuffer()
    if (buf[0] & 0x80) {
      buf = Buffer.concat([Buffer.from([0x80]), buf])
    } else {
      buf[0] = buf[0] | 0x80
    }
  } else {
    buf = this.toBuffer()
    if (buf[0] & 0x80) {
      buf = Buffer.concat([Buffer.from([0x00]), buf])
    }
  }

  if (buf.length === 1 & buf[0] === 0) {
    buf = Buffer.from([])
  }
  return buf
}

/**
 * For big numbers that are either positive or negative, you can convert to
 * "sign magnitude" format whereby the first bit specifies whether the number is
 * positive or negative.
 *
 * @param {Object} opts Defaults to { endian: 'big' }
 */
BN.prototype.toSM = function (opts) {
  var endian = opts ? opts.endian : 'big'
  var buf = this.toSMBigEndian()

  if (endian === 'little') {
    buf = reversebuf(buf)
  }
  return buf
}

/**
 * Create a BN from a "ScriptNum": This is analogous to the constructor for
 * CScriptNum in bitcoind. Many ops in bitcoind's script interpreter use
 * CScriptNum, which is not really a proper bignum. Instead, an error is thrown
 * if trying to input a number bigger than 4 bytes. We copy that behavior here.
 * A third argument, `size`, is provided to extend the hard limit of 4 bytes, as
 * some usages require more than 4 bytes.
 *
 * @param {Buffer} buf A buffer of a number.
 * @param {boolean} fRequireMinimal Whether to require minimal size encoding.
 * @param {number} size The maximum size.
 */
BN.fromScriptNumBuffer = function (buf, fRequireMinimal, size) {
  // don't limit numSize default
  var nMaxNumSize = size || Number.MAX_SAFE_INTEGER;
  $.checkArgument(buf.length <= nMaxNumSize, new Error('script number overflow'))
  if (fRequireMinimal && buf.length > 0) {
    // Check that the number is encoded with the minimum possible
    // number of bytes.
    //
    // If the most-significant-byte - excluding the sign bit - is zero
    // then we're not minimal. Note how this test also rejects the
    // negative-zero encoding, 0x80.
    if ((buf[buf.length - 1] & 0x7f) === 0) {
      // One exception: if there's more than one byte and the most
      // significant bit of the second-most-significant-byte is set
      // it would conflict with the sign bit. An example of this case
      // is +-255, which encode to 0xff00 and 0xff80 respectively.
      // (big-endian).
      if (buf.length <= 1 || (buf[buf.length - 2] & 0x80) === 0) {
        throw new Error('non-minimally encoded script number')
      }
    }
  }
  return BN.fromSM(buf, {
    endian: 'little'
  })
}

/**
 * The corollary to the above, with the notable exception that we do not throw
 * an error if the output is larger than four bytes. (Which can happen if
 * performing a numerical operation that results in an overflow to more than 4
 * bytes).
 */
BN.prototype.toScriptNumBuffer = function () {
  return this.toSM({
    endian: 'little'
  })
}

/**
 * Trims a buffer if it starts with zeros.
 *
 * @param {Buffer} buf A buffer formatted number.
 * @param {number} natlen The natural length of the number.
 */
BN.trim = function (buf, natlen) {
  return buf.slice(natlen - buf.length, buf.length)
}

/**
 * Adds extra zeros to the start of a number.
 *
 * @param {Buffer} buf A buffer formatted number.
 * @param {number} natlen The natural length of the number.
 * @param {number} size How big to pad the number in bytes.
 */
BN.pad = function (buf, natlen, size) {
  var rbuf = Buffer.alloc(size)
  for (var i = 0; i < buf.length; i++) {
    rbuf[rbuf.length - 1 - i] = buf[buf.length - 1 - i]
  }
  for (i = 0; i < size - natlen; i++) {
    rbuf[i] = 0
  }
  return rbuf
}
/**
 * Convert a big number into a hex string. This is somewhat ambiguous, so there
 * is an opts parameter that let's you specify the endianness or the size.
 * opts.endian can be either 'big' or 'little' and opts.size can be any
 * sufficiently large number of bytes. If you always want to create a 32 byte
 * big endian number, then specify opts = { endian: 'big', size: 32 }
 *
 * @param {Object} opts Defaults to { endian: 'big', size: 32 }
 */
BN.prototype.toHex = function (...args) {
  return this.toBuffer(...args).toString('hex')
}

/**
 * Convert a hex string (such as a 256 bit binary private key) into a big
 * number. Sometimes these numbers can be formatted either as 'big endian' or
 * 'little endian', and so there is an opts parameter that lets you specify
 * which endianness is specified.
 *
 * @param {Buffer} buf A buffer number, such as a 256 bit hash or key.
 * @param {Object} opts With a property 'endian' that can be either 'big' or 'little'. Defaults big endian (most significant digit first).
 */
BN.fromHex = function (hex, ...args) {
  return BN.fromBuffer(Buffer.from(hex, 'hex'), ...args)
}

module.exports = BN
