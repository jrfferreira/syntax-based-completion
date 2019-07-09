import React from "react";
import ReactDOM from "react-dom";
import Demo, { EXAMPLE, SUGGESTIONS } from "./Demo";
import { shallow } from "enzyme";

describe("<Demo/>", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Demo />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it("updates value", () => {
    const newSentence = "new sentence";
    const wrapper = shallow(<Demo />);

    expect(wrapper.state("sentence")).toBe(EXAMPLE);
    wrapper.instance().onChange(newSentence, { test: true });
    expect(wrapper.state("sentence")).toBe(newSentence);
    expect(wrapper.state("currentNode")).toEqual({ test: true });
  });

  it("fetch suggestions", done => {
    const newSentence = "new sentence";
    const wrapper = shallow(<Demo />);
    const mockedNode = {
      type: "assignee",
      text: ""
    };

    wrapper
      .instance()
      .fetchSuggestions(mockedNode)
      .then(suggestions => {
        expect(suggestions).toEqual(SUGGESTIONS.assignee);
      })
      .then(done);
  });

  it("fetch empty suggestions list", done => {
    const newSentence = "new sentence";
    const wrapper = shallow(<Demo />);
    const mockedNode = {
      type: "word",
      text: ""
    };

    wrapper
      .instance()
      .fetchSuggestions(mockedNode)
      .then(suggestions => {
        expect(suggestions).toEqual([]);
      })
      .then(done);
  });
});
