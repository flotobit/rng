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
    Common: { 
      chance: 50, 
      valueRange: [1, 3], 
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
      borderColor: 'border-gray-400',
      glow: '',
      icon: '⚪'
    },
    Uncommon: { 
      chance: 20, 
      valueRange: [4, 8], 
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-200',
      borderColor: 'border-green-400',
      glow: '',
      icon: '🟢'
    },
    Rare: { 
      chance: 12, 
      valueRange: [12, 35], 
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
      borderColor: 'border-blue-400',
      glow: 'shadow-blue-300',
      icon: '🔵'
    },
    Epic: { 
      chance: 7, 
      valueRange: [40, 65], 
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
      borderColor: 'border-purple-400',
      glow: 'shadow-purple-300',
      icon: '🟣'
    },
    Legendary: { 
      chance: 5, 
      valueRange: [75, 150], 
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
      borderColor: 'border-orange-400',
      glow: 'shadow-orange-300',
      icon: '🟠'
    },
    Mythic: { 
      chance: 1, 
      valueRange: [200, 1000], 
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-200',
      borderColor: 'border-red-400',
      glow: 'shadow-red-400',
      icon: '🔴'
    },
    Secret: { 
      chance: 0.2, 
      valueRange: [1500, 3000], 
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-100 via-pink-200 to-purple-200',
      borderColor: 'border-pink-400',
      glow: 'shadow-pink-400',
      icon: '💎'
    },
    Divine: { 
      chance: 0.08, 
      valueRange: [5000, 10000], 
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200',
      borderColor: 'border-yellow-400',
      glow: 'shadow-yellow-400',
      icon: '⭐'
    }
  };

  // Shop items
  const shopItems = [
    { 
      name: 'Extra Roll', 
      price: 50, 
      description: 'Get an additional roll instantly',
      icon: <Zap className="w-8 h-8" />,
      action: 'instant_roll'
    },
    { 
      name: 'Luck Boost', 
      price: 200, 
      description: '+10% rare drop chance for next 10 rolls',
      icon: <Sparkles className="w-8 h-8" />,
      action: 'luck_boost'
    },
    { 
      name: 'Coin Multiplier', 
      price: 500, 
      description: '2x coin rewards for next 10 rolls',
      icon: <TrendingUp className="w-8 h-8" />,
      action: 'coin_multiplier'
    }
  ];

  // Cooldown effect
  useEffect(() => {
    let interval;
    if (rollCooldown > 0) {
      interval = setInterval(() => {
        setRollCooldown(prev => prev - 1);
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

  // Roll function
  const rollItem = () => {
    if (rollCooldown > 0) return;

    setShowRollAnimation(true);
    setTotalRolls(prev => prev + 1);

    const random = Math.random() * 100;
    let currentChance = 0;
    let rolledRarity = 'Common';

    // Apply luck boost if active
    const luckMultiplier = boosts.luck > 0 ? 1.1 : 1;

    for (const [rarity, data] of Object.entries(rarities)) {
      let adjustedChance = data.chance;
      if (rarity !== 'Common' && boosts.luck > 0) {
        adjustedChance *= luckMultiplier;
      }
      currentChance += adjustedChance;
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
    
    // Reduce boost counters
    if (boosts.luck > 0) setBoosts(prev => ({ ...prev, luck: prev.luck - 1 }));
    if (boosts.coinMultiplier > 0) setBoosts(prev => ({ ...prev, coinMultiplier: prev.coinMultiplier - 1 }));
    
    setLastRoll({ rarity: rolledRarity, value, coinsEarned: finalCoinReward });
    setRollCooldown(2);
  };

  // Sell items
  const sellItems = () => {
    if (!selectedSellItem || !inventory[selectedSellItem] || sellAmount <= 0) return;

    const available = inventory[selectedSellItem];
    const actualSellAmount = Math.min(sellAmount, available);
    
    if (actualSellAmount <= 0) return;

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

  // Buy shop item
  const buyShopItem = (item) => {
    if (coins < item.price) return;
    
    setCoins(prev => prev - item.price);
    
    switch(item.action) {
      case 'instant_roll':
        setRollCooldown(0);
        setTimeout(() => rollItem(), 100);
        break;
      case 'luck_boost':
        setBoosts(prev => ({ ...prev, luck: 10 }));
        break;
      case 'coin_multiplier':
        setBoosts(prev => ({ ...prev, coinMultiplier: 10 }));
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

  // Home Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            ✨ For Jasper ✨
          </h1>
          <div className="flex items-center justify-center gap-6 text-xl">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="font-bold">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span className="font-bold">{totalRolls} Rolls</span>
            </div>
          </div>
        </div>

        {/* Active Boosts */}
        {(boosts.luck > 0 || boosts.coinMultiplier > 0) && (
          <div className="flex justify-center gap-4 mb-4">
            {boosts.luck > 0 && (
              <div className="bg-purple-600/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                <Sparkles className="inline w-4 h-4 mr-1" />
                Luck Boost: {boosts.luck} rolls
              </div>
            )}
            {boosts.coinMultiplier > 0 && (
              <div className="bg-yellow-600/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                2x Coins: {boosts.coinMultiplier} rolls
              </div>
            )}
          </div>
        )}

        {/* Last Roll Result */}
        {lastRoll && (
          <div className={`mx-auto max-w-sm mb-8 p-6 rounded-2xl border-2 transform transition-all duration-500 ${showRollAnimation ? 'scale-110 rotate-3' : 'scale-100 rotate-0'} ${rarities[lastRoll.rarity].bgColor} ${rarities[lastRoll.rarity].borderColor} ${rarities[lastRoll.rarity].glow ? `shadow-lg ${rarities[lastRoll.rarity].glow}` : ''}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{rarities[lastRoll.rarity].icon}</div>
              <div className={`text-2xl font-black ${rarities[lastRoll.rarity].color}`}>
                {lastRoll.rarity}!
              </div>
              <div className="text-gray-700 font-semibold">Value: ${lastRoll.value}</div>
              <div className="text-green-600 font-semibold">+{lastRoll.coinsEarned} coins</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentScreen('inventory')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Package className="w-6 h-6" />
            <span className="font-bold">Inventory</span>
            {Object.keys(inventory).length > 0 && (
              <span className="bg-blue-800 px-2 py-1 rounded-full text-xs">
                {Object.values(inventory).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentScreen('shop')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="font-bold">Shop</span>
          </button>
        </div>

        {/* Roll Button */}
        <div className="text-center mb-8">
          <button
            onClick={rollItem}
            disabled={rollCooldown > 0}
            className={`relative px-16 py-8 text-3xl font-black rounded-full transition-all transform hover:scale-110 ${
              rollCooldown > 0 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-2xl animate-pulse'
            }`}
          >
            {rollCooldown > 0 ? (
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8" />
                {rollCooldown}s
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8" />
                ROLL!
                <Star className="w-8 h-8" />
              </div>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Gem className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-sm text-gray-300">Total Items</div>
            <div className="text-2xl font-bold">{Object.values(inventory).reduce((a, b) => a + b, 0)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-sm text-gray-300">Inventory Value</div>
            <div className="text-2xl font-bold">${Math.floor(calculateInventoryValue())}</div>
          </div>
        </div>

        {/* Rarity Info */}
        <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Drop Rates
          </h3>
          <div className="grid gap-2">
            {Object.entries(rarities).map(([name, data]) => (
              <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${data.bgColor} ${data.borderColor} border`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{data.icon}</span>
                  <span className={`font-bold ${data.color}`}>{name}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-700 font-semibold">{data.chance}%</span>
                  <span className="ml-2 text-gray-600">(${data.valueRange[0]}-${data.valueRange[1]})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Inventory Screen
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
                  max={selectedSellItem ? inventory[selectedSellItem] : 1}
                  value={sellAmount}
                  onChange={(e) => setSellAmount(parseInt(e.target.value) || 1)}
                  className="px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-semibold"
                  placeholder="Amount"
                />
                
                <button
                  onClick={sellItems}
                  disabled={!selectedSellItem}
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

  // Shop Screen
  const ShopScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <ShoppingCart className="w-10 h-10" />
            Shop
          </h1>
          <button
            onClick={() => setCurrentScreen('home')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
          <div className="flex items-center gap-2 text-2xl">
            <Coins className="w-8 h-8 text-yellow-400" />
            <span className="font-bold">{coins.toLocaleString()} Coins</span>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {shopItems.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border-2 border-white/20 backdrop-blur-sm transform transition-all hover:scale-102">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-purple-400">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2">{item.name}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-yellow-400 mb-2">
                    {item.price}
                  </div>
                  <button
                    onClick={() => buyShopItem(item)}
                    disabled={coins < item.price}
                    className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                      coins >= item.price 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {coins >= item.price ? 'Purchase' : 'Not enough'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <p className="text-xl text-gray-300">More items coming soon!</p>
        </div>
      </div>
    </div>
  );

  // Render current screen
  if (currentScreen === 'inventory') return <InventoryScreen />;
  if (currentScreen === 'shop') return <ShopScreen />;
  return <HomeScreen />;
};

export default RNGGame;
