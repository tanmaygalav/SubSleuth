import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// --- TYPE DEFINITIONS ---
interface Transaction {
  from: string;
  subject: string;
  productName: string;
  price: string | null; // Allow price to be null
  type: 'Order' | 'Subscription' | 'Error'; // Allow Error type
  transactionDate: string | null;
  orderNumber: string | null;
  renewalFrequency: 'Monthly' | 'Yearly' | null;
}

type PageView = 'landing' | 'loading' | 'dashboard' | 'error';

const parsePrice = (priceStr: string | null): number => {
  if (!priceStr) return 0;

  let cleaned = priceStr
    .replace(/₹/g, "")       // remove ₹
    .replace(/Rs\.?/gi, "")  // remove Rs. or Rs
    .replace(/\s/g, "")      // remove spaces
    .replace(/,/g, "");      // remove commas

  const value = parseFloat(cleaned);

  return isNaN(value) ? 0 : value;
};



// --- SVG ICON COMPONENTS ---
const BrainIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3.044a12.02 12.02 0 009-3.044 12.02 12.02 0 00-1.382-7.998z" />
    </svg>
);
const ChartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

// --- UI COMPONENTS ---
const AuroraBackground = () => <div className="aurora-bg"></div>;

const loadingMessages = [
    "Connecting to your inbox securely...",
    "Scanning for e-receipts and invoices...",
    "Applying AI to extract transaction details...",
    "Filtering out the noise...",
    "Building your personalized dashboard...",
    "Almost there..."
];

const LoadingSpinner = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="flex flex-col justify-center items-center h-screen text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-lg transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
            <p className="text-sm text-gray-400">This may take a moment, especially on the first scan.</p>
        </div>
    );
};

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex flex-col justify-center items-center h-screen text-white text-center px-4">
    <h2 className="text-2xl text-red-400 mb-4">An Error Occurred</h2>
    <p className="mb-6 max-w-md whitespace-pre-wrap">{message}</p>
    <button onClick={onRetry} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
      {message.includes('expired') ? 'Login Again' : 'Return to Landing Page'}
    </button>
  </div>
);

interface FeatureCardProps { icon: React.ReactNode; title: string; description: string; }
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="glassmorphism p-6 rounded-2xl flex flex-col items-start space-y-4 transition-all duration-300 hover:border-purple-400/50 hover:scale-105">
    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400">{icon}</div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const LandingPage = ({ onLogin, loading }: { onLogin: () => void, loading: boolean }) => (
  <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter">
        Finally, Find All Your <span className="text-purple-400">Subscriptions</span>.
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
        SubSleuth uses AI to instantly scan your inbox for recurring payments and online orders, giving you a clear picture of your digital spending.
      </p>
      <button onClick={onLogin} disabled={loading} className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg text-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
        {loading ? 'Redirecting...' : 'Get Started for Free'}
      </button>
    </div>
    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
      <FeatureCard icon={<BrainIcon className="w-6 h-6" />} title="AI-Powered Detection" description="Our AI reads your e-receipts to intelligently extract details like price, renewal dates, and order numbers." />
      <FeatureCard icon={<ShieldIcon className="w-6 h-6" />} title="Secure & Private" description="We use Google's secure OAuth and only request read-only permission. We never see your password." />
      <FeatureCard icon={<ChartIcon className="w-6 h-6" />} title="Visualize Your Spending" description="Go beyond a simple list. Our interactive dashboard helps you understand where your money is going." />
    </div>
  </div>
);

interface KpiCardProps { title: string; value: string; description: string; }
const KpiCard: React.FC<KpiCardProps> = ({ title, value, description }) => (
  <div className="glassmorphism p-6 rounded-2xl">
    <p className="text-sm text-gray-400 mb-1">{title}</p>
    <p className="text-3xl font-bold text-white mb-2">{value}</p>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

const DoughnutChart = ({ data }: { data: Transaction[] }) => {
  const chartData = useMemo(() => {
    const spending = data.reduce((acc, item) => {
      const price = parsePrice(item.price);
      if (item.type === 'Subscription') acc.subscriptions += price;
      else acc.orders += price;
      return acc;
    }, { subscriptions: 0, orders: 0 });
    return {
      labels: ['Subscriptions', 'Orders'],
      datasets: [{
        label: 'Spending',
        data: [spending.subscriptions, spending.orders],
        backgroundColor: ['rgba(139, 92, 246, 0.6)', 'rgba(74, 68, 242, 0.6)'],
        borderColor: ['rgba(139, 92, 246, 1)', 'rgba(74, 68, 242, 1)'],
        borderWidth: 1,
      }],
    };
  }, [data]);
  return <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }} />;
};

const BentoGrid = ({ data }: { data: Transaction[] }) => {
    const recentItems = data.slice(0, 6);
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ perspective: '1000px' }}>
            {recentItems.map((item, index) => (
                <div key={index} className="group relative glassmorphism rounded-2xl p-4 flex flex-col justify-between aspect-square transition-all duration-300 hover:!border-purple-400/80 hover:scale-105 hover:[transform:rotateX(10deg)_rotateY(-10deg)]">
                    <div>
                        <p className="text-sm font-bold truncate text-white">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.type}</p>
                    </div>
                    <div>
                         <p className="text-lg font-bold text-purple-400">{item.price}</p>
                        <p className="text-xs text-gray-500">{item.transactionDate}</p>
                    </div>
                    <div className="absolute inset-0 bg-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.5)' }}></div>
                </div>
            ))}
        </div>
    );
};

