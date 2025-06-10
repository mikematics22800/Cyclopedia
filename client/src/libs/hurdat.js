const options = {
  method: 'GET',
  headers: {
    'Content-Type' : 'application/json'
  }
}

export const getHurdat = async (basin, year) => {
  try {
    const response = await fetch(`https://cyclopedia.onrender.com/${basin}/${year}`, options)
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getLiveHurdat = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=nhcData&subqry=trackByDate&stormdate=()&type=SH&fmt=GEOJSON', options)
    const data = await response.json();
    console.log(data.features)
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}

export const getForecastCone = async () => {
  try {
    const response = await fetch('https://www.femafhz.com/webservice?q=nhcData&subqry=coneByDate&stormdate=()&type=SH&fmt=GEOJSON', options)
    const data = await response.json();
    console.log(data.features)
    return data.features;
  } catch (err) {
    console.error('Server error', err);
  }
}
