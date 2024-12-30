class MiGuSongExtension extends SongExtension {
  id = "dhs78adgh";
  name = "咪咕音乐";
  version = "0.0.1";
  baseUrl = "https://bz.zzzmh.cn/index";
  pageUrl = "https://api.zzzmh.cn/v2/bz/v3/getData";
  searchUrl = "https://api.zzzmh.cn/v2/bz/v3/searchData";
  pageSize = 10;
  async getRecommendPlaylists(pageNo) {
    pageNo ||= 1;
    const url =
      `http://m.music.migu.cn/migu/remoting/playlist_bycolumnid_tag` +
      `?playListType=2&type=1&columnId=15127315&tagId=&startIndex=${(pageNo - 1) * this.pageSize}`;
    const data = await this.getData(url);
    if (!data) {
      return null;
    }
    if (data instanceof String) {
      return null;
    }
    const list = [];
    data.retMsg.playlist.forEach((ele) => {
      list.push({
        name: ele.playListName,
        id: ele.playListId,
        picUrl: ele.image,
        songCount: ele.contentCount,
        playCount: ele.playCount,
        creator: {
          name: ele.createName,
        },
        sourceId: "",
      });
    });
    return {
      list,
      page: pageNo,
      pageSize: data.retMsg.playlist.length,
      totalPage: Math.floor(
        Number(data.retMsg.countSize) / data.retMsg.playlist.length
      ),
    };
  }
  async getRecommendSongs(pageNo) {
    pageNo ||= 1;
    const url =
      `http://m.music.migu.cn/migu/remoting/cms_list_tag` +
      `?pageSize=${this.pageSize}&nid=23853978&pageNo=${pageNo - 1}`;
    const data = await this.getData(url);

    if (!data) {
      return null;
    }
    if (data instanceof String) {
      return null;
    }
    const list = [];
    data.result.results.forEach((ele) => {
      list.push({
        name: ele.songData.songName,
        artists: [ele.songData.singerName],
        id: ele.songData.songId || this.nanoid(),
        cid: ele.songData.copyrightId,
        lyric: ele.songData.lyricLrc,
        album: ele.songData.albumData,
        mvId: ele.songData.mvData,
        mvCid: ele.songData.mvData?.copyrightId,
        url: ele.songData.listenUrl,
        picUrl: ele.songData.picM,
        bigPicUrl: ele.songData.picL,
        sourceId: "",
      });
    });

    return {
      list,
      page: pageNo,
      pageSize: data.result.pageSize,
      totalPage:
        Math.floor(Number(data.result.totalCount) / data.result.pageSize) + 1,
    };
  }
  async searchPlaylists(keyword, pageNo) {
    pageNo ||= 1;
    const url =
      `https://m.music.migu.cn/migu/remoting/scr_search_tag` +
      `?keyword=${keyword}&pgc=${pageNo}&rows=${this.pageSize}&type=6`;
    const response = await this.getData(url);
    const list = [];
    response.songLists.forEach((ele) => {
      list.push({
        name: ele.name,
        id: ele.id,
        picUrl: ele.img,
        songCount: ele.musicNum,
        playCount: ele.playNum,
        sourceId: "",
      });
    });
    return {
      list,
      page: pageNo,
      pageSize: this.pageSize,
      totalPage: response.pgt,
    };
  }
  async searchSongs(keyword, pageNo) {
    pageNo ||= 1;
    const url =
      `https://m.music.migu.cn/migu/remoting/scr_search_tag` +
      `?keyword=${keyword}&pgc=${pageNo}&rows=${this.pageSize}&type=2`;
    const response = await this.getData(url);

    const songs = [];
    response.musics.forEach((ele) => {
      songs.push({
        name: ele.songName,
        artists: [ele.singerName],
        id: ele.id || this.nanoid(),
        cid: ele.copyrightId,
        lyric: ele.lyric,
        album: ele.albumId,
        mvId: ele.mvId,
        mvCid: ele.mvCopyrightId,
        picUrl: ele.cover,
        sourceId: "",
      });
    });
    return {
      list: songs,
      page: pageNo,
      pageSize: this.pageSize,
      totalPage: response.pgt,
    };
  }

  async getPlaylistDetail(item, pageNo) {
    pageNo ||= 1;
    if (pageNo == 1) {
      const url =
        `http://m.music.migu.cn/migu/remoting/query_playlist_by_id_tag` +
        `?onLine=1&queryChannel=0&createUserId=migu&contentCountMin=5&playListId=${item.id}`;
      const playListRes = await this.getData(url);
      const listInfo = playListRes?.rsp?.playList[0];

      if (!listInfo) {
        return null;
      }
      const {
        createUserId,
        playCount,
        contentCount,
        summary: desc,
        createTime,
        updateTime,
      } = listInfo;
      item.playCount = playCount;
      item.songCount = contentCount;
      item.desc = desc;
      item.creator = {
        id: createUserId,
        name: item.creator?.name,
      };
      item.createTime = createTime;
      item.updateTime = updateTime;
    }
    const cids = [];
    const listUrl = `https://music.migu.cn/v3/music/playlist/${item.id}?page=${pageNo}`;

    const listRes = await this.getData(listUrl);

    const html = new DOMParser().parseFromString(listRes, "text/html");
    html.querySelectorAll(".row").forEach((ele) => {
      if (ele.getAttribute("data-cid")) {
        cids.push(ele.getAttribute("data-cid"));
      }
    });

    const songs = [];
    const songsUrl =
      `https://music.migu.cn/v3/api/music/audioPlayer/songs` +
      `?type=1&copyrightId=${cids.join(",")}`;
    const songsRes = await this.getData(songsUrl);

    (songsRes?.items || []).forEach((s) => {
      songs.push({
        id: s.songId,
        cid: s.copyrightId,
        name: s.songName,
        artists: s.singers.map((a) => a.artistName),
        album: s.albums[0]
          ? { id: s.albums[0].albumId, name: s.albums[0].albumId }
          : undefined,
        duration: (s.length || "00:00:00")
          .split(":")
          .reduce((t, v, i) => t + Number(v) * Math.pow(60, 2 - i), 0),
        mvId: s.mvList[0]?.mvId,
        mvCid: s.mvList[0]?.copyrightId,
        sourceId: "",
      });
    });
    item.list = {
      list: songs,
      page: pageNo,
      pageSize: 20,
      totalPage: Number(item.songCount),
    };

    return item;
  }
  async getData(url, options) {
    options ||= {};
    const headers = new Headers(options.headers || {});
    if (!headers.has("Referer") && !headers.has("referer")) {
      headers.set("Referer", "http://m.music.migu.cn/v3");
    }
    options.headers = headers;
    const response = await this.fetch(url, options);
    if (response.status !== 200) {
      return null;
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  async getSongUrl(item, size) {
    const cid = item.cid;
    if (!cid) {
      return null;
    }

    for (const quality of ["PQ", "HQ", "SQ"]) {
      const url =
        `https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2` +
        `?netType=01&resourceType=E&songId=${item.id}&toneFlag=${quality}`;
      const response = await this.getData(url, {
        headers: {
          channel: "0146951",
          uuid: "1234",
        },
      });
      if (!response || response.info?.includes("歌曲下线")) {
        return null;
      }
      if (response.data?.url) {
        return response.data.url;
      }
    }
    return null;
  }
}

return MiGuSongExtension;
