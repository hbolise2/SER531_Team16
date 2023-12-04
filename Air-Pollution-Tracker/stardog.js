// Function to handle the submission and execution of the SPARQL query
document.getElementById('submitBtn').addEventListener('click', function() {
    const city = document.getElementById('citySelect').value;
    const year = document.getElementById('yearSelect').value;

    console.log(city);
    console.log(year)

    // Constructing the SPARQL query using the selected city and year
    // PREFIX : <http://www.semanticweb.org/divyasrisaibojanki/ontologies/2023/10/531Project>
    const query = `
        PREFIX : <http://www.semanticweb.org/divyasrisaibojanki/ontologies/2023/10/531Project>
        SELECT ?city ?year ?aqi ?no2 ?co ?o3 ?so2
        WHERE {
            ?record a :AirQualityRecord ;
                    :hasCity "${city}" ;
                    :hasYear "${year}"^^xsd:integer ;
                    :hasAQI ?aqi ;
                    :hasNO2 ?no2 ;
                    :hasCO ?co ;
                    :hasO3 ?o3 ;
                    :hasSO2 ?so2 .
        }
    `;

    console.log('Constructed SPARQL query:', query);

    // Establish a connection to Stardog
    const conn = new stardogjs.Connection({
        username: 'Team16_531',
        password: 'Team16@12345',
        endpoint: 'https://sd-937311df.stardog.cloud:5820',
    });

    // Execute the SPARQL query
    stardogjs.query.execute(conn, 'AriQualityDataSet', query, 'application/sparql-results+json', {
        limit: 10,
        offset: 0,
    }).then(({ body }) => {
        displayResultsOnNewPage(body.results.bindings);
    }).catch(error => {
        console.error('Query execution error:', error);
    });
});

// Function to display results on a new page
function displayResultsOnNewPage(results) {
    const newWindow = window.open('', '_blank');
    let content = '<html><head><title>Query Results</title></head><body>';
    content += '<h1>SPARQL Query Results</h1>';
    content += '<table border="1"><tr><th>City</th><th>Year</th><th>AQI</th><th>NO2</th><th>CO</th><th>O3</th><th>SO2</th></tr>';

    results.forEach(result => {
        content += `<tr>
                        <td>${result.city.value}</td>
                        <td>${result.year.value}</td>
                        <td>${result.aqi.value}</td>
                        <td>${result.no2.value}</td>
                        <td>${result.co.value}</td>
                        <td>${result.o3.value}</td>
                        <td>${result.so2.value}</td>
                    </tr>`;
    });

    content += '</table></body></html>';
    newWindow.document.write(content);
    newWindow.document.close();
}
