// Reproduce una etapa del camino según su tipo.
import type { Course, Stage } from '@chessblizzard/shared';
import { ExamStage } from './ExamStage';
import { IdeasStage } from './IdeasStage';
import { LinesStage } from './LinesStage';
import { PuzzlesStage } from './PuzzlesStage';
import { SparringStage } from './SparringStage';

export function StagePlayer({ course, stage, onExit }: { course: Course; stage: Stage; onExit: () => void }) {
  const key = `${course.id}/${stage.id}`;
  switch (stage.type) {
    case 'ideas':
      return <IdeasStage key={key} course={course} stage={stage} onExit={onExit} />;
    case 'line':
    case 'branch':
    case 'trap':
    case 'practice':
      return <LinesStage key={key} course={course} stage={stage} onExit={onExit} />;
    case 'puzzles':
      return <PuzzlesStage key={key} course={course} stage={stage} onExit={onExit} />;
    case 'sparring':
      return <SparringStage key={key} course={course} stage={stage} onExit={onExit} />;
    case 'exam':
      return <ExamStage key={key} course={course} stage={stage} onExit={onExit} />;
  }
}
