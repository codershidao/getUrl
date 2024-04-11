// loadZip.js
import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";

// 批量打包下载
const loadZip = async (fileArr, zipName = "下载文件", callback) => {
  const zip = new JSZip();
  const promises = [];

  fileArr.forEach((item) => {
    const promise = getFile(item.url).then((res) => {
      const fvName = item.name + ".png";
      zip.file(fvName, res.data, {
        binary: true
      });
    });
    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    zip
      .generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      })
      .then((res) => {
        FileSaver.saveAs(res, `${zipName}.zip`);
        if (callback) callback(); // 调用回调函数
      });
  });
};

const getFile = (fvUrl) => {
  return new Promise((resolve, reject) => {
    axios(fvUrl, {
        method: "get",
        responseType: "blob",
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default loadZip;
