// // // In src/components/DashboardChart/DashboardChart.jsx

// import React from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   RadialBarChart, RadialBar, PolarAngleAxis // Import RadialBarChart components
// } from 'recharts';
// import { useQuery } from '@tanstack/react-query';
// import apiRequest from '../../utils/apiRequest';
// import './DashboardChart.css'; // Make sure this CSS file exists and is linked

// // --- Neon Loading Spinner Component ---
// const NeonLoadingSpinner = () => (
//     <div className="neon-spinner-container">
//         <div className="neon-spinner"></div>
//         <div className="neon-spinner-text">Loading...</div>
//     </div>
// );

// const DashboardChart = () => {
//   const { isPending, error, data } = useQuery({
//     queryKey: ["pinStats"],
//     queryFn: () => apiRequest.get("/users/stats").then((res) => res.data),
//     staleTime: 1000 * 60 * 5,
//   });

//   if (isPending) {
//     return <NeonLoadingSpinner />; // Show neon spinner while loading
//   }

//   if (error || !data) {
//     return <div className="chart-error">Could not load chart data.</div>;
//   }
  
//   // Format the data for the Bar Chart
//   const formattedBarData = data.map(item => ({
//     date: new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
//     Pins: item.pins,
//     Likes: item.likes,
//     Comments: item.comments,
//   }));

//   // Aggregate data for the Radial Bar Chart (total counts)
//   const totalPins = data.reduce((sum, item) => sum + item.pins, 0);
//   const totalLikes = data.reduce((sum, item) => sum + item.likes, 0);
//   const totalComments = data.reduce((sum, item) => sum + item.comments, 0);

//   // Data for the RadialBarChart - proportional values
//   const totalActivity = totalPins + totalLikes + totalComments;

//   const formattedRadialData = [
//     { name: 'Pins', value: totalPins, fill: '#ff073a', percent: (totalPins / totalActivity) * 100 },
//     { name: 'Likes', value: totalLikes, fill: '#00eaff', percent: (totalLikes / totalActivity) * 100 },
//     { name: 'Comments', value: totalComments, fill: '#c0ff00', percent: (totalComments / totalActivity) * 100 },
//   ].filter(item => item.value > 0); // Only show items with actual values

