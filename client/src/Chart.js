import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';

/**
 * Adds a bordercolor to each entry in the dataset. Datasets have to be in react-chartjs-2 format.
 * @param {Array} dataset 
 */
const colorize = (dataset) => {
    const colorPool = ["red", "green", "blue", "yellow", "black", "purple", "grey", "orange"]
    let colors = colorPool.slice()

    for(let entry of dataset){
        if(colors.length === 0) colors = colorPool.slice()
        //console.log(colors)
        entry.borderColor = colors.pop()
    }
}

class Chart extends Component {

    render(){
        let datasets = this.props.datasets || [{
            label: "There was a problem loading data",
            backgroundColor: 'rgba(0, 0, 0, 0)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }];
        const labels = this.props.labels || ["January", "February", "March", "April", "May", "June", "July"]

        colorize(datasets)
        
        return( 
            <Line data= {{ 
                labels: labels,
                datasets: datasets
                
            }}
            options={{
                maintainAspectRatio: false,
                legend: {
                    // Make sure data can't be hidden
                    onClick: function(event, legendItem) {}
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'CO2 emissions (kt)'
                        },
                        ticks: {
                            beginAtZero:true,
                            userCallback: function(value, index, values) {
                                return value.toLocaleString('en-US');
                            }
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                        display: true,
                        labelString: 'Year'
                        }
                    }]
                }
                
            }}
             />
        );
    }
}  

export default Chart