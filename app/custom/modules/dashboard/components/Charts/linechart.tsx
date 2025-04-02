"use client";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TrendLineChartComponent({ data, charTitle, charSubTitle, chartDescription }: any) {
  if (!data.length) return null;
  const keys = Object.keys(data[0]);

  return (
    <Card className="flex w-full flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>{charTitle}</CardTitle>
        <CardDescription>{charSubTitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart width={400} height={200} accessibilityLayer data={data} margin={{ top: 20, left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={keys[0]} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            {keys.slice(1).map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                type="natural"
                stroke={`var(--color-${index === 0 ? "desktop" : "mobile"})`}
                strokeWidth={2}
                dot={{ fill: `var(--color-${index === 0 ? "desktop" : "mobile"})` }}
                activeDot={{ r: 6 }}
              >
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} formatter={(value) => Number(value).toFixed(2)} />
              </Line>
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground flex gap-2 leading-none">{chartDescription}</div>
      </CardFooter>
    </Card>
  );
}
