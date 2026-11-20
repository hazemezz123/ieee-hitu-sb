import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
  vectorizeRaw,
} from '@neplex/vectorizer'
import { optimize as svgoOptimize } from 'svgo'

const ORIGINALS_DIR = 'public/logos/originals'
const BRAND_OUT_DIR = 'public/logos/brand'
const PARTNERS_OUT_DIR = 'public/logos/partners'
const SLOGAN_OUT_DIR = 'public/logos/slogan'

const DEFAULT_TRACER_CONFIG = {
  colorMode: ColorMode.Color,
  hierarchical: Hierarchical.Cutout,
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  mode: PathSimplifyMode.Spline,
  cornerThreshold: 55,
  lengthThreshold: 3.5,
  maxIterations: 10,
  spliceThreshold: 45,
  pathPrecision: 2,
}

const LOGO_JOBS = [
  // Partner logos (from backed-up originals)
  {
    id: 'risk-solutions',
    input: `${ORIGINALS_DIR}/risk-solutions.webp`,
    output: `${PARTNERS_OUT_DIR}/risk-solutions.svg`,
    config: { colorPrecision: 4, layerDifference: 32, filterSpeckle: 6 },
  },
  {
    id: 'consulting-group',
    input: `${ORIGINALS_DIR}/consulting-group.webp`,
    output: `${PARTNERS_OUT_DIR}/consulting-group.svg`,
    config: { colorPrecision: 6, layerDifference: 24, filterSpeckle: 6, cornerThreshold: 45 },
  },
  {
    id: 'make-x',
    input: `${ORIGINALS_DIR}/make-x.webp`,
    output: `${PARTNERS_OUT_DIR}/make-x.svg`,
    alphaCutoff: 190,
    config: { colorPrecision: 6, layerDifference: 28, filterSpeckle: 6, cornerThreshold: 45 },
  },
  {
    id: 'ieee-hsb',
    input: `${ORIGINALS_DIR}/ieee-hsb.png`,
    output: `${PARTNERS_OUT_DIR}/ieee-hsb.svg`,
    minWidth: 1000,
    manualReview: 'Low-res (280px) glossy gradient + tiny ® micro-detail posterizes on vector trace; retain original raster.',
    config: { colorPrecision: 6, layerDifference: 18, filterSpeckle: 4, cornerThreshold: 50 },
  },
  {
    id: 'bridgex-2026',
    input: `${ORIGINALS_DIR}/bridgex-2026.png`,
    output: `${PARTNERS_OUT_DIR}/bridgex-2026.svg`,
    manualReview: 'Smooth continuous gradient across X steps into visible bands when traced; retain original raster.',
    config: { colorPrecision: 7, layerDifference: 10, filterSpeckle: 4, cornerThreshold: 45 },
  },
  {
    id: 'techne',
    input: `${ORIGINALS_DIR}/techne.png`,
    output: `${PARTNERS_OUT_DIR}/techne.svg`,
    alphaCutoff: 128,
    config: { colorPrecision: 4, layerDifference: 32, filterSpeckle: 6, mode: PathSimplifyMode.Polygon, cornerThreshold: 30 },
  },
  {
    id: 'konnect',
    input: `${ORIGINALS_DIR}/konnect.webp`,
    output: `${PARTNERS_OUT_DIR}/konnect.svg`,
    minWidth: 1800,
    alphaCutoff: 210,
    config: { colorPrecision: 6, layerDifference: 28, filterSpeckle: 3, cornerThreshold: 40, lengthThreshold: 2.5 },
  },
  {
    id: 'carerha',
    input: `${ORIGINALS_DIR}/carerha.png`,
    output: `${PARTNERS_OUT_DIR}/carerha.svg`,
    alphaCutoff: 128,
    config: { colorPrecision: 4, layerDifference: 48, filterSpeckle: 6, cornerThreshold: 45, lengthThreshold: 3.0 },
  },
  // Local partner variants in public/Partners/
  {
    id: 'gdg-cairo-light',
    input: 'public/Partners/logo-gdg-black-size2.png',
    output: `${PARTNERS_OUT_DIR}/gdg-cairo-light.svg`,
    config: { colorPrecision: 6, layerDifference: 20, filterSpeckle: 4, cornerThreshold: 45 },
  },
  {
    id: 'gdg-cairo-dark',
    input: 'public/Partners/logo-gdg-white-size2.png',
    output: `${PARTNERS_OUT_DIR}/gdg-cairo-dark.svg`,
    config: { colorPrecision: 6, layerDifference: 20, filterSpeckle: 4, cornerThreshold: 45 },
  },
  {
    id: 'ieee-hsb-glossy',
    input: 'public/Partners/Glossy Blue IEEE HSB Logo.png',
    output: `${PARTNERS_OUT_DIR}/ieee-hsb-glossy.svg`,
    manualReview: 'Opaque black box + glossy 3D sheen + fine serif text posterize under auto-trace; retain original raster.',
    config: { colorPrecision: 7, layerDifference: 12, filterSpeckle: 4 },
  },
  // Local slogan assets
  {
    id: 'slogan-black',
    input: 'public/slogan/ieeehitu_kit-black.png',
    output: `${SLOGAN_OUT_DIR}/ieeehitu-slogan-black.svg`,
    config: { colorPrecision: 4, layerDifference: 32, filterSpeckle: 3, cornerThreshold: 55 },
  },
  {
    id: 'slogan-blue',
    input: 'public/slogan/ieeehitu_kit_blue.png',
    output: `${SLOGAN_OUT_DIR}/ieeehitu-slogan-blue.svg`,
    config: { colorPrecision: 5, layerDifference: 24, filterSpeckle: 3, cornerThreshold: 55 },
  },
  {
    id: 'slogan-white',
    input: 'public/slogan/ieeehitu_kit_white.png',
    output: `${SLOGAN_OUT_DIR}/ieeehitu-slogan-white.svg`,
    config: { colorPrecision: 4, layerDifference: 32, filterSpeckle: 3, cornerThreshold: 55 },
  },
]

