let devToolsLoaded;
let scope;
const searchBar = document.querySelector(".input");
const urlBar = document.querySelector('#urlBar');
const sideBar = document.getElementById("sidebar");
const menu = document.getElementById('menu');
const frame = document.getElementById('siteurl');
const selectedTheme = localStorage.getItem('selectedOption');
const vercelCheck = localStorage.getItem('isVercel');
var leaveConf = localStorage.getItem("leaveConfirmation");

// ========== URL BLOCKING CONFIGURATION ==========
const blockedUrls = {
  // Block entire domains
  domains: [
    // Porn sites - specific
    'pornhub.com',
    'xvideos.com',
    'xnxx.com',
    'youporn.com',
    'xhamster.com',
    'porn.com',
    'tik.porn',
    'theporndude.com',
    'redtube.com',
    'tube8.com',
    'spankbang.com',
    'eporner.com',
    'txxx.com',
    'hqporner.com',
    'porntrex.com',
    'youjizz.com',
    'pornhd.com',
    'upornia.com',
    'nuvid.com',
    'sunporno.com',
    
    // Gun sites - specific
    'guns.com',
    'grabagun.com',
    'gunbroker.com',
    'gunbuyer.com',
    'budsgunshop.com',
    'palmettostatearmory.com',
    'cheaperthandirt.com',
    'sportsmansguide.com',
    'midwayusa.com',
    'cabelas.com',
    'basspro.com',
    'academy.com',
  ],
  
  // Block URLs containing these keywords
  keywords: [
    'porn',
    'xxx',
    'sex',
    'adult',
    'nsfw',
    'nude',
    'naked',
    'hentai',
    'erotic',
    'gun',
    'guns',
    'firearm',
    'firearms',
    'weapon',
    'weapons',
    'rifle',
    'pistol',
    'ammunition',
    'ammo',
  ],
  
  // Block exact URLs (if needed for specific pages)
  exactUrls: [
    // Add specific URLs here if needed
  ],
  
  // Advanced pattern blocking (regex)
  patterns: [
    /.*porn.*/i,
    /.*xxx.*/i,
    /.*sex.*/i,
    /.*adult.*/i,
    /.*nsfw.*/i,
    /.*gun.*/i,
    /.*firearm.*/i,
    /.*weapon.*/i,
  ]
};

// Function to check if URL is blocked
function isUrlBlocked(url) {
  console.log('🔍 Checking URL:', url); // DEBUG
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    const hostname = urlObj.hostname.replace('www.', '').toLowerCase();
    const fullUrl = urlObj.href.toLowerCase();
    
    console.log('📌 Hostname:', hostname); // DEBUG
    console.log('📌 Full URL:', fullUrl); // DEBUG
    
    // Check exact URLs
    if (blockedUrls.exactUrls.some(blocked => fullUrl === blocked.toLowerCase())) {
      console.log('❌ BLOCKED - Exact URL match'); // DEBUG
      return { blocked: true, reason: 'This specific URL has been blocked.' };
    }
    
    // Check domains
    const blockedDomain = blockedUrls.domains.find(domain => hostname.includes(domain.toLowerCase()));
    if (blockedDomain) {
      console.log('❌ BLOCKED - Domain match:', blockedDomain); // DEBUG
      return { blocked: true, reason: 'This domain has been blocked by the administrator.' };
    }
    
    // Check keywords
    const matchedKeyword = blockedUrls.keywords.find(keyword => fullUrl.includes(keyword.toLowerCase()));
    if (matchedKeyword) {
      console.log('❌ BLOCKED - Keyword match:', matchedKeyword); // DEBUG
      return { blocked: true, reason: 'This URL contains blocked content.' };
    }
    
    // Check patterns
    const matchedPattern = blockedUrls.patterns.find(pattern => pattern.test(fullUrl));
    if (matchedPattern) {
      console.log('❌ BLOCKED - Pattern match:', matchedPattern); // DEBUG
      return { blocked: true, reason: 'This URL matches a blocked pattern.' };
    }
    
    console.log('✅ URL is NOT blocked'); // DEBUG
    return { blocked: false };
  } catch (error) {
    console.log('⚠️ Error checking URL:', error); // DEBUG
    return { blocked: false };
  }
}

