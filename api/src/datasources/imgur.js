const { RESTDataSource } = require("apollo-datasource-rest");

class ImgurAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.imgur.com/3/";
  }

  willSendRequest(request) {
    request.mode = "no-cors";
    request.cache = "no-cache";
    console.log(request);
    console.log(request.headers);
  }

  async uploadImageFromUrl(url) {
    const formData = `image=${url}&album=${process.env.IMGUR_ALBUM_DELETE_HASH}&type=url`;
    return this.post(`upload`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
    });
  }

  async changeImageInfo(hash, title, description) {
    let formData;
    if (title && description) {
      formData += `title=${title}&description=${description}`;
    } else if (title) {
      formData += `title=${title}`;
    } else if (description) {
      formData += `description=${description}`;
    } else {
      return "No Change";
    }

    return this.post(`image/${hash}`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
    });
  }
}

module.exports = ImgurAPI;
