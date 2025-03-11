import { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Stats } from '@/types';
import { format, subMonths, eachWeekOfInterval, endOfMonth, startOfMonth } from 'date-fns';

// Register the required chart components
Chart.register(BarController, BarElement, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface ProductivityTrendsChartProps {
  data: Stats['dailyStats'];
  height?: number;
}

const ProductivityTrendsChart = ({ data, height = 160 }: ProductivityTrendsChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Get last 4 weeks
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    const weeks = eachWeekOfInterval({
      start: startOfMonth(lastMonth),
      end: endOfMonth(today)
    }).slice(-4);
    
    const weekLabels = weeks.map(week => format(week, 'MMM d'));
    
    // Mock data for the chart
    // In a real app, this would use actual user data
    const weeklyStudyHours = [10.5, 12.2, 9.8, 14.3];
    const weeklyTaskCompletion = [65, 70, 60, 75];
    
    // Prepare data for the chart
    const chartData = {
      labels: weekLabels,
      datasets: [
        {
          type: 'bar',
          label: 'Study Hours',
          data: weeklyStudyHours,
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 4,
          order: 2,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Task Completion %',
          data: weeklyTaskCompletion,
          borderColor: 'hsl(var(--secondary))',
          backgroundColor: 'rgba(52, 199, 89, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          order: 1,
          yAxisID: 'y1'
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
            title: {
              display: true,
              text: 'Hours'
            },
            position: 'left',
            grid: {
              display: false
            }
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Completion %'
            },
            position: 'right',
            min: 0,
            max: 100,
            grid: {
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
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                if (context.datasetIndex === 0) {
                  return `${value} hours`;
                } else {
                  return `${value}% completed`;
                }
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

export default ProductivityTrendsChart;
