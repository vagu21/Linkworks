import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"

import { lazy, Suspense } from 'react';

const CountUp = lazy(() => import('react-countup'));

const StatCard = ({ charTitle = "", charSubTitle = "", chartDescription = "", numericData }: any) => {
    
    return (
        <>
            <Card className="flex flex-col h-full justify-center text-center">
                <CardHeader className="items-center pb-0">
                    {charTitle && <CardTitle style={{ lineHeight: "1.2" }}>{charTitle}</CardTitle>}
                    {charSubTitle && <CardDescription>{charSubTitle}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 pb-0">

                    <div className='flex justify-center h-full'>
                        <div className='text-4xl flex font-bold !items-center'>
                            {typeof numericData === "number" ?

                                <>
                                    <Suspense fallback={<span>0</span>}>
                                        <CountUp end={typeof numericData === "number" ? numericData : 0} delay={1} />
                                    </Suspense>
                                </>
                                : null}                       </div>

                    </div>

                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                    </div>
                    {chartDescription && <div className="leading-none text-muted-foreground ">
                        {chartDescription}
                    </div>}
                </CardFooter>
            </Card>
        </>
    )
}

export default StatCard