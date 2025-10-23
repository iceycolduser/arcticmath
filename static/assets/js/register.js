const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
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

  console.log('✅ Service workers registered successfully');
  console.log('🔌 /service/ → /bare/ (WebSocket enabled)');
  console.log('🔌 /assignments/ → /seal/ (WebSocket enabled)');
}

registerSW().catch(err => {
  console.error('❌ Service worker registration failed:', err);
});
