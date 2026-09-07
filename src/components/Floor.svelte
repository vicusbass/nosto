<script>
  const {
    units = [],
    FloorPlan,
    onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`),
  } = $props();

  const STATUS_TEXT = { sold: 'VÂNDUT', available: 'DISPONIBIL' };
  /** Extra vertical gap (SVG user units) between the row above and the status tag. */
  const STATUS_GAP = 3;

  /** Parse an SVG `transform="matrix(a b c d tx ty)"` attribute into six numbers. */
  function parseMatrix(textEl) {
    const match = /matrix\(([^)]+)\)/.exec(textEl?.getAttribute('transform') ?? '');
    if (!match) return null;
    const values = match[1].trim().split(/[\s,]+/).map(Number);
    return values.length === 6 && values.every(Number.isFinite) ? values : null;
  }

  /**
   * Places a status tag ("VÂNDUT" / "DISPONIBIL") under an apartment's labels.
   * `row` is the label row the tag occupies: 1 takes the room-count row (sold units
   * hide that row), 2 sits below it (available units keep the room count).
   * The tag reuses the room-count <text> element (anchor, scale) and the SVG's own
   * line spacing plus STATUS_GAP, so it fits every floor plan without editing the SVGs.
   */
  function ensureStatusLabel(apartmentId, title, label, text, row) {
    const primaryText = title?.parentElement;
    const secondaryText = label?.parentElement;
    const primaryMatrix = parseMatrix(primaryText);
    const secondaryMatrix = parseMatrix(secondaryText);
    if (!primaryMatrix || !secondaryMatrix) return null;

    let statusLabel = document.querySelector(`.status-label[data-ap-id="${apartmentId}"]`);
    if (!statusLabel) {
      const clone = secondaryText.cloneNode(true);
      clone.removeAttribute('clip-path');
      statusLabel = clone.querySelector('.secondary-label');
      if (!statusLabel) return null;
      statusLabel.classList.replace('secondary-label', 'status-label');
      secondaryText.after(clone);
    }

    const [a, b, c, d, tx] = secondaryMatrix;
    const lineSpacing = secondaryMatrix[5] - primaryMatrix[5];
    const ty = Math.round((primaryMatrix[5] + row * lineSpacing + STATUS_GAP) * 100) / 100;
    const statusText = statusLabel.parentElement;
    statusText.setAttribute('transform', `matrix(${a} ${b} ${c} ${d} ${tx} ${ty})`);
    // The clone may inherit `display: none` from a hidden room-count row; the tag is always shown.
    statusText.style.display = '';
    statusLabel.textContent = text;
    return statusLabel;
  }

  function removeStatusLabel(apartmentId) {
    document.querySelector(`.status-label[data-ap-id="${apartmentId}"]`)?.parentElement?.remove();
  }

  function updateApartmentHighlightsAndClicks() {
    const apartmentElements = document.querySelectorAll('svg [id]');

    apartmentElements.forEach((el) => {
      const apartmentId = el.id;

      if (apartmentId) {
        const unit = units.find((r) => r.id === apartmentId);

        const mouseEnterHandler = (e) => {
          if (!unit?.sold) {
            el.style = `fill: var(--color-apt-hover);fill-opacity: 0.9;cursor: pointer;`;
          } else {
            el.target.style = `cursor: default;`;
          }
        };

        const clickHandler = (_e) => {
          console.log(`Label clicked for apartment: ${apartmentId}`);
          onApartmentClick(apartmentId);
        };

        const title = document.querySelector(`.primary-label[data-ap-id="${apartmentId}"]`);
        const label = document.querySelector(`.secondary-label[data-ap-id="${apartmentId}"]`);

        el.onclick = (_e) => onApartmentClick(apartmentId);

        if (unit?.sold) {
          el.classList.add('apartment-sold');
          el.classList.remove('highlight-apartment');
          el.classList.remove('no-highlight');
          el.onclick = null;
          // The status tag replaces the room-count row for sold units.
          if (label) label.parentElement.style.display = 'none';
          if (title) title.style = 'cursor: default;';
          const statusLabel = ensureStatusLabel(apartmentId, title, label, STATUS_TEXT.sold, 1);
          if (statusLabel) {
            statusLabel.style = 'cursor: default;';
            statusLabel.onclick = null;
            statusLabel.onmouseenter = null;
          }
        } else {
          if (label) {
            label.parentElement.style.display = '';
            label.onclick = clickHandler;
            label.onmouseenter = mouseEnterHandler;
          }
          if (title) {
            title.onclick = clickHandler;
            title.onmouseenter = mouseEnterHandler;
          }
          if (unit) {
            const statusLabel = ensureStatusLabel(apartmentId, title, label, STATUS_TEXT.available, 2);
            if (statusLabel) {
              statusLabel.style = 'cursor: pointer;';
              statusLabel.onclick = clickHandler;
              statusLabel.onmouseenter = mouseEnterHandler;
            }
          } else {
            removeStatusLabel(apartmentId);
          }

          if (unit?.shouldHighlight) {
            el.classList.add('highlight-apartment');
            el.classList.remove('no-highlight');
            el.classList.remove('apartment-sold');
          } else {
            el.classList.remove('highlight-apartment');
            el.classList.add('no-highlight');
            el.classList.remove('apartment-sold');
          }
          el.onmouseleave = () => (el.style = '');
        }
      }
    });
  }

  let mounted = false;
  $effect(() => {
    if (!mounted) {
      updateApartmentHighlightsAndClicks();
      mounted = true;
    }
  });

  $effect(() => {
    if (units) {
      updateApartmentHighlightsAndClicks();
    }
  });
</script>

{@render FloorPlan()}
