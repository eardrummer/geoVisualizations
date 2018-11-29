let ismirData;
let ismirMap;
let canvas;
let countries;
let locked_metadata = -1;

let country_dict = [];
let country_keys = [];
let metadata_dict = [];

let circles_list = [];


let tag_list = ["all", "deep learning", "musicology", "multimodal", "cultural", "multitrack", "rhythm", "structure", "symbolic", "text based", "image based", "software", "dataset"];
let previous_tag;
var yearSlider;
let zoomScale;

const mappa = new Mappa('Leaflet');
const options = {
	lat: 0,
	lng: 0,
	zoom: 2.0,
	style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload() {
	ismirData = loadTable('2017_proceedings_ismir_metadata.csv', 'header')
  countries = loadJSON('country_latlong.json')
}

function setup() {
	canvas = createCanvas(windowWidth,windowHeight);

	ismirMap = mappa.tileMap(options);
  ismirMap.overlay(canvas);

  target_tag = "all"
  calculateCountryDictByTag(target_tag);

	yearSlider = createSlider(1,4,4,1);
	yearSlider.position();
	yearSlider.style('width', '80px');

	previous_tag = "";

}

function draw() {
  clear();

	target_tag = tag_list[document.getElementById("menu1").value]

	if(previous_tag != target_tag){
		calculateCountryDictByTag(target_tag)
		previous_tag = target_tag;
  }

	ismirMap.onChange(addCircles);
	ismirMap.onChange(drawCircles);

  if(locked_metadata == -1)
		mouseOverMetadata();
  else {
		fill(255,0,200);
		ellipse(circles_list[locked_metadata].x, circles_list[locked_metadata].y, circles_list[locked_metadata].r)

		// Display metadata related to locked circle
		fill(255, 255, 255, 0);

    console.log("text displaying")
		textSize(10);
		fill(255,255,255, 200)
		rect(10, 80, 700, 50 * country_dict[circles_list[locked_metadata].country_id] + 10);
		fill(0);
		text(metadata_dict[circles_list[locked_metadata].country_id], 15, 100);
  }
}

function drawCircles(){

	for(let i = 0; i < circles_list.length; i++){
		circles_list[i].draw();
	}
}

function addCircles(){

	circles_list = [];

	for (let i in country_keys){
		let latlon = countries[country_keys[i].toLowerCase()];
		lat = latlon[0];
		lon = latlon[1];

    if(target_tag == "all")
			zoomScale = 5;
		else {
			zoomScale = 10;
		}

		let diameter = zoomScale * sqrt(country_dict[country_keys[i]]) * ismirMap.zoom();
    const pix = ismirMap.latLngToPixel(lat, lon);

    circles_list.push(new Circle(pix.x, pix.y, diameter, country_keys[i]));

		///fill(255,0,200, 100);
		//ellipse(pix.x, pix.y, diameter, diameter);
	}
}

function calculateCountryDictByTag(target_tag){

country_dict = [];
country_keys = [];
metadata_dict = [];

	for (let row of ismirData.rows){

    let current_tags = row.get('tags');
		let tags = current_tags.split(", ");

		let metadata = row.get('paper') + "\n" + row.get('authors') + "\n" + row.get('metadata') + "\n"

		for(let k in tags){
			if(tags[k] == target_tag || target_tag == "all"){

				let country_ids = row.get('country_id');
				let country_id = country_ids.split(", ");

				for (let i in country_id){

					if(country_dict[country_id[i]] == undefined) {
						country_dict[country_id[i]] = 1;
						country_keys.push(country_id[i]);
						metadata_dict[country_id[i]] = metadata;
					 }
					else {
						country_dict[country_id[i]]++;
						metadata_dict[country_id[i]] = metadata_dict[country_id[i]] + "\n" + metadata;
						}
				}
				break;
			}
		}
	 }
}


class Circle {
	constructor(x = 0, y = 0, r = 0, country_id = ""){
		this.x = x;
		this.y = y;
		this.r = r;
		this.country_id = country_id;
	}
	draw(){
		fill(255,0,200, 100);
		ellipse(this.x, this.y, this.r)
	}
}


function mouseOverMetadata(){

	for( let i = 0; i < circles_list.length; i++){
		var d = dist(mouseX, mouseY, circles_list[i].x, circles_list[i].y);

		if(d < circles_list[i].r/2){

			// Display Text metadata related to the country and tag

			fill(255,0,200, 150);
			ellipse(circles_list[i].x, circles_list[i].y, circles_list[i].r)

			break;
		}
	}
}

function mousePressed(){

	locked_metadata = -1;
	for( let i = 0; i < circles_list.length; i++){
		var d = dist(mouseX, mouseY, circles_list[i].x, circles_list[i].y);

		if(d < circles_list[i].r/2){
			locked_metadata = i;

			fill(255,0,200);
			ellipse(circles_list[i].x, circles_list[i].y, circles_list[i].r)

			console.log(metadata_dict[circles_list[i].country_id])
			break;
		}
	}

	if(locked_metadata == -1){
		// Unlock metadata if mouse pressed outside any circle
		locked_metadata = -1
	}
}
