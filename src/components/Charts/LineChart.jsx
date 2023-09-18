import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      // position: 'top',
    },
  },
  scaleOverride: true,
  scaleSteps: 10,
  scaleStepWidth: 100,
  scaleStartValue: 0,
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      min: 0,
    },
  },
  maintainAspectRatio: false,
};

const LineChart = ({data}) => {
  return <Line options={options} data={data} />;
}

export default LineChart;