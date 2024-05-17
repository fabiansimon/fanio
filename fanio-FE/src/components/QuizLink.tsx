import {useEffect, useState} from 'react';
import {Quiz, UserData} from '../types';
import {useNavigate} from 'react-router-dom';
import {LocalStorage} from '../utils/localStorage';
import {fetchQuizById} from '../utils/api';
import Loading from './Loading';
import {Heading, Text} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {PlayIcon} from '@radix-ui/react-icons';
import Avatar from './Avatar';

function QuizLink({
  quizId,
  user,
}: {
  quizId: string;
  user?: UserData;
}): JSX.Element {
  const [quizData, setQuizData] = useState<Quiz | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigate();

  useEffect(() => {
    (async () => {
      const storedQuiz = LocalStorage.fetchStoredQuizById(quizId);
      if (storedQuiz) {
        setQuizData(storedQuiz);
        return;
      }

      setIsLoading(true);
      try {
        const quiz = await fetchQuizById({id: quizId});
        setQuizData(quiz);
        LocalStorage.saveQuizData(quiz);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [quizId]);

  return (
    <div className="border bg-neutral-900 border-neutral-500/20 shadow-black rounded-lg py-2 px-3 -m-4">
      {isLoading ? (
        <Loading className="size-6 text-white" />
      ) : (
        <div className="flex space-x-4 items-center">
          {user && (
            <Avatar
              user={user}
              onClick={() => console.log(user.email)}
              className="size-7"
            />
          )}
          <div>
            <Heading size={'2'} className="text-white">
              {quizData?.title}
            </Heading>
            {quizData?.description && (
              <Text size={'1'} className="text-white/60">
                {quizData.description}
              </Text>
            )}
          </div>
          <div
            onClick={() =>
              !quizData?.isPrivate && navigation(`${ROUTES.playQuiz}/${quizId}`)
            }
            className="flex cursor-pointer size-10 bg-neutral-300/10 items-center justify-center rounded-full">
            {quizData?.isPrivate ? (
              <Text className="text-white/80 text-[9px]">Private</Text>
            ) : (
              <PlayIcon className="text-white/50" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizLink;
