import { useEffect, useRef } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Stats } from '@/types';

// Register the required chart components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface SubjectDistributionChartProps {
  data: Stats['subjectDistribution'];
  height?: number;
}

const SubjectDistributionChart = ({ data, height = 250 }: SubjectDistributionChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Define colors for subjects
  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return 'hsl(var(--primary))';
      case 'mathematics':
      case 'math':
        return 'hsl(var(--secondary))';
      case 'chemistry':
        return 'hsl(var(--warning))';
      case 'literature':
        return 'hsl(var(--info))';
      case 'history':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--chart-1))';
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare data for the chart
    const chartData = {
      labels: data.map(item => item.subject),
      datasets: [
        {
          data: data.map(item => item.minutes),
          backgroundColor: data.map(item => getSubjectColor(item.subject)),
          borderWidth: 0,
          hoverOffset: 10
        }
      ]
    };
    
    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const minutes = value;
                const hours = (minutes / 60).toFixed(1);
                const percentage = data.find(item => item.subject === label)?.percentage || 0;
                return `${label}: ${hours}h (${percentage}%)`;
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

export default SubjectDistributionChart;
