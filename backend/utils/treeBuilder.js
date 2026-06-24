/**
 * Validates and constructs hierarchical trees from edges.
 * Handles validation, duplicate detection, multi-parent rules, and cycle detection.
 * 
 * @param {Array<string>} rawEdges - Array of raw edge strings (e.g. ["A->B", "C->D"])
 * @returns {Object} Processing result containing hierarchies, invalid entries, duplicate edges, and summary.
 */
function processEdges(rawEdges) {
  const result = {
    user_id: "sunny_singh_24062026",
    email_id: "sunny1524.be23@chitkarauniversity.edu.in",
    college_roll_number: "2311981524",
    hierarchies: [],
    invalid_entries: [],
    duplicate_edges: [],
    summary: {
      total_trees: 0,
      total_cycles: 0,
      largest_tree_root: ""
    }
  };

  if (!rawEdges || !Array.isArray(rawEdges)) {
    return result;
  }

  const validEdges = []; // Array of objects { x, y, raw }
  const seenRawEdges = new Set();
  const duplicateEdgesSet = new Set();

  // 1. Validation & Duplicate Detection
  for (const rawEntry of rawEdges) {
    if (typeof rawEntry !== "string") {
      result.invalid_entries.push(String(rawEntry));
      continue;
    }

    const trimmed = rawEntry.trim();

    // Regular expression for X->Y where X and Y are single uppercase letters
    const edgeRegex = /^[A-Z]->[A-Z]$/;

    if (!edgeRegex.test(trimmed)) {
      result.invalid_entries.push(trimmed);
      continue;
    }

    const x = trimmed[0];
    const y = trimmed[3];

    // Node pointing to itself is invalid (e.g., A->A)
    if (x === y) {
      result.invalid_entries.push(trimmed);
      continue;
    }

    // Duplicate detection (first occurrence accepted, next ones stored in duplicate_edges)
    if (seenRawEdges.has(trimmed)) {
      duplicateEdgesSet.add(trimmed);
    } else {
      seenRawEdges.add(trimmed);
      validEdges.push({ x, y, raw: trimmed });
    }
  }

  result.duplicate_edges = Array.from(duplicateEdgesSet);

  // 2. Tree Building and Multi-parent Rule
  // "First parent wins. Ignore later edges."
  const parentOf = {}; // child -> parent
  const childrenOf = {}; // parent -> Set of children
  const allNodes = new Set();
  const acceptedEdges = [];

  for (const edge of validEdges) {
    const { x, y } = edge;

    allNodes.add(x);
    allNodes.add(y);

    if (parentOf[y] !== undefined) {
      // Child already has a parent, ignore this edge
      continue;
    }

    // Accept the edge
    parentOf[y] = x;
    if (!childrenOf[x]) {
      childrenOf[x] = new Set();
    }
    childrenOf[x].add(y);
    acceptedEdges.push(edge);
  }

  // 3. Find Connected Components
  // Build undirected adjacency list for finding components
  const undirectedAdj = {};
  for (const node of allNodes) {
    undirectedAdj[node] = new Set();
  }
  for (const edge of acceptedEdges) {
    const { x, y } = edge;
    undirectedAdj[x].add(y);
    undirectedAdj[y].add(x);
  }

  const visited = new Set();
  const components = [];

  for (const node of allNodes) {
    if (!visited.has(node)) {
      // BFS to find all nodes in this component
      const comp = [];
      const queue = [node];
      visited.add(node);

      while (queue.length > 0) {
        const curr = queue.shift();
        comp.push(curr);

        for (const neighbor of undirectedAdj[curr]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(comp);
    }
  }

  // 4. Process Each Component to Build Hierarchy Tree or Detect Cycle
  let largestTreeRoot = "";
  let largestTreeSize = 0;

  for (const comp of components) {
    // Find roots in this component (nodes that never appear as a child)
    const rootsInComp = comp.filter(node => parentOf[node] === undefined);

    if (rootsInComp.length === 1) {
      // Component is a Tree
      const root = rootsInComp[0];

      // Recursive helper to build tree structure
      const buildTree = (node) => {
        const nodeTree = {};
        const children = childrenOf[node] ? Array.from(childrenOf[node]).sort() : [];
        for (const child of children) {
          nodeTree[child] = buildTree(child);
        }
        return nodeTree;
      };

      // Recursive helper to find depth (number of nodes in longest path from node to leaf)
      const getDepth = (node) => {
        const children = childrenOf[node] ? Array.from(childrenOf[node]) : [];
        if (children.length === 0) {
          return 1;
        }
        let maxChildDepth = 0;
        for (const child of children) {
          maxChildDepth = Math.max(maxChildDepth, getDepth(child));
        }
        return 1 + maxChildDepth;
      };

      const treeStructure = {
        [root]: buildTree(root)
      };
      const depth = getDepth(root);

      result.hierarchies.push({
        root,
        tree: treeStructure,
        depth
      });

      result.summary.total_trees++;

      // Track largest tree (by number of nodes in component)
      const treeSize = comp.length;
      if (treeSize > largestTreeSize) {
        largestTreeSize = treeSize;
        largestTreeRoot = root;
      } else if (treeSize === largestTreeSize) {
        // Tie breaker: lexicographically smaller root
        if (!largestTreeRoot || root < largestTreeRoot) {
          largestTreeRoot = root;
        }
      }
    } else {
      // Component has no root, meaning it must contain a cycle (or multiple)
      // Lexicographically smallest node in component becomes the root
      const sortedComp = [...comp].sort();
      const root = sortedComp[0];

      result.hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });

      result.summary.total_cycles++;
    }
  }

  // Sort hierarchies lexicographically by root
  result.hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  result.summary.largest_tree_root = largestTreeRoot;

  return result;
}

module.exports = {
  processEdges
};
