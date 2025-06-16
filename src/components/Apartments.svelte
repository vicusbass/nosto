<script>
  import Parter from './Parter.svelte';
  import Etaj1 from './Etaj1.svelte';
  import Etaj2 from './Etaj2.svelte';
  import Etaj3 from './Etaj3.svelte';
  import Floor from './Floor.svelte';
  import { is } from 'css-select';

  const { units = [] } = $props();

  const ROOM_TYPE_TO_SANITY_VALUE = {
    Studio: '1',
    '1.5 Camere': '1.5',
    '2 Camere': '2',
    '2.5 Camere': '2.5',
    '3 Camere': '3',
    '4 Camere': '4',
  };

  const floors = [
    { name: 'Parter', component: Parter, id: 'parter' },
    { name: 'Etajul 1', component: Etaj1, id: 'etaj1' },
    { name: 'Etajul 2', component: Etaj2, id: 'etaj2' },
    { name: 'Etajul 3', component: Etaj3, id: 'etaj3' },
  ];

  const roomOptions = Object.keys(ROOM_TYPE_TO_SANITY_VALUE);

  // Default values
  let selectedIdx = $state(0);
  let selectedRooms = $state([]);
  let displayableUnits = $state([]);
  let isFloorInfoExpanded = $state(false);

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
        const floorIndex = floors.findIndex((f) => f.id === floorParam);
        if (floorIndex >= 0) selectedIdx = floorIndex;
      } else {
        // Fall back to localStorage
        const savedFloor = localStorage.getItem('selectedFloor');
        if (savedFloor) {
          const floorIndex = floors.findIndex((f) => f.id === savedFloor);
          if (floorIndex >= 0) selectedIdx = floorIndex;
        }
      }

      const roomsParam = url.searchParams.get('rooms');
      if (roomsParam) {
        const roomsList = roomsParam.split(',');
        const validRooms = roomsList.filter((room) => roomOptions.includes(room));
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
    const selectedSanityTypes = selectedRooms
      .map((roomName) => ROOM_TYPE_TO_SANITY_VALUE[roomName])
      .filter(Boolean);

    const currentFloorUnits = units.filter((unit) => unit.floor === selectedFloorName);

    displayableUnits = currentFloorUnits.filter((unit) => {
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
      selectedRooms = selectedRooms.filter((r) => r !== room);
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
    if (selectedIdx === idx) {
      isFloorInfoExpanded = !isFloorInfoExpanded;
    } else {
      isFloorInfoExpanded = true;
    }
    selectedIdx = idx;
    saveState();
  }
</script>

<div class="flex flex-wrap justify-center gap-2 mb-6">
  {#each roomOptions as room}
    <button
      type="button"
      class="font-heading font-light text-base uppercase mx-2 px-3 py-1
        {selectedRooms.includes(room) ? 'color-orange font-medium border-b-2' : ''}"
      aria-pressed={selectedRooms.includes(room)}
      onclick={() => toggleRoom(room)}
    >
      {room}
    </button>
  {/each}
</div>

<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
  <div class="md:col-span-3">
    <Floor
      rooms={displayableUnits.map((unit) => ({
        id: unit.uniqueId,
        sold: unit.sold,
      }))}
      FloorPlan={floors[selectedIdx].component}
      floorName={floors[selectedIdx].name}
      onApartmentClick={handleApartmentClick}
    />
  </div>
  <div class="md:col-span-2 md:flex flex-col">
    {#each floors as floor, idx}
      <div class="mb-4">
        <button
          type="button"
          class="w-full px-3 py-4 font-medium text-left rounded-tr-2xl bg-secondary transition-all flex items-center justify-between"
          aria-expanded={selectedIdx === idx}
          aria-controls={`floor-panel-${idx}`}
          onclick={() => selectFloor(idx)}
        >
          <span class="font-heading text-lg">{floor.name}</span>
          <svg
            class="w-6 h-6 transition-transform duration-200"
            style="transform: rotate({selectedIdx === idx && isFloorInfoExpanded ? 180 : 0}deg);"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if selectedIdx === idx && isFloorInfoExpanded}
          <div id={`floor-panel-${idx}`} class="bg-secondary px-6 py-6 shadow">
            <p class="mb-2">Apartamente disponibile</p>
            <ul class="ml-4">
              {#each displayableUnits.filter((unit) => unit.floor === floor.name) as unit}
                <li>
                  {unit.name}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
