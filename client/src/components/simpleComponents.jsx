import React from 'react';
import PropTypes from 'prop-types';

const Footer = () => (
  <div>
    <p>
      {'This website uses '}
      <a href="https://data.worldbank.org/">World Bank</a>
      {' '}
      <a href="https://data.worldbank.org/indicator/EN.ATM.CO2E.KT">CO2 emissions</a>
      {' and '}
      <a href="https://data.worldbank.org/indicator/SP.POP.TOTL">population</a>
      {' data under the '}
      <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons 4.0 International license.</a>
    </p>
  </div>
);

const Tops = (props) => {
  let counter = 0;
  return props.top5.map((item) => {
    counter += 1;
    return (
      <tr key={item.label}>
        <td>{counter}</td>
        <td>{item.label}</td>
        <td>{parseFloat(item.emissions).toLocaleString('en-US')}</td>
      </tr>
    );
  });
};

const Top5 = (props) => {
  const { title, top5, onButtonClicked } = props;
  return (
    <div>
      <h3>
        {title}
      </h3>
      <table>
        <tbody>
          <Tops top5={top5} />
        </tbody>
      </table>
      <button className="topButton" type="button" onClick={onButtonClicked}>Show</button>
    </div>
  );
};

Top5.propTypes = {
  top5: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequried,
    label: PropTypes.string.isRequried,
    emissions: PropTypes.string.isRequried,
    year: PropTypes.string.isRequried,
  })),
  title: PropTypes.string,
  onButtonClicked: PropTypes.func,
};

Top5.defaultProps = {
  top5: [],
  title: '',
  onButtonClicked: () => {},
};

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
  onPerCapitaChanged: () => {},
  isPerCapitaSelected: false,
};

export {
  Footer, Top5, Options,
};
