import { createRouter, createWebHistory } from 'vue-router'

import VerificationEmail from '@/Auth/VerificationEmail.vue'
import Login from '@/Auth/Login.vue'
import ForgotPassword from '@/Auth/ForgotPassword.vue'
import OtpPage from '@/Auth/OtpPage.vue'
import ResetPassword from '@/Auth/ResetPassword.vue'
import DashboardSeller from '@/Main/DashboardSeller.vue'
import PesananSeller from '@/Main/PesananSeller.vue'
import PengirimanSeller from '@/Main/PengirimanSeller.vue'
import ManajemenProduk from '@/Main/ManajemenProduk.vue'
import EtalaseSeller from '@/Main/EtalaseSeller.vue'
import HistorySeller from '@/Main/HistorySeller.vue'
import LaporanSeller from '@/Main/LaporanSeller.vue'
import AjukanPenarikan from '@/Main/AjukanPenarikan.vue'
import NotifikasiSeller from '@/Main/NotifikasiSeller.vue'
import ProfileSeller from '@/Main/ProfileSeller.vue'
import SellerView from '@/Main/SellerView.vue'
import CategoryView from '@/Main/CategoryView.vue'
import DetailProduct from '@/Main/DetailProduct.vue'
import Register from '@/Auth/Register.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/verification', component: VerificationEmail },
  { path: '/login', component: Login },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/otp-password', component: OtpPage },
  { path: '/reset-password', component: ResetPassword },

  // Halaman yang butuh login
  { path: '/dashboard-seller', component: DashboardSeller, meta: { requiresAuth: true } },
  { path: '/pesanan-seller', component: PesananSeller, meta: { requiresAuth: true } },
  { path: '/pengiriman-seller', component: PengirimanSeller, meta: { requiresAuth: true } },
  { path: '/manajemen-produk', component: ManajemenProduk, meta: { requiresAuth: true } },
  { path: '/etalase-seller', component: EtalaseSeller, meta: { requiresAuth: true } },
  { path: '/history-seller', component: HistorySeller, meta: { requiresAuth: true } },
  { path: '/laporan-seller', component: LaporanSeller, meta: { requiresAuth: true } },
  { path: '/ajukan-penarikan', component: AjukanPenarikan, meta: { requiresAuth: true } },
  { path: '/notifikasi', component: NotifikasiSeller, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileSeller, meta: { requiresAuth: true } },
  { path: '/view', component: SellerView, meta: { requiresAuth: true } },
  { path: '/category-view', component: CategoryView, meta: { requiresAuth: true } },
  { path: '/product-details/:id', component: DetailProduct, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware: Cek apakah user sudah login sebelum akses halaman tertentu
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null // Cek token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login') // Redirect ke login jika belum login
  } else {
    next() // Lanjut ke halaman tujuan
  }
})

export default router
