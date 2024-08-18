"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSession } from 'next-auth/react';

// Define the type for each data point
type ChartDataPoint = {
  month: string;
  count: number;
};
const chartConfig = {
  issues: {
    label: "Issues",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function LineChartComponent() {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchChartData = async () => {
    try {
      const orgId = session?.user?.oid;  // Replace with actual orgId or fetch dynamically if needed
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/chart/line?orgId=${orgId}`
      );
      setChartData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setLoading(false);
    }
  };

  fetchChartData();
}, []);


  // Calculate the trend using the last two months' data
  const trend = useMemo(() => {
    if (chartData.length < 2) return null; // Not enough data to determine trend
    const lastMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2];
    const trendPercentage =
      ((lastMonth.count - previousMonth.count) / previousMonth.count) * 100;

    return {
      isUp: trendPercentage > 0,
      percentage: Math.abs(trendPercentage).toFixed(1), // Convert to 1 decimal place
    };
  }, [chartData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="chart shadow-none border-none ">
      <CardHeader>
        <CardTitle>Issues Over Time</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="count"
              type="natural"
              stroke="var(--color-issues)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend && (
            <>
              {trend.isUp ? (
                <span className="text-green-600">
                  Trending up by {trend.percentage}% this month{" "}
                  <TrendingUp className="h-4 w-4 inline" />
                </span>
              ) : (
                <span className="text-red-600">
                  Trending down by {trend.percentage}% this month{" "}
                  <TrendingDown className="h-4 w-4 inline" />
                </span>
              )}
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total issues for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
