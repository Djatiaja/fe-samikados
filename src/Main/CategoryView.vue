<template>
  <div class="flex flex-col min-h-screen">
    <HeaderView />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <div class="lg:flex lg:justify-between items-center mb-8">
        <img src="https://placehold.co/1800x1200" alt="Merchandise Image" class="w-full lg:w-1/2">
        <div class="w-full lg:w-1/2 lg:pl-8 mt-4 lg:mt-0 flex flex-col justify-center items-center text-center">
          <h2 class="text-xl lg:text-5xl font-bold">MERCHANDISE</h2>
          <p class="text-gray-700 mt-4 font-normal text-sm lg:text-lg lg:w-5/12">
            Nikmati kualitas premium dari berbagai produk yang kami sediakan
          </p>
        </div>
      </div>

      <!-- Swiper Slider dengan Layout Baru -->
      <div class="category-slider-container relative mb-8">
        <!-- Tombol navigasi reposisi -->
        <button id="prevBtn" type="button" class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 font-bold">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="px-8">
          <swiper
            :modules="modules"
            :slides-per-view="slidesPerView"
            :space-between="20"
            :loop="true"
            :navigation="{
              nextEl: '#nextBtn',
              prevEl: '#prevBtn',
            }"
            class="w-full"
          >
            <swiper-slide v-for="(category, index) in categories" :key="index" class="swiper-slide-category">
              <CategoryItem2 :name="category.name" :image="category.image" :link="category.link" />
            </swiper-slide>
          </swiper>
        </div>
        
        <button id="nextBtn" type="button" class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="mt-10">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-2">PRODUK TERSEDIA</h3>
        <p class="text-gray-700 text-sm sm:text-base lg:text-lg mb-8">MACAM - MACAM PRODUK</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
          <ProducCard2 link="/view" image="/image/order.png" name="TUMBLR CUSTOM" price="Rp80.000" sold="10RB+ Terjual"/>
        </div>
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "@fortawesome/fontawesome-free/css/all.css";

import AuthFooter from "@/components/AuthFooter.vue";
import HeaderView from "@/components/HeaderView.vue";
import CategoryItem2 from "@/components/CategoryItem2.vue";
import ProducCard2 from "../components/ProducCard2.vue";

export default {
  components: { HeaderView, AuthFooter, Swiper, SwiperSlide, CategoryItem2, ProducCard2 },
  data() {
    return {
      categories: [
        { name: "AKRILIK", image: "/image/sold.png", link: "/category-view" },
        { name: "STIKER", image: "/image/sold.png", link: "/category-view" },
        { name: "T-SHIRT", image: "/image/sold.png", link: "/category-view" },
        { name: "KANVAS", image: "/image/sold.png", link: "/category-view" },
        { name: "DISPLAY", image: "/image/sold.png", link: "/category-view" },
        { name: "AKRILIK", image: "/image/sold.png", link: "/category-view" },
        { name: "STIKER", image: "/image/sold.png", link: "/category-view" },
        { name: "T-SHIRT", image: "/image/sold.png", link: "/category-view" },
        { name: "KANVAS", image: "/image/sold.png", link: "/category-view" },
        { name: "DISPLAY", image: "/image/sold.png", link: "/category-view" }
      ],
      slidesPerView: 5
    };
  },
  setup() {
    return {
      modules: [Navigation], 
    };
  },
  mounted() {
    this.updateSlidesPerView();
    window.addEventListener('resize', this.updateSlidesPerView);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSlidesPerView);
  },
  methods: {
    updateSlidesPerView() {
      if (window.innerWidth < 640) {
        this.slidesPerView = 2;
      } else if (window.innerWidth < 1024) {
        this.slidesPerView = 3;
      } else if (window.innerWidth < 1280) {
        this.slidesPerView = 4;
      } else {
        this.slidesPerView = 5;
      }
    }
  }
};
</script>

<style scoped>
.category-slider-container {
  padding: 0 10px;
  margin: 0 -10px;
}

.swiper-slide-category {
  height: auto;
  display: flex;
}

/* Pastikan seluruh swiper slide memiliki padding */
:deep(.swiper-slide) {
  padding: 0 5px;
  box-sizing: border-box;
}
</style>