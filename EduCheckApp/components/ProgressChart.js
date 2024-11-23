import React from 'react';
import { Line } from 'react-chartjs-2';

function ProgressChart({ data }) {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: '进步情况',
        data: data.map(item => item.score),
        fill: false,
        borderColor: 'blue'
      }
    ]
  };

  return (
    <div>
      <h2>学习进度</h2>
      <Line data={chartData} />
    </div>
  );
}

export default ProgressChart;
