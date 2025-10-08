// In src/components/DashboardChart/DashboardChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import './DashboardChart.css';

const DashboardChart = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["pinStats"],
    queryFn: () => apiRequest.get("/users/stats").then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) {
    return <div className="chart-loading">Loading Chart...</div>;
  }

  if (error || !data) {
    return <div className="chart-error">Could not load chart data.</div>;
  }
  
  // Format the data for the chart, using the new keys
  const formattedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
    Pins: item.pins,
    Likes: item.likes,
    Comments: item.comments,
  }));

  return (
    <div className="chartContainer">
      <h3>Your Activity (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ddd", borderRadius: "8px" }} />
          <Legend />
          {/* Add a <Bar> for each metric */}
          <Bar dataKey="Pins" fill="#e50829" />
          <Bar dataKey="Likes" fill="#8884d8" />
          <Bar dataKey="Comments" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;