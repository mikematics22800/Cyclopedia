import { useContext } from 'react'
import { Context } from '../App'
import LineChart from './LineChart'

const ACE = () => {
  const {dates, ACEArray} = useContext(Context)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Accumulated Cyclone Energy',
        color: "white"
      },
      legend: {
        display: false
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

  const data = {
    labels: dates,
    datasets: [
      {
        data: ACEArray?.map((ACE) => {return ACE.toFixed(1)}),
        borderColor: "purple",
        backgroundColor: "pink"
      },
    ]
  }

  return (
    <div className='chart'>
      <LineChart options={options} data={data}/>
    </div>
  )
}

export default ACE