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


//let result = await searchDanMu("斗罗大陆","1");
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
  const maxRetries = 3; // 最大重试次数
  let retries = 0;

  try {
    // 发起搜索请求
    var response = await req(
      `https://api.so.360kan.com/index?force_v=1&kw=${encodeURI(name)}'&from=&pageno=1&v_ap=1&tab=all`,
    );
    const searchResult = await response.json();
    // 检查搜索结果
    if (searchResult.data.longData.rows[0].seriesPlaylinks?.length > 0) {
      // 将 episode 转换成整数
      const episodeIndex = parseInt(episode, 10) - 1;
      let episodeId = searchResult.data.longData.rows[0].seriesPlaylinks[episodeIndex].url;
      if (!episodeId) {
        episodeId = Object.values(searchResult.data.longData.rows[0].playlinks)[0];
      }
      console.log(episodeId);

      // 获取弹幕数据，带有重试机制
      let danMuResult;
      while (retries < maxRetries) {
        var response2 = await req(
          `https://dm.s78.top/?ac=dm&key=tH1pX3jH5l&url=${episodeId}`
        );
        danMuResult = await response2.json();

        if (danMuResult.danmuku?.length > 0) {
          break; // 如果有数据，退出循环
        }
        retries++;
        console.log(`Retrying... Attempt ${retries} of ${maxRetries}`);
      }

      // 处理弹幕数据
      if (danMuResult.danmuku?.length > 0) {
        for (let index = 0; index < danMuResult.danmuku.length; index++) {
          const element = danMuResult.danmuku[index];
          let danMu = {
            time: element[0], // 提取 time
            content: element[4], // 提取 content
            color: element[2] // 提取 color
          };
          list.push(danMu);
        }
      } else {
        console.log('No danmuku data after retries.');
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