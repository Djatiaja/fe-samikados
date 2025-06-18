import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './Router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

library.add(faLocationDot)

const app = createApp(App)
app.use(router)
app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon)
