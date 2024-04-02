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
                </el-upload></div>

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
        <!-- <el-table
          :data="tableData"
          border
          style="width: 60%;margin-top:5px" 
        >
          <el-table-column
            prop="address"
            label="产品规格
"
          >
          </el-table-column>
        </el-table> -->
      </el-main>
    </el-container>

  </div>
</template>
 
<script>
const XLSX = require("xlsx");

// import loadZip from "./utils/download";
import NoncustomizedList from "./public/Nocustomized";

export default {
  name: "App",
  data() {
    return {
      tableData: [
        {
          date: "1",
          name: "王小虎",
          address: "http://s1jf91klb.hn-bkt.clouddn.com/preview.jpg",
        },
        {
          date: "2",
          name: "王小虎",
          address: "http://s1jf91klb.hn-bkt.clouddn.com/preview.jpg",
        },
        {
          date: "3",
          name: "王小虎",
          address: "http://s1jf91klb.hn-bkt.clouddn.com/preview.jpg",
        },
        {
          date: "4",
          name: "王小虎",
          address: "http://s1jf91klb.hn-bkt.clouddn.com/preview.jpg",
        },
      ],
      resArr: [],
    };
  },
  methods: {
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
        // console.log(this.resArr);
        const workbook1 = XLSX.utils.book_new();
        const worksheetName = "SheetJS";
        const worksheet1 = XLSX.utils.aoa_to_sheet(this.resArr);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook1, worksheet1, worksheetName);

        // At this point, out.xls will have been downloaded.
        // Output format determined by filename
        XLSX.writeFile(workbook1, "out.xlsx");
        // console.log(workbook);
        // setTimeout(function () {
        //   XLSX.writeFile(workbook, "下载.xlsx");
        // }, 3000);

        // if (result.length <= 0) {
        //   this.$message.error("文件为空");
        //   return;
        // } else {
        //   if (result[0][`图片地址`]) {
        //     loadZip(result, "图片");
        //   } else {
        //     this.$message.error("文件格式不正确");
        //   }
        // }
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