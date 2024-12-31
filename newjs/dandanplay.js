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
  try {
    var response = await req(
      `https://api.dandanplay.net/api/v2/search/episodes?anime=${name}&episode=${episode}`,

    );
    const searchResult = await response.json();
    if (searchResult.animes?.length > 0) {
      let episodeId = searchResult.animes[0].episodes[0].episodeId;
      var response2 = await req(
        `https://api.dandanplay.net/api/v2/comment/${episodeId}?withRelated=true&chConvert=1`
      );
      const danMuResult = await response2.json();
      if (danMuResult.comments?.length > 0) {
        for (let index = 0; index < danMuResult.comments.length; index++) {
          const element = danMuResult.comments[index];
          let params = element.p.split(',');
          let danMu = new DanMu();
          danMu.content = element.m;
          danMu.time = params[0];
          list.push(danMu);
        }
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