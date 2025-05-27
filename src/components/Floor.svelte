<script>
  export let rooms = [];
  export let FloorPlan;
  export let onApartmentClick = (id) => console.log(`Apartment clicked: ${id}`);

  import { afterUpdate, onMount } from 'svelte';

  function addRectClickHandlers() {
    document.querySelectorAll('[data-rooms]').forEach(el => {
      el.onclick = (_e) => onApartmentClick(el.id);

      el.classList.add('highlight-apartment');
    });
  }

  onMount(() => {
    addRectClickHandlers();
  });
  afterUpdate(() => {
    document.querySelectorAll('[data-rooms]').forEach(el => {
      if (!rooms || rooms.length === 0 ||
          rooms.includes(parseInt(el.getAttribute('data-rooms')))) {
        el.classList.add('highlight-apartment');
        el.classList.remove('no-highlight');
      } else {
        el.classList.remove('highlight-apartment');
        el.classList.add('no-highlight');
      }

      el.onclick = (_e) => onApartmentClick(el.id);
    });
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