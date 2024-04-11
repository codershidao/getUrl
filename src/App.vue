<template>
  <div id="app">
    <el-container>
      <el-header>订单处理后台</el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
            <div class="grid-content bg-purple"><el-upload
                action
                accept=".xlsx, .xls"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handle"
                style="margin-bottom:20px"
              >
                <template>
                  <el-button type="primary">选择excel转换链接</el-button>
                </template>
              </el-upload>
              <span>注：表头必须字段含 <span style="color: red;">订单号</span><span style="color: red;margin-left:5px">图片链接</span></span>

            </div>

          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
            <el-link
              href="https://www.nowmsg.com/findzip/findzip.asp"
              target="_blank"
            >查询邮编</el-link>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
            <el-link
              href="https://www.google.com/maps/@47.5951518,-122.3316394,17z?authuser=4&hl=zh-cn&entry=ttu"
              target="_blank"
            >谷歌地图</el-link>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
            <el-link
              href="https://tools.pdf24.org/zh/all-tools"
              target="_blank"
            >PDF工具</el-link>
          </el-col>
        </el-row>
        <el-row
          :gutter="20"
          style="margin-top:20px"
        >
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
            <el-link
              href="https://wqs7t2uruc.feishu.cn/sheets/Ng0ZsTphbhKE7at84WAcE2Mnnrd?sheet=P4bbZj"
              target="_blank"
            >供应链表格</el-link>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
            <el-link
              href="https://www.17track.net/zh-cn"
              target="_blank"
            >17TRACK</el-link>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
            <el-link
              href="https://www.hsbianma.com/"
              target="_blank"
            >海关编码查找</el-link>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
            <el-link
              href="https://chat.openai.com/"
              target="_blank"
            >GPT</el-link>
          </el-col>
        </el-row>
        <el-row
          :gutter="20"
          style="margin-top:20px"
        >
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
            <div v-if="downloading">下载中...</div>
            <div v-else-if="downloaded">下载完成</div>
            <el-upload
              action
              accept=".xlsx, .xls"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handle1"
              style="margin-bottom:20px"
            >
              <template>
                <el-button type="primary">选择excel表批量下载图片</el-button>
              </template>
            </el-upload>
            <span>注：表头必须字段含 <span style="color: red;">SKU</span><span style="color: red;margin-left:5px">图片链接</span><span style="color: red;margin-left:5px">产品数量</span></span>
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#b3c0d1"
          >
          </el-col>
          <el-col
            :span="6"
            style="backgroundColor:#93db9f"
          >
          </el-col>
        </el-row>
      </el-main>
    </el-container>

  </div>
</template>
 
<script>
const XLSX = require("xlsx");

import loadZip from "./utils/download";
import NoncustomizedList from "./public/Nocustomized";

export default {
  name: "App",
  data() {
    return {
      resArr: [],
      downloading: false,
      downloaded: false,
    };
  },
  methods: {
    readFile1(file) {
      return new Promise((resolve) => {
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
      });
    },
    async handle1(ev) {
      this.downloading = true;
      let file = ev.raw;
      if (!file) {
        console.log("文件打开失败");
        return;
      } else {
        let data = await this.readFile1(file);
        let workbook = XLSX.read(data, { type: "binary" });
        console.log("二进制数据的解析:");
        console.log(workbook);
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let result = XLSX.utils.sheet_to_json(worksheet);
        console.log("最终解析的 json 格式数据:");
        console.log(result);
        let counts = {};
        let newArray = result.map((obj) => {
          counts[obj.SKU] = (counts[obj.SKU] || 0) + 1;
          let repeatCount = counts[obj.SKU];
          let name =
            repeatCount > 1
              ? `${obj.SKU}-${repeatCount}=${obj["产品数量"]}`
              : `${obj.SKU}=${obj["产品数量"]}`;
          return {
            name: name,
            url: obj["图片链接"],
          };
        });
        console.log(newArray);

        if (result.length <= 0) {
          this.$message.error("文件为空");
          this.downloading = false;
          return;
        } else {
          if (result[0][`图片链接`]) {
            loadZip(newArray, file.name, () => {
              this.downloaded = true;
              this.downloading = false;
            });
          } else {
            this.$message.error("文件格式不正确");
            this.downloading = false;
          }
        }
      }
    },
    readFile(file) {
      //文件读取
      return new Promise((resolve) => {
        let reader = new FileReader();
        reader.readAsBinaryString(file); //以二进制的方式读取
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
      });
    },
    async handle(ev) {
      let file = ev.raw;
      // console.log(file);
      if (!file) {
        // console.log("文件打开失败");
        return;
      } else {
        let data = await this.readFile(file);
        let workbook = XLSX.read(data, { type: "binary" }); //解析二进制格式数据
        // console.log("二进制数据的解析:");
        // console.log(workbook);
        // 如果有多个sheets的情况 循环即可，现在暂不考虑
        let worksheet = workbook.Sheets[workbook.SheetNames[0]]; //获取第一个Sheet
        let result = XLSX.utils.sheet_to_json(worksheet); //json数据格式
        // console.log("最终解析的 json 格式数据:");
        this.resArr = [];
        try {
          result.forEach((item) => {
            if (!item[`订单号`]) {
              throw Error("没有订单号字段");
            }
            if (!item[`产品规格`]) {
              throw Error("没有产品规格字段");
            }
            if (!item[`SKU`]) {
              throw Error("没有SKU字段");
            }
            let reg = /(production-url):http[s]??.*?.(png)/g;
            let orderId = item[`订单号`];
            let str = item[`产品规格`];
            let SKU = item["SKU"];
            let strlength = SKU.lastIndexOf("-");
            SKU = SKU.slice(0, strlength);
            let res = str.match(reg);
            if (res) {
              res = res.toString().slice(15);
            } else {
              // 这里匹配非定制产品
              NoncustomizedList.forEach((item1) => {
                if (item1.name === SKU) {
                  res = item1.url;
                }
              });
            }
            if (res == null) {
              res = str;
            }
            this.resArr.push([orderId, res]);
            return;
          });
        } catch (err) {
          alert(err);
          return;
        }
        this.resArr.unshift(["订单号", "产品规格"]);
        const workbook1 = XLSX.utils.book_new();
        const worksheetName = "SheetJS";
        const worksheet1 = XLSX.utils.aoa_to_sheet(this.resArr);
        XLSX.utils.book_append_sheet(workbook1, worksheet1, worksheetName);
        XLSX.writeFile(workbook1, "out.xlsx");
      }
    },
  },
};
</script>
 
<style>
input[type="file"] {
  display: none;
}

.el-upload__input {
  display: none;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
</style>