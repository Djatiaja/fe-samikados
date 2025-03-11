<template>
    <div class="bg-gray-100 flex flex-col min-h-screen font-roboto">
      <!-- Header -->
      <AuthHeader title="SAMIKADOS" subtitle="LOGIN" />
  
      <!-- Main Content -->
      <main class="container mx-auto flex flex-col lg:flex-row lg:justify-evenly lg:items-center lg:justify-center flex-grow">
        <!-- Image Section -->
        <section class="w-full lg:w-fit mb-8 lg:mb-0 hidden lg:flex">
          <figure>
            <img src="/image/Transparent.png" alt="Cart icon image" class="w-full max-w-md" />
          </figure>
        </section>
  
        <!-- OTP Form -->
        <section class="w-full lg:w-1/3 bg-white p-8 shadow-xl rounded-lg">
          <h2 class="text-xl lg:text-2xl font-bold mb-4 text-gray-800">MASUKKAN KODE OTP</h2>
          <p class="mb-4 text-sm text-gray-600">Kode OTP telah dikirim pada email Anda</p>
          
          <!-- OTP Input -->
          <div class="flex justify-center space-x-4 mb-4">
            <input v-for="(otp, index) in otpCode" :key="index" v-model="otpCode[index]" class="w-12 text-center p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600" type="text" maxlength="1" @input="moveFocus(index, $event)" @keyup.backspace="moveBack(index, $event)" />
          </div>
  
          <p class="text-xs text-gray-500 text-center mb-4">Mohon tunggu 35 detik untuk mengirim ulang.</p>
  
          <!-- Submit Button -->
          <AuthMainButton text="Berikutnya" @click="submitOtp" />
        </section>
      </main>
  
      <!-- Footer -->
      <AuthFooter />
    </div>
  </template>
  
  <script>
  import AuthHeader from '@/components/AuthHeader.vue';
  import AuthMainButton from '@/components/AuthMainButton.vue';
  import AuthFooter from '@/components/AuthFooter.vue';
  
  export default {
    components: {
      AuthHeader,
      AuthMainButton,
      AuthFooter,
    },
    data() {
      return {
        otpCode: ["", "", "", ""]
      };
    },
    methods: {
      moveFocus(index, event) {
        if (event.target.value && index < this.otpCode.length - 1) {
          this.$refs[`otp${index + 1}`][0].focus();
        }
      },
      moveBack(index, event) {
        if (!event.target.value && index > 0) {
          this.$refs[`otp${index - 1}`][0].focus();
        }
      },
      submitOtp() {
        if (this.otpCode.join('').length === 4) {
          this.$router.push('/reset-password');
        } else {
          alert("Masukkan kode OTP dengan benar!");
        }
      }
    }
  };
  </script>