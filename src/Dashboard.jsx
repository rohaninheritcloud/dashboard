// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function Dashboard() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const bearerToken = localStorage.getItem('bearerToken');
//   const orgId = localStorage.getItem('orgId');
//   const envId = localStorage.getItem('envId');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Initial API call to get domains
//         const response = await axios.get(
//           'https://anypoint.mulesoft.com/cloudhub/api/v2/applications',
//           {
//             headers: {
//               'Authorization': `Bearer ${bearerToken}`,
//               'X-ANYPNT-ENV-ID': envId,
//               'X-ANYPNT-ORG-ID': orgId,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         const domainsData = response.data.map(app => ({
//           id: app.id,
//           domain: app.domain,
//           stats: null,
//         }));

//         setData(domainsData);
//         console.log('Applications response:', domainsData);

//         // Fetch dashboard stats for each domain and update state
//         const fetchDomainStats = domainsData.map(async (app, index) => {
//           try {
//             const statsResponse = await axios.get(
//               `https://anypoint.mulesoft.com/cloudhub/api/v2/applications/${app.domain}/dashboardStats`,
//               {
//                 headers: {
//                   'Authorization': `Bearer ${bearerToken}`,
//                   'X-ANYPNT-ENV-ID': envId,
//                   'X-ANYPNT-ORG-ID': orgId,
//                   'Content-Type': 'application/json'
//                 }
//               }
//             );
//             console.log(`Dashboard stats for ${app.domain}:`, statsResponse.data);

//             // Update the state with the fetched statistics
//             setData(prevData => {
//               const newData = [...prevData];
//               newData[index].stats = statsResponse.data;
//               return newData;
//             });

//           } catch (error) {
//             console.error(`Error fetching dashboard stats for ${app.domain}:`, error);
//           }
//         });

//         // Wait for all dashboard stats to be fetched
//         await Promise.all(fetchDomainStats);
//         console.log(data.findIndex);

//       } catch (error) {
//         console.error('Error fetching applications:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [bearerToken, orgId, envId]);

//   const calculateAverages = (stats) => {
//     const aggregatedStats = {};
//     for (let key in stats.workerStatistics[0].statistics) {
//       const values = Object.values(stats.workerStatistics[0].statistics[key]);
//       const validValues = values.filter(val => val !== -1);
//       const sum = validValues.reduce((acc, val) => acc + val, 0);
//       const average = validValues.length ? (sum / validValues.length).toFixed(2) : 'N/A';
//       aggregatedStats[key] = average;
//     }
//     return aggregatedStats;
//   };

