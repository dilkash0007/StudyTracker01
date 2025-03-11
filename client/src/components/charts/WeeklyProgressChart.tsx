import { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Stats } from '@/types';
import { format, startOfWeek, addDays } from 'date-fns';

// Register the required chart components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface WeeklyProgressChartProps {
  data: Stats['dailyStats'];
  height?: number;
}

const WeeklyProgressChart = ({ data, height = 250 }: WeeklyProgressChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Generate days of the week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const dayLabels = Array.from({ length: 7 }, (_, i) => 
      format(addDays(weekStart, i), 'EEE')
    );
    
    // Aggregate minutes by day of week
    const dailyMinutes = Array(7).fill(0);
    
    data.forEach(item => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
      dailyMinutes[dayOfWeek] += item.minutes;
    });
    
    // Convert minutes to hours with 1 decimal
    const dailyHours = dailyMinutes.map(minutes => +(minutes / 60).toFixed(1));
    
    // Prepare data for the chart
    const chartData = {
      labels: dayLabels,
      datasets: [
        {
          label: 'Hours Studied',
          data: dailyHours,
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: 'hsl(var(--primary))',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Hours'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${value} hours`;
              }
            }
          }
        }
      }
    });
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default WeeklyProgressChart;