//   return (
//     <div className="dashboard-charts-container">
//       {/* Bar Chart */}
//       <div className="chartContainer barChart">
//         <h3>Your Activity (Last 7 Days)</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart
//             data={formattedBarData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//             <XAxis dataKey="date" tick={{ fill: '#555' }} />
//             <YAxis allowDecimals={false} tick={{ fill: '#555' }} />
//             <Tooltip
//               cursor={{ fill: 'rgba(220, 38, 38, 0.1)' }} // Lighter red tint for tooltip background
//               wrapperStyle={{ outline: 'none' }}
//               contentStyle={{
//                 background: "rgba(34, 34, 34, 0.9)", // Darker, slightly transparent tooltip
//                 border: "1px solid #dc2626", // Red border
//                 borderRadius: "8px",
//                 color: "#f0f0f0", // Light text color
//               }}
//               labelStyle={{ color: '#dc2626', fontWeight: 'bold' }} // Red label for date
//               itemStyle={{ color: '#f0f0f0' }} // Light text for values
//             />
//             <Legend wrapperStyle={{ paddingTop: '10px', color: '#333' }} />
//             <Bar dataKey="Pins" fill="#ff073a" />        {/* Vibrant Red */}
//             <Bar dataKey="Likes" fill="#00eaff" />       {/* Cyan Blue */}
//             <Bar dataKey="Comments" fill="#c0ff00" />    {/* Lime Green */}
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Radial Bar Chart with Neon Effect */}
//       {totalActivity > 0 && ( // Only show if there's any activity
//         <div className="chartContainer radialChart">
//           <h3>Total Engagement Overview</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <RadialBarChart
//               cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={20} data={formattedRadialData}
//               startAngle={90} endAngle={-270} // Start from top, go clockwise
//             >
//               <PolarAngleAxis type="number" domain={[0, totalActivity]} angleAxisId={0} tick={false} />
//               <RadialBar
//                 minAngle={15}
//                 label={{
//                   position: 'insideStart',
//                   fill: '#fff',
//                   fontSize: '14px',
//                   fontWeight: 'bold',
//                   formatter: (value) => `${Math.round((value / totalActivity) * 100)}%`, // Show percentage
//                 }}
//                 background
//                 dataKey="value"
//               >
//                 {/* Custom Label component for a better look */}
//                 {
//                   formattedRadialData.map((entry, index) => (
//                     <text
//                       key={`label-${index}`}
//                       x={entry.cx + Math.cos(entry.midAngle * (Math.PI / 180)) * (entry.outerRadius + 10)}
//                       y={entry.cy + Math.sin(entry.midAngle * (Math.PI / 180)) * (entry.outerRadius + 10)}
//                       fill={entry.fill}
//                       textAnchor={entry.midAngle > 270 || entry.midAngle < 90 ? 'start' : 'end'}
//                       dominantBaseline="central"
//                       style={{ filter: `drop-shadow(0 0 5px ${entry.fill})`, fontSize: '12px', fontWeight: 'bold' }}
//                     >
//                       {entry.name}
//                     </text>
//                   ))
//                 }
//               </RadialBar>
//               <Tooltip
//                 contentStyle={{
//                   background: "rgba(34, 34, 34, 0.9)",
//                   border: "1px solid #00eaff", // Cyan border for this chart's tooltip
//                   borderRadius: "8px",
//                   color: "#f0f0f0",
//                 }}
//                 itemStyle={{ color: '#f0f0f0' }}
//                 formatter={(value, name, props) => [`${value} (${props.payload.percent.toFixed(1)}%)`, name]}
//               />
//               <Legend
//                 iconSize={10}
//                 layout="vertical"
//                 verticalAlign="middle"
//                 align="right"
//                 wrapperStyle={{
//                   paddingLeft: '20px',
//                   color: '#333',
//                   fontSize: '13px',
//                 }}
//               />
//             </RadialBarChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//       {totalActivity === 0 && (
//           <div className="chartContainer radialChart no-activity">
//             <h3>Total Engagement Overview</h3>
//             <p className="info-message">No activity to display yet. Start creating pins!</p>
//           </div>
//       )}
//     </div>
//   );
// };

// export default DashboardChart;


// In src/components/DashboardChart/DashboardChart.jsx

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, // Radial Chart imports
  LineChart, Line // New Line Chart imports
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import useAuthStore from '../../utils/authStore';
import './DashboardChart.css'; 

// --- Neon Loading Spinner Component (kept for completeness) ---
const NeonLoadingSpinner = () => (
    <div className="neon-spinner-container">
        <div className="neon-spinner"></div>
        <div className="neon-spinner-text">Loading...</div>
    </div>
);

