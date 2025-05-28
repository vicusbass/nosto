<script>
  import Parter from "./Parter.svelte";
  import Etaj1 from "./Etaj1.svelte";
  import Etaj2 from "./Etaj2.svelte";
  import Etaj3 from "./Etaj3.svelte";
  import Floor from "./Floor.svelte";

  export let units = [];

  const ROOM_TYPE_TO_SANITY_VALUE = {
    'Studio': '1',
    '1.5 Camere': '1.5',
    '2 Camere': '2',
    '2.5 Camere': '2.5',
    '3 Camere': '3',
    '4 Camere': '4',
  };

  let selectedIdx = 0;
  const floors = [
    { name: "Parter", component: Parter },
    { name: "Etajul 1", component: Etaj1 },
    { name: "Etajul 2", component: Etaj2 },
    { name: "Etajul 3", component: Etaj3 }
  ];

  const roomOptions = Object.keys(ROOM_TYPE_TO_SANITY_VALUE);
  let selectedRooms = [];

  function toggleRoom(room) {
    if (selectedRooms.includes(room)) {
      selectedRooms = selectedRooms.filter(r => r !== room);
    } else {
      selectedRooms = [...selectedRooms, room];
    }
  }

  let displayableUnits = [];

  $: {
    const selectedFloorName = floors[selectedIdx].name;
    const selectedSanityTypes = selectedRooms.map(roomName => ROOM_TYPE_TO_SANITY_VALUE[roomName]).filter(Boolean);

    const currentFloorUnits = units.filter(unit => unit.floor === selectedFloorName);
    
    displayableUnits = currentFloorUnits.filter(unit => {
      if (selectedSanityTypes.length === 0) return true;
      return selectedSanityTypes.includes(unit.type);
    });
  }

  function handleApartmentClick(apartmentId) {
    if (apartmentId) {
      window.location.href = `/apartamente/${apartmentId}`;
    }
  }

  $: if (units.length > 0) {
    const currentSelectedRooms = [...selectedRooms];
    selectedRooms = [];
    selectedRooms = currentSelectedRooms;
  }

</script>

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
    rooms={displayableUnits.map(unit => ({
      id: unit.uniqueId,
      sold: unit.sold
    }))}
    FloorPlan={floors[selectedIdx].component}
    floorName={floors[selectedIdx].name}
    onApartmentClick={handleApartmentClick}
  />
</div>
