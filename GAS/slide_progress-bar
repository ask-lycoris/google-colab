/**
 * Adds progress bars to a presentation.
 * Configure some 
 */
const BAR_ID = 'PROGRESS_BAR_ID';
const BAR_HEIGHT = 8; // px
const BAR_COLOR = [10, 21, 97]; // RGB
const IS_BAR_POSITION_TOP = true // If false, BAR_POSITION is placed at bottom.
let starting_page_number = undefined; // 1 or more
let ending_page_number = undefined; // must be greater than starting_page_number


/**
 * Runs when the add-on is installed.
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen();
}

/**
 * Trigger for opening a presentation.
 * @param {object} e The onOpen event.
 */
function onOpen(e) {
  SlidesApp.getUi().createAddonMenu()
      .addItem('進捗バーを入れる', 'createBars')
      .addItem('進捗バーを消す', 'deleteBars')
      .addToUi();
}

/**
 * Create a rectangle on every slide with different bar widths.
 */
function createBars() {
  deleteBars(); // Delete any existing progress bars
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  starting_page_number = (starting_page_number - 1) || 0
  ending_page_number = (ending_page_number - 1) || slides.length - 1
  console.log(slides.length)
  for (let i = starting_page_number; i <= ending_page_number; ++i) {
    const ratioComplete = ((i - starting_page_number + 1) / (ending_page_number - starting_page_number + 1));
    const x = 0;
    let y = presentation.getPageHeight() - BAR_HEIGHT;
    if (IS_BAR_POSITION_TOP) {y = 0}
    const barWidth = presentation.getPageWidth() * ratioComplete;
    if (barWidth > 0) {
      const bar = slides[i].insertShape(SlidesApp.ShapeType.RECTANGLE, x, y,
          barWidth, BAR_HEIGHT);
      bar.getBorder().setTransparent();
      bar.setLinkUrl(BAR_ID);
      bar.getFill().setSolidFill(...BAR_COLOR);
    }
  }
}

/**
 * Deletes all progress bar rectangles.
 */
function deleteBars() {
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  for (let i = 0; i < slides.length; ++i) {
    const elements = slides[i].getPageElements();
    for (const el of elements) {
      if (el.getPageElementType() === SlidesApp.PageElementType.SHAPE &&
        el.asShape().getLink() &&
        el.asShape().getLink().getUrl() === BAR_ID) {
        el.remove();
      }
    }
  }
}
