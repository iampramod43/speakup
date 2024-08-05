"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function RadialChartComponent() {
  const [chartData, setChartData] = useState([
    { browser: "safari", visitors: 0, fill: "var(--color-safari)" },
  ]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState({ isUp: true, percentage: 0 });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BASE_URL + "dashboard/chart/radial"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }
        const data = await response.json();
        // Assume response is like { count: 31 }
        const currentVisitors = data.count;
        setChartData([
          { browser: "safari", visitors: currentVisitors, fill: "var(--color-safari)" },
        ]);

        // Example trend calculation based on hypothetical previous month's data
        const previousMonthVisitors = 25; // This is a placeholder for example purposes
        const trendPercentage =
          ((currentVisitors - previousMonthVisitors) / previousMonthVisitors) *
          100;
        setTrend({
          isUp: trendPercentage > 0,
          percentage: parseFloat(Math.abs(trendPercentage).toFixed(1)), // Convert string to number
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="chart shadow-none border-none ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Shape</CardTitle>
        <CardDescription>Showing total issues</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={360} // Ensuring full circle
            innerRadius={80}
            outerRadius={140}
            startAngle={90} // Starting from top
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          issues
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
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
        <div className="leading-none text-muted-foreground">
          Showing total issues
        </div>
      </CardFooter>
    </Card>
  );
}
