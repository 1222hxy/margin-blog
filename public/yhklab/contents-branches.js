export function contentsBranches(rails, onChange, signal) {
  const byId = new Map();
  for (const rail of rails) {
    for (const button of rail.querySelectorAll(
      "button[aria-labelledby][aria-expanded]",
    )) {
      const label = document.getElementById(
        button.getAttribute("aria-labelledby"),
      );
      const id = label.getAttribute("href").slice(1);
      const list = button.closest("li").querySelector(":scope > ul");
      const branches = byId.get(id) ?? [];
      branches.push({ button, list });
      byId.set(id, branches);
      button.addEventListener(
        "click",
        () => {
          const open = button.getAttribute("aria-expanded") !== "true";
          for (const branch of branches) {
            branch.button.setAttribute("aria-expanded", String(open));
            branch.button.firstElementChild.classList.toggle("rotate-90", open);
            branch.button.firstElementChild.classList.toggle(
              "rtl:rotate-180",
              !open,
            );
            branch.list.hidden = !open;
          }
          onChange();
        },
        { signal },
      );
    }
  }
}

export function visibleContentsLink(link) {
  for (
    let row = link.closest("li");
    row;
    row = row.parentElement.closest("li")
  ) {
    if (row.parentElement.hidden)
      link = row.parentElement.previousElementSibling.querySelector("a");
  }
  return link;
}
