'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartData,
  ChartOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Update {
  id: string;
  created_at: string;
  mood: 'not_great' | 'okay' | 'good' | 'great';
  user_name: string;
  content: string;
}

interface MoodGraphProps {
  updates: Update[];
}

const MOOD_VALUES = {
  'not_great': 1,
  'okay': 2,
  'good': 3,
  'great': 4
};

const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Not Great'];

const moodStatements = {
  'not_great': 'was not feeling great 😕',
  'okay': 'was feeling okay 🙂',
  'good': 'was feeling good 😄',
  'great': 'was feeling great 🤗'
};

export default function MoodGraph({ updates }: MoodGraphProps) {
  const lineColor = useColorModeValue('blue.400', 'blue.200');
  const gridColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Sort updates by date
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const data: ChartData<'line'> = {
    datasets: [{
      label: 'Team Mood',
      data: sortedUpdates.map(update => ({
        x: new Date(update.created_at).getTime(),
        y: MOOD_VALUES[update.mood],
        name: update.user_name,
        mood: update.mood
      })) as any,
      borderColor: lineColor,
      backgroundColor: lineColor,
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.2
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MMM d, h:mm a'
          }
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        min: 0.5,
        max: 4.5,
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 10,
          callback: (value) => {
            const numValue = Number(value);
            if (Number.isInteger(numValue) && numValue >= 1 && numValue <= 4) {
              // Map the values directly to labels
              switch(numValue) {
                case 1: return 'Not Great';
                case 2: return 'Okay';
                case 3: return 'Good';
                case 4: return 'Great';
                default: return '';
              }
            }
            return '';
          }
        }
      }
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: true,
        backgroundColor: '#fff',
        titleColor: '#222',
        bodyColor: '#222',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        position: 'nearest',
        caretSize: 8,
        caretPadding: 6,
        callbacks: {
          title: (items) => {
            const item = items[0];
            const date = item.raw as { x: number };
            return new Date(date.x).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          },
          label: (item) => {
            const update = sortedUpdates[item.dataIndex];
            if (update && update.user_name && update.mood) {
              return [
                `${update.user_name} ${moodStatements[update.mood as keyof typeof moodStatements]}`,
                `"${update.content}"`
              ];
            }
            return '';
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <Box 
      w="100%" 
      h={{ base: "300px", md: "400px", lg: "500px" }}
      p={8} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      bg={bgColor}
    >
      <Line data={data} options={options} />
    </Box>
  );
} 