const TransactionList = ({ data }: { data: Transaction[] }) => (
  <div className="glassmorphism rounded-2xl p-2 md:p-4 mt-8">
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-[#060010]/80 backdrop-blur-sm">
          <tr>
            <th className="p-4 text-sm font-semibold text-gray-400">Product</th>
            <th className="p-4 text-sm font-semibold text-gray-400">Type</th>
            <th className="p-4 text-sm font-semibold text-gray-400">Price</th>
            <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white">{item.productName}</td>
              <td className="p-4 text-gray-300">
                <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'Subscription' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{item.type}</span>
              </td>
              <td className="p-4 font-mono text-gray-300">{item.price}</td>
              <td className="p-4 text-gray-400">{item.transactionDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DashboardPage = ({ data, onRescan, onLogout }: { data: Transaction[], onRescan: () => void, onLogout: () => void }) => {
    // --- THIS IS THE FINAL, BULLETPROOF FIX ---
    const kpiData = useMemo(() => {
        // We use a clean, explicit loop which is easier to debug and guaranteed to be correct.
        let totalSpend = 0;
        let monthlySpend = 0;
        let totalSubscriptions = 0;
        let totalOrders = 0;

        console.log("--- STARTING KPI CALCULATION ---");
        console.log("Data received:", data);

        for (const item of data) {
            const price = parsePrice(item.price);
            console.log(`Processing "${item.productName}": Original price string is "${item.price}", Parsed number is ${price}`);

            // This adds every valid price to the total spend.
            if (price > 0) {
                totalSpend += price;
            }

            if(item.type === 'Subscription') {
                totalSubscriptions++;
                const freq = item.renewalFrequency?.toLowerCase();
                if (freq === 'monthly') {
                    monthlySpend += price;
                } else if (freq === 'yearly' || freq === 'billed annually') {
                    monthlySpend += price / 12;
                }
            } else if (item.type === 'Order') {
                totalOrders++;
            }
        }
        
        console.log("--- FINAL CALCULATED TOTALS ---", { totalSpend, monthlySpend, totalSubscriptions, totalOrders });
        return { totalSpend, monthlySpend, totalSubscriptions, totalOrders };
    }, [data]);

    return (
        <div className="relative z-10 min-h-screen p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white">SubSleuth Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={onRescan} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">Rescan Emails</button>
                    <button onClick={onLogout} className="px-4 py-2 text-sm bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded-lg transition-colors">Logout</button>
                </div>
            </header>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Spending Found" value={`₹${kpiData.totalSpend.toFixed(2)}`} description="From this scan" />
                <KpiCard title="Est. Monthly Spend" value={`₹${kpiData.monthlySpend.toFixed(2)}`} description="From all subscriptions" />
                <KpiCard title="Total Subscriptions" value={kpiData.totalSubscriptions.toString()} description="Recurring payments" />
                <KpiCard title="Total Orders" value={kpiData.totalOrders.toString()} description="One-time purchases" />
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 glassmorphism rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Spending Split</h2>
                    <div className="h-64"><DoughnutChart data={data} /></div>
                </div>
                <div className="lg:col-span-2 glassmorphism rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    <BentoGrid data={data} />
                </div>
            </section>
            <section>
                <h2 className="text-xl font-bold text-white mb-4">All Transactions</h2>
                <TransactionList data={data} />
            </section>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [pageView, setPageView] = useState<PageView>('loading');
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('subsleuth_token'));
  const [scanData, setScanData] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

  const API_BASE_URL = 'http://localhost:3000';
  
  const handleFetchError = (err: unknown): string => {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return 'Could not connect to the backend server.\n\nPlease ensure it is running on http://localhost:3000 and try again.';
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'An unknown error occurred.';
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('subsleuth_token');
    setAuthToken(null);
    setScanData(null);
    setError(null);
    setPageView('landing');
  }, []);
  
  const scanEmails = useCallback(async (token: string) => {
    setPageView('loading');
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/scan-emails`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Your secure session has expired. Please log in again to reconnect your inbox.');
        }
        throw new Error(`Failed to scan emails. Status: ${response.status}.`);
      }
      const data: Transaction[] = await response.json();
      setScanData(data);
      setPageView('dashboard');
    } catch (err) {
      setError(handleFetchError(err));
      setPageView('error');
    }
  }, [handleLogout]);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem('subsleuth_token');
    const hash = window.location.hash;

    if (hash.startsWith('#token=')) {
      const token = hash.substring(7);
      localStorage.setItem('subsleuth_token', token);
      setAuthToken(token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      scanEmails(token);
    } else if (tokenInStorage) {
      setAuthToken(tokenInStorage);
      scanEmails(tokenInStorage);
    } else {
      setPageView('landing');
    }
  }, []);

  const handleLogin = async () => {
    setIsLoginLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      if (!response.ok) throw new Error('Could not get login URL from server.');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (err) {
      setError(handleFetchError(err));
      setPageView('error');
      setIsLoginLoading(false);
    }
  };
  
  const handleRescan = () => {
    if (authToken) {
        scanEmails(authToken);
    } else {
        handleLogout();
    }
  };

  const renderContent = () => {
    switch(pageView) {
      case 'loading':
        return <LoadingSpinner />;
      case 'dashboard':
        return scanData ? <DashboardPage data={scanData} onRescan={handleRescan} onLogout={handleLogout} /> : <LoadingSpinner/>;
      case 'error':
        return <ErrorDisplay message={error || 'Something went wrong.'} onRetry={handleLogout} />;
      case 'landing':
      default:
        return <LandingPage onLogin={handleLogin} loading={isLoginLoading} />;
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-[#060010] text-white font-sans overflow-x-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        {renderContent()}
      </div>
    </main>
  );
}

