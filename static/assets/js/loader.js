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
		return [];
	});
}

function createDomainRegex(domains) {
	const escapedDomains = domains.map(domain => domain.replace(/\./g, '\\.'));
	return new RegExp(escapedDomains.join('|') + '(?=[/\\s]|$)', 'i');
}

searchBar.addEventListener("keydown", async function(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		event.stopPropagation();
		
		let inputUrl = searchBar.value.trim();
		
		if (inputUrl === '' || inputUrl === 'undefined' || inputUrl === 'null') {
			return;
		}
		
		console.log('Enter pressed, raw input:', inputUrl);
		console.log('isUrl result:', isUrl(inputUrl));
		
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
				url = "https://duckduckgo.com/?t=h_&ia=web&q=" + encodeURIComponent(inputUrl);
				console.log('Search query, final URL:', url);
			} else {
				if (!(inputUrl.startsWith("https://") || inputUrl.startsWith("http://"))) {
					url = "http://" + inputUrl;
					console.log('Added http://, final URL:', url);
				} else {
					url = inputUrl;
					console.log('Valid URL with protocol:', url);
				}
			}

			const encodedUrl = Ultraviolet.codec.xor.encode(url);
			const finalSrc = scope + encodedUrl;
			console.log('Encoded URL:', encodedUrl);
			console.log('Final iframe src:', finalSrc);
			
			const iframe = document.getElementById('siteurl');
			iframe.src = finalSrc;
			
			localStorage.setItem('encodedUrl', encodedUrl);
			
			setTimeout(() => {
				searchBar.blur();
			}, 100);
			
		} catch (error) {
			console.error('Error loading URL:', error);
		}
	}
});

setTimeout(function() {
	var searchBarValue = document.getElementById('searchBar').value;
	if (searchBarValue.startsWith('https://')) {
		localStorage.setItem('encodedUrl', Ultraviolet.codec.xor.encode(searchBarValue));
	}
}, 60000);

function forward() {
	try {
		frame.contentWindow.history.go(1);
	} catch (e) {
		console.log('Cannot access frame history');
	}
}

function back() {
	try {
		frame.contentWindow.history.go(-1);
		setTimeout(() => {
			try {
				const currentSrc = frame.contentWindow.location.pathname;
				if (currentSrc === '/loading.html') {
					forward();
				}
			} catch (e) {
				// Cross-origin, ignore
			}
		}, 500);
	} catch (e) {
		console.log('Cannot access frame history');
	}
}

function reload() {
	try {
		frame.contentWindow.location.reload();
	} catch (e) {
		// If cross-origin, reload the iframe src
		frame.src = frame.src;
	}
}

function devTools() {
  try {
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
      } else {
        if (eruda) {
          eruda.remove();
        }
      }
      devToolsLoaded = !devToolsLoaded;
    }
  } catch (e) {
    console.log('Cannot access iframe for devTools (cross-origin)');
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
  let isUserEditing = false;

  function startLoop() {
    intervalId = setInterval(() => {
      if (!isUserEditing && document.activeElement !== searchBar) {
        try {
          const currentHref = document.getElementById("siteurl").contentWindow.location.href;
          const decodedUrl = decode(currentHref);
          if (decodedUrl && decodedUrl !== searchBar.value) {
            searchBar.value = decodedUrl;
          }
        } catch (error) {
          // Silently ignore cross-origin errors
        }
      }
    }, 1000);
  }

  function stopLoop() {
    isUserEditing = true;
    clearInterval(intervalId);
  }

  function resumeLoop() {
    setTimeout(() => {
      isUserEditing = false;
      startLoop();
    }, 500);
  }

  searchBar.addEventListener('focus', stopLoop);
  searchBar.addEventListener('blur', resumeLoop);
  searchBar.addEventListener('input', stopLoop);
  
  startLoop();
}

function onFrameClick() {
  try {
    if (document.getElementById('siteurl').contentWindow) {
      document.getElementById('siteurl').contentWindow.addEventListener('click', frameClicked);
      document.getElementById('siteurl').contentWindow.addEventListener('touchend', frameClicked);
    }
  } catch (e) {
    // Silently ignore cross-origin errors
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
  }
  return window;
}

function interceptFrame() {
  try {
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
  } catch (e) {
    // Silently ignore cross-origin errors
  }
}

frame.addEventListener('load', interceptFrame);

document.addEventListener('DOMContentLoaded', function() {
  onFrameClick();
  setInterval(onFrameClick, 1000);
});

function isUrl(val = "") {
  if (!val || val.trim() === "") return false;
  
  if (/^https?:\/\/.+/.test(val)) {
    return true;
  }
  
  if (val.includes(".") && !val.includes(" ")) {
    const parts = val.split(".");
    if (parts.length >= 2 && parts[parts.length - 1].length >= 2) {
      return true;
    }
  }
  
  return false;
}
