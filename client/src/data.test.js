import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import renderer from 'react-test-renderer';
import {dataFetcher, countryFetcher, pullToData} from './data'

const countriesToTestWith = [
    {label: "World", value: "WLD"},
    {label: "random string", value: "FIN"}
]

it('pullToData loads countries correctly, and the data is valid', () => {
    pullToData('/api/co2/', countriesToTestWith).then((pulled) => {
        expect(pulled.length).toBe(countriesToTestWith.length)
        for (let country of pulled){
          expect('1960' in country).toBe(true)
          expect('Country Name' in country).toBe(true)
          expect('Country Code' in country).toBe(true)
        }
      });
  
    pullToData('/api/pop/', [
      {label: "World", value: "WLD"},
      {label: "random string", value: "FIN"}
    ]).then((pulled) => {
        expect(pulled.length).toBe(2)
        for (let country of pulled){
          expect('1960' in country).toBe(true)
          expect('Country Name' in country).toBe(true)
          expect('Country Code' in country).toBe(true)
        }
      });
  });

it('countryFetcher works correctly, and the data is valid', () => {
    countryFetcher().then((result) => {
        expect(result.length > 50).toBe(true)
        
        for(let entry in result){
            expect('value' in entry).toBe(true)
            expect('label' in entry).toBe(true)
        }
    })
})

it('dataFetcher works correctly, and the data is valid', () => {
    dataFetcher(countriesToTestWith).then( (result) => {
        expect(result.length).toBe(countriesToTestWith.length)
        for(let item in results.data){
            expect(results.label.length > 0).toBe(true)
            expect(results.data.data.length > 10).toBe(true)
            expect(results.dataPerCapita.data.length > 10).toBe(true)
        }
    })
})