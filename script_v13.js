
const width = 1220;
const height = 610;
const Lheight = 600*1.3;
const Lwidth = 1100*1.3;
const Bheight = 50;
const Bwidth = 400;
const spacing =10;

const state = {
    selectedYear: [],
    trade: [],
    countryNames: [],
    importValues: [],
    selectedCountries: [],
    selectedCountries1: [],
    selectedCountriesImp: [],
    selectedCountriesExp: [],
    selectedCountriesIDExp: [],
    colorComp: [],
    selectedCountriesNamesGraph: []    
};
state.selectedYear = 2022;
state.trade = "Import";

selectedCountries = []; 
selectedCountriesImp = [];


// Projection set to Mercator
const projection = d3.geoMercator()
    .scale((width - 3) / (2 * Math.PI))
    .translate([width / 2, height / 2])
    .center([0, 0]);

// Path generator with specified projection
const path = d3.geoPath().projection(projection);

// Zoom constant for view readjustment
const zoom = d3.zoom()
    .scaleExtent([1, 3])
    .on("zoom", zoomed);

// SVG element for the map
const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

// Map background setting
svg.style("background-color", "F7EEDD");

// SVG element for histogram
const svgglobal = d3.select("#global")
    .append("svg")
    .attr("viewBox", [-50, 0, Lwidth*1.4, Lheight*1.4])
    .attr("Lwidth", Lwidth*1.4)
    .attr("Lheight", Lheight*1.4);

// Calculating the maximum value of the histogram
const maxHistogramValue = d3.max(state.importValues);

// Setting y scale for histogram with numbers added to the scale
const yScale = d3.scaleLinear()
    .domain([0, maxHistogramValue])
    .range([Lheight - 120, 0]);

// Adding numbers to the y-axis scale
const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSize(0)
    .tickPadding(10);



// SVG element for buttons
const svgtrade = d3.select("#trade")
    .append("svg")
    .attr("viewBox", [0, 0, Bwidth, Bheight])
    .attr("Bwidth", Bwidth)
    .attr("Bheight", Bheight);

// SVG element for side bar
const svgside = d3.select("#side")
    .append("svg")
    .attr("viewBox", [0, 0, width/3, height])
    .attr("width", width/3)
    .attr("height", height*2)
    .style("background-color", "lightgray");




// Treemap SVG element
const svggraph = d3.select("#graph")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", height)
    .attr("height", height)
    .on("upgradeTreemapSimple", updateTreemapSimple);



// Group element for map features
const g = svg.append("g");

// Treemap layout declaration
const treemap = d3.treemap()
    .size([width, height])
    .padding(1);



const button1 = svgtrade.append("g")
    .attr("Bwidth", Bwidth/2)
    .attr("Bheight", Bheight)
    .on("click", clickImport);

const button2 = svgtrade.append("g")
    .attr("Bwidth", Bwidth/2)
    .attr("Bheight", Bheight)
    .on("click", clickExport);

// Creation of Button 1 (Import Button)
button1.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", Bwidth/2)
    .attr("height", Bheight)
    .attr("fill", "#FC4100")
    .attr("stroke", "black");  
// Text element Button 1
button1.append("text")  
    .attr("x", Bwidth / 4)  
    .attr("y", Bheight / 2)
    .attr("dy", "0.35em")
    .style("font-size", "24px")
    .attr("text-anchor", "middle")  
    .text("Import")
    .style("fill", "white");  

// Creation of Button 2 (Export Button)
button2.append("rect")
    .attr("x", Bwidth/2 + spacing)  
    .attr("y", 0)
    .attr("width", Bwidth)
    .attr("height", Bheight)
    .attr("fill", "#FC4100")
    .attr("stroke", "black");  
// Text element Button 2 
button2.append("text")  
    .attr("x", Bwidth / 4 + Bwidth/2 + spacing)      
    .attr("y", Bheight / 2)
    .attr("dy", "0.35em")  
    .style("font-size", "24px")
    .attr("text-anchor", "middle")  
    .text("Export")
    .style("fill", "white");  

// Creation of histogram 
const histogram = svgglobal.append("g")
    .attr("Lwidth", Lwidth)
    .attr("Lheight", Lheight);
histogram.append("rect")
    .attr("Lwidth", Lwidth*1.2)
    .attr("Lheight", Lheight*1.2)
    .attr("fill", "lightgrey");

