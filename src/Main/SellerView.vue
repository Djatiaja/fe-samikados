<template>
  <div class="flex flex-col min-h-screen">
    <HeaderView />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <!-- Full-width Banner with Swiper Carousel -->
      <div
        class="relative my-8"
        style="margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); width: 100vw"
      >
        <div v-if="loading" class="text-center py-8">Memuat banner...</div>
        <div v-else-if="!banners.length" class="text-center py-8 text-gray-600">
          Tidak ada banner tersedia
        </div>
        <Swiper
          v-else
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
          <SwiperSlide v-for="(banner, index) in banners" :key="index">
            <img
              :src="banner.image"
              :alt="banner.alt"
              class="w-full h-[400px] object-cover mx-auto"
              style="max-width: 1200px"
            />
          </SwiperSlide>
        </Swiper>

        <div class="swiper-pagination"></div>
      </div>

      <!-- Pilih Kategori -->
      <div class="container mx-auto mt-8">
        <h2 class="text-md sm:text-lg md:text-xl font-bold">PILIH KATEGORI ANDA</h2>
        <div v-if="!categories.length" class="text-center py-8 text-gray-600">
          Tidak ada kategori tersedia
        </div>
        <div v-else class="text-center mt-4 mb-6 border border-gray-300 shadow-lg p-6 rounded-lg">
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-60 overflow-y-auto"
          >
            <CategoryItem1
              v-for="category in categories"
              :key="category.id"
              :name="category.name"
              :image="category.image"
              @click="selectCategory(category.id)"
            />
          </div>
        </div>
      </div>

      <!-- Produk -->
      <div class="container mx-auto">
        <div v-if="!products.length" class="text-center py-8 text-gray-600">
          Tidak ada produk tersedia
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard1
            v-for="product in products"
            :key="product.id"
            :id="product.id"
            :name="product.name"
            :price="product.price.replace('Rp', '')"
            :link="product.link"
            :image="product.image"
          />
        </div>
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

import AuthFooter from '@/components/AuthFooter.vue'
import HeaderView from '@/components/HeaderView.vue'
import CategoryItem1 from '@/components/CategoryItem1.vue'
import ProductCard1 from '../components/ProductCard1.vue'

export default {
  components: { HeaderView, AuthFooter, Swiper, SwiperSlide, CategoryItem1, ProductCard1 },
  setup() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const router = useRouter()
    const banners = ref([])
    const loading = ref(true)
    const categories = ref([])
    const products = ref([])

    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${baseUrl}/banners`)
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          banners.value = response.data.data.slice(0, 5).map((banner, index) => ({
            image: banner.picture_url.replace(/\\\//g, '/'),
            alt: banner.name || `Banner ${index + 1}`,
          }))
        } else {
          throw new Error(response.data.message || 'Gagal memuat banner')
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat banner',
        })
        banners.value = []
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/categories`)
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          categories.value = response.data.data.map((category) => ({
            id: category.id,
            name: category.name,
            image: category.icon_url.replace(/\\\//g, '/'),
          }))
        } else {
          throw new Error(response.data.message || 'Gagal memuat kategori')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat kategori',
        })
        categories.value = []
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/products`, {
          params: { limit: 10, page: 1, search: '' },
        })
        if (response.data.status === 'success' && Array.isArray(response.data.data.products)) {
          products.value = response.data.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: `Rp${product.price.toLocaleString('id-ID')}`,
            image: product.thumbnail_url.replace(/\\\//g, '/'),
            link: `/product-details/${product.id}`,
          }))
        } else {
          throw new Error(response.data.message || 'Gagal memuat produk')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal memuat produk',
        })
        products.value = []
      }
    }

    const selectCategory = (categoryId) => {
      sessionStorage.setItem('selectedCategoryId', categoryId)
      router.push('/category-view')
    }

    onMounted(() => {
      console.log('Base URL:', baseUrl)
      Promise.all([fetchBanners(), fetchCategories(), fetchProducts()])
    })

    return {
      banners,
      categories,
      products,
      loading,
      Pagination,
      Navigation,
      selectCategory,
    }
  },
}
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
