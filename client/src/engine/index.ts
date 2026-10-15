// Stockfish en un Web Worker, hook de análisis y barra de evaluación.
export { getEngine, StockfishEngine, MIN_ELO, parseInfo } from './stockfish';
export type { AnalyzeOptions, EngineLine, EngineResult, EngineTask, PlayOptions } from './stockfish';
export { useAnalysis, analysisScore } from './useAnalysis';
export type { AnalysisLine, AnalysisOptions, AnalysisState } from './useAnalysis';
export { EvalBar } from './EvalBar';
export type { EvalBarProps } from './EvalBar';
export * from './score';
