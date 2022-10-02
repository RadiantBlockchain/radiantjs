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

var Stack = function Stack (rawstack, varStack) {
  this.stack = rawstack
  this.varStack = varStack || []
}

module.exports = Stack

Stack.prototype.pushVar = function (varName) {
  this.varStack.push(varName || '$tmp')
}

Stack.prototype.popVar = function () {
  this.varStack.pop()
}

Stack.prototype.push = function (n, varName) {
  this.pushVar(varName)
  this.stack.push(n)
  this.checkConsistency()
}

Stack.prototype.pop = function () {
  this.popVar()
  let top = this.stack.pop()
  this.checkConsistency()
  return top
}

Stack.prototype.updateTopVars = function (vars) {
  if (vars.length > this.varStack.length) {
    throw new Error(`updateTopVars fail, stack: ${this.stack.length},  varStack: ${this.varStack.length}, vars:${vars.length}`)
  }
  vars = vars.reverse()
  this.varStack.splice(this.varStack.length - vars.length, vars.length, ...vars)
}

Stack.prototype.stacktop = function (i) {
  return this.stack[this.stack.length + i]
}

Stack.prototype.vartop = function (i) {
  return this.varStack[this.varStack.length + i]
}

Stack.prototype.slice = function (start, end) {
  return this.stack.slice(start, end)
}

Stack.prototype.splice = function (start, deleteCount, ...items) {
  this.varStack.splice(start, deleteCount, ...items)
  return this.stack.splice(start, deleteCount, ...items)
}

Stack.prototype.write = function (i, value) {
  this.stack[this.stack.length + i] = value
}

Stack.prototype.copy = function () {
  return new Stack(this.stack.slice() || [], this.varStack.slice() || [])
}

function bytesToHexString (bytearray) {
  return bytearray.reduce(function (o, c) { return o += ('0' + (c & 0xFF).toString(16)).slice(-2) }, '')
}

Stack.prototype.printVarStack = function () {
  let array = this.varStack.map((v, i) => ({
    name: v,
    value: bytesToHexString(this.rawstack[i].data)
  }))
  console.log(JSON.stringify(array, null, 4))
}

Stack.prototype.checkConsistency = function () {
  if (this.stack.length !== this.varStack.length) {
    this.printVarStack()
    throw new Error(`checkConsistency fail, stack: ${this.stack.length}, varStack:${this.varStack.length}`)
  }
}

Stack.prototype.checkConsistencyWithVars = function (varStack) {
  if (this.stack.length < varStack.length) {
    this.printVarStack()
    throw new Error(`checkConsistencyWithVars fail, stack: ${this.stack.length}, varStack:${varStack.length}`)
  }
}

Object.defineProperty(Stack.prototype, 'length', {
  get: function () {
    return this.stack.length
  }
})

Object.defineProperty(Stack.prototype, 'rawstack', {
  get: function () {
    return this.stack
  }
})
