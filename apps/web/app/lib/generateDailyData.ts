export const generateDailyData = ({
  startDate,
  endDate,
  min,
  max,
  variance,
  weekendReduction,
}: {
  startDate: Date;
  endDate: Date;
  min: number;
  max: number;
  variance: number;
  weekendReduction: boolean;
}) => {
  const data: { date: Date; value: number }[] = [];
  const currentDate = startDate;

  // Initialize previous values with average values for each category
  let previousValue = (min + max) / 2; // Initialize with mid-point value
  let momentum = 0; // Track momentum for each category

  while (currentDate <= endDate) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6; // 0 = Sunday, 6 = Saturday

    const result = generateRandomData({
      previousValue,
      min,
      max,
      variance,
      isWeekend,
      weekendReduction,
      momentum,
    });

    data.push({ date: new Date(currentDate), value: result.value });
    previousValue = result.value;
    momentum = result.momentum;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

const generateRandomData = ({
  previousValue,
  min,
  max,
  variance,
  isWeekend,
  weekendReduction,
  momentum,
}: {
  previousValue: number;
  min: number;
  max: number;
  variance: number;
  isWeekend: boolean;
  weekendReduction: boolean;
  momentum: number;
}) => {
  let drift = (Math.random() - 0.5) * 2 * variance;
  drift += momentum; // Apply momentum

  let randomValue = previousValue * (1 + drift);

  // Ensure the value stays within the specified min and max bounds with stronger correction
  if (randomValue < min) {
    randomValue = min + (min - randomValue) * 0.2; // Apply stronger correction if below min
  } else if (randomValue > max) {
    randomValue = max - (randomValue - max) * 0.2; // Apply stronger correction if above max
  }

  if (isWeekend && weekendReduction) {
    const reductionFactor = 1 - (Math.random() * 0.15 + 0.1); // Reduce by 10-25%
    randomValue *= reductionFactor;
  }

  return {
    value: Math.round(randomValue),
    // Calculate new momentum based on the current drift
    momentum: drift * 0.5, // Adjust momentum scaling factor as needed
  };
};