//   return (
//     <div className="dashboard-container">
//       {loading ? (
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Loading...</p>
//         </div>
//       ) : (
//         <div>
//           <h1>Welcome to the Dashboard!</h1>
//           <div className="domain-list">
//             {data.map((domainData, index) => (
//               <div key={index} className="domain-item">
//                 <h2>{domainData.domain}</h2>
//                 {domainData.stats ? (
//                   <div className="stats">
//                     {Object.keys(calculateAverages(domainData.stats)).map((statKey, statIndex) => (
//                       <div key={statIndex} className="stat-item">
//                         <span className="stat-name">{statKey}:</span>
//                         <span className="stat-value">
//                           {calculateAverages(domainData.stats)[statKey] === 'N/A' ? 
//                             domainData.stats[0] : 
//                             calculateAverages(domainData.stats)[statKey]}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p>Loading statistics...</p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Dashboard;
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const bearerToken = localStorage.getItem('bearerToken');
  const orgId = localStorage.getItem('orgId');
  const envId = localStorage.getItem('envId');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://anypoint.mulesoft.com/cloudhub/api/v2/applications',
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'X-ANYPNT-ENV-ID': envId,
              'X-ANYPNT-ORG-ID': orgId,
              'Content-Type': 'application/json',
            },
          }
        );
        const domainsData = response.data.map((app) => ({
          id: app.id,
          domain: app.domain,
          stats: null,
          workers: null,
          region: null,
        }));
        setData(domainsData);
        const fetchDomainData = domainsData.map(async (app, index) => {
          try {
            const statsResponse = await axios.get(
              `https://anypoint.mulesoft.com/cloudhub/api/v2/applications/${app.domain}/dashboardStats`,
              {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                  'X-ANYPNT-ENV-ID': envId,
                  'X-ANYPNT-ORG-ID': orgId,
                  'Content-Type': 'application/json',
                },
              }
            );
            const domainResponse = await axios.get(
              `https://anypoint.mulesoft.com/cloudhub/api/v2/applications/${app.domain}`,
              {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                  'X-ANYPNT-ENV-ID': envId,
                  'X-ANYPNT-ORG-ID': orgId,
                  'Content-Type': 'application/json',
                },
              }
            );
            setData((prevData) => {
              const newData = [...prevData];
              newData[index].stats = statsResponse.data;
              newData[index].workers = domainResponse.data.workers;
              newData[index].region = domainResponse.data.region;
              return newData;
            });
          } catch (error) {
            console.error(`Error fetching data for ${app.domain}:`, error);
          }
        });
        await Promise.all(fetchDomainData);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bearerToken, orgId, envId]);
  const calculateAverages = (stats) => {
    const aggregatedStats = {};
    if (stats.workerStatistics && stats.workerStatistics.length > 0) {
      const workerStats = stats.workerStatistics[0].statistics;
      if (workerStats.memoryTotalMax) {
        aggregatedStats['Memory Total Max'] = `${(workerStats.memoryTotalMax / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        aggregatedStats['Memory Total Max'] = 'N/A';
      }
      if (workerStats.memoryTotalUsed) {
        const memoryValues = Object.values(workerStats.memoryTotalUsed);
        const avgMemoryUsed = memoryValues.reduce((sum, value) => sum + value, 0) / memoryValues.length;
        aggregatedStats['Memory Total Used'] = `${(avgMemoryUsed / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        aggregatedStats['Memory Total Used'] = 'N/A';
      }
      if (workerStats.memoryPercentageUsed) {
        const memoryPercentageValues = Object.values(workerStats.memoryPercentageUsed);
        const avgMemoryPercentage = memoryPercentageValues.reduce((sum, value) => sum + value, 0) / memoryPercentageValues.length;
        aggregatedStats['Memory Percentage Used'] = `${avgMemoryPercentage.toFixed(2)}%`;
      } else {
        aggregatedStats['Memory Percentage Used'] = 'N/A%';
      }
      const cpuValues = Object.values(workerStats.cpu || {});
      if (cpuValues.length > 0) {
        const avgCpu = cpuValues.reduce((sum, value) => sum + value, 0) / cpuValues.length;
        aggregatedStats['CPU Utilization'] = `${avgCpu.toFixed(2)}%`;
      }
    }
    return aggregatedStats;
  };
  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div>
          <h1>Welcome to the Dashboard!</h1>
          <div className="domain-list">
            {data.map((domainData, index) => {
              const averages = domainData.stats ? calculateAverages(domainData.stats) : {};
              return (
                <div key={index} className="domain-item">
                  <h2>{domainData.domain}</h2>
                  {domainData.stats || domainData.workers ? (
                    <div className="stats">
                      {domainData.stats && Object.keys(averages).map((statKey, statIndex) => (
                        <div key={statIndex} className="stat-item">
                          <span className="stat-name">{statKey}:</span>
                          <span className="stat-value">{averages[statKey]}</span>
                        </div>
                      ))}
                      {domainData.workers && (
                        <>
                          <div className="stat-item">
                            <span className="stat-name">CPU:</span>
                            <span className="stat-value">{domainData.workers.type.cpu}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-name">Weight:</span>
                            <span className="stat-value">{domainData.workers.type.weight}</span>
                          </div>
                        </>
                      )}
                      {domainData.region && (
                        <div className="stat-item">
                          <span className="stat-name">Region:</span>
                          <span className="stat-value">{domainData.region}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Loading statistics...</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard