
let webSite= 'https://www.pansearch.me';


   function newfetch(url, options) {
       options = options || {};
       return new Promise(async (resolve, reject) => {
           let request = await sendMessage("fetch", JSON.stringify({"url": url, "options": options}))
   
           const response = () => ({
               ok: ((request.status / 100) | 0) == 2, // 200-299
               statusText: request.statusText,
               status: request.status,
               url: request.responseURL,
               text: () => Promise.resolve(request.responseText),
               json: () => Promise.resolve(request.responseText).then(JSON.parse),
               blob: () => Promise.resolve(new Blob([request.response])),
               clone: response,
               headers: request.headers,
           })
   
           if (request.ok) resolve(response());
           else reject(response());
       });
   }
   
   
   function extractShareId(url) {
     // 使用正则表达式匹配 "s/" 和 "/" 之间的字符串
     const regex = /\/s\/([a-f0-9]+)/;
     const match = url.match(regex);
   
     if (match && match[1]) {
       return match[1];
     } else {
       return null; // 如果没有匹配到，返回 null 或其他你认为合适的值
     }
   }

async function 访问网页(url, method, postParams, cookie, headers, timeout = 15000, setCookieCallback) {
    // 定义请求方法
    const methods = ['GET', 'POST', 'PUT'];
    const requestMethod = methods[method] || 'GET';
  
    // 构建请求头
    const requestHeaders = {};
    if (cookie) {
      requestHeaders['Cookie'] = cookie;
    }
    if (headers) {
      headers.split('\n').forEach(header => {
        const index = header.indexOf(':');
        if (index !== -1) {
          const key = header.substring(0, index).trim();
          const value = header.substring(index + 1).trim();
          if (key && value) {
            requestHeaders[key] = value;
          }
        }
      });
    }
    // 构建请求体（仅在 POST 或 PUT 时需要）
    let body = null;
    if (requestMethod === 'POST' || requestMethod === 'PUT') {
      if (postParams) {
        body = postParams;
      }
    }
    // 构建请求配置
    const requestOptions = {
      method: requestMethod,
      headers: requestHeaders,
      body: body,
      redirect: 'follow'
    };
    // 创建一个 Promise 用于超时控制
    const fetchPromise = newfetch(url, requestOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), timeout);
    });
    try {
      // 发送请求并等待响应
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      // 获取响应内容
      const responseText = await response.text(); 
      // 提取响应头中的 set-cookie
        const responseHeaders = JSON.parse(response.headers);
      // 解析 set-cookie 字段
      let setCookie = responseHeaders['set-cookie'];
      // 如果提供了 setCookieCallback，则调用它并传递 set-cookie
      if (setCookieCallback && setCookie) {
        setCookieCallback(setCookie);
      }
      // 返回结果
      return responseText;
    } catch (error) {
      throw error;
    }
  }


