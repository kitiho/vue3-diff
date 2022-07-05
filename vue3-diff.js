exports.diffArray = (c1, c2, { mountElement, patch, unmount, move }) => {
  function isSameVnodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  let i = 0;
  const l1 = c1.length;
  const l2 = c2.length;
  let e1 = l1 - 1
  let e2 = l2 - 1

  // 1. 从左到右
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVnodeType(n1, n2)) {
      patch(n1)
    } else {
      break
    }
    i++
  }

  // 2. 从右到左
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVnodeType(n1, n2)) {
      patch(n1)
    } else {
      break
    }
    e1--
    e2--
  }

  // 3. 老节点没了 新节点还有
  if (i > e1) {
    if (i <= e2) {
      while (i <= e2) {
        const n2 = c2[i]
        mountElement(n2.key)
        i++
      }
    }
  }

  // 4. 老节点还有 新节点没了
  else if (i > e2) {
    if (i <= e1) {
      while (i <= e1) {
        const n1 = c1[i]
        unmount(n1.key)
        i++
      }
    }
  }
  else {
    // 5. 新老节点都有，但是顺序不稳定 key: value(index)
    const keyToNewIndexMap = new Map()
    const s1 = i
    const s2 = i

    // 遍历新元素
    for (i = s2; i <= e2; i++) {
      const newChild = c2[i]
      keyToNewIndexMap.set(newChild.key, i)
    }


    // 新增节点，更新节点的总个数
    const toBePatched = e2 - s2 + 1

    // 已经处理的节点个数
    let patched = 0

    // 下标是新元素的相对下标，如果节点复用了，值是老元素的下标+1，否则就是0
    const newIndexToOldIndexMap = new Array(toBePatched.length)
    for (i = 0; i < toBePatched.length; i++) {
      newIndexToOldIndexMap[i] = 0
    }

    // 遍历老元素 只是patch老的元素
    for (i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      if (patched >= toBePatched) {
        unmount(oldChild.key)
        continue
      }
      const newIndex = keyToNewIndexMap.get(oldChild.key)
      if (newIndex === undefined) {
        // 节点没法复用
        unmount(oldChild.key)
      } else {
        // 节点可以复用
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        patch(oldChild.key)
        patched++
      }
    }

    // move mount
    for (i = toBePatched - 1; i >= 0; i--) {
      const newChildIndex = s2 + i
      const newChild = c2[newChildIndex]

      // 判断节点是不是要mount
      if (newIndexToOldIndexMap[i] === 0) {
        mountElement(newChild.key)
      } else {
        // move

      }
    }
  }
}
