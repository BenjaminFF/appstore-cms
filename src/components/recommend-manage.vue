<template>
  <div class="container">
    <div>推荐位示意图</div>
    <div class="recommend-container">
      <div class="item1" :class="{itemDisabled:recommendList[0].PreInstall}">0</div>
      <div class="item2" :class="{itemDisabled:recommendList[1].PreInstall}">1</div>
      <div class="item3" :class="{itemDisabled:recommendList[2].PreInstall}">2</div>
      <div class="item4" :class="{itemDisabled:recommendList[3].PreInstall}">3</div>
      <div class="item5" :class="{itemDisabled:recommendList[4].PreInstall}">4</div>
      <div class="item6" :class="{itemDisabled:recommendList[5].PreInstall}">5</div>
    </div>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="10">推荐位</el-col>
        <el-col :span="10">应用</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="item in recommendList" class="l-mtag-table__tr">
            <el-col :span="10">{{item.Id}}</el-col>
            <el-col :span="10">{{item.AppName}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text" @click="openEditDialog(item)" :disabled="item.PreInstall">编辑</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>
    <el-dialog
      title="编辑推荐应用"
      :visible.sync="editDialogVisible"
      width="24rem">
      <el-form ref="mEditForm" :model="editForm" :rules="editRules">
        <el-form-item label="应用" prop="AppKey">
          <el-select style="width: 100%" v-model="editForm.AppKey">
            <el-option v-for="app in appList" :value="app.AppKey" :label="app.AppName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面" prop="CoverImg">
          <div style="position: relative;height: 12rem">
            <el-upload
              ref="recommendUpload"
              action="/ccweb/api/icons/upload"
              class="recommend-pic-upload"
              :auto-upload="false"
              :on-change="onCoverImgChange"
              :file-list="editForm.coverImg"
              list-type="picture-card">
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="editInfoToServer('mEditForm')" :loading="isUploading">确定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        appPool: {},
        recommendList: [],
        editDialogVisible: false,
        isUploading: false,
        editRules: {},
        editForm: {},
        appList: [],
        curRecommendItem: {}
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.appPool = JSON.parse(localStorage.getItem('appPool'));
        this.editForm = {
          CoverImg: [],
          Id: "",
          AppKey: "",
        }
        let validateCoverImg = (rule, value, callback) => {
          if (this.editForm.CoverImg.length < 1) {
            callback(new Error('请补充推荐封面'));
          } else {
            callback();
          }
        };
        this.editRules = {
          CoverImg: [
            {required: true, validator: validateCoverImg}
          ],
          AppKey: [
            {required: true, message: "请选择应用"}
          ]
        }
      },
      fetchData() {
        let formData = new FormData();
        formData.set('AppPoolKey', this.appPool.AppPoolKey);

        this.axios.post('/user/GetRecommendAppList', formData).then((res) => {
          this.recommendList = res.data.Items;
          this.recommendList.sort((item1, item2) => {
            return item1.Id - item2.Id;
          });
        });
        this.axios.post('/user/GetAppList', formData).then((res) => {
          this.appList = res.data.Items;
        });
      },
      openEditDialog(item) {
        this.curRecommendItem = item;
        this.editForm.AppKey = this.curRecommendItem.AppKey;
        this.editForm.Id = this.curRecommendItem.Id;
        this.editDialogVisible = true;
        let formData = new FormData();
        /*formData.set('AppPoolKey',this.appPool.AppPoolKey);
        formData.set('AppKey',item.AppKey);
        formData.set('ImageKey',item.BannerKey);
        this.axios.post('/user/Download',formData).then((res)=>{
          console.log(res.data);
        })*/
      },
      onCoverImgChange(files, fileList) {
        this.editForm.CoverImg = fileList.length == 2 ? [fileList[1]] : [fileList[0]];
        this.$refs['mEditForm'].validateField('CoverImg', (error) => {

        })
      },
      editInfoToServer(formName) {
        this.$refs[formName].validate((valid) => {
          console.log(this.editForm);
          if (valid) {
            this.updateRecommendApp();
            this.isUploading = true;
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      updateRecommendApp() {
        let formData = new FormData();
        formData.set('AppPoolKey', this.appPool.AppPoolKey);
        formData.set('AppKey',this.editForm.AppKey);
        formData.set('Id',this.editForm.Id);
        formData.set('file',this.editForm.CoverImg[0].raw);
        this.axios.post('/user/EditRecommendApp',formData).then((res)=>{
          this.editDialogVisible=false;
          this.isUploading=false;
          this.fetchData();
        })
      }
    }
  }
</script>

<style scoped>
  .container {
    width: 90%;
    height: 96%;
    margin-left: 5%;
    margin-top: 2%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .recommend-container {
    margin-top: 2%;
    width: calc(346px + 344px + 10px);
    height: calc(306px + 128px + 10px);
    position: relative;
    transform: scale(0.6, 0.6);
    transform-origin: 0px 0px;
    color: white;
    font-size: 2rem;
  }

  .itemDisabled {
    background-color: gray !important;
  }

  .item1 {
    width: 346px;
    height: 306px;
    position: absolute;
    left: 0;
    top: 0;
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item2 {
    width: 346px;
    height: 128px;
    position: absolute;
    left: 0;
    top: calc(306px + 10px);
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item3 {
    width: 344px;
    height: 168px;
    position: absolute;
    left: calc(346px + 10px);
    top: 0;
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item4 {
    width: 128px;
    height: 128px;
    position: absolute;
    left: calc(346px + 10px);
    top: calc(168px + 10px);
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item5 {
    width: 206px;
    height: 128px;
    position: absolute;
    left: calc(346px + 20px + 128px);
    top: calc(168px + 10px);
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item6 {
    width: 346px;
    height: 128px;
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #3a8ee6;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .my-table {
    width: 100%;
    height: 45%;
    color: #606266;
    background-color: white;
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    position: absolute;
    top: calc((306px + 128px + 10px) * 0.6 + 10%);
    left: 0;
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
    height: 85%;
  }

  .my-table__scrollbar .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .recommend-pic-upload .el-upload {
    background-color: transparent;
    width: 100%;
    position: absolute;
    left: 0;
    top: 2.2rem;
  }

  .recommend-pic-upload .el-upload-list__item {
    transition: none !important;
    -webkit-transition: none !important;
    position: absolute;
    width: 100%;
    left: 0;
    top: 2.2rem;
  }
</style>
