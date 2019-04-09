<template>
  <div class="container">
    <el-steps :active="stepActive" finish-status="success" style="width: 100%;">
      <el-step title="上传Apk"></el-step>
      <el-step title="补充信息"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div class="step1" v-if="stepActive==0">
      <el-upload
        class="apk-upload"
        drag
        action="/user/Upload"
        ref="apkUpload"
        :before-upload="beforeApkUpload"
        :file-list="apkList"
        :on-change="onApkChange"
        :on-success="onApkUploadSuccess"
        :data="apkExtraData"
        :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将apk拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <el-button type="primary" style="position:absolute;bottom: 5rem;width: 100%;margin: 0" @click="uploadApk"
                 :loading="isUploading">上传
      </el-button>
    </div>
    <div class="step2" v-if="stepActive==1">
      <el-form label-width="8rem" :model="apkInfo" style="margin-left: 16rem" :rules="apkInfoRules" ref="apkInfoForm">
        <el-form-item label="类别" prop="CategoryKey">
          <el-select v-model="apkInfo.CategoryKey" placeholder="请选择类别" style="width: 16rem">
            <el-option :label="category.CategoryName" :value="category.CategoryKey"
                       v-for="category in categories"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片" style=" width: 24rem;" prop="CoverImg" class="mCover-upload-Item">
          <el-upload
            ref="mCoverUpload"
            class="mCover-upload"
            action="/user/Upload"
            :on-change="onCoverImgChange"
            :auto-upload="false"
            :file-list="coverImg"
            list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="版本更新说明" style=";width: 24rem" prop="VersionDescription">
          <el-input type="textarea" resize="none" rows="3" v-model="apkInfo.VersionDescription"></el-input>
        </el-form-item>
        <el-form-item label="应用截图(4张)" style="width: 50rem" prop="ScreenShot">
          <el-upload
            class="mScreenshot-upload"
            :class="{invisible:screenShots.length==4}"
            :limit="4"
            action="/user/Upload"
            ref="mScreenshotUpload"
            :auto-upload="false"
            :file-list="screenShots"
            :on-remove="onScreenShotsChange"
            :on-change="onScreenShotsChange"
            list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item style="margin-top: 5rem;position: absolute;bottom: 0rem">
          <el-button type="primary" style="width: 7.5rem" @click="submitForm('apkInfoForm')" :loading="isUploading">提交
          </el-button>
          <el-button style="width: 7.5rem" @click="init()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="step3" v-if="stepActive==3">
      <div style="font-size: 2rem;color: #3a8ee6;margin: 4rem">App发布成功!</div>
      <el-button type="primary" style="width: 10rem" @click="init()">
        发布另一个
      </el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        stepActive: 0,
        apkList: [],
        appPool: {},
        apkExtraData: {},
        isUploading: false,
        apkInfo: {},
        categories: [],
        coverImg: [],
        screenShots: [],
        apkInfoRules: {}
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.stepActive = 0;
        this.apkList = [];
        this.coverImg = [];
        this.screenShots = [];
        this.isUploading = false;
        this.appPool = JSON.parse(localStorage.getItem('appPool'));
        this.apkExtraData = {AppPoolKey: this.appPool.AppPoolKey};                 //上传时需要
        this.apkInfo = {
          AppPoolKey: this.appPool.AppPoolKey,
          CategoryKey: "",
          VersionDescription: "",
          BuildKey: "",
          AppKey: ""
        }
        let validateScreenShot = (rule, value, callback) => {
          if (this.screenShots.length < 1) {
            callback(new Error('请补充应用截图(至少为1张)'));
          } else {
            callback();
          }
        };
        let validateCoverImg = (rule, value, callback) => {
          if (this.coverImg.length < 1) {
            callback(new Error('请补充封面'));
          } else {
            callback();
          }
        };
        this.apkInfoRules = {
          CategoryKey: [
            {required: true}
          ],
          VersionDescription: [
            {required: true, trigger: 'blur', message: '请填写版本说明,字数限制为200个',max:200},
          ],
          ScreenShot: [
            {required: true, validator: validateScreenShot}
          ],
          CoverImg: [
            {required: true, validator: validateCoverImg}
          ]
        }
      },
      fetchData() {
        let formData = new FormData();
        formData.set('AppPoolKey', this.appPool.AppPoolKey);
        this.axios.post('/user/GetCategoryList', formData).then((res) => {
          this.categories = res.data.Items;
        })
      },
      onApkChange(files, fileList) {
        this.apkList = fileList.length == 2 ? [fileList[1]] : [fileList[0]];
      },
      uploadApk() {
        this.$refs.apkUpload.submit();
      },
      beforeApkUpload(file) {
        let str=this.apkList[0].name.split(".");
        if(str[str.length-1]!="apk"){
          this.$message({
            showClose: true,
            message: '请上传APK文件',
            type: 'error'
          });
          return false;
        }else {
          this.isUploading = true;
        }
      },
      onApkUploadSuccess(response, file, fileList) {
        console.log(response);
        if (response.Result == 0) {
          this.apkInfo.BuildKey = response.BuildKey;
          this.apkInfo.AppKey = response.AppKey;
          this.stepActive++;
        } else {
          this.$message({
            showClose: true,
            message: '已有该APP，请重新上传',
            type: 'error'
          });
        }
        this.isUploading = false;
      },
      onCoverImgChange(files, fileList) {
        this.coverImg = fileList.length == 2 ? [fileList[1]] : [fileList[0]];
        this.$refs['apkInfoForm'].validateField('CoverImg', (error) => {
          console.log(error);
        })
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          console.log(this.coverImg[0]);
          if (valid) {
            this.isUploading = true;
            this.publishApp();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      async publishApp() {

        let coverImgForm = new FormData();
        coverImgForm.append('file', this.coverImg[0].raw);
        coverImgForm.append('AppPoolKey', this.apkInfo.AppPoolKey);
        coverImgForm.append('AppKey', this.apkInfo.AppKey);
        coverImgForm.append('BuildKey', this.apkInfo.BuildKey);
        coverImgForm.append('Type', 1 + "");
        await this.axios.post('/user/Upload', coverImgForm).then((res) => {
          console.log('coverImgForm:' + res.data);
        });
        for (let i = 0; i < this.screenShots.length; i++) {
          let screenShotForm = new FormData();
          screenShotForm.append('AppPoolKey', this.apkInfo.AppPoolKey);
          screenShotForm.append('AppKey', this.apkInfo.AppKey);
          screenShotForm.append('BuildKey', this.apkInfo.BuildKey);
          screenShotForm.append('file', this.screenShots[i].raw);
          screenShotForm.append('Type', 2 + "");
          await this.axios.post('/user/Upload', screenShotForm);
        }
        let appForm = new FormData();
        appForm.append('AppPoolKey', this.apkInfo.AppPoolKey);
        appForm.append('CategoryKey', this.apkInfo.CategoryKey);
        appForm.append('VersionDescription', this.apkInfo.VersionDescription);
        appForm.append('AppKey', this.apkInfo.AppKey);
        appForm.append('BuildKey', this.apkInfo.BuildKey);
        this.axios.post('/user/Publish', appForm).then((res) => {
          if (res.data.Result == 0) {
            this.stepActive += 2;
          }
        });
      },
      onScreenShotsChange(file, fileList) {
        this.screenShots = fileList;
        console.log(this.screenShots);
        if (fileList.length == 4) {
          this.$refs['apkInfoForm'].validateField('ScreenShot', (error) => {
            console.log(error);
          })
        }
      }
    }
  }
