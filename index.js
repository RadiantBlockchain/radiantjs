'use strict'

var radiantjs = module.exports

// module information
radiantjs.version = 'v' + require('./package.json').version
radiantjs.versionGuard = function (version) {
  if (version !== undefined) {
    var message = `
      More than one instance of radiantjs found.
      Please make sure to require radiantjs and check that submodules do
      not also include their own radiantjs dependency.`
    console.warn(message)
  }
}
var global = global || {};
radiantjs.versionGuard(global._radiantjs)
global._radiantjs = radiantjs.version

// crypto
radiantjs.crypto = {}
radiantjs.crypto.BN = require('./lib/crypto/bn')
radiantjs.crypto.ECDSA = require('./lib/crypto/ecdsa')
radiantjs.crypto.Hash = require('./lib/crypto/hash')
radiantjs.crypto.Random = require('./lib/crypto/random')
radiantjs.crypto.Point = require('./lib/crypto/point')
radiantjs.crypto.Signature = require('./lib/crypto/signature')

// encoding
radiantjs.encoding = {}
radiantjs.encoding.Base58 = require('./lib/encoding/base58')
radiantjs.encoding.Base58Check = require('./lib/encoding/base58check')
radiantjs.encoding.BufferReader = require('./lib/encoding/bufferreader')
radiantjs.encoding.BufferWriter = require('./lib/encoding/bufferwriter')
radiantjs.encoding.Varint = require('./lib/encoding/varint')

// utilities
radiantjs.util = {}
radiantjs.util.js = require('./lib/util/js')
radiantjs.util.preconditions = require('./lib/util/preconditions')

// errors thrown by the library
radiantjs.errors = require('./lib/errors')

// main bitcoin library
radiantjs.Address = require('./lib/address')
radiantjs.Block = require('./lib/block')
radiantjs.MerkleBlock = require('./lib/block/merkleblock')
radiantjs.BlockHeader = require('./lib/block/blockheader')
radiantjs.HDPrivateKey = require('./lib/hdprivatekey.js')
radiantjs.HDPublicKey = require('./lib/hdpublickey.js')
radiantjs.Networks = require('./lib/networks')
radiantjs.Opcode = require('./lib/opcode')
radiantjs.PrivateKey = require('./lib/privatekey')
radiantjs.PublicKey = require('./lib/publickey')
radiantjs.Script = require('./lib/script')
radiantjs.Transaction = require('./lib/transaction')

// dependencies, subject to change
radiantjs.deps = {}
radiantjs.deps.bnjs = require('bn.js')
radiantjs.deps.bs58 = require('bs58')
radiantjs.deps.Buffer = Buffer
radiantjs.deps.elliptic = require('elliptic')
radiantjs.deps._ = require('./lib/util/_')

// Internal usage, exposed for testing/advanced tweaking
radiantjs.Transaction.sighash = require('./lib/transaction/sighash')
