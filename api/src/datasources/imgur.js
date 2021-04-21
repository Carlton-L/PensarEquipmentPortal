const { RESTDataSource } = require("apollo-datasource-rest");

class ImgurAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.imgur.com/3/";
  }

  willSendRequest(request) {
    request.headers.set("Content-Type", `application/x-www-form-urlencoded`);
    request.headers.set(
      "Authorization",
      `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    );
    console.log(request);
  }

  async uploadImageFromUrl(url) {
    const formData = `image=${url}&type=url`;
    return this.post("upload", formData);
  }
}

module.exports = ImgurAPI;
