<template>
  <div class="flex flex-col min-h-screen">

    <HeaderView />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Full-width Banner with Swiper Carousel -->
      <div class="relative my-8" style="margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); width: 100vw;">
        <Swiper
          :modules="[Pagination, Navigation]"
          :slides-per-view="1"
          :space-between="30"
          :loop="true"
          :centered-slides="true"
          :pagination="{ el: '.swiper-pagination', clickable: true }"
          :navigation="true"
          :breakpoints="{
            1028: { slidesPerView: 1.5, spaceBetween: 10 },
          }"
          class="swiper centered-slide-carousel swiper-container relative w-full"
        >
          <SwiperSlide>
            <img src="https://placehold.co/1500x500" alt="Banner image 1" class="w-full h-full object-cover">
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://placehold.co/1500x500" alt="Banner image 2" class="w-full h-full object-cover">
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://placehold.co/1500x500" alt="Banner image 3" class="w-full h-full object-cover">
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://placehold.co/1500x500" alt="Banner image 4" class="w-full h-full object-cover">
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://placehold.co/1500x500" alt="Banner image 5" class="w-full h-full object-cover">
          </SwiperSlide>
        </Swiper>

        <div class="swiper-pagination"></div>
      </div>
      <div class="container mx-auto mt-8">
        <h2 class="text-md sm:text-lg md:text-xl font-bold">PILIH KATEGORI ANDA</h2>
        <div class="text-center mt-4 mb-6 border border-gray-300 shadow-lg p-6 rounded-lg">
          <div class="grid grid-cols-5 gap-4 max-h-60 overflow-y-auto">
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>           
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>           
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>           
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>           
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>           
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
            <CategoryItem1 name="Merchandise" image="/image/order.png" link="/view"/>
          </div>
        </div>
      </div>
      <div class="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
        <ProducCard1 name="Ganci" price="20000" link="/dashboard-seller" image="/image/Transparent.png"/>
        <ProducCard1 name="Ganci" price="20000" link="/dashboard-seller" image="/image/Transparent.png"/>
        <ProducCard1 name="Ganci" price="20000" link="/dashboard-seller" image="/image/Transparent.png"/>
        <ProducCard1 name="Ganci" price="20000" link="/dashboard-seller" image="/image/Transparent.png"/>
        <ProducCard1 name="Ganci" price="20000" link="/dashboard-seller" image="/image/Transparent.png"/>
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import AuthFooter from "@/components/AuthFooter.vue";
import HeaderView from "@/components/HeaderView.vue";
import CategoryItem1 from '@/components/CategoryItem1.vue';
import ProducCard1 from '@/components/ProducCard1.vue';

export default {
  components: { HeaderView, AuthFooter, Swiper, SwiperSlide, CategoryItem1, ProducCard1 },
  setup() {
    return {
      Pagination,
      Navigation
    };
  }
};
</script>

<style scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #dc2626; /* Red-600 */
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #b91c1c !important;
}
</style>

