import { contentsBranches, visibleContentsLink } from "./contents-branches.js";
import { watchRailCollision } from "./contents-collision.js";
import { mobileContents } from "./contents-mobile.js";
import {
  revealCurrent,
  scrollToHeading,
  watchContents,
} from "./contents-position.js";

function setCurrent(link, selected) {
  if (link.getAttribute("aria-current") === String(selected)) return;
  link.setAttribute("aria-current", String(selected));
  link.classList.toggle("text-primary-100", selected);
  link.classList.toggle("text-primary-60", !selected);
  link.classList.toggle("hover:text-primary-100", !selected);
}

function mountContents(body, nav, signal) {
  if (nav.length !== 2) return;
  const [mobile, desktop] = nav;
  const disclosure = mobileContents(mobile, revealCurrent, signal);
  const idFor = (link) => link.getAttribute("href").slice(1);
  const desktopLinks = [...desktop.querySelectorAll("a")];
  const links = [...desktopLinks, ...mobile.querySelectorAll("a")];
  const headingLinks = new Map(desktopLinks.map((link) => [idFor(link), link]));
  const headings = [...headingLinks.keys()]
    .map((id) => document.getElementById(id))
    .filter((heading) => heading && body.contains(heading));
  const targets = new Map(headings.map((heading) => [heading.id, heading]));
  let activeId = headings[0]?.id;
  let visibleId = activeId;

  function updateCurrent() {
    const activeLink = headingLinks.get(activeId);
    if (!activeLink) return;
    const visibleLink = visibleContentsLink(activeLink);
    const next = idFor(visibleLink);
    if (next === visibleId) return;
    visibleId = next;
    for (const link of links) setCurrent(link, idFor(link) === visibleId);
    disclosure.title(visibleLink.textContent);
    requestAnimationFrame(() => revealCurrent(desktop));
  }

  contentsBranches(nav, updateCurrent, signal);
  for (const link of links) {
    const id = idFor(link),
      heading = targets.get(id);
    if (!heading) continue;
    link.addEventListener(
      "click",
      (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        if (!mobile.contains(link) || activeId !== id) scrollToHeading(heading);
        disclosure.close();
      },
      { signal },
    );
  }
  watchContents({
    body,
    headings,
    activate(id) {
      if (id === activeId) return;
      activeId = id;
      updateCurrent();
    },
    showMobile: disclosure.show,
    signal,
  });
  watchRailCollision(
    body,
    desktop,
    (visible) => {
      desktop.inert = !visible;
      desktop.setAttribute("aria-hidden", String(!visible));
      for (const name of ["opacity-100", "duration-fast"])
        desktop.classList.toggle(name, visible);
      for (const name of ["opacity-0", "duration-50", "pointer-events-none"])
        desktop.classList.toggle(name, !visible);
    },
    signal,
  );
}

export function startContents() {
  let body, mobile, desktop, controller;
  function sync() {
    const nextBody = document.getElementById("article-body");
    const nextNav = [
      ...(nextBody?.parentElement.querySelectorAll(
        ':scope > nav[aria-label="目录"]',
      ) ?? []),
    ];
    if (body === nextBody && mobile === nextNav[0] && desktop === nextNav[1])
      return;
    controller?.abort();
    body = nextBody;
    [mobile, desktop] = nextNav;
    if (!body || nextNav.length !== 2) return;
    controller = new AbortController();
    mountContents(body, nextNav, controller.signal);
  }
  // Hydration may replace the SSR article. Follow the live DOM and tear down
  // observers and handlers that belong to the detached article.
  new MutationObserver(sync).observe(document.body, {
    childList: true,
    subtree: true,
  });
  sync();
}
