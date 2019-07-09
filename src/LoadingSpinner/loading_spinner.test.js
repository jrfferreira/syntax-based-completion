import React from "react";
import { shallow } from "enzyme";

import LoadingSpinner from "./loading_spinner";

describe("<LoadingSpinner/>", () => {
  it("shallow render", () => {
    const wrapper = shallow(<LoadingSpinner />);
    expect(wrapper.hasClass("lds-ellipsis"));
    expect(wrapper).toMatchSnapshot();
  });
});
