import { ChartJs } from '../../chartjs-interface/chartjs';

export class ChartGenerator {

    public createChartSvg(chartJsOptions: Chart.ChartConfiguration) {
            
            // 600x600 canvas size
            const chartNode: ChartJs = new ChartJs(600, 600);
            return chartNode
                .makeChart(chartJsOptions)
                .then((res) => {
                    // chart is created
                chartNode.drawChart();

                    return chartNode.toSVG();
                    ;
                }, (err) => {
                    console.error(err)
                });
            }
}