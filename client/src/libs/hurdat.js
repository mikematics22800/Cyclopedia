const options = {
  method: 'GET',
  headers: {
    'Content-Type' : 'application/json'
  }
}

export const getHurdat = async (basin, year) => {
  try {
    const response = await fetch(`https://cyclopedia.onrender.com/${basin}/${year}`, options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getLiveHurdat = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=cycloData&subqry=trackByDate&stormdate=0&type=SH&fmt=GEOJSON', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getForecastCone = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=cycloData&subqry=coneByDate&stormdate=0&type=SH&fmt=GEOJSON', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getWindField = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=cycloData&subqry=windfield&stormdate=0&type=SH&fmt=GEOJSON', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getWindFieldForecast = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=cycloData&subqry=forecastRadiiByDate&stormdate=0&type=SH&fmt=GEOJSON', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getAreasOfInterest = async () => {
  try {
    const response = await fetch('https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather_summary/MapServer/3/query?where=1%3D1&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=-160%2C50%2C-10%2C0&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getPointsOfInterest = async () => {
  try {
    const response = await fetch('https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather_summary/MapServer/2/query?where=1%3D1&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=-160%2C50%2C-10%2C0&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson', options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
} 