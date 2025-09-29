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
  const modal  = document.querySelector<HTMLDivElement>('.demo-modal');
  if (!modal) { console.warn('Missing .demo-modal'); return; }

  const dialog = modal.querySelector<HTMLDivElement>('.demo-dialog');
  if (!dialog) { console.warn('Missing .demo-dialog'); return; }

  const video  = dialog.querySelector<HTMLVideoElement>('video');
  if (!video) { console.warn('Missing <video> inside .demo-dialog'); return; }


  function openDemo(src: string) {
    // load video into the modal's <video> element
    if (video) {
      video.pause();
      video.removeAttribute('src');

      video.src = src;     // this is where your mp4 path goes (from data-src)
      video.load();

      // try autoplay (will often be blocked, fallback is user click)
      void video.play().catch(() => {});
    }

    // show modal
    if (modal) {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
    }
    if (dialog) {
      dialog.setAttribute('tabindex', '-1');
      dialog.focus();
    }
  }

  function closeDemo() {
    if (video) {
      video.pause();
    }
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // wire each demo link
  document.querySelectorAll<HTMLAnchorElement>('.demo-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const src = link.dataset.src; // must be an .mp4 path
      if (!src) return;
      openDemo(
        src
      );
    });
  });

  // backdrop or close button
  modal.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.matches('[data-close]') || t === modal) {
      closeDemo();
    }
  });

  // Esc to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.hidden === false) closeDemo();
  });
})();