function normalizeAndOptimizeSvg(rawSvg, width, height) {
  let normalized = rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')

  // Guarantee exact viewBox matching preprocessed pixel bounds
  if (/viewBox="[^"]*"/i.test(normalized)) {
    normalized = normalized.replace(/viewBox="[^"]*"/i, `viewBox="0 0 ${width} ${height}"`)
  } else {
    normalized = normalized.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`)
  }

  const result = svgoOptimize(normalized, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
          },
        },
      },
      'removeDimensions',
      'removeXMLNS',
    ],
  })

  // Restore xmlns on standalone SVG files so <img> tags render them reliably across all browsers
  const svgOut = result.data.includes('xmlns=')
    ? result.data
    : result.data.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')

  if (/<image[\s>]|data:image\//i.test(svgOut)) {
    throw new Error('Normalized SVG unexpectedly contains embedded raster/base64 image data')
  }
  return svgOut
}

export async function vectorizeRasterLogo(inputPath, outputPath, options = {}) {
  const rawBuffer = await fs.readFile(inputPath)
  const originalBytes = rawBuffer.length
  const meta = await sharp(rawBuffer).metadata()

  let pipeline = sharp(rawBuffer).ensureAlpha()
  if (meta.hasAlpha) {
    pipeline = pipeline.trim({ threshold: options.trimThreshold ?? 10 })
  }

  let { data: trimmedBuf, info: trimmedInfo } = await pipeline
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true })

  if (options.minWidth && trimmedInfo.width < options.minWidth) {
    const scale = options.minWidth / trimmedInfo.width
    const resized = await sharp(trimmedBuf)
      .resize(Math.round(trimmedInfo.width * scale), Math.round(trimmedInfo.height * scale), {
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer({ resolveWithObject: true })
    trimmedBuf = resized.data
    trimmedInfo = resized.info
  }

  const raw = await sharp(trimmedBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Normalize lossy WebP/PNG alpha noise (e.g. a=253..254 inside solids or faint dark fringe halos)
  if (typeof options.alphaCutoff === 'number') {
    const cutoff = options.alphaCutoff
    for (let i = 3; i < raw.data.length; i += 4) {
      raw.data[i] = raw.data[i] >= cutoff ? 255 : 0
    }
  }

  const tracerConfig = { ...DEFAULT_TRACER_CONFIG, ...(options.config || {}) }
  const tracedSvg = await vectorizeRaw(
    raw.data,
    { width: raw.info.width, height: raw.info.height },
    tracerConfig,
  )

  const optimizedSvg = normalizeAndOptimizeSvg(tracedSvg, raw.info.width, raw.info.height)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, optimizedSvg, 'utf8')

  return {
    inputPath,
    outputPath,
    originalBytes,
    optimizedBytes: Buffer.byteLength(optimizedSvg, 'utf8'),
    originalDimensions: `${meta.width}x${meta.height}`,
    normalizedViewBox: `0 0 ${raw.info.width} ${raw.info.height}`,
  }
}

async function optimizeBrandVectorAssets() {
  const brandSrc = await fs.readFile(`${ORIGINALS_DIR}/logov2.svg`, 'utf8')
  const origFaviconStats = await fs.stat(`${ORIGINALS_DIR}/favicon.svg`).catch(() => null)
  // Tight viewBox around the IEEE HITU full mark paths in logov2.svg (116..972, 0..1072)
  const colorRaw = brandSrc
    .replace(/viewBox="[^"]*"/i, 'viewBox="112 0 864 1076"')
    .replace(/\s+(width|height)="[^"]*"/gi, '')
  const colorOptimized = svgoOptimize(colorRaw, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeDimensions',
    ],
  }).data

  const whiteRaw = colorOptimized
    .replace(/#0e487f/gi, '#ffffff')
    .replace(/#dcb656/gi, '#ffffff')

  const faviconRaw = brandSrc
    .replace(/\s+(width|height)="[^"]*"/gi, '')
  const faviconOptimized = svgoOptimize(faviconRaw, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeDimensions',
    ],
  }).data

  await fs.mkdir(BRAND_OUT_DIR, { recursive: true })
  await fs.writeFile(`${BRAND_OUT_DIR}/ieee-hitu-color.svg`, colorOptimized, 'utf8')
  await fs.writeFile(`${BRAND_OUT_DIR}/ieee-hitu-white.svg`, whiteRaw, 'utf8')
  await fs.writeFile('public/logov2.svg', colorOptimized, 'utf8')
  await fs.writeFile('public/favicon.svg', faviconOptimized, 'utf8')

  return [
    {
      id: 'brand-color-svg',
      inputPath: `${ORIGINALS_DIR}/logov2.svg`,
      outputPath: `${BRAND_OUT_DIR}/ieee-hitu-color.svg`,
      originalBytes: Buffer.byteLength(brandSrc, 'utf8'),
      optimizedBytes: Buffer.byteLength(colorOptimized, 'utf8'),
    },
    {
      id: 'brand-white-svg',
      inputPath: `${ORIGINALS_DIR}/logov2.svg (white variant)`,
      outputPath: `${BRAND_OUT_DIR}/ieee-hitu-white.svg`,
      originalBytes: Buffer.byteLength(brandSrc, 'utf8'),
      optimizedBytes: Buffer.byteLength(whiteRaw, 'utf8'),
    },
    {
      id: 'favicon-svg',
      inputPath: `${ORIGINALS_DIR}/favicon.svg (base64 PNG)`,
      outputPath: 'public/favicon.svg',
      originalBytes: origFaviconStats ? origFaviconStats.size : 271343,
      optimizedBytes: Buffer.byteLength(faviconOptimized, 'utf8'),
    },
  ]
}

function parseHexColor(hex) {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    return [0, 1, 2].map(i => parseInt(clean[i] + clean[i], 16))
  }
  if (clean.length === 6) {
    return [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16))
  }
  return null
}

async function generatePartnerThemeVariants() {
  const reports = []

  // techne: pure white vector -> slate dark-ink light-mode variant
  const techneSrc = await fs.readFile(`${PARTNERS_OUT_DIR}/techne.svg`, 'utf8')
  const techneLight = techneSrc.replace(/fill="#fff(?:fff)?"/gi, 'fill="#0f172a"')
  await fs.writeFile(`${PARTNERS_OUT_DIR}/techne-light.svg`, techneLight, 'utf8')
  reports.push({ id: 'techne-light', outputPath: `${PARTNERS_OUT_DIR}/techne-light.svg`, bytes: Buffer.byteLength(techneLight, 'utf8') })

  // make-x: only the white "Make" paths (#fdfdfd, x < 1340) become dark ink; red X & white X inside badge remain unchanged
  const makeXSrc = await fs.readFile(`${PARTNERS_OUT_DIR}/make-x.svg`, 'utf8')
  const makeXLight = makeXSrc.replace(/fill="#fdfdfd"/gi, 'fill="#0f172a"')
  await fs.writeFile(`${PARTNERS_OUT_DIR}/make-x-light.svg`, makeXLight, 'utf8')
  reports.push({ id: 'make-x-light', outputPath: `${PARTNERS_OUT_DIR}/make-x-light.svg`, bytes: Buffer.byteLength(makeXLight, 'utf8') })

  // konnect: neutral white/silver wordmark & subtext become dark slate inks while coral/red mosaic squares remain untouched
  const konnectSrc = await fs.readFile(`${PARTNERS_OUT_DIR}/konnect.svg`, 'utf8')
  const konnectLight = konnectSrc.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (full, hex) => {
    const rgb = parseHexColor(hex)
    if (!rgb) return full
    const [r, g, b] = rgb
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    if (spread <= 15 && r >= 230) return 'fill="#0f172a"'
    if (spread <= 15 && r >= 165) return 'fill="#475569"'
    return full
  })
  await fs.writeFile(`${PARTNERS_OUT_DIR}/konnect-light.svg`, konnectLight, 'utf8')
  reports.push({ id: 'konnect-light', outputPath: `${PARTNERS_OUT_DIR}/konnect-light.svg`, bytes: Buffer.byteLength(konnectLight, 'utf8') })

  // risk-solutions: default black SVG -> white variant for dark backgrounds
  const riskSrc = await fs.readFile(`${PARTNERS_OUT_DIR}/risk-solutions.svg`, 'utf8')
  const riskDark = riskSrc.includes('fill=')
    ? riskSrc.replace(/fill="#000(?:000)?"/gi, 'fill="#f8fafc"')
    : riskSrc.replace('<svg ', '<svg fill="#f8fafc" ')
  await fs.writeFile(`${PARTNERS_OUT_DIR}/risk-solutions-dark.svg`, riskDark, 'utf8')
  reports.push({ id: 'risk-solutions-dark', outputPath: `${PARTNERS_OUT_DIR}/risk-solutions-dark.svg`, bytes: Buffer.byteLength(riskDark, 'utf8') })

  // consulting-group: neutral near-black typography -> crisp white while keeping crimson A mark unchanged
  const cgSrc = await fs.readFile(`${PARTNERS_OUT_DIR}/consulting-group.svg`, 'utf8')
  const cgDark = cgSrc.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (full, hex) => {
    const rgb = parseHexColor(hex)
    if (!rgb) return full
    const [r, g, b] = rgb
    if (Math.max(r, g, b) <= 32) return 'fill="#f8fafc"'
    return full
  })
  await fs.writeFile(`${PARTNERS_OUT_DIR}/consulting-group-dark.svg`, cgDark, 'utf8')
  reports.push({ id: 'consulting-group-dark', outputPath: `${PARTNERS_OUT_DIR}/consulting-group-dark.svg`, bytes: Buffer.byteLength(cgDark, 'utf8') })

  return reports
}

async function runCli() {
  const args = process.argv.slice(2)
  const inputIdx = args.indexOf('--input')
  const outIdx = args.indexOf('--out')

  if (inputIdx !== -1) {
    const inputArg = args[inputIdx + 1]
    const outDir = outIdx !== -1 ? args[outIdx + 1] : PARTNERS_OUT_DIR
    const stat = await fs.stat(inputArg)
    const files = stat.isDirectory()
      ? (await fs.readdir(inputArg))
          .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
          .map(f => path.join(inputArg, f))
      : [inputArg]

    for (const file of files) {
      const base = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const outPath = path.join(outDir, `${base}.svg`)
      const report = await vectorizeRasterLogo(file, outPath)
      console.log(JSON.stringify(report))
    }
    return
  }

  console.log('Optimizing existing brand SVG vectors...')
  const brandReports = await optimizeBrandVectorAssets()
  for (const r of brandReports) {
    console.log(`  [SVG] ${r.id}: ${r.originalBytes} B -> ${r.optimizedBytes} B (${r.outputPath})`)
  }

  console.log('\nVectorizing discovered raster logos...')
  const includeFlagged = args.includes('--include-flagged')
  for (const job of LOGO_JOBS) {
    if (job.manualReview && !includeFlagged) {
      console.log(`  [SKIP:MANUAL_REVIEW] ${job.id}: ${job.manualReview}`)
      continue
    }
    try {
      await fs.access(job.input)
    } catch {
      console.warn(`  [SKIP] missing ${job.input}`)
      continue
    }
    const r = await vectorizeRasterLogo(job.input, job.output, job)
    const pct = (((r.originalBytes - r.optimizedBytes) / r.originalBytes) * 100).toFixed(1)
    console.log(
      `  [VEC] ${job.id}: ${r.originalDimensions} -> ${r.normalizedViewBox} | ${r.originalBytes} B -> ${r.optimizedBytes} B (${pct}% saved)`,
    )
  }

  console.log('\nGenerating light/dark SVG variants...')
  for (const v of await generatePartnerThemeVariants()) {
    console.log(`  [VAR] ${v.id}: ${v.bytes} B (${v.outputPath})`)
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
if (isDirectRun) {
  runCli().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
