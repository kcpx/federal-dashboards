import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

// Data Disclaimer Component
const DataDisclaimer = () => (
  <div className="mt-8 pt-6 border-t border-slate-700/50">
    <p className="text-slate-600 text-xs text-center">
      <strong className="text-slate-500">Disclaimer:</strong> Data is provided for informational purposes only and should not be considered financial advice.
      While we strive for accuracy, data may be delayed or contain errors. Always verify with official sources before making financial decisions.
    </p>
  </div>
);

// Data Freshness Tag Component
const DataTag = ({ isLive, label, lastUpdate }) => {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        LIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-400">
      {label || 'Static'}{lastUpdate ? ` • ${lastUpdate}` : ''}
    </span>
  );
};

// HUD Fair Market Rents - FY 2025 Sample Data by Metro
// Source: https://www.huduser.gov/portal/datasets/fmr.html
const FMR_DATA = {
  // Format: [Studio, 1BR, 2BR, 3BR, 4BR]
  'San Francisco, CA': { fmr: [2196, 2805, 3393, 4383, 4812], medianIncome: 149600, zip: '94102' },
  'New York, NY': { fmr: [1945, 2387, 2725, 3429, 3727], medianIncome: 85700, zip: '10001' },
  'Los Angeles, CA': { fmr: [1591, 1956, 2478, 3241, 3588], medianIncome: 80000, zip: '90001' },
  'Washington, DC': { fmr: [1747, 1897, 2187, 2707, 3284], medianIncome: 129000, zip: '20001' },
  'Boston, MA': { fmr: [1897, 2318, 2766, 3422, 3668], medianIncome: 106500, zip: '02101' },
  'Seattle, WA': { fmr: [1630, 1936, 2363, 3158, 3707], medianIncome: 115000, zip: '98101' },
  'Austin, TX': { fmr: [1201, 1406, 1691, 2229, 2719], medianIncome: 89700, zip: '78701' },
  'Denver, CO': { fmr: [1363, 1634, 2017, 2772, 3180], medianIncome: 96500, zip: '80201' },
  'Miami, FL': { fmr: [1521, 1841, 2319, 2989, 3458], medianIncome: 60100, zip: '33101' },
  'Chicago, IL': { fmr: [1010, 1193, 1445, 1813, 1986], medianIncome: 74500, zip: '60601' },
  'Atlanta, GA': { fmr: [1143, 1277, 1489, 1939, 2263], medianIncome: 79800, zip: '30301' },
  'Phoenix, AZ': { fmr: [1053, 1217, 1479, 1982, 2349], medianIncome: 76400, zip: '85001' },
  'Dallas, TX': { fmr: [1107, 1283, 1579, 2098, 2474], medianIncome: 73800, zip: '75201' },
  'Minneapolis, MN': { fmr: [1001, 1221, 1519, 2038, 2325], medianIncome: 95400, zip: '55401' },
  'Philadelphia, PA': { fmr: [1074, 1257, 1446, 1729, 1891], medianIncome: 55200, zip: '19101' },
  'Nashville, TN': { fmr: [1168, 1302, 1500, 1913, 2172], medianIncome: 74300, zip: '37201' },
  'Raleigh, NC': { fmr: [1088, 1199, 1396, 1781, 2062], medianIncome: 86700, zip: '27601' },
  'Salt Lake City, UT': { fmr: [1000, 1179, 1411, 1915, 2203], medianIncome: 86300, zip: '84101' },
  'Detroit, MI': { fmr: [796, 921, 1119, 1408, 1533], medianIncome: 58200, zip: '48201' },
  'Cleveland, OH': { fmr: [679, 784, 976, 1271, 1401], medianIncome: 53400, zip: '44101' },
}

// Default mortgage rates (will be updated from FRED)
const DEFAULT_MORTGAGE_30Y = 6.52
const DEFAULT_MORTGAGE_15Y = 5.84

const BEDROOM_LABELS = ['Studio', '1 BR', '2 BR', '3 BR', '4 BR']

const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
}

