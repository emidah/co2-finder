import React from 'react';

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

export default Footer;
