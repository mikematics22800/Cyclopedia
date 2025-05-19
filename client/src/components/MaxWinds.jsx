import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MaxWinds = () => {
  const {names, maxWinds} = useContext(Context)

  const data = {
    labels: names,
    datasets: [
      {
        data: maxWinds,
        borderColor: "red",
        backgroundColor: "red",
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
        text: 'Wind Peaks (kt)',
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
  )
}

export default MaxWinds