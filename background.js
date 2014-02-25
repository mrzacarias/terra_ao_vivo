var count_status_live = 0;

window.setInterval(function(){
	var views = chrome.extension.getViews({ type: "popup" });
	
	if (views.length == 0) { 
		try {
			count_status_live = 0;
			news.requestTickerBG();
		} catch(err) {
			chrome.browserAction.setBadgeText({text:""});
		}
	}
}, 60000);

var news = {
	// Request do XML do ticker para realizar a logica
	requestTickerBG: function() {
		var req = new XMLHttpRequest();

		req.open("GET", 'http://esportes.terra.com.br/contentAPI/get?prd=live_guadalajara&srv=getListTickerElements&navigation_code=esp-futb&country_code=br&contentType=xml&jsonp=false', true);
		req.onload = this.showLiveBG.bind(this);
		req.send(null);
	},

	showLiveBG: function (e) {
		var live = e.target.responseXML.querySelectorAll('GROUP');

		count_status_live = 0		
		for (var i = 0; i < live.length; i++) {
			contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
			for (var j = 0; j < contents.length; j++) {
				if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == 2) {
					count_status_live += 1;
				}
			}
		}
		
		if (count_status_live !== 0) {
			chrome.browserAction.setBadgeText({text:count_status_live.toString()});
			chrome.browserAction.setBadgeBackgroundColor({color:"#FF9900"});
		}
		else { chrome.browserAction.setBadgeText({text:""}); }
	}
};