<script>
  import FloorPlan from "./FloorPlan.svelte";
  let selectedIdx = 0;
  const floors = [
    { id: 1, name: "Parter", component: FloorPlan },
    { id: 2, name: "Etaj 1", component: FloorPlan },
    { id: 3, name: "Etaj 2", component: FloorPlan },
    { id: 4, name: "Etaj 3", component: FloorPlan },
    { id: 5, name: "Etaj 4", component: FloorPlan },
    { id: 6, name: "Etaj 5", component: FloorPlan },
    { id: 7, name: "Etaj 6", component: FloorPlan },
    { id: 8, name: "Etaj 7", component: FloorPlan },
    { id: 9, name: "Etaj 8", component: FloorPlan },
  ];
</script>

<div class="flex justify-center gap-4 mb-8">
  {#each floors as floor, idx}
    <button
      type="button"
      class="px-4 py-2 rounded font-semibold border border-primary transition-colors duration-200 {selectedIdx ===
      idx
        ? 'bg-primary ring-2 ring-primary ring-offset-2'
        : 'text-primary bg-gray-100 hover:bg-primary hover:text-white'}"
      aria-current={selectedIdx === idx ? "page" : undefined}
      on:click={() => (selectedIdx = idx)}
    >
      {floor.name}
    </button>
  {/each}
</div>
<div>
  <svelte:component
    this={floors[selectedIdx].component}
    floorName={floors[selectedIdx].name}
  />
  <!-- <FloorPlan floorName={floors[selectedIdx].name} /> -->
</div>
