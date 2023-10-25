<template>
  <div id="app">
    <el-upload
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
    <span>注：excel表格类似下表，表头必须字段含 <span style="color: red;margin-left:5px">产品规格</span></span>
    <el-table
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
    </el-table>
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
        console.log("文件打开失败");
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
            let reg = /(production-url):http[s]??.*?.(png)/g;
            // console.log(item);
            let orderId = item[`订单号`];
            let str = item[`产品规格`];
            let SKU = item["SKU"];
            let res = str.match(reg);
            if (res) {
              // let reg1 = /http[s]??.*?.(png)/g;
              // let production_url = res.toString();
              // item = production_url.match(reg1).toString();
              res = res.toString().slice(15);
              // arr[index][`产品规格`] = url;
            } else {
              // 这里匹配非定制产品
              let firstIndex = SKU.indexOf("-");
              let secondIndex = SKU.indexOf("-", firstIndex + 1);
              let toSKU = SKU.substring(secondIndex + 1, secondIndex + 7);
              try {
                NoncustomizedList.forEach((item1) => {
                  if (item1[toSKU]) {
                    res = item1[toSKU];
                    throw "error";
                  } else {
                    res = str;
                  }
                });
              } catch (e) {
                console.log(e);
              }

              console.log(res);
            }
            this.resArr.push([orderId, res]);
          });
        } catch (err) {
          alert(err);
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
</style>