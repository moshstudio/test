class JiJianBiZhi extends PhotoExtension {
  id = "dk-0sau8"
  name = "极简壁纸";
  version = "0.0.1";
  baseUrl = "https://bz.zzzmh.cn/index";
  pageUrl = "https://api.zzzmh.cn/v2/bz/v3/getData";
  searchUrl = "https://api.zzzmh.cn/v2/bz/v3/searchData";

  async getRecommendList(pageNo) {
    pageNo ||= 1;
    const params = {
      size: 24,
      current: pageNo,
      sort: 0,
      category: 0,
      resolution: 0,
      color: 0,
      categoryId: 0,
      ratio: 0,
    };
    return await this.getData(this.pageUrl, JSON.stringify(params));
  }

  async search(keyword, pageNo) {
    pageNo ||= 1;
    const params = {
      size: 24,
      current: pageNo,
      sort: 0,
      category: 0,
      resolution: 0,
      color: 0,
      categoryId: 0,
      ratio: 0,
      keyword: keyword,
    };
    return await this.getData(this.searchUrl, JSON.stringify(params));
  }

  async getData(url, body) {
    try {
      const response = await this.fetch(url, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
          referer: "https://bz.zzzmh.cn",
        },
      });
      const data = await response.json();
      const list = [];
      data.data.list.forEach((item) => {
        list.push({
          id: this.nanoid(),
          cover: `https://api.zzzmh.cn/v2/bz/v3/getUrl/${item.i}${item.t}1`,
          noDetail: true,
        });
      });
      return {
        list,
        page: data.data.currPage,
        totalPage: data.data.totalPage,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getPhotoDetail(item, pageNo) {
    return null;
  }
}

return JiJianBiZhi;
