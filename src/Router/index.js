import { createRouter, createWebHistory } from 'vue-router'
import Register from '@/Auth/Register.vue'
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
import CategoryItem1 from '@/components/CategoryItem1.vue'
import CategoryView from '@/Main/CategoryView.vue'
import DetailProduct from '@/Main/DetailProduct.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/verification', component: VerificationEmail },
  { path: '/login', component: Login },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/otp-password', component: OtpPage },
  { path: '/reset-password', component: ResetPassword },
  { path: '/dashboard-seller', component: DashboardSeller },
  { path: '/pesanan-seller', component: PesananSeller },
  { path: '/pengiriman-seller', component: PengirimanSeller },
  { path: '/manajemen-produk', component: ManajemenProduk },
  { path: '/etalase-seller', component: EtalaseSeller },
  { path: '/history-seller', component: HistorySeller },
  { path: '/laporan-seller', component: LaporanSeller },
  { path: '/ajukan-penarikan', component: AjukanPenarikan },
  { path: '/notifikasi', component: NotifikasiSeller },
  { path: '/profile', component: ProfileSeller },
  { path: '/view', component: SellerView },
  { path: '/category-view', component: CategoryView },
  { path: '/product-details', component: DetailProduct },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
