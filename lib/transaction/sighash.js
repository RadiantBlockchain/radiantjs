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

var buffer = require('buffer')

var Signature = require('../crypto/signature')
var Script = require('../script')
var Output = require('./output')
var BufferReader = require('../encoding/bufferreader')
var BufferWriter = require('../encoding/bufferwriter')
var BN = require('../crypto/bn')
var Hash = require('../crypto/hash')
var ECDSA = require('../crypto/ecdsa')
var $ = require('../util/preconditions')
var Interpreter = require('../script/interpreter')
var _ = require('../util/_')

var SIGHASH_SINGLE_BUG = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
var BITS_64_ON = 'ffffffffffffffff'

// By default, we sign with sighash_forkid
var DEFAULT_SIGN_FLAGS = Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID


/**
 * GetHashPrevoutInputs allows reconstructing the inputs of a transaction in part or whole
 * @returns return the hash of the prevout inputs
 */
 var GetHashPrevoutInputs = function (tx) {
  var writer = new BufferWriter()
  for (const input of tx.inputs) {
    writer.writeReverse(input.prevTxId)
    writer.writeUInt32LE(input.outputIndex)
    // Hash of the unlocking script
    var scriptHash = Hash.sha256sha256(input._scriptBuffer);
    writer.write(scriptHash);
  }
  var buf = writer.toBuffer()
  var ret = Hash.sha256sha256(buf)
  return ret;
}

/**
 * GetHashOutputHashes allows reconstructing the outputs of a transaction in part or whole
 * @returns sha256 of the output hashes
 */
var GetHashOutputHashes = function (tx, index = undefined) {
  const zeroRef = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
  const writer = new BufferWriter();
  const startIndex = index === undefined ? 0 : index;                   // Start at 0 if specific index not set
  const endIndex = index === undefined ? tx.outputs.length - 1 : index; // Continue until the final output if specific index not set
  // Otherwise if a specific index is set, then we process only that one index.
  for (let i = startIndex; i <= endIndex; i++) {
    const output = tx.outputs[i];
    writer.writeUInt64LEBN(output._satoshisBN)
    // Hash of the locking script
    var scriptHash = Hash.sha256sha256(output._scriptBuffer);
    writer.write(scriptHash);

    let pushRefs = new Map();
    let requireRefs = new Map();
    Script.getPushRefsFromScriptBuffer(output._scriptBuffer, pushRefs, requireRefs);

    writer.writeUInt32LE(pushRefs.size)
    if (pushRefs.size) {
      const sorted_map_by_keys = new Map([...pushRefs.entries()].sort((a, b) => String(a[0]).localeCompare(b[0])));
      let combinedBuf;
      sorted_map_by_keys.forEach((value, key)=>{
        if (!combinedBuf) {
          combinedBuf = value;
        } else {
          combinedBuf = Buffer.concat([combinedBuf, value])
        }
      });
      const colorHash = Hash.sha256sha256(combinedBuf);
      writer.write(colorHash);
    } else {
      writer.write(zeroRef);
    }
  }
  const buf = writer.toBuffer()
  var ret = Hash.sha256sha256(buf)
  return ret;
}

function GetOutputsHash (tx, n) {
  var writer = new BufferWriter()

  if (_.isUndefined(n)) {
    _.each(tx.outputs, function (output) {
      output.toBufferWriter(writer)
    })
  } else {
    tx.outputs[n].toBufferWriter(writer)
  }

  var buf = writer.toBuffer()
  var ret = Hash.sha256sha256(buf)
  return ret
}

function GetPrevoutHash (tx) {
  var writer = new BufferWriter()

  _.each(tx.inputs, function (input) {
    writer.writeReverse(input.prevTxId)
    writer.writeUInt32LE(input.outputIndex)
  })

  var buf = writer.toBuffer()
  var ret = Hash.sha256sha256(buf)
  return ret
}


function GetSequenceHash (tx) {
  var writer = new BufferWriter()

  _.each(tx.inputs, function (input) {
    writer.writeUInt32LE(input.sequenceNumber)
  })

  var buf = writer.toBuffer()
  var ret = Hash.sha256sha256(buf)
  return ret
}


