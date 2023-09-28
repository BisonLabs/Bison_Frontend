// Initialize default graph data
export let LineGraph = {
    name: "TEAM A",
    data: [] // Initialize as empty array
};

// Function to fetch data from the server
const fetchData = () => {
  fetch('http://192.168.254.80:4000/quote_history')
    .then(response => response.json())
    .then(data => {
      // Extract only the values (ignoring timestamps) for the line graph
      const lineGraphData = data.map(item => item[1]);

      LineGraph.data = lineGraphData;

      // Trigger graph update here if necessary
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
};

// Fetch data initially
fetchData();

// Set an interval to fetch data every 5 seconds (5000 milliseconds)
setInterval(fetchData, 50000);
