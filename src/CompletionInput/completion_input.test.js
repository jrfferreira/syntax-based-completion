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
      class MockedInput extends CompletionInput {
        setupParser = jest.fn();
      }

      const wrapper = shallow(<MockedInput {...defaultProps} />);
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

    describe("getOutput", () => {
      it("parse only if sentence changes", done => {
        const wrapper = shallow(
          <CompletionInput {...defaultProps} value="#bar #foo" />
        );

        wrapper
          .instance()
          .setupParser()
          .then(() => {
            const mockParse = (wrapper.instance().parser.parse = jest.fn());

            wrapper.instance().getOutput("#bar #foo");
            expect(mockParse).not.toHaveBeenCalled();

            wrapper.instance().getOutput("New #bar #foo");
            expect(mockParse).toHaveBeenCalled();
          })
          .then(done);
      });
    });

    describe("checkForErrors", () => {
      it("return null if not found", () => {
        const wrapper = shallow(
          <CompletionInput {...defaultProps} value="#bar #foo" />
        );

        expect(wrapper.instance().checkForErrors({})).toBeNull();
        expect(wrapper.instance().checkForErrors({ errors: null })).toBeNull();
        expect(wrapper.instance().checkForErrors({ errors: [] })).toBeNull();
      });

      it("return first message found", () => {
        const wrapper = shallow(
          <CompletionInput {...defaultProps} value="#bar #foo" />
        );

        expect(
          wrapper.instance().checkForErrors({
            errors: [{ message: "Error #1" }, { message: "Error #2" }]
          })
        ).toBe("Error #1");
      });
    });

    describe("getInputCursorPosition", () => {
      const wrapper = mount(
        <CompletionInput {...defaultProps} value="#bar #foo" />
      );
      wrapper.instance().input.value = "#bar #foo";
      it("returns current cursor position", () => {
        wrapper.instance().input.setSelectionRange(3, 3);
        expect(wrapper.instance().getInputCursorPosition()).toBe(3);
      });
      it("or the last position", () => {
        const oldIsFinite = global.isFinite;
        global.isFinite = jest.fn().mockImplementation(() => false);
        expect(wrapper.instance().getInputCursorPosition()).toBe(9);
        global.isFinite = oldIsFinite;
      });
    });

    describe("checkReferences", () => {
      const delayActionMock = jest.fn();
      class MockedInput extends CompletionInput {
        delayAction = delayActionMock;
      }
      let wrapper;

      beforeEach(() => {
        wrapper = mount(<MockedInput {...defaultProps} value={"#foo #bar"} />);
        wrapper.update();
      });

      afterEach(() => {
        delayActionMock.mockReset();
      });

      it("should not call update if nothing changes", done => {
        wrapper.instance().input.setSelectionRange(9, 9);
        wrapper
          .instance()
          .checkReferences()
          .then(() => {
            expect(delayActionMock).not.toHaveBeenCalled();
          })
          .then(done);
      });

      it("should  call update if cursor moves", done => {
        wrapper.instance().input.focus();
        wrapper.instance().input.setSelectionRange(5, 5);

        wrapper
          .instance()
          .checkReferences()
          .then(() => {
            expect(wrapper.state("loading")).toBeTruthy();
            expect(delayActionMock).toHaveBeenCalled();
          })
          .then(done);
      });

      it("should  call update if value changes", done => {
        wrapper.instance().input.focus();
        wrapper.instance().input.value = "#foo";
        wrapper.instance().input.blur();

        wrapper
          .instance()
          .checkReferences()
          .then(() => {
            expect(wrapper.state("loading")).toBeTruthy();
            expect(delayActionMock).toHaveBeenCalled();
          })
          .then(done);
      });

      it("silent should not trigger loading state", done => {
        wrapper.instance().input.focus();
        wrapper.instance().input.setSelectionRange(5, 5);

        wrapper
          .instance()
          .checkReferences(true)
          .then(() => {
            expect(wrapper.state("loading")).not.toBeTruthy();
          })
          .then(done);
      });
    });
  });

  describe("handlers", () => {
    it("onSelect", () => {});
  });
});
