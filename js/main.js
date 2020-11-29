var globalMap, globalOutput, myJson;
var attrArray = ['STUSPS','NAME','tot1950','tot1960','tot1970','tot1980','tot1990','tot2000','tot2010','Grand_Tota'];
var expressed = attrArray[0];

// Credits for map located on bottom right of map
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>';

var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamhhbnNlbDIiLCJhIjoiY2pscGVkNDJhMjN4ZTNxcG5yMmN0bmRtMiJ9.K50LHvk3ob3SBjrHDwIz4A';


// Basemap options located on top right of map
var outdoors = L.tileLayer(mbUrl, {id: 'mapbox.outdoors',   attribution: mbAttr});
var streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});
var ltgrayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr});
var dkgrayscale   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: mbAttr});
var imagery  = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr});

//createMap builds map, returns variable globalMap
function createMap(){
	//create map
    const map = L.map('map', {
            center: [64.24, -147.17],
            zoom: 4.8,
            minZoom: 1,
            layers:outdoors
        });
            var baseLayers = {
            "Outdoors": outdoors,
            "Streets": streets,
            "Light Grayscale": ltgrayscale,
            "Dark Grayscale": dkgrayscale,
            "Imagery": imagery,
        };

            //call getData
            getData(map);

            L.control.layers(baseLayers).addTo(map);
    }


