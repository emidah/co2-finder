import React from 'react';
import PropTypes from 'prop-types';

const Options = (props) => {
  const { onPerCapitaChanged, isPerCapitaSelected } = props;
  return (
    <div>
      <h3>Options</h3>
      <label htmlFor="perCapita" id="perCapitaLabel">
        <input id="perCapita" checked={isPerCapitaSelected} type="checkbox" onChange={onPerCapitaChanged} />
        &nbsp;Per capita
      </label>
    </div>
  );
};

Options.propTypes = {
  onPerCapitaChanged: PropTypes.func,
  isPerCapitaSelected: PropTypes.bool,
};

Options.defaultProps = {
  onPerCapitaChanged: () => { },
  isPerCapitaSelected: false,
};

export default Options;
