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

<div class="pb-0">
  <div class="h-12 md:h-14 w-full z-3 cursor-pointer sticky top-20 flex">
    {#each apartments as apartment, index (apartment.type)}
      <button
        class="flex-1 h-full"
        on:click={(e) => {
          if (!areTabsActive) return;

          const tab = document.querySelector(`[data-index="${index}"]`);
          tab.style.opacity = '0.7';
          activeIndex = index;
          setTimeout(() => {
            tab.style.opacity = '1';
          }, 300);
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
      class="sticky top-20 min-h-[calc(100vh-8rem)] flex-col transition-opacity duration-300"
      class:mt-[20vh]={index > 0}
      class:z-2={areTabsActive && index === activeIndex}
    >
      <div
        class="heading-font text-sm md:text-2xl shadow-xl font-normal py-3 px-1 -mb-[2px] overflow-hidden min-h-10 whitespace-nowrap overflow-ellipsis flex items-center justify-center"
        class:bg-main={index % 2 === 0}
        class:bg-tab-secondary={index % 2 !== 0}
        style="
            width:calc({100 / apartments.length}%);
            max-width:{100 / apartments.length}%;
            margin-left:{(index / apartments.length) * 100}%;
        "
      >
        <span class="block md:hidden">{apartment.mobileType || apartment.type}</span>
        <span class="hidden md:block">{apartment.type}</span>
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 p-6 md:px-12 md:py-20 w-full h-[700px] md:h-[600px] md:min-h-[400px] overflow-hidden bg-main"
        class:shadow-xl={index === 0}
      >
        <img
          src={apartment.planImage}
          alt={`Plan ${apartment.type}`}
          class="object-contain rounded-tr-[120px] max-h-[460px]"
        />
        <div class="space-y-4 md:space-y-6 md:ml-12 h-full flex flex-col justify-around">
          <p class="text-xl">{apartment.description}</p>
          <div>
            <a
              href={`/apartamente?floor=parter&rooms=${apartment.type.replace(/ /g, '+').toLowerCase()}`}
              class="btn-primary px-6 py-3"
              aria-label={`More details about ${apartment.type}`}
            >
              VEZI MAI MULTE OPȚIUNI
            </a>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