//调试脚本时用访问网页2，调试完毕后改回访问网页
async function 访问网页2(url, method, postParams, cookie, headers, timeout = 15000, setCookieCallback) {
    // 定义请求方法
    const methods = ['GET', 'POST', 'PUT'];
    const requestMethod = methods[method] || 'GET';
    // 构建请求头
    const requestHeaders = {};
    if (cookie) {
      requestHeaders['Cookie'] = cookie;
    }
    if (headers) {
      headers.split('\n').forEach(header => {
        const index = header.indexOf(':');
        if (index !== -1) {
          const key = header.substring(0, index).trim();
          const value = header.substring(index + 1).trim();
          if (key && value) {
            requestHeaders[key] = value;
          }
        }
      });
    }
    // 构建请求体（仅在 POST 或 PUT 时需要）
    let body = null;
    if (requestMethod === 'POST' || requestMethod === 'PUT') {
      if (postParams) {
        body = postParams;
      }
    }
    // 构建请求配置
    const requestOptions = {
      method: requestMethod,
      headers: requestHeaders,
      body: body,
      redirect: 'follow'
    };
    // 创建一个 Promise 用于超时控制
    const fetchPromise = fetch(url, requestOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), timeout);
    });
    try {
      // 发送请求并等待响应
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      // 获取响应内容
      const responseText = await response.text();
      // 返回结果
      return responseText;
    } catch (error) {
      throw error;
    }
  }


 async function playerContent(vod_id) {
     try {
       // Step 1: URL decode vod_id to get JSON text
       const decodedVodId = decodeURIComponent(vod_id);
       const vodData = JSON.parse(decodedVodId);
       const isQuark = vodData.isQuark;
       // Step 2: Find tBox folder and replace to_pdir_fid
       let page = 1;
       let tBoxFid = null;
       let getUrl = "";
       let createUrl = "";
       let fileUrl = "";
       let playUrl = "";
       let deleteUrl = "";
       let origin = "";
       let cookie = "";
       let tBoxFileUrl = "";
       if (isQuark) {
         getUrl = `https://drive-pc.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc&uc_param_str=&pdir_fid=0&_page=${page}&_size=100&_fetch_total=false&_fetch_sub_dirs=1&_sort=&__dt=1604987&__t=${Date.now()}`;
         createUrl = `https://drive-pc.quark.cn/1/clouddrive/file?pr=ucpro&fr=pc&uc_param_str=`;
         fileUrl = `https://pc-api.uc.cn/1/clouddrive/file/sort?pr=UCBrowser&fr=pc&pdir_fid=${vodData.to_pdir_fid}&_page=1&_size=50&_fetch_total=1&_fetch_sub_dirs=0&_sort=file_type:asc,updated_at:desc`;
         playUrl = `https://drive-pc.quark.cn/1/clouddrive/file/v2/play?pr=ucpro&fr=pc&uc_param_str=`;
         deleteUrl = `https://drive-pc.quark.cn/1/clouddrive/file/delete?pr=ucpro&fr=pc&uc_param_str=`;
         origin = `https://pan.quark.cn`;
         cookie = quarkCookie;
       } else {
         getUrl = `https://pc-api.uc.cn/1/clouddrive/file/sort?pr=UCBrowser&fr=pc&pdir_fid=0&_page=${page}&_size=50&_fetch_total=1&_fetch_sub_dirs=0&_sort=file_type:asc,updated_at:desc`;
         createUrl = `https://pc-api.uc.cn/1/clouddrive/file?pr=UCBrowser&fr=pc`;
         fileUrl = `https://pc-api.uc.cn/1/clouddrive/file/sort?pr=UCBrowser&fr=pc&pdir_fid=${vodData.to_pdir_fid}&_page=1&_size=50&_fetch_total=1&_fetch_sub_dirs=0&_sort=file_type:asc,updated_at:desc`;
         playUrl = `https://pc-api.uc.cn/1/clouddrive/file/v2/play?pr=UCBrowser&fr=pc`;
         deleteUrl = `https://pc-api.uc.cn/1/clouddrive/file/delete?pr=UCBrowser&fr=pc`;
         origin = `https://drive.uc.cn`;
         cookie = ucCookie;
       }
       //await toast('正在查找tBox文件夹',2);
       while (true) {
         const getResponse = await 访问网页(getUrl, 0, null, cookie);
         const getData = JSON.parse(getResponse);
         if (getData.status !== 200 || getData.code !== 0) {
           throw new Error(`Failed to get file list: ${getData.message}`);
         }
         const tBoxFolder = getData.data.list.find(
           (file) => file.file_type === 0 && file.file_name === "tBox"
         );
         if (tBoxFolder) {
           tBoxFid = tBoxFolder.fid;
           break;
         }
         // If the list size is less than 100, break the loop
         if (getData.data.list.length < 100) {
           break;
         }
         page++;
       }
       if (tBoxFid) {
         vodData.to_pdir_fid = tBoxFid;
         await toast('正在清空tBox文件夹内文件...',2);
         if (isQuark) {
           tBoxFileUrl = `https://drive-pc.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc&uc_param_str=&pdir_fid=${tBoxFid}&_page=1&_size=50&_fetch_total=1&_fetch_sub_dirs=0&_sort=file_type:asc,updated_at:desc`;
         } else {
           tBoxFileUrl = `https://pc-api.uc.cn/1/clouddrive/file/sort?pr=UCBrowser&fr=pc&uc_param_str=&pdir_fid=${tBoxFid}&_page=1&_size=50&_fetch_total=1&_fetch_sub_dirs=0&_sort=file_type:asc,updated_at:desc`;
         }
         // 带 cookie 用 get 方式访问指定的 URL 并取出 list 里的 fid
         const tBoxFileResponse = await 访问网页(tBoxFileUrl, 0, null, cookie);
         const tBoxFileData = JSON.parse(tBoxFileResponse);
         if (tBoxFileData.status !== 200 || tBoxFileData.code !== 0) {
           throw new Error(
             `Failed to get tBox file list: ${tBoxFileData.message}`
           );
         }
         const fids = tBoxFileData.data.list.map((file) => file.fid);
         if (fids.length > 0) {
           // 带 cookie 用 post 方式删除这些 fid
           const deleteParams = JSON.stringify({
             action_type: 2,
             filelist: fids,
             exclude_fids: [],
           });
           const deleteResponse = await 访问网页(
             deleteUrl,
             1,
             deleteParams,
             cookie,
             "Content-Type: application/json;charset=UTF-8"
           );
         }
       } else {
         // Step 3: Create tBox folder if not found
         //await toast('首次运行,自动创建tBox文件夹...',2);
         const createParams = JSON.stringify({
           pdir_fid: "0",
           file_name: "tBox",
           dir_path: "",
           dir_init_lock: false,
         });
         const createResponse = await 访问网页(
           createUrl,
           1,
           createParams,
           cookie,
           isQuark
             ? "Content-Type: application/json\nOrigin: https://pan.quark.cn\nReferer: https://pan.quark.cn/"
             : "Content-Type: application/json\nOrigin: https://drive.uc.cn\nReferer: https://drive.uc.cn/"
         );
         const createData = JSON.parse(createResponse);
         if (createData.status !== 200 || createData.code !== 0) {
           throw new Error(
             `Failed to create tBox folder: ${createData.message}`
           );
         }
         vodData.to_pdir_fid = createData.data.fid;
       }
       let retryCount = 0;
       let videoLinks = null;
       let saveAsTopFid = null;
       await toast("正在转存影片到网盘...", 2);
       while (retryCount < 5 && !videoLinks) {
         // Step 4: Post the final vodData
         const saveUrl = isQuark
           ? `https://drive-pc.quark.cn/1/clouddrive/share/sharepage/save?pr=ucpro&fr=pc&uc_param_str=&__dt=2460776&__t=${Date.now()}`
           : `https://pc-api.uc.cn/1/clouddrive/share/sharepage/save?pr=UCBrowser&fr=pc`;
         const saveParams = JSON.stringify(vodData);
         const saveResponse = await 访问网页(
           saveUrl,
           1,
           saveParams,
           cookie,
           isQuark
             ? "Content-Type: application/json\nOrigin: https://pan.quark.cn\nReferer: https://pan.quark.cn/"
             : "Content-Type: application/json\nOrigin: https://drive.uc.cn\nReferer: https://drive.uc.cn/"
         );
         const saveData = JSON.parse(saveResponse);
         if (saveData.status !== 200 || saveData.code !== 0) {
           throw new Error(`Failed to save vodData: ${saveData.message}`);
         }
         // Step 5: Check task status
         const taskId = saveData.data.task_id;

         let retryIndex = 0;
         let isTaskFinished = false;
         saveAsTopFid = null;

         while (retryIndex < 15 && !isTaskFinished) {
           const taskUrl = isQuark
             ? `https://drive-pc.quark.cn/1/clouddrive/task?pr=ucpro&fr=pc&uc_param_str=&task_id=${taskId}&retry_index=${retryIndex}&__dt=337800&__t=${Date.now()}`
             : `https://pc-api.uc.cn/1/clouddrive/task?pr=UCBrowser&fr=pc&uc_param_str=&task_id=${taskId}&retry_index=${retryIndex}&__dt=337800&__t=${Date.now()}`;
           const taskResponse = await 访问网页(
             taskUrl,
             0,
             "",
             cookie,
             isQuark
               ? "Origin: https://pan.quark.cn\nReferer: https://pan.quark.cn/"
               : "Content-Type: application/json\nOrigin: https://drive.uc.cn\nReferer: https://drive.uc.cn/"
           );
           const taskData = JSON.parse(taskResponse);

           if (taskData.status === 400 && taskData.code === 32003) {
             const fileResponse = await 访问网页(
               fileUrl,
               0,
               "",
               cookie,
               isQuark
                 ? "Content-Type: application/json\nOrigin: https://pan.quark.cn\nReferer: https://pan.quark.cn/"
                 : "Content-Type: application/json\nOrigin: https://drive.uc.cn\nReferer: https://drive.uc.cn/"
             );
             const fileData = JSON.parse(fileResponse);
             const fileList = fileData.data.list;
             const targetFile = fileList.find(
               (file) => file.size === vodData.fid_size
             );
             if (targetFile) {
               isTaskFinished = true;
               saveAsTopFid = targetFile.fid;
             }
           } else if (taskData.status !== 200 || taskData.code !== 0) {
             throw new Error(`Failed to get task status: ${taskData.message}`);
           } else if (taskData.data.finished_at) {
             isTaskFinished = true;
             saveAsTopFid = taskData.data.save_as.save_as_top_fids[0];
           }

           retryIndex++;
           await new Promise((resolve) => setTimeout(resolve, 500));
         }

         if (!isTaskFinished) {
           throw new Error("Task did not finish within the expected time.");
         }

         // Step 6: Get video playback links with retry mechanism
         await toast("正在获取影片播放链接...", 2);
         let retryCountForPlay = 0;
         let mySetCookie = null;

 const fetchPlayResponse = async (url, params, headers) => {
  return await 访问网页(url, 1, params, cookie, headers, 15000, (setCookie) => {
    mySetCookie = setCookie;
  });
};

const mergeCookies = (newCookies) => {
  const mergedCookies = [
    ...new Set([
      ...newCookies,
      ...cookie.split(";").map((item) => item.trim()),
    ]),
  ].join("; ");
  return mergedCookies;
};

const handlePlayResponse = (playResponse) => {
  let playData = JSON.parse(playResponse);
  if (playData.status !== 200 || playData.code !== 0) {
    if (playData.message.includes("文件已删除") || playData.message.includes("file not found")) {
      return null;
    }
    throw new Error(`Failed to get video playback links: ${playData.message}`);
  }
  return playData;
};

if (isQuark) {
  while (retryCountForPlay < 5 && !videoLinks) {
    try {
      let playParams = JSON.stringify({
        fid: saveAsTopFid,
        resolutions: "normal,low,high,super,2k,4k",
        supports: "fmp4,m3u8",
      });
      let playResponse = await fetchPlayResponse(
        playUrl,
        playParams,
        `Referer: ${origin}`
      );
      let playData = handlePlayResponse(playResponse);
      if (!playData) break;

      videoLinks = playData.data.video_list
        .map((video) => {
          const url = video.video_info && video.video_info.url ? video.video_info.url : null;
          if (url) {
            return {
              url: url,
              resolution: video.resolution,
              member_right: video.member_right,
              width: video.video_info.width,
              height: video.video_info.height,
            };
          }
        })
        .filter((video) => video !== undefined);

      if (mySetCookie) {
        const newCookies = mySetCookie
          .split(",")
          .map((item) => item.split(";")[0].trim())
          .filter((item) => item !== undefined);
        cookie = mergeCookies(newCookies);
      }
    } catch (error) {
      retryCountForPlay++;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
} else {
  let playParams = JSON.stringify({ fids: [saveAsTopFid] });
  let playResponse = await fetchPlayResponse(
    "https://pc-api.uc.cn/1/clouddrive/file/download?pr=UCBrowser&fr=pc",
    playParams,
    `Content-Type: application/json;charset=UTF-8\nReferer: ${origin}`
  );
  let playData = handlePlayResponse(playResponse);
  if (!playData) return null;

  let downloadUrl = playData.data[0].download_url;
  if (downloadUrl) {
    videoLinks = [{ url: downloadUrl }];

    if (mySetCookie) {
      const newCookies = mySetCookie
        .split(",")
        .map((item) => item.split(";")[0].trim())
        .filter((item) => item !== undefined);
      cookie = mergeCookies(newCookies);
    }
  }
}

         if (!videoLinks) {
           retryCount++;
           if (retryCount < 5) {
             //console.log("文件已删除，重新执行 Step 4 + Step 5  "+retryCount.toString());
             await new Promise((resolve) => setTimeout(resolve, 5000));
           } else {
             throw new Error(
               "Failed to get video playback links after 3 attempts."
             );
           }
         }
       }

       // Step 7: Delete the file
       const deleteParams = JSON.stringify({
         action_type: 2,
         filelist: [saveAsTopFid],
         exclude_fids: [],
       });
       const deleteResponse = await 访问网页(
         deleteUrl,
         1,
         deleteParams,
         cookie,
         isQuark
           ? "Content-Type: application/json\nOrigin: https://pan.quark.cn\nReferer: https://pan.quark.cn/"
           : "Content-Type: application/json\nOrigin: https://drive.uc.cn\nReferer: https://drive.uc.cn/"
       );
       const deleteData = JSON.parse(deleteResponse);
       if (deleteData.status !== 200 || deleteData.code !== 0) {
         throw new Error(`Failed to delete file: ${deleteData.message}`);
       }



       //return {
       //    saveAsTopFid: saveAsTopFid,
       //     videoLinks: videoLinks
       //};
       await toast("影片链接获取完毕,尝试播放...", 2);
       let result = {
         parse: 1,
         header: `Cookie: ${cookie}\nOrigin: ${origin}\nReferer: ${origin}`,
         playUrl: "",
         url: "",
       };
       if (videoLinks.length > 0) {
         result.url = videoLinks[0].url;
       }
       console.log(JSON.stringify(result));
       return JSON.stringify(result);
     } catch (error) {


    let errorMessage;
    if (Array.isArray(error)) {
        errorMessage = error.map(err => {
            if (typeof err === 'object' && err !== null) {
                return err.message || JSON.stringify(err, null, 2);
            } else if (typeof err === 'string') {
                return err;
            } else {
                return String(err);
            }
        }).join('\n');
    } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || JSON.stringify(error, null, 2);
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        errorMessage = String(error);
    }

         await toast(`获取影片链接失败: ${errorMessage}`,5);
       //console.error(error);
       const result = {
         parse: 1,
         header: "",
         playUrl: "",
         url: "",
         message: `获取链接失败: ${error}`,
       };
       return JSON.stringify(result);
     }
   }
   
   
   
   // 获取uc、夸克网盘视频文件列表
   async function fetchVideoFiles(url) {
     try {
       const pwd_id = extractShareId(url);
       const isQuark = url.includes(".uc.cn")
         ? false
         : true;
       // Step 1: Send POST request to get stoken
       const postUrl = url.includes(".uc.cn")
         ? "https://pc-api.uc.cn/1/clouddrive/share/sharepage/v2/detail?pr=UCBrowser&fr=pc"
         : "https://drive-h.quark.cn/1/clouddrive/share/sharepage/token?pr=ucpro&fr=pc&uc_param_str=&__dt=300&__t=" + Date.now();
       const postParams = url.includes(".uc.cn")
         ? JSON.stringify({ pwd_id: pwd_id, passcode: "", force: 0, page: 1, size: 50, fetch_banner: 1, fetch_share: 1, fetch_total: 1, sort: "file_type:asc,file_name:asc", banner_platform: "other", web_platform: "mac", fetch_error_background: 1 })
         : JSON.stringify({ pwd_id: pwd_id, passcode: "" });
       const postResponse = await 访问网页(postUrl, 1, postParams, null, "Content-Type: application/json;charset=UTF-8");
       if (postResponse.includes("好友已取消了分享")) {
         return '该网盘已取消了分享$1';
       }
       const postData = JSON.parse(postResponse);
       if (postData.status !== 200 || postData.code !== 0) {
         throw new Error(`Failed to get stoken: ${postData.message}`);
       }
       const stoken = url.includes(".uc.cn")
         ? postData.data.token_info.stoken
         : postData.data.stoken;
   
       // Step 2: Fetch files from a given pdir_fid
       async function fetchFiles(pdir_fid) {
         let page = 1;
         let allFiles = [];
         while (true) {
           const getUrl = url.includes(".uc.cn")
             ? `https://pc-api.uc.cn/1/clouddrive/share/sharepage/detail?pr=UCBrowser&fr=pc&pwd_id=${pwd_id}&stoken=${encodeURIComponent(stoken)}&pdir_fid=${pdir_fid}&force=0&_page=${page}&_size=50&_fetch_banner=0&_fetch_share=0&_fetch_total=1&_sort=file_type:asc,file_name:asc`
             : `https://drive-h.quark.cn/1/clouddrive/share/sharepage/detail?pr=ucpro&fr=pc&uc_param_str=&pwd_id=${pwd_id}&stoken=${encodeURIComponent(stoken)}&pdir_fid=${pdir_fid}&force=0&_page=${page}&_size=50&_fetch_banner=1&_fetch_share=1&_fetch_total=1&_sort=file_type:asc,updated_at:desc&__dt=494&__t=${Date.now()}`;
   
           const getResponse = await 访问网页(getUrl, 0);
           const getData = JSON.parse(getResponse);
           if (getData.status !== 200 || getData.code !== 0) {
             throw new Error(`Failed to get file list: ${getData.message}`);
           }
           allFiles = allFiles.concat(getData.data.list);
           // If the list size is less than 50, break the loop
           if (getData.data.list.length < 50) {
             break;
           }
           page++;
         }
   
         return allFiles;
       }
   
       // Step 3: Recursively fetch all video files
       async function fetchAllVideos(pdir_fid) {
         const files = await fetchFiles(pdir_fid);
         const videos = [];
         for (const file of files) {
           if (file.obj_category && file.obj_category.startsWith("video")) {
             videos.push({
               file_name: file.file_name,
               size: file.size,
               fid: file.fid,
               pdir_fid: file.pdir_fid,
               share_fid_token: file.share_fid_token
             });
           } else if (file.file_type === 0) {
             // If it's a folder, recursively fetch videos from this folder
             const folderVideos = await fetchAllVideos(file.fid);
             videos.push(...folderVideos);
           }
         }
         return videos;
       }
   
       // Step 4: Sort videos by file name
       function sortVideos(videos) {
         return videos.sort((a, b) => {
           const extractNumbers = (fileName) => {
             const regex = /(\d+)/g;
             const matches = fileName.match(regex);
             return matches ? matches.map(Number) : [];
           };
   
           const numsA = extractNumbers(a.file_name);
           const numsB = extractNumbers(b.file_name);
   
           for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
             const numA = numsA[i] || 0;
             const numB = numsB[i] || 0;
   
             if (numA !== numB) {
               return numA - numB;
             }
           }
   
           return 0;
         });
       }
   
       // Step 5: Format file size
       function formatFileSize(size) {
         const mb = size / (1024 * 1024);
         if (mb < 1024) {
           return `${mb.toFixed(2)} M`;
         } else {
           const gb = mb / 1024;
           return `${gb.toFixed(2)} G`;
         }
       }
   
       // Step 6: Append formatted file size to file name
       function appendFileSize(videos) {
         return videos.map(video => {
           const formattedSize = formatFileSize(video.size);
           return {
             ...video,
             file_name: `${video.file_name} [${formattedSize}]`
           };
         });
       }
   
       // Step 7: Format the result as specified
       function formatResult(videos, pwd_id, stoken) {
         return videos.map(video => {
           const result = {
             fid_list: [video.fid],
             fid_token_list: [video.share_fid_token],
             fid_size: video.size,
             to_pdir_fid: "暂定",
             pwd_id: pwd_id,
             isQuark: isQuark,
             stoken: stoken,
             pdir_fid: "0",
             scene: "link"
           };
           //return `${video.file_name}#${JSON.stringify(result)}`;
           return `${video.file_name}$${encodeURIComponent(JSON.stringify(result))}`;
         }).join('#');
       }
   
       // Start fetching from the root directory (pdir_fid=0)
       const allVideos = await fetchAllVideos(0);
       const sortedVideos = sortVideos(allVideos);
       const videosWithSize = appendFileSize(sortedVideos);
       const formattedResult = formatResult(videosWithSize, pwd_id, stoken);
       return formattedResult;
   
     } catch (error) {
       console.error(error);
       return null;
     }
   }


