<script>
  export let apartments = [];
  let activeIndex = -1;
</script>

<div class="pb-[15vh]">
  {#each apartments as apartment, index (apartment.type)}
    <div
      class="apartment-section sticky top-24 min-h-[calc(100vh-8rem)] flex-col items-center"
      class:mt-[20vh]={index > 0}
      style="z-index: {activeIndex === index ? 1 : 0}"
    >
      <button
        class="heading-font text-2xl font-normal rounded-sm shadow-sm flex items-center justify-center py-3 -mb-2 overflow-hidden w-full"
        class:bg-main={index % 2 === 0}
        class:bg-secondary={index % 2 !== 0}
        on:click={() => {
            activeIndex = index;
            console.log(`Selected apartment type: ${apartment.type}`);
        }}
        aria-pressed={activeIndex === index}
        style="cursor:pointer; width:calc({100 / apartments.length}%); max-width:{100 / apartments.length}%; margin-left:{(index / apartments.length) * 100}%;"
      >
        {apartment.type}
      </button>
      <div
        class="grid grid-cols-1 md:grid-cols-2 rounded-sm w-full h-[640px] md:min-h-[420px] lg:min-h-[420px] items-stretch overflow-hidden"
        class:bg-main={index % 2 === 0}
        class:bg-secondary={index % 2 !== 0}
        style="box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);"
      >
        <div class="space-y-6 flex flex-col justify-between p-8 h-full">
          <p class="text-gray-600 heading-font">{apartment.description}</p>
          <ul class="space-y-3">
            {#each apartment.features as feature}
              <li class="flex items-center text-gray-700">
                <span class="w-6 h-6 mr-2 text-primary">✓</span>
                {feature}
              </li>
            {/each}
          </ul>
        </div>
        <div class="flex items-center h-full">
          <img
            src={apartment.planImage}
            alt={`Plan ${apartment.type}`}
            class="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  {/each}
</div>
