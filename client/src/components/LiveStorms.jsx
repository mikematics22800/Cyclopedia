import { useContext } from "react";
import { Context } from "../App";
import { Polyline, Popup, Marker, Polygon } from "react-leaflet";
import { divIcon } from "leaflet";

export const convertToUTC = (dateStr) => {
  try {
    // Parse the date string components
    const [time, ampm, timezone, day, month, date, year] = dateStr.split(' ');
    const [hours, minutes] = time.split(/(?=(?:..)*$)/);
    
    // Create date string in a format that JavaScript can parse
    const parsedDate = new Date(`${month} ${date} ${year} ${hours}:${minutes} ${ampm} ${timezone}`);
    
    return parsedDate.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false
    }).replace(',', ' at');
  } catch (error) {
    console.error('Date parsing error:', error);
    return dateStr; // Return original string if conversion fails
  }
};

export const getLatestPoint = (points) => {
  const now = new Date();
  let latestPoint = null;
  let latestTime = new Date(0); // Start with earliest possible date

  points.forEach(point => {
    try {
      const [time, ampm, timezone, day, month, date, year] = point.properties.ADVDATE.split(' ');
      const [hours, minutes] = time.split(/(?=(?:..)*$)/);
      const pointDate = new Date(`${month} ${date} ${year} ${hours}:${minutes} ${ampm} ${timezone}`);
      
      if (pointDate > latestTime && pointDate <= now) {
        latestTime = pointDate;
        latestPoint = point;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  });

  return latestPoint;
};

const LiveStorms = () => {
  const { liveHurdat, forecastCone } = useContext(Context);

  const stormIcon = (color, maxWind) => {
    // Calculate rotation speed based on wind speed
    // Higher wind speeds = faster rotation
    const rotationSpeed = maxWind / 10;
    
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: `<style>
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .rotating-storm {
            animation: rotate ${rotationSpeed}s linear infinite;
            transform-origin: center;
          }
        </style>
        <div class="rotating-storm">
          <svg fill=${color} stroke="black" stroke-width="20" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 1000 1000" style="enable-background:new 0 0 1000 1000;" xml:space="preserve">
            <path id="XMLID_4_" d="M770.4727173,227.425354c39.6831055-15.4902954,82.9113159-27.1513672,128.5977783-34.2336426
            c-50.8377686-12.8282471-105.7141113-19.8361816-162.9956055-19.8361816
            c-183.9008179,0-343.3033447,72.2774048-421.7575073,177.8726196l0.3860474,0.1188965
            c0.3860474-0.5049438,0.8018188-0.9799805,1.2175903-1.4847412C282.5142212,390.8115845,262.4403687,443.045105,262.4403687,500
            c0,40.2366333,10.0072021,78.1422729,27.668335,111.3560791c32.2402954,60.6321411,3.3745728,136.3082275-60.6011963,161.2643433
            c-39.6578979,15.4700928-82.8701782,27.1080933-128.5780029,34.1878052
            c50.8377686,12.8282471,105.7141113,19.8362427,162.9956055,19.8362427
            c183.9008179,0,343.3033447-72.2775879,421.7575073-177.8728638l-0.3860474-0.1187134
            C717.9905396,607.9707642,737.5596313,556.2719727,737.5596313,500c0-40.2181396-10.0053711-78.0926514-27.6586914-111.2879639
            C677.6546021,328.0757446,706.4966431,252.3985596,770.4727173,227.425354z M500,574.2373657
            c-41.008728,0-74.2373657-33.2286377-74.2373657-74.2373657S458.991272,425.7626343,500,425.7626343
            S574.2373657,458.991272,574.2373657,500S541.008728,574.2373657,500,574.2373657z"/>
          </svg>
        </div>`,
        iconSize: [40, 40]
      })
    )
  }

  const dot = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: `<svg fill=${color} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40" /></svg>`,
        iconSize: [10, 10]
      })
    )
  }

  const getStormStatus = (STORMTYPE, MAXWIND) => {
    let color;
    let status;

    if (STORMTYPE === 'LO') {
      color = "white";
      status = "Tropical Low";
    } else if (STORMTYPE === 'DB') {
      color = "lightgray";
      status = "Tropical Disturbance";
    } else if (STORMTYPE === 'WV') {
      color = "gray";
      status = "Tropical Wave";
    } else if (STORMTYPE === 'EX') {
      color = "#7F00FF";
      status = "Extratropical Cyclone";
    } else if (STORMTYPE === 'SD') {
      color = "aqua";
      status = "Subtropical Depression";
    } else if (STORMTYPE === 'SS') {
      color = "#D0F0C0";
      status = "Subtropical Storm";
    } else if (STORMTYPE === 'TD' || STORMTYPE === 'STD') {
      color = "dodgerblue";
      status = "Tropical Depression";
    } else if (STORMTYPE === 'TS' || STORMTYPE === 'STS') {
      color = "lime";
      status = "Tropical Storm";
    } else if (STORMTYPE === 'HU' || STORMTYPE === 'TY') {
      if (MAXWIND <= 82) {
        color = 'yellow';
        status = 'Category 1 Hurricane';
      } else if (MAXWIND > 82 && MAXWIND <= 95) {
        color = 'orange';
        status = 'Category 2 Hurricane';
      } else if (MAXWIND > 95 && MAXWIND <= 110) {
        color = 'red';
        status = 'Category 3 Hurricane';
      } else if (MAXWIND > 110 && MAXWIND <= 135) {
        color = 'hotpink';
        status = 'Category 4 Hurricane';
      } else if (MAXWIND > 135) {
        color = 'pink';
        status = 'Category 5 Hurricane';
      }
    }

    return { status, color };
  };

  const liveStorms = liveHurdat.reduce((acc, feature, i) => {
    const [lng, lat] = feature.geometry.coordinates[0];
    const { STORMNAME, stormkey } = feature.properties;

    // Store the point data first
    if (!acc[stormkey]) {
      acc[stormkey] = {
        markers: [],
        positions: [],
        name: STORMNAME,
        points: []
      };
    }
    acc[stormkey].points.push(feature);
    acc[stormkey].positions.push([lat, lng]);

    return acc;
  }, {});

  // Find the latest point for each storm and create markers
  Object.keys(liveStorms).forEach(stormkey => {
    const latestPoint = getLatestPoint(liveStorms[stormkey].points);
    if (latestPoint) {
      liveStorms[stormkey].latestPoint = latestPoint;
      
      // Create markers for all points
      liveStorms[stormkey].points.forEach((point, i) => {
        const [lng, lat] = point.geometry.coordinates[0];
        const { STORMNAME, STORMTYPE, MAXWIND, GUST, ADVDATE } = point.properties;
        const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
        
        // Use storm icon for latest point, dot for others
        const isLatestPoint = point === latestPoint;
        const icon = isLatestPoint ? stormIcon(color, MAXWIND) : dot(color);
        
        const marker = (
          <Marker key={`marker-${stormkey}-${i}`} position={[lat, lng]} icon={icon}>
            <Popup className="w-fit font-bold">
              <h3>{status} {STORMNAME.split(' ').pop()}</h3>
              <h3>{convertToUTC(ADVDATE)} UTC</h3>
              <h3>Maximum Wind: {MAXWIND} kt</h3>
              <h3>Maximum Wind Gusts: {GUST} kt</h3>
            </Popup>
          </Marker>
        );
        
        liveStorms[stormkey].markers.push(marker);
      });
    }
  });

  const cones = forecastCone.map((feature) => {
    const coordinates = feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    return (
      <Polygon positions={coordinates} color="red">
        <Popup className="w-fit font-bold">
          <h3>Cone of Uncertainty</h3>
        </Popup>
      </Polygon>
    )
  });

  const tracks = Object.entries(liveStorms).map(([stormkey, data]) => (
    <div key={stormkey}>
      <Polyline 
        positions={data.positions} 
        color="gray" 
        opacity={0.25}
      />
      {data.markers}
    </div>
  ));

  return (
    <>
      {tracks}
      {cones}
    </>
  )
}

export default LiveStorms; 