//searchContent("奔跑吧，急救医生");

// 定义一个函数来提取影片信息
async function searchContent(keyword) {
    try {
        let buildIdUrl = `${webSite}/search?keyword=&pan=quark`;
        let buildIdHtml = await 访问网页(buildIdUrl);
        let buildIdMatch = buildIdHtml.match(/"buildId":"([^"]+)"/);
        let buildId = buildIdMatch && buildIdMatch[1] ? buildIdMatch[1] : 'B08ZwJLhVfBkusIQ5Ys3D';
        
        let allItems = [];

        // 循环获取3页数据
        for (let page = 1; page <= 3; page++) {
            let searchUrl = `${webSite}/_next/data/${buildId}/search.json?keyword=${encodeURIComponent(keyword)}&offset=${(page - 1) * 10}&pan=quark`;
            let searchHtml = await 访问网页(searchUrl);
            let items = JSON.parse(searchHtml);
            const list = items.pageProps.data.data
                .map((item) => {
                    let vod_name = 文本_取中间(item.content, '名称：', '\n');
                    if (vod_name) {
                        vod_name = vod_name.replace(/<[^>]+>/g, '');
                    } else {
                        vod_name = item.content.replace(/<[^>]+>/g, '').replace(/名称：/g, '').replace(/[\n\r]/g, '') || '';
                    }
                    let vod_link = '';
                    let linkMatch = item.content.match(/https:\/\/pan\.quark\.cn\/s\/[a-zA-Z0-9]+/);
                    if (linkMatch) {
                        vod_link = linkMatch[0];
                    }
                    const vod_pic = item.image || 'https://bizaladdin-image.baidu.com/0/pic/-1383952426_1737186201_-54798625.png';
                    const vod_remarks = item.time || '';

                    return {
                        vod_id: `${vod_name}||${vod_link}||${vod_pic}`,
                        vod_name: vod_name,
                        vod_remarks: vod_remarks,
                        vod_pic: vod_pic,
                        vod_link: vod_link
                    };
                })
                .filter(item => item.vod_link); // 过滤掉 vod_link 为空的条目

            allItems = allItems.concat(list);

            // 如果当前页的数据量小于10，则停止搜索下一页
            if (items.pageProps.data.data.length < 10) {
                break;
            }
        }

        // 按 vod_remarks 的时间排序，最近日期的放在前面
        allItems.sort((a, b) => {
            // 将时间字符串转换为时间戳进行比较
            return new Date(b.vod_remarks) - new Date(a.vod_remarks);
        });

        console.log(JSON.stringify(allItems));
        return JSON.stringify({
            code: 1,
            msg: "数据列表",
            page: "1",
            limit: "20",
            list: allItems
        });
    } catch (error) {
        console.error('Error fetching the webpage:', error);
        return JSON.stringify({
            code: -1,
            msg: "获取数据失败",
            page: "1",
            limit: "20",
            list: []
        });
    }
}
//detailContent("大奉打更人 4K [DV&臻彩视听HDR][60帧率版][杜比全景声][更新至08集]||https://pan.quark.cn/s/aa48569f6eab||https://dl.pansearch.me/resources/54f561996c64b60a5525c50800eff11c.jpg");

