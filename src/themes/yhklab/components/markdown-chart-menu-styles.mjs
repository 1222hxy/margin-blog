import { chartForeground, chartPopover } from "./markdown-chart-layout.mjs";

const motion = "opacity 200ms ease-in-out";
export const triggerStyle = {
  appearance: "none",
  background: "transparent",
  border: 0,
  color: `var(${chartForeground})`,
  cursor: "pointer",
  height: 20,
  padding: 0,
  position: "absolute",
  insetInlineEnd: 0,
  top: 0,
  transition: motion,
  width: 20,
  zIndex: 20,
};
export const menuTypography = {
  fontSize: "var(--type-nav-size)",
  fontWeight: "var(--type-nav-weight)",
  letterSpacing: "var(--type-nav-track)",
  lineHeight: "var(--type-nav-line)",
};
export const menuSurface = {
  backdropFilter: "blur(24px)",
  background: `var(${chartPopover})`,
  borderRadius: "0.38rem",
  color: `var(${chartForeground})`,
  display: "grid",
  minWidth: "10rem",
  overflow: "hidden",
  padding: 12,
  zIndex: 53,
  ...menuTypography,
  "--dotcom-chart-action-menu-enter-duration":
    "var(--transition-duration-long)",
  "--dotcom-chart-action-menu-exit-duration":
    "var(--transition-duration-short)",
  "--dotcom-chart-action-menu-slide-distance": "calc(var(--spacing)*2)",
  "--dotcom-chart-action-menu-timing-function":
    "var(--transition-timing-function-primary)",
};
export const menuItemStyle = {
  alignItems: "center",
  borderRadius: "0.25rem",
  color: "inherit",
  cursor: "default",
  display: "flex",
  font: "inherit",
  gap: 8,
  height: 32,
  outline: "none",
  paddingInline: 8,
  textAlign: "start",
  transition: "background-color 150ms ease-in-out",
  userSelect: "none",
  whiteSpace: "nowrap",
  ...menuTypography,
};
export const menuAnimation = `
@keyframes dotcom-chart-action-menu-enter {
  from {
    opacity: 0;
    transform: translate(
      var(--dotcom-chart-action-menu-slide-x),
      var(--dotcom-chart-action-menu-slide-y)
    );
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}
@keyframes dotcom-chart-action-menu-exit {
  from {
    opacity: 1;
    transform: translate(0, 0);
  }
  to {
    opacity: 0;
    transform: translate(
      var(--dotcom-chart-action-menu-slide-x),
      var(--dotcom-chart-action-menu-slide-y)
    );
  }
}
[data-dotcom-chart-menu-animation] {
  --dotcom-chart-action-menu-slide-x: 0;
  --dotcom-chart-action-menu-slide-y: 0;
}
[data-dotcom-chart-menu-animation][data-side='bottom'] {
  --dotcom-chart-action-menu-slide-y: calc(-1 * var(--dotcom-chart-action-menu-slide-distance));
}
[data-dotcom-chart-menu-animation][data-side='top'] {
  --dotcom-chart-action-menu-slide-y: var(--dotcom-chart-action-menu-slide-distance);
}
[data-dotcom-chart-menu-animation][data-side='left'] {
  --dotcom-chart-action-menu-slide-x: var(--dotcom-chart-action-menu-slide-distance);
}
[data-dotcom-chart-menu-animation][data-side='right'] {
  --dotcom-chart-action-menu-slide-x: calc(-1 * var(--dotcom-chart-action-menu-slide-distance));
}
[data-dotcom-chart-menu-animation][data-state='open'] {
  animation: dotcom-chart-action-menu-enter var(--dotcom-chart-action-menu-enter-duration) var(--dotcom-chart-action-menu-timing-function) both;
}
[data-dotcom-chart-menu-animation][data-state='closed'] {
  animation: dotcom-chart-action-menu-exit var(--dotcom-chart-action-menu-exit-duration) var(--dotcom-chart-action-menu-timing-function) both;
}
@media (prefers-reduced-motion: reduce) {
  [data-dotcom-chart-menu-animation][data-state='open'],
  [data-dotcom-chart-menu-animation][data-state='closed'] {
    animation: none;
  }
}
[data-dotcom-chart-action-menu-trigger] svg {
  opacity: 0.64;
  transition: opacity 200ms ease-in-out;
}
[data-dotcom-chart-action-menu-trigger]:is(:hover, :focus-visible, :active, [data-state='open']) svg {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  [data-dotcom-chart-action-menu-trigger] svg {
    transition: none;
  }
}
[data-dotcom-chart-menu-item] { background: transparent; }
[data-dotcom-chart-menu-item][data-highlighted] {
  background: var(--dotcom-chart-color-menu-item-focus-background);
}
`;
