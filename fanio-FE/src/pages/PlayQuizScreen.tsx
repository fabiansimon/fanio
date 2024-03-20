import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useEffect, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {Quiz} from '../types';
import {fetchQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import Button from '../components/Button';
import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';

function PlayQuizScreen({}): JSX.Element {
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchQuizById(id);
        setQuizData({
          ...res,
          questions: shuffle(res.questions),
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <PageContainer title={quizData?.title} description={quizData?.description}>
      <div className="w-full h-full flex flex-col justify-between">
        <div />
        <div className="px-[10%]">
          <input
            onInput={handleInput}
            value={input}
            ref={inputRef}
            type="text"
            className="relative bg-transparent flex w-full text-[36px] text-white font-medium text-center
        focus:outline-none focus:border-b focus:border-white border-b-2 border-b-white/10 placeholder-neutral-600"
            placeholder="Answer here"
          />
          <Button
            className="mt-4 w-full"
            text="Submit"
            hotkey="Enter"
            ignoreMetaKey
            onClick={() => console.log(input)}
          />
        </div>
        <InfoContainer className="mt-14" />
      </div>
    </PageContainer>
  );
}

function InfoContainer({className}: {className?: string}): JSX.Element {
  return (
    <div className={UI.cn('flex w-full justify-between', className)}>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white">
          4 out of 5
        </Heading>
        <Text size={'2'} className="text-white">
          Current Question
        </Text>
      </div>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white text-center">
          14:148 sec.
        </Heading>
        <Text size={'2'} className="text-white text-center">
          Total Time
        </Text>
      </div>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white text-right">
          1.237 pts
        </Heading>
        <Text size={'2'} className="text-white text-right">
          Points
        </Text>
      </div>
    </div>
  );
}

export default PlayQuizScreen;
