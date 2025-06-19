<template>
  <div
    class="flex flex-col items-center justify-center w-full h-24 sm:h-28 lg:h-32 p-2 hover:bg-gray-100 rounded-lg transition"
  >
    <a :href="link" class="flex flex-col items-center justify-center w-full h-full">
      <img
        :src="image"
        :alt="'Icon for ' + name"
        class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain mb-2"
      />
      <span class="text-xs sm:text-sm lg:text-base text-center leading-tight line-clamp-2">
        {{ name }}
      </span>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    image: String,
    link: String,
  },
}
</script>
