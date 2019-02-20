import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import renderer from 'react-test-renderer';
import {Chart, colorize} from './Chart'
import Dropdown from './Dropdown';

const countriesToTestWith = [
  {label: "World", value: "WLD"},
  {label: "random string", value: "FIN"}
]

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('chart item colorization works correctly', () => {
  let datasets = [{
    label: "beep boop",
    backgroundColor: 'rgba(0, 0, 0, 0)',
    data: [0, 10, 5, 2, 20, 30, 45],
  },
  {
    label: "beep boop 2",
    backgroundColor: 'rgba(0, 0, 0, 0)',
    data: [0, 10, 5, 2, 20, 30, 45],
  },
  {
    label: "beep boop 3",
    backgroundColor: 'rgba(0, 0, 0, 0)',
    data: [0, 10, 5, 2, 20, 30, 45],
  }];

  colorize(datasets)
  for(let dataset of datasets){
    expect('borderColor' in dataset).toBe(true)
  }
});

it('dropdown works corectly', () => {
  const component = renderer.create(
    <Dropdown options={countriesToTestWith} 
    maxValues={5} />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});