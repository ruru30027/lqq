const webSite = 'https://t.me/s/';

const customText = {
    'UC网盘': "ucpanpan",
    '夸克云盘盘': "kuakeyun",
    '夸克云盘综合': "Quark_Movies",
    'UC夸克资源': "ucquark",
    '资源宇宙': "tgsearchers",
    '肯德基资源站': "XiangxiuNB",
    '云盘盘': "yunpanpan",
    '栽花云': "zaihuayun",
     '网盘收藏': "yunpanshare",
     '奥斯卡': "Oscar_4Kmovies",
};


const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36',
    'Origin': 'https://t.me',
    'Cache-Control': 'no-cache',
    'Accept-Encoding': 'gzip, br'
};

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
       const result = {
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
    
    let vodname = '';
    let vodpic = '';
        if (postData && postData.data && postData.data.share && postData.data.share.title) {
          vodname = postData.data.share.title;
        } else if (postData && postData.data && postData.data.title) {
          vodname = postData.data.title;
        } else if (postData && postData.data && postData.data.token_info && postData.data.token_info.title) {
          vodname = postData.data.token_info.title;
        }
    
    
      // Step 2: Fetch files from a given pdir_fid
      async function fetchFiles(pdir_fid) {
        let page = 1;
        let allFiles = [];
        while (true) {
          const getUrl = url.includes(".uc.cn")
            ? `https://pc-api.uc.cn/1/clouddrive/share/sharepage/detail?pr=UCBrowser&fr=pc&pwd_id=${pwd_id}&stoken=${encodeURIComponent(stoken)}&pdir_fid=${pdir_fid}&force=0&_page=${page}&_size=50&_fetch_banner=0&_fetch_share=0&_fetch_total=1&_sort=file_type:asc,file_name:asc`
            : `https://drive-h.quark.cn/1/clouddrive/share/sharepage/detail?pr=ucpro&fr=pc&uc_param_str=&pwd_id=${pwd_id}&stoken=${encodeURIComponent(stoken)}&pdir_fid=${pdir_fid}&force=0&_page=${page}&_size=50&_fetch_banner=1&_fetch_share=1&_fetch_total=1&_sort=file_type:asc,file_name:asc&__dt=494&__t=${Date.now()}`;
    
          const getResponse = await 访问网页(getUrl, 0);
          const getData = JSON.parse(getResponse);
          if (getData.status !== 200 || getData.code !== 0) {
            throw new Error(`Failed to get file list: ${getData.message}`);
          }
    
    
          if (vodpic === '') {
            if (getData && getData.data && getData.data.list && getData.data.list[0] && getData.data.list[0].big_thumbnail) {
              vodpic = getData.data.list[0].big_thumbnail;
            }
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
      const sortedVideos =allVideos;// sortVideos(allVideos);
      const videosWithSize = appendFileSize(sortedVideos);
      const formattedResult = formatResult(videosWithSize, pwd_id, stoken);
      return {
        vodname: vodname,
        vodpic: vodpic,
        result: formattedResult
      };
    
    } catch (error) {
      console.error(error);
      return null;
    }
    }
   

async function homeContent() {
  let backData = new RepVideo();
  const classData = Object.entries(customText).map(([type_name, type_id]) => {
    return {
        type_id: type_id, 
        type_name: type_name 
    };
});
  backData.class = classData;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
   
   

async function searchContent(keyword) {
  let backData = new RepVideo();
  const MAX_CONCURRENCY = 5; // 最大并发数
  let currentConcurrency = 0; // 当前并发数
  let queue = []; // 任务队列
  try {
      // 将任务添加到队列
      const tasks = Object.entries(customText).map(([key, tid]) => async () => {
          const encodedKeyword = encodeURIComponent(keyword);
          const url = `${webSite}${tid}?q=${encodedKeyword}`;
          const req2 = await req(url,{
              headers: headers
          });
          const html = await req2.text();
          const $ = cheerio.load(html);
          // 用于存储当前任务中已经处理过的 links
          const processedLinks = new Set();
          $('.tgme_widget_message').each((index, element) => {
              const message = $(element);
              const links = [];
              message.find('.tgme_widget_message_text a').each((i, link) => {
                  const href = $(link).attr('href');
                  if (href && (href.includes('drive.uc.cn') || href.includes('pan.quark.cn'))) {
                      // 检查是否已经处理过该 href
                      if (!processedLinks.has(href)) {
                          links.push(href);
                          processedLinks.add(href); // 标记为已处理
                      }
                  }
              });
              if (links.length === 0) return;
              let title = message.find('.tgme_widget_message_text').text().trim();
              title = title.replace(/https?:\/\/[^\s]+/g, '').replace(/名称：/g, '').replace(/\s+/g, '');
              const imageUrl = message.find('.tgme_widget_message_photo_wrap').css('background-image');
              let image = imageUrl ? imageUrl.match(/url\('([^']+)'\)/)[1] : null;
              const videoDet = new VideoList();
              videoDet.vod_pic = image || '';
              videoDet.vod_name = title;
              videoDet.vod_remarks = tid;
              videoDet.vod_id = links[0] + "||" + videoDet.vod_pic + "||" + tid;

              // 将当前任务的结果添加到 backData
              backData.list.push(videoDet);
          });
      });

      // 将任务推入队列
      queue.push(...tasks);

      // 执行任务的函数
      const runTask = async () => {
          while (queue.length > 0 && currentConcurrency < MAX_CONCURRENCY) {
              const task = queue.shift(); 
              currentConcurrency++; 
              await task(); 
              currentConcurrency--; 
              runTask(); 
          }
      };
      for (let i = 0; i < MAX_CONCURRENCY; i++) {
          runTask();
      }
      while (currentConcurrency > 0 || queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100)); 
      }
      console.log(JSON.stringify(backData));
      return JSON.stringify(backData);
  } catch (error) {
      console.error('Error fetching movie data:', error);
      return JSON.stringify({
          code: 0,
          msg: "获取数据失败",
          page: "1",
          limit: "20",
          list: []
      });
  }
}

   //获取影视分类列表
   async function categoryContent(tid, pg = 1, extend) {
    let backData = new RepVideo();
    try {
      const before = pg > 1 ? await getStorage(tid + '_tg') : '';
      //const before = '1044';
      const url = `${webSite}${tid}${pg > 1 ? `?before=${before}` : ''}`;
      console.log(url);
      const req2 = await req(url, {method: pg > 1 ? 'POST' : 'GET',headers: headers });//, agent: proxyAgent
      const html = await req2.text();
      const match = html.match(/data-before=(?:"(\d+)"|\\"(\d+)\\")/);
      if (match) {
        const value = match[1] || match[2];
        if (value) {
          console.log(value); // 输出: 1064
          await setStorage(tid + '_tg', value);
        }
      }
      const $ = cheerio.load(html);
      $('.tgme_widget_message').each((index, element) => {
        const message = $(element);
        const links = [];
        message.find('.tgme_widget_message_text a').each((i, link) => {
          const href = $(link).attr('href');
          if (href && (href.includes('drive.uc.cn') || href.includes('pan.quark.cn'))) {
            links.push(href);
          }
        });
        if (links.length === 0) return;
        let title = message.find('.tgme_widget_message_text').text().trim();
        title = title.replace(/https?:\/\/[^\s]+/g, '').replace(/名称：/g, '').replace(/\s+/g, '');
        const imageUrl = message.find('.tgme_widget_message_photo_wrap').css('background-image');
        let image = imageUrl ? imageUrl.match(/url\('([^']+)'\)/)[1] : null;
        const videoDet = new VideoList();
        videoDet.vod_pic = image || ''; 
        videoDet.vod_name = title; 
        videoDet.vod_remarks = tid; 
        videoDet.vod_id =  links[0] + "||" + videoDet.vod_pic + "||" + tid; 
        backData.list.push(videoDet);
      });
      console.log(JSON.stringify(backData));
      return JSON.stringify(backData);
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

   //获取影视详情信息
   async function detailContent(ids) {
    try {
        const [vod_link, vod_pic, vod_remarks] = ids.split('||');
        const vod_id = ids;
        const vod_year = '';
        const vod_director = '';
        const vod_actor = '';
        const vod_content = 'tg源无剧情';
        let vod_play_from = [];
        let vod_play_url = [];
        let vodname = '';
        let vodpic = '';
        if (vod_link.includes('uc.cn')) {
            vod_play_from = 'UC网盘';
        } else if (vod_link.includes('quark.cn')) {
          vod_play_from = '夸克网盘';
        }
        if (vod_play_from.length>0) {
            await toast(`正在获取${vod_play_from}剧集信息...`, 2);
            const results = await fetchVideoFiles(vod_link);
            if (results) {
                vodname = results.vodname;
                vod_play_url.push(results.result);
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
                vod_id,
                vod_name: vodname || vod_id,
                vod_pic: vodpic || vod_pic,
                vod_actor,
                vod_director,
                vod_remarks,
                vod_year,
                vod_content,
                  vod_play_from: vod_play_from,
                  vod_play_url: vod_play_url.join('$$$')
            }]
        };
        console.log(JSON.stringify(movieDetails));
        return JSON.stringify(movieDetails);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return JSON.stringify({ code: 0, msg: "获取数据失败", error: error.message });
    }
  }
   

   
