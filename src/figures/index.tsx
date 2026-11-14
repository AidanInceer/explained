import type { ComponentType } from 'react'
import { Cdc, Lakehouse, LambdaKappa, Lifecycle, Medallion, Shuffle, Star } from './static'
import { Partitions, RowCol } from './storage'
import { Scd } from './modeling'
import { EtlElt, Idempotency } from './pipelines'
import { Consumers, Delivery, Windows } from './streaming'
import { Dag, Quality } from './ops'
import { ChooseEngine, ChooseIngestion, ChooseLatency, ChooseStack } from './decide'
import { BatchStream, QueueLog } from './motion'
import { WbFlight, WbFraud, WbMethod } from './whiteboard'
import { WbBank, WbClicks, WbIot, WbShop } from './boards2'
import { CiPipeline, DbtLayers, FactTypes, Joins, ModelLevels, Requirements, Sdlc, Skew, SqlOrder, ZoneMap } from './more'

/** Names used by `::fig <name> | caption` lines in the lesson files. */
export const FIGURES: Record<string, ComponentType> = {
  lifecycle: Lifecycle,
  lakehouse: Lakehouse,
  star: Star,
  cdc: Cdc,
  shuffle: Shuffle,
  medallion: Medallion,
  'lambda-kappa': LambdaKappa,
  'row-col': RowCol,
  partitions: Partitions,
  scd: Scd,
  'etl-elt': EtlElt,
  idempotency: Idempotency,
  consumers: Consumers,
  windows: Windows,
  delivery: Delivery,
  dag: Dag,
  quality: Quality,
  'choose-ingestion': ChooseIngestion,
  'choose-engine': ChooseEngine,
  'choose-latency': ChooseLatency,
  'choose-stack': ChooseStack,
  'batch-stream': BatchStream,
  'queue-log': QueueLog,
  'wb-method': WbMethod,
  'wb-shop': WbShop,
  'wb-flight': WbFlight,
  'wb-fraud': WbFraud,
  'wb-clicks': WbClicks,
  'wb-iot': WbIot,
  'wb-bank': WbBank,
  requirements: Requirements,
  sdlc: Sdlc,
  'sql-order': SqlOrder,
  zonemap: ZoneMap,
  'model-levels': ModelLevels,
  'fact-types': FactTypes,
  'dbt-layers': DbtLayers,
  joins: Joins,
  skew: Skew,
  ci: CiPipeline,
}
