import * as React from 'react'
import {useState, useEffect} from 'react';
import { useStopwatch  } from "react-use-precision-timer";
import countries from '../../assets/countries/countries.json'
import {generateCorrectAnswerIds, generateIncorrectAnswerIdsForId} from '../../utils/quizHelpers'
import FlagQuizItem from './FlagQuizItem';
import {FlagQuestions, Answer} from '../../types/types'
import {addHighscore} from '../../services/highscores'
import Timer from '../../components/Timer';
import QuizResult from './QuizResult'

function FlagPage() {
    const numberOfCountriesInQuiz = 10;
    const numberOfIncorrectChoices = 6
    const stopwatch = useStopwatch();
    const [quiz, setQuiz] = useState([])
    const [quizIndex, setQuizIndex] = useState(0)
    const [isQuizActive, setIsQuizActive] = useState(false)
    const [quizResult, setQuizResult] = useState([])
    const [canSave, setCanSave] = useState(false)

    useEffect(() => {

    }, [quizResult])
    

    const getCountryName = (countryId: string) => {
        const country = countries.find(country => country.id === countryId)
        return country.name
    }

    const handleStartNewQuiz = () => {
        stopwatch.start()
        setQuizIndex(0)
        setQuizResult([])
        const quiz: FlagQuestions[] = []

        while(quiz.length < numberOfCountriesInQuiz){
            const correctAnswerId = generateCorrectAnswerIds(countries, quiz)
            const incorrectAnswerIds = generateIncorrectAnswerIdsForId(correctAnswerId, countries, numberOfIncorrectChoices)
            quiz.push({
                correctAnswerId,
                incorrectAnswerIds
            })
        }
        setQuiz(quiz)
        setIsQuizActive(true)
    }

    const isSelectionCorrect = (guessedId: any) => {
        return quiz[quizIndex].correctAnswerId === guessedId
    }

    const isQuizFinished = () => {
        return quizIndex === quiz.length -1
    }

    const calculateQuizTime = (results: Answer [] ) => {
        return results[results.length-1].duration
    }

    const handleEndOfQuiz = () => {
        stopwatch.pause()
        setIsQuizActive(false)
        const hasIncorrect = quizResult.some(result => result.status === 'incorrect')
        setCanSave(!hasIncorrect)
    }

    const saveHighScore = () => {
        const profileString = window.localStorage.getItem('profile')
        const profile = JSON.parse(profileString)
        const time = calculateQuizTime(quizResult)
        addHighscore(profile.name, time)
    }

    const handleCountryClick = async (event: any) => {
        const guessedId = event.target.getAttribute('data-country-id')
        const status = isSelectionCorrect(guessedId) ? 'correct' : 'incorrect';
        const body: Answer = {
            name: getCountryName(guessedId),
            status,
            duration: stopwatch.getElapsedRunningTime(),
        }
        setQuizResult((preResult: Answer []) => ([...preResult, body]))


        if(isQuizFinished()){
            handleEndOfQuiz()
        } else {
            // advance the quiz to the next index
            setQuizIndex(quizIndex => quizIndex + 1)
        }
    }

    return  (
        <div>
            <div>FLAG QUIZ</div>
            <div>
                {!countries.length && <div>Please wait. Creating Quiz...</div>}
                {countries.length > 0 && !isQuizActive && <button onClick={handleStartNewQuiz}>Start Quiz</button>}
            </div>
            {quiz.length > 0 ? <Timer stopwatch={stopwatch}/> : null}
            {isQuizActive ? <>
                <FlagQuizItem quizItem={quiz[quizIndex]} countries={countries} handleCountryClick={handleCountryClick}/>
                </>: null}
            <QuizResult quizResult={quizResult}/>
            {canSave ? <button onClick={saveHighScore}>Save Highscore</button>: null}
        </div>
    )
}

export default FlagPage