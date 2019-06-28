import React from "react";
import "./LoadingSpinner.css";

export default class LoadingSpinner extends React.PureComponent {
  render() {
    return (
      <div className="lds-ellipsis">
        <div />
        <div />
        <div />
        <div />
      </div>
    );
  }
}
