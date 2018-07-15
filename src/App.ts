import * as express from 'express'
import { ChartConfigCreator } from './chart/config/chart-config-creator';
import { ChartGenerator } from './chart/generate/chart-generator';

class App {
  public express

  private chartConfigCreator: ChartConfigCreator;
  private chartGenerator: ChartGenerator;
  

  constructor () {
    this.express = express()
    this.mountRoutes()

    this.chartConfigCreator = new ChartConfigCreator();
    this.chartGenerator = new ChartGenerator();
    
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/', (req, res) => {
      res.json({
        message: 'Hello World!'
      })
    })
    router.get('/chart', this.generateChart);

    this.express.use('/', router)
  }

  private generateChart = (req, res: express.Response) => {
    
    res.contentType('image/svg+xml');

    const chartConfig = this.chartConfigCreator.getChartConfig();
    this.chartGenerator.createChartSvg(chartConfig).then((stream: string) => {
      res.end(stream)
    }, err => {
      console.error(err);
    });
  }
}

export default new App().express