</script>

<style scoped>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2% 5%;
    box-sizing: border-box;
  }

  .step1 {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    height: 80%;
    width: fit-content;
  }

  .step2 {
    position: relative;
    height: 80%;
    width: 100%;
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  .step3 {
    display: flex;
    flex-direction: column;
    margin-top: 5rem;
    align-items: center;
    justify-content: center;
  }
</style>

<style>
  .apk-upload {
    margin-top: 5rem;
  }

  .apk-upload .el-upload-dragger {
    width: 30rem;
    height: 20rem;
    background-color: transparent !important;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .apk-upload .el-upload-list__item {
    transition: none !important;
    -webkit-transition: none !important;
  }

  .mCover-upload {
    height: 146px;
  }

  .mCover-upload .el-upload {
    background-color: transparent !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
  }

  .mCover-upload .el-upload-list__item {
    transition: none !important;
    -webkit-transition: none !important;
    position: absolute;
    width: 100% !important;
    left: 0 !important;
    top: 0 !important;
  }

  .mCover-upload .el-upload--picture-card {
    position: absolute !important;
    left: 0 !important;
    background-color: transparent !important;
  }

  .mScreenshot-upload{

  }

  .mScreenshot-upload .el-upload {
    background-color: transparent;
    width: 16rem !important;
  }

  .mScreenshot-upload .el-upload-list__item {
    transition: none !important;
    -webkit-transition: none !important;
    width: 16rem !important;
  }

  .mScreenshot-upload.invisible .el-upload {
    display: none !important;
  }

  .mCover-upload-Item {
    height: auto !important;
  }

</style>
