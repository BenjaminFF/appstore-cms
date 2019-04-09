<template>
  <div class="container">
    <el-button @click="pushRouter('/app-release')">新增/发布 应用</el-button>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="4">名称</el-col>
        <el-col :span="8" style="text-align: center">版本</el-col>
        <el-col :span="8" style="text-align: center">更新时间</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="app in apps" class="l-mtag-table__tr">
            <el-col :span="4" style="display: flex;align-items: center">
              <img :src="app.IconUrl" width="30px" style="margin-right: 1rem">
              {{app.AppName}}
            </el-col>
            <el-col :span="8" style="text-align: center">{{app.Version}}</el-col>
            <el-col :span="8" style="text-align: center">{{dateFormat(app.UpdateTime*1000)}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text">查看</el-button>
              <el-button type="text" @click="pushRouter('/app-release')">更新</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        addDialogVisible: false,
        categories: [],
        apps: [],
        appPool: {},
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.appPool = JSON.parse(localStorage.getItem('appPool'));
      },
      async fetchData() {
        let formData = new FormData();
        formData.set('AppPoolKey', this.appPool.AppPoolKey);
        await this.axios.post('/user/GetAppList', formData).then((res) => {
          this.apps = res.data.Items;
          console.log(res.data);
        });
      },
      dateFormat(timeStamp) {
        let date = new Date(timeStamp);
        let y = date.getFullYear();
        let M = date.getMonth() + 1;
        let d = date.getDate();
        let h = date.getHours();
        let m = date.getMinutes();
        return y + '/' + M + '/' + d + ' ' + h + ':00';
      },
      pushRouter(path){
        this.$router.push(path);
      }
    }
  }
</script>

<style scoped>
  .container {
    width: 100%;
    height: 100%;
    padding: 2% 5%;
    box-sizing: border-box;
  }

  .my-table {
    margin-top: 2%;
    width: 100%;
    height: 80%;
    color: #606266;
    background-color: white;
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    position: relative;
  }

  .my-table__header {
    width: 96%;
    margin-left: 2%;
    height: 10%;
    display: flex;
    align-items: center;
    padding: 1rem;
  }

  .my-table__body {
    width: 96%;
    height: 90%;
    margin-left: 2%;
    box-sizing: border-box;
  }
</style>

<style>
  .my-table__scrollbar {
    width: 100%;
    height: 90%;
  }

  .my-table__scrollbar .el-scrollbar__wrap {
    overflow-x: hidden;
  }
</style>
