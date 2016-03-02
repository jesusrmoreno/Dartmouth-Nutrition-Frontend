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

let fontWeights = {
  medium: '500',
  regular: '400',
  bold: '700',
  light: '300'
};

let fontStyles = {
  display4: {
    fontSize: '11.2rem',
    fontWeight: fontWeights.light,
  },
  display3: {
    fontSize: '5.6rem',
    fontWeight: fontWeights.regular,
  },
  display2: {
    fontSize: '4.5rem',
    fontWeight: fontWeights.regular,
  },
  display1: {
    fontSize: '3.4rem',
    fontWeight: fontWeights.regular,
  },
  headline: {
    fontSize: '2.4rem',
    fontWeight: fontWeights.regular,
  },
  title: {
    fontSize: '2.0rem',
    fontWeight: fontWeights.medium,
  },
  subheading: {
    fontSize: '1.5rem',
    fontWeight: fontWeights.regular,
  },
  body2: {
    fontSize: '1.3rem',
    fontWeight: fontWeights.medium,
  },
  body1: {
    fontSize: '1.3rem',
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: '1.2rem',
    fontWeight: fontWeights.regular,
  },
  button: {
    fontSize: '1.4rem',
    fontWeight: fontWeights.medium,
    textTransform: 'uppercase'
  },
};

export class Text extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let style = this.props.style;
    let type = this.props.type;
    let other = _.omit(this.props, 'style');
    if (fontStyles[type] === undefined && type !== undefined) {
      console.warn(type, 'font does not exist, using body1');
    }
    let textStyle = fontStyles[type] || fontStyles['body1'];

    return (
      <span style={[textStyle, style]} {...other}>{this.props.children}</span>
    )
  }
}
Text = Radium(Text);



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
    let style = this.props.style;
    let other = _.omit(this.props, 'style');
    return (
      <div style={[styles.row, style]} {...other}>
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
