
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


//let result = await searchDanMu("年会不能停！","1");
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
    let ddpList = await searchByDandanPlay(name, episode || "1", playurl || undefined);
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
  const list = [];
  const maxRetries = 3; // 最大重试次数
  let retries = 0;

  try {
    // 发起搜索请求
    const searchResponse = await req(
      `https://api.so.360kan.com/index?force_v=1&kw=${encodeURI(name)}&from=&pageno=1&v_ap=1&tab=all`,
    );
    const searchResult = await searchResponse.json();

    // 获取 episodeId
    let episodeId = '';
    const seriesPlaylinks = searchResult.data.longData.rows[0].seriesPlaylinks;
    const playlinks = searchResult.data.longData.rows[0].playlinks;

    if (seriesPlaylinks?.length > 0) {
      const episodeIndex = parseInt(episode, 10) - 1;
      episodeId = seriesPlaylinks[episodeIndex]?.url;
    }

    if (!episodeId) {
      const prioritySources = ['bilibili1', 'qq', 'qiyi', 'youku', 'imgo'];
      for (const source of prioritySources) {
        if (playlinks[source]) {
          episodeId = playlinks[source];
          break;
        }
      }
      if (!episodeId) {
        episodeId = Object.values(playlinks)[0];
      }
    }

    console.log(episodeId);

    // 检查 episodeId 是否为空
    if (!episodeId) {
      console.log('episodeId is empty, skipping danmu request.');
      await toast('未匹配到官方链接，无法查找弹幕!');
      return list;
    }

    // 获取弹幕数据，带有重试机制
    let danMuResult;
    while (retries < maxRetries) {
      const danMuResponse = await req(`https://dm.s78.top/?ac=dm&key=tH1pX3jH5l&url=${episodeId}`);
      danMuResult = await danMuResponse.json();

      if (danMuResult.danmuku?.length > 0) {
        break; // 如果有数据，退出循环
      }

      retries++;
      console.log(`Retrying... Attempt ${retries} of ${maxRetries}`);
      await toast(`弹幕数据获取失败，正在重试... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
    }

    // 处理弹幕数据
    if (danMuResult.danmuku?.length > 0) {
      for (const element of danMuResult.danmuku) {
        list.push({
          time: element[0], // 提取 time
          content: element[4], // 提取 content
          color: element[2], // 提取 color
        });
      }
    } else {
      console.log('No danmuku data after retries.');
    }

  } catch (error) {
    console.error('Error in searchByDandanPlay:', error);
    await toast('弹幕数据解析失败，请稍后重试!');
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