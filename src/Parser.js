import { Grammars } from "ebnf";
import Node from "./Node";

export default class Parser {
  grammar = null;

  constructor(syntax, options) {
    this.grammar = new Grammars.BNF.Parser(syntax, options);
  }

  parse(sentence) {
    return new Node(this.grammar.getAST(sentence));
  }
}
