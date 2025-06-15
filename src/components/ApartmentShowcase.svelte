<script>
  import { onMount, onDestroy, tick } from 'svelte';
  export let apartments = [];
  let activeIndex = -1;
  let apartmentRefs = [];
  let observer;
  let areTabsActive = false;

  onMount(async () => {
    observer = new IntersectionObserver(
      (entries) => {
        areTabsActive =
          entries.length === apartments.length && entries.every((entry) => entry.isIntersecting);

        const activeEntry = entries.find((entry) => entry.isIntersecting);
        const visibleTabIndex = activeEntry?.target?.dataset.index;

        if (visibleTabIndex === `${apartments.length - 1}`) {
          areTabsActive = true;
        } else if (visibleTabIndex !== undefined) {
          activeIndex = parseInt(visibleTabIndex, 10);
        } else {
          activeIndex = -1;
        }
      },
      { threshold: 1 }
    );
    await tick();
    apartmentRefs.forEach((ref) => ref && observer.observe(ref));
  });

  $: if (observer) {
    observer.disconnect();
    apartmentRefs.forEach((ref) => ref && observer.observe(ref));
  }

  onDestroy(() => {
    if (observer) observer.disconnect();
  });
</script>

<div class="pb-[15vh]">
  <div class="h-14 w-full z-3 cursor-pointer sticky top-24 flex">
    {#each apartments as apartment, index (apartment.type)}
      <button
        class="flex-1 h-full"
        on:click={() => {
          if (areTabsActive) activeIndex = index;
        }}
        aria-label={`Show ${apartment.type} details`}
      >
      </button>
    {/each}
  </div>
  {#each apartments as apartment, index (apartment.type)}
    <div
      bind:this={apartmentRefs[index]}
      data-index={index}
      class="sticky top-24 min-h-[calc(100vh-8rem)] flex-col"
      class:mt-[20vh]={index > 0}
      class:z-2={areTabsActive && index === activeIndex}
    >
      <div
        class="heading-font text-2xl font-normal rounded-tr-sm rounded-tl-sm shadow-sm flex items-center justify-center py-3 -mb-[2px] overflow-hidden"
        class:bg-main={index % 2 === 0}
        class:bg-secondary={index % 2 !== 0}
        style="
            width:calc({100 / apartments.length}%);
            max-width:{100 / apartments.length}%;
            margin-left:{(index / apartments.length) * 100}%;
        "
      >
        {apartment.type}
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 shadow-sm rounded-sm w-full h-[640px] md:min-h-[420px] lg:min-h-[420px] items-stretch overflow-hidden"
        class:bg-main={index % 2 === 0}
        class:bg-secondary={index % 2 !== 0}
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
