import React from "react";
import PropTypes from "prop-types";
import { Parser, Node } from "../utils";

import "./completion_input.css";

import SuggestionList from "../SuggestionList";
import { COMMANDS, DELAY, STEPS } from "../constants";

export default class CompletionInput extends React.Component {
  static Parser = Parser;
  static Node = Node;

  static propTypes = {
    syntax: PropTypes.string.isRequired,
    value: PropTypes.string,
    delay: PropTypes.number,
    onChange: PropTypes.func,
    fetchSuggestions: PropTypes.func.isRequired,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
    placeholder: PropTypes.string
  };

  static defaultProps = {
    className: "",
    delay: DELAY,
    value: ""
  };

  fetcher;
  parser;
  input;

  constructor(props) {
    super(props);

    this.input = null;
    this.fetcher = null;

    this.state = {
      suggestions: [],
      fetchingSuggestions: false,
      cursorPosition: props.value.length,
      focusingList: false,
      active: 0,
      showSuggestions: false,
      error: null,
      output: null
    };
  }

  componentDidMount() {
    this.setupParser();
  }

  // Helpers

  getValue = () => {
    return this.input ? this.input.value : this.props.value;
  };

  setupParser = async () => {
    this.parser = new CompletionInput.Parser(this.props.syntax);
    const output = this.getOutput(this.getValue());
    const error = this.checkForErrors(output);

    this.setState({
      currentNode: output,
      output,
      error
    });
  };

  checkForErrors = output => {
    if (output.errors && output.errors.length) {
      return output.errors[0].message;
    }
    return null;
  };

  debounce = async action => {
    clearTimeout(this.fetcher);
    this.fetcher = setTimeout(action, this.props.delay);
  };

  getOutput = sentence => {
    const shouldUpdateOutput =
      !this.state.output || sentence !== this.state.output.text;
    const output = shouldUpdateOutput
      ? this.parser.parse(sentence)
      : this.state.output;
    return output;
  };

  getInputCursorPosition = () =>
    isFinite(this.input.selectionStart)
      ? this.input.selectionStart
      : this.getValue().length;

  checkReferences = async (silent = false) => {
    const sentence = this.getValue();
    const cursorPosition = this.getInputCursorPosition();
    const changedCursor = cursorPosition !== this.state.cursorPosition;
    const shouldUpdateOutput =
      !this.state.output ||
      sentence !== `${this.state.output.text}${this.state.output.rest}`;

    if (changedCursor || shouldUpdateOutput) {
      if (!silent) {
        this.setState({
          loading: true
        });
      }
      return this.debounce(() => this.updateReferences(silent));
    }
  };

  updateReferences = (silent = false) => {
    const output = this.getOutput(this.getValue());
    const error = this.checkForErrors(output);
    const cursorPosition = this.getInputCursorPosition();

    const currentNode = error
      ? output
      : output.findChildByPosition(cursorPosition);

    this.setState({
      cursorPosition,
      output,
      error,
      currentNode,
      showSuggestions: silent || error ? false : this.state.showSuggestions,
      active: 0
    });

    if (!silent && !error) this.checkForSuggestions(currentNode);
  };

  sortSuggestions = suggestions => {
    const { text } = this.state.currentNode;

    if (!suggestions || suggestions.length === 0) return [];
    if (!text) return suggestions;

    var results = suggestions.reduce(
      function(res, suggestion) {
        var pos = suggestion.toLowerCase().indexOf(text.toLowerCase());
        if (pos === 0) {
          res[0].push(suggestion);
        } else if (pos > 0) {
          res[1].push(suggestion);
        } else {
          res[2].push(suggestion);
        }
        return res;
      },
      [[], [], []]
    );
    return [...results[0], ...results[1], ...results[2]];
  };

  checkForSuggestions = async (currentNode = this.state.currentNode) => {
    this.setState({
      error: null,
      showSuggestions: true,
      fetchingSuggestions: true
    });

    const promise = this.props.fetchSuggestions(currentNode);

    promise
      .then((suggestions = []) => {
        this.setState({
          suggestions: this.sortSuggestions(suggestions),
          fetchingSuggestions: false
        });
      })
      .catch(error => {
        this.setState({
          error,
          suggestions: [],
          showSuggestions: false,
          fetchingSuggestions: false
        });
      });

    return promise;
  };

