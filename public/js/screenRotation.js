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