// Function to show blocked page
function showBlockedPage(reason) {
  const blockedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Access Blocked</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        h1 {
          font-size: 32px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        p {
          font-size: 18px;
          opacity: 0.9;
          line-height: 1.6;
        }
        .reason {
          margin-top: 30px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🚫</div>
        <h1>Access Blocked</h1>
        <p>This website has been blocked and cannot be accessed.</p>
        <div class="reason">${reason}</div>
      </div>
    </body>
    </html>
  `;
  
  frame.srcdoc = blockedHtml;
  searchBar.value = '';
}
// ========== END URL BLOCKING ==========

if (leaveConf === "enabled") {
    window.onbeforeunload = function (e) {
        const confirmationMessage = "Are you sure you want to leave this page?";
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    };

    setTimeout(() => {
        console.log('onbeforeunload handler engaged after page load.');
    }, 500);
}

searchBar.value = Ultraviolet.codec.xor.decode(localStorage.getItem('encodedUrl'));
lucide.createIcons();

const themeStyles = {
  deepsea: { background: "rgb(6, 22, 35)" },
  equinox: { backgroundImage: "url('/assets/img/topographic_splash.webp')" },
  swamp: { background: "rgb(12, 43, 22)" },
  starry: { background: "rgb(63, 3, 53)" },
  magma: { background: "rgb(31, 26, 26)" },
  sunset: { background: "rgb(29, 21, 27)" },
  midnight: { background: "rgb(27, 27, 27)" },
  default: { background: "rgb(6, 22, 35)" }
};

const selectedStyle = themeStyles[selectedTheme] || themeStyles.default;
if (selectedStyle.background) {
  searchBar.style.background = selectedStyle.background;
}
if (selectedStyle.backgroundImage) {
  urlBar.style.backgroundImage = selectedStyle.backgroundImage;
}

document.getElementById('tabs').addEventListener('click', function() {
  sideBar.style.display = sideBar.style.display === "block" ? "none" : "block";
  if (sideBar.style.display === 'block') {
    menu.style.display = 'none';
  }
});
document.getElementById('more').addEventListener('click', function() {
	menu.style.display = menu.style.display === "block" ? "none" : "block";
	if (menu.style.display === 'block') {
		sideBar.style.display = 'none';
	}
});

function fetchDomains() {
	return fetch('/data/b-list.json').then(response => response.json()).then(data => data.domains).catch(error => {
		console.error('Error fetching domains:', error);
		return [];
	});
}

function createDomainRegex(domains) {
	const escapedDomains = domains.map(domain => domain.replace(/\./g, '\\.'));
	return new RegExp(escapedDomains.join('|') + '(?=[/\\s]|$)', 'i');
}

searchBar.addEventListener("keydown", function(event) {
	if (event.key === 'Enter') {
		var inputUrl = searchBar.value.trim();
		searchBar.blur();
		
		// ========== CHECK SEARCH QUERY FOR BLOCKED KEYWORDS ==========
		console.log('🔍 [LOADER] Checking search query:', inputUrl);
		const matchedKeyword = blockedUrls.keywords.find(keyword => inputUrl.toLowerCase().includes(keyword.toLowerCase()));
		if (matchedKeyword) {
			console.log('❌ [LOADER] BLOCKED - Search query contains blocked keyword:', matchedKeyword);
			showBlockedPage('This search contains blocked content: "' + matchedKeyword + '"');
			return;
		}
		
		// Check if domain in search query
		const matchedDomain = blockedUrls.domains.find(domain => inputUrl.toLowerCase().includes(domain.toLowerCase()));
		if (matchedDomain) {
			console.log('❌ [LOADER] BLOCKED - Search query contains blocked domain:', matchedDomain);
			showBlockedPage('This search contains a blocked domain: "' + matchedDomain + '"');
			return;
		}
		// ========== END SEARCH QUERY CHECK ==========
		
		fetchDomains().then(domains => {
			const domainRegex = createDomainRegex(domains);
			const searchValue = searchBar.value.trim();
			if (vercelCheck !== 'true') {
				if (domainRegex.test(searchValue)) {
					scope = '/assignments/';
				} else {
					scope = '/service/';
				}
			} else {
				scope = '/assignments/';
			}
			let url;

			if (!isUrl(inputUrl)) {
				url = "https://duckduckgo.com/?t=h_&ia=web&q=" + encodeURIComponent(inputUrl);
			} else if (!(inputUrl.startsWith("https://") || inputUrl.startsWith("http://"))) {
				url = "http://" + inputUrl;
			} else {
				url = inputUrl;
			}

			// ========== CHECK IF URL IS BLOCKED ==========
			const blockCheck = isUrlBlocked(url);
			if (blockCheck.blocked) {
				console.log('Blocked URL attempt:', url);
				showBlockedPage(blockCheck.reason);
				return;
			}
			// ========== END BLOCKING CHECK ==========

			document.getElementById('siteurl').src = scope + Ultraviolet.codec.xor.encode(url);
		});
	}
});

setTimeout(function() {
	var searchBarValue = document.getElementById('searchBar').value;
	if (searchBarValue.startsWith('https://')) {
		localStorage.setItem('encodedUrl', Ultraviolet.codec.xor.encode(searchBarValue));
	} else {
		// Blank URL, not saving
	}
}, 60000);

function forward() {
	frame.contentWindow.history.go(1);
}

function back() {
	frame.contentWindow.history.go(-1);
	setTimeout(() => {
		const currentSrc = frame.contentWindow.location.pathname;
		if (currentSrc === '/loading.html') {
			forward();
		}
	}, 500);
}

function reload() {
  frame.contentWindow.location.reload();
}

function devTools() {
  var siteIframe = document.getElementById('siteurl');
  if (siteIframe) {
    var innerDoc = siteIframe.contentDocument || siteIframe.contentWindow.document;
    var eruda = innerDoc.getElementById('eruda');
    if (!devToolsLoaded) {
      if (!eruda) {
        var erudaScript = document.createElement('script');
        erudaScript.src = "//cdn.jsdelivr.net/npm/eruda";
        erudaScript.onload = function() {
          var initScript = document.createElement('script');
          initScript.innerHTML = "eruda.init();eruda.show();";
          innerDoc.head.appendChild(initScript);
        };
        innerDoc.head.appendChild(erudaScript);
      }
    }
    else {
      if (eruda) {
        eruda.remove();
      }
    }
    devToolsLoaded = !devToolsLoaded;
  }
}

function openWindow() {
  var win = window.open();
  win.document.body.style.margin = "0";
  win.document.body.style.height = "100vh";
  var iframe = win.document.createElement("iframe");
  iframe.style.border = "none";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.margin = "0";
  iframe.src = 'https://' + window.location.hostname + scope + Ultraviolet.codec.xor.encode(document.getElementById('searchBar').value);
  win.document.body.appendChild(iframe);
}

function exit() {
  location.href = '/'
}

function hideBar() {
  var elements = ["menu", "sideBar", "urlBar"];
  elements.forEach(elementId => {
    var element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
      var allFrames = document.querySelectorAll('iframe');
      allFrames.forEach(iframe => {
        iframe.style.height = 'calc(100vh)';
      });
    }
  });
}

function decode(url) {
  if (url === 'about:blank' || url === 'welcome.html') {
    return '';
  }
  else if (url === 'welcome.html' || url === 'https://' + location.hostname + '/welcome.html') {
    return '';
  }

  var prefixes = ['/service/', '/assignments/'];
  let decodedPart = null;

  for (let prefix of prefixes) {
    const uvIndex = url.indexOf(prefix);
    if (uvIndex !== -1) {
      const encodedPart = url.substring(uvIndex + prefix.length);
      try {
        decodedPart = Ultraviolet.codec.xor.decode(encodedPart);
        break;
      } catch (error) {
        console.error('Error decoding the URL part:', error);
        return null;
      }
    }
  }
  return decodedPart;
}

function updateSearch() {
  var url = decode(document.getElementById('siteurl').src);
  document.querySelector('.searchBar').value = url;
}

function startInterval() {
  let intervalId;

  function startLoop() {
    intervalId = setInterval(() => {
      searchBar.value = decode(document.getElementById("siteurl").contentWindow.location.href);
    }, 1000);
  }

  function stopLoop() {
    clearInterval(intervalId);
  }
  searchBar.addEventListener('focus', stopLoop);
  searchBar.addEventListener('blur', startLoop);
  startLoop();
}

function onFrameClick() {
  if (document.getElementById('siteurl').contentWindow) {
    document.getElementById('siteurl').contentWindow.addEventListener('click', frameClicked);
    document.getElementById('siteurl').contentWindow.addEventListener('touchend', frameClicked);
  }
}

function frameClicked() {
  sideBar.style.display = 'none';
  menu.style.display = 'none';
}

function home() {
  location.href = '/';
}

function toggleFs() {
  if (!document.fullscreenElement) {
    document.getElementById('siteurl').requestFullscreen();
    menu.style.display = 'none';
  }
}

function handleOpen(url) {
  // ========== CHECK IF URL IS BLOCKED IN NEW WINDOWS ==========
  const blockCheck = isUrlBlocked(url);
  if (blockCheck.blocked) {
    console.log('Blocked URL in new window:', url);
    alert('Access Blocked: ' + blockCheck.reason);
    return null;
  }
  // ========== END BLOCKING CHECK ==========

  const newWindow = window.open('about:blank', '_blank');
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Arctic 1.0</title>
        <link rel="icon" href="https://www.genesisedu.com/wp-content/uploads/2020/10/favicon.jpg" />
        <style>
          body { margin: 0; height: 100vh; }
          iframe { border: none; width: 100%; height: 100%; margin: 0; }
        </style>
      </head>
      <body>
        <iframe src="${'https://' + window.location.hostname + '/assignments/' + Ultraviolet.codec.xor.encode(url)}" sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-modal[...]">
      </body>
      </html>
    `);
    newWindow.document.close();
  } else {
    console.error('Failed to open Genesis Quick Login!');
  }

  return null;
}

