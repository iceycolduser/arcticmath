window.onload = function() {
	let scope;
	const swAllowedHostnames = ["localhost", "127.0.0.1"];
	
	async function registerSW() {
		if (!navigator.serviceWorker) {
			if (location.protocol !== "https:" && !swAllowedHostnames.includes(location.hostname)) 
				throw new Error("Service workers cannot be registered without https.");
			throw new Error("Your browser doesn't support service workers.");
		}
		
		// Register both service workers
		await navigator.serviceWorker.register("/sw.js", {
			scope: '/service/',
		});
		
		await navigator.serviceWorker.register("/lab.js", {
			scope: '/assignments/',
		});
		
		console.log('✅ Service workers registered');
		console.log('🔌 WebSocket support enabled on both proxies');
		
		// Fetch domain blacklist for scope selection
		async function fetchDomains() {
			try {
				const response = await fetch('/data/b-list.json');
				const data = await response.json();
				return data.domains;
			} catch (error) {
				console.error('Error fetching domains:', error);
				return [];
			}
		}
		
		function createDomainRegex(domains) {
			const escapedDomains = domains.map(domain => domain.replace(/\./g, '\\.'));
			return new RegExp(escapedDomains.join('|') + '(?=[/\\s]|$)', 'i');
		}
		
		const domains = await fetchDomains();
		const domainRegex = createDomainRegex(domains);
		const searchValue = Ultraviolet.codec.xor.decode(localStorage.getItem("encodedUrl"));
		
		// Determine scope based on domain
		if (domainRegex.test(searchValue)) {
			// Blacklisted domain, use /assignments/ with /seal/
			scope = '/assignments/';
			console.log('📍 Using /assignments/ scope (blacklisted domain)');
		} else {
			// Normal domain, use /service/ with /bare/
			scope = '/service/';
			console.log('📍 Using /service/ scope');
		}
		
		let encodedUrl = localStorage.getItem("encodedUrl");
		encodedUrl = scope + encodedUrl;
		document.querySelector("#siteurl").src = encodedUrl;
	}
	
	/* URL masking for privacy */
	function rndAbcString(length) {
		const characters = "abcdefghijklmnopqrstuvw0123456789012345";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}
	
	var randomAlphanumericString = rndAbcString(7);
	var url = "/mastery?auth=" + randomAlphanumericString;
	var title = "Google Docs";
	history.pushState({}, title, url);
	
	registerSW().catch(err => {
		console.error('❌ Failed to register service workers:', err);
		alert('Failed to initialize proxy. Please refresh the page.');
	});
	
	if (typeof live === 'function') {
		live();
	}
};
