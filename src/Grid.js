import React from "react";
import objectAssign from 'object-assign';
import Radium from 'radium';
import _ from 'lodash';

let styles = {
  grid: {
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  col: {
    display: 'flex',
    flexDirection: 'column'
  }
};

export class Grid extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div style={[styles.grid, styles.col, this.props.style]}>
        {this.props.children}
      </div>
    );
  }
}
Grid = Radium(Grid);

export class Row extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div style={[styles.row, this.props.style, this.props.fullHeight && {
        flex: 1
      }]}>
        {this.props.children}
      </div>
    );
  }
}
Row = Radium(Row);

export class Col extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let style = this.props.style;
    let other = _.omit(this.props, 'style');
    return (
      <div style={[styles.col, style]} {...other}>
        {this.props.children}
      </div>
    );
  }
}

Col = Radium(Col);
