import {LocalScore} from '.';

export function isLocalScore(score: any): score is LocalScore {
  return 'isUploaded' in score && !('id' in score) && !('userName' in score);
}
