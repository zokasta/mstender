import { FaUsers, FaUserTie, FaTicketAlt, FaChartLine } from "react-icons/fa";
import { BarChart, PieChart } from "@mui/x-charts";
import DashboardCard from "./DashboardCard";
import DashboardChart from "./DashboardChart";

export default function Dashboard() {
  const pieData = [
    { id: 0, value: 40, label: "Open Tickets" },
    { id: 1, value: 60, label: "Closed Tickets" },
  ];

  // KPI card data
  const kpis = [
    {
      title: "Total Leads (Month)",
      // value: "1,245",
      color: "bg-orange-500",
      api: "/dashboard/leads-count",
      icon: <FaUsers className="text-white text-3xl" />,
    },
    {
      title: "Customers (Month)",
      value: "342",
      color: "bg-blue-500",
      api: "/dashboard/customers-count",
      icon: <FaUserTie className="text-white text-3xl" />,
    },
    {
      title: "Invoices (Month)",
      value: "87",
      color: "bg-green-500",
      api: "/dashboard/invoices-count",
      icon: <FaTicketAlt className="text-white text-3xl" />,
    },
    {
      title: "Revenue (Month)",
      value: "₹12.4k",
      color: "bg-purple-500",
      api: "/dashboard/revenues-count",
      icon: <FaChartLine className="text-white text-3xl" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <DashboardCard
            api={kpi.api}
            color={kpi.color}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1.5fr] gap-4">
        {/* Bar Chart */}
        <DashboardChart
          api="/dashboard/monthly-customers-chart"
          title="Monthly Customers"
          type="bar"
          xKey="month"
          yKey="value"
          color="#f97316"
        />

        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Tickets Status</h2>
          <PieChart
            series={[
              {
                data: pieData,
                innerRadius: 30,
                outerRadius: 100,
              },
            ]}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
