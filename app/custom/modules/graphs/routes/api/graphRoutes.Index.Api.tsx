import { ChartConfigData, DbService } from "../../db/graph.db.server";

export class GraphApi {
  private dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async postGraphConfig(data: ChartConfigData) {
    try {
      const createdData = await this.dbService.createChartConfig(data);
      return createdData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async updateChartConfig(chartConfigId: string, data: ChartConfigData) {
    try {
      const updatedData = await this.dbService.updateChartConfig(chartConfigId, data);
      return updatedData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getGlobalGraphConfig(tenantId: string, groupSlug: string) {
    try {
      const chartConfigdData = await this.dbService.getGlobalChartConfig(tenantId, groupSlug);
      return chartConfigdData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getEntityGraphConfig(tenantId: string, entitySlug: string, groupSlug: string) {
    try {
      const chartConfigData = await this.dbService.getChartConfigByEntitySlug(tenantId, entitySlug, groupSlug);
      return chartConfigData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getgraphConfigById(id: string) {
    try {
      const chartConfigdData = await this.dbService.getChartConfigById(id);
      return chartConfigdData;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async deleteChart(chartId: string) {
    try {
      const deletedChart = await this.dbService.deleteChartConfig(chartId);
      return deletedChart;
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getAllGraphConfigs() {
    try {
      const chartConfigData = await this.dbService.getAllChartConfigs();
      return chartConfigData;
    } catch (error) {
      return { success: false, error: error };
    }
  }
}
