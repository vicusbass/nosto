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
            if (!room?.sold) {
              el.style = `fill: var(--color-apt-hover);fill-opacity: 0.9;cursor: pointer;`;
              label.onclick = () => onApartmentClick(apartmentId);
            } else {
              label.style = `cursor: default;`;
            }
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
            el.onclick = null;

            if (label) {
              label.onclick = null;
              label.innerHTML = 'vândut';
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
