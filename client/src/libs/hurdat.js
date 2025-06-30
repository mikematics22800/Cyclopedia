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
    console.log(data.features)
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
    console.log(data.features)
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
    console.log(data.features)
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
    console.log(data.features)
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}
