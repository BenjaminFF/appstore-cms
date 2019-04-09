import Vue from 'vue'
import Router from 'vue-router'
import loginPage from '@/components/login-page'
import allUserPage from '@/components/alluser-manage'
import adminPage from '@/components/admin-manage'
import categoryPage from '@/components/category-manage'
import settingPage from '@/components/setting-page'
import recommendManage from '@/components/recommend-manage'
import appRelease from '@/components/app-release'
import appManage from '@/components/app-manage'
import videoPublish from '@/components/video-manage/video-publish'
import videoCenter from '@/components/video-manage/video-center'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: allUserPage
    },
    {
      path: '/alluser-manage',
      name: 'allUserPage',
      component: allUserPage
    },
    {
      path: '/category-manage',
      name: 'categoryPage',
      component: categoryPage
    },
    {
      path: '/admin-manage',
      name: 'adminPage',
      component: adminPage
    },
    {
      path: '/setting',
      name: 'settingPage',
      component: settingPage
    },
    {
      path: '/app-release',
      name: 'app-release',
      component: appRelease
    },
    {
      path: '/login',
      name: 'loginPage',
      component: loginPage
    },
    {
      path:'/recommend-manage',
      name: 'recommend-manage',
      component: recommendManage
    },
    {
      path:'/app-manage',
      name:'app-manage',
      component: appManage
    },
    {
      path:'/video-center',
      name:'video-center',
      component: videoCenter
    },
    {
      path:'/video-publish',
      name:'video-publish',
      component: videoPublish
    }
  ]
})

router.beforeEach((to, from, next) => {
  let userInfo=localStorage.getItem('userInfo');
  if(userInfo!=null){
    if(Date.now()-JSON.parse(userInfo).loginTime<=3600*1000){
      next({path:to.path=='/login'?'/alluser-manage':null});
    }else {
      localStorage.removeItem('userInfo');
      next({path:to.path=='/login'?null:'/login'});
    }
  }else {
    next({path:to.path=='/login'?null:'/login'});
  }
});

export default router;
