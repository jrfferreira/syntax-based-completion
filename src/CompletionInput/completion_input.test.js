import React from "react";
import { shallow, mount } from "enzyme";
import { COMMANDS } from "../constants";
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
  delay: 0,
  fetchSuggestions: () => new Promise(resolve => resolve([]))
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

    describe("debounce", () => {
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
        wrapper.instance().debounce(() => {});
        expect(global.clearTimeout).toHaveBeenCalled();
        expect(global.setTimeout).toHaveBeenCalled();
      });

      it("updates the same reference", () => {
        const wrapper = shallow(<CompletionInput {...defaultProps} />);
        global.setTimeout.mockImplementation(() => "mock-reference");
        wrapper.instance().fetcher = "initial-mock-reference";

        wrapper.instance().debounce("action");

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
      const debounceMock = jest.fn();
      class MockedInput extends CompletionInput {
        debounce = debounceMock;
      }
      let wrapper;

      beforeEach(() => {
        wrapper = mount(<MockedInput {...defaultProps} value={"#foo #bar"} />);
        wrapper.update();
      });

      afterEach(() => {
        debounceMock.mockReset();
      });

      it("should not call update if nothing changes", done => {
        wrapper.instance().input.setSelectionRange(9, 9);
        wrapper
          .instance()
          .checkReferences()
          .then(() => {
            expect(debounceMock).not.toHaveBeenCalled();
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
            expect(debounceMock).toHaveBeenCalled();
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
            expect(debounceMock).toHaveBeenCalled();
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

    describe("sortSuggestions", () => {
      let wrapper;

      beforeEach(() => {
        wrapper = mount(
          <CompletionInput {...defaultProps} value="#bar #foo" />
        );
      });
      it("returns empty list if have no suggestions", () => {
        expect(wrapper.instance().sortSuggestions()).toEqual([]);
        expect(wrapper.instance().sortSuggestions(null)).toEqual([]);
        expect(wrapper.instance().sortSuggestions(undefined)).toEqual([]);
        expect(wrapper.instance().sortSuggestions([])).toEqual([]);
      });

      it("returns same list if missing no text to compare", () => {
        wrapper.setState({ currentNode: {} });
        expect(wrapper.instance().sortSuggestions(["foo", "bar"])).toEqual([
          "foo",
          "bar"
        ]);
      });

      it("show similar itens at first", () => {
        wrapper.setState({ currentNode: { text: "Foot" } });

        expect(
          wrapper
            .instance()
            .sortSuggestions(["Voley", "Rugby", "Footbal", "American Footbal"])
        ).toEqual(["Footbal", "American Footbal", "Voley", "Rugby"]);
      });
    });

    describe("checkForSuggestions", () => {
      const mockDebounce = jest.fn().mockImplementation(cb => cb());
      const mockSortSuggestions = jest
        .fn()
        .mockImplementation(suggestions => suggestions);

      class MockedInput extends CompletionInput {
        debounce = mockDebounce;
        sortSuggestions = mockSortSuggestions;
      }

      beforeEach(() => {
        mockDebounce.mockClear();
        mockSortSuggestions.mockClear();
      });

      it("should update loading status", () => {
        const wrapper = mount(
          <MockedInput {...defaultProps} value="#bar #foo" />
        );

        wrapper.instance().checkForSuggestions();

        expect(wrapper.state("showSuggestions")).toBeTruthy();
        expect(wrapper.state("fetchingSuggestions")).toBeTruthy();
      });

      it("should trigger fetchSuggestions with current node", () => {
        const mockFetchSuggestions = jest.fn().mockRejectedValue([]);
        const wrapper = mount(
          <MockedInput
            {...defaultProps}
            value="#bar #foo"
            fetchSuggestions={mockFetchSuggestions}
          />
        );

        wrapper.instance().checkForSuggestions();

        expect(mockFetchSuggestions).toHaveBeenCalledWith(
          wrapper.state("currentNode")
        );
      });

      it("updates error if fails to retrive the list", done => {
        const mockFetchSuggestions = jest
          .fn()
          .mockRejectedValue("Error #reject");
        const wrapper = mount(
          <MockedInput
            {...defaultProps}
            value="#bar #foo"
            fetchSuggestions={mockFetchSuggestions}
          />
        );

        wrapper
          .instance()
          .checkForSuggestions()
          .catch(() => {
            expect(mockFetchSuggestions).toHaveBeenCalled();
            expect(wrapper.state("error")).toEqual("Error #reject");
            expect(wrapper.state("fetchingSuggestions")).not.toBeTruthy();
            done();
          });
      });

      it("should trigger sortSuggestions with the returned list", done => {
        const mockFetchSuggestions = jest
          .fn()
          .mockResolvedValue(["Foo", "Bar"]);

        const wrapper = mount(
          <MockedInput
            {...defaultProps}
            value="#bar #foo"
            fetchSuggestions={mockFetchSuggestions}
          />
        );

        wrapper
          .instance()
          .checkForSuggestions()
          .then(() => {
            expect(mockFetchSuggestions).toHaveBeenCalled();
            expect(wrapper.state("suggestions")).toEqual(["Foo", "Bar"]);
            expect(wrapper.state("fetchingSuggestions")).not.toBeTruthy();
            done();
          });
      });
    });

    describe("navigate", () => {
      const suggestionsList = ["first", "second", "third"];
      const wrapper = mount(<CompletionInput {...defaultProps} />);
      wrapper.setState({ suggestions: suggestionsList });

      describe("naviagateDown", () => {
        it("increase position", () => {
          wrapper.setState({ active: 1 });
          expect(wrapper.instance().navigateDown()).toBe(2);
        });

        it("stay at the same position if is the last", () => {
          wrapper.setState({ active: 2 });
          expect(wrapper.instance().navigateDown()).toBe(2);
        });
      });

      describe("naviagateUp", () => {
        it("decrease position", () => {
          wrapper.setState({ active: 2 });
          expect(wrapper.instance().navigateUp()).toBe(1);
        });

        it("stay at the same position if is the first", () => {
          wrapper.setState({ active: 0 });
          expect(wrapper.instance().navigateUp()).toBe(0);
        });
      });
    });
  });

  describe("handlers", () => {
    describe("onSelect", () => {
      it("Update sentence", () => {
        const mockOnChange = jest.fn();
        const wrapper = mount(
          <CompletionInput
            {...defaultProps}
            onChange={mockOnChange}
            value={"#foo #bar #extra"}
          />
        );

        wrapper.setState({
          currentNode: wrapper.state("output").findChildByPosition(7)
        });
        const mockFocus = (wrapper.instance().input.focus = jest.fn());
        const mockSetSelectionRange = (wrapper.instance().input.setSelectionRange = jest.fn());

        wrapper.instance().onSelect("#newValue");

        expect(mockFocus).toHaveBeenCalled();
        expect(mockSetSelectionRange).toHaveBeenCalledWith(14, 14);
        expect(mockOnChange).toHaveBeenCalledWith("#foo #newValue #extra");
      });
    });

    describe("onPressEnter", () => {
      const mockOnSelect = jest.fn();

      class MockedInput extends CompletionInput {
        onSelect = mockOnSelect;
      }

      const suggestionsList = ["first", "second", "third"];
      const wrapper = mount(<MockedInput {...defaultProps} />);

      wrapper.setState({ suggestions: suggestionsList });

      beforeEach(() => {
        mockOnSelect.mockClear();
      });

      it("triggers onSelect", () => {
        wrapper.setState({ active: 2 });
        wrapper.instance().onPressEnter();
        expect(mockOnSelect).toHaveBeenCalledWith("third");
      });

      it("don't trigger onSelect for invalid options", () => {
        wrapper.setState({ active: 6 });
        wrapper.instance().onPressEnter();
        expect(mockOnSelect).not.toHaveBeenCalled();
      });
    });

    describe("onNavigate", () => {
      const mockNavigateUp = jest.fn();
      const mockNavigateDown = jest.fn();

      let mockedEvent;

      class MockedInput extends CompletionInput {
        navigateDown = mockNavigateDown;
        navigateUp = mockNavigateUp;
      }

      beforeEach(() => {
        mockNavigateDown.mockClear();
        mockNavigateUp.mockClear();
        mockedEvent = {
          key: null,
          preventDefault: jest.fn(),
          stopPropagation: jest.fn()
        };
      });

      it("prevent default behaviour and propagation", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);

        wrapper.instance().onNavigate(mockedEvent);

        expect(mockedEvent.stopPropagation).toHaveBeenCalled();
        expect(mockedEvent.preventDefault).toHaveBeenCalled();
      });

      it("trigger navigateDown if command is down key", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        mockedEvent.key = COMMANDS.DOWN;
        wrapper.instance().onNavigate(mockedEvent);

        expect(mockNavigateUp).not.toHaveBeenCalled();
        expect(mockNavigateDown).toHaveBeenCalled();
      });

      it("trigger navigateUp if command is up key", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        mockedEvent.key = COMMANDS.UP;
        wrapper.instance().onNavigate(mockedEvent);

        expect(mockNavigateDown).not.toHaveBeenCalled();
        expect(mockNavigateUp).toHaveBeenCalled();
      });
    });

    describe("onKeyUp", () => {
      const mockCheckReferences = jest.fn();
      const mockOnNavigate = jest.fn();
      const mockOnPressEnter = jest.fn();
      const mockOnClose = jest.fn();

      class MockedInput extends CompletionInput {
        checkReferences = mockCheckReferences;
        onNavigate = mockOnNavigate;
        onPressEnter = mockOnPressEnter;
        onClose = mockOnClose;
      }

      const wrapper = mount(<MockedInput {...defaultProps} />);

      beforeEach(() => {
        mockCheckReferences.mockClear();
        mockOnNavigate.mockClear();
        mockOnPressEnter.mockClear();
        mockOnClose.mockClear();
      });

      it("no triggers if key is unkown", () => {
        wrapper.find("input").simulate("keyup", { key: "del" });

        expect(mockCheckReferences).not.toHaveBeenCalled();
        expect(mockOnNavigate).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers checkReferences only if left key is pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.LEFT });

        expect(mockCheckReferences).toHaveBeenCalled();
        expect(mockOnNavigate).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers checkReferences only if right key s pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.RIGHT });

        expect(mockCheckReferences).toHaveBeenCalled();
        expect(mockOnNavigate).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers onNavigate only if up key is pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.UP });

        expect(mockOnNavigate).toHaveBeenCalled();
        expect(mockCheckReferences).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers onNavigate only if down key is pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.DOWN });

        expect(mockOnNavigate).toHaveBeenCalled();
        expect(mockCheckReferences).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers onPressEnter only if enter key is pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.ENTER });

        expect(mockOnPressEnter).toHaveBeenCalled();
        expect(mockCheckReferences).not.toHaveBeenCalled();
        expect(mockOnNavigate).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      it("triggers onClose only if esc key is pressed", () => {
        wrapper.find("input").simulate("keyup", { key: COMMANDS.ESC });

        expect(mockOnClose).toHaveBeenCalled();
        expect(mockCheckReferences).not.toHaveBeenCalled();
        expect(mockOnNavigate).not.toHaveBeenCalled();
        expect(mockOnPressEnter).not.toHaveBeenCalled();
      });
    });

    describe("onBlur", () => {
      const mockOnClose = jest.fn();

      class MockedInput extends CompletionInput {
        onClose = mockOnClose;
      }

      beforeEach(() => {
        mockOnClose.mockClear();
      });

      it("trigger on close if current state is not focusing list", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        wrapper.setState({ focusingList: false });

        wrapper.find("input").simulate("blur");
        expect(mockOnClose).toHaveBeenCalled();
      });

      it("do not trigger on close if current state is focusing list", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        wrapper.setState({ focusingList: true });

        wrapper.find("input").simulate("blur");
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    describe("onMouseUp", () => {
      const mockCheckReferences = jest.fn();

      class MockedInput extends CompletionInput {
        checkReferences = mockCheckReferences;
      }

      beforeEach(() => {
        mockCheckReferences.mockClear();
      });

      it("do not trigger checkReferences if current target is not the input", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        wrapper.setState({ focusingList: false });

        wrapper.find("input").simulate("mouseUp", { target: document });
        expect(mockCheckReferences).not.toHaveBeenCalled();
      });

      it("trigger checkReferences if current target is the input", () => {
        const wrapper = mount(<MockedInput {...defaultProps} />);
        wrapper.setState({ focusingList: true });

        wrapper
          .find("input")
          .simulate("mouseUp", { target: wrapper.instance().input });
        expect(mockCheckReferences).toHaveBeenCalled();
      });
    });
  });
});
