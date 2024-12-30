export const getRainDescription = (rain, showers) => {
    const rainIntensity = Math.max(rain || 0, showers || 0);
    if (rainIntensity < 0.2) return "It's raining slightly";
    if (rainIntensity < 0.5) return "It's raining moderately";
    if (rainIntensity < 1) return "It's raining heavily";
    if (rainIntensity >= 1) return "It's raining very heavily";
    return "It's not raining";
};
  
export const getSnowfallDescription = (snowfall) =>
    snowfall > 0 ? "It's snowing" : "";
  
export const getCloudCoverDescription = (cloudCover) => {
    if (cloudCover >= 0 && cloudCover < 20) return "Clear";
    if (cloudCover >= 20 && cloudCover <= 40) return "Partially cloudy";
    if (cloudCover > 40 && cloudCover <= 70) return "Mostly cloudy";
    if (cloudCover > 70 && cloudCover <= 100) return "Overcast";
    return "";
};
  
export const getTimeOfDay = (isDay) => (isDay === 1 ? "Day" : "Night");
