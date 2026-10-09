import layouts from '@mermaid-js/layout-elk';

// ELK supplies obstacle-aware orthogonal routes. Mermaid 11's shared edge
// renderer re-intersects diamonds toward their centres and bevels every corner,
// introducing diagonal segments again. Preserve the routed ports and corners.
function alignDiamondPort(points, node, reverse = false, force = false) {
  if (!['diamond', 'diam'].includes(node.shape) || points.length < 2) return;
  const index = reverse ? points.length - 1 : 0;
  const neighbour = points[reverse ? index - 1 : 1];
  const port = points[index];
  if (!force && (Math.abs(port.x - neighbour.x) < 0.001 || Math.abs(port.y - neighbour.y) < 0.001)) return;
  const cx = node.offset.posX + node.width / 2;
  const cy = node.offset.posY + node.height / 2;
  const horizontal = Math.abs(neighbour.x - cx) / node.width > Math.abs(neighbour.y - cy) / node.height;
  if (horizontal) {
    port.y = neighbour.y;
    port.x = cx + Math.sign(neighbour.x - cx) * node.width / 2 * (1 - Math.abs(port.y - cy) / (node.height / 2));
  } else {
    port.x = neighbour.x;
    port.y = cy + Math.sign(neighbour.y - cy) * node.height / 2 * (1 - Math.abs(port.x - cx) / (node.width / 2));
  }
}

function cleanRoute(input) {
  const points = [];
  for (const point of input) {
    const last = points.at(-1);
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 0.001) continue;
    if (last && Math.abs(last.x - point.x) > 0.001 && Math.abs(last.y - point.y) > 0.001) {
      points.push({ x: last.x, y: point.y });
    }
    points.push({ ...point });
  }
  return points;
}

function insetMarker(points, type, reverse = false) {
  // Marker lengths used by Mermaid 11.12's lineWithOffset renderer.
  const offset = { arrow_point: 4, aggregation: 17.25, extension: 17.25,
    composition: 17.25, dependency: 6, lollipop: 13.5 }[type] || 0;
  if (!offset || points.length < 2) return;
  const point = points[reverse ? points.length - 1 : 0];
  const neighbour = points[reverse ? points.length - 2 : 1];
  const length = Math.hypot(neighbour.x - point.x, neighbour.y - point.y);
  const distance = Math.min(offset, length / 2);
  if (Math.abs(neighbour.x - point.x) > Math.abs(neighbour.y - point.y)) {
    point.x += Math.sign(neighbour.x - point.x) * distance;
  } else {
    point.y += Math.sign(neighbour.y - point.y) * distance;
  }
}

window.mermaid.registerLayoutLoaders(layouts.map(layout => ({
  ...layout,
  loader: async () => {
    const renderer = await layout.loader();
    return {
      ...renderer,
      render: (data, svg, helpers, options) => renderer.render(data, svg, {
        ...helpers,
        insertEdge: (container, edge, clusters, type, start, end, id) => {
          const loop = edge.start === edge.end && edge.sections?.[0];
          // The legacy diamond clipper collapses self-loops to the node centre.
          // Recover ELK's complete outside route before clipping the two ports.
          const ports = loop
            ? [loop.startPoint, ...(loop.bendPoints || []), loop.endPoint].map(point => ({
              x: point.x + start.offset.posX - start.x,
              y: point.y + start.offset.posY - start.y,
            }))
            : edge.points.map(point => ({ ...point }));
          alignDiamondPort(ports, start, false, Boolean(loop));
          alignDiamondPort(ports, end, true, Boolean(loop));
          const route = cleanRoute(ports);
          edge.points = route;
          // Retain Mermaid's labels, marker definitions, IDs and link metadata.
          const result = helpers.insertEdge(container, edge, clusters, type, start, end, id, true);
          const drawn = route.map(point => ({ ...point }));
          insetMarker(drawn, edge.arrowTypeStart);
          insetMarker(drawn, edge.arrowTypeEnd, true);
          const path = drawn.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join('');
          container.selectAll('path').filter(function () { return this.id === edge.id; }).attr('d', path);
          return { ...result, originalPath: route, updatedPath: route };
        },
      }, options),
    };
  },
})));
