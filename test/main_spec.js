/* global describe, it */
/* eslint import/no-extraneous-dependencies: 0 */

"use strict";

import libpath from "path";
import { expect } from "chai";
import sinon from "sinon";
import Promise from "es6-promise";
import { transform } from "../lib";
import base64stub from "./fixtures/base64";

Promise.polyfill();

describe("webpcss", () => {
  it("not modify sample", () => {
    const input = ".test { backround: red; }";
    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("html tag", () => {
    const input = "html.test { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\nhtml.webp.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("border-radius css property", () => {
    const input = ".test { border-image: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { border-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it(".html classname", () => {
    const input = ".html.test { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .html.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("multiple selectors", () => {
    const input = ".test1, .test2 { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test1, .webp .test2 { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background-image with url", () => {
    const input = ".test { background-image: url(test.jpg); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url", () => {
    const input = ".test { background: url(test.jpeg); }";
    transform(input).then(res => {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url and params", () => {
    const input = ".test { background: transparent url(test.png) no-repeat; }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background: transparent url(test.webp) no-repeat; }").to.be.eql(res.css);
    });
  });

  it("default options background multiple urls", () => {
    const input =
      ".img_play_photo_multiple { background: url(number.png) 600px 10px no-repeat,\nurl(\"thingy.png\") 10px 10px no-repeat,\nurl('Paper-4.png');\n}";
    const output =
      input +
      "\n.webp .img_play_photo_multiple { background: url(number.webp) 600px 10px no-repeat,\nurl(thingy.webp) 10px 10px no-repeat,\nurl(Paper-4.webp); }";
    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options multiple mixed clasess", () => {
    const input = '.test1 { background: url("test1.jpeg"); }' + ".test2 { background-image: url('test2.png'); }";
    const output =
      '.test1 { background: url("test1.jpeg"); }' +
      ".test2 { background-image: url('test2.png'); }" +
      ".webp .test1 { background: url(test1.webp); }" +
      ".webp .test2 { background-image: url(test2.webp); }";

    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options background with gif", () => {
    const input = ".test { background: url(test.gif); }";

    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("default options background with gif and jpg", () => {
    const input = '.test { background: url(test.gif), url("test1.jpg"); }';
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background: url(test.gif), url(test1.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background data uri", () => {
    const input = ".test { background: url(" + base64stub.png + ") no-repeat; }";
    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options webpClass", () => {
    const input = ".test { background-image: url(test.png); }";
    return transform(input, { webpClass: ".webp1" }).then(res => {
      expect(input + "\n.webp1 .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass with example background-image", () => {
    const input = ".test { background-image: url(test.png); }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background-image: url(test.png); }" + "\n.webp .test { background-image: url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background", () => {
    const input = ".test { background: transparent url(test.png); }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background: transparent url(test.png); }" +
          "\n.webp .test { background: transparent url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl", () => {
    const input = ".test { background: transparent url(test.png); color: red; }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background: transparent url(test.png); }" +
          "\n.test { color: red; }" +
          "\n.webp .test { background: transparent url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl with @media query", () => {
    const input =
      "@media screen and (min-width: 500px) { .test { background: transparent url(test.png); color: red; } }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        "@media screen and (min-width: 500px) { .no-webp .test { background: transparent url(test.png); } .test { color: red; } } " +
          "@media screen and (min-width: 500px) { .webp .test { background: transparent url(test.webp); } }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options replace_from background with gif", () => {
    const input = ".test { background: url(test.gif); }";
    return transform(input, { replace_from: /\.gif/g }).then(res => {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to true background-image with remote url '//foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(//foo.com/test.jpg); }";
    return transform(input, {}).then(res => {
      expect(input + "\n.webp .test { background-image: url(//foo.com/test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to true background-image with remote url 'http://foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(http://foo.com/test.jpg); }";
    return transform(input, {}).then(res => {
      expect(input + "\n.webp .test { background-image: url(http://foo.com/test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to true background-image with remote url 'https://foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(https://foo.com/test.jpg); }";
    return transform(input, {}).then(res => {
      expect(input + "\n.webp .test { background-image: url(https://foo.com/test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to false background-image with remote url '//foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(//foo.com/test.jpg); }";
    return transform(input, { replaceRemoteImage: false }).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to false background-image with remote url 'http://foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(http://foo.com/test.jpg); }";
    return transform(input, { replaceRemoteImage: false }).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options replaceRemoteImage to false background-image with remote url 'https://foo.com/test.jpg'", () => {
    const input = ".test { background-image: url(https://foo.com/test.jpg); }";
    return transform(input, { replaceRemoteImage: false }).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options copyBackgroundSize to false with background-size rule", () => {
    const input = ".test { background-image: url(test.jpg); background-size: auto; }";
    return transform(input, {}).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options copyBackgroundSize to true with background-size rule", () => {
    const input = ".test { background-image: url(test.jpg); background-size: auto; }";
    return transform(input, { copyBackgroundSize: true }).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.webp); background-size: auto; }").to.be.eql(res.css);
    });
  });

  it("custom options replace_to background-image with url", () => {
    const input = ".test { background-image: url(test.jpg); }";
    return transform(input, { replace_to: ".other" }).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.other); }").to.be.eql(res.css);
    });
  });

  it("custom options replace_to function background-image with url", () => {
    const input = ".test { background-image: url(test.jpg); }";
    return transform(input, {
      replace_to(data) {
        expect(data.url).to.be.eql("test.jpg");
        return "hello.world?text=test";
      },
    }).then(res => {
      expect(input + "\n.webp .test { background-image: url(hello.world?text=test); }").to.be.eql(res.css);
    });
  });

  it("replace_to && replace_from", () => {
    const input = ".icon { color: #222; background-image: url('../images/icon.png'); }";
    return transform(input, { replace_to: ".$1.webp" }).then(res => {
      expect(input + "\n.webp .icon { background-image: url(../images/icon.png.webp); }").to.be.eql(res.css);
    });
  });

  it("check with @media-query", () => {
    const input = "@media all and (min-width:100px){ .test { background-image: url(test.jpg); } }";
    const output = input + " @media all and (min-width:100px){ .webp .test { background-image: url(test.webp); } }";
    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check with multiple @media-query", () => {
    const input =
      "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }";
    const output =
      "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }" +
      " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test { background-image: url(test.webp); } } }";
    transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check with multiple @media-query with other rule and decls", () => {
    const input =
      "@media all and (max-width:200px){" +
      " .garbage{ color: blue; } " +
      "@media all and (min-width:100px){" +
      " .test { " +
      "background-image: url(test.jpg); color: red; " +
      "} } }";
    const output =
      input +
      " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test { background-image: url(test.webp); } } }";
    transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check convert base64 png webp options background data uri", () => {
    const input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/png;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/png;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert base64 jpg webp options background data uri", () => {
    const input = ".test { background: " + base64stub.jpg_css + " no-repeat; }";
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/jpg;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/jpg;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert inline base64 svg and should do nothing", () => {
    const input = ".test { background: url(" + base64stub.svg_base64_uri + ") no-repeat; }";
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.be.eql(input);
    });
  });

  it("check convert inline content uri svg and should do nothing", () => {
    const input = ".test { background: url(" + base64stub.svg_content_uri + ") no-repeat; }";
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.be.eql(input);
    });
  });

  it("check convert base64 webp options background data uri and should do nothing", () => {
    const input = ".test { background: url(" + base64stub.webp_uri + ") no-repeat; }";
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.be.eql(input);
    });
  });

  it("check resolveUrlRelativeToFile and file size above minAddClassFileSize", () => {
    const input = ".test { background: url(avatar.png); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      const { css } = res;
      expect(input + "\n.webp .test { background: url(avatar.webp); }").to.be.eql(css);
    });
  });

  it("check resolveUrlRelativeToFile and file size below minAddClassFileSize", () => {
    const input = ".test { background: url(avatar.png); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1024 * 1024 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      const { css } = res;
      expect(input).to.be.eql(css);
    });
  });

  it("check resolveUrlRelativeToFile and file size above minAddClassFileSize with inline", () => {
    const input = ".test { background: url(avatar.png); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { inline: true, resolveUrlRelativeToFile: true, minAddClassFileSize: 1 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      const { css } = res;
      expect(css).to.contain(".test { background: url(avatar.png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check resolveUrlRelativeToFile and file size below minAddClassFileSize with inline", () => {
    const input = ".test { background: url(avatar.png); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1024 * 1024 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      const { css } = res;
      expect(input).to.be.eql(css);
    });
  });

  it("check localImgFileLocator with url of special grammar of other css preprocessor and file size above minAddClassFileSize", () => {
    const urlWithoutExt = "~/path/to/avatar";
    const url = urlWithoutExt + ".png";
    const input = ".test { background: url(" + url + "); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    const pathFrom = libpath.join(fixturesPath, "test.css");
    const expectedPath = libpath.resolve(pathFrom);
    const fileLocation = libpath.resolve(__dirname, "fixtures/avatar.png");
    const localImgFileLocator = sinon.spy(() => fileLocation);
    return transform(
      input,
      {
        // should be ignore
        resolveUrlRelativeToFile: true,
        // should be ignore
        img_root: "/path-not-exists",
        // should be ignore
        css_root: "/path-not-exists",
        localImgFileLocator,
        minAddClassFileSize: 1,
      },
      {
        from: pathFrom,
      }
    ).then(res => {
      const { css } = res;
      expect(
        localImgFileLocator.alwaysCalledWith({
          url,
          cssFilePath: expectedPath,
        })
      );
      expect(input + "\n.webp .test { background: url(" + urlWithoutExt + ".webp); }").to.be.eql(css);
    });
  });

  it("check localImgFileLocator with url of special grammar of other css preprocessor and file size below minAddClassFileSize", () => {
    const urlWithoutExt = "~/path/to/avatar";
    const url = urlWithoutExt + ".png";
    const input = ".test { background: url(" + url + "); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    const pathFrom = libpath.join(fixturesPath, "test.css");
    const expectedPath = libpath.resolve(pathFrom);
    const fileLocation = libpath.resolve(__dirname, "fixtures/avatar.png");
    const localImgFileLocator = sinon.spy(() => fileLocation);
    return transform(
      input,
      {
        // should be ignore
        resolveUrlRelativeToFile: true,
        // should be ignore
        img_root: "/path-not-exists",
        // should be ignore
        css_root: "/path-not-exists",
        localImgFileLocator,
        minAddClassFileSize: 1024 * 1024,
      },
      {
        from: pathFrom,
      }
    ).then(res => {
      const { css } = res;
      expect(
        localImgFileLocator.alwaysCalledWith({
          url,
          cssFilePath: expectedPath,
        })
      );
      expect(input).to.be.eql(css);
    });
  });

  it("check localImgFileLocator with url of special grammar of other css preprocessor and file size above minAddClassFileSize with inline", () => {
    const urlWithoutExt = "~/path/to/avatar";
    const url = urlWithoutExt + ".png";
    const input = ".test { background: url(" + url + "); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    const pathFrom = libpath.join(fixturesPath, "test.css");
    const expectedPath = libpath.resolve(pathFrom);
    const fileLocation = libpath.resolve(__dirname, "fixtures/avatar.png");
    const localImgFileLocator = sinon.spy(() => fileLocation);
    return transform(
      input,
      {
        // should be ignore
        resolveUrlRelativeToFile: true,
        // should be ignore
        img_root: "/path-not-exists",
        // should be ignore
        css_root: "/path-not-exists",
        localImgFileLocator,
        minAddClassFileSize: 1,
        inline: true,
      },
      {
        from: pathFrom,
      }
    ).then(res => {
      const { css } = res;
      expect(
        localImgFileLocator.alwaysCalledWith({
          url,
          cssFilePath: expectedPath,
        })
      );
      expect(css).to.contain(".test { background: url(" + urlWithoutExt + ".png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check localImgFileLocator with url of special grammar of other css preprocessor and file size below minAddClassFileSize with inline", () => {
    const urlWithoutExt = "~/path/to/avatar";
    const url = urlWithoutExt + ".png";
    const input = ".test { background: url(" + url + "); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    const pathFrom = libpath.join(fixturesPath, "test.css");
    const expectedPath = libpath.resolve(pathFrom);
    const fileLocation = libpath.resolve(__dirname, "fixtures/avatar.png");
    const localImgFileLocator = sinon.spy(() => fileLocation);
    return transform(
      input,
      {
        // should be ignore
        resolveUrlRelativeToFile: true,
        // should be ignore
        img_root: "/path-not-exists",
        // should be ignore
        css_root: "/path-not-exists",
        localImgFileLocator,
        minAddClassFileSize: 1024 * 1024,
        inline: true,
      },
      {
        from: pathFrom,
      }
    ).then(res => {
      const { css } = res;
      expect(
        localImgFileLocator.alwaysCalledWith({
          url,
          cssFilePath: expectedPath,
        })
      );
      expect(input).to.be.eql(css);
    });
  });

  it("check file size below minAddClassFileSize with base64 encoded content", () => {
    const input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input, { minAddClassFileSize: 1 }).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/png;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/png;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check file size above minAddClassFileSize with base64 encoded content", () => {
    const input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input, { minAddClassFileSize: 1024 * 1024 }).then(res => {
      const { css } = res;
      expect(input).to.be.eql(css);
    });
  });

  it("check inline property for png source", () => {
    const input = ".test { background: url(avatar.png); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.contain(".test { background: url(avatar.png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for jpg source", () => {
    const input = ".test { background: url(kitten.jpg); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.contain(".test { background: url(kitten.jpg); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for invalid path source", () => {
    const input = ".test { background: url(kitten1.jpg); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.eql(input);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    const input = ".test { background: url(kitten.jpg); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    const input = ".test { background: url(../fixtures/kitten.jpg); }";
    const fixturesPath = libpath.join(__dirname, "css");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    const input = ".test { background: url(/kitten.jpg); }";
    const fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, image_root: fixturesPath }).then(res => {
      const { css } = res;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("invalid css", () => {
    const input = `foo {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e")\`
    };`;
    return transform(input).then(res => {
      const { css } = res;
      expect(css).to.be.eql(input);
    });
  });
});
