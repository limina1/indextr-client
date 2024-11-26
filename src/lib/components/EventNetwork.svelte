<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk';
  import { indexKind } from '$lib/consts';

  export let rootEvent: NDKEvent;

  let svg;
  const width = 1000;
  const height = 500;
  const nodeRadius = 15;
  const dragRadius = 40;
  const linkDistance = 40;

  interface NetworkNode {
    id: string;
    title: string;
    isIndex: boolean;
    event: NDKEvent;
  }

  interface NetworkLink {
    source: string;
    target: string;
    isOrthogonal: boolean;
  }

  async function generateGraphFromEvents(rootEvent: NDKEvent): Promise<{ nodes: NetworkNode[], links: NetworkLink[] }> {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    const processedEvents = new Set<string>();

    async function processEvent(event: NDKEvent) {
      if (processedEvents.has(event.id)) return;
      processedEvents.add(event.id);

      // Add node for this event
      nodes.push({
        id: event.id,
        title: event.getMatchingTags('title')?.[0]?.[1] || 'Untitled',
        isIndex: event.kind === indexKind,
        event: event
      });

      // Process e tags (references to other events)
      const refs = event.getMatchingTags('e');
      let prevNodeId = event.id;

      for (const [_, eventId] of refs) {
        if (!processedEvents.has(eventId)) {
          try {
            const referencedEvent = await $ndk.fetchEvent(eventId);
            if (referencedEvent) {
              await processEvent(referencedEvent);
            }
          } catch (error) {
            console.error(`Failed to fetch event ${eventId}:`, error);
            continue;
          }
        }

        links.push({
          source: prevNodeId,
          target: eventId,
          isOrthogonal: prevNodeId !== event.id
        });

        prevNodeId = eventId;
      }
    }

    await processEvent(rootEvent);
    return { nodes, links };
  }

  onMount(async () => {
    const { nodes, links } = await generateGraphFromEvents(rootEvent);
    drawNetwork(nodes, links);
  });

  function drawNetwork(nodes: NetworkNode[], links: NetworkLink[]) {
    const svgElement = d3.select(svg)
      .attr("viewBox", [0, 0, width, height]);

    // Enable panning and zooming
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svgElement.call(zoom);

    const g = svgElement.append("g");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(nodeRadius * 2));

    const link = g.selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    const node = g.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => {
        // Dispatch custom event for node click
        svg.dispatchEvent(new CustomEvent('nodeclick', {
          detail: { event: d.event },
          bubbles: true
        }));
      });

    // Add larger invisible circle for dragging
    node.append("circle")
      .attr("r", dragRadius)
      .attr("fill", "transparent")
      .style("cursor", "pointer");

    node.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => d.isIndex ? "#4CAF50" : "#2196F3");

    // Add title text
    node.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text((d) => d.title.substring(0, 8) + (d.title.length > 8 ? '...' : ''));

    simulation.on("tick", () => {
      link.attr("d", (d: any) => {
        if (d.isOrthogonal) {
          return `M${d.source.x},${d.source.y} H${d.target.x} V${d.target.y}`;
        } else {
          return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        }
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
</script>

<div class="network-container">
  <svg bind:this={svg} {width} {height}></svg>
</div>

<style>
  .network-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  svg {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
  }
</style>
