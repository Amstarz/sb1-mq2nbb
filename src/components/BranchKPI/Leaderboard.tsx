import React from 'react';
import { Trophy, TrendingUp, Medal, Users, Package } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  totalAmount: number;
  totalBoxes: number;
  totalInvoices: number;
  salespeople: number;
}

interface LeaderboardProps {
  branches: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ branches }) => {
  const sortedBranches = [...branches].sort((a, b) => b.totalAmount - a.totalAmount);
  const topBranches = sortedBranches.slice(0, 10); // Show top 10

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-500'; // Gold
      case 1:
        return 'text-gray-400'; // Silver
      case 2:
        return 'text-amber-600'; // Bronze
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-medium text-gray-900">Top Performing Branches</h3>
      </div>

      <div className="space-y-4">
        {topBranches.map((branch, index) => (
          <div
            key={branch.name}
            className={`flex items-center justify-between p-4 rounded-lg ${
              index < 3 ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700">
                    {branch.name.charAt(0)}
                  </span>
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                  index < 3 ? 'bg-white' : 'bg-gray-100'
                }`}>
                  {index < 3 ? (
                    <Medal className={`w-4 h-4 ${getMedalColor(index)}`} />
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{branch.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{branch.salespeople} salespeople</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{branch.totalBoxes} boxes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {formatCurrency(branch.totalAmount)}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{branch.totalInvoices} invoices</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};