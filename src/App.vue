<template>
  <el-row id="app">
    <el-col :span="4" class="app-sidebar">
      <div class="app-sidebar__header">
        <img src="./assets/headicon.svg">
        <div style="margin-top: 1rem">{{username}}</div>
      </div>
      <el-menu
        :router="true"
        :default-active="defaultActive"
        background-color="#1F62B0"
        text-color="#fff" ref="myELmenu">
        <el-menu-item class="m-el-submenu-item" index="/app-manage">应用管理</el-menu-item>
        <el-menu-item index="/category-manage" class="m-el-submenu-item">类别管理</el-menu-item>
        <el-menu-item index="/recommend-manage" class="m-el-submenu-item">推荐管理</el-menu-item>
        <el-menu-item index="/setting" class="m-el-submenu-item">设置</el-menu-item>
      </el-menu>
    </el-col>
    <el-col :span="20" class="main">
      <div class="main-header">
        <el-dropdown style="margin-right: 2rem;font-size: 1.2rem" trigger="click" @command="handlePoolChange">
          <span style="cursor: pointer">
            当前平台: {{appPool!=null?' '+appPool.AppPoolName:' '}}
            <i class="el-icon-arrow-down" style="font-size: 1.2rem"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in appPools" :command="item.AppPoolName">{{item.AppPoolName}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <i class="cms sky-setting" style="font-size: 2rem;margin-right: 1rem;color: #585858;cursor: pointer"
           @click="linkTo('/setting')"></i>
        <i class="cms sky-poweroff"
           style="font-size: 2rem;padding-left:1rem;margin-right: 1rem;color: #636363;border-left: 1px solid gray;cursor: pointer"
           @click="logout()"></i>
      </div>
      <router-view v-if="isRouteAlive"></router-view>
    </el-col>
  </el-row>
</template>

<script>

  export default {
    name: 'App',
    data() {
      return {
        defaultActive: '',
        isSuperAccess: false,
        username: "",
        appPools:[],
        appPool:{},
        isRouteAlive:true
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      reloadRoute(){
        this.isRouteAlive=false;
        this.$nextTick(()=>{
          this.isRouteAlive=true;
        });
      },
      init() {
        this.defaultActive = this.$route.path == '/' ? '/alluser-manage' : this.$route.path;
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (this.userInfo != null) {
          this.username = this.userInfo.Name;
        }
        this.appPool=JSON.parse(localStorage.getItem('appPool'));
      },
      fetchData(){
        if (this.userInfo != null) {
          this.axios.post('/user/GetAppPoolList').then((res)=>{
            this.appPools=res.data.Items;
          });
        }
      },
      handlePoolChange(poolName){
        let curPool={};
        this.appPools.forEach((appPool)=>{
          if(poolName==appPool.AppPoolName){
            curPool=appPool;
          }
        });
        this.appPool=curPool;
        localStorage.setItem('appPool',JSON.stringify(curPool));
        this.reloadRoute();
      },
      linkTo(path) {
        this.$router.push(path);
        this.defaultActive = path;
      },
      logout() {
        localStorage.removeItem('userInfo');
        this.$router.push('/');
        /*this.axios.get('/ssnwtweb/api/admins/logout').then((res)=>{

        });*/
      },
      flushELMenu(to, from) {
        this.$refs.myELmenu.activeIndex = this.$route.path;
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (from.path == '/login') {
          if (this.userInfo != null) {
            this.username = this.userInfo.Name;
            this.axios.post('/user/GetAppPoolList').then((res)=>{
              this.appPools=res.data.Items;
              this.appPool=JSON.parse(localStorage.getItem('appPool'));
            });
          }
        }
      },
    },
    watch: {
      '$route': 'flushELMenu'
    }
  }
</script>


<style>
  @import "assets/iconfont/iconfont.css";
  @import "assets/lib/index.css";
  @import "../sk-theme/lib/index.css";
  @import "../node_modules/animate.css/animate.css";

  body, html {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body, html, div {
    margin: 0;
    padding: 0;
  }

  #app {
    width: 100%;
    height: 100%;
  }

  .main {
    height: 100%;
    background-color: rgba(179, 212, 252, 0.11);
    position: relative;
  }

  .main-header {
    width: 100%;
    height: 6rem;
    background-color: white;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.08);
    z-index: 10;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .m-el-submenu-item {
    background-color: transparent !important;
  }

  .el-menu {
    border-right: none !important;
    user-select: none;
  }

  .el-menu-item, .el-submenu__title {
    font-size: 1rem;
    background-color: transparent;
  }

  .el-menu-item.is-active {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }

  .el-menu-item:hover {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }

  .el-submenu__title:hover {
    background-color: rgba(179, 212, 252, 0.11) !important;
  }

  .pool-select-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #3a8ee6;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

</style>
