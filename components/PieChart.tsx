"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

// Define the type for each data point in the pie chart
type ChartDataPoint = {
  category: string;
  count: number;
  fill: string;
};

const chartConfig = {
  count: {
    label: "Count",
  },
  hr: {
    label: "hr",
    color: "hsl(var(--chart-1))",
  },
  finance: {
    label: "finance",
    color: "hsl(var(--chart-2))",
  },
  it: {
    label: "it",
    color: "hsl(var(--chart-3))",
  },
  operations: {
    label: "operations",
    color: "hsl(var(--chart-4))",
  },
  marketing: {
    label: "marketing",
    color: "hsl(var(--chart-5))",
  },
  management: {
    label: "management",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function PieChartComponent() {
  const { data: session } = useSession();

  // Use the ChartDataPoint type for the chartData state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const orgId = session?.user?.oid;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/chart/pie?orgId=${orgId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }
        const issues = await response.json();
        const data = issues.map((issue: any) => {
          const category = issue.category || "unknown"; // Default to "unknown" if category is undefined
          return {
            category,
            count: issue.count,
            fill: `var(--color-${String(category).toLowerCase()})`,
          };
        });
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="chart shadow-none border-none ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>Category Breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Showing total counts for each category
        </div>
      </CardFooter>
    </Card>
  );
}
