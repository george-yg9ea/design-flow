'use client';

import { Box, useColorModeValue, Select, HStack, Text, IconButton, Button, Flex, useTheme } from '@chakra-ui/react';
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
import { useState } from 'react';
import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
  const theme = useTheme();
  const primaryColor = theme.colors.blue[500];
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const lineColor = primaryColor;
  const gridColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Sort updates by date
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Calculate min and max for the selected view using currentDate
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;
  let periodLabel = '';
  if (view === 'day') {
    const start = startOfDay(currentDate);
    const end = endOfDay(currentDate);
    min = start.getTime();
    max = end.getTime();
    periodLabel = format(start, 'MMM d, yyyy');
  } else if (view === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    min = start.getTime();
    max = end.getTime();
    periodLabel = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  } else if (view === 'month') {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    min = start.getTime();
    max = end.getTime();
    periodLabel = format(start, 'MMMM yyyy');
  } else if (view === 'year') {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    min = start.getTime();
    max = end.getTime();
    periodLabel = format(start, 'yyyy');
  } else if (view === 'all') {
    min = undefined;
    max = undefined;
    periodLabel = 'All Time';
  }

  // Filter updates based on min/max
  let filteredUpdates = sortedUpdates;
  if (min !== undefined && max !== undefined) {
    filteredUpdates = sortedUpdates.filter(u => {
      const t = new Date(u.created_at).getTime();
      return t >= min! && t <= max!;
    });
  }

  // Set stepSize for each view
  let stepSize: number | undefined = undefined;
  if (view === 'day') stepSize = 2;
  else if (view === 'week') stepSize = 1;
  else if (view === 'month') stepSize = 2;
  else if (view === 'year') stepSize = 1;
  else if (view === 'all') stepSize = 1;

  // Arrow navigation handlers
  const handlePrev = () => {
    if (view === 'day') setCurrentDate(prev => subDays(prev, 1));
    else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else if (view === 'year') setCurrentDate(prev => subYears(prev, 1));
  };
  const handleNext = () => {
    if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
    else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else if (view === 'year') setCurrentDate(prev => addYears(prev, 1));
  };

  // Reset currentDate when view changes
  const handleViewChange = (v: string) => {
    setView(v as any);
    setCurrentDate(new Date());
  };

  const data: ChartData<'line'> = {
    datasets: [{
      label: 'Team Mood',
      data: filteredUpdates.map(update => ({
        x: new Date(update.created_at).getTime(),
        y: MOOD_VALUES[update.mood],
        name: update.user_name,
        mood: update.mood
      })) as any,
      borderColor: lineColor,
      backgroundColor: lineColor,
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.2,
      borderCapStyle: 'round',
      pointBackgroundColor: lineColor,
      pointBorderColor: lineColor
    }]
  };

  // Filter updates based on view
  const now = new Date();
  let xUnit: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day';
  if (view === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filteredUpdates = sortedUpdates.filter(u => new Date(u.created_at) >= start);
    xUnit = 'hour';
  } else if (view === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    filteredUpdates = sortedUpdates.filter(u => new Date(u.created_at) >= start);
    xUnit = 'day';
  } else if (view === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredUpdates = sortedUpdates.filter(u => new Date(u.created_at) >= start);
    xUnit = 'day';
  } else if (view === 'year') {
    const start = new Date(now.getFullYear(), 0, 1);
    filteredUpdates = sortedUpdates.filter(u => new Date(u.created_at) >= start);
    xUnit = 'month';
  } else if (view === 'all') {
    filteredUpdates = sortedUpdates;
    xUnit = 'month';
  }

  // Calculate min and max for the selected view
  let minForView: number | undefined = undefined;
  let maxForView: number | undefined = undefined;
  if (filteredUpdates.length > 0) {
    if (view === 'day') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      minForView = start.getTime();
      maxForView = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1).getTime();
    } else if (view === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      minForView = start.setHours(0, 0, 0, 0);
      maxForView = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    } else if (view === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      minForView = start.getTime();
      maxForView = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    } else if (view === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      minForView = start.getTime();
      maxForView = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
    } else if (view === 'all') {
      minForView = undefined;
      maxForView = undefined;
    }
  }

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
        offset: true,
        title: {
          display: false
        },
        type: 'time',
        min,
        max,
        time: {
          unit: xUnit,
          displayFormats: {
            hour: 'h a',
            day: 'EEE, MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
            year: 'yyyy'
          }
        },
        grid: {
          color: gridColor,
          drawOnChartArea: true,
          drawTicks: true
        },
        ticks: {
          color: textColor,
          font: {
            size: 14,
            weight: 'bold'
          },
          maxRotation: 0,
          minRotation: 0,
          source: 'auto',
          stepSize
        }
      },
      y: {
        offset: true,
        title: {
          display: false
        },
        min: 0.5,
        max: 4.5,
        grid: {
          color: gridColor,
          drawOnChartArea: true,
          drawTicks: true
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
        enabled: false,
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
            const update = filteredUpdates[item.dataIndex];
            if (update && update.user_name && update.mood) {
              return [
                `${update.user_name} ${moodStatements[update.mood as keyof typeof moodStatements]}\n`,
                `${update.user_name} posted "${update.content}"`
              ];
            }
            return '';
          }
        },
        external: (context) => {
          let tooltipEl = document.getElementById('chartjs-tooltip');
          
          // Create tooltip element if it doesn't exist
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.opacity = '1';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.background = 'white';
            tooltipEl.style.border = '1px solid #ccc';
            tooltipEl.style.borderRadius = '4px';
            tooltipEl.style.padding = '12px';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.transform = 'translate(-50%, 0)';
            tooltipEl.style.transition = 'all .1s ease';
            tooltipEl.style.maxWidth = '260px';
            tooltipEl.style.whiteSpace = 'pre-line';
            tooltipEl.style.wordBreak = 'break-word';
            document.body.appendChild(tooltipEl);
          }

          // Hide tooltip if no data
          if (context.tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          const tooltipModel = context.tooltip;
          const position = context.chart.canvas.getBoundingClientRect();

          // Set position
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.opacity = '1';

          // Set content
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map(bodyItem => bodyItem.lines);

            let innerHtml = '<div>';

            titleLines.forEach(title => {
              innerHtml += '<div style="font-weight: bold; margin-bottom: 8px;">' + title + '</div>';
            });

            bodyLines.forEach((body, i) => {
              body.forEach((line, j) => {
                if (j === 0) {
                  innerHtml += '<div style="margin-bottom: 8px;">' + line + '</div>';
                } else {
                  innerHtml += '<div>' + line + '</div>';
                }
              });
            });

            innerHtml += '</div>';
            tooltipEl.innerHTML = innerHtml;
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
      h={{ base: "340px", md: "440px", lg: "540px" }}
      px={{ base: 4, md: 10, lg: 16 }}
      py={10}
      my={8}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
    >
      <Flex mb={8} align="center" justify="space-between" w="100%">
        {/* Left: Today button */}
        <Button size="sm" onClick={() => {
          if (view === 'all') {
            setView('day');
          }
          setCurrentDate(new Date());
        }}>
          Today
        </Button>
        {/* Center: Arrows and period label */}
        <HStack spacing={2} justify="center" align="center" flex="1">
          <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} size="sm" onClick={handlePrev} isDisabled={view === 'all'} />
          <Text fontWeight="medium" fontSize="sm" minW="180px" maxW="180px" textAlign="center" noOfLines={1}>
            {periodLabel}
          </Text>
          <IconButton aria-label="Next" icon={<ChevronRightIcon />} size="sm" onClick={handleNext} isDisabled={view === 'all'} />
        </HStack>
        {/* Right: Dropdown */}
        <Select value={view} onChange={e => handleViewChange(e.target.value)} w="auto" maxW="180px">
          <option value="all">All Time</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </Select>
      </Flex>
      <Box w="100%" h="100%" minH={{ base: '220px', md: '320px', lg: '420px' }}>
        <Line data={data} options={options} style={{ width: '100%', height: '100%' }} />
      </Box>
    </Box>
  );
} 