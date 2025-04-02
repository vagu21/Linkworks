import { db } from "~/utils/db.server";
import { GraphApi } from "../routes/api/graphRoutes.Index.Api";
import { subWeeks, subMonths, subYears, startOfDay } from "date-fns";
import { useParams } from "@remix-run/react";
import PeriodHelper from "~/utils/helpers/PeriodHelper";

function fieldSelector(values: any[], propertyId: string): number | null {
  const found = values.find((item) => item.propertyId === propertyId);
  return found?.numberValue ?? null;
}

function extractIds(chartConfig: any) {
  const propertyIds: any = [];
  const fieldIds: any = [];
  const metricFields: any = [];
  const computedFieldIds: any = [];

  // Extract propertyId from groupBy
  chartConfig.groupBy.forEach((group: any) => {
    if (group.propertyId) {
      propertyIds.push(group.propertyId);
    }
  });

  // Extract fieldId from filters
  chartConfig.filters.forEach((filter: any) => {
    if (filter.fieldId) {
      fieldIds.push(filter.fieldId);
    }
  });

  chartConfig.metrics.forEach((metric: any) => {
    if (metric.propertyId) {
      metricFields.push(metric.propertyId);
    }
  });

  chartConfig?.computedFields.forEach((c: any) => {
    if (c.field_a_id && c.field_b_id) {
      computedFieldIds.push(c.field_a_id);
      computedFieldIds.push(c.field_b_id);
    }
  });

  const result = [...propertyIds, ...fieldIds];
  return { propertyIds, fieldIds, metricFields, computedFieldIds, result };
}

function calculate(num1: number | null, num2: number | null, operator: string) {
  if (num1 !== null && num2 !== null) {
    switch (operator) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      case "/":
        return num2 !== 0 ? num1 / num2 : null; // Avoid division by zero
      default:
        return null; // Invalid operator
    }
  }
  return null; // If any number is null
}

