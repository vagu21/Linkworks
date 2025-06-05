import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { requireAuth } from "~/utils/loaders.middleware";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";
import AgentSummary from "~/modules/shoprite/components/AgentSummary";

type LoaderData = {
  title: string;
  agentData: {
    coinsAvailable: number;
    currentMilestone: number;
    coinsSpent: number;
    rewards: Array<{
      id: string;
      title: string;
      status: 'claimed' | 'unclaimed' | 'locked';
      claimedDate?: string;
      code?: string;
    }>;
    activityHistory: Array<{
      id: string;
      type: 'reward' | 'coins_debited' | 'milestone';
      title: string;
      description: string;
      date: string;
      amount?: number;
    }>;
  };
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAuth({ request, params });
  const tenantId = await getTenantIdOrNull({ request, params });
  
  // Mock data matching the UI from the images
  const data: LoaderData = {
    title: `Shoprite Agents | ${process.env.APP_NAME}`,
    agentData: {
      coinsAvailable: 250,
      currentMilestone: 250,
      coinsSpent: 250,
      rewards: [
        {
          id: '1',
          title: 'Reward 1',
          status: 'unclaimed'
        },
        {
          id: '2',
          title: 'Reward 1',
          status: 'locked'
        },
        {
          id: '3',
          title: 'Reward 1',
          status: 'locked'
        },
        {
          id: '4',
          title: 'Reward 1',
          status: 'locked'
        },
        {
          id: '5',
          title: 'Reward 1',
          status: 'claimed',
          claimedDate: 'May 23, 05:45pm',
          code: 'CODE2'
        }
      ],
      activityHistory: [
        {
          id: '1',
          type: 'reward',
          title: 'Reward 1',
          description: 'Claimed on : May 23, 05:45pm',
          date: 'May 23, 05:45pm'
        },
        {
          id: '2',
          type: 'coins_debited',
          title: 'Coins Debited',
          description: 'Debited on : May 23, 05:45pm',
          date: 'May 23, 05:45pm',
          amount: -50
        },
        {
          id: '3',
          type: 'reward',
          title: 'Reward 1',
          description: 'Claimed on : May 23, 05:45pm',
          date: 'May 23, 05:45pm'
        },
        {
          id: '4',
          type: 'reward',
          title: 'Reward 1',
          description: 'Claimed on : May 23, 05:45pm',
          date: 'May 23, 05:45pm'
        },
        {
          id: '5',
          type: 'milestone',
          title: 'Milestone reached',
          description: 'Reached on : May 23, 05:45pm',
          date: 'May 23, 05:45pm'
        },
        {
          id: '6',
          type: 'reward',
          title: 'Reward Unlocked',
          description: 'Unlocked on : May 23, 05:45pm',
          date: 'May 23, 05:45pm'
        }
      ]
    }
  };
  return json(data);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data?.title }];

export default function AgentsRoute() {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AgentSummary agentData={data.agentData} />
      </div>
    </div>
  );
}