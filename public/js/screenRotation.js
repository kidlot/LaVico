var ua = navigator.userAgent;
	var deviceType = '';
	var viewport = $('meta[name=viewport]');

	if (ua.indexOf('iPhone') > 0) {
		deviceType = 'isIphone';
	} else if (ua.indexOf('Android') > 0) {
		deviceType = 'isAndroid';
	}

	if (deviceType === 'isAndroid' && Math.abs(window.orientation) === 90) {
		viewport.attr('content', 'width=1000, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5, user-scalable=yes');
	}

	$(window).on('orientationchange', function() {
		if (deviceType === 'isIphone') {
			if (Math.abs(window.orientation) === 90) {
				$('.backdrop-orientation, .modal-orientation').show();
			}
			else {
				$('.backdrop-orientation, .modal-orientation').hide();
			}
		}
		else if (deviceType === 'isAndroid') {
			if (Math.abs(window.orientation) === 90) {
				viewport.attr('content', 'width=1000, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5, user-scalable=yes');
				$('.backdrop-orientation, .modal-orientation').show();
			}
			else {
				viewport.attr('content', 'width=640, initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5, user-scalable=yes');
				$('.backdrop-orientation, .modal-orientation').hide();
			}
		}

	});
	function orient(event) {
	    if (window.orientation == 0 || window.orientation == 180) {
	        $("body").attr("class", "portrait");
	        orientation = 'portrait';
	        $('.backdrop-orientation, .modal-orientation').show();
	        return false;
	    } else if (window.orientation == 90 || window.orientation == -90) {
	        $("body").attr("class", "landscape");
	        orientation = 'landscape';
	        $('.backdrop-orientation, .modal-orientation').hide();
	        return false;
	    }
	}

	window.onload = function () {
	    orient();
	}
	window.onresize = function () {
	    orient();
	}