export async function getChartConfigWithChartData(chartConfigs: any, tenantId: string | null, request: Request) {
  for (let i = 0; i < chartConfigs?.chartConfig.length; i++) {
    const result = extractIds(chartConfigs?.chartConfig[i]);
    const fieldIds = result?.fieldIds;
    const propertyIds = result?.propertyIds;
    const metricFieldIds = result?.metricFields;
    const computedFieldIds = result?.computedFieldIds;
    const groupbyOptions = await db.property.findMany({
      where: {
        id: { in: propertyIds },
      },
      include: {
        options: true,
      },
    });
    let optionsArr = groupbyOptions[0]?.options.map((item) => item.value) || [];

    const filterOptions = await db.property.findMany({
      where: {
        id: { in: fieldIds },
      },
      include: {
        options: true,
      },
    });

    const operatorMapping: any = {
      ">": "gte",
      "<": "lte",
      "=": "equals",
      "!=": "not",
    };
    const numberConditions: any = chartConfigs?.chartConfig[i]?.filters.map((filter: any) => {
      if (filter.field != "") {
        const condition: any = { propertyId: filter.fieldId };
        const prismaOperator = operatorMapping[filter.operator] || "equals";
        const type = filterOptions.find((item) => item.id === filter.fieldId)?.type;
        if (type === 0) {
          condition.numberValue = { [prismaOperator]: Number(filter.value) };
        } else if (type === 1 || type === 8) {
          condition.textValue = { [prismaOperator]: filter.value };
        } else if (type === 2) {
          condition.dateValue = { [prismaOperator]: new Date(filter.value) };
        } else {
          condition.booleanValue = { [prismaOperator]: filter.value == "true" };
        }

        return condition;
      }
    });

    const filterType = chartConfigs?.chartConfig[i]?.timeGranularity;
    let dateFilter;
    const now = new Date();

    if (filterType === "one_week") {
      dateFilter = { gte: startOfDay(subWeeks(now, 1)) };
    } else if (filterType === "one_month") {
      dateFilter = { gte: startOfDay(subMonths(now, 1)) };
    } else if (filterType === "one_year") {
      dateFilter = { gte: startOfDay(subYears(now, 1)) };
    }


    if (filterType == "string") {

      const startDate = PeriodHelper.getGreaterThanOrEqualsFromRequest({ request });

      dateFilter = startDate ? { gte: new Date(startDate) } : undefined;
    }


    let rowWhere: any[] = [];

    if (optionsArr.length) {
      rowWhere.push({ values: { some: { textValue: { in: optionsArr } } } });
    }

    if (numberConditions.length) {
      rowWhere.push(...numberConditions.map((condition) => ({ values: { some: condition } })));
    }
    if (chartConfigs?.chartConfig[i].visualizationType == "stat chart") {
      if (metricFieldIds.length == 0 && computedFieldIds.length == 0) {
        const rows = await db.row.count({
          where: {
            tenantId: tenantId,
            entityId: chartConfigs?.chartConfig[i].entityId,
            createdAt: dateFilter,
            AND: [
              ...rowWhere,
              // { values: { some: { textValue: { in: optionsArr } } } }, // Any RowValue must have these statuses
              // ...numberConditions.map((condition) => ({ values: { some: condition } })),
            ],
          },
        });


        chartConfigs.chartConfig[i].chartData = rows;
        continue;
      } else {
        const rows = await db.row.findMany({
          where: {
            tenantId: tenantId,
            entityId: chartConfigs?.chartConfig[i].entityId,
            createdAt: dateFilter,
            AND: [
              ...rowWhere,
              // { values: { some: { textValue: { in: optionsArr } } } }, // Any RowValue must have these statuses
              // ...numberConditions.map((condition) => ({ values: { some: condition } })),
            ],
          },
          include: {
            values: true,
          },
        });


        let count: any = 0;
        if (metricFieldIds.length > 0) {
          rows.forEach((row) => {
            if (Array.isArray(row?.values)) {
              row.values.forEach((value) => {
                if (metricFieldIds.includes(value.propertyId)) {
                  count += Number(value.numberValue) ?? 0; // Add numberValue if it exists, else add 0
                }
              });
            }
          });
        }
        // else if (computedFieldIds.length > 0) {
        //   const operator = chartConfigs?.chartConfig[i]?.computedFields[0].operator;
        //   rows.forEach((row) => {

        //     const num1 = Number(fieldSelector(row?.values, computedFieldIds[0]));
        //     const num2 = Number(fieldSelector(row?.values, computedFieldIds[1]));

        //     count += calculate(num1, num2, operator);

        //   });
        // }
        else if (computedFieldIds.length > 0) {
          rows.forEach((row) => {
            for (let i = 0; i < computedFieldIds.length; i += 2) {
              const operator = chartConfigs?.chartConfig[i]?.computedFields[Math.floor(i / 2)]?.operator;

              const num1 = Number(fieldSelector(row?.values, computedFieldIds[i]));
              const num2 = Number(fieldSelector(row?.values, computedFieldIds[i + 1]));

              if (!isNaN(num1) && !isNaN(num2) && operator) {
                count += calculate(num1, num2, operator);
              }
            }
          });
        }

        chartConfigs.chartConfig[i].chartData = count;
        continue;
      }
    }

    const rows = await db.row.findMany({
      where: {
        tenantId: tenantId,
        entityId: chartConfigs?.chartConfig[i].entityId,
        createdAt: dateFilter,
        AND: [
          ...rowWhere,
          // { values: { some: { textValue: { in: optionsArr } } } }, // Any RowValue must have these statuses
          // ...numberConditions.map((condition) => ({ values: { some: condition } })),
        ],
      },
      include: {
        values: true, // Ensure RowValues are included
      },
    });

    let textValueCounts;

    if (computedFieldIds.length == 0) {
      textValueCounts = optionsArr.reduce((acc, textValue) => {
        acc[textValue] = rows.filter((row) => row?.values.some((v) => v.textValue === textValue)).length;
        return acc;
      }, {});
    }
    // const metricId = ["cm88ajxiz03lr5ibu4n03ayp8"]; // The propertyId for "Open"
    else if (computedFieldIds.length) {
      const textValueMap: Record<string, number[]> = optionsArr.reduce((acc, textValue) => {
        const matchingRows = rows.filter((row) => row?.values.some((v) => v.textValue === textValue));

        acc[textValue] = matchingRows
          .flatMap((row) => {
            const results: number[] = [];

            // Loop through all computed fields in pairs
            for (let j = 0; j < computedFieldIds.length; j += 2) {
              const num1 = Number(fieldSelector(row?.values, computedFieldIds[j]));
              const num2 = Number(fieldSelector(row?.values, computedFieldIds[j + 1]));
              const operator = chartConfigs?.chartConfig[i]?.computedFields[Math.floor(j / 2)]?.operator;

              if (!isNaN(num1) && !isNaN(num2) && operator) {
                results.push(calculate(num1, num2, operator));
              }
            }

            return results;
          })
          .filter((num) => num !== null) as number[];

        return acc;
      }, {} as Record<string, number[]>);

      const maxJobs = Math.max(...Object.values(textValueMap).map((values) => values.length || 0), 1);

      textValueCounts = Object.fromEntries(
        Object.entries(textValueMap).map(([key, values]) => {
          const jobFields: Record<string, number> = values.reduce(
            (acc, num, index) => ({
              ...acc,
              [`job${index + 1}`]: num,
            }),
            {}
          );
          for (let i = 1; i <= maxJobs; i++) {
            if (!jobFields[`job${i}`]) {
              jobFields[`job${i}`] = 0;
            }
          }

          return [key, jobFields];
        })
      );

      // textValueCounts = Object.fromEntries(Object.entries(textValueMap).map(([key, values]) => [key, values?.reduce((sum, num) => sum + num, 0)]));
    }

    const colors = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

    console.log("jobssss", textValueCounts);
    if (chartConfigs?.chartConfig[i].visualizationType == "trend chart") {
      const chartData: any = Object.entries(textValueCounts).map(([status, jobs], index) => {
        // const fillColor = index < colors.length ? `hsl(var(${colors[index]}))` : `hsl(var(${colors[index % colors.length]}))`;

        // const jobEntries = typeof jobs === "object" && jobs !== null && Object.keys(jobs).length > 0 ? jobs : { job1: 0, job2: 0 };
        // let jobEntries
        // if (chartConfigs?.chartConfig[i].visualizationType == "stat chart") {
        const jobEntries =
          typeof jobs === "object" && jobs !== null && Object.keys(jobs).length > 0 ? jobs : Object.fromEntries(Object.keys(jobs || {}).map((key) => [key, 0]));

        return {
          status,
          ...jobEntries,
        };
      });
      chartConfigs.chartConfig[i].chartData = chartData;
      continue;
    }

    const chartData: any = Object.entries(textValueCounts).map(([status, job], index) => {
      const fillColor = index < colors.length ? `hsl(var(${colors[index]}))` : `hsl(var(${colors[index % colors.length]}))`;

      return {
        status,
        job,
        ...(chartConfigs?.chartConfig[i]?.visualizationType == "line chart" ? {} : { fill: fillColor }), // Conditionally add `fill`
      };
    });
    chartConfigs.chartConfig[i].chartData = chartData;
  }
}

export async function getChartConfigs(tenant: any, group: any, tenantId: string | null, request: Request) {
  const graphapi = new GraphApi();
  const chartConfig: any = await graphapi.getGlobalGraphConfig(tenant, group);
  await getChartConfigWithChartData(chartConfig, tenantId, request);

  return chartConfig;
}