// Verdict Badge Component - Clear affordability tier
const VerdictBadge = ({ ratio, isLive }) => {
  let verdict, description, bgColor, textColor, icon;

  if (ratio <= 25) {
    verdict = 'COMFORTABLE';
    description = 'You can afford this comfortably with room for savings and emergencies.';
    bgColor = 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40';
    textColor = 'text-emerald-400';
    icon = '✓';
  } else if (ratio <= 30) {
    verdict = 'AFFORDABLE';
    description = 'Within the recommended 30% threshold. Manageable but watch your budget.';
    bgColor = 'from-lime-500/20 to-lime-600/10 border-lime-500/40';
    textColor = 'text-lime-400';
    icon = '✓';
  } else if (ratio <= 40) {
    verdict = 'TIGHT';
    description = 'Above recommended limits. You may struggle to save or handle emergencies.';
    bgColor = 'from-amber-500/20 to-amber-600/10 border-amber-500/40';
    textColor = 'text-amber-400';
    icon = '⚠';
  } else {
    verdict = 'UNAFFORDABLE';
    description = 'Severely cost-burdened. Consider roommates, different location, or income increase.';
    bgColor = 'from-red-500/20 to-red-600/10 border-red-500/40';
    textColor = 'text-red-400';
    icon = '✗';
  }

  return (
    <div className={`bg-gradient-to-br ${bgColor} border rounded-xl p-6 text-center relative`}>
      <div className="absolute top-3 right-3">
        <DataTag isLive={isLive} label="Sample" lastUpdate="FY 2025" />
      </div>
      <div className={`text-4xl mb-2`}>{icon}</div>
      <h3 className={`text-2xl font-bold ${textColor} mb-2`}>{verdict}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">
          {ratio.toFixed(0)}% of income on housing • Target: ≤30%
        </p>
      </div>
    </div>
  );
};

