"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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

const initialChartData = [
  { month: "January", count: 186 },
  { month: "February", count: 305 },
  { month: "March", count: 237 },
  { month: "April", count: 273 },
  { month: "May", count: 209 },
  { month: "June", count: 214 },
];

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function RadarChartComponent() {
  const { data: session } = useSession();

  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const orgId = session?.user?.oid;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}dashboard/chart/radar?orgId=${orgId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
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
        <CardTitle>Radar Chart</CardTitle>
        <CardDescription>
          Showing total issues resolved for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="month" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill="var(--color-count)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
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
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          January - June 2024
        </div>
      </CardFooter>
    </Card>
  );
}
