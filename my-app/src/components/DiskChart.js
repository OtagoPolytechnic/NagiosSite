import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function DiskChart({ used, total }) {
  const free = total - used;
  
  const data = {
    labels: ['Used Space', 'Free Space'],
    datasets: [{
      data: [used, free],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '150px', width: '100%' }}>
      <Pie data={data} options={options} />
    </div>
  );
}

export default DiskChart; 