window.addEventListener("message", async event => {
  if (event.data?.type === "SAVES_EXTENSION_TOKEN") {
    await chrome.storage.local.set({
      token: event.data.token
    })
    window.close()
  }
})
