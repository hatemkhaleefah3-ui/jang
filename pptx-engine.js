var Jt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Fa(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Zt(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var na = { exports: {} };
var Ja;
function _o() {
  return Ja || (Ja = 1, (function(e, r) {
    (function(t) {
      e.exports = t();
    })(function() {
      return (function t(i, a, s) {
        function l(n, o) {
          if (!a[n]) {
            if (!i[n]) {
              var f = typeof Zt == "function" && Zt;
              if (!o && f) return f(n, !0);
              if (A) return A(n, !0);
              var g = new Error("Cannot find module '" + n + "'");
              throw g.code = "MODULE_NOT_FOUND", g;
            }
            var d = a[n] = { exports: {} };
            i[n][0].call(d.exports, function(h) {
              var u = i[n][1][h];
              return l(u || h);
            }, d, d.exports, t, i, a, s);
          }
          return a[n].exports;
        }
        for (var A = typeof Zt == "function" && Zt, c = 0; c < s.length; c++) l(s[c]);
        return l;
      })({ 1: [function(t, i, a) {
        var s = t("./utils"), l = t("./support"), A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        a.encode = function(c) {
          for (var n, o, f, g, d, h, u, y = [], m = 0, p = c.length, _ = p, T = s.getTypeOf(c) !== "string"; m < c.length; ) _ = p - m, f = T ? (n = c[m++], o = m < p ? c[m++] : 0, m < p ? c[m++] : 0) : (n = c.charCodeAt(m++), o = m < p ? c.charCodeAt(m++) : 0, m < p ? c.charCodeAt(m++) : 0), g = n >> 2, d = (3 & n) << 4 | o >> 4, h = 1 < _ ? (15 & o) << 2 | f >> 6 : 64, u = 2 < _ ? 63 & f : 64, y.push(A.charAt(g) + A.charAt(d) + A.charAt(h) + A.charAt(u));
          return y.join("");
        }, a.decode = function(c) {
          var n, o, f, g, d, h, u = 0, y = 0, m = "data:";
          if (c.substr(0, m.length) === m) throw new Error("Invalid base64 input, it looks like a data url.");
          var p, _ = 3 * (c = c.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (c.charAt(c.length - 1) === A.charAt(64) && _--, c.charAt(c.length - 2) === A.charAt(64) && _--, _ % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (p = l.uint8array ? new Uint8Array(0 | _) : new Array(0 | _); u < c.length; ) n = A.indexOf(c.charAt(u++)) << 2 | (g = A.indexOf(c.charAt(u++))) >> 4, o = (15 & g) << 4 | (d = A.indexOf(c.charAt(u++))) >> 2, f = (3 & d) << 6 | (h = A.indexOf(c.charAt(u++))), p[y++] = n, d !== 64 && (p[y++] = o), h !== 64 && (p[y++] = f);
          return p;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(t, i, a) {
        var s = t("./external"), l = t("./stream/DataWorker"), A = t("./stream/Crc32Probe"), c = t("./stream/DataLengthProbe");
        function n(o, f, g, d, h) {
          this.compressedSize = o, this.uncompressedSize = f, this.crc32 = g, this.compression = d, this.compressedContent = h;
        }
        n.prototype = { getContentWorker: function() {
          var o = new l(s.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new c("data_length")), f = this;
          return o.on("end", function() {
            if (this.streamInfo.data_length !== f.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), o;
        }, getCompressedWorker: function() {
          return new l(s.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, n.createWorkerFrom = function(o, f, g) {
          return o.pipe(new A()).pipe(new c("uncompressedSize")).pipe(f.compressWorker(g)).pipe(new c("compressedSize")).withStreamInfo("compression", f);
        }, i.exports = n;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(t, i, a) {
        var s = t("./stream/GenericWorker");
        a.STORE = { magic: "\0\0", compressWorker: function() {
          return new s("STORE compression");
        }, uncompressWorker: function() {
          return new s("STORE decompression");
        } }, a.DEFLATE = t("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(t, i, a) {
        var s = t("./utils"), l = (function() {
          for (var A, c = [], n = 0; n < 256; n++) {
            A = n;
            for (var o = 0; o < 8; o++) A = 1 & A ? 3988292384 ^ A >>> 1 : A >>> 1;
            c[n] = A;
          }
          return c;
        })();
        i.exports = function(A, c) {
          return A !== void 0 && A.length ? s.getTypeOf(A) !== "string" ? (function(n, o, f, g) {
            var d = l, h = g + f;
            n ^= -1;
            for (var u = g; u < h; u++) n = n >>> 8 ^ d[255 & (n ^ o[u])];
            return -1 ^ n;
          })(0 | c, A, A.length, 0) : (function(n, o, f, g) {
            var d = l, h = g + f;
            n ^= -1;
            for (var u = g; u < h; u++) n = n >>> 8 ^ d[255 & (n ^ o.charCodeAt(u))];
            return -1 ^ n;
          })(0 | c, A, A.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(t, i, a) {
        a.base64 = !1, a.binary = !1, a.dir = !1, a.createFolders = !0, a.date = null, a.compression = null, a.compressionOptions = null, a.comment = null, a.unixPermissions = null, a.dosPermissions = null;
      }, {}], 6: [function(t, i, a) {
        var s = null;
        s = typeof Promise < "u" ? Promise : t("lie"), i.exports = { Promise: s };
      }, { lie: 37 }], 7: [function(t, i, a) {
        var s = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", l = t("pako"), A = t("./utils"), c = t("./stream/GenericWorker"), n = s ? "uint8array" : "array";
        function o(f, g) {
          c.call(this, "FlateWorker/" + f), this._pako = null, this._pakoAction = f, this._pakoOptions = g, this.meta = {};
        }
        a.magic = "\b\0", A.inherits(o, c), o.prototype.processChunk = function(f) {
          this.meta = f.meta, this._pako === null && this._createPako(), this._pako.push(A.transformTo(n, f.data), !1);
        }, o.prototype.flush = function() {
          c.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
        }, o.prototype.cleanUp = function() {
          c.prototype.cleanUp.call(this), this._pako = null;
        }, o.prototype._createPako = function() {
          this._pako = new l[this._pakoAction]({ raw: !0, level: this._pakoOptions.level || -1 });
          var f = this;
          this._pako.onData = function(g) {
            f.push({ data: g, meta: f.meta });
          };
        }, a.compressWorker = function(f) {
          return new o("Deflate", f);
        }, a.uncompressWorker = function() {
          return new o("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(t, i, a) {
        function s(d, h) {
          var u, y = "";
          for (u = 0; u < h; u++) y += String.fromCharCode(255 & d), d >>>= 8;
          return y;
        }
        function l(d, h, u, y, m, p) {
          var _, T, v = d.file, x = d.compression, C = p !== n.utf8encode, P = A.transformTo("string", p(v.name)), R = A.transformTo("string", n.utf8encode(v.name)), S = v.comment, O = A.transformTo("string", p(S)), E = A.transformTo("string", n.utf8encode(S)), M = R.length !== v.name.length, w = E.length !== S.length, G = "", ee = "", Y = "", ne = v.dir, Z = v.date, Q = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          h && !u || (Q.crc32 = d.crc32, Q.compressedSize = d.compressedSize, Q.uncompressedSize = d.uncompressedSize);
          var B = 0;
          h && (B |= 8), C || !M && !w || (B |= 2048);
          var F = 0, $ = 0;
          ne && (F |= 16), m === "UNIX" ? ($ = 798, F |= (function(N, q) {
            var oe = N;
            return N || (oe = q ? 16893 : 33204), (65535 & oe) << 16;
          })(v.unixPermissions, ne)) : ($ = 20, F |= (function(N) {
            return 63 & (N || 0);
          })(v.dosPermissions)), _ = Z.getUTCHours(), _ <<= 6, _ |= Z.getUTCMinutes(), _ <<= 5, _ |= Z.getUTCSeconds() / 2, T = Z.getUTCFullYear() - 1980, T <<= 4, T |= Z.getUTCMonth() + 1, T <<= 5, T |= Z.getUTCDate(), M && (ee = s(1, 1) + s(o(P), 4) + R, G += "up" + s(ee.length, 2) + ee), w && (Y = s(1, 1) + s(o(O), 4) + E, G += "uc" + s(Y.length, 2) + Y);
          var L = "";
          return L += `
\0`, L += s(B, 2), L += x.magic, L += s(_, 2), L += s(T, 2), L += s(Q.crc32, 4), L += s(Q.compressedSize, 4), L += s(Q.uncompressedSize, 4), L += s(P.length, 2), L += s(G.length, 2), { fileRecord: f.LOCAL_FILE_HEADER + L + P + G, dirRecord: f.CENTRAL_FILE_HEADER + s($, 2) + L + s(O.length, 2) + "\0\0\0\0" + s(F, 4) + s(y, 4) + P + G + O };
        }
        var A = t("../utils"), c = t("../stream/GenericWorker"), n = t("../utf8"), o = t("../crc32"), f = t("../signature");
        function g(d, h, u, y) {
          c.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = h, this.zipPlatform = u, this.encodeFileName = y, this.streamFiles = d, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        A.inherits(g, c), g.prototype.push = function(d) {
          var h = d.meta.percent || 0, u = this.entriesCount, y = this._sources.length;
          this.accumulate ? this.contentBuffer.push(d) : (this.bytesWritten += d.data.length, c.prototype.push.call(this, { data: d.data, meta: { currentFile: this.currentFile, percent: u ? (h + 100 * (u - y - 1)) / u : 100 } }));
        }, g.prototype.openedSource = function(d) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = d.file.name;
          var h = this.streamFiles && !d.file.dir;
          if (h) {
            var u = l(d, h, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: u.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = !0;
        }, g.prototype.closedSource = function(d) {
          this.accumulate = !1;
          var h = this.streamFiles && !d.file.dir, u = l(d, h, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(u.dirRecord), h) this.push({ data: (function(y) {
            return f.DATA_DESCRIPTOR + s(y.crc32, 4) + s(y.compressedSize, 4) + s(y.uncompressedSize, 4);
          })(d), meta: { percent: 100 } });
          else for (this.push({ data: u.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, g.prototype.flush = function() {
          for (var d = this.bytesWritten, h = 0; h < this.dirRecords.length; h++) this.push({ data: this.dirRecords[h], meta: { percent: 100 } });
          var u = this.bytesWritten - d, y = (function(m, p, _, T, v) {
            var x = A.transformTo("string", v(T));
            return f.CENTRAL_DIRECTORY_END + "\0\0\0\0" + s(m, 2) + s(m, 2) + s(p, 4) + s(_, 4) + s(x.length, 2) + x;
          })(this.dirRecords.length, u, d, this.zipComment, this.encodeFileName);
          this.push({ data: y, meta: { percent: 100 } });
        }, g.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, g.prototype.registerPrevious = function(d) {
          this._sources.push(d);
          var h = this;
          return d.on("data", function(u) {
            h.processChunk(u);
          }), d.on("end", function() {
            h.closedSource(h.previous.streamInfo), h._sources.length ? h.prepareNextSource() : h.end();
          }), d.on("error", function(u) {
            h.error(u);
          }), this;
        }, g.prototype.resume = function() {
          return !!c.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0));
        }, g.prototype.error = function(d) {
          var h = this._sources;
          if (!c.prototype.error.call(this, d)) return !1;
          for (var u = 0; u < h.length; u++) try {
            h[u].error(d);
          } catch {
          }
          return !0;
        }, g.prototype.lock = function() {
          c.prototype.lock.call(this);
          for (var d = this._sources, h = 0; h < d.length; h++) d[h].lock();
        }, i.exports = g;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(t, i, a) {
        var s = t("../compressions"), l = t("./ZipFileWorker");
        a.generateWorker = function(A, c, n) {
          var o = new l(c.streamFiles, n, c.platform, c.encodeFileName), f = 0;
          try {
            A.forEach(function(g, d) {
              f++;
              var h = (function(p, _) {
                var T = p || _, v = s[T];
                if (!v) throw new Error(T + " is not a valid compression method !");
                return v;
              })(d.options.compression, c.compression), u = d.options.compressionOptions || c.compressionOptions || {}, y = d.dir, m = d.date;
              d._compressWorker(h, u).withStreamInfo("file", { name: g, dir: y, date: m, comment: d.comment || "", unixPermissions: d.unixPermissions, dosPermissions: d.dosPermissions }).pipe(o);
            }), o.entriesCount = f;
          } catch (g) {
            o.error(g);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(t, i, a) {
        function s() {
          if (!(this instanceof s)) return new s();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var l = new s();
            for (var A in this) typeof this[A] != "function" && (l[A] = this[A]);
            return l;
          };
        }
        (s.prototype = t("./object")).loadAsync = t("./load"), s.support = t("./support"), s.defaults = t("./defaults"), s.version = "3.10.1", s.loadAsync = function(l, A) {
          return new s().loadAsync(l, A);
        }, s.external = t("./external"), i.exports = s;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(t, i, a) {
        var s = t("./utils"), l = t("./external"), A = t("./utf8"), c = t("./zipEntries"), n = t("./stream/Crc32Probe"), o = t("./nodejsUtils");
        function f(g) {
          return new l.Promise(function(d, h) {
            var u = g.decompressed.getContentWorker().pipe(new n());
            u.on("error", function(y) {
              h(y);
            }).on("end", function() {
              u.streamInfo.crc32 !== g.decompressed.crc32 ? h(new Error("Corrupted zip : CRC32 mismatch")) : d();
            }).resume();
          });
        }
        i.exports = function(g, d) {
          var h = this;
          return d = s.extend(d || {}, { base64: !1, checkCRC32: !1, optimizedBinaryString: !1, createFolders: !1, decodeFileName: A.utf8decode }), o.isNode && o.isStream(g) ? l.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : s.prepareContent("the loaded zip file", g, !0, d.optimizedBinaryString, d.base64).then(function(u) {
            var y = new c(d);
            return y.load(u), y;
          }).then(function(u) {
            var y = [l.Promise.resolve(u)], m = u.files;
            if (d.checkCRC32) for (var p = 0; p < m.length; p++) y.push(f(m[p]));
            return l.Promise.all(y);
          }).then(function(u) {
            for (var y = u.shift(), m = y.files, p = 0; p < m.length; p++) {
              var _ = m[p], T = _.fileNameStr, v = s.resolve(_.fileNameStr);
              h.file(v, _.decompressed, { binary: !0, optimizedBinaryString: !0, date: _.date, dir: _.dir, comment: _.fileCommentStr.length ? _.fileCommentStr : null, unixPermissions: _.unixPermissions, dosPermissions: _.dosPermissions, createFolders: d.createFolders }), _.dir || (h.file(v).unsafeOriginalName = T);
            }
            return y.zipComment.length && (h.comment = y.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(t, i, a) {
        var s = t("../utils"), l = t("../stream/GenericWorker");
        function A(c, n) {
          l.call(this, "Nodejs stream input adapter for " + c), this._upstreamEnded = !1, this._bindStream(n);
        }
        s.inherits(A, l), A.prototype._bindStream = function(c) {
          var n = this;
          (this._stream = c).pause(), c.on("data", function(o) {
            n.push({ data: o, meta: { percent: 0 } });
          }).on("error", function(o) {
            n.isPaused ? this.generatedError = o : n.error(o);
          }).on("end", function() {
            n.isPaused ? n._upstreamEnded = !0 : n.end();
          });
        }, A.prototype.pause = function() {
          return !!l.prototype.pause.call(this) && (this._stream.pause(), !0);
        }, A.prototype.resume = function() {
          return !!l.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0);
        }, i.exports = A;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(t, i, a) {
        var s = t("readable-stream").Readable;
        function l(A, c, n) {
          s.call(this, c), this._helper = A;
          var o = this;
          A.on("data", function(f, g) {
            o.push(f) || o._helper.pause(), n && n(g);
          }).on("error", function(f) {
            o.emit("error", f);
          }).on("end", function() {
            o.push(null);
          });
        }
        t("../utils").inherits(l, s), l.prototype._read = function() {
          this._helper.resume();
        }, i.exports = l;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(t, i, a) {
        i.exports = { isNode: typeof Buffer < "u", newBufferFrom: function(s, l) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(s, l);
          if (typeof s == "number") throw new Error('The "data" argument must not be a number');
          return new Buffer(s, l);
        }, allocBuffer: function(s) {
          if (Buffer.alloc) return Buffer.alloc(s);
          var l = new Buffer(s);
          return l.fill(0), l;
        }, isBuffer: function(s) {
          return Buffer.isBuffer(s);
        }, isStream: function(s) {
          return s && typeof s.on == "function" && typeof s.pause == "function" && typeof s.resume == "function";
        } };
      }, {}], 15: [function(t, i, a) {
        function s(v, x, C) {
          var P, R = A.getTypeOf(x), S = A.extend(C || {}, o);
          S.date = S.date || /* @__PURE__ */ new Date(), S.compression !== null && (S.compression = S.compression.toUpperCase()), typeof S.unixPermissions == "string" && (S.unixPermissions = parseInt(S.unixPermissions, 8)), S.unixPermissions && 16384 & S.unixPermissions && (S.dir = !0), S.dosPermissions && 16 & S.dosPermissions && (S.dir = !0), S.dir && (v = m(v)), S.createFolders && (P = y(v)) && p.call(this, P, !0);
          var O = R === "string" && S.binary === !1 && S.base64 === !1;
          C && C.binary !== void 0 || (S.binary = !O), (x instanceof f && x.uncompressedSize === 0 || S.dir || !x || x.length === 0) && (S.base64 = !1, S.binary = !0, x = "", S.compression = "STORE", R = "string");
          var E = null;
          E = x instanceof f || x instanceof c ? x : h.isNode && h.isStream(x) ? new u(v, x) : A.prepareContent(v, x, S.binary, S.optimizedBinaryString, S.base64);
          var M = new g(v, E, S);
          this.files[v] = M;
        }
        var l = t("./utf8"), A = t("./utils"), c = t("./stream/GenericWorker"), n = t("./stream/StreamHelper"), o = t("./defaults"), f = t("./compressedObject"), g = t("./zipObject"), d = t("./generate"), h = t("./nodejsUtils"), u = t("./nodejs/NodejsStreamInputAdapter"), y = function(v) {
          v.slice(-1) === "/" && (v = v.substring(0, v.length - 1));
          var x = v.lastIndexOf("/");
          return 0 < x ? v.substring(0, x) : "";
        }, m = function(v) {
          return v.slice(-1) !== "/" && (v += "/"), v;
        }, p = function(v, x) {
          return x = x !== void 0 ? x : o.createFolders, v = m(v), this.files[v] || s.call(this, v, null, { dir: !0, createFolders: x }), this.files[v];
        };
        function _(v) {
          return Object.prototype.toString.call(v) === "[object RegExp]";
        }
        var T = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(v) {
          var x, C, P;
          for (x in this.files) P = this.files[x], (C = x.slice(this.root.length, x.length)) && x.slice(0, this.root.length) === this.root && v(C, P);
        }, filter: function(v) {
          var x = [];
          return this.forEach(function(C, P) {
            v(C, P) && x.push(P);
          }), x;
        }, file: function(v, x, C) {
          if (arguments.length !== 1) return v = this.root + v, s.call(this, v, x, C), this;
          if (_(v)) {
            var P = v;
            return this.filter(function(S, O) {
              return !O.dir && P.test(S);
            });
          }
          var R = this.files[this.root + v];
          return R && !R.dir ? R : null;
        }, folder: function(v) {
          if (!v) return this;
          if (_(v)) return this.filter(function(R, S) {
            return S.dir && v.test(R);
          });
          var x = this.root + v, C = p.call(this, x), P = this.clone();
          return P.root = C.name, P;
        }, remove: function(v) {
          v = this.root + v;
          var x = this.files[v];
          if (x || (v.slice(-1) !== "/" && (v += "/"), x = this.files[v]), x && !x.dir) delete this.files[v];
          else for (var C = this.filter(function(R, S) {
            return S.name.slice(0, v.length) === v;
          }), P = 0; P < C.length; P++) delete this.files[C[P].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(v) {
          var x, C = {};
          try {
            if ((C = A.extend(v || {}, { streamFiles: !1, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: l.utf8encode })).type = C.type.toLowerCase(), C.compression = C.compression.toUpperCase(), C.type === "binarystring" && (C.type = "string"), !C.type) throw new Error("No output type specified.");
            A.checkSupport(C.type), C.platform !== "darwin" && C.platform !== "freebsd" && C.platform !== "linux" && C.platform !== "sunos" || (C.platform = "UNIX"), C.platform === "win32" && (C.platform = "DOS");
            var P = C.comment || this.comment || "";
            x = d.generateWorker(this, C, P);
          } catch (R) {
            (x = new c("error")).error(R);
          }
          return new n(x, C.type || "string", C.mimeType);
        }, generateAsync: function(v, x) {
          return this.generateInternalStream(v).accumulate(x);
        }, generateNodeStream: function(v, x) {
          return (v = v || {}).type || (v.type = "nodebuffer"), this.generateInternalStream(v).toNodejsStream(x);
        } };
        i.exports = T;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(t, i, a) {
        i.exports = t("stream");
      }, { stream: void 0 }], 17: [function(t, i, a) {
        var s = t("./DataReader");
        function l(A) {
          s.call(this, A);
          for (var c = 0; c < this.data.length; c++) A[c] = 255 & A[c];
        }
        t("../utils").inherits(l, s), l.prototype.byteAt = function(A) {
          return this.data[this.zero + A];
        }, l.prototype.lastIndexOfSignature = function(A) {
          for (var c = A.charCodeAt(0), n = A.charCodeAt(1), o = A.charCodeAt(2), f = A.charCodeAt(3), g = this.length - 4; 0 <= g; --g) if (this.data[g] === c && this.data[g + 1] === n && this.data[g + 2] === o && this.data[g + 3] === f) return g - this.zero;
          return -1;
        }, l.prototype.readAndCheckSignature = function(A) {
          var c = A.charCodeAt(0), n = A.charCodeAt(1), o = A.charCodeAt(2), f = A.charCodeAt(3), g = this.readData(4);
          return c === g[0] && n === g[1] && o === g[2] && f === g[3];
        }, l.prototype.readData = function(A) {
          if (this.checkOffset(A), A === 0) return [];
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, i.exports = l;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(t, i, a) {
        var s = t("../utils");
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
          var c, n = 0;
          for (this.checkOffset(A), c = this.index + A - 1; c >= this.index; c--) n = (n << 8) + this.byteAt(c);
          return this.index += A, n;
        }, readString: function(A) {
          return s.transformTo("string", this.readData(A));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var A = this.readInt(4);
          return new Date(Date.UTC(1980 + (A >> 25 & 127), (A >> 21 & 15) - 1, A >> 16 & 31, A >> 11 & 31, A >> 5 & 63, (31 & A) << 1));
        } }, i.exports = l;
      }, { "../utils": 32 }], 19: [function(t, i, a) {
        var s = t("./Uint8ArrayReader");
        function l(A) {
          s.call(this, A);
        }
        t("../utils").inherits(l, s), l.prototype.readData = function(A) {
          this.checkOffset(A);
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, i.exports = l;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(t, i, a) {
        var s = t("./DataReader");
        function l(A) {
          s.call(this, A);
        }
        t("../utils").inherits(l, s), l.prototype.byteAt = function(A) {
          return this.data.charCodeAt(this.zero + A);
        }, l.prototype.lastIndexOfSignature = function(A) {
          return this.data.lastIndexOf(A) - this.zero;
        }, l.prototype.readAndCheckSignature = function(A) {
          return A === this.readData(4);
        }, l.prototype.readData = function(A) {
          this.checkOffset(A);
          var c = this.data.slice(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, i.exports = l;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(t, i, a) {
        var s = t("./ArrayReader");
        function l(A) {
          s.call(this, A);
        }
        t("../utils").inherits(l, s), l.prototype.readData = function(A) {
          if (this.checkOffset(A), A === 0) return new Uint8Array(0);
          var c = this.data.subarray(this.zero + this.index, this.zero + this.index + A);
          return this.index += A, c;
        }, i.exports = l;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(t, i, a) {
        var s = t("../utils"), l = t("../support"), A = t("./ArrayReader"), c = t("./StringReader"), n = t("./NodeBufferReader"), o = t("./Uint8ArrayReader");
        i.exports = function(f) {
          var g = s.getTypeOf(f);
          return s.checkSupport(g), g !== "string" || l.uint8array ? g === "nodebuffer" ? new n(f) : l.uint8array ? new o(s.transformTo("uint8array", f)) : new A(s.transformTo("array", f)) : new c(f);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(t, i, a) {
        a.LOCAL_FILE_HEADER = "PK", a.CENTRAL_FILE_HEADER = "PK", a.CENTRAL_DIRECTORY_END = "PK", a.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", a.ZIP64_CENTRAL_DIRECTORY_END = "PK", a.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(t, i, a) {
        var s = t("./GenericWorker"), l = t("../utils");
        function A(c) {
          s.call(this, "ConvertWorker to " + c), this.destType = c;
        }
        l.inherits(A, s), A.prototype.processChunk = function(c) {
          this.push({ data: l.transformTo(this.destType, c.data), meta: c.meta });
        }, i.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(t, i, a) {
        var s = t("./GenericWorker"), l = t("../crc32");
        function A() {
          s.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        t("../utils").inherits(A, s), A.prototype.processChunk = function(c) {
          this.streamInfo.crc32 = l(c.data, this.streamInfo.crc32 || 0), this.push(c);
        }, i.exports = A;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(t, i, a) {
        var s = t("../utils"), l = t("./GenericWorker");
        function A(c) {
          l.call(this, "DataLengthProbe for " + c), this.propName = c, this.withStreamInfo(c, 0);
        }
        s.inherits(A, l), A.prototype.processChunk = function(c) {
          if (c) {
            var n = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = n + c.data.length;
          }
          l.prototype.processChunk.call(this, c);
        }, i.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(t, i, a) {
        var s = t("../utils"), l = t("./GenericWorker");
        function A(c) {
          l.call(this, "DataWorker");
          var n = this;
          this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, c.then(function(o) {
            n.dataIsReady = !0, n.data = o, n.max = o && o.length || 0, n.type = s.getTypeOf(o), n.isPaused || n._tickAndRepeat();
          }, function(o) {
            n.error(o);
          });
        }
        s.inherits(A, l), A.prototype.cleanUp = function() {
          l.prototype.cleanUp.call(this), this.data = null;
        }, A.prototype.resume = function() {
          return !!l.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, s.delay(this._tickAndRepeat, [], this)), !0);
        }, A.prototype._tickAndRepeat = function() {
          this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (s.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
        }, A.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return !1;
          var c = null, n = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              c = this.data.substring(this.index, n);
              break;
            case "uint8array":
              c = this.data.subarray(this.index, n);
              break;
            case "array":
            case "nodebuffer":
              c = this.data.slice(this.index, n);
          }
          return this.index = n, this.push({ data: c, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, i.exports = A;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(t, i, a) {
        function s(l) {
          this.name = l || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        s.prototype = { push: function(l) {
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
        } }, i.exports = s;
      }, {}], 29: [function(t, i, a) {
        var s = t("../utils"), l = t("./ConvertWorker"), A = t("./GenericWorker"), c = t("../base64"), n = t("../support"), o = t("../external"), f = null;
        if (n.nodestream) try {
          f = t("../nodejs/NodejsStreamOutputAdapter");
        } catch {
        }
        function g(h, u) {
          return new o.Promise(function(y, m) {
            var p = [], _ = h._internalType, T = h._outputType, v = h._mimeType;
            h.on("data", function(x, C) {
              p.push(x), u && u(C);
            }).on("error", function(x) {
              p = [], m(x);
            }).on("end", function() {
              try {
                var x = (function(C, P, R) {
                  switch (C) {
                    case "blob":
                      return s.newBlob(s.transformTo("arraybuffer", P), R);
                    case "base64":
                      return c.encode(P);
                    default:
                      return s.transformTo(C, P);
                  }
                })(T, (function(C, P) {
                  var R, S = 0, O = null, E = 0;
                  for (R = 0; R < P.length; R++) E += P[R].length;
                  switch (C) {
                    case "string":
                      return P.join("");
                    case "array":
                      return Array.prototype.concat.apply([], P);
                    case "uint8array":
                      for (O = new Uint8Array(E), R = 0; R < P.length; R++) O.set(P[R], S), S += P[R].length;
                      return O;
                    case "nodebuffer":
                      return Buffer.concat(P);
                    default:
                      throw new Error("concat : unsupported type '" + C + "'");
                  }
                })(_, p), v);
                y(x);
              } catch (C) {
                m(C);
              }
              p = [];
            }).resume();
          });
        }
        function d(h, u, y) {
          var m = u;
          switch (u) {
            case "blob":
            case "arraybuffer":
              m = "uint8array";
              break;
            case "base64":
              m = "string";
          }
          try {
            this._internalType = m, this._outputType = u, this._mimeType = y, s.checkSupport(m), this._worker = h.pipe(new l(m)), h.lock();
          } catch (p) {
            this._worker = new A("error"), this._worker.error(p);
          }
        }
        d.prototype = { accumulate: function(h) {
          return g(this, h);
        }, on: function(h, u) {
          var y = this;
          return h === "data" ? this._worker.on(h, function(m) {
            u.call(y, m.data, m.meta);
          }) : this._worker.on(h, function() {
            s.delay(u, arguments, y);
          }), this;
        }, resume: function() {
          return s.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(h) {
          if (s.checkSupport("nodestream"), this._outputType !== "nodebuffer") throw new Error(this._outputType + " is not supported by this method");
          return new f(this, { objectMode: this._outputType !== "nodebuffer" }, h);
        } }, i.exports = d;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(t, i, a) {
        if (a.base64 = !0, a.array = !0, a.string = !0, a.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", a.nodebuffer = typeof Buffer < "u", a.uint8array = typeof Uint8Array < "u", typeof ArrayBuffer > "u") a.blob = !1;
        else {
          var s = new ArrayBuffer(0);
          try {
            a.blob = new Blob([s], { type: "application/zip" }).size === 0;
          } catch {
            try {
              var l = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              l.append(s), a.blob = l.getBlob("application/zip").size === 0;
            } catch {
              a.blob = !1;
            }
          }
        }
        try {
          a.nodestream = !!t("readable-stream").Readable;
        } catch {
          a.nodestream = !1;
        }
      }, { "readable-stream": 16 }], 31: [function(t, i, a) {
        for (var s = t("./utils"), l = t("./support"), A = t("./nodejsUtils"), c = t("./stream/GenericWorker"), n = new Array(256), o = 0; o < 256; o++) n[o] = 252 <= o ? 6 : 248 <= o ? 5 : 240 <= o ? 4 : 224 <= o ? 3 : 192 <= o ? 2 : 1;
        n[254] = n[254] = 1;
        function f() {
          c.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function g() {
          c.call(this, "utf-8 encode");
        }
        a.utf8encode = function(d) {
          return l.nodebuffer ? A.newBufferFrom(d, "utf-8") : (function(h) {
            var u, y, m, p, _, T = h.length, v = 0;
            for (p = 0; p < T; p++) (64512 & (y = h.charCodeAt(p))) == 55296 && p + 1 < T && (64512 & (m = h.charCodeAt(p + 1))) == 56320 && (y = 65536 + (y - 55296 << 10) + (m - 56320), p++), v += y < 128 ? 1 : y < 2048 ? 2 : y < 65536 ? 3 : 4;
            for (u = l.uint8array ? new Uint8Array(v) : new Array(v), p = _ = 0; _ < v; p++) (64512 & (y = h.charCodeAt(p))) == 55296 && p + 1 < T && (64512 & (m = h.charCodeAt(p + 1))) == 56320 && (y = 65536 + (y - 55296 << 10) + (m - 56320), p++), y < 128 ? u[_++] = y : (y < 2048 ? u[_++] = 192 | y >>> 6 : (y < 65536 ? u[_++] = 224 | y >>> 12 : (u[_++] = 240 | y >>> 18, u[_++] = 128 | y >>> 12 & 63), u[_++] = 128 | y >>> 6 & 63), u[_++] = 128 | 63 & y);
            return u;
          })(d);
        }, a.utf8decode = function(d) {
          return l.nodebuffer ? s.transformTo("nodebuffer", d).toString("utf-8") : (function(h) {
            var u, y, m, p, _ = h.length, T = new Array(2 * _);
            for (u = y = 0; u < _; ) if ((m = h[u++]) < 128) T[y++] = m;
            else if (4 < (p = n[m])) T[y++] = 65533, u += p - 1;
            else {
              for (m &= p === 2 ? 31 : p === 3 ? 15 : 7; 1 < p && u < _; ) m = m << 6 | 63 & h[u++], p--;
              1 < p ? T[y++] = 65533 : m < 65536 ? T[y++] = m : (m -= 65536, T[y++] = 55296 | m >> 10 & 1023, T[y++] = 56320 | 1023 & m);
            }
            return T.length !== y && (T.subarray ? T = T.subarray(0, y) : T.length = y), s.applyFromCharCode(T);
          })(d = s.transformTo(l.uint8array ? "uint8array" : "array", d));
        }, s.inherits(f, c), f.prototype.processChunk = function(d) {
          var h = s.transformTo(l.uint8array ? "uint8array" : "array", d.data);
          if (this.leftOver && this.leftOver.length) {
            if (l.uint8array) {
              var u = h;
              (h = new Uint8Array(u.length + this.leftOver.length)).set(this.leftOver, 0), h.set(u, this.leftOver.length);
            } else h = this.leftOver.concat(h);
            this.leftOver = null;
          }
          var y = (function(p, _) {
            var T;
            for ((_ = _ || p.length) > p.length && (_ = p.length), T = _ - 1; 0 <= T && (192 & p[T]) == 128; ) T--;
            return T < 0 || T === 0 ? _ : T + n[p[T]] > _ ? T : _;
          })(h), m = h;
          y !== h.length && (l.uint8array ? (m = h.subarray(0, y), this.leftOver = h.subarray(y, h.length)) : (m = h.slice(0, y), this.leftOver = h.slice(y, h.length))), this.push({ data: a.utf8decode(m), meta: d.meta });
        }, f.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: a.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, a.Utf8DecodeWorker = f, s.inherits(g, c), g.prototype.processChunk = function(d) {
          this.push({ data: a.utf8encode(d.data), meta: d.meta });
        }, a.Utf8EncodeWorker = g;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(t, i, a) {
        var s = t("./support"), l = t("./base64"), A = t("./nodejsUtils"), c = t("./external");
        function n(u) {
          return u;
        }
        function o(u, y) {
          for (var m = 0; m < u.length; ++m) y[m] = 255 & u.charCodeAt(m);
          return y;
        }
        t("setimmediate"), a.newBlob = function(u, y) {
          a.checkSupport("blob");
          try {
            return new Blob([u], { type: y });
          } catch {
            try {
              var m = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return m.append(u), m.getBlob(y);
            } catch {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var f = { stringifyByChunk: function(u, y, m) {
          var p = [], _ = 0, T = u.length;
          if (T <= m) return String.fromCharCode.apply(null, u);
          for (; _ < T; ) y === "array" || y === "nodebuffer" ? p.push(String.fromCharCode.apply(null, u.slice(_, Math.min(_ + m, T)))) : p.push(String.fromCharCode.apply(null, u.subarray(_, Math.min(_ + m, T)))), _ += m;
          return p.join("");
        }, stringifyByChar: function(u) {
          for (var y = "", m = 0; m < u.length; m++) y += String.fromCharCode(u[m]);
          return y;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return s.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch {
            return !1;
          }
        })(), nodebuffer: (function() {
          try {
            return s.nodebuffer && String.fromCharCode.apply(null, A.allocBuffer(1)).length === 1;
          } catch {
            return !1;
          }
        })() } };
        function g(u) {
          var y = 65536, m = a.getTypeOf(u), p = !0;
          if (m === "uint8array" ? p = f.applyCanBeUsed.uint8array : m === "nodebuffer" && (p = f.applyCanBeUsed.nodebuffer), p) for (; 1 < y; ) try {
            return f.stringifyByChunk(u, m, y);
          } catch {
            y = Math.floor(y / 2);
          }
          return f.stringifyByChar(u);
        }
        function d(u, y) {
          for (var m = 0; m < u.length; m++) y[m] = u[m];
          return y;
        }
        a.applyFromCharCode = g;
        var h = {};
        h.string = { string: n, array: function(u) {
          return o(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return h.string.uint8array(u).buffer;
        }, uint8array: function(u) {
          return o(u, new Uint8Array(u.length));
        }, nodebuffer: function(u) {
          return o(u, A.allocBuffer(u.length));
        } }, h.array = { string: g, array: n, arraybuffer: function(u) {
          return new Uint8Array(u).buffer;
        }, uint8array: function(u) {
          return new Uint8Array(u);
        }, nodebuffer: function(u) {
          return A.newBufferFrom(u);
        } }, h.arraybuffer = { string: function(u) {
          return g(new Uint8Array(u));
        }, array: function(u) {
          return d(new Uint8Array(u), new Array(u.byteLength));
        }, arraybuffer: n, uint8array: function(u) {
          return new Uint8Array(u);
        }, nodebuffer: function(u) {
          return A.newBufferFrom(new Uint8Array(u));
        } }, h.uint8array = { string: g, array: function(u) {
          return d(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return u.buffer;
        }, uint8array: n, nodebuffer: function(u) {
          return A.newBufferFrom(u);
        } }, h.nodebuffer = { string: g, array: function(u) {
          return d(u, new Array(u.length));
        }, arraybuffer: function(u) {
          return h.nodebuffer.uint8array(u).buffer;
        }, uint8array: function(u) {
          return d(u, new Uint8Array(u.length));
        }, nodebuffer: n }, a.transformTo = function(u, y) {
          if (y = y || "", !u) return y;
          a.checkSupport(u);
          var m = a.getTypeOf(y);
          return h[m][u](y);
        }, a.resolve = function(u) {
          for (var y = u.split("/"), m = [], p = 0; p < y.length; p++) {
            var _ = y[p];
            _ === "." || _ === "" && p !== 0 && p !== y.length - 1 || (_ === ".." ? m.pop() : m.push(_));
          }
          return m.join("/");
        }, a.getTypeOf = function(u) {
          return typeof u == "string" ? "string" : Object.prototype.toString.call(u) === "[object Array]" ? "array" : s.nodebuffer && A.isBuffer(u) ? "nodebuffer" : s.uint8array && u instanceof Uint8Array ? "uint8array" : s.arraybuffer && u instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(u) {
          if (!s[u.toLowerCase()]) throw new Error(u + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(u) {
          var y, m, p = "";
          for (m = 0; m < (u || "").length; m++) p += "\\x" + ((y = u.charCodeAt(m)) < 16 ? "0" : "") + y.toString(16).toUpperCase();
          return p;
        }, a.delay = function(u, y, m) {
          setImmediate(function() {
            u.apply(m || null, y || []);
          });
        }, a.inherits = function(u, y) {
          function m() {
          }
          m.prototype = y.prototype, u.prototype = new m();
        }, a.extend = function() {
          var u, y, m = {};
          for (u = 0; u < arguments.length; u++) for (y in arguments[u]) Object.prototype.hasOwnProperty.call(arguments[u], y) && m[y] === void 0 && (m[y] = arguments[u][y]);
          return m;
        }, a.prepareContent = function(u, y, m, p, _) {
          return c.Promise.resolve(y).then(function(T) {
            return s.blob && (T instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(T)) !== -1) && typeof FileReader < "u" ? new c.Promise(function(v, x) {
              var C = new FileReader();
              C.onload = function(P) {
                v(P.target.result);
              }, C.onerror = function(P) {
                x(P.target.error);
              }, C.readAsArrayBuffer(T);
            }) : T;
          }).then(function(T) {
            var v = a.getTypeOf(T);
            return v ? (v === "arraybuffer" ? T = a.transformTo("uint8array", T) : v === "string" && (_ ? T = l.decode(T) : m && p !== !0 && (T = (function(x) {
              return o(x, s.uint8array ? new Uint8Array(x.length) : new Array(x.length));
            })(T))), T) : c.Promise.reject(new Error("Can't read the data of '" + u + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(t, i, a) {
        var s = t("./reader/readerFor"), l = t("./utils"), A = t("./signature"), c = t("./zipEntry"), n = t("./support");
        function o(f) {
          this.files = [], this.loadOptions = f;
        }
        o.prototype = { checkSignature: function(f) {
          if (!this.reader.readAndCheckSignature(f)) {
            this.reader.index -= 4;
            var g = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + l.pretty(g) + ", expected " + l.pretty(f) + ")");
          }
        }, isSignature: function(f, g) {
          var d = this.reader.index;
          this.reader.setIndex(f);
          var h = this.reader.readString(4) === g;
          return this.reader.setIndex(d), h;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var f = this.reader.readData(this.zipCommentLength), g = n.uint8array ? "uint8array" : "array", d = l.transformTo(g, f);
          this.zipComment = this.loadOptions.decodeFileName(d);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var f, g, d, h = this.zip64EndOfCentralSize - 44; 0 < h; ) f = this.reader.readInt(2), g = this.reader.readInt(4), d = this.reader.readData(g), this.zip64ExtensibleData[f] = { id: f, length: g, value: d };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var f, g;
          for (f = 0; f < this.files.length; f++) g = this.files[f], this.reader.setIndex(g.localHeaderOffset), this.checkSignature(A.LOCAL_FILE_HEADER), g.readLocalPart(this.reader), g.handleUTF8(), g.processAttributes();
        }, readCentralDir: function() {
          var f;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(A.CENTRAL_FILE_HEADER); ) (f = new c({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(f);
          if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var f = this.reader.lastIndexOfSignature(A.CENTRAL_DIRECTORY_END);
          if (f < 0) throw this.isSignature(0, A.LOCAL_FILE_HEADER) ? new Error("Corrupted zip: can't find end of central directory") : new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
          this.reader.setIndex(f);
          var g = f;
          if (this.checkSignature(A.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === l.MAX_VALUE_16BITS || this.diskWithCentralDirStart === l.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === l.MAX_VALUE_16BITS || this.centralDirRecords === l.MAX_VALUE_16BITS || this.centralDirSize === l.MAX_VALUE_32BITS || this.centralDirOffset === l.MAX_VALUE_32BITS) {
            if (this.zip64 = !0, (f = this.reader.lastIndexOfSignature(A.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(f), this.checkSignature(A.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, A.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(A.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(A.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var d = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (d += 20, d += 12 + this.zip64EndOfCentralSize);
          var h = g - d;
          if (0 < h) this.isSignature(g, A.CENTRAL_FILE_HEADER) || (this.reader.zero = h);
          else if (h < 0) throw new Error("Corrupted zip: missing " + Math.abs(h) + " bytes.");
        }, prepareReader: function(f) {
          this.reader = s(f);
        }, load: function(f) {
          this.prepareReader(f), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, i.exports = o;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(t, i, a) {
        var s = t("./reader/readerFor"), l = t("./utils"), A = t("./compressedObject"), c = t("./crc32"), n = t("./utf8"), o = t("./compressions"), f = t("./support");
        function g(d, h) {
          this.options = d, this.loadOptions = h;
        }
        g.prototype = { isEncrypted: function() {
          return (1 & this.bitFlag) == 1;
        }, useUTF8: function() {
          return (2048 & this.bitFlag) == 2048;
        }, readLocalPart: function(d) {
          var h, u;
          if (d.skip(22), this.fileNameLength = d.readInt(2), u = d.readInt(2), this.fileName = d.readData(this.fileNameLength), d.skip(u), this.compressedSize === -1 || this.uncompressedSize === -1) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if ((h = (function(y) {
            for (var m in o) if (Object.prototype.hasOwnProperty.call(o, m) && o[m].magic === y) return o[m];
            return null;
          })(this.compressionMethod)) === null) throw new Error("Corrupted zip : compression " + l.pretty(this.compressionMethod) + " unknown (inner file : " + l.transformTo("string", this.fileName) + ")");
          this.decompressed = new A(this.compressedSize, this.uncompressedSize, this.crc32, h, d.readData(this.compressedSize));
        }, readCentralPart: function(d) {
          this.versionMadeBy = d.readInt(2), d.skip(2), this.bitFlag = d.readInt(2), this.compressionMethod = d.readString(2), this.date = d.readDate(), this.crc32 = d.readInt(4), this.compressedSize = d.readInt(4), this.uncompressedSize = d.readInt(4);
          var h = d.readInt(2);
          if (this.extraFieldsLength = d.readInt(2), this.fileCommentLength = d.readInt(2), this.diskNumberStart = d.readInt(2), this.internalFileAttributes = d.readInt(2), this.externalFileAttributes = d.readInt(4), this.localHeaderOffset = d.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          d.skip(h), this.readExtraFields(d), this.parseZIP64ExtraField(d), this.fileComment = d.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var d = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), d == 0 && (this.dosPermissions = 63 & this.externalFileAttributes), d == 3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || this.fileNameStr.slice(-1) !== "/" || (this.dir = !0);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var d = s(this.extraFields[1].value);
            this.uncompressedSize === l.MAX_VALUE_32BITS && (this.uncompressedSize = d.readInt(8)), this.compressedSize === l.MAX_VALUE_32BITS && (this.compressedSize = d.readInt(8)), this.localHeaderOffset === l.MAX_VALUE_32BITS && (this.localHeaderOffset = d.readInt(8)), this.diskNumberStart === l.MAX_VALUE_32BITS && (this.diskNumberStart = d.readInt(4));
          }
        }, readExtraFields: function(d) {
          var h, u, y, m = d.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); d.index + 4 < m; ) h = d.readInt(2), u = d.readInt(2), y = d.readData(u), this.extraFields[h] = { id: h, length: u, value: y };
          d.setIndex(m);
        }, handleUTF8: function() {
          var d = f.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = n.utf8decode(this.fileName), this.fileCommentStr = n.utf8decode(this.fileComment);
          else {
            var h = this.findExtraFieldUnicodePath();
            if (h !== null) this.fileNameStr = h;
            else {
              var u = l.transformTo(d, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(u);
            }
            var y = this.findExtraFieldUnicodeComment();
            if (y !== null) this.fileCommentStr = y;
            else {
              var m = l.transformTo(d, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(m);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var d = this.extraFields[28789];
          if (d) {
            var h = s(d.value);
            return h.readInt(1) !== 1 || c(this.fileName) !== h.readInt(4) ? null : n.utf8decode(h.readData(d.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var d = this.extraFields[25461];
          if (d) {
            var h = s(d.value);
            return h.readInt(1) !== 1 || c(this.fileComment) !== h.readInt(4) ? null : n.utf8decode(h.readData(d.length - 5));
          }
          return null;
        } }, i.exports = g;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(t, i, a) {
        function s(h, u, y) {
          this.name = h, this.dir = y.dir, this.date = y.date, this.comment = y.comment, this.unixPermissions = y.unixPermissions, this.dosPermissions = y.dosPermissions, this._data = u, this._dataBinary = y.binary, this.options = { compression: y.compression, compressionOptions: y.compressionOptions };
        }
        var l = t("./stream/StreamHelper"), A = t("./stream/DataWorker"), c = t("./utf8"), n = t("./compressedObject"), o = t("./stream/GenericWorker");
        s.prototype = { internalStream: function(h) {
          var u = null, y = "string";
          try {
            if (!h) throw new Error("No output type specified.");
            var m = (y = h.toLowerCase()) === "string" || y === "text";
            y !== "binarystring" && y !== "text" || (y = "string"), u = this._decompressWorker();
            var p = !this._dataBinary;
            p && !m && (u = u.pipe(new c.Utf8EncodeWorker())), !p && m && (u = u.pipe(new c.Utf8DecodeWorker()));
          } catch (_) {
            (u = new o("error")).error(_);
          }
          return new l(u, y, "");
        }, async: function(h, u) {
          return this.internalStream(h).accumulate(u);
        }, nodeStream: function(h, u) {
          return this.internalStream(h || "nodebuffer").toNodejsStream(u);
        }, _compressWorker: function(h, u) {
          if (this._data instanceof n && this._data.compression.magic === h.magic) return this._data.getCompressedWorker();
          var y = this._decompressWorker();
          return this._dataBinary || (y = y.pipe(new c.Utf8EncodeWorker())), n.createWorkerFrom(y, h, u);
        }, _decompressWorker: function() {
          return this._data instanceof n ? this._data.getContentWorker() : this._data instanceof o ? this._data : new A(this._data);
        } };
        for (var f = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], g = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, d = 0; d < f.length; d++) s.prototype[f[d]] = g;
        i.exports = s;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(t, i, a) {
        (function(s) {
          var l, A, c = s.MutationObserver || s.WebKitMutationObserver;
          if (c) {
            var n = 0, o = new c(h), f = s.document.createTextNode("");
            o.observe(f, { characterData: !0 }), l = function() {
              f.data = n = ++n % 2;
            };
          } else if (s.setImmediate || s.MessageChannel === void 0) l = "document" in s && "onreadystatechange" in s.document.createElement("script") ? function() {
            var u = s.document.createElement("script");
            u.onreadystatechange = function() {
              h(), u.onreadystatechange = null, u.parentNode.removeChild(u), u = null;
            }, s.document.documentElement.appendChild(u);
          } : function() {
            setTimeout(h, 0);
          };
          else {
            var g = new s.MessageChannel();
            g.port1.onmessage = h, l = function() {
              g.port2.postMessage(0);
            };
          }
          var d = [];
          function h() {
            var u, y;
            A = !0;
            for (var m = d.length; m; ) {
              for (y = d, d = [], u = -1; ++u < m; ) y[u]();
              m = d.length;
            }
            A = !1;
          }
          i.exports = function(u) {
            d.push(u) !== 1 || A || l();
          };
        }).call(this, typeof Jt < "u" ? Jt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}], 37: [function(t, i, a) {
        var s = t("immediate");
        function l() {
        }
        var A = {}, c = ["REJECTED"], n = ["FULFILLED"], o = ["PENDING"];
        function f(m) {
          if (typeof m != "function") throw new TypeError("resolver must be a function");
          this.state = o, this.queue = [], this.outcome = void 0, m !== l && u(this, m);
        }
        function g(m, p, _) {
          this.promise = m, typeof p == "function" && (this.onFulfilled = p, this.callFulfilled = this.otherCallFulfilled), typeof _ == "function" && (this.onRejected = _, this.callRejected = this.otherCallRejected);
        }
        function d(m, p, _) {
          s(function() {
            var T;
            try {
              T = p(_);
            } catch (v) {
              return A.reject(m, v);
            }
            T === m ? A.reject(m, new TypeError("Cannot resolve promise with itself")) : A.resolve(m, T);
          });
        }
        function h(m) {
          var p = m && m.then;
          if (m && (typeof m == "object" || typeof m == "function") && typeof p == "function") return function() {
            p.apply(m, arguments);
          };
        }
        function u(m, p) {
          var _ = !1;
          function T(C) {
            _ || (_ = !0, A.reject(m, C));
          }
          function v(C) {
            _ || (_ = !0, A.resolve(m, C));
          }
          var x = y(function() {
            p(v, T);
          });
          x.status === "error" && T(x.value);
        }
        function y(m, p) {
          var _ = {};
          try {
            _.value = m(p), _.status = "success";
          } catch (T) {
            _.status = "error", _.value = T;
          }
          return _;
        }
        (i.exports = f).prototype.finally = function(m) {
          if (typeof m != "function") return this;
          var p = this.constructor;
          return this.then(function(_) {
            return p.resolve(m()).then(function() {
              return _;
            });
          }, function(_) {
            return p.resolve(m()).then(function() {
              throw _;
            });
          });
        }, f.prototype.catch = function(m) {
          return this.then(null, m);
        }, f.prototype.then = function(m, p) {
          if (typeof m != "function" && this.state === n || typeof p != "function" && this.state === c) return this;
          var _ = new this.constructor(l);
          return this.state !== o ? d(_, this.state === n ? m : p, this.outcome) : this.queue.push(new g(_, m, p)), _;
        }, g.prototype.callFulfilled = function(m) {
          A.resolve(this.promise, m);
        }, g.prototype.otherCallFulfilled = function(m) {
          d(this.promise, this.onFulfilled, m);
        }, g.prototype.callRejected = function(m) {
          A.reject(this.promise, m);
        }, g.prototype.otherCallRejected = function(m) {
          d(this.promise, this.onRejected, m);
        }, A.resolve = function(m, p) {
          var _ = y(h, p);
          if (_.status === "error") return A.reject(m, _.value);
          var T = _.value;
          if (T) u(m, T);
          else {
            m.state = n, m.outcome = p;
            for (var v = -1, x = m.queue.length; ++v < x; ) m.queue[v].callFulfilled(p);
          }
          return m;
        }, A.reject = function(m, p) {
          m.state = c, m.outcome = p;
          for (var _ = -1, T = m.queue.length; ++_ < T; ) m.queue[_].callRejected(p);
          return m;
        }, f.resolve = function(m) {
          return m instanceof this ? m : A.resolve(new this(l), m);
        }, f.reject = function(m) {
          var p = new this(l);
          return A.reject(p, m);
        }, f.all = function(m) {
          var p = this;
          if (Object.prototype.toString.call(m) !== "[object Array]") return this.reject(new TypeError("must be an array"));
          var _ = m.length, T = !1;
          if (!_) return this.resolve([]);
          for (var v = new Array(_), x = 0, C = -1, P = new this(l); ++C < _; ) R(m[C], C);
          return P;
          function R(S, O) {
            p.resolve(S).then(function(E) {
              v[O] = E, ++x !== _ || T || (T = !0, A.resolve(P, v));
            }, function(E) {
              T || (T = !0, A.reject(P, E));
            });
          }
        }, f.race = function(m) {
          var p = this;
          if (Object.prototype.toString.call(m) !== "[object Array]") return this.reject(new TypeError("must be an array"));
          var _ = m.length, T = !1;
          if (!_) return this.resolve([]);
          for (var v = -1, x = new this(l); ++v < _; ) C = m[v], p.resolve(C).then(function(P) {
            T || (T = !0, A.resolve(x, P));
          }, function(P) {
            T || (T = !0, A.reject(x, P));
          });
          var C;
          return x;
        };
      }, { immediate: 36 }], 38: [function(t, i, a) {
        var s = {};
        (0, t("./lib/utils/common").assign)(s, t("./lib/deflate"), t("./lib/inflate"), t("./lib/zlib/constants")), i.exports = s;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(t, i, a) {
        var s = t("./zlib/deflate"), l = t("./utils/common"), A = t("./utils/strings"), c = t("./zlib/messages"), n = t("./zlib/zstream"), o = Object.prototype.toString, f = 0, g = -1, d = 0, h = 8;
        function u(m) {
          if (!(this instanceof u)) return new u(m);
          this.options = l.assign({ level: g, method: h, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: d, to: "" }, m || {});
          var p = this.options;
          p.raw && 0 < p.windowBits ? p.windowBits = -p.windowBits : p.gzip && 0 < p.windowBits && p.windowBits < 16 && (p.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new n(), this.strm.avail_out = 0;
          var _ = s.deflateInit2(this.strm, p.level, p.method, p.windowBits, p.memLevel, p.strategy);
          if (_ !== f) throw new Error(c[_]);
          if (p.header && s.deflateSetHeader(this.strm, p.header), p.dictionary) {
            var T;
            if (T = typeof p.dictionary == "string" ? A.string2buf(p.dictionary) : o.call(p.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(p.dictionary) : p.dictionary, (_ = s.deflateSetDictionary(this.strm, T)) !== f) throw new Error(c[_]);
            this._dict_set = !0;
          }
        }
        function y(m, p) {
          var _ = new u(p);
          if (_.push(m, !0), _.err) throw _.msg || c[_.err];
          return _.result;
        }
        u.prototype.push = function(m, p) {
          var _, T, v = this.strm, x = this.options.chunkSize;
          if (this.ended) return !1;
          T = p === ~~p ? p : p === !0 ? 4 : 0, typeof m == "string" ? v.input = A.string2buf(m) : o.call(m) === "[object ArrayBuffer]" ? v.input = new Uint8Array(m) : v.input = m, v.next_in = 0, v.avail_in = v.input.length;
          do {
            if (v.avail_out === 0 && (v.output = new l.Buf8(x), v.next_out = 0, v.avail_out = x), (_ = s.deflate(v, T)) !== 1 && _ !== f) return this.onEnd(_), !(this.ended = !0);
            v.avail_out !== 0 && (v.avail_in !== 0 || T !== 4 && T !== 2) || (this.options.to === "string" ? this.onData(A.buf2binstring(l.shrinkBuf(v.output, v.next_out))) : this.onData(l.shrinkBuf(v.output, v.next_out)));
          } while ((0 < v.avail_in || v.avail_out === 0) && _ !== 1);
          return T === 4 ? (_ = s.deflateEnd(this.strm), this.onEnd(_), this.ended = !0, _ === f) : T !== 2 || (this.onEnd(f), !(v.avail_out = 0));
        }, u.prototype.onData = function(m) {
          this.chunks.push(m);
        }, u.prototype.onEnd = function(m) {
          m === f && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = m, this.msg = this.strm.msg;
        }, a.Deflate = u, a.deflate = y, a.deflateRaw = function(m, p) {
          return (p = p || {}).raw = !0, y(m, p);
        }, a.gzip = function(m, p) {
          return (p = p || {}).gzip = !0, y(m, p);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(t, i, a) {
        var s = t("./zlib/inflate"), l = t("./utils/common"), A = t("./utils/strings"), c = t("./zlib/constants"), n = t("./zlib/messages"), o = t("./zlib/zstream"), f = t("./zlib/gzheader"), g = Object.prototype.toString;
        function d(u) {
          if (!(this instanceof d)) return new d(u);
          this.options = l.assign({ chunkSize: 16384, windowBits: 0, to: "" }, u || {});
          var y = this.options;
          y.raw && 0 <= y.windowBits && y.windowBits < 16 && (y.windowBits = -y.windowBits, y.windowBits === 0 && (y.windowBits = -15)), !(0 <= y.windowBits && y.windowBits < 16) || u && u.windowBits || (y.windowBits += 32), 15 < y.windowBits && y.windowBits < 48 && (15 & y.windowBits) == 0 && (y.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new o(), this.strm.avail_out = 0;
          var m = s.inflateInit2(this.strm, y.windowBits);
          if (m !== c.Z_OK) throw new Error(n[m]);
          this.header = new f(), s.inflateGetHeader(this.strm, this.header);
        }
        function h(u, y) {
          var m = new d(y);
          if (m.push(u, !0), m.err) throw m.msg || n[m.err];
          return m.result;
        }
        d.prototype.push = function(u, y) {
          var m, p, _, T, v, x, C = this.strm, P = this.options.chunkSize, R = this.options.dictionary, S = !1;
          if (this.ended) return !1;
          p = y === ~~y ? y : y === !0 ? c.Z_FINISH : c.Z_NO_FLUSH, typeof u == "string" ? C.input = A.binstring2buf(u) : g.call(u) === "[object ArrayBuffer]" ? C.input = new Uint8Array(u) : C.input = u, C.next_in = 0, C.avail_in = C.input.length;
          do {
            if (C.avail_out === 0 && (C.output = new l.Buf8(P), C.next_out = 0, C.avail_out = P), (m = s.inflate(C, c.Z_NO_FLUSH)) === c.Z_NEED_DICT && R && (x = typeof R == "string" ? A.string2buf(R) : g.call(R) === "[object ArrayBuffer]" ? new Uint8Array(R) : R, m = s.inflateSetDictionary(this.strm, x)), m === c.Z_BUF_ERROR && S === !0 && (m = c.Z_OK, S = !1), m !== c.Z_STREAM_END && m !== c.Z_OK) return this.onEnd(m), !(this.ended = !0);
            C.next_out && (C.avail_out !== 0 && m !== c.Z_STREAM_END && (C.avail_in !== 0 || p !== c.Z_FINISH && p !== c.Z_SYNC_FLUSH) || (this.options.to === "string" ? (_ = A.utf8border(C.output, C.next_out), T = C.next_out - _, v = A.buf2string(C.output, _), C.next_out = T, C.avail_out = P - T, T && l.arraySet(C.output, C.output, _, T, 0), this.onData(v)) : this.onData(l.shrinkBuf(C.output, C.next_out)))), C.avail_in === 0 && C.avail_out === 0 && (S = !0);
          } while ((0 < C.avail_in || C.avail_out === 0) && m !== c.Z_STREAM_END);
          return m === c.Z_STREAM_END && (p = c.Z_FINISH), p === c.Z_FINISH ? (m = s.inflateEnd(this.strm), this.onEnd(m), this.ended = !0, m === c.Z_OK) : p !== c.Z_SYNC_FLUSH || (this.onEnd(c.Z_OK), !(C.avail_out = 0));
        }, d.prototype.onData = function(u) {
          this.chunks.push(u);
        }, d.prototype.onEnd = function(u) {
          u === c.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = l.flattenChunks(this.chunks)), this.chunks = [], this.err = u, this.msg = this.strm.msg;
        }, a.Inflate = d, a.inflate = h, a.inflateRaw = function(u, y) {
          return (y = y || {}).raw = !0, h(u, y);
        }, a.ungzip = h;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(t, i, a) {
        var s = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
        a.assign = function(c) {
          for (var n = Array.prototype.slice.call(arguments, 1); n.length; ) {
            var o = n.shift();
            if (o) {
              if (typeof o != "object") throw new TypeError(o + "must be non-object");
              for (var f in o) o.hasOwnProperty(f) && (c[f] = o[f]);
            }
          }
          return c;
        }, a.shrinkBuf = function(c, n) {
          return c.length === n ? c : c.subarray ? c.subarray(0, n) : (c.length = n, c);
        };
        var l = { arraySet: function(c, n, o, f, g) {
          if (n.subarray && c.subarray) c.set(n.subarray(o, o + f), g);
          else for (var d = 0; d < f; d++) c[g + d] = n[o + d];
        }, flattenChunks: function(c) {
          var n, o, f, g, d, h;
          for (n = f = 0, o = c.length; n < o; n++) f += c[n].length;
          for (h = new Uint8Array(f), n = g = 0, o = c.length; n < o; n++) d = c[n], h.set(d, g), g += d.length;
          return h;
        } }, A = { arraySet: function(c, n, o, f, g) {
          for (var d = 0; d < f; d++) c[g + d] = n[o + d];
        }, flattenChunks: function(c) {
          return [].concat.apply([], c);
        } };
        a.setTyped = function(c) {
          c ? (a.Buf8 = Uint8Array, a.Buf16 = Uint16Array, a.Buf32 = Int32Array, a.assign(a, l)) : (a.Buf8 = Array, a.Buf16 = Array, a.Buf32 = Array, a.assign(a, A));
        }, a.setTyped(s);
      }, {}], 42: [function(t, i, a) {
        var s = t("./common"), l = !0, A = !0;
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
        for (var c = new s.Buf8(256), n = 0; n < 256; n++) c[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function o(f, g) {
          if (g < 65537 && (f.subarray && A || !f.subarray && l)) return String.fromCharCode.apply(null, s.shrinkBuf(f, g));
          for (var d = "", h = 0; h < g; h++) d += String.fromCharCode(f[h]);
          return d;
        }
        c[254] = c[254] = 1, a.string2buf = function(f) {
          var g, d, h, u, y, m = f.length, p = 0;
          for (u = 0; u < m; u++) (64512 & (d = f.charCodeAt(u))) == 55296 && u + 1 < m && (64512 & (h = f.charCodeAt(u + 1))) == 56320 && (d = 65536 + (d - 55296 << 10) + (h - 56320), u++), p += d < 128 ? 1 : d < 2048 ? 2 : d < 65536 ? 3 : 4;
          for (g = new s.Buf8(p), u = y = 0; y < p; u++) (64512 & (d = f.charCodeAt(u))) == 55296 && u + 1 < m && (64512 & (h = f.charCodeAt(u + 1))) == 56320 && (d = 65536 + (d - 55296 << 10) + (h - 56320), u++), d < 128 ? g[y++] = d : (d < 2048 ? g[y++] = 192 | d >>> 6 : (d < 65536 ? g[y++] = 224 | d >>> 12 : (g[y++] = 240 | d >>> 18, g[y++] = 128 | d >>> 12 & 63), g[y++] = 128 | d >>> 6 & 63), g[y++] = 128 | 63 & d);
          return g;
        }, a.buf2binstring = function(f) {
          return o(f, f.length);
        }, a.binstring2buf = function(f) {
          for (var g = new s.Buf8(f.length), d = 0, h = g.length; d < h; d++) g[d] = f.charCodeAt(d);
          return g;
        }, a.buf2string = function(f, g) {
          var d, h, u, y, m = g || f.length, p = new Array(2 * m);
          for (d = h = 0; d < m; ) if ((u = f[d++]) < 128) p[h++] = u;
          else if (4 < (y = c[u])) p[h++] = 65533, d += y - 1;
          else {
            for (u &= y === 2 ? 31 : y === 3 ? 15 : 7; 1 < y && d < m; ) u = u << 6 | 63 & f[d++], y--;
            1 < y ? p[h++] = 65533 : u < 65536 ? p[h++] = u : (u -= 65536, p[h++] = 55296 | u >> 10 & 1023, p[h++] = 56320 | 1023 & u);
          }
          return o(p, h);
        }, a.utf8border = function(f, g) {
          var d;
          for ((g = g || f.length) > f.length && (g = f.length), d = g - 1; 0 <= d && (192 & f[d]) == 128; ) d--;
          return d < 0 || d === 0 ? g : d + c[f[d]] > g ? d : g;
        };
      }, { "./common": 41 }], 43: [function(t, i, a) {
        i.exports = function(s, l, A, c) {
          for (var n = 65535 & s | 0, o = s >>> 16 & 65535 | 0, f = 0; A !== 0; ) {
            for (A -= f = 2e3 < A ? 2e3 : A; o = o + (n = n + l[c++] | 0) | 0, --f; ) ;
            n %= 65521, o %= 65521;
          }
          return n | o << 16 | 0;
        };
      }, {}], 44: [function(t, i, a) {
        i.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(t, i, a) {
        var s = (function() {
          for (var l, A = [], c = 0; c < 256; c++) {
            l = c;
            for (var n = 0; n < 8; n++) l = 1 & l ? 3988292384 ^ l >>> 1 : l >>> 1;
            A[c] = l;
          }
          return A;
        })();
        i.exports = function(l, A, c, n) {
          var o = s, f = n + c;
          l ^= -1;
          for (var g = n; g < f; g++) l = l >>> 8 ^ o[255 & (l ^ A[g])];
          return -1 ^ l;
        };
      }, {}], 46: [function(t, i, a) {
        var s, l = t("../utils/common"), A = t("./trees"), c = t("./adler32"), n = t("./crc32"), o = t("./messages"), f = 0, g = 4, d = 0, h = -2, u = -1, y = 4, m = 2, p = 8, _ = 9, T = 286, v = 30, x = 19, C = 2 * T + 1, P = 15, R = 3, S = 258, O = S + R + 1, E = 42, M = 113, w = 1, G = 2, ee = 3, Y = 4;
        function ne(b, X) {
          return b.msg = o[X], X;
        }
        function Z(b) {
          return (b << 1) - (4 < b ? 9 : 0);
        }
        function Q(b) {
          for (var X = b.length; 0 <= --X; ) b[X] = 0;
        }
        function B(b) {
          var X = b.state, H = X.pending;
          H > b.avail_out && (H = b.avail_out), H !== 0 && (l.arraySet(b.output, X.pending_buf, X.pending_out, H, b.next_out), b.next_out += H, X.pending_out += H, b.total_out += H, b.avail_out -= H, X.pending -= H, X.pending === 0 && (X.pending_out = 0));
        }
        function F(b, X) {
          A._tr_flush_block(b, 0 <= b.block_start ? b.block_start : -1, b.strstart - b.block_start, X), b.block_start = b.strstart, B(b.strm);
        }
        function $(b, X) {
          b.pending_buf[b.pending++] = X;
        }
        function L(b, X) {
          b.pending_buf[b.pending++] = X >>> 8 & 255, b.pending_buf[b.pending++] = 255 & X;
        }
        function N(b, X) {
          var H, k, I = b.max_chain_length, U = b.strstart, K = b.prev_length, J = b.nice_match, V = b.strstart > b.w_size - O ? b.strstart - (b.w_size - O) : 0, te = b.window, se = b.w_mask, ie = b.prev, ce = b.strstart + S, Te = te[U + K - 1], ye = te[U + K];
          b.prev_length >= b.good_match && (I >>= 2), J > b.lookahead && (J = b.lookahead);
          do
            if (te[(H = X) + K] === ye && te[H + K - 1] === Te && te[H] === te[U] && te[++H] === te[U + 1]) {
              U += 2, H++;
              do
                ;
              while (te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && te[++U] === te[++H] && U < ce);
              if (k = S - (ce - U), U = ce - S, K < k) {
                if (b.match_start = X, J <= (K = k)) break;
                Te = te[U + K - 1], ye = te[U + K];
              }
            }
          while ((X = ie[X & se]) > V && --I != 0);
          return K <= b.lookahead ? K : b.lookahead;
        }
        function q(b) {
          var X, H, k, I, U, K, J, V, te, se, ie = b.w_size;
          do {
            if (I = b.window_size - b.lookahead - b.strstart, b.strstart >= ie + (ie - O)) {
              for (l.arraySet(b.window, b.window, ie, ie, 0), b.match_start -= ie, b.strstart -= ie, b.block_start -= ie, X = H = b.hash_size; k = b.head[--X], b.head[X] = ie <= k ? k - ie : 0, --H; ) ;
              for (X = H = ie; k = b.prev[--X], b.prev[X] = ie <= k ? k - ie : 0, --H; ) ;
              I += ie;
            }
            if (b.strm.avail_in === 0) break;
            if (K = b.strm, J = b.window, V = b.strstart + b.lookahead, te = I, se = void 0, se = K.avail_in, te < se && (se = te), H = se === 0 ? 0 : (K.avail_in -= se, l.arraySet(J, K.input, K.next_in, se, V), K.state.wrap === 1 ? K.adler = c(K.adler, J, se, V) : K.state.wrap === 2 && (K.adler = n(K.adler, J, se, V)), K.next_in += se, K.total_in += se, se), b.lookahead += H, b.lookahead + b.insert >= R) for (U = b.strstart - b.insert, b.ins_h = b.window[U], b.ins_h = (b.ins_h << b.hash_shift ^ b.window[U + 1]) & b.hash_mask; b.insert && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[U + R - 1]) & b.hash_mask, b.prev[U & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = U, U++, b.insert--, !(b.lookahead + b.insert < R)); ) ;
          } while (b.lookahead < O && b.strm.avail_in !== 0);
        }
        function oe(b, X) {
          for (var H, k; ; ) {
            if (b.lookahead < O) {
              if (q(b), b.lookahead < O && X === f) return w;
              if (b.lookahead === 0) break;
            }
            if (H = 0, b.lookahead >= R && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, H = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), H !== 0 && b.strstart - H <= b.w_size - O && (b.match_length = N(b, H)), b.match_length >= R) if (k = A._tr_tally(b, b.strstart - b.match_start, b.match_length - R), b.lookahead -= b.match_length, b.match_length <= b.max_lazy_match && b.lookahead >= R) {
              for (b.match_length--; b.strstart++, b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, H = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart, --b.match_length != 0; ) ;
              b.strstart++;
            } else b.strstart += b.match_length, b.match_length = 0, b.ins_h = b.window[b.strstart], b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + 1]) & b.hash_mask;
            else k = A._tr_tally(b, 0, b.window[b.strstart]), b.lookahead--, b.strstart++;
            if (k && (F(b, !1), b.strm.avail_out === 0)) return w;
          }
          return b.insert = b.strstart < R - 1 ? b.strstart : R - 1, X === g ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : b.last_lit && (F(b, !1), b.strm.avail_out === 0) ? w : G;
        }
        function ae(b, X) {
          for (var H, k, I; ; ) {
            if (b.lookahead < O) {
              if (q(b), b.lookahead < O && X === f) return w;
              if (b.lookahead === 0) break;
            }
            if (H = 0, b.lookahead >= R && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, H = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), b.prev_length = b.match_length, b.prev_match = b.match_start, b.match_length = R - 1, H !== 0 && b.prev_length < b.max_lazy_match && b.strstart - H <= b.w_size - O && (b.match_length = N(b, H), b.match_length <= 5 && (b.strategy === 1 || b.match_length === R && 4096 < b.strstart - b.match_start) && (b.match_length = R - 1)), b.prev_length >= R && b.match_length <= b.prev_length) {
              for (I = b.strstart + b.lookahead - R, k = A._tr_tally(b, b.strstart - 1 - b.prev_match, b.prev_length - R), b.lookahead -= b.prev_length - 1, b.prev_length -= 2; ++b.strstart <= I && (b.ins_h = (b.ins_h << b.hash_shift ^ b.window[b.strstart + R - 1]) & b.hash_mask, H = b.prev[b.strstart & b.w_mask] = b.head[b.ins_h], b.head[b.ins_h] = b.strstart), --b.prev_length != 0; ) ;
              if (b.match_available = 0, b.match_length = R - 1, b.strstart++, k && (F(b, !1), b.strm.avail_out === 0)) return w;
            } else if (b.match_available) {
              if ((k = A._tr_tally(b, 0, b.window[b.strstart - 1])) && F(b, !1), b.strstart++, b.lookahead--, b.strm.avail_out === 0) return w;
            } else b.match_available = 1, b.strstart++, b.lookahead--;
          }
          return b.match_available && (k = A._tr_tally(b, 0, b.window[b.strstart - 1]), b.match_available = 0), b.insert = b.strstart < R - 1 ? b.strstart : R - 1, X === g ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : b.last_lit && (F(b, !1), b.strm.avail_out === 0) ? w : G;
        }
        function le(b, X, H, k, I) {
          this.good_length = b, this.max_lazy = X, this.nice_length = H, this.max_chain = k, this.func = I;
        }
        function Ae() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = p, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new l.Buf16(2 * C), this.dyn_dtree = new l.Buf16(2 * (2 * v + 1)), this.bl_tree = new l.Buf16(2 * (2 * x + 1)), Q(this.dyn_ltree), Q(this.dyn_dtree), Q(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new l.Buf16(P + 1), this.heap = new l.Buf16(2 * T + 1), Q(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new l.Buf16(2 * T + 1), Q(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function z(b) {
          var X;
          return b && b.state ? (b.total_in = b.total_out = 0, b.data_type = m, (X = b.state).pending = 0, X.pending_out = 0, X.wrap < 0 && (X.wrap = -X.wrap), X.status = X.wrap ? E : M, b.adler = X.wrap === 2 ? 0 : 1, X.last_flush = f, A._tr_init(X), d) : ne(b, h);
        }
        function W(b) {
          var X = z(b);
          return X === d && (function(H) {
            H.window_size = 2 * H.w_size, Q(H.head), H.max_lazy_match = s[H.level].max_lazy, H.good_match = s[H.level].good_length, H.nice_match = s[H.level].nice_length, H.max_chain_length = s[H.level].max_chain, H.strstart = 0, H.block_start = 0, H.lookahead = 0, H.insert = 0, H.match_length = H.prev_length = R - 1, H.match_available = 0, H.ins_h = 0;
          })(b.state), X;
        }
        function j(b, X, H, k, I, U) {
          if (!b) return h;
          var K = 1;
          if (X === u && (X = 6), k < 0 ? (K = 0, k = -k) : 15 < k && (K = 2, k -= 16), I < 1 || _ < I || H !== p || k < 8 || 15 < k || X < 0 || 9 < X || U < 0 || y < U) return ne(b, h);
          k === 8 && (k = 9);
          var J = new Ae();
          return (b.state = J).strm = b, J.wrap = K, J.gzhead = null, J.w_bits = k, J.w_size = 1 << J.w_bits, J.w_mask = J.w_size - 1, J.hash_bits = I + 7, J.hash_size = 1 << J.hash_bits, J.hash_mask = J.hash_size - 1, J.hash_shift = ~~((J.hash_bits + R - 1) / R), J.window = new l.Buf8(2 * J.w_size), J.head = new l.Buf16(J.hash_size), J.prev = new l.Buf16(J.w_size), J.lit_bufsize = 1 << I + 6, J.pending_buf_size = 4 * J.lit_bufsize, J.pending_buf = new l.Buf8(J.pending_buf_size), J.d_buf = 1 * J.lit_bufsize, J.l_buf = 3 * J.lit_bufsize, J.level = X, J.strategy = U, J.method = H, W(b);
        }
        s = [new le(0, 0, 0, 0, function(b, X) {
          var H = 65535;
          for (H > b.pending_buf_size - 5 && (H = b.pending_buf_size - 5); ; ) {
            if (b.lookahead <= 1) {
              if (q(b), b.lookahead === 0 && X === f) return w;
              if (b.lookahead === 0) break;
            }
            b.strstart += b.lookahead, b.lookahead = 0;
            var k = b.block_start + H;
            if ((b.strstart === 0 || b.strstart >= k) && (b.lookahead = b.strstart - k, b.strstart = k, F(b, !1), b.strm.avail_out === 0) || b.strstart - b.block_start >= b.w_size - O && (F(b, !1), b.strm.avail_out === 0)) return w;
          }
          return b.insert = 0, X === g ? (F(b, !0), b.strm.avail_out === 0 ? ee : Y) : (b.strstart > b.block_start && (F(b, !1), b.strm.avail_out), w);
        }), new le(4, 4, 8, 4, oe), new le(4, 5, 16, 8, oe), new le(4, 6, 32, 32, oe), new le(4, 4, 16, 16, ae), new le(8, 16, 32, 32, ae), new le(8, 16, 128, 128, ae), new le(8, 32, 128, 256, ae), new le(32, 128, 258, 1024, ae), new le(32, 258, 258, 4096, ae)], a.deflateInit = function(b, X) {
          return j(b, X, p, 15, 8, 0);
        }, a.deflateInit2 = j, a.deflateReset = W, a.deflateResetKeep = z, a.deflateSetHeader = function(b, X) {
          return b && b.state ? b.state.wrap !== 2 ? h : (b.state.gzhead = X, d) : h;
        }, a.deflate = function(b, X) {
          var H, k, I, U;
          if (!b || !b.state || 5 < X || X < 0) return b ? ne(b, h) : h;
          if (k = b.state, !b.output || !b.input && b.avail_in !== 0 || k.status === 666 && X !== g) return ne(b, b.avail_out === 0 ? -5 : h);
          if (k.strm = b, H = k.last_flush, k.last_flush = X, k.status === E) if (k.wrap === 2) b.adler = 0, $(k, 31), $(k, 139), $(k, 8), k.gzhead ? ($(k, (k.gzhead.text ? 1 : 0) + (k.gzhead.hcrc ? 2 : 0) + (k.gzhead.extra ? 4 : 0) + (k.gzhead.name ? 8 : 0) + (k.gzhead.comment ? 16 : 0)), $(k, 255 & k.gzhead.time), $(k, k.gzhead.time >> 8 & 255), $(k, k.gzhead.time >> 16 & 255), $(k, k.gzhead.time >> 24 & 255), $(k, k.level === 9 ? 2 : 2 <= k.strategy || k.level < 2 ? 4 : 0), $(k, 255 & k.gzhead.os), k.gzhead.extra && k.gzhead.extra.length && ($(k, 255 & k.gzhead.extra.length), $(k, k.gzhead.extra.length >> 8 & 255)), k.gzhead.hcrc && (b.adler = n(b.adler, k.pending_buf, k.pending, 0)), k.gzindex = 0, k.status = 69) : ($(k, 0), $(k, 0), $(k, 0), $(k, 0), $(k, 0), $(k, k.level === 9 ? 2 : 2 <= k.strategy || k.level < 2 ? 4 : 0), $(k, 3), k.status = M);
          else {
            var K = p + (k.w_bits - 8 << 4) << 8;
            K |= (2 <= k.strategy || k.level < 2 ? 0 : k.level < 6 ? 1 : k.level === 6 ? 2 : 3) << 6, k.strstart !== 0 && (K |= 32), K += 31 - K % 31, k.status = M, L(k, K), k.strstart !== 0 && (L(k, b.adler >>> 16), L(k, 65535 & b.adler)), b.adler = 1;
          }
          if (k.status === 69) if (k.gzhead.extra) {
            for (I = k.pending; k.gzindex < (65535 & k.gzhead.extra.length) && (k.pending !== k.pending_buf_size || (k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), B(b), I = k.pending, k.pending !== k.pending_buf_size)); ) $(k, 255 & k.gzhead.extra[k.gzindex]), k.gzindex++;
            k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), k.gzindex === k.gzhead.extra.length && (k.gzindex = 0, k.status = 73);
          } else k.status = 73;
          if (k.status === 73) if (k.gzhead.name) {
            I = k.pending;
            do {
              if (k.pending === k.pending_buf_size && (k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), B(b), I = k.pending, k.pending === k.pending_buf_size)) {
                U = 1;
                break;
              }
              U = k.gzindex < k.gzhead.name.length ? 255 & k.gzhead.name.charCodeAt(k.gzindex++) : 0, $(k, U);
            } while (U !== 0);
            k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), U === 0 && (k.gzindex = 0, k.status = 91);
          } else k.status = 91;
          if (k.status === 91) if (k.gzhead.comment) {
            I = k.pending;
            do {
              if (k.pending === k.pending_buf_size && (k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), B(b), I = k.pending, k.pending === k.pending_buf_size)) {
                U = 1;
                break;
              }
              U = k.gzindex < k.gzhead.comment.length ? 255 & k.gzhead.comment.charCodeAt(k.gzindex++) : 0, $(k, U);
            } while (U !== 0);
            k.gzhead.hcrc && k.pending > I && (b.adler = n(b.adler, k.pending_buf, k.pending - I, I)), U === 0 && (k.status = 103);
          } else k.status = 103;
          if (k.status === 103 && (k.gzhead.hcrc ? (k.pending + 2 > k.pending_buf_size && B(b), k.pending + 2 <= k.pending_buf_size && ($(k, 255 & b.adler), $(k, b.adler >> 8 & 255), b.adler = 0, k.status = M)) : k.status = M), k.pending !== 0) {
            if (B(b), b.avail_out === 0) return k.last_flush = -1, d;
          } else if (b.avail_in === 0 && Z(X) <= Z(H) && X !== g) return ne(b, -5);
          if (k.status === 666 && b.avail_in !== 0) return ne(b, -5);
          if (b.avail_in !== 0 || k.lookahead !== 0 || X !== f && k.status !== 666) {
            var J = k.strategy === 2 ? (function(V, te) {
              for (var se; ; ) {
                if (V.lookahead === 0 && (q(V), V.lookahead === 0)) {
                  if (te === f) return w;
                  break;
                }
                if (V.match_length = 0, se = A._tr_tally(V, 0, V.window[V.strstart]), V.lookahead--, V.strstart++, se && (F(V, !1), V.strm.avail_out === 0)) return w;
              }
              return V.insert = 0, te === g ? (F(V, !0), V.strm.avail_out === 0 ? ee : Y) : V.last_lit && (F(V, !1), V.strm.avail_out === 0) ? w : G;
            })(k, X) : k.strategy === 3 ? (function(V, te) {
              for (var se, ie, ce, Te, ye = V.window; ; ) {
                if (V.lookahead <= S) {
                  if (q(V), V.lookahead <= S && te === f) return w;
                  if (V.lookahead === 0) break;
                }
                if (V.match_length = 0, V.lookahead >= R && 0 < V.strstart && (ie = ye[ce = V.strstart - 1]) === ye[++ce] && ie === ye[++ce] && ie === ye[++ce]) {
                  Te = V.strstart + S;
                  do
                    ;
                  while (ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ie === ye[++ce] && ce < Te);
                  V.match_length = S - (Te - ce), V.match_length > V.lookahead && (V.match_length = V.lookahead);
                }
                if (V.match_length >= R ? (se = A._tr_tally(V, 1, V.match_length - R), V.lookahead -= V.match_length, V.strstart += V.match_length, V.match_length = 0) : (se = A._tr_tally(V, 0, V.window[V.strstart]), V.lookahead--, V.strstart++), se && (F(V, !1), V.strm.avail_out === 0)) return w;
              }
              return V.insert = 0, te === g ? (F(V, !0), V.strm.avail_out === 0 ? ee : Y) : V.last_lit && (F(V, !1), V.strm.avail_out === 0) ? w : G;
            })(k, X) : s[k.level].func(k, X);
            if (J !== ee && J !== Y || (k.status = 666), J === w || J === ee) return b.avail_out === 0 && (k.last_flush = -1), d;
            if (J === G && (X === 1 ? A._tr_align(k) : X !== 5 && (A._tr_stored_block(k, 0, 0, !1), X === 3 && (Q(k.head), k.lookahead === 0 && (k.strstart = 0, k.block_start = 0, k.insert = 0))), B(b), b.avail_out === 0)) return k.last_flush = -1, d;
          }
          return X !== g ? d : k.wrap <= 0 ? 1 : (k.wrap === 2 ? ($(k, 255 & b.adler), $(k, b.adler >> 8 & 255), $(k, b.adler >> 16 & 255), $(k, b.adler >> 24 & 255), $(k, 255 & b.total_in), $(k, b.total_in >> 8 & 255), $(k, b.total_in >> 16 & 255), $(k, b.total_in >> 24 & 255)) : (L(k, b.adler >>> 16), L(k, 65535 & b.adler)), B(b), 0 < k.wrap && (k.wrap = -k.wrap), k.pending !== 0 ? d : 1);
        }, a.deflateEnd = function(b) {
          var X;
          return b && b.state ? (X = b.state.status) !== E && X !== 69 && X !== 73 && X !== 91 && X !== 103 && X !== M && X !== 666 ? ne(b, h) : (b.state = null, X === M ? ne(b, -3) : d) : h;
        }, a.deflateSetDictionary = function(b, X) {
          var H, k, I, U, K, J, V, te, se = X.length;
          if (!b || !b.state || (U = (H = b.state).wrap) === 2 || U === 1 && H.status !== E || H.lookahead) return h;
          for (U === 1 && (b.adler = c(b.adler, X, se, 0)), H.wrap = 0, se >= H.w_size && (U === 0 && (Q(H.head), H.strstart = 0, H.block_start = 0, H.insert = 0), te = new l.Buf8(H.w_size), l.arraySet(te, X, se - H.w_size, H.w_size, 0), X = te, se = H.w_size), K = b.avail_in, J = b.next_in, V = b.input, b.avail_in = se, b.next_in = 0, b.input = X, q(H); H.lookahead >= R; ) {
            for (k = H.strstart, I = H.lookahead - (R - 1); H.ins_h = (H.ins_h << H.hash_shift ^ H.window[k + R - 1]) & H.hash_mask, H.prev[k & H.w_mask] = H.head[H.ins_h], H.head[H.ins_h] = k, k++, --I; ) ;
            H.strstart = k, H.lookahead = R - 1, q(H);
          }
          return H.strstart += H.lookahead, H.block_start = H.strstart, H.insert = H.lookahead, H.lookahead = 0, H.match_length = H.prev_length = R - 1, H.match_available = 0, b.next_in = J, b.input = V, b.avail_in = K, H.wrap = U, d;
        }, a.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(t, i, a) {
        i.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
        };
      }, {}], 48: [function(t, i, a) {
        i.exports = function(s, l) {
          var A, c, n, o, f, g, d, h, u, y, m, p, _, T, v, x, C, P, R, S, O, E, M, w, G;
          A = s.state, c = s.next_in, w = s.input, n = c + (s.avail_in - 5), o = s.next_out, G = s.output, f = o - (l - s.avail_out), g = o + (s.avail_out - 257), d = A.dmax, h = A.wsize, u = A.whave, y = A.wnext, m = A.window, p = A.hold, _ = A.bits, T = A.lencode, v = A.distcode, x = (1 << A.lenbits) - 1, C = (1 << A.distbits) - 1;
          e: do {
            _ < 15 && (p += w[c++] << _, _ += 8, p += w[c++] << _, _ += 8), P = T[p & x];
            t: for (; ; ) {
              if (p >>>= R = P >>> 24, _ -= R, (R = P >>> 16 & 255) === 0) G[o++] = 65535 & P;
              else {
                if (!(16 & R)) {
                  if ((64 & R) == 0) {
                    P = T[(65535 & P) + (p & (1 << R) - 1)];
                    continue t;
                  }
                  if (32 & R) {
                    A.mode = 12;
                    break e;
                  }
                  s.msg = "invalid literal/length code", A.mode = 30;
                  break e;
                }
                S = 65535 & P, (R &= 15) && (_ < R && (p += w[c++] << _, _ += 8), S += p & (1 << R) - 1, p >>>= R, _ -= R), _ < 15 && (p += w[c++] << _, _ += 8, p += w[c++] << _, _ += 8), P = v[p & C];
                r: for (; ; ) {
                  if (p >>>= R = P >>> 24, _ -= R, !(16 & (R = P >>> 16 & 255))) {
                    if ((64 & R) == 0) {
                      P = v[(65535 & P) + (p & (1 << R) - 1)];
                      continue r;
                    }
                    s.msg = "invalid distance code", A.mode = 30;
                    break e;
                  }
                  if (O = 65535 & P, _ < (R &= 15) && (p += w[c++] << _, (_ += 8) < R && (p += w[c++] << _, _ += 8)), d < (O += p & (1 << R) - 1)) {
                    s.msg = "invalid distance too far back", A.mode = 30;
                    break e;
                  }
                  if (p >>>= R, _ -= R, (R = o - f) < O) {
                    if (u < (R = O - R) && A.sane) {
                      s.msg = "invalid distance too far back", A.mode = 30;
                      break e;
                    }
                    if (M = m, (E = 0) === y) {
                      if (E += h - R, R < S) {
                        for (S -= R; G[o++] = m[E++], --R; ) ;
                        E = o - O, M = G;
                      }
                    } else if (y < R) {
                      if (E += h + y - R, (R -= y) < S) {
                        for (S -= R; G[o++] = m[E++], --R; ) ;
                        if (E = 0, y < S) {
                          for (S -= R = y; G[o++] = m[E++], --R; ) ;
                          E = o - O, M = G;
                        }
                      }
                    } else if (E += y - R, R < S) {
                      for (S -= R; G[o++] = m[E++], --R; ) ;
                      E = o - O, M = G;
                    }
                    for (; 2 < S; ) G[o++] = M[E++], G[o++] = M[E++], G[o++] = M[E++], S -= 3;
                    S && (G[o++] = M[E++], 1 < S && (G[o++] = M[E++]));
                  } else {
                    for (E = o - O; G[o++] = G[E++], G[o++] = G[E++], G[o++] = G[E++], 2 < (S -= 3); ) ;
                    S && (G[o++] = G[E++], 1 < S && (G[o++] = G[E++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (c < n && o < g);
          c -= S = _ >> 3, p &= (1 << (_ -= S << 3)) - 1, s.next_in = c, s.next_out = o, s.avail_in = c < n ? n - c + 5 : 5 - (c - n), s.avail_out = o < g ? g - o + 257 : 257 - (o - g), A.hold = p, A.bits = _;
        };
      }, {}], 49: [function(t, i, a) {
        var s = t("../utils/common"), l = t("./adler32"), A = t("./crc32"), c = t("./inffast"), n = t("./inftrees"), o = 1, f = 2, g = 0, d = -2, h = 1, u = 852, y = 592;
        function m(E) {
          return (E >>> 24 & 255) + (E >>> 8 & 65280) + ((65280 & E) << 8) + ((255 & E) << 24);
        }
        function p() {
          this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new s.Buf16(320), this.work = new s.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function _(E) {
          var M;
          return E && E.state ? (M = E.state, E.total_in = E.total_out = M.total = 0, E.msg = "", M.wrap && (E.adler = 1 & M.wrap), M.mode = h, M.last = 0, M.havedict = 0, M.dmax = 32768, M.head = null, M.hold = 0, M.bits = 0, M.lencode = M.lendyn = new s.Buf32(u), M.distcode = M.distdyn = new s.Buf32(y), M.sane = 1, M.back = -1, g) : d;
        }
        function T(E) {
          var M;
          return E && E.state ? ((M = E.state).wsize = 0, M.whave = 0, M.wnext = 0, _(E)) : d;
        }
        function v(E, M) {
          var w, G;
          return E && E.state ? (G = E.state, M < 0 ? (w = 0, M = -M) : (w = 1 + (M >> 4), M < 48 && (M &= 15)), M && (M < 8 || 15 < M) ? d : (G.window !== null && G.wbits !== M && (G.window = null), G.wrap = w, G.wbits = M, T(E))) : d;
        }
        function x(E, M) {
          var w, G;
          return E ? (G = new p(), (E.state = G).window = null, (w = v(E, M)) !== g && (E.state = null), w) : d;
        }
        var C, P, R = !0;
        function S(E) {
          if (R) {
            var M;
            for (C = new s.Buf32(512), P = new s.Buf32(32), M = 0; M < 144; ) E.lens[M++] = 8;
            for (; M < 256; ) E.lens[M++] = 9;
            for (; M < 280; ) E.lens[M++] = 7;
            for (; M < 288; ) E.lens[M++] = 8;
            for (n(o, E.lens, 0, 288, C, 0, E.work, { bits: 9 }), M = 0; M < 32; ) E.lens[M++] = 5;
            n(f, E.lens, 0, 32, P, 0, E.work, { bits: 5 }), R = !1;
          }
          E.lencode = C, E.lenbits = 9, E.distcode = P, E.distbits = 5;
        }
        function O(E, M, w, G) {
          var ee, Y = E.state;
          return Y.window === null && (Y.wsize = 1 << Y.wbits, Y.wnext = 0, Y.whave = 0, Y.window = new s.Buf8(Y.wsize)), G >= Y.wsize ? (s.arraySet(Y.window, M, w - Y.wsize, Y.wsize, 0), Y.wnext = 0, Y.whave = Y.wsize) : (G < (ee = Y.wsize - Y.wnext) && (ee = G), s.arraySet(Y.window, M, w - G, ee, Y.wnext), (G -= ee) ? (s.arraySet(Y.window, M, w - G, G, 0), Y.wnext = G, Y.whave = Y.wsize) : (Y.wnext += ee, Y.wnext === Y.wsize && (Y.wnext = 0), Y.whave < Y.wsize && (Y.whave += ee))), 0;
        }
        a.inflateReset = T, a.inflateReset2 = v, a.inflateResetKeep = _, a.inflateInit = function(E) {
          return x(E, 15);
        }, a.inflateInit2 = x, a.inflate = function(E, M) {
          var w, G, ee, Y, ne, Z, Q, B, F, $, L, N, q, oe, ae, le, Ae, z, W, j, b, X, H, k, I = 0, U = new s.Buf8(4), K = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!E || !E.state || !E.output || !E.input && E.avail_in !== 0) return d;
          (w = E.state).mode === 12 && (w.mode = 13), ne = E.next_out, ee = E.output, Q = E.avail_out, Y = E.next_in, G = E.input, Z = E.avail_in, B = w.hold, F = w.bits, $ = Z, L = Q, X = g;
          e: for (; ; ) switch (w.mode) {
            case h:
              if (w.wrap === 0) {
                w.mode = 13;
                break;
              }
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if (2 & w.wrap && B === 35615) {
                U[w.check = 0] = 255 & B, U[1] = B >>> 8 & 255, w.check = A(w.check, U, 2, 0), F = B = 0, w.mode = 2;
                break;
              }
              if (w.flags = 0, w.head && (w.head.done = !1), !(1 & w.wrap) || (((255 & B) << 8) + (B >> 8)) % 31) {
                E.msg = "incorrect header check", w.mode = 30;
                break;
              }
              if ((15 & B) != 8) {
                E.msg = "unknown compression method", w.mode = 30;
                break;
              }
              if (F -= 4, b = 8 + (15 & (B >>>= 4)), w.wbits === 0) w.wbits = b;
              else if (b > w.wbits) {
                E.msg = "invalid window size", w.mode = 30;
                break;
              }
              w.dmax = 1 << b, E.adler = w.check = 1, w.mode = 512 & B ? 10 : 12, F = B = 0;
              break;
            case 2:
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if (w.flags = B, (255 & w.flags) != 8) {
                E.msg = "unknown compression method", w.mode = 30;
                break;
              }
              if (57344 & w.flags) {
                E.msg = "unknown header flags set", w.mode = 30;
                break;
              }
              w.head && (w.head.text = B >> 8 & 1), 512 & w.flags && (U[0] = 255 & B, U[1] = B >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = B = 0, w.mode = 3;
            case 3:
              for (; F < 32; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              w.head && (w.head.time = B), 512 & w.flags && (U[0] = 255 & B, U[1] = B >>> 8 & 255, U[2] = B >>> 16 & 255, U[3] = B >>> 24 & 255, w.check = A(w.check, U, 4, 0)), F = B = 0, w.mode = 4;
            case 4:
              for (; F < 16; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              w.head && (w.head.xflags = 255 & B, w.head.os = B >> 8), 512 & w.flags && (U[0] = 255 & B, U[1] = B >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = B = 0, w.mode = 5;
            case 5:
              if (1024 & w.flags) {
                for (; F < 16; ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                w.length = B, w.head && (w.head.extra_len = B), 512 & w.flags && (U[0] = 255 & B, U[1] = B >>> 8 & 255, w.check = A(w.check, U, 2, 0)), F = B = 0;
              } else w.head && (w.head.extra = null);
              w.mode = 6;
            case 6:
              if (1024 & w.flags && (Z < (N = w.length) && (N = Z), N && (w.head && (b = w.head.extra_len - w.length, w.head.extra || (w.head.extra = new Array(w.head.extra_len)), s.arraySet(w.head.extra, G, Y, N, b)), 512 & w.flags && (w.check = A(w.check, G, N, Y)), Z -= N, Y += N, w.length -= N), w.length)) break e;
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
                  Z--, B += G[Y++] << F, F += 8;
                }
                if (B !== (65535 & w.check)) {
                  E.msg = "header crc mismatch", w.mode = 30;
                  break;
                }
                F = B = 0;
              }
              w.head && (w.head.hcrc = w.flags >> 9 & 1, w.head.done = !0), E.adler = w.check = 0, w.mode = 12;
              break;
            case 10:
              for (; F < 32; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              E.adler = w.check = m(B), F = B = 0, w.mode = 11;
            case 11:
              if (w.havedict === 0) return E.next_out = ne, E.avail_out = Q, E.next_in = Y, E.avail_in = Z, w.hold = B, w.bits = F, 2;
              E.adler = w.check = 1, w.mode = 12;
            case 12:
              if (M === 5 || M === 6) break e;
            case 13:
              if (w.last) {
                B >>>= 7 & F, F -= 7 & F, w.mode = 27;
                break;
              }
              for (; F < 3; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              switch (w.last = 1 & B, F -= 1, 3 & (B >>>= 1)) {
                case 0:
                  w.mode = 14;
                  break;
                case 1:
                  if (S(w), w.mode = 20, M !== 6) break;
                  B >>>= 2, F -= 2;
                  break e;
                case 2:
                  w.mode = 17;
                  break;
                case 3:
                  E.msg = "invalid block type", w.mode = 30;
              }
              B >>>= 2, F -= 2;
              break;
            case 14:
              for (B >>>= 7 & F, F -= 7 & F; F < 32; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if ((65535 & B) != (B >>> 16 ^ 65535)) {
                E.msg = "invalid stored block lengths", w.mode = 30;
                break;
              }
              if (w.length = 65535 & B, F = B = 0, w.mode = 15, M === 6) break e;
            case 15:
              w.mode = 16;
            case 16:
              if (N = w.length) {
                if (Z < N && (N = Z), Q < N && (N = Q), N === 0) break e;
                s.arraySet(ee, G, Y, N, ne), Z -= N, Y += N, Q -= N, ne += N, w.length -= N;
                break;
              }
              w.mode = 12;
              break;
            case 17:
              for (; F < 14; ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if (w.nlen = 257 + (31 & B), B >>>= 5, F -= 5, w.ndist = 1 + (31 & B), B >>>= 5, F -= 5, w.ncode = 4 + (15 & B), B >>>= 4, F -= 4, 286 < w.nlen || 30 < w.ndist) {
                E.msg = "too many length or distance symbols", w.mode = 30;
                break;
              }
              w.have = 0, w.mode = 18;
            case 18:
              for (; w.have < w.ncode; ) {
                for (; F < 3; ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                w.lens[K[w.have++]] = 7 & B, B >>>= 3, F -= 3;
              }
              for (; w.have < 19; ) w.lens[K[w.have++]] = 0;
              if (w.lencode = w.lendyn, w.lenbits = 7, H = { bits: w.lenbits }, X = n(0, w.lens, 0, 19, w.lencode, 0, w.work, H), w.lenbits = H.bits, X) {
                E.msg = "invalid code lengths set", w.mode = 30;
                break;
              }
              w.have = 0, w.mode = 19;
            case 19:
              for (; w.have < w.nlen + w.ndist; ) {
                for (; le = (I = w.lencode[B & (1 << w.lenbits) - 1]) >>> 16 & 255, Ae = 65535 & I, !((ae = I >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                if (Ae < 16) B >>>= ae, F -= ae, w.lens[w.have++] = Ae;
                else {
                  if (Ae === 16) {
                    for (k = ae + 2; F < k; ) {
                      if (Z === 0) break e;
                      Z--, B += G[Y++] << F, F += 8;
                    }
                    if (B >>>= ae, F -= ae, w.have === 0) {
                      E.msg = "invalid bit length repeat", w.mode = 30;
                      break;
                    }
                    b = w.lens[w.have - 1], N = 3 + (3 & B), B >>>= 2, F -= 2;
                  } else if (Ae === 17) {
                    for (k = ae + 3; F < k; ) {
                      if (Z === 0) break e;
                      Z--, B += G[Y++] << F, F += 8;
                    }
                    F -= ae, b = 0, N = 3 + (7 & (B >>>= ae)), B >>>= 3, F -= 3;
                  } else {
                    for (k = ae + 7; F < k; ) {
                      if (Z === 0) break e;
                      Z--, B += G[Y++] << F, F += 8;
                    }
                    F -= ae, b = 0, N = 11 + (127 & (B >>>= ae)), B >>>= 7, F -= 7;
                  }
                  if (w.have + N > w.nlen + w.ndist) {
                    E.msg = "invalid bit length repeat", w.mode = 30;
                    break;
                  }
                  for (; N--; ) w.lens[w.have++] = b;
                }
              }
              if (w.mode === 30) break;
              if (w.lens[256] === 0) {
                E.msg = "invalid code -- missing end-of-block", w.mode = 30;
                break;
              }
              if (w.lenbits = 9, H = { bits: w.lenbits }, X = n(o, w.lens, 0, w.nlen, w.lencode, 0, w.work, H), w.lenbits = H.bits, X) {
                E.msg = "invalid literal/lengths set", w.mode = 30;
                break;
              }
              if (w.distbits = 6, w.distcode = w.distdyn, H = { bits: w.distbits }, X = n(f, w.lens, w.nlen, w.ndist, w.distcode, 0, w.work, H), w.distbits = H.bits, X) {
                E.msg = "invalid distances set", w.mode = 30;
                break;
              }
              if (w.mode = 20, M === 6) break e;
            case 20:
              w.mode = 21;
            case 21:
              if (6 <= Z && 258 <= Q) {
                E.next_out = ne, E.avail_out = Q, E.next_in = Y, E.avail_in = Z, w.hold = B, w.bits = F, c(E, L), ne = E.next_out, ee = E.output, Q = E.avail_out, Y = E.next_in, G = E.input, Z = E.avail_in, B = w.hold, F = w.bits, w.mode === 12 && (w.back = -1);
                break;
              }
              for (w.back = 0; le = (I = w.lencode[B & (1 << w.lenbits) - 1]) >>> 16 & 255, Ae = 65535 & I, !((ae = I >>> 24) <= F); ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if (le && (240 & le) == 0) {
                for (z = ae, W = le, j = Ae; le = (I = w.lencode[j + ((B & (1 << z + W) - 1) >> z)]) >>> 16 & 255, Ae = 65535 & I, !(z + (ae = I >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                B >>>= z, F -= z, w.back += z;
              }
              if (B >>>= ae, F -= ae, w.back += ae, w.length = Ae, le === 0) {
                w.mode = 26;
                break;
              }
              if (32 & le) {
                w.back = -1, w.mode = 12;
                break;
              }
              if (64 & le) {
                E.msg = "invalid literal/length code", w.mode = 30;
                break;
              }
              w.extra = 15 & le, w.mode = 22;
            case 22:
              if (w.extra) {
                for (k = w.extra; F < k; ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                w.length += B & (1 << w.extra) - 1, B >>>= w.extra, F -= w.extra, w.back += w.extra;
              }
              w.was = w.length, w.mode = 23;
            case 23:
              for (; le = (I = w.distcode[B & (1 << w.distbits) - 1]) >>> 16 & 255, Ae = 65535 & I, !((ae = I >>> 24) <= F); ) {
                if (Z === 0) break e;
                Z--, B += G[Y++] << F, F += 8;
              }
              if ((240 & le) == 0) {
                for (z = ae, W = le, j = Ae; le = (I = w.distcode[j + ((B & (1 << z + W) - 1) >> z)]) >>> 16 & 255, Ae = 65535 & I, !(z + (ae = I >>> 24) <= F); ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                B >>>= z, F -= z, w.back += z;
              }
              if (B >>>= ae, F -= ae, w.back += ae, 64 & le) {
                E.msg = "invalid distance code", w.mode = 30;
                break;
              }
              w.offset = Ae, w.extra = 15 & le, w.mode = 24;
            case 24:
              if (w.extra) {
                for (k = w.extra; F < k; ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                w.offset += B & (1 << w.extra) - 1, B >>>= w.extra, F -= w.extra, w.back += w.extra;
              }
              if (w.offset > w.dmax) {
                E.msg = "invalid distance too far back", w.mode = 30;
                break;
              }
              w.mode = 25;
            case 25:
              if (Q === 0) break e;
              if (N = L - Q, w.offset > N) {
                if ((N = w.offset - N) > w.whave && w.sane) {
                  E.msg = "invalid distance too far back", w.mode = 30;
                  break;
                }
                q = N > w.wnext ? (N -= w.wnext, w.wsize - N) : w.wnext - N, N > w.length && (N = w.length), oe = w.window;
              } else oe = ee, q = ne - w.offset, N = w.length;
              for (Q < N && (N = Q), Q -= N, w.length -= N; ee[ne++] = oe[q++], --N; ) ;
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
                  Z--, B |= G[Y++] << F, F += 8;
                }
                if (L -= Q, E.total_out += L, w.total += L, L && (E.adler = w.check = w.flags ? A(w.check, ee, L, ne - L) : l(w.check, ee, L, ne - L)), L = Q, (w.flags ? B : m(B)) !== w.check) {
                  E.msg = "incorrect data check", w.mode = 30;
                  break;
                }
                F = B = 0;
              }
              w.mode = 28;
            case 28:
              if (w.wrap && w.flags) {
                for (; F < 32; ) {
                  if (Z === 0) break e;
                  Z--, B += G[Y++] << F, F += 8;
                }
                if (B !== (4294967295 & w.total)) {
                  E.msg = "incorrect length check", w.mode = 30;
                  break;
                }
                F = B = 0;
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
          return E.next_out = ne, E.avail_out = Q, E.next_in = Y, E.avail_in = Z, w.hold = B, w.bits = F, (w.wsize || L !== E.avail_out && w.mode < 30 && (w.mode < 27 || M !== 4)) && O(E, E.output, E.next_out, L - E.avail_out) ? (w.mode = 31, -4) : ($ -= E.avail_in, L -= E.avail_out, E.total_in += $, E.total_out += L, w.total += L, w.wrap && L && (E.adler = w.check = w.flags ? A(w.check, ee, L, E.next_out - L) : l(w.check, ee, L, E.next_out - L)), E.data_type = w.bits + (w.last ? 64 : 0) + (w.mode === 12 ? 128 : 0) + (w.mode === 20 || w.mode === 15 ? 256 : 0), ($ == 0 && L === 0 || M === 4) && X === g && (X = -5), X);
        }, a.inflateEnd = function(E) {
          if (!E || !E.state) return d;
          var M = E.state;
          return M.window && (M.window = null), E.state = null, g;
        }, a.inflateGetHeader = function(E, M) {
          var w;
          return E && E.state ? (2 & (w = E.state).wrap) == 0 ? d : ((w.head = M).done = !1, g) : d;
        }, a.inflateSetDictionary = function(E, M) {
          var w, G = M.length;
          return E && E.state ? (w = E.state).wrap !== 0 && w.mode !== 11 ? d : w.mode === 11 && l(1, M, G, 0) !== w.check ? -3 : O(E, M, G, G) ? (w.mode = 31, -4) : (w.havedict = 1, g) : d;
        }, a.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(t, i, a) {
        var s = t("../utils/common"), l = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], A = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], c = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], n = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        i.exports = function(o, f, g, d, h, u, y, m) {
          var p, _, T, v, x, C, P, R, S, O = m.bits, E = 0, M = 0, w = 0, G = 0, ee = 0, Y = 0, ne = 0, Z = 0, Q = 0, B = 0, F = null, $ = 0, L = new s.Buf16(16), N = new s.Buf16(16), q = null, oe = 0;
          for (E = 0; E <= 15; E++) L[E] = 0;
          for (M = 0; M < d; M++) L[f[g + M]]++;
          for (ee = O, G = 15; 1 <= G && L[G] === 0; G--) ;
          if (G < ee && (ee = G), G === 0) return h[u++] = 20971520, h[u++] = 20971520, m.bits = 1, 0;
          for (w = 1; w < G && L[w] === 0; w++) ;
          for (ee < w && (ee = w), E = Z = 1; E <= 15; E++) if (Z <<= 1, (Z -= L[E]) < 0) return -1;
          if (0 < Z && (o === 0 || G !== 1)) return -1;
          for (N[1] = 0, E = 1; E < 15; E++) N[E + 1] = N[E] + L[E];
          for (M = 0; M < d; M++) f[g + M] !== 0 && (y[N[f[g + M]]++] = M);
          if (C = o === 0 ? (F = q = y, 19) : o === 1 ? (F = l, $ -= 257, q = A, oe -= 257, 256) : (F = c, q = n, -1), E = w, x = u, ne = M = B = 0, T = -1, v = (Q = 1 << (Y = ee)) - 1, o === 1 && 852 < Q || o === 2 && 592 < Q) return 1;
          for (; ; ) {
            for (P = E - ne, S = y[M] < C ? (R = 0, y[M]) : y[M] > C ? (R = q[oe + y[M]], F[$ + y[M]]) : (R = 96, 0), p = 1 << E - ne, w = _ = 1 << Y; h[x + (B >> ne) + (_ -= p)] = P << 24 | R << 16 | S | 0, _ !== 0; ) ;
            for (p = 1 << E - 1; B & p; ) p >>= 1;
            if (p !== 0 ? (B &= p - 1, B += p) : B = 0, M++, --L[E] == 0) {
              if (E === G) break;
              E = f[g + y[M]];
            }
            if (ee < E && (B & v) !== T) {
              for (ne === 0 && (ne = ee), x += w, Z = 1 << (Y = E - ne); Y + ne < G && !((Z -= L[Y + ne]) <= 0); ) Y++, Z <<= 1;
              if (Q += 1 << Y, o === 1 && 852 < Q || o === 2 && 592 < Q) return 1;
              h[T = B & v] = ee << 24 | Y << 16 | x - u | 0;
            }
          }
          return B !== 0 && (h[x + B] = E - ne << 24 | 64 << 16 | 0), m.bits = ee, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(t, i, a) {
        i.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(t, i, a) {
        var s = t("../utils/common"), l = 0, A = 1;
        function c(I) {
          for (var U = I.length; 0 <= --U; ) I[U] = 0;
        }
        var n = 0, o = 29, f = 256, g = f + 1 + o, d = 30, h = 19, u = 2 * g + 1, y = 15, m = 16, p = 7, _ = 256, T = 16, v = 17, x = 18, C = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], P = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], O = new Array(2 * (g + 2));
        c(O);
        var E = new Array(2 * d);
        c(E);
        var M = new Array(512);
        c(M);
        var w = new Array(256);
        c(w);
        var G = new Array(o);
        c(G);
        var ee, Y, ne, Z = new Array(d);
        function Q(I, U, K, J, V) {
          this.static_tree = I, this.extra_bits = U, this.extra_base = K, this.elems = J, this.max_length = V, this.has_stree = I && I.length;
        }
        function B(I, U) {
          this.dyn_tree = I, this.max_code = 0, this.stat_desc = U;
        }
        function F(I) {
          return I < 256 ? M[I] : M[256 + (I >>> 7)];
        }
        function $(I, U) {
          I.pending_buf[I.pending++] = 255 & U, I.pending_buf[I.pending++] = U >>> 8 & 255;
        }
        function L(I, U, K) {
          I.bi_valid > m - K ? (I.bi_buf |= U << I.bi_valid & 65535, $(I, I.bi_buf), I.bi_buf = U >> m - I.bi_valid, I.bi_valid += K - m) : (I.bi_buf |= U << I.bi_valid & 65535, I.bi_valid += K);
        }
        function N(I, U, K) {
          L(I, K[2 * U], K[2 * U + 1]);
        }
        function q(I, U) {
          for (var K = 0; K |= 1 & I, I >>>= 1, K <<= 1, 0 < --U; ) ;
          return K >>> 1;
        }
        function oe(I, U, K) {
          var J, V, te = new Array(y + 1), se = 0;
          for (J = 1; J <= y; J++) te[J] = se = se + K[J - 1] << 1;
          for (V = 0; V <= U; V++) {
            var ie = I[2 * V + 1];
            ie !== 0 && (I[2 * V] = q(te[ie]++, ie));
          }
        }
        function ae(I) {
          var U;
          for (U = 0; U < g; U++) I.dyn_ltree[2 * U] = 0;
          for (U = 0; U < d; U++) I.dyn_dtree[2 * U] = 0;
          for (U = 0; U < h; U++) I.bl_tree[2 * U] = 0;
          I.dyn_ltree[2 * _] = 1, I.opt_len = I.static_len = 0, I.last_lit = I.matches = 0;
        }
        function le(I) {
          8 < I.bi_valid ? $(I, I.bi_buf) : 0 < I.bi_valid && (I.pending_buf[I.pending++] = I.bi_buf), I.bi_buf = 0, I.bi_valid = 0;
        }
        function Ae(I, U, K, J) {
          var V = 2 * U, te = 2 * K;
          return I[V] < I[te] || I[V] === I[te] && J[U] <= J[K];
        }
        function z(I, U, K) {
          for (var J = I.heap[K], V = K << 1; V <= I.heap_len && (V < I.heap_len && Ae(U, I.heap[V + 1], I.heap[V], I.depth) && V++, !Ae(U, J, I.heap[V], I.depth)); ) I.heap[K] = I.heap[V], K = V, V <<= 1;
          I.heap[K] = J;
        }
        function W(I, U, K) {
          var J, V, te, se, ie = 0;
          if (I.last_lit !== 0) for (; J = I.pending_buf[I.d_buf + 2 * ie] << 8 | I.pending_buf[I.d_buf + 2 * ie + 1], V = I.pending_buf[I.l_buf + ie], ie++, J === 0 ? N(I, V, U) : (N(I, (te = w[V]) + f + 1, U), (se = C[te]) !== 0 && L(I, V -= G[te], se), N(I, te = F(--J), K), (se = P[te]) !== 0 && L(I, J -= Z[te], se)), ie < I.last_lit; ) ;
          N(I, _, U);
        }
        function j(I, U) {
          var K, J, V, te = U.dyn_tree, se = U.stat_desc.static_tree, ie = U.stat_desc.has_stree, ce = U.stat_desc.elems, Te = -1;
          for (I.heap_len = 0, I.heap_max = u, K = 0; K < ce; K++) te[2 * K] !== 0 ? (I.heap[++I.heap_len] = Te = K, I.depth[K] = 0) : te[2 * K + 1] = 0;
          for (; I.heap_len < 2; ) te[2 * (V = I.heap[++I.heap_len] = Te < 2 ? ++Te : 0)] = 1, I.depth[V] = 0, I.opt_len--, ie && (I.static_len -= se[2 * V + 1]);
          for (U.max_code = Te, K = I.heap_len >> 1; 1 <= K; K--) z(I, te, K);
          for (V = ce; K = I.heap[1], I.heap[1] = I.heap[I.heap_len--], z(I, te, 1), J = I.heap[1], I.heap[--I.heap_max] = K, I.heap[--I.heap_max] = J, te[2 * V] = te[2 * K] + te[2 * J], I.depth[V] = (I.depth[K] >= I.depth[J] ? I.depth[K] : I.depth[J]) + 1, te[2 * K + 1] = te[2 * J + 1] = V, I.heap[1] = V++, z(I, te, 1), 2 <= I.heap_len; ) ;
          I.heap[--I.heap_max] = I.heap[1], (function(ye, Se) {
            var At, Qe, Pt, De, Yt, aa, Ye = Se.dyn_tree, Ya = Se.max_code, vo = Se.stat_desc.static_tree, bo = Se.stat_desc.has_stree, wo = Se.stat_desc.extra_bits, Ka = Se.stat_desc.extra_base, Nt = Se.stat_desc.max_length, Kt = 0;
            for (De = 0; De <= y; De++) ye.bl_count[De] = 0;
            for (Ye[2 * ye.heap[ye.heap_max] + 1] = 0, At = ye.heap_max + 1; At < u; At++) Nt < (De = Ye[2 * Ye[2 * (Qe = ye.heap[At]) + 1] + 1] + 1) && (De = Nt, Kt++), Ye[2 * Qe + 1] = De, Ya < Qe || (ye.bl_count[De]++, Yt = 0, Ka <= Qe && (Yt = wo[Qe - Ka]), aa = Ye[2 * Qe], ye.opt_len += aa * (De + Yt), bo && (ye.static_len += aa * (vo[2 * Qe + 1] + Yt)));
            if (Kt !== 0) {
              do {
                for (De = Nt - 1; ye.bl_count[De] === 0; ) De--;
                ye.bl_count[De]--, ye.bl_count[De + 1] += 2, ye.bl_count[Nt]--, Kt -= 2;
              } while (0 < Kt);
              for (De = Nt; De !== 0; De--) for (Qe = ye.bl_count[De]; Qe !== 0; ) Ya < (Pt = ye.heap[--At]) || (Ye[2 * Pt + 1] !== De && (ye.opt_len += (De - Ye[2 * Pt + 1]) * Ye[2 * Pt], Ye[2 * Pt + 1] = De), Qe--);
            }
          })(I, U), oe(te, Te, I.bl_count);
        }
        function b(I, U, K) {
          var J, V, te = -1, se = U[1], ie = 0, ce = 7, Te = 4;
          for (se === 0 && (ce = 138, Te = 3), U[2 * (K + 1) + 1] = 65535, J = 0; J <= K; J++) V = se, se = U[2 * (J + 1) + 1], ++ie < ce && V === se || (ie < Te ? I.bl_tree[2 * V] += ie : V !== 0 ? (V !== te && I.bl_tree[2 * V]++, I.bl_tree[2 * T]++) : ie <= 10 ? I.bl_tree[2 * v]++ : I.bl_tree[2 * x]++, te = V, Te = (ie = 0) === se ? (ce = 138, 3) : V === se ? (ce = 6, 3) : (ce = 7, 4));
        }
        function X(I, U, K) {
          var J, V, te = -1, se = U[1], ie = 0, ce = 7, Te = 4;
          for (se === 0 && (ce = 138, Te = 3), J = 0; J <= K; J++) if (V = se, se = U[2 * (J + 1) + 1], !(++ie < ce && V === se)) {
            if (ie < Te) for (; N(I, V, I.bl_tree), --ie != 0; ) ;
            else V !== 0 ? (V !== te && (N(I, V, I.bl_tree), ie--), N(I, T, I.bl_tree), L(I, ie - 3, 2)) : ie <= 10 ? (N(I, v, I.bl_tree), L(I, ie - 3, 3)) : (N(I, x, I.bl_tree), L(I, ie - 11, 7));
            te = V, Te = (ie = 0) === se ? (ce = 138, 3) : V === se ? (ce = 6, 3) : (ce = 7, 4);
          }
        }
        c(Z);
        var H = !1;
        function k(I, U, K, J) {
          L(I, (n << 1) + (J ? 1 : 0), 3), (function(V, te, se, ie) {
            le(V), $(V, se), $(V, ~se), s.arraySet(V.pending_buf, V.window, te, se, V.pending), V.pending += se;
          })(I, U, K);
        }
        a._tr_init = function(I) {
          H || ((function() {
            var U, K, J, V, te, se = new Array(y + 1);
            for (V = J = 0; V < o - 1; V++) for (G[V] = J, U = 0; U < 1 << C[V]; U++) w[J++] = V;
            for (w[J - 1] = V, V = te = 0; V < 16; V++) for (Z[V] = te, U = 0; U < 1 << P[V]; U++) M[te++] = V;
            for (te >>= 7; V < d; V++) for (Z[V] = te << 7, U = 0; U < 1 << P[V] - 7; U++) M[256 + te++] = V;
            for (K = 0; K <= y; K++) se[K] = 0;
            for (U = 0; U <= 143; ) O[2 * U + 1] = 8, U++, se[8]++;
            for (; U <= 255; ) O[2 * U + 1] = 9, U++, se[9]++;
            for (; U <= 279; ) O[2 * U + 1] = 7, U++, se[7]++;
            for (; U <= 287; ) O[2 * U + 1] = 8, U++, se[8]++;
            for (oe(O, g + 1, se), U = 0; U < d; U++) E[2 * U + 1] = 5, E[2 * U] = q(U, 5);
            ee = new Q(O, C, f + 1, g, y), Y = new Q(E, P, 0, d, y), ne = new Q(new Array(0), R, 0, h, p);
          })(), H = !0), I.l_desc = new B(I.dyn_ltree, ee), I.d_desc = new B(I.dyn_dtree, Y), I.bl_desc = new B(I.bl_tree, ne), I.bi_buf = 0, I.bi_valid = 0, ae(I);
        }, a._tr_stored_block = k, a._tr_flush_block = function(I, U, K, J) {
          var V, te, se = 0;
          0 < I.level ? (I.strm.data_type === 2 && (I.strm.data_type = (function(ie) {
            var ce, Te = 4093624447;
            for (ce = 0; ce <= 31; ce++, Te >>>= 1) if (1 & Te && ie.dyn_ltree[2 * ce] !== 0) return l;
            if (ie.dyn_ltree[18] !== 0 || ie.dyn_ltree[20] !== 0 || ie.dyn_ltree[26] !== 0) return A;
            for (ce = 32; ce < f; ce++) if (ie.dyn_ltree[2 * ce] !== 0) return A;
            return l;
          })(I)), j(I, I.l_desc), j(I, I.d_desc), se = (function(ie) {
            var ce;
            for (b(ie, ie.dyn_ltree, ie.l_desc.max_code), b(ie, ie.dyn_dtree, ie.d_desc.max_code), j(ie, ie.bl_desc), ce = h - 1; 3 <= ce && ie.bl_tree[2 * S[ce] + 1] === 0; ce--) ;
            return ie.opt_len += 3 * (ce + 1) + 5 + 5 + 4, ce;
          })(I), V = I.opt_len + 3 + 7 >>> 3, (te = I.static_len + 3 + 7 >>> 3) <= V && (V = te)) : V = te = K + 5, K + 4 <= V && U !== -1 ? k(I, U, K, J) : I.strategy === 4 || te === V ? (L(I, 2 + (J ? 1 : 0), 3), W(I, O, E)) : (L(I, 4 + (J ? 1 : 0), 3), (function(ie, ce, Te, ye) {
            var Se;
            for (L(ie, ce - 257, 5), L(ie, Te - 1, 5), L(ie, ye - 4, 4), Se = 0; Se < ye; Se++) L(ie, ie.bl_tree[2 * S[Se] + 1], 3);
            X(ie, ie.dyn_ltree, ce - 1), X(ie, ie.dyn_dtree, Te - 1);
          })(I, I.l_desc.max_code + 1, I.d_desc.max_code + 1, se + 1), W(I, I.dyn_ltree, I.dyn_dtree)), ae(I), J && le(I);
        }, a._tr_tally = function(I, U, K) {
          return I.pending_buf[I.d_buf + 2 * I.last_lit] = U >>> 8 & 255, I.pending_buf[I.d_buf + 2 * I.last_lit + 1] = 255 & U, I.pending_buf[I.l_buf + I.last_lit] = 255 & K, I.last_lit++, U === 0 ? I.dyn_ltree[2 * K]++ : (I.matches++, U--, I.dyn_ltree[2 * (w[K] + f + 1)]++, I.dyn_dtree[2 * F(U)]++), I.last_lit === I.lit_bufsize - 1;
        }, a._tr_align = function(I) {
          L(I, 2, 3), N(I, _, O), (function(U) {
            U.bi_valid === 16 ? ($(U, U.bi_buf), U.bi_buf = 0, U.bi_valid = 0) : 8 <= U.bi_valid && (U.pending_buf[U.pending++] = 255 & U.bi_buf, U.bi_buf >>= 8, U.bi_valid -= 8);
          })(I);
        };
      }, { "../utils/common": 41 }], 53: [function(t, i, a) {
        i.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(t, i, a) {
        (function(s) {
          (function(l, A) {
            if (!l.setImmediate) {
              var c, n, o, f, g = 1, d = {}, h = !1, u = l.document, y = Object.getPrototypeOf && Object.getPrototypeOf(l);
              y = y && y.setTimeout ? y : l, c = {}.toString.call(l.process) === "[object process]" ? function(T) {
                process.nextTick(function() {
                  p(T);
                });
              } : (function() {
                if (l.postMessage && !l.importScripts) {
                  var T = !0, v = l.onmessage;
                  return l.onmessage = function() {
                    T = !1;
                  }, l.postMessage("", "*"), l.onmessage = v, T;
                }
              })() ? (f = "setImmediate$" + Math.random() + "$", l.addEventListener ? l.addEventListener("message", _, !1) : l.attachEvent("onmessage", _), function(T) {
                l.postMessage(f + T, "*");
              }) : l.MessageChannel ? ((o = new MessageChannel()).port1.onmessage = function(T) {
                p(T.data);
              }, function(T) {
                o.port2.postMessage(T);
              }) : u && "onreadystatechange" in u.createElement("script") ? (n = u.documentElement, function(T) {
                var v = u.createElement("script");
                v.onreadystatechange = function() {
                  p(T), v.onreadystatechange = null, n.removeChild(v), v = null;
                }, n.appendChild(v);
              }) : function(T) {
                setTimeout(p, 0, T);
              }, y.setImmediate = function(T) {
                typeof T != "function" && (T = new Function("" + T));
                for (var v = new Array(arguments.length - 1), x = 0; x < v.length; x++) v[x] = arguments[x + 1];
                var C = { callback: T, args: v };
                return d[g] = C, c(g), g++;
              }, y.clearImmediate = m;
            }
            function m(T) {
              delete d[T];
            }
            function p(T) {
              if (h) setTimeout(p, 0, T);
              else {
                var v = d[T];
                if (v) {
                  h = !0;
                  try {
                    (function(x) {
                      var C = x.callback, P = x.args;
                      switch (P.length) {
                        case 0:
                          C();
                          break;
                        case 1:
                          C(P[0]);
                          break;
                        case 2:
                          C(P[0], P[1]);
                          break;
                        case 3:
                          C(P[0], P[1], P[2]);
                          break;
                        default:
                          C.apply(A, P);
                      }
                    })(v);
                  } finally {
                    m(T), h = !1;
                  }
                }
              }
            }
            function _(T) {
              T.source === l && typeof T.data == "string" && T.data.indexOf(f) === 0 && p(+T.data.slice(f.length));
            }
          })(typeof self > "u" ? s === void 0 ? this : s : self);
        }).call(this, typeof Jt < "u" ? Jt : typeof self < "u" ? self : typeof window < "u" ? window : {});
      }, {}] }, {}, [10])(10);
    });
  })(na)), na.exports;
}
var xo = _o();
const Ni = /* @__PURE__ */ Fa(xo);
function Ue(e, r, t, i) {
  function a(s) {
    return s instanceof t ? s : new t(function(l) {
      l(s);
    });
  }
  return new (t || (t = Promise))(function(s, l) {
    function A(o) {
      try {
        n(i.next(o));
      } catch (f) {
        l(f);
      }
    }
    function c(o) {
      try {
        n(i.throw(o));
      } catch (f) {
        l(f);
      }
    }
    function n(o) {
      o.done ? s(o.value) : a(o.value).then(A, c);
    }
    n((i = i.apply(e, [])).next());
  });
}
const he = 914400, Vt = 12700, Pe = `\r
`, Co = 2147483649, ia = /^[0-9a-fA-F]{6}$/, To = 1.67, Eo = 27, vt = { type: "solid", color: "666666", pt: 1 }, Ii = [0.05, 0.1, 0.05, 0.1], bt = { color: "363636", pt: 1 }, mt = { color: "888888", style: "solid", size: 1, cap: "flat" }, Oe = "000000", He = 12, Lo = 18, wt = "LAYOUT_16x9", Ea = "DEFAULT", Si = "333333", dt = { type: "outer", blur: 3, offset: 23e3 / 12700, angle: 90, color: "000000", opacity: 0.35, rotateWithShape: !0 }, Xt = [0.5, 0.5, 0.5, 0.5], Za = { color: "000000" }, Do = { size: 8, color: "FFFFFF", opacity: 0.75 }, tt = "2094734552", zr = "2094734553", Mt = "2094734554", La = "2094734555", ki = "2094734556", It = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), Ot = [
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
], Ro = [
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
var Ct;
(function(e) {
  e.left = "left", e.center = "center", e.right = "right", e.justify = "justify";
})(Ct || (Ct = {}));
var Tt;
(function(e) {
  e.b = "b", e.ctr = "ctr", e.t = "t";
})(Tt || (Tt = {}));
const Fi = "{F7021451-1387-4CA6-816F-3879F97B5CBC}";
var Da;
(function(e) {
  e.arraybuffer = "arraybuffer", e.base64 = "base64", e.binarystring = "binarystring", e.blob = "blob", e.nodebuffer = "nodebuffer", e.uint8array = "uint8array";
})(Da || (Da = {}));
var Ra;
(function(e) {
  e.area = "area", e.bar = "bar", e.bar3d = "bar3D", e.bubble = "bubble", e.bubble3d = "bubble3D", e.doughnut = "doughnut", e.line = "line", e.pie = "pie", e.radar = "radar", e.scatter = "scatter";
})(Ra || (Ra = {}));
var Ba;
(function(e) {
  e.accentBorderCallout1 = "accentBorderCallout1", e.accentBorderCallout2 = "accentBorderCallout2", e.accentBorderCallout3 = "accentBorderCallout3", e.accentCallout1 = "accentCallout1", e.accentCallout2 = "accentCallout2", e.accentCallout3 = "accentCallout3", e.actionButtonBackPrevious = "actionButtonBackPrevious", e.actionButtonBeginning = "actionButtonBeginning", e.actionButtonBlank = "actionButtonBlank", e.actionButtonDocument = "actionButtonDocument", e.actionButtonEnd = "actionButtonEnd", e.actionButtonForwardNext = "actionButtonForwardNext", e.actionButtonHelp = "actionButtonHelp", e.actionButtonHome = "actionButtonHome", e.actionButtonInformation = "actionButtonInformation", e.actionButtonMovie = "actionButtonMovie", e.actionButtonReturn = "actionButtonReturn", e.actionButtonSound = "actionButtonSound", e.arc = "arc", e.bentArrow = "bentArrow", e.bentUpArrow = "bentUpArrow", e.bevel = "bevel", e.blockArc = "blockArc", e.borderCallout1 = "borderCallout1", e.borderCallout2 = "borderCallout2", e.borderCallout3 = "borderCallout3", e.bracePair = "bracePair", e.bracketPair = "bracketPair", e.callout1 = "callout1", e.callout2 = "callout2", e.callout3 = "callout3", e.can = "can", e.chartPlus = "chartPlus", e.chartStar = "chartStar", e.chartX = "chartX", e.chevron = "chevron", e.chord = "chord", e.circularArrow = "circularArrow", e.cloud = "cloud", e.cloudCallout = "cloudCallout", e.corner = "corner", e.cornerTabs = "cornerTabs", e.cube = "cube", e.curvedDownArrow = "curvedDownArrow", e.curvedLeftArrow = "curvedLeftArrow", e.curvedRightArrow = "curvedRightArrow", e.curvedUpArrow = "curvedUpArrow", e.custGeom = "custGeom", e.decagon = "decagon", e.diagStripe = "diagStripe", e.diamond = "diamond", e.dodecagon = "dodecagon", e.donut = "donut", e.doubleWave = "doubleWave", e.downArrow = "downArrow", e.downArrowCallout = "downArrowCallout", e.ellipse = "ellipse", e.ellipseRibbon = "ellipseRibbon", e.ellipseRibbon2 = "ellipseRibbon2", e.flowChartAlternateProcess = "flowChartAlternateProcess", e.flowChartCollate = "flowChartCollate", e.flowChartConnector = "flowChartConnector", e.flowChartDecision = "flowChartDecision", e.flowChartDelay = "flowChartDelay", e.flowChartDisplay = "flowChartDisplay", e.flowChartDocument = "flowChartDocument", e.flowChartExtract = "flowChartExtract", e.flowChartInputOutput = "flowChartInputOutput", e.flowChartInternalStorage = "flowChartInternalStorage", e.flowChartMagneticDisk = "flowChartMagneticDisk", e.flowChartMagneticDrum = "flowChartMagneticDrum", e.flowChartMagneticTape = "flowChartMagneticTape", e.flowChartManualInput = "flowChartManualInput", e.flowChartManualOperation = "flowChartManualOperation", e.flowChartMerge = "flowChartMerge", e.flowChartMultidocument = "flowChartMultidocument", e.flowChartOfflineStorage = "flowChartOfflineStorage", e.flowChartOffpageConnector = "flowChartOffpageConnector", e.flowChartOnlineStorage = "flowChartOnlineStorage", e.flowChartOr = "flowChartOr", e.flowChartPredefinedProcess = "flowChartPredefinedProcess", e.flowChartPreparation = "flowChartPreparation", e.flowChartProcess = "flowChartProcess", e.flowChartPunchedCard = "flowChartPunchedCard", e.flowChartPunchedTape = "flowChartPunchedTape", e.flowChartSort = "flowChartSort", e.flowChartSummingJunction = "flowChartSummingJunction", e.flowChartTerminator = "flowChartTerminator", e.folderCorner = "folderCorner", e.frame = "frame", e.funnel = "funnel", e.gear6 = "gear6", e.gear9 = "gear9", e.halfFrame = "halfFrame", e.heart = "heart", e.heptagon = "heptagon", e.hexagon = "hexagon", e.homePlate = "homePlate", e.horizontalScroll = "horizontalScroll", e.irregularSeal1 = "irregularSeal1", e.irregularSeal2 = "irregularSeal2", e.leftArrow = "leftArrow", e.leftArrowCallout = "leftArrowCallout", e.leftBrace = "leftBrace", e.leftBracket = "leftBracket", e.leftCircularArrow = "leftCircularArrow", e.leftRightArrow = "leftRightArrow", e.leftRightArrowCallout = "leftRightArrowCallout", e.leftRightCircularArrow = "leftRightCircularArrow", e.leftRightRibbon = "leftRightRibbon", e.leftRightUpArrow = "leftRightUpArrow", e.leftUpArrow = "leftUpArrow", e.lightningBolt = "lightningBolt", e.line = "line", e.lineInv = "lineInv", e.mathDivide = "mathDivide", e.mathEqual = "mathEqual", e.mathMinus = "mathMinus", e.mathMultiply = "mathMultiply", e.mathNotEqual = "mathNotEqual", e.mathPlus = "mathPlus", e.moon = "moon", e.noSmoking = "noSmoking", e.nonIsoscelesTrapezoid = "nonIsoscelesTrapezoid", e.notchedRightArrow = "notchedRightArrow", e.octagon = "octagon", e.parallelogram = "parallelogram", e.pentagon = "pentagon", e.pie = "pie", e.pieWedge = "pieWedge", e.plaque = "plaque", e.plaqueTabs = "plaqueTabs", e.plus = "plus", e.quadArrow = "quadArrow", e.quadArrowCallout = "quadArrowCallout", e.rect = "rect", e.ribbon = "ribbon", e.ribbon2 = "ribbon2", e.rightArrow = "rightArrow", e.rightArrowCallout = "rightArrowCallout", e.rightBrace = "rightBrace", e.rightBracket = "rightBracket", e.round1Rect = "round1Rect", e.round2DiagRect = "round2DiagRect", e.round2SameRect = "round2SameRect", e.roundRect = "roundRect", e.rtTriangle = "rtTriangle", e.smileyFace = "smileyFace", e.snip1Rect = "snip1Rect", e.snip2DiagRect = "snip2DiagRect", e.snip2SameRect = "snip2SameRect", e.snipRoundRect = "snipRoundRect", e.squareTabs = "squareTabs", e.star10 = "star10", e.star12 = "star12", e.star16 = "star16", e.star24 = "star24", e.star32 = "star32", e.star4 = "star4", e.star5 = "star5", e.star6 = "star6", e.star7 = "star7", e.star8 = "star8", e.stripedRightArrow = "stripedRightArrow", e.sun = "sun", e.swooshArrow = "swooshArrow", e.teardrop = "teardrop", e.trapezoid = "trapezoid", e.triangle = "triangle", e.upArrow = "upArrow", e.upArrowCallout = "upArrowCallout", e.upDownArrow = "upDownArrow", e.upDownArrowCallout = "upDownArrowCallout", e.uturnArrow = "uturnArrow", e.verticalScroll = "verticalScroll", e.wave = "wave", e.wedgeEllipseCallout = "wedgeEllipseCallout", e.wedgeRectCallout = "wedgeRectCallout", e.wedgeRoundRectCallout = "wedgeRoundRectCallout";
})(Ba || (Ba = {}));
var ze;
(function(e) {
  e.text1 = "tx1", e.text2 = "tx2", e.background1 = "bg1", e.background2 = "bg2", e.accent1 = "accent1", e.accent2 = "accent2", e.accent3 = "accent3", e.accent4 = "accent4", e.accent5 = "accent5", e.accent6 = "accent6";
})(ze || (ze = {}));
var Pa;
(function(e) {
  e.left = "left", e.center = "center", e.right = "right", e.justify = "justify";
})(Pa || (Pa = {}));
var Na;
(function(e) {
  e.top = "top", e.middle = "middle", e.bottom = "bottom";
})(Na || (Na = {}));
var ot;
(function(e) {
  e.ACTION_BUTTON_BACK_OR_PREVIOUS = "actionButtonBackPrevious", e.ACTION_BUTTON_BEGINNING = "actionButtonBeginning", e.ACTION_BUTTON_CUSTOM = "actionButtonBlank", e.ACTION_BUTTON_DOCUMENT = "actionButtonDocument", e.ACTION_BUTTON_END = "actionButtonEnd", e.ACTION_BUTTON_FORWARD_OR_NEXT = "actionButtonForwardNext", e.ACTION_BUTTON_HELP = "actionButtonHelp", e.ACTION_BUTTON_HOME = "actionButtonHome", e.ACTION_BUTTON_INFORMATION = "actionButtonInformation", e.ACTION_BUTTON_MOVIE = "actionButtonMovie", e.ACTION_BUTTON_RETURN = "actionButtonReturn", e.ACTION_BUTTON_SOUND = "actionButtonSound", e.ARC = "arc", e.BALLOON = "wedgeRoundRectCallout", e.BENT_ARROW = "bentArrow", e.BENT_UP_ARROW = "bentUpArrow", e.BEVEL = "bevel", e.BLOCK_ARC = "blockArc", e.CAN = "can", e.CHART_PLUS = "chartPlus", e.CHART_STAR = "chartStar", e.CHART_X = "chartX", e.CHEVRON = "chevron", e.CHORD = "chord", e.CIRCULAR_ARROW = "circularArrow", e.CLOUD = "cloud", e.CLOUD_CALLOUT = "cloudCallout", e.CORNER = "corner", e.CORNER_TABS = "cornerTabs", e.CROSS = "plus", e.CUBE = "cube", e.CURVED_DOWN_ARROW = "curvedDownArrow", e.CURVED_DOWN_RIBBON = "ellipseRibbon", e.CURVED_LEFT_ARROW = "curvedLeftArrow", e.CURVED_RIGHT_ARROW = "curvedRightArrow", e.CURVED_UP_ARROW = "curvedUpArrow", e.CURVED_UP_RIBBON = "ellipseRibbon2", e.CUSTOM_GEOMETRY = "custGeom", e.DECAGON = "decagon", e.DIAGONAL_STRIPE = "diagStripe", e.DIAMOND = "diamond", e.DODECAGON = "dodecagon", e.DONUT = "donut", e.DOUBLE_BRACE = "bracePair", e.DOUBLE_BRACKET = "bracketPair", e.DOUBLE_WAVE = "doubleWave", e.DOWN_ARROW = "downArrow", e.DOWN_ARROW_CALLOUT = "downArrowCallout", e.DOWN_RIBBON = "ribbon", e.EXPLOSION1 = "irregularSeal1", e.EXPLOSION2 = "irregularSeal2", e.FLOWCHART_ALTERNATE_PROCESS = "flowChartAlternateProcess", e.FLOWCHART_CARD = "flowChartPunchedCard", e.FLOWCHART_COLLATE = "flowChartCollate", e.FLOWCHART_CONNECTOR = "flowChartConnector", e.FLOWCHART_DATA = "flowChartInputOutput", e.FLOWCHART_DECISION = "flowChartDecision", e.FLOWCHART_DELAY = "flowChartDelay", e.FLOWCHART_DIRECT_ACCESS_STORAGE = "flowChartMagneticDrum", e.FLOWCHART_DISPLAY = "flowChartDisplay", e.FLOWCHART_DOCUMENT = "flowChartDocument", e.FLOWCHART_EXTRACT = "flowChartExtract", e.FLOWCHART_INTERNAL_STORAGE = "flowChartInternalStorage", e.FLOWCHART_MAGNETIC_DISK = "flowChartMagneticDisk", e.FLOWCHART_MANUAL_INPUT = "flowChartManualInput", e.FLOWCHART_MANUAL_OPERATION = "flowChartManualOperation", e.FLOWCHART_MERGE = "flowChartMerge", e.FLOWCHART_MULTIDOCUMENT = "flowChartMultidocument", e.FLOWCHART_OFFLINE_STORAGE = "flowChartOfflineStorage", e.FLOWCHART_OFFPAGE_CONNECTOR = "flowChartOffpageConnector", e.FLOWCHART_OR = "flowChartOr", e.FLOWCHART_PREDEFINED_PROCESS = "flowChartPredefinedProcess", e.FLOWCHART_PREPARATION = "flowChartPreparation", e.FLOWCHART_PROCESS = "flowChartProcess", e.FLOWCHART_PUNCHED_TAPE = "flowChartPunchedTape", e.FLOWCHART_SEQUENTIAL_ACCESS_STORAGE = "flowChartMagneticTape", e.FLOWCHART_SORT = "flowChartSort", e.FLOWCHART_STORED_DATA = "flowChartOnlineStorage", e.FLOWCHART_SUMMING_JUNCTION = "flowChartSummingJunction", e.FLOWCHART_TERMINATOR = "flowChartTerminator", e.FOLDED_CORNER = "folderCorner", e.FRAME = "frame", e.FUNNEL = "funnel", e.GEAR_6 = "gear6", e.GEAR_9 = "gear9", e.HALF_FRAME = "halfFrame", e.HEART = "heart", e.HEPTAGON = "heptagon", e.HEXAGON = "hexagon", e.HORIZONTAL_SCROLL = "horizontalScroll", e.ISOSCELES_TRIANGLE = "triangle", e.LEFT_ARROW = "leftArrow", e.LEFT_ARROW_CALLOUT = "leftArrowCallout", e.LEFT_BRACE = "leftBrace", e.LEFT_BRACKET = "leftBracket", e.LEFT_CIRCULAR_ARROW = "leftCircularArrow", e.LEFT_RIGHT_ARROW = "leftRightArrow", e.LEFT_RIGHT_ARROW_CALLOUT = "leftRightArrowCallout", e.LEFT_RIGHT_CIRCULAR_ARROW = "leftRightCircularArrow", e.LEFT_RIGHT_RIBBON = "leftRightRibbon", e.LEFT_RIGHT_UP_ARROW = "leftRightUpArrow", e.LEFT_UP_ARROW = "leftUpArrow", e.LIGHTNING_BOLT = "lightningBolt", e.LINE_CALLOUT_1 = "borderCallout1", e.LINE_CALLOUT_1_ACCENT_BAR = "accentCallout1", e.LINE_CALLOUT_1_BORDER_AND_ACCENT_BAR = "accentBorderCallout1", e.LINE_CALLOUT_1_NO_BORDER = "callout1", e.LINE_CALLOUT_2 = "borderCallout2", e.LINE_CALLOUT_2_ACCENT_BAR = "accentCallout2", e.LINE_CALLOUT_2_BORDER_AND_ACCENT_BAR = "accentBorderCallout2", e.LINE_CALLOUT_2_NO_BORDER = "callout2", e.LINE_CALLOUT_3 = "borderCallout3", e.LINE_CALLOUT_3_ACCENT_BAR = "accentCallout3", e.LINE_CALLOUT_3_BORDER_AND_ACCENT_BAR = "accentBorderCallout3", e.LINE_CALLOUT_3_NO_BORDER = "callout3", e.LINE_CALLOUT_4 = "borderCallout4", e.LINE_CALLOUT_4_ACCENT_BAR = "accentCallout3=4", e.LINE_CALLOUT_4_BORDER_AND_ACCENT_BAR = "accentBorderCallout4", e.LINE_CALLOUT_4_NO_BORDER = "callout4", e.LINE = "line", e.LINE_INVERSE = "lineInv", e.MATH_DIVIDE = "mathDivide", e.MATH_EQUAL = "mathEqual", e.MATH_MINUS = "mathMinus", e.MATH_MULTIPLY = "mathMultiply", e.MATH_NOT_EQUAL = "mathNotEqual", e.MATH_PLUS = "mathPlus", e.MOON = "moon", e.NON_ISOSCELES_TRAPEZOID = "nonIsoscelesTrapezoid", e.NOTCHED_RIGHT_ARROW = "notchedRightArrow", e.NO_SYMBOL = "noSmoking", e.OCTAGON = "octagon", e.OVAL = "ellipse", e.OVAL_CALLOUT = "wedgeEllipseCallout", e.PARALLELOGRAM = "parallelogram", e.PENTAGON = "homePlate", e.PIE = "pie", e.PIE_WEDGE = "pieWedge", e.PLAQUE = "plaque", e.PLAQUE_TABS = "plaqueTabs", e.QUAD_ARROW = "quadArrow", e.QUAD_ARROW_CALLOUT = "quadArrowCallout", e.RECTANGLE = "rect", e.RECTANGULAR_CALLOUT = "wedgeRectCallout", e.REGULAR_PENTAGON = "pentagon", e.RIGHT_ARROW = "rightArrow", e.RIGHT_ARROW_CALLOUT = "rightArrowCallout", e.RIGHT_BRACE = "rightBrace", e.RIGHT_BRACKET = "rightBracket", e.RIGHT_TRIANGLE = "rtTriangle", e.ROUNDED_RECTANGLE = "roundRect", e.ROUNDED_RECTANGULAR_CALLOUT = "wedgeRoundRectCallout", e.ROUND_1_RECTANGLE = "round1Rect", e.ROUND_2_DIAG_RECTANGLE = "round2DiagRect", e.ROUND_2_SAME_RECTANGLE = "round2SameRect", e.SMILEY_FACE = "smileyFace", e.SNIP_1_RECTANGLE = "snip1Rect", e.SNIP_2_DIAG_RECTANGLE = "snip2DiagRect", e.SNIP_2_SAME_RECTANGLE = "snip2SameRect", e.SNIP_ROUND_RECTANGLE = "snipRoundRect", e.SQUARE_TABS = "squareTabs", e.STAR_10_POINT = "star10", e.STAR_12_POINT = "star12", e.STAR_16_POINT = "star16", e.STAR_24_POINT = "star24", e.STAR_32_POINT = "star32", e.STAR_4_POINT = "star4", e.STAR_5_POINT = "star5", e.STAR_6_POINT = "star6", e.STAR_7_POINT = "star7", e.STAR_8_POINT = "star8", e.STRIPED_RIGHT_ARROW = "stripedRightArrow", e.SUN = "sun", e.SWOOSH_ARROW = "swooshArrow", e.TEAR = "teardrop", e.TRAPEZOID = "trapezoid", e.UP_ARROW = "upArrow", e.UP_ARROW_CALLOUT = "upArrowCallout", e.UP_DOWN_ARROW = "upDownArrow", e.UP_DOWN_ARROW_CALLOUT = "upDownArrowCallout", e.UP_RIBBON = "ribbon2", e.U_TURN_ARROW = "uturnArrow", e.VERTICAL_SCROLL = "verticalScroll", e.WAVE = "wave";
})(ot || (ot = {}));
var re;
(function(e) {
  e.AREA = "area", e.BAR = "bar", e.BAR3D = "bar3D", e.BUBBLE = "bubble", e.BUBBLE3D = "bubble3D", e.DOUGHNUT = "doughnut", e.LINE = "line", e.PIE = "pie", e.RADAR = "radar", e.SCATTER = "scatter";
})(re || (re = {}));
var Xr;
(function(e) {
  e.TEXT1 = "tx1", e.TEXT2 = "tx2", e.BACKGROUND1 = "bg1", e.BACKGROUND2 = "bg2", e.ACCENT1 = "accent1", e.ACCENT2 = "accent2", e.ACCENT3 = "accent3", e.ACCENT4 = "accent4", e.ACCENT5 = "accent5", e.ACCENT6 = "accent6";
})(Xr || (Xr = {}));
var it;
(function(e) {
  e.chart = "chart", e.image = "image", e.line = "line", e.rect = "rect", e.text = "text", e.placeholder = "placeholder";
})(it || (it = {}));
var ue;
(function(e) {
  e.chart = "chart", e.hyperlink = "hyperlink", e.image = "image", e.media = "media", e.online = "online", e.placeholder = "placeholder", e.table = "table", e.tablecell = "tablecell", e.text = "text", e.notes = "notes";
})(ue || (ue = {}));
var zt;
(function(e) {
  e.title = "title", e.body = "body", e.image = "pic", e.chart = "chart", e.table = "tbl", e.media = "media";
})(zt || (zt = {}));
var Et;
(function(e) {
  e.DEFAULT = "&#x2022;", e.CHECK = "&#x2713;", e.STAR = "&#x2605;", e.TRIANGLE = "&#x25B6;";
})(Et || (Et = {}));
const Lt = "data:image/png;base64,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", Bo = "data:image/png;base64,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AAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKSEAhgAAAAAAAAgJRTAAAAAAAAAACmhAAYAAAAAAABICQUwAAAAAAAAQEoogAEAAAAAAABSQgEMAAAAAAAAkBIKYAAAAAAAAICUUAADAAAAAAAApIQCGAAAAAAAACAlFMAAAAAAAAAAKaEABgAAAAAAAEgJBTAAAAAAAABASiiAAQAAAAAAAFJCAQwAAAAAAACQEgpgAAAAAAAAgJRQAAMAAAAAAACkhAIYAAAAAAAAICUUwAAAAAAAAAApoQAGAAAAAAAASAkFMAAAAAAAAEBKKIABAAAAAAAAUkIBDAAAAAAAAJASCmAAAAAAAACAlFAAAwAAAAAAAKREkRUAAACwrUpLSwuGDRvWfMCAAS26du3avKysrLiioqKkZcuWzZs1a1bcvHnz0tLS0rJsNtusuLi4ebNmzUoLCgo+8/eijY2N9Zs3b66pra2tqqur21xTU1NdVVVVs2nTptqNGzdWbdiwoeYvf/nL5hUrVlQtWLBgw6xZs6pqamoaJQYAAEDaKYABAACIiIghQ4aUHnTQQW379u3bql27dq3at2/fpkWLFq2bN29eWVpa2qpZs2bNCwsLm2ez2fLCwsLyoqKi8sLCwtKknK+hoaG6vr6+qqGh4S91dXV/aWhoqNq8eXNVTU3NuqqqqvUbNmxYu2rVqjWrV69e99Zbb6177rnnPpgzZ06NTwYAAABJogAGAADIA8OGDWt+xBFHdBwwYECnLl26dGjdunXHFi1adCgtLe1YUlLSvlmzZq0KCgqK07yDwsLCssLCwrKIaPdp/zuNjY21mzdvXrdp06ZVNTU172/YsGHl2rVr31+2bNnKBQsWrHjyySffnzVrVpVPGAAAAE1Fpuexsd9HfaF+ZcSal0ptCAAAIAE6deqUPf744zvtueeeXbp3796lbdu2XSorKzuXlpZ2KS0t7VBYWFhhSztGQ0PDxpqampU1NTXL169fv+yDDz5Y9s477yybPXv2sj/96U8rVqxYUWdLAAAAbE9t9q6Jog4f/TUFMAAAQEJks9nMt7/97Y4jRozo1bdv397t2rXrXl5e3rWsrKxzcXFx+4gosKUmp7G2tnZVTU3Nso0bNy5btWrV0tdff/2tJ598cvG999672noAAADYFgpgAACAhPne977X6a9Fb/v27Xu1bNmyV1lZWa8kvXOXLauvr9/wl7/8ZdG6desWL1u2bNHChQsX/fGPf1w8derUjbYDAADAliiAAQAAmqhsNps59dRTuxx66KH9+/Tp87n27dv3Ly8v719UVOSRzXlq06ZNKzZu3Pj6+++//8abb775xqOPPvrG3XffvcpmAAAA+CsFMAAAQBNx6qmndvniF784qHfv3v3btWv3uYqKis8VFhaW2wxbUl9fv37Dhg1vfPDBB68vXrz4jccee2z+jTfeuNxmAAAA8pMCGAAAYBc45phjWn/rW9/aq3///kPatGnTv6Kiop9HOLO9NDQ0VG/cuPGtNWvWLFy4cOGcO+6445WHHnporc0AAACknwIYAABgJzjjjDO6f+lLX9qrV69eg1u3bj2orKysR0RkbIadJFddXb103bp18xcvXjz30UcffeXqq69+x1oAAADSRwEMAACwnZWWlhb86le/2u3QQw8d1r17931btmw5qLCwsMxmaEoaGhqqP/zww/nvvPPOzGeeeWbW2LFj36ipqWm0GQAAgGRTAAMAAGwHP/7xj7t+9atf3bdXr15D27Ztu1c2m21jKyRJXV3dmg8++OCVRYsWvfznP/95xh/+8IdltgIAAJA8CmAAAIBtcOKJJ7Y75ZRTDujXr9+w1q1bD81ms61shTSpq6tbt3bt2pfffPPNWbfccsvUe++9d7WtAAAANH0KYAAAgE+hoqKi4IILLhg0YsSI/bp27bpfy5YtB2YymUKbIR/kcrmGDz/8cP6777474/nnn59x4YUXvrZx40aPiwYAAGiCFMAAAAAf4/jjj2/7/e9//8D+/fsf2Lp1630KCgpKbAUiGhsbN61fv37eW2+9NeWGG2545u67715lKwAAAE2DAhgAAOB/ZLPZzAUXXPC5I4888sDu3bsfWFFRsVtEFNgMbFl1dfWSd999d8qsWbNmnnvuuS+vW7euwVYAAAB2DQUwAACQ10pLSwsuvfTSQYcccsjBXbt2HVFWVtbDVmDb1dbWrnr//fdfmDp16uRf/vKXL65evbreVgAAAHYeBTAAAJB3Bg0aVHrBBRd8fs899zywQ4cOBxQVFbWwFdj+Ghsba9euXTtrzpw5T59//vmTX3755WpbAQAA2LEUwAAAQF4YNmxY8/POO+/gIUOGHOZ9vrDz/W0ZfNFFFz07a9asKlsBAADY/hTAAABAarVq1arwyiuv3HfEiBEjO3TocFBhYWGZrcCu19DQUP3+++8/O2XKlIk/+clPZm7cuLHRVgAAALYPBTAAAJAqrVq1Kvztb3+7/3777Xd4x44dRxQWFpbbCjRdDQ0NG99///0pM2bMeOqHP/zhC8pgAACAz0YBDAAApMJZZ53V45vf/OaRvXr1GllaWtrVRiB5ampq3l28ePHEO++8c9LVV1/9jo0AAABsPQUwAACQWMOHDy+/6KKLvjB48OCjW7RoMdBGID0+/PDDV+fNmzfhvPPOe3L69Ol/sREAAIBPRwEMAAAkSqtWrQpvuOGGQ/bbb79/atOmzX6ZTCZrK5BeuVyubs2aNTNmzJjx2JgxYyavW7euwVYAAAA+ngIYAABIhB//+Mddv/e9732lZ8+e/1RcXNzWRiD/1NbWfvD2228/dssttzz029/+9l0bAQAA+L8UwAAAQJNVUVFRcO21137+4IMPPrZ169b7ZTKZAlsBIqJxzZo1M59//vnxp5122hR3BQMAAPx/CmAAAKDJOeWUUzqefvrpx/bu3ftL2Wy2jY0AH6e+vn7j0qVLH/vd7373x+uvv36ZjQAAAPlOAQwAADQJ2Ww2c+uttx5wyCGHnNC6deu9I8LdvsDWaFy7du1L06ZN+/OPfvSjZ1evXl1vJQAAQD5SAAMAALtU//79S6655pp/2nPPPY8tLy/vayPAZ1VTU7NswYIF488999wHp06dutFGAACAfKIABgAAdomf//znPU855ZQTu3btemRhYWGZjQDbW2NjY92KFSuevOWWW+689NJLF9kIAACQDxTAAADATuMxz8Cusn79+rlPP/30f5188slT6+rqcjYCAACklQIYAADY4fr27Vv8hz/84a+Pee5nI8CuUlNT8+68efPu/8EPfvDgwoULN9kIAACQNgpgAABghxkyZEjpNddc89XBgwefWFxc3MFGgKaitrZ21dy5c+/5yU9+8uc5c+bU2AgAAJAWWyqAPYoNAADYJqNHj+4wb968n06ZMuXRYcOGnaH8BZqa4uLi9sOGDTtjypQpj86bN++nJ510UntbAQAA0s4dwAAAwFY599xze33/+9//dufOnY/IZDJZGwGSIpfL1S1fvvzJG2644fbLLrvsbRsBAACSyiOgAQCAz+y8887r+53vfOfbHTt2PDyTyRTaCJBUuVyuYcWKFU/cdNNN//XrX/96sY0AAABJowAGAAC22WWXXTboG9/4xg9at249zDaAtFm7du2su++++9pzzjnnNdsAAACSQgEMAABsNcUvkE8UwQAAQJIogAEAgE9N8Qvks7Vr18665557rvv5z38+3zYAAICmaksFcGHlwOj6UV9orIqoWZG1PQAAyBO/+MUvet9xxx3nHHrooT8pLS3tYiNAPiotLe2y7777HvP973+/X1lZ2ZIpU6assxUAAKCpKetcHwXlH/01BTAAAOS5M844o/u99957zpe//OWflZeX94qIjK0AeS5TXl7e8+CDDx71/e9/v3dEvDVjxowPrQUAAGgqFMAAAMD/ceKJJ7a77777fjJq1Kh/KS8v7xOKX4B/lCkvL+99+OGHj/rWt77VfvXq1Qvnz59fbS0AAMCutqUC2DuAAQAgzwwdOrTs+uuvP6l///4nFRYWltkI20NjY2Ns2rQpqquro6amJurr62PTpk2xefPmqK+vj+rq6qivr4/NmzfHpk2boqGhYZv/fxUWFkZJSUk0a9YsioqKoqysLIqKiqJZs2ZRUlISRUVFUVpa+r9/FRQUCIjtoqGhoeq11167a8yYMffMmTOnxkYAAIBdZUvvAFYAAwBAnujUqVP2nnvuGbXXXnudnM1mK22Ej9PQ0BAbN26MDRs2/J+/Nm7cGBs3boyamprYtGlTbNq0KWpqaqK2trbJnqe4uDhKSkqitLT0f/9eUVERFRUV0aJFi//zV0VFRRQWFvog8LHq6urWvvjii7eceOKJf169enW9jQAAADubAhgAAPLcXXfdddAXv/jF00tLS7vZRn7L5XKxYcOGWLt2baxbty7Wrl37d3+tW7cuNmzYkPd7atGiRbRu3TpatWoVrVu3jjZt2vzvf27dunW0aNHCh4morq5e+sgjj1zzne98Z6ptAAAAO5MCGAAA8tTVV189+MQTTzyzoqJioG3kj8bGxli5cmUsX748Pvjgg1i9evX//n3t2rXR2NhoSZ9RYWFhtGrVKtq1axdt27b937937tw5OnTo4LHTeWbDhg3z77333qvOPPPMebYBAADsDApgAADIM1/72tfaXHrppad27979qIjQRKVUQ0NDrFq1KlasWBHvv//+//595cqVTfqRzGlXXFwcHTp0iI4dO0bnzp2jY8eO0alTp2jXrp1HS6dYLpdrfOeddx76+c9/fv2ECRPW2QgAALAjKYABACBP9OrVq9ldd931jT322OM7hYWFZTaSHh9++GG88847sXTp0njvvfdixYoVsXr16mhoaLCchCgsLIz27dtHp06dolu3btG9e/fo3r27x0mnTENDQ9W8efNu++Y3v/nHJUuWbLYRAABgR1AAAwBAHrjrrrtG/NM//dOZJSUlXWwj2davXx9Lly6Nd955539L3w8//NBiUqqysvJ/y+C//tWqVSuLSbiamppljz322G9Gjx49xTYAAIDtTQEMAAAp9qtf/arPD3/4w5+1atVqL9tIno0bN8aSJUvirbfeikWLFsV7770XmzZtspg8V1JSEl27do0+ffpE3759o3fv3lFeXm4xCbRu3bqXr7322ivGjh27yDYAAIDtRQEMAAApNGjQoNI77rjju7vttttJBQUFWRtJhtWrV8ebb74ZixcvjiVLlsTy5cujsbHRYtiigoKC6Ny5c/Tu3Tt69+4d/fr1i7Zt21pMQjQ2Nta98cYbd33rW9+6ff78+TU2AgAAfFYKYAAASJHS0tKCBx988Jj99tvvn7PZbBsbaboaGhri7bffjrfeeisWLFgQS5YscXcv201FRUX06tUr+vbtG3379o2ePXtGYWGhxTRhdXV1a2bMmHHjV77ylYdqamr85gcAALDNFMAAAJASp59+erdf/vKX51ZWVu5jG03T6tWr47XXXouFCxfGm2++GRs3brQUdooWLVpE3759Y8CAATFw4EB3CDdh69evf/E//uM//vPqq69+xzYAAIBtoQAGAICEGzRoUOm99977w969ex+byWTc4teErF+/PubNmxcLFiyIN954Q+FLk9GiRYvo169fDBgwIPbYY4+orKy0lCYkl8s1LF68eNyJJ554rcdCAwAAW0sBDAAACXbNNdcMOemkk35RVlbWyzZ2vVwuF++++27MnTs3XnvttViyZIl3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B7lcrm7y5Mm//vKXv/yIbQAAwK63pXcAK4ABAMg7paWlBTNnzjyzT58+x9vG39uwYUOMGzcuZsyY4VHPQF7KZDKx3377xde//vWoqKiwkH+waNGiP+27775X1dTUeCwEAADsQgpgAAD4H926dctOnjz5V506dRppG/9fLpeLqVOnxp///OfYuHGjhQB5r6KiIkaNGhX777+/x0L/g+XLlz9+6KGHXvLuu+/W2QYAAOwaWyqAvQMYAIC8MXz48PInnnjiynbt2o2wjf/vnXfeiWuvvTaee+652Lx5s4UARMTmzZtjzpw58dprr0XPnj2jRYsWlvI/Kioq+n7rW98aMnXq1Ofee+89f3AAAMAusKV3ACuAAQDIC9/+9rc73n777X9o0aLFANv4b1VVVXHXXXfFvffeG+vXr7cQgI+wbt26eP7552P9+vWx2267RVFRkaVERElJSefjjjvuoA8++GDKK6+88hcbAQCAnUsBDABAXjv//PP7XXzxxX8oKSnpbBv/bfr06XHttdfGokWLLAPgU3jnnXdi2rRp0bp16+jc2R8nERHZbLbyC1/4whElJSUvTp48eY2NAADAzqMABgAgb/3ud7/b60c/+tFVRUVFrWwjYs2aNXHzzTfHpEmTora21kIAtkJtbW289NJL8c4770Tfvn2jtLQ073dSWFhYNnz48C/26dNn4UMPPbTMpwQAAHYOBTAAAHnp1ltv3f+b3/zmfxYWFjbP913kcrl4/vnn4/rrr4/ly5f7cAB8BitXroxp06ZFRUVFdOvWLTKZTF7vo6CgIDto0KBDBw0atOiBBx54xycEAAB2vC0VwJmex8Z+H/WF+pURa17ym6wAACTTww8//KXDDjvsXzKZTN6/rPGDDz6I22+/Pd544w0fDIDtbMCAAfGtb30r2rRpk/e7yOVyjVOmTPn1yJEjH/LJAACAHavN3jVR1OGjv6YABgAgdV555ZXTPve5z30r3/fQ0NAQjz32WDz++ONRV1fngwGwg2Sz2Tj66KPjC1/4QhQUFOT9Pl5//fU79tprr9/7ZAAAwI6jAAYAIC9ks9nMyy+/fFafPn2Oz/ddvPvuu3HbbbfFe++954MBsJN069YtvvOd70S3bt3yfhdLliy5f5999rmypqam0ScDAAC2PwUwAACpV1paWjBr1qyzevfufVw+7yGXy8WTTz4ZDz74oLt+AXaBbDYbxxxzTBxxxBF5fzfw0qVLHxg6dOjlSmAAANj+FMAAAKRar169mk2ePHlsu3btDsrnPaxcuTJuueWWePvtt30oAHaxnj17ximnnBIdOnTI6z2sXr16yiGHHPIvS5Ys2exTAQAA28+WCuDCyoHR9aO+0FgVUbMia3sAADRpQ4cOLXvqqacub9Omzf75uoNcLhfPPPNMXH/99bF27VofCoAmYP369TFlypQoKSmJnj17RiaTycs9NG/evPtJJ500ZPLkyc+sWLHCoykAAGA7KetcHwXlH/01BTAAAIk1ZMiQ0kceeeSKVq1a7Z2vO6iuro7bb789nnjiiWhs9IRNgKaksbEx5s+fH++//34MGDAgstn8/DlLaWlpp6997WuDn3rqqadXrlxZ75MBAACfnQIYAIDUOfTQQ1s8+OCDv2/ZsuUe+bqDOXPmxNVXX+2RzwBN3PLly+OFF16Ijh075u0joUtLSzudcMIJ+7/00ktPv/3227U+FQAA8NkogAEASJVhw4Y1v++++37TsmXLQfl4/vr6+hg/fnz88Y9/jNpaP0MHSILNmzfHiy++GJs3b47ddtstCgoK8m4HxcXFbY866qg9n3vuuaeXL1/ucdAAAPAZKIABAEiNI488snLcuHG/b9GixcB8PP97770XV111VcyZM8eHASCBFi1aFC+//HL069cvWrRokXfnLykp6XDcccftP2fOnGcWLVq0yScCAAC2jQIYAIBUOPLIIyvvvPPO35aXl++Wj+d/+umn48Ybb4wPP/zQhwEgwf7yl7/ECy+8ECUlJdGrV6+8O3+zZs3aHHXUUfspgQEAYNspgAEASLxjjz227W233faH5s2b98m3s1dVVcXNN98cTz31VDQ2NvowAKRAY2NjzJ8/P5YtWxYDBgyIZs2a5dX5mzVr1uaYY4458M0333xm4cKFNT4RAACwdRTAAAAk2qGHHtritttuuzofy9+33347rrnmmli8eLEPAkAKvf/++/HKK69Enz59orKyMq/Ons1mK4888sh9Zs6c+dTSpUs3+zQAAMCnpwAGACCxjjjiiJb33nvvteXl5f3y6dy5XC4mTZoUN998c1RVVfkgAKRYVVVVTJ06NbLZbPTp0ycymUzenL24uLjtV7/61c+/8sorTy1evLjWpwEAAD4dBTAAAIl06KGHtrj33nt/l2/lb3V1ddx0000xefLkyOVyPggAeSCXy8WCBQvi3Xffjd133z2y2fz5mUyzZs1aH3300fvNmDHjSXcCAwDAp6MABgAgcYYOHVo2fvz4qysqKgbk07mXLVsWV111lUc+A+SplStXxiuvvBKf+9znoqKiIm/O3axZszZHH3300GeeeebJFStW1PkkAADAlimAAQBIlCFDhpQ++uij17Rs2XL3fDr31KlT49prr42NGzf6EADksaqqqpg+fXq0bds2unTpkjfnLikpaT9q1KihTz755JMrV66s90kAAICPt6UCuMB6AABoSjp16pSdMGHCv1dWVu6RL2dubGyMcePGxR133BF1dW56AiCitrY2br755hg/fnw0NjbmzbkrKyv3mDBhwr9369bNXQkAALCNFMAAADQZrVq1Kpw+ffolbdq02T9fzlxdXR2/+93vYtKkSd73C8DfyeVy8fjjj8fvf//7qK6uzptzt2nTZv8pU6Zc0qpVq0KfAgAA2HoKYAAAmoSKioqC2bNnX9KuXbuD8uXMS5cujYsuuijmz5/vAwDAx3r11VfjoosuiqVLl+bNmdu1a3fQ7Nmz/72iosLPrgAAYCu5iAYAoEmYOXPmz9q1a3dIvpz35ZdfjiuuuCLWrVsnfAA+0bp16+KKK66Il19+OW/O3K5du4Nnzpz5M+kDAMDWUQADALDLvfjii2N69OgxKh/Omsvl4oEHHogbbrghamtrhQ/Ap1ZbWxs33HBDPPDAA3nz2oAePXqMevHFF8dIHwAAPj0FMAAAu9SkSZO+NnDgwFPy4ax1dXVx8803x8SJE73vF4BtksvlYuLEiXHLLbdEXV1dXpx54MCBJ0+aNOlr0gcAgE9HAQwAwC7z6KOPHnXggQeekw9nXbduXfz617+OWbNmCR6Az2zmzJnx61//Ol9eJZA58MADz3n00UePkjwAAHyywsqB0fWjvtBYFVGzImtDAADsEDfeeOO+Rx999EWZTKYw7Wddvnx5XHXVVbFy5UrBA7DdbNiwIWbPnh0DBw6MioqKtB8307179/179uz56sMPP7xc+gAA5LuyzvVRUP7RX1MAAwCw011xxRV7fPe7372qoKCgWdrPOmfOnPjtb38bGzduFDwA2111dXVMmzYtOnfuHB07dkz1WTOZTOHuu+9+eJs2bV6aNGnSKukDAJDPFMAAADQZZ5xxRvef/exnvy0sLCxP+1knTJgQd999d9TX1wsegB2moaEhXnrppchms9G3b99UnzWTyRTttddeB/3lL395dubMmRukDwBAvlIAAwDQJBx00EEVf/jDH64pLi7ulOZz5nK5eOCBB+Kxxx4TOgA77c+eBQsWRF1dXfTv3z8ymUxqz1pQUFBywAEHDJs+ffqkpUuXbpY+AAD5aEsFcIH1AACwMwwaNKj0vvvuu7qsrKxXms9ZV1cX1113XUyaNEnoAOx0EydOjOuvvz7q6upSfc6ysrJef/rTn67u379/idQBAODvKYABANjhKioqCh577LGLKyoqBqb5nNXV1XHNNdfE7NmzhQ7ALvPKK6/ElVdeGVVVVak+Z4sWLQZOnDhxbEVFhZ9vAQDA33CBDADADjdz5syftW3b9sA0n3HdunVx2WWXxRtvvCFwAHa5xYsXx2WXXRZr165N9TnbtWt34MyZM38mcQAA+P8UwAAA7FBPPvnkqB49eoxK8xlXrVoVV1xxRSxfvlzgADQZK1asiCuuuCJWrlyZ6nP26NFj1KRJk0ZJHAAA/lth5cDo+lFfaKyKqFmRtSEAALbZjTfeuO+XvvSlCzOZTGp/8fDdd9+NK6+8MtatWydwAJqc6urqmDVrVvTv3z8qKytTe85u3boN79mz57yHH37Yb2MBAJAXyjrXR0H5R39NAQwAwA5x3nnn9T311FOvLigoKE7rGV977bW45pprorq6WuAANFmbN2+OGTNmRI8ePaJ9+/apPGMmkykYNGjQIYWFhVOee+45v5UFAEDqKYABANipjjrqqFb/8R//8YdmzZq1SusZX3755bj++uujrq5O4AA0eQ0NDfHSSy9Fp06dolOnTqk8Y0FBQXbYsGGfnz9//qQ33nhjk9QBAEizLRXA3gEMAMB21a1bt+wNN9zwnyUlJR3TesYpU6bEjTfeGPX19QIHIDHq6+vjxhtvjKlTp6b2jCUlJZ1uuOGG/+jWrZu7GgAAyFsKYAAAtqunn376XyorK/dI6/kmTZoUd955ZzQ2NgobgMRpbGyMO+64I5588snUnrGysnLw008//UtpAwCQrxTAAABsN88///w3unTp8k9pPd/EiRNj3LhxkcvlhA1AYuVyubj//vtTXQJ36dLlS88+++yJ0gYAIB95BzAAANvFTTfdNPzII488L5PJZNJ4vsceeyzGjx8vaABS47XXXotmzZpF3759U3m+zp0779urV695Dz/88DJpAwCQNlt6B7ACGACAz+wXv/hF7x/+8IdXFxQUNEvj+R544IF45JFHBA1A6ixYsCDq6upiwIABqTtbJpPJDBo06ODGxsbnpk6dul7aAACkiQIYAIAd5oADDqj43e9+99tmzZq1TeP5xo0bF5MmTRI0AKm1aNGi2Lx5cwwcODB1ZysoKMjut99+w5577rnH33vvvc3SBgAgLbZUAHsHMAAA2yybzWbuvPPOfyktLe2exvNNmDBB+QtAXpg0aVI89NBDqTxbaWlpj3vuuedfstlsRtIAAOQDBTAAANvs+eef/06HDh0OTePZHn744Xj44YeFDEDeeOSRR+LPf/5zKs/WoUOHw5599tlvSxkAgHygAAYAYJvcd999hw8ePPjUNJ7t/vvvjwkTJggZgLzz2GOPxX333ZfKs+25554/+NOf/nSYlAEASDvvAAYAYKudccYZ3ceMGXN5QUFBcdrONnHixHjkkUeEDEDeWrx4cWSz2ejbt2/ajpbp06fPvn/5y18mz5w5c4OkAQBIsi29A1gBDADAVhk2bFjzG2+88Q/NmjVrl7azPfroo6l99CUAbI2FCxdGUVFR9OvXL1XnKigoKD7wwAP3e/LJJx9dsWJFnaQBAEiqLRXAHgENAMBWuffee39ZWlraPW3nevzxx+PBBx8UMAD8jz//+c8xceLE1J2rtLS0x3333fdLCQMAkFYKYAAAPrVJkyaN6tSp0xEpPFeMHz9ewADwD8aPHx+TJ09O3bk6der0hUmTJn1VwgAApJFHQAMA8Kmcd955fU888cR/z2QyRWk618yZM+Puu+8WMAB8jNdeey06duwYnTt3TtW5unbtuk9BQcHzzz333DopAwCQNN4BDADAZ3LEEUe0vOKKK67NZrOVaTrXyy+/HDfffHPkcjkhA8DHyOVyMXv27OjSpUt06tQpNefKZDJF++yzz/CpU6c+9u67726WNAAASeIdwAAAbLNsNpu55ZZb/q2kpKRjms61YMGCuPnmm6OxsVHIAPAJGhsb4+abb44333wzVecqLS3tcvfdd5+fzWYzUgYAIC0UwAAAbNGkSZO+3rZt2wPTdKZly5bFDTfcEPX19QIGgE+prq4urr322li+fHmqztWuXbsDH3/88VESBgAgLTwCGgCAj3XZZZcN+upXvzo2k8mk5hcH33///bjyyiujqqpKwACwlerq6uLll1+OIUOGRHl5eWrO1aVLl31LS0unPvPMM2ukDABAEngENAAAW61///4lJ5988q8ymUxRWs60YcOG+P3vfx8bN24UMABso40bN8bvfve7VP15WlBQkP3hD394ft++fYslDABA4q9vrQAAgI/y4IMPnl1WVtYrLeeprq6O3/zmN7Fq1SrhAsBntGrVqrjyyiujuro6NWcqKyvr8/DDD58lXQAAkk4BDADA/zF+/Pgju3XrdnRazlNfX5/KdxYCwK60fPnyuO6666K+vj41Z+rRo8dXx40bd4R0AQBIMgUwAAB/53vf+16nI4444py0nCeXy8Vtt90Wb7zxhnABYDt7/fXX47bbbotcLpeaMx155JHnfvvb3+4oXQAAkkoBDADA/6qoqCi4+OKLLywsLCxPy5nGjx8fs2bNEi4A7CCzZs2Khx56KDXnKSwsrPj1r399QUVFhZ+bAQCQSC5kAQD4XxMnThxdWVk5OC3nef7552PixImCBYAd7LHHHosXXnghNeeprKzc89FHHz1RsgAAJFFh5cDo+lFfaKyKqFmRtSEAgDxxwQUX7DZq1KgLM5lMYRrO8+qrr8Ytt9ySqkdSAkBT/7O3d+/e0a5du1Scp2PHjkNzudxzU6ZMWSddAACamrLO9VHwMc/wcwcwAADRt2/f4h//+McXZzKZVPwG4HvvvRc33HBDNDY2ChcAdpKGhoa47rrrYtmyZak4T0FBQfbss88e27dv32LpAgCQqGtZKwAAYPz48T8qKyvrkYazbNiwIX7/+99HbW2tYAFgJ9u0aVP8/ve/j40bN6biPGVlZb3GjRs3RrIAACSJAhgAIM/ddNNNw/v06XN8Gs5SX18f1157baxdu1awALCLrFmzJq699tqor69PxXn69ev3jd///vdDJQsAQFIogAEA8thBBx1Uceyxx/5rRGTScJ477rgjFi9eLFgA2MUWLVoUd955Z1qOU/CNb3zj34YNG9ZcsgAAJOIC1goAAPLXzTfffFZxcXG7NJxl4sSJMX36dKECQBMxbdq0mDRpUirOUlJS0unOO+88Q6oAACSBAhgAIE/913/914FdunT5UhrO8tprr8Wf//xnoQJAEzN+/PhYsGBBKs7SrVu3o2+66abhUgUAoKlTAAMA5KEvfelLlV/5yld+lYazrFixIq6//vpobGwULAA0MY2NjXHdddfFihUr0nCczHHHHfergw46qEKyAAA0ZQpgAIA8dPXVV5+ezWYrk36OmpqauPbaa2PTpk1CBYAmatOmTXHttddGTU1N4s+SzWbb3njjjT+RKgAATZkCGAAgz9x6663Du3Tp8uWknyOXy8Utt9wSK1euFCoANHErV66MW2+9NXK5XOLP4lHQAAA0dQpgAIA8MnTo0LKvfvWrv0jDWSZMmBBz584VKgAkxJw5c+Kxxx5LxVlGjRr1i6FDh5ZJFQCApkgBDACQR+64444fFRcXd0z6OV5++eV45JFHBAoACfPQQw+l4he4SkpKOt5xxx0/lCgAAE2RAhgAIE9cfvnlu/fs2XNU0s/xwQcfxB133JGKR0gCQL7J5XJx2223xZo1axJ/lp49ex57+eWX7y5VAACaGgUwAEAe6NatW/a73/3uv2YymURf/9XX18cNN9wQ1dXVQgWAhKqqqoobb7wx6uvrE32OTCZT8N3vfvdX3bp1y0oVAICmRAEMAJAHxo8ff0pZWVmvpJ/jnnvuiaVLlwoUABJuyZIlcd999yX+HGVlZT3Hjx9/ikQBAGhKFMAAACn385//vOeAAQNGJ/0c06dPjylTpggUAFJi8uTJMWPGjMSfY8CAAaN//vOf95QoAABNhQIYACDFstls5qyzzjo3k8kk+tGEK1asiLvvvlugAJAyd911V6xYsSLRZ8hkMtmzzjrr3Gw2m5EoAABNgQIYACDFxo0b98XKysq9knyG2trauOGGG6K2tlagAJAyf/1zfvPmzYk+R2Vl5V7jxo0bKVEAAJoCBTAAQEoNHz68/OCDDz4t6ee4//77Y/ny5QIFgJRavnx5jBs3LvHnGDFixI+HDRvWXKIAAOxqCmAAgJS69dZbT8tms22TfIYZM2bEc889J0wASLnJkyfHzJkzE32G4uLitrfffvtp0gQAYFdTAAMApNBVV121R48ePb6S5DOsXLky7rrrLmECQJ64++6744MPPkj0GXr27PnVK664Yg9pAgCwKymAAQBSprS0tOAb3/jGT5N8rdfY2Bi333679/4CQB6pqamJ2267LRobG5N8jIJvfvObZ5aWlvqZGwAAu+6i1AoAANJlwoQJX6uoqBiQ5DOMHz8+Fi1aJEwAyDNvvvlmPPjgg4k+Q4sWLQY9+OCDx0gTAIBdRQEMAJAiRx55ZOWwYcN+kOQzzJ07N5544glhAkCemjhxYixYsCDRZxg+fPiPjjjiiJbSBABgV1AAAwCkyBVXXHFyUVFRRVLnr6qqijvvvDNyuZwwASBP5XK5uP3226O6ujqxZygqKmrxm9/85mRpAgCwKyiAAQBS4vzzz+/Xu3fv45J8httvvz0+/PBDYQJAnlu3bl3cfvvtiT5D7969jz///PP7SRMAgJ1NAQwAkALZbDZz6qmn/jyTyST2+m769OkxZ84cYQIAERExe/bsmDFjRmLnz2QyBaeeeurPs9lsRpoAAOxMCmAAgBT44x//eERlZeXgpM6/du3auPfeewUJAPyde+65J9atW5fY+SsrKwf/6U9/+oIkAQDYmRTAAAAJ17dv3+JDDjnkR0k+w9133x01NTXCBAD+Tk1NTdx9992JPsPBBx/8o759+xZLEwCAnUUBDACQcHfdddc3S0pKOiV1/smTJ8e8efMECQB8pLlz58azzz6b2PlLSko63nPPPd+SJAAAO4sCGAAgwb70pS9VDhw48KSkzr9mzZoYP368IAGALXrggQdizZo1iZ2/f//+Jx111FGtJAkAwM6gAAYASLArrrji1MLCwvIkzp7L5eK2226LTZs2CRIA2KJNmzbFbbfdFrlcLpHzFxYWll1++eU/kCQAADuDAhgAIKF+8Ytf9O7evftXkjr/s88+G2+88YYgAYBP5Y033ojnn38+sfN369bt6F/96ld9JAkAwI6mAAYASKgf/vCHP8pkMom8nvvggw/igQceECIAsFXGjRsX69atS+TsmUym4NRTT/2xFAEA2NEUwAAACXTdddcNa9eu3YFJnD2Xy8Udd9wRtbW1ggQAtsqmTZvizjvvTOz8bdq02f+mm27aT5IAAOxICmAAgIQpLS0t+NrXvnZ6Uud/4YUXYuHChYIEALbJq6++GjNmzEjs/Mccc8zpFRUVfiYHAMAO42ITACBhbr/99oMrKip2S+LsGzZsiHHjxgkRAPhM7r///qiqqkrk7OXl5X3/67/+6wgpAgCwoyiAAQASpKKiouCwww47Nanz33vvvYn9YS0A0HRs2LAh7r///sTOf9BBB/1zq1atCiUJAMCOoAAGAEiQ+++//+iysrKeSZx9zpw58dJLLwkRANguXnjhhViwYEEiZy8tLe32xz/+8StSBABgR1AAAwAkRN++fYv33Xfff07i7LW1tXHvvfcKEQDYru6+++6oq6tL5Oz77bffKf379y+RIgAA25sCGAAgIW6++eZRxcXFbZM4+yOPPBJr164VIgCwXa1atSoee+yxRM6ezWbb3njjjV+TIgAA25sCGAAgAYYOHVq21157fSeJs7/33nvxxBNPCBEA2CEmTpwYK1asSOTsQ4YM+c7QoUPLpAgAwPakAAYASIBrr732xKKiosqkzZ3L5eKee+6JxsZGIQIAO0R9fX3cddddkcvlEjd7UVFR5bXXXnuCFAEA2J4UwAAATdwBBxxQMWDAgG8kcfYZM2bEW2+9JUQAYId6880348UXX0zk7AMGDPjG8OHDy6UIAMD2ogAGAGjirrrqqhOKiooqkjb3pk2b4oEHHhAgALBT3H///VFbW5u4uYuKilpcffXV7gIGAGC7UQADADRhBx10UEX//v0Teffvww8/HB9++KEQAYCdYv369TFhwoREzj5w4MBvHHDAARVSBABge1AAAwA0Yf/5n/95bGFhYfOkzb1q1aqYPHmyAAGAnerpp5+O1atXJ27uwsLC8ssuu2yUBAEA2B4UwAAATdQBBxxQMWjQoNFJnP3uu++O+vp6IQIAO1V9fX3cddddiZx99913/+bQoUPLpAgAwGelAAYAaKIuv/zyYwsLC8uTNvfcuXNjwYIFAgQAdokFCxbE3LlzEzd3UVFRi9/97ndflyAAAJ+VAhgAoAkaOnRo2aBBgxL37t+6urr405/+JEAAYJf605/+FHV1dYmbe/fdd//mkCFDSiUIAMBnoQAGAGiCfvOb33ylqKioZdLmfu655xL53j0AIF1Wr14dzz33XOLmLioqann11VcfLUEAAD4LBTAAQBPTq1evZoMHD/5m0uaurq6ORx55RIAAQJPwyCOPRHV1deLmHjJkyLe6deuWlSAAANtKAQwA0MTcdNNNxxQXF7dN2twTJkyIqqoqAQIATUJVVVUifzmtuLi43a233uouYAAAtpkCGACgCWnVqlXhXnvtdVLS5l61alU8++yzAgQAmpTJkyfHqlWrEjf30KFDR7dq1apQggAAbAsFMABAE3LLLbccXlJS0jlpcz/44INRX18vQACgSamvr48HH3wwcXOXlJR0vummmw6VIAAA20IBDADQRGSz2cwBBxzw7aTNvWjRonjppZcECAA0SS+99FIsXrw4cXOPGDHiO9lsNiNBAAC2lgIYAKCJuOaaa/YuLy/vm7S5H3roocjlcgIEAJqkXC6XyLuAy8vL+1111VV7SRAAgK2lAAYAaCK+8pWvfDdpM8+bNy8WLlwoPACgSVu4cGG8+uqrrg8BAMgLCmAAgCbgsssuG1RZWblPkmbO5XIxfvx44QEAifDAAw8k7qklrVu33veSSy7pLz0AALaGAhgAoAkYNWrUCUmbefbs2bFs2TLhAQCJsGzZsnjllVcSN/cJJ5xwovQAANgaCmAAgF3sn//5nzt37NjxiCTN3NjYGA888IDwAIBEGT9+fDQ0NCRq5k6dOn1h9OjRHaQHAMCnpQAGANjFfvSjH30tk8kk6rps2rRpsWrVKuEBAImyatWqeOGFFxI1cyaTKfzpT386SnoAAHxaCmAAgF1o0KBBpX369Plqkmaur6+PCRMmCA8ASKQJEyZEXV1dombu27fvV/r27VssPQAAPg0FMADALnTZZZcdXlRUVJGkmadOnRpr164VHgCQSOvXr48pU6YkauaioqLK3/zmN0dIDwCAT0MBDACwi2Sz2cy+++57UpJmrqurc/cvAJB4jz76aOLuAt5///1PymazGekBAPBJFMAAALvI1VdfPbSsrKx3kmaeMmVKbNiwQXgAQKJt2LAhnn/++UTNXFZW1ueqq67aS3oAAHwSBTAAwC7y5S9/+bgkzVtfXx8TJ04UHACQCo8//nji7gL+0pe+dLzkAAD4JApgAIBdYPTo0R3atm07IkkzT5s2LdatWyc8ACAVPvzww5g+fXqiZm7fvv2I0aNHd5AeAABbogAGANgFfvrTn47KZDKFSZm3vr4+HnnkEcEBAKnyyCOPRH19fWLmzWQyhT/96U+/JjkAALZEAQwAsJN16tQp26dPn6OTNLO7fwGANFq3bl1MmzYtUTP36dPnmE6dOmWlBwDAx1EAAwDsZFddddUB2Wy2dVLmbWxsjEmTJgmOVOvYsWN06OCJmgD5aNKkSdHY2JiYebPZbOurrrrqAMkBAPBxFMAAADvZiBEjvp6keV988cVYtWqV4Ei1Ll26xIUXXhinnXZadO3a1UIA8siqVavipZdecj0JAEBqKIABAHaiM844o3tlZeXeSZk3l8vFxIkTBUdeyGQyMXjw4PjVr34VY8aMcUcwQB55/PHHI5fLJWbeysrKvc8444zukgMA4KMogAEAdqJTTjnlqxGRScq8CxYsiPfee09w5JVMJhN77713XHjhhTFmzJho3769pQCk3HvvvRcLFy5M1B9X/3NdCQAA/4cCGABgJ+nVq1ezXr16fTlJM3v3L/nsr0XwBRdcECeffHK0bdvWUgBSLGnXPb169fpyr169mkkOAIB/pAAGANhJrrjiioOLiopaJmXeBN4JAztEYWFhDB8+PC688MIYPXp0VFZWWgpACi1YsCCWLVuWmHmLiopaXnnllYdIDgCAf6QABgDYSYYPH/6VJM2btHfhwY5WVFQUI0aMiEsuuSRGjx4dLVu2tBSAFMnlcvH4448naub99tvvK5IDAOAfKYABAHaC0aNHd6isrByalHnXrl0bL7/8suDgI/y1CL744ovjhBNOiBYtWlgKQEq89NJLsW7dusTMW1lZudfo0aM7SA4AgL+lAAYA2AlOP/30o5J07fXMM89EQ0OD4GALiouL47DDDouxY8fGqFGjoqyszFIAEq6hoSGeeeaZJI1c8D/XmQAA8P8vEq0AAGDHymazmX79+n05KfPW1tbGlClTBAefUnFxcYwcOTIuvfTSGDVqVJSWlloKQII9//zzUVtbm5h5+/Xr9+VsNpuRHAAAf6UABgDYwX7zm9/sWVJS0jkp886YMSOqq6sFB1uppKQkRo4cGZdcckkcffTRUVJSYikACVRdXR0zZ85M0p8/na+44orBkgMA4K8UwAAAO9gXvvCFLyVl1lwuF08//bTQ4DNo3rx5HHXUUXHJJZfEyJEjI5vNWgpAwjz11FORy+USM++RRx75ZakBAPBXCmAAgB1oyJAhpZ07dz4iKfO+/vrrsWLFCsHBdlBeXh6jRo2KSy+9VBEMkDArVqyI119/PTHzdunS5fD+/ft79AQAABGhAAYA2KHGjh17aGFhYWJeCOruX9j+KioqYtSoUXHxxRfH4YcfHkVFRZYC4LpouyosLGz+H//xHwdLDQCACAUwAMAOteeeex6ZlFnXrl0b8+bNExrsIK1atYrjjz8+LrroohgxYkQUFPh2DKApmzdvXqxZsyYx8+61115HSg0AgAgFMADADnPMMce0bt269b5Jmfe5556LxsZGwcEO1qZNmxg9enRcfPHFimCAJqyxsTGee+65JP35MvyYY45pLTkAAPykAQBgBznzzDMPz2Qyibje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FpafffbZvaQFAJA+CmAAgE9p//3375+EOV9//XVhAXmjvLw8Ro0aFf/+7/8eI0eOjGw2aymA67FP6fOf//xAaQEApI8CGADgU+rRo8fuTX3G2traePvtt4UF5J2KiooYNWpUXHzxxXH44Yc3+XdvAum2ePHiRLySo1evXoOkBQCQPgpgAIBPqXXr1k3+DoklS5ZEQ0ODsIC81apVqzj++OPj4osvjhEjRkRBgW97gZ2voaEhlixZ0uTnbNOmjQIYACCFfCcMAPApDBkypLR58+a9m/qcb775prAAIqJ169YxevToGDt2rCIYcF32MZo3b95n0KBBpdICAEgX3wEDAHwKp556av9MJtPkr53eeustYQH8jTZt2sTo0aPjvPPOi+HDhyuCAddlfyOTyRT84Ac/+Jy0AADSxXe+AACfwuDBg5v84/Hq6+tj0aJFwgL4CJ06dYqTTz45/u3f/i323nvvyGQylgLsUIsXL07Eqzn23HPPgdICAEgXBTAAwKfQpUuXAU19xnfeeSfq6uqEBbAFnTt3jjFjxiiCgR2utrY23n333SRc53oPMABAyiiAAQA+hZYtW/Zv6jN6/DPAp9elS5cYM2ZMnHvuuTF48GALAfL2+iwJ17kAAGwdBTAAwCcYPnx4eUlJSeemPqfHPwNsvV69esVpp50W55xzTvTvrwMB8u/6rLS0tPPw4cPLpQUAkB4KYACAT/Ctb31rt4ho8s8IXbx4sbAAtlGfPn3irLPOinPOOSd22203CwG2i4T8gl7m29/+dj9pAQCkhwIYAOAT7L777k2+CVi7dm1s2LBBWACfUZ8+feLss8+OM888M3r27GkhwGfy4Ycfxrp165r8nAMHDlQAAwCkSJEVAABsWadOnZr8D8TefvttQQFsRwMGDIgBAwbEggULYvz48bF06VJLAbb5Oq1Vq1audwEA2GkUwAAAn6CyslIBDJCnBgwYEP3794958+bFQw89FO+++66lAFtlyZIlsddeezX1613PvgcASBEFMADAFnTq1CnbvHnzXk19ziVLlggLYAfJZDIxePDg2GOPPeLll1+OBx98MFauXGkxQGqu05o3b967Xbt2RatXr66XGABA8nkHMADAFowZM6ZnJpPJNuUZGxsbPZoUYCfIZDKx9957x4UXXhhjxoyJ9u3bWwrwiZYuXRqNjY1NesaCgoLsqaee2kNaAADp4A5gAIAt2Hvvvfs29RlXrlwZtbW1wgLYSf5aBO+5554xa9asmDBhQqxevdpigI9UW1sb77//fnTu3LlJzzls2LC+EbFIYgAAyecOYACALejRo0eTL4DfeecdQQHsAoWFhTF8+PC48MILY/To0VFZWWkpQGKv15Jw3QsAwKejAAYA2ILWrVs3+ff/vvvuu4IC2IUKCwtjxIgRcckll8To0aOjZcuWlgIk7notCde9AAB8Oh4BDQCwBc2bN+/Z1GdUAAM0kW+wi4pixIgRsd9++8WUKVPiscceiw0bNlgMEO+9914SrnsVwAAAKeEOYACAj9G/f/+SkpKSjk19TgUwQNPSrFmzOOyww2Ls2LExatSoKCsrsxTIc0m4XistLe3Ut2/fYmkBACSfAhgA4GOccMIJ3Zr69dK6deuiqqpKWABNUHFxcYwcOTJ+/etfK4Ihz1VVVcX69eub+pgF3/zmN7tLCwAg+RTAAAAfY8iQIT2b+oxJeJwgQL77axE8duzYOProo6OkpMRSIA8l4botCde/AAB8MgUwAMDH6N69e8+mPqPHPwMkR/PmzeOoo46KSy65JEaOHBnNmjWzFMgjSbhuS8L1LwAAn0wBDADwMVq1atWjqc+4bNkyQQEkTHl5eYwaNSr+/d//PUaOHBnZbNZSIA8k4botCde/AAB8MgUwAMDHqKio6NXUZ1y+fLmgAJL750yMGjUqLr744jj88MOjqKjIUiDFknDd1rJly16SAgBIPgUwAMBHyGazmbKysq5NecbGxsZYtWqVsAASrlWrVnH88cfHxRdfHCNGjIiCAt+qQxqtWrUqGhsbm/SMJSUlXbPZbEZaAADJ5rtKAICPcNxxx7UrKCgobsozrl69Ourr64UFkBKtW7eO0aNHx9ixYxXBkEJ1dXXxwQcfNOkZCwoKio877rh20gIASDbfTQIAfITPf/7zXZr6jO+//76gAFKoTZs2MXr06Dj//PNj+PDhimBIkRUrVrgOBgBgh/NdJP+PvTuPr7I888d/nSwEkhD2HUQEUVRAoIiouCtq64Jabd1arVorbqO2tlXbaavTOu38Rqffdmpbu9rWpYogsqgFRXCttAIKArJDgAAJBLKQ5JzfH8WO4+DOcp6T9/v18jWvTv657ut6hNvnk/t+AICd2G+//bL+xVcSXiAC8PF17do1Lr300rj99ttj2LBhkUq5lRWSLgn7tyTsgwEAeH8FWgAA8H917txZAAxAVujevXtceeWVsXr16njiiSdi9uzZkclkNAYSKAn7tyTsgwEAeH8CYACAnWjXrp0roAHIKj169Igrr7wyli5dGpMmTYo5c+ZoCiRMEvZvSdgHAwDw/gTAAAA7UVxc3D3baxQAAzRPffr0ibFjx8aSJUti/PjxsWDBAk2BhEjC/i0J+2AAAN6fbwADAOxESUlJz2yur7q6Ourq6gwKoBnbb7/94l/+5V/ia1/7WhxwwAEaAglQV1cX1dXV9sEAAOxWAmAAgHc5/PDDSwsKCtpmc40VFRUGBUBERPTt2zduvPHGuOGGG2LffffVEMhy2b6PKygoaDt8+PASkwIASC4BMADAu5x44oldsr3GDRs2GBQA/8uAAQPiG9/4Rtxwww3Ru3dvDQH7uE+yH+5qUgAAyeUbwAAA79KvX7+sD4DXr19vUADs1IABA+LAAw+MuXPnxoQJE2LlypWaAlkkCTe5HHDAAV0i4i3TAgBIJgEwAMC7dO/evXO21+gEMADvJ5VKxaBBg2LgwIExe/bsGD9+fKxbt05jwD4uZ/bDAAC8NwEwAMC7tG/fvlO21ygABuDDSKVSMWzYsBg6dGjMnj07HnvsMbdIwF6WhBPASdgPAwDw3gTAAADv0rp166w/8ZCEF4cAZI+3g+BDDz00XnnllZg4caK/S8A+LtH7YQAA3psAGADgXUpKSrL6xENjY2Ns3rzZoAD4yPLz8+Pwww+P4cOHx/PPPx8TJ06MqqoqjYE9aPPmzdHY2BgFBdn7Wi7b98MAALw/ATAAwLu0bNmySzbXV1lZGZlMxqAA+Njy8/Nj1KhRMXLkyHjhhRcEwbAHZTKZqKqqio4dO9oPAwCwWwiAAQDepaioKKuvvKusrDQkAHaJgoKCGDVqVIwYMSJmzpwZkydPji1btmgM7IH9XDYHwNm+HwYA4P3laQEAwP8YPnx4SX5+fkk21ygABmBXa9GiRRx//PFxxx13xNlnnx0lJSWaAs14P5efn18yfPhwfxAAACSUABgA4B2OOOKIDtleo+//ArC7FBUVxejRo+P73/9+nH322VFcXKwpsBsk4cr1JOyLAQDYOQEwAMA79O3bt1221+gEMAC729tB8B133BGnn356tGrVSlOgme3n9ttvv7YmBQCQTAJgAIB36NSpkwAYAHYoKSmJz3zmM3HnnXfG6NGjo0WLFpoCzWQ/l4R9MQAAOycABgB4hw4dOrTN9hqTcGUgALmlpKQkzj777PjOd74To0aNivz8fE2BHN/PJWFfDADAzgmAAQDeoaysrG221ygABmBvad++fVx00UVx5513xgknnBCFhYWaAjm6nysrK3MCGAAgoQTAAADvUFJS0j6b68tkMlFdXW1QAOxV7dq1i/POOy+++93vxqhRoyIvz+sF+CiSsJ8rLS0VAAMAJJT/QgMAeIfi4uK22VxfXV1dNDY2GhQAWeHtE8F33HGHIBg+gsbGxqirq7MvBgBgt/BfZgAA79CqVausPung9C8A2ahDhw5x0UUXxbe//e04/PDDBcGQA/u6oqIiJ4ABABLKf5EBALxDQUGBABgAPqauXbvGpZdeGt/61rdi2LBhkUqlNAUSuq9r0aJFW1MCAEimAi0AAPgfhYWFZdlc39atWw0JgKzXrVu3uPLKK2P16tXxxBNPxOzZsyOTyWgMJGhfl+37YgAA3psAGADgnZujgoLW2VyfE8AAJEmPHj3iyiuvjKVLl8akSZNizpw5mgIJ2ddl+74YAID35gpoAIAdWrdunZefn98ym2sUAAOQRH369ImxY8fGLbfcEgMGDNAQSMC+Lj8/v1WrVq28OwQASCCbOACAHQYNGlQSEVn9scJt27YZFACJtd9++8UNN9wQX/va1+KAAw7QEJq1BOzr8gYPHlxsUgAAySMABgDY4YADDijJ9hpramoMCoDE69u3b9x4441xww03xL777qshNEu1tbVZX2P//v1LTQoAIHl8AxgAYIeePXtm/QuuJLwoBIAPa8CAATFgwICYP39+jBs3LpYvX64pNBtJ2Nf16NGjxKQAAJJHAAwAsEOnTp0EwACwFwwYMCAOPPDAmDt3bkyYMCFWrlypKeS8JOzrunbtKgAGAEggATAAwA5lZWVZ/4Krrq7OoADISalUKgYNGhQDBw6M2bNnx4QJE2Lt2rUaQ85KQgDcpk0bV0ADACSQABgAYIeysjIngAFgL0ulUjFs2LAYOnRozJ49O8aPHx/r1q3TGHKOABgAgN1FAAwAsENJSUlxttfoBDAAzcXbQfCQIUPi5ZdfjokTJ0ZFRYXGkDOSEAAnYX8MAMD/JQAGANihqKioKNtrrKmpMSgAmpW8vLw4/PDDY/jw4fH888/HE088EZWVlRpD4iUhAG7RokWRSQEAJI8AGABgh8LCwhbZXF86nY7t27cbFADNUn5+fowaNSpGjhwZL7zwQkycODGqqqo0hsTavn17ZDKZSKVSWVtjixYtWpgUAEDyCIABAHbI9gC4oaHBkABo9goKCmLUqFExYsSImDlzZkyePDm2bNmiMSROJpOJhoaGyOaMtbCw0AlgAIAk/neTFgAA7NgYFRRk9QuuxsZGQwKAHVq0aBHHH398HHnkkfHMM8/E1KlTY9u2bRpDomR7AJzt+2MAAN5jH6cFAAA7NkZZ/oLL9c8A8H8VFRXF6NGj49hjj41nnnkmpkyZEjU1NRpDImT7DS8FBQWugAYASCABMADA2xujLH/B5QpoAHhvbwfBRx11VEyfPj2efvrpqK2t1RiymgAYAIDdIU8LAAD+QQAMAMlXUlISn/nMZ+LOO++M0aNHZ/X1uiAABgBgdxAAAwDskO1XQAuAAeDDKykpibPPPjv+7d/+LUaPHh2FhYWagv3dR5Sfn9/SlAAAkkcADADw9sYoL88JYADIMa1bt46zzz47vve978UJJ5wgCMb+7iPIz8/3LwwAQAIJgAEAdkilUlm9N2psbDQkAPiY2rVrF+edd15897vfjRNOOCEKCgo0Bfu7D94f55sSAEDyCIABAHbI9gA4nU4bEgB8Qu3bt/9nEDxq1KjIy/NqBPu799kfp0wJACB5/FcOAMAOXnABQPPRoUOHuOiii+J73/ueIJi9JpPJZHuJ/sUAAEggmzgAgP+R1QFwAl4QAkDidOzYMS666KL41re+FYcffnj4fTDs796xOc7yG3IAANg5mzgAgITsjQTAALD7dOvWLS699NL41re+FcOGDRMEs0dk+xXQeXl5/kUAAEigAi0AAPiHbH/BJQAGgN2ve/fuceWVV8ayZcviiSeeiDlz5mgKzXl/5/AIAEACCYABAHbIZDJOAAMAERGx7777xtixY2PJkiUxYcKEmD9/vqZgfwwAQCIIgAEA/ocr7gCA/2W//faLG264Id56660YP358vPnmm5rCLpPtV0Cn3IUOAJBIAmAAgB2y/QVXtr8gBIBc1rdv37jxxhvjrbfeinHjxsWiRYs0hU/MFdAAANjEAQDsXln9Bs4BDADY+/r27Rs333xz3HDDDdG7d28NIdf3d75BAgCQQE4AAwDskO0nMATAAJA9BgwYEAMGDIj58+fHI488EitXrtQUcnF/5woaAIAEcgIYAGCHVCqVzvL6DAkAssyAAQPi1ltvjbFjx0bPnj01hJza32UScEc1AAD/lxPAAAD/QwAMAHysv6MHDRoUBx98cDz//PMxadKk2LRpk8aQ+P1dtv+CJAAAO+cEMADADul0dr/fEgADQHarr6+PioqK2LZtm2aQE/u7dDrtBDAAQAI5AQwA8D+cAAYAPrK6urp4+umnY9q0acJfcm1/5wQwAEACCYABAP6HEw4AwIfW0NAQ06ZNiyeffDK2bt2qIXxkCfgGsAAYACCBBMAAADtkMpmsDoDz8ny9AwCywdvB71NPPRXV1dUaQs7u7wTAAADJJAAGANgh219wCYABYO9qbGyMGTNmxJNPPhmVlZUawieWn5+f9VtkUwIASB4BMADADplMpiGb6yssLDQkANgL0ul0zJo1KyZPnhwbN27UEHaZgoLsfjXX1NTUaEoAAAncZ2oBAMA/NDY2bs/m+gTAALBnpdPpePnll2Py5Mmxdu1aDWGXa9GiRbb/O1BvSgAAySMABgDYoampSQAMAEQmk4nZs2fH448/HuXl5RpCs93fNTY2CoABABJIAAwAsENDQ0NWv+ASAAPA7vV28PvEE0/E6tWrNYTdLtuvgM72G3IAAHiPfaYWAAD8gyugAaD5mjNnTkyaNCmWLl2qGewx2X4FtAAYACCZBMAAADs0NTU5AQwAzcyCBQtiwoQJ8dZbb2kG9nfv0tDQIAAGAEggATAAwA7Z/oJLAAwAu87ChQtj/PjxsXjxYs1gr8n2K6Cz/RckAQB4j32mFgAA/EO2B8AFBQWRl5cX6XTasADgY1q+fHmMGzcu5s+frxnsVXl5eVkfAG/fvt0JYACABBIAAwDs0NDQkPUnHFq1ahXbtm0zLAD4iFauXBmPPPKI4Jes2tclYH8sAAYASCABMADADrW1tXXZXqMAGAA+mnXr1sX48eNj9uzZkclkNISs2tdlu7q6ulqTAgBIHgEwAMAOW7du3ZrtNSbhRSEAZIP169fHY489JvjFvu4TqK6u3mpSAADJIwAGANihqqpKAAwACbdhw4Z4/PHH45VXXommpiYNwb7uE6isrHT1DABAAgmAAQB22LRpU9a/4GrZsqVBAcBOVFVVxcSJE+OFF16IxsZGDSHrJSEA3rRpkxPAAAAJJAAGANhh3bp1WR8AOwEMAP/bli1bYsKECYJfEicJ+7ry8nIBMABAAgmAAQB2WLZsmSugASAhqqurY/LkyTFz5syor6/XEBInCfu6pUuXCoABABJIAAwAsMP8+fOz/gRwcXGxQQHQrNXU1MSUKVPimWeeEfySaEnY173++uu+AQwAkEACYACAHRYsWFCXyWQaUqlUYbbW2Lp1a4MCoFmqq6uLp59+OqZNmxbbtsmkSL5s39el0+mGpUuXbjcpAIDkEQADALxDU1PTtoKCgrbZWp8AGIDmZvv27TF9+vR48sknY+tWt9GSO7J9X9fU1ORfOACAhBIAAwC8Q0NDw9ZsDoBLS0sNCYDm8ndyTJs2LZ566qmorq7WEHJOtu/rGhsb/YsHAJBQAmAAgHeor6+vbNWqVc9src8JYAByXWNjY8yYMSOefPLJqKys1BByVrbv6+rr66tMCQAgmQTAAADv0NDQkNVvmgXAAOSqdDods2bNismTJ8fGjRs1hJyX7fu6bN8XAwDw3gTAAADvUFdXV5XN9ZWWlkYqlYpMJmNYAOSETCYTr732Wjz++OOxatUqDaFZSKVSUVJSktU11tbWVpkUAEAyCYABAN5h27Ztm7K5vvz8/GjVqlXU1NQYFgCJlslkYvbs2fH4449HeXm5htCstGrVKvLz87O6xq1btzoBDACQUAJgAIB3qK6u3pztNZaVlQmAAUist4PfiRMnxpo1azSEZqmsrCzra9y2bVuVSQEAJJMAGADgHaqqqjZle43t2rWLtWvXGhYAiTNnzpyYNGlSLF26VDNo1tq1a5f1NW7atMkJYACALNbQWBgFjQ0REZFKRSavMJre/pkAGADgHSoqKqqyvcYkvDAEgHdasGBBTJgwId566y3NgITs5zZs2CAABgDIYoUFDf9MejMRqab0/+S+AmAAgHdYtWpV1r/oatu2rUEBkAgLFy6M8ePHx+LFizUD3iEJAfDq1aurTAoAIJkEwAAA77BgwYKsD4CdAAYg2y1fvjzGjRsX8+fP1wzYiST8Ql8S9sUAAOycABgA4B2eeOKJjZlMpimVSuVna41OAAOQrVauXBmPPPKI4Bc+QLb/Ql8mk2l64oknNpoUAEAyCYABAN6huro6vX379g1FRUVdsrVGJ4AByDZr166NCRMmxOzZsyOTyWgIJHw/t3379g3V1dVpkwIASCYBMADAu9TV1a0XAAPAB1u/fn089thjgl/Isf1cXV3delMCAEguATAAwLvU1dVVtGnTJmvrKykpiRYtWsT27dsNC4C9oqKiIiZOnBivvPJKNDU1aQh8BEVFRVFcXJz1+2GTAgBILgEwAMC7bN26dV2XLll7ADhSqVR07Ngx1qxZY1gA7FFVVVUxceLEeP755wW/8DF17NgxUqlU1u+HTQoAILkEwAAA71JVVZX1Jx46deokAAZgj9m8eXM8/vjj8cILL0RjY6OGwCfcx9kPAwCwOwmAAQDeZf369Vn/zbMkvDgEIPm2bNkSU6ZMiZkzZ0Z9fb2GwC7QsWNH+2EAAHYrATAAwLusXr066088JOHFIQDJVVNTE1OmTIlnnnlG8Au7WBJ+kW/VqlUCYACABBMAAwC8y9///ves/+aZABiA3aG2tjYmT54czz77bNTV1WkINNN93KuvvioABgBIMAEwAMC7PPzww+t//OMfN6RSqcJsrbFz584GBcAus3379pg+fXpMnTo1tm3bpiGwG2X7CeB0Ot3w8MMPC4ABABJMAAwA8C7V1dXpurq68latWu2TrTV26NAh8vLyIp1OGxgAH1tDQ0NMmzYtnnrqqaiurtYQ2M3y8vKiQ4cOWV1jfX39mtraWptMAIAEEwADAOxEbW3tmmwOgAsKCqJdu3axceNGwwLgI2tsbIwZM2bEk08+GZWVlRoCe0j79u2joCC7X8fV1NSUmxQAQLIJgAEAdmLz5s2r2rdvn9U1duvWTQAMwEeSTqdj1qxZMXnyZH+HwF7av2W7LVu2rDQpAIBkEwADAOzEpk2bVvfp0yera+zWrVvMmzfPsAD4QG8Hv1OmTIkNGzZoCOzF/Vu227BhwxqTAgBINgEwAMBOrFixYvWwYcOyusYkvEAEYO/KZDLx0ksvxZQpU6K83K2usLd17do162tctWrVKpMCAEg2ATAAwE7Mnz9/9ZgxY7K6xiS8QARg78hkMjF79uyYOHFirFnjMB9kiyT8At+8efP8oQEAkHACYACAnRg3btyab37zm5mISGVrjU4AA7Azc+bMiSeeeCKWLVumGZBlEvALfJlx48atNikAgGQTAAMA7MTrr79e29DQsKmwsLBDttZYXFwcZWVlsWXLFgMDIBYsWBDjx4+PJUuWaAZkobKysiguLs7qGhsaGjYuWLCgzrQAAJJNAAwA8B62bt26vF27dh2yucauXbsKgAGauYULF8b48eNj8eLFmgFZLAm3t2zbtm25SQEAJJ8AGADgPVRVVS1t167d0GyusWfPnrFw4ULDAmiGli1bFo899ljMnz9fMyABevbsmfU1VlZWLjUpAIDkEwADALyHdevWLevTp09W15iEF4kA7ForVqyIRx99VPALCZOEfdvatWuXmRQAQPIJgAEA3sPChQuXHX744VldY69evQwKoJlYtWpVjB8/PubOnRuZTEZDIGGSsG9buHDhMpMCAEg+ATAAwHuYNm3a0ksuuSSra+zevXvk5+dHU1OTgQHkqHXr1sX48eNj9uzZgl9IqIKCgkR8A/jpp59eZloAADmw/9QCAICde+ihhzbcd999W/Pz80uzdjNXUBBdunSJNWvWGBhAjqmoqIiJEyfGyy+/HOl0WkMgwbp27RoFBdn9Gq6xsbH6kUce2WBaAADJJwAGAHgf27ZtW15WVnZwNtfYq1cvATBADqmqqoqJEyfG888/74YHyBFJ+P7vtm3blpsUAEBuEAADALyPLVu2LMv2ALhnz57x0ksvGRZAwm3evDkef/zxeOGFF6KxsVFDIIck4fu/W7ZsWWpSAAC5QQAMAPA+1q9fvyzbT2z06NHDoAASbMuWLTFlypSYOXNm1NfXawjkoCTs19avX7/MpAAAcoMAGADgfSxYsGDh0KFDs7rGfffdN1KpVGQyGQMDSJCampqYMmVKPPPMM4JfyGGpVCr23XffrK9z/vz5C00LACA3CIABAN7Ho48++uYFF1yQ1TWWlJRE586dY926dQYGkAC1tbUxefLkePbZZ6Ourk5DIMd17do1WrVqlfV1/vnPf15kWgAAuUEADADwPiZNmlRVX1+/oaioqGM217nvvvsKgAGy3Pbt22P69OkxderU2LZtm4ZAM9GnT5+sr7G+vr7iySefrDItAIDcIAAGAPgAW7duXZTtAXCfPn3ipZdeMiyALNTQ0BDTpk2Lp556KqqrqzUEmpkkXP+8detWp38BAHKIABgA4ANUVFQs7NChw8hsrjEJLxYBmpvGxsaYMWNGPPnkk1FZWakh0EwlYZ9WUVHh+78AADlEAAwA8AGWLl266MADD8zqGnv16hUFBQXR2NhoYAB7WTqdjlmzZsWkSZNi06ZNGgLNWGFhYfTs2TMR+13TAgDIHQJgAIAPMHPmzEWnnnpqdm/qCgqiZ8+esWzZMgMD2EveDn4nT54cGzdu1BAg9tlnn8jPz0/CfnexaQEA5I48LQAAeH+//OUvV6bT6bpsr7NPnz6GBbAXZDKZePHFF+O73/1u3H///cJf4J+ScP1zOp2u++Uvf7nStAAAcocTwAAAH6C6ujpdXV29uE2bNodkc539+vWL6dOnGxjAHpLJZGL27NkxceLEWLNmjYYAO92fJWCvu7i6ujptWgAAuUMADADwIWzYsGFetgfA/fv3NyiAPeTVV1+NSZMmxapVqzQD2KlUKpWI/dmGDRvmmhYAQG4RAAMAfAiLFy9+o2/fvlldY1lZWXTu3DnWr19vYAC7yYIFC2L8+PGxZMkSzQDeV5cuXaK0tDQJ+9z5pgUAkFsEwAAAH8JTTz31+ujRo7O+zv33318ADLAbLFy4MMaPHx+LFy/WDOBD78uSYMqUKa+bFgBAbsnTAgCAD/aLX/xiTWNjY1W215mUF40ASbFs2bK4++674z/+4z+Ev8BHkoTv/zY0NFTee++9q00LACC3OAEMAPAhNDQ0ZDZv3jy/Q4cOI7O5TgEwwK6xYsWKePTRR2P+fDejArm7L9uyZYs/5AAAcpAAGADgQ1q3bl3WB8AdO3aMNm3axObNmw0M4GNYtWpVjB8/PubOnRuZTEZDgI+lbdu20aFDh0Tsb00LACD3CIABAD6kefPmzTvooIOyvs4DDzwwXnrpJQMD+AjWrVsX48ePj9mzZwt+gV2yH0uCuXPnzjMtAIDcIwAGAPiQ/vznP88/77zzsr7OAw44QAAM8CFVVFTEuHHjBL/ALt+PJcHDDz/sBDAAQA4SAAMAfEgTJ06srK2tXdGqVat9srnOgw8+2LAAPkBVVVVMnDgxnn/++WhqatIQYJdKwq0xNTU1yydNmlRlWgAAuUcADADwEWzYsOHvvXr1yuoAuG3bttG1a9dYu3atgQG8y+bNm+Pxxx+PF154IRobGzUE2OW6desWbdu2TcS+1rQAAHKTABgA4CNYuHDha7169Toj2+scMGCAABjgHbZs2RJTpkyJ5557LrZv364hwG6TlO//Lly48O+mBQCQmwTAAAAfwcSJE/9+wgknZH2dBx54YEyfPt3AgGavpqYmpkyZEs8880zU19drCLDbDRgwIBF1jh8//u+mBQCQmwTAAAAfwb333rv6Bz/4wfqioqLO2VznAQccEHl5eZFOpw0NaJZqa2tj8uTJ8eyzz0ZdXZ2GAHtEXl5e9O/fP+vrrK+vX3ffffeVmxgAQG4SAAMAfESVlZVzu3btmtXHgFu1ahX77LNPLFu2zMCAZqWuri6efvrpmDZtWmzbtk1DgD1qn332iVatWmV9nZs2bZpjWgAAuUsADADwES1dunR2tgfAERGDBg0SAAPNRkNDQ0ybNi2eeuqpqK6u1hBgr+2/kuCtt976m2kBAOQuATAAwEc0ffr0v48cOTLr6xw4cGBMmDDBwICc1tDQEM8991w8+eSTUVlZqSHAXt9/JcG0adP+bloAALlLAAwA8BH9x3/8x9JbbrmlOj8/v3U219mrV68oKyuLLVu2GBqQc9LpdMyaNSsmTZoUmzZt0hBgrysrK4tevXplfZ2NjY1b7rnnnmUmBgCQuwTAAAAfUW1tbXrDhg1/7dKly3HZXGcqlYqBAwfGrFmzDA3IGW8Hv5MnT46NGzdqCJA1Bg4cGKlUKuvr3Lhx4yu1tbVpEwMAyF0CYACAj+Gtt956JdsD4IgQAAM5I51Ox8svvxxTpkyJ8vJyDQGyct+VBIsWLXrFtAAAcpsAGADgYxg/fvwrRxxxRNbXedBBB0VBQUE0NjYaGpBImUwmZs+eHRMnTow1a9ZoCJCVCgoK4qCDDkpErY888ogAGAAgx+VpAQDAR/fjH/94ZX19/fpsr7OoqCj69etnYEAivfrqq3HHHXfEz3/+c+EvkNX69esXRUVFWV9nXV1d+b333rvaxAAAcpsTwAAAH9OGDRte6dGjx6ezvc5BgwbFggULDAxIjCVLlsSECRNi/vz5mgEkwuDBgxNR5/r1653+BQBoBgTAAAAf07x5815OQgA8bNiwePjhhyOTyRgakNXefPPNmDBhQixevFgzgMRIpVIxdOjQRNQ6d+7cl0wMACD3CYABAD6m++677+XRo0dnIiKVzXW2bds2evfuHcuWLTM0ICstW7YsHnvsMSd+gUTq06dPtG3bNgmlpu+9996/mhgAQO4TAAMAfEwTJ06s3Lp165LS0tK+2V7rkCFDBMBA1lmxYkU8+uijgl8g0YYMGZKIOqurqxc+/fTTm00MACD3CYABAD6B8vLyl/fff/+sD4AHDx4c48aNMzAgK6xcuTImTJgQc+fOdT09kHhJ+f7vmjVrfP8XAKCZEAADAHwCM2fOfG7//ff/fLbX2a1bt+jWrVuUl5cbGrDXrFu3LsaPHx+zZ88W/AI5oWfPntGlS5dE1DpjxoznTAwAoHkQAAMAfAK33Xbba5dcckl1fn5+62yvdciQIQJgYK9Yv359PPbYY4JfIOck5frnxsbGzbfddts8EwMAaB4EwAAAn0BlZWXThg0b/tqlS5fjsr3WQw89NCZNmmRowJ78MzKeeOKJeP7556OpqUlDgJxz6KGHJqLOioqKV6qrq9MmBgDQPAiAAQA+oXnz5s1MQgDcu3dv10ADe0RVVVVMnDgxXnjhhWhsbNQQICd17949evbsmZT9quufAQCakTwtAAD4ZP77v/97VkQk4kTFpz71KQMDdpstW7bEQw89FLfffns899xzwl8gpw0fPjwRdWYymfTdd9/9gokBADQfTgADAHxCkyZNqtqyZcuCsrKyg7K91uHDh8fjjz9uaMAuVVNTE1OmTIlnnnkm6uvrNQTIealUKg477LBE1Lply5bXp0+fvsXUAACaDwEwAMAusHz58lkDBw7M+gC4S5cu0atXr1i5cqWhAZ9YbW1tTJ48OZ599tmoq6vTEKDZ6N27d3Ts2DEx+1QTAwBoXgTAAAC7wLPPPvvCwIEDr0hCrcOGDRMAA59IXV1dPP300zFt2rTYtm2bhgDNzrBhwxJT61/+8pcXTQwAoHnxDWAAgF3g1ltvnV9fX782CbUefvjhkUqlDA34yBoaGmLq1Klx6623xuOPPy78BZqlJF3/XFdXt/rWW29dYGoAAM2LE8AAALtAQ0NDZs2aNc/16dPns9lea7t27aJPnz6xZMkSgwM+7J9xMW3atHjqqaeiurpaQ4Bmbb/99ou2bdsmotbVq1fPNDEAgOZHAAwAsIs8++yz05IQAEdEHHHEEQJg4AOl0+mYNWtWTJo0KTZt2qQhABFx5JFHJqbW6dOnTzMxAIDmxxXQAAC7yC233PJaQ0NDZRJqHT58eLRo0cLQgJ1Kp9Px3HPPxW233Rb333+/8Bdgh6KiovjUpz6ViFobGho23HLLLXNNDQCg+XECGABgF6murk6Xl5c/t88++5yR7bW2bNkyDj300Hj55ZcNDvindDodL7/8ckyZMiXKy8s1BOBdhgwZEkVFRYmodc2aNc/V1tamTQ0AoPkRAAMA7EIvvvjiM0kIgCMiRo4cKQAGIiIik8nE7NmzY+LEibFmzRoNAXif/VNSzJo161kTAwBongTAAAC70O233/7KOeecszU/P78022sdMGBAtG/f3tWu0My9+uqrMWnSpFi1apVmALyPjh07xgEHHJCIWhsbG6u/8Y1v/NXUAACaJwEwAMAutHLlyob169fP6tat2+hsrzWVSsXhhx8ekyZNMjhohubMmROTJ0+OJUuWaAbAh3D44YdHKpVKRK3r16+fVVFR0WhqAADNU54WAADsWq+++mpirts77LDDDAyamTfffDP+/d//PX7yk58IfwE+pFQqFSNGjEhMva+88sozpgYA0Hw5AQwAsIvddNNNz5166qnV+fn5rbO91m7dukX//v1j4cKFBgc5btmyZfHYY4/F/PnzNQPgIzrggAOic+fOiai1sbFxy4033jjL1AAAmi8BMADALrZy5cqG8vLyGT179vx0Euo9+uijBcCQw5YvXx7jxo0T/AJ8wv1SUpSXlz9TXl7eYGoAAM2XABgAYDeYMWPGUxdccEEiAuAhQ4ZE69ato7q62uAgh6xcuTImTJgQc+fOjUwmoyEAH1ObNm3i0EMPTUy9zz777FOmBgDQvPkGMADAbvDVr371lYaGhk1JqLWgoCCOOOIIQ4McsW7duvj5z38ed955Z8yZM0f4C/AJjRw5MvLz8xNRa0NDw8abbrrpVVMDAGjenAAGANgNKisrm1atWjW9T58+5ySh3qOPPjqefPJJQREk2Pr16+Oxxx6L2bNn+3cZYBdJpVIxatSoxNS7cuXKadXV1WmTAwBo3pwABgDYTaZNm5aY6/c6duwYAwYMMDRIoA0bNsSvf/3r+Nd//dd49dVXhb8Au9CAAQOiY8eOian36aefftLUAAAQAAMA7CZf+9rX5tTX11ckpd6jjjrK0CBBqqqq4v77749vf/vb8eKLL0ZTU5OmAOxiRx55ZGJqra+vX/eNb3zjdVMDAMAV0AAAu0ltbW16xYoVT++///6fT0K9hx56aLRt2zaqqqoMD7LYli1bYsqUKfHcc8/F9u3bNQRgN2nbtm0MGTIkMfUuX778qdraWtc/AwDgBDAAwO70xz/+cUJSas3Pz4/jjjvO0CBL1dTUxKOPPhq33XZb/OUvfxH+Auxmxx57bOTn5yel3Myvf/3rCaYGAECEABgAYLe66667llZXV89PSr1HH310tGjRwuAgi7wd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qATAAABZ4umnn968fPnyxF3xN3r06GjXrp0BAgBZqUOHDnH88ccnru5ly5ZNmD59+hYTBADgoxIAAwBkkbvvvvtPmUymKUk1FxYWxumnn254AEBWOvPMMxP3yYpMJtN41113/dH0AAD4OATAAABZ5Be/+MWatWvXTkta3UcccUT06tXLAAGArNK7d+847LDDEld3eXn5X+6///51JggAwMchAAYAyDIPP/zwn5JWcyqVijPPPNPwAICsMmbMmEilUomr+8EHH/yT6QEA8HEJgAEAsszXv/71NzZs2DAraXUPHDgwDj74YAMEALLCoEGDYsCAAYmru6KiYuatt966wAQBAPi4BMAAAFlo3Lhxv01i3WPGjIm8PFtMAGDvysvLizFjxiSy9j//+c+/NUEAAD7RflgLAACyz/XXXz+nqqrqr0mru1evXnHUUUcZIACwVx1zzDHRvXv3xNW9adOmV2666aa5JggAwCchAAYAyFJ/+tOf7k1i3WPGjInS0lIDBAD2ijZt2sRZZ52VyNofeOCBe00QAIBPSgAMAJClbrrpprlJPAVcXFwcZ555pgECAHvFWWedFS1btkxc3Zs2bXrl5ptvnmeCAAB8UgJgAIAsNm7cuF8lse5Ro0ZF7969DRAA2KP69OkTI0eOTGTtjz322K9MEACAXUEADACQxcaOHTu7qqrqb0mrO5VKxfnnnx+pVMoQAYA9tv/4/Oc/n8j9R2Vl5d+uueaav5kiAAC7ggAYACDLTZ069bdJrLtv374xZMgQAwQA9ojDDjsssTeQTJ48+TcmCADAriIABgDIcpdeeumLVVVVryax9s9//vNRXFxsiADAblVaWhrnn39+Imuvqqr66+WXX/6SKQIAsKsIgAEAEuChhx76WRLrLisri9NPP90AAYDd6qyzzoqSkpIklp753e9+91MTBABgVxIAAwAkwA033DB3w4YNs5JY+3HHHRd9+vQxRABgt+jbt28cddRRiay9oqJi1te//vU3TBEAgF1JAAwAkBA///nPfxoR6aTVnUql4vOf/3zk5dl6AgC7Vn5+flx00UWRSqWSWH76F7/4xX+bIgAAu5q3cAAACXHHHXe8tW7duulJrL13795xzDHHGCIAsEudcMIJ0b1790TWXl5e/pc77rjjLVMEAGBXEwADACTI3XfffW8mk2lKYu1nnXVWtG3b1hAB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onv37vEv//IvccABBzSrdWcymaYnnnji9s997nPPeAoAAODDEQADAJBYDz/88NJjjjlmY+/evY+KiGZzFKq0tDSGDx8eq1evjvXr13sQAHLcwIED45prrol27do1t6VnZsyY8YOzzjprqqcAAAA+PAEwAACJdv/99795zDHHVO6zzz5HRDMKgVu0aBGHHXZYtGzZMhYuXBjpdNrDAJBjCgoK4pxzzonzzz8/WrRo0dyWn37uuefuOuWUUyZ4EgAA4KMRAAMAkHi///3v5w8bNmxF3759j2lO10GnUqno27dvDB06NBYvXhxbtmzxMADkiJ49e8YNN9wQgwcPblbf+434x7XPU6ZM+fbpp58+2ZMAAAAfnQAYAICc8OCDDy4ZNmzYin79+jWrEDgionXr1nHEEUdEfX19LF261MMAkGCpVCpOOOGEuOKKK6JNmzbNbv07wt9vnXPOOX/xNAAAwMcjAAYAIGc89NBDS4YNG7a8X79+xza3EDg/Pz8OPvjg6NWrV8yfPz8aGho8EAAJU1JSEpdffnmccMIJkZ+f3+zWn8lkGp944olvffazn53maQAAgI9PAAwAQE556KGHlo4cOXJdnz59RqWa252ZEdG1a9cYNmxYLFu2LCorKz0QAAnRt2/fuO6662K//fZrluvPZDLpp59++rvnnHPO054GAAD4ZATAAADknD/96U+LDj300KX7779/s7sOOiKiuLg4jjzyyCgpKYk333wz0um0hwIgSxUUFMRnP/vZuPDCC6OkpKRZ9iCdTjc88sgjt5x//vnTPREAAPDJCYABAMhJDz/88NId3wQelUqlmt09mqlUKvr06RMHH3xwLFy4MLZt2+ahAMgynTt3jrFjx8bQoUOjGV5aERH/CH+feOKJ2y+88MLnPBEAALBrCIABAMhZDz300JIePXq8NmjQoGPz8vJaNMcetG3bNkaNGhVNTU2xZMkSDwVAFkilUjF69Oi48soro0OHDs22D01NTdt++9vf/stll132oqcCAAB2HQEwAAA5bdKkSeXdu3efM3jw4GYbAufn58eAAQOiV69esWDBgti+fbsHA2Avad26dVx66aVx/PHHR35+frPtQ2NjY/WvfvWrf7nuuute81QAAMCuJQAGACDnTZ48eW1jY+OMI4444uiCgoKS5tqHrl27xqhRo2Lbtm2xcuVKDwbAHpRKpWLUqFExduzY6NWrV7PuRX19/fo77rjjK9/61rcWejIAAGDXEwADANAsPP/881UbNmx45rjjjjuqsLCwrLn2obCwMAYNGhT77bdfLF68OGpraz0cALtZ+/bt44orrogTTzwxCgub9/uU2tralTfffPPVP/nJT1Z7MgAAYPcQAAMA0Gz87W9/27p27doZJ5xwwsjCwsK2zbkXnTp1ipEjR0Z1dbXTwAC70ciRI+Pqq6+OHj16NPte1NTULL/hhhuu/e1vf7vOkwEAALuPABgAgGbltdde2zpv3rynTznllKFFRUWdmnMvCgsL49BDD4399tsvFi1a5DQwwC709qnfk08+udmf+o2I2Lx587yLL774unHjxm30dAAAwO71fgFwat9zYsTOftC4LmLjq610DwCAxOrVq1fhs88++69du3Y9QTciGhoaYurUqTF58uRobGzUEICPqaCgIE499dQYPXq04HeH8vLyp4499tjvrly5skE3AABg9+swrDYKuuz8ZwJgAAByWuvWrfNeeumlm/fdd9+zdeMfVq9eHffff38sWbJEMwA+ov322y8uuugi1z2/w8KFC38/fPjwnzY0NGR0AwAA9gwBMAAAzd7zzz9/8aGHHnp1RKR0IyKTycTMmTPjz3/+c9TV1WkIwAcoKSmJ8847L0aMGBGplL9Kdki//PLL9xx77LEPagUAAOxZ7xcA+wYwAADNwn333Tfn+OOP39yrV6/DQwgcqVQqevfuHcOHD49169ZFRUWFhwTgPRxyyCExduzY6N+/v/B3h0wm0/jMM8/828knnzxONwAAYM97v28AC4ABAGg2fve7370xePDgJf369Ts6lUrl60hEcXFxjBgxInr06BFLly6N2tpaTQHYoUOHDvGFL3whzjzzzCguLtaQHZqammoeeOCBWz73uc9N1w0AANg7BMAAALDDww8/vKygoOC54cOHH1FQUFCqI//QrVu3OO6446K0tDQWL14cTU1NmgI0Wy1btoxzzjknLr300ujevbuGvENtbe2K22677arbbrvtDd0AAIC9RwAMAADv8Oyzz25avHjx0yeddNKQoqKiTjryD3l5edGnT58YOXJkbN26NVatWqUpQLNz+OGHx1e+8pUYMGBA5OXlacg7VFVV/e3CCy+8/oEHHvDdAAAA2MsEwAAA8C7z58+vefbZZ58+44wz+hcX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OigOOOCAKCoq0pQs0djYuGXmzJk/PvPMMyc2NDS4XgAAAPjQBMAAAJADjjzyyNY/+9nPrujbt++5EZGnI9mluro6Fi5cGPPnz4958+ZFZWWlprBXtGvXLg455JAYMGBA9O/fP1q39nsjWSj91ltv/fmqq676xaxZs6q1AwAA+KgEwAAAkEN++ctfjhgzZsyNrVq16q0b2SmdTsfKlStj0aJFsXDhwli8eHFs27ZNY9gtSkpKol+/ftG/f//Yf//9o1evXpGX53dEslVNTc3yRx999EdXXnnlK7oBAAB8XAJgAADIMd26dSt8+OGHPzd48ODL8vPzbdyzXCaTiTVr1sTChQtj0aJFsWjRotiyZYvG8LGUlZVF//79/xn6du/ePVKplMZkuaampprXXnvtV2PGjHmgoqKiUUcAAIBPQgAMAAA56rjjjiv7r//6r8tdC508mzdvjuXLl8eKFSti+fLlsXjx4qipqdEY/pfi4uLo169f9O7dO/bZZ5/Yd999o6ysTGMSJJPJpJcsWfLn66677pfTp0/3mx8AAMAuIQAGAIAc99Of/nTIueeee3NpaWlf3UimxsbGWLlyZSxdujSWLVsWy5cvj3Xr1kUmk9GcZiKVSkWXLl1in332iT59+kSfPn2iV69eUVBQoDkJtXXr1sUPPvjgj6699tq/6wYAALArCYABAKAZaNeuXf64cePOGTp06BUFBQWtdST56uvrY+XKlf88KbxixYpYu3ZtpNNpzUm4vLy86Nq1a+yzzz7//KdXr17RsmVLzckBjY2NW/7617/+4pxzznm0srKySUcAAIBdTQAMAADNyIknntjmnnvuuXzfffcdk0qlHB3MMdu3b481a9bEmjVrYu3atbF27dooLy+PDRs2CIazUF5eXnTs2DG6desWXbt2jW7dukW3bt2iR48eUVhYqEE5JpPJNC5ZsuRR1z0DAAC7mwAYAACaoa9+9av7Xnfdddd16NDhCN3IfY2Njf8MhNetWxfr1q2LioqKWLduXWzbtk2DdrPS0tLo3LnzP//p0qVLdO3aNbp27eoK52Ziw4YNM//rv/7rxz/60Y+W6wYAALC7CYABAKAZ++UvfznirLPOuq64uNj3gZupmpqaWL9+/T//qaioiMrKyqisrIxNmzZFY2OjJn2AgoKCaN++fbRr1y7at28fHTt2jC5dukSnTp2ic+fOUVxcrEnN1NatW98aP378PVdcccXLugEAAOwpAmAAAGjm2rVrl//ggw+eOWLEiCsLCwvb6gjvtHnz5n+GwZs2bYrKysqorq6OLVu2xJYtW6K6ujqqq6sjk8nk3NpTqVS0bt06WrduHWVlZdGmTZsoLS39X2Fvu3btok2bNh4U/peGhobKl1566efnnHPO+OrqavevAwAAe5QAGAAAiIiIoUOHFt97770XHHjggRfk5+c7ssiHlk6n/xkEV1dXR01Nzfv+k8lkora2NtLpdNTX10dTU1PU1dXt0u8U5+XlRcuWLSM/Pz+KiooiLy8vWrVqFalUKoqLi3f6T0lJSbRq1eqfgW9paWnk5eUZMB9aU1NTzYIFC/745S9/+Y+zZ8+u0REAAGBvEAADAAD/y2mnndb2rrvuurRPnz5n5+XlFeoIe9LbgfDbtm/f/r7XUBcUFESLFi3++b/fDnxhT8pkMg1LliwZd8stt/xq0qRJVToCAADsTQJgAABgp0477bS2d95554X777//5wTBAP9XJpNpWLhw4QO33nrrHwS/AABAtni/ADi/7UHRc2c/SG+LqC33/gcAAHLZokWL6u69995X0un0swcddFCnkpKS3roC8A8VFRUz/7//7/+77aKLLpq6aNGiOh0BAACyRXH3xsgr3fnPBMAAAEDMnDmz8u67736qqalpWr9+/Ypbt27dN5VKpXQGaG4ymUx6zZo1U+65555/Peeccx6cOXNmpa4AAADZRgAMAAB8KDNnzqz88Y9//Gw6nZ4uCAaak7eD37vvvvtfzz///McEvwAAQDYTAAMAAB+JIBhoLgS/AABAEgmAAQCAj+XtILisrOyFvn37diwuLu4VEYJgIBdkKioqnrv33nu/PWbMmEcEvwAAQJK8XwCc2vecGLGzHzSui9j4aivdAwAA/unqq6/u8ZWvfOX8Pn36nJWXl9dCR4CkSafT9UuXLh3/X//1Xw/84he/WKMjAABAEnUYVhsFXXb+MwEwAADwkZ1xxhntb7/99rMPPPDA8/Pz81vrCJDtmpqaqhcsWPDgd77znUcmTpzotC8AAJBoAmAAAGC3GD58eMkPf/jDzwwePPjioqKijjoCZJv6+voNr7322u9vvPHGx2fPnl2jIwAAQC4QAAMAALvV0KFDi++5556zDjnkkPOKioq66giwt9XV1a19/fXXH7z++uvHC34BAIBcIwAGAAD2iFatWuXdc889w0455ZTzO3bseJSOAHtYZsOGDbOmTJny4PXXX/9qbW1tWksAAIBcJAAGAAD2uH/913/tf/7555/dq1ev0/Ly8lroCLC7pNPp+pUrV05+4IEHHvnOd76zSEcAAIBcJwAGAAD2mjPOOKP97bfffvYBBxzw2YKCgjY6AuwqjY2NVW+++eafv/e97z06YcKETToCAAA0FwJgAABgrxs+fHjJ97///dGDBg0aU1paur+OAB9XdXX1wtdee+3Rr371q1Nfe+21Wh0BAACaGwEwAACQVb761a/ue8EFF3y6b9++ZxUUFLTWEeCDNDY2bnnrrbfG/+EPf5j4ox/9aLmOAAAAzZkAGAAAyEpDhw4t/sEPfnDy4MGDz27dunV/HQHerbq6+s2XX375weuuu+7ppUuXbtcRAAAAATAAAJDlCgsLU3ffffeQ0aNHn9G1a9fj8vLyinQFmq90Ol1XXl4+bcqUKROuvfbav+sIAADA/yYABgAAEqNPnz4t/v3f/33UyJEjz2rfvv2nIiKlK9AsZDZt2vTXF1544bGvfe1rzzntCwAA8N4EwAAAQCJddNFFXa6++uqTDzzwwLNbtmzZTUcg99TV1a1ZsGDBuJ/+9KdP3n///et0BAAA4IMJgAEAgETr1q1b4d13333k4YcffmqHDh2OyMvLK9QVSK50Ot2wcePGWbNmzZp8/fXXz6qoqGjUFQAAgA9PAAwAAOSMo48+uvWtt956/CGHHHJKu3btBkdEnq5AIqQrKytfmzdv3uQ777xz+owZM6q1BAAA4OMRAAMAADnpuOOOK/vGN75x/CGHHHJa27ZtB4bvBUO2yVRVVc2dN2/epO9///vTpk+fvkVLAAAAPjkBMAAAkPNuu+22vmedddZJffr0Oa5Vq1a9dQT2ntra2uXLly+f/uijjz51xx13vKUjAAAAu5YAGAAAaFa+9KUvdbv44ouP7t+//wlOBsMekamqqpq7cOHCv/z+97+fcd9995VrCQAAwO4jAAYAAJqtSy65pOtll112jDAYdrl0VVXVvIULF/7lV7/61bO/+93v1moJAADAniEABgAAiIirr766x/nnnz9q//33P7JNmzZDUqlUga7Ah5fJZBoqKyv/vnjx4uf+9Kc/zbr33ntX6woAAMCeJwAGAAB4l379+hV97WtfGzRy5MhRPXv2PLaoqKizrsD/VV9fv37VqlXPvPDCC8/9+7//+5zFixfX6woAAMDeJQAGAAB4H61bt8678847Bx599NFHde/efURpaen+4apomq/M1q1bF69Zs+bF5557btY3v/nNOdXV1WltAQAAyB4CYAAAgI9g8ODBrcaOHXvI8OHDD+vevfvw1q1bHxACYXJXprq6+s01a9a88sorr7z8k5/8ZN5rr71Wqy0AAADZSwAMAADwCVx//fX7nHHGGYf169dvePv27Yfm5+e31hWSrLGxsXrjxo2vvvXWWy+PHz/+lR//+McrdQUAACA5BMAAAAC70Je//OUe55xzzvA+ffoM7tix45CioqKuukI2q6+vX7t27doXFy9ePGfixImv3Xvvvat1BQAAILkEwAAAALvRl7/85R6f+cxnBvfr129Qly5dDm/ZsqVAmL2qrq5u7bp16wS+AAAAOUoADAAAsIe0atUq75prrtnn2GOPPXi//fY7uH379oeUlpb2TaVS+brDbpKuqalZtnHjxnlvvfXW3GeffXbef/3Xfy2vra1Naw0AAEBuEgADAADsRQceeGDLq6+++oAhQ4Yc3LNnz4Pbtm17sGuj+biampqqq6qqXi8vL583Z86ceb/85S/nvfjii1t1BgAAoPkQAAMAAGSZoUOHFn/xi1/cf9CgQQf26NHjwHbt2h3YqlWr3qlUKk932CFdU1OzvLKycsHq1asXzJkzZ8Gf//znJTNmzKjWGgAAgOZNAAwAAJAAxx13XNkFF1xw4MEHH3xA165dDywtLd23pKRkn1QqVag7uS2TyTRs27ZtRXV19dJ169YtfOONNxZOmDBh4YQJEzbpDgAAAO8mAAYAAEiw8847r+OJJ57Yp3///vt16dKlT5s2bfZr3bp1v/z8/GLdSZampqaa6urqxZs3b16ybt26pQsXLlzy9NNPL33ooYc26A4AAAAflgAYAAAgx7Rr1y7/kksu6TFkyJCe++67b89OnTr1Kisr61VcXNyzZcuW3VKpVL4u7R2ZTKaprq6uvKamZtWWLVtWVlRUrFy6dOnK2bNnr7r//vvXVFZWNukSAAAAn4QAGAAAoBnp1KlTwec+97luQ4cO7bnPPvv0aNeuXafWrVt3Li4u7tqyZcvORUVFnfLy8lro1MeTTqe319fXr6+rq6uoqalZW11dvb6y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AACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoIQADAAAAAAAAlBCAAQAAAAAAAEoIwAAAAAAAAAAlBGAAAAAAAACAEgIwAAAAAAAAQAkBGAAAAAAAAKCEAAwAAAAAAABQQgAGAAAAAAAAKCEAAwAAAAAAAJQQgAEAAAAAAABKCMAAAAAAAAAAJQRgAAAAAAAAgBICMAAAAAAAAEAJARgAAAAAAACghAAMAAAAAAAAUEIABgAAAAAAACghAAMAAAAAAACUEIABAAAAAAAASgjAAAAAAAAAACUEYAAAAAAAAIASAjAAAAAAAABACQEYAAAAAAAAoIQADAAAAAAAAFBCAAYAAAAAAAAoMY3JP//9K8My551lzpAk293a7QAAAAAAAAD8iIw3r+SL7TpPxuSt4/ibJJuz20QDBgAAAAAAAHhzrJPp6NvHYcyyjLl7dJTPbl/Jp6sPLufSsM+5ec7q5YOrF0OeP/SVaAAAAAAAAIA3weH7u6zfm79dWDIMSw6225w785vsx3XyzasOby5ssz69c4sAAAAAAAAAr9n69C6bC9sT93a7rKdnORin5Otxynzi1JQcfiwCAwAAAAAAALxO69O7HH68TaaT98cp85R8vbp3Nfszv8q0LHn7xMF1sjk/ZzUPmZ/MmWefhAYAAAAAAAD4oayPdjn7223Gn7x6ZrXPnetX8mBKkpv3cufDd/Pufn5FL56SzcVtNheT3dNt8tQlAwAAAAAAAHyv1sm0ySv/9XtsNWZ3I/lHkgzHi7/4XY7WYz5yiwAAAAAAAAA/Ivtcv/3nPEyS1fHa42t5+vNLyX7JoRsCAAAAAAAAePPt1/nbV3/KvePn1Xc371/NYxEYAAAAAAAA4M0yTHk2rvNo2WdzvHZqzN9v/SF3vju3evng/at5fPDLPDu1yuGyZHSVAAAAAAAAAK/XOGe4ueSvZ4e8M8xZbVe5ceuPufvy3Oqkw4+v5emDX+fuuTlLhhwsEYIBAAAAAAAAXpclGR8OuXP0TR4cPM/9z/+SRyfNDf/1TZezOp/87KdjzizJZkhO7edMy/w/nAUAAAAAAADg/zaMWcZkP8/ZLsmLacr2/MV8+cnvs/tP5/4FmLjAq1ifcioAAAAASUVORK5CYII=";
function pe(e, r, t) {
  return typeof e == "string" && !isNaN(Number(e)) && (e = Number(e)), typeof e == "number" && e < 100 ? ve(e) : typeof e == "number" && e >= 100 ? e : typeof e == "string" && e.includes("%") ? Math.round(r && r === "X" ? parseFloat(e) / 100 * t.width : r && r === "Y" ? parseFloat(e) / 100 * t.height : parseFloat(e) / 100 * t.width) : 0;
}
function Ur(e) {
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
  return isNaN(r) ? 0 : Math.round(r * Vt);
}
function gt(e) {
  return e = e || 0, Math.round((e > 360 ? e - 360 : e) * 6e4);
}
function oa(e) {
  const r = e.toString(16);
  return r.length === 1 ? "0" + r : r;
}
function sa(e, r, t) {
  return (oa(e) + oa(r) + oa(t)).toUpperCase();
}
function _e(e, r) {
  let t = (e || "").replace("#", "");
  !ia.test(t) && t !== ze.background1 && t !== ze.background2 && t !== ze.text1 && t !== ze.text2 && t !== ze.accent1 && t !== ze.accent2 && t !== ze.accent3 && t !== ze.accent4 && t !== ze.accent5 && t !== ze.accent6 && (console.warn(`"${t}" is not a valid scheme color or hex RGB! "${Oe}" used instead. Only provide 6-digit RGB or 'pptx.SchemeColor' values!`), t = Oe);
  const i = ia.test(t) ? "srgbClr" : "schemeClr", a = 'val="' + (ia.test(t) ? t.toUpperCase() : t) + '"';
  return r ? `<a:${i} ${a}>${r}</a:${i}>` : `<a:${i} ${a}/>`;
}
function Po(e, r) {
  let t = "";
  const i = Object.assign(Object.assign({}, r), e), a = Math.round(i.size * Vt), s = i.color, l = Math.round(i.opacity * 1e5);
  return t += `<a:glow rad="${a}">`, t += _e(s, `<a:alpha val="${l}"/>`), t += "</a:glow>", t;
}
function Ge(e) {
  let r = "solid", t = "", i = "", a = "";
  return e && (typeof e == "string" ? t = e : (e.type && (r = e.type), e.color && (t = e.color), e.alpha && (i += `<a:alpha val="${Math.round((100 - e.alpha) * 1e3)}"/>`), e.transparency && (i += `<a:alpha val="${Math.round((100 - e.transparency) * 1e3)}"/>`)), r === "solid" ? a += `<a:solidFill>${_e(t, i)}</a:solidFill>` : a += ""), a;
}
function at(e) {
  return e._rels.length + e._relsChart.length + e._relsMedia.length + 1;
}
function Ma(e) {
  if (!(!e || typeof e != "object"))
    return e.type !== "outer" && e.type !== "inner" && e.type !== "none" && (console.warn("Warning: shadow.type options are `outer`, `inner` or `none`."), e.type = "outer"), e.angle && ((isNaN(Number(e.angle)) || e.angle < 0 || e.angle > 359) && (console.warn("Warning: shadow.angle can only be 0-359"), e.angle = 270), e.angle = Math.round(Number(e.angle))), e.opacity && ((isNaN(Number(e.opacity)) || e.opacity < 0 || e.opacity > 1) && (console.warn("Warning: shadow.opacity can only be 0-1"), e.opacity = 0.75), e.opacity = Number(e.opacity)), e.color && e.color.startsWith("#") && (console.warn('Warning: shadow.color should not include hash (#) character, , e.g. "FF0000"'), e.color = e.color.replace("#", "")), e;
}
function No(e, r, t) {
  var i, a;
  const s = 2.3 + (!((i = e.options) === null || i === void 0) && i.autoPageCharWeight ? e.options.autoPageCharWeight : 0), l = Math.floor(r / Vt * he) / ((!((a = e.options) === null || a === void 0) && a.fontSize ? e.options.fontSize : He) / s), A = [];
  let c = [];
  const n = [], o = [];
  e.text && e.text.toString().trim().length === 0 ? c.push({ _type: ue.tablecell, text: " " }) : typeof e.text == "number" || typeof e.text == "string" ? c.push({ _type: ue.tablecell, text: (e.text || "").toString().trim() }) : Array.isArray(e.text) && (c = e.text);
  let f = [];
  return c.forEach((g) => {
    var d;
    typeof g.text == "string" && (g.text.split(`
`).length > 1 ? g.text.split(`
`).forEach((h) => {
      f.push({
        _type: ue.tablecell,
        text: h,
        options: Object.assign(Object.assign({}, g.options), { breakLine: !0 })
      });
    }) : f.push({
      _type: ue.tablecell,
      text: g.text.trim(),
      options: g.options
    }), !((d = g.options) === null || d === void 0) && d.breakLine && (n.push(f), f = [])), f.length > 0 && (n.push(f), f = []);
  }), n.forEach((g) => {
    g.forEach((d) => {
      const h = [], y = String(d.text).split(" ");
      y.forEach((m, p) => {
        const _ = Object.assign({}, d.options);
        _?.breakLine && (_.breakLine = p + 1 === y.length), h.push({ _type: ue.tablecell, text: m + (p + 1 < y.length ? " " : ""), options: _ });
      }), o.push(h);
    });
  }), o.forEach((g) => {
    let d = [], h = "";
    g.forEach((u) => {
      h.length + u.text.length > l && (A.push(d), d = [], h = ""), d.push(u), h += u.text.toString();
    }), d.length > 0 && A.push(d);
  }), A;
}
function Mi(e = [], r = {}, t, i) {
  let a = Xt, s = he * 1, l = he * 1, A = 0, c = 0;
  const n = [], o = pe(r.x, "X", t), f = pe(r.y, "Y", t), g = pe(r.w, "X", t), d = pe(r.h, "Y", t);
  let h = g;
  function u() {
    let m = 0;
    n.length === 0 && (m = f || ve(a[0])), n.length > 0 && (m = ve(r.autoPageSlideStartY || r.newSlideStartY || a[0])), l = (d || t.height) - m - ve(a[2]), n.length > 1 && (typeof r.autoPageSlideStartY == "number" ? l = (d || t.height) - ve(r.autoPageSlideStartY + a[2]) : typeof r.newSlideStartY == "number" ? l = (d || t.height) - ve(r.newSlideStartY + a[2]) : f && (l = (d || t.height) - ve((f / he < a[0] ? f / he : a[0]) + a[2]), l < d && (l = d)));
  }
  if (r.verbose && (console.log("[[VERBOSE MODE]]"), console.log("|-- TABLE PROPS --------------------------------------------------------|"), console.log(`| presLayout.width ................................ = ${(t.width / he).toFixed(1)}`), console.log(`| presLayout.height ............................... = ${(t.height / he).toFixed(1)}`), console.log(`| tableProps.x .................................... = ${typeof r.x == "number" ? (r.x / he).toFixed(1) : r.x}`), console.log(`| tableProps.y .................................... = ${typeof r.y == "number" ? (r.y / he).toFixed(1) : r.y}`), console.log(`| tableProps.w .................................... = ${typeof r.w == "number" ? (r.w / he).toFixed(1) : r.w}`), console.log(`| tableProps.h .................................... = ${typeof r.h == "number" ? (r.h / he).toFixed(1) : r.h}`), console.log(`| tableProps.slideMargin .......................... = ${r.slideMargin ? String(r.slideMargin) : ""}`), console.log(`| tableProps.margin ............................... = ${String(r.margin)}`), console.log(`| tableProps.colW ................................. = ${String(r.colW)}`), console.log(`| tableProps.autoPageSlideStartY .................. = ${r.autoPageSlideStartY}`), console.log(`| tableProps.autoPageCharWeight ................... = ${r.autoPageCharWeight}`), console.log("|-- CALCULATIONS -------------------------------------------------------|"), console.log(`| tablePropX ...................................... = ${o / he}`), console.log(`| tablePropY ...................................... = ${f / he}`), console.log(`| tablePropW ...................................... = ${g / he}`), console.log(`| tablePropH ...................................... = ${d / he}`), console.log(`| tableCalcW ...................................... = ${h / he}`)), !r.slideMargin && r.slideMargin !== 0 && (r.slideMargin = Xt[0]), i && typeof i._margin < "u" ? Array.isArray(i._margin) ? a = i._margin : isNaN(Number(i._margin)) || (a = [Number(i._margin), Number(i._margin), Number(i._margin), Number(i._margin)]) : (r.slideMargin || r.slideMargin === 0) && (Array.isArray(r.slideMargin) ? a = r.slideMargin : isNaN(r.slideMargin) || (a = [r.slideMargin, r.slideMargin, r.slideMargin, r.slideMargin])), r.verbose && console.log(`| arrInchMargins .................................. = [${a.join(", ")}]`), (e[0] || []).forEach((p) => {
    p || (p = { _type: ue.tablecell });
    const _ = p.options || null;
    c += Number(_?.colspan ? _.colspan : 1);
  }), r.verbose && console.log(`| numCols ......................................... = ${c}`), !g && r.colW && (h = Array.isArray(r.colW) ? r.colW.reduce((m, p) => m + p) * he : r.colW * c || 0, r.verbose && console.log(`| tableCalcW ...................................... = ${h / he}`)), s = h || ve((o ? o / he : a[1]) + a[3]), r.verbose && console.log(`| emuSlideTabW .................................... = ${(s / he).toFixed(1)}`), !r.colW || !Array.isArray(r.colW))
    if (r.colW && !isNaN(Number(r.colW))) {
      const m = [];
      (e[0] || []).forEach(() => m.push(r.colW)), r.colW = [], m.forEach((_) => {
        Array.isArray(r.colW) && r.colW.push(_);
      });
    } else {
      r.colW = [];
      for (let m = 0; m < c; m++)
        r.colW.push(s / he / c);
    }
  let y = { rows: [] };
  return e.forEach((m, p) => {
    const _ = [];
    let T = 0, v = 0, x = [];
    m.forEach((S) => {
      var O, E, M, w;
      x.push({
        _type: ue.tablecell,
        text: [],
        options: S.options
      }), S.options.margin && S.options.margin[0] >= 1 ? (!((O = S.options) === null || O === void 0) && O.margin && S.options.margin[0] && de(S.options.margin[0]) > T ? T = de(S.options.margin[0]) : r?.margin && r.margin[0] && de(r.margin[0]) > T && (T = de(r.margin[0])), !((E = S.options) === null || E === void 0) && E.margin && S.options.margin[2] && de(S.options.margin[2]) > v ? v = de(S.options.margin[2]) : r?.margin && r.margin[2] && de(r.margin[2]) > v && (v = de(r.margin[2]))) : (!((M = S.options) === null || M === void 0) && M.margin && S.options.margin[0] && ve(S.options.margin[0]) > T ? T = ve(S.options.margin[0]) : r?.margin && r.margin[0] && ve(r.margin[0]) > T && (T = ve(r.margin[0])), !((w = S.options) === null || w === void 0) && w.margin && S.options.margin[2] && ve(S.options.margin[2]) > v ? v = ve(S.options.margin[2]) : r?.margin && r.margin[2] && ve(r.margin[2]) > v && (v = ve(r.margin[2])));
    }), u(), A += T + v, r.verbose && p === 0 && console.log(`| SLIDE [${n.length}]: emuSlideTabH ...... = ${(l / he).toFixed(1)} `), m.forEach((S, O) => {
      var E;
      const M = {
        _type: ue.tablecell,
        _lines: null,
        _lineHeight: ve((!((E = S.options) === null || E === void 0) && E.fontSize ? S.options.fontSize : r.fontSize ? r.fontSize : He) * (To + (r.autoPageLineWeight ? r.autoPageLineWeight : 0)) / 100),
        text: [],
        options: S.options
      };
      M.options.rowspan && (M._lineHeight = 0), M.options.autoPageCharWeight = r.autoPageCharWeight ? r.autoPageCharWeight : null;
      let w = r.colW[O];
      S.options.colspan && Array.isArray(r.colW) && (w = r.colW.filter((G, ee) => ee >= O && ee < ee + S.options.colspan).reduce((G, ee) => G + ee)), M._lines = No(S, w), _.push(M);
    }), r.verbose && console.log(`
| SLIDE [${n.length}]: ROW [${p}]: START...`);
    let C = 0, P = 0, R = !1;
    for (; !R; ) {
      const S = _[C];
      let O = x[C];
      _.forEach((w) => {
        w._lineHeight >= P && (P = w._lineHeight);
      }), A + P > l && (r.verbose && (console.log(`
|-----------------------------------------------------------------------|`), console.log(`|-- NEW SLIDE CREATED (currTabH+currLineH > maxH) => ${(A / he).toFixed(2)} + ${(S._lineHeight / he).toFixed(2)} > ${l / he}`), console.log(`|-----------------------------------------------------------------------|

`)), x.length > 0 && x.map((G) => G.text.length).reduce((G, ee) => G + ee) > 0 && y.rows.push(x), n.push(y), y = { rows: [] }, x = [], m.forEach((G) => x.push({ _type: ue.tablecell, text: [], options: G.options })), u(), A += T + v, r.verbose && console.log(`| SLIDE [${n.length}]: emuSlideTabH ...... = ${(l / he).toFixed(1)} `), A = 0, (r.addHeaderToEach || r.autoPageRepeatHeader) && r._arrObjTabHeadRows && r._arrObjTabHeadRows.forEach((G) => {
        const ee = [];
        let Y = 0;
        G.forEach((ne) => {
          ee.push(ne), ne._lineHeight > Y && (Y = ne._lineHeight);
        }), y.rows.push(ee), A += Y;
      }), O = x[C]);
      const E = S._lines.shift();
      Array.isArray(O.text) && (E ? O.text = O.text.concat(E) : O.text.length === 0 && (O.text = O.text.concat({ _type: ue.tablecell, text: "" }))), C === _.length - 1 && (A += P), C = C < _.length - 1 ? C + 1 : 0, _.map((w) => w._lines.length).reduce((w, G) => w + G) === 0 && (R = !0);
    }
    x.length > 0 && y.rows.push(x), r.verbose && console.log(`- SLIDE [${n.length}]: ROW [${p}]: ...COMPLETE ...... emuTabCurrH = ${(A / he).toFixed(2)} ( emuSlideTabH = ${(l / he).toFixed(2)} )`);
  }), n.push(y), r.verbose && (console.log(`
|================================================|`), console.log(`| FINAL: tableRowSlides.length = ${n.length}`), n.forEach((m) => console.log(m)), console.log(`|================================================|

`)), n;
}
function Io(e, r, t = {}, i) {
  const a = t || {};
  a.slideMargin = a.slideMargin || a.slideMargin === 0 ? a.slideMargin : 0.5;
  let s = a.w || e.presLayout.width;
  const l = [], A = [], c = [], n = [], o = [];
  let f = [0.5, 0.5, 0.5, 0.5], g = 0;
  if (!document.getElementById(r))
    throw new Error('tableToSlides: Table ID "' + r + '" does not exist!');
  i?._margin ? (Array.isArray(i._margin) ? f = i._margin : isNaN(i._margin) || (f = [i._margin, i._margin, i._margin, i._margin]), a.slideMargin = f) : a?.slideMargin && (Array.isArray(a.slideMargin) ? f = a.slideMargin : isNaN(a.slideMargin) || (f = [a.slideMargin, a.slideMargin, a.slideMargin, a.slideMargin])), s = (a.w ? ve(a.w) : e.presLayout.width) - ve(f[1] + f[3]), a.verbose && (console.log("[[VERBOSE MODE]]"), console.log("|-- `tableToSlides` ----------------------------------------------------|"), console.log(`| tableProps.h .................................... = ${a.h}`), console.log(`| tableProps.w .................................... = ${a.w}`), console.log(`| pptx.presLayout.width ........................... = ${(e.presLayout.width / he).toFixed(1)}`), console.log(`| pptx.presLayout.height .......................... = ${(e.presLayout.height / he).toFixed(1)}`), console.log(`| emuSlideTabW .................................... = ${(s / he).toFixed(1)}`));
  let d = document.querySelectorAll(`#${r} tr:first-child th`);
  d.length === 0 && (d = document.querySelectorAll(`#${r} tr:first-child td`)), d.forEach((u) => {
    const y = u;
    if (y.getAttribute("colspan"))
      for (let m = 0; m < Number(y.getAttribute("colspan")); m++)
        o.push(Math.round(y.offsetWidth / Number(y.getAttribute("colspan"))));
    else
      o.push(y.offsetWidth);
  }), o.forEach((u) => {
    g += u;
  }), o.forEach((u, y) => {
    const m = Number((Number(s) * (u / g * 100) / 100 / he).toFixed(2));
    let p = 0;
    const _ = document.querySelector(`#${r} thead tr:first-child th:nth-child(${y + 1})`);
    _ && (p = Number(_.getAttribute("data-pptx-min-width")));
    const T = document.querySelector(`#${r} thead tr:first-child th:nth-child(${y + 1})`);
    T && (p = Number(T.getAttribute("data-pptx-width"))), n.push(p > m ? p : m);
  }), a.verbose && console.log(`| arrColW ......................................... = [${n.join(", ")}]`), ["thead", "tbody", "tfoot"].forEach((u) => {
    document.querySelectorAll(`#${r} ${u} tr`).forEach((y) => {
      const m = y, p = [];
      switch (Array.from(m.cells).forEach((_) => {
        const T = window.getComputedStyle(_).getPropertyValue("color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
        let v = window.getComputedStyle(_).getPropertyValue("background-color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
        // NOTE: (ISSUE#57): Default for unstyled tables is black bkgd, so use white instead
        (window.getComputedStyle(_).getPropertyValue("background-color") === "rgba(0, 0, 0, 0)" || window.getComputedStyle(_).getPropertyValue("transparent")) && (v = ["255", "255", "255"]);
        const x = {
          align: null,
          bold: window.getComputedStyle(_).getPropertyValue("font-weight") === "bold" || Number(window.getComputedStyle(_).getPropertyValue("font-weight")) >= 500,
          border: null,
          color: sa(Number(T[0]), Number(T[1]), Number(T[2])),
          fill: { color: sa(Number(v[0]), Number(v[1]), Number(v[2])) },
          fontFace: (window.getComputedStyle(_).getPropertyValue("font-family") || "").split(",")[0].replace(/"/g, "").replace("inherit", "").replace("initial", "") || null,
          fontSize: Number(window.getComputedStyle(_).getPropertyValue("font-size").replace(/[a-z]/gi, "")),
          margin: null,
          colspan: Number(_.getAttribute("colspan")) || null,
          rowspan: Number(_.getAttribute("rowspan")) || null,
          valign: null
        };
        if (["left", "center", "right", "start", "end"].includes(window.getComputedStyle(_).getPropertyValue("text-align"))) {
          const C = window.getComputedStyle(_).getPropertyValue("text-align").replace("start", "left").replace("end", "right");
          x.align = C === "center" ? "center" : C === "left" ? "left" : C === "right" ? "right" : null;
        }
        if (["top", "middle", "bottom"].includes(window.getComputedStyle(_).getPropertyValue("vertical-align"))) {
          const C = window.getComputedStyle(_).getPropertyValue("vertical-align");
          x.valign = C === "top" ? "top" : C === "middle" ? "middle" : C === "bottom" ? "bottom" : null;
        }
        window.getComputedStyle(_).getPropertyValue("padding-left") && (x.margin = [0, 0, 0, 0], ["padding-top", "padding-right", "padding-bottom", "padding-left"].forEach((P, R) => {
          x.margin[R] = Math.round(Number(window.getComputedStyle(_).getPropertyValue(P).replace(/\D/gi, "")));
        })), (window.getComputedStyle(_).getPropertyValue("border-top-width") || window.getComputedStyle(_).getPropertyValue("border-right-width") || window.getComputedStyle(_).getPropertyValue("border-bottom-width") || window.getComputedStyle(_).getPropertyValue("border-left-width")) && (x.border = [null, null, null, null], ["top", "right", "bottom", "left"].forEach((P, R) => {
          const S = Math.round(Number(window.getComputedStyle(_).getPropertyValue("border-" + P + "-width").replace("px", "")));
          let O = [];
          O = window.getComputedStyle(_).getPropertyValue("border-" + P + "-color").replace(/\s+/gi, "").replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
          const E = sa(Number(O[0]), Number(O[1]), Number(O[2]));
          x.border[R] = { pt: S, color: E };
        })), p.push({
          _type: ue.tablecell,
          text: _.innerText,
          // `innerText` returns <br> as "\n", so linebreak etc. work later!
          options: x
        });
      }), u) {
        case "thead":
          l.push(p);
          break;
        case "tbody":
          A.push(p);
          break;
        case "tfoot":
          c.push(p);
          break;
        default:
          console.log(`table parsing: unexpected table part: ${u}`);
          break;
      }
    });
  }), a._arrObjTabHeadRows = l || null, a.colW = n, Mi([...l, ...A, ...c], a, e.presLayout, i).forEach((u, y) => {
    const m = e.addSlide({ masterName: a.masterSlideName || null });
    y === 0 && (a.y = a.y || f[0]), y > 0 && (a.y = a.autoPageSlideStartY || a.newSlideStartY || f[0]), a.verbose && console.log(`| opts.autoPageSlideStartY: ${a.autoPageSlideStartY} / arrInchMargins[0]: ${f[0]} => opts.y = ${a.y}`), m.addTable(u.rows, { x: a.x || f[3], y: a.y, w: Number(s) / he, colW: n, autoPage: !1 }), a.addImage && (a.addImage.options = a.addImage.options || {}, !a.addImage.image || !a.addImage.image.path && !a.addImage.image.data ? console.warn("Warning: tableToSlides.addImage requires either `path` or `data`") : m.addImage({
      path: a.addImage.image.path,
      data: a.addImage.image.data,
      x: a.addImage.options.x,
      y: a.addImage.options.y,
      w: a.addImage.options.w,
      h: a.addImage.options.h
    })), a.addShape && m.addShape(a.addShape.shapeName, a.addShape.options || {}), a.addTable && m.addTable(a.addTable.rows, a.addTable.options || {}), a.addText && m.addText(a.addText.text, a.addText.options || {});
  });
}
let So = 0;
function ko(e, r) {
  e.bkgd && (r.bkgd = e.bkgd), e.objects && Array.isArray(e.objects) && e.objects.length > 0 && e.objects.forEach((t, i) => {
    const a = Object.keys(t)[0], s = r;
    it[a] && a === "chart" ? Oi(s, t[a].type, t[a].data, t[a].opts) : it[a] && a === "image" ? $i(s, t[a]) : it[a] && a === "line" ? Ia(s, ot.LINE, t[a]) : it[a] && a === "rect" ? Ia(s, ot.RECTANGLE, t[a]) : it[a] && a === "text" ? Hr(s, [{ text: t[a].text }], t[a].options, !1) : it[a] && a === "placeholder" && (t[a].options.placeholder = t[a].options.name, delete t[a].options.name, t[a].options._placeholderType = t[a].options.type, delete t[a].options.type, t[a].options._placeholderIdx = 100 + i, Hr(s, [{ text: t[a].text }], t[a].options, !0));
  }), e.slideNumber && typeof e.slideNumber == "object" && (r._slideNumberProps = e.slideNumber);
}
function Oi(e, r, t, i) {
  var a;
  function s(f) {
    !f || f.style === "none" || (f.size !== void 0 && (isNaN(Number(f.size)) || f.size <= 0) && (console.warn("Warning: chart.gridLine.size must be greater than 0."), delete f.size), f.style && !["solid", "dash", "dot"].includes(f.style) && (console.warn("Warning: chart.gridLine.style options: `solid`, `dash`, `dot`."), delete f.style), f.cap && !["flat", "square", "round"].includes(f.cap) && (console.warn("Warning: chart.gridLine.cap options: `flat`, `square`, `round`."), delete f.cap));
  }
  const l = ++So, A = {
    _type: null,
    text: null,
    options: null,
    chartRid: null
  };
  let c = null, n = [];
  Array.isArray(r) ? (r.forEach((f) => {
    n = n.concat(f.data);
  }), c = t || i) : (n = t, c = i), n.forEach((f, g) => {
    f._dataIndex = g, f.labels !== void 0 && !Array.isArray(f.labels[0]) && (f.labels = [f.labels]);
  });
  const o = c && typeof c == "object" ? c : {};
  if (o._type = r, o.x = typeof o.x < "u" && o.x != null && !isNaN(Number(o.x)) ? o.x : 1, o.y = typeof o.y < "u" && o.y != null && !isNaN(Number(o.y)) ? o.y : 1, o.w = o.w || "50%", o.h = o.h || "50%", o.objectName = o.objectName ? fe(o.objectName) : `Chart ${e._slideObjects.filter((f) => f._type === ue.chart).length}`, ["bar", "col"].includes(o.barDir || "") || (o.barDir = "col"), o._type === re.AREA && (["stacked", "standard", "percentStacked"].includes(o.barGrouping || "") || (o.barGrouping = "standard")), o._type === re.BAR && (["clustered", "stacked", "percentStacked"].includes(o.barGrouping || "") || (o.barGrouping = "clustered")), o._type === re.BAR3D && (["clustered", "stacked", "standard", "percentStacked"].includes(o.barGrouping || "") || (o.barGrouping = "standard")), !((a = o.barGrouping) === null || a === void 0) && a.includes("tacked") && (o.barGapWidthPct || (o.barGapWidthPct = 50)), o.dataLabelPosition && ((o._type === re.AREA || o._type === re.BAR3D || o._type === re.DOUGHNUT || o._type === re.RADAR) && delete o.dataLabelPosition, o._type === re.PIE && (["bestFit", "ctr", "inEnd", "outEnd"].includes(o.dataLabelPosition) || delete o.dataLabelPosition), (o._type === re.BUBBLE || o._type === re.BUBBLE3D || o._type === re.LINE || o._type === re.SCATTER) && (["b", "ctr", "l", "r", "t"].includes(o.dataLabelPosition) || delete o.dataLabelPosition), o._type === re.BAR && (["stacked", "percentStacked"].includes(o.barGrouping || "") || ["ctr", "inBase", "inEnd"].includes(o.dataLabelPosition) || delete o.dataLabelPosition, ["clustered"].includes(o.barGrouping || "") || ["ctr", "inBase", "inEnd", "outEnd"].includes(o.dataLabelPosition) || delete o.dataLabelPosition)), o.dataLabelBkgrdColors = o.dataLabelBkgrdColors || !o.dataLabelBkgrdColors ? o.dataLabelBkgrdColors : !1, ["b", "l", "r", "t", "tr"].includes(o.legendPos || "") || (o.legendPos = "r"), ["cone", "coneToMax", "box", "cylinder", "pyramid", "pyramidToMax"].includes(o.bar3DShape || "") || (o.bar3DShape = "box"), ["circle", "dash", "diamond", "dot", "none", "square", "triangle"].includes(o.lineDataSymbol || "") || (o.lineDataSymbol = "circle"), ["gap", "span"].includes(o.displayBlanksAs || "") || (o.displayBlanksAs = "span"), ["standard", "marker", "filled"].includes(o.radarStyle || "") || (o.radarStyle = "standard"), o.lineDataSymbolSize = o.lineDataSymbolSize && !isNaN(o.lineDataSymbolSize) ? o.lineDataSymbolSize : 6, o.lineDataSymbolLineSize = o.lineDataSymbolLineSize && !isNaN(o.lineDataSymbolLineSize) ? de(o.lineDataSymbolLineSize) : de(0.75), o.layout && ["x", "y", "w", "h"].forEach((f) => {
    const g = o.layout[f];
    (isNaN(Number(g)) || g < 0 || g > 1) && (console.warn("Warning: chart.layout." + f + " can only be 0-1"), delete o.layout[f]);
  }), o.catGridLine = o.catGridLine || (o._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : { style: "none" }), o.valGridLine = o.valGridLine || (o._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : {}), o.serGridLine = o.serGridLine || (o._type === re.SCATTER ? { color: "D9D9D9", size: 1 } : { style: "none" }), s(o.catGridLine), s(o.valGridLine), s(o.serGridLine), Ma(o.shadow), o.showDataTable = o.showDataTable || !o.showDataTable ? o.showDataTable : !1, o.showDataTableHorzBorder = o.showDataTableHorzBorder || !o.showDataTableHorzBorder ? o.showDataTableHorzBorder : !0, o.showDataTableVertBorder = o.showDataTableVertBorder || !o.showDataTableVertBorder ? o.showDataTableVertBorder : !0, o.showDataTableOutline = o.showDataTableOutline || !o.showDataTableOutline ? o.showDataTableOutline : !0, o.showDataTableKeys = o.showDataTableKeys || !o.showDataTableKeys ? o.showDataTableKeys : !0, o.showLabel = o.showLabel || !o.showLabel ? o.showLabel : !1, o.showLegend = o.showLegend || !o.showLegend ? o.showLegend : !1, o.showPercent = o.showPercent || !o.showPercent ? o.showPercent : !0, o.showTitle = o.showTitle || !o.showTitle ? o.showTitle : !1, o.showValue = o.showValue || !o.showValue ? o.showValue : !1, o.showLeaderLines = o.showLeaderLines || !o.showLeaderLines ? o.showLeaderLines : !1, o.catAxisLineShow = typeof o.catAxisLineShow < "u" ? o.catAxisLineShow : !0, o.valAxisLineShow = typeof o.valAxisLineShow < "u" ? o.valAxisLineShow : !0, o.serAxisLineShow = typeof o.serAxisLineShow < "u" ? o.serAxisLineShow : !0, o.v3DRotX = !isNaN(o.v3DRotX) && o.v3DRotX >= -90 && o.v3DRotX <= 90 ? o.v3DRotX : 30, o.v3DRotY = !isNaN(o.v3DRotY) && o.v3DRotY >= 0 && o.v3DRotY <= 360 ? o.v3DRotY : 30, o.v3DRAngAx = o.v3DRAngAx || !o.v3DRAngAx ? o.v3DRAngAx : !0, o.v3DPerspective = !isNaN(o.v3DPerspective) && o.v3DPerspective >= 0 && o.v3DPerspective <= 240 ? o.v3DPerspective : 30, o.barGapWidthPct = !isNaN(o.barGapWidthPct) && o.barGapWidthPct >= 0 && o.barGapWidthPct <= 1e3 ? o.barGapWidthPct : 150, o.barGapDepthPct = !isNaN(o.barGapDepthPct) && o.barGapDepthPct >= 0 && o.barGapDepthPct <= 1e3 ? o.barGapDepthPct : 150, o.chartColors = Array.isArray(o.chartColors) ? o.chartColors : o._type === re.PIE || o._type === re.DOUGHNUT ? Ro : Ot, o.chartColorsOpacity = o.chartColorsOpacity && !isNaN(o.chartColorsOpacity) ? o.chartColorsOpacity : null, o.border = o.border && typeof o.border == "object" ? o.border : null, o.border && (!o.border.pt || isNaN(o.border.pt)) && (o.border.pt = bt.pt), o.border && (!o.border.color || typeof o.border.color != "string") && (o.border.color = bt.color), o.plotArea = o.plotArea || {}, o.plotArea.border = o.plotArea.border && typeof o.plotArea.border == "object" ? o.plotArea.border : null, o.plotArea.border && (!o.plotArea.border.pt || isNaN(o.plotArea.border.pt)) && (o.plotArea.border.pt = bt.pt), o.plotArea.border && (!o.plotArea.border.color || typeof o.plotArea.border.color != "string") && (o.plotArea.border.color = bt.color), o.border && (o.plotArea.border = o.border), o.plotArea.fill = o.plotArea.fill || { color: null, transparency: null }, o.fill && (o.plotArea.fill.color = o.fill), o.chartArea = o.chartArea || {}, o.chartArea.border = o.chartArea.border && typeof o.chartArea.border == "object" ? o.chartArea.border : null, o.chartArea.border && (o.chartArea.border = {
    color: o.chartArea.border.color || bt.color,
    pt: o.chartArea.border.pt || bt.pt
  }), o.chartArea.roundedCorners = typeof o.chartArea.roundedCorners == "boolean" ? o.chartArea.roundedCorners : !0, o.dataBorder = o.dataBorder && typeof o.dataBorder == "object" ? o.dataBorder : null, o.dataBorder && (!o.dataBorder.pt || isNaN(o.dataBorder.pt)) && (o.dataBorder.pt = 0.75), o.dataBorder && o.dataBorder.color) {
    const f = typeof o.dataBorder.color == "string" && o.dataBorder.color.length === 6 && /^[0-9A-Fa-f]{6}$/.test(o.dataBorder.color), g = Object.values(Xr).includes(o.dataBorder.color);
    !f && !g && (o.dataBorder.color = "F9F9F9");
  }
  return !o.dataLabelFormatCode && o._type === re.SCATTER && (o.dataLabelFormatCode = "General"), !o.dataLabelFormatCode && (o._type === re.PIE || o._type === re.DOUGHNUT) && (o.dataLabelFormatCode = o.showPercent ? "0%" : "General"), o.dataLabelFormatCode = o.dataLabelFormatCode && typeof o.dataLabelFormatCode == "string" ? o.dataLabelFormatCode : "#,##0", !o.dataLabelFormatScatter && o._type === re.SCATTER && (o.dataLabelFormatScatter = "custom"), o.lineSize = typeof o.lineSize == "number" ? o.lineSize : 2, o.valAxisMajorUnit = typeof o.valAxisMajorUnit == "number" ? o.valAxisMajorUnit : null, o._type === re.AREA || o._type === re.BAR || o._type === re.BAR3D || o._type === re.LINE ? o.catAxisMultiLevelLabels = !!o.catAxisMultiLevelLabels : delete o.catAxisMultiLevelLabels, A._type = "chart", A.options = o, A.chartRid = at(e), e._relsChart.push({
    rId: at(e),
    data: n,
    opts: o,
    type: o._type,
    globalId: l,
    fileName: `chart${l}.xml`,
    Target: `/ppt/charts/chart${l}.xml`
  }), e._slideObjects.push(A), A;
}
function $i(e, r) {
  const t = {
    _type: null,
    text: null,
    options: null,
    image: null,
    imageRid: null,
    hyperlink: null
  }, i = r.x || 0, a = r.y || 0, s = r.w || 0, l = r.h || 0, A = r.sizing || null, c = r.hyperlink || "", n = r.data || "", o = r.path || "";
  let f = at(e);
  const g = r.objectName ? fe(r.objectName) : `Image ${e._slideObjects.filter((h) => h._type === ue.image).length}`;
  if (!o && !n)
    return console.error("ERROR: addImage() requires either 'data' or 'path' parameter!"), null;
  if (o && typeof o != "string")
    return console.error(`ERROR: addImage() 'path' should be a string, ex: {path:'/img/sample.png'} - you sent ${String(o)}`), null;
  if (n && typeof n != "string")
    return console.error(`ERROR: addImage() 'data' should be a string, ex: {data:'image/png;base64,NMP[...]'} - you sent ${String(n)}`), null;
  if (n && typeof n == "string" && !n.toLowerCase().includes("base64,"))
    return console.error("ERROR: Image `data` value lacks a base64 header! Ex: 'image/png;base64,NMP[...]')"), null;
  let d = (o.substring(o.lastIndexOf("/") + 1).split("?")[0].split(".").pop().split("#")[0] || "png").toLowerCase();
  if (n && /image\/(\w+);/.exec(n) && /image\/(\w+);/.exec(n).length > 0 ? d = /image\/(\w+);/.exec(n)[1] : n?.toLowerCase().includes("image/svg+xml") && (d = "svg"), t._type = ue.image, t.image = o || "preencoded.png", t.options = {
    x: i || 0,
    y: a || 0,
    w: s || 1,
    h: l || 1,
    altText: r.altText || "",
    rounding: typeof r.rounding == "boolean" ? r.rounding : !1,
    sizing: A,
    placeholder: r.placeholder,
    rotate: r.rotate || 0,
    flipV: r.flipV || !1,
    flipH: r.flipH || !1,
    transparency: r.transparency || 0,
    objectName: g,
    shadow: Ma(r.shadow)
  }, d === "svg")
    e._relsMedia.push({
      path: o || n + "png",
      type: "image/png",
      extn: "png",
      data: n || "",
      rId: f,
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`,
      isSvgPng: !0,
      svgSize: { w: pe(t.options.w, "X", e._presLayout), h: pe(t.options.h, "Y", e._presLayout) }
    }), t.imageRid = f, e._relsMedia.push({
      path: o || n,
      type: "image/svg+xml",
      extn: d,
      data: n || "",
      rId: f + 1,
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.${d}`
    }), t.imageRid = f + 1;
  else {
    const h = e._relsMedia.filter((u) => u.path && u.path === o && u.type === "image/" + d && !u.isDuplicate)[0];
    e._relsMedia.push({
      path: o || "preencoded." + d,
      type: "image/" + d,
      extn: d,
      data: n || "",
      rId: f,
      isDuplicate: !!h?.Target,
      Target: h?.Target ? h.Target : `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.${d}`
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
function Fo(e, r) {
  const t = r.x || 0, i = r.y || 0, a = r.w || 2, s = r.h || 2, l = r.data || "", A = r.link || "", c = r.path || "", n = r.type || "audio";
  let o = "";
  const f = r.cover || Bo, g = r.objectName ? fe(r.objectName) : `Media ${e._slideObjects.filter((h) => h._type === ue.media).length}`, d = { _type: ue.media };
  if (!c && !l && n !== "online")
    throw new Error("addMedia() error: either `data` or `path` are required!");
  if (l && !l.toLowerCase().includes("base64,"))
    throw new Error("addMedia() error: `data` value lacks a base64 header! Ex: 'video/mpeg;base64,NMP[...]')");
  if (!f.toLowerCase().includes("base64,"))
    throw new Error("addMedia() error: `cover` value lacks a base64 header! Ex: 'data:image/png;base64,iV[...]')");
  if (n === "online" && !A)
    throw new Error("addMedia() error: online videos require `link` value");
  if (o = r.extn || (l ? l.split(";")[0].split("/")[1] : c.split(".").pop()) || "mp3", d.mtype = n, d.media = c || "preencoded.mov", d.options = {}, d.options.x = t, d.options.y = i, d.options.w = a, d.options.h = s, d.options.objectName = g, n === "online") {
    const h = at(e);
    e._relsMedia.push({
      path: c || "preencoded" + o,
      data: "dummy",
      type: "online",
      extn: o,
      rId: h,
      Target: A
    }), d.mediaRid = h, e._relsMedia.push({
      path: "preencoded.png",
      data: f,
      type: "image/png",
      extn: "png",
      rId: at(e),
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`
    });
  } else {
    const h = e._relsMedia.filter((y) => y.path && y.path === c && y.type === n + "/" + o && !y.isDuplicate)[0], u = at(e);
    e._relsMedia.push({
      path: c || "preencoded" + o,
      type: n + "/" + o,
      extn: o,
      data: l || "",
      rId: u,
      isDuplicate: !!h?.Target,
      Target: h?.Target ? h.Target : `../media/media-${e._slideNum}-${e._relsMedia.length + 1}.${o}`
    }), d.mediaRid = u, e._relsMedia.push({
      path: c || "preencoded" + o,
      type: n + "/" + o,
      extn: o,
      data: l || "",
      rId: at(e),
      isDuplicate: !!h?.Target,
      Target: h?.Target ? h.Target : `../media/media-${e._slideNum}-${e._relsMedia.length + 0}.${o}`
    }), e._relsMedia.push({
      path: "preencoded.png",
      type: "image/png",
      extn: "png",
      data: f,
      rId: at(e),
      Target: `../media/image-${e._slideNum}-${e._relsMedia.length + 1}.png`
    });
  }
  e._slideObjects.push(d);
}
function Mo(e, r) {
  e._slideObjects.push({
    _type: ue.notes,
    text: [{ text: r }]
  });
}
function Ia(e, r, t) {
  const i = typeof t == "object" ? t : {};
  i.line = i.line || { type: "none" };
  const a = {
    _type: ue.text,
    shape: r || ot.RECTANGLE,
    options: i,
    text: null
  };
  if (!r)
    throw new Error("Missing/Invalid shape parameter! Example: `addShape(pptxgen.shapes.LINE, {x:1, y:1, w:1, h:1});`");
  const s = {
    type: i.line.type || "solid",
    color: i.line.color || Si,
    transparency: i.line.transparency || 0,
    width: i.line.width || 1,
    dashType: i.line.dashType || "solid",
    beginArrowType: i.line.beginArrowType || null,
    endArrowType: i.line.endArrowType || null
  };
  if (typeof i.line == "object" && i.line.type !== "none" && (i.line = s), i.x = i.x || (i.x === 0 ? 0 : 1), i.y = i.y || (i.y === 0 ? 0 : 1), i.w = i.w || (i.w === 0 ? 0 : 1), i.h = i.h || (i.h === 0 ? 0 : 1), i.objectName = i.objectName ? fe(i.objectName) : `Shape ${e._slideObjects.filter((l) => l._type === ue.text).length}`, typeof i.line == "string") {
    const l = s;
    l.color = String(i.line), i.line = l;
  }
  typeof i.lineSize == "number" && (i.line.width = i.lineSize), typeof i.lineDash == "string" && (i.line.dashType = i.lineDash), typeof i.lineHead == "string" && (i.line.beginArrowType = i.lineHead), typeof i.lineTail == "string" && (i.line.endArrowType = i.lineTail), Rt(e, a), e._slideObjects.push(a);
}
function Oo(e, r, t, i, a, s, l) {
  const A = [e], c = t && typeof t == "object" ? t : {};
  c.objectName = c.objectName ? fe(c.objectName) : `Table ${e._slideObjects.filter((g) => g._type === ue.table).length}`;
  {
    if (r === null || r.length === 0 || !Array.isArray(r))
      throw new Error("addTable: Array expected! EX: 'slide.addTable( [rows], {options} );' (https://gitbrent.github.io/PptxGenJS/docs/api-tables.html)");
    if (!r[0] || !Array.isArray(r[0]))
      throw new Error("addTable: 'rows' should be an array of cells! EX: 'slide.addTable( [ ['A'], ['B'], {text:'C',options:{align:'center'}} ] );' (https://gitbrent.github.io/PptxGenJS/docs/api-tables.html)");
  }
  const n = [];
  r.forEach((g) => {
    const d = [];
    Array.isArray(g) ? g.forEach((h) => {
      const u = {
        _type: ue.tablecell,
        text: "",
        options: typeof h == "object" && h.options ? h.options : {}
      };
      typeof h == "string" || typeof h == "number" ? u.text = h.toString() : h.text && (typeof h.text == "string" || typeof h.text == "number" ? u.text = h.text.toString() : h.text && (u.text = h.text), h.options && typeof h.options == "object" && (u.options = h.options)), u.options.border = u.options.border || c.border || [{ type: "none" }, { type: "none" }, { type: "none" }, { type: "none" }];
      const y = u.options.border;
      !Array.isArray(y) && typeof y == "object" && (u.options.border = [y, y, y, y]), u.options.border[0] || (u.options.border[0] = { type: "none" }), u.options.border[1] || (u.options.border[1] = { type: "none" }), u.options.border[2] || (u.options.border[2] = { type: "none" }), u.options.border[3] || (u.options.border[3] = { type: "none" }), [0, 1, 2, 3].forEach((p) => {
        u.options.border[p] = {
          type: u.options.border[p].type || vt.type,
          color: u.options.border[p].color || vt.color,
          pt: typeof u.options.border[p].pt == "number" ? u.options.border[p].pt : vt.pt
        };
      }), d.push(u);
    }) : (console.log("addTable: tableRows has a bad row. A row should be an array of cells. You provided:"), console.log(g)), n.push(d);
  }), c.x = pe(c.x || (c.x === 0 ? 0 : he / 2), "X", a), c.y = pe(c.y || (c.y === 0 ? 0 : he / 2), "Y", a), c.h && (c.h = pe(c.h, "Y", a)), c.fontSize = c.fontSize || He, c.margin = c.margin === 0 || c.margin ? c.margin : Ii, typeof c.margin == "number" && (c.margin = [Number(c.margin), Number(c.margin), Number(c.margin), Number(c.margin)]), JSON.stringify({ arrRows: n }).indexOf("hyperlink") === -1 && (c.color || (c.color = c.color || Oe)), typeof c.border == "string" ? (console.warn("addTable `border` option must be an object. Ex: `{border: {type:'none'}}`"), c.border = null) : Array.isArray(c.border) && [0, 1, 2, 3].forEach((g) => {
    c.border[g] = c.border[g] ? { type: c.border[g].type || vt.type, color: c.border[g].color || vt.color, pt: c.border[g].pt || vt.pt } : { type: "none" };
  }), c.autoPage = typeof c.autoPage == "boolean" ? c.autoPage : !1, c.autoPageRepeatHeader = typeof c.autoPageRepeatHeader == "boolean" ? c.autoPageRepeatHeader : !1, c.autoPageHeaderRows = typeof c.autoPageHeaderRows < "u" && !isNaN(Number(c.autoPageHeaderRows)) ? Number(c.autoPageHeaderRows) : 1, c.autoPageLineWeight = typeof c.autoPageLineWeight < "u" && !isNaN(Number(c.autoPageLineWeight)) ? Number(c.autoPageLineWeight) : 0, c.autoPageLineWeight && (c.autoPageLineWeight > 1 ? c.autoPageLineWeight = 1 : c.autoPageLineWeight < -1 && (c.autoPageLineWeight = -1));
  let o = Xt;
  if (i && typeof i._margin < "u" && (Array.isArray(i._margin) ? o = i._margin : isNaN(Number(i._margin)) || (o = [Number(i._margin), Number(i._margin), Number(i._margin), Number(i._margin)])), c.colW) {
    const g = n[0].reduce((d, h) => {
      var u;
      return !((u = h?.options) === null || u === void 0) && u.colspan && typeof h.options.colspan == "number" ? d += h.options.colspan : d += 1, d;
    }, 0);
    typeof c.colW == "string" || typeof c.colW == "number" || c.colW && Array.isArray(c.colW) && c.colW.length === 1 && g > 1 ? (c.w = Math.floor(Number(c.colW) * g), c.colW = null) : c.colW && Array.isArray(c.colW) && c.colW.length !== g && (console.warn("addTable: mismatch: (colW.length != data.length) Therefore, defaulting to evenly distributed col widths."), c.colW = null);
  } else c.w ? c.w = pe(c.w, "X", a) : c.w = Math.floor(a._sizeW / he - o[1] - o[3]);
  c.x && c.x < 20 && (c.x = ve(c.x)), c.y && c.y < 20 && (c.y = ve(c.y)), c.w && typeof c.w == "number" && c.w < 20 && (c.w = ve(c.w)), c.h && typeof c.h == "number" && c.h < 20 && (c.h = ve(c.h)), n.forEach((g) => {
    g.forEach((d, h) => {
      typeof d == "number" || typeof d == "string" ? g[h] = { _type: ue.tablecell, text: String(g[h]), options: c } : typeof d == "object" && (typeof d.text == "number" ? g[h].text = g[h].text.toString() : (typeof d.text > "u" || d.text === null) && (g[h].text = ""), g[h].options = d.options || {}, g[h]._type = ue.tablecell);
    });
  });
  const f = [];
  return c && !c.autoPage ? (Rt(e, n), e._slideObjects.push({
    _type: ue.table,
    arrTabRows: n,
    options: Object.assign({}, c)
  })) : (c.autoPageRepeatHeader && (c._arrObjTabHeadRows = n.filter((g, d) => d < c.autoPageHeaderRows)), Mi(n, c, a, i).forEach((g, d) => {
    l(e._slideNum + d) || A.push(s({ masterName: i?._name || null })), d > 0 && (c.y = ve(c.autoPageSlideStartY || c.newSlideStartY || o[0]));
    {
      const h = l(e._slideNum + d);
      c.autoPage = !1, Rt(h, g.rows), h.addTable(g.rows, Object.assign({}, c)), d > 0 && f.push(h);
    }
  })), f;
}
function Hr(e, r, t, i) {
  const a = {
    _type: i ? ue.placeholder : ue.text,
    shape: t?.shape || ot.RECTANGLE,
    text: !r || r.length === 0 ? [{ text: "", options: null }] : r,
    options: t || {}
  };
  function s(l) {
    {
      if (l.placeholder || (l.color = l.color || a.options.color || e.color || Oe), (l.placeholder || i) && (l.bullet = l.bullet || !1), l.placeholder && e._slideLayout && e._slideLayout._slideObjects) {
        const A = e._slideLayout._slideObjects.filter((c) => c._type === "placeholder" && c.options && c.options.placeholder && c.options.placeholder === l.placeholder)[0];
        A?.options && (l = Object.assign(Object.assign({}, l), A.options));
      }
      if (l.objectName = l.objectName ? fe(l.objectName) : `Text ${e._slideObjects.filter((A) => A._type === ue.text).length}`, l.shape === ot.LINE) {
        const A = {
          type: l.line.type || "solid",
          color: l.line.color || Si,
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
      l.line = l.line || {}, l.lineSpacing = l.lineSpacing && !isNaN(l.lineSpacing) ? l.lineSpacing : null, l.lineSpacingMultiple = l.lineSpacingMultiple && !isNaN(l.lineSpacingMultiple) ? l.lineSpacingMultiple : null, l._bodyProp = l._bodyProp || {}, l._bodyProp.autoFit = l.autoFit || !1, l._bodyProp.anchor = l.placeholder ? null : Tt.ctr, l._bodyProp.vert = l.vert || null, l._bodyProp.wrap = typeof l.wrap == "boolean" ? l.wrap : !0, (l.inset && !isNaN(Number(l.inset)) || l.inset === 0) && (l._bodyProp.lIns = ve(l.inset), l._bodyProp.rIns = ve(l.inset), l._bodyProp.tIns = ve(l.inset), l._bodyProp.bIns = ve(l.inset)), typeof l.underline == "boolean" && l.underline === !0 && (l.underline = { style: "sng" });
    }
    return (l.align || "").toLowerCase().indexOf("c") === 0 ? l._bodyProp.align = Ct.center : (l.align || "").toLowerCase().indexOf("l") === 0 ? l._bodyProp.align = Ct.left : (l.align || "").toLowerCase().indexOf("r") === 0 ? l._bodyProp.align = Ct.right : (l.align || "").toLowerCase().indexOf("j") === 0 && (l._bodyProp.align = Ct.justify), (l.valign || "").toLowerCase().indexOf("b") === 0 ? l._bodyProp.anchor = Tt.b : (l.valign || "").toLowerCase().indexOf("m") === 0 ? l._bodyProp.anchor = Tt.ctr : (l.valign || "").toLowerCase().indexOf("t") === 0 && (l._bodyProp.anchor = Tt.t), Ma(l.shadow), l;
  }
  a.options = s(a.options), a.text.forEach((l) => l.options = s(l.options || {})), Rt(e, a.text || ""), e._slideObjects.push(a);
}
function $o(e) {
  (e._slideLayout._slideObjects || []).forEach((r) => {
    r._type === ue.placeholder && e._slideObjects.filter((t) => t.options && t.options.placeholder === r.options.placeholder).length === 0 && Hr(e, [{ text: "" }], r.options, !1);
  });
}
function zi(e, r) {
  var t;
  if (r.bkgd && (r.background || (r.background = {}), typeof r.bkgd == "string" ? r.background.color = r.bkgd : (r.bkgd.data && (r.background.data = r.bkgd.data), r.bkgd.path && (r.background.path = r.bkgd.path), r.bkgd.src && (r.background.path = r.bkgd.src))), !((t = r.background) === null || t === void 0) && t.fill && (r.background.color = r.background.fill), e && (e.path || e.data)) {
    e.path = e.path || "preencoded.png";
    let i = (e.path.split(".").pop() || "png").split("?")[0];
    i === "jpg" && (i = "jpeg"), r._relsMedia = r._relsMedia || [];
    const a = r._relsMedia.length + 1;
    r._relsMedia.push({
      path: e.path,
      type: ue.image,
      extn: i,
      data: e.data || null,
      rId: a,
      Target: `../media/${(r._name || "").replace(/\s+/gi, "-")}-image-${r._relsMedia.length + 1}.${i}`
    }), r._bkgdImgRid = a;
  }
}
function Rt(e, r, t) {
  let i = [];
  typeof r == "string" || typeof r == "number" || (Array.isArray(r) ? i = r : typeof r == "object" && (i = [r]), i.forEach((a, s) => {
    if (t && t[s] && t[s].hyperlink && (a.options = Object.assign(Object.assign({}, a.options), t[s])), Array.isArray(a)) {
      const l = [];
      a.forEach((A) => {
        A.options && !A.text.options && l.push(A.options);
      }), Rt(e, a, l);
    } else if (Array.isArray(a.text))
      Rt(e, a.text, t && t[s] ? [t[s]] : void 0);
    else if (a && typeof a == "object" && a.options && a.options.hyperlink && !a.options.hyperlink._rId)
      if (typeof a.options.hyperlink != "object")
        console.log("ERROR: text `hyperlink` option should be an object. Ex: `hyperlink: {url:'https://github.com'}` ");
      else if (!a.options.hyperlink.url && !a.options.hyperlink.slide)
        console.log("ERROR: 'hyperlink requires either: `url` or `slide`'");
      else {
        const l = at(e);
        e._rels.push({
          type: ue.hyperlink,
          data: a.options.hyperlink.slide ? "slide" : "dummy",
          rId: l,
          Target: fe(a.options.hyperlink.url) || a.options.hyperlink.slide.toString()
        }), a.options.hyperlink._rId = l;
      }
    else a && typeof a == "object" && a.options && a.options.hyperlink && a.options.hyperlink._rId && e._rels.filter((l) => l.rId === a.options.hyperlink._rId).length === 0 && e._rels.push({
      type: ue.hyperlink,
      data: a.options.hyperlink.slide ? "slide" : "dummy",
      rId: a.options.hyperlink._rId,
      Target: fe(a.options.hyperlink.url) || a.options.hyperlink.slide.toString()
    });
  }));
}
class zo {
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
    this._background = r, r && zi(r, this);
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
  addChart(r, t, i) {
    const a = i || {};
    return a._type = r, Oi(this, r, t, i), this;
  }
  /**
   * Add image to Slide
   * @param {ImageProps} options - image options
   * @return {Slide} this Slide
   */
  addImage(r) {
    return $i(this, r), this;
  }
  /**
   * Add media (audio/video) to Slide
   * @param {MediaProps} options - media options
   * @return {Slide} this Slide
   */
  addMedia(r) {
    return Fo(this, r), this;
  }
  /**
   * Add speaker notes to Slide
   * @docs https://gitbrent.github.io/PptxGenJS/docs/speaker-notes.html
   * @param {string} notes - notes to add to slide
   * @return {Slide} this Slide
   */
  addNotes(r) {
    return Mo(this, r), this;
  }
  /**
   * Add shape to Slide
   * @param {SHAPE_NAME} shapeName - shape name
   * @param {ShapeProps} options - shape options
   * @return {Slide} this Slide
   */
  addShape(r, t) {
    return Ia(this, r, t), this;
  }
  /**
   * Add table to Slide
   * @param {TableRow[]} tableRows - table rows
   * @param {TableProps} options - table options
   * @return {Slide} this Slide
   */
  addTable(r, t) {
    return this._newAutoPagedSlides = Oo(this, r, t, this._slideLayout, this._presLayout, this.addSlide, this.getSlide), this;
  }
  /**
   * Add text to Slide
   * @param {string|TextProps[]} text - text string or complex object
   * @param {TextPropsOptions} options - text options
   * @return {Slide} this Slide
   */
  addText(r, t) {
    return Hr(this, typeof r == "string" || typeof r == "number" ? [{ text: r, options: t }] : r, t, !1), this;
  }
}
function Uo(e, r) {
  return Ue(this, void 0, void 0, function* () {
    const t = e.data;
    return yield new Promise((i, a) => {
      var s, l;
      const A = new Ni(), c = (t.length - 1) * 2 + 1, n = ((l = (s = t[0]) === null || s === void 0 ? void 0 : s.labels) === null || l === void 0 ? void 0 : l.length) > 1;
      A.folder("_rels"), A.folder("docProps"), A.folder("xl/_rels"), A.folder("xl/tables"), A.folder("xl/theme"), A.folder("xl/worksheets"), A.folder("xl/worksheets/_rels"), A.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>  <Default Extension="xml" ContentType="application/xml"/>  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>  <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>  <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>
`), A.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>
`), A.file("docProps/app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Macintosh Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>
`), A.file("docProps/core.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>PptxGenJS</dc:creator><cp:lastModifiedBy>PptxGenJS</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">' + (/* @__PURE__ */ new Date()).toISOString() + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + (/* @__PURE__ */ new Date()).toISOString() + "</dcterms:modified></cp:coreProperties>"), A.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>'), A.file("xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="0" formatCode="General"/></numFmts><fonts count="4"><font><sz val="9"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="9"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="10"/><color indexed="8"/><name val="Geneva"/></font><font><sz val="18"/><color indexed="8"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><dxfs count="0"/><tableStyles count="0"/><colors><indexedColors><rgbColor rgb="ff000000"/><rgbColor rgb="ffffffff"/><rgbColor rgb="ffff0000"/><rgbColor rgb="ff00ff00"/><rgbColor rgb="ff0000ff"/><rgbColor rgb="ffffff00"/><rgbColor rgb="ffff00ff"/><rgbColor rgb="ff00ffff"/><rgbColor rgb="ff000000"/><rgbColor rgb="ffffffff"/><rgbColor rgb="ff878787"/><rgbColor rgb="fff9f9f9"/></indexedColors></colors></styleSheet>
`), A.file("xl/theme/theme1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light" panose="020F0302020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="Yu Gothic Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="DengXian Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri" panose="020F0502020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="Yu Gothic"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="DengXian"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst></a:theme>'), A.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="7" lowestEdited="6" rupBuild="10507"/><workbookPr/><bookViews><workbookView xWindow="0" yWindow="500" windowWidth="20960" windowHeight="15960"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="0" concurrentCalc="0"/></workbook>
`), A.file("xl/worksheets/_rels/sheet1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/></Relationships>
`);
      {
        let o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D)
          o += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${c}" uniqueCount="${c}">`;
        else if (e.opts._type === re.SCATTER)
          o += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${t.length}" uniqueCount="${t.length}">`;
        else if (n) {
          let f = t.length;
          t[0].labels.forEach((g) => f += g.filter((d) => d && d !== "").length), o += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${f}" uniqueCount="${f}">`, o += "<si><t/></si>";
        } else {
          const f = t.length + t[0].labels.length * t[0].labels[0].length + t[0].labels.length, g = t.length + t[0].labels.length * t[0].labels[0].length + 1;
          o += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${f}" uniqueCount="${g}">`, o += '<si><t xml:space="preserve"></t></si>';
        }
        e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D ? t.forEach((f, g) => {
          g === 0 ? o += "<si><t>X-Axis</t></si>" : (o += `<si><t>${fe(f.name || `Y-Axis${g}`)}</t></si>`, o += `<si><t>${fe(`Size${g}`)}</t></si>`);
        }) : t.forEach((f) => {
          o += `<si><t>${fe((f.name || " ").replace("X-Axis", "X-Values"))}</t></si>`;
        }), e.opts._type !== re.BUBBLE && e.opts._type !== re.BUBBLE3D && e.opts._type !== re.SCATTER && t[0].labels.slice().reverse().forEach((f) => {
          f.filter((g) => g && g !== "").forEach((g) => {
            o += `<si><t>${fe(g)}</t></si>`;
          });
        }), o += `</sst>
`, A.file("xl/sharedStrings.xml", o);
      }
      {
        let o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D) {
          o += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${Ce(c)}${c}" totalsRowShown="0">`, o += `<tableColumns count="${c}">`;
          let f = 1;
          t.forEach((g, d) => {
            d === 0 ? o += `<tableColumn id="${d + 1}" name="X-Values"/>` : (o += `<tableColumn id="${d + f}" name="${g.name}"/>`, f++, o += `<tableColumn id="${d + f}" name="Size${d}"/>`);
          });
        } else e.opts._type === re.SCATTER ? (o += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${Ce(t.length)}${t[0].values.length + 1}" totalsRowShown="0">`, o += `<tableColumns count="${t.length}">`, t.forEach((f, g) => {
          o += `<tableColumn id="${g + 1}" name="${g === 0 ? "X-Values" : "Y-Value "}${g}"/>`;
        })) : (o += `<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A1:${Ce(t.length + t[0].labels.length)}${t[0].labels[0].length + 1}'" totalsRowShown="0">`, o += `<tableColumns count="${t.length + t[0].labels.length}">`, t[0].labels.forEach((f, g) => {
          o += `<tableColumn id="${g + 1}" name="Column${g + 1}"/>`;
        }), t.forEach((f, g) => {
          o += `<tableColumn id="${g + t[0].labels.length + 1}" name="${fe(f.name)}"/>`;
        }));
        o += "</tableColumns>", o += '<tableStyleInfo showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>', o += "</table>", A.file("xl/tables/table1.xml", o);
      }
      {
        let o = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        if (o += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">', e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D ? o += `<dimension ref="A1:${Ce(c)}${t[0].values.length + 1}"/>` : e.opts._type === re.SCATTER ? o += `<dimension ref="A1:${Ce(t.length)}${t[0].values.length + 1}"/>` : o += `<dimension ref="A1:${Ce(t.length + 1)}${t[0].values.length + 1}"/>`, o += '<sheetViews><sheetView tabSelected="1" workbookViewId="0"><selection activeCell="B1" sqref="B1"/></sheetView></sheetViews>', o += '<sheetFormatPr baseColWidth="10" defaultRowHeight="16"/>', e.opts._type === re.BUBBLE || e.opts._type === re.BUBBLE3D) {
          o += "<sheetData>", o += `<row r="1" spans="1:${c}">`, o += '<c r="A1" t="s"><v>0</v></c>';
          for (let f = 1; f < c; f++)
            o += `<c r="${Ce(f + 1)}1" t="s"><v>${f}</v></c>`;
          o += "</row>", t[0].values.forEach((f, g) => {
            o += `<row r="${g + 2}" spans="1:${c}">`, o += `<c r="A${g + 2}"><v>${f}</v></c>`;
            let d = 2;
            for (let h = 1; h < t.length; h++)
              o += `<c r="${Ce(d)}${g + 2}"><v>${t[h].values[g] || ""}</v></c>`, d++, o += `<c r="${Ce(d)}${g + 2}"><v>${t[h].sizes[g] || ""}</v></c>`, d++;
            o += "</row>";
          });
        } else if (e.opts._type === re.SCATTER) {
          o += "<sheetData>", o += `<row r="1" spans="1:${t.length}">`;
          for (let f = 0; f < t.length; f++)
            o += `<c r="${Ce(f + 1)}1" t="s"><v>${f}</v></c>`;
          o += "</row>", t[0].values.forEach((f, g) => {
            o += `<row r="${g + 2}" spans="1:${t.length}">`, o += `<c r="A${g + 2}"><v>${f}</v></c>`;
            for (let d = 1; d < t.length; d++)
              o += `<c r="${Ce(d + 1)}${g + 2}"><v>${t[d].values[g] || t[d].values[g] === 0 ? t[d].values[g] : ""}</v></c>`;
            o += "</row>";
          });
        } else if (o += "<sheetData>", n) {
          o += `<row r="1" spans="1:${t.length + t[0].labels.length}">`;
          for (let h = 0; h < t[0].labels.length; h++)
            o += `<c r="${Ce(h + 1)}1" t="s"><v>0</v></c>`;
          for (let h = t[0].labels.length - 1; h < t.length + t[0].labels.length - 1; h++)
            o += `<c r="${Ce(h + t[0].labels.length)}1" t="s"><v>${h}</v></c>`;
          o += "</row>";
          const f = t.length, g = t[0].labels[0].length, d = t[0].labels.length;
          for (let h = 0; h < g; h++) {
            o += `<row r="${h + 2}" spans="1:${f + d}">`;
            let u = f;
            const y = t[0].labels.slice().reverse();
            y.forEach((m, p) => {
              if (m[h]) {
                const T = p === 0 ? 1 : y[p - 1].filter((v) => v && v !== "").length;
                u += T, o += `<c r="${Ce(h + 1 + p)}${h + 2}" t="s"><v>${u}</v></c>`;
              }
            });
            for (let m = 0; m < f; m++)
              o += `<c r="${Ce(d + m + 1)}${h + 2}"><v>${t[m].values[h] || 0}</v></c>`;
            o += "</row>";
          }
        } else {
          o += `<row r="1" spans="1:${t.length + t[0].labels.length}">`, t[0].labels.forEach((f, g) => {
            o += `<c r="${Ce(g + 1)}1" t="s"><v>0</v></c>`;
          });
          for (let f = 0; f < t.length; f++)
            o += `<c r="${Ce(f + 1 + t[0].labels.length)}1" t="s"><v>${f + 1}</v></c>`;
          o += "</row>", t[0].labels[0].forEach((f, g) => {
            o += `<row r="${g + 2}" spans="1:${t.length + t[0].labels.length}">`;
            for (let d = t[0].labels.length - 1; d >= 0; d--)
              o += `<c r="${Ce(t[0].labels.length - d)}${g + 2}" t="s">`, o += `<v>${t.length + g + 1}</v>`, o += "</c>";
            for (let d = 0; d < t.length; d++)
              o += `<c r="${Ce(t[0].labels.length + d + 1)}${g + 2}"><v>${t[d].values[g] || ""}</v></c>`;
            o += "</row>";
          });
        }
        o += "</sheetData>", o += '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>', o += `</worksheet>
`, A.file("xl/worksheets/sheet1.xml", o);
      }
      A.generateAsync({ type: "base64" }).then((o) => {
        r.file(`ppt/embeddings/Microsoft_Excel_Worksheet${e.globalId}.xlsx`, o, { base64: !0 }), r.file("ppt/charts/_rels/" + e.fileName + ".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/package" Target="../embeddings/Microsoft_Excel_Worksheet${e.globalId}.xlsx"/></Relationships>`), r.file(`ppt/charts/${e.fileName}`, Go(e)), i("");
      }).catch((o) => {
        a(o);
      });
    });
  });
}
function Go(e) {
  var r, t, i, a;
  let s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', l = !1;
  if (s += '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">', s += '<c:date1904 val="0"/>', s += `<c:roundedCorners val="${e.opts.chartArea.roundedCorners ? "1" : "0"}"/>`, s += "<c:chart>", e.opts.showTitle ? (s += Kr({
    title: e.opts.title || "Chart Title",
    color: e.opts.titleColor,
    fontFace: e.opts.titleFontFace,
    fontSize: e.opts.titleFontSize || Lo,
    titleAlign: e.opts.titleAlign,
    titleBold: e.opts.titleBold,
    titlePos: e.opts.titlePos,
    titleRotate: e.opts.titleRotate
  }, e.opts.x, e.opts.y), s += '<c:autoTitleDeleted val="0"/>') : s += '<c:autoTitleDeleted val="1"/>', e.opts._type === re.BAR3D && (s += `<c:view3D><c:rotX val="${e.opts.v3DRotX}"/><c:rotY val="${e.opts.v3DRotY}"/><c:rAngAx val="${e.opts.v3DRAngAx ? 1 : 0}"/><c:perspective val="${e.opts.v3DPerspective}"/></c:view3D>`), s += "<c:plotArea>", e.opts.layout ? (s += "<c:layout>", s += " <c:manualLayout>", s += '  <c:layoutTarget val="inner" />', s += '  <c:xMode val="edge" />', s += '  <c:yMode val="edge" />', s += '  <c:x val="' + (e.opts.layout.x || 0) + '" />', s += '  <c:y val="' + (e.opts.layout.y || 0) + '" />', s += '  <c:w val="' + (e.opts.layout.w || 1) + '" />', s += '  <c:h val="' + (e.opts.layout.h || 1) + '" />', s += " </c:manualLayout>", s += "</c:layout>") : s += "<c:layout/>", Array.isArray(e.opts._type) ? e.opts._type.forEach((A) => {
    const c = Object.assign(Object.assign({}, e.opts), A.options), n = c.secondaryValAxis ? zr : tt, o = c.secondaryCatAxis ? La : Mt;
    l = l || c.secondaryValAxis, s += en(A.type, A.data, c, n, o);
  }) : s += en(e.opts._type, e.data, e.opts, tt, Mt), e.opts._type !== re.PIE && e.opts._type !== re.DOUGHNUT) {
    if (e.opts.valAxes && e.opts.valAxes.length > 1 && !l)
      throw new Error("Secondary axis must be used by one of the multiple charts");
    if (e.opts.catAxes) {
      if (!e.opts.valAxes || e.opts.valAxes.length !== e.opts.catAxes.length)
        throw new Error("There must be the same number of value and category axes.");
      s += la(Object.assign(Object.assign({}, e.opts), e.opts.catAxes[0]), Mt, tt);
    } else
      s += la(e.opts, Mt, tt);
    e.opts.valAxes ? (s += ca(Object.assign(Object.assign({}, e.opts), e.opts.valAxes[0]), tt), e.opts.valAxes[1] && (s += ca(Object.assign(Object.assign({}, e.opts), e.opts.valAxes[1]), zr))) : (s += ca(e.opts, tt), e.opts._type === re.BAR3D && (s += Xo(e.opts, ki, tt))), !((r = e.opts) === null || r === void 0) && r.catAxes && (!((t = e.opts) === null || t === void 0) && t.catAxes[1]) && (s += la(Object.assign(Object.assign({}, e.opts), e.opts.catAxes[1]), La, zr));
  }
  return e.opts.showDataTable && (s += "<c:dTable>", s += `  <c:showHorzBorder val="${e.opts.showDataTableHorzBorder ? 1 : 0}"/>`, s += `  <c:showVertBorder val="${e.opts.showDataTableVertBorder ? 1 : 0}"/>`, s += `  <c:showOutline    val="${e.opts.showDataTableOutline ? 1 : 0}"/>`, s += `  <c:showKeys       val="${e.opts.showDataTableKeys ? 1 : 0}"/>`, s += "  <c:spPr>", s += "    <a:noFill/>", s += '    <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="tx1"><a:lumMod val="15000"/><a:lumOff val="85000"/></a:schemeClr></a:solidFill><a:round/></a:ln>', s += "    <a:effectLst/>", s += "  </c:spPr>", s += "  <c:txPr>", s += '   <a:bodyPr rot="0" spcFirstLastPara="1" vertOverflow="ellipsis" vert="horz" wrap="square" anchor="ctr" anchorCtr="1"/>', s += "   <a:lstStyle/>", s += "   <a:p>", s += '     <a:pPr rtl="0">', s += `       <a:defRPr sz="${Math.round((e.opts.dataTableFontSize || He) * 100)}" b="0" i="0" u="none" strike="noStrike" kern="1200" baseline="0">`, s += '         <a:solidFill><a:schemeClr val="tx1"><a:lumMod val="65000"/><a:lumOff val="35000"/></a:schemeClr></a:solidFill>', s += '         <a:latin typeface="+mn-lt"/>', s += '         <a:ea typeface="+mn-ea"/>', s += '         <a:cs typeface="+mn-cs"/>', s += "       </a:defRPr>", s += "     </a:pPr>", s += '    <a:endParaRPr lang="en-US"/>', s += "   </a:p>", s += " </c:txPr>", s += "</c:dTable>"), s += "  <c:spPr>", s += !((i = e.opts.plotArea.fill) === null || i === void 0) && i.color ? Ge(e.opts.plotArea.fill) : "<a:noFill/>", s += e.opts.plotArea.border ? `<a:ln w="${de(e.opts.plotArea.border.pt)}" cap="flat">${Ge(e.opts.plotArea.border.color)}</a:ln>` : "<a:ln><a:noFill/></a:ln>", s += "    <a:effectLst/>", s += "  </c:spPr>", s += "</c:plotArea>", e.opts.showLegend && (s += "<c:legend>", s += '<c:legendPos val="' + e.opts.legendPos + '"/>', s += '<c:overlay val="0"/>', (e.opts.legendFontFace || e.opts.legendFontSize || e.opts.legendColor) && (s += "<c:txPr>", s += "  <a:bodyPr/>", s += "  <a:lstStyle/>", s += "  <a:p>", s += "    <a:pPr>", s += e.opts.legendFontSize ? `<a:defRPr sz="${Math.round(Number(e.opts.legendFontSize) * 100)}">` : "<a:defRPr>", e.opts.legendColor && (s += Ge(e.opts.legendColor)), e.opts.legendFontFace && (s += '<a:latin typeface="' + e.opts.legendFontFace + '"/>'), e.opts.legendFontFace && (s += '<a:cs    typeface="' + e.opts.legendFontFace + '"/>'), s += "      </a:defRPr>", s += "    </a:pPr>", s += '    <a:endParaRPr lang="en-US"/>', s += "  </a:p>", s += "</c:txPr>"), s += "</c:legend>"), s += '  <c:plotVisOnly val="1"/>', s += '  <c:dispBlanksAs val="' + e.opts.displayBlanksAs + '"/>', e.opts._type === re.SCATTER && (s += '<c:showDLblsOverMax val="1"/>'), s += "</c:chart>", s += "<c:spPr>", s += !((a = e.opts.chartArea.fill) === null || a === void 0) && a.color ? Ge(e.opts.chartArea.fill) : "<a:noFill/>", s += e.opts.chartArea.border ? `<a:ln w="${de(e.opts.chartArea.border.pt)}" cap="flat">${Ge(e.opts.chartArea.border.color)}</a:ln>` : "<a:ln><a:noFill/></a:ln>", s += "  <a:effectLst/>", s += "</c:spPr>", s += '<c:externalData r:id="rId1"><c:autoUpdate val="0"/></c:externalData>', s += "</c:chartSpace>", s;
}
function en(e, r, t, i, a, s) {
  let l = -1, A = 1, c = null, n = "";
  switch (e) {
    case re.AREA:
    case re.BAR:
    case re.BAR3D:
    case re.LINE:
    case re.RADAR:
      n += `<c:${e}Chart>`, e === re.AREA && t.barGrouping === "stacked" && (n += '<c:grouping val="' + t.barGrouping + '"/>'), (e === re.BAR || e === re.BAR3D) && (n += '<c:barDir val="' + t.barDir + '"/>', n += '<c:grouping val="' + (t.barGrouping || "clustered") + '"/>'), e === re.RADAR && (n += '<c:radarStyle val="' + t.radarStyle + '"/>'), n += '<c:varyColors val="0"/>', r.forEach((o) => {
        var f;
        l++, n += "<c:ser>", n += `  <c:idx val="${o._dataIndex}"/><c:order val="${o._dataIndex}"/>`, n += "  <c:tx>", n += "    <c:strRef>", n += "      <c:f>Sheet1!$" + Ce(o._dataIndex + o.labels.length + 1) + "$1</c:f>", n += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(o.name) + "</c:v></c:pt></c:strCache>", n += "    </c:strRef>", n += "  </c:tx>";
        const g = t.chartColors ? t.chartColors[l % t.chartColors.length] : null;
        n += "  <c:spPr>", g === "transparent" ? n += "<a:noFill/>" : t.chartColorsOpacity ? n += "<a:solidFill>" + _e(g, `<a:alpha val="${Math.round(t.chartColorsOpacity * 1e3)}"/>`) + "</a:solidFill>" : n += "<a:solidFill>" + _e(g) + "</a:solidFill>", e === re.LINE || e === re.RADAR ? t.lineSize === 0 ? n += "<a:ln><a:noFill/></a:ln>" : (n += `<a:ln w="${de(t.lineSize)}" cap="${Gr(t.lineCap)}"><a:solidFill>${_e(g)}</a:solidFill>`, n += '<a:prstDash val="' + (t.lineDash || "solid") + '"/><a:round/></a:ln>') : t.dataBorder && (n += `<a:ln w="${de(t.dataBorder.pt)}" cap="${Gr(t.lineCap)}"><a:solidFill>${_e(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`), n += ft(t.shadow, dt), n += "  </c:spPr>", n += '  <c:invertIfNegative val="0"/>', e !== re.RADAR && (n += "<c:dLbls>", n += `<c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, t.dataLabelBkgrdColors && (n += `<c:spPr><a:solidFill>${_e(g)}</a:solidFill></c:spPr>`), n += "<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>", n += `<a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || He) * 100)}" u="none">`, n += `<a:solidFill>${_e(t.dataLabelColor || Oe)}</a:solidFill>`, n += `<a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, n += "</a:defRPr></a:pPr></a:p></c:txPr>", t.dataLabelPosition && (n += `<c:dLblPos val="${t.dataLabelPosition}"/>`), n += '<c:showLegendKey val="0"/>', n += `<c:showVal val="${t.showValue ? "1" : "0"}"/>`, n += `<c:showCatName val="0"/><c:showSerName val="${t.showSerName ? "1" : "0"}"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>`, n += `<c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, n += "</c:dLbls>"), (e === re.LINE || e === re.RADAR) && (n += "<c:marker>", n += '  <c:symbol val="' + t.lineDataSymbol + '"/>', t.lineDataSymbolSize && (n += `<c:size val="${t.lineDataSymbolSize}"/>`), n += "  <c:spPr>", n += `    <a:solidFill>${_e(t.chartColors[o._dataIndex + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : o._dataIndex])}</a:solidFill>`, n += `    <a:ln w="${t.lineDataSymbolLineSize}" cap="flat"><a:solidFill>${_e(t.lineDataSymbolLineColor || g)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`, n += "    <a:effectLst/>", n += "  </c:spPr>", n += "</c:marker>"), (e === re.BAR || e === re.BAR3D) && r.length === 1 && (t.chartColors && t.chartColors !== Ot && t.chartColors.length > 1 || !((f = t.invertedColors) === null || f === void 0) && f.length) && o.values.forEach((d, h) => {
          const u = d < 0 ? t.invertedColors || t.chartColors || Ot : t.chartColors || [];
          n += "  <c:dPt>", n += `    <c:idx val="${h}"/>`, n += '      <c:invertIfNegative val="0"/>', n += '    <c:bubble3D val="0"/>', n += "    <c:spPr>", t.lineSize === 0 ? n += "<a:ln><a:noFill/></a:ln>" : e === re.BAR ? (n += "<a:solidFill>", n += '  <a:srgbClr val="' + u[h % u.length] + '"/>', n += "</a:solidFill>") : (n += "<a:ln>", n += "  <a:solidFill>", n += '   <a:srgbClr val="' + u[h % u.length] + '"/>', n += "  </a:solidFill>", n += "</a:ln>"), n += ft(t.shadow, dt), n += "    </c:spPr>", n += "  </c:dPt>";
        }), n += "<c:cat>", t.catLabelFormatCode ? (n += "  <c:numRef>", n += `    <c:f>Sheet1!$A$2:$A$${o.labels[0].length + 1}</c:f>`, n += "    <c:numCache>", n += "      <c:formatCode>" + (t.catLabelFormatCode || "General") + "</c:formatCode>", n += `      <c:ptCount val="${o.labels[0].length}"/>`, o.labels[0].forEach((d, h) => n += `<c:pt idx="${h}"><c:v>${fe(d)}</c:v></c:pt>`), n += "    </c:numCache>", n += "  </c:numRef>") : (n += "  <c:multiLvlStrRef>", n += `    <c:f>Sheet1!$A$2:$${Ce(o.labels.length)}$${o.labels[0].length + 1}</c:f>`, n += "    <c:multiLvlStrCache>", n += `      <c:ptCount val="${o.labels[0].length}"/>`, o.labels.forEach((d) => {
          n += "<c:lvl>", d.forEach((h, u) => n += `<c:pt idx="${u}"><c:v>${fe(h)}</c:v></c:pt>`), n += "</c:lvl>";
        }), n += "    </c:multiLvlStrCache>", n += "  </c:multiLvlStrRef>"), n += "</c:cat>", n += "<c:val>", n += "  <c:numRef>", n += `<c:f>Sheet1!$${Ce(o._dataIndex + o.labels.length + 1)}$2:$${Ce(o._dataIndex + o.labels.length + 1)}$${o.labels[0].length + 1}</c:f>`, n += "    <c:numCache>", n += "      <c:formatCode>" + (t.valLabelFormatCode || t.dataTableFormatCode || "General") + "</c:formatCode>", n += `      <c:ptCount val="${o.labels[0].length}"/>`, o.values.forEach((d, h) => n += `<c:pt idx="${h}"><c:v>${d || d === 0 ? d : ""}</c:v></c:pt>`), n += "    </c:numCache>", n += "  </c:numRef>", n += "</c:val>", e === re.LINE && (n += '<c:smooth val="' + (t.lineSmooth ? "1" : "0") + '"/>'), n += "</c:ser>";
      }), n += "  <c:dLbls>", n += `    <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, n += "    <c:txPr>", n += "      <a:bodyPr/>", n += "      <a:lstStyle/>", n += "      <a:p><a:pPr>", n += `        <a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || He) * 100)}" u="none">`, n += "          <a:solidFill>" + _e(t.dataLabelColor || Oe) + "</a:solidFill>", n += '          <a:latin typeface="' + (t.dataLabelFontFace || "Arial") + '"/>', n += "        </a:defRPr>", n += "      </a:pPr></a:p>", n += "    </c:txPr>", t.dataLabelPosition && (n += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), n += '    <c:showLegendKey val="0"/>', n += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', n += '    <c:showCatName val="0"/>', n += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', n += '    <c:showPercent val="0"/>', n += '    <c:showBubbleSize val="0"/>', n += `    <c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, n += "  </c:dLbls>", e === re.BAR ? (n += `  <c:gapWidth val="${t.barGapWidthPct}"/>`, n += `  <c:overlap val="${(t.barGrouping || "").includes("tacked") ? 100 : t.barOverlapPct ? t.barOverlapPct : 0}"/>`) : e === re.BAR3D ? (n += `  <c:gapWidth val="${t.barGapWidthPct}"/>`, n += `  <c:gapDepth val="${t.barGapDepthPct}"/>`, n += '  <c:shape val="' + t.bar3DShape + '"/>') : e === re.LINE && (n += '  <c:marker val="1"/>'), n += `<c:axId val="${a}"/><c:axId val="${i}"/><c:axId val="${ki}"/>`, n += `</c:${e}Chart>`;
      break;
    case re.SCATTER:
      n += "<c:" + e + "Chart>", n += '<c:scatterStyle val="lineMarker"/>', n += '<c:varyColors val="0"/>', l = -1, r.filter((o, f) => f > 0).forEach((o, f) => {
        l++, n += "<c:ser>", n += `  <c:idx val="${f}"/>`, n += `  <c:order val="${f}"/>`, n += "  <c:tx>", n += "    <c:strRef>", n += `      <c:f>Sheet1!$${Ce(f + 2)}$1</c:f>`, n += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(o.name) + "</c:v></c:pt></c:strCache>", n += "    </c:strRef>", n += "  </c:tx>", n += "  <c:spPr>";
        {
          const g = t.chartColors[l % t.chartColors.length];
          g === "transparent" ? n += "<a:noFill/>" : t.chartColorsOpacity ? n += "<a:solidFill>" + _e(g, '<a:alpha val="' + Math.round(t.chartColorsOpacity * 1e3).toString() + '"/>') + "</a:solidFill>" : n += "<a:solidFill>" + _e(g) + "</a:solidFill>", t.lineSize === 0 ? n += "<a:ln><a:noFill/></a:ln>" : (n += `<a:ln w="${de(t.lineSize)}" cap="${Gr(t.lineCap)}"><a:solidFill>${_e(g)}</a:solidFill>`, n += `<a:prstDash val="${t.lineDash || "solid"}"/><a:round/></a:ln>`), n += ft(t.shadow, dt);
        }
        if (n += "  </c:spPr>", n += "<c:marker>", n += '  <c:symbol val="' + t.lineDataSymbol + '"/>', t.lineDataSymbolSize && (n += `<c:size val="${t.lineDataSymbolSize}"/>`), n += "<c:spPr>", n += `<a:solidFill>${_e(t.chartColors[f + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : f])}</a:solidFill>`, n += `<a:ln w="${t.lineDataSymbolLineSize}" cap="flat"><a:solidFill>${_e(t.lineDataSymbolLineColor || t.chartColors[l % t.chartColors.length])}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`, n += "<a:effectLst/>", n += "</c:spPr>", n += "</c:marker>", t.showLabel) {
          const g = Ur("-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
          o.labels[0] && (t.dataLabelFormatScatter === "custom" || t.dataLabelFormatScatter === "customXY") && (n += "<c:dLbls>", o.labels[0].forEach((d, h) => {
            (t.dataLabelFormatScatter === "custom" || t.dataLabelFormatScatter === "customXY") && (n += "  <c:dLbl>", n += `    <c:idx val="${h}"/>`, n += "    <c:tx>", n += "      <c:rich>", n += "            <a:bodyPr>", n += "                <a:spAutoFit/>", n += "            </a:bodyPr>", n += "            <a:lstStyle/>", n += "            <a:p>", n += "                <a:pPr>", n += "                    <a:defRPr/>", n += "                </a:pPr>", n += "              <a:r>", n += '                    <a:rPr lang="' + (t.lang || "en-US") + '" dirty="0"/>', n += "                    <a:t>" + fe(d) + "</a:t>", n += "              </a:r>", t.dataLabelFormatScatter === "customXY" && !/^ *$/.test(d) && (n += "              <a:r>", n += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', n += "                  <a:t> (</a:t>", n += "              </a:r>", n += '              <a:fld id="{' + Ur("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") + '}" type="XVALUE">', n += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0"/>', n += "                  <a:pPr>", n += "                      <a:defRPr/>", n += "                  </a:pPr>", n += "                  <a:t>[" + fe(o.name) + "</a:t>", n += "              </a:fld>", n += "              <a:r>", n += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', n += "                  <a:t>, </a:t>", n += "              </a:r>", n += '              <a:fld id="{' + Ur("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") + '}" type="YVALUE">', n += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0"/>', n += "                  <a:pPr>", n += "                      <a:defRPr/>", n += "                  </a:pPr>", n += "                  <a:t>[" + fe(o.name) + "]</a:t>", n += "              </a:fld>", n += "              <a:r>", n += '                  <a:rPr lang="' + (t.lang || "en-US") + '" baseline="0" dirty="0"/>', n += "                  <a:t>)</a:t>", n += "              </a:r>", n += '              <a:endParaRPr lang="' + (t.lang || "en-US") + '" dirty="0"/>'), n += "            </a:p>", n += "      </c:rich>", n += "    </c:tx>", n += "    <c:spPr>", n += "        <a:noFill/>", n += "        <a:ln>", n += "            <a:noFill/>", n += "        </a:ln>", n += "        <a:effectLst/>", n += "    </c:spPr>", t.dataLabelPosition && (n += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), n += '    <c:showLegendKey val="0"/>', n += '    <c:showVal val="0"/>', n += '    <c:showCatName val="0"/>', n += '    <c:showSerName val="0"/>', n += '    <c:showPercent val="0"/>', n += '    <c:showBubbleSize val="0"/>', n += '       <c:showLeaderLines val="1"/>', n += "    <c:extLst>", n += '      <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart"/>', n += '      <c:ext uri="{C3380CC4-5D6E-409C-BE32-E72D297353CC}" xmlns:c16="http://schemas.microsoft.com/office/drawing/2014/chart">', n += `            <c16:uniqueId val="{${"00000000".substring(0, 8 - (h + 1).toString().length).toString()}${h + 1}${g}}"/>`, n += "      </c:ext>", n += "        </c:extLst>", n += "</c:dLbl>");
          }), n += "</c:dLbls>"), t.dataLabelFormatScatter === "XY" && (n += "<c:dLbls>", n += "    <c:spPr>", n += "        <a:noFill/>", n += "        <a:ln>", n += "            <a:noFill/>", n += "        </a:ln>", n += "          <a:effectLst/>", n += "    </c:spPr>", n += "    <c:txPr>", n += "        <a:bodyPr>", n += "            <a:spAutoFit/>", n += "        </a:bodyPr>", n += "        <a:lstStyle/>", n += "        <a:p>", n += "            <a:pPr>", n += "                <a:defRPr/>", n += "            </a:pPr>", n += '            <a:endParaRPr lang="en-US"/>', n += "        </a:p>", n += "    </c:txPr>", t.dataLabelPosition && (n += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), n += '    <c:showLegendKey val="0"/>', n += ` <c:showVal val="${t.showLabel ? "1" : "0"}"/>`, n += ` <c:showCatName val="${t.showLabel ? "1" : "0"}"/>`, n += ` <c:showSerName val="${t.showSerName ? "1" : "0"}"/>`, n += '    <c:showPercent val="0"/>', n += '    <c:showBubbleSize val="0"/>', n += "    <c:extLst>", n += '        <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">', n += '            <c15:showLeaderLines val="1"/>', n += "        </c:ext>", n += "    </c:extLst>", n += "</c:dLbls>");
        }
        r.length === 1 && t.chartColors !== Ot && o.values.forEach((g, d) => {
          const h = g < 0 ? t.invertedColors || t.chartColors || Ot : t.chartColors || [];
          n += "  <c:dPt>", n += `    <c:idx val="${d}"/>`, n += '      <c:invertIfNegative val="0"/>', n += '    <c:bubble3D val="0"/>', n += "    <c:spPr>", t.lineSize === 0 ? n += "<a:ln><a:noFill/></a:ln>" : (n += "<a:solidFill>", n += ' <a:srgbClr val="' + h[d % h.length] + '"/>', n += "</a:solidFill>"), n += ft(t.shadow, dt), n += "    </c:spPr>", n += "  </c:dPt>";
        }), n += "<c:xVal>", n += "  <c:numRef>", n += `    <c:f>Sheet1!$A$2:$A$${r[0].values.length + 1}</c:f>`, n += "    <c:numCache>", n += "      <c:formatCode>General</c:formatCode>", n += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((g, d) => {
          n += `<c:pt idx="${d}"><c:v>${g || g === 0 ? g : ""}</c:v></c:pt>`;
        }), n += "    </c:numCache>", n += "  </c:numRef>", n += "</c:xVal>", n += "<c:yVal>", n += "  <c:numRef>", n += `    <c:f>Sheet1!$${Ce(f + 2)}$2:$${Ce(f + 2)}$${r[0].values.length + 1}</c:f>`, n += "    <c:numCache>", n += "      <c:formatCode>General</c:formatCode>", n += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((g, d) => {
          n += `<c:pt idx="${d}"><c:v>${o.values[d] || o.values[d] === 0 ? o.values[d] : ""}</c:v></c:pt>`;
        }), n += "    </c:numCache>", n += "  </c:numRef>", n += "</c:yVal>", n += '<c:smooth val="' + (t.lineSmooth ? "1" : "0") + '"/>', n += "</c:ser>";
      }), n += "  <c:dLbls>", n += `    <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, n += "    <c:txPr>", n += "      <a:bodyPr/>", n += "      <a:lstStyle/>", n += "      <a:p><a:pPr>", n += `        <a:defRPr b="${t.dataLabelFontBold ? "1" : "0"}" i="${t.dataLabelFontItalic ? "1" : "0"}" strike="noStrike" sz="${Math.round((t.dataLabelFontSize || He) * 100)}" u="none">`, n += "          <a:solidFill>" + _e(t.dataLabelColor || Oe) + "</a:solidFill>", n += '          <a:latin typeface="' + (t.dataLabelFontFace || "Arial") + '"/>', n += "        </a:defRPr>", n += "      </a:pPr></a:p>", n += "    </c:txPr>", t.dataLabelPosition && (n += ' <c:dLblPos val="' + t.dataLabelPosition + '"/>'), n += '    <c:showLegendKey val="0"/>', n += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', n += '    <c:showCatName val="0"/>', n += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', n += '    <c:showPercent val="0"/>', n += '    <c:showBubbleSize val="0"/>', n += "  </c:dLbls>", n += `<c:axId val="${a}"/><c:axId val="${i}"/>`, n += "</c:" + e + "Chart>";
      break;
    case re.BUBBLE:
    case re.BUBBLE3D:
      n += "<c:bubbleChart>", n += '<c:varyColors val="0"/>', l = -1, r.filter((o, f) => f > 0).forEach((o, f) => {
        l++, n += "<c:ser>", n += `  <c:idx val="${f}"/>`, n += `  <c:order val="${f}"/>`, n += "  <c:tx>", n += "    <c:strRef>", n += "      <c:f>Sheet1!$" + Ce(A + 1) + "$1</c:f>", n += '      <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>' + fe(o.name) + "</c:v></c:pt></c:strCache>", n += "    </c:strRef>", n += "  </c:tx>";
        {
          n += "<c:spPr>";
          const g = t.chartColors[l % t.chartColors.length];
          g === "transparent" ? n += "<a:noFill/>" : t.chartColorsOpacity ? n += `<a:solidFill>${_e(g, '<a:alpha val="' + Math.round(t.chartColorsOpacity * 1e3).toString() + '"/>')}</a:solidFill>` : n += "<a:solidFill>" + _e(g) + "</a:solidFill>", t.lineSize === 0 ? n += "<a:ln><a:noFill/></a:ln>" : t.dataBorder ? n += `<a:ln w="${de(t.dataBorder.pt)}" cap="flat"><a:solidFill>${_e(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>` : (n += `<a:ln w="${de(t.lineSize)}" cap="flat"><a:solidFill>${_e(g)}</a:solidFill>`, n += `<a:prstDash val="${t.lineDash || "solid"}"/><a:round/></a:ln>`), n += ft(t.shadow, dt), n += "</c:spPr>";
        }
        n += "<c:xVal>", n += "  <c:numRef>", n += `    <c:f>Sheet1!$A$2:$A$${r[0].values.length + 1}</c:f>`, n += "    <c:numCache>", n += "      <c:formatCode>General</c:formatCode>", n += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((g, d) => {
          n += `<c:pt idx="${d}"><c:v>${g || g === 0 ? g : ""}</c:v></c:pt>`;
        }), n += "    </c:numCache>", n += "  </c:numRef>", n += "</c:xVal>", n += "<c:yVal>", n += "  <c:numRef>", n += `<c:f>Sheet1!$${Ce(A + 1)}$2:$${Ce(A + 1)}$${r[0].values.length + 1}</c:f>`, A++, n += "    <c:numCache>", n += "      <c:formatCode>General</c:formatCode>", n += `      <c:ptCount val="${r[0].values.length}"/>`, r[0].values.forEach((g, d) => {
          n += `<c:pt idx="${d}"><c:v>${o.values[d] || o.values[d] === 0 ? o.values[d] : ""}</c:v></c:pt>`;
        }), n += "    </c:numCache>", n += "  </c:numRef>", n += "</c:yVal>", n += "  <c:bubbleSize>", n += "    <c:numRef>", n += `<c:f>Sheet1!$${Ce(A + 1)}$2:$${Ce(A + 1)}$${o.sizes.length + 1}</c:f>`, A++, n += "      <c:numCache>", n += "        <c:formatCode>General</c:formatCode>", n += `           <c:ptCount val="${o.sizes.length}"/>`, o.sizes.forEach((g, d) => {
          n += `<c:pt idx="${d}"><c:v>${g || ""}</c:v></c:pt>`;
        }), n += "      </c:numCache>", n += "    </c:numRef>", n += "  </c:bubbleSize>", n += '  <c:bubble3D val="' + (e === re.BUBBLE3D ? "1" : "0") + '"/>', n += "</c:ser>";
      }), n += "<c:dLbls>", n += `<c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, n += "<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr>", n += `<a:defRPr b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" strike="noStrike" sz="${Math.round(Math.round(t.dataLabelFontSize || He) * 100)}" u="none">`, n += `<a:solidFill>${_e(t.dataLabelColor || Oe)}</a:solidFill>`, n += `<a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, n += "</a:defRPr></a:pPr></a:p></c:txPr>", t.dataLabelPosition && (n += `<c:dLblPos val="${t.dataLabelPosition}"/>`), n += '<c:showLegendKey val="0"/>', n += `<c:showVal val="${t.showValue ? "1" : "0"}"/>`, n += `<c:showCatName val="0"/><c:showSerName val="${t.showSerName ? "1" : "0"}"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>`, n += "<c:extLst>", n += '  <c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">', n += '    <c15:showLeaderLines val="' + (t.showLeaderLines ? "1" : "0") + '"/>', n += "  </c:ext>", n += "</c:extLst>", n += "</c:dLbls>", n += `<c:axId val="${a}"/><c:axId val="${i}"/>`, n += "</c:bubbleChart>";
      break;
    case re.DOUGHNUT:
    case re.PIE:
      c = r[0], n += "<c:" + e + "Chart>", n += '  <c:varyColors val="1"/>', n += "<c:ser>", n += '  <c:idx val="0"/>', n += '  <c:order val="0"/>', n += "  <c:tx>", n += "    <c:strRef>", n += "      <c:f>Sheet1!$B$1</c:f>", n += "      <c:strCache>", n += '        <c:ptCount val="1"/>', n += '        <c:pt idx="0"><c:v>' + fe(c.name) + "</c:v></c:pt>", n += "      </c:strCache>", n += "    </c:strRef>", n += "  </c:tx>", n += "  <c:spPr>", n += '    <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>', n += '    <a:ln w="9525" cap="flat"><a:solidFill><a:srgbClr val="F9F9F9"/></a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>', t.dataNoEffects ? n += "<a:effectLst/>" : n += ft(t.shadow, dt), n += "  </c:spPr>", c.labels[0].forEach((o, f) => {
        n += "<c:dPt>", n += ` <c:idx val="${f}"/>`, n += ' <c:bubble3D val="0"/>', n += " <c:spPr>", n += `<a:solidFill>${_e(t.chartColors[f + 1 > t.chartColors.length ? Math.floor(Math.random() * t.chartColors.length) : f])}</a:solidFill>`, t.dataBorder && (n += `<a:ln w="${de(t.dataBorder.pt)}" cap="flat"><a:solidFill>${_e(t.dataBorder.color)}</a:solidFill><a:prstDash val="solid"/><a:round/></a:ln>`), n += ft(t.shadow, dt), n += "  </c:spPr>", n += "</c:dPt>";
      }), n += "<c:dLbls>", c.labels[0].forEach((o, f) => {
        n += "<c:dLbl>", n += ` <c:idx val="${f}"/>`, n += `  <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, n += "  <c:spPr/><c:txPr>", n += "   <a:bodyPr/><a:lstStyle/>", n += "   <a:p><a:pPr>", n += `   <a:defRPr sz="${Math.round((t.dataLabelFontSize || He) * 100)}" b="${t.dataLabelFontBold ? 1 : 0}" i="${t.dataLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, n += "    <a:solidFill>" + _e(t.dataLabelColor || Oe) + "</a:solidFill>", n += `    <a:latin typeface="${t.dataLabelFontFace || "Arial"}"/>`, n += "   </a:defRPr>", n += "      </a:pPr></a:p>", n += "    </c:txPr>", e === re.PIE && t.dataLabelPosition && (n += `<c:dLblPos val="${t.dataLabelPosition}"/>`), n += '    <c:showLegendKey val="0"/>', n += '    <c:showVal val="' + (t.showValue ? "1" : "0") + '"/>', n += '    <c:showCatName val="' + (t.showLabel ? "1" : "0") + '"/>', n += '    <c:showSerName val="' + (t.showSerName ? "1" : "0") + '"/>', n += '    <c:showPercent val="' + (t.showPercent ? "1" : "0") + '"/>', n += '    <c:showBubbleSize val="0"/>', n += "  </c:dLbl>";
      }), n += ` <c:numFmt formatCode="${fe(t.dataLabelFormatCode) || "General"}" sourceLinked="0"/>`, n += "    <c:txPr>", n += "      <a:bodyPr/>", n += "      <a:lstStyle/>", n += "      <a:p>", n += "        <a:pPr>", n += `          <a:defRPr sz="1800" b="${t.dataLabelFontBold ? "1" : "0"}" i="${t.dataLabelFontItalic ? "1" : "0"}" u="none" strike="noStrike">`, n += '            <a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/>', n += "          </a:defRPr>", n += "        </a:pPr>", n += "      </a:p>", n += "    </c:txPr>", n += e === re.PIE ? '<c:dLblPos val="ctr"/>' : "", n += '    <c:showLegendKey val="0"/>', n += '    <c:showVal val="0"/>', n += '    <c:showCatName val="1"/>', n += '    <c:showSerName val="0"/>', n += '    <c:showPercent val="1"/>', n += '    <c:showBubbleSize val="0"/>', n += ` <c:showLeaderLines val="${t.showLeaderLines ? "1" : "0"}"/>`, n += "</c:dLbls>", n += "<c:cat>", n += "  <c:strRef>", n += `    <c:f>Sheet1!$A$2:$A$${c.labels[0].length + 1}</c:f>`, n += "    <c:strCache>", n += `         <c:ptCount val="${c.labels[0].length}"/>`, c.labels[0].forEach((o, f) => {
        n += `<c:pt idx="${f}"><c:v>${fe(o)}</c:v></c:pt>`;
      }), n += "    </c:strCache>", n += "  </c:strRef>", n += "</c:cat>", n += "  <c:val>", n += "    <c:numRef>", n += `      <c:f>Sheet1!$B$2:$B$${c.labels[0].length + 1}</c:f>`, n += "      <c:numCache>", n += `           <c:ptCount val="${c.labels[0].length}"/>`, c.values.forEach((o, f) => {
        n += `<c:pt idx="${f}"><c:v>${o || o === 0 ? o : ""}</c:v></c:pt>`;
      }), n += "      </c:numCache>", n += "    </c:numRef>", n += "  </c:val>", n += "  </c:ser>", n += `  <c:firstSliceAng val="${t.firstSliceAng ? Math.round(t.firstSliceAng) : 0}"/>`, e === re.DOUGHNUT && (n += `<c:holeSize val="${typeof t.holeSize == "number" ? t.holeSize : "50"}"/>`), n += "</c:" + e + "Chart>";
      break;
    default:
      n += "";
      break;
  }
  return n;
}
function la(e, r, t) {
  let i = "";
  return e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? i += "<c:valAx>" : i += "<c:" + (e.catLabelFormatCode ? "dateAx" : "catAx") + ">", i += '  <c:axId val="' + r + '"/>', i += "  <c:scaling>", i += '<c:orientation val="' + (e.catAxisOrientation || (e.barDir === "col", "minMax")) + '"/>', (e.catAxisMaxVal || e.catAxisMaxVal === 0) && (i += `<c:max val="${e.catAxisMaxVal}"/>`), (e.catAxisMinVal || e.catAxisMinVal === 0) && (i += `<c:min val="${e.catAxisMinVal}"/>`), i += "</c:scaling>", i += '  <c:delete val="' + (e.catAxisHidden ? "1" : "0") + '"/>', i += '  <c:axPos val="' + (e.barDir === "col" ? "b" : "l") + '"/>', i += e.catGridLine.style !== "none" ? Oa(e.catGridLine) : "", e.showCatAxisTitle && (i += Kr({
    color: e.catAxisTitleColor,
    fontFace: e.catAxisTitleFontFace,
    fontSize: e.catAxisTitleFontSize,
    titleRotate: e.catAxisTitleRotate,
    title: e.catAxisTitle || "Axis Title"
  })), e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? i += '  <c:numFmt formatCode="' + (e.valAxisLabelFormatCode ? fe(e.valAxisLabelFormatCode) : "General") + '" sourceLinked="1"/>' : i += '  <c:numFmt formatCode="' + (fe(e.catLabelFormatCode) || "General") + '" sourceLinked="1"/>', e._type === re.SCATTER ? (i += '  <c:majorTickMark val="none"/>', i += '  <c:minorTickMark val="none"/>', i += '  <c:tickLblPos val="nextTo"/>') : (i += '  <c:majorTickMark val="' + (e.catAxisMajorTickMark || "out") + '"/>', i += '  <c:minorTickMark val="' + (e.catAxisMinorTickMark || "none") + '"/>', i += '  <c:tickLblPos val="' + (e.catAxisLabelPos || (e.barDir === "col" ? "low" : "nextTo")) + '"/>'), i += "  <c:spPr>", i += `    <a:ln w="${e.catAxisLineSize ? de(e.catAxisLineSize) : Vt}" cap="flat">`, i += e.catAxisLineShow ? "<a:solidFill>" + _e(e.catAxisLineColor || mt.color) + "</a:solidFill>" : "<a:noFill/>", i += '      <a:prstDash val="' + (e.catAxisLineStyle || "solid") + '"/>', i += "      <a:round/>", i += "    </a:ln>", i += "  </c:spPr>", i += "  <c:txPr>", e.catAxisLabelRotate ? i += `<a:bodyPr rot="${gt(e.catAxisLabelRotate)}"/>` : i += "<a:bodyPr/>", i += "    <a:lstStyle/>", i += "    <a:p>", i += "    <a:pPr>", i += `      <a:defRPr sz="${Math.round((e.catAxisLabelFontSize || He) * 100)}" b="${e.catAxisLabelFontBold ? 1 : 0}" i="${e.catAxisLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, i += "      <a:solidFill>" + _e(e.catAxisLabelColor || Oe) + "</a:solidFill>", i += '      <a:latin typeface="' + (e.catAxisLabelFontFace || "Arial") + '"/>', i += "   </a:defRPr>", i += "  </a:pPr>", i += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', i += "  </a:p>", i += " </c:txPr>", i += ' <c:crossAx val="' + t + '"/>', i += ` <c:${typeof e.valAxisCrossesAt == "number" ? "crossesAt" : "crosses"} val="${e.valAxisCrossesAt || "autoZero"}"/>`, i += ' <c:auto val="1"/>', i += ' <c:lblAlgn val="ctr"/>', i += ` <c:noMultiLvlLbl val="${e.catAxisMultiLevelLabels ? 0 : 1}"/>`, e.catAxisLabelFrequency && (i += ' <c:tickLblSkip val="' + e.catAxisLabelFrequency + '"/>'), (e.catLabelFormatCode || e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D) && (e.catLabelFormatCode && (["catAxisBaseTimeUnit", "catAxisMajorTimeUnit", "catAxisMinorTimeUnit"].forEach((a) => {
    e[a] && (typeof e[a] != "string" || !["days", "months", "years"].includes(e[a].toLowerCase())) && (console.warn(`"${a}" must be one of: 'days','months','years' !`), e[a] = null);
  }), e.catAxisBaseTimeUnit && (i += '<c:baseTimeUnit val="' + e.catAxisBaseTimeUnit.toLowerCase() + '"/>'), e.catAxisMajorTimeUnit && (i += '<c:majorTimeUnit val="' + e.catAxisMajorTimeUnit.toLowerCase() + '"/>'), e.catAxisMinorTimeUnit && (i += '<c:minorTimeUnit val="' + e.catAxisMinorTimeUnit.toLowerCase() + '"/>')), e.catAxisMajorUnit && (i += `<c:majorUnit val="${e.catAxisMajorUnit}"/>`), e.catAxisMinorUnit && (i += `<c:minorUnit val="${e.catAxisMinorUnit}"/>`)), e._type === re.SCATTER || e._type === re.BUBBLE || e._type === re.BUBBLE3D ? i += "</c:valAx>" : i += "</c:" + (e.catLabelFormatCode ? "dateAx" : "catAx") + ">", i;
}
function ca(e, r) {
  let t = r === tt ? e.barDir === "col" ? "l" : "b" : e.barDir !== "col" ? "r" : "t";
  r === zr && (t = "r");
  const i = r === tt ? Mt : La;
  let a = "";
  return a += "<c:valAx>", a += '  <c:axId val="' + r + '"/>', a += "  <c:scaling>", e.valAxisLogScaleBase && (a += `<c:logBase val="${e.valAxisLogScaleBase}"/>`), a += '<c:orientation val="' + (e.valAxisOrientation || (e.barDir === "col", "minMax")) + '"/>', (e.valAxisMaxVal || e.valAxisMaxVal === 0) && (a += `<c:max val="${e.valAxisMaxVal}"/>`), (e.valAxisMinVal || e.valAxisMinVal === 0) && (a += `<c:min val="${e.valAxisMinVal}"/>`), a += "  </c:scaling>", a += `  <c:delete val="${e.valAxisHidden ? 1 : 0}"/>`, a += '  <c:axPos val="' + t + '"/>', e.valGridLine.style !== "none" && (a += Oa(e.valGridLine)), e.showValAxisTitle && (a += Kr({
    color: e.valAxisTitleColor,
    fontFace: e.valAxisTitleFontFace,
    fontSize: e.valAxisTitleFontSize,
    titleRotate: e.valAxisTitleRotate,
    title: e.valAxisTitle || "Axis Title"
  })), a += `<c:numFmt formatCode="${e.valAxisLabelFormatCode ? fe(e.valAxisLabelFormatCode) : "General"}" sourceLinked="0"/>`, e._type === re.SCATTER ? (a += '  <c:majorTickMark val="none"/>', a += '  <c:minorTickMark val="none"/>', a += '  <c:tickLblPos val="nextTo"/>') : (a += ' <c:majorTickMark val="' + (e.valAxisMajorTickMark || "out") + '"/>', a += ' <c:minorTickMark val="' + (e.valAxisMinorTickMark || "none") + '"/>', a += ' <c:tickLblPos val="' + (e.valAxisLabelPos || (e.barDir === "col" ? "nextTo" : "low")) + '"/>'), a += " <c:spPr>", a += `   <a:ln w="${e.valAxisLineSize ? de(e.valAxisLineSize) : Vt}" cap="flat">`, a += e.valAxisLineShow ? "<a:solidFill>" + _e(e.valAxisLineColor || mt.color) + "</a:solidFill>" : "<a:noFill/>", a += '     <a:prstDash val="' + (e.valAxisLineStyle || "solid") + '"/>', a += "     <a:round/>", a += "   </a:ln>", a += " </c:spPr>", a += " <c:txPr>", a += `  <a:bodyPr${e.valAxisLabelRotate ? ' rot="' + gt(e.valAxisLabelRotate).toString() + '"' : ""}/>`, a += "  <a:lstStyle/>", a += "  <a:p>", a += "    <a:pPr>", a += `      <a:defRPr sz="${Math.round((e.valAxisLabelFontSize || He) * 100)}" b="${e.valAxisLabelFontBold ? 1 : 0}" i="${e.valAxisLabelFontItalic ? 1 : 0}" u="none" strike="noStrike">`, a += "        <a:solidFill>" + _e(e.valAxisLabelColor || Oe) + "</a:solidFill>", a += '        <a:latin typeface="' + (e.valAxisLabelFontFace || "Arial") + '"/>', a += "      </a:defRPr>", a += "    </a:pPr>", a += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', a += "  </a:p>", a += " </c:txPr>", a += ' <c:crossAx val="' + i + '"/>', typeof e.catAxisCrossesAt == "number" ? a += ` <c:crossesAt val="${e.catAxisCrossesAt}"/>` : typeof e.catAxisCrossesAt == "string" ? a += ' <c:crosses val="' + e.catAxisCrossesAt + '"/>' : a += ' <c:crosses val="' + (t === "r" || t === "t" ? "max" : "autoZero") + '"/>', a += ' <c:crossBetween val="' + (e._type === re.SCATTER || Array.isArray(e._type) && e._type.filter((s) => s.type === re.AREA).length > 0 ? "midCat" : "between") + '"/>', e.valAxisMajorUnit && (a += ` <c:majorUnit val="${e.valAxisMajorUnit}"/>`), e.valAxisDisplayUnit && (a += `<c:dispUnits><c:builtInUnit val="${e.valAxisDisplayUnit}"/>${e.valAxisDisplayUnitLabel ? "<c:dispUnitsLbl/>" : ""}</c:dispUnits>`), a += "</c:valAx>", a;
}
function Xo(e, r, t) {
  let i = "";
  return i += "<c:serAx>", i += '  <c:axId val="' + r + '"/>', i += '  <c:scaling><c:orientation val="' + (e.serAxisOrientation || (e.barDir === "col", "minMax")) + '"/></c:scaling>', i += '  <c:delete val="' + (e.serAxisHidden ? "1" : "0") + '"/>', i += '  <c:axPos val="' + (e.barDir === "col" ? "b" : "l") + '"/>', i += e.serGridLine.style !== "none" ? Oa(e.serGridLine) : "", e.showSerAxisTitle && (i += Kr({
    color: e.serAxisTitleColor,
    fontFace: e.serAxisTitleFontFace,
    fontSize: e.serAxisTitleFontSize,
    titleRotate: e.serAxisTitleRotate,
    title: e.serAxisTitle || "Axis Title"
  })), i += `  <c:numFmt formatCode="${fe(e.serLabelFormatCode) || "General"}" sourceLinked="0"/>`, i += '  <c:majorTickMark val="out"/>', i += '  <c:minorTickMark val="none"/>', i += `  <c:tickLblPos val="${e.serAxisLabelPos || e.barDir === "col" ? "low" : "nextTo"}"/>`, i += "  <c:spPr>", i += '    <a:ln w="12700" cap="flat">', i += e.serAxisLineShow ? `<a:solidFill>${_e(e.serAxisLineColor || mt.color)}</a:solidFill>` : "<a:noFill/>", i += '      <a:prstDash val="solid"/>', i += "      <a:round/>", i += "    </a:ln>", i += "  </c:spPr>", i += "  <c:txPr>", i += "    <a:bodyPr/>", i += "    <a:lstStyle/>", i += "    <a:p>", i += "    <a:pPr>", i += `    <a:defRPr sz="${Math.round((e.serAxisLabelFontSize || He) * 100)}" b="${e.serAxisLabelFontBold ? "1" : "0"}" i="${e.serAxisLabelFontItalic ? "1" : "0"}" u="none" strike="noStrike">`, i += `      <a:solidFill>${_e(e.serAxisLabelColor || Oe)}</a:solidFill>`, i += `      <a:latin typeface="${e.serAxisLabelFontFace || "Arial"}"/>`, i += "   </a:defRPr>", i += "  </a:pPr>", i += '  <a:endParaRPr lang="' + (e.lang || "en-US") + '"/>', i += "  </a:p>", i += " </c:txPr>", i += ' <c:crossAx val="' + t + '"/>', i += ' <c:crosses val="autoZero"/>', e.serAxisLabelFrequency && (i += ' <c:tickLblSkip val="' + e.serAxisLabelFrequency + '"/>'), e.serLabelFormatCode && (["serAxisBaseTimeUnit", "serAxisMajorTimeUnit", "serAxisMinorTimeUnit"].forEach((a) => {
    e[a] && (typeof e[a] != "string" || !["days", "months", "years"].includes(a.toLowerCase())) && (console.warn(`"${a}" must be one of: 'days','months','years' !`), e[a] = null);
  }), e.serAxisBaseTimeUnit && (i += ` <c:baseTimeUnit  val="${e.serAxisBaseTimeUnit.toLowerCase()}"/>`), e.serAxisMajorTimeUnit && (i += ` <c:majorTimeUnit val="${e.serAxisMajorTimeUnit.toLowerCase()}"/>`), e.serAxisMinorTimeUnit && (i += ` <c:minorTimeUnit val="${e.serAxisMinorTimeUnit.toLowerCase()}"/>`), e.serAxisMajorUnit && (i += ` <c:majorUnit val="${e.serAxisMajorUnit}"/>`), e.serAxisMinorUnit && (i += ` <c:minorUnit val="${e.serAxisMinorUnit}"/>`)), i += "</c:serAx>", i;
}
function Kr(e, r, t) {
  const i = e.titleAlign === "left" || e.titleAlign === "right" ? `<a:pPr algn="${e.titleAlign.substring(0, 1)}">` : "<a:pPr>", a = e.titleRotate ? `<a:bodyPr rot="${gt(e.titleRotate)}"/>` : "<a:bodyPr/>", s = e.fontSize ? `sz="${Math.round(e.fontSize * 100)}"` : "", l = e.titleBold ? 1 : 0;
  let A = "<c:layout/>";
  if (e.titlePos && typeof e.titlePos.x == "number" && typeof e.titlePos.y == "number") {
    const c = e.titlePos.x + r, n = e.titlePos.y + t;
    let o = c === 0 ? 0 : c * (c / 5) / 10;
    o >= 1 && (o = o / 10), o >= 0.1 && (o = o / 10);
    let f = n === 0 ? 0 : n * (n / 5) / 10;
    f >= 1 && (f = f / 10), f >= 0.1 && (f = f / 10), A = `<c:layout><c:manualLayout><c:xMode val="edge"/><c:yMode val="edge"/><c:x val="${o}"/><c:y val="${f}"/></c:manualLayout></c:layout>`;
  }
  return `<c:title>
      <c:tx>
        <c:rich>
          ${a}
          <a:lstStyle/>
          <a:p>
            ${i}
            <a:defRPr ${s} b="${l}" i="0" u="none" strike="noStrike">
              <a:solidFill>${_e(e.color || Oe)}</a:solidFill>
              <a:latin typeface="${e.fontFace || "Arial"}"/>
            </a:defRPr>
          </a:pPr>
          <a:r>
            <a:rPr ${s} b="${l}" i="0" u="none" strike="noStrike">
              <a:solidFill>${_e(e.color || Oe)}</a:solidFill>
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
function Ce(e) {
  let r = "";
  const t = e - 1;
  return t <= 25 ? r = It[t] : r = `${It[Math.floor(t / It.length - 1)]}${It[t % It.length]}`, r;
}
function ft(e, r) {
  if (e) {
    if (typeof e != "object")
      return console.warn("`shadow` options must be an object. Ex: `{shadow: {type:'none'}}`"), "<a:effectLst/>";
  } else return "<a:effectLst/>";
  let t = "<a:effectLst>";
  const i = Object.assign(Object.assign({}, r), e), a = i.type || "outer", s = de(i.blur), l = de(i.offset), A = Math.round(i.angle * 6e4), c = i.color, n = Math.round(i.opacity * 1e5), o = i.rotateWithShape ? 1 : 0;
  return t += `<a:${a}Shdw sx="100000" sy="100000" kx="0" ky="0"  algn="bl" blurRad="${s}" rotWithShape="${o}" dist="${l}" dir="${A}">`, t += `<a:srgbClr val="${c}">`, t += `<a:alpha val="${n}"/></a:srgbClr>`, t += `</a:${a}Shdw>`, t += "</a:effectLst>", t;
}
function Oa(e) {
  let r = "<c:majorGridlines>";
  return r += " <c:spPr>", r += `  <a:ln w="${de(e.size || mt.size)}" cap="${Gr(e.cap || mt.cap)}">`, r += '  <a:solidFill><a:srgbClr val="' + (e.color || mt.color) + '"/></a:solidFill>', r += '   <a:prstDash val="' + (e.style || mt.style) + '"/><a:round/>', r += "  </a:ln>", r += " </c:spPr>", r += "</c:majorGridlines>", r;
}
function Gr(e) {
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
function Aa(e) {
  var r, t;
  const i = typeof process < "u" && !!(!((r = process.versions) === null || r === void 0) && r.node) && ((t = process.release) === null || t === void 0 ? void 0 : t.name) === "node";
  let a, s;
  const l = i ? () => Ue(this, void 0, void 0, function* () {
    ({ default: a } = yield import("./__vite-browser-external.js")), { default: s } = yield import("./__vite-browser-external.js");
  }) : () => Ue(this, void 0, void 0, function* () {
  });
  i && l();
  const A = [], c = e._relsMedia.filter((o) => o.type !== "online" && !o.data && (!o.path || o.path && !o.path.includes("preencoded"))), n = [];
  return c.forEach((o) => {
    n.includes(o.path) ? o.isDuplicate = !0 : (o.isDuplicate = !1, n.push(o.path));
  }), c.filter((o) => !o.isDuplicate).forEach((o) => {
    A.push(Ue(this, void 0, void 0, function* () {
      if (s || (yield l()), i && a && o.path.indexOf("http") !== 0)
        try {
          const f = a.readFileSync(o.path);
          return o.data = Buffer.from(f).toString("base64"), c.filter((g) => g.isDuplicate && g.path === o.path).forEach((g) => g.data = o.data), "done";
        } catch (f) {
          throw o.data = Lt, c.filter((g) => g.isDuplicate && g.path === o.path).forEach((g) => g.data = o.data), new Error(`ERROR: Unable to read media: "${o.path}"
${String(f)}`);
        }
      return i && s && o.path.startsWith("http") ? yield new Promise((f, g) => {
        s.get(o.path, (d) => {
          let h = "";
          d.setEncoding("binary"), d.on("data", (u) => h += u), d.on("end", () => {
            o.data = Buffer.from(h, "binary").toString("base64"), c.filter((u) => u.isDuplicate && u.path === o.path).forEach((u) => u.data = o.data), f("done");
          }), d.on("error", () => {
            o.data = Lt, c.filter((u) => u.isDuplicate && u.path === o.path).forEach((u) => u.data = o.data), g(new Error(`ERROR! Unable to load image (https.get): ${o.path}`));
          });
        });
      }) : yield new Promise((f, g) => {
        const d = new XMLHttpRequest();
        d.onload = () => {
          const h = new FileReader();
          h.onloadend = () => {
            o.data = h.result, c.filter((u) => u.isDuplicate && u.path === o.path).forEach((u) => u.data = o.data), o.isSvgPng ? tn(o).then(() => f("done")).catch(g) : f("done");
          }, h.readAsDataURL(d.response);
        }, d.onerror = () => {
          o.data = Lt, c.filter((h) => h.isDuplicate && h.path === o.path).forEach((h) => h.data = o.data), g(new Error(`ERROR! Unable to load image (xhr.onerror): ${o.path}`));
        }, d.open("GET", o.path), d.responseType = "blob", d.send();
      });
    }));
  }), e._relsMedia.filter((o) => o.isSvgPng && o.data).forEach((o) => {
    Ue(this, void 0, void 0, function* () {
      i && !a && (yield l()), i && a ? (o.data = Lt, A.push(Promise.resolve("done"))) : A.push(tn(o));
    });
  }), A;
}
function tn(e) {
  return Ue(this, void 0, void 0, function* () {
    return yield new Promise((r, t) => {
      const i = new Image();
      i.onload = () => {
        i.width + i.height === 0 && i.onerror("h/w=0");
        let a = document.createElement("CANVAS");
        const s = a.getContext("2d");
        a.width = i.width, a.height = i.height, s.drawImage(i, 0, 0);
        try {
          e.data = a.toDataURL(e.type), r("done");
        } catch (l) {
          i.onerror(l.toString());
        }
        a = null;
      }, i.onerror = () => {
        e.data = Lt, t(new Error(`ERROR! Unable to load image (image.onerror): ${e.path}`));
      }, i.src = typeof e.data == "string" ? e.data : Lt;
    });
  });
}
const Ho = {
  cover: function(e, r) {
    const t = e.h / e.w, a = r.h / r.w > t, s = a ? r.h / t : r.w, l = a ? r.h : r.w * t, A = Math.round(1e5 * 0.5 * (1 - r.w / s)), c = Math.round(1e5 * 0.5 * (1 - r.h / l));
    return `<a:srcRect l="${A}" r="${A}" t="${c}" b="${c}"/><a:stretch/>`;
  },
  contain: function(e, r) {
    const t = e.h / e.w, a = r.h / r.w > t, s = a ? r.w : r.h / t, l = a ? r.w * t : r.h, A = Math.round(1e5 * 0.5 * (1 - r.w / s)), c = Math.round(1e5 * 0.5 * (1 - r.h / l));
    return `<a:srcRect l="${A}" r="${A}" t="${c}" b="${c}"/><a:stretch/>`;
  },
  crop: function(e, r) {
    const t = r.x, i = e.w - (r.x + r.w), a = r.y, s = e.h - (r.y + r.h), l = Math.round(1e5 * (t / e.w)), A = Math.round(1e5 * (i / e.w)), c = Math.round(1e5 * (a / e.h)), n = Math.round(1e5 * (s / e.h));
    return `<a:srcRect l="${l}" r="${A}" t="${c}" b="${n}"/><a:stretch/>`;
  }
};
function $a(e) {
  var r;
  let t = e._name ? '<p:cSld name="' + e._name + '">' : "<p:cSld>", i = 1;
  return e._bkgdImgRid ? t += `<p:bg><p:bgPr><a:blipFill dpi="0" rotWithShape="1"><a:blip r:embed="rId${e._bkgdImgRid}"><a:lum/></a:blip><a:srcRect/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:effectLst/></p:bgPr></p:bg>` : !((r = e.background) === null || r === void 0) && r.color ? t += `<p:bg><p:bgPr>${Ge(e.background)}</p:bgPr></p:bg>` : !e.bkgd && e._name && e._name === Ea && (t += '<p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>'), t += "<p:spTree>", t += '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>', t += '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>', t += '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>', e._slideObjects.forEach((a, s) => {
    var l, A, c, n, o, f, g, d;
    let h = 0, u = 0, y = pe("75%", "X", e._presLayout), m = 0, p, _ = "", T = null, v = null, x = 0, C = 0, P = null, R = null;
    const S = (l = a.options) === null || l === void 0 ? void 0 : l.sizing, O = (A = a.options) === null || A === void 0 ? void 0 : A.rounding;
    e._slideLayout !== void 0 && e._slideLayout._slideObjects !== void 0 && a.options && a.options.placeholder && (p = e._slideLayout._slideObjects.filter((w) => w.options.placeholder === a.options.placeholder)[0]), a.options = a.options || {}, typeof a.options.x < "u" && (h = pe(a.options.x, "X", e._presLayout)), typeof a.options.y < "u" && (u = pe(a.options.y, "Y", e._presLayout)), typeof a.options.w < "u" && (y = pe(a.options.w, "X", e._presLayout)), typeof a.options.h < "u" && (m = pe(a.options.h, "Y", e._presLayout));
    let E = y, M = m;
    switch (p && ((p.options.x || p.options.x === 0) && (h = pe(p.options.x, "X", e._presLayout)), (p.options.y || p.options.y === 0) && (u = pe(p.options.y, "Y", e._presLayout)), (p.options.w || p.options.w === 0) && (y = pe(p.options.w, "X", e._presLayout)), (p.options.h || p.options.h === 0) && (m = pe(p.options.h, "Y", e._presLayout))), a.options.flipH && (_ += ' flipH="1"'), a.options.flipV && (_ += ' flipV="1"'), a.options.rotate && (_ += ` rot="${gt(a.options.rotate)}"`), a._type) {
      case ue.table:
        if (T = a.arrTabRows, v = a.options, x = 0, C = 0, T[0].forEach((w) => {
          P = w.options || null, x += P?.colspan ? Number(P.colspan) : 1;
        }), R = `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${i * e._slideNum + 1}" name="${a.options.objectName}"/>`, R += '<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>  <p:nvPr><p:extLst><p:ext uri="{D42A27DB-BD31-4B8C-83A1-F6EECF244321}"><p14:modId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1579011935"/></p:ext></p:extLst></p:nvPr></p:nvGraphicFramePr>', R += `<p:xfrm><a:off x="${h || (h === 0 ? 0 : he)}" y="${u || (u === 0 ? 0 : he)}"/><a:ext cx="${y || (y === 0 ? 0 : he)}" cy="${m || he}"/></p:xfrm>`, R += '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr/>', Array.isArray(v.colW)) {
          R += "<a:tblGrid>";
          for (let w = 0; w < x; w++) {
            let G = ve(v.colW[w]);
            (G == null || isNaN(G)) && (G = (typeof a.options.w == "number" ? a.options.w : 1) / x), R += `<a:gridCol w="${Math.round(G)}"/>`;
          }
          R += "</a:tblGrid>";
        } else {
          C = v.colW ? v.colW : he, a.options.w && !v.colW && (C = Math.round((typeof a.options.w == "number" ? a.options.w : 1) / x)), R += "<a:tblGrid>";
          for (let w = 0; w < x; w++)
            R += `<a:gridCol w="${C}"/>`;
          R += "</a:tblGrid>";
        }
        T.forEach((w) => {
          var G, ee;
          for (let Y = 0; Y < w.length; ) {
            const ne = w[Y], Z = (G = ne.options) === null || G === void 0 ? void 0 : G.colspan, Q = (ee = ne.options) === null || ee === void 0 ? void 0 : ee.rowspan;
            if (Z && Z > 1) {
              const B = new Array(Z - 1).fill(void 0).map(() => ({ _type: ue.tablecell, options: { rowspan: Q }, _hmerge: !0 }));
              w.splice(Y + 1, 0, ...B), Y += Z;
            } else
              Y += 1;
          }
        }), T.forEach((w, G) => {
          const ee = T[G + 1];
          ee && w.forEach((Y, ne) => {
            var Z, Q;
            const B = Y._rowContinue || ((Z = Y.options) === null || Z === void 0 ? void 0 : Z.rowspan), F = (Q = Y.options) === null || Q === void 0 ? void 0 : Q.colspan, $ = Y._hmerge;
            if (B && B > 1) {
              const L = { _type: ue.tablecell, options: { colspan: F }, _rowContinue: B - 1, _vmerge: !0, _hmerge: $ };
              ee.splice(ne, 0, L);
            }
          });
        }), T.forEach((w, G) => {
          let ee = 0;
          Array.isArray(v.rowH) && v.rowH[G] ? ee = ve(Number(v.rowH[G])) : v.rowH && !isNaN(Number(v.rowH)) ? ee = ve(Number(v.rowH)) : (a.options.cy || a.options.h) && (ee = Math.round((a.options.h ? ve(a.options.h) : typeof a.options.cy == "number" ? a.options.cy : 1) / T.length)), R += `<a:tr h="${ee}">`, w.forEach((Y) => {
            var ne, Z, Q, B, F;
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
            const q = $.options || {};
            $.options = q, ["align", "bold", "border", "color", "fill", "fontFace", "fontSize", "margin", "textDirection", "underline", "valign"].forEach((j) => {
              v[j] && !q[j] && q[j] !== 0 && (q[j] = v[j]);
            });
            const oe = q.valign ? ` anchor="${q.valign.replace(/^c$/i, "ctr").replace(/^m$/i, "ctr").replace("center", "ctr").replace("middle", "ctr").replace("top", "t").replace("btm", "b").replace("bottom", "b")}"` : "", ae = q.textDirection && q.textDirection !== "horz" ? ` vert="${q.textDirection}"` : "";
            let le = !((B = (Q = $._optImp) === null || Q === void 0 ? void 0 : Q.fill) === null || B === void 0) && B.color ? $._optImp.fill.color : !((F = $._optImp) === null || F === void 0) && F.fill && typeof $._optImp.fill == "string" ? $._optImp.fill : "";
            le = le || q.fill ? q.fill : "";
            const Ae = le ? Ge(le) : "";
            let z = q.margin === 0 || q.margin ? q.margin : Ii;
            !Array.isArray(z) && typeof z == "number" && (z = [z, z, z, z]);
            let W = "";
            z[0] >= 1 ? W = ` marL="${de(z[3])}" marR="${de(z[1])}" marT="${de(z[0])}" marB="${de(z[2])}"` : W = ` marL="${ve(z[3])}" marR="${ve(z[1])}" marT="${ve(z[0])}" marB="${ve(z[2])}"`, R += `<a:tc${N}>${an($)}<a:tcPr${W}${oe}${ae}>`, q.border && Array.isArray(q.border) && [
              { idx: 3, name: "lnL" },
              { idx: 1, name: "lnR" },
              { idx: 0, name: "lnT" },
              { idx: 2, name: "lnB" }
            ].forEach((j) => {
              q.border[j.idx].type !== "none" ? (R += `<a:${j.name} w="${de(q.border[j.idx].pt)}" cap="flat" cmpd="sng" algn="ctr">`, R += `<a:solidFill>${_e(q.border[j.idx].color)}</a:solidFill>`, R += `<a:prstDash val="${q.border[j.idx].type === "dash" ? "sysDash" : "solid"}"/><a:round/><a:headEnd type="none" w="med" len="med"/><a:tailEnd type="none" w="med" len="med"/>`, R += `</a:${j.name}>`) : R += `<a:${j.name} w="0" cap="flat" cmpd="sng" algn="ctr"><a:noFill/></a:${j.name}>`;
            }), R += Ae, R += "  </a:tcPr>", R += " </a:tc>";
          }), R += "</a:tr>";
        }), R += "      </a:tbl>", R += "    </a:graphicData>", R += "  </a:graphic>", R += "</p:graphicFrame>", t += R, i++;
        break;
      case ue.text:
      case ue.placeholder:
        if (!a.options.line && m === 0 && (m = he * 0.3), a.options._bodyProp || (a.options._bodyProp = {}), a.options.margin && Array.isArray(a.options.margin) ? (a.options._bodyProp.lIns = de(a.options.margin[0] || 0), a.options._bodyProp.rIns = de(a.options.margin[1] || 0), a.options._bodyProp.bIns = de(a.options.margin[2] || 0), a.options._bodyProp.tIns = de(a.options.margin[3] || 0)) : typeof a.options.margin == "number" && (a.options._bodyProp.lIns = de(a.options.margin), a.options._bodyProp.rIns = de(a.options.margin), a.options._bodyProp.bIns = de(a.options.margin), a.options._bodyProp.tIns = de(a.options.margin)), t += "<p:sp>", t += `<p:nvSpPr><p:cNvPr id="${s + 2}" name="${a.options.objectName}">`, !((c = a.options.hyperlink) === null || c === void 0) && c.url && (t += `<a:hlinkClick r:id="rId${a.options.hyperlink._rId}" tooltip="${a.options.hyperlink.tooltip ? fe(a.options.hyperlink.tooltip) : ""}"/>`), !((n = a.options.hyperlink) === null || n === void 0) && n.slide && (t += `<a:hlinkClick r:id="rId${a.options.hyperlink._rId}" tooltip="${a.options.hyperlink.tooltip ? fe(a.options.hyperlink.tooltip) : ""}" action="ppaction://hlinksldjump"/>`), t += "</p:cNvPr>", t += "<p:cNvSpPr" + (!((o = a.options) === null || o === void 0) && o.isTextBox ? ' txBox="1"/>' : "/>"), t += `<p:nvPr>${a._type === "placeholder" ? er(a) : er(p)}</p:nvPr>`, t += "</p:nvSpPr><p:spPr>", t += `<a:xfrm${_}>`, t += `<a:off x="${h}" y="${u}"/>`, t += `<a:ext cx="${y}" cy="${m}"/></a:xfrm>`, a.shape === "custGeom")
          t += "<a:custGeom><a:avLst />", t += "<a:gdLst>", t += "</a:gdLst>", t += "<a:ahLst />", t += "<a:cxnLst>", t += "</a:cxnLst>", t += '<a:rect l="l" t="t" r="r" b="b" />', t += "<a:pathLst>", t += `<a:path w="${y}" h="${m}">`, (f = a.options.points) === null || f === void 0 || f.forEach((w, G) => {
            if ("curve" in w)
              switch (w.curve.type) {
                case "arc":
                  t += `<a:arcTo hR="${pe(w.curve.hR, "Y", e._presLayout)}" wR="${pe(w.curve.wR, "X", e._presLayout)}" stAng="${gt(w.curve.stAng)}" swAng="${gt(w.curve.swAng)}" />`;
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
          if (t += '<a:prstGeom prst="' + a.shape + '"><a:avLst>', a.options.rectRadius)
            t += `<a:gd name="adj" fmla="val ${Math.round(a.options.rectRadius * he * 1e5 / Math.min(y, m))}"/>`;
          else if (a.options.angleRange) {
            for (let w = 0; w < 2; w++) {
              const G = a.options.angleRange[w];
              t += `<a:gd name="adj${w + 1}" fmla="val ${gt(G)}" />`;
            }
            a.options.arcThicknessRatio && (t += `<a:gd name="adj3" fmla="val ${Math.round(a.options.arcThicknessRatio * 5e4)}" />`);
          }
          t += "</a:avLst></a:prstGeom>";
        }
        t += a.options.fill ? Ge(a.options.fill) : "<a:noFill/>", a.options.line && (t += a.options.line.width ? `<a:ln w="${de(a.options.line.width)}">` : "<a:ln>", a.options.line.color && (t += Ge(a.options.line)), a.options.line.dashType && (t += `<a:prstDash val="${a.options.line.dashType}"/>`), a.options.line.beginArrowType && (t += `<a:headEnd type="${a.options.line.beginArrowType}"/>`), a.options.line.endArrowType && (t += `<a:tailEnd type="${a.options.line.endArrowType}"/>`), t += "</a:ln>"), a.options.shadow && a.options.shadow.type !== "none" && (a.options.shadow.type = a.options.shadow.type || "outer", a.options.shadow.blur = de(a.options.shadow.blur || 8), a.options.shadow.offset = de(a.options.shadow.offset || 4), a.options.shadow.angle = Math.round((a.options.shadow.angle || 270) * 6e4), a.options.shadow.opacity = Math.round((a.options.shadow.opacity || 0.75) * 1e5), a.options.shadow.color = a.options.shadow.color || Za.color, t += "<a:effectLst>", t += ` <a:${a.options.shadow.type}Shdw ${a.options.shadow.type === "outer" ? 'sx="100000" sy="100000" kx="0" ky="0" algn="bl" rotWithShape="0"' : ""} blurRad="${a.options.shadow.blur}" dist="${a.options.shadow.offset}" dir="${a.options.shadow.angle}">`, t += ` <a:srgbClr val="${a.options.shadow.color}">`, t += ` <a:alpha val="${a.options.shadow.opacity}"/></a:srgbClr>`, t += " </a:outerShdw>", t += "</a:effectLst>"), t += "</p:spPr>", t += an(a), t += "</p:sp>";
        break;
      case ue.image:
        if (t += "<p:pic>", t += "  <p:nvPicPr>", t += `<p:cNvPr id="${s + 2}" name="${a.options.objectName}" descr="${fe(a.options.altText || a.image)}">`, !((g = a.hyperlink) === null || g === void 0) && g.url && (t += `<a:hlinkClick r:id="rId${a.hyperlink._rId}" tooltip="${a.hyperlink.tooltip ? fe(a.hyperlink.tooltip) : ""}"/>`), !((d = a.hyperlink) === null || d === void 0) && d.slide && (t += `<a:hlinkClick r:id="rId${a.hyperlink._rId}" tooltip="${a.hyperlink.tooltip ? fe(a.hyperlink.tooltip) : ""}" action="ppaction://hlinksldjump"/>`), t += "    </p:cNvPr>", t += '    <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>', t += "    <p:nvPr>" + er(p) + "</p:nvPr>", t += "  </p:nvPicPr>", t += "<p:blipFill>", (e._relsMedia || []).filter((w) => w.rId === a.imageRid)[0] && (e._relsMedia || []).filter((w) => w.rId === a.imageRid)[0].extn === "svg" ? (t += `<a:blip r:embed="rId${a.imageRid - 1}">`, t += a.options.transparency ? ` <a:alphaModFix amt="${Math.round((100 - a.options.transparency) * 1e3)}"/>` : "", t += " <a:extLst>", t += '  <a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}">', t += `   <asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main" r:embed="rId${a.imageRid}"/>`, t += "  </a:ext>", t += " </a:extLst>", t += "</a:blip>") : (t += `<a:blip r:embed="rId${a.imageRid}">`, t += a.options.transparency ? `<a:alphaModFix amt="${Math.round((100 - a.options.transparency) * 1e3)}"/>` : "", t += "</a:blip>"), S?.type) {
          const w = S.w ? pe(S.w, "X", e._presLayout) : y, G = S.h ? pe(S.h, "Y", e._presLayout) : m, ee = pe(S.x || 0, "X", e._presLayout), Y = pe(S.y || 0, "Y", e._presLayout);
          t += Ho[S.type]({ w: E, h: M }, { w, h: G, x: ee, y: Y }), E = w, M = G;
        } else
          t += "  <a:stretch><a:fillRect/></a:stretch>";
        t += "</p:blipFill>", t += "<p:spPr>", t += " <a:xfrm" + _ + ">", t += `  <a:off x="${h}" y="${u}"/>`, t += `  <a:ext cx="${E}" cy="${M}"/>`, t += " </a:xfrm>", t += ` <a:prstGeom prst="${O ? "ellipse" : "rect"}"><a:avLst/></a:prstGeom>`, a.options.shadow && a.options.shadow.type !== "none" && (a.options.shadow.type = a.options.shadow.type || "outer", a.options.shadow.blur = de(a.options.shadow.blur || 8), a.options.shadow.offset = de(a.options.shadow.offset || 4), a.options.shadow.angle = Math.round((a.options.shadow.angle || 270) * 6e4), a.options.shadow.opacity = Math.round((a.options.shadow.opacity || 0.75) * 1e5), a.options.shadow.color = a.options.shadow.color || Za.color, t += "<a:effectLst>", t += `<a:${a.options.shadow.type}Shdw ${a.options.shadow.type === "outer" ? 'sx="100000" sy="100000" kx="0" ky="0" algn="bl" rotWithShape="0"' : ""} blurRad="${a.options.shadow.blur}" dist="${a.options.shadow.offset}" dir="${a.options.shadow.angle}">`, t += `<a:srgbClr val="${a.options.shadow.color}">`, t += `<a:alpha val="${a.options.shadow.opacity}"/></a:srgbClr>`, t += `</a:${a.options.shadow.type}Shdw>`, t += "</a:effectLst>"), t += "</p:spPr>", t += "</p:pic>";
        break;
      case ue.media:
        a.mtype === "online" ? (t += "<p:pic>", t += " <p:nvPicPr>", t += `<p:cNvPr id="${a.mediaRid + 2}" name="${a.options.objectName}"/>`, t += " <p:cNvPicPr/>", t += " <p:nvPr>", t += `  <a:videoFile r:link="rId${a.mediaRid}"/>`, t += " </p:nvPr>", t += " </p:nvPicPr>", t += ` <p:blipFill><a:blip r:embed="rId${a.mediaRid + 1}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>`, t += " <p:spPr>", t += `  <a:xfrm${_}><a:off x="${h}" y="${u}"/><a:ext cx="${y}" cy="${m}"/></a:xfrm>`, t += '  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>', t += " </p:spPr>", t += "</p:pic>") : (t += "<p:pic>", t += " <p:nvPicPr>", t += `<p:cNvPr id="${a.mediaRid + 2}" name="${a.options.objectName}"><a:hlinkClick r:id="" action="ppaction://media"/></p:cNvPr>`, t += ' <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>', t += " <p:nvPr>", t += `  <a:videoFile r:link="rId${a.mediaRid}"/>`, t += "  <p:extLst>", t += '   <p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}">', t += `    <p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="rId${a.mediaRid + 1}"/>`, t += "   </p:ext>", t += "  </p:extLst>", t += " </p:nvPr>", t += " </p:nvPicPr>", t += ` <p:blipFill><a:blip r:embed="rId${a.mediaRid + 2}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>`, t += " <p:spPr>", t += `  <a:xfrm${_}><a:off x="${h}" y="${u}"/><a:ext cx="${y}" cy="${m}"/></a:xfrm>`, t += '  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>', t += " </p:spPr>", t += "</p:pic>");
        break;
      case ue.chart:
        t += "<p:graphicFrame>", t += " <p:nvGraphicFramePr>", t += `   <p:cNvPr id="${s + 2}" name="${a.options.objectName}" descr="${fe(a.options.altText || "")}"/>`, t += "   <p:cNvGraphicFramePr/>", t += `   <p:nvPr>${er(p)}</p:nvPr>`, t += " </p:nvGraphicFramePr>", t += ` <p:xfrm><a:off x="${h}" y="${u}"/><a:ext cx="${y}" cy="${m}"/></p:xfrm>`, t += ' <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">', t += '  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">', t += `   <c:chart r:id="rId${a.chartRid}" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"/>`, t += "  </a:graphicData>", t += " </a:graphic>", t += "</p:graphicFrame>";
        break;
      default:
        t += "";
        break;
    }
  }), e._slideNumberProps && (e._slideNumberProps.align || (e._slideNumberProps.align = "left"), t += "<p:sp>", t += " <p:nvSpPr>", t += '  <p:cNvPr id="25" name="Slide Number Placeholder 0"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>', t += '  <p:nvPr><p:ph type="sldNum" sz="quarter" idx="4294967295"/></p:nvPr>', t += " </p:nvSpPr>", t += " <p:spPr>", t += `<a:xfrm><a:off x="${pe(e._slideNumberProps.x, "X", e._presLayout)}" y="${pe(e._slideNumberProps.y, "Y", e._presLayout)}"/><a:ext cx="${e._slideNumberProps.w ? pe(e._slideNumberProps.w, "X", e._presLayout) : "800000"}" cy="${e._slideNumberProps.h ? pe(e._slideNumberProps.h, "Y", e._presLayout) : "300000"}"/></a:xfrm> <a:prstGeom prst="rect"><a:avLst/></a:prstGeom> <a:extLst><a:ext uri="{C572A759-6A51-4108-AA02-DFA0A04FC94B}"><ma14:wrappingTextBoxFlag val="0" xmlns:ma14="http://schemas.microsoft.com/office/mac/drawingml/2011/main"/></a:ext></a:extLst></p:spPr>`, t += "<p:txBody>", t += "<a:bodyPr", e._slideNumberProps.margin && Array.isArray(e._slideNumberProps.margin) ? (t += ` lIns="${de(e._slideNumberProps.margin[3] || 0)}"`, t += ` tIns="${de(e._slideNumberProps.margin[0] || 0)}"`, t += ` rIns="${de(e._slideNumberProps.margin[1] || 0)}"`, t += ` bIns="${de(e._slideNumberProps.margin[2] || 0)}"`) : typeof e._slideNumberProps.margin == "number" && (t += ` lIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` tIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` rIns="${de(e._slideNumberProps.margin || 0)}"`, t += ` bIns="${de(e._slideNumberProps.margin || 0)}"`), e._slideNumberProps.valign && (t += ` anchor="${e._slideNumberProps.valign.replace("top", "t").replace("middle", "ctr").replace("bottom", "b")}"`), t += "/>", t += "  <a:lstStyle><a:lvl1pPr>", (e._slideNumberProps.fontFace || e._slideNumberProps.fontSize || e._slideNumberProps.color) && (t += `<a:defRPr sz="${Math.round((e._slideNumberProps.fontSize || 12) * 100)}">`, e._slideNumberProps.color && (t += Ge(e._slideNumberProps.color)), e._slideNumberProps.fontFace && (t += `<a:latin typeface="${e._slideNumberProps.fontFace}"/><a:ea typeface="${e._slideNumberProps.fontFace}"/><a:cs typeface="${e._slideNumberProps.fontFace}"/>`), t += "</a:defRPr>"), t += "</a:lvl1pPr></a:lstStyle>", t += "<a:p>", e._slideNumberProps.align.startsWith("l") ? t += '<a:pPr algn="l"/>' : e._slideNumberProps.align.startsWith("c") ? t += '<a:pPr algn="ctr"/>' : e._slideNumberProps.align.startsWith("r") ? t += '<a:pPr algn="r"/>' : t += '<a:pPr algn="l"/>', t += `<a:fld id="${Fi}" type="slidenum"><a:rPr b="${e._slideNumberProps.bold ? 1 : 0}" lang="en-US"/>`, t += `<a:t>${e._slideNum}</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p>`, t += "</p:txBody></p:sp>"), t += "</p:spTree>", t += "</p:cSld>", t;
}
function za(e, r) {
  let t = 0, i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  return e._rels.forEach((a) => {
    t = Math.max(t, a.rId), a.type.toLowerCase().includes("hyperlink") ? a.data === "slide" ? i += `<Relationship Id="rId${a.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide${a.Target}.xml"/>` : i += `<Relationship Id="rId${a.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${a.Target}" TargetMode="External"/>` : a.type.toLowerCase().includes("notesSlide") && (i += `<Relationship Id="rId${a.rId}" Target="${a.Target}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"/>`);
  }), (e._relsChart || []).forEach((a) => {
    t = Math.max(t, a.rId), i += `<Relationship Id="rId${a.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="${a.Target}"/>`;
  }), (e._relsMedia || []).forEach((a) => {
    const s = a.rId.toString();
    t = Math.max(t, a.rId), a.type.toLowerCase().includes("image") ? i += '<Relationship Id="rId' + s + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="' + a.Target + '"/>' : a.type.toLowerCase().includes("audio") ? i.includes(' Target="' + a.Target + '"') ? i += '<Relationship Id="rId' + s + '" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="' + a.Target + '"/>' : i += '<Relationship Id="rId' + s + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="' + a.Target + '"/>' : a.type.toLowerCase().includes("video") ? i.includes(' Target="' + a.Target + '"') ? i += '<Relationship Id="rId' + s + '" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="' + a.Target + '"/>' : i += '<Relationship Id="rId' + s + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video" Target="' + a.Target + '"/>' : a.type.toLowerCase().includes("online") && (i.includes(' Target="' + a.Target + '"') ? i += '<Relationship Id="rId' + s + '" Type="http://schemas.microsoft.com/office/2007/relationships/image" Target="' + a.Target + '"/>' : i += '<Relationship Id="rId' + s + '" Target="' + a.Target + '" TargetMode="External" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/video"/>');
  }), r.forEach((a, s) => {
    i += `<Relationship Id="rId${t + s + 1}" Type="${a.type}" Target="${a.target}"/>`;
  }), i += "</Relationships>", i;
}
function rn(e, r) {
  var t, i;
  let a = "", s = "", l = "", A = "";
  const c = r ? "a:lvl1pPr" : "a:pPr";
  let n = de(Eo), o = `<${c}${e.options.rtlMode ? ' rtl="1" ' : ""}`;
  {
    if (e.options.align)
      switch (e.options.align) {
        case "left":
          o += ' algn="l"';
          break;
        case "right":
          o += ' algn="r"';
          break;
        case "center":
          o += ' algn="ctr"';
          break;
        case "justify":
          o += ' algn="just"';
          break;
        default:
          o += "";
          break;
      }
    if (e.options.lineSpacing ? s = `<a:lnSpc><a:spcPts val="${Math.round(e.options.lineSpacing * 100)}"/></a:lnSpc>` : e.options.lineSpacingMultiple && (s = `<a:lnSpc><a:spcPct val="${Math.round(e.options.lineSpacingMultiple * 1e5)}"/></a:lnSpc>`), e.options.indentLevel && !isNaN(Number(e.options.indentLevel)) && e.options.indentLevel > 0 && (o += ` lvl="${e.options.indentLevel}"`), e.options.paraSpaceBefore && !isNaN(Number(e.options.paraSpaceBefore)) && e.options.paraSpaceBefore > 0 && (l += `<a:spcBef><a:spcPts val="${Math.round(e.options.paraSpaceBefore * 100)}"/></a:spcBef>`), e.options.paraSpaceAfter && !isNaN(Number(e.options.paraSpaceAfter)) && e.options.paraSpaceAfter > 0 && (l += `<a:spcAft><a:spcPts val="${Math.round(e.options.paraSpaceAfter * 100)}"/></a:spcAft>`), typeof e.options.bullet == "object")
      if (!((i = (t = e?.options) === null || t === void 0 ? void 0 : t.bullet) === null || i === void 0) && i.indent && (n = de(e.options.bullet.indent)), e.options.bullet.type)
        e.options.bullet.type.toString().toLowerCase() === "number" && (o += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? n + n * e.options.indentLevel : n}" indent="-${n}"`, a = `<a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum type="${e.options.bullet.style || "arabicPeriod"}" startAt="${e.options.bullet.numberStartAt || e.options.bullet.startAt || "1"}"/>`);
      else if (e.options.bullet.characterCode) {
        let f = `&#x${e.options.bullet.characterCode};`;
        /^[0-9A-Fa-f]{4}$/.test(e.options.bullet.characterCode) || (console.warn("Warning: `bullet.characterCode should be a 4-digit unicode charatcer (ex: 22AB)`!"), f = Et.DEFAULT), o += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? n + n * e.options.indentLevel : n}" indent="-${n}"`, a = '<a:buSzPct val="100000"/><a:buChar char="' + f + '"/>';
      } else if (e.options.bullet.code) {
        let f = `&#x${e.options.bullet.code};`;
        /^[0-9A-Fa-f]{4}$/.test(e.options.bullet.code) || (console.warn("Warning: `bullet.code should be a 4-digit hex code (ex: 22AB)`!"), f = Et.DEFAULT), o += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? n + n * e.options.indentLevel : n}" indent="-${n}"`, a = '<a:buSzPct val="100000"/><a:buChar char="' + f + '"/>';
      } else
        o += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? n + n * e.options.indentLevel : n}" indent="-${n}"`, a = `<a:buSzPct val="100000"/><a:buChar char="${Et.DEFAULT}"/>`;
    else e.options.bullet ? (o += ` marL="${e.options.indentLevel && e.options.indentLevel > 0 ? n + n * e.options.indentLevel : n}" indent="-${n}"`, a = `<a:buSzPct val="100000"/><a:buChar char="${Et.DEFAULT}"/>`) : e.options.bullet || (o += ' indent="0" marL="0"', a = "<a:buNone/>");
    e.options.tabStops && Array.isArray(e.options.tabStops) && (A = `<a:tabLst>${e.options.tabStops.map((g) => `<a:tab pos="${ve(g.position || 1)}" algn="${g.alignment || "l"}"/>`).join("")}</a:tabLst>`), o += ">" + s + l + a + A, r && (o += Ui(e.options, !0)), o += "</" + c + ">";
  }
  return o;
}
function Ui(e, r) {
  var t;
  let i = "";
  const a = r ? "a:defRPr" : "a:rPr";
  if (i += "<" + a + ' lang="' + (e.lang ? e.lang : "en-US") + '"' + (e.lang ? ' altLang="en-US"' : ""), i += e.fontSize ? ` sz="${Math.round(e.fontSize * 100)}"` : "", i += e?.bold ? ` b="${e.bold ? "1" : "0"}"` : "", i += e?.italic ? ` i="${e.italic ? "1" : "0"}"` : "", i += e?.strike ? ` strike="${typeof e.strike == "string" ? e.strike : "sngStrike"}"` : "", typeof e.underline == "object" && (!((t = e.underline) === null || t === void 0) && t.style) ? i += ` u="${e.underline.style}"` : typeof e.underline == "string" ? i += ` u="${String(e.underline)}"` : e.hyperlink && (i += ' u="sng"'), e.baseline ? i += ` baseline="${Math.round(e.baseline * 50)}"` : e.subscript ? i += ' baseline="-40000"' : e.superscript && (i += ' baseline="30000"'), i += e.charSpacing ? ` spc="${Math.round(e.charSpacing * 100)}" kern="0"` : "", i += ' dirty="0">', (e.color || e.fontFace || e.outline || typeof e.underline == "object" && e.underline.color) && (e.outline && typeof e.outline == "object" && (i += `<a:ln w="${de(e.outline.size || 0.75)}">${Ge(e.outline.color || "FFFFFF")}</a:ln>`), e.color && (i += Ge({ color: e.color, transparency: e.transparency })), e.highlight && (i += `<a:highlight>${_e(e.highlight)}</a:highlight>`), typeof e.underline == "object" && e.underline.color && (i += `<a:uFill>${Ge(e.underline.color)}</a:uFill>`), e.glow && (i += `<a:effectLst>${Po(e.glow, Do)}</a:effectLst>`), e.fontFace && (i += `<a:latin typeface="${e.fontFace}" pitchFamily="34" charset="0"/><a:ea typeface="${e.fontFace}" pitchFamily="34" charset="-122"/><a:cs typeface="${e.fontFace}" pitchFamily="34" charset="-120"/>`)), e.hyperlink) {
    if (typeof e.hyperlink != "object")
      throw new Error("ERROR: text `hyperlink` option should be an object. Ex: `hyperlink:{url:'https://github.com'}` ");
    if (!e.hyperlink.url && !e.hyperlink.slide)
      throw new Error("ERROR: 'hyperlink requires either `url` or `slide`'");
    e.hyperlink.url ? i += `<a:hlinkClick r:id="rId${e.hyperlink._rId}" invalidUrl="" action="" tgtFrame="" tooltip="${e.hyperlink.tooltip ? fe(e.hyperlink.tooltip) : ""}" history="1" highlightClick="0" endSnd="0"${e.color ? ">" : "/>"}` : e.hyperlink.slide && (i += `<a:hlinkClick r:id="rId${e.hyperlink._rId}" action="ppaction://hlinksldjump" tooltip="${e.hyperlink.tooltip ? fe(e.hyperlink.tooltip) : ""}"${e.color ? ">" : "/>"}`), e.color && (i += " <a:extLst>", i += '  <a:ext uri="{A12FA001-AC4F-418D-AE19-62706E023703}">', i += '   <ahyp:hlinkClr xmlns:ahyp="http://schemas.microsoft.com/office/drawing/2018/hyperlinkcolor" val="tx"/>', i += "  </a:ext>", i += " </a:extLst>", i += "</a:hlinkClick>");
  }
  return i += `</${a}>`, i;
}
function Wo(e) {
  return e.text ? `<a:r>${Ui(e.options, !1)}<a:t>${fe(e.text)}</a:t></a:r>` : "";
}
function qo(e) {
  let r = "<a:bodyPr";
  return e && e._type === ue.text && e.options._bodyProp ? (r += e.options._bodyProp.wrap ? ' wrap="square"' : ' wrap="none"', (e.options._bodyProp.lIns || e.options._bodyProp.lIns === 0) && (r += ` lIns="${e.options._bodyProp.lIns}"`), (e.options._bodyProp.tIns || e.options._bodyProp.tIns === 0) && (r += ` tIns="${e.options._bodyProp.tIns}"`), (e.options._bodyProp.rIns || e.options._bodyProp.rIns === 0) && (r += ` rIns="${e.options._bodyProp.rIns}"`), (e.options._bodyProp.bIns || e.options._bodyProp.bIns === 0) && (r += ` bIns="${e.options._bodyProp.bIns}"`), r += ' rtlCol="0"', e.options._bodyProp.anchor && (r += ' anchor="' + e.options._bodyProp.anchor + '"'), e.options._bodyProp.vert && (r += ' vert="' + e.options._bodyProp.vert + '"'), r += ">", e.options.fit && (e.options.fit === "none" ? r += "" : e.options.fit === "shrink" ? r += "<a:normAutofit/>" : e.options.fit === "resize" && (r += "<a:spAutoFit/>")), e.options.shrinkText && (r += "<a:normAutofit/>"), r += e.options._bodyProp.autoFit ? "<a:spAutoFit/>" : "", r += "</a:bodyPr>") : (r += ' wrap="square" rtlCol="0">', r += "</a:bodyPr>"), e._type === ue.tablecell ? "<a:bodyPr/>" : r;
}
function an(e) {
  const r = e.options || {};
  let t = [];
  const i = [];
  if (r && e._type !== ue.tablecell && (typeof e.text > "u" || e.text === null))
    return "";
  let a = e._type === ue.tablecell ? "<a:txBody>" : "<p:txBody>";
  a += qo(e), r.h === 0 && r.line && r.align ? a += '<a:lstStyle><a:lvl1pPr algn="l"/></a:lstStyle>' : e._type === "placeholder" ? a += `<a:lstStyle>${rn(e, !0)}</a:lstStyle>` : a += "<a:lstStyle/>", typeof e.text == "string" || typeof e.text == "number" ? t.push({ text: e.text.toString(), options: r || {} }) : e.text && !Array.isArray(e.text) && typeof e.text == "object" && Object.keys(e.text).includes("text") ? t.push({ text: e.text || "", options: e.options || {} }) : Array.isArray(e.text) && (t = e.text.map((A) => ({ text: A.text, options: A.options }))), t.forEach((A, c) => {
    A.text || (A.text = ""), A.options = A.options || r || {}, c === 0 && A.options && !A.options.bullet && r.bullet && (A.options.bullet = r.bullet), (typeof A.text == "string" || typeof A.text == "number") && (A.text = A.text.toString().replace(/\r*\n/g, Pe)), A.text.includes(Pe) && A.text.match(/\n$/g) === null ? A.text.split(Pe).forEach((n) => {
      A.options.breakLine = !0, i.push({ text: n, options: A.options });
    }) : i.push(A);
  });
  const s = [];
  let l = [];
  return i.forEach((A, c) => {
    l.length > 0 && (A.options.align || r.align) ? A.options.align !== i[c - 1].options.align && (s.push(l), l = []) : l.length > 0 && A.options.bullet && l.length > 0 && (s.push(l), l = [], A.options.breakLine = !1), l.push(A), l.length > 0 && A.options.breakLine && c + 1 < i.length && (s.push(l), l = []), c + 1 === i.length && s.push(l);
  }), s.forEach((A) => {
    var c;
    let n = !1;
    a += "<a:p>";
    let o = `<a:pPr ${!((c = A[0].options) === null || c === void 0) && c.rtlMode ? ' rtl="1" ' : ""}`;
    A.forEach((f, g) => {
      f.options._lineIdx = g, g > 0 && f.options.softBreakBefore && (a += "<a:br/>"), f.options.align = f.options.align || r.align, f.options.lineSpacing = f.options.lineSpacing || r.lineSpacing, f.options.lineSpacingMultiple = f.options.lineSpacingMultiple || r.lineSpacingMultiple, f.options.indentLevel = f.options.indentLevel || r.indentLevel, f.options.paraSpaceBefore = f.options.paraSpaceBefore || r.paraSpaceBefore, f.options.paraSpaceAfter = f.options.paraSpaceAfter || r.paraSpaceAfter, o = rn(f, !1), a += o.replace("<a:pPr></a:pPr>", ""), Object.entries(r).filter(([d]) => !(f.options.hyperlink && d === "color")).forEach(([d, h]) => {
        d !== "bullet" && !f.options[d] && (f.options[d] = h);
      }), a += Wo(f), (!f.text && r.fontSize || f.options.fontSize) && (n = !0, r.fontSize = r.fontSize || f.options.fontSize);
    }), e._type === ue.tablecell && (r.fontSize || r.fontFace) ? r.fontFace ? (a += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0">', a += `<a:latin typeface="${r.fontFace}" charset="0"/>`, a += `<a:ea typeface="${r.fontFace}" charset="0"/>`, a += `<a:cs typeface="${r.fontFace}" charset="0"/>`, a += "</a:endParaRPr>") : a += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0"/>' : n ? a += `<a:endParaRPr lang="${r.lang || "en-US"}"` + (r.fontSize ? ` sz="${Math.round(r.fontSize * 100)}"` : "") + ' dirty="0"/>' : a += `<a:endParaRPr lang="${r.lang || "en-US"}" dirty="0"/>`, a += "</a:p>";
  }), a.indexOf("<a:p>") === -1 && (a += "<a:p><a:endParaRPr/></a:p>"), a += e._type === ue.tablecell ? "</a:txBody>" : "</p:txBody>", a;
}
function er(e) {
  var r, t;
  if (!e)
    return "";
  const i = !((r = e.options) === null || r === void 0) && r._placeholderIdx ? e.options._placeholderIdx : "", a = !((t = e.options) === null || t === void 0) && t._placeholderType ? e.options._placeholderType : "", s = a && zt[a] ? zt[a].toString() : "";
  return `<p:ph
		${i ? ' idx="' + i.toString() + '"' : ""}
		${s && zt[s] ? ` type="${s}"` : ""}
		${e.text && e.text.length > 0 ? ' hasCustomPrompt="1"' : ""}
		/>`;
}
function Vo(e, r, t) {
  let i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  return i += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">', i += '<Default Extension="xml" ContentType="application/xml"/>', i += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>', i += '<Default Extension="jpeg" ContentType="image/jpeg"/>', i += '<Default Extension="jpg" ContentType="image/jpg"/>', i += '<Default Extension="svg" ContentType="image/svg+xml"/>', i += '<Default Extension="png" ContentType="image/png"/>', i += '<Default Extension="gif" ContentType="image/gif"/>', i += '<Default Extension="m4v" ContentType="video/mp4"/>', i += '<Default Extension="mp4" ContentType="video/mp4"/>', e.forEach((a) => {
    (a._relsMedia || []).forEach((s) => {
      s.type !== "image" && s.type !== "online" && s.type !== "chart" && s.extn !== "m4v" && !i.includes(s.type) && (i += '<Default Extension="' + s.extn + '" ContentType="' + s.type + '"/>');
    });
  }), i += '<Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/>', i += '<Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>', i += '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>', i += '<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>', e.forEach((a, s) => {
    i += `<Override PartName="/ppt/slideMasters/slideMaster${s + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`, i += `<Override PartName="/ppt/slides/slide${s + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`, a._relsChart.forEach((l) => {
      i += `<Override PartName="${l.Target}" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`;
    });
  }), i += '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>', i += '<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>', i += '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>', i += '<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>', r.forEach((a, s) => {
    i += `<Override PartName="/ppt/slideLayouts/slideLayout${s + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`, (a._relsChart || []).forEach((l) => {
      i += ' <Override PartName="' + l.Target + '" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';
    });
  }), e.forEach((a, s) => {
    i += `<Override PartName="/ppt/notesSlides/notesSlide${s + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
  }), t._relsChart.forEach((a) => {
    i += ' <Override PartName="' + a.Target + '" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';
  }), t._relsMedia.forEach((a) => {
    a.type !== "image" && a.type !== "online" && a.type !== "chart" && a.extn !== "m4v" && !i.includes(a.type) && (i += ' <Default Extension="' + a.extn + '" ContentType="' + a.type + '"/>');
  }), i += ' <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>', i += ' <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>', i += "</Types>", i;
}
function Qo() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
		<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
		<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
		<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
		</Relationships>`;
}
function jo(e, r) {
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
			${e.map((t, i) => `<vt:lpstr>Slide ${i + 1}</vt:lpstr>`).join("")}
		</vt:vector>
	</TitlesOfParts>
	<Company>${r}</Company>
	<LinksUpToDate>false</LinksUpToDate>
	<SharedDoc>false</SharedDoc>
	<HyperlinksChanged>false</HyperlinksChanged>
	<AppVersion>16.0000</AppVersion>
	</Properties>`;
}
function Yo(e, r, t, i) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
	<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<dc:title>${fe(e)}</dc:title>
		<dc:subject>${fe(r)}</dc:subject>
		<dc:creator>${fe(t)}</dc:creator>
		<cp:lastModifiedBy>${fe(t)}</cp:lastModifiedBy>
		<cp:revision>${i}</cp:revision>
		<dcterms:created xsi:type="dcterms:W3CDTF">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d\d\dZ/, "Z")}</dcterms:created>
		<dcterms:modified xsi:type="dcterms:W3CDTF">${(/* @__PURE__ */ new Date()).toISOString().replace(/\.\d\d\dZ/, "Z")}</dcterms:modified>
	</cp:coreProperties>`;
}
function Ko(e) {
  let r = 1, t = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  t += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">', t += '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>';
  for (let i = 1; i <= e.length; i++)
    t += `<Relationship Id="rId${++r}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
  return r++, t += `<Relationship Id="rId${r + 0}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/><Relationship Id="rId${r + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/><Relationship Id="rId${r + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/><Relationship Id="rId${r + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId${r + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/></Relationships>`, t;
}
function Jo(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"${e?.hidden ? ' show="0"' : ""}>${$a(e)}<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
function Zo(e) {
  let r = "";
  return e._slideObjects.forEach((t) => {
    t._type === ue.notes && (r += t?.text && t.text[0] ? t.text[0].text : "");
  }), r.replace(/\r*\n/g, Pe);
}
function es() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Header Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="hdr" sz="quarter"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="2971800" cy="458788"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle><a:lvl1pPr algn="l"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Date Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="dt" idx="1"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="3884613" y="0"/><a:ext cx="2971800" cy="458788"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle><a:lvl1pPr algn="r"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:fld id="{5282F153-3F37-0F45-9E97-73ACFA13230C}" type="datetimeFigureOut"><a:rPr lang="en-US"/><a:t>7/23/19</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Image Placeholder 3"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="1143000"/><a:ext cx="5486400" cy="3086100"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln w="12700"><a:solidFill><a:prstClr val="black"/></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="5" name="Notes Placeholder 4"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="4400550"/><a:ext cx="5486400" cy="3600450"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0"/><a:lstStyle/><a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US"/><a:t>Click to edit Master text styles</a:t></a:r></a:p><a:p><a:pPr lvl="1"/><a:r><a:rPr lang="en-US"/><a:t>Second level</a:t></a:r></a:p><a:p><a:pPr lvl="2"/><a:r><a:rPr lang="en-US"/><a:t>Third level</a:t></a:r></a:p><a:p><a:pPr lvl="3"/><a:r><a:rPr lang="en-US"/><a:t>Fourth level</a:t></a:r></a:p><a:p><a:pPr lvl="4"/><a:r><a:rPr lang="en-US"/><a:t>Fifth level</a:t></a:r></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="6" name="Footer Placeholder 5"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ftr" sz="quarter" idx="4"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="8685213"/><a:ext cx="2971800" cy="458787"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="b"/><a:lstStyle><a:lvl1pPr algn="l"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="7" name="Slide Number Placeholder 6"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldNum" sz="quarter" idx="5"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="3884613" y="8685213"/><a:ext cx="2971800" cy="458787"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr vert="horz" lIns="91440" tIns="45720" rIns="91440" bIns="45720" rtlCol="0" anchor="b"/><a:lstStyle><a:lvl1pPr algn="r"><a:defRPr sz="1200"/></a:lvl1pPr></a:lstStyle><a:p><a:fld id="{CE5E9CC1-C706-0F49-92D6-E571CC5EEA8F}" type="slidenum"><a:rPr lang="en-US"/><a:t>‹#›</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp></p:spTree><p:extLst><p:ext uri="{BB962C8B-B14F-4D97-AF65-F5344CB8AC3E}"><p14:creationId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1024086991"/></p:ext></p:extLst></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:notesStyle><a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr><a:lvl2pPr marL="457200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr><a:lvl3pPr marL="914400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr><a:lvl4pPr marL="1371600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr><a:lvl5pPr marL="1828800" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr><a:lvl6pPr marL="2286000" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr><a:lvl7pPr marL="2743200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr><a:lvl8pPr marL="3200400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr><a:lvl9pPr marL="3657600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr></p:notesStyle></p:notesMaster>`;
}
function ts(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${fe(Zo(e))}</a:t></a:r><a:endParaRPr lang="en-US" dirty="0"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Number Placeholder 3"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldNum" sz="quarter" idx="10"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:fld id="${Fi}" type="slidenum"><a:rPr lang="en-US"/><a:t>${e._slideNum}</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp></p:spTree><p:extLst><p:ext uri="{BB962C8B-B14F-4D97-AF65-F5344CB8AC3E}"><p14:creationId xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="1024086991"/></p:ext></p:extLst></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
}
function rs(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" preserve="1">
		${$a(e)}
		<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
}
function as(e, r) {
  const t = r.map((a, s) => `<p:sldLayoutId id="${Co + s}" r:id="rId${e._rels.length + s + 1}"/>`);
  let i = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + Pe;
  return i += '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">', i += $a(e), i += '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>', i += "<p:sldLayoutIdLst>" + t.join("") + "</p:sldLayoutIdLst>", i += '<p:hf sldNum="0" hdr="0" ftr="0" dt="0"/>', i += '<p:txStyles> <p:titleStyle>  <a:lvl1pPr algn="ctr" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="0"/></a:spcBef><a:buNone/><a:defRPr sz="4400" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mj-lt"/><a:ea typeface="+mj-ea"/><a:cs typeface="+mj-cs"/></a:defRPr></a:lvl1pPr> </p:titleStyle> <p:bodyStyle>  <a:lvl1pPr marL="342900" indent="-342900" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="3200" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr>  <a:lvl2pPr marL="742950" indent="-285750" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="–"/><a:defRPr sz="2800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr>  <a:lvl3pPr marL="1143000" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2400" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr>  <a:lvl4pPr marL="1600200" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="–"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr>  <a:lvl5pPr marL="2057400" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="»"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr>  <a:lvl6pPr marL="2514600" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr>  <a:lvl7pPr marL="2971800" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr>  <a:lvl8pPr marL="3429000" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr>  <a:lvl9pPr marL="3886200" indent="-228600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:spcBef><a:spcPct val="20000"/></a:spcBef><a:buFont typeface="Arial" pitchFamily="34" charset="0"/><a:buChar char="•"/><a:defRPr sz="2000" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr> </p:bodyStyle> <p:otherStyle>  <a:defPPr><a:defRPr lang="en-US"/></a:defPPr>  <a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl1pPr>  <a:lvl2pPr marL="457200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl2pPr>  <a:lvl3pPr marL="914400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl3pPr>  <a:lvl4pPr marL="1371600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl4pPr>  <a:lvl5pPr marL="1828800" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl5pPr>  <a:lvl6pPr marL="2286000" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl6pPr>  <a:lvl7pPr marL="2743200" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl7pPr>  <a:lvl8pPr marL="3200400" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl8pPr>  <a:lvl9pPr marL="3657600" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl9pPr> </p:otherStyle></p:txStyles>', i += "</p:sldMaster>", i;
}
function ns(e, r) {
  return za(r[e - 1], [
    {
      target: "../slideMasters/slideMaster1.xml",
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
    }
  ]);
}
function is(e, r, t) {
  return za(e[t - 1], [
    {
      target: `../slideLayouts/slideLayout${cs(e, r, t)}.xml`,
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
    },
    {
      target: `../notesSlides/notesSlide${t}.xml`,
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"
    }
  ]);
}
function os(e) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
		<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
			<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/>
			<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${e}.xml"/>
		</Relationships>`;
}
function ss(e, r) {
  const t = r.map((i, a) => ({
    target: `../slideLayouts/slideLayout${a + 1}.xml`,
    type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
  }));
  return t.push({ target: "../theme/theme1.xml", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" }), za(e, t);
}
function ls() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
		<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
		</Relationships>`;
}
function cs(e, r, t) {
  for (let i = 0; i < r.length; i++)
    if (r[i]._name === e[t - 1]._slideLayout._name)
      return i + 1;
  return 1;
}
function As(e) {
  var r, t, i, a;
  const s = !((r = e.theme) === null || r === void 0) && r.headFontFace ? `<a:latin typeface="${(t = e.theme) === null || t === void 0 ? void 0 : t.headFontFace}"/>` : '<a:latin typeface="Calibri Light" panose="020F0302020204030204"/>', l = !((i = e.theme) === null || i === void 0) && i.bodyFontFace ? `<a:latin typeface="${(a = e.theme) === null || a === void 0 ? void 0 : a.bodyFontFace}"/>` : '<a:latin typeface="Calibri" panose="020F0502020204030204"/>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont>${s}<a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线 Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Angsana New"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:majorFont><a:minorFont>${l}<a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Cordia New"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst></a:theme>`;
}
function ds(e) {
  let r = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" ${e.rtlMode ? 'rtl="1"' : ""} saveSubsetFonts="1" autoCompressPictures="0">`;
  r += '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>', r += "<p:sldIdLst>", e.slides.forEach((t) => r += `<p:sldId id="${t._slideId}" r:id="rId${t._rId}"/>`), r += "</p:sldIdLst>", r += `<p:notesMasterIdLst><p:notesMasterId r:id="rId${e.slides.length + 2}"/></p:notesMasterIdLst>`, r += `<p:sldSz cx="${e.presLayout.width}" cy="${e.presLayout.height}"/>`, r += `<p:notesSz cx="${e.presLayout.height}" cy="${e.presLayout.width}"/>`, r += "<p:defaultTextStyle>";
  for (let t = 1; t < 10; t++)
    r += `<a:lvl${t}pPr marL="${(t - 1) * 457200}" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1"><a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl${t}pPr>`;
  return r += "</p:defaultTextStyle>", e.sections && e.sections.length > 0 && (r += '<p:extLst><p:ext uri="{521415D9-36F7-43E2-AB2F-B90AF26B5E84}">', r += '<p14:sectionLst xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">', e.sections.forEach((t) => {
    r += `<p14:section name="${fe(t.title)}" id="{${Ur("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")}}"><p14:sldIdLst>`, t._slides.forEach((i) => r += `<p14:sldId id="${i._slideId}"/>`), r += "</p14:sldIdLst></p14:section>";
  }), r += "</p14:sectionLst></p:ext>", r += '<p:ext uri="{EFAFB233-063F-42B5-8137-9DF3F51BA10A}"><p15:sldGuideLst xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main"/></p:ext>', r += "</p:extLst>"), r += "</p:presentation>", r;
}
function fs() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>`;
}
function us() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>`;
}
function hs() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${Pe}<p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:normalViewPr horzBarState="maximized"><p:restoredLeft sz="15611"/><p:restoredTop sz="94610"/></p:normalViewPr><p:slideViewPr><p:cSldViewPr snapToGrid="0" snapToObjects="1"><p:cViewPr varScale="1"><p:scale><a:sx n="136" d="100"/><a:sy n="136" d="100"/></p:scale><p:origin x="216" y="312"/></p:cViewPr><p:guideLst/></p:cSldViewPr></p:slideViewPr><p:notesTextViewPr><p:cViewPr><p:scale><a:sx n="1" d="1"/><a:sy n="1" d="1"/></p:scale><p:origin x="0" y="0"/></p:cViewPr></p:notesTextViewPr><p:gridSpacing cx="76200" cy="76200"/></p:viewPr>`;
}
const ps = "4.0.1";
class ms {
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
    this._version = ps, this._alignH = Pa, this._alignV = Na, this._chartType = Ra, this._outputType = Da, this._schemeColor = ze, this._shapeType = Ba, this._charts = re, this._colors = Xr, this._shapes = ot, this.addNewSlide = (s) => {
      const l = this.sections.length > 0 && this.sections[this.sections.length - 1]._slides.filter((A) => A._slideNum === this.slides[this.slides.length - 1]._slideNum).length > 0;
      return s.sectionTitle = l ? this.sections[this.sections.length - 1].title : null, this.addSlide(s);
    }, this.getSlide = (s) => this.slides.filter((l) => l._slideNum === s)[0], this.setSlideNumber = (s) => {
      this.masterSlide._slideNumberProps = s, this.slideLayouts.filter((l) => l._name === Ea)[0]._slideNumberProps = s;
    }, this.createChartMediaRels = (s, l, A) => {
      s._relsChart.forEach((c) => A.push(Uo(c, l))), s._relsMedia.forEach((c) => {
        if (c.type !== "online" && c.type !== "hyperlink") {
          let n = c.data && typeof c.data == "string" ? c.data : "";
          !n.includes(",") && !n.includes(";") ? n = "image/png;base64," + n : n.includes(",") ? n.includes(";") || (n = "image/png;" + n) : n = "image/png;base64," + n, l.file(c.Target.replace("..", "ppt"), n.split(",").pop(), { base64: !0 });
        }
      });
    }, this.writeFileToBrowser = (s, l) => Ue(this, void 0, void 0, function* () {
      const A = document.createElement("a");
      if (A.setAttribute("style", "display:none;"), A.dataset.interception = "off", document.body.appendChild(A), window.URL.createObjectURL) {
        const c = window.URL.createObjectURL(new Blob([l], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }));
        return A.href = c, A.download = s, A.click(), setTimeout(() => {
          window.URL.revokeObjectURL(c), document.body.removeChild(A);
        }, 100), yield Promise.resolve(s);
      }
    }), this.exportPresentation = (s) => Ue(this, void 0, void 0, function* () {
      const l = [];
      let A = [];
      const c = new Ni();
      return this.slides.forEach((n) => {
        A = A.concat(Aa(n));
      }), this.slideLayouts.forEach((n) => {
        A = A.concat(Aa(n));
      }), A = A.concat(Aa(this.masterSlide)), yield Promise.all(A).then(() => Ue(this, void 0, void 0, function* () {
        return this.slides.forEach((n) => {
          n._slideLayout && $o(n);
        }), c.folder("_rels"), c.folder("docProps"), c.folder("ppt").folder("_rels"), c.folder("ppt/charts").folder("_rels"), c.folder("ppt/embeddings"), c.folder("ppt/media"), c.folder("ppt/slideLayouts").folder("_rels"), c.folder("ppt/slideMasters").folder("_rels"), c.folder("ppt/slides").folder("_rels"), c.folder("ppt/theme"), c.folder("ppt/notesMasters").folder("_rels"), c.folder("ppt/notesSlides").folder("_rels"), c.file("[Content_Types].xml", Vo(this.slides, this.slideLayouts, this.masterSlide)), c.file("_rels/.rels", Qo()), c.file("docProps/app.xml", jo(this.slides, this.company)), c.file("docProps/core.xml", Yo(this.title, this.subject, this.author, this.revision)), c.file("ppt/_rels/presentation.xml.rels", Ko(this.slides)), c.file("ppt/theme/theme1.xml", As(this)), c.file("ppt/presentation.xml", ds(this)), c.file("ppt/presProps.xml", fs()), c.file("ppt/tableStyles.xml", us()), c.file("ppt/viewProps.xml", hs()), this.slideLayouts.forEach((n, o) => {
          c.file(`ppt/slideLayouts/slideLayout${o + 1}.xml`, rs(n)), c.file(`ppt/slideLayouts/_rels/slideLayout${o + 1}.xml.rels`, ns(o + 1, this.slideLayouts));
        }), this.slides.forEach((n, o) => {
          c.file(`ppt/slides/slide${o + 1}.xml`, Jo(n)), c.file(`ppt/slides/_rels/slide${o + 1}.xml.rels`, is(this.slides, this.slideLayouts, o + 1)), c.file(`ppt/notesSlides/notesSlide${o + 1}.xml`, ts(n)), c.file(`ppt/notesSlides/_rels/notesSlide${o + 1}.xml.rels`, os(o + 1));
        }), c.file("ppt/slideMasters/slideMaster1.xml", as(this.masterSlide, this.slideLayouts)), c.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", ss(this.masterSlide, this.slideLayouts)), c.file("ppt/notesMasters/notesMaster1.xml", es()), c.file("ppt/notesMasters/_rels/notesMaster1.xml.rels", ls()), this.slideLayouts.forEach((n) => {
          this.createChartMediaRels(n, c, l);
        }), this.slides.forEach((n) => {
          this.createChartMediaRels(n, c, l);
        }), this.createChartMediaRels(this.masterSlide, c, l), yield Promise.all(l).then(() => Ue(this, void 0, void 0, function* () {
          return s.outputType === "STREAM" ? yield c.generateAsync({ type: "nodebuffer", compression: s.compression ? "DEFLATE" : "STORE" }) : s.outputType ? yield c.generateAsync({ type: s.outputType }) : yield c.generateAsync({ type: "blob", compression: s.compression ? "DEFLATE" : "STORE" });
        }));
      }));
    });
    const r = { name: "screen4x3", width: 9144e3, height: 6858e3 }, t = { name: "screen16x9", width: 9144e3, height: 5143500 }, i = { name: "screen16x10", width: 9144e3, height: 5715e3 }, a = { name: "custom", width: 12192e3, height: 6858e3 };
    this.LAYOUTS = {
      LAYOUT_4x3: r,
      LAYOUT_16x9: t,
      LAYOUT_16x10: i,
      LAYOUT_WIDE: a
    }, this._author = "PptxGenJS", this._company = "PptxGenJS", this._revision = "1", this._subject = "PptxGenJS Presentation", this._title = "PptxGenJS Presentation", this._presLayout = {
      name: this.LAYOUTS[wt].name,
      _sizeW: this.LAYOUTS[wt].width,
      _sizeH: this.LAYOUTS[wt].height,
      width: this.LAYOUTS[wt].width,
      height: this.LAYOUTS[wt].height
    }, this._rtlMode = !1, this._slideLayouts = [
      {
        _margin: Xt,
        _name: Ea,
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
    return Ue(this, void 0, void 0, function* () {
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
    return Ue(this, void 0, void 0, function* () {
      const t = typeof r == "object" && r?.outputType ? r.outputType : r || null, i = typeof r == "object" && r?.compression ? r.compression : !1;
      return yield this.exportPresentation({
        compression: i,
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
    return Ue(this, void 0, void 0, function* () {
      var t, i;
      const a = typeof process < "u" && !!(!((t = process.versions) === null || t === void 0) && t.node) && ((i = process.release) === null || i === void 0 ? void 0 : i.name) === "node";
      typeof r == "string" && (console.warn("[WARNING] writeFile(string) is deprecated - pass { fileName } instead."), r = { fileName: r });
      const { fileName: s = "Presentation.pptx", compression: l = !1 } = r, A = s.toLowerCase().endsWith(".pptx") ? s : `${s}.pptx`, c = a ? "nodebuffer" : null, n = yield this.exportPresentation({ compression: l, outputType: c });
      if (a) {
        const { promises: o } = yield import("./__vite-browser-external.js"), { writeFile: f } = o;
        return yield f(A, n), A;
      }
      return yield this.writeFileToBrowser(A, n), A;
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
    let i = {
      _name: this.LAYOUTS[wt].name,
      _presLayout: this.presLayout,
      _rels: [],
      _relsChart: [],
      _relsMedia: [],
      _slideNum: this.slides.length + 1
    };
    if (t) {
      const s = this.slideLayouts.filter((l) => l._name === t)[0];
      s && (i = s);
    }
    const a = new zo({
      addSlide: this.addNewSlide,
      getSlide: this.getSlide,
      presLayout: this.presLayout,
      setSlideNum: this.setSlideNumber,
      slideId: this.slides.length + 256,
      slideRId: this.slides.length + 2,
      slideNumber: this.slides.length + 1,
      slideLayout: i
    });
    if (this._slides.push(a), r?.sectionTitle) {
      const s = this.sections.filter((l) => l.title === r.sectionTitle)[0];
      s ? s._slides.push(a) : console.warn(`addSlide: unable to find section with title: "${r.sectionTitle}"`);
    } else if (this.sections && this.sections.length > 0 && !r?.sectionTitle) {
      const s = this._sections[this.sections.length - 1];
      s._type === "default" ? s._slides.push(a) : this._sections.push({
        title: `Default-${this.sections.filter((l) => l._type === "default").length + 1}`,
        _type: "default",
        _slides: [a]
      });
    }
    return a;
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
    const i = {
      _margin: t.margin || Xt,
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
    ko(t, i), this.slideLayouts.push(i), (t.background || t.bkgd) && zi(t.background, i), i._slideNumberProps && !this.masterSlide._slideNumberProps && (this.masterSlide._slideNumberProps = i._slideNumberProps);
  }
  // HTML-TO-SLIDES METHODS
  /**
   * Reproduces an HTML table as a PowerPoint table - including column widths, style, etc. - creates 1 or more slides as needed
   * @param {string} eleId - table HTML element ID
   * @param {TableToSlidesProps} options - generation options
   */
  tableToSlides(r, t = {}) {
    Io(this, r, t, t?.masterSlideName ? this.slideLayouts.filter((i) => i._name === t.masterSlideName)[0] : null);
  }
}
const Gi = {
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
}, D = { ...Gi };
function gs(e = {}) {
  const r = { ...e };
  return e.bodyFont !== void 0 && e.FONT === void 0 && (r.FONT = e.bodyFont), e.FONT !== void 0 && e.bodyFont === void 0 && (r.bodyFont = e.FONT), e.bodyFont !== void 0 && e.labelFont === void 0 && (r.labelFont = e.bodyFont), e.headingFont !== void 0 && e.accentFont === void 0 && (r.accentFont = e.headingFont), e.NAVY !== void 0 && e.titleColor === void 0 && (r.titleColor = e.NAVY), e.titleColor !== void 0 && e.NAVY === void 0 && (r.NAVY = e.titleColor), e.GOLD !== void 0 && e.accentColor === void 0 && (r.accentColor = e.GOLD), e.accentColor !== void 0 && e.GOLD === void 0 && (r.GOLD = e.accentColor), e.BODY_TEXT !== void 0 && e.bodyColor === void 0 && (r.bodyColor = e.BODY_TEXT), e.bodyColor !== void 0 && e.BODY_TEXT === void 0 && (r.BODY_TEXT = e.bodyColor), e.MUTED_TEXT !== void 0 && e.mutedColor === void 0 && (r.mutedColor = e.MUTED_TEXT), e.mutedColor !== void 0 && e.MUTED_TEXT === void 0 && (r.MUTED_TEXT = e.mutedColor), Object.assign(D, r), { ...D };
}
function nn() {
  return Object.assign(D, Gi), { ...D };
}
const Ie = D.SLIDE_WIDTH - 2 * D.MARGIN, we = D.MARGIN, Bt = D.MARGIN + D.SECTION_HEADER_HEIGHT + D.SECTION_HEADER_GAP, Le = 6.62, ys = Le - Bt, vs = D.TITLE_HEIGHT + D.DIVIDER_HEIGHT + D.DIVIDER_GAP, bs = D.SUBTITLE_HEIGHT + D.SUBTITLE_GAP;
D.SLIDE_WIDTH / 2;
D.SLIDE_HEIGHT / 2;
const ws = D.SLIDE_WIDTH - D.MARGIN - 0.55, _s = D.SLIDE_HEIGHT - 0.48, Xi = 0.4, yt = 3.95, Ua = Math.max(3, Ie - yt - Xi), $t = we + Ua + Xi;
function xs(e, r) {
  let t = ys;
  return t -= vs, t -= bs, t;
}
const Xe = {
  TITLE_X: we,
  TITLE_Y: 1.55,
  TITLE_W: 6.35,
  TITLE_H: 1.55,
  STRIP_X: 8.24,
  STRIP_Y: 0,
  STRIP_W: D.SLIDE_WIDTH - 8.24,
  STRIP_H: D.SLIDE_HEIGHT
}, Re = {
  TITLE_X: we,
  TITLE_Y: 1.18,
  TITLE_W: 6.8,
  TITLE_H: 0.72,
  LEFT_COL_X: we,
  LEFT_COL_W: 7.25,
  RIGHT_COL_X: 8.72,
  RIGHT_COL_W: 3.9,
  INTRO_H: 0.7,
  TOC_LABEL_Y: 2.05,
  TOC_CARD_Y: 1.9,
  TOC_Y: 2.52,
  TOC_H: 3.55,
  TOC_CARD_H: 4.45
}, je = {
  BAND_X: 8.68,
  BAND_Y: 0,
  BAND_W: D.SLIDE_WIDTH - 8.68,
  BAND_H: D.SLIDE_HEIGHT,
  NUMBER_Y: 1,
  NUMBER_H: 0.85,
  TITLE_Y: 1.55,
  TITLE_H: 1.25
}, da = {
  TEXT_Y: 1.55,
  TEXT_H: 1.45
};
function st(e, r, t = "", i = !1) {
  i || (e.addShape("rect", {
    x: 0,
    y: 0,
    w: D.SLIDE_WIDTH,
    h: 0.94,
    fill: { color: D.NAVY },
    line: { color: D.NAVY, width: 0 }
  }), e.addShape("rect", {
    x: 0,
    y: 0.9,
    w: D.SLIDE_WIDTH,
    h: 0.04,
    fill: { color: D.MID_GRAY },
    line: { color: D.MID_GRAY, width: 0 }
  }));
  const a = D.WHITE, s = D.MUTED_ON_DARK;
  e.addShape("line", {
    x: we,
    y: 0.32,
    w: 0.46,
    h: 0,
    line: { color: a, width: 1.2 }
  }), e.addText(r.toUpperCase(), {
    x: we,
    y: 0.49,
    w: 5.6,
    h: 0.18,
    fontFace: D.labelFont,
    fontSize: D.FONT_SECTION_HEADER,
    bold: !0,
    charSpacing: 1.8,
    color: a,
    margin: 0,
    align: "left",
    valign: "top"
  }), t && e.addText(t.toUpperCase(), {
    x: 8.1,
    y: 0.49,
    w: 4.55,
    h: 0.18,
    fontFace: D.labelFont,
    fontSize: D.FONT_SECTION_HEADER,
    bold: !0,
    charSpacing: 1.2,
    color: s,
    margin: 0,
    align: "right",
    valign: "top",
    fit: "shrink"
  });
}
function lt(e, r, t = !1) {
  t ? e.addShape("line", {
    x: we,
    y: 6.87,
    w: Ie,
    h: 0,
    line: { color: D.DARK_RULE, width: 0.5 }
  }) : (e.addShape("rect", {
    x: 0,
    y: 6.82,
    w: D.SLIDE_WIDTH,
    h: D.SLIDE_HEIGHT - 6.82,
    fill: { color: D.GRAPHITE },
    line: { color: D.GRAPHITE, width: 0 }
  }), e.addShape("rect", {
    x: 0,
    y: 6.82,
    w: D.SLIDE_WIDTH,
    h: 0.035,
    fill: { color: D.MID_GRAY },
    line: { color: D.MID_GRAY, width: 0 }
  }));
  const i = D.MUTED_ON_DARK;
  e.addText(r.toUpperCase(), {
    x: we,
    y: 7.01,
    w: 4.6,
    h: 0.14,
    fontFace: D.labelFont,
    fontSize: D.FONT_SLIDE_NUMBER,
    bold: !0,
    charSpacing: 1.35,
    color: i,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), e.slideNumber = {
    x: ws,
    y: _s,
    w: 0.55,
    h: 0.16,
    fontFace: D.labelFont,
    fontSize: D.FONT_SLIDE_NUMBER,
    bold: !0,
    color: i,
    align: "right",
    margin: 0
  };
}
function Ga(e, r, t, i, a) {
  const s = r + i * 0.53, l = t + a * 0.48;
  [0.82, 0.61, 0.39].forEach((c, n) => {
    const o = i * c, f = Math.min(a * c, o);
    e.addShape("ellipse", {
      x: s - o / 2,
      y: l - f / 2,
      w: o,
      h: f,
      fill: { color: D.GRAPHITE, transparency: 100 },
      line: { color: n === 1 ? D.MID_GRAY : D.DARK_RULE, width: n === 1 ? 1.2 : 0.8, transparency: 18 }
    });
  }), e.addShape("line", {
    x: r + i * 0.12,
    y: l,
    w: i * 0.78,
    h: 0,
    line: { color: D.DARK_RULE, width: 0.8, transparency: 15 }
  }), e.addShape("line", {
    x: s,
    y: t + a * 0.1,
    w: 0,
    h: a * 0.76,
    line: { color: D.DARK_RULE, width: 0.8, transparency: 15 }
  }), e.addShape("ellipse", {
    x: s - 0.16,
    y: l - 0.16,
    w: 0.32,
    h: 0.32,
    fill: { color: D.WHITE },
    line: { color: D.WHITE, transparency: 100 }
  }), e.addShape("ellipse", {
    x: r + i * 0.19,
    y: t + a * 0.22,
    w: 0.16,
    h: 0.16,
    fill: { color: D.MID_GRAY },
    line: { color: D.MID_GRAY, transparency: 100 }
  }), e.addShape("ellipse", {
    x: r + i * 0.76,
    y: t + a * 0.69,
    w: 0.12,
    h: 0.12,
    fill: { color: D.MUTED_ON_DARK },
    line: { color: D.MUTED_ON_DARK, transparency: 100 }
  });
}
function Qt(e) {
  return e == null ? [] : typeof e == "string" ? e ? [{ text: e, emphasis: "none" }] : [] : e.filter((r) => r.text.length > 0).map((r) => ({ text: r.text, emphasis: r.emphasis ?? "none" }));
}
function be(e) {
  return Qt(e).map((r) => r.text).join("");
}
function Xa(e) {
  return typeof e == "string" ? e : e.text;
}
function Jr(e) {
  return typeof e == "string" ? 0 : e.level ?? 0;
}
function Hi(e) {
  switch (e) {
    case "bold":
      return { bold: !0 };
    case "italic":
      return { italic: !0 };
    case "accent":
      return { color: D.accentColor };
    case "highlight":
      return { highlight: D.highlightColor };
    default:
      return {};
  }
}
function Be(e) {
  return Qt(e).map((r) => ({ text: r.text, options: Hi(r.emphasis) }));
}
function Sa(e, r, t = 1) {
  const i = [];
  return e.forEach((a, s) => {
    const l = Qt(Xa(a)), A = Math.max(0, Jr(a)), c = typeof a != "string" && a.__continued === !0, n = e.slice(0, s).filter(
      (f) => !(typeof f != "string" && f.__continued === !0)
    ).length, o = l.length ? l : [{ text: " ", emphasis: "none" }];
    o.forEach((f, g) => {
      const d = {
        ...Hi(f.emphasis),
        breakLine: s < e.length - 1 && g === o.length - 1,
        indentLevel: g === 0 ? A : void 0
      };
      if (g === 0) {
        const h = 18 + A * 16;
        c ? d.bullet = { characterCode: "200B", indent: h } : r === "bullet" ? d.bullet = { characterCode: "2022", indent: h } : d.bullet = {
          type: "number",
          numberType: "arabicPeriod",
          numberStartAt: t + n,
          indent: h
        };
      }
      i.push({ text: f.text, options: d });
    });
  }), i;
}
function Cs(e, r, t = Number.POSITIVE_INFINITY) {
  const i = Math.max(r, t);
  let a = 0;
  const s = [];
  for (const l of Qt(e)) {
    const A = a, c = a + l.text.length;
    if (a = c, c <= r || A >= i) continue;
    const n = Math.max(0, r - A), o = Math.min(l.text.length, i - A), f = l.text.slice(n, o);
    f && s.push({ text: f, ...l.emphasis !== "none" ? { emphasis: l.emphasis } : {} });
  }
  return typeof e == "string" ? s.map((l) => l.text).join("") : s;
}
function Ts(e, r, t) {
  if (t >= e.length) return e.length;
  const i = Math.max(r + 1, r + Math.floor((t - r) * 0.55)), a = [`

`, ". ", "! ", "? ", "; ", ", ", " ", `
`];
  for (const s of a) {
    const l = e.lastIndexOf(s, t);
    if (l >= i) return l + s.length;
  }
  return t;
}
function Ha(e, r) {
  const t = be(e);
  if (!t || t.length <= r) return [e];
  const i = Math.max(1, Math.floor(r)), a = [];
  let s = 0;
  for (; s < t.length; ) {
    const l = Ts(t, s, Math.min(t.length, s + i));
    a.push(Cs(e, s, l)), s = l;
  }
  return a;
}
function qe(e, r, t) {
  const i = 8.5 * (13 / t), a = Math.max(1, Math.floor(r * i)), s = Math.max(1, Math.ceil(be(e).length / a)), l = t / 72 * D.LINE_SPACING * 1.2;
  return s * l;
}
function Es(e) {
  return e === "note" ? D.CALLOUT_NOTE_BORDER : e === "warning" ? D.CALLOUT_WARNING_BORDER : D.CALLOUT_INFO_BORDER;
}
function Ls(e) {
  return e === "note" ? D.CALLOUT_NOTE_LABEL : e === "warning" ? D.CALLOUT_WARNING_LABEL : D.CALLOUT_INFO_LABEL;
}
function Ds(e) {
  return e === "note" ? "NOTE" : e === "warning" ? "WARNING" : "INFO";
}
function Ht(e) {
  return e.type === "image" ? e.preferredAspect === "full" : e.type === "table" ? e.headers.length > D.TABLE_LARGE_THRESHOLD : e.type === "diagram" ? e.diagramRows.reduce((t, i) => t + i.length, 0) > D.DIAGRAM_LARGE_THRESHOLD : !1;
}
function Wr(e, r, t = Ie) {
  const i = Jr(e), a = Math.max(1, t - 0.2 - i * 0.25);
  return Math.max(
    r === D.FONT_NUMBERED ? D.H_NUMBERED_ITEM : D.H_BULLET_ITEM,
    qe(Xa(e), a, r) + 0.04
  );
}
function Wa(e, r = Ie) {
  const t = D.BLOCK_GAP;
  switch (e.type) {
    case "title": {
      const i = Math.max(0.48, qe(e.text, r, D.FONT_SLIDE_TITLE)), a = e.definition ? Math.max(0.3, qe(e.definition, r, D.FONT_CALLOUT_TEXT)) : 0;
      return i + 3 / 96 + 0.1 + a + 0.14 + t;
    }
    case "subtitle": {
      const i = Math.max(D.H_SUBTITLE_BLOCK, qe(e.text, r, D.FONT_SUBTITLE_BLOCK)), a = e.definition ? Math.max(0.3, qe(e.definition, r, D.FONT_CALLOUT_TEXT)) : 0;
      return i + 0.05 + a + t;
    }
    case "paragraph":
      return Math.max(0.3, qe(e.text, r, D.FONT_PARAGRAPH) + 0.08) + t;
    case "bullets":
      return e.items.reduce((i, a) => i + Wr(a, D.FONT_BULLET, r), 0) + 0.08 + t;
    case "numbered":
      return e.items.reduce((i, a) => i + Wr(a, D.FONT_NUMBERED, r), 0) + 0.08 + t;
    case "callout":
      return Math.max(
        D.H_CALLOUT_MIN,
        qe(e.text, Math.max(1, r - 0.3), D.FONT_CALLOUT_TEXT) + 0.36
      ) + t;
    case "table":
      return D.H_TABLE_LABEL + 0.04 + D.H_TABLE_HEADER_ROW + e.rows.length * D.H_TABLE_BODY_ROW + t;
    case "diagram":
      return D.H_DIAGRAM_LABEL + 0.06 + e.diagramRows.length * D.DIAGRAM_NODE_HEIGHT + Math.max(0, e.diagramRows.length - 1) * D.DIAGRAM_ROW_V_GAP + t;
    case "image":
      return 0;
  }
}
const Rs = 0.85;
function Bs() {
  return Math.max(0.5, xs() - 0.55) * Rs;
}
function on(e) {
  return e.reduce((r, t) => r + (Ht(t) ? 0 : Wa(t)), 0);
}
function Ps(e) {
  if (e.slideTitle.trim())
    return {
      blockId: `${e.slideId}--title`,
      type: "title",
      text: e.slideTitle,
      ...e.titleDefinition ? { definition: e.titleDefinition } : {},
      sourceReferences: [...e.sourceReferences]
    };
}
function Ns(e) {
  if (be(e.slideSubtitle).trim())
    return {
      blockId: `${e.slideId}--subtitle`,
      type: "subtitle",
      text: e.slideSubtitle,
      ...e.subtitleDefinition ? { definition: e.subtitleDefinition } : {},
      sourceReferences: [...e.sourceReferences]
    };
}
function Wi(e) {
  const r = Bs(), t = [];
  let i, a = 0;
  for (const s of e) {
    if (i) {
      const l = Ps(s), A = Ns(s), c = [l, A, ...s.blocks].filter(
        (d) => !!d
      ), n = on(c), o = i.blocks.filter(
        (d) => d.type === "image" && !Ht(d)
      ).length, f = c.filter(
        (d) => d.type === "image" && !Ht(d)
      ).length;
      if (!(o > 0 && f > 0) && a + n <= r) {
        i.blocks.push(...c), i.sourceReferences = [.../* @__PURE__ */ new Set([...i.sourceReferences, ...s.sourceReferences])], a += n;
        continue;
      }
    }
    i && t.push(i), i = { ...s, blocks: [...s.blocks], sourceReferences: [...s.sourceReferences] }, a = on(i.blocks);
  }
  return i && t.push(i), t;
}
function Is(e, r) {
  const t = [], i = new Set(e.flatMap((n) => n.blocks.map((o) => o.blockId))), a = new Set(r.flatMap((n) => n.blocks.map((o) => o.blockId)));
  for (const n of i)
    a.has(n) || t.push(`Block "${n}" was lost during compaction.`);
  const s = new Set(e.flatMap((n) => [
    ...n.sourceReferences,
    ...n.blocks.flatMap((o) => o.sourceReferences)
  ])), l = new Set(r.flatMap((n) => [
    ...n.sourceReferences,
    ...n.blocks.flatMap((o) => o.sourceReferences)
  ]));
  for (const n of s)
    l.has(n) || t.push(`Source reference "${n}" was lost during compaction.`);
  const A = e.map((n) => n.slideTitle.trim()).filter(Boolean), c = r.flatMap((n) => [
    n.slideTitle,
    n.titleDefinition ? be(n.titleDefinition) : "",
    be(n.slideSubtitle),
    n.subtitleDefinition ? be(n.subtitleDefinition) : "",
    ...n.blocks.flatMap((o) => [
      "text" in o ? be(o.text) : "",
      "definition" in o && o.definition ? be(o.definition) : ""
    ])
  ]).join(` 
 `);
  for (const n of A)
    c.includes(n) || t.push(`Slide title "${n}" was lost during compaction.`);
  return t;
}
function Fe(e, r, t, i, a, s = 0.04) {
  const l = qe(e, r, t) + s;
  return Math.max(i, Math.min(a, l));
}
const Ss = 3 / 96;
function jt(e, r, t = Ss) {
  return e + r + t;
}
class Ut extends Error {
  violations;
  constructor(r) {
    super(`Slide render plan is invalid:
${r.map((t) => `- ${t}`).join(`
`)}`), this.name = "SlideRenderPlanError", this.violations = r;
  }
}
function qr(e) {
  return e.x + e.w;
}
function Me(e) {
  return e.y + e.h;
}
function ks(e, r, t = 1e-3) {
  return e.x < qr(r) - t && qr(e) > r.x + t && e.y < Me(r) - t && Me(e) > r.y + t;
}
function Fs(e, r, t, i = D.SLIDE_HEIGHT) {
  if (![e.x, e.y, e.w, e.h].every(Number.isFinite)) {
    t.push(`${r} contains a non-finite coordinate.`);
    return;
  }
  (e.w < 0 || e.h < 0) && t.push(`${r} has a negative size.`), e.x < -1e-3 && t.push(`${r} crosses the left slide edge.`), e.y < -1e-3 && t.push(`${r} crosses the top slide edge.`), qr(e) > D.SLIDE_WIDTH + 1e-3 && t.push(`${r} right=${qr(e).toFixed(3)} exceeds slide width ${D.SLIDE_WIDTH}.`), Me(e) > i + 1e-3 && t.push(`${r} bottom=${Me(e).toFixed(3)} exceeds safe bottom ${i}.`);
}
function Ms(e) {
  const r = [
    { label: "content bounds", box: e.contentBounds, safeBottom: Le }
  ];
  return e.title && r.push({ label: "title", box: e.title.box, safeBottom: Le }), e.titleRule && r.push({ label: "title rule", box: e.titleRule.box, safeBottom: Le }), e.titleDefinition && r.push({ label: "title definition", box: e.titleDefinition.box, safeBottom: Le }), e.subtitle && r.push({ label: "subtitle", box: e.subtitle.box, safeBottom: Le }), e.subtitleDefinition && r.push({ label: "subtitle definition", box: e.subtitleDefinition.box, safeBottom: Le }), e.blocks.forEach((t, i) => {
    r.push({
      label: `block ${i + 1} (${t.block.type}:${t.block.blockId})`,
      box: t.box,
      safeBottom: Le
    }), t.textBox && r.push({ label: `block ${i + 1} text`, box: t.textBox, safeBottom: Le }), t.ruleBox && r.push({ label: `block ${i + 1} rule`, box: t.ruleBox, safeBottom: Le }), t.definitionBox && r.push({ label: `block ${i + 1} definition`, box: t.definitionBox, safeBottom: Le });
  }), e.companion && r.push({
    label: `companion (${e.companion.block.type}:${e.companion.block.blockId})`,
    box: e.companion.box,
    safeBottom: Le
  }), e.image && (r.push({ label: `image (${e.image.block.slotId})`, box: e.image.box, safeBottom: Le }), e.image.label && r.push({ label: "image label", box: e.image.label.box, safeBottom: Le }), e.image.description && r.push({ label: "image description", box: e.image.description.box, safeBottom: Le }), e.image.source && r.push({ label: "image source", box: e.image.source.box, safeBottom: Le })), e.imageCompanionLabel && r.push({
    label: "image companion label",
    box: e.imageCompanionLabel.box,
    safeBottom: Le
  }), e.imageCompanionDescription && r.push({
    label: "image companion description",
    box: e.imageCompanionDescription.box,
    safeBottom: Le
  }), r;
}
function Os(e) {
  const r = [];
  for (const t of Ms(e)) Fs(t.box, t.label, r, t.safeBottom);
  for (let t = 1; t < e.blocks.length; t += 1) {
    const i = e.blocks[t - 1].box;
    e.blocks[t].box.y + 1e-3 < Me(i) && r.push(`Content blocks ${t} and ${t + 1} overlap or are out of order.`);
  }
  if (e.layout === "text-companion") {
    const t = e.image?.box ?? e.companion?.box;
    if (t)
      for (const i of e.blocks)
        ks(i.box, t) && r.push(`Block ${i.block.blockId} overlaps the companion column.`);
  }
  return (e.utilization < 0.599 || e.utilization > 1.001) && r.push(`Content utilization ${e.utilization.toFixed(3)} is outside the required 0.60–1.00 range.`), r;
}
function $s(e) {
  const r = Os(e);
  if (r.length > 0) throw new Ut(r);
}
const qi = 0.1, Vi = 0.14, Qi = 0.05, zs = 0.6;
function rt(e, r, t) {
  return { role: e, text: r, box: t };
}
function Gt(e) {
  return !!(e && be(e).trim());
}
function ji(e, r) {
  const t = e.isFirstPage && !!e.slideTitle.trim(), i = t && Gt(e.titleDefinition), a = e.isFirstPage && Gt(e.slideSubtitle), s = a && Gt(e.subtitleDefinition), l = Bt, A = Math.min(Ie, 8.8), c = t ? Fe(
    e.slideTitle,
    A,
    D.FONT_SLIDE_TITLE,
    D.TITLE_HEIGHT,
    1.5,
    0.05
  ) : 0, n = t ? jt(l, c) : l, o = t ? n + qi : l, f = i ? Fe(
    e.titleDefinition,
    Math.min(r, 9.4),
    D.FONT_CALLOUT_TEXT,
    0.32,
    0.85,
    0.02
  ) : 0, g = t ? o + f + Vi : l, d = g, h = a ? Fe(
    e.slideSubtitle,
    Math.min(r, 8.8),
    D.FONT_SLIDE_SUBTITLE,
    D.SUBTITLE_HEIGHT,
    0.78,
    0.03
  ) : 0, u = d + h + Qi, y = s ? Fe(
    e.subtitleDefinition,
    Math.min(r, 9.4),
    D.FONT_CALLOUT_TEXT,
    0.3,
    0.78,
    0.02
  ) : 0, m = a ? u + y + D.SUBTITLE_GAP : g;
  return {
    hasTitle: t,
    hasTitleDefinition: i,
    hasSubtitle: a,
    hasSubtitleDefinition: s,
    titleY: l,
    titleWidth: A,
    titleHeight: c,
    titleRuleY: n,
    titleDefinitionY: o,
    titleDefinitionHeight: f,
    subtitleY: d,
    subtitleHeight: h,
    subtitleDefinitionY: u,
    subtitleDefinitionHeight: y,
    contentStartY: m
  };
}
function Us(e) {
  switch (e.type) {
    case "image":
      return 0;
    case "table":
      return 1;
    case "bullets":
    case "numbered":
      return 2;
    case "callout":
      return 3;
    default:
      return Number.POSITIVE_INFINITY;
  }
}
function Yi(e) {
  let r, t = Number.POSITIVE_INFINITY;
  for (const i of e) {
    const a = Us(i);
    a < t && (r = i, t = a);
  }
  return r;
}
function Gs(e, r, t, i) {
  switch (e.type) {
    case "title":
    case "subtitle":
    case "paragraph":
    case "bullets":
    case "numbered":
    case "callout":
    case "table":
    case "diagram":
      return { x: we, y: r, w: t, h: i };
    case "image":
      throw new Error("Image blocks are planned in the companion column, not the vertical text flow.");
  }
}
function Xs(e, r, t) {
  if (e.type === "title") {
    const A = Fe(
      e.text,
      t,
      D.FONT_SLIDE_TITLE,
      0.48,
      1.25,
      0.04
    ), c = jt(r, A), n = c + qi, o = Gt(e.definition) ? Fe(e.definition, t, D.FONT_CALLOUT_TEXT, 0.3, 0.82, 0.02) : 0, f = n + o + Vi - r;
    return {
      block: e,
      box: { x: we, y: r, w: t, h: f },
      textBox: { x: we, y: r, w: t, h: A },
      ruleBox: { x: we, y: c, w: 1.12, h: 0 },
      ...o > 0 ? { definitionBox: { x: we, y: n, w: t, h: o } } : {}
    };
  }
  const i = Fe(
    e.text,
    t,
    D.FONT_SUBTITLE_BLOCK,
    D.H_SUBTITLE_BLOCK,
    0.82,
    0.03
  ), a = r + i + Qi, s = Gt(e.definition) ? Fe(e.definition, t, D.FONT_CALLOUT_TEXT, 0.3, 0.78, 0.02) : 0, l = a + s + D.BLOCK_GAP - r;
  return {
    block: e,
    box: { x: we, y: r, w: t, h: l },
    textBox: { x: we, y: r, w: t, h: i },
    ...s > 0 ? { definitionBox: { x: we, y: a, w: t, h: s } } : {}
  };
}
function Hs(e, r, t) {
  if (e.type === "title" || e.type === "subtitle")
    return Xs(e, r, t);
  const i = Math.max(0.1, Wa(e, t) - D.BLOCK_GAP);
  return { block: e, box: Gs(e, r, t, i) };
}
function Ws(e, r, t) {
  const i = be(e.label).trim(), a = be(e.description).trim(), s = e.sourceReference.trim(), l = t && i ? 0.34 : 0, A = t && a ? 0.48 : 0, c = s ? 0.2 : 0, n = !!(l || A || c), o = l + A + c + (n ? 0.16 : 0), f = Math.max(1.2, Le - r - o), g = {
    block: e,
    box: { x: $t, y: r, w: yt, h: f }
  };
  let d = r + f + 0.08;
  return l && (g.label = rt("image-label", e.label, {
    x: $t,
    y: d,
    w: yt,
    h: l
  }), d += l), A && (g.description = rt("image-description", e.description, {
    x: $t,
    y: d,
    w: yt,
    h: A
  }), d += A), c && (g.source = rt("image-source", `Source: ${s}`, {
    x: $t,
    y: d,
    w: yt,
    h: c
  })), g;
}
function Vr(e) {
  const r = [e.contentBounds.y];
  for (const t of e.blocks) r.push(Me(t.box));
  return e.companion && r.push(Me(e.companion.box)), e.image && (r.push(Me(e.image.box)), e.image.label && r.push(Me(e.image.label.box)), e.image.description && r.push(Me(e.image.description.box)), e.image.source && r.push(Me(e.image.source.box))), e.imageCompanionLabel && r.push(Me(e.imageCompanionLabel.box)), e.imageCompanionDescription && r.push(Me(e.imageCompanionDescription.box)), Math.max(...r);
}
function qs(e) {
  const r = e.contentBounds.y + e.contentBounds.h * zs;
  let t = Vr(e), i = r - t;
  if (!(i <= 1e-3)) {
    if (e.blocks.length >= 2) {
      const a = i / (e.blocks.length - 1);
      e.blocks.forEach((s, l) => {
        if (l === 0) return;
        const A = a * l;
        s.box.y += A, s.textBox && (s.textBox.y += A), s.ruleBox && (s.ruleBox.y += A), s.definitionBox && (s.definitionBox.y += A);
      });
    } else e.blocks.length === 1 ? e.blocks[0].box.h += i : e.companion ? e.companion.box.h += i : e.imageCompanionDescription && (e.imageCompanionDescription.box.h += i);
    t = Vr(e), i = r - t, !(i <= 1e-3) && (e.blocks.length > 0 ? e.blocks[e.blocks.length - 1].box.h += i : e.companion ? e.companion.box.h += i : e.imageCompanionDescription && (e.imageCompanionDescription.box.h += i));
  }
}
function Ki(e, r) {
  const t = Yi(e), i = t?.type === "image" ? t : void 0, a = t && t.type !== "image" ? t : void 0, s = t ? e.filter((h) => h !== t) : [...e], l = !!t, A = l ? Ua : Ie, c = ji(r, A), n = c.contentStartY, o = {
    kind: "content",
    sourceSlideId: r.sourceSlideId,
    pageIndex: r.pageIndex,
    sectionTitle: r.sectionTitle,
    isFirstPage: r.isFirstPage,
    layout: l ? "text-companion" : "text",
    contentBounds: {
      x: we,
      y: n,
      w: Ie,
      h: Le - n
    },
    blocks: [],
    naturalUtilization: 0,
    utilization: 0
  };
  if (c.hasTitle && (o.title = rt("title", r.slideTitle, {
    x: we,
    y: c.titleY,
    w: c.titleWidth,
    h: c.titleHeight
  }), o.titleRule = {
    role: "title-rule",
    box: { x: we, y: c.titleRuleY, w: 1.12, h: 0 }
  }), c.hasTitleDefinition && (o.titleDefinition = rt("title-definition", r.titleDefinition, {
    x: we,
    y: c.titleDefinitionY,
    w: Math.min(A, 9.4),
    h: c.titleDefinitionHeight
  })), c.hasSubtitle && (o.subtitle = rt("subtitle", r.slideSubtitle, {
    x: we,
    y: c.subtitleY,
    w: Math.min(A, 8.8),
    h: c.subtitleHeight
  })), c.hasSubtitleDefinition && (o.subtitleDefinition = rt("subtitle-definition", r.subtitleDefinition, {
    x: we,
    y: c.subtitleDefinitionY,
    w: Math.min(A, 9.4),
    h: c.subtitleDefinitionHeight
  })), i)
    o.image = Ws(i, n, s.length > 0);
  else if (a) {
    const h = Math.max(
      0.5,
      Wa(a, yt) - D.BLOCK_GAP
    );
    o.companion = {
      block: a,
      box: { x: $t, y: n, w: yt, h }
    };
  }
  let f = n;
  if (i && s.length === 0) {
    const h = be(i.label).trim(), u = be(i.description).trim();
    h && (o.imageCompanionLabel = rt("image-companion-label", i.label, {
      x: we,
      y: f,
      w: A,
      h: 0.72
    }), f += 0.9), u && (o.imageCompanionDescription = rt("image-companion-description", i.description, {
      x: we,
      y: f,
      w: A,
      h: 1.5
    }));
  }
  for (const h of s) {
    const u = Hs(h, f, A);
    o.blocks.push(u), f = Me(u.box) + D.BLOCK_GAP;
  }
  const g = Vr(o);
  o.naturalUtilization = Math.max(0, (g - n) / Math.max(0.01, o.contentBounds.h)), qs(o);
  const d = Vr(o);
  return o.utilization = Math.max(0, (d - n) / Math.max(0.01, o.contentBounds.h)), $s(o), o;
}
function Vs(e, r = D.DIAGRAM_MAX_NODES_PER_ROW) {
  const t = Math.max(1, Math.floor(r)), i = [];
  for (const a of e)
    for (let s = 0; s < a.length; s += t)
      i.push(a.slice(s, s + t));
  return i;
}
function Qs(e, r, t) {
  if (r === 0) return e.label;
  const i = ` (continued ${r + 1}/${t})`;
  return typeof e.label == "string" ? `${e.label}${i}` : [...e.label, { text: i, emphasis: "italic" }];
}
function js(e, r) {
  const t = {
    x: we,
    y: Bt,
    w: Math.min(Ie, 9.5),
    h: 0.54
  }, i = Bt + 0.72, a = Le - i, s = D.DIAGRAM_NODE_HEIGHT + D.DIAGRAM_ROW_V_GAP, l = Math.max(
    1,
    Math.floor((a + D.DIAGRAM_ROW_V_GAP) / s)
  ), A = Vs(e.diagramRows), c = [];
  A.length === 0 && c.push([]);
  for (let n = 0; n < A.length; n += l)
    c.push(A.slice(n, n + l));
  return c.map((n, o) => {
    const f = [], g = [];
    let d = i;
    return n.forEach((h, u) => {
      if (!h.length) return;
      const y = Math.min(
        D.DIAGRAM_NODE_WIDTH,
        Math.max(0.82, (Ie - (h.length - 1) * D.DIAGRAM_NODE_H_GAP) / h.length)
      ), m = h.length * y + (h.length - 1) * D.DIAGRAM_NODE_H_GAP, p = we + Math.max(0, (Ie - m) / 2);
      h.forEach((_, T) => {
        const v = p + T * (y + D.DIAGRAM_NODE_H_GAP);
        f.push({
          text: _,
          box: { x: v, y: d, w: y, h: D.DIAGRAM_NODE_HEIGHT },
          emphasized: T === h.length - 1 && u === n.length - 1
        }), T < h.length - 1 && g.push({
          orientation: "horizontal",
          box: {
            x: v + y + 0.04,
            y: d + D.DIAGRAM_NODE_HEIGHT / 2,
            w: D.DIAGRAM_NODE_H_GAP - 0.08,
            h: 0
          }
        });
      }), d += D.DIAGRAM_NODE_HEIGHT, u < n.length - 1 && (g.push({
        orientation: "vertical",
        box: {
          x: we + Ie / 2,
          y: d + 0.04,
          w: 0,
          h: D.DIAGRAM_ROW_V_GAP - 0.08
        }
      }), d += D.DIAGRAM_ROW_V_GAP);
    }), {
      kind: "dedicated-diagram",
      sectionTitle: r,
      pageIndex: o,
      pageCount: c.length,
      block: e,
      label: Qs(e, o, c.length),
      labelBox: t,
      nodes: f,
      connectors: g
    };
  });
}
function Ys(e, r) {
  const t = { x: 0.68, y: 1.55, w: 6.15, h: 4.72 }, i = { x: 7.32, y: 1.62, w: 4.7 }, a = i.y + 0.45, s = Fe(e.label, i.w, 23, 0.72, 1.42, 0.04), l = jt(a, s), A = l + 0.14, c = !!be(e.description).trim(), n = c ? Fe(e.description, i.w, 15, 0.5, 1.42, 0.03) : 0, o = Math.max(i.y + 3.72, A + n + 0.22), f = Math.min(i.y + 4.25, o + 0.34);
  return {
    kind: "dedicated-image",
    sectionTitle: r,
    block: e,
    frameBox: t,
    imageBox: {
      x: t.x + 0.22,
      y: t.y + 0.22,
      w: t.w - 0.44,
      h: t.h - 0.44
    },
    eyebrowBox: { x: i.x, y: i.y, w: i.w, h: 0.18 },
    labelBox: { x: i.x, y: a, w: i.w, h: s },
    titleRuleBox: { x: i.x, y: l, w: 1.05, h: 0 },
    descriptionBox: c ? { x: i.x, y: A, w: i.w, h: n } : void 0,
    fitLabelBox: { x: i.x, y: o, w: i.w, h: 0.18 },
    sourceBox: e.sourceReference ? { x: i.x, y: f, w: i.w, h: 0.22 } : void 0
  };
}
function Ks(e, r, t) {
  if (r === 0) return e.label;
  const i = ` (continued ${r + 1}/${t})`;
  return typeof e.label == "string" ? `${e.label}${i}` : [...e.label, { text: i, emphasis: "italic" }];
}
function Js(e, r, t, i) {
  const a = Math.max(0.35, r - 0.18);
  return Math.max(i, qe(e, a, t) + 0.14);
}
function sn(e, r, t, i) {
  return e.reduce(
    (a, s, l) => Math.max(a, Js(s, r[l] ?? r[0], t, i)),
    i
  );
}
function Zs(e, r) {
  const t = {
    x: we,
    y: Bt,
    w: Math.min(Ie, 9.5),
    h: D.H_TABLE_LABEL + 0.25
  }, i = Bt + 0.62, a = Le - i, s = Math.max(
    D.FONT_MIN_TABLE,
    e.headers.length > 6 ? D.FONT_TABLE_BODY - 1 : D.FONT_TABLE_BODY
  ), l = Array(Math.max(1, e.headers.length)).fill(
    Ie / Math.max(1, e.headers.length)
  ), A = sn(
    e.headers,
    l,
    s,
    D.H_TABLE_HEADER_ROW
  ), c = e.rows.map((d) => sn(
    d,
    l,
    s,
    D.H_TABLE_BODY_ROW
  )), n = [];
  let o = 0;
  for (; o < e.rows.length || e.rows.length === 0 && n.length === 0; ) {
    let d = A, h = o;
    const u = [];
    for (; h < e.rows.length; ) {
      const y = Math.max(0.25, a - d), m = c[h], p = Math.min(m, Math.max(D.H_TABLE_BODY_ROW, y));
      if (u.length > 0 && d + m > a + 1e-3 || (u.push(p), d += p, h += 1, d >= a - 1e-3)) break;
    }
    if (e.rows.length === 0) {
      n.push({ start: 0, end: 0, heights: [] });
      break;
    }
    h === o && (u.push(Math.max(D.H_TABLE_BODY_ROW, a - A)), h += 1), n.push({ start: o, end: h, heights: u }), o = h;
  }
  const f = n.length, g = e.__rowOffset ?? 0;
  return n.map((d, h) => {
    const u = e.rows.slice(d.start, d.end), y = A + d.heights.reduce((m, p) => m + p, 0);
    return {
      kind: "dedicated-table",
      sectionTitle: r,
      pageIndex: h,
      pageCount: f,
      block: e,
      label: Ks(e, h, f),
      labelBox: t,
      tableBox: { x: we, y: i, w: Ie, h: y },
      rows: u,
      rowOffset: g + d.start,
      headerHeight: A,
      rowHeights: d.heights,
      colWidths: l,
      fontSize: s
    };
  });
}
function Ji(e, r, t, i) {
  switch (e.type) {
    case "paragraph":
      return el(e, r, t, i);
    case "bullets":
    case "numbered":
      return rl(e, r, t, i);
    case "callout":
      return tl(e, r, t, i);
    case "table":
      return nl(e, r, t);
    default:
      return { head: e };
  }
}
function el(e, r, t, i) {
  const a = Math.max(0.2, r - D.BLOCK_GAP - 0.08), s = qe(e.text, i, D.FONT_PARAGRAPH), l = be(e.text).length, A = Math.max(
    24,
    Math.floor(l * Math.min(0.9, a / Math.max(s, 0.01)))
  ), [c, ...n] = Ha(e.text, A);
  return n.length === 0 ? { head: e } : {
    head: { ...e, text: c },
    tail: {
      ...e,
      blockId: Wt(e.blockId, t),
      text: eo(n)
    }
  };
}
function tl(e, r, t, i) {
  const a = Math.max(0.2, r - D.BLOCK_GAP - 0.36), s = qe(
    e.text,
    Math.max(1, i - 0.3),
    D.FONT_CALLOUT_TEXT
  ), l = be(e.text).length, A = Math.max(
    24,
    Math.floor(l * Math.min(0.9, a / Math.max(s, 0.01)))
  ), [c, ...n] = Ha(e.text, A);
  return n.length === 0 ? { head: e } : {
    head: { ...e, text: c },
    tail: {
      ...e,
      blockId: Wt(e.blockId, t),
      label: Zi(e.label, " (continued)"),
      text: eo(n)
    }
  };
}
function rl(e, r, t, i) {
  const a = e.type === "bullets" ? D.FONT_BULLET : D.FONT_NUMBERED, s = Math.max(0.15, r - D.BLOCK_GAP - 0.08), l = al(e.items, s, a, i), A = [];
  let c = 0;
  for (const o of l) {
    const f = Wr(o, a, i);
    if (A.length > 0 && c + f > s) break;
    A.push(o), c += f;
  }
  if (A.length === l.length) return { head: { ...e, items: l } };
  const n = l.slice(A.length);
  if (e.type === "numbered") {
    const o = e.startAt ?? 1, f = A.filter((g) => !il(g)).length;
    return {
      head: { ...e, items: A, startAt: o },
      tail: {
        ...e,
        blockId: Wt(e.blockId, t),
        items: n,
        startAt: o + f
      }
    };
  }
  return {
    head: { ...e, items: A },
    tail: {
      ...e,
      blockId: Wt(e.blockId, t),
      items: n
    }
  };
}
function al(e, r, t, i) {
  const a = [];
  for (const s of e) {
    const l = Wr(s, t, i);
    if (l <= r) {
      a.push(s);
      continue;
    }
    const A = Xa(s), c = be(A).length, n = Math.max(
      20,
      Math.floor(c * Math.min(0.85, r / Math.max(l, 0.01)))
    ), o = Ha(A, n), f = Jr(s);
    o.forEach((g, d) => {
      d === 0 && typeof s == "string" && f === 0 ? a.push(g) : a.push({
        text: g,
        level: f,
        ...d > 0 ? { __continued: !0 } : {}
      });
    });
  }
  return a;
}
function nl(e, r, t) {
  const i = D.H_TABLE_LABEL + 0.04 + D.H_TABLE_HEADER_ROW + D.BLOCK_GAP, a = Math.max(1, Math.floor((r - i) / D.H_TABLE_BODY_ROW));
  if (e.rows.length <= a) return { head: e };
  const s = e.rows.slice(0, a), l = e.rows.slice(a), A = e, c = A.__continued === !0, n = A.__rowOffset ?? 0;
  return {
    head: { ...e, rows: s, __rowOffset: n },
    tail: {
      ...e,
      blockId: Wt(e.blockId, t),
      label: c ? e.label : Zi(e.label, " (continued)"),
      rows: l,
      __continued: !0,
      __rowOffset: n + s.length
    }
  };
}
function Wt(e, r) {
  return `${e}--continuation-${r}`;
}
function Zi(e, r) {
  return typeof e == "string" ? `${e}${r}` : [...e, { text: r, emphasis: "italic" }];
}
function eo(e) {
  const r = e.flatMap(
    (t) => typeof t == "string" ? [{ text: t, emphasis: "none" }] : t
  );
  return r.length === 1 && r[0].emphasis === "none" ? r[0].text : r;
}
function il(e) {
  return typeof e != "string" && e.__continued === !0;
}
function qa(e, r, t) {
  const i = t === 0;
  return {
    sourceSlideId: e.slideId,
    pageIndex: t,
    slideTitle: i ? e.slideTitle : "",
    titleDefinition: i ? e.titleDefinition : void 0,
    slideSubtitle: i ? e.slideSubtitle : "",
    subtitleDefinition: i ? e.subtitleDefinition : void 0,
    isFirstPage: i,
    sectionTitle: r
  };
}
function qt(e, r, t, i) {
  try {
    return Ki(i, qa(e, r, t));
  } catch (a) {
    if (a instanceof Ut) return;
    throw a;
  }
}
function to(e, r, t, i) {
  const a = ji(
    qa(e, r, t),
    i
  );
  return Math.max(0.25, Le - a.contentStartY);
}
function ro(e) {
  return e.some((r) => r.type === "image");
}
function ol(e) {
  return e.length === 1 && e[0].type === "image";
}
function ln(e) {
  return e.contentBounds.h * e.naturalUtilization;
}
function sl(e, r, t, i, a, s, l) {
  const A = to(e, r, t, l), c = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.2];
  for (const n of c) {
    const o = Ji(
      a,
      Math.max(0.32, A * n),
      s,
      l
    );
    if (qt(e, r, t, [...i, o.head]))
      return o;
  }
}
function ll(e, r, t, i, a, s) {
  if (i.length === 0 || ro(i)) return;
  const l = i.slice(0, -1), A = i[i.length - 1];
  if (!["paragraph", "bullets", "numbered", "callout", "table"].includes(A.type))
    return;
  const c = to(e, r, t, Ie), n = [0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.24];
  let o;
  for (const f of n) {
    const g = Ji(
      A,
      Math.max(0.35, c * f),
      s,
      Ie
    );
    if (!g.tail) continue;
    const d = [...l, g.head], h = qt(e, r, t, d), u = qt(e, r, t + 1, [g.tail, a]);
    if (!h || !u) continue;
    const y = ln(h), m = ln(u);
    if (y < 0.8 || m < 0.75) continue;
    const p = Math.min(y, m) + m * 0.2;
    (!o || p > o.score) && (o = { currentBlocks: d, tail: g.tail, score: p });
  }
  return o ? { currentBlocks: o.currentBlocks, tail: o.tail } : void 0;
}
function ao(e, r) {
  const t = [], i = [...e.blocks];
  let a = 0, s = 1;
  for (; i.length > 0; ) {
    if (Ht(i[0])) {
      const A = i.shift();
      A.type === "image" ? t.push({ type: "image", plan: Ys(A, r) }) : A.type === "table" ? t.push(...Zs(A, r).map((c) => ({
        type: "dedicated-table",
        plan: c
      }))) : A.type === "diagram" && t.push(...js(A, r).map((c) => ({
        type: "dedicated-diagram",
        plan: c
      })));
      continue;
    }
    const l = [];
    for (; i.length > 0; ) {
      const A = i[0];
      if (Ht(A) || A.type === "image" && ro(l)) break;
      if (A.type === "title" && l.length > 0) {
        const g = qt(e, r, a, l);
        if (g && g.naturalUtilization > 0.5 + 1e-3) break;
      }
      const c = [...l, A];
      if (qt(e, r, a, c)) {
        l.push(i.shift());
        continue;
      }
      if (A.type === "image" && l.length > 0) {
        const g = ll(
          e,
          r,
          a,
          l,
          A,
          s
        );
        if (g) {
          l.splice(0, l.length, ...g.currentBlocks), i.unshift(g.tail), s += 1;
          break;
        }
      }
      if (!(l.length === 0 || ol(l))) break;
      if (A.type === "image")
        throw new Ut([
          `Image block ${A.blockId} cannot fit its planned image and caption boxes on an empty content page.`
        ]);
      const o = Yi([...l, A]) ? Ua : Ie, f = sl(
        e,
        r,
        a,
        l,
        A,
        s,
        o
      );
      if (!f)
        throw new Ut([
          `Block ${A.blockId} (${A.type}) could not be split into a valid physical page.`
        ]);
      s += 1, i.shift(), f.tail && i.unshift(f.tail), l.push(f.head);
      break;
    }
    if (l.length === 0) {
      const A = i[0];
      throw new Ut([
        `Planner made no progress at block ${A?.blockId ?? "unknown"}.`
      ]);
    }
    t.push({
      type: "content",
      plan: Ki(
        l,
        qa(e, r, a)
      )
    }), a += 1;
  }
  return t;
}
function cl(e) {
  const r = {
    ...e,
    overview: {
      ...e.overview,
      // Key terms are deterministic: exactly one item per section title.
      keyPoints: e.sections.map((l) => l.sectionTitle)
    }
  }, t = [
    { type: "cover", lecture: r },
    { type: "overview", lecture: r }
  ];
  let i = 0, a = 0, s = 0;
  return r.sections.forEach((l, A) => {
    t.push({ type: "section", section: l, sectionIndex: A }), i += l.slides.length, s += l.slides.reduce((n, o) => n + o.blocks.length, 0);
    const c = Wi(l.slides);
    a += c.length;
    for (const n of c)
      t.push(...ao(n, l.sectionTitle));
  }), t.push({ type: "ending", lecture: r }), {
    slides: t,
    sourceLectureSlideCount: i,
    compactedLectureSlideCount: a,
    semanticBlockCount: s
  };
}
function Al(e, r) {
  const t = e.addSlide();
  t.background = { color: D.NAVY }, t.addShape("rect", {
    x: Xe.STRIP_X,
    y: Xe.STRIP_Y,
    w: Xe.STRIP_W,
    h: Xe.STRIP_H,
    fill: { color: D.GRAPHITE },
    line: { color: D.GRAPHITE, width: 0 }
  }), t.addShape("line", {
    x: Xe.STRIP_X + 1.42,
    y: 0,
    w: 0,
    h: D.SLIDE_HEIGHT,
    line: { color: D.DARK_RULE, width: 0.8, transparency: 20 }
  }), Ga(t, 8.42, 1, 4.15, 4.55), st(t, "Jang lecture / editable PowerPoint", "", !0), t.addText(r.documentTitle, {
    x: Xe.TITLE_X,
    y: Xe.TITLE_Y,
    w: Xe.TITLE_W,
    h: Xe.TITLE_H,
    fontFace: D.headingFont,
    fontSize: D.FONT_COVER_TITLE,
    bold: !0,
    color: D.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addShape("line", {
    x: Xe.TITLE_X,
    y: 3.37,
    w: 1.12,
    h: 0,
    line: { color: D.WHITE, width: 2 }
  }), t.addText(r.overview.title || "Structured lecture", {
    x: Xe.TITLE_X,
    y: 3.72,
    w: 5.75,
    h: 0.48,
    fontFace: D.bodyFont,
    fontSize: 15,
    color: D.MUTED_ON_DARK,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addText("GENERATED FROM STRUCTURED LECTURE METADATA", {
    x: Xe.TITLE_X,
    y: 5.45,
    w: 5.8,
    h: 0.18,
    fontFace: D.labelFont,
    fontSize: D.FONT_COVER_LABEL,
    bold: !0,
    charSpacing: 1.5,
    color: D.MUTED_ON_DARK,
    margin: 0
  }), lt(t, r.documentTitle, !0);
}
function dl(e, r) {
  const t = e.addSlide();
  t.background = { color: D.SLIDE_BG }, st(t, "Lecture overview", "Reading sequence");
  const i = r.overview.title || "A sequence for learning", a = Fe(
    i,
    Re.TITLE_W,
    D.FONT_SLIDE_TITLE,
    Re.TITLE_H,
    1.02,
    0.04
  ), s = Re.TITLE_Y + a + 0.18, l = r.overview.introduction, A = !!be(l).trim(), c = A ? Fe(
    l,
    Re.LEFT_COL_W,
    D.FONT_OVERVIEW_INTRO,
    Re.INTRO_H,
    0.92,
    0.03
  ) : 0;
  t.addText(i, {
    x: Re.TITLE_X,
    y: Re.TITLE_Y,
    w: Re.TITLE_W,
    h: a,
    fontFace: D.headingFont,
    fontSize: D.FONT_SLIDE_TITLE,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), A && t.addText(Be(l), {
    x: Re.LEFT_COL_X,
    y: s,
    w: Re.LEFT_COL_W,
    h: c,
    fontFace: D.bodyFont,
    fontSize: D.FONT_OVERVIEW_INTRO,
    color: D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
  const n = Math.max(1, r.sections.length), o = Math.max(2.82, s + c + 0.18), f = Math.max(0.9, 6.18 - o), g = Math.min(0.68, Math.max(0.34, f / n));
  r.sections.forEach((h, u) => {
    const y = o + u * g;
    t.addText(String(u + 1).padStart(2, "0"), {
      x: we,
      y,
      w: 0.42,
      h: 0.18,
      fontFace: D.labelFont,
      fontSize: 9,
      bold: !0,
      color: u === 0 ? D.DARK_TEXT : D.MUTED_TEXT,
      margin: 0
    }), t.addShape("line", {
      x: 1.18,
      y: y + 0.09,
      w: 0.48,
      h: 0,
      line: { color: D.DIVIDER_COLOR, width: 0.7 }
    }), t.addText(h.sectionTitle, {
      x: 1.82,
      y: y - 0.05,
      w: 5.95,
      h: Math.max(0.28, g - 0.05),
      fontFace: D.headingFont,
      fontSize: D.FONT_OVERVIEW_TOC,
      bold: !0,
      color: D.DARK_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      wrap: !0,
      fit: "shrink"
    });
  }), t.addShape("rect", {
    x: Re.RIGHT_COL_X,
    y: Re.TOC_CARD_Y,
    w: Re.RIGHT_COL_W,
    h: Re.TOC_CARD_H,
    fill: { color: D.PAGE_BG },
    line: { color: D.PAGE_BG, width: 0 }
  }), t.addText("KEY TERMS", {
    x: Re.RIGHT_COL_X + 0.36,
    y: Re.TOC_LABEL_Y,
    w: Re.RIGHT_COL_W - 0.72,
    h: 0.18,
    fontFace: D.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.5,
    color: D.MUTED_TEXT,
    margin: 0
  });
  const d = r.sections.map((h) => h.sectionTitle);
  d.length > 0 && t.addText(Sa(d.map((h) => ({ text: h })), "bullet"), {
    x: Re.RIGHT_COL_X + 0.34,
    y: Re.TOC_Y,
    w: Re.RIGHT_COL_W - 0.68,
    h: Re.TOC_H,
    fontFace: D.bodyFont,
    fontSize: D.FONT_OVERVIEW_KEYPOINT,
    color: D.BODY_TEXT,
    margin: 0.02,
    align: "left",
    valign: "top",
    wrap: !0,
    paraSpaceAfter: 9,
    fit: "shrink"
  }), lt(t, r.documentTitle);
}
function fl(e, r, t) {
  const i = e.addSlide();
  i.background = { color: D.NAVY }, i.addShape("rect", {
    x: je.BAND_X,
    y: je.BAND_Y,
    w: je.BAND_W,
    h: je.BAND_H,
    fill: { color: D.GRAPHITE },
    line: { color: D.GRAPHITE, width: 0 }
  }), i.addShape("line", {
    x: je.BAND_X,
    y: 0,
    w: 0,
    h: D.SLIDE_HEIGHT,
    line: { color: D.DARK_RULE, width: 1 }
  }), Ga(i, 9.15, 2.2, 3.4, 3.4), st(i, `Section ${String(t + 1).padStart(2, "0")}`, r.sectionTitle, !0), i.addText(String(t + 1).padStart(2, "0"), {
    x: 10.05,
    y: je.NUMBER_Y,
    w: 1.45,
    h: je.NUMBER_H,
    fontFace: D.headingFont,
    fontSize: 40,
    bold: !0,
    color: D.DEEP_GRAY,
    margin: 0,
    align: "right",
    valign: "top"
  });
  const a = 6.4, s = Fe(
    r.sectionTitle,
    a,
    D.FONT_SECTION_TITLE_SLIDE,
    je.TITLE_H,
    2.05,
    0.06
  ), l = jt(je.TITLE_Y, s);
  if (i.addText(r.sectionTitle, {
    x: we,
    y: je.TITLE_Y,
    w: a,
    h: s,
    fontFace: D.headingFont,
    fontSize: D.FONT_SECTION_TITLE_SLIDE,
    bold: !0,
    color: D.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), i.addShape("line", {
    x: we,
    y: l,
    w: 1.12,
    h: 0,
    line: { color: D.WHITE, width: 2 }
  }), r.sectionDefinition && be(r.sectionDefinition).trim()) {
    const A = l + 0.12, c = Fe(
      r.sectionDefinition,
      a,
      D.FONT_CALLOUT_TEXT,
      0.38,
      1.05,
      0.02
    );
    i.addText(Be(r.sectionDefinition), {
      x: we,
      y: A,
      w: a,
      h: c,
      fontFace: D.bodyFont,
      fontSize: D.FONT_CALLOUT_TEXT,
      color: D.MUTED_ON_DARK,
      margin: 0,
      align: "left",
      valign: "top",
      wrap: !0,
      fit: "shrink"
    });
  }
  lt(i, r.sectionTitle, !0);
}
function cn(e) {
  return [parseInt(e.slice(0, 2), 16), parseInt(e.slice(2, 4), 16), parseInt(e.slice(4, 6), 16)];
}
function ul(e) {
  return e.map((r) => Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function hl(e, r, t) {
  const i = cn(e), a = cn(r), s = Math.max(0, Math.min(1, t));
  return ul([i[0] + (a[0] - i[0]) * s, i[1] + (a[1] - i[1]) * s, i[2] + (a[2] - i[2]) * s]);
}
function pl(e, r, t, i) {
  if (e.tableType === "heatmap" && e.heatmap) {
    const a = e.heatmap.values[r]?.[t];
    if (typeof a == "number") {
      const s = e.heatmap.max - e.heatmap.min, l = s > 0 ? (a - e.heatmap.min) / s : 0;
      return hl("FFFFFF", "B8B8B5", l);
    }
  }
  return e.tableType === "highlight" ? i % 2 === 0 ? "E6E6E4" : D.TABLE_ROW_EVEN_BG : i % 2 === 0 ? D.TABLE_ROW_ODD_BG : D.TABLE_ROW_EVEN_BG;
}
function An(e) {
  return typeof e == "string" ? e : Be(e);
}
function no(e, r, t, i = 0) {
  const a = e.headers.map((l) => ({
    text: An(l),
    options: {
      bold: !0,
      color: D.TABLE_HEADER_TEXT,
      fill: { color: D.TABLE_HEADER_BG },
      valign: "middle",
      align: "left",
      fontSize: t,
      margin: 0.07
    }
  })), s = r.map((l, A) => l.map((c, n) => ({
    text: An(c),
    options: {
      fill: { color: pl(e, i + A, n, A) },
      valign: "middle",
      align: "left",
      color: D.BODY_TEXT,
      fontSize: t,
      margin: 0.07
    }
  })));
  return [a, ...s];
}
function ml(e, r, t, i, a, s) {
  let l = i;
  e.addText(Be(r.label), {
    x: t,
    y: l,
    w: a,
    h: D.H_TABLE_LABEL,
    fontFace: D.headingFont,
    fontSize: D.FONT_TABLE_BODY + 2,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), l += D.H_TABLE_LABEL + 0.12;
  const A = r.__rowOffset ?? 0, c = no(r, r.rows, D.FONT_TABLE_BODY, A), n = Array(r.headers.length).fill(a / r.headers.length);
  return e.addTable(c, {
    x: t,
    y: l,
    w: a,
    rowH: [D.H_TABLE_HEADER_ROW, ...Array(r.rows.length).fill(D.H_TABLE_BODY_ROW)],
    fontFace: D.bodyFont,
    fontSize: D.FONT_TABLE_BODY,
    border: { type: "solid", color: D.TABLE_BORDER, pt: 0.4 },
    colW: n,
    margin: 0.06
  }), l += D.H_TABLE_HEADER_ROW + r.rows.length * D.H_TABLE_BODY_ROW, l - i;
}
function gl(e, r) {
  const t = e.addSlide();
  t.background = { color: D.SLIDE_BG }, st(t, "Editable table", r.sectionTitle), t.addText(Be(r.label), {
    ...r.labelBox,
    fontFace: D.headingFont,
    fontSize: 22,
    bold: r.pageIndex === 0,
    italic: r.pageIndex > 0,
    color: r.pageIndex === 0 ? D.DARK_TEXT : D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), t.addTable(no(r.block, r.rows, r.fontSize, r.rowOffset), {
    x: r.tableBox.x,
    y: r.tableBox.y,
    w: r.tableBox.w,
    rowH: [r.headerHeight, ...r.rowHeights],
    fontFace: D.bodyFont,
    fontSize: r.fontSize,
    border: { type: "solid", color: D.TABLE_BORDER, pt: 0.4 },
    colW: r.colWidths,
    margin: 0.06
  }), lt(t, r.sectionTitle);
}
function yl(e, r = D.DIAGRAM_MAX_NODES_PER_ROW) {
  const t = Math.max(1, Math.floor(r)), i = [];
  for (const a of e)
    for (let s = 0; s < a.length; s += t) i.push(a.slice(s, s + t));
  return i;
}
function ka(e, r, t, i, a) {
  e.addShape("line", {
    x: r,
    y: t,
    w: i,
    h: a,
    line: { color: D.DIAGRAM_CONNECTOR, width: 1.15, endArrowType: "triangle" }
  });
}
function vl(e, r, t, i, a, s) {
  let l = i;
  e.addText(Be(r.label), {
    x: t,
    y: l,
    w: a,
    h: D.H_DIAGRAM_LABEL,
    fontFace: D.headingFont,
    fontSize: D.FONT_DIAGRAM_NODE + 2,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), l += D.H_DIAGRAM_LABEL + 0.12;
  const A = yl(r.diagramRows), c = D.DIAGRAM_NODE_HEIGHT, n = D.DIAGRAM_NODE_H_GAP, o = D.DIAGRAM_ROW_V_GAP;
  return A.forEach((f, g) => {
    if (!f.length) return;
    const d = Math.min(
      D.DIAGRAM_NODE_WIDTH,
      Math.max(0.82, (a - (f.length - 1) * n) / f.length)
    ), h = f.length * d + (f.length - 1) * n, u = t + Math.max(0, (a - h) / 2);
    f.forEach((y, m) => {
      const p = u + m * (d + n), _ = m === f.length - 1 && g === A.length - 1;
      e.addShape("roundRect", {
        x: p,
        y: l,
        w: d,
        h: c,
        rectRadius: 0.06,
        fill: { color: _ ? D.NAVY : D.DIAGRAM_NODE_BG },
        line: { color: D.DIAGRAM_NODE_BORDER, width: 0.8 }
      }), e.addText(Be(y), {
        x: p + 0.08,
        y: l + 0.05,
        w: d - 0.16,
        h: c - 0.1,
        fontFace: D.bodyFont,
        fontSize: D.FONT_DIAGRAM_NODE,
        bold: !0,
        color: _ ? D.WHITE : D.DIAGRAM_NODE_TEXT,
        margin: 0,
        align: "center",
        valign: "middle",
        wrap: !0,
        fit: "shrink"
      }), m < f.length - 1 && ka(e, p + d + 0.04, l + c / 2, n - 0.08, 0);
    }), l += c, g < A.length - 1 && (ka(e, t + a / 2, l + 0.04, 0, o - 0.08), l += o);
  }), l - i;
}
function bl(e, r) {
  const t = e.addSlide();
  t.background = { color: D.SLIDE_BG }, st(t, "Editable diagram", r.sectionTitle), t.addText(Be(r.label), {
    ...r.labelBox,
    fontFace: D.headingFont,
    fontSize: 22,
    bold: r.pageIndex === 0,
    italic: r.pageIndex > 0,
    color: r.pageIndex === 0 ? D.DARK_TEXT : D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  });
  for (const i of r.connectors)
    ka(
      t,
      i.box.x,
      i.box.y,
      i.box.w,
      i.box.h
    );
  for (const i of r.nodes)
    t.addShape("roundRect", {
      ...i.box,
      rectRadius: 0.06,
      fill: { color: i.emphasized ? D.NAVY : D.DIAGRAM_NODE_BG },
      line: { color: D.DIAGRAM_NODE_BORDER, width: 0.8 }
    }), t.addText(Be(i.text), {
      x: i.box.x + 0.08,
      y: i.box.y + 0.05,
      w: i.box.w - 0.16,
      h: i.box.h - 0.1,
      fontFace: D.bodyFont,
      fontSize: D.FONT_DIAGRAM_NODE,
      bold: !0,
      color: i.emphasized ? D.WHITE : D.DIAGRAM_NODE_TEXT,
      margin: 0,
      align: "center",
      valign: "middle",
      wrap: !0,
      fit: "shrink"
    });
  lt(t, r.sectionTitle);
}
function wl(e, r, t, i, a) {
  if (!a || !Number.isFinite(a) || a <= 0) return { x: e, y: r, w: t, h: i };
  const s = t / i, l = a >= s ? t : i * a, A = a >= s ? t / a : i;
  return { x: e + (t - l) / 2, y: r + (i - A) / 2, w: l, h: A };
}
function _l(e, r, t, i) {
  return { x: e, y: r, w: t, h: i };
}
function xl(e) {
  if (typeof atob == "function") {
    const r = atob(e.replace(/\s/g, ""));
    return Uint8Array.from(r, (t) => t.charCodeAt(0));
  }
  return new Uint8Array(Buffer.from(e, "base64"));
}
function Dt(e) {
  return new TextDecoder().decode(e);
}
function io(e) {
  const r = /^data:([^;,]+)(;base64)?,(.*)$/is.exec(e.trim());
  if (!(!r || !r[1].toLowerCase().startsWith("image/")))
    try {
      const t = r[2] ? xl(r[3]) : new TextEncoder().encode(decodeURIComponent(r[3]));
      return { mimeType: r[1].toLowerCase(), bytes: t, ...r[1].toLowerCase() === "image/svg+xml" ? { text: Dt(t) } : {} };
    } catch {
      return;
    }
}
function Cl(e) {
  const r = io(e);
  return !!(r && ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"].includes(r.mimeType));
}
function fa(e, r) {
  return e[r] * 256 + e[r + 1];
}
function dn(e, r) {
  return e[r] * 16777216 + e[r + 1] * 65536 + e[r + 2] * 256 + e[r + 3];
}
function Qr(e, r) {
  return e[r] + e[r + 1] * 256;
}
function fn(e, r) {
  return e[r] + e[r + 1] * 256 + e[r + 2] * 65536;
}
function Tl(e) {
  if (!(e.length < 24 || e[0] !== 137 || e[1] !== 80 || e[2] !== 78 || e[3] !== 71))
    return [dn(e, 16), dn(e, 20)];
}
function El(e) {
  if (!(e.length < 10 || Dt(e.slice(0, 3)) !== "GIF"))
    return [Qr(e, 6), Qr(e, 8)];
}
function Ll(e) {
  if (e.length < 4 || e[0] !== 255 || e[1] !== 216) return;
  let r = 2;
  const t = /* @__PURE__ */ new Set([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207]);
  for (; r + 8 < e.length; ) {
    if (e[r] !== 255) {
      r++;
      continue;
    }
    for (; e[r] === 255; ) r++;
    const i = e[r++];
    if (i === 217 || i === 218) break;
    const a = fa(e, r);
    if (t.has(i) && r + 7 < e.length) return [fa(e, r + 5), fa(e, r + 3)];
    if (a < 2) break;
    r += a;
  }
}
function Dl(e) {
  if (e.length < 30 || Dt(e.slice(0, 4)) !== "RIFF" || Dt(e.slice(8, 12)) !== "WEBP") return;
  const r = Dt(e.slice(12, 16));
  if (r === "VP8X") return [1 + fn(e, 24), 1 + fn(e, 27)];
  if (r === "VP8L" && e[20] === 47) {
    const t = e[21] | e[22] << 8 | e[23] << 16 | e[24] << 24;
    return [(t & 16383) + 1, (t >> 14 & 16383) + 1];
  }
  if (r === "VP8 " && e.length >= 30) return [Qr(e, 26) & 16383, Qr(e, 28) & 16383];
}
function Rl(e) {
  const r = /<svg\b[^>]*>/i.exec(e)?.[0];
  if (!r) return;
  const t = (l) => {
    const A = new RegExp(`${l}\\s*=\\s*["']\\s*([0-9.]+)`, "i").exec(r)?.[1];
    return A ? Number(A) : void 0;
  }, i = t("width"), a = t("height");
  if (i && a) return [i, a];
  const s = /viewBox\s*=\s*["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)/i.exec(r);
  return s ? [Number(s[1]), Number(s[2])] : void 0;
}
function Bl(e) {
  const r = io(e);
  if (!r) return;
  let t;
  switch (r.mimeType) {
    case "image/png":
      t = Tl(r.bytes);
      break;
    case "image/jpeg":
    case "image/jpg":
      t = Ll(r.bytes);
      break;
    case "image/gif":
      t = El(r.bytes);
      break;
    case "image/webp":
      t = Dl(r.bytes);
      break;
    case "image/svg+xml":
      t = Rl(r.text ?? Dt(r.bytes));
      break;
  }
  if (!(!t || t[0] <= 0 || t[1] <= 0))
    return { width: t[0], height: t[1], mimeType: r.mimeType, aspect: t[0] / t[1] };
}
const Pl = /* @__PURE__ */ new Set([
  "pathway",
  "chart",
  "microscopy",
  "radiology",
  "anatomy",
  "diagram"
]);
function oo(e) {
  return e.visualType === "photo" || e.visualType === "decorative" ? "cover" : e.visualType && Pl.has(e.visualType) ? "contain" : e.fit;
}
function so(e, r, t, i, a, s, l) {
  const A = [], c = t[r.slotId];
  let n = !1;
  if (!c?.dataUrl)
    A.push(`Image slot "${r.slotId}" (${be(r.label)}) has no imported image — placeholder shown.`);
  else if (!Cl(c.dataUrl))
    A.push(`Image slot "${r.slotId}" is not a supported PNG, JPEG, GIF, WebP, or SVG data URL — placeholder shown.`);
  else {
    const o = Bl(c.dataUrl);
    if (!o)
      A.push(`Image slot "${r.slotId}" could not be decoded safely — placeholder shown.`);
    else
      try {
        if (oo(r) === "cover") {
          const f = _l(i, a, s, l);
          e.addImage({
            data: c.dataUrl,
            ...f,
            sizing: { type: "cover", w: f.w, h: f.h }
          });
        } else
          e.addImage({ data: c.dataUrl, ...wl(i, a, s, l, o.aspect) });
        n = !0;
      } catch (f) {
        const g = f instanceof Error ? f.message : String(f);
        A.push(`Image slot "${r.slotId}" failed to embed (${g}) — placeholder shown.`);
      }
  }
  return n || Il(e, r, i, a, s, l), { rendered: n, warnings: A };
}
function Nl(e, r, t) {
  const i = e.addSlide();
  i.background = { color: D.SLIDE_BG }, st(i, "Image evidence", r.sectionTitle), i.addShape("roundRect", {
    ...r.frameBox,
    rectRadius: 0.06,
    fill: { color: D.WHITE },
    line: { color: D.DIVIDER_COLOR, width: 0.6 }
  });
  const a = so(
    i,
    r.block,
    t,
    r.imageBox.x,
    r.imageBox.y,
    r.imageBox.w,
    r.imageBox.h
  );
  return i.addText("IMAGE / EDITABLE OBJECT", {
    ...r.eyebrowBox,
    fontFace: D.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.5,
    color: D.MUTED_TEXT,
    margin: 0
  }), i.addText(Be(r.block.label), {
    ...r.labelBox,
    fontFace: D.headingFont,
    fontSize: 23,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), i.addShape("line", {
    ...r.titleRuleBox,
    line: { color: D.DARK_TEXT, width: 1.4 }
  }), r.descriptionBox && i.addText(Be(r.block.description), {
    ...r.descriptionBox,
    fontFace: D.bodyFont,
    fontSize: 15,
    color: D.BODY_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), i.addText(oo(r.block) === "cover" ? "COVER CROP" : "CONTAIN / FULL IMAGE", {
    ...r.fitLabelBox,
    fontFace: D.labelFont,
    fontSize: 8,
    bold: !0,
    charSpacing: 1.2,
    color: D.MUTED_TEXT,
    margin: 0
  }), r.sourceBox && i.addText(`Source: ${r.block.sourceReference}`, {
    ...r.sourceBox,
    fontFace: D.bodyFont,
    fontSize: D.FONT_CAPTION,
    italic: !0,
    color: D.CAPTION_COLOR,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), lt(i, r.sectionTitle), a;
}
function Il(e, r, t, i, a, s) {
  e.addShape("rect", {
    x: t,
    y: i,
    w: a,
    h: s,
    fill: { color: D.PLACEHOLDER_BG },
    line: { color: D.PLACEHOLDER_BORDER, width: 1, dashType: "dash" }
  }), e.addText("[Image not imported]", {
    x: t + Math.min(0.4, a * 0.1),
    y: i + s / 2 - 0.2,
    w: Math.max(0.2, a - Math.min(0.8, a * 0.2)),
    h: 0.22,
    fontFace: D.labelFont,
    fontSize: 9,
    bold: !0,
    charSpacing: 1.2,
    color: D.PLACEHOLDER_TEXT,
    margin: 0,
    align: "center",
    valign: "middle"
  }), e.addText(Be(r.label), {
    x: t + Math.min(0.5, a * 0.12),
    y: i + s / 2 + 0.12,
    w: Math.max(0.2, a - Math.min(1, a * 0.24)),
    h: 0.48,
    fontFace: D.bodyFont,
    fontSize: 12,
    color: D.BODY_TEXT,
    margin: 0,
    align: "center",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
}
function Ke(e, r, t) {
  e.addText(Be(r.text), { ...r.box, ...t });
}
function un(e, r, t) {
  e.addText(Be(r), {
    ...t,
    fontFace: D.bodyFont,
    fontSize: D.FONT_CALLOUT_TEXT,
    color: D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
}
function hn(e, r) {
  const { block: t, box: i } = r;
  switch (t.type) {
    case "title":
      e.addText(Be(t.text), {
        ...r.textBox ?? i,
        fontFace: D.headingFont,
        fontSize: D.FONT_SLIDE_TITLE,
        bold: !0,
        color: D.DARK_TEXT,
        margin: 0,
        align: "left",
        valign: "top",
        wrap: !0,
        fit: "shrink"
      }), r.ruleBox && e.addShape("line", {
        ...r.ruleBox,
        line: { color: D.DARK_TEXT, width: 1.4 }
      }), t.definition && r.definitionBox && un(e, t.definition, r.definitionBox);
      break;
    case "subtitle":
      e.addText(Be(t.text), {
        ...r.textBox ?? i,
        fontFace: D.headingFont,
        fontSize: D.FONT_SUBTITLE_BLOCK,
        bold: !0,
        color: D.DARK_TEXT,
        margin: 0,
        align: "left",
        valign: "top",
        wrap: !0,
        fit: "shrink"
      }), t.definition && r.definitionBox && un(e, t.definition, r.definitionBox);
      break;
    case "paragraph":
      e.addText(Be(t.text), {
        ...i,
        fontFace: D.bodyFont,
        fontSize: D.FONT_PARAGRAPH,
        color: D.BODY_TEXT,
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
      e.addText(Sa(t.items, "bullet"), {
        ...i,
        fontFace: D.bodyFont,
        fontSize: D.FONT_BULLET,
        color: D.BODY_TEXT,
        margin: 0.01,
        align: "left",
        valign: "top",
        wrap: !0,
        paraSpaceAfter: 8,
        fit: "shrink"
      });
      break;
    case "numbered":
      e.addText(Sa(t.items, "number", t.startAt ?? 1), {
        ...i,
        fontFace: D.bodyFont,
        fontSize: D.FONT_NUMBERED,
        color: D.BODY_TEXT,
        margin: 0.01,
        align: "left",
        valign: "top",
        wrap: !0,
        paraSpaceAfter: 8,
        fit: "shrink"
      });
      break;
    case "callout": {
      const a = Es(t.tone), s = Ls(t.tone);
      e.addShape("line", {
        x: i.x,
        y: i.y,
        w: 0,
        h: i.h,
        line: { color: a, width: 1.6 }
      }), e.addText([
        { text: `${Ds(t.tone)} / `, options: { bold: !0, color: s } },
        ...Be(t.label)
      ], {
        x: i.x + 0.2,
        y: i.y + 0.02,
        w: i.w - 0.2,
        h: 0.22,
        fontFace: D.labelFont,
        fontSize: D.FONT_CALLOUT_LABEL,
        bold: !0,
        charSpacing: 1.1,
        color: s,
        margin: 0,
        align: "left",
        valign: "top",
        fit: "shrink"
      }), e.addText(Be(t.text), {
        x: i.x + 0.2,
        y: i.y + 0.3,
        w: i.w - 0.2,
        h: Math.max(0.18, i.h - 0.32),
        fontFace: D.bodyFont,
        fontSize: D.FONT_CALLOUT_TEXT,
        color: D.BODY_TEXT,
        margin: 0,
        align: "left",
        valign: "top",
        wrap: !0,
        fit: "shrink"
      });
      break;
    }
    case "table":
      ml(e, t, i.x, i.y, i.w, i.h);
      break;
    case "diagram":
      vl(e, t, i.x, i.y, i.w, i.h);
      break;
    case "image":
      throw new Error("Image blocks must be represented by plan.image, not a planned content block.");
  }
}
function Sl(e, r, t = {}, i = []) {
  const a = e.addSlide();
  if (a.background = { color: D.SLIDE_BG }, st(a, "Lecture content", r.sectionTitle), r.title && Ke(a, r.title, {
    fontFace: D.headingFont,
    fontSize: D.FONT_SLIDE_TITLE,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), r.titleRule && a.addShape("line", {
    ...r.titleRule.box,
    line: { color: D.DARK_TEXT, width: 1.4 }
  }), r.titleDefinition && Ke(a, r.titleDefinition, {
    fontFace: D.bodyFont,
    fontSize: D.FONT_CALLOUT_TEXT,
    color: D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), r.subtitle && Ke(a, r.subtitle, {
    fontFace: D.headingFont,
    fontSize: D.FONT_SLIDE_SUBTITLE,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), r.subtitleDefinition && Ke(a, r.subtitleDefinition, {
    fontFace: D.bodyFont,
    fontSize: D.FONT_CALLOUT_TEXT,
    color: D.MUTED_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), r.image) {
    const s = so(
      a,
      r.image.block,
      t,
      r.image.box.x,
      r.image.box.y,
      r.image.box.w,
      r.image.box.h
    );
    i.push(...s.warnings), r.image.label && Ke(a, r.image.label, {
      fontFace: D.headingFont,
      fontSize: 10,
      bold: !0,
      color: D.DARK_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      wrap: !0,
      fit: "shrink"
    }), r.image.description && Ke(a, r.image.description, {
      fontFace: D.bodyFont,
      fontSize: 9,
      color: D.BODY_TEXT,
      margin: 0,
      align: "left",
      valign: "top",
      wrap: !0,
      fit: "shrink"
    }), r.image.source && Ke(a, r.image.source, {
      fontFace: D.bodyFont,
      fontSize: D.FONT_CAPTION,
      italic: !0,
      color: D.CAPTION_COLOR,
      margin: 0,
      align: "left",
      valign: "top",
      fit: "shrink"
    });
  }
  r.imageCompanionLabel && Ke(a, r.imageCompanionLabel, {
    fontFace: D.headingFont,
    fontSize: D.FONT_SUBTITLE_BLOCK,
    bold: !0,
    color: D.DARK_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), r.imageCompanionDescription && Ke(a, r.imageCompanionDescription, {
    fontFace: D.bodyFont,
    fontSize: D.FONT_PARAGRAPH,
    color: D.BODY_TEXT,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  });
  for (const s of r.blocks) hn(a, s);
  r.companion && hn(a, r.companion), lt(a, r.sectionTitle);
}
function kl(e, r) {
  const t = e.addSlide();
  t.background = { color: D.NAVY }, t.addShape("rect", {
    x: 8.68,
    y: 0,
    w: D.SLIDE_WIDTH - 8.68,
    h: D.SLIDE_HEIGHT,
    fill: { color: D.GRAPHITE },
    line: { color: D.GRAPHITE, width: 0 }
  }), t.addShape("line", {
    x: 8.68,
    y: 0,
    w: 0,
    h: D.SLIDE_HEIGHT,
    line: { color: D.DARK_RULE, width: 1 }
  }), Ga(t, 9.12, 1.85, 3.55, 3.85), st(t, "Discussion / next step", "", !0);
  const i = be(r.endNote) ? r.endNote : "Questions and discussion", a = Fe(
    i,
    6.45,
    30,
    da.TEXT_H,
    2.45,
    0.05
  ), s = jt(da.TEXT_Y, a);
  t.addText(Be(i), {
    x: we,
    y: da.TEXT_Y,
    w: 6.45,
    h: a,
    fontFace: D.headingFont,
    fontSize: 30,
    bold: !0,
    color: D.WHITE,
    margin: 0,
    align: "left",
    valign: "top",
    wrap: !0,
    fit: "shrink"
  }), t.addShape("line", {
    x: we,
    y: s,
    w: 1.12,
    h: 0,
    line: { color: D.WHITE, width: 2 }
  }), t.addText(r.documentTitle, {
    x: we,
    y: 5.9,
    w: 6.4,
    h: 0.3,
    fontFace: D.bodyFont,
    fontSize: 11,
    color: D.MUTED_ON_DARK,
    margin: 0,
    align: "left",
    valign: "top",
    fit: "shrink"
  }), lt(t, r.documentTitle, !0);
}
function Fl(e, r, t, i) {
  const a = cl(r);
  for (const s of a.slides)
    switch (s.type) {
      case "cover":
        Al(e, s.lecture);
        break;
      case "overview":
        dl(e, s.lecture);
        break;
      case "section":
        fl(e, s.section, s.sectionIndex);
        break;
      case "content":
        Sl(e, s.plan, t, i);
        break;
      case "image": {
        const l = Nl(e, s.plan, t);
        i.push(...l.warnings);
        break;
      }
      case "dedicated-table":
        gl(e, s.plan);
        break;
      case "dedicated-diagram":
        bl(e, s.plan);
        break;
      case "ending":
        kl(e, s.lecture);
        break;
    }
}
function Ml(e) {
  const r = [];
  for (const t of e) {
    const i = t.x + t.w, a = t.y + t.h, s = t.label ?? "Object";
    if (![t.x, t.y, t.w, t.h].every(Number.isFinite)) {
      r.push(`${s}: geometry contains a non-finite value`);
      continue;
    }
    (t.w < -1e-3 || t.h < -1e-3) && r.push(`${s}: width and height must be non-negative`), t.x < -1e-3 && r.push(`${s}: x=${t.x.toFixed(3)} is past left edge`), t.y < -1e-3 && r.push(`${s}: y=${t.y.toFixed(3)} is past top edge`), i > D.SLIDE_WIDTH + 1e-3 && r.push(`${s}: right=${i.toFixed(3)} exceeds slide width ${D.SLIDE_WIDTH}`), a > D.SLIDE_HEIGHT + 1e-3 && r.push(`${s}: bottom=${a.toFixed(3)} exceeds slide height ${D.SLIDE_HEIGHT}`);
  }
  return { valid: r.length === 0, violations: r };
}
function Ol(e, r) {
  if (!e || typeof e != "object") return;
  const t = e, i = t.options ?? t._options ?? t, a = i.x, s = i.y, l = i.w, A = i.h;
  if ([a, s, l, A].every((c) => typeof c == "number"))
    return { x: a, y: s, w: l, h: A, label: r };
}
function $l(e) {
  const r = e, t = r.slides ?? r._slides ?? [], i = [];
  let a = 0;
  return t.forEach((s, l) => {
    const c = (s._slideObjects ?? s.slideObjects ?? []).map((n, o) => Ol(n, `slide ${l + 1} object ${o + 1}`)).filter((n) => !!n);
    a += c.length, i.push(...Ml(c).violations);
  }), { valid: i.length === 0, violations: i, checkedObjects: a };
}
const zl = 1.15, Ul = 1.6;
function Gl(e, r = {}) {
  const t = [];
  let i = 0, a = 0;
  for (const c of e.sections) {
    a += c.slides.reduce((f, g) => f + g.blocks.length, 0);
    const n = Wi(c.slides), o = Is(c.slides, n);
    for (const f of o)
      t.push({ code: "content-lost-in-compaction", message: `${c.sectionTitle}: ${f}` });
    for (const f of n) {
      const g = ao(f, c.sectionTitle);
      i += g.length;
      for (const d of g) {
        if (d.type === "content") {
          const h = d.plan, u = h.contentBounds.h * h.naturalUtilization;
          (h.utilization < 0.6 - 1e-3 || h.utilization > 1 + 1e-3) && t.push({
            code: "content-density-out-of-range",
            message: `Content utilization ${(h.utilization * 100).toFixed(1)}% for "${f.slideTitle}" is outside 60%–100%.`
          }), h.pageIndex > 0 && h.blocks.length <= 1 && u < zl && t.push({
            code: "low-density-continuation",
            message: `Avoidable low-density continuation slide for "${f.slideTitle}" in section "${c.sectionTitle}".`
          }), h.image && !r[h.image.block.slotId]?.dataUrl && t.push({
            code: "unfilled-image-slot",
            message: `Image slot "${h.image.block.slotId}" has no imported image.`
          });
          continue;
        }
        if (d.type === "image") {
          const h = d.plan.block, u = be(h.label).trim().length > 0, y = be(h.description).trim().length > 0;
          r[h.slotId]?.dataUrl || (t.push({
            code: "unfilled-image-slot",
            message: `Image slot "${h.slotId}" has no imported image.`
          }), t.push({
            code: "blank-image-slide",
            message: u || y ? `Dedicated image slide for unfilled slot "${h.slotId}" should be integrated into related content.` : `Blank image-only slide for slot "${h.slotId}" — no label, description, or image.`
          }));
        }
      }
    }
  }
  const s = 3 + e.sections.length, l = s + i, A = s + a * Ul;
  return l > A && a > 0 && t.push({
    code: "disproportionate-slide-count",
    message: `Generated ${l} slides for ${a} semantic content blocks (expected at most ~${Math.ceil(A)}).`
  }), { estimatedSlideCount: l, semanticBlockCount: a, issues: t, valid: !t.some(Xl) };
}
function Xl(e) {
  return e.code !== "unfilled-image-slot";
}
var tr = { exports: {} }, ua = {}, Je = {}, ut = {}, ha = {}, pa = {}, ma = {}, pn;
function jr() {
  return pn || (pn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class r {
    }
    e._CodeOrName = r, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class t extends r {
      constructor(p) {
        if (super(), !e.IDENTIFIER.test(p))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = p;
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
    class i extends r {
      constructor(p) {
        super(), this._items = typeof p == "string" ? [p] : p;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const p = this._items[0];
        return p === "" || p === '""';
      }
      get str() {
        var p;
        return (p = this._str) !== null && p !== void 0 ? p : this._str = this._items.reduce((_, T) => `${_}${T}`, "");
      }
      get names() {
        var p;
        return (p = this._names) !== null && p !== void 0 ? p : this._names = this._items.reduce((_, T) => (T instanceof t && (_[T.str] = (_[T.str] || 0) + 1), _), {});
      }
    }
    e._Code = i, e.nil = new i("");
    function a(m, ...p) {
      const _ = [m[0]];
      let T = 0;
      for (; T < p.length; )
        A(_, p[T]), _.push(m[++T]);
      return new i(_);
    }
    e._ = a;
    const s = new i("+");
    function l(m, ...p) {
      const _ = [d(m[0])];
      let T = 0;
      for (; T < p.length; )
        _.push(s), A(_, p[T]), _.push(s, d(m[++T]));
      return c(_), new i(_);
    }
    e.str = l;
    function A(m, p) {
      p instanceof i ? m.push(...p._items) : p instanceof t ? m.push(p) : m.push(f(p));
    }
    e.addCodeArg = A;
    function c(m) {
      let p = 1;
      for (; p < m.length - 1; ) {
        if (m[p] === s) {
          const _ = n(m[p - 1], m[p + 1]);
          if (_ !== void 0) {
            m.splice(p - 1, 3, _);
            continue;
          }
          m[p++] = "+";
        }
        p++;
      }
    }
    function n(m, p) {
      if (p === '""')
        return m;
      if (m === '""')
        return p;
      if (typeof m == "string")
        return p instanceof t || m[m.length - 1] !== '"' ? void 0 : typeof p != "string" ? `${m.slice(0, -1)}${p}"` : p[0] === '"' ? m.slice(0, -1) + p.slice(1) : void 0;
      if (typeof p == "string" && p[0] === '"' && !(m instanceof t))
        return `"${m}${p.slice(1)}`;
    }
    function o(m, p) {
      return p.emptyStr() ? m : m.emptyStr() ? p : l`${m}${p}`;
    }
    e.strConcat = o;
    function f(m) {
      return typeof m == "number" || typeof m == "boolean" || m === null ? m : d(Array.isArray(m) ? m.join(",") : m);
    }
    function g(m) {
      return new i(d(m));
    }
    e.stringify = g;
    function d(m) {
      return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = d;
    function h(m) {
      return typeof m == "string" && e.IDENTIFIER.test(m) ? new i(`.${m}`) : a`[${m}]`;
    }
    e.getProperty = h;
    function u(m) {
      if (typeof m == "string" && e.IDENTIFIER.test(m))
        return new i(`${m}`);
      throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
    }
    e.getEsmExportName = u;
    function y(m) {
      return new i(m.toString());
    }
    e.regexpCode = y;
  })(ma)), ma;
}
var ga = {}, mn;
function gn() {
  return mn || (mn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const r = /* @__PURE__ */ jr();
    class t extends Error {
      constructor(n) {
        super(`CodeGen: "code" for ${n} not defined`), this.value = n.value;
      }
    }
    var i;
    (function(c) {
      c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
    })(i || (e.UsedValueState = i = {})), e.varKinds = {
      const: new r.Name("const"),
      let: new r.Name("let"),
      var: new r.Name("var")
    };
    class a {
      constructor({ prefixes: n, parent: o } = {}) {
        this._names = {}, this._prefixes = n, this._parent = o;
      }
      toName(n) {
        return n instanceof r.Name ? n : this.name(n);
      }
      name(n) {
        return new r.Name(this._newName(n));
      }
      _newName(n) {
        const o = this._names[n] || this._nameGroup(n);
        return `${n}${o.index++}`;
      }
      _nameGroup(n) {
        var o, f;
        if (!((f = (o = this._parent) === null || o === void 0 ? void 0 : o._prefixes) === null || f === void 0) && f.has(n) || this._prefixes && !this._prefixes.has(n))
          throw new Error(`CodeGen: prefix "${n}" is not allowed in this scope`);
        return this._names[n] = { prefix: n, index: 0 };
      }
    }
    e.Scope = a;
    class s extends r.Name {
      constructor(n, o) {
        super(o), this.prefix = n;
      }
      setValue(n, { property: o, itemIndex: f }) {
        this.value = n, this.scopePath = (0, r._)`.${new r.Name(o)}[${f}]`;
      }
    }
    e.ValueScopeName = s;
    const l = (0, r._)`\n`;
    class A extends a {
      constructor(n) {
        super(n), this._values = {}, this._scope = n.scope, this.opts = { ...n, _n: n.lines ? l : r.nil };
      }
      get() {
        return this._scope;
      }
      name(n) {
        return new s(n, this._newName(n));
      }
      value(n, o) {
        var f;
        if (o.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const g = this.toName(n), { prefix: d } = g, h = (f = o.key) !== null && f !== void 0 ? f : o.ref;
        let u = this._values[d];
        if (u) {
          const p = u.get(h);
          if (p)
            return p;
        } else
          u = this._values[d] = /* @__PURE__ */ new Map();
        u.set(h, g);
        const y = this._scope[d] || (this._scope[d] = []), m = y.length;
        return y[m] = o.ref, g.setValue(o, { property: d, itemIndex: m }), g;
      }
      getValue(n, o) {
        const f = this._values[n];
        if (f)
          return f.get(o);
      }
      scopeRefs(n, o = this._values) {
        return this._reduceValues(o, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, r._)`${n}${f.scopePath}`;
        });
      }
      scopeCode(n = this._values, o, f) {
        return this._reduceValues(n, (g) => {
          if (g.value === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return g.value.code;
        }, o, f);
      }
      _reduceValues(n, o, f = {}, g) {
        let d = r.nil;
        for (const h in n) {
          const u = n[h];
          if (!u)
            continue;
          const y = f[h] = f[h] || /* @__PURE__ */ new Map();
          u.forEach((m) => {
            if (y.has(m))
              return;
            y.set(m, i.Started);
            let p = o(m);
            if (p) {
              const _ = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              d = (0, r._)`${d}${_} ${m} = ${p};${this.opts._n}`;
            } else if (p = g?.(m))
              d = (0, r._)`${d}${p}${this.opts._n}`;
            else
              throw new t(m);
            y.set(m, i.Completed);
          });
        }
        return d;
      }
    }
    e.ValueScope = A;
  })(ga)), ga;
}
var yn;
function ge() {
  return yn || (yn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const r = /* @__PURE__ */ jr(), t = /* @__PURE__ */ gn();
    var i = /* @__PURE__ */ jr();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return i.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return i.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return i.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } });
    var a = /* @__PURE__ */ gn();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return a.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return a.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return a.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return a.varKinds;
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
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames(L, N) {
        return this;
      }
    }
    class l extends s {
      constructor(L, N, q) {
        super(), this.varKind = L, this.name = N, this.rhs = q;
      }
      render({ es5: L, _n: N }) {
        const q = L ? t.varKinds.var : this.varKind, oe = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${q} ${this.name}${oe};` + N;
      }
      optimizeNames(L, N) {
        if (L[this.name.str])
          return this.rhs && (this.rhs = w(this.rhs, L, N)), this;
      }
      get names() {
        return this.rhs instanceof r._CodeOrName ? this.rhs.names : {};
      }
    }
    class A extends s {
      constructor(L, N, q) {
        super(), this.lhs = L, this.rhs = N, this.sideEffects = q;
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
      constructor(L, N, q, oe) {
        super(L, q, oe), this.op = N;
      }
      render({ _n: L }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + L;
      }
    }
    class n extends s {
      constructor(L) {
        super(), this.label = L, this.names = {};
      }
      render({ _n: L }) {
        return `${this.label}:` + L;
      }
    }
    class o extends s {
      constructor(L) {
        super(), this.label = L, this.names = {};
      }
      render({ _n: L }) {
        return `break${this.label ? ` ${this.label}` : ""};` + L;
      }
    }
    class f extends s {
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
    class g extends s {
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
    class d extends s {
      constructor(L = []) {
        super(), this.nodes = L;
      }
      render(L) {
        return this.nodes.reduce((N, q) => N + q.render(L), "");
      }
      optimizeNodes() {
        const { nodes: L } = this;
        let N = L.length;
        for (; N--; ) {
          const q = L[N].optimizeNodes();
          Array.isArray(q) ? L.splice(N, 1, ...q) : q ? L[N] = q : L.splice(N, 1);
        }
        return L.length > 0 ? this : void 0;
      }
      optimizeNames(L, N) {
        const { nodes: q } = this;
        let oe = q.length;
        for (; oe--; ) {
          const ae = q[oe];
          ae.optimizeNames(L, N) || (G(L, ae.names), q.splice(oe, 1));
        }
        return q.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((L, N) => E(L, N.names), {});
      }
    }
    class h extends d {
      render(L) {
        return "{" + L._n + super.render(L) + "}" + L._n;
      }
    }
    class u extends d {
    }
    class y extends h {
    }
    y.kind = "else";
    class m extends h {
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
          const q = N.optimizeNodes();
          N = this.else = Array.isArray(q) ? new y(q) : q;
        }
        if (N)
          return L === !1 ? N instanceof m ? N : N.nodes : this.nodes.length ? this : new m(ee(L), N instanceof m ? [N] : N.nodes);
        if (!(L === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(L, N) {
        var q;
        if (this.else = (q = this.else) === null || q === void 0 ? void 0 : q.optimizeNames(L, N), !!(super.optimizeNames(L, N) || this.else))
          return this.condition = w(this.condition, L, N), this;
      }
      get names() {
        const L = super.names;
        return M(L, this.condition), this.else && E(L, this.else.names), L;
      }
    }
    m.kind = "if";
    class p extends h {
    }
    p.kind = "for";
    class _ extends p {
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
        return E(super.names, this.iteration.names);
      }
    }
    class T extends p {
      constructor(L, N, q, oe) {
        super(), this.varKind = L, this.name = N, this.from = q, this.to = oe;
      }
      render(L) {
        const N = L.es5 ? t.varKinds.var : this.varKind, { name: q, from: oe, to: ae } = this;
        return `for(${N} ${q}=${oe}; ${q}<${ae}; ${q}++)` + super.render(L);
      }
      get names() {
        const L = M(super.names, this.from);
        return M(L, this.to);
      }
    }
    class v extends p {
      constructor(L, N, q, oe) {
        super(), this.loop = L, this.varKind = N, this.name = q, this.iterable = oe;
      }
      render(L) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(L);
      }
      optimizeNames(L, N) {
        if (super.optimizeNames(L, N))
          return this.iterable = w(this.iterable, L, N), this;
      }
      get names() {
        return E(super.names, this.iterable.names);
      }
    }
    class x extends h {
      constructor(L, N, q) {
        super(), this.name = L, this.args = N, this.async = q;
      }
      render(L) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(L);
      }
    }
    x.kind = "func";
    class C extends d {
      render(L) {
        return "return " + super.render(L);
      }
    }
    C.kind = "return";
    class P extends h {
      render(L) {
        let N = "try" + super.render(L);
        return this.catch && (N += this.catch.render(L)), this.finally && (N += this.finally.render(L)), N;
      }
      optimizeNodes() {
        var L, N;
        return super.optimizeNodes(), (L = this.catch) === null || L === void 0 || L.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(L, N) {
        var q, oe;
        return super.optimizeNames(L, N), (q = this.catch) === null || q === void 0 || q.optimizeNames(L, N), (oe = this.finally) === null || oe === void 0 || oe.optimizeNames(L, N), this;
      }
      get names() {
        const L = super.names;
        return this.catch && E(L, this.catch.names), this.finally && E(L, this.finally.names), L;
      }
    }
    class R extends h {
      constructor(L) {
        super(), this.error = L;
      }
      render(L) {
        return `catch(${this.error})` + super.render(L);
      }
    }
    R.kind = "catch";
    class S extends h {
      render(L) {
        return "finally" + super.render(L);
      }
    }
    S.kind = "finally";
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
        const q = this._extScope.value(L, N);
        return (this._values[q.prefix] || (this._values[q.prefix] = /* @__PURE__ */ new Set())).add(q), q;
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
      _def(L, N, q, oe) {
        const ae = this._scope.toName(N);
        return q !== void 0 && oe && (this._constants[ae.str] = q), this._leafNode(new l(L, ae, q)), ae;
      }
      // `const` declaration (`var` in es5 mode)
      const(L, N, q) {
        return this._def(t.varKinds.const, L, N, q);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(L, N, q) {
        return this._def(t.varKinds.let, L, N, q);
      }
      // `var` declaration with optional assignment
      var(L, N, q) {
        return this._def(t.varKinds.var, L, N, q);
      }
      // assignment code
      assign(L, N, q) {
        return this._leafNode(new A(L, N, q));
      }
      // `+=` code
      add(L, N) {
        return this._leafNode(new c(L, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(L) {
        return typeof L == "function" ? L() : L !== r.nil && this._leafNode(new g(L)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...L) {
        const N = ["{"];
        for (const [q, oe] of L)
          N.length > 1 && N.push(","), N.push(q), (q !== oe || this.opts.es5) && (N.push(":"), (0, r.addCodeArg)(N, oe));
        return N.push("}"), new r._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(L, N, q) {
        if (this._blockNode(new m(L)), N && q)
          this.code(N).else().code(q).endIf();
        else if (N)
          this.code(N).endIf();
        else if (q)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(L) {
        return this._elseNode(new m(L));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new y());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(m, y);
      }
      _for(L, N) {
        return this._blockNode(L), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(L, N) {
        return this._for(new _(L), N);
      }
      // `for` statement for a range of values
      forRange(L, N, q, oe, ae = this.opts.es5 ? t.varKinds.var : t.varKinds.let) {
        const le = this._scope.toName(L);
        return this._for(new T(ae, le, N, q), () => oe(le));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(L, N, q, oe = t.varKinds.const) {
        const ae = this._scope.toName(L);
        if (this.opts.es5) {
          const le = N instanceof r.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, r._)`${le}.length`, (Ae) => {
            this.var(ae, (0, r._)`${le}[${Ae}]`), q(ae);
          });
        }
        return this._for(new v("of", oe, ae, N), () => q(ae));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(L, N, q, oe = this.opts.es5 ? t.varKinds.var : t.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(L, (0, r._)`Object.keys(${N})`, q);
        const ae = this._scope.toName(L);
        return this._for(new v("in", oe, ae, N), () => q(ae));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(p);
      }
      // `label` statement
      label(L) {
        return this._leafNode(new n(L));
      }
      // `break` statement
      break(L) {
        return this._leafNode(new o(L));
      }
      // `return` statement
      return(L) {
        const N = new C();
        if (this._blockNode(N), this.code(L), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(C);
      }
      // `try` statement
      try(L, N, q) {
        if (!N && !q)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const oe = new P();
        if (this._blockNode(oe), this.code(L), N) {
          const ae = this.name("e");
          this._currNode = oe.catch = new R(ae), N(ae);
        }
        return q && (this._currNode = oe.finally = new S(), this.code(q)), this._endBlockNode(R, S);
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
        const q = this._nodes.length - N;
        if (q < 0 || L !== void 0 && q !== L)
          throw new Error(`CodeGen: wrong number of nodes: ${q} vs ${L} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(L, N = r.nil, q, oe) {
        return this._blockNode(new x(L, N, q)), oe && this.code(oe).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(x);
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
        const q = this._currNode;
        if (q instanceof L || N && q instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${L.kind}/${N.kind}` : L.kind}"`);
      }
      _elseNode(L) {
        const N = this._currNode;
        if (!(N instanceof m))
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
    function E($, L) {
      for (const N in L)
        $[N] = ($[N] || 0) + (L[N] || 0);
      return $;
    }
    function M($, L) {
      return L instanceof r._CodeOrName ? E($, L.names) : $;
    }
    function w($, L, N) {
      if ($ instanceof r.Name)
        return q($);
      if (!oe($))
        return $;
      return new r._Code($._items.reduce((ae, le) => (le instanceof r.Name && (le = q(le)), le instanceof r._Code ? ae.push(...le._items) : ae.push(le), ae), []));
      function q(ae) {
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
    const Y = B(e.operators.AND);
    function ne(...$) {
      return $.reduce(Y);
    }
    e.and = ne;
    const Z = B(e.operators.OR);
    function Q(...$) {
      return $.reduce(Z);
    }
    e.or = Q;
    function B($) {
      return (L, N) => L === r.nil ? N : N === r.nil ? L : (0, r._)`${F(L)} ${$} ${F(N)}`;
    }
    function F($) {
      return $ instanceof r.Name ? $ : (0, r._)`(${$})`;
    }
  })(pa)), pa;
}
var me = {}, vn;
function xe() {
  if (vn) return me;
  vn = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.checkStrictMode = me.getErrorPath = me.Type = me.useFunc = me.setEvaluated = me.evaluatedPropsToName = me.mergeEvaluated = me.eachItem = me.unescapeJsonPointer = me.escapeJsonPointer = me.escapeFragment = me.unescapeFragment = me.schemaRefOrVal = me.schemaHasRulesButRef = me.schemaHasRules = me.checkUnknownRules = me.alwaysValidSchema = me.toHash = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ jr();
  function t(v) {
    const x = {};
    for (const C of v)
      x[C] = !0;
    return x;
  }
  me.toHash = t;
  function i(v, x) {
    return typeof x == "boolean" ? x : Object.keys(x).length === 0 ? !0 : (a(v, x), !s(x, v.self.RULES.all));
  }
  me.alwaysValidSchema = i;
  function a(v, x = v.schema) {
    const { opts: C, self: P } = v;
    if (!C.strictSchema || typeof x == "boolean")
      return;
    const R = P.RULES.keywords;
    for (const S in x)
      R[S] || T(v, `unknown keyword: "${S}"`);
  }
  me.checkUnknownRules = a;
  function s(v, x) {
    if (typeof v == "boolean")
      return !v;
    for (const C in v)
      if (x[C])
        return !0;
    return !1;
  }
  me.schemaHasRules = s;
  function l(v, x) {
    if (typeof v == "boolean")
      return !v;
    for (const C in v)
      if (C !== "$ref" && x.all[C])
        return !0;
    return !1;
  }
  me.schemaHasRulesButRef = l;
  function A({ topSchemaRef: v, schemaPath: x }, C, P, R) {
    if (!R) {
      if (typeof C == "number" || typeof C == "boolean")
        return C;
      if (typeof C == "string")
        return (0, e._)`${C}`;
    }
    return (0, e._)`${v}${x}${(0, e.getProperty)(P)}`;
  }
  me.schemaRefOrVal = A;
  function c(v) {
    return f(decodeURIComponent(v));
  }
  me.unescapeFragment = c;
  function n(v) {
    return encodeURIComponent(o(v));
  }
  me.escapeFragment = n;
  function o(v) {
    return typeof v == "number" ? `${v}` : v.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  me.escapeJsonPointer = o;
  function f(v) {
    return v.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  me.unescapeJsonPointer = f;
  function g(v, x) {
    if (Array.isArray(v))
      for (const C of v)
        x(C);
    else
      x(v);
  }
  me.eachItem = g;
  function d({ mergeNames: v, mergeToName: x, mergeValues: C, resultToName: P }) {
    return (R, S, O, E) => {
      const M = O === void 0 ? S : O instanceof e.Name ? (S instanceof e.Name ? v(R, S, O) : x(R, S, O), O) : S instanceof e.Name ? (x(R, O, S), S) : C(S, O);
      return E === e.Name && !(M instanceof e.Name) ? P(R, M) : M;
    };
  }
  me.mergeEvaluated = {
    props: d({
      mergeNames: (v, x, C) => v.if((0, e._)`${C} !== true && ${x} !== undefined`, () => {
        v.if((0, e._)`${x} === true`, () => v.assign(C, !0), () => v.assign(C, (0, e._)`${C} || {}`).code((0, e._)`Object.assign(${C}, ${x})`));
      }),
      mergeToName: (v, x, C) => v.if((0, e._)`${C} !== true`, () => {
        x === !0 ? v.assign(C, !0) : (v.assign(C, (0, e._)`${C} || {}`), u(v, C, x));
      }),
      mergeValues: (v, x) => v === !0 ? !0 : { ...v, ...x },
      resultToName: h
    }),
    items: d({
      mergeNames: (v, x, C) => v.if((0, e._)`${C} !== true && ${x} !== undefined`, () => v.assign(C, (0, e._)`${x} === true ? true : ${C} > ${x} ? ${C} : ${x}`)),
      mergeToName: (v, x, C) => v.if((0, e._)`${C} !== true`, () => v.assign(C, x === !0 ? !0 : (0, e._)`${C} > ${x} ? ${C} : ${x}`)),
      mergeValues: (v, x) => v === !0 ? !0 : Math.max(v, x),
      resultToName: (v, x) => v.var("items", x)
    })
  };
  function h(v, x) {
    if (x === !0)
      return v.var("props", !0);
    const C = v.var("props", (0, e._)`{}`);
    return x !== void 0 && u(v, C, x), C;
  }
  me.evaluatedPropsToName = h;
  function u(v, x, C) {
    Object.keys(C).forEach((P) => v.assign((0, e._)`${x}${(0, e.getProperty)(P)}`, !0));
  }
  me.setEvaluated = u;
  const y = {};
  function m(v, x) {
    return v.scopeValue("func", {
      ref: x,
      code: y[x.code] || (y[x.code] = new r._Code(x.code))
    });
  }
  me.useFunc = m;
  var p;
  (function(v) {
    v[v.Num = 0] = "Num", v[v.Str = 1] = "Str";
  })(p || (me.Type = p = {}));
  function _(v, x, C) {
    if (v instanceof e.Name) {
      const P = x === p.Num;
      return C ? P ? (0, e._)`"[" + ${v} + "]"` : (0, e._)`"['" + ${v} + "']"` : P ? (0, e._)`"/" + ${v}` : (0, e._)`"/" + ${v}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return C ? (0, e.getProperty)(v).toString() : "/" + o(v);
  }
  me.getErrorPath = _;
  function T(v, x, C = v.opts.strictSchema) {
    if (C) {
      if (x = `strict mode: ${x}`, C === !0)
        throw new Error(x);
      v.self.logger.warn(x);
    }
  }
  return me.checkStrictMode = T, me;
}
var rr = {}, bn;
function ct() {
  if (bn) return rr;
  bn = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
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
  return rr.default = r, rr;
}
var wn;
function Zr() {
  return wn || (wn = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ xe(), i = /* @__PURE__ */ ct();
    e.keywordError = {
      message: ({ keyword: y }) => (0, r.str)`must pass "${y}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: y, schemaType: m }) => m ? (0, r.str)`"${y}" keyword must be ${m} ($data)` : (0, r.str)`"${y}" keyword is invalid ($data)`
    };
    function a(y, m = e.keywordError, p, _) {
      const { it: T } = y, { gen: v, compositeRule: x, allErrors: C } = T, P = f(y, m, p);
      _ ?? (x || C) ? c(v, P) : n(T, (0, r._)`[${P}]`);
    }
    e.reportError = a;
    function s(y, m = e.keywordError, p) {
      const { it: _ } = y, { gen: T, compositeRule: v, allErrors: x } = _, C = f(y, m, p);
      c(T, C), v || x || n(_, i.default.vErrors);
    }
    e.reportExtraError = s;
    function l(y, m) {
      y.assign(i.default.errors, m), y.if((0, r._)`${i.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, r._)`${i.default.vErrors}.length`, m), () => y.assign(i.default.vErrors, null)));
    }
    e.resetErrorsCount = l;
    function A({ gen: y, keyword: m, schemaValue: p, data: _, errsCount: T, it: v }) {
      if (T === void 0)
        throw new Error("ajv implementation error");
      const x = y.name("err");
      y.forRange("i", T, i.default.errors, (C) => {
        y.const(x, (0, r._)`${i.default.vErrors}[${C}]`), y.if((0, r._)`${x}.instancePath === undefined`, () => y.assign((0, r._)`${x}.instancePath`, (0, r.strConcat)(i.default.instancePath, v.errorPath))), y.assign((0, r._)`${x}.schemaPath`, (0, r.str)`${v.errSchemaPath}/${m}`), v.opts.verbose && (y.assign((0, r._)`${x}.schema`, p), y.assign((0, r._)`${x}.data`, _));
      });
    }
    e.extendErrors = A;
    function c(y, m) {
      const p = y.const("err", m);
      y.if((0, r._)`${i.default.vErrors} === null`, () => y.assign(i.default.vErrors, (0, r._)`[${p}]`), (0, r._)`${i.default.vErrors}.push(${p})`), y.code((0, r._)`${i.default.errors}++`);
    }
    function n(y, m) {
      const { gen: p, validateName: _, schemaEnv: T } = y;
      T.$async ? p.throw((0, r._)`new ${y.ValidationError}(${m})`) : (p.assign((0, r._)`${_}.errors`, m), p.return(!1));
    }
    const o = {
      keyword: new r.Name("keyword"),
      schemaPath: new r.Name("schemaPath"),
      // also used in JTD errors
      params: new r.Name("params"),
      propertyName: new r.Name("propertyName"),
      message: new r.Name("message"),
      schema: new r.Name("schema"),
      parentSchema: new r.Name("parentSchema")
    };
    function f(y, m, p) {
      const { createErrors: _ } = y.it;
      return _ === !1 ? (0, r._)`{}` : g(y, m, p);
    }
    function g(y, m, p = {}) {
      const { gen: _, it: T } = y, v = [
        d(T, p),
        h(y, p)
      ];
      return u(y, m, v), _.object(...v);
    }
    function d({ errorPath: y }, { instancePath: m }) {
      const p = m ? (0, r.str)`${y}${(0, t.getErrorPath)(m, t.Type.Str)}` : y;
      return [i.default.instancePath, (0, r.strConcat)(i.default.instancePath, p)];
    }
    function h({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: p, parentSchema: _ }) {
      let T = _ ? m : (0, r.str)`${m}/${y}`;
      return p && (T = (0, r.str)`${T}${(0, t.getErrorPath)(p, t.Type.Str)}`), [o.schemaPath, T];
    }
    function u(y, { params: m, message: p }, _) {
      const { keyword: T, data: v, schemaValue: x, it: C } = y, { opts: P, propertyName: R, topSchemaRef: S, schemaPath: O } = C;
      _.push([o.keyword, T], [o.params, typeof m == "function" ? m(y) : m || (0, r._)`{}`]), P.messages && _.push([o.message, typeof p == "function" ? p(y) : p]), P.verbose && _.push([o.schema, x], [o.parentSchema, (0, r._)`${S}${O}`], [i.default.data, v]), R && _.push([o.propertyName, R]);
    }
  })(ha)), ha;
}
var _n;
function Hl() {
  if (_n) return ut;
  _n = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.boolOrEmptySchema = ut.topBoolOrEmptySchema = void 0;
  const e = /* @__PURE__ */ Zr(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ ct(), i = {
    message: "boolean schema is false"
  };
  function a(A) {
    const { gen: c, schema: n, validateName: o } = A;
    n === !1 ? l(A, !1) : typeof n == "object" && n.$async === !0 ? c.return(t.default.data) : (c.assign((0, r._)`${o}.errors`, null), c.return(!0));
  }
  ut.topBoolOrEmptySchema = a;
  function s(A, c) {
    const { gen: n, schema: o } = A;
    o === !1 ? (n.var(c, !1), l(A)) : n.var(c, !0);
  }
  ut.boolOrEmptySchema = s;
  function l(A, c) {
    const { gen: n, data: o } = A, f = {
      gen: n,
      keyword: "false schema",
      data: o,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: A
    };
    (0, e.reportError)(f, i, void 0, c);
  }
  return ut;
}
var Ne = {}, ht = {}, xn;
function lo() {
  if (xn) return ht;
  xn = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.getRules = ht.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], r = new Set(e);
  function t(a) {
    return typeof a == "string" && r.has(a);
  }
  ht.isJSONType = t;
  function i() {
    const a = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...a, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, a.number, a.string, a.array, a.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ht.getRules = i, ht;
}
var Ze = {}, Cn;
function co() {
  if (Cn) return Ze;
  Cn = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.shouldUseRule = Ze.shouldUseGroup = Ze.schemaHasRulesForType = void 0;
  function e({ schema: i, self: a }, s) {
    const l = a.RULES.types[s];
    return l && l !== !0 && r(i, l);
  }
  Ze.schemaHasRulesForType = e;
  function r(i, a) {
    return a.rules.some((s) => t(i, s));
  }
  Ze.shouldUseGroup = r;
  function t(i, a) {
    var s;
    return i[a.keyword] !== void 0 || ((s = a.definition.implements) === null || s === void 0 ? void 0 : s.some((l) => i[l] !== void 0));
  }
  return Ze.shouldUseRule = t, Ze;
}
var Tn;
function Yr() {
  if (Tn) return Ne;
  Tn = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.reportTypeError = Ne.checkDataTypes = Ne.checkDataType = Ne.coerceAndCheckDataType = Ne.getJSONTypes = Ne.getSchemaTypes = Ne.DataType = void 0;
  const e = /* @__PURE__ */ lo(), r = /* @__PURE__ */ co(), t = /* @__PURE__ */ Zr(), i = /* @__PURE__ */ ge(), a = /* @__PURE__ */ xe();
  var s;
  (function(p) {
    p[p.Correct = 0] = "Correct", p[p.Wrong = 1] = "Wrong";
  })(s || (Ne.DataType = s = {}));
  function l(p) {
    const _ = A(p.type);
    if (_.includes("null")) {
      if (p.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!_.length && p.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      p.nullable === !0 && _.push("null");
    }
    return _;
  }
  Ne.getSchemaTypes = l;
  function A(p) {
    const _ = Array.isArray(p) ? p : p ? [p] : [];
    if (_.every(e.isJSONType))
      return _;
    throw new Error("type must be JSONType or JSONType[]: " + _.join(","));
  }
  Ne.getJSONTypes = A;
  function c(p, _) {
    const { gen: T, data: v, opts: x } = p, C = o(_, x.coerceTypes), P = _.length > 0 && !(C.length === 0 && _.length === 1 && (0, r.schemaHasRulesForType)(p, _[0]));
    if (P) {
      const R = h(_, v, x.strictNumbers, s.Wrong);
      T.if(R, () => {
        C.length ? f(p, _, C) : y(p);
      });
    }
    return P;
  }
  Ne.coerceAndCheckDataType = c;
  const n = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function o(p, _) {
    return _ ? p.filter((T) => n.has(T) || _ === "array" && T === "array") : [];
  }
  function f(p, _, T) {
    const { gen: v, data: x, opts: C } = p, P = v.let("dataType", (0, i._)`typeof ${x}`), R = v.let("coerced", (0, i._)`undefined`);
    C.coerceTypes === "array" && v.if((0, i._)`${P} == 'object' && Array.isArray(${x}) && ${x}.length == 1`, () => v.assign(x, (0, i._)`${x}[0]`).assign(P, (0, i._)`typeof ${x}`).if(h(_, x, C.strictNumbers), () => v.assign(R, x))), v.if((0, i._)`${R} !== undefined`);
    for (const O of T)
      (n.has(O) || O === "array" && C.coerceTypes === "array") && S(O);
    v.else(), y(p), v.endIf(), v.if((0, i._)`${R} !== undefined`, () => {
      v.assign(x, R), g(p, R);
    });
    function S(O) {
      switch (O) {
        case "string":
          v.elseIf((0, i._)`${P} == "number" || ${P} == "boolean"`).assign(R, (0, i._)`"" + ${x}`).elseIf((0, i._)`${x} === null`).assign(R, (0, i._)`""`);
          return;
        case "number":
          v.elseIf((0, i._)`${P} == "boolean" || ${x} === null
              || (${P} == "string" && ${x} && ${x} == +${x})`).assign(R, (0, i._)`+${x}`);
          return;
        case "integer":
          v.elseIf((0, i._)`${P} === "boolean" || ${x} === null
              || (${P} === "string" && ${x} && ${x} == +${x} && !(${x} % 1))`).assign(R, (0, i._)`+${x}`);
          return;
        case "boolean":
          v.elseIf((0, i._)`${x} === "false" || ${x} === 0 || ${x} === null`).assign(R, !1).elseIf((0, i._)`${x} === "true" || ${x} === 1`).assign(R, !0);
          return;
        case "null":
          v.elseIf((0, i._)`${x} === "" || ${x} === 0 || ${x} === false`), v.assign(R, null);
          return;
        case "array":
          v.elseIf((0, i._)`${P} === "string" || ${P} === "number"
              || ${P} === "boolean" || ${x} === null`).assign(R, (0, i._)`[${x}]`);
      }
    }
  }
  function g({ gen: p, parentData: _, parentDataProperty: T }, v) {
    p.if((0, i._)`${_} !== undefined`, () => p.assign((0, i._)`${_}[${T}]`, v));
  }
  function d(p, _, T, v = s.Correct) {
    const x = v === s.Correct ? i.operators.EQ : i.operators.NEQ;
    let C;
    switch (p) {
      case "null":
        return (0, i._)`${_} ${x} null`;
      case "array":
        C = (0, i._)`Array.isArray(${_})`;
        break;
      case "object":
        C = (0, i._)`${_} && typeof ${_} == "object" && !Array.isArray(${_})`;
        break;
      case "integer":
        C = P((0, i._)`!(${_} % 1) && !isNaN(${_})`);
        break;
      case "number":
        C = P();
        break;
      default:
        return (0, i._)`typeof ${_} ${x} ${p}`;
    }
    return v === s.Correct ? C : (0, i.not)(C);
    function P(R = i.nil) {
      return (0, i.and)((0, i._)`typeof ${_} == "number"`, R, T ? (0, i._)`isFinite(${_})` : i.nil);
    }
  }
  Ne.checkDataType = d;
  function h(p, _, T, v) {
    if (p.length === 1)
      return d(p[0], _, T, v);
    let x;
    const C = (0, a.toHash)(p);
    if (C.array && C.object) {
      const P = (0, i._)`typeof ${_} != "object"`;
      x = C.null ? P : (0, i._)`!${_} || ${P}`, delete C.null, delete C.array, delete C.object;
    } else
      x = i.nil;
    C.number && delete C.integer;
    for (const P in C)
      x = (0, i.and)(x, d(P, _, T, v));
    return x;
  }
  Ne.checkDataTypes = h;
  const u = {
    message: ({ schema: p }) => `must be ${p}`,
    params: ({ schema: p, schemaValue: _ }) => typeof p == "string" ? (0, i._)`{type: ${p}}` : (0, i._)`{type: ${_}}`
  };
  function y(p) {
    const _ = m(p);
    (0, t.reportError)(_, u);
  }
  Ne.reportTypeError = y;
  function m(p) {
    const { gen: _, data: T, schema: v } = p, x = (0, a.schemaRefOrVal)(p, v, "type");
    return {
      gen: _,
      keyword: "type",
      data: T,
      schema: v.type,
      schemaCode: x,
      schemaValue: x,
      parentSchema: v,
      params: {},
      it: p
    };
  }
  return Ne;
}
var St = {}, En;
function Wl() {
  if (En) return St;
  En = 1, Object.defineProperty(St, "__esModule", { value: !0 }), St.assignDefaults = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe();
  function t(a, s) {
    const { properties: l, items: A } = a.schema;
    if (s === "object" && l)
      for (const c in l)
        i(a, c, l[c].default);
    else s === "array" && Array.isArray(A) && A.forEach((c, n) => i(a, n, c.default));
  }
  St.assignDefaults = t;
  function i(a, s, l) {
    const { gen: A, compositeRule: c, data: n, opts: o } = a;
    if (l === void 0)
      return;
    const f = (0, e._)`${n}${(0, e.getProperty)(s)}`;
    if (c) {
      (0, r.checkStrictMode)(a, `default is ignored for: ${f}`);
      return;
    }
    let g = (0, e._)`${f} === undefined`;
    o.useDefaults === "empty" && (g = (0, e._)`${g} || ${f} === null || ${f} === ""`), A.if(g, (0, e._)`${f} = ${(0, e.stringify)(l)}`);
  }
  return St;
}
var We = {}, Ee = {}, Ln;
function Ve() {
  if (Ln) return Ee;
  Ln = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.validateUnion = Ee.validateArray = Ee.usePattern = Ee.callValidateCode = Ee.schemaProperties = Ee.allSchemaProperties = Ee.noPropertyInData = Ee.propertyInData = Ee.isOwnProperty = Ee.hasPropFunc = Ee.reportMissingProp = Ee.checkMissingProp = Ee.checkReportMissingProp = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ ct(), i = /* @__PURE__ */ xe();
  function a(p, _) {
    const { gen: T, data: v, it: x } = p;
    T.if(o(T, v, _, x.opts.ownProperties), () => {
      p.setParams({ missingProperty: (0, e._)`${_}` }, !0), p.error();
    });
  }
  Ee.checkReportMissingProp = a;
  function s({ gen: p, data: _, it: { opts: T } }, v, x) {
    return (0, e.or)(...v.map((C) => (0, e.and)(o(p, _, C, T.ownProperties), (0, e._)`${x} = ${C}`)));
  }
  Ee.checkMissingProp = s;
  function l(p, _) {
    p.setParams({ missingProperty: _ }, !0), p.error();
  }
  Ee.reportMissingProp = l;
  function A(p) {
    return p.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Ee.hasPropFunc = A;
  function c(p, _, T) {
    return (0, e._)`${A(p)}.call(${_}, ${T})`;
  }
  Ee.isOwnProperty = c;
  function n(p, _, T, v) {
    const x = (0, e._)`${_}${(0, e.getProperty)(T)} !== undefined`;
    return v ? (0, e._)`${x} && ${c(p, _, T)}` : x;
  }
  Ee.propertyInData = n;
  function o(p, _, T, v) {
    const x = (0, e._)`${_}${(0, e.getProperty)(T)} === undefined`;
    return v ? (0, e.or)(x, (0, e.not)(c(p, _, T))) : x;
  }
  Ee.noPropertyInData = o;
  function f(p) {
    return p ? Object.keys(p).filter((_) => _ !== "__proto__") : [];
  }
  Ee.allSchemaProperties = f;
  function g(p, _) {
    return f(_).filter((T) => !(0, r.alwaysValidSchema)(p, _[T]));
  }
  Ee.schemaProperties = g;
  function d({ schemaCode: p, data: _, it: { gen: T, topSchemaRef: v, schemaPath: x, errorPath: C }, it: P }, R, S, O) {
    const E = O ? (0, e._)`${p}, ${_}, ${v}${x}` : _, M = [
      [t.default.instancePath, (0, e.strConcat)(t.default.instancePath, C)],
      [t.default.parentData, P.parentData],
      [t.default.parentDataProperty, P.parentDataProperty],
      [t.default.rootData, t.default.rootData]
    ];
    P.opts.dynamicRef && M.push([t.default.dynamicAnchors, t.default.dynamicAnchors]);
    const w = (0, e._)`${E}, ${T.object(...M)}`;
    return S !== e.nil ? (0, e._)`${R}.call(${S}, ${w})` : (0, e._)`${R}(${w})`;
  }
  Ee.callValidateCode = d;
  const h = (0, e._)`new RegExp`;
  function u({ gen: p, it: { opts: _ } }, T) {
    const v = _.unicodeRegExp ? "u" : "", { regExp: x } = _.code, C = x(T, v);
    return p.scopeValue("pattern", {
      key: C.toString(),
      ref: C,
      code: (0, e._)`${x.code === "new RegExp" ? h : (0, i.useFunc)(p, x)}(${T}, ${v})`
    });
  }
  Ee.usePattern = u;
  function y(p) {
    const { gen: _, data: T, keyword: v, it: x } = p, C = _.name("valid");
    if (x.allErrors) {
      const R = _.let("valid", !0);
      return P(() => _.assign(R, !1)), R;
    }
    return _.var(C, !0), P(() => _.break()), C;
    function P(R) {
      const S = _.const("len", (0, e._)`${T}.length`);
      _.forRange("i", 0, S, (O) => {
        p.subschema({
          keyword: v,
          dataProp: O,
          dataPropType: r.Type.Num
        }, C), _.if((0, e.not)(C), R);
      });
    }
  }
  Ee.validateArray = y;
  function m(p) {
    const { gen: _, schema: T, keyword: v, it: x } = p;
    if (!Array.isArray(T))
      throw new Error("ajv implementation error");
    if (T.some((S) => (0, r.alwaysValidSchema)(x, S)) && !x.opts.unevaluated)
      return;
    const P = _.let("valid", !1), R = _.name("_valid");
    _.block(() => T.forEach((S, O) => {
      const E = p.subschema({
        keyword: v,
        schemaProp: O,
        compositeRule: !0
      }, R);
      _.assign(P, (0, e._)`${P} || ${R}`), p.mergeValidEvaluated(E, R) || _.if((0, e.not)(P));
    })), p.result(P, () => p.reset(), () => p.error(!0));
  }
  return Ee.validateUnion = m, Ee;
}
var Dn;
function ql() {
  if (Dn) return We;
  Dn = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.validateKeywordUsage = We.validSchemaType = We.funcKeywordCode = We.macroKeywordCode = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ ct(), t = /* @__PURE__ */ Ve(), i = /* @__PURE__ */ Zr();
  function a(g, d) {
    const { gen: h, keyword: u, schema: y, parentSchema: m, it: p } = g, _ = d.macro.call(p.self, y, m, p), T = n(h, u, _);
    p.opts.validateSchema !== !1 && p.self.validateSchema(_, !0);
    const v = h.name("valid");
    g.subschema({
      schema: _,
      schemaPath: e.nil,
      errSchemaPath: `${p.errSchemaPath}/${u}`,
      topSchemaRef: T,
      compositeRule: !0
    }, v), g.pass(v, () => g.error(!0));
  }
  We.macroKeywordCode = a;
  function s(g, d) {
    var h;
    const { gen: u, keyword: y, schema: m, parentSchema: p, $data: _, it: T } = g;
    c(T, d);
    const v = !_ && d.compile ? d.compile.call(T.self, m, p, T) : d.validate, x = n(u, y, v), C = u.let("valid");
    g.block$data(C, P), g.ok((h = d.valid) !== null && h !== void 0 ? h : C);
    function P() {
      if (d.errors === !1)
        O(), d.modifying && l(g), E(() => g.error());
      else {
        const M = d.async ? R() : S();
        d.modifying && l(g), E(() => A(g, M));
      }
    }
    function R() {
      const M = u.let("ruleErrs", null);
      return u.try(() => O((0, e._)`await `), (w) => u.assign(C, !1).if((0, e._)`${w} instanceof ${T.ValidationError}`, () => u.assign(M, (0, e._)`${w}.errors`), () => u.throw(w))), M;
    }
    function S() {
      const M = (0, e._)`${x}.errors`;
      return u.assign(M, null), O(e.nil), M;
    }
    function O(M = d.async ? (0, e._)`await ` : e.nil) {
      const w = T.opts.passContext ? r.default.this : r.default.self, G = !("compile" in d && !_ || d.schema === !1);
      u.assign(C, (0, e._)`${M}${(0, t.callValidateCode)(g, x, w, G)}`, d.modifying);
    }
    function E(M) {
      var w;
      u.if((0, e.not)((w = d.valid) !== null && w !== void 0 ? w : C), M);
    }
  }
  We.funcKeywordCode = s;
  function l(g) {
    const { gen: d, data: h, it: u } = g;
    d.if(u.parentData, () => d.assign(h, (0, e._)`${u.parentData}[${u.parentDataProperty}]`));
  }
  function A(g, d) {
    const { gen: h } = g;
    h.if((0, e._)`Array.isArray(${d})`, () => {
      h.assign(r.default.vErrors, (0, e._)`${r.default.vErrors} === null ? ${d} : ${r.default.vErrors}.concat(${d})`).assign(r.default.errors, (0, e._)`${r.default.vErrors}.length`), (0, i.extendErrors)(g);
    }, () => g.error());
  }
  function c({ schemaEnv: g }, d) {
    if (d.async && !g.$async)
      throw new Error("async keyword in sync schema");
  }
  function n(g, d, h) {
    if (h === void 0)
      throw new Error(`keyword "${d}" failed to compile`);
    return g.scopeValue("keyword", typeof h == "function" ? { ref: h } : { ref: h, code: (0, e.stringify)(h) });
  }
  function o(g, d, h = !1) {
    return !d.length || d.some((u) => u === "array" ? Array.isArray(g) : u === "object" ? g && typeof g == "object" && !Array.isArray(g) : typeof g == u || h && typeof g > "u");
  }
  We.validSchemaType = o;
  function f({ schema: g, opts: d, self: h, errSchemaPath: u }, y, m) {
    if (Array.isArray(y.keyword) ? !y.keyword.includes(m) : y.keyword !== m)
      throw new Error("ajv implementation error");
    const p = y.dependencies;
    if (p?.some((_) => !Object.prototype.hasOwnProperty.call(g, _)))
      throw new Error(`parent schema must have dependencies of ${m}: ${p.join(",")}`);
    if (y.validateSchema && !y.validateSchema(g[m])) {
      const T = `keyword "${m}" value is invalid at path "${u}": ` + h.errorsText(y.validateSchema.errors);
      if (d.validateSchema === "log")
        h.logger.error(T);
      else
        throw new Error(T);
    }
  }
  return We.validateKeywordUsage = f, We;
}
var et = {}, Rn;
function Vl() {
  if (Rn) return et;
  Rn = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.extendSubschemaMode = et.extendSubschemaData = et.getSubschema = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe();
  function t(s, { keyword: l, schemaProp: A, schema: c, schemaPath: n, errSchemaPath: o, topSchemaRef: f }) {
    if (l !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (l !== void 0) {
      const g = s.schema[l];
      return A === void 0 ? {
        schema: g,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(l)}`,
        errSchemaPath: `${s.errSchemaPath}/${l}`
      } : {
        schema: g[A],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(l)}${(0, e.getProperty)(A)}`,
        errSchemaPath: `${s.errSchemaPath}/${l}/${(0, r.escapeFragment)(A)}`
      };
    }
    if (c !== void 0) {
      if (n === void 0 || o === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: n,
        topSchemaRef: f,
        errSchemaPath: o
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  et.getSubschema = t;
  function i(s, l, { dataProp: A, dataPropType: c, data: n, dataTypes: o, propertyName: f }) {
    if (n !== void 0 && A !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: g } = l;
    if (A !== void 0) {
      const { errorPath: h, dataPathArr: u, opts: y } = l, m = g.let("data", (0, e._)`${l.data}${(0, e.getProperty)(A)}`, !0);
      d(m), s.errorPath = (0, e.str)`${h}${(0, r.getErrorPath)(A, c, y.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${A}`, s.dataPathArr = [...u, s.parentDataProperty];
    }
    if (n !== void 0) {
      const h = n instanceof e.Name ? n : g.let("data", n, !0);
      d(h), f !== void 0 && (s.propertyName = f);
    }
    o && (s.dataTypes = o);
    function d(h) {
      s.data = h, s.dataLevel = l.dataLevel + 1, s.dataTypes = [], l.definedProperties = /* @__PURE__ */ new Set(), s.parentData = l.data, s.dataNames = [...l.dataNames, h];
    }
  }
  et.extendSubschemaData = i;
  function a(s, { jtdDiscriminator: l, jtdMetadata: A, compositeRule: c, createErrors: n, allErrors: o }) {
    c !== void 0 && (s.compositeRule = c), n !== void 0 && (s.createErrors = n), o !== void 0 && (s.allErrors = o), s.jtdDiscriminator = l, s.jtdMetadata = A;
  }
  return et.extendSubschemaMode = a, et;
}
var ke = {}, ya, Bn;
function Ao() {
  return Bn || (Bn = 1, ya = function e(r, t) {
    if (r === t) return !0;
    if (r && t && typeof r == "object" && typeof t == "object") {
      if (r.constructor !== t.constructor) return !1;
      var i, a, s;
      if (Array.isArray(r)) {
        if (i = r.length, i != t.length) return !1;
        for (a = i; a-- !== 0; )
          if (!e(r[a], t[a])) return !1;
        return !0;
      }
      if (r.constructor === RegExp) return r.source === t.source && r.flags === t.flags;
      if (r.valueOf !== Object.prototype.valueOf) return r.valueOf() === t.valueOf();
      if (r.toString !== Object.prototype.toString) return r.toString() === t.toString();
      if (s = Object.keys(r), i = s.length, i !== Object.keys(t).length) return !1;
      for (a = i; a-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(t, s[a])) return !1;
      for (a = i; a-- !== 0; ) {
        var l = s[a];
        if (!e(r[l], t[l])) return !1;
      }
      return !0;
    }
    return r !== r && t !== t;
  }), ya;
}
var va = { exports: {} }, Pn;
function Ql() {
  if (Pn) return va.exports;
  Pn = 1;
  var e = va.exports = function(i, a, s) {
    typeof a == "function" && (s = a, a = {}), s = a.cb || s;
    var l = typeof s == "function" ? s : s.pre || function() {
    }, A = s.post || function() {
    };
    r(a, l, A, i, "", i);
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
  function r(i, a, s, l, A, c, n, o, f, g) {
    if (l && typeof l == "object" && !Array.isArray(l)) {
      a(l, A, c, n, o, f, g);
      for (var d in l) {
        var h = l[d];
        if (Array.isArray(h)) {
          if (d in e.arrayKeywords)
            for (var u = 0; u < h.length; u++)
              r(i, a, s, h[u], A + "/" + d + "/" + u, c, A, d, l, u);
        } else if (d in e.propsKeywords) {
          if (h && typeof h == "object")
            for (var y in h)
              r(i, a, s, h[y], A + "/" + d + "/" + t(y), c, A, d, l, y);
        } else (d in e.keywords || i.allKeys && !(d in e.skipKeywords)) && r(i, a, s, h, A + "/" + d, c, A, d, l);
      }
      s(l, A, c, n, o, f, g);
    }
  }
  function t(i) {
    return i.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return va.exports;
}
var Nn;
function ea() {
  if (Nn) return ke;
  Nn = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.getSchemaRefs = ke.resolveUrl = ke.normalizeId = ke._getFullPath = ke.getFullPath = ke.inlineRef = void 0;
  const e = /* @__PURE__ */ xe(), r = Ao(), t = Ql(), i = /* @__PURE__ */ new Set([
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
  function a(u, y = !0) {
    return typeof u == "boolean" ? !0 : y === !0 ? !l(u) : y ? A(u) <= y : !1;
  }
  ke.inlineRef = a;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function l(u) {
    for (const y in u) {
      if (s.has(y))
        return !0;
      const m = u[y];
      if (Array.isArray(m) && m.some(l) || typeof m == "object" && l(m))
        return !0;
    }
    return !1;
  }
  function A(u) {
    let y = 0;
    for (const m in u) {
      if (m === "$ref")
        return 1 / 0;
      if (y++, !i.has(m) && (typeof u[m] == "object" && (0, e.eachItem)(u[m], (p) => y += A(p)), y === 1 / 0))
        return 1 / 0;
    }
    return y;
  }
  function c(u, y = "", m) {
    m !== !1 && (y = f(y));
    const p = u.parse(y);
    return n(u, p);
  }
  ke.getFullPath = c;
  function n(u, y) {
    return u.serialize(y).split("#")[0] + "#";
  }
  ke._getFullPath = n;
  const o = /#\/?$/;
  function f(u) {
    return u ? u.replace(o, "") : "";
  }
  ke.normalizeId = f;
  function g(u, y, m) {
    return m = f(m), u.resolve(y, m);
  }
  ke.resolveUrl = g;
  const d = /^[a-z_][-a-z0-9._]*$/i;
  function h(u, y) {
    if (typeof u == "boolean")
      return {};
    const { schemaId: m, uriResolver: p } = this.opts, _ = f(u[m] || y), T = { "": _ }, v = c(p, _, !1), x = {}, C = /* @__PURE__ */ new Set();
    return t(u, { allKeys: !0 }, (S, O, E, M) => {
      if (M === void 0)
        return;
      const w = v + O;
      let G = T[M];
      typeof S[m] == "string" && (G = ee.call(this, S[m])), Y.call(this, S.$anchor), Y.call(this, S.$dynamicAnchor), T[O] = G;
      function ee(ne) {
        const Z = this.opts.uriResolver.resolve;
        if (ne = f(G ? Z(G, ne) : ne), C.has(ne))
          throw R(ne);
        C.add(ne);
        let Q = this.refs[ne];
        return typeof Q == "string" && (Q = this.refs[Q]), typeof Q == "object" ? P(S, Q.schema, ne) : ne !== f(w) && (ne[0] === "#" ? (P(S, x[ne], ne), x[ne] = S) : this.refs[ne] = w), ne;
      }
      function Y(ne) {
        if (typeof ne == "string") {
          if (!d.test(ne))
            throw new Error(`invalid anchor "${ne}"`);
          ee.call(this, `#${ne}`);
        }
      }
    }), x;
    function P(S, O, E) {
      if (O !== void 0 && !r(S, O))
        throw R(E);
    }
    function R(S) {
      return new Error(`reference "${S}" resolves to more than one schema`);
    }
  }
  return ke.getSchemaRefs = h, ke;
}
var In;
function ta() {
  if (In) return Je;
  In = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.getData = Je.KeywordCxt = Je.validateFunctionCode = void 0;
  const e = /* @__PURE__ */ Hl(), r = /* @__PURE__ */ Yr(), t = /* @__PURE__ */ co(), i = /* @__PURE__ */ Yr(), a = /* @__PURE__ */ Wl(), s = /* @__PURE__ */ ql(), l = /* @__PURE__ */ Vl(), A = /* @__PURE__ */ ge(), c = /* @__PURE__ */ ct(), n = /* @__PURE__ */ ea(), o = /* @__PURE__ */ xe(), f = /* @__PURE__ */ Zr();
  function g(z) {
    if (v(z) && (C(z), T(z))) {
      y(z);
      return;
    }
    d(z, () => (0, e.topBoolOrEmptySchema)(z));
  }
  Je.validateFunctionCode = g;
  function d({ gen: z, validateName: W, schema: j, schemaEnv: b, opts: X }, H) {
    X.code.es5 ? z.func(W, (0, A._)`${c.default.data}, ${c.default.valCxt}`, b.$async, () => {
      z.code((0, A._)`"use strict"; ${p(j, X)}`), u(z, X), z.code(H);
    }) : z.func(W, (0, A._)`${c.default.data}, ${h(X)}`, b.$async, () => z.code(p(j, X)).code(H));
  }
  function h(z) {
    return (0, A._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${z.dynamicRef ? (0, A._)`, ${c.default.dynamicAnchors}={}` : A.nil}}={}`;
  }
  function u(z, W) {
    z.if(c.default.valCxt, () => {
      z.var(c.default.instancePath, (0, A._)`${c.default.valCxt}.${c.default.instancePath}`), z.var(c.default.parentData, (0, A._)`${c.default.valCxt}.${c.default.parentData}`), z.var(c.default.parentDataProperty, (0, A._)`${c.default.valCxt}.${c.default.parentDataProperty}`), z.var(c.default.rootData, (0, A._)`${c.default.valCxt}.${c.default.rootData}`), W.dynamicRef && z.var(c.default.dynamicAnchors, (0, A._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      z.var(c.default.instancePath, (0, A._)`""`), z.var(c.default.parentData, (0, A._)`undefined`), z.var(c.default.parentDataProperty, (0, A._)`undefined`), z.var(c.default.rootData, c.default.data), W.dynamicRef && z.var(c.default.dynamicAnchors, (0, A._)`{}`);
    });
  }
  function y(z) {
    const { schema: W, opts: j, gen: b } = z;
    d(z, () => {
      j.$comment && W.$comment && M(z), S(z), b.let(c.default.vErrors, null), b.let(c.default.errors, 0), j.unevaluated && m(z), P(z), w(z);
    });
  }
  function m(z) {
    const { gen: W, validateName: j } = z;
    z.evaluated = W.const("evaluated", (0, A._)`${j}.evaluated`), W.if((0, A._)`${z.evaluated}.dynamicProps`, () => W.assign((0, A._)`${z.evaluated}.props`, (0, A._)`undefined`)), W.if((0, A._)`${z.evaluated}.dynamicItems`, () => W.assign((0, A._)`${z.evaluated}.items`, (0, A._)`undefined`));
  }
  function p(z, W) {
    const j = typeof z == "object" && z[W.schemaId];
    return j && (W.code.source || W.code.process) ? (0, A._)`/*# sourceURL=${j} */` : A.nil;
  }
  function _(z, W) {
    if (v(z) && (C(z), T(z))) {
      x(z, W);
      return;
    }
    (0, e.boolOrEmptySchema)(z, W);
  }
  function T({ schema: z, self: W }) {
    if (typeof z == "boolean")
      return !z;
    for (const j in z)
      if (W.RULES.all[j])
        return !0;
    return !1;
  }
  function v(z) {
    return typeof z.schema != "boolean";
  }
  function x(z, W) {
    const { schema: j, gen: b, opts: X } = z;
    X.$comment && j.$comment && M(z), O(z), E(z);
    const H = b.const("_errs", c.default.errors);
    P(z, H), b.var(W, (0, A._)`${H} === ${c.default.errors}`);
  }
  function C(z) {
    (0, o.checkUnknownRules)(z), R(z);
  }
  function P(z, W) {
    if (z.opts.jtd)
      return ee(z, [], !1, W);
    const j = (0, r.getSchemaTypes)(z.schema), b = (0, r.coerceAndCheckDataType)(z, j);
    ee(z, j, !b, W);
  }
  function R(z) {
    const { schema: W, errSchemaPath: j, opts: b, self: X } = z;
    W.$ref && b.ignoreKeywordsWithRef && (0, o.schemaHasRulesButRef)(W, X.RULES) && X.logger.warn(`$ref: keywords ignored in schema at path "${j}"`);
  }
  function S(z) {
    const { schema: W, opts: j } = z;
    W.default !== void 0 && j.useDefaults && j.strictSchema && (0, o.checkStrictMode)(z, "default is ignored in the schema root");
  }
  function O(z) {
    const W = z.schema[z.opts.schemaId];
    W && (z.baseId = (0, n.resolveUrl)(z.opts.uriResolver, z.baseId, W));
  }
  function E(z) {
    if (z.schema.$async && !z.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function M({ gen: z, schemaEnv: W, schema: j, errSchemaPath: b, opts: X }) {
    const H = j.$comment;
    if (X.$comment === !0)
      z.code((0, A._)`${c.default.self}.logger.log(${H})`);
    else if (typeof X.$comment == "function") {
      const k = (0, A.str)`${b}/$comment`, I = z.scopeValue("root", { ref: W.root });
      z.code((0, A._)`${c.default.self}.opts.$comment(${H}, ${k}, ${I}.schema)`);
    }
  }
  function w(z) {
    const { gen: W, schemaEnv: j, validateName: b, ValidationError: X, opts: H } = z;
    j.$async ? W.if((0, A._)`${c.default.errors} === 0`, () => W.return(c.default.data), () => W.throw((0, A._)`new ${X}(${c.default.vErrors})`)) : (W.assign((0, A._)`${b}.errors`, c.default.vErrors), H.unevaluated && G(z), W.return((0, A._)`${c.default.errors} === 0`));
  }
  function G({ gen: z, evaluated: W, props: j, items: b }) {
    j instanceof A.Name && z.assign((0, A._)`${W}.props`, j), b instanceof A.Name && z.assign((0, A._)`${W}.items`, b);
  }
  function ee(z, W, j, b) {
    const { gen: X, schema: H, data: k, allErrors: I, opts: U, self: K } = z, { RULES: J } = K;
    if (H.$ref && (U.ignoreKeywordsWithRef || !(0, o.schemaHasRulesButRef)(H, J))) {
      X.block(() => oe(z, "$ref", J.all.$ref.definition));
      return;
    }
    U.jtd || ne(z, W), X.block(() => {
      for (const te of J.rules)
        V(te);
      V(J.post);
    });
    function V(te) {
      (0, t.shouldUseGroup)(H, te) && (te.type ? (X.if((0, i.checkDataType)(te.type, k, U.strictNumbers)), Y(z, te), W.length === 1 && W[0] === te.type && j && (X.else(), (0, i.reportTypeError)(z)), X.endIf()) : Y(z, te), I || X.if((0, A._)`${c.default.errors} === ${b || 0}`));
    }
  }
  function Y(z, W) {
    const { gen: j, schema: b, opts: { useDefaults: X } } = z;
    X && (0, a.assignDefaults)(z, W.type), j.block(() => {
      for (const H of W.rules)
        (0, t.shouldUseRule)(b, H) && oe(z, H.keyword, H.definition, W.type);
    });
  }
  function ne(z, W) {
    z.schemaEnv.meta || !z.opts.strictTypes || (Z(z, W), z.opts.allowUnionTypes || Q(z, W), B(z, z.dataTypes));
  }
  function Z(z, W) {
    if (W.length) {
      if (!z.dataTypes.length) {
        z.dataTypes = W;
        return;
      }
      W.forEach((j) => {
        $(z.dataTypes, j) || N(z, `type "${j}" not allowed by context "${z.dataTypes.join(",")}"`);
      }), L(z, W);
    }
  }
  function Q(z, W) {
    W.length > 1 && !(W.length === 2 && W.includes("null")) && N(z, "use allowUnionTypes to allow union type keyword");
  }
  function B(z, W) {
    const j = z.self.RULES.all;
    for (const b in j) {
      const X = j[b];
      if (typeof X == "object" && (0, t.shouldUseRule)(z.schema, X)) {
        const { type: H } = X.definition;
        H.length && !H.some((k) => F(W, k)) && N(z, `missing type "${H.join(",")}" for keyword "${b}"`);
      }
    }
  }
  function F(z, W) {
    return z.includes(W) || W === "number" && z.includes("integer");
  }
  function $(z, W) {
    return z.includes(W) || W === "integer" && z.includes("number");
  }
  function L(z, W) {
    const j = [];
    for (const b of z.dataTypes)
      $(W, b) ? j.push(b) : W.includes("integer") && b === "number" && j.push("integer");
    z.dataTypes = j;
  }
  function N(z, W) {
    const j = z.schemaEnv.baseId + z.errSchemaPath;
    W += ` at "${j}" (strictTypes)`, (0, o.checkStrictMode)(z, W, z.opts.strictTypes);
  }
  class q {
    constructor(W, j, b) {
      if ((0, s.validateKeywordUsage)(W, j, b), this.gen = W.gen, this.allErrors = W.allErrors, this.keyword = b, this.data = W.data, this.schema = W.schema[b], this.$data = j.$data && W.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, o.schemaRefOrVal)(W, this.schema, b, this.$data), this.schemaType = j.schemaType, this.parentSchema = W.schema, this.params = {}, this.it = W, this.def = j, this.$data)
        this.schemaCode = W.gen.const("vSchema", Ae(this.$data, W));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, j.schemaType, j.allowUndefined))
        throw new Error(`${b} value must be ${JSON.stringify(j.schemaType)}`);
      ("code" in j ? j.trackErrors : j.errors !== !1) && (this.errsCount = W.gen.const("_errs", c.default.errors));
    }
    result(W, j, b) {
      this.failResult((0, A.not)(W), j, b);
    }
    failResult(W, j, b) {
      this.gen.if(W), b ? b() : this.error(), j ? (this.gen.else(), j(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(W, j) {
      this.failResult((0, A.not)(W), void 0, j);
    }
    fail(W) {
      if (W === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(W), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(W) {
      if (!this.$data)
        return this.fail(W);
      const { schemaCode: j } = this;
      this.fail((0, A._)`${j} !== undefined && (${(0, A.or)(this.invalid$data(), W)})`);
    }
    error(W, j, b) {
      if (j) {
        this.setParams(j), this._error(W, b), this.setParams({});
        return;
      }
      this._error(W, b);
    }
    _error(W, j) {
      (W ? f.reportExtraError : f.reportError)(this, this.def.error, j);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(W) {
      this.allErrors || this.gen.if(W);
    }
    setParams(W, j) {
      j ? Object.assign(this.params, W) : this.params = W;
    }
    block$data(W, j, b = A.nil) {
      this.gen.block(() => {
        this.check$data(W, b), j();
      });
    }
    check$data(W = A.nil, j = A.nil) {
      if (!this.$data)
        return;
      const { gen: b, schemaCode: X, schemaType: H, def: k } = this;
      b.if((0, A.or)((0, A._)`${X} === undefined`, j)), W !== A.nil && b.assign(W, !0), (H.length || k.validateSchema) && (b.elseIf(this.invalid$data()), this.$dataError(), W !== A.nil && b.assign(W, !1)), b.else();
    }
    invalid$data() {
      const { gen: W, schemaCode: j, schemaType: b, def: X, it: H } = this;
      return (0, A.or)(k(), I());
      function k() {
        if (b.length) {
          if (!(j instanceof A.Name))
            throw new Error("ajv implementation error");
          const U = Array.isArray(b) ? b : [b];
          return (0, A._)`${(0, i.checkDataTypes)(U, j, H.opts.strictNumbers, i.DataType.Wrong)}`;
        }
        return A.nil;
      }
      function I() {
        if (X.validateSchema) {
          const U = W.scopeValue("validate$data", { ref: X.validateSchema });
          return (0, A._)`!${U}(${j})`;
        }
        return A.nil;
      }
    }
    subschema(W, j) {
      const b = (0, l.getSubschema)(this.it, W);
      (0, l.extendSubschemaData)(b, this.it, W), (0, l.extendSubschemaMode)(b, W);
      const X = { ...this.it, ...b, items: void 0, props: void 0 };
      return _(X, j), X;
    }
    mergeEvaluated(W, j) {
      const { it: b, gen: X } = this;
      b.opts.unevaluated && (b.props !== !0 && W.props !== void 0 && (b.props = o.mergeEvaluated.props(X, W.props, b.props, j)), b.items !== !0 && W.items !== void 0 && (b.items = o.mergeEvaluated.items(X, W.items, b.items, j)));
    }
    mergeValidEvaluated(W, j) {
      const { it: b, gen: X } = this;
      if (b.opts.unevaluated && (b.props !== !0 || b.items !== !0))
        return X.if(j, () => this.mergeEvaluated(W, A.Name)), !0;
    }
  }
  Je.KeywordCxt = q;
  function oe(z, W, j, b) {
    const X = new q(z, j, W);
    "code" in j ? j.code(X, b) : X.$data && j.validate ? (0, s.funcKeywordCode)(X, j) : "macro" in j ? (0, s.macroKeywordCode)(X, j) : (j.compile || j.validate) && (0, s.funcKeywordCode)(X, j);
  }
  const ae = /^\/(?:[^~]|~0|~1)*$/, le = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Ae(z, { dataLevel: W, dataNames: j, dataPathArr: b }) {
    let X, H;
    if (z === "")
      return c.default.rootData;
    if (z[0] === "/") {
      if (!ae.test(z))
        throw new Error(`Invalid JSON-pointer: ${z}`);
      X = z, H = c.default.rootData;
    } else {
      const K = le.exec(z);
      if (!K)
        throw new Error(`Invalid JSON-pointer: ${z}`);
      const J = +K[1];
      if (X = K[2], X === "#") {
        if (J >= W)
          throw new Error(U("property/index", J));
        return b[W - J];
      }
      if (J > W)
        throw new Error(U("data", J));
      if (H = j[W - J], !X)
        return H;
    }
    let k = H;
    const I = X.split("/");
    for (const K of I)
      K && (H = (0, A._)`${H}${(0, A.getProperty)((0, o.unescapeJsonPointer)(K))}`, k = (0, A._)`${k} && ${H}`);
    return k;
    function U(K, J) {
      return `Cannot access ${K} ${J} levels up, current level is ${W}`;
    }
  }
  return Je.getData = Ae, Je;
}
var ar = {}, Sn;
function Va() {
  if (Sn) return ar;
  Sn = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  class e extends Error {
    constructor(t) {
      super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
    }
  }
  return ar.default = e, ar;
}
var nr = {}, kn;
function ra() {
  if (kn) return nr;
  kn = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ea();
  class r extends Error {
    constructor(i, a, s, l) {
      super(l || `can't resolve reference ${s} from id ${a}`), this.missingRef = (0, e.resolveUrl)(i, a, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(i, this.missingRef));
    }
  }
  return nr.default = r, nr;
}
var $e = {}, Fn;
function Qa() {
  if (Fn) return $e;
  Fn = 1, Object.defineProperty($e, "__esModule", { value: !0 }), $e.resolveSchema = $e.getCompilingSchema = $e.resolveRef = $e.compileSchema = $e.SchemaEnv = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ Va(), t = /* @__PURE__ */ ct(), i = /* @__PURE__ */ ea(), a = /* @__PURE__ */ xe(), s = /* @__PURE__ */ ta();
  class l {
    constructor(m) {
      var p;
      this.refs = {}, this.dynamicAnchors = {};
      let _;
      typeof m.schema == "object" && (_ = m.schema), this.schema = m.schema, this.schemaId = m.schemaId, this.root = m.root || this, this.baseId = (p = m.baseId) !== null && p !== void 0 ? p : (0, i.normalizeId)(_?.[m.schemaId || "$id"]), this.schemaPath = m.schemaPath, this.localRefs = m.localRefs, this.meta = m.meta, this.$async = _?.$async, this.refs = {};
    }
  }
  $e.SchemaEnv = l;
  function A(y) {
    const m = o.call(this, y);
    if (m)
      return m;
    const p = (0, i.getFullPath)(this.opts.uriResolver, y.root.baseId), { es5: _, lines: T } = this.opts.code, { ownProperties: v } = this.opts, x = new e.CodeGen(this.scope, { es5: _, lines: T, ownProperties: v });
    let C;
    y.$async && (C = x.scopeValue("Error", {
      ref: r.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const P = x.scopeName("validate");
    y.validateName = P;
    const R = {
      gen: x,
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
      topSchemaRef: x.scopeValue("schema", this.opts.code.source === !0 ? { ref: y.schema, code: (0, e.stringify)(y.schema) } : { ref: y.schema }),
      validateName: P,
      ValidationError: C,
      schema: y.schema,
      schemaEnv: y,
      rootId: p,
      baseId: y.baseId || p,
      schemaPath: e.nil,
      errSchemaPath: y.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let S;
    try {
      this._compilations.add(y), (0, s.validateFunctionCode)(R), x.optimize(this.opts.code.optimize);
      const O = x.toString();
      S = `${x.scopeRefs(t.default.scope)}return ${O}`, this.opts.code.process && (S = this.opts.code.process(S, y));
      const M = new Function(`${t.default.self}`, `${t.default.scope}`, S)(this, this.scope.get());
      if (this.scope.value(P, { ref: M }), M.errors = null, M.schema = y.schema, M.schemaEnv = y, y.$async && (M.$async = !0), this.opts.code.source === !0 && (M.source = { validateName: P, validateCode: O, scopeValues: x._values }), this.opts.unevaluated) {
        const { props: w, items: G } = R;
        M.evaluated = {
          props: w instanceof e.Name ? void 0 : w,
          items: G instanceof e.Name ? void 0 : G,
          dynamicProps: w instanceof e.Name,
          dynamicItems: G instanceof e.Name
        }, M.source && (M.source.evaluated = (0, e.stringify)(M.evaluated));
      }
      return y.validate = M, y;
    } catch (O) {
      throw delete y.validate, delete y.validateName, S && this.logger.error("Error compiling schema, function code:", S), O;
    } finally {
      this._compilations.delete(y);
    }
  }
  $e.compileSchema = A;
  function c(y, m, p) {
    var _;
    p = (0, i.resolveUrl)(this.opts.uriResolver, m, p);
    const T = y.refs[p];
    if (T)
      return T;
    let v = g.call(this, y, p);
    if (v === void 0) {
      const x = (_ = y.localRefs) === null || _ === void 0 ? void 0 : _[p], { schemaId: C } = this.opts;
      x && (v = new l({ schema: x, schemaId: C, root: y, baseId: m }));
    }
    if (v !== void 0)
      return y.refs[p] = n.call(this, v);
  }
  $e.resolveRef = c;
  function n(y) {
    return (0, i.inlineRef)(y.schema, this.opts.inlineRefs) ? y.schema : y.validate ? y : A.call(this, y);
  }
  function o(y) {
    for (const m of this._compilations)
      if (f(m, y))
        return m;
  }
  $e.getCompilingSchema = o;
  function f(y, m) {
    return y.schema === m.schema && y.root === m.root && y.baseId === m.baseId;
  }
  function g(y, m) {
    let p;
    for (; typeof (p = this.refs[m]) == "string"; )
      m = p;
    return p || this.schemas[m] || d.call(this, y, m);
  }
  function d(y, m) {
    const p = this.opts.uriResolver.parse(m), _ = (0, i._getFullPath)(this.opts.uriResolver, p);
    let T = (0, i.getFullPath)(this.opts.uriResolver, y.baseId, void 0);
    if (Object.keys(y.schema).length > 0 && _ === T)
      return u.call(this, p, y);
    const v = (0, i.normalizeId)(_), x = this.refs[v] || this.schemas[v];
    if (typeof x == "string") {
      const C = d.call(this, y, x);
      return typeof C?.schema != "object" ? void 0 : u.call(this, p, C);
    }
    if (typeof x?.schema == "object") {
      if (x.validate || A.call(this, x), v === (0, i.normalizeId)(m)) {
        const { schema: C } = x, { schemaId: P } = this.opts, R = C[P];
        return R && (T = (0, i.resolveUrl)(this.opts.uriResolver, T, R)), new l({ schema: C, schemaId: P, root: y, baseId: T });
      }
      return u.call(this, p, x);
    }
  }
  $e.resolveSchema = d;
  const h = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function u(y, { baseId: m, schema: p, root: _ }) {
    var T;
    if (((T = y.fragment) === null || T === void 0 ? void 0 : T[0]) !== "/")
      return;
    for (const C of y.fragment.slice(1).split("/")) {
      if (typeof p == "boolean")
        return;
      const P = p[(0, a.unescapeFragment)(C)];
      if (P === void 0)
        return;
      p = P;
      const R = typeof p == "object" && p[this.opts.schemaId];
      !h.has(C) && R && (m = (0, i.resolveUrl)(this.opts.uriResolver, m, R));
    }
    let v;
    if (typeof p != "boolean" && p.$ref && !(0, a.schemaHasRulesButRef)(p, this.RULES)) {
      const C = (0, i.resolveUrl)(this.opts.uriResolver, m, p.$ref);
      v = d.call(this, _, C);
    }
    const { schemaId: x } = this.opts;
    if (v = v || new l({ schema: p, schemaId: x, root: _, baseId: m }), v.schema !== v.root.schema)
      return v;
  }
  return $e;
}
const jl = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Yl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Kl = "object", Jl = ["$data"], Zl = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, ec = !1, tc = {
  $id: jl,
  description: Yl,
  type: Kl,
  required: Jl,
  properties: Zl,
  additionalProperties: ec
};
var ir = {}, kt = { exports: {} }, ba, Mn;
function fo() {
  if (Mn) return ba;
  Mn = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), r = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u), t = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu), i = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu), a = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
  function s(v) {
    let x = "", C = 0, P = 0;
    for (P = 0; P < v.length; P++)
      if (C = v[P].charCodeAt(0), C !== 48) {
        if (!(C >= 48 && C <= 57 || C >= 65 && C <= 70 || C >= 97 && C <= 102))
          return "";
        x += v[P];
        break;
      }
    for (P += 1; P < v.length; P++) {
      if (C = v[P].charCodeAt(0), !(C >= 48 && C <= 57 || C >= 65 && C <= 70 || C >= 97 && C <= 102))
        return "";
      x += v[P];
    }
    return x;
  }
  const l = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function A(v) {
    return v.length = 0, !0;
  }
  function c(v, x, C) {
    if (v.length) {
      const P = s(v);
      if (P !== "")
        x.push(P);
      else
        return C.error = !0, !1;
      v.length = 0;
    }
    return !0;
  }
  function n(v) {
    let x = 0;
    const C = { error: !1, address: "", zone: "" }, P = [], R = [];
    let S = !1, O = !1, E = c;
    for (let M = 0; M < v.length; M++) {
      const w = v[M];
      if (!(w === "[" || w === "]"))
        if (w === ":") {
          if (S === !0 && (O = !0), !E(R, P, C))
            break;
          if (++x > 7) {
            C.error = !0;
            break;
          }
          M > 0 && v[M - 1] === ":" && (S = !0), P.push(":");
          continue;
        } else if (w === "%") {
          if (!E(R, P, C))
            break;
          E = A;
        } else {
          R.push(w);
          continue;
        }
    }
    return R.length && (E === A ? C.zone = R.join("") : O ? P.push(R.join("")) : P.push(s(R))), C.address = P.join(""), C;
  }
  function o(v) {
    if (f(v, ":") < 2)
      return { host: v, isIPV6: !1 };
    const x = n(v);
    if (x.error)
      return { host: v, isIPV6: !1 };
    {
      let C = x.address, P = x.address;
      return x.zone && (C += "%" + x.zone, P += "%25" + x.zone), { host: C, isIPV6: !0, escapedHost: P };
    }
  }
  function f(v, x) {
    let C = 0;
    for (let P = 0; P < v.length; P++)
      v[P] === x && C++;
    return C;
  }
  function g(v) {
    let x = v;
    const C = [];
    let P = -1, R = 0;
    for (; R = x.length; ) {
      if (R === 1) {
        if (x === ".")
          break;
        if (x === "/") {
          C.push("/");
          break;
        } else {
          C.push(x);
          break;
        }
      } else if (R === 2) {
        if (x[0] === ".") {
          if (x[1] === ".")
            break;
          if (x[1] === "/") {
            x = x.slice(2);
            continue;
          }
        } else if (x[0] === "/" && (x[1] === "." || x[1] === "/")) {
          C.push("/");
          break;
        }
      } else if (R === 3 && x === "/..") {
        C.length !== 0 && C.pop(), C.push("/");
        break;
      }
      if (x[0] === ".") {
        if (x[1] === ".") {
          if (x[2] === "/") {
            x = x.slice(3);
            continue;
          }
        } else if (x[1] === "/") {
          x = x.slice(2);
          continue;
        }
      } else if (x[0] === "/" && x[1] === ".") {
        if (x[2] === "/") {
          x = x.slice(2);
          continue;
        } else if (x[2] === "." && x[3] === "/") {
          x = x.slice(3), C.length !== 0 && C.pop();
          continue;
        }
      }
      if ((P = x.indexOf("/", 1)) === -1) {
        C.push(x);
        break;
      } else
        C.push(x.slice(0, P)), x = x.slice(P);
    }
    return C.join("");
  }
  const d = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" }, h = /[@/?#:]/g, u = /[@/?#]/g;
  function y(v, x) {
    const C = x ? u : h;
    return C.lastIndex = 0, v.replace(C, (P) => d[P]);
  }
  function m(v, x = !1) {
    if (v.indexOf("%") === -1)
      return v;
    let C = "";
    for (let P = 0; P < v.length; P++) {
      if (v[P] === "%" && P + 2 < v.length) {
        const R = v.slice(P + 1, P + 3);
        if (t(R)) {
          const S = R.toUpperCase(), O = String.fromCharCode(parseInt(S, 16));
          x && i(O) ? C += O : C += "%" + S, P += 2;
          continue;
        }
      }
      C += v[P];
    }
    return C;
  }
  function p(v) {
    let x = "";
    for (let C = 0; C < v.length; C++) {
      if (v[C] === "%" && C + 2 < v.length) {
        const P = v.slice(C + 1, C + 3);
        if (t(P)) {
          const R = P.toUpperCase(), S = String.fromCharCode(parseInt(R, 16));
          S !== "." && i(S) ? x += S : x += "%" + R, C += 2;
          continue;
        }
      }
      a(v[C]) ? x += v[C] : x += escape(v[C]);
    }
    return x;
  }
  function _(v) {
    let x = "";
    for (let C = 0; C < v.length; C++) {
      if (v[C] === "%" && C + 2 < v.length) {
        const P = v.slice(C + 1, C + 3);
        if (t(P)) {
          x += "%" + P.toUpperCase(), C += 2;
          continue;
        }
      }
      x += escape(v[C]);
    }
    return x;
  }
  function T(v) {
    const x = [];
    if (v.userinfo !== void 0 && (x.push(v.userinfo), x.push("@")), v.host !== void 0) {
      let C = unescape(v.host);
      if (!r(C)) {
        const P = o(C);
        P.isIPV6 === !0 ? C = `[${P.escapedHost}]` : C = y(C, !1);
      }
      x.push(C);
    }
    return (typeof v.port == "number" || typeof v.port == "string") && (x.push(":"), x.push(String(v.port))), x.length ? x.join("") : void 0;
  }
  return ba = {
    nonSimpleDomain: l,
    recomposeAuthority: T,
    reescapeHostDelimiters: y,
    normalizePercentEncoding: m,
    normalizePathEncoding: p,
    escapePreservingEscapes: _,
    removeDotSegments: g,
    isIPv4: r,
    isUUID: e,
    normalizeIPv6: o,
    stringArrayToHexStripped: s
  }, ba;
}
var wa, On;
function rc() {
  if (On) return wa;
  On = 1;
  const { isUUID: e } = fo(), r = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, t = (
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
  function i(v) {
    return t.indexOf(
      /** @type {*} */
      v
    ) !== -1;
  }
  function a(v) {
    return v.secure === !0 ? !0 : v.secure === !1 ? !1 : v.scheme ? v.scheme.length === 3 && (v.scheme[0] === "w" || v.scheme[0] === "W") && (v.scheme[1] === "s" || v.scheme[1] === "S") && (v.scheme[2] === "s" || v.scheme[2] === "S") : !1;
  }
  function s(v) {
    return v.host || (v.error = v.error || "HTTP URIs must have a host."), v;
  }
  function l(v) {
    const x = String(v.scheme).toLowerCase() === "https";
    return (v.port === (x ? 443 : 80) || v.port === "") && (v.port = void 0), v.path || (v.path = "/"), v;
  }
  function A(v) {
    return v.secure = a(v), v.resourceName = (v.path || "/") + (v.query ? "?" + v.query : ""), v.path = void 0, v.query = void 0, v;
  }
  function c(v) {
    if ((v.port === (a(v) ? 443 : 80) || v.port === "") && (v.port = void 0), typeof v.secure == "boolean" && (v.scheme = v.secure ? "wss" : "ws", v.secure = void 0), v.resourceName) {
      const [x, C] = v.resourceName.split("?");
      v.path = x && x !== "/" ? x : void 0, v.query = C, v.resourceName = void 0;
    }
    return v.fragment = void 0, v;
  }
  function n(v, x) {
    if (!v.path)
      return v.error = "URN can not be parsed", v;
    const C = v.path.match(r);
    if (C) {
      const P = x.scheme || v.scheme || "urn";
      v.nid = C[1].toLowerCase(), v.nss = C[2];
      const R = `${P}:${x.nid || v.nid}`, S = T(R);
      v.path = void 0, S && (v = S.parse(v, x));
    } else
      v.error = v.error || "URN can not be parsed.";
    return v;
  }
  function o(v, x) {
    if (v.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const C = x.scheme || v.scheme || "urn", P = v.nid.toLowerCase(), R = `${C}:${x.nid || P}`, S = T(R);
    S && (v = S.serialize(v, x));
    const O = v, E = v.nss;
    return O.path = `${P || x.nid}:${E}`, x.skipEscape = !0, O;
  }
  function f(v, x) {
    const C = v;
    return C.uuid = C.nss, C.nss = void 0, !x.tolerant && (!C.uuid || !e(C.uuid)) && (C.error = C.error || "UUID is not valid."), C;
  }
  function g(v) {
    const x = v;
    return x.nss = (v.uuid || "").toLowerCase(), x;
  }
  const d = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: l
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: d.domainHost,
      parse: s,
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
  ), y = (
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
      https: h,
      ws: u,
      wss: y,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: n,
          serialize: o,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: f,
          serialize: g,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(_, null);
  function T(v) {
    return v && (_[
      /** @type {SchemeName} */
      v
    ] || _[
      /** @type {SchemeName} */
      v.toLowerCase()
    ]) || void 0;
  }
  return wa = {
    wsIsSecure: a,
    SCHEMES: _,
    isValidSchemeName: i,
    getSchemeHandler: T
  }, wa;
}
var $n;
function ac() {
  if ($n) return kt.exports;
  $n = 1;
  const { normalizeIPv6: e, removeDotSegments: r, recomposeAuthority: t, normalizePercentEncoding: i, normalizePathEncoding: a, escapePreservingEscapes: s, reescapeHostDelimiters: l, isIPv4: A, nonSimpleDomain: c } = fo(), { SCHEMES: n, getSchemeHandler: o } = rc();
  function f(R, S) {
    return typeof R == "string" ? R = /** @type {T} */
    v(R, S) : typeof R == "object" && (R = /** @type {T} */
    T(u(R, S), S)), R;
  }
  function g(R, S, O) {
    const E = O ? Object.assign({ scheme: "null" }, O) : { scheme: "null" }, M = d(T(R, E), T(S, E), E, !0);
    return E.skipEscape = !0, u(M, E);
  }
  function d(R, S, O, E) {
    const M = {};
    return E || (R = T(u(R, O), O), S = T(u(S, O), O)), O = O || {}, !O.tolerant && S.scheme ? (M.scheme = S.scheme, M.userinfo = S.userinfo, M.host = S.host, M.port = S.port, M.path = r(S.path || ""), M.query = S.query) : (S.userinfo !== void 0 || S.host !== void 0 || S.port !== void 0 ? (M.userinfo = S.userinfo, M.host = S.host, M.port = S.port, M.path = r(S.path || ""), M.query = S.query) : (S.path ? (S.path[0] === "/" ? M.path = r(S.path) : ((R.userinfo !== void 0 || R.host !== void 0 || R.port !== void 0) && !R.path ? M.path = "/" + S.path : R.path ? M.path = R.path.slice(0, R.path.lastIndexOf("/") + 1) + S.path : M.path = S.path, M.path = r(M.path)), M.query = S.query) : (M.path = R.path, S.query !== void 0 ? M.query = S.query : M.query = R.query), M.userinfo = R.userinfo, M.host = R.host, M.port = R.port), M.scheme = R.scheme), M.fragment = S.fragment, M;
  }
  function h(R, S, O) {
    const E = C(R, O), M = C(S, O);
    return E !== void 0 && M !== void 0 && E.toLowerCase() === M.toLowerCase();
  }
  function u(R, S) {
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
    }, E = Object.assign({}, S), M = [], w = o(E.scheme || O.scheme);
    w && w.serialize && w.serialize(O, E), O.path !== void 0 && (E.skipEscape ? O.path = i(O.path) : (O.path = s(O.path), O.scheme !== void 0 && (O.path = O.path.split("%3A").join(":")))), E.reference !== "suffix" && O.scheme && M.push(O.scheme, ":");
    const G = t(O);
    if (G !== void 0 && (E.reference !== "suffix" && M.push("//"), M.push(G), O.path && O.path[0] !== "/" && M.push("/")), O.path !== void 0) {
      let ee = O.path;
      !E.absolutePath && (!w || !w.absolutePath) && (ee = r(ee)), G === void 0 && ee[0] === "/" && ee[1] === "/" && (ee = "/%2F" + ee.slice(2)), M.push(ee);
    }
    return O.query !== void 0 && M.push("?", O.query), O.fragment !== void 0 && M.push("#", O.fragment), M.join("");
  }
  const y = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u, m = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
  function p(R, S) {
    if (S[2] !== void 0 && R.path && R.path[0] !== "/")
      return 'URI path must start with "/" when authority is present.';
    if (typeof R.port == "number" && (R.port < 0 || R.port > 65535))
      return "URI port is malformed.";
  }
  function _(R, S) {
    const O = Object.assign({}, S), E = {
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
    const G = R.match(m);
    G !== null && G[1].indexOf("\\") !== -1 && (E.error = "URI authority must not contain a literal backslash.", M = !0);
    const ee = R.match(y);
    if (ee) {
      E.scheme = ee[1], E.userinfo = ee[3], E.host = ee[4], E.port = parseInt(ee[5], 10), E.path = ee[6] || "", E.query = ee[7], E.fragment = ee[8], isNaN(E.port) && (E.port = ee[5]);
      const Y = p(E, ee);
      if (Y !== void 0 && (E.error = E.error || Y, M = !0), E.host)
        if (A(E.host) === !1) {
          const Q = e(E.host);
          E.host = Q.host.toLowerCase(), w = Q.isIPV6;
        } else
          w = !0;
      E.scheme === void 0 && E.userinfo === void 0 && E.host === void 0 && E.port === void 0 && E.query === void 0 && !E.path ? E.reference = "same-document" : E.scheme === void 0 ? E.reference = "relative" : E.fragment === void 0 ? E.reference = "absolute" : E.reference = "uri", O.reference && O.reference !== "suffix" && O.reference !== E.reference && (E.error = E.error || "URI is not a " + O.reference + " reference.");
      const ne = o(O.scheme || E.scheme);
      if (!O.unicodeSupport && (!ne || !ne.unicodeSupport) && E.host && (O.domainHost || ne && ne.domainHost) && w === !1 && c(E.host))
        try {
          E.host = new URL("http://" + E.host).hostname;
        } catch (Z) {
          E.error = E.error || "Host's domain name can not be converted to ASCII: " + Z;
        }
      if ((!ne || ne && !ne.skipNormalize) && (R.indexOf("%") !== -1 && (E.scheme !== void 0 && (E.scheme = unescape(E.scheme)), E.host !== void 0 && (E.host = l(unescape(E.host), w))), E.path && (E.path = a(E.path)), E.fragment))
        try {
          E.fragment = encodeURI(decodeURIComponent(E.fragment));
        } catch {
          E.error = E.error || "URI malformed";
        }
      ne && ne.parse && ne.parse(E, O);
    } else
      E.error = E.error || "URI can not be parsed.";
    return { parsed: E, malformedAuthorityOrPort: M };
  }
  function T(R, S) {
    return _(R, S).parsed;
  }
  function v(R, S) {
    return x(R, S).normalized;
  }
  function x(R, S) {
    const { parsed: O, malformedAuthorityOrPort: E } = _(R, S);
    return {
      normalized: E ? R : u(O, S),
      malformedAuthorityOrPort: E
    };
  }
  function C(R, S) {
    if (typeof R == "string") {
      const { normalized: O, malformedAuthorityOrPort: E } = x(R, S);
      return E ? void 0 : O;
    }
    if (typeof R == "object")
      return u(R, S);
  }
  const P = {
    SCHEMES: n,
    normalize: f,
    resolve: g,
    resolveComponent: d,
    equal: h,
    serialize: u,
    parse: T
  };
  return kt.exports = P, kt.exports.default = P, kt.exports.fastUri = P, kt.exports;
}
var zn;
function nc() {
  if (zn) return ir;
  zn = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = ac();
  return e.code = 'require("ajv/dist/runtime/uri").default', ir.default = e, ir;
}
var Un;
function ic() {
  return Un || (Un = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var r = /* @__PURE__ */ ta();
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
    const i = /* @__PURE__ */ Va(), a = /* @__PURE__ */ ra(), s = /* @__PURE__ */ lo(), l = /* @__PURE__ */ Qa(), A = /* @__PURE__ */ ge(), c = /* @__PURE__ */ ea(), n = /* @__PURE__ */ Yr(), o = /* @__PURE__ */ xe(), f = tc, g = /* @__PURE__ */ nc(), d = (Q, B) => new RegExp(Q, B);
    d.code = "new RegExp";
    const h = ["removeAdditional", "useDefaults", "coerceTypes"], u = /* @__PURE__ */ new Set([
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
    ]), y = {
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
    }, m = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, p = 200;
    function _(Q) {
      var B, F, $, L, N, q, oe, ae, le, Ae, z, W, j, b, X, H, k, I, U, K, J, V, te, se, ie;
      const ce = Q.strict, Te = (B = Q.code) === null || B === void 0 ? void 0 : B.optimize, ye = Te === !0 || Te === void 0 ? 1 : Te || 0, Se = ($ = (F = Q.code) === null || F === void 0 ? void 0 : F.regExp) !== null && $ !== void 0 ? $ : d, At = (L = Q.uriResolver) !== null && L !== void 0 ? L : g.default;
      return {
        strictSchema: (q = (N = Q.strictSchema) !== null && N !== void 0 ? N : ce) !== null && q !== void 0 ? q : !0,
        strictNumbers: (ae = (oe = Q.strictNumbers) !== null && oe !== void 0 ? oe : ce) !== null && ae !== void 0 ? ae : !0,
        strictTypes: (Ae = (le = Q.strictTypes) !== null && le !== void 0 ? le : ce) !== null && Ae !== void 0 ? Ae : "log",
        strictTuples: (W = (z = Q.strictTuples) !== null && z !== void 0 ? z : ce) !== null && W !== void 0 ? W : "log",
        strictRequired: (b = (j = Q.strictRequired) !== null && j !== void 0 ? j : ce) !== null && b !== void 0 ? b : !1,
        code: Q.code ? { ...Q.code, optimize: ye, regExp: Se } : { optimize: ye, regExp: Se },
        loopRequired: (X = Q.loopRequired) !== null && X !== void 0 ? X : p,
        loopEnum: (H = Q.loopEnum) !== null && H !== void 0 ? H : p,
        meta: (k = Q.meta) !== null && k !== void 0 ? k : !0,
        messages: (I = Q.messages) !== null && I !== void 0 ? I : !0,
        inlineRefs: (U = Q.inlineRefs) !== null && U !== void 0 ? U : !0,
        schemaId: (K = Q.schemaId) !== null && K !== void 0 ? K : "$id",
        addUsedSchema: (J = Q.addUsedSchema) !== null && J !== void 0 ? J : !0,
        validateSchema: (V = Q.validateSchema) !== null && V !== void 0 ? V : !0,
        validateFormats: (te = Q.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (se = Q.unicodeRegExp) !== null && se !== void 0 ? se : !0,
        int32range: (ie = Q.int32range) !== null && ie !== void 0 ? ie : !0,
        uriResolver: At
      };
    }
    class T {
      constructor(B = {}) {
        this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), B = this.opts = { ...B, ..._(B) };
        const { es5: F, lines: $ } = this.opts.code;
        this.scope = new A.ValueScope({ scope: {}, prefixes: u, es5: F, lines: $ }), this.logger = E(B.logger);
        const L = B.validateFormats;
        B.validateFormats = !1, this.RULES = (0, s.getRules)(), v.call(this, y, B, "NOT SUPPORTED"), v.call(this, m, B, "DEPRECATED", "warn"), this._metaOpts = S.call(this), B.formats && P.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), B.keywords && R.call(this, B.keywords), typeof B.meta == "object" && this.addMetaSchema(B.meta), C.call(this), B.validateFormats = L;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: B, meta: F, schemaId: $ } = this.opts;
        let L = f;
        $ === "id" && (L = { ...f }, L.id = L.$id, delete L.$id), F && B && this.addMetaSchema(L, L[$], !1);
      }
      defaultMeta() {
        const { meta: B, schemaId: F } = this.opts;
        return this.opts.defaultMeta = typeof B == "object" ? B[F] || B : void 0;
      }
      validate(B, F) {
        let $;
        if (typeof B == "string") {
          if ($ = this.getSchema(B), !$)
            throw new Error(`no schema with key or ref "${B}"`);
        } else
          $ = this.compile(B);
        const L = $(F);
        return "$async" in $ || (this.errors = $.errors), L;
      }
      compile(B, F) {
        const $ = this._addSchema(B, F);
        return $.validate || this._compileSchemaEnv($);
      }
      compileAsync(B, F) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: $ } = this.opts;
        return L.call(this, B, F);
        async function L(Ae, z) {
          await N.call(this, Ae.$schema);
          const W = this._addSchema(Ae, z);
          return W.validate || q.call(this, W);
        }
        async function N(Ae) {
          Ae && !this.getSchema(Ae) && await L.call(this, { $ref: Ae }, !0);
        }
        async function q(Ae) {
          try {
            return this._compileSchemaEnv(Ae);
          } catch (z) {
            if (!(z instanceof a.default))
              throw z;
            return oe.call(this, z), await ae.call(this, z.missingSchema), q.call(this, Ae);
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
      addSchema(B, F, $, L = this.opts.validateSchema) {
        if (Array.isArray(B)) {
          for (const q of B)
            this.addSchema(q, void 0, $, L);
          return this;
        }
        let N;
        if (typeof B == "object") {
          const { schemaId: q } = this.opts;
          if (N = B[q], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${q} must be string`);
        }
        return F = (0, c.normalizeId)(F || N), this._checkUnique(F), this.schemas[F] = this._addSchema(B, $, F, L, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(B, F, $ = this.opts.validateSchema) {
        return this.addSchema(B, F, !0, $), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(B, F) {
        if (typeof B == "boolean")
          return !0;
        let $;
        if ($ = B.$schema, $ !== void 0 && typeof $ != "string")
          throw new Error("$schema must be a string");
        if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const L = this.validate($, B);
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
      getSchema(B) {
        let F;
        for (; typeof (F = x.call(this, B)) == "string"; )
          B = F;
        if (F === void 0) {
          const { schemaId: $ } = this.opts, L = new l.SchemaEnv({ schema: {}, schemaId: $ });
          if (F = l.resolveSchema.call(this, L, B), !F)
            return;
          this.refs[B] = F;
        }
        return F.validate || this._compileSchemaEnv(F);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(B) {
        if (B instanceof RegExp)
          return this._removeAllSchemas(this.schemas, B), this._removeAllSchemas(this.refs, B), this;
        switch (typeof B) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const F = x.call(this, B);
            return typeof F == "object" && this._cache.delete(F.schema), delete this.schemas[B], delete this.refs[B], this;
          }
          case "object": {
            const F = B;
            this._cache.delete(F);
            let $ = B[this.opts.schemaId];
            return $ && ($ = (0, c.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(B) {
        for (const F of B)
          this.addKeyword(F);
        return this;
      }
      addKeyword(B, F) {
        let $;
        if (typeof B == "string")
          $ = B, typeof F == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), F.keyword = $);
        else if (typeof B == "object" && F === void 0) {
          if (F = B, $ = F.keyword, Array.isArray($) && !$.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (w.call(this, $, F), !F)
          return (0, o.eachItem)($, (N) => G.call(this, N)), this;
        Y.call(this, F);
        const L = {
          ...F,
          type: (0, n.getJSONTypes)(F.type),
          schemaType: (0, n.getJSONTypes)(F.schemaType)
        };
        return (0, o.eachItem)($, L.type.length === 0 ? (N) => G.call(this, N, L) : (N) => L.type.forEach((q) => G.call(this, N, L, q))), this;
      }
      getKeyword(B) {
        const F = this.RULES.all[B];
        return typeof F == "object" ? F.definition : !!F;
      }
      // Remove keyword
      removeKeyword(B) {
        const { RULES: F } = this;
        delete F.keywords[B], delete F.all[B];
        for (const $ of F.rules) {
          const L = $.rules.findIndex((N) => N.keyword === B);
          L >= 0 && $.rules.splice(L, 1);
        }
        return this;
      }
      // Add format
      addFormat(B, F) {
        return typeof F == "string" && (F = new RegExp(F)), this.formats[B] = F, this;
      }
      errorsText(B = this.errors, { separator: F = ", ", dataVar: $ = "data" } = {}) {
        return !B || B.length === 0 ? "No errors" : B.map((L) => `${$}${L.instancePath} ${L.message}`).reduce((L, N) => L + F + N);
      }
      $dataMetaSchema(B, F) {
        const $ = this.RULES.all;
        B = JSON.parse(JSON.stringify(B));
        for (const L of F) {
          const N = L.split("/").slice(1);
          let q = B;
          for (const oe of N)
            q = q[oe];
          for (const oe in $) {
            const ae = $[oe];
            if (typeof ae != "object")
              continue;
            const { $data: le } = ae.definition, Ae = q[oe];
            le && Ae && (q[oe] = Z(Ae));
          }
        }
        return B;
      }
      _removeAllSchemas(B, F) {
        for (const $ in B) {
          const L = B[$];
          (!F || F.test($)) && (typeof L == "string" ? delete B[$] : L && !L.meta && (this._cache.delete(L.schema), delete B[$]));
        }
      }
      _addSchema(B, F, $, L = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let q;
        const { schemaId: oe } = this.opts;
        if (typeof B == "object")
          q = B[oe];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof B != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let ae = this._cache.get(B);
        if (ae !== void 0)
          return ae;
        $ = (0, c.normalizeId)(q || $);
        const le = c.getSchemaRefs.call(this, B, $);
        return ae = new l.SchemaEnv({ schema: B, schemaId: oe, meta: F, baseId: $, localRefs: le }), this._cache.set(ae.schema, ae), N && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = ae), L && this.validateSchema(B, !0), ae;
      }
      _checkUnique(B) {
        if (this.schemas[B] || this.refs[B])
          throw new Error(`schema with key or id "${B}" already exists`);
      }
      _compileSchemaEnv(B) {
        if (B.meta ? this._compileMetaSchema(B) : l.compileSchema.call(this, B), !B.validate)
          throw new Error("ajv implementation error");
        return B.validate;
      }
      _compileMetaSchema(B) {
        const F = this.opts;
        this.opts = this._metaOpts;
        try {
          l.compileSchema.call(this, B);
        } finally {
          this.opts = F;
        }
      }
    }
    T.ValidationError = i.default, T.MissingRefError = a.default, e.default = T;
    function v(Q, B, F, $ = "error") {
      for (const L in Q) {
        const N = L;
        N in B && this.logger[$](`${F}: option ${L}. ${Q[N]}`);
      }
    }
    function x(Q) {
      return Q = (0, c.normalizeId)(Q), this.schemas[Q] || this.refs[Q];
    }
    function C() {
      const Q = this.opts.schemas;
      if (Q)
        if (Array.isArray(Q))
          this.addSchema(Q);
        else
          for (const B in Q)
            this.addSchema(Q[B], B);
    }
    function P() {
      for (const Q in this.opts.formats) {
        const B = this.opts.formats[Q];
        B && this.addFormat(Q, B);
      }
    }
    function R(Q) {
      if (Array.isArray(Q)) {
        this.addVocabulary(Q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const B in Q) {
        const F = Q[B];
        F.keyword || (F.keyword = B), this.addKeyword(F);
      }
    }
    function S() {
      const Q = { ...this.opts };
      for (const B of h)
        delete Q[B];
      return Q;
    }
    const O = { log() {
    }, warn() {
    }, error() {
    } };
    function E(Q) {
      if (Q === !1)
        return O;
      if (Q === void 0)
        return console;
      if (Q.log && Q.warn && Q.error)
        return Q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const M = /^[a-z_$][a-z0-9_$:-]*$/i;
    function w(Q, B) {
      const { RULES: F } = this;
      if ((0, o.eachItem)(Q, ($) => {
        if (F.keywords[$])
          throw new Error(`Keyword ${$} is already defined`);
        if (!M.test($))
          throw new Error(`Keyword ${$} has invalid name`);
      }), !!B && B.$data && !("code" in B || "validate" in B))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function G(Q, B, F) {
      var $;
      const L = B?.post;
      if (F && L)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let q = L ? N.post : N.rules.find(({ type: ae }) => ae === F);
      if (q || (q = { type: F, rules: [] }, N.rules.push(q)), N.keywords[Q] = !0, !B)
        return;
      const oe = {
        keyword: Q,
        definition: {
          ...B,
          type: (0, n.getJSONTypes)(B.type),
          schemaType: (0, n.getJSONTypes)(B.schemaType)
        }
      };
      B.before ? ee.call(this, q, oe, B.before) : q.rules.push(oe), N.all[Q] = oe, ($ = B.implements) === null || $ === void 0 || $.forEach((ae) => this.addKeyword(ae));
    }
    function ee(Q, B, F) {
      const $ = Q.rules.findIndex((L) => L.keyword === F);
      $ >= 0 ? Q.rules.splice($, 0, B) : (Q.rules.push(B), this.logger.warn(`rule ${F} is not defined`));
    }
    function Y(Q) {
      let { metaSchema: B } = Q;
      B !== void 0 && (Q.$data && this.opts.$data && (B = Z(B)), Q.validateSchema = this.compile(B, !0));
    }
    const ne = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Z(Q) {
      return { anyOf: [Q, ne] };
    }
  })(ua)), ua;
}
var or = {}, sr = {}, lr = {}, Gn;
function oc() {
  if (Gn) return lr;
  Gn = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return lr.default = e, lr;
}
var nt = {}, Xn;
function sc() {
  if (Xn) return nt;
  Xn = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.callRef = nt.getValidate = void 0;
  const e = /* @__PURE__ */ ra(), r = /* @__PURE__ */ Ve(), t = /* @__PURE__ */ ge(), i = /* @__PURE__ */ ct(), a = /* @__PURE__ */ Qa(), s = /* @__PURE__ */ xe(), l = {
    keyword: "$ref",
    schemaType: "string",
    code(n) {
      const { gen: o, schema: f, it: g } = n, { baseId: d, schemaEnv: h, validateName: u, opts: y, self: m } = g, { root: p } = h;
      if ((f === "#" || f === "#/") && d === p.baseId)
        return T();
      const _ = a.resolveRef.call(m, p, d, f);
      if (_ === void 0)
        throw new e.default(g.opts.uriResolver, d, f);
      if (_ instanceof a.SchemaEnv)
        return v(_);
      return x(_);
      function T() {
        if (h === p)
          return c(n, u, h, h.$async);
        const C = o.scopeValue("root", { ref: p });
        return c(n, (0, t._)`${C}.validate`, p, p.$async);
      }
      function v(C) {
        const P = A(n, C);
        c(n, P, C, C.$async);
      }
      function x(C) {
        const P = o.scopeValue("schema", y.code.source === !0 ? { ref: C, code: (0, t.stringify)(C) } : { ref: C }), R = o.name("valid"), S = n.subschema({
          schema: C,
          dataTypes: [],
          schemaPath: t.nil,
          topSchemaRef: P,
          errSchemaPath: f
        }, R);
        n.mergeEvaluated(S), n.ok(R);
      }
    }
  };
  function A(n, o) {
    const { gen: f } = n;
    return o.validate ? f.scopeValue("validate", { ref: o.validate }) : (0, t._)`${f.scopeValue("wrapper", { ref: o })}.validate`;
  }
  nt.getValidate = A;
  function c(n, o, f, g) {
    const { gen: d, it: h } = n, { allErrors: u, schemaEnv: y, opts: m } = h, p = m.passContext ? i.default.this : t.nil;
    g ? _() : T();
    function _() {
      if (!y.$async)
        throw new Error("async schema referenced by sync schema");
      const C = d.let("valid");
      d.try(() => {
        d.code((0, t._)`await ${(0, r.callValidateCode)(n, o, p)}`), x(o), u || d.assign(C, !0);
      }, (P) => {
        d.if((0, t._)`!(${P} instanceof ${h.ValidationError})`, () => d.throw(P)), v(P), u || d.assign(C, !1);
      }), n.ok(C);
    }
    function T() {
      n.result((0, r.callValidateCode)(n, o, p), () => x(o), () => v(o));
    }
    function v(C) {
      const P = (0, t._)`${C}.errors`;
      d.assign(i.default.vErrors, (0, t._)`${i.default.vErrors} === null ? ${P} : ${i.default.vErrors}.concat(${P})`), d.assign(i.default.errors, (0, t._)`${i.default.vErrors}.length`);
    }
    function x(C) {
      var P;
      if (!h.opts.unevaluated)
        return;
      const R = (P = f?.validate) === null || P === void 0 ? void 0 : P.evaluated;
      if (h.props !== !0)
        if (R && !R.dynamicProps)
          R.props !== void 0 && (h.props = s.mergeEvaluated.props(d, R.props, h.props));
        else {
          const S = d.var("props", (0, t._)`${C}.evaluated.props`);
          h.props = s.mergeEvaluated.props(d, S, h.props, t.Name);
        }
      if (h.items !== !0)
        if (R && !R.dynamicItems)
          R.items !== void 0 && (h.items = s.mergeEvaluated.items(d, R.items, h.items));
        else {
          const S = d.var("items", (0, t._)`${C}.evaluated.items`);
          h.items = s.mergeEvaluated.items(d, S, h.items, t.Name);
        }
    }
  }
  return nt.callRef = c, nt.default = l, nt;
}
var Hn;
function lc() {
  if (Hn) return sr;
  Hn = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ oc(), r = /* @__PURE__ */ sc(), t = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    r.default
  ];
  return sr.default = t, sr;
}
var cr = {}, Ar = {}, Wn;
function cc() {
  if (Wn) return Ar;
  Wn = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = e.operators, t = {
    maximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
    minimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
    exclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
    exclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
  }, i = {
    message: ({ keyword: s, schemaCode: l }) => (0, e.str)`must be ${t[s].okStr} ${l}`,
    params: ({ keyword: s, schemaCode: l }) => (0, e._)`{comparison: ${t[s].okStr}, limit: ${l}}`
  }, a = {
    keyword: Object.keys(t),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: i,
    code(s) {
      const { keyword: l, data: A, schemaCode: c } = s;
      s.fail$data((0, e._)`${A} ${t[l].fail} ${c} || isNaN(${A})`);
    }
  };
  return Ar.default = a, Ar;
}
var dr = {}, qn;
function Ac() {
  if (qn) return dr;
  qn = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, e.str)`must be multiple of ${i}`,
      params: ({ schemaCode: i }) => (0, e._)`{multipleOf: ${i}}`
    },
    code(i) {
      const { gen: a, data: s, schemaCode: l, it: A } = i, c = A.opts.multipleOfPrecision, n = a.let("res"), o = c ? (0, e._)`Math.abs(Math.round(${n}) - ${n}) > 1e-${c}` : (0, e._)`${n} !== parseInt(${n})`;
      i.fail$data((0, e._)`(${l} === 0 || (${n} = ${s}/${l}, ${o}))`);
    }
  };
  return dr.default = t, dr;
}
var fr = {}, ur = {}, Vn;
function dc() {
  if (Vn) return ur;
  Vn = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  function e(r) {
    const t = r.length;
    let i = 0, a = 0, s;
    for (; a < t; )
      i++, s = r.charCodeAt(a++), s >= 55296 && s <= 56319 && a < t && (s = r.charCodeAt(a), (s & 64512) === 56320 && a++);
    return i;
  }
  return ur.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', ur;
}
var Qn;
function fc() {
  if (Qn) return fr;
  Qn = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ dc(), a = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: l }) {
        const A = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${A} than ${l} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: l, data: A, schemaCode: c, it: n } = s, o = l === "maxLength" ? e.operators.GT : e.operators.LT, f = n.opts.unicode === !1 ? (0, e._)`${A}.length` : (0, e._)`${(0, r.useFunc)(s.gen, t.default)}(${A})`;
      s.fail$data((0, e._)`${f} ${o} ${c}`);
    }
  };
  return fr.default = a, fr;
}
var hr = {}, jn;
function uc() {
  if (jn) return hr;
  jn = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ve(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ ge(), a = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, t.str)`must match pattern "${s}"`,
      params: ({ schemaCode: s }) => (0, t._)`{pattern: ${s}}`
    },
    code(s) {
      const { gen: l, data: A, $data: c, schema: n, schemaCode: o, it: f } = s, g = f.opts.unicodeRegExp ? "u" : "";
      if (c) {
        const { regExp: d } = f.opts.code, h = d.code === "new RegExp" ? (0, t._)`new RegExp` : (0, r.useFunc)(l, d), u = l.let("valid");
        l.try(() => l.assign(u, (0, t._)`${h}(${o}, ${g}).test(${A})`), () => l.assign(u, !1)), s.fail$data((0, t._)`!${u}`);
      } else {
        const d = (0, e.usePattern)(s, n);
        s.fail$data((0, t._)`!${d}.test(${A})`);
      }
    }
  };
  return hr.default = a, hr;
}
var pr = {}, Yn;
function hc() {
  if (Yn) return pr;
  Yn = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: i, schemaCode: a }) {
        const s = i === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} properties`;
      },
      params: ({ schemaCode: i }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { keyword: a, data: s, schemaCode: l } = i, A = a === "maxProperties" ? e.operators.GT : e.operators.LT;
      i.fail$data((0, e._)`Object.keys(${s}).length ${A} ${l}`);
    }
  };
  return pr.default = t, pr;
}
var mr = {}, Kn;
function pc() {
  if (Kn) return mr;
  Kn = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ve(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ xe(), a = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, r.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, r._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: l, schema: A, schemaCode: c, data: n, $data: o, it: f } = s, { opts: g } = f;
      if (!o && A.length === 0)
        return;
      const d = A.length >= g.loopRequired;
      if (f.allErrors ? h() : u(), g.strictRequired) {
        const p = s.parentSchema.properties, { definedProperties: _ } = s.it;
        for (const T of A)
          if (p?.[T] === void 0 && !_.has(T)) {
            const v = f.schemaEnv.baseId + f.errSchemaPath, x = `required property "${T}" is not defined at "${v}" (strictRequired)`;
            (0, t.checkStrictMode)(f, x, f.opts.strictRequired);
          }
      }
      function h() {
        if (d || o)
          s.block$data(r.nil, y);
        else
          for (const p of A)
            (0, e.checkReportMissingProp)(s, p);
      }
      function u() {
        const p = l.let("missing");
        if (d || o) {
          const _ = l.let("valid", !0);
          s.block$data(_, () => m(p, _)), s.ok(_);
        } else
          l.if((0, e.checkMissingProp)(s, A, p)), (0, e.reportMissingProp)(s, p), l.else();
      }
      function y() {
        l.forOf("prop", c, (p) => {
          s.setParams({ missingProperty: p }), l.if((0, e.noPropertyInData)(l, n, p, g.ownProperties), () => s.error());
        });
      }
      function m(p, _) {
        s.setParams({ missingProperty: p }), l.forOf(p, c, () => {
          l.assign(_, (0, e.propertyInData)(l, n, p, g.ownProperties)), l.if((0, r.not)(_), () => {
            s.error(), l.break();
          });
        }, r.nil);
      }
    }
  };
  return mr.default = a, mr;
}
var gr = {}, Jn;
function mc() {
  if (Jn) return gr;
  Jn = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: i, schemaCode: a }) {
        const s = i === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} items`;
      },
      params: ({ schemaCode: i }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { keyword: a, data: s, schemaCode: l } = i, A = a === "maxItems" ? e.operators.GT : e.operators.LT;
      i.fail$data((0, e._)`${s}.length ${A} ${l}`);
    }
  };
  return gr.default = t, gr;
}
var yr = {}, vr = {}, Zn;
function ja() {
  if (Zn) return vr;
  Zn = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = Ao();
  return e.code = 'require("ajv/dist/runtime/equal").default', vr.default = e, vr;
}
var ei;
function gc() {
  if (ei) return yr;
  ei = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Yr(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ xe(), i = /* @__PURE__ */ ja(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: l, j: A } }) => (0, r.str)`must NOT have duplicate items (items ## ${A} and ${l} are identical)`,
      params: ({ params: { i: l, j: A } }) => (0, r._)`{i: ${l}, j: ${A}}`
    },
    code(l) {
      const { gen: A, data: c, $data: n, schema: o, parentSchema: f, schemaCode: g, it: d } = l;
      if (!n && !o)
        return;
      const h = A.let("valid"), u = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      l.block$data(h, y, (0, r._)`${g} === false`), l.ok(h);
      function y() {
        const T = A.let("i", (0, r._)`${c}.length`), v = A.let("j");
        l.setParams({ i: T, j: v }), A.assign(h, !0), A.if((0, r._)`${T} > 1`, () => (m() ? p : _)(T, v));
      }
      function m() {
        return u.length > 0 && !u.some((T) => T === "object" || T === "array");
      }
      function p(T, v) {
        const x = A.name("item"), C = (0, e.checkDataTypes)(u, x, d.opts.strictNumbers, e.DataType.Wrong), P = A.const("indices", (0, r._)`{}`);
        A.for((0, r._)`;${T}--;`, () => {
          A.let(x, (0, r._)`${c}[${T}]`), A.if(C, (0, r._)`continue`), u.length > 1 && A.if((0, r._)`typeof ${x} == "string"`, (0, r._)`${x} += "_"`), A.if((0, r._)`typeof ${P}[${x}] == "number"`, () => {
            A.assign(v, (0, r._)`${P}[${x}]`), l.error(), A.assign(h, !1).break();
          }).code((0, r._)`${P}[${x}] = ${T}`);
        });
      }
      function _(T, v) {
        const x = (0, t.useFunc)(A, i.default), C = A.name("outer");
        A.label(C).for((0, r._)`;${T}--;`, () => A.for((0, r._)`${v} = ${T}; ${v}--;`, () => A.if((0, r._)`${x}(${c}[${T}], ${c}[${v}])`, () => {
          l.error(), A.assign(h, !1).break(C);
        })));
      }
    }
  };
  return yr.default = s, yr;
}
var br = {}, ti;
function yc() {
  if (ti) return br;
  ti = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ ja(), a = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: l, data: A, $data: c, schemaCode: n, schema: o } = s;
      c || o && typeof o == "object" ? s.fail$data((0, e._)`!${(0, r.useFunc)(l, t.default)}(${A}, ${n})`) : s.fail((0, e._)`${o} !== ${A}`);
    }
  };
  return br.default = a, br;
}
var wr = {}, ri;
function vc() {
  if (ri) return wr;
  ri = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ ja(), a = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: l, data: A, $data: c, schema: n, schemaCode: o, it: f } = s;
      if (!c && n.length === 0)
        throw new Error("enum must have non-empty array");
      const g = n.length >= f.opts.loopEnum;
      let d;
      const h = () => d ?? (d = (0, r.useFunc)(l, t.default));
      let u;
      if (g || c)
        u = l.let("valid"), s.block$data(u, y);
      else {
        if (!Array.isArray(n))
          throw new Error("ajv implementation error");
        const p = l.const("vSchema", o);
        u = (0, e.or)(...n.map((_, T) => m(p, T)));
      }
      s.pass(u);
      function y() {
        l.assign(u, !1), l.forOf("v", o, (p) => l.if((0, e._)`${h()}(${A}, ${p})`, () => l.assign(u, !0).break()));
      }
      function m(p, _) {
        const T = n[_];
        return typeof T == "object" && T !== null ? (0, e._)`${h()}(${A}, ${p}[${_}])` : (0, e._)`${A} === ${T}`;
      }
    }
  };
  return wr.default = a, wr;
}
var ai;
function bc() {
  if (ai) return cr;
  ai = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ cc(), r = /* @__PURE__ */ Ac(), t = /* @__PURE__ */ fc(), i = /* @__PURE__ */ uc(), a = /* @__PURE__ */ hc(), s = /* @__PURE__ */ pc(), l = /* @__PURE__ */ mc(), A = /* @__PURE__ */ gc(), c = /* @__PURE__ */ yc(), n = /* @__PURE__ */ vc(), o = [
    // number
    e.default,
    r.default,
    // string
    t.default,
    i.default,
    // object
    a.default,
    s.default,
    // array
    l.default,
    A.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    c.default,
    n.default
  ];
  return cr.default = o, cr;
}
var _r = {}, _t = {}, ni;
function uo() {
  if (ni) return _t;
  ni = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.validateAdditionalItems = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), i = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: l, it: A } = s, { items: c } = l;
      if (!Array.isArray(c)) {
        (0, r.checkStrictMode)(A, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      a(s, c);
    }
  };
  function a(s, l) {
    const { gen: A, schema: c, data: n, keyword: o, it: f } = s;
    f.items = !0;
    const g = A.const("len", (0, e._)`${n}.length`);
    if (c === !1)
      s.setParams({ len: l.length }), s.pass((0, e._)`${g} <= ${l.length}`);
    else if (typeof c == "object" && !(0, r.alwaysValidSchema)(f, c)) {
      const h = A.var("valid", (0, e._)`${g} <= ${l.length}`);
      A.if((0, e.not)(h), () => d(h)), s.ok(h);
    }
    function d(h) {
      A.forRange("i", l.length, g, (u) => {
        s.subschema({ keyword: o, dataProp: u, dataPropType: r.Type.Num }, h), f.allErrors || A.if((0, e.not)(h), () => A.break());
      });
    }
  }
  return _t.validateAdditionalItems = a, _t.default = i, _t;
}
var xr = {}, xt = {}, ii;
function ho() {
  if (ii) return xt;
  ii = 1, Object.defineProperty(xt, "__esModule", { value: !0 }), xt.validateTuple = void 0;
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ Ve(), i = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: l, it: A } = s;
      if (Array.isArray(l))
        return a(s, "additionalItems", l);
      A.items = !0, !(0, r.alwaysValidSchema)(A, l) && s.ok((0, t.validateArray)(s));
    }
  };
  function a(s, l, A = s.schema) {
    const { gen: c, parentSchema: n, data: o, keyword: f, it: g } = s;
    u(n), g.opts.unevaluated && A.length && g.items !== !0 && (g.items = r.mergeEvaluated.items(c, A.length, g.items));
    const d = c.name("valid"), h = c.const("len", (0, e._)`${o}.length`);
    A.forEach((y, m) => {
      (0, r.alwaysValidSchema)(g, y) || (c.if((0, e._)`${h} > ${m}`, () => s.subschema({
        keyword: f,
        schemaProp: m,
        dataProp: m
      }, d)), s.ok(d));
    });
    function u(y) {
      const { opts: m, errSchemaPath: p } = g, _ = A.length, T = _ === y.minItems && (_ === y.maxItems || y[l] === !1);
      if (m.strictTuples && !T) {
        const v = `"${f}" is ${_}-tuple, but minItems or maxItems/${l} are not specified or different at path "${p}"`;
        (0, r.checkStrictMode)(g, v, m.strictTuples);
      }
    }
  }
  return xt.validateTuple = a, xt.default = i, xt;
}
var oi;
function wc() {
  if (oi) return xr;
  oi = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ho(), r = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (t) => (0, e.validateTuple)(t, "items")
  };
  return xr.default = r, xr;
}
var Cr = {}, si;
function _c() {
  if (si) return Cr;
  si = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), t = /* @__PURE__ */ Ve(), i = /* @__PURE__ */ uo(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { schema: A, parentSchema: c, it: n } = l, { prefixItems: o } = c;
      n.items = !0, !(0, r.alwaysValidSchema)(n, A) && (o ? (0, i.validateAdditionalItems)(l, o) : l.ok((0, t.validateArray)(l)));
    }
  };
  return Cr.default = s, Cr;
}
var Tr = {}, li;
function xc() {
  if (li) return Tr;
  li = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), i = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${a} valid item(s)` : (0, e.str)`must contain at least ${a} and no more than ${s} valid item(s)`,
      params: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${a}}` : (0, e._)`{minContains: ${a}, maxContains: ${s}}`
    },
    code(a) {
      const { gen: s, schema: l, parentSchema: A, data: c, it: n } = a;
      let o, f;
      const { minContains: g, maxContains: d } = A;
      n.opts.next ? (o = g === void 0 ? 1 : g, f = d) : o = 1;
      const h = s.const("len", (0, e._)`${c}.length`);
      if (a.setParams({ min: o, max: f }), f === void 0 && o === 0) {
        (0, r.checkStrictMode)(n, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && o > f) {
        (0, r.checkStrictMode)(n, '"minContains" > "maxContains" is always invalid'), a.fail();
        return;
      }
      if ((0, r.alwaysValidSchema)(n, l)) {
        let _ = (0, e._)`${h} >= ${o}`;
        f !== void 0 && (_ = (0, e._)`${_} && ${h} <= ${f}`), a.pass(_);
        return;
      }
      n.items = !0;
      const u = s.name("valid");
      f === void 0 && o === 1 ? m(u, () => s.if(u, () => s.break())) : o === 0 ? (s.let(u, !0), f !== void 0 && s.if((0, e._)`${c}.length > 0`, y)) : (s.let(u, !1), y()), a.result(u, () => a.reset());
      function y() {
        const _ = s.name("_valid"), T = s.let("count", 0);
        m(_, () => s.if(_, () => p(T)));
      }
      function m(_, T) {
        s.forRange("i", 0, h, (v) => {
          a.subschema({
            keyword: "contains",
            dataProp: v,
            dataPropType: r.Type.Num,
            compositeRule: !0
          }, _), T();
        });
      }
      function p(_) {
        s.code((0, e._)`${_}++`), f === void 0 ? s.if((0, e._)`${_} >= ${o}`, () => s.assign(u, !0).break()) : (s.if((0, e._)`${_} > ${f}`, () => s.assign(u, !1).break()), o === 1 ? s.assign(u, !0) : s.if((0, e._)`${_} >= ${o}`, () => s.assign(u, !0)));
      }
    }
  };
  return Tr.default = i, Tr;
}
var _a = {}, ci;
function Cc() {
  return ci || (ci = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ xe(), i = /* @__PURE__ */ Ve();
    e.error = {
      message: ({ params: { property: c, depsCount: n, deps: o } }) => {
        const f = n === 1 ? "property" : "properties";
        return (0, r.str)`must have ${f} ${o} when property ${c} is present`;
      },
      params: ({ params: { property: c, depsCount: n, deps: o, missingProperty: f } }) => (0, r._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${n},
    deps: ${o}}`
      // TODO change to reference
    };
    const a = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(c) {
        const [n, o] = s(c);
        l(c, n), A(c, o);
      }
    };
    function s({ schema: c }) {
      const n = {}, o = {};
      for (const f in c) {
        if (f === "__proto__")
          continue;
        const g = Array.isArray(c[f]) ? n : o;
        g[f] = c[f];
      }
      return [n, o];
    }
    function l(c, n = c.schema) {
      const { gen: o, data: f, it: g } = c;
      if (Object.keys(n).length === 0)
        return;
      const d = o.let("missing");
      for (const h in n) {
        const u = n[h];
        if (u.length === 0)
          continue;
        const y = (0, i.propertyInData)(o, f, h, g.opts.ownProperties);
        c.setParams({
          property: h,
          depsCount: u.length,
          deps: u.join(", ")
        }), g.allErrors ? o.if(y, () => {
          for (const m of u)
            (0, i.checkReportMissingProp)(c, m);
        }) : (o.if((0, r._)`${y} && (${(0, i.checkMissingProp)(c, u, d)})`), (0, i.reportMissingProp)(c, d), o.else());
      }
    }
    e.validatePropertyDeps = l;
    function A(c, n = c.schema) {
      const { gen: o, data: f, keyword: g, it: d } = c, h = o.name("valid");
      for (const u in n)
        (0, t.alwaysValidSchema)(d, n[u]) || (o.if(
          (0, i.propertyInData)(o, f, u, d.opts.ownProperties),
          () => {
            const y = c.subschema({ keyword: g, schemaProp: u }, h);
            c.mergeValidEvaluated(y, h);
          },
          () => o.var(h, !0)
          // TODO var
        ), c.ok(h));
    }
    e.validateSchemaDeps = A, e.default = a;
  })(_a)), _a;
}
var Er = {}, Ai;
function Tc() {
  if (Ai) return Er;
  Ai = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), i = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: a }) => (0, e._)`{propertyName: ${a.propertyName}}`
    },
    code(a) {
      const { gen: s, schema: l, data: A, it: c } = a;
      if ((0, r.alwaysValidSchema)(c, l))
        return;
      const n = s.name("valid");
      s.forIn("key", A, (o) => {
        a.setParams({ propertyName: o }), a.subschema({
          keyword: "propertyNames",
          data: o,
          dataTypes: ["string"],
          propertyName: o,
          compositeRule: !0
        }, n), s.if((0, e.not)(n), () => {
          a.error(!0), c.allErrors || s.break();
        });
      }), a.ok(n);
    }
  };
  return Er.default = i, Er;
}
var Lr = {}, di;
function po() {
  if (di) return Lr;
  di = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ve(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ ct(), i = /* @__PURE__ */ xe(), s = {
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
      const { gen: A, schema: c, parentSchema: n, data: o, errsCount: f, it: g } = l;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: d, opts: h } = g;
      if (g.props = !0, h.removeAdditional !== "all" && (0, i.alwaysValidSchema)(g, c))
        return;
      const u = (0, e.allSchemaProperties)(n.properties), y = (0, e.allSchemaProperties)(n.patternProperties);
      m(), l.ok((0, r._)`${f} === ${t.default.errors}`);
      function m() {
        A.forIn("key", o, (x) => {
          !u.length && !y.length ? T(x) : A.if(p(x), () => T(x));
        });
      }
      function p(x) {
        let C;
        if (u.length > 8) {
          const P = (0, i.schemaRefOrVal)(g, n.properties, "properties");
          C = (0, e.isOwnProperty)(A, P, x);
        } else u.length ? C = (0, r.or)(...u.map((P) => (0, r._)`${x} === ${P}`)) : C = r.nil;
        return y.length && (C = (0, r.or)(C, ...y.map((P) => (0, r._)`${(0, e.usePattern)(l, P)}.test(${x})`))), (0, r.not)(C);
      }
      function _(x) {
        A.code((0, r._)`delete ${o}[${x}]`);
      }
      function T(x) {
        if (h.removeAdditional === "all" || h.removeAdditional && c === !1) {
          _(x);
          return;
        }
        if (c === !1) {
          l.setParams({ additionalProperty: x }), l.error(), d || A.break();
          return;
        }
        if (typeof c == "object" && !(0, i.alwaysValidSchema)(g, c)) {
          const C = A.name("valid");
          h.removeAdditional === "failing" ? (v(x, C, !1), A.if((0, r.not)(C), () => {
            l.reset(), _(x);
          })) : (v(x, C), d || A.if((0, r.not)(C), () => A.break()));
        }
      }
      function v(x, C, P) {
        const R = {
          keyword: "additionalProperties",
          dataProp: x,
          dataPropType: i.Type.Str
        };
        P === !1 && Object.assign(R, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), l.subschema(R, C);
      }
    }
  };
  return Lr.default = s, Lr;
}
var Dr = {}, fi;
function Ec() {
  if (fi) return Dr;
  fi = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ta(), r = /* @__PURE__ */ Ve(), t = /* @__PURE__ */ xe(), i = /* @__PURE__ */ po(), a = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: l, schema: A, parentSchema: c, data: n, it: o } = s;
      o.opts.removeAdditional === "all" && c.additionalProperties === void 0 && i.default.code(new e.KeywordCxt(o, i.default, "additionalProperties"));
      const f = (0, r.allSchemaProperties)(A);
      for (const y of f)
        o.definedProperties.add(y);
      o.opts.unevaluated && f.length && o.props !== !0 && (o.props = t.mergeEvaluated.props(l, (0, t.toHash)(f), o.props));
      const g = f.filter((y) => !(0, t.alwaysValidSchema)(o, A[y]));
      if (g.length === 0)
        return;
      const d = l.name("valid");
      for (const y of g)
        h(y) ? u(y) : (l.if((0, r.propertyInData)(l, n, y, o.opts.ownProperties)), u(y), o.allErrors || l.else().var(d, !0), l.endIf()), s.it.definedProperties.add(y), s.ok(d);
      function h(y) {
        return o.opts.useDefaults && !o.compositeRule && A[y].default !== void 0;
      }
      function u(y) {
        s.subschema({
          keyword: "properties",
          schemaProp: y,
          dataProp: y
        }, d);
      }
    }
  };
  return Dr.default = a, Dr;
}
var Rr = {}, ui;
function Lc() {
  if (ui) return Rr;
  ui = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ve(), r = /* @__PURE__ */ ge(), t = /* @__PURE__ */ xe(), i = /* @__PURE__ */ xe(), a = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: l, schema: A, data: c, parentSchema: n, it: o } = s, { opts: f } = o, g = (0, e.allSchemaProperties)(A), d = g.filter((T) => (0, t.alwaysValidSchema)(o, A[T]));
      if (g.length === 0 || d.length === g.length && (!o.opts.unevaluated || o.props === !0))
        return;
      const h = f.strictSchema && !f.allowMatchingProperties && n.properties, u = l.name("valid");
      o.props !== !0 && !(o.props instanceof r.Name) && (o.props = (0, i.evaluatedPropsToName)(l, o.props));
      const { props: y } = o;
      m();
      function m() {
        for (const T of g)
          h && p(T), o.allErrors ? _(T) : (l.var(u, !0), _(T), l.if(u));
      }
      function p(T) {
        for (const v in h)
          new RegExp(T).test(v) && (0, t.checkStrictMode)(o, `property ${v} matches pattern ${T} (use allowMatchingProperties)`);
      }
      function _(T) {
        l.forIn("key", c, (v) => {
          l.if((0, r._)`${(0, e.usePattern)(s, T)}.test(${v})`, () => {
            const x = d.includes(T);
            x || s.subschema({
              keyword: "patternProperties",
              schemaProp: T,
              dataProp: v,
              dataPropType: i.Type.Str
            }, u), o.opts.unevaluated && y !== !0 ? l.assign((0, r._)`${y}[${v}]`, !0) : !x && !o.allErrors && l.if((0, r.not)(u), () => l.break());
          });
        });
      }
    }
  };
  return Rr.default = a, Rr;
}
var Br = {}, hi;
function Dc() {
  if (hi) return Br;
  hi = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ xe(), r = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(t) {
      const { gen: i, schema: a, it: s } = t;
      if ((0, e.alwaysValidSchema)(s, a)) {
        t.fail();
        return;
      }
      const l = i.name("valid");
      t.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l), t.failResult(l, () => t.reset(), () => t.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Br.default = r, Br;
}
var Pr = {}, pi;
function Rc() {
  if (pi) return Pr;
  pi = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const r = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: (/* @__PURE__ */ Ve()).validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Pr.default = r, Pr;
}
var Nr = {}, mi;
function Bc() {
  if (mi) return Nr;
  mi = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), i = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: a }) => (0, e._)`{passingSchemas: ${a.passing}}`
    },
    code(a) {
      const { gen: s, schema: l, parentSchema: A, it: c } = a;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      if (c.opts.discriminator && A.discriminator)
        return;
      const n = l, o = s.let("valid", !1), f = s.let("passing", null), g = s.name("_valid");
      a.setParams({ passing: f }), s.block(d), a.result(o, () => a.reset(), () => a.error(!0));
      function d() {
        n.forEach((h, u) => {
          let y;
          (0, r.alwaysValidSchema)(c, h) ? s.var(g, !0) : y = a.subschema({
            keyword: "oneOf",
            schemaProp: u,
            compositeRule: !0
          }, g), u > 0 && s.if((0, e._)`${g} && ${o}`).assign(o, !1).assign(f, (0, e._)`[${f}, ${u}]`).else(), s.if(g, () => {
            s.assign(o, !0), s.assign(f, u), y && a.mergeEvaluated(y, e.Name);
          });
        });
      }
    }
  };
  return Nr.default = i, Nr;
}
var Ir = {}, gi;
function Pc() {
  if (gi) return Ir;
  gi = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ xe(), r = {
    keyword: "allOf",
    schemaType: "array",
    code(t) {
      const { gen: i, schema: a, it: s } = t;
      if (!Array.isArray(a))
        throw new Error("ajv implementation error");
      const l = i.name("valid");
      a.forEach((A, c) => {
        if ((0, e.alwaysValidSchema)(s, A))
          return;
        const n = t.subschema({ keyword: "allOf", schemaProp: c }, l);
        t.ok(l), t.mergeEvaluated(n);
      });
    }
  };
  return Ir.default = r, Ir;
}
var Sr = {}, yi;
function Nc() {
  if (yi) return Sr;
  yi = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ xe(), i = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: l, parentSchema: A, it: c } = s;
      A.then === void 0 && A.else === void 0 && (0, r.checkStrictMode)(c, '"if" without "then" and "else" is ignored');
      const n = a(c, "then"), o = a(c, "else");
      if (!n && !o)
        return;
      const f = l.let("valid", !0), g = l.name("_valid");
      if (d(), s.reset(), n && o) {
        const u = l.let("ifClause");
        s.setParams({ ifClause: u }), l.if(g, h("then", u), h("else", u));
      } else n ? l.if(g, h("then")) : l.if((0, e.not)(g), h("else"));
      s.pass(f, () => s.error(!0));
      function d() {
        const u = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, g);
        s.mergeEvaluated(u);
      }
      function h(u, y) {
        return () => {
          const m = s.subschema({ keyword: u }, g);
          l.assign(f, g), s.mergeValidEvaluated(m, f), y ? l.assign(y, (0, e._)`${u}`) : s.setParams({ ifClause: u });
        };
      }
    }
  };
  function a(s, l) {
    const A = s.schema[l];
    return A !== void 0 && !(0, r.alwaysValidSchema)(s, A);
  }
  return Sr.default = i, Sr;
}
var kr = {}, vi;
function Ic() {
  if (vi) return kr;
  vi = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ xe(), r = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: t, parentSchema: i, it: a }) {
      i.if === void 0 && (0, e.checkStrictMode)(a, `"${t}" without "if" is ignored`);
    }
  };
  return kr.default = r, kr;
}
var bi;
function Sc() {
  if (bi) return _r;
  bi = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ uo(), r = /* @__PURE__ */ wc(), t = /* @__PURE__ */ ho(), i = /* @__PURE__ */ _c(), a = /* @__PURE__ */ xc(), s = /* @__PURE__ */ Cc(), l = /* @__PURE__ */ Tc(), A = /* @__PURE__ */ po(), c = /* @__PURE__ */ Ec(), n = /* @__PURE__ */ Lc(), o = /* @__PURE__ */ Dc(), f = /* @__PURE__ */ Rc(), g = /* @__PURE__ */ Bc(), d = /* @__PURE__ */ Pc(), h = /* @__PURE__ */ Nc(), u = /* @__PURE__ */ Ic();
  function y(m = !1) {
    const p = [
      // any
      o.default,
      f.default,
      g.default,
      d.default,
      h.default,
      u.default,
      // object
      l.default,
      A.default,
      s.default,
      c.default,
      n.default
    ];
    return m ? p.push(r.default, i.default) : p.push(e.default, t.default), p.push(a.default), p;
  }
  return _r.default = y, _r;
}
var Fr = {}, Mr = {}, wi;
function kc() {
  if (wi) return Mr;
  wi = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), t = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, e.str)`must match format "${i}"`,
      params: ({ schemaCode: i }) => (0, e._)`{format: ${i}}`
    },
    code(i, a) {
      const { gen: s, data: l, $data: A, schema: c, schemaCode: n, it: o } = i, { opts: f, errSchemaPath: g, schemaEnv: d, self: h } = o;
      if (!f.validateFormats)
        return;
      A ? u() : y();
      function u() {
        const m = s.scopeValue("formats", {
          ref: h.formats,
          code: f.code.formats
        }), p = s.const("fDef", (0, e._)`${m}[${n}]`), _ = s.let("fType"), T = s.let("format");
        s.if((0, e._)`typeof ${p} == "object" && !(${p} instanceof RegExp)`, () => s.assign(_, (0, e._)`${p}.type || "string"`).assign(T, (0, e._)`${p}.validate`), () => s.assign(_, (0, e._)`"string"`).assign(T, p)), i.fail$data((0, e.or)(v(), x()));
        function v() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${n} && !${T}`;
        }
        function x() {
          const C = d.$async ? (0, e._)`(${p}.async ? await ${T}(${l}) : ${T}(${l}))` : (0, e._)`${T}(${l})`, P = (0, e._)`(typeof ${T} == "function" ? ${C} : ${T}.test(${l}))`;
          return (0, e._)`${T} && ${T} !== true && ${_} === ${a} && !${P}`;
        }
      }
      function y() {
        const m = h.formats[c];
        if (!m) {
          v();
          return;
        }
        if (m === !0)
          return;
        const [p, _, T] = x(m);
        p === a && i.pass(C());
        function v() {
          if (f.strictSchema === !1) {
            h.logger.warn(P());
            return;
          }
          throw new Error(P());
          function P() {
            return `unknown format "${c}" ignored in schema at path "${g}"`;
          }
        }
        function x(P) {
          const R = P instanceof RegExp ? (0, e.regexpCode)(P) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(c)}` : void 0, S = s.scopeValue("formats", { key: c, ref: P, code: R });
          return typeof P == "object" && !(P instanceof RegExp) ? [P.type || "string", P.validate, (0, e._)`${S}.validate`] : ["string", P, S];
        }
        function C() {
          if (typeof m == "object" && !(m instanceof RegExp) && m.async) {
            if (!d.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${T}(${l})`;
          }
          return typeof _ == "function" ? (0, e._)`${T}(${l})` : (0, e._)`${T}.test(${l})`;
        }
      }
    }
  };
  return Mr.default = t, Mr;
}
var _i;
function Fc() {
  if (_i) return Fr;
  _i = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const r = [(/* @__PURE__ */ kc()).default];
  return Fr.default = r, Fr;
}
var pt = {}, xi;
function Mc() {
  return xi || (xi = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.contentVocabulary = pt.metadataVocabulary = void 0, pt.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], pt.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), pt;
}
var Ci;
function Oc() {
  if (Ci) return or;
  Ci = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ lc(), r = /* @__PURE__ */ bc(), t = /* @__PURE__ */ Sc(), i = /* @__PURE__ */ Fc(), a = /* @__PURE__ */ Mc(), s = [
    e.default,
    r.default,
    (0, t.default)(),
    i.default,
    a.metadataVocabulary,
    a.contentVocabulary
  ];
  return or.default = s, or;
}
var Or = {}, Ft = {}, Ti;
function $c() {
  if (Ti) return Ft;
  Ti = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.DiscrError = void 0;
  var e;
  return (function(r) {
    r.Tag = "tag", r.Mapping = "mapping";
  })(e || (Ft.DiscrError = e = {})), Ft;
}
var Ei;
function zc() {
  if (Ei) return Or;
  Ei = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ge(), r = /* @__PURE__ */ $c(), t = /* @__PURE__ */ Qa(), i = /* @__PURE__ */ ra(), a = /* @__PURE__ */ xe(), l = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: A, tagName: c } }) => A === r.DiscrError.Tag ? `tag "${c}" must be string` : `value of tag "${c}" must be in oneOf`,
      params: ({ params: { discrError: A, tag: c, tagName: n } }) => (0, e._)`{error: ${A}, tag: ${n}, tagValue: ${c}}`
    },
    code(A) {
      const { gen: c, data: n, schema: o, parentSchema: f, it: g } = A, { oneOf: d } = f;
      if (!g.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const h = o.propertyName;
      if (typeof h != "string")
        throw new Error("discriminator: requires propertyName");
      if (o.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!d)
        throw new Error("discriminator: requires oneOf keyword");
      const u = c.let("valid", !1), y = c.const("tag", (0, e._)`${n}${(0, e.getProperty)(h)}`);
      c.if((0, e._)`typeof ${y} == "string"`, () => m(), () => A.error(!1, { discrError: r.DiscrError.Tag, tag: y, tagName: h })), A.ok(u);
      function m() {
        const T = _();
        c.if(!1);
        for (const v in T)
          c.elseIf((0, e._)`${y} === ${v}`), c.assign(u, p(T[v]));
        c.else(), A.error(!1, { discrError: r.DiscrError.Mapping, tag: y, tagName: h }), c.endIf();
      }
      function p(T) {
        const v = c.name("valid"), x = A.subschema({ keyword: "oneOf", schemaProp: T }, v);
        return A.mergeEvaluated(x, e.Name), v;
      }
      function _() {
        var T;
        const v = {}, x = P(f);
        let C = !0;
        for (let O = 0; O < d.length; O++) {
          let E = d[O];
          if (E?.$ref && !(0, a.schemaHasRulesButRef)(E, g.self.RULES)) {
            const w = E.$ref;
            if (E = t.resolveRef.call(g.self, g.schemaEnv.root, g.baseId, w), E instanceof t.SchemaEnv && (E = E.schema), E === void 0)
              throw new i.default(g.opts.uriResolver, g.baseId, w);
          }
          const M = (T = E?.properties) === null || T === void 0 ? void 0 : T[h];
          if (typeof M != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${h}"`);
          C = C && (x || P(E)), R(M, O);
        }
        if (!C)
          throw new Error(`discriminator: "${h}" must be required`);
        return v;
        function P({ required: O }) {
          return Array.isArray(O) && O.includes(h);
        }
        function R(O, E) {
          if (O.const)
            S(O.const, E);
          else if (O.enum)
            for (const M of O.enum)
              S(M, E);
          else
            throw new Error(`discriminator: "properties/${h}" must have "const" or "enum"`);
        }
        function S(O, E) {
          if (typeof O != "string" || O in v)
            throw new Error(`discriminator: "${h}" values must be unique strings`);
          v[O] = E;
        }
      }
    }
  };
  return Or.default = l, Or;
}
const Uc = "http://json-schema.org/draft-07/schema#", Gc = "http://json-schema.org/draft-07/schema#", Xc = "Core schema meta-schema", Hc = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Wc = ["object", "boolean"], qc = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Vc = {
  $schema: Uc,
  $id: Gc,
  title: Xc,
  definitions: Hc,
  type: Wc,
  properties: qc,
  default: !0
};
var Li;
function mo() {
  return Li || (Li = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.MissingRefError = r.ValidationError = r.CodeGen = r.Name = r.nil = r.stringify = r.str = r._ = r.KeywordCxt = r.Ajv = void 0;
    const t = /* @__PURE__ */ ic(), i = /* @__PURE__ */ Oc(), a = /* @__PURE__ */ zc(), s = Vc, l = ["/properties"], A = "http://json-schema.org/draft-07/schema";
    class c extends t.default {
      _addVocabularies() {
        super._addVocabularies(), i.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(a.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const h = this.opts.$data ? this.$dataMetaSchema(s, l) : s;
        this.addMetaSchema(h, A, !1), this.refs["http://json-schema.org/schema"] = A;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(A) ? A : void 0);
      }
    }
    r.Ajv = c, e.exports = r = c, e.exports.Ajv = c, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = c;
    var n = /* @__PURE__ */ ta();
    Object.defineProperty(r, "KeywordCxt", { enumerable: !0, get: function() {
      return n.KeywordCxt;
    } });
    var o = /* @__PURE__ */ ge();
    Object.defineProperty(r, "_", { enumerable: !0, get: function() {
      return o._;
    } }), Object.defineProperty(r, "str", { enumerable: !0, get: function() {
      return o.str;
    } }), Object.defineProperty(r, "stringify", { enumerable: !0, get: function() {
      return o.stringify;
    } }), Object.defineProperty(r, "nil", { enumerable: !0, get: function() {
      return o.nil;
    } }), Object.defineProperty(r, "Name", { enumerable: !0, get: function() {
      return o.Name;
    } }), Object.defineProperty(r, "CodeGen", { enumerable: !0, get: function() {
      return o.CodeGen;
    } });
    var f = /* @__PURE__ */ Va();
    Object.defineProperty(r, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var g = /* @__PURE__ */ ra();
    Object.defineProperty(r, "MissingRefError", { enumerable: !0, get: function() {
      return g.default;
    } });
  })(tr, tr.exports)), tr.exports;
}
var Qc = /* @__PURE__ */ mo();
const jc = /* @__PURE__ */ Fa(Qc);
var $r = { exports: {} }, xa = {}, Di;
function Yc() {
  return Di || (Di = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function r(O, E) {
      return { validate: O, compare: E };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: r(s, l),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: r(c(!0), n),
      "date-time": r(g(!0), d),
      "iso-time": r(c(), o),
      "iso-date-time": r(g(), h),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: m,
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
      regex: S,
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
      int32: { type: "number", validate: x },
      // signed 64 bit integer
      int64: { type: "number", validate: C },
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
      time: r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, n),
      "date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      "iso-time": r(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, o),
      "iso-date-time": r(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, h),
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
    const i = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(O) {
      const E = i.exec(O);
      if (!E)
        return !1;
      const M = +E[1], w = +E[2], G = +E[3];
      return w >= 1 && w <= 12 && G >= 1 && G <= (w === 2 && t(M) ? 29 : a[w]);
    }
    function l(O, E) {
      if (O && E)
        return O > E ? 1 : O < E ? -1 : 0;
    }
    const A = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function c(O) {
      return function(M) {
        const w = A.exec(M);
        if (!w)
          return !1;
        const G = +w[1], ee = +w[2], Y = +w[3], ne = w[4], Z = w[5] === "-" ? -1 : 1, Q = +(w[6] || 0), B = +(w[7] || 0);
        if (Q > 23 || B > 59 || O && !ne)
          return !1;
        if (G <= 23 && ee <= 59 && Y < 60)
          return !0;
        const F = ee - B * Z, $ = G - Q * Z - (F < 0 ? 1 : 0);
        return ($ === 23 || $ === -1) && (F === 59 || F === -1) && Y < 61;
      };
    }
    function n(O, E) {
      if (!(O && E))
        return;
      const M = (/* @__PURE__ */ new Date("2020-01-01T" + O)).valueOf(), w = (/* @__PURE__ */ new Date("2020-01-01T" + E)).valueOf();
      if (M && w)
        return M - w;
    }
    function o(O, E) {
      if (!(O && E))
        return;
      const M = A.exec(O), w = A.exec(E);
      if (M && w)
        return O = M[1] + M[2] + M[3], E = w[1] + w[2] + w[3], O > E ? 1 : O < E ? -1 : 0;
    }
    const f = /t|\s/i;
    function g(O) {
      const E = c(O);
      return function(w) {
        const G = w.split(f);
        return G.length === 2 && s(G[0]) && E(G[1]);
      };
    }
    function d(O, E) {
      if (!(O && E))
        return;
      const M = new Date(O).valueOf(), w = new Date(E).valueOf();
      if (M && w)
        return M - w;
    }
    function h(O, E) {
      if (!(O && E))
        return;
      const [M, w] = O.split(f), [G, ee] = E.split(f), Y = l(M, G);
      if (Y !== void 0)
        return Y || n(w, ee);
    }
    const u = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function m(O) {
      return u.test(O) && y.test(O);
    }
    const p = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function _(O) {
      return p.lastIndex = 0, p.test(O);
    }
    const T = -2147483648, v = 2 ** 31 - 1;
    function x(O) {
      return Number.isInteger(O) && O <= v && O >= T;
    }
    function C(O) {
      return Number.isInteger(O);
    }
    function P() {
      return !0;
    }
    const R = /[^\\]\\Z/;
    function S(O) {
      if (R.test(O))
        return !1;
      try {
        return new RegExp(O), !0;
      } catch {
        return !1;
      }
    }
  })(xa)), xa;
}
var Ca = {}, Ri;
function Kc() {
  return Ri || (Ri = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const r = /* @__PURE__ */ mo(), t = /* @__PURE__ */ ge(), i = t.operators, a = {
      formatMaximum: { okStr: "<=", ok: i.LTE, fail: i.GT },
      formatMinimum: { okStr: ">=", ok: i.GTE, fail: i.LT },
      formatExclusiveMaximum: { okStr: "<", ok: i.LT, fail: i.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: i.GT, fail: i.LTE }
    }, s = {
      message: ({ keyword: A, schemaCode: c }) => (0, t.str)`should be ${a[A].okStr} ${c}`,
      params: ({ keyword: A, schemaCode: c }) => (0, t._)`{comparison: ${a[A].okStr}, limit: ${c}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(a),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(A) {
        const { gen: c, data: n, schemaCode: o, keyword: f, it: g } = A, { opts: d, self: h } = g;
        if (!d.validateFormats)
          return;
        const u = new r.KeywordCxt(g, h.RULES.all.format.definition, "format");
        u.$data ? y() : m();
        function y() {
          const _ = c.scopeValue("formats", {
            ref: h.formats,
            code: d.code.formats
          }), T = c.const("fmt", (0, t._)`${_}[${u.schemaCode}]`);
          A.fail$data((0, t.or)((0, t._)`typeof ${T} != "object"`, (0, t._)`${T} instanceof RegExp`, (0, t._)`typeof ${T}.compare != "function"`, p(T)));
        }
        function m() {
          const _ = u.schema, T = h.formats[_];
          if (!T || T === !0)
            return;
          if (typeof T != "object" || T instanceof RegExp || typeof T.compare != "function")
            throw new Error(`"${f}": format "${_}" does not define "compare" function`);
          const v = c.scopeValue("formats", {
            key: _,
            ref: T,
            code: d.code.formats ? (0, t._)`${d.code.formats}${(0, t.getProperty)(_)}` : void 0
          });
          A.fail$data(p(v));
        }
        function p(_) {
          return (0, t._)`${_}.compare(${n}, ${o}) ${a[f].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const l = (A) => (A.addKeyword(e.formatLimitDefinition), A);
    e.default = l;
  })(Ca)), Ca;
}
var Bi;
function Jc() {
  return Bi || (Bi = 1, (function(e, r) {
    Object.defineProperty(r, "__esModule", { value: !0 });
    const t = Yc(), i = Kc(), a = /* @__PURE__ */ ge(), s = new a.Name("fullFormats"), l = new a.Name("fastFormats"), A = (n, o = { keywords: !0 }) => {
      if (Array.isArray(o))
        return c(n, o, t.fullFormats, s), n;
      const [f, g] = o.mode === "fast" ? [t.fastFormats, l] : [t.fullFormats, s], d = o.formats || t.formatNames;
      return c(n, d, f, g), o.keywords && (0, i.default)(n), n;
    };
    A.get = (n, o = "full") => {
      const g = (o === "fast" ? t.fastFormats : t.fullFormats)[n];
      if (!g)
        throw new Error(`Unknown format "${n}"`);
      return g;
    };
    function c(n, o, f, g) {
      var d, h;
      (d = (h = n.opts.code).formats) !== null && d !== void 0 || (h.formats = (0, a._)`require("ajv-formats/dist/formats").${g}`);
      for (const u of o)
        n.addFormat(u, f[u]);
    }
    e.exports = r = A, Object.defineProperty(r, "__esModule", { value: !0 }), r.default = A;
  })($r, $r.exports)), $r.exports;
}
var Zc = Jc();
const eA = /* @__PURE__ */ Fa(Zc), tA = "http://json-schema.org/draft-07/schema#", rA = "LectureDocument", aA = "object", nA = !1, iA = ["schemaVersion", "documentTitle", "direction", "overview", "sections", "endNote"], oA = { schemaVersion: { type: "string", enum: ["1.0", "1.1", "1.2"] }, documentTitle: { type: "string", minLength: 1 }, direction: { type: "string", enum: ["ltr", "rtl"] }, overview: { $ref: "#/definitions/LectureOverview" }, sections: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureSection" } }, endNote: { $ref: "#/definitions/RichText" }, extractionAudit: { $ref: "#/definitions/ExtractionAudit" } }, sA = { RichTextRun: { type: "object", additionalProperties: !1, required: ["text"], properties: { text: { type: "string", minLength: 1 }, emphasis: { type: "string", enum: ["none", "bold", "italic", "accent", "highlight"] } } }, RichText: { oneOf: [{ type: "string" }, { type: "array", minItems: 1, items: { $ref: "#/definitions/RichTextRun" } }] }, ListItem: { oneOf: [{ type: "string" }, { type: "object", additionalProperties: !1, required: ["text"], properties: { text: { $ref: "#/definitions/RichText" }, level: { type: "integer", minimum: 0 } } }] }, LectureOverview: { type: "object", additionalProperties: !1, required: ["title", "introduction", "keyPoints"], properties: { title: { type: "string", minLength: 1 }, introduction: { $ref: "#/definitions/RichText" }, keyPoints: { type: "array", items: { $ref: "#/definitions/RichText" } } } }, LectureSection: { type: "object", additionalProperties: !1, required: ["sectionId", "sectionTitle", "slides"], properties: { sectionId: { type: "string", minLength: 1 }, sectionTitle: { type: "string", minLength: 1 }, slides: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureSlide" } }, sectionDefinition: { $ref: "#/definitions/RichText" } } }, LectureSlide: { type: "object", additionalProperties: !1, required: ["slideId", "slideTitle", "slideSubtitle", "sourceReferences", "blocks"], properties: { slideId: { type: "string", minLength: 1 }, slideTitle: { type: "string" }, slideSubtitle: { $ref: "#/definitions/RichText" }, sourceReferences: { type: "array", items: { type: "string" } }, blocks: { type: "array", minItems: 1, items: { $ref: "#/definitions/LectureBlock" } }, titleDefinition: { $ref: "#/definitions/RichText" }, subtitleDefinition: { $ref: "#/definitions/RichText" } } }, LectureBlock: { oneOf: [{ $ref: "#/definitions/TitleBlock" }, { $ref: "#/definitions/SubtitleBlock" }, { $ref: "#/definitions/ParagraphBlock" }, { $ref: "#/definitions/BulletsBlock" }, { $ref: "#/definitions/NumberedBlock" }, { $ref: "#/definitions/CalloutBlock" }, { $ref: "#/definitions/TableBlock" }, { $ref: "#/definitions/DiagramBlock" }, { $ref: "#/definitions/ImageBlock" }] }, BaseBlock: { type: "object", required: ["blockId", "sourceReferences"], properties: { blockId: { type: "string", minLength: 1 }, sourceReferences: { type: "array", items: { type: "string" } } } }, SubtitleBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "text"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "subtitle" }, text: { $ref: "#/definitions/RichText" }, definition: { $ref: "#/definitions/RichText" } } }] }, ParagraphBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "text"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "paragraph" }, text: { $ref: "#/definitions/RichText" } } }] }, BulletsBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "items"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "bullets" }, items: { type: "array", minItems: 1, items: { $ref: "#/definitions/ListItem" } } } }] }, NumberedBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "items"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "numbered" }, items: { type: "array", minItems: 1, items: { $ref: "#/definitions/ListItem" } }, startAt: { type: "integer", minimum: 1 } } }] }, CalloutBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "text", "tone"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "callout" }, label: { $ref: "#/definitions/RichText" }, text: { $ref: "#/definitions/RichText" }, tone: { type: "string", enum: ["note", "warning", "info"] } } }] }, TableBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "headers", "rows"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "table" }, label: { $ref: "#/definitions/RichText" }, tableType: { type: "string", enum: ["standard", "comparison", "highlight", "heatmap"] }, headers: { type: "array", minItems: 1, items: { $ref: "#/definitions/RichText" } }, rows: { type: "array", items: { type: "array", items: { $ref: "#/definitions/RichText" } } }, heatmap: { type: "object", additionalProperties: !1, required: ["min", "max", "values"], properties: { min: { type: "number" }, max: { type: "number" }, values: { type: "array", items: { type: "array", items: { type: "number" } } } } } } }] }, DiagramBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "label", "diagramRows"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "diagram" }, label: { $ref: "#/definitions/RichText" }, diagramType: { type: "string", enum: ["generic", "metabolic", "signal-transduction", "gene-regulatory", "disease-pharmacology"] }, diagramRows: { type: "array", minItems: 1, items: { type: "array", minItems: 1, items: { oneOf: [{ type: "string", minLength: 1 }, { type: "array", minItems: 1, items: { $ref: "#/definitions/RichTextRun" } }] } } }, pathways: { type: "array", items: { type: "object", additionalProperties: !1, required: ["pathwayId", "label", "nodeIds"], properties: { pathwayId: { type: "string", minLength: 1 }, label: { $ref: "#/definitions/RichText" }, nodeIds: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } } } } } } }] }, ImageBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "slotId", "label", "description", "important", "sourceReference", "fit", "preferredAspect"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "image" }, slotId: { type: "string", minLength: 1 }, label: { $ref: "#/definitions/RichText" }, description: { $ref: "#/definitions/RichText" }, important: { type: "boolean" }, sourceReference: { type: "string" }, fit: { type: "string", enum: ["contain", "cover"] }, preferredAspect: { type: "string", enum: ["wide", "portrait", "square", "full", "automatic"] }, orientation: { type: "string", enum: ["automatic", "transverse", "longitudinal", "portrait", "landscape"] }, visualType: { type: "string", enum: ["photo", "decorative", "pathway", "chart", "microscopy", "radiology", "anatomy", "diagram", "other"] } } }] }, ExtractionAudit: { type: "object", additionalProperties: !1, required: ["sourceType", "sourcePageOrSlideCount", "coveredSourceReferences", "unmappedSourceReferences", "warnings"], properties: { sourceType: { type: "string", enum: ["pdf", "pptx"] }, sourcePageOrSlideCount: { type: "integer", minimum: 0 }, coveredSourceReferences: { type: "array", items: { type: "string" } }, unmappedSourceReferences: { type: "array", items: { type: "string" } }, warnings: { type: "array", items: { type: "string" } } } }, TitleBlock: { allOf: [{ $ref: "#/definitions/BaseBlock" }, { type: "object", additionalProperties: !1, required: ["type", "text"], properties: { blockId: { type: "string" }, sourceReferences: { type: "array", items: { type: "string" } }, type: { const: "title" }, text: { $ref: "#/definitions/RichText" }, definition: { $ref: "#/definitions/RichText" } } }] } }, go = {
  $schema: tA,
  title: rA,
  type: aA,
  additionalProperties: nA,
  required: iA,
  properties: oA,
  definitions: sA
}, pA = go, yo = new jc({ allErrors: !0, strict: !1 });
eA(yo);
const Ta = yo.compile(go), lA = [
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
function cA(e) {
  return lA.some((r) => r.test(e.trim()));
}
function AA(e) {
  const r = e.instancePath || "(root)";
  if (e.keyword === "minItems") {
    if (r.endsWith("/slides")) return `${r}: section has no slides`;
    if (r.endsWith("/blocks")) return `${r}: slide has no blocks`;
    if (r.includes("/diagramRows/")) return `${r}: diagram has an empty row`;
  }
  return e.keyword === "minLength" && r.includes("/diagramRows/") ? `${r}: diagram has an empty node` : `${r}: ${e.message}`;
}
function dA(e) {
  const r = [], t = [];
  if (!Ta(e) && Ta.errors) {
    for (const d of Ta.errors)
      r.push(AA(d));
    return { valid: !1, errors: r, warnings: t };
  }
  const a = e;
  a.documentTitle.trim() || r.push("documentTitle must not be empty");
  const s = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
  for (const d of a.sections) {
    s.has(d.sectionId) && r.push(`Duplicate sectionId: "${d.sectionId}"`), s.add(d.sectionId), d.sectionTitle.trim() || r.push(`Section "${d.sectionId}" has an empty sectionTitle`), a.schemaVersion === "1.2" && !be(d.sectionDefinition ?? "").trim() && r.push(`Section "${d.sectionId}" requires a sectionDefinition in schema 1.2`), d.slides.length === 0 && r.push(`Section "${d.sectionId}" has no slides`);
    for (const h of d.slides) {
      l.has(h.slideId) && r.push(`Duplicate slideId: "${h.slideId}"`), l.add(h.slideId);
      const u = h.slideTitle.trim();
      u && (o.has(u) && r.push(`Repeated non-empty slide title: "${u}"`), o.add(u), a.schemaVersion === "1.2" && !be(h.titleDefinition ?? "").trim() && r.push(`Title "${u}" requires a titleDefinition in schema 1.2`)), a.schemaVersion === "1.2" && be(h.slideSubtitle).trim() && !be(h.subtitleDefinition ?? "").trim() && r.push(`Slide "${h.slideId}" requires a subtitleDefinition for its sub-title in schema 1.2`), h.blocks.length === 0 && r.push(`Slide "${h.slideId}" has no blocks`);
      for (const y of h.blocks) {
        if (A.has(y.blockId) && r.push(`Duplicate blockId: "${y.blockId}"`), A.add(y.blockId), a.schemaVersion === "1.2" && (y.type === "title" || y.type === "subtitle") && !be(y.definition ?? "").trim() && r.push(`${y.type === "title" ? "Title" : "Sub-title"} block "${y.blockId}" requires a definition in schema 1.2`), y.type === "image") {
          const m = y;
          if (c.has(m.slotId) && r.push(`Duplicate image slotId: "${m.slotId}"`), c.add(m.slotId), !be(m.label).trim())
            r.push(`Image block "${m.blockId}" has no label`);
          else {
            cA(be(m.label)) && t.push(
              `Image block "${m.blockId}" has a generic label: "${be(m.label)}". Use a specific descriptive label (e.g. "Mitochondria electron micrograph").`
            );
            const p = be(m.label).toLowerCase().trim();
            n.has(p) && t.push(`Duplicate image label: "${be(m.label)}"`), n.add(p);
          }
        }
        if (y.type === "table") {
          const m = y;
          be(m.label).trim() || r.push(`Table block "${m.blockId}" has no label`);
          for (let p = 0; p < m.rows.length; p++)
            m.rows[p].length !== m.headers.length && r.push(
              `Table block "${m.blockId}" row ${p} has ${m.rows[p].length} cells but ${m.headers.length} headers`
            );
        }
        if (y.type === "diagram") {
          const m = y;
          be(m.label).trim() || r.push(`Diagram block "${m.blockId}" has no label`);
          for (let p = 0; p < m.diagramRows.length; p++)
            for (let _ = 0; _ < m.diagramRows[p].length; _++)
              be(m.diagramRows[p][_]).trim() || r.push(
                `Diagram block "${m.blockId}" has an empty node at row ${p}, position ${_}`
              );
        }
      }
    }
  }
  for (const d of a.sections)
    for (const h of d.slides)
      for (const u of h.blocks) {
        const y = [];
        (u.type === "paragraph" || u.type === "title" || u.type === "subtitle") && y.push(["text", u.text]), (u.type === "title" || u.type === "subtitle") && u.definition && y.push(["definition", u.definition]), u.type === "callout" && y.push(["label", u.label], ["text", u.text]), u.type === "image" && y.push(["label", u.label], ["description", u.description]), u.type === "table" && y.push(["label", u.label], ...u.headers.map((m, p) => [`headers[${p}]`, m]), ...u.rows.flatMap((m, p) => m.map((_, T) => [`rows[${p}][${T}]`, _]))), u.type === "diagram" && y.push(["label", u.label], ...u.diagramRows.flatMap((m, p) => m.map((_, T) => [`diagramRows[${p}][${T}]`, _])));
        for (const [m, p] of y)
          for (const [_, T] of Qt(p).entries())
            T.text || r.push(`${u.blockId}.${m}[${_}].text must not be empty`);
        if (u.type === "bullets" || u.type === "numbered") {
          let m = 0;
          u.items.forEach((p, _) => {
            const T = Jr(p);
            (!Number.isInteger(T) || T < 0) && r.push(`${u.blockId}.items[${_}].level must be a non-negative integer`), T - m > 1 && t.push(`${u.blockId}.items[${_}] jumps more than one nesting level`), m = T;
          });
        }
        u.type === "table" && u.tableType === "heatmap" && u.heatmap && (u.heatmap.max <= u.heatmap.min && r.push(`${u.blockId}.heatmap.max must be greater than min`), u.heatmap.values.length !== u.rows.length && r.push(`${u.blockId}.heatmap.values must match row count`), u.heatmap.values.forEach((m, p) => {
          m.length !== u.headers.length && r.push(`${u.blockId}.heatmap.values[${p}] must match column count`);
        }));
      }
  if (a.schemaVersion === "1.2") {
    const d = a.sections.map((u) => u.sectionTitle.trim()), h = a.overview.keyPoints.map((u) => be(u).trim());
    JSON.stringify(h) !== JSON.stringify(d) && r.push("overview.keyPoints must exactly match the ordered section titles in schema 1.2");
  }
  if (a.extractionAudit) {
    const d = new Set(a.extractionAudit.coveredSourceReferences), h = new Set(a.extractionAudit.unmappedSourceReferences);
    for (const y of h) d.has(y) && r.push(`Source reference "${y}" cannot be both covered and unmapped`);
    const u = /* @__PURE__ */ new Set();
    for (const y of a.sections)
      for (const m of y.slides)
        m.sourceReferences.forEach((p) => u.add(p)), m.blocks.forEach((p) => p.sourceReferences.forEach((_) => u.add(_)));
    for (const y of u)
      !d.has(y) && !h.has(y) && t.push(`Extraction audit: source reference "${y}" is not covered or unmapped`);
  }
  if (a.extractionAudit) {
    for (const d of a.extractionAudit.unmappedSourceReferences)
      t.push(`Source reference not mapped to any block: "${d}"`);
    for (const d of a.extractionAudit.warnings)
      t.push(`Extraction audit: ${d}`);
  }
  const f = [...new Set(r)], g = [...new Set(t)];
  return { valid: f.length === 0, errors: f, warnings: g };
}
class fA extends Error {
  validationErrors;
  constructor(r) {
    super(`Lecture document is invalid:
${r.map((t) => `- ${t}`).join(`
`)}`), this.name = "LectureValidationError", this.validationErrors = r;
  }
}
let Pi = Promise.resolve();
function uA(e) {
  const r = Pi.then(e, e);
  return Pi = r.then(() => {
  }, () => {
  }), r;
}
function mA(e, r = {}, t = {}) {
  return uA(() => hA(e, r, t));
}
async function hA(e, r, t) {
  const i = [];
  if (t.validateInput !== !1) {
    const a = dA(e);
    if (i.push(...a.warnings), !a.valid) throw new fA(a.errors);
  }
  nn(), gs(t.theme);
  try {
    const a = new ms(), s = "JANG_WIDE";
    a.defineLayout({ name: s, width: D.SLIDE_WIDTH, height: D.SLIDE_HEIGHT }), a.layout = s, a.author = "Jang PPTX Engine", a.company = "Jang", a.subject = e.documentTitle, a.title = e.documentTitle, a.lang = e.direction === "rtl" ? "ar-SA" : "en-US", a.rtlMode = e.direction === "rtl", a.theme = {
      headFontFace: D.headingFont,
      bodyFontFace: D.bodyFont,
      lang: e.direction === "rtl" ? "ar-SA" : "en-US"
    }, Fl(a, e, r, i);
    const l = $l(a);
    if (l.checkedObjects === 0 && i.push("Geometry validation could not inspect any generated slide objects."), !l.valid) {
      const g = l.violations.map((d) => `Geometry: ${d}`);
      if (t.strictGeometry) throw new Error(g.join(`
`));
      i.push(...g);
    }
    const A = Gl(e, r);
    if (!A.valid) {
      const g = A.issues.filter((d) => d.code !== "unfilled-image-slot").map((d) => `Quality: ${d.message}`);
      if (t.strictQuality && g.length > 0) throw new Error(g.join(`
`));
      i.push(...g);
    }
    i.push(...A.issues.filter((g) => g.code === "unfilled-image-slot").map((g) => `Quality: ${g.message}`));
    const c = { compression: t.compression !== !1 };
    let n;
    if (typeof globalThis == "object" && "document" in globalThis)
      n = await a.write({ outputType: "blob", ...c });
    else {
      const g = await a.write({ outputType: "nodebuffer", ...c });
      n = new Blob([new Uint8Array(g)], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      });
    }
    const f = a.slides ?? a._slides ?? [];
    return { blob: n, warnings: [...new Set(i)], slideCount: f.length, quality: A };
  } finally {
    nn();
  }
}
export {
  Gi as DEFAULT_THEME,
  fA as LectureValidationError,
  Ut as SlideRenderPlanError,
  D as THEME,
  $s as assertValidContentSlideRenderPlan,
  gs as configureTheme,
  Ki as createContentSlideRenderPlan,
  mA as generateLecturePptx,
  pA as lectureSchema,
  js as planDedicatedDiagramSlides,
  Ys as planDedicatedImageSlide,
  Zs as planDedicatedTableSlides,
  ao as planLectureSlide,
  cl as planPresentation,
  nn as resetTheme,
  Os as validateContentSlideRenderPlan,
  dA as validateLecture
};
