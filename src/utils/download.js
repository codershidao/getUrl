// loadZip.js
import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";

// 批量打包下载
// fileArr下载的list：例如：
const loadZip = async (fileArr, zipName = "下载文件") => {
  // fileArr.forEach((el) => {
  //   el.fvName = `${el.fvName}.${el.fvUrl.split(".").at(-1)}`; // 截取url的后缀名添加到文件名： fvname.jpg
  // });
  const zip = new JSZip(); // 创建实例对象
  const promises = [];
  // 遍历生成下载文件
  fileArr.forEach((item) => {
    const promise = getFile(item[`图片地址`]).then((res) => {
      const fvName = item[`名称`] + ".png";
      // 创建文件用file()，创建文件夹用 floder()
      zip.file(fvName, res.data, {
        binary: true,
      });
    });
    promises.push(promise);
  });
  /** 
Promise.all() 静态方法接受一个 Promise 可迭代对象作为输入，并返回一个 Promise。当所有输入的 Promise 都被兑现时，返回的 Promise 也将被兑现（即使传入的是一个空的可迭代对象），并返回一个包含所有兑现值的数组。如果输入的任何 Promise 被拒绝，则返回的 Promise 将被拒绝，并带有第一个被拒绝的原因。

只有当all([p1, p2, p3]) 中的每一个 Promise 实例的状态都变成 fulfilled, Promise.all()的状态才会变成 fulfilled，此时  p1, p2, p3 的返回值组成一个数据，传给 Promise.all()的回调函数

只要 p1, p2, p3 中任何一个被 rejected,  Promise.all() 的状态就会变成 rejected，此时第一个被 rejected 的实例的返回值，会传给 Promise.all()的回调函数。
      
在上面的代码中，promises 数组中的每一个元素，都是 Promise 实例，所以需要用到 Promise.all()
 */

  // 生成 zip 文件
  Promise.all(promises).then(() => {
    // 生成zip 文件
    zip
      .generateAsync({
        type: "blob", // 文件格式
        compression: "DEFLATE", // STORE: 默认不压缩， DEFLATE：需要压缩
        compressionOptions: {
          level: 9, // 压缩等级 1~9   1 压缩速度最快， 9 最优压缩方式
        },
      })
      .then((res) => {
        FileSaver.saveAs(res, `${zipName}.zip`); // 使用FileSaver.saveAs保存文件，文件名可自定义
      });
  });
};

// 这一步为下载文件步骤，通过传入的url下载文件
// 将文件 url 格式转换为 Bolb 类型格式 或者 arraybuffer 格式
const getFile = (fvUrl) => {
  return new Promise((resolve, reject) => {
    axios(fvUrl, {
      method: "get", // get请求
      responseType: "blob", // 返回的数据会被强制转为blob类型 ，转换成arraybuffer 也行
    })
      .then((res) => {
        resolve(res); // 将下载的文件返回
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default loadZip;
