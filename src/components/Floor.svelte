<script>
  const {
    units = [],
    FloorPlan,
    onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`),
  } = $props();
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
        el.onmouseleave = () => (el.style = '');

        if (unit?.sold) {
          el.classList.add('apartment-sold');
          el.classList.remove('highlight-apartment');
          el.classList.remove('no-highlight');
          el.onclick = null;
          if (label) {
            label.style = 'cursor: default;';
            label.innerHTML = 'vândut';
          }
          if (title) title.style = 'cursor: default;';
        } else {
          if (label) {
            label.onclick = clickHandler;
            label.onmouseenter = mouseEnterHandler;
          }
          if (title) {
            title.onclick = clickHandler;
            title.onmouseenter = mouseEnterHandler;
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
