import BarChartComponent from "~/custom/modules/dashboard/components/Charts/barChart";
import LineChartComponent from "~/custom/modules/dashboard/components/Charts/linechartDynamic";
import { PieDonutChart } from "~/custom/modules/dashboard/components/Charts/pieDonutChart";
import StatCard from "~/custom/modules/dashboard/components/Statcards";
import { TrendLineChartComponent } from "../../dashboard/components/Charts/linechart";

const MasterGraphComponent = ({ chartConfig }: any) => {
  function greedyPairGraphs(graphs: any) {
    const sortedGraphs = [...graphs].sort((a, b) => Number(b.graphWidth) - Number(a.graphWidth)); // Sort descending
    const rows = [];
    const used = new Set();

    const getGraphs = (width:any) => sortedGraphs.filter(g => Number(g.graphWidth) === width && !used.has(g));
    // Step 1: Add all 100% width graphs individually
    for (const graph of getGraphs(100)) {
      rows.push([graph]);
      used.add(graph);
    }

    // Step 2: Pair 75% width graphs with 25% width graphs
    let seventyFives = getGraphs(75);
    let twentyFives = getGraphs(25);
    while (seventyFives.length > 0) {
      let row = [seventyFives.shift()];
      if (twentyFives.length > 0) {
        row.push(twentyFives.shift());
      }
      row.forEach((g) => used.add(g));
      rows.push(row);
    }


    // Step 3: Pair 50% width graphs together
    let fifties = getGraphs(50);
    while (fifties.length >= 2) {
      let row = [fifties.shift(), fifties.shift()];
      row.forEach(g => used.add(g));
      rows.push(row);
    }

    // If there's one 50 left, pair it with a 25
    if (fifties.length === 1 && twentyFives.length > 1) {
      let row = [fifties.shift(), twentyFives.shift(), twentyFives.shift()];
      row.forEach(g => used.add(g));
      rows.push(row);

      
    } else if (fifties.length === 1 && twentyFives.length > 0) {
      let row = [fifties.shift(), twentyFives.shift()];
      row.forEach(g => used.add(g));
      rows.push(row);

      
    }else if (fifties.length === 1) {
      // rows.push([fifties.shift()]);
      // used.add(fifties[0]);
      const remainingFifty = fifties.shift();
      if (remainingFifty) {
        rows.push([remainingFifty]);
        used.add(remainingFifty);
      }
    }

    

    // Step 4: Group remaining 25% width graphs (up to 4 per row)
    twentyFives = getGraphs(25);
    while (twentyFives.length > 0) {
      let row = twentyFives.splice(0, 4);
      row.forEach(g => used.add(g));
      rows.push(row);
    }

    return rows;
  }

  const groupedRows = greedyPairGraphs(chartConfig);
  console.log("groupedRows", groupedRows);

  return (
    <div className="flex flex-col gap-4">
      {groupedRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full gap-4">
          {row.map((config: any, index: any) => {
            const { visualizationType, chartData, title, charSubTitle, description } = config;
            const graphWidth = row.length === 1 ? `100%` : `${config.graphWidth}%`;

            return (
              <div key={index} style={{ width: graphWidth }}>
                {(() => {
                  switch (visualizationType.toLowerCase()) {
                    case "stat chart":
                      return (
                        typeof chartData === "number" && (
                          <StatCard charTitle={title} charSubTitle={charSubTitle} chartDescription={description} numericData={chartData} />
                        )
                      );
                    case "bar chart":
                      return (
                        chartData && <BarChartComponent chartData={chartData} charTitle={title} charSubTitle={charSubTitle} chartDescription={description} />
                      );
                    case "pie chart":
                      return chartData && <PieDonutChart chartData={chartData} charTitle={title} charSubTitle={charSubTitle} chartDescription={description} />;
                    case "line chart":
                      return (
                        chartData && <LineChartComponent chartData={chartData} charTitle={title} charSubTitle={charSubTitle} chartDescription={description} />
                      );
                    case "trend chart":
                      return (
                        chartData && <TrendLineChartComponent data={chartData} charTitle={title} charSubTitle={charSubTitle} chartDescription={description} />
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MasterGraphComponent;
