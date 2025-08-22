import { useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const SeasonACE = () => {
  const {names, seasonACE} = useContext(Context)

  const data = {
    labels: names,
    datasets: [
      {
        data: seasonACE?.map((ACE) => {return ACE.toFixed(1)}),
        borderColor: "purple",
        backgroundColor: "purple"
      },
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Accumulated Cyclone Energy Totals',
        color: "white"
      },
      tooltip: {
        bodyColor: "white", 
        titleColor: "white",
      },
    },
    scales: {
      y: {
        ticks: {
          color: "white"
        },
      },
      x: {
        ticks: {
          color: "white"
        },
      },
    }
  };

  return (
    <div className='chart'>
      <BarChart options={options} data={data}/>
    </div>
  )}

export default SeasonACE