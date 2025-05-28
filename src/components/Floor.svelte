<script>
  
  const { rooms = [], FloorPlan, onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`) } = $props();
  function updateApartmentHighlightsAndClicks() {
    const apartmentElements = document.querySelectorAll('svg [id]');

    apartmentElements.forEach(el => {
      const apartmentId = el.id;

      if (apartmentId) {
        const room = rooms.find(r => r.id === apartmentId);
        
        if (room) {
          if (room.sold) {
            el.classList.add('apartment-sold');
            el.classList.remove('highlight-apartment');
            el.classList.remove('no-highlight');
            el.onclick = null;
          } else {
            el.classList.add('highlight-apartment');
            el.classList.remove('no-highlight');
            el.classList.remove('apartment-sold');
            el.onclick = (_e) => onApartmentClick(apartmentId);
          }
        } else {
          el.classList.remove('highlight-apartment');
          el.classList.add('no-highlight');
          el.classList.remove('apartment-sold');
          el.onclick = null;
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