//获取影视详情信息
async function detailContent(ids) {
    try {
      const [vod_name, vod_id, vod_pic] = ids.split("||");
      const defaultValues = {
        vod_year: '',
        vod_director: '未知',
        vod_actor: '未知',
        vod_remarks: '',
        vod_content: '',
        vod_play_from: '',
        vod_play_url: []
      };

      let vod_play_from = '';
      let vod_play_url = [];
  
      if (ids.includes('uc.cn') || ids.includes('quark.cn')) {
        const result = await fetchVideoFiles(vod_id);
        if (result) {
          vod_play_from = ids.includes('uc.cn') ? 'UC网盘' : '夸克网盘';
          vod_play_url.push(result);
        }
      }
  
      const movieDetails = {
        code: 1,
        msg: "数据列表",
        page: 1,
        pagecount: 1,
        limit: "20",
        total: 1,
        list: [{
          vod_id: ids,
          vod_name,
          vod_pic: vod_pic,
          vod_actor: '未知',
          vod_director: '未知',
          vod_remarks: '',
          vod_year: '',
          vod_content: '',
          vod_play_from,
          vod_play_url: vod_play_url.join('$$$')
        }]
      };
      const resultJson = JSON.stringify(movieDetails);
      console.log(resultJson);
      return resultJson;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return JSON.stringify({ code: 0, msg: "获取数据失败", error: error.message });
    }
  }


