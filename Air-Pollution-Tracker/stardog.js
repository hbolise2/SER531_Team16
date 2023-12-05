
const endpoint = 'https://sd-937311df.stardog.cloud:5820';
const dbName = 'AriQualityDataSet';
const graphUri = 'tag:stardog:designer:AirQualityTracker:data:final_largeData';
const username = 'sramara6@asu.edu';
const password = 'Team16@12345';


const executeQuery = async (query) => {
    try {
        console.log('Executing SPARQL Query:', query);

        const response = await fetch(`${endpoint}/${dbName}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sparql-query',
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
            },
            body: query
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/sparql-results+xml')) {
            const text = await response.text();
            console.log('Raw XML response text:', text);

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'application/xml');
            const results = Array.from(xmlDoc.querySelectorAll('result')).map(result => {
                const binding = {};
                result.querySelectorAll('binding').forEach(variable => {
                    const variableName = variable.getAttribute('name');
                    const value = variable.querySelector('literal').textContent;
                    binding[variableName] = value;
                });
                return binding;
            });

            console.log('Parsed XML results:', results);

            return results;
        } else {
            console.log('Unexpected response format:', contentType);
            const text = await response.text();
            console.log('Response text:', text);
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
};


function displayResultsOnNewPage(results) {
    
    const resultsDiv = document.getElementById('results');

    
    let content = '<h1>SPARQL Query Results</h1>';
    content += '<table border="1"><tr><th>City</th><th>County</th><th>Average AQI Value</th></tr>';

    
    results.forEach(result => {
        content += `<tr>
                        <td>${result.city}</td>
                        <td>${result.county}</td>
                        <td>${result.averageAQI}</td>
                    </tr>`;
    });

    content += '</table>';

    
    resultsDiv.innerHTML = content;
}


const submitQuery = async () => {
    try {
        
        const selectedState = document.getElementById('stateSelect').value;
        const selectedYear = document.getElementById('yearSelect').value;

        
        let query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX project: <http://www.semanticweb.org/divyasrisaibojanki/ontologies/2023/10/531Project/>

        SELECT ?city ?county ?state (AVG(?aqiValue) AS ?averageAQI)
        FROM <${graphUri}>
        WHERE {
        ?city_x rdf:type project:City.
        ?city_x project:hasName ?city .
        ?city_x project:iscitylocatedin ?county_x.
        ?county_x rdf:type project:County.
        ?county_x project:hasName ?county.
        ?city_x project:hasairqualitymetric ?metric.
        ?metric rdf:type project:AQI.
        ?metric project:hasAQIValue ?aqiValue.
        # Add filter for the selected state (replace YourState with the actual state value)
        ?county_x project:iscountylocatedin ?state_x.
        ?state_x rdf:type project:State.
        ?state_x project:hasName "${selectedState}" .
        }
        GROUP BY ?city ?county ?state`;

        
        const results = await executeQuery(query);

        
        displayResultsOnNewPage(results);
    } catch (error) {
        console.error('Error submitting query:', error);
    }
};


document.getElementById('submitBtn').addEventListener('click', submitQuery);
