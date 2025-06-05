import React, { useState } from "react";
import { Copy, Gift, Calendar, DollarSign, Target, Unlock } from "lucide-react";

interface AgentData {
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
}

interface Props {
  agentData: AgentData;
}

export default function AgentSummary({ agentData }: Props) {
  const [activeTab, setActiveTab] = useState<'unclaimed' | 'claimed'>('unclaimed');

  const unclaimedRewards = agentData.rewards.filter(r => r.status === 'unclaimed');
  const claimedRewards = agentData.rewards.filter(r => r.status === 'claimed');
  const lockedRewards = agentData.rewards.filter(r => r.status === 'locked');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="h-5 w-5 text-red-500" />;
      case 'coins_debited':
        return <DollarSign className="h-5 w-5 text-gray-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-500" />;
      default:
        return <Unlock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <span>Recruitment</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Candidates</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Agent Summary</h1>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Coins Available */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coins Available</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{agentData.coinsAvailable}</p>
                <p className="mt-1 text-sm text-gray-500">Total coins in your wallet</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Current Milestone */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Milestone</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{agentData.currentMilestone}</p>
                <p className="mt-1 text-sm text-gray-500">Milestone Achieved</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <Target className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Coins Spent */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coins Spent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{agentData.coinsSpent}</p>
                <p className="mt-1 text-sm text-gray-500">Total Coins Spent</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="rounded-lg bg-white shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('unclaimed')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'unclaimed'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Unclaimed Rewards
              </button>
              <button
                onClick={() => setActiveTab('claimed')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'claimed'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Claimed Rewards
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'unclaimed' && (
              <div className="space-y-4">
                {unclaimedRewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-red-100 p-2">
                        <Gift className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reward.title}</p>
                        <p className="text-sm text-gray-500">Unlocked</p>
                      </div>
                    </div>
                    <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                      Claim Reward
                    </button>
                  </div>
                ))}
                
                {lockedRewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-gray-100 p-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reward.title}</p>
                        <p className="text-sm text-gray-500">Unlocked</p>
                      </div>
                    </div>
                    <button className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
                      Locked
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'claimed' && (
              <div className="space-y-4">
                {claimedRewards.map((reward) => (
                  <div key={reward.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-red-100 p-2">
                          <Gift className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{reward.title}</p>
                          <p className="text-sm text-gray-500">Claimed on : {reward.claimedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                          <Copy className="h-4 w-4" />
                          <span>Copy Code</span>
                        </button>
                      </div>
                    </div>
                    {reward.code && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="rounded bg-gray-100 px-3 py-1 text-sm font-mono text-gray-700">{reward.code}</span>
                        <Copy className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity History Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-medium text-gray-900">Activity history</h3>
        <div className="space-y-4">
          {agentData.activityHistory.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.amount && (
                    <span className={`text-sm font-medium ${activity.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}