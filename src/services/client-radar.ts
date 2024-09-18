import { RadarConfiguration } from "@/services/radar";
import * as d3 from "d3";

type RadarDefinition = Required<RadarConfiguration> & {
  font_family: string;
};

const getRadarDefinition = (config: RadarConfiguration): RadarDefinition => {
  const conf: RadarDefinition = {
    width: 1450,
    height: 1000,
    colors: {
      background: "#fff",
      grid: "#dddde0",
      inactive: "#ddd",
    },
    print_layout: true,
    links_in_new_tabs: true,
    repo_url: "#",
    print_ring_descriptions_table: false,
    // define default font-family
    font_family: "Arial, Helvetica",

    ...config,
  };

  return conf;
};

/**
 *
 * @param config
 */
export function radar_visualization(conf: RadarConfiguration) {
  const config = getRadarDefinition(conf);

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  let seed = 42;
  /**
   *
   */
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   *
   * @param min
   * @param max
   */
  function random_between(min: number, max: number) {
    return min + random() * (max - min);
  }

  /**
   *
   * @param min
   * @param max
   */
  function normal_between(min: number, max: number) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  // radial_min / radial_max are multiples of PI
  const quadrants = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 },
  ];

  const rings = [
    { radius: 130 },
    { radius: 220 },
    { radius: 310 },
    { radius: 400 },
  ];

  const title_offset = { x: -675, y: -420 };

  const footer_offset = { x: -155, y: 450 };

  const legend_offset = [
    { x: 450, y: 90 },
    { x: -675, y: 90 },
    { x: -675, y: -310 },
    { x: 450, y: -310 },
  ];

  /**
   *
   * @param cartesian
   */
  function polar(cartesian: { x: number; y: number }) {
    const x = cartesian.x;
    const y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y),
    };
  }

  /**
   *
   * @param polar
   */
  function cartesian(polar: { t: number; r: number }) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t),
    };
  }

  /**
   *
   * @param value
   * @param min
   * @param max
   */
  function bounded_interval(value: number, min: number, max: number) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  /**
   *
   * @param polar
   * @param r_min
   * @param r_max
   */
  function bounded_ring(polar, r_min, r_max) {
    return {
      t: polar.t,
      r: bounded_interval(polar.r, r_min, r_max),
    };
  }

  /**
   *
   * @param point
   * @param min
   * @param max
   */
  function bounded_box(point, min, max) {
    return {
      x: bounded_interval(point.x, min.x, max.x),
      y: bounded_interval(point.y, min.y, max.y),
    };
  }

  /**
   *
   * @param quadrant
   * @param ring
   */
  function segment(quadrant, ring) {
    const polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius,
    };
    const polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius,
    };
    const cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y,
    };
    const cartesian_max = {
      x: rings[3].radius * quadrants[quadrant].factor_x,
      y: rings[3].radius * quadrants[quadrant].factor_y,
    };
    return {
      clipx(d) {
        const c = bounded_box(d, cartesian_min, cartesian_max);
        const p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy(d) {
        const c = bounded_box(d, cartesian_min, cartesian_max);
        const p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = cartesian(p).y; // adjust data too!
        return d.y;
      },
      random() {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r),
        });
      },
    };
  }

  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    entry.segment = segment(entry.quadrant, entry.ring);
    const point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color =
      entry.active || config.print_layout
        ? config.rings[entry.ring].color
        : config.colors.inactive;
  }

  // partition entries according to segments
  const segmented = new Array(4);
  for (var quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  let id = 1;
  for (var quadrant of [2, 3, 1, 0]) {
    for (var ring = 0; ring < 4; ring++) {
      const entries = segmented[quadrant][ring];
      entries.sort((a, b) => a.label.localeCompare(b.label));
      for (var i = 0; i < entries.length; i++) {
        entries[i].id = `${id++}`;
      }
    }
  }

  /**
   *
   * @param x
   * @param y
   */
  function translate(x, y) {
    return `translate(${x},${y})`;
  }

  /**
   *
   * @param quadrant
   */
  function viewbox(quadrant) {
    return [
      Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
      Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
      440,
      440,
    ].join(" ");
  }

  // adjust with config.scale.
  config.scale = config.scale || 1;
  const scaled_width = config.width * config.scale;
  const scaled_height = config.height * config.scale;

  const svg = d3
    .select(`svg#${CSS.escape(config.svg_id)}`)
    .style("background-color", config.colors.background)
    .attr("width", scaled_width)
    .attr("height", scaled_height);

  const radar = svg.append("g");
  if ("zoomed_quadrant" in config) {
    svg.attr("viewBox", viewbox(config.zoomed_quadrant));
  } else {
    radar.attr(
      "transform",
      translate(scaled_width / 2, scaled_height / 2).concat(
        `scale(${config.scale})`
      )
    );
  }

  const grid = radar.append("g");

  // draw grid lines
  grid
    .append("line")
    .attr("x1", 0)
    .attr("y1", -400)
    .attr("x2", 0)
    .attr("y2", 400)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);
  grid
    .append("line")
    .attr("x1", -400)
    .attr("y1", 0)
    .attr("x2", 400)
    .attr("y2", 0)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 1);

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  const defs = grid.append("defs");
  const filter = defs
    .append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood").attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite").attr("in", "SourceGraphic");

  // draw rings
  for (var i = 0; i < rings.length; i++) {
    grid
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 1);
    if (config.print_layout) {
      grid
        .append("text")
        .text(config.rings[i].name)
        .attr("y", -rings[i].radius + 62)
        .attr("text-anchor", "middle")
        .style("fill", config.rings[i].color)
        .style("opacity", 0.35)
        .style("font-family", config.font_family)
        .style("font-size", "42px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }

  /**
   *
   * @param quadrant
   * @param ring
   * @param index
   */
  function legend_transform(quadrant, ring, index = null) {
    const dx = ring < 2 ? 0 : 140;
    let dy = index == null ? -16 : index * 12;
    if (ring % 2 === 1) {
      dy = dy + 36 + segmented[quadrant][ring - 1].length * 12;
    }
    return translate(
      legend_offset[quadrant].x + dx,
      legend_offset[quadrant].y + dy
    );
  }

  // draw title and legend (only in print layout)
  if (config.print_layout) {
    // title
    radar
      .append("a")
      .attr("target", "_blank")
      .attr("href", config.repo_url)
      .attr("transform", translate(title_offset.x, title_offset.y))
      .append("text")
      .attr("class", "hover-underline") // add class for hover effect
      .text(config.title)
      .style("font-family", config.font_family)
      .style("font-size", "30")
      .style("font-weight", "bold");

    // date
    radar
      .append("text")
      .attr("transform", translate(title_offset.x, title_offset.y + 20))
      .text(config.date || "")
      .style("font-family", config.font_family)
      .style("font-size", "14")
      .style("fill", "#999");

    // footer
    radar
      .append("text")
      .attr("transform", translate(footer_offset.x, footer_offset.y))
      .text("▲ moved up     ▼ moved down     ★ new     〇 no change")
      .attr("xml:space", "preserve")
      .style("font-family", config.font_family)
      .style("font-size", "12px");

    // legend
    const legend = radar.append("g");
    for (var quadrant = 0; quadrant < 4; quadrant++) {
      legend
        .append("text")
        .attr(
          "transform",
          translate(legend_offset[quadrant].x, legend_offset[quadrant].y - 45)
        )
        .text(config.quadrants[quadrant].name)
        .style("font-family", config.font_family)
        .style("font-size", "18px")
        .style("font-weight", "bold");
      for (var ring = 0; ring < 4; ring++) {
        legend
          .append("text")
          .attr("transform", legend_transform(quadrant, ring))
          .text(config.rings[ring].name)
          .style("font-family", config.font_family)
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", config.rings[ring].color);
        legend
          .selectAll(`.legend${quadrant}${ring}`)
          .data(segmented[quadrant][ring])
          .enter()
          .append("a")
          .on("click", (e, d) => {
            console.log("E", e, d);

            e.preventDefault();
            return false;
          })
          .attr(
            "href",
            (d, i) => (d.link ? d.link : "#") // stay on same page if no link was provided
          )
          // Add a target if (and only if) there is a link and we want new tabs
          .attr("target", (d, i) =>
            d.link && config.links_in_new_tabs ? "_blank" : null
          )
          .append("text")
          .attr("transform", (d, i) => legend_transform(quadrant, ring, i))
          .attr("class", `legend${quadrant}${ring}`)
          .attr("id", (d, i) => `legendItem${d.id}`)
          .text((d, i) => `${d.id}. ${d.label}`)
          .style("font-family", config.font_family)
          .style("font-size", "11px")
          .on("mouseover", (e, d) => {
            showBubble(d);
            highlightLegendItem(d);
          })
          .on("mouseout", (e, d) => {
            hideBubble(d);
            unhighlightLegendItem(d);
          });
      }
    }
  }

  // layer for entries
  const rink = radar.append("g").attr("id", "rink");

  // rollover bubble (on top of everything else)
  const bubble = radar
    .append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect").attr("rx", 4).attr("ry", 4).style("fill", "#333");
  bubble
    .append("text")
    .style("font-family", config.font_family)
    .style("font-size", "10px")
    .style("fill", "#fff");
  bubble.append("path").attr("d", "M 0,0 10,0 5,8 z").style("fill", "#333");

  /**
   *
   * @param d
   */
  function showBubble(d) {
    if (d.active || config.print_layout) {
      const tooltip = d3.select("#bubble text").text(d.label);
      const bbox = tooltip.node().getBBox();
      d3.select("#bubble")
        .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
        .style("opacity", 0.8);
      d3.select("#bubble rect")
        .attr("x", -5)
        .attr("y", -bbox.height)
        .attr("width", bbox.width + 10)
        .attr("height", bbox.height + 4);
      d3.select("#bubble path").attr(
        "transform",
        translate(bbox.width / 2 - 5, 3)
      );
    }
  }

  /**
   *
   * @param d
   */
  function hideBubble(d) {
    const bubble = d3
      .select("#bubble")
      .attr("transform", translate(0, 0))
      .style("opacity", 0);
  }

  /**
   *
   * @param d
   */
  function highlightLegendItem(d) {
    const legendItem = document.getElementById(`legendItem${d.id}`);
    legendItem.setAttribute("filter", "url(#solid)");
    legendItem.setAttribute("fill", "white");
  }

  /**
   *
   * @param d
   */
  function unhighlightLegendItem(d) {
    const legendItem = document.getElementById(`legendItem${d.id}`);
    legendItem.removeAttribute("filter");
    legendItem.removeAttribute("fill");
  }

  // draw blips on radar
  const blips = rink
    .selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", (d, i) => legend_transform(d.quadrant, d.ring, i))
    .on("mouseover", (e, d) => {
      showBubble(d);
      highlightLegendItem(d);
    })
    .on("mouseout", (e, d) => {
      hideBubble(d);
      unhighlightLegendItem(d);
    });

  // configure each blip
  blips.each(function (d) {
    let blip = d3.select(this);

    // blip link
    if (d.active && Object.hasOwn(d, "link") && d.link) {
      blip = blip.append("a").attr("xlink:href", d.link);

      if (config.links_in_new_tabs) {
        blip.attr("target", "_blank");
      }
    }

    // blip shape
    if (d.moved == 1) {
      blip
        .append("path")
        .attr("d", "M -11,5 11,5 0,-13 z") // triangle pointing up
        .style("fill", d.color);
    } else if (d.moved == -1) {
      blip
        .append("path")
        .attr("d", "M -11,-5 11,-5 0,13 z") // triangle pointing down
        .style("fill", d.color);
    } else if (d.moved == 2) {
      blip
        .append("path")
        .attr("d", d3.symbol().type(d3.symbolStar).size(200))
        .style("fill", d.color);
    } else {
      blip.append("circle").attr("r", 9).attr("fill", d.color);
    }

    // blip text
    if (d.active || config.print_layout) {
      const blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
      blip
        .append("text")
        .text(blip_text)
        .attr("y", 3)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", config.font_family)
        .style("font-size", (d) => (blip_text.length > 2 ? "8px" : "9px"))
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  });

  // make sure that blips stay inside their segment
  /**
   *
   */
  function ticked() {
    blips.attr("transform", (d) =>
      translate(d.segment.clipx(d), d.segment.clipy(d))
    );
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(12).strength(0.85))
    .on("tick", ticked);
}
