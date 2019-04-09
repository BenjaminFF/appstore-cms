<template>
  <div class="container">
    <el-button @click="addDialogVisible=true">新增类别</el-button>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="4">类别名称</el-col>
        <el-col :span="16" style="text-align: center">创建时间</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="category in categories" class="l-mtag-table__tr">
            <el-col :span="4">{{category.CategoryName}}</el-col>
            <el-col :span="16" style="text-align: center">{{dateFormat(category.CreateTime*1000)}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text" @click="openEditDialog(category)">编辑</el-button>
              <el-button type="text" @click="openDelDialog(category)">删除</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
    </div>
    <el-dialog
      title="添加类别"
      :visible.sync="addDialogVisible"
      width="30rem">
      <el-form ref="mForm" :model="addCategoryInfo" label-width="80px" :rules="addCategoryInfoRules">
        <el-form-item label="类别名" prop="CategoryName">
          <el-input v-model="addCategoryInfo.CategoryName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="addCategoryToServer('mForm')" :loading="isUploading">添加</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="编辑类别"
      :visible.sync="editDialogVisible"
      width="30rem">
      <el-form ref="mEditForm" :model="curCategory" label-width="80px" :rules="editCategoryInfoRules">
        <el-form-item label="类别名" prop="CategoryName">
          <el-input v-model="curCategory.CategoryName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="editRoleToServer('mEditForm')" :loading="isUploading">确定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="delDialogVisible"
      width="30%">
      <span>确认删除这个类别吗？</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="delDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="deleteRoleToServer" :loading="isUploading">删除</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "",
    data() {
      return {
        categories:[],
        addDialogVisible: false,
        editDialogVisible: false,
        delDialogVisible: false,
        curCategory: {},
        editCategoryInfoRules:{},
        addCategoryInfo: {},
        addCategoryInfoRules: {},
        isUploading: false,
        appPool:{},
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    methods: {
      init() {
        this.isUploading = false;
        this.addDialogVisible = false;
        this.delDialogVisible = false;
        this.editDialogVisible = false;
        this.curCategory = {};
        this.appPool=JSON.parse(localStorage.getItem('appPool'));
        let checkSameCategory = (rule, value, callback) => {
          if(this.categories!=null){
            for(let category of this.categories){
              if(category.CategoryName==value) {
                callback(new Error('类别名不能重复'));
                return;
              }
            }
          }
          callback();
        };
        this.addCategoryInfo = {
          CategoryName: ''
        }
        this.addCategoryInfoRules = {
          CategoryName: [
            {message: '类别名不能为空', required: true, min: 1},
            { validator: checkSameCategory, trigger: 'blur' }
          ]
        }
        this.editCategoryInfoRules = {
          CategoryName: [
            {message: '角色名不能为空', trigger: 'blur', required: true, min: 1},
          ]
        }
      },
      async fetchData() {
        let formData=new FormData();
        formData.set('AppPoolKey',this.appPool.AppPoolKey);
        await this.axios.post('/user/GetCategoryList',formData).then((res) => {
          this.categories=res.data.Items;
          console.log(res.data);
        })
      },
      openEditDialog(Category) {
        this.curCategory=Category;
        this.editDialogVisible = true;
      },
      openDelDialog(Category) {
        this.curCategory = Category;
        this.delDialogVisible = true;
      },
      addCategoryToServer(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isUploading = true;
            let formData=new FormData();
            formData.set('AppPoolKey',this.appPool.AppPoolKey);
            formData.set('CategoryName',this.addCategoryInfo.CategoryName);
            this.axios.post('/user/AddCategory',formData).then((res)=>{
              this.isUploading = false;
              this.fetchData();
              this.addDialogVisible=false;
            });
          } else {
            return false;
          }
        });
      },
      editRoleToServer(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let formData=new FormData();
            formData.set('AppPoolKey',this.appPool.AppPoolKey);
            formData.set('CategoryName',this.curCategory.CategoryName);
            formData.set('CategoryKey',this.curCategory.CategoryKey);
            this.axios.post('/user/EditCategory',formData).then((res) => {
              this.isUploading = false;
              this.editDialogVisible = false;
              this.fetchData();
            });
          } else {
            return false;
          }
        });
      },
      deleteRoleToServer() {
        this.isUploading = true;
        let formData=new FormData();
        formData.set('AppPoolKey',this.appPool.AppPoolKey);
        formData.set('CategoryKey',this.curCategory.CategoryKey);
        formData.set('Delete',true+"");
        this.axios.post('/user/EditCategory', formData).then((res) => {
          this.fetchData();
          this.isUploading = false;
          this.delDialogVisible = false;
        });
      },
      dateFormat(timeStamp){
        let date=new Date(timeStamp);
        let y=date.getFullYear();
        let M=date.getMonth()+1;
        let d=date.getDate();
        let h=date.getHours();
        let m=date.getMinutes();
        return y+'/'+M+'/'+d+' '+h+':00';
      }
    },
    watch: {
      addDialogVisible() {
        if (!this.addDialogVisible) {
          setTimeout(()=>{
            this.$refs.mForm.resetFields();
            this.addCategoryInfo={
              CategoryName: ""
            }
          },500);
        }
      },
      editDialogVisible() {
        if (!this.editDialogVisible) {
          setTimeout(()=>{
            this.$refs.mEditForm.resetFields();
          },500);
        }
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