// Function for receiving data from fin.csv and visualizing in the histogram plot
function defaultHistogram() {
    
    // Reading data from csv file, depending on selected year and trading type
    d3.csv("fin.csv").then(data => {
        const stringYear = state.selectedYear.toString();
        const tradeYear = state.trade.toString();
        console.log("Trade:", state.trade, tradeYear);
        console.log("Selected Year:", state.selectedYear, stringYear);
        console.log("Fin Value:", data[2]['Year']); // Make sure 'Year' is the correct column name
    
        // Filtering data dependent on selected year
        const filteredData = data.filter(d => d['Year'] === stringYear);
    
        console.log("Filtered Names:", filteredData);
    
        // Extracting import values and country names (important: import values can take data for import and export trading)
        const importValues = filteredData.map(d => d[tradeYear]);
        const countryNames = filteredData.map(d => d['Name']);
    
        console.log("Import Values:", importValues);
        console.log("Country Names:", countryNames);
    
        // Sorting import values in descending order and aligning country names accordingly
        const sortedIndices = importValues.map((value, index) => ({ value, index }))
            .sort((a, b) => b.value - a.value)
            .map(data => data.index);
        const sortedCountryNames = sortedIndices.map(index => countryNames[index]);
        const sortedImportValues = sortedIndices.map(index => importValues[index]);
    
        // Select the top 25 values and country names
        const top25ImportValues = sortedImportValues.slice(0, 25);
        const top25CountryNames = sortedCountryNames.slice(0, 25);
    
        state.importValues = top25ImportValues;
        state.countryNames = top25CountryNames;
    
        console.log("Top 25 Values:", state.importValues, state.countryNames);
    });
    
    // Setting bar scales in plot
    const barPadding = 10; 
    const barWidth = (Lwidth / state.importValues.length) - barPadding;
    const barHeightScale = d3.scaleLinear()
        .domain([0, d3.max(state.importValues)])
        .range([0, Lheight-450]);
    
    // Resetting histogram bars and text
    histogram.selectAll("rect")
        .attr("y", Lheight - 100)
        .attr("height", 0)
        .remove();
    histogram.selectAll("text")
        .remove();

    // Selecting histogram element and appending bars
        histogram.selectAll("rect")
            .data(state.importValues)
            .enter()
            .append("rect")
            .attr("x", (_, i) => i * (barWidth + barPadding))
            .attr("y", Lheight - 100)
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("fill", "#58A399")
            .transition()
            .duration(600)
            .delay((_, i) => i * 15)
            .attr("y", d => Lheight - barHeightScale(d) - 120)
            .attr("height", d => barHeightScale(d))
            .style("background-color", "white");

    // Adding y-axis to the histogram
    const yAxis = d3.axisLeft(yScale)
        .ticks(maxHistogramValue)
        .tickSize(10)
        .tickPadding(10)
        .tickFormat(d3.format(".2s")); 

    histogram.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Adding line at the bottom of the bars
    histogram.append("line")
        .attr("x1", 0)
        .attr("y1", Lheight - 120)
        .attr("x2", Lwidth)
        .attr("y2", Lheight - 120)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
        

    // Adding text elements for histogram bars
    histogram.selectAll("text")
        .data(state.countryNames)
        .enter()
        .append("text")
        .attr("x", (_, i) => i * (barWidth + barPadding) - 125 + barWidth / 2)
        .attr("y", Lheight - 35) 
        .attr("text-anchor", "left")
        .attr("font-size", "36px")
        .attr("fill", "black") 
        .attr("transform", (_, i) => `rotate(45, ${i * (barWidth + barPadding) + barWidth / 2 }, ${Lheight+60})`) // Turning text 45 degrees for better readability
        .text(d => d);


}
    
// Loading histogram when visiting website
defaultHistogram();

// Button 1 function for siplaying Import values in histogram
function clickImport() {
    state.trade = "Import";
    updateTreemapComplex();
    defaultHistogram();
}

// Button 2 function for siplaying Export values in histogram
function clickExport() {
    state.trade = "Export";
    defaultHistogram();
}

// Declaring margins and and space for slider
const margin = {top: 20, right: 100, bottom: 20, left: 0};
const widthS = 550 - margin.left - margin.right;
const heightS = 70 - margin.top - margin.bottom;

