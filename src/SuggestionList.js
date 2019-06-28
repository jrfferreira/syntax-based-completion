import React from "react";
import PropTypes from "prop-types";

import LoadingSpinner from "./LoadingSpinner";

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

  render() {
    return (
      <ul
        className="query-suggestion-list"
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        {this.props.loading ? (
          <div className="query-suggestion-loading">
            <LoadingSpinner />
          </div>
        ) : (
          this.props.suggestions.map((suggestion, index) => {
            const active = index === this.props.active;
            const selected = suggestion === this.props.selected;
            return (
              <li
                key={suggestion}
                className={`query-suggestion-item ${active ? "active" : ""} ${
                  selected ? "selected" : ""
                }`}
                onClick={this.onClickSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            );
          })
        )}
      </ul>
    );
  }
}
