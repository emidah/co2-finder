import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';

const colorize = (dataset) => {
    const colorPool = ["red", "green", "blue", "yellow", "black", "purple", "grey", "orange"]
    let colors = colorPool.slice()
    for(let entry of dataset){
        if(colors.length === 0) colors = colorPool.slice()
        console.log(colors)
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
                legend: {
                    // Make sure data can't be hidden
                    onClick: function(event, legendItem) {}
                },
                scales: {
                    yAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: 'CO2 emissions (megatons)'
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