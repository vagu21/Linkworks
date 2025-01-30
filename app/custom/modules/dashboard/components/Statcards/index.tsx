import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"

import CountUp from 'react-countup';

const StatCard = ({ charTitle, charSubTitle, chartDescription, numericData }: any) => {
    return (
        <>
            <Card className="flex flex-col  h-[200px] justify-center text-center">
                <CardHeader className="items-center pb-0">
                    <CardTitle style={{  lineHeight: "1.2" }}>{charTitle}</CardTitle>
                    <CardDescription>{charSubTitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">

                    <div className='flex justify-center'>
                        <div className='text-4xl font-bold items-center mt-4'>
                        <CountUp end={numericData} delay={1}  />
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                    </div>
                    <div className="leading-none text-muted-foreground ">
                        {chartDescription}
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}

export default StatCard