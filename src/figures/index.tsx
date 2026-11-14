import type { ComponentType } from 'react'
import { Cdc, Lakehouse, LambdaKappa, Lifecycle, Medallion, Shuffle, Star } from './static'
import { Partitions, RowCol } from './storage'
import { Scd } from './modeling'
import { EtlElt, Idempotency } from './pipelines'
import { Consumers, Delivery, Windows } from './streaming'
import { Dag, Quality } from './ops'

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
}
