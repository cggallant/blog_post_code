import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = true;
Vue.prototype.$myModule = null; // Will hold the module's instance

new Vue({
    render: h => h(App)
}).$mount('#app');
