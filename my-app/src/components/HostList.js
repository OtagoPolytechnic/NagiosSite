import React, { useState, useEffect } from 'react';
import DiskChart from './DiskChart';

function HostList() {
  const [services, setServices] = useState({});
  const [hostGroups, setHostGroups] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [serviceResponse, hostGroupResponse] = await Promise.all([
          fetch('https://nagios.op-bit.nz/nagios4/cgi-bin/statusjson.cgi?query=servicelist&details=true', {
            method: 'GET',
            headers: {
              'Authorization': 'Basic ' + btoa('nagiosadmin:NVbDrRChB8d6FTbWodaZ'),
              'Accept': 'application/json',
            },
          }),
          fetch('https://nagios.op-bit.nz/nagios4/cgi-bin/objectjson.cgi?query=hostgrouplist&details=true', {
            method: 'GET',
            headers: {
              'Authorization': 'Basic ' + btoa('nagiosadmin:NVbDrRChB8d6FTbWodaZ'),
              'Accept': 'application/json',
            },
          })
        ]);

        if (serviceResponse.ok && hostGroupResponse.ok) {
          const serviceData = await serviceResponse.text();
          const hostGroupData = await hostGroupResponse.text();
          const parsedServiceData = JSON.parse(serviceData);
          const parsedHostGroupData = JSON.parse(hostGroupData);
          
          setServices(parsedServiceData.data.servicelist);
          setHostGroups(parsedHostGroupData.data.hostgrouplist);
        } else {
          throw new Error(`HTTP error! status: ${serviceResponse.status}`);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };        

    fetchData();
  }, []);

  const extractMetrics = (hostServices) => {
    const metrics = {
      cpu: hostServices['CPU Usage']?.plugin_output.match(/(\d+\.?\d*)%/) ? 
           parseFloat(hostServices['CPU Usage'].plugin_output.match(/(\d+\.?\d*)%/)[1]) : null,
      memory: hostServices['Memory Usage']?.plugin_output.match(/Used: (\d+) MB/) ?
              parseInt(hostServices['Memory Usage'].plugin_output.match(/Used: (\d+) MB/)[1]) : null,
      disk: parseDiskSpace(hostServices['Disk Space']) || { used: 0, total: 0 },
      status: hostServices['Host Alive']?.plugin_output.includes('PING OK') ? 'up' : 'down'
    };
    return metrics;
  };

  const parseDiskSpace = (diskOutput) => {
    if (!diskOutput?.perf_data) return null;
    
    // Parse performance data format: /=7743MB;23670;26629;0;29588
    const matches = diskOutput.perf_data.match(/\/=(\d+)MB;.*;(\d+)/);
    if (matches) {
      const usedSpace = parseInt(matches[1]);
      const totalSpace = parseInt(matches[2]);
      return { used: usedSpace, total: totalSpace };
    }
    return null;
  };

  const renderHostCard = (hostName, hostServices) => {
    const metrics = extractMetrics(hostServices);
    return (
      <div key={hostName} className="host-card">
        <div className={`host-header ${metrics.status}`}>
          <h2>{hostName}</h2>
          <span className={`status-indicator ${metrics.status}`}>
            {metrics.status.toUpperCase()}
          </span>
        </div>
        <div className="metrics">
          <div className="metric">
            <label>CPU Usage: {metrics.cpu !== null ? `${metrics.cpu}%` : 'N/A'}</label>
          </div>
          <div className="metric">
            <label>Memory Used: {metrics.memory !== null ? `${metrics.memory} MB` : 'N/A'}</label>
          </div>
          <div className="metric">
            <label>Disk Space</label>
            {metrics.disk && (
              <>
                <DiskChart used={metrics.disk.used} total={metrics.disk.total} />
                <div style={{ textAlign: 'center', marginTop: '5px' }}>
                  {`${Math.round((metrics.disk.used / metrics.disk.total) * 100)}% Used`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="host-groups-container">
      {isLoading && <p>Loading service data...</p>}
      {error && <p>Error: {error.message}</p>}
      {Object.entries(hostGroups).map(([groupName, group]) => (
        <div key={groupName} className="host-group">
          <h1 className="group-title">{groupName}</h1>
          <div className="host-grid">
            {group.members.map(hostName => 
              services[hostName] && renderHostCard(hostName, services[hostName])
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HostList;


/*
https://nagios.op-bit.nz/nagios4/cgi-bin/statusjson.cgi?query=servicelist&details=true
*/