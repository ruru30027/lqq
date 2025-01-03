
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36';

//searchContent("抖音神曲");

async function searchContent(keyword) {
  let backData = new RepVideo();
  try {
      let pro = await req('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
          method: 'POST',
          headers: {
              'User-Agent': UA,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              "context": {
                  "client": {
                      "clientName": "WEB",
                      "clientVersion": "2.20241230.09.00"
                  }
              },
              "query": keyword
          })
      });
      let proData = await pro.json();
      console.log(proData);

      // 假设API返回的数据结构中有视频信息
      let videos = [];
      if (proData.contents && proData.contents.twoColumnSearchResultsRenderer && proData.contents.twoColumnSearchResultsRenderer.primaryContents && proData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer && proData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents) {
          proData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.forEach(section => {
              if (section.itemSectionRenderer && section.itemSectionRenderer.contents) {
                  section.itemSectionRenderer.contents.forEach(item => {
                      if (item.videoRenderer) {
                          let video = item.videoRenderer;
                          let videoId = video.videoId;
                          let title = video.title.runs[0].text;
                          let thumbnail = video.thumbnail.thumbnails[0].url;
                          let duration = video.lengthText ? video.lengthText.simpleText : 'N/A';

                          let videoDet = new VideoList();
                          videoDet.vod_id = videoId+ "||" +title + "||" + thumbnail + "||" + duration;
                          videoDet.vod_pic = thumbnail;
                          videoDet.vod_name = title;
                          videoDet.vod_remarks = duration;
                          videos.push(videoDet);
                      }
                  });
              }
          });
      }

      backData.list = videos;
  } catch (error) {
      console.error('Error in fetchData:', error);
      backData.msg = error.statusText;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
async function detailContent(ids) {
  let backData = new RepVideo();
  let detModel = new VideoDetail()
  const [vod_id,vod_name,vod_pic,vod_remarks] = ids.split("||");
  detModel.vod_id=ids;
  detModel.vod_name = vod_name;
  detModel.vod_pic = vod_pic;
  detModel.vod_content = vod_name;
  detModel.vod_year = '';
  detModel.vod_remarks = vod_remarks;
  detModel.vod_play_from = '播放列表';
  detModel.vod_actor = '';
  detModel.vod_director = '';
  detModel.vod_area = '';
  let vod_play_url = '在线播放$' + vod_id;
  detModel.vod_play_url =vod_play_url;
  backData.list.push(detModel);
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//playerContent('Qs0Pt45xy8Q')
async function playerContent(vod_id) {
  let backData = new RepVideoPlayUrl()
  let youtubeUrl= `https://www.youtube.com/watch?v=${vod_id}`;
  try {
    await toast('正在分析youtube直链...',2);
    const API_BASE_URL = "https://youtube.iiilab.com";
    const GTimestamp = Date.now().toString().slice(0, 13);
    const GFooter = Crypto.MD5(`${youtubeUrl}youtube${GTimestamp}2HT8gjE3xL`).toString();
    let res = await req( `${API_BASE_URL}/api/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "G-Footer": GFooter,
        "G-Timestamp": GTimestamp,
        "Origin": API_BASE_URL,
        "Referer": `${API_BASE_URL}/`,
        "User-Agent": UA,
        "X-Forwarded-For": generateChineseIP()
      },
      body: JSON.stringify({
        link: youtubeUrl,
        site: "youtube"
      })
    });
    const apiResponse = await res.text();
    console.log("API 响应:", apiResponse);
    let highestQualityVideo = null;
    let highestQualityAudio = null;
    let maxQuality = -1;
    try {
      const mediaData = JSON.parse(apiResponse); // 解析 JSON
      if (mediaData.medias && Array.isArray(mediaData.medias)) {
        mediaData.medias.forEach(media => {
          if (media.media_type === "video" && media.formats && Array.isArray(media.formats)) {
            media.formats.forEach(format => {
              if (format.quality > maxQuality) {
                maxQuality = format.quality;
                highestQualityVideo = format.video_url;
                highestQualityAudio = format.audio_url;
              }
            });
          }
        });
      }
      if (highestQualityVideo && highestQualityAudio) {
        console.log("最高质量的视频 URL:", highestQualityVideo);
        console.log("最高质量的音频 URL:", highestQualityAudio);
        console.log("质量:", maxQuality);
        backData.audioUrl = highestQualityAudio;
        backData.url = highestQualityVideo;
        backData.header = headersToString( { 'User-Agent': UA  })
        backData.parse = 1
        console.log(JSON.stringify(backData));
        return JSON.stringify(backData);
      } else {
        console.log("未找到有效的视频或音频 URL");
        return '';
      }
    } catch (parseError) {
      console.error("解析 API 响应失败:", parseError);
      return '';
    }
  } catch (error) {
    console.error("发生错误:", error);
    return '';
  }
}


function generateChineseIP() {
  function isPrivateIP(ipParts) {
    // 检查是否是私有IP地址
    const [part1, part2] = ipParts;
    if (part1 === 10) return true; // 10.x.x.x
    if (part1 === 172 && part2 >= 16 && part2 <= 31) return true; // 172.16.x.x - 172.31.x.x
    if (part1 === 192 && part2 === 168) return true; // 192.168.x.x
    return false;
  }

  let ipParts;
  do {
    // 随机生成A、B、C类地址
    const classType = Math.floor(Math.random() * 3); // 0: A类, 1: B类, 2: C类
    ipParts = [];

    if (classType === 0) {
      // A类地址：1.x.x.x 到 126.x.x.x
      ipParts.push(Math.floor(Math.random() * 126) + 1); // 第一个部分：1-126
    } else if (classType === 1) {
      // B类地址：128.x.x.x 到 191.255.x.x
      ipParts.push(Math.floor(Math.random() * (191 - 128 + 1)) + 128); // 第一个部分：128-191
    } else {
      // C类地址：192.x.x.x 到 223.255.255.x
      ipParts.push(Math.floor(Math.random() * (223 - 192 + 1)) + 192); // 第一个部分：192-223
    }

    // 生成剩余部分
    for (let i = 1; i < 4; i++) {
      ipParts.push(Math.floor(Math.random() * 256)); // 其他部分：0-255
    }
  } while (isPrivateIP(ipParts)); // 如果是私有地址，重新生成

  return ipParts.join('.');
}