  navigateDown = () => {
    const { active } = this.state;
    const lastPosition = this.state.suggestions.length - 1;
    return active === lastPosition ? active : active + STEPS;
  };

  navigateUp = () => {
    const { active } = this.state;
    return active === 0 ? active : active - STEPS;
  };

  // Handlers

  onMouseEnterList = () => {
    this.setState({
      focusingList: true
    });
  };

  onMouseLeaveList = () => {
    this.setState({
      focusingList: false
    });
  };

  onClose = () => {
    clearTimeout(this.fetcher);

    this.setState({
      fetchingSuggestions: false,
      showSuggestions: false,
      suggestions: [],
      active: 0
    });
  };

  onPressEnter = () => {
    const selected = this.state.suggestions[this.state.active];
    if (typeof selected !== "undefined") this.onSelect(selected);
  };

  onNavigate = e => {
    const active =
      e.key === COMMANDS.DOWN ? this.navigateDown() : this.navigateUp();

    this.setState({ active });
    e.stopPropagation();
    e.preventDefault();
  };

  onChange = () => {
    this.debounce(this.checkReferences);
    if (this.props.onChange) this.props.onChange(this.getValue());
  };

  onKeyUp = e => {
    switch (e.key) {
      case COMMANDS.LEFT:
      case COMMANDS.RIGHT:
        this.checkReferences();
        break;
      case COMMANDS.UP:
      case COMMANDS.DOWN:
        this.onNavigate(e);
        break;
      case COMMANDS.ENTER:
        this.onPressEnter();
        break;
      case COMMANDS.ESC:
        this.onClose();
        break;
      default:
        break;
    }
  };

  onMouseUp = e => {
    if (e.target === this.input) this.checkReferences();
  };

  onBlur = () => {
    if (!this.state.focusingList) this.onClose();
  };

  onSelect = (newValue = "") => {
    const sentence = this.getValue();
    const node = this.state.currentNode;
    const newSentence =
      "" +
      sentence.substring(0, node.start) +
      newValue +
      sentence.substring(node.end, sentence.length);

    const newSelectionStart = node.start + String(newValue).length;

    this.input.value = newSentence;

    this.input.focus();
    this.input.setSelectionRange(newSelectionStart, newSelectionStart);
    this.onClose();

    if (this.props.onChange) this.props.onChange(newSentence);
  };

  // Renders

  renderSuggestions = () => {
    const { suggestions, showSuggestions } = this.state;

    if (!showSuggestions) {
      return;
    }

    return (
      <SuggestionList
        suggestions={suggestions}
        loading={this.state.fetchingSuggestions}
        active={this.state.active}
        selected={this.state.currentNode ? this.state.currentNode.text : null}
        onSelect={this.onSelect}
        onMouseEnter={this.onMouseEnterList}
        onMouseLeave={this.onMouseLeaveList}
      />
    );
  };

  renderErrors = () => {
    if (this.state.error) {
      return <div className="CompletionInput__error">{this.state.error}</div>;
    }
    return;
  };

  render() {
    const {
      onChange, // eslint-disable-line no-unused-vars
      syntax, // eslint-disable-line no-unused-vars
      fetchSuggestions, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    return (
      <div className="CompletionInput">
        <input
          {...props}
          className={
            this.props.className +
            " CompletionInput__input" +
            (this.state.error ? "--error" : "")
          }
          ref={node => {
            this.input = node;
          }}
          readOnly={!this.parser || this.props.readOnly}
          placeholder={
            !this.parser ? "Parsing syntax..." : this.props.placeholder
          }
          onBlur={this.onBlur}
          onMouseUp={this.onMouseUp}
          onKeyUp={this.onKeyUp}
          onChange={this.onChange}
        />
        {this.renderErrors()}
        {this.renderSuggestions()}
      </div>
    );
  }
}
