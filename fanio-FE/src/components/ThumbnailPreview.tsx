import {UI} from '../utils/common';

function ThumbnailPreview({
  url,
  imageUri,
  className,
}: {
  url: string;
  imageUri: string;
  className?: string;
}): JSX.Element {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={imageUri}
        alt="video thumbnail"
        className={UI.cn('w-32 rounded-md cursor-pointer', className)}
      />
    </a>
  );
}

export default ThumbnailPreview;
