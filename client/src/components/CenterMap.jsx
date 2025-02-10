import React, { useEffect, useContext } from 'react'
import { Context } from "../App";
import { useMap } from 'react-leaflet';

const CenterMap = () => {
  const map = useMap();

  const {basin} = useContext(Context)

  useEffect(() => {
    if (basin === 'atl') { 
      map.setView([30, -60]); 
    } else {
      map.setView([30, -120]);
    }
  }, [basin, map])
}

export default CenterMap