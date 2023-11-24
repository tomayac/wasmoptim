var Binaryen = (() => {
  var _scriptDir = import.meta.url;

  return function (moduleArg = {}) {
    var aa =
      'function' == typeof Object.defineProperties
        ? Object.defineProperty
        : function (b, c, g) {
            if (b == Array.prototype || b == Object.prototype) return b;
            b[c] = g.value;
            return b;
          };
    function ba(b) {
      b = [
        'object' == typeof globalThis && globalThis,
        b,
        'object' == typeof window && window,
        'object' == typeof self && self,
        'object' == typeof global && global,
      ];
      for (var c = 0; c < b.length; ++c) {
        var g = b[c];
        if (g && g.Math == Math) return g;
      }
      throw Error('Cannot find global object');
    }
    var ca = ba(this);
    function da(b, c) {
      if (c)
        a: {
          var g = ca;
          b = b.split('.');
          for (var d = 0; d < b.length - 1; d++) {
            var f = b[d];
            if (!(f in g)) break a;
            g = g[f];
          }
          b = b[b.length - 1];
          d = g[b];
          c = c(d);
          c != d &&
            null != c &&
            aa(g, b, { configurable: !0, writable: !0, value: c });
        }
    }
    da('Array.prototype.includes', function (b) {
      return b
        ? b
        : function (c, g) {
            var d = this;
            d instanceof String && (d = String(d));
            var f = d.length;
            g = g || 0;
            for (0 > g && (g = Math.max(g + f, 0)); g < f; g++) {
              var h = d[g];
              if (h === c || Object.is(h, c)) return !0;
            }
            return !1;
          };
    });
    var a = moduleArg,
      ea,
      fa;
    a.ready = new Promise((b, c) => {
      ea = b;
      fa = c;
    });
    var ha = Object.assign({}, a),
      ia = './this.program',
      ja = (b, c) => {
        throw c;
      },
      ka = 'object' == typeof window,
      la = 'function' == typeof importScripts,
      e = '',
      ma,
      na,
      oa;
    if (ka || la)
      la
        ? (e = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (e = document.currentScript.src),
        _scriptDir && (e = _scriptDir),
        0 !== e.indexOf('blob:')
          ? (e = e.substr(0, e.replace(/[?#].*/, '').lastIndexOf('/') + 1))
          : (e = ''),
        (ma = (b) => {
          var c = new XMLHttpRequest();
          c.open('GET', b, !1);
          c.send(null);
          return c.responseText;
        }),
        la &&
          (oa = (b) => {
            var c = new XMLHttpRequest();
            c.open('GET', b, !1);
            c.responseType = 'arraybuffer';
            c.send(null);
            return new Uint8Array(c.response);
          }),
        (na = (b, c, g) => {
          var d = new XMLHttpRequest();
          d.open('GET', b, !0);
          d.responseType = 'arraybuffer';
          d.onload = () => {
            200 == d.status || (0 == d.status && d.response)
              ? c(d.response)
              : g();
          };
          d.onerror = g;
          d.send(null);
        });
    var m = a.print || console.log.bind(console),
      pa = a.printErr || console.error.bind(console);
    Object.assign(a, ha);
    ha = null;
    a.thisProgram && (ia = a.thisProgram);
    a.quit && (ja = a.quit);
    var qa;
    a.wasmBinary && (qa = a.wasmBinary);
    'object' != typeof WebAssembly && q('no native wasm support detected');
    var ra,
      sa = !1,
      u,
      v,
      ta,
      w,
      x;
    function ua() {
      var b = ra.buffer;
      a.HEAP8 = u = new Int8Array(b);
      a.HEAP16 = ta = new Int16Array(b);
      a.HEAPU8 = v = new Uint8Array(b);
      a.HEAPU16 = new Uint16Array(b);
      a.HEAP32 = w = new Int32Array(b);
      a.HEAPU32 = x = new Uint32Array(b);
      a.HEAPF32 = new Float32Array(b);
      a.HEAPF64 = new Float64Array(b);
    }
    var va = [],
      wa = [],
      xa = [],
      ya = !1;
    function za() {
      var b = a.preRun.shift();
      va.unshift(b);
    }
    var Aa = 0,
      Ba = null,
      Ca = null;
    function Da() {
      Aa++;
      a.monitorRunDependencies && a.monitorRunDependencies(Aa);
    }
    function Ea() {
      Aa--;
      a.monitorRunDependencies && a.monitorRunDependencies(Aa);
      if (0 == Aa && (null !== Ba && (clearInterval(Ba), (Ba = null)), Ca)) {
        var b = Ca;
        Ca = null;
        b();
      }
    }
    function q(b) {
      if (a.onAbort) a.onAbort(b);
      b = 'Aborted(' + b + ')';
      pa(b);
      sa = !0;
      b = new WebAssembly.RuntimeError(
        b + '. Build with -sASSERTIONS for more info.',
      );
      fa(b);
      throw b;
    }
    var Fa = (b) => b.startsWith('data:application/octet-stream;base64,'),
      Ga;
    if (a.locateFile) {
      if (((Ga = 'binaryen_wasm.wasm'), !Fa(Ga))) {
        var Ha = Ga;
        Ga = a.locateFile ? a.locateFile(Ha, e) : e + Ha;
      }
    } else Ga = new URL('binaryen_wasm.wasm', import.meta.url).href;
    function Ia(b) {
      if (b == Ga && qa) return new Uint8Array(qa);
      if (oa) return oa(b);
      throw 'both async and sync fetching of the wasm failed';
    }
    function Ja(b) {
      return qa || (!ka && !la) || 'function' != typeof fetch
        ? Promise.resolve().then(() => Ia(b))
        : fetch(b, { credentials: 'same-origin' })
            .then((c) => {
              if (!c.ok) throw "failed to load wasm binary file at '" + b + "'";
              return c.arrayBuffer();
            })
            .catch(() => Ia(b));
    }
    function Ka(b, c, g) {
      return Ja(b)
        .then((d) => WebAssembly.instantiate(d, c))
        .then((d) => d)
        .then(g, (d) => {
          pa(`failed to asynchronously prepare wasm: ${d}`);
          q(d);
        });
    }
    function La(b, c) {
      var g = Ga;
      return qa ||
        'function' != typeof WebAssembly.instantiateStreaming ||
        Fa(g) ||
        'function' != typeof fetch
        ? Ka(g, b, c)
        : fetch(g, { credentials: 'same-origin' }).then((d) =>
            WebAssembly.instantiateStreaming(d, b).then(c, function (f) {
              pa(`wasm streaming compile failed: ${f}`);
              pa('falling back to ArrayBuffer instantiation');
              return Ka(g, b, c);
            }),
          );
    }
    var Ma, Na;
    function Oa(b) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${b})`;
      this.status = b;
    }
    var Pa = (b) => {
        for (; 0 < b.length; ) b.shift()(a);
      },
      Qa = a.noExitRuntime || !0,
      Ra = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0,
      z = (b, c) => {
        for (var g = c + NaN, d = c; b[d] && !(d >= g); ) ++d;
        if (16 < d - c && b.buffer && Ra) return Ra.decode(b.subarray(c, d));
        for (g = ''; c < d; ) {
          var f = b[c++];
          if (f & 128) {
            var h = b[c++] & 63;
            if (192 == (f & 224)) g += String.fromCharCode(((f & 31) << 6) | h);
            else {
              var k = b[c++] & 63;
              f =
                224 == (f & 240)
                  ? ((f & 15) << 12) | (h << 6) | k
                  : ((f & 7) << 18) | (h << 12) | (k << 6) | (b[c++] & 63);
              65536 > f
                ? (g += String.fromCharCode(f))
                : ((f -= 65536),
                  (g += String.fromCharCode(
                    55296 | (f >> 10),
                    56320 | (f & 1023),
                  )));
            }
          } else g += String.fromCharCode(f);
        }
        return g;
      },
      B = (b) => (b ? z(v, b) : ''),
      Sa = [],
      Ta = 0,
      D = 0;
    function Ua(b) {
      this.OB = b;
      this.CB = b - 24;
      this.wC = function (c) {
        x[(this.CB + 4) >> 2] = c;
      };
      this.BB = function () {
        return x[(this.CB + 4) >> 2];
      };
      this.RC = function (c) {
        x[(this.CB + 8) >> 2] = c;
      };
      this.uC = function (c) {
        u[(this.CB + 12) >> 0] = c ? 1 : 0;
      };
      this.PC = function () {
        return 0 != u[(this.CB + 12) >> 0];
      };
      this.vC = function (c) {
        u[(this.CB + 13) >> 0] = c ? 1 : 0;
      };
      this.AC = function () {
        return 0 != u[(this.CB + 13) >> 0];
      };
      this.nC = function (c, g) {
        this.ZB(0);
        this.wC(c);
        this.RC(g);
      };
      this.ZB = function (c) {
        x[(this.CB + 16) >> 2] = c;
      };
      this.OC = function () {
        return x[(this.CB + 16) >> 2];
      };
      this.QC = function () {
        if (Va(this.BB())) return x[this.OB >> 2];
        var c = this.OC();
        return 0 !== c ? c : this.OB;
      };
    }
    var Ya = (b) => {
        var c = D;
        if (!c) return Wa(0), 0;
        var g = new Ua(c);
        g.ZB(c);
        var d = g.BB();
        if (!d) return Wa(0), c;
        for (var f in b) {
          var h = b[f];
          if (0 === h || h === d) break;
          if (Xa(h, d, g.CB + 16)) return Wa(h), c;
        }
        Wa(d);
        return c;
      },
      Za = (b, c) => {
        for (var g = 0, d = b.length - 1; 0 <= d; d--) {
          var f = b[d];
          '.' === f
            ? b.splice(d, 1)
            : '..' === f
              ? (b.splice(d, 1), g++)
              : g && (b.splice(d, 1), g--);
        }
        if (c) for (; g; g--) b.unshift('..');
        return b;
      },
      F = (b) => {
        var c = '/' === b.charAt(0),
          g = '/' === b.substr(-1);
        (b = Za(
          b.split('/').filter((d) => !!d),
          !c,
        ).join('/')) ||
          c ||
          (b = '.');
        b && g && (b += '/');
        return (c ? '/' : '') + b;
      },
      $a = (b) => {
        var c = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(b)
          .slice(1);
        b = c[0];
        c = c[1];
        if (!b && !c) return '.';
        c && (c = c.substr(0, c.length - 1));
        return b + c;
      },
      ab = (b) => {
        if ('/' === b) return '/';
        b = F(b);
        b = b.replace(/\/$/, '');
        var c = b.lastIndexOf('/');
        return -1 === c ? b : b.substr(c + 1);
      },
      bb = () => {
        if (
          'object' == typeof crypto &&
          'function' == typeof crypto.getRandomValues
        )
          return (b) => crypto.getRandomValues(b);
        q('initRandomDevice');
      },
      cb = (b) => (cb = bb())(b);
    function db() {
      for (var b = '', c = !1, g = arguments.length - 1; -1 <= g && !c; g--) {
        c = 0 <= g ? arguments[g] : '/';
        if ('string' != typeof c)
          throw new TypeError('Arguments to path.resolve must be strings');
        if (!c) return '';
        b = c + '/' + b;
        c = '/' === c.charAt(0);
      }
      b = Za(
        b.split('/').filter((d) => !!d),
        !c,
      ).join('/');
      return (c ? '/' : '') + b || '.';
    }
    var eb = [],
      fb = (b) => {
        for (var c = 0, g = 0; g < b.length; ++g) {
          var d = b.charCodeAt(g);
          127 >= d
            ? c++
            : 2047 >= d
              ? (c += 2)
              : 55296 <= d && 57343 >= d
                ? ((c += 4), ++g)
                : (c += 3);
        }
        return c;
      },
      gb = (b, c, g, d) => {
        if (!(0 < d)) return 0;
        var f = g;
        d = g + d - 1;
        for (var h = 0; h < b.length; ++h) {
          var k = b.charCodeAt(h);
          if (55296 <= k && 57343 >= k) {
            var l = b.charCodeAt(++h);
            k = (65536 + ((k & 1023) << 10)) | (l & 1023);
          }
          if (127 >= k) {
            if (g >= d) break;
            c[g++] = k;
          } else {
            if (2047 >= k) {
              if (g + 1 >= d) break;
              c[g++] = 192 | (k >> 6);
            } else {
              if (65535 >= k) {
                if (g + 2 >= d) break;
                c[g++] = 224 | (k >> 12);
              } else {
                if (g + 3 >= d) break;
                c[g++] = 240 | (k >> 18);
                c[g++] = 128 | ((k >> 12) & 63);
              }
              c[g++] = 128 | ((k >> 6) & 63);
            }
            c[g++] = 128 | (k & 63);
          }
        }
        c[g] = 0;
        return g - f;
      };
    function hb(b, c) {
      var g = Array(fb(b) + 1);
      b = gb(b, g, 0, g.length);
      c && (g.length = b);
      return g;
    }
    var ib = [];
    function jb(b, c) {
      ib[b] = { input: [], zB: [], GB: c };
      kb(b, lb);
    }
    var lb = {
        open(b) {
          var c = ib[b.node.UB];
          if (!c) throw new G(43);
          b.xB = c;
          b.seekable = !1;
        },
        close(b) {
          b.xB.GB.SB(b.xB);
        },
        SB(b) {
          b.xB.GB.SB(b.xB);
        },
        read(b, c, g, d) {
          if (!b.xB || !b.xB.GB.lC) throw new G(60);
          for (var f = 0, h = 0; h < d; h++) {
            try {
              var k = b.xB.GB.lC(b.xB);
            } catch (l) {
              throw new G(29);
            }
            if (void 0 === k && 0 === f) throw new G(6);
            if (null === k || void 0 === k) break;
            f++;
            c[g + h] = k;
          }
          f && (b.node.timestamp = Date.now());
          return f;
        },
        write(b, c, g, d) {
          if (!b.xB || !b.xB.GB.dC) throw new G(60);
          try {
            for (var f = 0; f < d; f++) b.xB.GB.dC(b.xB, c[g + f]);
          } catch (h) {
            throw new G(29);
          }
          d && (b.node.timestamp = Date.now());
          return f;
        },
      },
      mb = {
        lC() {
          a: {
            if (!eb.length) {
              var b = null;
              'undefined' != typeof window && 'function' == typeof window.prompt
                ? ((b = window.prompt('Input: ')), null !== b && (b += '\n'))
                : 'function' == typeof readline &&
                  ((b = readline()), null !== b && (b += '\n'));
              if (!b) {
                b = null;
                break a;
              }
              eb = hb(b, !0);
            }
            b = eb.shift();
          }
          return b;
        },
        dC(b, c) {
          null === c || 10 === c
            ? (m(z(b.zB, 0)), (b.zB = []))
            : 0 != c && b.zB.push(c);
        },
        SB(b) {
          b.zB && 0 < b.zB.length && (m(z(b.zB, 0)), (b.zB = []));
        },
        CC() {
          return {
            XC: 25856,
            ZC: 5,
            WC: 191,
            YC: 35387,
            VC: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
          };
        },
        DC() {
          return 0;
        },
        EC() {
          return [24, 80];
        },
      },
      nb = {
        dC(b, c) {
          null === c || 10 === c
            ? (pa(z(b.zB, 0)), (b.zB = []))
            : 0 != c && b.zB.push(c);
        },
        SB(b) {
          b.zB && 0 < b.zB.length && (pa(z(b.zB, 0)), (b.zB = []));
        },
      };
    function ob(b, c) {
      var g = b.uB ? b.uB.length : 0;
      g >= c ||
        ((c = Math.max(c, (g * (1048576 > g ? 2 : 1.125)) >>> 0)),
        0 != g && (c = Math.max(c, 256)),
        (g = b.uB),
        (b.uB = new Uint8Array(c)),
        0 < b.yB && b.uB.set(g.subarray(0, b.yB), 0));
    }
    var I = {
        DB: null,
        FB() {
          return I.createNode(null, '/', 16895, 0);
        },
        createNode(b, c, g, d) {
          if (24576 === (g & 61440) || 4096 === (g & 61440)) throw new G(63);
          I.DB ||
            (I.DB = {
              dir: {
                node: {
                  JB: I.vB.JB,
                  AB: I.vB.AB,
                  PB: I.vB.PB,
                  TB: I.vB.TB,
                  sC: I.vB.sC,
                  YB: I.vB.YB,
                  tC: I.vB.tC,
                  rC: I.vB.rC,
                  VB: I.vB.VB,
                },
                stream: { KB: I.wB.KB },
              },
              file: {
                node: { JB: I.vB.JB, AB: I.vB.AB },
                stream: {
                  KB: I.wB.KB,
                  read: I.wB.read,
                  write: I.wB.write,
                  gC: I.wB.gC,
                  cC: I.wB.cC,
                  qC: I.wB.qC,
                },
              },
              link: {
                node: { JB: I.vB.JB, AB: I.vB.AB, RB: I.vB.RB },
                stream: {},
              },
              iC: { node: { JB: I.vB.JB, AB: I.vB.AB }, stream: pb },
            });
          g = qb(b, c, g, d);
          16384 === (g.mode & 61440)
            ? ((g.vB = I.DB.dir.node), (g.wB = I.DB.dir.stream), (g.uB = {}))
            : 32768 === (g.mode & 61440)
              ? ((g.vB = I.DB.file.node),
                (g.wB = I.DB.file.stream),
                (g.yB = 0),
                (g.uB = null))
              : 40960 === (g.mode & 61440)
                ? ((g.vB = I.DB.link.node), (g.wB = I.DB.link.stream))
                : 8192 === (g.mode & 61440) &&
                  ((g.vB = I.DB.iC.node), (g.wB = I.DB.iC.stream));
          g.timestamp = Date.now();
          b && ((b.uB[c] = g), (b.timestamp = g.timestamp));
          return g;
        },
        cD(b) {
          return b.uB
            ? b.uB.subarray
              ? b.uB.subarray(0, b.yB)
              : new Uint8Array(b.uB)
            : new Uint8Array(0);
        },
        vB: {
          JB(b) {
            var c = {};
            c.aD = 8192 === (b.mode & 61440) ? b.id : 1;
            c.eD = b.id;
            c.mode = b.mode;
            c.gD = 1;
            c.uid = 0;
            c.dD = 0;
            c.UB = b.UB;
            16384 === (b.mode & 61440)
              ? (c.size = 4096)
              : 32768 === (b.mode & 61440)
                ? (c.size = b.yB)
                : 40960 === (b.mode & 61440)
                  ? (c.size = b.link.length)
                  : (c.size = 0);
            c.TC = new Date(b.timestamp);
            c.fD = new Date(b.timestamp);
            c.$C = new Date(b.timestamp);
            c.zC = 4096;
            c.UC = Math.ceil(c.size / c.zC);
            return c;
          },
          AB(b, c) {
            void 0 !== c.mode && (b.mode = c.mode);
            void 0 !== c.timestamp && (b.timestamp = c.timestamp);
            if (void 0 !== c.size && ((c = c.size), b.yB != c))
              if (0 == c) (b.uB = null), (b.yB = 0);
              else {
                var g = b.uB;
                b.uB = new Uint8Array(c);
                g && b.uB.set(g.subarray(0, Math.min(c, b.yB)));
                b.yB = c;
              }
          },
          PB() {
            throw rb[44];
          },
          TB(b, c, g, d) {
            return I.createNode(b, c, g, d);
          },
          sC(b, c, g) {
            if (16384 === (b.mode & 61440)) {
              try {
                var d = sb(c, g);
              } catch (h) {}
              if (d) for (var f in d.uB) throw new G(55);
            }
            delete b.parent.uB[b.name];
            b.parent.timestamp = Date.now();
            b.name = g;
            c.uB[g] = b;
            c.timestamp = b.parent.timestamp;
            b.parent = c;
          },
          YB(b, c) {
            delete b.uB[c];
            b.timestamp = Date.now();
          },
          tC(b, c) {
            var g = sb(b, c),
              d;
            for (d in g.uB) throw new G(55);
            delete b.uB[c];
            b.timestamp = Date.now();
          },
          rC(b) {
            var c = ['.', '..'],
              g;
            for (g in b.uB) b.uB.hasOwnProperty(g) && c.push(g);
            return c;
          },
          VB(b, c, g) {
            b = I.createNode(b, c, 41471, 0);
            b.link = g;
            return b;
          },
          RB(b) {
            if (40960 !== (b.mode & 61440)) throw new G(28);
            return b.link;
          },
        },
        wB: {
          read(b, c, g, d, f) {
            var h = b.node.uB;
            if (f >= b.node.yB) return 0;
            b = Math.min(b.node.yB - f, d);
            if (8 < b && h.subarray) c.set(h.subarray(f, f + b), g);
            else for (d = 0; d < b; d++) c[g + d] = h[f + d];
            return b;
          },
          write(b, c, g, d, f, h) {
            c.buffer === u.buffer && (h = !1);
            if (!d) return 0;
            b = b.node;
            b.timestamp = Date.now();
            if (c.subarray && (!b.uB || b.uB.subarray)) {
              if (h) return (b.uB = c.subarray(g, g + d)), (b.yB = d);
              if (0 === b.yB && 0 === f)
                return (b.uB = c.slice(g, g + d)), (b.yB = d);
              if (f + d <= b.yB) return b.uB.set(c.subarray(g, g + d), f), d;
            }
            ob(b, f + d);
            if (b.uB.subarray && c.subarray) b.uB.set(c.subarray(g, g + d), f);
            else for (h = 0; h < d; h++) b.uB[f + h] = c[g + h];
            b.yB = Math.max(b.yB, f + d);
            return d;
          },
          KB(b, c, g) {
            1 === g
              ? (c += b.position)
              : 2 === g && 32768 === (b.node.mode & 61440) && (c += b.node.yB);
            if (0 > c) throw new G(28);
            return c;
          },
          gC(b, c, g) {
            ob(b.node, c + g);
            b.node.yB = Math.max(b.node.yB, c + g);
          },
          cC(b, c, g, d, f) {
            if (32768 !== (b.node.mode & 61440)) throw new G(43);
            b = b.node.uB;
            if (f & 2 || b.buffer !== u.buffer) {
              if (0 < g || g + c < b.length)
                b.subarray
                  ? (b = b.subarray(g, g + c))
                  : (b = Array.prototype.slice.call(b, g, g + c));
              g = !0;
              q();
              c = void 0;
              if (!c) throw new G(48);
              u.set(b, c);
            } else (g = !1), (c = b.byteOffset);
            return { CB: c, SC: g };
          },
          qC(b, c, g, d) {
            I.wB.write(b, c, 0, d, g, !1);
            return 0;
          },
        },
      },
      tb = (b, c, g) => {
        var d = `al ${b}`;
        na(
          b,
          (f) => {
            f || q(`Loading data file "${b}" failed (no arrayBuffer).`);
            c(new Uint8Array(f));
            d && Ea(d);
          },
          () => {
            if (g) g();
            else throw `Loading data file "${b}" failed.`;
          },
        );
        d && Da(d);
      },
      ub = a.preloadPlugins || [],
      vb = (b, c, g, d) => {
        'undefined' != typeof Browser && Browser.nC();
        var f = !1;
        ub.forEach((h) => {
          !f && h.canHandle(c) && (h.handle(b, c, g, d), (f = !0));
        });
        return f;
      },
      xb = (b, c, g, d, f, h, k, l, p, t) => {
        function r(n) {
          function C(A) {
            t && t();
            l || wb(b, c, A, d, f, p);
            h && h();
            Ea(E);
          }
          vb(n, y, C, () => {
            k && k();
            Ea(E);
          }) || C(n);
        }
        var y = c ? db(F(b + '/' + c)) : b,
          E = `cp ${y}`;
        Da(E);
        'string' == typeof g ? tb(g, (n) => r(n), k) : r(g);
      },
      yb = (b, c) => {
        var g = 0;
        b && (g |= 365);
        c && (g |= 146);
        return g;
      },
      zb = null,
      Ab = {},
      Bb = [],
      Cb = 1,
      Db = null,
      Eb = !0,
      G = null,
      rb = {};
    function Fb(b, c = {}) {
      b = db(b);
      if (!b) return { path: '', node: null };
      c = Object.assign({ kC: !0, eC: 0 }, c);
      if (8 < c.eC) throw new G(32);
      b = b.split('/').filter((k) => !!k);
      for (var g = zb, d = '/', f = 0; f < b.length; f++) {
        var h = f === b.length - 1;
        if (h && c.parent) break;
        g = sb(g, b[f]);
        d = F(d + '/' + b[f]);
        g.QB && (!h || (h && c.kC)) && (g = g.QB.root);
        if (!h || c.$B)
          for (h = 0; 40960 === (g.mode & 61440); )
            if (
              ((g = Gb(d)),
              (d = db($a(d), g)),
              (g = Fb(d, { eC: c.eC + 1 }).node),
              40 < h++)
            )
              throw new G(32);
      }
      return { path: d, node: g };
    }
    function Hb(b) {
      for (var c; ; ) {
        if (b === b.parent)
          return (
            (b = b.FB.pC),
            c ? ('/' !== b[b.length - 1] ? `${b}/${c}` : b + c) : b
          );
        c = c ? `${b.name}/${c}` : b.name;
        b = b.parent;
      }
    }
    function Ib(b, c) {
      for (var g = 0, d = 0; d < c.length; d++)
        g = ((g << 5) - g + c.charCodeAt(d)) | 0;
      return ((b + g) >>> 0) % Db.length;
    }
    function sb(b, c) {
      var g;
      if ((g = (g = Jb(b, 'x')) ? g : b.vB.PB ? 0 : 2)) throw new G(g, b);
      for (g = Db[Ib(b.id, c)]; g; g = g.NB) {
        var d = g.name;
        if (g.parent.id === b.id && d === c) return g;
      }
      return b.vB.PB(b, c);
    }
    function qb(b, c, g, d) {
      b = new Kb(b, c, g, d);
      c = Ib(b.parent.id, b.name);
      b.NB = Db[c];
      return (Db[c] = b);
    }
    function Lb(b) {
      var c = ['r', 'w', 'rw'][b & 3];
      b & 512 && (c += 'w');
      return c;
    }
    function Jb(b, c) {
      if (Eb) return 0;
      if (!c.includes('r') || b.mode & 292) {
        if (
          (c.includes('w') && !(b.mode & 146)) ||
          (c.includes('x') && !(b.mode & 73))
        )
          return 2;
      } else return 2;
      return 0;
    }
    function Mb(b, c) {
      try {
        return sb(b, c), 20;
      } catch (g) {}
      return Jb(b, 'wx');
    }
    function Nb() {
      for (var b = 0; 4096 >= b; b++) if (!Bb[b]) return b;
      throw new G(33);
    }
    function Ob(b) {
      b = Bb[b];
      if (!b) throw new G(8);
      return b;
    }
    function Pb(b, c = -1) {
      Qb ||
        ((Qb = function () {
          this.BB = {};
        }),
        (Qb.prototype = {}),
        Object.defineProperties(Qb.prototype, {
          object: {
            get() {
              return this.node;
            },
            set(g) {
              this.node = g;
            },
          },
          flags: {
            get() {
              return this.BB.flags;
            },
            set(g) {
              this.BB.flags = g;
            },
          },
          position: {
            get() {
              return this.BB.position;
            },
            set(g) {
              this.BB.position = g;
            },
          },
        }));
      b = Object.assign(new Qb(), b);
      -1 == c && (c = Nb());
      b.IB = c;
      return (Bb[c] = b);
    }
    var pb = {
      open(b) {
        b.wB = Ab[b.node.UB].wB;
        b.wB.open && b.wB.open(b);
      },
      KB() {
        throw new G(70);
      },
    };
    function kb(b, c) {
      Ab[b] = { wB: c };
    }
    function Rb(b, c) {
      var g = '/' === c,
        d = !c;
      if (g && zb) throw new G(10);
      if (!g && !d) {
        var f = Fb(c, { kC: !1 });
        c = f.path;
        f = f.node;
        if (f.QB) throw new G(10);
        if (16384 !== (f.mode & 61440)) throw new G(54);
      }
      c = { type: b, hD: {}, pC: c, HC: [] };
      b = b.FB(c);
      b.FB = c;
      c.root = b;
      g ? (zb = b) : f && ((f.QB = c), f.FB && f.FB.HC.push(c));
    }
    function Sb(b, c, g) {
      var d = Fb(b, { parent: !0 }).node;
      b = ab(b);
      if (!b || '.' === b || '..' === b) throw new G(28);
      var f = Mb(d, b);
      if (f) throw new G(f);
      if (!d.vB.TB) throw new G(63);
      return d.vB.TB(d, b, c, g);
    }
    function J(b) {
      return Sb(b, 16895, 0);
    }
    function Tb(b, c, g) {
      'undefined' == typeof g && ((g = c), (c = 438));
      return Sb(b, c | 8192, g);
    }
    function Ub(b, c) {
      if (!db(b)) throw new G(44);
      var g = Fb(c, { parent: !0 }).node;
      if (!g) throw new G(44);
      c = ab(c);
      var d = Mb(g, c);
      if (d) throw new G(d);
      if (!g.vB.VB) throw new G(63);
      g.vB.VB(g, c, b);
    }
    function Vb(b) {
      var c = Fb(b, { parent: !0 }).node;
      if (!c) throw new G(44);
      var g = ab(b);
      b = sb(c, g);
      a: {
        try {
          var d = sb(c, g);
        } catch (h) {
          d = h.HB;
          break a;
        }
        var f = Jb(c, 'wx');
        d = f ? f : 16384 === (d.mode & 61440) ? 31 : 0;
      }
      if (d) throw new G(d);
      if (!c.vB.YB) throw new G(63);
      if (b.QB) throw new G(10);
      c.vB.YB(c, g);
      c = Ib(b.parent.id, b.name);
      if (Db[c] === b) Db[c] = b.NB;
      else
        for (c = Db[c]; c; ) {
          if (c.NB === b) {
            c.NB = b.NB;
            break;
          }
          c = c.NB;
        }
    }
    function Gb(b) {
      b = Fb(b).node;
      if (!b) throw new G(44);
      if (!b.vB.RB) throw new G(28);
      return db(Hb(b.parent), b.vB.RB(b));
    }
    function Wb(b, c) {
      b = 'string' == typeof b ? Fb(b, { $B: !0 }).node : b;
      if (!b.vB.AB) throw new G(63);
      b.vB.AB(b, {
        mode: (c & 4095) | (b.mode & -4096),
        timestamp: Date.now(),
      });
    }
    function Xb(b, c, g) {
      if ('' === b) throw new G(44);
      if ('string' == typeof c) {
        var d = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 }[c];
        if ('undefined' == typeof d)
          throw Error(`Unknown file open mode: ${c}`);
        c = d;
      }
      g = c & 64 ? (('undefined' == typeof g ? 438 : g) & 4095) | 32768 : 0;
      if ('object' == typeof b) var f = b;
      else {
        b = F(b);
        try {
          f = Fb(b, { $B: !(c & 131072) }).node;
        } catch (h) {}
      }
      d = !1;
      if (c & 64)
        if (f) {
          if (c & 128) throw new G(20);
        } else (f = Sb(b, g, 0)), (d = !0);
      if (!f) throw new G(44);
      8192 === (f.mode & 61440) && (c &= -513);
      if (c & 65536 && 16384 !== (f.mode & 61440)) throw new G(54);
      if (
        !d &&
        (g = f
          ? 40960 === (f.mode & 61440)
            ? 32
            : 16384 === (f.mode & 61440) && ('r' !== Lb(c) || c & 512)
              ? 31
              : Jb(f, Lb(c))
          : 44)
      )
        throw new G(g);
      if (c & 512 && !d) {
        g = f;
        g = 'string' == typeof g ? Fb(g, { $B: !0 }).node : g;
        if (!g.vB.AB) throw new G(63);
        if (16384 === (g.mode & 61440)) throw new G(31);
        if (32768 !== (g.mode & 61440)) throw new G(28);
        if ((d = Jb(g, 'w'))) throw new G(d);
        g.vB.AB(g, { size: 0, timestamp: Date.now() });
      }
      c &= -131713;
      f = Pb({
        node: f,
        path: Hb(f),
        flags: c,
        seekable: !0,
        position: 0,
        wB: f.wB,
        NC: [],
        error: !1,
      });
      f.wB.open && f.wB.open(f);
      !a.logReadFiles || c & 1 || (Yb || (Yb = {}), b in Yb || (Yb[b] = 1));
      return f;
    }
    function Zb(b) {
      if (null === b.IB) throw new G(8);
      b.aC && (b.aC = null);
      try {
        b.wB.close && b.wB.close(b);
      } catch (c) {
        throw c;
      } finally {
        Bb[b.IB] = null;
      }
      b.IB = null;
    }
    function $b(b, c, g) {
      if (null === b.IB) throw new G(8);
      if (!b.seekable || !b.wB.KB) throw new G(70);
      if (0 != g && 1 != g && 2 != g) throw new G(28);
      b.position = b.wB.KB(b, c, g);
      b.NC = [];
    }
    function ac(b, c, g, d, f, h) {
      if (0 > d || 0 > f) throw new G(28);
      if (null === b.IB) throw new G(8);
      if (0 === (b.flags & 2097155)) throw new G(8);
      if (16384 === (b.node.mode & 61440)) throw new G(31);
      if (!b.wB.write) throw new G(28);
      b.seekable && b.flags & 1024 && $b(b, 0, 2);
      var k = 'undefined' != typeof f;
      if (!k) f = b.position;
      else if (!b.seekable) throw new G(70);
      c = b.wB.write(b, c, g, d, f, h);
      k || (b.position += c);
      return c;
    }
    function bc() {
      G ||
        ((G = function (b, c) {
          this.name = 'ErrnoError';
          this.node = c;
          this.IC = function (g) {
            this.HB = g;
          };
          this.IC(b);
          this.message = 'FS error';
        }),
        (G.prototype = Error()),
        (G.prototype.constructor = G),
        [44].forEach((b) => {
          rb[b] = new G(b);
          rb[b].stack = '<generic error, no stack>';
        }));
    }
    var cc;
    function dc(b, c) {
      b = 'string' == typeof b ? b : Hb(b);
      for (c = c.split('/').reverse(); c.length; ) {
        var g = c.pop();
        if (g) {
          var d = F(b + '/' + g);
          try {
            J(d);
          } catch (f) {}
          b = d;
        }
      }
      return d;
    }
    function ec(b, c, g, d) {
      b = F(('string' == typeof b ? b : Hb(b)) + '/' + c);
      g = yb(g, d);
      return Sb(b, ((void 0 !== g ? g : 438) & 4095) | 32768, 0);
    }
    function wb(b, c, g, d, f, h) {
      var k = c;
      b &&
        ((b = 'string' == typeof b ? b : Hb(b)), (k = c ? F(b + '/' + c) : b));
      b = yb(d, f);
      k = Sb(k, ((void 0 !== b ? b : 438) & 4095) | 32768, 0);
      if (g) {
        if ('string' == typeof g) {
          c = Array(g.length);
          d = 0;
          for (f = g.length; d < f; ++d) c[d] = g.charCodeAt(d);
          g = c;
        }
        Wb(k, b | 146);
        c = Xb(k, 577);
        ac(c, g, 0, g.length, 0, h);
        Zb(c);
        Wb(k, b);
      }
    }
    function K(b, c, g, d) {
      b = F(('string' == typeof b ? b : Hb(b)) + '/' + c);
      c = yb(!!g, !!d);
      K.oC || (K.oC = 64);
      var f = (K.oC++ << 8) | 0;
      kb(f, {
        open(h) {
          h.seekable = !1;
        },
        close() {
          d && d.buffer && d.buffer.length && d(10);
        },
        read(h, k, l, p) {
          for (var t = 0, r = 0; r < p; r++) {
            try {
              var y = g();
            } catch (E) {
              throw new G(29);
            }
            if (void 0 === y && 0 === t) throw new G(6);
            if (null === y || void 0 === y) break;
            t++;
            k[l + r] = y;
          }
          t && (h.node.timestamp = Date.now());
          return t;
        },
        write(h, k, l, p) {
          for (var t = 0; t < p; t++)
            try {
              d(k[l + t]);
            } catch (r) {
              throw new G(29);
            }
          p && (h.node.timestamp = Date.now());
          return t;
        },
      });
      return Tb(b, c, f);
    }
    function fc(b) {
      if (!(b.FC || b.GC || b.link || b.uB)) {
        if ('undefined' != typeof XMLHttpRequest)
          throw Error(
            'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.',
          );
        if (ma)
          try {
            (b.uB = hb(ma(b.url), !0)), (b.yB = b.uB.length);
          } catch (c) {
            throw new G(29);
          }
        else throw Error('Cannot load without read() or XMLHttpRequest.');
      }
    }
    function gc(b, c, g, d, f) {
      function h() {
        this.bC = !1;
        this.BB = [];
      }
      h.prototype.get = function (r) {
        if (!(r > this.length - 1 || 0 > r)) {
          var y = r % this.jC;
          return this.mC((r / this.jC) | 0)[y];
        }
      };
      h.prototype.ZB = function (r) {
        this.mC = r;
      };
      h.prototype.hC = function () {
        var r = new XMLHttpRequest();
        r.open('HEAD', g, !1);
        r.send(null);
        if (!((200 <= r.status && 300 > r.status) || 304 === r.status))
          throw Error("Couldn't load " + g + '. Status: ' + r.status);
        var y = Number(r.getResponseHeader('Content-length')),
          E,
          n = (E = r.getResponseHeader('Accept-Ranges')) && 'bytes' === E;
        r = (E = r.getResponseHeader('Content-Encoding')) && 'gzip' === E;
        var C = 1048576;
        n || (C = y);
        var A = this;
        A.ZB((H) => {
          var O = H * C,
            S = (H + 1) * C - 1;
          S = Math.min(S, y - 1);
          if ('undefined' == typeof A.BB[H]) {
            var td = A.BB;
            if (O > S)
              throw Error(
                'invalid range (' + O + ', ' + S + ') or no bytes requested!',
              );
            if (S > y - 1)
              throw Error('only ' + y + ' bytes available! programmer error!');
            var R = new XMLHttpRequest();
            R.open('GET', g, !1);
            y !== C && R.setRequestHeader('Range', 'bytes=' + O + '-' + S);
            R.responseType = 'arraybuffer';
            R.overrideMimeType &&
              R.overrideMimeType('text/plain; charset=x-user-defined');
            R.send(null);
            if (!((200 <= R.status && 300 > R.status) || 304 === R.status))
              throw Error("Couldn't load " + g + '. Status: ' + R.status);
            O =
              void 0 !== R.response
                ? new Uint8Array(R.response || [])
                : hb(R.responseText || '', !0);
            td[H] = O;
          }
          if ('undefined' == typeof A.BB[H]) throw Error('doXHR failed!');
          return A.BB[H];
        });
        if (r || !y)
          (C = y = 1),
            (C = y = this.mC(0).length),
            m(
              'LazyFiles on gzip forces download of the whole file when length is accessed',
            );
        this.yC = y;
        this.xC = C;
        this.bC = !0;
      };
      if ('undefined' != typeof XMLHttpRequest) {
        if (!la)
          throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
        var k = new h();
        Object.defineProperties(k, {
          length: {
            get: function () {
              this.bC || this.hC();
              return this.yC;
            },
          },
          jC: {
            get: function () {
              this.bC || this.hC();
              return this.xC;
            },
          },
        });
        var l = void 0;
      } else (l = g), (k = void 0);
      var p = ec(b, c, d, f);
      k ? (p.uB = k) : l && ((p.uB = null), (p.url = l));
      Object.defineProperties(p, {
        yB: {
          get: function () {
            return this.uB.length;
          },
        },
      });
      var t = {};
      Object.keys(p.wB).forEach((r) => {
        var y = p.wB[r];
        t[r] = function () {
          fc(p);
          return y.apply(null, arguments);
        };
      });
      t.read = (r, y, E, n, C) => {
        fc(p);
        r = r.node.uB;
        if (C >= r.length) y = 0;
        else {
          n = Math.min(r.length - C, n);
          if (r.slice) for (var A = 0; A < n; A++) y[E + A] = r[C + A];
          else for (A = 0; A < n; A++) y[E + A] = r.get(C + A);
          y = n;
        }
        return y;
      };
      t.cC = () => {
        fc(p);
        q();
        throw new G(48);
      };
      p.wB = t;
      return p;
    }
    var hc = {},
      Qb,
      Yb,
      ic = void 0;
    function jc() {
      var b = w[+ic >> 2];
      ic += 4;
      return b;
    }
    var kc = {},
      mc = () => {
        if (!lc) {
          var b = {
              USER: 'web_user',
              LOGNAME: 'web_user',
              PATH: '/',
              PWD: '/',
              HOME: '/home/web_user',
              LANG:
                (
                  ('object' == typeof navigator &&
                    navigator.languages &&
                    navigator.languages[0]) ||
                  'C'
                ).replace('-', '_') + '.UTF-8',
              _: ia || './this.program',
            },
            c;
          for (c in kc) void 0 === kc[c] ? delete b[c] : (b[c] = kc[c]);
          var g = [];
          for (c in b) g.push(`${c}=${b[c]}`);
          lc = g;
        }
        return lc;
      },
      lc,
      nc = (b, c) => {
        for (var g = 0; g < b.length; ++g) u[c++ >> 0] = b.charCodeAt(g);
        u[c >> 0] = 0;
      },
      oc = (b) => 0 === b % 4 && (0 !== b % 100 || 0 === b % 400),
      pc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      qc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      rc = (b, c, g, d) => {
        function f(n, C, A) {
          for (
            n = 'number' == typeof n ? n.toString() : n || '';
            n.length < C;

          )
            n = A[0] + n;
          return n;
        }
        function h(n, C) {
          return f(n, C, '0');
        }
        function k(n, C) {
          function A(O) {
            return 0 > O ? -1 : 0 < O ? 1 : 0;
          }
          var H;
          0 === (H = A(n.getFullYear() - C.getFullYear())) &&
            0 === (H = A(n.getMonth() - C.getMonth())) &&
            (H = A(n.getDate() - C.getDate()));
          return H;
        }
        function l(n) {
          switch (n.getDay()) {
            case 0:
              return new Date(n.getFullYear() - 1, 11, 29);
            case 1:
              return n;
            case 2:
              return new Date(n.getFullYear(), 0, 3);
            case 3:
              return new Date(n.getFullYear(), 0, 2);
            case 4:
              return new Date(n.getFullYear(), 0, 1);
            case 5:
              return new Date(n.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(n.getFullYear() - 1, 11, 30);
          }
        }
        function p(n) {
          var C = n.LB;
          for (n = new Date(new Date(n.MB + 1900, 0, 1).getTime()); 0 < C; ) {
            var A = n.getMonth(),
              H = (oc(n.getFullYear()) ? pc : qc)[A];
            if (C > H - n.getDate())
              (C -= H - n.getDate() + 1),
                n.setDate(1),
                11 > A
                  ? n.setMonth(A + 1)
                  : (n.setMonth(0), n.setFullYear(n.getFullYear() + 1));
            else {
              n.setDate(n.getDate() + C);
              break;
            }
          }
          A = new Date(n.getFullYear() + 1, 0, 4);
          C = l(new Date(n.getFullYear(), 0, 4));
          A = l(A);
          return 0 >= k(C, n)
            ? 0 >= k(A, n)
              ? n.getFullYear() + 1
              : n.getFullYear()
            : n.getFullYear() - 1;
        }
        var t = x[(d + 40) >> 2];
        d = {
          LC: w[d >> 2],
          KC: w[(d + 4) >> 2],
          WB: w[(d + 8) >> 2],
          fC: w[(d + 12) >> 2],
          XB: w[(d + 16) >> 2],
          MB: w[(d + 20) >> 2],
          EB: w[(d + 24) >> 2],
          LB: w[(d + 28) >> 2],
          iD: w[(d + 32) >> 2],
          JC: w[(d + 36) >> 2],
          MC: t ? (t ? z(v, t) : '') : '',
        };
        g = g ? z(v, g) : '';
        t = {
          '%c': '%a %b %d %H:%M:%S %Y',
          '%D': '%m/%d/%y',
          '%F': '%Y-%m-%d',
          '%h': '%b',
          '%r': '%I:%M:%S %p',
          '%R': '%H:%M',
          '%T': '%H:%M:%S',
          '%x': '%m/%d/%y',
          '%X': '%H:%M:%S',
          '%Ec': '%c',
          '%EC': '%C',
          '%Ex': '%m/%d/%y',
          '%EX': '%H:%M:%S',
          '%Ey': '%y',
          '%EY': '%Y',
          '%Od': '%d',
          '%Oe': '%e',
          '%OH': '%H',
          '%OI': '%I',
          '%Om': '%m',
          '%OM': '%M',
          '%OS': '%S',
          '%Ou': '%u',
          '%OU': '%U',
          '%OV': '%V',
          '%Ow': '%w',
          '%OW': '%W',
          '%Oy': '%y',
        };
        for (var r in t) g = g.replace(new RegExp(r, 'g'), t[r]);
        var y =
            'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(
              ' ',
            ),
          E =
            'January February March April May June July August September October November December'.split(
              ' ',
            );
        t = {
          '%a': (n) => y[n.EB].substring(0, 3),
          '%A': (n) => y[n.EB],
          '%b': (n) => E[n.XB].substring(0, 3),
          '%B': (n) => E[n.XB],
          '%C': (n) => h(((n.MB + 1900) / 100) | 0, 2),
          '%d': (n) => h(n.fC, 2),
          '%e': (n) => f(n.fC, 2, ' '),
          '%g': (n) => p(n).toString().substring(2),
          '%G': (n) => p(n),
          '%H': (n) => h(n.WB, 2),
          '%I': (n) => {
            n = n.WB;
            0 == n ? (n = 12) : 12 < n && (n -= 12);
            return h(n, 2);
          },
          '%j': (n) => {
            for (
              var C = 0, A = 0;
              A <= n.XB - 1;
              C += (oc(n.MB + 1900) ? pc : qc)[A++]
            );
            return h(n.fC + C, 3);
          },
          '%m': (n) => h(n.XB + 1, 2),
          '%M': (n) => h(n.KC, 2),
          '%n': () => '\n',
          '%p': (n) => (0 <= n.WB && 12 > n.WB ? 'AM' : 'PM'),
          '%S': (n) => h(n.LC, 2),
          '%t': () => '\t',
          '%u': (n) => n.EB || 7,
          '%U': (n) => h(Math.floor((n.LB + 7 - n.EB) / 7), 2),
          '%V': (n) => {
            var C = Math.floor((n.LB + 7 - ((n.EB + 6) % 7)) / 7);
            2 >= (n.EB + 371 - n.LB - 2) % 7 && C++;
            if (C)
              53 == C &&
                ((A = (n.EB + 371 - n.LB) % 7),
                4 == A || (3 == A && oc(n.MB)) || (C = 1));
            else {
              C = 52;
              var A = (n.EB + 7 - n.LB - 1) % 7;
              (4 == A || (5 == A && oc((n.MB % 400) - 1))) && C++;
            }
            return h(C, 2);
          },
          '%w': (n) => n.EB,
          '%W': (n) => h(Math.floor((n.LB + 7 - ((n.EB + 6) % 7)) / 7), 2),
          '%y': (n) => (n.MB + 1900).toString().substring(2),
          '%Y': (n) => n.MB + 1900,
          '%z': (n) => {
            n = n.JC;
            var C = 0 <= n;
            n = Math.abs(n) / 60;
            return (
              (C ? '+' : '-') +
              String('0000' + ((n / 60) * 100 + (n % 60))).slice(-4)
            );
          },
          '%Z': (n) => n.MC,
          '%%': () => '%',
        };
        g = g.replace(/%%/g, '\x00\x00');
        for (r in t)
          g.includes(r) && (g = g.replace(new RegExp(r, 'g'), t[r](d)));
        g = g.replace(/\0\0/g, '%');
        r = hb(g, !1);
        if (r.length > c) return 0;
        u.set(r, b);
        return r.length - 1;
      },
      sc = [],
      tc,
      L = (b) => {
        var c = sc[b];
        c || (b >= sc.length && (sc.length = b + 1), (sc[b] = c = tc.get(b)));
        return c;
      },
      uc = (b) => {
        var c = fb(b) + 1,
          g = M(c);
        gb(b, v, g, c);
        return g;
      };
    function Kb(b, c, g, d) {
      b || (b = this);
      this.parent = b;
      this.FB = b.FB;
      this.QB = null;
      this.id = Cb++;
      this.name = c;
      this.mode = g;
      this.vB = {};
      this.wB = {};
      this.UB = d;
    }
    Object.defineProperties(Kb.prototype, {
      read: {
        get: function () {
          return 365 === (this.mode & 365);
        },
        set: function (b) {
          b ? (this.mode |= 365) : (this.mode &= -366);
        },
      },
      write: {
        get: function () {
          return 146 === (this.mode & 146);
        },
        set: function (b) {
          b ? (this.mode |= 146) : (this.mode &= -147);
        },
      },
      GC: {
        get: function () {
          return 16384 === (this.mode & 61440);
        },
      },
      FC: {
        get: function () {
          return 8192 === (this.mode & 61440);
        },
      },
    });
    bc();
    Db = Array(4096);
    Rb(I, '/');
    J('/tmp');
    J('/home');
    J('/home/web_user');
    (function () {
      J('/dev');
      kb(259, { read: () => 0, write: (d, f, h, k) => k });
      Tb('/dev/null', 259);
      jb(1280, mb);
      jb(1536, nb);
      Tb('/dev/tty', 1280);
      Tb('/dev/tty1', 1536);
      var b = new Uint8Array(1024),
        c = 0,
        g = () => {
          0 === c && (c = cb(b).byteLength);
          return b[--c];
        };
      K('/dev', 'random', g);
      K('/dev', 'urandom', g);
      J('/dev/shm');
      J('/dev/shm/tmp');
    })();
    (function () {
      J('/proc');
      var b = J('/proc/self');
      J('/proc/self/fd');
      Rb(
        {
          FB() {
            var c = qb(b, 'fd', 16895, 73);
            c.vB = {
              PB(g, d) {
                var f = Ob(+d);
                g = {
                  parent: null,
                  FB: { pC: 'fake' },
                  vB: { RB: () => f.path },
                };
                return (g.parent = g);
              },
            };
            return c;
          },
        },
        '/proc/self/fd',
      );
    })();
    a.FS_createPath = dc;
    a.FS_createDataFile = wb;
    a.FS_createPreloadedFile = xb;
    a.FS_unlink = Vb;
    a.FS_createLazyFile = gc;
    a.FS_createDevice = K;
    var Id = {
        b: (b, c, g, d) => {
          q(
            `Assertion failed: ${b ? z(v, b) : ''}, at: ` +
              [
                c ? (c ? z(v, c) : '') : 'unknown filename',
                g,
                d ? (d ? z(v, d) : '') : 'unknown function',
              ],
          );
        },
        o: (b) => {
          b = new Ua(b);
          b.PC() || (b.uC(!0), Ta--);
          b.vC(!1);
          Sa.push(b);
          vc(b.OB);
          return b.QC();
        },
        r: () => {
          N(0, 0);
          var b = Sa.pop();
          wc(b.OB);
          D = 0;
        },
        a: () => Ya([]),
        l: (b) => Ya([b]),
        E: (b, c) => Ya([b, c]),
        D: () => {
          var b = Sa.pop();
          b || q('no exception to throw');
          var c = b.OB;
          b.AC() || (Sa.push(b), b.vC(!0), b.uC(!1), Ta++);
          D = c;
          throw D;
        },
        s: (b, c, g) => {
          new Ua(b).nC(c, g);
          D = b;
          Ta++;
          throw D;
        },
        Da: () => Ta,
        h: (b) => {
          D || (D = b);
          throw D;
        },
        F: function (b, c, g) {
          ic = g;
          try {
            var d = Ob(b);
            switch (c) {
              case 0:
                var f = jc();
                if (0 > f) return -28;
                for (; Bb[f]; ) f++;
                return Pb(d, f).IB;
              case 1:
              case 2:
                return 0;
              case 3:
                return d.flags;
              case 4:
                return (f = jc()), (d.flags |= f), 0;
              case 5:
                return (f = jc()), (ta[(f + 0) >> 1] = 2), 0;
              case 6:
              case 7:
                return 0;
              case 16:
              case 8:
                return -28;
              case 9:
                return (w[xc() >> 2] = 28), -1;
              default:
                return -28;
            }
          } catch (h) {
            if ('undefined' == typeof hc || 'ErrnoError' !== h.name) throw h;
            return -h.HB;
          }
        },
        Ba: function (b, c, g) {
          ic = g;
          try {
            var d = Ob(b);
            switch (c) {
              case 21509:
                return d.xB ? 0 : -59;
              case 21505:
                if (!d.xB) return -59;
                if (d.xB.GB.CC) {
                  c = [
                    3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                  ];
                  var f = jc();
                  w[f >> 2] = 25856;
                  w[(f + 4) >> 2] = 5;
                  w[(f + 8) >> 2] = 191;
                  w[(f + 12) >> 2] = 35387;
                  for (var h = 0; 32 > h; h++) u[(f + h + 17) >> 0] = c[h] || 0;
                }
                return 0;
              case 21510:
              case 21511:
              case 21512:
                return d.xB ? 0 : -59;
              case 21506:
              case 21507:
              case 21508:
                if (!d.xB) return -59;
                if (d.xB.GB.DC)
                  for (f = jc(), c = [], h = 0; 32 > h; h++)
                    c.push(u[(f + h + 17) >> 0]);
                return 0;
              case 21519:
                if (!d.xB) return -59;
                f = jc();
                return (w[f >> 2] = 0);
              case 21520:
                return d.xB ? -28 : -59;
              case 21531:
                f = jc();
                if (!d.wB.BC) throw new G(59);
                return d.wB.BC(d, c, f);
              case 21523:
                if (!d.xB) return -59;
                d.xB.GB.EC &&
                  ((h = [24, 80]),
                  (f = jc()),
                  (ta[f >> 1] = h[0]),
                  (ta[(f + 2) >> 1] = h[1]));
                return 0;
              case 21524:
                return d.xB ? 0 : -59;
              case 21515:
                return d.xB ? 0 : -59;
              default:
                return -28;
            }
          } catch (k) {
            if ('undefined' == typeof hc || 'ErrnoError' !== k.name) throw k;
            return -k.HB;
          }
        },
        Ca: function (b, c, g, d) {
          ic = d;
          try {
            c = c ? z(v, c) : '';
            var f = c;
            if ('/' === f.charAt(0)) c = f;
            else {
              var h = -100 === b ? '/' : Ob(b).path;
              if (0 == f.length) throw new G(44);
              c = F(h + '/' + f);
            }
            var k = d ? jc() : 0;
            return Xb(c, g, k).IB;
          } catch (l) {
            if ('undefined' == typeof hc || 'ErrnoError' !== l.name) throw l;
            return -l.HB;
          }
        },
        Ea: () => !0,
        p: () => {
          q('');
        },
        H: () => performance.now(),
        Fa: (b) => {
          var c = v.length;
          b >>>= 0;
          if (2147483648 < b) return !1;
          for (var g = 1; 4 >= g; g *= 2) {
            var d = c * (1 + 0.2 / g);
            d = Math.min(d, b + 100663296);
            var f = Math;
            d = Math.max(b, d);
            a: {
              f =
                (f.min.call(
                  f,
                  2147483648,
                  d + ((65536 - (d % 65536)) % 65536),
                ) -
                  ra.buffer.byteLength +
                  65535) /
                65536;
              try {
                ra.grow(f);
                ua();
                var h = 1;
                break a;
              } catch (k) {}
              h = void 0;
            }
            if (h) return !0;
          }
          return !1;
        },
        P: (b, c) => {
          var g = 0;
          mc().forEach((d, f) => {
            var h = c + g;
            x[(b + 4 * f) >> 2] = h;
            nc(d, h);
            g += d.length + 1;
          });
          return 0;
        },
        _: (b, c) => {
          var g = mc();
          x[b >> 2] = g.length;
          var d = 0;
          g.forEach((f) => (d += f.length + 1));
          x[c >> 2] = d;
          return 0;
        },
        G: function (b) {
          try {
            var c = Ob(b);
            Zb(c);
            return 0;
          } catch (g) {
            if ('undefined' == typeof hc || 'ErrnoError' !== g.name) throw g;
            return g.HB;
          }
        },
        Aa: function (b, c, g, d) {
          try {
            a: {
              var f = Ob(b);
              b = c;
              for (var h, k = (c = 0); k < g; k++) {
                var l = x[b >> 2],
                  p = x[(b + 4) >> 2];
                b += 8;
                var t = f,
                  r = l,
                  y = p,
                  E = h,
                  n = u;
                if (0 > y || 0 > E) throw new G(28);
                if (null === t.IB) throw new G(8);
                if (1 === (t.flags & 2097155)) throw new G(8);
                if (16384 === (t.node.mode & 61440)) throw new G(31);
                if (!t.wB.read) throw new G(28);
                var C = 'undefined' != typeof E;
                if (!C) E = t.position;
                else if (!t.seekable) throw new G(70);
                var A = t.wB.read(t, n, r, y, E);
                C || (t.position += A);
                var H = A;
                if (0 > H) {
                  var O = -1;
                  break a;
                }
                c += H;
                if (H < p) break;
                'undefined' !== typeof h && (h += H);
              }
              O = c;
            }
            x[d >> 2] = O;
            return 0;
          } catch (S) {
            if ('undefined' == typeof hc || 'ErrnoError' !== S.name) throw S;
            return S.HB;
          }
        },
        ta: function (b, c, g, d, f) {
          c =
            (g + 2097152) >>> 0 < 4194305 - !!c
              ? (c >>> 0) + 4294967296 * g
              : NaN;
          try {
            if (isNaN(c)) return 61;
            var h = Ob(b);
            $b(h, c, d);
            Na = [
              h.position >>> 0,
              ((Ma = h.position),
              1 <= +Math.abs(Ma)
                ? 0 < Ma
                  ? +Math.floor(Ma / 4294967296) >>> 0
                  : ~~+Math.ceil((Ma - +(~~Ma >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            w[f >> 2] = Na[0];
            w[(f + 4) >> 2] = Na[1];
            h.aC && 0 === c && 0 === d && (h.aC = null);
            return 0;
          } catch (k) {
            if ('undefined' == typeof hc || 'ErrnoError' !== k.name) throw k;
            return k.HB;
          }
        },
        Ga: function (b, c, g, d) {
          try {
            a: {
              var f = Ob(b);
              b = c;
              for (var h, k = (c = 0); k < g; k++) {
                var l = x[b >> 2],
                  p = x[(b + 4) >> 2];
                b += 8;
                var t = ac(f, u, l, p, h);
                if (0 > t) {
                  var r = -1;
                  break a;
                }
                c += t;
                'undefined' !== typeof h && (h += t);
              }
              r = c;
            }
            x[d >> 2] = r;
            return 0;
          } catch (y) {
            if ('undefined' == typeof hc || 'ErrnoError' !== y.name) throw y;
            return y.HB;
          }
        },
        y: yc,
        f: zc,
        wa: Ac,
        c: Bc,
        e: Cc,
        m: Dc,
        ua: Ec,
        q: Fc,
        t: Gc,
        B: Hc,
        va: Ic,
        A: Jc,
        M: Kc,
        J: Lc,
        qa: Mc,
        S: Nc,
        Y: Oc,
        oa: Pc,
        ba: Qc,
        O: Rc,
        Q: Sc,
        L: Tc,
        T: Uc,
        ka: Vc,
        la: Wc,
        U: Xc,
        K: Yc,
        ma: Zc,
        W: $c,
        I: ad,
        ca: bd,
        aa: cd,
        j: dd,
        k: ed,
        xa: fd,
        C: gd,
        d: hd,
        i: jd,
        g: kd,
        n: ld,
        w: md,
        u: nd,
        ya: od,
        x: pd,
        z: qd,
        X: rd,
        N: sd,
        na: ud,
        ga: vd,
        ra: wd,
        sa: xd,
        fa: yd,
        ea: zd,
        ia: Ad,
        pa: Bd,
        Z: Cd,
        $: Dd,
        R: Ed,
        da: Fd,
        ha: Gd,
        V: Hd,
        v: (b) => b,
        ja: (b) => {
          if (!Qa) {
            if (a.onExit) a.onExit(b);
            sa = !0;
          }
          ja(b, new Oa(b));
        },
        za: (b, c, g, d) => rc(b, c, g, d),
      },
      P = (function () {
        function b(g) {
          P = g.exports;
          ra = P.Ha;
          ua();
          tc = P.CA;
          wa.unshift(P.Ia);
          Ea('wasm-instantiate');
          return P;
        }
        var c = { a: Id };
        Da('wasm-instantiate');
        if (a.instantiateWasm)
          try {
            return a.instantiateWasm(c, b);
          } catch (g) {
            pa(`Module.instantiateWasm callback failed with error: ${g}`),
              fa(g);
          }
        La(c, function (g) {
          b(g.instance);
        }).catch(fa);
        return {};
      })();
    a._BinaryenTypeNone = () => (a._BinaryenTypeNone = P.Ja)();
    a._BinaryenTypeInt32 = () => (a._BinaryenTypeInt32 = P.Ka)();
    a._BinaryenTypeInt64 = () => (a._BinaryenTypeInt64 = P.La)();
    a._BinaryenTypeFloat32 = () => (a._BinaryenTypeFloat32 = P.Ma)();
    a._BinaryenTypeFloat64 = () => (a._BinaryenTypeFloat64 = P.Na)();
    a._BinaryenTypeVec128 = () => (a._BinaryenTypeVec128 = P.Oa)();
    a._BinaryenTypeFuncref = () => (a._BinaryenTypeFuncref = P.Pa)();
    a._BinaryenTypeExternref = () => (a._BinaryenTypeExternref = P.Qa)();
    a._BinaryenTypeAnyref = () => (a._BinaryenTypeAnyref = P.Ra)();
    a._BinaryenTypeEqref = () => (a._BinaryenTypeEqref = P.Sa)();
    a._BinaryenTypeI31ref = () => (a._BinaryenTypeI31ref = P.Ta)();
    a._BinaryenTypeStructref = () => (a._BinaryenTypeStructref = P.Ua)();
    a._BinaryenTypeArrayref = () => (a._BinaryenTypeArrayref = P.Va)();
    a._BinaryenTypeStringref = () => (a._BinaryenTypeStringref = P.Wa)();
    a._BinaryenTypeStringviewWTF8 = () =>
      (a._BinaryenTypeStringviewWTF8 = P.Xa)();
    a._BinaryenTypeStringviewWTF16 = () =>
      (a._BinaryenTypeStringviewWTF16 = P.Ya)();
    a._BinaryenTypeStringviewIter = () =>
      (a._BinaryenTypeStringviewIter = P.Za)();
    a._BinaryenTypeNullref = () => (a._BinaryenTypeNullref = P._a)();
    a._BinaryenTypeNullExternref = () =>
      (a._BinaryenTypeNullExternref = P.$a)();
    a._BinaryenTypeNullFuncref = () => (a._BinaryenTypeNullFuncref = P.ab)();
    a._BinaryenTypeUnreachable = () => (a._BinaryenTypeUnreachable = P.bb)();
    a._BinaryenTypeAuto = () => (a._BinaryenTypeAuto = P.cb)();
    a._BinaryenTypeCreate = (b, c) => (a._BinaryenTypeCreate = P.db)(b, c);
    a._BinaryenTypeArity = (b) => (a._BinaryenTypeArity = P.eb)(b);
    a._BinaryenTypeExpand = (b, c) => (a._BinaryenTypeExpand = P.fb)(b, c);
    a._BinaryenPackedTypeNotPacked = () =>
      (a._BinaryenPackedTypeNotPacked = P.gb)();
    a._BinaryenPackedTypeInt8 = () => (a._BinaryenPackedTypeInt8 = P.hb)();
    a._BinaryenPackedTypeInt16 = () => (a._BinaryenPackedTypeInt16 = P.ib)();
    a._BinaryenHeapTypeExt = () => (a._BinaryenHeapTypeExt = P.jb)();
    a._BinaryenHeapTypeFunc = () => (a._BinaryenHeapTypeFunc = P.kb)();
    a._BinaryenHeapTypeAny = () => (a._BinaryenHeapTypeAny = P.lb)();
    a._BinaryenHeapTypeEq = () => (a._BinaryenHeapTypeEq = P.mb)();
    a._BinaryenHeapTypeI31 = () => (a._BinaryenHeapTypeI31 = P.nb)();
    a._BinaryenHeapTypeStruct = () => (a._BinaryenHeapTypeStruct = P.ob)();
    a._BinaryenHeapTypeArray = () => (a._BinaryenHeapTypeArray = P.pb)();
    a._BinaryenHeapTypeString = () => (a._BinaryenHeapTypeString = P.qb)();
    a._BinaryenHeapTypeStringviewWTF8 = () =>
      (a._BinaryenHeapTypeStringviewWTF8 = P.rb)();
    a._BinaryenHeapTypeStringviewWTF16 = () =>
      (a._BinaryenHeapTypeStringviewWTF16 = P.sb)();
    a._BinaryenHeapTypeStringviewIter = () =>
      (a._BinaryenHeapTypeStringviewIter = P.tb)();
    a._BinaryenHeapTypeNone = () => (a._BinaryenHeapTypeNone = P.ub)();
    a._BinaryenHeapTypeNoext = () => (a._BinaryenHeapTypeNoext = P.vb)();
    a._BinaryenHeapTypeNofunc = () => (a._BinaryenHeapTypeNofunc = P.wb)();
    a._BinaryenHeapTypeIsBasic = (b) => (a._BinaryenHeapTypeIsBasic = P.xb)(b);
    a._BinaryenHeapTypeIsSignature = (b) =>
      (a._BinaryenHeapTypeIsSignature = P.yb)(b);
    a._BinaryenHeapTypeIsStruct = (b) =>
      (a._BinaryenHeapTypeIsStruct = P.zb)(b);
    a._BinaryenHeapTypeIsArray = (b) => (a._BinaryenHeapTypeIsArray = P.Ab)(b);
    a._BinaryenHeapTypeIsBottom = (b) =>
      (a._BinaryenHeapTypeIsBottom = P.Bb)(b);
    a._BinaryenHeapTypeGetBottom = (b) =>
      (a._BinaryenHeapTypeGetBottom = P.Cb)(b);
    a._BinaryenHeapTypeIsSubType = (b, c) =>
      (a._BinaryenHeapTypeIsSubType = P.Db)(b, c);
    a._BinaryenStructTypeGetNumFields = (b) =>
      (a._BinaryenStructTypeGetNumFields = P.Eb)(b);
    a._BinaryenStructTypeGetFieldType = (b, c) =>
      (a._BinaryenStructTypeGetFieldType = P.Fb)(b, c);
    a._BinaryenStructTypeGetFieldPackedType = (b, c) =>
      (a._BinaryenStructTypeGetFieldPackedType = P.Gb)(b, c);
    a._BinaryenStructTypeIsFieldMutable = (b, c) =>
      (a._BinaryenStructTypeIsFieldMutable = P.Hb)(b, c);
    a._BinaryenArrayTypeGetElementType = (b) =>
      (a._BinaryenArrayTypeGetElementType = P.Ib)(b);
    a._BinaryenArrayTypeGetElementPackedType = (b) =>
      (a._BinaryenArrayTypeGetElementPackedType = P.Jb)(b);
    a._BinaryenArrayTypeIsElementMutable = (b) =>
      (a._BinaryenArrayTypeIsElementMutable = P.Kb)(b);
    a._BinaryenSignatureTypeGetParams = (b) =>
      (a._BinaryenSignatureTypeGetParams = P.Lb)(b);
    a._BinaryenSignatureTypeGetResults = (b) =>
      (a._BinaryenSignatureTypeGetResults = P.Mb)(b);
    a._BinaryenTypeGetHeapType = (b) => (a._BinaryenTypeGetHeapType = P.Nb)(b);
    a._BinaryenTypeIsNullable = (b) => (a._BinaryenTypeIsNullable = P.Ob)(b);
    a._BinaryenTypeFromHeapType = (b, c) =>
      (a._BinaryenTypeFromHeapType = P.Pb)(b, c);
    a._BinaryenInvalidId = () => (a._BinaryenInvalidId = P.Qb)();
    a._BinaryenNopId = () => (a._BinaryenNopId = P.Rb)();
    a._BinaryenBlockId = () => (a._BinaryenBlockId = P.Sb)();
    a._BinaryenIfId = () => (a._BinaryenIfId = P.Tb)();
    a._BinaryenLoopId = () => (a._BinaryenLoopId = P.Ub)();
    a._BinaryenBreakId = () => (a._BinaryenBreakId = P.Vb)();
    a._BinaryenSwitchId = () => (a._BinaryenSwitchId = P.Wb)();
    a._BinaryenCallId = () => (a._BinaryenCallId = P.Xb)();
    a._BinaryenCallIndirectId = () => (a._BinaryenCallIndirectId = P.Yb)();
    a._BinaryenLocalGetId = () => (a._BinaryenLocalGetId = P.Zb)();
    a._BinaryenLocalSetId = () => (a._BinaryenLocalSetId = P._b)();
    a._BinaryenGlobalGetId = () => (a._BinaryenGlobalGetId = P.$b)();
    a._BinaryenGlobalSetId = () => (a._BinaryenGlobalSetId = P.ac)();
    a._BinaryenLoadId = () => (a._BinaryenLoadId = P.bc)();
    a._BinaryenStoreId = () => (a._BinaryenStoreId = P.cc)();
    a._BinaryenAtomicRMWId = () => (a._BinaryenAtomicRMWId = P.dc)();
    a._BinaryenAtomicCmpxchgId = () => (a._BinaryenAtomicCmpxchgId = P.ec)();
    a._BinaryenAtomicWaitId = () => (a._BinaryenAtomicWaitId = P.fc)();
    a._BinaryenAtomicNotifyId = () => (a._BinaryenAtomicNotifyId = P.gc)();
    a._BinaryenAtomicFenceId = () => (a._BinaryenAtomicFenceId = P.hc)();
    a._BinaryenSIMDExtractId = () => (a._BinaryenSIMDExtractId = P.ic)();
    a._BinaryenSIMDReplaceId = () => (a._BinaryenSIMDReplaceId = P.jc)();
    a._BinaryenSIMDShuffleId = () => (a._BinaryenSIMDShuffleId = P.kc)();
    a._BinaryenSIMDTernaryId = () => (a._BinaryenSIMDTernaryId = P.lc)();
    a._BinaryenSIMDShiftId = () => (a._BinaryenSIMDShiftId = P.mc)();
    a._BinaryenSIMDLoadId = () => (a._BinaryenSIMDLoadId = P.nc)();
    a._BinaryenSIMDLoadStoreLaneId = () =>
      (a._BinaryenSIMDLoadStoreLaneId = P.oc)();
    a._BinaryenMemoryInitId = () => (a._BinaryenMemoryInitId = P.pc)();
    a._BinaryenDataDropId = () => (a._BinaryenDataDropId = P.qc)();
    a._BinaryenMemoryCopyId = () => (a._BinaryenMemoryCopyId = P.rc)();
    a._BinaryenMemoryFillId = () => (a._BinaryenMemoryFillId = P.sc)();
    a._BinaryenConstId = () => (a._BinaryenConstId = P.tc)();
    a._BinaryenUnaryId = () => (a._BinaryenUnaryId = P.uc)();
    a._BinaryenBinaryId = () => (a._BinaryenBinaryId = P.vc)();
    a._BinaryenSelectId = () => (a._BinaryenSelectId = P.wc)();
    a._BinaryenDropId = () => (a._BinaryenDropId = P.xc)();
    a._BinaryenReturnId = () => (a._BinaryenReturnId = P.yc)();
    a._BinaryenMemorySizeId = () => (a._BinaryenMemorySizeId = P.zc)();
    a._BinaryenMemoryGrowId = () => (a._BinaryenMemoryGrowId = P.Ac)();
    a._BinaryenUnreachableId = () => (a._BinaryenUnreachableId = P.Bc)();
    a._BinaryenPopId = () => (a._BinaryenPopId = P.Cc)();
    a._BinaryenRefNullId = () => (a._BinaryenRefNullId = P.Dc)();
    a._BinaryenRefIsNullId = () => (a._BinaryenRefIsNullId = P.Ec)();
    a._BinaryenRefFuncId = () => (a._BinaryenRefFuncId = P.Fc)();
    a._BinaryenRefEqId = () => (a._BinaryenRefEqId = P.Gc)();
    a._BinaryenTableGetId = () => (a._BinaryenTableGetId = P.Hc)();
    a._BinaryenTableSetId = () => (a._BinaryenTableSetId = P.Ic)();
    a._BinaryenTableSizeId = () => (a._BinaryenTableSizeId = P.Jc)();
    a._BinaryenTableGrowId = () => (a._BinaryenTableGrowId = P.Kc)();
    a._BinaryenTableFillId = () => (a._BinaryenTableFillId = P.Lc)();
    a._BinaryenTableCopyId = () => (a._BinaryenTableCopyId = P.Mc)();
    a._BinaryenTryId = () => (a._BinaryenTryId = P.Nc)();
    a._BinaryenThrowId = () => (a._BinaryenThrowId = P.Oc)();
    a._BinaryenRethrowId = () => (a._BinaryenRethrowId = P.Pc)();
    a._BinaryenTupleMakeId = () => (a._BinaryenTupleMakeId = P.Qc)();
    a._BinaryenTupleExtractId = () => (a._BinaryenTupleExtractId = P.Rc)();
    a._BinaryenRefI31Id = () => (a._BinaryenRefI31Id = P.Sc)();
    a._BinaryenI31GetId = () => (a._BinaryenI31GetId = P.Tc)();
    a._BinaryenCallRefId = () => (a._BinaryenCallRefId = P.Uc)();
    a._BinaryenRefTestId = () => (a._BinaryenRefTestId = P.Vc)();
    a._BinaryenRefCastId = () => (a._BinaryenRefCastId = P.Wc)();
    a._BinaryenBrOnId = () => (a._BinaryenBrOnId = P.Xc)();
    a._BinaryenStructNewId = () => (a._BinaryenStructNewId = P.Yc)();
    a._BinaryenStructGetId = () => (a._BinaryenStructGetId = P.Zc)();
    a._BinaryenStructSetId = () => (a._BinaryenStructSetId = P._c)();
    a._BinaryenArrayNewId = () => (a._BinaryenArrayNewId = P.$c)();
    a._BinaryenArrayNewDataId = () => (a._BinaryenArrayNewDataId = P.ad)();
    a._BinaryenArrayNewElemId = () => (a._BinaryenArrayNewElemId = P.bd)();
    a._BinaryenArrayNewFixedId = () => (a._BinaryenArrayNewFixedId = P.cd)();
    a._BinaryenArrayGetId = () => (a._BinaryenArrayGetId = P.dd)();
    a._BinaryenArraySetId = () => (a._BinaryenArraySetId = P.ed)();
    a._BinaryenArrayLenId = () => (a._BinaryenArrayLenId = P.fd)();
    a._BinaryenArrayCopyId = () => (a._BinaryenArrayCopyId = P.gd)();
    a._BinaryenArrayFillId = () => (a._BinaryenArrayFillId = P.hd)();
    a._BinaryenArrayInitDataId = () => (a._BinaryenArrayInitDataId = P.id)();
    a._BinaryenArrayInitElemId = () => (a._BinaryenArrayInitElemId = P.jd)();
    a._BinaryenRefAsId = () => (a._BinaryenRefAsId = P.kd)();
    a._BinaryenStringNewId = () => (a._BinaryenStringNewId = P.ld)();
    a._BinaryenStringConstId = () => (a._BinaryenStringConstId = P.md)();
    a._BinaryenStringMeasureId = () => (a._BinaryenStringMeasureId = P.nd)();
    a._BinaryenStringEncodeId = () => (a._BinaryenStringEncodeId = P.od)();
    a._BinaryenStringConcatId = () => (a._BinaryenStringConcatId = P.pd)();
    a._BinaryenStringEqId = () => (a._BinaryenStringEqId = P.qd)();
    a._BinaryenStringAsId = () => (a._BinaryenStringAsId = P.rd)();
    a._BinaryenStringWTF8AdvanceId = () =>
      (a._BinaryenStringWTF8AdvanceId = P.sd)();
    a._BinaryenStringWTF16GetId = () => (a._BinaryenStringWTF16GetId = P.td)();
    a._BinaryenStringIterNextId = () => (a._BinaryenStringIterNextId = P.ud)();
    a._BinaryenStringIterMoveId = () => (a._BinaryenStringIterMoveId = P.vd)();
    a._BinaryenStringSliceWTFId = () => (a._BinaryenStringSliceWTFId = P.wd)();
    a._BinaryenStringSliceIterId = () =>
      (a._BinaryenStringSliceIterId = P.xd)();
    a._BinaryenExternalFunction = () => (a._BinaryenExternalFunction = P.yd)();
    a._BinaryenExternalTable = () => (a._BinaryenExternalTable = P.zd)();
    a._BinaryenExternalMemory = () => (a._BinaryenExternalMemory = P.Ad)();
    a._BinaryenExternalGlobal = () => (a._BinaryenExternalGlobal = P.Bd)();
    a._BinaryenExternalTag = () => (a._BinaryenExternalTag = P.Cd)();
    a._BinaryenFeatureMVP = () => (a._BinaryenFeatureMVP = P.Dd)();
    a._BinaryenFeatureAtomics = () => (a._BinaryenFeatureAtomics = P.Ed)();
    a._BinaryenFeatureBulkMemory = () =>
      (a._BinaryenFeatureBulkMemory = P.Fd)();
    a._BinaryenFeatureMutableGlobals = () =>
      (a._BinaryenFeatureMutableGlobals = P.Gd)();
    a._BinaryenFeatureNontrappingFPToInt = () =>
      (a._BinaryenFeatureNontrappingFPToInt = P.Hd)();
    a._BinaryenFeatureSignExt = () => (a._BinaryenFeatureSignExt = P.Id)();
    a._BinaryenFeatureSIMD128 = () => (a._BinaryenFeatureSIMD128 = P.Jd)();
    a._BinaryenFeatureExceptionHandling = () =>
      (a._BinaryenFeatureExceptionHandling = P.Kd)();
    a._BinaryenFeatureTailCall = () => (a._BinaryenFeatureTailCall = P.Ld)();
    a._BinaryenFeatureReferenceTypes = () =>
      (a._BinaryenFeatureReferenceTypes = P.Md)();
    a._BinaryenFeatureMultivalue = () =>
      (a._BinaryenFeatureMultivalue = P.Nd)();
    a._BinaryenFeatureGC = () => (a._BinaryenFeatureGC = P.Od)();
    a._BinaryenFeatureMemory64 = () => (a._BinaryenFeatureMemory64 = P.Pd)();
    a._BinaryenFeatureRelaxedSIMD = () =>
      (a._BinaryenFeatureRelaxedSIMD = P.Qd)();
    a._BinaryenFeatureExtendedConst = () =>
      (a._BinaryenFeatureExtendedConst = P.Rd)();
    a._BinaryenFeatureStrings = () => (a._BinaryenFeatureStrings = P.Sd)();
    a._BinaryenFeatureMultiMemory = () =>
      (a._BinaryenFeatureMultiMemory = P.Td)();
    a._BinaryenFeatureAll = () => (a._BinaryenFeatureAll = P.Ud)();
    a._BinaryenModuleCreate = () => (a._BinaryenModuleCreate = P.Vd)();
    a._BinaryenModuleDispose = (b) => (a._BinaryenModuleDispose = P.Wd)(b);
    a._BinaryenLiteralInt32 = (b, c) => (a._BinaryenLiteralInt32 = P.Xd)(b, c);
    a._BinaryenLiteralInt64 = (b, c, g) =>
      (a._BinaryenLiteralInt64 = P.Yd)(b, c, g);
    a._BinaryenLiteralFloat32 = (b, c) =>
      (a._BinaryenLiteralFloat32 = P.Zd)(b, c);
    a._BinaryenLiteralFloat64 = (b, c) =>
      (a._BinaryenLiteralFloat64 = P._d)(b, c);
    a._BinaryenLiteralVec128 = (b, c) =>
      (a._BinaryenLiteralVec128 = P.$d)(b, c);
    a._BinaryenLiteralFloat32Bits = (b, c) =>
      (a._BinaryenLiteralFloat32Bits = P.ae)(b, c);
    a._BinaryenLiteralFloat64Bits = (b, c, g) =>
      (a._BinaryenLiteralFloat64Bits = P.be)(b, c, g);
    a._BinaryenClzInt32 = () => (a._BinaryenClzInt32 = P.ce)();
    a._BinaryenCtzInt32 = () => (a._BinaryenCtzInt32 = P.de)();
    a._BinaryenPopcntInt32 = () => (a._BinaryenPopcntInt32 = P.ee)();
    a._BinaryenNegFloat32 = () => (a._BinaryenNegFloat32 = P.fe)();
    a._BinaryenAbsFloat32 = () => (a._BinaryenAbsFloat32 = P.ge)();
    a._BinaryenCeilFloat32 = () => (a._BinaryenCeilFloat32 = P.he)();
    a._BinaryenFloorFloat32 = () => (a._BinaryenFloorFloat32 = P.ie)();
    a._BinaryenTruncFloat32 = () => (a._BinaryenTruncFloat32 = P.je)();
    a._BinaryenNearestFloat32 = () => (a._BinaryenNearestFloat32 = P.ke)();
    a._BinaryenSqrtFloat32 = () => (a._BinaryenSqrtFloat32 = P.le)();
    a._BinaryenEqZInt32 = () => (a._BinaryenEqZInt32 = P.me)();
    a._BinaryenClzInt64 = () => (a._BinaryenClzInt64 = P.ne)();
    a._BinaryenCtzInt64 = () => (a._BinaryenCtzInt64 = P.oe)();
    a._BinaryenPopcntInt64 = () => (a._BinaryenPopcntInt64 = P.pe)();
    a._BinaryenNegFloat64 = () => (a._BinaryenNegFloat64 = P.qe)();
    a._BinaryenAbsFloat64 = () => (a._BinaryenAbsFloat64 = P.re)();
    a._BinaryenCeilFloat64 = () => (a._BinaryenCeilFloat64 = P.se)();
    a._BinaryenFloorFloat64 = () => (a._BinaryenFloorFloat64 = P.te)();
    a._BinaryenTruncFloat64 = () => (a._BinaryenTruncFloat64 = P.ue)();
    a._BinaryenNearestFloat64 = () => (a._BinaryenNearestFloat64 = P.ve)();
    a._BinaryenSqrtFloat64 = () => (a._BinaryenSqrtFloat64 = P.we)();
    a._BinaryenEqZInt64 = () => (a._BinaryenEqZInt64 = P.xe)();
    a._BinaryenExtendSInt32 = () => (a._BinaryenExtendSInt32 = P.ye)();
    a._BinaryenExtendUInt32 = () => (a._BinaryenExtendUInt32 = P.ze)();
    a._BinaryenWrapInt64 = () => (a._BinaryenWrapInt64 = P.Ae)();
    a._BinaryenTruncSFloat32ToInt32 = () =>
      (a._BinaryenTruncSFloat32ToInt32 = P.Be)();
    a._BinaryenTruncSFloat32ToInt64 = () =>
      (a._BinaryenTruncSFloat32ToInt64 = P.Ce)();
    a._BinaryenTruncUFloat32ToInt32 = () =>
      (a._BinaryenTruncUFloat32ToInt32 = P.De)();
    a._BinaryenTruncUFloat32ToInt64 = () =>
      (a._BinaryenTruncUFloat32ToInt64 = P.Ee)();
    a._BinaryenTruncSFloat64ToInt32 = () =>
      (a._BinaryenTruncSFloat64ToInt32 = P.Fe)();
    a._BinaryenTruncSFloat64ToInt64 = () =>
      (a._BinaryenTruncSFloat64ToInt64 = P.Ge)();
    a._BinaryenTruncUFloat64ToInt32 = () =>
      (a._BinaryenTruncUFloat64ToInt32 = P.He)();
    a._BinaryenTruncUFloat64ToInt64 = () =>
      (a._BinaryenTruncUFloat64ToInt64 = P.Ie)();
    a._BinaryenReinterpretFloat32 = () =>
      (a._BinaryenReinterpretFloat32 = P.Je)();
    a._BinaryenReinterpretFloat64 = () =>
      (a._BinaryenReinterpretFloat64 = P.Ke)();
    a._BinaryenExtendS8Int32 = () => (a._BinaryenExtendS8Int32 = P.Le)();
    a._BinaryenExtendS16Int32 = () => (a._BinaryenExtendS16Int32 = P.Me)();
    a._BinaryenExtendS8Int64 = () => (a._BinaryenExtendS8Int64 = P.Ne)();
    a._BinaryenExtendS16Int64 = () => (a._BinaryenExtendS16Int64 = P.Oe)();
    a._BinaryenExtendS32Int64 = () => (a._BinaryenExtendS32Int64 = P.Pe)();
    a._BinaryenConvertSInt32ToFloat32 = () =>
      (a._BinaryenConvertSInt32ToFloat32 = P.Qe)();
    a._BinaryenConvertSInt32ToFloat64 = () =>
      (a._BinaryenConvertSInt32ToFloat64 = P.Re)();
    a._BinaryenConvertUInt32ToFloat32 = () =>
      (a._BinaryenConvertUInt32ToFloat32 = P.Se)();
    a._BinaryenConvertUInt32ToFloat64 = () =>
      (a._BinaryenConvertUInt32ToFloat64 = P.Te)();
    a._BinaryenConvertSInt64ToFloat32 = () =>
      (a._BinaryenConvertSInt64ToFloat32 = P.Ue)();
    a._BinaryenConvertSInt64ToFloat64 = () =>
      (a._BinaryenConvertSInt64ToFloat64 = P.Ve)();
    a._BinaryenConvertUInt64ToFloat32 = () =>
      (a._BinaryenConvertUInt64ToFloat32 = P.We)();
    a._BinaryenConvertUInt64ToFloat64 = () =>
      (a._BinaryenConvertUInt64ToFloat64 = P.Xe)();
    a._BinaryenPromoteFloat32 = () => (a._BinaryenPromoteFloat32 = P.Ye)();
    a._BinaryenDemoteFloat64 = () => (a._BinaryenDemoteFloat64 = P.Ze)();
    a._BinaryenReinterpretInt32 = () => (a._BinaryenReinterpretInt32 = P._e)();
    a._BinaryenReinterpretInt64 = () => (a._BinaryenReinterpretInt64 = P.$e)();
    a._BinaryenAddInt32 = () => (a._BinaryenAddInt32 = P.af)();
    a._BinaryenSubInt32 = () => (a._BinaryenSubInt32 = P.bf)();
    a._BinaryenMulInt32 = () => (a._BinaryenMulInt32 = P.cf)();
    a._BinaryenDivSInt32 = () => (a._BinaryenDivSInt32 = P.df)();
    a._BinaryenDivUInt32 = () => (a._BinaryenDivUInt32 = P.ef)();
    a._BinaryenRemSInt32 = () => (a._BinaryenRemSInt32 = P.ff)();
    a._BinaryenRemUInt32 = () => (a._BinaryenRemUInt32 = P.gf)();
    a._BinaryenAndInt32 = () => (a._BinaryenAndInt32 = P.hf)();
    a._BinaryenOrInt32 = () => (a._BinaryenOrInt32 = P.jf)();
    a._BinaryenXorInt32 = () => (a._BinaryenXorInt32 = P.kf)();
    a._BinaryenShlInt32 = () => (a._BinaryenShlInt32 = P.lf)();
    a._BinaryenShrUInt32 = () => (a._BinaryenShrUInt32 = P.mf)();
    a._BinaryenShrSInt32 = () => (a._BinaryenShrSInt32 = P.nf)();
    a._BinaryenRotLInt32 = () => (a._BinaryenRotLInt32 = P.of)();
    a._BinaryenRotRInt32 = () => (a._BinaryenRotRInt32 = P.pf)();
    a._BinaryenEqInt32 = () => (a._BinaryenEqInt32 = P.qf)();
    a._BinaryenNeInt32 = () => (a._BinaryenNeInt32 = P.rf)();
    a._BinaryenLtSInt32 = () => (a._BinaryenLtSInt32 = P.sf)();
    a._BinaryenLtUInt32 = () => (a._BinaryenLtUInt32 = P.tf)();
    a._BinaryenLeSInt32 = () => (a._BinaryenLeSInt32 = P.uf)();
    a._BinaryenLeUInt32 = () => (a._BinaryenLeUInt32 = P.vf)();
    a._BinaryenGtSInt32 = () => (a._BinaryenGtSInt32 = P.wf)();
    a._BinaryenGtUInt32 = () => (a._BinaryenGtUInt32 = P.xf)();
    a._BinaryenGeSInt32 = () => (a._BinaryenGeSInt32 = P.yf)();
    a._BinaryenGeUInt32 = () => (a._BinaryenGeUInt32 = P.zf)();
    a._BinaryenAddInt64 = () => (a._BinaryenAddInt64 = P.Af)();
    a._BinaryenSubInt64 = () => (a._BinaryenSubInt64 = P.Bf)();
    a._BinaryenMulInt64 = () => (a._BinaryenMulInt64 = P.Cf)();
    a._BinaryenDivSInt64 = () => (a._BinaryenDivSInt64 = P.Df)();
    a._BinaryenDivUInt64 = () => (a._BinaryenDivUInt64 = P.Ef)();
    a._BinaryenRemSInt64 = () => (a._BinaryenRemSInt64 = P.Ff)();
    a._BinaryenRemUInt64 = () => (a._BinaryenRemUInt64 = P.Gf)();
    a._BinaryenAndInt64 = () => (a._BinaryenAndInt64 = P.Hf)();
    a._BinaryenOrInt64 = () => (a._BinaryenOrInt64 = P.If)();
    a._BinaryenXorInt64 = () => (a._BinaryenXorInt64 = P.Jf)();
    a._BinaryenShlInt64 = () => (a._BinaryenShlInt64 = P.Kf)();
    a._BinaryenShrUInt64 = () => (a._BinaryenShrUInt64 = P.Lf)();
    a._BinaryenShrSInt64 = () => (a._BinaryenShrSInt64 = P.Mf)();
    a._BinaryenRotLInt64 = () => (a._BinaryenRotLInt64 = P.Nf)();
    a._BinaryenRotRInt64 = () => (a._BinaryenRotRInt64 = P.Of)();
    a._BinaryenEqInt64 = () => (a._BinaryenEqInt64 = P.Pf)();
    a._BinaryenNeInt64 = () => (a._BinaryenNeInt64 = P.Qf)();
    a._BinaryenLtSInt64 = () => (a._BinaryenLtSInt64 = P.Rf)();
    a._BinaryenLtUInt64 = () => (a._BinaryenLtUInt64 = P.Sf)();
    a._BinaryenLeSInt64 = () => (a._BinaryenLeSInt64 = P.Tf)();
    a._BinaryenLeUInt64 = () => (a._BinaryenLeUInt64 = P.Uf)();
    a._BinaryenGtSInt64 = () => (a._BinaryenGtSInt64 = P.Vf)();
    a._BinaryenGtUInt64 = () => (a._BinaryenGtUInt64 = P.Wf)();
    a._BinaryenGeSInt64 = () => (a._BinaryenGeSInt64 = P.Xf)();
    a._BinaryenGeUInt64 = () => (a._BinaryenGeUInt64 = P.Yf)();
    a._BinaryenAddFloat32 = () => (a._BinaryenAddFloat32 = P.Zf)();
    a._BinaryenSubFloat32 = () => (a._BinaryenSubFloat32 = P._f)();
    a._BinaryenMulFloat32 = () => (a._BinaryenMulFloat32 = P.$f)();
    a._BinaryenDivFloat32 = () => (a._BinaryenDivFloat32 = P.ag)();
    a._BinaryenCopySignFloat32 = () => (a._BinaryenCopySignFloat32 = P.bg)();
    a._BinaryenMinFloat32 = () => (a._BinaryenMinFloat32 = P.cg)();
    a._BinaryenMaxFloat32 = () => (a._BinaryenMaxFloat32 = P.dg)();
    a._BinaryenEqFloat32 = () => (a._BinaryenEqFloat32 = P.eg)();
    a._BinaryenNeFloat32 = () => (a._BinaryenNeFloat32 = P.fg)();
    a._BinaryenLtFloat32 = () => (a._BinaryenLtFloat32 = P.gg)();
    a._BinaryenLeFloat32 = () => (a._BinaryenLeFloat32 = P.hg)();
    a._BinaryenGtFloat32 = () => (a._BinaryenGtFloat32 = P.ig)();
    a._BinaryenGeFloat32 = () => (a._BinaryenGeFloat32 = P.jg)();
    a._BinaryenAddFloat64 = () => (a._BinaryenAddFloat64 = P.kg)();
    a._BinaryenSubFloat64 = () => (a._BinaryenSubFloat64 = P.lg)();
    a._BinaryenMulFloat64 = () => (a._BinaryenMulFloat64 = P.mg)();
    a._BinaryenDivFloat64 = () => (a._BinaryenDivFloat64 = P.ng)();
    a._BinaryenCopySignFloat64 = () => (a._BinaryenCopySignFloat64 = P.og)();
    a._BinaryenMinFloat64 = () => (a._BinaryenMinFloat64 = P.pg)();
    a._BinaryenMaxFloat64 = () => (a._BinaryenMaxFloat64 = P.qg)();
    a._BinaryenEqFloat64 = () => (a._BinaryenEqFloat64 = P.rg)();
    a._BinaryenNeFloat64 = () => (a._BinaryenNeFloat64 = P.sg)();
    a._BinaryenLtFloat64 = () => (a._BinaryenLtFloat64 = P.tg)();
    a._BinaryenLeFloat64 = () => (a._BinaryenLeFloat64 = P.ug)();
    a._BinaryenGtFloat64 = () => (a._BinaryenGtFloat64 = P.vg)();
    a._BinaryenGeFloat64 = () => (a._BinaryenGeFloat64 = P.wg)();
    a._BinaryenAtomicRMWAdd = () => (a._BinaryenAtomicRMWAdd = P.xg)();
    a._BinaryenAtomicRMWSub = () => (a._BinaryenAtomicRMWSub = P.yg)();
    a._BinaryenAtomicRMWAnd = () => (a._BinaryenAtomicRMWAnd = P.zg)();
    a._BinaryenAtomicRMWOr = () => (a._BinaryenAtomicRMWOr = P.Ag)();
    a._BinaryenAtomicRMWXor = () => (a._BinaryenAtomicRMWXor = P.Bg)();
    a._BinaryenAtomicRMWXchg = () => (a._BinaryenAtomicRMWXchg = P.Cg)();
    a._BinaryenTruncSatSFloat32ToInt32 = () =>
      (a._BinaryenTruncSatSFloat32ToInt32 = P.Dg)();
    a._BinaryenTruncSatSFloat32ToInt64 = () =>
      (a._BinaryenTruncSatSFloat32ToInt64 = P.Eg)();
    a._BinaryenTruncSatUFloat32ToInt32 = () =>
      (a._BinaryenTruncSatUFloat32ToInt32 = P.Fg)();
    a._BinaryenTruncSatUFloat32ToInt64 = () =>
      (a._BinaryenTruncSatUFloat32ToInt64 = P.Gg)();
    a._BinaryenTruncSatSFloat64ToInt32 = () =>
      (a._BinaryenTruncSatSFloat64ToInt32 = P.Hg)();
    a._BinaryenTruncSatSFloat64ToInt64 = () =>
      (a._BinaryenTruncSatSFloat64ToInt64 = P.Ig)();
    a._BinaryenTruncSatUFloat64ToInt32 = () =>
      (a._BinaryenTruncSatUFloat64ToInt32 = P.Jg)();
    a._BinaryenTruncSatUFloat64ToInt64 = () =>
      (a._BinaryenTruncSatUFloat64ToInt64 = P.Kg)();
    a._BinaryenSplatVecI8x16 = () => (a._BinaryenSplatVecI8x16 = P.Lg)();
    a._BinaryenExtractLaneSVecI8x16 = () =>
      (a._BinaryenExtractLaneSVecI8x16 = P.Mg)();
    a._BinaryenExtractLaneUVecI8x16 = () =>
      (a._BinaryenExtractLaneUVecI8x16 = P.Ng)();
    a._BinaryenReplaceLaneVecI8x16 = () =>
      (a._BinaryenReplaceLaneVecI8x16 = P.Og)();
    a._BinaryenSplatVecI16x8 = () => (a._BinaryenSplatVecI16x8 = P.Pg)();
    a._BinaryenExtractLaneSVecI16x8 = () =>
      (a._BinaryenExtractLaneSVecI16x8 = P.Qg)();
    a._BinaryenExtractLaneUVecI16x8 = () =>
      (a._BinaryenExtractLaneUVecI16x8 = P.Rg)();
    a._BinaryenReplaceLaneVecI16x8 = () =>
      (a._BinaryenReplaceLaneVecI16x8 = P.Sg)();
    a._BinaryenSplatVecI32x4 = () => (a._BinaryenSplatVecI32x4 = P.Tg)();
    a._BinaryenExtractLaneVecI32x4 = () =>
      (a._BinaryenExtractLaneVecI32x4 = P.Ug)();
    a._BinaryenReplaceLaneVecI32x4 = () =>
      (a._BinaryenReplaceLaneVecI32x4 = P.Vg)();
    a._BinaryenSplatVecI64x2 = () => (a._BinaryenSplatVecI64x2 = P.Wg)();
    a._BinaryenExtractLaneVecI64x2 = () =>
      (a._BinaryenExtractLaneVecI64x2 = P.Xg)();
    a._BinaryenReplaceLaneVecI64x2 = () =>
      (a._BinaryenReplaceLaneVecI64x2 = P.Yg)();
    a._BinaryenSplatVecF32x4 = () => (a._BinaryenSplatVecF32x4 = P.Zg)();
    a._BinaryenExtractLaneVecF32x4 = () =>
      (a._BinaryenExtractLaneVecF32x4 = P._g)();
    a._BinaryenReplaceLaneVecF32x4 = () =>
      (a._BinaryenReplaceLaneVecF32x4 = P.$g)();
    a._BinaryenSplatVecF64x2 = () => (a._BinaryenSplatVecF64x2 = P.ah)();
    a._BinaryenExtractLaneVecF64x2 = () =>
      (a._BinaryenExtractLaneVecF64x2 = P.bh)();
    a._BinaryenReplaceLaneVecF64x2 = () =>
      (a._BinaryenReplaceLaneVecF64x2 = P.ch)();
    a._BinaryenEqVecI8x16 = () => (a._BinaryenEqVecI8x16 = P.dh)();
    a._BinaryenNeVecI8x16 = () => (a._BinaryenNeVecI8x16 = P.eh)();
    a._BinaryenLtSVecI8x16 = () => (a._BinaryenLtSVecI8x16 = P.fh)();
    a._BinaryenLtUVecI8x16 = () => (a._BinaryenLtUVecI8x16 = P.gh)();
    a._BinaryenGtSVecI8x16 = () => (a._BinaryenGtSVecI8x16 = P.hh)();
    a._BinaryenGtUVecI8x16 = () => (a._BinaryenGtUVecI8x16 = P.ih)();
    a._BinaryenLeSVecI8x16 = () => (a._BinaryenLeSVecI8x16 = P.jh)();
    a._BinaryenLeUVecI8x16 = () => (a._BinaryenLeUVecI8x16 = P.kh)();
    a._BinaryenGeSVecI8x16 = () => (a._BinaryenGeSVecI8x16 = P.lh)();
    a._BinaryenGeUVecI8x16 = () => (a._BinaryenGeUVecI8x16 = P.mh)();
    a._BinaryenEqVecI16x8 = () => (a._BinaryenEqVecI16x8 = P.nh)();
    a._BinaryenNeVecI16x8 = () => (a._BinaryenNeVecI16x8 = P.oh)();
    a._BinaryenLtSVecI16x8 = () => (a._BinaryenLtSVecI16x8 = P.ph)();
    a._BinaryenLtUVecI16x8 = () => (a._BinaryenLtUVecI16x8 = P.qh)();
    a._BinaryenGtSVecI16x8 = () => (a._BinaryenGtSVecI16x8 = P.rh)();
    a._BinaryenGtUVecI16x8 = () => (a._BinaryenGtUVecI16x8 = P.sh)();
    a._BinaryenLeSVecI16x8 = () => (a._BinaryenLeSVecI16x8 = P.th)();
    a._BinaryenLeUVecI16x8 = () => (a._BinaryenLeUVecI16x8 = P.uh)();
    a._BinaryenGeSVecI16x8 = () => (a._BinaryenGeSVecI16x8 = P.vh)();
    a._BinaryenGeUVecI16x8 = () => (a._BinaryenGeUVecI16x8 = P.wh)();
    a._BinaryenEqVecI32x4 = () => (a._BinaryenEqVecI32x4 = P.xh)();
    a._BinaryenNeVecI32x4 = () => (a._BinaryenNeVecI32x4 = P.yh)();
    a._BinaryenLtSVecI32x4 = () => (a._BinaryenLtSVecI32x4 = P.zh)();
    a._BinaryenLtUVecI32x4 = () => (a._BinaryenLtUVecI32x4 = P.Ah)();
    a._BinaryenGtSVecI32x4 = () => (a._BinaryenGtSVecI32x4 = P.Bh)();
    a._BinaryenGtUVecI32x4 = () => (a._BinaryenGtUVecI32x4 = P.Ch)();
    a._BinaryenLeSVecI32x4 = () => (a._BinaryenLeSVecI32x4 = P.Dh)();
    a._BinaryenLeUVecI32x4 = () => (a._BinaryenLeUVecI32x4 = P.Eh)();
    a._BinaryenGeSVecI32x4 = () => (a._BinaryenGeSVecI32x4 = P.Fh)();
    a._BinaryenGeUVecI32x4 = () => (a._BinaryenGeUVecI32x4 = P.Gh)();
    a._BinaryenEqVecI64x2 = () => (a._BinaryenEqVecI64x2 = P.Hh)();
    a._BinaryenNeVecI64x2 = () => (a._BinaryenNeVecI64x2 = P.Ih)();
    a._BinaryenLtSVecI64x2 = () => (a._BinaryenLtSVecI64x2 = P.Jh)();
    a._BinaryenGtSVecI64x2 = () => (a._BinaryenGtSVecI64x2 = P.Kh)();
    a._BinaryenLeSVecI64x2 = () => (a._BinaryenLeSVecI64x2 = P.Lh)();
    a._BinaryenGeSVecI64x2 = () => (a._BinaryenGeSVecI64x2 = P.Mh)();
    a._BinaryenEqVecF32x4 = () => (a._BinaryenEqVecF32x4 = P.Nh)();
    a._BinaryenNeVecF32x4 = () => (a._BinaryenNeVecF32x4 = P.Oh)();
    a._BinaryenLtVecF32x4 = () => (a._BinaryenLtVecF32x4 = P.Ph)();
    a._BinaryenGtVecF32x4 = () => (a._BinaryenGtVecF32x4 = P.Qh)();
    a._BinaryenLeVecF32x4 = () => (a._BinaryenLeVecF32x4 = P.Rh)();
    a._BinaryenGeVecF32x4 = () => (a._BinaryenGeVecF32x4 = P.Sh)();
    a._BinaryenEqVecF64x2 = () => (a._BinaryenEqVecF64x2 = P.Th)();
    a._BinaryenNeVecF64x2 = () => (a._BinaryenNeVecF64x2 = P.Uh)();
    a._BinaryenLtVecF64x2 = () => (a._BinaryenLtVecF64x2 = P.Vh)();
    a._BinaryenGtVecF64x2 = () => (a._BinaryenGtVecF64x2 = P.Wh)();
    a._BinaryenLeVecF64x2 = () => (a._BinaryenLeVecF64x2 = P.Xh)();
    a._BinaryenGeVecF64x2 = () => (a._BinaryenGeVecF64x2 = P.Yh)();
    a._BinaryenNotVec128 = () => (a._BinaryenNotVec128 = P.Zh)();
    a._BinaryenAndVec128 = () => (a._BinaryenAndVec128 = P._h)();
    a._BinaryenOrVec128 = () => (a._BinaryenOrVec128 = P.$h)();
    a._BinaryenXorVec128 = () => (a._BinaryenXorVec128 = P.ai)();
    a._BinaryenAndNotVec128 = () => (a._BinaryenAndNotVec128 = P.bi)();
    a._BinaryenBitselectVec128 = () => (a._BinaryenBitselectVec128 = P.ci)();
    a._BinaryenRelaxedFmaVecF32x4 = () =>
      (a._BinaryenRelaxedFmaVecF32x4 = P.di)();
    a._BinaryenRelaxedFmsVecF32x4 = () =>
      (a._BinaryenRelaxedFmsVecF32x4 = P.ei)();
    a._BinaryenRelaxedFmaVecF64x2 = () =>
      (a._BinaryenRelaxedFmaVecF64x2 = P.fi)();
    a._BinaryenRelaxedFmsVecF64x2 = () =>
      (a._BinaryenRelaxedFmsVecF64x2 = P.gi)();
    a._BinaryenLaneselectI8x16 = () => (a._BinaryenLaneselectI8x16 = P.hi)();
    a._BinaryenLaneselectI16x8 = () => (a._BinaryenLaneselectI16x8 = P.ii)();
    a._BinaryenLaneselectI32x4 = () => (a._BinaryenLaneselectI32x4 = P.ji)();
    a._BinaryenLaneselectI64x2 = () => (a._BinaryenLaneselectI64x2 = P.ki)();
    a._BinaryenDotI8x16I7x16AddSToVecI32x4 = () =>
      (a._BinaryenDotI8x16I7x16AddSToVecI32x4 = P.li)();
    a._BinaryenAnyTrueVec128 = () => (a._BinaryenAnyTrueVec128 = P.mi)();
    a._BinaryenAbsVecI8x16 = () => (a._BinaryenAbsVecI8x16 = P.ni)();
    a._BinaryenNegVecI8x16 = () => (a._BinaryenNegVecI8x16 = P.oi)();
    a._BinaryenAllTrueVecI8x16 = () => (a._BinaryenAllTrueVecI8x16 = P.pi)();
    a._BinaryenBitmaskVecI8x16 = () => (a._BinaryenBitmaskVecI8x16 = P.qi)();
    a._BinaryenPopcntVecI8x16 = () => (a._BinaryenPopcntVecI8x16 = P.ri)();
    a._BinaryenShlVecI8x16 = () => (a._BinaryenShlVecI8x16 = P.si)();
    a._BinaryenShrSVecI8x16 = () => (a._BinaryenShrSVecI8x16 = P.ti)();
    a._BinaryenShrUVecI8x16 = () => (a._BinaryenShrUVecI8x16 = P.ui)();
    a._BinaryenAddVecI8x16 = () => (a._BinaryenAddVecI8x16 = P.vi)();
    a._BinaryenAddSatSVecI8x16 = () => (a._BinaryenAddSatSVecI8x16 = P.wi)();
    a._BinaryenAddSatUVecI8x16 = () => (a._BinaryenAddSatUVecI8x16 = P.xi)();
    a._BinaryenSubVecI8x16 = () => (a._BinaryenSubVecI8x16 = P.yi)();
    a._BinaryenSubSatSVecI8x16 = () => (a._BinaryenSubSatSVecI8x16 = P.zi)();
    a._BinaryenSubSatUVecI8x16 = () => (a._BinaryenSubSatUVecI8x16 = P.Ai)();
    a._BinaryenMinSVecI8x16 = () => (a._BinaryenMinSVecI8x16 = P.Bi)();
    a._BinaryenMinUVecI8x16 = () => (a._BinaryenMinUVecI8x16 = P.Ci)();
    a._BinaryenMaxSVecI8x16 = () => (a._BinaryenMaxSVecI8x16 = P.Di)();
    a._BinaryenMaxUVecI8x16 = () => (a._BinaryenMaxUVecI8x16 = P.Ei)();
    a._BinaryenAvgrUVecI8x16 = () => (a._BinaryenAvgrUVecI8x16 = P.Fi)();
    a._BinaryenAbsVecI16x8 = () => (a._BinaryenAbsVecI16x8 = P.Gi)();
    a._BinaryenNegVecI16x8 = () => (a._BinaryenNegVecI16x8 = P.Hi)();
    a._BinaryenAllTrueVecI16x8 = () => (a._BinaryenAllTrueVecI16x8 = P.Ii)();
    a._BinaryenBitmaskVecI16x8 = () => (a._BinaryenBitmaskVecI16x8 = P.Ji)();
    a._BinaryenShlVecI16x8 = () => (a._BinaryenShlVecI16x8 = P.Ki)();
    a._BinaryenShrSVecI16x8 = () => (a._BinaryenShrSVecI16x8 = P.Li)();
    a._BinaryenShrUVecI16x8 = () => (a._BinaryenShrUVecI16x8 = P.Mi)();
    a._BinaryenAddVecI16x8 = () => (a._BinaryenAddVecI16x8 = P.Ni)();
    a._BinaryenAddSatSVecI16x8 = () => (a._BinaryenAddSatSVecI16x8 = P.Oi)();
    a._BinaryenAddSatUVecI16x8 = () => (a._BinaryenAddSatUVecI16x8 = P.Pi)();
    a._BinaryenSubVecI16x8 = () => (a._BinaryenSubVecI16x8 = P.Qi)();
    a._BinaryenSubSatSVecI16x8 = () => (a._BinaryenSubSatSVecI16x8 = P.Ri)();
    a._BinaryenSubSatUVecI16x8 = () => (a._BinaryenSubSatUVecI16x8 = P.Si)();
    a._BinaryenMulVecI16x8 = () => (a._BinaryenMulVecI16x8 = P.Ti)();
    a._BinaryenMinSVecI16x8 = () => (a._BinaryenMinSVecI16x8 = P.Ui)();
    a._BinaryenMinUVecI16x8 = () => (a._BinaryenMinUVecI16x8 = P.Vi)();
    a._BinaryenMaxSVecI16x8 = () => (a._BinaryenMaxSVecI16x8 = P.Wi)();
    a._BinaryenMaxUVecI16x8 = () => (a._BinaryenMaxUVecI16x8 = P.Xi)();
    a._BinaryenAvgrUVecI16x8 = () => (a._BinaryenAvgrUVecI16x8 = P.Yi)();
    a._BinaryenQ15MulrSatSVecI16x8 = () =>
      (a._BinaryenQ15MulrSatSVecI16x8 = P.Zi)();
    a._BinaryenExtMulLowSVecI16x8 = () =>
      (a._BinaryenExtMulLowSVecI16x8 = P._i)();
    a._BinaryenExtMulHighSVecI16x8 = () =>
      (a._BinaryenExtMulHighSVecI16x8 = P.$i)();
    a._BinaryenExtMulLowUVecI16x8 = () =>
      (a._BinaryenExtMulLowUVecI16x8 = P.aj)();
    a._BinaryenExtMulHighUVecI16x8 = () =>
      (a._BinaryenExtMulHighUVecI16x8 = P.bj)();
    a._BinaryenAbsVecI32x4 = () => (a._BinaryenAbsVecI32x4 = P.cj)();
    a._BinaryenNegVecI32x4 = () => (a._BinaryenNegVecI32x4 = P.dj)();
    a._BinaryenAllTrueVecI32x4 = () => (a._BinaryenAllTrueVecI32x4 = P.ej)();
    a._BinaryenBitmaskVecI32x4 = () => (a._BinaryenBitmaskVecI32x4 = P.fj)();
    a._BinaryenShlVecI32x4 = () => (a._BinaryenShlVecI32x4 = P.gj)();
    a._BinaryenShrSVecI32x4 = () => (a._BinaryenShrSVecI32x4 = P.hj)();
    a._BinaryenShrUVecI32x4 = () => (a._BinaryenShrUVecI32x4 = P.ij)();
    a._BinaryenAddVecI32x4 = () => (a._BinaryenAddVecI32x4 = P.jj)();
    a._BinaryenSubVecI32x4 = () => (a._BinaryenSubVecI32x4 = P.kj)();
    a._BinaryenMulVecI32x4 = () => (a._BinaryenMulVecI32x4 = P.lj)();
    a._BinaryenMinSVecI32x4 = () => (a._BinaryenMinSVecI32x4 = P.mj)();
    a._BinaryenMinUVecI32x4 = () => (a._BinaryenMinUVecI32x4 = P.nj)();
    a._BinaryenMaxSVecI32x4 = () => (a._BinaryenMaxSVecI32x4 = P.oj)();
    a._BinaryenMaxUVecI32x4 = () => (a._BinaryenMaxUVecI32x4 = P.pj)();
    a._BinaryenDotSVecI16x8ToVecI32x4 = () =>
      (a._BinaryenDotSVecI16x8ToVecI32x4 = P.qj)();
    a._BinaryenExtMulLowSVecI32x4 = () =>
      (a._BinaryenExtMulLowSVecI32x4 = P.rj)();
    a._BinaryenExtMulHighSVecI32x4 = () =>
      (a._BinaryenExtMulHighSVecI32x4 = P.sj)();
    a._BinaryenExtMulLowUVecI32x4 = () =>
      (a._BinaryenExtMulLowUVecI32x4 = P.tj)();
    a._BinaryenExtMulHighUVecI32x4 = () =>
      (a._BinaryenExtMulHighUVecI32x4 = P.uj)();
    a._BinaryenAbsVecI64x2 = () => (a._BinaryenAbsVecI64x2 = P.vj)();
    a._BinaryenNegVecI64x2 = () => (a._BinaryenNegVecI64x2 = P.wj)();
    a._BinaryenAllTrueVecI64x2 = () => (a._BinaryenAllTrueVecI64x2 = P.xj)();
    a._BinaryenBitmaskVecI64x2 = () => (a._BinaryenBitmaskVecI64x2 = P.yj)();
    a._BinaryenShlVecI64x2 = () => (a._BinaryenShlVecI64x2 = P.zj)();
    a._BinaryenShrSVecI64x2 = () => (a._BinaryenShrSVecI64x2 = P.Aj)();
    a._BinaryenShrUVecI64x2 = () => (a._BinaryenShrUVecI64x2 = P.Bj)();
    a._BinaryenAddVecI64x2 = () => (a._BinaryenAddVecI64x2 = P.Cj)();
    a._BinaryenSubVecI64x2 = () => (a._BinaryenSubVecI64x2 = P.Dj)();
    a._BinaryenMulVecI64x2 = () => (a._BinaryenMulVecI64x2 = P.Ej)();
    a._BinaryenExtMulLowSVecI64x2 = () =>
      (a._BinaryenExtMulLowSVecI64x2 = P.Fj)();
    a._BinaryenExtMulHighSVecI64x2 = () =>
      (a._BinaryenExtMulHighSVecI64x2 = P.Gj)();
    a._BinaryenExtMulLowUVecI64x2 = () =>
      (a._BinaryenExtMulLowUVecI64x2 = P.Hj)();
    a._BinaryenExtMulHighUVecI64x2 = () =>
      (a._BinaryenExtMulHighUVecI64x2 = P.Ij)();
    a._BinaryenAbsVecF32x4 = () => (a._BinaryenAbsVecF32x4 = P.Jj)();
    a._BinaryenNegVecF32x4 = () => (a._BinaryenNegVecF32x4 = P.Kj)();
    a._BinaryenSqrtVecF32x4 = () => (a._BinaryenSqrtVecF32x4 = P.Lj)();
    a._BinaryenAddVecF32x4 = () => (a._BinaryenAddVecF32x4 = P.Mj)();
    a._BinaryenSubVecF32x4 = () => (a._BinaryenSubVecF32x4 = P.Nj)();
    a._BinaryenMulVecF32x4 = () => (a._BinaryenMulVecF32x4 = P.Oj)();
    a._BinaryenDivVecF32x4 = () => (a._BinaryenDivVecF32x4 = P.Pj)();
    a._BinaryenMinVecF32x4 = () => (a._BinaryenMinVecF32x4 = P.Qj)();
    a._BinaryenMaxVecF32x4 = () => (a._BinaryenMaxVecF32x4 = P.Rj)();
    a._BinaryenPMinVecF32x4 = () => (a._BinaryenPMinVecF32x4 = P.Sj)();
    a._BinaryenCeilVecF32x4 = () => (a._BinaryenCeilVecF32x4 = P.Tj)();
    a._BinaryenFloorVecF32x4 = () => (a._BinaryenFloorVecF32x4 = P.Uj)();
    a._BinaryenTruncVecF32x4 = () => (a._BinaryenTruncVecF32x4 = P.Vj)();
    a._BinaryenNearestVecF32x4 = () => (a._BinaryenNearestVecF32x4 = P.Wj)();
    a._BinaryenPMaxVecF32x4 = () => (a._BinaryenPMaxVecF32x4 = P.Xj)();
    a._BinaryenAbsVecF64x2 = () => (a._BinaryenAbsVecF64x2 = P.Yj)();
    a._BinaryenNegVecF64x2 = () => (a._BinaryenNegVecF64x2 = P.Zj)();
    a._BinaryenSqrtVecF64x2 = () => (a._BinaryenSqrtVecF64x2 = P._j)();
    a._BinaryenAddVecF64x2 = () => (a._BinaryenAddVecF64x2 = P.$j)();
    a._BinaryenSubVecF64x2 = () => (a._BinaryenSubVecF64x2 = P.ak)();
    a._BinaryenMulVecF64x2 = () => (a._BinaryenMulVecF64x2 = P.bk)();
    a._BinaryenDivVecF64x2 = () => (a._BinaryenDivVecF64x2 = P.ck)();
    a._BinaryenMinVecF64x2 = () => (a._BinaryenMinVecF64x2 = P.dk)();
    a._BinaryenMaxVecF64x2 = () => (a._BinaryenMaxVecF64x2 = P.ek)();
    a._BinaryenPMinVecF64x2 = () => (a._BinaryenPMinVecF64x2 = P.fk)();
    a._BinaryenPMaxVecF64x2 = () => (a._BinaryenPMaxVecF64x2 = P.gk)();
    a._BinaryenCeilVecF64x2 = () => (a._BinaryenCeilVecF64x2 = P.hk)();
    a._BinaryenFloorVecF64x2 = () => (a._BinaryenFloorVecF64x2 = P.ik)();
    a._BinaryenTruncVecF64x2 = () => (a._BinaryenTruncVecF64x2 = P.jk)();
    a._BinaryenNearestVecF64x2 = () => (a._BinaryenNearestVecF64x2 = P.kk)();
    a._BinaryenExtAddPairwiseSVecI8x16ToI16x8 = () =>
      (a._BinaryenExtAddPairwiseSVecI8x16ToI16x8 = P.lk)();
    a._BinaryenExtAddPairwiseUVecI8x16ToI16x8 = () =>
      (a._BinaryenExtAddPairwiseUVecI8x16ToI16x8 = P.mk)();
    a._BinaryenExtAddPairwiseSVecI16x8ToI32x4 = () =>
      (a._BinaryenExtAddPairwiseSVecI16x8ToI32x4 = P.nk)();
    a._BinaryenExtAddPairwiseUVecI16x8ToI32x4 = () =>
      (a._BinaryenExtAddPairwiseUVecI16x8ToI32x4 = P.ok)();
    a._BinaryenTruncSatSVecF32x4ToVecI32x4 = () =>
      (a._BinaryenTruncSatSVecF32x4ToVecI32x4 = P.pk)();
    a._BinaryenTruncSatUVecF32x4ToVecI32x4 = () =>
      (a._BinaryenTruncSatUVecF32x4ToVecI32x4 = P.qk)();
    a._BinaryenConvertSVecI32x4ToVecF32x4 = () =>
      (a._BinaryenConvertSVecI32x4ToVecF32x4 = P.rk)();
    a._BinaryenConvertUVecI32x4ToVecF32x4 = () =>
      (a._BinaryenConvertUVecI32x4ToVecF32x4 = P.sk)();
    a._BinaryenLoad8SplatVec128 = () => (a._BinaryenLoad8SplatVec128 = P.tk)();
    a._BinaryenLoad16SplatVec128 = () =>
      (a._BinaryenLoad16SplatVec128 = P.uk)();
    a._BinaryenLoad32SplatVec128 = () =>
      (a._BinaryenLoad32SplatVec128 = P.vk)();
    a._BinaryenLoad64SplatVec128 = () =>
      (a._BinaryenLoad64SplatVec128 = P.wk)();
    a._BinaryenLoad8x8SVec128 = () => (a._BinaryenLoad8x8SVec128 = P.xk)();
    a._BinaryenLoad8x8UVec128 = () => (a._BinaryenLoad8x8UVec128 = P.yk)();
    a._BinaryenLoad16x4SVec128 = () => (a._BinaryenLoad16x4SVec128 = P.zk)();
    a._BinaryenLoad16x4UVec128 = () => (a._BinaryenLoad16x4UVec128 = P.Ak)();
    a._BinaryenLoad32x2SVec128 = () => (a._BinaryenLoad32x2SVec128 = P.Bk)();
    a._BinaryenLoad32x2UVec128 = () => (a._BinaryenLoad32x2UVec128 = P.Ck)();
    a._BinaryenLoad32ZeroVec128 = () => (a._BinaryenLoad32ZeroVec128 = P.Dk)();
    a._BinaryenLoad64ZeroVec128 = () => (a._BinaryenLoad64ZeroVec128 = P.Ek)();
    a._BinaryenLoad8LaneVec128 = () => (a._BinaryenLoad8LaneVec128 = P.Fk)();
    a._BinaryenLoad16LaneVec128 = () => (a._BinaryenLoad16LaneVec128 = P.Gk)();
    a._BinaryenLoad32LaneVec128 = () => (a._BinaryenLoad32LaneVec128 = P.Hk)();
    a._BinaryenLoad64LaneVec128 = () => (a._BinaryenLoad64LaneVec128 = P.Ik)();
    a._BinaryenStore8LaneVec128 = () => (a._BinaryenStore8LaneVec128 = P.Jk)();
    a._BinaryenStore16LaneVec128 = () =>
      (a._BinaryenStore16LaneVec128 = P.Kk)();
    a._BinaryenStore32LaneVec128 = () =>
      (a._BinaryenStore32LaneVec128 = P.Lk)();
    a._BinaryenStore64LaneVec128 = () =>
      (a._BinaryenStore64LaneVec128 = P.Mk)();
    a._BinaryenNarrowSVecI16x8ToVecI8x16 = () =>
      (a._BinaryenNarrowSVecI16x8ToVecI8x16 = P.Nk)();
    a._BinaryenNarrowUVecI16x8ToVecI8x16 = () =>
      (a._BinaryenNarrowUVecI16x8ToVecI8x16 = P.Ok)();
    a._BinaryenNarrowSVecI32x4ToVecI16x8 = () =>
      (a._BinaryenNarrowSVecI32x4ToVecI16x8 = P.Pk)();
    a._BinaryenNarrowUVecI32x4ToVecI16x8 = () =>
      (a._BinaryenNarrowUVecI32x4ToVecI16x8 = P.Qk)();
    a._BinaryenExtendLowSVecI8x16ToVecI16x8 = () =>
      (a._BinaryenExtendLowSVecI8x16ToVecI16x8 = P.Rk)();
    a._BinaryenExtendHighSVecI8x16ToVecI16x8 = () =>
      (a._BinaryenExtendHighSVecI8x16ToVecI16x8 = P.Sk)();
    a._BinaryenExtendLowUVecI8x16ToVecI16x8 = () =>
      (a._BinaryenExtendLowUVecI8x16ToVecI16x8 = P.Tk)();
    a._BinaryenExtendHighUVecI8x16ToVecI16x8 = () =>
      (a._BinaryenExtendHighUVecI8x16ToVecI16x8 = P.Uk)();
    a._BinaryenExtendLowSVecI16x8ToVecI32x4 = () =>
      (a._BinaryenExtendLowSVecI16x8ToVecI32x4 = P.Vk)();
    a._BinaryenExtendHighSVecI16x8ToVecI32x4 = () =>
      (a._BinaryenExtendHighSVecI16x8ToVecI32x4 = P.Wk)();
    a._BinaryenExtendLowUVecI16x8ToVecI32x4 = () =>
      (a._BinaryenExtendLowUVecI16x8ToVecI32x4 = P.Xk)();
    a._BinaryenExtendHighUVecI16x8ToVecI32x4 = () =>
      (a._BinaryenExtendHighUVecI16x8ToVecI32x4 = P.Yk)();
    a._BinaryenExtendLowSVecI32x4ToVecI64x2 = () =>
      (a._BinaryenExtendLowSVecI32x4ToVecI64x2 = P.Zk)();
    a._BinaryenExtendHighSVecI32x4ToVecI64x2 = () =>
      (a._BinaryenExtendHighSVecI32x4ToVecI64x2 = P._k)();
    a._BinaryenExtendLowUVecI32x4ToVecI64x2 = () =>
      (a._BinaryenExtendLowUVecI32x4ToVecI64x2 = P.$k)();
    a._BinaryenExtendHighUVecI32x4ToVecI64x2 = () =>
      (a._BinaryenExtendHighUVecI32x4ToVecI64x2 = P.al)();
    a._BinaryenConvertLowSVecI32x4ToVecF64x2 = () =>
      (a._BinaryenConvertLowSVecI32x4ToVecF64x2 = P.bl)();
    a._BinaryenConvertLowUVecI32x4ToVecF64x2 = () =>
      (a._BinaryenConvertLowUVecI32x4ToVecF64x2 = P.cl)();
    a._BinaryenTruncSatZeroSVecF64x2ToVecI32x4 = () =>
      (a._BinaryenTruncSatZeroSVecF64x2ToVecI32x4 = P.dl)();
    a._BinaryenTruncSatZeroUVecF64x2ToVecI32x4 = () =>
      (a._BinaryenTruncSatZeroUVecF64x2ToVecI32x4 = P.el)();
    a._BinaryenDemoteZeroVecF64x2ToVecF32x4 = () =>
      (a._BinaryenDemoteZeroVecF64x2ToVecF32x4 = P.fl)();
    a._BinaryenPromoteLowVecF32x4ToVecF64x2 = () =>
      (a._BinaryenPromoteLowVecF32x4ToVecF64x2 = P.gl)();
    a._BinaryenRelaxedTruncSVecF32x4ToVecI32x4 = () =>
      (a._BinaryenRelaxedTruncSVecF32x4ToVecI32x4 = P.hl)();
    a._BinaryenRelaxedTruncUVecF32x4ToVecI32x4 = () =>
      (a._BinaryenRelaxedTruncUVecF32x4ToVecI32x4 = P.il)();
    a._BinaryenRelaxedTruncZeroSVecF64x2ToVecI32x4 = () =>
      (a._BinaryenRelaxedTruncZeroSVecF64x2ToVecI32x4 = P.jl)();
    a._BinaryenRelaxedTruncZeroUVecF64x2ToVecI32x4 = () =>
      (a._BinaryenRelaxedTruncZeroUVecF64x2ToVecI32x4 = P.kl)();
    a._BinaryenSwizzleVecI8x16 = () => (a._BinaryenSwizzleVecI8x16 = P.ll)();
    a._BinaryenRelaxedSwizzleVecI8x16 = () =>
      (a._BinaryenRelaxedSwizzleVecI8x16 = P.ml)();
    a._BinaryenRelaxedMinVecF32x4 = () =>
      (a._BinaryenRelaxedMinVecF32x4 = P.nl)();
    a._BinaryenRelaxedMaxVecF32x4 = () =>
      (a._BinaryenRelaxedMaxVecF32x4 = P.ol)();
    a._BinaryenRelaxedMinVecF64x2 = () =>
      (a._BinaryenRelaxedMinVecF64x2 = P.pl)();
    a._BinaryenRelaxedMaxVecF64x2 = () =>
      (a._BinaryenRelaxedMaxVecF64x2 = P.ql)();
    a._BinaryenRelaxedQ15MulrSVecI16x8 = () =>
      (a._BinaryenRelaxedQ15MulrSVecI16x8 = P.rl)();
    a._BinaryenDotI8x16I7x16SToVecI16x8 = () =>
      (a._BinaryenDotI8x16I7x16SToVecI16x8 = P.sl)();
    a._BinaryenRefAsNonNull = () => (a._BinaryenRefAsNonNull = P.tl)();
    a._BinaryenRefAsExternInternalize = () =>
      (a._BinaryenRefAsExternInternalize = P.ul)();
    a._BinaryenRefAsExternExternalize = () =>
      (a._BinaryenRefAsExternExternalize = P.vl)();
    a._BinaryenBrOnNull = () => (a._BinaryenBrOnNull = P.wl)();
    a._BinaryenBrOnNonNull = () => (a._BinaryenBrOnNonNull = P.xl)();
    a._BinaryenBrOnCast = () => (a._BinaryenBrOnCast = P.yl)();
    a._BinaryenBrOnCastFail = () => (a._BinaryenBrOnCastFail = P.zl)();
    a._BinaryenStringNewUTF8 = () => (a._BinaryenStringNewUTF8 = P.Al)();
    a._BinaryenStringNewWTF8 = () => (a._BinaryenStringNewWTF8 = P.Bl)();
    a._BinaryenStringNewLossyUTF8 = () =>
      (a._BinaryenStringNewLossyUTF8 = P.Cl)();
    a._BinaryenStringNewWTF16 = () => (a._BinaryenStringNewWTF16 = P.Dl)();
    a._BinaryenStringNewUTF8Array = () =>
      (a._BinaryenStringNewUTF8Array = P.El)();
    a._BinaryenStringNewWTF8Array = () =>
      (a._BinaryenStringNewWTF8Array = P.Fl)();
    a._BinaryenStringNewLossyUTF8Array = () =>
      (a._BinaryenStringNewLossyUTF8Array = P.Gl)();
    a._BinaryenStringNewWTF16Array = () =>
      (a._BinaryenStringNewWTF16Array = P.Hl)();
    a._BinaryenStringNewFromCodePoint = () =>
      (a._BinaryenStringNewFromCodePoint = P.Il)();
    a._BinaryenStringMeasureUTF8 = () =>
      (a._BinaryenStringMeasureUTF8 = P.Jl)();
    a._BinaryenStringMeasureWTF8 = () =>
      (a._BinaryenStringMeasureWTF8 = P.Kl)();
    a._BinaryenStringMeasureWTF16 = () =>
      (a._BinaryenStringMeasureWTF16 = P.Ll)();
    a._BinaryenStringMeasureIsUSV = () =>
      (a._BinaryenStringMeasureIsUSV = P.Ml)();
    a._BinaryenStringMeasureWTF16View = () =>
      (a._BinaryenStringMeasureWTF16View = P.Nl)();
    a._BinaryenStringEncodeUTF8 = () => (a._BinaryenStringEncodeUTF8 = P.Ol)();
    a._BinaryenStringEncodeLossyUTF8 = () =>
      (a._BinaryenStringEncodeLossyUTF8 = P.Pl)();
    a._BinaryenStringEncodeWTF8 = () => (a._BinaryenStringEncodeWTF8 = P.Ql)();
    a._BinaryenStringEncodeWTF16 = () =>
      (a._BinaryenStringEncodeWTF16 = P.Rl)();
    a._BinaryenStringEncodeUTF8Array = () =>
      (a._BinaryenStringEncodeUTF8Array = P.Sl)();
    a._BinaryenStringEncodeLossyUTF8Array = () =>
      (a._BinaryenStringEncodeLossyUTF8Array = P.Tl)();
    a._BinaryenStringEncodeWTF8Array = () =>
      (a._BinaryenStringEncodeWTF8Array = P.Ul)();
    a._BinaryenStringEncodeWTF16Array = () =>
      (a._BinaryenStringEncodeWTF16Array = P.Vl)();
    a._BinaryenStringAsWTF8 = () => (a._BinaryenStringAsWTF8 = P.Wl)();
    a._BinaryenStringAsWTF16 = () => (a._BinaryenStringAsWTF16 = P.Xl)();
    a._BinaryenStringAsIter = () => (a._BinaryenStringAsIter = P.Yl)();
    a._BinaryenStringIterMoveAdvance = () =>
      (a._BinaryenStringIterMoveAdvance = P.Zl)();
    a._BinaryenStringIterMoveRewind = () =>
      (a._BinaryenStringIterMoveRewind = P._l)();
    a._BinaryenStringSliceWTF8 = () => (a._BinaryenStringSliceWTF8 = P.$l)();
    a._BinaryenStringSliceWTF16 = () => (a._BinaryenStringSliceWTF16 = P.am)();
    a._BinaryenStringEqEqual = () => (a._BinaryenStringEqEqual = P.bm)();
    a._BinaryenStringEqCompare = () => (a._BinaryenStringEqCompare = P.cm)();
    a._BinaryenBlock = (b, c, g, d, f) =>
      (a._BinaryenBlock = P.dm)(b, c, g, d, f);
    a._BinaryenIf = (b, c, g, d) => (a._BinaryenIf = P.em)(b, c, g, d);
    a._BinaryenLoop = (b, c, g) => (a._BinaryenLoop = P.fm)(b, c, g);
    a._BinaryenBreak = (b, c, g, d) => (a._BinaryenBreak = P.gm)(b, c, g, d);
    a._BinaryenSwitch = (b, c, g, d, f, h) =>
      (a._BinaryenSwitch = P.hm)(b, c, g, d, f, h);
    a._BinaryenCall = (b, c, g, d, f) =>
      (a._BinaryenCall = P.im)(b, c, g, d, f);
    a._BinaryenReturnCall = (b, c, g, d, f) =>
      (a._BinaryenReturnCall = P.jm)(b, c, g, d, f);
    a._BinaryenCallIndirect = (b, c, g, d, f, h, k) =>
      (a._BinaryenCallIndirect = P.km)(b, c, g, d, f, h, k);
    a._BinaryenReturnCallIndirect = (b, c, g, d, f, h, k) =>
      (a._BinaryenReturnCallIndirect = P.lm)(b, c, g, d, f, h, k);
    a._BinaryenLocalGet = (b, c, g) => (a._BinaryenLocalGet = P.mm)(b, c, g);
    a._BinaryenLocalSet = (b, c, g) => (a._BinaryenLocalSet = P.nm)(b, c, g);
    a._BinaryenLocalTee = (b, c, g, d) =>
      (a._BinaryenLocalTee = P.om)(b, c, g, d);
    a._BinaryenGlobalGet = (b, c, g) => (a._BinaryenGlobalGet = P.pm)(b, c, g);
    a._BinaryenGlobalSet = (b, c, g) => (a._BinaryenGlobalSet = P.qm)(b, c, g);
    a._BinaryenLoad = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenLoad = P.rm)(b, c, g, d, f, h, k, l);
    a._BinaryenStore = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenStore = P.sm)(b, c, g, d, f, h, k, l);
    a._BinaryenConst = (b, c) => (a._BinaryenConst = P.tm)(b, c);
    a._BinaryenUnary = (b, c, g) => (a._BinaryenUnary = P.um)(b, c, g);
    a._BinaryenBinary = (b, c, g, d) => (a._BinaryenBinary = P.vm)(b, c, g, d);
    a._BinaryenSelect = (b, c, g, d, f) =>
      (a._BinaryenSelect = P.wm)(b, c, g, d, f);
    a._BinaryenDrop = (b, c) => (a._BinaryenDrop = P.xm)(b, c);
    a._BinaryenReturn = (b, c) => (a._BinaryenReturn = P.ym)(b, c);
    a._BinaryenMemorySize = (b, c, g) =>
      (a._BinaryenMemorySize = P.zm)(b, c, g);
    a._BinaryenMemoryGrow = (b, c, g, d) =>
      (a._BinaryenMemoryGrow = P.Am)(b, c, g, d);
    a._BinaryenNop = (b) => (a._BinaryenNop = P.Bm)(b);
    a._BinaryenUnreachable = (b) => (a._BinaryenUnreachable = P.Cm)(b);
    a._BinaryenAtomicLoad = (b, c, g, d, f, h) =>
      (a._BinaryenAtomicLoad = P.Dm)(b, c, g, d, f, h);
    a._BinaryenAtomicStore = (b, c, g, d, f, h, k) =>
      (a._BinaryenAtomicStore = P.Em)(b, c, g, d, f, h, k);
    a._BinaryenAtomicRMW = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenAtomicRMW = P.Fm)(b, c, g, d, f, h, k, l);
    a._BinaryenAtomicCmpxchg = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenAtomicCmpxchg = P.Gm)(b, c, g, d, f, h, k, l);
    a._BinaryenAtomicWait = (b, c, g, d, f, h) =>
      (a._BinaryenAtomicWait = P.Hm)(b, c, g, d, f, h);
    a._BinaryenAtomicNotify = (b, c, g, d) =>
      (a._BinaryenAtomicNotify = P.Im)(b, c, g, d);
    a._BinaryenAtomicFence = (b) => (a._BinaryenAtomicFence = P.Jm)(b);
    a._BinaryenSIMDExtract = (b, c, g, d) =>
      (a._BinaryenSIMDExtract = P.Km)(b, c, g, d);
    a._BinaryenSIMDReplace = (b, c, g, d, f) =>
      (a._BinaryenSIMDReplace = P.Lm)(b, c, g, d, f);
    a._BinaryenSIMDShuffle = (b, c, g, d) =>
      (a._BinaryenSIMDShuffle = P.Mm)(b, c, g, d);
    a._BinaryenSIMDTernary = (b, c, g, d, f) =>
      (a._BinaryenSIMDTernary = P.Nm)(b, c, g, d, f);
    a._BinaryenSIMDShift = (b, c, g, d) =>
      (a._BinaryenSIMDShift = P.Om)(b, c, g, d);
    a._BinaryenSIMDLoad = (b, c, g, d, f, h) =>
      (a._BinaryenSIMDLoad = P.Pm)(b, c, g, d, f, h);
    a._BinaryenSIMDLoadStoreLane = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenSIMDLoadStoreLane = P.Qm)(b, c, g, d, f, h, k, l);
    a._BinaryenMemoryInit = (b, c, g, d, f, h) =>
      (a._BinaryenMemoryInit = P.Rm)(b, c, g, d, f, h);
    a._BinaryenDataDrop = (b, c) => (a._BinaryenDataDrop = P.Sm)(b, c);
    a._BinaryenMemoryCopy = (b, c, g, d, f, h) =>
      (a._BinaryenMemoryCopy = P.Tm)(b, c, g, d, f, h);
    a._BinaryenMemoryFill = (b, c, g, d, f) =>
      (a._BinaryenMemoryFill = P.Um)(b, c, g, d, f);
    a._BinaryenTupleMake = (b, c, g) => (a._BinaryenTupleMake = P.Vm)(b, c, g);
    a._BinaryenTupleExtract = (b, c, g) =>
      (a._BinaryenTupleExtract = P.Wm)(b, c, g);
    a._BinaryenPop = (b, c) => (a._BinaryenPop = P.Xm)(b, c);
    a._BinaryenRefNull = (b, c) => (a._BinaryenRefNull = P.Ym)(b, c);
    a._BinaryenRefIsNull = (b, c) => (a._BinaryenRefIsNull = P.Zm)(b, c);
    a._BinaryenRefAs = (b, c, g) => (a._BinaryenRefAs = P._m)(b, c, g);
    a._BinaryenRefFunc = (b, c, g) => (a._BinaryenRefFunc = P.$m)(b, c, g);
    a._BinaryenRefEq = (b, c, g) => (a._BinaryenRefEq = P.an)(b, c, g);
    a._BinaryenTableGet = (b, c, g, d) =>
      (a._BinaryenTableGet = P.bn)(b, c, g, d);
    a._BinaryenTableSet = (b, c, g, d) =>
      (a._BinaryenTableSet = P.cn)(b, c, g, d);
    a._BinaryenTableSize = (b, c) => (a._BinaryenTableSize = P.dn)(b, c);
    a._BinaryenTableGrow = (b, c, g, d) =>
      (a._BinaryenTableGrow = P.en)(b, c, g, d);
    a._BinaryenTry = (b, c, g, d, f, h, k, l) =>
      (a._BinaryenTry = P.fn)(b, c, g, d, f, h, k, l);
    a._BinaryenThrow = (b, c, g, d) => (a._BinaryenThrow = P.gn)(b, c, g, d);
    a._BinaryenRethrow = (b, c) => (a._BinaryenRethrow = P.hn)(b, c);
    a._BinaryenRefI31 = (b, c) => (a._BinaryenRefI31 = P.jn)(b, c);
    a._BinaryenI31Get = (b, c, g) => (a._BinaryenI31Get = P.kn)(b, c, g);
    a._BinaryenCallRef = (b, c, g, d, f, h) =>
      (a._BinaryenCallRef = P.ln)(b, c, g, d, f, h);
    a._BinaryenRefTest = (b, c, g) => (a._BinaryenRefTest = P.mn)(b, c, g);
    a._BinaryenRefCast = (b, c, g) => (a._BinaryenRefCast = P.nn)(b, c, g);
    a._BinaryenBrOn = (b, c, g, d, f) =>
      (a._BinaryenBrOn = P.on)(b, c, g, d, f);
    a._BinaryenStructNew = (b, c, g, d) =>
      (a._BinaryenStructNew = P.pn)(b, c, g, d);
    a._BinaryenStructGet = (b, c, g, d, f) =>
      (a._BinaryenStructGet = P.qn)(b, c, g, d, f);
    a._BinaryenStructSet = (b, c, g, d) =>
      (a._BinaryenStructSet = P.rn)(b, c, g, d);
    a._BinaryenArrayNew = (b, c, g, d) =>
      (a._BinaryenArrayNew = P.sn)(b, c, g, d);
    a._BinaryenArrayNewFixed = (b, c, g, d) =>
      (a._BinaryenArrayNewFixed = P.tn)(b, c, g, d);
    a._BinaryenArrayGet = (b, c, g, d, f) =>
      (a._BinaryenArrayGet = P.un)(b, c, g, d, f);
    a._BinaryenArraySet = (b, c, g, d) =>
      (a._BinaryenArraySet = P.vn)(b, c, g, d);
    a._BinaryenArrayLen = (b, c) => (a._BinaryenArrayLen = P.wn)(b, c);
    a._BinaryenArrayCopy = (b, c, g, d, f, h) =>
      (a._BinaryenArrayCopy = P.xn)(b, c, g, d, f, h);
    a._BinaryenStringNew = (b, c, g, d, f, h, k) =>
      (a._BinaryenStringNew = P.yn)(b, c, g, d, f, h, k);
    a._BinaryenStringConst = (b, c) => (a._BinaryenStringConst = P.zn)(b, c);
    a._BinaryenStringMeasure = (b, c, g) =>
      (a._BinaryenStringMeasure = P.An)(b, c, g);
    a._BinaryenStringEncode = (b, c, g, d, f) =>
      (a._BinaryenStringEncode = P.Bn)(b, c, g, d, f);
    a._BinaryenStringConcat = (b, c, g) =>
      (a._BinaryenStringConcat = P.Cn)(b, c, g);
    a._BinaryenStringEq = (b, c, g, d) =>
      (a._BinaryenStringEq = P.Dn)(b, c, g, d);
    a._BinaryenStringAs = (b, c, g) => (a._BinaryenStringAs = P.En)(b, c, g);
    a._BinaryenStringWTF8Advance = (b, c, g, d) =>
      (a._BinaryenStringWTF8Advance = P.Fn)(b, c, g, d);
    a._BinaryenStringWTF16Get = (b, c, g) =>
      (a._BinaryenStringWTF16Get = P.Gn)(b, c, g);
    a._BinaryenStringIterNext = (b, c) =>
      (a._BinaryenStringIterNext = P.Hn)(b, c);
    a._BinaryenStringIterMove = (b, c, g, d) =>
      (a._BinaryenStringIterMove = P.In)(b, c, g, d);
    a._BinaryenStringSliceWTF = (b, c, g, d, f) =>
      (a._BinaryenStringSliceWTF = P.Jn)(b, c, g, d, f);
    a._BinaryenStringSliceIter = (b, c, g) =>
      (a._BinaryenStringSliceIter = P.Kn)(b, c, g);
    a._BinaryenExpressionGetId = (b) => (a._BinaryenExpressionGetId = P.Ln)(b);
    a._BinaryenExpressionGetType = (b) =>
      (a._BinaryenExpressionGetType = P.Mn)(b);
    a._BinaryenExpressionSetType = (b, c) =>
      (a._BinaryenExpressionSetType = P.Nn)(b, c);
    a._BinaryenExpressionPrint = (b) => (a._BinaryenExpressionPrint = P.On)(b);
    a._BinaryenExpressionFinalize = (b) =>
      (a._BinaryenExpressionFinalize = P.Pn)(b);
    a._BinaryenExpressionCopy = (b, c) =>
      (a._BinaryenExpressionCopy = P.Qn)(b, c);
    a._BinaryenBlockGetName = (b) => (a._BinaryenBlockGetName = P.Rn)(b);
    a._BinaryenBlockSetName = (b, c) => (a._BinaryenBlockSetName = P.Sn)(b, c);
    a._BinaryenBlockGetNumChildren = (b) =>
      (a._BinaryenBlockGetNumChildren = P.Tn)(b);
    a._BinaryenBlockGetChildAt = (b, c) =>
      (a._BinaryenBlockGetChildAt = P.Un)(b, c);
    a._BinaryenBlockSetChildAt = (b, c, g) =>
      (a._BinaryenBlockSetChildAt = P.Vn)(b, c, g);
    a._BinaryenBlockAppendChild = (b, c) =>
      (a._BinaryenBlockAppendChild = P.Wn)(b, c);
    a._BinaryenBlockInsertChildAt = (b, c, g) =>
      (a._BinaryenBlockInsertChildAt = P.Xn)(b, c, g);
    a._BinaryenBlockRemoveChildAt = (b, c) =>
      (a._BinaryenBlockRemoveChildAt = P.Yn)(b, c);
    a._BinaryenIfGetCondition = (b) => (a._BinaryenIfGetCondition = P.Zn)(b);
    a._BinaryenIfSetCondition = (b, c) =>
      (a._BinaryenIfSetCondition = P._n)(b, c);
    a._BinaryenIfGetIfTrue = (b) => (a._BinaryenIfGetIfTrue = P.$n)(b);
    a._BinaryenIfSetIfTrue = (b, c) => (a._BinaryenIfSetIfTrue = P.ao)(b, c);
    a._BinaryenIfGetIfFalse = (b) => (a._BinaryenIfGetIfFalse = P.bo)(b);
    a._BinaryenIfSetIfFalse = (b, c) => (a._BinaryenIfSetIfFalse = P.co)(b, c);
    a._BinaryenLoopGetName = (b) => (a._BinaryenLoopGetName = P.eo)(b);
    a._BinaryenLoopSetName = (b, c) => (a._BinaryenLoopSetName = P.fo)(b, c);
    a._BinaryenLoopGetBody = (b) => (a._BinaryenLoopGetBody = P.go)(b);
    a._BinaryenLoopSetBody = (b, c) => (a._BinaryenLoopSetBody = P.ho)(b, c);
    a._BinaryenBreakGetName = (b) => (a._BinaryenBreakGetName = P.io)(b);
    a._BinaryenBreakSetName = (b, c) => (a._BinaryenBreakSetName = P.jo)(b, c);
    a._BinaryenBreakGetCondition = (b) =>
      (a._BinaryenBreakGetCondition = P.ko)(b);
    a._BinaryenBreakSetCondition = (b, c) =>
      (a._BinaryenBreakSetCondition = P.lo)(b, c);
    a._BinaryenBreakGetValue = (b) => (a._BinaryenBreakGetValue = P.mo)(b);
    a._BinaryenBreakSetValue = (b, c) =>
      (a._BinaryenBreakSetValue = P.no)(b, c);
    a._BinaryenSwitchGetNumNames = (b) =>
      (a._BinaryenSwitchGetNumNames = P.oo)(b);
    a._BinaryenSwitchGetNameAt = (b, c) =>
      (a._BinaryenSwitchGetNameAt = P.po)(b, c);
    a._BinaryenSwitchSetNameAt = (b, c, g) =>
      (a._BinaryenSwitchSetNameAt = P.qo)(b, c, g);
    a._BinaryenSwitchAppendName = (b, c) =>
      (a._BinaryenSwitchAppendName = P.ro)(b, c);
    a._BinaryenSwitchInsertNameAt = (b, c, g) =>
      (a._BinaryenSwitchInsertNameAt = P.so)(b, c, g);
    a._BinaryenSwitchRemoveNameAt = (b, c) =>
      (a._BinaryenSwitchRemoveNameAt = P.to)(b, c);
    a._BinaryenSwitchGetDefaultName = (b) =>
      (a._BinaryenSwitchGetDefaultName = P.uo)(b);
    a._BinaryenSwitchSetDefaultName = (b, c) =>
      (a._BinaryenSwitchSetDefaultName = P.vo)(b, c);
    a._BinaryenSwitchGetCondition = (b) =>
      (a._BinaryenSwitchGetCondition = P.wo)(b);
    a._BinaryenSwitchSetCondition = (b, c) =>
      (a._BinaryenSwitchSetCondition = P.xo)(b, c);
    a._BinaryenSwitchGetValue = (b) => (a._BinaryenSwitchGetValue = P.yo)(b);
    a._BinaryenSwitchSetValue = (b, c) =>
      (a._BinaryenSwitchSetValue = P.zo)(b, c);
    a._BinaryenCallGetTarget = (b) => (a._BinaryenCallGetTarget = P.Ao)(b);
    a._BinaryenCallSetTarget = (b, c) =>
      (a._BinaryenCallSetTarget = P.Bo)(b, c);
    a._BinaryenCallGetNumOperands = (b) =>
      (a._BinaryenCallGetNumOperands = P.Co)(b);
    a._BinaryenCallGetOperandAt = (b, c) =>
      (a._BinaryenCallGetOperandAt = P.Do)(b, c);
    a._BinaryenCallSetOperandAt = (b, c, g) =>
      (a._BinaryenCallSetOperandAt = P.Eo)(b, c, g);
    a._BinaryenCallAppendOperand = (b, c) =>
      (a._BinaryenCallAppendOperand = P.Fo)(b, c);
    a._BinaryenCallInsertOperandAt = (b, c, g) =>
      (a._BinaryenCallInsertOperandAt = P.Go)(b, c, g);
    a._BinaryenCallRemoveOperandAt = (b, c) =>
      (a._BinaryenCallRemoveOperandAt = P.Ho)(b, c);
    a._BinaryenCallIsReturn = (b) => (a._BinaryenCallIsReturn = P.Io)(b);
    a._BinaryenCallSetReturn = (b, c) =>
      (a._BinaryenCallSetReturn = P.Jo)(b, c);
    a._BinaryenCallIndirectGetTarget = (b) =>
      (a._BinaryenCallIndirectGetTarget = P.Ko)(b);
    a._BinaryenCallIndirectSetTarget = (b, c) =>
      (a._BinaryenCallIndirectSetTarget = P.Lo)(b, c);
    a._BinaryenCallIndirectGetTable = (b) =>
      (a._BinaryenCallIndirectGetTable = P.Mo)(b);
    a._BinaryenCallIndirectSetTable = (b, c) =>
      (a._BinaryenCallIndirectSetTable = P.No)(b, c);
    a._BinaryenCallIndirectGetNumOperands = (b) =>
      (a._BinaryenCallIndirectGetNumOperands = P.Oo)(b);
    a._BinaryenCallIndirectGetOperandAt = (b, c) =>
      (a._BinaryenCallIndirectGetOperandAt = P.Po)(b, c);
    a._BinaryenCallIndirectSetOperandAt = (b, c, g) =>
      (a._BinaryenCallIndirectSetOperandAt = P.Qo)(b, c, g);
    a._BinaryenCallIndirectAppendOperand = (b, c) =>
      (a._BinaryenCallIndirectAppendOperand = P.Ro)(b, c);
    a._BinaryenCallIndirectInsertOperandAt = (b, c, g) =>
      (a._BinaryenCallIndirectInsertOperandAt = P.So)(b, c, g);
    a._BinaryenCallIndirectRemoveOperandAt = (b, c) =>
      (a._BinaryenCallIndirectRemoveOperandAt = P.To)(b, c);
    a._BinaryenCallIndirectIsReturn = (b) =>
      (a._BinaryenCallIndirectIsReturn = P.Uo)(b);
    a._BinaryenCallIndirectSetReturn = (b, c) =>
      (a._BinaryenCallIndirectSetReturn = P.Vo)(b, c);
    a._BinaryenCallIndirectGetParams = (b) =>
      (a._BinaryenCallIndirectGetParams = P.Wo)(b);
    a._BinaryenCallIndirectSetParams = (b, c) =>
      (a._BinaryenCallIndirectSetParams = P.Xo)(b, c);
    a._BinaryenCallIndirectGetResults = (b) =>
      (a._BinaryenCallIndirectGetResults = P.Yo)(b);
    a._BinaryenCallIndirectSetResults = (b, c) =>
      (a._BinaryenCallIndirectSetResults = P.Zo)(b, c);
    a._BinaryenLocalGetGetIndex = (b) =>
      (a._BinaryenLocalGetGetIndex = P._o)(b);
    a._BinaryenLocalGetSetIndex = (b, c) =>
      (a._BinaryenLocalGetSetIndex = P.$o)(b, c);
    a._BinaryenLocalSetIsTee = (b) => (a._BinaryenLocalSetIsTee = P.ap)(b);
    a._BinaryenLocalSetGetIndex = (b) =>
      (a._BinaryenLocalSetGetIndex = P.bp)(b);
    a._BinaryenLocalSetSetIndex = (b, c) =>
      (a._BinaryenLocalSetSetIndex = P.cp)(b, c);
    a._BinaryenLocalSetGetValue = (b) =>
      (a._BinaryenLocalSetGetValue = P.dp)(b);
    a._BinaryenLocalSetSetValue = (b, c) =>
      (a._BinaryenLocalSetSetValue = P.ep)(b, c);
    a._BinaryenGlobalGetGetName = (b) =>
      (a._BinaryenGlobalGetGetName = P.fp)(b);
    a._BinaryenGlobalGetSetName = (b, c) =>
      (a._BinaryenGlobalGetSetName = P.gp)(b, c);
    a._BinaryenGlobalSetGetName = (b) =>
      (a._BinaryenGlobalSetGetName = P.hp)(b);
    a._BinaryenGlobalSetSetName = (b, c) =>
      (a._BinaryenGlobalSetSetName = P.ip)(b, c);
    a._BinaryenGlobalSetGetValue = (b) =>
      (a._BinaryenGlobalSetGetValue = P.jp)(b);
    a._BinaryenGlobalSetSetValue = (b, c) =>
      (a._BinaryenGlobalSetSetValue = P.kp)(b, c);
    a._BinaryenTableGetGetTable = (b) =>
      (a._BinaryenTableGetGetTable = P.lp)(b);
    a._BinaryenTableGetSetTable = (b, c) =>
      (a._BinaryenTableGetSetTable = P.mp)(b, c);
    a._BinaryenTableGetGetIndex = (b) =>
      (a._BinaryenTableGetGetIndex = P.np)(b);
    a._BinaryenTableGetSetIndex = (b, c) =>
      (a._BinaryenTableGetSetIndex = P.op)(b, c);
    a._BinaryenTableSetGetTable = (b) =>
      (a._BinaryenTableSetGetTable = P.pp)(b);
    a._BinaryenTableSetSetTable = (b, c) =>
      (a._BinaryenTableSetSetTable = P.qp)(b, c);
    a._BinaryenTableSetGetIndex = (b) =>
      (a._BinaryenTableSetGetIndex = P.rp)(b);
    a._BinaryenTableSetSetIndex = (b, c) =>
      (a._BinaryenTableSetSetIndex = P.sp)(b, c);
    a._BinaryenTableSetGetValue = (b) =>
      (a._BinaryenTableSetGetValue = P.tp)(b);
    a._BinaryenTableSetSetValue = (b, c) =>
      (a._BinaryenTableSetSetValue = P.up)(b, c);
    a._BinaryenTableSizeGetTable = (b) =>
      (a._BinaryenTableSizeGetTable = P.vp)(b);
    a._BinaryenTableSizeSetTable = (b, c) =>
      (a._BinaryenTableSizeSetTable = P.wp)(b, c);
    a._BinaryenTableGrowGetTable = (b) =>
      (a._BinaryenTableGrowGetTable = P.xp)(b);
    a._BinaryenTableGrowSetTable = (b, c) =>
      (a._BinaryenTableGrowSetTable = P.yp)(b, c);
    a._BinaryenTableGrowGetValue = (b) =>
      (a._BinaryenTableGrowGetValue = P.zp)(b);
    a._BinaryenTableGrowSetValue = (b, c) =>
      (a._BinaryenTableGrowSetValue = P.Ap)(b, c);
    a._BinaryenTableGrowGetDelta = (b) =>
      (a._BinaryenTableGrowGetDelta = P.Bp)(b);
    a._BinaryenTableGrowSetDelta = (b, c) =>
      (a._BinaryenTableGrowSetDelta = P.Cp)(b, c);
    a._BinaryenMemoryGrowGetDelta = (b) =>
      (a._BinaryenMemoryGrowGetDelta = P.Dp)(b);
    a._BinaryenMemoryGrowSetDelta = (b, c) =>
      (a._BinaryenMemoryGrowSetDelta = P.Ep)(b, c);
    a._BinaryenLoadIsAtomic = (b) => (a._BinaryenLoadIsAtomic = P.Fp)(b);
    a._BinaryenLoadSetAtomic = (b, c) =>
      (a._BinaryenLoadSetAtomic = P.Gp)(b, c);
    a._BinaryenLoadIsSigned = (b) => (a._BinaryenLoadIsSigned = P.Hp)(b);
    a._BinaryenLoadSetSigned = (b, c) =>
      (a._BinaryenLoadSetSigned = P.Ip)(b, c);
    a._BinaryenLoadGetBytes = (b) => (a._BinaryenLoadGetBytes = P.Jp)(b);
    a._BinaryenLoadSetBytes = (b, c) => (a._BinaryenLoadSetBytes = P.Kp)(b, c);
    a._BinaryenLoadGetOffset = (b) => (a._BinaryenLoadGetOffset = P.Lp)(b);
    a._BinaryenLoadSetOffset = (b, c) =>
      (a._BinaryenLoadSetOffset = P.Mp)(b, c);
    a._BinaryenLoadGetAlign = (b) => (a._BinaryenLoadGetAlign = P.Np)(b);
    a._BinaryenLoadSetAlign = (b, c) => (a._BinaryenLoadSetAlign = P.Op)(b, c);
    a._BinaryenLoadGetPtr = (b) => (a._BinaryenLoadGetPtr = P.Pp)(b);
    a._BinaryenLoadSetPtr = (b, c) => (a._BinaryenLoadSetPtr = P.Qp)(b, c);
    a._BinaryenStoreIsAtomic = (b) => (a._BinaryenStoreIsAtomic = P.Rp)(b);
    a._BinaryenStoreSetAtomic = (b, c) =>
      (a._BinaryenStoreSetAtomic = P.Sp)(b, c);
    a._BinaryenStoreGetBytes = (b) => (a._BinaryenStoreGetBytes = P.Tp)(b);
    a._BinaryenStoreSetBytes = (b, c) =>
      (a._BinaryenStoreSetBytes = P.Up)(b, c);
    a._BinaryenStoreGetOffset = (b) => (a._BinaryenStoreGetOffset = P.Vp)(b);
    a._BinaryenStoreSetOffset = (b, c) =>
      (a._BinaryenStoreSetOffset = P.Wp)(b, c);
    a._BinaryenStoreGetAlign = (b) => (a._BinaryenStoreGetAlign = P.Xp)(b);
    a._BinaryenStoreSetAlign = (b, c) =>
      (a._BinaryenStoreSetAlign = P.Yp)(b, c);
    a._BinaryenStoreGetPtr = (b) => (a._BinaryenStoreGetPtr = P.Zp)(b);
    a._BinaryenStoreSetPtr = (b, c) => (a._BinaryenStoreSetPtr = P._p)(b, c);
    a._BinaryenStoreGetValue = (b) => (a._BinaryenStoreGetValue = P.$p)(b);
    a._BinaryenStoreSetValue = (b, c) =>
      (a._BinaryenStoreSetValue = P.aq)(b, c);
    a._BinaryenStoreGetValueType = (b) =>
      (a._BinaryenStoreGetValueType = P.bq)(b);
    a._BinaryenStoreSetValueType = (b, c) =>
      (a._BinaryenStoreSetValueType = P.cq)(b, c);
    a._BinaryenConstGetValueI32 = (b) =>
      (a._BinaryenConstGetValueI32 = P.dq)(b);
    a._BinaryenConstSetValueI32 = (b, c) =>
      (a._BinaryenConstSetValueI32 = P.eq)(b, c);
    a._BinaryenConstGetValueI64 = (b) =>
      (a._BinaryenConstGetValueI64 = P.fq)(b);
    a._BinaryenConstSetValueI64 = (b, c, g) =>
      (a._BinaryenConstSetValueI64 = P.gq)(b, c, g);
    a._BinaryenConstGetValueI64Low = (b) =>
      (a._BinaryenConstGetValueI64Low = P.hq)(b);
    a._BinaryenConstSetValueI64Low = (b, c) =>
      (a._BinaryenConstSetValueI64Low = P.iq)(b, c);
    a._BinaryenConstGetValueI64High = (b) =>
      (a._BinaryenConstGetValueI64High = P.jq)(b);
    a._BinaryenConstSetValueI64High = (b, c) =>
      (a._BinaryenConstSetValueI64High = P.kq)(b, c);
    a._BinaryenConstGetValueF32 = (b) =>
      (a._BinaryenConstGetValueF32 = P.lq)(b);
    a._BinaryenConstSetValueF32 = (b, c) =>
      (a._BinaryenConstSetValueF32 = P.mq)(b, c);
    a._BinaryenConstGetValueF64 = (b) =>
      (a._BinaryenConstGetValueF64 = P.nq)(b);
    a._BinaryenConstSetValueF64 = (b, c) =>
      (a._BinaryenConstSetValueF64 = P.oq)(b, c);
    a._BinaryenConstGetValueV128 = (b, c) =>
      (a._BinaryenConstGetValueV128 = P.pq)(b, c);
    a._BinaryenConstSetValueV128 = (b, c) =>
      (a._BinaryenConstSetValueV128 = P.qq)(b, c);
    a._BinaryenUnaryGetOp = (b) => (a._BinaryenUnaryGetOp = P.rq)(b);
    a._BinaryenUnarySetOp = (b, c) => (a._BinaryenUnarySetOp = P.sq)(b, c);
    a._BinaryenUnaryGetValue = (b) => (a._BinaryenUnaryGetValue = P.tq)(b);
    a._BinaryenUnarySetValue = (b, c) =>
      (a._BinaryenUnarySetValue = P.uq)(b, c);
    a._BinaryenBinaryGetOp = (b) => (a._BinaryenBinaryGetOp = P.vq)(b);
    a._BinaryenBinarySetOp = (b, c) => (a._BinaryenBinarySetOp = P.wq)(b, c);
    a._BinaryenBinaryGetLeft = (b) => (a._BinaryenBinaryGetLeft = P.xq)(b);
    a._BinaryenBinarySetLeft = (b, c) =>
      (a._BinaryenBinarySetLeft = P.yq)(b, c);
    a._BinaryenBinaryGetRight = (b) => (a._BinaryenBinaryGetRight = P.zq)(b);
    a._BinaryenBinarySetRight = (b, c) =>
      (a._BinaryenBinarySetRight = P.Aq)(b, c);
    a._BinaryenSelectGetIfTrue = (b) => (a._BinaryenSelectGetIfTrue = P.Bq)(b);
    a._BinaryenSelectSetIfTrue = (b, c) =>
      (a._BinaryenSelectSetIfTrue = P.Cq)(b, c);
    a._BinaryenSelectGetIfFalse = (b) =>
      (a._BinaryenSelectGetIfFalse = P.Dq)(b);
    a._BinaryenSelectSetIfFalse = (b, c) =>
      (a._BinaryenSelectSetIfFalse = P.Eq)(b, c);
    a._BinaryenSelectGetCondition = (b) =>
      (a._BinaryenSelectGetCondition = P.Fq)(b);
    a._BinaryenSelectSetCondition = (b, c) =>
      (a._BinaryenSelectSetCondition = P.Gq)(b, c);
    a._BinaryenDropGetValue = (b) => (a._BinaryenDropGetValue = P.Hq)(b);
    a._BinaryenDropSetValue = (b, c) => (a._BinaryenDropSetValue = P.Iq)(b, c);
    a._BinaryenReturnGetValue = (b) => (a._BinaryenReturnGetValue = P.Jq)(b);
    a._BinaryenReturnSetValue = (b, c) =>
      (a._BinaryenReturnSetValue = P.Kq)(b, c);
    a._BinaryenAtomicRMWGetOp = (b) => (a._BinaryenAtomicRMWGetOp = P.Lq)(b);
    a._BinaryenAtomicRMWSetOp = (b, c) =>
      (a._BinaryenAtomicRMWSetOp = P.Mq)(b, c);
    a._BinaryenAtomicRMWGetBytes = (b) =>
      (a._BinaryenAtomicRMWGetBytes = P.Nq)(b);
    a._BinaryenAtomicRMWSetBytes = (b, c) =>
      (a._BinaryenAtomicRMWSetBytes = P.Oq)(b, c);
    a._BinaryenAtomicRMWGetOffset = (b) =>
      (a._BinaryenAtomicRMWGetOffset = P.Pq)(b);
    a._BinaryenAtomicRMWSetOffset = (b, c) =>
      (a._BinaryenAtomicRMWSetOffset = P.Qq)(b, c);
    a._BinaryenAtomicRMWGetPtr = (b) => (a._BinaryenAtomicRMWGetPtr = P.Rq)(b);
    a._BinaryenAtomicRMWSetPtr = (b, c) =>
      (a._BinaryenAtomicRMWSetPtr = P.Sq)(b, c);
    a._BinaryenAtomicRMWGetValue = (b) =>
      (a._BinaryenAtomicRMWGetValue = P.Tq)(b);
    a._BinaryenAtomicRMWSetValue = (b, c) =>
      (a._BinaryenAtomicRMWSetValue = P.Uq)(b, c);
    a._BinaryenAtomicCmpxchgGetBytes = (b) =>
      (a._BinaryenAtomicCmpxchgGetBytes = P.Vq)(b);
    a._BinaryenAtomicCmpxchgSetBytes = (b, c) =>
      (a._BinaryenAtomicCmpxchgSetBytes = P.Wq)(b, c);
    a._BinaryenAtomicCmpxchgGetOffset = (b) =>
      (a._BinaryenAtomicCmpxchgGetOffset = P.Xq)(b);
    a._BinaryenAtomicCmpxchgSetOffset = (b, c) =>
      (a._BinaryenAtomicCmpxchgSetOffset = P.Yq)(b, c);
    a._BinaryenAtomicCmpxchgGetPtr = (b) =>
      (a._BinaryenAtomicCmpxchgGetPtr = P.Zq)(b);
    a._BinaryenAtomicCmpxchgSetPtr = (b, c) =>
      (a._BinaryenAtomicCmpxchgSetPtr = P._q)(b, c);
    a._BinaryenAtomicCmpxchgGetExpected = (b) =>
      (a._BinaryenAtomicCmpxchgGetExpected = P.$q)(b);
    a._BinaryenAtomicCmpxchgSetExpected = (b, c) =>
      (a._BinaryenAtomicCmpxchgSetExpected = P.ar)(b, c);
    a._BinaryenAtomicCmpxchgGetReplacement = (b) =>
      (a._BinaryenAtomicCmpxchgGetReplacement = P.br)(b);
    a._BinaryenAtomicCmpxchgSetReplacement = (b, c) =>
      (a._BinaryenAtomicCmpxchgSetReplacement = P.cr)(b, c);
    a._BinaryenAtomicWaitGetPtr = (b) =>
      (a._BinaryenAtomicWaitGetPtr = P.dr)(b);
    a._BinaryenAtomicWaitSetPtr = (b, c) =>
      (a._BinaryenAtomicWaitSetPtr = P.er)(b, c);
    a._BinaryenAtomicWaitGetExpected = (b) =>
      (a._BinaryenAtomicWaitGetExpected = P.fr)(b);
    a._BinaryenAtomicWaitSetExpected = (b, c) =>
      (a._BinaryenAtomicWaitSetExpected = P.gr)(b, c);
    a._BinaryenAtomicWaitGetTimeout = (b) =>
      (a._BinaryenAtomicWaitGetTimeout = P.hr)(b);
    a._BinaryenAtomicWaitSetTimeout = (b, c) =>
      (a._BinaryenAtomicWaitSetTimeout = P.ir)(b, c);
    a._BinaryenAtomicWaitGetExpectedType = (b) =>
      (a._BinaryenAtomicWaitGetExpectedType = P.jr)(b);
    a._BinaryenAtomicWaitSetExpectedType = (b, c) =>
      (a._BinaryenAtomicWaitSetExpectedType = P.kr)(b, c);
    a._BinaryenAtomicNotifyGetPtr = (b) =>
      (a._BinaryenAtomicNotifyGetPtr = P.lr)(b);
    a._BinaryenAtomicNotifySetPtr = (b, c) =>
      (a._BinaryenAtomicNotifySetPtr = P.mr)(b, c);
    a._BinaryenAtomicNotifyGetNotifyCount = (b) =>
      (a._BinaryenAtomicNotifyGetNotifyCount = P.nr)(b);
    a._BinaryenAtomicNotifySetNotifyCount = (b, c) =>
      (a._BinaryenAtomicNotifySetNotifyCount = P.or)(b, c);
    a._BinaryenAtomicFenceGetOrder = (b) =>
      (a._BinaryenAtomicFenceGetOrder = P.pr)(b);
    a._BinaryenAtomicFenceSetOrder = (b, c) =>
      (a._BinaryenAtomicFenceSetOrder = P.qr)(b, c);
    a._BinaryenSIMDExtractGetOp = (b) =>
      (a._BinaryenSIMDExtractGetOp = P.rr)(b);
    a._BinaryenSIMDExtractSetOp = (b, c) =>
      (a._BinaryenSIMDExtractSetOp = P.sr)(b, c);
    a._BinaryenSIMDExtractGetVec = (b) =>
      (a._BinaryenSIMDExtractGetVec = P.tr)(b);
    a._BinaryenSIMDExtractSetVec = (b, c) =>
      (a._BinaryenSIMDExtractSetVec = P.ur)(b, c);
    a._BinaryenSIMDExtractGetIndex = (b) =>
      (a._BinaryenSIMDExtractGetIndex = P.vr)(b);
    a._BinaryenSIMDExtractSetIndex = (b, c) =>
      (a._BinaryenSIMDExtractSetIndex = P.wr)(b, c);
    a._BinaryenSIMDReplaceGetOp = (b) =>
      (a._BinaryenSIMDReplaceGetOp = P.xr)(b);
    a._BinaryenSIMDReplaceSetOp = (b, c) =>
      (a._BinaryenSIMDReplaceSetOp = P.yr)(b, c);
    a._BinaryenSIMDReplaceGetVec = (b) =>
      (a._BinaryenSIMDReplaceGetVec = P.zr)(b);
    a._BinaryenSIMDReplaceSetVec = (b, c) =>
      (a._BinaryenSIMDReplaceSetVec = P.Ar)(b, c);
    a._BinaryenSIMDReplaceGetIndex = (b) =>
      (a._BinaryenSIMDReplaceGetIndex = P.Br)(b);
    a._BinaryenSIMDReplaceSetIndex = (b, c) =>
      (a._BinaryenSIMDReplaceSetIndex = P.Cr)(b, c);
    a._BinaryenSIMDReplaceGetValue = (b) =>
      (a._BinaryenSIMDReplaceGetValue = P.Dr)(b);
    a._BinaryenSIMDReplaceSetValue = (b, c) =>
      (a._BinaryenSIMDReplaceSetValue = P.Er)(b, c);
    a._BinaryenSIMDShuffleGetLeft = (b) =>
      (a._BinaryenSIMDShuffleGetLeft = P.Fr)(b);
    a._BinaryenSIMDShuffleSetLeft = (b, c) =>
      (a._BinaryenSIMDShuffleSetLeft = P.Gr)(b, c);
    a._BinaryenSIMDShuffleGetRight = (b) =>
      (a._BinaryenSIMDShuffleGetRight = P.Hr)(b);
    a._BinaryenSIMDShuffleSetRight = (b, c) =>
      (a._BinaryenSIMDShuffleSetRight = P.Ir)(b, c);
    a._BinaryenSIMDShuffleGetMask = (b, c) =>
      (a._BinaryenSIMDShuffleGetMask = P.Jr)(b, c);
    a._BinaryenSIMDShuffleSetMask = (b, c) =>
      (a._BinaryenSIMDShuffleSetMask = P.Kr)(b, c);
    a._BinaryenSIMDTernaryGetOp = (b) =>
      (a._BinaryenSIMDTernaryGetOp = P.Lr)(b);
    a._BinaryenSIMDTernarySetOp = (b, c) =>
      (a._BinaryenSIMDTernarySetOp = P.Mr)(b, c);
    a._BinaryenSIMDTernaryGetA = (b) => (a._BinaryenSIMDTernaryGetA = P.Nr)(b);
    a._BinaryenSIMDTernarySetA = (b, c) =>
      (a._BinaryenSIMDTernarySetA = P.Or)(b, c);
    a._BinaryenSIMDTernaryGetB = (b) => (a._BinaryenSIMDTernaryGetB = P.Pr)(b);
    a._BinaryenSIMDTernarySetB = (b, c) =>
      (a._BinaryenSIMDTernarySetB = P.Qr)(b, c);
    a._BinaryenSIMDTernaryGetC = (b) => (a._BinaryenSIMDTernaryGetC = P.Rr)(b);
    a._BinaryenSIMDTernarySetC = (b, c) =>
      (a._BinaryenSIMDTernarySetC = P.Sr)(b, c);
    a._BinaryenSIMDShiftGetOp = (b) => (a._BinaryenSIMDShiftGetOp = P.Tr)(b);
    a._BinaryenSIMDShiftSetOp = (b, c) =>
      (a._BinaryenSIMDShiftSetOp = P.Ur)(b, c);
    a._BinaryenSIMDShiftGetVec = (b) => (a._BinaryenSIMDShiftGetVec = P.Vr)(b);
    a._BinaryenSIMDShiftSetVec = (b, c) =>
      (a._BinaryenSIMDShiftSetVec = P.Wr)(b, c);
    a._BinaryenSIMDShiftGetShift = (b) =>
      (a._BinaryenSIMDShiftGetShift = P.Xr)(b);
    a._BinaryenSIMDShiftSetShift = (b, c) =>
      (a._BinaryenSIMDShiftSetShift = P.Yr)(b, c);
    a._BinaryenSIMDLoadGetOp = (b) => (a._BinaryenSIMDLoadGetOp = P.Zr)(b);
    a._BinaryenSIMDLoadSetOp = (b, c) =>
      (a._BinaryenSIMDLoadSetOp = P._r)(b, c);
    a._BinaryenSIMDLoadGetOffset = (b) =>
      (a._BinaryenSIMDLoadGetOffset = P.$r)(b);
    a._BinaryenSIMDLoadSetOffset = (b, c) =>
      (a._BinaryenSIMDLoadSetOffset = P.as)(b, c);
    a._BinaryenSIMDLoadGetAlign = (b) =>
      (a._BinaryenSIMDLoadGetAlign = P.bs)(b);
    a._BinaryenSIMDLoadSetAlign = (b, c) =>
      (a._BinaryenSIMDLoadSetAlign = P.cs)(b, c);
    a._BinaryenSIMDLoadGetPtr = (b) => (a._BinaryenSIMDLoadGetPtr = P.ds)(b);
    a._BinaryenSIMDLoadSetPtr = (b, c) =>
      (a._BinaryenSIMDLoadSetPtr = P.es)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetOp = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetOp = P.fs)(b);
    a._BinaryenSIMDLoadStoreLaneSetOp = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetOp = P.gs)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetOffset = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetOffset = P.hs)(b);
    a._BinaryenSIMDLoadStoreLaneSetOffset = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetOffset = P.is)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetAlign = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetAlign = P.js)(b);
    a._BinaryenSIMDLoadStoreLaneSetAlign = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetAlign = P.ks)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetIndex = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetIndex = P.ls)(b);
    a._BinaryenSIMDLoadStoreLaneSetIndex = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetIndex = P.ms)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetPtr = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetPtr = P.ns)(b);
    a._BinaryenSIMDLoadStoreLaneSetPtr = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetPtr = P.os)(b, c);
    a._BinaryenSIMDLoadStoreLaneGetVec = (b) =>
      (a._BinaryenSIMDLoadStoreLaneGetVec = P.ps)(b);
    a._BinaryenSIMDLoadStoreLaneSetVec = (b, c) =>
      (a._BinaryenSIMDLoadStoreLaneSetVec = P.qs)(b, c);
    a._BinaryenSIMDLoadStoreLaneIsStore = (b) =>
      (a._BinaryenSIMDLoadStoreLaneIsStore = P.rs)(b);
    a._BinaryenMemoryInitGetSegment = (b) =>
      (a._BinaryenMemoryInitGetSegment = P.ss)(b);
    a._BinaryenMemoryInitSetSegment = (b, c) =>
      (a._BinaryenMemoryInitSetSegment = P.ts)(b, c);
    a._BinaryenMemoryInitGetDest = (b) =>
      (a._BinaryenMemoryInitGetDest = P.us)(b);
    a._BinaryenMemoryInitSetDest = (b, c) =>
      (a._BinaryenMemoryInitSetDest = P.vs)(b, c);
    a._BinaryenMemoryInitGetOffset = (b) =>
      (a._BinaryenMemoryInitGetOffset = P.ws)(b);
    a._BinaryenMemoryInitSetOffset = (b, c) =>
      (a._BinaryenMemoryInitSetOffset = P.xs)(b, c);
    a._BinaryenMemoryInitGetSize = (b) =>
      (a._BinaryenMemoryInitGetSize = P.ys)(b);
    a._BinaryenMemoryInitSetSize = (b, c) =>
      (a._BinaryenMemoryInitSetSize = P.zs)(b, c);
    a._BinaryenDataDropGetSegment = (b) =>
      (a._BinaryenDataDropGetSegment = P.As)(b);
    a._BinaryenDataDropSetSegment = (b, c) =>
      (a._BinaryenDataDropSetSegment = P.Bs)(b, c);
    a._BinaryenMemoryCopyGetDest = (b) =>
      (a._BinaryenMemoryCopyGetDest = P.Cs)(b);
    a._BinaryenMemoryCopySetDest = (b, c) =>
      (a._BinaryenMemoryCopySetDest = P.Ds)(b, c);
    a._BinaryenMemoryCopyGetSource = (b) =>
      (a._BinaryenMemoryCopyGetSource = P.Es)(b);
    a._BinaryenMemoryCopySetSource = (b, c) =>
      (a._BinaryenMemoryCopySetSource = P.Fs)(b, c);
    a._BinaryenMemoryCopyGetSize = (b) =>
      (a._BinaryenMemoryCopyGetSize = P.Gs)(b);
    a._BinaryenMemoryCopySetSize = (b, c) =>
      (a._BinaryenMemoryCopySetSize = P.Hs)(b, c);
    a._BinaryenMemoryFillGetDest = (b) =>
      (a._BinaryenMemoryFillGetDest = P.Is)(b);
    a._BinaryenMemoryFillSetDest = (b, c) =>
      (a._BinaryenMemoryFillSetDest = P.Js)(b, c);
    a._BinaryenMemoryFillGetValue = (b) =>
      (a._BinaryenMemoryFillGetValue = P.Ks)(b);
    a._BinaryenMemoryFillSetValue = (b, c) =>
      (a._BinaryenMemoryFillSetValue = P.Ls)(b, c);
    a._BinaryenMemoryFillGetSize = (b) =>
      (a._BinaryenMemoryFillGetSize = P.Ms)(b);
    a._BinaryenMemoryFillSetSize = (b, c) =>
      (a._BinaryenMemoryFillSetSize = P.Ns)(b, c);
    a._BinaryenRefIsNullGetValue = (b) =>
      (a._BinaryenRefIsNullGetValue = P.Os)(b);
    a._BinaryenRefIsNullSetValue = (b, c) =>
      (a._BinaryenRefIsNullSetValue = P.Ps)(b, c);
    a._BinaryenRefAsGetOp = (b) => (a._BinaryenRefAsGetOp = P.Qs)(b);
    a._BinaryenRefAsSetOp = (b, c) => (a._BinaryenRefAsSetOp = P.Rs)(b, c);
    a._BinaryenRefAsGetValue = (b) => (a._BinaryenRefAsGetValue = P.Ss)(b);
    a._BinaryenRefAsSetValue = (b, c) =>
      (a._BinaryenRefAsSetValue = P.Ts)(b, c);
    a._BinaryenRefFuncGetFunc = (b) => (a._BinaryenRefFuncGetFunc = P.Us)(b);
    a._BinaryenRefFuncSetFunc = (b, c) =>
      (a._BinaryenRefFuncSetFunc = P.Vs)(b, c);
    a._BinaryenRefEqGetLeft = (b) => (a._BinaryenRefEqGetLeft = P.Ws)(b);
    a._BinaryenRefEqSetLeft = (b, c) => (a._BinaryenRefEqSetLeft = P.Xs)(b, c);
    a._BinaryenRefEqGetRight = (b) => (a._BinaryenRefEqGetRight = P.Ys)(b);
    a._BinaryenRefEqSetRight = (b, c) =>
      (a._BinaryenRefEqSetRight = P.Zs)(b, c);
    a._BinaryenTryGetName = (b) => (a._BinaryenTryGetName = P._s)(b);
    a._BinaryenTrySetName = (b, c) => (a._BinaryenTrySetName = P.$s)(b, c);
    a._BinaryenTryGetBody = (b) => (a._BinaryenTryGetBody = P.at)(b);
    a._BinaryenTrySetBody = (b, c) => (a._BinaryenTrySetBody = P.bt)(b, c);
    a._BinaryenTryGetNumCatchTags = (b) =>
      (a._BinaryenTryGetNumCatchTags = P.ct)(b);
    a._BinaryenTryGetNumCatchBodies = (b) =>
      (a._BinaryenTryGetNumCatchBodies = P.dt)(b);
    a._BinaryenTryGetCatchTagAt = (b, c) =>
      (a._BinaryenTryGetCatchTagAt = P.et)(b, c);
    a._BinaryenTrySetCatchTagAt = (b, c, g) =>
      (a._BinaryenTrySetCatchTagAt = P.ft)(b, c, g);
    a._BinaryenTryAppendCatchTag = (b, c) =>
      (a._BinaryenTryAppendCatchTag = P.gt)(b, c);
    a._BinaryenTryInsertCatchTagAt = (b, c, g) =>
      (a._BinaryenTryInsertCatchTagAt = P.ht)(b, c, g);
    a._BinaryenTryRemoveCatchTagAt = (b, c) =>
      (a._BinaryenTryRemoveCatchTagAt = P.it)(b, c);
    a._BinaryenTryGetCatchBodyAt = (b, c) =>
      (a._BinaryenTryGetCatchBodyAt = P.jt)(b, c);
    a._BinaryenTrySetCatchBodyAt = (b, c, g) =>
      (a._BinaryenTrySetCatchBodyAt = P.kt)(b, c, g);
    a._BinaryenTryAppendCatchBody = (b, c) =>
      (a._BinaryenTryAppendCatchBody = P.lt)(b, c);
    a._BinaryenTryInsertCatchBodyAt = (b, c, g) =>
      (a._BinaryenTryInsertCatchBodyAt = P.mt)(b, c, g);
    a._BinaryenTryRemoveCatchBodyAt = (b, c) =>
      (a._BinaryenTryRemoveCatchBodyAt = P.nt)(b, c);
    a._BinaryenTryHasCatchAll = (b) => (a._BinaryenTryHasCatchAll = P.ot)(b);
    a._BinaryenTryGetDelegateTarget = (b) =>
      (a._BinaryenTryGetDelegateTarget = P.pt)(b);
    a._BinaryenTrySetDelegateTarget = (b, c) =>
      (a._BinaryenTrySetDelegateTarget = P.qt)(b, c);
    a._BinaryenTryIsDelegate = (b) => (a._BinaryenTryIsDelegate = P.rt)(b);
    a._BinaryenThrowGetTag = (b) => (a._BinaryenThrowGetTag = P.st)(b);
    a._BinaryenThrowSetTag = (b, c) => (a._BinaryenThrowSetTag = P.tt)(b, c);
    a._BinaryenThrowGetNumOperands = (b) =>
      (a._BinaryenThrowGetNumOperands = P.ut)(b);
    a._BinaryenThrowGetOperandAt = (b, c) =>
      (a._BinaryenThrowGetOperandAt = P.vt)(b, c);
    a._BinaryenThrowSetOperandAt = (b, c, g) =>
      (a._BinaryenThrowSetOperandAt = P.wt)(b, c, g);
    a._BinaryenThrowAppendOperand = (b, c) =>
      (a._BinaryenThrowAppendOperand = P.xt)(b, c);
    a._BinaryenThrowInsertOperandAt = (b, c, g) =>
      (a._BinaryenThrowInsertOperandAt = P.yt)(b, c, g);
    a._BinaryenThrowRemoveOperandAt = (b, c) =>
      (a._BinaryenThrowRemoveOperandAt = P.zt)(b, c);
    a._BinaryenRethrowGetTarget = (b) =>
      (a._BinaryenRethrowGetTarget = P.At)(b);
    a._BinaryenRethrowSetTarget = (b, c) =>
      (a._BinaryenRethrowSetTarget = P.Bt)(b, c);
    a._BinaryenTupleMakeGetNumOperands = (b) =>
      (a._BinaryenTupleMakeGetNumOperands = P.Ct)(b);
    a._BinaryenTupleMakeGetOperandAt = (b, c) =>
      (a._BinaryenTupleMakeGetOperandAt = P.Dt)(b, c);
    a._BinaryenTupleMakeSetOperandAt = (b, c, g) =>
      (a._BinaryenTupleMakeSetOperandAt = P.Et)(b, c, g);
    a._BinaryenTupleMakeAppendOperand = (b, c) =>
      (a._BinaryenTupleMakeAppendOperand = P.Ft)(b, c);
    a._BinaryenTupleMakeInsertOperandAt = (b, c, g) =>
      (a._BinaryenTupleMakeInsertOperandAt = P.Gt)(b, c, g);
    a._BinaryenTupleMakeRemoveOperandAt = (b, c) =>
      (a._BinaryenTupleMakeRemoveOperandAt = P.Ht)(b, c);
    a._BinaryenTupleExtractGetTuple = (b) =>
      (a._BinaryenTupleExtractGetTuple = P.It)(b);
    a._BinaryenTupleExtractSetTuple = (b, c) =>
      (a._BinaryenTupleExtractSetTuple = P.Jt)(b, c);
    a._BinaryenTupleExtractGetIndex = (b) =>
      (a._BinaryenTupleExtractGetIndex = P.Kt)(b);
    a._BinaryenTupleExtractSetIndex = (b, c) =>
      (a._BinaryenTupleExtractSetIndex = P.Lt)(b, c);
    a._BinaryenRefI31GetValue = (b) => (a._BinaryenRefI31GetValue = P.Mt)(b);
    a._BinaryenRefI31SetValue = (b, c) =>
      (a._BinaryenRefI31SetValue = P.Nt)(b, c);
    a._BinaryenI31GetGetI31 = (b) => (a._BinaryenI31GetGetI31 = P.Ot)(b);
    a._BinaryenI31GetSetI31 = (b, c) => (a._BinaryenI31GetSetI31 = P.Pt)(b, c);
    a._BinaryenI31GetIsSigned = (b) => (a._BinaryenI31GetIsSigned = P.Qt)(b);
    a._BinaryenI31GetSetSigned = (b, c) =>
      (a._BinaryenI31GetSetSigned = P.Rt)(b, c);
    a._BinaryenCallRefGetNumOperands = (b) =>
      (a._BinaryenCallRefGetNumOperands = P.St)(b);
    a._BinaryenCallRefGetOperandAt = (b, c) =>
      (a._BinaryenCallRefGetOperandAt = P.Tt)(b, c);
    a._BinaryenCallRefSetOperandAt = (b, c, g) =>
      (a._BinaryenCallRefSetOperandAt = P.Ut)(b, c, g);
    a._BinaryenCallRefAppendOperand = (b, c) =>
      (a._BinaryenCallRefAppendOperand = P.Vt)(b, c);
    a._BinaryenCallRefInsertOperandAt = (b, c, g) =>
      (a._BinaryenCallRefInsertOperandAt = P.Wt)(b, c, g);
    a._BinaryenCallRefRemoveOperandAt = (b, c) =>
      (a._BinaryenCallRefRemoveOperandAt = P.Xt)(b, c);
    a._BinaryenCallRefGetTarget = (b) =>
      (a._BinaryenCallRefGetTarget = P.Yt)(b);
    a._BinaryenCallRefSetTarget = (b, c) =>
      (a._BinaryenCallRefSetTarget = P.Zt)(b, c);
    a._BinaryenCallRefIsReturn = (b) => (a._BinaryenCallRefIsReturn = P._t)(b);
    a._BinaryenCallRefSetReturn = (b, c) =>
      (a._BinaryenCallRefSetReturn = P.$t)(b, c);
    a._BinaryenRefTestGetRef = (b) => (a._BinaryenRefTestGetRef = P.au)(b);
    a._BinaryenRefTestSetRef = (b, c) =>
      (a._BinaryenRefTestSetRef = P.bu)(b, c);
    a._BinaryenRefTestGetCastType = (b) =>
      (a._BinaryenRefTestGetCastType = P.cu)(b);
    a._BinaryenRefTestSetCastType = (b, c) =>
      (a._BinaryenRefTestSetCastType = P.du)(b, c);
    a._BinaryenRefCastGetRef = (b) => (a._BinaryenRefCastGetRef = P.eu)(b);
    a._BinaryenRefCastSetRef = (b, c) =>
      (a._BinaryenRefCastSetRef = P.fu)(b, c);
    a._BinaryenBrOnGetOp = (b) => (a._BinaryenBrOnGetOp = P.gu)(b);
    a._BinaryenBrOnSetOp = (b, c) => (a._BinaryenBrOnSetOp = P.hu)(b, c);
    a._BinaryenBrOnGetName = (b) => (a._BinaryenBrOnGetName = P.iu)(b);
    a._BinaryenBrOnSetName = (b, c) => (a._BinaryenBrOnSetName = P.ju)(b, c);
    a._BinaryenBrOnGetRef = (b) => (a._BinaryenBrOnGetRef = P.ku)(b);
    a._BinaryenBrOnSetRef = (b, c) => (a._BinaryenBrOnSetRef = P.lu)(b, c);
    a._BinaryenBrOnGetCastType = (b) => (a._BinaryenBrOnGetCastType = P.mu)(b);
    a._BinaryenBrOnSetCastType = (b, c) =>
      (a._BinaryenBrOnSetCastType = P.nu)(b, c);
    a._BinaryenStructNewGetNumOperands = (b) =>
      (a._BinaryenStructNewGetNumOperands = P.ou)(b);
    a._BinaryenStructNewGetOperandAt = (b, c) =>
      (a._BinaryenStructNewGetOperandAt = P.pu)(b, c);
    a._BinaryenStructNewSetOperandAt = (b, c, g) =>
      (a._BinaryenStructNewSetOperandAt = P.qu)(b, c, g);
    a._BinaryenStructNewAppendOperand = (b, c) =>
      (a._BinaryenStructNewAppendOperand = P.ru)(b, c);
    a._BinaryenStructNewInsertOperandAt = (b, c, g) =>
      (a._BinaryenStructNewInsertOperandAt = P.su)(b, c, g);
    a._BinaryenStructNewRemoveOperandAt = (b, c) =>
      (a._BinaryenStructNewRemoveOperandAt = P.tu)(b, c);
    a._BinaryenStructGetGetIndex = (b) =>
      (a._BinaryenStructGetGetIndex = P.uu)(b);
    a._BinaryenStructGetSetIndex = (b, c) =>
      (a._BinaryenStructGetSetIndex = P.vu)(b, c);
    a._BinaryenStructGetGetRef = (b) => (a._BinaryenStructGetGetRef = P.wu)(b);
    a._BinaryenStructGetSetRef = (b, c) =>
      (a._BinaryenStructGetSetRef = P.xu)(b, c);
    a._BinaryenStructGetIsSigned = (b) =>
      (a._BinaryenStructGetIsSigned = P.yu)(b);
    a._BinaryenStructGetSetSigned = (b, c) =>
      (a._BinaryenStructGetSetSigned = P.zu)(b, c);
    a._BinaryenStructSetGetIndex = (b) =>
      (a._BinaryenStructSetGetIndex = P.Au)(b);
    a._BinaryenStructSetSetIndex = (b, c) =>
      (a._BinaryenStructSetSetIndex = P.Bu)(b, c);
    a._BinaryenStructSetGetRef = (b) => (a._BinaryenStructSetGetRef = P.Cu)(b);
    a._BinaryenStructSetSetRef = (b, c) =>
      (a._BinaryenStructSetSetRef = P.Du)(b, c);
    a._BinaryenStructSetGetValue = (b) =>
      (a._BinaryenStructSetGetValue = P.Eu)(b);
    a._BinaryenStructSetSetValue = (b, c) =>
      (a._BinaryenStructSetSetValue = P.Fu)(b, c);
    a._BinaryenArrayNewGetInit = (b) => (a._BinaryenArrayNewGetInit = P.Gu)(b);
    a._BinaryenArrayNewSetInit = (b, c) =>
      (a._BinaryenArrayNewSetInit = P.Hu)(b, c);
    a._BinaryenArrayNewGetSize = (b) => (a._BinaryenArrayNewGetSize = P.Iu)(b);
    a._BinaryenArrayNewSetSize = (b, c) =>
      (a._BinaryenArrayNewSetSize = P.Ju)(b, c);
    a._BinaryenArrayNewFixedGetNumValues = (b) =>
      (a._BinaryenArrayNewFixedGetNumValues = P.Ku)(b);
    a._BinaryenArrayNewFixedGetValueAt = (b, c) =>
      (a._BinaryenArrayNewFixedGetValueAt = P.Lu)(b, c);
    a._BinaryenArrayNewFixedSetValueAt = (b, c, g) =>
      (a._BinaryenArrayNewFixedSetValueAt = P.Mu)(b, c, g);
    a._BinaryenArrayNewFixedAppendValue = (b, c) =>
      (a._BinaryenArrayNewFixedAppendValue = P.Nu)(b, c);
    a._BinaryenArrayNewFixedInsertValueAt = (b, c, g) =>
      (a._BinaryenArrayNewFixedInsertValueAt = P.Ou)(b, c, g);
    a._BinaryenArrayNewFixedRemoveValueAt = (b, c) =>
      (a._BinaryenArrayNewFixedRemoveValueAt = P.Pu)(b, c);
    a._BinaryenArrayGetGetRef = (b) => (a._BinaryenArrayGetGetRef = P.Qu)(b);
    a._BinaryenArrayGetSetRef = (b, c) =>
      (a._BinaryenArrayGetSetRef = P.Ru)(b, c);
    a._BinaryenArrayGetGetIndex = (b) =>
      (a._BinaryenArrayGetGetIndex = P.Su)(b);
    a._BinaryenArrayGetSetIndex = (b, c) =>
      (a._BinaryenArrayGetSetIndex = P.Tu)(b, c);
    a._BinaryenArrayGetIsSigned = (b) =>
      (a._BinaryenArrayGetIsSigned = P.Uu)(b);
    a._BinaryenArrayGetSetSigned = (b, c) =>
      (a._BinaryenArrayGetSetSigned = P.Vu)(b, c);
    a._BinaryenArraySetGetRef = (b) => (a._BinaryenArraySetGetRef = P.Wu)(b);
    a._BinaryenArraySetSetRef = (b, c) =>
      (a._BinaryenArraySetSetRef = P.Xu)(b, c);
    a._BinaryenArraySetGetIndex = (b) =>
      (a._BinaryenArraySetGetIndex = P.Yu)(b);
    a._BinaryenArraySetSetIndex = (b, c) =>
      (a._BinaryenArraySetSetIndex = P.Zu)(b, c);
    a._BinaryenArraySetGetValue = (b) =>
      (a._BinaryenArraySetGetValue = P._u)(b);
    a._BinaryenArraySetSetValue = (b, c) =>
      (a._BinaryenArraySetSetValue = P.$u)(b, c);
    a._BinaryenArrayLenGetRef = (b) => (a._BinaryenArrayLenGetRef = P.av)(b);
    a._BinaryenArrayLenSetRef = (b, c) =>
      (a._BinaryenArrayLenSetRef = P.bv)(b, c);
    a._BinaryenArrayCopyGetDestRef = (b) =>
      (a._BinaryenArrayCopyGetDestRef = P.cv)(b);
    a._BinaryenArrayCopySetDestRef = (b, c) =>
      (a._BinaryenArrayCopySetDestRef = P.dv)(b, c);
    a._BinaryenArrayCopyGetDestIndex = (b) =>
      (a._BinaryenArrayCopyGetDestIndex = P.ev)(b);
    a._BinaryenArrayCopySetDestIndex = (b, c) =>
      (a._BinaryenArrayCopySetDestIndex = P.fv)(b, c);
    a._BinaryenArrayCopyGetSrcRef = (b) =>
      (a._BinaryenArrayCopyGetSrcRef = P.gv)(b);
    a._BinaryenArrayCopySetSrcRef = (b, c) =>
      (a._BinaryenArrayCopySetSrcRef = P.hv)(b, c);
    a._BinaryenArrayCopyGetSrcIndex = (b) =>
      (a._BinaryenArrayCopyGetSrcIndex = P.iv)(b);
    a._BinaryenArrayCopySetSrcIndex = (b, c) =>
      (a._BinaryenArrayCopySetSrcIndex = P.jv)(b, c);
    a._BinaryenArrayCopyGetLength = (b) =>
      (a._BinaryenArrayCopyGetLength = P.kv)(b);
    a._BinaryenArrayCopySetLength = (b, c) =>
      (a._BinaryenArrayCopySetLength = P.lv)(b, c);
    a._BinaryenStringNewGetOp = (b) => (a._BinaryenStringNewGetOp = P.mv)(b);
    a._BinaryenStringNewSetOp = (b, c) =>
      (a._BinaryenStringNewSetOp = P.nv)(b, c);
    a._BinaryenStringNewGetPtr = (b) => (a._BinaryenStringNewGetPtr = P.ov)(b);
    a._BinaryenStringNewSetPtr = (b, c) =>
      (a._BinaryenStringNewSetPtr = P.pv)(b, c);
    a._BinaryenStringNewGetLength = (b) =>
      (a._BinaryenStringNewGetLength = P.qv)(b);
    a._BinaryenStringNewSetLength = (b, c) =>
      (a._BinaryenStringNewSetLength = P.rv)(b, c);
    a._BinaryenStringNewGetStart = (b) =>
      (a._BinaryenStringNewGetStart = P.sv)(b);
    a._BinaryenStringNewSetStart = (b, c) =>
      (a._BinaryenStringNewSetStart = P.tv)(b, c);
    a._BinaryenStringNewGetEnd = (b) => (a._BinaryenStringNewGetEnd = P.uv)(b);
    a._BinaryenStringNewSetEnd = (b, c) =>
      (a._BinaryenStringNewSetEnd = P.vv)(b, c);
    a._BinaryenStringNewSetTry = (b, c) =>
      (a._BinaryenStringNewSetTry = P.wv)(b, c);
    a._BinaryenStringNewIsTry = (b) => (a._BinaryenStringNewIsTry = P.xv)(b);
    a._BinaryenStringConstGetString = (b) =>
      (a._BinaryenStringConstGetString = P.yv)(b);
    a._BinaryenStringConstSetString = (b, c) =>
      (a._BinaryenStringConstSetString = P.zv)(b, c);
    a._BinaryenStringMeasureGetOp = (b) =>
      (a._BinaryenStringMeasureGetOp = P.Av)(b);
    a._BinaryenStringMeasureSetOp = (b, c) =>
      (a._BinaryenStringMeasureSetOp = P.Bv)(b, c);
    a._BinaryenStringMeasureGetRef = (b) =>
      (a._BinaryenStringMeasureGetRef = P.Cv)(b);
    a._BinaryenStringMeasureSetRef = (b, c) =>
      (a._BinaryenStringMeasureSetRef = P.Dv)(b, c);
    a._BinaryenStringEncodeGetOp = (b) =>
      (a._BinaryenStringEncodeGetOp = P.Ev)(b);
    a._BinaryenStringEncodeSetOp = (b, c) =>
      (a._BinaryenStringEncodeSetOp = P.Fv)(b, c);
    a._BinaryenStringEncodeGetRef = (b) =>
      (a._BinaryenStringEncodeGetRef = P.Gv)(b);
    a._BinaryenStringEncodeSetRef = (b, c) =>
      (a._BinaryenStringEncodeSetRef = P.Hv)(b, c);
    a._BinaryenStringEncodeGetPtr = (b) =>
      (a._BinaryenStringEncodeGetPtr = P.Iv)(b);
    a._BinaryenStringEncodeSetPtr = (b, c) =>
      (a._BinaryenStringEncodeSetPtr = P.Jv)(b, c);
    a._BinaryenStringEncodeGetStart = (b) =>
      (a._BinaryenStringEncodeGetStart = P.Kv)(b);
    a._BinaryenStringEncodeSetStart = (b, c) =>
      (a._BinaryenStringEncodeSetStart = P.Lv)(b, c);
    a._BinaryenStringConcatGetLeft = (b) =>
      (a._BinaryenStringConcatGetLeft = P.Mv)(b);
    a._BinaryenStringConcatSetLeft = (b, c) =>
      (a._BinaryenStringConcatSetLeft = P.Nv)(b, c);
    a._BinaryenStringConcatGetRight = (b) =>
      (a._BinaryenStringConcatGetRight = P.Ov)(b);
    a._BinaryenStringConcatSetRight = (b, c) =>
      (a._BinaryenStringConcatSetRight = P.Pv)(b, c);
    a._BinaryenStringEqGetOp = (b) => (a._BinaryenStringEqGetOp = P.Qv)(b);
    a._BinaryenStringEqSetOp = (b, c) =>
      (a._BinaryenStringEqSetOp = P.Rv)(b, c);
    a._BinaryenStringEqGetLeft = (b) => (a._BinaryenStringEqGetLeft = P.Sv)(b);
    a._BinaryenStringEqSetLeft = (b, c) =>
      (a._BinaryenStringEqSetLeft = P.Tv)(b, c);
    a._BinaryenStringEqGetRight = (b) =>
      (a._BinaryenStringEqGetRight = P.Uv)(b);
    a._BinaryenStringEqSetRight = (b, c) =>
      (a._BinaryenStringEqSetRight = P.Vv)(b, c);
    a._BinaryenStringAsGetOp = (b) => (a._BinaryenStringAsGetOp = P.Wv)(b);
    a._BinaryenStringAsSetOp = (b, c) =>
      (a._BinaryenStringAsSetOp = P.Xv)(b, c);
    a._BinaryenStringAsGetRef = (b) => (a._BinaryenStringAsGetRef = P.Yv)(b);
    a._BinaryenStringAsSetRef = (b, c) =>
      (a._BinaryenStringAsSetRef = P.Zv)(b, c);
    a._BinaryenStringWTF8AdvanceGetRef = (b) =>
      (a._BinaryenStringWTF8AdvanceGetRef = P._v)(b);
    a._BinaryenStringWTF8AdvanceSetRef = (b, c) =>
      (a._BinaryenStringWTF8AdvanceSetRef = P.$v)(b, c);
    a._BinaryenStringWTF8AdvanceGetPos = (b) =>
      (a._BinaryenStringWTF8AdvanceGetPos = P.aw)(b);
    a._BinaryenStringWTF8AdvanceSetPos = (b, c) =>
      (a._BinaryenStringWTF8AdvanceSetPos = P.bw)(b, c);
    a._BinaryenStringWTF8AdvanceGetBytes = (b) =>
      (a._BinaryenStringWTF8AdvanceGetBytes = P.cw)(b);
    a._BinaryenStringWTF8AdvanceSetBytes = (b, c) =>
      (a._BinaryenStringWTF8AdvanceSetBytes = P.dw)(b, c);
    a._BinaryenStringWTF16GetGetRef = (b) =>
      (a._BinaryenStringWTF16GetGetRef = P.ew)(b);
    a._BinaryenStringWTF16GetSetRef = (b, c) =>
      (a._BinaryenStringWTF16GetSetRef = P.fw)(b, c);
    a._BinaryenStringWTF16GetGetPos = (b) =>
      (a._BinaryenStringWTF16GetGetPos = P.gw)(b);
    a._BinaryenStringWTF16GetSetPos = (b, c) =>
      (a._BinaryenStringWTF16GetSetPos = P.hw)(b, c);
    a._BinaryenStringIterNextGetRef = (b) =>
      (a._BinaryenStringIterNextGetRef = P.iw)(b);
    a._BinaryenStringIterNextSetRef = (b, c) =>
      (a._BinaryenStringIterNextSetRef = P.jw)(b, c);
    a._BinaryenStringIterMoveGetOp = (b) =>
      (a._BinaryenStringIterMoveGetOp = P.kw)(b);
    a._BinaryenStringIterMoveSetOp = (b, c) =>
      (a._BinaryenStringIterMoveSetOp = P.lw)(b, c);
    a._BinaryenStringIterMoveGetRef = (b) =>
      (a._BinaryenStringIterMoveGetRef = P.mw)(b);
    a._BinaryenStringIterMoveSetRef = (b, c) =>
      (a._BinaryenStringIterMoveSetRef = P.nw)(b, c);
    a._BinaryenStringIterMoveGetNum = (b) =>
      (a._BinaryenStringIterMoveGetNum = P.ow)(b);
    a._BinaryenStringIterMoveSetNum = (b, c) =>
      (a._BinaryenStringIterMoveSetNum = P.pw)(b, c);
    a._BinaryenStringSliceWTFGetOp = (b) =>
      (a._BinaryenStringSliceWTFGetOp = P.qw)(b);
    a._BinaryenStringSliceWTFSetOp = (b, c) =>
      (a._BinaryenStringSliceWTFSetOp = P.rw)(b, c);
    a._BinaryenStringSliceWTFGetRef = (b) =>
      (a._BinaryenStringSliceWTFGetRef = P.sw)(b);
    a._BinaryenStringSliceWTFSetRef = (b, c) =>
      (a._BinaryenStringSliceWTFSetRef = P.tw)(b, c);
    a._BinaryenStringSliceWTFGetStart = (b) =>
      (a._BinaryenStringSliceWTFGetStart = P.uw)(b);
    a._BinaryenStringSliceWTFSetStart = (b, c) =>
      (a._BinaryenStringSliceWTFSetStart = P.vw)(b, c);
    a._BinaryenStringSliceWTFGetEnd = (b) =>
      (a._BinaryenStringSliceWTFGetEnd = P.ww)(b);
    a._BinaryenStringSliceWTFSetEnd = (b, c) =>
      (a._BinaryenStringSliceWTFSetEnd = P.xw)(b, c);
    a._BinaryenStringSliceIterGetRef = (b) =>
      (a._BinaryenStringSliceIterGetRef = P.yw)(b);
    a._BinaryenStringSliceIterSetRef = (b, c) =>
      (a._BinaryenStringSliceIterSetRef = P.zw)(b, c);
    a._BinaryenStringSliceIterGetNum = (b) =>
      (a._BinaryenStringSliceIterGetNum = P.Aw)(b);
    a._BinaryenStringSliceIterSetNum = (b, c) =>
      (a._BinaryenStringSliceIterSetNum = P.Bw)(b, c);
    a._BinaryenAddFunction = (b, c, g, d, f, h, k) =>
      (a._BinaryenAddFunction = P.Cw)(b, c, g, d, f, h, k);
    a._BinaryenAddFunctionWithHeapType = (b, c, g, d, f, h) =>
      (a._BinaryenAddFunctionWithHeapType = P.Dw)(b, c, g, d, f, h);
    a._BinaryenGetFunction = (b, c) => (a._BinaryenGetFunction = P.Ew)(b, c);
    a._BinaryenRemoveFunction = (b, c) =>
      (a._BinaryenRemoveFunction = P.Fw)(b, c);
    a._BinaryenGetNumFunctions = (b) => (a._BinaryenGetNumFunctions = P.Gw)(b);
    a._BinaryenGetFunctionByIndex = (b, c) =>
      (a._BinaryenGetFunctionByIndex = P.Hw)(b, c);
    a._BinaryenAddGlobal = (b, c, g, d, f) =>
      (a._BinaryenAddGlobal = P.Iw)(b, c, g, d, f);
    a._BinaryenGetGlobal = (b, c) => (a._BinaryenGetGlobal = P.Jw)(b, c);
    a._BinaryenRemoveGlobal = (b, c) => (a._BinaryenRemoveGlobal = P.Kw)(b, c);
    a._BinaryenGetNumGlobals = (b) => (a._BinaryenGetNumGlobals = P.Lw)(b);
    a._BinaryenGetGlobalByIndex = (b, c) =>
      (a._BinaryenGetGlobalByIndex = P.Mw)(b, c);
    a._BinaryenAddTag = (b, c, g, d) => (a._BinaryenAddTag = P.Nw)(b, c, g, d);
    a._BinaryenGetTag = (b, c) => (a._BinaryenGetTag = P.Ow)(b, c);
    a._BinaryenRemoveTag = (b, c) => (a._BinaryenRemoveTag = P.Pw)(b, c);
    a._BinaryenAddFunctionImport = (b, c, g, d, f, h) =>
      (a._BinaryenAddFunctionImport = P.Qw)(b, c, g, d, f, h);
    a._BinaryenAddTableImport = (b, c, g, d) =>
      (a._BinaryenAddTableImport = P.Rw)(b, c, g, d);
    a._BinaryenAddMemoryImport = (b, c, g, d, f) =>
      (a._BinaryenAddMemoryImport = P.Sw)(b, c, g, d, f);
    a._BinaryenAddGlobalImport = (b, c, g, d, f, h) =>
      (a._BinaryenAddGlobalImport = P.Tw)(b, c, g, d, f, h);
    a._BinaryenAddTagImport = (b, c, g, d, f, h) =>
      (a._BinaryenAddTagImport = P.Uw)(b, c, g, d, f, h);
    a._BinaryenAddFunctionExport = (b, c, g) =>
      (a._BinaryenAddFunctionExport = P.Vw)(b, c, g);
    a._BinaryenAddTableExport = (b, c, g) =>
      (a._BinaryenAddTableExport = P.Ww)(b, c, g);
    a._BinaryenAddMemoryExport = (b, c, g) =>
      (a._BinaryenAddMemoryExport = P.Xw)(b, c, g);
    a._BinaryenAddGlobalExport = (b, c, g) =>
      (a._BinaryenAddGlobalExport = P.Yw)(b, c, g);
    a._BinaryenAddTagExport = (b, c, g) =>
      (a._BinaryenAddTagExport = P.Zw)(b, c, g);
    a._BinaryenGetExport = (b, c) => (a._BinaryenGetExport = P._w)(b, c);
    a._BinaryenRemoveExport = (b, c) => (a._BinaryenRemoveExport = P.$w)(b, c);
    a._BinaryenGetNumExports = (b) => (a._BinaryenGetNumExports = P.ax)(b);
    a._BinaryenGetExportByIndex = (b, c) =>
      (a._BinaryenGetExportByIndex = P.bx)(b, c);
    a._BinaryenAddTable = (b, c, g, d, f) =>
      (a._BinaryenAddTable = P.cx)(b, c, g, d, f);
    a._BinaryenRemoveTable = (b, c) => (a._BinaryenRemoveTable = P.dx)(b, c);
    a._BinaryenGetNumTables = (b) => (a._BinaryenGetNumTables = P.ex)(b);
    a._BinaryenGetTable = (b, c) => (a._BinaryenGetTable = P.fx)(b, c);
    a._BinaryenGetTableByIndex = (b, c) =>
      (a._BinaryenGetTableByIndex = P.gx)(b, c);
    a._BinaryenAddActiveElementSegment = (b, c, g, d, f, h) =>
      (a._BinaryenAddActiveElementSegment = P.hx)(b, c, g, d, f, h);
    a._BinaryenAddPassiveElementSegment = (b, c, g, d) =>
      (a._BinaryenAddPassiveElementSegment = P.ix)(b, c, g, d);
    a._BinaryenRemoveElementSegment = (b, c) =>
      (a._BinaryenRemoveElementSegment = P.jx)(b, c);
    a._BinaryenGetElementSegment = (b, c) =>
      (a._BinaryenGetElementSegment = P.kx)(b, c);
    a._BinaryenGetElementSegmentByIndex = (b, c) =>
      (a._BinaryenGetElementSegmentByIndex = P.lx)(b, c);
    a._BinaryenGetNumElementSegments = (b) =>
      (a._BinaryenGetNumElementSegments = P.mx)(b);
    a._BinaryenElementSegmentGetOffset = (b) =>
      (a._BinaryenElementSegmentGetOffset = P.nx)(b);
    a._BinaryenElementSegmentGetLength = (b) =>
      (a._BinaryenElementSegmentGetLength = P.ox)(b);
    a._BinaryenElementSegmentGetData = (b, c) =>
      (a._BinaryenElementSegmentGetData = P.px)(b, c);
    a._BinaryenSetMemory = (b, c, g, d, f, h, k, l, p, t, r, y) =>
      (a._BinaryenSetMemory = P.qx)(b, c, g, d, f, h, k, l, p, t, r, y);
    a._BinaryenGetNumMemorySegments = (b) =>
      (a._BinaryenGetNumMemorySegments = P.rx)(b);
    a._BinaryenGetMemorySegmentByteOffset = (b, c) =>
      (a._BinaryenGetMemorySegmentByteOffset = P.sx)(b, c);
    a._BinaryenHasMemory = (b) => (a._BinaryenHasMemory = P.tx)(b);
    a._BinaryenMemoryGetInitial = (b, c) =>
      (a._BinaryenMemoryGetInitial = P.ux)(b, c);
    a._BinaryenMemoryHasMax = (b, c) => (a._BinaryenMemoryHasMax = P.vx)(b, c);
    a._BinaryenMemoryGetMax = (b, c) => (a._BinaryenMemoryGetMax = P.wx)(b, c);
    a._BinaryenMemoryImportGetModule = (b, c) =>
      (a._BinaryenMemoryImportGetModule = P.xx)(b, c);
    a._BinaryenMemoryImportGetBase = (b, c) =>
      (a._BinaryenMemoryImportGetBase = P.yx)(b, c);
    a._BinaryenMemoryIsShared = (b, c) =>
      (a._BinaryenMemoryIsShared = P.zx)(b, c);
    a._BinaryenMemoryIs64 = (b, c) => (a._BinaryenMemoryIs64 = P.Ax)(b, c);
    a._BinaryenGetMemorySegmentByteLength = (b, c) =>
      (a._BinaryenGetMemorySegmentByteLength = P.Bx)(b, c);
    a._BinaryenGetMemorySegmentPassive = (b, c) =>
      (a._BinaryenGetMemorySegmentPassive = P.Cx)(b, c);
    a._BinaryenCopyMemorySegmentData = (b, c, g) =>
      (a._BinaryenCopyMemorySegmentData = P.Dx)(b, c, g);
    a._BinaryenSetStart = (b, c) => (a._BinaryenSetStart = P.Ex)(b, c);
    a._BinaryenModuleGetFeatures = (b) =>
      (a._BinaryenModuleGetFeatures = P.Fx)(b);
    a._BinaryenModuleSetFeatures = (b, c) =>
      (a._BinaryenModuleSetFeatures = P.Gx)(b, c);
    a._BinaryenModuleParse = (b) => (a._BinaryenModuleParse = P.Hx)(b);
    a._BinaryenModulePrint = (b) => (a._BinaryenModulePrint = P.Ix)(b);
    a._BinaryenModulePrintStackIR = (b, c) =>
      (a._BinaryenModulePrintStackIR = P.Jx)(b, c);
    a._BinaryenModulePrintAsmjs = (b) =>
      (a._BinaryenModulePrintAsmjs = P.Kx)(b);
    a._BinaryenModuleValidate = (b) => (a._BinaryenModuleValidate = P.Lx)(b);
    a._BinaryenModuleOptimize = (b) => (a._BinaryenModuleOptimize = P.Mx)(b);
    a._BinaryenModuleUpdateMaps = (b) =>
      (a._BinaryenModuleUpdateMaps = P.Nx)(b);
    a._BinaryenGetOptimizeLevel = () => (a._BinaryenGetOptimizeLevel = P.Ox)();
    a._BinaryenSetOptimizeLevel = (b) =>
      (a._BinaryenSetOptimizeLevel = P.Px)(b);
    a._BinaryenGetShrinkLevel = () => (a._BinaryenGetShrinkLevel = P.Qx)();
    a._BinaryenSetShrinkLevel = (b) => (a._BinaryenSetShrinkLevel = P.Rx)(b);
    a._BinaryenGetDebugInfo = () => (a._BinaryenGetDebugInfo = P.Sx)();
    a._BinaryenSetDebugInfo = (b) => (a._BinaryenSetDebugInfo = P.Tx)(b);
    a._BinaryenGetLowMemoryUnused = () =>
      (a._BinaryenGetLowMemoryUnused = P.Ux)();
    a._BinaryenSetLowMemoryUnused = (b) =>
      (a._BinaryenSetLowMemoryUnused = P.Vx)(b);
    a._BinaryenGetZeroFilledMemory = () =>
      (a._BinaryenGetZeroFilledMemory = P.Wx)();
    a._BinaryenSetZeroFilledMemory = (b) =>
      (a._BinaryenSetZeroFilledMemory = P.Xx)(b);
    a._BinaryenGetFastMath = () => (a._BinaryenGetFastMath = P.Yx)();
    a._BinaryenSetFastMath = (b) => (a._BinaryenSetFastMath = P.Zx)(b);
    a._BinaryenGetPassArgument = (b) => (a._BinaryenGetPassArgument = P._x)(b);
    a._BinaryenSetPassArgument = (b, c) =>
      (a._BinaryenSetPassArgument = P.$x)(b, c);
    a._BinaryenClearPassArguments = () =>
      (a._BinaryenClearPassArguments = P.ay)();
    a._BinaryenGetAlwaysInlineMaxSize = () =>
      (a._BinaryenGetAlwaysInlineMaxSize = P.by)();
    a._BinaryenSetAlwaysInlineMaxSize = (b) =>
      (a._BinaryenSetAlwaysInlineMaxSize = P.cy)(b);
    a._BinaryenGetFlexibleInlineMaxSize = () =>
      (a._BinaryenGetFlexibleInlineMaxSize = P.dy)();
    a._BinaryenSetFlexibleInlineMaxSize = (b) =>
      (a._BinaryenSetFlexibleInlineMaxSize = P.ey)(b);
    a._BinaryenGetOneCallerInlineMaxSize = () =>
      (a._BinaryenGetOneCallerInlineMaxSize = P.fy)();
    a._BinaryenSetOneCallerInlineMaxSize = (b) =>
      (a._BinaryenSetOneCallerInlineMaxSize = P.gy)(b);
    a._BinaryenGetAllowInliningFunctionsWithLoops = () =>
      (a._BinaryenGetAllowInliningFunctionsWithLoops = P.hy)();
    a._BinaryenSetAllowInliningFunctionsWithLoops = (b) =>
      (a._BinaryenSetAllowInliningFunctionsWithLoops = P.iy)(b);
    a._BinaryenModuleRunPasses = (b, c, g) =>
      (a._BinaryenModuleRunPasses = P.jy)(b, c, g);
    a._BinaryenModuleAutoDrop = (b) => (a._BinaryenModuleAutoDrop = P.ky)(b);
    a._BinaryenModuleWrite = (b, c, g) =>
      (a._BinaryenModuleWrite = P.ly)(b, c, g);
    a._BinaryenModuleWriteText = (b, c, g) =>
      (a._BinaryenModuleWriteText = P.my)(b, c, g);
    a._BinaryenModuleWriteStackIR = (b, c, g, d) =>
      (a._BinaryenModuleWriteStackIR = P.ny)(b, c, g, d);
    a._BinaryenModuleWriteWithSourceMap = (b, c, g, d, f, h, k) =>
      (a._BinaryenModuleWriteWithSourceMap = P.oy)(b, c, g, d, f, h, k);
    a._BinaryenModuleAllocateAndWrite = (b, c, g) =>
      (a._BinaryenModuleAllocateAndWrite = P.py)(b, c, g);
    var Jd = (a._malloc = (b) => (Jd = a._malloc = P.qy)(b));
    a._BinaryenModuleAllocateAndWriteText = (b) =>
      (a._BinaryenModuleAllocateAndWriteText = P.ry)(b);
    a._BinaryenModuleAllocateAndWriteStackIR = (b, c) =>
      (a._BinaryenModuleAllocateAndWriteStackIR = P.sy)(b, c);
    a._BinaryenModuleRead = (b, c) => (a._BinaryenModuleRead = P.ty)(b, c);
    a._BinaryenModuleInterpret = (b) => (a._BinaryenModuleInterpret = P.uy)(b);
    a._BinaryenModuleAddDebugInfoFileName = (b, c) =>
      (a._BinaryenModuleAddDebugInfoFileName = P.vy)(b, c);
    a._BinaryenModuleGetDebugInfoFileName = (b, c) =>
      (a._BinaryenModuleGetDebugInfoFileName = P.wy)(b, c);
    a._BinaryenFunctionGetName = (b) => (a._BinaryenFunctionGetName = P.xy)(b);
    a._BinaryenFunctionGetParams = (b) =>
      (a._BinaryenFunctionGetParams = P.yy)(b);
    a._BinaryenFunctionGetResults = (b) =>
      (a._BinaryenFunctionGetResults = P.zy)(b);
    a._BinaryenFunctionGetNumVars = (b) =>
      (a._BinaryenFunctionGetNumVars = P.Ay)(b);
    a._BinaryenFunctionGetVar = (b, c) =>
      (a._BinaryenFunctionGetVar = P.By)(b, c);
    a._BinaryenFunctionGetNumLocals = (b) =>
      (a._BinaryenFunctionGetNumLocals = P.Cy)(b);
    a._BinaryenFunctionHasLocalName = (b, c) =>
      (a._BinaryenFunctionHasLocalName = P.Dy)(b, c);
    a._BinaryenFunctionGetLocalName = (b, c) =>
      (a._BinaryenFunctionGetLocalName = P.Ey)(b, c);
    a._BinaryenFunctionSetLocalName = (b, c, g) =>
      (a._BinaryenFunctionSetLocalName = P.Fy)(b, c, g);
    a._BinaryenFunctionGetBody = (b) => (a._BinaryenFunctionGetBody = P.Gy)(b);
    a._BinaryenFunctionSetBody = (b, c) =>
      (a._BinaryenFunctionSetBody = P.Hy)(b, c);
    a._BinaryenFunctionOptimize = (b, c) =>
      (a._BinaryenFunctionOptimize = P.Iy)(b, c);
    a._BinaryenFunctionRunPasses = (b, c, g, d) =>
      (a._BinaryenFunctionRunPasses = P.Jy)(b, c, g, d);
    a._BinaryenFunctionSetDebugLocation = (b, c, g, d, f) =>
      (a._BinaryenFunctionSetDebugLocation = P.Ky)(b, c, g, d, f);
    a._BinaryenTableGetName = (b) => (a._BinaryenTableGetName = P.Ly)(b);
    a._BinaryenTableSetName = (b, c) => (a._BinaryenTableSetName = P.My)(b, c);
    a._BinaryenTableGetInitial = (b) => (a._BinaryenTableGetInitial = P.Ny)(b);
    a._BinaryenTableSetInitial = (b, c) =>
      (a._BinaryenTableSetInitial = P.Oy)(b, c);
    a._BinaryenTableHasMax = (b) => (a._BinaryenTableHasMax = P.Py)(b);
    a._BinaryenTableGetMax = (b) => (a._BinaryenTableGetMax = P.Qy)(b);
    a._BinaryenTableSetMax = (b, c) => (a._BinaryenTableSetMax = P.Ry)(b, c);
    a._BinaryenElementSegmentGetName = (b) =>
      (a._BinaryenElementSegmentGetName = P.Sy)(b);
    a._BinaryenElementSegmentSetName = (b, c) =>
      (a._BinaryenElementSegmentSetName = P.Ty)(b, c);
    a._BinaryenElementSegmentGetTable = (b) =>
      (a._BinaryenElementSegmentGetTable = P.Uy)(b);
    a._BinaryenElementSegmentSetTable = (b, c) =>
      (a._BinaryenElementSegmentSetTable = P.Vy)(b, c);
    a._BinaryenElementSegmentIsPassive = (b) =>
      (a._BinaryenElementSegmentIsPassive = P.Wy)(b);
    a._BinaryenGlobalGetName = (b) => (a._BinaryenGlobalGetName = P.Xy)(b);
    a._BinaryenGlobalGetType = (b) => (a._BinaryenGlobalGetType = P.Yy)(b);
    a._BinaryenGlobalIsMutable = (b) => (a._BinaryenGlobalIsMutable = P.Zy)(b);
    a._BinaryenGlobalGetInitExpr = (b) =>
      (a._BinaryenGlobalGetInitExpr = P._y)(b);
    a._BinaryenTagGetName = (b) => (a._BinaryenTagGetName = P.$y)(b);
    a._BinaryenTagGetParams = (b) => (a._BinaryenTagGetParams = P.az)(b);
    a._BinaryenTagGetResults = (b) => (a._BinaryenTagGetResults = P.bz)(b);
    a._BinaryenFunctionImportGetModule = (b) =>
      (a._BinaryenFunctionImportGetModule = P.cz)(b);
    a._BinaryenTableImportGetModule = (b) =>
      (a._BinaryenTableImportGetModule = P.dz)(b);
    a._BinaryenGlobalImportGetModule = (b) =>
      (a._BinaryenGlobalImportGetModule = P.ez)(b);
    a._BinaryenTagImportGetModule = (b) =>
      (a._BinaryenTagImportGetModule = P.fz)(b);
    a._BinaryenFunctionImportGetBase = (b) =>
      (a._BinaryenFunctionImportGetBase = P.gz)(b);
    a._BinaryenTableImportGetBase = (b) =>
      (a._BinaryenTableImportGetBase = P.hz)(b);
    a._BinaryenGlobalImportGetBase = (b) =>
      (a._BinaryenGlobalImportGetBase = P.iz)(b);
    a._BinaryenTagImportGetBase = (b) =>
      (a._BinaryenTagImportGetBase = P.jz)(b);
    a._BinaryenExportGetKind = (b) => (a._BinaryenExportGetKind = P.kz)(b);
    a._BinaryenExportGetName = (b) => (a._BinaryenExportGetName = P.lz)(b);
    a._BinaryenExportGetValue = (b) => (a._BinaryenExportGetValue = P.mz)(b);
    a._BinaryenAddCustomSection = (b, c, g, d) =>
      (a._BinaryenAddCustomSection = P.nz)(b, c, g, d);
    a._BinaryenSideEffectNone = () => (a._BinaryenSideEffectNone = P.oz)();
    a._BinaryenSideEffectBranches = () =>
      (a._BinaryenSideEffectBranches = P.pz)();
    a._BinaryenSideEffectCalls = () => (a._BinaryenSideEffectCalls = P.qz)();
    a._BinaryenSideEffectReadsLocal = () =>
      (a._BinaryenSideEffectReadsLocal = P.rz)();
    a._BinaryenSideEffectWritesLocal = () =>
      (a._BinaryenSideEffectWritesLocal = P.sz)();
    a._BinaryenSideEffectReadsGlobal = () =>
      (a._BinaryenSideEffectReadsGlobal = P.tz)();
    a._BinaryenSideEffectWritesGlobal = () =>
      (a._BinaryenSideEffectWritesGlobal = P.uz)();
    a._BinaryenSideEffectReadsMemory = () =>
      (a._BinaryenSideEffectReadsMemory = P.vz)();
    a._BinaryenSideEffectWritesMemory = () =>
      (a._BinaryenSideEffectWritesMemory = P.wz)();
    a._BinaryenSideEffectReadsTable = () =>
      (a._BinaryenSideEffectReadsTable = P.xz)();
    a._BinaryenSideEffectWritesTable = () =>
      (a._BinaryenSideEffectWritesTable = P.yz)();
    a._BinaryenSideEffectImplicitTrap = () =>
      (a._BinaryenSideEffectImplicitTrap = P.zz)();
    a._BinaryenSideEffectTrapsNeverHappen = () =>
      (a._BinaryenSideEffectTrapsNeverHappen = P.Az)();
    a._BinaryenSideEffectIsAtomic = () =>
      (a._BinaryenSideEffectIsAtomic = P.Bz)();
    a._BinaryenSideEffectThrows = () => (a._BinaryenSideEffectThrows = P.Cz)();
    a._BinaryenSideEffectDanglingPop = () =>
      (a._BinaryenSideEffectDanglingPop = P.Dz)();
    a._BinaryenSideEffectAny = () => (a._BinaryenSideEffectAny = P.Ez)();
    a._BinaryenExpressionGetSideEffects = (b, c) =>
      (a._BinaryenExpressionGetSideEffects = P.Fz)(b, c);
    a._RelooperCreate = (b) => (a._RelooperCreate = P.Gz)(b);
    a._RelooperAddBlock = (b, c) => (a._RelooperAddBlock = P.Hz)(b, c);
    a._RelooperAddBranch = (b, c, g, d) =>
      (a._RelooperAddBranch = P.Iz)(b, c, g, d);
    a._RelooperAddBlockWithSwitch = (b, c, g) =>
      (a._RelooperAddBlockWithSwitch = P.Jz)(b, c, g);
    a._RelooperAddBranchForSwitch = (b, c, g, d, f) =>
      (a._RelooperAddBranchForSwitch = P.Kz)(b, c, g, d, f);
    a._RelooperRenderAndDispose = (b, c, g) =>
      (a._RelooperRenderAndDispose = P.Lz)(b, c, g);
    a._ExpressionRunnerFlagsDefault = () =>
      (a._ExpressionRunnerFlagsDefault = P.Mz)();
    a._ExpressionRunnerFlagsPreserveSideeffects = () =>
      (a._ExpressionRunnerFlagsPreserveSideeffects = P.Nz)();
    a._ExpressionRunnerFlagsTraverseCalls = () =>
      (a._ExpressionRunnerFlagsTraverseCalls = P.Oz)();
    a._ExpressionRunnerCreate = (b, c, g, d) =>
      (a._ExpressionRunnerCreate = P.Pz)(b, c, g, d);
    a._ExpressionRunnerSetLocalValue = (b, c, g) =>
      (a._ExpressionRunnerSetLocalValue = P.Qz)(b, c, g);
    a._ExpressionRunnerSetGlobalValue = (b, c, g) =>
      (a._ExpressionRunnerSetGlobalValue = P.Rz)(b, c, g);
    a._ExpressionRunnerRunAndDispose = (b, c) =>
      (a._ExpressionRunnerRunAndDispose = P.Sz)(b, c);
    a._TypeBuilderErrorReasonSelfSupertype = () =>
      (a._TypeBuilderErrorReasonSelfSupertype = P.Tz)();
    a._TypeBuilderErrorReasonInvalidSupertype = () =>
      (a._TypeBuilderErrorReasonInvalidSupertype = P.Uz)();
    a._TypeBuilderErrorReasonForwardSupertypeReference = () =>
      (a._TypeBuilderErrorReasonForwardSupertypeReference = P.Vz)();
    a._TypeBuilderErrorReasonForwardChildReference = () =>
      (a._TypeBuilderErrorReasonForwardChildReference = P.Wz)();
    a._TypeBuilderCreate = (b) => (a._TypeBuilderCreate = P.Xz)(b);
    a._TypeBuilderGrow = (b, c) => (a._TypeBuilderGrow = P.Yz)(b, c);
    a._TypeBuilderGetSize = (b) => (a._TypeBuilderGetSize = P.Zz)(b);
    a._TypeBuilderSetSignatureType = (b, c, g, d) =>
      (a._TypeBuilderSetSignatureType = P._z)(b, c, g, d);
    a._TypeBuilderSetStructType = (b, c, g, d, f, h) =>
      (a._TypeBuilderSetStructType = P.$z)(b, c, g, d, f, h);
    a._TypeBuilderSetArrayType = (b, c, g, d, f) =>
      (a._TypeBuilderSetArrayType = P.aA)(b, c, g, d, f);
    a._TypeBuilderGetTempHeapType = (b, c) =>
      (a._TypeBuilderGetTempHeapType = P.bA)(b, c);
    a._TypeBuilderGetTempTupleType = (b, c, g) =>
      (a._TypeBuilderGetTempTupleType = P.cA)(b, c, g);
    a._TypeBuilderGetTempRefType = (b, c, g) =>
      (a._TypeBuilderGetTempRefType = P.dA)(b, c, g);
    a._TypeBuilderSetSubType = (b, c, g) =>
      (a._TypeBuilderSetSubType = P.eA)(b, c, g);
    a._TypeBuilderSetOpen = (b, c) => (a._TypeBuilderSetOpen = P.fA)(b, c);
    a._TypeBuilderCreateRecGroup = (b, c, g) =>
      (a._TypeBuilderCreateRecGroup = P.gA)(b, c, g);
    a._TypeBuilderBuildAndDispose = (b, c, g, d) =>
      (a._TypeBuilderBuildAndDispose = P.hA)(b, c, g, d);
    a._BinaryenModuleSetTypeName = (b, c, g) =>
      (a._BinaryenModuleSetTypeName = P.iA)(b, c, g);
    a._BinaryenModuleSetFieldName = (b, c, g, d) =>
      (a._BinaryenModuleSetFieldName = P.jA)(b, c, g, d);
    a._BinaryenSetColorsEnabled = (b) =>
      (a._BinaryenSetColorsEnabled = P.kA)(b);
    a._BinaryenAreColorsEnabled = () => (a._BinaryenAreColorsEnabled = P.lA)();
    var Kd = (a._BinaryenSizeofLiteral = () =>
        (Kd = a._BinaryenSizeofLiteral = P.mA)()),
      Ld = (a._BinaryenSizeofAllocateAndWriteResult = () =>
        (Ld = a._BinaryenSizeofAllocateAndWriteResult = P.nA)());
    a.__i32_store8 = (b, c) => (a.__i32_store8 = P.oA)(b, c);
    a.__i32_store16 = (b, c) => (a.__i32_store16 = P.pA)(b, c);
    a.__i32_store = (b, c) => (a.__i32_store = P.qA)(b, c);
    a.__f32_store = (b, c) => (a.__f32_store = P.rA)(b, c);
    a.__f64_store = (b, c) => (a.__f64_store = P.sA)(b, c);
    a.__i32_load8_s = (b) => (a.__i32_load8_s = P.tA)(b);
    a.__i32_load8_u = (b) => (a.__i32_load8_u = P.uA)(b);
    a.__i32_load16_s = (b) => (a.__i32_load16_s = P.vA)(b);
    a.__i32_load16_u = (b) => (a.__i32_load16_u = P.wA)(b);
    a.__i32_load = (b) => (a.__i32_load = P.xA)(b);
    a.__f32_load = (b) => (a.__f32_load = P.yA)(b);
    a.__f64_load = (b) => (a.__f64_load = P.zA)(b);
    var Md = (a._free = (b) => (Md = a._free = P.AA)(b)),
      xc = () => (xc = P.BA)(),
      N = (b, c) => (N = P.DA)(b, c),
      Wa = (b) => (Wa = P.EA)(b),
      Q = () => (Q = P.FA)(),
      T = (b) => (T = P.GA)(b),
      M = (b) => (M = P.HA)(b),
      wc = (b) => (wc = P.IA)(b),
      vc = (b) => (vc = P.JA)(b),
      Xa = (b, c, g) => (Xa = P.KA)(b, c, g),
      Va = (b) => (Va = P.LA)(b),
      Nd = (a.dynCall_viij = (b, c, g, d, f) =>
        (Nd = a.dynCall_viij = P.MA)(b, c, g, d, f)),
      Od = (a.dynCall_iij = (b, c, g, d) =>
        (Od = a.dynCall_iij = P.NA)(b, c, g, d)),
      Pd = (a.dynCall_viiij = (b, c, g, d, f, h) =>
        (Pd = a.dynCall_viiij = P.OA)(b, c, g, d, f, h)),
      Qd = (a.dynCall_iiij = (b, c, g, d, f) =>
        (Qd = a.dynCall_iiij = P.PA)(b, c, g, d, f)),
      Rd = (a.dynCall_viiji = (b, c, g, d, f, h) =>
        (Rd = a.dynCall_viiji = P.QA)(b, c, g, d, f, h)),
      Sd = (a.dynCall_jii = (b, c, g) => (Sd = a.dynCall_jii = P.RA)(b, c, g)),
      Td = (a.dynCall_vjii = (b, c, g, d, f) =>
        (Td = a.dynCall_vjii = P.SA)(b, c, g, d, f)),
      Ud = (a.dynCall_vij = (b, c, g, d) =>
        (Ud = a.dynCall_vij = P.TA)(b, c, g, d)),
      Vd = (a.dynCall_ijiii = (b, c, g, d, f, h) =>
        (Vd = a.dynCall_ijiii = P.UA)(b, c, g, d, f, h)),
      Wd = (a.dynCall_iji = (b, c, g, d) =>
        (Wd = a.dynCall_iji = P.VA)(b, c, g, d)),
      Xd = (a.dynCall_iiiiij = (b, c, g, d, f, h, k) =>
        (Xd = a.dynCall_iiiiij = P.WA)(b, c, g, d, f, h, k)),
      Yd = (a.dynCall_viiiiij = (b, c, g, d, f, h, k, l) =>
        (Yd = a.dynCall_viiiiij = P.XA)(b, c, g, d, f, h, k, l)),
      Zd = (a.dynCall_iiijii = (b, c, g, d, f, h, k) =>
        (Zd = a.dynCall_iiijii = P.YA)(b, c, g, d, f, h, k)),
      $d = (a.dynCall_iijj = (b, c, g, d, f, h) =>
        ($d = a.dynCall_iijj = P.ZA)(b, c, g, d, f, h)),
      ae = (a.dynCall_ji = (b, c) => (ae = a.dynCall_ji = P._A)(b, c)),
      be = (a.dynCall_viijj = (b, c, g, d, f, h, k) =>
        (be = a.dynCall_viijj = P.$A)(b, c, g, d, f, h, k)),
      ce = (a.dynCall_vijji = (b, c, g, d, f, h, k) =>
        (ce = a.dynCall_vijji = P.aB)(b, c, g, d, f, h, k)),
      de = (a.dynCall_viijiijj = (b, c, g, d, f, h, k, l, p, t, r) =>
        (de = a.dynCall_viijiijj = P.bB)(b, c, g, d, f, h, k, l, p, t, r)),
      ee = (a.dynCall_vijiijj = (b, c, g, d, f, h, k, l, p, t) =>
        (ee = a.dynCall_vijiijj = P.cB)(b, c, g, d, f, h, k, l, p, t)),
      fe = (a.dynCall_jiiiij = (b, c, g, d, f, h, k) =>
        (fe = a.dynCall_jiiiij = P.dB)(b, c, g, d, f, h, k)),
      ge = (a.dynCall_viji = (b, c, g, d, f) =>
        (ge = a.dynCall_viji = P.eB)(b, c, g, d, f)),
      he = (a.dynCall_ijiiii = (b, c, g, d, f, h, k) =>
        (he = a.dynCall_ijiiii = P.fB)(b, c, g, d, f, h, k)),
      ie = (a.dynCall_jiii = (b, c, g, d) =>
        (ie = a.dynCall_jiii = P.gB)(b, c, g, d)),
      je = (a.dynCall_j = (b) => (je = a.dynCall_j = P.hB)(b)),
      ke = (a.dynCall_vijii = (b, c, g, d, f, h) =>
        (ke = a.dynCall_vijii = P.iB)(b, c, g, d, f, h)),
      le = (a.dynCall_vijiii = (b, c, g, d, f, h, k) =>
        (le = a.dynCall_vijiii = P.jB)(b, c, g, d, f, h, k)),
      me = (a.dynCall_iiji = (b, c, g, d, f) =>
        (me = a.dynCall_iiji = P.kB)(b, c, g, d, f)),
      ne = (a.dynCall_iijiiii = (b, c, g, d, f, h, k, l) =>
        (ne = a.dynCall_iijiiii = P.lB)(b, c, g, d, f, h, k, l)),
      oe = (a.dynCall_iijii = (b, c, g, d, f, h) =>
        (oe = a.dynCall_iijii = P.mB)(b, c, g, d, f, h)),
      pe = (a.dynCall_viiiij = (b, c, g, d, f, h, k) =>
        (pe = a.dynCall_viiiij = P.nB)(b, c, g, d, f, h, k)),
      qe = (a.dynCall_iiiiiiij = (b, c, g, d, f, h, k, l, p) =>
        (qe = a.dynCall_iiiiiiij = P.oB)(b, c, g, d, f, h, k, l, p)),
      re = (a.dynCall_iijiiiij = (b, c, g, d, f, h, k, l, p, t) =>
        (re = a.dynCall_iijiiiij = P.pB)(b, c, g, d, f, h, k, l, p, t)),
      se = (a.dynCall_jiji = (b, c, g, d, f) =>
        (se = a.dynCall_jiji = P.qB)(b, c, g, d, f)),
      te = (a.dynCall_iiijj = (b, c, g, d, f, h, k) =>
        (te = a.dynCall_iiijj = P.rB)(b, c, g, d, f, h, k)),
      ue = (a.dynCall_viiiji = (b, c, g, d, f, h, k) =>
        (ue = a.dynCall_viiiji = P.sB)(b, c, g, d, f, h, k)),
      ve = (a.dynCall_viijii = (b, c, g, d, f, h, k) =>
        (ve = a.dynCall_viijii = P.tB)(b, c, g, d, f, h, k));
    function hd(b, c, g) {
      var d = Q();
      try {
        L(b)(c, g);
      } catch (f) {
        T(d);
        if (f !== f + 0) throw f;
        N(1, 0);
      }
    }
    function Bc(b, c, g) {
      var d = Q();
      try {
        return L(b)(c, g);
      } catch (f) {
        T(d);
        if (f !== f + 0) throw f;
        N(1, 0);
      }
    }
    function zc(b, c) {
      var g = Q();
      try {
        return L(b)(c);
      } catch (d) {
        T(g);
        if (d !== d + 0) throw d;
        N(1, 0);
      }
    }
    function Cc(b, c, g, d) {
      var f = Q();
      try {
        return L(b)(c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function kd(b, c, g, d, f) {
      var h = Q();
      try {
        L(b)(c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function dd(b) {
      var c = Q();
      try {
        L(b)();
      } catch (g) {
        T(c);
        if (g !== g + 0) throw g;
        N(1, 0);
      }
    }
    function jd(b, c, g, d) {
      var f = Q();
      try {
        L(b)(c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function ed(b, c) {
      var g = Q();
      try {
        L(b)(c);
      } catch (d) {
        T(g);
        if (d !== d + 0) throw d;
        N(1, 0);
      }
    }
    function Dc(b, c, g, d, f) {
      var h = Q();
      try {
        return L(b)(c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function ld(b, c, g, d, f, h) {
      var k = Q();
      try {
        L(b)(c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Gc(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return L(b)(c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function gd(b, c, g, d) {
      var f = Q();
      try {
        L(b)(c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function yc(b) {
      var c = Q();
      try {
        return L(b)();
      } catch (g) {
        T(c);
        if (g !== g + 0) throw g;
        N(1, 0);
      }
    }
    function od(b, c, g, d, f, h, k, l, p) {
      var t = Q();
      try {
        L(b)(c, g, d, f, h, k, l, p);
      } catch (r) {
        T(t);
        if (r !== r + 0) throw r;
        N(1, 0);
      }
    }
    function Fc(b, c, g, d, f, h) {
      var k = Q();
      try {
        return L(b)(c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function fd(b, c, g) {
      var d = Q();
      try {
        L(b)(c, g);
      } catch (f) {
        T(d);
        if (f !== f + 0) throw f;
        N(1, 0);
      }
    }
    function Ac(b, c, g) {
      var d = Q();
      try {
        return L(b)(c, g);
      } catch (f) {
        T(d);
        if (f !== f + 0) throw f;
        N(1, 0);
      }
    }
    function Ic(b, c, g, d, f, h, k, l, p) {
      var t = Q();
      try {
        return L(b)(c, g, d, f, h, k, l, p);
      } catch (r) {
        T(t);
        if (r !== r + 0) throw r;
        N(1, 0);
      }
    }
    function md(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        L(b)(c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function nd(b, c, g, d, f, h, k, l) {
      var p = Q();
      try {
        L(b)(c, g, d, f, h, k, l);
      } catch (t) {
        T(p);
        if (t !== t + 0) throw t;
        N(1, 0);
      }
    }
    function Hc(b, c, g, d, f, h, k, l) {
      var p = Q();
      try {
        return L(b)(c, g, d, f, h, k, l);
      } catch (t) {
        T(p);
        if (t !== t + 0) throw t;
        N(1, 0);
      }
    }
    function Ec(b, c, g, d, f, h) {
      var k = Q();
      try {
        return L(b)(c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Jc(b, c, g, d, f, h, k, l, p, t, r, y) {
      var E = Q();
      try {
        return L(b)(c, g, d, f, h, k, l, p, t, r, y);
      } catch (n) {
        T(E);
        if (n !== n + 0) throw n;
        N(1, 0);
      }
    }
    function pd(b, c, g, d, f, h, k, l, p, t, r) {
      var y = Q();
      try {
        L(b)(c, g, d, f, h, k, l, p, t, r);
      } catch (E) {
        T(y);
        if (E !== E + 0) throw E;
        N(1, 0);
      }
    }
    function qd(b, c, g, d, f, h, k, l, p, t, r, y, E, n, C, A) {
      var H = Q();
      try {
        L(b)(c, g, d, f, h, k, l, p, t, r, y, E, n, C, A);
      } catch (O) {
        T(H);
        if (O !== O + 0) throw O;
        N(1, 0);
      }
    }
    function xd(b, c, g, d, f, h) {
      var k = Q();
      try {
        Rd(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function wd(b, c, g, d, f) {
      var h = Q();
      try {
        Nd(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function Mc(b, c, g, d, f) {
      var h = Q();
      try {
        return Qd(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function Bd(b, c, g, d) {
      var f = Q();
      try {
        Ud(b, c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function Pc(b, c, g, d) {
      var f = Q();
      try {
        return Od(b, c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function ud(b, c, g, d, f, h) {
      var k = Q();
      try {
        Pd(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Zc(b, c) {
      var g = Q();
      try {
        return ae(b, c);
      } catch (d) {
        T(g);
        if (d !== d + 0) throw d;
        N(1, 0);
      }
    }
    function Wc(b, c, g, d, f, h) {
      var k = Q();
      try {
        return Vd(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Vc(b, c, g, d) {
      var f = Q();
      try {
        return Wd(b, c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    function Ad(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        be(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Gd(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        ce(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function vd(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        ue(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function yd(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        ve(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function zd(b, c, g, d, f, h, k, l, p, t, r) {
      var y = Q();
      try {
        de(b, c, g, d, f, h, k, l, p, t, r);
      } catch (E) {
        T(y);
        if (E !== E + 0) throw E;
        N(1, 0);
      }
    }
    function Fd(b, c, g, d, f, h, k, l, p, t) {
      var r = Q();
      try {
        ee(b, c, g, d, f, h, k, l, p, t);
      } catch (y) {
        T(r);
        if (y !== y + 0) throw y;
        N(1, 0);
      }
    }
    function bd(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return fe(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Qc(b, c, g, d, f) {
      var h = Q();
      try {
        return me(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function cd(b, c, g, d, f) {
      var h = Q();
      try {
        return se(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function Dd(b, c, g, d, f, h) {
      var k = Q();
      try {
        ke(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Cd(b, c, g, d, f) {
      var h = Q();
      try {
        ge(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function Oc(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return te(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function rd(b, c, g, d, f, h, k, l) {
      var p = Q();
      try {
        Yd(b, c, g, d, f, h, k, l);
      } catch (t) {
        T(p);
        if (t !== t + 0) throw t;
        N(1, 0);
      }
    }
    function $c(b, c, g) {
      var d = Q();
      try {
        return Sd(b, c, g);
      } catch (f) {
        T(d);
        if (f !== f + 0) throw f;
        N(1, 0);
      }
    }
    function Hd(b, c, g, d, f) {
      var h = Q();
      try {
        Td(b, c, g, d, f);
      } catch (k) {
        T(h);
        if (k !== k + 0) throw k;
        N(1, 0);
      }
    }
    function Xc(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return he(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Uc(b, c, g, d, f, h) {
      var k = Q();
      try {
        return $d(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function Nc(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return Zd(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Ed(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        le(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Sc(b, c, g, d, f, h, k, l) {
      var p = Q();
      try {
        return ne(b, c, g, d, f, h, k, l);
      } catch (t) {
        T(p);
        if (t !== t + 0) throw t;
        N(1, 0);
      }
    }
    function Rc(b, c, g, d, f, h) {
      var k = Q();
      try {
        return oe(b, c, g, d, f, h);
      } catch (l) {
        T(k);
        if (l !== l + 0) throw l;
        N(1, 0);
      }
    }
    function sd(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        pe(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function Kc(b, c, g, d, f, h, k, l, p) {
      var t = Q();
      try {
        return qe(b, c, g, d, f, h, k, l, p);
      } catch (r) {
        T(t);
        if (r !== r + 0) throw r;
        N(1, 0);
      }
    }
    function Tc(b, c, g, d, f, h, k, l, p, t) {
      var r = Q();
      try {
        return re(b, c, g, d, f, h, k, l, p, t);
      } catch (y) {
        T(r);
        if (y !== y + 0) throw y;
        N(1, 0);
      }
    }
    function Yc(b) {
      var c = Q();
      try {
        return je(b);
      } catch (g) {
        T(c);
        if (g !== g + 0) throw g;
        N(1, 0);
      }
    }
    function Lc(b, c, g, d, f, h, k) {
      var l = Q();
      try {
        return Xd(b, c, g, d, f, h, k);
      } catch (p) {
        T(l);
        if (p !== p + 0) throw p;
        N(1, 0);
      }
    }
    function ad(b, c, g, d) {
      var f = Q();
      try {
        return ie(b, c, g, d);
      } catch (h) {
        T(f);
        if (h !== h + 0) throw h;
        N(1, 0);
      }
    }
    a.addRunDependency = Da;
    a.removeRunDependency = Ea;
    a.FS_createPath = dc;
    a.FS_createLazyFile = gc;
    a.FS_createDevice = K;
    a.stringToAscii = nc;
    a.FS_createPreloadedFile = xb;
    a.FS_createDataFile = wb;
    a.FS_unlink = Vb;
    a.allocateUTF8OnStack = uc;
    var we;
    Ca = function xe() {
      we || ye();
      we || (Ca = xe);
    };
    function ye() {
      function b() {
        if (!we && ((we = !0), (a.calledRun = !0), !sa)) {
          ya = !0;
          a.noFSInit ||
            cc ||
            ((cc = !0),
            bc(),
            (a.stdin = a.stdin),
            (a.stdout = a.stdout),
            (a.stderr = a.stderr),
            a.stdin
              ? K('/dev', 'stdin', a.stdin)
              : Ub('/dev/tty', '/dev/stdin'),
            a.stdout
              ? K('/dev', 'stdout', null, a.stdout)
              : Ub('/dev/tty', '/dev/stdout'),
            a.stderr
              ? K('/dev', 'stderr', null, a.stderr)
              : Ub('/dev/tty1', '/dev/stderr'),
            Xb('/dev/stdin', 0),
            Xb('/dev/stdout', 1),
            Xb('/dev/stderr', 1));
          Eb = !1;
          Pa(wa);
          ea(a);
          if (a.onRuntimeInitialized) a.onRuntimeInitialized();
          if (a.postRun)
            for (
              'function' == typeof a.postRun && (a.postRun = [a.postRun]);
              a.postRun.length;

            ) {
              var c = a.postRun.shift();
              xa.unshift(c);
            }
          Pa(xa);
        }
      }
      if (!(0 < Aa)) {
        if (a.preRun)
          for (
            'function' == typeof a.preRun && (a.preRun = [a.preRun]);
            a.preRun.length;

          )
            za();
        Pa(va);
        0 < Aa ||
          (a.setStatus
            ? (a.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  a.setStatus('');
                }, 1);
                b();
              }, 1))
            : b());
      }
    }
    if (a.preInit)
      for (
        'function' == typeof a.preInit && (a.preInit = [a.preInit]);
        0 < a.preInit.length;

      )
        a.preInit.pop()();
    ye();
    function U(b) {
      try {
        var c = Q();
        return b();
      } finally {
        T(c);
      }
    }
    function V(b) {
      return b ? uc(b) : 0;
    }
    function W(b) {
      const c = M(b.length << 2);
      w.set(b, c >>> 2);
      return c;
    }
    function ze(b) {
      const c = M(b.length);
      u.set(b, c);
      return c;
    }
    function Ae() {
      [
        ['none', 'None'],
        ['i32', 'Int32'],
        ['i64', 'Int64'],
        ['f32', 'Float32'],
        ['f64', 'Float64'],
        ['v128', 'Vec128'],
        ['funcref', 'Funcref'],
        ['externref', 'Externref'],
        ['anyref', 'Anyref'],
        ['eqref', 'Eqref'],
        ['i31ref', 'I31ref'],
        ['structref', 'Structref'],
        ['stringref', 'Stringref'],
        ['stringview_wtf8', 'StringviewWTF8'],
        ['stringview_wtf16', 'StringviewWTF16'],
        ['stringview_iter', 'StringviewIter'],
        ['unreachable', 'Unreachable'],
        ['auto', 'Auto'],
      ].forEach((b) => {
        a[b[0]] = a['_BinaryenType' + b[1]]();
      });
      a.ExpressionIds = {};
      'Invalid Block If Loop Break Switch Call CallIndirect LocalGet LocalSet GlobalGet GlobalSet Load Store Const Unary Binary Select Drop Return MemorySize MemoryGrow Nop Unreachable AtomicCmpxchg AtomicRMW AtomicWait AtomicNotify AtomicFence SIMDExtract SIMDReplace SIMDShuffle SIMDTernary SIMDShift SIMDLoad SIMDLoadStoreLane MemoryInit DataDrop MemoryCopy MemoryFill RefNull RefIsNull RefFunc RefEq TableGet TableSet TableSize TableGrow Try Throw Rethrow TupleMake TupleExtract Pop RefI31 I31Get CallRef RefTest RefCast BrOn StructNew StructGet StructSet ArrayNew ArrayNewFixed ArrayGet ArraySet ArrayLen ArrayCopy RefAs StringNew StringConst StringMeasure StringEncode StringConcat StringEq StringAs StringWTF8Advance StringWTF16Get StringIterNext StringIterMove StringSliceWTF StringSliceIter'
        .split(' ')
        .forEach((b) => {
          a.ExpressionIds[b] = a[b + 'Id'] = a['_Binaryen' + b + 'Id']();
        });
      a.ExternalKinds = {};
      ['Function', 'Table', 'Memory', 'Global', 'Tag'].forEach((b) => {
        a.ExternalKinds[b] = a['External' + b] = a['_BinaryenExternal' + b]();
      });
      a.Features = {};
      'MVP Atomics BulkMemory MutableGlobals NontrappingFPToInt SignExt SIMD128 ExceptionHandling TailCall ReferenceTypes Multivalue GC Memory64 RelaxedSIMD ExtendedConst Strings MultiMemory All'
        .split(' ')
        .forEach((b) => {
          a.Features[b] = a['_BinaryenFeature' + b]();
        });
      a.Operations = {};
      'ClzInt32 CtzInt32 PopcntInt32 NegFloat32 AbsFloat32 CeilFloat32 FloorFloat32 TruncFloat32 NearestFloat32 SqrtFloat32 EqZInt32 ClzInt64 CtzInt64 PopcntInt64 NegFloat64 AbsFloat64 CeilFloat64 FloorFloat64 TruncFloat64 NearestFloat64 SqrtFloat64 EqZInt64 ExtendSInt32 ExtendUInt32 WrapInt64 TruncSFloat32ToInt32 TruncSFloat32ToInt64 TruncUFloat32ToInt32 TruncUFloat32ToInt64 TruncSFloat64ToInt32 TruncSFloat64ToInt64 TruncUFloat64ToInt32 TruncUFloat64ToInt64 TruncSatSFloat32ToInt32 TruncSatSFloat32ToInt64 TruncSatUFloat32ToInt32 TruncSatUFloat32ToInt64 TruncSatSFloat64ToInt32 TruncSatSFloat64ToInt64 TruncSatUFloat64ToInt32 TruncSatUFloat64ToInt64 ReinterpretFloat32 ReinterpretFloat64 ConvertSInt32ToFloat32 ConvertSInt32ToFloat64 ConvertUInt32ToFloat32 ConvertUInt32ToFloat64 ConvertSInt64ToFloat32 ConvertSInt64ToFloat64 ConvertUInt64ToFloat32 ConvertUInt64ToFloat64 PromoteFloat32 DemoteFloat64 ReinterpretInt32 ReinterpretInt64 ExtendS8Int32 ExtendS16Int32 ExtendS8Int64 ExtendS16Int64 ExtendS32Int64 AddInt32 SubInt32 MulInt32 DivSInt32 DivUInt32 RemSInt32 RemUInt32 AndInt32 OrInt32 XorInt32 ShlInt32 ShrUInt32 ShrSInt32 RotLInt32 RotRInt32 EqInt32 NeInt32 LtSInt32 LtUInt32 LeSInt32 LeUInt32 GtSInt32 GtUInt32 GeSInt32 GeUInt32 AddInt64 SubInt64 MulInt64 DivSInt64 DivUInt64 RemSInt64 RemUInt64 AndInt64 OrInt64 XorInt64 ShlInt64 ShrUInt64 ShrSInt64 RotLInt64 RotRInt64 EqInt64 NeInt64 LtSInt64 LtUInt64 LeSInt64 LeUInt64 GtSInt64 GtUInt64 GeSInt64 GeUInt64 AddFloat32 SubFloat32 MulFloat32 DivFloat32 CopySignFloat32 MinFloat32 MaxFloat32 EqFloat32 NeFloat32 LtFloat32 LeFloat32 GtFloat32 GeFloat32 AddFloat64 SubFloat64 MulFloat64 DivFloat64 CopySignFloat64 MinFloat64 MaxFloat64 EqFloat64 NeFloat64 LtFloat64 LeFloat64 GtFloat64 GeFloat64 AtomicRMWAdd AtomicRMWSub AtomicRMWAnd AtomicRMWOr AtomicRMWXor AtomicRMWXchg SplatVecI8x16 ExtractLaneSVecI8x16 ExtractLaneUVecI8x16 ReplaceLaneVecI8x16 SplatVecI16x8 ExtractLaneSVecI16x8 ExtractLaneUVecI16x8 ReplaceLaneVecI16x8 SplatVecI32x4 ExtractLaneVecI32x4 ReplaceLaneVecI32x4 SplatVecI64x2 ExtractLaneVecI64x2 ReplaceLaneVecI64x2 SplatVecF32x4 ExtractLaneVecF32x4 ReplaceLaneVecF32x4 SplatVecF64x2 ExtractLaneVecF64x2 ReplaceLaneVecF64x2 EqVecI8x16 NeVecI8x16 LtSVecI8x16 LtUVecI8x16 GtSVecI8x16 GtUVecI8x16 LeSVecI8x16 LeUVecI8x16 GeSVecI8x16 GeUVecI8x16 EqVecI16x8 NeVecI16x8 LtSVecI16x8 LtUVecI16x8 GtSVecI16x8 GtUVecI16x8 LeSVecI16x8 LeUVecI16x8 GeSVecI16x8 GeUVecI16x8 EqVecI32x4 NeVecI32x4 LtSVecI32x4 LtUVecI32x4 GtSVecI32x4 GtUVecI32x4 LeSVecI32x4 LeUVecI32x4 GeSVecI32x4 GeUVecI32x4 EqVecI64x2 NeVecI64x2 LtSVecI64x2 GtSVecI64x2 LeSVecI64x2 GeSVecI64x2 EqVecF32x4 NeVecF32x4 LtVecF32x4 GtVecF32x4 LeVecF32x4 GeVecF32x4 EqVecF64x2 NeVecF64x2 LtVecF64x2 GtVecF64x2 LeVecF64x2 GeVecF64x2 NotVec128 AndVec128 OrVec128 XorVec128 AndNotVec128 BitselectVec128 RelaxedFmaVecF32x4 RelaxedFmsVecF32x4 RelaxedFmaVecF64x2 RelaxedFmsVecF64x2 LaneselectI8x16 LaneselectI16x8 LaneselectI32x4 LaneselectI64x2 DotI8x16I7x16AddSToVecI32x4 AnyTrueVec128 PopcntVecI8x16 AbsVecI8x16 NegVecI8x16 AllTrueVecI8x16 BitmaskVecI8x16 ShlVecI8x16 ShrSVecI8x16 ShrUVecI8x16 AddVecI8x16 AddSatSVecI8x16 AddSatUVecI8x16 SubVecI8x16 SubSatSVecI8x16 SubSatUVecI8x16 MinSVecI8x16 MinUVecI8x16 MaxSVecI8x16 MaxUVecI8x16 AvgrUVecI8x16 AbsVecI16x8 NegVecI16x8 AllTrueVecI16x8 BitmaskVecI16x8 ShlVecI16x8 ShrSVecI16x8 ShrUVecI16x8 AddVecI16x8 AddSatSVecI16x8 AddSatUVecI16x8 SubVecI16x8 SubSatSVecI16x8 SubSatUVecI16x8 MulVecI16x8 MinSVecI16x8 MinUVecI16x8 MaxSVecI16x8 MaxUVecI16x8 AvgrUVecI16x8 Q15MulrSatSVecI16x8 ExtMulLowSVecI16x8 ExtMulHighSVecI16x8 ExtMulLowUVecI16x8 ExtMulHighUVecI16x8 DotSVecI16x8ToVecI32x4 ExtMulLowSVecI32x4 ExtMulHighSVecI32x4 ExtMulLowUVecI32x4 ExtMulHighUVecI32x4 AbsVecI32x4 NegVecI32x4 AllTrueVecI32x4 BitmaskVecI32x4 ShlVecI32x4 ShrSVecI32x4 ShrUVecI32x4 AddVecI32x4 SubVecI32x4 MulVecI32x4 MinSVecI32x4 MinUVecI32x4 MaxSVecI32x4 MaxUVecI32x4 AbsVecI64x2 NegVecI64x2 AllTrueVecI64x2 BitmaskVecI64x2 ShlVecI64x2 ShrSVecI64x2 ShrUVecI64x2 AddVecI64x2 SubVecI64x2 MulVecI64x2 ExtMulLowSVecI64x2 ExtMulHighSVecI64x2 ExtMulLowUVecI64x2 ExtMulHighUVecI64x2 AbsVecF32x4 NegVecF32x4 SqrtVecF32x4 AddVecF32x4 SubVecF32x4 MulVecF32x4 DivVecF32x4 MinVecF32x4 MaxVecF32x4 PMinVecF32x4 PMaxVecF32x4 CeilVecF32x4 FloorVecF32x4 TruncVecF32x4 NearestVecF32x4 AbsVecF64x2 NegVecF64x2 SqrtVecF64x2 AddVecF64x2 SubVecF64x2 MulVecF64x2 DivVecF64x2 MinVecF64x2 MaxVecF64x2 PMinVecF64x2 PMaxVecF64x2 CeilVecF64x2 FloorVecF64x2 TruncVecF64x2 NearestVecF64x2 ExtAddPairwiseSVecI8x16ToI16x8 ExtAddPairwiseUVecI8x16ToI16x8 ExtAddPairwiseSVecI16x8ToI32x4 ExtAddPairwiseUVecI16x8ToI32x4 TruncSatSVecF32x4ToVecI32x4 TruncSatUVecF32x4ToVecI32x4 ConvertSVecI32x4ToVecF32x4 ConvertUVecI32x4ToVecF32x4 Load8SplatVec128 Load16SplatVec128 Load32SplatVec128 Load64SplatVec128 Load8x8SVec128 Load8x8UVec128 Load16x4SVec128 Load16x4UVec128 Load32x2SVec128 Load32x2UVec128 Load32ZeroVec128 Load64ZeroVec128 Load8LaneVec128 Load16LaneVec128 Load32LaneVec128 Load64LaneVec128 Store8LaneVec128 Store16LaneVec128 Store32LaneVec128 Store64LaneVec128 NarrowSVecI16x8ToVecI8x16 NarrowUVecI16x8ToVecI8x16 NarrowSVecI32x4ToVecI16x8 NarrowUVecI32x4ToVecI16x8 ExtendLowSVecI8x16ToVecI16x8 ExtendHighSVecI8x16ToVecI16x8 ExtendLowUVecI8x16ToVecI16x8 ExtendHighUVecI8x16ToVecI16x8 ExtendLowSVecI16x8ToVecI32x4 ExtendHighSVecI16x8ToVecI32x4 ExtendLowUVecI16x8ToVecI32x4 ExtendHighUVecI16x8ToVecI32x4 ExtendLowSVecI32x4ToVecI64x2 ExtendHighSVecI32x4ToVecI64x2 ExtendLowUVecI32x4ToVecI64x2 ExtendHighUVecI32x4ToVecI64x2 ConvertLowSVecI32x4ToVecF64x2 ConvertLowUVecI32x4ToVecF64x2 TruncSatZeroSVecF64x2ToVecI32x4 TruncSatZeroUVecF64x2ToVecI32x4 DemoteZeroVecF64x2ToVecF32x4 PromoteLowVecF32x4ToVecF64x2 RelaxedTruncSVecF32x4ToVecI32x4 RelaxedTruncUVecF32x4ToVecI32x4 RelaxedTruncZeroSVecF64x2ToVecI32x4 RelaxedTruncZeroUVecF64x2ToVecI32x4 SwizzleVecI8x16 RelaxedSwizzleVecI8x16 RelaxedMinVecF32x4 RelaxedMaxVecF32x4 RelaxedMinVecF64x2 RelaxedMaxVecF64x2 RelaxedQ15MulrSVecI16x8 DotI8x16I7x16SToVecI16x8 RefAsNonNull RefAsExternInternalize RefAsExternExternalize BrOnNull BrOnNonNull BrOnCast BrOnCastFail StringNewUTF8 StringNewWTF8 StringNewLossyUTF8 StringNewWTF16 StringNewUTF8Array StringNewWTF8Array StringNewLossyUTF8Array StringNewWTF16Array StringNewFromCodePoint StringMeasureUTF8 StringMeasureWTF8 StringMeasureWTF16 StringMeasureIsUSV StringMeasureWTF16View StringEncodeUTF8 StringEncodeLossyUTF8 StringEncodeWTF8 StringEncodeWTF16 StringEncodeUTF8Array StringEncodeLossyUTF8Array StringEncodeWTF8Array StringEncodeWTF16Array StringAsWTF8 StringAsWTF16 StringAsIter StringIterMoveAdvance StringIterMoveRewind StringSliceWTF8 StringSliceWTF16 StringEqEqual StringEqCompare'
        .split(' ')
        .forEach((b) => {
          a.Operations[b] = a[b] = a['_Binaryen' + b]();
        });
      a.SideEffects = {};
      'None Branches Calls ReadsLocal WritesLocal ReadsGlobal WritesGlobal ReadsMemory WritesMemory ReadsTable WritesTable ImplicitTrap IsAtomic Throws DanglingPop TrapsNeverHappen Any'
        .split(' ')
        .forEach((b) => {
          a.SideEffects[b] = a['_BinaryenSideEffect' + b]();
        });
      a.ExpressionRunner.Flags = {
        Default: a._ExpressionRunnerFlagsDefault(),
        PreserveSideeffects: a._ExpressionRunnerFlagsPreserveSideeffects(),
        TraverseCalls: a._ExpressionRunnerFlagsTraverseCalls(),
      };
    }
    a.Module = function (b) {
      !b || q();
      Be(a._BinaryenModuleCreate(), this);
    };
    function Be(b, c = {}) {
      b || q();
      c.ptr = b;
      const g = Kd();
      c.block = function (d, f, h) {
        return U(() =>
          a._BinaryenBlock(
            b,
            d ? V(d) : 0,
            W(f),
            f.length,
            'undefined' !== typeof h ? h : a.none,
          ),
        );
      };
      c['if'] = function (d, f, h) {
        return a._BinaryenIf(b, d, f, h);
      };
      c.loop = function (d, f) {
        return U(() => a._BinaryenLoop(b, V(d), f));
      };
      c['break'] = c.br = function (d, f, h) {
        return U(() => a._BinaryenBreak(b, V(d), f, h));
      };
      c.br_if = function (d, f, h) {
        return c.br(d, f, h);
      };
      c['switch'] = function (d, f, h, k) {
        return U(() => a._BinaryenSwitch(b, W(d.map(V)), d.length, V(f), h, k));
      };
      c.call = function (d, f, h) {
        return U(() => a._BinaryenCall(b, V(d), W(f), f.length, h));
      };
      c.callIndirect = c.call_indirect = function (d, f, h, k, l) {
        return U(() =>
          a._BinaryenCallIndirect(b, V(d), f, W(h), h.length, k, l),
        );
      };
      c.returnCall = c.return_call = function (d, f, h) {
        return U(() => a._BinaryenReturnCall(b, V(d), W(f), f.length, h));
      };
      c.returnCallIndirect = c.return_call_indirect = function (d, f, h, k, l) {
        return U(() =>
          a._BinaryenReturnCallIndirect(b, V(d), f, W(h), h.length, k, l),
        );
      };
      c.local = {
        get: function (d, f) {
          return a._BinaryenLocalGet(b, d, f);
        },
        set: function (d, f) {
          return a._BinaryenLocalSet(b, d, f);
        },
        tee: function (d, f, h) {
          if ('undefined' === typeof h)
            throw Error("local.tee's type should be defined");
          return a._BinaryenLocalTee(b, d, f, h);
        },
      };
      c.global = {
        get: function (d, f) {
          return a._BinaryenGlobalGet(b, V(d), f);
        },
        set: function (d, f) {
          return a._BinaryenGlobalSet(b, V(d), f);
        },
      };
      c.table = {
        get: function (d, f, h) {
          return a._BinaryenTableGet(b, V(d), f, h);
        },
        set: function (d, f, h) {
          return a._BinaryenTableSet(b, V(d), f, h);
        },
        size: function (d) {
          return a._BinaryenTableSize(b, V(d));
        },
        grow: function (d, f, h) {
          return a._BinaryenTableGrow(b, V(d), f, h);
        },
      };
      c.memory = {
        size: function (d, f) {
          return a._BinaryenMemorySize(b, V(d), f);
        },
        grow: function (d, f, h) {
          return a._BinaryenMemoryGrow(b, d, V(f), h);
        },
        init: function (d, f, h, k, l) {
          return U(() => a._BinaryenMemoryInit(b, V(d), f, h, k, V(l)));
        },
        copy: function (d, f, h, k, l) {
          return a._BinaryenMemoryCopy(b, d, f, h, V(k), V(l));
        },
        fill: function (d, f, h, k) {
          return a._BinaryenMemoryFill(b, d, f, h, V(k));
        },
        atomic: {
          notify: function (d, f, h) {
            return a._BinaryenAtomicNotify(b, d, f, V(h));
          },
          wait32: function (d, f, h, k) {
            return a._BinaryenAtomicWait(b, d, f, h, a.i32, V(k));
          },
          wait64: function (d, f, h, k) {
            return a._BinaryenAtomicWait(b, d, f, h, a.i64, V(k));
          },
        },
      };
      c.data = {
        drop: function (d) {
          return U(() => a._BinaryenDataDrop(b, V(d)));
        },
      };
      c.i32 = {
        load: function (d, f, h, k) {
          return a._BinaryenLoad(b, 4, !0, d, f, a.i32, h, V(k));
        },
        load8_s: function (d, f, h, k) {
          return a._BinaryenLoad(b, 1, !0, d, f, a.i32, h, V(k));
        },
        load8_u: function (d, f, h, k) {
          return a._BinaryenLoad(b, 1, !1, d, f, a.i32, h, V(k));
        },
        load16_s: function (d, f, h, k) {
          return a._BinaryenLoad(b, 2, !0, d, f, a.i32, h, V(k));
        },
        load16_u: function (d, f, h, k) {
          return a._BinaryenLoad(b, 2, !1, d, f, a.i32, h, V(k));
        },
        store: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 4, d, f, h, k, a.i32, V(l));
        },
        store8: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 1, d, f, h, k, a.i32, V(l));
        },
        store16: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 2, d, f, h, k, a.i32, V(l));
        },
        ['const'](d) {
          return U(() => {
            const f = M(g);
            a._BinaryenLiteralInt32(f, d);
            return a._BinaryenConst(b, f);
          });
        },
        clz: function (d) {
          return a._BinaryenUnary(b, a.ClzInt32, d);
        },
        ctz: function (d) {
          return a._BinaryenUnary(b, a.CtzInt32, d);
        },
        popcnt: function (d) {
          return a._BinaryenUnary(b, a.PopcntInt32, d);
        },
        eqz: function (d) {
          return a._BinaryenUnary(b, a.EqZInt32, d);
        },
        trunc_s: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSFloat32ToInt32, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSFloat64ToInt32, d);
          },
        },
        trunc_u: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncUFloat32ToInt32, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncUFloat64ToInt32, d);
          },
        },
        trunc_s_sat: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSatSFloat32ToInt32, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSatSFloat64ToInt32, d);
          },
        },
        trunc_u_sat: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSatUFloat32ToInt32, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSatUFloat64ToInt32, d);
          },
        },
        reinterpret: function (d) {
          return a._BinaryenUnary(b, a.ReinterpretFloat32, d);
        },
        extend8_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendS8Int32, d);
        },
        extend16_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendS16Int32, d);
        },
        wrap: function (d) {
          return a._BinaryenUnary(b, a.WrapInt64, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddInt32, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubInt32, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulInt32, d, f);
        },
        div_s: function (d, f) {
          return a._BinaryenBinary(b, a.DivSInt32, d, f);
        },
        div_u: function (d, f) {
          return a._BinaryenBinary(b, a.DivUInt32, d, f);
        },
        rem_s: function (d, f) {
          return a._BinaryenBinary(b, a.RemSInt32, d, f);
        },
        rem_u: function (d, f) {
          return a._BinaryenBinary(b, a.RemUInt32, d, f);
        },
        and: function (d, f) {
          return a._BinaryenBinary(b, a.AndInt32, d, f);
        },
        or: function (d, f) {
          return a._BinaryenBinary(b, a.OrInt32, d, f);
        },
        xor: function (d, f) {
          return a._BinaryenBinary(b, a.XorInt32, d, f);
        },
        shl: function (d, f) {
          return a._BinaryenBinary(b, a.ShlInt32, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenBinary(b, a.ShrUInt32, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenBinary(b, a.ShrSInt32, d, f);
        },
        rotl: function (d, f) {
          return a._BinaryenBinary(b, a.RotLInt32, d, f);
        },
        rotr: function (d, f) {
          return a._BinaryenBinary(b, a.RotRInt32, d, f);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqInt32, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeInt32, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSInt32, d, f);
        },
        lt_u: function (d, f) {
          return a._BinaryenBinary(b, a.LtUInt32, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSInt32, d, f);
        },
        le_u: function (d, f) {
          return a._BinaryenBinary(b, a.LeUInt32, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSInt32, d, f);
        },
        gt_u: function (d, f) {
          return a._BinaryenBinary(b, a.GtUInt32, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSInt32, d, f);
        },
        ge_u: function (d, f) {
          return a._BinaryenBinary(b, a.GeUInt32, d, f);
        },
        atomic: {
          load: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 4, d, a.i32, f, V(h));
          },
          load8_u: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 1, d, a.i32, f, V(h));
          },
          load16_u: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 2, d, a.i32, f, V(h));
          },
          store: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 4, d, f, h, a.i32, V(k));
          },
          store8: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 1, d, f, h, a.i32, V(k));
          },
          store16: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 2, d, f, h, a.i32, V(k));
          },
          rmw: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                4,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 4, d, f, h, k, a.i32, V(l));
            },
          },
          rmw8_u: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                1,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 1, d, f, h, k, a.i32, V(l));
            },
          },
          rmw16_u: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                2,
                d,
                f,
                h,
                a.i32,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 2, d, f, h, k, a.i32, V(l));
            },
          },
        },
        pop: function () {
          return a._BinaryenPop(b, a.i32);
        },
      };
      c.i64 = {
        load: function (d, f, h, k) {
          return a._BinaryenLoad(b, 8, !0, d, f, a.i64, h, V(k));
        },
        load8_s: function (d, f, h, k) {
          return a._BinaryenLoad(b, 1, !0, d, f, a.i64, h, V(k));
        },
        load8_u: function (d, f, h, k) {
          return a._BinaryenLoad(b, 1, !1, d, f, a.i64, h, V(k));
        },
        load16_s: function (d, f, h, k) {
          return a._BinaryenLoad(b, 2, !0, d, f, a.i64, h, V(k));
        },
        load16_u: function (d, f, h, k) {
          return a._BinaryenLoad(b, 2, !1, d, f, a.i64, h, V(k));
        },
        load32_s: function (d, f, h, k) {
          return a._BinaryenLoad(b, 4, !0, d, f, a.i64, h, V(k));
        },
        load32_u: function (d, f, h, k) {
          return a._BinaryenLoad(b, 4, !1, d, f, a.i64, h, V(k));
        },
        store: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 8, d, f, h, k, a.i64, V(l));
        },
        store8: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 1, d, f, h, k, a.i64, V(l));
        },
        store16: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 2, d, f, h, k, a.i64, V(l));
        },
        store32: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 4, d, f, h, k, a.i64, V(l));
        },
        ['const'](d, f) {
          return U(() => {
            const h = M(g);
            a._BinaryenLiteralInt64(h, d, f);
            return a._BinaryenConst(b, h);
          });
        },
        clz: function (d) {
          return a._BinaryenUnary(b, a.ClzInt64, d);
        },
        ctz: function (d) {
          return a._BinaryenUnary(b, a.CtzInt64, d);
        },
        popcnt: function (d) {
          return a._BinaryenUnary(b, a.PopcntInt64, d);
        },
        eqz: function (d) {
          return a._BinaryenUnary(b, a.EqZInt64, d);
        },
        trunc_s: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSFloat32ToInt64, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSFloat64ToInt64, d);
          },
        },
        trunc_u: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncUFloat32ToInt64, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncUFloat64ToInt64, d);
          },
        },
        trunc_s_sat: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSatSFloat32ToInt64, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSatSFloat64ToInt64, d);
          },
        },
        trunc_u_sat: {
          f32: function (d) {
            return a._BinaryenUnary(b, a.TruncSatUFloat32ToInt64, d);
          },
          f64: function (d) {
            return a._BinaryenUnary(b, a.TruncSatUFloat64ToInt64, d);
          },
        },
        reinterpret: function (d) {
          return a._BinaryenUnary(b, a.ReinterpretFloat64, d);
        },
        extend8_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendS8Int64, d);
        },
        extend16_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendS16Int64, d);
        },
        extend32_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendS32Int64, d);
        },
        extend_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendSInt32, d);
        },
        extend_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendUInt32, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddInt64, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubInt64, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulInt64, d, f);
        },
        div_s: function (d, f) {
          return a._BinaryenBinary(b, a.DivSInt64, d, f);
        },
        div_u: function (d, f) {
          return a._BinaryenBinary(b, a.DivUInt64, d, f);
        },
        rem_s: function (d, f) {
          return a._BinaryenBinary(b, a.RemSInt64, d, f);
        },
        rem_u: function (d, f) {
          return a._BinaryenBinary(b, a.RemUInt64, d, f);
        },
        and: function (d, f) {
          return a._BinaryenBinary(b, a.AndInt64, d, f);
        },
        or: function (d, f) {
          return a._BinaryenBinary(b, a.OrInt64, d, f);
        },
        xor: function (d, f) {
          return a._BinaryenBinary(b, a.XorInt64, d, f);
        },
        shl: function (d, f) {
          return a._BinaryenBinary(b, a.ShlInt64, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenBinary(b, a.ShrUInt64, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenBinary(b, a.ShrSInt64, d, f);
        },
        rotl: function (d, f) {
          return a._BinaryenBinary(b, a.RotLInt64, d, f);
        },
        rotr: function (d, f) {
          return a._BinaryenBinary(b, a.RotRInt64, d, f);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqInt64, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeInt64, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSInt64, d, f);
        },
        lt_u: function (d, f) {
          return a._BinaryenBinary(b, a.LtUInt64, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSInt64, d, f);
        },
        le_u: function (d, f) {
          return a._BinaryenBinary(b, a.LeUInt64, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSInt64, d, f);
        },
        gt_u: function (d, f) {
          return a._BinaryenBinary(b, a.GtUInt64, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSInt64, d, f);
        },
        ge_u: function (d, f) {
          return a._BinaryenBinary(b, a.GeUInt64, d, f);
        },
        atomic: {
          load: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 8, d, a.i64, f, V(h));
          },
          load8_u: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 1, d, a.i64, f, V(h));
          },
          load16_u: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 2, d, a.i64, f, V(h));
          },
          load32_u: function (d, f, h) {
            return a._BinaryenAtomicLoad(b, 4, d, a.i64, f, V(h));
          },
          store: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 8, d, f, h, a.i64, V(k));
          },
          store8: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 1, d, f, h, a.i64, V(k));
          },
          store16: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 2, d, f, h, a.i64, V(k));
          },
          store32: function (d, f, h, k) {
            return a._BinaryenAtomicStore(b, 4, d, f, h, a.i64, V(k));
          },
          rmw: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                8,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 8, d, f, h, k, a.i64, V(l));
            },
          },
          rmw8_u: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                1,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 1, d, f, h, k, a.i64, V(l));
            },
          },
          rmw16_u: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                2,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 2, d, f, h, k, a.i64, V(l));
            },
          },
          rmw32_u: {
            add: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAdd,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            sub: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWSub,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            and: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWAnd,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            or: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWOr,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xor: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXor,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            xchg: function (d, f, h, k) {
              return a._BinaryenAtomicRMW(
                b,
                a.AtomicRMWXchg,
                4,
                d,
                f,
                h,
                a.i64,
                V(k),
              );
            },
            cmpxchg: function (d, f, h, k, l) {
              return a._BinaryenAtomicCmpxchg(b, 4, d, f, h, k, a.i64, V(l));
            },
          },
        },
        pop: function () {
          return a._BinaryenPop(b, a.i64);
        },
      };
      c.f32 = {
        load: function (d, f, h, k) {
          return a._BinaryenLoad(b, 4, !0, d, f, a.f32, h, V(k));
        },
        store: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 4, d, f, h, k, a.f32, V(l));
        },
        ['const'](d) {
          return U(() => {
            const f = M(g);
            a._BinaryenLiteralFloat32(f, d);
            return a._BinaryenConst(b, f);
          });
        },
        const_bits: function (d) {
          return U(() => {
            const f = M(g);
            a._BinaryenLiteralFloat32Bits(f, d);
            return a._BinaryenConst(b, f);
          });
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegFloat32, d);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsFloat32, d);
        },
        ceil: function (d) {
          return a._BinaryenUnary(b, a.CeilFloat32, d);
        },
        floor: function (d) {
          return a._BinaryenUnary(b, a.FloorFloat32, d);
        },
        trunc: function (d) {
          return a._BinaryenUnary(b, a.TruncFloat32, d);
        },
        nearest: function (d) {
          return a._BinaryenUnary(b, a.NearestFloat32, d);
        },
        sqrt: function (d) {
          return a._BinaryenUnary(b, a.SqrtFloat32, d);
        },
        reinterpret: function (d) {
          return a._BinaryenUnary(b, a.ReinterpretInt32, d);
        },
        convert_s: {
          i32: function (d) {
            return a._BinaryenUnary(b, a.ConvertSInt32ToFloat32, d);
          },
          i64: function (d) {
            return a._BinaryenUnary(b, a.ConvertSInt64ToFloat32, d);
          },
        },
        convert_u: {
          i32: function (d) {
            return a._BinaryenUnary(b, a.ConvertUInt32ToFloat32, d);
          },
          i64: function (d) {
            return a._BinaryenUnary(b, a.ConvertUInt64ToFloat32, d);
          },
        },
        demote: function (d) {
          return a._BinaryenUnary(b, a.DemoteFloat64, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddFloat32, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubFloat32, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulFloat32, d, f);
        },
        div: function (d, f) {
          return a._BinaryenBinary(b, a.DivFloat32, d, f);
        },
        copysign: function (d, f) {
          return a._BinaryenBinary(b, a.CopySignFloat32, d, f);
        },
        min: function (d, f) {
          return a._BinaryenBinary(b, a.MinFloat32, d, f);
        },
        max: function (d, f) {
          return a._BinaryenBinary(b, a.MaxFloat32, d, f);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqFloat32, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeFloat32, d, f);
        },
        lt: function (d, f) {
          return a._BinaryenBinary(b, a.LtFloat32, d, f);
        },
        le: function (d, f) {
          return a._BinaryenBinary(b, a.LeFloat32, d, f);
        },
        gt: function (d, f) {
          return a._BinaryenBinary(b, a.GtFloat32, d, f);
        },
        ge: function (d, f) {
          return a._BinaryenBinary(b, a.GeFloat32, d, f);
        },
        pop: function () {
          return a._BinaryenPop(b, a.f32);
        },
      };
      c.f64 = {
        load: function (d, f, h, k) {
          return a._BinaryenLoad(b, 8, !0, d, f, a.f64, h, V(k));
        },
        store: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 8, d, f, h, k, a.f64, V(l));
        },
        ['const'](d) {
          return U(() => {
            const f = M(g);
            a._BinaryenLiteralFloat64(f, d);
            return a._BinaryenConst(b, f);
          });
        },
        const_bits: function (d, f) {
          return U(() => {
            const h = M(g);
            a._BinaryenLiteralFloat64Bits(h, d, f);
            return a._BinaryenConst(b, h);
          });
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegFloat64, d);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsFloat64, d);
        },
        ceil: function (d) {
          return a._BinaryenUnary(b, a.CeilFloat64, d);
        },
        floor: function (d) {
          return a._BinaryenUnary(b, a.FloorFloat64, d);
        },
        trunc: function (d) {
          return a._BinaryenUnary(b, a.TruncFloat64, d);
        },
        nearest: function (d) {
          return a._BinaryenUnary(b, a.NearestFloat64, d);
        },
        sqrt: function (d) {
          return a._BinaryenUnary(b, a.SqrtFloat64, d);
        },
        reinterpret: function (d) {
          return a._BinaryenUnary(b, a.ReinterpretInt64, d);
        },
        convert_s: {
          i32: function (d) {
            return a._BinaryenUnary(b, a.ConvertSInt32ToFloat64, d);
          },
          i64: function (d) {
            return a._BinaryenUnary(b, a.ConvertSInt64ToFloat64, d);
          },
        },
        convert_u: {
          i32: function (d) {
            return a._BinaryenUnary(b, a.ConvertUInt32ToFloat64, d);
          },
          i64: function (d) {
            return a._BinaryenUnary(b, a.ConvertUInt64ToFloat64, d);
          },
        },
        promote: function (d) {
          return a._BinaryenUnary(b, a.PromoteFloat32, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddFloat64, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubFloat64, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulFloat64, d, f);
        },
        div: function (d, f) {
          return a._BinaryenBinary(b, a.DivFloat64, d, f);
        },
        copysign: function (d, f) {
          return a._BinaryenBinary(b, a.CopySignFloat64, d, f);
        },
        min: function (d, f) {
          return a._BinaryenBinary(b, a.MinFloat64, d, f);
        },
        max: function (d, f) {
          return a._BinaryenBinary(b, a.MaxFloat64, d, f);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqFloat64, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeFloat64, d, f);
        },
        lt: function (d, f) {
          return a._BinaryenBinary(b, a.LtFloat64, d, f);
        },
        le: function (d, f) {
          return a._BinaryenBinary(b, a.LeFloat64, d, f);
        },
        gt: function (d, f) {
          return a._BinaryenBinary(b, a.GtFloat64, d, f);
        },
        ge: function (d, f) {
          return a._BinaryenBinary(b, a.GeFloat64, d, f);
        },
        pop: function () {
          return a._BinaryenPop(b, a.f64);
        },
      };
      c.v128 = {
        load: function (d, f, h, k) {
          return a._BinaryenLoad(b, 16, !1, d, f, a.v128, h, V(k));
        },
        load8_splat: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load8SplatVec128, d, f, h, V(k));
        },
        load16_splat: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load16SplatVec128, d, f, h, V(k));
        },
        load32_splat: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load32SplatVec128, d, f, h, V(k));
        },
        load64_splat: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load64SplatVec128, d, f, h, V(k));
        },
        load8x8_s: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load8x8SVec128, d, f, h, V(k));
        },
        load8x8_u: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load8x8UVec128, d, f, h, V(k));
        },
        load16x4_s: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load16x4SVec128, d, f, h, V(k));
        },
        load16x4_u: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load16x4UVec128, d, f, h, V(k));
        },
        load32x2_s: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load32x2SVec128, d, f, h, V(k));
        },
        load32x2_u: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load32x2UVec128, d, f, h, V(k));
        },
        load32_zero: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load32ZeroVec128, d, f, h, V(k));
        },
        load64_zero: function (d, f, h, k) {
          return a._BinaryenSIMDLoad(b, a.Load64ZeroVec128, d, f, h, V(k));
        },
        load8_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Load8LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        load16_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Load16LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        load32_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Load32LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        load64_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Load64LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        store8_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Store8LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        store16_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Store16LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        store32_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Store32LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        store64_lane: function (d, f, h, k, l, p) {
          return a._BinaryenSIMDLoadStoreLane(
            b,
            a.Store64LaneVec128,
            d,
            f,
            h,
            k,
            l,
            V(p),
          );
        },
        store: function (d, f, h, k, l) {
          return a._BinaryenStore(b, 16, d, f, h, k, a.v128, V(l));
        },
        ['const'](d) {
          return U(() => {
            const f = M(g);
            a._BinaryenLiteralVec128(f, ze(d));
            return a._BinaryenConst(b, f);
          });
        },
        not: function (d) {
          return a._BinaryenUnary(b, a.NotVec128, d);
        },
        any_true: function (d) {
          return a._BinaryenUnary(b, a.AnyTrueVec128, d);
        },
        and: function (d, f) {
          return a._BinaryenBinary(b, a.AndVec128, d, f);
        },
        or: function (d, f) {
          return a._BinaryenBinary(b, a.OrVec128, d, f);
        },
        xor: function (d, f) {
          return a._BinaryenBinary(b, a.XorVec128, d, f);
        },
        andnot: function (d, f) {
          return a._BinaryenBinary(b, a.AndNotVec128, d, f);
        },
        bitselect: function (d, f, h) {
          return a._BinaryenSIMDTernary(b, a.BitselectVec128, d, f, h);
        },
        pop: function () {
          return a._BinaryenPop(b, a.v128);
        },
      };
      c.i8x16 = {
        shuffle: function (d, f, h) {
          return U(() => a._BinaryenSIMDShuffle(b, d, f, ze(h)));
        },
        swizzle: function (d, f) {
          return a._BinaryenBinary(b, a.SwizzleVecI8x16, d, f);
        },
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecI8x16, d);
        },
        extract_lane_s: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneSVecI8x16, d, f);
        },
        extract_lane_u: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneUVecI8x16, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecI8x16, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecI8x16, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecI8x16, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSVecI8x16, d, f);
        },
        lt_u: function (d, f) {
          return a._BinaryenBinary(b, a.LtUVecI8x16, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSVecI8x16, d, f);
        },
        gt_u: function (d, f) {
          return a._BinaryenBinary(b, a.GtUVecI8x16, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSVecI8x16, d, f);
        },
        le_u: function (d, f) {
          return a._BinaryenBinary(b, a.LeUVecI8x16, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSVecI8x16, d, f);
        },
        ge_u: function (d, f) {
          return a._BinaryenBinary(b, a.GeUVecI8x16, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecI8x16, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecI8x16, d);
        },
        all_true: function (d) {
          return a._BinaryenUnary(b, a.AllTrueVecI8x16, d);
        },
        bitmask: function (d) {
          return a._BinaryenUnary(b, a.BitmaskVecI8x16, d);
        },
        popcnt: function (d) {
          return a._BinaryenUnary(b, a.PopcntVecI8x16, d);
        },
        shl: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShlVecI8x16, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrSVecI8x16, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrUVecI8x16, d, f);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecI8x16, d, f);
        },
        add_saturate_s: function (d, f) {
          return a._BinaryenBinary(b, a.AddSatSVecI8x16, d, f);
        },
        add_saturate_u: function (d, f) {
          return a._BinaryenBinary(b, a.AddSatUVecI8x16, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecI8x16, d, f);
        },
        sub_saturate_s: function (d, f) {
          return a._BinaryenBinary(b, a.SubSatSVecI8x16, d, f);
        },
        sub_saturate_u: function (d, f) {
          return a._BinaryenBinary(b, a.SubSatUVecI8x16, d, f);
        },
        min_s: function (d, f) {
          return a._BinaryenBinary(b, a.MinSVecI8x16, d, f);
        },
        min_u: function (d, f) {
          return a._BinaryenBinary(b, a.MinUVecI8x16, d, f);
        },
        max_s: function (d, f) {
          return a._BinaryenBinary(b, a.MaxSVecI8x16, d, f);
        },
        max_u: function (d, f) {
          return a._BinaryenBinary(b, a.MaxUVecI8x16, d, f);
        },
        avgr_u: function (d, f) {
          return a._BinaryenBinary(b, a.AvgrUVecI8x16, d, f);
        },
        narrow_i16x8_s: function (d, f) {
          return a._BinaryenBinary(b, a.NarrowSVecI16x8ToVecI8x16, d, f);
        },
        narrow_i16x8_u: function (d, f) {
          return a._BinaryenBinary(b, a.NarrowUVecI16x8ToVecI8x16, d, f);
        },
      };
      c.i16x8 = {
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecI16x8, d);
        },
        extract_lane_s: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneSVecI16x8, d, f);
        },
        extract_lane_u: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneUVecI16x8, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecI16x8, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecI16x8, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecI16x8, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSVecI16x8, d, f);
        },
        lt_u: function (d, f) {
          return a._BinaryenBinary(b, a.LtUVecI16x8, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSVecI16x8, d, f);
        },
        gt_u: function (d, f) {
          return a._BinaryenBinary(b, a.GtUVecI16x8, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSVecI16x8, d, f);
        },
        le_u: function (d, f) {
          return a._BinaryenBinary(b, a.LeUVecI16x8, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSVecI16x8, d, f);
        },
        ge_u: function (d, f) {
          return a._BinaryenBinary(b, a.GeUVecI16x8, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecI16x8, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecI16x8, d);
        },
        all_true: function (d) {
          return a._BinaryenUnary(b, a.AllTrueVecI16x8, d);
        },
        bitmask: function (d) {
          return a._BinaryenUnary(b, a.BitmaskVecI16x8, d);
        },
        shl: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShlVecI16x8, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrSVecI16x8, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrUVecI16x8, d, f);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecI16x8, d, f);
        },
        add_saturate_s: function (d, f) {
          return a._BinaryenBinary(b, a.AddSatSVecI16x8, d, f);
        },
        add_saturate_u: function (d, f) {
          return a._BinaryenBinary(b, a.AddSatUVecI16x8, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecI16x8, d, f);
        },
        sub_saturate_s: function (d, f) {
          return a._BinaryenBinary(b, a.SubSatSVecI16x8, d, f);
        },
        sub_saturate_u: function (d, f) {
          return a._BinaryenBinary(b, a.SubSatUVecI16x8, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulVecI16x8, d, f);
        },
        min_s: function (d, f) {
          return a._BinaryenBinary(b, a.MinSVecI16x8, d, f);
        },
        min_u: function (d, f) {
          return a._BinaryenBinary(b, a.MinUVecI16x8, d, f);
        },
        max_s: function (d, f) {
          return a._BinaryenBinary(b, a.MaxSVecI16x8, d, f);
        },
        max_u: function (d, f) {
          return a._BinaryenBinary(b, a.MaxUVecI16x8, d, f);
        },
        avgr_u: function (d, f) {
          return a._BinaryenBinary(b, a.AvgrUVecI16x8, d, f);
        },
        q15mulr_sat_s: function (d, f) {
          return a._BinaryenBinary(b, a.Q15MulrSatSVecI16x8, d, f);
        },
        extmul_low_i8x16_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowSVecI16x8, d, f);
        },
        extmul_high_i8x16_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighSVecI16x8, d, f);
        },
        extmul_low_i8x16_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowUVecI16x8, d, f);
        },
        extmul_high_i8x16_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighUVecI16x8, d, f);
        },
        extadd_pairwise_i8x16_s: function (d) {
          return a._BinaryenUnary(b, a.ExtAddPairwiseSVecI8x16ToI16x8, d);
        },
        extadd_pairwise_i8x16_u: function (d) {
          return a._BinaryenUnary(b, a.ExtAddPairwiseUVecI8x16ToI16x8, d);
        },
        narrow_i32x4_s: function (d, f) {
          return a._BinaryenBinary(b, a.NarrowSVecI32x4ToVecI16x8, d, f);
        },
        narrow_i32x4_u: function (d, f) {
          return a._BinaryenBinary(b, a.NarrowUVecI32x4ToVecI16x8, d, f);
        },
        extend_low_i8x16_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowSVecI8x16ToVecI16x8, d);
        },
        extend_high_i8x16_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighSVecI8x16ToVecI16x8, d);
        },
        extend_low_i8x16_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowUVecI8x16ToVecI16x8, d);
        },
        extend_high_i8x16_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighUVecI8x16ToVecI16x8, d);
        },
      };
      c.i32x4 = {
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecI32x4, d);
        },
        extract_lane: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneVecI32x4, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecI32x4, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecI32x4, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecI32x4, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSVecI32x4, d, f);
        },
        lt_u: function (d, f) {
          return a._BinaryenBinary(b, a.LtUVecI32x4, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSVecI32x4, d, f);
        },
        gt_u: function (d, f) {
          return a._BinaryenBinary(b, a.GtUVecI32x4, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSVecI32x4, d, f);
        },
        le_u: function (d, f) {
          return a._BinaryenBinary(b, a.LeUVecI32x4, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSVecI32x4, d, f);
        },
        ge_u: function (d, f) {
          return a._BinaryenBinary(b, a.GeUVecI32x4, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecI32x4, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecI32x4, d);
        },
        all_true: function (d) {
          return a._BinaryenUnary(b, a.AllTrueVecI32x4, d);
        },
        bitmask: function (d) {
          return a._BinaryenUnary(b, a.BitmaskVecI32x4, d);
        },
        shl: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShlVecI32x4, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrSVecI32x4, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrUVecI32x4, d, f);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecI32x4, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecI32x4, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulVecI32x4, d, f);
        },
        min_s: function (d, f) {
          return a._BinaryenBinary(b, a.MinSVecI32x4, d, f);
        },
        min_u: function (d, f) {
          return a._BinaryenBinary(b, a.MinUVecI32x4, d, f);
        },
        max_s: function (d, f) {
          return a._BinaryenBinary(b, a.MaxSVecI32x4, d, f);
        },
        max_u: function (d, f) {
          return a._BinaryenBinary(b, a.MaxUVecI32x4, d, f);
        },
        dot_i16x8_s: function (d, f) {
          return a._BinaryenBinary(b, a.DotSVecI16x8ToVecI32x4, d, f);
        },
        extmul_low_i16x8_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowSVecI32x4, d, f);
        },
        extmul_high_i16x8_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighSVecI32x4, d, f);
        },
        extmul_low_i16x8_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowUVecI32x4, d, f);
        },
        extmul_high_i16x8_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighUVecI32x4, d, f);
        },
        extadd_pairwise_i16x8_s: function (d) {
          return a._BinaryenUnary(b, a.ExtAddPairwiseSVecI16x8ToI32x4, d);
        },
        extadd_pairwise_i16x8_u: function (d) {
          return a._BinaryenUnary(b, a.ExtAddPairwiseUVecI16x8ToI32x4, d);
        },
        trunc_sat_f32x4_s: function (d) {
          return a._BinaryenUnary(b, a.TruncSatSVecF32x4ToVecI32x4, d);
        },
        trunc_sat_f32x4_u: function (d) {
          return a._BinaryenUnary(b, a.TruncSatUVecF32x4ToVecI32x4, d);
        },
        extend_low_i16x8_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowSVecI16x8ToVecI32x4, d);
        },
        extend_high_i16x8_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighSVecI16x8ToVecI32x4, d);
        },
        extend_low_i16x8_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowUVecI16x8ToVecI32x4, d);
        },
        extend_high_i16x8_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighUVecI16x8ToVecI32x4, d);
        },
        trunc_sat_f64x2_s_zero: function (d) {
          return a._BinaryenUnary(b, a.TruncSatZeroSVecF64x2ToVecI32x4, d);
        },
        trunc_sat_f64x2_u_zero: function (d) {
          return a._BinaryenUnary(b, a.TruncSatZeroUVecF64x2ToVecI32x4, d);
        },
      };
      c.i64x2 = {
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecI64x2, d);
        },
        extract_lane: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneVecI64x2, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecI64x2, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecI64x2, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecI64x2, d, f);
        },
        lt_s: function (d, f) {
          return a._BinaryenBinary(b, a.LtSVecI64x2, d, f);
        },
        gt_s: function (d, f) {
          return a._BinaryenBinary(b, a.GtSVecI64x2, d, f);
        },
        le_s: function (d, f) {
          return a._BinaryenBinary(b, a.LeSVecI64x2, d, f);
        },
        ge_s: function (d, f) {
          return a._BinaryenBinary(b, a.GeSVecI64x2, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecI64x2, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecI64x2, d);
        },
        all_true: function (d) {
          return a._BinaryenUnary(b, a.AllTrueVecI64x2, d);
        },
        bitmask: function (d) {
          return a._BinaryenUnary(b, a.BitmaskVecI64x2, d);
        },
        shl: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShlVecI64x2, d, f);
        },
        shr_s: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrSVecI64x2, d, f);
        },
        shr_u: function (d, f) {
          return a._BinaryenSIMDShift(b, a.ShrUVecI64x2, d, f);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecI64x2, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecI64x2, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulVecI64x2, d, f);
        },
        extmul_low_i32x4_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowSVecI64x2, d, f);
        },
        extmul_high_i32x4_s: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighSVecI64x2, d, f);
        },
        extmul_low_i32x4_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulLowUVecI64x2, d, f);
        },
        extmul_high_i32x4_u: function (d, f) {
          return a._BinaryenBinary(b, a.ExtMulHighUVecI64x2, d, f);
        },
        extend_low_i32x4_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowSVecI32x4ToVecI64x2, d);
        },
        extend_high_i32x4_s: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighSVecI32x4ToVecI64x2, d);
        },
        extend_low_i32x4_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendLowUVecI32x4ToVecI64x2, d);
        },
        extend_high_i32x4_u: function (d) {
          return a._BinaryenUnary(b, a.ExtendHighUVecI32x4ToVecI64x2, d);
        },
      };
      c.f32x4 = {
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecF32x4, d);
        },
        extract_lane: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneVecF32x4, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecF32x4, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecF32x4, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecF32x4, d, f);
        },
        lt: function (d, f) {
          return a._BinaryenBinary(b, a.LtVecF32x4, d, f);
        },
        gt: function (d, f) {
          return a._BinaryenBinary(b, a.GtVecF32x4, d, f);
        },
        le: function (d, f) {
          return a._BinaryenBinary(b, a.LeVecF32x4, d, f);
        },
        ge: function (d, f) {
          return a._BinaryenBinary(b, a.GeVecF32x4, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecF32x4, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecF32x4, d);
        },
        sqrt: function (d) {
          return a._BinaryenUnary(b, a.SqrtVecF32x4, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecF32x4, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecF32x4, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulVecF32x4, d, f);
        },
        div: function (d, f) {
          return a._BinaryenBinary(b, a.DivVecF32x4, d, f);
        },
        min: function (d, f) {
          return a._BinaryenBinary(b, a.MinVecF32x4, d, f);
        },
        max: function (d, f) {
          return a._BinaryenBinary(b, a.MaxVecF32x4, d, f);
        },
        pmin: function (d, f) {
          return a._BinaryenBinary(b, a.PMinVecF32x4, d, f);
        },
        pmax: function (d, f) {
          return a._BinaryenBinary(b, a.PMaxVecF32x4, d, f);
        },
        ceil: function (d) {
          return a._BinaryenUnary(b, a.CeilVecF32x4, d);
        },
        floor: function (d) {
          return a._BinaryenUnary(b, a.FloorVecF32x4, d);
        },
        trunc: function (d) {
          return a._BinaryenUnary(b, a.TruncVecF32x4, d);
        },
        nearest: function (d) {
          return a._BinaryenUnary(b, a.NearestVecF32x4, d);
        },
        convert_i32x4_s: function (d) {
          return a._BinaryenUnary(b, a.ConvertSVecI32x4ToVecF32x4, d);
        },
        convert_i32x4_u: function (d) {
          return a._BinaryenUnary(b, a.ConvertUVecI32x4ToVecF32x4, d);
        },
        demote_f64x2_zero: function (d) {
          return a._BinaryenUnary(b, a.DemoteZeroVecF64x2ToVecF32x4, d);
        },
      };
      c.f64x2 = {
        splat: function (d) {
          return a._BinaryenUnary(b, a.SplatVecF64x2, d);
        },
        extract_lane: function (d, f) {
          return a._BinaryenSIMDExtract(b, a.ExtractLaneVecF64x2, d, f);
        },
        replace_lane: function (d, f, h) {
          return a._BinaryenSIMDReplace(b, a.ReplaceLaneVecF64x2, d, f, h);
        },
        eq: function (d, f) {
          return a._BinaryenBinary(b, a.EqVecF64x2, d, f);
        },
        ne: function (d, f) {
          return a._BinaryenBinary(b, a.NeVecF64x2, d, f);
        },
        lt: function (d, f) {
          return a._BinaryenBinary(b, a.LtVecF64x2, d, f);
        },
        gt: function (d, f) {
          return a._BinaryenBinary(b, a.GtVecF64x2, d, f);
        },
        le: function (d, f) {
          return a._BinaryenBinary(b, a.LeVecF64x2, d, f);
        },
        ge: function (d, f) {
          return a._BinaryenBinary(b, a.GeVecF64x2, d, f);
        },
        abs: function (d) {
          return a._BinaryenUnary(b, a.AbsVecF64x2, d);
        },
        neg: function (d) {
          return a._BinaryenUnary(b, a.NegVecF64x2, d);
        },
        sqrt: function (d) {
          return a._BinaryenUnary(b, a.SqrtVecF64x2, d);
        },
        add: function (d, f) {
          return a._BinaryenBinary(b, a.AddVecF64x2, d, f);
        },
        sub: function (d, f) {
          return a._BinaryenBinary(b, a.SubVecF64x2, d, f);
        },
        mul: function (d, f) {
          return a._BinaryenBinary(b, a.MulVecF64x2, d, f);
        },
        div: function (d, f) {
          return a._BinaryenBinary(b, a.DivVecF64x2, d, f);
        },
        min: function (d, f) {
          return a._BinaryenBinary(b, a.MinVecF64x2, d, f);
        },
        max: function (d, f) {
          return a._BinaryenBinary(b, a.MaxVecF64x2, d, f);
        },
        pmin: function (d, f) {
          return a._BinaryenBinary(b, a.PMinVecF64x2, d, f);
        },
        pmax: function (d, f) {
          return a._BinaryenBinary(b, a.PMaxVecF64x2, d, f);
        },
        ceil: function (d) {
          return a._BinaryenUnary(b, a.CeilVecF64x2, d);
        },
        floor: function (d) {
          return a._BinaryenUnary(b, a.FloorVecF64x2, d);
        },
        trunc: function (d) {
          return a._BinaryenUnary(b, a.TruncVecF64x2, d);
        },
        nearest: function (d) {
          return a._BinaryenUnary(b, a.NearestVecF64x2, d);
        },
        convert_low_i32x4_s: function (d) {
          return a._BinaryenUnary(b, a.ConvertLowSVecI32x4ToVecF64x2, d);
        },
        convert_low_i32x4_u: function (d) {
          return a._BinaryenUnary(b, a.ConvertLowUVecI32x4ToVecF64x2, d);
        },
        promote_low_f32x4: function (d) {
          return a._BinaryenUnary(b, a.PromoteLowVecF32x4ToVecF64x2, d);
        },
      };
      c.funcref = {
        pop: function () {
          return a._BinaryenPop(b, a.funcref);
        },
      };
      c.externref = {
        pop: function () {
          return a._BinaryenPop(b, a.externref);
        },
      };
      c.anyref = {
        pop: function () {
          return a._BinaryenPop(b, a.anyref);
        },
      };
      c.eqref = {
        pop: function () {
          return a._BinaryenPop(b, a.eqref);
        },
      };
      c.i31ref = {
        pop: function () {
          return a._BinaryenPop(b, a.i31ref);
        },
      };
      c.structref = {
        pop: function () {
          return a._BinaryenPop(b, a.structref);
        },
      };
      c.stringref = {
        pop: function () {
          return a._BinaryenPop(b, a.stringref);
        },
      };
      c.stringview_wtf8 = {
        pop: function () {
          return a._BinaryenPop(b, a.stringview_wtf8);
        },
      };
      c.stringview_wtf16 = {
        pop: function () {
          return a._BinaryenPop(b, a.stringview_wtf16);
        },
      };
      c.stringview_iter = {
        pop: function () {
          return a._BinaryenPop(b, a.stringview_iter);
        },
      };
      c.ref = {
        ['null'](d) {
          return a._BinaryenRefNull(b, d);
        },
        is_null: function (d) {
          return a._BinaryenRefIsNull(b, d);
        },
        as_non_null: function (d) {
          return a._BinaryenRefAs(b, a.RefAsNonNull, d);
        },
        func: function (d, f) {
          return U(() => a._BinaryenRefFunc(b, V(d), f));
        },
        i31: function (d) {
          return a._BinaryenRefI31(b, d);
        },
        eq: function (d, f) {
          return a._BinaryenRefEq(b, d, f);
        },
      };
      c.select = function (d, f, h, k) {
        return a._BinaryenSelect(
          b,
          d,
          f,
          h,
          'undefined' !== typeof k ? k : a.auto,
        );
      };
      c.drop = function (d) {
        return a._BinaryenDrop(b, d);
      };
      c['return'] = function (d) {
        return a._BinaryenReturn(b, d);
      };
      c.nop = function () {
        return a._BinaryenNop(b);
      };
      c.unreachable = function () {
        return a._BinaryenUnreachable(b);
      };
      c.atomic = {
        fence: function () {
          return a._BinaryenAtomicFence(b);
        },
      };
      c['try'] = function (d, f, h, k, l) {
        return U(() =>
          a._BinaryenTry(
            b,
            d ? V(d) : 0,
            f,
            W(h.map(V)),
            h.length,
            W(k),
            k.length,
            l ? V(l) : 0,
          ),
        );
      };
      c['throw'] = function (d, f) {
        return U(() => a._BinaryenThrow(b, V(d), W(f), f.length));
      };
      c.rethrow = function (d) {
        return a._BinaryenRethrow(b, V(d));
      };
      c.tuple = {
        make: function (d) {
          return U(() => a._BinaryenTupleMake(b, W(d), d.length));
        },
        extract: function (d, f) {
          return a._BinaryenTupleExtract(b, d, f);
        },
      };
      c.i31 = {
        get_s: function (d) {
          return a._BinaryenI31Get(b, d, 1);
        },
        get_u: function (d) {
          return a._BinaryenI31Get(b, d, 0);
        },
      };
      c.addFunction = function (d, f, h, k, l) {
        return U(() =>
          a._BinaryenAddFunction(b, V(d), f, h, W(k), k.length, l),
        );
      };
      c.getFunction = function (d) {
        return U(() => a._BinaryenGetFunction(b, V(d)));
      };
      c.removeFunction = function (d) {
        return U(() => a._BinaryenRemoveFunction(b, V(d)));
      };
      c.addGlobal = function (d, f, h, k) {
        return U(() => a._BinaryenAddGlobal(b, V(d), f, h, k));
      };
      c.getGlobal = function (d) {
        return U(() => a._BinaryenGetGlobal(b, V(d)));
      };
      c.addTable = function (d, f, h, k = a._BinaryenTypeFuncref()) {
        return U(() => a._BinaryenAddTable(b, V(d), f, h, k));
      };
      c.getTable = function (d) {
        return U(() => a._BinaryenGetTable(b, V(d)));
      };
      c.addActiveElementSegment = function (d, f, h, k = c.i32['const'](0)) {
        return U(() =>
          a._BinaryenAddActiveElementSegment(
            b,
            V(d),
            V(f),
            W(h.map(V)),
            h.length,
            k,
          ),
        );
      };
      c.addPassiveElementSegment = function (d, f) {
        return U(() =>
          a._BinaryenAddPassiveElementSegment(b, V(d), W(f.map(V)), f.length),
        );
      };
      c.getElementSegment = function (d) {
        return U(() => a._BinaryenGetElementSegment(b, V(d)));
      };
      c.getTableSegments = function (d) {
        var f = a._BinaryenGetNumElementSegments(b);
        d = B(a._BinaryenTableGetName(d));
        for (var h = [], k = 0; k < f; k++) {
          var l = a._BinaryenGetElementSegmentByIndex(b, k),
            p = B(a._BinaryenElementSegmentGetTable(l));
          d === p && h.push(l);
        }
        return h;
      };
      c.removeGlobal = function (d) {
        return U(() => a._BinaryenRemoveGlobal(b, V(d)));
      };
      c.removeTable = function (d) {
        return U(() => a._BinaryenRemoveTable(b, V(d)));
      };
      c.removeElementSegment = function (d) {
        return U(() => a._BinaryenRemoveElementSegment(b, V(d)));
      };
      c.addTag = function (d, f, h) {
        return U(() => a._BinaryenAddTag(b, V(d), f, h));
      };
      c.getTag = function (d) {
        return U(() => a._BinaryenGetTag(b, V(d)));
      };
      c.removeTag = function (d) {
        return U(() => a._BinaryenRemoveTag(b, V(d)));
      };
      c.addFunctionImport = function (d, f, h, k, l) {
        return U(() => a._BinaryenAddFunctionImport(b, V(d), V(f), V(h), k, l));
      };
      c.addTableImport = function (d, f, h) {
        return U(() => a._BinaryenAddTableImport(b, V(d), V(f), V(h)));
      };
      c.addMemoryImport = function (d, f, h, k) {
        return U(() => a._BinaryenAddMemoryImport(b, V(d), V(f), V(h), k));
      };
      c.addGlobalImport = function (d, f, h, k, l) {
        return U(() => a._BinaryenAddGlobalImport(b, V(d), V(f), V(h), k, l));
      };
      c.addTagImport = function (d, f, h, k, l) {
        return U(() => a._BinaryenAddTagImport(b, V(d), V(f), V(h), k, l));
      };
      c.addExport = c.addFunctionExport = function (d, f) {
        return U(() => a._BinaryenAddFunctionExport(b, V(d), V(f)));
      };
      c.addTableExport = function (d, f) {
        return U(() => a._BinaryenAddTableExport(b, V(d), V(f)));
      };
      c.addMemoryExport = function (d, f) {
        return U(() => a._BinaryenAddMemoryExport(b, V(d), V(f)));
      };
      c.addGlobalExport = function (d, f) {
        return U(() => a._BinaryenAddGlobalExport(b, V(d), V(f)));
      };
      c.addTagExport = function (d, f) {
        return U(() => a._BinaryenAddTagExport(b, V(d), V(f)));
      };
      c.removeExport = function (d) {
        return U(() => a._BinaryenRemoveExport(b, V(d)));
      };
      c.setMemory = function (d, f, h, k = [], l = !1, p = !1, t = null) {
        return U(() => {
          const r = k.length,
            y = Array(r);
          var E = Array(r),
            n = Array(r);
          const C = Array(r);
          for (let A = 0; A < r; A++) {
            const { data: H, offset: O, passive: S } = k[A];
            y[A] = Jd(H.length);
            u.set(H, y[A]);
            E[A] = H.length;
            n[A] = S;
            C[A] = O;
          }
          E = a._BinaryenSetMemory(
            b,
            d,
            f,
            V(h),
            W(y),
            ze(n),
            W(C),
            W(E),
            r,
            l,
            p,
            V(t),
          );
          for (n = 0; n < r; n++) Md(y[n]);
          return E;
        });
      };
      c.hasMemory = function () {
        return !!a._BinaryenHasMemory(b);
      };
      c.getMemoryInfo = function (d) {
        var f = {
          module: B(a._BinaryenMemoryImportGetModule(b, V(d))),
          base: B(a._BinaryenMemoryImportGetBase(b, V(d))),
          initial: a._BinaryenMemoryGetInitial(b, V(d)),
          shared: !!a._BinaryenMemoryIsShared(b, V(d)),
          is64: !!a._BinaryenMemoryIs64(b, V(d)),
        };
        a._BinaryenMemoryHasMax(b, V(d)) &&
          (f.max = a._BinaryenMemoryGetMax(b, V(d)));
        return f;
      };
      c.getNumMemorySegments = function () {
        return a._BinaryenGetNumMemorySegments(b);
      };
      c.getMemorySegmentInfoByIndex = function (d) {
        const f = !!a._BinaryenGetMemorySegmentPassive(b, d);
        var h = null;
        f || (h = a._BinaryenGetMemorySegmentByteOffset(b, d));
        const k = a._BinaryenGetMemorySegmentByteLength(b, d),
          l = Jd(k);
        a._BinaryenCopyMemorySegmentData(b, d, l);
        d = new Uint8Array(k);
        d.set(u.subarray(l, l + k));
        Md(l);
        return { offset: h, data: d.buffer, passive: f };
      };
      c.setStart = function (d) {
        return a._BinaryenSetStart(b, d);
      };
      c.getFeatures = function () {
        return a._BinaryenModuleGetFeatures(b);
      };
      c.setFeatures = function (d) {
        a._BinaryenModuleSetFeatures(b, d);
      };
      c.addCustomSection = function (d, f) {
        return U(() => a._BinaryenAddCustomSection(b, V(d), ze(f), f.length));
      };
      c.getExport = function (d) {
        return U(() => a._BinaryenGetExport(b, V(d)));
      };
      c.getNumExports = function () {
        return a._BinaryenGetNumExports(b);
      };
      c.getExportByIndex = function (d) {
        return a._BinaryenGetExportByIndex(b, d);
      };
      c.getNumFunctions = function () {
        return a._BinaryenGetNumFunctions(b);
      };
      c.getFunctionByIndex = function (d) {
        return a._BinaryenGetFunctionByIndex(b, d);
      };
      c.getNumGlobals = function () {
        return a._BinaryenGetNumGlobals(b);
      };
      c.getNumTables = function () {
        return a._BinaryenGetNumTables(b);
      };
      c.getNumElementSegments = function () {
        return a._BinaryenGetNumElementSegments(b);
      };
      c.getGlobalByIndex = function (d) {
        return a._BinaryenGetGlobalByIndex(b, d);
      };
      c.getTableByIndex = function (d) {
        return a._BinaryenGetTableByIndex(b, d);
      };
      c.getElementSegmentByIndex = function (d) {
        return a._BinaryenGetElementSegmentByIndex(b, d);
      };
      c.emitText = function () {
        let d = a._BinaryenModuleAllocateAndWriteText(b),
          f = d ? z(v, d) : '';
        d && Md(d);
        return f;
      };
      c.emitStackIR = function (d) {
        let f = (d = a._BinaryenModuleAllocateAndWriteStackIR(b, d))
          ? z(v, d)
          : '';
        d && Md(d);
        return f;
      };
      c.emitAsmjs = function () {
        const d = m;
        let f = '';
        m = (h) => {
          f += h + '\n';
        };
        a._BinaryenModulePrintAsmjs(b);
        m = d;
        return f;
      };
      c.validate = function () {
        return a._BinaryenModuleValidate(b);
      };
      c.optimize = function () {
        return a._BinaryenModuleOptimize(b);
      };
      c.optimizeFunction = function (d) {
        'string' === typeof d && (d = c.getFunction(d));
        return a._BinaryenFunctionOptimize(d, b);
      };
      c.runPasses = function (d) {
        return U(() => a._BinaryenModuleRunPasses(b, W(d.map(V)), d.length));
      };
      c.runPassesOnFunction = function (d, f) {
        'string' === typeof d && (d = c.getFunction(d));
        return U(() =>
          a._BinaryenFunctionRunPasses(d, b, W(f.map(V)), f.length),
        );
      };
      c.autoDrop = function () {
        return a._BinaryenModuleAutoDrop(b);
      };
      c.dispose = function () {
        a._BinaryenModuleDispose(b);
      };
      c.emitBinary = function (d) {
        return U(() => {
          var f = M(Ld());
          a._BinaryenModuleAllocateAndWrite(f, b, V(d));
          const h = x[f >>> 2],
            k = x[(f >>> 2) + 1];
          f = x[(f >>> 2) + 2];
          try {
            const l = new Uint8Array(k);
            l.set(v.subarray(h, h + k));
            return 'undefined' === typeof d
              ? l
              : { binary: l, sourceMap: f ? z(v, f) : '' };
          } finally {
            Md(h), f && Md(f);
          }
        });
      };
      c.interpret = function () {
        return a._BinaryenModuleInterpret(b);
      };
      c.addDebugInfoFileName = function (d) {
        return U(() => a._BinaryenModuleAddDebugInfoFileName(b, V(d)));
      };
      c.getDebugInfoFileName = function (d) {
        return B(a._BinaryenModuleGetDebugInfoFileName(b, d));
      };
      c.setDebugLocation = function (d, f, h, k, l) {
        return a._BinaryenFunctionSetDebugLocation(d, f, h, k, l);
      };
      c.copyExpression = function (d) {
        return a._BinaryenExpressionCopy(d, b);
      };
      return c;
    }
    a.wrapModule = Be;
    a.Relooper = function (b) {
      (b && 'object' === typeof b && b.ptr && b.block && b['if']) || q();
      const c = a._RelooperCreate(b.ptr);
      this.ptr = c;
      this.addBlock = function (g) {
        return a._RelooperAddBlock(c, g);
      };
      this.addBranch = function (g, d, f, h) {
        return a._RelooperAddBranch(g, d, f, h);
      };
      this.addBlockWithSwitch = function (g, d) {
        return a._RelooperAddBlockWithSwitch(c, g, d);
      };
      this.addBranchForSwitch = function (g, d, f, h) {
        return U(() => a._RelooperAddBranchForSwitch(g, d, W(f), f.length, h));
      };
      this.renderAndDispose = function (g, d) {
        return a._RelooperRenderAndDispose(c, g, d);
      };
    };
    a.ExpressionRunner = function (b, c, g, d) {
      const f = a._ExpressionRunnerCreate(b.ptr, c, g, d);
      this.ptr = f;
      this.setLocalValue = function (h, k) {
        return !!a._ExpressionRunnerSetLocalValue(f, h, k);
      };
      this.setGlobalValue = function (h, k) {
        return U(() => !!a._ExpressionRunnerSetGlobalValue(f, V(h), k));
      };
      this.runAndDispose = function (h) {
        return a._ExpressionRunnerRunAndDispose(f, h);
      };
    };
    function X(b, c, g) {
      c = c(b);
      const d = Array(c);
      for (let f = 0; f < c; ++f) d[f] = g(b, f);
      return d;
    }
    function Ce(b, c, g, d, f, h) {
      const k = c.length;
      g = g(b);
      let l = 0;
      for (; l < k; ) l < g ? d(b, l, c[l]) : f(b, c[l]), ++l;
      for (; g > l; ) h(b, --g);
    }
    a.getExpressionId = function (b) {
      return a._BinaryenExpressionGetId(b);
    };
    a.getExpressionType = function (b) {
      return a._BinaryenExpressionGetType(b);
    };
    a.getExpressionInfo = function (b) {
      const c = a._BinaryenExpressionGetId(b),
        g = a._BinaryenExpressionGetType(b);
      switch (c) {
        case a.BlockId:
          return {
            id: c,
            type: g,
            name: B(a._BinaryenBlockGetName(b)),
            children: X(
              b,
              a._BinaryenBlockGetNumChildren,
              a._BinaryenBlockGetChildAt,
            ),
          };
        case a.IfId:
          return {
            id: c,
            type: g,
            condition: a._BinaryenIfGetCondition(b),
            ifTrue: a._BinaryenIfGetIfTrue(b),
            ifFalse: a._BinaryenIfGetIfFalse(b),
          };
        case a.LoopId:
          return {
            id: c,
            type: g,
            name: B(a._BinaryenLoopGetName(b)),
            body: a._BinaryenLoopGetBody(b),
          };
        case a.BreakId:
          return {
            id: c,
            type: g,
            name: B(a._BinaryenBreakGetName(b)),
            condition: a._BinaryenBreakGetCondition(b),
            value: a._BinaryenBreakGetValue(b),
          };
        case a.SwitchId:
          return {
            id: c,
            type: g,
            names: X(
              b,
              a._BinaryenSwitchGetNumNames,
              a._BinaryenSwitchGetNameAt,
            ).map((f) => (f ? z(v, f) : '')),
            defaultName: B(a._BinaryenSwitchGetDefaultName(b)),
            condition: a._BinaryenSwitchGetCondition(b),
            value: a._BinaryenSwitchGetValue(b),
          };
        case a.CallId:
          return {
            id: c,
            type: g,
            isReturn: !!a._BinaryenCallIsReturn(b),
            target: B(a._BinaryenCallGetTarget(b)),
            operands: X(
              b,
              a._BinaryenCallGetNumOperands,
              a._BinaryenCallGetOperandAt,
            ),
          };
        case a.CallIndirectId:
          return {
            id: c,
            type: g,
            isReturn: !!a._BinaryenCallIndirectIsReturn(b),
            target: a._BinaryenCallIndirectGetTarget(b),
            table: a._BinaryenCallIndirectGetTable(b),
            operands: X(
              b,
              a._BinaryenCallIndirectGetNumOperands,
              a._BinaryenCallIndirectGetOperandAt,
            ),
          };
        case a.LocalGetId:
          return { id: c, type: g, index: a._BinaryenLocalGetGetIndex(b) };
        case a.LocalSetId:
          return {
            id: c,
            type: g,
            isTee: !!a._BinaryenLocalSetIsTee(b),
            index: a._BinaryenLocalSetGetIndex(b),
            value: a._BinaryenLocalSetGetValue(b),
          };
        case a.GlobalGetId:
          return { id: c, type: g, name: B(a._BinaryenGlobalGetGetName(b)) };
        case a.GlobalSetId:
          return {
            id: c,
            type: g,
            name: B(a._BinaryenGlobalSetGetName(b)),
            value: a._BinaryenGlobalSetGetValue(b),
          };
        case a.TableGetId:
          return {
            id: c,
            type: g,
            table: B(a._BinaryenTableGetGetTable(b)),
            index: a._BinaryenTableGetGetIndex(b),
          };
        case a.TableSetId:
          return {
            id: c,
            type: g,
            table: B(a._BinaryenTableSetGetTable(b)),
            index: a._BinaryenTableSetGetIndex(b),
            value: a._BinaryenTableSetGetValue(b),
          };
        case a.TableSizeId:
          return { id: c, type: g, table: B(a._BinaryenTableSizeGetTable(b)) };
        case a.TableGrowId:
          return {
            id: c,
            type: g,
            table: B(a._BinaryenTableGrowGetTable(b)),
            value: a._BinaryenTableGrowGetValue(b),
            delta: a._BinaryenTableGrowGetDelta(b),
          };
        case a.LoadId:
          return {
            id: c,
            type: g,
            isAtomic: !!a._BinaryenLoadIsAtomic(b),
            isSigned: !!a._BinaryenLoadIsSigned(b),
            offset: a._BinaryenLoadGetOffset(b),
            bytes: a._BinaryenLoadGetBytes(b),
            align: a._BinaryenLoadGetAlign(b),
            ptr: a._BinaryenLoadGetPtr(b),
          };
        case a.StoreId:
          return {
            id: c,
            type: g,
            isAtomic: !!a._BinaryenStoreIsAtomic(b),
            offset: a._BinaryenStoreGetOffset(b),
            bytes: a._BinaryenStoreGetBytes(b),
            align: a._BinaryenStoreGetAlign(b),
            ptr: a._BinaryenStoreGetPtr(b),
            value: a._BinaryenStoreGetValue(b),
          };
        case a.ConstId:
          let d;
          switch (g) {
            case a.i32:
              d = a._BinaryenConstGetValueI32(b);
              break;
            case a.i64:
              d = {
                low: a._BinaryenConstGetValueI64Low(b),
                high: a._BinaryenConstGetValueI64High(b),
              };
              break;
            case a.f32:
              d = a._BinaryenConstGetValueF32(b);
              break;
            case a.f64:
              d = a._BinaryenConstGetValueF64(b);
              break;
            case a.v128:
              U(() => {
                const f = M(16);
                a._BinaryenConstGetValueV128(b, f);
                d = Array(16);
                for (let h = 0; 16 > h; h++) d[h] = v[f + h];
              });
              break;
            default:
              throw Error('unexpected type: ' + g);
          }
          return { id: c, type: g, value: d };
        case a.UnaryId:
          return {
            id: c,
            type: g,
            op: a._BinaryenUnaryGetOp(b),
            value: a._BinaryenUnaryGetValue(b),
          };
        case a.BinaryId:
          return {
            id: c,
            type: g,
            op: a._BinaryenBinaryGetOp(b),
            left: a._BinaryenBinaryGetLeft(b),
            right: a._BinaryenBinaryGetRight(b),
          };
        case a.SelectId:
          return {
            id: c,
            type: g,
            ifTrue: a._BinaryenSelectGetIfTrue(b),
            ifFalse: a._BinaryenSelectGetIfFalse(b),
            condition: a._BinaryenSelectGetCondition(b),
          };
        case a.DropId:
          return { id: c, type: g, value: a._BinaryenDropGetValue(b) };
        case a.ReturnId:
          return { id: c, type: g, value: a._BinaryenReturnGetValue(b) };
        case a.NopId:
        case a.UnreachableId:
        case a.PopId:
          return { id: c, type: g };
        case a.MemorySizeId:
          return { id: c, type: g };
        case a.MemoryGrowId:
          return { id: c, type: g, delta: a._BinaryenMemoryGrowGetDelta(b) };
        case a.AtomicRMWId:
          return {
            id: c,
            type: g,
            op: a._BinaryenAtomicRMWGetOp(b),
            bytes: a._BinaryenAtomicRMWGetBytes(b),
            offset: a._BinaryenAtomicRMWGetOffset(b),
            ptr: a._BinaryenAtomicRMWGetPtr(b),
            value: a._BinaryenAtomicRMWGetValue(b),
          };
        case a.AtomicCmpxchgId:
          return {
            id: c,
            type: g,
            bytes: a._BinaryenAtomicCmpxchgGetBytes(b),
            offset: a._BinaryenAtomicCmpxchgGetOffset(b),
            ptr: a._BinaryenAtomicCmpxchgGetPtr(b),
            expected: a._BinaryenAtomicCmpxchgGetExpected(b),
            replacement: a._BinaryenAtomicCmpxchgGetReplacement(b),
          };
        case a.AtomicWaitId:
          return {
            id: c,
            type: g,
            ptr: a._BinaryenAtomicWaitGetPtr(b),
            expected: a._BinaryenAtomicWaitGetExpected(b),
            timeout: a._BinaryenAtomicWaitGetTimeout(b),
            expectedType: a._BinaryenAtomicWaitGetExpectedType(b),
          };
        case a.AtomicNotifyId:
          return {
            id: c,
            type: g,
            ptr: a._BinaryenAtomicNotifyGetPtr(b),
            notifyCount: a._BinaryenAtomicNotifyGetNotifyCount(b),
          };
        case a.AtomicFenceId:
          return { id: c, type: g, order: a._BinaryenAtomicFenceGetOrder(b) };
        case a.SIMDExtractId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDExtractGetOp(b),
            vec: a._BinaryenSIMDExtractGetVec(b),
            index: a._BinaryenSIMDExtractGetIndex(b),
          };
        case a.SIMDReplaceId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDReplaceGetOp(b),
            vec: a._BinaryenSIMDReplaceGetVec(b),
            index: a._BinaryenSIMDReplaceGetIndex(b),
            value: a._BinaryenSIMDReplaceGetValue(b),
          };
        case a.SIMDShuffleId:
          return U(() => {
            const f = M(16);
            a._BinaryenSIMDShuffleGetMask(b, f);
            const h = Array(16);
            for (let k = 0; 16 > k; k++) h[k] = v[f + k];
            return {
              id: c,
              type: g,
              left: a._BinaryenSIMDShuffleGetLeft(b),
              right: a._BinaryenSIMDShuffleGetRight(b),
              mask: h,
            };
          });
        case a.SIMDTernaryId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDTernaryGetOp(b),
            a: a._BinaryenSIMDTernaryGetA(b),
            b: a._BinaryenSIMDTernaryGetB(b),
            c: a._BinaryenSIMDTernaryGetC(b),
          };
        case a.SIMDShiftId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDShiftGetOp(b),
            vec: a._BinaryenSIMDShiftGetVec(b),
            shift: a._BinaryenSIMDShiftGetShift(b),
          };
        case a.SIMDLoadId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDLoadGetOp(b),
            offset: a._BinaryenSIMDLoadGetOffset(b),
            align: a._BinaryenSIMDLoadGetAlign(b),
            ptr: a._BinaryenSIMDLoadGetPtr(b),
          };
        case a.SIMDLoadStoreLaneId:
          return {
            id: c,
            type: g,
            op: a._BinaryenSIMDLoadStoreLaneGetOp(b),
            offset: a._BinaryenSIMDLoadStoreLaneGetOffset(b),
            align: a._BinaryenSIMDLoadStoreLaneGetAlign(b),
            index: a._BinaryenSIMDLoadStoreLaneGetIndex(b),
            ptr: a._BinaryenSIMDLoadStoreLaneGetPtr(b),
            vec: a._BinaryenSIMDLoadStoreLaneGetVec(b),
          };
        case a.MemoryInitId:
          return {
            id: c,
            segment: B(a._BinaryenMemoryInitGetSegment(b)),
            dest: a._BinaryenMemoryInitGetDest(b),
            offset: a._BinaryenMemoryInitGetOffset(b),
            size: a._BinaryenMemoryInitGetSize(b),
          };
        case a.DataDropId:
          return { id: c, segment: B(a._BinaryenDataDropGetSegment(b)) };
        case a.MemoryCopyId:
          return {
            id: c,
            dest: a._BinaryenMemoryCopyGetDest(b),
            source: a._BinaryenMemoryCopyGetSource(b),
            size: a._BinaryenMemoryCopyGetSize(b),
          };
        case a.MemoryFillId:
          return {
            id: c,
            dest: a._BinaryenMemoryFillGetDest(b),
            value: a._BinaryenMemoryFillGetValue(b),
            size: a._BinaryenMemoryFillGetSize(b),
          };
        case a.RefNullId:
          return { id: c, type: g };
        case a.RefIsNullId:
          return { id: c, type: g, value: a._BinaryenRefIsNullGetValue(b) };
        case a.RefAsId:
          return {
            id: c,
            type: g,
            op: a._BinaryenRefAsGetOp(b),
            value: a._BinaryenRefAsGetValue(b),
          };
        case a.RefFuncId:
          return { id: c, type: g, func: B(a._BinaryenRefFuncGetFunc(b)) };
        case a.RefEqId:
          return {
            id: c,
            type: g,
            left: a._BinaryenRefEqGetLeft(b),
            right: a._BinaryenRefEqGetRight(b),
          };
        case a.TryId:
          return {
            id: c,
            type: g,
            name: B(a._BinaryenTryGetName(b)),
            body: a._BinaryenTryGetBody(b),
            catchTags: X(
              b,
              a._BinaryenTryGetNumCatchTags,
              a._BinaryenTryGetCatchTagAt,
            ),
            catchBodies: X(
              b,
              a._BinaryenTryGetNumCatchBodies,
              a._BinaryenTryGetCatchBodyAt,
            ),
            hasCatchAll: a._BinaryenTryHasCatchAll(b),
            delegateTarget: B(a._BinaryenTryGetDelegateTarget(b)),
            isDelegate: a._BinaryenTryIsDelegate(b),
          };
        case a.ThrowId:
          return {
            id: c,
            type: g,
            tag: B(a._BinaryenThrowGetTag(b)),
            operands: X(
              b,
              a._BinaryenThrowGetNumOperands,
              a._BinaryenThrowGetOperandAt,
            ),
          };
        case a.RethrowId:
          return { id: c, type: g, target: B(a._BinaryenRethrowGetTarget(b)) };
        case a.TupleMakeId:
          return {
            id: c,
            type: g,
            operands: X(
              b,
              a._BinaryenTupleMakeGetNumOperands,
              a._BinaryenTupleMakeGetOperandAt,
            ),
          };
        case a.TupleExtractId:
          return {
            id: c,
            type: g,
            tuple: a._BinaryenTupleExtractGetTuple(b),
            index: a._BinaryenTupleExtractGetIndex(b),
          };
        case a.RefI31Id:
          return { id: c, type: g, value: a._BinaryenRefI31GetValue(b) };
        case a.I31GetId:
          return {
            id: c,
            type: g,
            i31: a._BinaryenI31GetGetI31(b),
            isSigned: !!a._BinaryenI31GetIsSigned(b),
          };
        default:
          throw Error('unexpected id: ' + c);
      }
    };
    a.getSideEffects = function (b, c) {
      c || q();
      return a._BinaryenExpressionGetSideEffects(b, c.ptr);
    };
    a.createType = function (b) {
      return U(() => a._BinaryenTypeCreate(W(b), b.length));
    };
    a.expandType = function (b) {
      return U(() => {
        const c = a._BinaryenTypeArity(b),
          g = M(c << 2);
        a._BinaryenTypeExpand(b, g);
        const d = Array(c);
        for (let f = 0; f < c; f++) d[f] = x[(g >>> 2) + f];
        return d;
      });
    };
    a.getFunctionInfo = function (b) {
      return {
        name: B(a._BinaryenFunctionGetName(b)),
        module: B(a._BinaryenFunctionImportGetModule(b)),
        base: B(a._BinaryenFunctionImportGetBase(b)),
        params: a._BinaryenFunctionGetParams(b),
        results: a._BinaryenFunctionGetResults(b),
        vars: X(b, a._BinaryenFunctionGetNumVars, a._BinaryenFunctionGetVar),
        body: a._BinaryenFunctionGetBody(b),
      };
    };
    a.getGlobalInfo = function (b) {
      return {
        name: B(a._BinaryenGlobalGetName(b)),
        module: B(a._BinaryenGlobalImportGetModule(b)),
        base: B(a._BinaryenGlobalImportGetBase(b)),
        type: a._BinaryenGlobalGetType(b),
        mutable: !!a._BinaryenGlobalIsMutable(b),
        init: a._BinaryenGlobalGetInitExpr(b),
      };
    };
    a.getTableInfo = function (b) {
      var c = !!a._BinaryenTableHasMax(b),
        g = {
          name: B(a._BinaryenTableGetName(b)),
          module: B(a._BinaryenTableImportGetModule(b)),
          base: B(a._BinaryenTableImportGetBase(b)),
          initial: a._BinaryenTableGetInitial(b),
        };
      c && (g.max = a._BinaryenTableGetMax(b));
      return g;
    };
    a.getElementSegmentInfo = function (b) {
      var c = a._BinaryenElementSegmentGetLength(b),
        g = Array(c);
      for (let f = 0; f !== c; ++f) {
        var d = a._BinaryenElementSegmentGetData(b, f);
        g[f] = d ? z(v, d) : '';
      }
      return {
        name: B(a._BinaryenElementSegmentGetName(b)),
        table: B(a._BinaryenElementSegmentGetTable(b)),
        offset: a._BinaryenElementSegmentGetOffset(b),
        data: g,
      };
    };
    a.getTagInfo = function (b) {
      return {
        name: B(a._BinaryenTagGetName(b)),
        module: B(a._BinaryenTagImportGetModule(b)),
        base: B(a._BinaryenTagImportGetBase(b)),
        params: a._BinaryenTagGetParams(b),
        results: a._BinaryenTagGetResults(b),
      };
    };
    a.getExportInfo = function (b) {
      return {
        kind: a._BinaryenExportGetKind(b),
        name: B(a._BinaryenExportGetName(b)),
        value: B(a._BinaryenExportGetValue(b)),
      };
    };
    a.emitText = function (b) {
      if ('object' === typeof b) return b.bD();
      const c = m;
      let g = '';
      m = (d) => {
        g += d + '\n';
      };
      a._BinaryenExpressionPrint(b);
      m = c;
      return g;
    };
    Object.defineProperty(a, 'readBinary', { writable: !0 });
    a.readBinary = function (b) {
      const c = Jd(b.length);
      u.set(b, c);
      b = a._BinaryenModuleRead(c, b.length);
      Md(c);
      return Be(b);
    };
    a.parseText = function (b) {
      const c = Jd(b.length + 1);
      nc(b, c);
      b = a._BinaryenModuleParse(c);
      Md(c);
      return Be(b);
    };
    a.getOptimizeLevel = function () {
      return a._BinaryenGetOptimizeLevel();
    };
    a.setOptimizeLevel = function (b) {
      a._BinaryenSetOptimizeLevel(b);
    };
    a.getShrinkLevel = function () {
      return a._BinaryenGetShrinkLevel();
    };
    a.setShrinkLevel = function (b) {
      a._BinaryenSetShrinkLevel(b);
    };
    a.getDebugInfo = function () {
      return !!a._BinaryenGetDebugInfo();
    };
    a.setDebugInfo = function (b) {
      a._BinaryenSetDebugInfo(b);
    };
    a.getLowMemoryUnused = function () {
      return !!a._BinaryenGetLowMemoryUnused();
    };
    a.setLowMemoryUnused = function (b) {
      a._BinaryenSetLowMemoryUnused(b);
    };
    a.getZeroFilledMemory = function () {
      return !!a._BinaryenGetZeroFilledMemory();
    };
    a.setZeroFilledMemory = function (b) {
      a._BinaryenSetZeroFilledMemory(b);
    };
    a.getFastMath = function () {
      return !!a._BinaryenGetFastMath();
    };
    a.setFastMath = function (b) {
      a._BinaryenSetFastMath(b);
    };
    a.getPassArgument = function (b) {
      return U(() => {
        const c = a._BinaryenGetPassArgument(V(b));
        return 0 !== c ? (c ? z(v, c) : '') : null;
      });
    };
    a.setPassArgument = function (b, c) {
      U(() => {
        a._BinaryenSetPassArgument(V(b), V(c));
      });
    };
    a.clearPassArguments = function () {
      a._BinaryenClearPassArguments();
    };
    a.getAlwaysInlineMaxSize = function () {
      return a._BinaryenGetAlwaysInlineMaxSize();
    };
    a.setAlwaysInlineMaxSize = function (b) {
      a._BinaryenSetAlwaysInlineMaxSize(b);
    };
    a.getFlexibleInlineMaxSize = function () {
      return a._BinaryenGetFlexibleInlineMaxSize();
    };
    a.setFlexibleInlineMaxSize = function (b) {
      a._BinaryenSetFlexibleInlineMaxSize(b);
    };
    a.getOneCallerInlineMaxSize = function () {
      return a._BinaryenGetOneCallerInlineMaxSize();
    };
    a.setOneCallerInlineMaxSize = function (b) {
      a._BinaryenSetOneCallerInlineMaxSize(b);
    };
    a.getAllowInliningFunctionsWithLoops = function () {
      return !!a._BinaryenGetAllowInliningFunctionsWithLoops();
    };
    a.setAllowInliningFunctionsWithLoops = function (b) {
      a._BinaryenSetAllowInliningFunctionsWithLoops(b);
    };
    const De = Symbol();
    function Y(b) {
      function c(g) {
        if (!(this instanceof c)) return g ? new c(g) : null;
        Z.call(this, g);
      }
      Object.assign(c, Z);
      Object.assign(c, b);
      (c.prototype = Object.create(Z.prototype)).constructor = c;
      Ee(c.prototype, b);
      return c;
    }
    function Ee(b, c) {
      Object.keys(c).forEach((g) => {
        const d = c[g];
        if ('function' === typeof d) {
          b[g] = function (...h) {
            return this.constructor[g](this[De], ...h);
          };
          var f;
          if (1 === d.length && (f = g.match(/^(get|is)/))) {
            f = f[1].length;
            const h = g.charAt(f).toLowerCase() + g.substring(f + 1),
              k = c['set' + g.substring(f)];
            Object.defineProperty(b, h, {
              get() {
                return d(this[De]);
              },
              set(l) {
                if (k) k(this[De], l);
                else throw Error("property '" + h + "' has no setter");
              },
            });
          }
        }
      });
    }
    function Z(b) {
      if (!b) throw Error('expression reference must not be null');
      this[De] = b;
    }
    Z.getId = function (b) {
      return a._BinaryenExpressionGetId(b);
    };
    Z.getType = function (b) {
      return a._BinaryenExpressionGetType(b);
    };
    Z.setType = function (b, c) {
      a._BinaryenExpressionSetType(b, c);
    };
    Z.finalize = function (b) {
      return a._BinaryenExpressionFinalize(b);
    };
    Z.toText = function (b) {
      return a.emitText(b);
    };
    Ee(Z.prototype, Z);
    Z.prototype.valueOf = function () {
      return this[De];
    };
    a.Expression = Z;
    a.Block = Y({
      getName: function (b) {
        return (b = a._BinaryenBlockGetName(b)) ? (b ? z(v, b) : '') : null;
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenBlockSetName(b, V(c));
        });
      },
      getNumChildren: function (b) {
        return a._BinaryenBlockGetNumChildren(b);
      },
      getChildren: function (b) {
        return X(b, a._BinaryenBlockGetNumChildren, a._BinaryenBlockGetChildAt);
      },
      setChildren: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenBlockGetNumChildren,
          a._BinaryenBlockSetChildAt,
          a._BinaryenBlockAppendChild,
          a._BinaryenBlockRemoveChildAt,
        );
      },
      getChildAt: function (b, c) {
        return a._BinaryenBlockGetChildAt(b, c);
      },
      setChildAt: function (b, c, g) {
        a._BinaryenBlockSetChildAt(b, c, g);
      },
      appendChild: function (b, c) {
        return a._BinaryenBlockAppendChild(b, c);
      },
      insertChildAt: function (b, c, g) {
        a._BinaryenBlockInsertChildAt(b, c, g);
      },
      removeChildAt: function (b, c) {
        return a._BinaryenBlockRemoveChildAt(b, c);
      },
    });
    a.If = Y({
      getCondition: function (b) {
        return a._BinaryenIfGetCondition(b);
      },
      setCondition: function (b, c) {
        a._BinaryenIfSetCondition(b, c);
      },
      getIfTrue: function (b) {
        return a._BinaryenIfGetIfTrue(b);
      },
      setIfTrue: function (b, c) {
        a._BinaryenIfSetIfTrue(b, c);
      },
      getIfFalse: function (b) {
        return a._BinaryenIfGetIfFalse(b);
      },
      setIfFalse: function (b, c) {
        a._BinaryenIfSetIfFalse(b, c);
      },
    });
    a.Loop = Y({
      getName: function (b) {
        return (b = a._BinaryenLoopGetName(b)) ? (b ? z(v, b) : '') : null;
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenLoopSetName(b, V(c));
        });
      },
      getBody: function (b) {
        return a._BinaryenLoopGetBody(b);
      },
      setBody: function (b, c) {
        a._BinaryenLoopSetBody(b, c);
      },
    });
    a.Break = Y({
      getName: function (b) {
        return (b = a._BinaryenBreakGetName(b)) ? (b ? z(v, b) : '') : null;
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenBreakSetName(b, V(c));
        });
      },
      getCondition: function (b) {
        return a._BinaryenBreakGetCondition(b);
      },
      setCondition: function (b, c) {
        a._BinaryenBreakSetCondition(b, c);
      },
      getValue: function (b) {
        return a._BinaryenBreakGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenBreakSetValue(b, c);
      },
    });
    a.Switch = Y({
      getNumNames: function (b) {
        return a._BinaryenSwitchGetNumNames(b);
      },
      getNames: function (b) {
        return X(
          b,
          a._BinaryenSwitchGetNumNames,
          a._BinaryenSwitchGetNameAt,
        ).map((c) => (c ? z(v, c) : ''));
      },
      setNames: function (b, c) {
        U(() => {
          Ce(
            b,
            c.map(V),
            a._BinaryenSwitchGetNumNames,
            a._BinaryenSwitchSetNameAt,
            a._BinaryenSwitchAppendName,
            a._BinaryenSwitchRemoveNameAt,
          );
        });
      },
      getDefaultName: function (b) {
        return (b = a._BinaryenSwitchGetDefaultName(b))
          ? b
            ? z(v, b)
            : ''
          : null;
      },
      setDefaultName: function (b, c) {
        U(() => {
          a._BinaryenSwitchSetDefaultName(b, V(c));
        });
      },
      getCondition: function (b) {
        return a._BinaryenSwitchGetCondition(b);
      },
      setCondition: function (b, c) {
        a._BinaryenSwitchSetCondition(b, c);
      },
      getValue: function (b) {
        return a._BinaryenSwitchGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenSwitchSetValue(b, c);
      },
      getNameAt: function (b, c) {
        return B(a._BinaryenSwitchGetNameAt(b, c));
      },
      setNameAt: function (b, c, g) {
        U(() => {
          a._BinaryenSwitchSetNameAt(b, c, V(g));
        });
      },
      appendName: function (b, c) {
        U(() => a._BinaryenSwitchAppendName(b, V(c)));
      },
      insertNameAt: function (b, c, g) {
        U(() => {
          a._BinaryenSwitchInsertNameAt(b, c, V(g));
        });
      },
      removeNameAt: function (b, c) {
        return B(a._BinaryenSwitchRemoveNameAt(b, c));
      },
    });
    a.Call = Y({
      getTarget: function (b) {
        return B(a._BinaryenCallGetTarget(b));
      },
      setTarget: function (b, c) {
        U(() => {
          a._BinaryenCallSetTarget(b, V(c));
        });
      },
      getNumOperands: function (b) {
        return a._BinaryenCallGetNumOperands(b);
      },
      getOperands: function (b) {
        return X(b, a._BinaryenCallGetNumOperands, a._BinaryenCallGetOperandAt);
      },
      setOperands: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenCallGetNumOperands,
          a._BinaryenCallSetOperandAt,
          a._BinaryenCallAppendOperand,
          a._BinaryenCallRemoveOperandAt,
        );
      },
      getOperandAt: function (b, c) {
        return a._BinaryenCallGetOperandAt(b, c);
      },
      setOperandAt: function (b, c, g) {
        a._BinaryenCallSetOperandAt(b, c, g);
      },
      appendOperand: function (b, c) {
        return a._BinaryenCallAppendOperand(b, c);
      },
      insertOperandAt: function (b, c, g) {
        a._BinaryenCallInsertOperandAt(b, c, g);
      },
      removeOperandAt: function (b, c) {
        return a._BinaryenCallRemoveOperandAt(b, c);
      },
      isReturn: function (b) {
        return !!a._BinaryenCallIsReturn(b);
      },
      setReturn: function (b, c) {
        a._BinaryenCallSetReturn(b, c);
      },
    });
    a.CallIndirect = Y({
      getTarget: function (b) {
        return a._BinaryenCallIndirectGetTarget(b);
      },
      setTarget: function (b, c) {
        a._BinaryenCallIndirectSetTarget(b, c);
      },
      getTable: function (b) {
        return B(a._BinaryenCallIndirectGetTable(b));
      },
      setTable: function (b, c) {
        U(() => {
          a._BinaryenCallIndirectSetTable(b, V(c));
        });
      },
      getNumOperands: function (b) {
        return a._BinaryenCallIndirectGetNumOperands(b);
      },
      getOperands: function (b) {
        return X(
          b,
          a._BinaryenCallIndirectGetNumOperands,
          a._BinaryenCallIndirectGetOperandAt,
        );
      },
      setOperands: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenCallIndirectGetNumOperands,
          a._BinaryenCallIndirectSetOperandAt,
          a._BinaryenCallIndirectAppendOperand,
          a._BinaryenCallIndirectRemoveOperandAt,
        );
      },
      getOperandAt: function (b, c) {
        return a._BinaryenCallIndirectGetOperandAt(b, c);
      },
      setOperandAt: function (b, c, g) {
        a._BinaryenCallIndirectSetOperandAt(b, c, g);
      },
      appendOperand: function (b, c) {
        return a._BinaryenCallIndirectAppendOperand(b, c);
      },
      insertOperandAt: function (b, c, g) {
        a._BinaryenCallIndirectInsertOperandAt(b, c, g);
      },
      removeOperandAt: function (b, c) {
        return a._BinaryenCallIndirectRemoveOperandAt(b, c);
      },
      isReturn: function (b) {
        return !!a._BinaryenCallIndirectIsReturn(b);
      },
      setReturn: function (b, c) {
        a._BinaryenCallIndirectSetReturn(b, c);
      },
      getParams: function (b) {
        return a._BinaryenCallIndirectGetParams(b);
      },
      setParams: function (b, c) {
        a._BinaryenCallIndirectSetParams(b, c);
      },
      getResults: function (b) {
        return a._BinaryenCallIndirectGetResults(b);
      },
      setResults: function (b, c) {
        a._BinaryenCallIndirectSetResults(b, c);
      },
    });
    a.LocalGet = Y({
      getIndex: function (b) {
        return a._BinaryenLocalGetGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenLocalGetSetIndex(b, c);
      },
    });
    a.LocalSet = Y({
      getIndex: function (b) {
        return a._BinaryenLocalSetGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenLocalSetSetIndex(b, c);
      },
      isTee: function (b) {
        return !!a._BinaryenLocalSetIsTee(b);
      },
      getValue: function (b) {
        return a._BinaryenLocalSetGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenLocalSetSetValue(b, c);
      },
    });
    a.GlobalGet = Y({
      getName: function (b) {
        return B(a._BinaryenGlobalGetGetName(b));
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenGlobalGetSetName(b, V(c));
        });
      },
    });
    a.GlobalSet = Y({
      getName: function (b) {
        return B(a._BinaryenGlobalSetGetName(b));
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenGlobalSetSetName(b, V(c));
        });
      },
      getValue: function (b) {
        return a._BinaryenGlobalSetGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenGlobalSetSetValue(b, c);
      },
    });
    a.TableGet = Y({
      getTable: function (b) {
        return B(a._BinaryenTableGetGetTable(b));
      },
      setTable: function (b, c) {
        U(() => {
          a._BinaryenTableGetSetTable(b, V(c));
        });
      },
      getIndex: function (b) {
        return a._BinaryenTableGetGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenTableGetSetIndex(b, c);
      },
    });
    a.TableSet = Y({
      getTable: function (b) {
        return B(a._BinaryenTableSetGetTable(b));
      },
      setTable: function (b, c) {
        U(() => {
          a._BinaryenTableSetSetTable(b, V(c));
        });
      },
      getIndex: function (b) {
        return a._BinaryenTableSetGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenTableSetSetIndex(b, c);
      },
      getValue: function (b) {
        return a._BinaryenTableSetGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenTableSetSetValue(b, c);
      },
    });
    a.TableSize = Y({
      getTable: function (b) {
        return B(a._BinaryenTableSizeGetTable(b));
      },
      setTable: function (b, c) {
        U(() => {
          a._BinaryenTableSizeSetTable(b, V(c));
        });
      },
    });
    a.TableGrow = Y({
      getTable: function (b) {
        return B(a._BinaryenTableGrowGetTable(b));
      },
      setTable: function (b, c) {
        U(() => {
          a._BinaryenTableGrowSetTable(b, V(c));
        });
      },
      getValue: function (b) {
        return a._BinaryenTableGrowGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenTableGrowSetValue(b, c);
      },
      getDelta: function (b) {
        return a._BinaryenTableGrowGetDelta(b);
      },
      setDelta: function (b, c) {
        a._BinaryenTableGrowSetDelta(b, c);
      },
    });
    a.MemorySize = Y({});
    a.MemoryGrow = Y({
      getDelta: function (b) {
        return a._BinaryenMemoryGrowGetDelta(b);
      },
      setDelta: function (b, c) {
        a._BinaryenMemoryGrowSetDelta(b, c);
      },
    });
    a.Load = Y({
      isAtomic: function (b) {
        return !!a._BinaryenLoadIsAtomic(b);
      },
      setAtomic: function (b, c) {
        a._BinaryenLoadSetAtomic(b, c);
      },
      isSigned: function (b) {
        return !!a._BinaryenLoadIsSigned(b);
      },
      setSigned: function (b, c) {
        a._BinaryenLoadSetSigned(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenLoadGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenLoadSetOffset(b, c);
      },
      getBytes: function (b) {
        return a._BinaryenLoadGetBytes(b);
      },
      setBytes: function (b, c) {
        a._BinaryenLoadSetBytes(b, c);
      },
      getAlign: function (b) {
        return a._BinaryenLoadGetAlign(b);
      },
      setAlign: function (b, c) {
        a._BinaryenLoadSetAlign(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenLoadGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenLoadSetPtr(b, c);
      },
    });
    a.Store = Y({
      isAtomic: function (b) {
        return !!a._BinaryenStoreIsAtomic(b);
      },
      setAtomic: function (b, c) {
        a._BinaryenStoreSetAtomic(b, c);
      },
      getBytes: function (b) {
        return a._BinaryenStoreGetBytes(b);
      },
      setBytes: function (b, c) {
        a._BinaryenStoreSetBytes(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenStoreGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenStoreSetOffset(b, c);
      },
      getAlign: function (b) {
        return a._BinaryenStoreGetAlign(b);
      },
      setAlign: function (b, c) {
        a._BinaryenStoreSetAlign(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenStoreGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenStoreSetPtr(b, c);
      },
      getValue: function (b) {
        return a._BinaryenStoreGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenStoreSetValue(b, c);
      },
      getValueType: function (b) {
        return a._BinaryenStoreGetValueType(b);
      },
      setValueType: function (b, c) {
        a._BinaryenStoreSetValueType(b, c);
      },
    });
    a.Const = Y({
      getValueI32: function (b) {
        return a._BinaryenConstGetValueI32(b);
      },
      setValueI32: function (b, c) {
        a._BinaryenConstSetValueI32(b, c);
      },
      getValueI64Low: function (b) {
        return a._BinaryenConstGetValueI64Low(b);
      },
      setValueI64Low: function (b, c) {
        a._BinaryenConstSetValueI64Low(b, c);
      },
      getValueI64High: function (b) {
        return a._BinaryenConstGetValueI64High(b);
      },
      setValueI64High: function (b, c) {
        a._BinaryenConstSetValueI64High(b, c);
      },
      getValueF32: function (b) {
        return a._BinaryenConstGetValueF32(b);
      },
      setValueF32: function (b, c) {
        a._BinaryenConstSetValueF32(b, c);
      },
      getValueF64: function (b) {
        return a._BinaryenConstGetValueF64(b);
      },
      setValueF64: function (b, c) {
        a._BinaryenConstSetValueF64(b, c);
      },
      getValueV128: function (b) {
        let c;
        U(() => {
          const g = M(16);
          a._BinaryenConstGetValueV128(b, g);
          c = Array(16);
          for (let d = 0; 16 > d; ++d) c[d] = v[g + d];
        });
        return c;
      },
      setValueV128: function (b, c) {
        U(() => {
          const g = M(16);
          for (let d = 0; 16 > d; ++d) v[g + d] = c[d];
          a._BinaryenConstSetValueV128(b, g);
        });
      },
    });
    a.Unary = Y({
      getOp: function (b) {
        return a._BinaryenUnaryGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenUnarySetOp(b, c);
      },
      getValue: function (b) {
        return a._BinaryenUnaryGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenUnarySetValue(b, c);
      },
    });
    a.Binary = Y({
      getOp: function (b) {
        return a._BinaryenBinaryGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenBinarySetOp(b, c);
      },
      getLeft: function (b) {
        return a._BinaryenBinaryGetLeft(b);
      },
      setLeft: function (b, c) {
        a._BinaryenBinarySetLeft(b, c);
      },
      getRight: function (b) {
        return a._BinaryenBinaryGetRight(b);
      },
      setRight: function (b, c) {
        a._BinaryenBinarySetRight(b, c);
      },
    });
    a.Select = Y({
      getIfTrue: function (b) {
        return a._BinaryenSelectGetIfTrue(b);
      },
      setIfTrue: function (b, c) {
        a._BinaryenSelectSetIfTrue(b, c);
      },
      getIfFalse: function (b) {
        return a._BinaryenSelectGetIfFalse(b);
      },
      setIfFalse: function (b, c) {
        a._BinaryenSelectSetIfFalse(b, c);
      },
      getCondition: function (b) {
        return a._BinaryenSelectGetCondition(b);
      },
      setCondition: function (b, c) {
        a._BinaryenSelectSetCondition(b, c);
      },
    });
    a.Drop = Y({
      getValue: function (b) {
        return a._BinaryenDropGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenDropSetValue(b, c);
      },
    });
    a.Return = Y({
      getValue: function (b) {
        return a._BinaryenReturnGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenReturnSetValue(b, c);
      },
    });
    a.AtomicRMW = Y({
      getOp: function (b) {
        return a._BinaryenAtomicRMWGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenAtomicRMWSetOp(b, c);
      },
      getBytes: function (b) {
        return a._BinaryenAtomicRMWGetBytes(b);
      },
      setBytes: function (b, c) {
        a._BinaryenAtomicRMWSetBytes(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenAtomicRMWGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenAtomicRMWSetOffset(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenAtomicRMWGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenAtomicRMWSetPtr(b, c);
      },
      getValue: function (b) {
        return a._BinaryenAtomicRMWGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenAtomicRMWSetValue(b, c);
      },
    });
    a.AtomicCmpxchg = Y({
      getBytes: function (b) {
        return a._BinaryenAtomicCmpxchgGetBytes(b);
      },
      setBytes: function (b, c) {
        a._BinaryenAtomicCmpxchgSetBytes(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenAtomicCmpxchgGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenAtomicCmpxchgSetOffset(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenAtomicCmpxchgGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenAtomicCmpxchgSetPtr(b, c);
      },
      getExpected: function (b) {
        return a._BinaryenAtomicCmpxchgGetExpected(b);
      },
      setExpected: function (b, c) {
        a._BinaryenAtomicCmpxchgSetExpected(b, c);
      },
      getReplacement: function (b) {
        return a._BinaryenAtomicCmpxchgGetReplacement(b);
      },
      setReplacement: function (b, c) {
        a._BinaryenAtomicCmpxchgSetReplacement(b, c);
      },
    });
    a.AtomicWait = Y({
      getPtr: function (b) {
        return a._BinaryenAtomicWaitGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenAtomicWaitSetPtr(b, c);
      },
      getExpected: function (b) {
        return a._BinaryenAtomicWaitGetExpected(b);
      },
      setExpected: function (b, c) {
        a._BinaryenAtomicWaitSetExpected(b, c);
      },
      getTimeout: function (b) {
        return a._BinaryenAtomicWaitGetTimeout(b);
      },
      setTimeout: function (b, c) {
        a._BinaryenAtomicWaitSetTimeout(b, c);
      },
      getExpectedType: function (b) {
        return a._BinaryenAtomicWaitGetExpectedType(b);
      },
      setExpectedType: function (b, c) {
        a._BinaryenAtomicWaitSetExpectedType(b, c);
      },
    });
    a.AtomicNotify = Y({
      getPtr: function (b) {
        return a._BinaryenAtomicNotifyGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenAtomicNotifySetPtr(b, c);
      },
      getNotifyCount: function (b) {
        return a._BinaryenAtomicNotifyGetNotifyCount(b);
      },
      setNotifyCount: function (b, c) {
        a._BinaryenAtomicNotifySetNotifyCount(b, c);
      },
    });
    a.AtomicFence = Y({
      getOrder: function (b) {
        return a._BinaryenAtomicFenceGetOrder(b);
      },
      setOrder: function (b, c) {
        a._BinaryenAtomicFenceSetOrder(b, c);
      },
    });
    a.SIMDExtract = Y({
      getOp: function (b) {
        return a._BinaryenSIMDExtractGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDExtractSetOp(b, c);
      },
      getVec: function (b) {
        return a._BinaryenSIMDExtractGetVec(b);
      },
      setVec: function (b, c) {
        a._BinaryenSIMDExtractSetVec(b, c);
      },
      getIndex: function (b) {
        return a._BinaryenSIMDExtractGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenSIMDExtractSetIndex(b, c);
      },
    });
    a.SIMDReplace = Y({
      getOp: function (b) {
        return a._BinaryenSIMDReplaceGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDReplaceSetOp(b, c);
      },
      getVec: function (b) {
        return a._BinaryenSIMDReplaceGetVec(b);
      },
      setVec: function (b, c) {
        a._BinaryenSIMDReplaceSetVec(b, c);
      },
      getIndex: function (b) {
        return a._BinaryenSIMDReplaceGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenSIMDReplaceSetIndex(b, c);
      },
      getValue: function (b) {
        return a._BinaryenSIMDReplaceGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenSIMDReplaceSetValue(b, c);
      },
    });
    a.SIMDShuffle = Y({
      getLeft: function (b) {
        return a._BinaryenSIMDShuffleGetLeft(b);
      },
      setLeft: function (b, c) {
        a._BinaryenSIMDShuffleSetLeft(b, c);
      },
      getRight: function (b) {
        return a._BinaryenSIMDShuffleGetRight(b);
      },
      setRight: function (b, c) {
        a._BinaryenSIMDShuffleSetRight(b, c);
      },
      getMask: function (b) {
        let c;
        U(() => {
          const g = M(16);
          a._BinaryenSIMDShuffleGetMask(b, g);
          c = Array(16);
          for (let d = 0; 16 > d; ++d) c[d] = v[g + d];
        });
        return c;
      },
      setMask: function (b, c) {
        U(() => {
          const g = M(16);
          for (let d = 0; 16 > d; ++d) v[g + d] = c[d];
          a._BinaryenSIMDShuffleSetMask(b, g);
        });
      },
    });
    a.SIMDTernary = Y({
      getOp: function (b) {
        return a._BinaryenSIMDTernaryGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDTernarySetOp(b, c);
      },
      getA: function (b) {
        return a._BinaryenSIMDTernaryGetA(b);
      },
      setA: function (b, c) {
        a._BinaryenSIMDTernarySetA(b, c);
      },
      getB: function (b) {
        return a._BinaryenSIMDTernaryGetB(b);
      },
      setB: function (b, c) {
        a._BinaryenSIMDTernarySetB(b, c);
      },
      getC: function (b) {
        return a._BinaryenSIMDTernaryGetC(b);
      },
      setC: function (b, c) {
        a._BinaryenSIMDTernarySetC(b, c);
      },
    });
    a.SIMDShift = Y({
      getOp: function (b) {
        return a._BinaryenSIMDShiftGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDShiftSetOp(b, c);
      },
      getVec: function (b) {
        return a._BinaryenSIMDShiftGetVec(b);
      },
      setVec: function (b, c) {
        a._BinaryenSIMDShiftSetVec(b, c);
      },
      getShift: function (b) {
        return a._BinaryenSIMDShiftGetShift(b);
      },
      setShift: function (b, c) {
        a._BinaryenSIMDShiftSetShift(b, c);
      },
    });
    a.SIMDLoad = Y({
      getOp: function (b) {
        return a._BinaryenSIMDLoadGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDLoadSetOp(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenSIMDLoadGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenSIMDLoadSetOffset(b, c);
      },
      getAlign: function (b) {
        return a._BinaryenSIMDLoadGetAlign(b);
      },
      setAlign: function (b, c) {
        a._BinaryenSIMDLoadSetAlign(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenSIMDLoadGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenSIMDLoadSetPtr(b, c);
      },
    });
    a.SIMDLoadStoreLane = Y({
      getOp: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetOp(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetOffset(b, c);
      },
      getAlign: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetAlign(b);
      },
      setAlign: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetAlign(b, c);
      },
      getIndex: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetIndex(b, c);
      },
      getPtr: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetPtr(b);
      },
      setPtr: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetPtr(b, c);
      },
      getVec: function (b) {
        return a._BinaryenSIMDLoadStoreLaneGetVec(b);
      },
      setVec: function (b, c) {
        a._BinaryenSIMDLoadStoreLaneSetVec(b, c);
      },
      isStore: function (b) {
        return !!a._BinaryenSIMDLoadStoreLaneIsStore(b);
      },
    });
    a.MemoryInit = Y({
      getSegment: function (b) {
        return B(a._BinaryenMemoryInitGetSegment(b));
      },
      setSegment: function (b, c) {
        U(() => a._BinaryenMemoryInitSetSegment(b, V(c)));
      },
      getDest: function (b) {
        return a._BinaryenMemoryInitGetDest(b);
      },
      setDest: function (b, c) {
        a._BinaryenMemoryInitSetDest(b, c);
      },
      getOffset: function (b) {
        return a._BinaryenMemoryInitGetOffset(b);
      },
      setOffset: function (b, c) {
        a._BinaryenMemoryInitSetOffset(b, c);
      },
      getSize: function (b) {
        return a._BinaryenMemoryInitGetSize(b);
      },
      setSize: function (b, c) {
        a._BinaryenMemoryInitSetSize(b, c);
      },
    });
    a.DataDrop = Y({
      getSegment: function (b) {
        return B(a._BinaryenDataDropGetSegment(b));
      },
      setSegment: function (b, c) {
        U(() => a._BinaryenDataDropSetSegment(b, V(c)));
      },
    });
    a.MemoryCopy = Y({
      getDest: function (b) {
        return a._BinaryenMemoryCopyGetDest(b);
      },
      setDest: function (b, c) {
        a._BinaryenMemoryCopySetDest(b, c);
      },
      getSource: function (b) {
        return a._BinaryenMemoryCopyGetSource(b);
      },
      setSource: function (b, c) {
        a._BinaryenMemoryCopySetSource(b, c);
      },
      getSize: function (b) {
        return a._BinaryenMemoryCopyGetSize(b);
      },
      setSize: function (b, c) {
        a._BinaryenMemoryCopySetSize(b, c);
      },
    });
    a.MemoryFill = Y({
      getDest: function (b) {
        return a._BinaryenMemoryFillGetDest(b);
      },
      setDest: function (b, c) {
        a._BinaryenMemoryFillSetDest(b, c);
      },
      getValue: function (b) {
        return a._BinaryenMemoryFillGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenMemoryFillSetValue(b, c);
      },
      getSize: function (b) {
        return a._BinaryenMemoryFillGetSize(b);
      },
      setSize: function (b, c) {
        a._BinaryenMemoryFillSetSize(b, c);
      },
    });
    a.RefIsNull = Y({
      getValue: function (b) {
        return a._BinaryenRefIsNullGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenRefIsNullSetValue(b, c);
      },
    });
    a.RefAs = Y({
      getOp: function (b) {
        return a._BinaryenRefAsGetOp(b);
      },
      setOp: function (b, c) {
        a._BinaryenRefAsSetOp(b, c);
      },
      getValue: function (b) {
        return a._BinaryenRefAsGetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenRefAsSetValue(b, c);
      },
    });
    a.RefFunc = Y({
      getFunc: function (b) {
        return B(a._BinaryenRefFuncGetFunc(b));
      },
      setFunc: function (b, c) {
        U(() => {
          a._BinaryenRefFuncSetFunc(b, V(c));
        });
      },
    });
    a.RefEq = Y({
      getLeft: function (b) {
        return a._BinaryenRefEqGetLeft(b);
      },
      setLeft: function (b, c) {
        return a._BinaryenRefEqSetLeft(b, c);
      },
      getRight: function (b) {
        return a._BinaryenRefEqGetRight(b);
      },
      setRight: function (b, c) {
        return a._BinaryenRefEqSetRight(b, c);
      },
    });
    a.Try = Y({
      getName: function (b) {
        return (b = a._BinaryenTryGetName(b)) ? (b ? z(v, b) : '') : null;
      },
      setName: function (b, c) {
        U(() => {
          a._BinaryenTrySetName(b, V(c));
        });
      },
      getBody: function (b) {
        return a._BinaryenTryGetBody(b);
      },
      setBody: function (b, c) {
        a._BinaryenTrySetBody(b, c);
      },
      getNumCatchTags: function (b) {
        return a._BinaryenTryGetNumCatchTags(b);
      },
      getCatchTags: function (b) {
        return X(
          b,
          a._BinaryenTryGetNumCatchTags,
          a._BinaryenTryGetCatchTagAt,
        ).map((c) => (c ? z(v, c) : ''));
      },
      setCatchTags: function (b, c) {
        U(() => {
          Ce(
            b,
            c.map(V),
            a._BinaryenTryGetNumCatchTags,
            a._BinaryenTrySetCatchTagAt,
            a._BinaryenTryAppendCatchTag,
            a._BinaryenTryRemoveCatchTagAt,
          );
        });
      },
      getCatchTagAt: function (b, c) {
        return B(a._BinaryenTryGetCatchTagAt(b, c));
      },
      setCatchTagAt: function (b, c, g) {
        U(() => {
          a._BinaryenTrySetCatchTagAt(b, c, V(g));
        });
      },
      appendCatchTag: function (b, c) {
        U(() => a._BinaryenTryAppendCatchTag(b, V(c)));
      },
      insertCatchTagAt: function (b, c, g) {
        U(() => {
          a._BinaryenTryInsertCatchTagAt(b, c, V(g));
        });
      },
      removeCatchTagAt: function (b, c) {
        return B(a._BinaryenTryRemoveCatchTagAt(b, c));
      },
      getNumCatchBodies: function (b) {
        return a._BinaryenTryGetNumCatchBodies(b);
      },
      getCatchBodies: function (b) {
        return X(
          b,
          a._BinaryenTryGetNumCatchBodies,
          a._BinaryenTryGetCatchBodyAt,
        );
      },
      setCatchBodies: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenTryGetNumCatchBodies,
          a._BinaryenTrySetCatchBodyAt,
          a._BinaryenTryAppendCatchBody,
          a._BinaryenTryRemoveCatchBodyAt,
        );
      },
      getCatchBodyAt: function (b, c) {
        return a._BinaryenTryGetCatchBodyAt(b, c);
      },
      setCatchBodyAt: function (b, c, g) {
        a._BinaryenTrySetCatchBodyAt(b, c, g);
      },
      appendCatchBody: function (b, c) {
        return a._BinaryenTryAppendCatchBody(b, c);
      },
      insertCatchBodyAt: function (b, c, g) {
        a._BinaryenTryInsertCatchBodyAt(b, c, g);
      },
      removeCatchBodyAt: function (b, c) {
        return a._BinaryenTryRemoveCatchBodyAt(b, c);
      },
      hasCatchAll: function (b) {
        return !!a._BinaryenTryHasCatchAll(b);
      },
      getDelegateTarget: function (b) {
        return (b = a._BinaryenTryGetDelegateTarget(b))
          ? b
            ? z(v, b)
            : ''
          : null;
      },
      setDelegateTarget: function (b, c) {
        U(() => {
          a._BinaryenTrySetDelegateTarget(b, V(c));
        });
      },
      isDelegate: function (b) {
        return !!a._BinaryenTryIsDelegate(b);
      },
    });
    a.Throw = Y({
      getTag: function (b) {
        return B(a._BinaryenThrowGetTag(b));
      },
      setTag: function (b, c) {
        U(() => {
          a._BinaryenThrowSetTag(b, V(c));
        });
      },
      getNumOperands: function (b) {
        return a._BinaryenThrowGetNumOperands(b);
      },
      getOperands: function (b) {
        return X(
          b,
          a._BinaryenThrowGetNumOperands,
          a._BinaryenThrowGetOperandAt,
        );
      },
      setOperands: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenThrowGetNumOperands,
          a._BinaryenThrowSetOperandAt,
          a._BinaryenThrowAppendOperand,
          a._BinaryenThrowRemoveOperandAt,
        );
      },
      getOperandAt: function (b, c) {
        return a._BinaryenThrowGetOperandAt(b, c);
      },
      setOperandAt: function (b, c, g) {
        a._BinaryenThrowSetOperandAt(b, c, g);
      },
      appendOperand: function (b, c) {
        return a._BinaryenThrowAppendOperand(b, c);
      },
      insertOperandAt: function (b, c, g) {
        a._BinaryenThrowInsertOperandAt(b, c, g);
      },
      removeOperandAt: function (b, c) {
        return a._BinaryenThrowRemoveOperandAt(b, c);
      },
    });
    a.Rethrow = Y({
      getTarget: function (b) {
        return (b = a._BinaryenRethrowGetTarget(b)) ? (b ? z(v, b) : '') : null;
      },
      setTarget: function (b, c) {
        U(() => {
          a._BinaryenRethrowSetTarget(b, V(c));
        });
      },
    });
    a.TupleMake = Y({
      getNumOperands: function (b) {
        return a._BinaryenTupleMakeGetNumOperands(b);
      },
      getOperands: function (b) {
        return X(
          b,
          a._BinaryenTupleMakeGetNumOperands,
          a._BinaryenTupleMakeGetOperandAt,
        );
      },
      setOperands: function (b, c) {
        Ce(
          b,
          c,
          a._BinaryenTupleMakeGetNumOperands,
          a._BinaryenTupleMakeSetOperandAt,
          a._BinaryenTupleMakeAppendOperand,
          a._BinaryenTupleMakeRemoveOperandAt,
        );
      },
      getOperandAt: function (b, c) {
        return a._BinaryenTupleMakeGetOperandAt(b, c);
      },
      setOperandAt: function (b, c, g) {
        a._BinaryenTupleMakeSetOperandAt(b, c, g);
      },
      appendOperand: function (b, c) {
        return a._BinaryenTupleMakeAppendOperand(b, c);
      },
      insertOperandAt: function (b, c, g) {
        a._BinaryenTupleMakeInsertOperandAt(b, c, g);
      },
      removeOperandAt: function (b, c) {
        return a._BinaryenTupleMakeRemoveOperandAt(b, c);
      },
    });
    a.TupleExtract = Y({
      getTuple: function (b) {
        return a._BinaryenTupleExtractGetTuple(b);
      },
      setTuple: function (b, c) {
        a._BinaryenTupleExtractSetTuple(b, c);
      },
      getIndex: function (b) {
        return a._BinaryenTupleExtractGetIndex(b);
      },
      setIndex: function (b, c) {
        a._BinaryenTupleExtractSetIndex(b, c);
      },
    });
    a.RefI31 = Y({
      getValue: function (b) {
        return a._BinaryenRefI31GetValue(b);
      },
      setValue: function (b, c) {
        a._BinaryenRefI31SetValue(b, c);
      },
    });
    a.I31Get = Y({
      getI31: function (b) {
        return a._BinaryenI31GetGetI31(b);
      },
      setI31: function (b, c) {
        a._BinaryenI31GetSetI31(b, c);
      },
      isSigned: function (b) {
        return !!a._BinaryenI31GetIsSigned(b);
      },
      setSigned: function (b, c) {
        a._BinaryenI31GetSetSigned(b, c);
      },
    });
    a.Function = (() => {
      function b(c) {
        if (!(this instanceof b)) return c ? new b(c) : null;
        if (!c) throw Error('function reference must not be null');
        this[De] = c;
      }
      b.getName = function (c) {
        return B(a._BinaryenFunctionGetName(c));
      };
      b.getParams = function (c) {
        return a._BinaryenFunctionGetParams(c);
      };
      b.getResults = function (c) {
        return a._BinaryenFunctionGetResults(c);
      };
      b.getNumVars = function (c) {
        return a._BinaryenFunctionGetNumVars(c);
      };
      b.getVar = function (c, g) {
        return a._BinaryenFunctionGetVar(c, g);
      };
      b.getNumLocals = function (c) {
        return a._BinaryenFunctionGetNumLocals(c);
      };
      b.hasLocalName = function (c, g) {
        return !!a._BinaryenFunctionHasLocalName(c, g);
      };
      b.getLocalName = function (c, g) {
        return B(a._BinaryenFunctionGetLocalName(c, g));
      };
      b.setLocalName = function (c, g, d) {
        U(() => {
          a._BinaryenFunctionSetLocalName(c, g, V(d));
        });
      };
      b.getBody = function (c) {
        return a._BinaryenFunctionGetBody(c);
      };
      b.setBody = function (c, g) {
        a._BinaryenFunctionSetBody(c, g);
      };
      Ee(b.prototype, b);
      b.prototype.valueOf = function () {
        return this[De];
      };
      return b;
    })();
    a.exit = function (b) {
      if (0 != b) throw Error('exiting due to error: ' + b);
    };
    ya
      ? Ae()
      : (a.onRuntimeInitialized = ((b) => () => {
          Ae();
          b && b();
        })(a.onRuntimeInitialized));

    return moduleArg.ready;
  };
})();
export default Binaryen;
