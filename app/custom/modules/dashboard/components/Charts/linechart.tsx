"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

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

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function LineChartComponent({ data, barColor = "#2563eb", charTitle, charSubTitle, chartDescription }: any) {
    const keys = Object.keys(data[0]);
    return (

        <Card className="flex flex-col w-full">
            <CardHeader className="items-center pb-2">
                <CardTitle>{charTitle}</CardTitle>
                <CardDescription>{charSubTitle}</CardDescription>
            </CardHeader>
            <CardContent className=" flex-1 pb-0">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart
                        width={400} height={200}
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={keys[0]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey={keys[1]}
                            type="natural"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-desktop)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                        <Line
                            dataKey={keys[2]}
                            type="natural"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-mobile)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>

                </ChartContainer>


            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">

                </div>
                <div className="leading-none text-muted-foreground flex gap-2">
                    {chartDescription}  <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>


    )
}
