import React, { useState, useEffect } from 'react';

import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@material-ui/core';
import './App.css';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import { prettyPrintStat, sortData } from './utl';
import LineGraph from './components/LineGraph';

import 'leaflet/dist/leaflet.css';

const App = () => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  // useEffect for the worldwide
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // useEffect for the dropdown
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data
            .map((country) => ({
              name: country.country, //full country name
              value: country.countryInfo.iso2, //country code like USA UK
            }))
            .filter((country) => country.value !== null);

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // console.log('YOOOOOOO', countryCode);
    setCountry(countryCode);

    //
    const url =
      countryCode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        // All the data from the country
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  console.log('COUNTRY INFO', countryInfo);

  return (
    /* Header */
    /* Title + select dropdown field */
    <div className='app'>
      <div className='app__left'>
        <div className='app__header'>
          <h1>COVID-19 TRACKER</h1>
          <FormControl className='app__dropdown'>
            <Select
              variant='outlined'
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {/* Loop through all the couties and show a drop down list of the options */}
              {countries.map((country) => {
                return (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>

        {/* 3 Info boxes => coronavirus cases, recoveries, deaths*/}

        <div className='app__stats'>
          <InfoBox
            isRed
            onClick={(e) => setCasesType('cases')}
            title='Coronavirus Cases'
            active={casesType === 'cases'}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            isGreen
            onClick={(e) => setCasesType('recovered')}
            title='Recovered'
            active={casesType === 'recovered'}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            onClick={(e) => setCasesType('deaths')}
            title='Deaths'
            active={casesType === 'deaths'}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        {/* Map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className='app__right'>
        <CardContent>
          <h3>Live cases by Country</h3>
          {/* Tables */}
          <Table countries={tableData} />
          <h3 className='app__title'>Worldwide new {casesType}</h3>
          {/* Graph */}
          <LineGraph casesType={casesType} className='app__graph' />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
