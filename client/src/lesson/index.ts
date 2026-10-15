// Reproductores de etapas y pantallas de ajedrez. Estas firmas las usa la app desde sus rutas:
//   <StagePlayer course stage onExit />, <ReviewSession onExit />,
//   <PuzzleSolver puzzle course onDone />, <AnalysisBoard />
export { StagePlayer } from './StagePlayer';
export { ReviewSession } from './ReviewSession';
export { PuzzleSolver } from './PuzzleSolver';
export type { PuzzleSolverProps } from './PuzzleSolver';
export { AnalysisBoard } from './AnalysisBoard';
export { SPARRING_LEVELS } from './SparringStage';
