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

var docsURL = 'https://docs.moneybutton.com/'

module.exports = [{
  name: 'InvalidB58Char',
  message: 'Invalid Base58 character: {0} in {1}'
}, {
  name: 'InvalidB58Checksum',
  message: 'Invalid Base58 checksum for {0}'
}, {
  name: 'InvalidNetwork',
  message: 'Invalid version for network: got {0}'
}, {
  name: 'InvalidState',
  message: 'Invalid state: {0}'
}, {
  name: 'NotImplemented',
  message: 'Function {0} was not implemented yet'
}, {
  name: 'InvalidNetworkArgument',
  message: 'Invalid network: must be "livenet" or "testnet", got {0}'
}, {
  name: 'InvalidArgument',
  message: function () {
    return 'Invalid Argument' + (arguments[0] ? (': ' + arguments[0]) : '') +
      (arguments[1] ? (' Documentation: ' + docsURL + arguments[1]) : '')
  }
}, {
  name: 'AbstractMethodInvoked',
  message: 'Abstract Method Invocation: {0}'
}, {
  name: 'InvalidArgumentType',
  message: function () {
    return 'Invalid Argument for ' + arguments[2] + ', expected ' + arguments[1] + ' but got ' + typeof arguments[0]
  }
}, {
  name: 'Unit',
  message: 'Internal Error on Unit {0}',
  errors: [{
    'name': 'UnknownCode',
    'message': 'Unrecognized unit code: {0}'
  }, {
    'name': 'InvalidRate',
    'message': 'Invalid exchange rate: {0}'
  }]
}, {
  name: 'MerkleBlock',
  message: 'Internal Error on MerkleBlock {0}',
  errors: [{
    'name': 'InvalidMerkleTree',
    'message': 'This MerkleBlock contain an invalid Merkle Tree'
  }]
}, {
  name: 'Transaction',
  message: 'Internal Error on Transaction {0}',
  errors: [{
    name: 'Input',
    message: 'Internal Error on Input {0}',
    errors: [{
      name: 'MissingScript',
      message: 'Need a script to create an input'
    }, {
      name: 'UnsupportedScript',
      message: 'Unsupported input script type: {0}'
    }, {
      name: 'MissingPreviousOutput',
      message: 'No previous output information.'
    }]
  }, {
    name: 'NeedMoreInfo',
    message: '{0}'
  }, {
    name: 'InvalidSorting',
    message: 'The sorting function provided did not return the change output as one of the array elements'
  }, {
    name: 'InvalidOutputAmountSum',
    message: '{0}'
  }, {
    name: 'MissingSignatures',
    message: 'Some inputs have not been fully signed'
  }, {
    name: 'InvalidIndex',
    message: 'Invalid index: {0} is not between 0, {1}'
  }, {
    name: 'UnableToVerifySignature',
    message: 'Unable to verify signature: {0}'
  }, {
    name: 'DustOutputs',
    message: 'Dust amount detected in one output'
  }, {
    name: 'InvalidSatoshis',
    message: 'Output satoshis are invalid'
  }, {
    name: 'FeeError',
    message: 'Internal Error on Fee {0}',
    errors: [{
      name: 'TooSmall',
      message: 'Fee is too small: {0}'
    }, {
      name: 'TooLarge',
      message: 'Fee is too large: {0}'
    }, {
      name: 'Different',
      message: 'Unspent value is different from specified fee: {0}'
    }]
  }, {
    name: 'ChangeAddressMissing',
    message: 'Change address is missing'
  }, {
    name: 'BlockHeightTooHigh',
    message: 'Block Height can be at most 2^32 -1'
  }, {
    name: 'NLockTimeOutOfRange',
    message: 'Block Height can only be between 0 and 499 999 999'
  }, {
    name: 'LockTimeTooEarly',
    message: 'Lock Time can\'t be earlier than UNIX date 500 000 000'
  }, {
    name: 'TransactionAlreadySealed',
    message: 'Cannot update sealed transaction'
  }]
}, {
  name: 'Script',
  message: 'Internal Error on Script {0}',
  errors: [{
    name: 'UnrecognizedAddress',
    message: 'Expected argument {0} to be an address'
  }, {
    name: 'CantDeriveAddress',
    message: 'Can\'t derive address associated with script {0}, needs to be p2pkh in, p2pkh out, p2sh in, or p2sh out.'
  }, {
    name: 'InvalidBuffer',
    message: 'Invalid script buffer: can\'t parse valid script from given buffer {0}'
  }]
}, {
  name: 'HDPrivateKey',
  message: 'Internal Error on HDPrivateKey {0}',
  errors: [{
    name: 'InvalidDerivationArgument',
    message: 'Invalid derivation argument {0}, expected string, or number and boolean'
  }, {
    name: 'InvalidEntropyArgument',
    message: 'Invalid entropy: must be an hexa string or binary buffer, got {0}',
    errors: [{
      name: 'TooMuchEntropy',
      message: 'Invalid entropy: more than 512 bits is non standard, got "{0}"'
    }, {
      name: 'NotEnoughEntropy',
      message: 'Invalid entropy: at least 128 bits needed, got "{0}"'
    }]
  }, {
    name: 'InvalidLength',
    message: 'Invalid length for xprivkey string in {0}'
  }, {
    name: 'InvalidPath',
    message: 'Invalid derivation path: {0}'
  }, {
    name: 'UnrecognizedArgument',
    message: 'Invalid argument: creating a HDPrivateKey requires a string, buffer, json or object, got "{0}"'
  }]
}, {
  name: 'HDPublicKey',
  message: 'Internal Error on HDPublicKey {0}',
  errors: [{
    name: 'ArgumentIsPrivateExtended',
    message: 'Argument is an extended private key: {0}'
  }, {
    name: 'InvalidDerivationArgument',
    message: 'Invalid derivation argument: got {0}'
  }, {
    name: 'InvalidLength',
    message: 'Invalid length for xpubkey: got "{0}"'
  }, {
    name: 'InvalidPath',
    message: 'Invalid derivation path, it should look like: "m/1/100", got "{0}"'
  }, {
    name: 'InvalidIndexCantDeriveHardened',
    message: 'Invalid argument: creating a hardened path requires an HDPrivateKey'
  }, {
    name: 'MustSupplyArgument',
    message: 'Must supply an argument to create a HDPublicKey'
  }, {
    name: 'UnrecognizedArgument',
    message: 'Invalid argument for creation, must be string, json, buffer, or object'
  }]
}]
