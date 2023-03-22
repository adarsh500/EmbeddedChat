import { ThemeProvider } from '@emotion/react';
import React from 'react';
import PropTypes from 'prop-types';

// defualt theme
const theme = {
  colors: {
    primary: 'hotpink',
  },
};

const ThemeContext = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default ThemeContext;

ThemeContext.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
