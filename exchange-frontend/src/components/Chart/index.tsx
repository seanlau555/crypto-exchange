import './styles.scss'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import {
  ema,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CurrentCoordinate,
  BarSeries,
  CandlestickSeries,
  LineSeries,
  MovingAverageTooltip,
  OHLCTooltip,
  lastVisibleItemBasedZoomAnchor,
  XAxis,
  YAxis,
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateX,
  MouseCoordinateY,
  ZoomButtons,
} from 'react-financial-charts'
import { Bar } from '../../types'

const CandleStickChart = ({ data: inputData }: { data: Array<Bar> }) => {
  const ScaleProvider =
    discontinuousTimeScaleProviderBuilder().inputDateAccessor(
      (d) => new Date(d.date),
    )
  const height = 500
  const width = 1000
  const margin = { left: 0, right: 48, top: 0, bottom: 24 }

  const ema12 = ema()
    .id(1)
    .options({ windowSize: 12 })
    .merge((d, c) => {
      d.ema12 = c
    })
    .accessor((d) => d.ema12)

  const ema26 = ema()
    .id(2)
    .options({ windowSize: 26 })
    .merge((d, c) => {
      d.ema26 = c
    })
    .accessor((d) => d.ema26)

  const { data, xScale, xAccessor, displayXAccessor } = ScaleProvider(inputData)
  const pricesDisplayFormat = format('.2f')
  const max = xAccessor(data[data.length - 1])
  const min = xAccessor(data[Math.max(0, data.length - 100)])
  const xExtents = [min, max + 5]

  const gridHeight = height - margin.top - margin.bottom

  const barChartHeight = gridHeight / 4
  const barChartOrigin = (_, h) => [0, h - barChartHeight]
  const chartHeight = gridHeight

  const dateTimeFormat = '%d %b'
  const timeDisplayFormat = timeFormat(dateTimeFormat)

  const barChartExtents = (data: Bar) => {
    return data.volume
  }

  const candleChartExtents = (data: Bar) => {
    return [data.high, data.low]
  }

  const yEdgeIndicator = (data: Bar) => {
    return data.close
  }

  const volumeColor = (data: Bar) => {
    return data.close > data.open
      ? 'rgba(38, 166, 154, 0.3)'
      : 'rgba(239, 83, 80, 0.3)'
  }

  const volumeSeries = (data: Bar) => {
    return data.volume
  }

  const openCloseColor = (data: Bar) => {
    return data.close > data.open ? '#26a69a' : '#ef5350'
  }

  return (
    <ChartCanvas
      height={height}
      ratio={3}
      width={width}
      margin={margin}
      data={data}
      displayXAccessor={displayXAccessor}
      seriesName="Data"
      xScale={xScale}
      xAccessor={xAccessor}
      xExtents={xExtents}
      zoomAnchor={lastVisibleItemBasedZoomAnchor}
    >
      <Chart
        id={2}
        height={barChartHeight}
        origin={barChartOrigin}
        yExtents={barChartExtents}
      >
        <BarSeries fillStyle={volumeColor} yAccessor={volumeSeries} />
      </Chart>
      <Chart id={3} height={chartHeight} yExtents={candleChartExtents}>
        <XAxis showGridLines showTickLabel={false} />
        <YAxis showGridLines tickFormat={pricesDisplayFormat} />
        <CandlestickSeries />
        <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()} />
        <CurrentCoordinate
          yAccessor={ema26.accessor()}
          fillStyle={ema26.stroke()}
        />
        <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />
        <CurrentCoordinate
          yAccessor={ema12.accessor()}
          fillStyle={ema12.stroke()}
        />
        <MouseCoordinateY
          rectWidth={margin.right}
          displayFormat={pricesDisplayFormat}
        />
        <EdgeIndicator
          itemType="last"
          rectWidth={margin.right}
          fill={openCloseColor}
          lineStroke={openCloseColor}
          displayFormat={pricesDisplayFormat}
          yAccessor={yEdgeIndicator}
        />
        <MovingAverageTooltip
          origin={[8, 24]}
          options={[
            {
              yAccessor: ema26.accessor(),
              type: 'EMA',
              stroke: ema26.stroke(),
              windowSize: ema26.options().windowSize,
            },
            {
              yAccessor: ema12.accessor(),
              type: 'EMA',
              stroke: ema12.stroke(),
              windowSize: ema12.options().windowSize,
            },
          ]}
        />

        <ZoomButtons />
        <OHLCTooltip origin={[8, 16]} />
        <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" />
        <YAxis ticks={4} tickFormat={pricesDisplayFormat} />

        <MouseCoordinateX displayFormat={timeDisplayFormat} />
        <MouseCoordinateY
          rectWidth={margin.right}
          displayFormat={pricesDisplayFormat}
        />
      </Chart>
      <CrossHairCursor />
    </ChartCanvas>
  )
}

export default CandleStickChart
