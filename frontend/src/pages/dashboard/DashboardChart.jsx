import { useEffect, useState } from "react";
import { BarChart, PieChart } from "@mui/x-charts";
import { toast } from "react-toastify";
import Token from "../../database/Token";

export default function DashboardChart({
  api,
  title,
  type = "bar",          // "bar" | "pie"
  xKey = "month",
  yKey = "value",
  height = 300,
  color = "#f97316",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await Token.get(api);

      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to load chart");
      }
    } catch (error) {
      toast.error("Chart API error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [api]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : type === "bar" ? (
        <BarChart
          xAxis={[{ dataKey: xKey, scaleType: "band" }]}
          series={[{ dataKey: yKey, color }]}
          dataset={data}
          height={height}
        />
      ) : (
        <PieChart
          series={[
            {
              data: data.map((item, index) => ({
                id: index,
                value: item[yKey],
                label: item.label || item[xKey],
              })),
              innerRadius: 40,
              outerRadius: 100,
            },
          ]}
          height={height}
        />
      )}
    </div>
  );
}