import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import { sum } from '../libs/sum'
import BarChart from './BarChart';

const Cost = () => {
  const {season} = useContext(Context)

  const [names, setNames] = useState([]);
  const [cost, setCost] = useState([])

  useEffect(() => {
    const costlyStorms = season.filter((storm) => {
      return storm.cost_usd > 0
    })

    const names = costlyStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

    const cost = costlyStorms.map((storm) => {
      return storm.cost_usd/1000000000
    })
    setCost(cost)
  }, [season])

  const data = {
    labels: names,
    datasets: [
      {
        data: cost.map((cost) => {
          return cost.toFixed(3)
        }),
        borderColor: "green",
        backgroundColor: "green",
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
        text: `Cost Estimate (Billion USD): $${sum(cost).toFixed(3)}`,
      },
    },
  };
  
  return <BarChart options={options} data={data}/>
}

export default Cost