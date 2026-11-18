---
title: 从一张图开始，记录一次研究
description: 一篇 Mock 手记：怎样从十二条观察得到一个可以复查的结论？
author: YhkLab
date: 2026-11-18
topic: 研究
mock: true
---
## 先把问题写小

**Mock 研究手记。** 以下十二条记录、图表和引语均为虚构示例。我们的问题是：一次整理后，有多少条笔记仍然找得到出处？[^scope]

![三个相连的节点表示采集、整理和复核](/yhklab/graph.svg)

:::quote{by="Mock · 记录者"}
与其给笔记打分，不如给下一位读者留下一条可以走回去的路。
:::

## 一份记录的三个视角

::::tabs[研究过程]
:::tab[问题]
先记录**观察对象**，再记录想验证的判断。
:::
:::tab[方法]
1. 固定同一组十二条笔记。
2. 逐项标记出处和核对结果。
:::
:::tab[边界]
便利样本不能代表真实产品的表现。
:::
::::

## 读图，也看原始数值

:::chart[记录通过数]{unit=条}
| 阶段 | 通过数 |
| --- | ---: |
| 采集 | 12 |
| 整理 | 9 |
| 复核 | 6 |
:::

若总数为 $N$，通过数为 $k$，则通过率为 $r=k/N$。本例为 **50%**。

```js
const passRate = (verified, total) => total ? verified / total : null;
```

::video[Mock 无声演示：节点依次连成路径]{src=/yhklab/path.webm poster=/yhklab/graph.svg}

## 留给下一次复核

:::details[查看复核清单]
- [x] 记录样本总数
- [x] 保留原始计数
- [ ] 换一组数据重新验证
:::

参见 [Folio 产品示例](/products/folio/)，或[返回博客](/)。

[^scope]: Mock 数据仅说明记录方法，不构成性能结论。
