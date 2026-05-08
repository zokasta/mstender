import { useEffect, useState } from "react";
import Token from "../../database/Token";

export default function DashboardCard({
  title,
  icon,
  api,
  className = "",
  color = "",
  defaultValue = 0,
  target
}) {
  const [value,setValue] = useState(defaultValue)
  useEffect(() => {
    dataFetch();
  }, []);

  const dataFetch = async () => {
    try{
      const data = await Token.get(api)
      console.log(data.data.data.value)
      setValue(data.data.data.value)
    }catch(err){

    }
  };
  return (
    <div
      className={`${className} ${color} p-4 rounded-xl shadow-md flex items-center justify-between`}
    >
      <div>
        <h2 className="text-sm text-white/80">{title}</h2>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div>{icon}</div>
    </div>
  );
}
