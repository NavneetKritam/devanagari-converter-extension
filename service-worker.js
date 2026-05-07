

chrome.runtime.onInstalled.addListener(()=>{
  chrome.action.setBadgeText({ text: "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "gray" });
});
chrome.action.onClicked.addListener(async (tab) => {
    const prevState = await chrome.action.getBadgeText({});;
    const nextState = (prevState === "ON") ? "OFF" : "ON";
    if(nextState === "ON"){
      await chrome.action.setBadgeBackgroundColor({ color: "green" });
      await chrome.scripting.registerContentScripts([
      {
        id: 'session-script',
        js: ["content.js"],
        persistAcrossSessions: false,
        matches: ["<all_urls>"],
        runAt: "document_idle"
      }
     ]);
     const activeTabs = await chrome.tabs.query({});
     for(const activeTab of activeTabs){
      if(activeTab.url && !activeTab.url.startsWith("chrome://") && !activeTab.url.startsWith("edge://"))
        try{
          await chrome.scripting.executeScript({
              target: {tabId: activeTab.id},
              files: ["content.js"]
            });
        }
        catch(injectError){
          console.warn("Failed to update in " + activeTab.url);
        }
      }
    }
     else{
      await chrome.action.setBadgeBackgroundColor({ color: "gray" });
      await chrome.scripting.unregisterContentScripts({ ids: ["session-script"] });
     }
     await chrome.action.setBadgeText({ text: nextState });
});
