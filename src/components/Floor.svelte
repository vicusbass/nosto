<script>
  const {
    rooms = [],
    FloorPlan,
    onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`),
  } = $props();
  function updateApartmentHighlightsAndClicks() {
    const apartmentElements = document.querySelectorAll('svg [id]');

    apartmentElements.forEach((el) => {
      const apartmentId = el.id;

      if (apartmentId) {
        const room = rooms.find((r) => r.id === apartmentId);

        const label = document.querySelector(`.secondary-label[data-ap-id="${apartmentId}"]`);
        if (label) {
          label.onmouseenter = () => {
            el.style = `fill: var(--color-apt-hover);fill-opacity: 0.9;cursor: pointer;`;
            if (room?.sold && label) label.innerHTML = label.dataset.originalText;
          };
        }

        el.onmouseleave = () => {
          el.style = '';
          if (room?.sold && label) label.innerHTML = 'vândut';
        };

        el.onclick = (_e) => onApartmentClick(apartmentId);

        if (room) {
          if (room.sold) {
            el.classList.add('apartment-sold');
            el.classList.remove('highlight-apartment');
            el.classList.remove('no-highlight');

            if (label) {
              // Save original text if not already saved
              if (!label.dataset.originalText) {
                label.dataset.originalText = label.innerHTML;
              }
              label.innerHTML = 'vândut';

              // Add hover listeners to restore and revert text
              el.onmouseenter = () => {
                label.innerHTML = label.dataset.originalText;
              };
            }
          } else {
            el.classList.add('highlight-apartment');
            el.classList.remove('no-highlight');
            el.classList.remove('apartment-sold');
          }
        } else {
          el.classList.remove('highlight-apartment');
          el.classList.add('no-highlight');
          el.classList.remove('apartment-sold');
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
    if (rooms) {
      updateApartmentHighlightsAndClicks();
    }
  });
</script>

{@render FloorPlan()}