// Appending SVG element to slider div container
const svgslider = d3.select("#slider")
              .append("svg")
              .attr("width", widthS + margin.left + margin.right)
              .attr("height", heightS + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Defining the temporal scale for the slider
const x = d3.scaleTime()
            .domain([new Date(2017, 0, 1), new Date(2022, 0, 1)]) // Adjust the domain to your desired year range
            .range([0, width])
            .clamp(true);

// Adding slider axis
const xAxis = d3.axisBottom(x)
                .ticks(d3.timeYear.every(1))
                .tickFormat(d3.timeFormat("%Y"))
                .tickSize(0)
                .tickPadding(10);
// Adding slider 
svgslider.append("g")
   .attr("class", "x axis")
   .attr("transform", `translate(0,${heightS / 2})`)
   .call(xAxis)
   .select(".domain")
   .remove();

// Group element for slider features
const slider = svgslider.append("g")
                  .attr("class", "slider")
                  .attr("transform", `translate(0,${heightS / 2})`);
// Adding track for slider
slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function(event) { handleDrag(event); }));

// Adding handle for dragging
const handle = slider.insert("circle", ".track-overlay")
                     .attr("class", "handle")
                     .attr("r", 9);

// Adding label to display current selected year
const label = slider.append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    .attr("dy", "-1.5em");

// Function to only display full years, not floats
function snapToYear(date) {
    const year = date.getFullYear();
    return new Date(year, 0, 1);
    
}
// Function for dragging handle with mouse
function handleDrag(event) {
    const date = x.invert(event.x);
    const snappedDate = snapToYear(date);
    handle.attr("cx", x(snappedDate));
    label.attr("x", x(snappedDate))
         .text(d3.timeFormat("%Y")(snappedDate));
    
    state.selectedYear = snappedDate.getFullYear();
    console.log("Selected Year:", state.selectedYear);

}

// Initial value for slider 
const initialValue = snapToYear(new Date(2022, 0, 1)); 
handle.attr("cx", x(initialValue));
label.attr("x", x(initialValue))
     .text(d3.timeFormat("%Y")(initialValue));


// Creating box for displaying selected country details
const infoBox = d3.select("body").append("div")
    .attr("id", "info-box")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)")
    .style("display", "none")
    .text("");

// Loading CSV file and creating call IDs to country details, e.g. Import/Export 
let countryMap = new Map();
d3.csv("fin.csv").then(data => {
    data.forEach(row => {
        countryMap.set(row.ID, {
            year: row.Year,
            id: row.ID,
            name: row.Name,
            // IDs of countries selected country imports from
            id1: row.ImpIDA,
            id2: row.ImpIDB,
            id3: row.ImpIDC,
            id4: row.ImpIDD,
            id5: row.ImpIDE,
            id6: row.ImpIDF,
            id7: row.ImpIDG,
            id8: row.ImpIDH,
            id9: row.ImpIDI,
            id10: row.ImpIDJ,
            // IDs of countries selected country exports to
            ed1: +row.ExpIDA,
            ed2: +row.ExpIDB,
            ed3: +row.ExpIDC,
            ed4: +row.ExpIDD,
            ed5: +row.ExpIDE,
            ed6: +row.ExpIDF,
            ed7: +row.ExpIDG,
            ed8: +row.ExpIDH,
            ed9: +row.ExpIDI,
            ed10: +row.ExpIDJ,
            // Value of Imports
            import: +row.Import,
            export: +row.Export,
            import1: +row.ImportA,
            import2: +row.ImportB,
            import3: +row.ImportC,
            import4: +row.ImportD,
            import5: +row.ImportE,
            import6: +row.ImportF,
            import7: +row.ImportG,
            import8: +row.ImportH,
            import9: +row.ImportI,
            import10: +row.ImportJ,
            // Value of exports
            export1: +row.ExportA,
            export2: +row.ExportB,
            export3: +row.ExportC,
            export4: +row.ExportD,
            export5: +row.ExportE,
            export6: +row.ExportF,
            export7: +row.ExportG,
            export8: +row.ExportH,
            export9: +row.ExportI,
            export10: +row.ExportJ,
        });


        
    });

    // Initializing treemap with default values, no country selected yet
    const defaultCountry = { name: "Default Country", import: 100, export: 100, details: [] };
    updateTreemapSimple(defaultCountry);

    // Loading and displaying world map, taken from observable hq
    d3.json("world-110m.v1.json").then(world => {
        const countries = g.append("g")
            .attr("fill", "#58A399")
            .attr("cursor", "pointer")
            .selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features)
            .join("path")
            .on("click", clicked)
            .attr("d", path);
        countries.append("title")
            .text(d => d.properties.name);
        g.append("path")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path(topojson.mesh(world, world.objects.countries, (a, b) => a !== b)));
        svg.call(zoom);
    });

    console.log("Country Map:", countryMap);

});


