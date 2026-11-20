export function createPdfComponents(React, dependencies, { staging, grid }) {
  const {
    createPdfDeck,
    createPdfReader,
    createPdfPage,
    createPdfRail,
    createPdfControls,
    createPdfDocument,
    createPdfNotes,
    createPdfInteraction,
  } = dependencies;
  const status = (failed) =>
    React.createElement(
      "div",
      {
        className:
          "grid size-full place-items-center px-6 text-center text-caption text-primary-100",
        role: "status",
      },
      failed ? "幻灯片无法使用。" : "正在加载…",
    );
  const PdfPage = createPdfPage(React, createPdfNotes(React));
  return createPdfDeck(React, {
    staging,
    grid,
    usePdfDocument: createPdfDocument(React),
    PdfReader: createPdfReader(React, {
      PdfPage,
      status,
      PdfRail: createPdfRail(React, PdfPage),
      PdfControls: createPdfControls(React),
      usePdfInteraction: createPdfInteraction(React),
    }),
  });
}
