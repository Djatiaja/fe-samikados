<template>
  <div class="flex flex-col min-h-screen">
    <HeaderView />

    <div class="container mx-auto p-4 sm:p-8 flex-1">
      <div v-if="loading" class="text-center py-8">Memuat...</div>
      <div v-else-if="!currentCategory.id" class="text-center py-8 text-gray-600">
        Silakan pilih kategori terlebih dahulu
      </div>
      <div v-else class="lg:flex lg:justify-between items-center mb-8">
        <img
          :src="currentCategory.banner_url"
          :alt="currentCategory.name"
          class="w-full lg:w-1/2 h-[400px] object-cover"
        />
        <div
          class="w-full lg:w-1/2 lg:pl-8 mt-4 lg:mt-0 flex flex-col justify-center items-center text-center"
        >
          <h2 class="text-xl lg:text-5xl font-bold">{{ currentCategory.name }}</h2>
          <p class="text-gray-700 mt-4 font-normal text-sm lg:text-lg lg:w-5/12">
            {{ currentCategory.description }}
          </p>
        </div>
      </div>

      <!-- Swiper Slider dengan Layout Baru -->
      <div v-if="!loading && currentCategory.id" class="category-slider-container relative mb-8">
        <button
          id="prevBtn"
          type="button"
          class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 font-bold"
        >
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
            <swiper-slide
              v-for="category in otherCategories"
              :key="category.id"
              class="swiper-slide-category"
            >
              <CategoryItem2
                :name="category.name"
                :image="category.image"
                @click="selectCategory(category.id)"
              />
            </swiper-slide>
          </swiper>
        </div>

        <button
          id="nextBtn"
          type="button"
          class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div v-if="!loading && currentCategory.id" class="mt-10">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-2">PRODUK TERSEDIA</h3>
        <p class="text-gray-700 text-sm sm:text-base mb-8 mt-2">MACAM - MACAM PRODUK</p>
        <div
          v-if="products.length"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          <ProductCard2
            v-for="product in products"
            :key="product.id"
            :link="product.link"
            :image="product.image"
            :name="product.name"
            :price="product.price"
            :sold="product.sold"
          />
        </div>
        <p v-else class="text-center text-gray-600">Tidak ada produk untuk kategori ini</p>
      </div>
    </div>

    <AuthFooter />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import '@fortawesome/fontawesome-free/css/all.css'
import axios from 'axios'
import Swal from 'sweetalert2'

import AuthFooter from '@/components/AuthFooter.vue'
import HeaderView from '@/components/HeaderView.vue'
import CategoryItem2 from '@/components/CategoryItem2.vue'
import ProductCard2 from '@/components/ProductCard2.vue'

export default {
  components: { HeaderView, AuthFooter, Swiper, SwiperSlide, CategoryItem2, ProductCard2 },
  setup() {
    const base_url = import.meta.env.VITE_API_BASE_URL
    const router = useRouter()
    const categories = ref([])
    const products = ref([])
    const loading = ref(true)
    const slidesPerView = ref(5)
    const currentCategory = ref({
      id: null,
      name: '',
      description: '',
      banner_url: '',
    })

    const otherCategories = computed(() =>
      categories.value.filter((cat) => cat.id !== Number(currentCategory.value.id)),
    )

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${base_url}/categories`)
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          categories.value = response.data.data.map((category) => ({
            id: category.id,
            name: category.name,
            image: category.icon_url.replace(/\\\//g, '/'),
            banner_url: category.banner_url.replace(/\\\//g, '/'),
            description: category.description,
          }))

          const selectedCategoryId = sessionStorage.getItem('selectedCategoryId')
          if (selectedCategoryId) {
            const foundCategory = categories.value.find(
              (cat) => cat.id === Number(selectedCategoryId),
            )
            if (foundCategory) {
              currentCategory.value = foundCategory
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Kategori tidak ditemukan',
              })
              sessionStorage.removeItem('selectedCategoryId')
            }
          }
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
      if (!currentCategory.value.id) {
        loading.value = false
        return
      }
      try {
        const response = await axios.get(`${base_url}/products`, {
          params: {
            category_id: currentCategory.value.id,
            search: '',
            limit: 10,
            page: 1,
          },
        })
        if (response.data.status === 'success' && Array.isArray(response.data.data.products)) {
          products.value = response.data.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: `Rp${product.price.toLocaleString('id-ID')}`,
            image: product.thumbnail_url.replace(/\\\//g, '/'),
            link: `/product-details/${product.id}`,
            sold: '0 Terjual',
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
      } finally {
        loading.value = false
      }
    }

    const selectCategory = (categoryId) => {
      sessionStorage.setItem('selectedCategoryId', categoryId)
      currentCategory.value = categories.value.find((cat) => cat.id === Number(categoryId)) || {
        id: null,
        name: '',
        description: '',
        banner_url: '',
      }
      fetchProducts()
    }

    const updateSlidesPerView = () => {
      if (window.innerWidth < 640) {
        slidesPerView.value = 2
      } else if (window.innerWidth < 1024) {
        slidesPerView.value = 3
      } else if (window.innerWidth < 1280) {
        slidesPerView.value = 4
      } else {
        slidesPerView.value = 5
      }
    }

    onMounted(() => {
      fetchCategories().then(() => fetchProducts())
      updateSlidesPerView()
      window.addEventListener('resize', updateSlidesPerView)
    })

    return {
      categories,
      otherCategories,
      products,
      currentCategory,
      loading,
      slidesPerView,
      modules: [Navigation],
      selectCategory,
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSlidesPerView)
  },
}
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

:deep(.swiper-slide) {
  padding: 0 5px;
  box-sizing: border-box;
}
</style>
