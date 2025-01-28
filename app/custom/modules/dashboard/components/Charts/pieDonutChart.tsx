"use client"

import * as React from "react"
import { Label, Legend, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"




export function PieDonutChart({ chartData, charTitle, chartSubTitle, chartDescription }: any) {

  if (chartData.length == 0) return <></>
  const keys = Object.keys(chartData[0]);
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc: any, curr: any) => acc + curr?.[keys[1]], 0)
  }, [chartData])

  chartData.forEach((item: any) => {

    item[keys[1]]
  });

  const chartConfig = {
    candidate: {
      label: "candidate",
    },
    Proposed: {
      label: "Proposed",
      color: "hsl(var(--chart-1))",
    },
    Interviewing: {
      label: "Interviewing",
      color: "#2563eb",
    },
    Selected: {
      label: "Selected",
      color: "#2563eb",
    },
    Rejected: {
      label: "Rejected",
      color: "#60a5fa",
    },
    Hold: {
      label: "Hold",
      color: "#2563eb",
    },
    Cancelled: {
      label: "Cancelled",
      color: "#60a5fa",
    },
    Banned: {
      label: "Banned",
      color: "#2563eb",
    },

  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{charTitle}</CardTitle>
        <CardDescription>{chartSubTitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">

        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey={keys[1]}
              nameKey={keys[0]}
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
                          {keys[1][0].toUpperCase() + keys[1].slice(1) + 's'}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <Legend
            layout="horizontal" // 'horizontal' or 'vertical'
            align="center" // 'left', 'center', or 'right'
            verticalAlign="bottom" // 'top', 'middle', or 'bottom'
          />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
        </div>
        <div className="leading-none text-muted-foreground flex gap-2">
          {chartDescription}
        </div>
      </CardFooter>
    </Card>
  )
}

export default PieDonutChart
