export class Node {
  constructor(props = {}) {
    this.type = props.type; // string;
    this.text = props.text; // string;
    this.start = props.start; // number;
    this.end = props.end; // number;
    this.parent = props.parent; // IToken;
    this.fullText = props.fullText; // string;
    this.errors = props.errors || []; // TokenError[];
    this.rest = props.rest; // string;
    this.fragment = props.fragment; // boolean;
    this.lookup = props.lookup; // boolean;
    this.children = props.children || []; // IToken[];
  }

  findChildByPosition = pos => {
    if (this.children && this.children.length) {
      let focusedChild = this.children.find(c => {
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
      let matchingChild = this.children.find(c => {
        return c.type === type;
      });

      if (matchingChild) {
        return new Node(matchingChild);
      } else {
        for (let childIndex in this.children) {
          let searchResult = new Node(
            this.children[childIndex]
          ).findChildByType(type);
          if (searchResult) return searchResult;
        }
      }
    }
    return false;
  };

  findParentByType = type => {
    if (this.parent) {
      let parent = this.parent;
      if (!!parent) {
        if (parent.type === type) {
          return new Node(parent);
        } else {
          return new Node(parent).findParentByType(type);
        }
      }
    }
    return this;
  };
}