async function homeContent() {
const classData = [
    { "type_id": "国产剧", "type_name": "国产剧" },
    { "type_id": "港剧", "type_name": "港剧" },
    { "type_id": "美剧", "type_name": "美剧" },
    { "type_id": "韩剧", "type_name": "韩剧" },
    { "type_id": "台剧", "type_name": "台剧" },
    { "type_id": "泰剧", "type_name": "泰剧" },
    { "type_id": "日剧", "type_name": "日剧" },
    { "type_id": "英剧", "type_name": "英剧" },
    { "type_id": "国漫", "type_name": "国漫" },
    { "type_id": "日漫", "type_name": "日漫" },
    { "type_id": "短剧", "type_name": "短剧" },
    { "type_id": "综艺", "type_name": "综艺" }
];
          return JSON.stringify({
         code: 1,
         msg: "数据列表",
         page: "1",
         limit: "20",
         list: '',
         class: classData
       });
}

//categoryContent("国产剧",1);
//获取影视分类列表
async function categoryContent(tid, pg = 1, extend) {
    try {
        let buildIdUrl = `${webSite}/search?keyword=&pan=quark`;
        let buildIdHtml = await 访问网页(buildIdUrl);
        let buildIdMatch = buildIdHtml.match(/"buildId":"([^"]+)"/);
        let buildId = buildIdMatch && buildIdMatch[1] ? buildIdMatch[1] : 'B08ZwJLhVfBkusIQ5Ys3D';

        // 根据 pg 的值计算要访问的页面范围
        const startPage = (pg - 1) * 2 + 1;
        const endPage = startPage + 1;

        let allItems = [];

        for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
            let searchUrl = `${webSite}/_next/data/${buildId}/search.json?keyword=${encodeURIComponent(tid)}}&offset=${(currentPage - 1) * 10}&pan=quark`;
            let searchHtml = await 访问网页(searchUrl);
            let items = JSON.parse(searchHtml);

            if (items.pageProps.data.data.length >= 10) {
                allItems = allItems.concat(items.pageProps.data.data);
            } else {
                // 如果条目数小于10，停止访问后续页面
                break;
            }
        }

        const list = allItems
            .map((item) => {
                let vod_name = 文本_取中间(item.content, '名称：', '\n');
                if(vod_name){
                    vod_name=vod_name.replace(/<[^>]+>/g, '');
                }else {
                    vod_name = item.content.replace(/<[^>]+>/g, '').replace(/名称：/g, '').replace(/[\n\r]/g, '') || '';
                }
                let vod_link = '';
                let linkMatch = item.content.match(/https:\/\/pan\.quark\.cn\/s\/[a-zA-Z0-9]+/);
                if (linkMatch) {
                    vod_link = linkMatch[0];
                }
                const vod_pic = item.image || 'https://bizaladdin-image.baidu.com/0/pic/-1383952426_1737186201_-54798625.png';
                const vod_remarks = item.time || '';

                return {
                    vod_id: `${vod_name}||${vod_link}||${vod_pic}`,
                    vod_name: vod_name,
                    vod_remarks: vod_remarks,
                    vod_pic: vod_pic,
                    vod_link: vod_link
                };
            })
            .filter(item => item.vod_link); // 过滤掉 vod_link 为空的条目

        console.log(JSON.stringify(list));
        return JSON.stringify({
            code: 1,
            msg: "数据列表",
            page: pg.toString(),
            limit: "20",
            list: list
        });
    } catch (error) {
        console.error('Error fetching the webpage:', error);
        return JSON.stringify({
            code: -1,
            msg: "获取数据失败",
            page: pg.toString(),
            limit: "20",
            list: []
        });
    }
}



