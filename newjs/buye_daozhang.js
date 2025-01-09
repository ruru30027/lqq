const webSite = '';

async function categoryContent(tid, pg = 1, extend) {
  const backData = new RepVideo();
  try {
    function encodeBase64(input) {
      const wordArray = Crypto.enc.Utf8.parse(input);
      const base64 = Crypto.enc.Base64.stringify(wordArray);
      return base64;
    }
    const separator = webSite.includes('?') ? '&' : '?';
    let url = `${webSite}${separator}ac=detail&t=${encodeURIComponent(tid)}&pg=${pg}`;
    if (extend) {
      url += `&ext=${encodeURIComponent(encodeBase64(extend))}`;
    }
    console.log(url);
    const response = await req(url);
    const resData = await response.json();
    if (resData?.list) backData.list = resData.list;
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.message;
    await toast(`获取分类数据失败：${backData.msg}`,3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}




async function detailContent(ids) {
  const backData = new RepVideo();
  try {
    const separator = webSite.includes('?') ? '&' : '?';
    const url = `${webSite}${separator}ac=detail&ids=${encodeURIComponent(ids)}`;
    const response = await req(url);
    const responseData = await response.text();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error('Error in detailContent:', error);
    backData.msg = error.message || error.statusText || 'Unknown error';
    await toast(`获取详情失败：${backData.msg}`,3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}



async function homeContent() {
  const backData = new RepVideo();
  try {
    const response = await req(webSite);
    const resData = await response.json();
    if (resData?.class) backData.class = resData.class;
    if (resData?.filters) backData.filters = resData.filters;
    if (resData?.list) backData.list = resData.list;
  } catch (error) {
    console.error('Error in homeContent:', error);
    backData.msg = error.statusText || error.message || 'Unknown error';
    await toast(`加载首页失败：${backData.msg}`,3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}




async function searchContent(keyword) {
  const backData = new RepVideo();
  try {
    const separator = webSite.includes('?') ? '&' : '?';
    const url = `${webSite}${separator}wd=${encodeURIComponent(keyword)}&pg=1`;
    const response = await req(url);
    const proData = await response.json();
    if (proData?.list) backData.list = proData.list;
  } catch (error) {
    console.error('Error in searchContent:', error);
    backData.msg = error.statusText || error.message || 'Unknown error';
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}




async function playerContent(vod_id, flag) {
  const backData = new RepVideoPlayUrl();
  try {
    const separator = webSite.includes('?') ? '&' : '?';
    const url = `${webSite}${separator}flag=${encodeURIComponent(flag)}&play=${encodeURIComponent(vod_id)}`;
    const response = await req(url);
    const proData = await response.json();
    backData.header = headersToString(proData.header || {});
    // 处理 道长的url
    if (Array.isArray(proData.url)) {
      let selectedUrl = '';
      // 查找是否包含 "原画"
      const originalIndex = proData.url.indexOf('原画');
      if (originalIndex !== -1 && originalIndex + 1 < proData.url.length) {
        // 如果包含 "原画"，取 "原画" 后面的 URL
        selectedUrl = proData.url[originalIndex + 1];
      } else {
        // 如果不包含 "原画"，从上往下找到第一个 http 开头的 URL
        for (let i = 0; i < proData.url.length; i++) {
          if (typeof proData.url[i] === 'string' && proData.url[i].startsWith('http')) {
            selectedUrl = proData.url[i];
            break;
          }
        }
      }
      backData.url = selectedUrl;
    } else {
      backData.url = proData.url; // 如果不是数组，直接取 URL
    }
    backData.parse = proData.parse === 1 ? 0 : proData.parse === 0 ? 1 : 1;
  } catch (error) {
    console.error('Error in playerContent:', error);
    backData.url = ''; 
    backData.parse = 1;
    backData.msg = error.message || 'Unknown error'; 
    await toast(`解析播放链接失败：${backData.msg}`, 3);
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
