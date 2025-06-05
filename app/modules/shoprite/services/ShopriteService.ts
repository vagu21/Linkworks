import { RowWithDetails } from "~/utils/db/entities/rows.db.server";

export interface ShopriteSummaryDto {
  agents: number;
  rewards: number;
  totalCoins: {
    value: number;
    count: number;
  };
  data: {
    recentAgents: RowWithDetails[];
  };
}

export default {
  getSummary: async (tenantId: string | null): Promise<ShopriteSummaryDto> => {
    // Mock data for now - in a real implementation, this would query the database
    return {
      agents: 150,
      rewards: 45,
      totalCoins: {
        value: 125000,
        count: 500
      },
      data: {
        recentAgents: []
      }
    };
  }
};