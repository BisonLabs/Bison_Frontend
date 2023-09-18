import React from 'react'
import LineChart from '../Charts/LineChart'

const SmallChartCard = ({ header, height, value, change, chartData }) => {
  return (
    <div
      className={`bg-gradient-card1 p-4 rounded-lg`}
      style={{
        height: height && `${height}px`
      }}
    >
      <div className='text-[14px] opacity-[0.5] text-white'>
        { header }
      </div>
      <div className="flex justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[19px] text-white">{value}</p>
          {
            change && <div className='flex items-center gap-2'>
              <i
                className={`fa ${
                  change < 0 ? "fa-sort-down" : "fa-sort-up"
                } text-[18px] text-[#FF2B1E] ${change < 0 ? "-mt-2" : "mt-2"}`}
                style={{ color: change < 0 ? "#FF2B1E" : "#58FF1E" }}
              />
              <p className="text-[12px]" style={{ color: change < 0 ? "#FF2B1E" : "#58FF1E" }}>
                {`${Math.abs(change)}%`}
              </p>
            </div>
          }
        </div>
        <div className="h-[50px] w-[50%]">
          <LineChart
            data={{
              labels: chartData,
              datasets: [
                {
                  fill: true,
                  label: "Dataset",
                  data: chartData,
                  borderWidth: 1,
                  pointRadius: 0,
                  borderColor: change > 0 ? "#28FF98" : "#db4737",
                  backgroundColor: change > 0 ? "#28FF9822" : "#db473722",
                },
              ]
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SmallChartCard