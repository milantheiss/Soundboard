import { createApp } from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";

import '@/assets/tailwind.css'

import { setupStores } from "@/util/setupStores.js"


const app = createApp(App).use(createPinia())

//Wird zwischen geschoben, da States beim Erstellen der App genutzt werden
setupStores()

app.mount("#app");