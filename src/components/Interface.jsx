import { useState, useEffect } from "react";
import hurdat2 from "../hurdat2";
import { MenuItem, Select, Button } from "@mui/material"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import retiredImage from "../images/retired.png"
import { point } from "leaflet";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Interface = ({year, setYear, id}) => {

  const [storm, setStorm] = useState(null)
  const [name, setName] = useState(null)
  const [dates, setDates] = useState(null)
  const [wind, setWind] = useState(null)
  const [pressure, setPressure] = useState(null)
  const [radius34kt, setRadius34kt] = useState(null)
  const [radius50kt, setRadius50kt] = useState(null)
  const [radius64kt, setRadius64kt] = useState(null)
  const [retired, setRetired] = useState(false)
  const [landfalls, setLandfalls] = useState(null)
  const [duration, setDuration] = useState(null)
  const [maxWind, setMaxWind] = useState(null)
  const [minPressure, setMinPressure] = useState(null)
  const [maxWindAtLandfall, setMaxWindAtLandfall] = useState(null)
  const [minPressureAtLandfall, setMinPressureAtLandfall] = useState(null)
  const [title, setTitle] = useState(null)
  const [textColor, setTextColor] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [daysAtStrength, setDaysAtStrength] = useState(null)
  const [costUSD, setCostUSD] = useState(null)
  const [fatalaties, setFatalaties] = useState(null)
  const [ACE, setACE] = useState(null)
  const [seasonStats, setSeasonStats] = useState(false)
  const [buttonText, setButtonText] = useState("Season Stats")
  const [maxWinds, setMaxWinds] = useState(null)
  const [minPressures, setMinPressures] = useState(null)
  const [names, setNames] = useState(null)
  const [stormsAtStrength, setStormsAtStrength] = useState(null)

  useEffect(() => {
    const name = id.split("_")[1]
    setName(name)
    setRetired(false)
    const storm = hurdat2[2022 - year]?.find((storm) => storm[0]?.id === id)
    setStorm(storm)
  }, [id]);

  useEffect(() => {
    if (storm) {
      const stormTrack = storm.slice(1)

      const dates = stormTrack.map((point) => {
        const dateArray = point?.date.toString().split("")
        const month = dateArray.slice(4,6).join("")
        const day = dateArray.slice(-2).join("")
        return `${month}/${day}`
      })

      setDates(dates)

      const wind = stormTrack.map((point) => {
        return point.max_wind_kt
      })
      setWind(wind)
  
      const maxWind = Math.max(...wind)
      setMaxWind(maxWind)

      const pressure = stormTrack.map((point) => {
        return point.min_pressure_mb
      })
      setPressure(pressure)

      const minPressure = Math.min(...pressure)
      setMinPressure(minPressure)

      const radius34kt = stormTrack.map((point) => {
        return Math.max(point["34kt_wind_radius_nm_ne"], point["34kt_wind_radius_nm_nw"], point["34kt_wind_radius_nm_se"], point["34kt_wind_radius_nm_sw"])
      })
      setRadius34kt(radius34kt)
      
      const radius50kt = stormTrack.map((point) => {
        return Math.max(point["50kt_wind_radius_nm_ne"], point["50kt_wind_radius_nm_nw"], point["50kt_wind_radius_nm_se"], point["50kt_wind_radius_nm_sw"])
      })
      setRadius50kt(radius50kt)

      const radius64kt = stormTrack.map((point) => {
        return Math.max(point["64kt_wind_radius_nm_ne"], point["64kt_wind_radius_nm_nw"], point["64kt_wind_radius_nm_se"], point["64kt_wind_radius_nm_sw"])
      })
      setRadius64kt(radius64kt)

      if (storm[0].retired === "true") {
        setRetired(true)
      } else {
        setRetired(false)
      }

      const startArray = storm[1].date.toString().split('')
      const startYear = startArray.slice(0,4).join('')
      const startMonth = startArray.slice(4,6).join('')
      const startDay = startArray.slice(-2).join('')
      const start = `${startMonth}/${startDay}/${startYear}`
      const endArray = storm.pop().date.toString().split('')
      const endYear = endArray.slice(0,4).join('')
      const endMonth = endArray.slice(4,6).join('')
      const endDay = endArray.slice(-2).join('')
      const end = `${endMonth}/${endDay}/${endYear}`
      const duration = `${start}-${end}`
      setDuration(duration)

      let landfalls=0
      stormTrack.forEach((point) => {
        if (point.record == "L") {
          landfalls += 1
        }
      })
      setLandfalls(landfalls)

      const stormLandfalls = stormTrack.filter(point => point.record === "L")
  
      const windAtLandfall = stormLandfalls.map((point) => {
        return point.max_wind_kt
      })
      const maxWindAtLandfall = Math.max(...windAtLandfall)
      setMaxWindAtLandfall(maxWindAtLandfall)

      const pressureAtLandfall = stormLandfalls.map((point) => {
        return point.min_pressure_mb
      })
      const minPressureAtLandfall = Math.min(...pressureAtLandfall)
      setMinPressureAtLandfall(minPressureAtLandfall)

      let title
      let textColor
      const status = stormTrack.map((point) => {
        return point.status
      })
      if (maxWind < 34) {
        if (!status?.includes("SD")) {
          title = "Tropical Depression"
          textColor = "text-[blue]"
        } 
        if (!status?.includes("TD")) {
          title = "Subtropical Depression"
          textColor = "text-[lightblue]"
        } 
      } 
      if (maxWind >= 34 && maxWind < 64) {
        if (!status?.includes("SS")) {
          title = "Tropical Storm"
          textColor = "text-[lime]"
        } 
        if (!status?.includes("TS")) {
          title = "Subtropical Storm"
          textColor = "text-[lightgreen]"
        } 
      } 
      if (maxWind >= 64) {
        title = "Hurricane"
        if (maxWind <= 82) {
          textColor = "text-[yellow]"
        }
        if (maxWind > 82 && maxWind <= 95) {
          textColor = "text-[orange]"
        }
        if (maxWind > 95 && maxWind <= 110) {
          textColor = "text-[red]"
        }
        if (maxWind > 110 && maxWind <= 135) {
          textColor = "text-[hotpink]"
        }
        if (maxWind > 135) {
          textColor = "text-[pink]"
        }
      }
      setTitle(title)
      setTextColor(textColor)

      const imageUrl = storm[0].imageUrl
      setImageUrl(imageUrl)
      
      let i=1
      let hoursAtTS=0
      let hoursAtH1=0
      let hoursAtH2=0
      let hoursAtH3=0
      let hoursAtH4=0
      let hoursAtH5=0
      const toHours = ((point) => {
        const dateArray = point.date.toString().split('')
        const year = dateArray.slice(0,4).join('')
        const month = dateArray.slice(4,6).join('')
        const day = dateArray.slice(-2).join('')
        const timeArray = point.time_utc.toString().split('')
        const hour = timeArray.slice(0,2).join('')
        const minute = timeArray.slice(-2).join('')
        const date = new Date(`${year}-${month}-${day}:${hour}:${minute}:00`)
        const milliseconds = date.getTime()
        const hours = milliseconds/(3600000)
        return hours
      })
      stormTrack.slice(1).forEach((point) => {
        const prevPoint=stormTrack[i-1]
        if (["TS", "SS", "HU"].includes(point.status)) {
          if (["TS", "SS", "HU"].includes(prevPoint.status)) {
            const wind=point.max_wind_kt
            const hours = toHours(point) - toHours(prevPoint)
            if (wind >= 34) {
              hoursAtTS += hours
            } if (wind >= 64) {
              hoursAtTS += hours
              hoursAtH1 += hours
            } if (wind >= 83) {
              hoursAtTS += hours
              hoursAtH1 += hours
              hoursAtH2 += hours
            } if (wind >= 100) {
              hoursAtTS += hours
              hoursAtH1 += hours
              hoursAtH2 += hours
              hoursAtH3 += hours
            } if (wind >= 110) {
              hoursAtTS += hours
              hoursAtH1 += hours
              hoursAtH2 += hours
              hoursAtH3 += hours
              hoursAtH4 += hours
            } if (wind >= 135) {
              hoursAtTS += hours
              hoursAtH1 += hours
              hoursAtH2 += hours
              hoursAtH3 += hours
              hoursAtH4 += hours
              hoursAtH5 += hours
            }
          }
        }
        i+=1
      })
      const toDays = ((hours) => {
        const days = (hours/24).toFixed(1)
        return days
      })
      const daysAtTS = toDays(hoursAtTS)
      const daysAtH1 = toDays(hoursAtH1)
      const daysAtH2 = toDays(hoursAtH2)
      const daysAtH3 = toDays(hoursAtH3)
      const daysAtH4 = toDays(hoursAtH4)
      const daysAtH5 = toDays(hoursAtH5)
      const daysAtStrength = [daysAtTS, daysAtH1, daysAtH2, daysAtH3, daysAtH4, daysAtH5]
      setDaysAtStrength(daysAtStrength)

      const costUSD = storm[0].cost_usd.toLocaleString()
      setCostUSD(costUSD)
  
      const fatalaties = storm[0].fatalaties.toLocaleString()
      setFatalaties(fatalaties)

      let ACEPoint = 0
      let windArray = []
      const ACE = stormTrack.map((point) => {
        const wind = point.max_wind_kt
        const hour = parseInt(point.time_utc)
        if (["TS", "SS", "HU"].includes(point.status)) {
          if (hour % 600 == 0) {
            ACEPoint += Math.pow(wind, 2)
            if (windArray.length > 0) {
              let sum = 0
              windArray.forEach((wind) => {
                sum += wind
              })
              const average = sum/windArray.length
              ACEPoint += Math.pow(average, 2)
              windArray = []
            }
          } else {
            windArray.push(wind)
          }
        }
        return ACEPoint
      })
      setACE(ACE)
    }
  }, [storm])

  useEffect(() => {
   if (seasonStats === true) {
    setButtonText("Storm Stats")
   } else {
    setButtonText("Season Stats")
   }
  }, [seasonStats]);

  useEffect(() => {
    const season = hurdat2[2022-year].filter(storm =>
      storm.map((point) => {return point.status}).includes("TS") ||
      storm.map((point) => {return point.status}).includes("SS")
    );

    const maxWinds = season.map((storm) => {
      const wind = storm.slice(1).map((point) => {
        return point.max_wind_kt
      })
      const maxWind = Math.max(...wind)
      return maxWind
    })
    setMaxWinds(maxWinds)

    const minPressures = season.map((storm) => {
      const pressure = storm.slice(1).map((point) => {
        return point.min_pressure_mb
      })
      const minPressure = Math.min(...pressure)
      return minPressure
    })
    setMinPressure(minPressures)
    console.log(minPressures)

    const names = season.map((storm) => {
      return storm[0].id.split('_')[1]
    })
    setNames(names)

    let TS=0
    let H1=0
    let H2=0
    let H3=0
    let H4=0
    let H5=0
    season.forEach((storm) => {
      const wind = storm.slice(1).map((point) => {
        return point.max_wind_kt
      })
      const maxWind = Math.max(...wind)
      if (maxWind >= 34) {
        TS += 1
      } if (maxWind >= 64) {
        TS += 1
        H1 += 1
      } if (maxWind >= 83) {
        TS += 1
        H1 += 1
        H2 += 1
      } if (maxWind >= 100) {
        TS += 1
        H1 += 1
        H2 += 1
        H3 += 1
      } if (maxWind >= 110) {
        TS += 1
        H1 += 1
        H2 += 1
        H3 += 1
        H4 += 1
      } if (maxWind >= 135) {
        TS += 1
        H1 += 1
        H2 += 1
        H3 += 1
        H4 += 1
        H5 += 1
      }
    })
    const stormsAtStrength = [TS, H1, H2, H3, H4, H5]
    setStormsAtStrength(stormsAtStrength)
  }, [year])


  const intensityData = {
    labels: dates,
    datasets: [
      {
        label: "Maximum Wind (kt)",
        data: wind,
        borderColor: "red",
        backgroundColor: "pink",
        yAxisID: "y"
      },
      {
        label: "Minimum Pressure (mb)",
        data: pressure,
        borderColor: "blue",
        backgroundColor: "lightblue",
        yAxisID: "y1"
      },
    ]
  }

  const intensityOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: "Intensity"
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const sizeData = {
    labels: dates,
    datasets: [
      {
        label: "34-49 kt",
        data: radius34kt,
        borderColor: "gold",
        backgroundColor: "lightyellow"
      },
      {
        label: "50-63 kt",
        data: radius50kt,
        borderColor: "orange",
        backgroundColor: "rgb(255, 213, 128)",
      },
      {
        label: "64+ kt",
        data: radius64kt,
        borderColor: "red",
        backgroundColor: "pink",
      }
    ]
  }

  const sizeOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Wind Radius Maximum (nm)"
      },
    },
  };

  const durationData = {
    labels: ["Tropical Storm", "Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
    datasets: [
      {
        data: daysAtStrength,
        borderColor: ["lime", "yellow", "orange", "red", "hotpink", "pink"],
        backgroundColor: ["lime", "yellow", "orange", "red", "hotpink", "pink"],
      },
    ]
  }

  const durationOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Days at Each Strength or Higher',
      },
    },
  };

  const ACEOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Accumulated Cyclone Energy"
      },
    },
  };

  const ACEData = {
    labels: dates,
    datasets: [
      {
        data: ACE,
        borderColor: "blue",
        backgroundColor: "lightblue"
      },
    ]
  }

  const maxWindData = {
    labels: names,
    datasets: [
      {
        data: maxWinds,
        borderColor: "red",
        backgroundColor: "red",
      },
    ]
  }

  const maxWindOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Highest Maximum Wind (kt)',
      },
    },
  };
  
  const minPressureData = {
    labels: names,
    datasets: [
      {
        data: minPressures,
        borderColor: "blue",
        backgroundColor: "blue",
      },
    ]
  }

  const minPressureOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Lowest Minimum Pressure (mb)',
      },
    },
  };

  const stormsAtStrengthData = {
    labels: ["Tropical Storm", "Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
    datasets: [
      {
        label: "",
        data: stormsAtStrength,
        borderColor: ["lime", "yellow", "orange", "red", "hotpink", "pink"],
        backgroundColor: ["lime", "yellow", "orange", "red", "hotpink", "pink"],
      },
    ]
  }

  const stormsAtStrengthOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Storms at Each Strength or Higher',
      },
    },
  };

  const years = new Array(2022 - 1850).fill(0)

  const toggleStats = () => {
    if (seasonStats === false) {
      setSeasonStats(true)
    } else {
      setSeasonStats(false)
    }
  }

  return (
    <div className="w-[48rem] h-screen bg-blue-950 p-10 overflow-auto">
      <div className="flex items-center justify-between mb-10">
        <Select className="bg-white !rounded-xl w-24 h-12" value={year} onChange={(e) => {setYear(e.target.value)}}>
          {years.map((_, index) => {
            const selectedYear = 2022 - index;
            return (<MenuItem key={selectedYear} value={selectedYear}>{selectedYear}</MenuItem>);
          })}
        </Select>
        <Button onClick={toggleStats} className="h-12" variant="contained"><h1 className="font-sans font-bold">{buttonText}</h1></Button>
      </div>
      {storm && seasonStats === false && <>
        <div className="flex justify-between mb-10">
          <a className="w-96 h-[31rem] bg-cover flex items-center justify-center rounded-md" style={{backgroundImage: `url(${imageUrl})`}} href={`https://www.nhc.noaa.gov/data/tcr/${id}.pdf`}>
            {retired == true && <img className="w-80 animate__bounceIn" src={retiredImage}/>}
          </a>
          <div className="flex flex-col w-64 font-bold">
            <h1 className={`${textColor} text-2xl font-bold`}>{title} {name}</h1>
            <h1 className="text-lg text-white font-bold mb-5">{duration}</h1>
            <div className="text-sm text-white flex flex-col gap-1">
              <h1>Maximum Wind: {maxWind} kt</h1>
              <h1>Minimum Pressure: {minPressure} mb</h1>
              <h1>Landfalls: {landfalls}</h1>
              {landfalls > 0 && 
                <>
                  <h1>Maximum Wind at Landfall: {maxWindAtLandfall} kt</h1>
                  <h1>Minimum Pressure at Landfall: {minPressureAtLandfall} mb</h1>
                </>
              }
              <h1>Fatalaties: {fatalaties}</h1>
              <h1>Cost Estimate (USD): {costUSD}</h1>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md">
          <Line options={intensityOptions} data={intensityData}/>
          <Line className="my-5"  options={sizeOptions} data={sizeData}/>
          <Bar options={durationOptions} data={durationData}/>
          <Line className="mt-5" options={ACEOptions} data={ACEData}/>
        </div>
      </>}
      {seasonStats && <>
        <div className="bg-white p-5 rounded-md">
          <Bar options={maxWindOptions} data={maxWindData}/>
          <Bar className="my-5" options={minPressureOptions} data={minPressureData}/>
          <Bar options={stormsAtStrengthOptions} data={stormsAtStrengthData}/>
        </div>
      </>}
    </div>
  )
}

export default Interface