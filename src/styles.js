let fontSizes = {
  display4: '11.2rem',
  display3: '5.6rem',
  display2: '4.5rem',
  display1: '3.4rem',
  headline: '2.4rem',
  title: '2.0rem',
  subheading: '1.5rem',
  body2: '1.3rem',
  body1: '1.3rem',
  caption: '1.2rem',
  button: '1.4rem',
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


let animated = {
  transition: '250ms all'
};

module.exports = {
  fontStyles: fontStyles,
  animated: animated,
};