var sighashPreimageForForkId = function (transaction, sighashType, inputNumber, subscript, satoshisBN) {
  var input = transaction.inputs[inputNumber]
  $.checkArgument(
    satoshisBN instanceof BN,
    'For ForkId=0 signatures, satoshis or complete input must be provided'
  )

  var hashPrevouts = Buffer.alloc(32)
  var hashSequence = Buffer.alloc(32)
  var hashOutputs = Buffer.alloc(32)
  var hashOutputHashes = Buffer.alloc(32);

  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY)) {
    hashPrevouts = GetPrevoutHash(transaction);
  }
  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY) &&
    (sighashType & 31) !== Signature.SIGHASH_SINGLE &&
    (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashSequence = GetSequenceHash(transaction);
  }
  if ((sighashType & 31) !== Signature.SIGHASH_SINGLE && (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashOutputs = GetOutputsHash(transaction)
    hashOutputHashes = GetHashOutputHashes(transaction);
  } else if ((sighashType & 31) === Signature.SIGHASH_SINGLE && inputNumber < transaction.outputs.length) {
    hashOutputs = GetOutputsHash(transaction, inputNumber);
    hashOutputHashes = GetHashOutputHashes(transaction, inputNumber);
  }
  var writer = new BufferWriter()

  // Version
  writer.writeInt32LE(transaction.version)

  // Input prevouts/nSequence (none/all, depending on flags)
  writer.write(hashPrevouts)

  writer.write(hashSequence)

  //  outpoint (32-byte hash + 4-byte little endian)
  writer.writeReverse(input.prevTxId)
  writer.writeUInt32LE(input.outputIndex)

  // scriptCode of the input (serialized as scripts inside CTxOuts)
  writer.writeVarintNum(subscript.toBuffer().length)
  writer.write(subscript.toBuffer())

  // value of the output spent by this input (8-byte little endian)
  writer.writeUInt64LEBN(satoshisBN)

  // nSequence of the input (4-byte little endian)
  var sequenceNumber = input.sequenceNumber
  writer.writeUInt32LE(sequenceNumber)

  // Outputs (none/one/all, depending on flags)
  writer.write(hashOutputHashes)

  // Outputs (none/one/all, depending on flags)
  writer.write(hashOutputs)

  // Locktime
  writer.writeUInt32LE(transaction.nLockTime)

  // sighashType
  writer.writeUInt32LE(sighashType >>> 0)

  var buf = writer.toBuffer()
  return buf
}

/**
 * Returns a buffer with the which is hashed with sighash that needs to be signed
 * for OP_CHECKSIG.
 *
 * @name Signing.sighash
 * @param {Transaction} transaction the transaction to sign
 * @param {number} sighashType the type of the hash
 * @param {number} inputNumber the input index for the signature
 * @param {Script} subscript the script that will be signed
 * @param {satoshisBN} input's amount (for  ForkId signatures)
 *
 */
