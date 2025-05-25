<template>
  <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
    <!-- Header -->
    <AuthHeader title="SAMIKADOS" subtitle="REGISTER" />

    <!-- Main Content -->
    <main
      class="container mx-auto flex flex-col lg:justify-center lg:items-center flex-grow"
    >
      <!-- Verification Section -->
      <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
        <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">Verifikasi Email</h2>
        <p class="mb-4 text-sm text-gray-600">Silakan cek email Anda dan klik tautan verifikasi.</p>
        <p v-if="message" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'" class="mb-4 text-sm">
          {{ message }}
        </p>

        <!-- Resend Email Form -->
        <form @submit.prevent="resendVerificationEmail">
          <div v-if="!$route.query.id" class="mb-4">
            <label for="email" class="block text-sm text-gray-700 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Masukkan email Anda"
              required
            />
          </div>
          <button
            v-if="showRetryButton || !$route.query.id"
            class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg mb-4 transition duration-300 shadow-lg"
            type="submit"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Mengirim...' : 'Kirim Ulang Email' }}
          </button>
        </form>

        <!-- Info Section -->
        <p class="text-xs text-gray-500 text-center">
          Tidak menerima email? Kami bisa mengirim ulang.
        </p>

        <!-- Logout Option -->
        <div class="text-center mt-4">
          <span class="text-gray-700 text-sm">Sudah Verifikasi? </span>
          <router-link class="text-red-600 hover:underline text-sm" to="/login">Log in</router-link>
        </div>
      </section>
    </main>

    <AuthFooter />
  </div>
</template>

<script>
import AuthHeader from '@/components/AuthHeader.vue';
import AuthFooter from '@/components/AuthFooter.vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  components: {
    AuthHeader,
    AuthFooter,
  },
  data() {
    return {
      isLoading: false,
      message: '',
      messageType: '',
      email: '',
      showRetryButton: false,
    };
  },
  methods: {
    async verifyEmail() {
      this.isLoading = true;
      this.message = '';
      this.showRetryButton = false;
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      const hash = url.searchParams.get('hash');

      if (!id || !hash) {
        this.message = 'Parameter verifikasi tidak valid. Silakan masukkan email Anda untuk mengirim ulang verifikasi.';
        this.messageType = 'error';
        this.isLoading = false;
        this.showRetryButton = true;
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/customer/auth/verify-email`, {
          id,
          hash,
        });
        await Swal.fire({
          title: 'Verifikasi Berhasil',
          text: 'Email berhasil diverifikasi! Anda akan diarahkan ke halaman login.',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        this.$router.push('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage === 'Email already verified') {
          await Swal.fire({
            title: 'Email Sudah Diverifikasi',
            text: 'Email sudah diverifikasi! Anda akan diarahkan ke halaman login.',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          this.$router.push('/login');
        } else {
          this.message = errorMessage || 'Gagal memverifikasi email. Silakan coba lagi atau kirim ulang email verifikasi.';
          this.messageType = 'error';
          this.showRetryButton = true;
        }
        console.error('Error verifying email:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async resendVerificationEmail() {
      this.isLoading = true;
      this.message = '';
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      const payload = {};

      if (id) {
        payload.id = id;
      } else if (this.email) {
        payload.email = this.email;
      } else {
        this.message = 'ID atau email diperlukan untuk mengirim ulang verifikasi.';
        this.messageType = 'error';
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/customer/auth/resend-email`, payload);
        this.message = 'Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.';
        this.messageType = 'success';
        this.showRetryButton = false;
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage === 'Email already verified') {
          await Swal.fire({
            title: 'Email Sudah Diverifikasi',
            text: 'Email sudah diverifikasi! Anda akan diarahkan ke halaman login.',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          this.$router.push('/login');
        } else {
          this.message = errorMessage || 'Gagal mengirim ulang email verifikasi. Silakan coba lagi.';
          this.messageType = 'error';
          this.showRetryButton = true;
        }
        console.error('Error resending verification email:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    const url = new URL(window.location.href);
    if (url.searchParams.get('id') && url.searchParams.get('hash')) {
      this.verifyEmail();
    }
  },
};
</script>