//getData loads geoJSON
function getData(map){
  $.getJSON('data/nps_parks_qgis_v3.geojson', function(data){

    //style color and outline properties
    geojson = L.geoJson(data, {
        style: {"opacity": 0.4},
        onEachFeature: onEachFeature
    }).addTo(map);

//      function getLabel(map){
//      geojson = L.geoJson(data, {
//        style: style,
//        onEachFeature: function(feature, layer) {
//    var label = L.marker(layer.getBounds().getCenter(), {
//      icon: L.divIcon({
//        className: 'name',
//        html: feature.properties.UNIT_NAME,
//        iconSize: [100, 40]
//      })
//    }).addTo(map);
//  }
//      });
//      }

      
      
    //default layer style
//    function style(feature) {
//        return {
//            weight: 0.7,
//            opacity: 0.7,
//            color: 'red',
//            fillOpacity: 0.25,
//            fillColor: getColor(feature.properties.Percent)
//        };
//    };
      
      	function style(feature) {
    // the weight is a function of the current map scale
  	var fillOpacity;
    if (map.getZoom() <= 6) {
    	fillOpacity = 0.75;
    } else {
    	fillOpacity = 0.25;
    }
		return {
			//weight: wt,
			opacity: 0.7,
			color: 'white',
			//dashArray: '3',
			fillOpacity: fillOpacity,
			fillColor: getColor(feature.properties.Percent)
		};
	}

    //choropleth color map based on total disasters 1950-2019
    function getColor(b){
        return b >=0.0 & b <=0.005 ? '#fecc5c':
               b >=0.0051 & b <=0.10 ? '#fd8d3c':
               b >=0.101 & b <=0.20 ? '#f03b20':
               b >=0.201 & b <=0.30 ? '#bd0026':
               '#ffffff';
    };
    //iterate through each feature in the geoJSON
    function onEachFeature(feature, layer) {
        
        var popupContent = "<b>" + feature.properties.UNIT_NAME + "</b>"

		if (feature.properties) {
			layer.bindTooltip(popupContent, {
//				closeButton: true,
//				className: 'speciesPopup',
//				pane: 'popupPane'
			});
		}
        
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    };

    
      
    //set the highlight on the map
    function highlightFeature(e) {

        var layer = e.target;
        layer.setStyle({fillOpacity: 0.0});

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        };

        info.update(layer.feature.properties);
    };

    function resetHighlight(e) {
        geojson.setStyle(style);
        info.update();
    };

    //build chart for the map
    var newChart = function(label, yr_1950, yr_1960, yr_1970, yr_1980, yr_1990, yr_2000, yr_2010, yr_2018) {
    var dataLength = label ? label.length : 0;
    var backgroundColors = ['#0B5345',
                            ];
    var colors = [];
    for (var i = 0; i < dataLength; i++) {
        colors.push(backgroundColors[i]);
    };
    var ctx = document.getElementById("myChart");
    var dataChart = [yr_1950, yr_1960, yr_1970, yr_1980, yr_1990, yr_2000, yr_2010, yr_2018];
    var myChart = new Chart(ctx,{
            type: 'line',
            options: {

        layout: {

            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 50
            }
        }
    },
            data: {
                datasets: [{
                    label: '',
                    fontColor: 'black',
                    data: dataChart,
                    backgroundColor: backgroundColors[0],
                    borderColor: "#999",
                    borderWidth: 1,
                    backgroundColor: '#138D75',
                    pointRadius: 5,
                    pointBackgroundColor: '#0B5345'

                },
              ],

            labels:label},
            options: {
                fontColor: 'black',
                responsive:true,
                tooltips:{enabled:true},
                legend:{display:false},
                title:{display:true,position:'top',text:["NPS Visitors by Year"],fontFamily: "Helvetica",fontSize: 16,fontColor: 'black'},
                scales: {
                  xAxes: [{
                    ticks: {
                      fontColor: 'black',
                      fontFamily: "Helvetica",
                      autoSkip: false,
                        display: true}

                  }],
                    yAxes: [{
                        ticks: {
                          fontFamily: "Helvetica",
                          fontColor: 'black',
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    };


    var info = L.control({position: 'bottomright'});

    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function(props) {
        if (props) {
            {
                var label = ['1950','1960', '1970', '1980', '1990', '2000', '2010', '2018'];
                var yr_1950 = [props.yr_1950];
                var yr_1960 = [props.yr_1960];
                var yr_1970 = [props.yr_1970];
                var yr_1980 = [props.yr_1980];
                var yr_1990 = [props.yr_1980];
                var yr_2000 = [props.yr_2000];
                var yr_2010 = [props.yr_2010];
                var yr_2018 = [props.yr_2018];
                var UNITNAME = [props.UNITNAME];
                var indices = '';
                indices += '<canvas id="myChart" width="300" height="250"></canvas>';
                this._div.innerHTML = indices;
                newChart(label, yr_1950, yr_1960, yr_1970, yr_1980, yr_1990, yr_2000, yr_2010, yr_2018);
            }
        }
    };

    info.addTo(map);


   d3.queue()
    .defer(d3.csv, 'data/FEMA.csv')
    .defer(d3.json, 'data/REGION4.geojson')
    .await(callback);


  });
};



//create hover effect function
function handleHover(data){
	document.querySelectorAll("svg path").forEach((path, index) => {
    	let row = data[index],
            yr_1950 = row.yr_1950,
            yr_1960 = row.yr_1960,
            yr_1970 = row.yr_1970,
            yr_1980 = row.yr_1980,
            yr_1990 = row.yr_1990,
            yr_2000 = row.yr_2000,
            yr_2010 = row.yr_2010,
            UNITNAME = row.UNITNAME;
      	path.setAttribute("data-tot1950", tot1950);
      	path.setAttribute("data-tot1960", tot1960);
        path.setAttribute("data-tot1970", tot1970);
        path.setAttribute("data-tot1980", tot1980);
        path.setAttribute("data-tot1990", tot1990);
        path.setAttribute("data-tot2000", tot2000);
        path.setAttribute("data-tot2010", tot2010);
      	path.setAttribute("data-NAME", stateNAME);
      	path.addEventListener("mouseenter", handleMouseenter);
      	path.addEventListener("mouseleave", handleMouseleave);
    });
};

//when the page loads, AJAX & call createMap to render map tiles and data.
$(document).ready(init);
function init(){
  	globalOutput = document.querySelector("header output");
    //globalOutput.textContent = 'Census Block: , Location Index: , Walk Index:`';

    createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([32.38, -84.00], 5.5); //[lat, lng], zoom
    });
};
