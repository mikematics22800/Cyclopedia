import { useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'
import { sum } from '../libs/sum'

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
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Accumulated Cyclone Energy'
      }
    },
  };

  return <BarChart options={options} data={data}/>
}

export default SeasonACE