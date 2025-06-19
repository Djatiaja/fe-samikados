```vue
<template>
  <div
    class="p-4 mx-auto border border-gray-200 shadow-md rounded-lg hover:shadow-lg transition min-h-[350px]"
  >
    <router-link :to="link" class="block">
      <img
        :src="image"
        :alt="'Product image for ' + name"
        class="w-full h-[300px] object-cover mb-2 rounded-t-lg"
      />
      <div class="p-2">
        <div class="text-sm lg:text-base font-semibold truncate">{{ name }}</div>
        <div class="text-gray-500 text-sm lg:text-base">Rp{{ price }}</div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: [String, Number],
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
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
a,
.router-link-active {
  text-decoration: none;
  color: inherit;
}
</style>
```
