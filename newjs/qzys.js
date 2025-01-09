const axios = require("axios");
const http = require("http");
const https = require("https");

const _http = axios.create({
  timeout: 15 * 1000,
  httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
  httpAgent: new http.Agent({ keepAlive: true }),
  baseURL: "https://drpy.yanshanxiyu.top/api/奇珍异兽[官]", //替换成其他地址
});

const _play = async ({ flag, flags, id }, app) => {
  const parses = [];
  try {
    parses.push(app.parse_fish);
    parses.push(app.parse_jx1);
    parses.push(app.parse_jx2);
    parses.push(app.parse_jx3);
    parses.push(app.parse_jx4);
    parses.push(app.parse_jx5);
    // ... 可添加多个
  } catch {
    // 此处是防止添加不存在的解析造成的异常
  }

  for (const parse of parses) {
    try {
      return await parse({ flag, flags, id });
    } catch (e) {
      app.log.error(`解析失败：${e.message}`);
    }
  }

  //全部失败则返回给壳处理
  return {
    url: id,
    parse: 1,
    jx: 1,
  };
};

const fetch = async (req) => {
  delete req.query["token"];
  const { flag, play } = req.query;
  if (play) {
    if (/\.(m3u8|mp4|rmvb|avi|wmv|flv|mkv|webm|mov|m3u)(?!\w)/i.test(play)) {
      return {
        url: play,
        jx: 0,
        parse: 0,
      };
    } else {
      return await _play({ flag: flag || "", flags: [], id: play }, req.server);
    }
  }
  const ret = await _http("", {
    params: req.query,
  });
  return ret.data;
};

const meta = {
  key: "qzys", //key不能与其他site冲突
  name: "奇珍异兽",
  type: 4,
  api: "/video/qzys", //使用相对地址，服务会自动处理，不能与其他site冲突
  searchable: 1,
  quickSearch: 1,
  changeable: 0,
};

module.exports = async (app, opt) => {
  app.get(meta.api, fetch);
  opt.sites.push(meta);
};
