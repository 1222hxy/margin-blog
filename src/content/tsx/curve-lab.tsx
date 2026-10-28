import { useState, useId, useEffect } from "react";
import ArticleCode from "../../components/ArticleCode";
export default function CurveLab() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [frequency, setFrequency] = useState(2),
    [amplitude, setAmplitude] = useState(60);
  const id = useId();
  const points = Array.from({ length: 201 }, (_, i) => {
    const x = i * 3;
    return (
      x +
      "," +
      (110 - Math.sin((i / 200) * Math.PI * 2 * frequency) * amplitude).toFixed(
        3,
      )
    );
  }).join(" ");
  return (
    <div className="curve-lab">
      <p>
        有些想法，动手试一次比读十行解释更直观。下面这条曲线不是一张图片：它会响应你的调整。
      </p>
      <h2 id="try">先动手试试看</h2>
      <div className="lab-panel">
        <div className="lab-title">
          <span>正弦波形</span>
          <output aria-live="polite">
            频率 {frequency.toFixed(1)} · 振幅 {amplitude}
          </output>
        </div>
        <svg
          viewBox="0 0 600 220"
          role="img"
          aria-label={"正弦曲线，频率 " + frequency + "，振幅 " + amplitude}
        >
          <path
            d="M0 110H600 M300 10V210"
            stroke="currentColor"
            opacity=".18"
          />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <div className="lab-controls">
          <label htmlFor={id + "f"}>
            频率
            <input
              id={id + "f"}
              disabled={!ready}
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </label>
          <label htmlFor={id + "a"}>
            振幅
            <input
              id={id + "a"}
              disabled={!ready}
              type="range"
              min="10"
              max="90"
              step="1"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          className="pill"
          onClick={() => {
            setFrequency(2);
            setAmplitude(60);
          }}
        >
          重置参数
        </button>
      </div>
      <h2 id="why">从图像理解参数</h2>
      <ArticleCode
        language="javascript"
        code={`y = ${amplitude} * Math.sin(x * 2 * Math.PI * ${frequency})`}
      />
      <p>
        频率决定曲线在同样的横向范围里振动多少次，振幅决定波峰和波谷离中心线有多远。试着一次只改变一个参数，观察它们各自的作用。
      </p>
      <h2 id="build">不局限于文字的表达</h2>
      <p>
        这篇文章由 React
        组件直接编写。你可以把这里换成交互图表、作品演示、照片排版，或者一篇结构完全不同的专题。
      </p>
      <p>
        文章依然可以被搜索、订阅，也有自己的目录。即使浏览器没有启用
        JavaScript，说明文字和初始曲线仍然可读。
      </p>
    </div>
  );
}
