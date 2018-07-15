const fs = require("fs");
const path = require("path");
import { EventEmitter } from "events";
const { promisify } = require("util");
import * as Canvas from 'canvas-prebuilt';
import { DOMWindow, JSDOM } from "jsdom";
import { Canvas2SvgOverride } from "../canvas2svg/canvas2svg";


// resolve peer dependancy
const chartJSPath = path.dirname(require.resolve("chart.js"));
const chartJSSrc = fs.readFileSync(
  `${chartJSPath}/../dist/Chart.min.js`,
  "utf-8"
);

export class ChartJs extends EventEmitter {
  private height: number;
  private width: number;

  private canvas: HTMLCanvasElement;
  private window: DOMWindow & {
    CanvasRenderingContext2D?: any;
    Chart?: any;
    FileReader?: any;
  };
  private ctx: CanvasRenderingContext2D & {
    getSerializedSvg: (boolean) => string;
  } & any;

  private _chart: any;
  private chartConfig: Chart.ChartConfiguration;

  constructor(width = 1000, height = 1000) {
    super();
    this.height = height;
    this.width = width;

    this.loadWindow();
  }

  loadWindow() {
    const html = `<html>
      <body>
        <div id='chart-div' style='font-size:12; width:${this.width}; height:${
      this.height
    };'>
        </div>
      </body>
      <script>${chartJSSrc}</script>
    </html>`;

    const document = new JSDOM(html, {
      runScripts: "dangerously"
    });

    this.window = document.window;
    // console.info(this.window);
    this.window.CanvasRenderingContext2D = Canvas.Context2d;
    this.ctx = new Canvas2SvgOverride({
      document: document.window.document,
      height: this.height,
      width: this.width
    });
    this.ctx.font = "12px Arial";
    // this.ctx.scale(this.height, this.width);
    this.ctx.canvas.style.backgroundColor = "rgba(0,0,0,0)";
    // this.ctx.canvas.width = this.width;
    // this.ctx.canvas.height = this.height;
    this.canvas = this.window.document.getElementsByTagName("canvas")[0];
  }

  async makeChart(chartConfig: Chart.ChartConfiguration) {
    this._chart && this._chart.destroy();

    chartConfig.options = chartConfig.options || {};
    chartConfig.options.responsive = false;
    chartConfig.options.animation = null;
    chartConfig.options.responsiveAnimationDuration = 0;
    this.chartConfig = chartConfig;

    return this;
  }

  drawChart() {
    this.emit("beforeDraw", this.window.Chart);

    if (this.chartConfig.options.plugins) {
      this.window.Chart.pluginService.register(
        this.chartConfig.options.plugins
      );
    }

    this._chart = new this.window.Chart(this.ctx, this.chartConfig);

    return this;
  }

  toSVG(): string {
    return this.ctx.getSerializedSvg(true).replace(/<defs>.*<\/defs>/, "");
  }
}
