<script>
  import Parter from "./Parter.svelte";
  import Etaj1 from "./Etaj1.svelte";
  import Etaj2 from "./Etaj2.svelte";
  import Etaj3 from "./Etaj3.svelte";
  import Floor from "./Floor.svelte";
  import { onDestroy } from 'svelte';

  export let units = [];
  // $: console.log(units); // Optional: for debugging

  const ROOM_TYPE_TO_SANITY_VALUE = {
    'Studio': '1',
    '1.5 Camere': '1.5',
    '2 Camere': '2',
    '2.5 Camere': '2.5',
    '3 Camere': '3',
    '4 Camere': '4',
    // 'Comercial': 'C', // Uncomment if needed
  };

  let selectedIdx = 0;
  const floors = [
    { name: "Parter", component: Parter },
    { name: "Etaj 1", component: Etaj1 },
    { name: "Etaj 2", component: Etaj2 },
    { name: "Etaj 3", component: Etaj3 }
  ];

  // Room filter logic
  const roomOptions = Object.keys(ROOM_TYPE_TO_SANITY_VALUE);
  let selectedRooms = []; // User-friendly names like "Studio"

  function toggleRoom(room) {
    if (selectedRooms.includes(room)) {
      selectedRooms = selectedRooms.filter(r => r !== room);
    } else {
      selectedRooms = [...selectedRooms, room];
    }
  }

  // Filtered apartment IDs to display
  let displayableApartmentIds = [];

  $: {
    const selectedFloorName = floors[selectedIdx].name;
    const selectedSanityTypes = selectedRooms.map(roomName => ROOM_TYPE_TO_SANITY_VALUE[roomName]).filter(Boolean);

    displayableApartmentIds = units
      .filter(unit => {
        const isCorrectFloor = unit.floor === selectedFloorName;
        if (!isCorrectFloor) return false;

        if (selectedSanityTypes.length === 0) return true; // No room type filter, show all on this floor
        return selectedSanityTypes.includes(unit.type);
      })
      .map(unit => unit.uniqueId);
    // $: console.log("Displayable IDs:", displayableApartmentIds);
  }

  function handleApartmentClick(apartmentId) {
    if (apartmentId) {
      window.location.href = `/apartamente/${apartmentId}`;
    }
  }

  // Ensure component reacts to prop changes if units are loaded async
  $: if (units.length > 0) {
    // Trigger a recalculation when units are available
    const currentSelectedRooms = [...selectedRooms];
    selectedRooms = []; // Force a change to trigger reactivity
    selectedRooms = currentSelectedRooms;
  }

</script>

<!-- Room filter UI -->
<div class="flex flex-wrap justify-center gap-2 mb-6">
  {#each roomOptions as room}
    <button
      type="button"
      class="px-3 py-1 rounded border border-primary font-medium transition-colors duration-200
        {selectedRooms.includes(room) ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : 'bg-white text-primary hover:bg-blue-50'}"
      aria-pressed={selectedRooms.includes(room)}
      on:click={() => toggleRoom(room)}
    >
      {room}
    </button>
  {/each}
</div>

<!-- Responsive floor selector: dropdown on small screens, buttons on md+ -->
<div class="mb-8">
  <div class="block md:hidden w-full max-w-xs mx-auto">
    <select
      class="w-full rounded border border-gray-300 py-2 px-3 bg-gray-50 text-gray-700 focus:ring-primary focus:border-primary"
      bind:value={selectedIdx}
    >
      {#each floors as floor, idx}
        <option value={idx}>{floor.name}</option>
      {/each}
    </select>
  </div>
  <div class="hidden md:flex justify-center gap-2">
    {#each floors as floor, idx}
      <button
        type="button"
        class="px-3 py-2 rounded font-medium border border-gray-300 text-gray-700 bg-gray-50 transition-colors duration-200
          {selectedIdx === idx ? 'ring-2 ring-primary bg-primary/10 text-primary' : 'hover:bg-primary/10 hover:text-primary'}"
        aria-current={selectedIdx === idx ? "page" : undefined}
        on:click={() => (selectedIdx = idx)}
      >
        {floor.name}
      </button>
    {/each}
  </div>
</div>
<div>
  <Floor
    rooms={displayableApartmentIds}
    FloorPlan={floors[selectedIdx].component}
    floorName={floors[selectedIdx].name}
    onApartmentClick={handleApartmentClick}
  />
</div>