// Function for handling mouse hovering over treemap elements
function handleMouseOver(event, d) {
    d3.select(this)
        .attr("fill", "orange");
    // Displaying infobox when hovering
    infoBox.style("display", "block")
        .html(`Country: ${d.data.name}<br>Import: ${d.data.import}<br>Export: ${d.data.export}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
}

// Function for handling mouse moving away from element 
function handleMouseOut(event, d) {
    d3.select(this)
        .attr("fill", "steelblue");

    infoBox.style("display", "none");
}


// Function for updating treemap with import/export data
function updateTreemapSimple(country) {
    console.log("Received country data for treemap:", country);
    // Encoding import/export data
    const data = {
        name: country.name,
        children: [
            { name: "Import", value: country.import },
            { name: "Export", value: country.export }
        ]
    };
    // Computing import/export ratio
    colorcomp = country.import/(country.import+country.export);
    state.colorComp = colorcomp;
    console.log("Color:", state.colorComp);
    console.log(country.name, country.id, " lol");

    const root = d3.hierarchy(data)
        .sum(d => d.value);

    treemap(root);
    // Adding treemap element to group element
    const nodes = svggraph.selectAll("g")
        .data([null]);
    const nodeEnter = nodes.enter()
        .append("g");
    const rects = nodeEnter.merge(nodes)
        .selectAll("rect")
        .data(root.leaves(), d => d.data.name);
    // Displaying treemaps rectangles
    rects.enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", function(event, d) {
            if (d.data.name === "Export") {
                handleRectClickExport(event, d);
            }
            if (d.data.name === "Import") {
                handleRectClickImport(event, d);
            }
        })
        .merge(rects)
        .transition()
        .duration(750)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue");
    // Animation for previous rectangles
    rects.exit()
        .transition()
        .duration(750)
        .attr("width", 0)
        .attr("height", 0)
        .remove();
    // Text elements for treemaps rectangles
    const texts = nodeEnter.merge(nodes)
        .selectAll("text")
        .data(root.leaves(), d => d.data.name);

    texts.enter()
        .append("text")
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${d.data.name}: ${d.data.value}`)
        .attr("font-size", "30px")
        .attr("fill", "white")
        .merge(texts)
        .transition()
        .duration(750)
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${d.data.name}: ${d.data.value}`);
    // Animation for previous text elements
    texts.exit()
        .transition()
        .duration(750)
        .attr("fill-opacity", 0)
        .remove();

    
}


// Function for updating the treemap with import/export countries data, encoded as selectedCountries
function updateTreemapGraphImport(country) {
    // Encoding data for advancedtreemap
    let datac = {
        name: country.name,
        children: [
            { name: selectedCountries[0], value: selectedCountriesImp[0] },
            { name: selectedCountries[1], value: selectedCountriesImp[1] },
            { name: selectedCountries[2], value: selectedCountriesImp[2] },
            { name: selectedCountries[3], value: selectedCountriesImp[3] },
            { name: selectedCountries[4], value: selectedCountriesImp[4] },
            { name: selectedCountries[5], value: selectedCountriesImp[5] },
            { name: selectedCountries[6], value: selectedCountriesImp[6] },
            { name: selectedCountries[7], value: selectedCountriesImp[7] },
            { name: selectedCountries[8], value: selectedCountriesImp[8] },
            { name: selectedCountries[9], value: selectedCountriesImp[9] }
        ]
    };
    
    selectedCountries.forEach(selectedCountry => {
        d3.csv("fin.csv").then(data => {
            const countryRow = data.find(d => d['ID'] === selectedCountry);
            if (countryRow) {
                selectedCountriesNames = [
                    countryRow['Name'], 
                ].map(String);
            } else {
                console.log('Country not found');
                
            }
            state.selectedCountriesNamesGraph.push(...selectedCountriesNames);
        });
    });
    console.log("imp1", selectedCountriesNames);


    console.log("imp1", selectedCountriesImp);
    console.log("Country", countryMap.id);
    
    const root = d3.hierarchy(datac)
        .sum(d => d.value);

    treemap(root);
    // Adding treemap to group element
    const nodes = svggraph.selectAll("g")
        .data([null]);
    const nodeEnter = nodes.enter()
        .append("g");
    // Connecting data to treemap layout
    const rects = nodeEnter.merge(nodes)
        .selectAll("rect")
        .data(root.leaves(), d => d.data.name);
    // Adding new treemap rectangles
    rects.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleRectClickImport)
        .merge(rects)
        .transition()
        .duration(750)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue");
    // Sending old rectangles of treemap to the shadow realm 
    rects.exit()
        .transition()
        .duration(750)
        .attr("width", 0)
        .attr("height", 0)
        .remove();
    // Connecting data with treemap text elements
    const texts = nodeEnter.merge(nodes)
        .selectAll("text")
        .data(root.leaves(), d => d.data.name);
    // Displaying text for treemap
    texts.enter()
        .append("text")
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${d.data.name}: ${d.data.value}`)
        .attr("font-size", "30px")
        .attr("fill", "white")
        .merge(texts)
        .transition()
        .duration(750)
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${state.selectedCountriesNamesGraph}: ${d.data.value}`);
    // Animation for previous text leaving
    texts.exit()
        .transition()
        .duration(750)
        .attr("fill-opacity", 0)
        .remove();
}

// Function for updating the treemap with import/export countries data, encoded as selectedCountries
function updateTreemapGraphExport(country) {
    // Encoding data for advancedtreemap
    let datac = {
        name: country.name,
        children: [
            { name: selectedCountriesIDExp[0], value: selectedCountriesExp[0] },
            { name: selectedCountriesIDExp[1], value: selectedCountriesExp[1] },
            { name: selectedCountriesIDExp[2], value: selectedCountriesExp[2] },
            { name: selectedCountriesIDExp[3], value: selectedCountriesExp[3] },
            { name: selectedCountriesIDExp[4], value: selectedCountriesExp[4] },
            { name: selectedCountriesIDExp[5], value: selectedCountriesExp[5] },
            { name: selectedCountriesIDExp[6], value: selectedCountriesExp[6] },
            { name: selectedCountriesIDExp[7], value: selectedCountriesExp[7] },
            { name: selectedCountriesIDExp[8], value: selectedCountriesExp[8] },
            { name: selectedCountriesIDExp[9], value: selectedCountriesExp[9] }
        ]
    };
    selectedCountriesNamesGraph = [];
    selectedCountriesIDExp = selectedCountriesIDExp.map(String);
    d3.csv("fin.csv").then(data => {
        selectedCountriesIDExp.forEach(selectedCountry => {
            const countryRow = data.find(d => d['ID'] === selectedCountry);
            if (countryRow) {
                selectedCountriesNamesGraph = [
                    countryRow['Name'], 
                ].map(String);
            } else {
                console.log('Country not found');
            }
            state.selectedCountriesNamesGraph.push(...selectedCountriesNamesGraph);
            console.log("exp111", selectedCountriesNamesGraph);
        });
    });

    console.log("exp11", selectedCountriesIDExp);
    
    console.log("Country", countryMap.id);
    
    const root = d3.hierarchy(datac)
        .sum(d => d.value);

    treemap(root);
    // Adding treemap to group element
    const nodes = svggraph.selectAll("g")
        .data([null]);
    const nodeEnter = nodes.enter()
        .append("g");
    // Connecting data to treemap layout
    const rects = nodeEnter.merge(nodes)
        .selectAll("rect")
        .data(root.leaves(), d => d.data.name);
    // Adding new treemap rectangles
    rects.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleRectClickExport)
        .merge(rects)
        .transition()
        .duration(750)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue");
    // Sending old rectangles of treemap to the shadow realm 
    rects.exit()
        .transition()
        .duration(750)
        .attr("width", 0)
        .attr("height", 0)
        .remove();
    // Connecting data with treemap text elements
    const texts = nodeEnter.merge(nodes)
        .selectAll("text")
        .data(root.leaves(), d => d.data.name);
    // Displaying text for treemap
    texts.enter()
        .append("text")
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${d.data.names}: ${d.data.value}`)
        .attr("font-size", "30px")
        .attr("fill", "white")
        .merge(texts)
        .transition()
        .duration(750)
        .attr("x", d => d.x0 + 15)
        .attr("y", d => d.y0 + 35)
        .text(d => `${d.data.name}: ${d.data.value}`);
    // Animation for previous text leaving
    texts.exit()
        .transition()
        .duration(750)
        .attr("fill-opacity", 0)
        .remove();
}