function getWindow() {
  let currentWindow = window;
  while (currentWindow.parent && currentWindow !== currentWindow.parent) {
    currentWindow = currentWindow.parent;
    if (typeof currentWindow.handleOpen === 'function') {
      return currentWindow;
    }
  }
  return window;
}

function interceptFrame() {
  if (frame.contentWindow) {
    // Intercept window.open
    frame.contentWindow.open = function(url, target) {
      handleOpen(url);
      return null;
    };

    // Intercept link clicks
    frame.contentWindow.document.addEventListener('click', event => {
      const target = event.target;
      if (target.tagName === 'A') {
        const targetAttr = target.getAttribute('target');
        const href = target.getAttribute('href');
        
        // Check if link is blocked before allowing navigation
        if (href) {
          let fullUrl = href;
          // Handle relative URLs
          if (!href.startsWith('http')) {
            try {
              fullUrl = new URL(href, frame.contentWindow.location.href).href;
            } catch (e) {
              fullUrl = href;
            }
          }
          
          console.log('🔍 [INTERCEPT] Checking clicked link:', fullUrl);
          const blockCheck = isUrlBlocked(fullUrl);
          if (blockCheck.blocked) {
            console.log('❌ [INTERCEPT] BLOCKED link click!');
            event.preventDefault();
            event.stopPropagation();
            showBlockedPage(blockCheck.reason);
            return false;
          }
        }
        
        if (targetAttr === '_top' || targetAttr === '_blank') {
          event.preventDefault();
          if (href) {
            const correctWindow = getWindow();
            correctWindow.handleOpen(href);
          }
        }
      }
    }, true); // Use capture phase

    frame.contentWindow.addEventListener('submit', event => {
      event.preventDefault();
    });
  }
}

