class BiQu extends BookExtension {
  id = "h887SDHS";
  name = "笔趣";
  version = "0.0.1";
  baseUrl = "https://m.22biqu.net/";
  async getRecommendBooks(pageNo, type) {
    let items = [
      {
        name: "总排行榜",
        url: this.urlJoin(this.baseUrl, "rank/"),
      },
      {
        name: "月排行榜",
        url: this.urlJoin(this.baseUrl, "rank/monthvisit/"),
      },
      {
        name: "周排行榜",
        url: this.urlJoin(this.baseUrl, "rank/weekvisit/"),
      },
      {
        name: "收藏榜",
        url: this.urlJoin(this.baseUrl, "rank/goodnum/"),
      },
    ];
    if (!type) {
      return items.map((item) => ({
        id: item.url,
        type: item.name,
        list: [],
        page: pageNo,
        totalPage: 1,
        sourceId: "",
      }));
    }
    const item = items.find((item) => item.name === type);
    if (!item) return null;
    pageNo = pageNo || 1;

    const response = await this.fetch(item.url);
    const body = new DOMParser().parseFromString(await response.text(), "text/html");
    const elements = body.querySelectorAll(".hot_sale");
    const list = Array.from(elements.values()).map((element) => {
      const a = element.querySelector("a");
      const title = element.querySelector(".title")?.textContent;
      const author = element.querySelector(".author")?.textContent;
      const intro = element.querySelector(".review")?.textContent;
      return {
        id: a?.getAttribute("href"),
        title,
        author,
        intro,
        sourceId: "",
      };
    });

    return {
      list,
      page: pageNo,
      totalPage: 1,
    };
  }

  async search(keyword, pageNo) {
    const url = "https://m.22biqu.net/ss/";
    const form = new FormData();
    form.append("searchkey", keyword);
    form.append("submit", "");
    const response = await this.fetch(url, {
      method: "POST",
      body: form,
    });
    const body = new DOMParser().parseFromString(await response.text(), "text/html");

    const elements = body.querySelectorAll(".bookbox");
    const list = Array.from(elements.values()).map((element) => {
      const a = element.querySelector("a");
      const title = element.querySelector(".bookname")?.textContent || "无标题";
      const cover = element.querySelector(".bookimg img")?.getAttribute("src") || undefined;
      const author = element.querySelector(".author")?.textContent || undefined;
      const update = element.querySelector(".update")?.textContent || undefined;
      return {
        id: a?.getAttribute("href") || this.nanoid(),
        title,
        author,
        cover,
        page: pageNo,
        latestUpdate: update,
        sourceId: "",
      };
    });

    return {
      list,
      page: pageNo,
      totalPage: 1,
    };
  }

  async getBookDetail(item, pageNo) {
    const url = this.urlJoin(this.baseUrl, item.id);

    const response = await this.fetch(url);
    const body = new DOMParser().parseFromString(await response.text(), "text/html");
    const pageElements = body.querySelectorAll("#indexselect option");
    const chapters = Array.from({ length: pageElements.length }, () => []);
    await Promise.all(
      Array.from(pageElements.entries()).map(async ([index, element]) => {
        let url = this.urlJoin(this.baseUrl, element.getAttribute("value"));
        if (!url) return;
        let elementBody;
        if (index == 0) {
          elementBody = body;
        } else {
          const response = await this.fetch(url);
          elementBody = new DOMParser().parseFromString(await response.text(), "text/html");
        }
        const elements = elementBody.querySelectorAll(".directoryArea:not([id]) a");
        elements.forEach((element) => {
          const a = element;
          const title = a.textContent;
          const url = a.getAttribute("href");
          if (url) {
            const id = url.split("/").pop();
            chapters[index].push({
              id: id || this.nanoid(),
              title: title || "",
              url,
            });
          }
        });
      })
    );
    item.chapters = chapters.flat();

    return item;
  }

  async getContent(item, chapter) {
    let content = "";
    let nextPageUrl = chapter.url;
    while (nextPageUrl) {
      const response = await this.fetch(nextPageUrl);
      const body = new DOMParser().parseFromString(await response.text(), "text/html");
      const elements = body.querySelectorAll("#chaptercontent p:not([id])");
      elements.forEach((p) => {
        content += p.textContent + "\n";
      });
      const nextPageElement = body.querySelector("#pt_next");
      if (nextPageElement && nextPageElement.textContent == "下一页") {
        nextPageUrl = nextPageElement.getAttribute("href");
        if (nextPageUrl && !nextPageUrl.startsWith("http")) {
          nextPageUrl = this.urlJoin(this.baseUrl, nextPageUrl);
        }
      } else {
        nextPageUrl = null;
      }
    }
    return content;
  }
}

return BiQu;
