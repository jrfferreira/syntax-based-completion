import React from "react";
import { shallow, mount } from "enzyme";

import CompletionInput from "./completion_input";

const SYNTAX = `
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
`;

const defaultProps = {
  syntax: SYNTAX,
  delay: 0
};

describe("<CompletionInput>", () => {
  describe("shallow render", () => {
    it("parsing syntax", () => {
      const wrapper = shallow(<CompletionInput {...defaultProps} />);
      wrapper.instance().parser = null;
      wrapper.update();
      expect(
        wrapper.find(".CompletionInput__input").prop("placeholder")
      ).toEqual("Parsing syntax...");
      expect(wrapper).toMatchSnapshot();
    });

    it("empty", () => {
      const wrapper = shallow(<CompletionInput {...defaultProps} />);

      expect(wrapper).toMatchSnapshot();
    });

    it("with text", () => {
      const wrapper = shallow(
        <CompletionInput {...defaultProps} value="Foo #bar" />
      );
      expect(wrapper).toMatchSnapshot();
    });

    it("with error", () => {
      const wrapper = shallow(
        <CompletionInput {...defaultProps} value="Foo /Invalid" />
      );
      expect(wrapper.find(".CompletionInput__error")).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });

    it("showing suggestions", () => {
      const wrapper = shallow(<CompletionInput {...defaultProps} />);

      wrapper.setState({ showSuggestions: true, suggestions: ["Foo", "Bar"] });
      wrapper.update();
      expect(wrapper.find("SuggestionList")).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("helpers", () => {
    describe("setupParser", () => {
      const mockSetupParser = jest.fn();
      class MockedInput extends CompletionInput {
        setupParser = mockSetupParser;
      }

      it("is called on mount", () => {
        mount(<MockedInput {...defaultProps} />);
        expect(mockSetupParser).toHaveBeenCalled();
      });
    });

    describe("delayAction", () => {
      const oldClearTimeout = global.clearTimeout;
      const oldSetTimeout = global.setTimeout;

      beforeEach(() => {
        global.clearTimeout = jest.fn();
        global.setTimeout = jest.fn();
      });

      afterEach(() => {
        global.setTimeout = oldSetTimeout;
        global.clearTimeout = oldClearTimeout;
      });

      it("trigger clearTimout/setTimeout", () => {
        const wrapper = shallow(<CompletionInput {...defaultProps} />);
        wrapper.instance().delayAction(() => {});
        expect(global.clearTimeout).toHaveBeenCalled();
        expect(global.setTimeout).toHaveBeenCalled();
      });

      it("updates the same reference", () => {
        const wrapper = shallow(<CompletionInput {...defaultProps} />);
        global.setTimeout.mockImplementation(() => "mock-reference");
        wrapper.instance().fetcher = "initial-mock-reference";

        wrapper.instance().delayAction("action");

        expect(wrapper.instance().fetcher).toBe("mock-reference");
        expect(global.clearTimeout).toHaveBeenCalledWith(
          "initial-mock-reference"
        );
      });
    });
  });

  describe("handlers", () => {
    it("onSelect", () => {});
  });
});