frame.addEventListener('load', interceptFrame);

// ========== MONITOR IFRAME NAVIGATION ==========
let lastCheckedUrl = '';
let monitoringInterval = null;

function monitorIframeNavigation() {
  // Clear existing interval if any
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  
  monitoringInterval = setInterval(() => {
    try {
      const iframe = document.getElementById('siteurl');
      if (!iframe) return;
      
      // Get the iframe's src (which contains the encoded URL)
      let currentSrc = iframe.src;
      
      if (!currentSrc || currentSrc === 'about:blank' || currentSrc === lastCheckedUrl) {
        return;
      }
      
      // Decode the URL from the proxy
      let decodedUrl = decode(currentSrc);
      
      if (!decodedUrl || decodedUrl === lastCheckedUrl) {
        return;
      }
      
      lastCheckedUrl = decodedUrl;
      console.log('🔍 [MONITOR] Detected navigation to:', decodedUrl);
      
      // Check if the decoded URL is blocked
      const blockCheck = isUrlBlocked(decodedUrl);
      if (blockCheck.blocked) {
        console.log('❌ [MONITOR] BLOCKED! Stopping navigation to:', decodedUrl);
        
        // Stop the navigation immediately
        iframe.src = 'about:blank';
        showBlockedPage(blockCheck.reason);
        
        // Clear the search bar
        searchBar.value = '';
        
        // Reset last checked URL
        lastCheckedUrl = '';
      }
    } catch (error) {
      console.error('Monitor error:', error);
    }
  }, 100); // Check every 100ms for faster detection
}

// Start monitoring when page loads
document.addEventListener('DOMContentLoaded', function() {
  monitorIframeNavigation();
  onFrameClick();
  setInterval(onFrameClick, 1000);
});

// Also start immediately in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  monitorIframeNavigation();
}
// ========== END IFRAME MONITORING ==========

document.addEventListener('DOMContentLoaded', function() {
  onFrameClick();
  setInterval(onFrameClick, 1000);
});

function isUrl(val = "") {
  return /^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ");
}

// Export blocking functions for console access (optional)
window.urlBlocker = {
  isUrlBlocked,
  addBlockedDomain: (domain) => blockedUrls.domains.push(domain),
  addBlockedKeyword: (keyword) => blockedUrls.keywords.push(keyword),
  addBlockedUrl: (url) => blockedUrls.exactUrls.push(url),
  getBlockedList: () => blockedUrls
};
