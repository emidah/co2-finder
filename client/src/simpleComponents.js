import React from 'react';

const Footer = (props) => (
    <div>
      <p>This website uses <a href="https://data.worldbank.org/">World Bank</a> <a href="https://data.worldbank.org/indicator/EN.ATM.CO2E.KT">CO2 emissions</a> and <a href="https://data.worldbank.org/indicator/SP.POP.TOTL">population</a> data under the <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons 4.0 International license.</a></p>
    </div>
  )
  
  const Tops = (props) => {
    let counter = 1;
    return props.top5.map(item => (
        <tr key={item.label}>
            <td>{counter++}. </td> 
            <td>{item.label}</td>
            <td>{parseFloat(item.emissions).toLocaleString('en-US')}</td> 
        </tr>));
}

const Top5 = (props) => (
    <div>
        <h3>Top 5 total (kt, {props.top5[0].year})</h3>
        <table><tbody>
            <Tops top5={props.top5} />
        </tbody></table>
    </div>);

const Top5PerCapita = (props) => (
    <div>
        <h3>Top 5 per capita (kt, {props.top5[0].year})</h3>
        <table><tbody><Tops top5={props.top5} /></tbody></table>
    </div>
);


const Options = (props) => (
<div>
    <h3>Options</h3>
    <label>
    <input type="checkbox" onChange={props.onPerCapitaChanged}/>
    &nbsp;Per capita
    </label>
</div>
)  

export {Footer, Top5, Options, Top5PerCapita}