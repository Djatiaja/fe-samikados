<template>
  <section class="mt-8 lg:mx-20 p-4">
    <div class="flex items-center">
      <img
        :src="seller.photo_url"
        alt="Store Logo"
        class="rounded-full w-12 h-12 sm:w-16 sm:h-16"
      />
      <div class="ml-4 flex-1">
        <h3 class="font-bold text-lg sm:text-xl">{{ seller.name }}</h3>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    seller: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        name: 'Unknown Seller',
        photo_url: 'https://placehold.co/600x400',
      }),
    },
  },
  setup() {
    return {}
  },
}
</script>
