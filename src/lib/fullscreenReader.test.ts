import { describe, expect, it } from "vitest";
import {
  buildReaderIframeAttrs,
  pickExitFullscreenFn,
  pickFullscreenRequestFn,
  shouldExitFullscreen,
} from "./fullscreenReader.ts";

// fullscreenReader は DOM/ブラウザAPIを直接触らない選択・判定ロジックだけを持つ純粋関数群。
// 実DOMを用意せず、必要なメソッドだけを持つ fake object を渡して検証する。

describe("pickFullscreenRequestFn", () => {
  it("標準APIがあればそれを返す", () => {
    const el = { requestFullscreen: () => Promise.resolve() };
    expect(pickFullscreenRequestFn(el)).toBeInstanceOf(Function);
  });

  it("標準・webkit両方あれば標準APIを優先する", () => {
    let calledStandard = false;
    let calledWebkit = false;
    const el = {
      requestFullscreen: () => {
        calledStandard = true;
      },
      webkitRequestFullscreen: () => {
        calledWebkit = true;
      },
    };
    pickFullscreenRequestFn(el)?.();
    expect(calledStandard).toBe(true);
    expect(calledWebkit).toBe(false);
  });

  it("webkitのみの場合はそれを返す", () => {
    let called = false;
    const el = {
      webkitRequestFullscreen: () => {
        called = true;
      },
    };
    pickFullscreenRequestFn(el)?.();
    expect(called).toBe(true);
  });

  it("どちらもない場合はundefinedを返す（非対応環境）", () => {
    expect(pickFullscreenRequestFn({})).toBeUndefined();
  });

  it("選んだ関数はelにbindされて呼べる（DOM APIのillegal invocation回避）", () => {
    const el = {
      calls: 0,
      requestFullscreen(this: { calls: number }) {
        this.calls += 1;
      },
    };
    const fn = pickFullscreenRequestFn(el);
    fn?.();
    expect(el.calls).toBe(1);
  });
});

describe("shouldExitFullscreen", () => {
  it("両方falsyならfalse", () => {
    expect(shouldExitFullscreen(null, null)).toBe(false);
  });

  it("標準のみ真ならtrue", () => {
    expect(shouldExitFullscreen({}, null)).toBe(true);
  });

  it("webkitのみ真ならtrue", () => {
    expect(shouldExitFullscreen(null, {})).toBe(true);
  });

  it("両方真でもtrue", () => {
    expect(shouldExitFullscreen({}, {})).toBe(true);
  });
});

describe("pickExitFullscreenFn", () => {
  it("標準APIがあればそれを返す", () => {
    let called = false;
    const doc = {
      exitFullscreen: () => {
        called = true;
      },
    };
    pickExitFullscreenFn(doc)?.();
    expect(called).toBe(true);
  });

  it("webkitのみの場合はそれを返す", () => {
    let called = false;
    const doc = {
      webkitExitFullscreen: () => {
        called = true;
      },
    };
    pickExitFullscreenFn(doc)?.();
    expect(called).toBe(true);
  });

  it("どちらもない場合はundefinedを返す", () => {
    expect(pickExitFullscreenFn({})).toBeUndefined();
  });
});

describe("buildReaderIframeAttrs", () => {
  it("常に同じ属性セットを返す（読む/全画面で読む共通のcreateIframeを固定する）", () => {
    expect(buildReaderIframeAttrs()).toEqual(buildReaderIframeAttrs());
  });

  it("fullscreenを許可する属性を返す", () => {
    const attrs = buildReaderIframeAttrs();
    expect(attrs.allow).toBe("autoplay; fullscreen");
    expect(attrs.allowFullscreen).toBe(true);
    expect(attrs.webkitallowfullscreen).toBe("true");
  });
});
