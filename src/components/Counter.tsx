import { useState } from "react";
export default function Counter() {
  const [n, setN] = useState(0);
  return (
    <button className="pill" onClick={() => setN(n + 1)}>
      交互示例 · 点击了 {n} 次
    </button>
  );
}
