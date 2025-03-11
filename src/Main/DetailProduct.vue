<template>
    <div class="flex flex-col min-h-screen">
      <HeaderView />
      
      <div class="container mx-auto p-4 sm:p-8 flex-1">
        <main class="container mx-auto p-8">
          <div class="lg:flex lg:justify-evenly">
            <!-- Product Image & Description -->
            <div class="lg:w-1/3 h-1/3">
              <!-- Slider Container -->
              <div class="relative">
                <div class="overflow-hidden rounded-lg shadow-lg">
                  <swiper
                    :modules="[Navigation, Pagination]"
                    :navigation="true"
                    :pagination="{ clickable: true }"
                    class="mySwiper"
                  >
                    <swiper-slide v-for="(image, index) in productImages" :key="index">
                      <img :src="image.src" :alt="image.alt" class="w-full">
                    </swiper-slide>
                  </swiper>
                </div>
              </div>
  
              <h2 class="text-3xl font-bold mt-4">{{ product.name }}</h2>
              <p class="text-gray-500">{{ product.soldCount }}+ Terjual</p>
              <p class="mt-4 text-gray-700">{{ product.description }}</p>
            </div>
  
            <!-- Product Details -->
            <div class="lg:w-1/2 lg:pl-12 mt-8 lg:mt-0">
              <!-- Harga -->
              <div class="pb-4 mb-4">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Harga</h3>
                <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-center">{{ formatCurrency(product.price) }}</p>
              </div>
  
              <!-- Catatan -->
              <div class="pb-4 mb-4">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Catatan</h3>
                <textarea 
                  v-model="note"
                  class="w-full sm:w-3/4 h-24 sm:h-28 border p-2 rounded-lg mt-2 text-sm sm:text-base lg:text-lg" 
                  placeholder="Masukkan catatan untuk produk Anda"
                ></textarea>
                <p class="text-gray-500 mt-1 text-xs sm:text-sm lg:text-base">Contoh: packing pakai selongsong</p>
              </div>
  
              <!-- Ukuran -->
              <div class="pb-4 mb-4">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Ukuran</h3>
                <p class="text-gray-500 mb-2 text-xs sm:text-sm lg:text-base">Masukkan ukuran untuk produk Anda</p>
                <div class="flex items-center">
                  <input 
                    v-model="size.length"
                    type="text" 
                    class="border p-2 w-1/2 sm:w-1/3 lg:w-2/12 mr-2 rounded-lg text-sm sm:text-base lg:text-lg" 
                    placeholder="Panjang"
                  >
                  <span class="mx-2 text-sm sm:text-base lg:text-lg">X</span>
                  <input 
                    v-model="size.width"
                    type="text" 
                    class="border p-2 w-1/2 sm:w-1/3 lg:w-2/12 rounded-lg text-sm sm:text-base lg:text-lg" 
                    placeholder="Lebar"
                  >
                  <span class="ml-2 text-sm sm:text-base lg:text-lg">cm</span>
                </div>
              </div>
  
              <!-- Finishing -->
              <div class="pb-4 mb-4">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Finishing</h3>
                <select 
                  v-model="selectedFinishing"
                  class="w-full sm:w-3/4 border p-2 mb-2 rounded-lg text-sm sm:text-base lg:text-lg"
                  @change="updateAdditionalPrice"
                >
                  <option value="">Tidak Ada yang Dipilih</option>
                  <option 
                    v-for="option in finishingOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <p class="text-sm sm:text-base lg:text-lg mt-2">Harga Tambahan: {{ formatCurrency(additionalPrice) }}</p>
              </div>
  
              <!-- Jumlah -->
              <div class="pb-4 mb-4">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold">Jumlah</h3>
                <div class="flex items-center mt-2">
                  <button 
                    @click="decreaseQuantity"
                    class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg"
                  >-</button>
                  <span class="px-4 text-sm sm:text-base lg:text-lg">{{ quantity }}</span>
                  <button 
                    @click="increaseQuantity"
                    class="bg-white px-4 py-2 rounded-lg text-sm sm:text-base lg:text-lg"
                  >+</button>
                </div>
              </div>
            </div>
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
                @delete-reply="deleteReply"
              />
            </div>
          </section>
        </main>
      </div>
      
      <AuthFooter />
      
      <!-- Tanggapan Modal -->
      <div v-if="modals.reply.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div class="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/3">
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-4">Tanggapan Seller</h3>
          <textarea 
            v-model="modals.reply.content"
            class="w-full p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg text-sm sm:text-base md:text-lg" 
            rows="4" 
            placeholder="Masukkan Tanggapan"
          ></textarea>
          <div class="flex justify-evenly mt-4">
            <button @click="closeReplyModal" class="bg-gray-300 py-2 px-4 rounded-lg w-1/3 text-sm sm:text-base md:text-lg">Batal</button>
            <button @click="submitReply" class="bg-red-600 text-white py-2 px-4 rounded-lg w-1/3 text-sm sm:text-base md:text-lg">Kirim Tanggapan</button>
          </div>
        </div>
      </div>
  
      <!-- Edit Tanggapan Modal -->
      <div v-if="modals.editReply.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div class="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/3">
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-4">Edit Tanggapan</h3>
          <textarea 
            v-model="modals.editReply.content"
            class="w-full p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg text-sm sm:text-base md:text-lg" 
            rows="4"
          ></textarea>
          <div class="flex justify-evenly mt-4">
            <button @click="closeEditReplyModal" class="bg-gray-300 py-2 px-4 rounded-lg w-1/3 text-sm sm:text-base md:text-lg">Batal</button>
            <button @click="saveEditReply" class="bg-red-600 text-white py-2 px-4 rounded-lg w-1/3 text-sm sm:text-base md:text-lg">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Pagination, Navigation } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/pagination';
  import 'swiper/css/navigation';
  
  import AuthFooter from "@/components/AuthFooter.vue";
  import HeaderView from "@/components/HeaderView.vue";
  import ReviewWithReply from '@/components/ReviewWithReply.vue';
  import ReviewWithoutReply from '@/components/ReviewWithoutReply.vue';
  
  export default {
    components: { 
      HeaderView, 
      AuthFooter, 
      Swiper, 
      SwiperSlide, 
      ReviewWithReply, 
      ReviewWithoutReply 
    },
    
    setup() {
      // Product data
      const product = reactive({
        name: 'PIN PENITI 58mm',
        soldCount: '10RB',
        description: 'Temukan solusi praktis untuk menyatukan kain dan aksesoris dengan Pin Peniti 58mm. Dirancang dengan ukuran ideal untuk penggunaan sehari-hari, pin ini terbuat dari bahan berkualitas tinggi yang memastikan daya tahan dan ketahanan terhadap korosi.',
        price: 4500
      });
      
      // Product images
      const productImages = ref([
        { src: 'https://placehold.co/600x600', alt: 'Gambar 1' },
        { src: 'https://placehold.co/600x600', alt: 'Gambar 2' },
        { src: 'https://placehold.co/600x600', alt: 'Gambar 3' }
      ]);
      
      // Form values
      const note = ref('');
      const size = reactive({
        length: '',
        width: ''
      });
      const selectedFinishing = ref('');
      const additionalPrice = ref(0);
      const quantity = ref(1);
      
      // Finishing options
      const finishingOptions = ref([
        { value: '0', label: 'Tanpa Finishing' },
        { value: '10000', label: 'Finishing + Paperbag (+ Rp10.000)' }
      ]);
      
      // Reviews data
      const reviews = reactive({
        withoutReply: [
          {
            id: 1,
            user: 'Denada Ananda',
            time: '15.49',
            date: '23 Desember 2023',
            rating: 5,
            content: 'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
            profilePic: 'https://placehold.co/50x50'
          }
        ],
        withReply: [
          {
            id: 2,
            user: 'Denada Ananda',
            time: '15.49',
            date: '23 Desember 2023',
            rating: 5,
            content: 'Bahan yang digunakan terasa kokoh dan tahan lama, sehingga saya tidak khawatir tentang kerusakan setelah penggunaan berulang. Ujung pin yang runcing memudahkan untuk menembus berbagai jenis kain, dan saya sangat menghargai kenyamanan saat menggunakannya.',
            profilePic: 'https://placehold.co/50x50',
            reply: {
              time: '10.55',
              content: 'Halo Denada Ananda! Terima kasih atas ulasan baiknya, semoga barang awet. Kami menantikan pembelian Anda selanjutnya!'
            }
          }
        ]
      });
      
      // Modals
      const modals = reactive({
        reply: {
          isOpen: false,
          reviewId: null,
          content: ''
        },
        editReply: {
          isOpen: false,
          reviewId: null,
          content: ''
        }
      });
      
      // Methods
      const formatCurrency = (value) => {
        return `Rp${value.toLocaleString('id-ID')}`;
      };
      
      const updateAdditionalPrice = () => {
        additionalPrice.value = parseInt(selectedFinishing.value) || 0;
      };
      
      const increaseQuantity = () => {
        quantity.value++;
      };
      
      const decreaseQuantity = () => {
        if (quantity.value > 1) {
          quantity.value--;
        }
      };
      
      // Reply modal methods
      const openReplyModal = (reviewId) => {
        modals.reply.reviewId = reviewId;
        modals.reply.content = '';
        modals.reply.isOpen = true;
      };
      
      const closeReplyModal = () => {
        modals.reply.isOpen = false;
      };
      
      const submitReply = () => {
        // Find the review in the withoutReply array
        const reviewIndex = reviews.withoutReply.findIndex(r => r.id === modals.reply.reviewId);
        if (reviewIndex !== -1) {
          const review = reviews.withoutReply[reviewIndex];
          
          // Add reply to the review
          review.reply = {
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            content: modals.reply.content
          };
          
          // Move from withoutReply to withReply
          reviews.withReply.push(review);
          reviews.withoutReply.splice(reviewIndex, 1);
        }
        
        closeReplyModal();
      };
      
      // Edit reply modal methods
      const openEditReplyModal = (reviewId) => {
        const review = reviews.withReply.find(r => r.id === reviewId);
        if (review && review.reply) {
          modals.editReply.reviewId = reviewId;
          modals.editReply.content = review.reply.content;
          modals.editReply.isOpen = true;
        }
      };
      
      const closeEditReplyModal = () => {
        modals.editReply.isOpen = false;
      };
      
      const saveEditReply = () => {
        const review = reviews.withReply.find(r => r.id === modals.editReply.reviewId);
        if (review && review.reply) {
          review.reply.content = modals.editReply.content;
        }
        closeEditReplyModal();
      };
      
      const deleteReply = (reviewId) => {
        const reviewIndex = reviews.withReply.findIndex(r => r.id === reviewId);
        if (reviewIndex !== -1) {
          const review = { ...reviews.withReply[reviewIndex] };
          
          // Remove the reply
          delete review.reply;
          
          // Move from withReply to withoutReply
          reviews.withoutReply.push(review);
          reviews.withReply.splice(reviewIndex, 1);
        }
      };
      
      return {
        // Navigation
        Navigation,
        Pagination,
        
        // Data
        product,
        productImages,
        note,
        size,
        selectedFinishing,
        additionalPrice,
        quantity,
        finishingOptions,
        reviews,
        modals,
        
        // Methods
        formatCurrency,
        updateAdditionalPrice,
        increaseQuantity,
        decreaseQuantity,
        openReplyModal,
        closeReplyModal,
        submitReply,
        openEditReplyModal,
        closeEditReplyModal,
        saveEditReply,
        deleteReply
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