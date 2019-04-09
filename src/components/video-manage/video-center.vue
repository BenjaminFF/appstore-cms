<template>
  <div class="container">
    <el-row class="control-bar">
      <el-col :span="4" style="display: flex;align-items: center">
        <span style="margin-right: 0.5rem">视频来源</span>
        <el-select style="width: 7rem" v-model="sourceSelect.curOption">
          <el-option :value="option" v-for="option in sourceSelect.options" :label="option"></el-option>
        </el-select>
      </el-col>
      <el-col :span="4" style="display: flex;align-items: center" :sm="5">
        <span style="margin-right: 0.5rem">价格</span>
        <el-select style="width: 7rem" v-model="priceSelect.curOption">
          <el-option :value="option" v-for="option in priceSelect.options" :label="option"></el-option>
        </el-select>
      </el-col>
      <el-col :span="4" style="display: flex;align-items: center" :sm="5">
        <span style="margin-right: 0.5rem">评分</span>
        <el-select style="width: 7rem" v-model="scoreSelect.curOption">
          <el-option :value="option" v-for="option in scoreSelect.options" :label="option"></el-option>
        </el-select>
      </el-col>
      <el-col :span="4" style="display: flex;align-items: center" :sm="5">
        <span style="margin-right: 0.5rem">标记</span>
        <el-select style="width: 7rem" v-model="markSelect.curOption">
          <el-option :value="option" v-for="option in markSelect.options" :label="option"></el-option>
        </el-select>
      </el-col>
      <el-col :span="4" style="display: flex;align-items: center" :sm="4">
        <el-button type="primary">查询</el-button>
        <el-button>重置</el-button>
      </el-col>
    </el-row>
    <div style="margin-top: 2%;margin-bottom: 2rem">视频列表</div>
    <div class="my-table">
      <el-row class="my-table__header">
        <el-col :span="4">片名</el-col>
        <el-col :span="2">评分</el-col>
        <el-col :span="2">价格</el-col>
        <el-col :span="2">来源</el-col>
        <el-col :span="2">清晰度</el-col>
        <el-col :span="4" style="text-align: center">视频简介</el-col>
        <el-col :span="6" style="text-align: center">资源ID</el-col>
        <el-col :span="2">标记状态</el-col>
        <el-col :span="4" style="text-align: center">操作</el-col>
      </el-row>
      <el-scrollbar class="my-table__scrollbar">
        <div class="my-table__body">
          <el-row v-for="video in videos" class="l-mtag-table__tr">
            <el-col :span="4">{{video.Name}}</el-col>
            <el-col :span="2">{{video.Score}}</el-col>
            <el-col :span="2">{{video.Price}}</el-col>
            <el-col :span="2">{{getSourceNameByType(video.SourceType)}}</el-col>
            <el-col :span="2">{{video.Resolution}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-tooltip class="item" effect="light" placement="bottom-end">
                <div slot="content">{{video.Description}}</div>
                <p>{{video.Description.substring(0,10)+'...'}}</p>
              </el-tooltip>
            </el-col>
            <el-col :span="6" style="text-align: center;display: flex;justify-content: center">
              <el-tooltip class="item" effect="light" placement="bottom-end">
                <div slot="content" class="m-clip-content">{{video.VideoKey}}</div>
                <p>{{video.VideoKey.substring(0,10)+'...'}}</p>
              </el-tooltip>
              <el-button type="text" class="clip-btn" :data-clipboard-text="video.VideoKey" style="margin-left: 0.4rem">复制</el-button>
            </el-col>
            <el-col :span="2">{{video.Published==true?"已标记":"未标记"}}</el-col>
            <el-col :span="4" style="text-align: center">
              <el-button type="text">标记</el-button>
              <el-button type="text">修改封面</el-button>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
      <el-pagination
        class="pagination"
        :current-page.sync="pageInfo.curPage"
        @current-change="handlePageChange"
        layout="prev, pager, next, jumper"
        :page-count="pageInfo.totalPages">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import Clipboard from 'clipboard';

  export default {
    name: "",
    data() {
      return {
        admins: [],
        priceSelect: {},
        sourceSelect: {},
        scoreSelect: {},
        markSelect: {},
        videos: [],
        curText:"",
        pageInfo:{}
      }
    },
    created() {
      this.init();
      this.fetchData();
    },
    mounted() {
      const clipboard = new Clipboard('.clip-btn');
      clipboard.on('success', (e)=> {
        this.$message({
          message: '复制成功,资源ID为'+e.text,
          type: 'success'
        });
      });
    },
    methods: {
      init() {
        this.pageInfo={
          curPage:1,
          totalPages:"",
          pageSize:20
        }
        this.sourceSelect = {
          options: ['酷开', '自制', '正在直播'],
          curOption: ""
        }
        this.priceSelect = {
          options: ['免费'],
          curOption: ""
        }
        this.scoreSelect = {
          options: ['8.0~8.9', '7.0~7.9', '其他'],
          curOption: ""
        }
        this.markSelect = {
          options: ["已标记", "未标记"],
          curOption: ""
        }
      },
      fetchData() {
        let formData = new FormData();
        formData.set('ApiKey', 'fa85d0ce6a3e3177adf42725e230c4e9')
        formData.set('Page', 1 + "");
        formData.set('PageSize', '20');
        this.axios.post('http://192.168.1.113:9998/user/GetVideoList', formData).then((res) => {
          this.videos = res.data.Items;
          let count=res.data.Total;
          let numsperpage=this.pageInfo.pageSize;
          let totalPages = parseInt(count / numsperpage) == count / numsperpage ? parseInt(count / numsperpage) : parseInt(count / numsperpage) + 1;
          this.pageInfo.totalPages=totalPages;
        })
      },
      getSourceNameByType(type) {
        if (type == 0) {
          return '自制';
        } else if (type == 1) {
          return '酷开';
        }
      },
      getResourceByPage(curPage,pageSize){
        let formData = new FormData();
        formData.set('ApiKey', 'fa85d0ce6a3e3177adf42725e230c4e9')
        formData.set('Page', curPage);
        formData.set('PageSize', pageSize);
        this.axios.post('http://192.168.1.113:9998/user/GetVideoList', formData).then((res) => {
          this.videos = res.data.Items;
        })
      },
      handlePageChange() {
        console.log("curPage: " + this.pageInfo.curPage);
        this.getResourceByPage(this.pageInfo.curPage, this.pageInfo.pageSize);
      },
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

  .control-bar {
    width: 100%;
    height: fit-content;
    display: flex;
    font-size: 0.9rem;
  }

  .my-table {
    margin-top: 2%;
    width: 100%;
    height: 70%;
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

  .pagination{
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

<style>
  .my-table__scrollbar {
    width: 100%;
    height: 80%;
  }

  .my-table__scrollbar .el-scrollbar__wrap {
    overflow-x: hidden;
  }
</style>