// (unfinished) Function to show trading connections of second order (as in traders of traders of selected country)
function updateTreemapComplex(d) {
    console.log("Y:",state.selectedCountries);
    selectedCountries1 = [];
    selectedCountries2 = [];
    selectedCountries3 = [];
    selectedCountries4 = [];
    selectedCountries5 = [];
    selectedCountries6 = [];
    selectedCountries7 = [];
    selectedCountries8 = [];
    selectedCountries9 = [];
    selectedCountries10 = [];
    // Importing data from CSV 
    d3.csv("fin.csv").then(data => {
        const selectedCountryRow = data.find(row => row['ID'] === state.selectedCountries[0]);
        if (selectedCountryRow) {
            const selectedCountries1 = [
                selectedCountryRow['ImpIDA'],
                selectedCountryRow['ImpIDB'],
                selectedCountryRow['ImpIDC'],
                selectedCountryRow['ImpIDD'],
                selectedCountryRow['ImpIDE'],
                selectedCountryRow['ImpIDF'],
                selectedCountryRow['ImpIDG'],
                selectedCountryRow['ImpIDH'],
                selectedCountryRow['ImpIDI'],
                selectedCountryRow['ImpIDJ']
            ].map(String);
            state.selectedCountries1 = selectedCountries1;
            console.log('Selected Country Values:', state.selectedCountries1);
        } else {
            console.log('Country not found in CSV');
        }
        state.selectedCountries1.forEach(selectedCountry1 => {
            const selectedCountry = g.selectAll("path").data().find(country => country && country.id === selectedCountry1);
            const originCountry = g.selectAll("path").data().find(country => country && country.id === state.selectedCountries[0]);
            console.log("Selected Countryyy:", selectedCountry);
            if (selectedCountry) {
                const selectedCentroid = path.centroid(selectedCountry);
                const centroid = path.centroid(originCountry);
                console.log("Centroid:", centroid, selectedCountry1); 
                console.log("Selected Centroid:", selectedCentroid);
                // Drawing centroid for 2nd degree trader
                if (selectedCentroid) {
                    g.append("circle")
                        .attr("cx", selectedCentroid[0])
                        .attr("cy", selectedCentroid[1])
                        .attr("r", 5)
                        .attr("fill", "orange");
                    console.log("Centroid drawn for country:", selectedCentroid);
                } else {
                    console.log("Centroid not found for country:", selectedCountry1);
                }
                // Drawing line between 1st & 2nd degree trader
                if (centroid && selectedCentroid) {
                    g.append("line")
                        .attr("x1", centroid[0])
                        .attr("y1", centroid[1])
                        .attr("x2", centroid[0])
                        .attr("y2", centroid[1])
                        .attr("stroke", "grey")
                        .attr("stroke-width", 1)
                        .transition()
                        .duration(700)
                        .attr("x2", selectedCentroid[0])
                        .attr("y2", selectedCentroid[0]);
                    console.log("Line drawn between countries:", state.selectedCountries[0], selectedCountry1);
                } else {
                    console.log("Line not drawn between countries:", state.selectedCountries[0], selectedCountry1);
                }
            } else {
                console.log("Country not found in JSON map data");
            }
        });
        console.log("Selected Countries1:", state.selectedCountries1);
        // Loop that collects trader from every first degree trader
        state.selectedCountries.forEach(selectedCountryx => {
            const countryRow = data.find(d => d['ID'] === selectedCountryx);
            if (countryRow) {
                selectedCountries1 = [
                    // Encoding countries trading with first, second and so on country
                    countryRow['ID1'], 
                    countryRow['ID2'], 
                    countryRow['ID3'], 
                    countryRow['ID4'], 
                    countryRow['ID5'], 
                    countryRow['ID6'], 
                    countryRow['ID7'], 
                    countryRow['ID8'], 
                    countryRow['ID9'], 
                    countryRow['ID10']
                ].map(String);
                state.selectedCountries1 = selectedCountries1;
                console.log('Selected Country Values:', state.selectedCountries1[0]);
                // Drawing lines & centroids for each 2nd degree country
                

            } else {
                console.log('Country not found');
            }
        });
    });
    
    console.log("Selected Countries1:", state.selectedCountries1[0]);
    console.log("Selected Countries:", state.selectedCountries[0]);
}
 


