const endpoint = 'https://sd-937311df.stardog.cloud:5820';
const dbName = 'AriQualityDataSet';
const graphUri = 'tag:stardog:designer:AirQualityTracker:data:final_largeData';
const username = 'sramara6@asu.edu';
const password = 'Team16@12345';

const executeQuery = async (query) => {
    try {
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

            return results;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        throw error;
    }
};

function displayResultsOnNewPage(results) {
    const resultsDiv = document.getElementById('results');
    let content = '<h1>SPARQL Query Results</h1>';
    content += '<table border="1"><tr><th>City</th><th>AQI Value</th></tr>';

    results.forEach(result => {
        content += `<tr><td>${result.city}</td><td>${result.aqiValue}</td></tr>`;
    });

    content += '</table>';
    resultsDiv.innerHTML = content;
}

const submitQuery = async () => {
    try {
        const aqiRange = document.getElementById('aqiRangeSelect').value;
        let filterQueryPart = '';
        switch (aqiRange) {
            case '20-60':
                filterQueryPart = 'FILTER (?aqiValue >= 20 && ?aqiValue <= 60)';
                break;
            case '60-100':
                filterQueryPart = 'FILTER (?aqiValue > 60 && ?aqiValue <= 100)';
                break;
            case '>100':
                filterQueryPart = 'FILTER (?aqiValue > 100)';
                break;
        }

        let query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX project: <http://www.semanticweb.org/divyasrisaibojanki/ontologies/2023/10/531Project/>

        SELECT DISTINCT ?city ?aqiValue
        FROM <${graphUri}>
        WHERE {
          ?city_x rdf:type project:City.
          ?city_x project:hasName ?city .
          ?city_x project:hasairqualitymetric ?metric.
          ?metric rdf:type project:AQI.
          ?metric project:hasAQIValue ?aqiValue.
          ${filterQueryPart}
        }
        `;

        const results = await executeQuery(query);

        if (results.length === 0) {
            return;
        }

        displayResultsOnNewPage(results);
    } catch (error) {
        console.error('Error submitting query:', error);
    }
};

document.getElementById('submitBtn').addEventListener('click', submitQuery);
