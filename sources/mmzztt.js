
class MMZZTT extends PhotoExtension {
  id = "dhs78ds89sa"
  name = '美之图';
  version = '0.0.1';
  baseUrl = 'https://kkmzt.com/';
  inited = false;

  async getRecommendList(pageNo) {
    await this.initAction();
    pageNo ||= 1;
    let url = `${this.baseUrl}photo/page/${pageNo}/`;
    try {
      const response = await this.fetch(url, {
        headers: { 'Upgrade-Insecure-Requests': '1', Referer: this.baseUrl },
      });
      const element = new DOMParser().parseFromString(
        await response.text(),
        'text/html'
      );

      const list = element?.querySelector('main')?.querySelectorAll('.uk-card');

      const listArr = [];
      list?.forEach((item) => {
        const img = item.querySelector('img');
        const title = item.querySelector('.uk-card-body a')?.textContent;
        const cover = img?.getAttribute('data-src') || '';
        const datetime = item
          .querySelector('.uk-article-meta')
          .textContent?.trim();
        listArr.push({
          id: this.nanoid(),
          title,
          cover: this.toProxyUrl(cover) || '',
          datetime,
          url: item.querySelector('a').href,
        });
      });
      const pageItems = element?.querySelectorAll('.uk-pagination li');
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
    await this.initAction();
    pageNo ||= 1;
    let url = `${this.baseUrl}search/${keyword}/page/${pageNo}/`;
    try {
      const response = await this.fetch(url, {
        headers: { 'Upgrade-Insecure-Requests': '1', Referer: this.baseUrl },
      });
      const element = new DOMParser().parseFromString(
        await response.text(),
        'text/html'
      );
      const list = element?.querySelectorAll('.uk-article');
      const listArr = [];
      list?.forEach((item) => {
        const ukCard = item.querySelector('.uk-card');
        if (ukCard) {
          const img = ukCard.querySelector('img');
          const title = item.querySelector('h2 a').textContent;
          const cover = img?.getAttribute('data-src') || '';
          const datetime = item.querySelector('time')?.textContent?.trim();
          listArr.push({
            id: this.nanoid(),
            title,
            cover: this.toProxyUrl(cover) || '',
            datetime,
            url: item.querySelector('a').href,
          });
        }
      });
      const pageItems = element?.querySelectorAll('.uk-pagination li');
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
    await this.initAction();
    try {
      const firstResponse = await this.fetch(item.url, {
        headers: { 'Upgrade-Insecure-Requests': '1', Referer: this.baseUrl },
      });
      const element = new DOMParser().parseFromString(
        await firstResponse.text(),
        'text/html'
      );
      const img = element?.querySelector('.uk-container img');
      const imgSrc = img?.getAttribute('src');
      // 使用 / 进行分割，去除最后一个，然后重新拼接
      const imgPrefix = imgSrc?.split('/').slice(0, -1).join('/');

      const pid = item.url?.split('/').pop();
      const url = `https://kkmzt.com/app/post/p?id=${pid}`;

      const response = await this.fetch(url, {
        headers: {
          'Upgrade-Insecure-Requests': '1',
          Referer: 'https://kkmzt.com/',
        },
      });

      const encryptData = (await response.json()).data;
      const iv = Array.from({ length: 16 }, (_, i) =>
        ((parseInt(pid) % (i + 3)) % 9).toString()
      ).join('');
      const data = this.decryptPid(pid, encryptData, iv);

      return {
        item,
        photos: data.map((link) => this.toProxyUrl(this.urlJoin(imgPrefix, link))),
        page: pageNo || 1,
        totalPage: pageNo || 1,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  decryptPid(pid, encryptData, iv) {
    // 常量
    const sign = 'Bxk80i9Rt';
    // 生成签名 s
    const s = this.cryptoJs.MD5(pid + sign).toString();
    // 生成密钥 splitWord
    const key = this.cryptoJs
      .MD5(iv + s)
      .toString()
      .substring(8, 24);
    // 从 encryptData 中提取加密数据
    const data1 = encryptData.split(s)[1];
    // 将16进制字符串转换为Base64编码
    const base64 = this.cryptoJs.enc.Base64.stringify(
      this.cryptoJs.enc.Hex.parse(data1)
    );

    const decryptedData = this.cryptoJs.AES.decrypt(
      base64,
      this.cryptoJs.enc.Utf8.parse(key),
      {
        iv: this.cryptoJs.enc.Utf8.parse(iv),
      }
    )
      .toString(this.cryptoJs.enc.Utf8)
      .toString();

    // 解析 JSON 并返回
    // ["25n01sahng.jpg","25n02einga.jpg","25n03equae.jpg","25n04pahmi.jpg","25n05uesho.jpg","25n06rohxa.jpg","25n07maipi.jpg","25n08youfu.jpg","25n09majoh.jpg","25n10eixoo.jpg","25n11soopu.jpg","25n12coogh.jpg","25n13rahzi.jpg","25n14eethu.jpg","25n15oonum.jpg","25n16seeke.jpg","25n17edohy.jpg","25n18ohsom.jpg","25n19ohhas.jpg","25n20ahzei.jpg"]
    return JSON.parse(decryptedData.toString());
  }

  async initAction() {
    if (!this.inited) {
      await this.fetch(this.baseUrl, {
        headers: { 'Upgrade-Insecure-Requests': '1', Referer: this.baseUrl },
      });
      this.inited = true;
    }
  }
}
return MMZZTT
