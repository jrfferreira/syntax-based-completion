import React from "react";
import "./Demo.css";

import SuggestionInput from "../../src/";

const REPO_URL = "https://github.com/jrfferreira/syntax-based-completion";

const SYNTAX = `
<SYNTAX>           ::= <composition>
<composition>      ::= <word> <BREAK> <composition> | <word> <BREAK> | <word>
<word>             ::= <CHARS> | <assignee> | <tag>
<assignee>         ::= "@" <CHARS> | "@"
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

export const EXAMPLE = "Tell @john to play #with-the-beatles";

export const SUGGESTIONS = {
  assignee: ["@john", "@paul", "@george", "@ringo"],
  tag: [
    "#please-please-me",
    "#with-the-beatles",
    "#a-hard-days-night",
    "#beatles-for-sale",
    "#help",
    "#rubber-soul",
    "#revolver",
    "#sgt-peppers-lonely-hearts-club-band",
    "#magical-mystery-tour",
    "#the-beatles",
    "#the-white-album",
    "#yellow-submarine",
    "#abbey-road",
    "#let-it-be"
  ]
};

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sentence: EXAMPLE
    };
  }

  onChange = (sentence, currentNode) => {
    this.setState({
      currentNode,
      sentence
    });
  };

  fetchSuggestions = node => {
    this.setState({
      currentNode: node
    });

    const { type } = node;
    return new Promise((resolve, _) => {
      let response = SUGGESTIONS[type] || [];
      resolve(response);
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
          <pre className="Demo-pre">
            {this.state.currentNode ? (
              <React.Fragment>
                node: <mark>{this.state.currentNode.type}</mark>, value:{" "}
                <mark>{this.state.currentNode.text}</mark>
              </React.Fragment>
            ) : (
              <React.Fragment>
                Use <mark>{"#<tag>"}</mark> or <mark>{"@<assignee>"}</mark> to
                retrieve a list of suggestions.
              </React.Fragment>
            )}
          </pre>
          <br />
          <SuggestionInput
            className="Demo-input"
            placeholder="Start typing..."
            syntax={SYNTAX}
            value={this.state.sentence}
            onChange={this.onChange}
            fetchSuggestions={this.fetchSuggestions}
          />
          <br />
        </section>
        <section>
          <h2>Syntax definition:</h2>
          <pre className="Demo-syntax">{SYNTAX}</pre>
        </section>
        <section>
          <h2>Suggestion fetcher:</h2>
          <pre className="Demo-syntax">
            {`
const SUGGESTIONS = {
  assignee: ["@john", "@paul", "@george", "@ringo"],
  tag: [
    "#please-please-me",
    "#with-the-beatles",
    "#a-hard-days-night",
    "#beatles-for-sale",
    "#help",
    "#rubber-soul",
    "#revolver",
    "#sgt-peppers-lonely-hearts-club-band",
    "#magical-mystery-tour",
    "#the-beatles",
    "#the-white-album",
    "#yellow-submarine",
    "#abbey-road",
    "#let-it-be"
  ]
};

fetchSuggestions = node => {
    const { type } = node;
    return new Promise((resolve, _) => {
      let response = SUGGESTIONS[type] || [];
      resolve(response);
    });
  };
`}
          </pre>
        </section>
        <footer>
          <a href={REPO_URL} title="Github repository">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <path
                d="M16 0c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16-7.16-16-16-16zM25.5 25.5c-1.24 1.24-2.67 2.2-4.27 2.88-0.41 0.17-0.82 0.32-1.24 0.45v-2.4c0-1.26-0.43-2.19-1.3-2.78 0.54-0.05 1.04-0.12 1.49-0.22s0.93-0.23 1.44-0.41 0.96-0.39 1.36-0.63 0.79-0.56 1.16-0.95 0.68-0.83 0.93-1.33 0.45-1.09 0.59-1.78 0.22-1.46 0.22-2.29c0-1.61-0.53-2.99-1.58-4.12 0.48-1.25 0.43-2.61-0.16-4.08l-0.39-0.05c-0.27-0.03-0.76 0.08-1.46 0.34s-1.49 0.69-2.37 1.28c-1.24-0.34-2.53-0.52-3.86-0.52-1.34 0-2.62 0.17-3.84 0.52-0.55-0.37-1.07-0.68-1.57-0.93-0.49-0.24-0.89-0.41-1.19-0.5s-0.57-0.14-0.83-0.16-0.42-0.03-0.49-0.02-0.12 0.02-0.16 0.03c-0.58 1.48-0.63 2.84-0.16 4.08-1.05 1.14-1.58 2.51-1.58 4.13 0 0.83 0.07 1.6 0.22 2.29s0.34 1.29 0.59 1.78 0.56 0.94 0.93 1.33 0.76 0.71 1.16 0.95 0.85 0.46 1.36 0.63 0.98 0.31 1.44 0.41 0.95 0.17 1.49 0.22c-0.85 0.58-1.28 1.51-1.28 2.78v2.44c-0.47-0.14-0.94-0.31-1.39-0.5-1.6-0.68-3.04-1.65-4.27-2.88-1.24-1.24-2.2-2.67-2.88-4.27-0.7-1.65-1.05-3.41-1.05-5.23s0.36-3.57 1.06-5.23c0.68-1.6 1.65-3.04 2.88-4.27s2.67-2.2 4.27-2.88c1.66-0.7 3.42-1.05 5.23-1.05s3.58 0.36 5.23 1.06c1.6 0.68 3.04 1.65 4.27 2.88 1.24 1.24 2.2 2.67 2.88 4.27 0.7 1.66 1.06 3.42 1.06 5.23s-0.35 3.58-1.05 5.23c-0.68 1.6-1.65 3.04-2.88 4.27z"
                fill="#fdfdfd"
              ></path>
            </svg>
          </a>
        </footer>
      </div>
    );
  }
}

export default Demo;
