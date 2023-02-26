export interface IStatsDTO {
  totalClicks: number;
  highestClicked: string;
  lowestClicked: string;
  highestClicks?: number;
  lowestClicks?: number;
  urls: URLType;
}

interface URLType {
  urls: string[];
  clicks: number[];
}
