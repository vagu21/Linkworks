"use client"

import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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


interface BarChartProps {
    chartData: any[]
    barColor?: string
    charTitle: string,
    charSubTitle: string,
    chartDescription?: string
}

function BarChartComponent({ chartData, barColor = "#2563eb", charTitle, charSubTitle, chartDescription }: BarChartProps) {

    let keys: any = [];
    if (chartData.length) keys = Object.keys(chartData[0]);
    const [dataKeyXAxis, setDataKeyXAxis] = React.useState(keys?.length ? keys[0] : "")
    const [dataKeyYAxis, setDataKeyYAxis] = React.useState(keys.length ? keys[1] : "")
    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: `${barColor}`,
        },
        mobile: {
            label: "Mobile",
            color: "#60a5fa",
        },
    } satisfies ChartConfig

    return (
        <>
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-4">
                    <CardTitle>{charTitle}</CardTitle>
                    <CardDescription>{charSubTitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 w-full">

                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey={dataKeyXAxis}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                              <YAxis
                                dataKey={dataKeyYAxis}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey={dataKeyYAxis} fill="var(--color-desktop)" radius={4} barSize={80} />
                          
                        </BarChart>

                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">

                    <div className="leading-none text-muted-foreground flex gap-2">
                        {chartDescription}
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}

export default BarChartComponent