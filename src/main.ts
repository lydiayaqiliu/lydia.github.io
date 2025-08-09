// src/main.ts

type TabIds = "intro" | "projects";

function getEls() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  return { tabs, panels };
}

function panelIdFrom(tabId: string) {
  return tabId.replace("tab-", "panel-");
}

function tabIdFromPanel(panelId: string) {
  return panelId.replace("panel-", "tab-");
}

function activateTab(nextTab: HTMLButtonElement) {
  const { tabs, panels } = getEls();

  // Deactivate all
  tabs.forEach(t => t.setAttribute("aria-selected", "false"));
  panels.forEach(p => p.hidden = true);

  // Activate selected
  nextTab.setAttribute("aria-selected", "true");
  const targetPanelId = nextTab.getAttribute("aria-controls");
  if (targetPanelId) {
    const panel = document.getElementById(targetPanelId);
    if (panel) panel.hidden = false;
  }

  // Update URL hash for deep-linking
  const short = nextTab.id.replace("tab-", "");
  if (short) history.replaceState(null, "", `#${short}`);
}

function focusNextTab(direction: 1 | -1) {
  const { tabs } = getEls();
  const currentIndex = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
  tabs[nextIndex].focus();
  activateTab(tabs[nextIndex]);
}

function handleClick(e: Event) {
  const btn = e.currentTarget as HTMLButtonElement;
  activateTab(btn);
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowRight": e.preventDefault(); focusNextTab(1); break;
    case "ArrowLeft":  e.preventDefault(); focusNextTab(-1); break;
    case "Home":       e.preventDefault(); focusTabIndex(0); break;
    case "End":        e.preventDefault(); focusTabIndex(getEls().tabs.length - 1); break;
  }
}

function focusTabIndex(i: number) {
  const { tabs } = getEls();
  tabs[i].focus();
  activateTab(tabs[i]);
}

function initialTabFromHash(): TabIds {
  const h = (location.hash || "").replace("#", "");
  return (h === "projects" ? "projects" : "intro");
}

// Init
(function initTabs() {
  const { tabs } = getEls();
  tabs.forEach(t => {
    t.addEventListener("click", handleClick);
    t.addEventListener("keydown", handleKeydown);
  });

  // Set initial tab based on URL hash
  const initial = document.getElementById(`tab-${initialTabFromHash()}`) as HTMLButtonElement | null;
  if (initial) activateTab(initial);
})();
