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
  
  // Block exact URLs
  exactUrls: [],
  
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
  console.log('🔍 [INDEX] Checking URL:', url);
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    const hostname = urlObj.hostname.replace('www.', '').toLowerCase();
    const fullUrl = urlObj.href.toLowerCase();
    
    console.log('📌 [INDEX] Hostname:', hostname);
    console.log('📌 [INDEX] Full URL:', fullUrl);
    
    // Check exact URLs
    if (blockedUrls.exactUrls.some(blocked => fullUrl === blocked.toLowerCase())) {
      console.log('❌ [INDEX] BLOCKED - Exact URL match');
      return { blocked: true, reason: 'This specific URL has been blocked.' };
    }
    
    // Check domains
    const blockedDomain = blockedUrls.domains.find(domain => hostname.includes(domain.toLowerCase()));
    if (blockedDomain) {
      console.log('❌ [INDEX] BLOCKED - Domain match:', blockedDomain);
      return { blocked: true, reason: 'This domain has been blocked by the administrator.' };
    }
    
    // Check keywords
    const matchedKeyword = blockedUrls.keywords.find(keyword => fullUrl.includes(keyword.toLowerCase()));
    if (matchedKeyword) {
      console.log('❌ [INDEX] BLOCKED - Keyword match:', matchedKeyword);
      return { blocked: true, reason: 'This URL contains blocked content.' };
    }
    
    // Check patterns
    const matchedPattern = blockedUrls.patterns.find(pattern => pattern.test(fullUrl));
    if (matchedPattern) {
      console.log('❌ [INDEX] BLOCKED - Pattern match:', matchedPattern);
      return { blocked: true, reason: 'This URL matches a blocked pattern.' };
    }
    
    console.log('✅ [INDEX] URL is NOT blocked');
    return { blocked: false };
  } catch (error) {
    console.log('⚠️ [INDEX] Error checking URL:', error);
    return { blocked: false };
  }
}

// Function to show blocked alert
function showBlockedAlert(reason) {
  alert('🚫 Access Blocked\n\n' + reason);
}
// ========== END URL BLOCKING ==========

const form = document.querySelector("form");
const input = document.querySelector("input");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  let inputValue = input.value.toLowerCase().trim();
  
  // ========== CHECK SEARCH QUERY FOR BLOCKED KEYWORDS ==========
  console.log('🔍 [INDEX] Checking search query:', inputValue);
  const matchedKeyword = blockedUrls.keywords.find(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()));
  if (matchedKeyword) {
    console.log('❌ [INDEX] BLOCKED - Search query contains blocked keyword:', matchedKeyword);
    showBlockedAlert('This search contains blocked content: "' + matchedKeyword + '"');
    return;
  }
  
  // Check if domain in search query
  const matchedDomain = blockedUrls.domains.find(domain => inputValue.toLowerCase().includes(domain.toLowerCase()));
  if (matchedDomain) {
    console.log('❌ [INDEX] BLOCKED - Search query contains blocked domain:', matchedDomain);
    showBlockedAlert('This search contains a blocked domain: "' + matchedDomain + '"');
    return;
  }
  // ========== END SEARCH QUERY CHECK ==========
  
  let url;
  
  if (!isUrl(inputValue)) {
    // Search using DuckDuckGo for non-URL input
    url = "https://duckduckgo.com/?t=h_&ia=web&q=" + encodeURIComponent(inputValue);
  } else if (!(inputValue.startsWith("https://") || inputValue.startsWith("http://"))) {
    // Handle URL without protocol
    url = "http://" + inputValue;
  } else {
    // Handle valid URL
    url = inputValue;
  }
  
  // ========== CHECK IF URL IS BLOCKED ==========
  const blockCheck = isUrlBlocked(url);
  if (blockCheck.blocked) {
    console.log('🛑 [INDEX] URL blocked, preventing navigation');
    showBlockedAlert(blockCheck.reason);
    return; // Stop here, don't proceed
  }
  console.log('✅ [INDEX] URL allowed, proceeding...');
  // ========== END BLOCKING CHECK ==========
  
  window.navigator.serviceWorker.register("/lab.js", {
    scope: '/assignments/',
  }).then(() => {
    localStorage.setItem("encodedUrl", __uv$config.encodeUrl(url));
    location.href = "/mastery";
  });
});

function isUrl(val = "") {
  return /^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ");
}

console.log('✅ [INDEX] URL blocker loaded and ready!');
