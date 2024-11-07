import React, { useState, useEffect } from 'react';

function HostList() {
  const [hosts, setHosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        const response = await fetch('https://nagios.op-bit.nz/nagios4/cgi-bin/statusjson.cgi?query=hostlist&details=true', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('nagiosadmin:NVbDrRChB8d6FTbWodaZ'),
            'Accept': 'application/json',
          },

        });
  
        // You cannot use response.json() with 'no-cors' mode, 
        // and you can only access the response if the server allows it.
        if (response.ok) {
          const data = await response.text(); // Read as text, no body access
          // You can try to parse this text data as needed
          const parsedData = JSON.parse(data);
          setHosts(parsedData.data.hostlist);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div>
      {isLoading && <p>Loading host data...</p>}
      {error && <p>Error: {error.message}</p>}
      {Object.entries(hosts).map(([hostName, hostData]) => (
        <div key={hostName}>
          <h2>{hostData.name}</h2> 
          <p>Status: {hostData.status === 0 && <span style={{ color: 'green' }}>OK</span>}
                    {hostData.status === 1 && <span style={{ color: 'yellow' }}>Warning</span>}
                    
                    {hostData.status === 2 && <span style={{ color: 'red' }}>Critical</span>}</p>
          <p>Last Check: {new Date(hostData.last_check).toLocaleString()}</p> 
          <p>Plugin Output: {hostData.plugin_output}</p>
        </div>
      ))}
    </div>
  );
}

export default HostList;


/*
https://nagios.op-bit.nz/nagios4/cgi-bin/statusjson.cgi?query=servicelist&details=true
*/