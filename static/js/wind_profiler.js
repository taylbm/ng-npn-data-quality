/**
 * @author William H. Greenwood
 *
 *
 */
(function() {
	/**
	 * Wind barb speed and color pairs.
	 */
	var COLORS = [
		'#ba3984',//0
		'#8e4d7b',//'#BD69A4',//2
		'#e288e0',//'#F9D7F8',//5
		'#a780ba',//'#B38EC4',//10
		'#5F9BCD',//20
		'#1B4591',//30
		'#140A63',//40
		'#306634',//50
		'#6EB21D',//60
		'#95D95E',//70
		'#ABBE40',//80
		'#E8DA6D',//90
		'#D49E54',//100
		'#A4272D' //110
	];
	var COLOR_VALUES = [0, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
	var EXPORT_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHHSURBVGhD7dq7K4VhHMDx435bkJBbJmV22xRGBjazUjLYFEYml7K4RPIHKEQhBrMsBsUgZRIGGTC4f3/q7Ty9/V7W31PPtz7DMf2eznue57zvkQqF/KoMM7jCO55xjH5kwItacI/vBNsogOlq8ABtAa51mG4N2uBxX2iGybLxBG1wzRxMJpeVNnCSPZisEtrASXZgskzcQRtaMwmzTUMbOk7OlgaYrRhyCGrDu6ZgvnqcQ1uAbLuzkMvQi3IwgH1c4gwraEIoFEqXh1pU/L7ysEZs4BXRjnWDCeTDi7rxAnfbdZ2iBKaTd+KvRURkWzadXE7a4JpOmCwX7mfiPwswWR20gZMcwmTl0AZOsgmzyRarDa0Zg9nGoQ0dJztbNcwmh90JtOFdwzBfKQ6gLUB2NS8W4daBRcjhtwX5TFQhFAqlk9O+Ha0olD/4Vhfi27CcHfIAQn478aJBfMBdhOsactdoujb8tYiI3FyZfraVdBBqemEy+XryBm1ozSpMJo9KtYGTHMFk8h1LGziJ3Bab7QLa0JoRmG0I2tBxjzD9SCgLu9CGj3yiD+aTx6TLkIHji7hFD7xKflobxRLmIf++UYRQyJ9SqR/n2Upt5pJswQAAAABJRU5ErkJggg==";
	var PAN_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJZSURBVGhD7Zi9LgVBGIaPgg6dgsRfFAoKP4Veo+MWdG7A0dHpUXMFuAGln2iViMINaBQUgvfN8SVzxre7Mztzzs4m+yRPHJtd2SfHzsxOq0cMwjP4Dg/hAKwdjDiHP4ZHsFYxWkTtYvIixGOYdIxLhJhsjBZxa/1+Z/2eXIwWcQnnrGOj0I47gUnEZEUMwUnjGCXJxqzCDyg3dQEZQbQQMgLNmDc4BStnAzKG34xEkKwQwpgbyIhlHkgFfjNmBMkLIcNwofMxbYpCakMT0is4xPIZ8CVGyBqMMjTLPMFRiaOTD6Eh2/ALBs8z9mTHGJ9vJiRkC35DubZ0jDZj2/NEESEhUVYAWoQ5Y7syBq8MfWGMvdB0jokVEYtSMVqELACrxCtGi7iH83DWw3HoAp8f7fosl+AzNO9PjTmF5kllvYYuvELtel/3YRfcstFO9LXfIQ+wC+47aSf62u+QHdgF/9e4VWOexAeMD1oKTMAnaN7fLlTRYjgpVR3jFSEwhrsb5kWM4RtdFWgRbehErBgOxS+GvjDiEZr34RwhaDF8x+brqSshay0tYg+WgjGcdOQPcaPA5x07JGQdfkK5tnSEIDGMWOEBD0JCiOzOBEcIjJnufPQiNITM/P2slBghSdCEVMkmtFcARSEcYjk6JQN3O7hRYC9n8kJknuAQ67s70xO478QtG7lZc6GZFWJPdhxiy4yKUbEnTSoxWggj7LVTtHkilKyYRetY0hGCFmOvlUqvYvuNFpNlshGCS0zyEUJeTOGbXWpoMbWLEBhzALll82+3o6GhNrRav0IQwSlV7W9OAAAAAElFTkSuQmCC";
	var RESET_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMfSURBVGhD7drHqhRBFMbxQUFBzHrN4SHcuDJcFV0JxoXZlVlELrgVswg+glkx7EwLUUygggl1Iz6AEQV1IYrp/6ENh0PP7VQzPQ39wQ9umuo6093VVTW3UadOnbZmNJZiLy7gNh79dxfnsAfzMQxZMgA7/33ZmgzHVjzEnwx+4hpWoj96i4q4Dr0ZwTMCh/AVcR3N4g22oR98oiL0d8ELWYMP8B0q6iWmIIotQoIVMhjnYQ/ufcJF7Md6LMNq7MBh6L75jrjXin7Xg4GwRUiQQsbgGWzDER38GKahD5KiTi7ADcS1Jx9jfla4kLF4Bd/wbxzFeOTNVNyEbztOoUKG4Dl8o6/RjRDRWdyOb/DHsQoVcha+QV1iutRCRjf2PfhjWbkLWQvfmM7OUISMH52ayVWInhN+iNXlNA4hk7YIyVWIHna2Ed3YMxEyWYqQzIVo2uGf2EcQOuug51Jau5ApmjvZIvScKDLElhbNVm0helZULqOg+8EWMh2Vi9YTtgjNndJMOzou+2AL0QSwktHoYAs5gErmDmwhG1DJPIUtROuJSuYJOq2Q5bB9Uh8T4y+tjSg7m2D7dAuJ6cSb/SBsn7S0SIz2pOyLLqHsXIXtk/bGErME9kVlPxD74jNsnxYhMXFTlBkoK3Ng+/ILI5EqftfwOMrKSdi+3EfqbIF9sabxE9HuTMYP2L5oBEsdLay+wDZQxlk5DdsH3SuZ9ws07NpGdN/oem1X5sLfq5rQZo62/d/DNqTN5glodXSMd7DH1ve5d29WwTYmrdgOstEbGLchuAKFcga+UW3Qhd4WUnQmXsAf7xQKZxDi3iFdZrMRKvPgL2V5DG16B0kXmm1in8Ak5I2GWL3j/sYWHVPHDhrt9fq1SkTPGRU0C5pSJEV/o7Op1/jnREQ7OfpMsiXRZebHdk9j/WVoxqrVpdYSouWAfnYFfu7k6QwFu5x6i0azuOu5qLfQh6NtjYZgPTT9DCAPnSEtH1o5rCdGB9+MB4i7YZvRLFafh+i1pRYQF02vF0MLH6009ZFa9A8D+lr/MLAbC5F6Kl6nTp2iaTT+Ap2G80L6A6AMAAAAAElFTkSuQmCC";
	var ZOOM_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANhSURBVGhD7ZnJy01hHMevmQVSyIJsxMaUIRuSsjCUkCn/gaEMWyyUoYikKHamEBYyRVKiDAnJwsyOZMqwM32+N7/69XTee86557n3vjfnU5/FPe95ht8553me3/O8lZKSkqbTAwdgl+qvNqEXLsD9eA+/4R/ne7yO23AadrrghuBO/Iy+42m+wNXYB1tKV1yP4ZPP6yucgy1hEF7DpI69xD24EufhDFyMa/AQfsCwzG/cjd2waQzFJxh25DiOwzTU2Vl4G30d8iz2xIajN/EcfeOPcSLmRYN9GYZj6yQ29M2o8qvoGz2PfbEIo/Ap+no3YsPQwPaNncNYT05vWoPe6v6JkzA6mmL97PQI+2MampYf4vLqr9qMQd/GXYy+1uxAa0ADO8vTmoBWRh3Mwjq0MnIuRqM3fkKr/ARmYSr6TmVB2cFrtDKXMBoL0XcoyxQr6glEaLW3MhorGj9RUO5kFSutyEq9gWid0udr5TRFR0EJoFWqFTsr9QYi7qOV26ULMfAzyQpdCNDMMhZnBq5FKyfDv8vhmISyBCt3QReKonTBd2Y+hmxBf08eNQZmY4jegt1zSxeKorXCNzwdQzTf+3vyqmQxZAPa3/WZFUapum90EYYsxbx7EVOZ8mgM2Yt2zxVdiIF2dlapvvusFBnsp9HKHdaFGGh7apVqP5GVIoH4RXGzLsRgO1qlHzFrolhvIFpwfTnt76OginzF2hRlod5AtqKV+Yo6iYmC1gmfYt/5dy2NegIZjOq8lTmIUVmFvlNLMA0tdlondL8eRBb2obXxC0dgVJQB+7fyBUdiGjod0eKWNMWG6IDC51hHsSGoU76hZzgQYzAFf6DV/RZj1Z2ITx2k3pJ2dkXQZ/odfb3RMt6O0NSrIxvfqJJK7efzHuNon6Etgn/L5g0seqiRinZxpzBs/A1qUzQMa6F1Qommz6qTbEowysE2oc1KXj3hB3gMlRAqAVTudAb9hOF9hxrs6ry/fhMbHozQIYTWFd94HjXFHkEb2Oq0Ou/vaVowWhx12nERk95QkvqsDmDSOtHSYAwNYKX1mt10gKfzXW2VL6OevBJApTzdsRadIphYdBRMP2w7ymA6K+p0UjDRUvxmkhSMTkHbEh+M1qDx2LYop9O/KSZXf5WUlPyvVCp/AdtNvi0UvzgbAAAAAElFTkSuQmCC";
	var UNIT_OPTIONS = {
		speed: {
			"mps": {label: "mps", factor: 1},
			"mph": {label: "mph", factor: 2.23694},
			"kts": {label: "kts", factor: 1.94384}
		},
		height: {
			"ft": {label: "ft", factor: 3.28084},
			"m": {label: "m", factor: 1}
		}
	};
	/**
	 * Default graph options.
	 */
	var defaultOptions = {

		height: 400,
		width: 800,
		backgroundColor: "rgba(255,255,255,1.0)",

		padding: 0,
		margin: 0,
		Barb: {
			flagLength: 8.0,
			featherLength: 8.0,
			shaftLength: 17.0,
			width: 0.5,
			flagSpacing: 3.6,
			featherSpacing: 2.6,
		},
		Title: {
			text: "",
			padding : 0,
			verticalAlign : "top",
			horizontalAlign : "center",
			fontSize : "110%", //px, em, or %
			fontFamily : "Calibri",
			fontWeight : "bold",
			fontColor : "black",
			fontStyle : "normal",
			margin : 1,
		},
		Subtitle: {
			text: "",
			padding : 0,
			verticalAlign : "top",
			horizontalAlign : "center",
			fontSize : "100%", //px, em, or %
			fontFamily : "Calibri",
			fontWeight : "normal",
			fontColor : "black",
			fontStyle : "normal",
			margin : 2,
		},
		Legend: {
			name: "",
			fontSize : "95%", //px, em, or %
			fontFamily : "calibri",
			fontWeight : "normal", 
			fontColor : "black",
			fontStyle : "normal",
			margin : 0
		},
		Y_Axis: {
			title: {
				text : 'Height MSL (km)',
				fontColor : "black",
				fontFamily : "arial",
				fontWeight : "normal",
				fontStyle : "normal",
				fontSize : "95%", //px, em, or %
				margin : 0
			},				
			label: {
				text: "",
				fontFamily : "arial",
				fontColor : "black",
				fontSize : "95%", //px, em, or %
				fontWeight : "normal",
				fontStyle : "normal",
				margin : 2
			},
			//Profile ticks
			tick: {
				length : 10.0,
				color : "black",
				thickness : 0.7,
			},
			grid: {
				color : "grey",
				thickness : 0,
				interval: 1 //In height units * 1000				
			}
		},
		X_Axis: {
			title: {
				text: null,
				fontColor : "black",
				fontFamily : "arial",
				fontWeight : "normal",
				fontStyle : "normal",
				fontSize : "95%", //px, em, or %
				margin : 0
			},
			label: {
				text: "",
				fontFamily : "arial",
				fontColor : "black",
				fontSize : "95%", //px, em, or %
				fontWeight : "normal",
				fontStyle : "normal",
				margin : 2
			},
			//Profile ticks
			tick: {
				length : 10.0,
				color : "black",
				thickness : 0.7,
			},
			grid: {
				color : "grey",
				thickness : 0,
				interval: 60 //minutes									
			}			
		},
		Border: {
			color : "black",
			thickness : 1			
		},
		Hover: {
			padding : 0,
			text : "",			
			fontColor: "black",
			fontSize: "85%", //px, em, or %
			fontFamily : "arial",
			fontWeight : "normal",
			fontStyle : "bold",
			margin : 1,		
			text : "Thu, 13 Apr 2017 14:40:13 GMT",
			verticalAlign : "top",
			horizontalAlign : "left",
			radius: 40
		},
		Export: {
			exportTypes: [{displayText: "Save as PNG",  mime: "image/png"},
						  {displayText: "Save as JPEG",  mime: "image/jpeg"}],
		},
		exportEnabled: false,
		zoomEnabled: false,
		data: {dataPoints: []},
		dataUnits: {
			speed: {
				label: "m/s",
				factor: 1
			},
			height: {
				//label: "ft",
				//factor: 3.28084
				label: "m",
				factor: 1
			}
		}
	};
	/**
	 * Left pads a string or number to the given length with the passed pad value.
	 *      usage pad(2, 0, 2) --> '02'
	 * @param {Any} value - String or number to be padded.
	 * @param {String} padValue - Value to pad with.
	 * @param {Int} length - The final length of the padded value.  
	 * @return {String} - Value left padded to the passed length with the passed pad value.
	 */
	function pad(value, padValue, length) {
		value += "";
		while (value.length < length) {
			value = padValue + value;
		}
		return value;
	}
	/**
	 * Converts angle in degrees to radians.
	 * @param {Float} angle - Angle to be converted.
	 * @return {number} - passed angle converted to radians.
	 */
	function deg2rad(angle) {
		return angle * Math.PI / 180.0;
	}
	/**
	 * Get a color from the passed color array based on the passed speed.
	 * @param {Float} speed - The speed to get the color for. 
	 * @param {Array} colors - Array of hex colors. 
	 * @return {String} Hex color code for the passed speed.
	 */
	function getColor(speed, colors) {
		if(colors.length < 14){
			colors = COLORS;
		}
		var color;
		
		if (speed === 0) {
			color = colors[0];
		} else if (speed < 3) {
			color = colors[1];
		} else if (speed < 8) {
			color = colors[2];
		} else if (speed < 15) {
			color = colors[3];
		} else if (speed < 25) {
			color = colors[4];
		} else if (speed < 35) {
			color = colors[5];
		} else if (speed < 45) {
			color = colors[6];
		} else if (speed < 55) {
			color = colors[7];
		} else if (speed < 65) {
			color = colors[8];
		} else if (speed < 75) {
			color = colors[9];
		} else if (speed < 85) {
			color = colors[10];
		} else if (speed < 95) {
			color = colors[11];
		} else if (speed < 105) {
			color = colors[12];
		} else {
			color = colors[13];
		}
		return color;
	}
	/**
	 * Set the size of the canvas to the passed height and width.
	 * @param {Object} canvas - HTML5 canvas object.
	 * @param {Int} height - Value to set the height of the canvas.
	 * @param {Int} width - Value to set the width of the canvas.
	 */
	function setCanvasSize(canvas, width, height) {
		canvas.width = width;
		canvas.height = height;
	}
	/**
	 * Create an HTML5 canvas.
	 * @param {Int} - height - Height of the canvas.
	 * @param {Int} - width - Width of the canvas.
	 * @return {Object} - HTML5 canvas object.
	 */
	function createCanvas(width, height) {
		var canvas = document.createElement("canvas");
		setCanvasSize(canvas, width, height);
		return canvas;
	}
	/**
	 * Copys items from one dictionary to another.  If the dictionary contains
	 * nested dictionaries then the function is recusively called to ensure all 
	 * items are copied. All items in the destination dictionary will be overwritten
	 * with items from the source.
	 * @param {Object} sourceOptions - Dictionary-like object to copy items from. 
	 * @param {Object} destinationOptions - Dictionary-like object to copy items to.
	 * @return {Object} - dictionary like object with items from both dictionaries.
	 */
	function copyOptions(sourceOptions, destinationOptions) {
		for (var prop in sourceOptions) {
			if ( prop in destinationOptions) {
				//If nested option call copy again copy each individual option
				if ( typeof sourceOptions[prop] === "object") {
					destinationOptions[prop] = copyOptions(sourceOptions[prop], destinationOptions[prop]);
				} else {
					destinationOptions[prop] = sourceOptions[prop];
				}
			} else {
				destinationOptions[prop] = sourceOptions[prop];
			}
		}
		return destinationOptions;
	}
	/**
	 * Function to build the CSS font string used to add text to the profile.
	 * @param {Object} options - The options object containing the font information for the text. 
	 * @return {String} - A string containing the font. A CSS font string. 
	 */
	function buildFontString(options) {
		var fontString;
		fontString = options.fontStyle + " ";
		fontString += options.fontWeight + " ";
		fontString += options.fontSize + " ";
		fontString += options.fontFamily;
		return fontString;
	}
	/**
	 * Get the overall size of the text taking into consideration margin, font size, 
	 * font family, font weight, padding.
	 * @param {Object} options - Dictionary of options for the text. Should include font size,
	 * font family, font weight, font style, margin and padding.
	 * @return {Object} - Key value pairs containing the text height and width.
	 */
	function getTextSize(options) {
		var width;
		var height;
		if(options.text === null){
			return {height : 0, width : 0 };
		}
		var label = document.createElement("span");
		label.style.fontSize = options.fontSize;
		label.style.fontFamily = options.fontFamily;
		label.style.fontWeight = options.fontWeight;
		label.style.fontStyle = options.fontStyle;
		if (options.text !== "") {
			label.innerHTML = String(options.text);
		} 
		else {
			label.innerHTML = "XX.X";
		}
		label.setAttribute("id", "temp");
		document.body.appendChild(label);
		
		width = document.getElementById("temp").offsetWidth;
		height = document.getElementById("temp").offsetHeight;
		if (options.margin){
			width += 2 * options.margin;
			height += 2 * options.margin;			
		}
		if (options.padding) {
			width += 2 * options.padding;
			height += 2 * options.padding;
		}
		document.body.removeChild(label);
		return {height : height, width : width };
	};
	/**
	 * Converts a javascript date object to a date time string in the form of MM/DD HH:MM.  The date
	 * and time are added as seperate properties of an object. This is 
	 * used to label the x-axis.
	 * @param {Object} date - Javascript date object to convert to a string.
	 * @return {Object} - Object containing the date formatted as MM/DD and time formatted as HH:MM.
	 */
	function formatDate(date) {
		var dateString = pad((date.getUTCMonth() + 1), "0", 2) 
		                 + "/" + pad(date.getUTCDate(), "0", 2);
		var timeString = pad(date.getUTCHours(), "0", 2) 
		                 + ":" + pad(date.getUTCMinutes(), "0", 2);
		return {date: dateString, time: timeString};
	};
	/**
	 * Main profile function.  Sets up the profile object based on options and places it in the DOM.
	 * @param {String} containerId - ID of the DOM element where the profile will be placed.
	 * @param {Object} options - Options for the profile.  Should be formatted the same as defaultOptions and 
	 * contain any items that will be overridden from defaultOptions.
	 * @param {Object} profileReference - Reference to the profile instance.
	 */
	function Profile(containerId, options, profileReference) {

		this._profileReference = profileReference;
		this._rendered = false;
		this._zoomed = false;
		this._panEnabled = false;
		this._hoverItems = [];
		this.data = {maxHeight: -1, minHeight: 9999999.1, dataPoints: []};
		
		options = options || {};

		this._options = options;
		this._setOptions();
		var _this = this;
		this.legendHeight = 45;
		this._containerId = containerId;
		this._plottedElements = [];

		this._container = document.getElementById(this._containerId);
		this._container.innerHTML = "";
		this._container.tabIndex = 1;
		
		this._view = {minDate: null, maxDate: null, minHeight: null, maxHeight: null, panning: false, zooming: false, zoomed: false};
		
		var width = 0;
		var height = 0;

		if (options.width) {
			width = options.width;
		} else {
			width = this._container.clientWidth > 0 ? this._container.clientWidth : this.width;
			this._options.width = width;
		}

		if (options.height) {
			height = options.height;
		} else {
			height = this._container.clientHeight > 0 ? this._container.clientHeight : this.height;
			this._options.height = height;
		}
		this._canvasContainer = document.createElement("div");

		this._canvasContainer.style.position = "relative";
		this._canvasContainer.style.textAlign = "left";
		this._canvasContainer.style.cursor = "auto";

		//Main canvas
		this.canvas = createCanvas(width, height);
		this.canvas.style.cssText = "position: absolute; z-index: 50;";
		if (this.canvas.getContext) {
			this._canvasContainer.appendChild(this.canvas);
			this.context = this.canvas.getContext("2d");
		}	
			
		this._container.appendChild(this._canvasContainer);
				
		this.canvas.onmousemove = this._mousemove.bind(this);
		//Setup Export button id export is enabled
		if(this._options.exportEnabled){
			this._exportButton = document.createElement("input");
			this._exportButton.type = "image";
			this._exportButton.title = "Export Profile";
			this._exportButton.src = EXPORT_ICON;
			this._exportButton.style.cssText = "position: absolute; height: 20px; width: 20px; top: "
										       + (this._options.margin + this._options.padding) + "px; right: " 
									           + (this._options.margin + this._options.padding) + "px; float: right; z-index: 999; "
									           + "display: none; padding: 5px; "
									           + "background-color: rgba(200,200,200,1.0); ";
	
			this._exportDiv = document.createElement("div");
			var exportTypes = this._options.Export.exportTypes;
			var link, br;
			for(var i = 0; i < exportTypes.length; i++){
				link = document.createElement("a");
				link.style.cssText = "text-decoration: none; color: black; cursor: pointer; ";
				link.innerHTML = exportTypes[i].displayText;
				link.value = exportTypes[i].mime;
				link.addEventListener("click", function(evt){
					_this._export(evt.target.value);
				});
				this._exportDiv.appendChild(link);
				br = document.createElement("br");
				this._exportDiv.appendChild(br);
			}
	
			this._exportDiv.style.cssText = "position: absolute; top: " + (this._options.margin + this._options.padding + 31) + "px; right: " 
									        + (this._options.margin + this._options.padding) + "px; padding: 5px; "
									        + "border: 1px solid black; background-color: white; float: right; z-index: 999; "
									        + "font-size: 13px; display: none; ";
									        
	
			this._container.appendChild(this._exportButton);
			this._container.appendChild(this._exportDiv);
			
			this._exportButton.addEventListener("click", function(evt){
				var vis = _this._exportDiv.style.display;
				_this._exportDiv.style.display = vis === "none" ? "block" : "none";
			});			
		}		
		//Setup Pan, Zoom, and Resetr buttons if zoom is enabled.
		if(this._options.zoomEnabled){
			var offset = this._options.exportEnabled ? 35 : 0;
			//Canvas to show shading whiel dragging mouse
			this.zoomCanvas = createCanvas(width, height);
			this.zoomCanvas.style.cssText = "position: absolute; z-index: 60; pointer-events: none;";
			
			this._canvasContainer.appendChild(this.zoomCanvas);
			
			this.zoomCanvasContext = this.zoomCanvas.getContext("2d");			
			//Reset zoom button
			this._resetButton = document.createElement("input");
			this._resetButton.type = "image";
			this._resetButton.title = "Reset";
			this._resetButton.src = RESET_ICON;
			this._resetButton.style.cssText = "position: absolute; height: 20px; width: 20px; top: "
										       + (this._options.margin + this._options.padding) + "px; right: " 
									           + (this._options.margin + this._options.padding + offset) + "px; float: right; z-index: 999; "
									           + "display: none;"	
									           + "background-color: rgba(200,200,200,1.0); "
									           + "padding: 5px;";	
	
			this._container.appendChild(this._resetButton);
			//Zoom button
			this._zoomButton = document.createElement("input");
			this._zoomButton.type = "image";
			this._zoomButton.title = "Zoom";
			this._zoomButton.src = ZOOM_ICON;
			this._zoomButton.style.cssText = "position: absolute; height: 20px; width: 20px; top: "
										       + (this._options.margin + this._options.padding) + "px; right: " 
									           + (this._options.margin + this._options.padding + offset + 35) + "px; float: right; z-index: 999; "
									           + "display: none; "
									           + "background-color: rgba(200,200,200,1.0); "
									           + "padding: 5px;";	
		
			this._container.appendChild(this._zoomButton);
			//pan button
			this._panButton = document.createElement("input");
			this._panButton.type = "image";
			this._panButton.title = "Pan";
			this._panButton.src = PAN_ICON;
			this._panButton.style.cssText = "position: absolute; height: 20px; width: 20px; top: "
										       + (this._options.margin + this._options.padding) + "px; right: " 
									           + (this._options.margin + this._options.padding + offset + 70) + "px; float: right; z-index: 999; "
									           + "display: none; "
									           + "background-color: rgba(200,200,200,1.0); "
									           + "padding: 5px;";	
	
			this._container.appendChild(this._panButton);
			//Handler for left and right arrow keys
			this._container.addEventListener('keydown', this._onkeypress.bind(this), false);
			
			//Handlers for pan, zoom and reset buttons
			this._resetButton.addEventListener("click", _this.reset.bind(_this));
			this._zoomButton.addEventListener("click", function(evt){
				_this._view.zooming = true;
				_this._view.panning = false;	
				_this.canvas.onmousedown = _this._onmousedown.bind(_this);	
				
			});			
			this._panButton.addEventListener("click", function(evt){
				_this._view.panning = true;
				_this._view.zooming = false;
				_this.canvas.onmousedown = _this._onmousedown.bind(_this);				
			});			
		}		
	}
	/**
	 * Reset the profile state.  Clears mousedown and mouseup event handlers
	 * and resets mousemove handler to show hover. Clear pan and zoom flags.
	 */
	Profile.prototype.reset = function(evt){
		render = false;
		if(evt){
			render = true;
		}
		this.canvas.onmousedown = null;
		this.canvas.onmouseup = null;
		this.canvas.onkeypress = null;
		this._view.panning = false;
		this._view.zooming = false;
		this._view.zoomed = false;
		this.canvas.onmousemove = this._mousemove.bind(this);
		if(render){
			this.render();	
		}
	};
	/**
	 * Set options by combining/overwritting default options and user passed options.
	 * @param {Object} options - Dictionary of options to combine with/overwrite default options.
	 */
	Profile.prototype._setOptions = function() {	
		for (var prop in defaultOptions) {
			if (this._options.hasOwnProperty(prop)) {
				if ( typeof this._options[prop] === "object") {
					this._options[prop] = copyOptions(this._options[prop], defaultOptions[prop]);
				}
			} 
			else {
				this._options[prop] = defaultOptions[prop];
			}
		}
	};
	/**
	 * Gets the max and min timestamps from the data.
	 * @return {Object} - Key value pairs for max and min dates.
	 */	
	Profile.prototype.getDataMaxMinDates = function() {
		var dates = {
			min : 100000000000,
			max : 0
		};
		var len = this.data.dataPoints.length;
		for (var i = 0; i < len; i++) {
			if (this.data.dataPoints[i].timestamp > dates.max) {
				dates.max = this.data.dataPoints[i].timestamp;
			}
			if (this.data.dataPoints[i].timestamp < dates.min) {
				dates.min = this.data.dataPoints[i].timestamp;
			}
		}		
		return dates;
	};
	/**
	 * Clear the canvas, plot area, legend area, and hover area.
	 */
	Profile.prototype.clear = function() {
		if(this._options.zoomEnabled){
			this.zoomCanvasContext.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
		}
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this._plottedElements = [];
		this._rendered = false;
	};
	/**
	 * Export the profile using the passed mime type.  The filename is derived
	 * from the date range visible in profile and the ICAO found in the data.
	 */
	Profile.prototype._export = function(mime){
		var subtitle = [this.icao + "_" + new Date(this._view.minDate * 1000).toUTCString()];
		if(this._view.maxDate != this._view.minDate){
			subtitle.push(new Date(this._view.maxDate * 1000).toUTCString());
		}		
		var filename = (subtitle.join(" to ")).replace(/\s/g, "_").replace(/ to /g, "-").replace(/([:,])/g, "") + "." + mime.split("/")[1];
				
        if(window.navigator.msSaveOrOpenBlob && window.Blob){
        	var blob = new Blob([this.canvas.msToBlob()], {type: "text/html;charset=utf-8"});
            window.navigator.msSaveOrOpenBlob(blob, filename);
        }
        else{
        	var encodedUri = encodeURI(this.canvas.toDataURL(mime));
            var link = document.createElement("a");    
            link.download = filename;
            link.href = encodedUri;
            document.body.appendChild(link); 
            link.click();
            setTimeout(function(){
                document.body.removeChild(link);
                window.URL.revokeObjectURL(encodedUri);
            }, 100);
			var vis = this._exportDiv.style.display;
			this._exportDiv.style.display = vis === "none" ? "block" : "none";            
		}
	};
	/**
	 * Render the profile.  Test to make sure there is data before attempting to plot the data.
	 */
	Profile.prototype.render = function() {
		var pixelsFromPlotRight;
		var len;
		var yAxisTitleSize = 0;
		var xAxisTitleSize = 0;
		var titleSize;
		var subtitleSize;
		var timestamp;

		this.clear();		
		setCanvasSize(this.canvas, this._options.width, this._options.height);
		if(this._options.zoomEnabled){
			setCanvasSize(this.zoomCanvas, this._options.width, this._options.height);
		}
		if (this.data.dataPoints.length === 0) {
			return;
		}
					
		if(this._exportButton){
			this._exportButton.style.display = "block";	
		}
		if(this._options.zoomEnabled){
			this._zoomButton.style.display = "block";
			this._resetButton.style.display = "block";
			this._panButton.style.display = "block";
		}			
						
		this._rendered = true;
		if(! this._view.zooming && ! this._view.panning){
			this.dataDateRange = this.getDataMaxMinDates(this.data);
			this._view.maxDate = this.dataDateRange.max;
			this._view.minDate = this.dataDateRange.min;
		}
		//Reset the axis label and get default sizes
		this._options.Y_Axis.label.text = "";
		this._options.Y_Axis.label.size = getTextSize(this._options.Y_Axis.label);
		this._options.Y_Axis.title.size = getTextSize(this._options.Y_Axis.title);

		this._options.X_Axis.label.text = "";
		this._options.X_Axis.label.size = getTextSize(this._options.X_Axis.label);
		this._options.X_Axis.title.size = getTextSize(this._options.X_Axis.title);
		
		this._options.Title.size = getTextSize(this._options.Title);
		this._options.Subtitle.size = getTextSize(this._options.Subtitle);

		this.context.fillStyle = this._options.backgroundColor;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		this._addTitle();
		this._addSubtitle();
		
		titleSize = this._options.Title.size.height;
		subtitleSize = this._options.Subtitle.size.height;
	
		if (this._options.Y_Axis.title.text) {
			yAxisTitleSize = this._options.Y_Axis.title.size.height;
		}
		if (this._options.X_Axis.title.text) {
			console.log("here");
			xAxisTitleSize = this._options.X_Axis.title.size.height;
		}
				
		var innerPadding = this._options.Barb.shaftLength + this._options.Barb.flagLength * 0.75 + 5;
		var plotTop = this._options.padding + this._options.margin + titleSize + subtitleSize;
		var plotBottom = this.canvas.height - this._options.padding - this._options.margin - this._options.X_Axis.tick.length - xAxisTitleSize - 2 * this._options.X_Axis.label.size.height - this.legendHeight;
		var plotRight = this.canvas.width - this._options.padding - this._options.margin;
		var plotLeft = this._options.padding + this._options.margin + this._options.Y_Axis.tick.length + this._options.Y_Axis.label.size.width + yAxisTitleSize;
		var plotAreaWidth = plotRight - plotLeft;
		
		//Area where gridlines and barbs are drawn.
		this.plotArea = {
			top: plotTop,
			bottom: plotBottom,
			right: plotRight,
			left: plotLeft,
			innerPadding: innerPadding,
			width: plotAreaWidth,
		};
		//Area inside canvas where barbs are placed. Takes into consideration the wind bars size 
		//so that all barbs fit inside the plot area.
		this.barbArea = {
			right: plotRight - innerPadding,
			left: plotLeft + innerPadding,
			top: plotTop + innerPadding,
			bottom: plotBottom - innerPadding,
			height: plotBottom - plotTop - 2 * innerPadding,
			width: plotAreaWidth - 2 * innerPadding
		};
		
		this.barbArea.vertSpacing = (this.barbArea.height) / (this.data.maxHeight - this.data.minHeight);		
		this.pixelPerSecond = this.barbArea.width / (this._view.maxDate - this._view.minDate);
		
		//Set threshold for mouse event. Also used as time increment
		var threshold = 36; // In seconds
		if(this._options.hourly == "t"){
			threshold = 360;
		}
		this._view.mouseMoveThreshold = threshold;		
		if(this.pixelPerSecond >= 10){
			this._view.mouseMoveThreshold *= 2;
		}
		
		//Draw the frame that goes around the profile area
		if (this._options.Border.thickness > 0) {
			this._drawFrame();
		}
		//Draw axis ticks
		if (this._options.Y_Axis.tick.length > 0) {
			this._drawYAxisTicks();
		}
		if (this._options.X_Axis.tick.length > 0) {
			this._drawXAxisTicks();
		}		
		this._addLegend();
		
		//Draw gridlines
		if (this._options.X_Axis.grid.thickness > 0) {
			this._drawXAxisGrid();
		}
		if (this._options.Y_Axis.grid.thickness > 0) {
			this._drawYAxisGrid();
		}
		//Label the axis -- values next to tick marks
		this._labelXAxis();
		this._labelYaxis();
		if (this._options.Y_Axis.title.text) {
			this._addYaxisTitle();
		}
		if (this._options.X_Axis.title.text) {
			this._addXaxisTitle();
		}
		
		len = this.data.dataPoints.length;		
		if (len === 1) {
			timestamp = this.data.dataPoints[0].timestamp;
			this._plot(this.data.dataPoints[0].data, {x : this.barbArea.right / 2, y : this.barbArea.bottom });
		} else {
			for (var idx = 0; idx < len; idx += 1) {
				timestamp = this.data.dataPoints[idx].timestamp;
				if(timestamp > this._view.maxDate || timestamp < this._view.minDate){
					continue;
				}
				pixelsFromPlotRight = (this._view.maxDate - timestamp) * this.pixelPerSecond;
				this._plot(this.data.dataPoints[idx], {x : this.barbArea.right - pixelsFromPlotRight, y : this.barbArea.bottom });
			}
		}
	};
	/**
	 * Handler for left and right arrow key press. For right arrow the
	 * time is increased, for left arrow the time is decreased.
	 */
    Profile.prototype._onkeypress = function(evt){
    	//If not zoomed then no need to change anything
    	if(! this._view.zoomed){
    		return;
    	}
		var startTimestamp = this._view.minDate;
		var endTimestamp = this._view.maxDate;
    	var offset = this._view.mouseMoveThreshold;
    	var keycode = evt.keyCode;
    	switch (keycode){
    		//Left - decrease time window
    		case 37:
	    		offset = offset * -10;
				break;
    		
    		//Right - increase time window
    		case 39:
    			offset = offset * 10; 
				break;
    		
    		default: 
    			return;
    	};
		startTimestamp = this._view.minDate + offset;
		endTimestamp = this._view.maxDate + offset;
		if(endTimestamp > this.dataDateRange.max){
			endTimestamp = this.dataDateRange.max;
			startTimestamp = this._view.minDate;
		}
		else if(startTimestamp < this.dataDateRange.min){
			startTimestamp = this.dataDateRange.min;
			endTimestamp = this._view.maxDate;										
		}
		this._view.minDate = startTimestamp;
		this._view.maxDate = endTimestamp;
		this.render();
    };
	/**
	 * Mouse move handler for pan and zoom functions. If mouse is outside of plot area
	 * return.  If operation is panning then determine if mouse has moved 'enough' to 
	 * move the profile. If zooming draw the 'highlight' on the profile. Set panning or 
	 * zooming flag as appropriate.
	 */
	Profile.prototype._onmousemove = function(evt){
		if(evt.buttons !== 1){
			return;
		}
		var mouseX = evt.layerX;
		var mouseY = evt.layerY;
		if(mouseX < this.plotArea.left || mouseX > this.plotArea.right || mouseY < this.plotArea.top || mouseY > this.plotArea.bottom){
			return;
		}
		//Check to see
		if(this._view.zooming){
			this.zoomCanvasContext.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
			this.zoomCanvasContext.fillStyle = "rgba(180,180,180,0.6)";
			this.zoomCanvasContext.fillRect(this._view.startX, this.plotArea.top, mouseX - this._view.startX, this.plotArea.bottom - this.plotArea.top);			
		}		
		else if(this._view.panning){
			var delta = (mouseX - this._view.startX) / this.pixelPerSecond;  //Gives us seconds
			//If mouse has moved enough
			if(Math.abs(delta) >= this._view.mouseMoveThreshold){				
				
				var threshold = delta > 0 ? this._view.mouseMoveThreshold * -10 : this._view.mouseMoveThreshold * 10;
				var startTimestamp = this._view.minDate + threshold;
				var endTimestamp = this._view.maxDate + threshold;
				//Mouse moving left, increasing time make sure we haven't exceeded data range
				if(threshold > 0 && endTimestamp > this.dataDateRange.max){
					endTimestamp = this.dataDateRange.max;
					startTimestamp = this._view.minDate;
				}
				//Mouse moving right, decreasing time make sure we haven't gone below data range 
				else if(threshold < 0 && startTimestamp < this.dataDateRange.min){
					startTimestamp = this.dataDateRange.min;
					endTimestamp = this._view.maxDate;										
				}
				this._view.mouseStartTimestamp = startTimestamp;
				this._view.minDate = startTimestamp;
				this._view.maxDate = endTimestamp;

				this._view.startX = mouseX;
				this.render();								
			}
		}
	};
	/**
	 * Mouse down event handler for panning and zoom functions.  Record the starting point
	 * and then set the listeners for mouse up and mouse move.  The cursor is also changed
	 * if panning.
	 */	
	Profile.prototype._onmousedown = function(evt){
		if(evt.buttons !== 1){
			return;
		}		
		var mouseX = evt.layerX;
		var mouseY = evt.layerY;

		if(mouseX < this.plotArea.left || mouseX > this.plotArea.right || mouseY < this.plotArea.top || mouseY > this.plotArea.bottom){
			return;
		}
		this._view.startX = mouseX;
		if(mouseX < this.barbArea.left){
			mouseX = 0;
		}
		else{
			mouseX = mouseX - this.plotArea.left - this.plotArea.innerPadding;
		}
		
		this._view.mouseStartTimestamp = (mouseX / this.pixelPerSecond) + this._view.minDate;
		
		this.canvas.onmousemove = this._onmousemove.bind(this);
		this.canvas.onmouseup = this._onmouseup.bind(this);
		//if(this._view.panning){
			this.canvas.style.cursor = "ew-resize";
		//}
	};
	/**
	 * Mouse up event handler for panning and zooming functions. Reset event listener
	 * to show hover, change cursor back to default and if zomming render the profile
	 * with the selected date range.
	 */
	Profile.prototype._onmouseup = function(evt){
		
		if(evt.button !== 0){
			return;
		}		
		
		this.canvas.style.cursor = "auto";
		this.canvas.onmousemove = this._mousemove.bind(this);
		
		if(! this._view.zooming){
			return;
		}
		this._view.zoomed = true;
		var mouseX = evt.layerX;
		this.zoomCanvasContext.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
		
		if(Math.abs(mouseX - this._view.startX) < this._view.mouseMoveThreshold){
			return;
		}
		//If mouse is outside barb area then make it inside.
		if(mouseX < this.barbArea.left){
			mouseX = this.barbArea.left;
		}
		else if(mouseX > this.barbArea.right){
			mouseX = this.barbArea.right;
		}
		else{
			mouseX = mouseX - this.barbArea.left;
		}
		var timestamp = (mouseX / this.pixelPerSecond) + this._view.minDate;
		
		if(timestamp < this._view.mouseStartTimestamp){
			this._view.maxDate = this._view.mouseStartTimestamp;
			this._view.minDate = timestamp;
			this._view.mouseStartTimestamp = timestamp;
		}
		else if(timestamp > this.dataDateRange.max){
			this._view.maxDate = this.dataDateRange.max;
			this._view.minDate = this._view.mouseStartTimestamp;
		}
		else{
			this._view.maxDate = timestamp;
			this._view.minDate = this._view.mouseStartTimestamp;
		}	
		this.render();
	};
	/**
	 * Draws tick marks on the y-axis.
	 */
	Profile.prototype._drawYAxisTicks = function() {

		var height = 0;
		var interval = 1;
		var top = this.barbArea.height / this.barbArea.vertSpacing;
		
		if(this.barbArea.vertSpacing > 60){
			interval *= .1;
		}
		else if(this.barbArea.vertSpacing > 40){
			interval *= .25;
		}
		else if(this.barbArea.vertSpacing > 20){
			interval *= .5;
		}
		this.context.strokeStyle = this._options.Y_Axis.tick.color;
		this.context.lineWidth = this._options.Y_Axis.tick.thickness;
		
		//Draw the ticks
		while (height.toFixed(1) <= top) {
			this.context.beginPath();
			this.context.moveTo(this.plotArea.left, this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			if(height.toFixed(1) % 1 === 0){
				this.context.lineTo(this.plotArea.left - this._options.Y_Axis.tick.length, this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			}
			else if(height.toFixed(1) % 0.5 === 0){
				this.context.lineTo(this.plotArea.left - this._options.Y_Axis.tick.length * .65, this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			}
			else{
				this.context.lineTo(this.plotArea.left - this._options.Y_Axis.tick.length * .45, this.barbArea.bottom - (height * this.barbArea.vertSpacing));	
			}
			this.context.stroke();
			this.context.closePath();
			
			height += interval;
		}
	};
	/**
	 * Adds title to Y Axis.  Title text automatically changes based on data units.
	 */
	Profile.prototype._addYaxisTitle = function() {
		var title = "Height MSL (k" + this._options.dataUnits.height.label + ")";
		this._options.Y_Axis.title.text = title;
		var axisTitleSize = getTextSize(this._options.Y_Axis.title);
		var y = ((this.canvas.height - this._options.padding - this._options.margin - this.legendHeight) / 2);
		var x = this._options.padding + this._options.margin + axisTitleSize.height / 2;

		this.context.fillStyle = this._options.Y_Axis.title.fontColor;
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.font = buildFontString(this._options.Y_Axis.title);
		this.context.save();

		this.context.translate(x, y);
		this.context.rotate(deg2rad(270));
		this.context.fillText(this._options.Y_Axis.title.text, 0, 0);
		this.context.restore();		
	};
	/**
	 * Adds labels to tick marks.  Ensures no overlap of labels.
	 */
	Profile.prototype._labelYaxis = function() {
		var height = 0;
		var label = this.data.minHeight * 100;
		var interval = 1;
		if(this.barbArea.vertSpacing > 60){
			interval *= .1;
		}
		else if(this.barbArea.vertSpacing > 40){
			interval *= .25;
		}
		else if(this.barbArea.vertSpacing > 20){
			interval *= .5;
		}
		this.context.fillStyle = this._options.Y_Axis.label.fontColor;
		this.context.font = buildFontString(this._options.Y_Axis.label);
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';

		var top = this.data.maxHeight - this.data.minHeight;
		var labelX = this.plotArea.left - this._options.Y_Axis.tick.length - this._options.Y_Axis.label.size.width / 2;
		var labelY;
		var minLabelInterval = this._options.Y_Axis.label.size.height * 0.75;
		var previousY = this.canvas.height;
		while (height.toFixed(2) <= top) {
			labelY = this.barbArea.bottom - (height * this.barbArea.vertSpacing);
			if(label % 100 === 0 && labelY < (previousY - minLabelInterval)){
				this.context.fillText((label / 100).toFixed(1), labelX, labelY);
				previousY = labelY;
			}	
			else if(label % 50 === 0 && this.barbArea.vertSpacing > 45){
				this.context.fillText((label / 100).toFixed(1), labelX, labelY);
			}
			else if(label % 10 === 0 && this.barbArea.vertSpacing > 210){
				this.context.fillText((label / 100).toFixed(1), labelX, labelY);
			}					
			height += interval;			
			label = Math.round((label / 100 + interval) * 100);
		}
	};
	/**
	 * Draws the y-axis/horizontal grid lines on the profile.
	 */
	Profile.prototype._drawYAxisGrid = function() {
		var height = 0;
		
		var interval = 1;
		interval *= this._options.Y_Axis.grid.interval;
		this.context.strokeStyle = this._options.Y_Axis.grid.color;
		this.context.lineWidth = this._options.Y_Axis.grid.thickness;

		var maxHeight = this.data.maxHeight - this.data.minHeight;
		while (height <= maxHeight) {
			this.context.beginPath();
			this.context.moveTo(this.plotArea.left, this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			this.context.moveTo(this.plotArea.left, this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			this.context.lineTo(this.plotArea.right , this.barbArea.bottom - (height * this.barbArea.vertSpacing));
			this.context.stroke();
			this.context.closePath();
			height += interval;
		}		
	};
	/**
	 * Draws the tick marks along the x axis of the profile.
	 */
	Profile.prototype._drawXAxisTicks = function() {

		var tickModulus = 60;
		if (this._view.maxDate - this._view.minDate <= 54000 && this._options.hourly === 'f'){
			tickModulus = 6;
		}
		
		this.context.strokeStyle = this._options.X_Axis.tick.color;
		this.context.lineWidth = this._options.X_Axis.tick.thickness;

		var len = this.data.dataPoints.length;
		var timestamp, horzSpacing;
		for(var idx = 0; idx < len; idx++){
			timestamp = this.data.dataPoints[idx].timestamp;
			if(timestamp > this._view.maxDate || timestamp < this._view.minDate){
				continue;
			}
			if(new Date(timestamp * 1000).getMinutes() % tickModulus === 0){
				horzSpacing = (this._view.maxDate - timestamp) * this.pixelPerSecond;
				this.context.beginPath();
				this.context.moveTo(this.barbArea.right - horzSpacing, this.plotArea.bottom);
				if(timestamp % 3600 === 0){
					this.context.lineTo(this.barbArea.right - horzSpacing, this.plotArea.bottom + this._options.X_Axis.tick.length);
				}
				else if(timestamp % 1800 === 0){
					this.context.lineTo(this.barbArea.right - horzSpacing, this.plotArea.bottom + this._options.X_Axis.tick.length * 0.75);
				}
				else{
					this.context.lineTo(this.barbArea.right - horzSpacing, this.plotArea.bottom + this._options.X_Axis.tick.length * 0.5);
				}
				this.context.stroke();
				this.context.closePath();				
			}
		}
	};
	/**
	 * Draw the x-axis grid lines on the profile.
	 */
	Profile.prototype._drawXAxisGrid = function() {
		var gridModulus = this._options.X_Axis.grid.interval;
		this.context.strokeStyle = this._options.X_Axis.grid.color;
		this.context.lineWidth = this._options.X_Axis.grid.thickness;

		var len = this.data.dataPoints.length;
		var timestamp, horzSpacing;
		for(var idx = 0; idx < len; idx++){
			timestamp = this.data.dataPoints[idx].timestamp;
			if(new Date(timestamp * 1000).getMinutes() % gridModulus === 0){
				horzSpacing = (this._view.maxDate - timestamp) * this.pixelPerSecond;
				this.context.beginPath();
				this.context.moveTo(this.barbArea.right - horzSpacing, this.plotArea.bottom);
				this.context.lineTo(this.barbArea.right - horzSpacing, this.plotArea.top);
				this.context.stroke();
				this.context.closePath();				
			}
		}
	};
	/**
	 * Add the x-asix title below the x-axis.
	 */
	Profile.prototype._addXaxisTitle = function() {
		var axisTitleSize = getTextSize(this._options.X_Axis.title);
		var y = ((this.canvas.height - this._options.padding - this._options.margin - this.legendHeight));
		var x = this.barbArea.left + this.barbArea.width / 2;

		this.context.fillStyle = this._options.X_Axis.title.fontColor;
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.font = buildFontString(this._options.X_Axis.title);
		this.context.save();

		this.context.fillText(this._options.X_Axis.title.text, x, y);
		this.context.restore();		
	};
	/**
	 * Draws the labels for the x-axis ticks.
	 */
	Profile.prototype._labelXAxis = function() {

		var labelModulus = 60;
		if (this._view.maxDate - this._view.minDate <= 10800 && this._options.hourly === 'f'){
			labelModulus = 6;
		}
		var options = this._options.X_Axis.label;
		var datetime = formatDate(new Date(this._view.maxDate * 1000));

		options.text = datetime.date;
		options.time = datetime.time;
		var labelSize = getTextSize(options);
		
		this.context.fillStyle = options.fontColor;
		this.context.textAlign = 'center';
		this.context.textBaseline = 'bottom';
		this.context.font = buildFontString(options);
								
		var len = this.data.dataPoints.length;
		var timestamp, pixelsFromRight, date, datetime, labelX;
		var previousX = 5;
		
		for(var idx = 0; idx < len; idx++){
			timestamp = this.data.dataPoints[idx].timestamp;
			if(timestamp > this._view.maxDate || timestamp < this._view.minDate){
				continue;
			}
			if(new Date(timestamp * 1000).getMinutes() % labelModulus === 0){
				date = new Date(timestamp * 1000);
				pixelsFromRight = (this._view.maxDate - timestamp) * this.pixelPerSecond;

				datetime = formatDate(date);
				options.text = datetime.date;
				options.time = datetime.time;				
				
				labelX = this.barbArea.right - pixelsFromRight;
				if (labelX + (labelSize.width / 1.9) <= this.plotArea.right && labelX - labelSize.width * 1.4 >= previousX) {
					this.context.fillText(options.text, labelX, this.plotArea.bottom + labelSize.height + this._options.X_Axis.tick.length);
					this.context.fillText(options.time, labelX, this.plotArea.bottom + 2 * labelSize.height + this._options.X_Axis.tick.length);
					previousX = labelX;
				}
			}
		}
	};
	/**
	 * Draw the wind barb.  The direction is handled by the calling function.  This just draws on the passed context.
	 * @param {number} speed - Wind speed for wind barb.
	 * @param {Object} context - Canvas context to draw the wind barb on.
	 */
	Profile.prototype._drawWindbarb = function(speed, context) {
		
		var color = getColor(speed, COLORS);
		var point = {x: 0, y: 0};
		
		//shaft start and settings
		context.beginPath();
		context.lineWidth = this._options.Barb.width;
		context.strokeStyle = color;
		context.fillStyle = color;

		if (speed < 0.5) {
			this._drawCalmWind(point, color, context);
		} else {
			//draw the shaft
			context.moveTo(point.x, point.y);
			context.lineTo(point.x, point.y - this._options.Barb.shaftLength);
			point.y = point.y - this._options.Barb.shaftLength;
			var startingY = point.y;

			//draw the barbs
			while (speed > 0) {
				if (speed >= 47.5) {
					this._draw50Flag(point, context);
					point.y += this._options.Barb.flagSpacing + this._options.Barb.featherSpacing / 2;
					speed -= 50;
				} else if (speed >= 7.5) {
					this._draw10Flag(point, context);
					point.y += this._options.Barb.featherSpacing;
					speed -= 10;
				} else if (speed >= 2.5) {
					if (point.y === startingY) {
						point.y += 2 * this._options.Barb.featherSpacing;
					}
					this._draw5Flag(point, context);
					point.y += this._options.Barb.featherSpacing;
					speed -= 5;
				} else {
					speed = 0;
				}
			}
		}
		context.stroke();
		context.closePath();
	};
	/**
	 * Helper function for _drawWindBarb.  Draws the circle for calm winds.
	 * @param {Object} point - x and y coordinates for the wind barb.
	 * @param {number} color - Color for the circle.
	 * @param {Object} context - Canvas context to draw the wind barb on.
	 */
	Profile.prototype._drawCalmWind = function(point, color, context) {
		context.arc(point.x, point.y, 1.5, 0, 2 * Math.PI, false);
		context.stroke();
	};
	/**
	 * Helper function for _drawWindBarb.  Draws the wind speed of 5 flag. 
	 * @param {Object} point - x and y coordinates for the wind barb.
	 * @param {Object} context - Canvas context to draw the wind barb on.
	 */	
	Profile.prototype._draw5Flag = function(point, context) {
		context.moveTo(point.x, point.y);
		context.lineTo(point.x + this._options.Barb.featherLength / 1.5, point.y - this._options.Barb.featherLength / 3);
		context.stroke();
	};
	/**
	 * Helper function for _drawWindBarb.  Draws the wind speed of 10 flag. 
	 * @param {Object} point - x and y coordinates for the wind barb.
	 * @param {Object} context - Canvas context to draw the wind barb on.
	 */		
	Profile.prototype._draw10Flag = function(point, context) {
		context.moveTo(point.x, point.y);
		context.lineTo(point.x + this._options.Barb.featherLength, point.y - this._options.Barb.featherLength / 2);
		context.stroke();
	};
	/**
	 * Helper function for _drawWindBarb.  Draws the wind speed of 50 flag. 
	 * @param {Object} point - x and y coordinates for the wind barb.
	 * @param {Object} context - Canvas context to draw the wind barb on.
	 */	
	Profile.prototype._draw50Flag = function(point, context) {
		context.moveTo(point.x, point.y);
		context.lineTo(point.x + this._options.Barb.flagLength, point.y - this._options.Barb.flagLength / 2);
		context.lineTo(point.x, point.y - this._options.Barb.flagSpacing);
		context.lineTo(point.x, point.y);
		context.fill();
		context.stroke();
	};
	/**
	 * Main function to handle plotting of wind barbs. Plots an entire vertical profile for one time set.
	 * @param {Object} dataPoint - Dictionary of wind data. Includes data and timestamp fo data.
	 * @param {Object} point - Starting point with x and y coordinates.
	 */
	Profile.prototype._plot = function(dataPoint, point) {

		var data = dataPoint.data;
		
		var dir = 0;
		var speed = 0;
		var hgt = 0;
		var len = data.length;
		for (var idx = 0; idx < len; idx++) {
			var wind = data[idx];
			wind.ts = dataPoint.timestamp;
			hgt = wind.HT / 1000.0;
			if(hgt < this.data.minHeight || hgt > this.data.maxHeight){
				continue;
			}			
			hgt = wind.HT / 1000.0 - this.data.minHeight;
			dir = wind.DIR;
			speed = wind.SPD;
			if (dir >= 999 || speed >= 999) {
				continue;
			}
			wind.x = point.x;
			wind.y = point.y - (hgt * this.barbArea.vertSpacing);
			this._plottedElements.push(wind);

			this.context.save();
			this.context.translate(point.x, point.y - (hgt * this.barbArea.vertSpacing));
			this.context.rotate(deg2rad(dir));
			this._drawWindbarb(speed, this.context);
			this.context.restore();
		}
	};
	/**
	 * Draws the box around the plot area.
	 */
	Profile.prototype._drawFrame = function() {
		this.context.beginPath();
		this.context.moveTo(this.plotArea.left, this.plotArea.top);
		//Top
		this.context.lineTo(this.plotArea.right, this.plotArea.top);
		//Right
		this.context.lineTo(this.plotArea.right, this.plotArea.bottom);
		//Bottom
		this.context.lineTo(this.plotArea.left, this.plotArea.bottom);
		//Left
		this.context.lineTo(this.plotArea.left, this.plotArea.top);
		this.context.strokeStyle = this._options.Border.color;
		this.context.lineWidth = this._options.Border.thickness;
		this.context.stroke();
		this.context.closePath();				
	};
	/**
	 * Adds the legend to the lower right hand corner of the profile.
	 */
	Profile.prototype._addLegend = function() {

		var legendOptions = this._options.Legend;
		var text = this._options.dataUnits.speed.label;
		legendOptions.text = '110+';
		var textSize = getTextSize(legendOptions);
		legendOptions.text = text;
		var y = this.canvas.height - textSize.height - this._options.margin - this._options.padding;
		var x = this.canvas.width - this._options.margin - this._options.padding;
		var textX = this.plotArea.right;
		var textOffset = 0;
		var interval = 0;
		if (textSize.width > this.plotArea.innerPadding) {
			interval = this._options.Barb.shaftLength + this._options.Barb.flagLength * 0.75 + 7;
		} else {
			interval = this.plotArea.innerPadding;
		}
		var color;
		legendOptions.margin = 0;

		this.context.beginPath();
		this.context.font = buildFontString(legendOptions);
		this.context.textAlign = 'right';
		this.context.textBaseline = 'top';

		this.context.fillStyle = this._options.Legend.fontColor;
		this.context.fillText(legendOptions.text, textX, y);

		textX -= 5;
		x -= 5;

		this.context.textAlign = 'center';
		for (color in COLOR_VALUES) {
			
			speed = COLOR_VALUES[color];

			if(speed === 2){
				textX -= interval * 0.6;
				x -= interval * 0.6;				
			}
			else{
				textX -= interval;
				x -= interval;
			}

			legendOptions.text = speed;
			if (speed === 110) {
				legendOptions.text += "+";
			}
			textOffset = (textSize.width * 0.3);

			this.context.save();
			if (parseInt(color) === 0) {
				this.context.translate(x, y - 5);
				textOffset = 0;
			} else {
				this.context.translate(x, y - 5);
			}

			this.context.rotate(deg2rad(270));
			this._drawWindbarb(speed, this.context);
			this.context.restore();

			this.context.fillStyle = COLORS[color];
			this.context.fillText(legendOptions.text, textX - textOffset, y);
		}
		this.context.closePath();
		legendOptions.text = text;
	};
	/**
	 * Adds the title to the profile.
	 */
	Profile.prototype._addTitle = function() {
		var offset = this._options.padding + this._options.margin;
		var x = (this.canvas.width - offset) / 2; //Center title on canvas
		var y = offset;
		this.context.fillStyle = this._options.Title.fontColor;
		this.context.textAlign = this._options.Title.horizontalAlign;
		this.context.textBaseline = this._options.Title.verticalAlign;
		this.context.font = buildFontString(this._options.Title);

		this.context.fillText(this.icao.toUpperCase(), x, y);
	};
	/**
	 * Adds the subtitle to the profile.
	 */
	Profile.prototype._addSubtitle = function() {
	
		var subtitle = [new Date(this._view.minDate * 1000).toUTCString()];
		if(this._view.maxDate != this._view.minDate){
			subtitle.push(new Date(this._view.maxDate * 1000).toUTCString());
		}
		var offset = this._options.padding + this._options.margin;
		var x = (this.canvas.width - offset) / 2; //Center subtitle on canvas
		var y = offset;
		if(this.icao){
			y += this._options.Title.size.height;
		}
		this.context.fillStyle = this._options.Subtitle.fontColor;
		this.context.textAlign = this._options.Subtitle.horizontalAlign;
		this.context.textBaseline = this._options.Subtitle.verticalAlign;
		this.context.font = buildFontString(this._options.Subtitle);
		
		this.context.fillText(subtitle.join(" to "), x, y);
	};
	/**
	 * Handler to show hover text on mosue move.
	 */
	Profile.prototype._mousemove = function(evt){
		if(! this._rendered){
			return;
		}
		if(this._hoverItems.length > 0){
			for(var i = 0; i < this._hoverItems.length; i++){
				this._canvasContainer.removeChild(this._hoverItems[i]);				
			}
			this._hoverItems = [];
		}
		
		var radius = this._options.Hover.radius;
		evt.preventDefault();
		evt.stopPropagation();

		var i, mouseX, mouseY, wind, dx, dy, textX, textY, positionX, positionY;
		mouseX = evt.layerX;
		mouseY = evt.layerY;
		var textSize = getTextSize(this._options.Hover);

		for(i = 0; i < this._plottedElements.length; i++){
			wind = this._plottedElements[i];
			dx = mouseX - wind.x;
			dy = mouseY - wind.y;
			if(dx*dx + dy*dy < radius){
				
				//Determine placement of popup to keep it within the border of the plot.
				if(wind.x + textSize.width + 75 > this.canvas.width - 5){
					textX = wind.x - (textSize.width + 30);
					positionX = "left";
				}
				else{
					textX = wind.x + 20;
					positionX = "left";
				}
				if(wind.y + 4 * textSize.height > this.canvas.height - 20){
					textY = wind.y - (3 * textSize.height + 5);
					positionY = "bottom";
				}
				else{
					textY = wind.y + 5;
					positionY = "top";
				}
				//Create the popup
				var hoverDiv = document.createElement("div");
				hoverDiv.style.cssText = "z-index: 999; height: " + (3 * textSize.height + 5) + "px; width: " + (textSize.width + 5) + "px; " 
										 + "border: 0.15em solid gray; padding: 0.15em; " 
										 + "position: absolute; " 
										 + positionY + ": " + (textY - 5) + "px; "
										 + positionX + ": " + (textX - 5) + "px; "
										 + "background-color: rgba(255, 255, 255, 0.85); "
										 + "font-size: " + this._options.Hover.fontSize + "; "
										 + "font-weight: " + this._options.Hover.fontWeight + "; "
										 + "font-style: " + this._options.Hover.fontStyle + "; "
										 + "font-family: " + this._options.Hover.fontFamily + "; "
										 + "pointer-events: none;";
				
				hoverDiv.innerHTML = new Date(wind.ts * 1000).toUTCString() 
									 + "<br/>" + "Wind: " + wind.DIR + "\u00B0 at " + wind.SPD + " " + this._options.dataUnits.speed.label
									 + "<br/>" + "Height: " + wind.HT + " " + this._options.dataUnits.height.label;
				
				//draw circle at start of wind barb
				var indicatorDiv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				
				indicatorDiv.setAttribute("height", "6px");
				indicatorDiv.setAttribute("width", "6px");
				
				indicatorDiv.innerHTML = '<circle cx="3" cy="3" r="2" stroke="black" stroke-width="2" fill-opacity="0" />';
				
				indicatorDiv.style.cssText = "z-index: 999; " 
										 + "position: absolute; top: " + (wind.y - 3) + "px; "
										 + "left: " + (wind.x - 3) + "px; pointer-events: none;";
										 
				this._canvasContainer.appendChild(hoverDiv);	
				this._canvasContainer.appendChild(indicatorDiv);
				this._hoverItems = [hoverDiv, indicatorDiv];
				break;												
			}
		}
	};

	/**
	 * Setter for max and min height to plot.
	 * Arguments:
	 * @param {int} min - minimum value to plot.
	 * @param {int} max - maximum value to plot.
	 * @param {bool} render - Render flag. If true the plot will be rendered. If 
	 * not passed rendering is determined by the current state of the plot; if rendered
	 * then plot will be rendered again.
	 */
	Profile.prototype.setMaxMinHeight = function(min, max, render) {
		
		render = render === undefined ? this._rendered : render;
		
		if(min > max){
			this.data.maxHeight = min;
			this.data.minHeight = max;	
		}
		else{
			this.data.maxHeight = max;
			this.data.minHeight = min;				
		}
		if(render){
			this.render();
		}
	};	
	
	/**
	 * Setter for the plot data. Performs unit and height conversions based on
	 * the dataUnits options.
	 * The plot will be rendered after setting the data.
 	 * @param {Object} data -  
	 */
	Profile.prototype.setData = function(data) {
		//Sort the data to ensure it is in the proper order
		data = data.sort(function(a,b){
			return a.timestamp == b.timestamp ? 0 : a.timestamp > b.timestamp || -1;
		});		
		this.data.dataPoints = [];
		this.icao = data[0].ICAO.toUpperCase();
		var len = data.length;
		var dataPoint;
		var maxHeight = -1, minHeight = 999999;
		for(var i = 0 ; i < len; i++){
			dataPoint = {data: [], timestamp: data[i].timestamp};
			maxHgt = data[i].max_ht * this._options.dataUnits.height.factor;
			minHgt = data[i].min_ht * this._options.dataUnits.height.factor;
			if(maxHgt > maxHeight){
				maxHeight = maxHgt;
			}
			if(minHgt < minHeight){
				minHeight = minHgt;
			}
			for(var j = 0; j < data[i].data.length; j++){
				dataPoint.data.push({DIR: data[i].data[j].DIR, 
					SPD: Math.round(data[i].data[j].SPD * this._options.dataUnits.speed.factor * 10) / 10.0, 
					HT: Math.round(data[i].data[j].HT * this._options.dataUnits.height.factor * 10) / 10.0
					});
			}
			this.data.dataPoints.push(dataPoint);
		}
		if(this.data.minHeight > 9999999){
			this.data.minHeight = Math.floor(minHeight / 1000);
			
		}
		if(this.data.maxHeight < 0){
			this.data.maxHeight= Math.ceil(maxHeight / 1000);
		}
		this.render();
	};	

	var VerticalWindProfile = {
		Profile : function(containerId, options) {
			var _profile = new Profile(containerId, options, this);

			this.render = function() {
				_profile.render();
			};
			this.reset = function(){
				_profile.reset();
			};	
			this.setData = function(data){
				_profile.setData(data);
			};
			this.setMaxMinHeight = function(min, max, render){
				_profile.setMaxMinHeight(min, max, render);
			};
			this.options = _profile._options;
		}
	};
	window.VerticalWindProfile = VerticalWindProfile;
})();
