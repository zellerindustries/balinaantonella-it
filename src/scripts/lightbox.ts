/* ==========================================
   LIGHTBOX (gallery)
========================================== */

/** Set on <html> once the script is active, so CSS only promises a zoom then. */
const readyClass = 'lightbox-ready';

/** Smallest horizontal finger drag, in CSS px, that counts as a swipe. */
const swipeDistance = 50;

/** How much longer a swipe must be sideways than vertically, so scrolling is not mistaken for it. */
const swipeSlope = 1.5;

/**
 * Opens the full image of a work in the #lightbox dialog.
 * Without JavaScript, or without the dialog markup, the thumbnails stay plain.
 *
 * @param root - Document that holds the gallery and the #lightbox dialog.
 * @returns Nothing; it wires the event listeners and marks <html> as ready.
 */
export function initLightbox(root: Document = document): void {
  const dialog = root.querySelector<HTMLDialogElement>('#lightbox');
  const image = dialog?.querySelector('img');
  const caption = dialog?.querySelector('figcaption');
  const counter = dialog?.querySelector('.lightbox-count');
  const closeButton = dialog?.querySelector('.lightbox-close');
  const prevButton = dialog?.querySelector('.lightbox-prev');
  const nextButton = dialog?.querySelector('.lightbox-next');
  const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('.work-open'));

  if (
    !dialog ||
    !image ||
    !caption ||
    !counter ||
    !closeButton ||
    !prevButton ||
    !nextButton ||
    triggers.length === 0
  ) {
    return;
  }

  let current = 0;
  let opener: HTMLButtonElement | null = null;

  // Fill the dialog with one work. The index wraps, so the first and last
  // works are neighbours; the image attributes are set one by one because the
  // CSP forbids inline styles.
  const show = (index: number): void => {
    current = (index + triggers.length) % triggers.length;
    const trigger = triggers[current];

    image.src = trigger.dataset.full ?? '';
    image.width = Number(trigger.dataset.fullWidth);
    image.height = Number(trigger.dataset.fullHeight);
    image.alt = trigger.querySelector('img')?.alt ?? '';

    const title = root.createElement('strong');
    title.textContent = trigger.dataset.title ?? '';
    const details = root.createElement('span');
    details.textContent = trigger.dataset.caption ?? '';
    caption.replaceChildren(title, details);

    counter.textContent = `${current + 1} / ${triggers.length}`;
  };

  // Open on click. Enter and Space on a focused button produce a click too.
  for (const [index, trigger] of triggers.entries()) {
    trigger.addEventListener('click', () => {
      opener = trigger;
      show(index);
      dialog.showModal();
    });
  }

  closeButton.addEventListener('click', () => dialog.close());
  prevButton.addEventListener('click', () => show(current - 1));
  nextButton.addEventListener('click', () => show(current + 1));

  // Backdrop click: the dialog fills the viewport, so a click whose target is
  // the dialog itself is a click outside the work. The press must also start
  // there, so selecting caption text and releasing outside does not close it.
  let pressedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pressedOnBackdrop) dialog.close();
  });

  // Swipe: a mostly horizontal finger drag steps through the works like the
  // arrow keys (left for the next work, right for the previous). Only touch
  // pointers count, and a mostly vertical drag is left to scroll the dialog.
  let swipeStart: { x: number; y: number } | null = null;
  dialog.addEventListener('pointerdown', (event) => {
    swipeStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  });
  dialog.addEventListener('pointercancel', () => {
    swipeStart = null;
  });
  dialog.addEventListener('pointerup', (event) => {
    if (!swipeStart) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) < swipeDistance || Math.abs(deltaX) < Math.abs(deltaY) * swipeSlope)
      return;
    show(current + (deltaX < 0 ? 1 : -1));
  });

  // Arrow keys step through the works. Esc is handled natively by the dialog.
  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
  });

  // Whatever closed the dialog, give focus back to the work that opened it.
  dialog.addEventListener('close', () => opener?.focus());

  root.documentElement.classList.add(readyClass);
}
