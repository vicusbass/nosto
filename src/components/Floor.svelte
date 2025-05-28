<script>
  export let rooms = [];
  export let FloorPlan;
  export let onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`);

  import { afterUpdate, onMount } from 'svelte';

  // This function will be used by both onMount and afterUpdate
  function updateApartmentHighlightsAndClicks() {
    const apartmentElements = document.querySelectorAll('svg [id]'); // More generic selector for elements with an ID in SVG

    apartmentElements.forEach(el => {
      const apartmentId = el.id;
      // Ensure the element is meant to be interactive (e.g., it's an apartment)
      // For now, we assume all elements with an ID within the SVG are potential apartments.
      // If not, a more specific selector or data-attribute check might be needed.

      if (apartmentId) {
        if (rooms && rooms.includes(apartmentId)) {
          el.classList.add('highlight-apartment');
          el.classList.remove('no-highlight');
        } else {
          el.classList.remove('highlight-apartment');
          el.classList.add('no-highlight');
        }
        // Assign click handler regardless of current highlight state,
        // as the user should be able to click any apartment.
        el.onclick = (_e) => onApartmentClick(apartmentId);
      }
    });
  }

  onMount(() => {
    updateApartmentHighlightsAndClicks();
  });

  afterUpdate(() => {
    updateApartmentHighlightsAndClicks();
  });
</script>

<svelte:component this={FloorPlan} />

<style>
  :global(svg .highlight-apartment) {
    fill: #008000;
    fill-opacity: 0.2;
    transition: fill-opacity 0.3s;
  }

  :global(svg .no-highlight) {
    opacity: 0;
  }

  :global(svg .highlight-apartment:hover) {
    fill-opacity: 0.5 !important;
    cursor: pointer;
  }
</style>