import { db } from "~/utils/db.server";

type GroupByData = {
  property: string;
  type: string;
  propertyId: string;
};

type MetricData = {
  name: string;
  property: string;
  operation: string;
  propertyId: string;
};

type FilterData = {
  field: string;
  operator: string;
  value: string;
  fieldId: string;
};

type ComputedFieldData = {
  field_a: string;
  field_b: string;
  operator: string;
  field_a_id: string;
  field_b_id: string;
};

export type ChartConfigData = {
  entityId: string;
  tenantIds: string[];
  title: string;
  description: string;
  graphWidth?: string;
  entitySlug?: string;
  groupSlug: string;
  visualizationType: string;
  subGroupBy?: string[];
  timeGranularity?: string | null;
  dateField?: string | null;
  groupBy?: GroupByData[];
  metrics?: MetricData[];
  filters?: FilterData[];
  computedFields?: ComputedFieldData[];
};

export class DbService {
  async createChartConfig(data: ChartConfigData) {
    try {
      const transformedData = {
        entityId: data.entityId,
        tenantId: data.tenantIds,
        title: data.title,
        description: data.description,
        graphWidth: data.graphWidth,
        entitySlug: data.entitySlug,
        groupSlug: data.groupSlug,
        visualizationType: data.visualizationType,
        subGroupBy: data.subGroupBy ?? [],
        timeGranularity: data.timeGranularity ?? null,
        dateField: data.dateField ?? null,

        // Handling groupBy (proper array format)
        groupBy: data.groupBy?.length ? { create: data.groupBy.map((gb) => ({ property: gb.property, type: gb.type, propertyId: gb.propertyId })) } : undefined,

        // Handling metrics (proper array format)
        metrics: data.metrics?.length
          ? { create: data.metrics.map((m) => ({ name: m.name, property: m.property, operation: m.operation, propertyId: m.propertyId })) }
          : undefined,

        // Handling filters (proper array format)
        filters: data.filters?.length
          ? { create: data.filters.map((f) => ({ field: f.field, operator: f.operator, value: f.value, fieldId: f.fieldId })) }
          : undefined,

        // Handling computedFields (proper array format)
        computedFields: data.computedFields?.length
          ? {
              create: data.computedFields.map((cf) => ({
                fieldA: cf?.field_a,
                fieldB: cf?.field_b,
                operator: cf?.operator,
                field_a_id: cf?.field_a_id,
                field_b_id: cf?.field_b_id,
              })),
            }
          : undefined,
        // computesdFields: undefined,

        // Handling compareWith (one-to-one relation)
        // compareWith: data.compareWith
        //   ? { create: { entityId: data.compareWith.entityId, dateField: data.compareWith.dateField, timeShift: data.compareWith.timeShift } }
        //   : undefined,

        compareWith: undefined,
      };

      const createdData = await db.chartConfig.create({
        data: transformedData,
        include: {
          groupBy: true,
          metrics: true,
          filters: true,
          computedFields: true,
          compareWith: true,
        },
      });
      return createdData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getChartConfig(id: string) {
    try {
      const chartConfig = await db.chartConfig.findMany({
        where: {
          entityId: id,
        },
        include: {
          groupBy: true,
          metrics: true,
          filters: true,
          computedFields: true,
          compareWith: true,
        },
      });
      return { chartConfig: chartConfig };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getAllChartConfigs() {
    try {
      const data = await db.chartConfig.findMany({
        include: {
          groupBy: true,
          metrics: true,
          filters: true,
          computedFields: true,
          compareWith: true,
        },
      });

      return data;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getChartConfigById(id: string) {
    try {
      const chartConfigdData = await db.chartConfig.findUnique({
        where: { id: id },
        include: {
          groupBy: true, // Include related GroupBy data
          metrics: true, // Include related Metric data
          filters: true, // Include related Filter data
          computedFields: true, // Include related ComputedField data
          compareWith: true, // Include related CompareWith data
        },
      });

      return chartConfigdData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getChartConfigByEntitySlug(tenantId: string, entitySlug: string, groupSlug: string) {
    try {
      // const whereClause: any = {
      //   tenantId: {
      //     has: tenantId, // Assuming tenantId is an array of strings
      //   },
      //   entitySlug: entitySlug, // Assuming entitySlug is a variable
      //   groupSlug: groupSlug, // Assuming groupSlug is a variable
      // };

      const chartConfig = await db.chartConfig.findMany({
        where: { tenantId: { has: tenantId }, groupSlug: groupSlug, entitySlug: entitySlug },
        include: {
          groupBy: true, // Include related GroupBy data
          metrics: true, // Include related Metric data
          filters: true, // Include related Filter data
          computedFields: true, // Include related ComputedField data
          compareWith: true, // Include related CompareWith data
        },
      });
      return { chartConfig: chartConfig };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async updateChartConfig(chartConfigId: string, data: ChartConfigData) {
    try {
      await db.chartConfig.delete({
        where: { id: chartConfigId },
      });
      const newChartConfig = this.createChartConfig(data);
      return newChartConfig;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getGlobalChartConfig(tenantId: string, groupslug: string) {
    try {
      const chartConfig = await db.chartConfig.findMany({
        where: { tenantId: { has: tenantId }, groupSlug: groupslug, entitySlug: "" },
        include: {
          groupBy: true, // Include related GroupBy data
          metrics: true, // Include related Metric data
          filters: true, // Include related Filter data
          computedFields: true, // Include related ComputedField data
          compareWith: true, // Include related CompareWith data
        },
      });
      return { chartConfig: chartConfig };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async deleteChartConfig(chartId: string) {
    try {
      await db.chartConfig.delete({
        where: { id: chartId },
      });
    } catch (error) {
      return { success: false, error: error };
    }
  }
}
