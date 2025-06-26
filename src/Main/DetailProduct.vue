<template>
  <div class="flex flex-col min-h-screen">
    <HeaderView />
    <div class="container mx-auto p-4 sm:p-8 flex-1" v-if="isLoaded">
      <main class="container mx-auto p-8">
        <div class="lg:flex lg:justify-evenly">
          <!-- Product Image & Description -->
          <ProductImages :product="product" :product-images="productImages" />
          <!-- Product Details -->
          <ProductDetails
            :product="product"
            :size-options="sizeOptions"
            :finishing-options="finishingOptions"
            :total-price="totalPrice"
            :is-adding-to-cart="isAddingToCart"
            v-model:note="note"
            v-model:selected-size="selectedSize"
            v-model:selected-finishing="selectedFinishing"
            v-model:quantity="quantity"
            @update-total-price="updateTotalPrice"
            @select-size="selectSize"
            @increase-quantity="increaseQuantity"
            @decrease-quantity="decreaseQuantity"
            @place-order="placeOrder"
            @add-to-cart="addToCart"
            @open-chat="openChat"
            @toggle-bookmark="toggleBookmark"
          />
        </div>
        <!-- Reviews Section -->
        <section class="mt-8 lg:mx-20">
          <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-10">Ulasan</h3>
          <div class="mt-4">
            <ReviewWithoutReply
              v-for="review in reviews.withoutReply"
              :key="review.id"
              :review="review"
              @reply="openReplyModal"
            />
            <ReviewWithReply
              v-for="review in reviews.withReply"
              :key="review.id"
              :review="review"
              @edit-reply="openEditReplyModal"
              @delete-reply="openDeleteReplyModal"
            />
          </div>
        </section>
      </main>
    </div>
    <div v-else class="flex flex-col min-h-screen justify-center items-center">
      <p>Loading...</p>
    </div>
    <AuthFooter />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation } from 'swiper/modules'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import AuthFooter from '@/components/AuthFooter.vue'
import HeaderView from '@/components/HeaderView.vue'
import ProductDetails from '@/components/details-product/ProductDetails.vue'
import ReviewWithReply from '@/components/ReviewWithReply.vue'
import ReviewWithoutReply from '@/components/ReviewWithoutReply.vue'
import ProductImages from '../components/details-product/ProductImages.vue'

