"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { useSession } from "next-auth/react";

// Define the type for each chart data point
type ChartData = {
  month: string;
  Finance: number;
  HR: number;
  IT: number;
  Marketing: number;
  Operations: number;
};

// Define the initial chart data
const initialChartData: ChartData[] = [
  { month: "February", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "March", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "April", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "May", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "June", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "July", Finance: 1, HR: 1, IT: 1, Marketing: 1, Operations: 1 },
  { month: "August", Finance: 0, HR: 1, IT: 0, Marketing: 0, Operations: 0 },
];

const chartConfig: ChartConfig = {
  Finance: {
    label: "Finance",
    color: "hsl(var(--chart-1))",
  },
  HR: {
    label: "HR",
    color: "hsl(var(--chart-2))",
  },
  IT: {
    label: "IT",
    color: "hsl(var(--chart-3))",
  },
  Marketing: {
    label: "Marketing",
    color: "hsl(var(--chart-4))",
  },
  Operations: {
    label: "Operations",
    color: "hsl(var(--chart-5))",
  },
};

export default function AreaChartComponent() {
  const { data: session } = useSession();

  const [chartData, setChartData] = useState<ChartData[]>(initialChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const orgId = session?.user?.oid;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/chart/area?orgId=${orgId}`
        );
        const formattedData: ChartData[] = response.data.map((item: any) => {
          return {
            month: item.month,
            ...item,
          };
        });
        setChartData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Calculate the trend by summing the values for each month
  const trend = useMemo(() => {
    if (chartData.length < 2) return null; // Not enough data to determine trend
    const lastMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2];

    // Calculate the total for each month using type-safe keys
    const lastMonthTotal = (Object.keys(chartConfig) as Array<keyof ChartData>).reduce(
      (sum, key) => sum + Number(lastMonth[key]),
      0
    );
    const previousMonthTotal = (Object.keys(chartConfig) as Array<keyof ChartData>).reduce(
      (sum, key) => sum + Number(previousMonth[key]),
      0
    );

    const trendPercentage =
      ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

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
        <CardTitle>Area Chart - Stacked</CardTitle>
        <CardDescription>
          Showing department data for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
              content={<ChartTooltipContent indicator="dot" />}
            />
            {(Object.keys(chartConfig) as Array<keyof ChartData>).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {trend && (
              <div className="flex items-center gap-2 font-medium leading-none">
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
              </div>
            )}
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              February - August 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
