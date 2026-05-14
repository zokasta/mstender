// src/pages/dashboard/Dashboard.jsx

import { useEffect, useMemo, useState } from "react";


import {
  FaUsers,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaArrowTrendUp,
  FaBell,
  FaChartLine,
  FaGlobe,
  FaRankingStar,
} from "react-icons/fa6";

import { PieChart, LineChart } from "@mui/x-charts";
import Token from "../../database/Token";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.type;

  /* =========================================
      STATES
  ========================================= */

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_leads: 0,
    revenue: 0,
    invoice_count: 0,
  });

  const [revenueChart, setRevenueChart] = useState([]);

  const [invoiceStatus, setInvoiceStatus] = useState([]);

  const [topEmployees, setTopEmployees] = useState([]);

  const [trafficSources, setTrafficSources] = useState([]);

  /* =========================================
      FETCH DATA
  ========================================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const statsRes = await Token.get("/dashboard/stats");

      setStats(statsRes.data.data);

      const revenueRes = await Token.get("/dashboard/revenue-chart");

      setRevenueChart(revenueRes.data.data || []);

      const invoiceRes = await Token.get("/dashboard/invoice-status");

      setInvoiceStatus(invoiceRes.data.data || []);

      /*
      |--------------------------------------------------------------------------
      | SUPERADMIN ONLY
      |--------------------------------------------------------------------------
      */

      if (role === "superadmin") {
        const employeeRes = await Token.get("/dashboard/top-employees");

        setTopEmployees(employeeRes.data.data || []);

        const sourceRes = await Token.get("/dashboard/traffic-sources");

        setTrafficSources(sourceRes.data.data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
      KPI CARDS
  ========================================= */

  const cards = [
    {
      title: "Total Leads",
      value: stats?.total_leads?.toLocaleString("en-IN") || 0,
      icon: <FaUsers />,
      color: "from-primary-500 to-primary-600",
    },

    {
      title: "Revenue",
      value: `₹${Number(stats?.revenue || 0).toLocaleString("en-IN")}`,
      icon: <FaMoneyBillWave />,
      color: "from-green-500 to-green-600",
    },

    {
      title: "Invoices",
      value: stats?.invoice_count?.toLocaleString("en-IN") || 0,
      icon: <FaFileInvoiceDollar />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  /* =========================================
      REVENUE CHART DATA
  ========================================= */

  const revenueData = useMemo(() => {
    const months = Array(12).fill(0);

    revenueChart.forEach((item) => {
      months[item.month - 1] = Number(item.total);
    });

    return months;
  }, [revenueChart]);

  return (
    <div className="space-y-6 min-h-screen p-1">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Dashboard
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor business performance and revenue analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkCard hover:bg-surface-muted dark:hover:bg-surface-darkMuted transition-all duration-200 text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <FaBell />
            Notifications
          </button>

          <button className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all duration-200 flex items-center gap-2">
            <FaChartLine />
            Analytics
          </button>
        </div>
      </div>

      {/* =====================================
          KPI CARDS
      ===================================== */}

      <div className="grid grid-cols-3 gap-5">
        {cards.map((item, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${item.color} p-6 shadow-lg`}
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-white/80 font-medium">
                  {item.title}
                </p>

                <h2 className="text-3xl font-black text-white mt-3">
                  {loading ? "..." : item.value}
                </h2>

                <div className="flex items-center gap-2 mt-4">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white text-xs">
                    <FaArrowTrendUp />
                  </div>

                  <span className="text-sm text-white font-semibold">
                    Live Data
                  </span>
                </div>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-white text-2xl backdrop-blur-sm">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================
          REVENUE + INVOICE
      ===================================== */}

      <div className="grid grid-cols-[1.8fr_1fr] gap-6">
        {/* =====================================
            REVENUE
        ===================================== */}

        <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Revenue Analytics
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Monthly revenue analytics
              </p>
            </div>

            <div className="h-10 px-4 rounded-xl bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
              2026
            </div>
          </div>

          <div className="p-4">
            <LineChart
              xAxis={[
                {
                  scaleType: "point",

                  data: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
              ]}
              series={[
                {
                  data: revenueData,
                  area: true,
                  color: "#2f69ca",
                },
              ]}
              height={360}
            />
          </div>
        </div>

        {/* =====================================
            INVOICE STATUS
        ===================================== */}

        <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Invoice Status
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Invoice payment overview
            </p>
          </div>

          <div className="p-4 flex items-center justify-center">
            <PieChart
              series={[
                {
                  data: invoiceStatus,
                  innerRadius: 60,
                  outerRadius: 120,
                  paddingAngle: 3,
                  cornerRadius: 5,
                },
              ]}
              height={320}
            />
          </div>
        </div>
      </div>

      {/* =====================================
          SUPERADMIN SECTIONS
      ===================================== */}

      {role === "superadmin" && (
        <div className="grid grid-cols-[1.2fr_1fr] gap-6">
          {/* =====================================
              TOP EMPLOYEES
          ===================================== */}

          <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Top Employees
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Top 5 employees by paid invoice amount
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-500 dark:text-primary-400 flex items-center justify-center text-xl">
                <FaRankingStar />
              </div>
            </div>

            <div className="p-6 space-y-5">
              {topEmployees.map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-5 p-5 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white font-black flex items-center justify-center text-lg">
                      {employee.name
                        ?.split(" ")
                        ?.map((x) => x[0])
                        ?.join("")}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">
                        {employee.name}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Employee
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Revenue
                    </p>

                    <h3 className="text-xl font-black text-primary-500 mt-1">
                      ₹{Number(employee.total_amount).toLocaleString("en-IN")}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =====================================
              TRAFFIC SOURCE
          ===================================== */}

          <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Lead Traffic Sources
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Lead generation platforms
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-500 dark:text-primary-400 flex items-center justify-center text-xl">
                <FaGlobe />
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {trafficSources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-5 text-white relative overflow-hidden"
                >
                  <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/10 rounded-full" />

                  <p className="text-sm text-white/70">{source.source}</p>

                  <h2 className="text-3xl font-black mt-3">{source.total}</h2>

                  <p className="text-xs mt-2 text-white/70">Leads Generated</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
