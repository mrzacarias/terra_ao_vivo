var channels = ["esp-futb", "div", "not", "esp", "vid"];

var good_status = 2;

var news = {
	// Request do XML do ticker para realizar a logica
	requestTicker: function() {
		var req = new XMLHttpRequest();

		req.open("GET", 'http://esportes.terra.com.br/contentAPI/get?prd=live_guadalajara&srv=getListTickerElements&navigation_code=esp-futb&country_code=br&contentType=xml&jsonp=false', true);
		req.onload = this.showLive.bind(this);
		req.send(null);
	},
	
	// Funcao chamada ao abrir a extensao e que tenta gerar o ticker para cada um dos grupos de eventos
	showLive: function (e) {
		var live = e.target.responseXML.querySelectorAll('GROUP');

		count_status_live = 0		
		for (var i = 0; i < live.length; i++) {
			contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
			for (var j = 0; j < contents.length; j++) {
				if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == good_status) {
					count_status_live += 1;
				}
			}
		}
		
		switch(count_status_live)
		{
			case 0:
				$('.ao-vivo-subtitle').append("Vish, nenhum evento ao vivo =/");
				break;
			case 1:
				$('.ao-vivo-subtitle').append(count_status_live + " evento ao vivo!");
				break;
			default:
				$('.ao-vivo-subtitle').append(count_status_live + " eventos ao vivo!!");
				break;
		}

		for (var i = 0; i < channels.length; i++) {
			switch(channels[i])
			{
				case "esp-futb":
					this.makeTickerSoccer(live, channels[i], "Futebol");
					break;
				case "div":
					this.makeTicker(live, channels[i], "Diversão");
					break;
				case "not":
					this.makeTicker(live, channels[i], "Notícias");
					break;
				case "esp":
					this.makeTicker(live, channels[i], "Esportes");
					break;
				case "vid":
					this.makeTicker(live, channels[i], "Vida e Estilo");
					break;
				default:
					this.makeTicker(live, channels[i], "Ao Vivo");
					break;
			}
		}
	},	

	// Funcao principal responsavel por gerar o ticker recebe como parametro o xml do ticker, o grupo de eventos e o titulo do ticker
	makeTicker: function(live, channel, title) {
		//template para eventos genericos
		var template = '\
			<li class="tic-event">\
				<a href="{{_link}}" target="_new" style="min-height: 129px;">\
					<p class="tic-coverage"><b>{{_coverage}}</b></p>\
					<div class="details">\
						<img src="{{_thumb}}" alt="{{_title}}" width="113" height="63" class="tic-image">\
					</div><br/>\
					<p class="tic-title">{{_title}}</p>\
				</a>\
			</li>\
		';
		
		//template para ticker
		var carousel_template = '<h4 class="ticker-title">' + title + ':</h4>\
		<ul id="ticker" class="ruler ' + channel + '">\
		</ul>\
		<span class="prev ' + channel + '">Anterior</span>\
		<span class="next ' + channel + '">Próximo</span>\
		<br/>';		
		
		//Removendo tudo que tem dentro do container do canal
		var main = document.getElementById('live-'+channel);
		main.innerHTML = '';
		
		// Variaveis de controle
		var loop = 0;
		var events = 0;
		var visible_events = 3;
		
		for (var i = 0; i < live.length; i++) {
			if (live[i].getElementsByTagName('TAG')[0].childNodes[0].nodeValue.indexOf(channel) != -1) {
				contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
				for (var j = 0; j < contents.length; j++) {
					if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == good_status) {
						if (channel == "esp" && contents[j].getElementsByTagName('TAG')[0].childNodes[0].nodeValue.indexOf('esp-futb') == -1) {
							try {
								var _team_home = contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue
							} catch(err) {
								$('#live-'+channel).append(carousel_template);
								loop = 1
								break;
							}
						} else {
							$('#live-'+channel).append(carousel_template);
							loop = 1
							break;
						}
					}
				}
				if (loop == 1) {break;}
			}
		}
		if (loop == 0) {$('#live-'+channel).append("<!-- Sem Eventos ao vivo para "+ channel + " no momento -->"); return} 
		
		for (var i = 0; i < live.length; i++) {
			if (live[i].getElementsByTagName('TAG')[0].childNodes[0].nodeValue.indexOf(channel) != -1) {
				contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
				for (var j = 0; j < contents.length; j++) {
					if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == good_status) {
						var tag = contents[j].getElementsByTagName('TAG')[0].childNodes[0].nodeValue;						
						var live_data = null;
						
						var title = contents[j].getElementsByTagName('EVENT_DESCRIPTION')[0].childNodes[0].nodeValue
						if (title.length > 50) { title = title.substring(0,50) + "..."	}
						try
						{
							live_data = {
								_link : contents[j].getElementsByTagName('URL')[0].childNodes[0].nodeValue,
								_coverage : contents[j].getElementsByTagName('COVERAGE')[0].childNodes[0].nodeValue,
								_thumb : contents[j].getElementsByTagName('CONFIGURATION')[0].getElementsByTagName('THUMB')[0].childNodes[0].nodeValue,
								_title : title
							}
							
							var html = Mustache.to_html(template, live_data);
						} catch(err) {}
						
						if ((channel == "esp" && tag.indexOf("esp-futb") != -1)) {
							try {
								var _team_home = contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue
							} catch(err){
								$(".ruler."+channel).append(html);
								events += 1;
							}
						} else {
							$(".ruler."+channel).append(html);
							events += 1;
						}
					}
				}
			}
		}
		
		var h = 120;
		var w = 170;
		
		$(".ruler."+channel).simplecarousel({
			width:w,
			height: h,
			visible: visible_events,
			next: $('.next.'+channel),
			prev: $('.prev.'+channel)
		});
		
		if (events <= visible_events) {
			he = 160;
			$('.next.'+channel).remove();
			$('.prev.'+channel).remove();
			if (events != 0) {
				$('#live-'+channel).css("height", he);
				$('#live-'+channel).css("width", events*(w+5));
			} else { $('#live-'+channel).remove(); }
		}
	},

	makeTickerSoccer: function(live, channel, title) {
		// template para jogos de futebol
		var template_game = '\
			<li class="list_game">\
				<a href="{{_link}}" target="_new">\
					<p class="championship"><b>{{_match_status}}</b></p>\
					<div class="details">\
						<img src="{{_shield_home}}" alt="{{_team_home}}" width="24" height="24" class="ticker-shield">\
						<span class="result">{{_score_home}} x {{_score_away}}</span>\
						<img src="{{_shield_away}}" alt="{{_team_away}}" width="24" height="24" class="ticker-shield">\
					</div><br/>\
					<p class="status">{{_champ}}</p>\
				</a>\
			</li>\
		';
		
		//template para ticker
		var carousel_template = '<h4 class="ticker-title">' + title + ':</h4>\
		<ul id="ticker" class="ruler ' + channel + '">\
		</ul>\
		<span class="prev ' + channel + '">Anterior</span>\
		<span class="next ' + channel + '">Próximo</span>\
		<br/>';		
		
		//Removendo tudo que tem dentro do container do canal
		var main = document.getElementById('live-'+channel);
		main.innerHTML = '';
		
		// Variaveis de controle
		var loop = 0;
		var events = 0;
		var visible_events = 3;
		
		for (var i = 0; i < live.length; i++) {
			if (live[i].getElementsByTagName('TAG')[0].childNodes[0].nodeValue.indexOf(channel) != -1) {
				contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
				for (var j = 0; j < contents.length; j++) {
					if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == good_status) {
						try {
							var _team_home = contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue
							$('#live-'+channel).append(carousel_template);
							loop = 1
							break;
						} catch(err) {}
					}
				}
				if (loop == 1) {break;}
			}
		}
		if (loop == 0) {$('#live-'+channel).append("<!-- Sem Eventos ao vivo para "+ channel + " no momento -->"); return} 
		
		for (var i = 0; i < live.length; i++) {
			if (live[i].getElementsByTagName('TAG')[0].childNodes[0].nodeValue.indexOf(channel) != -1) {
				contents = live[i].getElementsByTagName('CONTENT')[0].childNodes;
				for (var j = 0; j < contents.length; j++) {
					if (contents[j].getElementsByTagName('STATUS')[0].childNodes[0].nodeValue == good_status) {
						var tag = contents[j].getElementsByTagName('TAG')[0].childNodes[0].nodeValue;						
						var coverage = contents[j].getElementsByTagName('COVERAGE')[0].childNodes[0].nodeValue
						if (coverage.length > 30) { coverage = coverage.substring(0,30) + "..."	}
						var live_data = null;
						
						try
						{
							live_data = {
								_link : contents[j].getElementsByTagName('URL')[0].childNodes[0].nodeValue,
								_champ : coverage,
								_match_status : contents[j].getElementsByTagName('GAME_INFO')[0].getElementsByTagName('GAME_TIME')[0].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue,						
								_team_home : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue,
								_shield_home : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('SHIELD')[0].childNodes[0].nodeValue,
								_score_home : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[0].getElementsByTagName('SCORE')[0].getElementsByTagName('GOALS')[0].childNodes[0].nodeValue,
								_team_away : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[1].getElementsByTagName('NAME_PT')[0].childNodes[0].nodeValue,
								_shield_away : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[1].getElementsByTagName('SHIELD')[0].childNodes[0].nodeValue,
								_score_away : contents[j].getElementsByTagName('TEAMS')[0].getElementsByTagName('TEAM')[1].getElementsByTagName('SCORE')[0].getElementsByTagName('GOALS')[0].childNodes[0].nodeValue
							}
							
							var html = Mustache.to_html(template_game, live_data);

							$(".ruler."+channel).append(html);
							events += 1;
						} catch(err) {}
					}
				}
			}
		}
		
		var h = 65;
		var w = 170;
		
		$(".ruler."+channel).simplecarousel({
			width:w,
			height: h,
			visible: visible_events,
			next: $('.next.'+channel),
			prev: $('.prev.'+channel)
		});
		
		if (events <= visible_events) {
			he = 108;
			$('.next.'+channel).remove();
			$('.prev.'+channel).remove();
			$('#live-'+channel).css("height", he);
			$('#live-'+channel).css("width", events*(w+5));
		}
	}
};

// Comportamento de inicio de documento
$(document).ready(function(){
	chrome.browserAction.setBadgeText({text:""});
	try
	{
		news.requestTicker();		
	}
	catch(err) { }
});