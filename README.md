# syntax-based-completion

[![Circe CI][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

- [What is this?](#what-is-this)
- [BNF](#bnf)
- [Installation](#installation)
- [Usage](#usage)
- [Utils](#utils)
  - [Parser](#parser)
  - [Node](#node)
- [TODO](#todo)

## What is this?

`syntax-based-completion` is a [React Component](react-component) (Form Input) that allows you to define a [BNF](bnf) syntax to validate the input value and suggest anything based on the syntax.

## BNF

> In computer science, Backus–Naur form or Backus normal form (BNF) is a notation technique for context-free grammars, often used to describe the syntax of languages used in computing, such as computer programming languages, document formats, instruction sets and communication protocols. They are applied wherever exact descriptions of languages are needed: for instance, in official language specifications, in manuals, and in textbooks on programming language theory.
> Source [Wikipedia](bnf)

## Installation

The component is available trought npm and depends of [`ebnf`](node-ebnf):

```bash
npm install --save ebnf
npm install --save syntax-based-completion
```

## Usage

```javascript
<SuggestionInput
  placeholder="Start typing..."
  syntax={`
  <SYNTAX>    ::= <equation>
  <equation>  ::= <number> <operation> <number>
  <operation> ::= "+" | "-" | "/" | "*"
  <number>    ::= <DIGITS>
  <DIGITS>    ::= <DIGIT> <DIGITS> | <DIGIT>
  <DIGIT>     ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  `}
  fetchSuggestions={({ type }) => new Promise((resolve) => resolve(type === 'operation' ? ["+", "-", "/", "*"] || []))}
/>
```

By default, the component accepts the same properties of a `input`, with some extras:

### Properties

### syntax

A string with the BNF syntax description

``` ebnf
  <SYNTAX>    ::= <equation>
  <equation>  ::= <number> <operation> <number>
  <operation> ::= "+" | "-" | "/" | "*"
  <number>    ::= <DIGITS>
  <DIGITS>    ::= <DIGIT> <DIGITS> | <DIGIT>
  <DIGIT>     ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
```

Obs: UPPER_SNAKE_CASES definitions will be ignored on parser, improving performance.

### onChange()

``` javascript
onChange(newValue, currentNode)
```

### fetchSuggestions()

``` javascript
onChange(newValue, currentNode) => Promise
```

## Utils

### Parser

`Parser` is a helper class that allows you to work with the BNF parser without the component:

``` javascript
import { Parser } from 'syntax-based-completion';

const parser = new Parser(SYNTAX)
const output = parser.parse(text)
```

#### constructor()

Respects [ebnf](node-ebnf) `Parser` constructor.

#### parse()

``` javascript
new Parser(SYNTAX).parse("My Text");
```

Returns a [Node](#node).

### Node

`Node` is a helper class that allows you to traverse a BNF node and its parents/children.

#### constructor()

Respects [ebnf](node-ebnf) `IToken` constructor.

#### findChildByPosition()

``` javascript
node.findChildByPosition(12)
```

Returns the node matching the length position in the string or `itself`.

#### findChildByType()

``` javascript
node.findChildByType('operator')
```

Returns the first child (or its children) matching the specified type or `false`.

#### findParentByType()

``` javascript
node.findParentByType('word')
```

Returns the first parent (or its parent) matching the specified type or `itself`.


## TODO

- Allow node deletion with `Shift+backspace`;
- Allow selection replacement;
- Text styling;

[react-component]: https://reactjs.org/docs/react-component.html
[node-ebnf]: https://github.com/lys-lang/node-ebnf
[bnf]: https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form
[build-badge]: https://circleci.com/gh/jrfferreira/syntax-based-completion.svg?style=svg
[build]: https://circleci.com/gh/jrfferreira/syntax-based-completion
[npm-badge]: https://img.shields.io/npm/v/syntax-based-completion.png?style=flat-square
[npm]: https://www.npmjs.org/package/syntax-based-completion
[coveralls-badge]: https://img.shields.io/coveralls/jrfferreira/syntax-based-completion/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/jrfferreira/syntax-based-completion
