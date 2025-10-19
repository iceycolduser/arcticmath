const form = document.querySelector("form");
const input = document.querySelector("input");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  window.navigator.serviceWorker.register("/lab.js", {
    scope: '/assignments/',
  }).then(() => {
    let inputValue = input.value.toLowerCase().trim();
    let url;

    if (!isUrl(inputValue)) {
      // Redirect to the specified website for non-URL input
      url = "https://arcticmathurlonly.vercel.app";
    } else if (!(inputValue.startsWith("https://") || inputValue.startsWith("http://"))) {
      // Handle URL without protocol
      url = "http://" + inputValue;
    } else {
      // Handle valid URL
      url = inputValue;
    }

    localStorage.setItem("encodedUrl", __uv$config.encodeUrl(url));
    location.href = "/mastery";
  });
});

function isUrl(val = "") {
  return /^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ");
}
