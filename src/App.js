import logo from "./logo.svg";
import "./App.css";
import { Button, Input, TextField } from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { ALLOWED_WORDS } from "./wordle-allowed-words";
import { ALL_WORDLES } from "./wordles-all";

const DICTIONARY_WORDS = [...ALLOWED_WORDS, ...ALL_WORDLES];

const GUESS_LENGTH = 5;
const MAXIMUM_GUESSES = 6;

function isDictionaryWord(guess) {
  console.log(
    `isDictionaryWord(${guess}): ${DICTIONARY_WORDS.includes(guess)}`
  );
  return DICTIONARY_WORDS.includes(guess);
}

function App({ correctAnswer = "FLAIR" }) {
  const [submittedGuesses, setSubmittedGuesses] = useState([]);

  function ColoredText({ text, color = "black" }) {
    return <label style={{ fontSize: 64, color: color }}>{text}</label>;
  }

  function PreviousGuess({ value }) {
    if (!value) {
      return <></>;
    }
    let text = [];
    for (let index = 0; index < value.length; ++index) {
      const actualLetter = value.charAt(index);
      const expectedLetter = correctAnswer.charAt(index);
      const color =
        actualLetter === expectedLetter
          ? "green"
          : correctAnswer.includes(actualLetter)
          ? "yellow"
          : "black";
      text.push(<ColoredText text={actualLetter} color={color} />);
    }
    return <h2>{text}</h2>;
  }

  function GuessForm() {
    const {
      control,
      handleSubmit,
      reset,
      formState: { isValid },
    } = useForm({ mode: "onChange", reValidateMode: "onChange" });
    function submitGuess(submission) {
      console.log(submission);
      const guess = submission.guess.toUpperCase();
      console.log(`submitted guess ${guess}`);
      setSubmittedGuesses([...submittedGuesses, guess]);
      reset();
    }
    return (
      <form onSubmit={handleSubmit(submitGuess)}>
        <Controller
          name="guess"
          control={control}
          rules={{
            required: true,
            pattern: /^[a-z]{5}$/i,
            validate: isDictionaryWord,
          }}
          defaultValue=""
          render={({ field }) => (
            <TextField {...field} inputProps={{ maxLength: GUESS_LENGTH }} />
          )}
        />
        <Button onClick={handleSubmit(submitGuess)} disabled={!isValid}>
          Submit
        </Button>
      </form>
    );
  }

  const previousGuesses = submittedGuesses.map((word) => (
    <PreviousGuess key={word} value={word} />
  ));
  const win = submittedGuesses.includes(correctAnswer);
  const hasMoreGuessesAvailable =
    !win && submittedGuesses.length < MAXIMUM_GUESSES;
  return (
    <div>
      <h1>Wordle</h1>
      {previousGuesses}
      {hasMoreGuessesAvailable ? <GuessForm /> : win ? "You won!" : "You lost!"}
    </div>
  );
}

export default App;