export default {
  components: {
    HeaderView,
    AuthFooter,
    Swiper,
    SwiperSlide,
    ProductDetails,
    ProductImages,
    ReviewWithReply,
    ReviewWithoutReply,
  },
  setup() {
    const route = useRoute()
    const isLoaded = ref(false)
    const isAddingToCart = ref(false)
    const product = reactive({
      id: '',
      name: '',
      soldCount: '0',
      description: '',
      price: 0,
    })
    const productImages = ref([])
    const note = ref('')
    const selectedSize = ref('')
    const selectedFinishing = ref('0')
    const quantity = ref(1)
    const sizeOptions = ref([])
    const finishingOptions = ref([{ value: '0', label: 'Tanpa Finishing' }])
    const reviews = reactive({
      withoutReply: [
        {
          id: 1,
          user: 'Denada Ananda',
          time: '15.49',
          date: '23 Desember 2023',
          rating: 5,
          content:
            'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
          profilePic: 'https://placehold.co/50x50',
        },
      ],
      withReply: [
        {
          id: 2,
          user: 'Denada Ananda',
          time: '15.49',
          date: '23 Desember 2023',
          rating: 5,
          content:
            'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
          profilePic: 'https://placehold.co/50x50',
          reply: {
            time: '10.55',
            content:
              'Halo Denada Ananda! Terima kasih atas ulasan baiknya, semoga barang awet. Kami menantikan pembelian Anda selanjutnya!',
          },
        },
      ],
    })

    const fetchProduct = async (productId) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/products/${productId}`,
        )
        const data = response.data.data.product

        product.id = data.id || productId
        product.name = data.name || ''
        product.soldCount = data.unit || '0'
        product.description = data.description || ''
        product.price = data.variants.find((v) => v.is_default)?.price || data.price || 0

        productImages.value = data.images
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({
            src: img.image_url || 'https://placehold.co/400x400',
            alt: img.alt_text || 'Product image',
          }))

        sizeOptions.value = data.variants.map((variant, index) => ({
          value: variant.id.toString(),
          label: variant.name
            ? `${variant.name} (${formatCurrency(variant.price)})`
            : `Variant ${index + 1} (${formatCurrency(variant.price)})`,
          price: variant.price,
        }))
        if (data.variants.length > 0) {
          selectedSize.value =
            data.variants.find((v) => v.is_default)?.id.toString() || data.variants[0].id.toString()
        }

        finishingOptions.value = [
          { value: '0', label: 'Tanpa Finishing' },
          ...data.finishings.map((finishing) => ({
            value: finishing.id.toString(),
            label: `${finishing.name} (+${formatCurrency(finishing.price)})`,
            price: finishing.price,
          })),
        ]

        isLoaded.value = true
      } catch (error) {
        console.error('Error fetching product:', error)
        Swal.fire({
          title: 'Error',
          text: 'Gagal memuat data produk. Silakan coba lagi nanti.',
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    onMounted(() => {
      const productId = route.params.id
      if (productId) {
        fetchProduct(productId)
      } else {
        Swal.fire({
          title: 'Error',
          text: 'ID produk tidak ditemukan.',
          icon: 'error',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    })

    const totalPrice = computed(() => {
      const selectedVariant = sizeOptions.value.find(
        (option) => option.value === selectedSize.value,
      )
      const variantPrice = selectedVariant ? selectedVariant.price : product.price
      const selectedFinishingOption = finishingOptions.value.find(
        (option) => option.value === selectedFinishing.value,
      )
      const additionalPrice = selectedFinishingOption?.price || 0
      return (variantPrice + additionalPrice) * quantity.value
    })

    const formatCurrency = (value) => {
      return `Rp${value.toLocaleString('id-ID')}`
    }

    const selectSize = (size) => {
      selectedSize.value = size
      updateTotalPrice()
    }

    const updateTotalPrice = () => {
      // Total price is computed automatically
    }

    const increaseQuantity = () => {
      quantity.value++
      updateTotalPrice()
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
        updateTotalPrice()
      }
    }

    // Placeholder handlers for ProductDetails events
    const placeOrder = () => {
      // Seller doesn't place orders, so this is a no-op
    }

    const addToCart = () => {
      // Seller doesn't add to cart, so this is a no-op
    }

    const openChat = () => {
      // Seller doesn't open chat with themselves, so this is a no-op
    }

    const toggleBookmark = () => {
      // Seller doesn't bookmark their own product, so this is a no-op
    }

    // Review modal functions remain unchanged
    const openReplyModal = (reviewId) => {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Tanggapi Ulasan</h3>`,
        html: `
          <form id="replyForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="replyContent">
                Isi Tanggapan
              </label>
              <textarea
                id="replyContent"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg h-32"
                placeholder="Tuliskan tanggapan Anda untuk ulasan ini">
              </textarea>
            </div>
          </form>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Kirim Tanggapan',
        width: 600,
        preConfirm: () => {
          const replyContent = document.getElementById('replyContent').value
          if (!replyContent.trim()) {
            Swal.showValidationMessage('Silakan masukkan tanggapan')
            return false
          }
          return {
            content: replyContent,
            reviewId: reviewId,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmitReply(result.value)
        }
      })
    }

    const handleSubmitReply = (data) => {
      const reviewIndex = reviews.withoutReply.findIndex((r) => r.id === data.reviewId)
      if (reviewIndex !== -1) {
        const review = { ...reviews.withoutReply[reviewIndex] }
        review.reply = {
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          content: data.content,
        }
        reviews.withoutReply.splice(reviewIndex, 1)
        reviews.withReply.push(review)
        Swal.fire({
          title: 'Berhasil!',
          text: 'Tanggapan telah dikirim',
          icon: 'success',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    const openEditReplyModal = (reviewId) => {
      const review = reviews.withReply.find((r) => r.id === reviewId)
      if (!review) return
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Edit Tanggapan</h3>`,
        html: `
          <form id="editReplyForm" class="text-left">
            <div class="mb-3">
              <label class="block text-gray-700 font-medium text-sm mb-1" for="editReplyContent">
                Isi Tanggapan
              </label>
              <textarea
                id="editReplyContent"
                class="w-full text-sm p-2 border border-gray-300 rounded-lg h-32"
                placeholder="Tuliskan tanggapan Anda untuk ulasan ini"
              >${review.reply.content}</textarea>
            </div>
          </form>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Simpan',
        width: 600,
        preConfirm: () => {
          const replyContent = document.getElementById('editReplyContent').value
          if (!replyContent.trim()) {
            Swal.showValidationMessage('Silakan masukkan tanggapan')
            return false
          }
          return {
            content: replyContent,
            reviewId: reviewId,
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          handleUpdateReply(result.value)
        }
      })
    }

    const handleUpdateReply = (data) => {
      const reviewIndex = reviews.withReply.findIndex((r) => r.id === data.reviewId)
      if (reviewIndex !== -1) {
        reviews.withReply[reviewIndex].reply.content = data.content
        Swal.fire({
          title: 'Berhasil!',
          text: 'Tanggapan telah diperbarui',
          icon: 'success',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    const openDeleteReplyModal = (reviewId) => {
      Swal.fire({
        title: `<h3 class="text-lg font-bold">Hapus Tanggapan</h3>`,
        html: `
          <p class="text-center mb-3">
            Apakah Anda yakin ingin menghapus tanggapan ini?
          </p>
          <p class="text-center text-gray-500 text-sm">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        `,
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'bg-red-600 text-white px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          cancelButton:
            'bg-gray-300 text-gray-700 px-4 py-2 w-40 rounded-lg text-sm sm:text-base mt-6 sm:mt-8',
          actions: 'flex justify-center space-x-6',
        },
        cancelButtonText: 'Batal',
        confirmButtonText: 'Hapus',
        width: 400,
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteReply(reviewId)
        }
      })
    }

    const handleDeleteReply = (reviewId) => {
      const reviewIndex = reviews.withReply.findIndex((r) => r.id === reviewId)
      if (reviewIndex !== -1) {
        const review = { ...reviews.withReply[reviewIndex] }
        delete review.reply
        reviews.withReply.splice(reviewIndex, 1)
        reviews.withoutReply.push(review)
        Swal.fire({
          title: 'Berhasil!',
          text: 'Tanggapan telah dihapus',
          icon: 'success',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base',
          },
          confirmButtonText: 'Tutup',
        })
      }
    }

    return {
      Navigation,
      Pagination,
      isLoaded,
      isAddingToCart,
      product,
      productImages,
      note,
      selectedSize,
      selectedFinishing,
      quantity,
      sizeOptions,
      finishingOptions,
      totalPrice,
      reviews,
      formatCurrency,
      selectSize,
      updateTotalPrice,
      increaseQuantity,
      decreaseQuantity,
      placeOrder,
      addToCart,
      openChat,
      toggleBookmark,
      openReplyModal,
      openEditReplyModal,
      openDeleteReplyModal,
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