// Years to Save Down Payment Calculator
const DownPaymentCalculator = ({ homePrice, monthlyIncome, monthlyRent, isLive }) => {
  const downPayment20 = homePrice * 0.20;
  const downPayment10 = homePrice * 0.10;
  const downPayment5 = homePrice * 0.05;

  // Assume saving 15% of income after rent
  const monthlyAfterRent = monthlyIncome - monthlyRent;
  const savingsRate = 0.5; // 50% of remaining income saved (aggressive)
  const monthlySavings = Math.max(monthlyAfterRent * savingsRate, 0);

  const yearsTo20 = monthlySavings > 0 ? (downPayment20 / (monthlySavings * 12)).toFixed(1) : '∞';
  const yearsTo10 = monthlySavings > 0 ? (downPayment10 / (monthlySavings * 12)).toFixed(1) : '∞';
  const yearsTo5 = monthlySavings > 0 ? (downPayment5 / (monthlySavings * 12)).toFixed(1) : '∞';

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-semibold text-white">Years to Save Down Payment</h3>
        </div>
        <DataTag isLive={isLive} label="Calculator" />
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Based on saving {formatCurrency(monthlySavings)}/mo (50% of post-rent income)
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
          <div>
            <p className="text-slate-300 font-medium">20% Down (No PMI)</p>
            <p className="text-slate-500 text-sm">{formatCurrency(downPayment20)}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-400 text-2xl font-bold">{yearsTo20}</p>
            <p className="text-slate-500 text-xs">years</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
          <div>
            <p className="text-slate-300 font-medium">10% Down</p>
            <p className="text-slate-500 text-sm">{formatCurrency(downPayment10)}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-400 text-2xl font-bold">{yearsTo10}</p>
            <p className="text-slate-500 text-xs">years</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
          <div>
            <p className="text-slate-300 font-medium">5% Down (FHA)</p>
            <p className="text-slate-500 text-sm">{formatCurrency(downPayment5)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-400 text-2xl font-bold">{yearsTo5}</p>
            <p className="text-slate-500 text-xs">years</p>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-4">
        For a {formatCurrency(homePrice)} home. Assumes rent stays constant (it won't).
      </p>
    </div>
  );
};

// Roommate Math Component
const RoommateMath = ({ studioRent, oneBrRent, twoBrRent, threeBrRent, isLive }) => {
  const scenarios = [
    {
      label: 'Living Alone (Studio)',
      people: 1,
      rent: studioRent,
      perPerson: studioRent,
      icon: '🧑'
    },
    {
      label: 'Living Alone (1BR)',
      people: 1,
      rent: oneBrRent,
      perPerson: oneBrRent,
      icon: '🧑'
    },
    {
      label: '2BR with Roommate',
      people: 2,
      rent: twoBrRent,
      perPerson: twoBrRent / 2,
      icon: '👥'
    },
    {
      label: '3BR with 2 Roommates',
      people: 3,
      rent: threeBrRent,
      perPerson: threeBrRent / 3,
      icon: '👥👤'
    },
  ];

  const baseline = studioRent;

  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border border-cyan-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <h3 className="text-lg font-semibold text-white">Roommate Math</h3>
        </div>
        <DataTag isLive={isLive} label="Sample" lastUpdate="FY 2025" />
      </div>

      <p className="text-slate-400 text-sm mb-4">
        See how much you save by sharing housing costs
      </p>

      <div className="space-y-3">
        {scenarios.map((s, i) => {
          const savings = baseline - s.perPerson;
          const savingsPercent = ((savings / baseline) * 100).toFixed(0);
          const isBaseline = i === 0;

          return (
            <div key={s.label} className={`bg-slate-800/50 rounded-lg p-3 ${isBaseline ? 'border border-slate-600' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="text-slate-300 text-sm">{s.label}</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(s.perPerson)}/mo</span>
              </div>
              {!isBaseline && savings > 0 && (
                <div className="flex justify-end">
                  <span className="text-emerald-400 text-sm">
                    Save {formatCurrency(savings)}/mo ({savingsPercent}%)
                  </span>
                </div>
              )}
              {isBaseline && (
                <div className="flex justify-end">
                  <span className="text-slate-500 text-xs">Baseline</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
        <p className="text-emerald-400 text-sm font-medium">
          3BR split 3 ways saves {formatCurrency((baseline - threeBrRent/3) * 12)}/year vs studio
        </p>
      </div>
    </div>
  );
};

// ZIP Comparison Component - Compare affordability across multiple ZIPs
const ZipComparison = ({ income, bedrooms }) => {
  const [zips, setZips] = useState(['', '', '']);
  const [results, setResults] = useState([null, null, null]);
  const [loading, setLoading] = useState([false, false, false]);
  const [errors, setErrors] = useState(['', '', '']);

  const monthlyIncome = income / 12;

  const fetchZipData = async (zip, index) => {
    if (!zip || zip.length !== 5) {
      setResults(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
      return;
    }

    setLoading(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
    setErrors(prev => {
      const updated = [...prev];
      updated[index] = '';
      return updated;
    });

    try {
      const res = await fetch(`/api/housing?zip=${zip}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      if (data.fmr && data.fmr.fmr && data.fmr.fmr[bedrooms]) {
        const rent = data.fmr.fmr[bedrooms];
        const ratio = (rent / monthlyIncome) * 100;
        setResults(prev => {
          const updated = [...prev];
          updated[index] = {
            zip,
            rent,
            ratio,
            location: data.fmr.metroName || data.fmr.countyName || `ZIP ${zip}`,
            affordable: ratio <= 30
          };
          return updated;
        });
      } else {
        setErrors(prev => {
          const updated = [...prev];
          updated[index] = 'No data';
          return updated;
        });
        setResults(prev => {
          const updated = [...prev];
          updated[index] = null;
          return updated;
        });
      }
    } catch (err) {
      setErrors(prev => {
        const updated = [...prev];
        updated[index] = 'Error';
        return updated;
      });
    } finally {
      setLoading(prev => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    }
  };

  const handleZipChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setZips(prev => {
      const updated = [...prev];
      updated[index] = cleaned;
      return updated;
    });

    // Auto-fetch when 5 digits entered
    if (cleaned.length === 5) {
      fetchZipData(cleaned, index);
    } else {
      setResults(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }
  };

  const getVerdictColor = (ratio) => {
    if (ratio <= 25) return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' };
    if (ratio <= 30) return { bg: 'bg-lime-500/20', border: 'border-lime-500/40', text: 'text-lime-400' };
    if (ratio <= 40) return { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' };
    return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' };
  };

  const affordableCount = results.filter(r => r?.affordable).length;

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h3 className="text-lg font-semibold text-white">Where You CAN Afford</h3>
        </div>
        <DataTag isLive={true} />
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Compare up to 3 ZIP codes to find affordable options at your income ({formatCurrency(income)}/yr)
      </p>

      {/* ZIP Inputs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <input
              type="text"
              placeholder={`ZIP ${i + 1}`}
              value={zips[i]}
              onChange={(e) => handleZipChange(i, e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-center placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {loading[i] && <p className="text-slate-500 text-xs text-center mt-1">Loading...</p>}
            {errors[i] && <p className="text-red-400 text-xs text-center mt-1">{errors[i]}</p>}
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        {results.map((r, i) => {
          if (!r) {
            return (
              <div key={i} className="bg-slate-800/30 rounded-lg p-3 text-center">
                <p className="text-slate-600 text-sm">Enter ZIP</p>
              </div>
            );
          }

          const colors = getVerdictColor(r.ratio);
          return (
            <div key={i} className={`${colors.bg} border ${colors.border} rounded-lg p-3 text-center`}>
              <p className="text-slate-400 text-xs truncate mb-1" title={r.location}>{r.location}</p>
              <p className="text-white font-bold">{formatCurrency(r.rent)}/mo</p>
              <p className={`text-sm font-semibold ${colors.text}`}>
                {r.ratio.toFixed(0)}%
              </p>
              <p className={`text-xs ${colors.text}`}>
                {r.affordable ? '✓ Affordable' : '✗ Too High'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {results.some(r => r !== null) && (
        <div className={`mt-4 p-3 rounded-lg ${affordableCount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <p className={`text-sm font-medium ${affordableCount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {affordableCount > 0
              ? `✓ ${affordableCount} of ${results.filter(r => r).length} locations are affordable at your income`
              : `✗ None of these locations are affordable — try different ZIPs or consider roommates`
            }
          </p>
        </div>
      )}

      <p className="text-slate-500 text-xs mt-3">
        Tip: Try suburbs, nearby metros, or different states to find affordable options.
      </p>
    </div>
  );
};

const AffordabilityGauge = ({ ratio, label }) => {
  const getColor = (r) => {
    if (r <= 25) return '#10b981' // Green
    if (r <= 30) return '#84cc16' // Lime
    if (r <= 35) return '#f59e0b' // Amber
    if (r <= 40) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  const getStatus = (r) => {
    if (r <= 25) return 'Excellent'
    if (r <= 30) return 'Affordable'
    if (r <= 35) return 'Moderate Burden'
    if (r <= 40) return 'High Burden'
    return 'Severe Burden'
  }

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
          <circle 
            cx="64" cy="64" r="56" 
            stroke={getColor(ratio)} 
            strokeWidth="12" 
            fill="none"
            strokeDasharray={`${(Math.min(ratio, 50) / 50) * 352} 352`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{ratio.toFixed(0)}%</span>
          <span className="text-xs text-slate-400">of income</span>
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color: getColor(ratio) }}>{getStatus(ratio)}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

const CostBreakdownChart = ({ rent, utilities, insurance, savings, remaining }) => {
  const data = [
    { name: 'Rent', value: rent, color: '#3b82f6' },
    { name: 'Utilities', value: utilities, color: '#10b981' },
    { name: 'Insurance', value: insurance, color: '#f59e0b' },
    { name: 'Savings', value: savings, color: '#8b5cf6' },
    { name: 'Remaining', value: remaining, color: '#64748b' },
  ].filter(d => d.value > 0)

  return (
    <div className="flex items-center gap-8">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
            <span className="text-sm text-slate-400">{item.name}:</span>
            <span className="text-sm font-medium text-white">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RentVsBuyAnalysis = ({ monthlyRent, homePrice, downPayment, mortgageRate }) => {
  // Calculate monthly mortgage payment (P&I only)
  const loanAmount = homePrice - downPayment
  const monthlyRate = mortgageRate / 100 / 12
  const numPayments = 360 // 30 years
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  // Estimate property tax (1.1% annually) and insurance (0.5% annually)
  const monthlyTax = (homePrice * 0.011) / 12
  const monthlyInsurance = (homePrice * 0.005) / 12
  const monthlyPMI = downPayment < homePrice * 0.2 ? (loanAmount * 0.007) / 12 : 0
  
  const totalMonthlyOwnership = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI

  const isBuyingCheaper = totalMonthlyOwnership < monthlyRent

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Rent vs Buy Analysis</h3>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className={`p-4 rounded-lg ${!isBuyingCheaper ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/50'}`}>
          <p className="text-slate-400 text-sm mb-2">Monthly Rent</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(monthlyRent)}</p>
        </div>
        <div className={`p-4 rounded-lg ${isBuyingCheaper ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/50'}`}>
          <p className="text-slate-400 text-sm mb-2">Monthly Ownership Cost</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyOwnership)}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Principal & Interest</span>
          <span className="text-white">{formatCurrency(monthlyPI)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Property Tax (est.)</span>
          <span className="text-white">{formatCurrency(monthlyTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Home Insurance (est.)</span>
          <span className="text-white">{formatCurrency(monthlyInsurance)}</span>
        </div>
        {monthlyPMI > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-400">PMI ({"<"}20% down)</span>
            <span className="text-white">{formatCurrency(monthlyPMI)}</span>
          </div>
        )}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${isBuyingCheaper ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
        <p className={`font-medium ${isBuyingCheaper ? 'text-emerald-400' : 'text-blue-400'}`}>
          {isBuyingCheaper 
            ? `✓ Buying is ${formatCurrency(monthlyRent - totalMonthlyOwnership)}/mo cheaper`
            : `✓ Renting is ${formatCurrency(totalMonthlyOwnership - monthlyRent)}/mo cheaper`
          }
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Based on {formatCurrency(homePrice)} home price, {formatCurrency(downPayment)} down, {mortgageRate}% rate
        </p>
      </div>
    </div>
  )
}

export default function HousingAffordability() {
  const [selectedMetro, setSelectedMetro] = useState('Washington, DC')
  const [income, setIncome] = useState(85000)
  const [bedrooms, setBedrooms] = useState(1)
  const [includeUtilities, setIncludeUtilities] = useState(true)
  const [savingsRate, setSavingsRate] = useState(20)
  
  // ZIP code lookup
  const [zipCode, setZipCode] = useState('')
  const [zipInput, setZipInput] = useState('')
  const [liveFmr, setLiveFmr] = useState(null)
  const [liveIncomeLimit, setLiveIncomeLimit] = useState(null)
  const [fmrLoading, setFmrLoading] = useState(false)
  const [fmrError, setFmrError] = useState(null)
  
  // Mortgage rates (fetched from FRED)
  const [mortgageRate30, setMortgageRate30] = useState(DEFAULT_MORTGAGE_30Y)
  const [mortgageRate15, setMortgageRate15] = useState(DEFAULT_MORTGAGE_15Y)
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesLive, setRatesLive] = useState(false)
  
  // For Rent vs Buy
  const [homePrice, setHomePrice] = useState(450000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)

  // Fetch live mortgage rates on mount
  useEffect(() => {
    async function fetchMortgageRates() {
      try {
        const res = await fetch('/api/housing')
        if (!res.ok) throw new Error('Failed to fetch rates')
        const data = await res.json()
        
        if (data.mortgage30) setMortgageRate30(data.mortgage30)
        if (data.mortgage15) setMortgageRate15(data.mortgage15)
        setRatesLive(true)
      } catch (err) {
        console.error('Error fetching mortgage rates:', err)
      } finally {
        setRatesLoading(false)
      }
    }
    
    fetchMortgageRates()
  }, [])

  // Fetch FMR data when ZIP code is submitted
  const handleZipLookup = async () => {
    if (!zipInput || zipInput.length !== 5) {
      setFmrError('Please enter a valid 5-digit ZIP code')
      return
    }
    
    setFmrLoading(true)
    setFmrError(null)
    
    try {
      const res = await fetch(`/api/housing?zip=${zipInput}`)
      if (!res.ok) throw new Error('Failed to fetch FMR data')
      const data = await res.json()
      
      if (data.fmr && data.fmr.fmr && data.fmr.fmr[0]) {
        setLiveFmr(data.fmr)
        setZipCode(zipInput)
        if (data.incomeLimit?.medianIncome) {
          setLiveIncomeLimit(data.incomeLimit)
        }
      } else {
        setFmrError('No FMR data found for this ZIP code')
        setLiveFmr(null)
      }
    } catch (err) {
      console.error('Error fetching FMR:', err)
      setFmrError('Failed to fetch FMR data')
      setLiveFmr(null)
    } finally {
      setFmrLoading(false)
    }
  }

  // Clear live FMR and go back to metro selection
  const clearLiveFmr = () => {
    setLiveFmr(null)
    setLiveIncomeLimit(null)
    setZipCode('')
    setZipInput('')
    setFmrError(null)
  }

  const metroData = FMR_DATA[selectedMetro]
  
  // Use live FMR if available, otherwise use static metro data
  const fmr = liveFmr ? liveFmr.fmr[bedrooms] : metroData.fmr[bedrooms]
  const medianIncome = liveIncomeLimit?.medianIncome || metroData.medianIncome
  const locationName = liveFmr ? (liveFmr.metroName || liveFmr.countyName || `ZIP ${zipCode}`) : selectedMetro
  const fmrYear = liveFmr?.year || 'FY 2025'
  const isLiveFmr = !!liveFmr

  // Build FMR comparison data
  const fmrComparisonData = (liveFmr ? liveFmr.fmr : metroData.fmr).map((rent, i) => ({
    name: BEDROOM_LABELS[i],
    rent,
    ratio: (rent / (income / 12)) * 100,
  }))

  const calculations = useMemo(() => {
    const monthlyIncome = income / 12
    const monthlyRent = fmr
    const utilities = includeUtilities ? Math.round(fmr * 0.12) : 0 // ~12% of rent
    const rentersInsurance = 25 // Average monthly
    const monthlySavings = monthlyIncome * (savingsRate / 100)
    
    const totalHousingCost = monthlyRent + utilities + rentersInsurance
    const rentToIncomeRatio = (monthlyRent / monthlyIncome) * 100
    const housingToIncomeRatio = (totalHousingCost / monthlyIncome) * 100
    const remainingAfterHousing = monthlyIncome - totalHousingCost - monthlySavings

    // Income required calculations
    const incomeFor30Pct = (monthlyRent / 0.30) * 12
    const incomeFor25Pct = (monthlyRent / 0.25) * 12

    // Affordability vs median
    const medianMonthly = medianIncome / 12
    const medianRentRatio = (monthlyRent / medianMonthly) * 100

    return {
      monthlyIncome,
      monthlyRent,
      utilities,
      rentersInsurance,
      monthlySavings,
      totalHousingCost,
      rentToIncomeRatio,
      housingToIncomeRatio,
      remainingAfterHousing,
      incomeFor30Pct,
      incomeFor25Pct,
      medianRentRatio,
    }
  }, [income, fmr, includeUtilities, savingsRate, medianIncome])

  return (
    <>
      <Head>
        <title>Housing Affordability Calculator</title>
        <meta name="description" content="Calculate housing affordability by location" />
      </Head>

      <main className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-2 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <h1 className="text-3xl font-bold text-white">Housing Affordability Calculator</h1>
              <p className="text-slate-400 mt-1">HUD Fair Market Rents • FY 2025 Data</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              {isLiveFmr ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-emerald-500/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live HUD + FRED</span>
                </div>
              ) : ratesLive ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-blue-500/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Live Rates • Static FMR</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  <span className="text-slate-400 text-sm">Sample Data</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Your Information</h2>
                
                {/* ZIP Code Lookup */}
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <label className="block text-xs text-slate-400 mb-2">
                    Look up by ZIP Code (Live HUD Data)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 20001"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={(e) => e.key === 'Enter' && handleZipLookup()}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleZipLookup}
                      disabled={fmrLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      {fmrLoading ? '...' : 'Look Up'}
                    </button>
                  </div>
                  {fmrError && <p className="text-red-400 text-xs mt-2">{fmrError}</p>}
                  {liveFmr && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-emerald-400 text-xs">✓ Using live HUD data for {zipCode}</span>
                      <button onClick={clearLiveFmr} className="text-slate-400 hover:text-white text-xs">Clear</button>
                    </div>
                  )}
                </div>

                {/* Metro Selection - only show if not using live FMR */}
                {!liveFmr && (
                  <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Or select a Metro Area</label>
                    <select
                      value={selectedMetro}
                      onChange={(e) => setSelectedMetro(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.keys(FMR_DATA).sort().map(metro => (
                        <option key={metro} value={metro}>{metro}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Annual Income */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">
                    Annual Gross Income: {formatCurrency(income)}
                  </label>
                  <input
                    type="range"
                    min="20000"
                    max="300000"
                    step="5000"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$20K</span>
                    <span>$300K</span>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Unit Size</label>
                  <div className="flex gap-2">
                    {BEDROOM_LABELS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => setBedrooms(i)}
                        className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                          bedrooms === i 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Savings Rate */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">
                    Target Savings Rate: {savingsRate}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Include Utilities */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="utilities"
                    checked={includeUtilities}
                    onChange={(e) => setIncludeUtilities(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-blue-500"
                  />
                  <label htmlFor="utilities" className="text-sm text-slate-400">Include estimated utilities</label>
                </div>
              </div>

              {/* Metro Stats */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{locationName}</h3>
                  {isLiveFmr && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">LIVE</span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fair Market Rent ({BEDROOM_LABELS[bedrooms]})</span>
                    <span className="text-white font-medium">{formatCurrency(fmr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area Median Income</span>
                    <span className="text-white font-medium">{formatCurrency(medianIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">30Y Mortgage Rate</span>
                    <span className="text-white font-medium">
                      {mortgageRate30}%
                      {ratesLive && <span className="text-emerald-400 text-xs ml-1">●</span>}
                    </span>
                  </div>
                  {isLiveFmr && (
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-slate-500 text-xs">
                        HUD {fmrYear} • {liveFmr.smallAreaFmr ? 'Small Area FMR' : 'Metro FMR'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. THE ANSWER: Verdict Badge */}
              <VerdictBadge ratio={calculations.rentToIncomeRatio} isLive={isLiveFmr} />

              {/* 2. HOPE: If unaffordable, find alternatives */}
              <ZipComparison income={income} bedrooms={bedrooms} />

              {/* 3. OPTIONS: Ways to make it work */}
              <div className="grid md:grid-cols-2 gap-6">
                <RoommateMath
                  studioRent={liveFmr ? liveFmr.fmr[0] : metroData.fmr[0]}
                  oneBrRent={liveFmr ? liveFmr.fmr[1] : metroData.fmr[1]}
                  twoBrRent={liveFmr ? liveFmr.fmr[2] : metroData.fmr[2]}
                  threeBrRent={liveFmr ? liveFmr.fmr[3] : metroData.fmr[3]}
                  isLive={isLiveFmr}
                />
                <DownPaymentCalculator
                  homePrice={homePrice}
                  monthlyIncome={calculations.monthlyIncome}
                  monthlyRent={calculations.monthlyRent}
                  isLive={isLiveFmr}
                />
              </div>

              {/* 4. SUPPORTING DATA: Affordability Analysis */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Affordability Analysis</h2>
                <div className="grid grid-cols-3 gap-6">
                  <AffordabilityGauge
                    ratio={calculations.rentToIncomeRatio}
                    label="Rent Only"
                  />
                  <AffordabilityGauge
                    ratio={calculations.housingToIncomeRatio}
                    label="Total Housing"
                  />
                  <AffordabilityGauge
                    ratio={calculations.medianRentRatio}
                    label="vs Area Median"
                  />
                </div>

                <div className="mt-6 p-4 rounded-lg bg-slate-700/50">
                  <p className="text-slate-300 text-sm">
                    <strong>HUD Standard:</strong> Housing is considered affordable when it costs no more than 30% of household income.
                    You're at <span className={calculations.rentToIncomeRatio <= 30 ? 'text-emerald-400' : 'text-amber-400'}>
                      {calculations.rentToIncomeRatio.toFixed(1)}%
                    </span> rent-to-income.
                  </p>
                </div>
              </div>

              {/* 5. BUDGET DETAILS: Monthly Breakdown */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Monthly Budget Breakdown</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <CostBreakdownChart 
                    rent={calculations.monthlyRent}
                    utilities={calculations.utilities}
                    insurance={calculations.rentersInsurance}
                    savings={calculations.monthlySavings}
                    remaining={Math.max(0, calculations.remainingAfterHousing)}
                  />
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-400">Monthly Gross Income</span>
                        <span className="text-white font-medium">{formatCurrency(calculations.monthlyIncome)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-400">Total Housing Cost</span>
                        <span className="text-white font-medium">{formatCurrency(calculations.totalHousingCost)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-400">Target Savings</span>
                        <span className="text-white font-medium">{formatCurrency(calculations.monthlySavings)}</span>
                      </div>
                      <div className={`flex justify-between p-3 rounded-lg ${calculations.remainingAfterHousing >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <span className="text-slate-400">Remaining for Other</span>
                        <span className={`font-medium ${calculations.remainingAfterHousing >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(calculations.remainingAfterHousing)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income Required */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Income Required</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    To afford the {formatCurrency(fmr)}/mo FMR in {selectedMetro}:
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-slate-300">At 30% ratio (standard)</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(calculations.incomeFor30Pct)}/yr</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <span className="text-slate-300">At 25% ratio (comfortable)</span>
                      <span className="text-blue-400 font-bold">{formatCurrency(calculations.incomeFor25Pct)}/yr</span>
                    </div>
                  </div>
                </div>

                {/* FMR by Bedroom */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">FMR by Unit Size</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fmrComparisonData}>
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                                  <p className="text-white font-medium">{formatCurrency(payload[0].value)}</p>
                                  <p className="text-slate-400 text-sm">{payload[0].payload.ratio.toFixed(0)}% of your income</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="rent" radius={[4, 4, 0, 0]}>
                          {fmrComparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === bedrooms ? '#3b82f6' : '#475569'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Rent vs Buy */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Rent vs Buy Calculator</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Home Price: {formatCurrency(homePrice)}
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="1500000"
                      step="25000"
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Down Payment: {downPaymentPct}% ({formatCurrency(homePrice * downPaymentPct / 100)})
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="30"
                      step="1"
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
                <RentVsBuyAnalysis 
                  monthlyRent={calculations.monthlyRent}
                  homePrice={homePrice}
                  downPayment={homePrice * downPaymentPct / 100}
                  mortgageRate={mortgageRate30}
                />
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Fair Market Rents</p>
                <p className="text-slate-500">HUD FY 2025 FMR data</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Area Median Income</p>
                <p className="text-slate-500">HUD Income Limits FY 2025</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Mortgage Rates</p>
                <p className="text-slate-500">FRED MORTGAGE30US (Dec 2025)</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              {isLiveFmr
                ? `Live FMR data from HUD API for ZIP ${zipCode}. `
                : 'Sample FMR data for major metros. Enter a ZIP code for live HUD data. '
              }
              {ratesLive ? 'Mortgage rates live from FRED.' : 'Using default mortgage rates.'}
            </p>
          </div>

          {/* Data Disclaimer */}
          <DataDisclaimer />
        </div>
      </main>
    </>
  )
}
