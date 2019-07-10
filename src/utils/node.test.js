import { Node, Parser } from "./";

const parser = new Parser(`
<SYNTAX>           ::= <composition>
<composition>      ::= <word> <BREAK> <composition> | <word> <BREAK> | <word>
<word>             ::= <CHARS> | <tag>
<tag>              ::= "#" <CHARS> | "#"
<CHARS>            ::= <CHAR> <CHARS> | <CHAR>
<CHAR>             ::= <LETTER> | <DIGIT> | "_" | "-"
<LETTER>           ::= <UPPER_LETTER> | <LOWER_LETTER>
<UPPER_LETTER>     ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
<LOWER_LETTER>     ::="a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
<DIGIT>            ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
<BREAK>            ::= <BREAK_SYMBOL> <BREAK> | <BREAK_SYMBOL>
<BREAK_SYMBOL>     ::= "," | "." | ";" | " "
`);

describe("Node", () => {
  describe("constructor", () => {
    it("complete", () => {
      const node = new Node({
        type: "term",
        text: "Foo",
        start: 0,
        end: 2,
        parent: new Node(),
        fullText: "Foo",
        errors: [],
        rest: "",
        fragment: true,
        lookup: true,
        children: [new Node(), new Node()]
      });
      expect(node).toMatchSnapshot();
    });

    it(" without children", () => {
      const node = new Node({
        type: "term",
        text: "Foo",
        start: 0,
        end: 2,
        parent: new Node(),
        fullText: "Foo",
        rest: "",
        fragment: true,
        lookup: true
      });
      expect(node.children).toEqual([]);
      expect(node).toMatchSnapshot();
    });
  });

  describe("helpers", () => {
    const parsedText = parser.parse("Foo #bar ");

    describe("findChildByPosition", () => {
      it("node without children returns itself", () => {
        let mockedNode = new Node({ type: "mock", text: "Mock" });
        expect(mockedNode.type).toBe("mock");
        expect(mockedNode.text).toBe("Mock");
      });

      it("find position 0", () => {
        let match = parsedText.findChildByPosition(0);
        expect(match.type).toBe("word");
        expect(match.text).toBe("Foo");
      });

      it("find position at the start of a Node", () => {
        let match = parsedText.findChildByPosition(4);
        expect(match.type).toBe("tag");
        expect(match.text).toBe("#bar");
      });

      it("find position at the start of a Node", () => {
        let match = parsedText.findChildByPosition(8);
        expect(match.type).toBe("tag");
        expect(match.text).toBe("#bar");
      });

      it("invalid position returns itself", () => {
        let match = parsedText.findChildByPosition(-1);
        expect(match.type).toBe("SYNTAX");
        expect(match.text).toBe("Foo #bar ");
      });
    });

    describe("findChildByType", () => {
      it("node without children returns false", () => {
        let mockedNode = new Node({ type: "mock", text: "Mock" });
        expect(mockedNode.findChildByType("tag")).toBe(false);
      });

      it("node without matching returns false", () => {
        let match = parsedText.findChildByType("bar");
        expect(match).toBe(false);
      });

      it("returns matching node", () => {
        let match = parsedText.findChildByType("tag");
        expect(match.type).toBe("tag");
        expect(match.text).toBe("#bar");
      });
    });

    describe("findParentByType", () => {
      const child = parsedText.findChildByType("tag");

      it("node without parent returns itself", () => {
        let mockedNode = new Node({ type: "mock", text: "Mock" });
        let match = mockedNode.findParentByType("composition");
        expect(match.type).toBe("mock");
        expect(match.text).toBe("Mock");
      });

      it("node without matching parent returns root", () => {
        let match = child.findParentByType("bar");
        expect(match.type).toBe("SYNTAX");
        expect(match.text).toBe("Foo #bar ");
      });

      it("returns matching node", () => {
        let match = child.findParentByType("SYNTAX");
        expect(match.type).toBe("SYNTAX");
        expect(match.text).toBe("Foo #bar ");
      });
    });
  });
});
