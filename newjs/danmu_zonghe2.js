class DanMu {
  constructor() {
      /**
       * 弹幕内容
       * @type {string}
       */
      this.content = ''

      /**
       * 弹幕出现时间 单位秒
       * @type {number}
       */
      this.time = 0

      /**
       * 弹幕颜色
       * @type {string}
       */
      this.color = ''
  }
}

class BackData {
  constructor() {
      /**
       * 弹幕数据
       * @type {DanMu[]}
       */
      this.data = []
      /**
       * 错误信息
       * @type {string}
       */
      this.error = ''
  }
}


//let result = await searchDanMu("大奉打更人","03");
//console.log(result);


/**
* 搜索弹幕
* @param {string} name - 动画或影片的名称
* @param {string} episode - 动画或影片的集数
* @param {string} playurl - 播放链接
* @returns {Promise<BackData>} backData - 返回一个 Promise 对象
*/
async function searchDanMu(name, episode, playurl) {
  let backData = new BackData();
  try {
    let all = [];
    // MARK: - 实现你的弹幕搜索逻辑
    let ddpList = await searchByDandanPlay(name, episode, playurl || undefined);
    all = all.concat(ddpList);
    backData.data = all;
  } catch (error) {
    backData.error = error.toString();
  }
  if (backData.data.length == 0) {
    backData.error = '未找到弹幕';
  }
  //console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

async function searchByDandanPlay(name, episode, playurl) {
  let list = [];
  try {
    // 1. 发起搜索请求
    const searchResponse = await req(
      `https://api.so.360kan.com/index?force_v=1&kw=${encodeURI(name)}'&from=&pageno=1&v_ap=1&tab=all`,
    );
    const searchResult = await searchResponse.json();

    // 2. 检查搜索结果并获取剧集ID
    if (searchResult.data.longData.rows[0].seriesPlaylinks?.length > 0) {
      const episodeIndex = parseInt(episode, 10) - 1;
      let episodeId = searchResult.data.longData.rows[0].seriesPlaylinks[episodeIndex]?.url;
      if (!episodeId) {
        episodeId = Object.values(searchResult.data.longData.rows[0].playlinks)[0];
      }
      console.log(episodeId);

      // 3. 获取弹幕数据
      let danMuResult;
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        const danMuResponse = await req(`https://fc.lyz05.cn/?url=${episodeId}`);
        danMuResult = await danMuResponse.text();

        // 4. 解析弹幕XML
        const regex = /<d p="([^"]+)">([^<]+)<\/d>/g;
        let match;
        while ((match = regex.exec(danMuResult)) !== null) {
          const pAttributes = match[1].split(','); // 分割 p 属性
          const time = parseFloat(pAttributes[0]); // 提取 time
          const content = match[2]; // 提取 content
          list.push({ time, content });
        }

        // 如果找到了匹配项，退出循环
        if (list.length > 0) {
          break;
        }

        // 如果没有找到匹配项，重试
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`No matches found, retrying... (${retryCount}/${maxRetries})`);
        }
      }

      // 如果重试后仍然没有找到匹配项
      if (list.length === 0) {
        console.log('No matches found after retries.');
      }
    }
  } catch (error) {
    console.error('Error in searchByDandanPlay:', error);
  }
  return list;
}





async function homeContent() {
}

async function playerContent(vod_id) {
}

async function searchContent(keyword) {
}

async function detailContent(ids) {
}

async function categoryContent(tid, pg = 1, extend) {
}