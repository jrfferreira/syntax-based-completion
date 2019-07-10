import React from "react";
import { shallow } from "enzyme";

import SuggestionList from "./suggestion_list";

describe("<SuggestionList>", () => {
  describe("shallow render", () => {
    it("loading", () => {
      const wrapper = shallow(<SuggestionList loading />);

      expect(wrapper.find("LoadingSpinner")).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });

    it("with suggestions", () => {
      const wrapper = shallow(<SuggestionList suggestions={["Foo", "Bar"]} />);
      expect(wrapper.find("LoadingSpinner")).toHaveLength(0);
      expect(wrapper.find("li.SuggestionList__item")).toHaveLength(2);
      expect(wrapper).toMatchSnapshot();
    });

    it("with active suggestions", () => {
      const wrapper = shallow(
        <SuggestionList suggestions={["Foo", "Bar"]} active={1} />
      );
      expect(wrapper.find("LoadingSpinner")).toHaveLength(0);
      expect(wrapper.find(".SuggestionList__item")).toHaveLength(1);
      expect(wrapper.find(".SuggestionList__item--active")).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });

    it("with active and selected suggestions", () => {
      const wrapper = shallow(
        <SuggestionList
          suggestions={["Foo", "Bar"]}
          active={1}
          selected={"Foo"}
        />
      );
      expect(wrapper.find("LoadingSpinner")).toHaveLength(0);
      expect(wrapper.find(".SuggestionList__item")).toHaveLength(0);
      expect(wrapper.find(".SuggestionList__item--active")).toHaveLength(1);
      expect(wrapper.find(".SuggestionList__item--selected")).toHaveLength(1);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe("onClickSuggestion", () => {
    it("prevent default click behavior before calling change", () => {
      const mockedOnSelect = jest.fn();
      const mockedEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
      };
      const wrapper = shallow(
        <SuggestionList
          suggestions={["Foo", "Bar"]}
          onSelect={mockedOnSelect}
        />
      );

      wrapper.instance().onClickSuggestion("Bar")(mockedEvent);

      expect(mockedEvent.stopPropagation).toHaveBeenCalled();
      expect(mockedEvent.preventDefault).toHaveBeenCalled();
      expect(mockedOnSelect).toHaveBeenCalledWith("Bar");
    });
  });
});