var sighashPreimage = function sighashPreimage (transaction, sighashType, inputNumber, subscript, satoshisBN, flags) {
  var Transaction = require('./transaction')
  var Input = require('./input')

  if (_.isUndefined(flags)) {
    flags = DEFAULT_SIGN_FLAGS
  }

  // Copy transaction
  var txcopy = Transaction.shallowCopy(transaction)

  // Copy script
  subscript = new Script(subscript)

  if (flags & Interpreter.SCRIPT_ENABLE_REPLAY_PROTECTION) {
    // Legacy chain's value for fork id must be of the form 0xffxxxx.
    // By xoring with 0xdead, we ensure that the value will be different
    // from the original one, even if it already starts with 0xff.
    var forkValue = sighashType >> 8
    var newForkValue = 0xff0000 | (forkValue ^ 0xdead)
    sighashType = (newForkValue << 8) | (sighashType & 0xff)
  }
 
  if ((sighashType & Signature.SIGHASH_FORKID) && (flags & Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID)) {
 
    return sighashPreimageForForkId(txcopy, sighashType, inputNumber, subscript, satoshisBN)
  }
 
  // For no ForkId sighash, separators need to be removed.
  subscript.removeCodeseparators()

  var i

  for (i = 0; i < txcopy.inputs.length; i++) {
    // Blank signatures for other inputs
    txcopy.inputs[i] = new Input(txcopy.inputs[i]).setScript(Script.empty())
  }

  txcopy.inputs[inputNumber] = new Input(txcopy.inputs[inputNumber]).setScript(subscript)

  if ((sighashType & 31) === Signature.SIGHASH_NONE ||
    (sighashType & 31) === Signature.SIGHASH_SINGLE) {
    // clear all sequenceNumbers
    for (i = 0; i < txcopy.inputs.length; i++) {
      if (i !== inputNumber) {
        txcopy.inputs[i].sequenceNumber = 0
      }
    }
  }

  if ((sighashType & 31) === Signature.SIGHASH_NONE) {
    txcopy.outputs = []
  } else if ((sighashType & 31) === Signature.SIGHASH_SINGLE) {
    // The SIGHASH_SINGLE bug.
    // https://bitcointalk.org/index.php?topic=260595.0
    if (inputNumber >= txcopy.outputs.length) {
      return SIGHASH_SINGLE_BUG
    }

    txcopy.outputs.length = inputNumber + 1

    for (i = 0; i < inputNumber; i++) {
      txcopy.outputs[i] = new Output({
        satoshis: BN.fromBuffer(buffer.Buffer.from(BITS_64_ON, 'hex')),
        script: Script.empty()
      })
    }
  }

  if (sighashType & Signature.SIGHASH_ANYONECANPAY) {
    txcopy.inputs = [txcopy.inputs[inputNumber]]
  }

  var buf = new BufferWriter()
    .write(txcopy.toBuffer())
    .writeInt32LE(sighashType)
    .toBuffer()
  return buf
}

/**
 * Returns a buffer of length 32 bytes with the hash that needs to be signed
 * for OP_CHECKSIG.
 *
 * @name Signing.sighash
 * @param {Transaction} transaction the transaction to sign
 * @param {number} sighashType the type of the hash
 * @param {number} inputNumber the input index for the signature
 * @param {Script} subscript the script that will be signed
 * @param {satoshisBN} input's amount (for  ForkId signatures)
 *
 */
var sighash = function sighash (transaction, sighashType, inputNumber, subscript, satoshisBN, flags) {
  var preimage = sighashPreimage(transaction, sighashType, inputNumber, subscript, satoshisBN, flags)
  if (preimage.compare(SIGHASH_SINGLE_BUG) === 0) return preimage

  var ret = Hash.sha256sha256(preimage)
  ret = new BufferReader(ret).readReverse()
  return ret
}

/**
 * Create a signature
 *
 * @name Signing.sign
 * @param {Transaction} transaction
 * @param {PrivateKey} privateKey
 * @param {number} sighash
 * @param {number} inputIndex
 * @param {Script} subscript
 * @param {satoshisBN} input's amount
 * @return {Signature}
 */
function sign (transaction, privateKey, sighashType, inputIndex, subscript, satoshisBN, flags) {
  var hashbuf = sighash(transaction, sighashType, inputIndex, subscript, satoshisBN, flags)

  var sig = ECDSA.sign(hashbuf, privateKey, 'little').set({
    nhashtype: sighashType
  })
  return sig
}

/**
 * Verify a signature
 *
 * @name Signing.verify
 * @param {Transaction} transaction
 * @param {Signature} signature
 * @param {PublicKey} publicKey
 * @param {number} inputIndex
 * @param {Script} subscript
 * @param {satoshisBN} input's amount
 * @param {flags} verification flags
 * @return {boolean}
 */
function verify (transaction, signature, publicKey, inputIndex, subscript, satoshisBN, flags) {
  $.checkArgument(!_.isUndefined(transaction))
  $.checkArgument(!_.isUndefined(signature) && !_.isUndefined(signature.nhashtype))
  var hashbuf = sighash(transaction, signature.nhashtype, inputIndex, subscript, satoshisBN, flags)
  return ECDSA.verify(hashbuf, signature, publicKey, 'little')
}

/**
 * @namespace Signing
 */
module.exports = {
  sighashPreimage: sighashPreimage,
  sighash: sighash,
  GetOutputsHash: GetOutputsHash,
  GetSequenceHash: GetSequenceHash,
  GetPrevoutHash: GetPrevoutHash,
  GetHashPrevoutInputs: GetHashPrevoutInputs,
  GetHashOutputHashes: GetHashOutputHashes,
  sign: sign,
  verify: verify
}
