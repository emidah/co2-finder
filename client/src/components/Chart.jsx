import React from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

/**
 * Adds a bordercolor to each entry in the dataset. Datasets have to be in react-chartjs-2 format.
 * @param {Array} dataset
 */
const colorize = (dataset) => {
  const colorPool = ['red', 'green', 'blue', 'yellow', 'black', 'purple', 'grey', 'orange'];
  let colors = colorPool.slice();

  const newDataset = [];
  dataset.forEach((entry) => {
    if (colors.length === 0) colors = colorPool.slice();
    // console.log(colors)
    newDataset.push(entry);
    newDataset[newDataset.length - 1].borderColor = colors.pop();
  });

  return newDataset;
};

const Chart = (props) => {
  const { labels } = props;
  let { datasets } = props;

  datasets = colorize(datasets);

  return (
    <Line
      data={{
        labels,
        datasets,
      }}
      options={{
        maintainAspectRatio: false,
        legend: {
          // Make sure data can't be hidden
          onClick: () => {},
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'CO2 emissions (kt)',
            },
            ticks: {
              beginAtZero: true,
              userCallback: value => value.toLocaleString('en-US'),
            },
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Year',
            },
          }],
        },
      }}
    />
  );
};

Chart.propTypes = {
  datasets: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.any),
  })),
  labels: PropTypes.arrayOf(PropTypes.string),
};

Chart.defaultProps = {
  datasets: [{
    label: 'There was a problem loading data',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    data: [0, 10, 5, 2, 20, 30, 45],
  }],
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
};

export { Chart, colorize };
