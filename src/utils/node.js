export class Node {
  constructor(props) {
    this.type = props.type; // string;
    this.text = props.text; // string;
    this.start = props.start; // number;
    this.end = props.end; // number;
    this.parent = props.parent; // IToken;
    this.fullText = props.fullText; // string;
    this.errors = props.errors; // TokenError[];
    this.rest = props.rest; // string;
    this.fragment = props.fragment; // boolean;
    this.lookup = props.lookup; // boolean;
    this.children = props.children || []; // IToken[];
  }

  //get children() {
  //  return this._children.map(c => new Node(c));
  //}

  findChildByPosition = pos => {
    if (this.children && this.children.length) {
      const focusedChild = this.children.find(c => {
        return pos >= c.start && pos <= c.end;
      });

      if (focusedChild) {
        return new Node(focusedChild).findChildByPosition(pos);
      }
    }
    return this;
  };

  findChildByType = type => {
    if (this.children && this.children.length) {
      const matchingChild = this.children.find(c => {
        return c.type === type;
      });

      if (matchingChild) {
        return new Node(matchingChild);
      } else {
        for (let child in this.children) {
          const searchResult = new Node(child).findChildByType(type);
          if (searchResult) return searchResult;
        }
      }
    }
    return false;
  };

  findParentByType = type => {
    if (this.parent) {
      const parent = this.parent;
      if (parent.type === type) {
        return new Node(parent);
      } else if (parent) {
        return new Node(parent).findParentByType(type);
      }
    }
    return this;
  };
}
