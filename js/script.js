(function($){
	var Game = {

		cfg: {
			fps: 60,


		},
		isGame: false,

		runner: {
			item: $("#runner"),
			speed: 7,
			scrollOffset: 100,
			pos:{
				top: 0,
				left: 0
			},
			scales: [
				0.8,
				1,
				1.2
			],
			toTop: false,
			jumped: false,
			width: 133
		},

		playground: {
			item: $("#playground"),
			width: 0
		},

		points: {
			items: $("#points section,#pyre"),
			_items: [],
			current: '',
			pyreImg: $("#pyreImg"),
			pyreDef: function () {
				this.pyreImg.attr("src", "imgs/pyre.svg");
			},
			pyreFire: function () {
				this.pyreImg.attr("src", "imgs/pyre_fire.svg");
			}
		},
		panels: {
			items: $("#panels .panel")
		},

		timers: {},

		flushTimers: function () {
			clearInterval(this.timers.obstacle);
			clearInterval(this.timers.run);
		},

		setDefaults: function(){
			var points = this.points,
				runner = this.runner;

			runner.item.attr("class", "");
			runner.item.css({left: 0});

			this.runner.pos = this.runner.item.offset();

			this.runways.current = 1;

			this.setRunway( 1 );

			this.runner.speed = 7;

			this.obstacleFlush();
			this.flushTimers();

			this.runner.toTop = false;

			this.scrollSetDef();
			
			this.points.pyreDef();

			this.playground.width = this.playground.item.width();

			points.items.each(function(){
				points._items.push({
					left: Math.floor( $(this).offset().left ),
					width: $(this).width(),
					id: this.id
				});
			});
		},


		init: function () {

			// this.isGame = true;

			this.setDefaults();

			// this.start()

		},
		start: function () {
			this.isGame = true;

			this.animate();
			this.run();
		},

		restart: function () {
			this.setDefaults();
			this.start();
		},

		stop: function () {

			this.isGame = false;
			this.stopAnimate();

		},

		freq: 70,

		animate: function () {
			var runner = this.runner.item,
				freqs = 4,
				_f = 0;

			this.timers.animate = setInterval(function () {



				// console.log((_f>0 ? "-" : "") + (_f * 133) + " 0");

				runner.css({"background-position": (_f>0 ? "-" : "") + (_f * 133) + "px 0" });

				_f++;

				if( _f == freqs ) _f = 0;

			}, this.freq /*1000 / this.fps*/);
		},

		updateAnimateFreq: function( f ){
			this.freq = 70;
			this.stopAnimate();
			this.animate();
		},

		scroll: function () {
			document.scrollingElement.scrollLeft = (this.runner.pos.left) - (screen.width/2) + (this.runner.width/2);
		},
		scrollSetDef: function () {
			document.scrollingElement.scrollLeft = 0;
		},
		run: function(){
			var _r = this.runner,
				runner = _r.item,
				playground = this.playground,
				that = this;



			this.timers.run = setInterval(function () {
				if( !that.isGame ) {
					clearInterval(that.timers.run);

					return false;
				}

				 if( _r.pos.left + _r.width >= playground.width ){
					 that.isGame = false;
				 }

				_r.pos.left += _r.speed;

				runner.css({
					left: (_r.pos.left) + "px"
				});

				that.runner.pos.left = _r.pos.left;

				that.checkCrash();
				that.checkPoint();
				that.checkPyre();

				that.scroll();
			}, 1000 / 60); // fps


			this.timers.obstacle = setInterval(function () {
				that.obstacleGenerate();
			}, this.obstacle.interval);

		},
		jump: function () {
			var that = this,
				runner = this.runner.item;

			if( !this.runner.jumped ){
				this.runner.jumped = true;
				runner.addClass("jumped");


				setTimeout(function(){
					runner.removeClass("jumped");
					that.runner.jumped = false;
				}, 700);

			}

			/*runner.stop().animate({ top: "-=200" }, 500, function () {
				setTimeout(function () {
					runner.stop().animate({ top: "+=200" }, 300)
				}, 200);
			});
*/

			/*setTimeout( function () {
				runner.stop().animate({ top: "+=160" }, 300)
			}, 200 );*/
		},
		die: function () {
			this.stop();

			var runner = this.runner.item;
			runner.addClass("die");

			$("#end .success").hide();

			$("#end div.box").attr("class", "box");

			setTimeout(function(){
				$("#end").removeClass("hide").css({opacity:0}).animate({opacity: 1}, 300);
				$("#end div.box").addClass("scaleBox");
			}, 700);


		},

		end: function () {
			if( this.isGame ) this.stop();

			$("#end .error").hide();
			$("#end div.box").attr("class", "box");

			setTimeout(function(){
				$("#end").removeClass("hide").css({opacity:0}).animate({opacity: 1}, 300);
				$("#end div.box").addClass("scaleBox");
			}, 700);






		},

		stopAnimate: function () {
			clearInterval(this.timers.animate);
		},

		runways: {
			def: 1,
			current: 1,
			items: $("#runways .runway")
		},
		obstacle: {
			_html: '<span class="obstacle"></span>',
			_elHtml: '<span class="obstacle-t"></span>',
			interval: 1200,
			maxCount: 7,
			count: 0,
			offset: 600,
			_items: [],
			current: 0
		},
		setRunway: function ( i ) {
			this.runner.item.addClass( "runway-" + i );
		},
		changeRunway: function (key) {

			this.runner.item.removeClass( "runway-" + this.runways.current );

			if( key == 38 ){
				if( this.runways.current > 0 ) this.runways.current -= 1;
				else this.runways.current = 0;
			}
			if( key == 40 ){
				if( this.runways.current < 2 ) this.runways.current += 1;
				else this.runways.current = 2;
			}


			this.setRunway( this.runways.current );
		},

		checkCrash: function () {
			if( !this.obstacle.count ) return false;


			var posLeft = this.runner.pos.left,
				ob = this.obstacle._items,
				cur = this.runways.current;

			// if( cur != ob.runway ) return false;

			// console.log('posLeft',  posLeft, '>=', obLeft-40, '<=', obLeft+40);

			for( var i=0, obLength = ob.length; i<obLength; i++ ){

				if( ( posLeft >= (ob[i].left - 20) && posLeft <= (ob[i].left + 20) ) && cur == ob[i].runway && !this.runner.jumped ) {
					this.die();
				}
			}
		},

		checkPyre: function () {
			var runner = this.runner,
				p = this.points;

			if( runner.pos.left >= p._items[6].left - 500 && !this.runner.toTop ){
				this.runner.toTop = true;

				this.runner.item.addClass("toTop");

				this.runner.speed = 4;
				this.updateAnimateFreq(50)

			}
		},

		checkPoint: function () {
			var runner = this.runner,
				p = this.points,
				that = this;

			for( var i=0, il = p._items.length; i<il; i++ ){

				if( runner.pos.left >= p._items[i].left - 100 && runner.pos.left <= (p._items[i].left + p._items[i].width - 100) && p._items[i].id != p.current ){

					$("#" + this.points.current + "Panel").removeClass("activePanel");

					this.points.current = p._items[i].id;

					$("#" + p._items[i].id + "Panel").addClass("activePanel");


					if( this.points.current == "pyre"){
						this.stop();
						this.points.pyreFire();

						setTimeout(function(){
							that.end();
						}, 1000);
					}

				}
			}
		},
		obstacleGenerate: function(){

			if( !this.isGame ) return false;

			if( this.obstacle.count == this.obstacle.maxCount ) {
				clearInterval( this.timers.obstacle );

				return false;
			}

			var cur = this.runways.current,
				el = $(this.obstacle._elHtml),
				curEl = this.runways.items.eq(cur);

			// console.log(this.runner.pos.left + this.obstacle.offset);

			var obLeft = this.runner.pos.left + this.obstacle.offset;



			this.obstacle._items.push({
				left: obLeft,
				runway: cur
			});

			// el.html( el.html() + this.obstacle._elHtml );

			el.appendTo( curEl );

			el.css({
				left: obLeft + "px"
			});

			this.obstacle.count++;

		},
		
		obstacleFlush: function () {
			this.runways.items.html(this.obstacle._html);
			this.obstacle._items = [];
			this.obstacle.count = 0;
		}

	};



	$("#startButton").on("click", function(){

		$("#start").hide();


		Game.start();
	});

	$(document).on("keydown", function (e) {


		if( e.keyCode == 38 || e.keyCode == 40 ){
			if( !!Game.runner.toTop || !Game.isGame ) return false;

			e.preventDefault();

			Game.changeRunway(e.keyCode);
		}
		if( e.keyCode == 32 ){
			if( !!Game.runner.toTop || !Game.isGame ) return false;
			e.preventDefault();

			Game.jump();
		}
		
	});

	$("#restartButton").on("click",function () {
		$("#end").addClass("hide");
		$("#end .success,#end .error").show();
		Game.restart();



		return false;
	});


	Game.init();

	window.Game = Game;
})(jQuery);