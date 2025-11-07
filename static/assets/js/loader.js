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
		return []; // Adds a promise so scope can work
	});
}

function createDomainRegex(domains) {
	const escapedDomains = domains.map(domain => domain.replace(/\./g, '\\.'));
	return new RegExp(escapedDomains.join('|') + '(?=[/\\s]|$)', 'i');
}

searchBar.addEventListener("keydown", async function(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		const inputUrl = searchBar.value.trim();
		
		console.log('Enter pressed, input:', inputUrl);
		console.log('isUrl result:', isUrl(inputUrl));
		
		// Determine scope first
		try {
			const domains = await fetchDomains();
			const domainRegex = createDomainRegex(domains);
			
			if (vercelCheck !== 'true') {
				if (domainRegex.test(inputUrl)) {
					scope = '/assignments/';
				} else {
					scope = '/service/';
				}
			} else {
				scope = '/assignments/';
			}
			
			console.log('Scope determined:', scope);
			
			let url;

			if (!isUrl(inputUrl)) {
				// Use DuckDuckGo search for non-URL input
				url = "https://duckduckgo.com/?t=h_&ia=web&q=" + encodeURIComponent(inputUrl);
				console.log('Search query, final URL:', url);
			} else if (!(inputUrl.startsWith("https://") || inputUrl.startsWith("http://"))) {
				// Handle URL without protocol
				url = "http://" + inputUrl;
				console.log('URL without protocol, final URL:', url);
			} else {
				// Handle valid URL
				url = inputUrl;
				console.log('Valid URL with protocol, final URL:', url);
			}

			// Load the URL
			const encodedUrl = Ultraviolet.codec.xor.encode(url);
			const finalSrc = scope + encodedUrl;
			console.log('Final iframe src:', finalSrc);
			
			document.getElementById('siteurl').src = finalSrc;
			
			// Save the encoded URL to localStorage
			localStorage.setItem('encodedUrl', encodedUrl);
			
			// Blur the search bar after loading
			setTimeout(() => searchBar.blur(), 100);
		} catch (error) {
			console.error('Error loading URL:', error);
		}
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
// Save URL every 60 seconds
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
        break; // Exit the loop once we find a valid prefix
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
  let isUserEditing = false;

  function startLoop() {
    intervalId = setInterval(() => {
      // Only update if user is not currently editing
      if (!isUserEditing) {
        const decodedUrl = decode(document.getElementById("siteurl").contentWindow.location.href);
        if (decodedUrl) {
          searchBar.value = decodedUrl;
        }
      }
    }, 1000);
  }

  function stopLoop() {
    isUserEditing = true;
    clearInterval(intervalId);
  }

  function resumeLoop() {
    isUserEditing = false;
    startLoop();
  }

  searchBar.addEventListener('focus', stopLoop);
  searchBar.addEventListener('blur', resumeLoop);
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
  } // Derpman -  I did this because on about:blank the intercepting doesn't work, so this searches for the correct window
  return window;
}

function interceptFrame() {
  if (frame.contentWindow) {
    frame.contentWindow.open = function(url, target) {
      handleOpen(url);
      return null;
    };

    frame.contentWindow.document.addEventListener('click', event => {
      const target = event.target;
      if (target.tagName === 'A') {
        const targetAttr = target.getAttribute('target');
        if (targetAttr === '_top' || targetAttr === '_blank') {
          event.preventDefault();
          const href = target.getAttribute('href');
          if (href) {
            const correctWindow = getWindow();
            correctWindow.handleOpen(href);
          }
        }
      }
    });

    frame.contentWindow.addEventListener('submit', event => {
      event.preventDefault();
    });
  }
}

frame.addEventListener('load', interceptFrame);

document.addEventListener('DOMContentLoaded', function() {
  onFrameClick();
  setInterval(onFrameClick, 1000);
});

function isUrl(val = "") {
  if (!val || val.trim() === "") return false;
  
  // Check if it starts with http:// or https://
  if (/^https?:\/\/.+/.test(val)) {
    return true;
  }
  
  // Check if it looks like a domain (has a dot and no spaces)
  if (val.includes(".") && !val.includes(" ")) {
    // Make sure it's not just a file extension
    const parts = val.split(".");
    if (parts.length >= 2 && parts[parts.length - 1].length >= 2) {
      return true;
    }
  }
  
  return false;
}
