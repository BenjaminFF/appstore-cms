// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import VueAxios from 'vue-axios'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

axios.interceptors.response.use(
  response => {
    if(response.data.Result==301){
      localStorage.removeItem('userInfo');
      Vue.prototype.$message.error('登陆信息过期或失效，请重新登陆！');
      router.push('/');
    }
    return response;
  },
  err => {
    return Promise.reject(err);
  }
);

Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.use(element)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
