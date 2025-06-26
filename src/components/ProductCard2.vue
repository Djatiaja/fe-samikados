```vue
<template>
  <router-link
    :to="link"
    class="bg-red-600 text-white p-2 sm:p-3 rounded-lg block min-h-[350px] hover:bg-red-700 transition"
  >
    <img
      :src="image"
      :alt="'Product image for ' + name"
      class="w-full h-[300px] object-cover mb-2 sm:mb-4 lg:mb-6 rounded-md bg-white"
    />
    <h4 class="font-bold text-sm sm:text-base lg:text-lg truncate">{{ name }}</h4>
    <p class="text-xs sm:text-sm lg:text-base">{{ price }}</p>
    <p class="text-xs sm:text-sm lg:text-base">{{ sold }}</p>
  </router-link>
</template>

<script>
export default {
  props: {
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    sold: {
      type: String,
      required: true,
    },
  },
}
</script>
```
