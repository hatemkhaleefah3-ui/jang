var zt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ca(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ut(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Wr = { exports: {} };
var Ma;
function Vi() {
  return Ma || (Ma = 1, (function(e, r) {
    (function(t) {
      e.exports = t();
    })(function() {
      return (function t(s, n, o) {
        function l(a, i) {
          if (!n[a]) {
            if (!s[a]) {
              var f = typeof Ut == "function" && Ut;
              if (!i && f) return f(a, !0);
              if (A) return A(a, !0);
              var y = new Error("Cannot find module '" + a + "'");
              throw y.code = "MODULE_NOT_FOUND", y;
            }
            var d = n[a] = { exports: {} };
            s[a][0].call(d.exports, function(m) {
              var u = s[a][1][m];
              return l(u || m);
            }, d, d.exports, t, s, n, o);
          }
          return n[a].exports;
        }
        for (var A = typeof Ut == "function" && Ut, c = 0; c < o.length; c++) l(o[c]);
        return l;
      })({ 1: [function(t, s, n) {
        var o = t("./utils"), l = t("./support"), A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        n.encode = function(c) {
          for (var a, i, f, y, d, m, u, g = [], p = 0, h = c.length, _ = h, E = o.getTypeOf(c) !== "string"; p < c.length; ) _ = h - p, f = E ? (a = c[p++], i = p < h ? c[p++] : 0, p < h ? c[p++] : 0) : (a = c.charCodeAt(p++), i = p < h ? c.charCodeAt(p++) : 0, p < h ? c.charCodeAt(p++) : 0), y = a >> 2, d = (3 & a) << 4 | i >> 4, m = 1 < _ ? (15 & i) << 2 | f >> 6 : 64, u = 2 < _ ? 63 & f : 64, g.push(A.charAt(y) + A.charAt(d) + A.charAt(m) + A.charAt(u));
          return g.join("");
        }, n.decode = function(c) {
          var a, i, f, y, d, m, u = 0, g = 0, p = "data:";
          if (c.substr(0, p.length) === p) throw new Error("Invalid base64 input, it looks like a data url.");
          var h, _ = 3 * (c = c.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (c.charAt(c.length - 1) === A.charAt(64) && _--, c.charAt(c.length - 2) === A.charAt(64) && _--, _ % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (h = l.uint8array ? new Uint8Array(0 | _) : new Array(0 | _); u < c.length; ) a = A.indexOf(c.charAt(u++)) << 2 | (y = A.indexOf(c.charAt(u++))) >> 4, i = (15 & y) << 4 | (d = A.indexOf(c.charAt(u++))) >> 2, f = (3 & d) << 6 | (m = A.indexOf(c.charAt(u++))), h[g++] = a, d !== 64 && (h[g++] = i), m !== 64 && (h[g++] = f);
          return h;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(t, s, n) {
        var o = t("./external"), l = t("./stream/DataWorker"), A = t("./stream/Crc32Probe"), c = t("./stream/DataLengthProbe");
        function a(i, f, y, d, m) {
          this.compressedSize = i, this.uncompressedSize = f, this.crc32 = y, this.compression = d, this.compressedContent = m;
        }
        a.prototype = { getContentWorker: function() {
          var i = new l(o.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new c("data_length")), f = this;
          return i.on("end", function() {
            if (this.streamInfo.data_length !== f.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), i;
        }, getCompressedWorker: function() {
          return new l(o.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, a.createWorkerFrom = function(i, f, y) {
          return i.pipe(new A()).pipe(new c("uncompressedSize")).pipe(f.compressWorker(y)).pipe(new c("compressedSize")).withStreamInfo("compression", f);
        }, s.exports = a;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(t, s, n) {
        var o = t("./stream/GenericWorker");
        n.STORE = { magic: "\0\0", compressWorker: function() {
          return new o("STORE compression");
        }, uncompressWorker: function() {
          return new o("STORE decompression");
        } }, n.DEFLATE = t("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(t, s, n) {
        var o = t("./utils"), l = (function() {
          for (var A, c = [], a = 0; a < 256; a++) {
            A = a;
            for (var i = 0; i < 8; i++) A = 1 & A ? 3988292384 ^ A >>> 1 : A >>> 1;
            c[a] = A;
          }
          return c;
        })();
        s.exports = function(A, c) {
          return A !== void 0 && A.length ? o.getTypeOf(A) !== "string" ? (function(a, i, f, y) {
            var d = l, m = y + f;
            a ^= -1;
            for (var u = y; u < m; u++) a = a >>> 8 ^ d[255 & (a ^ i[u])];
            return -1 ^ a;
          })(0 | c, A, A.length, 0) : (function(a, i, f, y) {
            var d = l, m = y + f;
            a ^= -1;
            for (var u = y; u < m; u++) a = a >>> 8 ^ d[255 & (a ^ i.charCodeAt(u))];
            return -1 ^ a;
          })(0 | c, A, A.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(t, s, n) {
        n.base64 = !1, n.binary = !1, n.dir = !1, n.createFolders = !0, n.date = null, n.compression = null, n.compressionOptions = null, n.comment = null, n.unixPermissions = null, n.dosPermissions = null;
      }, {}], 6: [function(t, s, n) {
        var o = null;
        o = typeof Promise < "u" ? Promise : t("lie"), s.exports = { Promise: o };
      }, { lie: 37 }], 7: [function(t, s, n) {
        var o = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", l = t("pako"), A = t("./utils"), c = t("./stream/GenericWorker"), a = o ? "uint8array" : "array";
        function i(f, y) {
          c.call(this, "FlateWorker/" + f), this._pako = null, this._pakoAction = f, this._pakoOptions = y, this.meta = {};
        }
        n.magic = "\b\0", A.inherits(i, c), i.prototype.processChunk = function(f) {
          this.meta = f.meta, this._pako === null && this._createPako(), this._pako.push(A.transformTo(a, f.data), !1);
        }, i.prototype.flush = function() {
          c.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
        }, i.prototype.cleanUp = function() {
          c.prototype.cleanUp.call(this), this._pako = null;
        }, i.prototype._createPako = function() {
          this._pako = new l[this._pakoAction]({ raw: !0, level: this._pakoOptions.level || -1 });
          var f = this;
          this._pako.onData = function(y) {
            f.push({ data: y, meta: f.meta });
          };
        }, n.compressWorker = function(f) {
          return new i("Deflate", f);
        }, n.uncompressWorker = function() {
          return new i("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(t, s, n) {
        function o(d, m) {
          var u, g = "";
          for (u = 0; u < m; u++) g += String.fromCharCode(255 & d), d >>>= 8;
          return g;
        }
        function l(d, m, u, g, p, h) {
          var _, E, v = d.file, C = d.compression, x = h !== a.utf8encode, P = A.transformTo("string", h(v.name)), R = A.transformTo("string", a.utf8encode(v.name)), k = v.comment, O = A.transformTo("string", h(k)), T = A.transformTo("string", a.utf8encode(k)), M = R.length !== v.name.length, w = T.length !== k.length, G = "", ee = "", Y = "", ne = v.dir, Z = v.date, Q = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          m && !u || (Q.crc32 = d.crc32, Q.compressedSize = d.compressedSize, Q.uncompressedSize = d.uncompressedSize);
          var D = 0;
          m && (D |= 8), x || !M && !w || (D |= 2048);
          var F = 0, $ = 0;
          ne && (F |= 16), p === "UNIX" ? ($ = 798, F |= (function(N, V) {
            var oe = N;
            return N || (oe = V ? 16893 : 33204), (65535 & oe) << 16;
          })(v.unixPermissions, ne)) : ($ = 20, F |= (function(N) {
            return 63 & (N || 0);
          })(v.dosPermissions)), _ = Z.getUTCHours(), _ <<= 6, _ |= Z.getUTCMinutes(), _ <<= 5, _ |= Z.getUTCSeconds() / 2, E = Z.getUTCFullYear() - 1980, E <<= 4, E |= Z.getUTCMonth() + 1, E <<= 5, E |= Z.getUTCDate(), M && (ee = o(1, 1) + o(i(P), 4) + R, G += "up" + o(ee.length, 2) + ee), w && (Y = o(1, 1) + o(i(O), 4) + T, G += "uc" + o(Y.length, 2) + Y);
          var L = "";
          return L += `
\0`, L += o(D, 2), L += C.magic, L += o(_, 2), L += o(E, 2), L += o(Q.crc32, 4), L += o(Q.compressedSize, 4), L += o(Q.uncompressedSize, 4), L += o(P.length, 2), L += o(G.length, 2), { fileRecord: f.LOCAL_FILE_HEADER + L + P + G, dirRecord: f.CENTRAL_FILE_HEADER + o($, 2) + L + o(O.length, 2) + "\0\0\0\0" + o(F, 4) + o(g, 4) + P + G + O };
        }
        var A = t("../utils"), c = t("../stream/GenericWorker"), a = t("../utf8"), i = t("../crc32"), f = t("../signature");
        function y(d, m, u, g) {
          c.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = m, this.zipPlatform = u, this.encodeFileName = g, this.streamFiles = d, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        A.inherits(y, c), y.prototype.push = function(d) {
          var m = d.meta.percent || 0, u = this.entriesCount, g = this._sources.length;
          this.accumulate ? this.contentBuffer.push(d) : (this.bytesWritten += d.data.length, c.prototype.push.call(this, { data: d.data, meta: { currentFile: this.currentFile, percent: u ? (m + 100 * (u - g - 1)) / u : 100 } }));
        }, y.prototype.openedSource = function(d) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = d.file.name;
          var m = this.streamFiles && !d.file.dir;
          if (m) {
            var u = l(d, m, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: u.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = !0;
        }, y.prototype.closedSource = function(d) {
          this.accumulate = !1;
          var m = this.streamFiles && !d.file.dir, u = l(d, m, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(u.dirRecord), m) this.push({ data: (function(g) {
            return f.DATA_DESCRIPTOR + o(g.crc32, 4) + o(g.compressedSize, 4) + o(g.uncompressedSize, 4);
          })(d), meta: { percent: 100 } });
          else for (this.push({ data: u.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, y.prototype.flush = function() {
          for (var d = this.bytesWritten, m = 0; m < this.dirRecords.length; m++) this.push({ data: this.dirRecords[m], meta: { percent: 100 } });
          var u = this.bytesWritten - d, g = (function(p, h, _, E, v) {
            var C = A.transformTo("string", v(E));
            return f.CENTRAL_DIRECTORY_END + "\0\0\0\0" + o(p, 2) + o(p, 2) + o(h, 4) + o(_, 4) + o(C.length, 2) + C;
          })(this.dirRecords.length, u, d, this.zipComment, this.encodeFileName);
          this.push({ data: g, meta: { percent: 100 } });
        }, y.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, y.prototype.registerPrevious = function(d) {
          this._sources.push(d);
          var m = this;
          return d.on("data", function(u) {
            m.processChunk(u);
          }), d.on("end", function() {
            m.closedSource(m.previous.streamInfo), m._sources.length ? m.prepareNextSource() : m.end();
          }), d.on("error", function(u) {
            m.error(u);
          }), this;
        }, y.prototype.resume = function() {
          return !!c.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0));
        }, y.prototype.error = function(d) {
          var m = this._sources;
          if (!c.prototype.error.call(this, d)) return !1;
          for (var u = 0; u < m.length; u++) try {
            m[u].error(d);
          } catch {
          }
          return !0;
        }, y.prototype.lock = function() {
          c.prototype.lock.call(this);
          for (var d = this._sources, m = 0; m < d.length; m++) d[m].lock();
        }, s.exports = y;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(t, s, n) {
        var o = t("../compressions"), l = t("./ZipFileWorker");
        n.generateWorker = function(A, c, a) {
          var i = new l(c.streamFiles, a, c.platform, c.encodeFileName), f = 0;
          try {
            A.forEach(function(y, d) {
              f++;
              var m = (function(h, _) {
                var E = h || _, v = o[E];
                if (!v) throw new Error(E + " is not a valid compression method !");
                return v;
              })(d.options.compression, c.compression), u = d.options.compressionOptions || c.compressionOptions || {}, g = d.dir, p = d.date;
              d._compressWorker(m, u).withStreamInfo("file", { name: y, dir: g, date: p, comment: d.comment || "", unixPermissions: d.unixPermissions, dosPermissions: d.dosPermissions }).pipe(i);
            }), i.entriesCount = f;
          } catch (y) {
            i.error(y);
          }
          return i;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(t, s, n) {
        function o() {
          if (!(this instanceof o)) return new o();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var l = new o();
            for (var A in this) typeof this[A] != "function" && (l[A] = this[A]);
            return l;
          };
        }
        (o.prototype = t("./object")).loadAsync = t("./load"), o.support = t("./support"), o.defaults = t("./defaults"), o.version = "3.10.1", o.loadAsync = function(l, A) {
          return new o().loadAsync(l, A);
        }, o.external = t("./external"), s.exports = o;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(t, s, n) {
        var o = t("./utils"), l = t("./external"), A = t("./utf8"), c = t("./zipEntries"), a = t("./stream/Crc32Probe"), i = t("./nodejsUtils");
        function f(y) {
          return new l.Promise(function(d, m) {
            var u = y.decompressed.getContentWorker().pipe(new a());
            u.on("error", function(g) {
              m(g);
            }).on("end", function() {
              u.streamInfo.crc32 !== y.decompressed.crc32 ? m(new Error("Corrupted zip : CRC32 mismatch")) : d();
            }).resume();
          });
        }
        s.exports = function(y, d) {
          var m = this;
          return d = o.extend(d || {}, { base64: !1, checkCRC32: !1, optimizedBinaryString: !1, createFolders: !1, decodeFileName: A.utf8decode }), i.isNode && i.isStream(y) ? l.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : o.prepareContent("the loaded zip file", y, !0, d.optimizedBinaryString, d.base64).then(function(u) {
            var g = new c(d);
            return g.load(u), g;
          }).then(function(u) {
            var g = [l.Promise.resolve(u)], p = u.files;
            if (d.checkCRC32) for (var h = 0; h < p.length; h++) g.push(f(p[h]));
            return l.Promise.all(g);
          }).then(function(u) {
            for (var g = u.shift(), p = g.files, h = 0; h < p.length; h++) {
              var _ = p[h], E = _.fileNameStr, v = o.resolve(_.fileNameStr);
              m.file(v, _.decompressed, { binary: !0, optimizedBinaryString: !0, date: _.date, dir: _.dir, comment: _.fileCommentStr.length ? _.fileCommentStr : null, unixPermissions: _.unixPermissions, dosPermissions: _.dosPermissions, createFolders: d.createFolders }), _.dir || (m.file(v).unsafeOriginalName = E);
            }
            return g.zipComment.length && (m.comment = g.zipComment), m;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(t, s, n) {
        var o = t("../utils"), l = t("../stream/GenericWorker");
        function A(c, a) {
          l.call(this, "Nodejs stream input adapter for " + c), this._upstreamEnded = !1, this._bindStream(a);
        }
        o.inherits(A, l), A.prototype._bindStream = function(c) {
          var a = this;
          (this._stream = c).pause(), c.on("data", function(i) {
            a.push({ data: i, meta: { percent: 0 } });
          }).on("error", function(i) {
            a.isPaused ? this.generatedError = i : a.error(i);
          }).on("end", function() {
            a.isPaused ? a._upstreamEnded = !0 : a.end();
          });
        }, A.prototype.pause = function() {
          return !!l.prototype.pause.call(this) && (this._stream.pause(), !0);
        }, A.prototype.resume = function() {
          return !!l.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0);
        }, s.exports = A;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(t, s, n) {
        var o = t("readable-stream").Readable;
        function l(A, c, a) {
          o.call(this, c), this._helper = A;
          var i = this;
          A.on("data", function(f, y) {
            i.push(f) || i._helper.pause(), a && a(y);
          }).on("error", function(f) {
            i.emit("error", f);
          }).on("end", function() {
            i.push(null);
          });
        }
        t("../utils").inherits(l, o), l.prototype._read = function() {
          this._helper.resume();
        }, s.exports = l;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(t, s, n) {
        s.exports = { isNode: typeof Buffer < "u", newBufferFrom: function(o, l) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(o, l);
          if (typeof o == "number") throw new Error('The "data" argument must not be a number');
          return new Buffer(o, l);
        }, allocBuffer: function(o) {
          if (Buffer.alloc) return Buffer.alloc(o);
          var l = new Buffer(o);
          return l.fill(0), l;
        }, isBuffer: function(o) {
          return Buffer.isBuffer(o);
        }, isStream: function(o) {
          return o && typeof o.on == "function" && typeof o.pause == "function" && typeof o.resume == "function";
        } };
      }, {}], 15: [function(t, s, n) {
        function o(v, C, x) {
          var P, R = A.getTypeOf(C), k = A.extend(x || {}, i);
          k.date = k.date || /* @__PURE__ */ new Date(), k.compression !== null && (k.compression = k.compression.toUpperCase()), typeof k.unixPermissions == "string" && (k.unixPermissions = parseInt(k.unixPermissions, 8)), k.unixPermissions && 16384 & k.unixPermissions && (k.dir = !0), k.dosPermissions && 16 & k.dosPermissions && (k.dir = !0), k.dir && (v = p(v)), k.createFolders && (P = g(v)) && h.call(this, P, !0);
          var O = R === "string" && k.binary === !1 && k.base64 === !1;
          x && x.binary !== void 0 || (k.binary = !O), (C instanceof f && C.uncompressedSize === 0 || k.dir || !C || C.length === 0) && (k.base64 = !1, k.binary = !0, C = "", k.compression = "STORE", R = "string");
          var T = null;
          T = C instanceof f || C instanceof c ? C : m.isNode && m.isStream(C) ? new u(v, C) : A.prepareContent(v, C, k.binary, k.optimizedBinaryString, k.base64);
          var M = new y(v, T, k);
          this.files[v] = M;
        }
        var l = t("./utf8"), A = t("./utils"), c = t("./stream/GenericWorker"), a = t("./stream/StreamHelper"), i = t("./defaults"), f = t("./compressedObject"), y = t("./zipObject"), d = t("./generate"), m = t("./nodejsUtils"), u = t("./nodejs/NodejsStreamInputAdapter"), g = function(v) {
          v.slice(-1) === "/" && (v = v.substring(0, v.length - 1));
          var C = v.lastIndexOf("/");
          return 0 < C ? v.substring(0, C) : "";
        }, p = function(v) {
          return v.slice(-1) !== "/" && (v += "/"), v;
        }, h = function(v, C) {
          return C = C !== void 0 ? C : i.createFolders, v = p(v), this.files[v] || o.call(this, v, null, { dir: !0, createFolders: C }), this.files[v];
        };
        function _(v) {
          return Object.prototype.toString.call(v) === "[object RegExp]";
        }
        var E = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(v) {
          var C, x, P;
          for (C in this.files) P = this.files[C], (x = C.slice(this.root.length, C.length)) && C.slice(0, this.root.length) === this.root && v(x, P);
        }, filter: function(v) {
          var C = [];
          return this.forEach(function(x, P) {
            v(x, P) && C.push(P);
          }), C;
        }, file: function(v, C, x) {
          if (arguments.length !== 1) return v = this.root + v, o.call(this, v, C, x), this;
          if (_(v)) {
            var P = v;
            return this.filter(function(k, O) {
              return !O.dir && P.test(k);
            });
          }
          var R = this.files[this.root + v];
          return R && !R.dir ? R : null;
        }, folder: function(v) {
          if (!v) return this;
          if (_(v)) return this.filter(function(R, k) {
            return k.dir && v.test(R);
          });
          var C = this.root + v, x = h.call(this, C), P = this.clone();
          return P.root = x.name, P;
        }, remove: function(v) {
          v = this.root + v;
          var C = this.files[v];
          if (C || (v.slice(-1) !== "/" && (v += "/"), C = this.files[v]), C && !C.dir) delete this.files[v];
          else for (var x = this.filter(function(R, k) {
            return k.name.slice(0, v.length) === v;
          }), P = 0; P < x.length; P++) delete this.files[x[P].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(v) {
          var C, x = {};
          try {
            if ((x = A.extend(v || {}, { streamFiles: !1, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: l.utf8encode })).type = x.type.toLowerCase(), x.compression = x.compression.toUpperCase(), x.type === "binarystring" && (x.type = "string"), !x.type) throw new Error("No output type specified.");
            A.checkSupport(x.type), x.platform !== "darwin" && x.platform !== "freebsd" && x.platform !== "linux" && x.platform !== "sunos" || (x.platform = "UNIX"), x.platform === "win32" && (x.platform = "DOS");
            var P = x.comment || this.comment || "";
            C = d.generateWorker(this, x, P);
          } catch (R) {
            (C = new c("error")).error(R);
          }
          return new a(C, x.type || "string", x.mimeType);
        }, generateAsync: function(v, C) {
          return this.generateInternalStream(v).accumulate(C);
        }, generateNodeStream: function(v, C) {
          return (v = v || {}).type || (v.type = "nodebuffer"), this.generateInternalStream(v).toNodejsStream(C);
        } };
        s.exports = E;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(t, s, n) {
        s.exports = t("stream");
      }, { stream: void 0 }], 17: [function(t, s, n) {
        var o = t("./DataReader");
        function l(A) {
          o.call(this, A);
          for (var c = 0; c < this.data.length; c++) A[c] = 255 & A[c];
        }
        t("../utils").inherits(l, o), l.prototype.byteAt = function(A) {
          return this.data[this.zero + A];
        }, l.prototype.lastIndexOfSignature = function(A) {
          for (var c = A.charCodeAt(0), a = A.charCodeAt(1), i = A.charCodeAt(2), f = A.charCodeAt(3), y = this.length - 4; 0 <= y; --y) if (this.data[y] === c && this.data[y + 1] === a && this.data[y + 2] === i && this.data[y + 3] === f) return y - this.zero;
          return -1;
        }, l.prototype.readAndCheckSignature = function(A) {
          var c = A.charCodeAt(0), a = A.charCodeAt(1), i = A.charCodeAt(2), f = A.charCodeAt(3), y = this.readData(4);
          return c === y[0] && a === y[1] && i === y[2] && f === y[3];
        }, l.prototype.readData = function(A) {
          if (this.checkOffset(A), A === 0) return [];
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, s.exports = l;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(t, s, n) {
        var o = t("../utils");
        function l(A) {
          this.data = A, this.length = A.length, this.index = 0, this.zero = 0;
        }
        l.prototype = { checkOffset: function(A) {
          this.checkIndex(this.index + A);
        }, checkIndex: function(A) {
          if (this.length < this.zero + A || A < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + A + "). Corrupted zip ?");
        }, setIndex: function(A) {
          this.checkIndex(A), this.index = A;
        }, skip: function(A) {
          this.setIndex(this.index + A);
        }, byteAt: function() {
        }, readInt: function(A) {
          var c, a = 0;
          for (this.checkOffset(A), c = this.index + A - 1; c >= this.index; c--) a = (a << 8) + this.byteAt(c);
          return this.index += A, a;
        }, readString: function(A) {
          return o.transformTo("string", this.readData(A));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var A = this.readInt(4);
          return new Date(Date.UTC(1980 + (A >> 25 & 127), (A >> 21 & 15) - 1, A >> 16 & 31, A >> 11 & 31, A >> 5 & 63, (31 & A) << 1));
        } }, s.exports = l;
      }, { "../utils": 32 }], 19: [function(t, s, n) {
        var o = t("./Uint8ArrayReader");
        function l(A) {
          o.call(this, A);
        }
        t("../utils").inherits(l, o), l.prototype.readData = function(A) {
          this.checkOffset(A);
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, s.exports = l;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(t, s, n) {
        var o = t("./DataReader");
        function l(A) {
          o.call(this, A);
        }
        t("../utils").inherits(l, o), l.prototype.byteAt = function(A) {
          return this.data.charCodeAt(this.zero + A);
        }, l.prototype.lastIndexOfSignature = function(A) {
          return this.data.lastIndexOf(A) - this.zero;
        }, l.prototype.readAndCheckSignature = function(A) {
          return A === this.readData(4);
        }, l.prototype.readData = function(A) {
          this.checkOffset(A);
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, s.exports = l;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(t, s, n) {
        var o = t("./ArrayReader");
        function l(A) {
          o.call(this, A);
        }
        t("../utils").inherits(l, o), l.prototype.readData = function(A) {
          if (this.checkOffset(A), A === 0) return new Uint8Array(0);
          var c = this.data.subarray(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, s.exports = l;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(t, s, n) {
        var o = t("../utils"), l = t("../support"), A = t("./ArrayReader"), c = t("./StringReader"), a = t("./NodeBufferReader"), i = t("./Uint8ArrayReader");
        s.exports = function(f) {
          var y = o.getTypeOf(f);
          return o.checkSupport(y), y !== "string" || l.uint8array ? y === "nodebuffer" ? new a(f) : l.uint8array ? new i(o.transformTo("uint8array", f)) : new A(o.transformTo("array", f)) : new c(f);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(t, s, n) {
        n.LOCAL_FILE_HEADER = "PK", n.CENTRAL_FILE_HEADER = "PK", n.CENTRAL_DIRECTORY_END = "PK", n.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", n.ZIP64_CENTRAL_DIRECTORY_END = "PK", n.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(t, s, n) {
        var o = t("./GenericWorker"), l = t("../utils");
        function A(c) {
          o.call(this, "ConvertWorker to " + c), this.destType = c;
        }
        l.inherits(A, o), A.prototype.processChunk = function(c) {
          this.push({ data: l.transformTo(this.destType, c.data), meta: c.meta });
        }, s.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(t, s, n) {
        var o = t("./GenericWorker"), l = t("../crc32");
        function A() {
          o.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        t("../utils").inherits(A, o), A.prototype.processChunk = function(c) {
          this.streamInfo.crc32 = l(c.data, this.streamInfo.crc32 || 0), this.push(c);
        }, s.exports = A;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(t, s, n) {
        var o = t("../utils"), l = t("./GenericWorker");
        function A(c) {
          l.call(this, "DataLengthProbe for " + c), this.propName = c, this.withStreamInfo(c, 0);
        }
        o.inherits(A, l), A.prototype.processChunk = function(c) {
          if (c) {
            var a = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = a + c.data.length;
          }
          l.prototype.processChunk.call(this, c);
        }, s.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(t, s, n) {
        var o = t("../utils"), l = t("./GenericWorker");
        function A(c) {
          l.call(this, "DataWorker");
          var a = this;
          this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, c.then(function(i) {
            a.dataIsReady = !0, a.data = i, a.max = i && i.length || 0, a.type = o.getTypeOf(i), a.isPaused || a._tickAndRepeat();
          }, function(i) {
            a.error(i);
          });
        }
        o.inherits(A, l), A.prototype.cleanUp = function() {
          l.prototype.cleanUp.call(this), this.data = null;
        }, A.prototype.resume = function() {
          return !!l.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, o.delay(this._tickAndRepeat, [], this)), !0);
        }, A.prototype._tickAndRepeat = function() {
          this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (o.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
        }, A.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return !1;
          var c = null, a = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              c = this.data.substring(this.index, a);
              break;
            case "uint8array":
              c = this.data.subarray(this.index, a);
              break;
            case "array":
            case "nodebuffer":
              c = this.data.slice(this.index, a);
          }
          return this.index = a, this.push({ data: c, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, s.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(t, s, n) {
        function o(l) {
          this.name = l || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        o.prototype = { push: function(l) {
          this.emit("data", l);
        }, end: function() {
          if (this.isFinished) return !1;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = !0;
          } catch (l) {
            this.emit("error", l);
          }
          return !0;
        }, error: function(l) {
          return !this.isFinished && (this.isPaused ? this.generatedError = l : (this.isFinished = !0, this.emit("error", l), this.previous && this.previous.error(l), this.cleanUp()), !0);
        }, on: function(l, A) {
          return this._listeners[l].push(A), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(l, A) {
          if (this._listeners[l]) for (var c = 0; c < this._listeners[l].length; c++) this._listeners[l][c].call(this, A);
        }, pipe: function(l) {
          return l.registerPrevious(this);
        }, registerPrevious: function(l) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = l.streamInfo, this.mergeStreamInfo(), this.previous = l;
          var A = this;
          return l.on("data", function(c) {
            A.processChunk(c);
          }), l.on("end", function() {
            A.end();
          }), l.on("error", function(c) {
            A.error(c);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = !0, this.previous && this.previous.pause(), !0);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return !1;
          var l = this.isPaused = !1;
          return this.generatedError && (this.error(this.generatedError), l = !0), this.previous && this.previous.resume(), !l;
        }, flush: function() {
        }, processChunk: function(l) {
          this.push(l);
        }, withStreamInfo: function(l, A) {
          return this.extraStreamInfo[l] = A, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var l in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, l) && (this.streamInfo[l] = this.extraStreamInfo[l]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = !0, this.previous && this.previous.lock();
        }, toString: function() {
          var l = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + l : l;
        } }, s.exports = o;
      }, {}], 29: [function(t, s, n) {
        var o = t("../utils"), l = t("./ConvertWorker"), A = t("./GenericWorker"), c = t("../base64"), a = t("../support"), i = t("../external"), f = null;
        if (a.nodestream) try {
          f = t("../nodejs/NodejsStreamOutputAdapter");
        } catch {
        }
        function y(m, u) {
          return new i.Promise(function(g, p) {
            var h = [], _ = m._internalType, E = m._outputType, v = m._mimeType;
            m.on("data", function(C, x) {
              h.push(C), u && u(x);
            }).on("error", function(C) {
              h = [], p(C);
            }).on("end", function() {
              try {
                var C = (function(x, P, R) {
                  switch (x) {
                    case "blob":
                      return o.newBlob(o.transformTo("arraybuffer", P), R);
                    case "base64":
                      return c.encode(P);
                    default:
                      return o.transformTo(x, P);
                  }
                })(E, (function(x, P) {
                  var R, k = 0, O = null, T = 0;
                  for (R = 0; R < P.length; R++) T += P[R].length;
                  switch (x) {
                    case "string":
                      return P.join("");
                    case "array":
                      return Array.prototype.concat.apply([], P);
                    case "uint8array":
                      for (O = new Uint8Array(T), R = 0; R < P.length; R++) O.set(P[R], k), k += P[R].length;
                      return O;
                    case "nodebuffer":
                      return Buffer.concat(P);
                    default:
                      throw new Error("concat : unsupported type '" + x + "'");
                  }
                })(_, h), v);
                g(C);
              } catch (x) {
                p(x);
              }
              h = [];
            }).resume();
          });
        }
        function d(m, u, g) {
          var p = u;
          switch (u) {
            case "blob":
            case "arraybuffer":
              p = "uint8array";
              break;
            case "base64":
              p = "string";
          }
          try {
            this._internalType = p, this._outputType = u, this._mimeType = g, o.checkSupport(p), this._worker = m.pipe(new l(p)), m.lock();
          } catch (h) {
            this._worker = new A("error"), this._worker.error(h);
          }
        }
        d.prototype = { accumulate: function(m) {
          return y(this, m);
        }, on: function(m, u) {
          var g = this;
          return m === "data" ? this._worker.on(m, function(p) {
            u.call(g, p.data, p.meta);
          }) : this._worker.on(m, function() {
            o.delay(u, arguments, g);
          }), this;
        }, resume: function() {
          return o.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(m) {
          if (o.checkSupport("nodestream"), this._outputType !== "nodebuffer") throw new Error(this._outputType + " is not supported by this method");
          return new f(this, { objectMode: this._outputType !== "nodebuffer" }, m);
        } }, s.exports = d;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(t, s, n) {
        if (n.base64 = !0, n.array = !0, n.string = !0, n.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", n.nodebuffer = typeof Buffer < "u", n.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u") n.blob = !1;
        else {
          var o = new ArrayBuffer(0);
          try {
            n.blob = new Blob([o], { type: "application/zip" }).size === 0;
          } catch {
            try {
              var l = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              l.append(o), n.blob = l.getBlob("application/zip").size === 0;
            } catch {
              n.blob = !1;
            }
          }
        }
        try {
          n.nodestream = !!t("readable-stream").Readable;
        } catch {
          n.nodestream = !1;
        }
      }, { "readable-stream": 16 }], 31: [function(t, s, n) {
        for (var o = t("./utils"), l = t("./support"), A = t("./nodejsUtils"), c = t("./stream/GenericWorker"), a = new Array(256), i = 0; i < 256; i++) a[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        a[254] = a[254] = 1;
        function f() {
          c.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function y() {
          c.call(this, "utf-8 encode");
        }
        n.utf8encode = function(d) {
          return l.nodebuffer ? A.newBufferFrom(d, "utf-8") : (function(m) {
            var u, g, p, h, _, E = m.length, v = 0;
            for (h = 0; h < E; h++) (64512 & (g = m.charCodeAt(h))) == 55296 && h + 1 < E && (64512 & (p = m.charCodeAt(h + 1))) == 56320 && (g = 65536 + (g - 55296 << 10) + (p - 56320), h++), v += g < 128 ? 1 : g < 2048 ? 2 : g < 65536 ? 3 : 4;
            for (u = l.uint8array ? new Uint8Array(v) : new Array(v), h = _ = 0; _ < v; h++) (64512 & (g = m.charCodeAt(h))) == 55296 && h + 1 < E && (64512 & (p = m.charCodeAt(h + 1))) == 56320 && (g = 65536 + (g - 55296 << 10) + (p - 56320), h++), g < 128 ? u[_++] = g : (g < 2048 ? u[_++] = 192 | g >>> 6 : (g < 65536 ? u[_++] = 224 | g >>> 12 : (u[_++] = 240 | g >>> 18, u[_++] = 128 | g >>> 12 & 63), u[_++] = 128 | g >>> 6 & 63), u[_++] = 128 | 63 & g);
            return u;
          })(d);
        }, n.utf8decode = function(d) {
          return l.nodebuffer ? o.transformTo("nodebuffer", d).toString("utf-8") : (function(m) {
            var u, g, p, h, _ = m.length, E = new Array(2 * _);
            for (u = g = 0; u < _; ) if ((p = m[u++]) < 128) E[g++] = p;
            else if (4 < (h = a[p])) E[g++] = 65533, u += h - 1;
            else {
              for (p &= h === 2 ? 31 : h === 3 ? 15 : 7; 1 < h && u < _; ) p = p << 6 | 63 & m[u++], h--;
              1 < h ? E[g++] = 65533 : p < 65536 ? E[g++] = p : (p -= 65536, E[g++] = 55296 | p >> 10 & 1023, E[g++] = 56320 | 1023 & p);
            }
            return E.length !== g && (E.subarray ? E = E.subarray(0, g) : E.length = g), o.applyFromCharCode(E);
          })(d = o.transformTo(l.uint8array ? "uint8array" : "array", d));
        }, o.inherits(f, c), f.prototype.processChunk = function(d) {
          var m = o.transformTo(l.uint8array ? "uint8array" : "array", d.data);
          if (this.leftOver && this.leftOver.length) {
            if (l.uint8array) {
              var u = m;
              (m = new Uint8Array(u.length + this.leftOver.length)).set(this.leftOver, 0), m.set(u, this.leftOver.length);
            } else m = this.leftOver.concat(m);
            this.leftOver = null;
          }
          var g = (function(h, _) {
            var E;
            for ((_ = _ || h.length) > h.length && (_ = h.length), E = _ - 1; 0 <= E && (192 & h[E]) == 128; ) E--;
            return E < 0 || E === 0 ? _ : E + a[h[E]] > _ ? E : _;
          })(m), p = m;
          g !== m.length && (l.uint8array ? (p = m.subarray(0, g), this.leftOver = m.subarray(g, m.length)) : (p = m.slice(0, g), this.leftOver = m.slice(g, m.length))), this.push({ data: n.utf8decode(p), meta: d.meta });
        }, f.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: n.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, n.Utf8DecodeWorker = f, o.inherits(y, c), y.prototype.processChunk = function(d) {
          this.push({ data: n.utf8encode(d.data), meta: d.meta });
        }, n.Utf8EncodeWorker = y;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(t, s, n) {
        var o = t("./support"), l = t("./base64"), A = t("./nodejsUtils"), c = t("./external");
        function a(u) {
          return u;
        }
        function i(u, g) {
          for (var p = 0; p < u.length; ++p) g[p] = 255 & u.charCodeAt(p);
          return g;
        }
        t("setimmediate"), n.newBlob = function(u, g) {
          n.checkSupport("blob");
          try {
            return new Blob([u], { type: g });
          } catch {
            try {
              var p = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return p.append(u), p.getBlob(g);
            } catch {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var f = { stringifyByChunk: function(u, g, p) {
          var h = [], _ = 0, E = u.length;
          if (E <= p) return String.fromCharCode.apply(null, u);
          for (; _ < E; ) g === "array" || g === "nodebuffer" ? h.push(String.fromCharCode.apply(null, u.slice(_, Math.min(_ + p, E)))) : h.push(String.fromCharCode.apply(null, u.subarray(_, Math.min(_ + p, E)))), _ += p;
          return h.join("");
        }, stringifyByChar: function(u) {
          for (var g = "", p = 0; p < u.length; p++) g += String.fromCharCode(u[p]);
          return g;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch {
            return !1;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && String.fromCharCode.apply(null, A.allocBuffer(1)).length === 1;
          } catch {
            return !1;
          }
        })() } };
        function y(u) {
          var g = 65536, p = n.getTypeOf(u), h = !0;
          if (p === "uint8array" ? h = f.applyCanBeUsed.uint8array : p === "nodebuffer" && (h = f.applyCanBeUsed.nodebuffer), h) for (; 1 < g; ) try {
            return f.stringifyByChunk(u, p, g);
          } catch {
            g = Math.floor(g / 2);
          }
          return f.stringifyByChar(u);
        }
        function d(u, g) {
          for (var p = 0; p < u.length; p++) g[p] = u[p];
          return g;
        }
        n.applyFromCharCode = y;
        var m = {};
        m.string = { string: a, array: function(u) {
          return i(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return m.string.uint8array(u).buffer;
        }, uint8array: function(u) {
          return i(u, new Uint8Array(u.length));
        }, nodebuffer: function(u) {
          return i(u, A.allocBuffer(u.length));
        } }, m.array = { string: y, array: a, arraybuffer: function(u) {
          return new Uint8Array(u).buffer;
        }, uint8array: function(u) {
          return new Uint8Array(u);
        }, nodebuffer: function(u) {
          return A.newBufferFrom(u);
        } }, m.arraybuffer = { string: function(u) {
          return y(new Uint8Array(u));
        }, array: function(u) {
          return d(new Uint8Array(u), new Array(u.byteLength));
        }, arraybuffer: a, uint8array: function(u) {
          return new Uint8Array(u);
        }, nodebuffer: function(u) {
          return A.newBufferFrom(new Uint8Array(u));
        } }, m.uint8array = { string: y, array: function(u) {
          return d(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return u.buffer;
        }, uint8array: a, nodebuffer: function(u) {
          return A.newBufferFrom(u);
        } }, m.nodebuffer = { string: y, array: function(u) {
          return d(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return m.nodebuffer.uint8array(u).buffer;
        }, uint8array: function(u) {
          return d(u, new Uint8Array(u.length));
        }, nodebuffer: a }, n.transformTo = function(u, g) {
          if (g = g || "", !u) return g;
          n.checkSupport(u);
          var p = n.getTypeOf(g);
          return m[p][u](g);
        }, n.resolve = function(u) {
          for (var g = u.split("/"), p = [], h = 0; h < g.length; h++) {
            var _ = g[h];
            _ === "." || _ === "" && h !== 0 && h !== g.length - 1 || (_ === ".." ? p.pop() : p.push(_));
          }
          return p.join("/");
        }, n.getTypeOf = function(u) {
          return typeof u == "string" ? "string" : Object.prototype.toString.call(u) === "[object Array]" ? "array" : o.nodebuffer && A.isBuffer(u) ? "nodebuffer" : o.uint8array && u instanceof Uint8Array ? "uint8array" : o.arraybuffer && u instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, n.checkSupport = function(u) {
          if (!o[u.toLowerCase()]) throw new Error(u + " is not supported by this platform");
        }, n.MAX_VALUE_16BITS = 65535, n.MAX_VALUE_32BITS = -1, n.pretty = function(u) {
          var g, p, h = "";
          for (p = 0; p < (u || "").length; p++) h += "\\x" + ((g = u.charCodeAt(p)) < 16 ? "0" : "") + g.toString(16).toUpperCase();
          return h;
        }, n.delay = function(u, g, p) {
          setImmediate(function() {
            u.apply(p || null, g || []);
          });
        }, n.inherits = function(u, g) {
          function p() {
          }
          p.prototype = g.prototype, u.prototype = new p();
        }, n.extend = function() {
          var u, g, p = {};
          for (u = 0; u < arguments.length; u++) for (g in arguments[u]) Object.prototype.hasOwnProperty.call(arguments[u], g) && p[g] === void 0 && (p[g] = arguments[u][g]);
          return p;
        }, n.prepareContent = function(u, g, p, h, _) {
          return c.Promise.resolve(g).then(function(E) {
            return o.blob && (E instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(E)) !== -1) && typeof FileReader < "u" ? new c.Promise(function(v, C) {
              var x = new FileReader();
              x.onload = function(P) {
                v(P.target.result);
              }, x.onerror = function(P) {
                C(P.target.error);
              }, x.readAsArrayBuffer(E);
            }) : E;
          }).then(function(E) {
            var v = n.getTypeOf(E);
            return v ? (v === "arraybuffer" ? E = n.transformTo("uint8array", E) : v === "string" && (_ ? E = l.decode(E) : p && h !== !0 && (E = (function(C) {
              return i(C, o.uint8array ? new Uint8Array(C.length) : new Array(C.length));
            })(E))), E) : c.Promise.reject(new Error("Can't read the data of '" + u + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(t, s, n) {
        var o = t("./reader/readerFor"), l = t("./utils"), A = t("./signature"), c = t("./zipEntry"), a = t("./support");
        function i(f) {
          this.files = [], this.loadOptions = f;
        }
        i.prototype = { checkSignature: function(f) {
          if (!this.reader.readAndCheckSignature(f)) {
            this.reader.index -= 4;
            var y = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + l.pretty(y) + ", expected " + l.pretty(f) + ")");
          }
        }, isSignature: function(f, y) {
          var d = this.reader.index;
          this.reader.setIndex(f);
          var m = this.reader.readString(4) === y;
          return this.reader.setIndex(d), m;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var f = this.reader.readData(this.zipCommentLength), y = a.uint8array ? "uint8array" : "array", d = l.transformTo(y, f);
          this.zipComment = this.loadOptions.decodeFileName(d);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var f, y, d, m = this.zip64EndOfCentralSize - 44; 0 < m; ) f = this.reader.readInt(2), y = this.reader.readInt(4), d = this.reader.readData(y), this.zip64ExtensibleData[f] = { id: f, length: y, value: d };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var f, y;
          for (f = 0; f < this.files.length; f++) y = this.files[f], this.reader.setIndex(y.localHeaderOffset), this.checkSignature(A.LOCAL_FILE_HEADER), y.readLocalPart(this.reader), y.handleUTF8(), y.processAttributes();
        }, readCentralDir: function() {
          var f;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(A.CENTRAL_FILE_HEADER); ) (f = new c({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(f);
          if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var f = this.reader.lastIndexOfSignature(A.CENTRAL_DIRECTORY_END);
          if (f < 0) throw this.isSignature(0, A.LOCAL_FILE_HEADER) ? new Error("Corrupted zip: can't find end of central directory") : new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
          this.reader.setIndex(f);
          var y = f;
          if (this.checkSignature(A.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === l.MAX_VALUE_16BITS || this.diskWithCentralDirStart === l.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === l.MAX_VALUE_16BITS || this.centralDirRecords === l.MAX_VALUE_16BITS || this.centralDirSize === l.MAX_VALUE_32BITS || this.centralDirOffset === l.MAX_VALUE_32BITS) {
            if (this.zip64 = !0, (f = this.reader.lastIndexOfSignature(A.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(f), this.checkSignature(A.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, A.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(A.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(A.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var d = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (d += 20, d += 12 + this.zip64EndOfCentralSize);
          var m = y - d;
          if (0 < m) this.isSignature(y, A.CENTRAL_FILE_HEADER) || (this.reader.zero = m);
          else if (m < 0) throw new Error("Corrupted zip: missing " + Math.abs(m) + " bytes.");
        }, prepareReader: function(f) {
          this.reader = o(f);
        }, load: function(f) {
          this.prepareReader(f), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, s.exports = i;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(t, s, n) {
        var o = t("./reader/readerFor"), l = t("./utils"), A = t("./compressedObject"), c = t("./crc32"), a = t("./utf8"), i = t("./compressions"), f = t("./support");
        function y(d, m) {
          this.options = d, this.loadOptions = m;
        }
        y.prototype = { isEncrypted: function() {
          return (1 & this.bitFlag) == 1;
        }, useUTF8: function() {
          return (2048 & this.bitFlag) == 2048;
        }, readLocalPart: function(d) {
          var m, u;
          if (d.skip(22), this.fileNameLength = d.readInt(2), u = d.readInt(2), this.fileName = d.readData(this.fileNameLength), d.skip(u), this.compressedSize === -1 || this.uncompressedSize === -1) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if ((m = (function(g) {
            for (var p in i) if (Object.prototype.hasOwnProperty.call(i, p) && i[p].magic === g) return i[p];
            return null;
          })(this.compressionMethod)) === null) throw new Error("Corrupted zip : compression " + l.pretty(this.compressionMethod) + " unknown (inner file : " + l.transformTo("string", this.fileName) + ")");
          this.decompressed = new A(this.compressedSize, this.uncompressedSize, this.crc32, m, d.readData(this.compressedSize));
        }, readCentralPart: function(d) {
          this.versionMadeBy = d.readInt(2), d.skip(2), this.bitFlag = d.readInt(2), this.compressionMethod = d.readString(2), this.date = d.readDate(), this.crc32 = d.readInt(4), this.compressedSize = d.readInt(4), this.uncompressedSize = d.readInt(4);
          var m = d.readInt(2);
          if (this.extraFieldsLength = d.readInt(2), this.fileCommentLength = d.readInt(2), this.diskNumberStart = d.readInt(2), this.internalFileAttributes = d.readInt(2), this.externalFileAttributes = d.readInt(4), this.localHeaderOffset = d.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          d.skip(m), this.readExtraFields(d), this.parseZIP64ExtraField(d), this.fileComment = d.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var d = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), d == 0 && (this.dosPermissions = 63 & this.externalFileAttributes), d == 3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var d = o(this.extraFields[1].value);
            this.uncompressedSize === l.MAX_VALUE_32BITS && (this.uncompressedSize = d.readInt(8)), this.compressedSize === l.MAX_VALUE_32BITS && (this.compressedSize = d.readInt(8)), this.localHeaderOffset === l.MAX_VALUE_32BITS && (this.localHeaderOffset = d.readInt(8)), this.diskNumberStart === l.MAX_VALUE_32BITS && (this.diskNumberStart = d.readInt(4));
          }
        }, readExtraFields: function(d) {
          var m, u, g, p = d.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); d.index + 4 < p; ) m = d.readInt(2), u = d.readInt(2), g = d.readData(u), this.extraFields[m] = { id: m, length: u, value: g };
          d.setIndex(p);
        }, handleUTF8: function() {
          var d = f.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = a.utf8decode(this.fileName), this.fileCommentStr = a.utf8decode(this.fileComment);
          else {
            var m = this.findExtraFieldUnicodePath();
            if (m !== null) this.fileNameStr = m;
            else {
              var u = l.transformTo(d, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(u);
            }
            var g = this.findExtraFieldUnicodeComment();
            if (g !== null) this.fileCommentStr = g;
            else {
              var p = l.transformTo(d, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(p);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var d = this.extraFields[28789];
          if (d) {
            var m = o(d.value);
            return m.readInt(1) !== 1 || c(this.fileName) !== m.readInt(4) ? null : a.utf8decode(m.readData(d.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var d = this.extraFields[25461];
          if (d) {
            var m = o(d.value);
            return m.readInt(1) !== 1 || c(this.fileComment) !== m.readInt(4) ? null : a.utf8decode(m.readData(d.length - 5));
          }
          return null;
        } }, s.exports = y;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(t, s, n) {
        function o(m, u, g) {
          this.name = m, this.dir = g.dir, this.date = g.date, this.comment = g.comment, this.unixPermissions = g.unixPermissions, this.dosPermissions = g.dosPermissions, this._data = u, this._dataBinary = g.binary, this.options = { compression: g.compression, compressionOptions: g.compressionOptions };
        }
        var l = t("./stream/StreamHelper"), A = t("./stream/DataWorker"), c = t("./utf8"), a = t("./compressedObject"), i = t("./stream/GenericWorker");
        o.prototype = { internalStream: function(m) {
          var u = null, g = "string";
          try {
            if (!m) throw new Error("No output type specified.");
            var p = (g = m.toLowerCase()) === "string" || g === "text";
            g !== "binarystring" && g !== "text" || (g = "string"), u = this._decompressWorker();
            var h = !this._dataBinary;
            h && !p && (u = u.pipe(new c.Utf8EncodeWorker())), !h && p && (u = u.pipe(new c.Utf8DecodeWorker()));
          } catch (_) {
            (u = new i("error")).error(_);
          }
          return new l(u, g, "");
        }, async: function(m, u) {
          return this.internalStream(m).accumulate(u);
        }, nodeStream: function(m, u) {
          return this.internalStream(m || "nodebuffer").toNodejsStream(u);
        }, _compressWorker: function(m, u) {
          if (this._data instanceof a && this._data.compression.magic === m.magic) return this._data.getCompressedWorker();
          var g = this._decompressWorker();
          return this._dataBinary || (g = g.pipe(new c.Utf8EncodeWorker())), a.createWorkerFrom(g, m, u);
        }, _decompressWorker: function() {
          return this._data instanceof a ? this._data.getContentWorker() : this._data instanceof i ? this._data : new A(this._data);
        } };
        for (var f = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], y = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, d = 0; d < f.length; d++) o.prototype[f[d]] = y;
        s.exports = o;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(t, s, n) {
        (function(o) {
          var l, A, c = o.MutationObserver || o.WebKitMutationObserver;
          if (c) {
            var a = 0, i = new c(m), f = o.document.createTextNode("");
            i.observe(f, { characterData: !0 }), l = function() {
              f.data = a = ++a % 2;
            };
          } else if (o.setImmediate || o.MessageChannel === void 0) l = "document" in o && "onreadystatechange" in o.document.createElement("script") ? function() {
            var u = o.document.createElement("script");
            u.onreadystatechange = function() {
              m(), u.onreadystatechange = null, u.parentNode.removeChild(u), u = null;
            }, o.document.documentElement.appendChild(u);
          } : function() {
            setTimeout(m, 0);
          };
          else {
            var y = new o.MessageChannel();
            y.port1.onmessage = m, l = function() {
              y.port2.postMessage(0);
            };
          }
          var d = [];
          function m() {
            var u, g;
            A = !0;
            for (var p = d.length; p; ) {
              for (g = d, d = [], u = -1; ++u < p; ) g[u]();
              p = d.length;
            }
            A = !1;
          }
          s.exports = function(u) {
            d.push(u) !== 1 || A || l();
          };
        }).call(this, typeof zt < "u" ? zt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 37: [function(t, s, n) {
        var o = t("immediate");
        function l() {
        }
        var A = {}, c = ["REJECTED"], a = ["FULFILLED"], i = ["PENDING"];
        function f(p) {
          if (typeof p != "function") throw new TypeError("resolver must be a function");
          this.state = i, this.queue = [], this.outcome = void 0, p !== l && u(this, p);
        }
        function y(p, h, _) {
          this.promise = p, typeof h == "function" && (this.onFulfilled = h, this.callFulfilled = this.otherCallFulfilled), typeof _ == "function" && (this.onRejected = _, this.callRejected = this.otherCallRejected);
        }
        function d(p, h, _) {
          o(function() {
            var E;
            try {
              E = h(_);
            } catch (v) {
              return A.reject(p, v);
            }
            E === p ? A.reject(p, new TypeError("Cannot resolve promise with itself")) : A.resolve(p, E);
          });
        }
        function m(p) {
          var h = p && p.then;
          if (p && (typeof p == "object" || typeof p == "function") && typeof h == "function") return function() {
            h.apply(p, arguments);
          };
        }
        function u(p, h) {
          var _ = !1;
          function E(x) {
            _ || (_ = !0, A.reject(p, x));
          }
          function v(x) {
            _ || (_ = !0, A.resolve(p, x));
          }
          var C = g(function() {
            h(v, E);
          });
          C.status === "error" && E(C.value);
        }
        function g(p, h) {
          var _ = {};
          try {
            _.value = p(h), _.status = "success";
          } catch (E) {
            _.status = "error", _.value = E;
          }
          return _;
        }
        (s.exports = f).prototype.finally = function(p) {
          if (typeof p != "function") return this;
          var h = this.constructor;
          return this.then(function(_) {
            return h.resolve(p()).then(function() {
              return _;
            });
          }, function(_) {
            return h.resolve(p()).then(function() {
              throw _;
            });
          });
        }, f.prototype.catch = function(p) {
          return this.then(null, p);
        }, f.prototype.then = function(p, h) {
          if (typeof p != "function" && this.state === a || typeof h != "function" && this.state === c) return this;
          var _ = new this.constructor(l);
          return this.state !== i ? d(_, this.state === a ? p : h, this.outcome) : this.queue.push(new y(_, p, h)), _;
        }, y.prototype.callFulfilled = function(p) {
          A.resolve(this.promise, p);
        }, y.prototype.otherCallFulfilled = function(p) {
          d(this.promise, this.onFulfilled, p);
        }, y.prototype.callRejected = function(p) {
          A.reject(this.promise, p);
        }, y.prototype.otherCallRejected = function(p) {
          d(this.promise, this.onRejected, p);
        }, A.resolve = function(p, h) {
          var _ = g(m, h);
          if (_.status === "error") return A.reject(p, _.value);
          var E = _.value;
          if (E) u(p, E);
          else {
            p.state = a, p.outcome = h;
            for (var v = -1, C = p.queue.length; ++v < C; ) p.queue[v].callFulfilled(h);
          }
          return p;
        }, A.reject = function(p, h) {
          p.state = c, p.outcome = h;
          for (var _ = -1, E = p.queue.length; ++_ < E; ) p.queue[_].callRejected(h);
          return p;
        }, f.resolve = function(p) {
          return p instanceof this ? p : A.resolve(new this(l), p);
        }, f.reject = function(p) {
          var h = new this(l);
          return A.reject(h, p);
        }, f.all = function(p) {
          var h = this;
          if (Object.prototype.toString.call(p) !== "[object Array]") return this.reject(new TypeError("must be an array"));
          var _ = p.length, E = !1;
          if (!_) return this.resolve([]);
          for (var v = new Array(_), C = 0, x = -1, P = new this(l); ++x < _; ) R(p[x], x);
          return P;
          function R(k, O) {
            h.resolve(k).then(function(T) {
              v[O] = T, ++C !== _ || E || (E = !0, A.resolve(P, v));
            }, function(T) {
              E || (E = !0, A.reject(P, T));
            });
          }
        }, f.race = function(p) {
          var h = this;
          if (Object.prototype.toString.call(p) !== "[object Array]") return this.reject(new TypeError("must be an array"));
          var _ = p.length, E = !1;
          if (!_) return this.resolve([]);
          for (var v = -1, C = new this(l); ++v < _; ) x = p[v], h.resolve(x).then(function(P) {
            E || (E = !0, A.resolve(C, P));
          }, function(P) {
            E || (E = !0, A.reject(C, P));
          });
          var x;
          return C;
        };
      }, { immediate: 36 }], 38: [function(t, s, n) {
        var o = {};
        (0, t("./lib/utils/common").assign)(o, t("./lib/deflate"), t("./lib/inflate"), t("./lib/zlib/constants")), s.exports = o;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(t, s, n) {
        var o = t("./zlib/deflate"), l = t("./utils/common"), A = t("./utils/strings"), c = t("./zlib/messages"), a = t("./zlib/zstream"), i = Object.prototype.toString, f = 0, y = -1, d = 0, m = 8;
        function u(p) {
          if (!(this instanceof u)) return new u(p);
          this.options = l.assign({ level: y, method: m, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: d, to: "" }, p || {});
          var h = this.options;
          h.raw && 0 < h.windowBits ? h.windowBits = -h.windowBits : h.gzip && 0 < h.windowBits && h.windowBits < 16 && (h.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new a(), this.strm.avail_out = 0;
          var _ = o.deflateInit2(this.strm, h.level, h.method, h.windowBits, h.memLevel, h.strategy);
          if (_ !== f) throw new Error(c[_]);
          if (h.header && o.deflateSetHeader(this.strm, h.header), h.dictionary) {
            var E;
            if (E = typeof h.dictionary == "string" ? A.string2buf(h.dictionary) : i.call(h.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(h.dictionary) : h.dictionary, (_ = o.deflateSetDictionary(this.strm, E)) !== f) throw new Error(c[_]);
            this._dict_set = !0;
          }
        }
        function g(p, h) {
          var _ = new u(h);
          if (_.push(p, !0), _.err) throw _.msg || c[_.err];
          return _.result;
        }
        u.prototype.push = function(p, h) {
          var _, E, v = this.strm, C = this.options.chunkSize;
          if (this.ended) return !1;
          E = h === ~~h ? h : h === !0 ? 4 : 0, typeof p == "string" ? v.input = A.string2buf(p) : i.call(p) === "[object ArrayBuffer]" ? v.input = new Uint8Array(p) : v.input = p, v.next_in = 0, v.avail_in = v.input.length;
          do {
            if (v.avail_out === 0 && (v.output = new l.Buf8(C), v.next_out = 0, v.avail_out = C), (_ = o.deflate(v, E)) !== 1 && _ !== f) return this.onEnd(_), !(this.ended = !0);
            v.avail_out !== 0 && (v.avail_in !== 0 || E !== 4 && E !== 2) || (this.options.to === "string" ? this.onData(A.buf2binstring(l.shrinkBuf(v.output, v.next_out))) : this.onData(l.shrinkBuf(v.output, v.next_out)));
          } while ((0 < v.avail_in || v.avail_out === 0) && _ !== 1);
          return E === 4 ? (_ = o.deflateEnd(this.strm), this.onEnd(_), this.ended = !0, _ === f) : E !== 2 || (this.onEnd(f), !(v.avail_out = 0));
        }, u.prototype.onData = function(p) {
          this.chunks.push(p);
        }, u.prototype.onEnd = function(p) {
          p === f && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = p, this.msg = this.strm.msg;
        }, n.Deflate = u, n.deflate = g, n.deflateRaw = function(p, h) {
          return (h = h || {}).raw = !0, g(p, h);
        }, n.gzip = function(p, h) {
          return (h = h || {}).gzip = !0, g(p, h);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(t, s, n) {
        var o = t("./zlib/inflate"), l = t("./utils/common"), A = t("./utils/strings"), c = t("./zlib/constants"), a = t("./zlib/messages"), i = t("./zlib/zstream"), f = t("./zlib/gzheader"), y = Object.prototype.toString;
        function d(u) {
          if (!(this instanceof d)) return new d(u);
          this.options = l.assign({ chunkSize: 16384, windowBits: 0, to: "" }, u || {});
          var g = this.options;
          g.raw && 0 <= g.windowBits && g.windowBits < 16 && (g.windowBits = -g.windowBits, g.windowBits === 0 && (g.windowBits = -15)), !(0 <= g.windowBits && g.windowBits < 16) || u && u.windowBits || (g.windowBits += 32), 15 < g.windowBits && g.windowBits < 48 && (15 & g.windowBits) == 0 && (g.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var p = o.inflateInit2(this.strm, g.windowBits);
          if (p !== c.Z_OK) throw new Error(a[p]);
          this.header = new f(), o.inflateGetHeader(this.strm, this.header);
        }
        function m(u, g) {
          var p = new d(g);
          if (p.push(u, !0), p.err) throw p.msg || a[p.err];
          return p.result;
        }
        d.prototype.push = function(u, g) {
          var p, h, _, E, v, C, x = this.strm, P = this.options.chunkSize, R = this.options.dictionary, k = !1;
          if (this.ended) return !1;
          h = g === ~~g ? g : g === !0 ? c.Z_FINISH : c.Z_NO_FLUSH, typeof u == "string" ? x.input = A.binstring2buf(u) : y.call(u) === "[object ArrayBuffer]" ? x.input = new Uint8Array(u) : x.input = u, x.next_in = 0, x.avail_in = x.input.length;
          do {
            if (x.avail_out === 0 && (x.output = new l.Buf8(P), x.next_out = 0, x.avail_out = P), (p = o.inflate(x, c.Z_NO_FLUSH)) === c.Z_NEED_DICT && R && (C = typeof R == "string" ? A.string2buf(R) : y.call(R) === "[object ArrayBuffer]" ? new Uint8Array(R) : R, p = o.inflateSetDictionary(this.strm, C)), p === c.Z_BUF_ERROR && k === !0 && (p = c.Z_OK, k = !1), p !== c.Z_STREAM_END && p !== c.Z_OK) return this.onEnd(p), !(this.ended = !0);
            x.next_out && (x.avail_out !== 0 && p !== c.Z_STREAM_END && (x.avail_in !== 0 || h !== c.Z_FINISH && h !== c.Z_SYNC_FLUSH) || (this.options.to === "string" ? (_ = A.utf8border(x.output, x.next_out), E = x.next_out - _, v = A.buf2string(x.output, _), x.next_out = E, x.avail_out = P - E, E && l.arraySet(x.output, x.output, _, E, 0), this.onData(v)) : this.onData(l.shrinkBuf(x.output, x.next_out)))), x.avail_in === 0 && x.avail_out === 0 && (k = !0);
          } while ((0 < x.avail_in || x.avail_out === 0) && p !== c.Z_STREAM_END);
          return p === c.Z_STREAM_END && (h = c.Z_FINISH), h === c.Z_FINISH ? (p = o.inflateEnd(this.strm), this.onEnd(p), this.ended = !0, p === c.Z_OK) : h !== c.Z_SYNC_FLUSH || (this.onEnd(c.Z_OK), !(x.avail_out = 0));
        }, d.prototype.onData = function(u) {
          this.chunks.push(u);
        }, d.prototype.onEnd = function(u) {
          u === c.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = u, this.msg = this.strm.msg;
        }, n.Inflate = d, n.inflate = m, n.inflateRaw = function(u, g) {
          return (g = g || {}).raw = !0, m(u, g);
        }, n.ungzip = m;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(t, s, n) {
        var o = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
        n.assign = function(c) {
          for (var a = Array.prototype.slice.call(arguments, 1); a.length; ) {
            var i = a.shift();
            if (i) {
              if (typeof i != "object") throw new TypeError(i + "must be non-object");
              for (var f in i) i.hasOwnProperty(f) && (c[f] = i[f]);
            }
          }
          return c;
        }, n.shrinkBuf = function(c, a) {
          return c.length === a ? c : c.subarray ? c.subarray(0, a) : (c.length = a, c);
        };
        var l = { arraySet: function(c, a, i, f, y) {
          if (a.subarray && c.subarray) c.set(a.subarray(i, i + f), y);
          else for (var d = 0; d < f; d++) c[y + d] = a[i + d];
        }, flattenChunks: function(c) {
          var a, i, f, y, d, m;
          for (a = f = 0, i = c.length; a < i; a++) f += c[a].length;
          for (m = new Uint8Array(f), a = y = 0, i = c.length; a < i; a++) d = c[a], m.set(d, y), y += d.length;
          return m;
        } }, A = { arraySet: function(c, a, i, f, y) {
          for (var d = 0; d < f; d++) c[y + d] = a[i + d];
        }, flattenChunks: function(c) {
          return [].concat.apply([], c);
        } };
        n.setTyped = function(c) {
          c ? (n.Buf8 = Uint8Array, n.Buf16 = Uint16Array, n.Buf32 = Int32Array, n.assign(n, l)) : (n.Buf8 = Array, n.Buf16 = Array, n.Buf32 = Array, n.assign(n, A));
        }, n.setTyped(o);
      }, {}], 42: [function(t, s, n) {
        var o = t("./common"), l = !0, A = !0;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch {
          l = !1;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch {
          A = !1;
        }
        for (var c = new o.Buf8(256), a = 0; a < 256; a++) c[a] = 252 <= a ? 6 : 248 <= a ? 5 : 240 <= a ? 4 : 224 <= a ? 3 : 192 <= a ? 2 : 1;
        function i(f, y) {
          if (y < 65537 && (f.subarray && A || !f.subarray && l)) return String.fromCharCode.apply(null, o.shrinkBuf(f, y));
          for (var d = "", m = 0; m < y; m++) d += String.fromCharCode(f[m]);
          return d;
        }
        c[254] = c[254] = 1, n.string2buf = function(f) {
          var y, d, m, u, g, p = f.length, h = 0;
          for (u = 0; u < p; u++) (64512 & (d = f.charCodeAt(u))) == 55296 && u + 1 < p && (64512 & (m = f.charCodeAt(u + 1))) == 56320 && (d = 65536 + (d - 55296 << 10) + (m - 56320), u++), h += d < 128 ? 1 : d < 2048 ? 2 : d < 65536 ? 3 : 4;
          for (y = new o.Buf8(h), u = g = 0; g < h; u++) (64512 & (d = f.charCodeAt(u))) == 55296 && u + 1 < p && (64512 & (m = f.charCodeAt(u + 1))) == 56320 && (d = 65536 + (d - 55296 << 10) + (m - 56320), u++), d < 128 ? y[g++] = d : (d < 2048 ? y[g++] = 192 | d >>> 6 : (d < 65536 ? y[g++] = 224 | d >>> 12 : (y[g++] = 240 | d >>> 18, y[g++] = 128 | d >>> 12 & 63), y[g++] = 128 | d >>> 6 & 63), y[g++] = 128 | 63 & d);
          return y;
        }, n.buf2binstring = function(f) {
          return i(f, f.length);
        }, n.binstring2buf = function(f) {
          for (var y = new o.Buf8(f.length), d = 0, m = y.length; d < m; d++) y[d] = f.charCodeAt(d);
          return y;
        }, n.buf2string = function(f, y) {
          var d, m, u, g, p = y || f.length, h = new Array(2 * p);
          for (d = m = 0; d < p; ) if ((u = f[d++]) < 128) h[m++] = u;
          else if (4 < (g = c[u])) h[m++] = 65533, d += g - 1;
          else {
            for (u &= g === 2 ? 31 : g === 3 ? 15 : 7; 1 < g && d < p; ) u = u << 6 | 63 & f[d++], g--;
            1 < g ? h[m++] = 65533 : u < 65536 ? h[m++] = u : (u -= 65536, h[m++] = 55296 | u >> 10 & 1023, h[m++] = 56320 | 1023 & u);
          }
          return i(h, m);
        }, n.utf8border = function(f, y) {
          var d;
          for ((y = y || f.length) > f.length && (y = f.length), d = y - 1; 0 <= d && (192 & f[d]) == 128; ) d--;
          return d < 0 || d === 0 ? y : d + c[f[d]] > y ? d : y;
        };
      }, { "./common": 41 }], 43: [function(t, s, n) {
        s.exports = function(o, l, A, c) {
          for (var a = 65535 & o | 0, i = o >>> 16 & 65535 | 0, f = 0; A !== 0; ) {
            for (A -= f = 2e3 < A ? 2e3 : A; i = i + (a = a + l[c++] | 0) | 0, --f; ) ;
            a %= 65521, i %= 65521;
          }
          return a | i << 16 | 0;
        };
      }, {}], 44: [function(t, s, n) {
        s.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(t, s, n) {
        var o = (function() {
          for (var l, A = [], c = 0; c < 256; c++) {
            l = c;
            for (var a = 0; a < 8; a++) l = 1 & l ? 3988292384 ^ l >>> 1 : l >>> 1;
            A[c] = l;
          }
          return A;
        })();
        s.exports = function(l, A, c, a) {
          var i = o, f = a + c;
          l ^= -1;
          for (var y = a; y < f; y++) l = l >>> 8 ^ i[255 & (l ^ A[y])];
          return -1 ^ l;
        };
      }, {}], 46: [function(t, s, n) {
        var o, l = t("../utils/common"), A = t("./trees"), c = t("./adler32"), a = t("./crc32"), i = t("./messages"), f = 0, y = 4, d = 0, m = -2, u = -1, g = 4, p = 2, h = 8, _ = 9, E = 286, v = 30, C = 19, x = 2 * E + 1, P = 15, R = 3, k = 258, O = k + R + 1, T = 42, M = 113, w = 1, G = 2, ee = 3, Y = 4;
        function ne(b, X) {
          return b.msg = i[X], X;
        }
        function Z(b) {
          return (b << 1) - (4 < b ? 9 : 0);
        }
        function Q(b) {
          for (var X = b.length; 0 <= --X; ) b[X] = 0;
        }
        function D(b) {
          var X = b.state, W = X.pending;
          W > b.avail_out && (W = b.avail_out), W !== 0 && (l.arraySet(b.output, X.pending_buf, X.pending_out, W, b.next_out), b.next_out += W, X.pending_out += W, b.total_out += W, b.avail_out -= W, X.pending -= W, X.pending === 0 && (X.pending_out = 0));
        }
        function F(b, X) {
          A._tr_flush_block(b, 0 <= b.block_start ? b.block_start : -1, b.strstart - b.block_start, X), b.block_start = b.strstart, D(b.strm);
        }
        function $(b, X) {
          b.pending_buf[b.pending++] = X;
        }
        function L(b, X) {
          b.pending_buf[b.pending++] = X >>> 8 & 255, b.pending_buf[b.pending++] = 255 & X;
        }
        function N(b, X) {
          var W, I, B = b.max_chain_length, U = b.strstart, K = b.prev_length, J = b.nice_match, H = b.strstart > b.w_size - O ? b.strstart - (b.w_size - O) : 0, te = b.window, se = b.w_mask, ie = b.prev, ce = b.strstart + k, Ce = te[U + K - 1], ye = te[U + K];
          b.prev_length >= b.good_match && (B >>= 2), J > b.lookahead && (J = b.lookahead);
          do
            if (te[(W = X) + K] === ye && te[W + K - 1] === Ce && te[W] === te[U] && te[++W] === te[U + 1]) {
              U += 2, W++;
              do
                ;
              while (te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && te[++U] === te[++W] && U < ce);
              if (I = k - (ce - U), U = ce - k, K < I) {
                if (b.match_start = X, J <= (K = I)) break;
                Ce = te[U + K - 1], ye = te[U + K];
              }
            }
          while ((X = ie[X & se]) > H && --B != 0);
          return K <= b.lookahead ? K : b.lookahead;
        }
        function V(b) {
          var X, W, I, B, U, K, J, H, te, se, ie = b.w_size;
          do {
            if (B = b.window_size - b.lookahead - b.strstart, b.strstart >= ie + (ie - O)) {
              for (l.arraySet(b.window, b.window, ie, ie, 0), b.match_start -= ie, b.strstart -= ie, b.block_start -= ie, X = W = b.hash_size; I = b.head[--X], b.head[X] = ie <= I ? I - ie : 0, --W; ) ;
              for (X = W = ie; I = b.prev[--X], b.prev[X] = ie <= I ? I - ie : 0, --W; ) ;
              B += ie;
            }
            if (b.strm.avail_in === 0) break;
            if (K = b.strm, J = b.window, H = b.strstart + b.lookahead, te = B, se = void 0, se = K.avail_in, te < se && (se = te), W = se === 0 ? 0 : (K.avail_in -= se, l.arraySet(J, K.input, K.next_in, se, H), K.state.wrap === 1 ? K.adler = c(K.adler, J, se, H) : K.state.wrap === 2 && (K.adler = a(K.adler, J, se, H)), K.next_in += se, K.total_in += se, se), b.lookahead += W, b.lookahead + b.insert >= R) for (U = b.strstart - b.insert, b.ins_h = b.window[U], b.ins_h = (b.ins_h << b.hash_shift ^ b.window[U + 1]) & b.hash_mask; b.insert && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[U + R - 1]) & b.hash_mask, b.prev[U & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = U, U++, b.insert--, !(b.lookahead + b.insert < R)); ) ;
          } while (b.lookahead < O && b.strm.avail_in !== 0);
        }
        function oe(b, X) {
          for (var W, I; ; ) {
            if (b.lookahead < O) {
              if (V(b), b.lookahead < O && X === f) return w;
              if (b.lookahead === 0) break;
            }
            if (W = 0, b.lookahead >= R && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, W = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), W !== 0 && b.strstart - W <= b.w_size - O && (b.match_length = N(b, W)), b.match_length >= R) if (I = A._tr_tally(b, b.strstart - b.match_start, b.match_length - R), b.lookahead -= b.match_length, b.match_length <= b.max_lazy_match && b.lookahead >= R) {
              for (b.match_length--; b.strstart++, b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, W = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart, --b.match_length != 0; ) ;
              b.strstart++;
            } else b.strstart += b.match_length, b.match_length = 0, b.ins_h = b.window[b.strstart], b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + 1]) & b.hash_mask;
            else I = A._tr_tally(b, 0, b.window[b.strstart]), b.lookahead--, b.strstart++;
            if (I && (F(b, !1), b.strm.avail_out === 0)) return w;
          }
          return b.insert = b.strstart < R - 1 ? b.strstart : R - 1, X === y ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : b.last_lit && (F(b, !1), b.strm.avail_out === 0) ? w : G;
        }
        function ae(b, X) {
          for (var W, I, B; ; ) {
            if (b.lookahead < O) {
              if (V(b), b.lookahead < O && X === f) return w;
              if (b.lookahead === 0) break;
            }
            if (W = 0, b.lookahead >= R && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, W = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), b.prev_length = b.match_length, b.prev_match = b.match_start, b.match_length = R - 1, W !== 0 && b.prev_length < b.max_lazy_match && b.strstart - W <= b.w_size - O && (b.match_length = N(b, W), b.match_length <= 5 && (b.strategy === 1 || b.match_length === R && 4096 < b.strstart - b.match_start) && (b.match_length = R - 1)), b.prev_length >= R && b.match_length <= b.prev_length) {
              for (B = b.strstart + b.lookahead - R, I = A._tr_tally(b, b.strstart - 1 - b.prev_match, b.prev_length - R), b.lookahead -= b.prev_length - 1, b.prev_length -= 2; ++b.strstart <= B && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, W = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), --b.prev_length != 0; ) ;
              if (b.match_available = 0, b.match_length = R - 1, b.strstart++, I && (F(b, !1), b.strm.avail_out === 0)) return w;
            } else if (b.match_available) {
              if ((I = A._tr_tally(b, 0, b.window[b.strstart - 1])) && F(b, !1), b.strstart++, b.lookahead--, b.strm.avail_out === 0) return w;
            } else b.match_available = 1, b.strstart++, b.lookahead--;
          }
          return b.match_available && (I = A._tr_tally(b, 0, b.window[b.strstart - 1]), b.match_available = 0), b.insert = b.strstart < R - 1 ? b.strstart : R - 1, X === y ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : b.last_lit && (F(b, !1), b.strm.avail_out === 0) ? w : G;
        }
        function le(b, X, W, I, B) {
          this.good_length = b, this.max_lazy = X, this.nice_length = W, this.max_chain = I, this.func = B;
        }
        function Ae() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = h, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new l.Buf16(2 * x), this.dyn_dtree = new l.Buf16(2 * (2 * v + 1)), this.bl_tree = new l.Buf16(2 * (2 * C + 1)), Q(this.dyn_ltree), Q(this.dyn_dtree), Q(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new l.Buf16(P + 1), this.heap = new l.Buf16(2 * E + 1), Q(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new l.Buf16(2 * E + 1), Q(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function z(b) {
          var X;
          return b && b.state ? (b.total_in = b.total_out = 0, b.data_type = p, (X = b.state).pending = 0, X.pending_out = 0, X.wrap < 0 && (X.wrap = -X.wrap), X.status = X.wrap ? T : M, b.adler = X.wrap === 2 ? 0 : 1, X.last_flush = f, A._tr_init(X), d) : ne(b, m);
        }
        function q(b) {
          var X = z(b);
          return X === d && (function(W) {
            W.window_size = 2 * W.w_size, Q(W.head), W.max_lazy_match = o[W.level].max_lazy, W.good_match = o[W.level].good_length, W.nice_match = o[W.level].nice_length, W.max_chain_length = o[W.level].max_chain, W.strstart = 0, W.block_start = 0, W.lookahead = 0, W.insert = 0, W.match_length = W.prev_length = R - 1, W.match_available = 0, W.ins_h = 0;
          })(b.state), X;
        }
        function j(b, X, W, I, B, U) {
          if (!b) return m;
          var K = 1;
          if (X === u && (X = 6), I < 0 ? (K = 0, I = -I) : 15 < I && (K = 2, I -= 16), B < 1 || _ < B || W !== h || I < 8 || 15 < I || X < 0 || 9 < X || U < 0 || g < U) return ne(b, m);
          I === 8 && (I = 9);
          var J = new Ae();
          return (b.state = J).strm = b, J.wrap = K, J.gzhead = null, J.w_bits = I, J.w_size = 1 << J.w_bits, J.w_mask = J.w_size - 1, J.hash_bits = B + 7, J.hash_size = 1 << J.hash_bits, J.hash_mask = J.hash_size - 1, J.hash_shift = ~~((J.hash_bits + R - 1) / R), J.window = new l.Buf8(2 * J.w_size), J.head = new l.Buf16(J.hash_size), J.prev = new l.Buf16(J.w_size), J.lit_bufsize = 1 << B + 6, J.pending_buf_size = 4 * J.lit_bufsize, J.pending_buf = new l.Buf8(J.pending_buf_size), J.d_buf = 1 * J.lit_bufsize, J.l_buf = 3 * J.lit_bufsize, J.level = X, J.strategy = U, J.method = W, q(b);
        }
        o = [new le(0, 0, 0, 0, function(b, X) {
          var W = 65535;
          for (W > b.pending_buf_size - 5 && (W = b.pending_buf_size - 5); ; ) {
            if (b.lookahead <= 1) {
              if (V(b), b.lookahead === 0 && X === f) return w;
              if (b.lookahead === 0) break;
            }
            b.strstart += b.lookahead, b.lookahead = 0;
            var I = b.block_start + W;
            if ((b.strstart === 0 || b.strstart >= I) && (b.lookahead = b.strstart - I, b.strstart = I, F(b, !1), b.strm.avail_out === 0) || b.strstart - b.block_start >= b.w_size - O && (F(b, !1), b.strm.avail_out === 0)) return w;
          }
          return b.insert = 0, X === y ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : (b.strstart > b.block_start && (F(b, !1), b.strm.avail_out), w);
        }), new le(4, 4, 8, 4, oe), new le(4, 5, 16, 8, oe), new le(4, 6, 32, 32, oe), new le(4, 4, 16, 16, ae), new le(8, 16, 32, 32, ae), new le(8, 16, 128, 128, ae), new le(8, 32, 128, 256, ae), new le(32, 128, 258, 1024, ae), new le(32, 258, 258, 4096, ae)], n.deflateInit = function(b, X) {
          return j(b, X, h, 15, 8, 0);
        }, n.deflateInit2 = j, n.deflateReset = q, n.deflateResetKeep = z, n.deflateSetHeader = function(b, X) {
          return b && b.state ? b.state.wrap !== 2 ? m : (b.state.gzhead = X, d) : m;
        }, n.deflate = function(b, X) {
          var W, I, B, U;
          if (!b || !b.state || 5 < X || X < 0) return b ? ne(b, m) : m;
          if (I = b.state, !b.output || !b.input && b.avail_in !== 0 || I.status === 666 && X !== y) return ne(b, b.avail_out === 0 ? -5 : m);
          if (I.strm = b, W = I.last_flush, I.last_flush = X, I.status === T) if (I.wrap === 2) b.adler = 0, $(I, 31), $(I, 139), $(I, 8), I.gzhead ? ($(I, (I.gzhead.text ? 1 : 0) + (I.gzhead.hcrc ? 2 : 0) + (I.gzhead.extra ? 4 : 0) + (I.gzhead.name ? 8 : 0) + (I.gzhead.comment ? 16 : 0)), $(I, 255 & I.gzhead.time), $(I, I.gzhead.time >> 8 & 255), $(I, I.gzhead.time >> 16 & 255), $(I, I.gzhead.time >> 24 & 255), $(I, I.level === 9 ? 2 : 2 <= I.strategy || I.level < 2 ? 4 : 0), $(I, 255 & I.gzhead.os), I.gzhead.extra && I.gzhead.extra.length && ($(I, 255 & I.gzhead.extra.length), $(I, I.gzhead.extra.length >> 8 & 255)), I.gzhead.hcrc && (b.adler = a(b.adler, I.pending_buf, I.pending, 0)), I.gzindex = 0, I.status = 69) : ($(I, 0), $(I, 0), $(I, 0), $(I, 0), $(I, 0), $(I, I.level === 9 ? 2 : 2 <= I.strategy || I.level < 2 ? 4 : 0), $(I, 3), I.status = M);
          else {
            var K = h + (I.w_bits - 8 << 4) << 8;
            K |= (2 <= I.strategy || I.level < 2 ? 0 : I.level < 6 ? 1 : I.level === 6 ? 2 : 3) << 6, I.strstart !== 0 && (K |= 32), K += 31 - K % 31, I.status = M, L(I, K), I.strstart !== 0 && (L(I, b.adler >>> 16), L(I, 65535 & b.adler)), b.adler = 1;
          }
          if (I.status === 69) if (I.gzhead.extra) {
            for (B = I.pending; I.gzindex < (65535 & I.gzhead.extra.length) && (I.pending !== I.pending_buf_size || (I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), D(b), B = I.pending, I.pending !== I.pending_buf_size)); ) $(I, 255 & I.gzhead.extra[I.gzindex]), I.gzindex++;
            I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), I.gzindex === I.gzhead.extra.length && (I.gzindex = 0, I.status = 73);
          } else I.status = 73;
          if (I.status === 73) if (I.gzhead.name) {
            B = I.pending;
            do {
              if (I.pending === I.pending_buf_size && (I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), D(b), B = I.pending, I.pending === I.pending_buf_size)) {
                U = 1;
                break;
              }
              U = I.gzindex < I.gzhead.name.length ? 255 & I.gzhead.name.charCodeAt(I.gzindex++) : 0, $(I, U);
            } while (U !== 0);
            I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), U === 0 && (I.gzindex = 0, I.status = 91);
          } else I.status = 91;
          if (I.status === 91) if (I.gzhead.comment) {
            B = I.pending;
            do {
              if (I.pending === I.pending_buf_size && (I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), D(b), B = I.pending, I.pending === I.pending_buf_size)) {
                U = 1;
                break;
              }
              U = I.gzindex < I.gzhead.comment.length ? 255 & I.gzhead.comment.charCodeAt(I.gzindex++) : 0, $(I, U);
            } while (U !== 0);
            I.gzhead.hcrc && I.pending > B && (b.adler = a(b.adler, I.pending_buf, I.pending - B, B)), U === 0 && (I.status = 103);
          } else I.status = 103;
          if (I.status === 103 && (I.gzhead.hcrc ? (I.pending + 2 > I.pending_buf_size && D(b), I.pending + 2 <= I.pending_buf_size && ($(I, 255 & b.adler), $(I, b.adler >> 8 & 255), b.adler = 0, I.status = M)) : I.status = M), I.pending !== 0) {
            if (D(b), b.avail_out === 0) return I.last_flush = -1, d;
          } else if (b.avail_in === 0 && Z(X) <= Z(W) && X !== y) return ne(b, -5);
          if (I.status === 666 && b.avail_in !== 0) return ne(b, -5);
          if (b.avail_in !== 0 || I.lookahead !== 0 || X !== f && I.status !== 666) {
            var J = I.strategy === 2 ? (function(H, te) {
              for (var se; ; ) {
                if (H.lookahead === 0 && (V(H), H.lookahead === 0)) {
                  if (te === f) return w;
                  break;
                }
                if (H.match_length = 0, se = A._tr_tally(H, 0, H.window[H.strstart]), H.lookahead--, H.strstart++, se && (F(H, !1), H.strm.avail_out === 0)) return w;
              }
              return H.insert = 0, te === y ? (F(H, !0), H.strm.avail_out === 0 ? ee : Y) : H.last_lit && (F(H, !1), H.strm.avail_out === 0) ? w : G;
            })(I, X) : I.strategy === 3 ? (function(H, te) {
              for (var se, ie, ce, Ce, ye = H.window; ; ) {
                if (H.lookahead <= k) {
                  if (V(H), H.lookahead <= k && te === f) return w;
                  if (H.lookahead === 0) break;
                }
                if (H.match_length = 0, H.lookahead >= R && 0 < H.strstart && (ie = ye[ce = H.strstart - 1]) === ye[++ce] && ie === ye[++ce] && ie === ye[++ce]) {
                  Ce = H.strstart + k;
                  do
                    ;
                  while (ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ce < Ce);
                  H.match_length = k - (Ce - ce), H.match_length > H.lookahead && (H.match_length = H.lookahead);
                }
                if (H.match_length >= R ? (se = A._tr_tally(H, 1, H.match_length - R), H.lookahead -= H.match_length, H.strstart += H.match_length, H.match_length = 0) : (se = A._tr_tally(H, 0, H.window[H.strstart]), H.lookahead--, H.strstart++), se && (F(H, !1), H.strm.avail_out === 0)) return w;
              }
              return H.insert = 0, te === y ? (F(H, !0), H.strm.avail_out === 0 ? ee : Y) : H.last_lit && (F(H, !1), H.strm.avail_out === 0) ? w : G;
            })(I, X) : o[I.level].func(I, X);
            if (J !== ee && J !== Y || (I.status = 666), J === w || J === ee) return b.avail_out === 0 && (I.last_flush = -1), d;
            if (J === G && (X === 1 ? A._tr_align(I) : X !== 5 && (A._tr_stored_block(I, 0, 0, !1), X === 3 && (Q(I.head), I.lookahead === 0 && (I.strstart = 0, I.block_start = 0, I.insert = 0))), D(b), b.avail_out === 0)) return I.last_flush = -1, d;
          }
          return X !== y ? d : I.wrap <= 0 ? 1 : (I.wrap === 2 ? ($(I, 255 & b.adler), $(I, b.adler >> 8 & 255), $(I, b.adler >> 16 & 255), $(I, b.adler >> 24 & 255), $(I, 255 & b.total_in), $(I, b.total_in >> 8 & 255), $(I, b.total_in >> 16 & 255), $(I, b.total_in >> 24 & 255)) : (L(I, b.adler >>> 16), L(I, 65535 & b.adler)), D(b), 0 < I.wrap && (I.wrap = -I.wrap), I.pending !== 0 ? d : 1);
        }, n.deflateEnd = function(b) {
          var X;
          return b && b.state ? (X = b.state.status) !== T && X !== 69 && X !== 73 && X !== 91 && X !== 103 && X !== M && X !== 666 ? ne(b, m) : (b.state = null, X === M ? ne(b, -3) : d) : m;
        }, n.deflateSetDictionary = function(b, X) {
          var W, I, B, U, K, J, H, te, se = X.length;
          if (!b || !b.state || (U = (W = b.state).wrap) === 2 || U === 1 && W.status !== T || W.lookahead) return m;
          for (U === 1 && (b.adler = c(b.adler, X, se, 0)), W.wrap = 0, se >= W.w_size && (U === 0 && (Q(W.head), W.strstart = 0, W.block_start = 0, W.insert = 0), te = new l.Buf8(W.w_size), l.arraySet(te, X, se - W.w_size, W.w_size, 0), X = te, se = W.w_size), K = b.avail_in, J = b.next_in, H = b.input, b.avail_in = se, b.next_in = 0, b.input = X, V(W); W.lookahead >= R; ) {
            for (I = W.strstart, B = W.lookahead - (R - 1); W.ins_h = (W.ins_h << W.hash_shift ^ W.window[I + R - 1]) & W.hash_mask, W.prev[I & W.w_mask] = W.head[W.ins_h], W.head[W.ins_h] = I, I++, --B; ) ;
            W.strstart = I, W.lookahead = R - 1, V(W);
          }
          return W.strstart += W.lookahead, W.block_start = W.strstart, W.insert = W.lookahead, W.lookahead = 0, W.match_length = W.prev_length = R - 1, W.match_available = 0, b.next_in = J, b.input = H, b.avail_in = K, W.wrap = U, d;
        }, n.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(t, s, n) {
        s.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
        };
      }, {}], 48: [function(t, s, n) {
        s.exports = function(o, l) {
          var A, c, a, i, f, y, d, m, u, g, p, h, _, E, v, C, x, P, R, k, O, T, M, w, G;
          A = o.state, c = o.next_in, w = o.input, a = c + (o.avail_in - 5), i = o.next_out, G = o.output, f = i - (l - o.avail_out), y = i + (o.avail_out - 257), d = A.dmax, m = A.wsize, u = A.whave, g = A.wnext, p = A.window, h = A.hold, _ = A.bits, E = A.lencode, v = A.distcode, C = (1 << A.lenbits) - 1, x = (1 << A.distbits) - 1;
          e: do {
            _ < 15 && (h += w[c++] << _, _ += 8, h += w[c++] << _, _ += 8), P = E[h & C];
            t: for (; ; ) {
              if (h >>>= R = P >>> 24, _ -= R, (R = P >>> 16 & 255) === 0) G[i++] = 65535 & P;
              else {
                if (!(16 & R)) {
                  if ((64 & R) == 0) {
                    P = E[(65535 & P) + (h & (1 << R) - 1)];
                    continue t;
                  }
                  if (32 & R) {
                    A.mode = 12;
                    break e;
                  }
                  o.msg = "invalid literal/length code", A.mode = 30;
                  break e;
                }
                k = 65535 & P, (R &= 15) && (_ < R && (h += w[c++] << _, _ += 8), k += h & (1 << R) - 1, h >>>= R, _ -= R), _ < 15 && (h += w[c++] << _, _ += 8, h += w[c++] << _, _ += 8), P = v[h & x];
                r: for (; ; ) {
                  if (h >>>= R = P >>> 24, _ -= R, !(16 & (R = P >>> 16 & 255))) {
                    if ((64 & R) == 0) {
                      P = v[(65535 & P) + (h & (1 << R) - 1)];
                      continue r;
                    }
                    o.msg = "invalid distance code", A.mode = 30;
                    break e;
                  }
                  if (O = 65535 & P, _ < (R &= 15) && (h += w[c++] << _, (_ += 8) < R && (h += w[c++] << _, _ += 8)), d < (O += h & (1 << R) - 1)) {
                    o.msg = "invalid distance too far back", A.mode = 30;
                    break e;
                  }
                  if (h >>>= R, _ -= R, (R = i - f) < O) {
                    if (u < (R = O - R) && A.sane) {
                      o.msg = "invalid distance too far back", A.mode = 30;
                      break e;
                    }
                    if (M = p, (T = 0) === g) {
                      if (T += m - R, R < k) {
                        for (k -= R; G[i++] = p[T++], --R; ) ;
                        T = i - O, M = G;
                      }
                    } else if (g < R) {
                      if (T += m + g - R, (R -= g) < k) {
                        for (k -= R; G[i++] = p[T++], --R; ) ;
                        if (T = 0, g < k) {
                          for (k -= R = g; G[i++] = p[T++], --R; ) ;
                          T = i - O, M = G;
                        }
                      }
                    } else if (T += g - R, R < k) {
                      for (k -= R; G[i++] = p[T++], --R; ) ;
                      T = i - O, M = G;
                    }
                    for (; 2 < k; ) G[i++] = M[T++], G[i++] = M[T++], G[i++] = M[T++], k -= 3;
                    k && (G[i++] = M[T++], 1 < k && (G[i++] = M[T++]));
                  } else {
                    for (T = i - O; G[i++] = G[T++], G[i++] = G[T++], G[i++] = G[T++], 2 < (k -= 3); ) ;
                    k && (G[i++] = G[T++], 1 < k && (G[i++] = G[T++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (c < a && i < y);
          c -= k = _ >> 3, h &= (1 << (_ -= k << 3)) - 1, o.next_in = c, o.next_out = i, o.avail_in = c < a ? a - c + 5 : 5 - (c - a), o.avail_out = i < y ? y - i + 257 : 257 - (i - y), A.hold = h, A.bits = _;
        };
      }, {}], 49: [function(t, s, n) {
        var o = t("../utils/common"), l = t("./adler32"), A = t("./crc32"), c = t("./inffast"), a = t("./inftrees"), i = 1, f = 2, y = 0, d = -2, m = 1, u = 852, g = 592;
        function p(T) {
          return (T >>> 24 & 255) + (T >>> 8 & 65280) + ((65280 & T) << 8) + ((255 & T) << 24);
        }
        function h() {
          this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new o.Buf16(320), this.work = new o.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function _(T) {
          var M;
          return T && T.state ? (M = T.state, T.total_in = T.total_out = M.total = 0, T.msg = "", M.wrap && (T.adler = 1 & M.wrap), M.mode = m, M.last = 0, M.havedict = 0, M.dmax = 32768, M.head = null, M.hold = 0, M.bits = 0, M.lencode = M.lendyn = new o.Buf32(u), M.distcode = M.distdyn = new o.Buf32(g), M.sane = 1, M.back = -1, y) : d;
        }
        function E(T) {
          var M;
          return T && T.state ? ((M = T.state).wsize = 0, M.whave = 0, M.wnext = 0, _(T)) : d;
        }
        function v(T, M) {
          var w, G;
          return T && T.state ? (G = T.state, M < 0 ? (w = 0, M = -M) : (w = 1 + (M >> 4), M < 48 && (M &= 15)), M && (M < 8 || 15 < M) ? d : (G.window !== null && G.wbits !== M && (G.window = null), G.wrap = w, G.wbits = M, E(T))) : d;
        }
        function C(T, M) {
          var w, G;
          return T ? (G = new h(), (T.state = G).window = null, (w = v(T, M)) !== y && (T.state = null), w) : d;
        }
        var x, P, R = !0;
        function k(T) {
          if (R) {
            var M;
            for (x = new o.Buf32(512), P = new o.Buf32(32), M = 0; M < 144; ) T.lens[M++] = 8;
            for (; M < 256; ) T.lens[M++] = 9;
            for (; M < 280; ) T.lens[M++] = 7;
            for (; M < 288; ) T.lens[M++] = 8;
            for (a(i, T.lens, 0, 288, x, 0, T.work, { bits: 9 }), M = 0; M < 32; ) T.lens[M++] = 5;
            a(f, T.lens, 0, 32, P, 0, T.work, { bits: 5 }), R = !1;
          }
          T.lencode = x, T.lenbits = 9, T.distcode = P, T.distbits = 5;
        }
        function O(T, M, w, G) {
          var ee, Y = T.state;
          return Y.window === null && (Y.wsize = 1 << Y.wbits, Y.wnext = 0, Y.whave = 0, Y.window = new o.Buf8(Y.wsize)), G >= Y.wsize ? (o.arraySet(Y.window, M, w - Y.wsize, Y.wsize, 0), Y.wnext = 0, Y.whave = Y.wsize) : (G < (ee = Y.wsize - Y.wnext) && (ee = G), o.arraySet(Y.window, M, w - G, ee, Y.wnext), (G -= ee) ? (o.arraySet(Y.window, M, w - G, G, 0), Y.wnext = G, Y.whave = Y.wsize) : (Y.wnext += ee, Y.wnext === Y.wsize && (Y.wnext = 0), Y.whave < Y.wsize && (Y.whave += ee))), 0;
        }
        n.inflateReset = E, n.inflateReset2 = v, n.inflateResetKeep = _, n.inflateInit = function(T) {
          return C(T, 15);
        }, n.inflateInit2 = C, n.inflate = function(T, M) {
          var w, G, ee, Y, ne, Z, Q, D, F, $, L, N, V, oe, ae, le, Ae, z, q, j, b, X, W, I, B = 0, U = new o.Buf8(4), K = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!T || !T.state || !T.output || !T.input && T.avail_in !== 0) return d;
          (w = T.state).mode === 12 && (w.mode = 13), ne = T.next_out, ee = T.output, Q = T.avail_out, Y = T.next_in, G = T.input, Z = T.avail_in, D = w.hold, F = w.bits, $ = Z, L = Q, X = y;
          e: for (; ; ) switch (w.mode) {
            case m:
              if (w.wrap === 0) {
                w.mode = 13;
                break;
              }
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if (2 & w.wrap && D === 35615) {
                U[w.check = 0] = 255 & D, U[1] = D >>> 8 & 255, w.check = A(w.check, U, 2, 0), F = D = 0, w.mode = 2;
                break;
              }
              if (w.flags = 0, w.head && (w.head.done = !1), !(1 & w.wrap) || (((255 & D) << 8) + (D >> 8)) % 31) {
                T.msg = "incorrect header check", w.mode = 30;
                break;
              }
              if ((15 & D) != 8) {
                T.msg = "unknown compression method", w.mode = 30;
                break;
              }
              if (F -= 4, b = 8 + (15 & (D >>>= 4)), w.wbits === 0) w.wbits = b;
              else if (b > w.wbits) {
                T.msg = "invalid window size", w.mode = 30;
                break;
              }
              w.dmax = 1 << b, T.adler = w.check = 1, w.mode = 512 & D ? 10 : 12, F = D = 0;
              break;
            case 2:
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if (w.flags = D, (255 & w.flags) != 8) {
                T.msg = "unknown compression method", w.mode = 30;
                break;
              }
              if (57344 & w.flags) {
                T.msg = "unknown header flags set", w.mode = 30;
                break;
              }
              w.head && (w.head.text = D >> 8 & 1), 512 & w.flags && (U[0] = 255 & D, U[1] = D >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = D = 0, w.mode = 3;
            case 3:
              for (; F < 32; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              w.head && (w.head.time = D), 512 & w.flags && (U[0] = 255 & D, U[1] = D >>> 8 & 255, U[2] = D >>> 16 & 255, U[3] = D >>> 24 & 255, w.check = A(w.check, U, 4, 0)), F = D = 0, w.mode = 4;
            case 4:
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              w.head && (w.head.xflags = 255 & D, w.head.os = D >> 8), 512 & w.flags && (U[0] = 255 & D, U[1] = D >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = D = 0, w.mode = 5;
            case 5:
              if (1024 & w.flags) {
                for (; F < 16; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                w.length = D, w.head && (w.head.extra_len = D), 512 & w.flags && (U[0] = 255 & D, U[1] = D >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = D = 0;
              } else w.head && (w.head.extra = null);
              w.mode = 6;
            case 6:
              if (1024 & w.flags && (Z < (N = w.length) && (N = Z), N && (w.head && (b = w.head.extra_len - w.length, w.head.extra || (w.head.extra = new Array(w.head.extra_len)), o.arraySet(w.head.extra, G, Y, N, b)), 512 & w.flags && (w.check = A(w.check, G, N, Y)), Z -= N, Y += N, w.length -= N), w.length)) break e;
              w.length = 0, w.mode = 7;
            case 7:
              if (2048 & w.flags) {
                if (Z === 0) break e;
                for (N = 0; b = G[Y + N++], w.head && b && w.length < 65536 && (w.head.name += String.fromCharCode(b)), b && N < Z; ) ;
                if (512 & w.flags && (w.check = A(w.check, G, N, Y)), Z -= N, Y += N, b) break e;
              } else w.head && (w.head.name = null);
              w.length = 0, w.mode = 8;
            case 8:
              if (4096 & w.flags) {
                if (Z === 0) break e;
                for (N = 0; b = G[Y + N++], w.head && b && w.length < 65536 && (w.head.comment += String.fromCharCode(b)), b && N < Z; ) ;
                if (512 & w.flags && (w.check = A(w.check, G, N, Y)), Z -= N, Y += N, b) break e;
              } else w.head && (w.head.comment = null);
              w.mode = 9;
            case 9:
              if (512 & w.flags) {
                for (; F < 16; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                if (D !== (65535 & w.check)) {
                  T.msg = "header crc mismatch", w.mode = 30;
                  break;
                }
                F = D = 0;
              }
              w.head && (w.head.hcrc = w.flags >> 9 & 1, w.head.done = !0), T.adler = w.check = 0, w.mode = 12;
              break;
            case 10:
              for (; F < 32; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              T.adler = w.check = p(D), F = D = 0, w.mode = 11;
            case 11:
              if (w.havedict === 0) return T.next_out = ne, T.avail_out = Q, T.next_in = Y, T.avail_in = Z, w.hold = D, w.bits = F, 2;
              T.adler = w.check = 1, w.mode = 12;
            case 12:
              if (M === 5 || M === 6) break e;
            case 13:
              if (w.last) {
                D >>>= 7 & F, F -= 7 & F, w.mode = 27;
                break;
              }
              for (; F < 3; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              switch (w.last = 1 & D, F -= 1, 3 & (D >>>= 1)) {
                case 0:
                  w.mode = 14;
                  break;
                case 1:
                  if (k(w), w.mode = 20, M !== 6) break;
                  D >>>= 2, F -= 2;
                  break e;
                case 2:
                  w.mode = 17;
                  break;
                case 3:
                  T.msg = "invalid block type", w.mode = 30;
              }
              D >>>= 2, F -= 2;
              break;
            case 14:
              for (D >>>= 7 & F, F -= 7 & F; F < 32; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if ((65535 & D) != (D >>> 16 ^ 65535)) {
                T.msg = "invalid stored block lengths", w.mode = 30;
                break;
              }
              if (w.length = 65535 & D, F = D = 0, w.mode = 15, M === 6) break e;
            case 15:
              w.mode = 16;
            case 16:
              if (N = w.length) {
                if (Z < N && (N = Z), Q < N && (N = Q), N === 0) break e;
                o.arraySet(ee, G, Y, N, ne), Z -= N, Y += N, Q -= N, ne += N, w.length -= N;
                break;
              }
              w.mode = 12;
              break;
            case 17:
              for (; F < 14; ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if (w.nlen = 257 + (31 & D), D >>>= 5, F -= 5, w.ndist = 1 + (31 & D), D >>>= 5, F -= 5, w.ncode = 4 + (15 & D), D >>>= 4, F -= 4, 286 < w.nlen || 30 < w.ndist) {
                T.msg = "too many length or distance symbols", w.mode = 30;
                break;
              }
              w.have = 0, w.mode = 18;
            case 18:
              for (; w.have < w.ncode; ) {
                for (; F < 3; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                w.lens[K[w.have++]] = 7 & D, D >>>= 3, F -= 3;
              }
              for (; w.have < 19; ) w.lens[K[w.have++]] = 0;
              if (w.lencode = w.lendyn, w.lenbits = 7, W = { bits: w.lenbits }, X = a(0, w.lens, 0, 19, w.lencode, 0, w.work, W), w.lenbits = W.bits, X) {
                T.msg = "invalid code lengths set", w.mode = 30;
                break;
              }
              w.have = 0, w.mode = 19;
            case 19:
              for (; w.have < w.nlen + w.ndist; ) {
                for (; le = (B = w.lencode[D & (1 << w.lenbits) - 1]) >>> 16 & 255, Ae = 65535 & B, !((ae = B >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                if (Ae < 16) D >>>= ae, F -= ae, w.lens[w.have++] = Ae;
                else {
                  if (Ae === 16) {
                    for (I = ae + 2; F < I; ) {
                      if (Z === 0) break e;
                      Z--, D += G[Y++] << F, F += 8;
                    }
                    if (D >>>= ae, F -= ae, w.have === 0) {
                      T.msg = "invalid bit length repeat", w.mode = 30;
                      break;
                    }
                    b = w.lens[w.have - 1], N = 3 + (3 & D), D >>>= 2, F -= 2;
                  } else if (Ae === 17) {
                    for (I = ae + 3; F < I; ) {
                      if (Z === 0) break e;
                      Z--, D += G[Y++] << F, F += 8;
                    }
                    F -= ae, b = 0, N = 3 + (7 & (D >>>= ae)), D >>>= 3, F -= 3;
                  } else {
                    for (I = ae + 7; F < I; ) {
                      if (Z === 0) break e;
                      Z--, D += G[Y++] << F, F += 8;
                    }
                    F -= ae, b = 0, N = 11 + (127 & (D >>>= ae)), D >>>= 7, F -= 7;
                  }
                  if (w.have + N > w.nlen + w.ndist) {
                    T.msg = "invalid bit length repeat", w.mode = 30;
                    break;
                  }
                  for (; N--; ) w.lens[w.have++] = b;
                }
              }
              if (w.mode === 30) break;
              if (w.lens[256] === 0) {
                T.msg = "invalid code -- missing end-of-block", w.mode = 30;
                break;
              }
              if (w.lenbits = 9, W = { bits: w.lenbits }, X = a(i, w.lens, 0, w.nlen, w.lencode, 0, w.work, W), w.lenbits = W.bits, X) {
                T.msg = "invalid literal/lengths set", w.mode = 30;
                break;
              }
              if (w.distbits = 6, w.distcode = w.distdyn, W = { bits: w.distbits }, X = a(f, w.lens, w.nlen, w.ndist, w.distcode, 0, w.work, W), w.distbits = W.bits, X) {
                T.msg = "invalid distances set", w.mode = 30;
                break;
              }
              if (w.mode = 20, M === 6) break e;
            case 20:
              w.mode = 21;
            case 21:
              if (6 <= Z && 258 <= Q) {
                T.next_out = ne, T.avail_out = Q, T.next_in = Y, T.avail_in = Z, w.hold = D, w.bits = F, c(T, L), ne = T.next_out, ee = T.output, Q = T.avail_out, Y = T.next_in, G = T.input, Z = T.avail_in, D = w.hold, F = w.bits, w.mode === 12 && (w.back = -1);
                break;
              }
              for (w.back = 0; le = (B = w.lencode[D & (1 << w.lenbits) - 1]) >>> 16 & 255, Ae = 65535 & B, !((ae = B >>> 24) <= F); ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if (le && (240 & le) == 0) {
                for (z = ae, q = le, j = Ae; le = (B = w.lencode[j + ((D & (1 << z + q) - 1) >> z)]) >>> 16 & 255, Ae = 65535 & B, !(z + (ae = B >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                D >>>= z, F -= z, w.back += z;
              }
              if (D >>>= ae, F -= ae, w.back += ae, w.length = Ae, le === 0) {
                w.mode = 26;
                break;
              }
              if (32 & le) {
                w.back = -1, w.mode = 12;
                break;
              }
              if (64 & le) {
                T.msg = "invalid literal/length code", w.mode = 30;
                break;
              }
              w.extra = 15 & le, w.mode = 22;
            case 22:
              if (w.extra) {
                for (I = w.extra; F < I; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                w.length += D & (1 << w.extra) - 1, D >>>= w.extra, F -= w.extra, w.back += w.extra;
              }
              w.was = w.length, w.mode = 23;
            case 23:
              for (; le = (B = w.distcode[D & (1 << w.distbits) - 1]) >>> 16 & 255, Ae = 65535 & B, !((ae = B >>> 24) <= F); ) {
                if (Z === 0) break e;
                Z--, D += G[Y++] << F, F += 8;
              }
              if ((240 & le) == 0) {
                for (z = ae, q = le, j = Ae; le = (B = w.distcode[j + ((D & (1 << z + q) - 1) >> z)]) >>> 16 & 255, Ae = 65535 & B, !(z + (ae = B >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                D >>>= z, F -= z, w.back += z;
              }
              if (D >>>= ae, F -= ae, w.back += ae, 64 & le) {
                T.msg = "invalid distance code", w.mode = 30;
                break;
              }
              w.offset = Ae, w.extra = 15 & le, w.mode = 24;
            case 24:
              if (w.extra) {
                for (I = w.extra; F < I; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                w.offset += D & (1 << w.extra) - 1, D >>>= w.extra, F -= w.extra, w.back += w.extra;
              }
              if (w.offset > w.dmax) {
                T.msg = "invalid distance too far back", w.mode = 30;
                break;
              }
              w.mode = 25;
            case 25:
              if (Q === 0) break e;
              if (N = L - Q, w.offset > N) {
                if ((N = w.offset - N) > w.whave && w.sane) {
                  T.msg = "invalid distance too far back", w.mode = 30;
                  break;
                }
                V = N > w.wnext ? (N -= w.wnext, w.wsize - N) : w.wnext - N, N > w.length && (N = w.length), oe = w.window;
              } else oe = ee, V = ne - w.offset, N = w.length;
              for (Q < N && (N = Q), Q -= N, w.length -= N; ee[ne++] = oe[V++], --N; ) ;
              w.length === 0 && (w.mode = 21);
              break;
            case 26:
              if (Q === 0) break e;
              ee[ne++] = w.length, Q--, w.mode = 21;
              break;
            case 27:
              if (w.wrap) {
                for (; F < 32; ) {
                  if (Z === 0) break e;
                  Z--, D |= G[Y++] << F, F += 8;
                }
                if (L -= Q, T.total_out += L, w.total += L, L && (T.adler = w.check = w.flags ? A(w.check, ee, L, ne - L) : l(w.check, ee, L, ne - L)), L = Q, (w.flags ? D : p(D)) !== w.check) {
                  T.msg = "incorrect data check", w.mode = 30;
                  break;
                }
                F = D = 0;
              }
              w.mode = 28;
            case 28:
              if (w.wrap && w.flags) {
                for (; F < 32; ) {
                  if (Z === 0) break e;
                  Z--, D += G[Y++] << F, F += 8;
                }
                if (D !== (4294967295 & w.total)) {
                  T.msg = "incorrect length check", w.mode = 30;
                  break;
                }
                F = D = 0;
              }
              w.mode = 29;
            case 29:
              X = 1;
              break e;
            case 30:
              X = -3;
              break e;
            case 31:
              return -4;
            default:
              return d;
          }
          return T.next_out = ne, T.avail_out = Q, T.next_in = Y, T.avail_in = Z, w.hold = D, w.bits = F, (w.wsize || L !== T.avail_out && w.mode < 30 && (w.mode < 27 || M !== 4)) && O(T, T.output, T.next_out, L - T.avail_out) ? (w.mode = 31, -4) : ($ -= T.avail_in, L -= T.avail_out, T.total_in += $, T.total_out += L, w.total += L, w.wrap && L && (T.adler = w.check = w.flags ? A(w.check, ee, L, T.next_out - L) : l(w.check, ee, L, T.next_out - L)), T.data_type = w.bits + (w.last ? 64 : 0) + (w.mode === 12 ? 128 : 0) + (w.mode === 20 || w.mode === 15 ? 256 : 0), ($ == 0 && L === 0 || M === 4) && X === y && (X = -5), X);
        }, n.inflateEnd = function(T) {
          if (!T || !T.state) return d;
          var M = T.state;
          return M.window && (M.window = null), T.state = null, y;
        }, n.inflateGetHeader = function(T, M) {
          var w;
          return T && T.state ? (2 & (w = T.state).wrap) == 0 ? d : ((w.head = M).done = !1, y) : d;
        }, n.inflateSetDictionary = function(T, M) {
          var w, G = M.length;
          return T && T.state ? (w = T.state).wrap !== 0 && w.mode !== 11 ? d : w.mode === 11 && l(1, M, G, 0) !== w.check ? -3 : O(T, M, G, G) ? (w.mode = 31, -4) : (w.havedict = 1, y) : d;
        }, n.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(t, s, n) {
        var o = t("../utils/common"), l = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], A = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], c = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], a = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        s.exports = function(i, f, y, d, m, u, g, p) {
          var h, _, E, v, C, x, P, R, k, O = p.bits, T = 0, M = 0, w = 0, G = 0, ee = 0, Y = 0, ne = 0, Z = 0, Q = 0, D = 0, F = null, $ = 0, L = new o.Buf16(16), N = new o.Buf16(16), V = null, oe = 0;
          for (T = 0; T <= 15; T++) L[T] = 0;
          for (M = 0; M < d; M++) L[f[y + M]]++;
          for (ee = O, G = 15; 1 <= G && L[G] === 0; G--) ;
          if (G < ee && (ee = G), G === 0) return m[u++] = 20971520, m[u++] = 20971520, p.bits = 1, 0;
          for (w = 1; w < G && L[w] === 0; w++) ;
          for (ee < w && (ee = w), T = Z = 1; T <= 15; T++) if (Z <<= 1, (Z -= L[T]) < 0) return -1;
          if (0 < Z && (i === 0 || G !== 1)) return -1;
          for (N[1] = 0, T = 1; T < 15; T++) N[T + 1] = N[T] + L[T];
          for (M = 0; M < d; M++) f[y + M] !== 0 && (g[N[f[y + M]]++] = M);
          if (x = i === 0 ? (F = V = g, 19) : i === 1 ? (F = l, $ -= 257, V = A, oe -= 257, 256) : (F = c, V = a, -1), T = w, C = u, ne = M = D = 0, E = -1, v = (Q = 1 << (Y = ee)) - 1, i === 1 && 852 < Q || i === 2 && 592 < Q) return 1;
          for (; ; ) {
            for (P = T - ne, k = g[M] < x ? (R = 0, g[M]) : g[M] > x ? (R = V[oe + g[M]], F[$ + g[M]]) : (R = 96, 0), h = 1 << T - ne, w = _ = 1 << Y; m[C + (D >> ne) + (_ -= h)] = P << 24 | R << 16 | k | 0, _ !== 0; ) ;
            for (h = 1 << T - 1; D & h; ) h >>= 1;
            if (h !== 0 ? (D &= h - 1, D += h) : D = 0, M++, --L[T] == 0) {
              if (T === G) break;
              T = f[y + g[M]];
            }
            if (ee < T && (D & v) !== E) {
              for (ne === 0 && (ne = ee), C += w, Z = 1 << (Y = T - ne); Y + ne < G && !((Z -= L[Y + ne]) <= 0); ) Y++, Z <<= 1;
              if (Q += 1 << Y, i === 1 && 852 < Q || i === 2 && 592 < Q) return 1;
              m[E = D & v] = ee << 24 | Y << 16 | C - u | 0;
            }
          }
          return D !== 0 && (m[C + D] = T - ne << 24 | 64 << 16 | 0), p.bits = ee, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(t, s, n) {
        s.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(t, s, n) {
        var o = t("../utils/common"), l = 0, A = 1;
        function c(B) {
          for (var U = B.length; 0 <= --U; ) B[U] = 0;
        }
        var a = 0, i = 29, f = 256, y = f + 1 + i, d = 30, m = 19, u = 2 * y + 1, g = 15, p = 16, h = 7, _ = 256, E = 16, v = 17, C = 18, x = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], P = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], k = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], O = new Array(2 * (y + 2));
        c(O);
        var T = new Array(2 * d);
        c(T);
        var M = new Array(512);
        c(M);
        var w = new Array(256);
        c(w);
        var G = new Array(i);
        c(G);
        var ee, Y, ne, Z = new Array(d);
        function Q(B, U, K, J, H) {
          this.static_tree = B, this.extra_bits = U, this.extra_base = K, this.elems = J, this.max_length = H, this.has_stree = B && B.length;
        }
        function D(B, U) {
          this.dyn_tree = B, this.max_code = 0, this.stat_desc = U;
        }
        function F(B) {
          return B < 256 ? M[B] : M[256 + (B >>> 7)];
        }
        function $(B, U) {
          B.pending_buf[B.pending++] = 255 & U, B.pending_buf[B.pending++] = U >>> 8 & 255;
        }
        function L(B, U, K) {
          B.bi_valid > p - K ? (B.bi_buf |= U << B.bi_valid & 65535, $(B, B.bi_buf), B.bi_buf = U >> p - B.bi_valid, B.bi_valid += K - p) : (B.bi_buf |= U << B.bi_valid & 65535, B.bi_valid += K);
        }
        function N(B, U, K) {
          L(B, K[2 * U], K[2 * U + 1]);
        }
        function V(B, U) {
          for (var K = 0; K |= 1 & B, B >>>= 1, K <<= 1, 0 < --U; ) ;
          return K >>> 1;
        }
        function oe(B, U, K) {
          var J, H, te = new Array(g + 1), se = 0;
          for (J = 1; J <= g; J++) te[J] = se = se + K[J - 1] << 1;
          for (H = 0; H <= U; H++) {
            var ie = B[2 * H + 1];
            ie !== 0 && (B[2 * H] = V(te[ie]++, ie));
          }
        }
        function ae(B) {
          var U;
          for (U = 0; U < y; U++) B.dyn_ltree[2 * U] = 0;
          for (U = 0; U < d; U++) B.dyn_dtree[2 * U] = 0;
          for (U = 0; U < m; U++) B.bl_tree[2 * U] = 0;
          B.dyn_ltree[2 * _] = 1, B.opt_len = B.static_len = 0, B.last_lit = B.matches = 0;
        }
        function le(B) {
          8 < B.bi_valid ? $(B, B.bi_buf) : 0 < B.bi_valid && (B.pending_buf[B.pending++] = B.bi_buf), B.bi_buf = 0, B.bi_valid = 0;
        }
        function Ae(B, U, K, J) {
          var H = 2 * U, te = 2 * K;
          return B[H] < B[te] || B[H] === B[te] && J[U] <= J[K];
        }
        function z(B, U, K) {
          for (var J = B.heap[K], H = K << 1; H <= B.heap_len && (H < B.heap_len && Ae(U, B.heap[H + 1], B.heap[H], B.depth) && H++, !Ae(U, J, B.heap[H], B.depth)); ) B.heap[K] = B.heap[H], K = H, H <<= 1;
          B.heap[K] = J;
        }
        function q(B, U, K) {
          var J, H, te, se, ie = 0;
          if (B.last_lit !== 0) for (; J = B.pending_buf[B.d_buf + 2 * ie] << 8 | B.pending_buf[B.d_buf + 2 * ie + 1], H = B.pending_buf[B.l_buf + ie], ie++, J === 0 ? N(B, H, U) : (N(B, (te = w[H]) + f + 1, U), (se = x[te]) !== 0 && L(B, H -= G[te], se), N(B, te = F(--J), K), (se = P[te]) !== 0 && L(B, J -= Z[te], se)), ie < B.last_lit; ) ;
          N(B, _, U);
        }
        function j(B, U) {
          var K, J, H, te = U.dyn_tree, se = U.stat_desc.static_tree, ie = U.stat_desc.has_stree, ce = U.stat_desc.elems, Ce = -1;
          for (B.heap_len = 0, B.heap_max = u, K = 0; K < ce; K++) te[2 * K] !== 0 ? (B.heap[++B.heap_len] = Ce = K, B.depth[K] = 0) : te[2 * K + 1] = 0;
          for (; B.heap_len < 2; ) te[2 * (H = B.heap[++B.heap_len] = Ce < 2 ? ++Ce : 0)] = 1, B.depth[H] = 0, B.opt_len--, ie && (B.static_len -= se[2 * H + 1]);
          for (U.max_code = Ce, K = B.heap_len >> 1; 1 <= K; K--) z(B, te, K);
          for (H = ce; K = B.heap[1], B.heap[1] = B.heap[B.heap_len--], z(B, te, 1), J = B.heap[1], B.heap[--B.heap_max] = K, B.heap[--B.heap_max] = J, te[2 * H] = te[2 * K] + te[2 * J], B.depth[H] = (B.depth[K] >= B.depth[J] ? B.depth[K] : B.depth[J]) + 1, te[2 * K + 1] = te[2 * J + 1] = H, B.heap[1] = H++, z(B, te, 1), 2 <= B.heap_len; ) ;
          B.heap[--B.heap_max] = B.heap[1], (function(ye, Se) {
            var nt, We, Et, Le, Ot, Xr, qe = Se.dyn_tree, Ia = Se.max_code, Xi = Se.stat_desc.static_tree, Wi = Se.stat_desc.has_stree, qi = Se.stat_desc.extra_bits, Fa = Se.stat_desc.extra_base, Tt = Se.stat_desc.max_length, $t = 0;
            for (Le = 0; Le <= g; Le++) ye.bl_count[Le] = 0;
            for (qe[2 * ye.heap[ye.heap_max] + 1] = 0, nt = ye.heap_max + 1; nt < u; nt++) Tt < (Le = qe[2 * qe[2 * (We = ye.heap[nt]) + 1] + 1] + 1) && (Le = Tt, $t++), qe[2 * We + 1] = Le, Ia < We || (ye.bl_count[Le]++, Ot = 0, Fa <= We && (Ot = qi[We - Fa]), Xr = qe[2 * We], ye.opt_len += Xr * (Le + Ot), Wi && (ye.static_len += Xr * (Xi[2 * We + 1] + Ot)));
            if ($t !== 0) {
              do {
                for (Le = Tt - 1; ye.bl_count[Le] === 0; ) Le--;
                ye.bl_count[Le]--, ye.bl_count[Le + 1] += 2, ye.bl_count[Tt]--, $t -= 2;
              } while (0 < $t);
              for (Le = Tt; Le !== 0; Le--) for (We = ye.bl_count[Le]; We !== 0; ) Ia < (Et = ye.heap[--nt]) || (qe[2 * Et + 1] !== Le && (ye.opt_len += (Le - qe[2 * Et + 1]) * qe[2 * Et], qe[2 * Et + 1] = Le), We--);
            }
          })(B, U), oe(te, Ce, B.bl_count);
        }
        function b(B, U, K) {
          var J, H, te = -1, se = U[1], ie = 0, ce = 7, Ce = 4;
          for (se === 0 && (ce = 138, Ce = 3), U[2 * (K + 1) + 1] = 65535, J = 0; J <= K; J++) H = se, se = U[2 * (J + 1) + 1], ++ie < ce && H === se || (ie < Ce ? B.bl_tree[2 * H] += ie : H !== 0 ? (H !== te && B.bl_tree[2 * H]++, B.bl_tree[2 * E]++) : ie <= 10 ? B.bl_tree[2 * v]++ : B.bl_tree[2 * C]++, te = H, Ce = (ie = 0) === se ? (ce = 138, 3) : H === se ? (ce = 6, 3) : (ce = 7, 4));
        }
        function X(B, U, K) {
          var J, H, te = -1, se = U[1], ie = 0, ce = 7, Ce = 4;
          for (se === 0 && (ce = 138, Ce = 3), J = 0; J <= K; J++) if (H = se, se = U[2 * (J + 1) + 1], !(++ie < ce && H === se)) {
            if (ie < Ce) for (; N(B, H, B.bl_tree), --ie != 0; ) ;
            else H !== 0 ? (H !== te && (N(B, H, B.bl_tree), ie--), N(B, E, B.bl_tree), L(B, ie - 3, 2)) : ie <= 10 ? (N(B, v, B.bl_tree), L(B, ie - 3, 3)) : (N(B, C, B.bl_tree), L(B, ie - 11, 7));
            te = H, Ce = (ie = 0) === se ? (ce = 138, 3) : H === se ? (ce = 6, 3) : (ce = 7, 4);
          }
        }
        c(Z);
        var W = !1;
        function I(B, U, K, J) {
          L(B, (a << 1) + (J ? 1 : 0), 3), (function(H, te, se, ie) {
            le(H), $(H, se), $(H, ~se), o.arraySet(H.pending_buf, H.window, te, se, H.pending), H.pending += se;
          })(B, U, K);
        }
        n._tr_init = function(B) {
          W || ((function() {
            var U, K, J, H, te, se = new Array(g + 1);
            for (H = J = 0; H < i - 1; H++) for (G[H] = J, U = 0; U < 1 << x[H]; U++) w[J++] = H;
            for (w[J - 1] = H, H = te = 0; H < 16; H++) for (Z[H] = te, U = 0; U < 1 << P[H]; U++) M[te++] = H;
            for (te >>= 7; H < d; H++) for (Z[H] = te << 7, U = 0; U < 1 << P[H] - 7; U++) M[256 + te++] = H;
            for (K = 0; K <= g; K++) se[K] = 0;
            for (U = 0; U <= 143; ) O[2 * U + 1] = 8, U++, se[8]++;
            for (; U <= 255; ) O[2 * U + 1] = 9, U++, se[9]++;
            for (; U <= 279; ) O[2 * U + 1] = 7, U++, se[7]++;
            for (; U <= 287; ) O[2 * U + 1] = 8, U++, se[8]++;
            for (oe(O, y + 1, se), U = 0; U < d; U++) T[2 * U + 1] = 5, T[2 * U] = V(U, 5);
            ee = new Q(O, x, f + 1, y, g), Y = new Q(T, P, 0, d, g), ne = new Q(new Array(0), R, 0, m, h);
          })(), W = !0), B.l_desc = new D(B.dyn_ltree, ee), B.d_desc = new D(B.dyn_dtree, Y), B.bl_desc = new D(B.bl_tree, ne), B.bi_buf = 0, B.bi_valid = 0, ae(B);
        }, n._tr_stored_block = I, n._tr_flush_block = function(B, U, K, J) {
          var H, te, se = 0;
          0 < B.level ? (B.strm.data_type === 2 && (B.strm.data_type = (function(ie) {
            var ce, Ce = 4093624447;
            for (ce = 0; ce <= 31; ce++, Ce >>>= 1) if (1 & Ce && ie.dyn_ltree[2 * ce] !== 0) return l;
            if (ie.dyn_ltree[18] !== 0 || ie.dyn_ltree[20] !== 0 || ie.dyn_ltree[26] !== 0) return A;
            for (ce = 32; ce < f; ce++) if (ie.dyn_ltree[2 * ce] !== 0) return A;
            return l;
          })(B)), j(B, B.l_desc), j(B, B.d_desc), se = (function(ie) {
            var ce;
            for (b(ie, ie.dyn_ltree, ie.l_desc.max_code), b(ie, ie.dyn_dtree, ie.d_desc.max_code), j(ie, ie.bl_desc), ce = m - 1; 3 <= ce && ie.bl_tree[2 * k[ce] + 1] === 0; ce--) ;
            return ie.opt_len += 3 * (ce + 1) + 5 + 5 + 4, ce;
          })(B), H = B.opt_len + 3 + 7 >>> 3, (te = B.static_len + 3 + 7 >>> 3) <= H && (H = te)) : H = te = K + 5, K + 4 <= H && U !== -1 ? I(B, U, K, J) : B.strategy === 4 || te === H ? (L(B, 2 + (J ? 1 : 0), 3), q(B, O, T)) : (L(B, 4 + (J ? 1 : 0), 3), (function(ie, ce, Ce, ye) {
            var Se;
            for (L(ie, ce - 257, 5), L(ie, Ce - 1, 5), L(ie, ye - 4, 4), Se = 0; Se < ye; Se++) L(ie, ie.bl_tree[2 * k[Se] + 1], 3);
            X(ie, ie.dyn_ltree, ce - 1), X(ie, ie.dyn_dtree, Ce - 1);
          })(B, B.l_desc.max_code + 1, B.d_desc.max_code + 1, se + 1), q(B, B.dyn_ltree, B.dyn_dtree)), ae(B), J && le(B);
        }, n._tr_tally = function(B, U, K) {
          return B.pending_buf[B.d_buf + 2 * B.last_lit] = U >>> 8 & 255, B.pending_buf[B.d_buf + 2 * B.last_lit + 1] = 255 & U, B.pending_buf[B.l_buf + B.last_lit] = 255 & K, B.last_lit++, U === 0 ? B.dyn_ltree[2 * K]++ : (B.matches++, U--, B.dyn_ltree[2 * (w[K] + f + 1)]++, B.dyn_dtree[2 * F(U)]++), B.last_lit === B.lit_bufsize - 1;
        }, n._tr_align = function(B) {
          L(B, 2, 3), N(B, _, O), (function(U) {
            U.bi_valid === 16 ? ($(U, U.bi_buf), U.bi_buf = 0, U.bi_valid = 0) : 8 <= U.bi_valid && (U.pending_buf[U.pending++] = 255 & U.bi_buf, U.bi_buf >>= 8, U.bi_valid -= 8);
          })(B);
        };
      }, { "../utils/common": 41 }], 53: [function(t, s, n) {
        s.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(t, s, n) {
        (function(o) {
          (function(l, A) {
            if (!l.setImmediate) {
              var c, a, i, f, y = 1, d = {}, m = !1, u = l.document, g = Object.getPrototypeOf && Object.getPrototypeOf(l);
              g = g && g.setTimeout ? g : l, c = {}.toString.call(l.process) === "[object process]" ? function(E) {
                process.nextTick(function() {
                  h(E);
                });
              } : (function() {
                if (l.postMessage && !l.importScripts) {
                  var E = !0, v = l.onmessage;
                  return l.onmessage = function() {
                    E = !1;
                  }, l.postMessage("", "*"), l.onmessage = v, E;
                }
              })() ? (f = "setImmediate$" + Math.random() + "$", l.addEventListener ? l.addEventListener("message", _, !1) : l.attachEvent("onmessage", _), function(E) {
                l.postMessage(f + E, "*");
              }) : l.MessageChannel ? ((i = new MessageChannel()).port1.onmessage = function(E) {
                h(E.data);
              }, function(E) {
                i.port2.postMessage(E);
              }) : u && "onreadystatechange" in u.createElement("script") ? (a = u.documentElement, function(E) {
                var v = u.createElement("script");
                v.onreadystatechange = function() {
                  h(E), v.onreadystatechange = null, a.removeChild(v), v = null;
                }, a.appendChild(v);
              }) : function(E) {
                setTimeout(h, 0, E);
              }, g.setImmediate = function(E) {
                typeof E != "function" && (E = new Function("" + E));
                for (var v = new Array(arguments.length - 1), C = 0; C < v.length; C++) v[C] = arguments[C + 1];
                var x = { callback: E, args: v };
                return d[y] = x, c(y), y++;
              }, g.clearImmediate = p;
            }
            function p(E) {
              delete d[E];
            }
            function h(E) {
              if (m) setTimeout(h, 0, E);
              else {
                var v = d[E];
                if (v) {
                  m = !0;
                  try {
                    (function(C) {
                      var x = C.callback, P = C.args;
                      switch (P.length) {
                        case 0:
                          x();
                          break;
                        case 1:
                          x(P[0]);
                          break;
                        case 2:
                          x(P[0], P[1]);
                          break;
                        case 3:
                          x(P[0], P[1], P[2]);
                          break;
                        default:
                          x.apply(A, P);
                      }
                    })(v);
                  } finally {
                    p(E), m = !1;
                  }
                }
              }
            }
            function _(E) {
              E.source === l && typeof E.data == "string" && E.data.indexOf(f) === 0 && h(+E.data.slice(f.length));
            }
          })(typeof self > "u" ? o === void 0 ? this : o : self);
        }).call(this, typeof zt < "u" ? zt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}] }, {}, [10])(10);
    });
  })(Wr)), Wr.exports;
}
var Hi = Vi();
const ui = /* @__PURE__ */ Ca(Hi);
function Oe(e, r, t, s) {
  function n(o) {
    return o instanceof t ? o : new t(function(l) {
      l(o);
    });
  }
  return new (t || (t = Promise))(function(o, l) {
    function A(i) {
      try {
        a(s.next(i));
      } catch (f) {
        l(f);
      }
    }
    function c(i) {
      try {
        a(s.throw(i));
      } catch (f) {
        l(f);
      }
    }
    function a(i) {
      i.done ? o(i.value) : n(i.value).then(A, c);
    }
    a((s = s.apply(e, [])).next());
  });
}
const he = 914400, Ft = 12700, Pe = `\r
`, Qi = 2147483649, qr = /^[0-9a-fA-F]{6}$/, ji = 1.67, Yi = 27, ft = { type: "solid", color: "666666", pt: 1 }, hi = [0.05, 0.1, 0.05, 0.1], ut = { color: "363636", pt: 1 }, At = { color: "888888", style: "solid", size: 1, cap: "flat" }, Ie = "000000", Ue = 12, Ki = 18, ht = "LAYOUT_16x9", ua = "DEFAULT", pi = "333333", it = { type: "outer", blur: 3, offset: 23e3 / 12700, angle: 90, color: "000000", opacity: 0.35, rotateWithShape: !0 }, kt = [0.5, 0.5, 0.5, 0.5], Oa = { color: "000000" }, Ji = { size: 8, color: "FFFFFF", opacity: 0.75 }, Ye = "2094734552", Rr = "2094734553", Nt = "2094734554", ha = "2094734555", mi = "2094734556", Lt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), Bt = [
  "C0504D",
  "4F81BD",
  "9BBB59",
  "8064A2",
  "4BACC6",
  "F79646",
  "628FC6",
  "C86360",
  "C0504D",
  "4F81BD",
  "9BBB59",
  "8064A2",
  "4BACC6",
  "F79646",
  "628FC6",
  "C86360"
], Zi = [
  "5DA5DA",
  "FAA43A",
  "60BD68",
  "F17CB0",
  "B2912F",
  "B276B2",
  "DECF3F",
  "F15854",
  "A7A7A7",
  "5DA5DA",
  "FAA43A",
  "60BD68",
  "F17CB0",
  "B2912F",
  "B276B2",
  "DECF3F",
  "F15854",
  "A7A7A7"
];
var gt;
(function(e) {
  e.left = "left", e.center = "center", e.right = "right", e.justify = "justify";
})(gt || (gt = {}));
var yt;
(function(e) {
  e.b = "b", e.ctr = "ctr", e.t = "t";
})(yt || (yt = {}));
const gi = "{F7021451-1387-4CA6-816F-3879F97B5CBC}";
var pa;
(function(e) {
  e.arraybuffer = "arraybuffer", e.base64 = "base64", e.binarystring = "binarystring", e.blob = "blob", e.nodebuffer = "nodebuffer", e.uint8array = "uint8array";
})(pa || (pa = {}));
var ma;
(function(e) {
  e.area = "area", e.bar = "bar", e.bar3d = "bar3D", e.bubble = "bubble", e.bubble3d = "bubble3D", e.doughnut = "doughnut", e.line = "line", e.pie = "pie", e.radar = "radar", e.scatter = "scatter";
})(ma || (ma = {}));
var ga;
(function(e) {
  e.accentBorderCallout1 = "accentBorderCallout1", e.accentBorderCallout2 = "accentBorderCallout2", e.accentBorderCallout3 = "accentBorderCallout3", e.accentCallout1 = "accentCallout1", e.accentCallout2 = "accentCallout2", e.accentCallout3 = "accentCallout3", e.actionButtonBackPrevious = "actionButtonBackPrevious", e.actionButtonBeginning = "actionButtonBeginning", e.actionButtonBlank = "actionButtonBlank", e.actionButtonDocument = "actionButtonDocument", e.actionButtonEnd = "actionButtonEnd", e.actionButtonForwardNext = "actionButtonForwardNext", e.actionButtonHelp = "actionButtonHelp", e.actionButtonHome = "actionButtonHome", e.actionButtonInformation = "actionButtonInformation", e.actionButtonMovie = "actionButtonMovie", e.actionButtonReturn = "actionButtonReturn", e.actionButtonSound = "actionButtonSound", e.arc = "arc", e.bentArrow = "bentArrow", e.bentUpArrow = "bentUpArrow", e.bevel = "bevel", e.blockArc = "blockArc", e.borderCallout1 = "borderCallout1", e.borderCallout2 = "borderCallout2", e.borderCallout3 = "borderCallout3", e.bracePair = "bracePair", e.bracketPair = "bracketPair", e.callout1 = "callout1", e.callout2 = "callout2", e.callout3 = "callout3", e.can = "can", e.chartPlus = "chartPlus", e.chartStar = "chartStar", e.chartX = "chartX", e.chevron = "chevron", e.chord = "chord", e.circularArrow = "circularArrow", e.cloud = "cloud", e.cloudCallout = "cloudCallout", e.corner = "corner", e.cornerTabs = "cornerTabs", e.cube = "cube", e.curvedDownArrow = "curvedDownArrow", e.curvedLeftArrow = "curvedLeftArrow", e.curvedRightArrow = "curvedRightArrow", e.curvedUpArrow = "curvedUpArrow", e.custGeom = "custGeom", e.decagon = "decagon", e.diagStripe = "diagStripe", e.diamond = "diamond", e.dodecagon = "dodecagon", e.donut = "donut", e.doubleWave = "doubleWave", e.downArrow = "downArrow", e.downArrowCallout = "downArrowCallout", e.ellipse = "ellipse", e.ellipseRibbon = "ellipseRibbon", e.ellipseRibbon2 = "ellipseRibbon2", e.flowChartAlternateProcess = "flowChartAlternateProcess", e.flowChartCollate = "flowChartCollate", e.flowChartConnector = "flowChartConnector", e.flowChartDecision = "flowChartDecision", e.flowChartDelay = "flowChartDelay", e.flowChartDisplay = "flowChartDisplay", e.flowChartDocument = "flowChartDocument", e.flowChartExtract = "flowChartExtract", e.flowChartInputOutput = "flowChartInputOutput", e.flowChartInternalStorage = "flowChartInternalStorage", e.flowChartMagneticDisk = "flowChartMagneticDisk", e.flowChartMagneticDrum = "flowChartMagneticDrum", e.flowChartMagneticTape = "flowChartMagneticTape", e.flowChartManualInput = "flowChartManualInput", e.flowChartManualOperation = "flowChartManualOperation", e.flowChartMerge = "flowChartMerge", e.flowChartMultidocument = "flowChartMultidocument", e.flowChartOfflineStorage = "flowChartOfflineStorage", e.flowChartOffpageConnector = "flowChartOffpageConnector", e.flowChartOnlineStorage = "flowChartOnlineStorage", e.flowChartOr = "flowChartOr", e.flowChartPredefinedProcess = "flowChartPredefinedProcess", e.flowChartPreparation = "flowChartPreparation", e.flowChartProcess = "flowChartProcess", e.flowChartPunchedCard = "flowChartPunchedCard", e.flowChartPunchedTape = "flowChartPunchedTape", e.flowChartSort = "flowChartSort", e.flowChartSummingJunction = "flowChartSummingJunction", e.flowChartTerminator = "flowChartTerminator", e.folderCorner = "folderCorner", e.frame = "frame", e.funnel = "funnel", e.gear6 = "gear6", e.gear9 = "gear9", e.halfFrame = "halfFrame", e.heart = "heart", e.heptagon = "heptagon", e.hexagon = "hexagon", e.homePlate = "homePlate", e.horizontalScroll = "horizontalScroll", e.irregularSeal1 = "irregularSeal1", e.irregularSeal2 = "irregularSeal2", e.leftArrow = "leftArrow", e.leftArrowCallout = "leftArrowCallout", e.leftBrace = "leftBrace", e.leftBracket = "leftBracket", e.leftCircularArrow = "leftCircularArrow", e.leftRightArrow = "leftRightArrow", e.leftRightArrowCallout = "leftRightArrowCallout", e.leftRightCircularArrow = "leftRightCircularArrow", e.leftRightRibbon = "leftRightRibbon", e.leftRightUpArrow = "leftRightUpArrow", e.leftUpArrow = "leftUpArrow", e.lightningBolt = "lightningBolt", e.line = "line", e.lineInv = "lineInv", e.mathDivide = "mathDivide", e.mathEqual = "mathEqual", e.mathMinus = "mathMinus", e.mathMultiply = "mathMultiply", e.mathNotEqual = "mathNotEqual", e.mathPlus = "mathPlus", e.moon = "moon", e.noSmoking = "noSmoking", e.nonIsoscelesTrapezoid = "nonIsoscelesTrapezoid", e.notchedRightArrow = "notchedRightArrow", e.octagon = "octagon", e.parallelogram = "parallelogram", e.pentagon = "pentagon", e.pie = "pie", e.pieWedge = "pieWedge", e.plaque = "plaque", e.plaqueTabs = "plaqueTabs", e.plus = "plus", e.quadArrow = "quadArrow", e.quadArrowCallout = "quadArrowCallout", e.rect = "rect", e.ribbon = "ribbon", e.ribbon2 = "ribbon2", e.rightArrow = "rightArrow", e.rightArrowCallout = "rightArrowCallout", e.rightBrace = "rightBrace", e.rightBracket = "rightBracket", e.round1Rect = "round1Rect", e.round2DiagRect = "round2DiagRect", e.round2SameRect = "round2SameRect", e.roundRect = "roundRect", e.rtTriangle = "rtTriangle", e.smileyFace = "smileyFace", e.snip1Rect = "snip1Rect", e.snip2DiagRect = "snip2DiagRect", e.snip2SameRect = "snip2SameRect", e.snipRoundRect = "snipRoundRect", e.squareTabs = "squareTabs", e.star10 = "star10", e.star12 = "star12", e.star16 = "star16", e.star24 = "star24", e.star32 = "star32", e.star4 = "star4", e.star5 = "star5", e.star6 = "star6", e.star7 = "star7", e.star8 = "star8", e.stripedRightArrow = "stripedRightArrow", e.sun = "sun", e.swooshArrow = "swooshArrow", e.teardrop = "teardrop", e.trapezoid = "trapezoid", e.triangle = "triangle", e.upArrow = "upArrow", e.upArrowCallout = "upArrowCallout", e.upDownArrow = "upDownArrow", e.upDownArrowCallout = "upDownArrowCallout", e.uturnArrow = "uturnArrow", e.verticalScroll = "verticalScroll", e.wave = "wave", e.wedgeEllipseCallout = "wedgeEllipseCallout", e.wedgeRectCallout = "wedgeRectCallout", e.wedgeRoundRectCallout = "wedgeRoundRectCallout";
})(ga || (ga = {}));
var Me;
(function(e) {
  e.text1 = "tx1", e.text2 = "tx2", e.background1 = "bg1", e.background2 = "bg2", e.accent1 = "accent1", e.accent2 = "accent2", e.accent3 = "accent3", e.accent4 = "accent4", e.accent5 = "accent5", e.accent6 = "accent6";
})(Me || (Me = {}));
var ya;
(function(e) {
  e.left = "left", e.center = "center", e.right = "right", e.justify = "justify";
})(ya || (ya = {}));
var va;
(function(e) {
  e.top = "top", e.middle = "middle", e.bottom = "bottom";
})(va || (va = {}));
var et;
(function(e) {
  e.ACTION_BUTTON_BACK_OR_PREVIOUS = "actionButtonBackPrevious", e.ACTION_BUTTON_BEGINNING = "actionButtonBeginning", e.ACTION_BUTTON_CUSTOM = "actionButtonBlank", e.ACTION_BUTTON_DOCUMENT = "actionButtonDocument", e.ACTION_BUTTON_END = "actionButtonEnd", e.ACTION_BUTTON_FORWARD_OR_NEXT = "actionButtonForwardNext", e.ACTION_BUTTON_HELP = "actionButtonHelp", e.ACTION_BUTTON_HOME = "actionButtonHome", e.ACTION_BUTTON_INFORMATION = "actionButtonInformation", e.ACTION_BUTTON_MOVIE = "actionButtonMovie", e.ACTION_BUTTON_RETURN = "actionButtonReturn", e.ACTION_BUTTON_SOUND = "actionButtonSound", e.ARC = "arc", e.BALLOON = "wedgeRoundRectCallout", e.BENT_ARROW = "bentArrow", e.BENT_UP_ARROW = "bentUpArrow", e.BEVEL = "bevel", e.BLOCK_ARC = "blockArc", e.CAN = "can", e.CHART_PLUS = "chartPlus", e.CHART_STAR = "chartStar", e.CHART_X = "chartX", e.CHEVRON = "chevron", e.CHORD = "chord", e.CIRCULAR_ARROW = "circularArrow", e.CLOUD = "cloud", e.CLOUD_CALLOUT = "cloudCallout", e.CORNER = "corner", e.CORNER_TABS = "cornerTabs", e.CROSS = "plus", e.CUBE = "cube", e.CURVED_DOWN_ARROW = "curvedDownArrow", e.CURVED_DOWN_RIBBON = "ellipseRibbon", e.CURVED_LEFT_ARROW = "curvedLeftArrow", e.CURVED_RIGHT_ARROW = "curvedRightArrow", e.CURVED_UP_ARROW = "curvedUpArrow", e.CURVED_UP_RIBBON = "ellipseRibbon2", e.CUSTOM_GEOMETRY = "custGeom", e.DECAGON = "decagon", e.DIAGONAL_STRIPE = "diagStripe", e.DIAMOND = "diamond", e.DODECAGON = "dodecagon", e.DONUT = "donut", e.DOUBLE_BRACE = "bracePair", e.DOUBLE_BRACKET = "bracketPair", e.DOUBLE_WAVE = "doubleWave", e.DOWN_ARROW = "downArrow", e.DOWN_ARROW_CALLOUT = "downArrowCallout", e.DOWN_RIBBON = "ribbon", e.EXPLOSION1 = "irregularSeal1", e.EXPLOSION2 = "irregularSeal2", e.FLOWCHART_ALTERNATE_PROCESS = "flowChartAlternateProcess", e.FLOWCHART_CARD = "flowChartPunchedCard", e.FLOWCHART_COLLATE = "flowChartCollate", e.FLOWCHART_CONNECTOR = "flowChartConnector", e.FLOWCHART_DATA = "flowChartInputOutput", e.FLOWCHART_DECISION = "flowChartDecision", e.FLOWCHART_DELAY = "flowChartDelay", e.FLOWCHART_DIRECT_ACCESS_STORAGE = "flowChartMagneticDrum", e.FLOWCHART_DISPLAY = "flowChartDisplay", e.FLOWCHART_DOCUMENT = "flowChartDocument", e.FLOWCHART_EXTRACT = "flowChartExtract", e.FLOWCHART_INTERNAL_STORAGE = "flowChartInternalStorage", e.FLOWCHART_MAGNETIC_DISK = "flowChartMagneticDisk", e.FLOWCHART_MANUAL_INPUT = "flowChartManualInput", e.FLOWCHART_MANUAL_OPERATION = "flowChartManualOperation", e.FLOWCHART_MERGE = "flowChartMerge", e.FLOWCHART_MULTIDOCUMENT = "flowChartMultidocument", e.FLOWCHART_OFFLINE_STORAGE = "flowChartOfflineStorage", e.FLOWCHART_OFFPAGE_CONNECTOR = "flowChartOffpageConnector", e.FLOWCHART_OR = "flowChartOr", e.FLOWCHART_PREDEFINED_PROCESS = "flowChartPredefinedProcess", e.FLOWCHART_PREPARATION = "flowChartPreparation", e.FLOWCHART_PROCESS = "flowChartProcess", e.FLOWCHART_PUNCHED_TAPE = "flowChartPunchedTape", e.FLOWCHART_SEQUENTIAL_ACCESS_STORAGE = "flowChartMagneticTape", e.FLOWCHART_SORT = "flowChartSort", e.FLOWCHART_STORED_DATA = "flowChartOnlineStorage", e.FLOWCHART_SUMMING_JUNCTION = "flowChartSummingJunction", e.FLOWCHART_TERMINATOR = "flowChartTerminator", e.FOLDED_CORNER = "folderCorner", e.FRAME = "frame", e.FUNNEL = "funnel", e.GEAR_6 = "gear6", e.GEAR_9 = "gear9", e.HALF_FRAME = "halfFrame", e.HEART = "heart", e.HEPTAGON = "heptagon", e.HEXAGON = "hexagon", e.HORIZONTAL_SCROLL = "horizontalScroll", e.ISOSCELES_TRIANGLE = "triangle", e.LEFT_ARROW = "leftArrow", e.LEFT_ARROW_CALLOUT = "leftArrowCallout", e.LEFT_BRACE = "leftBrace", e.LEFT_BRACKET = "leftBracket", e.LEFT_CIRCULAR_ARROW = "leftCircularArrow", e.LEFT_RIGHT_ARROW = "leftRightArrow", e.LEFT_RIGHT_ARROW_CALLOUT = "leftRightArrowCallout", e.LEFT_RIGHT_CIRCULAR_ARROW = "leftRightCircularArrow", e.LEFT_RIGHT_RIBBON = "leftRightRibbon", e.LEFT_RIGHT_UP_ARROW = "leftRightUpArrow", e.LEFT_UP_ARROW = "leftUpArrow", e.LIGHTNING_BOLT = "lightningBolt", e.LINE_CALLOUT_1 = "borderCallout1", e.LINE_CALLOUT_1_ACCENT_BAR = "accentCallout1", e.LINE_CALLOUT_1_BORDER_AND_ACCENT_BAR = "accentBorderCallout1", e.LINE_CALLOUT_1_NO_BORDER = "callout1", e.LINE_CALLOUT_2 = "borderCallout2", e.LINE_CALLOUT_2_ACCENT_BAR = "accentCallout2", e.LINE_CALLOUT_2_BORDER_AND_ACCENT_BAR = "accentBorderCallout2", e.LINE_CALLOUT_2_NO_BORDER = "callout2", e.LINE_CALLOUT_3 = "borderCallout3", e.LINE_CALLOUT_3_ACCENT_BAR = "accentCallout3", e.LINE_CALLOUT_3_BORDER_AND_ACCENT_BAR = "accentBorderCallout3", e.LINE_CALLOUT_3_NO_BORDER = "callout3", e.LINE_CALLOUT_4 = "borderCallout4", e.LINE_CALLOUT_4_ACCENT_BAR = "accentCallout3=4", e.LINE_CALLOUT_4_BORDER_AND_ACCENT_BAR = "accentBorderCallout4", e.LINE_CALLOUT_4_NO_BORDER = "callout4", e.LINE = "line", e.LINE_INVERSE = "lineInv", e.MATH_DIVIDE = "mathDivide", e.MATH_EQUAL = "mathEqual", e.MATH_MINUS = "mathMinus", e.MATH_MULTIPLY = "mathMultiply", e.MATH_NOT_EQUAL = "mathNotEqual", e.MATH_PLUS = "mathPlus", e.MOON = "moon", e.NON_ISOSCELES_TRAPEZOID = "nonIsoscelesTrapezoid", e.NOTCHED_RIGHT_ARROW = "notchedRightArrow", e.NO_SYMBOL = "noSmoking", e.OCTAGON = "octagon", e.OVAL = "ellipse", e.OVAL_CALLOUT = "wedgeEllipseCallout", e.PARALLELOGRAM = "parallelogram", e.PENTAGON = "homePlate", e.PIE = "pie", e.PIE_WEDGE = "pieWedge", e.PLAQUE = "plaque", e.PLAQUE_TABS = "plaqueTabs", e.QUAD_ARROW = "quadArrow", e.QUAD_ARROW_CALLOUT = "quadArrowCallout", e.RECTANGLE = "rect", e.RECTANGULAR_CALLOUT = "wedgeRectCallout", e.REGULAR_PENTAGON = "pentagon", e.RIGHT_ARROW = "rightArrow", e.RIGHT_ARROW_CALLOUT = "rightArrowCallout", e.RIGHT_BRACE = "rightBrace", e.RIGHT_BRACKET = "rightBracket", e.RIGHT_TRIANGLE = "rtTriangle", e.ROUNDED_RECTANGLE = "roundRect", e.ROUNDED_RECTANGULAR_CALLOUT = "wedgeRoundRectCallout", e.ROUND_1_RECTANGLE = "round1Rect", e.ROUND_2_DIAG_RECTANGLE = "round2DiagRect", e.ROUND_2_SAME_RECTANGLE = "round2SameRect", e.SMILEY_FACE = "smileyFace", e.SNIP_1_RECTANGLE = "snip1Rect", e.SNIP_2_DIAG_RECTANGLE = "snip2DiagRect", e.SNIP_2_SAME_RECTANGLE = "snip2SameRect", e.SNIP_ROUND_RECTANGLE = "snipRoundRect", e.SQUARE_TABS = "squareTabs", e.STAR_10_POINT = "star10", e.STAR_12_POINT = "star12", e.STAR_16_POINT = "star16", e.STAR_24_POINT = "star24", e.STAR_32_POINT = "star32", e.STAR_4_POINT = "star4", e.STAR_5_POINT = "star5", e.STAR_6_POINT = "star6", e.STAR_7_POINT = "star7", e.STAR_8_POINT = "star8", e.STRIPED_RIGHT_ARROW = "stripedRightArrow", e.SUN = "sun", e.SWOOSH_ARROW = "swooshArrow", e.TEAR = "teardrop", e.TRAPEZOID = "trapezoid", e.UP_ARROW = "upArrow", e.UP_ARROW_CALLOUT = "upArrowCallout", e.UP_DOWN_ARROW = "upDownArrow", e.UP_DOWN_ARROW_CALLOUT = "upDownArrowCallout", e.UP_RIBBON = "ribbon2", e.U_TURN_ARROW = "uturnArrow", e.VERTICAL_SCROLL = "verticalScroll", e.WAVE = "wave";
})(et || (et = {}));
var re;
(function(e) {
  e.AREA = "area", e.BAR = "bar", e.BAR3D = "bar3D", e.BUBBLE = "bubble", e.BUBBLE3D = "bubble3D", e.DOUGHNUT = "doughnut", e.LINE = "line", e.PIE = "pie", e.RADAR = "radar", e.SCATTER = "scatter";
})(re || (re = {}));
var Nr;
(function(e) {
  e.TEXT1 = "tx1", e.TEXT2 = "tx2", e.BACKGROUND1 = "bg1", e.BACKGROUND2 = "bg2", e.ACCENT1 = "accent1", e.ACCENT2 = "accent2", e.ACCENT3 = "accent3", e.ACCENT4 = "accent4", e.ACCENT5 = "accent5", e.ACCENT6 = "accent6";
})(Nr || (Nr = {}));
var Ze;
(function(e) {
  e.chart = "chart", e.image = "image", e.line = "line", e.rect = "rect", e.text = "text", e.placeholder = "placeholder";
})(Ze || (Ze = {}));
var ue;
(function(e) {
  e.chart = "chart", e.hyperlink = "hyperlink", e.image = "image", e.media = "media", e.online = "online", e.placeholder = "placeholder", e.table = "table", e.tablecell = "tablecell", e.text = "text", e.notes = "notes";
})(ue || (ue = {}));
var St;
(function(e) {
  e.title = "title", e.body = "body", e.image = "pic", e.chart = "chart", e.table = "tbl", e.media = "media";
})(St || (St = {}));
var vt;
(function(e) {
  e.DEFAULT = "&#x2022;", e.CHECK = "&#x2713;", e.STAR = "&#x2605;", e.TRIANGLE = "&#x25B6;";
})(vt || (vt = {}));
const bt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAB3CAYAAAD1oOVhAAAGAUlEQVR4Xu2dT0xcRRzHf7tAYSsc0EBSIq2xEg8mtTGebVzEqOVIolz0siRE4gGTStqKwdpWsXoyGhMuyAVJOHBgqyvLNgonDkabeCBYW/8kTUr0wsJC+Wfm0bfuvn37Znbem9mR9303mJnf/Pb7ed95M7PDI5JIJPYJV5EC7e3t1N/fT62trdqViQCIu+bVgpIHEo/Hqbe3V/sdYVKHyWSSZmZm8ilVA0oeyNjYmEnaVC2Xvr6+qg5fAOJAz4DU1dURGzFSqZRVqtMpAFIGyMjICC0vL9PExIRWKADiAYTNshYWFrRCARAOEFZcCKWtrY0GBgaUTYkBRACIE4rKZwqACALR5RQAqQCIDqcASIVAVDsFQCSAqHQKgEgCUeUUAPEBRIVTAMQnEBvK5OQkbW9vk991CoAEAMQJxc86BUACAhKUUwAkQCBBOAVAAgbi1ykAogCIH6cAiCIgsk4BEIVAZJwCIIqBVLqiBxANQFgXS0tLND4+zl08AogmIG5OSSQS1gGKwgtANAIRcQqAaAbCe6YASBWA2E6xDyeyDUl7+AKQMkDYYevm5mZHabA/Li4uUiaTsYLau8QA4gLE/hU7wajyYtv1hReDAiAOxQcHBymbzark4BkbQKom/X8dp9Npmpqasn4BIAYAYSnYp+4BBEAMUcCwNOCQsAKZnp62NtQOw8WmwT09PUo+ijaHsOMx7GppaaH6+nolH0Z10K2tLVpdXbW6UfV3mNqBdHd3U1NTk2rtlMRfW1uj2dlZAFGirkRQAJEQTWUTAFGprkRsAJEQTWUTAFGprkRsAJEQTWUTAFGprkRsAJEQTWUTAFGprkRsAJEQTWUTAFGprkRsAJEQTWUTAGHqrm8caPzQ0WC1logbeiC7X3xJm0PvUmRzh45cuki1588FAmVn9BO6P3yF9utrqGH0MtW82S8UN9RA9v/4k7InjhcJFTs/TLVXLwmJV67S7vD7tHF5pKi46fYdosdOcOOGG8j1OcqefbFEJD9Q3GCwDhqT31HklS4A8VRgfYM2Op6k3bt/BQJl58J7lPvwg5JYNccepaMry0LPqFA7hCm39+NNyp2J0172b19QysGINj5CsRtpij57musOViH0QPJQXn6J9u7dlYJSFkbrMYolrwvDAJAC+WWdEpQz7FTgECeUCpzi6YxvvqXoM6eEhqnCSgDikEzUKUE7Aw7xuHctKB5OYU3dZlNR9syQdAaAcAYTC0pXF+39c09o2Ik+3EqxVKqiB7hbYAxZkk4pbBaEM+AQofv+wTrFwylBOQNABIGwavdfe4O2pg5elO+86l99nY58/VUF0byrYsjiSFluNlXYrOHcBar7+EogUADEQ0YRGHbzoKAASBkg2+9cpM1rV0tK2QOcXW7bLEFAARAXIF4w2DrDWoeUWaf4hQIgDiA8GPZ2iNfi0Q8UACkAIgrDbrJ385eDxaPLLrEsFAB5oG6lMPJQPLZZZKAACBGVhcG2Q+bmuLu2nk55e4jqPv1IeEoceiBeX7s2zCa5MAqdstl91vfXwaEGsv/rb5TtOFk6tWXOuJGh6KmnhO9sayrMninPx103JBtXblHkice58cINZP4Hyr5wpkgkdiChEmc4FWazLzenNKa/p0jncwDiqcD6BuWePk07t1asatZGoYQzSqA4nFJ7soNiP/+EUyfc25GI2GG53dHPrKo1g/1Cw4pIXLrzO+1c+/wg7tBbFDle/EbQcjFCPWQJCau5EoBoFpzXHYDwFNJcDiCaBed1ByA8hTSXA4hmwXndAQhPIc3lAKJZcF53AMJTSHM5gGgWnNcdgPAU0lwOIJoF53UHIDyFNJcfSiCdnZ0Ui8U0SxlMd7lcjubn561gh+Y1scFIU/0o/3sgeLO12E2k7UXKYumgFoAYdg8ACIAYpoBh6cAhAGKYAoalA4cAiGEKGJYOHAIghilgWDpwCIAYpoBh6cAhAGKYAoalA4cAiGEKGJYOHAIghilgWDpwCIAYpoBh6ZQ4JB6PKzviYthnNy4d9h+1M5mMlVckkUjsG5dhiBMCEMPg/wuOfrZZ/RSywQAAAABJRU5ErkJggg==", eo = "data:image/png;base64,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AAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKREkRUAAACwrUpLSwuGDRvWfMCAAS26du3avKysrLiioqKkZcuWzZs1a1bcvHnz0tLS0rJsNtusuLi4ebNmzUoLCgo+8/eijY2N9Zs3b66pra2tqqur21xTU1NdVVVVs2nTptqNGzdWbdiwoeYvf/nL5hUrVlQtWLBgw6xZs6pqamoaJQYAAEDaKYABAACIiIghQ4aUHnTQQW379u3bql27dq3at2/fpkWLFq2bN29eWVpa2qpZs2bNCwsLm2ez2fLCwsLyoqKi8sLCwtKknK+hoaG6vr6+qqGh4S91dXV/aWhoqNq8eXNVTU3NuqqqqvUbNmxYu2rVqjWrV69e99Zbb6177rnnPpgzZ06NTwYAAABJogAGAADIA8OGDWt+xBFHdBwwYECnLl26dGjdunXHFi1adCgtLe1YUlLSvlmzZq0KCgqK07yDwsLCssLCwrKIaPdp/zuNjY21mzdvXrdp06ZVNTU172/YsGHl2rVr31+2bNnKBQsWrHjyySffnzVrVpVPGAAAAE1Fpuexsd9HfaF+ZcSal0ptCAAAIAE6deqUPf744zvtueeeXbp3796lbdu2XSorKzuXlpZ2KS0t7VBYWFhhSztGQ0PDxpqampU1NTXL169fv+yDDz5Y9s477yybPXv2sj/96U8rVqxYUWdLAAAAbE9t9q6Jog4f/TUFMAAAQEJks9nMt7/97Y4jRozo1bdv397t2rXrXl5e3rWsrKxzcXFx+4gosKUmp7G2tnZVTU3Nso0bNy5btWrV0tdff/2tJ598cvG999672noAAADYFgpgAACAhPne977X6a9Fb/v27Xu1bNmyV1lZWa8kvXOXLauvr9/wl7/8ZdG6desWL1u2bNHChQsX/fGPf1w8derUjbYDAADAliiAAQAAmqhsNps59dRTuxx66KH9+/Tp87n27dv3Ly8v719UVOSRzXlq06ZNKzZu3Pj6+++//8abb775xqOPPvrG3XffvcpmAAAA+CsFMAAAQBNx6qmndvniF784qHfv3v3btWv3uYqKis8VFhaW2wxbUl9fv37Dhg1vfPDBB68vXrz4jccee2z+jTfeuNxmAAAA8pMCGAAAYBc45phjWn/rW9/aq3///kPatGnTv6Kiop9HOLO9NDQ0VG/cuPGtNWvWLFy4cOGcO+6445WHHnporc0AAACknwIYAABgJzjjjDO6f+lLX9qrV69eg1u3bj2orKysR0RkbIadJFddXb103bp18xcvXjz30UcffeXqq69+x1oAAADSRwEMAACwnZWWlhb86le/2u3QQw8d1r17931btmw5qLCwsMxmaEoaGhqqP/zww/nvvPPOzGeeeWbW2LFj36ipqWm0GQAAgGRTAAMAAGwHP/7xj7t+9atf3bdXr15D27Ztu1c2m21jKyRJXV3dmg8++OCVRYsWvfznP/95xh/+8IdltgIAAJA8CmAAAIBtcOKJJ7Y75ZRTDujXr9+w1q1bD81ms61shTSpq6tbt3bt2pfffPPNWbfccsvUe++9d7WtAAAANH0KYAAAgE+hoqKi4IILLhg0YsSI/bp27bpfy5YtB2YymUKbIR/kcrmGDz/8cP6777474/nnn59x4YUXvrZx40aPiwYAAGiCFMAAAAAf4/jjj2/7/e9//8D+/fsf2Lp1630KCgpKbAUiGhsbN61fv37eW2+9NeWGG2545u67715lKwAAAE2DAhgAAOB/ZLPZzAUXXPC5I4888sDu3bsfWFFRsVtEFNgMbFl1dfWSd999d8qsWbNmnnvuuS+vW7euwVYAAAB2DQUwAACQ10pLSwsuvfTSQYcccsjBXbt2HVFWVtbDVmDb1dbWrnr//fdfmDp16uRf/vKXL65evbreVgAAAHYeBTAAAJB3Bg0aVHrBBRd8fs899zywQ4cOBxQVFbWwFdj+Ghsba9euXTtrzpw5T59//vmTX3755WpbAQAA2LEUwAAAQF4YNmxY8/POO+/gIUOGHOZ9vrDz/W0ZfNFFFz07a9asKlsBAADY/hTAAABAarVq1arwyiuv3HfEiBEjO3TocFBhYWGZrcCu19DQUP3+++8/O2XKlIk/+clPZm7cuLHRVgAAALYPBTAAAJAqrVq1Kvztb3+7/3777Xd4x44dRxQWFpbbCjRdDQ0NG99///0pM2bMeOqHP/zhC8pgAACAz0YBDAAApMJZZ53V45vf/OaRvXr1GllaWtrVRiB5ampq3l28ePHEO++8c9LVV1/9jo0AAABsPQUwAACQWMOHDy+/6KKLvjB48OCjW7RoMdBGID0+/PDDV+fNmzfhvPPOe3L69Ol/sREAAIBPRwEMAAAkSqtWrQpvuOGGQ/bbb79/atOmzX6ZTCZrK5BeuVyubs2aNTNmzJjx2JgxYyavW7euwVYAAAA+ngIYAABIhB//+Mddv/e9732lZ8+e/1RcXNzWRiD/1NbWfvD2228/dssttzz029/+9l0bAQAA+L8UwAAAQJNVUVFRcO21137+4IMPPrZ169b7ZTKZAlsBIqJxzZo1M59//vnxp5122hR3BQMAAPx/CmAAAKDJOeWUUzqefvrpx/bu3ftL2Wy2jY0AH6e+vn7j0qVLH/vd7373x+uvv36ZjQAAAPlOAQwAADQJ2Ww2c+uttx5wyCGHnNC6deu9I8LdvsDWaFy7du1L06ZN+/OPfvSjZ1evXl1vJQAAQD5SAAMAALtU//79S6655pp/2nPPPY8tLy/vayPAZ1VTU7NswYIF488999wHp06dutFGAACAfKIABgAAdomf//znPU855ZQTu3btemRhYWGZjQDbW2NjY92KFSuevOWWW+689NJLF9kIAACQDxTAAADATuMxz8Cusn79+rlPP/30f5188slT6+rqcjYCAACklQIYAADY4fr27Vv8hz/84a+Pee5nI8CuUlNT8+68efPu/8EPfvDgwoULN9kIAACQNgpgAABghxkyZEjpNddc89XBgwefWFxc3MFGgKaitrZ21dy5c+/5yU9+8uc5c+bU2AgAAJAWWyqAPYoNAADYJqNHj+4wb968n06ZMuXRYcOGnaH8BZqa4uLi9sOGDTtjypQpj86bN++nJ510UntbAQAA0s4dwAAAwFY599xze33/+9//dufOnY/IZDJZGwGSIpfL1S1fvvzJG2644fbLLrvsbRsBAACSyiOgAQCAz+y8887r+53vfOfbHTt2PDyTyRTaCJBUuVyuYcWKFU/cdNNN//XrX/96sY0AAABJowAGAAC22WWXXTboG9/4xg9at249zDaAtFm7du2su++++9pzzjnnNdsAAACSQgEMAABsNcUvkE8UwQAAQJIogAEAgE9N8Qvks7Vr18665557rvv5z38+3zYAAICmaksFcGHlwOj6UV9orIqoWZG1PQAAyBO/+MUvet9xxx3nHHrooT8pLS3tYiNAPiotLe2y7777HvP973+/X1lZ2ZIpU6assxUAAKCpKetcHwXlH/01BTAAAOS5M844o/u99957zpe//OWflZeX94qIjK0AeS5TXl7e8+CDDx71/e9/v3dEvDVjxowPrQUAAGgqFMAAAMD/ceKJJ7a77777fjJq1Kh/KS8v7xOKX4B/lCkvL+99+OGHj/rWt77VfvXq1Qvnz59fbS0AAMCutqUC2DuAAQAgzwwdOrTs+uuvP6l///4nFRYWltkI20NjY2Ns2rQpqquro6amJurr62PTpk2xefPmqK+vj+rq6qivr4/NmzfHpk2boqGhYZv/fxUWFkZJSUk0a9YsioqKoqysLIqKiqJZs2ZRUlISRUVFUVpa+r9/FRQUCIjtoqGhoeq11167a8yYMffMmTOnxkYAAIBdZUvvAFYAAwBAnujUqVP2nnvuGbXXXnudnM1mK22Ej9PQ0BAbN26MDRs2/J+/Nm7cGBs3boyamprYtGlTbNq0KWpqaqK2trbJnqe4uDhKSkqitLT0f/9eUVERFRUV0aJFi//zV0VFRRQWFvog8LHq6urWvvjii7eceOKJf169enW9jQAAADubAhgAAPLcXXfdddAXv/jF00tLS7vZRn7L5XKxYcOGWLt2baxbty7Wrl37d3+tW7cuNmzYkPd7atGiRbRu3TpatWoVrVu3jjZt2vzvf27dunW0aNHCh4morq5e+sgjj1zzne98Z6ptAAAAO5MCGAAA8tTVV189+MQTTzyzoqJioG3kj8bGxli5cmUsX748Pvjgg1i9evX//n3t2rXR2NhoSZ9RYWFhtGrVKtq1axdt27b937937tw5OnTo4LHTeWbDhg3z77333qvOPPPMebYBAADsDApgAADIM1/72tfaXHrppad27979qIjQRKVUQ0NDrFq1KlasWBHvv//+//595cqVTfqRzGlXXFwcHTp0iI4dO0bnzp2jY8eO0alTp2jXrp1HS6dYLpdrfOeddx76+c9/fv2ECRPW2QgAALAjKYABACBP9OrVq9ldd931jT322OM7hYWFZTaSHh9++GG88847sXTp0njvvfdixYoVsXr16mhoaLCchCgsLIz27dtHp06dolu3btG9e/fo3r27x0mnTENDQ9W8efNu++Y3v/nHJUuWbLYRAABgR1AAAwBAHrjrrrtG/NM//dOZJSUlXWwj2davXx9Lly6Nd955539L3w8//NBiUqqysvJ/y+C//tWqVSuLSbiamppljz322G9Gjx49xTYAAIDtTQEMAAAp9qtf/arPD3/4w5+1atVqL9tIno0bN8aSJUvirbfeikWLFsV7770XmzZtspg8V1JSEl27do0+ffpE3759o3fv3lFeXm4xCbRu3bqXr7322ivGjh27yDYAAIDtRQEMAAApNGjQoNI77rjju7vttttJBQUFWRtJhtWrV8ebb74ZixcvjiVLlsTy5cujsbHRYtiigoKC6Ny5c/Tu3Tt69+4d/fr1i7Zt21pMQjQ2Nta98cYbd33rW9+6ff78+TU2AgAAfFYKYAAASJHS0tKCBx988Jj99tvvn7PZbBsbaboaGhri7bffjrfeeisWLFgQS5YscXcv201FRUX06tUr+vbtG3379o2ePXtGYWGhxTRhdXV1a2bMmHHjV77ylYdqamr85gcAALDNFMAAAJASp59+erdf/vKX51ZWVu5jG03T6tWr47XXXouFCxfGm2++GRs3brQUdooWLVpE3759Y8CAATFw4EB3CDdh69evf/E//uM//vPqq69+xzYAAIBtoQAGAICEGzRoUOm99977w969ex+byWTc4teErF+/PubNmxcLFiyIN954Q+FLk9GiRYvo169fDBgwIPbYY4+orKy0lCYkl8s1LF68eNyJJ554rcdCAwAAW0sBDAAACXbNNdcMOemkk35RVlbWyzZ2vVwuF++++27MnTs3XnvttViyZIl3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B7lcrm7y5Mm//vKXv/yIbQAAwK63pXcAK4ABAMg7paWlBTNnzjyzT58+x9vG39uwYUOMGzcuZsyY4VHPQF7KZDKx3377xde//vWoqKiwkH+waNGiP+27775X1dTUeCwEAADsQgpgAAD4H926dctOnjz5V506dRppG/9fLpeLqVOnxp///OfYuHGjhQB5r6KiIkaNGhX777+/x0L/g+XLlz9+6KGHXvLuu+/W2QYAAOwaWyqAvQMYAIC8MXz48PInnnjiynbt2o2wjf/vnXfeiWuvvTaee+652Lx5s4UARMTmzZtjzpw58dprr0XPnj2jRYsWlvI/Kioq+n7rW98aMnXq1Ofee+89f3AAAMAusKV3ACuAAQDIC9/+9rc73n777X9o0aLFANv4b1VVVXHXXXfFvffeG+vXr7cQgI+wbt26eP7552P9+vWx2267RVFRkaVERElJSefjjjvuoA8++GDKK6+88hcbAQCAnUsBDABAXjv//PP7XXzxxX8oKSnpbBv/bfr06XHttdfGokWLLAPgU3jnnXdi2rRp0bp16+jc2R8nERHZbLbyC1/4whElJSUvTp48eY2NAADAzqMABgAgb/3ud7/b60c/+tFVRUVFrWwjYs2aNXHzzTfHpEmTora21kIAtkJtbW289NJL8c4770Tfvn2jtLQ073dSWFhYNnz48C/26dNn4UMPPbTMpwQAAHYOBTAAAHnp1ltv3f+b3/zmfxYWFjbP913kcrl4/vnn4/rrr4/ly5f7cAB8BitXroxp06ZFRUVFdOvWLTKZTF7vo6CgIDto0KBDBw0atOiBBx54xycEAAB2vC0VwJmex8Z+H/WF+pURa17ym6wAACTTww8//KXDDjvsXzKZTN6/rPGDDz6I22+/Pd544w0fDIDtbMCAAfGtb30r2rRpk/e7yOVyjVOmTPn1yJEjH/LJAACAHavN3jVR1OGjv6YABgAgdV555ZXTPve5z30r3/fQ0NAQjz32WDz++ONRV1fngwGwg2Sz2Tj66KPjC1/4QhQUFOT9Pl5//fU79tprr9/7ZAAAwI6jAAYAIC9ks9nMyy+/fFafPn2Oz/ddvPvuu3HbbbfFe++954MBsJN069YtvvOd70S3bt3yfhdLliy5f5999rmypqam0ScDAAC2PwUwAACpV1paWjBr1qyzevfufVw+7yGXy8WTTz4ZDz74oLt+AXaBbDYbxxxzTBxxxBF5fzfw0qVLHxg6dOjlSmAAANj+FMAAAKRar169mk2ePHlsu3btDsrnPaxcuTJuueWWePvtt30oAHaxnj17ximnnBIdOnTI6z2sXr16yiGHHPIvS5Ys2exTAQAA28+WCuDCyoHR9aO+0FgVUbMia3sAADRpQ4cOLXvqqacub9Omzf75uoNcLhfPPPNMXH/99bF27VofCoAmYP369TFlypQoKSmJnj17RiaTycs9NG/evPtJJ500ZPLkyc+sWLHCoykAAGA7KetcHwXlH/01BTAAAIk1ZMiQ0kceeeSKVq1a7Z2vO6iuro7bb789nnjiiWhs9IRNgKaksbEx5s+fH++//34MGDAgstn8/DlLaWlpp6997WuDn3rqqadXrlxZ75MBAACfnQIYAIDUOfTQQ1s8+OCDv2/ZsuUe+bqDOXPmxNVXX+2RzwBN3PLly+OFF16Ijh075u0joUtLSzudcMIJ+7/00ktPv/3227U+FQAA8NkogAEASJVhw4Y1v++++37TsmXLQfl4/vr6+hg/fnz88Y9/jNpaP0MHSILNmzfHiy++GJs3b47ddtstCgoK8m4HxcXFbY866qg9n3vuuaeXL1/ucdAAAPAZKIABAEiNI488snLcuHG/b9GixcB8PP97770XV111VcyZM8eHASCBFi1aFC+//HL069cvWrRokXfnLykp6XDcccftP2fOnGcWLVq0yScCAAC2jQIYAIBUOPLIIyvvvPPO35aXl++Wj+d/+umn48Ybb4wPP/zQhwEgwf7yl7/ECy+8ECUlJdGrV6+8O3+zZs3aHHXUUfspgQEAYNspgAEASLxjjz227W233faH5s2b98m3s1dVVcXNN98cTz31VDQ2NvowAKRAY2NjzJ8/P5YtWxYDBgyIZs2a5dX5mzVr1uaYY4458M0333xm4cKFNT4RAACwdRTAAAAk2qGHHtritttuuzofy9+33347rrnmmli8eLEPAkAKvf/++/HKK69Enz59orKyMq/Ons1mK4888sh9Zs6c+dTSpUs3+zQAAMCnpwAGACCxjjjiiJb33nvvteXl5f3y6dy5XC4mTZoUN998c1RVVfkgAKRYVVVVTJ06NbLZbPTp0ycymUzenL24uLjtV7/61c+/8sorTy1evLjWpwEAAD4dBTAAAIl06KGHtrj33nt/l2/lb3V1ddx0000xefLkyOVyPggAeSCXy8WCBQvi3Xffjd133z2y2fz5mUyzZs1aH3300fvNmDHjSXcCAwDAp6MABgAgcYYOHVo2fvz4qysqKgbk07mXLVsWV111lUc+A+SplStXxiuvvBKf+9znoqKiIm/O3axZszZHH3300GeeeebJFStW1PkkAADAlimAAQBIlCFDhpQ++uij17Rs2XL3fDr31KlT49prr42NGzf6EADksaqqqpg+fXq0bds2unTpkjfnLikpaT9q1KihTz755JMrV66s90kAAICPt6UCuMB6AABoSjp16pSdMGHCv1dWVu6RL2dubGyMcePGxR133BF1dW56AiCitrY2br755hg/fnw0NjbmzbkrKyv3mDBhwr9369bNXQkAALCNFMAAADQZrVq1Kpw+ffolbdq02T9fzlxdXR2/+93vYtKkSd73C8DfyeVy8fjjj8fvf//7qK6uzptzt2nTZv8pU6Zc0qpVq0KfAgAA2HoKYAAAmoSKioqC2bNnX9KuXbuD8uXMS5cujYsuuijmz5/vAwDAx3r11VfjoosuiqVLl+bNmdu1a3fQ7Nmz/72iosLPrgAAYCu5iAYAoEmYOXPmz9q1a3dIvpz35ZdfjiuuuCLWrVsnfAA+0bp16+KKK66Il19+OW/O3K5du4Nnzpz5M+kDAMDWUQADALDLvfjii2N69OgxKh/Omsvl4oEHHogbbrghamtrhQ/Ap1ZbWxs33HBDPPDAA3nz2oAePXqMevHFF8dIHwAAPj0FMAAAu9SkSZO+NnDgwFPy4ax1dXVx8803x8SJE73vF4BtksvlYuLEiXHLLbdEXV1dXpx54MCBJ0+aNOlr0gcAgE9HAQwAwC7z6KOPHnXggQeekw9nXbduXfz617+OWbNmCR6Az2zmzJnx61//Ol9eJZA58MADz3n00UePkjwAAHyywsqB0fWjvtBYFVGzImtDAADsEDfeeOO+Rx999EWZTKYw7Wddvnx5XHXVVbFy5UrBA7DdbNiwIWbPnh0DBw6MioqKtB8307179/179uz56sMPP7xc+gAA5LuyzvVRUP7RX1MAAwCw011xxRV7fPe7372qoKCgWdrPOmfOnPjtb38bGzduFDwA2111dXVMmzYtOnfuHB07dkz1WTOZTOHuu+9+eJs2bV6aNGnSKukDAJDPFMAAADQZZ5xxRvef/exnvy0sLCxP+1knTJgQd999d9TX1wsegB2moaEhXnrppchms9G3b99UnzWTyRTttddeB/3lL395dubMmRukDwBAvlIAAwDQJBx00EEVf/jDH64pLi7ulOZz5nK5eOCBB+Kxxx4TOgA77c+eBQsWRF1dXfTv3z8ymUxqz1pQUFBywAEHDJs+ffqkpUuXbpY+AAD5aEsFcIH1AACwMwwaNKj0vvvuu7qsrKxXms9ZV1cX1113XUyaNEnoAOx0EydOjOuvvz7q6upSfc6ysrJef/rTn67u379/idQBAODvKYABANjhKioqCh577LGLKyoqBqb5nNXV1XHNNdfE7NmzhQ7ALvPKK6/ElVdeGVVVVak+Z4sWLQZOnDhxbEVFhZ9vAQDA33CBDADADjdz5syftW3b9sA0n3HdunVx2WWXxRtvvCFwAHa5xYsXx2WXXRZr165N9TnbtWt34MyZM38mcQAA+P8UwAAA7FBPPvnkqB49eoxK8xlXrVoVV1xxRSxfvlzgADQZK1asiCuuuCJWrlyZ6nP26NFj1KRJk0ZJHAAA/lth5cDo+lFfaKyKqFmRtSEAALbZjTfeuO+XvvSlCzOZTGp/8fDdd9+NK6+8MtatWydwAJqc6urqmDVrVvTv3z8qKytTe85u3boN79mz57yHH37Yb2MBAJAXyjrXR0H5R39NAQwAwA5x3nnn9T311FOvLigoKE7rGV977bW45pprorq6WuAANFmbN2+OGTNmRI8ePaJ9+/apPGMmkykYNGjQIYWFhVOee+45v5UFAEDqKYABANipjjrqqFb/8R//8YdmzZq1SusZX3755bj++uujrq5O4AA0eQ0NDfHSSy9Fp06dolOnTqk8Y0FBQXbYsGGfnz9//qQ33nhjk9QBAEizLRXA3gEMAMB21a1bt+wNN9zwnyUlJR3TesYpU6bEjTfeGPX19QIHIDHq6+vjxhtvjKlTp6b2jCUlJZ1uuOGG/+jWrZu7GgAAyFsKYAAAtqunn376XyorK/dI6/kmTZoUd955ZzQ2NgobgMRpbGyMO+64I5588snUnrGysnLw008//UtpAwCQrxTAAABsN88///w3unTp8k9pPd/EiRNj3LhxkcvlhA1AYuVyubj//vtTXQJ36dLlS88+++yJ0gYAIB95BzAAANvFTTfdNPzII488L5PJZNJ4vsceeyzGjx8vaABS47XXXotmzZpF3759U3m+zp0779urV695Dz/88DJpAwCQNlt6B7ACGACAz+wXv/hF7x/+8IdXFxQUNEvj+R544IF45JFHBA1A6ixYsCDq6upiwIABqTtbJpPJDBo06ODGxsbnpk6dul7aAACkiQIYAIAd5oADDqj43e9+99tmzZq1TeP5xo0bF5MmTRI0AKm1aNGi2Lx5cwwcODB1ZysoKMjut99+w5577rnH33vvvc3SBgAgLbZUAHsHMAAA2yybzWbuvPPOfyktLe2exvNNmDBB+QtAXpg0aVI89NBDqTxbaWlpj3vuuedfstlsRtIAAOQDBTAAANvs+eef/06HDh0OTePZHn744Xj44YeFDEDeeOSRR+LPf/5zKs/WoUOHw5599tlvSxkAgHygAAYAYJvcd999hw8ePPjUNJ7t/vvvjwkTJggZgLzz2GOPxX333ZfKs+25554/+NOf/nSYlAEASDvvAAYAYKudccYZ3ceMGXN5QUFBcdrONnHixHjkkUeEDEDeWrx4cWSz2ejbt2/ajpbp06fPvn/5y18mz5w5c4OkAQBIsi29A1gBDADAVhk2bFjzG2+88Q/NmjVrl7azPfroo6l99CUAbI2FCxdGUVFR9OvXL1XnKigoKD7wwAP3e/LJJx9dsWJFnaQBAEiqLRXAHgENAMBWuffee39ZWlraPW3nevzxx+PBBx8UMAD8jz//+c8xceLE1J2rtLS0x3333fdLCQMAkFYKYAAAPrVJkyaN6tSp0xEpPFeMHz9ewADwD8aPHx+TJ09O3bk6der0hUmTJn1VwgAApJFHQAMA8Kmcd955fU888cR/z2QyRWk618yZM+Puu+8WMAB8jNdeey06duwYnTt3TtW5unbtuk9BQcHzzz333DopAwCQNN4BDADAZ3LEEUe0vOKKK67NZrOVaTrXyy+/HDfffHPkcjkhA8DHyOVyMXv27OjSpUt06tQpNefKZDJF++yzz/CpU6c+9u67726WNAAASeIdwAAAbLNsNpu55ZZb/q2kpKRjms61YMGCuPnmm6OxsVHIAPAJGhsb4+abb44333wzVecqLS3tcvfdd5+fzWYzUgYAIC0UwAAAbNGkSZO+3rZt2wPTdKZly5bFDTfcEPX19QIGgE+prq4urr322li+fHmqztWuXbsDH3/88VESBgAgLTwCGgCAj3XZZZcN+upXvzo2k8mk5hcH33///bjyyiujqqpKwACwlerq6uLll1+OIUOGRHl5eWrO1aVLl31LS0unPvPMM2ukDABAEngENAAAW61///4lJ5988q8ymUxRWs60YcOG+P3vfx8bN24UMABso40bN8bvfve7VP15WlBQkP3hD394ft++fYslDABA4q9vrQAAgI/y4IMPnl1WVtYrLeeprq6O3/zmN7Fq1SrhAsBntGrVqrjyyiujuro6NWcqKyvr8/DDD58lXQAAkk4BDADA/zF+/Pgju3XrdnRazlNfX5/KdxYCwK60fPnyuO6666K+vj41Z+rRo8dXx40bd4R0AQBIMgUwAAB/53vf+16nI4444py0nCeXy8Vtt90Wb7zxhnABYDt7/fXX47bbbotcLpeaMx155JHnfvvb3+4oXQAAkkoBDADA/6qoqCi4+OKLLywsLCxPy5nGjx8fs2bNEi4A7CCzZs2Khx56KDXnKSwsrPj1r399QUVFhZ+bAQCQSC5kAQD4XxMnThxdWVk5OC3nef7552PixImCBYAd7LHHHosXXnghNeeprKzc89FHHz1RsgAAJFFh5cDo+lFfaKyKqFmRtSEAgDxxwQUX7DZq1KgLM5lMYRrO8+qrr8Ytt9ySqkdSAkBT/7O3d+/e0a5du1Scp2PHjkNzudxzU6ZMWSddAACamrLO9VHwMc/wcwcwAADRt2/f4h//+McXZzKZVPwG4HvvvRc33HBDNDY2ChcAdpKGhoa47rrrYtmyZak4T0FBQfbss88e27dv32LpAgCQqGtZKwAAYPz48T8qKyvrkYazbNiwIX7/+99HbW2tYAFgJ9u0aVP8/ve/j40bN6biPGVlZb3GjRs3RrIAACSJAhgAIM/ddNNNw/v06XN8Gs5SX18f1157baxdu1awALCLrFmzJq699tqor69PxXn69ev3jd///vdDJQsAQFIogAEA8thBBx1Uceyxx/5rRGTScJ477rgjFi9eLFgA2MUWLVoUd955Z1qOU/CNb3zj34YNG9ZcsgAAJOIC1goAAPLXzTfffFZxcXG7NJxl4sSJMX36dKECQBMxbdq0mDRpUirOUlJS0unOO+88Q6oAACSBAhgAIE/913/914FdunT5UhrO8tprr8Wf//xnoQJAEzN+/PhYsGBBKs7SrVu3o2+66abhUgUAoKlTAAMA5KEvfelLlV/5yld+lYazrFixIq6//vpobGwULAA0MY2NjXHdddfFihUr0nCczHHHHfergw46qEKyAAA0ZQpgAIA8dPXVV5+ezWYrk36OmpqauPbaa2PTpk1CBYAmatOmTXHttddGTU1N4s+SzWbb3njjjT+RKgAATZkCGAAgz9x6663Du3Tp8uWknyOXy8Utt9wSK1euFCoANHErV66MW2+9NXK5XOLP4lHQAAA0dQpgAIA8MnTo0LKvfvWrv0jDWSZMmBBz584VKgAkxJw5c+Kxxx5LxVlGjRr1i6FDh5ZJFQCApkgBDACQR+64444fFRcXd0z6OV5++eV45JFHBAoACfPQQw+l4he4SkpKOt5xxx0/lCgAAE2RAhgAIE9cfvnlu/fs2XNU0s/xwQcfxB133JGKR0gCQL7J5XJx2223xZo1axJ/lp49ex57+eWX7y5VAACaGgUwAEAe6NatW/a73/3uv2YymURf/9XX18cNN9wQ1dXVQgWAhKqqqoobb7wx6uvrE32OTCZT8N3vfvdX3bp1y0oVAICmRAEMAJAHxo8ff0pZWVmvpJ/jnnvuiaVLlwoUABJuyZIlcd999yX+HGVlZT3Hjx9/ikQBAGhKFMAAACn385//vOeAAQNGJ/0c06dPjylTpggUAFJi8uTJMWPGjMSfY8CAAaN//vOf95QoAABNhQIYACDFstls5qyzzjo3k8kk+tGEK1asiLvvvlugAJAyd911V6xYsSLRZ8hkMtmzzjrr3Gw2m5EoAABNgQIYACDFxo0b98XKysq9knyG2trauOGGG6K2tlagAJAyf/1zfvPmzYk+R2Vl5V7jxo0bKVEAAJoCBTAAQEoNHz68/OCDDz4t6ee4//77Y/ny5QIFgJRavnx5jBs3LvHnGDFixI+HDRvWXKIAAOxqCmAAgJS69dZbT8tms22TfIYZM2bEc889J0wASLnJkyfHzJkzE32G4uLitrfffvtp0gQAYFdTAAMApNBVV121R48ePb6S5DOsXLky7rrrLmECQJ64++6744MPPkj0GXr27PnVK664Yg9pAgCwKymAAQBSprS0tOAb3/jGT5N8rdfY2Bi333679/4CQB6pqamJ2267LRobG5N8jIJvfvObZ5aWlvqZGwAAu+6i1AoAANJlwoQJX6uoqBiQ5DOMHz8+Fi1aJEwAyDNvvvlmPPjgg4k+Q4sWLQY9+OCDx0gTAIBdRQEMAJAiRx55ZOWwYcN+kOQzzJ07N5544glhAkCemjhxYixYsCDRZxg+fPiPjjjiiJbSBABgV1AAAwCkyBVXXHFyUVFRRVLnr6qqijvvvDNyuZwwASBP5XK5uP3226O6ujqxZygqKmrxm9/85mRpAgCwKyiAAQBS4vzzz+/Xu3fv45J8httvvz0+/PBDYQJAnlu3bl3cfvvtiT5D7969jz///PP7SRMAgJ1NAQwAkALZbDZz6qmn/jyTyST2+m769OkxZ84cYQIAERExe/bsmDFjRmLnz2QyBaeeeurPs9lsRpoAAOxMCmAAgBT44x//eERlZeXgpM6/du3auPfeewUJAPyde+65J9atW5fY+SsrKwf/6U9/+oIkAQDYmRTAAAAJ17dv3+JDDjnkR0k+w9133x01NTXCBAD+Tk1NTdx9992JPsPBBx/8o759+xZLEwCAnUUBDACQcHfdddc3S0pKOiV1/smTJ8e8efMECQB8pLlz58azzz6b2PlLSko63nPPPd+SJAAAO4sCGAAgwb70pS9VDhw48KSkzr9mzZoYP368IAGALXrggQdizZo1iZ2/f//+Jx111FGtJAkAwM6gAAYASLArrrji1MLCwvIkzp7L5eK2226LTZs2CRIA2KJNmzbFbbfdFrlcLpHzFxYWll1++eU/kCQAADuDAhgAIKF+8Ytf9O7evftXkjr/s88+G2+88YYgAYBP5Y033ojnn38+sfN369bt6F/96ld9JAkAwI6mAAYASKgf/vCHP8pkMom8nvvggw/igQceECIAsFXGjRsX69atS+TsmUym4NRTT/2xFAEA2NEUwAAACXTdddcNa9eu3YFJnD2Xy8Udd9wRtbW1ggQAtsqmTZvizjvvTOz8bdq02f+mm27aT5IAAOxICmAAgIQpLS0t+NrXvnZ6Uud/4YUXYuHChYIEALbJq6++GjNmzEjs/Mccc8zpFRUVfiYHAMAO42ITACBhbr/99oMrKip2S+LsGzZsiHHjxgkRAPhM7r///qiqqkrk7OXl5X3/67/+6wgpAgCwoyiAAQASpKKiouCwww47Nanz33vvvYn9YS0A0HRs2LAh7r///sTOf9BBB/1zq1atCiUJAMCOoAAGAEiQ+++//+iysrKeSZx9zpw58dJLLwkRANguXnjhhViwYEEiZy8tLe32xz/+8StSBABgR1AAAwAkRN++fYv33Xfff07i7LW1tXHvvfcKEQDYru6+++6oq6tL5Oz77bffKf379y+RIgAA25sCGAAgIW6++eZRxcXFbZM4+yOPPBJr164VIgCwXa1atSoee+yxRM6ezWbb3njjjV+TIgAA25sCGAAgAYYOHVq21157fSeJs7/33nvxxBNPCBEA2CEmTpwYK1asSOTsQ4YM+c7QoUPLpAgAwPakAAYASIBrr732xKKiosqkzZ3L5eKee+6JxsZGIQIAO0R9fX3cddddkcvlEjd7UVFR5bXXXnuCFAEA2J4UwAAATdwBBxxQMWDAgG8kcfYZM2bEW2+9JUQAYId6880348UXX0zk7AMGDPjG8OHDy6UIAMD2ogAGAGjirrrqqhOKiooqkjb3pk2b4oEHHhAgALBT3H///VFbW5u4uYuKilpcffXV7gIGAGC7UQADADRhBx10UEX//v0Teffvww8/HB9++KEQAYCdYv369TFhwoREzj5w4MBvHHDAARVSBABge1AAAwA0Yf/5n/95bGFhYfOkzb1q1aqYPHmyAAGAnerpp5+O1atXJ27uwsLC8ssuu2yUBAEA2B4UwAAATdQBBxxQMWjQoNFJnP3uu++O+vp6IQIAO1V9fX3cddddiZx99913/+bQoUPLpAgAwGelAAYAaKIuv/zyYwsLC8uTNvfcuXNjwYIFAgQAdokFCxbE3LlzEzd3UVFRi9/97ndflyAAAJ+VAhgAoAkaOnRo2aBBgxL37t+6urr405/+JEAAYJf605/+FHV1dYmbe/fdd//mkCFDSiUIAMBnoQAGAGiCfvOb33ylqKioZdLmfu655xL53j0AIF1Wr14dzz33XOLmLioqann11VcfLUEAAD4LBTAAQBPTq1evZoMHD/5m0uaurq6ORx55RIAAQJPwyCOPRHV1deLmHjJkyLe6deuWlSAAANtKAQwA0MTcdNNNxxQXF7dN2twTJkyIqqoqAQIATUJVVVUifzmtuLi43a233uouYAAAtpkCGACgCWnVqlXhXnvtdVLS5l61alU8++yzAgQAmpTJkyfHqlWrEjf30KFDR7dq1apQggAAbAsFMABAE3LLLbccXlJS0jlpcz/44INRX18vQACgSamvr48HH3wwcXOXlJR0vummmw6VIAAA20IBDADQRGSz2cwBBxzw7aTNvWjRonjppZcECAA0SS+99FIsXrw4cXOPGDHiO9lsNiNBAAC2lgIYAKCJuOaaa/YuLy/vm7S5H3roocjlcgIEAJqkXC6XyLuAy8vL+1111VV7SRAAgK2lAAYAaCK+8pWvfDdpM8+bNy8WLlwoPACgSVu4cGG8+uqrrg8BAMgLCmAAgCbgsssuG1RZWblPkmbO5XIxfvx44QEAifDAAw8k7qklrVu33veSSy7pLz0AALaGAhgAoAkYNWrUCUmbefbs2bFs2TLhAQCJsGzZsnjllVcSN/cJJ5xwovQAANgaCmAAgF3sn//5nzt37NjxiCTN3NjYGA888IDwAIBEGT9+fDQ0NCRq5k6dOn1h9OjRHaQHAMCnpQAGANjFfvSjH30tk8kk6rps2rRpsWrVKuEBAImyatWqeOGFFxI1cyaTKfzpT386SnoAAHxaCmAAgF1o0KBBpX369Plqkmaur6+PCRMmCA8ASKQJEyZEXV1dombu27fvV/r27VssPQAAPg0FMADALnTZZZcdXlRUVJGkmadOnRpr164VHgCQSOvXr48pU6YkauaioqLK3/zmN0dIDwCAT0MBDACwi2Sz2cy+++57UpJmrqurc/cvAJB4jz76aOLuAt5///1PymazGekBAPBJFMAAALvI1VdfPbSsrKx3kmaeMmVKbNiwQXgAQKJt2LAhnn/++UTNXFZW1ueqq67aS3oAAHwSBTAAwC7y5S9/+bgkzVtfXx8TJ04UHACQCo8//nji7gL+0pe+dLzkAAD4JApgAIBdYPTo0R3atm07IkkzT5s2LdatWyc8ACAVPvzww5g+fXqiZm7fvv2I0aNHd5AeAABbogAGANgFfvrTn47KZDKFSZm3vr4+HnnkEcEBAKnyyCOPRH19fWLmzWQyhT/96U+/JjkAALZEAQwAsJN16tQp26dPn6OTNLO7fwGANFq3bl1MmzYtUTP36dPnmE6dOmWlBwDAx1EAAwDsZFddddUB2Wy2dVLmbWxsjEmTJgmOVOvYsWN06OCJmgD5aNKkSdHY2JiYebPZbOurrrrqAMkBAPBxFMAAADvZiBEjvp6keV988cVYtWqV4Ei1Ll26xIUXXhinnXZadO3a1UIA8siqVavipZdecj0JAEBqKIABAHaiM844o3tlZeXeSZk3l8vFxIkTBUdeyGQyMXjw4PjVr34VY8aMcUcwQB55/PHHI5fLJWbeysrKvc8444zukgMA4KMogAEAdqJTTjnlqxGRScq8CxYsiPfee09w5JVMJhN77713XHjhhTFmzJho3769pQCk3HvvvRcLFy5M1B9X/3NdCQAA/4cCGABgJ+nVq1ezXr16fTlJM3v3L/nsr0XwBRdcECeffHK0bdvWUgBSLGnXPb169fpyr169mkkOAIB/pAAGANhJrrjiioOLiopaJmXeBN4JAztEYWFhDB8+PC688MIYPXp0VFZWWgpACi1YsCCWLVuWmHmLiopaXnnllYdIDgCAf6QABgDYSYYPH/6VJM2btHfhwY5WVFQUI0aMiEsuuSRGjx4dLVu2tBSAFMnlcvH4448naub99tvvK5IDAOAfKYABAHaC0aNHd6isrByalHnXrl0bL7/8suDgI/y1CL744ovjhBNOiBYtWlgKQEq89NJLsW7dusTMW1lZudfo0aM7SA4AgL+lAAYA2AlOP/30o5J07fXMM89EQ0OD4GALiouL47DDDouxY8fGqFGjoqyszFIAEq6hoSGeeeaZJI1c8D/XmQAA8P8vEq0AAGDHymazmX79+n05KfPW1tbGlClTBAefUnFxcYwcOTIuvfTSGDVqVJSWlloKQII9//zzUVtbm5h5+/Xr9+VsNpuRHAAAf6UABgDYwX7zm9/sWVJS0jkp886YMSOqq6sFB1uppKQkRo4cGZdcckkcffTRUVJSYikACVRdXR0zZ85M0p8/na+44orBkgMA4K8UwAAAO9gXvvCFLyVl1lwuF08//bTQ4DNo3rx5HHXUUXHJJZfEyJEjI5vNWgpAwjz11FORy+USM++RRx75ZakBAPBXCmAAgB1oyJAhpZ07dz4iKfO+/vrrsWLFCsHBdlBeXh6jRo2KSy+9VBEMkDArVqyI119/PTHzdunS5fD+/ft79AQAABGhAAYA2KHGjh17aGFhYWJeCOruX9j+KioqYtSoUXHxxRfH4YcfHkVFRZYC4LpouyosLGz+H//xHwdLDQCACAUwAMAOteeeex6ZlFnXrl0b8+bNExrsIK1atYrjjz8+LrroohgxYkQUFPh2DKApmzdvXqxZsyYx8+61115HSg0AgAgFMADADnPMMce0bt269b5Jmfe5556LxsZGwcEO1qZNmxg9enRcfPHFimCAJqyxsTGee+65JP35MvyYY45pLTkAAPykAQBgBznzzDMPz2Qyibje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FpafffbZvaQFAJA+CmAAgE9p//3375+EOV9//XVhAXmjvLw8Ro0aFf/+7/8eI0eOjGw2aymA67FP6fOf//xAaQEApI8CGADgU+rRo8fuTX3G2traePvtt4UF5J2KiooYNWpUXHzxxXH44Yc3+XdvAum2ePHiRLySo1evXoOkBQCQPgpgAIBPqXXr1k3+DoklS5ZEQ0ODsIC81apVqzj++OPj4osvjhEjRkRBgW97gZ2voaEhlixZ0uTnbNOmjQIYACCFfCcMAPApDBkypLR58+a9m/qcb775prAAIqJ169YxevToGDt2rCIYcF32MZo3b95n0KBBpdICAEgX3wEDAHwKp556av9MJtPkr53eeustYQH8jTZt2sTo0aPjvPPOi+HDhyuCAddlfyOTyRT84Ac/+Jy0AADSxXe+AACfwuDBg5v84/Hq6+tj0aJFwgL4CJ06dYqTTz45/u3f/i323nvvyGQylgLsUIsXL07Eqzn23HPPgdICAEgXBTAAwKfQpUuXAU19xnfeeSfq6uqEBbAFnTt3jjFjxiiCgR2utrY23n333SRc53oPMABAyiiAAQA+hZYtW/Zv6jN6/DPAp9elS5cYM2ZMnHvuuTF48GALAfL2+iwJ17kAAGwdBTAAwCcYPnx4eUlJSeemPqfHPwNsvV69esVpp50W55xzTvTvrwMB8u/6rLS0tPPw4cPLpQUAkB4KYACAT/Ctb31rt4ho8s8IXbx4sbAAtlGfPn3irLPOinPOOSd22203CwG2i4T8gl7m29/+dj9pAQCkhwIYAOAT7L777k2+CVi7dm1s2LBBWACfUZ8+feLss8+OM888M3r27GkhwGfy4Ycfxrp165r8nAMHDlQAAwCkSJEVAABsWadOnZr8D8TefvttQQFsRwMGDIgBAwbEggULYvz48bF06VJLAbb5Oq1Vq1audwEA2GkUwAAAn6CyslIBDJCnBgwYEP3794958+bFQw89FO+++66lAFtlyZIlsddeezX1613PvgcASBEFMADAFnTq1CnbvHnzXk19ziVLlggLYAfJZDIxePDg2GOPPeLll1+OBx98MFauXGkxQGqu05o3b967Xbt2RatXr66XGABA8nkHMADAFowZM6ZnJpPJNuUZGxsbPZoUYCfIZDKx9957x4UXXhhjxoyJ9u3bWwrwiZYuXRqNjY1NesaCgoLsqaee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k8nE7NmzY+LEibFmzRoNAXif/VNSzJo161kTAwBongTAAAC70O233/7KOeecszU/P78022sdMGBAtG/f3tWu0My9+uqrMWnSpFi1apVmALyPjh07xgEHHJCIWhsbG6u/8Y1v/NXUAACaJwEwAMAutHLlyob169fP6tat2+hsrzWVSsXhhx8ekyZNMjhohubMmROTJ0+OJUuWaAbAh3D44YdHKpVKRK3r16+fVVFR0WhqAADNU54WAADsWq+++mpirts77LDDDAyamTfffDP+/d//PX7yk58IfwE+pFQqFSNGjEhMva+88sozpgYA0Hw5AQwAsIvddNNNz5166qnV+fn5rbO91m7dukX//v1j4cKFBgc5btmyZfHYY4/F/PnzNQPgIzrggAOic+fOiai1sbFxy4033jjL1AAAmi8BMADALrZy5cqG8vLyGT179vx0Euo9+uijBcCQw5YvXx7jxo0T/AJ8wv1SUpSXlz9TXl7eYGoAAM2XABgAYDeYMWPGUxdccEEiAuAhQ4ZE69ato7q62uAgh6xcuTImTJgQc+fOjUwmoyEAH1ObNm3i0EMPTUy9zz777FOmBgDQvPkGMADAbvDVr371lYaGhk1JqLWgoCCOOOIIQ4McsW7duvj5z38ed955Z8yZM0f4C/AJjRw5MvLz8xNRa0NDw8abbrrpVVMDAGjenAAGANgNKisrm1atWjW9T58+5ySh3qOPPjqefPJJQREk2Pr16+Oxxx6L2bNn+3cZYBdJpVIxatSoxNS7cuXKadXV1WmTAwBo3pwABgDYTaZNm5aY6/c6duwYAwYMMDRIoA0bNsSvf/3r+Nd//dd49dVXhb8Au9CAAQOiY8eOian36aefftLUAAAQAAMA7CZf+9rX5tTX11ckpd6jjjrK0CBBqqqq4v77749vf/vb8eKLL0ZTU5OmAOxiRx55ZGJqra+vX/eNb3zjdVMDAMAV0AAAu0ltbW16xYoVT++///6fT0K9hx56aLRt2zaqqqoMD7LYli1bYsqUKfHcc8/F9u3bNQRgN2nbtm0MGTIkMfUuX778qdraWtc/AwDgBDAAwO70xz/+cUJSas3Pz4/jjjvO0CBL1dTUxKOPPhq33XZb/OUvfxH+Auxmxx57bOTn5yel3Myvf/3rCaYGAECEABgAYLe66667llZXV89PSr1HH310tGjRwuAgi7wd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qATAAABZ4umnn968fPnyxF3xN3r06GjXrp0BAgBZqUOHDnH88ccnru5ly5ZNmD59+hYTBADgoxIAAwBkkbvvvvtPmUymKUk1FxYWxumnn254AEBWOvPMMxP3yYpMJtN41113/dH0AAD4OATAAABZ5Be/+MWatWvXTkta3UcccUT06tXLAAGArNK7d+847LDDEld3eXn5X+6///51JggAwMchAAYAyDIPP/zwn5JWcyqVijPPPNPwAICsMmbMmEilUomr+8EHH/yT6QEA8HEJgAEAsszXv/71NzZs2DAraXUPHDgwDj74YAMEALLCoEGDYsCAAYmru6KiYuatt966wAQBAPi4BMAAAFlo3Lhxv01i3WPGjIm8PFtMAGDvysvLizFjxiSy9j//+c+/NUEAAD7RflgLAACyz/XXXz+nqqrqr0mru1evXnHUUUcZIACwVx1zzDHRvXv3xNW9adOmV2666aa5JggAwCchAAYAyFJ/+tOf7k1i3WPGjInS0lIDBAD2ijZt2sRZZ52VyNofeOCBe00QAIBPSgAMAJClbrrpprlJPAVcXFwcZ555pgECAHvFWWedFS1btkxc3Zs2bXrl5ptvnmeCAAB8UgJgAIAsNm7cuF8lse5Ro0ZF7969DRAA2KP69OkTI0eOTGTtjz322K9MEACAXUEADACQxcaOHTu7qqrqb0mrO5VKxfnnnx+pVMoQAYA9tv/4/Oc/n8j9R2Vl5d+uueaav5kiAAC7ggAYACDLTZ069bdJrLtv374xZMgQAwQA9ojDDjsssTeQTJ48+TcmCADAriIABgDIcpdeeumLVVVVryax9s9//vNRXFxsiADAblVaWhrnn39+Imuvqqr66+WXX/6SKQIAsKsIgAEAEuChhx76WRLrLisri9NPP90AAYDd6qyzzoqSkpIklp753e9+91MTBABgVxIAAwAkwA033DB3w4YNs5JY+3HHHRd9+vQxRABgt+jbt28cddRRiay9oqJi1te//vU3TBEAgF1JAAwAkBA///nPfxoR6aTVnUql4vOf/3zk5dl6AgC7Vn5+flx00UWRSqWSWH76F7/4xX+bIgAAu5q3cAAACXHHHXe8tW7duulJrL13795xzDHHGCIAsEudcMIJ0b1790TWXl5e/pc77rjjLVMEAGBXEwADACTI3XfffW8mk2lKYu1nnXVWtG3b1hAB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onv37vEv//IvccABBzSrdWcymaYnnnji9s997nPPeAoAAODDEQADAJBYDz/88NJjjjlmY+/evY+KiGZzFKq0tDSGDx8eq1evjvXr13sQAHLcwIED45prrol27do1t6VnZsyY8YOzzjprqqcAAAA+PAEwAACJdv/99795zDHHVO6zzz5HRDMKgVu0aBGHHXZYtGzZMhYuXBjpdNrDAJBjCgoK4pxzzonzzz8/WrRo0dyWn37uuefuOuWUUyZ4EgAA4KMRAAMAkHi///3v5w8bNmxF3759j2lO10GnUqno27dvDB06NBYvXhxbtmzxMADkiJ49e8YNN9wQgwcPblbf+434x7XPU6ZM+fbpp58+2ZMAAAAfnQAYAICc8OCDDy4ZNmzYin79+jWrEDgionXr1nHEEUdEfX19LF261MMAkGCpVCpOOOGEuOKKK6JNmzbNbv07wt9vnXPOOX/xNAAAwMcjAAYAIGc89NBDS4YNG7a8X79+xza3EDg/Pz8OPvjg6NWrV8yfPz8aGho8EAAJU1JSEpdffnmccMIJkZ+f3+zWn8lkGp944olvffazn53maQAAgI9PAAwAQE556KGHlo4cOXJdnz59RqWa252ZEdG1a9cYNmxYLFu2LCorKz0QAAnRt2/fuO6662K//fZrluvPZDLpp59++rvnnHPO054GAAD4ZATAAADknD/96U+LDj300KX7779/s7sOOiKiuLg4jjzyyCgpKYk333wz0um0hwIgSxUUFMRnP/vZuPDCC6OkpKRZ9iCdTjc88sgjt5x//vnTPREAAPDJCYABAMhJDz/88NId3wQelUqlmt09mqlUKvr06RMHH3xwLFy4MLZt2+ahAMgynTt3jrFjx8bQoUOjGV5aERH/CH+feOKJ2y+88MLnPBEAALBrCIABAMhZDz300JIePXq8NmjQoGPz8vJaNMcetG3bNkaNGhVNTU2xZMkSDwVAFkilUjF69Oi48soro0OHDs22D01NTdt++9vf/stll132oqcCAAB2HQEwAAA5bdKkSeXdu3efM3jw4GYbAufn58eAAQOiV69esWDBgti+fbsHA2Avad26dVx66aVx/PHHR35+frPtQ2NjY/WvfvWrf7nuuute81QAAMCuJQAGACDnTZ48eW1jY+OMI4444uiCgoKS5tqHrl27xqhRo2Lbtm2xcuVKDwbAHpRKpWLUqFExduzY6NWrV7PuRX19/fo77rjjK9/61rcWejIAAGDXEwADANAsPP/881UbNmx45rjjjjuqsLCwrLn2obCwMAYNGhT77bdfLF68OGpraz0cALtZ+/bt44orrogTTzwxCgub9/uU2tralTfffPPVP/nJT1Z7MgAAYPcQAAMA0Gz87W9/27p27doZJ5xwwsjCwsK2zbkXnTp1ipEjR0Z1dbXTwAC70ciRI+Pqq6+OHj16NPte1NTULL/hhhuu/e1vf7vOkwEAALuPABgAgGbltdde2zpv3rynTznllKFFRUWdmnMvCgsL49BDD4399tsvFi1a5DQwwC709qnfk08+udmf+o2I2Lx587yLL774unHjxm30dAAAwO71fgFwat9zYsTOftC4LmLjq610DwCAxOrVq1fhs88++69du3Y9QTciGhoaYurUqTF58uRobGzUEICPqaCgIE499dQYPXq04HeH8vLyp4499tjvrly5skE3AABg9+swrDYKuuz8ZwJgAAByWuvWrfNeeumlm/fdd9+zdeMfVq9eHffff38sWbJEMwA+ov322y8uuugi1z2/w8KFC38/fPjwnzY0NGR0AwAA9gwBMAAAzd7zzz9/8aGHHnp1RKR0IyKTycTMmTPjz3/+c9TV1WkIwAcoKSmJ8847L0aMGBGplL9Kdki//PLL9xx77LEPagUAAOxZ7xcA+wYwAADNwn333Tfn+OOP39yrV6/DQwgcqVQqevfuHcOHD49169ZFRUWFhwTgPRxyyCExduzY6N+/v/B3h0wm0/jMM8/828knnzxONwAAYM97v28AC4ABAGg2fve7370xePDgJf369Ts6lUrl60hEcXFxjBgxInr06BFLly6N2tpaTQHYoUOHDvGFL3whzjzzzCguLtaQHZqammoeeOCBWz73uc9N1w0AANg7BMAAALDDww8/vKygoOC54cOHH1FQUFCqI//QrVu3OO6446K0tDQWL14cTU1NmgI0Wy1btoxzzjknLr300ujevbuGvENtbe2K22677arbbrvtDd0AAIC9RwAMAADv8Oyzz25avHjx0yeddNKQoqKiTjryD3l5edGnT58YOXJkbN26NVatWqUpQLNz+OGHx1e+8pUYMGBA5OXlacg7VFVV/e3CCy+8/oEHHvDdAAAA2MsEwAAA8C7z58+vefbZZ58+44wz+hcX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OigOOOCAKCoq0pQs0djYuGXmzJk/PvPMMyc2NDS4XgAAAPjQBMAAAJADjjzyyNY/+9nPrujbt++5EZGnI9mluro6Fi5cGPPnz4958+ZFZWWlprBXtGvXLg455JAYMGBA9O/fP1q39nsjWSj91ltv/fmqq676xaxZs6q1AwAA+KgEwAAAkEN++ctfjhgzZsyNrVq16q0b2SmdTsfKlStj0aJFsXDhwli8eHFs27ZNY9gtSkpKol+/ftG/f//Yf//9o1evXpGX53dEslVNTc3yRx999EdXXnnlK7oBAAB8XAJgAADIMd26dSt8+OGHPzd48ODL8vPzbdyzXCaTiTVr1sTChQtj0aJFsWjRotiyZYvG8LGUlZVF//79/xn6du/ePVKplMZkuaampprXXnvtV2PGjHmgoqKiUUcAAIBPQgAMAAA56rjjjiv7r//6r8tdC508mzdvjuXLl8eKFSti+fLlsXjx4qipqdEY/pfi4uLo169f9O7dO/bZZ5/Yd999o6ysTGMSJJPJpJcsWfLn66677pfTp0/3mx8AAMAuIQAGAIAc99Of/nTIueeee3NpaWlf3UimxsbGWLlyZSxdujSWLVsWy5cvj3Xr1kUmk9GcZiKVSkWXLl1in332iT59+kSfPn2iV69eUVBQoDkJtXXr1sUPPvjgj6699tq/6wYAALArCYABAKAZaNeuXf64cePOGTp06BUFBQWtdST56uvrY+XKlf88KbxixYpYu3ZtpNNpzUm4vLy86Nq1a+yzzz7//KdXr17RsmVLzckBjY2NW/7617/+4pxzznm0srKySUcAAIBdTQAMAADNyIknntjmnnvuuXzfffcdk0qlHB3MMdu3b481a9bEmjVrYu3atbF27dooLy+PDRs2CIazUF5eXnTs2DG6desWXbt2jW7dukW3bt2iR48eUVhYqEE5JpPJNC5ZsuRR1z0DAAC7mwAYAACaoa9+9av7Xnfdddd16NDhCN3IfY2Njf8MhNetWxfr1q2LioqKWLduXWzbtk2DdrPS0tLo3LnzP//p0qVLdO3aNbp27eoK52Ziw4YNM//rv/7rxz/60Y+W6wYAALC7CYABAKAZ++UvfznirLPOuq64uNj3gZupmpqaWL9+/T//qaioiMrKyqisrIxNmzZFY2OjJn2AgoKCaN++fbRr1y7at28fHTt2jC5dukSnTp2ic+fOUVxcrEnN1NatW98aP378PVdcccXLugEAAOwpAmAAAGjm2rVrl//ggw+eOWLEiCsLCwvb6gjvtHnz5n+GwZs2bYrKysqorq6OLVu2xJYtW6K6ujqqq6sjk8nk3NpTqVS0bt06WrduHWVlZdGmTZsoLS39X2Fvu3btok2bNh4U/peGhobKl1566efnnHPO+OrqavevAwAAe5QAGAAAiIiIoUOHFt97770XHHjggRfk5+c7ssiHlk6n/xkEV1dXR01Nzfv+k8lkora2NtLpdNTX10dTU1PU1dXt0u8U5+XlRcuWLSM/Pz+KiooiLy8vWrVqFalUKoqLi3f6T0lJSbRq1eqfgW9paWnk5eUZMB9aU1NTzYIFC/745S9/+Y+zZ8+u0REAAGBvEAADAAD/y2mnndb2rrvuurRPnz5n5+XlFeoIe9LbgfDbtm/f/r7XUBcUFESLFi3++b/fDnxhT8pkMg1LliwZd8stt/xq0qRJVToCAADsTQJgAABgp0477bS2d95554X777//5wTBAP9XJpNpWLhw4QO33nrrHwS/AABAtni/ADi/7UHRc2c/SG+LqC33/gcAAHLZokWL6u69995X0un0swcddFCnkpKS3roC8A8VFRUz/7//7/+77aKLLpq6aNGiOh0BAACyRXH3xsgr3fnPBMAAAEDMnDmz8u67736qqalpWr9+/Ypbt27dN5VKpXQGaG4ymUx6zZo1U+65555/Peeccx6cOXNmpa4AAADZRgAMAAB8KDNnzqz88Y9//Gw6nZ4uCAaak7eD37vvvvtfzz///McEvwAAQDYTAAMAAB+JIBhoLgS/AABAEgmAAQCAj+XtILisrOyFvn37diwuLu4VEYJgIBdkKioqnrv33nu/PWbMmEcEvwAAQJK8XwCc2vecGLGzHzSui9j4aivdAwAA/unqq6/u8ZWvfOX8Pn36nJWXl9dCR4CkSafT9UuXLh3/X//1Xw/84he/WKMjAABAEnUYVhsFXXb+MwEwAADwkZ1xxhntb7/99rMPPPDA8/Pz81vrCJDtmpqaqhcsWPDgd77znUcmTpzotC8AAJBoAmAAAGC3GD58eMkPf/jDzwwePPjioqKijjoCZJv6+voNr7322u9vvPHGx2fPnl2jIwAAQC4QAAMAALvV0KFDi++5556zDjnkkPOKioq66giwt9XV1a19/fXXH7z++uvHC34BAIBcIwAGAAD2iFatWuXdc889w0455ZTzO3bseJSOAHtYZsOGDbOmTJny4PXXX/9qbW1tWksAAIBcJAAGAAD2uH/913/tf/7555/dq1ev0/Ly8lroCLC7pNPp+pUrV05+4IEHHvnOd76zSEcAAIBcJwAGAAD2mjPOOKP97bfffvYBBxzw2YKCgjY6AuwqjY2NVW+++eafv/e97z06YcKETToCAAA0FwJgAABgrxs+fHjJ97///dGDBg0aU1paur+OAB9XdXX1wtdee+3Rr371q1Nfe+21Wh0BAACaGwEwAACQVb761a/ue8EFF3y6b9++ZxUUFLTWEeCDNDY2bnnrrbfG/+EPf5j4ox/9aLmOAAAAzZkAGAAAyEpDhw4t/sEPfnDy4MGDz27dunV/HQHerbq6+s2XX375weuuu+7ppUuXbtcRAAAAATAAAJDlCgsLU3ffffeQ0aNHn9G1a9fj8vLyinQFmq90Ol1XXl4+bcqUKROuvfbav+sIAADA/yYABgAAEqNPnz4t/v3f/33UyJEjz2rfvv2nIiKlK9AsZDZt2vTXF1544bGvfe1rzzntCwAA8N4EwAAAQCJddNFFXa6++uqTDzzwwLNbtmzZTUcg99TV1a1ZsGDBuJ/+9KdP3n///et0BAAA4IMJgAEAgETr1q1b4d13333k4YcffmqHDh2OyMvLK9QVSK50Ot2wcePGWbNmzZp8/fXXz6qoqGjUFQAAgA9PAAwAAOSMo48+uvWtt956/CGHHHJKu3btBkdEnq5AIqQrKytfmzdv3uQ777xz+owZM6q1BAAA4OMRAAMAADnpuOOOK/vGN75x/CGHHHJa27ZtB4bvBUO2yVRVVc2dN2/epO9///vTpk+fvkVLAAAAPjkBMAAAkPNuu+22vmedddZJffr0Oa5Vq1a9dQT2ntra2uXLly+f/uijjz51xx13vKUjAAAAu5YAGAAAaFa+9KUvdbv44ouP7t+//wlOBsMekamqqpq7cOHCv/z+97+fcd9995VrCQAAwO4jAAYAAJqtSy65pOtll112jDAYdrl0VVXVvIULF/7lV7/61bO/+93v1moJAADAniEABgAAiIirr766x/nnnz9q//33P7JNmzZDUqlUga7Ah5fJZBoqKyv/vnjx4uf+9Kc/zbr33ntX6woAAMCeJwAGAAB4l379+hV97WtfGzRy5MhRPXv2PLaoqKizrsD/VV9fv37VqlXPvPDCC8/9+7//+5zFixfX6woAAMDeJQAGAAB4H61bt8678847Bx599NFHde/efURpaen+4apomq/M1q1bF69Zs+bF5557btY3v/nNOdXV1WltAQAAyB4CYAAAgI9g8ODBrcaOHXvI8OHDD+vevfvw1q1bHxACYXJXprq6+s01a9a88sorr7z8k5/8ZN5rr71Wqy0AAADZSwAMAADwCVx//fX7nHHGGYf169dvePv27Yfm5+e31hWSrLGxsXrjxo2vvvXWWy+PHz/+lR//+McrdQUAACA5BMAAAAC70Je//OUe55xzzvA+ffoM7tix45CioqKuukI2q6+vX7t27doXFy9ePGfixImv3Xvvvat1BQAAILkEwAAAALvRl7/85R6f+cxnBvfr129Qly5dDm/ZsqVAmL2qrq5u7bp16wS+AAAAOUoADAAAsIe0atUq75prrtnn2GOPPXi//fY7uH379oeUlpb2TaVS+brDbpKuqalZtnHjxnlvvfXW3GeffXbef/3Xfy2vra1Naw0AAEBuEgADAADsRQceeGDLq6+++oAhQ4Yc3LNnz4Pbtm17sGuj+biampqqq6qqXi8vL583Z86ceb/85S/nvfjii1t1BgAAoPkQAAMAAGSZoUOHFn/xi1/cf9CgQQf26NHjwHbt2h3YqlWr3qlUKk932CFdU1OzvLKycsHq1asXzJkzZ8Gf//znJTNmzKjWGgAAgOZNAAwAAJAAxx13XNkFF1xw4MEHH3xA165dDywtLd23pKRkn1QqVag7uS2TyTRs27ZtRXV19dJ169YtfOONNxZOmDBh4YQJEzbpDgAAAO8mAAYAAEiw8847r+OJJ57Yp3///vt16dKlT5s2bfZr3bp1v/z8/GLdSZampqaa6urqxZs3b16ybt26pQsXLlzy9NNPL33ooYc26A4AAAAflgAYAAAgx7Rr1y7/kksu6TFkyJCe++67b89OnTr1Kisr61VcXNyzZcuW3VKpVL4u7R2ZTKaprq6uvKamZtWWLVtWVlRUrFy6dOnK2bNnr7r//vvXVFZWNukSAAAAn4QAGAAAoBnp1KlTwec+97luQ4cO7bnPPvv0aNeuXafWrVt3Li4u7tqyZcvORUVFnfLy8lro1MeTTqe319fXr6+rq6uoqalZW11dvb6y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AACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoMY3JP//9K8My551lzpAk293a7QAAAAAAAAD8iIw3r+SL7TpPxuSt4/ibJJuz20QDBgAAAAAAAHhzrJPp6NvHYcyyjLl7dJTPbl/Jp6sPLufSsM+5ec7q5YOrF0OeP/SVaAAAAAAAAIA3weH7u6zfm79dWDIMSw6225w785vsx3XyzasOby5ssz69c4sAAAAAAAAAr9n69C6bC9sT93a7rKdnORin5Otxynzi1JQcfiwCAwAAAAAAALxO69O7HH68TaaT98cp85R8vbp3Nfszv8q0LHn7xMF1sjk/ZzUPmZ/MmWefhAYAAAAAAAD4oayPdjn7223Gn7x6ZrXPnetX8mBKkpv3cufDd/Pufn5FL56SzcVtNheT3dNt8tQlAwAAAAAAAHyv1sm0ySv/9XtsNWZ3I/lHkgzHi7/4XY7WYz5yiwAAAAAAAAA/Ivtcv/3nPEyS1fHa42t5+vNLyX7JoRsCAAAAAAAAePPt1/nbV3/KvePn1Xc371/NYxEYAAAAAAAA4M0yTHk2rvNo2WdzvHZqzN9v/SF3vju3evng/at5fPDLPDu1yuGyZHSVAAAAAAAAAK/XOGe4ueSvZ4e8M8xZbVe5ceuPufvy3Oqkw4+v5emDX+fuuTlLhhwsEYIBAAAAAAAAXpclGR8OuXP0TR4cPM/9z/+SRyfNDf/1TZezOp/87KdjzizJZkhO7edMy/w/nAUAAAAAAADg/zaMWcZkP8/ZLsmLacr2/MV8+cnvs/tP5/4FmLjAq1ifcioAAAAASUVORK5CYII=";
function pe(e, r, t) {
  return typeof e == "string" && !isNaN(Number(e)) && (e = Number(e)), typeof e == "number" && e < 100 ? ve(e) : typeof e == "number" && e >= 100 ? e : typeof e == "string" && e.includes("%") ? Math.round(r && r === "X" ? parseFloat(e) / 100 * t.width : r && r === "Y" ? parseFloat(e) / 100 * t.height : parseFloat(e) / 100 * t.width) : 0;
}
function Dr(e) {
  return e.replace(/[xy]/g, function(r) {
    const t = Math.random() * 16 | 0;
    return (r === "x" ? t : t & 3 | 8).toString(16);
  });
}
function fe(e) {
  return typeof e > "u" || e == null ? "" : e.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function ve(e) {
  return typeof e == "number" && e > 100 ? e : (typeof e == "string" && (e = Number(e.replace(/in*/gi, ""))), Math.round(he * e));
}
function de(e) {
  const r = Number(e) || 0;
  return isNaN(r) ? 0 : Math.round(r * Ft);
}
function dt(e) {
  return e = e || 0, Math.round((e > 360 ? e - 360 : e) * 6e4);
}
function Vr(e) {
  const r = e.toString(16);
  return r.length === 1 ? "0" + r : r;
}
function Hr(e, r, t) {
  return (Vr(e) + Vr(r) + Vr(t)).toUpperCase();
}
function be(e, r) {
  let t = (e || "").replace("#", "");
  !qr.test(t) && t !== Me.background1 && t !== Me.background2 && t !== Me.text1 && t !== Me.text2 && t !== Me.accent1 && t !== Me.accent2 && t !== Me.accent3 && t !== Me.accent4 && t !== Me.accent5 && t !== Me.accent6 && (console.warn(`"${t}" is not a valid scheme color or hex RGB! "${Ie}" used instead. Only provide 6-digit RGB or 'pptx.SchemeColor' values!`), t = Ie);
  const s = qr.test(t) ? "srgbClr" : "schemeClr", n = 'val="' + (qr.test(t) ? t.toUpperCase() : t) + '"';
  return r ? `<a:${s} ${n}>${r}</a:${s}>` : `<a:${s} ${n}/>`;
}
function to(e, r) {
  let t = "";
  const s = Object.assign(Object.assign({}, r), e), n = Math.round(s.size * Ft), o = s.color, l = Math.round(s.opacity * 1e5);
  return t += `<a:glow rad="${n}">`, t += be(o, `<a:alpha val="${l}"/>`), t += "</a:glow>", t;
}
function $e(e) {
  let r = "solid", t = "", s = "", n = "";
  return e && (typeof e == "string" ? t = e : (e.type && (r = e.type), e.color && (t = e.color), e.alpha && (s += `<a:alpha val="${Math.round((100 - e.alpha) * 1e3)}"/>`), e.transparency && (s += `<a:alpha val="${Math.round((100 - e.transparency) * 1e3)}"/>`)), r === "solid" ? n += `<a:solidFill>${be(t, s)}</a:solidFill>` : n += ""), n;
}
function Ke(e) {
  return e._rels.length + e._relsChart.length + e._relsMedia.length + 1;
}
function xa(e) {
  if (!(!e || typeof e != "object"))
    return e.type !== "outer" && e.type !== "inner" && e.type !== "none" && (console.warn("Warning: shadow.type options are `outer`, `inner` or `none`."), e.type = "outer"), e.angle && ((isNaN(Number(e.angle)) || e.angle < 0 || e.angle > 359) && (console.warn("Warning: shadow.angle can only be 0-359"), e.angle = 270), e.angle = Math.round(Number(e.angle))), e.opacity && ((isNaN(Number(e.opacity)) || e.opacity < 0 || e.opacity > 1) && (console.warn("Warning: shadow.opacity can only be 0-1"), e.opacity = 0.75), e.opacity = Number(e.opacity)), e.color && e.color.startsWith("#") && (console.warn('Warning: shadow.color should not include hash (#) character, , e.g. "FF0000"'), e.color = e.color.replace("#", "")), e;
}
function ro(e, r, t) {
  var s, n;
  const o = 2.3 + (!((s = e.options) === null || s === void 0) && s.autoPageCharWeight ? e.options.autoPageCharWeight : 0), l = Math.floor(r / Ft * he) / ((!((n = e.options) === null || n === void 0) && n.fontSize ? e.options.fontSize : Ue) / o), A = [];
  let c = [];
  const a = [], i = [];
  e.text && e.text.toString().trim().length === 0 ? c.push({ _type: ue.tablecell, text: " " }) : typeof e.text == "number" || typeof e.text == "string" ? c.push({ _type: ue.tablecell, text: (e.text || "").toString().trim() }) : Array.isArray(e.text) && (c = e.text);
  let f = [];
  return c.forEach((y) => {
    var d;
    typeof y.text == "string" && (y.text.split(`
`).length > 1 ? y.text.split(`
`).forEach((m) => {
      f.push({
        _type: ue.tablecell,
        text: m,
        options: Object.assign(Object.assign({}, y.options), { breakLine: !0 })
      });
    }) : f.push({
      _type: ue.tablecell,
      text: y.text.trim(),
      options: y.options
    }), !((d = y.options) === null || d === void 0) && d.breakLine && (a.push(f), f = [])), f.length > 0 && (a.push(f), f = []);
  }), a.forEach((y) => {
    y.forEach((d) => {
      const m = [], g = String(d.text).split(" ");
      g.forEach((p, h) => {
        const _ = Object.assign({}, d.options);
        _?.breakLine && (_.breakLine = h + 1 === g.length), m.push({ _type: ue.tablecell, text: p + (h + 1 < g.length ? " " : ""), options: _ });
      }), i.push(m);
    });
  }), i.forEach((y) => {
    let d = [], m = "";
    y.forEach((u) => {
      m.length + u.text.length > l && (A.push(d), d = [], m = ""), d.push(u), m += u.text.toString();
    }), d.length > 0 && A.push(d);
  }), A;
}
function yi(e = [], r = {}, t, s) {
  let n = kt, o = he * 1, l = he * 1, A = 0, c = 0;
  const a = [], i = pe(r.x, "X", t), f = pe(r.y, "Y", t), y = pe(r.w, "X", t), d = pe(r.h, "Y", t);
  let m = y;
  function u() {
    let p = 0;
    a.length === 0 && (p = f || ve(n[0])), a.length > 0 && (p = ve(r.autoPageSlideStartY || r.newSlideStartY || n[0])), l = (d || t.height) - p - ve(n[2]), a.length > 1 && (typeof r.autoPageSlideStartY == "number" ? l = (d || t.height) - ve(r.autoPageSlideStartY + n[2]) : typeof r.newSlideStartY == "number" ? l = (d || t.height) - ve(r.newSlideStartY + n[2]) : f && (l = (d || t.height) - ve((f / he < n[0] ? f / he : n[0]) + n[2]), l < d && (l = d)));
  }
  if (r.verbose && (console.log("[[VERBOSE MODE]]"), console.log("|-- TABLE PROPS --------------------------------------------------------|"), console.log(`| presLayout.width ................................ = ${(t.width / he).toFixed(1)}`), console.log(`| presLayout.height ............................... = ${(t.height / he).toFixed(1)}`), console.log(`| tableProps.x .................................... = ${typeof r.x == "number" ? (r.x / he).toFixed(1) : r.x}`), console.log(`| tableProps.y .................................... = ${typeof r.y == "number" ? (r.y / he).toFixed(1) : r.y}`), console.log(`| tableProps.w .................................... = ${typeof r.w == "number" ? (r.w / he).toFixed(1) : r.w}`), console.log(`| tableProps.h .................................... = ${typeof r.h == "number" ? (r.h / he).toFixed(1) : r.h}`), console.log(`| tableProps.slideMargin .......................... = ${r.slideMargin ? String(r.slideMargin) : ""}`), console.log(`| tableProps.margin ............................... = ${String(r.margin)}`), console.log(`| tableProps.colW ................................. = ${String(r.colW)}`), console.log(`| tableProps.autoPageSlideStartY .................. = ${r.autoPageSlideStartY}`), console.log(`| tableProps.autoPageCharWeight ................... = ${r.autoPageCharWeight}`), console.log("|-- CALCULATIONS -------------------------------------------------------|"), console.log(`| tablePropX ...................................... = ${i / he}`), console.log(`| tablePropY ...................................... = ${f / he}`), console.log(`| tablePropW ...................................... = ${y / he}`), console.log(`| tablePropH ...................................... = ${d / he}`), console.log(`| tableCalcW ...................................... = ${m / he}`)), !r.slideMargin && r.slideMargin !== 0 && (r.slideMargin = kt[0]), s && typeof s._margin < "u" ? Array.isArray(s._margin) ? n = s._margin : isNaN(Number(s._margin)) || (n = [Number(s._margin), Number(s._margin), Number(s._margin), Number(s._margin)]) : (r.slideMargin || r.slideMargin === 0) && (Array.isArray(r.slideMargin) ? n = r.slideMargin : isNaN(r.slideMargin) || (n = [r.slideMargin, r.slideMargin, r.slideMargin, r.slideMargin])), r.verbose && console.log(`| arrInchMargins .................................. = [${n.join(", ")}]`), (e[0] || []).forEach((h) => {
    h || (h = { _type: ue.tablecell });
    const _ = h.options || null;
    c += Number(_?.colspan ? _.colspan : 1);
  }), r.verbose && console.log(`| numCols ......................................... = ${c}`), !y && r.colW && (m = Array.isArray(r.colW) ? r.colW.reduce((p, h) => p + h) * he : r.colW * c || 0, r.verbose && console.log(`| tableCalcW ...................................... = ${m / he}`)), o = m || ve((i ? i / he : n[1]) + n[3]), r.verbose && console.log(`| emuSlideTabW .................................... = ${(o / he).toFixed(1)}`), !r.colW || !Array.isArray(r.colW))
    if (r.colW && !isNaN(Number(r.colW))) {
      const p = [];
      (e[0] || []).forEach(() => p.push(r.colW)), r.colW = [], p.forEach((_) => {
        Array.isArray(r.colW) && r.colW.push(_);
      });
    } else {
      r.colW = [];
      for (let p = 0; p < c; p++)
        r.colW.push(o / he / c);
    }
  let g = { rows: [] };
  return e.forEach((p, h) => {
    const _ = [];
    let E = 0, v = 0, C = [];
    p.forEach((k) => {
      var O, T, M, w;
      C.push({
        _type: ue.tablecell,
        text: [],
        options: k.options
      }), k.options.margin && k.options.margin[0] >= 1 ? (!((O = k.options) === null || O === void 0) && O.margin && k.options.margin[0] && de(k.options.margin[0]) > E ? E = de(k.options.margin[0]) : r?.margin && r.margin[0] && de(r.margin[0]) > E && (E = de(r.margin[0])), !((T = k.options) === null || T === void 0) && T.margin && k.options.margin[2] && de(k.options.margin[2]) > v ? v = de(k.options.margin[2]) : r?.margin && r.margin[2] && de(r.margin[2]) > v && (v = de(r.margin[2]))) : (!((M = k.options) === null || M === void 0) && M.margin && k.options.margin[0] && ve(k.options.margin[0]) > E ? E = ve(k.options.margin[0]) : r?.margin && r.margin[0] && ve(r.margin[0]) > E && (E = ve(r.margin[0])), !((w = k.options) === null || w === void 0) && w.margin && k.options.margin[2] && ve(k.options.margin[2]) > v ? v = ve(k.options.margin[2]) : r?.margin && r.margin[2] && ve(r.margin[2]) > v && (v = ve(r.margin[2])));
    }), u(), A += E + v, r.verbose && h === 0 && console.log(`| SLIDE [${a.length}]: emuSlideTabH ...... = ${(l / he).toFixed(1)} `), p.forEach((k, O) => {
      var T;
      const M = {
        _type: ue.tablecell,
        _lines: null,
        _lineHeight: ve((!((T = k.options) === null || T === void 0) && T.fontSize ? k.options.fontSize : r.fontSize ? r.fontSize : Ue) * (ji + (r.autoPageLineWeight ? r.autoPageLineWeight : 0)) / 100),
        text: [],
        options: k.options
      };
      M.options.rowspan && (M._lineHeight = 0), M.options.autoPageCharWeight = r.autoPageCharWeight ? r.autoPageCharWeight : null;
      let w = r.colW[O];
      k.options.colspan && Array.isArray(r.colW) && (w = r.colW.filter((G, ee) => ee >= O && ee < ee + k.options.colspan).reduce((G, ee) => G + ee)), M._lines = ro(k, w), _.push(M);
    }), r.verbose && console.log(`
| SLIDE [${a.length}]: ROW [${h}]: START...`);
    let x = 0, P = 0, R = !1;
    for (; !R; ) {
      const k = _[x];
      let O = C[x];
      _.forEach((w) => {
        w._lineHeight >= P && (P = w._lineHeight);
      }), A + P > l && (r.verbose && (console.log(`
|-----------------------------------------------------------------------|`), console.log(`|-- NEW SLIDE CREATED (currTabH+currLineH > maxH) => ${(A / he).toFixed(2)} + ${(k._lineHeight / he).toFixed(2)} > ${l / he}`), console.log(`|-----------------------------------------------------------------------|

`)), C.length > 0 && C.map((G) => G.text.length).reduce((G, ee) => G + ee) > 0 && g.rows.push(C), a.push(g), g = { rows: [] }, C = [], p.forEach((G) => C.push({ _type: ue.tablecell, text: [], options: G.options })), u(), A += E + v, r.verbose && console.log(`| SLIDE [${a.length}]: emuSlideTabH ...... = ${(l / he).toFixed(1)} `), A = 0, (r.addHeaderToEach || r.autoPageRepeatHeader) && r._arrObjTabHeadRows && r._arrObjTabHeadRows.forEach((G) => {
        const ee = [];
        let Y = 0;
        G.forEach((ne) => {
          ee.push(ne), ne._lineHeight > Y && (Y = ne._lineHeight);
        }), g.rows.push(ee), A += Y;
      }), O = C[x]);
      const T = k._lines.shift();
      Array.isArray(O.text) && (T ? O.text = O.text.concat(T) : O.text.length === 0 && (O.text = O.text.concat({ _type: ue.tablecell, text: "" }))), x === _.length - 1 && (A += P), x = x < _.length - 1 ? x + 1 : 0, _.map((w) => w._lines.length).reduce((w, G) => w + G) === 0 && (R = !0);
    }
    C.length > 0 && g.rows.push(C), r.verbose && console.log(`- SLIDE [${a.length}]: ROW [${h}]: ...COMPLETE ...... emuTabCurrH = ${(A / he).toFixed(2)} ( emuSlideTabH = ${(l / he).toFixed(2)} )`);
  }), a.push(g), r.verbose && (console.log(`
|================================================|`), console.log(`| FINAL: tableRowSlides.length = ${a.length}`), a.forEach((p) => console.log(p)), console.log(`|================================================|

`)), a;
}
function ao(e, r, t = {}, s) {
  const n = t || {};
  n.slideMargin = n.slideMargin || n.slideMargin === 0 ? n.slideMargin : 0.5;
  let o = n.w || e.presLayout.width;
  const l = [], A = [], c = [], a = [], i = [];
  let f = [0.5, 0.5, 0.5, 0.5], y = 0;
  if (!document.getElementById(r))
    throw new Error('tableToSlides: Table ID "' + r + '" does not exist!');
  s?._margin ? (Array.isArray(s._margin) ? f = s._margin : isNaN(s._margin) || (f = [s._margin, s._margin, s._margin, s._margin]), n.slideMargin = f) : n?.slideMargin && (Array.isArray(n.slideMargin) ? f = n.slideMargin : isNaN(n.slideMargin) || (f = [n.slideMargin, n.slideMargin, n.slideMargin, n.slideMargin])), o = (n.w ? ve(n.w) : e.presLayout.width) - ve(f[1] + f[3]), n.verbose && (console.log("[[VERBOSE MODE]]"), console.log("|-- `tableToSlides` ----------------------------------------------------|"), console.log(`| tableProps.h .................................... = ${n.h}`), console.log(`| tableProps.w .................................... = ${n.w}`), console.log(`| pptx.presLayout.width ........................... = ${(e.presLayout.width / he).toFixed(1)}`), console.log(`| pptx.presLayout.height .......................... = ${(e.presLayout.height / he).toFixed(1)}`), console.log(`| emuSlideTabW .................................... = ${(o / he).toFixed(1)}`));
  let d = document.querySelectorAll(`#${r} tr:first-child th`);
  d.length === 0 && (d = document.querySelectorAll(`#${r} tr:first-child td`)), d.forEach((u) => {
    const g = u;
    if (g.getAttribute("colspan"))
      for (let p = 0; p < Number(g.getAttribute("colspan")); p++)
        i.push(Math.round(g.offsetWidth / Number(g.getAttribute("colspan"))));
    else
      i.push(g.offsetWidth);
  }), i.forEach((u) => {
    y += u;
  }), i.forEach((u, g) => {
    const p = Number((Number(o) * (u / y * 100) / 100 / he).toFixed(2));
    let h = 0;
    const _ = document.querySelector(`#${r} thead tr:first-child th:nth-child(${g + 1})`);
    _ && (h = Number(_.getAttribute("data-pptx-min-width")));
    const E = document.querySelector(`#${r} thead tr:first-child th:nth-child(${g + 1})`);
    E && (h = Number(E.getAttribute("data-pptx-width"))), a.push(h > p ? h : p);
  }), n.verbose && console.log(`| arrColW ......................................... = [${a.join(", ")}]`), ["thead", "tbody", "tfoot"].forEach((u) => {
    document.querySelectorAll(`#${r} ${u} tr`).forEach((g) => {
      const p = g, h = [];
      switch (Array.from(p.cells).forEach((_) => {
        const E = window.getComputedStyle(_).getPropertyValue("color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
        let v = window.getComputedStyle(_).getPropertyValue("background-color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
        // NOTE: (ISSUE#57): Default for unstyled tables is black bkgd, so use white instead
        (window.getComputedStyle(_).getPropertyValue("background-color") === "rgba(0, 0, 0, 0)" || window.getComputedStyle(_).getPropertyValue("transparent")) && (v = ["255", "255", "255"]);
        const C = {
          align: null,
          bold: window.getComputedStyle(_).getPropertyValue("font-weight") === "bold" || Number(window.getComputedStyle(_).getPropertyValue("font-weight")) >= 500,
          border: null,
          color: Hr(Number(E[0]), Number(E[1]), Number(E[2])),
          fill: { color: Hr(Number(v[0]), Number(v[1]), Number(v[2])) },
          fontFace: (window.getComputedStyle(_).getPropertyValue("font-family") || "").split(",")[0].replace(/"/g, "").replace("inherit", "").replace("initial", "") || null,
          fontSize: Number(window.getComputedStyle(_).getPropertyValue("font-size").replace(/[a-z]/gi, "")),
          margin: null,
          colspan: Number(_.getAttribute("colspan")) || null,
          rowspan: Number(_.getAttribute("rowspan")) || null,
          valign: null
        };
        if (["left", "center", "right", "start", "end"].includes(window.getComputedStyle(_).getPropertyValue("text-align"))) {
          const x = window.getComputedStyle(_).getPropertyValue("text-align").replace("start", "left").replace("end", "right");
          C.align = x === "center" ? "center" : x === "left" ? "left" : x === "right" ? "right" : null;
        }
        if (["top", "middle", "bottom"].includes(window.getComputedStyle(_).getPropertyValue("vertical-align"))) {
          const x = window.getComputedStyle(_).getPropertyValue("vertical-align");
          C.valign = x === "top" ? "top" : x === "middle" ? "middle" : x === "bottom" ? "bottom" : null;
        }
        window.getComputedStyle(_).getPropertyValue("padding-left") && (C.margin = [0, 0, 0, 0], ["padding-top", "padding-right", "padding-bottom", "padding-left"].forEach((P, R) => {
          C.margin[R] = Math.round(Number(window.getComputedStyle(_).getPropertyValue(P).replace(/\D/gi, "")));
        })), (window.getComputedStyle(_).getPropertyValue("border-top-width") || window.getComputedStyle(_).getPropertyValue("border-right-width") || window.getComputedStyle(_).getPropertyValue("border-bottom-width") || window.getComputedStyle(_).getPropertyValue("border-left-width")) && (C.border = [null, null, null, null], ["top", "right", "bottom", "left"].forEach((P, R) => {
          const k = Math.round(Number(window.getComputedStyle(_).getPropertyValue("border-" + P + "-width").replace("px", "")));
          let O = [];
          O = window.getComputedStyle(_).getPropertyValue("border-" + P + "-color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
          const T = Hr(Number(O[0]), Number(O[1]), Number(O[2]));
          C.border[R] = { pt: k, color: T };
        })), h.push({
          _type: ue.tablecell,
          text: _.innerText,
          // `innerText` returns <br> as "\n", so linebreak etc. work later!
          options: C
        });
      }), u) {
        case "thead":
          l.push(h);
          break;
        case "tbody":
          A.push(h);
          break;
        case "tfoot":
          c.push(h);
          break;
        default:
          console.log(`table parsing: unexpected table part: ${u}`);
          break;
      }
    });
  }), n._arrObjTabHeadRows = l || null, n.colW = a, yi([...l, ...A, ...c], n, e.presLayout, s).forEach((u, g) => {
    const p = e.addSlide({ masterName: n.masterSlideName || null });
    g === 0 && (n.y = n.y || f[0]), g > 0 && (n.y = n.autoPageSlideStartY || n.newSlideStartY || f[0]), n.verbose && console.log(`| opts.autoPageSlideStartY: ${n.autoPageSlideStartY} / arrInchMargins[0]: ${f[0]} => opts.y = ${n.y}`), p.addTable(u.rows, { x: n.x || f[3], y: n.y, w: Number(o) / he, colW: a, autoPage: !1 }), n.addImage && (n.addImage.options = n.addImage.options || {}, !n.addImage.image || !n.addImage.image.path && !n.addImage.image.data ? console.warn("Warning: tableToSlides.addImage requires either `path` or `data`") : p.addImage({
      path: n.addImage.image.path,
      data: n.addImage.image.data,
      x: n.addImage.options.x,
      y: n.addImage.options.y,
      w: n.addImage.options.w,
      h: n.addImage.options.h
    })), n.addShape && p.addShape(n.addShape.shapeName, n.addShape.options || {}), n.addTable && p.addTable(n.addTable.rows, n.addTable.options || {}), n.addText && p.addText(n.addText.text, n.addText.options || {});
  });
}
let no = 0;
function io(e, r) {
  e.bkgd && (r.bkgd = e.bkgd), e.objects && Array.isArray(e.objects) && e.objects.length > 0 && e.objects.forEach((t, s) => {
    const n = Object.keys(t)[0], o = r;
    Ze[n] && n === "chart" ? vi(o, t[n].type, t[n].data, t[n].opts) : Ze[n] && n === "image" ? bi(o, t[n]) : Ze[n] && n === "line" ? ba(o, et.LINE, t[n]) : Ze[n] && n === "rect" ? ba(o, et.RECTANGLE, t[n]) : Ze[n] && n === "text" ? Br(o, [{ text: t[n].text }], t[n].options, !1) : Ze[n] && n === "placeholder" && (t[n].options.placeholder = t[n].options.name, delete t[n].options.name, t[n].options._placeholderType = t[n].options.type, delete t[n].options.type, t[n].options._placeholderIdx = 100 + s, Br(o, [{ text: t[n].text }], t[n].options, !0));
  }), e.slideNumber && typeof e.slideNumber == "object" && (r._slideNumberProps = e.slideNumber);
}
function vi(e, r, t, s) {
  var n;
  function o(f) {
    !f || f.style === "none" || (f.size !== void 0 && (isNaN(Number(f.size)) || f.size <= 0) && (console.warn("Warning: chart.gridLine.size must be greater than 0."), delete f.size), f.style && !["solid", "dash", "dot"].includes(f.style) && (console.warn("Warning: chart.gridLine.style options: `solid`, `dash`, `dot`."), delete f.style), f.cap && !["flat", "square", "round"].includes(f.cap) && (console.warn("Warning: chart.gridLine.cap options: `flat`, `square`, `round`."), delete f.cap));
  }
  const l = ++no, A = {
    _type: null,
    text: null,
    options: null,
    chartRid: null
  };
  let c = null, a = [];
  Array.isArray(r) ? (r.forEach((f) => {
    a = a.concat(f.data);
  }), c = t || s) : (a = t, c = s), a.forEach((f, y) => {
    f._dataIndex = y, f.labels !== void 0 && !Array.isArray(f.labels[0]) && (f.labels = [f.labels]);
  });
  const i = c && typeof c == "object" ? c : {};
  if (i._type = r, i.x = typeof i.x < "u" && i.x != null && !isNaN(Number(i.x)) ? i.x : 1, i.y = typeof i.y < "u" && i.y != null && !isNaN(Number(i.y)) ? i.y : 1, i.w = i.w || "50%", i.h = i.h || "50%", i.objectName = i.objectName ? fe(i.objectName) : `Chart ${e._slideObjects.filter((f) => f._type === ue.chart).length}`, ["bar", "col"].includes(i.barDir || "") || (i.barDir = "col"), i._type === re.AREA && (["stacked", "standard", "percentStacked"].includes(i.barGrouping || "") || (i.barGrouping = "standard")), i._type === re.BAR && (["clustered", "stacked", "percentStacked"].includes(i.barGrouping || "") || (i.barGrouping = "clustered")), i._type === re.BAR3D && (["clustered", "stacked", "standard", "percentStacked"].includes(i.barGrouping || "") || (i.barGrouping = "standard")), !((n = i.barGrouping) === null || n === void 0) && n.includes("tacked") && (i.barGapWidthPct || (i.barGapWidthPct = 50)), i.dataLabelPosition && ((i._type === re.AREA || i._type === re.BAR3D || i._type === re.DOUGHNUT || i._type === re.RADAR) && delete i.dataLabelPosition, i._type === re.PIE && (["bestFit", "ctr", "inEnd", "outEnd"].includes(i.dataLabelPosition) || delete i.dataLabelPosition), (i._type === re.BUBBLE || i._type === re.BUBBLE3D || i._type === re.LINE || i._type === re.SCATTER) && (["b", "ctr", "l", "r", "t"].includes(i.dataLabelPosition) || delete i.dataLabelPosition), i._type === re.BAR && (["stacked", "percentStacked"].includes(i.barGrouping || "") || ["ctr", "inBase", "inEnd"].includes(i.dataLabelPosition) || delete i.dataLabelPosition, ["clustered"].includes(i.barGrouping || "") || ["ctr", "inBase", "inEnd", "outEnd"].includes(i.dataLabelPosition) || delete i.dataLabelPosition)), i.dataLabelBkgrdColors = i.dataLabelBkgrdColors || !i.dataLabelBkgrdColors ? i.dataLabelBkgrdColors : !1, ["b", "l", "r", "t", "tr"].includes(i.legendPos || "") || (i.legendPos = "r"), ["cone", "coneToMax", "box", "cylinder", "pyramid", "pyramidToMax"].includes(i.bar3DShape || "") || (i.bar3DShape = "box"), ["circle", "dash", "diamond", "dot", "none", "square", "triangle"].includes(i.lineDataSymbol || "") || (i.lineDataSymbol = "circle"), ["gap", "span"].includes(i.displayBlanksAs || "") || (i.displayBlanksAs = "span"), ["standard", "marker", "filled"].includes(i.radarStyle || "") || (i.radarStyle = "standard"), i.lineDataSymbolSize = i.lineDataSymbolSize && !isNaN(i.lineDataSymbolSize) ? i.lineDataSymbolSize : 6, i.lineDataSymbolLineSize = i.lineDataSymbolLineSize && !isNaN(i.lineDataSymbolLineSize) ? de(i.lineDataSymbolLineSize) : de(0.75), i.layout && ["x", "y", "w", "h"].forEach((f) => {
    const y = i.layout[f];
    (isNaN(Number(y)) || y < 0 || y > 1) && (console.warn("Warning: chart.layout." + f + " can only be 0-1"), delete i.layout[f]);
  }), i.catGridLine = i.catGridLine || (i._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : { style: "none" }), i.valGridLine = i.valGridLine || (i._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : {}), i.serGridLine = i.serGridLine || (i._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : { style: "none" }), o(i.catGridLine), o(i.valGridLine), o(i.serGridLine), xa(i.shadow), i.showDataTable = i.showDataTable || !i.showDataTable ? i.showDataTable : !1, i.showDataTableHorzBorder = i.showDataTableHorzBorder || !i.showDataTableHorzBorder ? i.showDataTableHorzBorder : !0, i.showDataTableVertBorder = i.showDataTableVertBorder || !i.showDataTableVertBorder ? i.showDataTableVertBorder : !0, i.showDataTableOutline = i.showDataTableOutline || !i.showDataTableOutline ? i.showDataTableOutline : !0, i.showDataTableKeys = i.showDataTableKeys || !i.showDataTableKeys ? i.showDataTableKeys : !0, i.showLabel = i.showLabel || !i.showLabel ? i.showLabel : !1, i.showLegend = i.showLegend || !i.showLegend ? i.showLegend : !1, i.showPercent = i.showPercent || !i.showPercent ? i.showPercent : !0, i.showTitle = i.showTitle || !i.showTitle ? i.showTitle : !1, i.showValue = i.showValue || !i.showValue ? i.showValue : !1, i.showLeaderLines = i.showLeaderLines || !i.showLeaderLines ? i.showLeaderLines : !1, i.catAxisLineShow = typeof i.catAxisLineShow < "u" ? i.catAxisLineShow : !0, i.valAxisLineShow = typeof i.valAxisLineShow < "u" ? i.valAxisLineShow : !0, i.serAxisLineShow = typeof i.serAxisLineShow < "u" ? i.serAxisLineShow : !0, i.v3DRotX = !isNaN(i.v3DRotX) && i.v3DRotX >= -90 && i.v3DRotX <= 90 ? i.v3DRotX : 30, i.v3DRotY = !isNaN(i.v3DRotY) && i.v3DRotY >= 0 && i.v3DRotY <= 360 ? i.v3DRotY : 30, i.v3DRAngAx = i.v3DRAngAx || !i.v3DRAngAx ? i.v3DRAngAx : !0, i.v3DPerspective = !isNaN(i.v3DPerspective) && i.v3DPerspective >= 0 && i.v3DPerspective <= 240 ? i.v3DPerspective : 30, i.barGapWidthPct = !isNaN(i.barGapWidthPct) && i.barGapWidthPct >= 0 && i.barGapWidthPct <= 1e3 ? i.barGapWidthPct : 150, i.barGapDepthPct = !isNaN(i.barGapDepthPct) && i.barGapDepthPct >= 0 && i.barGapDepthPct <= 1e3 ? i.barGapDepthPct : 150, i.chartColors = Array.isArray(i.chartColors) ? i.chartColors : i._type === re.PIE || i._type === re.DOUGHNUT ? Zi : Bt, i.chartColorsOpacity = i.chartColorsOpacity && !isNaN(i.chartColorsOpacity) ? i.chartColorsOpacity : null, i.border = i.border && typeof i.border == "object" ? i.border : null, i.border && (!i.border.pt || isNaN(i.border.pt)) && (i.border.pt = ut.pt), i.border && (!i.border.color || typeof i.border.color != "string") && (i.border.color = ut.color), i.plotArea = i.plotArea || {}, i.plotArea.border = i.plotArea.border && typeof i.plotArea.border == "object" ? i.plotArea.border : null, i.plotArea.border && (!i.plotArea.border.pt || isNaN(i.plotArea.border.pt)) && (i.plotArea.border.pt = ut.pt), i.plotArea.border && (!i.plotArea.border.color || typeof i.plotArea.border.color != "string") && (i.plotArea.border.color = ut.color), i.border && (i.plotArea.border = i.border), i.plotArea.fill = i.plotArea.fill || { color: null, transparency: null }, i.fill && (i.plotArea.fill.color = i.fill), i.chartArea = i.chartArea || {}, i.chartArea.border = i.chartArea.border && typeof i.chartArea.border == "object" ? i.chartArea.border : null, i.chartArea.border && (i.chartArea.border = {
    color: i.chartArea.border.color || ut.color,
    pt: i.chartArea.border.pt || ut.pt
  }), i.chartArea.roundedCorners = typeof i.chartArea.roundedCorners == "boolean" ? i.chartArea.roundedCorners : !0, i.dataBorder = i.dataBorder && typeof i.dataBorder == "object" ? i.dataBorder : null, i.dataBorder && (!i.dataBorder.pt || isNaN(i.dataBorder.pt)) && (i.dataBorder.pt = 0.75), i.dataBorder && i.dataBorder.color) {
    const f = typeof i.dataBorder.color == "string" && i.dataBorder.color.length === 6 && /^[0-9A-Fa-f]{6}$/.test(i.dataBorder.color), y = Object.values(Nr).includes(i.dataBorder.color);
    !f && !y && (i.dataBorder.color = "F9F9F9");
  }
  return !i.dataLabelFormatCode && i._type === re.SCATTER && (i.dataLabelFormatCode = "General"), !i.dataLabelFormatCode && (i._type === re.PIE || i._type === re.DOUGHNUT) && (i.dataLabelFormatCode = i.showPercent ? "0%" : "General"), i.dataLabelFormatCode = i.dataLabelFormatCode && typeof i.dataLabelFormatCode == "string" ? i.dataLabelFormatCode : "#,##0", !i.dataLabelFormatScatter && i._type === re.SCATTER && (i.dataLabelFormatScatter = "custom"), i.lineSize = typeof i.lineSize == "number" ? i.lineSize : 2, i.valAxisMajorUnit = typeof i.valAxisMajorUnit == "number" ? i.valAxisMajorUnit : null, i._type === re.AREA || i._type === re.BAR || i._type === re.BAR3D || i._type === re.LINE ? i.catAxisMultiLevelLabels = !!i.catAxisMultiLevelLabels : delete i.catAxisMultiLevelLabels, A._type = "chart", A.options = i, A.chartRid = Ke(e), e._relsChart.push({
    rId: Ke(e),
    data: a,
    opts: i,
    type: i._type,
    globalId: l,
    fileName: `chart${l}.xml`,
    Target: `/ppt/charts/chart${l}.xml`
  }), e._slideObjects.push(A), A;
}
function bi(e, r) {
  const t = {
    _type: null,
    text: null,
    options: null,
    image: null,
    imageRid: null,
    hyperlink: null
  }, s = r.x || 0, n = r.y || 0, o = r.w || 0, l = r.h || 0, A = r.sizing || null, c = r.hyperlink || "", a = r.data || "", i = r.path || "";
  let f = Ke(e);
  const y = r.objectName ? fe(r.objectName) : `Image ${e._slideObjects.filter((m) => m._type === ue.image).length}`;
  if (!i && !a)
    return console.error("ERROR: addImage() requires either 'data' or 'path' parameter!"), null;
  if (i && typeof i != "string")
    return console.error(`ERROR: addImage() 'path' should be a string, ex: {path:'/img/sample.png'} - you sent ${String(i)}`), null;
  if (a && typeof a != "string")
    return console.error(`ERROR: addImage() 'data' should be a string, ex: {data:'image/png;base64,NMP[...]'} - you sent ${String(a)}`), null;
  if (a && typeof a == "string" && !a.toLowerCase().includes("base64,"))
    return console.error("ERROR: Image `data` value lacks a base64 header! Ex: 'image/png;base64,NMP[...]')"), null;
  let d = (i.substring(i.lastIndexOf("/") + 1).split("?")[0].split(".").pop().split("#")[0] || "png").toLowerCase();
  if (a && /image\/(\w+);/.exec(a) && /image\/(\w+);/.exec(a).length > 0 ? d = /image\/(\w+);/.exec(a)[1] : a?.toLowerCase().includes("image/svg+xml") && (d = "svg"), t._type = ue.image, t.image = i || "preencoded.png", t.options = {
    x: s || 0,
    y: n || 0,
    w: o || 1,
    h: l || 1,
    altText: r.altText || "",
    rounding: typeof r.rounding == "boolean" ? r.rounding : !1,
    sizing: A,
    placeholder: r.placeholder,
    rotate: r.rotate || 0,
    flipV: r.flipV || !1,
    flipH: r.flipH || !1,
    transparency: r.transparency || 0,
    objectName: y,
    shadow: xa(r.shadow)
  }, d === "svg")
    e._relsMedia.push({
      path: i || a + "png",
      type: "image/png",
      extn: "png",
      data: a || "",
      rId: f,
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`,
      isSvgPng: !0,
      svgSize: { w: pe(t.options.w, "X", e._presLayout), h: pe(t.options.h, "Y", e._presLayout) }
    }), t.imageRid = f, e._relsMedia.push({
      path: i || a,
      type: "image/svg+xml",
      extn: d,
      data: a || "",
      rId: f + 1,
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.${d}`
    }), t.imageRid = f + 1;
  else {
    const m = e._relsMedia.filter((u) => u.path && u.path === i && u.type === "image/" + d && !u.isDuplicate)[0];
    e._relsMedia.push({
      path: i || "preencoded." + d,
      type: "image/" + d,
      extn: d,
      data: a || "",
      rId: f,
      isDuplicate: !!m?.Target,
      Target: m?.Target ? m.Target : `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.${d}`
    }), t.imageRid = f;
  }
  if (typeof c == "object") {
    if (!c.url && !c.slide)
      throw new Error("ERROR: `hyperlink` option requires either: `url` or `slide`");
    f++, e._rels.push({
      type: ue.hyperlink,
      data: c.slide ? "slide" : "dummy",
      rId: f,
      Target: c.url || c.slide.toString()
    }), c._rId = f, t.hyperlink = c;
  }
  e._slideObjects.push(t);
}
function oo(e, r) {
  const t = r.x || 0, s = r.y || 0, n = r.w || 2, o = r.h || 2, l = r.data || "", A = r.link || "", c = r.path || "", a = r.type || "audio";
  let i = "";
  const f = r.cover || eo, y = r.objectName ? fe(r.objectName) : `Media ${e._slideObjects.filter((m) => m._type === ue.media).length}`, d = { _type: ue.media };
  if (!c && !l && a !== "online")
    throw new Error("addMedia() error: either `data` or `path` are required!");
  if (l && !l.toLowerCase().includes("base64,"))
    throw new Error("addMedia() error: `data` value lacks a base64 header! Ex: 'video/mpeg;base64,NMP[...]')");
  if (!f.toLowerCase().includes("base64,"))
    throw new Error("addMedia() error: `cover` value lacks a base64 header! Ex: 'data:image/png;base64,iV[...]')");
  if (a === "online" && !A)
    throw new Error("addMedia() error: online videos require `link` value");
  if (i = r.extn || (l ? l.split(";")[0].split("/")[1] : c.split(".").pop()) || "mp3", d.mtype = a, d.media = c || "preencoded.mov", d.options = {}, d.options.x = t, d.options.y = s, d.options.w = n, d.options.h = o, d.options.objectName = y, a === "online") {
    const m = Ke(e);
    e._relsMedia.push({
      path: c || "preencoded" + i,
      data: "dummy",
      type: "online",
      extn: i,
      rId: m,
      Target: A
    }), d.mediaRid = m, e._relsMedia.push({
      path: "preencoded.png",
      data: f,
      type: "image/png",
      extn: "png",
      rId: Ke(e),
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`
    });
  } else {
    const m = e._relsMedia.filter((g) => g.path && g.path === c && g.type === a + "/" + i && !g.isDuplicate)[0], u = Ke(e);
    e._relsMedia.push({
      path: c || "preencoded" + i,
      type: a + "/" + i,
      extn: i,
      data: l || "",
      rId: u,
      isDuplicate: !!m?.Target,
      Target: m?.Target ? m.Target : `../media/media-${e._slideNum}-${e._relsMedia.length + 1}.${i}`
    }), d.mediaRid = u, e._relsMedia.push({
      path: c || "preencoded" + i,
      type: a + "/" + i,
      extn: i,
      data: l || "",
      rId: Ke(e),
      isDuplicate: !!m?.Target,
      Target: m?.Target ? m.Target : `../media/media-${e._slideNum}-${e._relsMedia.length + 0}.${i}`
    }), e._relsMedia.push({
      path: "preencoded.png",
      type: "image/png",
      extn: "png",
      data: f,
      rId: Ke(e),
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`
    });
  }
  e._slideObjects.push(d);
}
function so(e, r) {
  e._slideObjects.push({
    _type: ue.notes,
    text: [{ text: r }]
  });
}
function ba(e, r, t) {
  const s = typeof t == "object" ? t : {};
  s.line = s.line || { type: "none" };
  const n = {
    _type: ue.text,
    shape: r || et.RECTANGLE,
    options: s,
    text: null
  };
  if (!r)
    throw new Error("Missing/Invalid shape parameter! Example: `addShape(pptxgen.shapes.LINE, {x:1, y:1, w:1, h:1});`");
  const o = {
    type: s.line.type || "solid",
    color: s.line.color || pi,
    transparency: s.line.transparency || 0,
    width: s.line.width || 1,
    dashType: s.line.dashType || "solid",
    beginArrowType: s.line.beginArrowType || null,
    endArrowType: s.line.endArrowType || null
  };
  if (typeof s.line == "object" && s.line.type !== "none" && (s.line = o), s.x = s.x || (s.x === 0 ? 0 : 1), s.y = s.y || (s.y === 0 ? 0 : 1), s.w = s.w || (s.w === 0 ? 0 : 1), s.h = s.h || (s.h === 0 ? 0 : 1), s.objectName = s.objectName ? fe(s.objectName) : `Shape ${e._slideObjects.filter((l) => l._type === ue.text).length}`, typeof s.line == "string") {
    const l = o;
    l.color = String(s.line), s.line = l;
  }
  typeof s.lineSize == "number" && (s.line.width = s.lineSize), typeof s.lineDash == "string" && (s.line.dashType = s.lineDash), typeof s.lineHead == "string" && (s.line.beginArrowType = s.lineHead), typeof s.lineTail == "string" && (s.line.endArrowType = s.lineTail), Ct(e, n), e._slideObjects.push(n);
}
function lo(e, r, t, s, n, o, l) {
  const A = [e], c = t && typeof t == "object" ? t : {};
  c.objectName = c.objectName ? fe(c.objectName) : `Table ${e._slideObjects.filter((y) => y._type === ue.table).length}`;
  {
    if (r === null || r.length === 0 || !Array.isArray(r))
      throw new Error("addTable: Array expected! EX: 'slide.addTable( [rows], {options} );' (https://gitbrent.github.io/PptxGenJS/docs/api-tables.html)");
    if (!r[0] || !Array.isArray(r[0]))
      throw new Error("addTable: 'rows' should be an array of cells! EX: 'slide.addTable( [ ['A'], ['B'], {text:'C',options:{align:'center'}} ] );' (https://gitbrent.github.io/PptxGenJS/docs/api-tables.html)");
  }
  const a = [];
  r.forEach((y) => {
    const d = [];
    Array.isArray(y) ? y.forEach((m) => {
      const u = {
        _type: ue.tablecell,
        text: "",
        options: typeof m == "object" && m.options ? m.options : {}
      };
      typeof m == "string" || typeof m == "number" ? u.text = m.toString() : m.text && (typeof m.text == "string" || typeof m.text == "number" ? u.text = m.text.toString() : m.text && (u.text = m.text), m.options && typeof m.options == "object" && (u.options = m.options)), u.options.border = u.options.border || c.border || [{ type: "none" }, { type: "none" }, { type: "none" }, { type: "none" }];
      const g = u.options.border;
      !Array.isArray(g) && typeof g == "object" && (u.options.border = [g, g, g, g]), u.options.border[0] || (u.options.border[0] = { type: "none" }), u.options.border[1] || (u.options.border[1] = { type: "none" }), u.options.border[2] || (u.options.border[2] = { type: "none" }), u.options.border[3] || (u.options.border[3] = { type: "none" }), [0, 1, 2, 3].forEach((h) => {
        u.options.border[h] = {
          type: u.options.border[h].type || ft.type,
          color: u.options.border[h].color || ft.color,
          pt: typeof u.options.border[h].pt == "number" ? u.options.border[h].pt : ft.pt
        };
      }), d.push(u);
    }) : (console.log("addTable: tableRows has a bad row. A row should be an array of cells. You provided:"), console.log(y)), a.push(d);
  }), c.x = pe(c.x || (c.x === 0 ? 0 : he / 2), "X", n), c.y = pe(c.y || (c.y === 0 ? 0 : he / 2), "Y", n), c.h && (c.h = pe(c.h, "Y", n)), c.fontSize = c.fontSize || Ue, c.margin = c.margin === 0 || c.margin ? c.margin : hi, typeof c.margin == "number" && (c.margin = [Number(c.margin), Number(c.margin), Number(c.margin), Number(c.margin)]), JSON.stringify({ arrRows: a }).indexOf("hyperlink") === -1 && (c.color || (c.color = c.color || Ie)), typeof c.border == "string" ? (console.warn("addTable `border` option must be an object. Ex: `{border: {type:'none'}}`"), c.border = null) : Array.isArray(c.border) && [0, 1, 2, 3].forEach((y) => {
    c.border[y] = c.border[y] ? { type: c.border[y].type || ft.type, color: c.border[y].color || ft.color, pt: c.border[y].pt || ft.pt } : { type: "none" };
  }), c.autoPage = typeof c.autoPage == "boolean" ? c.autoPage : !1, c.autoPageRepeatHeader = typeof c.autoPageRepeatHeader == "boolean" ? c.autoPageRepeatHeader : !1, c.autoPageHeaderRows = typeof c.autoPageHeaderRows < "u" && !isNaN(Number(c.autoPageHeaderRows)) ? Number(c.autoPageHeaderRows) : 1, c.autoPageLineWeight = typeof c.autoPageLineWeight < "u" && !isNaN(Number(c.autoPageLineWeight)) ? Number(c.autoPageLineWeight) : 0, c.autoPageLineWeight && (c.autoPageLineWeight > 1 ? c.autoPageLineWeight = 1 : c.autoPageLineWeight < -1 && (c.autoPageLineWeight = -1));
  let i = kt;
  if (s && typeof s._margin < "u" && (Array.isArray(s._margin) ? i = s._margin : isNaN(Number(s._margin)) || (i = [Number(s._margin), Number(s._margin), Number(s._margin), Number(s._margin)])), c.colW) {
    const y = a[0].reduce((d, m) => {
      var u;
      return !((u = m?.options) === null || u === void 0) && u.colspan && typeof m.options.colspan == "number" ? d += m.options.colspan : d += 1, d;
    }, 0);
    typeof c.colW == "string" || typeof c.colW == "number" || c.colW && Array.isArray(c.colW) && c.colW.length === 1 && y > 1 ? (c.w = Math.floor(Number(c.colW) * y), c.colW = null) : c.colW && Array.isArray(c.colW) && c.colW.length !== y && (console.warn("addTable: mismatch: (colW.length != data.length) Therefore, defaulting to evenly distributed col widths."), c.colW = null);
  } else c.w ? c.w = pe(c.w, "X", n) : c.w = Math.floor(n._sizeW / he - i[1] - i[3]);
  c.x && c.x < 20 && (c.x = ve(c.x)), c.y && c.y < 20 && (c.y = ve(c.y)), c.w && typeof c.w == "number" && c.w < 20 && (c.w = ve(c.w)), c.h && typeof c.h == "number" && c.h < 20 && (c.h = ve(c.h)), a.forEach((y) => {
    y.forEach((d, m) => {
      typeof d == "number" || typeof d == "string" ? y[m] = { _type: ue.tablecell, text: String(y[m]), options: c } : typeof d == "object" && (typeof d.text == "number" ? y[m].text = y[m].text.toString() : (typeof d.text > "u" || d.text === null) && (y[m].text = ""), y[m].options = d.options || {}, y[m]._type = ue.tablecell);
    });
  });
  const f = [];
  return c && !c.autoPage ? (Ct(e, a), e._slideObjects.push({
    _type: ue.table,
    arrTabRows: a,
    options: Object.assign({}, c)
  })) : (c.autoPageRepeatHeader && (c._arrObjTabHeadRows = a.filter((y, d) => d < c.autoPageHeaderRows)), yi(a, c, n, s).forEach((y, d) => {
    l(e._slideNum + d) || A.push(o({ masterName: s?._name || null })), d > 0 && (c.y = ve(c.autoPageSlideStartY || c.newSlideStartY || i[0]));
    {
      const m = l(e._slideNum + d);
      c.autoPage = !1, Ct(m, y.rows), m.addTable(y.rows, Object.assign({}, c)), d > 0 && f.push(m);
    }
  })), f;
}
function Br(e, r, t, s) {
  const n = {
    _type: s ? ue.placeholder : ue.text,
    shape: t?.shape || et.RECTANGLE,
    text: !r || r.length === 0 ? [{ text: "", options: null }] : r,
    options: t || {}
  };
  function o(l) {
    {
      if (l.placeholder || (l.color = l.color || n.options.color || e.color || Ie), (l.placeholder || s) && (l.bullet = l.bullet || !1), l.placeholder && e._slideLayout && e._slideLayout._slideObjects) {
        const A = e._slideLayout._slideObjects.filter((c) => c._type === "placeholder" && c.options && c.options.placeholder && c.options.placeholder === l.placeholder)[0];
        A?.options && (l = Object.assign(Object.assign({}, l), A.options));
      }
      if (l.objectName = l.objectName ? fe(l.objectName) : `Text ${e._slideObjects.filter((A) => A._type === ue.text).length}`, l.shape === et.LINE) {
        const A = {
          type: l.line.type || "solid",
          color: l.line.color || pi,
          transparency: l.line.transparency || 0,
          width: l.line.width || 1,
          dashType: l.line.dashType || "solid",
          beginArrowType: l.line.beginArrowType || null,
          endArrowType: l.line.endArrowType || null
        };
        if (typeof l.line == "object" && (l.line = A), typeof l.line == "string") {
          const c = A;
          typeof l.line == "string" && (c.color = l.line), l.line = c;
        }
        typeof l.lineSize == "number" && (l.line.width = l.lineSize), typeof l.lineDash == "string" && (l.line.dashType = l.lineDash), typeof l.lineHead == "string" && (l.line.beginArrowType = l.lineHead), typeof l.lineTail == "string" && (l.line.endArrowType = l.lineTail);
      }
      l.line = l.line || {}, l.lineSpacing = l.lineSpacing && !isNaN(l.lineSpacing) ? l.lineSpacing : null, l.lineSpacingMultiple = l.lineSpacingMultiple && !isNaN(l.lineSpacingMultiple) ? l.lineSpacingMultiple : null, l._bodyProp = l._bodyProp || {}, l._bodyProp.autoFit = l.autoFit || !1, l._bodyProp.anchor = l.placeholder ? null : yt.ctr, l._bodyProp.vert = l.vert || null, l._bodyProp.wrap = typeof l.wrap == "boolean" ? l.wrap : !0, (l.inset && !isNaN(Number(l.inset)) || l.inset === 0) && (l._bodyProp.lIns = ve(l.inset), l._bodyProp.rIns = ve(l.inset), l._bodyProp.tIns = ve(l.inset), l._bodyProp.bIns = ve(l.inset)), typeof l.underline == "boolean" && l.underline === !0 && (l.underline = { style: "sng" });
    }
    return (l.align || "").toLowerCase().indexOf("c") === 0 ? l._bodyProp.align = gt.center : (l.align || "").toLowerCase().indexOf("l") === 0 ? l._bodyProp.align = gt.left : (l.align || "").toLowerCase().indexOf("r") === 0 ? l._bodyProp.align = gt.right : (l.align || "").toLowerCase().indexOf("j") === 0 && (l._bodyProp.align = gt.justify), (l.valign || "").toLowerCase().indexOf("b") === 0 ? l._bodyProp.anchor = yt.b : (l.valign || "").toLowerCase().indexOf("m") === 0 ? l._bodyProp.anchor = yt.ctr : (l.valign || "").toLowerCase().indexOf("t") === 0 && (l._bodyProp.anchor = yt.t), xa(l.shadow), l;
  }
  n.options = o(n.options), n.text.forEach((l) => l.options = o(l.options || {})), Ct(e, n.text || ""), e._slideObjects.push(n);
}
function co(e) {
  (e._slideLayout._slideObjects || []).forEach((r) => {
    r._type === ue.placeholder && e._slideObjects.filter((t) => t.options && t.options.placeholder === r.options.placeholder).length === 0 && Br(e, [{ text: "" }], r.options, !1);
  });
}
function wi(e, r) {
  var t;
  if (r.bkgd && (r.background || (r.background = {}), typeof r.bkgd == "string" ? r.background.color = r.bkgd : (r.bkgd.data && (r.background.data = r.bkgd.data), r.bkgd.path && (r.background.path = r.bkgd.path), r.bkgd.src && (r.background.path = r.bkgd.src))), !((t = r.background) === null || t === void 0) && t.fill && (r.background.color = r.background.fill), e && (e.path || e.data)) {
    e.path = e.path || "preencoded.png";
    let s = (e.path.split(".").pop() || "png").split("?")[0];
    s === "jpg" && (s = "jpeg"), r._relsMedia = r._relsMedia || [];
    const n = r._relsMedia.length + 1;
    r._relsMedia.push({
      path: e.path,
      type: ue.image,
      extn: s,
      data: e.data || null,
      rId: n,
      Target: `../media/${(r._name || "").replace(/\s+/gi, "-")}-image-${r._relsMedia.length + 1}.${s}`
    }), r._bkgdImgRid = n;
  }
}
function Ct(e, r, t) {
  let s = [];
  typeof r == "string" || typeof r == "number" || (Array.isArray(r) ? s = r : typeof r == "object" && (s = [r]), s.forEach((n, o) => {
    if (t && t[o] && t[o].hyperlink && (n.options = Object.assign(Object.assign({}, n.options), t[o])), Array.isArray(n)) {
      const l = [];
      n.forEach((A) => {
        A.options && !A.text.options && l.push(A.options);
      }), Ct(e, n, l);
    } else if (Array.isArray(n.text))
      Ct(e, n.text, t && t[o] ? [t[o]] : void 0);
    else if (n && typeof n == "object" && n.options && n.options.hyperlink && !n.options.hyperlink._rId)
      if (typeof n.options.hyperlink != "object")
        console.log("ERROR: text `hyperlink` option should be an object. Ex: `hyperlink: {url:'https://github.com'}` ");
      else if (!n.options.hyperlink.url && !n.options.hyperlink.slide)
        console.log("ERROR: 'hyperlink requires either: `url` or `slide`'");
      else {
        const l = Ke(e);
        e._rels.push({
          type: ue.hyperlink,
          data: n.options.hyperlink.slide ? "slide" : "dummy",
          rId: l,
          Target: fe(n.options.hyperlink.url) || n.options.hyperlink.slide.toString()
        }), n.options.hyperlink._rId = l;
      }
    else n && typeof n == "object" && n.options && n.options.hyperlink && n.options.hyperlink._rId && e._rels.filter((l) => l.rId === n.options.hyperlink._rId).length === 0 && e._rels.push({
      type: ue.hyperlink,
      data: n.options.hyperlink.slide ? "slide" : "dummy",
      rId: n.options.hyperlink._rId,
      Target: fe(n.options.hyperlink.url) || n.options.hyperlink.slide.toString()
    });
  }));
}
class Ao {
  constructor(r) {
    var t;
    this.addSlide = r.addSlide, this.getSlide = r.getSlide, this._name = `Slide ${r.slideNumber}`, this._presLayout = r.presLayout, this._rId = r.slideRId, this._rels = [], this._relsChart = [], this._relsMedia = [], this._setSlideNum = r.setSlideNum, this._slideId = r.slideId, this._slideLayout = r.slideLayout || null, this._slideNum = r.slideNumber, this._slideObjects = [], this._slideNumberProps = !((t = this._slideLayout) === null || t === void 0) && t._slideNumberProps ? this._slideLayout._slideNumberProps : null;
  }
  set bkgd(r) {
    this._bkgd = r, (!this._background || !this._background.color) && (this._background || (this._background = {}), typeof r == "string" && (this._background.color = r));
  }
  get bkgd() {
    return this._bkgd;
  }
  set background(r) {
    this._background = r, r && wi(r, this);
  }
  get background() {
    return this._background;
  }
  set color(r) {
    this._color = r;
  }
  get color() {
    return this._color;
  }
  set hidden(r) {
    this._hidden = r;
  }
  get hidden() {
    return this._hidden;
  }
  /**
   * @type {SlideNumberProps}
   */
  set slideNumber(r) {
    this._slideNumberProps = r, this._setSlideNum(r);
  }
  get slideNumber() {
    return this._slideNumberProps;
  }
  get newAutoPagedSlides() {
    return this._newAutoPagedSlides;
  }
  /**
   * Add chart to Slide
   * @param {CHART_NAME|IChartMulti[]} type - chart type
   * @param {object[]} data - data object
   * @param {IChartOpts} options - chart options
   * @return {Slide} this Slide
   */
  addChart(r, t, s) {
    const n = s || {};
    return n._type = r, vi(this, r, t, s), this;
  }
  /**
   * Add image to Slide
   * @param {ImageProps} options - image options
   * @return {Slide} this Slide
   */
  addImage(r) {
    return bi(this, r), this;
  }
  /**
   * Add media (audio/video) to Slide
   * @param {MediaProps} options - media options
   * @return {Slide} this Slide
   */
  addMedia(r) {
    return oo(this, r), this;
  }
  /**
   * Add speaker notes to Slide
   * @docs https://gitbrent.github.io/PptxGenJS/docs/speaker-notes.html
   * @param {string} notes - notes to add to slide
   * @return {Slide} this Slide
   */
  addNotes(r) {
    return so(this, r), this;
  }
  /**
   * Add shape to Slide
   * @param {SHAPE_NAME} shapeName - shape name
   * @param {ShapeProps} options - shape options
   * @return {Slide} this Slide
   */
  addShape(r, t) {
    return ba(this, r, t), this;
  }
  /**
   * Add table to Slide
   * @param {TableRow[]} tableRows - table rows
   * @param {TableProps} options - table options
   * @return {Slide} this Slide
   */
  addTable(r, t) {
    return this._newAutoPagedSlides = lo(this, r, t, this._slideLayout, this._presLayout, this.addSlide, this.getSlide), this;
  }
  /**
   * Add text to Slide
   * @param {string|TextProps[]} text - text string or complex object
   * @param {TextPropsOptions} options - text options
   * @return {Slide} this Slide
   */
  addText(r, t) {
    return Br(this, typeof r == "string" || typeof r == "number" ? [{ text: r, options: t }] : r, t, !1), this;
  }
}
function fo(e, r) {
  return Oe(this, void 0, void 0, function* () {
    const t = e.data;
    return yield new Promise((s, n) => {
      var o, l;
      const A = new ui(), c = (t.length - 1) * 2 + 1, a = ((l = (o = t[0]) === null || o === void 0 ? void 0 : o.labels) === null || l === void 0 ? void 0 : l.length) > 1;
      A.folder("_rels"), A.folder("docProps"), A.folder("xl/_rels"), A.folder("xl/tables"), A.folder("xl/theme"), A.folder("xl/worksheets"), A.folder("xl/worksheets/_rels"), A.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>  <Default Extension="xml" ContentType="application/xml"/>  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>  <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>
`), A.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>
`), A.file("docProps/app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Macintosh Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>
`), A.file("docProps/core.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>PptxGenJS</dc:creator><cp:lastModifiedBy>PptxGenJS</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">' + (/* @__PURE__ */ new Date()).toISOString() + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + (/* @__PURE__ */ new Date()).toISOString() + "</dcterms:modified></cp:coreProperties>"), A.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>'), A.file("xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="0" formatCode="General"/></numFmts><fonts count="4"><font><sz val="9"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="9"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="10"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="18"/><color indexed="8"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><dxfs count="0"/><tableStyles count="0"/><colors><indexedColors><rgbColor rgb="ff000000"/><rgbColor rgb="ffffffff"/><rgbColor rgb="ffff0000"/><rgbColor rgb="ff00ff00"/><rgbColor rgb="ff0000ff"/><rgbColor rgb="ffffff00"/><rgbColor rgb="ffff00ff"/><rgbColor rgb="ff00ffff"/><rgbColor rgb="ff000000"/><rgbColor rgb="ffffffff"/><rgbColor rgb="ff878787"/><rgbColor rgb="fff9f9f9"/></indexedColors></colors></styleSheet>
`), A.file("xl/theme/theme1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light" panose="020F0302020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="Yu Gothic Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="DengXian Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri" panose="020F0502020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="Yu Gothic"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="DengXian"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst></a:theme>'), A.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="7" lowestEdited="6" rupBuild="10507"/><workbookPr/><bookViews><workbookView xWindow="0" yWindow="500" windowWidth="20960" windowHeight="15960"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="0" concurrentCalc="0"/></workbook>
`), A.file("xl/worksheets/_rels/sheet1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/></Relationships>
`);
      {
        let i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D)
          i += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${c}" uniqueCount="${c}">`;
        else if (e.opts._type === re.SCATTER)
          i += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${t.length}" uniqueCount="${t.length}">`;
        else if (a) {
          let f = t.length;
          t[0].labels.forEach((y) => f += y.filter((d) => d && d !== "").length), i += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${f}" uniqueCount="${f}">`, i += "<si><t/></si>";
        } else {
          const f = t.length + t[0].labels.length * t[0].labels[0].length + t[0].labels.length, y = t.length + t[0].labels.length * t[0].labels[0].length + 1;
          i += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${f}" uniqueCount="${y}">`, i += '<si><t xml:space="preserve"></t></si>';
        }
        e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D ? t.forEach((f, y) => {
          y === 0 ? i += "<si><t>X-Axis</t></si>" : (i += `<si><t>${fe(f.name || `Y-Axis${y}`)}</t></si>`, i += `<si><t>${fe(`Size${y}`)}</t></si>`);
        }) : t.forEach((f) => {
          i += `<si><t>${fe((f.name || " ").replace("X-Axis", "X-Values"))}</t></si>`;
        }), e.opts._type !== re.BUBBLE && e.opts._type !== re.BUBBLE3D && e.opts._type !== re.SCATTER && t[0].labels.slice().reverse().forEach((f) => {
          f.filter((y) => y && y !== "").forEach((y) => {
            i += `<si><t>${fe(y)}</t></si>`;
          });
        }), i += `</sst>
`, A.file("xl/sharedStrings.xml", i);
      }
      {
        let i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D) {
          i += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${_e(c)}${c}" totalsRowShown="0">`, i += `<tableColumns count="${c}">`;
          let f = 1;
          t.forEach((y, d) => {
            d === 0 ? i += `<tableColumn id="${d + 1}" name="X-Values"/>` : (i += `<tableColumn id="${d + f}" name="${y.name}"/>`, f++, i += `<tableColumn id="${d + f}" name="Size${d}"/>`);
          });
        } else e.opts._type === re.SCATTER ? (i += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${_e(t.length)}${t[0].values.length + 1}" totalsRowShown="0">`, i += `<tableColumns count="${t.length}">`, t.forEach((f, y) => {
          i += `<tableColumn id="${y + 1}" name="${y === 0 ? "X-Values" : "Y-Value "}${y}"/>`;
        })) : (i += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${_e(t.length + t[0].labels.length)}${t[0].labels[0].length + 1}'" totalsRowShown="0">`, i += `<tableColumns count="${t.length + t[0].labels.length}">`, t[0].labels.forEach((f, y) => {
          i += `<tableColumn id="${y + 1}" name="Column${y + 1}"/>`;
        }), t.forEach((f, y) => {
          i += `<tableColumn id="${y + t[0].labels.length + 1}" name="${fe(f.name)}"/>`;
        }));
        i += "</tableColumns>", i += '<tableStyleInfo showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>', i += "</table>", A.file("xl/tables/table1.xml", i);
      }
      {
        let i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (i += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">', e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D ? i += `<dimension ref="A1:${_e(c)}${t[0].values.length + 1}"/>` : e.opts._type === re.SCATTER ? i += `<dimension ref="A1:${_e(t.length)}${t[0].values.length + 1}"/>` : i += `<dimension ref="A1:${_e(t.length + 1)}${t[0].values.length + 1}"/>`, i += '<sheetViews><sheetView tabSelected="1" workbookViewId="0"><selection activeCell="B1" sqref="B1"/></sheetView></sheetViews>', i += '<sheetFormatPr baseColWidth="10" defaultRowHeight="16"/>', e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D) {
          i += "<sheetData>", i += `<row r="1" spans="1:${c}">`, i += '<c r="A1" t="s"><v>0</v></c>';
          for (let f = 1; f < c; f++)
            i += `<c r="${_e(f + 1)}1" t="s"><v>${f}</v></c>`;
          i += "</row>", t[0].values.forEach((f, y) => {
            i += `<row r="${y + 2}" spans="1:${c}">`, i += `<c r="A${y + 2}"><v>${f}</v></c>`;
            let d = 2;
            for (let m = 1; m < t.length; m++)
              i += `<c r="${_e(d)}${y + 2}"><v>${t[m].values[y] || ""}</v></c>`, d++, i += `<c r="${_e(d)}${y + 2}"><v>${t[m].sizes[y] || ""}</v></c>`, d++;
            i += "</row>";
          });
        } else if (e.opts._type === re.SCATTER) {
          i += "<sheetData>", i += `<row r="1" spans="1:${t.length}">`;
          for (let f = 0; f < t.length; f++)
            i += `<c r="${_e(f + 1)}1" t="s"><v>${f}</v></c>`;
          i += "</row>", t[0].values.forEach((f, y) => {
            i += `<row r="${y + 2}" spans="1:${t.length}">`, i += `<c r="A${y + 2}"><v>${f}</v></c>`;
            for (let d = 1; d < t.length; d++)
              i += `<c r="${_e(d + 1)}${y + 2}"><v>${t[d].values[y] || t[d].values[y] === 0 ? t[d].values[y] : ""}</v></c>`;
            i += "</row>";
          });
        } else if (i += "<sheetData>", a) {
          i += `<row r="1" spans="1:${t.length + t[0].labels.length}">`;
          for (let m = 0; m < t[0].labels.length; m++)
            i += `<c r="${_e(m + 1)}1" t="s"><v>0</v></c>`;
          for (let m = t[0].labels.length - 1; m < t.length + t[0].labels.length - 1; m++)
            i += `<c r="${_e(m + t[0].labels.length)}1" t="s"><v>${m}</v></c>`;
          i += "</row>";
          const f = t.length, y = t[0].labels[0].length, d = t[0].labels.length;
          for (let m = 0; m < y; m++) {
            i += `<row r="${m + 2}" spans="1:${f + d}">`;
            let u = f;
            const g = t[0].labels.slice().reverse();
            g.forEach((p, h) => {
              if (p[m]) {
                const E = h === 0 ? 1 : g[h - 1].filter((v) => v && v !== "").length;
                u += E, i += `<c r="${_e(m + 1 + h)}${m + 2}" t="s"><v>${u}</v></c>`;
              }
            });
            for (let p = 0; p < f; p++)
              i += `<c r="${_e(d + p + 1)}${m + 2}"><v>${t[p].values[m] || 0}</v></c>`;
            i += "</row>";
          }
        } else {
          i += `<row r="1" spans="1:${t.length + t[0].labels.length}">`, t[0].labels.forEach((f, y) => {
            i += `<c r="${_e(y + 1)}1" t="s"><v>0</v></c>`;
          });
          for (let f = 0; f < t.length; f++)
            i += `<c r="${_e(f + 1 + t[0].labels.length)}1" t="s"><v>${f + 1}</v></c>`;
          i += "</row>", t[0].labels[0].forEach((f, y) => {
            i += `<row r="${y + 2}" spans="1:${t.length + t[0].labels.length}">`;
            for (let d = t[0].labels.length - 1; d >= 0; d--)
              i += `<c r="${_e(t[0].labels.length - d)}${y + 2}" t="s">`, i += `<v>${t.length + y + 1}</v>`, i += "</c>";
            for (let d = 0; d < t.length; d++)
              i += `<c r="${_e(t[0].labels.length + d + 1)}${y + 2}"><v>${t[d].values[y] || ""}</v></c>`;
            i += "</row>";
          });
        }
        i += "</sheetData>", i += '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>', i += `</worksheet>
`, A.file("xl/worksheets/sheet1.xml", i);
      }
      A.generateAsync({ type: "base64" }).then((i) => {
        r.file(`ppt/embeddings/Microsoft_Excel_Worksheet${e.globalId}.xlsx`, i, { base64: !0 }), r.file("ppt/charts/_rels/" + e.fileName + ".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/package" Target="../embeddings/Microsoft_Excel_Worksheet${e.globalId}.xlsx"/></Relationships>`), r.file(`ppt/charts/${e.fileName}`, uo(e)), s("");
      }).catch((i) => {
        n(i);
      });
    });
  });
}
function uo(e) {
  var r, t, s, n;
  let o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', l = !1;
  if (o += '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">', o += '<c:date1904 val="0"/>', o += `<c:roundedCorners val="${e.opts.chartArea.roundedCorners ? "1" : "0"}"/>`, o += "<c:chart>", e.opts.showTitle ? (o += Mr({
    title: e.opts.title || "Chart Title",
    color: e.opts.titleColor,
    fontFace: e.opts.titleFontFace,
    fontSize: e.opts.titleFontSize || Ki,
    titleAlign: e.opts.titleAlign,
    titleBold: e.opts.titleBold,
    titlePos: e.opts.titlePos,
    titleRotate: e.opts.titleRotate
  }, e.opts.x, e.opts.y), o += '<c:autoTitleDeleted val="0"/>') : o += '<c:autoTitleDeleted val="1"/>', e.opts._type === re.BAR3D && (o += `<c:view3D><c:rotX val="${e.opts.v3DRotX}"/><c:rotY val="${e.opts.v3DRotY}"/><c:rAngAx val="${e.opts.v3DRAngAx ? 1 : 0}"/><c:perspective val="${e.opts.v3DPerspective}"/></c:view3D>`), o += "<c:plotArea>", e.opts.layout ? (o += "<c:layout>", o += " <c:manualLayout>", o += '  <c:layoutTarget val="inner" />', o += '  <c:xMode val="edge" />', o += '  <c:yMode val="edge" />', o += '  <c:x val="' + (e.opts.layout.x || 0) + '" />', o += '  <c:y val="' + (e.opts.layout.y || 0) + '" />', o += '  <c:w val="' + (e.opts.layout.w || 1) + '" />', o += '  <c:h val="' + (e.opts.layout.h || 1) + '" />', o += " </c:manualLayout>", o += "</c:layout>") : o += "<c:layout/>", Array.isArray(e.opts._type) ? e.opts._type.forEach((A) => {
    const c = Object.assign(Object.assign({}, e.opts), A.options), a = c.secondaryValAxis ? Rr : Ye, i = c.secondaryCatAxis ? ha : Nt;
    l = l || c.secondaryValAxis, o += $a(A.type, A.data, c, a, i);
  }) : o += $a(e.opts._type, e.data, e.opts, Ye, Nt), e.opts._type !== re.PIE && e.opts._type !== re.DOUGHNUT) {
    if (e.opts.valAxes && e.opts.valAxes.length > 1 && !l)
      throw new Error("Secondary axis must be used by one of the multiple charts");
    if (e.opts.catAxes) {
      if (!e.opts.valAxes || e.opts.valAxes.length !== e.opts.catAxes.length)
        throw new Error("There must be the same number of value and category axes.");
      o += Qr(Object.assign(Object.assign({}, e.opts), e.opts.catAxes[0]), Nt, Ye);
    } else
      o += Qr(e.opts, Nt, Ye);
    e.opts.valAxes ? (o += jr(Object.assign(Object.assign({}, e.opts), e.opts.valAxes[0]), Ye), e.opts.valAxes[1] && (o += jr(Object.assign(Object.assign({}, e.opts), e.opts.valAxes[1]), Rr))) : (o += jr(e.opts, Ye), e.opts._type === re.BAR3D && (o += ho(e.opts, mi, Ye))), !((r = e.opts) === null || r === void 0) && r.catAxes && (!((t = e.opts) === null || t === void 0) && t.catAxes[1]) && (o += Qr(Object.assign(Object.assign({}, e.opts), e.opts.catAxes[1]), ha, Rr));
  }
  return e.opts.showDataTable && (o += "<c:dTable>", o += `  <c:showHorzBorder val="${e.opts.showDataTableHorzBorder ? 1 : 0}"/>`, o += `  <c:showVertBorder val="${e.opts.showDataTableVertBorder ? 1 : 0}"/>`, o += `  <c:showOutline    val="${e.opts.showDataTableOutline ? 1 : 0}"/>`, o += `  <c:showKeys       val="${e.opts.showDataTableKeys ? 1 : 0}"/>`, o += "  <c:spPr>", o += "    <a:noFill/>", o += '    <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln>', o += "    <a:effectLst/>", o += "  </c:spPr>", o += "  <c:txPr>", o += '   <a:bodyPr rot="0" spcFirstLastPara="1" vertOverflow="ellipsis" vert="horz" wrap="square" anchor="ctr" anchorCtr="1"/>', o += "   <a:lstStyle/>", o += "   <a:p>", o += '     <a:pPr rtl="0">', o += `       <a:defRPr sz="${Math.round((e.opts.dataTableFontSize || Ue) * 100)}" b="0" i="0" u="none" strike="noStrike" kern="1200" baseline="0">`, o += '         <a:solidFill><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></a:solidFill>', o += '         <a:latin typeface="+mn-lt"/>', o += '         <a:ea typeface="+mn-ea"/>', o += '         <a:cs typeface="+mn-cs"/>', o += "       </a:defRPr>", o += "     </a:pPr>", o += '    <a:endParaRPr lang="en-US"/>', o += "   </a:p>", o += " </c:txPr>", o += "</c:dTable>"), o += "  <c:spPr>", o += !((s = e.opts.plotArea.fill) === null || s === void 0) && s.color ? $e(e.opts.plotArea.fill) : "<a:noFill/>", o += e.opts.plotArea.border ? `<a:ln w="${de(e.opts.plotArea.border.pt)}" cap="flat">${$e(e.opts.plotArea.border.color)}</a:ln>` : "<a:ln><a:noFill/></a:ln>", o += "    <a:effectLst/>", o += "  </c:spPr>", o += "</c:plotArea>", e.opts.showLegend && (o += "<c:legend>", o += '<c:legendPos val="' + e.opts.legendPos + '"/>', o += '<c:overlay val="0"/>', (e.opts.legendFontFace || e.opts.legendFontSize || e.opts.legendColor) && (o += "<c:txPr>", o += "  <a:bodyPr/>", o += "  <a:lstStyle/>", o += "  <a:p>", o += "    <a:pPr>", o += e.opts.legendFontSize ? `<a:defRPr sz="${Math.round(Number(e.opts.legendFontSize) * 100)}">` : "<a:defRPr>", e.opts.legendColor && (o += $e(e.opts.legendColor)), e.opts.legendFontFace && (o += '<a:latin typeface="' + e.opts.legendFontFace + '"/>'), e.opts.legendFontFace && (o += '<a:cs    typeface="' + e.opts.legendFontFace + '"/>'), o += "      </a:defRPr>", o += "    </a:pPr>", o += '    <a:endParaRPr lang="en-US"/>', o += "  </a:p>", o += "</c:txPr>"), o += "</c:legend>"), o += '  <c:plotVisOnly val="1"/>', o += '  <c:dispBlanksAs val="' + e.opts.displayBlanksAs + '"/>', e.opts._type === re.SCATTER && (o += '<c:showDLblsOverMax val="1"/>'), o += "</c:chart>", o += "<c:spPr>", o += !((n = e.opts.chartArea.fill) === null || n === void 0) && n.color ? $e(e.opts.chartArea.fill) : "<a:noFill/>", o += e.opts.chartArea.border ? `<a:ln w="${de(e.opts.chartArea.border.pt)}" cap="flat">${$e(e.opts.chartArea.border.color)}</a:ln>` : "<a:ln><a:noFill/></a:ln>", o += "  <a:effectLst/>", o += "</c:spPr>", o += '<c:externalData r:id="rId1"><c:autoUpdate val="0"/></c:externalData>', o += "</c:chartSpace>", o;
}
function $a(e, r, t, s, n, o) {
  let l = -1, A = 1, c = null, a = "";
  switch (e) {
    case re.AREA:
    case re.BAR:
    case re.BAR3D:
    case re.LINE:
    case re.RADAR:
      a += `<c:${e}Chart>`, e === re.AREA && t.barGrouping === "stacked" && (a += '<c:grouping val="' + t.barGrouping + '"/>'), (e === re.BAR || e === re.BAR3D) && (a += '<c:barDir val="' + t.barDir + '"/>', a += '<c:grouping val="' + (t.barGrouping || "clustered") + '"/>'), e === re.RADAR && (a += '<c:radarStyle val="' + t.radarStyle + '"/>'), a += '<c:varyColors val="0"/>', r.forEach((i) => {
        var f;
        l++, a += "<c:ser>", a += `  <c:idx val="${i._dataIndex}"/><c:order val="${i._dataIndex}"/>`, a += "  <c:tx>", a += "    <c:strRef>", a += "      <c:f>Sheet1!$" + _e(i._dataIndex + i.labels.length + 1) + "$1</c:f>", a += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(i.name) + "</c:v></c:pt></c:strCache>", a += "    </c:strRef>", a += "  </c:tx>";
        const y = t.chartColors ? t.chartColors[l % t.chartColors.length] : null;
        a += "  <c:spPr>", y === "transparent" ? a += "<a:noFill/>" : t.chartColorsOpacity ? a += "<a:solidFill>" + be(y, `<a:alpha val="${Math.round(t.chartColorsOpacity * 1e3)}"/>`) + "</a:solidFill>" : a += "<a:solidFill>" + be(y) + "</a:solidFill>", e === re.LINE || e === re.RADAR ? t.lineSize === 0 ? a += "<a:ln><a:noFill/></a:ln>" : (a += `<a:ln w="${de(t.lineSize)}" cap="${Pr(t.lineCap)}"><a:solidFill>${be(y)}</a:solidFill>`, a += '<a:prstDash val="' + (t.lineDash || "solid") + '"/><a:round/></a:ln>') : t.dataBorder && (a += `<a:ln w="${de(t.dataBorder.pt)}" cap="${Pr(t.lineCap)}"><a:solidFill>${be(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`), a += ot(t.shadow, it), a += "  </c:spPr>", a += '  <c:invertIfNegative val="0"/>', e !== re.RADAR && (a += "<c:dLbls>", a += `<c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, t.dataLabelBkgrdColors && (a += `<c:spPr><a:solidFill>${be(y)}</a:solidFill></c:spPr>`), a += "<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>", a += `<a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || Ue) * 100)}" u="none">`, a += `<a:solidFill>${be(t.dataLabelColor || Ie)}</a:solidFill>`, a += `<a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, a += "</a:defRPr></a:pPr></a:p></c:txPr>", t.dataLabelPosition && (a += `<c:dLblPos val="${t.dataLabelPosition}"/>`), a += '<c:showLegendKey val="0"/>', a += `<c:showVal val="${t.showValue ? "1" : "0"}"/>`, a += `<c:showCatName val="0"/><c:showSerName val="${t.showSerName ? "1" : "0"}"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>`, a += `<c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, a += "</c:dLbls>"), (e === re.LINE || e === re.RADAR) && (a += "<c:marker>", a += '  <c:symbol val="' + t.lineDataSymbol + '"/>', t.lineDataSymbolSize && (a += `<c:size val="${t.lineDataSymbolSize}"/>`), a += "  <c:spPr>", a += `    <a:solidFill>${be(t.chartColors[i._dataIndex + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : i._dataIndex])}</a:solidFill>`, a += `    <a:ln w="${t.lineDataSymbolLineSize}" cap="flat"><a:solidFill>${be(t.lineDataSymbolLineColor || y)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`, a += "    <a:effectLst/>", a += "  </c:spPr>", a += "</c:marker>"), (e === re.BAR || e === re.BAR3D) && r.length === 1 && (t.chartColors && t.chartColors !== Bt && t.chartColors.length > 1 || !((f = t.invertedColors) === null || f === void 0) && f.length) && i.values.forEach((d, m) => {
          const u = d < 0 ? t.invertedColors || t.chartColors || Bt : t.chartColors || [];
          a += "  <c:dPt>", a += `    <c:idx val="${m}"/>`, a += '      <c:invertIfNegative val="0"/>', a += '    <c:bubble3D val="0"/>', a += "    <c:spPr>", t.lineSize === 0 ? a += "<a:ln><a:noFill/></a:ln>" : e === re.BAR ? (a += "<a:solidFill>", a += '  <a:srgbClr val="' + u[m % u.length] + '"/>', a += "</a:solidFill>") : (a += "<a:ln>", a += "  <a:solidFill>", a += '   <a:srgbClr val="' + u[m % u.length] + '"/>', a += "  </a:solidFill>", a += "</a:ln>"), a += ot(t.shadow, it), a += "    </c:spPr>", a += "  </c:dPt>";
        }), a += "<c:cat>", t.catLabelFormatCode ? (a += "  <c:numRef>", a += `    <c:f>Sheet1!$A$2:$A$${i.labels[0].length + 1}</c:f>`, a += "    <c:numCache>", a += "      <c:formatCode>" + (t.catLabelFormatCode || "General") + "</c:formatCode>", a += `      <c:ptCount val="${i.labels[0].length}"/>`, i.labels[0].forEach((d, m) => a += `<c:pt idx="${m}"><c:v>${fe(d)}</c:v></c:pt>`), a += "    </c:numCache>", a += "  </c:numRef>") : (a += "  <c:multiLvlStrRef>", a += `    <c:f>Sheet1!$A$2:$${_e(i.labels.length)}$${i.labels[0].length + 1}</c:f>`, a += "    <c:multiLvlStrCache>", a += `      <c:ptCount val="${i.labels[0].length}"/>`, i.labels.forEach((d) => {
          a += "<c:lvl>", d.forEach((m, u) => a += `<c:pt idx="${u}"><c:v>${fe(m)}</c:v></c:pt>`), a += "</c:lvl>";
        }), a += "    </c:multiLvlStrCache>", a += "  </c:multiLvlStrRef>"), a += "</c:cat>", a += "<c:val>", a += "  <c:numRef>", a += `<c:f>Sheet1!$${_e(i._dataIndex + i.labels.length + 1)}$2:$${_e(i._dataIndex + i.labels.length + 1)}$${i.labels[0].length + 1}</c:f>`, a += "    <c:numCache>", a += "      <c:formatCode>" + (t.valLabelFormatCode || t.dataTableFormatCode || "General") + "</c:formatCode>", a += `      <c:ptCount val="${i.labels[0].length}"/>`, i.values.forEach((d, m) => a += `<c:pt idx="${m}"><c:v>${d || d === 0 ? d : ""}</c:v></c:pt>`), a += "    </c:numCache>", a += "  </c:numRef>", a += "</c:val>", e === re.LINE && (a += '<c:smooth val="' + (t.lineSmooth ? "1" : "0") + '"/>'), a += "</c:ser>";
      }), a += "  <c:dLbls>", a += `    <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, a += "    <c:txPr>", a += "      <a:bodyPr/>", a += "      <a:lstStyle/>", a += "      <a:p><a:pPr>", a += `        <a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || Ue) * 100)}" u="none">`, a += "          <a:solidFill>" + be(t.dataLabelColor || Ie) + "</a:solidFill>", a += '          <a:latin typeface="' + (t.dataLabelFontFace || "Arial") + '"/>', a += "        </a:defRPr>", a += "      </a:pPr></a:p>", a += "    </c:txPr>", t.dataLabelPosition && (a += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), a += '    <c:showLegendKey val="0"/>', a += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', a += '    <c:showCatName val="0"/>', a += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', a += '    <c:showPercent val="0"/>', a += '    <c:showBubbleSize val="0"/>', a += `    <c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, a += "  </c:dLbls>", e === re.BAR ? (a += `  <c:gapWidth val="${t.barGapWidthPct}"/>`, a += `  <c:overlap val="${(t.barGrouping || "").includes("tacked") ? 100 : t.barOverlapPct ? t.barOverlapPct : 0}"/>`) : e === re.BAR3D ? (a += `  <c:gapWidth val="${t.barGapWidthPct}"/>`, a += `  <c:gapDepth val="${t.barGapDepthPct}"/>`, a += '  <c:shape val="' + t.bar3DShape + '"/>') : e === re.LINE && (a += '  <c:marker val="1"/>'), a += `<c:axId val="${n}"/><c:axId val="${s}"/><c:axId val="${mi}"/>`, a += `</c:${e}Chart>`;
      break;
    case re.SCATTER:
      a += "<c:" + e + "Chart>", a += '<c:scatterStyle val="lineMarker"/>', a += '<c:varyColors val="0"/>', l = -1, r.filter((i, f) => f > 0).forEach((i, f) => {
        l++, a += "<c:ser>", a += `  <c:idx val="${f}"/>`, a += `  <c:order val="${f}"/>`, a += "  <c:tx>", a += "    <c:strRef>", a += `      <c:f>Sheet1!$${_e(f + 2)}$1</c:f>`, a += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(i.name) + "</c:v></c:pt></c:strCache>", a += "    </c:strRef>", a += "  </c:tx>", a += "  <c:spPr>";
        {
          const y = t.chartColors[l % t.chartColors.length];
          y === "transparent" ? a += "<a:noFill/>" : t.chartColorsOpacity ? a += "<a:solidFill>" + be(y, '<a:alpha val="' + Math.round(t.chartColorsOpacity * 1e3).toString() + '"/>') + "</a:solidFill>" : a += "<a:solidFill>" + be(y) + "</a:solidFill>", t.lineSize === 0 ? a += "<a:ln><a:noFill/></a:ln>" : (a += `<a:ln w="${de(t.lineSize)}" cap="${Pr(t.lineCap)}"><a:solidFill>${be(y)}</a:solidFill>`, a += `<a:prstDash val="${t.lineDash || "solid"}"/><a:round/></a:ln>`), a += ot(t.shadow, it);
        }
        if (a += "  </c:spPr>", a += "<c:marker>", a += '  <c:symbol val="' + t.lineDataSymbol + '"/>', t.lineDataSymbolSize && (a += `<c:size val="${t.lineDataSymbolSize}"/>`), a += "<c:spPr>", a += `<a:solidFill>${be(t.chartColors[f + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : f])}</a:solidFill>`, a += `<a:ln w="${t.lineDataSymbolLineSize}" cap="flat"><a:solidFill>${be(t.lineDataSymbolLineColor || t.chartColors[l % t.chartColors.length])}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`, a += "<a:effectLst/>", a += "</c:spPr>", a += "</c:marker>", t.showLabel) {
          const y = Dr("-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
          i.labels[0] && (t.dataLabelFormatScatter === "custom" || t.dataLabelFormatScatter === "customXY") && (a += "<c:dLbls>", i.labels[0].forEach((d, m) => {
            (t.dataLabelFormatScatter === "custom" || t.dataLabelFormatScatter === "customXY") && (a += "  <c:dLbl>", a += `    <c:idx val="${m}"/>`, a += "    <c:tx>", a += "      <c:rich>", a += "            <a:bodyPr>", a += "                <a:spAutoFit/>", a += "            </a:bodyPr>", a += "            <a:lstStyle/>", a += "            <a:p>", a += "                <a:pPr>", a += "                    <a:defRPr/>", a += "                </a:pPr>", a += "              <a:r>", a += '                    <a:rPr lang="' + (t.lang || "en-US") + '" dirty="0"/>', a += "                    <a:t>" + fe(d) + "</a:t>", a += "              </a:r>", t.dataLabelFormatScatter === "customXY" && !/^ *$/.test(d) && (a += "              <a:r>", a += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', a += "                  <a:t> (</a:t>", a += "              </a:r>", a += '              <a:fld id="{' + Dr("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") + '}" type="XVALUE">', a += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0"/>', a += "                  <a:pPr>", a += "                      <a:defRPr/>", a += "                  </a:pPr>", a += "                  <a:t>[" + fe(i.name) + "</a:t>", a += "              </a:fld>", a += "              <a:r>", a += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', a += "                  <a:t>, </a:t>", a += "              </a:r>", a += '              <a:fld id="{' + Dr("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") + '}" type="YVALUE">', a += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0"/>', a += "                  <a:pPr>", a += "                      <a:defRPr/>", a += "                  </a:pPr>", a += "                  <a:t>[" + fe(i.name) + "]</a:t>", a += "              </a:fld>", a += "              <a:r>", a += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', a += "                  <a:t>)</a:t>", a += "              </a:r>", a += '              <a:endParaRPr lang="' + (t.lang || "en-US") + '" dirty="0"/>'), a += "            </a:p>", a += "      </c:rich>", a += "    </c:tx>", a += "    <c:spPr>", a += "        <a:noFill/>", a += "        <a:ln>", a += "            <a:noFill/>", a += "        </a:ln>", a += "        <a:effectLst/>", a += "    </c:spPr>", t.dataLabelPosition && (a += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), a += '    <c:showLegendKey val="0"/>', a += '    <c:showVal val="0"/>', a += '    <c:showCatName val="0"/>', a += '    <c:showSerName val="0"/>', a += '    <c:showPercent val="0"/>', a += '    <c:showBubbleSize val="0"/>', a += '       <c:showLeaderLines val="1"/>', a += "    <c:extLst>", a += '      <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart"/>', a += '      <c:ext uri="{C3380CC4-5D6E-409C-BE32-E72D297353CC}" xmlns:c16="http://schemas.microsoft.com/office/drawing/2014/chart">', a += `            <c16:uniqueId val="{${"00000000".substring(0, 8 - (m + 1).toString().length).toString()}${m + 1}${y}}"/>`, a += "      </c:ext>", a += "        </c:extLst>", a += "</c:dLbl>");
          }), a += "</c:dLbls>"), t.dataLabelFormatScatter === "XY" && (a += "<c:dLbls>", a += "    <c:spPr>", a += "        <a:noFill/>", a += "        <a:ln>", a += "            <a:noFill/>", a += "        </a:ln>", a += "          <a:effectLst/>", a += "    </c:spPr>", a += "    <c:txPr>", a += "        <a:bodyPr>", a += "            <a:spAutoFit/>", a += "        </a:bodyPr>", a += "        <a:lstStyle/>", a += "        <a:p>", a += "            <a:pPr>", a += "                <a:defRPr/>", a += "            </a:pPr>", a += '            <a:endParaRPr lang="en-US"/>', a += "        </a:p>", a += "    </c:txPr>", t.dataLabelPosition && (a += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), a += '    <c:showLegendKey val="0"/>', a += ` <c:showVal val="${t.showLabel ? "1" : "0"}"/>`, a += ` <c:showCatName val="${t.showLabel ? "1" : "0"}"/>`, a += ` <c:showSerName val="${t.showSerName ? "1" : "0"}"/>`, a += '    <c:showPercent val="0"/>', a += '    <c:showBubbleSize val="0"/>', a += "    <c:extLst>", a += '        <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">', a += '            <c15:showLeaderLines val="1"/>', a += "        </c:ext>", a += "    </c:extLst>", a += "</c:dLbls>");
        }
        r.length === 1 && t.chartColors !== Bt && i.values.forEach((y, d) => {
          const m = y < 0 ? t.invertedColors || t.chartColors || Bt : t.chartColors || [];
          a += "  <c:dPt>", a += `    <c:idx val="${d}"/>`, a += '      <c:invertIfNegative val="0"/>', a += '    <c:bubble3D val="0"/>', a += "    <c:spPr>", t.lineSize === 0 ? a += "<a:ln><a:noFill/></a:ln>" : (a += "<a:solidFill>", a += ' <a:srgbClr val="' + m[d % m.length] + '"/>', a += "</a:solidFill>"), a += ot(t.shadow, it), a += "    </c:spPr>", a += "  </c:dPt>";
        }), a += "<c:xVal>", a += "  <c:numRef>", a += `    <c:f>Sheet1!$A$2:$A$${r[0].values.length + 1}</c:f>`, a += "    <c:numCache>", a += "      <c:formatCode>General</c:formatCode>", a += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((y, d) => {
          a += `<c:pt idx="${d}"><c:v>${y || y === 0 ? y : ""}</c:v></c:pt>`;
        }), a += "    </c:numCache>", a += "  </c:numRef>", a += "</c:xVal>", a += "<c:yVal>", a += "  <c:numRef>", a += `    <c:f>Sheet1!$${_e(f + 2)}$2:$${_e(f + 2)}$${r[0].values.length + 1}</c:f>`, a += "    <c:numCache>", a += "      <c:formatCode>General</c:formatCode>", a += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((y, d) => {
          a += `<c:pt idx="${d}"><c:v>${i.values[d] || i.values[d] === 0 ? i.values[d] : ""}</c:v></c:pt>`;
        }), a += "    </c:numCache>", a += "  </c:numRef>", a += "</c:yVal>", a += '<c:smooth val="' + (t.lineSmooth ? "1" : "0") + '"/>', a += "</c:ser>";
      }), a += "  <c:dLbls>", a += `    <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, a += "    <c:txPr>", a += "      <a:bodyPr/>", a += "      <a:lstStyle/>", a += "      <a:p><a:pPr>", a += `        <a:defRPr b="${t.dataLabelFontBold ? "1" : "0"}" i="${t.dataLabelFontItalic ? "1" : "0"}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || Ue) * 100)}" u="none">`, a += "          <a:solidFill>" + be(t.dataLabelColor || Ie) + "</a:solidFill>", a += '          <a:latin typeface="' + (t.dataLabelFontFace || "Arial") + '"/>', a += "        </a:defRPr>", a += "      </a:pPr></a:p>", a += "    </c:txPr>", t.dataLabelPosition && (a += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), a += '    <c:showLegendKey val="0"/>', a += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', a += '    <c:showCatName val="0"/>', a += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', a += '    <c:showPercent val="0"/>', a += '    <c:showBubbleSize val="0"/>', a += "  </c:dLbls>", a += `<c:axId val="${n}"/><c:axId val="${s}"/>`, a += "</c:" + e + "Chart>";
      break;
    case re.BUBBLE:
    case re.BUBBLE3D:
      a += "<c:bubbleChart>", a += '<c:varyColors val="0"/>', l = -1, r.filter((i, f) => f > 0).forEach((i, f) => {
        l++, a += "<c:ser>", a += `  <c:idx val="${f}"/>`, a += `  <c:order val="${f}"/>`, a += "  <c:tx>", a += "    <c:strRef>", a += "      <c:f>Sheet1!$" + _e(A + 1) + "$1</c:f>", a += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(i.name) + "</c:v></c:pt></c:strCache>", a += "    </c:strRef>", a += "  </c:tx>";
        {
          a += "<c:spPr>";
          const y = t.chartColors[l % t.chartColors.length];
          y === "transparent" ? a += "<a:noFill/>" : t.chartColorsOpacity ? a += `<a:solidFill>${be(y, '<a:alpha val="' + Math.round(t.chartColorsOpacity * 1e3).toString() + '"/>')}</a:solidFill>` : a += "<a:solidFill>" + be(y) + "</a:solidFill>", t.lineSize === 0 ? a += "<a:ln><a:noFill/></a:ln>" : t.dataBorder ? a += `<a:ln w="${de(t.dataBorder.pt)}" cap="flat"><a:solidFill>${be(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>` : (a += `<a:ln w="${de(t.lineSize)}" cap="flat"><a:solidFill>${be(y)}</a:solidFill>`, a += `<a:prstDash val="${t.lineDash || "solid"}"/><a:round/></a:ln>`), a += ot(t.shadow, it), a += "</c:spPr>";
        }
        a += "<c:xVal>", a += "  <c:numRef>", a += `    <c:f>Sheet1!$A$2:$A$${r[0].values.length + 1}</c:f>`, a += "    <c:numCache>", a += "      <c:formatCode>General</c:formatCode>", a += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((y, d) => {
          a += `<c:pt idx="${d}"><c:v>${y || y === 0 ? y : ""}</c:v></c:pt>`;
        }), a += "    </c:numCache>", a += "  </c:numRef>", a += "</c:xVal>", a += "<c:yVal>", a += "  <c:numRef>", a += `<c:f>Sheet1!$${_e(A + 1)}$2:$${_e(A + 1)}$${r[0].values.length + 1}</c:f>`, A++, a += "    <c:numCache>", a += "      <c:formatCode>General</c:formatCode>", a += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((y, d) => {
          a += `<c:pt idx="${d}"><c:v>${i.values[d] || i.values[d] === 0 ? i.values[d] : ""}</c:v></c:pt>`;
        }), a += "    </c:numCache>", a += "  </c:numRef>", a += "</c:yVal>", a += "  <c:bubbleSize>", a += "    <c:numRef>", a += `<c:f>Sheet1!$${_e(A + 1)}$2:$${_e(A + 1)}$${i.sizes.length + 1}</c:f>`, A++, a += "      <c:numCache>", a += "        <c:formatCode>General</c:formatCode>", a += `           <c:ptCount val="${i.sizes.length}"/>`, i.sizes.forEach((y, d) => {
          a += `<c:pt idx="${d}"><c:v>${y || ""}</c:v></c:pt>`;
        }), a += "      </c:numCache>", a += "    </c:numRef>", a += "  </c:bubbleSize>", a += '  <c:bubble3D val="' + (e === re.BUBBLE3D ? "1" : "0") + '"/>', a += "</c:ser>";
      }), a += "<c:dLbls>", a += `<c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, a += "<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>", a += `<a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round(Math.round(t.dataLabelFontSize || Ue) * 100)}" u="none">`, a += `<a:solidFill>${be(t.dataLabelColor || Ie)}</a:solidFill>`, a += `<a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, a += "</a:defRPr></a:pPr></a:p></c:txPr>", t.dataLabelPosition && (a += `<c:dLblPos val="${t.dataLabelPosition}"/>`), a += '<c:showLegendKey val="0"/>', a += `<c:showVal val="${t.showValue ? "1" : "0"}"/>`, a += `<c:showCatName val="0"/><c:showSerName val="${t.showSerName ? "1" : "0"}"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>`, a += "<c:extLst>", a += '  <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">', a += '    <c15:showLeaderLines val="' + (t.showLeaderLines ? "1" : "0") + '"/>', a += "  </c:ext>", a += "</c:extLst>", a += "</c:dLbls>", a += `<c:axId val="${n}"/><c:axId val="${s}"/>`, a += "</c:bubbleChart>";
      break;
    case re.DOUGHNUT:
    case re.PIE:
      c = r[0], a += "<c:" + e + "Chart>", a += '  <c:varyColors val="1"/>', a += "<c:ser>", a += '  <c:idx val="0"/>', a += '  <c:order val="0"/>', a += "  <c:tx>", a += "    <c:strRef>", a += "      <c:f>Sheet1!$B$1</c:f>", a += "      <c:strCache>", a += '        <c:ptCount val="1"/>', a += '        <c:pt idx="0"><c:v>' + fe(c.name) + "</c:v></c:pt>", a += "      </c:strCache>", a += "    </c:strRef>", a += "  </c:tx>", a += "  <c:spPr>", a += '    <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>', a += '    <a:ln w="9525" cap="flat"><a:solidFill><a:srgbClr val="F9F9F9"/></a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>', t.dataNoEffects ? a += "<a:effectLst/>" : a += ot(t.shadow, it), a += "  </c:spPr>", c.labels[0].forEach((i, f) => {
        a += "<c:dPt>", a += ` <c:idx val="${f}"/>`, a += ' <c:bubble3D val="0"/>', a += " <c:spPr>", a += `<a:solidFill>${be(t.chartColors[f + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : f])}</a:solidFill>`, t.dataBorder && (a += `<a:ln w="${de(t.dataBorder.pt)}" cap="flat"><a:solidFill>${be(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`), a += ot(t.shadow, it), a += "  </c:spPr>", a += "</c:dPt>";
      }), a += "<c:dLbls>", c.labels[0].forEach((i, f) => {
        a += "<c:dLbl>", a += ` <c:idx val="${f}"/>`, a += `  <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, a += "  <c:spPr/><c:txPr>", a += "   <a:bodyPr/><a:lstStyle/>", a += "   <a:p><a:pPr>", a += `   <a:defRPr sz="${Math.round((t.dataLabelFontSize || Ue) * 100)}" b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, a += "    <a:solidFill>" + be(t.dataLabelColor || Ie) + "</a:solidFill>", a += `    <a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, a += "   </a:defRPr>", a += "      </a:pPr></a:p>", a += "    </c:txPr>", e === re.PIE && t.dataLabelPosition && (a += `<c:dLblPos val="${t.dataLabelPosition}"/>`), a += '    <c:showLegendKey val="0"/>', a += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', a += '    <c:showCatName val="' + (t.showLabel ? "1" : "0") + '"/>', a += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', a += '    <c:showPercent val="' + (t.showPercent ? "1" : "0") + '"/>', a += '    <c:showBubbleSize val="0"/>', a += "  </c:dLbl>";
      }), a += ` <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, a += "    <c:txPr>", a += "      <a:bodyPr/>", a += "      <a:lstStyle/>", a += "      <a:p>", a += "        <a:pPr>", a += `          <a:defRPr sz="1800" b="${t.dataLabelFontBold ? "1" : "0"}" i="${t.dataLabelFontItalic ? "1" : "0"}" u="none" strike="noStrike">`, a += '            <a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/>', a += "          </a:defRPr>", a += "        </a:pPr>", a += "      </a:p>", a += "    </c:txPr>", a += e === re.PIE ? '<c:dLblPos val="ctr"/>' : "", a += '    <c:showLegendKey val="0"/>', a += '    <c:showVal val="0"/>', a += '    <c:showCatName val="1"/>', a += '    <c:showSerName val="0"/>', a += '    <c:showPercent val="1"/>', a += '    <c:showBubbleSize val="0"/>', a += ` <c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, a += "</c:dLbls>", a += "<c:cat>", a += "  <c:strRef>", a += `    <c:f>Sheet1!$A$2:$A$${c.labels[0].length + 1}</c:f>`, a += "    <c:strCache>", a += `         <c:ptCount val="${c.labels[0].length}"/>`, c.labels[0].forEach((i, f) => {
        a += `<c:pt idx="${f}"><c:v>${fe(i)}</c:v></c:pt>`;
      }), a += "    </c:strCache>", a += "  </c:strRef>", a += "</c:cat>", a += "  <c:val>", a += "    <c:numRef>", a += `      <c:f>Sheet1!$B$2:$B$${c.labels[0].length + 1}</c:f>`, a += "      <c:numCache>", a += `           <c:ptCount val="${c.labels[0].length}"/>`, c.values.forEach((i, f) => {
        a += `<c:pt idx="${f}"><c:v>${i || i === 0 ? i : ""}</c:v></c:pt>`;
      }), a += "      </c:numCache>", a += "    </c:numRef>", a += "  </c:val>", a += "  </c:ser>", a += `  <c:firstSliceAng val="${t.firstSliceAng ? Math.round(t.firstSliceAng) : 0}"/>`, e === re.DOUGHNUT && (a += `<c:holeSize val="${typeof t.holeSize == "number" ? t.holeSize : "50"}"/>`), a += "</c:" + e + "Chart>";
      break;
    default:
      a += "";
      break;
  }
  return a;
}
function Qr(e, r, t) {
  let s = "";
  return e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? s += "<c:valAx>" : s += "<c:" + (e.catLabelFormatCode ? "dateAx" : "catAx") + ">", s += '  <c:axId val="' + r + '"/>', s += "  <c:scaling>", s += '<c:orientation val="' + (e.catAxisOrientation || (e.barDir === "col", "minMax")) + '"/>', (e.catAxisMaxVal || e.catAxisMaxVal === 0) && (s += `<c:max val="${e.catAxisMaxVal}"/>`), (e.catAxisMinVal || e.catAxisMinVal === 0) && (s += `<c:min val="${e.catAxisMinVal}"/>`), s += "</c:scaling>", s += '  <c:delete val="' + (e.catAxisHidden ? "1" : "0") + '"/>', s += '  <c:axPos val="' + (e.barDir === "col" ? "b" : "l") + '"/>', s += e.catGridLine.style !== "none" ? Ea(e.catGridLine) : "", e.showCatAxisTitle && (s += Mr({
    color: e.catAxisTitleColor,
    fontFace: e.catAxisTitleFontFace,
    fontSize: e.catAxisTitleFontSize,
    titleRotate: e.catAxisTitleRotate,
    title: e.catAxisTitle || "Axis Title"
  })), e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? s += '  <c:numFmt formatCode="' + (e.valAxisLabelFormatCode ? fe(e.valAxisLabelFormatCode) : "General") + '" sourceLinked="1"/>' : s += '  <c:numFmt formatCode="' + (fe(e.catLabelFormatCode) || "General") + '" sourceLinked="1"/>', e._type === re.SCATTER ? (s += '  <c:majorTickMark val="none"/>', s += '  <c:minorTickMark val="none"/>', s += '  <c:tickLblPos val="nextTo"/>') : (s += '  <c:majorTickMark val="' + (e.catAxisMajorTickMark || "out") + '"/>', s += '  <c:minorTickMark val="' + (e.catAxisMinorTickMark || "none") + '"/>', s += '  <c:tickLblPos val="' + (e.catAxisLabelPos || (e.barDir === "col" ? "low" : "nextTo")) + '"/>'), s += "  <c:spPr>", s += `    <a:ln w="${e.catAxisLineSize ? de(e.catAxisLineSize) : Ft}" cap="flat">`, s += e.catAxisLineShow ? "<a:solidFill>" + be(e.catAxisLineColor || At.color) + "</a:solidFill>" : "<a:noFill/>", s += '      <a:prstDash val="' + (e.catAxisLineStyle || "solid") + '"/>', s += "      <a:round/>", s += "    </a:ln>", s += "  </c:spPr>", s += "  <c:txPr>", e.catAxisLabelRotate ? s += `<a:bodyPr rot="${dt(e.catAxisLabelRotate)}"/>` : s += "<a:bodyPr/>", s += "    <a:lstStyle/>", s += "    <a:p>", s += "    <a:pPr>", s += `      <a:defRPr sz="${Math.round((e.catAxisLabelFontSize || Ue) * 100)}" b="${e.catAxisLabelFontBold ? 1 : 0}" i="${e.catAxisLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, s += "      <a:solidFill>" + be(e.catAxisLabelColor || Ie) + "</a:solidFill>", s += '      <a:latin typeface="' + (e.catAxisLabelFontFace || "Arial") + '"/>', s += "   </a:defRPr>", s += "  </a:pPr>", s += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', s += "  </a:p>", s += " </c:txPr>", s += ' <c:crossAx val="' + t + '"/>', s += ` <c:${typeof e.valAxisCrossesAt == "number" ? "crossesAt" : "crosses"} val="${e.valAxisCrossesAt || "autoZero"}"/>`, s += ' <c:auto val="1"/>', s += ' <c:lblAlgn val="ctr"/>', s += ` <c:noMultiLvlLbl val="${e.catAxisMultiLevelLabels ? 0 : 1}"/>`, e.catAxisLabelFrequency && (s += ' <c:tickLblSkip val="' + e.catAxisLabelFrequency + '"/>'), (e.catLabelFormatCode || e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D) && (e.catLabelFormatCode && (["catAxisBaseTimeUnit", "catAxisMajorTimeUnit", "catAxisMinorTimeUnit"].forEach((n) => {
    e[n] && (typeof e[n] != "string" || !["days", "months", "years"].includes(e[n].toLowerCase())) && (console.warn(`"${n}" must be one of: 'days','months','years' !`), e[n] = null);
  }), e.catAxisBaseTimeUnit && (s += '<c:baseTimeUnit val="' + e.catAxisBaseTimeUnit.toLowerCase() + '"/>'), e.catAxisMajorTimeUnit && (s += '<c:majorTimeUnit val="' + e.catAxisMajorTimeUnit.toLowerCase() + '"/>'), e.catAxisMinorTimeUnit && (s += '<c:minorTimeUnit val="' + e.catAxisMinorTimeUnit.toLowerCase() + '"/>')), e.catAxisMajorUnit && (s += `<c:majorUnit val="${e.catAxisMajorUnit}"/>`), e.catAxisMinorUnit && (s += `<c:minorUnit val="${e.catAxisMinorUnit}"/>`)), e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? s += "</c:valAx>" : s += "</c:" + (e.catLabelFormatCode ? "dateAx" : "catAx") + ">", s;
}
function jr(e, r) {
  let t = r === Ye ? e.barDir === "col" ? "l" : "b" : e.barDir !== "col" ? "r" : "t";
  r === Rr && (t = "r");
  const s = r === Ye ? Nt : ha;
  let n = "";
  return n += "<c:valAx>", n += '  <c:axId val="' + r + '"/>', n += "  <c:scaling>", e.valAxisLogScaleBase && (n += `<c:logBase val="${e.valAxisLogScaleBase}"/>`), n += '<c:orientation val="' + (e.valAxisOrientation || (e.barDir === "col", "minMax")) + '"/>', (e.valAxisMaxVal || e.valAxisMaxVal === 0) && (n += `<c:max val="${e.valAxisMaxVal}"/>`), (e.valAxisMinVal || e.valAxisMinVal === 0) && (n += `<c:min val="${e.valAxisMinVal}"/>`), n += "  </c:scaling>", n += `  <c:delete val="${e.valAxisHidden ? 1 : 0}"/>`, n += '  <c:axPos val="' + t + '"/>', e.valGridLine.style !== "none" && (n += Ea(e.valGridLine)), e.showValAxisTitle && (n += Mr({
    color: e.valAxisTitleColor,
    fontFace: e.valAxisTitleFontFace,
    fontSize: e.valAxisTitleFontSize,
    titleRotate: e.valAxisTitleRotate,
    title: e.valAxisTitle || "Axis Title"
  })), n += `<c:numFmt formatCode="${e.valAxisLabelFormatCode ? fe(e.valAxisLabelFormatCode) : "General"}" sourceLinked="0"/>`, e._type === re.SCATTER ? (n += '  <c:majorTickMark val="none"/>', n += '  <c:minorTickMark val="none"/>', n += '  <c:tickLblPos val="nextTo"/>') : (n += ' <c:majorTickMark val="' + (e.valAxisMajorTickMark || "out") + '"/>', n += ' <c:minorTickMark val="' + (e.valAxisMinorTickMark || "none") + '"/>', n += ' <c:tickLblPos val="' + (e.valAxisLabelPos || (e.barDir === "col" ? "nextTo" : "low")) + '"/>'), n += " <c:spPr>", n += `   <a:ln w="${e.valAxisLineSize ? de(e.valAxisLineSize) : Ft}" cap="flat">`, n += e.valAxisLineShow ? "<a:solidFill>" + be(e.valAxisLineColor || At.color) + "</a:solidFill>" : "<a:noFill/>", n += '     <a:prstDash val="' + (e.valAxisLineStyle || "solid") + '"/>', n += "     <a:round/>", n += "   </a:ln>", n += " </c:spPr>", n += " <c:txPr>", n += `  <a:bodyPr${e.valAxisLabelRotate ? ' rot="' + dt(e.valAxisLabelRotate).toString() + '"' : ""}/>`, n += "  <a:lstStyle/>", n += "  <a:p>", n += "    <a:pPr>", n += `      <a:defRPr sz="${Math.round((e.valAxisLabelFontSize || Ue) * 100)}" b="${e.valAxisLabelFontBold ? 1 : 0}" i="${e.valAxisLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, n += "        <a:solidFill>" + be(e.valAxisLabelColor || Ie) + "</a:solidFill>", n += '        <a:latin typeface="' + (e.valAxisLabelFontFace || "Arial") + '"/>', n += "      </a:defRPr>", n += "    </a:pPr>", n += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', n += "  </a:p>", n += " </c:txPr>", n += ' <c:crossAx val="' + s + '"/>', typeof e.catAxisCrossesAt == "number" ? n += ` <c:crossesAt val="${e.catAxisCrossesAt}"/>` : typeof e.catAxisCrossesAt == "string" ? n += ' <c:crosses val="' + e.catAxisCrossesAt + '"/>' : n += ' <c:crosses val="' + (t === "r" || t === "t" ? "max" : "autoZero") + '"/>', n += ' <c:crossBetween val="' + (e._type === re.SCATTER || Array.isArray(e._type) && e._type.filter((o) => o.type === re.AREA).length > 0 ? "midCat" : "between") + '"/>', e.valAxisMajorUnit && (n += ` <c:majorUnit val="${e.valAxisMajorUnit}"/>`), e.valAxisDisplayUnit && (n += `<c:dispUnits><c:builtInUnit val="${e.valAxisDisplayUnit}"/>${e.valAxisDisplayUnitLabel ? "<c:dispUnitsLbl/>" : ""}</c:dispUnits>`), n += "</c:valAx>", n;
}
function ho(e, r, t) {
  let s = "";
  return s += "<c:serAx>", s += '  <c:axId val="' + r + '"/>', s += '  <c:scaling><c:orientation val="' + (e.serAxisOrientation || (e.barDir === "col", "minMax")) + '"/></c:scaling>', s += '  <c:delete val="' + (e.serAxisHidden ? "1" : "0") + '"/>', s += '  <c:axPos val="' + (e.barDir === "col" ? "b" : "l") + '"/>', s += e.serGridLine.style !== "none" ? Ea(e.serGridLine) : "", e.showSerAxisTitle && (s += Mr({
    color: e.serAxisTitleColor,
    fontFace: e.serAxisTitleFontFace,
    fontSize: e.serAxisTitleFontSize,
    titleRotate: e.serAxisTitleRotate,
    title: e.serAxisTitle || "Axis Title"
  })), s += `  <c:numFmt formatCode="${fe(e.serLabelFormatCode) || "General"}" sourceLinked="0"/>`, s += '  <c:majorTickMark val="out"/>', s += '  <c:minorTickMark val="none"/>', s += `  <c:tickLblPos val="${e.serAxisLabelPos || e.barDir === "col" ? "low" : "nextTo"}"/>`, s += "  <c:spPr>", s += '    <a:ln w="12700" cap="flat">', s += e.serAxisLineShow ? `<a:solidFill>${be(e.serAxisLineColor || At.color)}</a:solidFill>` : "<a:noFill/>", s += '      <a:prstDash val="solid"/>', s += "      <a:round/>", s += "    </a:ln>", s += "  </c:spPr>", s += "  <c:txPr>", s += "    <a:bodyPr/>", s += "    <a:lstStyle/>", s += "    <a:p>", s += "    <a:pPr>", s += `    <a:defRPr sz="${Math.round((e.serAxisLabelFontSize || Ue) * 100)}" b="${e.serAxisLabelFontBold ? "1" : "0"}" i="${e.serAxisLabelFontItalic ? "1" : "0"}" u="none" strike="noStrike">`, s += `      <a:solidFill>${be(e.serAxisLabelColor || Ie)}</a:solidFill>`, s += `      <a:latin typeface="${e.serAxisLabelFontFace || "Arial"}"/>`, s += "   </a:defRPr>", s += "  </a:pPr>", s += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', s += "  </a:p>", s += " </c:txPr>", s += ' <c:crossAx val="' + t + '"/>', s += ' <c:crosses val="autoZero"/>', e.serAxisLabelFrequency && (s += ' <c:tickLblSkip val="' + e.serAxisLabelFrequency + '"/>'), e.serLabelFormatCode && (["serAxisBaseTimeUnit", "serAxisMajorTimeUnit", "serAxisMinorTimeUnit"].forEach((n) => {
    e[n] && (typeof e[n] != "string" || !["days", "months", "years"].includes(n.toLowerCase())) && (console.warn(`"${n}" must be one of: 'days','months','years' !`), e[n] = null);
  }), e.serAxisBaseTimeUnit && (s += ` <c:baseTimeUnit  val="${e.serAxisBaseTimeUnit.toLowerCase()}"/>`), e.serAxisMajorTimeUnit && (s += ` <c:majorTimeUnit val="${e.serAxisMajorTimeUnit.toLowerCase()}"/>`), e.serAxisMinorTimeUnit && (s += ` <c:minorTimeUnit val="${e.serAxisMinorTimeUnit.toLowerCase()}"/>`), e.serAxisMajorUnit && (s += ` <c:majorUnit val="${e.serAxisMajorUnit}"/>`), e.serAxisMinorUnit && (s += ` <c:minorUnit val="${e.serAxisMinorUnit}"/>`)), s += "</c:serAx>", s;
}
function Mr(e, r, t) {
  const s = e.titleAlign === "left" || e.titleAlign === "right" ? `<a:pPr algn="${e.titleAlign.substring(0, 1)}">` : "<a:pPr>", n = e.titleRotate ? `<a:bodyPr rot="${dt(e.titleRotate)}"/>` : "<a:bodyPr/>", o = e.fontSize ? `sz="${Math.round(e.fontSize * 100)}"` : "", l = e.titleBold ? 1 : 0;
  let A = "<c:layout/>";
  if (e.titlePos && typeof e.titlePos.x == "number" && typeof e.titlePos.y == "number") {
    const c = e.titlePos.x + r, a = e.titlePos.y + t;
    let i = c === 0 ? 0 : c * (c / 5) / 10;
    i >= 1 && (i = i / 10), i >= 0.1 && (i = i / 10);
    let f = a === 0 ? 0 : a * (a / 5) / 10;
    f >= 1 && (f = f / 10), f >= 0.1 && (f = f / 10), A = `<c:layout><c:manualLayout><c:xMode val="edge"/><c:yMode val="edge"/><c:x val="${i}"/><c:y val="${f}"/></c:manualLayout></c:layout>`;
  }
  return `<c:title>
      <c:tx>
        <c:rich>
          ${n}
          <a:lstStyle/>
          <a:p>
            ${s}
            <a:defRPr ${o} b="${l}" i="0" u="none" strike="noStrike">
              <a:solidFill>${be(e.color || Ie)}</a:solidFill>
              <a:latin typeface="${e.fontFace || "Arial"}"/>
            </a:defRPr>
          </a:pPr>
          <a:r>
            <a:rPr ${o} b="${l}" i="0" u="none" strike="noStrike">
              <a:solidFill>${be(e.color || Ie)}</a:solidFill>
              <a:latin typeface="${e.fontFace || "Arial"}"/>
            </a:rPr>
            <a:t>${fe(e.title) || ""}</a:t>
          </a:r>
        </a:p>
        </c:rich>
      </c:tx>
      ${A}
      <c:overlay val="0"/>
    </c:title>`;
}
function _e(e) {
  let r = "";
  const t = e - 1;
  return t <= 25 ? r = Lt[t] : r = `${Lt[Math.floor(t / Lt.length - 1)]}${Lt[t % Lt.length]}`, r;
}
function ot(e, r) {
  if (e) {
    if (typeof e != "object")
      return console.warn("`shadow` options must be an object. Ex: `{shadow: {type:'none'}}`"), "<a:effectLst/>";
  } else return "<a:effectLst/>";
  let t = "<a:effectLst>";
  const s = Object.assign(Object.assign({}, r), e), n = s.type || "outer", o = de(s.blur), l = de(s.offset), A = Math.round(s.angle * 6e4), c = s.color, a = Math.round(s.opacity * 1e5), i = s.rotateWithShape ? 1 : 0;
  return t += `<a:${n}Shdw sx="100000" sy="100000" kx="0" ky="0"  algn="bl" blurRad="${o}" rotWithShape="${i}" dist="${l}" dir="${A}">`, t += `<a:srgbClr val="${c}">`, t += `<a:alpha val="${a}"/></a:srgbClr>`, t += `</a:${n}Shdw>`, t += "</a:effectLst>", t;
}
function Ea(e) {
  let r = "<c:majorGridlines>";
  return r += " <c:spPr>", r += `  <a:ln w="${de(e.size || At.size)}" cap="${Pr(e.cap || At.cap)}">`, r += '  <a:solidFill><a:srgbClr val="' + (e.color || At.color) + '"/></a:solidFill>', r += '   <a:prstDash val="' + (e.style || At.style) + '"/><a:round/>', r += "  </a:ln>", r += " </c:spPr>", r += "</c:majorGridlines>", r;
}
function Pr(e) {
  if (!e || e === "flat")
    return "flat";
  if (e === "square")
    return "sq";
  if (e === "round")
    return "rnd";
  {
    const r = e;
    throw new Error(`Invalid chart line cap: ${r}`);
  }
}
function Yr(e) {
  var r, t;
  const s = typeof process < "u" && !!(!((r = process.versions) === null || r === void 0) && r.node) && ((t = process.release) === null || t === void 0 ? void 0 : t.name) === "node";
  let n, o;
  const l = s ? () => Oe(this, void 0, void 0, function* () {
    ({ default: n } = yield import("./__vite-browser-external.js")), { default: o } = yield import("./__vite-browser-external.js");
  }) : () => Oe(this, void 0, void 0, function* () {
  });
  s && l();
  const A = [], c = e._relsMedia.filter((i) => i.type !== "online" && !i.data && (!i.path || i.path && !i.path.includes("preencoded"))), a = [];
  return c.forEach((i) => {
    a.includes(i.path) ? i.isDuplicate = !0 : (i.isDuplicate = !1, a.push(i.path));
  }), c.filter((i) => !i.isDuplicate).forEach((i) => {
    A.push(Oe(this, void 0, void 0, function* () {
      if (o || (yield l()), s && n && i.path.indexOf("http") !== 0)
        try {
          const f = n.readFileSync(i.path);
          return i.data = Buffer.from(f).toString("base64"), c.filter((y) => y.isDuplicate && y.path === i.path).forEach((y) => y.data = i.data), "done";
        } catch (f) {
          throw i.data = bt, c.filter((y) => y.isDuplicate && y.path === i.path).forEach((y) => y.data = i.data), new Error(`ERROR: Unable to read media: "${i.path}"
${String(f)}`);
        }
      return s && o && i.path.startsWith("http") ? yield new Promise((f, y) => {
        o.get(i.path, (d) => {
          let m = "";
          d.setEncoding("binary"), d.on("data", (u) => m += u), d.on("end", () => {
            i.data = Buffer.from(m, "binary").toString("base64"), c.filter((u) => u.isDuplicate && u.path === i.path).forEach((u) => u.data = i.data), f("done");
          }), d.on("error", () => {
            i.data = bt, c.filter((u) => u.isDuplicate && u.path === i.path).forEach((u) => u.data = i.data), y(new Error(`ERROR! Unable to load image (https.get): ${i.path}`));
          });
        });
      }) : yield new Promise((f, y) => {
        const d = new XMLHttpRequest();
        d.onload = () => {
          const m = new FileReader();
          m.onloadend = () => {
            i.data = m.result, c.filter((u) => u.isDuplicate && u.path === i.path).forEach((u) => u.data = i.data), i.isSvgPng ? za(i).then(() => f("done")).catch(y) : f("done");
          }, m.readAsDataURL(d.response);
        }, d.onerror = () => {
          i.data = bt, c.filter((m) => m.isDuplicate && m.path === i.path).forEach((m) => m.data = i.data), y(new Error(`ERROR! Unable to load image (xhr.onerror): ${i.path}`));
        }, d.open("GET", i.path), d.responseType = "blob", d.send();
      });
    }));
  }), e._relsMedia.filter((i) => i.isSvgPng && i.data).forEach((i) => {
    Oe(this, void 0, void 0, function* () {
      s && !n && (yield l()), s && n ? (i.data = bt, A.push(Promise.resolve("done"))) : A.push(za(i));
    });
  }), A;
}
function za(e) {
  return Oe(this, void 0, void 0, function* () {
    return yield new Promise((r, t) => {
      const s = new Image();
      s.onload = () => {
        s.width + s.height === 0 && s.onerror("h/w=0");
        let n = document.createElement("CANVAS");
        const o = n.getContext("2d");
        n.width = s.width, n.height = s.height, o.drawImage(s, 0, 0);
        try {
          e.data = n.toDataURL(e.type), r("done");
        } catch (l) {
          s.onerror(l.toString());
        }
        n = null;
      }, s.onerror = () => {
        e.data = bt, t(new Error(`ERROR! Unable to load image (image.onerror): ${e.path}`));
      }, s.src = typeof e.data == "string" ? e.data : bt;
    });
  });
}
const po = {
  cover: function(e, r) {
    const t = e.h / e.w, n = r.h / r.w > t, o = n ? r.h / t : r.w, l = n ? r.h : r.w * t, A = Math.round(1e5 * 0.5 * (1 - r.w / o)), c = Math.round(1e5 * 0.5 * (1 - r.h / l));
    return `<a:srcRect l="${A}" r="${A}" t="${c}" b="${c}"/><a:stretch/>`;
  },
  contain: function(e, r) {
    const t = e.h / e.w, n = r.h / r.w > t, o = n ? r.w : r.h / t, l = n ? r.w * t : r.h, A = Math.round(1e5 * 0.5 * (1 - r.w / o)), c = Math.round(1e5 * 0.5 * (1 - r.h / l));
    return `<a:srcRect l="${A}" r="${A}" t="${c}" b="${c}"/><a:stretch/>`;
  },
  crop: function(e, r) {
    const t = r.x, s = e.w - (r.x + r.w), n = r.y, o = e.h - (r.y + r.h), l = Math.round(1e5 * (t / e.w)), A = Math.round(1e5 * (s / e.w)), c = Math.round(1e5 * (n / e.h)), a = Math.round(1e5 * (o / e.h));
    return `<a:srcRect l="${l}" r="${A}" t="${c}" b="${a}"/><a:stretch/>`;
  }
};
function Ta(e) {
  var r;
  let t = e._name ? '<p:cSld name="' + e._name + '">' : "<p:cSld>", s = 1;
  return e._bkgdImgRid ? t += `<p:bg><p:bgPr><a:blipFill dpi="0" rotWithShape="1"><a:blip r:embed="rId${e._bkgdImgRid}"><a:lum/></a:blip><a:srcRect/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:effectLst/></p:bgPr></p:bg>` : !((r = e.background) === null || r === void 0) && r.color ? t += `<p:bg><p:bgPr>${$e(e.background)}</p:bgPr></p:bg>` : !e.bkgd && e._name && e._name === ua && (t += '<p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>'), t += "<p:spTree>", t += '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>', t += '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>', t += '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>', e._slideObjects.forEach((n, o) => {
    var l, A, c, a, i, f, y, d;
    let m = 0, u = 0, g = pe("75%", "X", e._presLayout), p = 0, h, _ = "", E = null, v = null, C = 0, x = 0, P = null, R = null;
    const k = (l = n.options) === null || l === void 0 ? void 0 : l.sizing, O = (A = n.options) === null || A === void 0 ? void 0 : A.rounding;
    e._slideLayout !== void 0 && e._slideLayout._slideObjects !== void 0 && n.options && n.options.placeholder && (h = e._slideLayout._slideObjects.filter((w) => w.options.placeholder === n.options.placeholder)[0]), n.options = n.options || {}, typeof n.options.x < "u" && (m = pe(n.options.x, "X", e._presLayout)), typeof n.options.y < "u" && (u = pe(n.options.y, "Y", e._presLayout)), typeof n.options.w < "u" && (g = pe(n.options.w, "X", e._presLayout)), typeof n.options.h < "u" && (p = pe(n.options.h, "Y", e._presLayout));
    let T = g, M = p;
    switch (h && ((h.options.x || h.options.x === 0) && (m = pe(h.options.x, "X", e._presLayout)), (h.options.y || h.options.y === 0) && (u = pe(h.options.y, "Y", e._presLayout)), (h.options.w || h.options.w === 0) && (g = pe(h.options.w, "X", e._presLayout)), (h.options.h || h.options.h === 0) && (p = pe(h.options.h, "Y", e._presLayout))), n.options.flipH && (_ += ' flipH="1"'), n.options.flipV && (_ += ' flipV="1"'), n.options.rotate && (_ += ` rot="${dt(n.options.rotate)}"`), n._type) {
      case ue.table:
        if (E = n.arrTabRows, v = n.options, C = 0, x = 0, E[0].forEach((w) => {
          P = w.options || null, C += P?.colspan ? Number(P.colspan) : 1;
        }), R = `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${s * e._slideNum + 1}" name="${n.options.objectName}"/>`, R += '<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>  <p:nvPr><p:extLst><p:ext uri="{D42A27DB-BD31-4B8C-83A1-F6EECF244321}"><p14:modId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1579011935"/></p:ext></p:extLst></p:nvPr></p:nvGraphicFramePr>', R += `<p:xfrm><a:off x="${m || (m === 0 ? 0 : he)}" y="${u || (u === 0 ? 0 : he)}"/><a:ext cx="${g || (g === 0 ? 0 : he)}" cy="${p || he}"/></p:xfrm>`, R += '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr/>', Array.isArray(v.colW)) {
          R += "<a:tblGrid>";
          for (let w = 0; w < C; w++) {
            let G = ve(v.colW[w]);
            (G == null || isNaN(G)) && (G = (typeof n.options.w == "number" ? n.options.w : 1) / C), R += `<a:gridCol w="${Math.round(G)}"/>`;
          }
          R += "</a:tblGrid>";
        } else {
          x = v.colW ? v.colW : he, n.options.w && !v.colW && (x = Math.round((typeof n.options.w == "number" ? n.options.w : 1) / C)), R += "<a:tblGrid>";
          for (let w = 0; w < C; w++)
            R += `<a:gridCol w="${x}"/>`;
          R += "</a:tblGrid>";
        }
        E.forEach((w) => {
          var G, ee;
          for (let Y = 0; Y < w.length; ) {
            const ne = w[Y], Z = (G = ne.options) === null || G === void 0 ? void 0 : G.colspan, Q = (ee = ne.options) === null || ee === void 0 ? void 0 : ee.rowspan;
            if (Z && Z > 1) {
              const D = new Array(Z - 1).fill(void 0).map(() => ({ _type: ue.tablecell, options: { rowspan: Q }, _hmerge: !0 }));
              w.splice(Y + 1, 0, ...D), Y += Z;
            } else
              Y += 1;
          }
        }), E.forEach((w, G) => {
          const ee = E[G + 1];
          ee && w.forEach((Y, ne) => {
            var Z, Q;
            const D = Y._rowContinue || ((Z = Y.options) === null || Z === void 0 ? void 0 : Z.rowspan), F = (Q = Y.options) === null || Q === void 0 ? void 0 : Q.colspan, $ = Y._hmerge;
            if (D && D > 1) {
              const L = { _type: ue.tablecell, options: { colspan: F }, _rowContinue: D - 1, _vmerge: !0, _hmerge: $ };
              ee.splice(ne, 0, L);
            }
          });
        }), E.forEach((w, G) => {
          let ee = 0;
          Array.isArray(v.rowH) && v.rowH[G] ? ee = ve(Number(v.rowH[G])) : v.rowH && !isNaN(Number(v.rowH)) ? ee = ve(Number(v.rowH)) : (n.options.cy || n.options.h) && (ee = Math.round((n.options.h ? ve(n.options.h) : typeof n.options.cy == "number" ? n.options.cy : 1) / E.length)), R += `<a:tr h="${ee}">`, w.forEach((Y) => {
            var ne, Z, Q, D, F;
            const $ = Y, L = {
              rowSpan: ((ne = $.options) === null || ne === void 0 ? void 0 : ne.rowspan) > 1 ? $.options.rowspan : void 0,
              gridSpan: ((Z = $.options) === null || Z === void 0 ? void 0 : Z.colspan) > 1 ? $.options.colspan : void 0,
              vMerge: $._vmerge ? 1 : void 0,
              hMerge: $._hmerge ? 1 : void 0
            };
            let N = Object.keys(L).map((j) => [j, L[j]]).filter(([, j]) => !!j).map(([j, b]) => `${String(j)}="${String(b)}"`).join(" ");
            if (N && (N = " " + N), $._hmerge || $._vmerge) {
              R += `<a:tc${N}><a:tcPr/></a:tc>`;
              return;
            }
            const V = $.options || {};
            $.options = V, ["align", "bold", "border", "color", "fill", "fontFace", "fontSize", "margin", "textDirection", "underline", "valign"].forEach((j) => {
              v[j] && !V[j] && V[j] !== 0 && (V[j] = v[j]);
            });
            const oe = V.valign ? ` anchor="${V.valign.replace(/^c$/i, "ctr").replace(/^m$/i, "ctr").replace("center", "ctr").replace("middle", "ctr").replace("top", "t").replace("btm", "b").replace("bottom", "b")}"` : "", ae = V.textDirection && V.textDirection !== "horz" ? ` vert="${V.textDirection}"` : "";
            let le = !((D = (Q = $._optImp) === null || Q === void 0 ? void 0 : Q.fill) === null || D === void 0) && D.color ? $._optImp.fill.color : !((F = $._optImp) === null || F === void 0) && F.fill && typeof $._optImp.fill == "string" ? $._optImp.fill : "";
            le = le || V.fill ? V.fill : "";
            const Ae = le ? $e(le) : "";
            let z = V.margin === 0 || V.margin ? V.margin : hi;
            !Array.isArray(z) && typeof z == "number" && (z = [z, z, z, z]);
            let q = "";
            z[0] >= 1 ? q = ` marL="${de(z[3])}" marR="${de(z[1])}" marT="${de(z[0])}" marB="${de(z[2])}"` : q = ` marL="${ve(z[3])}" marR="${ve(z[1])}" marT="${ve(z[0])}" marB="${ve(z[2])}"`, R += `<a:tc${N}>${Ga($)}<a:tcPr${q}${oe}${ae}>`, V.border && Array.isArray(V.border) && [
              { idx: 3, name: "lnL" },
              { idx: 1, name: "lnR" },
              { idx: 0, name: "lnT" },
              { idx: 2, name: "lnB" }
            ].forEach((j) => {
              V.border[j.idx].type !== "none" ? (R += `<a:${j.name} w="${de(V.border[j.idx].pt)}" cap="flat" cmpd="sng" algn="ctr">`, R += `<a:solidFill>${be(V.border[j.idx].color)}</a:solidFill>`, R += `<a:prstDash val="${V.border[j.idx].type === "dash" ? "sysDash" : "solid"}"/><a:round/><a:headEnd type="none" w="med" len="med"/><a:tailEnd type="none" w="med" len="med"/>`, R += `</a:${j.name}>`) : R += `<a:${j.name} w="0" cap="flat" cmpd="sng" algn="ctr"><a:noFill/></a:${j.name}>`;
            }), R += Ae, R += "  </a:tcPr>", R += " </a:tc>";
          }), R += "</a:tr>";
        }), R += "      </a:tbl>", R += "    </a:graphicData>", R += "  </a:graphic>", R += "</p:graphicFrame>", t += R, s++;
        break;
      case ue.text:
      case ue.placeholder:
        if (!n.options.line && p === 0 && (p = he * 0.3), n.options._bodyProp || (n.options._bodyProp = {}), n.options.margin && Array.isArray(n.options.margin) ? (n.options._bodyProp.lIns = de(n.options.margin[0] || 0), n.options._bodyProp.rIns = de(n.options.margin[1] || 0), n.options._bodyProp.bIns = de(n.options.margin[2] || 0), n.options._bodyProp.tIns = de(n.options.margin[3] || 0)) : typeof n.options.margin == "number" && (n.options._bodyProp.lIns = de(n.options.margin), n.options._bodyProp.rIns = de(n.options.margin), n.options._bodyProp.bIns = de(n.options.margin), n.options._bodyProp.tIns = de(n.options.margin)), t += "<p:sp>", t += `<p:nvSpPr><p:cNvPr id="${o + 2}" name="${n.options.objectName}">`, !((c = n.options.hyperlink) === null || c === void 0) && c.url && (t += `<a:hlinkClick r:id="rId${n.options.hyperlink._rId}" tooltip="${n.options.hyperlink.tooltip ? fe(n.options.hyperlink.tooltip) : ""}"/>`), !((a = n.options.hyperlink) === null || a === void 0) && a.slide && (t += `<a:hlinkClick r:id="rId${n.options.hyperlink._rId}" tooltip="${n.options.hyperlink.tooltip ? fe(n.options.hyperlink.tooltip) : ""}" action="ppaction://hlinksldjump"/>`), t += "</p:cNvPr>", t += "<p:cNvSpPr" + (!((i = n.options) === null || i === void 0) && i.isTextBox ? ' txBox="1"/>' : "/>"), t += `<p:nvPr>${n._type === "placeholder" ? Gt(n) : Gt(h)}</p:nvPr>`, t += "</p:nvSpPr><p:spPr>", t += `<a:xfrm${_}>`, t += `<a:off x="${m}" y="${u}"/>`, t += `<a:ext cx="${g}" cy="${p}"/></a:xfrm>`, n.shape === "custGeom")
          t += "<a:custGeom><a:avLst />", t += "<a:gdLst>", t += "</a:gdLst>", t += "<a:ahLst />", t += "<a:cxnLst>", t += "</a:cxnLst>", t += '<a:rect l="l" t="t" r="r" b="b" />', t += "<a:pathLst>", t += `<a:path w="${g}" h="${p}">`, (f = n.options.points) === null || f === void 0 || f.forEach((w, G) => {
            if ("curve" in w)
              switch (w.curve.type) {
                case "arc":
                  t += `<a:arcTo hR="${pe(w.curve.hR, "Y", e._presLayout)}" wR="${pe(w.curve.wR, "X", e._presLayout)}" stAng="${dt(w.curve.stAng)}" swAng="${dt(w.curve.swAng)}" />`;
                  break;
                case "cubic":
                  t += `<a:cubicBezTo>
									<a:pt x="${pe(w.curve.x1, "X", e._presLayout)}" y="${pe(w.curve.y1, "Y", e._presLayout)}" />
									<a:pt x="${pe(w.curve.x2, "X", e._presLayout)}" y="${pe(w.curve.y2, "Y", e._presLayout)}" />
									<a:pt x="${pe(w.x, "X", e._presLayout)}" y="${pe(w.y, "Y", e._presLayout)}" />
									</a:cubicBezTo>`;
                  break;
                case "quadratic":
                  t += `<a:quadBezTo>
									<a:pt x="${pe(w.curve.x1, "X", e._presLayout)}" y="${pe(w.curve.y1, "Y", e._presLayout)}" />
									<a:pt x="${pe(w.x, "X", e._presLayout)}" y="${pe(w.y, "Y", e._presLayout)}" />
									</a:quadBezTo>`;
                  break;
              }
            else "close" in w ? t += "<a:close />" : w.moveTo || G === 0 ? t += `<a:moveTo><a:pt x="${pe(w.x, "X", e._presLayout)}" y="${pe(w.y, "Y", e._presLayout)}" /></a:moveTo>` : t += `<a:lnTo><a:pt x="${pe(w.x, "X", e._presLayout)}" y="${pe(w.y, "Y", e._presLayout)}" /></a:lnTo>`;
          }), t += "</a:path>", t += "</a:pathLst>", t += "</a:custGeom>";
        else {
          if (t += '<a:prstGeom prst="' + n.shape + '"><a:avLst>', n.options.rectRadius)
            t += `<a:gd name="adj" fmla="val ${Math.round(n.options.rectRadius * he * 1e5 / Math.min(g, p))}"/>`;
          else if (n.options.angleRange) {
            for (let w = 0; w < 2; w++) {
              const G = n.options.angleRange[w];
              t += `<a:gd name="adj${w + 1}" fmla="val ${dt(G)}" />`;
            }
            n.options.arcThicknessRatio && (t += `<a:gd name="adj3" fmla="val ${Math.round(n.options.arcThicknessRatio * 5e4)}" />`);
          }
          t += "</a:avLst></a:prstGeom>";
        }
        t += n.options.fill ? $e(n.options.fill) : "<a:noFill/>", n.options.line && (t += n.options.line.width ? `<a:ln w="${de(n.options.line.width)}">` : "<a:ln>", n.options.line.color && (t += $e(n.options.line)), n.options.line.dashType && (t += `<a:prstDash val="${n.options.line.dashType}"/>`), n.options.line.beginArrowType && (t += `<a:headEnd type="${n.options.line.beginArrowType}"/>`), n.options.line.endArrowType && (t += `<a:tailEnd type="${n.options.line.endArrowType}"/>`), t += "</a:ln>"), n.options.shadow && n.options.shadow.type !== "none" && (n.options.shadow.type = n.options.shadow.type || "outer", n.options.shadow.blur = de(n.options.shadow.blur || 8), n.options.shadow.offset = de(n.options.shadow.offset || 4), n.options.shadow.angle = Math.round((n.options.shadow.angle || 270) * 6e4), n.options.shadow.opacity = Math.round((n.options.shadow.opacity || 0.75) * 1e5), n.options.shadow.color = n.options.shadow.color || Oa.color, t += "<a:effectLst>", t += ` <a:${n.options.shadow.type}Shdw ${n.options.shadow.type === "outer" ? 'sx="100000" sy="100000" kx="0" ky="0" algn="bl" rotWithShape="0"' : ""} blurRad="${n.options.shadow.blur}" dist="${n.options.shadow.offset}" dir="${n.options.shadow.angle}">`, t += ` <a:srgbClr val="${n.options.shadow.color}">`, t += ` <a:alpha val="${n.options.shadow.opacity}"/></a:srgbClr>`, t += " </a:outerShdw>", t += "</a:effectLst>"), t += "</p:spPr>", t += Ga(n), t += "</p:sp>";
        break;
      case ue.image:
        if (t += "<p:pic>", t += "  <p:nvPicPr>", t += `<p:cNvPr id="${o + 2}" name="${n.options.objectName}" descr="${fe(n.options.altText || n.image)}">`, !((y = n.hyperlink) === null || y === void 0) && y.url && (t += `<a:hlinkClick r:id="rId${n.hyperlink._rId}" tooltip="${n.hyperlink.tooltip ? fe(n.hyperlink.tooltip) : ""}"/>`), !((d = n.hyperlink) === null || d === void 0) && d.slide && (t += `<a:hlinkClick r:id="rId${n.hyperlink._rId}" tooltip="${n.hyperlink.tooltip ? fe(n.hyperlink.tooltip) : ""}" action="ppaction://hlinksldjump"/>`), t += "    </p:cNvPr>", t += '    <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>', t += "    <p:nvPr>" + Gt(h) + "</p:nvPr>", t += "  </p:nvPicPr>", t += "<p:blipFill>", (e._relsMedia || []).filter((w) => w.rId === n.imageRid)[0] && (e._relsMedia || []).filter((w) => w.rId === n.imageRid)[0].extn === "svg" ? (t += `<a:blip r:embed="rId${n.imageRid - 1}">`, t += n.options.transparency ? ` <a:alphaModFix amt="${Math.round((100 - n.options.transparency) * 1e3)}"/>` : "", t += " <a:extLst>", t += '  <a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}">', t += `   <asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main" r:embed="rId${n.imageRid}"/>`, t += "  </a:ext>", t += " </a:extLst>", t += "</a:blip>") : (t += `<a:blip r:embed="rId${n.imageRid}">`, t += n.options.transparency ? `<a:alphaModFix amt="${Math.round((100 - n.options.transparency) * 1e3)}"/>` : "", t += "</a:blip>"), k?.type) {
          const w = k.w ? pe(k.w, "X", e._presLayout) : g, G = k.h ? pe(k.h, "Y", e._presLayout) : p, ee = pe(k.x || 0, "X", e._presLayout), Y = pe(k.y || 0, "Y", e._presLayout);
          t += po[k.type]({ w: T, h: M }, { w, h: G, x: ee, y: Y }), T = w, M = G;
        } else
          t += "  <a:stretch><a:fillRect/></a:stretch>";
        t += "</p:blipFill>", t += "<p:spPr>", t += " <a:xfrm" + _ + ">", t += `  <a:off x="${m}" y="${u}"/>`, t += `  <a:ext cx="${T}" cy="${M}"/>`, t += " </a:xfrm>", t += ` <a:prstGeom prst="${O ? "ellipse" : "rect"}"><a:avLst/></a:prstGeom>`, n.options.shadow && n.options.shadow.type !== "none" && (n.options.shadow.type = n.options.shadow.type || "outer", n.options.shadow.blur = de(n.options.shadow.blur || 8), n.options.shadow.offset = de(n.options.shadow.offset || 4), n.options.shadow.angle = Math.round((n.options.shadow.angle || 270) * 6e4), n.options.shadow.opacity = Math.round((n.options.shadow.opacity || 0.75) * 1e5), n.options.shadow.color = n.options.shadow.color || Oa.color, t += "<a:effectLst>", t += `<a:${n.options.shadow.type}Shdw ${n.options.shadow.type === "outer" ? 'sx="100000" sy="100000" kx="0" ky="0" algn="bl" rotWithShape="0"' : ""} blurRad="${n.options.shadow.blur}" dist="${n.options.shadow.offset}" dir="${n.options.shadow.angle}">`, t += `<a:srgbClr val="${n.options.shadow.color}">`, t += `<a:alpha val="${n.options.shadow.opacity}"/></a:srgbClr>`, t += `</a:${n.options.shadow.type}Shdw>`, t += "</a:effectLst>"), t += "</p:spPr>", t += "</p:pic>";
        break;
      case ue.media:
        n.mtype === "online" ? (t += "<p:pic>", t += " <p:nvPicPr>", t += `<p:cNvPr id="${n.mediaRid + 2}" name="${n.options.objectName}"/>`, t += " <p:cNvPicPr/>", t += " <p:nvPr>", t += `  <a:videoFile r:link="rId${n.mediaRid}"/>`, t += " </p:nvPr>", t += " </p:nvPicPr>", t += ` <p:blipFill><a:blip r:embed="rId${n.mediaRid + 1}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>`, t += " <p:spPr>", t += `  <a:xfrm${_}><a:off x="${m}" y="${u}"/><a:ext cx="${g}" cy="${p}"/></a:xfrm>`, t += '  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>', t += " </p:spPr>", t += "</p:pic>") : (t += "<p:pic>", t += " <p:nvPicPr>", t += `<p:cNvPr id="${n.mediaRid + 2}" name="${n.options.objectName}"><a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr>`, t += ' <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>', t += " <p:nvPr>", t += `  <a:videoFile r:link="rId${n.mediaRid}"/>`, t += "  <p:extLst>", t += '   <p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}">', t += `    <p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="rId${n.mediaRid + 1}"/>`, t += "   </p:ext>", t += "  </p:extLst>", t += " </p:nvPr>", t += " </p:nvPicPr>", t += ` <p:blipFill><a:blip r:embed="rId${n.mediaRid + 2}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>`, t += " <p:spPr>", t += `  <a:xfrm${_}><a:off x="${m}" y="${u}"/><a:ext cx="${g}" cy="${p}"/></a:xfrm>`, t += '  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>', t += " </p:spPr>", t += "</p:pic>");
        break;
      case ue.chart:
        t += "<p:graphicFrame>", t += " <p:nvGraphicFramePr>", t += `   <p:cNvPr id="${o + 2}" name="${n.options.objectName}" descr="${fe(n.options.altText || "")}"/>`, t += "   <p:cNvGraphicFramePr/>", t += `   <p:nvPr>${Gt(h)}</p:nvPr>`, t += " </p:nvGraphicFramePr>", t += ` <p:xfrm><a:off x="${m}" y="${u}"/><a:ext cx="${g}" cy="${p}"/></p:xfrm>`, t += ' <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">', t += '  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">', t += `   <c:chart r:id="rId${n.chartRid}" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"/>`, t += "  </a:graphicData>", t += " </a:graphic>", t += "</p:graphicFrame>";
        break;
      default:
        t += "";
        break;
    }
  }), e._slideNumberProps && (e._slideNumberProps.align || (e._slideNumberProps.align = "left"), t += "<p:sp>", t += " <p:nvSpPr>", t += '  <p:cNvPr id="25" name="Slide Number Placeholder 0"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>', t += '  <p:nvPr><p:ph type="sldNum" sz="quarter" idx="4294967295"/></p:nvPr>', t += " </p:nvSpPr>", t += " <p:spPr>", t += `<a:xfrm><a:off x="${pe(e._slideNumberProps.x, "X", e._presLayout)}" y="${pe(e._slideNumberProps.y, "Y", e._presLayout)}"/><a:ext cx="${e._slideNumberProps.w ? pe(e._slideNumberProps.w, "X", e._presLayout) : "800000"}" cy="${e._slideNumberProps.h ? pe(e._slideNumberProps.h, "Y", e._presLayout) : "300000"}"/></a:xfrm> <a:prstGeom prst="rect"><a:avLst/></a:prstGeom> <a:extLst><a:ext uri="{C572A759-6A51-4108-AA02-DFA0A04FC94B}"><ma14:wrappingTextBoxFlag val="0" xmlns:ma14="http://schemas.microsoft.com/office/mac/drawingml/2011/main"/></a:ext></a:extLst></p:spPr>`, t += "<p:txBody>", t += "<a:bodyPr", e._slideNumberProps.margin && Array.isArray(e._slideNumberProps.margin) ? (t += ` lIns="${de(e._slideNumberProps.margin[3] || 0)}"`, t += ` tIns="${de(e._slideNumberProps.margin[0] || 0)}"`, t += ` rIns="${de(e._slideNumberProps.margin[1] || 0)}"`, t += ` bIns="${de(e._slideNumberProps.margin[2] || 0)}"`) : typeof e._slideNumberProps.margin == "number" && (t += ` lIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` tIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` rIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` bIns="${de(e._slideNumberProps.margin || 0)}"`), e._slideNumberProps.valign && (t += ` anchor="${e._slideNumberProps.valign.replace("top", "t").replace("middle", "ctr").replace("bottom", "b")}"`), t += "/>", t += "  <a:lstStyle><a:lvl1pPr>", (e._slideNumberProps.fontFace || e._slideNumberProps.fontSize || e._slideNumberProps.color) && (t += `<a:defRPr sz="${Math.round((e._slideNumberProps.fontSize || 12) * 100)}">`, e._slideNumberProps.color && (t += $e(e._slideNumberProps.color)), e._slideNumberProps.fontFace && (t += `<a:latin typeface="${e._slideNumberProps.fontFace}"/><a:ea typeface="${e._slideNumberProps.fontFace}"/><a:cs typeface="${e._slideNumberProps.fontFace}"/>`), t += "</a:defRPr>"), t += "</a:lvl1pPr></a:lstStyle>", t += "<a:p>", e._slideNumberProps.align.startsWith("l") ? t += '<a:pPr algn="l"/>' : e._slideNumberProps.align.startsWith("c") ? t += '<a:pPr algn="ctr"/>' : e._slideNumberProps.align.startsWith("r") ? t += '<a:pPr algn="r"/>' : t += '<a:pPr algn="l"/>', t += `<a:fld id="${gi}" type="slidenum"><a:rPr b="${e._slideNumberProps.bold ? 1 : 0}" lang="en-US"/>`, t += `<a:t>${e._slideNum}</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p>`, t += "</p:txBody></p:sp>"), t += "</p:spTree>", t += "</p:cSld>", t;
}
function La(e, r) {
  let t = 0, s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  return e._rels.forEach((n) => {
    t = Math.max(t, n.rId), n.type.toLowerCase().includes("hyperlink") ? n.data === "slide" ? s += `<Relationship Id="rId${n.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide${n.Target}.xml"/>` : s += `<Relationship Id="rId${n.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${n.Target}" TargetMode="External"/>` : n.type.toLowerCase().includes("notesSlide") && (s += `<Relationship Id="rId${n.rId}" Target="${n.Target}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"/>`);
  }), (e._relsChart || []).forEach((n) => {
    t = Math.max(t, n.rId), s += `<Relationship Id="rId${n.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="${n.Target}"/>`;
  }), (e._relsMedia || []).forEach((n) => {
    const o = n.rId.toString();
    t = Math.max(t, n.rId), n.type.toLowerCase().includes("image") ? s += '<Relationship Id="rId' + o + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="' + n.Target + '"/>' : n.type.toLowerCase().includes("audio") ? s.includes(' Target="' + n.Target + '"') ? s += '<Relationship Id="rId' + o + '" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="' + n.Target + '"/>' : s += '<Relationship Id="rId' + o + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="' + n.Target + '"/>' : n.type.toLowerCase().includes("video") ? s.includes(' Target="' + n.Target + '"') ? s += '<Relationship Id="rId' + o + '" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="' + n.Target + '"/>' : s += '<Relationship Id="rId' + o + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video" Target="' + n.Target + '"/>' : n.type.toLowerCase().includes("online") && (s.includes(' Target="' + n.Target + '"') ? s += '<Relationship Id="rId' + o + '" Type="http://schemas.microsoft.com/office/2007/relationships/image" Target="' + n.Target + '"/>' : s += '<Relationship Id="rId' + o + '" Target="' + n.Target + '" TargetMode="External" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video"/>');
  }), r.forEach((n, o) => {
    s += `<Relationship Id="rId${t + o + 1}" Type="${n.type}" Target="${n.target}"/>`;
  }), s += "</Relationships>", s;
}
function Ua(e, r) {
  var t, s;
  let n = "", o = "", l = "", A = "";
  const c = r ? "a:lvl1pPr" : "a:pPr";
  let a = de(Yi), i = `<${c}${e.options.rtlMode ? ' rtl="1" ' : ""}`;
  {
    if (e.options.align)
      switch (e.options.align) {
        case "left":
          i += ' algn="l"';
          break;
        case "right":
          i += ' algn="r"';
          break;
        case "center":
          i += ' algn="ctr"';
          break;
        case "justify":
          i += ' algn="just"';
          break;
        default:
          i += "";
          break;
      }
    if (e.options.lineSpacing ? o = `<a:lnSpc><a:spcPts val="${Math.round(e.options.lineSpacing * 100)}"/></a:lnSpc>` : e.options.lineSpacingMultiple && (o = `<a:lnSpc><a:spcPct val="${Math.round(e.options.lineSpacingMultiple * 1e5)}"/></a:lnSpc>`), e.options.indentLevel && !isNaN(Number(e.options.indentLevel)) && e.options.indentLevel > 0 && (i += ` lvl="${e.options.indentLevel}"`), e.options.paraSpaceBefore && !isNaN(Number(e.options.paraSpaceBefore)) && e.options.paraSpaceBefore > 0 && (l += `<a:spcBef><a:spcPts val="${Math.round(e.options.paraSpaceBefore * 100)}"/></a:spcBef>`), e.options.paraSpaceAfter && !isNaN(Number(e.options.paraSpaceAfter)) && e.options.paraSpaceAfter > 0 && (l += `<a:spcAft><a:spcPts val="${Math.round(e.options.paraSpaceAfter * 100)}"/></a:spcAft>`), typeof e.options.bullet == "object")
      if (!((s = (t = e?.options) === null || t === void 0 ? void 0 : t.bullet) === null || s === void 0) && s.indent && (a = de(e.options.bullet.indent)), e.options.bullet.type)
        e.options.bullet.type.toString().toLowerCase() === "number" && (i += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? a + a * e.options.indentLevel : a}" indent="-${a}"`, n = `<a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum type="${e.options.bullet.style || "arabicPeriod"}" startAt="${e.options.bullet.numberStartAt || e.options.bullet.startAt || "1"}"/>`);
      else if (e.options.bullet.characterCode) {
        let f = `&#x${e.options.bullet.characterCode};`;
        /^[0-9A-Fa-f]{4}$/.test(e.options.bullet.characterCode) || (console.warn("Warning: `bullet.characterCode should be a 4-digit unicode charatcer (ex: 22AB)`!"), f = vt.DEFAULT), i += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? a + a * e.options.indentLevel : a}" indent="-${a}"`, n = '<a:buSzPct val="100000"/><a:buChar char="' + f + '"/>';
      } else if (e.options.bullet.code) {
        let f = `&#x${e.options.bullet.code};`;
        /^[0-9A-Fa-f]{4}$/.test(e.options.bullet.code) || (console.warn("Warning: `bullet.code should be a 4-digit hex code (ex: 22AB)`!"), f = vt.DEFAULT), i += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? a + a * e.options.indentLevel : a}" indent="-${a}"`, n = '<a:buSzPct val="100000"/><a:buChar char="' + f + '"/>';
      } else
        i += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? a + a * e.options.indentLevel : a}" indent="-${a}"`, n = `<a:buSzPct val="100000"/><a:buChar char="${vt.DEFAULT}"/>`;
    else e.options.bullet ? (i += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? a + a * e.options.indentLevel : a}" indent="-${a}"`, n = `<a:buSzPct val="100000"/><a:buChar char="${vt.DEFAULT}"/>`) : e.options.bullet || (i += ' indent="0" marL="0"', n = "<a:buNone/>");
    e.options.tabStops && Array.isArray(e.options.tabStops) && (A = `<a:tabLst>${e.options.tabStops.map((y) => `<a:tab pos="${ve(y.position || 1)}" algn="${y.alignment || "l"}"/>`).join("")}</a:tabLst>`), i += ">" + o + l + n + A, r && (i += _i(e.options, !0)), i += "</" + c + ">";
  }
  return i;
}
function _i(e, r) {
  var t;
  let s = "";
  const n = r ? "a:defRPr" : "a:rPr";
  if (s += "<" + n + ' lang="' + (e.lang ? e.lang : "en-US") + '"' + (e.lang ? ' altLang="en-US"' : ""), s += e.fontSize ? ` sz="${Math.round(e.fontSize * 100)}"` : "", s += e?.bold ? ` b="${e.bold ? "1" : "0"}"` : "", s += e?.italic ? ` i="${e.italic ? "1" : "0"}"` : "", s += e?.strike ? ` strike="${typeof e.strike == "string" ? e.strike : "sngStrike"}"` : "", typeof e.underline == "object" && (!((t = e.underline) === null || t === void 0) && t.style) ? s += ` u="${e.underline.style}"` : typeof e.underline == "string" ? s += ` u="${String(e.underline)}"` : e.hyperlink && (s += ' u="sng"'), e.baseline ? s += ` baseline="${Math.round(e.baseline * 50)}"` : e.subscript ? s += ' baseline="-40000"' : e.superscript && (s += ' baseline="30000"'), s += e.charSpacing ? ` spc="${Math.round(e.charSpacing * 100)}" kern="0"` : "", s += ' dirty="0">', (e.color || e.fontFace || e.outline || typeof e.underline == "object" && e.underline.color) && (e.outline && typeof e.outline == "object" && (s += `<a:ln w="${de(e.outline.size || 0.75)}">${$e(e.outline.color || "FFFFFF")}</a:ln>`), e.color && (s += $e({ color: e.color, transparency: e.transparency })), e.highlight && (s += `<a:highlight>${be(e.highlight)}</a:highlight>`), typeof e.underline == "object" && e.underline.color && (s += `<a:uFill>${$e(e.underline.color)}</a:uFill>`), e.glow && (s += `<a:effectLst>${to(e.glow, Ji)}</a:effectLst>`), e.fontFace && (s += `<a:latin typeface="${e.fontFace}" pitchFamily="34" charset="0"/><a:ea typeface="${e.fontFace}" pitchFamily="34" charset="-122"/><a:cs typeface="${e.fontFace}" pitchFamily="34" charset="-120"/>`)), e.hyperlink) {
    if (typeof e.hyperlink != "object")
      throw new Error("ERROR: text `hyperlink` option should be an object. Ex: `hyperlink:{url:'https://github.com'}` ");
    if (!e.hyperlink.url && !e.hyperlink.slide)
      throw new Error("ERROR: 'hyperlink requires either `url` or `slide`'");
    e.hyperlink.url ? s += `<a:hlinkClick r:id="rId${e.hyperlink._rId}" invalidUrl="" action="" tgtFrame="" tooltip="${e.hyperlink.tooltip ? fe(e.hyperlink.tooltip) : ""}" history="1" highlightClick="0" endSnd="0"${e.color ? ">" : "/>"}` : e.hyperlink.slide && (s += `<a:hlinkClick r:id="rId${e.hyperlink._rId}" action="ppaction://hlinksldjump" tooltip="${e.hyperlink.tooltip ? fe(e.hyperlink.tooltip) : ""}"${e.color ? ">" : "/>"}`), e.color && (s += " <a:extLst>", s += '  <a:ext uri="{A12FA001-AC4F-418D-AE19-62706E023703}">', s += '   <ahyp:hlinkClr xmlns:ahyp="http://schemas.microsoft.com/office/drawing/2018/hyperlinkcolor" val="tx"/>', s += "  </a:ext>", s += " </a:extLst>", s += "</a:hlinkClick>");
  }
  return s += `</${n}>`, s;
}
function mo(e) {
  return e.text ? `<a:r>${_i(e.options, !1)}<a:t>${fe(e.text)}</a:t></a:r>` : "";
}
function go(e) {
  let r = "<a:bodyPr";
  return e && e._type === ue.text && e.options._bodyProp ? (r += e.options._bodyProp.wrap ? ' wrap="square"' : ' wrap="none"', (e.options._bodyProp.lIns || e.options._bodyProp.lIns === 0) && (r += ` lIns="${e.options._bodyProp.lIns}"`), (e.options._bodyProp.tIns || e.options._bodyProp.tIns === 0) && (r += ` tIns="${e.options._bodyProp.tIns}"`), (e.options._bodyProp.rIns || e.options._bodyProp.rIns === 0) && (r += ` rIns="${e.options._bodyProp.rIns}"`), (e.options._bodyProp.bIns || e.options._bodyProp.bIns === 0) && (r += ` bIns="${e.options._bodyProp.bIns}"`), r += ' rtlCol="0"', e.options._bodyProp.anchor && (r += ' anchor="' + e.options._bodyProp.anchor + '"'), e.options._bodyProp.vert && (r += ' vert="' + e.options._bodyProp.vert + '"'), r += ">", e.options.fit && (e.options.fit === "none" ? r += "" : e.options.fit === "shrink" ? r += "<a:normAutofit/>" : e.options.fit === "resize" && (r += "<a:spAutoFit/>")), e.options.shrinkText && (r += "<a:normAutofit/>"), r += e.options._bodyProp.autoFit ? "<a:spAutoFit/>" : "", r += "</a:bodyPr>") : (r += ' wrap="square" rtlCol="0">', r += "</a:bodyPr>"), e._type === ue.tablecell ? "<a:bodyPr/>" : r;
}
function Ga(e) {
  const r = e.options || {};
  let t = [];
  const s = [];
  if (r && e._type !== ue.tablecell && (typeof e.text > "u" || e.text === null))
    return "";
  let n = e._type === ue.tablecell ? "<a:txBody>" : "<p:txBody>";
  n += go(e), r.h === 0 && r.line && r.align ? n += '<a:lstStyle><a:lvl1pPr algn="l"/></a:lstStyle>' : e._type === "placeholder" ? n += `<a:lstStyle>${Ua(e, !0)}</a:lstStyle>` : n += "<a:lstStyle/>", typeof e.text == "string" || typeof e.text == "number" ? t.push({ text: e.text.toString(), options: r || {} }) : e.text && !Array.isArray(e.text) && typeof e.text == "object" && Object.keys(e.text).includes("text") ? t.push({ text: e.text || "", options: e.options || {} }) : Array.isArray(e.text) && (t = e.text.map((A) => ({ text: A.text, options: A.options }))), t.forEach((A, c) => {
    A.text || (A.text = ""), A.options = A.options || r || {}, c === 0 && A.options && !A.options.bullet && r.bullet && (A.options.bullet = r.bullet), (typeof A.text == "string" || typeof A.text == "number") && (A.text = A.text.toString().replace(/\r*\n/g, Pe)), A.text.includes(Pe) && A.text.match(/\n$/g) === null ? A.text.split(Pe).forEach((a) => {
      A.options.breakLine = !0, s.push({ text: a, options: A.options });
    }) : s.push(A);
  });
  const o = [];
  let l = [];
  return s.forEach((A, c) => {
    l.length > 0 && (A.options.align || r.align) ? A.options.align !== s[c - 1].options.align && (o.push(l), l = []) : l.length > 0 && A.options.bullet && l.length > 0 && (o.push(l), l = [], A.options.breakLine = !1), l.push(A), l.length > 0 && A.options.breakLine && c + 1 < s.length && (o.push(l), l = []), c + 1 === s.length && o.push(l);
  }), o.forEach((A) => {
    var c;
    let a = !1;
    n += "<a:p>";
    let i = `<a:pPr ${!((c = A[0].options) === null || c === void 0) && c.rtlMode ? ' rtl="1" ' : ""}`;
    A.forEach((f, y) => {
      f.options._lineIdx = y, y > 0 && f.options.softBreakBefore && (n += "<a:br/>"), f.options.align = f.options.align || r.align, f.options.lineSpacing = f.options.lineSpacing || r.lineSpacing, f.options.lineSpacingMultiple = f.options.lineSpacingMultiple || r.lineSpacingMultiple, f.options.indentLevel = f.options.indentLevel || r.indentLevel, f.options.paraSpaceBefore = f.options.paraSpaceBefore || r.paraSpaceBefore, f.options.paraSpaceAfter = f.options.paraSpaceAfter || r.paraSpaceAfter, i = Ua(f, !1), n += i.replace("<a:pPr></a:pPr>", ""), Object.entries(r).filter(([d]) => !(f.options.hyperlink && d === "color")).forEach(([d, m]) => {
        d !== "bullet" && !f.options[d] && (f.options[d] = m);
      }), n += mo(f), (!f.text && r.fontSize || f.options.fontSize) && (a = !0, r.fontSize = r.fontSize || f.options.fontSize);
    }), e._type === ue.tablecell && (r.fontSize || r.fontFace) ? r.fontFace ? (n += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0">', n += `<a:latin typeface="${r.fontFace}" charset="0"/>`, n += `<a:ea typeface="${r.fontFace}" charset="0"/>`, n += `<a:cs typeface="${r.fontFace}" charset="0"/>`, n += "</a:endParaRPr>") : n += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0"/>' : a ? n += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0"/>' : n += `<a:endParaRPr lang="${r.lang || "en-US"}" dirty="0"/>`, n += "</a:p>";
  }), n.indexOf("<a:p>") === -1 && (n += "<a:p><a:endParaRPr/></a:p>"), n += e._type === ue.tablecell ? "</a:txBody>" : "</p:txBody>", n;
}
function Gt(e) {
  var r, t;
  if (!e)
    return "";
  const s = !((r = e.options) === null || r === void 0) && r._placeholderIdx ? e.options._placeholderIdx : "", n = !((t = e.options) === null || t === void 0) && t._placeholderType ? e.options._placeholderType : "", o = n && St[n] ? St[n].toString() : "";
  return `<p:ph
		${s ? ' idx="' + s.toString() + '"' : ""}
		${o && St[o] ? ` type="${o}"` : ""}
		${e.text && e.text.length > 0 ? ' hasCustomPrompt="1"' : ""}
		/>`;
}
function yo(e, r, t) {
  let s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  return s += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">', s += '<Default Extension="xml" ContentType="application/xml"/>', s += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>', s += '<Default Extension="jpeg" ContentType="image/jpeg"/>', s += '<Default Extension="jpg" ContentType="image/jpg"/>', s += '<Default Extension="svg" ContentType="image/svg+xml"/>', s += '<Default Extension="png" ContentType="image/png"/>', s += '<Default Extension="gif" ContentType="image/gif"/>', s += '<Default Extension="m4v" ContentType="video/mp4"/>', s += '<Default Extension="mp4" ContentType="video/mp4"/>', e.forEach((n) => {
    (n._relsMedia || []).forEach((o) => {
      o.type !== "image" && o.type !== "online" && o.type !== "chart" && o.extn !== "m4v" && !s.includes(o.type) && (s += '<Default Extension="' + o.extn + '" ContentType="' + o.type + '"/>');
    });
  }), s += '<Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/>', s += '<Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>', s += '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>', s += '<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>', e.forEach((n, o) => {
    s += `<Override PartName="/ppt/slideMasters/slideMaster${o + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`, s += `<Override PartName="/ppt/slides/slide${o + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`, n._relsChart.forEach((l) => {
      s += `<Override PartName="${l.Target}" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`;
    });
  }), s += '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>', s += '<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>', s += '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>', s += '<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>', r.forEach((n, o) => {
    s += `<Override PartName="/ppt/slideLayouts/slideLayout${o + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`, (n._relsChart || []).forEach((l) => {
      s += ' <Override PartName="' + l.Target + '" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';
    });
  }), e.forEach((n, o) => {
    s += `<Override PartName="/ppt/notesSlides/notesSlide${o + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
  }), t._relsChart.forEach((n) => {
    s += ' <Override PartName="' + n.Target + '" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';
  }), t._relsMedia.forEach((n) => {
    n.type !== "image" && n.type !== "online" && n.type !== "chart" && n.extn !== "m4v" && !s.includes(n.type) && (s += ' <Default Extension="' + n.extn + '" ContentType="' + n.type + '"/>');
  }), s += ' <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>', s += ' <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>', s += "</Types>", s;
}
function vo() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
		<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
		<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
		<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
		</Relationships>`;
}
function bo(e, r) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
	<TotalTime>0</TotalTime>
	<Words>0</Words>
	<Application>Microsoft Office PowerPoint</Application>
	<PresentationFormat>On-screen Show (16:9)</PresentationFormat>
	<Paragraphs>0</Paragraphs>
	<Slides>${e.length}</Slides>
	<Notes>${e.length}</Notes>
	<HiddenSlides>0</HiddenSlides>
	<MMClips>0</MMClips>
	<ScaleCrop>false</ScaleCrop>
	<HeadingPairs>
		<vt:vector size="6" baseType="variant">
			<vt:variant><vt:lpstr>Fonts Used</vt:lpstr></vt:variant>
			<vt:variant><vt:i4>2</vt:i4></vt:variant>
			<vt:variant><vt:lpstr>Theme</vt:lpstr></vt:variant>
			<vt:variant><vt:i4>1</vt:i4></vt:variant>
			<vt:variant><vt:lpstr>Slide Titles</vt:lpstr></vt:variant>
			<vt:variant><vt:i4>${e.length}</vt:i4></vt:variant>
		</vt:vector>
	</HeadingPairs>
	<TitlesOfParts>
		<vt:vector size="${e.length + 1 + 2}" baseType="lpstr">
			<vt:lpstr>Arial</vt:lpstr>
			<vt:lpstr>Calibri</vt:lpstr>
			<vt:lpstr>Office Theme</vt:lpstr>
			${e.map((t, s) => `<vt:lpstr>Slide ${s + 1}</vt:lpstr>`).join("")}
		</vt:vector>
	</TitlesOfParts>
	<Company>${r}</Company>
	<LinksUpToDate>false</LinksUpToDate>
	<SharedDoc>false</SharedDoc>
	<HyperlinksChanged>false</HyperlinksChanged>
	<AppVersion>16.0000</AppVersion>
	</Properties>`;
}
function wo(e, r, t, s) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
	<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<dc:title>${fe(e)}</dc:title>
		<dc:subject>${fe(r)}</dc:subject>
		<dc:creator>${fe(t)}</dc:creator>
		<cp:lastModifiedBy>${fe(t)}</cp:lastModifiedBy>
		<cp:revision>${s}</cp:revision>
		<dcterms:created xsi:type="dcterms:W3CDTF">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d\d\dZ/, "Z")}</dcterms:created>
		<dcterms:modified xsi:type="dcterms:W3CDTF">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d\d\dZ/, "Z")}</dcterms:modified>
	</cp:coreProperties>`;
}
function _o(e) {
  let r = 1, t = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  t += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">', t += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
  for (let s = 1; s <= e.length; s++)
    t += `<Relationship Id="rId${++r}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${s}.xml"/>`;
  return r++, t += `<Relationship Id="rId${r + 0}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/><Relationship Id="rId${r + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/><Relationship Id="rId${r + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/><Relationship Id="rId${r + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId${r + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/></Relationships>`, t;
}
function Co(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"${e?.hidden ? ' show="0"' : ""}>${Ta(e)}<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
function xo(e) {
  let r = "";
  return e._slideObjects.forEach((t) => {
    t._type === ue.notes && (r += t?.text && t.text[0] ? t.text[0].text : "");
  }), r.replace(/\r*\n/g, Pe);
}
function Eo() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Header Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="hdr" sz="quarter"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="2971800" cy="458788"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle><a:lvl1pPr algn="l"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Date Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="dt" idx="1"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="3884613" y="0"/><a:ext cx="2971800" cy="458788"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle><a:lvl1pPr algn="r"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:fld id="{5282F153-3F37-0F45-9E97-73ACFA13230C}" type="datetimeFigureOut"><a:rPr lang="en-US"/><a:t>7/23/19</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Image Placeholder 3"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="1143000"/><a:ext cx="5486400" cy="3086100"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="12700"><a:solidFill><a:prstClr val="black"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="5" name="Notes Placeholder 4"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="4400550"/><a:ext cx="5486400" cy="3600450"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle/><a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US"/><a:t>Click to edit Master text styles</a:t></a:r></a:p><a:p><a:pPr lvl="1"/><a:r><a:rPr lang="en-US"/><a:t>Second level</a:t></a:r></a:p><a:p><a:pPr lvl="2"/><a:r><a:rPr lang="en-US"/><a:t>Third level</a:t></a:r></a:p><a:p><a:pPr lvl="3"/><a:r><a:rPr lang="en-US"/><a:t>Fourth level</a:t></a:r></a:p><a:p><a:pPr lvl="4"/><a:r><a:rPr lang="en-US"/><a:t>Fifth level</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="6" name="Footer Placeholder 5"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ftr" sz="quarter" idx="4"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="8685213"/><a:ext cx="2971800" cy="458787"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="b"/><a:lstStyle><a:lvl1pPr algn="l"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="7" name="Slide Number Placeholder 6"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldNum" sz="quarter" idx="5"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="3884613" y="8685213"/><a:ext cx="2971800" cy="458787"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="b"/><a:lstStyle><a:lvl1pPr algn="r"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:fld id="{CE5E9CC1-C706-0F49-92D6-E571CC5EEA8F}" type="slidenum"><a:rPr lang="en-US"/><a:t>‹#›</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp></p:spTree><p:extLst><p:ext uri="{BB962C8B-B14F-4D97-AF65-F5344CB8AC3E}"><p14:creationId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1024086991"/></p:ext></p:extLst></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:notesStyle><a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr><a:lvl2pPr marL="457200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr><a:lvl3pPr marL="914400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr><a:lvl4pPr marL="1371600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr><a:lvl5pPr marL="1828800" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr><a:lvl6pPr marL="2286000" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr><a:lvl7pPr marL="2743200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr><a:lvl8pPr marL="3200400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr><a:lvl9pPr marL="3657600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr></p:notesStyle></p:notesMaster>`;
}
function To(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${fe(xo(e))}</a:t></a:r><a:endParaRPr lang="en-US" dirty="0"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Number Placeholder 3"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldNum" sz="quarter" idx="10"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:fld id="${gi}" type="slidenum"><a:rPr lang="en-US"/><a:t>${e._slideNum}</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp></p:spTree><p:extLst><p:ext uri="{BB962C8B-B14F-4D97-AF65-F5344CB8AC3E}"><p14:creationId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1024086991"/></p:ext></p:extLst></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
}
function Lo(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
		${Ta(e)}
		<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
}
function Ro(e, r) {
  const t = r.map((n, o) => `<p:sldLayoutId id="${Qi + o}" r:id="rId${e._rels.length + o + 1}"/>`);
  let s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  return s += '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">', s += Ta(e), s += '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>', s += "<p:sldLayoutIdLst>" + t.join("") + "</p:sldLayoutIdLst>", s += '<p:hf sldNum="0" hdr="0" ftr="0" dt="0"/>', s += '<p:txStyles> <p:titleStyle>  <a:lvl1pPr algn="ctr" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="0"/></a:spcBef><a:buNone/><a:defRPr sz="4400" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mj-lt"/><a:ea typeface="+mj-ea"/><a:cs typeface="+mj-cs"/></a:defRPr></a:lvl1pPr> </p:titleStyle> <p:bodyStyle>  <a:lvl1pPr marL="342900" indent="-342900" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="3200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr>  <a:lvl2pPr marL="742950" indent="-285750" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="–"/><a:defRPr sz="2800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr>  <a:lvl3pPr marL="1143000" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2400" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr>  <a:lvl4pPr marL="1600200" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="–"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr>  <a:lvl5pPr marL="2057400" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="»"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr>  <a:lvl6pPr marL="2514600" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr>  <a:lvl7pPr marL="2971800" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr>  <a:lvl8pPr marL="3429000" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr>  <a:lvl9pPr marL="3886200" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr> </p:bodyStyle> <p:otherStyle>  <a:defPPr><a:defRPr lang="en-US"/></a:defPPr>  <a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr>  <a:lvl2pPr marL="457200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr>  <a:lvl3pPr marL="914400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr>  <a:lvl4pPr marL="1371600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr>  <a:lvl5pPr marL="1828800" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr>  <a:lvl6pPr marL="2286000" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr>  <a:lvl7pPr marL="2743200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr>  <a:lvl8pPr marL="3200400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr>  <a:lvl9pPr marL="3657600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr> </p:otherStyle></p:txStyles>', s += "</p:sldMaster>", s;
}
function Do(e, r) {
  return La(r[e - 1], [
    {
      target: "../slideMasters/slideMaster1.xml",
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
    }
  ]);
}
function Po(e, r, t) {
  return La(e[t - 1], [
    {
      target: `../slideLayouts/slideLayout${ko(e, r, t)}.xml`,
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
    },
    {
      target: `../notesSlides/notesSlide${t}.xml`,
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"
    }
  ]);
}
function No(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/>
			<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${e}.xml"/>
		</Relationships>`;
}
function Bo(e, r) {
  const t = r.map((s, n) => ({
    target: `../slideLayouts/slideLayout${n + 1}.xml`,
    type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
  }));
  return t.push({ target: "../theme/theme1.xml", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" }), La(e, t);
}
function So() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
		<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
		</Relationships>`;
}
function ko(e, r, t) {
  for (let s = 0; s < r.length; s++)
    if (r[s]._name === e[t - 1]._slideLayout._name)
      return s + 1;
  return 1;
}
function Io(e) {
  var r, t, s, n;
  const o = !((r = e.theme) === null || r === void 0) && r.headFontFace ? `<a:latin typeface="${(t = e.theme) === null || t === void 0 ? void 0 : t.headFontFace}"/>` : '<a:latin typeface="Calibri Light" panose="020F0302020204030204"/>', l = !((s = e.theme) === null || s === void 0) && s.bodyFontFace ? `<a:latin typeface="${(n = e.theme) === null || n === void 0 ? void 0 : n.bodyFontFace}"/>` : '<a:latin typeface="Calibri" panose="020F0502020204030204"/>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont>${o}<a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线 Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Angsana New"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:majorFont><a:minorFont>${l}<a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Cordia New"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst></a:theme>`;
}
function Fo(e) {
  let r = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" ${e.rtlMode ? 'rtl="1"' : ""} saveSubsetFonts="1" autoCompressPictures="0">`;
  r += '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>', r += "<p:sldIdLst>", e.slides.forEach((t) => r += `<p:sldId id="${t._slideId}" r:id="rId${t._rId}"/>`), r += "</p:sldIdLst>", r += `<p:notesMasterIdLst><p:notesMasterId r:id="rId${e.slides.length + 2}"/></p:notesMasterIdLst>`, r += `<p:sldSz cx="${e.presLayout.width}" cy="${e.presLayout.height}"/>`, r += `<p:notesSz cx="${e.presLayout.height}" cy="${e.presLayout.width}"/>`, r += "<p:defaultTextStyle>";
  for (let t = 1; t < 10; t++)
    r += `<a:lvl${t}pPr marL="${(t - 1) * 457200}" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl${t}pPr>`;
  return r += "</p:defaultTextStyle>", e.sections && e.sections.length > 0 && (r += '<p:extLst><p:ext uri="{521415D9-36F7-43E2-AB2F-B90AF26B5E84}">', r += '<p14:sectionLst xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">', e.sections.forEach((t) => {
    r += `<p14:section name="${fe(t.title)}" id="{${Dr("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")}}"><p14:sldIdLst>`, t._slides.forEach((s) => r += `<p14:sldId id="${s._slideId}"/>`), r += "</p14:sldIdLst></p14:section>";
  }), r += "</p14:sectionLst></p:ext>", r += '<p:ext uri="{EFAFB233-063F-42B5-8137-9DF3F51BA10A}"><p15:sldGuideLst xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main"/></p:ext>', r += "</p:extLst>"), r += "</p:presentation>", r;
}
function Mo() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>`;
}
function Oo() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>`;
}
function $o() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:normalViewPr horzBarState="maximized"><p:restoredLeft sz="15611"/><p:restoredTop sz="94610"/></p:normalViewPr><p:slideViewPr><p:cSldViewPr snapToGrid="0" snapToObjects="1"><p:cViewPr varScale="1"><p:scale><a:sx n="136" d="100"/><a:sy n="136" d="100"/></p:scale><p:origin x="216" y="312"/></p:cViewPr><p:guideLst/></p:cSldViewPr></p:slideViewPr><p:notesTextViewPr><p:cViewPr><p:scale><a:sx n="1" d="1"/><a:sy n="1" d="1"/></p:scale><p:origin x="0" y="0"/></p:cViewPr></p:notesTextViewPr><p:gridSpacing cx="76200" cy="76200"/></p:viewPr>`;
}
const zo = "4.0.1";
class Uo {
  set layout(r) {
    const t = this.LAYOUTS[r];
    if (t)
      this._layout = r, this._presLayout = t;
    else
      throw new Error("UNKNOWN-LAYOUT");
  }
  get layout() {
    return this._layout;
  }
  get version() {
    return this._version;
  }
  set author(r) {
    this._author = r;
  }
  get author() {
    return this._author;
  }
  set company(r) {
    this._company = r;
  }
  get company() {
    return this._company;
  }
  set revision(r) {
    this._revision = r;
  }
  get revision() {
    return this._revision;
  }
  set subject(r) {
    this._subject = r;
  }
  get subject() {
    return this._subject;
  }
  set theme(r) {
    this._theme = r;
  }
  get theme() {
    return this._theme;
  }
  set title(r) {
    this._title = r;
  }
  get title() {
    return this._title;
  }
  set rtlMode(r) {
    this._rtlMode = r;
  }
  get rtlMode() {
    return this._rtlMode;
  }
  get masterSlide() {
    return this._masterSlide;
  }
  get slides() {
    return this._slides;
  }
  get sections() {
    return this._sections;
  }
  get slideLayouts() {
    return this._slideLayouts;
  }
  get AlignH() {
    return this._alignH;
  }
  get AlignV() {
    return this._alignV;
  }
  get ChartType() {
    return this._chartType;
  }
  get OutputType() {
    return this._outputType;
  }
  get presLayout() {
    return this._presLayout;
  }
  get SchemeColor() {
    return this._schemeColor;
  }
  get ShapeType() {
    return this._shapeType;
  }
  get charts() {
    return this._charts;
  }
  get colors() {
    return this._colors;
  }
  get shapes() {
    return this._shapes;
  }
  constructor() {
    this._version = zo, this._alignH = ya, this._alignV = va, this._chartType = ma, this._outputType = pa, this._schemeColor = Me, this._shapeType = ga, this._charts = re, this._colors = Nr, this._shapes = et, this.addNewSlide = (o) => {
      const l = this.sections.length > 0 && this.sections[this.sections.length - 1]._slides.filter((A) => A._slideNum === this.slides[this.slides.length - 1]._slideNum).length > 0;
      return o.sectionTitle = l ? this.sections[this.sections.length - 1].title : null, this.addSlide(o);
    }, this.getSlide = (o) => this.slides.filter((l) => l._slideNum === o)[0], this.setSlideNumber = (o) => {
      this.masterSlide._slideNumberProps = o, this.slideLayouts.filter((l) => l._name === ua)[0]._slideNumberProps = o;
    }, this.createChartMediaRels = (o, l, A) => {
      o._relsChart.forEach((c) => A.push(fo(c, l))), o._relsMedia.forEach((c) => {
        if (c.type !== "online" && c.type !== "hyperlink") {
          let a = c.data && typeof c.data == "string" ? c.data : "";
          !a.includes(",") && !a.includes(";") ? a = "image/png;base64," + a : a.includes(",") ? a.includes(";") || (a = "image/png;" + a) : a = "image/png;base64," + a, l.file(c.Target.replace("..", "ppt"), a.split(",").pop(), { base64: !0 });
        }
      });
    }, this.writeFileToBrowser = (o, l) => Oe(this, void 0, void 0, function* () {
      const A = document.createElement("a");
      if (A.setAttribute("style", "display:none;"), A.dataset.interception = "off", document.body.appendChild(A), window.URL.createObjectURL) {
        const c = window.URL.createObjectURL(new Blob([l], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }));
        return A.href = c, A.download = o, A.click(), setTimeout(() => {
          window.URL.revokeObjectURL(c), document.body.removeChild(A);
        }, 100), yield Promise.resolve(o);
      }
    }), this.exportPresentation = (o) => Oe(this, void 0, void 0, function* () {
      const l = [];
      let A = [];
      const c = new ui();
      return this.slides.forEach((a) => {
        A = A.concat(Yr(a));
      }), this.slideLayouts.forEach((a) => {
        A = A.concat(Yr(a));
      }), A = A.concat(Yr(this.masterSlide)), yield Promise.all(A).then(() => Oe(this, void 0, void 0, function* () {
        return this.slides.forEach((a) => {
          a._slideLayout && co(a);
        }), c.folder("_rels"), c.folder("docProps"), c.folder("ppt").folder("_rels"), c.folder("ppt/charts").folder("_rels"), c.folder("ppt/embeddings"), c.folder("ppt/media"), c.folder("ppt/slideLayouts").folder("_rels"), c.folder("ppt/slideMasters").folder("_rels"), c.folder("ppt/slides").folder("_rels"), c.folder("ppt/theme"), c.folder("ppt/notesMasters").folder("_rels"), c.folder("ppt/notesSlides").folder("_rels"), c.file("[Content_Types].xml", yo(this.slides, this.slideLayouts, this.masterSlide)), c.file("_rels/.rels", vo()), c.file("docProps/app.xml", bo(this.slides, this.company)), c.file("docProps/core.xml", wo(this.title, this.subject, this.author, this.revision)), c.file("ppt/_rels/presentation.xml.rels", _o(this.slides)), c.file("ppt/theme/theme1.xml", Io(this)), c.file("ppt/presentation.xml", Fo(this)), c.file("ppt/presProps.xml", Mo()), c.file("ppt/tableStyles.xml", Oo()), c.file("ppt/viewProps.xml", $o()), this.slideLayouts.forEach((a, i) => {
          c.file(`ppt/slideLayouts/slideLayout${i + 1}.xml`, Lo(a)), c.file(`ppt/slideLayouts/_rels/slideLayout${i + 1}.xml.rels`, Do(i + 1, this.slideLayouts));
        }), this.slides.forEach((a, i) => {
          c.file(`ppt/slides/slide${i + 1}.xml`, Co(a)), c.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, Po(this.slides, this.slideLayouts, i + 1)), c.file(`ppt/notesSlides/notesSlide${i + 1}.xml`, To(a)), c.file(`ppt/notesSlides/_rels/notesSlide${i + 1}.xml.rels`, No(i + 1));
        }), c.file("ppt/slideMasters/slideMaster1.xml", Ro(this.masterSlide, this.slideLayouts)), c.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", Bo(this.masterSlide, this.slideLayouts)), c.file("ppt/notesMasters/notesMaster1.xml", Eo()), c.file("ppt/notesMasters/_rels/notesMaster1.xml.rels", So()), this.slideLayouts.forEach((a) => {
          this.createChartMediaRels(a, c, l);
        }), this.slides.forEach((a) => {
          this.createChartMediaRels(a, c, l);
        }), this.createChartMediaRels(this.masterSlide, c, l), yield Promise.all(l).then(() => Oe(this, void 0, void 0, function* () {
          return o.outputType === "STREAM" ? yield c.generateAsync({ type: "nodebuffer", compression: o.compression ? "DEFLATE" : "STORE" }) : o.outputType ? yield c.generateAsync({ type: o.outputType }) : yield c.generateAsync({ type: "blob", compression: o.compression ? "DEFLATE" : "STORE" });
        }));
      }));
    });
    const r = { name: "screen4x3", width: 9144e3, height: 6858e3 }, t = { name: "screen16x9", width: 9144e3, height: 5143500 }, s = { name: "screen16x10", width: 9144e3, height: 5715e3 }, n = { name: "custom", width: 12192e3, height: 6858e3 };
    this.LAYOUTS = {
      LAYOUT_4x3: r,
      LAYOUT_16x9: t,
      LAYOUT_16x10: s,
      LAYOUT_WIDE: n
    }, this._author = "PptxGenJS", this._company = "PptxGenJS", this._revision = "1", this._subject = "PptxGenJS Presentation", this._title = "PptxGenJS Presentation", this._presLayout = {
      name: this.LAYOUTS[ht].name,
      _sizeW: this.LAYOUTS[ht].width,
      _sizeH: this.LAYOUTS[ht].height,
      width: this.LAYOUTS[ht].width,
      height: this.LAYOUTS[ht].height
    }, this._rtlMode = !1, this._slideLayouts = [
      {
        _margin: kt,
        _name: ua,
        _presLayout: this._presLayout,
        _rels: [],
        _relsChart: [],
        _relsMedia: [],
        _slide: null,
        _slideNum: 1e3,
        _slideNumberProps: null,
        _slideObjects: []
      }
    ], this._slides = [], this._sections = [], this._masterSlide = {
      addChart: null,
      addImage: null,
      addMedia: null,
      addNotes: null,
      addShape: null,
      addTable: null,
      addText: null,
      //
      _name: null,
      _presLayout: this._presLayout,
      _rId: null,
      _rels: [],
      _relsChart: [],
      _relsMedia: [],
      _slideId: null,
      _slideLayout: null,
      _slideNum: null,
      _slideNumberProps: null,
      _slideObjects: []
    };
  }
  // EXPORT METHODS
  /**
   * Export the current Presentation to stream
   * @param {WriteBaseProps} props - output properties
   * @returns {Promise<string | ArrayBuffer | Blob | Buffer | Uint8Array>} file stream
   */
  stream(r) {
    return Oe(this, void 0, void 0, function* () {
      return yield this.exportPresentation({
        compression: r?.compression,
        outputType: "STREAM"
      });
    });
  }
  /**
   * Export the current Presentation as JSZip content with the selected type
   * @param {WriteProps} props output properties
   * @returns {Promise<string | ArrayBuffer | Blob | Buffer | Uint8Array>} file content in selected type
   */
  write(r) {
    return Oe(this, void 0, void 0, function* () {
      const t = typeof r == "object" && r?.outputType ? r.outputType : r || null, s = typeof r == "object" && r?.compression ? r.compression : !1;
      return yield this.exportPresentation({
        compression: s,
        outputType: t
      });
    });
  }
  /**
   * Export the current Presentation.
   * Write the generated presentation to disk (Node) or trigger a download (browser).
   * @param {WriteFileProps} props - output file properties
   * @returns {Promise<string>} the presentation name
   */
  writeFile(r) {
    return Oe(this, void 0, void 0, function* () {
      var t, s;
      const n = typeof process < "u" && !!(!((t = process.versions) === null || t === void 0) && t.node) && ((s = process.release) === null || s === void 0 ? void 0 : s.name) === "node";
      typeof r == "string" && (console.warn("[WARNING] writeFile(string) is deprecated - pass { fileName } instead."), r = { fileName: r });
      const { fileName: o = "Presentation.pptx", compression: l = !1 } = r, A = o.toLowerCase().endsWith(".pptx") ? o : `${o}.pptx`, c = n ? "nodebuffer" : null, a = yield this.exportPresentation({ compression: l, outputType: c });
      if (n) {
        const { promises: i } = yield import("./__vite-browser-external.js"), { writeFile: f } = i;
        return yield f(A, a), A;
      }
      return yield this.writeFileToBrowser(A, a), A;
    });
  }
  // PRESENTATION METHODS
  /**
   * Add a new Section to Presentation
   * @param {ISectionProps} section - section properties
   * @example pptx.addSection({ title:'Charts' });
   */
  addSection(r) {
    r ? r.title || console.warn("addSection requires a title") : console.warn("addSection requires an argument");
    const t = {
      _type: "user",
      _slides: [],
      title: r.title
    };
    r.order ? this.sections.splice(r.order, 0, t) : this._sections.push(t);
  }
  /**
   * Add a new Slide to Presentation
   * @param {AddSlideProps} options - slide options
   * @returns {PresSlide} the new Slide
   */
  addSlide(r) {
    const t = typeof r == "string" ? r : r?.masterName ? r.masterName : "";
    let s = {
      _name: this.LAYOUTS[ht].name,
      _presLayout: this.presLayout,
      _rels: [],
      _relsChart: [],
      _relsMedia: [],
      _slideNum: this.slides.length + 1
    };
    if (t) {
      const o = this.slideLayouts.filter((l) => l._name === t)[0];
      o && (s = o);
    }
    const n = new Ao({
      addSlide: this.addNewSlide,
      getSlide: this.getSlide,
      presLayout: this.presLayout,
      setSlideNum: this.setSlideNumber,
      slideId: this.slides.length + 256,
      slideRId: this.slides.length + 2,
      slideNumber: this.slides.length + 1,
      slideLayout: s
    });
    if (this._slides.push(n), r?.sectionTitle) {
      const o = this.sections.filter((l) => l.title === r.sectionTitle)[0];
      o ? o._slides.push(n) : console.warn(`addSlide: unable to find section with title: "${r.sectionTitle}"`);
    } else if (this.sections && this.sections.length > 0 && !r?.sectionTitle) {
      const o = this._sections[this.sections.length - 1];
      o._type === "default" ? o._slides.push(n) : this._sections.push({
        title: `Default-${this.sections.filter((l) => l._type === "default").length + 1}`,
        _type: "default",
        _slides: [n]
      });
    }
    return n;
  }
  /**
   * Create a custom Slide Layout in any size
   * @param {PresLayout} layout - layout properties
   * @example pptx.defineLayout({ name:'A3', width:16.5, height:11.7 });
   */
  defineLayout(r) {
    r ? r.name ? r.width ? r.height ? typeof r.height != "number" ? console.warn("defineLayout `height` should be a number (inches)") : typeof r.width != "number" && console.warn("defineLayout `width` should be a number (inches)") : console.warn("defineLayout requires `height`") : console.warn("defineLayout requires `width`") : console.warn("defineLayout requires `name`") : console.warn("defineLayout requires `{name, width, height}`"), this.LAYOUTS[r.name] = {
      name: r.name,
      _sizeW: Math.round(Number(r.width) * he),
      _sizeH: Math.round(Number(r.height) * he),
      width: Math.round(Number(r.width) * he),
      height: Math.round(Number(r.height) * he)
    };
  }
  /**
   * Create a new slide master [layout] for the Presentation
   * @param {SlideMasterProps} props - layout properties
   */
  defineSlideMaster(r) {
    const t = JSON.parse(JSON.stringify(r));
    if (!t.title)
      throw new Error("defineSlideMaster() object argument requires a `title` value. (https://gitbrent.github.io/PptxGenJS/docs/masters.html)");
    const s = {
      _margin: t.margin || kt,
      _name: t.title,
      _presLayout: this.presLayout,
      _rels: [],
      _relsChart: [],
      _relsMedia: [],
      _slide: null,
      _slideNum: 1e3 + this.slideLayouts.length + 1,
      _slideNumberProps: t.slideNumber || null,
      _slideObjects: [],
      background: t.background || null,
      bkgd: t.bkgd || null
    };
    io(t, s), this.slideLayouts.push(s), (t.background || t.bkgd) && wi(t.background, s), s._slideNumberProps && !this.masterSlide._slideNumberProps && (this.masterSlide._slideNumberProps = s._slideNumberProps);
  }
  // HTML-TO-SLIDES METHODS
  /**
   * Reproduces an HTML table as a PowerPoint table - including column widths, style, etc. - creates 1 or more slides as needed
   * @param {string} eleId - table HTML element ID
   * @param {TableToSlidesProps} options - generation options
   */
  tableToSlides(r, t = {}) {
    ao(this, r, t, t?.masterSlideName ? this.slideLayouts.filter((s) => s._name === t.masterSlideName)[0] : null);
  }
}
const Ci = {
  SLIDE_WIDTH: 13.33,
  SLIDE_HEIGHT: 7.5,
  MARGIN: 0.68,
  SECTION_HEADER_HEIGHT: 0.18,
  SECTION_HEADER_GAP: 0.36,
  BLOCK_GAP: 0.18,
  TITLE_HEIGHT: 0.62,
  DIVIDER_HEIGHT: 0.012,
  DIVIDER_GAP: 0.18,
  SUBTITLE_HEIGHT: 0.34,
  SUBTITLE_GAP: 0.15,
  // Approved premium academic palette.
  NAVY: "111111",
  NAVY_LIGHT: "2B2B2B",
  GOLD: "777777",
  DARK_TEXT: "111111",
  BODY_TEXT: "1C1C1C",
  MUTED_TEXT: "6A6A6A",
  WHITE: "FFFFFF",
  SLIDE_BG: "FAFAF9",
  PAGE_BG: "F0F0EF",
  DIVIDER_COLOR: "DEDEDC",
  SECTION_HEADER_BG: "FAFAF9",
  SECTION_HEADER_TEXT: "111111",
  GRAPHITE: "2B2B2B",
  DEEP_GRAY: "505050",
  MID_GRAY: "777777",
  LIGHT_NEUTRAL: "DEDEDC",
  MUTED_ON_DARK: "D7D7D5",
  DARK_RULE: "676767",
  CALLOUT_NOTE_BG: "FAFAF9",
  CALLOUT_NOTE_BORDER: "111111",
  CALLOUT_NOTE_LABEL: "111111",
  CALLOUT_WARNING_BG: "F0F0EF",
  CALLOUT_WARNING_BORDER: "505050",
  CALLOUT_WARNING_LABEL: "2B2B2B",
  CALLOUT_INFO_BG: "FFFFFF",
  CALLOUT_INFO_BORDER: "777777",
  CALLOUT_INFO_LABEL: "505050",
  TABLE_HEADER_BG: "111111",
  TABLE_HEADER_TEXT: "FAFAF9",
  TABLE_ROW_ODD_BG: "FFFFFF",
  TABLE_ROW_EVEN_BG: "F0F0EF",
  TABLE_BORDER: "DEDEDC",
  DIAGRAM_NODE_BG: "FFFFFF",
  DIAGRAM_NODE_BORDER: "111111",
  DIAGRAM_NODE_TEXT: "111111",
  DIAGRAM_CONNECTOR: "505050",
  PLACEHOLDER_BG: "F0F0EF",
  PLACEHOLDER_BORDER: "777777",
  PLACEHOLDER_TEXT: "505050",
  CAPTION_COLOR: "6A6A6A",
  SLIDE_NUMBER_COLOR: "111111",
  bodyFont: "Aptos",
  headingFont: "Aptos Display",
  labelFont: "Aptos",
  accentFont: "Georgia",
  FONT: "Aptos",
  FONT_FALLBACK: "Arial",
  accentColor: "777777",
  highlightColor: "E6E6E4",
  titleColor: "111111",
  bodyColor: "1C1C1C",
  mutedColor: "6A6A6A",
  FONT_COVER_TITLE: 36,
  FONT_COVER_LABEL: 8,
  FONT_SECTION_TITLE_SLIDE: 34,
  FONT_SLIDE_TITLE: 27,
  FONT_SLIDE_SUBTITLE: 14,
  FONT_SECTION_HEADER: 8,
  FONT_PARAGRAPH: 16,
  FONT_BULLET: 16,
  FONT_NUMBERED: 16,
  FONT_SUBTITLE_BLOCK: 18,
  FONT_TABLE_HEADER: 10,
  FONT_TABLE_BODY: 11,
  FONT_DIAGRAM_NODE: 11,
  FONT_CAPTION: 9,
  FONT_SLIDE_NUMBER: 8,
  FONT_CALLOUT_LABEL: 9,
  FONT_CALLOUT_TEXT: 14,
  FONT_OVERVIEW_INTRO: 15,
  FONT_OVERVIEW_KEYPOINT: 13,
  FONT_OVERVIEW_TOC: 14,
  FONT_MIN: 8,
  FONT_MIN_TABLE: 8,
  H_SUBTITLE_BLOCK: 0.45,
  H_PARAGRAPH_LINE: 0.3,
  H_BULLET_ITEM: 0.34,
  H_NUMBERED_ITEM: 0.34,
  H_CALLOUT_MIN: 0.85,
  H_TABLE_HEADER_ROW: 0.4,
  H_TABLE_BODY_ROW: 0.38,
  H_TABLE_LABEL: 0.34,
  H_DIAGRAM_NODE: 0.58,
  H_DIAGRAM_ROW_GAP: 0.38,
  H_DIAGRAM_LABEL: 0.34,
  H_CAPTION: 0.25,
  DIAGRAM_NODE_WIDTH: 1.9,
  DIAGRAM_NODE_HEIGHT: 0.58,
  DIAGRAM_NODE_H_GAP: 0.38,
  DIAGRAM_ROW_V_GAP: 0.42,
  DIAGRAM_MAX_NODES_PER_ROW: 5,
  TABLE_LARGE_THRESHOLD: 3,
  DIAGRAM_LARGE_THRESHOLD: 4,
  LINE_SPACING: 1.22
}, S = { ...Ci };
function Go(e = {}) {
  const r = { ...e };
  return e.bodyFont !== void 0 && e.FONT === void 0 && (r.FONT = e.bodyFont), e.FONT !== void 0 && e.bodyFont === void 0 && (r.bodyFont = e.FONT), e.bodyFont !== void 0 && e.labelFont === void 0 && (r.labelFont = e.bodyFont), e.headingFont !== void 0 && e.accentFont === void 0 && (r.accentFont = e.headingFont), e.NAVY !== void 0 && e.titleColor === void 0 && (r.titleColor = e.NAVY), e.titleColor !== void 0 && e.NAVY === void 0 && (r.NAVY = e.titleColor), e.GOLD !== void 0 && e.accentColor === void 0 && (r.accentColor = e.GOLD), e.accentColor !== void 0 && e.GOLD === void 0 && (r.GOLD = e.accentColor), e.BODY_TEXT !== void 0 && e.bodyColor === void 0 && (r.bodyColor = e.BODY_TEXT), e.bodyColor !== void 0 && e.BODY_TEXT === void 0 && (r.BODY_TEXT = e.bodyColor), e.MUTED_TEXT !== void 0 && e.mutedColor === void 0 && (r.mutedColor = e.MUTED_TEXT), e.mutedColor !== void 0 && e.MUTED_TEXT === void 0 && (r.MUTED_TEXT = e.mutedColor), Object.assign(S, r), { ...S };
}
function Xa() {
  return Object.assign(S, Ci), { ...S };
}
const Te = S.SLIDE_WIDTH - 2 * S.MARGIN, xe = S.MARGIN, xt = S.MARGIN + S.SECTION_HEADER_HEIGHT + S.SECTION_HEADER_GAP, Ra = 6.62, Xo = Ra - xt, xi = S.TITLE_HEIGHT + S.DIVIDER_HEIGHT + S.DIVIDER_GAP, Ei = S.SUBTITLE_HEIGHT + S.SUBTITLE_GAP;
S.SLIDE_WIDTH / 2;
S.SLIDE_HEIGHT / 2;
const Wo = S.SLIDE_WIDTH - S.MARGIN - 0.55, qo = S.SLIDE_HEIGHT - 0.48;
function Kr(e, r) {
  let t = xt;
  return e && (t += xi), r && (t += Ei), t;
}
function Vo(e, r) {
  let t = Xo;
  return e && (t -= xi), r && (t -= Ei), t;
}
const ze = {
  TITLE_X: xe,
  TITLE_Y: 1.55,
  TITLE_W: 6.35,
  TITLE_H: 1.55,
  STRIP_X: 8.24,
  STRIP_Y: 0,
  STRIP_W: S.SLIDE_WIDTH - 8.24,
  STRIP_H: S.SLIDE_HEIGHT
}, Re = {
  TITLE_X: xe,
  TITLE_Y: 1.18,
  TITLE_W: 6.8,
  TITLE_H: 0.72,
  LEFT_COL_X: xe,
  LEFT_COL_W: 7.25,
  RIGHT_COL_X: 8.72,
  RIGHT_COL_W: 3.9,
  INTRO_Y: 2.05,
  INTRO_H: 0.7,
  TOC_LABEL_Y: 2.05,
  TOC_CARD_Y: 1.9,
  TOC_Y: 2.52,
  TOC_H: 3.55,
  TOC_CARD_H: 4.45
}, Ve = {
  BAND_X: 8.68,
  BAND_Y: 0,
  BAND_W: S.SLIDE_WIDTH - 8.68,
  BAND_H: S.SLIDE_HEIGHT,
  NUMBER_Y: 1,
  NUMBER_H: 0.85,
  TITLE_Y: 1.55,
  TITLE_H: 1.25
}, Jr = {
  TEXT_Y: 1.55,
  TEXT_H: 1.45,
  UNDERLINE_Y: 3.1
};
function tt(e, r, t = "", s = !1) {
  const n = s ? S.WHITE : S.DARK_TEXT, o = s ? S.MUTED_ON_DARK : S.MUTED_TEXT;
  e.addShape("line", {
    x: xe,
    y: 0.48,
    w: 0.46,
    h: 0,
    line: { color: n, width: 1.2 }
  }), e.addText(r.toUpperCase(), {
    x: xe,
    y: 0.62,
    w: 5.6,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: S.FONT_SECTION_HEADER,
    bold: !0,
    charSpacing: 1.8,
    color: n,
    margin: 0,
    align: "left",
    valign: "top"
  }), t && e.addText(t.toUpperCase(), {
    x: 8.1,
    y: 0.62,
    w: 4.55,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: S.FONT_SECTION_HEADER,
    bold: !0,
    charSpacing: 1.2,
    color: o,
    margin: 0,
    align: "right",
    valign: "top",
    fit: "shrink"
  });
}
function rt(e, r, t = !1) {
  const s = t ? S.MUTED_ON_DARK : S.DARK_TEXT, n = t ? S.DARK_RULE : S.DIVIDER_COLOR;
  e.addShape("line", {
    x: xe,
    y: 6.87,
    w: Te,
    h: 0,
    line: { color: n, width: 0.5 }
  }), e.addText(r.toUpperCase(), {
    x: xe,
    y: 7.01,
    w: 4.6,
    h: 0.14,
    fontFace: S.labelFont,
    fontSize: S.FONT_SLIDE_NUMBER,
    bold: !0,
    charSpacing: 1.35,
    color: s,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), e.slideNumber = {
    x: Wo,
    y: qo,
    w: 0.55,
    h: 0.16,
    fontFace: S.labelFont,
    fontSize: S.FONT_SLIDE_NUMBER,
    bold: !0,
    color: s,
    align: "right",
    margin: 0
  };
}
function Da(e, r, t, s, n) {
  const o = r + s * 0.53, l = t + n * 0.48;
  [0.82, 0.61, 0.39].forEach((c, a) => {
    const i = s * c, f = Math.min(n * c, i);
    e.addShape("ellipse", {
      x: o - i / 2,
      y: l - f / 2,
      w: i,
      h: f,
      fill: { color: S.GRAPHITE, transparency: 100 },
      line: { color: a === 1 ? S.MID_GRAY : S.DARK_RULE, width: a === 1 ? 1.2 : 0.8, transparency: 18 }
    });
  }), e.addShape("line", {
    x: r + s * 0.12,
    y: l,
    w: s * 0.78,
    h: 0,
    line: { color: S.DARK_RULE, width: 0.8, transparency: 15 }
  }), e.addShape("line", {
    x: o,
    y: t + n * 0.1,
    w: 0,
    h: n * 0.76,
    line: { color: S.DARK_RULE, width: 0.8, transparency: 15 }
  }), e.addShape("ellipse", {
    x: o - 0.16,
    y: l - 0.16,
    w: 0.32,
    h: 0.32,
    fill: { color: S.WHITE },
    line: { color: S.WHITE, transparency: 100 }
  }), e.addShape("ellipse", {
    x: r + s * 0.19,
    y: t + n * 0.22,
    w: 0.16,
    h: 0.16,
    fill: { color: S.MID_GRAY },
    line: { color: S.MID_GRAY, transparency: 100 }
  }), e.addShape("ellipse", {
    x: r + s * 0.76,
    y: t + n * 0.69,
    w: 0.12,
    h: 0.12,
    fill: { color: S.MUTED_ON_DARK },
    line: { color: S.MUTED_ON_DARK, transparency: 100 }
  });
}
function Ho(e, r) {
  const t = e.addSlide();
  t.background = { color: S.NAVY }, t.addShape("rect", {
    x: ze.STRIP_X,
    y: ze.STRIP_Y,
    w: ze.STRIP_W,
    h: ze.STRIP_H,
    fill: { color: S.GRAPHITE },
    line: { color: S.GRAPHITE, width: 0 }
  }), t.addShape("line", {
    x: ze.STRIP_X + 1.42,
    y: 0,
    w: 0,
    h: S.SLIDE_HEIGHT,
    line: { color: S.DARK_RULE, width: 0.8, transparency: 20 }
  }), Da(t, 8.42, 1, 4.15, 4.55), tt(t, "Jang lecture / editable PowerPoint", "", !0), t.addText(r.documentTitle, {
    x: ze.TITLE_X,
    y: ze.TITLE_Y,
    w: ze.TITLE_W,
    h: ze.TITLE_H,
    fontFace: S.headingFont,
    fontSize: S.FONT_COVER_TITLE,
    bold: !0,
    color: S.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addShape("line", {
    x: ze.TITLE_X,
    y: 3.37,
    w: 1.12,
    h: 0,
    line: { color: S.WHITE, width: 2 }
  }), t.addText(r.overview.title || "Structured lecture", {
    x: ze.TITLE_X,
    y: 3.72,
    w: 5.75,
    h: 0.48,
    fontFace: S.bodyFont,
    fontSize: 15,
    color: S.MUTED_ON_DARK,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addText("GENERATED FROM STRUCTURED LECTURE METADATA", {
    x: ze.TITLE_X,
    y: 5.45,
    w: 5.8,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: S.FONT_COVER_LABEL,
    bold: !0,
    charSpacing: 1.5,
    color: S.MUTED_ON_DARK,
    margin: 0
  }), rt(t, r.documentTitle, !0);
}
function Mt(e) {
  return e == null ? [] : typeof e == "string" ? e ? [{ text: e, emphasis: "none" }] : [] : e.filter((r) => r.text.length > 0).map((r) => ({ text: r.text, emphasis: r.emphasis ?? "none" }));
}
function De(e) {
  return Mt(e).map((r) => r.text).join("");
}
function Pa(e) {
  return typeof e == "string" ? e : e.text;
}
function Or(e) {
  return typeof e == "string" ? 0 : e.level ?? 0;
}
function Ti(e) {
  switch (e) {
    case "bold":
      return { bold: !0 };
    case "italic":
      return { italic: !0 };
    case "accent":
      return { color: S.accentColor };
    case "highlight":
      return { highlight: S.highlightColor };
    default:
      return {};
  }
}
function Be(e) {
  return Mt(e).map((r) => ({ text: r.text, options: Ti(r.emphasis) }));
}
function wa(e, r, t = 1) {
  const s = [];
  return e.forEach((n, o) => {
    const l = Mt(Pa(n)), A = Math.max(0, Or(n)), c = typeof n != "string" && n.__continued === !0, a = e.slice(0, o).filter(
      (f) => !(typeof f != "string" && f.__continued === !0)
    ).length, i = l.length ? l : [{ text: " ", emphasis: "none" }];
    i.forEach((f, y) => {
      const d = {
        ...Ti(f.emphasis),
        breakLine: o < e.length - 1 && y === i.length - 1,
        indentLevel: y === 0 ? A : void 0
      };
      if (y === 0) {
        const m = 18 + A * 16;
        c ? d.bullet = { characterCode: "200B", indent: m } : r === "bullet" ? d.bullet = { characterCode: "2022", indent: m } : d.bullet = {
          type: "number",
          numberType: "arabicPeriod",
          numberStartAt: t + a,
          indent: m
        };
      }
      s.push({ text: f.text, options: d });
    });
  }), s;
}
function Qo(e, r, t = Number.POSITIVE_INFINITY) {
  const s = Math.max(r, t);
  let n = 0;
  const o = [];
  for (const l of Mt(e)) {
    const A = n, c = n + l.text.length;
    if (n = c, c <= r || A >= s) continue;
    const a = Math.max(0, r - A), i = Math.min(l.text.length, s - A), f = l.text.slice(a, i);
    f && o.push({ text: f, ...l.emphasis !== "none" ? { emphasis: l.emphasis } : {} });
  }
  return typeof e == "string" ? o.map((l) => l.text).join("") : o;
}
function jo(e, r, t) {
  if (t >= e.length) return e.length;
  const s = Math.max(r + 1, r + Math.floor((t - r) * 0.55)), n = [`

`, ". ", "! ", "? ", "; ", ", ", " ", `
`];
  for (const o of n) {
    const l = e.lastIndexOf(o, t);
    if (l >= s) return l + o.length;
  }
  return t;
}
function Na(e, r) {
  const t = De(e);
  if (!t || t.length <= r) return [e];
  const s = Math.max(1, Math.floor(r)), n = [];
  let o = 0;
  for (; o < t.length; ) {
    const l = jo(t, o, Math.min(t.length, o + s));
    n.push(Qo(e, o, l)), o = l;
  }
  return n;
}
function Yo(e, r) {
  const t = e.addSlide();
  t.background = { color: S.SLIDE_BG }, tt(t, "Lecture overview", "Reading sequence"), t.addText(r.overview.title || "A sequence for learning", {
    x: Re.TITLE_X,
    y: Re.TITLE_Y,
    w: Re.TITLE_W,
    h: Re.TITLE_H,
    fontFace: S.headingFont,
    fontSize: S.FONT_SLIDE_TITLE,
    bold: !0,
    color: S.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), De(r.overview.introduction) && t.addText(Be(r.overview.introduction), {
    x: Re.LEFT_COL_X,
    y: Re.INTRO_Y,
    w: Re.LEFT_COL_W,
    h: Re.INTRO_H,
    fontFace: S.bodyFont,
    fontSize: S.FONT_OVERVIEW_INTRO,
    color: S.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
  const s = Math.max(1, r.sections.length), n = Math.min(0.68, 3.55 / s);
  r.sections.forEach((o, l) => {
    const A = 2.82 + l * n;
    t.addText(String(l + 1).padStart(2, "0"), {
      x: xe,
      y: A,
      w: 0.42,
      h: 0.18,
      fontFace: S.labelFont,
      fontSize: 9,
      bold: !0,
      color: l === 0 ? S.DARK_TEXT : S.MUTED_TEXT,
      margin: 0
    }), t.addShape("line", {
      x: 1.18,
      y: A + 0.09,
      w: 0.48,
      h: 0,
      line: { color: S.DIVIDER_COLOR, width: 0.7 }
    }), t.addText(o.sectionTitle, {
      x: 1.82,
      y: A - 0.05,
      w: 5.95,
      h: 0.28,
      fontFace: S.headingFont,
      fontSize: S.FONT_OVERVIEW_TOC,
      bold: !0,
      color: S.DARK_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      fit: "shrink"
    });
  }), t.addShape("rect", {
    x: Re.RIGHT_COL_X,
    y: Re.TOC_CARD_Y,
    w: Re.RIGHT_COL_W,
    h: Re.TOC_CARD_H,
    fill: { color: S.PAGE_BG },
    line: { color: S.PAGE_BG, width: 0 }
  }), t.addText("KEY IDEAS", {
    x: Re.RIGHT_COL_X + 0.36,
    y: Re.TOC_LABEL_Y,
    w: Re.RIGHT_COL_W - 0.72,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.5,
    color: S.MUTED_TEXT,
    margin: 0
  }), r.overview.keyPoints.length > 0 && t.addText(wa(r.overview.keyPoints.map((o) => ({ text: o })), "bullet"), {
    x: Re.RIGHT_COL_X + 0.34,
    y: Re.TOC_Y,
    w: Re.RIGHT_COL_W - 0.68,
    h: Re.TOC_H,
    fontFace: S.bodyFont,
    fontSize: S.FONT_OVERVIEW_KEYPOINT,
    color: S.BODY_TEXT,
    margin: 0.02,
    align: "left",
    valign: "top",
    wrap: !0,
    paraSpaceAfter: 9,
    fit: "shrink"
  }), rt(t, r.documentTitle);
}
function Ko(e, r, t) {
  const s = e.addSlide();
  s.background = { color: S.NAVY }, s.addShape("rect", {
    x: Ve.BAND_X,
    y: Ve.BAND_Y,
    w: Ve.BAND_W,
    h: Ve.BAND_H,
    fill: { color: S.GRAPHITE },
    line: { color: S.GRAPHITE, width: 0 }
  }), s.addShape("line", {
    x: Ve.BAND_X,
    y: 0,
    w: 0,
    h: S.SLIDE_HEIGHT,
    line: { color: S.DARK_RULE, width: 1 }
  }), Da(s, 9.15, 2.2, 3.4, 3.4), tt(s, `Section ${String(t + 1).padStart(2, "0")}`, r.sectionTitle, !0), s.addText(String(t + 1).padStart(2, "0"), {
    x: 10.05,
    y: Ve.NUMBER_Y,
    w: 1.45,
    h: Ve.NUMBER_H,
    fontFace: S.headingFont,
    fontSize: 40,
    bold: !0,
    color: S.DEEP_GRAY,
    margin: 0,
    align: "right",
    valign: "top"
  }), s.addText(r.sectionTitle, {
    x: xe,
    y: Ve.TITLE_Y,
    w: 6.4,
    h: Ve.TITLE_H,
    fontFace: S.headingFont,
    fontSize: S.FONT_SECTION_TITLE_SLIDE,
    bold: !0,
    color: S.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), s.addShape("line", {
    x: xe,
    y: 3.22,
    w: 1.12,
    h: 0,
    line: { color: S.WHITE, width: 2 }
  }), rt(s, r.sectionTitle, !0);
}
function Wa(e) {
  return [parseInt(e.slice(0, 2), 16), parseInt(e.slice(2, 4), 16), parseInt(e.slice(4, 6), 16)];
}
function Jo(e) {
  return e.map((r) => Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function Zo(e, r, t) {
  const s = Wa(e), n = Wa(r), o = Math.max(0, Math.min(1, t));
  return Jo([s[0] + (n[0] - s[0]) * o, s[1] + (n[1] - s[1]) * o, s[2] + (n[2] - s[2]) * o]);
}
function es(e, r, t, s) {
  if (e.tableType === "heatmap" && e.heatmap) {
    const n = e.heatmap.values[r]?.[t];
    if (typeof n == "number") {
      const o = e.heatmap.max - e.heatmap.min, l = o > 0 ? (n - e.heatmap.min) / o : 0;
      return Zo("FFFFFF", "B8B8B5", l);
    }
  }
  return e.tableType === "highlight" ? s % 2 === 0 ? "E6E6E4" : S.TABLE_ROW_EVEN_BG : s % 2 === 0 ? S.TABLE_ROW_ODD_BG : S.TABLE_ROW_EVEN_BG;
}
function qa(e) {
  return typeof e == "string" ? e : Be(e);
}
function Li(e, r, t, s = 0) {
  const n = e.headers.map((l) => ({
    text: qa(l),
    options: {
      bold: !0,
      color: S.TABLE_HEADER_TEXT,
      fill: { color: S.TABLE_HEADER_BG },
      valign: "middle",
      align: "left",
      fontSize: t,
      margin: 0.07
    }
  })), o = r.map((l, A) => l.map((c, a) => ({
    text: qa(c),
    options: {
      fill: { color: es(e, s + A, a, A) },
      valign: "middle",
      align: "left",
      color: S.BODY_TEXT,
      fontSize: t,
      margin: 0.07
    }
  })));
  return [n, ...o];
}
function ts(e, r = !0) {
  const t = (r ? S.H_TABLE_LABEL + 0.12 : 0) + S.H_TABLE_HEADER_ROW + 0.05;
  return Math.max(1, Math.floor((e - t) / S.H_TABLE_BODY_ROW));
}
function rs(e, r) {
  const t = Math.max(1, Math.floor(r));
  if (!e.length) return [[]];
  const s = [];
  for (let n = 0; n < e.length; n += t) s.push(e.slice(n, n + t));
  return s;
}
function as(e, r, t, s, n, o) {
  let l = s;
  e.addText(Be(r.label), {
    x: t,
    y: l,
    w: n,
    h: S.H_TABLE_LABEL,
    fontFace: S.headingFont,
    fontSize: S.FONT_TABLE_BODY + 2,
    bold: !0,
    color: S.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), l += S.H_TABLE_LABEL + 0.12;
  const A = r.__rowOffset ?? 0, c = Li(r, r.rows, S.FONT_TABLE_BODY, A), a = Array(r.headers.length).fill(n / r.headers.length);
  return e.addTable(c, {
    x: t,
    y: l,
    w: n,
    rowH: [S.H_TABLE_HEADER_ROW, ...Array(r.rows.length).fill(S.H_TABLE_BODY_ROW)],
    fontFace: S.bodyFont,
    fontSize: S.FONT_TABLE_BODY,
    border: { type: "solid", color: S.TABLE_BORDER, pt: 0.4 },
    colW: a,
    margin: 0.06
  }), l += S.H_TABLE_HEADER_ROW + r.rows.length * S.H_TABLE_BODY_ROW, l - s;
}
function ns(e, r, t) {
  const s = xt + 0.62, n = Ra - s - 0.08, o = Math.max(S.FONT_MIN_TABLE, r.headers.length > 6 ? S.FONT_TABLE_BODY - 1 : S.FONT_TABLE_BODY), l = ts(n, !0), A = rs(r.rows, l), c = Array(r.headers.length).fill(Te / r.headers.length);
  A.forEach((a, i) => {
    const f = e.addSlide();
    f.background = { color: S.SLIDE_BG }, tt(f, "Editable table", t);
    const y = i === 0 ? r.label : typeof r.label == "string" ? `${r.label} (continued ${i + 1}/${A.length})` : [...r.label, { text: ` (continued ${i + 1}/${A.length})`, emphasis: "italic" }];
    f.addText(Be(y), {
      x: xe,
      y: xt,
      w: Math.min(Te, 9.5),
      h: S.H_TABLE_LABEL + 0.25,
      fontFace: S.headingFont,
      fontSize: 22,
      bold: i === 0,
      italic: i > 0,
      color: i === 0 ? S.DARK_TEXT : S.MUTED_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      fit: "shrink"
    });
    const d = s, u = (r.__rowOffset ?? 0) + i * l;
    f.addTable(Li(r, a, o, u), {
      x: xe,
      y: d,
      w: Te,
      rowH: [S.H_TABLE_HEADER_ROW, ...Array(a.length).fill(S.H_TABLE_BODY_ROW)],
      fontFace: S.bodyFont,
      fontSize: o,
      border: { type: "solid", color: S.TABLE_BORDER, pt: 0.4 },
      colW: c,
      margin: 0.06
    }), rt(f, t);
  });
}
function Ri(e, r = S.DIAGRAM_MAX_NODES_PER_ROW) {
  const t = Math.max(1, Math.floor(r)), s = [];
  for (const n of e)
    for (let o = 0; o < n.length; o += t) s.push(n.slice(o, o + t));
  return s;
}
function is(e) {
  const r = S.H_DIAGRAM_LABEL + 0.12, t = S.DIAGRAM_NODE_HEIGHT + S.DIAGRAM_ROW_V_GAP;
  return Math.max(1, Math.floor((e - r + S.DIAGRAM_ROW_V_GAP) / t));
}
function os(e, r) {
  const t = Ri(e), s = Math.max(1, Math.floor(r));
  if (!t.length) return [[]];
  const n = [];
  for (let o = 0; o < t.length; o += s) n.push(t.slice(o, o + s));
  return n;
}
function Va(e, r, t, s, n) {
  e.addShape("line", {
    x: r,
    y: t,
    w: s,
    h: n,
    line: { color: S.DIAGRAM_CONNECTOR, width: 1.15, endArrowType: "triangle" }
  });
}
function Di(e, r, t, s, n, o) {
  let l = s;
  e.addText(Be(r.label), {
    x: t,
    y: l,
    w: n,
    h: S.H_DIAGRAM_LABEL,
    fontFace: S.headingFont,
    fontSize: S.FONT_DIAGRAM_NODE + 2,
    bold: !0,
    color: S.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), l += S.H_DIAGRAM_LABEL + 0.12;
  const A = Ri(r.diagramRows), c = S.DIAGRAM_NODE_HEIGHT, a = S.DIAGRAM_NODE_H_GAP, i = S.DIAGRAM_ROW_V_GAP;
  return A.forEach((f, y) => {
    if (!f.length) return;
    const d = Math.min(
      S.DIAGRAM_NODE_WIDTH,
      Math.max(0.82, (n - (f.length - 1) * a) / f.length)
    ), m = f.length * d + (f.length - 1) * a, u = t + Math.max(0, (n - m) / 2);
    f.forEach((g, p) => {
      const h = u + p * (d + a), _ = p === f.length - 1 && y === A.length - 1;
      e.addShape("roundRect", {
        x: h,
        y: l,
        w: d,
        h: c,
        rectRadius: 0.06,
        fill: { color: _ ? S.NAVY : S.DIAGRAM_NODE_BG },
        line: { color: S.DIAGRAM_NODE_BORDER, width: 0.8 }
      }), e.addText(Be(g), {
        x: h + 0.08,
        y: l + 0.05,
        w: d - 0.16,
        h: c - 0.1,
        fontFace: S.bodyFont,
        fontSize: S.FONT_DIAGRAM_NODE,
        bold: !0,
        color: _ ? S.WHITE : S.DIAGRAM_NODE_TEXT,
        margin: 0,
        align: "center",
        valign: "middle",
        wrap: !0,
        fit: "shrink"
      }), p < f.length - 1 && Va(e, h + d + 0.04, l + c / 2, a - 0.08, 0);
    }), l += c, y < A.length - 1 && (Va(e, t + n / 2, l + 0.04, 0, i - 0.08), l += i);
  }), l - s;
}
function ss(e, r, t) {
  const s = xt, n = xt + 0.72, o = Ra - n - 0.08, l = os(r.diagramRows, is(o));
  l.forEach((A, c) => {
    const a = e.addSlide();
    a.background = { color: S.SLIDE_BG }, tt(a, "Editable diagram", t);
    const i = c === 0 ? r.label : typeof r.label == "string" ? `${r.label} (continued ${c + 1}/${l.length})` : [...r.label, { text: ` (continued ${c + 1}/${l.length})`, emphasis: "italic" }];
    a.addText(Be(i), {
      x: xe,
      y: s,
      w: Math.min(Te, 9.5),
      h: 0.54,
      fontFace: S.headingFont,
      fontSize: 22,
      bold: c === 0,
      italic: c > 0,
      color: c === 0 ? S.DARK_TEXT : S.MUTED_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      fit: "shrink"
    }), Di(a, { ...r, label: "", diagramRows: A }, xe, n, Te), rt(a, t);
  });
}
function wt(e, r, t) {
  const s = 8.5 * (13 / t), n = Math.max(1, Math.floor(r * s)), o = Math.max(1, Math.ceil(De(e).length / n)), l = t / 72 * S.LINE_SPACING * 1.2;
  return o * l;
}
function ls(e) {
  return e === "note" ? S.CALLOUT_NOTE_BORDER : e === "warning" ? S.CALLOUT_WARNING_BORDER : S.CALLOUT_INFO_BORDER;
}
function cs(e) {
  return e === "note" ? S.CALLOUT_NOTE_LABEL : e === "warning" ? S.CALLOUT_WARNING_LABEL : S.CALLOUT_INFO_LABEL;
}
function As(e) {
  return e === "note" ? "NOTE" : e === "warning" ? "WARNING" : "INFO";
}
function ds(e) {
  return e.type === "image" ? !0 : e.type === "table" ? e.headers.length > S.TABLE_LARGE_THRESHOLD : e.type === "diagram" ? e.diagramRows.reduce((t, s) => t + s.length, 0) > S.DIAGRAM_LARGE_THRESHOLD : !1;
}
function fs(e) {
  if (e.type === "image") return { type: "image", block: e };
  if (e.type === "table") return { type: "dedicated-table", block: e };
  if (e.type === "diagram") return { type: "dedicated-diagram", block: e };
  throw new Error(`blockToFragment: unsupported dedicated block type: ${e.type}`);
}
function Sr(e, r) {
  const t = Or(e), s = Math.max(1, Te - 0.2 - t * 0.25);
  return Math.max(
    r === S.FONT_NUMBERED ? S.H_NUMBERED_ITEM : S.H_BULLET_ITEM,
    wt(Pa(e), s, r) + 0.04
  );
}
function _a(e) {
  const r = S.BLOCK_GAP;
  switch (e.type) {
    case "subtitle":
      return Math.max(S.H_SUBTITLE_BLOCK, wt(e.text, Te, S.FONT_SUBTITLE_BLOCK)) + r;
    case "paragraph":
      return Math.max(0.3, wt(e.text, Te, S.FONT_PARAGRAPH) + 0.08) + r;
    case "bullets":
      return e.items.reduce((t, s) => t + Sr(s, S.FONT_BULLET), 0) + 0.08 + r;
    case "numbered":
      return e.items.reduce((t, s) => t + Sr(s, S.FONT_NUMBERED), 0) + 0.08 + r;
    case "callout":
      return Math.max(
        S.H_CALLOUT_MIN,
        wt(e.text, Te - 0.3, S.FONT_CALLOUT_TEXT) + 0.36
      ) + r;
    case "table":
      return S.H_TABLE_LABEL + 0.04 + S.H_TABLE_HEADER_ROW + e.rows.length * S.H_TABLE_BODY_ROW + r;
    case "diagram":
      return S.H_DIAGRAM_LABEL + 0.06 + e.diagramRows.length * S.DIAGRAM_NODE_HEIGHT + Math.max(0, e.diagramRows.length - 1) * S.DIAGRAM_ROW_V_GAP + r;
    case "image":
      return 0;
  }
}
function us(e) {
  const r = [], t = [...e.blocks];
  let s = [], n = 0, o = !0, l = 1;
  const A = (a) => {
    const i = a && e.slideTitle.trim().length > 0, f = a && De(e.slideSubtitle).trim().length > 0;
    return Math.max(0.25, Vo(i, f) - 0.55);
  }, c = () => {
    s.length !== 0 && (r.push({ type: "content", blocks: s }), s = [], n = 0, o = !1);
  };
  for (; t.length > 0; ) {
    const a = t.shift();
    if (ds(a)) {
      c(), r.push(fs(a));
      continue;
    }
    const i = A(o && s.length === 0), f = i - n, y = _a(a);
    if (y <= f + 1e-3) {
      s.push(a), n += y;
      continue;
    }
    if (s.length > 0) {
      c(), t.unshift(a);
      continue;
    }
    const d = hs(a, i, l++);
    s.push(d.head), n += _a(d.head), c(), d.tail && t.unshift(d.tail);
  }
  return c(), r;
}
function hs(e, r, t) {
  switch (e.type) {
    case "paragraph":
      return ps(e, r, t);
    case "bullets":
    case "numbered":
      return gs(e, r, t);
    case "callout":
      return ms(e, r, t);
    case "table":
      return vs(e, r, t);
    default:
      return { head: e };
  }
}
function ps(e, r, t) {
  const s = Math.max(0.2, r - S.BLOCK_GAP - 0.08), n = wt(e.text, Te, S.FONT_PARAGRAPH), o = De(e.text).length, l = Math.max(24, Math.floor(o * Math.min(0.9, s / Math.max(n, 0.01)))), [A, ...c] = Na(e.text, l);
  return c.length === 0 ? { head: e } : {
    head: { ...e, text: A },
    tail: {
      ...e,
      blockId: It(e.blockId, t),
      text: Ni(c)
    }
  };
}
function ms(e, r, t) {
  const s = Math.max(0.2, r - S.BLOCK_GAP - 0.36), n = wt(e.text, Te - 0.3, S.FONT_CALLOUT_TEXT), o = De(e.text).length, l = Math.max(24, Math.floor(o * Math.min(0.9, s / Math.max(n, 0.01)))), [A, ...c] = Na(e.text, l);
  return c.length === 0 ? { head: e } : {
    head: { ...e, text: A },
    tail: {
      ...e,
      blockId: It(e.blockId, t),
      label: Pi(e.label, " (continued)"),
      text: Ni(c)
    }
  };
}
function gs(e, r, t) {
  const s = e.type === "bullets" ? S.FONT_BULLET : S.FONT_NUMBERED, n = Math.max(0.15, r - S.BLOCK_GAP - 0.08), o = ys(e.items, n, s), l = [];
  let A = 0;
  for (const a of o) {
    const i = Sr(a, s);
    if (l.length > 0 && A + i > n) break;
    l.push(a), A += i;
  }
  if (l.length === o.length) return { head: { ...e, items: o } };
  const c = o.slice(l.length);
  if (e.type === "numbered") {
    const a = e.startAt ?? 1, i = l.filter((f) => !bs(f)).length;
    return {
      head: { ...e, items: l, startAt: a },
      tail: {
        ...e,
        blockId: It(e.blockId, t),
        items: c,
        startAt: a + i
      }
    };
  }
  return {
    head: { ...e, items: l },
    tail: { ...e, blockId: It(e.blockId, t), items: c }
  };
}
function ys(e, r, t) {
  const s = [];
  for (const n of e) {
    const o = Sr(n, t);
    if (o <= r) {
      s.push(n);
      continue;
    }
    const l = Pa(n), A = De(l).length, c = Math.max(20, Math.floor(A * Math.min(0.85, r / Math.max(o, 0.01)))), a = Na(l, c), i = Or(n);
    a.forEach((f, y) => {
      y === 0 && typeof n == "string" && i === 0 ? s.push(f) : s.push({ text: f, level: i, ...y > 0 ? { __continued: !0 } : {} });
    });
  }
  return s;
}
function vs(e, r, t) {
  const s = S.H_TABLE_LABEL + 0.04 + S.H_TABLE_HEADER_ROW + S.BLOCK_GAP, n = Math.max(1, Math.floor((r - s) / S.H_TABLE_BODY_ROW));
  if (e.rows.length <= n) return { head: e };
  const o = e.rows.slice(0, n), l = e.rows.slice(n), A = e, c = A.__continued === !0, a = A.__rowOffset ?? 0;
  return {
    head: { ...e, rows: o, __rowOffset: a },
    tail: {
      ...e,
      blockId: It(e.blockId, t),
      label: c ? e.label : Pi(e.label, " (continued)"),
      rows: l,
      __continued: !0,
      __rowOffset: a + o.length
    }
  };
}
function It(e, r) {
  return `${e}--continuation-${r}`;
}
function Pi(e, r) {
  return typeof e == "string" ? `${e}${r}` : [...e, { text: r, emphasis: "italic" }];
}
function Ni(e) {
  const r = e.flatMap(
    (t) => typeof t == "string" ? [{ text: t, emphasis: "none" }] : t
  );
  return r.length === 1 && r[0].emphasis === "none" ? r[0].text : r;
}
function bs(e) {
  return typeof e != "string" && e.__continued === !0;
}
function ws(e, r, t) {
  const s = e.addSlide();
  s.background = { color: S.SLIDE_BG }, tt(s, "Lecture content", t.sectionTitle);
  const n = t.isFirstPage && !!t.slideTitle.trim(), o = t.isFirstPage && !!De(t.slideSubtitle).trim();
  if (n) {
    const A = Kr(!1, !1);
    s.addText(t.slideTitle, {
      x: xe,
      y: A,
      w: Math.min(Te, 8.5),
      h: S.TITLE_HEIGHT,
      fontFace: S.headingFont,
      fontSize: S.FONT_SLIDE_TITLE,
      bold: !0,
      color: S.DARK_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      wrap: !0,
      fit: "shrink"
    }), s.addShape("line", {
      x: xe,
      y: A + S.TITLE_HEIGHT + 0.03,
      w: 1.12,
      h: 0,
      line: { color: S.DARK_TEXT, width: 1.4 }
    });
  }
  o && s.addText(Be(t.slideSubtitle), {
    x: xe,
    y: Kr(n, !1),
    w: Math.min(Te, 8.4),
    h: S.SUBTITLE_HEIGHT,
    fontFace: S.bodyFont,
    fontSize: S.FONT_SLIDE_SUBTITLE,
    color: S.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
  let l = Kr(n, o);
  for (const A of r) {
    const c = Math.max(0.1, _a(A) - S.BLOCK_GAP);
    switch (A.type) {
      case "subtitle":
        s.addText(Be(A.text), {
          x: xe,
          y: l,
          w: Math.min(Te, 8.8),
          h: c,
          fontFace: S.headingFont,
          fontSize: S.FONT_SUBTITLE_BLOCK,
          bold: !0,
          color: S.DARK_TEXT,
          margin: 0,
          align: "left",
          valign: "top",
          wrap: !0,
          fit: "shrink"
        });
        break;
      case "paragraph":
        s.addText(Be(A.text), {
          x: xe,
          y: l,
          w: Math.min(Te, 9.05),
          h: c,
          fontFace: S.bodyFont,
          fontSize: S.FONT_PARAGRAPH,
          color: S.BODY_TEXT,
          margin: 0,
          align: "left",
          valign: "top",
          wrap: !0,
          paraSpaceAfter: 7,
          breakLine: !1,
          fit: "shrink"
        });
        break;
      case "bullets":
        s.addText(wa(A.items, "bullet"), {
          x: xe + 0.02,
          y: l,
          w: Math.min(Te - 0.02, 9.5),
          h: c,
          fontFace: S.bodyFont,
          fontSize: S.FONT_BULLET,
          color: S.BODY_TEXT,
          margin: 0.01,
          align: "left",
          valign: "top",
          wrap: !0,
          paraSpaceAfter: 8,
          fit: "shrink"
        });
        break;
      case "numbered":
        s.addText(wa(A.items, "number", A.startAt ?? 1), {
          x: xe + 0.02,
          y: l,
          w: Math.min(Te - 0.02, 9.5),
          h: c,
          fontFace: S.bodyFont,
          fontSize: S.FONT_NUMBERED,
          color: S.BODY_TEXT,
          margin: 0.01,
          align: "left",
          valign: "top",
          wrap: !0,
          paraSpaceAfter: 8,
          fit: "shrink"
        });
        break;
      case "callout": {
        const a = ls(A.tone), i = cs(A.tone), f = Math.min(Te, 9.35);
        s.addShape("line", {
          x: xe,
          y: l,
          w: 0,
          h: c,
          line: { color: a, width: 1.6 }
        }), s.addText([
          { text: `${As(A.tone)} / `, options: { bold: !0, color: i } },
          ...Be(A.label)
        ], {
          x: xe + 0.2,
          y: l + 0.02,
          w: f - 0.2,
          h: 0.22,
          fontFace: S.labelFont,
          fontSize: S.FONT_CALLOUT_LABEL,
          bold: !0,
          charSpacing: 1.1,
          color: i,
          margin: 0,
          align: "left",
          valign: "top",
          fit: "shrink"
        }), s.addText(Be(A.text), {
          x: xe + 0.2,
          y: l + 0.3,
          w: f - 0.2,
          h: Math.max(0.18, c - 0.32),
          fontFace: S.bodyFont,
          fontSize: S.FONT_CALLOUT_TEXT,
          color: S.BODY_TEXT,
          margin: 0,
          align: "left",
          valign: "top",
          wrap: !0,
          fit: "shrink"
        });
        break;
      }
      case "table": {
        const a = A.headers.length <= S.TABLE_LARGE_THRESHOLD ? Te * 0.82 : Te;
        as(s, A, xe, l, a);
        break;
      }
      case "diagram": {
        const i = A.diagramRows.reduce((f, y) => f + y.length, 0) <= S.DIAGRAM_LARGE_THRESHOLD ? Te * 0.82 : Te;
        Di(s, A, xe, l, i);
        break;
      }
    }
    l += c + S.BLOCK_GAP;
  }
  rt(s, t.sectionTitle);
}
function _s(e, r, t, s, n) {
  if (!n || !Number.isFinite(n) || n <= 0) return { x: e, y: r, w: t, h: s };
  const o = t / s, l = n >= o ? t : s * n, A = n >= o ? t / n : s;
  return { x: e + (t - l) / 2, y: r + (s - A) / 2, w: l, h: A };
}
function Cs(e, r, t, s) {
  return { x: e, y: r, w: t, h: s };
}
function xs(e) {
  if (typeof atob == "function") {
    const r = atob(e.replace(/\s/g, ""));
    return Uint8Array.from(r, (t) => t.charCodeAt(0));
  }
  return new Uint8Array(Buffer.from(e, "base64"));
}
function _t(e) {
  return new TextDecoder().decode(e);
}
function Bi(e) {
  const r = /^data:([^;,]+)(;base64)?,(.*)$/is.exec(e.trim());
  if (!(!r || !r[1].toLowerCase().startsWith("image/")))
    try {
      const t = r[2] ? xs(r[3]) : new TextEncoder().encode(decodeURIComponent(r[3]));
      return { mimeType: r[1].toLowerCase(), bytes: t, ...r[1].toLowerCase() === "image/svg+xml" ? { text: _t(t) } : {} };
    } catch {
      return;
    }
}
function Es(e) {
  const r = Bi(e);
  return !!(r && ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"].includes(r.mimeType));
}
function Zr(e, r) {
  return e[r] * 256 + e[r + 1];
}
function Ha(e, r) {
  return e[r] * 16777216 + e[r + 1] * 65536 + e[r + 2] * 256 + e[r + 3];
}
function kr(e, r) {
  return e[r] + e[r + 1] * 256;
}
function Qa(e, r) {
  return e[r] + e[r + 1] * 256 + e[r + 2] * 65536;
}
function Ts(e) {
  if (!(e.length < 24 || e[0] !== 137 || e[1] !== 80 || e[2] !== 78 || e[3] !== 71))
    return [Ha(e, 16), Ha(e, 20)];
}
function Ls(e) {
  if (!(e.length < 10 || _t(e.slice(0, 3)) !== "GIF"))
    return [kr(e, 6), kr(e, 8)];
}
function Rs(e) {
  if (e.length < 4 || e[0] !== 255 || e[1] !== 216) return;
  let r = 2;
  const t = /* @__PURE__ */ new Set([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207]);
  for (; r + 8 < e.length; ) {
    if (e[r] !== 255) {
      r++;
      continue;
    }
    for (; e[r] === 255; ) r++;
    const s = e[r++];
    if (s === 217 || s === 218) break;
    const n = Zr(e, r);
    if (t.has(s) && r + 7 < e.length) return [Zr(e, r + 5), Zr(e, r + 3)];
    if (n < 2) break;
    r += n;
  }
}
function Ds(e) {
  if (e.length < 30 || _t(e.slice(0, 4)) !== "RIFF" || _t(e.slice(8, 12)) !== "WEBP") return;
  const r = _t(e.slice(12, 16));
  if (r === "VP8X") return [1 + Qa(e, 24), 1 + Qa(e, 27)];
  if (r === "VP8L" && e[20] === 47) {
    const t = e[21] | e[22] << 8 | e[23] << 16 | e[24] << 24;
    return [(t & 16383) + 1, (t >> 14 & 16383) + 1];
  }
  if (r === "VP8 " && e.length >= 30) return [kr(e, 26) & 16383, kr(e, 28) & 16383];
}
function Ps(e) {
  const r = /<svg\b[^>]*>/i.exec(e)?.[0];
  if (!r) return;
  const t = (l) => {
    const A = new RegExp(`${l}\\s*=\\s*["']\\s*([0-9.]+)`, "i").exec(r)?.[1];
    return A ? Number(A) : void 0;
  }, s = t("width"), n = t("height");
  if (s && n) return [s, n];
  const o = /viewBox\s*=\s*["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)/i.exec(r);
  return o ? [Number(o[1]), Number(o[2])] : void 0;
}
function Ns(e) {
  const r = Bi(e);
  if (!r) return;
  let t;
  switch (r.mimeType) {
    case "image/png":
      t = Ts(r.bytes);
      break;
    case "image/jpeg":
    case "image/jpg":
      t = Rs(r.bytes);
      break;
    case "image/gif":
      t = Ls(r.bytes);
      break;
    case "image/webp":
      t = Ds(r.bytes);
      break;
    case "image/svg+xml":
      t = Ps(r.text ?? _t(r.bytes));
      break;
  }
  if (!(!t || t[0] <= 0 || t[1] <= 0))
    return { width: t[0], height: t[1], mimeType: r.mimeType, aspect: t[0] / t[1] };
}
function Bs(e, r, t, s) {
  const n = [], o = e.addSlide();
  o.background = { color: S.SLIDE_BG }, tt(o, "Image evidence", s);
  const l = { x: xe, y: 1.55, w: 6.15, h: 4.72 }, A = { x: 7.32, y: 1.62, w: 4.7 };
  o.addShape("roundRect", {
    ...l,
    rectRadius: 0.06,
    fill: { color: S.WHITE },
    line: { color: S.DIVIDER_COLOR, width: 0.6 }
  });
  const c = t[r.slotId];
  let a = !1;
  const i = { x: l.x + 0.22, y: l.y + 0.22, w: l.w - 0.44, h: l.h - 0.44 };
  if (!c?.dataUrl)
    n.push(`Image slot "${r.slotId}" (${De(r.label)}) has no imported image — placeholder shown.`);
  else if (!Es(c.dataUrl))
    n.push(`Image slot "${r.slotId}" is not a supported PNG, JPEG, GIF, WebP, or SVG data URL — placeholder shown.`);
  else {
    const f = Ns(c.dataUrl);
    if (!f)
      n.push(`Image slot "${r.slotId}" could not be decoded safely — placeholder shown.`);
    else
      try {
        if (r.fit === "cover") {
          const y = Cs(i.x, i.y, i.w, i.h);
          o.addImage({
            data: c.dataUrl,
            ...y,
            sizing: { type: "cover", w: y.w, h: y.h }
          });
        } else
          o.addImage({ data: c.dataUrl, ..._s(i.x, i.y, i.w, i.h, f.aspect) });
        a = !0;
      } catch (y) {
        const d = y instanceof Error ? y.message : String(y);
        n.push(`Image slot "${r.slotId}" failed to embed (${d}) — placeholder shown.`);
      }
  }
  return a || Ss(o, r, i.x, i.y, i.w, i.h), o.addText("IMAGE / EDITABLE OBJECT", {
    x: A.x,
    y: A.y,
    w: A.w,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.5,
    color: S.MUTED_TEXT,
    margin: 0
  }), o.addText(Be(r.label), {
    x: A.x,
    y: A.y + 0.45,
    w: A.w,
    h: 0.82,
    fontFace: S.headingFont,
    fontSize: 23,
    bold: !0,
    color: S.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), o.addShape("line", {
    x: A.x,
    y: A.y + 1.5,
    w: 1.05,
    h: 0,
    line: { color: S.DARK_TEXT, width: 1.4 }
  }), De(r.description).trim() && o.addText(Be(r.description), {
    x: A.x,
    y: A.y + 1.82,
    w: A.w,
    h: 1.55,
    fontFace: S.bodyFont,
    fontSize: 15,
    color: S.BODY_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), o.addText(r.fit === "cover" ? "COVER CROP" : "CONTAIN / FULL IMAGE", {
    x: A.x,
    y: A.y + 3.72,
    w: A.w,
    h: 0.18,
    fontFace: S.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.2,
    color: S.MUTED_TEXT,
    margin: 0
  }), r.sourceReference && o.addText(`Source: ${r.sourceReference}`, {
    x: A.x,
    y: A.y + 4.06,
    w: A.w,
    h: 0.22,
    fontFace: S.bodyFont,
    fontSize: S.FONT_CAPTION,
    italic: !0,
    color: S.CAPTION_COLOR,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), rt(o, s), { rendered: a, warnings: n };
}
function Ss(e, r, t, s, n, o) {
  e.addShape("rect", {
    x: t,
    y: s,
    w: n,
    h: o,
    fill: { color: S.PLACEHOLDER_BG },
    line: { color: S.PLACEHOLDER_BORDER, width: 1, dashType: "dash" }
  }), e.addText("[Image not imported]", {
    x: t + 0.4,
    y: s + o / 2 - 0.2,
    w: n - 0.8,
    h: 0.22,
    fontFace: S.labelFont,
    fontSize: 9,
    bold: !0,
    charSpacing: 1.2,
    color: S.PLACEHOLDER_TEXT,
    margin: 0,
    align: "center",
    valign: "middle"
  }), e.addText(Be(r.label), {
    x: t + 0.5,
    y: s + o / 2 + 0.12,
    w: n - 1,
    h: 0.48,
    fontFace: S.bodyFont,
    fontSize: 12,
    color: S.BODY_TEXT,
    margin: 0,
    align: "center",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
}
function ks(e, r) {
  const t = e.addSlide();
  t.background = { color: S.NAVY }, t.addShape("rect", {
    x: 8.68,
    y: 0,
    w: S.SLIDE_WIDTH - 8.68,
    h: S.SLIDE_HEIGHT,
    fill: { color: S.GRAPHITE },
    line: { color: S.GRAPHITE, width: 0 }
  }), t.addShape("line", {
    x: 8.68,
    y: 0,
    w: 0,
    h: S.SLIDE_HEIGHT,
    line: { color: S.DARK_RULE, width: 1 }
  }), Da(t, 9.12, 1.85, 3.55, 3.85), tt(t, "Discussion / next step", "", !0), t.addText(Be(De(r.endNote) ? r.endNote : "Questions and discussion"), {
    x: xe,
    y: Jr.TEXT_Y,
    w: 6.45,
    h: Jr.TEXT_H,
    fontFace: S.headingFont,
    fontSize: 30,
    bold: !0,
    color: S.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addShape("line", {
    x: xe,
    y: Jr.UNDERLINE_Y,
    w: 1.12,
    h: 0,
    line: { color: S.WHITE, width: 2 }
  }), t.addText(r.documentTitle, {
    x: xe,
    y: 5.9,
    w: 6.4,
    h: 0.3,
    fontFace: S.bodyFont,
    fontSize: 11,
    color: S.MUTED_ON_DARK,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), rt(t, r.documentTitle, !0);
}
function Is(e, r, t, s) {
  Ho(e, r), Yo(e, r);
  for (let n = 0; n < r.sections.length; n++) {
    const o = r.sections[n];
    Ko(e, o, n);
    for (const l of o.slides) {
      const A = us(l);
      let c = 0;
      for (const a of A)
        switch (a.type) {
          case "content": {
            const i = c === 0;
            ws(e, a.blocks, {
              slideTitle: i ? l.slideTitle : "",
              slideSubtitle: i ? l.slideSubtitle : "",
              isFirstPage: i,
              sectionTitle: o.sectionTitle
            }), c++;
            break;
          }
          case "image": {
            const i = Bs(e, a.block, t, o.sectionTitle);
            s.push(...i.warnings);
            break;
          }
          case "dedicated-table":
            ns(e, a.block, o.sectionTitle);
            break;
          case "dedicated-diagram":
            ss(e, a.block, o.sectionTitle);
            break;
        }
    }
  }
  ks(e, r);
}
function Fs(e) {
  const r = [];
  for (const t of e) {
    const s = t.x + t.w, n = t.y + t.h, o = t.label ?? "Object";
    if (![t.x, t.y, t.w, t.h].every(Number.isFinite)) {
      r.push(`${o}: geometry contains a non-finite value`);
      continue;
    }
    (t.w < -1e-3 || t.h < -1e-3) && r.push(`${o}: width and height must be non-negative`), t.x < -1e-3 && r.push(`${o}: x=${t.x.toFixed(3)} is past left edge`), t.y < -1e-3 && r.push(`${o}: y=${t.y.toFixed(3)} is past top edge`), s > S.SLIDE_WIDTH + 1e-3 && r.push(`${o}: right=${s.toFixed(3)} exceeds slide width ${S.SLIDE_WIDTH}`), n > S.SLIDE_HEIGHT + 1e-3 && r.push(`${o}: bottom=${n.toFixed(3)} exceeds slide height ${S.SLIDE_HEIGHT}`);
  }
  return { valid: r.length === 0, violations: r };
}
function Ms(e, r) {
  if (!e || typeof e != "object") return;
  const t = e, s = t.options ?? t._options ?? t, n = s.x, o = s.y, l = s.w, A = s.h;
  if ([n, o, l, A].every((c) => typeof c == "number"))
    return { x: n, y: o, w: l, h: A, label: r };
}
function Os(e) {
  const r = e, t = r.slides ?? r._slides ?? [], s = [];
  let n = 0;
  return t.forEach((o, l) => {
    const c = (o._slideObjects ?? o.slideObjects ?? []).map((a, i) => Ms(a, `slide ${l + 1} object ${i + 1}`)).filter((a) => !!a);
    n += c.length, s.push(...Fs(c).violations);
  }), { valid: s.length === 0, violations: s, checkedObjects: n };
}
var Xt = { exports: {} }, ea = {}, He = {}, st = {}, ta = {}, ra = {}, aa = {}, ja;
function Ir() {
  return ja || (ja = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class r {
    }
    e._CodeOrName = r, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class t extends r {
      constructor(h) {
        if (super(), !e.IDENTIFIER.test(h))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = h;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = t;
    class s extends r {
      constructor(h) {
        super(), this._items = typeof h == "string" ? [h] : h;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const h = this._items[0];
        return h === "" || h === '""';
      }
      get str() {
        var h;
        return (h = this._str) !== null && h !== void 0 ? h : this._str = this._items.reduce((_, E) => `${_}${E}`, "");
      }
      get names() {
        var h;
        return (h = this._names) !== null && h !== void 0 ? h : this._names = this._items.reduce((_, E) => (E instanceof t && (_[E.str] = (_[E.str] || 0) + 1), _), {});
      }
    }
    e._Code = s, e.nil = new s("");
    function n(p, ...h) {
      const _ = [p[0]];
      let E = 0;
      for (; E < h.length; )
        A(_, h[E]), _.push(p[++E]);
      return new s(_);
    }
    e._ = n;
    const o = new s("+");
    function l(p, ...h) {
      const _ = [d(p[0])];
      let E = 0;
      for (; E < h.length; )
        _.push(o), A(_, h[E]), _.push(o, d(p[++E]));
      return c(_), new s(_);
    }
    e.str = l;
    function A(p, h) {
      h instanceof s ? p.push(...h._items) : h instanceof t ? p.push(h) : p.push(f(h));
    }
    e.addCodeArg = A;
    function c(p) {
      let h = 1;
      for (; h < p.length - 1; ) {
        if (p[h] === o) {
          const _ = a(p[h - 1], p[h + 1]);
          if (_ !== void 0) {
            p.splice(h - 1, 3, _);
            continue;
          }
          p[h++] = "+";
        }
        h++;
      }
    }
    function a(p, h) {
      if (h === '""')
        return p;
      if (p === '""')
        return h;
      if (typeof p == "string")
        return h instanceof t || p[p.length - 1] !== '"' ? void 0 : typeof h != "string" ? `${p.slice(0, -1)}${h}"` : h[0] === '"' ? p.slice(0, -1) + h.slice(1) : void 0;
      if (typeof h == "string" && h[0] === '"' && !(p instanceof t))
        return `"${p}${h.slice(1)}`;
    }
    function i(p, h) {
      return h.emptyStr() ? p : p.emptyStr() ? h : l`${p}${h}`;
    }
    e.strConcat = i;
    function f(p) {
      return typeof p == "number" || typeof p == "boolean" || p === null ? p : d(Array.isArray(p) ? p.join(",") : p);
    }
    function y(p) {
      return new s(d(p));
    }
    e.stringify = y;
    function d(p) {
      return JSON.stringify(p).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = d;
    function m(p) {
      return typeof p == "string" && e.IDENTIFIER.test(p) ? new s(`.${p}`) : n`[${p}]`;
    }
    e.getProperty = m;
    function u(p) {
      if (typeof p == "string" && e.IDENTIFIER.test(p))
        return new s(`${p}`);
      throw new Error(`CodeGen: invalid export name: ${p}, use explicit $id name mapping`);
    }
    e.getEsmExportName = u;
    function g(p) {
      return new s(p.toString());
    }
    e.regexpCode = g;
  })(aa)), aa;
}
var na = {}, Ya;
function Ka() {
  return Ya || (Ya = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const r = /* @__PURE__ */ Ir();
    class t extends Error {
      constructor(a) {
        super(`CodeGen: "code" for ${a} not defined`), this.value = a.value;
      }
    }
    var s;
    (function(c) {
      c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
    })(s || (e.UsedValueState = s = {})), e.varKinds = {
      const: new r.Name("const"),
      let: new r.Name("let"),
      var: new r.Name("var")
    };
    class n {
      constructor({ prefixes: a, parent: i } = {}) {
        this._names = {}, this._prefixes = a, this._parent = i;
      }
      toName(a) {
        return a instanceof r.Name ? a : this.name(a);
      }
      name(a) {
        return new r.Name(this._newName(a));
      }
      _newName(a) {
        const i = this._names[a] || this._nameGroup(a);
        return `${a}${i.index++}`;
      }
      _nameGroup(a) {
        var i, f;
        if (!((f = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || f === void 0) && f.has(a) || this._prefixes && !this._prefixes.has(a))
          throw new Error(`CodeGen: prefix "${a}" is not allowed in this scope`);
        return this._names[a] = { prefix: a, index: 0 };
      }
    }
    e.Scope = n;
    class o extends r.Name {
      constructor(a, i) {
        super(i), this.prefix = a;
      }
      setValue(a, { property: i, itemIndex: f }) {
        this.value = a, this.scopePath = (0, r._)`.${new r.Name(i)}[${f}]`;
      }
    }
    e.ValueScopeName = o;
    const l = (0, r._)`\n`;
    class A extends n {
      constructor(a) {
        super(a), this._values = {}, this._scope = a.scope, this.opts = { ...a, _n: a.lines ? l : r.nil };
      }
      get() {
        return this._scope;
      }
      name(a) {
        return new o(a, this._newName(a));
      }
      value(a, i) {
        var f;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const y = this.toName(a), { prefix: d } = y, m = (f = i.key) !== null && f !== void 0 ? f : i.ref;
        let u = this._values[d];
        if (u) {
          const h = u.get(m);
          if (h)
            return h;
        } else
          u = this._values[d] = /* @__PURE__ */ new Map();
        u.set(m, y);
        const g = this._scope[d] || (this._scope[d] = []), p = g.length;
        return g[p] = i.ref, y.setValue(i, { property: d, itemIndex: p }), y;
      }
      getValue(a, i) {
        const f = this._values[a];
        if (f)
          return f.get(i);
      }
      scopeRefs(a, i = this._values) {
        return this._reduceValues(i, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, r._)`${a}${f.scopePath}`;
        });
      }
      scopeCode(a = this._values, i, f) {
        return this._reduceValues(a, (y) => {
          if (y.value === void 0)
            throw new Error(`CodeGen: name "${y}" has no value`);
          return y.value.code;
        }, i, f);
      }
      _reduceValues(a, i, f = {}, y) {
        let d = r.nil;
        for (const m in a) {
          const u = a[m];
          if (!u)
            continue;
          const g = f[m] = f[m] || /* @__PURE__ */ new Map();
          u.forEach((p) => {
            if (g.has(p))
              return;
            g.set(p, s.Started);
            let h = i(p);
            if (h) {
              const _ = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              d = (0, r._)`${d}${_} ${p} = ${h};${this.opts._n}`;
            } else if (h = y?.(p))
              d = (0, r._)`${d}${h}${this.opts._n}`;
            else
              throw new t(p);
            g.set(p, s.Completed);
          });
        }
        return d;
      }
    }
    e.ValueScope = A;
  })(na)), na;
}
var Ja;
function ge() {
  return Ja || (Ja = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const r = /* @__PURE__ */ Ir(), t = /* @__PURE__ */ Ka();
    var s = /* @__PURE__ */ Ir();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return s.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return s.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return s.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } });
    var n = /* @__PURE__ */ Ka();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return n.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return n.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return n.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return n.varKinds;
    } }), e.operators = {
      GT: new r._Code(">"),
      GTE: new r._Code(">="),
      LT: new r._Code("<"),
      LTE: new r._Code("<="),
      EQ: new r._Code("==="),
      NEQ: new r._Code("!=="),
      NOT: new r._Code("!"),
      OR: new r._Code("||"),
      AND: new r._Code("&&"),
      ADD: new r._Code("+")
    };
    class o {
      optimizeNodes() {
        return this;
      }
      optimizeNames(L, N) {
        return this;
      }
    }
    class l extends o {
      constructor(L, N, V) {
        super(), this.varKind = L, this.name = N, this.rhs = V;
      }
      render({ es5: L, _n: N }) {
        const V = L ? t.varKinds.var : this.varKind, oe = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${V} ${this.name}${oe};` + N;
      }
      optimizeNames(L, N) {
        if (L[this.name.str])
          return this.rhs && (this.rhs = w(this.rhs, L, N)), this;
      }
      get names() {
        return this.rhs instanceof r._CodeOrName ? this.rhs.names : {};
      }
    }
    class A extends o {
      constructor(L, N, V) {
        super(), this.lhs = L, this.rhs = N, this.sideEffects = V;
      }
      render({ _n: L }) {
        return `${this.lhs} = ${this.rhs};` + L;
      }
      optimizeNames(L, N) {
        if (!(this.lhs instanceof r.Name && !L[this.lhs.str] && !this.sideEffects))
          return this.rhs = w(this.rhs, L, N), this;
      }
      get names() {
        const L = this.lhs instanceof r.Name ? {} : { ...this.lhs.names };
        return M(L, this.rhs);
      }
    }
    class c extends A {
      constructor(L, N, V, oe) {
        super(L, V, oe), this.op = N;
      }
      render({ _n: L }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + L;
      }
    }
    class a extends o {
      constructor(L) {
        super(), this.label = L, this.names = {};
      }
      render({ _n: L }) {
        return `${this.label}:` + L;
      }
    }
    class i extends o {
      constructor(L) {
        super(), this.label = L, this.names = {};
      }
      render({ _n: L }) {
        return `break${this.label ? ` ${this.label}` : ""};` + L;
      }
    }
    class f extends o {
      constructor(L) {
        super(), this.error = L;
      }
      render({ _n: L }) {
        return `throw ${this.error};` + L;
      }
      get names() {
        return this.error.names;
      }
    }
    class y extends o {
      constructor(L) {
        super(), this.code = L;
      }
      render({ _n: L }) {
        return `${this.code};` + L;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(L, N) {
        return this.code = w(this.code, L, N), this;
      }
      get names() {
        return this.code instanceof r._CodeOrName ? this.code.names : {};
      }
    }
    class d extends o {
      constructor(L = []) {
        super(), this.nodes = L;
      }
      render(L) {
        return this.nodes.reduce((N, V) => N + V.render(L), "");
      }
      optimizeNodes() {
        const { nodes: L } = this;
        let N = L.length;
        for (; N--; ) {
          const V = L[N].optimizeNodes();
          Array.isArray(V) ? L.splice(N, 1, ...V) : V ? L[N] = V : L.splice(N, 1);
        }
        return L.length > 0 ? this : void 0;
      }
      optimizeNames(L, N) {
        const { nodes: V } = this;
        let oe = V.length;
        for (; oe--; ) {
          const ae = V[oe];
          ae.optimizeNames(L, N) || (G(L, ae.names), V.splice(oe, 1));
        }
        return V.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((L, N) => T(L, N.names), {});
      }
    }
    class m extends d {
      render(L) {
        return "{" + L._n + super.render(L) + "}" + L._n;
      }
    }
    class u extends d {
    }
    class g extends m {
    }
    g.kind = "else";
    class p extends m {
      constructor(L, N) {
        super(N), this.condition = L;
      }
      render(L) {
        let N = `if(${this.condition})` + super.render(L);
        return this.else && (N += "else " + this.else.render(L)), N;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const L = this.condition;
        if (L === !0)
          return this.nodes;
        let N = this.else;
        if (N) {
          const V = N.optimizeNodes();
          N = this.else = Array.isArray(V) ? new g(V) : V;
        }
        if (N)
          return L === !1 ? N instanceof p ? N : N.nodes : this.nodes.length ? this : new p(ee(L), N instanceof p ? [N] : N.nodes);
        if (!(L === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(L, N) {
        var V;
        if (this.else = (V = this.else) === null || V === void 0 ? void 0 : V.optimizeNames(L, N), !!(super.optimizeNames(L, N) || this.else))
          return this.condition = w(this.condition, L, N), this;
      }
      get names() {
        const L = super.names;
        return M(L, this.condition), this.else && T(L, this.else.names), L;
      }
    }
    p.kind = "if";
    class h extends m {
    }
    h.kind = "for";
    class _ extends h {
      constructor(L) {
        super(), this.iteration = L;
      }
      render(L) {
        return `for(${this.iteration})` + super.render(L);
      }
      optimizeNames(L, N) {
        if (super.optimizeNames(L, N))
          return this.iteration = w(this.iteration, L, N), this;
      }
      get names() {
        return T(super.names, this.iteration.names);
      }
    }
    class E extends h {
      constructor(L, N, V, oe) {
        super(), this.varKind = L, this.name = N, this.from = V, this.to = oe;
      }
      render(L) {
        const N = L.es5 ? t.varKinds.var : this.varKind, { name: V, from: oe, to: ae } = this;
        return `for(${N} ${V}=${oe}; ${V}<${ae}; ${V}++)` + super.render(L);
      }
      get names() {
        const L = M(super.names, this.from);
        return M(L, this.to);
      }
    }
    class v extends h {
      constructor(L, N, V, oe) {
        super(), this.loop = L, this.varKind = N, this.name = V, this.iterable = oe;
      }
      render(L) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(L);
      }
      optimizeNames(L, N) {
        if (super.optimizeNames(L, N))
          return this.iterable = w(this.iterable, L, N), this;
      }
      get names() {
        return T(super.names, this.iterable.names);
      }
    }
    class C extends m {
      constructor(L, N, V) {
        super(), this.name = L, this.args = N, this.async = V;
      }
      render(L) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(L);
      }
    }
    C.kind = "func";
    class x extends d {
      render(L) {
        return "return " + super.render(L);
      }
    }
    x.kind = "return";
    class P extends m {
      render(L) {
        let N = "try" + super.render(L);
        return this.catch && (N += this.catch.render(L)), this.finally && (N += this.finally.render(L)), N;
      }
      optimizeNodes() {
        var L, N;
        return super.optimizeNodes(), (L = this.catch) === null || L === void 0 || L.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(L, N) {
        var V, oe;
        return super.optimizeNames(L, N), (V = this.catch) === null || V === void 0 || V.optimizeNames(L, N), (oe = this.finally) === null || oe === void 0 || oe.optimizeNames(L, N), this;
      }
      get names() {
        const L = super.names;
        return this.catch && T(L, this.catch.names), this.finally && T(L, this.finally.names), L;
      }
    }
    class R extends m {
      constructor(L) {
        super(), this.error = L;
      }
      render(L) {
        return `catch(${this.error})` + super.render(L);
      }
    }
    R.kind = "catch";
    class k extends m {
      render(L) {
        return "finally" + super.render(L);
      }
    }
    k.kind = "finally";
    class O {
      constructor(L, N = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...N, _n: N.lines ? `
` : "" }, this._extScope = L, this._scope = new t.Scope({ parent: L }), this._nodes = [new u()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(L) {
        return this._scope.name(L);
      }
      // reserves unique name in the external scope
      scopeName(L) {
        return this._extScope.name(L);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(L, N) {
        const V = this._extScope.value(L, N);
        return (this._values[V.prefix] || (this._values[V.prefix] = /* @__PURE__ */ new Set())).add(V), V;
      }
      getScopeValue(L, N) {
        return this._extScope.getValue(L, N);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(L) {
        return this._extScope.scopeRefs(L, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(L, N, V, oe) {
        const ae = this._scope.toName(N);
        return V !== void 0 && oe && (this._constants[ae.str] = V), this._leafNode(new l(L, ae, V)), ae;
      }
      // `const` declaration (`var` in es5 mode)
      const(L, N, V) {
        return this._def(t.varKinds.const, L, N, V);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(L, N, V) {
        return this._def(t.varKinds.let, L, N, V);
      }
      // `var` declaration with optional assignment
      var(L, N, V) {
        return this._def(t.varKinds.var, L, N, V);
      }
      // assignment code
      assign(L, N, V) {
        return this._leafNode(new A(L, N, V));
      }
      // `+=` code
      add(L, N) {
        return this._leafNode(new c(L, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(L) {
        return typeof L == "function" ? L() : L !== r.nil && this._leafNode(new y(L)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...L) {
        const N = ["{"];
        for (const [V, oe] of L)
          N.length > 1 && N.push(","), N.push(V), (V !== oe || this.opts.es5) && (N.push(":"), (0, r.addCodeArg)(N, oe));
        return N.push("}"), new r._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(L, N, V) {
        if (this._blockNode(new p(L)), N && V)
          this.code(N).else().code(V).endIf();
        else if (N)
          this.code(N).endIf();
        else if (V)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(L) {
        return this._elseNode(new p(L));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new g());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(p, g);
      }
      _for(L, N) {
        return this._blockNode(L), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(L, N) {
        return this._for(new _(L), N);
      }
      // `for` statement for a range of values
      forRange(L, N, V, oe, ae = this.opts.es5 ? t.varKinds.var : t.varKinds.let) {
        const le = this._scope.toName(L);
        return this._for(new E(ae, le, N, V), () => oe(le));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(L, N, V, oe = t.varKinds.const) {
        const ae = this._scope.toName(L);
        if (this.opts.es5) {
          const le = N instanceof r.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, r._)`${le}.length`, (Ae) => {
            this.var(ae, (0, r._)`${le}[${Ae}]`), V(ae);
          });
        }
        return this._for(new v("of", oe, ae, N), () => V(ae));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(L, N, V, oe = this.opts.es5 ? t.varKinds.var : t.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(L, (0, r._)`Object.keys(${N})`, V);
        const ae = this._scope.toName(L);
        return this._for(new v("in", oe, ae, N), () => V(ae));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(h);
      }
      // `label` statement
      label(L) {
        return this._leafNode(new a(L));
      }
      // `break` statement
      break(L) {
        return this._leafNode(new i(L));
      }
      // `return` statement
      return(L) {
        const N = new x();
        if (this._blockNode(N), this.code(L), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(x);
      }
      // `try` statement
      try(L, N, V) {
        if (!N && !V)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const oe = new P();
        if (this._blockNode(oe), this.code(L), N) {
          const ae = this.name("e");
          this._currNode = oe.catch = new R(ae), N(ae);
        }
        return V && (this._currNode = oe.finally = new k(), this.code(V)), this._endBlockNode(R, k);
      }
      // `throw` statement
      throw(L) {
        return this._leafNode(new f(L));
      }
      // start self-balancing block
      block(L, N) {
        return this._blockStarts.push(this._nodes.length), L && this.code(L).endBlock(N), this;
      }
      // end the current self-balancing block
      endBlock(L) {
        const N = this._blockStarts.pop();
        if (N === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const V = this._nodes.length - N;
        if (V < 0 || L !== void 0 && V !== L)
          throw new Error(`CodeGen: wrong number of nodes: ${V} vs ${L} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(L, N = r.nil, V, oe) {
        return this._blockNode(new C(L, N, V)), oe && this.code(oe).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(C);
      }
      optimize(L = 1) {
        for (; L-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(L) {
        return this._currNode.nodes.push(L), this;
      }
      _blockNode(L) {
        this._currNode.nodes.push(L), this._nodes.push(L);
      }
      _endBlockNode(L, N) {
        const V = this._currNode;
        if (V instanceof L || N && V instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${L.kind}/${N.kind}` : L.kind}"`);
      }
      _elseNode(L) {
        const N = this._currNode;
        if (!(N instanceof p))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = N.else = L, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const L = this._nodes;
        return L[L.length - 1];
      }
      set _currNode(L) {
        const N = this._nodes;
        N[N.length - 1] = L;
      }
    }
    e.CodeGen = O;
    function T($, L) {
      for (const N in L)
        $[N] = ($[N] || 0) + (L[N] || 0);
      return $;
    }
    function M($, L) {
      return L instanceof r._CodeOrName ? T($, L.names) : $;
    }
    function w($, L, N) {
      if ($ instanceof r.Name)
        return V($);
      if (!oe($))
        return $;
      return new r._Code($._items.reduce((ae, le) => (le instanceof r.Name && (le = V(le)), le instanceof r._Code ? ae.push(...le._items) : ae.push(le), ae), []));
      function V(ae) {
        const le = N[ae.str];
        return le === void 0 || L[ae.str] !== 1 ? ae : (delete L[ae.str], le);
      }
      function oe(ae) {
        return ae instanceof r._Code && ae._items.some((le) => le instanceof r.Name && L[le.str] === 1 && N[le.str] !== void 0);
      }
    }
    function G($, L) {
      for (const N in L)
        $[N] = ($[N] || 0) - (L[N] || 0);
    }
    function ee($) {
      return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, r._)`!${F($)}`;
    }
    e.not = ee;
    const Y = D(e.operators.AND);
    function ne(...$) {
      return $.reduce(Y);
    }
    e.and = ne;
    const Z = D(e.operators.OR);
    function Q(...$) {
      return $.reduce(Z);
    }
    e.or = Q;
    function D($) {
      return (L, N) => L === r.nil ? N : N === r.nil ? L : (0, r._)`${F(L)} ${$} ${F(N)}`;
    }
    function F($) {
      return $ instanceof r.Name ? $ : (0, r._)`(${$})`;
    }
  })(ra)), ra;
}
var me = {}, Za;
function we() {
  if (Za) return me;
  Za = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.checkStrictMode = me.getErrorPath = me.Type = me.useFunc = me.setEvaluated = me.evaluatedPropsToName = me.mergeEvaluated = me.eachItem = me.unescapeJsonPointer = me.escapeJsonPointer = me.escapeFragment = me.unescapeFragment = me.schemaRefOrVal = me.schemaHasRulesButRef = me.schemaHasRules = me.checkUnknownRules = me.alwaysValidSchema = me.toHash = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ Ir();
  function t(v) {
    const C = {};
    for (const x of v)
      C[x] = !0;
    return C;
  }
  me.toHash = t;
  function s(v, C) {
    return typeof C == "boolean" ? C : Object.keys(C).length === 0 ? !0 : (n(v, C), !o(C, v.self.RULES.all));
  }
  me.alwaysValidSchema = s;
  function n(v, C = v.schema) {
    const { opts: x, self: P } = v;
    if (!x.strictSchema || typeof C == "boolean")
      return;
    const R = P.RULES.keywords;
    for (const k in C)
      R[k] || E(v, `unknown keyword: "${k}"`);
  }
  me.checkUnknownRules = n;
  function o(v, C) {
    if (typeof v == "boolean")
      return !v;
    for (const x in v)
      if (C[x])
        return !0;
    return !1;
  }
  me.schemaHasRules = o;
  function l(v, C) {
    if (typeof v == "boolean")
      return !v;
    for (const x in v)
      if (x !== "$ref" && C.all[x])
        return !0;
    return !1;
  }
  me.schemaHasRulesButRef = l;
  function A({ topSchemaRef: v, schemaPath: C }, x, P, R) {
    if (!R) {
      if (typeof x == "number" || typeof x == "boolean")
        return x;
      if (typeof x == "string")
        return (0, e._)`${x}`;
    }
    return (0, e._)`${v}${C}${(0, e.getProperty)(P)}`;
  }
  me.schemaRefOrVal = A;
  function c(v) {
    return f(decodeURIComponent(v));
  }
  me.unescapeFragment = c;
  function a(v) {
    return encodeURIComponent(i(v));
  }
  me.escapeFragment = a;
  function i(v) {
    return typeof v == "number" ? `${v}` : v.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  me.escapeJsonPointer = i;
  function f(v) {
    return v.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  me.unescapeJsonPointer = f;
  function y(v, C) {
    if (Array.isArray(v))
      for (const x of v)
        C(x);
    else
      C(v);
  }
  me.eachItem = y;
  function d({ mergeNames: v, mergeToName: C, mergeValues: x, resultToName: P }) {
    return (R, k, O, T) => {
      const M = O === void 0 ? k : O instanceof e.Name ? (k instanceof e.Name ? v(R, k, O) : C(R, k, O), O) : k instanceof e.Name ? (C(R, O, k), k) : x(k, O);
      return T === e.Name && !(M instanceof e.Name) ? P(R, M) : M;
    };
  }
  me.mergeEvaluated = {
    props: d({
      mergeNames: (v, C, x) => v.if((0, e._)`${x} !== true && ${C} !== undefined`, () => {
        v.if((0, e._)`${C} === true`, () => v.assign(x, !0), () => v.assign(x, (0, e._)`${x} || {}`).code((0, e._)`Object.assign(${x}, ${C})`));
      }),
      mergeToName: (v, C, x) => v.if((0, e._)`${x} !== true`, () => {
        C === !0 ? v.assign(x, !0) : (v.assign(x, (0, e._)`${x} || {}`), u(v, x, C));
      }),
      mergeValues: (v, C) => v === !0 ? !0 : { ...v, ...C },
      resultToName: m
    }),
    items: d({
      mergeNames: (v, C, x) => v.if((0, e._)`${x} !== true && ${C} !== undefined`, () => v.assign(x, (0, e._)`${C} === true ? true : ${x} > ${C} ? ${x} : ${C}`)),
      mergeToName: (v, C, x) => v.if((0, e._)`${x} !== true`, () => v.assign(x, C === !0 ? !0 : (0, e._)`${x} > ${C} ? ${x} : ${C}`)),
      mergeValues: (v, C) => v === !0 ? !0 : Math.max(v, C),
      resultToName: (v, C) => v.var("items", C)
    })
  };
  function m(v, C) {
    if (C === !0)
      return v.var("props", !0);
    const x = v.var("props", (0, e._)`{}`);
    return C !== void 0 && u(v, x, C), x;
  }
  me.evaluatedPropsToName = m;
  function u(v, C, x) {
    Object.keys(x).forEach((P) => v.assign((0, e._)`${C}${(0, e.getProperty)(P)}`, !0));
  }
  me.setEvaluated = u;
  const g = {};
  function p(v, C) {
    return v.scopeValue("func", {
      ref: C,
      code: g[C.code] || (g[C.code] = new r._Code(C.code))
    });
  }
  me.useFunc = p;
  var h;
  (function(v) {
    v[v.Num = 0] = "Num", v[v.Str = 1] = "Str";
  })(h || (me.Type = h = {}));
  function _(v, C, x) {
    if (v instanceof e.Name) {
      const P = C === h.Num;
      return x ? P ? (0, e._)`"[" + ${v} + "]"` : (0, e._)`"['" + ${v} + "']"` : P ? (0, e._)`"/" + ${v}` : (0, e._)`"/" + ${v}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return x ? (0, e.getProperty)(v).toString() : "/" + i(v);
  }
  me.getErrorPath = _;
  function E(v, C, x = v.opts.strictSchema) {
    if (x) {
      if (C = `strict mode: ${C}`, x === !0)
        throw new Error(C);
      v.self.logger.warn(C);
    }
  }
  return me.checkStrictMode = E, me;
}
var Wt = {}, en;
function at() {
  if (en) return Wt;
  en = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Wt.default = r, Wt;
}
var tn;
function $r() {
  return tn || (tn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ we(), s = /* @__PURE__ */ at();
    e.keywordError = {
      message: ({ keyword: g }) => (0, r.str)`must pass "${g}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: g, schemaType: p }) => p ? (0, r.str)`"${g}" keyword must be ${p} ($data)` : (0, r.str)`"${g}" keyword is invalid ($data)`
    };
    function n(g, p = e.keywordError, h, _) {
      const { it: E } = g, { gen: v, compositeRule: C, allErrors: x } = E, P = f(g, p, h);
      _ ?? (C || x) ? c(v, P) : a(E, (0, r._)`[${P}]`);
    }
    e.reportError = n;
    function o(g, p = e.keywordError, h) {
      const { it: _ } = g, { gen: E, compositeRule: v, allErrors: C } = _, x = f(g, p, h);
      c(E, x), v || C || a(_, s.default.vErrors);
    }
    e.reportExtraError = o;
    function l(g, p) {
      g.assign(s.default.errors, p), g.if((0, r._)`${s.default.vErrors} !== null`, () => g.if(p, () => g.assign((0, r._)`${s.default.vErrors}.length`, p), () => g.assign(s.default.vErrors, null)));
    }
    e.resetErrorsCount = l;
    function A({ gen: g, keyword: p, schemaValue: h, data: _, errsCount: E, it: v }) {
      if (E === void 0)
        throw new Error("ajv implementation error");
      const C = g.name("err");
      g.forRange("i", E, s.default.errors, (x) => {
        g.const(C, (0, r._)`${s.default.vErrors}[${x}]`), g.if((0, r._)`${C}.instancePath === undefined`, () => g.assign((0, r._)`${C}.instancePath`, (0, r.strConcat)(s.default.instancePath, v.errorPath))), g.assign((0, r._)`${C}.schemaPath`, (0, r.str)`${v.errSchemaPath}/${p}`), v.opts.verbose && (g.assign((0, r._)`${C}.schema`, h), g.assign((0, r._)`${C}.data`, _));
      });
    }
    e.extendErrors = A;
    function c(g, p) {
      const h = g.const("err", p);
      g.if((0, r._)`${s.default.vErrors} === null`, () => g.assign(s.default.vErrors, (0, r._)`[${h}]`), (0, r._)`${s.default.vErrors}.push(${h})`), g.code((0, r._)`${s.default.errors}++`);
    }
    function a(g, p) {
      const { gen: h, validateName: _, schemaEnv: E } = g;
      E.$async ? h.throw((0, r._)`new ${g.ValidationError}(${p})`) : (h.assign((0, r._)`${_}.errors`, p), h.return(!1));
    }
    const i = {
      keyword: new r.Name("keyword"),
      schemaPath: new r.Name("schemaPath"),
      // also used in JTD errors
      params: new r.Name("params"),
      propertyName: new r.Name("propertyName"),
      message: new r.Name("message"),
      schema: new r.Name("schema"),
      parentSchema: new r.Name("parentSchema")
    };
    function f(g, p, h) {
      const { createErrors: _ } = g.it;
      return _ === !1 ? (0, r._)`{}` : y(g, p, h);
    }
    function y(g, p, h = {}) {
      const { gen: _, it: E } = g, v = [
        d(E, h),
        m(g, h)
      ];
      return u(g, p, v), _.object(...v);
    }
    function d({ errorPath: g }, { instancePath: p }) {
      const h = p ? (0, r.str)`${g}${(0, t.getErrorPath)(p, t.Type.Str)}` : g;
      return [s.default.instancePath, (0, r.strConcat)(s.default.instancePath, h)];
    }
    function m({ keyword: g, it: { errSchemaPath: p } }, { schemaPath: h, parentSchema: _ }) {
      let E = _ ? p : (0, r.str)`${p}/${g}`;
      return h && (E = (0, r.str)`${E}${(0, t.getErrorPath)(h, t.Type.Str)}`), [i.schemaPath, E];
    }
    function u(g, { params: p, message: h }, _) {
      const { keyword: E, data: v, schemaValue: C, it: x } = g, { opts: P, propertyName: R, topSchemaRef: k, schemaPath: O } = x;
      _.push([i.keyword, E], [i.params, typeof p == "function" ? p(g) : p || (0, r._)`{}`]), P.messages && _.push([i.message, typeof h == "function" ? h(g) : h]), P.verbose && _.push([i.schema, C], [i.parentSchema, (0, r._)`${k}${O}`], [s.default.data, v]), R && _.push([i.propertyName, R]);
    }
  })(ta)), ta;
}
var rn;
function $s() {
  if (rn) return st;
  rn = 1, Object.defineProperty(st, "__esModule", { value: !0 }), st.boolOrEmptySchema = st.topBoolOrEmptySchema = void 0;
  const e = /* @__PURE__ */ $r(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ at(), s = {
    message: "boolean schema is false"
  };
  function n(A) {
    const { gen: c, schema: a, validateName: i } = A;
    a === !1 ? l(A, !1) : typeof a == "object" && a.$async === !0 ? c.return(t.default.data) : (c.assign((0, r._)`${i}.errors`, null), c.return(!0));
  }
  st.topBoolOrEmptySchema = n;
  function o(A, c) {
    const { gen: a, schema: i } = A;
    i === !1 ? (a.var(c, !1), l(A)) : a.var(c, !0);
  }
  st.boolOrEmptySchema = o;
  function l(A, c) {
    const { gen: a, data: i } = A, f = {
      gen: a,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: A
    };
    (0, e.reportError)(f, s, void 0, c);
  }
  return st;
}
var Ne = {}, lt = {}, an;
function Si() {
  if (an) return lt;
  an = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.getRules = lt.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], r = new Set(e);
  function t(n) {
    return typeof n == "string" && r.has(n);
  }
  lt.isJSONType = t;
  function s() {
    const n = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...n, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, n.number, n.string, n.array, n.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return lt.getRules = s, lt;
}
var Qe = {}, nn;
function ki() {
  if (nn) return Qe;
  nn = 1, Object.defineProperty(Qe, "__esModule", { value: !0 }), Qe.shouldUseRule = Qe.shouldUseGroup = Qe.schemaHasRulesForType = void 0;
  function e({ schema: s, self: n }, o) {
    const l = n.RULES.types[o];
    return l && l !== !0 && r(s, l);
  }
  Qe.schemaHasRulesForType = e;
  function r(s, n) {
    return n.rules.some((o) => t(s, o));
  }
  Qe.shouldUseGroup = r;
  function t(s, n) {
    var o;
    return s[n.keyword] !== void 0 || ((o = n.definition.implements) === null || o === void 0 ? void 0 : o.some((l) => s[l] !== void 0));
  }
  return Qe.shouldUseRule = t, Qe;
}
var on;
function Fr() {
  if (on) return Ne;
  on = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.reportTypeError = Ne.checkDataTypes = Ne.checkDataType = Ne.coerceAndCheckDataType = Ne.getJSONTypes = Ne.getSchemaTypes = Ne.DataType = void 0;
  const e = /* @__PURE__ */ Si(), r = /* @__PURE__ */ ki(), t = /* @__PURE__ */ $r(), s = /* @__PURE__ */ ge(), n = /* @__PURE__ */ we();
  var o;
  (function(h) {
    h[h.Correct = 0] = "Correct", h[h.Wrong = 1] = "Wrong";
  })(o || (Ne.DataType = o = {}));
  function l(h) {
    const _ = A(h.type);
    if (_.includes("null")) {
      if (h.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!_.length && h.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      h.nullable === !0 && _.push("null");
    }
    return _;
  }
  Ne.getSchemaTypes = l;
  function A(h) {
    const _ = Array.isArray(h) ? h : h ? [h] : [];
    if (_.every(e.isJSONType))
      return _;
    throw new Error("type must be JSONType or JSONType[]: " + _.join(","));
  }
  Ne.getJSONTypes = A;
  function c(h, _) {
    const { gen: E, data: v, opts: C } = h, x = i(_, C.coerceTypes), P = _.length > 0 && !(x.length === 0 && _.length === 1 && (0, r.schemaHasRulesForType)(h, _[0]));
    if (P) {
      const R = m(_, v, C.strictNumbers, o.Wrong);
      E.if(R, () => {
        x.length ? f(h, _, x) : g(h);
      });
    }
    return P;
  }
  Ne.coerceAndCheckDataType = c;
  const a = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(h, _) {
    return _ ? h.filter((E) => a.has(E) || _ === "array" && E === "array") : [];
  }
  function f(h, _, E) {
    const { gen: v, data: C, opts: x } = h, P = v.let("dataType", (0, s._)`typeof ${C}`), R = v.let("coerced", (0, s._)`undefined`);
    x.coerceTypes === "array" && v.if((0, s._)`${P} == 'object' && Array.isArray(${C}) && ${C}.length == 1`, () => v.assign(C, (0, s._)`${C}[0]`).assign(P, (0, s._)`typeof ${C}`).if(m(_, C, x.strictNumbers), () => v.assign(R, C))), v.if((0, s._)`${R} !== undefined`);
    for (const O of E)
      (a.has(O) || O === "array" && x.coerceTypes === "array") && k(O);
    v.else(), g(h), v.endIf(), v.if((0, s._)`${R} !== undefined`, () => {
      v.assign(C, R), y(h, R);
    });
    function k(O) {
      switch (O) {
        case "string":
          v.elseIf((0, s._)`${P} == "number" || ${P} == "boolean"`).assign(R, (0, s._)`"" + ${C}`).elseIf((0, s._)`${C} === null`).assign(R, (0, s._)`""`);
          return;
        case "number":
          v.elseIf((0, s._)`${P} == "boolean" || ${C} === null
              || (${P} == "string" && ${C} && ${C} == +${C})`).assign(R, (0, s._)`+${C}`);
          return;
        case "integer":
          v.elseIf((0, s._)`${P} === "boolean" || ${C} === null
              || (${P} === "string" && ${C} && ${C} == +${C} && !(${C} % 1))`).assign(R, (0, s._)`+${C}`);
          return;
        case "boolean":
          v.elseIf((0, s._)`${C} === "false" || ${C} === 0 || ${C} === null`).assign(R, !1).elseIf((0, s._)`${C} === "true" || ${C} === 1`).assign(R, !0);
          return;
        case "null":
          v.elseIf((0, s._)`${C} === "" || ${C} === 0 || ${C} === false`), v.assign(R, null);
          return;
        case "array":
          v.elseIf((0, s._)`${P} === "string" || ${P} === "number"
              || ${P} === "boolean" || ${C} === null`).assign(R, (0, s._)`[${C}]`);
      }
    }
  }
  function y({ gen: h, parentData: _, parentDataProperty: E }, v) {
    h.if((0, s._)`${_} !== undefined`, () => h.assign((0, s._)`${_}[${E}]`, v));
  }
  function d(h, _, E, v = o.Correct) {
    const C = v === o.Correct ? s.operators.EQ : s.operators.NEQ;
    let x;
    switch (h) {
      case "null":
        return (0, s._)`${_} ${C} null`;
      case "array":
        x = (0, s._)`Array.isArray(${_})`;
        break;
      case "object":
        x = (0, s._)`${_} && typeof ${_} == "object" && !Array.isArray(${_})`;
        break;
      case "integer":
        x = P((0, s._)`!(${_} % 1) && !isNaN(${_})`);
        break;
      case "number":
        x = P();
        break;
      default:
        return (0, s._)`typeof ${_} ${C} ${h}`;
    }
    return v === o.Correct ? x : (0, s.not)(x);
    function P(R = s.nil) {
      return (0, s.and)((0, s._)`typeof ${_} == "number"`, R, E ? (0, s._)`isFinite(${_})` : s.nil);
    }
  }
  Ne.checkDataType = d;
  function m(h, _, E, v) {
    if (h.length === 1)
      return d(h[0], _, E, v);
    let C;
    const x = (0, n.toHash)(h);
    if (x.array && x.object) {
      const P = (0, s._)`typeof ${_} != "object"`;
      C = x.null ? P : (0, s._)`!${_} || ${P}`, delete x.null, delete x.array, delete x.object;
    } else
      C = s.nil;
    x.number && delete x.integer;
    for (const P in x)
      C = (0, s.and)(C, d(P, _, E, v));
    return C;
  }
  Ne.checkDataTypes = m;
  const u = {
    message: ({ schema: h }) => `must be ${h}`,
    params: ({ schema: h, schemaValue: _ }) => typeof h == "string" ? (0, s._)`{type: ${h}}` : (0, s._)`{type: ${_}}`
  };
  function g(h) {
    const _ = p(h);
    (0, t.reportError)(_, u);
  }
  Ne.reportTypeError = g;
  function p(h) {
    const { gen: _, data: E, schema: v } = h, C = (0, n.schemaRefOrVal)(h, v, "type");
    return {
      gen: _,
      keyword: "type",
      data: E,
      schema: v.type,
      schemaCode: C,
      schemaValue: C,
      parentSchema: v,
      params: {},
      it: h
    };
  }
  return Ne;
}
var Rt = {}, sn;
function zs() {
  if (sn) return Rt;
  sn = 1, Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.assignDefaults = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we();
  function t(n, o) {
    const { properties: l, items: A } = n.schema;
    if (o === "object" && l)
      for (const c in l)
        s(n, c, l[c].default);
    else o === "array" && Array.isArray(A) && A.forEach((c, a) => s(n, a, c.default));
  }
  Rt.assignDefaults = t;
  function s(n, o, l) {
    const { gen: A, compositeRule: c, data: a, opts: i } = n;
    if (l === void 0)
      return;
    const f = (0, e._)`${a}${(0, e.getProperty)(o)}`;
    if (c) {
      (0, r.checkStrictMode)(n, `default is ignored for: ${f}`);
      return;
    }
    let y = (0, e._)`${f} === undefined`;
    i.useDefaults === "empty" && (y = (0, e._)`${y} || ${f} === null || ${f} === ""`), A.if(y, (0, e._)`${f} = ${(0, e.stringify)(l)}`);
  }
  return Rt;
}
var Ge = {}, Ee = {}, ln;
function Xe() {
  if (ln) return Ee;
  ln = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.validateUnion = Ee.validateArray = Ee.usePattern = Ee.callValidateCode = Ee.schemaProperties = Ee.allSchemaProperties = Ee.noPropertyInData = Ee.propertyInData = Ee.isOwnProperty = Ee.hasPropFunc = Ee.reportMissingProp = Ee.checkMissingProp = Ee.checkReportMissingProp = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ at(), s = /* @__PURE__ */ we();
  function n(h, _) {
    const { gen: E, data: v, it: C } = h;
    E.if(i(E, v, _, C.opts.ownProperties), () => {
      h.setParams({ missingProperty: (0, e._)`${_}` }, !0), h.error();
    });
  }
  Ee.checkReportMissingProp = n;
  function o({ gen: h, data: _, it: { opts: E } }, v, C) {
    return (0, e.or)(...v.map((x) => (0, e.and)(i(h, _, x, E.ownProperties), (0, e._)`${C} = ${x}`)));
  }
  Ee.checkMissingProp = o;
  function l(h, _) {
    h.setParams({ missingProperty: _ }, !0), h.error();
  }
  Ee.reportMissingProp = l;
  function A(h) {
    return h.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Ee.hasPropFunc = A;
  function c(h, _, E) {
    return (0, e._)`${A(h)}.call(${_}, ${E})`;
  }
  Ee.isOwnProperty = c;
  function a(h, _, E, v) {
    const C = (0, e._)`${_}${(0, e.getProperty)(E)} !== undefined`;
    return v ? (0, e._)`${C} && ${c(h, _, E)}` : C;
  }
  Ee.propertyInData = a;
  function i(h, _, E, v) {
    const C = (0, e._)`${_}${(0, e.getProperty)(E)} === undefined`;
    return v ? (0, e.or)(C, (0, e.not)(c(h, _, E))) : C;
  }
  Ee.noPropertyInData = i;
  function f(h) {
    return h ? Object.keys(h).filter((_) => _ !== "__proto__") : [];
  }
  Ee.allSchemaProperties = f;
  function y(h, _) {
    return f(_).filter((E) => !(0, r.alwaysValidSchema)(h, _[E]));
  }
  Ee.schemaProperties = y;
  function d({ schemaCode: h, data: _, it: { gen: E, topSchemaRef: v, schemaPath: C, errorPath: x }, it: P }, R, k, O) {
    const T = O ? (0, e._)`${h}, ${_}, ${v}${C}` : _, M = [
      [t.default.instancePath, (0, e.strConcat)(t.default.instancePath, x)],
      [t.default.parentData, P.parentData],
      [t.default.parentDataProperty, P.parentDataProperty],
      [t.default.rootData, t.default.rootData]
    ];
    P.opts.dynamicRef && M.push([t.default.dynamicAnchors, t.default.dynamicAnchors]);
    const w = (0, e._)`${T}, ${E.object(...M)}`;
    return k !== e.nil ? (0, e._)`${R}.call(${k}, ${w})` : (0, e._)`${R}(${w})`;
  }
  Ee.callValidateCode = d;
  const m = (0, e._)`new RegExp`;
  function u({ gen: h, it: { opts: _ } }, E) {
    const v = _.unicodeRegExp ? "u" : "", { regExp: C } = _.code, x = C(E, v);
    return h.scopeValue("pattern", {
      key: x.toString(),
      ref: x,
      code: (0, e._)`${C.code === "new RegExp" ? m : (0, s.useFunc)(h, C)}(${E}, ${v})`
    });
  }
  Ee.usePattern = u;
  function g(h) {
    const { gen: _, data: E, keyword: v, it: C } = h, x = _.name("valid");
    if (C.allErrors) {
      const R = _.let("valid", !0);
      return P(() => _.assign(R, !1)), R;
    }
    return _.var(x, !0), P(() => _.break()), x;
    function P(R) {
      const k = _.const("len", (0, e._)`${E}.length`);
      _.forRange("i", 0, k, (O) => {
        h.subschema({
          keyword: v,
          dataProp: O,
          dataPropType: r.Type.Num
        }, x), _.if((0, e.not)(x), R);
      });
    }
  }
  Ee.validateArray = g;
  function p(h) {
    const { gen: _, schema: E, keyword: v, it: C } = h;
    if (!Array.isArray(E))
      throw new Error("ajv implementation error");
    if (E.some((k) => (0, r.alwaysValidSchema)(C, k)) && !C.opts.unevaluated)
      return;
    const P = _.let("valid", !1), R = _.name("_valid");
    _.block(() => E.forEach((k, O) => {
      const T = h.subschema({
        keyword: v,
        schemaProp: O,
        compositeRule: !0
      }, R);
      _.assign(P, (0, e._)`${P} || ${R}`), h.mergeValidEvaluated(T, R) || _.if((0, e.not)(P));
    })), h.result(P, () => h.reset(), () => h.error(!0));
  }
  return Ee.validateUnion = p, Ee;
}
var cn;
function Us() {
  if (cn) return Ge;
  cn = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.validateKeywordUsage = Ge.validSchemaType = Ge.funcKeywordCode = Ge.macroKeywordCode = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ at(), t = /* @__PURE__ */ Xe(), s = /* @__PURE__ */ $r();
  function n(y, d) {
    const { gen: m, keyword: u, schema: g, parentSchema: p, it: h } = y, _ = d.macro.call(h.self, g, p, h), E = a(m, u, _);
    h.opts.validateSchema !== !1 && h.self.validateSchema(_, !0);
    const v = m.name("valid");
    y.subschema({
      schema: _,
      schemaPath: e.nil,
      errSchemaPath: `${h.errSchemaPath}/${u}`,
      topSchemaRef: E,
      compositeRule: !0
    }, v), y.pass(v, () => y.error(!0));
  }
  Ge.macroKeywordCode = n;
  function o(y, d) {
    var m;
    const { gen: u, keyword: g, schema: p, parentSchema: h, $data: _, it: E } = y;
    c(E, d);
    const v = !_ && d.compile ? d.compile.call(E.self, p, h, E) : d.validate, C = a(u, g, v), x = u.let("valid");
    y.block$data(x, P), y.ok((m = d.valid) !== null && m !== void 0 ? m : x);
    function P() {
      if (d.errors === !1)
        O(), d.modifying && l(y), T(() => y.error());
      else {
        const M = d.async ? R() : k();
        d.modifying && l(y), T(() => A(y, M));
      }
    }
    function R() {
      const M = u.let("ruleErrs", null);
      return u.try(() => O((0, e._)`await `), (w) => u.assign(x, !1).if((0, e._)`${w} instanceof ${E.ValidationError}`, () => u.assign(M, (0, e._)`${w}.errors`), () => u.throw(w))), M;
    }
    function k() {
      const M = (0, e._)`${C}.errors`;
      return u.assign(M, null), O(e.nil), M;
    }
    function O(M = d.async ? (0, e._)`await ` : e.nil) {
      const w = E.opts.passContext ? r.default.this : r.default.self, G = !("compile" in d && !_ || d.schema === !1);
      u.assign(x, (0, e._)`${M}${(0, t.callValidateCode)(y, C, w, G)}`, d.modifying);
    }
    function T(M) {
      var w;
      u.if((0, e.not)((w = d.valid) !== null && w !== void 0 ? w : x), M);
    }
  }
  Ge.funcKeywordCode = o;
  function l(y) {
    const { gen: d, data: m, it: u } = y;
    d.if(u.parentData, () => d.assign(m, (0, e._)`${u.parentData}[${u.parentDataProperty}]`));
  }
  function A(y, d) {
    const { gen: m } = y;
    m.if((0, e._)`Array.isArray(${d})`, () => {
      m.assign(r.default.vErrors, (0, e._)`${r.default.vErrors} === null ? ${d} : ${r.default.vErrors}.concat(${d})`).assign(r.default.errors, (0, e._)`${r.default.vErrors}.length`), (0, s.extendErrors)(y);
    }, () => y.error());
  }
  function c({ schemaEnv: y }, d) {
    if (d.async && !y.$async)
      throw new Error("async keyword in sync schema");
  }
  function a(y, d, m) {
    if (m === void 0)
      throw new Error(`keyword "${d}" failed to compile`);
    return y.scopeValue("keyword", typeof m == "function" ? { ref: m } : { ref: m, code: (0, e.stringify)(m) });
  }
  function i(y, d, m = !1) {
    return !d.length || d.some((u) => u === "array" ? Array.isArray(y) : u === "object" ? y && typeof y == "object" && !Array.isArray(y) : typeof y == u || m && typeof y > "u");
  }
  Ge.validSchemaType = i;
  function f({ schema: y, opts: d, self: m, errSchemaPath: u }, g, p) {
    if (Array.isArray(g.keyword) ? !g.keyword.includes(p) : g.keyword !== p)
      throw new Error("ajv implementation error");
    const h = g.dependencies;
    if (h?.some((_) => !Object.prototype.hasOwnProperty.call(y, _)))
      throw new Error(`parent schema must have dependencies of ${p}: ${h.join(",")}`);
    if (g.validateSchema && !g.validateSchema(y[p])) {
      const E = `keyword "${p}" value is invalid at path "${u}": ` + m.errorsText(g.validateSchema.errors);
      if (d.validateSchema === "log")
        m.logger.error(E);
      else
        throw new Error(E);
    }
  }
  return Ge.validateKeywordUsage = f, Ge;
}
var je = {}, An;
function Gs() {
  if (An) return je;
  An = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.extendSubschemaMode = je.extendSubschemaData = je.getSubschema = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we();
  function t(o, { keyword: l, schemaProp: A, schema: c, schemaPath: a, errSchemaPath: i, topSchemaRef: f }) {
    if (l !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (l !== void 0) {
      const y = o.schema[l];
      return A === void 0 ? {
        schema: y,
        schemaPath: (0, e._)`${o.schemaPath}${(0, e.getProperty)(l)}`,
        errSchemaPath: `${o.errSchemaPath}/${l}`
      } : {
        schema: y[A],
        schemaPath: (0, e._)`${o.schemaPath}${(0, e.getProperty)(l)}${(0, e.getProperty)(A)}`,
        errSchemaPath: `${o.errSchemaPath}/${l}/${(0, r.escapeFragment)(A)}`
      };
    }
    if (c !== void 0) {
      if (a === void 0 || i === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: a,
        topSchemaRef: f,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  je.getSubschema = t;
  function s(o, l, { dataProp: A, dataPropType: c, data: a, dataTypes: i, propertyName: f }) {
    if (a !== void 0 && A !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: y } = l;
    if (A !== void 0) {
      const { errorPath: m, dataPathArr: u, opts: g } = l, p = y.let("data", (0, e._)`${l.data}${(0, e.getProperty)(A)}`, !0);
      d(p), o.errorPath = (0, e.str)`${m}${(0, r.getErrorPath)(A, c, g.jsPropertySyntax)}`, o.parentDataProperty = (0, e._)`${A}`, o.dataPathArr = [...u, o.parentDataProperty];
    }
    if (a !== void 0) {
      const m = a instanceof e.Name ? a : y.let("data", a, !0);
      d(m), f !== void 0 && (o.propertyName = f);
    }
    i && (o.dataTypes = i);
    function d(m) {
      o.data = m, o.dataLevel = l.dataLevel + 1, o.dataTypes = [], l.definedProperties = /* @__PURE__ */ new Set(), o.parentData = l.data, o.dataNames = [...l.dataNames, m];
    }
  }
  je.extendSubschemaData = s;
  function n(o, { jtdDiscriminator: l, jtdMetadata: A, compositeRule: c, createErrors: a, allErrors: i }) {
    c !== void 0 && (o.compositeRule = c), a !== void 0 && (o.createErrors = a), i !== void 0 && (o.allErrors = i), o.jtdDiscriminator = l, o.jtdMetadata = A;
  }
  return je.extendSubschemaMode = n, je;
}
var ke = {}, ia, dn;
function Ii() {
  return dn || (dn = 1, ia = function e(r, t) {
    if (r === t) return !0;
    if (r && t && typeof r == "object" && typeof t == "object") {
      if (r.constructor !== t.constructor) return !1;
      var s, n, o;
      if (Array.isArray(r)) {
        if (s = r.length, s != t.length) return !1;
        for (n = s; n-- !== 0; )
          if (!e(r[n], t[n])) return !1;
        return !0;
      }
      if (r.constructor === RegExp) return r.source === t.source && r.flags === t.flags;
      if (r.valueOf !== Object.prototype.valueOf) return r.valueOf() === t.valueOf();
      if (r.toString !== Object.prototype.toString) return r.toString() === t.toString();
      if (o = Object.keys(r), s = o.length, s !== Object.keys(t).length) return !1;
      for (n = s; n-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(t, o[n])) return !1;
      for (n = s; n-- !== 0; ) {
        var l = o[n];
        if (!e(r[l], t[l])) return !1;
      }
      return !0;
    }
    return r !== r && t !== t;
  }), ia;
}
var oa = { exports: {} }, fn;
function Xs() {
  if (fn) return oa.exports;
  fn = 1;
  var e = oa.exports = function(s, n, o) {
    typeof n == "function" && (o = n, n = {}), o = n.cb || o;
    var l = typeof o == "function" ? o : o.pre || function() {
    }, A = o.post || function() {
    };
    r(n, l, A, s, "", s);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function r(s, n, o, l, A, c, a, i, f, y) {
    if (l && typeof l == "object" && !Array.isArray(l)) {
      n(l, A, c, a, i, f, y);
      for (var d in l) {
        var m = l[d];
        if (Array.isArray(m)) {
          if (d in e.arrayKeywords)
            for (var u = 0; u < m.length; u++)
              r(s, n, o, m[u], A + "/" + d + "/" + u, c, A, d, l, u);
        } else if (d in e.propsKeywords) {
          if (m && typeof m == "object")
            for (var g in m)
              r(s, n, o, m[g], A + "/" + d + "/" + t(g), c, A, d, l, g);
        } else (d in e.keywords || s.allKeys && !(d in e.skipKeywords)) && r(s, n, o, m, A + "/" + d, c, A, d, l);
      }
      o(l, A, c, a, i, f, y);
    }
  }
  function t(s) {
    return s.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return oa.exports;
}
var un;
function zr() {
  if (un) return ke;
  un = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.getSchemaRefs = ke.resolveUrl = ke.normalizeId = ke._getFullPath = ke.getFullPath = ke.inlineRef = void 0;
  const e = /* @__PURE__ */ we(), r = Ii(), t = Xs(), s = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function n(u, g = !0) {
    return typeof u == "boolean" ? !0 : g === !0 ? !l(u) : g ? A(u) <= g : !1;
  }
  ke.inlineRef = n;
  const o = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function l(u) {
    for (const g in u) {
      if (o.has(g))
        return !0;
      const p = u[g];
      if (Array.isArray(p) && p.some(l) || typeof p == "object" && l(p))
        return !0;
    }
    return !1;
  }
  function A(u) {
    let g = 0;
    for (const p in u) {
      if (p === "$ref")
        return 1 / 0;
      if (g++, !s.has(p) && (typeof u[p] == "object" && (0, e.eachItem)(u[p], (h) => g += A(h)), g === 1 / 0))
        return 1 / 0;
    }
    return g;
  }
  function c(u, g = "", p) {
    p !== !1 && (g = f(g));
    const h = u.parse(g);
    return a(u, h);
  }
  ke.getFullPath = c;
  function a(u, g) {
    return u.serialize(g).split("#")[0] + "#";
  }
  ke._getFullPath = a;
  const i = /#\/?$/;
  function f(u) {
    return u ? u.replace(i, "") : "";
  }
  ke.normalizeId = f;
  function y(u, g, p) {
    return p = f(p), u.resolve(g, p);
  }
  ke.resolveUrl = y;
  const d = /^[a-z_][-a-z0-9._]*$/i;
  function m(u, g) {
    if (typeof u == "boolean")
      return {};
    const { schemaId: p, uriResolver: h } = this.opts, _ = f(u[p] || g), E = { "": _ }, v = c(h, _, !1), C = {}, x = /* @__PURE__ */ new Set();
    return t(u, { allKeys: !0 }, (k, O, T, M) => {
      if (M === void 0)
        return;
      const w = v + O;
      let G = E[M];
      typeof k[p] == "string" && (G = ee.call(this, k[p])), Y.call(this, k.$anchor), Y.call(this, k.$dynamicAnchor), E[O] = G;
      function ee(ne) {
        const Z = this.opts.uriResolver.resolve;
        if (ne = f(G ? Z(G, ne) : ne), x.has(ne))
          throw R(ne);
        x.add(ne);
        let Q = this.refs[ne];
        return typeof Q == "string" && (Q = this.refs[Q]), typeof Q == "object" ? P(k, Q.schema, ne) : ne !== f(w) && (ne[0] === "#" ? (P(k, C[ne], ne), C[ne] = k) : this.refs[ne] = w), ne;
      }
      function Y(ne) {
        if (typeof ne == "string") {
          if (!d.test(ne))
            throw new Error(`invalid anchor "${ne}"`);
          ee.call(this, `#${ne}`);
        }
      }
    }), C;
    function P(k, O, T) {
      if (O !== void 0 && !r(k, O))
        throw R(T);
    }
    function R(k) {
      return new Error(`reference "${k}" resolves to more than one schema`);
    }
  }
  return ke.getSchemaRefs = m, ke;
}
var hn;
function Ur() {
  if (hn) return He;
  hn = 1, Object.defineProperty(He, "__esModule", { value: !0 }), He.getData = He.KeywordCxt = He.validateFunctionCode = void 0;
  const e = /* @__PURE__ */ $s(), r = /* @__PURE__ */ Fr(), t = /* @__PURE__ */ ki(), s = /* @__PURE__ */ Fr(), n = /* @__PURE__ */ zs(), o = /* @__PURE__ */ Us(), l = /* @__PURE__ */ Gs(), A = /* @__PURE__ */ ge(), c = /* @__PURE__ */ at(), a = /* @__PURE__ */ zr(), i = /* @__PURE__ */ we(), f = /* @__PURE__ */ $r();
  function y(z) {
    if (v(z) && (x(z), E(z))) {
      g(z);
      return;
    }
    d(z, () => (0, e.topBoolOrEmptySchema)(z));
  }
  He.validateFunctionCode = y;
  function d({ gen: z, validateName: q, schema: j, schemaEnv: b, opts: X }, W) {
    X.code.es5 ? z.func(q, (0, A._)`${c.default.data}, ${c.default.valCxt}`, b.$async, () => {
      z.code((0, A._)`"use strict"; ${h(j, X)}`), u(z, X), z.code(W);
    }) : z.func(q, (0, A._)`${c.default.data}, ${m(X)}`, b.$async, () => z.code(h(j, X)).code(W));
  }
  function m(z) {
    return (0, A._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${z.dynamicRef ? (0, A._)`, ${c.default.dynamicAnchors}={}` : A.nil}}={}`;
  }
  function u(z, q) {
    z.if(c.default.valCxt, () => {
      z.var(c.default.instancePath, (0, A._)`${c.default.valCxt}.${c.default.instancePath}`), z.var(c.default.parentData, (0, A._)`${c.default.valCxt}.${c.default.parentData}`), z.var(c.default.parentDataProperty, (0, A._)`${c.default.valCxt}.${c.default.parentDataProperty}`), z.var(c.default.rootData, (0, A._)`${c.default.valCxt}.${c.default.rootData}`), q.dynamicRef && z.var(c.default.dynamicAnchors, (0, A._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      z.var(c.default.instancePath, (0, A._)`""`), z.var(c.default.parentData, (0, A._)`undefined`), z.var(c.default.parentDataProperty, (0, A._)`undefined`), z.var(c.default.rootData, c.default.data), q.dynamicRef && z.var(c.default.dynamicAnchors, (0, A._)`{}`);
    });
  }
  function g(z) {
    const { schema: q, opts: j, gen: b } = z;
    d(z, () => {
      j.$comment && q.$comment && M(z), k(z), b.let(c.default.vErrors, null), b.let(c.default.errors, 0), j.unevaluated && p(z), P(z), w(z);
    });
  }
  function p(z) {
    const { gen: q, validateName: j } = z;
    z.evaluated = q.const("evaluated", (0, A._)`${j}.evaluated`), q.if((0, A._)`${z.evaluated}.dynamicProps`, () => q.assign((0, A._)`${z.evaluated}.props`, (0, A._)`undefined`)), q.if((0, A._)`${z.evaluated}.dynamicItems`, () => q.assign((0, A._)`${z.evaluated}.items`, (0, A._)`undefined`));
  }
  function h(z, q) {
    const j = typeof z == "object" && z[q.schemaId];
    return j && (q.code.source || q.code.process) ? (0, A._)`/*# sourceURL=${j} */` : A.nil;
  }
  function _(z, q) {
    if (v(z) && (x(z), E(z))) {
      C(z, q);
      return;
    }
    (0, e.boolOrEmptySchema)(z, q);
  }
  function E({ schema: z, self: q }) {
    if (typeof z == "boolean")
      return !z;
    for (const j in z)
      if (q.RULES.all[j])
        return !0;
    return !1;
  }
  function v(z) {
    return typeof z.schema != "boolean";
  }
  function C(z, q) {
    const { schema: j, gen: b, opts: X } = z;
    X.$comment && j.$comment && M(z), O(z), T(z);
    const W = b.const("_errs", c.default.errors);
    P(z, W), b.var(q, (0, A._)`${W} === ${c.default.errors}`);
  }
  function x(z) {
    (0, i.checkUnknownRules)(z), R(z);
  }
  function P(z, q) {
    if (z.opts.jtd)
      return ee(z, [], !1, q);
    const j = (0, r.getSchemaTypes)(z.schema), b = (0, r.coerceAndCheckDataType)(z, j);
    ee(z, j, !b, q);
  }
  function R(z) {
    const { schema: q, errSchemaPath: j, opts: b, self: X } = z;
    q.$ref && b.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(q, X.RULES) && X.logger.warn(`$ref: keywords ignored in schema at path "${j}"`);
  }
  function k(z) {
    const { schema: q, opts: j } = z;
    q.default !== void 0 && j.useDefaults && j.strictSchema && (0, i.checkStrictMode)(z, "default is ignored in the schema root");
  }
  function O(z) {
    const q = z.schema[z.opts.schemaId];
    q && (z.baseId = (0, a.resolveUrl)(z.opts.uriResolver, z.baseId, q));
  }
  function T(z) {
    if (z.schema.$async && !z.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function M({ gen: z, schemaEnv: q, schema: j, errSchemaPath: b, opts: X }) {
    const W = j.$comment;
    if (X.$comment === !0)
      z.code((0, A._)`${c.default.self}.logger.log(${W})`);
    else if (typeof X.$comment == "function") {
      const I = (0, A.str)`${b}/$comment`, B = z.scopeValue("root", { ref: q.root });
      z.code((0, A._)`${c.default.self}.opts.$comment(${W}, ${I}, ${B}.schema)`);
    }
  }
  function w(z) {
    const { gen: q, schemaEnv: j, validateName: b, ValidationError: X, opts: W } = z;
    j.$async ? q.if((0, A._)`${c.default.errors} === 0`, () => q.return(c.default.data), () => q.throw((0, A._)`new ${X}(${c.default.vErrors})`)) : (q.assign((0, A._)`${b}.errors`, c.default.vErrors), W.unevaluated && G(z), q.return((0, A._)`${c.default.errors} === 0`));
  }
  function G({ gen: z, evaluated: q, props: j, items: b }) {
    j instanceof A.Name && z.assign((0, A._)`${q}.props`, j), b instanceof A.Name && z.assign((0, A._)`${q}.items`, b);
  }
  function ee(z, q, j, b) {
    const { gen: X, schema: W, data: I, allErrors: B, opts: U, self: K } = z, { RULES: J } = K;
    if (W.$ref && (U.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(W, J))) {
      X.block(() => oe(z, "$ref", J.all.$ref.definition));
      return;
    }
    U.jtd || ne(z, q), X.block(() => {
      for (const te of J.rules)
        H(te);
      H(J.post);
    });
    function H(te) {
      (0, t.shouldUseGroup)(W, te) && (te.type ? (X.if((0, s.checkDataType)(te.type, I, U.strictNumbers)), Y(z, te), q.length === 1 && q[0] === te.type && j && (X.else(), (0, s.reportTypeError)(z)), X.endIf()) : Y(z, te), B || X.if((0, A._)`${c.default.errors} === ${b || 0}`));
    }
  }
  function Y(z, q) {
    const { gen: j, schema: b, opts: { useDefaults: X } } = z;
    X && (0, n.assignDefaults)(z, q.type), j.block(() => {
      for (const W of q.rules)
        (0, t.shouldUseRule)(b, W) && oe(z, W.keyword, W.definition, q.type);
    });
  }
  function ne(z, q) {
    z.schemaEnv.meta || !z.opts.strictTypes || (Z(z, q), z.opts.allowUnionTypes || Q(z, q), D(z, z.dataTypes));
  }
  function Z(z, q) {
    if (q.length) {
      if (!z.dataTypes.length) {
        z.dataTypes = q;
        return;
      }
      q.forEach((j) => {
        $(z.dataTypes, j) || N(z, `type "${j}" not allowed by context "${z.dataTypes.join(",")}"`);
      }), L(z, q);
    }
  }
  function Q(z, q) {
    q.length > 1 && !(q.length === 2 && q.includes("null")) && N(z, "use allowUnionTypes to allow union type keyword");
  }
  function D(z, q) {
    const j = z.self.RULES.all;
    for (const b in j) {
      const X = j[b];
      if (typeof X == "object" && (0, t.shouldUseRule)(z.schema, X)) {
        const { type: W } = X.definition;
        W.length && !W.some((I) => F(q, I)) && N(z, `missing type "${W.join(",")}" for keyword "${b}"`);
      }
    }
  }
  function F(z, q) {
    return z.includes(q) || q === "number" && z.includes("integer");
  }
  function $(z, q) {
    return z.includes(q) || q === "integer" && z.includes("number");
  }
  function L(z, q) {
    const j = [];
    for (const b of z.dataTypes)
      $(q, b) ? j.push(b) : q.includes("integer") && b === "number" && j.push("integer");
    z.dataTypes = j;
  }
  function N(z, q) {
    const j = z.schemaEnv.baseId + z.errSchemaPath;
    q += ` at "${j}" (strictTypes)`, (0, i.checkStrictMode)(z, q, z.opts.strictTypes);
  }
  class V {
    constructor(q, j, b) {
      if ((0, o.validateKeywordUsage)(q, j, b), this.gen = q.gen, this.allErrors = q.allErrors, this.keyword = b, this.data = q.data, this.schema = q.schema[b], this.$data = j.$data && q.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(q, this.schema, b, this.$data), this.schemaType = j.schemaType, this.parentSchema = q.schema, this.params = {}, this.it = q, this.def = j, this.$data)
        this.schemaCode = q.gen.const("vSchema", Ae(this.$data, q));
      else if (this.schemaCode = this.schemaValue, !(0, o.validSchemaType)(this.schema, j.schemaType, j.allowUndefined))
        throw new Error(`${b} value must be ${JSON.stringify(j.schemaType)}`);
      ("code" in j ? j.trackErrors : j.errors !== !1) && (this.errsCount = q.gen.const("_errs", c.default.errors));
    }
    result(q, j, b) {
      this.failResult((0, A.not)(q), j, b);
    }
    failResult(q, j, b) {
      this.gen.if(q), b ? b() : this.error(), j ? (this.gen.else(), j(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(q, j) {
      this.failResult((0, A.not)(q), void 0, j);
    }
    fail(q) {
      if (q === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(q), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(q) {
      if (!this.$data)
        return this.fail(q);
      const { schemaCode: j } = this;
      this.fail((0, A._)`${j} !== undefined && (${(0, A.or)(this.invalid$data(), q)})`);
    }
    error(q, j, b) {
      if (j) {
        this.setParams(j), this._error(q, b), this.setParams({});
        return;
      }
      this._error(q, b);
    }
    _error(q, j) {
      (q ? f.reportExtraError : f.reportError)(this, this.def.error, j);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(q) {
      this.allErrors || this.gen.if(q);
    }
    setParams(q, j) {
      j ? Object.assign(this.params, q) : this.params = q;
    }
    block$data(q, j, b = A.nil) {
      this.gen.block(() => {
        this.check$data(q, b), j();
      });
    }
    check$data(q = A.nil, j = A.nil) {
      if (!this.$data)
        return;
      const { gen: b, schemaCode: X, schemaType: W, def: I } = this;
      b.if((0, A.or)((0, A._)`${X} === undefined`, j)), q !== A.nil && b.assign(q, !0), (W.length || I.validateSchema) && (b.elseIf(this.invalid$data()), this.$dataError(), q !== A.nil && b.assign(q, !1)), b.else();
    }
    invalid$data() {
      const { gen: q, schemaCode: j, schemaType: b, def: X, it: W } = this;
      return (0, A.or)(I(), B());
      function I() {
        if (b.length) {
          if (!(j instanceof A.Name))
            throw new Error("ajv implementation error");
          const U = Array.isArray(b) ? b : [b];
          return (0, A._)`${(0, s.checkDataTypes)(U, j, W.opts.strictNumbers, s.DataType.Wrong)}`;
        }
        return A.nil;
      }
      function B() {
        if (X.validateSchema) {
          const U = q.scopeValue("validate$data", { ref: X.validateSchema });
          return (0, A._)`!${U}(${j})`;
        }
        return A.nil;
      }
    }
    subschema(q, j) {
      const b = (0, l.getSubschema)(this.it, q);
      (0, l.extendSubschemaData)(b, this.it, q), (0, l.extendSubschemaMode)(b, q);
      const X = { ...this.it, ...b, items: void 0, props: void 0 };
      return _(X, j), X;
    }
    mergeEvaluated(q, j) {
      const { it: b, gen: X } = this;
      b.opts.unevaluated && (b.props !== !0 && q.props !== void 0 && (b.props = i.mergeEvaluated.props(X, q.props, b.props, j)), b.items !== !0 && q.items !== void 0 && (b.items = i.mergeEvaluated.items(X, q.items, b.items, j)));
    }
    mergeValidEvaluated(q, j) {
      const { it: b, gen: X } = this;
      if (b.opts.unevaluated && (b.props !== !0 || b.items !== !0))
        return X.if(j, () => this.mergeEvaluated(q, A.Name)), !0;
    }
  }
  He.KeywordCxt = V;
  function oe(z, q, j, b) {
    const X = new V(z, j, q);
    "code" in j ? j.code(X, b) : X.$data && j.validate ? (0, o.funcKeywordCode)(X, j) : "macro" in j ? (0, o.macroKeywordCode)(X, j) : (j.compile || j.validate) && (0, o.funcKeywordCode)(X, j);
  }
  const ae = /^\/(?:[^~]|~0|~1)*$/, le = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Ae(z, { dataLevel: q, dataNames: j, dataPathArr: b }) {
    let X, W;
    if (z === "")
      return c.default.rootData;
    if (z[0] === "/") {
      if (!ae.test(z))
        throw new Error(`Invalid JSON-pointer: ${z}`);
      X = z, W = c.default.rootData;
    } else {
      const K = le.exec(z);
      if (!K)
        throw new Error(`Invalid JSON-pointer: ${z}`);
      const J = +K[1];
      if (X = K[2], X === "#") {
        if (J >= q)
          throw new Error(U("property/index", J));
        return b[q - J];
      }
      if (J > q)
        throw new Error(U("data", J));
      if (W = j[q - J], !X)
        return W;
    }
    let I = W;
    const B = X.split("/");
    for (const K of B)
      K && (W = (0, A._)`${W}${(0, A.getProperty)((0, i.unescapeJsonPointer)(K))}`, I = (0, A._)`${I} && ${W}`);
    return I;
    function U(K, J) {
      return `Cannot access ${K} ${J} levels up, current level is ${q}`;
    }
  }
  return He.getData = Ae, He;
}
var qt = {}, pn;
function Ba() {
  if (pn) return qt;
  pn = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(t) {
      super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
    }
  }
  return qt.default = e, qt;
}
var Vt = {}, mn;
function Gr() {
  if (mn) return Vt;
  mn = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ zr();
  class r extends Error {
    constructor(s, n, o, l) {
      super(l || `can't resolve reference ${o} from id ${n}`), this.missingRef = (0, e.resolveUrl)(s, n, o), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(s, this.missingRef));
    }
  }
  return Vt.default = r, Vt;
}
var Fe = {}, gn;
function Sa() {
  if (gn) return Fe;
  gn = 1, Object.defineProperty(Fe, "__esModule", { value: !0 }), Fe.resolveSchema = Fe.getCompilingSchema = Fe.resolveRef = Fe.compileSchema = Fe.SchemaEnv = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ Ba(), t = /* @__PURE__ */ at(), s = /* @__PURE__ */ zr(), n = /* @__PURE__ */ we(), o = /* @__PURE__ */ Ur();
  class l {
    constructor(p) {
      var h;
      this.refs = {}, this.dynamicAnchors = {};
      let _;
      typeof p.schema == "object" && (_ = p.schema), this.schema = p.schema, this.schemaId = p.schemaId, this.root = p.root || this, this.baseId = (h = p.baseId) !== null && h !== void 0 ? h : (0, s.normalizeId)(_?.[p.schemaId || "$id"]), this.schemaPath = p.schemaPath, this.localRefs = p.localRefs, this.meta = p.meta, this.$async = _?.$async, this.refs = {};
    }
  }
  Fe.SchemaEnv = l;
  function A(g) {
    const p = i.call(this, g);
    if (p)
      return p;
    const h = (0, s.getFullPath)(this.opts.uriResolver, g.root.baseId), { es5: _, lines: E } = this.opts.code, { ownProperties: v } = this.opts, C = new e.CodeGen(this.scope, { es5: _, lines: E, ownProperties: v });
    let x;
    g.$async && (x = C.scopeValue("Error", {
      ref: r.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const P = C.scopeName("validate");
    g.validateName = P;
    const R = {
      gen: C,
      allErrors: this.opts.allErrors,
      data: t.default.data,
      parentData: t.default.parentData,
      parentDataProperty: t.default.parentDataProperty,
      dataNames: [t.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: C.scopeValue("schema", this.opts.code.source === !0 ? { ref: g.schema, code: (0, e.stringify)(g.schema) } : { ref: g.schema }),
      validateName: P,
      ValidationError: x,
      schema: g.schema,
      schemaEnv: g,
      rootId: h,
      baseId: g.baseId || h,
      schemaPath: e.nil,
      errSchemaPath: g.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let k;
    try {
      this._compilations.add(g), (0, o.validateFunctionCode)(R), C.optimize(this.opts.code.optimize);
      const O = C.toString();
      k = `${C.scopeRefs(t.default.scope)}return ${O}`, this.opts.code.process && (k = this.opts.code.process(k, g));
      const M = new Function(`${t.default.self}`, `${t.default.scope}`, k)(this, this.scope.get());
      if (this.scope.value(P, { ref: M }), M.errors = null, M.schema = g.schema, M.schemaEnv = g, g.$async && (M.$async = !0), this.opts.code.source === !0 && (M.source = { validateName: P, validateCode: O, scopeValues: C._values }), this.opts.unevaluated) {
        const { props: w, items: G } = R;
        M.evaluated = {
          props: w instanceof e.Name ? void 0 : w,
          items: G instanceof e.Name ? void 0 : G,
          dynamicProps: w instanceof e.Name,
          dynamicItems: G instanceof e.Name
        }, M.source && (M.source.evaluated = (0, e.stringify)(M.evaluated));
      }
      return g.validate = M, g;
    } catch (O) {
      throw delete g.validate, delete g.validateName, k && this.logger.error("Error compiling schema, function code:", k), O;
    } finally {
      this._compilations.delete(g);
    }
  }
  Fe.compileSchema = A;
  function c(g, p, h) {
    var _;
    h = (0, s.resolveUrl)(this.opts.uriResolver, p, h);
    const E = g.refs[h];
    if (E)
      return E;
    let v = y.call(this, g, h);
    if (v === void 0) {
      const C = (_ = g.localRefs) === null || _ === void 0 ? void 0 : _[h], { schemaId: x } = this.opts;
      C && (v = new l({ schema: C, schemaId: x, root: g, baseId: p }));
    }
    if (v !== void 0)
      return g.refs[h] = a.call(this, v);
  }
  Fe.resolveRef = c;
  function a(g) {
    return (0, s.inlineRef)(g.schema, this.opts.inlineRefs) ? g.schema : g.validate ? g : A.call(this, g);
  }
  function i(g) {
    for (const p of this._compilations)
      if (f(p, g))
        return p;
  }
  Fe.getCompilingSchema = i;
  function f(g, p) {
    return g.schema === p.schema && g.root === p.root && g.baseId === p.baseId;
  }
  function y(g, p) {
    let h;
    for (; typeof (h = this.refs[p]) == "string"; )
      p = h;
    return h || this.schemas[p] || d.call(this, g, p);
  }
  function d(g, p) {
    const h = this.opts.uriResolver.parse(p), _ = (0, s._getFullPath)(this.opts.uriResolver, h);
    let E = (0, s.getFullPath)(this.opts.uriResolver, g.baseId, void 0);
    if (Object.keys(g.schema).length > 0 && _ === E)
      return u.call(this, h, g);
    const v = (0, s.normalizeId)(_), C = this.refs[v] || this.schemas[v];
    if (typeof C == "string") {
      const x = d.call(this, g, C);
      return typeof x?.schema != "object" ? void 0 : u.call(this, h, x);
    }
    if (typeof C?.schema == "object") {
      if (C.validate || A.call(this, C), v === (0, s.normalizeId)(p)) {
        const { schema: x } = C, { schemaId: P } = this.opts, R = x[P];
        return R && (E = (0, s.resolveUrl)(this.opts.uriResolver, E, R)), new l({ schema: x, schemaId: P, root: g, baseId: E });
      }
      return u.call(this, h, C);
    }
  }
  Fe.resolveSchema = d;
  const m = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function u(g, { baseId: p, schema: h, root: _ }) {
    var E;
    if (((E = g.fragment) === null || E === void 0 ? void 0 : E[0]) !== "/")
      return;
    for (const x of g.fragment.slice(1).split("/")) {
      if (typeof h == "boolean")
        return;
      const P = h[(0, n.unescapeFragment)(x)];
      if (P === void 0)
        return;
      h = P;
      const R = typeof h == "object" && h[this.opts.schemaId];
      !m.has(x) && R && (p = (0, s.resolveUrl)(this.opts.uriResolver, p, R));
    }
    let v;
    if (typeof h != "boolean" && h.$ref && !(0, n.schemaHasRulesButRef)(h, this.RULES)) {
      const x = (0, s.resolveUrl)(this.opts.uriResolver, p, h.$ref);
      v = d.call(this, _, x);
    }
    const { schemaId: C } = this.opts;
    if (v = v || new l({ schema: h, schemaId: C, root: _, baseId: p }), v.schema !== v.root.schema)
      return v;
  }
  return Fe;
}
const Ws = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", qs = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Vs = "object", Hs = ["$data"], Qs = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, js = !1, Ys = {
  $id: Ws,
  description: qs,
  type: Vs,
  required: Hs,
  properties: Qs,
  additionalProperties: js
};
var Ht = {}, Dt = { exports: {} }, sa, yn;
function Fi() {
  if (yn) return sa;
  yn = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), r = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u), t = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu), s = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu), n = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
  function o(v) {
    let C = "", x = 0, P = 0;
    for (P = 0; P < v.length; P++)
      if (x = v[P].charCodeAt(0), x !== 48) {
        if (!(x >= 48 && x <= 57 || x >= 65 && x <= 70 || x >= 97 && x <= 102))
          return "";
        C += v[P];
        break;
      }
    for (P += 1; P < v.length; P++) {
      if (x = v[P].charCodeAt(0), !(x >= 48 && x <= 57 || x >= 65 && x <= 70 || x >= 97 && x <= 102))
        return "";
      C += v[P];
    }
    return C;
  }
  const l = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function A(v) {
    return v.length = 0, !0;
  }
  function c(v, C, x) {
    if (v.length) {
      const P = o(v);
      if (P !== "")
        C.push(P);
      else
        return x.error = !0, !1;
      v.length = 0;
    }
    return !0;
  }
  function a(v) {
    let C = 0;
    const x = { error: !1, address: "", zone: "" }, P = [], R = [];
    let k = !1, O = !1, T = c;
    for (let M = 0; M < v.length; M++) {
      const w = v[M];
      if (!(w === "[" || w === "]"))
        if (w === ":") {
          if (k === !0 && (O = !0), !T(R, P, x))
            break;
          if (++C > 7) {
            x.error = !0;
            break;
          }
          M > 0 && v[M - 1] === ":" && (k = !0), P.push(":");
          continue;
        } else if (w === "%") {
          if (!T(R, P, x))
            break;
          T = A;
        } else {
          R.push(w);
          continue;
        }
    }
    return R.length && (T === A ? x.zone = R.join("") : O ? P.push(R.join("")) : P.push(o(R))), x.address = P.join(""), x;
  }
  function i(v) {
    if (f(v, ":") < 2)
      return { host: v, isIPV6: !1 };
    const C = a(v);
    if (C.error)
      return { host: v, isIPV6: !1 };
    {
      let x = C.address, P = C.address;
      return C.zone && (x += "%" + C.zone, P += "%25" + C.zone), { host: x, isIPV6: !0, escapedHost: P };
    }
  }
  function f(v, C) {
    let x = 0;
    for (let P = 0; P < v.length; P++)
      v[P] === C && x++;
    return x;
  }
  function y(v) {
    let C = v;
    const x = [];
    let P = -1, R = 0;
    for (; R = C.length; ) {
      if (R === 1) {
        if (C === ".")
          break;
        if (C === "/") {
          x.push("/");
          break;
        } else {
          x.push(C);
          break;
        }
      } else if (R === 2) {
        if (C[0] === ".") {
          if (C[1] === ".")
            break;
          if (C[1] === "/") {
            C = C.slice(2);
            continue;
          }
        } else if (C[0] === "/" && (C[1] === "." || C[1] === "/")) {
          x.push("/");
          break;
        }
      } else if (R === 3 && C === "/..") {
        x.length !== 0 && x.pop(), x.push("/");
        break;
      }
      if (C[0] === ".") {
        if (C[1] === ".") {
          if (C[2] === "/") {
            C = C.slice(3);
            continue;
          }
        } else if (C[1] === "/") {
          C = C.slice(2);
          continue;
        }
      } else if (C[0] === "/" && C[1] === ".") {
        if (C[2] === "/") {
          C = C.slice(2);
          continue;
        } else if (C[2] === "." && C[3] === "/") {
          C = C.slice(3), x.length !== 0 && x.pop();
          continue;
        }
      }
      if ((P = C.indexOf("/", 1)) === -1) {
        x.push(C);
        break;
      } else
        x.push(C.slice(0, P)), C = C.slice(P);
    }
    return x.join("");
  }
  const d = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" }, m = /[@/?#:]/g, u = /[@/?#]/g;
  function g(v, C) {
    const x = C ? u : m;
    return x.lastIndex = 0, v.replace(x, (P) => d[P]);
  }
  function p(v, C = !1) {
    if (v.indexOf("%") === -1)
      return v;
    let x = "";
    for (let P = 0; P < v.length; P++) {
      if (v[P] === "%" && P + 2 < v.length) {
        const R = v.slice(P + 1, P + 3);
        if (t(R)) {
          const k = R.toUpperCase(), O = String.fromCharCode(parseInt(k, 16));
          C && s(O) ? x += O : x += "%" + k, P += 2;
          continue;
        }
      }
      x += v[P];
    }
    return x;
  }
  function h(v) {
    let C = "";
    for (let x = 0; x < v.length; x++) {
      if (v[x] === "%" && x + 2 < v.length) {
        const P = v.slice(x + 1, x + 3);
        if (t(P)) {
          const R = P.toUpperCase(), k = String.fromCharCode(parseInt(R, 16));
          k !== "." && s(k) ? C += k : C += "%" + R, x += 2;
          continue;
        }
      }
      n(v[x]) ? C += v[x] : C += escape(v[x]);
    }
    return C;
  }
  function _(v) {
    let C = "";
    for (let x = 0; x < v.length; x++) {
      if (v[x] === "%" && x + 2 < v.length) {
        const P = v.slice(x + 1, x + 3);
        if (t(P)) {
          C += "%" + P.toUpperCase(), x += 2;
          continue;
        }
      }
      C += escape(v[x]);
    }
    return C;
  }
  function E(v) {
    const C = [];
    if (v.userinfo !== void 0 && (C.push(v.userinfo), C.push("@")), v.host !== void 0) {
      let x = unescape(v.host);
      if (!r(x)) {
        const P = i(x);
        P.isIPV6 === !0 ? x = `[${P.escapedHost}]` : x = g(x, !1);
      }
      C.push(x);
    }
    return (typeof v.port == "number" || typeof v.port == "string") && (C.push(":"), C.push(String(v.port))), C.length ? C.join("") : void 0;
  }
  return sa = {
    nonSimpleDomain: l,
    recomposeAuthority: E,
    reescapeHostDelimiters: g,
    normalizePercentEncoding: p,
    normalizePathEncoding: h,
    escapePreservingEscapes: _,
    removeDotSegments: y,
    isIPv4: r,
    isUUID: e,
    normalizeIPv6: i,
    stringArrayToHexStripped: o
  }, sa;
}
var la, vn;
function Ks() {
  if (vn) return la;
  vn = 1;
  const { isUUID: e } = Fi(), r = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, t = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function s(v) {
    return t.indexOf(
      /** @type {*} */
      v
    ) !== -1;
  }
  function n(v) {
    return v.secure === !0 ? !0 : v.secure === !1 ? !1 : v.scheme ? v.scheme.length === 3 && (v.scheme[0] === "w" || v.scheme[0] === "W") && (v.scheme[1] === "s" || v.scheme[1] === "S") && (v.scheme[2] === "s" || v.scheme[2] === "S") : !1;
  }
  function o(v) {
    return v.host || (v.error = v.error || "HTTP URIs must have a host."), v;
  }
  function l(v) {
    const C = String(v.scheme).toLowerCase() === "https";
    return (v.port === (C ? 443 : 80) || v.port === "") && (v.port = void 0), v.path || (v.path = "/"), v;
  }
  function A(v) {
    return v.secure = n(v), v.resourceName = (v.path || "/") + (v.query ? "?" + v.query : ""), v.path = void 0, v.query = void 0, v;
  }
  function c(v) {
    if ((v.port === (n(v) ? 443 : 80) || v.port === "") && (v.port = void 0), typeof v.secure == "boolean" && (v.scheme = v.secure ? "wss" : "ws", v.secure = void 0), v.resourceName) {
      const [C, x] = v.resourceName.split("?");
      v.path = C && C !== "/" ? C : void 0, v.query = x, v.resourceName = void 0;
    }
    return v.fragment = void 0, v;
  }
  function a(v, C) {
    if (!v.path)
      return v.error = "URN can not be parsed", v;
    const x = v.path.match(r);
    if (x) {
      const P = C.scheme || v.scheme || "urn";
      v.nid = x[1].toLowerCase(), v.nss = x[2];
      const R = `${P}:${C.nid || v.nid}`, k = E(R);
      v.path = void 0, k && (v = k.parse(v, C));
    } else
      v.error = v.error || "URN can not be parsed.";
    return v;
  }
  function i(v, C) {
    if (v.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const x = C.scheme || v.scheme || "urn", P = v.nid.toLowerCase(), R = `${x}:${C.nid || P}`, k = E(R);
    k && (v = k.serialize(v, C));
    const O = v, T = v.nss;
    return O.path = `${P || C.nid}:${T}`, C.skipEscape = !0, O;
  }
  function f(v, C) {
    const x = v;
    return x.uuid = x.nss, x.nss = void 0, !C.tolerant && (!x.uuid || !e(x.uuid)) && (x.error = x.error || "UUID is not valid."), x;
  }
  function y(v) {
    const C = v;
    return C.nss = (v.uuid || "").toLowerCase(), C;
  }
  const d = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: o,
      serialize: l
    }
  ), m = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: d.domainHost,
      parse: o,
      serialize: l
    }
  ), u = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: A,
      serialize: c
    }
  ), g = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: u.domainHost,
      parse: u.parse,
      serialize: u.serialize
    }
  ), _ = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: d,
      https: m,
      ws: u,
      wss: g,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: a,
          serialize: i,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: f,
          serialize: y,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(_, null);
  function E(v) {
    return v && (_[
      /** @type {SchemeName} */
      v
    ] || _[
      /** @type {SchemeName} */
      v.toLowerCase()
    ]) || void 0;
  }
  return la = {
    wsIsSecure: n,
    SCHEMES: _,
    isValidSchemeName: s,
    getSchemeHandler: E
  }, la;
}
var bn;
function Js() {
  if (bn) return Dt.exports;
  bn = 1;
  const { normalizeIPv6: e, removeDotSegments: r, recomposeAuthority: t, normalizePercentEncoding: s, normalizePathEncoding: n, escapePreservingEscapes: o, reescapeHostDelimiters: l, isIPv4: A, nonSimpleDomain: c } = Fi(), { SCHEMES: a, getSchemeHandler: i } = Ks();
  function f(R, k) {
    return typeof R == "string" ? R = /** @type {T} */
    v(R, k) : typeof R == "object" && (R = /** @type {T} */
    E(u(R, k), k)), R;
  }
  function y(R, k, O) {
    const T = O ? Object.assign({ scheme: "null" }, O) : { scheme: "null" }, M = d(E(R, T), E(k, T), T, !0);
    return T.skipEscape = !0, u(M, T);
  }
  function d(R, k, O, T) {
    const M = {};
    return T || (R = E(u(R, O), O), k = E(u(k, O), O)), O = O || {}, !O.tolerant && k.scheme ? (M.scheme = k.scheme, M.userinfo = k.userinfo, M.host = k.host, M.port = k.port, M.path = r(k.path || ""), M.query = k.query) : (k.userinfo !== void 0 || k.host !== void 0 || k.port !== void 0 ? (M.userinfo = k.userinfo, M.host = k.host, M.port = k.port, M.path = r(k.path || ""), M.query = k.query) : (k.path ? (k.path[0] === "/" ? M.path = r(k.path) : ((R.userinfo !== void 0 || R.host !== void 0 || R.port !== void 0) && !R.path ? M.path = "/" + k.path : R.path ? M.path = R.path.slice(0, R.path.lastIndexOf("/") + 1) + k.path : M.path = k.path, M.path = r(M.path)), M.query = k.query) : (M.path = R.path, k.query !== void 0 ? M.query = k.query : M.query = R.query), M.userinfo = R.userinfo, M.host = R.host, M.port = R.port), M.scheme = R.scheme), M.fragment = k.fragment, M;
  }
  function m(R, k, O) {
    const T = x(R, O), M = x(k, O);
    return T !== void 0 && M !== void 0 && T.toLowerCase() === M.toLowerCase();
  }
  function u(R, k) {
    const O = {
      host: R.host,
      scheme: R.scheme,
      userinfo: R.userinfo,
      port: R.port,
      path: R.path,
      query: R.query,
      nid: R.nid,
      nss: R.nss,
      uuid: R.uuid,
      fragment: R.fragment,
      reference: R.reference,
      resourceName: R.resourceName,
      secure: R.secure,
      error: ""
    }, T = Object.assign({}, k), M = [], w = i(T.scheme || O.scheme);
    w && w.serialize && w.serialize(O, T), O.path !== void 0 && (T.skipEscape ? O.path = s(O.path) : (O.path = o(O.path), O.scheme !== void 0 && (O.path = O.path.split("%3A").join(":")))), T.reference !== "suffix" && O.scheme && M.push(O.scheme, ":");
    const G = t(O);
    if (G !== void 0 && (T.reference !== "suffix" && M.push("//"), M.push(G), O.path && O.path[0] !== "/" && M.push("/")), O.path !== void 0) {
      let ee = O.path;
      !T.absolutePath && (!w || !w.absolutePath) && (ee = r(ee)), G === void 0 && ee[0] === "/" && ee[1] === "/" && (ee = "/%2F" + ee.slice(2)), M.push(ee);
    }
    return O.query !== void 0 && M.push("?", O.query), O.fragment !== void 0 && M.push("#", O.fragment), M.join("");
  }
  const g = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u, p = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
  function h(R, k) {
    if (k[2] !== void 0 && R.path && R.path[0] !== "/")
      return 'URI path must start with "/" when authority is present.';
    if (typeof R.port == "number" && (R.port < 0 || R.port > 65535))
      return "URI port is malformed.";
  }
  function _(R, k) {
    const O = Object.assign({}, k), T = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let M = !1, w = !1;
    O.reference === "suffix" && (O.scheme ? R = O.scheme + ":" + R : R = "//" + R);
    const G = R.match(p);
    G !== null && G[1].indexOf("\\") !== -1 && (T.error = "URI authority must not contain a literal backslash.", M = !0);
    const ee = R.match(g);
    if (ee) {
      T.scheme = ee[1], T.userinfo = ee[3], T.host = ee[4], T.port = parseInt(ee[5], 10), T.path = ee[6] || "", T.query = ee[7], T.fragment = ee[8], isNaN(T.port) && (T.port = ee[5]);
      const Y = h(T, ee);
      if (Y !== void 0 && (T.error = T.error || Y, M = !0), T.host)
        if (A(T.host) === !1) {
          const Q = e(T.host);
          T.host = Q.host.toLowerCase(), w = Q.isIPV6;
        } else
          w = !0;
      T.scheme === void 0 && T.userinfo === void 0 && T.host === void 0 && T.port === void 0 && T.query === void 0 && !T.path ? T.reference = "same-document" : T.scheme === void 0 ? T.reference = "relative" : T.fragment === void 0 ? T.reference = "absolute" : T.reference = "uri", O.reference && O.reference !== "suffix" && O.reference !== T.reference && (T.error = T.error || "URI is not a " + O.reference + " reference.");
      const ne = i(O.scheme || T.scheme);
      if (!O.unicodeSupport && (!ne || !ne.unicodeSupport) && T.host && (O.domainHost || ne && ne.domainHost) && w === !1 && c(T.host))
        try {
          T.host = new URL("http://" + T.host).hostname;
        } catch (Z) {
          T.error = T.error || "Host's domain name can not be converted to ASCII: " + Z;
        }
      if ((!ne || ne && !ne.skipNormalize) && (R.indexOf("%") !== -1 && (T.scheme !== void 0 && (T.scheme = unescape(T.scheme)), T.host !== void 0 && (T.host = l(unescape(T.host), w))), T.path && (T.path = n(T.path)), T.fragment))
        try {
          T.fragment = encodeURI(decodeURIComponent(T.fragment));
        } catch {
          T.error = T.error || "URI malformed";
        }
      ne && ne.parse && ne.parse(T, O);
    } else
      T.error = T.error || "URI can not be parsed.";
    return { parsed: T, malformedAuthorityOrPort: M };
  }
  function E(R, k) {
    return _(R, k).parsed;
  }
  function v(R, k) {
    return C(R, k).normalized;
  }
  function C(R, k) {
    const { parsed: O, malformedAuthorityOrPort: T } = _(R, k);
    return {
      normalized: T ? R : u(O, k),
      malformedAuthorityOrPort: T
    };
  }
  function x(R, k) {
    if (typeof R == "string") {
      const { normalized: O, malformedAuthorityOrPort: T } = C(R, k);
      return T ? void 0 : O;
    }
    if (typeof R == "object")
      return u(R, k);
  }
  const P = {
    SCHEMES: a,
    normalize: f,
    resolve: y,
    resolveComponent: d,
    equal: m,
    serialize: u,
    parse: E
  };
  return Dt.exports = P, Dt.exports.default = P, Dt.exports.fastUri = P, Dt.exports;
}
var wn;
function Zs() {
  if (wn) return Ht;
  wn = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = Js();
  return e.code = 'require("ajv/dist/runtime/uri").default', Ht.default = e, Ht;
}
var _n;
function el() {
  return _n || (_n = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var r = /* @__PURE__ */ Ur();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return r.KeywordCxt;
    } });
    var t = /* @__PURE__ */ ge();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return t._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return t.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return t.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return t.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return t.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return t.CodeGen;
    } });
    const s = /* @__PURE__ */ Ba(), n = /* @__PURE__ */ Gr(), o = /* @__PURE__ */ Si(), l = /* @__PURE__ */ Sa(), A = /* @__PURE__ */ ge(), c = /* @__PURE__ */ zr(), a = /* @__PURE__ */ Fr(), i = /* @__PURE__ */ we(), f = Ys, y = /* @__PURE__ */ Zs(), d = (Q, D) => new RegExp(Q, D);
    d.code = "new RegExp";
    const m = ["removeAdditional", "useDefaults", "coerceTypes"], u = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), g = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, p = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, h = 200;
    function _(Q) {
      var D, F, $, L, N, V, oe, ae, le, Ae, z, q, j, b, X, W, I, B, U, K, J, H, te, se, ie;
      const ce = Q.strict, Ce = (D = Q.code) === null || D === void 0 ? void 0 : D.optimize, ye = Ce === !0 || Ce === void 0 ? 1 : Ce || 0, Se = ($ = (F = Q.code) === null || F === void 0 ? void 0 : F.regExp) !== null && $ !== void 0 ? $ : d, nt = (L = Q.uriResolver) !== null && L !== void 0 ? L : y.default;
      return {
        strictSchema: (V = (N = Q.strictSchema) !== null && N !== void 0 ? N : ce) !== null && V !== void 0 ? V : !0,
        strictNumbers: (ae = (oe = Q.strictNumbers) !== null && oe !== void 0 ? oe : ce) !== null && ae !== void 0 ? ae : !0,
        strictTypes: (Ae = (le = Q.strictTypes) !== null && le !== void 0 ? le : ce) !== null && Ae !== void 0 ? Ae : "log",
        strictTuples: (q = (z = Q.strictTuples) !== null && z !== void 0 ? z : ce) !== null && q !== void 0 ? q : "log",
        strictRequired: (b = (j = Q.strictRequired) !== null && j !== void 0 ? j : ce) !== null && b !== void 0 ? b : !1,
        code: Q.code ? { ...Q.code, optimize: ye, regExp: Se } : { optimize: ye, regExp: Se },
        loopRequired: (X = Q.loopRequired) !== null && X !== void 0 ? X : h,
        loopEnum: (W = Q.loopEnum) !== null && W !== void 0 ? W : h,
        meta: (I = Q.meta) !== null && I !== void 0 ? I : !0,
        messages: (B = Q.messages) !== null && B !== void 0 ? B : !0,
        inlineRefs: (U = Q.inlineRefs) !== null && U !== void 0 ? U : !0,
        schemaId: (K = Q.schemaId) !== null && K !== void 0 ? K : "$id",
        addUsedSchema: (J = Q.addUsedSchema) !== null && J !== void 0 ? J : !0,
        validateSchema: (H = Q.validateSchema) !== null && H !== void 0 ? H : !0,
        validateFormats: (te = Q.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (se = Q.unicodeRegExp) !== null && se !== void 0 ? se : !0,
        int32range: (ie = Q.int32range) !== null && ie !== void 0 ? ie : !0,
        uriResolver: nt
      };
    }
    class E {
      constructor(D = {}) {
        this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), D = this.opts = { ...D, ..._(D) };
        const { es5: F, lines: $ } = this.opts.code;
        this.scope = new A.ValueScope({ scope: {}, prefixes: u, es5: F, lines: $ }), this.logger = T(D.logger);
        const L = D.validateFormats;
        D.validateFormats = !1, this.RULES = (0, o.getRules)(), v.call(this, g, D, "NOT SUPPORTED"), v.call(this, p, D, "DEPRECATED", "warn"), this._metaOpts = k.call(this), D.formats && P.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), D.keywords && R.call(this, D.keywords), typeof D.meta == "object" && this.addMetaSchema(D.meta), x.call(this), D.validateFormats = L;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: D, meta: F, schemaId: $ } = this.opts;
        let L = f;
        $ === "id" && (L = { ...f }, L.id = L.$id, delete L.$id), F && D && this.addMetaSchema(L, L[$], !1);
      }
      defaultMeta() {
        const { meta: D, schemaId: F } = this.opts;
        return this.opts.defaultMeta = typeof D == "object" ? D[F] || D : void 0;
      }
      validate(D, F) {
        let $;
        if (typeof D == "string") {
          if ($ = this.getSchema(D), !$)
            throw new Error(`no schema with key or ref "${D}"`);
        } else
          $ = this.compile(D);
        const L = $(F);
        return "$async" in $ || (this.errors = $.errors), L;
      }
      compile(D, F) {
        const $ = this._addSchema(D, F);
        return $.validate || this._compileSchemaEnv($);
      }
      compileAsync(D, F) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: $ } = this.opts;
        return L.call(this, D, F);
        async function L(Ae, z) {
          await N.call(this, Ae.$schema);
          const q = this._addSchema(Ae, z);
          return q.validate || V.call(this, q);
        }
        async function N(Ae) {
          Ae && !this.getSchema(Ae) && await L.call(this, { $ref: Ae }, !0);
        }
        async function V(Ae) {
          try {
            return this._compileSchemaEnv(Ae);
          } catch (z) {
            if (!(z instanceof n.default))
              throw z;
            return oe.call(this, z), await ae.call(this, z.missingSchema), V.call(this, Ae);
          }
        }
        function oe({ missingSchema: Ae, missingRef: z }) {
          if (this.refs[Ae])
            throw new Error(`AnySchema ${Ae} is loaded but ${z} cannot be resolved`);
        }
        async function ae(Ae) {
          const z = await le.call(this, Ae);
          this.refs[Ae] || await N.call(this, z.$schema), this.refs[Ae] || this.addSchema(z, Ae, F);
        }
        async function le(Ae) {
          const z = this._loading[Ae];
          if (z)
            return z;
          try {
            return await (this._loading[Ae] = $(Ae));
          } finally {
            delete this._loading[Ae];
          }
        }
      }
      // Adds schema to the instance
      addSchema(D, F, $, L = this.opts.validateSchema) {
        if (Array.isArray(D)) {
          for (const V of D)
            this.addSchema(V, void 0, $, L);
          return this;
        }
        let N;
        if (typeof D == "object") {
          const { schemaId: V } = this.opts;
          if (N = D[V], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${V} must be string`);
        }
        return F = (0, c.normalizeId)(F || N), this._checkUnique(F), this.schemas[F] = this._addSchema(D, $, F, L, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(D, F, $ = this.opts.validateSchema) {
        return this.addSchema(D, F, !0, $), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(D, F) {
        if (typeof D == "boolean")
          return !0;
        let $;
        if ($ = D.$schema, $ !== void 0 && typeof $ != "string")
          throw new Error("$schema must be a string");
        if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const L = this.validate($, D);
        if (!L && F) {
          const N = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(N);
          else
            throw new Error(N);
        }
        return L;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(D) {
        let F;
        for (; typeof (F = C.call(this, D)) == "string"; )
          D = F;
        if (F === void 0) {
          const { schemaId: $ } = this.opts, L = new l.SchemaEnv({ schema: {}, schemaId: $ });
          if (F = l.resolveSchema.call(this, L, D), !F)
            return;
          this.refs[D] = F;
        }
        return F.validate || this._compileSchemaEnv(F);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(D) {
        if (D instanceof RegExp)
          return this._removeAllSchemas(this.schemas, D), this._removeAllSchemas(this.refs, D), this;
        switch (typeof D) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const F = C.call(this, D);
            return typeof F == "object" && this._cache.delete(F.schema), delete this.schemas[D], delete this.refs[D], this;
          }
          case "object": {
            const F = D;
            this._cache.delete(F);
            let $ = D[this.opts.schemaId];
            return $ && ($ = (0, c.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(D) {
        for (const F of D)
          this.addKeyword(F);
        return this;
      }
      addKeyword(D, F) {
        let $;
        if (typeof D == "string")
          $ = D, typeof F == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), F.keyword = $);
        else if (typeof D == "object" && F === void 0) {
          if (F = D, $ = F.keyword, Array.isArray($) && !$.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (w.call(this, $, F), !F)
          return (0, i.eachItem)($, (N) => G.call(this, N)), this;
        Y.call(this, F);
        const L = {
          ...F,
          type: (0, a.getJSONTypes)(F.type),
          schemaType: (0, a.getJSONTypes)(F.schemaType)
        };
        return (0, i.eachItem)($, L.type.length === 0 ? (N) => G.call(this, N, L) : (N) => L.type.forEach((V) => G.call(this, N, L, V))), this;
      }
      getKeyword(D) {
        const F = this.RULES.all[D];
        return typeof F == "object" ? F.definition : !!F;
      }
      // Remove keyword
      removeKeyword(D) {
        const { RULES: F } = this;
        delete F.keywords[D], delete F.all[D];
        for (const $ of F.rules) {
          const L = $.rules.findIndex((N) => N.keyword === D);
          L >= 0 && $.rules.splice(L, 1);
        }
        return this;
      }
      // Add format
      addFormat(D, F) {
        return typeof F == "string" && (F = new RegExp(F)), this.formats[D] = F, this;
      }
      errorsText(D = this.errors, { separator: F = ", ", dataVar: $ = "data" } = {}) {
        return !D || D.length === 0 ? "No errors" : D.map((L) => `${$}${L.instancePath} ${L.message}`).reduce((L, N) => L + F + N);
      }
      $dataMetaSchema(D, F) {
        const $ = this.RULES.all;
        D = JSON.parse(JSON.stringify(D));
        for (const L of F) {
          const N = L.split("/").slice(1);
          let V = D;
          for (const oe of N)
            V = V[oe];
          for (const oe in $) {
            const ae = $[oe];
            if (typeof ae != "object")
              continue;
            const { $data: le } = ae.definition, Ae = V[oe];
            le && Ae && (V[oe] = Z(Ae));
          }
        }
        return D;
      }
      _removeAllSchemas(D, F) {
        for (const $ in D) {
          const L = D[$];
          (!F || F.test($)) && (typeof L == "string" ? delete D[$] : L && !L.meta && (this._cache.delete(L.schema), delete D[$]));
        }
      }
      _addSchema(D, F, $, L = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let V;
        const { schemaId: oe } = this.opts;
        if (typeof D == "object")
          V = D[oe];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof D != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let ae = this._cache.get(D);
        if (ae !== void 0)
          return ae;
        $ = (0, c.normalizeId)(V || $);
        const le = c.getSchemaRefs.call(this, D, $);
        return ae = new l.SchemaEnv({ schema: D, schemaId: oe, meta: F, baseId: $, localRefs: le }), this._cache.set(ae.schema, ae), N && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = ae), L && this.validateSchema(D, !0), ae;
      }
      _checkUnique(D) {
        if (this.schemas[D] || this.refs[D])
          throw new Error(`schema with key or id "${D}" already exists`);
      }
      _compileSchemaEnv(D) {
        if (D.meta ? this._compileMetaSchema(D) : l.compileSchema.call(this, D), !D.validate)
          throw new Error("ajv implementation error");
        return D.validate;
      }
      _compileMetaSchema(D) {
        const F = this.opts;
        this.opts = this._metaOpts;
        try {
          l.compileSchema.call(this, D);
        } finally {
          this.opts = F;
        }
      }
    }
    E.ValidationError = s.default, E.MissingRefError = n.default, e.default = E;
    function v(Q, D, F, $ = "error") {
      for (const L in Q) {
        const N = L;
        N in D && this.logger[$](`${F}: option ${L}. ${Q[N]}`);
      }
    }
    function C(Q) {
      return Q = (0, c.normalizeId)(Q), this.schemas[Q] || this.refs[Q];
    }
    function x() {
      const Q = this.opts.schemas;
      if (Q)
        if (Array.isArray(Q))
          this.addSchema(Q);
        else
          for (const D in Q)
            this.addSchema(Q[D], D);
    }
    function P() {
      for (const Q in this.opts.formats) {
        const D = this.opts.formats[Q];
        D && this.addFormat(Q, D);
      }
    }
    function R(Q) {
      if (Array.isArray(Q)) {
        this.addVocabulary(Q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const D in Q) {
        const F = Q[D];
        F.keyword || (F.keyword = D), this.addKeyword(F);
      }
    }
    function k() {
      const Q = { ...this.opts };
      for (const D of m)
        delete Q[D];
      return Q;
    }
    const O = { log() {
    }, warn() {
    }, error() {
    } };
    function T(Q) {
      if (Q === !1)
        return O;
      if (Q === void 0)
        return console;
      if (Q.log && Q.warn && Q.error)
        return Q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const M = /^[a-z_$][a-z0-9_$:-]*$/i;
    function w(Q, D) {
      const { RULES: F } = this;
      if ((0, i.eachItem)(Q, ($) => {
        if (F.keywords[$])
          throw new Error(`Keyword ${$} is already defined`);
        if (!M.test($))
          throw new Error(`Keyword ${$} has invalid name`);
      }), !!D && D.$data && !("code" in D || "validate" in D))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function G(Q, D, F) {
      var $;
      const L = D?.post;
      if (F && L)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let V = L ? N.post : N.rules.find(({ type: ae }) => ae === F);
      if (V || (V = { type: F, rules: [] }, N.rules.push(V)), N.keywords[Q] = !0, !D)
        return;
      const oe = {
        keyword: Q,
        definition: {
          ...D,
          type: (0, a.getJSONTypes)(D.type),
          schemaType: (0, a.getJSONTypes)(D.schemaType)
        }
      };
      D.before ? ee.call(this, V, oe, D.before) : V.rules.push(oe), N.all[Q] = oe, ($ = D.implements) === null || $ === void 0 || $.forEach((ae) => this.addKeyword(ae));
    }
    function ee(Q, D, F) {
      const $ = Q.rules.findIndex((L) => L.keyword === F);
      $ >= 0 ? Q.rules.splice($, 0, D) : (Q.rules.push(D), this.logger.warn(`rule ${F} is not defined`));
    }
    function Y(Q) {
      let { metaSchema: D } = Q;
      D !== void 0 && (Q.$data && this.opts.$data && (D = Z(D)), Q.validateSchema = this.compile(D, !0));
    }
    const ne = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Z(Q) {
      return { anyOf: [Q, ne] };
    }
  })(ea)), ea;
}
var Qt = {}, jt = {}, Yt = {}, Cn;
function tl() {
  if (Cn) return Yt;
  Cn = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Yt.default = e, Yt;
}
var Je = {}, xn;
function rl() {
  if (xn) return Je;
  xn = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.callRef = Je.getValidate = void 0;
  const e = /* @__PURE__ */ Gr(), r = /* @__PURE__ */ Xe(), t = /* @__PURE__ */ ge(), s = /* @__PURE__ */ at(), n = /* @__PURE__ */ Sa(), o = /* @__PURE__ */ we(), l = {
    keyword: "$ref",
    schemaType: "string",
    code(a) {
      const { gen: i, schema: f, it: y } = a, { baseId: d, schemaEnv: m, validateName: u, opts: g, self: p } = y, { root: h } = m;
      if ((f === "#" || f === "#/") && d === h.baseId)
        return E();
      const _ = n.resolveRef.call(p, h, d, f);
      if (_ === void 0)
        throw new e.default(y.opts.uriResolver, d, f);
      if (_ instanceof n.SchemaEnv)
        return v(_);
      return C(_);
      function E() {
        if (m === h)
          return c(a, u, m, m.$async);
        const x = i.scopeValue("root", { ref: h });
        return c(a, (0, t._)`${x}.validate`, h, h.$async);
      }
      function v(x) {
        const P = A(a, x);
        c(a, P, x, x.$async);
      }
      function C(x) {
        const P = i.scopeValue("schema", g.code.source === !0 ? { ref: x, code: (0, t.stringify)(x) } : { ref: x }), R = i.name("valid"), k = a.subschema({
          schema: x,
          dataTypes: [],
          schemaPath: t.nil,
          topSchemaRef: P,
          errSchemaPath: f
        }, R);
        a.mergeEvaluated(k), a.ok(R);
      }
    }
  };
  function A(a, i) {
    const { gen: f } = a;
    return i.validate ? f.scopeValue("validate", { ref: i.validate }) : (0, t._)`${f.scopeValue("wrapper", { ref: i })}.validate`;
  }
  Je.getValidate = A;
  function c(a, i, f, y) {
    const { gen: d, it: m } = a, { allErrors: u, schemaEnv: g, opts: p } = m, h = p.passContext ? s.default.this : t.nil;
    y ? _() : E();
    function _() {
      if (!g.$async)
        throw new Error("async schema referenced by sync schema");
      const x = d.let("valid");
      d.try(() => {
        d.code((0, t._)`await ${(0, r.callValidateCode)(a, i, h)}`), C(i), u || d.assign(x, !0);
      }, (P) => {
        d.if((0, t._)`!(${P} instanceof ${m.ValidationError})`, () => d.throw(P)), v(P), u || d.assign(x, !1);
      }), a.ok(x);
    }
    function E() {
      a.result((0, r.callValidateCode)(a, i, h), () => C(i), () => v(i));
    }
    function v(x) {
      const P = (0, t._)`${x}.errors`;
      d.assign(s.default.vErrors, (0, t._)`${s.default.vErrors} === null ? ${P} : ${s.default.vErrors}.concat(${P})`), d.assign(s.default.errors, (0, t._)`${s.default.vErrors}.length`);
    }
    function C(x) {
      var P;
      if (!m.opts.unevaluated)
        return;
      const R = (P = f?.validate) === null || P === void 0 ? void 0 : P.evaluated;
      if (m.props !== !0)
        if (R && !R.dynamicProps)
          R.props !== void 0 && (m.props = o.mergeEvaluated.props(d, R.props, m.props));
        else {
          const k = d.var("props", (0, t._)`${x}.evaluated.props`);
          m.props = o.mergeEvaluated.props(d, k, m.props, t.Name);
        }
      if (m.items !== !0)
        if (R && !R.dynamicItems)
          R.items !== void 0 && (m.items = o.mergeEvaluated.items(d, R.items, m.items));
        else {
          const k = d.var("items", (0, t._)`${x}.evaluated.items`);
          m.items = o.mergeEvaluated.items(d, k, m.items, t.Name);
        }
    }
  }
  return Je.callRef = c, Je.default = l, Je;
}
var En;
function al() {
  if (En) return jt;
  En = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ tl(), r = /* @__PURE__ */ rl(), t = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    r.default
  ];
  return jt.default = t, jt;
}
var Kt = {}, Jt = {}, Tn;
function nl() {
  if (Tn) return Jt;
  Tn = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = e.operators, t = {
    maximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
    minimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
    exclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
    exclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
  }, s = {
    message: ({ keyword: o, schemaCode: l }) => (0, e.str)`must be ${t[o].okStr} ${l}`,
    params: ({ keyword: o, schemaCode: l }) => (0, e._)`{comparison: ${t[o].okStr}, limit: ${l}}`
  }, n = {
    keyword: Object.keys(t),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: s,
    code(o) {
      const { keyword: l, data: A, schemaCode: c } = o;
      o.fail$data((0, e._)`${A} ${t[l].fail} ${c} || isNaN(${A})`);
    }
  };
  return Jt.default = n, Jt;
}
var Zt = {}, Ln;
function il() {
  if (Ln) return Zt;
  Ln = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, e.str)`must be multiple of ${s}`,
      params: ({ schemaCode: s }) => (0, e._)`{multipleOf: ${s}}`
    },
    code(s) {
      const { gen: n, data: o, schemaCode: l, it: A } = s, c = A.opts.multipleOfPrecision, a = n.let("res"), i = c ? (0, e._)`Math.abs(Math.round(${a}) - ${a}) > 1e-${c}` : (0, e._)`${a} !== parseInt(${a})`;
      s.fail$data((0, e._)`(${l} === 0 || (${a} = ${o}/${l}, ${i}))`);
    }
  };
  return Zt.default = t, Zt;
}
var er = {}, tr = {}, Rn;
function ol() {
  if (Rn) return tr;
  Rn = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  function e(r) {
    const t = r.length;
    let s = 0, n = 0, o;
    for (; n < t; )
      s++, o = r.charCodeAt(n++), o >= 55296 && o <= 56319 && n < t && (o = r.charCodeAt(n), (o & 64512) === 56320 && n++);
    return s;
  }
  return tr.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', tr;
}
var Dn;
function sl() {
  if (Dn) return er;
  Dn = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ ol(), n = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: o, schemaCode: l }) {
        const A = o === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${A} than ${l} characters`;
      },
      params: ({ schemaCode: o }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { keyword: l, data: A, schemaCode: c, it: a } = o, i = l === "maxLength" ? e.operators.GT : e.operators.LT, f = a.opts.unicode === !1 ? (0, e._)`${A}.length` : (0, e._)`${(0, r.useFunc)(o.gen, t.default)}(${A})`;
      o.fail$data((0, e._)`${f} ${i} ${c}`);
    }
  };
  return er.default = n, er;
}
var rr = {}, Pn;
function ll() {
  if (Pn) return rr;
  Pn = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Xe(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ ge(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: o }) => (0, t.str)`must match pattern "${o}"`,
      params: ({ schemaCode: o }) => (0, t._)`{pattern: ${o}}`
    },
    code(o) {
      const { gen: l, data: A, $data: c, schema: a, schemaCode: i, it: f } = o, y = f.opts.unicodeRegExp ? "u" : "";
      if (c) {
        const { regExp: d } = f.opts.code, m = d.code === "new RegExp" ? (0, t._)`new RegExp` : (0, r.useFunc)(l, d), u = l.let("valid");
        l.try(() => l.assign(u, (0, t._)`${m}(${i}, ${y}).test(${A})`), () => l.assign(u, !1)), o.fail$data((0, t._)`!${u}`);
      } else {
        const d = (0, e.usePattern)(o, a);
        o.fail$data((0, t._)`!${d}.test(${A})`);
      }
    }
  };
  return rr.default = n, rr;
}
var ar = {}, Nn;
function cl() {
  if (Nn) return ar;
  Nn = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: n }) {
        const o = s === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${o} than ${n} properties`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: n, data: o, schemaCode: l } = s, A = n === "maxProperties" ? e.operators.GT : e.operators.LT;
      s.fail$data((0, e._)`Object.keys(${o}).length ${A} ${l}`);
    }
  };
  return ar.default = t, ar;
}
var nr = {}, Bn;
function Al() {
  if (Bn) return nr;
  Bn = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Xe(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ we(), n = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: o } }) => (0, r.str)`must have required property '${o}'`,
      params: ({ params: { missingProperty: o } }) => (0, r._)`{missingProperty: ${o}}`
    },
    code(o) {
      const { gen: l, schema: A, schemaCode: c, data: a, $data: i, it: f } = o, { opts: y } = f;
      if (!i && A.length === 0)
        return;
      const d = A.length >= y.loopRequired;
      if (f.allErrors ? m() : u(), y.strictRequired) {
        const h = o.parentSchema.properties, { definedProperties: _ } = o.it;
        for (const E of A)
          if (h?.[E] === void 0 && !_.has(E)) {
            const v = f.schemaEnv.baseId + f.errSchemaPath, C = `required property "${E}" is not defined at "${v}" (strictRequired)`;
            (0, t.checkStrictMode)(f, C, f.opts.strictRequired);
          }
      }
      function m() {
        if (d || i)
          o.block$data(r.nil, g);
        else
          for (const h of A)
            (0, e.checkReportMissingProp)(o, h);
      }
      function u() {
        const h = l.let("missing");
        if (d || i) {
          const _ = l.let("valid", !0);
          o.block$data(_, () => p(h, _)), o.ok(_);
        } else
          l.if((0, e.checkMissingProp)(o, A, h)), (0, e.reportMissingProp)(o, h), l.else();
      }
      function g() {
        l.forOf("prop", c, (h) => {
          o.setParams({ missingProperty: h }), l.if((0, e.noPropertyInData)(l, a, h, y.ownProperties), () => o.error());
        });
      }
      function p(h, _) {
        o.setParams({ missingProperty: h }), l.forOf(h, c, () => {
          l.assign(_, (0, e.propertyInData)(l, a, h, y.ownProperties)), l.if((0, r.not)(_), () => {
            o.error(), l.break();
          });
        }, r.nil);
      }
    }
  };
  return nr.default = n, nr;
}
var ir = {}, Sn;
function dl() {
  if (Sn) return ir;
  Sn = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: n }) {
        const o = s === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${o} than ${n} items`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: n, data: o, schemaCode: l } = s, A = n === "maxItems" ? e.operators.GT : e.operators.LT;
      s.fail$data((0, e._)`${o}.length ${A} ${l}`);
    }
  };
  return ir.default = t, ir;
}
var or = {}, sr = {}, kn;
function ka() {
  if (kn) return sr;
  kn = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = Ii();
  return e.code = 'require("ajv/dist/runtime/equal").default', sr.default = e, sr;
}
var In;
function fl() {
  if (In) return or;
  In = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Fr(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ we(), s = /* @__PURE__ */ ka(), o = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: l, j: A } }) => (0, r.str)`must NOT have duplicate items (items ## ${A} and ${l} are identical)`,
      params: ({ params: { i: l, j: A } }) => (0, r._)`{i: ${l}, j: ${A}}`
    },
    code(l) {
      const { gen: A, data: c, $data: a, schema: i, parentSchema: f, schemaCode: y, it: d } = l;
      if (!a && !i)
        return;
      const m = A.let("valid"), u = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      l.block$data(m, g, (0, r._)`${y} === false`), l.ok(m);
      function g() {
        const E = A.let("i", (0, r._)`${c}.length`), v = A.let("j");
        l.setParams({ i: E, j: v }), A.assign(m, !0), A.if((0, r._)`${E} > 1`, () => (p() ? h : _)(E, v));
      }
      function p() {
        return u.length > 0 && !u.some((E) => E === "object" || E === "array");
      }
      function h(E, v) {
        const C = A.name("item"), x = (0, e.checkDataTypes)(u, C, d.opts.strictNumbers, e.DataType.Wrong), P = A.const("indices", (0, r._)`{}`);
        A.for((0, r._)`;${E}--;`, () => {
          A.let(C, (0, r._)`${c}[${E}]`), A.if(x, (0, r._)`continue`), u.length > 1 && A.if((0, r._)`typeof ${C} == "string"`, (0, r._)`${C} += "_"`), A.if((0, r._)`typeof ${P}[${C}] == "number"`, () => {
            A.assign(v, (0, r._)`${P}[${C}]`), l.error(), A.assign(m, !1).break();
          }).code((0, r._)`${P}[${C}] = ${E}`);
        });
      }
      function _(E, v) {
        const C = (0, t.useFunc)(A, s.default), x = A.name("outer");
        A.label(x).for((0, r._)`;${E}--;`, () => A.for((0, r._)`${v} = ${E}; ${v}--;`, () => A.if((0, r._)`${C}(${c}[${E}], ${c}[${v}])`, () => {
          l.error(), A.assign(m, !1).break(x);
        })));
      }
    }
  };
  return or.default = o, or;
}
var lr = {}, Fn;
function ul() {
  if (Fn) return lr;
  Fn = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ ka(), n = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: o }) => (0, e._)`{allowedValue: ${o}}`
    },
    code(o) {
      const { gen: l, data: A, $data: c, schemaCode: a, schema: i } = o;
      c || i && typeof i == "object" ? o.fail$data((0, e._)`!${(0, r.useFunc)(l, t.default)}(${A}, ${a})`) : o.fail((0, e._)`${i} !== ${A}`);
    }
  };
  return lr.default = n, lr;
}
var cr = {}, Mn;
function hl() {
  if (Mn) return cr;
  Mn = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ ka(), n = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: o }) => (0, e._)`{allowedValues: ${o}}`
    },
    code(o) {
      const { gen: l, data: A, $data: c, schema: a, schemaCode: i, it: f } = o;
      if (!c && a.length === 0)
        throw new Error("enum must have non-empty array");
      const y = a.length >= f.opts.loopEnum;
      let d;
      const m = () => d ?? (d = (0, r.useFunc)(l, t.default));
      let u;
      if (y || c)
        u = l.let("valid"), o.block$data(u, g);
      else {
        if (!Array.isArray(a))
          throw new Error("ajv implementation error");
        const h = l.const("vSchema", i);
        u = (0, e.or)(...a.map((_, E) => p(h, E)));
      }
      o.pass(u);
      function g() {
        l.assign(u, !1), l.forOf("v", i, (h) => l.if((0, e._)`${m()}(${A}, ${h})`, () => l.assign(u, !0).break()));
      }
      function p(h, _) {
        const E = a[_];
        return typeof E == "object" && E !== null ? (0, e._)`${m()}(${A}, ${h}[${_}])` : (0, e._)`${A} === ${E}`;
      }
    }
  };
  return cr.default = n, cr;
}
var On;
function pl() {
  if (On) return Kt;
  On = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ nl(), r = /* @__PURE__ */ il(), t = /* @__PURE__ */ sl(), s = /* @__PURE__ */ ll(), n = /* @__PURE__ */ cl(), o = /* @__PURE__ */ Al(), l = /* @__PURE__ */ dl(), A = /* @__PURE__ */ fl(), c = /* @__PURE__ */ ul(), a = /* @__PURE__ */ hl(), i = [
    // number
    e.default,
    r.default,
    // string
    t.default,
    s.default,
    // object
    n.default,
    o.default,
    // array
    l.default,
    A.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    c.default,
    a.default
  ];
  return Kt.default = i, Kt;
}
var Ar = {}, pt = {}, $n;
function Mi() {
  if ($n) return pt;
  $n = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.validateAdditionalItems = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), s = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { parentSchema: l, it: A } = o, { items: c } = l;
      if (!Array.isArray(c)) {
        (0, r.checkStrictMode)(A, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      n(o, c);
    }
  };
  function n(o, l) {
    const { gen: A, schema: c, data: a, keyword: i, it: f } = o;
    f.items = !0;
    const y = A.const("len", (0, e._)`${a}.length`);
    if (c === !1)
      o.setParams({ len: l.length }), o.pass((0, e._)`${y} <= ${l.length}`);
    else if (typeof c == "object" && !(0, r.alwaysValidSchema)(f, c)) {
      const m = A.var("valid", (0, e._)`${y} <= ${l.length}`);
      A.if((0, e.not)(m), () => d(m)), o.ok(m);
    }
    function d(m) {
      A.forRange("i", l.length, y, (u) => {
        o.subschema({ keyword: i, dataProp: u, dataPropType: r.Type.Num }, m), f.allErrors || A.if((0, e.not)(m), () => A.break());
      });
    }
  }
  return pt.validateAdditionalItems = n, pt.default = s, pt;
}
var dr = {}, mt = {}, zn;
function Oi() {
  if (zn) return mt;
  zn = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.validateTuple = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ Xe(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(o) {
      const { schema: l, it: A } = o;
      if (Array.isArray(l))
        return n(o, "additionalItems", l);
      A.items = !0, !(0, r.alwaysValidSchema)(A, l) && o.ok((0, t.validateArray)(o));
    }
  };
  function n(o, l, A = o.schema) {
    const { gen: c, parentSchema: a, data: i, keyword: f, it: y } = o;
    u(a), y.opts.unevaluated && A.length && y.items !== !0 && (y.items = r.mergeEvaluated.items(c, A.length, y.items));
    const d = c.name("valid"), m = c.const("len", (0, e._)`${i}.length`);
    A.forEach((g, p) => {
      (0, r.alwaysValidSchema)(y, g) || (c.if((0, e._)`${m} > ${p}`, () => o.subschema({
        keyword: f,
        schemaProp: p,
        dataProp: p
      }, d)), o.ok(d));
    });
    function u(g) {
      const { opts: p, errSchemaPath: h } = y, _ = A.length, E = _ === g.minItems && (_ === g.maxItems || g[l] === !1);
      if (p.strictTuples && !E) {
        const v = `"${f}" is ${_}-tuple, but minItems or maxItems/${l} are not specified or different at path "${h}"`;
        (0, r.checkStrictMode)(y, v, p.strictTuples);
      }
    }
  }
  return mt.validateTuple = n, mt.default = s, mt;
}
var Un;
function ml() {
  if (Un) return dr;
  Un = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Oi(), r = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (t) => (0, e.validateTuple)(t, "items")
  };
  return dr.default = r, dr;
}
var fr = {}, Gn;
function gl() {
  if (Gn) return fr;
  Gn = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), t = /* @__PURE__ */ Xe(), s = /* @__PURE__ */ Mi(), o = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { schema: A, parentSchema: c, it: a } = l, { prefixItems: i } = c;
      a.items = !0, !(0, r.alwaysValidSchema)(a, A) && (i ? (0, s.validateAdditionalItems)(l, i) : l.ok((0, t.validateArray)(l)));
    }
  };
  return fr.default = o, fr;
}
var ur = {}, Xn;
function yl() {
  if (Xn) return ur;
  Xn = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), s = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: n, max: o } }) => o === void 0 ? (0, e.str)`must contain at least ${n} valid item(s)` : (0, e.str)`must contain at least ${n} and no more than ${o} valid item(s)`,
      params: ({ params: { min: n, max: o } }) => o === void 0 ? (0, e._)`{minContains: ${n}}` : (0, e._)`{minContains: ${n}, maxContains: ${o}}`
    },
    code(n) {
      const { gen: o, schema: l, parentSchema: A, data: c, it: a } = n;
      let i, f;
      const { minContains: y, maxContains: d } = A;
      a.opts.next ? (i = y === void 0 ? 1 : y, f = d) : i = 1;
      const m = o.const("len", (0, e._)`${c}.length`);
      if (n.setParams({ min: i, max: f }), f === void 0 && i === 0) {
        (0, r.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && i > f) {
        (0, r.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), n.fail();
        return;
      }
      if ((0, r.alwaysValidSchema)(a, l)) {
        let _ = (0, e._)`${m} >= ${i}`;
        f !== void 0 && (_ = (0, e._)`${_} && ${m} <= ${f}`), n.pass(_);
        return;
      }
      a.items = !0;
      const u = o.name("valid");
      f === void 0 && i === 1 ? p(u, () => o.if(u, () => o.break())) : i === 0 ? (o.let(u, !0), f !== void 0 && o.if((0, e._)`${c}.length > 0`, g)) : (o.let(u, !1), g()), n.result(u, () => n.reset());
      function g() {
        const _ = o.name("_valid"), E = o.let("count", 0);
        p(_, () => o.if(_, () => h(E)));
      }
      function p(_, E) {
        o.forRange("i", 0, m, (v) => {
          n.subschema({
            keyword: "contains",
            dataProp: v,
            dataPropType: r.Type.Num,
            compositeRule: !0
          }, _), E();
        });
      }
      function h(_) {
        o.code((0, e._)`${_}++`), f === void 0 ? o.if((0, e._)`${_} >= ${i}`, () => o.assign(u, !0).break()) : (o.if((0, e._)`${_} > ${f}`, () => o.assign(u, !1).break()), i === 1 ? o.assign(u, !0) : o.if((0, e._)`${_} >= ${i}`, () => o.assign(u, !0)));
      }
    }
  };
  return ur.default = s, ur;
}
var ca = {}, Wn;
function vl() {
  return Wn || (Wn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ we(), s = /* @__PURE__ */ Xe();
    e.error = {
      message: ({ params: { property: c, depsCount: a, deps: i } }) => {
        const f = a === 1 ? "property" : "properties";
        return (0, r.str)`must have ${f} ${i} when property ${c} is present`;
      },
      params: ({ params: { property: c, depsCount: a, deps: i, missingProperty: f } }) => (0, r._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${a},
    deps: ${i}}`
      // TODO change to reference
    };
    const n = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(c) {
        const [a, i] = o(c);
        l(c, a), A(c, i);
      }
    };
    function o({ schema: c }) {
      const a = {}, i = {};
      for (const f in c) {
        if (f === "__proto__")
          continue;
        const y = Array.isArray(c[f]) ? a : i;
        y[f] = c[f];
      }
      return [a, i];
    }
    function l(c, a = c.schema) {
      const { gen: i, data: f, it: y } = c;
      if (Object.keys(a).length === 0)
        return;
      const d = i.let("missing");
      for (const m in a) {
        const u = a[m];
        if (u.length === 0)
          continue;
        const g = (0, s.propertyInData)(i, f, m, y.opts.ownProperties);
        c.setParams({
          property: m,
          depsCount: u.length,
          deps: u.join(", ")
        }), y.allErrors ? i.if(g, () => {
          for (const p of u)
            (0, s.checkReportMissingProp)(c, p);
        }) : (i.if((0, r._)`${g} && (${(0, s.checkMissingProp)(c, u, d)})`), (0, s.reportMissingProp)(c, d), i.else());
      }
    }
    e.validatePropertyDeps = l;
    function A(c, a = c.schema) {
      const { gen: i, data: f, keyword: y, it: d } = c, m = i.name("valid");
      for (const u in a)
        (0, t.alwaysValidSchema)(d, a[u]) || (i.if(
          (0, s.propertyInData)(i, f, u, d.opts.ownProperties),
          () => {
            const g = c.subschema({ keyword: y, schemaProp: u }, m);
            c.mergeValidEvaluated(g, m);
          },
          () => i.var(m, !0)
          // TODO var
        ), c.ok(m));
    }
    e.validateSchemaDeps = A, e.default = n;
  })(ca)), ca;
}
var hr = {}, qn;
function bl() {
  if (qn) return hr;
  qn = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), s = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: n }) => (0, e._)`{propertyName: ${n.propertyName}}`
    },
    code(n) {
      const { gen: o, schema: l, data: A, it: c } = n;
      if ((0, r.alwaysValidSchema)(c, l))
        return;
      const a = o.name("valid");
      o.forIn("key", A, (i) => {
        n.setParams({ propertyName: i }), n.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, a), o.if((0, e.not)(a), () => {
          n.error(!0), c.allErrors || o.break();
        });
      }), n.ok(a);
    }
  };
  return hr.default = s, hr;
}
var pr = {}, Vn;
function $i() {
  if (Vn) return pr;
  Vn = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Xe(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ at(), s = /* @__PURE__ */ we(), o = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: l }) => (0, r._)`{additionalProperty: ${l.additionalProperty}}`
    },
    code(l) {
      const { gen: A, schema: c, parentSchema: a, data: i, errsCount: f, it: y } = l;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: d, opts: m } = y;
      if (y.props = !0, m.removeAdditional !== "all" && (0, s.alwaysValidSchema)(y, c))
        return;
      const u = (0, e.allSchemaProperties)(a.properties), g = (0, e.allSchemaProperties)(a.patternProperties);
      p(), l.ok((0, r._)`${f} === ${t.default.errors}`);
      function p() {
        A.forIn("key", i, (C) => {
          !u.length && !g.length ? E(C) : A.if(h(C), () => E(C));
        });
      }
      function h(C) {
        let x;
        if (u.length > 8) {
          const P = (0, s.schemaRefOrVal)(y, a.properties, "properties");
          x = (0, e.isOwnProperty)(A, P, C);
        } else u.length ? x = (0, r.or)(...u.map((P) => (0, r._)`${C} === ${P}`)) : x = r.nil;
        return g.length && (x = (0, r.or)(x, ...g.map((P) => (0, r._)`${(0, e.usePattern)(l, P)}.test(${C})`))), (0, r.not)(x);
      }
      function _(C) {
        A.code((0, r._)`delete ${i}[${C}]`);
      }
      function E(C) {
        if (m.removeAdditional === "all" || m.removeAdditional && c === !1) {
          _(C);
          return;
        }
        if (c === !1) {
          l.setParams({ additionalProperty: C }), l.error(), d || A.break();
          return;
        }
        if (typeof c == "object" && !(0, s.alwaysValidSchema)(y, c)) {
          const x = A.name("valid");
          m.removeAdditional === "failing" ? (v(C, x, !1), A.if((0, r.not)(x), () => {
            l.reset(), _(C);
          })) : (v(C, x), d || A.if((0, r.not)(x), () => A.break()));
        }
      }
      function v(C, x, P) {
        const R = {
          keyword: "additionalProperties",
          dataProp: C,
          dataPropType: s.Type.Str
        };
        P === !1 && Object.assign(R, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), l.subschema(R, x);
      }
    }
  };
  return pr.default = o, pr;
}
var mr = {}, Hn;
function wl() {
  if (Hn) return mr;
  Hn = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ur(), r = /* @__PURE__ */ Xe(), t = /* @__PURE__ */ we(), s = /* @__PURE__ */ $i(), n = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(o) {
      const { gen: l, schema: A, parentSchema: c, data: a, it: i } = o;
      i.opts.removeAdditional === "all" && c.additionalProperties === void 0 && s.default.code(new e.KeywordCxt(i, s.default, "additionalProperties"));
      const f = (0, r.allSchemaProperties)(A);
      for (const g of f)
        i.definedProperties.add(g);
      i.opts.unevaluated && f.length && i.props !== !0 && (i.props = t.mergeEvaluated.props(l, (0, t.toHash)(f), i.props));
      const y = f.filter((g) => !(0, t.alwaysValidSchema)(i, A[g]));
      if (y.length === 0)
        return;
      const d = l.name("valid");
      for (const g of y)
        m(g) ? u(g) : (l.if((0, r.propertyInData)(l, a, g, i.opts.ownProperties)), u(g), i.allErrors || l.else().var(d, !0), l.endIf()), o.it.definedProperties.add(g), o.ok(d);
      function m(g) {
        return i.opts.useDefaults && !i.compositeRule && A[g].default !== void 0;
      }
      function u(g) {
        o.subschema({
          keyword: "properties",
          schemaProp: g,
          dataProp: g
        }, d);
      }
    }
  };
  return mr.default = n, mr;
}
var gr = {}, Qn;
function _l() {
  if (Qn) return gr;
  Qn = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Xe(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ we(), s = /* @__PURE__ */ we(), n = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(o) {
      const { gen: l, schema: A, data: c, parentSchema: a, it: i } = o, { opts: f } = i, y = (0, e.allSchemaProperties)(A), d = y.filter((E) => (0, t.alwaysValidSchema)(i, A[E]));
      if (y.length === 0 || d.length === y.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const m = f.strictSchema && !f.allowMatchingProperties && a.properties, u = l.name("valid");
      i.props !== !0 && !(i.props instanceof r.Name) && (i.props = (0, s.evaluatedPropsToName)(l, i.props));
      const { props: g } = i;
      p();
      function p() {
        for (const E of y)
          m && h(E), i.allErrors ? _(E) : (l.var(u, !0), _(E), l.if(u));
      }
      function h(E) {
        for (const v in m)
          new RegExp(E).test(v) && (0, t.checkStrictMode)(i, `property ${v} matches pattern ${E} (use allowMatchingProperties)`);
      }
      function _(E) {
        l.forIn("key", c, (v) => {
          l.if((0, r._)`${(0, e.usePattern)(o, E)}.test(${v})`, () => {
            const C = d.includes(E);
            C || o.subschema({
              keyword: "patternProperties",
              schemaProp: E,
              dataProp: v,
              dataPropType: s.Type.Str
            }, u), i.opts.unevaluated && g !== !0 ? l.assign((0, r._)`${g}[${v}]`, !0) : !C && !i.allErrors && l.if((0, r.not)(u), () => l.break());
          });
        });
      }
    }
  };
  return gr.default = n, gr;
}
var yr = {}, jn;
function Cl() {
  if (jn) return yr;
  jn = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ we(), r = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(t) {
      const { gen: s, schema: n, it: o } = t;
      if ((0, e.alwaysValidSchema)(o, n)) {
        t.fail();
        return;
      }
      const l = s.name("valid");
      t.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l), t.failResult(l, () => t.reset(), () => t.error());
    },
    error: { message: "must NOT be valid" }
  };
  return yr.default = r, yr;
}
var vr = {}, Yn;
function xl() {
  if (Yn) return vr;
  Yn = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const r = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: (/* @__PURE__ */ Xe()).validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return vr.default = r, vr;
}
var br = {}, Kn;
function El() {
  if (Kn) return br;
  Kn = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), s = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: n }) => (0, e._)`{passingSchemas: ${n.passing}}`
    },
    code(n) {
      const { gen: o, schema: l, parentSchema: A, it: c } = n;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      if (c.opts.discriminator && A.discriminator)
        return;
      const a = l, i = o.let("valid", !1), f = o.let("passing", null), y = o.name("_valid");
      n.setParams({ passing: f }), o.block(d), n.result(i, () => n.reset(), () => n.error(!0));
      function d() {
        a.forEach((m, u) => {
          let g;
          (0, r.alwaysValidSchema)(c, m) ? o.var(y, !0) : g = n.subschema({
            keyword: "oneOf",
            schemaProp: u,
            compositeRule: !0
          }, y), u > 0 && o.if((0, e._)`${y} && ${i}`).assign(i, !1).assign(f, (0, e._)`[${f}, ${u}]`).else(), o.if(y, () => {
            o.assign(i, !0), o.assign(f, u), g && n.mergeEvaluated(g, e.Name);
          });
        });
      }
    }
  };
  return br.default = s, br;
}
var wr = {}, Jn;
function Tl() {
  if (Jn) return wr;
  Jn = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ we(), r = {
    keyword: "allOf",
    schemaType: "array",
    code(t) {
      const { gen: s, schema: n, it: o } = t;
      if (!Array.isArray(n))
        throw new Error("ajv implementation error");
      const l = s.name("valid");
      n.forEach((A, c) => {
        if ((0, e.alwaysValidSchema)(o, A))
          return;
        const a = t.subschema({ keyword: "allOf", schemaProp: c }, l);
        t.ok(l), t.mergeEvaluated(a);
      });
    }
  };
  return wr.default = r, wr;
}
var _r = {}, Zn;
function Ll() {
  if (Zn) return _r;
  Zn = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ we(), s = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: o }) => (0, e.str)`must match "${o.ifClause}" schema`,
      params: ({ params: o }) => (0, e._)`{failingKeyword: ${o.ifClause}}`
    },
    code(o) {
      const { gen: l, parentSchema: A, it: c } = o;
      A.then === void 0 && A.else === void 0 && (0, r.checkStrictMode)(c, '"if" without "then" and "else" is ignored');
      const a = n(c, "then"), i = n(c, "else");
      if (!a && !i)
        return;
      const f = l.let("valid", !0), y = l.name("_valid");
      if (d(), o.reset(), a && i) {
        const u = l.let("ifClause");
        o.setParams({ ifClause: u }), l.if(y, m("then", u), m("else", u));
      } else a ? l.if(y, m("then")) : l.if((0, e.not)(y), m("else"));
      o.pass(f, () => o.error(!0));
      function d() {
        const u = o.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, y);
        o.mergeEvaluated(u);
      }
      function m(u, g) {
        return () => {
          const p = o.subschema({ keyword: u }, y);
          l.assign(f, y), o.mergeValidEvaluated(p, f), g ? l.assign(g, (0, e._)`${u}`) : o.setParams({ ifClause: u });
        };
      }
    }
  };
  function n(o, l) {
    const A = o.schema[l];
    return A !== void 0 && !(0, r.alwaysValidSchema)(o, A);
  }
  return _r.default = s, _r;
}
var Cr = {}, ei;
function Rl() {
  if (ei) return Cr;
  ei = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ we(), r = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: t, parentSchema: s, it: n }) {
      s.if === void 0 && (0, e.checkStrictMode)(n, `"${t}" without "if" is ignored`);
    }
  };
  return Cr.default = r, Cr;
}
var ti;
function Dl() {
  if (ti) return Ar;
  ti = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Mi(), r = /* @__PURE__ */ ml(), t = /* @__PURE__ */ Oi(), s = /* @__PURE__ */ gl(), n = /* @__PURE__ */ yl(), o = /* @__PURE__ */ vl(), l = /* @__PURE__ */ bl(), A = /* @__PURE__ */ $i(), c = /* @__PURE__ */ wl(), a = /* @__PURE__ */ _l(), i = /* @__PURE__ */ Cl(), f = /* @__PURE__ */ xl(), y = /* @__PURE__ */ El(), d = /* @__PURE__ */ Tl(), m = /* @__PURE__ */ Ll(), u = /* @__PURE__ */ Rl();
  function g(p = !1) {
    const h = [
      // any
      i.default,
      f.default,
      y.default,
      d.default,
      m.default,
      u.default,
      // object
      l.default,
      A.default,
      o.default,
      c.default,
      a.default
    ];
    return p ? h.push(r.default, s.default) : h.push(e.default, t.default), h.push(n.default), h;
  }
  return Ar.default = g, Ar;
}
var xr = {}, Er = {}, ri;
function Pl() {
  if (ri) return Er;
  ri = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, e.str)`must match format "${s}"`,
      params: ({ schemaCode: s }) => (0, e._)`{format: ${s}}`
    },
    code(s, n) {
      const { gen: o, data: l, $data: A, schema: c, schemaCode: a, it: i } = s, { opts: f, errSchemaPath: y, schemaEnv: d, self: m } = i;
      if (!f.validateFormats)
        return;
      A ? u() : g();
      function u() {
        const p = o.scopeValue("formats", {
          ref: m.formats,
          code: f.code.formats
        }), h = o.const("fDef", (0, e._)`${p}[${a}]`), _ = o.let("fType"), E = o.let("format");
        o.if((0, e._)`typeof ${h} == "object" && !(${h} instanceof RegExp)`, () => o.assign(_, (0, e._)`${h}.type || "string"`).assign(E, (0, e._)`${h}.validate`), () => o.assign(_, (0, e._)`"string"`).assign(E, h)), s.fail$data((0, e.or)(v(), C()));
        function v() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${a} && !${E}`;
        }
        function C() {
          const x = d.$async ? (0, e._)`(${h}.async ? await ${E}(${l}) : ${E}(${l}))` : (0, e._)`${E}(${l})`, P = (0, e._)`(typeof ${E} == "function" ? ${x} : ${E}.test(${l}))`;
          return (0, e._)`${E} && ${E} !== true && ${_} === ${n} && !${P}`;
        }
      }
      function g() {
        const p = m.formats[c];
        if (!p) {
          v();
          return;
        }
        if (p === !0)
          return;
        const [h, _, E] = C(p);
        h === n && s.pass(x());
        function v() {
          if (f.strictSchema === !1) {
            m.logger.warn(P());
            return;
          }
          throw new Error(P());
          function P() {
            return `unknown format "${c}" ignored in schema at path "${y}"`;
          }
        }
        function C(P) {
          const R = P instanceof RegExp ? (0, e.regexpCode)(P) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(c)}` : void 0, k = o.scopeValue("formats", { key: c, ref: P, code: R });
          return typeof P == "object" && !(P instanceof RegExp) ? [P.type || "string", P.validate, (0, e._)`${k}.validate`] : ["string", P, k];
        }
        function x() {
          if (typeof p == "object" && !(p instanceof RegExp) && p.async) {
            if (!d.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${E}(${l})`;
          }
          return typeof _ == "function" ? (0, e._)`${E}(${l})` : (0, e._)`${E}.test(${l})`;
        }
      }
    }
  };
  return Er.default = t, Er;
}
var ai;
function Nl() {
  if (ai) return xr;
  ai = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const r = [(/* @__PURE__ */ Pl()).default];
  return xr.default = r, xr;
}
var ct = {}, ni;
function Bl() {
  return ni || (ni = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.contentVocabulary = ct.metadataVocabulary = void 0, ct.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ct.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ct;
}
var ii;
function Sl() {
  if (ii) return Qt;
  ii = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ al(), r = /* @__PURE__ */ pl(), t = /* @__PURE__ */ Dl(), s = /* @__PURE__ */ Nl(), n = /* @__PURE__ */ Bl(), o = [
    e.default,
    r.default,
    (0, t.default)(),
    s.default,
    n.metadataVocabulary,
    n.contentVocabulary
  ];
  return Qt.default = o, Qt;
}
var Tr = {}, Pt = {}, oi;
function kl() {
  if (oi) return Pt;
  oi = 1, Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.DiscrError = void 0;
  var e;
  return (function(r) {
    r.Tag = "tag", r.Mapping = "mapping";
  })(e || (Pt.DiscrError = e = {})), Pt;
}
var si;
function Il() {
  if (si) return Tr;
  si = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ kl(), t = /* @__PURE__ */ Sa(), s = /* @__PURE__ */ Gr(), n = /* @__PURE__ */ we(), l = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: A, tagName: c } }) => A === r.DiscrError.Tag ? `tag "${c}" must be string` : `value of tag "${c}" must be in oneOf`,
      params: ({ params: { discrError: A, tag: c, tagName: a } }) => (0, e._)`{error: ${A}, tag: ${a}, tagValue: ${c}}`
    },
    code(A) {
      const { gen: c, data: a, schema: i, parentSchema: f, it: y } = A, { oneOf: d } = f;
      if (!y.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const m = i.propertyName;
      if (typeof m != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!d)
        throw new Error("discriminator: requires oneOf keyword");
      const u = c.let("valid", !1), g = c.const("tag", (0, e._)`${a}${(0, e.getProperty)(m)}`);
      c.if((0, e._)`typeof ${g} == "string"`, () => p(), () => A.error(!1, { discrError: r.DiscrError.Tag, tag: g, tagName: m })), A.ok(u);
      function p() {
        const E = _();
        c.if(!1);
        for (const v in E)
          c.elseIf((0, e._)`${g} === ${v}`), c.assign(u, h(E[v]));
        c.else(), A.error(!1, { discrError: r.DiscrError.Mapping, tag: g, tagName: m }), c.endIf();
      }
      function h(E) {
        const v = c.name("valid"), C = A.subschema({ keyword: "oneOf", schemaProp: E }, v);
        return A.mergeEvaluated(C, e.Name), v;
      }
      function _() {
        var E;
        const v = {}, C = P(f);
        let x = !0;
        for (let O = 0; O < d.length; O++) {
          let T = d[O];
          if (T?.$ref && !(0, n.schemaHasRulesButRef)(T, y.self.RULES)) {
            const w = T.$ref;
            if (T = t.resolveRef.call(y.self, y.schemaEnv.root, y.baseId, w), T instanceof t.SchemaEnv && (T = T.schema), T === void 0)
              throw new s.default(y.opts.uriResolver, y.baseId, w);
          }
          const M = (E = T?.properties) === null || E === void 0 ? void 0 : E[m];
          if (typeof M != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${m}"`);
          x = x && (C || P(T)), R(M, O);
        }
        if (!x)
          throw new Error(`discriminator: "${m}" must be required`);
        return v;
        function P({ required: O }) {
          return Array.isArray(O) && O.includes(m);
        }
        function R(O, T) {
          if (O.const)
            k(O.const, T);
          else if (O.enum)
            for (const M of O.enum)
              k(M, T);
          else
            throw new Error(`discriminator: "properties/${m}" must have "const" or "enum"`);
        }
        function k(O, T) {
          if (typeof O != "string" || O in v)
            throw new Error(`discriminator: "${m}" values must be unique strings`);
          v[O] = T;
        }
      }
    }
  };
  return Tr.default = l, Tr;
}
const Fl = "http://json-schema.org/draft-07/schema#", Ml = "http://json-schema.org/draft-07/schema#", Ol = "Core schema meta-schema", $l = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, zl = ["object", "boolean"], Ul = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Gl = {
  $schema: Fl,
  $id: Ml,
  title: Ol,
  definitions: $l,
  type: zl,
  properties: Ul,
  default: !0
};
var li;
function zi() {
  return li || (li = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv = void 0;
    const t = /* @__PURE__ */ el(), s = /* @__PURE__ */ Sl(), n = /* @__PURE__ */ Il(), o = Gl, l = ["/properties"], A = "http://json-schema.org/draft-07/schema";
    class c extends t.default {
      _addVocabularies() {
        super._addVocabularies(), s.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(n.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const m = this.opts.$data ? this.$dataMetaSchema(o, l) : o;
        this.addMetaSchema(m, A, !1), this.refs["http://json-schema.org/schema"] = A;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(A) ? A : void 0);
      }
    }
    r.Ajv = c, e.exports = r = c, e.exports.Ajv = c, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = c;
    var a = /* @__PURE__ */ Ur();
    Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
      return a.KeywordCxt;
    } });
    var i = /* @__PURE__ */ ge();
    Object.defineProperty(r, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var f = /* @__PURE__ */ Ba();
    Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var y = /* @__PURE__ */ Gr();
    Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
      return y.default;
    } });
  })(Xt, Xt.exports)), Xt.exports;
}
var Xl = /* @__PURE__ */ zi();
const Wl = /* @__PURE__ */ Ca(Xl);
var Lr = { exports: {} }, Aa = {}, ci;
function ql() {
  return ci || (ci = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function r(O, T) {
      return { validate: O, compare: T };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: r(o, l),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: r(c(!0), a),
      "date-time": r(y(!0), d),
      "iso-time": r(c(), i),
      "iso-date-time": r(y(), m),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: p,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: k,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: _,
      // signed 32 bit integer
      int32: { type: "number", validate: C },
      // signed 64 bit integer
      int64: { type: "number", validate: x },
      // C-type float
      float: { type: "number", validate: P },
      // C-type double
      double: { type: "number", validate: P },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: r(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, l),
      time: r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, a),
      "date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      "iso-time": r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, i),
      "iso-date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, m),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function t(O) {
      return O % 4 === 0 && (O % 100 !== 0 || O % 400 === 0);
    }
    const s = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, n = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function o(O) {
      const T = s.exec(O);
      if (!T)
        return !1;
      const M = +T[1], w = +T[2], G = +T[3];
      return w >= 1 && w <= 12 && G >= 1 && G <= (w === 2 && t(M) ? 29 : n[w]);
    }
    function l(O, T) {
      if (O && T)
        return O > T ? 1 : O < T ? -1 : 0;
    }
    const A = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function c(O) {
      return function(M) {
        const w = A.exec(M);
        if (!w)
          return !1;
        const G = +w[1], ee = +w[2], Y = +w[3], ne = w[4], Z = w[5] === "-" ? -1 : 1, Q = +(w[6] || 0), D = +(w[7] || 0);
        if (Q > 23 || D > 59 || O && !ne)
          return !1;
        if (G <= 23 && ee <= 59 && Y < 60)
          return !0;
        const F = ee - D * Z, $ = G - Q * Z - (F < 0 ? 1 : 0);
        return ($ === 23 || $ === -1) && (F === 59 || F === -1) && Y < 61;
      };
    }
    function a(O, T) {
      if (!(O && T))
        return;
      const M = (/* @__PURE__ */ new Date("2020-01-01T" + O)).valueOf(), w = (/* @__PURE__ */ new Date("2020-01-01T" + T)).valueOf();
      if (M && w)
        return M - w;
    }
    function i(O, T) {
      if (!(O && T))
        return;
      const M = A.exec(O), w = A.exec(T);
      if (M && w)
        return O = M[1] + M[2] + M[3], T = w[1] + w[2] + w[3], O > T ? 1 : O < T ? -1 : 0;
    }
    const f = /t|\s/i;
    function y(O) {
      const T = c(O);
      return function(w) {
        const G = w.split(f);
        return G.length === 2 && o(G[0]) && T(G[1]);
      };
    }
    function d(O, T) {
      if (!(O && T))
        return;
      const M = new Date(O).valueOf(), w = new Date(T).valueOf();
      if (M && w)
        return M - w;
    }
    function m(O, T) {
      if (!(O && T))
        return;
      const [M, w] = O.split(f), [G, ee] = T.split(f), Y = l(M, G);
      if (Y !== void 0)
        return Y || a(w, ee);
    }
    const u = /\/|:/, g = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function p(O) {
      return u.test(O) && g.test(O);
    }
    const h = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function _(O) {
      return h.lastIndex = 0, h.test(O);
    }
    const E = -2147483648, v = 2 ** 31 - 1;
    function C(O) {
      return Number.isInteger(O) && O <= v && O >= E;
    }
    function x(O) {
      return Number.isInteger(O);
    }
    function P() {
      return !0;
    }
    const R = /[^\\]\\Z/;
    function k(O) {
      if (R.test(O))
        return !1;
      try {
        return new RegExp(O), !0;
      } catch {
        return !1;
      }
    }
  })(Aa)), Aa;
}
var da = {}, Ai;
function Vl() {
  return Ai || (Ai = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const r = /* @__PURE__ */ zi(), t = /* @__PURE__ */ ge(), s = t.operators, n = {
      formatMaximum: { okStr: "<=", ok: s.LTE, fail: s.GT },
      formatMinimum: { okStr: ">=", ok: s.GTE, fail: s.LT },
      formatExclusiveMaximum: { okStr: "<", ok: s.LT, fail: s.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: s.GT, fail: s.LTE }
    }, o = {
      message: ({ keyword: A, schemaCode: c }) => (0, t.str)`should be ${n[A].okStr} ${c}`,
      params: ({ keyword: A, schemaCode: c }) => (0, t._)`{comparison: ${n[A].okStr}, limit: ${c}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(n),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: o,
      code(A) {
        const { gen: c, data: a, schemaCode: i, keyword: f, it: y } = A, { opts: d, self: m } = y;
        if (!d.validateFormats)
          return;
        const u = new r.KeywordCxt(y, m.RULES.all.format.definition, "format");
        u.$data ? g() : p();
        function g() {
          const _ = c.scopeValue("formats", {
            ref: m.formats,
            code: d.code.formats
          }), E = c.const("fmt", (0, t._)`${_}[${u.schemaCode}]`);
          A.fail$data((0, t.or)((0, t._)`typeof ${E} != "object"`, (0, t._)`${E} instanceof RegExp`, (0, t._)`typeof ${E}.compare != "function"`, h(E)));
        }
        function p() {
          const _ = u.schema, E = m.formats[_];
          if (!E || E === !0)
            return;
          if (typeof E != "object" || E instanceof RegExp || typeof E.compare != "function")
            throw new Error(`"${f}": format "${_}" does not define "compare" function`);
          const v = c.scopeValue("formats", {
            key: _,
            ref: E,
            code: d.code.formats ? (0, t._)`${d.code.formats}${(0, t.getProperty)(_)}` : void 0
          });
          A.fail$data(h(v));
        }
        function h(_) {
          return (0, t._)`${_}.compare(${a}, ${i}) ${n[f].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const l = (A) => (A.addKeyword(e.formatLimitDefinition), A);
    e.default = l;
  })(da)), da;
}
var di;
function Hl() {
  return di || (di = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const t = ql(), s = Vl(), n = /* @__PURE__ */ ge(), o = new n.Name("fullFormats"), l = new n.Name("fastFormats"), A = (a, i = { keywords: !0 }) => {
      if (Array.isArray(i))
        return c(a, i, t.fullFormats, o), a;
      const [f, y] = i.mode === "fast" ? [t.fastFormats, l] : [t.fullFormats, o], d = i.formats || t.formatNames;
      return c(a, d, f, y), i.keywords && (0, s.default)(a), a;
    };
    A.get = (a, i = "full") => {
      const y = (i === "fast" ? t.fastFormats : t.fullFormats)[a];
      if (!y)
        throw new Error(`Unknown format "${a}"`);
      return y;
    };
    function c(a, i, f, y) {
      var d, m;
      (d = (m = a.opts.code).formats) !== null && d !== void 0 || (m.formats = (0, n._)`require("ajv-formats/dist/formats").${y}`);
      for (const u of i)
        a.addFormat(u, f[u]);
    }
    e.exports = r = A, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = A;
  })(Lr, Lr.exports)), Lr.exports;
}
var Ql = Hl();
const jl = /* @__PURE__ */ Ca(Ql), Yl = "http://json-schema.org/draft-07/schema#", Kl = "LectureDocument", Jl = "object", Zl = !1, ec = ["schemaVersion", "documentTitle", "direction", "overview", "sections", "endNote"], tc = { schemaVersion: { type: "string", enum: ["1.0", "1.1"] }, documentTitle: { type: "string", minLength: 1 }, direction: { type: "string", enum: ["ltr", "rtl"] }, overview: { $ref: "#/definitions/LectureOverview" }, sections: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureSection" } }, endNote: { $ref: "#/definitions/RichText" }, extractionAudit: { $ref: "#/definitions/ExtractionAudit" } }, rc = { RichTextRun: { type: "object", additionalProperties: !1, required: ["text"], properties: { text: { type: "string", minLength: 1 }, emphasis: { type: "string", enum: ["none", "bold", "italic", "accent", "highlight"] } } }, RichText: { oneOf: [{ type: "string" }, { type: "array", minItems: 1, items: { $ref: "#/definitions/RichTextRun" } }] }, ListItem: { oneOf: [{ type: "string" }, { type: "object", additionalProperties: !1, required: ["text"], properties: { text: { $ref: "#/definitions/RichText" }, level: { type: "integer", minimum: 0 } } }] }, LectureOverview: { type: "object", additionalProperties: !1, required: ["title", "introduction", "keyPoints"], properties: { title: { type: "string", minLength: 1 }, introduction: { $ref: "#/definitions/RichText" }, keyPoints: { type: "array", items: { $ref: "#/definitions/RichText" } } } }, LectureSection: { type: "object", additionalProperties: !1, required: ["sectionId", "sectionTitle", "slides"], properties: { sectionId: { type: "string", minLength: 1 }, sectionTitle: { type: "string", minLength: 1 }, slides: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureSlide" } } } }, LectureSlide: { type: "object", additionalProperties: !1, required: ["slideId", "slideTitle", "slideSubtitle", "sourceReferences", "blocks"], properties: { slideId: { type: "string", minLength: 1 }, slideTitle: { type: "string" }, slideSubtitle: { $ref: "#/definitions/RichText" }, sourceReferences: { type: "array", items: { type: "string" } }, blocks: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureBlock" } } } }, LectureBlock: { oneOf: [{ $ref: "#/definitions/SubtitleBlock" }, { $ref: "#/definitions/ParagraphBlock" }, { $ref: "#/definitions/BulletsBlock" }, { $ref: "#/definitions/NumberedBlock" }, { $ref: "#/definitions/CalloutBlock" }, { $ref: "#/definitions/TableBlock" }, { $ref: "#/definitions/DiagramBlock" }, { $ref: "#/definitions/ImageBlock" }] }, BaseBlock: { type: "object", required: ["blockId", "sourceReferences"], properties: { blockId: { type: "string", minLength: 1 }, sourceReferences: { type: "array", items: { type: "string" } } } }, SubtitleBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "text"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "subtitle" }, text: { $ref: "#/definitions/RichText" } } }] }, ParagraphBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "text"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "paragraph" }, text: { $ref: "#/definitions/RichText" } } }] }, BulletsBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "items"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "bullets" }, items: { type: "array", minItems: 1, items: { $ref: "#/definitions/ListItem" } } } }] }, NumberedBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "items"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "numbered" }, items: { type: "array", minItems: 1, items: { $ref: "#/definitions/ListItem" } }, startAt: { type: "integer", minimum: 1 } } }] }, CalloutBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "text", "tone"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "callout" }, label: { $ref: "#/definitions/RichText" }, text: { $ref: "#/definitions/RichText" }, tone: { type: "string", enum: ["note", "warning", "info"] } } }] }, TableBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "headers", "rows"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "table" }, label: { $ref: "#/definitions/RichText" }, tableType: { type: "string", enum: ["standard", "comparison", "highlight", "heatmap"] }, headers: { type: "array", minItems: 1, items: { $ref: "#/definitions/RichText" } }, rows: { type: "array", items: { type: "array", items: { $ref: "#/definitions/RichText" } } }, heatmap: { type: "object", additionalProperties: !1, required: ["min", "max", "values"], properties: { min: { type: "number" }, max: { type: "number" }, values: { type: "array", items: { type: "array", items: { type: "number" } } } } } } }] }, DiagramBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "diagramRows"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "diagram" }, label: { $ref: "#/definitions/RichText" }, diagramType: { type: "string", enum: ["generic", "metabolic", "signal-transduction", "gene-regulatory", "disease-pharmacology"] }, diagramRows: { type: "array", minItems: 1, items: { type: "array", minItems: 1, items: { oneOf: [{ type: "string", minLength: 1 }, { type: "array", minItems: 1, items: { $ref: "#/definitions/RichTextRun" } }] } } }, pathways: { type: "array", items: { type: "object", additionalProperties: !1, required: ["pathwayId", "label", "nodeIds"], properties: { pathwayId: { type: "string", minLength: 1 }, label: { $ref: "#/definitions/RichText" }, nodeIds: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } } } } } } }] }, ImageBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "slotId", "label", "description", "important", "sourceReference", "fit", "preferredAspect"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "image" }, slotId: { type: "string", minLength: 1 }, label: { $ref: "#/definitions/RichText" }, description: { $ref: "#/definitions/RichText" }, important: { type: "boolean" }, sourceReference: { type: "string" }, fit: { type: "string", enum: ["contain", "cover"] }, preferredAspect: { type: "string", enum: ["wide", "portrait", "square", "full", "automatic"] }, orientation: { type: "string", enum: ["automatic", "transverse", "longitudinal", "portrait", "landscape"] } } }] }, ExtractionAudit: { type: "object", additionalProperties: !1, required: ["sourceType", "sourcePageOrSlideCount", "coveredSourceReferences", "unmappedSourceReferences", "warnings"], properties: { sourceType: { type: "string", enum: ["pdf", "pptx"] }, sourcePageOrSlideCount: { type: "integer", minimum: 0 }, coveredSourceReferences: { type: "array", items: { type: "string" } }, unmappedSourceReferences: { type: "array", items: { type: "string" } }, warnings: { type: "array", items: { type: "string" } } } } }, Ui = {
  $schema: Yl,
  title: Kl,
  type: Jl,
  additionalProperties: Zl,
  required: ec,
  properties: tc,
  definitions: rc
}, Ac = Ui, Gi = new Wl({ allErrors: !0, strict: !1 });
jl(Gi);
const fa = Gi.compile(Ui), ac = [
  /^image$/i,
  /^figure$/i,
  /^picture$/i,
  /^lecture image$/i,
  /^important image$/i,
  /^diagram$/i,
  /^page image$/i,
  /^image\s*\d+$/i,
  /^figure\s*\d+$/i,
  /^img$/i,
  /^pic$/i
];
function nc(e) {
  return ac.some((r) => r.test(e.trim()));
}
function ic(e) {
  const r = e.instancePath || "(root)";
  if (e.keyword === "minItems") {
    if (r.endsWith("/slides")) return `${r}: section has no slides`;
    if (r.endsWith("/blocks")) return `${r}: slide has no blocks`;
    if (r.includes("/diagramRows/")) return `${r}: diagram has an empty row`;
  }
  return e.keyword === "minLength" && r.includes("/diagramRows/") ? `${r}: diagram has an empty node` : `${r}: ${e.message}`;
}
function oc(e) {
  const r = [], t = [];
  if (!fa(e) && fa.errors) {
    for (const d of fa.errors)
      r.push(ic(d));
    return { valid: !1, errors: r, warnings: t };
  }
  const n = e;
  n.documentTitle.trim() || r.push("documentTitle must not be empty");
  const o = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  for (const d of n.sections) {
    o.has(d.sectionId) && r.push(`Duplicate sectionId: "${d.sectionId}"`), o.add(d.sectionId), d.sectionTitle.trim() || r.push(`Section "${d.sectionId}" has an empty sectionTitle`), d.slides.length === 0 && r.push(`Section "${d.sectionId}" has no slides`);
    for (const m of d.slides) {
      l.has(m.slideId) && r.push(`Duplicate slideId: "${m.slideId}"`), l.add(m.slideId);
      const u = m.slideTitle.trim();
      u && (i.has(u) && r.push(`Repeated non-empty slide title: "${u}"`), i.add(u)), m.blocks.length === 0 && r.push(`Slide "${m.slideId}" has no blocks`);
      for (const g of m.blocks) {
        if (A.has(g.blockId) && r.push(`Duplicate blockId: "${g.blockId}"`), A.add(g.blockId), g.type === "image") {
          const p = g;
          if (c.has(p.slotId) && r.push(`Duplicate image slotId: "${p.slotId}"`), c.add(p.slotId), !De(p.label).trim())
            r.push(`Image block "${p.blockId}" has no label`);
          else {
            nc(De(p.label)) && t.push(
              `Image block "${p.blockId}" has a generic label: "${De(p.label)}". Use a specific descriptive label (e.g. "Mitochondria electron micrograph").`
            );
            const h = De(p.label).toLowerCase().trim();
            a.has(h) && t.push(`Duplicate image label: "${De(p.label)}"`), a.add(h);
          }
        }
        if (g.type === "table") {
          const p = g;
          De(p.label).trim() || r.push(`Table block "${p.blockId}" has no label`);
          for (let h = 0; h < p.rows.length; h++)
            p.rows[h].length !== p.headers.length && r.push(
              `Table block "${p.blockId}" row ${h} has ${p.rows[h].length} cells but ${p.headers.length} headers`
            );
        }
        if (g.type === "diagram") {
          const p = g;
          De(p.label).trim() || r.push(`Diagram block "${p.blockId}" has no label`);
          for (let h = 0; h < p.diagramRows.length; h++)
            for (let _ = 0; _ < p.diagramRows[h].length; _++)
              De(p.diagramRows[h][_]).trim() || r.push(
                `Diagram block "${p.blockId}" has an empty node at row ${h}, position ${_}`
              );
        }
      }
    }
  }
  for (const d of n.sections)
    for (const m of d.slides)
      for (const u of m.blocks) {
        const g = [];
        (u.type === "paragraph" || u.type === "subtitle") && g.push(["text", u.text]), u.type === "callout" && g.push(["label", u.label], ["text", u.text]), u.type === "image" && g.push(["label", u.label], ["description", u.description]), u.type === "table" && g.push(["label", u.label], ...u.headers.map((p, h) => [`headers[${h}]`, p]), ...u.rows.flatMap((p, h) => p.map((_, E) => [`rows[${h}][${E}]`, _]))), u.type === "diagram" && g.push(["label", u.label], ...u.diagramRows.flatMap((p, h) => p.map((_, E) => [`diagramRows[${h}][${E}]`, _])));
        for (const [p, h] of g)
          for (const [_, E] of Mt(h).entries())
            E.text || r.push(`${u.blockId}.${p}[${_}].text must not be empty`);
        if (u.type === "bullets" || u.type === "numbered") {
          let p = 0;
          u.items.forEach((h, _) => {
            const E = Or(h);
            (!Number.isInteger(E) || E < 0) && r.push(`${u.blockId}.items[${_}].level must be a non-negative integer`), E - p > 1 && t.push(`${u.blockId}.items[${_}] jumps more than one nesting level`), p = E;
          });
        }
        u.type === "table" && u.tableType === "heatmap" && u.heatmap && (u.heatmap.max <= u.heatmap.min && r.push(`${u.blockId}.heatmap.max must be greater than min`), u.heatmap.values.length !== u.rows.length && r.push(`${u.blockId}.heatmap.values must match row count`), u.heatmap.values.forEach((p, h) => {
          p.length !== u.headers.length && r.push(`${u.blockId}.heatmap.values[${h}] must match column count`);
        }));
      }
  if (n.extractionAudit) {
    const d = new Set(n.extractionAudit.coveredSourceReferences), m = new Set(n.extractionAudit.unmappedSourceReferences);
    for (const g of m) d.has(g) && r.push(`Source reference "${g}" cannot be both covered and unmapped`);
    const u = /* @__PURE__ */ new Set();
    for (const g of n.sections)
      for (const p of g.slides)
        p.sourceReferences.forEach((h) => u.add(h)), p.blocks.forEach((h) => h.sourceReferences.forEach((_) => u.add(_)));
    for (const g of u)
      !d.has(g) && !m.has(g) && t.push(`Extraction audit: source reference "${g}" is not covered or unmapped`);
  }
  if (n.extractionAudit) {
    for (const d of n.extractionAudit.unmappedSourceReferences)
      t.push(`Source reference not mapped to any block: "${d}"`);
    for (const d of n.extractionAudit.warnings)
      t.push(`Extraction audit: ${d}`);
  }
  const f = [...new Set(r)], y = [...new Set(t)];
  return { valid: f.length === 0, errors: f, warnings: y };
}
class sc extends Error {
  validationErrors;
  constructor(r) {
    super(`Lecture document is invalid:
${r.map((t) => `- ${t}`).join(`
`)}`), this.name = "LectureValidationError", this.validationErrors = r;
  }
}
let fi = Promise.resolve();
function lc(e) {
  const r = fi.then(e, e);
  return fi = r.then(() => {
  }, () => {
  }), r;
}
function dc(e, r = {}, t = {}) {
  return lc(() => cc(e, r, t));
}
async function cc(e, r, t) {
  const s = [];
  if (t.validateInput !== !1) {
    const n = oc(e);
    if (s.push(...n.warnings), !n.valid) throw new sc(n.errors);
  }
  Xa(), Go(t.theme);
  try {
    const n = new Uo(), o = "JANG_WIDE";
    n.defineLayout({ name: o, width: S.SLIDE_WIDTH, height: S.SLIDE_HEIGHT }), n.layout = o, n.author = "Jang PPTX Engine", n.company = "Jang", n.subject = e.documentTitle, n.title = e.documentTitle, n.lang = e.direction === "rtl" ? "ar-SA" : "en-US", n.rtlMode = e.direction === "rtl", n.theme = {
      headFontFace: S.headingFont,
      bodyFontFace: S.bodyFont,
      lang: e.direction === "rtl" ? "ar-SA" : "en-US"
    }, Is(n, e, r, s);
    const l = Os(n);
    if (l.checkedObjects === 0 && s.push("Geometry validation could not inspect any generated slide objects."), !l.valid) {
      const f = l.violations.map((y) => `Geometry: ${y}`);
      if (t.strictGeometry) throw new Error(f.join(`
`));
      s.push(...f);
    }
    const A = { compression: t.compression !== !1 };
    let c;
    if (typeof globalThis == "object" && "document" in globalThis)
      c = await n.write({ outputType: "blob", ...A });
    else {
      const f = await n.write({ outputType: "nodebuffer", ...A });
      c = new Blob([new Uint8Array(f)], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      });
    }
    const i = n.slides ?? n._slides ?? [];
    return { blob: c, warnings: [...new Set(s)], slideCount: i.length };
  } finally {
    Xa();
  }
}
export {
  Ci as DEFAULT_THEME,
  sc as LectureValidationError,
  S as THEME,
  Go as configureTheme,
  dc as generateLecturePptx,
  Ac as lectureSchema,
  Xa as resetTheme,
  oc as validateLecture
};