const DashboardChart = () => {
  const { currentUser } = useAuthStore();

  const { isPending, error, data } = useQuery({
    queryKey: ["pinStats", currentUser?._id],
    queryFn: () => apiRequest.get("/users/stats").then((res) => res.data),
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5,
  });

  if (!currentUser) {
    return null;
  }

  if (isPending) {
    return <NeonLoadingSpinner />; 
  }

  if (error || !data) {
    return <div className="chart-error">Could not load chart data.</div>;
  }
  
  // Format the data for the Bar Chart & Line Chart (same structure)
  const formattedTimeData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
    Pins: item.pins,
    Likes: item.likes,
    Comments: item.comments,
  }));

  // Aggregate data for the Radial Bar Chart (total counts)
  const totalPins = data.reduce((sum, item) => sum + item.pins, 0);
  const totalLikes = data.reduce((sum, item) => sum + item.likes, 0);
  const totalComments = data.reduce((sum, item) => sum + item.comments, 0);
  const totalActivity = totalPins + totalLikes + totalComments;

  const formattedRadialData = [
    { name: 'Pins', value: totalPins, fill: '#ff073a', percent: (totalPins / totalActivity) * 100 },
    { name: 'Likes', value: totalLikes, fill: '#00eaff', percent: (totalLikes / totalActivity) * 100 },
    { name: 'Comments', value: totalComments, fill: '#c0ff00', percent: (totalComments / totalActivity) * 100 },
  ].filter(item => item.value > 0); 

  return (
    <div className="dashboard-charts-container">
      
      {/* 1. Dramatic Line Chart (New) */}
      <div className="chartContainer lineChart dramatic-theme">
        <h3>Trend History (Last 5 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedTimeData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            {/* Define the gradient for the line area */}
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff073a" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff073a" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            {/* Dramatic dark grid and axis for the dark theme */}
            <CartesianGrid stroke="#333333" strokeDasharray="5 5" />
            <XAxis dataKey="date" stroke="#999" />
            <YAxis allowDecimals={false} stroke="#999" />
            
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              contentStyle={{ 
                background: "rgba(34, 34, 34, 0.9)", 
                border: "1px solid #ff073a", // Red border
                borderRadius: "8px",
                color: "#f0f0f0", 
              }}
              labelStyle={{ color: '#ff073a', fontWeight: 'bold' }}
              itemStyle={{ color: '#f0f0f0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', color: '#f0f0f0' }} />
            
            {/* Pins line - dramatic red/pink */}
            <Line 
              type="monotone" 
              dataKey="Pins" 
              stroke="#ff073a" 
              strokeWidth={3} 
              activeDot={{ r: 8, fill: '#ff073a', stroke: '#fff' }} 
              dot={false}
              isAnimationActive={true}
              animationDuration={2000}
            />
             {/* Likes line - subtle contrast for dramatic flair */}
            <Line 
              type="monotone" 
              dataKey="Likes" 
              stroke="#00eaff" 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: '#00eaff', stroke: '#fff' }} 
              dot={false}
              isAnimationActive={true}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Bar Chart */}
      <div className="chartContainer barChart">
        <h3>Activity Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={formattedTimeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fill: '#555' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#555' }} />
            <Tooltip
              cursor={{ fill: 'rgba(220, 38, 38, 0.1)' }} 
              wrapperStyle={{ outline: 'none' }}
              contentStyle={{
                background: "rgba(34, 34, 34, 0.9)", 
                border: "1px solid #dc2626", 
                borderRadius: "8px",
                color: "#f0f0f0", 
              }}
              labelStyle={{ color: '#dc2626', fontWeight: 'bold' }} 
              itemStyle={{ color: '#f0f0f0' }} 
            />
            <Legend wrapperStyle={{ paddingTop: '10px', color: '#333' }} />
            <Bar dataKey="Pins" fill="#ff073a" />        
            <Bar dataKey="Likes" fill="#00eaff" />       
            <Bar dataKey="Comments" fill="#c0ff00" />    
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Radial Bar Chart with Neon Effect */}
      {totalActivity > 0 && ( 
        <div className="chartContainer radialChart">
          <h3>Total Engagement Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={20} data={formattedRadialData}
              startAngle={90} endAngle={-270} 
            >
              <PolarAngleAxis type="number" domain={[0, totalActivity]} angleAxisId={0} tick={false} />
              <RadialBar
                minAngle={15}
                label={{
                  position: 'insideStart',
                  fill: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  formatter: (value) => `${Math.round((value / totalActivity) * 100)}%`, 
                }}
                background
                dataKey="value"
              >
              </RadialBar>
              <Tooltip
                contentStyle={{
                  background: "rgba(34, 34, 34, 0.9)",
                  border: "1px solid #00eaff", 
                  borderRadius: "8px",
                  color: "#f0f0f0",
                }}
                itemStyle={{ color: '#f0f0f0' }}
                formatter={(value, name, props) => [`${value} (${props.payload.percent.toFixed(1)}%)`, name]}
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  paddingLeft: '20px',
                  color: '#333',
                  fontSize: '13px',
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      )}
      {totalActivity === 0 && (
          <div className="chartContainer radialChart no-activity">
            <h3>Total Engagement Overview</h3>
            <p className="info-message">No activity to display yet. Start creating pins!</p>
          </div>
      )}
    </div>
  );
};

export default DashboardChart;