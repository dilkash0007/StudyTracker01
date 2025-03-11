import { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
import { Stats } from '@/types';
import { format, subDays } from 'date-fns';

// Register the required chart components
Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

interface DailyStudyTimeChartProps {
  data: Stats['dailyStats'];
  height?: number;
}

const DailyStudyTimeChart = ({ data, height = 160 }: DailyStudyTimeChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Get last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        label: format(date, 'd'),
        minutes: 0
      };
    });
    
    // Aggregate minutes by day
    data.forEach(item => {
      const itemDate = new Date(item.date);
      const dayIndex = last7Days.findIndex(day => 
        format(day.date, 'yyyy-MM-dd') === format(itemDate, 'yyyy-MM-dd')
      );
      
      if (dayIndex !== -1) {
        last7Days[dayIndex].minutes += item.minutes;
      }
    });
    
    // Convert minutes to hours with 1 decimal
    const dailyHours = last7Days.map(day => +(day.minutes / 60).toFixed(1));
    
    // Prepare data for the chart
    const chartData = {
      labels: last7Days.map(day => day.label),
      datasets: [
        {
          data: dailyHours,
          backgroundColor: 'hsl(var(--secondary))',
          borderRadius: 4,
          barThickness: 12,
        }
      ]
    };
    
    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              display: false
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const index = items[0].dataIndex;
                return format(last7Days[index].date, 'MMM d, yyyy');
              },
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

export default DailyStudyTimeChart;
