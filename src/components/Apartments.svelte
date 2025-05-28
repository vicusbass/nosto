<script>
  import Parter from "./Parter.svelte";
  import Etaj1 from "./Etaj1.svelte";
  import Etaj2 from "./Etaj2.svelte";
  import Etaj3 from "./Etaj3.svelte";
  import Floor from "./Floor.svelte";

  const { units = [] } = $props();

  const ROOM_TYPE_TO_SANITY_VALUE = {
    'Studio': '1',
    '1.5 Camere': '1.5',
    '2 Camere': '2',
    '2.5 Camere': '2.5',
    '3 Camere': '3',
    '4 Camere': '4',
  };

  const floors = [
    { name: "Parter", component: Parter, id: "parter" },
    { name: "Etajul 1", component: Etaj1, id: "etaj1" },
    { name: "Etajul 2", component: Etaj2, id: "etaj2" },
    { name: "Etajul 3", component: Etaj3, id: "etaj3" }
  ];

  const roomOptions = Object.keys(ROOM_TYPE_TO_SANITY_VALUE);
  
  // Default values
  let selectedIdx = $state(0);
  let selectedRooms = $state([]);
  let displayableUnits = $state([]);
  
  // Load saved state when component initializes
  $effect(() => {
    loadSavedState();
  });
  
  // Update displayableUnits when selection changes
  $effect(() => {
    updateDisplayableUnits();
  });
  
  function loadSavedState() {
    if (typeof window === 'undefined') return;
    
    try {
      const url = new URL(window.location);
      
      const floorParam = url.searchParams.get('floor');
      if (floorParam) {
        const floorIndex = floors.findIndex(f => f.id === floorParam);
        if (floorIndex >= 0) selectedIdx = floorIndex;
      } else {
        // Fall back to localStorage
        const savedFloor = localStorage.getItem('selectedFloor');
        if (savedFloor) {
          const floorIndex = floors.findIndex(f => f.id === savedFloor);
          if (floorIndex >= 0) selectedIdx = floorIndex;
        }
      }
      
      const roomsParam = url.searchParams.get('rooms');
      if (roomsParam) {
        const roomsList = roomsParam.split(',');
        const validRooms = roomsList.filter(room => roomOptions.includes(room));
        if (validRooms.length > 0) selectedRooms = validRooms;
      } else {
        // Fall back to localStorage
        const savedRooms = localStorage.getItem('selectedRooms');
        if (savedRooms) {
          try {
            const parsedRooms = JSON.parse(savedRooms);
            if (Array.isArray(parsedRooms)) selectedRooms = parsedRooms;
          } catch (e) {
            console.error('Error parsing saved rooms:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved apartment filters:', error);
    }
  }
  
  function updateDisplayableUnits() {
    const selectedFloorName = floors[selectedIdx].name;
    const selectedSanityTypes = selectedRooms.map(roomName => 
      ROOM_TYPE_TO_SANITY_VALUE[roomName]).filter(Boolean);

    const currentFloorUnits = units.filter(unit => unit.floor === selectedFloorName);
    
    displayableUnits = currentFloorUnits.filter(unit => {
      if (selectedSanityTypes.length === 0) return true;
      return selectedSanityTypes.includes(unit.type);
    });
  }
  
  function saveState() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('selectedFloor', floors[selectedIdx].id);
      localStorage.setItem('selectedRooms', JSON.stringify(selectedRooms));
      
      const url = new URL(window.location);
      url.searchParams.set('floor', floors[selectedIdx].id);
      
      if (selectedRooms.length > 0) {
        url.searchParams.set('rooms', selectedRooms.join(','));
      } else {
        url.searchParams.delete('rooms');
      }
      
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.error('Error saving apartment filters:', error);
    }
  }

  function toggleRoom(room) {
    if (selectedRooms.includes(room)) {
      selectedRooms = selectedRooms.filter(r => r !== room);
    } else {
      selectedRooms = [...selectedRooms, room];
    }
    saveState();
  }

  function handleApartmentClick(apartmentId) {
    if (apartmentId) {
      window.location.href = `/apartamente/${apartmentId}`;
    }
  }

  function selectFloor(idx) {
    selectedIdx = idx;
    saveState();
  }
</script>

<div class="flex flex-wrap justify-center gap-2 mb-6">
  {#each roomOptions as room}
    <button
      type="button"
      class="px-3 py-1 rounded border border-primary font-medium transition-colors duration-200
        {selectedRooms.includes(room) ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : 'bg-white text-primary hover:bg-blue-50'}"
      aria-pressed={selectedRooms.includes(room)}
      onclick={() => toggleRoom(room)}
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
      onchange={() => saveState()}
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
        onclick={() => selectFloor(idx)}
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
