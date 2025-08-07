import { useContext } from "react";
import { Context } from "../App";
import { Polyline, Popup, Marker } from "react-leaflet";
import { divIcon } from "leaflet";

const ArchivedStorms = () => {
  const { season, setStormId } = useContext(Context);

  const dot = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: `<svg fill=${color} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40" /></svg>`,
        iconSize: [10, 10]
      })
    )
  }

  const strike = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: 
          `<svg fill=${color}
              xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:cc="http://creativecommons.org/ns#"
              xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
              xmlns:svg="http://www.w3.org/2000/svg"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
              viewBox="-264 -264 528 528">
            <metadata>
              <rdf:RDF>
                <cc:Work rdf:about="">
                  <dc:format>image/svg+xml</dc:format>
                  <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
                </cc:Work>
              </rdf:RDF>
            </metadata>
            <polygon stroke="black" stroke-width="20"
                points="-36.16358,-87.30662 0,-233.85776 36.16358,-87.30662 165.36241,-165.36241 87.30662,-36.16358 233.85776,0 87.30662,36.16358 165.36241,165.36241 36.16358,87.30662 0,233.85776 -36.16358,87.30662 -165.36241,165.36241 -87.30662,36.16358 -233.85776,0 -87.30662,-36.16358 -165.36241,-165.36241 -36.16358,-87.30662 " />
          </svg>`,
        iconSize: [25, 25]
      })
    )
  }

  const getStormStatus = (point) => {
    const wind = point.max_wind_kt;
    let status;
    let color;

    if (point.status === 'LO') {
      status = "Tropical Low";
      color = "white";
    } else if (point.status === 'DB') {
      status = "Tropical Disturbance";
      color = "lightgray";
    } else if (point.status === 'WV') {
      status = "Tropical Wave";
      color = "gray";
    } else if (point.status === 'EX' || point.status === 'ET') {
      status = "Extratropical Cyclone";
      color = "#7F00FF";
    } else if (point.status === 'SD') {
      status = "Subtropical Depression";
      color = "aqua";
    } else if (point.status === 'SS') {
      status = "Subtropical Storm";
      color = "#D0F0C0";
    } else if (point.status === 'TD') {
      status = "Tropical Depression";
      color = "dodgerblue";
    } else if (point.status === 'TS') {
      status = "Tropical Storm";
      color = "lime";
    } else if (point.status === 'HU' || point.status === 'TY') {
      if (wind <= 82) {
        status = 'Category 1 Hurricane';
        color = 'yellow';
      } else if (wind > 82 && wind <= 95) {
        status = 'Category 2 Hurricane';
        color = 'orange';
      } else if (wind > 95 && wind <= 110) {
        status = 'Category 3 Hurricane';
        color = 'red';
      } else if (wind > 110 && wind <= 135) {
        status = 'Category 4 Hurricane';
        color = 'hotpink';
      } else if (wind > 135) {
        status = 'Category 5 Hurricane';
        color = 'pink';
      }
    }

    return { status, color };
  };

  const formatDateTime = (date, time) => {
    const dateArray = date.toString().split('');
    const year = dateArray.slice(0,4).join('');
    const month = dateArray.slice(4,6).join('');
    const day = dateArray.slice(-2).join('');
    const formattedDate = `${month}/${day}/${year}`;

    const timeArray = time.toString().split('');
    const hour = timeArray.slice(0,2).join('');
    const minute = timeArray.slice(-2).join('');
    
    // Convert UTC to EST (UTC-5)
    let estHour = parseInt(hour) - 5;
    let estDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
    
    // Handle day change when converting from UTC to EST
    if (estHour < 0) {
      estHour += 24;
      estDate.setDate(estDate.getDate() - 1);
    }
    
    // Convert to 12-hour format
    let hour12 = estHour;
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    if (hour12 === 0) hour12 = 12;
    if (hour12 > 12) hour12 -= 12;
    
    // Format the EST time in 12-hour format
    const estHourStr = hour12.toString(); // Remove padStart to eliminate leading zeros
    const formattedTime = `${estHourStr}:${minute} ${ampm}`;
    
    // Format the EST date
    const estMonth = (estDate.getMonth() + 1).toString().padStart(2, '0');
    const estDay = estDate.getDate().toString().padStart(2, '0');
    const estYear = estDate.getFullYear();
    const formattedDateEST = `${estMonth}/${estDay}/${estYear}`;

    return { formattedDate: formattedDateEST, formattedTime };
  };

  return season.map((storm) => {
    const id = storm.id;
    const name = id.split('_')[1];
    const positions = [];
    
    const points = storm.data.map((point, i) => {
      const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
      const {lat, lng} = point;
      const coords = [lat, lng];
      positions.push(coords);
      
      const { status, color } = getStormStatus(point);
      const icon = point.record === 'L' ? strike(color) : dot(color);
      const fullName = name !== 'Unnamed' ? `${status} ${name}` : `${name} ${status}`;

      return (
        <Marker key={i} position={coords} icon={icon} eventHandlers={{click:() => {setStormId(id)}}}>
          <Popup className="w-fit font-bold">
            <h1 className="text-[1rem]">{fullName}</h1>
            <h1 className="my-1">{formattedDate} at {formattedTime} EST</h1>
            <h1>Maximum Wind: {point.max_wind_kt} kt</h1>
            <h1>Minimum Pressure: {point.min_pressure_mb ? `${point.min_pressure_mb} mb` : 'Unknown'}</h1>
          </Popup>
        </Marker>
      );
    });

    return (
      <div key={id}>
        <Polyline positions={positions} color="gray" opacity={.25}/>
        {points}
      </div>
    );
  });
};

export default ArchivedStorms; 