// src/main.ts

type TabIds = "intro" | "projects";

function getEls() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  return { tabs, panels };
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
  });

  const initial = document.getElementById(`tab-${initialTabFromHash()}`) as HTMLButtonElement | null;
  if (initial) activateTab(initial);
})();

(function initDemos() {
  const modal = document.querySelector<HTMLDivElement>('.demo-modal');
  const dialog = modal?.querySelector<HTMLDivElement>('.demo-dialog') ?? null;

  if (!modal || !dialog) {
    console.warn('Demo modal DOM is missing.');
    return;
  }

  function openDemo(src: string, poster?: string, title?: string, caption?: string) {
    
    // load video (no <source> node needed)
    video.pause();
    video.removeAttribute('src');
    if (poster) video.setAttribute('poster', poster); else video.removeAttribute('poster');
    video.src = src;   // keep relative; browser resolves under repo path
    video.load();

    // show modal
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    dialog.setAttribute('tabindex', '-1');
    dialog.focus();

    // try to play
    video.play().catch(() => {/* user can press play */});
  }

  function closeDemo() {
    video.pause();
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  // wire links
  document.querySelectorAll<HTMLAnchorElement>('.demo-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const src = link.dataset.src;
      if (!src) return;
      openDemo(
        src,
        link.dataset.poster || '',
        link.dataset.title || link.textContent || 'Demo',
        link.dataset.caption || ''
      );
    });
  });

  // close actions (backdrop or X)
  modal.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.matches('[data-close]') || t.classList.contains('demo-backdrop')) {
      closeDemo();
    }
  });

  // Esc to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.hidden === false) closeDemo();
  });
})();
