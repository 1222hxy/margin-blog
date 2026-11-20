const collapsed = ['invisible', 'origin-top', 'grid-rows-[0fr]', 'transition-[grid]', 'duration-short', 'ease-primary', 'motion-reduce:transition-none'];

export function mobileContents(nav, revealCurrent, signal) {
  const toggle = nav.querySelector('button[aria-expanded]');
  const title = toggle.querySelector('span');
  const close = nav.querySelector('button[aria-label]');
  const panel = nav.querySelector('div[aria-hidden]');
  const scroller = panel.firstElementChild;
  const label = close.querySelector('svg');
  const closeOnScroll = () => setOpen(false);
  let open = false;

  function setOpen(next) {
    if (open === next) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('hidden', open);
    close.inert = !open;
    close.classList.toggle('pointer-events-none', !open);
    label.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    panel.setAttribute('aria-hidden', String(!open));
    panel.classList.toggle('grid-rows-[1fr]', open);
    for (const name of collapsed) panel.classList.toggle(name, !open);
    if (open) {
      window.addEventListener('scroll', closeOnScroll, { passive: true, once: true, signal });
      requestAnimationFrame(() => { if (open) revealCurrent(scroller); });
    } else window.removeEventListener('scroll', closeOnScroll);
  }
  toggle.addEventListener('click', () => setOpen(!open), { signal });
  close.addEventListener('click', () => setOpen(false), { signal });
  document.addEventListener('mousedown', event => { if (!nav.contains(event.target)) setOpen(false); }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    }
  }, { signal });
  return {
    close: () => setOpen(false),
    show(visible) {
      nav.inert = !visible;
      nav.classList.toggle('opacity-100', visible);
      nav.classList.toggle('opacity-0', !visible);
      if (!visible) setOpen(false);
    },
    title(copy) {
      title.textContent = copy;
      if (open) requestAnimationFrame(() => { if (open) revealCurrent(scroller); });
    },
  };
}
