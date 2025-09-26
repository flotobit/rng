import React, { useState, useEffect } from 'react';
import { Star, Package, ShoppingCart, Coins, Clock, Sparkles, TrendingUp, Gift, Zap, Trophy, Gem } from 'lucide-react';

const RNGGame = () => {
  const [coins, setCoins] = useState(100);
  const [inventory, setInventory] = useState({});
  const [currentScreen, setCurrentScreen] = useState('home');
  const [rollCooldown, setRollCooldown] = useState(0);
  const [lastRoll, setLastRoll] = useState(null);
  const [selectedSellItem, setSelectedSellItem] = useState('');
  const [sellAmount, setSellAmount] = useState(1);
  const [totalRolls, setTotalRolls] = useState(0);
  const [showRollAnimation, setShowRollAnimation] = useState(false);
  const [boosts, setBoosts] = useState({ luck: 0, coinMultiplier: 0 });

  // Rarity definitions with drop rates and value ranges
  const rarities = {
    Common: { chance: 50, valueRange: [1, 3], color: 'text-gray-600', bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200', borderColor: 'border-gray-400', glow: '', icon: '⚪' },
    Uncommon: { chance: 20, valueRange: [4, 8], color: 'text-green-600', bgColor: 'bg-gradient-to-br from-green-100 to-green-200', borderColor: 'border-green-400', glow: '', icon: '🟢' },
    Rare: { chance: 12, valueRange: [12, 35], color: 'text-blue-600', bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200', borderColor: 'border-blue-400', glow: 'shadow-blue-300', icon: '🔵' },
    Epic: { chance: 7, valueRange: [40, 65], color: 'text-purple-600', bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200', borderColor: 'border-purple-400', glow: 'shadow-purple-300', icon: '🟣' },
    Legendary: { chance: 5, valueRange: [75, 150], color: 'text-orange-600', bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200', borderColor: 'border-orange-400', glow: 'shadow-orange-300', icon: '🟠' },
    Mythic: { chance: 1, valueRange: [200, 1000], color: 'text-red-600', bgColor: 'bg-gradient-to-br from-red-100 to-red-200', borderColor: 'border-red-400', glow: 'shadow-red-400', icon: '🔴' },
    Secret: { chance: 0.2, valueRange: [1500, 3000], color: 'text-pink-600', bgColor: 'bg-gradient-to-br from-pink-100 via-pink-200 to-purple-200', borderColor: 'border-pink-400', glow: 'shadow-pink-400', icon: '💎' },
    Divine: { chance: 0.08, valueRange: [5000, 10000], color: 'text-yellow-600', bgColor: 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200', borderColor: 'border-yellow-400', glow: 'shadow-yellow-400', icon: '⭐' }
  };

  // Shop items
  const shopItems = [
    { name: 'Extra Roll', price: 50, description: 'Get an additional roll instantly', icon: <Zap className="w-8 h-8" />, action: 'instant_roll' },
    { name: 'Luck Boost', price: 200, description: '+10% rare drop chance for next 10 rolls', icon: <Sparkles className="w-8 h-8" />, action: 'luck_boost' },
    { name: 'Coin Multiplier', price: 500, description: '2x coin rewards for next 10 rolls', icon: <TrendingUp className="w-8 h-8" />, action: 'coin_multiplier' }
  ];

  // Cooldown effect
  useEffect(() => {
    let interval;
    if (rollCooldown > 0) {
      interval = setInterval(() => {
        setRollCooldown(prev => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rollCooldown]);

  // Roll animation effect
  useEffect(() => {
    if (showRollAnimation) {
      const timer = setTimeout(() => setShowRollAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showRollAnimation]);

  // Helper: calculates normalized drop chances (preserving total at 100%)
  const getNormalizedChances = () => {
    const raw = {};
    let total = 0;
    Object.entries(rarities).forEach(([rarity, data]) => {
      if (rarity !== 'Common' && boosts.luck > 0) {
        raw[rarity] = data.chance * 1.1;
      } else {
        raw[rarity] = data.chance;
      }
      total += raw[rarity];
    });
    // Normalize for 100%
    Object.keys(raw).forEach(key => {
      raw[key] = raw[key] / total * 100;
    });
    return raw;
  };

  // Roll function with corrected probability handling
  const rollItem = () => {
    if (rollCooldown > 0) return;

    setShowRollAnimation(true);
    setTotalRolls(prev => prev + 1);

    const normalizedChances = getNormalizedChances();
    const random = Math.random() * 100;
    let currentChance = 0;
    let rolledRarity = 'Common';

    for (const [rarity] of Object.entries(rarities)) {
      currentChance += normalizedChances[rarity];
      if (random <= currentChance) {
        rolledRarity = rarity;
        break;
      }
    }

    const rarity = rarities[rolledRarity];
    const value = Math.floor(Math.random() * (rarity.valueRange[1] - rarity.valueRange[0] + 1)) + rarity.valueRange[0];

    // Add to inventory
    setInventory(prev => ({
      ...prev,
      [rolledRarity]: (prev[rolledRarity] || 0) + 1
    }));

    // Add coins with multiplier if active
    const coinReward = Math.floor(value / 2);
    const finalCoinReward = boosts.coinMultiplier > 0 ? coinReward * 2 : coinReward;
    setCoins(prev => prev + finalCoinReward);

    // Reduce boost counters (don't drop below 0!)
    if (boosts.luck > 0) setBoosts(prev => ({ ...prev, luck: Math.max(prev.luck - 1, 0) }));
    if (boosts.coinMultiplier > 0) setBoosts(prev => ({ ...prev, coinMultiplier: Math.max(prev.coinMultiplier - 1, 0) }));

    setLastRoll({ rarity: rolledRarity, value, coinsEarned: finalCoinReward });
    setRollCooldown(2);
  };

  // Sell items
  const sellItems = () => {
    const available = selectedSellItem ? inventory[selectedSellItem] || 0 : 0;
    const actualSellAmount = Math.min(sellAmount, available);
    if (!selectedSellItem || actualSellAmount <= 0) return;

    const rarity = rarities[selectedSellItem];
    const avgValue = (rarity.valueRange[0] + rarity.valueRange[1]) / 2;
    const totalValue = Math.floor(avgValue * actualSellAmount);

    setCoins(prev => prev + totalValue);
    setInventory(prev => {
      const newInv = { ...prev };
      newInv[selectedSellItem] = newInv[selectedSellItem] - actualSellAmount;
      if (newInv[selectedSellItem] <= 0) {
        delete newInv[selectedSellItem];
        setSelectedSellItem('');
      }
      return newInv;
    });

    setSellAmount(1);
  };

  // Buy shop item (now stacks boosts instead of overwriting)
  const buyShopItem = (item) => {
    if (coins < item.price) return;

    setCoins(prev => prev - item.price);

    switch(item.action) {
      case 'instant_roll':
        setRollCooldown(0);
        setTimeout(() => rollItem(), 100);
        break;
      case 'luck_boost':
        setBoosts(prev => ({ ...prev, luck: (prev.luck || 0) + 10 }));
        break;
      case 'coin_multiplier':
        setBoosts(prev => ({ ...prev, coinMultiplier: (prev.coinMultiplier || 0) + 10 }));
        break;
      default:
        break;
    }
  };

  // Calculate total inventory value
  const calculateInventoryValue = () => {
    return Object.entries(inventory).reduce((total, [item, count]) => {
      const rarity = rarities[item];
      const avgValue = (rarity.valueRange[0] + rarity.valueRange[1]) / 2;
      return total + (avgValue * count);
    }, 0);
  };

  // Home Screen -- unchanged
  // Inventory Screen -- fixed selling input max fallback
  const InventoryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Package className="w-10 h-10" />
            Inventory
          </h1>
          <button
            onClick={() => setCurrentScreen('home')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-2xl">
              <Coins className="w-8 h-8 text-yellow-400" />
              <span className="font-bold">{coins.toLocaleString()} Coins</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-2xl">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="font-bold">${Math.floor(calculateInventoryValue())} Value</span>
            </div>
          </div>
        </div>

        {Object.keys(inventory).length === 0 ? (
          <div className="text-center text-gray-400 mt-16">
            <Package className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-2xl">Your inventory is empty!</p>
            <p className="mt-2">Go roll some items!</p>
          </div>
        ) : (
          <>
            {/* Inventory Items Grid */}
            <div className="grid gap-4 mb-8">
              {Object.entries(inventory)
                .sort((a, b) => {
                  const rarityOrder = Object.keys(rarities);
                  return rarityOrder.indexOf(b[0]) - rarityOrder.indexOf(a[0]);
                })
                .map(([item, count]) => {
                  const rarity = rarities[item];
                  return (
                    <div key={item} className={`p-6 rounded-xl border-2 transform transition-all hover:scale-102 ${rarity.bgColor} ${rarity.borderColor} ${rarity.glow ? `shadow-lg ${rarity.glow}` : ''}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{rarity.icon}</span>
                          <div>
                            <span className={`font-black text-xl ${rarity.color}`}>{item}</span>
                            <span className="ml-3 text-gray-700 font-bold text-lg">x{count}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600 font-semibold">
                            ${rarity.valueRange[0]}-${rarity.valueRange[1]} each
                          </div>
                          <div className="text-gray-700 font-bold">
                            Total: ${Math.floor((rarity.valueRange[0] + rarity.valueRange[1]) / 2 * count)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Sell Section */}
            <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 p-8 rounded-xl border-2 border-red-500/50 backdrop-blur-sm">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                Sell Items
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  value={selectedSellItem}
                  onChange={(e) => {
                    setSelectedSellItem(e.target.value);
                    setSellAmount(1);
                  }}
                  className="px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-semibold"
                >
                  <option value="">Select item to sell</option>
                  {Object.keys(inventory).map(item => (
                    <option key={item} value={item}>{item} (x{inventory[item]})</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  max={selectedSellItem && inventory[selectedSellItem] ? inventory[selectedSellItem] : 1}
                  value={sellAmount}
                  onChange={(e) => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    setSellAmount(val);
                  }}
                  className="px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-semibold"
                  placeholder="Amount"
                />
                
                <button
                  onClick={sellItems}
                  disabled={!selectedSellItem || (selectedSellItem && !inventory[selectedSellItem])}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg transition-all font-bold transform hover:scale-105"
                >
                  Sell for ${selectedSellItem ? Math.floor((rarities[selectedSellItem].valueRange[0] + rarities[selectedSellItem].valueRange[1]) / 2 * sellAmount) : 0}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Shop Screen - unchanged

  // Render current screen
  if (currentScreen === 'inventory') return <InventoryScreen />;
  if (currentScreen === 'shop') return <ShopScreen />;
  return <HomeScreen />;
};

export default RNGGame;

