const options = {
  method: 'GET',
  headers: {
    'Content-Type' : 'application/json'
  }
}

export const getHurdat = async (basin, year) => {
  const response = await fetch(`https://cyclopedia.com/${basin}/${year}`, options)
  const data = await response.json();
  return data;
}