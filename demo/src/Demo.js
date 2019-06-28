import React from "react";
import "./Demo.css";

import SuggestionInput from "../../src/SuggestionInput";

const SYNTAX = `
<SYNTAX>           ::= <query>
<query>            ::= <element> <SEPARATOR> <query> | <element>
<SEPARATOR>        ::= ',' ' ' | ','
<element>          ::=  <repetition> "|" <element> | <repetition>
<repetition>       ::= <simple> <repeat_operator> | <simple>
<repeat_operator>  ::= "+" | "*" | "?"
<simple>           ::= <event> | <group>
<group>            ::= "(" <element> ")"
<event>            ::= <event_name> ":" <screen_name> <prop_list_scope> | <event_name> ":" <screen_name> | <event_name> ":" | <event_name> <prop_list_scope> | <event_name>
<event_name>       ::= <DIGITS> | <any> | ""
<screen_name>      ::= <DIGITS> | ""
<prop_list_scope>  ::= "{" <prop_list> "}" | "{" <prop_list> | "{" "}" | "{"
<prop_list>        ::= <prop_tuple> "," <prop_list> | <prop_tuple>
<prop_tuple>       ::= <prop_name> "=" <prop_val> | <prop_name> "=" | <prop_name>
<prop_name>        ::= <DIGITS> | ""
<prop_val>         ::= <DIGITS> | ""
<DIGIT>            ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
<DIGITS>           ::= <DIGIT> <DIGITS> | <DIGIT>
<any>              ::= "."
`;

const EQUATION_SENTENCE = "19,.+,18|16:10{1=2}";

const SUGGESTIONS = {
  event_name: ["1", "2", "3", "4", "5"],
  screen_name: ["51", "52", "53", "54"],
  prop_val: {
    "1": ["10", "11", "12"],
    "2": ["23", "24", "25"],
    "3": ["36", "37", "38"]
  },
  prop_name: ["1", "2", "3"]
};

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sentence: EQUATION_SENTENCE
    };
  }

  onChange = field => (val, currentNode) => {
    this.setState({
      currentNode,
      [field]: val
    });
  };

  fetchSuggestions = node => {
    this.setState({
      currentNode: node
    });

    console.log(node);
    const { type } = node;
    return new Promise((resolve, _) => {
      let response;
      if ("prop_val" === type) {
        const prop = node
          .findParentByType("prop_tuple")
          .findChildByType("prop_name").text;
        if (prop) response = SUGGESTIONS.prop_val[prop];
      } else {
        response = SUGGESTIONS[type];
      }

      setTimeout(() => resolve(response), 1000);
    });
  };

  render() {
    return (
      <div className="Demo">
        <link
          href="https://fonts.googleapis.com/css?family=Raleway&display=swap"
          rel="stylesheet"
        />
        <h1>Syntax based completion</h1>
        <section>
          <label>Try it:</label>
          {this.state.currentNode && (
            <pre className="Demo-pre">
              node: <mark>{this.state.currentNode.type}</mark>, value:{" "}
              <mark>{this.state.currentNode.text}</mark>
            </pre>
          )}
          <br />
          <SuggestionInput
            className="Demo-input"
            placeholder="Start typing a number..."
            syntax={SYNTAX}
            value={this.state.sentence}
            onChange={this.onChange("sentence")}
            fetchSuggestions={this.fetchSuggestions}
          />
        </section>
      </div>
    );
  }
}

export default Demo;
