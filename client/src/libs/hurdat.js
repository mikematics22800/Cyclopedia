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