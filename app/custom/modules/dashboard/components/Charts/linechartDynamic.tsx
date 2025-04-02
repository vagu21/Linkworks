"use client"

import React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

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

interface LineChartProps {
    chartData: any[]
    lineColor?: string
    charTitle: string
    charSubTitle: string
    chartDescription?: string
}

function LineChartComponent({ chartData, lineColor = "#2563eb", charTitle, charSubTitle, chartDescription }: LineChartProps) {
    
    let keys: any = [];
    if (chartData.length) keys = Object.keys(chartData[0]);
    const [dataKeyXAxis, setDataKeyXAxis] = React.useState(keys.length ? keys[0] : "")
    const [dataKeyYAxis, setDataKeyYAxis] = React.useState(keys.length ? keys[1] : "")

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: `${lineColor}`,
        },
        mobile: {
            label: "Mobile",
            color: "#60a5fa",
        },
    } satisfies ChartConfig

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-4">
                <CardTitle>{charTitle}</CardTitle>
                <CardDescription>{charSubTitle}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 w-full">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={chartData}>
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
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey={dataKeyYAxis} stroke={lineColor} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground flex gap-2">
                    {chartDescription}
                </div>
            </CardFooter>
        </Card>
    )
}

export default LineChartComponent
