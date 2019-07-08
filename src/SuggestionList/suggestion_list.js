import React from "react";
import PropTypes from "prop-types";

import "./suggestion_list.css";

import LoadingSpinner from "../LoadingSpinner";

export default class SuggestionList extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    suggestions: PropTypes.array,
    active: PropTypes.number,
    selected: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func
  };

  static defaultProps = {
    suggestions: []
  };

  onClickSuggestion = suggestion => e => {
    e.stopPropagation();
    e.preventDefault();
    this.props.onSelect(suggestion);
  };

  renderSuggestion = (suggestion, index) => {
    let active = index === this.props.active;
    let selected = suggestion === this.props.selected;
    let itemClassName = `SuggestionList__item${
      active ? "--active" : selected ? "--selected" : ""
    }`;
    return (
      <li
        key={suggestion}
        className={itemClassName}
        onClick={this.onClickSuggestion(suggestion)}
      >
        {suggestion}
      </li>
    );
  };

  render() {
    return (
      <ul
        className="SuggestionList"
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        {this.props.loading ? (
          <div className="SuggestionList__loading">
            <LoadingSpinner />
          </div>
        ) : (
          this.props.suggestions.map(this.renderSuggestion)
        )}
      </ul>
    );
  }
}
