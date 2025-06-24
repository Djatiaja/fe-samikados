<template>
  <div class="lg:w-1/3 h-1/3" v-if="product">
    <div class="relative">
      <div class="overflow-hidden rounded-lg shadow-lg">
        <swiper
          :modules="[Navigation, Pagination]"
          :navigation="true"
          :pagination="{ clickable: true }"
          class="mySwiper"
        >
          <swiper-slide v-for="(image, index) in productImages" :key="index">
            <div class="image-container">
              <img
                :src="image.src"
                :alt="image.alt"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
    <h2 class="text-3xl font-bold mt-4">{{ product.name || 'Loading...' }}</h2>
    <p class="text-gray-500">
      {{ product.soldCount ? `${product.soldCount}+ Terjual` : '0+ Terjual' }}
    </p>
    <p class="mt-4 text-gray-700">{{ product.description || 'No description available' }}</p>
  </div>
  <div v-else class="lg:w-1/3 h-1/3">
    <p>Loading product data...</p>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    productImages: {
      type: Array,
      required: true,
    },
    product: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const handleImageError = (event) => {
      event.target.src = 'https://placehold.co/400x400'
    }

    return {
      Navigation,
      Pagination,
      handleImageError,
    }
  },
}
</script>

<style scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #dc2626;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #b91c1c !important;
}

.mySwiper {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 0.5rem;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f3f4f6;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

@media (max-width: 640px) {
  .mySwiper {
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .mySwiper {
    max-width: 320px;
  }
}
</style>