function Histogram() {
    d3.csv("fin.csv").then(data => {
        
        
        // Extracting import values and country names
        const importValues = data.map(d => parseFloat(d['Import']));
        const countryNames = data.map(d => d['Name']);
        console.log(variableName);
         // Sorting import values in descending order
        const sortedImportValues = importValues.slice().sort((a, b) => b - a);
            
         // Sorting country names based on the sorted import values
         const sortedCountryNames = sortedImportValues.map((_, i) => countryNames[importValues.indexOf(sortedImportValues[i])]);
    
         // Selecting top 25 values and country names
        const top25ImportValues = sortedImportValues.slice(0, 25).map(parseFloat);
         const top25CountryNames = sortedCountryNames.slice(0, 25);
    
        // Using top25ImportValues and top25CountryNames for further processing
        console.log("R:", top25ImportValues, top25CountryNames, sortedImportValues);
        console.log("L:", top25ImportValues.length);
    });

    const barPadding = 5; 
    const barWidth = (Lwidth / top25ImportValues.length) - barPadding;
    const barHeightScale = d3.scaleLinear()
        .domain([0, d3.max(top25ImportValues)])
        .range([0, Lheight]);

    // Selecting histogram element and appending bars
    histogram.selectAll("rect")
        .data(top25ImportValues)
        .enter()
        .append("rect")
        .attr("x", (_, i) => i * (barWidth + barPadding))
        .attr("y", Lheight - 100)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(600)
        .delay((_, i) => i * 15)
        .attr("y", d => Lheight - barHeightScale(d) - 100)
        .attr("height", d => barHeightScale(d));

    // Adding labels for each bar
    histogram.selectAll("text")
        .data(top25CountryNames)
        .enter()
        .append("text")
        .attr("x", (_, i) => i * (barWidth + barPadding) + barWidth / 2)
        .attr("y", Lheight - 80) 
        .attr("text-anchor", "left")
        .attr("font-size", "24px") 
        .attr("fill", "black") 
        .attr("transform", (_, i) => `rotate(45, ${i * (barWidth + barPadding) + barWidth / 2 }, ${Lheight})`)
        .text(d => d);
    

}

