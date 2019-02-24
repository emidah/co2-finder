import axios from 'axios';
import {
  dataFetcher, countryFetcher, pullToData, getYearLabels,
} from './data';

jest.mock('axios');

it('pullToData loads countries correctly, and the data is valid', () => {
  const countriesToTestWith = [
    { label: 'World', value: 'WLD' },
    { label: 'random string', value: 'FIN' },
  ];

  const resp = { data: { 'Country Name': 'Name', 'Country Code': 'NME', 1960: '0' } };
  axios.get.mockImplementation(() => Promise.resolve(resp));

  const test1 = pullToData('/api/co2/countries', countriesToTestWith).then((pulled) => {
    expect(pulled.length).toBe(countriesToTestWith.length);
    pulled.forEach((country) => {
      expect('1960' in country).toBe(true);
      expect('Country Name' in country).toBe(true);
      expect('Country Code' in country).toBe(true);
    });
  });

  const test2 = pullToData('/api/pop/countries', [
    { label: 'World', value: 'WLD' },
    { label: 'random string', value: 'FIN' },
  ]).then((pulled) => {
    expect(pulled.length).toBe(2);
    pulled.forEach((country) => {
      expect('1960' in country).toBe(true);
      expect('Country Name' in country).toBe(true);
      expect('Country Code' in country).toBe(true);
    });
  });

  return Promise.all([test1, test2]);
});

it('countryFetcher works correctly, and the data is valid', () => {
  const resp = { data: [{ label: 'Name', value: 'NME' }, { label: 'Name', value: 'NME' }] };
  axios.get.mockImplementation(() => Promise.resolve(resp));

  return countryFetcher().then((result) => {
    expect(result.length > 1).toBe(true);

    result.forEach((entry) => {
      expect('value' in entry).toBe(true);
      expect('label' in entry).toBe(true);
    });
  });
});

it('dataFetcher works correctly, and the data is valid', () => {
  const countriesToTestWith = [
    { label: 'World', value: 'WLD' },
    { label: 'random string', value: 'FIN' },
  ];

  const resp = { data: { 'Country Name': 'Name', 'Country Code': 'NME', 1960: '0' } };
  axios.get.mockImplementation(() => Promise.resolve(resp));

  return dataFetcher(countriesToTestWith).then((result) => {
    expect(result.data.length).toBe(countriesToTestWith.length);
    result.data.forEach((item) => {
      expect(item.label.length > 0).toBe(true);
      expect(item.data.length > 0).toBe(true);
    });
    result.dataPerCapita.forEach((item) => {
      expect(item.label.length > 0).toBe(true);
      expect(item.data.length > 0).toBe(true);
    });
  });
});

it('getYearLabels works correctly', () => {
  const data1 = [{}];
  const data2 = [{}];
  for (let i = 1960; i < 2050; i += 1) {
    data1[0][i] = '0';
    data2[0][i] = '0';
  }
  const labels = getYearLabels(data1, data2);
  expect(labels.length).toBe(2050 - 1960);
});
