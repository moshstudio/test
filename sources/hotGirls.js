
class HotGirl extends PhotoExtension {
  id = "y78dsayd";
  name = "HotGirl";
  version = "0.0.1";
  baseUrl = "https://www.hotgirl2024.com/";

  async getRecommendList(pageNo) {
    pageNo ||= 1;
    let url = `${this.baseUrl}?page=${pageNo}`;
    try {
      const response = await this.fetch(url, {
        headers: { "Upgrade-Insecure-Requests": "1", Referer: this.baseUrl },
      });
      const iframe = await this.parseAndExecuteHtml(
        await response.text(),
        this.baseUrl
      );
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      const list = iframeDocument?.querySelectorAll(".articles-grid__content");
      const listArr = [];
      list?.forEach((item) => {
        const img = item.querySelector("img");
        const title = item.querySelector(".articles-grid__title").textContent;
        const cover = img?.getAttribute("data-src") || "";
        const datetime = item
          .querySelector(".articles-grid__publish-date")
          .textContent?.trim();
        const hot = item
          .querySelector(".articles-grid__views")
          .textContent?.trim();
        listArr.push({
          id: this.nanoid(),
          title,
          cover: cover ? this.urlJoin(this.baseUrl, cover) : "",
          datetime,
          hot,
          url: item.querySelector("a").href,
        });
      });
      const pageItems = iframeDocument?.querySelectorAll(".pagination__item");
      return {
        list: listArr,
        page: pageNo,
        totalPage: this.maxPageNoFromElements(pageItems),
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async search(keyword, pageNo) {
    pageNo ||= 1;
    let url = `${this.baseUrl}search.html/?page=${pageNo}&q=${keyword}`;
    try {
      const response = await this.fetch(url, {
        headers: { "Upgrade-Insecure-Requests": "1", Referer: this.baseUrl },
      });
      const iframe = await this.parseAndExecuteHtml(
        await response.text(),
        this.baseUrl
      );
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      const list = iframeDocument?.querySelectorAll(".articles-grid__content");
      const listArr = [];
      list?.forEach((item) => {
        const img = item.querySelector("img");
        const title = item.querySelector(".articles-grid__title").textContent;
        const cover = img?.getAttribute("data-src") || "";
        const datetime = item
          .querySelector(".articles-grid__publish-date")
          .textContent?.trim();
        const hot = item
          .querySelector(".articles-grid__views")
          .textContent?.trim();
        listArr.push({
          id: this.nanoid(),
          title,
          cover: cover ? this.urlJoin(this.baseUrl, cover) : "",
          datetime,
          hot,
          url: item.querySelector("a").href,
        });
      });
      const pageItems = iframeDocument?.querySelectorAll(".pagination__item");
      return {
        list: listArr,
        page: pageNo,
        totalPage: this.maxPageNoFromElements(pageItems),
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getPhotoDetail(item, pageNo) {
    try {
      const url = item.url + `/?page=${pageNo}`;
      const response = await this.fetch(url, {
        headers: { "Upgrade-Insecure-Requests": "1", Referer: this.baseUrl },
      });
      const iframe = await this.parseAndExecuteHtml(
        await response.text(),
        this.baseUrl
      );
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      const list = iframeDocument
        ?.querySelector(".article__image-list")
        ?.querySelectorAll("img");

      const imgItems = [];
      list?.forEach((item) => {
        const img = item;
        const cover = img?.getAttribute("data-src") || "";
        imgItems.push(cover ? this.urlJoin(this.baseUrl, cover) : "");
      });
      const pageElement = iframeDocument?.querySelector(
        ".pagination__item--active"
      );
      const page = Number(pageElement?.textContent?.trim()) || pageNo || 1;
      const totalPage = this.maxPageNoFromElements(
        iframeDocument?.querySelectorAll(".pagination__total")
      );
      return {
        item,
        photos: imgItems,
        page,
        totalPage,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

return HotGirl;