// Clicking function for the map when selecting a country
function clicked(event, d) {
    // Erasing previously drawn circles
    g.selectAll("circle").remove();
    // Erasing previously drawn lines
    g.selectAll("line").remove();
    // Resetting the fill color for all countries, especially previously selected ones
    g.selectAll("path").style("fill", "yourDefaultColor");
    // Getting the centroid of the clicked country
    const centroid = path.centroid(d);
    console.log("Centroid:", centroid);
    // Getting  box of the clicked country
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();

    selectedCountries = [];
    selectedCountriesImp = [];
    selectedCountriesExp = [];
    selectedCountriesIDExp = [];
    selectedCountriesNames = [];
    

    

    // Drawing centroid for selected country
    g.append("circle")
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", 5)
        .attr("fill", "green");
    // Getting country details from map
    let country = countryMap.get(d.id) || { name: "Unknown", import: "N/A", export: "N/A" };
    
    let countryI1 = countryMap.get(d.import1);
    console.log("Country one:", country.import1);
    //Updating treemap with selected country data. This always happens after clicking on a country
    updateTreemapSimple(country);
    
    console.log("Selected Country:", d.id);
    console.log("Selected Country1:", d.id1);
    g.selectAll("path").transition().style("fill", null);
    d3.interpolateLab("#FC4100", "#00bbfc")(state.colorComp);
    d3.select(this).transition().style("fill", d3.interpolateLab("#FC4100", "#00bbfc")(state.colorComp));
    // Adding selected countries ID to array
    selectedCountries.push(
        country.id1,
        country.id2,
        country.id3,
        country.id4,
        country.id5,
        country.id6,
        country.id7,
        country.id8,
        country.id9,
        country.id10
    );
    selectedCountriesIDExp.push(
        country.ed1,
        country.ed2,
        country.ed3,
        country.ed4,
        country.ed5,
        country.ed6,
        country.ed7,
        country.ed8,
        country.ed9,
        country.ed10
    );
    // Adding selected countries import values to array
    selectedCountriesImp.push(
        country.import1,
        country.import2,
        country.import3,
        country.import4,
        country.import5,
        country.import6,
        country.import7,
        country.import8,
        country.import9,
        country.import10
    );
    // Adding selected countries export to array
    selectedCountriesExp.push(
        country.export1,
        country.export2,
        country.export3,
        country.export4,
        country.export5,
        country.export6,
        country.export7,
        country.export8,
        country.export9,
        country.export10
    );

    console.log("Selected CountriesNames:", selectedCountriesNames[0]);
    
    // Checking if selected countries are empty
    if (selectedCountries.length === 0) {
        console.log("No content");
    } else {
        // Converting selected countries to strings
        selectedCountries = selectedCountries.map(String);
        console.log("Selected Countries:", selectedCountries);
        state.selectedCountries = selectedCountries;
        state.selectedCountriesImp = selectedCountriesImp;
    }
    
    console.log("Country 1:", country);

    // Draw centroids for all selected countries: Import
    selectedCountries.forEach(id => {
        const selectedCountry = g.selectAll("path").data().find(country => country && country.id === id);
        if (selectedCountry) {
            const selectedCentroid = path.centroid(selectedCountry);
            

            // Draw lines from the green circle to the blue circles
            g.append("line")
                .attr("x1", centroid[0])
                .attr("y1", centroid[1])
                .attr("x2", centroid[0])
                .attr("y2", centroid[1])
                .attr("stroke", "blue")
                .attr("stroke-width", 1.5)
                .style("opacity", 0.5)
                .transition()
                .duration(700)
                .attr("x2", selectedCentroid[0])
                .attr("y2", selectedCentroid[1])
                ;
            // Drawing centroids for initial country again to superimpose it on top of the lines
            g.append("circle")
                .attr("cx", selectedCentroid[0])
                .attr("cy", selectedCentroid[1])
                .attr("r", 4)
                .attr("fill", "blue");
            // Drawing centroids for all selected countries
            g.append("circle")
                .attr("cx", centroid[0])
                .attr("cy", centroid[1])
                .attr("r", 3)
                .attr("fill", "green");
        }
    });

    // Draw centroids for all selected countries: Export
     // Checking if selected countries are empty
    if (selectedCountriesIDExp.length === 0) {
        console.log("No content");
    } else {
        // Converting selected countries to strings
        selectedCountriesIDExp = selectedCountriesIDExp.map(String);
        console.log("Selected Countries:", selectedCountriesIDExp);
        state.selectedCountriesIDExp = selectedCountriesIDExp;
        state.selectedCountriesExp = selectedCountriesExp;
    }
    
    console.log("Country 1:", country);

    // Draw centroids for all selected countries
    selectedCountriesIDExp.forEach(id => {
        const selectedCountry = g.selectAll("path").data().find(country => country && country.id === id);
        if (selectedCountry) {
            const selectedCentroid = path.centroid(selectedCountry);
            

            // Draw lines from the green circle to the blue circles
            g.append("line")
                .attr("x1", centroid[0])
                .attr("y1", centroid[1])
                .attr("x2", centroid[0])
                .attr("y2", centroid[1])
                .attr("stroke", "red")
                .style("opacity", 0.5)
                .attr("stroke-width", 1.5)
                .transition()
                .duration(700)
                .attr("x2", selectedCentroid[0])
                .attr("y2", selectedCentroid[1])
                ;
            // Drawing centroids for initial country again to superimpose it on top of the lines
            g.append("circle")
                .attr("cx", selectedCentroid[0])
                .attr("cy", selectedCentroid[1])
                .attr("r", 3)
                .attr("fill", "red");
            // Drawing centroids for all selected countries
            g.append("circle")
                .attr("cx", centroid[0])
                .attr("cy", centroid[1])
                .attr("r", 5)
                .attr("fill", "green");
        }
    });
    
    // Applys changes in zoom to the map with animation
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(Math.min(1.5, 0.45 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
    );
    // Displaying infobox with country details
    infoBox.style("display", "block")
        .html(`Country ID: ${d.id}<br>Country Name: ${country.name}<br>Import: ${country.import}<br>Export: ${country.export}`)
        .style("left", `${centroid[0] + width / 2}px`)
        .style("top", `${centroid[1] - 40 + height / 2}px`);

    
}

// Clicking function for treemap nodes
function handleRectClickImport(event, d) {
    let country = d.data;
    
    updateTreemapGraphImport(country);
}

// Clicking function for treemap nodes
function handleRectClickExport(event, d) {
    let country = d.data;
    
    updateTreemapGraphExport(country);
}
// Zooming function
function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
}
