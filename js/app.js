$(document).ready(function () {
	try {
		$('.loader_dots').show();
		if (BACKEND) { $('.offline').hide(); }
		initializeTheme();
		renderPeople();
		bindEvents();
		setTimeout(function () {
			$('.loader_dots').hide();
			$('[data-bs-toggle="tooltip"]').tooltip();
		}, 100);
	} catch (e) {
		console.log('+++ Exeption +++', e);
	}
});